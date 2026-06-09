import { api } from './client.js'

export function getDashboard(year, month) {
  return api(`/api/dashboard?year=${year}&month=${month}`)
}

export function createTransaction(payload) {
  // payload: { type, amount, category, title, paymentMethod, memo, date }
  return api('/api/transactions', { method: 'POST', body: JSON.stringify(payload) })
}

export function getTransactions({ year, month } = {}) {
  const qs = year && month ? `?year=${year}&month=${month}` : ''
  return api(`/api/transactions${qs}`)
}

export function updateTransaction(id, payload) {
  return api(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteTransaction(id) {
  return api(`/api/transactions/${id}`, { method: 'DELETE' })
}

export function getBudget() {
  return api('/api/budget')
}

export function setBudget(monthlyBudget) {
  return api('/api/budget', { method: 'PUT', body: JSON.stringify({ monthlyBudget }) })
}
