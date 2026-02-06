import { useMemo } from 'react'
import { useAttendance, useEmployees } from '../../hooks'
import { CheckCircle, XCircle, Users, Calendar, UserMinus } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function TodayAttendance() {
  const { attendanceRecords, loading } = useAttendance()
  const { employees } = useEmployees()

  const today = new Date().toISOString().split('T')[0]

  const todayStats = useMemo(() => {
    const todayRecords = attendanceRecords.filter(r => r.date === today)
    const presentIds = new Set(todayRecords.filter(r => r.status === 'Present').map(r => r.employee_id))
    const absentIds = new Set(todayRecords.filter(r => r.status === 'Absent').map(r => r.employee_id))
    const markedIds = new Set(todayRecords.map(r => r.employee_id))
    
    const unmarkedEmployees = employees.filter(e => !markedIds.has(e.id))
    
    return {
      total: employees.length,
      present: presentIds.size,
      absent: absentIds.size,
      unmarked: unmarkedEmployees.length,
      unmarkedEmployees,
      attendanceRate: employees.length > 0 ? Math.round((presentIds.size / employees.length) * 100) : 0
    }
  }, [attendanceRecords, employees, today])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Today&apos;s Attendance</h3>
          <span className="text-sm text-gray-500">({formatDate(today)})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Attendance Rate:</span>
          <span className={`font-semibold ${todayStats.attendanceRate >= 80 ? 'text-green-600' : todayStats.attendanceRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {todayStats.attendanceRate}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200">
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayStats.total}</p>
        </div>

        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Present</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{todayStats.present}</p>
        </div>

        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Absent</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{todayStats.absent}</p>
        </div>

        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
            <UserMinus className="w-4 h-4" />
            <span className="text-sm">Unmarked</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayStats.unmarked}</p>
        </div>
      </div>

      {todayStats.unmarked > 0 && todayStats.unmarkedEmployees.length > 0 && (
        <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-100">
          <p className="text-sm text-yellow-800 font-medium mb-2">
            Employees yet to mark attendance:
          </p>
          <div className="flex flex-wrap gap-2">
            {todayStats.unmarkedEmployees.slice(0, 5).map(emp => (
              <span key={emp.id} className="px-2 py-1 bg-white border border-yellow-200 rounded text-xs text-yellow-700">
                {emp.name}
              </span>
            ))}
            {todayStats.unmarkedEmployees.length > 5 && (
              <span className="px-2 py-1 text-xs text-yellow-700">
                +{todayStats.unmarkedEmployees.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
