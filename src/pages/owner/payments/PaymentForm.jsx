import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, InputNumber, Select, DatePicker, Card, Descriptions, Button, Typography, Divider, message, Alert } from 'antd'
import dayjs from 'dayjs'
import * as paymentsApi from '../../../api/payments'
import * as tenantsApi from '../../../api/tenants'
import * as rentalsApi from '../../../api/rentals'
import PageHeader from '../../../components/common/PageHeader'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'

const { Text } = Typography

export default function PaymentForm() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState([])
  const [unpaidCharges, setUnpaidCharges] = useState([])
  const [chargesLoading, setChargesLoading] = useState(false)
  const [chargeHint, setChargeHint] = useState(null)
  const [selectedCharge, setSelectedCharge] = useState(null)

  useEffect(() => {
    tenantsApi.getAll({ per_page: 100 }).then((res) => {
      const data = res.data.data || res.data
      setTenants(Array.isArray(data) ? data : data.tenants || [])
    })
  }, [])

  const onTenantChange = async (tenantId) => {
    setSelectedCharge(null)
    setUnpaidCharges([])
    setChargeHint(null)
    form.setFieldsValue({ rent_charge_id: undefined })

    if (!tenantId) return

    setChargesLoading(true)
    try {
      const res = await rentalsApi.getRentCharges({ tenant_id: tenantId })
      const data = res.data.data || res.data
      const chargeArr = Array.isArray(data) ? data : data.charges || []
      const open = chargeArr
        .filter((c) => c.status !== 'paid')
        .sort((a, b) => String(a.period_start).localeCompare(String(b.period_start)))
      setUnpaidCharges(open)
      if (open.length === 0) {
        setChargeHint('This tenant has no outstanding rent charges. Generate or add a charge first.')
      }
    } catch {
      setChargeHint('Failed to load rent charges. Please try again.')
      message.error('Failed to load unpaid charges')
    } finally {
      setChargesLoading(false)
    }
  }

  const onChargeChange = (chargeId) => {
    const charge = unpaidCharges.find((c) => c.id === chargeId)
    setSelectedCharge(charge || null)
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const payload = {
        tenant_id: values.tenant_id,
        rent_charge_id: values.rent_charge_id,
        amount: values.amount,
        payment_date: values.payment_date.format('YYYY-MM-DD'),
        payment_method: values.payment_method,
        reference_number: values.reference_number || null,
        notes: values.notes || null,
      }
      await paymentsApi.create(payload)
      message.success('Payment recorded successfully')
      navigate('/owner/payments')
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Record Payment"
        onBack={() => navigate(-1)}
      />
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ payment_date: dayjs(), payment_method: 'cash' }}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="tenant_id"
            label="Tenant"
            rules={[{ required: true, message: 'Select a tenant' }]}
          >
            <Select
              placeholder="Select tenant"
              showSearch
              optionFilterProp="label"
              options={tenants.map((t) => ({
                value: t.id,
                label: `${t.full_name} (${t.phone})`,
              }))}
              onChange={onTenantChange}
            />
          </Form.Item>

          {chargeHint && (
            <Alert
              type="info"
              showIcon
              message={chargeHint}
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            name="rent_charge_id"
            label="Rent Charge"
            rules={[{ required: true, message: 'Select a rent charge' }]}
          >
            <Select
              placeholder={chargesLoading ? 'Loading charges...' : 'Select unpaid charge'}
              loading={chargesLoading}
              disabled={!chargesLoading && unpaidCharges.length === 0}
              showSearch
              optionFilterProp="label"
              options={unpaidCharges.map((c) => ({
                value: c.id,
                label: `${(c.period_start || '').slice(0, 7)} - Expected: TZS ${Number(c.expected_amount).toLocaleString()} | Paid: TZS ${Number(c.paid_amount || 0).toLocaleString()} | Balance: TZS ${Number((c.expected_amount || 0) - (c.paid_amount || 0)).toLocaleString()}`,
              }))}
              onChange={onChargeChange}
            />
          </Form.Item>

          {selectedCharge && (
            <Card size="small" style={{ marginBottom: 16, background: '#f6f8fa' }}>
              <Descriptions size="small" column={3}>
                <Descriptions.Item label="Expected">
                  <CurrencyDisplay amount={selectedCharge.expected_amount} />
                </Descriptions.Item>
                <Descriptions.Item label="Already Paid">
                  <CurrencyDisplay amount={selectedCharge.paid_amount || 0} />
                </Descriptions.Item>
                <Descriptions.Item label="Remaining">
                  <Text strong style={{ color: '#ff4d4f' }}>
                    <CurrencyDisplay amount={(selectedCharge.expected_amount || 0) - (selectedCharge.paid_amount || 0)} />
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          <Form.Item
            name="amount"
            label="Amount (TZS)"
            extra="Amount above the remaining balance will be carried over to the next charge."
            rules={[
              { required: true, message: 'Enter payment amount' },
              { type: 'number', min: 0.01, message: 'Amount must be greater than 0' },
            ]}
          >
            <InputNumber
              min={0.01}
              style={{ width: '100%' }}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val.replace(/,/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="payment_date"
            label="Payment Date"
            rules={[{ required: true, message: 'Select payment date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="payment_method"
            label="Payment Method"
            rules={[{ required: true, message: 'Select payment method' }]}
          >
            <Select
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'mobile_money', label: 'Mobile Money' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </Form.Item>

          <Form.Item name="reference_number" label="Reference Number">
            <Input placeholder="Transaction or receipt reference" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Optional notes" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Record Payment
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
