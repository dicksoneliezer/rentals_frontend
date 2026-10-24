import { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Typography, Skeleton, Descriptions, Space } from 'antd'
import { HomeOutlined, CalendarOutlined, WalletOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as tenantApi from '../../api/tenant'
import PageHeader from '../../components/common/PageHeader'
import CurrencyDisplay from '../../components/common/CurrencyDisplay'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'

const { Title, Text } = Typography

export default function MyRoom() {
  const [room, setRoom] = useState(null)
  const [rental, setRental] = useState(null)
  const [balance, setBalance] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await tenantApi.getMyRoom()
        const data = res.data.data || res.data || {}
        setRoom(data.room || data.currentRoom || null)
        setRental(data.rental || null)
        setBalance(data.balance || null)
        setHistory(Array.isArray(data.history) ? data.history : [])
      } catch {
        // silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 0 }}>
        <Skeleton active paragraph={{ rows: 0 }} />
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}><Card><Skeleton active paragraph={{ rows: 5 }} /></Card></Col>
          <Col xs={24} lg={12}><Card><Skeleton active paragraph={{ rows: 5 }} /></Card></Col>
        </Row>
        <Card style={{ marginTop: 16 }}><Skeleton active paragraph={{ rows: 6 }} /></Card>
      </div>
    )
  }

  const currentRental = rental || room?.rental || {}
  const historyRows = history

  const historyColumns = [
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => {
        const start = record.period_start || record.start_date
        return start ? dayjs(start).format('MMMM YYYY') : '-'
      },
      sorter: (a, b) => new Date(a.period_start || a.start_date) - new Date(b.period_start || b.start_date),
      defaultSortOrder: 'descend',
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
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (val) => (val ? dayjs(val).format('MMM D, YYYY') : '-'),
    },
  ]

  return (
    <div>
      <PageHeader title="My Room" subtitle="View your current room and rental details" />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <HomeOutlined />
                <span>Room Details</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            {room?.name ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Room">
                  <Text strong>{room.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="House">
                  {room.house?.name || room.house_name || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Monthly Rent">
                  <CurrencyDisplay amount={room.rent_amount} />
                </Descriptions.Item>
                <Descriptions.Item label="Due Day">
                  {room.due_day ? `Every ${room.due_day}${getOrdinal(room.due_day)} of the month` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <StatusBadge status={currentRental.status || 'active'} />
                </Descriptions.Item>
                <Descriptions.Item label="Rental Period">
                  {currentRental.start_date
                    ? `${dayjs(currentRental.start_date).format('MMM D, YYYY')} - ${currentRental.end_date ? dayjs(currentRental.end_date).format('MMM D, YYYY') : 'Ongoing'}`
                    : '-'}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <EmptyState title="No Room Assigned" description="You don't have a room assigned yet." />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <WalletOutlined />
                <span>Current Balance</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            {balance ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Expected Rent This Period">
                  <CurrencyDisplay amount={balance.expected_amount} />
                </Descriptions.Item>
                <Descriptions.Item label="Amount Paid">
                  <Text style={{ color: '#52c41a' }}>
                    <CurrencyDisplay amount={balance.paid_amount} />
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Remaining Balance">
                  <Text style={{ color: balance.balance > 0 ? '#f5222d' : '#52c41a' }}>
                    <CurrencyDisplay amount={balance.balance} />
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <StatusBadge status={balance.status || 'unpaid'} />
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <EmptyState title="No Balance Data" description="Balance information will appear here." />
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>Rent History</span>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 8, marginTop: 16 }}
      >
        {historyRows.length === 0 && !loading ? (
          <EmptyState title="No Rent History" description="Your rent history will appear here." />
        ) : (
          <Table
            columns={historyColumns}
            dataSource={historyRows}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} periods` }}
          />
        )}
      </Card>
    </div>
  )
}

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
