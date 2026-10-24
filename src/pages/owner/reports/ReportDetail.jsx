import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Table, DatePicker, Button, Space, message } from 'antd'
import dayjs from 'dayjs'
import * as reportsApi from '../../../api/reports'
import PageHeader from '../../../components/common/PageHeader'
import CurrencyDisplay from '../../../components/common/CurrencyDisplay'
import StatusBadge from '../../../components/common/StatusBadge'
import EmptyState from '../../../components/common/EmptyState'
import { DownloadOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

const reportConfig = {
  'rent-collection': {
    title: 'Rent Collection Report',
    columns: [
      { title: 'Period', dataIndex: 'period', key: 'period' },
      { title: 'Expected', dataIndex: 'expected_amount', key: 'expected_amount', render: (v) => <CurrencyDisplay amount={v} /> },
      { title: 'Collected', dataIndex: 'collected_amount', key: 'collected_amount', render: (v) => <CurrencyDisplay amount={v} /> },
      { title: 'Outstanding', dataIndex: 'outstanding_amount', key: 'outstanding_amount', render: (v) => <CurrencyDisplay amount={v} /> },
      { title: 'Collection Rate', dataIndex: 'collection_rate', key: 'collection_rate', render: (v) => v ? `${Number(v).toFixed(1)}%` : '-' },
    ],
    api: reportsApi.rentCollection,
    hasDateFilter: true,
  },
  'tenant-summary': {
    title: 'Tenant Summary',
    columns: [
      { title: 'Name', dataIndex: 'full_name', key: 'full_name' },
      { title: 'Phone', dataIndex: 'phone', key: 'phone' },
      { title: 'Room', key: 'room', render: (_, r) => r.room?.name || r.room_name || '-' },
      { title: 'House', key: 'house', render: (_, r) => r.room?.house?.name || r.house_name || '-' },
      { title: 'Balance', dataIndex: 'balance', key: 'balance', render: (v) => <CurrencyDisplay amount={v} /> },
      { title: 'Status', dataIndex: 'status', key: 'status', render: (v) => <StatusBadge status={v} /> },
    ],
    api: reportsApi.tenantSummary,
    hasDateFilter: false,
  },
  'room-performance': {
    title: 'Room Performance',
    columns: [
      { title: 'Room', dataIndex: 'name', key: 'name' },
      { title: 'House', key: 'house', render: (_, r) => r.house?.name || r.house_name || '-' },
      { title: 'Rent', dataIndex: 'rent_amount', key: 'rent_amount', render: (v) => <CurrencyDisplay amount={v} /> },
      {
        title: 'Occupied Months',
        dataIndex: 'occupied_months',
        key: 'occupied_months',
        render: (v, r) => `${v}/${r.total_months ?? '-'}`,
      },
      { title: 'Revenue', dataIndex: 'total_revenue', key: 'total_revenue', render: (v) => <CurrencyDisplay amount={v} /> },
      { title: 'Occupancy Rate', dataIndex: 'occupancy_rate', key: 'occupancy_rate', render: (v) => `${Number(v || 0).toFixed(1)}%` },
    ],
    api: reportsApi.roomPerformance,
    hasDateFilter: true,
  },
  'house-income': {
    title: 'House Income Report',
    columns: [
      { title: 'House', dataIndex: 'name', key: 'name' },
      { title: 'Rooms', dataIndex: 'total_rooms', key: 'total_rooms' },
      { title: 'Expected', dataIndex: 'expected_income', key: 'expected_income', render: (v) => <CurrencyDisplay amount={v} /> },
      { title: 'Collected', dataIndex: 'collected_income', key: 'collected_income', render: (v) => <CurrencyDisplay amount={v} /> },
      { title: 'Outstanding', dataIndex: 'outstanding', key: 'outstanding', render: (v) => <CurrencyDisplay amount={v} /> },
    ],
    api: reportsApi.houseIncome,
    hasDateFilter: true,
  },
  arrears: {
    title: 'Arrears Report',
    columns: [
      { title: 'Tenant', key: 'tenant', render: (_, r) => r.tenant?.full_name || r.tenant_name || '-' },
      { title: 'Room', key: 'room', render: (_, r) => r.room?.name || r.room_name || '-' },
      { title: 'Overdue Amount', dataIndex: 'overdue_amount', key: 'overdue_amount', render: (v) => <CurrencyDisplay amount={v} /> },
      { title: 'Days Overdue', dataIndex: 'days_overdue', key: 'days_overdue', render: (v) => `${v ?? 0} day(s)` },
      { title: 'Due Date', dataIndex: 'due_date', key: 'due_date', render: (v) => v ? dayjs(v).format('MMM D, YYYY') : '-' },
    ],
    api: reportsApi.arrears,
    hasDateFilter: false,
  },
  expiry: {
    title: 'Lease Expiry Report',
    columns: [
      { title: 'Tenant', key: 'tenant', render: (_, r) => r.tenant?.full_name || r.tenant_name || '-' },
      { title: 'Room', key: 'room', render: (_, r) => r.room?.name || r.room_name || '-' },
      { title: 'End Date', dataIndex: 'end_date', key: 'end_date', render: (v) => v ? dayjs(v).format('MMM D, YYYY') : '-' },
      { title: 'Days Left', dataIndex: 'days_remaining', key: 'days_remaining', render: (v) => (v == null ? '-' : `${v} day(s)`) },
      { title: 'Status', dataIndex: 'status', key: 'status', render: (v) => <StatusBadge status={v} /> },
    ],
    api: reportsApi.expiry,
    hasDateFilter: false,
  },
  monthly: {
    title: 'Monthly Report',
    columns: [
      { title: 'Month', dataIndex: 'month', key: 'month' },
      { title: 'Income', dataIndex: 'income', key: 'income', render: (v) => <CurrencyDisplay amount={v} /> },
      { title: 'Expected', dataIndex: 'expected', key: 'expected', render: (v) => <CurrencyDisplay amount={v} /> },
      { title: 'Outstanding', dataIndex: 'outstanding', key: 'outstanding', render: (v) => <CurrencyDisplay amount={v} /> },
      { title: 'Charges', dataIndex: 'charge_count', key: 'charge_count' },
      // Share of charges settled in full. This is not occupancy: the old column
      // carried this same number under an "Occupancy" heading.
      { title: 'Charges Paid', dataIndex: 'charge_paid_rate', key: 'charge_paid_rate', render: (v) => `${Number(v || 0).toFixed(1)}%` },
    ],
    api: reportsApi.monthly,
    hasDateFilter: true,
  },
}

export default function ReportDetail() {
  const { type } = useParams()
  const config = reportConfig[type]
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(null)

  useEffect(() => {
    if (!config) return
    setLoading(true)
    const params = {}
    if (config.hasDateFilter && dateRange) {
      if (dateRange[0]) params.from_date = dateRange[0].format('YYYY-MM-DD')
      if (dateRange[1]) params.to_date = dateRange[1].format('YYYY-MM-DD')
    }
    config
      .api(params)
      .then((res) => {
        const result = res.data.data || res.data
        setData(Array.isArray(result) ? result : result.data || [])
      })
      .catch(() => message.error('Failed to load report'))
      .finally(() => setLoading(false))
  }, [type, dateRange])

  const getRawValue = (row, col) => {
    const path = col.dataIndex || col.key
    if (!path) return ''
    let value = row
    for (const part of String(path).split('.')) {
      if (value == null) return ''
      value = value[part]
    }
    if (value == null || value === '') {
      const flat = row[`${path}_name`]
      if (flat != null) value = flat
    }
    if (value == null) return ''
    if (typeof value === 'object') {
      // Relation columns (room/house/tenant) hold models, so exporting them
      // verbatim produced "[object Object]".
      const label = value.name || value.full_name
      if (label != null) return String(label)
    }
    if (value instanceof Date || (typeof value === 'string' && value.includes('T') && /^\d{4}-\d{2}-\d{2}/.test(value))) {
      return dayjs(value).format('YYYY-MM-DD')
    }
    if (typeof value === 'number') return String(value)
    return String(value)
  }

  const handleExport = () => {
    if (!config || data.length === 0) return
    const headers = config.columns.map((c) => c.title)
    const rows = data.map((row) => config.columns.map((c) => getRawValue(row, c)))
    const escapeCell = (cell) => {
      const str = String(cell ?? '')
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
    }
    const csv = [headers, ...rows]
      .map((r) => r.map(escapeCell).join(','))
      .join('\n')

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${config.title.replace(/\s+/g, '-').toLowerCase()}-${dayjs().format('YYYYMMDD')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!config) {
    return <EmptyState title="Report Not Found" />
  }

  return (
    <div>
      <PageHeader
        title={config.title}
        extra={
          <Space>
            {config.hasDateFilter && (
              <RangePicker value={dateRange} onChange={(dates) => setDateRange(dates)} />
            )}
            <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={data.length === 0}>
              Export
            </Button>
          </Space>
        }
      />
      {data.length === 0 && !loading ? (
        <EmptyState title="No Data" description="No report data available for the selected period." />
      ) : (
        <Table
          columns={config.columns}
          dataSource={data}
          rowKey={(r, i) => r.id || i}
          loading={loading}
          pagination={data.length > 10 ? { pageSize: 10, showSizeChanger: true } : false}
          scroll={{ x: 'max-content' }}
        />
      )}
    </div>
  )
}
