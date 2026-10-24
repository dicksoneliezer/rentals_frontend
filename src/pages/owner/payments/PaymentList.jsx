import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, DatePicker, Select, Space, Tag, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as paymentsApi from '../../../api/payments'
import PageHeader from '../../../components/common/PageHeader'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'
import EmptyState from '../../../components/common/EmptyState'
import ReceiptModal from '../../../components/common/ReceiptModal'

const { RangePicker } = DatePicker

export default function PaymentList() {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState(null)
  const [methodFilter, setMethodFilter] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [viewReceiptId, setViewReceiptId] = useState(null)

  const fetchPayments = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, per_page: pagination.pageSize }
      if (dateRange && dateRange[0]) params.from_date = dateRange[0].format('YYYY-MM-DD')
      if (dateRange && dateRange[1]) params.to_date = dateRange[1].format('YYYY-MM-DD')
      if (methodFilter) params.payment_method = methodFilter
      const res = await paymentsApi.getAll(params)
      const data = res.data.data || res.data
      setPayments(Array.isArray(data) ? data : data.payments || [])
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: data.total || (Array.isArray(data) ? data.length : 0),
      }))
    } catch {
      message.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [dateRange, methodFilter])

  const columns = [
    {
      title: 'Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (val) => (val ? dayjs(val).format('MMM D, YYYY') : '-'),
      sorter: (a, b) => new Date(a.payment_date) - new Date(b.payment_date),
    },
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => {
        const tenant = record.tenant || {}
        return tenant.full_name || record.tenant_name || '-'
      },
    },
    {
      title: 'Room',
      key: 'room',
      render: (_, record) => {
        const room = record.rent_charge?.room || record.room || {}
        return room.name || record.room_name || '-'
      },
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
      title: 'Reference',
      dataIndex: 'reference_number',
      key: 'reference_number',
      render: (val) => val || '-',
    },
    {
      title: 'Receipt',
      key: 'receipt',
      render: (_, record) => {
        const receipt = record.receipt
        if (!receipt) return '-'
        return <a onClick={() => setViewReceiptId(receipt.id)}>{receipt.receipt_number}</a>
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Payments"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/owner/payments/new')}
          >
            Record Payment
          </Button>
        }
      />
      <Space style={{ marginBottom: 16 }} wrap>
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          placeholder={['Start Date', 'End Date']}
        />
        <Select
          placeholder="Payment Method"
          allowClear
          style={{ width: 180 }}
          value={methodFilter}
          onChange={(val) => setMethodFilter(val)}
          options={[
            { value: 'cash', label: 'Cash' },
            { value: 'bank_transfer', label: 'Bank Transfer' },
            { value: 'mobile_money', label: 'Mobile Money' },
            { value: 'cheque', label: 'Cheque' },
            { value: 'other', label: 'Other' },
          ]}
        />
      </Space>
      {!loading && payments.length === 0 ? (
        <EmptyState title="No Payments" description="Record your first payment to get started." />
      ) : (
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} payments`,
            onChange: (page) => fetchPayments(page),
          }}
        />
      )}
      <ReceiptModal
        receiptId={viewReceiptId}
        open={!!viewReceiptId}
        onClose={() => setViewReceiptId(null)}
      />
    </div>
  )
}
