import axios from './axios'

export const getAll = (params) =>
  axios.get('/rooms', { params })

export const getById = (id) =>
  axios.get(`/rooms/${id}`)

export const create = (houseId, data) =>
  axios.post(`/owner/houses/${houseId}/rooms`, data)

export const update = (id, data) =>
  axios.put(`/rooms/${id}`, data)

export const destroy = (id) =>
  axios.delete(`/rooms/${id}`)

export const getHistory = (id) =>
  axios.get(`/rooms/${id}/history`)
