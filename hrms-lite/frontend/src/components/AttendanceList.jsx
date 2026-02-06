import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Filter, Search, Calendar, User, X, AlertCircle, Loader2 } from 'lucide-react'
import AttendanceForm from './AttendanceForm'
import { API_BASE_URL } from '../config'

export default function AttendanceList() {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [attendanceRes, employeesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/attendance`),
        axios.get(`${API_BASE_URL}/api/employees`)
      ])

      setAttendanceRecords(attendanceRes.data)
      setEmployees(employeesRes.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load attendance')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      record.employee_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDate = !filterDate || record.date === filterDate

    return matchesSearch && matchesDate
  })

  const handleAttendanceMarked = () => {
    fetchData()
  }

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployee(employeeId)
    setFilterDate('')
    setSearchTerm('')
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by employee ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredRecords.length} of {attendanceRecords.length} records</span>
          </div>
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Clear date filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Employee Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 mr-2">Filter by Employee:</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => handleEmployeeSelect('')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedEmployee === '' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Employees
          </button>
          {employees.map(employee => (
            <button
              key={employee.id}
              onClick={() => handleEmployeeSelect(employee.id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedEmployee === employee.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {employee.name}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Records */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-sm font-medium text-red-800 mt-2">Unable to load attendance</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900 mt-4">No attendance records found</h3>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm || filterDate || selectedEmployee !== null
              ? 'Try adjusting your filters'
              : 'Get started by marking attendance for your employees'
            }
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterDate('')
              setSelectedEmployee(null)
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mark Attendance
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => {
                  const employee = employees.find(e => e.id === record.employee_id)
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.date}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{employee?.department || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this attendance record?')) {
                              handleDeleteAttendance(record.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <AttendanceForm
          onClose={() => setShowForm(false)}
          onSuccess={handleAttendanceMarked}
        />
      )}
    </div>
  )
}

async function handleDeleteAttendance(attendanceId) {
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/attendance/${attendanceId}`)
  } catch (error) {
    console.error('Error deleting attendance:', error)
  }
}