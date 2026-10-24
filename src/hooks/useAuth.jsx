import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getUser, login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const response = await getUser()
      setUser(response.data.data || response.data)
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    if (token && !user) {
      localStorage.setItem('token', token)
      fetchUser().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (phone, password) => {
    const response = await apiLogin(phone, password)
    const data = response.data.data || response.data
    const newToken = data.token
    const newUser = data.user

    setToken(newToken)
    localStorage.setItem('token', newToken)
    setUser(newUser)
    setLoading(false)

    return response.data
  }

  const register = async (payload) => {
    const response = await apiRegister(payload)
    const data = response.data.data || response.data
    const newToken = data.token
    const newUser = data.user

    setToken(newToken)
    localStorage.setItem('token', newToken)
    setUser(newUser)
    setLoading(false)

    return response.data
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // ignore logout errors
    } finally {
      setUser(null)
      setToken(null)
      setLoading(false)
      localStorage.removeItem('token')
    }
  }

  const refreshUser = useCallback(async () => {
    if (!token) return false
    const ok = await fetchUser()
    if (!ok) {
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
    }
    return ok
  }, [token, fetchUser])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
