import { useState } from 'react'
import { useEmployees, useCreateAttendance } from '../../hooks'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { SelectInput } from '../common/Input'
import { isFutureDate } from '../../utils/helpers'
import { User, Calendar, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function AttendanceForm({ onClose, onSuccess }) {
  const { employees, loading: loadingEmployees } = useEmployees()
  const { createAttendance, loading } = useCreateAttendance()
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    employee_id: '',
    date: today,
    status: 'Present'
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.employee_id) {
      newErrors.employee_id = 'Please select an employee'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    } else if (isFutureDate(formData.date)) {
      newErrors.date = 'Date cannot be in the future'
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
      await createAttendance(formData)
      onSuccess()
      onClose()
    } catch (err) {
      setSubmitError(err.response?.data?.detail || err.message || 'Failed to mark attendance')
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
    <Modal isOpen={true} onClose={onClose} title="Mark Attendance">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Employee <span className="text-red-500">*</span>
          </label>
          {loadingEmployees ? (
            <div className="flex items-center gap-2 py-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading employees...</span>
            </div>
          ) : (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <SelectInput
                id="employee_id"
                placeholder="Choose an employee"
                value={formData.employee_id}
                onChange={(e) => handleChange('employee_id', e.target.value)}
                error={errors.employee_id}
                disabled={loading}
                className="pl-10"
                options={employees.map(emp => ({
                  value: emp.id,
                  label: `${emp.name} (${emp.department})`
                }))}
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              max={today}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            />
          </div>
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
              formData.status === 'Present'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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

            <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
              formData.status === 'Absent'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
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

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || loadingEmployees} className="flex-1 sm:flex-none">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Attendance
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
