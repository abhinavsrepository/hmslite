import { useState } from 'react'
import { useCreateEmployee } from '../../hooks'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { validateEmail, validateName, validateEmployeeId } from '../../utils/helpers'
import { User, Mail, Building, Hash, AlertCircle, Loader2, UserPlus } from 'lucide-react'

export default function EmployeeForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    department: ''
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const { createEmployee, loading } = useCreateEmployee()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.id.trim()) {
      newErrors.id = 'Employee ID is required'
    } else if (!validateEmployeeId(formData.id)) {
      newErrors.id = 'Employee ID must be alphanumeric, minimum 4 characters'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.department.trim()) {
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
      await createEmployee(formData)
      onSuccess()
      onClose()
    } catch (err) {
      setSubmitError(err.response?.data?.detail || err.message || 'Failed to create employee')
    }
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
    <Modal isOpen={true} onClose={onClose} title="Add New Employee">
      <form onSubmit={handleSubmit} className="space-y-5">
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600 mt-1">{submitError}</p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              id="id"
              type="text"
              value={formData.id}
              onChange={(e) => handleChange('id', e.target.value.toUpperCase())}
              placeholder="e.g., EMP001"
              error={errors.id}
              disabled={loading}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              error={errors.name}
              disabled={loading}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
              error={errors.email}
              disabled={loading}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              id="department"
              type="text"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="Engineering"
              error={errors.department}
              disabled={loading}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Employee
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
