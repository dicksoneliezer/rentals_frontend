import axios from './axios'

export const getAll = (params) =>
  axios.get('/owner/houses', { params })

export const getById = (id) =>
  axios.get(`/owner/houses/${id}`)

export const create = (data) =>
  axios.post('/owner/houses', data)

export const update = (id, data) =>
  axios.put(`/owner/houses/${id}`, data)

export const destroy = (id) =>
  axios.delete(`/owner/houses/${id}`)

export const getRooms = (id) =>
  axios.get(`/owner/houses/${id}/rooms`)

export const getSummary = (id) =>
  axios.get(`/owner/houses/${id}/summary`)
