import axios from './axios'

export const getProfile = () =>
  axios.get('/profile')

export const updateProfile = (data) =>
  axios.put('/profile', data)

export const updatePassword = (data) =>
  axios.put('/profile/password', data)
