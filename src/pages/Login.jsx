import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Space, message } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone, PhoneOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useBranding } from '../contexts/BrandingContext'
import { homePathForRole } from '../config/roles'

const { Text } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { platformBranding } = useBranding()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const res = await login(values.phone, values.password)
      const data = res?.data?.data || res?.data
      if (data?.user?.must_change_password) {
        navigate('/set-password', { replace: true })
      } else {
        navigate(homePathForRole(data?.user), { replace: true })
      }
      message.success('Login successful!')
    } catch (err) {
      const status = err?.response?.status
      if (status === 422 || status === 401) {
        message.error(err?.response?.data?.message || 'Invalid phone number or password')
      } else if (status == null) {
        message.error('Cannot reach the server. This can happen after idle time — please retry.')
      } else {
        message.error('Something went wrong. Please try again.')
      }
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
        style={{ width: '100%', maxWidth: 420, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{
            background: '#e8f5e9',
            padding: '32px 24px',
            textAlign: 'center',
            borderRadius: '12px 12px 0 0',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <img
            src={platformBranding.logo}
            alt={`${platformBranding.name} — ${platformBranding.tagline}`}
            style={{ width: 260, maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </div>

        <div style={{ padding: '32px 24px' }}>
          <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
            <Form.Item
              name="phone"
              rules={[{ required: true, message: 'Please enter your phone number' }]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="+255 7XX XXX XXX"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <a
                href="/forgot-password"
                style={{ color: '#0d6e3f', fontSize: 14 }}
              >
                Forgot Password?
              </a>
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 44, fontWeight: 600, fontSize: 15 }}
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Text type="secondary">Don&apos;t have an account? </Text>
            <a href="/register" style={{ color: '#0d6e3f', fontWeight: 600 }}>
              Register
            </a>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <a href="/listings" style={{ color: '#0a2a4d' }}>
              Browse available rentals
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}
