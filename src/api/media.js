import axios from './axios'

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } }

export const uploadHouseMedia = (houseId, formData) =>
  axios.post(`/owner/houses/${houseId}/media`, formData, multipart)

export const uploadRoomMedia = (roomId, formData) =>
  axios.post(`/owner/rooms/${roomId}/media`, formData, multipart)

export const updateMedia = (mediaId, data) =>
  axios.put(`/owner/media/${mediaId}`, data)

export const deleteMedia = (mediaId) =>
  axios.delete(`/owner/media/${mediaId}`)
