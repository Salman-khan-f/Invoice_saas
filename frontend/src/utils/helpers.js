export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '$0.00'
  const num = parseFloat(amount)
  if (isNaN(num)) return '$0.00'
  const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'CA$', AUD: 'A$' }
  const symbol = symbols[currency] || '$'
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export function getStatusBadge(status) {
  const map = {
    PENDING:   'badge-pending',
    PAID:      'badge-paid',
    OVERDUE:   'badge-overdue',
    DRAFT:     'badge-draft',
    PARTIAL:   'badge-partial',
    CANCELLED: 'badge-cancelled',
  }
  return map[status?.toUpperCase()] || 'badge-draft'
}

export function truncate(str, n = 40) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '...' : str
}
