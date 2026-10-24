import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Segmented,
  Divider,
  Alert,
  message,
} from 'antd'
import {
  UserOutlined,
  PhoneOutlined,
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  SolutionOutlined,
  ShopOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import { useBranding } from '../../contexts/BrandingContext'
import { homePathForRole } from '../../config/roles'

const { Title, Text } = Typography

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('tenant')
  const { register } = useAuth()
  const { platformBranding } = useBranding()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const payload = {
        name: values.name,
        phone: values.phone,
        role: values.role,
        password: values.password,
        password_confirmation: values.password_confirmation,
      }
      if (values.email) payload.email = values.email
      if (values.id_number) payload.id_number = values.id_number
      if (values.address) payload.address = values.address
      if (values.emergency_contact) payload.emergency_contact = values.emergency_contact

      const res = await register(payload)
      const data = res?.data?.data || res?.data

      message.success('Account created successfully!')
      navigate(homePathForRole(data?.user), { replace: true })
    } catch (err) {
      const errors = err?.response?.data?.errors
      const firstError = errors ? Object.values(errors)[0]?.[0] : null
      message.error(
        firstError ||
          err?.response?.data?.message ||
          'Registration failed. Please check your details and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e8f5e9 0%, #f0f2f5 100%)',
        padding: 24,
      }}
    >
      <Card
        style={{ width: '100%', maxWidth: 520, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{
            background: '#e8f5e9',
            padding: '28px 24px',
            textAlign: 'center',
            borderRadius: '12px 12px 0 0',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <img
            src={platformBranding.logo}
            alt={`${platformBranding.name} — ${platformBranding.tagline}`}
            style={{ width: 240, maxWidth: '100%', height: 'auto', objectFit: 'contain', marginBottom: 8 }}
          />
          <Title level={3} style={{ color: '#0a2a55', margin: 0, fontWeight: 600 }}>
            Create an Account
          </Title>
          <Text style={{ color: '#5B6B7F', fontSize: 14 }}>
            Join as a tenant or list your houses as an owner
          </Text>
        </div>

        <div style={{ padding: '28px 24px' }}>
          <Form
            layout="vertical"
            onFinish={onFinish}
            size="large"
            requiredMark={false}
            initialValues={{ role: 'tenant' }}
          >
            <Form.Item name="role" style={{ marginBottom: 20 }}>
              <Segmented
                block
                options={[
                  {
                    label: (
                      <span>
                        <UserOutlined /> I am a Tenant
                      </span>
                    ),
                    value: 'tenant',
                  },
                  {
                    label: (
                      <span>
                        <ShopOutlined /> I am a House Owner
                      </span>
                    ),
                    value: 'owner',
                  },
                ]}
                onChange={setRole}
              />
            </Form.Item>

            <Text type="secondary" style={{ fontSize: 13 }}>
              {role === 'owner'
                ? 'Register to add and manage your houses, rooms, tenants and contracts.'
                : 'Register to browse available rooms and request a rental.'}
            </Text>
            {role === 'owner' && (
              <Alert
                type="info"
                showIcon
                style={{ marginTop: 12 }}
                message="Owners are verified before listing"
                description="After registering you will be asked to upload your national ID and proof of ownership. An administrator reviews them before your listings go live."
              />
            )}
            <Divider style={{ margin: '16px 0' }} />

            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Full name"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: 'Please enter your phone number' },
                { pattern: /^[0-9+\s-]{9,15}$/, message: 'Enter a valid phone number' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Phone number (used to login) e.g. 0712 345 678"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[{ type: 'email', message: 'Enter a valid email address' }]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Email (optional)"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please enter a password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Password (min 8 characters)"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              name="password_confirmation"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Confirm password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item name="id_number">
              <Input
                prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="National ID / NIDA number (optional)"
              />
            </Form.Item>

            <Form.Item name="address">
              <Input
                prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Physical address (optional)"
              />
            </Form.Item>

            {role === 'tenant' && (
              <Form.Item name="emergency_contact">
                <Input
                  prefix={<SolutionOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Emergency contact (optional)"
                />
              </Form.Item>
            )}

            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 44, fontWeight: 600, fontSize: 15 }}
              >
                Create {role === 'owner' ? 'Owner' : 'Tenant'} Account
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Already have an account? </Text>
            <Link to="/login" style={{ color: '#0d6e3f', fontWeight: 600 }}>
              Login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
