import axios from './axios'

export const getUsers = (params) =>
  axios.get('/admin/users', { params })

export const getUser = (id) =>
  axios.get(`/admin/users/${id}`)

export const suspendUser = (id) =>
  axios.post(`/admin/users/${id}/suspend`)

export const activateUser = (id) =>
  axios.post(`/admin/users/${id}/activate`)

export const grantAdmin = (id) =>
  axios.post(`/admin/users/${id}/grant-admin`)

export const revokeAdmin = (id) =>
  axios.post(`/admin/users/${id}/revoke-admin`)

export const resetUserPassword = (id) =>
  axios.post(`/admin/users/${id}/reset-password`)

export const getOwnerVerifications = (params) =>
  axios.get('/admin/owner-verifications', { params })

export const approveOwner = (id) =>
  axios.post(`/admin/users/${id}/approve`)

export const rejectOwner = (id, reason) =>
  axios.post(`/admin/users/${id}/reject`, { reason })

export const fetchVerificationDocument = (id) =>
  axios.get(`/admin/verification-documents/${id}`, { responseType: 'blob' })

export const getOwnerReports = (params) =>
  axios.get('/admin/owner-reports', { params })

export const getOwnerReport = (id) =>
  axios.get(`/admin/owner-reports/${id}`)

export const updateOwnerReport = (id, data) =>
  axios.patch(`/admin/owner-reports/${id}`, data)

export const getFeedbackList = (params) =>
  axios.get('/admin/feedback', { params })

export const getFeedback = (id) =>
  axios.get(`/admin/feedback/${id}`)

export const updateFeedback = (id, data) =>
  axios.patch(`/admin/feedback/${id}`, data)
