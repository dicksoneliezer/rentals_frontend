import axios from './axios'

export const getAll = (params) =>
  axios.get('/receipts', { params })

export const getById = (id) =>
  axios.get(`/receipts/${id}`)

export const download = (id) =>
  axios.get(`/receipts/${id}/download`, { responseType: 'blob' })
