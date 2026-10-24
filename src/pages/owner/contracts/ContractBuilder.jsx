import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert, Button, Card, Col, DatePicker, Divider, Form, Input, InputNumber,
  Row, Select, Space, Spin, Tabs, Tag, message,
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as contractsApi from '../../../api/contracts'
import * as rentalsApi from '../../../api/rentals'
import ContractDocument from '../../../components/common/ContractDocument'

const { TextArea } = Input

export default function ContractBuilder() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [template, setTemplate] = useState([])
  const [standardClauses, setStandardClauses] = useState({})
  const [overrides, setOverrides] = useState({})
  const [clauseText, setClauseText] = useState({})
  const [preview, setPreview] = useState(null)
  const [previewBranding, setPreviewBranding] = useState(null)
  const [warnings, setWarnings] = useState([])
  const [errors, setErrors] = useState([])
  const [tab, setTab] = useState('details')
  const [contract, setContract] = useState(null)

  // Derived figures are shown live so the owner sees the arithmetic that will
  // be printed. They are recalculated on the server too; this is display only.
  const rent = Form.useWatch('rent_amount', form)
  const months = Form.useWatch('period_months', form)
  const derivedTotal = useMemo(
    () => (Number(rent) || 0) * (Number(months) || 0),
    [rent, months]
  )
  const derivedDaily = useMemo(
    () => (Number(rent) || 0) / 30,
    [rent]
  )

  // Clause editors are seeded from rendered text, never the raw template, so
  // the owner never has to look at a "{currency}" placeholder.
  const seedClauses = useCallback((clauses) => {
    const list = (clauses || []).map((c, n) => ({
      key: c.key,
      number: c.number ?? n + 1,
      text: c.text,
      standard: c.standard_text || c.text,
    }))
    setTemplate(list)
    setStandardClauses(Object.fromEntries(list.map((c) => [c.key, c.standard])))
    setClauseText(Object.fromEntries(list.map((c) => [c.key, c.text])))
  }, [])

  const loadTemplate = useCallback(async (rentalId) => {
    const { data } = await contractsApi.getPrefill(rentalId)
    const p = data.data.prefill

    form.setFieldsValue({
      rental_id: rentalId,
      rent_amount: p.rent_amount,
      period_months: p.period_months,
      start_date: dayjs(p.start_date),
      end_date: dayjs(p.end_date),
      due_day: p.due_day,
      service_fee: p.service_fee,
      payment_commitment_months: p.payment_commitment_months,
      short_commitment_months: p.short_commitment_months,
    })

    // Render the standard clauses with this tenancy's real figures.
    const { data: pv } = await contractsApi.preview({
      rental_id: rentalId,
      rent_amount: p.rent_amount,
      period_months: p.period_months,
      start_date: p.start_date,
      end_date: p.end_date,
      due_day: p.due_day,
      service_fee: p.service_fee,
      payment_commitment_months: p.payment_commitment_months,
      short_commitment_months: p.short_commitment_months,
      description: null,
      clause_overrides: {},
    })
    seedClauses(pv.data.snapshot.clauses)
    setOverrides({})
    return data.data
  }, [form, seedClauses])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (isEdit) {
          const { data } = await contractsApi.getById(id)
          if (cancelled) return
          const c = data.data
          const i = c.input || {}
          setContract(c)
          form.setFieldsValue({
            rental_id: c.rental_id,
            rent_amount: i.rent_amount ?? 0,
            period_months: i.period_months,
            start_date: dayjs(i.start_date ?? c.start_date),
            end_date: dayjs(i.end_date ?? c.end_date),
            due_day: i.due_day,
            service_fee: i.service_fee,
            payment_commitment_months: i.payment_commitment_months,
            short_commitment_months: i.short_commitment_months,
            description: c.description,
          })
          seedClauses(c.snapshot?.clauses)
          setOverrides(c.clause_overrides || {})
        } else {
          const { data } = await rentalsApi.getAll({ per_page: 200 })
          if (!cancelled) setRentals(data.data || [])
        }
      } catch {
        message.error('Imeshindwa kupakua taarifa za mkatataba.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onSelectRental = async (rentalId) => {
    setLoading(true)
    try {
      await loadTemplate(rentalId)
    } catch {
      message.error('Imeshindwa kupakua taarifa za upangishaji.')
    } finally {
      setLoading(false)
    }
  }

  const buildPayload = () => {
    const v = form.getFieldsValue()
    const changed = {}
    Object.entries(overrides).forEach(([key, text]) => {
      if (text && text !== standardClauses[key]) changed[key] = text
    })
    return {
      rental_id: v.rental_id,
      rent_amount: v.rent_amount,
      period_months: v.period_months,
      start_date: v.start_date ? dayjs(v.start_date).format('YYYY-MM-DD') : null,
      end_date: v.end_date ? dayjs(v.end_date).format('YYYY-MM-DD') : null,
      due_day: v.due_day,
      service_fee: v.service_fee,
      payment_commitment_months: v.payment_commitment_months,
      short_commitment_months: v.short_commitment_months,
      description: v.description || null,
      clause_overrides: changed,
    }
  }

  const runPreview = async () => {
    setLoading(true)
    setErrors([])
    try {
      const { data } = await contractsApi.preview(buildPayload())
      setPreview(data.data.snapshot)
      setPreviewBranding(data.data.branding || null)
      setWarnings(data.data.warnings || [])
      setTab('preview')
    } catch (e) {
      const body = e.response?.data
      setErrors(body?.errors || [body?.message || 'Preview failed.'])
      message.error('Imeshindwa kutengeneza muonekano.')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    setErrors([])
    try {
      const payload = buildPayload()
      const { data } = isEdit
        ? await contractsApi.update(id, payload)
        : await contractsApi.create(payload)
      setWarnings(data.warnings || [])
      message.success(data.message || 'Saved.')
      if (!isEdit) navigate(`/owner/contracts/${data.data.id}`)
      else setContract(data.data)
    } catch (e) {
      const body = e.response?.data
      setErrors(body?.errors || [body?.message || 'Save failed.'])
      message.error(body?.message || 'Imeshindwa kuhifadhi.')
    } finally {
      setSaving(false)
    }
  }

  if (loading && isEdit && !contract) {
    return <Spin className="block mx-auto mt-20" />
  }

  const canEdit = !contract || ['draft'].includes(contract.status)

  const tabs = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <>
          {!isEdit && (
            <Form.Item name="rental_id" label="Tenancy (rental)" rules={[{ required: true }]}>
              <Select
                showSearch
                placeholder="Select the tenancy this contract is for"
                optionFilterProp="label"
                onChange={onSelectRental}
                options={rentals.map((r) => ({
                  value: r.id,
                  label: `${r.tenant?.full_name || 'Tenant'} - ${r.room?.name || 'Room'} (${dayjs(r.start_date).format('DD MMM YY')})`,
                }))}
              />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="rent_amount"
                label="Monthly rent"
                rules={[{ required: true, message: 'Enter the monthly rent' }]}
              >
                <InputNumber className="w-full" min={0} step={1000} addonBefore="TZS" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="period_months" label="Period (months)" rules={[{ required: true }]}>
                <InputNumber className="w-full" min={1} max={120} />
              </Form.Item>
            </Col>
          </Row>

<Alert
            type="info"
            showIcon
            className="mb-4"
            message={
              <span>
                Total is calculated: <strong>TZS {derivedTotal.toLocaleString()}</strong>{' '}
                ({Number(rent) || 0} x {Number(months) || 0}) and{' '}
                <strong>TZS {derivedDaily.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong> per day
                (monthly / 30). The overstay charge is the same per-day rate. These figures cannot be
                typed in, so they can never disagree with the monthly rate.
              </span>
            }
          />

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="start_date" label="Start date" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="end_date" label="End date" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="due_day" label="Rent due day">
                <InputNumber className="w-full" min={1} max={31} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="service_fee" label="Service fee (monthly)">
                <InputNumber className="w-full" min={0} step={1000} addonBefore="TZS" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="payment_commitment_months" label="Rent advance (months)">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="short_commitment_months" label="Short-period option (months)">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'terms',
      label: 'Terms & description',
      children: (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Edit any clause if the tenancy needs different wording. The standard text is always kept
            against the contract, so a change stays visible rather than silently replacing the term.
          </p>
          {template.map((clause) => {
            const modified = overrides[clause.key] && overrides[clause.key] !== standardClauses[clause.key]
            return (
              <Card
                key={clause.key}
                size="small"
                className="mb-3"
                title={
                  <span className="text-sm">
                    Clause {clause.number} {modified && <Tag color="orange">edited</Tag>}
                  </span>
                }
              >
                <TextArea
                  autoSize={{ minRows: 2 }}
                  value={clauseText[clause.key] ?? clause.text}
                  onChange={(e) => {
                    const value = e.target.value
                    setClauseText((prev) => ({ ...prev, [clause.key]: value }))
                    setOverrides((prev) => ({ ...prev, [clause.key]: value }))
                  }}
                />
                {modified && (
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Standard:</strong> {standardClauses[clause.key]}
                  </p>
                )}
              </Card>
            )
          })}

          <Divider />

          <Form.Item
            name="description"
            label="Additional terms (owner's description)"
            extra="Printed as its own section before the signatures. Use it to add terms, not to rewrite the numbered clauses above."
          >
            <TextArea rows={5} maxLength={8000} showCount placeholder="e.g. Mpangaji atashiriki vitu vya nyumba..." />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'preview',
      label: 'Preview',
      children: preview ? (
        <>
          {warnings.length > 0 && (
            <Alert
              type="warning"
              showIcon
              className="mb-4"
              message="Check these before sending"
              description={<ul className="list-disc pl-5 mb-0">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>}
            />
          )}
          <div className="border border-gray-200 rounded-lg p-6 max-h-[70vh] overflow-auto">
            <ContractDocument snapshot={preview} branding={previewBranding} />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <Button icon={<EyeOutlined />} onClick={runPreview}>Generate preview</Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/contracts')}>Back</Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {isEdit ? `Edit ${contract?.contract_number || 'contract'}` : 'New contract'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEdit && contract ? <Tag>{contract.status}</Tag> : 'Pick a tenancy, check the figures, then issue.'}
            </p>
          </div>
        </Space>
        <Space>
          <Button icon={<EyeOutlined />} onClick={runPreview} loading={loading}>Preview</Button>
          {canEdit && (
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save}>
              {isEdit ? 'Save draft' : 'Create draft'}
            </Button>
          )}
        </Space>
      </div>

      {errors.length > 0 && (
        <Alert
          type="error"
          showIcon
          closable
          className="mb-4"
          message="Please fix the following"
          description={<ul className="list-disc pl-5 mb-0">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
          onClose={() => setErrors([])}
        />
      )}

      {!canEdit && (
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message="This contract has been issued. It can no longer be edited - that is what makes the signature meaningful."
        />
      )}

      <Form form={form} layout="vertical" disabled={!canEdit}>
        <Card>
          <Tabs activeKey={tab} onChange={setTab} items={tabs} />
        </Card>
      </Form>

      {isEdit && contract?.status === 'draft' && (
        <div className="mt-4 flex justify-end">
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => navigate(`/owner/contracts/${id}`)}
          >
            Open to send for signature
          </Button>
        </div>
      )}
    </div>
  )
}