import axios from './axios'

export const getAll = (params) =>
  axios.get('/owner/tenants', { params })

export const getById = (id) =>
  axios.get(`/owner/tenants/${id}`)

export const create = (data) =>
  axios.post('/owner/tenants', data)

export const update = (id, data) =>
  axios.put(`/owner/tenants/${id}`, data)

export const destroy = (id) =>
  axios.delete(`/owner/tenants/${id}`)

export const getRentals = (id) =>
  axios.get(`/owner/tenants/${id}/rentals`)

export const getPayments = (id) =>
  axios.get(`/owner/tenants/${id}/payments`)

export const getBalance = (id) =>
  axios.get(`/owner/tenants/${id}/balance`)

export const resetPassword = (id) =>
  axios.post(`/owner/tenants/${id}/reset-password`)
