import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Typography,
  Space,
  InputNumber,
  Empty,
  Spin,
  message,
} from 'antd'
import {
  SearchOutlined,
  HomeOutlined,
  LoginOutlined,
  DashboardOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import * as listingsApi from '../../api/listings'
import { useAuth } from '../../hooks/useAuth'
import { useBranding } from '../../contexts/BrandingContext'
import ListingCard from '../../components/common/ListingCard'

const { Title, Text, Paragraph } = Typography

export default function Listings() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ownerId = searchParams.get('owner_id')
  const { user, loading: authLoading } = useAuth()
  const { branding, setOwnerScope } = useBranding()
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [minRent, setMinRent] = useState(null)
  const [maxRent, setMaxRent] = useState(null)

  const fetchHouses = async (params = {}) => {
    setLoading(true)
    try {
      const res = await listingsApi.getHouses(ownerId ? { ...params, owner_id: ownerId } : params)
      const data = res.data.data || res.data
      setHouses(Array.isArray(data) ? data : [])
    } catch {
      message.error('Failed to load available rentals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHouses()
  }, [ownerId])

  // A public link may scope the marketplace to one landlord; the shell then
  // carries that landlord's brand instead of the platform default.
  useEffect(() => {
    setOwnerScope(ownerId ? Number(ownerId) : null)
    return () => setOwnerScope(null)
  }, [ownerId, setOwnerScope])

  const handleSearch = () => {
    const params = {}
    if (search) params.search = search
    if (minRent != null) params.min_rent = minRent
    if (maxRent != null) params.max_rent = maxRent
    fetchHouses(params)
  }

  const clearFilters = () => {
    setSearch('')
    setMinRent(null)
    setMaxRent(null)
    fetchHouses()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc' }}>
      <div
        style={{
          background: '#fff',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={branding.mark} alt={branding.name} style={{ height: 36, objectFit: 'contain' }} />
        </Link>
        <Space>
          {!authLoading && user ? (
            <Button
              type="primary"
              icon={<DashboardOutlined />}
              onClick={() => navigate(user.role === 'owner' ? '/owner' : '/tenant')}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </>
          )}
        </Space>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #0d6e3f 0%, #0a2a4d 100%)', padding: '48px 24px', color: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <Title level={1} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
            Find Your Next Home
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 8 }}>
            Browse available rooms and request a rental directly from the owner.
          </Paragraph>
          <Space.Compact style={{ width: '100%', maxWidth: 700, marginTop: 16 }}>
            <Input
              size="large"
              placeholder="Search by house name or location..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
            <InputNumber
              size="large"
              placeholder="Min rent"
              style={{ width: 150 }}
              min={0}
              value={minRent}
              onChange={setMinRent}
            />
            <InputNumber
              size="large"
              placeholder="Max rent"
              style={{ width: 150 }}
              min={0}
              value={maxRent}
              onChange={setMaxRent}
            />
            <Button size="large" type="primary" onClick={handleSearch}>
              Search
            </Button>
          </Space.Compact>
          <div style={{ marginTop: 12 }}>
            <Button type="link" style={{ color: 'rgba(255,255,255,0.85)' }} onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 60px' }}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <HomeOutlined style={{ color: '#0d6e3f', fontSize: 18 }} />
          <Text strong style={{ fontSize: 16 }}>
            {houses.length} house{houses.length === 1 ? '' : 's'} with rooms available
          </Text>
        </Space>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : houses.length === 0 ? (
          <Card style={{ borderRadius: 12 }}>
            <Empty description="No houses match your search right now." />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {houses.map((house) => (
              <Col xs={24} sm={12} lg={8} key={house.id}>
                <ListingCard
                  house={house}
                  onClick={() => navigate(`/listings/${house.id}`)}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>

      <div style={{ background: '#0a2a4d', padding: 24, textAlign: 'center' }}>
        <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
          Contact us on {houses[0]?.contact_info || 'our office'} for more listings.
        </Text>
      </div>
    </div>
  )
}