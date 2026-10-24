import { useEffect, useState } from 'react'
import {
  Card,
  Button,
  Select,
  Input,
  Rate,
  Space,
  message,
  Typography,
  Table,
  Tooltip,
  Tag,
} from 'antd'
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as feedbackApi from '../../api/feedback'
import PageHeader from '../../components/common/PageHeader'
import EmptyState from '../../components/common/EmptyState'

const { Text } = Typography

const categoryLabels = {
  bug: 'Bug',
  feature_request: 'Feature Request',
  suggestion: 'Suggestion',
  compliment: 'Compliment',
  complaint: 'Complaint',
  other: 'Other',
}

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))

const statusColors = {
  new: 'gold',
  reviewed: 'green',
  archived: 'default',
}

export default function Feedback() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    category: null,
    rating: null,
    message: '',
  })

  const loadFeedback = async () => {
    setLoading(true)
    try {
      const res = await feedbackApi.getMyFeedback()
      const data = res.data?.data || res.data
      setFeedback(Array.isArray(data) ? data : [])
    } catch {
      message.error('Failed to load your feedback')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedback()
  }, [])

  const resetForm = () => {
    setForm({ category: null, rating: null, message: '' })
  }

  const handleSubmit = async () => {
    if (!form.category || !form.message.trim()) {
      message.warning('Fill in category and message')
      return
    }
    setSubmitting(true)
    try {
      await feedbackApi.submitFeedback({
        category: form.category,
        rating: form.rating,
        message: form.message.trim(),
      })
      message.success('Thank you for your feedback!')
      resetForm()
      setShowForm(false)
      loadFeedback()
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
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
      render: (val) => (val ? <Rate disabled defaultValue={val} style={{ fontSize: 16 }} /> : '—'),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (val) => (
        <Tooltip title={val}>
          <Text style={{ maxWidth: 240, display: 'inline-block' }} ellipsis>
            {val}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val) => <Tag color={statusColors[val]}>{val}</Tag>,
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
  ]

  return (
    <div>
      <PageHeader
        title="Feedback"
        subtitle="Share ideas, report bugs, or send compliments to help us improve."
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Give Feedback
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadFeedback}>
              Refresh
            </Button>
          </Space>
        }
      />

      {!loading && feedback.length === 0 ? (
        <EmptyState title="No Feedback Yet" description="Your feedback will appear here once submitted." />
      ) : (
        <Table
          columns={columns}
          dataSource={feedback}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      )}

      {showForm && (
        <Card style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
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
              <Text type="secondary">Rating (optional)</Text>
              <div style={{ marginTop: 4 }}>
                <Rate value={form.rating} onChange={(val) => setForm((prev) => ({ ...prev, rating: val }))} />
              </div>
            </div>
            <div>
              <Text type="secondary">Message</Text>
              <Input.TextArea
                rows={4}
                style={{ marginTop: 4 }}
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                maxLength={5000}
              />
            </div>
            <Space>
              <Button onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="primary" loading={submitting} onClick={handleSubmit}>
                Submit
              </Button>
            </Space>
          </Space>
        </Card>
      )}
    </div>
  )
}
