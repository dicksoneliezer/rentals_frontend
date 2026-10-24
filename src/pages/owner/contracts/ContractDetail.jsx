import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Alert, Button, Card, Descriptions, Divider, Input, Modal, Popconfirm, Space,
  Spin, Tag, Timeline, Typography, message,
} from 'antd'
import {
  ArrowLeftOutlined, CopyOutlined, EditOutlined, SendOutlined, StopOutlined,
  CheckCircleTwoTone,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import * as contractsApi from '../../../api/contracts'
import ContractDocument from '../../../components/common/ContractDocument'

const STATUS_COLORS = {
  draft: 'default',
  pending_signature: 'processing',
  viewed: 'warning',
  signed: 'success',
  declined: 'error',
  void: 'default',
}

export default function ContractDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [voidOpen, setVoidOpen] = useState(false)
  const [voidReason, setVoidReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await contractsApi.getById(id)
      setContract(data.data)
    } catch {
      message.error('Imeshindwa kupakua mkatataba.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) return <Spin className="block mx-auto mt-20" />
  if (!contract) return <Alert type="error" message="Contract not found." />

  const isDraft = contract.status === 'draft'
  const isAwaiting = ['pending_signature', 'viewed'].includes(contract.status)

  const doSend = async () => {
    setBusy(true)
    try {
      const { data } = await contractsApi.send(id)
      if (data.data?.notified === false) {
        message.warning(data.message)
      } else {
        message.success(data.message)
      }
      await load()
    } catch (e) {
      message.error(e.response?.data?.message || 'Imeshindwa kutuma.')
    } finally {
      setBusy(false)
    }
  }

  const doVoid = async () => {
    setBusy(true)
    try {
      const { data } = await contractsApi.voidContract(id, voidReason)
      message.success(data.message)
      setVoidOpen(false)
      setVoidReason('')
      await load()
    } catch (e) {
      message.error(e.response?.data?.message || 'Imeshindwa kusitisha.')
    } finally {
      setBusy(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(contract.signing_url)
      message.success('Signing link copied.')
    } catch {
      message.warning('Copy failed - select the link manually.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/contracts')}>Back</Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{contract.contract_number}</h1>
            <Space size={6}>
              <Tag color={STATUS_COLORS[contract.status]}>{contract.status}</Tag>
              <span className="text-sm text-gray-500">{contract.tenant}</span>
            </Space>
          </div>
        </Space>

        <Space wrap>
          {isDraft && (
            <>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/owner/contracts/${id}/edit`)}>
                Edit
              </Button>
              <Popconfirm
                title="Issue this contract to the tenant?"
                description="The figures and clauses are frozen, and a single-use signing link is created."
                okText="Issue"
                onConfirm={doSend}
              >
                <Button type="primary" icon={<SendOutlined />} loading={busy}>
                  Send for signature
                </Button>
              </Popconfirm>
            </>
          )}

          {isAwaiting && (
            <Button icon={<CopyOutlined />} onClick={copyLink}>Copy signing link</Button>
          )}

          {!contract.signed_at && contract.status !== 'void' && (
            <Button danger icon={<StopOutlined />} onClick={() => setVoidOpen(true)}>Void</Button>
          )}
        </Space>
      </div>

      {contract.status === 'signed' && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          className="mb-4"
          message={`Signed by ${contract.signer_name} on ${dayjs(contract.signed_at).format('DD MMM YYYY HH:mm')}`}
          description={
            <span className="text-xs">
              Document fingerprint (SHA-256): <code>{contract.fingerprint?.slice(0, 32)}...</code>
              <br />
              This contract can no longer be changed. Any edit requires a new contract and a fresh signature.
            </span>
          }
        />
      )}

      {contract.status === 'declined' && (
        <Alert
          type="error"
          showIcon
          className="mb-4"
          message="The tenant declined this contract."
          description={contract.declined_reason || 'No reason given.'}
        />
      )}

      {contract.status === 'void' && (
        <Alert
          type="warning"
          showIcon
          className="mb-4"
          message="This contract was voided."
          description={contract.voided_reason || 'No reason given.'}
        />
      )}

      {isAwaiting && contract.signing_url && (
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message="Waiting for the tenant to sign"
          description={
            <Space direction="vertical" size={4} className="w-full">
              <span>Share this single-use link. It stops working as soon as it is signed:</span>
              <Input
                readOnly
                value={contract.signing_url}
                addonAfter={<CopyOutlined onClick={copyLink} className="cursor-pointer" />}
              />
              <span className="text-xs">
                Viewed {contract.view_count} time(s)
                {contract.token_expires_at && ` - expires ${dayjs(contract.token_expires_at).format('DD MMM YYYY')}`}
              </span>
            </Space>
          }
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card title="Document">
            <div className="border border-gray-200 rounded-lg p-6">
              <ContractDocument
                snapshot={contract.snapshot}
                branding={contract.branding}
                signature={contract.signature_image}
                signatureName={contract.signer_name}
              />
            </div>
          </Card>
        </div>

        <div>
          <Card title="Details" size="small" className="mb-4">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Rent">{contract.currency} {Number(contract.rent_amount).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Total">{contract.currency} {Number(contract.total_amount).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Per day">{contract.currency} {Number(contract.daily_rate).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Overstay charge / day">{contract.currency} {Number(contract.notice_per_day ?? contract.daily_rate).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Period">{contract.period_months} months</Descriptions.Item>
              <Descriptions.Item label="From">{dayjs(contract.start_date).format('DD MMM YYYY')}</Descriptions.Item>
              <Descriptions.Item label="To">{dayjs(contract.end_date).format('DD MMM YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Description">{contract.description ? 'Added' : 'None'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Audit trail" size="small">
            {contract.events?.length ? (
              <Timeline
                items={contract.events.map((e) => ({
                  children: (
                    <div>
                      <div className="text-sm font-medium capitalize">{e.type.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-gray-500">{e.actor}</div>
                      <div className="text-xs text-gray-400">
                        {dayjs(e.at).format('DD MMM YYYY HH:mm')} - {e.ip}
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Typography.Text type="secondary">No events yet.</Typography.Text>
            )}
          </Card>

          <Divider />
          <Link to="/owner/contracts">All contracts</Link>
        </div>
      </div>

      <Modal
        title="Void this contract"
        open={voidOpen}
        onCancel={() => setVoidOpen(false)}
        onOk={doVoid}
        okText="Void contract"
        okButtonProps={{ danger: true, loading: busy }}
      >
        <p className="text-sm text-gray-600 mb-3">
          The signing link stops working immediately. This cannot be undone.
        </p>
        <Input.TextArea
          rows={3}
          value={voidReason}
          onChange={(e) => setVoidReason(e.target.value)}
          placeholder="Reason (optional)"
        />
      </Modal>
    </div>
  )
}