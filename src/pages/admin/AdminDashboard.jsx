import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Typography, Spin } from 'antd'
import {
  TeamOutlined,
  HomeOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { getUsers } from '../../api/admin'
import PageHeader from '../../components/common/PageHeader'

const { Text } = Typography

const emptyStats = { total: 0, owners: 0, tenants: 0, admins: 0, suspended: 0 }

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let active = true

    Promise.all([
      getUsers({ per_page: 1 }),
      getUsers({ role: 'owner', per_page: 1 }),
      getUsers({ role: 'tenant', per_page: 1 }),
      getUsers({ role: 'admin', per_page: 1 }),
      getUsers({ status: 'suspended', per_page: 1 }),
    ])
      .then(([all, owners, tenants, admins, suspended]) => {
        if (!active) return
        setStats({
          total: all.data.data.total,
          owners: owners.data.data.total,
          tenants: tenants.data.data.total,
          admins: admins.data.data.total,
          suspended: suspended.data.data.total,
        })
      })
      .catch(() => {
        if (active) setStats(emptyStats)
      })

    return () => {
      active = false
    }
  }, [])

  const cards = [
    { title: 'Total Users', value: stats?.total, icon: <TeamOutlined />, color: '#0a2a4d' },
    { title: 'Owners', value: stats?.owners, icon: <HomeOutlined />, color: '#0d6e3f' },
    { title: 'Tenants', value: stats?.tenants, icon: <UserOutlined />, color: '#1677ff' },
    { title: 'Administrators', value: stats?.admins, icon: <SafetyCertificateOutlined />, color: '#722ed1' },
    { title: 'Suspended', value: stats?.suspended, icon: <StopOutlined />, color: '#cf1322' },
  ]

  return (
    <div>
      <PageHeader
        title="System Administration"
        subtitle="Manage platform accounts, roles and access."
      />

      {!stats ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {cards.map((card) => (
            <Col key={card.title} xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title={card.title}
                  value={card.value}
                  prefix={<span style={{ color: card.color }}>{card.icon}</span>}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Text type="secondary" style={{ display: 'block', marginTop: 24 }}>
        Suspending an account signs the user out immediately and hides any
        listings they own from the public marketplace.
      </Text>
    </div>
  )
}
