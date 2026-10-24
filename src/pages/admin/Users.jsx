import { useEffect, useState } from 'react'
import {
  Table,
  Card,
  Input,
  Select,
  Tag,
  Space,
  Button,
  Typography,
  message,
  Modal,
  Popconfirm,
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  getUsers,
  suspendUser,
  activateUser,
  grantAdmin,
  revokeAdmin,
  resetUserPassword,
} from '../../api/admin'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../hooks/useAuth'

const { Text } = Typography

const roleColor = { owner: 'blue', tenant: 'green', admin: 'purple' }

export default function Users() {
  const { user: currentUser } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState()
  const [status, setStatus] = useState()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true)
    try {
      const res = await getUsers({
        page,
        per_page: pageSize,
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
      })
      const p = res.data.data
      setRows(p.data)
      setPagination({ current: p.current_page, pageSize: p.per_page, total: p.total })
    } catch {
      message.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1)
    // Refetch when a filter changes; search is applied on Enter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, status, search])

  const runAction = async (fn, successMessage) => {
    try {
      const res = await fn()
      message.success(successMessage)
      return res
    } catch (err) {
      message.error(err?.response?.data?.message || 'Action failed')
      return null
    }
  }

  const afterAction = (res) => {
    if (res) fetchData(pagination.current, pagination.pageSize)
  }

  const handleActivate = async (record) =>
    afterAction(await runAction(() => activateUser(record.id), 'Account activated'))

  const handleSuspend = async (record) =>
    afterAction(await runAction(() => suspendUser(record.id), 'Account suspended'))

  const handleGrant = async (record) =>
    afterAction(await runAction(() => grantAdmin(record.id), 'Administrator role granted'))

  const handleRevoke = async (record) =>
    afterAction(await runAction(() => revokeAdmin(record.id), 'Administrator role revoked'))

  const handleReset = async (record) => {
    const res = await runAction(() => resetUserPassword(record.id), 'Password reset')
    if (!res) return
    const temporary = res.data.data?.temporary_password
    if (temporary) {
      Modal.success({
        title: 'Temporary password',
        content: (
          <div>
            <p style={{ marginBottom: 8 }}>
              Share this temporary password with {record.name}. It must be changed at
              their next login.
            </p>
            <Text code copyable style={{ fontSize: 16 }}>
              {temporary}
            </Text>
          </div>
        ),
      })
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => (
        <div>
          <Text strong>{value}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.phone}
            {record.email ? ` · ${record.email}` : ''}
          </Text>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Owner', value: 'owner' },
        { text: 'Tenant', value: 'tenant' },
        { text: 'Admin', value: 'admin' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (value) => <Tag color={roleColor[value]}>{value}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (value) =>
        value ? <Tag color="green">Active</Tag> : <Tag color="red">Suspended</Tag>,
    },
    {
      title: 'Houses',
      dataIndex: 'houses_count',
      key: 'houses_count',
      align: 'center',
      render: (value) => value ?? 0,
    },
    {
      title: 'Last Login',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      render: (value) => (value ? new Date(value).toLocaleString() : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isSelf = record.id === currentUser?.id
        return (
          <Space size="small" wrap>
            {record.is_active ? (
              <Popconfirm
                title="Suspend this account?"
                description="They will be signed out and their listings hidden."
                onConfirm={() => handleSuspend(record)}
                disabled={isSelf}
              >
                <Button size="small" danger disabled={isSelf}>
                  Suspend
                </Button>
              </Popconfirm>
            ) : (
              <Button size="small" type="primary" onClick={() => handleActivate(record)}>
                Activate
              </Button>
            )}

            {record.role === 'admin' ? (
              <Popconfirm
                title="Revoke administrator role?"
                onConfirm={() => handleRevoke(record)}
                disabled={isSelf}
              >
                <Button size="small" disabled={isSelf}>
                  Revoke admin
                </Button>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Grant administrator role?"
                onConfirm={() => handleGrant(record)}
              >
                <Button size="small">Make admin</Button>
              </Popconfirm>
            )}

            <Popconfirm
              title="Reset this user's password?"
              description="A temporary password will be generated and they will be signed out."
              onConfirm={() => handleReset(record)}
              disabled={isSelf}
            >
              <Button size="small" disabled={isSelf}>
                Reset password
              </Button>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Users" subtitle="Browse, suspend and manage platform accounts." />

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            allowClear
            placeholder="Search name, phone or email"
            prefix={<SearchOutlined />}
            onSearch={setSearch}
            style={{ width: 280 }}
          />
          <Select
            allowClear
            placeholder="Role"
            value={role}
            onChange={setRole}
            style={{ width: 140 }}
            options={[
              { value: 'owner', label: 'Owner' },
              { value: 'tenant', label: 'Tenant' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          <Select
            allowClear
            placeholder="Status"
            value={status}
            onChange={setStatus}
            style={{ width: 140 }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchData(pagination.current)}>
            Refresh
          </Button>
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={(pag) => fetchData(pag.current, pag.pageSize)}
        />
      </Card>
    </div>
  )
}
