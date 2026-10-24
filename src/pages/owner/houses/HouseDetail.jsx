import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Row, Col, Table, Button, Space, Tabs, Progress, Card, Typography, message } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import * as housesApi from '../../../api/houses'
import PageHeader from '../../../components/common/PageHeader'
import StatsCard from '../../../components/common/StatsCard'
import StatusBadge from '../../../components/common/StatusBadge'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'
import EmptyState from '../../../components/common/EmptyState'
import MediaGallery from '../../../components/common/MediaGallery'
import {
  HomeOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  BankOutlined,
  WarningOutlined,
  PercentageOutlined,
  PhoneOutlined,
} from '@ant-design/icons'

const { Text } = Typography
const { TabPane } = Tabs

const statusTabs = [
  { key: 'all', label: 'All Rooms' },
  { key: 'available', label: 'Available (Empty)' },
  { key: 'occupied', label: 'Occupied' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'inactive', label: 'Inactive' },
]

export default function HouseDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [house, setHouse] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    housesApi
      .getById(id)
      .then((res) => setHouse(res.data.data || res.data))
      .catch(() => message.error('Failed to load house'))
      .finally(() => setLoading(false))

    setRoomsLoading(true)
    housesApi
      .getRooms(id)
      .then((res) => {
        const data = res.data.data || res.data
        setRooms(Array.isArray(data) ? data : data.rooms || [])
      })
      .catch(() => message.error('Failed to load rooms'))
      .finally(() => setRoomsLoading(false))
  }, [id])

  const filteredRooms = useMemo(() => {
    if (statusFilter === 'all') return rooms
    return rooms.filter((r) => (r.status || 'available') === statusFilter)
  }, [rooms, statusFilter])

  const roomColumns = [
    {
      title: 'Room Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => navigate(`/owner/rooms/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Rent',
      dataIndex: 'rent_amount',
      key: 'rent_amount',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => record.current_rental?.tenant?.full_name || record.current_tenant?.full_name || '-',
    },
    {
      title: 'Tenant Phone',
      key: 'phone',
      render: (_, record) => {
        const phone = record.current_rental?.tenant?.phone || record.current_tenant?.phone
        return phone ? (
          <Space size={4}>
            <PhoneOutlined style={{ color: '#1890bf' }} />
            <Text>{phone}</Text>
          </Space>
        ) : (
          '-'
        )
      },
    },
    {
      title: 'Balance',
      key: 'outstanding',
      align: 'right',
      render: (_, record) => {
        const bal = Number(record.outstanding ?? 0)
        return bal > 0 ? (
          <Text style={{ color: '#f5222d' }}>
            <CurrencyDisplay amount={bal} />
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/owner/rooms/${record.id}`)}
        />
      ),
    },
  ]

  if (!house && !loading) {
    return <EmptyState title="House Not Found" />
  }

  const occupancyRate = house?.occupancy_rate ?? 0

  const houseImages = (house?.media || [])
    .filter((m) => m.type === 'image')
    .map((m) => m.display_url || m.url)
  const houseVideo = house?.media?.find((m) => m.type === 'video')?.display_url

  return (
    <div>
      <PageHeader
        title={house?.name || 'House Detail'}
        subtitle={house?.address}
        onBack={() => navigate('/owner/houses')}
        extra={
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/owner/houses/${id}/edit`)}
          >
            Edit
          </Button>
        }
      />

      {house && (houseImages.length > 0 || houseVideo) && (
        <Card title="Photos & Video" style={{ borderRadius: 12, marginBottom: 24 }}>
          <MediaGallery images={houseImages} video={houseVideo} />
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <StatsCard
            title="Total Rooms"
            value={house?.rooms_count ?? '-'}
            icon={<HomeOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatsCard
            title="Occupied"
            value={house?.occupied_rooms ?? '-'}
            icon={<TeamOutlined />}
            color="#0d6e3f"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatsCard
            title="Available (Empty)"
            value={house?.available_rooms ?? '-'}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatsCard
            title="Occupancy Rate"
            value={`${occupancyRate}%`}
            icon={<PercentageOutlined />}
            color="#722ed1"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <StatsCard
            title="Monthly Rent (Potential)"
            value={<CurrencyDisplay amount={house?.total_monthly_rent} />}
            icon={<BankOutlined />}
            color="#fa8c16"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatsCard
            title="Collected"
            value={<CurrencyDisplay amount={house?.total_collected} />}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatsCard
            title="Outstanding"
            value={<CurrencyDisplay amount={house?.total_outstanding} />}
            icon={<WarningOutlined />}
            color="#f5222d"
          />
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} style={{ borderRadius: 12, height: '100%' }} bodyStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px' }}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="dashboard"
                percent={occupancyRate}
                size={96}
                strokeColor={occupancyRate >= 80 ? '#0d6e3f' : occupancyRate >= 50 ? '#faad14' : '#f5222d'}
                format={(p) => <span style={{ fontSize: 14 }}>{p}%</span>}
              />
              <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>Occupancy</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Rooms</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(`/owner/houses/${id}/rooms/new`)}
        >
          Add Room
        </Button>
      </div>

      <Tabs activeKey={statusFilter} onChange={setStatusFilter} style={{ marginBottom: 8 }}>
        {statusTabs.map((tab) => (
          <TabPane
            tab={
              <span>
                {tab.label}
                {tab.key !== 'all' && (
                  <span style={{ marginLeft: 6, color: '#999' }}>
                    ({rooms.filter((r) => (r.status || 'available') === tab.key).length})
                  </span>
                )}
              </span>
            }
            key={tab.key}
          />
        ))}
      </Tabs>

      {!roomsLoading && filteredRooms.length === 0 ? (
        <EmptyState
          title="No Rooms"
          description={statusFilter === 'all' ? 'Add a room to this house.' : 'No rooms in this category.'}
        />
      ) : (
        <Table
          columns={roomColumns}
          dataSource={filteredRooms}
          rowKey="id"
          loading={roomsLoading}
          pagination={filteredRooms.length > 10 ? { pageSize: 10 } : false}
          summary={filteredRooms.length > 0 ? () => {
            const occupiedCount = filteredRooms.filter((r) => r.status === 'occupied').length
            const availableCount = filteredRooms.filter((r) => r.status === 'available').length
            const outstanding = filteredRooms.reduce((s, r) => s + Number(r.outstanding || 0), 0)
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text type="secondary">Totals ({filteredRooms.length} rooms)</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <Text type="secondary">Occupied: {occupiedCount} / Available: {availableCount}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} />
                <Table.Summary.Cell index={4} align="right">
                  <Text style={{ color: outstanding > 0 ? '#f5222d' : 'inherit' }}>
                    <CurrencyDisplay amount={outstanding} />
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} />
                <Table.Summary.Cell index={6} />
              </Table.Summary.Row>
            )
          } : undefined}
        />
      )}
    </div>
  )
}