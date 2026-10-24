import axios from './axios'

export const getAll = () =>
  axios.get('/notifications')

export const getUnreadCount = () =>
  axios.get('/notifications/unread-count')

export const markRead = (id) =>
  axios.post(`/notifications/${id}/read`)

export const markAllRead = () =>
  axios.post('/notifications/read-all')

export const destroy = (id) =>
  axios.delete(`/notifications/${id}`)
