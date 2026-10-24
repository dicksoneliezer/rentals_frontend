import { useState, useEffect } from 'react'
import {
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Card,
  message,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Space,
} from 'antd'
import { PayCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as tenantApi from '../../api/tenant'
import * as paymentsApi from '../../api/payments'
import PageHeader from '../../components/common/PageHeader'
import CurrencyDisplay from '../../components/common/CurrencyDisplay'
import EmptyState from '../../components/common/EmptyState'
import ReceiptModal from '../../components/common/ReceiptModal'

const { Text } = Typography
const { Option } = Select

const methodColors = {
  cash: 'green',
  mobile_money: 'blue',
  bank_transfer: 'purple',
  cheque: 'orange',
  card: 'cyan',
  other: 'default',
}

export default function MyPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [dashboard, setDashboard] = useState(null)
  const [outstanding, setOutstanding] = useState([])
  const [payOpen, setPayOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [viewReceiptId, setViewReceiptId] = useState(null)
  const [paymentOptions, setPaymentOptions] = useState([])
  const [form] = Form.useForm()

  const fetchPayments = async (page = 1) => {
    setLoading(true)
    try {
      const res = await tenantApi.getMyPayments({ page, per_page: pagination.pageSize })
      const data = res.data.data || res.data
      setPayments(Array.isArray(data) ? data : data.payments || [])
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: data.total || (Array.isArray(data) ? data.length : 0),
      }))
    } catch {
      message.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
    fetchDashboard()
  }, [])

  useEffect(() => {
    const accounts = dashboard?.owner_settings?.payment_accounts || dashboard?.payment_accounts || []
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
  }, [dashboard])

  const fetchDashboard = async () => {
    try {
      const res = await tenantApi.getMyRoom()
      const data = res.data.data || res.data || {}
      setDashboard(data)
      const history = Array.isArray(data?.history) ? data.history : data?.outstanding_charges || []
      const filtered = Array.isArray(history)
        ? history.filter(
            (c) => c.status === 'unpaid' || c.status === 'partial' || c.status === 'overdue',
          )
        : []
      setOutstanding(filtered)
    } catch {
      // silently ignore
    }
  }

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const totalExpected = payments.reduce((sum, p) => sum + Number(p.expected_amount || p.amount || 0), 0)
  const totalBalance = payments.reduce((sum, p) => sum + Number(p.balance || 0), 0)

  const openPayModal = () => {
    if (outstanding.length === 0) {
      message.info('No outstanding charges to pay.')
      return
    }
    form.resetFields()
    form.setFieldsValue({
      payment_date: dayjs(),
      amount: Number(outstanding[0]?.balance || outstanding[0]?.outstanding || outstanding[0]?.expected_amount || 0),
      rent_charge_id: outstanding[0]?.id,
      payment_account: paymentOptions[0]?.value,
    })
    setPayOpen(true)
  }

  const handlePay = async (values) => {
    try {
      const charge = outstanding.find((c) => c.id === values.rent_charge_id)
      if (!charge) return
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
      fetchPayments(pagination.current)
      fetchDashboard()
    } catch (err) {
      if (err?.errorFields) return
      message.error(err?.response?.data?.message || 'Failed to submit payment')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (val) => (val ? dayjs(val).format('MMM D, YYYY') : '-'),
      sorter: (a, b) => new Date(a.payment_date) - new Date(b.payment_date),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => <CurrencyDisplay amount={val} />,
    },
    {
      title: 'Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (val) =>
        val ? (
          <Tag color={methodColors[val] || 'default'}>
            {val.replace(/_/g, ' ').toUpperCase()}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Reference',
      dataIndex: 'reference_number',
      key: 'reference_number',
      render: (val) => val || '-',
    },
    {
      title: 'Rent Period',
      dataIndex: 'rent_period',
      key: 'rent_period',
      render: (val) => val || '-',
    },
    {
      title: 'Receipt',
      key: 'receipt',
      render: (_, record) => {
        const receipt = record.receipt
        if (!receipt) return '-'
        return <a onClick={() => setViewReceiptId(receipt.id)}>{receipt.receipt_number}</a>
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="My Payments"
        subtitle="View your payment history"
        extra={
          <Button
            type="primary"
            icon={<PayCircleOutlined />}
            onClick={openPayModal}
            disabled={outstanding.length === 0}
          >
            Pay Now
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 8, textAlign: 'center' }}>
            <Text type="secondary">Total Paid</Text>
            <div>
              <CurrencyDisplay amount={totalPaid} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 8, textAlign: 'center' }}>
            <Text type="secondary">Total Expected</Text>
            <div>
              <CurrencyDisplay amount={totalExpected} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 8, textAlign: 'center' }}>
            <Text type="secondary">Total Balance</Text>
            <div>
              <CurrencyDisplay amount={totalBalance} />
            </div>
          </Card>
        </Col>
      </Row>

      {!loading && payments.length === 0 ? (
        <EmptyState title="No Payments" description="No payments recorded yet." />
      ) : (
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} payments`,
            onChange: (page) => fetchPayments(page),
          }}
        />
      )}

      <Modal
        title="Make Payment"
        open={payOpen}
        onCancel={() => setPayOpen(false)}
        confirmLoading={saving}
        onOk={() => form.submit()}
        okText="Submit Payment"
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={handlePay}>
          <Form.Item
            name="rent_charge_id"
            label="Outstanding Charge"
            rules={[{ required: true, message: 'Please select a charge' }]}
          >
            <Select placeholder="Select outstanding charge">
              {outstanding.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.period_start ? dayjs(c.period_start).format('MMM YYYY') : 'Charge'}
                  {` - `}
                  <CurrencyDisplay amount={c.balance || c.outstanding || (c.expected_amount - c.paid_amount)} />
                  {c.due_date ? ` (Due ${dayjs(c.due_date).format('DD MMM YYYY')})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <Input type="number" min="0.01" step="0.01" />
          </Form.Item>

          <Form.Item
            name="payment_date"
            label="Payment Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="payment_account"
            label="Pay To (Lipa Namba)"
            rules={[{ required: true, message: 'Please select a Lipa Namba number' }]}
          >
            <Select options={paymentOptions} placeholder="Select Lipa Namba number" />
          </Form.Item>

          <Form.Item name="reference_number" label="Reference Number">
            <Input placeholder="e.g. Transaction ID" />
          </Form.Item>
        </Form>
      </Modal>

      <ReceiptModal
        receiptId={viewReceiptId}
        open={!!viewReceiptId}
        onClose={() => setViewReceiptId(null)}
      />
    </div>
  )
}
