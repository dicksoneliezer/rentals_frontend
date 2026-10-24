import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Tabs, Typography, message, Space, Upload } from 'antd'
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import { useBranding } from '../../contexts/BrandingContext'
import * as profileApi from '../../api/profile'
import * as contractsApi from '../../api/contracts'
import * as brandingApi from '../../api/branding'
import PageHeader from '../../components/common/PageHeader'

const { Text } = Typography

const MAX_BRANDING_MB = 2
const BRANDING_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']

export default function Settings() {
  const { user } = useAuth()
  const { appBranding: branding, refresh } = useBranding()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [businessForm] = Form.useForm()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [businessLoading, setBusinessLoading] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoDeleting, setLogoDeleting] = useState(false)
  const [signatureUploading, setSignatureUploading] = useState(false)
  const [signatureDeleting, setSignatureDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      })
    }
  }, [user, profileForm])

  // Business details (company name, contact, Lipa numbers) are what the
  // contract letter and its payment clause are rendered from, so they are
  // loaded once and saved back through the contract settings endpoint.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await contractsApi.getSettings()
        if (!cancelled) businessForm.setFieldsValue(data.data)
      } catch {
        message.error('Imeshindwa kupakua mipangilio ya biashara.')
      }
    })()
    return () => { cancelled = true }
  }, [businessForm])

  const onProfileFinish = async (values) => {
    setProfileLoading(true)
    try {
      await profileApi.updateProfile(values)
      message.success('Profile updated successfully')
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const onPasswordFinish = async (values) => {
    setPasswordLoading(true)
    try {
      await profileApi.updatePassword({
        current_password: values.current_password,
        password: values.new_password,
        password_confirmation: values.confirm_password,
      })
      message.success('Password changed successfully')
      passwordForm.resetFields()
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const onBusinessFinish = async (values) => {
    setBusinessLoading(true)
    try {
      const { data } = await contractsApi.updateSettings(values)
      businessForm.setFieldsValue(data.data)
      message.success(data.message || 'Mipangilio imehifadhiwa.')
    } catch (err) {
      message.error(err?.response?.data?.message || 'Imeshindwa kuhifadhi mipangilio.')
    } finally {
      setBusinessLoading(false)
    }
  }

  const uploadBrandingAsset = async (file, kind) => {
    if (!BRANDING_TYPES.includes(file.type)) {
      message.error('Tumia PNG, JPG, JPEG, WEBP au SVG.')
      return
    }
    if (file.size > MAX_BRANDING_MB * 1024 * 1024) {
      message.error(`Faili isizidi ${MAX_BRANDING_MB} MB.`)
      return
    }
    const setBusy = kind === 'logo' ? setLogoUploading : setSignatureUploading
    const apiFn = kind === 'logo' ? brandingApi.uploadLogo : brandingApi.uploadSignature
    const formData = new FormData()
    formData.append(kind, file)
    setBusy(true)
    try {
      await apiFn(formData)
      await refresh()
      message.success(kind === 'logo' ? 'Logo imesasishwa.' : 'Saini imesasishwa.')
    } catch (err) {
      message.error(err?.response?.data?.message || 'Imeshindwa kupakia faili.')
    } finally {
      setBusy(false)
    }
  }

  const deleteBrandingAsset = async (kind) => {
    const setBusy = kind === 'logo' ? setLogoDeleting : setSignatureDeleting
    const apiFn = kind === 'logo' ? brandingApi.deleteLogo : brandingApi.deleteSignature
    setBusy(true)
    try {
      await apiFn()
      await refresh()
      message.success(kind === 'logo' ? 'Logo imeondolewa.' : 'Saini imeondolewa.')
    } catch (err) {
      message.error(err?.response?.data?.message || 'Imeshindwa kuondoa faili.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" />
      <Tabs
        defaultActiveKey="profile"
        items={[
          {
            key: 'profile',
            label: 'Profile',
            children: (
              <Card>
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={onProfileFinish}
                  style={{ maxWidth: 500 }}
                >
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Enter your name' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ type: 'email', message: 'Enter a valid email' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[{ required: true, message: 'Enter your phone' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="address" label="Address">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={profileLoading}>
                      Update Profile
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'password',
            label: 'Change Password',
            children: (
              <Card>
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={onPasswordFinish}
                  style={{ maxWidth: 500 }}
                >
                  <Form.Item
                    name="current_password"
                    label="Current Password"
                    rules={[{ required: true, message: 'Enter current password' }]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item
                    name="new_password"
                    label="New Password"
                    rules={[
                      { required: true, message: 'Enter new password' },
                      { min: 8, message: 'Password must be at least 8 characters' },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item
                    name="confirm_password"
                    label="Confirm New Password"
                    dependencies={['new_password']}
                    rules={[
                      { required: true, message: 'Confirm new password' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('new_password') === value) {
                            return Promise.resolve()
                          }
                          return Promise.reject(new Error('Passwords do not match'))
                        },
                      }),
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={passwordLoading}>
                      Change Password
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'business',
            label: 'Business',
            children: (
              <Card>
                <Form
                  form={businessForm}
                  layout="vertical"
                  onFinish={onBusinessFinish}
                  style={{ maxWidth: 640 }}
                >
                  <Form.Item
                    name="company_name"
                    label="Company name"
                    extra="Printed on the contract letterhead and in the payment clause."
                    rules={[{ required: true, message: 'Enter the company name' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="contact_phone" label="Contact phone">
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="contact_email"
                    label="Contact email"
                    rules={[{ type: 'email', message: 'Enter a valid email' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="address" label="Address">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                  <Form.Item name="currency" label="Currency">
                    <Input maxLength={3} style={{ width: 120 }} />
                  </Form.Item>

                  <Typography.Paragraph type="secondary" className="mb-2">
                    Payment accounts (shown on contracts). These are frozen into
                    every new contract; contracts already sent keep the numbers they
                    were issued with.
                  </Typography.Paragraph>
                  <Form.List name="payment_accounts">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...rest }) => (
                          <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 4 }}>
                            <Form.Item
                              {...rest}
                              name={[name, 'network']}
                              rules={[{ required: true, message: 'Network' }]}
                            >
                              <Input placeholder="Network (e.g. Vodacom)" />
                            </Form.Item>
                            <Form.Item
                              {...rest}
                              name={[name, 'number']}
                              rules={[{ required: true, message: 'Number' }]}
                            >
                              <Input placeholder="Number" />
                            </Form.Item>
                            <Form.Item {...rest} name={[name, 'account_name']}>
                              <Input placeholder="Account name" />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          </Space>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Add payment account
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={businessLoading}>
                      Save business details
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            ),
          },
          {
            key: 'branding',
            label: 'Branding',
            children: (
              <Card>
                <Typography.Paragraph type="secondary">
                  Logo na saini yako hutumika kwenye nyaraka zako (mikataba, risiti) na
                  kwenye dashibodi yako. Bila logo yako, logo ya jukwaa hutumika.
                  Ukubwa wa juu: {MAX_BRANDING_MB} MB (PNG, JPG, JPEG, WEBP, SVG).
                </Typography.Paragraph>
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Logo</Text>
                  {branding.logo && (
                    <div style={{ marginBottom: 8 }}>
                      <img
                        src={branding.logo}
                        alt="Logo"
                        style={{ maxHeight: 80, maxWidth: 240, objectFit: 'contain' }}
                      />
                    </div>
                  )}
                  <Space>
                    <Upload
                      accept=".png,.jpg,.jpeg,.webp,.svg,image/*"
                      showUploadList={false}
                      beforeUpload={(file) => { uploadBrandingAsset(file, 'logo'); return false }}
                    >
                      <Button icon={<UploadOutlined />} loading={logoUploading}>Pakia logo</Button>
                    </Upload>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      loading={logoDeleting}
                      disabled={!branding.hasLogo}
                      onClick={() => deleteBrandingAsset('logo')}
                    >
                      Ondoa
                    </Button>
                  </Space>
                </div>
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>Saini (signature)</Text>
                  {branding.signature ? (
                    <div style={{ marginBottom: 8 }}>
                      <img
                        src={branding.signature}
                        alt="Signature"
                        style={{ maxHeight: 80, maxWidth: 240, objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                      Hakuna saini iliyopakiwa.
                    </Text>
                  )}
                  <Space>
                    <Upload
                      accept=".png,.jpg,.jpeg,.webp,.svg,image/*"
                      showUploadList={false}
                      beforeUpload={(file) => { uploadBrandingAsset(file, 'signature'); return false }}
                    >
                      <Button icon={<UploadOutlined />} loading={signatureUploading}>Pakia saini</Button>
                    </Upload>
                    {branding.signature && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        loading={signatureDeleting}
                        onClick={() => deleteBrandingAsset('signature')}
                      >
                        Ondoa
                      </Button>
                    )}
                  </Space>
                </div>
              </Card>
            ),
          },
        ]}
      />
    </div>
  )
}
