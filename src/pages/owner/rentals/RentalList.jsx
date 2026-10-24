import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Space, Select, Popconfirm, message } from 'antd'
import { PlusOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as rentalsApi from '../../../api/rentals'
import PageHeader from '../../../components/common/PageHeader'
import StatusBadge from '../../../components/common/StatusBadge'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'
import EmptyState from '../../../components/common/EmptyState'

export default function RentalList() {
  const navigate = useNavigate()
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchRentals = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, per_page: pagination.pageSize }
      if (statusFilter) params.status = statusFilter
      const res = await rentalsApi.getAll(params)
      const data = res.data.data || res.data
      setRentals(Array.isArray(data) ? data : data.rentals || [])
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: data.total || (Array.isArray(data) ? data.length : 0),
      }))
    } catch {
      message.error('Failed to load rentals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRentals()
  }, [statusFilter])

  const handleTerminate = async (id) => {
    try {
      await rentalsApi.terminate(id)
      message.success('Rental terminated')
      fetchRentals(pagination.current)
    } catch {
      message.error('Failed to terminate rental')
    }
  }

  const columns = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => {
        const tenant = record.tenant || {}
        return (
          <a onClick={() => navigate(`/owner/tenants/${tenant.id}`)}>
            {tenant.full_name || record.tenant_name || '-'}
          </a>
        )
      },
    },
    {
      title: 'House',
      key: 'house',
      render: (_, record) => {
        const house = record.room?.house || {}
        return house.name || record.house_name || '-'
      },
    },
    {
      title: 'Room',
      key: 'room',
      render: (_, record) => {
        const room = record.room || {}
        return (
          <a onClick={() => navigate(`/owner/rooms/${room.id}`)}>
            {room.name || record.room_name || '-'}
          </a>
        )
      },
    },
    {
      title: 'Amount',
      dataIndex: 'rent_amount',
      key: 'rent_amount',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (val) => (val ? dayjs(val).format('MMM D, YYYY') : '-'),
    },
    {
      title: 'Due Day',
      dataIndex: 'due_day',
      key: 'due_day',
      align: 'center',
      render: (val) => val || '-',
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/owner/rentals/${record.id}`)}
          />
          {record.status !== 'terminated' && (
            <Popconfirm
              title="Terminate this rental?"
              onConfirm={() => handleTerminate(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" size="small" danger icon={<StopOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Rentals"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/owner/rentals/new')}
          >
            New Rental
          </Button>
        }
      />
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Filter by status"
          allowClear
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'expiring_soon', label: 'Expiring Soon' },
            { value: 'expired', label: 'Expired' },
            { value: 'terminated', label: 'Terminated' },
          ]}
        />
      </Space>
      {!loading && rentals.length === 0 ? (
        <EmptyState title="No Rentals" description="Create a new rental to get started." />
      ) : (
        <Table
          columns={columns}
          dataSource={rentals}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} rentals`,
            onChange: (page) => fetchRentals(page),
          }}
        />
      )}
    </div>
  )
}
