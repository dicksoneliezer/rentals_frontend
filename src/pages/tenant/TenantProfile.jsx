import { useState, useEffect } from 'react'
import { Card, Typography, Avatar, Descriptions, Form, Input, Button, Space, message, Skeleton } from 'antd'
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'
import * as tenantApi from '../../api/tenant'
import PageHeader from '../../components/common/PageHeader'

const { Title, Text } = Typography

export default function TenantProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const fetchProfile = async () => {
    try {
      const res = await tenantApi.getProfile()
      setProfile(res.data.data || res.data)
    } catch {
      message.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile && editing) {
      form.setFieldsValue({
        full_name: profile.full_name || profile.name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        address: profile.address || '',
      })
    }
  }, [profile, editing, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const payload = {
        name: values.full_name,
        phone: values.phone,
        email: values.email,
        address: values.address,
      }
      const res = await tenantApi.updateProfile(payload)
      setProfile(res.data.data || res.data || { ...profile, ...payload })
      setEditing(false)
      message.success('Profile updated successfully')
    } catch (err) {
      if (err.errorFields) return
      message.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    form.resetFields()
  }

  if (loading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 0 }} />
        <Card><Skeleton active paragraph={{ rows: 8 }} /></Card>
      </div>
    )
  }

  const name = profile?.full_name || profile?.name || 'Tenant'
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div>
      <PageHeader
        title="My Profile"
        extra={
          !editing ? (
            <Button type="primary" icon={<EditOutlined />} onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <Space>
              <Button icon={<SaveOutlined />} type="primary" onClick={handleSave} loading={saving}>
                Save
              </Button>
              <Button icon={<CloseOutlined />} onClick={handleCancel}>
                Cancel
              </Button>
            </Space>
          )
        }
      />

      <Card bordered={false} style={{ borderRadius: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#0a2a4d', fontSize: 32 }}
          >
            {initials}
          </Avatar>
          <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>{name}</Title>
          {profile?.phone && <Text type="secondary">{profile.phone}</Text>}
        </div>

        {editing ? (
          <Form form={form} layout="vertical" style={{ maxWidth: 500, margin: '0 auto' }}>
            <Form.Item
              name="full_name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Please enter your phone number' }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
            <Form.Item name="address" label="Address">
              <Input.TextArea rows={3} placeholder="Enter address" />
            </Form.Item>
          </Form>
        ) : (
          <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
            <Descriptions.Item label="Full Name">
              {profile?.full_name || profile?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {profile?.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {profile?.email || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="ID Number">
              {profile?.id_number || profile?.national_id || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {profile?.address || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Emergency Contact" span={2}>
              {profile?.emergency_contact || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  )
}
