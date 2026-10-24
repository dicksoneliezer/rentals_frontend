import axios from './axios'

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } }

export const getEligibleOwners = () =>
  axios.get('/owner-reports/eligible-owners')

export const getMyOwnerReports = () =>
  axios.get('/owner-reports')

export const createOwnerReport = (data) =>
  axios.post('/owner-reports', data)

export const uploadReportEvidence = (reportId, formData) =>
  axios.post(`/owner-reports/${reportId}/evidence`, formData, multipart)
