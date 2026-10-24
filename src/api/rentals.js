import axios from './axios'

export const getAll = (params) =>
  axios.get('/rentals', { params })

export const getById = (id) =>
  axios.get(`/rentals/${id}`)

export const create = (data) =>
  axios.post('/rentals', data)

export const update = (id, data) =>
  axios.put(`/rentals/${id}`, data)

export const renew = (id, data = {}) =>
  axios.post(`/rentals/${id}/renew`, data)

export const terminate = (id) =>
  axios.post(`/rentals/${id}/terminate`)

export const getCharges = (id) =>
  axios.get(`/rentals/${id}/charges`)

export const getRentCharges = (params) =>
  axios.get('/rent-charges', { params })
