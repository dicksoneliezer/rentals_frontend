import axios from 'axios'
import instance from './axios'

/**
 * Owner-facing contract endpoints (require a session).
 */
export const getAll = (params) => instance.get('/owner/contracts', { params })

export const getById = (id) => instance.get(`/owner/contracts/${id}`)

export const getSettings = () => instance.get('/owner/contracts/settings')

export const updateSettings = (payload) => instance.put('/owner/contracts/settings', payload)

export const getPrefill = (rentalId) =>
  instance.get(`/owner/rentals/${rentalId}/contract-prefill`)

export const preview = (payload) => instance.post('/owner/contracts/preview', payload)

export const create = (payload) => instance.post('/owner/contracts', payload)

export const update = (id, payload) => instance.put(`/owner/contracts/${id}`, payload)

export const send = (id) => instance.post(`/owner/contracts/${id}/send`, {})

export const voidContract = (id, reason) =>
  instance.post(`/owner/contracts/${id}/void`, { voided_reason: reason })

/**
 * The signed-in tenant's own contracts ("My Contracts").
 */
export const getMyContracts = () => instance.get('/contracts')

export const getMyContract = (id) => instance.get(`/contracts/${id}`)

/**
 * Tenant signing endpoints are public and reached from a link, so they must
 * not use the shared axios instance: that one attaches the stored token and
 * bounces the browser to /login on any 401, which would turn an expired or
 * already-used signing link into a confusing redirect to the login screen.
 */
const publicClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

export const openSigningLink = (token) => publicClient.get(`/contracts/sign/${token}`)

export const signContract = (token, payload) =>
  publicClient.post(`/contracts/sign/${token}`, payload)

export const declineContract = (token, reason) =>
  publicClient.post(`/contracts/sign/${token}/decline`, { reason })