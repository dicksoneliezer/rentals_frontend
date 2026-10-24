import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Card, Descriptions, Result, Space, Spin, Tag, message } from 'antd'
import { ArrowLeftOutlined, SignatureOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as contractsApi from '../../api/contracts'
import ContractDocument from '../../components/common/ContractDocument'

const STATUS = {
  draft: { color: 'default', label: 'Inaandikwa' },
  pending_signature: { color: 'processing', label: 'Inasubiri saini yako' },
  viewed: { color: 'warning', label: 'Imefungua, inasubiri saini yako' },
  signed: { color: 'success', label: 'Imesainiwa' },
  declined: { color: 'error', label: 'Hukukubali' },
  void: { color: 'default', label: 'Imesitishwa' },
}

export default function MyContractDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await contractsApi.getMyContract(id)
      setContract(data.data)
    } catch {
      message.error('Imeshindwa kupakua mkatataba.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) return <Spin className="block mx-auto mt-20" />
  if (!contract) return <Result status="404" title="Mkatataba haukupatikana" />

  const s = STATUS[contract.status] || { color: 'default', label: contract.status }
  const token = contract.signing_url ? contract.signing_url.split('/').pop() : null

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tenant/contracts')}>
            Nyuma
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{contract.contract_number}</h1>
            <Tag color={s.color}>{s.label.trim()}</Tag>
          </div>
        </Space>

        {token && (
          <Button
            type="primary"
            icon={<SignatureOutlined />}
            onClick={() => navigate(`/contracts/sign/${token}`)}
          >
            Soma na saini
          </Button>
        )}
      </div>

      {contract.status === 'signed' && (
        <Alert
          type="success"
          showIcon
          className="mb-4"
          message={`Umesaini mkatataba huu tarehe ${dayjs(contract.signed_at).format('DD MMM YYYY')}.`}
          description={contract.verification_note}
        />
      )}

      {contract.status === 'declined' && (
        <Alert
          type="error"
          showIcon
          className="mb-4"
          message="Hukukubali mkatataba huu."
          description={contract.declined_reason || 'Hukutoa sababu.'}
        />
      )}

      {contract.status === 'void' && (
        <Alert
          type="warning"
          showIcon
          className="mb-4"
          message="Mkatataba huu umesitishwa na mwenyewe."
          description={contract.voided_reason || 'Hakuna sababu iliyoandikwa.'}
        />
      )}

      {token && (
        <Alert
          type="warning"
          showIcon
          className="mb-4"
          message="Mkatataba huu bado haujasainiwa."
          description={
            contract.token_expires_at
              ? `Unapaswa kusaini kabla ya ${dayjs(contract.token_expires_at).format('DD MMM YYYY')}.`
              : null
          }
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card title="Mkatataba">
            <div className="border border-gray-200 rounded-lg p-6">
              <ContractDocument
                snapshot={contract.snapshot}
                branding={contract.branding}
                signature={contract.signature_image}
              />
            </div>
          </Card>

          {contract.consent_text && (
            <Card title="Ridhaa iliyorekodiwa" size="small" className="mt-4">
              <p className="text-sm text-gray-800 italic m-0">"{contract.consent_text}"</p>
              <p className="text-xs text-gray-500 mt-2 mb-0">
                {contract.signer_name} - {dayjs(contract.consented_at).format('DD MMM YYYY, HH:mm')}
              </p>
            </Card>
          )}
        </div>

        <div>
          <Card title="Maelezo" size="small">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Chumba">
                {[contract.house, contract.room].filter(Boolean).join(' - ')}
              </Descriptions.Item>
              <Descriptions.Item label="Kodi ya kila mwezi">
                {contract.currency} {Number(contract.rent_amount).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Jumla">
                {contract.currency} {Number(contract.total_amount).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Kwa siku">
                {contract.currency} {Number(contract.daily_rate).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Muda">{contract.period_months} miezi</Descriptions.Item>
              <Descriptions.Item label="Kuanzia">
                {dayjs(contract.start_date).format('DD MMM YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Hatia">
                {dayjs(contract.end_date).format('DD MMM YYYY')}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {contract.events?.length > 0 && (
            <Card title="Historia" size="small" className="mt-4">
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                {contract.events.map((e) => (
                  <li key={e.at + e.type}>
                    <span className="capitalize">{e.type.replace(/_/g, ' ')}</span>{' '}
                    <span className="text-xs text-gray-400">
                      - {dayjs(e.at).format('DD MMM YYYY HH:mm')}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}