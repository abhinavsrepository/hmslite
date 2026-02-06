import { useState } from 'react'
import { BarChart3, User, Calendar, RefreshCw, AlertCircle, Menu, X } from 'lucide-react'
import Dashboard from './components/Dashboard'
import EmployeeList from './components/employees/EmployeeList'
import AttendanceList from './components/attendance/AttendanceList'
import { useToast, ToastContainer } from './hooks/useToast'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState(null)

  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    try {
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              {sidebarOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">HRMS Assignment</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm text-gray-600 hidden sm:inline">Refresh</span>
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500">Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed lg:sticky top-0 lg:top-[57px] left-0 z-40 lg:z-0
          h-screen lg:h-[calc(100vh-57px)]
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}>
          <div className="p-4 pt-16 lg:pt-4">
            <nav className="space-y-1">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleTabChange('employees')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'employees'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <User className="w-5 h-5" />
                <span>Employees</span>
              </button>
              <button
                onClick={() => handleTabChange('attendance')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'attendance'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Attendance</span>
              </button>
            </nav>

            <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-1">HRMS Lite</p>
              <p className="text-xs text-blue-600">
                Manage employees and track daily attendance
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 min-h-[calc(100vh-57px)] w-full lg:w-[calc(100%-256px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && <Dashboard onNavigate={handleTabChange} />}

          {activeTab === 'employees' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Employee Management</h2>
              </div>
              <EmployeeList />
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Attendance Management</h2>
              </div>
              <AttendanceList />
            </div>
          )}
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}

export default App
