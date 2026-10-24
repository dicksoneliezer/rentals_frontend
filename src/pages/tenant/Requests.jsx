import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Tooltip,
  Alert,
  Space,
  Tag,
  message,
} from 'antd'
import {
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import * as rentalRequestsApi from '../../api/rentalRequests'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'

const { Text } = Typography

export default function MyRequests() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await rentalRequestsApi.getMyRequests()
      const data = res.data.data || res.data
      setRequests(Array.isArray(data) ? data : [])
    } catch {
      message.error('Failed to load your requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const pending = requests.filter((r) => r.status === 'pending').length
  const accepted = requests.filter((r) => r.status === 'accepted').length

  const needsConfirmation = requests.filter(
    (r) => r.reservation?.due_diligence_required && !r.reservation?.visit_confirmed_at
  )

  const formatLeft = (until) => {
    const mins = until.diff(dayjs(), 'minute')
    if (mins <= 0) return 'about to end'
    const days = Math.floor(mins / 1440)
    const hours = Math.floor((mins % 1440) / 60)
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return `${mins}m left`
  }

  const handleConfirm = async (rentalId) => {
    try {
      await rentalRequestsApi.confirmProceed(rentalId)
      message.success('Thank you. You can proceed with the next steps whenever you are ready.')
      fetchRequests()
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to confirm')
    }
  }

  const columns = [
    {
      title: 'House / Room',
      key: 'property',
      render: (_, record) => (
        <div>
          <Text strong>{record.house?.name || record.room?.house?.name || '—'}</Text>
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
                You confirmed
              </Tag>
            ) : (
              <Button size="small" type="primary" onClick={() => handleConfirm(r.rental_id)}>
                Confirm I am ready
              </Button>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Your message',
      dataIndex: 'message',
      key: 'message',
      render: (val) =>
        val ? (
          <Tooltip title={val}>
            <Text style={{ maxWidth: 180, display: 'inline-block' }} ellipsis>
              {val}
            </Text>
          </Tooltip>
        ) : (
          '—'
        ),
    },
    {
      title: 'Owner response',
      dataIndex: 'response_message',
      key: 'response_message',
      render: (val) =>
        val ? (
          <Tooltip title={val}>
            <Text style={{ maxWidth: 180, display: 'inline-block' }} ellipsis>
              {val}
            </Text>
          </Tooltip>
        ) : (
          '—'
        ),
    },
    {
      title: 'Requested',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => (val ? dayjs(val).format('DD MMM YYYY HH:mm') : '—'),
    },
  ]

  return (
    <div>
      <PageHeader
        title="My Requests"
        subtitle="Track the rental requests you have sent to owners."
        extra={
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => navigate('/listings')}
          >
            Browse Rentals
          </Button>
        }
      />

      {needsConfirmation.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<SafetyCertificateOutlined />}
          style={{ marginBottom: 16 }}
          message="A room is being held for you"
          description="The owner accepted your request and the room is reserved for a short time. If you can, arrange to view the room before paying anything. Pay only after you have signed a contract. When you are satisfied it is genuine, confirm below — or simply let the hold expire if you are no longer interested."
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="Total Requests"
              value={requests.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="Pending"
              value={pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="Accepted"
              value={accepted}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#0d6e3f' }}
            />
          </Card>
        </Col>
      </Row>

      {!loading && requests.length === 0 ? (
        <EmptyState
          title="No Requests Yet"
          description="Browse available rentals and send your first request."
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
    </div>
  )
}
