import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Space, Steps, message, Alert } from 'antd'
import { PhoneOutlined, LockOutlined, SafetyOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import * as authApi from '../api/auth'

const { Title, Text } = Typography

export default function ForgotPassword() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [phoneForm] = Form.useForm()
  const [resetForm] = Form.useForm()
  const [confirmPhone, setConfirmPhone] = useState('')
  const [devCode, setDevCode] = useState(null)
  const navigate = useNavigate()

  const onPhoneSubmit = async (values) => {
    setLoading(true)
    try {
      const res = await authApi.forgotPassword(values.phone)
      const data = res?.data?.data || null
      setDevCode(data?.reset_token_dev || null)
      setConfirmPhone(values.phone)
      setStep(1)
      message.success('A reset code has been sent to your phone')
    } catch {
      message.error('Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  const onResetSubmit = async (values) => {
    setLoading(true)
    try {
      await authApi.resetPassword({
        phone: confirmPhone,
        token: values.token,
        password: values.password,
        password_confirmation: values.confirm_password,
      })
      message.success('Password reset successfully! Please log in.')
      navigate('/login')
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to reset password')
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
        style={{ width: '100%', maxWidth: 460, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
        styles={{ body: { padding: '32px 28px' } }}
      >
        <Title level={4} style={{ textAlign: 'center', marginTop: 0 }}>
          Reset Password
        </Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          Enter your phone number to receive a reset code
        </Text>

        <Steps
          current={step}
          size="small"
          style={{ marginBottom: 24 }}
          items={[{ title: 'Phone' }, { title: 'Reset' }]}
        />

        {step === 0 && (
          <Form form={phoneForm} layout="vertical" onFinish={onPhoneSubmit} requiredMark={false}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Enter your phone number' }]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="+255 7XX XXX XXX"
                size="large"
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 8 }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Send Reset Code
              </Button>
            </Form.Item>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
              <a onClick={() => navigate('/login')} style={{ color: '#0d6e3f', fontSize: 14 }}>
                <ArrowLeftOutlined /> Back to Login
              </a>
            </Space>
          </Form>
        )}

        {step === 1 && (
          <Form form={resetForm} layout="vertical" onFinish={onResetSubmit} requiredMark={false}>
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="Reset code sent"
              description="Enter the 6-character code sent to your phone, then set a new password."
            />
            {devCode && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message="⚠ Development mode"
                description={`No SMS provider is configured, so the SMS was not actually sent. Use this code to continue testing: ${devCode}`}
              />
            )}
            <Form.Item
              name="token"
              label="Reset Code"
              rules={[{ required: true, message: 'Enter the reset code' }]}
            >
              <Input
                prefix={<SafetyOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="6-character code"
                size="large"
                maxLength={6}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="New Password"
              rules={[
                { required: true, message: 'Enter a new password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="New password"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="confirm_password"
              label="Confirm New Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Confirm your new password' },
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
                placeholder="Confirm new password"
                size="large"
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 8 }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Reset Password
              </Button>
            </Form.Item>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
              <a onClick={() => setStep(0)} style={{ color: '#0d6e3f', fontSize: 14 }}>
                <ArrowLeftOutlined /> Change phone number
              </a>
            </Space>
          </Form>
        )}
      </Card>
    </div>
  )
}
