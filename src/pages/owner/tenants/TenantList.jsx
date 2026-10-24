import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Space, message } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import * as tenantsApi from '../../../api/tenants'
import PageHeader from '../../../components/common/PageHeader'
import StatusBadge from '../../../components/common/StatusBadge'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'
import EmptyState from '../../../components/common/EmptyState'

export default function TenantList() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchTenants = async (page = 1) => {
    setLoading(true)
    try {
      const res = await tenantsApi.getAll({ page, per_page: pagination.pageSize, search })
      const data = res.data.data || res.data
      setTenants(Array.isArray(data) ? data : data.tenants || [])
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: data.total || (Array.isArray(data) ? data.length : 0),
      }))
    } catch {
      message.error('Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  const handleSearch = () => fetchTenants(1)

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text, record) => (
        <a onClick={() => navigate(`/owner/tenants/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'ID Number',
      dataIndex: 'id_number',
      key: 'id_number',
      render: (val) => val || '-',
    },
    {
      title: 'Current Room',
      key: 'current_room',
      render: (_, record) => {
        const room = record.current_room || record.room
        if (!room) return '-'
        return `${room.name}${room.house?.name ? ` (${room.house.name})` : room.house_name ? ` (${room.house_name})` : ''}`
      },
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
            onClick={() => navigate(`/owner/tenants/${record.id}`)}
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/owner/tenants/${record.id}/edit`)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Tenants"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/owner/tenants/new')}
          >
            Add Tenant
          </Button>
        }
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <Input
          placeholder="Search by name, phone, or ID..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          style={{ flex: 1, minWidth: 200, maxWidth: 350 }}
          allowClear
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {!loading && tenants.length === 0 ? (
        <EmptyState title="No Tenants" description="Add your first tenant to get started." />
      ) : (
        <Table
          columns={columns}
          dataSource={tenants}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tenants`,
            onChange: (page) => fetchTenants(page),
          }}
        />
      )}
    </div>
  )
}
