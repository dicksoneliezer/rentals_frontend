
import { useEffect, useState } from 'react'
import {
  Table,
  Card,
  Button,
  Select,
  Input,
  Space,
  message,
  Modal,
  Typography,
  Popconfirm,
  Tooltip,
  Image,
  Upload,
  Row,
  Col,
  Tag,
  Alert,
} from 'antd'
import {
  SafetyCertificateOutlined,
  ReloadOutlined,
  PlusOutlined,
  EyeOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import * as ownerReportsApi from '../../api/ownerReports'
import PageHeader from '../../components/common/PageHeader'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge from '../../components/common/StatusBadge'

const { Text, Paragraph } = Typography

const categoryLabels = {
  scam: 'Scam',
  harassment: 'Harassment',
  misrepresentation: 'Misrepresentation',
  deposit_dispute: 'Deposit Dispute',
  maintenance_neglect: 'Maintenance Neglect',
  unfair_terms: 'Unfair Terms',
  other: 'Other',
}

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))

export default function ReportOwner() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [eligibleOwners, setEligibleOwners] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [activeReport, setActiveReport] = useState(null)
  const [fileList, setFileList] = useState([])
  const [form, setForm] = useState({
    owner_id: null,
    category: null,
    subject: '',
    description: '',
  })

  const loadReports = async () => {
    setLoading(true)
    try {
      const res = await ownerReportsApi.getMyOwnerReports()
      const data = res.data?.data || res.data
      setReports(Array.isArray(data) ? data : [])
    } catch {
      message.error('Failed to load your reports')
    } finally {
      setLoading(false)
    }
  }

  const loadEligible = async () => {
    try {
      const res = await ownerReportsApi.getEligibleOwners()
      const data = res.data?.data || res.data
      setEligibleOwners(Array.isArray(data) ? data : [])
    } catch {
      // Ignore
    }
  }

  useEffect(() => {
    loadReports()
    loadEligible()
  }, [])

  const resetForm = () => {
    setForm({ owner_id: null, category: null, subject: '', description: '' })
  }

  const handleSubmit = async () => {
    if (!form.owner_id || !form.category || !form.subject.trim() || !form.description.trim()) {
      message.warning('Fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      await ownerReportsApi.createOwnerReport({
        owner_id: form.owner_id,
        category: form.category,
        subject: form.subject.trim(),
        description: form.description.trim(),
      })
      message.success('Report submitted. An administrator will review it.')
      resetForm()
      setShowForm(false)
      loadReports()
      loadEligible()
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpload = async () => {
    if (!activeReport || fileList.length === 0) {
      message.warning('Select an image to upload')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      fileList.forEach((file) => {
        formData.append('file', file.originFileObj || file)
      })
      await ownerReportsApi.uploadReportEvidence(activeReport.id, formData)
      message.success('Evidence uploaded')
      setShowUpload(false)
      setFileList([])
      loadReports()
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to upload evidence')
    } finally {
      setUploading(false)
    }
  }

  const columns = [
    {
      title: 'Owner',
      key: 'owner',
      render: (_, record) => (
        <div>
          <Text strong>{record.owner?.name || '—'}</Text>
          {record.owner?.settings?.company_name && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.owner.settings.company_name}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (val) => categoryLabels[val] || val,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (val) => (
        <Tooltip title={val}>
          <Text style={{ maxWidth: 200, display: 'inline-block' }} ellipsis>
            {val}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Admin Note',
      dataIndex: 'admin_note',
      key: 'admin_note',
      render: (val) => (val ? <Text type="secondary">{val}</Text> : '—'),
    },
    {
      title: 'Submitted',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => (val ? dayjs(val).format('DD MMM YYYY') : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<UploadOutlined />}
            onClick={() => {
              setActiveReport(record)
              setShowUpload(true)
            }}
          >
            Add Evidence
          </Button>
          {record.media && record.media.length > 0 && (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                Modal.info({
                  title: 'Evidence',
                  width: 640,
                  content: (
                    <Image.PreviewGroup>
                      <Row gutter={[8, 8]}>
                        {record.media.map((m) => (
                          <Col key={m.id} xs={12} md={8}>
                            <Image src={m.display_url || m.url} style={{ width: '100%', objectFit: 'cover' }} />
                          </Col>
                        ))}
                      </Row>
                    </Image.PreviewGroup>
                  ),
                })
              }}
            >
              View Evidence
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Report an Owner"
        subtitle="Report an owner you have had a rental relationship with for misconduct or fraudulent behaviour."
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                resetForm()
                setShowForm(true)
                loadEligible()
              }}
              disabled={eligibleOwners.length === 0}
            >
              New Report
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadReports}>
              Refresh
            </Button>
          </Space>
        }
      />

      {eligibleOwners.length === 0 && (
        <Alert
          type="info"
          style={{ marginBottom: 16 }}
          showIcon
          message="You don't have any eligible owners to report"
          description="You can only report owners you currently rent from, have rented from before, or have sent rental requests to."
        />
      )}

      {!loading && reports.length === 0 ? (
        <EmptyState
          title="No Reports Yet"
          description="You haven't filed any owner reports yet."
          icon={<SafetyCertificateOutlined />}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title="File an Owner Report"
        open={showForm}
        onOk={handleSubmit}
        onCancel={() => setShowForm(false)}
        confirmLoading={submitting}
        okText="Submit Report"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text type="secondary">Owner</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={form.owner_id}
              onChange={(val) => setForm((prev) => ({ ...prev, owner_id: val }))}
              options={eligibleOwners.map((o) => ({
                value: o.id,
                label: o.name + (o.context ? ` (${o.context})` : ''),
              }))}
            />
          </div>
          <div>
            <Text type="secondary">Category</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={form.category}
              onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
              options={categoryOptions}
            />
          </div>
          <div>
            <Text type="secondary">Subject</Text>
            <Input
              style={{ marginTop: 4 }}
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
              maxLength={150}
            />
          </div>
          <div>
            <Text type="secondary">Description</Text>
            <Input.TextArea
              rows={4}
              style={{ marginTop: 4 }}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              maxLength={5000}
            />
          </div>
        </Space>
      </Modal>

      <Modal
        title="Upload Evidence"
        open={showUpload}
        onOk={handleUpload}
        onCancel={() => {
          setShowUpload(false)
          setFileList([])
        }}
        confirmLoading={uploading}
        okText="Upload"
      >
        <Upload
          accept="image/*"
          listType="picture-card"
          fileList={fileList}
          onChange={({ fileList: newFileList }) => setFileList(newFileList)}
          beforeUpload={() => false}
          maxCount={5}
        >
          {fileList.length < 5 && (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Select</div>
            </div>
          )}
        </Upload>
        <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
          Only images (JPG, PNG, WebP). Max 5MB each.
        </Paragraph>
      </Modal>
    </div>
  )
}
