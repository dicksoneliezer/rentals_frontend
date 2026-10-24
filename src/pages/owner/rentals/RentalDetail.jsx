import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Row, Col, Table, Button, Popconfirm, Card, Descriptions, Space, message } from 'antd'
import { PlusOutlined, StopOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as rentalsApi from '../../../api/rentals'
import PageHeader from '../../../components/common/PageHeader'
import StatsCard from '../../../components/common/StatsCard'
import StatusBadge from '../../../components/common/StatusBadge'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'
import EmptyState from '../../../components/common/EmptyState'

export default function RentalDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [rental, setRental] = useState(null)
  const [charges, setCharges] = useState([])
  const [loading, setLoading] = useState(true)
  const [chargesLoading, setChargesLoading] = useState(true)

  const fetchRental = () => {
    setLoading(true)
    rentalsApi
      .getById(id)
      .then((res) => setRental(res.data.data || res.data))
      .catch(() => message.error('Failed to load rental'))
      .finally(() => setLoading(false))
  }

  const fetchCharges = () => {
    setChargesLoading(true)
    rentalsApi
      .getCharges(id)
      .then((res) => {
        const data = res.data.data || res.data
        setCharges(Array.isArray(data) ? data : data.charges || [])
      })
      .catch(() => setCharges([]))
      .finally(() => setChargesLoading(false))
  }

  useEffect(() => {
    fetchRental()
    fetchCharges()
  }, [id])

  const handleTerminate = async () => {
    try {
      await rentalsApi.terminate(id)
      message.success('Rental terminated')
      fetchRental()
      fetchCharges()
    } catch {
      message.error('Failed to terminate rental')
    }
  }

  const handleRenew = async () => {
    try {
      const nextStart = rental?.end_date
        ? dayjs(rental.end_date).add(1, 'day').format('YYYY-MM-DD')
        : dayjs().add(1, 'day').format('YYYY-MM-DD')
      await rentalsApi.renew(id, {
        start_date: nextStart,
        period_months: rental?.period_months || 1,
        rent_amount: rental?.rent_amount ?? rental?.room?.rent_amount ?? undefined,
      })
      message.success('Rental renewed for next period')
      fetchRental()
      fetchCharges()
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to renew rental')
    }
  }

  const chargeColumns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (val) => (val ? dayjs(val).format('MMM D, YYYY') : '-'),
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
      render: (_, record) => {
        const bal = (record.expected_amount || 0) - (record.paid_amount || 0)
        return <CurrencyDisplay amount={bal} />
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
  ]

  const tenant = rental?.tenant || {}
  const room = rental?.room || {}
  const house = room.house || {}

  return (
    <div>
      <PageHeader
        title={`${tenant.full_name || 'Rental Detail'}`}
        subtitle={`${room.name || ''} ${house.name ? `(${house.name})` : ''}`}
        onBack={() => navigate('/owner/rentals')}
        extra={
          <Space>
            {rental?.status !== 'terminated' && (
              <Popconfirm
                title="Terminate this rental?"
                onConfirm={handleTerminate}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<StopOutlined />}>Terminate</Button>
              </Popconfirm>
            )}
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <StatsCard
            title="Rent Amount"
            value={<CurrencyDisplay amount={rental?.rent_amount} />}
            icon={<span style={{ fontSize: 24 }}>💰</span>}
            color="#1890ff"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatsCard
            title="Period"
            value={rental?.period_months ? `${rental.period_months} month(s)` : '-'}
            icon={<span style={{ fontSize: 24 }}>📅</span>}
            color="#722ed1"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatsCard
            title="Due Day"
            value={rental?.due_day || '-'}
            icon={<span style={{ fontSize: 24 }}>📆</span>}
            color="#faad14"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatsCard
            title="Balance"
            value={<CurrencyDisplay amount={rental?.balance} />}
            icon={<span style={{ fontSize: 24 }}>📊</span>}
            color={rental?.balance > 0 ? '#ff4d4f' : '#52c41a'}
          />
        </Col>
      </Row>

      {rental && (
        <Card style={{ marginBottom: 24 }}>
          <Descriptions bordered size="small" column={3}>
            <Descriptions.Item label="Status">
              <StatusBadge status={rental.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {rental.start_date ? dayjs(rental.start_date).format('MMM D, YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {rental.end_date ? dayjs(rental.end_date).format('MMM D, YYYY') : 'Ongoing'}
            </Descriptions.Item>
            <Descriptions.Item label="Deposit">
              <CurrencyDisplay amount={rental.deposit_amount} />
            </Descriptions.Item>
            <Descriptions.Item label="Tenant">
              <a onClick={() => navigate(`/owner/tenants/${tenant.id}`)}>{tenant.full_name}</a>
            </Descriptions.Item>
            <Descriptions.Item label="Room">
              <a onClick={() => navigate(`/owner/rooms/${room.id}`)}>{room.name}</a>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Rent Charges</h3>
        {rental?.status === 'active' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleRenew}>
            Generate Next Charge
          </Button>
        )}
      </div>

      {!chargesLoading && charges.length === 0 ? (
        <EmptyState title="No Rent Charges" description="Charges will appear here." />
      ) : (
        <Table
          columns={chargeColumns}
          dataSource={charges}
          rowKey="id"
          loading={chargesLoading}
          pagination={charges.length > 10 ? { pageSize: 10 } : false}
        />
      )}
    </div>
  )
}
