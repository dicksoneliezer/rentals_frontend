import { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  List,
  Typography,
  Skeleton,
  Empty,
  message,
  Space,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
} from 'antd'
import {
  HomeOutlined,
  CalendarOutlined,
  WalletOutlined,
  PayCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getTenantDashboard } from '../../api/dashboard'
import * as paymentsApi from '../../api/payments'
import { useAuth } from '../../hooks/useAuth'
import StatsCard from '../../components/common/StatsCard'
import CurrencyDisplay from '../../components/common/CurrencyDisplay'
import StatusBadge from '../../components/common/StatusBadge'

const { Title, Text } = Typography

export default function TenantDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payOpen, setPayOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [paymentOptions, setPaymentOptions] = useState([])
  const [form] = Form.useForm()

  const fetchDashboard = async () => {
    try {
      const response = await getTenantDashboard()
      setData(response.data.data || response.data)
    } catch {
      message.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  // build payment options — hook #12, MUST be above the early return
  useEffect(() => {
    const accounts = data?.owner_settings?.payment_accounts || data?.payment_accounts || []
    const opts = accounts
      .filter((a) => a?.number || a?.network)
      .map((a, idx) => ({
        value: a?.number || idx.toString(),
        label: `${a?.network ? a.network + ': ' : ''}${a?.number}${a?.account_name ? ' (' + a.account_name + ')' : ''}`,
      }))
    if (opts.length === 0) {
      opts.push({ value: 'mobile_money', label: 'Lipa Namba' })
    }
    setPaymentOptions(opts)
  }, [data])

  // ---- all hooks are above this line ----
  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 0 }} />
        <Row gutter={[16, 16]}>
          {[...Array(4)].map((_, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}><Card><Skeleton active paragraph={{ rows: 3 }} /></Card></Col>
          <Col xs={24} lg={12}><Card><Skeleton active paragraph={{ rows: 4 }} /></Card></Col>
        </Row>
      </div>
    )
  }

  const tenant = data?.tenant || {}
  const room = data?.room || data?.currentRoom || {}
  const recentPayments = data?.recentPayments || []
  const stats = {
    next_due_date: data?.nextDueDate || null,
    current_balance: data?.currentBalance ?? 0,
    total_paid: data?.totalPaid ?? 0,
  }

  const history = Array.isArray(data?.history) ? data.history : []
  const outstanding = history.filter(
    (c) => c.status === 'unpaid' || c.status === 'partial' || c.status === 'overdue'
  )

  const openPayModal = () => {
    form.resetFields()
    if (outstanding.length > 0) {
      const first = outstanding[0]
      form.setFieldsValue({
        rent_charge_id: first.id,
        amount: Number(first.balance),
        payment_date: dayjs(),
        payment_account: paymentOptions[0]?.value,
      })
    }
    setPayOpen(true)
  }

  const handleChargeChange = (id) => {
    const charge = outstanding.find((c) => c.id === id)
    if (charge) form.setFieldsValue({ amount: Number(charge.balance) })
  }

  const handleSubmitPayment = async () => {
    try {
      const values = await form.validateFields()
      const charge = outstanding.find((c) => c.id === values.rent_charge_id)
      if (!charge) {
        message.error('Unable to submit payment')
        return
      }
      const account = paymentOptions.find((o) => o.value === values.payment_account)
      setSaving(true)
      await paymentsApi.create({
        tenant_id: charge.tenant_id,
        rent_charge_id: values.rent_charge_id,
        amount: values.amount,
        payment_date: values.payment_date.format('YYYY-MM-DD'),
        payment_method: 'mobile_money',
        reference_number: values.reference_number,
        notes: account ? `Lipa Namba: ${account.label}` : undefined,
      })
      message.success('Payment submitted successfully')
      form.resetFields()
      setPayOpen(false)
      fetchDashboard()
    } catch (err) {
      if (err?.errorFields) return
      message.error(err?.response?.data?.message || 'Failed to submit payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            Welcome, {tenant.name || 'Tenant'}
          </Title>
          <Text type="secondary" style={{ display: 'block' }}>
            Here is an overview of your rental status
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PayCircleOutlined />}
          disabled={outstanding.length === 0}
          onClick={openPayModal}
        >
          Pay Rent
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard title="Current Room" value={room.name || '-'} icon={<HomeOutlined />} color="#0d6e3f" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Next Due Date"
            value={stats.next_due_date ? dayjs(stats.next_due_date).format('DD MMM YYYY') : '-'}
            icon={<CalendarOutlined />}
            color="#fa8c16"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard title="Current Balance" value={<CurrencyDisplay amount={stats.current_balance} />} icon={<WalletOutlined />} color="#f5222d" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard title="Total Paid" value={<CurrencyDisplay amount={stats.total_paid} />} icon={<PayCircleOutlined />} color="#52c41a" />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Current Room Details" bordered={false} style={{ borderRadius: 8 }}>
            {room.name ? (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Room</Text>
                  <br />
                  <Text strong>{room.name}</Text>
                </div>
                <div>
                  <Text type="secondary">House</Text>
                  <br />
                  <Text strong>{room.house_name || room.house?.name || '-'}</Text>
                </div>
                <div>
                  <Text type="secondary">Rent Amount</Text>
                  <br />
                  <CurrencyDisplay amount={room.rent_amount} />
                </div>
                <div>
                  <Text type="secondary">Status</Text>
                  <br />
                  <StatusBadge status={room.status || 'active'} />
                </div>
              </Space>
            ) : (
              <Empty description="No room assigned" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Payments" bordered={false} style={{ borderRadius: 8 }}>
            <List
              dataSource={recentPayments}
              locale={{ emptyText: <Empty description="No payments yet" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <CurrencyDisplay amount={item.amount} />
                        <StatusBadge status={item.status || 'paid'} />
                      </Space>
                    }
                    description={
                      <Space>
                        <Text type="secondary">
                          {item.payment_date ? dayjs(item.payment_date).format('DD MMM YYYY') : item.month || ''}
                        </Text>
                        {item.payment_method && <Text type="secondary">&middot; {item.payment_method}</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Pay Rent"
        open={payOpen}
        onOk={handleSubmitPayment}
        onCancel={() => setPayOpen(false)}
        confirmLoading={saving}
        okText="Submit Payment"
        forceRender
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Paying as">
            <Input readOnly value={tenant.name || user?.name || '-'} />
          </Form.Item>
          <Form.Item
            name="rent_charge_id"
            label="Rent Period"
            rules={[{ required: true, message: 'Please select a rent period' }]}
          >
            <Select
              placeholder="Select rent period"
              onChange={handleChargeChange}
              options={outstanding.map((c) => ({
                value: c.id,
                label: `${c.period_start ? dayjs(c.period_start).format('MMMM YYYY') : 'Rent'} - Balance ${Number(c.balance).toLocaleString()}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter the amount' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Amount to pay" />
          </Form.Item>
          <Form.Item
            name="payment_account"
            label="Pay To (Lipa Namba)"
            rules={[{ required: true, message: 'Please select a Lipa Namba number' }]}
          >
            <Select options={paymentOptions} placeholder="Select Lipa Namba number" />
          </Form.Item>
          <Form.Item
            name="payment_date"
            label="Payment Date"
            rules={[{ required: true, message: 'Please select the payment date' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reference_number" label="Reference Number">
            <Input placeholder="Transaction/MPESA reference (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}