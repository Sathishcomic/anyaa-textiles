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

export const getProducts = async () => (await api.get('/products')).data.data;
export const getProduct = async (id) => (await api.get(`/products/${id}`)).data.data;
export const addProduct = async (product) => (await api.post('/products', product)).data.data;
export const updateProduct = async (id, product) => (await api.put(`/products/${id}`, product)).data.data;
export const deleteProduct = async (id) => (await api.delete(`/products/${id}`)).data.data;

export const getCustomers = async () => (await api.get('/customers')).data.data;
export const addCustomer = async (customer) => (await api.post('/customers', customer)).data.data;
export const updateCustomer = async (id, customer) => (await api.put(`/customers/${id}`, customer)).data.data;

export const getBills = async () => (await api.get('/bills')).data.data;
export const addBill = async (bill) => (await api.post('/bills', bill)).data.data;
export const updateBill = async (id, bill) => (await api.put(`/bills/${id}`, bill)).data.data;
export const deleteBill = async (id) => (await api.delete(`/bills/${id}`)).data.data;

export const getDashboardStats = async () => (await api.get('/dashboardStats')).data.data;
export const getUsers = async () => (await api.get('/auth/users')).data.data;

export const getReturns = async () => (await api.get('/returns')).data.data;
export const addReturn = async (req) => (await api.post('/returns', req)).data.data;
export const updateReturn = async (id, req) => (await api.put(`/returns/${id}`, req)).data.data;
export const deleteReturn = async (id) => (await api.delete(`/returns/${id}`)).data.data;

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

