import { useState } from 'react'
import { Modal, Button, Space, Spin, message } from 'antd'
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import * as receiptsApi from '../../../api/receipts'
import ReceiptView from '../../../components/common/ReceiptView'

export default function ReceiptDetail({ receipt, loading, onClose }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!receipt?.id) return
    setDownloading(true)
    try {
      const res = await receiptsApi.download(receipt.id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `receipt-${receipt.receipt_number || receipt.id}.pdf`)
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

  return (
    <Modal
      open={!!receipt || loading}
      title="Receipt Details"
      onCancel={onClose}
      width={600}
      footer={
        receipt ? (
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownload} loading={downloading}>
              Download
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              Print
            </Button>
            <Button onClick={onClose}>Close</Button>
          </Space>
        ) : null
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : receipt ? (
        <ReceiptView receipt={receipt} />
      ) : null}
    </Modal>
  )
}
