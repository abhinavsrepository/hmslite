import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Loader2, CheckCircle, AlertCircle, Calendar, User } from 'lucide-react'
import { API_BASE_URL } from '../config'

export default function AttendanceForm({ onClose, onSuccess }) {
  const [employees, setEmployees] = useState([])
  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    status: 'Present'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/employees`)
      setEmployees(response.data)
    } catch (err) {
      console.error('Error fetching employees:', err)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.employee_id) {
      newErrors.employee_id = 'Please select an employee'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setSubmitError(null)

      const response = await axios.post(`${API_BASE_URL}/api/attendance`, formData)

      if (response.status === 201) {
        onSuccess(response.data)
        resetForm()
        onClose()
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setSubmitError('Employee not found')
      } else if (err.response?.status === 400) {
        setSubmitError(err.response.data.detail)
      } else {
        setSubmitError('Failed to mark attendance. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      employee_id: '',
      date: '',
      status: 'Present'
    })
    setErrors({})
    setSubmitError(null)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (submitError) {
      setSubmitError(null)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Mark Attendance</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {submitError && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600 mt-1">{submitError}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee <span className="text-red-500">*</span>
            </label>
            <select
              id="employee_id"
              value={formData.employee_id}
              onChange={(e) => handleChange('employee_id', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.employee_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Choose an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.department}) - {employee.email}
                </option>
              ))}
            </select>
            {errors.employee_id && (
              <p className="mt-1 text-sm text-red-600">{errors.employee_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              min={today}
              max={today}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.status === 'Present'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="Present"
                  checked={formData.status === 'Present'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="sr-only"
                  disabled={loading}
                />
                <CheckCircle className={`w-5 h-5 ${formData.status === 'Present' ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${formData.status === 'Present' ? 'text-green-700' : 'text-gray-700'}`}>
                  Present
                </span>
              </label>

              <label className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.status === 'Absent'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="Absent"
                  checked={formData.status === 'Absent'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="sr-only"
                  disabled={loading}
                />
                <XCircle className={`w-5 h-5 ${formData.status === 'Absent' ? 'text-red-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${formData.status === 'Absent' ? 'text-red-700' : 'text-gray-700'}`}>
                  Absent
                </span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Marking...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Attendance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const XCircle = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" x2="9" y1="9" y2="15"></line>
      <line x1="9" x2="15" y1="9" y2="15"></line>
    </svg>
  )
}