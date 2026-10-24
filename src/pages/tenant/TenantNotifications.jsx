import { useState, useEffect } from 'react'
import { List, Button, Badge, Typography, Space, Empty, message } from 'antd'
import {
  ClockCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  FileProtectOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useNavigate } from 'react-router-dom'
import * as notificationsApi from '../../api/notifications'
import PageHeader from '../../components/common/PageHeader'
import EmptyState from '../../components/common/EmptyState'

dayjs.extend(relativeTime)

const { Text } = Typography

const typeConfig = {
  rent_expiring: { icon: <ClockCircleOutlined />, color: '#fa8c16', bgColor: '#fff7e6' },
  rent_due: { icon: <WarningOutlined />, color: '#faad14', bgColor: '#fffbe6' },
  rent_overdue: { icon: <ExclamationCircleOutlined />, color: '#ff4d4f', bgColor: '#fff2f0' },
  payment_received: { icon: <CheckCircleOutlined />, color: '#52c41a', bgColor: '#f6ffed' },
  system: { icon: <InfoCircleOutlined />, color: '#1890ff', bgColor: '#e6f7ff' },
  contract_signature: {
    icon: <FileProtectOutlined />,
    color: '#722ed1',
    bgColor: '#f9f0ff',
  },
}

// Notices about a contract take the tenant straight to the contract itself
// rather than leaving them to hunt for it.
const notificationLink = (type) =>
  type === 'contract_signature' ? '/tenant/contracts' : null

function getNotificationConfig(type) {
  return typeConfig[type] || typeConfig.system
}

export default function TenantNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await notificationsApi.getAll()
      const data = res.data.data || res.data
      setNotifications(Array.isArray(data) ? data : data.notifications || [])
    } catch {
      message.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkRead = async (id, index) => {
    const notification = notifications[index]
    if (notification?.is_read) return
    try {
      await notificationsApi.markRead(id)
      setNotifications((prev) =>
        prev.map((n, i) => (i === index ? { ...n, is_read: true } : n))
      )
    } catch {
      message.error('Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try {
      await notificationsApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      message.success('All notifications marked as read')
    } catch {
      message.error('Failed to mark all as read')
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div>
      <PageHeader
        title="Notifications"
        extra={
          unreadCount > 0 ? (
            <Button onClick={handleMarkAllRead} loading={markingAll}>
              Mark All Read
            </Button>
          ) : null
        }
      />

      {!loading && notifications.length === 0 ? (
        <EmptyState title="No Notifications" description="You're all caught up!" />
      ) : (
        <List
          loading={loading}
          dataSource={notifications}
          renderItem={(item, index) => {
            const config = getNotificationConfig(item.type)
            const to = notificationLink(item.type)
            return (
              <List.Item
                onClick={() => {
                  handleMarkRead(item.id, index)
                  if (to) navigate(to)
                }}
                style={{
                  cursor: 'pointer',
                  backgroundColor: item.is_read ? 'transparent' : config.bgColor,
                  borderRadius: 8,
                  marginBottom: 8,
                  padding: '12px 16px',
                  border: `1px solid ${item.is_read ? '#f0f0f0' : config.color + '40'}`,
                  transition: 'all 0.2s',
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: config.color + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        color: config.color,
                      }}
                    >
                      {config.icon}
                    </div>
                  }
                  title={
                    <Space>
                      <Text strong={!item.is_read} style={{ color: item.is_read ? undefined : '#000' }}>
                        {item.title || 'Notification'}
                      </Text>
                      {!item.is_read && (
                        <Badge status="processing" color="#1890ff" />
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <Text style={{ display: 'block', color: '#595959' }}>
                        {item.message || item.body || ''}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.created_at ? dayjs(item.created_at).fromNow() : ''}
                      </Text>
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
