import { useState, useEffect } from 'react'
import { Row, Col, Card, List, Typography, Skeleton, Empty, Space, Tag, Progress, Table, Avatar, message } from 'antd'
import {
  HomeOutlined,
  AppstoreOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  BankOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { getOwnerDashboard } from '../../api/dashboard'
import CurrencyDisplay from '../../components/common/CurrencyDisplay'
import StatusBadge from '../../components/common/StatusBadge'
import ReceiptModal from '../../components/common/ReceiptModal'

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend, ArcElement)

const { Title, Text } = Typography

function StatCard({ title, value, icon, color, suffix, trend, onClick }) {
  return (
    <Card
      bordered={false}
      hoverable={!!onClick}
      onClick={onClick}
      style={{ borderRadius: 12, height: '100%', cursor: onClick ? 'pointer' : 'default' }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 13, letterSpacing: 0.3 }}>{title}</Text>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <Title level={3} style={{ margin: 0, color: '#1a1a2e' }}>{value}</Title>
            {suffix && <Text type="secondary" style={{ fontSize: 13 }}>{suffix}</Text>}
          </div>
          {trend !== undefined && (
            <div style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 12, color: trend >= 0 ? '#52c41a' : '#ff4d4f' }}>
                {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(trend)}%
              </Text>
            </div>
          )}
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${color}12`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewReceiptId, setViewReceiptId] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getOwnerDashboard()
        setData(response.data.data || response.data)
      } catch {
        message.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 0 }} />
        <Row gutter={[16, 16]}>
          {[...Array(4)].map((_, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {[...Array(3)].map((_, i) => (
            <Col xs={24} sm={8} key={i}>
              <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={14}><Card><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
          <Col xs={24} lg={10}><Card><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
        </Row>
      </div>
    )
  }

  const stats = data?.stats || {}
  const financial = data?.financial || {}
  const expiringSoon = data?.expiring_soon || []
  const overdue = data?.overdue || []
  const monthlyCollection = data?.monthly_collection || []
  const recentPayments = data?.recent_payments || []
  const housePerformance = data?.house_performance || []

  const occupancyData = {
    labels: ['Occupied', 'Available', 'Maintenance'],
    datasets: [
      {
        data: [stats.occupied_rooms || 0, stats.available_rooms || 0, stats.maintenance_rooms || 0],
        backgroundColor: ['#0d6e3f', '#1890ff', '#faad14'],
        borderWidth: 0,
        cutout: '72%',
      },
    ],
  }

  const occupancyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  }

  const chartData = {
    labels: monthlyCollection.map((m) => m.month),
    datasets: [
      {
        label: 'Expected',
        data: monthlyCollection.map((m) => m.expected || 0),
        backgroundColor: 'rgba(24, 144, 255, 0.15)',
        borderColor: '#1890ff',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Collected',
        data: monthlyCollection.map((m) => m.collected || 0),
        backgroundColor: 'rgba(13, 110, 63, 0.85)',
        borderColor: '#0d6e3f',
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: TZS ${ctx.raw?.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => v >= 1000000 ? `${v / 1000000}M` : v >= 1000 ? `${v / 1000}K` : v },
        grid: { color: '#f0f0f0' },
      },
      x: { grid: { display: false } },
    },
  }

  const paymentColumns = [
    {
      title: 'Tenant',
      dataIndex: 'tenant_name',
      key: 'tenant_name',
      render: (name) => (
        <Space>
          <Avatar size={28} style={{ backgroundColor: '#0d6e3f', fontSize: 12 }}>{name?.[0]}</Avatar>
          <Text style={{ fontSize: 13 }}>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Room',
      dataIndex: 'room_name',
      key: 'room_name',
      render: (name) => <Text type="secondary" style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (val) => <Text strong style={{ color: '#0d6e3f', fontSize: 13 }}>TZS {Number(val).toLocaleString()}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      align: 'right',
      render: (d) => <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(d).format('DD MMM')}</Text>,
    },
    {
      title: 'Receipt',
      key: 'receipt',
      render: (_, record) => {
        if (!record.receipt_id) return <Text type="secondary">-</Text>
        return (
          <a onClick={() => setViewReceiptId(record.receipt_id)}>
            {record.receipt_number}
          </a>
        )
      },
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
        <Text type="secondary">Overview of your rental business</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Total Houses" value={stats.total_houses || 0} icon={<HomeOutlined />} color="#0d6e3f" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Rooms"
            value={stats.total_rooms || 0}
            icon={<AppstoreOutlined />}
            color="#1890ff"
            suffix={<Text type="secondary" style={{ fontSize: 12 }}>{stats.occupancy_rate || 0}% occ.</Text>}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Active Tenants" value={stats.total_tenants || 0} icon={<TeamOutlined />} color="#722ed1" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Outstanding"
            value={<CurrencyDisplay amount={financial.outstanding} />}
            icon={<WarningOutlined />}
            color="#f5222d"
            suffix={financial.collection_rate !== undefined && (
              <Text style={{ fontSize: 12, color: '#52c41a' }}>{financial.collection_rate}% collected</Text>
            )}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Expected Rent"
            value={<CurrencyDisplay amount={financial.expected_rent} />}
            icon={<BankOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Collected"
            value={<CurrencyDisplay amount={financial.collected} />}
            icon={<CheckCircleOutlined />}
            color="#0d6e3f"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Collection Rate"
            value={`${financial.collection_rate || 0}%`}
            icon={<RiseOutlined />}
            color={financial.collection_rate >= 80 ? '#0d6e3f' : financial.collection_rate >= 50 ? '#faad14' : '#f5222d'}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card
            title={<Text strong>Monthly Rent Collection</Text>}
            bordered={false}
            style={{ borderRadius: 12, height: '100%' }}
            extra={<Tag color="blue">Last 6 months</Tag>}
          >
            {monthlyCollection.length > 0 ? (
              <div style={{ height: 300 }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            ) : (
              <Empty description="No collection data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={<Text strong>Room Occupancy</Text>}
            bordered={false}
            style={{ borderRadius: 12, height: '100%' }}
          >
            {stats.total_rooms > 0 ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: 180, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut data={occupancyData} options={occupancyOptions} />
                </div>
                <div style={{ position: 'relative', marginTop: -130, marginBottom: 80 }}>
                  <Title level={2} style={{ margin: 0, color: '#0d6e3f' }}>{stats.occupancy_rate || 0}%</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>Occupancy</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 }}>
                  <Space size={4}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#0d6e3f' }} />
                    <Text style={{ fontSize: 12 }}>Occupied ({stats.occupied_rooms || 0})</Text>
                  </Space>
                  <Space size={4}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#1890ff' }} />
                    <Text style={{ fontSize: 12 }}>Available ({stats.available_rooms || 0})</Text>
                  </Space>
                  {(stats.maintenance_rooms || 0) > 0 && (
                    <Space size={4}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#faad14' }} />
                      <Text style={{ fontSize: 12 }}>Maint. ({stats.maintenance_rooms})</Text>
                    </Space>
                  )}
                </div>
              </div>
            ) : (
              <Empty description="No rooms yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Text strong>Expiring Soon</Text>
                {expiringSoon.length > 0 && <Tag color="orange">{expiringSoon.length}</Tag>}
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: expiringSoon.length === 0 ? 24 : '0 24px' } }}
          >
            <List
              dataSource={expiringSoon}
              locale={{ emptyText: <Empty description="No expiring rents" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              renderItem={(item) => (
                <List.Item style={{ padding: '12px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#faad14' }} icon={<ClockCircleOutlined />} size={36} />}
                    title={<Text style={{ fontSize: 13 }}>{item.tenant_name}</Text>}
                    description={
                      <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.room_name}</Text>
                        <Text style={{ fontSize: 12, color: '#faad14' }}>
                          <ClockCircleOutlined /> {item.days_remaining} days remaining &middot; <CurrencyDisplay amount={item.amount} />
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Text strong>Overdue Rent</Text>
                {overdue.length > 0 && <Tag color="red">{overdue.length}</Tag>}
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12 }}
            styles={{ body: { padding: overdue.length === 0 ? 24 : '0 24px' } }}
          >
            <List
              dataSource={overdue}
              locale={{ emptyText: <Empty description="No overdue rent" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              renderItem={(item) => (
                <List.Item style={{ padding: '12px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#ff4d4f' }} icon={<WarningOutlined />} size={36} />}
                    title={<Text style={{ fontSize: 13 }}>{item.tenant_name}</Text>}
                    description={
                      <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.room_name}</Text>
                        <Text style={{ fontSize: 12, color: '#ff4d4f' }}>
                          <WarningOutlined /> {item.days_overdue} days overdue &middot; <CurrencyDisplay amount={item.amount} />
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {recentPayments.length > 0 && (
        <Card
          title={<Text strong>Recent Payments</Text>}
          bordered={false}
          style={{ borderRadius: 12, marginTop: 16 }}
        >
          <Table
            dataSource={recentPayments}
            columns={paymentColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      <ReceiptModal
        receiptId={viewReceiptId}
        open={!!viewReceiptId}
        onClose={() => setViewReceiptId(null)}
      />

      {housePerformance.length > 0 && (
        <Card
          title={<Text strong>House Performance</Text>}
          bordered={false}
          style={{ borderRadius: 12, marginTop: 16 }}
        >
          <Row gutter={[16, 16]}>
            {housePerformance.map((house) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={house.id}>
                <Card
                  size="small"
                  style={{ borderRadius: 8, cursor: 'pointer' }}
                  styles={{ body: { padding: 16 } }}
                  onClick={() => navigate(`/owner/houses/${house.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text strong style={{ fontSize: 14 }}>{house.name}</Text>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {house.occupied_rooms}/{house.total_rooms} rooms occupied
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {house.available_rooms} available &middot; {house.occupied_rooms} occupied
                        </Text>
                      </div>
                    </div>
                    <Progress
                      type="circle"
                      percent={house.occupancy_rate}
                      size={48}
                      strokeColor={house.occupancy_rate >= 80 ? '#0d6e3f' : house.occupancy_rate >= 50 ? '#faad14' : '#f5222d'}
                      format={(p) => <span style={{ fontSize: 11 }}>{p}%</span>}
                    />
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Collected</Text>
                      <div><Text strong style={{ fontSize: 13, color: '#0d6e3f' }}>TZS {Number(house.collected).toLocaleString()}</Text></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Expected</Text>
                      <div><Text style={{ fontSize: 13 }}>TZS {Number(house.expected).toLocaleString()}</Text></div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  )
}