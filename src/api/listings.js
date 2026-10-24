import axios from './axios'

export const getHouses = (params) =>
  axios.get('/listings/houses', { params })

export const getHouse = (id) =>
  axios.get(`/listings/houses/${id}`)
