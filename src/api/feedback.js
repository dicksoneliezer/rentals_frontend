import axios from './axios'

export const submitFeedback = (data) =>
  axios.post('/feedback', data)

export const getMyFeedback = () =>
  axios.get('/feedback')
