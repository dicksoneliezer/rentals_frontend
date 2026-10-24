import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Card, Result, Space, Spin, message } from 'antd'
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import PageHeader from '../../../components/common/PageHeader'
import ReceiptView from '../../../components/common/ReceiptView'
import * as receiptsApi from '../../../api/receipts'

/**
 * Standalone receipt page backing the /owner/receipts/:id route.
 *
 * The list screen shows receipts in a modal (ReceiptDetail), but a deep link
 * has no props to pass it, so it rendered nothing. This page fetches the
 * receipt by id and renders the same read-only view.
 */
export default function ReceiptPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await receiptsApi.getById(id)
        if (!cancelled) setReceipt(res.data?.data ?? res.data)
      } catch (err) {
        if (cancelled) return
        if (err?.response?.status === 404) setNotFound(true)
        else message.error('Failed to load receipt')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (notFound || !receipt) {
    return (
      <Result
        status="404"
        title="Receipt not found"
        subTitle="This receipt does not exist or is not available to you."
        extra={
          <Button type="primary" onClick={() => navigate('/owner/receipts')} style={{ background: '#0d6e3f' }}>
            Back to Receipts
          </Button>
        }
      />
    )
  }

  return (
    <div>
      <PageHeader
        title={`Receipt ${receipt.receipt_number}`}
        subtitle="Payment receipt details"
        onBack={() => navigate('/owner/receipts')}
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownload} loading={downloading}>
              Download
            </Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              Print
            </Button>
          </Space>
        }
      />
      <Alert
        type="info"
        showIcon
        message="This is a preview. Use Download or Print to produce the signed receipt document."
        style={{ marginBottom: 16 }}
      />
      <Card>
        <ReceiptView receipt={receipt} />
      </Card>
    </div>
  )
}
