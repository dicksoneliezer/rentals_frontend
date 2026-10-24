import axios from './axios'

export const getVerificationStatus = () =>
  axios.get('/owner/verification')

export const uploadVerificationDocument = (type, file) => {
  const formData = new FormData()
  formData.append('type', type)
  formData.append('file', file)
  return axios.post('/owner/verification/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteVerificationDocument = (id) =>
  axios.delete(`/owner/verification/documents/${id}`)

export const submitVerification = () =>
  axios.post('/owner/verification/submit')
