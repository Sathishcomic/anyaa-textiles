import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProducts = () => api.get('/products');
export const addProduct = (product) => api.post('/products', product);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getCustomers = () => api.get('/customers');
export const addCustomer = (customer) => api.post('/customers', customer);
export const updateCustomer = (id, customer) => api.put(`/customers/${id}`, customer);

export const getBills = () => api.get('/bills');
export const addBill = (bill) => api.post('/bills', bill);
export const updateBill = (id, bill) => api.put(`/bills/${id}`, bill);
export const deleteBill = (id) => api.delete(`/bills/${id}`);

export const getDashboardStats = () => api.get('/dashboardStats');
export const getUsers = () => api.get('/auth/users');

export const getReturns = () => api.get('/returns');
export const addReturn = (req) => api.post('/returns', req);
export const updateReturn = (id, req) => api.put(`/returns/${id}`, req);
export const deleteReturn = (id) => api.delete(`/returns/${id}`);

// Login with JWT authentication
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.success) {
    // Store token in localStorage
    localStorage.setItem('token', response.data.data.token);
    return response.data.data.user;
  }
  throw new Error('Invalid credentials');
};

// Logout
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
  }
};

// Get current user
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error('Failed to get user');
};

