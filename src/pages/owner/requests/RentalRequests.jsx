import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Select,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Descriptions,
  Typography,
  Tag,
  message,
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import * as rentalRequestsApi from '../../../api/rentalRequests'
import PageHeader from '../../../components/common/PageHeader'
import StatusBadge from '../../../components/common/StatusBadge'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'
import EmptyState from '../../../components/common/EmptyState'

const { Text } = Typography

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
]

export default function RentalRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [viewing, setViewing] = useState(null)
  const [accepting, setAccepting] = useState(null)
  const [declining, setDeclining] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [acceptForm] = Form.useForm()
  const [declineForm] = Form.useForm()

  const fetchRequests = async (statusFilter = status) => {
    setLoading(true)
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const res = await rentalRequestsApi.getOwnerRequests(params)
      const data = res.data.data || res.data
      setRequests(Array.isArray(data) ? data : [])
    } catch {
      message.error('Failed to load rental requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [status])

  const openAccept = (record) => {
    setAccepting(record)
    acceptForm.setFieldsValue({
      start_date: record.desired_start_date ? dayjs(record.desired_start_date) : dayjs().add(1, 'month').startOf('month'),
      rent_amount: Number(record.room?.rent_amount) || 0,
      period_months: record.period_months || 12,
      deposit_amount: 0,
      response_message: '',
    })
  }

  const openDecline = (record) => {
    setDeclining(record)
    declineForm.setFieldsValue({ response_message: '' })
  }

  const confirmAccept = async () => {
    try {
      const values = await acceptForm.validateFields()
      setSubmitting(true)
      await rentalRequestsApi.acceptRequest(accepting.id, {
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : undefined,
        rent_amount: values.rent_amount,
        period_months: values.period_months,
        deposit_amount: values.deposit_amount,
        response_message: values.response_message || undefined,
      })
      message.success('Request accepted. The room is now reserved — send a contract so the tenant can sign.')
      setAccepting(null)
      fetchRequests()
    } catch (err) {
      if (err?.errorFields) return
      message.error(err?.response?.data?.message || 'Failed to accept the request')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDecline = async () => {
    try {
      const values = await declineForm.validateFields()
      setSubmitting(true)
      await rentalRequestsApi.declineRequest(declining.id, {
        response_message: values.response_message || undefined,
      })
      message.success('Request declined.')
      setDeclining(null)
      fetchRequests()
    } catch (err) {
      if (err?.errorFields) return
      message.error(err?.response?.data?.message || 'Failed to decline the request')
    } finally {
      setSubmitting(false)
    }
  }

  const formatLeft = (until) => {
    const mins = until.diff(dayjs(), 'minute')
    if (mins <= 0) return 'about to end'
    const days = Math.floor(mins / 1440)
    const hours = Math.floor((mins % 1440) / 60)
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return `${mins}m left`
  }

  const columns = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => (
        <div>
          <Text strong>{record.tenant?.full_name || record.tenant?.user?.name || 'Unknown'}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.tenant?.phone || record.tenant?.user?.phone || ''}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'House / Room',
      key: 'property',
      render: (_, record) => (
        <div>
          <Text>{record.house?.name || '—'}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.room?.name || '—'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Desired start',
      dataIndex: 'desired_start_date',
      key: 'desired_start_date',
      render: (val) => (val ? dayjs(val).format('DD MMM YYYY') : '—'),
    },
    {
      title: 'Period',
      dataIndex: 'period_months',
      key: 'period_months',
      align: 'center',
      render: (val) => `${val || 12} mo`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Reservation',
      key: 'reservation',
      render: (_, record) => {
        const r = record.reservation
        if (!r || !r.due_diligence_required) return '—'
        const until = r.reserved_until ? dayjs(r.reserved_until) : null
        return (
          <Space direction="vertical" size={2}>
            <Tag color="gold" icon={<ClockCircleOutlined />}>
              {until ? formatLeft(until) : 'Reserved'}
            </Tag>
            {r.visit_confirmed_at ? (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Tenant confirmed
              </Tag>
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Awaiting confirmation
              </Text>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Requested',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => (val ? dayjs(val).format('DD MMM YYYY HH:mm') : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setViewing(record)}>
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => openAccept(record)}
              >
                Accept
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => openDecline(record)}
              >
                Decline
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Rental Requests"
        subtitle="Requests from tenants who want to rent one of your rooms."
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
          style={{ width: 180 }}
        />
        <Button onClick={() => fetchRequests()}>Refresh</Button>
      </Space>

      {!loading && requests.length === 0 ? (
        <EmptyState
          title="No Rental Requests"
          description="When a tenant requests one of your rooms, it will appear here."
        />
      ) : (
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} requests` }}
        />
      )}

      {/* View details */}
      <Modal
        title="Request Details"
        open={!!viewing}
        onCancel={() => setViewing(null)}
        footer={<Button onClick={() => setViewing(null)}>Close</Button>}
        destroyOnHidden
      >
        {viewing && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Tenant">
              {viewing.tenant?.full_name || viewing.tenant?.user?.name || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {viewing.tenant?.phone || viewing.tenant?.user?.phone || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="House">{viewing.house?.name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Room">{viewing.room?.name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Monthly rent">
              <CurrencyDisplay amount={viewing.room?.rent_amount} />
            </Descriptions.Item>
            <Descriptions.Item label="Desired start">
              {viewing.desired_start_date ? dayjs(viewing.desired_start_date).format('DD MMM YYYY') : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Period">{viewing.period_months || 12} months</Descriptions.Item>
            <Descriptions.Item label="Status">
              <StatusBadge status={viewing.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Message">{viewing.message || '—'}</Descriptions.Item>
            {viewing.response_message && (
              <Descriptions.Item label="Your response">{viewing.response_message}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Accept */}
      <Modal
        title={accepting ? `Accept "${accepting.tenant?.full_name || 'request'}"` : 'Accept Request'}
        open={!!accepting}
        onCancel={() => setAccepting(null)}
        onOk={confirmAccept}
        confirmLoading={submitting}
        okText="Accept & Reserve"
        destroyOnHidden
      >
        <Form form={acceptForm} layout="vertical">
          <Form.Item
            name="start_date"
            label="Start date"
            rules={[{ required: true, message: 'Please choose a start date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="rent_amount" label="Monthly rent (TZS)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="period_months" label="Period (months)">
            <InputNumber min={1} max={60} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="deposit_amount" label="Deposit amount (TZS, optional)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="response_message" label="Message to tenant (optional)">
            <Input.TextArea rows={2} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Decline */}
      <Modal
        title="Decline Request"
        open={!!declining}
        onCancel={() => setDeclining(null)}
        onOk={confirmDecline}
        confirmLoading={submitting}
        okText="Decline"
        okButtonProps={{ danger: true }}
        destroyOnHidden
      >
        <Form form={declineForm} layout="vertical">
          <Form.Item name="response_message" label="Reason (optional)">
            <Input.TextArea rows={3} maxLength={1000} placeholder="Let the tenant know why..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
