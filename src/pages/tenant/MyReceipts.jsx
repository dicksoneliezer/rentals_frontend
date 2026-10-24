import { useState, useEffect } from 'react'
import { Table, Modal, Button, Space, Spin, message } from 'antd'
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as tenantApi from '../../api/tenant'
import * as receiptsApi from '../../api/receipts'
import PageHeader from '../../components/common/PageHeader'
import CurrencyDisplay from '../../components/common/CurrencyDisplay'
import EmptyState from '../../components/common/EmptyState'
import ReceiptView from '../../components/common/ReceiptView'

export default function MyReceipts() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [viewingReceipt, setViewingReceipt] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const fetchReceipts = async (page = 1) => {
    setLoading(true)
    try {
      const res = await tenantApi.getMyReceipts({ page, per_page: pagination.pageSize })
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
      const res = await tenantApi.getMyReceiptById(record.id)
      setViewingReceipt(res.data.data || res.data)
    } catch {
      message.error('Failed to load receipt')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!viewingReceipt?.id) return
    setDownloading(true)
    try {
      const res = await receiptsApi.download(viewingReceipt.id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `receipt-${viewingReceipt.receipt_number || viewingReceipt.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      message.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const columns = [
    {
      title: 'Receipt No',
      dataIndex: 'receipt_number',
      key: 'receipt_number',
      render: (text, record) => <a onClick={() => handleViewReceipt(record)}>{text}</a>,
    },
    {
      title: 'Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (val) => (val ? dayjs(val).format('MMM D, YYYY') : '-'),
      sorter: (a, b) => new Date(a.payment_date) - new Date(b.payment_date),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Amount Paid',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Rent Period',
      dataIndex: 'rent_period',
      key: 'rent_period',
      render: (val) => val || '-',
    },
    {
      title: 'Balance After',
      dataIndex: 'balance_after',
      key: 'balance_after',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Room',
      key: 'room',
      render: (_, record) => record.room?.name || record.room_name || '-',
    },
  ]

  return (
    <div>
      <PageHeader title="My Receipts" subtitle="View your payment receipts" />

      {!loading && receipts.length === 0 ? (
        <EmptyState title="No Receipts" description="No receipts yet." />
      ) : (
        <Table
          columns={columns}
          dataSource={receipts}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({ onClick: () => handleViewReceipt(record), style: { cursor: 'pointer' } })}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} receipts`,
            onChange: (page) => fetchReceipts(page),
          }}
        />
      )}

      <Modal
        open={!!viewingReceipt || detailLoading}
        title="Receipt Details"
        onCancel={() => setViewingReceipt(null)}
        width={600}
        footer={
          viewingReceipt ? (
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleDownload} loading={downloading}>
                Download
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                Print
              </Button>
              <Button onClick={() => setViewingReceipt(null)}>Close</Button>
            </Space>
          ) : null
        }
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : viewingReceipt ? (
          <ReceiptView receipt={viewingReceipt} />
        ) : null}
      </Modal>
    </div>
  )
}
