import { Routes, Route } from 'react-router-dom'
import { DashboardOutlined, TeamOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import AppLayout from './AppLayout'
import AdminDashboard from '../pages/admin/AdminDashboard'
import Users from '../pages/admin/Users'
import Verifications from '../pages/admin/Verifications'
import VerifiedOwners from '../pages/admin/VerifiedOwners'
import Reports from '../pages/admin/Reports'
import AdminFeedback from '../pages/admin/Feedback'

const adminMenuItems = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <DashboardOutlined />,
    children: [{ key: '/admin', label: 'Dashboard' }],
  },
  {
    key: 'users',
    label: 'User Management',
    icon: <TeamOutlined />,
    children: [
      { key: '/admin/users', label: 'Users' },
      { key: '/admin/verifications', label: 'Owner Verifications' },
      { key: '/admin/verified-owners', label: 'Verified Owners' },
    ],
  },
  {
    key: 'moderation',
    label: 'Moderation',
    icon: <SafetyCertificateOutlined />,
    children: [
      { key: '/admin/reports', label: 'Reports' },
      { key: '/admin/feedback', label: 'Feedback' },
    ],
  },
]

export default function AdminLayout() {
  return (
    <AppLayout menuItems={adminMenuItems} siderColor="#0a2a4d">
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="verifications" element={<Verifications />} />
        <Route path="verified-owners" element={<VerifiedOwners />} />
        <Route path="reports" element={<Reports />} />
        <Route path="feedback" element={<AdminFeedback />} />
      </Routes>
    </AppLayout>
  )
}
