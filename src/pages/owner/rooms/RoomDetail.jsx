import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Row, Col, Card, Table, Typography, Tag, Button, message } from 'antd'
import { EditOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as roomsApi from '../../../api/rooms'
import PageHeader from '../../../components/common/PageHeader'
import StatsCard from '../../../components/common/StatsCard'
import StatusBadge from '../../../components/common/StatusBadge'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'
import EmptyState from '../../../components/common/EmptyState'
import MediaGallery from '../../../components/common/MediaGallery'

const { Text, Title } = Typography

export default function RoomDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [room, setRoom] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    roomsApi
      .getById(id)
      .then((res) => setRoom(res.data.data || res.data))
      .catch(() => message.error('Failed to load room'))
      .finally(() => setLoading(false))

    setHistoryLoading(true)
    roomsApi
      .getHistory(id)
      .then((res) => {
        const data = res.data.data || res.data
        setHistory(Array.isArray(data) ? data : data.rent_charges || [])
      })
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false))
  }, [id])

  const historyColumns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (text) => text || '-',
    },
    {
      title: 'Expected',
      dataIndex: 'expected_amount',
      key: 'expected_amount',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Paid',
      dataIndex: 'paid_amount',
      key: 'paid_amount',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
  ]

  const currentRental = room?.current_rental
  const tenant = currentRental?.tenant || room?.current_tenant
  const hasBalance = Number.isFinite(Number(tenant?.balance))

  const roomImages = (room?.media || [])
    .filter((m) => m.type === 'image')
    .map((m) => m.display_url || m.url)
  const roomVideo = room?.media?.find((m) => m.type === 'video')?.display_url

  return (
    <div>
      <PageHeader
        title={room?.name || 'Room Detail'}
        subtitle={room?.house?.name || room?.house_name}
        onBack={() => navigate(-1)}
        extra={
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/owner/rooms/${id}/edit`)}
          >
            Edit
          </Button>
        }
      />

      {room && (roomImages.length > 0 || roomVideo) && (
        <Card title="Photos & Video" style={{ marginBottom: 24 }}>
          <MediaGallery images={roomImages} video={roomVideo} />
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <StatsCard
            title="Rent Amount"
            value={<CurrencyDisplay amount={room?.rent_amount} />}
            icon={<span style={{ fontSize: 24 }}>💰</span>}
            color="#1890ff"
          />
        </Col>
        <Col xs={12} sm={8}>
          <StatsCard
            title="Status"
            value={<StatusBadge status={room?.status} />}
            icon={<span style={{ fontSize: 24 }}>📋</span>}
            color={room?.status === 'available' ? '#52c41a' : '#faad14'}
          />
        </Col>
        <Col xs={12} sm={8}>
          <StatsCard
            title="Current Tenant"
            value={tenant?.full_name || 'None'}
            icon={<UserOutlined />}
            color="#722ed1"
          />
        </Col>
      </Row>

      {tenant && (
        <Card title="Current Tenant" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Text type="secondary">Name</Text>
              <div><Text strong>{tenant.full_name}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Phone</Text>
              <div><Text>{tenant.phone}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Rental Period</Text>
              <div>
                <Text>
                  {currentRental?.start_date
                    ? `${dayjs(currentRental.start_date).format('MMM D, YYYY')} - ${currentRental.end_date ? dayjs(currentRental.end_date).format('MMM D, YYYY') : 'Present'}`
                    : '-'}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Balance</Text>
              <div>
                {hasBalance ? (
                  <CurrencyDisplay amount={tenant.balance} />
                ) : (
                  <Text type="secondary">-</Text>
                )}
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <h3 style={{ marginBottom: 16 }}>Rent History</h3>
      {!historyLoading && history.length === 0 ? (
        <EmptyState title="No Rent History" description="No rent charges have been recorded yet." />
      ) : (
        <Table
          columns={historyColumns}
          dataSource={history}
          rowKey="id"
          loading={historyLoading}
          pagination={history.length > 10 ? { pageSize: 10 } : false}
        />
      )}
    </div>
  )
}
