import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.must_change_password) return <Navigate to="/set-password" replace />
  if (role) {
    const allowed = [].concat(role)
    if (!allowed.includes(user.role)) return <Navigate to="/login" replace />
  }

  return children
}
