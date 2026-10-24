import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Col,
  Divider,
  List,
  Row,
  Space,
  Spin,
  Typography,
} from 'antd'
import {
  LoginOutlined,
  DashboardOutlined,
  HomeOutlined,
  TeamOutlined,
  FileProtectOutlined,
  DollarOutlined,
  BarChartOutlined,
  SearchOutlined,
  UserAddOutlined,
  ShopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import { useBranding } from '../../contexts/BrandingContext'
import * as listingsApi from '../../api/listings'
import ListingCard from '../../components/common/ListingCard'
import heroImg from '../../assets/rent.jpg'

const { Title, Paragraph, Text } = Typography

const GREEN = '#0d6e3f'
const NAVY = '#0a2a4d'

const HOME_LABELS = {
  viewRooms: 'Ona Vyumba',
  playVideo: 'Tazama video',
  rentFrom: 'Kodi kuanzia',
  addressFallback: 'Anwani haijatolewa',
  roomsAvailable: (n) => `Chumba ${n} kinapatikana`,
  verifiedOwner: 'Mmiliki aliyethibitishwa',
}

export default function Home() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const { platformBranding } = useBranding()
  const [listings, setListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(false)

  useEffect(() => {
    let active = true
    setListingsLoading(true)
    listingsApi
      .getHouses()
      .then((res) => {
        if (!active) return
        const data = res.data.data || res.data
        setListings(Array.isArray(data) ? data.slice(0, 3) : [])
      })
      .catch(() => {})
      .finally(() => active && setListingsLoading(false))
    return () => {
      active = false
    }
  }, [])

  const ownerPoints = [
    'Sajili na simamia nyumba, vyumba na upatikanaji wake.',
    'Tengeneza na tuma mikataba ya kidijitali kwa wapangaji.',
    'Rekodi malipo ya kodi na toa risiti papo hapo.',
    'Fuatilia madeni, mapato na ripoti za upatikanaji.',
  ]

  const tenantPoints = [
    'Tafuta nyumba na vyumba vinavyopatikana kwa urahisi.',
    'Omba kukodisha chumba moja kwa moja kwa mmiliki.',
    'Saini mkataba wa pango mtandaoni, bila karatasi.',
    'Lipa kodi na pata risiti yako mara moja.',
  ]

  const features = [
    {
      icon: <HomeOutlined style={{ fontSize: 28, color: GREEN }} />,
      title: 'Usimamizi wa Nyumba',
      description: 'Simamia nyumba, vyumba na upatikanaji wao sehemu moja.',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 28, color: GREEN }} />,
      title: 'Usimamizi wa Wapangaji',
      description: 'Fuatilia taarifa za wapangaji na historia ya upangaji.',
    },
    {
      icon: <FileProtectOutlined style={{ fontSize: 28, color: GREEN }} />,
      title: 'Mikataba ya Kidijitali',
      description: 'Tengeneza, tuma na simamia mikataba kwa usalama mtandaoni.',
    },
    {
      icon: <DollarOutlined style={{ fontSize: 28, color: GREEN }} />,
      title: 'Malipo na Risiti',
      description: 'Rekodi malipo, fuatilia salio na toa risiti papo hapo.',
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 28, color: GREEN }} />,
      title: 'Ripoti na Ufuatiliaji',
      description: 'Pata ripoti za upatikanaji, madeni na mapato kwa uwazi.',
    },
  ]

  const currentYear = new Date().getFullYear()

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #e8f5e9 0%, #f0f2f5 100%)',
          padding: '56px 24px',
        }}
      >
        <Row gutter={[32, 32]} align="middle" justify="center" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <img
                src={platformBranding.logo}
                alt={`${platformBranding.name} — ${platformBranding.tagline}`}
                style={{ width: 360, maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
              />
              <Paragraph style={{ fontSize: 16, color: '#595959', maxWidth: 520 }}>
                {platformBranding.description} Wamiliki wa nyumba husimamia mali zao, na wapangaji
                hupata nyumba, mikataba, malipo na risiti mahali pamoja.
              </Paragraph>
              <Space size="middle" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<SearchOutlined />}
                  onClick={() => navigate('/listings')}
                >
                  Tafuta Nyumba
                </Button>
                {!loading && user ? (
                  <Button
                    size="large"
                    icon={<DashboardOutlined />}
                    onClick={() => navigate(user.role === 'owner' ? '/owner' : '/tenant')}
                  >
                    Dashibodi Yako
                  </Button>
                ) : (
                  <>
                    <Button
                      size="large"
                      icon={<UserAddOutlined />}
                      onClick={() => navigate('/register')}
                    >
                      Jisajili
                    </Button>
                    <Button
                      size="large"
                      icon={<LoginOutlined />}
                      onClick={() => navigate('/login')}
                    >
                      Ingia
                    </Button>
                  </>
                )}
              </Space>
            </Space>
          </Col>
          <Col xs={24} lg={12}>
            <div style={{ textAlign: 'center' }}>
              <img
                src={heroImg}
                alt="Usimamizi wa nyumba za kupangisha"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 12,
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                }}
              />
            </div>
          </Col>
        </Row>
      </div>

      <div style={{ padding: '0 24px 24px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ color: NAVY, margin: 0 }}>
              {platformBranding.name} ni kwa ajili ya wani?
            </Title>
            <Paragraph style={{ color: '#595959', marginTop: 8, marginBottom: 0 }}>
              Jukwaa moja linalowaunganisha wamiliki wa nyumba na wapangaji.
            </Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: 12, height: '100%' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Space align="center">
                    <ShopOutlined style={{ fontSize: 28, color: GREEN }} />
                    <Title level={3} style={{ margin: 0, color: NAVY }}>
                      Kwa Wamiliki wa Nyumba
                    </Title>
                  </Space>
                  <List
                    size="small"
                    dataSource={ownerPoints}
                    renderItem={(item) => (
                      <List.Item style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}>
                        <Space align="start">
                          <CheckCircleOutlined style={{ color: GREEN, marginTop: 3 }} />
                          <Text>{item}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                  {!loading && user?.role === 'owner' ? (
                    <Button
                      type="primary"
                      block
                      icon={<DashboardOutlined />}
                      onClick={() => navigate('/owner')}
                    >
                      Nenda kwenye Dashibodi
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      block
                      icon={<UserAddOutlined />}
                      onClick={() => navigate('/register')}
                    >
                      Sajili kama Mmiliki
                    </Button>
                  )}
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card style={{ borderRadius: 12, height: '100%' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Space align="center">
                    <TeamOutlined style={{ fontSize: 28, color: GREEN }} />
                    <Title level={3} style={{ margin: 0, color: NAVY }}>
                      Kwa Wapangaji
                    </Title>
                  </Space>
                  <List
                    size="small"
                    dataSource={tenantPoints}
                    renderItem={(item) => (
                      <List.Item style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}>
                        <Space align="start">
                          <CheckCircleOutlined style={{ color: GREEN, marginTop: 3 }} />
                          <Text>{item}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                  {!loading && user?.role === 'tenant' ? (
                    <Button
                      type="primary"
                      block
                      icon={<DashboardOutlined />}
                      onClick={() => navigate('/tenant')}
                    >
                      Nenda kwenye Dashibodi
                    </Button>
                  ) : (
                    <Button
                      block
                      icon={<SearchOutlined />}
                      onClick={() => navigate('/listings')}
                    >
                      Tafuta Nyumba Zinazopatikana
                    </Button>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <div style={{ padding: '24px 24px 60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <Title level={2} style={{ color: NAVY, margin: 0 }}>
              Nyumba Zinazopatikana
            </Title>
            <Paragraph style={{ color: '#595959', marginTop: 8 }}>
              Nyumba zilizo na vyumba tayari kukodishwa sasa hivi.
            </Paragraph>
          </div>
          {listingsLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {listings.map((house) => (
                  <Col xs={24} sm={12} lg={8} key={house.id}>
                    <ListingCard
                      house={house}
                      labels={HOME_LABELS}
                      showOwner={false}
                      onClick={() => navigate(`/listings/${house.id}`)}
                    />
                  </Col>
                ))}
              </Row>
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<SearchOutlined />}
                  onClick={() => navigate('/listings')}
                >
                  Ona Nyumba Zote
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: '0 24px 60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', color: NAVY, marginBottom: 32 }}>
            Kwa nini kutumia {platformBranding.name}?
          </Title>
          <Row gutter={[16, 16]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  hoverable
                  style={{ borderRadius: 12, height: '100%' }}
                  styles={{ body: { padding: 24 } }}
                >
                  <Space direction="vertical" size="middle">
                    <div>{feature.icon}</div>
                    <Title level={4} style={{ margin: 0, color: NAVY }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ margin: 0, color: '#595959' }}>
                      {feature.description}
                    </Paragraph>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      <div style={{ padding: '0 24px 60px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Card style={{ borderRadius: 12, textAlign: 'center' }}>
            <img
              src={platformBranding.logo}
              alt={`${platformBranding.name} — ${platformBranding.tagline}`}
              style={{ width: 240, maxWidth: '100%', height: 'auto', objectFit: 'contain', marginBottom: 8 }}
            />
            <Divider />
            {!loading && user ? (
              <Button
                type="primary"
                size="large"
                icon={<DashboardOutlined />}
                onClick={() => navigate(user.role === 'owner' ? '/owner' : '/tenant')}
              >
                Fungua Dashibodi Yako
              </Button>
            ) : (
              <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<UserAddOutlined />}
                  onClick={() => navigate('/register')}
                >
                  Jisajili Sasa
                </Button>
                <Button
                  size="large"
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login')}
                >
                  Ingia
                </Button>
              </Space>
            )}
          </Card>
        </div>
      </div>

      <div
        style={{
          background: NAVY,
          padding: '24px',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
          © {currentYear} {platformBranding.name} — {platformBranding.tagline}
        </Text>
      </div>
    </div>
  )
}