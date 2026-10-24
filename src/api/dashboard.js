import axios from './axios'

export const getOwnerDashboard = () =>
  axios.get('/owner/dashboard')

export const getTenantDashboard = () =>
  axios.get('/dashboard/tenant')
