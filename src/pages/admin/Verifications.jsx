import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import {
  SearchOutlined,
  ReloadOutlined,
  FileSearchOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  getOwnerVerifications,
  approveOwner,
  rejectOwner,
  fetchVerificationDocument,
} from '../../api/admin'
import PageHeader from '../../components/common/PageHeader'

const { Text } = Typography

const statusColor = {
  unsubmitted: 'default',
  pending: 'gold',
  rejected: 'red',
  approved: 'green',
}

const statusLabel = {
  unsubmitted: 'Not submitted',
  pending: 'Pending review',
  rejected: 'Rejected',
  approved: 'Approved',
}

const DOC_TYPES = [
  { type: 'national_id', label: 'National ID' },
  { type: 'ownership_proof', label: 'Ownership proof' },
]

export default function Verifications() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })

  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')
  const [working, setWorking] = useState(false)

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true)
    try {
      const res = await getOwnerVerifications({
        page,
        per_page: pageSize,
        search: search || undefined,
        status: status || undefined,
      })
      const p = res.data.data
      setRows(p.data)
      setPagination({ current: p.current_page, pageSize: p.per_page, total: p.total })
    } catch {
      message.error('Failed to load owner verifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search])

  const openDocument = async (record, type) => {
    const doc = (record.verification_documents || []).find((d) => d.type === type)
    if (!doc) {
      message.info('This document has not been uploaded.')
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

  const handleApprove = async (record) => {
    setWorking(true)
    try {
      await approveOwner(record.id)
      message.success(`${record.name} verified`)
      fetchData(pagination.current, pagination.pageSize)
    } catch (err) {
      message.error(err?.response?.data?.message || 'Approval failed')
    } finally {
      setWorking(false)
    }
  }

  const handleReject = async () => {
    if (!reason.trim()) {
      message.warning('Please give a reason so the owner can correct it.')
      return
    }
    setWorking(true)
    try {
      await rejectOwner(rejecting.id, reason.trim())
      message.success(`${rejecting.name} was asked to resubmit`)
      setRejecting(null)
      setReason('')
      fetchData(pagination.current, pagination.pageSize)
    } catch (err) {
      message.error(err?.response?.data?.message || 'Rejection failed')
    } finally {
      setWorking(false)
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
      render: (value) => <Tag color={statusColor[value]}>{statusLabel[value] || value}</Tag>,
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
      title: 'Note',
      dataIndex: 'verification_note',
      key: 'verification_note',
      render: (value) => (value ? <Text type="secondary">{value}</Text> : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          <Popconfirm
            title="Approve this owner?"
            description="They will gain full access to list and manage properties."
            onConfirm={() => handleApprove(record)}
            disabled={record.verification_status === 'approved'}
          >
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              disabled={record.verification_status === 'approved'}
            >
              Approve
            </Button>
          </Popconfirm>
          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
            onClick={() => {
              setRejecting(record)
              setReason('')
            }}
            disabled={record.verification_status === 'approved'}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Owner Verifications"
        subtitle="Review identity and ownership documents before owners can list properties. Approved owners move to Verified Owners."
      />

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
            placeholder="Status"
            value={status}
            onChange={setStatus}
            style={{ width: 180 }}
            options={[
              { value: 'pending', label: 'Pending review' },
              { value: 'unsubmitted', label: 'Not submitted' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'approved', label: 'Approved' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchData(pagination.current)}>
            Refresh
          </Button>
          <Button icon={<UserOutlined />} onClick={() => navigate('/admin/verified-owners')}>
            Verified owners
          </Button>
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: (
              <Text type="secondary">
                Nothing needs review right now. Approved owners stay visible under{' '}
                <Button type="link" size="small" onClick={() => navigate('/admin/verified-owners')}>
                  Verified Owners
                </Button>
                .
              </Text>
            ),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={(pag) => fetchData(pag.current, pag.pageSize)}
        />
      </Card>

      <Modal
        title={rejecting ? `Reject ${rejecting.name}?` : 'Reject owner'}
        open={!!rejecting}
        onOk={handleReject}
        onCancel={() => setRejecting(null)}
        confirmLoading={working}
        okText="Reject and request resubmission"
        okButtonProps={{ danger: true }}
        destroyOnHidden
      >
        <Text type="secondary">
          The owner will see this note and can replace their documents and submit again.
        </Text>
        <Input.TextArea
          rows={4}
          style={{ marginTop: 12 }}
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. The ID photo is blurred. Please upload a clear photo of the front of your NIDA card."
        />
      </Modal>
    </div>
  )
}
