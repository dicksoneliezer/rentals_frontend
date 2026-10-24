import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Divider,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd'
import {
  UploadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  LogoutOutlined,
  IdcardOutlined,
  FileProtectOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import { BRAND } from '../../config/brand'
import {
  getVerificationStatus,
  uploadVerificationDocument,
  deleteVerificationDocument,
  submitVerification,
} from '../../api/ownerVerification'

const { Title, Text, Paragraph } = Typography

const DOCUMENTS = [
  {
    type: 'national_id',
    label: 'National ID',
    hint: 'A clear photo or scan of your NIDA card or national ID (front).',
    icon: <IdcardOutlined />,
  },
  {
    type: 'ownership_proof',
    label: 'Proof of ownership',
    hint: 'A title deed, utility bill in your name, or a signed ownership letter.',
    icon: <FileProtectOutlined />,
  },
]

const STATUS_META = {
  unsubmitted: {
    color: 'default',
    icon: <ClockCircleOutlined />,
    title: 'Verification required',
    description:
      'Upload your identity and ownership documents, then submit them for review. A platform administrator will approve your account.',
  },
  pending: {
    color: 'gold',
    icon: <ClockCircleOutlined />,
    title: 'Under review',
    description:
      'Your documents have been submitted and are waiting for an administrator to review them. You will be notified once a decision is made.',
  },
  rejected: {
    color: 'red',
    icon: <CloseCircleOutlined />,
    title: 'Verification not approved',
    description:
      'An administrator asked for changes. Review the note below, replace the relevant documents and submit again.',
  },
  approved: {
    color: 'green',
    icon: <CheckCircleOutlined />,
    title: 'Verified',
    description: 'Your account is verified. You can list and manage your properties.',
  },
}

export default function VerifyAccount() {
  const { user, logout, refreshUser } = useAuth()
  const [status, setStatus] = useState(user?.verification_status || 'unsubmitted')
  const [documents, setDocuments] = useState([])
  const [note, setNote] = useState(user?.verification_note || null)
  const [loading, setLoading] = useState(false)
  const [busyType, setBusyType] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getVerificationStatus()
      const data = res.data.data || res.data
      setStatus(data.verification_status || 'unsubmitted')
      setDocuments(Array.isArray(data.documents) ? data.documents : [])
      setNote(data.verification_note || null)
    } catch {
      message.error('Failed to load your verification status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const documentFor = (type) => documents.find((d) => d.type === type)

  const handleUpload = async (type, file) => {
    setBusyType(type)
    try {
      await uploadVerificationDocument(type, file)
      message.success('Document uploaded')
      await load()
    } catch (err) {
      const errors = err?.response?.data?.errors
      message.error(
        (errors && Object.values(errors)[0]?.[0]) ||
          err?.response?.data?.message ||
          'Upload failed'
      )
    } finally {
      setBusyType(null)
    }
  }

  const handleRemove = async (document) => {
    setBusyType(document.type)
    try {
      await deleteVerificationDocument(document.id)
      message.success('Document removed')
      await load()
    } catch {
      message.error('Failed to remove document')
    } finally {
      setBusyType(null)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await submitVerification()
      message.success('Submitted for review')
      await load()
      await refreshUser()
    } catch (err) {
      message.error(err?.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRefresh = async () => {
    await refreshUser()
    await load()
  }

  const meta = STATUS_META[status] || STATUS_META.unsubmitted
  const allUploaded = DOCUMENTS.every((doc) => documentFor(doc.type))
  const canSubmit = status !== 'pending' && status !== 'approved' && allUploaded

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc' }}>
      <div
        style={{
          background: '#fff',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <img src={BRAND.mark} alt={BRAND.name} style={{ height: 36, objectFit: 'contain' }} />
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Refresh status
          </Button>
          <Button icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Button>
        </Space>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 60px' }}>
        <Card style={{ borderRadius: 12, marginBottom: 20 }}>
          <Space align="start">
            <Tag color={meta.color} icon={meta.icon} style={{ fontSize: 14, padding: '4px 10px' }}>
              {meta.title}
            </Tag>
          </Space>
          <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
            Verify your owner account
          </Title>
          <Paragraph style={{ color: '#595959', marginBottom: 0 }}>{meta.description}</Paragraph>

          {status === 'rejected' && note && (
            <Alert
              type="error"
              showIcon
              style={{ marginTop: 16 }}
              message="Administrator note"
              description={note}
            />
          )}
        </Card>

        <Card style={{ borderRadius: 12 }} loading={loading}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            {DOCUMENTS.map((doc) => {
              const uploaded = documentFor(doc.type)
              return (
                <div key={doc.type}>
                  <Space align="center" style={{ marginBottom: 4 }}>
                    <span style={{ color: '#0d6e3f', fontSize: 18 }}>{doc.icon}</span>
                    <Text strong>{doc.label}</Text>
                    {uploaded && <Tag color="green">Uploaded</Tag>}
                  </Space>
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {doc.hint}
                    </Text>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    {uploaded ? (
                      <Space wrap>
                        <Text>{uploaded.original_name}</Text>
                        <Upload
                          accept="image/*,.pdf"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            handleUpload(doc.type, file)
                            return false
                          }}
                        >
                          <Button size="small" loading={busyType === doc.type}>
                            Replace
                          </Button>
                        </Upload>
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          loading={busyType === doc.type}
                          onClick={() => handleRemove(uploaded)}
                        >
                          Remove
                        </Button>
                      </Space>
                    ) : (
                      <Upload
                        accept="image/*,.pdf"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          handleUpload(doc.type, file)
                          return false
                        }}
                      >
                        <Button icon={<UploadOutlined />} loading={busyType === doc.type}>
                          Upload {doc.label}
                        </Button>
                      </Upload>
                    )}
                  </div>
                  <Divider style={{ margin: '20px 0 0' }} />
                </div>
              )
            })}

            <div>
              <Button
                type="primary"
                size="large"
                disabled={!canSubmit}
                loading={submitting}
                onClick={handleSubmit}
                block
              >
                Submit for review
              </Button>
              {!allUploaded && status !== 'approved' && (
                <Text
                  type="secondary"
                  style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 13 }}
                >
                  Upload both documents to enable submission.
                </Text>
              )}
              {(status === 'pending' || status === 'approved') && (
                <Text
                  type="secondary"
                  style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 13 }}
                >
                  {status === 'pending'
                    ? 'Already submitted — please wait for a decision.'
                    : 'Your account is already verified.'}
                </Text>
              )}
            </div>
          </Space>
        </Card>

        <Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 12 }}
        >
          Documents are stored privately and only visible to platform administrators.
        </Text>
      </div>
    </div>
  )
}
