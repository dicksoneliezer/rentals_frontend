
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
  Rate,
  Tag,
  Popconfirm,
  Tooltip,
  Image,
  Row,
  Col,
} from 'antd'
import { ReloadOutlined, SearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getOwnerReports, updateOwnerReport, suspendUser } from '../../api/admin'
import PageHeader from '../../components/common/PageHeader'

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

const statusLabels = {
  submitted: 'Submitted',
  in_review: 'In Review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
}

const statusColors = {
  submitted: 'gold',
  in_review: 'blue',
  resolved: 'green',
  dismissed: 'default',
}

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({
  value,
  label,
}))

export default function AdminReports() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState()
  const [category, setCategory] = useState()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [viewing, setViewing] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [form, setForm] = useState({ status: null, admin_note: '' })
  const [suspending, setSuspending] = useState(false)

  const loadData = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true)
    try {
      const res = await getOwnerReports({
        page,
        per_page: pageSize,
        search: search || undefined,
        status: status || undefined,
        category: category || undefined,
      })
      const p = res.data?.data || res.data
      setRows(Array.isArray(p.data) ? p.data : [])
      setPagination({ current: p.current_page, pageSize: p.per_page, total: p.total })
    } catch {
      message.error('Failed to load owner reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, category])

  const handleView = (record) => {
    setViewing(record)
    setForm({
      status: record.status === 'submitted' ? 'in_review' : record.status,
      admin_note: record.admin_note || '',
    })
  }

  const handleUpdate = async () => {
    if (!viewing || !form.status) return
    setUpdating(true)
    try {
      await updateOwnerReport(viewing.id, {
        status: form.status,
        admin_note: form.admin_note || undefined,
      })
      message.success('Report updated')
      setViewing(null)
      loadData(pagination.current, pagination.pageSize)
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to update')
    } finally {
      setUpdating(false)
    }
  }

  const handleSuspend = async () => {
    if (!viewing) return
    setSuspending(true)
    try {
      await suspendUser(viewing.owner_id)
      message.success('Owner suspended')
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to suspend')
    } finally {
      setSuspending(false)
    }
  }

  const columns = [
    {
      title: 'Reported Owner',
      key: 'owner',
      render: (_, record) => (
        <div>
          <Text strong>{record.owner?.name || '—'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.owner?.phone}
          </Text>
        </div>
      ),
    },
    {
      title: 'Reporter',
      key: 'reporter',
      render: (_, record) => (
        <div>
          <Text>{record.reporter?.name || '—'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.reporter?.phone}
          </Text>
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
      render: (val) => <Tag color={statusColors[val]}>{statusLabels[val] || val}</Tag>,
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
        <Button size="small" onClick={() => handleView(record)} icon={<SafetyCertificateOutlined />}>
          Review
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Owner Reports"
        subtitle="Review tenant complaints about owners. The reported owner is never notified that a report exists."
      />

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            allowClear
            placeholder="Search by subject, description, or names"
            prefix={<SearchOutlined />}
            onSearch={setSearch}
            style={{ width: 320 }}
          />
          <Select
            allowClear
            placeholder="Status"
            value={status}
            onChange={setStatus}
            style={{ width: 160 }}
            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            allowClear
            placeholder="Category"
            value={category}
            onChange={setCategory}
            style={{ width: 200 }}
            options={categoryOptions}
          />
          <Button icon={<ReloadOutlined />} onClick={() => loadData(pagination.current)}>
            Refresh
          </Button>
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={(pag) => loadData(pag.current, pag.pageSize)}
        />
      </Card>

      <Modal
        title="Review Owner Report"
        open={!!viewing}
        onOk={handleUpdate}
        onCancel={() => setViewing(null)}
        confirmLoading={updating}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setViewing(null)}>
            Close
          </Button>,
          <Popconfirm
            key="suspend"
            title="Suspend this owner?"
            description="This will immediately suspend the owner's account and invalidate their sessions."
            onConfirm={handleSuspend}
          >
            <Button danger loading={suspending}>
              Suspend Owner
            </Button>
          </Popconfirm>,
          <Button key="save" type="primary" loading={updating} onClick={handleUpdate}>
            Save Review
          </Button>,
        ]}
      >
        {viewing && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Subject:</Text>
              <div>{viewing.subject}</div>
            </div>
            <div>
              <Text strong>Description:</Text>
              <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                {viewing.description}
              </Paragraph>
            </div>
            {viewing.house && (
              <div>
                <Text strong>House:</Text> {viewing.house.name}
              </div>
            )}
            {viewing.media && viewing.media.length > 0 && (
              <div>
                <Text strong>Evidence:</Text>
                <div style={{ marginTop: 8 }}>
                  <Image.PreviewGroup>
                    <Row gutter={[8, 8]}>
                      {viewing.media.map((m) => (
                        <Col key={m.id} xs={12} md={6}>
                          <Image
                            src={m.display_url || m.url}
                            style={{ width: '100%', height: 100, objectFit: 'cover' }}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                </div>
              </div>
            )}
            <div>
              <Text strong>Status</Text>
              <Select
                style={{ width: '100%', marginTop: 4 }}
                value={form.status}
                onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
                options={[
                  { value: 'in_review', label: 'In Review' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'dismissed', label: 'Dismissed' },
                ]}
              />
            </div>
            <div>
              <Text strong>Admin Note</Text>
              <Input.TextArea
                rows={4}
                style={{ marginTop: 4 }}
                value={form.admin_note}
                onChange={(e) => setForm((prev) => ({ ...prev, admin_note: e.target.value }))}
              />
            </div>
          </Space>
        )}
      </Modal>
    </div>
  )
}
