import axios from './axios'

export const getMyRequests = () =>
  axios.get('/rental-requests')

export const createRequest = (data) =>
  axios.post('/rental-requests', data)

export const getOwnerRequests = (params) =>
  axios.get('/owner/rental-requests', { params })

export const getOwnerRequest = (id) =>
  axios.get(`/owner/rental-requests/${id}`)

export const acceptRequest = (id, data) =>
  axios.post(`/owner/rental-requests/${id}/accept`, data)

export const declineRequest = (id, data) =>
  axios.post(`/owner/rental-requests/${id}/decline`, data)

export const confirmProceed = (rentalId) =>
  axios.post(`/rentals/${rentalId}/confirm-proceed`)
