import api from './axios'

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// Clients
export const clientApi = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
}

// Invoices
export const invoiceApi = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  addPayment: (id, data) => api.post(`/invoices/${id}/payments`, data),
  updateStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
  downloadPdf: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  sendEmail: (id) => api.post(`/invoices/${id}/send-email`),
  getByClient: (clientId) => api.get(`/invoices/client/${clientId}`),
}

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
}
