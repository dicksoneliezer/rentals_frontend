import { Routes, Route } from 'react-router-dom'
import {
  DashboardOutlined,
  HomeOutlined,
  DollarOutlined,
  FileTextOutlined,
  BellOutlined,
  UserOutlined,
  FileProtectOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import AppLayout from './AppLayout'
import TenantDashboard from '../pages/tenant/Dashboard'
import MyRoom from '../pages/tenant/MyRoom'
import MyPayments from '../pages/tenant/MyPayments'
import MyReceipts from '../pages/tenant/MyReceipts'
import MyContracts from '../pages/tenant/MyContracts'
import MyContractDetail from '../pages/tenant/MyContractDetail'
import TenantNotifications from '../pages/tenant/TenantNotifications'
import TenantProfile from '../pages/tenant/TenantProfile'
import MyRequests from '../pages/tenant/Requests'
import ReportOwner from '../pages/tenant/ReportOwner'
import Feedback from '../pages/shared/Feedback'

// Menu order matters only for visual order — AppLayout selects the most
// specific match regardless of position.
const tenantMenuItems = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <DashboardOutlined />,
    children: [
      { key: '/tenant', label: 'Dashboard' },
      { key: '/tenant/my-room', label: 'My Room' },
      { key: '/tenant/requests', label: 'My Requests' },
    ],
  },
  {
    key: 'finances',
    label: 'Finances',
    icon: <DollarOutlined />,
    children: [
      { key: '/tenant/payments', label: 'My Payments' },
      { key: '/tenant/receipts', label: 'My Receipts' },
      { key: '/tenant/contracts', label: 'My Contracts' },
    ],
  },
  {
    key: 'support',
    label: 'Support',
    icon: <SafetyCertificateOutlined />,
    children: [
      { key: '/tenant/report-owner', label: 'Report an Owner' },
      { key: '/tenant/feedback', label: 'Feedback' },
    ],
  },
  {
    key: 'account',
    label: 'Account',
    icon: <UserOutlined />,
    children: [
      { key: '/tenant/notifications', label: 'Notifications' },
      { key: '/tenant/profile', label: 'Profile' },
    ],
  },
]

export default function TenantLayout() {
  return (
    <AppLayout menuItems={tenantMenuItems}>
      <Routes>
        {/* Dashboard */}
        <Route index element={<TenantDashboard />} />

        {/* My Room */}
        <Route path="my-room" element={<MyRoom />} />

        {/* Rental Requests */}
        <Route path="requests" element={<MyRequests />} />

        {/* Payments & Receipts */}
        <Route path="payments" element={<MyPayments />} />
        <Route path="receipts" element={<MyReceipts />} />

        {/* Contracts */}
        <Route path="contracts" element={<MyContracts />} />
        <Route path="contracts/:id" element={<MyContractDetail />} />

        {/* Support */}
        <Route path="report-owner" element={<ReportOwner />} />
        <Route path="feedback" element={<Feedback />} />

        {/* Misc */}
        <Route path="notifications" element={<TenantNotifications />} />
        <Route path="profile" element={<TenantProfile />} />
      </Routes>
    </AppLayout>
  )
}