import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Card,
  Button,
  Typography,
  Space,
  Descriptions,
  Row,
  Col,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Spin,
  Empty,
  message,
  Divider,
  Tag,
} from 'antd'
import {
  EnvironmentOutlined,
  TeamOutlined,
  PhoneOutlined,
  LoginOutlined,
  DashboardOutlined,
  UserAddOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import * as listingsApi from '../../api/listings'
import * as rentalRequestsApi from '../../api/rentalRequests'
import { useAuth } from '../../hooks/useAuth'
import { useBranding } from '../../contexts/BrandingContext'
import CurrencyDisplay from '../../components/common/CurrencyDisplay'

const { Title, Text, Paragraph } = Typography

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { branding, setOwnerScope } = useBranding()
  const [house, setHouse] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const fetchHouse = async () => {
    setLoading(true)
    try {
      const res = await listingsApi.getHouse(id)
      const data = res.data.data || res.data
      setHouse(data.house || null)
      setRooms(Array.isArray(data.rooms) ? data.rooms : [])
    } catch {
      message.error('Failed to load this listing')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHouse()
  }, [id])

  // While this page is open the shell should carry the owning landlord's
  // brand; leaving the page restores the platform default.
  useEffect(() => {
    setOwnerScope(house?.owner?.id ?? null)
    return () => setOwnerScope(null)
  }, [house?.owner?.id, setOwnerScope])

  const handleRequestClick = (room) => {
    if (authLoading) return
    if (!user) {
      message.info('Please login or register as a tenant to request a room.')
      navigate('/login')
      return
    }
    if (user.role !== 'tenant') {
      message.warning('Only tenants can request a rental.')
      return
    }
    setSelectedRoom(room)
    form.setFieldsValue({
      desired_start_date: dayjs().add(1, 'month').startOf('month'),
      period_months: 12,
    })
  }

  const submitRequest = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      await rentalRequestsApi.createRequest({
        room_id: selectedRoom.id,
        message: values.message || undefined,
        desired_start_date: values.desired_start_date
          ? values.desired_start_date.format('YYYY-MM-DD')
          : undefined,
        period_months: values.period_months || undefined,
      })
      message.success('Request sent! The owner will respond shortly.')
      setSelectedRoom(null)
      navigate('/tenant/requests')
    } catch (err) {
      if (err?.errorFields) return
      message.error(
        err?.response?.data?.message || 'Failed to send your request. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/listings')}>
            All Listings
          </Button>
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
              <Button type="primary" icon={<UserAddOutlined />} onClick={() => navigate('/register')}>
                Register
              </Button>
            </>
          )}
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : !house ? (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 48 }}>
          <Empty description="This listing is no longer available." />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="primary" onClick={() => navigate('/listings')}>
              Back to Listings
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 60px' }}>
          <Card style={{ borderRadius: 12, marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0, color: '#0a2a4d' }}>
              {house.name}
            </Title>
            <Space direction="vertical" size={4} style={{ marginTop: 12, width: '100%' }}>
              <Text type="secondary">
                <EnvironmentOutlined /> {house.address || 'Address not provided'}
              </Text>
              <Space size={6} wrap>
                <Text type="secondary">
                  <TeamOutlined /> Owner: {house.owner?.name || 'N/A'}
                </Text>
                {house.owner?.verified && (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Verified owner
                  </Tag>
                )}
              </Space>
              {house.owner?.phone && (
                <Text type="secondary">
                  <PhoneOutlined /> {house.owner.phone}
                </Text>
              )}
              {house.contact_info && (
                <Text type="secondary">
                  <PhoneOutlined /> {house.contact_info}
                </Text>
              )}
            </Space>
            {house.description && (
              <>
                <Divider style={{ margin: '16px 0' }} />
                <Paragraph style={{ margin: 0, color: '#595959' }}>{house.description}</Paragraph>
              </>
            )}
          </Card>

          <Space align="center" style={{ marginBottom: 12 }}>
            <HomeOutlined style={{ color: '#0d6e3f', fontSize: 18 }} />
            <Title level={4} style={{ margin: 0 }}>
              Available Rooms
            </Title>
          </Space>

          {rooms.length === 0 ? (
            <Card style={{ borderRadius: 12 }}>
              <Empty description="No rooms are available in this house right now." />
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {rooms.map((room) => (
                <Col xs={24} sm={12} key={room.id}>
                  <Card
                    style={{ borderRadius: 12, height: '100%' }}
                    cover={
                      <div style={{ position: 'relative', height: 160, background: '#f0f2f5' }}>
                        {room.video ? (
                          <video
                            src={room.video}
                            controls
                            playsInline
                            preload="metadata"
                            style={{
                              width: '100%',
                              height: 160,
                              objectFit: 'cover',
                              display: 'block',
                              background: '#000',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : room.images?.[0] ? (
                          <img
                            alt={room.name}
                            src={room.images[0]}
                            style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                          />
                        ) : null}
                      </div>
                    }
                  >
                    <Row justify="space-between" align="middle" gutter={[8, 8]}>
                      <Col flex="auto">
                        <Title level={5} style={{ margin: 0, color: '#0a2a4d' }}>
                          {room.name}
                        </Title>
                        {room.description && (
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {room.description}
                          </Text>
                        )}
                        <div style={{ marginTop: 6 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Monthly rent
                          </Text>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#0d6e3f' }}>
                            <CurrencyDisplay amount={room.rent_amount} />
                          </div>
                        </div>
                      </Col>
                      <Col>
                        <Button type="primary" onClick={() => handleRequestClick(room)}>
                          Request to Rent
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      <Modal
        title={selectedRoom ? `Request "${selectedRoom.name}"` : 'Request Room'}
        open={!!selectedRoom}
        onCancel={() => setSelectedRoom(null)}
        onOk={submitRequest}
        confirmLoading={submitting}
        okText="Send Request"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          {house && (
            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="House">{house.name}</Descriptions.Item>
              <Descriptions.Item label="Monthly rent">
                <CurrencyDisplay amount={selectedRoom?.rent_amount} />
              </Descriptions.Item>
              <Descriptions.Item label="Owner">{house.owner?.name || 'N/A'}</Descriptions.Item>
            </Descriptions>
          )}
          <Form.Item
            name="desired_start_date"
            label="Desired start date"
            rules={[{ required: true, message: 'Please choose a start date' }]}
          >
            <DatePicker style={{ width: '100%' }} disabledDate={(d) => d && d < dayjs().startOf('day')} />
          </Form.Item>
          <Form.Item name="period_months" label="Period (months)">
            <InputNumber min={1} max={60} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="message" label="Message to the owner">
            <Input.TextArea rows={3} maxLength={1000} placeholder="Introduce yourself or ask a question..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}