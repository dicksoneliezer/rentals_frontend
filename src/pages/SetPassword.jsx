import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { updatePassword } from '../api/profile'
import { homePathForRole } from '../config/roles'

const { Title, Text } = Typography

export default function SetPassword() {
  const [loading, setLoading] = useState(false)
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await updatePassword({
        current_password: values.current_password,
        password: values.password,
        password_confirmation: values.password,
      })
      await refreshUser()
      message.success('Password set successfully!')
      navigate(homePathForRole(user), { replace: true })
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to set password')
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
            background: '#0d6e3f',
            padding: '32px 24px',
            textAlign: 'center',
            borderRadius: '12px 12px 0 0',
          }}
        >
          <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 600 }}>
            Set Your Password
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
            Please choose a new password to continue
          </Text>
        </div>

        <div style={{ padding: '32px 24px' }}>
          <Form layout="vertical" onFinish={onFinish} size="large" requiredMark={false}>
            <Form.Item
              name="current_password"
              label="Temporary Password"
              rules={[{ required: true, message: 'Please enter your temporary password' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Temporary password from your owner"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="New password (8+ characters)"
              />
            </Form.Item>

            <Form.Item
              name="password_confirm"
              label="Confirm New Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
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
                placeholder="Repeat new password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, fontWeight: 600, fontSize: 15 }}>
                Set Password
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <a
                onClick={async (e) => {
                  e.preventDefault()
                  await logout()
                  navigate('/login', { replace: true })
                }}
                style={{ color: '#0d6e3f', fontSize: 14 }}
              >
                Cancel and sign out
              </a>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  )
}
