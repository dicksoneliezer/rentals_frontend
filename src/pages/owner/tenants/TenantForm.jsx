import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Button, Card, Modal, Typography, message } from 'antd'
import * as tenantsApi from '../../../api/tenants'
import PageHeader from '../../../components/common/PageHeader'

const { Paragraph, Text } = Typography

export default function TenantForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [tempPassword, setTempPassword] = useState(null)
  const [smsSent, setSmsSent] = useState(false)

  useEffect(() => {
    if (isEdit) {
      setFetching(true)
      tenantsApi
        .getById(id)
        .then((res) => {
          const tenant = res.data.data || res.data
          form.setFieldsValue(tenant)
        })
        .catch(() => message.error('Failed to load tenant'))
        .finally(() => setFetching(false))
    }
  }, [id, isEdit, form])

  const onFinish = async (values) => {
    setLoading(true)
    try {
      if (isEdit) {
        await tenantsApi.update(id, values)
        message.success('Tenant updated successfully')
        navigate('/owner/tenants')
      } else {
        const res = await tenantsApi.create(values)
        const tenant = res.data.data || res.data
        setTempPassword(tenant.temporary_password || null)
        setSmsSent(Boolean(tenant.sms_sent))
        message.success('Tenant created successfully')
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Tenant' : 'Add Tenant'}
        onBack={() => navigate(-1)}
      />
      <Card loading={fetching}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="e.g. John Doe" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter phone number' },
              { pattern: /^\+?[\d\s\-]{9,15}$/, message: 'Enter a valid phone number' },
            ]}
          >
            <Input placeholder="+255 7XX XXX XXX" />
          </Form.Item>
          <Form.Item name="id_number" label="ID Number">
            <Input placeholder="National ID or passport number" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Enter a valid email' }]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} placeholder="Residential address" />
          </Form.Item>
          <Form.Item name="emergency_contact_name" label="Emergency Contact Name">
            <Input placeholder="Contact person name" />
          </Form.Item>
          <Form.Item name="emergency_contact_phone" label="Emergency Contact Phone">
            <Input placeholder="Contact person phone" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Any additional notes" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Update Tenant' : 'Create Tenant'}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        open={Boolean(tempPassword) || smsSent}
        title="Tenant Account Created"
        okText="Done"
        closable={false}
        maskClosable={false}
        onOk={() => navigate('/owner/tenants')}
      >
        {smsSent ? (
          <>
            <Paragraph>
              The temporary password has been <strong>sent to the tenant via SMS</strong>.
            </Paragraph>
            <Paragraph type="secondary">
              The tenant can sign in with their phone number and the SMS password. They will be
              asked to set a new password on first login.
            </Paragraph>
          </>
        ) : (
          <>
            <Paragraph>
              The tenant can now sign in with their phone number and the temporary
              password below. They will be asked to set a new password on first login.
            </Paragraph>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <Text copyable style={{ fontSize: 20, fontWeight: 600, letterSpacing: 1 }}>
                {tempPassword}
              </Text>
            </div>
            <Text type="secondary">
              This password is shown only once. Copy it now and share it with the tenant securely.
            </Text>
          </>
        )}
      </Modal>
    </div>
  )
}
