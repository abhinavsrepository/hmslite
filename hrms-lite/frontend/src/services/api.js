import axios from 'axios'
import { API_BASE_URL } from '../config'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('[API Response Error]', error.response?.status, error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const employeeService = {
  getAllEmployees: async () => {
    const response = await apiClient.get('/api/employees/')
    return response.data
  },

  getEmployeeById: async (id) => {
    const response = await apiClient.get(`/api/employees/${id}`)
    return response.data
  },

  createEmployee: async (employeeData) => {
    const response = await apiClient.post('/api/employees/', employeeData)
    return response.data
  },

  updateEmployee: async (id, employeeData) => {
    const response = await apiClient.put(`/api/employees/${id}`, employeeData)
    return response.data
  },

  deleteEmployee: async (id) => {
    const response = await apiClient.delete(`/api/employees/${id}`)
    return response.data
  }
}

export const attendanceService = {
  getAllAttendance: async () => {
    const response = await apiClient.get('/api/attendance/')
    return response.data
  },

  getAttendanceById: async (id) => {
    const response = await apiClient.get(`/api/attendance/${id}`)
    return response.data
  },

  getAttendanceSummary: async () => {
    const response = await apiClient.get('/api/attendance/dashboard/summary')
    return response.data
  },

  createAttendance: async (attendanceData) => {
    const response = await apiClient.post('/api/attendance/', attendanceData)
    return response.data
  },

  updateAttendance: async (id, attendanceData) => {
    const response = await apiClient.put(`/api/attendance/${id}`, attendanceData)
    return response.data
  },

  deleteAttendance: async (id) => {
    const response = await apiClient.delete(`/api/attendance/${id}`)
    return response.data
  }
}

export default apiClient
