import axios from './axios'

export const globalSearch = (query) =>
  axios.get('/owner/search', { params: { q: query } })

export const tenants = (query) =>
  axios.get('/owner/search/tenants', { params: { q: query } })

export const rooms = (query) =>
  axios.get('/owner/search/rooms', { params: { q: query } })

export const houses = (query) =>
  axios.get('/owner/search/houses', { params: { q: query } })

export const payments = (query) =>
  axios.get('/owner/search/payments', { params: { q: query } })
