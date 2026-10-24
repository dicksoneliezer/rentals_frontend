import { useState, useEffect } from 'react'
import { List, Button, Badge, Typography, Empty, Space, message } from 'antd'
import {
  ClockCircleOutlined,
  WarningOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import * as notificationsApi from '../../api/notifications'
import PageHeader from '../../components/common/PageHeader'
import EmptyState from '../../components/common/EmptyState'

const { Text } = Typography

dayjs.extend(relativeTime)

const typeConfig = {
  rent_expiring: { icon: <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: 20 }} />, color: '#fff7e6' },
  rent_due: { icon: <WarningOutlined style={{ color: '#faad14', fontSize: 20 }} />, color: '#fffbe6' },
  rent_overdue: { icon: <AlertOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />, color: '#fff2f0' },
  payment_received: { icon: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />, color: '#f6ffed' },
  owner_rent_expiring: { icon: <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: 20 }} />, color: '#fff7e6' },
  owner_rent_due: { icon: <WarningOutlined style={{ color: '#faad14', fontSize: 20 }} />, color: '#fffbe6' },
  owner_payment_received: { icon: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />, color: '#f6ffed' },
  system: { icon: <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />, color: '#e6f7ff' },
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = () => {
    setLoading(true)
    notificationsApi
      .getAll()
      .then((res) => {
        const data = res.data.data || res.data
        setNotifications(Array.isArray(data) ? data : data.notifications || [])
      })
      .catch(() => message.error('Failed to load notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try {
      await notificationsApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      message.success('All notifications marked as read')
    } catch {
      message.error('Failed to mark notifications')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await notificationsApi.markRead(notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        )
      } catch {
        // ignore
      }
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div>
      <PageHeader
        title="Notifications"
        extra={
          unreadCount > 0 && (
            <Button onClick={handleMarkAllRead} loading={markingAll}>
              Mark All Read
            </Button>
          )
        }
      />
      {!loading && notifications.length === 0 ? (
        <EmptyState title="No Notifications" description="You're all caught up!" />
      ) : (
        <List
          loading={loading}
          dataSource={notifications}
          renderItem={(item) => {
            const config = typeConfig[item.type] || typeConfig.system
            return (
              <List.Item
                style={{
                  cursor: 'pointer',
                  backgroundColor: item.is_read ? 'transparent' : '#f6f8fa',
                  padding: '16px',
                  borderRadius: 8,
                  marginBottom: 4,
                }}
                onClick={() => handleClick(item)}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: config.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {config.icon}
                    </div>
                  }
                  title={
                    <Space>
                      <Text strong={!item.is_read}>{item.title || item.type}</Text>
                      {!item.is_read && <Badge status="processing" />}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary">{item.message || item.body}</Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.created_at ? dayjs(item.created_at).fromNow() : ''}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )
          }}
        />
      )}
    </div>
  )
}
