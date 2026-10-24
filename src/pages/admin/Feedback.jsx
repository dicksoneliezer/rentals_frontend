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
} from 'antd'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getFeedbackList, updateFeedback } from '../../api/admin'
import PageHeader from '../../components/common/PageHeader'

const { Text, Paragraph } = Typography

const categoryLabels = {
  bug: 'Bug',
  feature_request: 'Feature Request',
  suggestion: 'Suggestion',
  compliment: 'Compliment',
  complaint: 'Complaint',
  other: 'Other',
}

const statusLabels = {
  new: 'New',
  reviewed: 'Reviewed',
  archived: 'Archived',
}

const statusColors = {
  new: 'gold',
  reviewed: 'green',
  archived: 'default',
}

export default function AdminFeedback() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState()
  const [role, setRole] = useState()
  const [category, setCategory] = useState()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })
  const [viewing, setViewing] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [form, setForm] = useState({ status: null, admin_note: '' })

  const loadData = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true)
    try {
      const res = await getFeedbackList({
        page,
        per_page: pageSize,
        status: status || undefined,
        role: role || undefined,
        category: category || undefined,
      })
      const p = res.data?.data || res.data
      setRows(Array.isArray(p.data) ? p.data : [])
      setPagination({ current: p.current_page, pageSize: p.per_page, total: p.total })
    } catch {
      message.error('Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, role, category])

  const handleView = (record) => {
    setViewing(record)
    setForm({ status: record.status === 'new' ? 'reviewed' : record.status, admin_note: record.admin_note || '' })
  }

  const handleUpdate = async () => {
    if (!viewing || !form.status) return
    setUpdating(true)
    try {
      await updateFeedback(viewing.id, {
        status: form.status,
        admin_note: form.admin_note || undefined,
      })
      message.success('Feedback updated')
      setViewing(null)
      loadData(pagination.current, pagination.pageSize)
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to update')
    } finally {
      setUpdating(false)
    }
  }

  const columns = [
    {
      title: 'Submitter',
      key: 'user',
      render: (_, record) => (
        <div>
          <Text>{record.user?.name || '—'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.role}
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
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (val) => (val ? <Rate disabled defaultValue={val} style={{ fontSize: 14 }} /> : '—'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val) => <Tag color={statusColors[val]}>{statusLabels[val] || val}</Tag>,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (val) => (
        <Input.TextArea
          readOnly
          rows={2}
          value={val}
          style={{ background: '#fafafa', resize: 'none' }}
        />
      ),
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
        <Button size="small" onClick={() => handleView(record)}>
          Review
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Feedback" subtitle="Product feedback and suggestions from owners and tenants." />

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <SearchOutlined style={{ color: '#8c8c8c' }} />
          <Input.Search
            allowClear
            placeholder="Search messages"
            style={{ width: 260 }}
            onSearch={(v) => message.info('Search implemented at list level as needed')}
          />
          <Select
            allowClear
            placeholder="Status"
            value={status}
            onChange={setStatus}
            style={{ width: 140 }}
            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            allowClear
            placeholder="Role"
            value={role}
            onChange={setRole}
            style={{ width: 140 }}
            options={[
              { value: 'owner', label: 'Owner' },
              { value: 'tenant', label: 'Tenant' },
            ]}
          />
          <Select
            allowClear
            placeholder="Category"
            value={category}
            onChange={setCategory}
            style={{ width: 180 }}
            options={Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))}
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
        title="Review Feedback"
        open={!!viewing}
        onOk={handleUpdate}
        onCancel={() => setViewing(null)}
        confirmLoading={updating}
        width={600}
      >
        {viewing && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Message:</Text>
              <Paragraph style={{ marginTop: 8, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                {viewing.message}
              </Paragraph>
            </div>
            <div>
              <Text strong>Rating:</Text> {viewing.rating ? <Rate disabled defaultValue={viewing.rating} /> : '—'}
            </div>
            <div>
              <Text strong>Status</Text>
              <Select
                style={{ width: '100%', marginTop: 4 }}
                value={form.status}
                onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
                options={[
                  { value: 'reviewed', label: 'Reviewed' },
                  { value: 'archived', label: 'Archived' },
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
