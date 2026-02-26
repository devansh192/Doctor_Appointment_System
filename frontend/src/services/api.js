import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Request failed with status ${error.response.status}`;
      return Promise.reject({ ...error.response.data, message, status: error.response.status });
    } else if (error.request) {
      return Promise.reject({ message: 'Network error – unable to reach server. Please check your connection.' });
    }
    return Promise.reject({ message: error.message || 'An unexpected error occurred' });
  }
);

// ─── Doctor APIs ─────────────────────────────────────────────────────────────
export const doctorAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSpecializations: () => api.get('/doctors/specializations'),
  add: (data) => api.post('/doctors', data),
  delete: (id) => api.delete(`/doctors/${id}`),
  resetDaily: () => api.post('/doctors/reset/daily'),
};

// ─── Appointment APIs ─────────────────────────────────────────────────────────
export const appointmentAPI = {
  book: (data) => api.post('/appointments/book', data),
  getAll: (params) => api.get('/appointments', { params }),
  getStats: () => api.get('/appointments/stats'),
};

export default api;
