import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Tag, message } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as receiptsApi from '../../../api/receipts'
import PageHeader from '../../../components/common/PageHeader'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'
import EmptyState from '../../../components/common/EmptyState'
import ReceiptDetail from './ReceiptDetail'

export default function ReceiptList() {
  const navigate = useNavigate()
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [viewingReceipt, setViewingReceipt] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchReceipts = async (page = 1) => {
    setLoading(true)
    try {
      const res = await receiptsApi.getAll({ page, per_page: pagination.pageSize })
      const data = res.data.data || res.data
      setReceipts(Array.isArray(data) ? data : data.receipts || [])
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: data.total || (Array.isArray(data) ? data.length : 0),
      }))
    } catch {
      message.error('Failed to load receipts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReceipts()
  }, [])

  const handleViewReceipt = async (record) => {
    setDetailLoading(true)
    try {
      const res = await receiptsApi.getById(record.id)
      setViewingReceipt(res.data.data || res.data)
    } catch {
      message.error('Failed to load receipt')
    } finally {
      setDetailLoading(false)
    }
  }

  const columns = [
    {
      title: 'Receipt No',
      dataIndex: 'receipt_number',
      key: 'receipt_number',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (val) => (val ? dayjs(val).format('MMM D, YYYY') : '-'),
    },
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => record.tenant?.full_name || record.tenant_name || '-',
    },
    {
      title: 'Room',
      key: 'room',
      render: (_, record) => record.room?.name || record.room_name || '-',
    },
    {
      title: 'House',
      key: 'house',
      render: (_, record) => record.room?.house?.name || record.house_name || '-',
    },
    {
      title: 'Amount',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (val) => val ? <Tag>{val.replace(/_/g, ' ').toUpperCase()}</Tag> : '-',
    },
    {
      title: 'Balance After',
      dataIndex: 'balance_after',
      key: 'balance_after',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewReceipt(record)}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Receipts" />
      {!loading && receipts.length === 0 ? (
        <EmptyState title="No Receipts" description="Receipts will appear here once payments are recorded." />
      ) : (
        <Table
          columns={columns}
          dataSource={receipts}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} receipts`,
            onChange: (page) => fetchReceipts(page),
          }}
        />
      )}
      <ReceiptDetail
        receipt={viewingReceipt}
        loading={detailLoading}
        onClose={() => setViewingReceipt(null)}
      />
    </div>
  )
}
