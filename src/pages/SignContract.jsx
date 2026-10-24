import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Alert, Button, Card, Checkbox, Divider, Input, Modal, Result, Spin, Typography, message,
} from 'antd'
import { SignatureOutlined, CheckCircleTwoTone } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as contractsApi from '../api/contracts'
import ContractDocument from '../components/common/ContractDocument'
import SignaturePad from '../components/common/SignaturePad'

/**
 * Tenant-facing signing page.
 *
 * Reached from a single-use link with no login. Deliberately uses the bare
 * public axios client so an expired link shows an explanation instead of being
 * bounced to the login screen.
 */
export default function SignContract() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState(null)
  const [contract, setContract] = useState(null)
  const [snapshot, setSnapshot] = useState(null)
  const [fingerprint, setFingerprint] = useState(null)
  const [error, setError] = useState(null)

  const [consent, setConsent] = useState(false)
  const [name, setName] = useState('')
  const [consentStatement, setConsentStatement] = useState('')
  const [branding, setBranding] = useState(null)
  const [signature, setSignature] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [declineOpen, setDeclineOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await contractsApi.openSigningLink(token)
      const d = data.data
      setState(d.state)
      setContract(d.contract || null)
      setBranding(d.branding || null)

      if (d.state === 'awaiting_signature') {
        setSnapshot(d.snapshot)
        setFingerprint(d.fingerprint)
        setConsentStatement(d.consent_statement || '')
        setName(d.contract?.tenant_name || '')
      }
    } catch (e) {
      const status = e.response?.status
      setError(e.response?.data?.message || 'Imeshindwa kufungua mkatataba.')
      if (status === 410) setState('expired')
      if (status === 404) setState('missing')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const submit = async () => {
    setSubmitting(true)
    try {
      const { data } = await contractsApi.signContract(token, {
        signer_name: name.trim(),
        signature_image: signature,
        fingerprint,
        consent: true,
      })
      message.success(data.message)
      setState('signed')
      setContract(data.data.contract)
      setBranding(data.data.contract.branding || branding)
      setSnapshot(data.data.contract.snapshot)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      message.error(e.response?.data?.message || 'Imeshindwa kuhifadhi saini.')
    } finally {
      setSubmitting(false)
    }
  }

  const decline = async () => {
    setSubmitting(true)
    try {
      const { data } = await contractsApi.declineContract(token, declineReason)
      message.success(data.message)
      setDeclineOpen(false)
      setState('declined')
    } catch (e) {
      message.error(e.response?.data?.message || 'Imeshindwa kurekodi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spin size="large" />
      </div>
    )
  }

  if (state === 'signed' && contract) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <Result
            status="success"
            icon={<CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 72 }} />}
            title="Mkatataba umesainiwa"
            subTitle={`${contract.contract_number} - imesainiwa na ${contract.signer_name} tarehe ${dayjs(contract.signed_at).format('DD MMM YYYY')}`}
          />
          <Alert type="info" showIcon message={contract.verification_note} />
          {contract.consent_text && (
            <Card size="small" title="Ridhaa iliyorekodiwa">
              <p className="text-sm text-gray-800 italic m-0">"{contract.consent_text}"</p>
              <p className="text-xs text-gray-500 mt-2 mb-0">
                {contract.signer_name} - {dayjs(contract.consented_at).format('DD MMM YYYY, HH:mm')}
              </p>
            </Card>
          )}
          <Card>
            <ContractDocument
              snapshot={contract.snapshot}
              branding={contract.branding}
              signature={contract.signature_image}
              signatureName={contract.signer_name}
            />
          </Card>
        </div>
      </div>
    )
  }

  if (state === 'declined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <Result
          status="warning"
          title="Hukukubali mkatataba"
          subTitle="Marekodiwa kwamba hukukubali mkatataba huu. Wasiliana na mwenyewe kama unahitaji kufanya mazungumzo."
        />
      </div>
    )
  }

  if (state === 'expired' || state === 'missing' || state === 'void') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <Result
          status="error"
          title={state === 'void' ? 'Mkatataba umesitishwa' : 'Kiungo hiki hapatikani'}
          subTitle={error || 'Kiungo hiki cha saini kimekwisha muda wake au kimetumika. Wasiliana na mwenyewe ili upate kiungo kipya.'}
        />
      </div>
    )
  }

  const nameMatches = name.trim().toLowerCase() === (contract?.tenant_name || '').toLowerCase()

  // The server renders the consent sentence with the tenant's name in it. We
  // split around that name so the tenant types it *inside* the sentence they
  // are accepting, rather than into an unrelated field.
  const tenantName = contract?.tenant_name || ''
  const nameAt = consentStatement.indexOf(tenantName)
  const hasStatement = Boolean(consentStatement) && Boolean(tenantName) && nameAt !== -1
  const consentBefore = hasStatement ? consentStatement.slice(0, nameAt) : consentStatement
  const consentAfter = hasStatement ? consentStatement.slice(nameAt + tenantName.length) : ''

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="text-center">
          <Typography.Title level={3} className="!mb-1">
            Mkatataba wa Kukodisha
          </Typography.Title>
          <Typography.Text type="secondary">
            {contract?.contract_number} - {contract?.tenant_name}
          </Typography.Text>
        </div>

        <Card>
          <ContractDocument snapshot={snapshot} branding={branding} />
        </Card>

        <Card title="Saini">
          <p className="text-sm text-gray-600">
            Soma mkatataba hapo juu kwa makini. Kisha jaza kauli ya ridhaa kwa kuandika jina
            lako kamili mahali palipoachwa wazi, na uweke saini yako.
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="text-sm font-semibold text-gray-800 mb-2">Kauli ya Ridhaa</div>
              {hasStatement ? (
                <p className="text-sm text-gray-800 leading-8 m-0">
                  {consentBefore}
                  <Input
                    id="signer-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={tenantName}
                    status={name && !nameMatches ? 'error' : ''}
                    className="mx-1 !inline-block !w-52 align-baseline"
                  />
                  {consentAfter}
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-800 m-0">{consentStatement}</p>
                  <Input
                    id="signer-name"
                    className="mt-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={tenantName}
                    status={name && !nameMatches ? 'error' : ''}
                  />
                </>
              )}
              {name && !nameMatches && (
                <p className="text-xs text-red-600 mt-2 mb-0">
                  Andika jina lako kamili kama lilivyo kwenye mkatataba: "{tenantName}".
                </p>
              )}
            </div>

            <SignaturePad onChange={setSignature} />

            <Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)}>
              <span className="text-sm">
                Nimesoma na nakubali kauli ya ridhaa hapo juu.
              </span>
            </Checkbox>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="primary"
                size="large"
                icon={<SignatureOutlined />}
                loading={submitting}
                disabled={!consent || !signature || !nameMatches}
                onClick={submit}
              >
                Saini mkatataba
              </Button>
              <Button danger type="text" onClick={() => setDeclineOpen(true)} disabled={submitting}>
                Sitisha
              </Button>
            </div>

            {(!signature || !consent || !nameMatches) && (
              <p className="text-xs text-gray-500">
                Andika jina lako, weka saini kwenye kasha, kisha uweke alama ya "Nimesoma na
                nakubali kauli ya ridhaa" ili uweze kusaini.
              </p>
            )}
          </div>
        </Card>

        <Divider className="!my-2" />
        <p className="text-center text-xs text-gray-500">
          Kumbukumbu ya mkatataba: <code className="break-all">{fingerprint}</code>
        </p>
      </div>

      <Modal
        title="Sitisha mkatataba"
        open={declineOpen}
        onCancel={() => setDeclineOpen(false)}
        onOk={decline}
        okText="Sitisha"
        okButtonProps={{ danger: true, loading: submitting }}
      >
        <p className="text-sm text-gray-600 mb-3">
          Kiungo hiki hizidi kutumika. Mwenyewe atapaswa kutuma mkatataba mpya.
        </p>
        <Input.TextArea
          rows={3}
          value={declineReason}
          onChange={(e) => setDeclineReason(e.target.value)}
          placeholder="Sababu (si lazima)"
        />
      </Modal>
    </div>
  )
}