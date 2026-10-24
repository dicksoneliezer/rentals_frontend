import axios from './axios'

export const login = (phone, password) =>
  axios.post('/login', { phone, password })

export const register = (data) =>
  axios.post('/register', data)

export const logout = () =>
  axios.post('/logout')

export const getUser = () =>
  axios.get('/profile')

export const forgotPassword = (phone) =>
  axios.post('/forgot-password', { phone })

export const resetPassword = (data) =>
  axios.post('/reset-password', data)
