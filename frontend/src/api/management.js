import { api } from './client.js'

// 카테고리
export const getCategories = () => api('/api/categories')
export const createCategory = (type, name, savings) => api('/api/categories', { method: 'POST', body: JSON.stringify({ type, name, savings: !!savings }) })
export const updateCategory = (id, name, savings) => api(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name, savings: !!savings }) })
export const deleteCategory = (id) => api(`/api/categories/${id}`, { method: 'DELETE' })

// 지출방법
export const getMethods = () => api('/api/payment-methods')
export const createMethod = (name) => api('/api/payment-methods', { method: 'POST', body: JSON.stringify({ name }) })
export const updateMethod = (id, name) => api(`/api/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify({ name }) })
export const deleteMethod = (id) => api(`/api/payment-methods/${id}`, { method: 'DELETE' })
