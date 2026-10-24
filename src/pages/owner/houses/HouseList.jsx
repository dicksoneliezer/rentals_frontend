import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Input, Space, Progress, Tooltip, Typography, message } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import * as housesApi from '../../../api/houses'
import PageHeader from '../../../components/common/PageHeader'
import StatusBadge from '../../../components/common/StatusBadge'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'
import EmptyState from '../../../components/common/EmptyState'

const { Text } = Typography

export default function HouseList() {
  const navigate = useNavigate()
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchHouses = async (page = 1) => {
    setLoading(true)
    try {
      const res = await housesApi.getAll({ page, per_page: pagination.pageSize, search })
      const data = res.data.data || res.data
      setHouses(Array.isArray(data) ? data : data.houses || [])
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: data.total || (Array.isArray(data) ? data.length : 0),
      }))
    } catch {
      message.error('Failed to load houses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHouses()
  }, [])

  const handleSearch = () => {
    fetchHouses(1)
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => navigate(`/owner/houses/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Rooms',
      dataIndex: 'rooms_count',
      key: 'rooms_count',
      align: 'center',
    },
    {
      title: 'Occupied',
      dataIndex: 'occupied_rooms',
      key: 'occupied_rooms',
      align: 'center',
      render: (val) => <Text style={{ color: '#0d6e3f' }}>{val ?? 0}</Text>,
    },
    {
      title: 'Available',
      dataIndex: 'available_rooms',
      key: 'available_rooms',
      align: 'center',
      render: (val) => <Text style={{ color: '#1890ff' }}>{val ?? 0}</Text>,
    },
    {
      title: 'Maint.',
      dataIndex: 'maintenance_rooms',
      key: 'maintenance_rooms',
      align: 'center',
      render: (val) => (val ? <Text style={{ color: '#faad14' }}>{val}</Text> : '-'),
    },
    {
      title: 'Occupancy',
      dataIndex: 'occupancy_rate',
      key: 'occupancy_rate',
      align: 'center',
      render: (val) => (
        <Tooltip title={`${val ?? 0}% occupied`}>
          <Progress
            type="circle"
            percent={val ?? 0}
            size={40}
            strokeColor={val >= 80 ? '#0d6e3f' : val >= 50 ? '#faad14' : '#f5222d'}
            format={(p) => <span style={{ fontSize: 10 }}>{p}%</span>}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Monthly Rent',
      dataIndex: 'total_monthly_rent',
      key: 'total_monthly_rent',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Outstanding',
      dataIndex: 'total_outstanding',
      key: 'total_outstanding',
      render: (val) => (val > 0 ? <Text style={{ color: '#f5222d' }}><CurrencyDisplay amount={val} /></Text> : <Text type="secondary">-</Text>),
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
            onClick={() => navigate(`/owner/houses/${record.id}`)}
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/owner/houses/${record.id}/edit`)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Houses"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/owner/houses/new')}
          >
            Add House
          </Button>
        }
      />
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search houses..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
          allowClear
        />
        <Button onClick={handleSearch}>Search</Button>
      </Space>
      {!loading && houses.length === 0 ? (
        <EmptyState title="No Houses" description="Add your first house to get started." />
      ) : (
        <Table
          columns={columns}
          dataSource={houses}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} houses`,
            onChange: (page) => fetchHouses(page),
          }}
        />
      )}
    </div>
  )
}
