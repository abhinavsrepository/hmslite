import { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  Users, CheckCircle, XCircle, UserPlus, Calendar, Clock, 
  AlertCircle, ArrowRight, ArrowDown, ArrowUp
} from 'lucide-react'
import { API_BASE_URL } from '../config'

function Dashboard({ onRefresh }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/api/attendance/dashboard/summary`)
      setSummary(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data')
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: 'Total Employees',
      value: summary?.total_employees || 0,
      icon: Users,
      color: 'blue',
      trend: null
    },
    {
      title: 'Present Today',
      value: summary?.total_present || 0,
      icon: CheckCircle,
      color: 'green',
      trend: '+2%'
    },
    {
      title: 'Absent Today',
      value: summary?.total_absent || 0,
      icon: XCircle,
      color: 'red',
      trend: '-1%'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                </div>
                {stat.trend && (
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
                    stat.trend.includes('+') 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {stat.trend.includes('+') ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{stat.trend}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Add New Employee</p>
              <p className="text-sm text-gray-500">Register a new employee</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 ml-auto" />
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Mark Attendance</p>
              <p className="text-sm text-gray-500">Record daily attendance</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 ml-auto" />
          </button>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last updated: Just now</span>
          </div>
        </div>
        
        {error ? (
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-red-800">Unable to load activity</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-500 mt-3">No recent activity to display</p>
            <p className="text-xs text-gray-400 mt-1">Activities will appear here as you use the system</p>
          </div>
        )}
      </div>
    </div>
  )
}

const RefreshCw = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
      <path d="M16 21h5v-5"></path>
    </svg>
  )
}

export default Dashboard