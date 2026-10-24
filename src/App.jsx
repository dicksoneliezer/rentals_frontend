import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { BrandingProvider } from './contexts/BrandingContext'
import Login from './pages/Login'
import SetPassword from './pages/SetPassword'
import ForgotPassword from './pages/ForgotPassword'
import SignContract from './pages/SignContract'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import OwnerLayout from './layouts/OwnerLayout'
import TenantLayout from './layouts/TenantLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { homePathForRole } from './config/roles'
import Pwa from './components/Pwa'
import Home from './pages/public/Home'
import Listings from './pages/public/Listings'
import ListingDetail from './pages/public/ListingDetail'
import Register from './pages/public/Register'

const theme = {
  token: {
    colorPrimary: '#0d6e3f',
    borderRadius: 6,
  },
  components: {
    Layout: {
      siderBg: '#0a2a4d',
      headerBg: '#ffffff',
    },
    Menu: {
      darkBg: '#0a2a4d',
      darkItemBg: '#0a2a4d',
      darkSubMenuItemBg: '#0a2a4d',
    },
  },
}

function Root() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) {
    return <Navigate to={homePathForRole(user)} replace />
  }
  return <Home />
}

function App() {
  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BrandingProvider>
            <Pwa />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/contracts/sign/:token" element={<SignContract />} />
              <Route path="/" element={<Root />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/owner/*"
                element={
                  <ProtectedRoute role="owner">
                    <OwnerLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenant/*"
                element={
                  <ProtectedRoute role="tenant">
                    <TenantLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute role="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App