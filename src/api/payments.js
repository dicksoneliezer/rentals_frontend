import axios from './axios'

export const getAll = (params) =>
  axios.get('/payments', { params })

export const getById = (id) =>
  axios.get(`/payments/${id}`)

export const create = (data) =>
  axios.post('/payments', data)

export const getTenantHistory = (tenantId) =>
  axios.get(`/payments/tenant/${tenantId}`)
