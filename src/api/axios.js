import axios from 'axios'
import { rewriteAssetUrls } from './assets'

const instance = axios.create({
  baseURL: 'https://api.ocpac.co.tz/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

instance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      response.data = rewriteAssetUrls(response.data)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance