import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      return Promise.reject({
        message: error.response.data?.message || 'An error occurred',
        errors: error.response.data?.errors || {},
        status: error.response.status,
      });
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        errors: {},
        status: 0,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        errors: {},
        status: 0,
      });
    }
  }
);

// Departments API
export const departmentsApi = {
  list: (params = {}) => {
    return apiClient.get('/departments/', { params });
  },
  create: (data) => {
    return apiClient.post('/departments/', data);
  },
  delete: (id) => {
    return apiClient.delete(`/departments/${id}/`);
  },
};

// Employees API
export const employeesApi = {
  list: (params = {}) => {
    return apiClient.get('/employees/', { params });
  },
  get: (id) => {
    return apiClient.get(`/employees/${id}/`);
  },
  create: (data) => {
    return apiClient.post('/employees/', data);
  },
  delete: (id) => {
    return apiClient.delete(`/employees/${id}/`);
  },
};

// Attendance API — nested under /employees/:employee_id/attendance/
export const attendanceApi = {
  list: (employeeId, params = {}) => {
    return apiClient.get(`/employees/${employeeId}/attendance/`, { params });
  },
  create: (employeeId, data) => {
    return apiClient.post(`/employees/${employeeId}/attendance/`, data);
  },
  delete: (employeeId, id) => {
    return apiClient.delete(`/employees/${employeeId}/attendance/${id}/`);
  },
};

export default apiClient;

