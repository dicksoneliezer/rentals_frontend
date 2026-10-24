import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Typography } from 'antd'
import {
  DollarOutlined,
  TeamOutlined,
  HomeOutlined,
  BankOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const reportTypes = [
  {
    key: 'rent-collection',
    title: 'Rent Collection',
    description: 'Overview of rent collected over time',
    icon: <DollarOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
    color: '#f6ffed',
  },
  {
    key: 'tenant-summary',
    title: 'Tenant Summary',
    description: 'Summary of all tenants and their statuses',
    icon: <TeamOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
    color: '#e6f7ff',
  },
  {
    key: 'room-performance',
    title: 'Room Performance',
    description: 'Occupancy and revenue per room',
    icon: <HomeOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
    color: '#f9f0ff',
  },
  {
    key: 'house-income',
    title: 'House Income',
    description: 'Income breakdown by house',
    icon: <BankOutlined style={{ fontSize: 32, color: '#faad14' }} />,
    color: '#fffbe6',
  },
  {
    key: 'arrears',
    title: 'Arrears',
    description: 'All outstanding balances and overdue payments',
    icon: <WarningOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />,
    color: '#fff2f0',
  },
  {
    key: 'expiry',
    title: 'Lease Expiry',
    description: 'Rentals expiring soon',
    icon: <ClockCircleOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
    color: '#fff7e6',
  },
  {
    key: 'monthly',
    title: 'Monthly Report',
    description: 'Comprehensive monthly financial summary',
    icon: <CalendarOutlined style={{ fontSize: 32, color: '#13c2c2' }} />,
    color: '#e6fffb',
  },
]

export default function ReportList() {
  const navigate = useNavigate()

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Reports</Title>
      <Row gutter={[16, 16]}>
        {reportTypes.map((report) => (
          <Col xs={24} sm={12} lg={8} key={report.key}>
            <Card
              hoverable
              onClick={() => navigate(`/owner/reports/${report.key}`)}
              style={{ borderRadius: 8 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    backgroundColor: report.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {report.icon}
                </div>
                <div>
                  <Title level={5} style={{ margin: 0 }}>{report.title}</Title>
                  <Text type="secondary">{report.description}</Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
