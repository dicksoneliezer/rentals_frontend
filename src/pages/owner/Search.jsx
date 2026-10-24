import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Tabs, List, Tag, Spin, Typography } from 'antd'
import { SearchOutlined, UserOutlined, HomeOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons'
import * as searchApi from '../../api/search'
import PageHeader from '../../components/common/PageHeader'
import EmptyState from '../../components/common/EmptyState'
import CurrencyDisplay from '../../components/common/CurrencyDisplay'

const { Text } = Typography

const typeIcons = {
  tenant: <UserOutlined style={{ color: '#1890ff' }} />,
  room: <HomeOutlined style={{ color: '#722ed1' }} />,
  house: <TeamOutlined style={{ color: '#52c41a' }} />,
  payment: <DollarOutlined style={{ color: '#faad14' }} />,
}

const typeColors = {
  tenant: 'blue',
  room: 'purple',
  house: 'green',
  payment: 'gold',
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const doSearch = async (tab = activeTab) => {
    if (!query.trim()) return
    setLoading(true)
    try {
      let normalized = []
      if (tab === 'all') {
        const res = await searchApi.globalSearch(query)
        const data = (res.data && (res.data.data || res.data)) || {}
        const groups = ['tenants', 'rooms', 'houses', 'payments']
        groups.forEach((group) => {
          const items = Array.isArray(data[group]) ? data[group] : []
          items.forEach((item) => {
            normalized.push(item && item.type ? item : { ...item, type: group === 'tenants' ? 'tenant' : group.slice(0, -1) })
          })
        })
      } else {
        const res = await searchApi[tab](query)
        let data = (res.data && res.data.data) || res.data
        if (data && !Array.isArray(data) && Array.isArray(data.data)) data = data.data
        const type = tab === 'tenants' ? 'tenant' : tab.slice(0, -1)
        ;(Array.isArray(data) ? data : []).forEach((item) => {
          normalized.push(item && item.type ? item : { ...item, type })
        })
      }
      setResults(normalized)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (query.trim()) doSearch(tab)
  }

  const filteredResults = activeTab === 'all'
    ? results
    : results.filter((r) => r.type === activeTab || r.model === activeTab)

  const getResultLink = (item) => {
    const type = item.type || item.model
    const id = item.id
    switch (type) {
      case 'tenant': return `/owner/tenants/${id}`
      case 'room': return `/owner/rooms/${id}`
      case 'house': return `/owner/houses/${id}`
      case 'payment': return `/owner/payments`
      default: return '#'
    }
  }

  return (
    <div>
      <PageHeader title="Search" />
      <Input
        size="large"
        placeholder="Search tenants, rooms, houses, payments..."
        prefix={<SearchOutlined />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onPressEnter={() => doSearch()}
        style={{ marginBottom: 24 }}
        allowClear
      />
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          { key: 'all', label: 'All' },
          { key: 'tenants', label: 'Tenants' },
          { key: 'rooms', label: 'Rooms' },
          { key: 'houses', label: 'Houses' },
          { key: 'payments', label: 'Payments' },
        ]}
      />
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : !query.trim() ? (
        <EmptyState title="Search" description="Enter a search query to find tenants, rooms, houses, or payments." />
      ) : filteredResults.length === 0 ? (
        <EmptyState title="No Results" description={`No results found for "${query}"`} />
      ) : (
        <List
          dataSource={filteredResults}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '12px 16px' }}
              onClick={() => navigate(getResultLink(item))}
            >
              <List.Item.Meta
                avatar={typeIcons[item.type || item.model] || <SearchOutlined />}
                title={
                  <span>
                    {item.name || item.full_name || item.receipt_number || 'Result'}
                    <Tag color={typeColors[item.type || item.model]} style={{ marginLeft: 8 }}>
                      {(item.type || item.model || 'unknown').toUpperCase()}
                    </Tag>
                  </span>
                }
                description={
                  <span>
                    {item.address || item.phone || item.payment_method || ''}
                    {item.amount != null && (
                      <span style={{ marginLeft: 8 }}>
                        <CurrencyDisplay amount={item.amount} />
                      </span>
                    )}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )
}
