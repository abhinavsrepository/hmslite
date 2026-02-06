import { useState, useMemo } from 'react'
import { useAttendance, useDeleteAttendance, useEmployees } from '../../hooks'
import Button from '../common/Button'
import Card from '../common/Card'
import AttendanceForm from './AttendanceForm'
import BulkAttendanceForm from './BulkAttendanceForm'
import TodayAttendance from './TodayAttendance'
import { 
  Search, Filter, Trash2, Calendar, X, CalendarPlus, Users, 
  CheckCircle, XCircle, Download, ChevronLeft, ChevronRight 
} from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function AttendanceList() {
  const { attendanceRecords, loading, error, refetch } = useAttendance()
  const { deleteAttendance } = useDeleteAttendance()
  const { employees } = useEmployees()
  const [showForm, setShowForm] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const employeeMap = useMemo(() => {
    const map = {}
    employees.forEach(emp => {
      map[emp.id] = emp
    })
    return map
  }, [employees])

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      const employee = employeeMap[record.employee_id]
      const matchesSearch = 
        record.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDate = !filterDate || record.date === filterDate
      return matchesSearch && matchesDate
    })
  }, [attendanceRecords, searchTerm, filterDate, employeeMap])

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize)
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecords.slice(start, start + pageSize)
  }, [filteredRecords, currentPage])

  const handleAttendanceMarked = () => {
    setShowForm(false)
    setShowBulkForm(false)
    refetch()
  }

  const handleDeleteAttendance = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      await deleteAttendance(recordId)
      refetch()
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterDate('')
    setCurrentPage(1)
  }

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Employee ID', 'Employee Name', 'Department', 'Status'].join(','),
      ...filteredRecords.map(r => {
        const emp = employeeMap[r.employee_id]
        return [
          r.date,
          r.employee_id,
          emp?.name || 'Unknown',
          emp?.department || 'N/A',
          r.status
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${filterDate || 'all'}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Today's Overview */}
      <TodayAttendance />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => setShowForm(true)} className="flex-1 sm:flex-none justify-center">
          <CalendarPlus className="w-4 h-4 mr-2" />
          Mark Single
        </Button>
        <Button onClick={() => setShowBulkForm(true)} variant="secondary" className="flex-1 sm:flex-none justify-center">
          <Users className="w-4 h-4 mr-2" />
          Mark Bulk
        </Button>
        <Button 
          onClick={handleExport} 
          variant="outline" 
          disabled={filteredRecords.length === 0}
          className="flex-1 sm:flex-none justify-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name or ID..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1) }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              />
              {(filterDate || searchTerm) && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Showing {filteredRecords.length} of {attendanceRecords.length} records</span>
            </div>
            {filteredRecords.length > pageSize && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Records List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-500">Loading attendance records...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Unable to load attendance</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <Button variant="outline" onClick={refetch}>Try Again</Button>
          </div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">No attendance records found</h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || filterDate
                  ? 'Try adjusting your search or date filter'
                  : 'Get started by marking attendance for your employees'
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowForm(true)}>
                <CalendarPlus className="w-4 h-4 mr-2" />
                Mark Single
              </Button>
              <Button onClick={() => setShowBulkForm(true)} variant="secondary">
                <Users className="w-4 h-4 mr-2" />
                Mark Bulk
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRecords.map((record) => {
                  const employee = employeeMap[record.employee_id]
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(record.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {employee
                                ? employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                : record.employee_id.slice(0, 2).toUpperCase()
                              }
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employee ? employee.name : 'Unknown Employee'}
                            </div>
                            <div className="text-xs text-gray-500">{record.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee?.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex items-center gap-1 text-xs leading-5 font-medium rounded-full ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status === 'Present'
                            ? <CheckCircle className="w-3 h-3" />
                            : <XCircle className="w-3 h-3" />
                          }
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDeleteAttendance(record.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginatedRecords.map((record) => {
              const employee = employeeMap[record.employee_id]
              return (
                <div key={record.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {employee
                            ? employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                            : record.employee_id.slice(0, 2).toUpperCase()
                          }
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {employee ? employee.name : 'Unknown Employee'}
                        </p>
                        <p className="text-sm text-gray-500">{record.employee_id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAttendance(record.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(record.date)}
                    </div>
                    <span className={`px-2.5 py-1 inline-flex items-center gap-1 text-xs font-medium rounded-full ${
                      record.status === 'Present'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status === 'Present'
                        ? <CheckCircle className="w-3 h-3" />
                        : <XCircle className="w-3 h-3" />
                      }
                      {record.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showForm && (
        <AttendanceForm
          onClose={() => setShowForm(false)}
          onSuccess={handleAttendanceMarked}
        />
      )}
      
      {showBulkForm && (
        <BulkAttendanceForm
          onClose={() => setShowBulkForm(false)}
          onSuccess={handleAttendanceMarked}
        />
      )}
    </div>
  )
}
