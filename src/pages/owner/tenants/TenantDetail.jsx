import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Row, Col, Card, Table, Tabs, Typography, Button, Tag, message, Modal, Popconfirm, Space } from 'antd'
import { EditOutlined, PhoneOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as tenantsApi from '../../../api/tenants'
import PageHeader from '../../../components/common/PageHeader'
import StatsCard from '../../../components/common/StatsCard'
import StatusBadge from '../../../components/common/StatusBadge'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'
import EmptyState from '../../../components/common/EmptyState'

const { Text } = Typography

export default function TenantDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [tenant, setTenant] = useState(null)
  const [rentals, setRentals] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [rentalsLoading, setRentalsLoading] = useState(true)
  const [paymentsLoading, setPaymentsLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    tenantsApi
      .getById(id)
      .then((res) => setTenant(res.data.data || res.data))
      .catch(() => message.error('Failed to load tenant'))
      .finally(() => setLoading(false))

    setRentalsLoading(true)
    tenantsApi
      .getRentals(id)
      .then((res) => {
        const data = res.data.data || res.data
        setRentals(Array.isArray(data) ? data : data.rentals || [])
      })
      .catch(() => setRentals([]))
      .finally(() => setRentalsLoading(false))

    setPaymentsLoading(true)
    tenantsApi
      .getPayments(id)
      .then((res) => {
        const data = res.data.data || res.data
        setPayments(Array.isArray(data) ? data : data.payments || [])
      })
      .catch(() => setPayments([]))
      .finally(() => setPaymentsLoading(false))
  }, [id])

  const rentalColumns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (val) => val || '-',
    },
    {
      title: 'House / Room',
      key: 'house_room',
      render: (_, record) => {
        const room = record.room || {}
        const house = room.house || {}
        return `${house.name || record.house_name || '-'} / ${room.name || record.room_name || '-'}`
      },
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
  ]

  const paymentColumns = [
    {
      title: 'Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (val) => (val ? dayjs(val).format('MMM D, YYYY') : '-'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (val) => val ? <Tag>{val.replace(/_/g, ' ').toUpperCase()}</Tag> : '-',
    },
    {
      title: 'Receipt',
      dataIndex: 'receipt_number',
      key: 'receipt_number',
      render: (val) => val || '-',
    },
  ]

  const currentRoom = tenant?.current_room || tenant?.room

  const handleResetPassword = async () => {
    try {
      const res = await tenantsApi.resetPassword(id)
      const data = res?.data?.data || {}
      Modal.success({
        title: 'Password reset',
        content: data.sms_sent ? (
          <div>
            <p>
              A new temporary password has been <strong>sent to {tenant?.full_name} via SMS</strong>.
            </p>
            <p>
              {tenant?.full_name} will be asked to set a new password at next login.
            </p>
          </div>
        ) : (
          <div>
            <p>
              Share this temporary password with <strong>{tenant?.full_name}</strong>. They will be asked
              to set a new password at next login.
            </p>
            <Text type="secondary">Temporary password</Text>
            <div style={{ marginTop: 4, marginBottom: 8 }}>
              <Text copyable strong style={{ fontSize: 18 }}>
                {data.temporary_password}
              </Text>
            </div>
          </div>
        ),
      })
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to reset password')
    }
  }

  return (
    <div>
      <PageHeader
        title={tenant?.full_name || 'Tenant Detail'}
        subtitle={tenant?.phone}
        onBack={() => navigate('/owner/tenants')}
        extra={
          <Space>
            <Popconfirm
              title="Reset this tenant's password?"
              description="A new temporary password will be generated. The tenant must change it on next login."
              okText="Reset Password"
              onConfirm={handleResetPassword}
            >
              <Button icon={<KeyOutlined />}>Reset Password</Button>
            </Popconfirm>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/owner/tenants/${id}/edit`)}
            >
              Edit
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <StatsCard
            title="Current Room"
            value={currentRoom ? `${currentRoom.name}${currentRoom.house?.name ? ` (${currentRoom.house.name})` : ''}` : 'None'}
            icon={<span style={{ fontSize: 24 }}>🏠</span>}
            color="#1890ff"
          />
        </Col>
        <Col xs={12} sm={8}>
          <StatsCard
            title="Total Paid"
            value={<CurrencyDisplay amount={tenant?.total_paid} />}
            icon={<span style={{ fontSize: 24 }}>💰</span>}
            color="#52c41a"
          />
        </Col>
        <Col xs={12} sm={8}>
          <StatsCard
            title="Balance"
            value={<CurrencyDisplay amount={tenant?.balance} />}
            icon={<span style={{ fontSize: 24 }}>📊</span>}
            color={tenant?.balance > 0 ? '#ff4d4f' : '#52c41a'}
          />
        </Col>
      </Row>

      {tenant && (
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Text type="secondary">Phone</Text>
              <div><Text>{tenant.phone}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary">ID Number</Text>
              <div><Text>{tenant.id_number || '-'}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Email</Text>
              <div><Text>{tenant.email || '-'}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Address</Text>
              <div><Text>{tenant.address || '-'}</Text></div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Emergency Contact</Text>
              <div>
                <Text>
                  {tenant.emergency_contact_name || '-'}
                  {tenant.emergency_contact_phone ? ` (${tenant.emergency_contact_phone})` : ''}
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Status</Text>
              <div><StatusBadge status={tenant.status} /></div>
            </Col>
          </Row>
        </Card>
      )}

      <Tabs
        defaultActiveKey="rentals"
        items={[
          {
            key: 'rentals',
            label: 'Rental History',
            children: !rentalsLoading && rentals.length === 0 ? (
              <EmptyState title="No Rental History" />
            ) : (
              <Table
                columns={rentalColumns}
                dataSource={rentals}
                rowKey="id"
                loading={rentalsLoading}
                pagination={rentals.length > 10 ? { pageSize: 10 } : false}
              />
            ),
          },
          {
            key: 'payments',
            label: 'Payment History',
            children: !paymentsLoading && payments.length === 0 ? (
              <EmptyState title="No Payment History" />
            ) : (
              <Table
                columns={paymentColumns}
                dataSource={payments}
                rowKey="id"
                loading={paymentsLoading}
                pagination={payments.length > 10 ? { pageSize: 10 } : false}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
