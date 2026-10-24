import axios from './axios'

export const getMyRoom = () =>
  axios.get('/dashboard/tenant')

export const getMyBalance = () =>
  axios.get('/dashboard/tenant')

export const getMyPayments = (params) =>
  axios.get('/payments', { params })

export const getMyReceipts = (params) =>
  axios.get('/receipts', { params })

export const getMyReceiptById = (id) =>
  axios.get(`/receipts/${id}`)

export const getProfile = () =>
  axios.get('/profile')

export const updateProfile = (data) =>
  axios.put('/profile', data)
