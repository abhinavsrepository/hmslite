import { useState } from 'react'
import axios from 'axios'
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { API_BASE_URL } from '../config'

export default function EmployeeForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    department: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.id.trim()) {
      newErrors.id = 'Employee ID is required'
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.id)) {
      newErrors.id = 'Employee ID must be alphanumeric'
    } else if (formData.id.length < 4) {
      newErrors.id = 'Employee ID must be at least 4 characters'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required'
    } else if (formData.department.length < 1) {
      newErrors.department = 'Department is required'
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

      const response = await axios.post(`${API_BASE_URL}/api/employees`, formData)

      if (response.status === 201) {
        onSuccess(response.data)
        resetForm()
        onClose()
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setSubmitError(err.response.data.detail)
      } else if (err.response?.status === 404) {
        setSubmitError('Employee ID already exists')
      } else {
        setSubmitError('Failed to create employee. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ id: '', name: '', email: '', department: '' })
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Employee</h2>
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
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="id"
              value={formData.id}
              onChange={(e) => handleChange('id', e.target.value)}
              placeholder="e.g., EMP001"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.id && (
              <p className="mt-1 text-sm text-red-600">{errors.id}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Alphanumeric, minimum 4 characters
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="Engineering"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.department ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Create Employee</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}