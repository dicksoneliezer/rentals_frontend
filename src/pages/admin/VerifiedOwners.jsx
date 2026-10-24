import { useEffect, useState } from 'react'
import {
  Table,
  Card,
  Input,
  Tag,
  Space,
  Button,
  Typography,
  message,
} from 'antd'
import { SearchOutlined, ReloadOutlined, FileSearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getOwnerVerifications, fetchVerificationDocument } from '../../api/admin'
import PageHeader from '../../components/common/PageHeader'

const { Text } = Typography

const DOC_TYPES = [
  { type: 'national_id', label: 'National ID' },
  { type: 'ownership_proof', label: 'Ownership proof' },
]

/**
 * Read-only register of owners whose identity/ownership documents an admin has
 * already approved. The review queue (Owner Verifications) only shows accounts
 * still needing a decision, so this page is where approved owners keep showing
 * up afterwards instead of disappearing from the admin's view.
 */
export default function VerifiedOwners() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true)
    try {
      const res = await getOwnerVerifications({
        page,
        per_page: pageSize,
        status: 'approved',
        search: search || undefined,
      })
      const p = res.data.data
      setRows(p.data)
      setPagination({ current: p.current_page, pageSize: p.per_page, total: p.total })
    } catch {
      message.error('Failed to load verified owners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const openDocument = async (record, type) => {
    const doc = (record.verification_documents || []).find((d) => d.type === type)
    if (!doc) {
      message.info('This document is not on file.')
      return
    }
    try {
      const res = await fetchVerificationDocument(doc.id)
      const blob = new Blob([res.data], { type: doc.mime || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => window.URL.revokeObjectURL(url), 60000)
    } catch {
      message.error('Failed to open the document')
    }
  }

  const columns = [
    {
      title: 'Owner',
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => (
        <div>
          <Text strong>{value}</Text>
          {record.settings?.company_name ? (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.settings.company_name}
              </Text>
            </>
          ) : null}
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.phone}
            {record.email ? ` · ${record.email}` : ''}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'verification_status',
      key: 'verification_status',
      render: () => <Tag color="green">Approved</Tag>,
    },
    {
      title: 'Verified on',
      dataIndex: 'verified_at',
      key: 'verified_at',
      render: (value) => (value ? dayjs(value).format('DD MMM YYYY') : '—'),
    },
    {
      title: 'Houses',
      dataIndex: 'houses_count',
      key: 'houses_count',
      align: 'center',
      render: (value) => value ?? 0,
    },
    {
      title: 'Documents',
      key: 'documents',
      render: (_, record) => (
        <Space size="small" wrap>
          {DOC_TYPES.map((doc) => {
            const uploaded = (record.verification_documents || []).some((d) => d.type === doc.type)
            return (
              <Button
                key={doc.type}
                size="small"
                icon={<FileSearchOutlined />}
                disabled={!uploaded}
                onClick={() => openDocument(record, doc.type)}
              >
                {doc.label}
              </Button>
            )
          })}
        </Space>
      ),
    },
    {
      title: 'Account',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (value) => (value ? <Tag color="blue">Active</Tag> : <Tag>Suspended</Tag>),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Verified Owners"
        subtitle="Owners whose identity and ownership have been approved. New approvals appear here automatically."
      />

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            allowClear
            placeholder="Search name, phone, email or company"
            prefix={<SearchOutlined />}
            onSearch={setSearch}
            style={{ width: 300 }}
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
