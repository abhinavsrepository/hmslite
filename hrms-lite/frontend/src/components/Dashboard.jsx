import { useAttendanceSummary, useEmployees } from '../hooks'
import { StatCard } from './common/Card'
import { Users, CheckCircle, XCircle, RefreshCw, ArrowRight, UserPlus, CalendarCheck } from 'lucide-react'

export default function Dashboard({ onNavigate }) {
  const { summary, loading, refetch } = useAttendanceSummary()
  const { employees } = useEmployees()

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length || 0,
      icon: Users,
      color: 'blue',
      trend: null
    },
    {
      title: 'Present Today',
      value: summary?.total_present || 0,
      icon: CheckCircle,
      color: 'green',
      trend: summary?.total_present > 0 ? '+' + summary.total_present : null
    },
    {
      title: 'Absent Today',
      value: summary?.total_absent || 0,
      icon: XCircle,
      color: 'red',
      trend: summary?.total_absent > 0 ? '-' + summary.total_absent : null
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
        <button
          onClick={refetch}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={Icon}
              color={stat.color}
              trend={stat.trend}
            />
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => onNavigate && onNavigate('employees')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-medium text-gray-900">Add New Employee</p>
              <p className="text-sm text-gray-500 truncate">Register a new employee</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
          </button>

          <button
            onClick={() => onNavigate && onNavigate('attendance')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group"
          >
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <CalendarCheck className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-medium text-gray-900">Mark Attendance</p>
              <p className="text-sm text-gray-500 truncate">Record daily attendance</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 flex-shrink-0" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live data</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{employees.length}</p>
            <p className="text-xs sm:text-sm text-gray-500">Total Staff</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{summary?.total_present || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500">Present</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-red-600">{summary?.total_absent || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500">Absent</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {employees.length > 0
                ? Math.round(((summary?.total_present || 0) / employees.length) * 100)
                : 0}%
            </p>
            <p className="text-xs sm:text-sm text-gray-500">Attendance</p>
          </div>
        </div>
      </div>
    </div>
  )
}
