import { Routes, Route } from 'react-router-dom'
import {
  DashboardOutlined,
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  BarChartOutlined,
  BellOutlined,
  SettingOutlined,
  SearchOutlined,
  AccountBookOutlined,
  FileProtectOutlined,
} from '@ant-design/icons'
import AppLayout from './AppLayout'
import { useAuth } from '../hooks/useAuth'
import VerifyAccount from '../pages/owner/VerifyAccount'
import OwnerDashboard from '../pages/owner/Dashboard'
import HouseList from '../pages/owner/houses/HouseList'
import HouseForm from '../pages/owner/houses/HouseForm'
import HouseDetail from '../pages/owner/houses/HouseDetail'
import RoomDetail from '../pages/owner/rooms/RoomDetail'
import RoomForm from '../pages/owner/rooms/RoomForm'
import TenantList from '../pages/owner/tenants/TenantList'
import TenantForm from '../pages/owner/tenants/TenantForm'
import TenantDetail from '../pages/owner/tenants/TenantDetail'
import RentalList from '../pages/owner/rentals/RentalList'
import RentalForm from '../pages/owner/rentals/RentalForm'
import RentalDetail from '../pages/owner/rentals/RentalDetail'
import RentalRequests from '../pages/owner/requests/RentalRequests'
import ContractList from '../pages/owner/contracts/ContractList'
import ContractDetail from '../pages/owner/contracts/ContractDetail'
import ContractBuilder from '../pages/owner/contracts/ContractBuilder'
import PaymentList from '../pages/owner/payments/PaymentList'
import PaymentForm from '../pages/owner/payments/PaymentForm'
import ReceiptList from '../pages/owner/receipts/ReceiptList'
import ReceiptPage from '../pages/owner/receipts/ReceiptPage'
import ReportList from '../pages/owner/reports/ReportList'
import ReportDetail from '../pages/owner/reports/ReportDetail'
import SearchPage from '../pages/owner/Search'
import Notifications from '../pages/owner/Notifications'
import Settings from '../pages/owner/Settings'
import Feedback from '../pages/shared/Feedback'


// Menu order matters only for visual order — AppLayout now selects the
// most specific match regardless of position.
const ownerMenuItems = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <DashboardOutlined />,
    children: [
      { key: '/owner', label: 'Dashboard' },
      { key: '/owner/search', label: 'Search' },
    ],
  },
  {
    key: 'property',
    label: 'Property',
    icon: <HomeOutlined />,
    children: [
      { key: '/owner/houses', label: 'Houses' },
      { key: '/owner/tenants', label: 'Tenants' },
      { key: '/owner/rentals', label: 'Rentals' },
      { key: '/owner/rental-requests', label: 'Rental Requests' },
    ],
  },
  {
    key: 'contracts-finance',
    label: 'Contracts & Finance',
    icon: <FileTextOutlined />,
    children: [
      { key: '/owner/contracts', label: 'Contracts' },
      { key: '/owner/payments', label: 'Payments' },
      { key: '/owner/receipts', label: 'Receipts' },
    ],
  },
  {
    key: 'insights-system',
    label: 'Insights & System',
    icon: <BarChartOutlined />,
    children: [
      { key: '/owner/reports', label: 'Reports' },
      { key: '/owner/notifications', label: 'Notifications' },
      { key: '/owner/settings', label: 'Settings' },
      { key: '/owner/feedback', label: 'Feedback' },
    ],
  },
]

export default function OwnerLayout() {
  const { user } = useAuth()

  // An owner cannot use the dashboard until an administrator approves their
  // documents. Rather than let every page fail with a 403, show the sandbox
  // verification screen instead of the app shell.
  if (user?.role === 'owner' && user.verification_status !== 'approved') {
    return <VerifyAccount />
  }

  return (
    <AppLayout menuItems={ownerMenuItems}>
      <Routes>
        {/* Dashboard */}
        <Route index element={<OwnerDashboard />} />

        {/* Houses */}
        <Route path="houses" element={<HouseList />} />
        <Route path="houses/new" element={<HouseForm />} />
        <Route path="houses/:id" element={<HouseDetail />} />
        <Route path="houses/:id/edit" element={<HouseForm />} />
        <Route path="houses/:houseId/rooms/new" element={<RoomForm />} />

        {/* Rooms */}
        <Route path="rooms/:id" element={<RoomDetail />} />
        <Route path="rooms/:id/edit" element={<RoomForm />} />

        {/* Tenants */}
        <Route path="tenants" element={<TenantList />} />
        <Route path="tenants/new" element={<TenantForm />} />
        <Route path="tenants/:id" element={<TenantDetail />} />
        <Route path="tenants/:id/edit" element={<TenantForm />} />

        {/* Rentals */}
        <Route path="rentals" element={<RentalList />} />
        <Route path="rentals/new" element={<RentalForm />} />
        <Route path="rentals/:id" element={<RentalDetail />} />

        {/* Rental Requests */}
        <Route path="rental-requests" element={<RentalRequests />} />

        {/* Contracts */}
        <Route path="contracts" element={<ContractList />} />
        <Route path="contracts/new" element={<ContractBuilder />} />
        <Route path="contracts/:id" element={<ContractDetail />} />
        <Route path="contracts/:id/edit" element={<ContractBuilder />} />

        {/* Payments */}
        <Route path="payments" element={<PaymentList />} />
        <Route path="payments/new" element={<PaymentForm />} />

        {/* Receipts */}
        <Route path="receipts" element={<ReceiptList />} />
        <Route path="receipts/:id" element={<ReceiptPage />} />

        {/* Reports */}
        <Route path="reports" element={<ReportList />} />
        <Route path="reports/:type" element={<ReportDetail />} />

        {/* Misc */}
        <Route path="search" element={<SearchPage />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="feedback" element={<Feedback />} />
      </Routes>
    </AppLayout>
  )
}