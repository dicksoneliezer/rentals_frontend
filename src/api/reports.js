import axios from './axios'

export const rentCollection = (params) =>
  axios.get('/owner/reports/rent-collection', { params })

export const tenantSummary = (params) =>
  axios.get('/owner/reports/tenant-summary', { params })

export const roomPerformance = (params) =>
  axios.get('/owner/reports/room-performance', { params })

export const houseIncome = (params) =>
  axios.get('/owner/reports/house-income', { params })

export const arrears = () =>
  axios.get('/owner/reports/arrears')

export const expiry = () =>
  axios.get('/owner/reports/expiry')

export const monthly = (params) =>
  axios.get('/owner/reports/monthly', { params })
