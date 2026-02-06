import { useState, useEffect } from 'react'
import { attendanceService } from '../services/api'
import { useToast } from './useToast'

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await attendanceService.getAllAttendance()
      setAttendanceRecords(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load attendance')
      console.error('Error fetching attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  return { attendanceRecords, loading, error, refetch: fetchAttendance }
}

export const useAttendanceSummary = () => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSummary = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await attendanceService.getAttendanceSummary()
      setSummary(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load summary')
      console.error('Error fetching summary:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  return { summary, loading, error, refetch: fetchSummary }
}

export const useCreateAttendance = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const createAttendance = async (attendanceData) => {
    try {
      setLoading(true)
      setError(null)
      const data = await attendanceService.createAttendance(attendanceData)
      showToast('Attendance marked successfully', 'success')
      return data
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to mark attendance'
      setError(message)
      showToast(message, 'error')
      console.error('Error creating attendance:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createAttendance, loading, error }
}

export const useDeleteAttendance = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const deleteAttendance = async (id) => {
    try {
      setLoading(true)
      setError(null)
      await attendanceService.deleteAttendance(id)
      showToast('Attendance deleted successfully', 'success')
      return true
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete attendance'
      setError(message)
      showToast(message, 'error')
      console.error('Error deleting attendance:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteAttendance, loading, error }
}
