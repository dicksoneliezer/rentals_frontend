import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Table, Tag, Button, Select, Space, message, Tooltip } from 'antd'
import { PlusOutlined, LinkOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as contractsApi from '../../../api/contracts'

const STATUS_COLORS = {
  draft: 'default',
  pending_signature: 'processing',
  viewed: 'warning',
  signed: 'success',
  declined: 'error',
  void: 'default',
}

const STATUS_LABELS = {
  draft: 'Draft',
  pending_signature: 'Awaiting signature',
  viewed: 'Viewed',
  signed: 'Signed',
  declined: 'Declined',
  void: 'Voided',
}

export default function ContractList() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { data } = await contractsApi.getAll(status ? { status } : {})
        if (!cancelled) setRows(data.data || [])
      } catch {
        if (!cancelled) message.error('Imeshindwa kupakua mikatataba.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [status])

  const columns = [
    {
      title: 'Contract',
      dataIndex: 'contract_number',
      render: (value, row) => <Link to={`/owner/contracts/${row.id}`}>{value}</Link>,
    },
    { title: 'Tenant', dataIndex: 'tenant' },
    {
      title: 'Property',
      render: (_, row) => [row.house, row.room].filter(Boolean).join(' - '),
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      render: (value, row) => `${row.currency} ${Number(value).toLocaleString()}`,
    },
    {
      title: 'Period',
      render: (_, row) =>
        `${dayjs(row.start_date).format('DD MMM YY')} - ${dayjs(row.end_date).format('DD MMM YY')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value) => <Tag color={STATUS_COLORS[value]}>{STATUS_LABELS[value] || value}</Tag>,
    },
    {
      title: 'Actions',
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/owner/contracts/${row.id}`)}>
            Open
          </Button>
          {!row.signed_at && row.status !== 'void' && row.status !== 'declined' && (
            <Tooltip title="Continue editing this contract">
              <Button size="small" type="link" onClick={() => navigate(`/owner/contracts/${row.id}/edit`)}>
                Edit
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Contracts</h1>
          <p className="text-sm text-gray-500">
            Rental agreements issued to tenants for online signature.
          </p>
        </div>
        <Space>
          <Select
            allowClear
            placeholder="All statuses"
            style={{ width: 180 }}
            value={status}
            onChange={setStatus}
            options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/owner/contracts/new')}>
            New contract
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        size="small"
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 15, hideOnSinglePage: true }}
        locale={{
          emptyText: (
            <div className="py-8 text-center text-gray-500">
              <LinkOutlined className="text-2xl block mb-2" />
              No contracts yet. Create one from a tenancy.
            </div>
          ),
        }}
      />
    </div>
  )
}