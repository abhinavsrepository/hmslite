export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateEmployeeId = (id) => {
  const idRegex = /^[a-zA-Z0-9]+$/
  return idRegex.test(id) && id.length >= 4
}

export const validateName = (name) => {
  return name.trim().length >= 2
}

export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const getEmployeeInitials = (name) => {
  const words = name.split(' ')
  const initials = words.map(word => word[0]).join('')
  return initials.slice(0, 2).toUpperCase()
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'Present':
      return 'bg-green-100 text-green-800'
    case 'Absent':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

export const isFutureDate = (dateString) => {
  const selectedDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selectedDate > today
}
