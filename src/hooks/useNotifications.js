import { useState, useEffect, useCallback } from 'react'
import * as notificationsApi from '../api/notifications'

export default function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchCount = useCallback(async () => {
    try {
      const res = await notificationsApi.getUnreadCount()
      const data = res.data.data || res.data
      setUnreadCount(typeof data === 'number' ? data : data.count || 0)
    } catch {
      setUnreadCount(0)
    }
  }, [])

  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [fetchCount])

  return { unreadCount, refresh: fetchCount }
}
