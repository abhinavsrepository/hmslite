import { useState, useMemo } from 'react'
import { useEmployees, useCreateAttendance } from '../../hooks'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { CheckCircle, XCircle, Calendar, Loader2, AlertCircle, Users, Search } from 'lucide-react'
import { isFutureDate } from '../../utils/helpers'

export default function BulkAttendanceForm({ onClose, onSuccess }) {
  const { employees, loading: loadingEmployees } = useEmployees()
  const { createAttendance, loading } = useCreateAttendance()
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [attendanceMap, setAttendanceMap] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [submitError, setSubmitError] = useState(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [employees, searchTerm])

  const stats = useMemo(() => {
    const marked = Object.keys(attendanceMap).length
    const present = Object.values(attendanceMap).filter(s => s === 'Present').length
    const absent = Object.values(attendanceMap).filter(s => s === 'Absent').length
    return { marked, present, absent, unmarked: filteredEmployees.length - marked }
  }, [attendanceMap, filteredEmployees])

  const handleStatusChange = (employeeId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [employeeId]: status
    }))
    if (submitError) setSubmitError(null)
  }

  const handleMarkAll = (status) => {
    const newMap = {}
    filteredEmployees.forEach(emp => {
      newMap[emp.id] = status
    })
    setAttendanceMap(newMap)
  }

  const handleClearAll = () => {
    setAttendanceMap({})
  }

  const validateForm = () => {
    if (isFutureDate(date)) {
      setSubmitError('Date cannot be in the future')
      return false
    }
    if (Object.keys(attendanceMap).length === 0) {
      setSubmitError('Please mark attendance for at least one employee')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const entries = Object.entries(attendanceMap)
    setProgress({ current: 0, total: entries.length })

    try {
      for (const [employeeId, status] of entries) {
        await createAttendance({
          employee_id: employeeId,
          date,
          status
        })
        setProgress(prev => ({ ...prev, current: prev.current + 1 }))
      }
      onSuccess()
      onClose()
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Failed to save attendance')
      setProgress({ current: 0, total: 0 })
    }
  }

  if (loadingEmployees) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Mark Bulk Attendance">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Mark Bulk Attendance" size="2xl">
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

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
            Total: {filteredEmployees.length}
          </div>
          <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
            Present: {stats.present}
          </div>
          <div className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
            Absent: {stats.absent}
          </div>
          {stats.unmarked > 0 && (
            <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
              Unmarked: {stats.unmarked}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Bulk Actions */}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="success" size="sm" onClick={() => handleMarkAll('Present')} disabled={loading}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark All Present
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={() => handleMarkAll('Absent')} disabled={loading}>
            <XCircle className="w-4 h-4 mr-1" />
            Mark All Absent
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleClearAll} disabled={loading}>
            Clear All
          </Button>
        </div>

        {/* Employee List */}
        <div className="border border-gray-200 rounded-lg max-h-[300px] overflow-y-auto">
          {filteredEmployees.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No employees found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEmployees.map(emp => {
                const status = attendanceMap[emp.id]
                return (
                  <div key={emp.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.id} • {emp.department}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(emp.id, 'Present')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          status === 'Present'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                        }`}
                        disabled={loading}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(emp.id, 'Absent')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          status === 'Absent'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                        }`}
                        disabled={loading}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {progress.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Saving attendance...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || Object.keys(attendanceMap).length === 0} 
            className="flex-1 sm:flex-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving {progress.current > 0 ? `(${progress.current}/${progress.total})` : '...'}
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Save Attendance ({Object.keys(attendanceMap).length})
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
