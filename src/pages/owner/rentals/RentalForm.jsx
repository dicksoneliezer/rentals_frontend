import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, Row, Col, Descriptions, message } from 'antd'
import dayjs from 'dayjs'
import * as rentalsApi from '../../../api/rentals'
import * as tenantsApi from '../../../api/tenants'
import * as housesApi from '../../../api/houses'
import * as roomsApi from '../../../api/rooms'
import PageHeader from '../../../components/common/PageHeader'

export default function RentalForm() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tenants, setTenants] = useState([])
  const [houses, setHouses] = useState([])
  const [availableRooms, setAvailableRooms] = useState([])
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)

  useEffect(() => {
    tenantsApi.getAll({ per_page: 100 }).then((res) => {
      const data = res.data.data || res.data
      setTenants(Array.isArray(data) ? data : data.tenants || [])
    })
    housesApi.getAll({ per_page: 100 }).then((res) => {
      const data = res.data.data || res.data
      setHouses(Array.isArray(data) ? data : data.houses || [])
    })
  }, [])

  useEffect(() => {
    if (selectedHouse) {
      housesApi.getRooms(selectedHouse).then((res) => {
        const data = res.data.data || res.data
        const rooms = Array.isArray(data) ? data : data.rooms || []
        setAvailableRooms(rooms.filter((r) => r.status === 'available'))
      })
    } else {
      setAvailableRooms([])
    }
  }, [selectedHouse])

  useEffect(() => {
    if (selectedRoom) {
      roomsApi.getById(selectedRoom).then((res) => {
        const room = res.data.data || res.data
        form.setFieldsValue({ rent_amount: room.rent_amount })
      })
    }
  }, [selectedRoom, form])

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const payload = {
        tenant_id: values.tenant_id,
        room_id: values.room_id,
        rent_amount: values.rent_amount,
        start_date: values.start_date.format('YYYY-MM-DD'),
        period_months: values.period_months || 1,
        deposit_amount: values.deposit_amount || 0,
        rent_adjustment_reason: values.rent_adjustment_reason || null,
      }
      await rentalsApi.create(payload)
      message.success('Rental created successfully')
      navigate('/owner/rentals')
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to create rental')
    } finally {
      setLoading(false)
    }
  }

  const startDate = Form.useWatch('start_date', form)

  return (
    <div>
      <PageHeader
        title="Create Rental"
        onBack={() => navigate(-1)}
      />
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ period_months: 1, deposit_amount: 0 }}
          style={{ maxWidth: 700 }}
        >
          <Form.Item
            name="tenant_id"
            label="Tenant"
            rules={[{ required: true, message: 'Please select a tenant' }]}
          >
            <Select
              placeholder="Select tenant"
              showSearch
              optionFilterProp="label"
              options={tenants.map((t) => ({
                value: t.id,
                label: `${t.full_name} (${t.phone})`,
              }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="house_id"
                label="House"
                rules={[{ required: true, message: 'Select a house' }]}
              >
                <Select
                  placeholder="Select house"
                  showSearch
                  optionFilterProp="label"
                  options={houses.map((h) => ({ value: h.id, label: h.name }))}
                  onChange={(val) => {
                    setSelectedHouse(val)
                    setSelectedRoom(null)
                    form.setFieldsValue({ room_id: undefined })
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="room_id"
                label="Room"
                rules={[{ required: true, message: 'Select a room' }]}
              >
                <Select
                  placeholder={selectedHouse ? 'Select room' : 'Select house first'}
                  showSearch
                  optionFilterProp="label"
                  disabled={!selectedHouse}
                  options={availableRooms.map((r) => ({
                    value: r.id,
                    label: `${r.name} - TZS ${Number(r.rent_amount).toLocaleString()}`,
                  }))}
                  onChange={(val) => setSelectedRoom(val)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="rent_amount"
            label="Rent Amount (TZS)"
            rules={[{ required: true, message: 'Enter rent amount' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val.replace(/,/g, '')}
            />
          </Form.Item>
          {selectedRoom && (
            <Form.Item name="rent_adjustment_reason" label="Reason for Rent Adjustment">
              <Input placeholder="Required if rent differs from room rate" />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Start Date"
                rules={[{ required: true, message: 'Select start date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="period_months"
                label="Period (Months)"
                rules={[{ required: true, message: 'Enter period' }]}
              >
                <InputNumber min={1} max={12} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {startDate && (
            <Descriptions bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Due Day">
                {dayjs(startDate).date()}th of each month
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {dayjs(startDate).add(form.getFieldValue('period_months') || 1, 'month').subtract(1, 'day').format('MMM D, YYYY')}
              </Descriptions.Item>
            </Descriptions>
          )}

          <Form.Item name="deposit_amount" label="Deposit Amount (TZS)">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val.replace(/,/g, '')}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Rental
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
