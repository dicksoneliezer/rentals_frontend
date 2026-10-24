import { useEffect, useState } from 'react'
import { message } from 'antd'
import * as receiptsApi from '../../api/receipts'
import ReceiptDetail from '../../pages/owner/receipts/ReceiptDetail'

export default function ReceiptModal({ receiptId, open, onClose }) {
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !receiptId) return
    let cancelled = false
    setLoading(true)
    receiptsApi
      .getById(receiptId)
      .then((res) => {
        if (!cancelled) setReceipt(res.data?.data ?? res.data)
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load receipt')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, receiptId])

  const handleClose = () => {
    setReceipt(null)
    onClose?.()
  }

  return <ReceiptDetail receipt={receipt} loading={loading && !receipt} onClose={handleClose} />
}