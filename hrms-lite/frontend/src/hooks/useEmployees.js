import { useState, useEffect, useCallback } from 'react'
import { employeeService } from '../services/api'
import { useToast } from './useToast'

export const useEmployees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await employeeService.getAllEmployees()
      setEmployees(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load employees')
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  return { employees, loading, error, refetch: fetchEmployees }
}

export const useEmployee = (employeeId) => {
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await employeeService.getEmployeeById(employeeId)
      setEmployee(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load employee')
      console.error('Error fetching employee:', err)
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  useEffect(() => {
    if (employeeId) {
      fetchEmployee()
    }
  }, [employeeId, fetchEmployee])

  return { employee, loading, error, refetch: fetchEmployee }
}

export const useCreateEmployee = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const createEmployee = async (employeeData) => {
    try {
      setLoading(true)
      setError(null)
      const data = await employeeService.createEmployee(employeeData)
      showToast('Employee created successfully', 'success')
      return data
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create employee'
      setError(message)
      showToast(message, 'error')
      console.error('Error creating employee:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createEmployee, loading, error }
}

export const useUpdateEmployee = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const updateEmployee = async (id, employeeData) => {
    try {
      setLoading(true)
      setError(null)
      const data = await employeeService.updateEmployee(id, employeeData)
      showToast('Employee updated successfully', 'success')
      return data
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update employee'
      setError(message)
      showToast(message, 'error')
      console.error('Error updating employee:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateEmployee, loading, error }
}

export const useDeleteEmployee = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const deleteEmployee = async (id) => {
    try {
      setLoading(true)
      setError(null)
      await employeeService.deleteEmployee(id)
      showToast('Employee deleted successfully', 'success')
      return true
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete employee'
      setError(message)
      showToast(message, 'error')
      console.error('Error deleting employee:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteEmployee, loading, error }
}
