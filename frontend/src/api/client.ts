import axios from 'axios'

// Base URL — points to our FastAPI backend
import { API_URL } from '../config'
const BASE_URL = API_URL

// Create axios instance with default config
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — adds JWT token to every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access_token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// Response interceptor — handles auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api