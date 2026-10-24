import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { homePathForRole } from '../config/roles'

export default function Dashboard() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={homePathForRole(user)} replace />
}
