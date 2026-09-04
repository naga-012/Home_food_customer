import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim();
let trimmedApiUrl = rawApiUrl.replace(/\/+$/, '');
if (trimmedApiUrl && !trimmedApiUrl.startsWith('http://') && !trimmedApiUrl.startsWith('https://')) {
  trimmedApiUrl = `https://${trimmedApiUrl}`;
}
export const API_BASE_URL = trimmedApiUrl;

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected endpoint, clear local storage
      const currentPath = window.location.pathname;
      if (currentPath.includes('/dashboard') || currentPath.includes('/checkout')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  registerCustomer: (data) => api.post('/api/auth/register', data),
  registerCook: (data) => api.post('/api/auth/register-cook', data),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  changePassword: (data) => api.post('/api/auth/change-password', data),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

// Food Services
export const foodService = {
  getFoods: (params) => api.get('/api/foods', { params }),
  getFoodById: (id) => api.get(`/api/foods/${id}`),
  getRecommendations: () => api.get('/api/foods/recommendations'),
  getEveningOffers: () => api.get('/api/foods/evening-offers'),
  createFood: (data) => api.post('/api/foods', data),
  updateFood: (id, data) => api.put(`/api/foods/${id}`, data),
  deleteFood: (id) => api.delete(`/api/foods/${id}`),
  setEveningOffer: (id, data) => api.post(`/api/foods/${id}/evening-offer`, data),
  cancelEveningOffer: (id) => api.delete(`/api/foods/${id}/evening-offer`),
};

// Cook Services
export const cookService = {
  getApprovedCooks: (params) => api.get('/api/cooks', { params }),
  getCookDetail: (id) => api.get(`/api/cooks/${id}`),
  getCookDashboard: () => api.get('/api/cooks/my/dashboard'),
  getMyTodaysMenu: () => api.get('/api/cooks/my/todays-menu'),
  toggleTodaysMenu: (foodId) => api.post(`/api/cooks/my/todays-menu/toggle/${foodId}`),
};

// Cart Services
export const cartService = {
  getCart: () => api.get('/api/cart'),
  addToCart: (foodId, quantity = 1) => api.post('/api/cart/add', { food_id: foodId, quantity }),
  updateQuantity: (cartItemId, quantity) => api.put(`/api/cart/update?cart_item_id=${cartItemId}`, { quantity }),
  removeItem: (cartItemId) => api.delete(`/api/cart/remove/${cartItemId}`),
  clearCart: () => api.delete('/api/cart/clear'),
};

// Order Services
export const orderService = {
  createOrder: (orderData) => api.post('/api/orders', orderData),
  getOrders: (params) => api.get('/api/orders', { params }),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  updateOrderStatus: (id, statusData) => api.put(`/api/orders/${id}/status`, statusData),
};

// Subscriptions
export const subscriptionService = {
  createSubscription: (data) => api.post('/api/subscriptions', data),
  getSubscriptions: () => api.get('/api/subscriptions'),
  updateStatus: (id, status) => api.put(`/api/subscriptions/${id}/status`, { status }),
  cancelSubscription: (id) => api.delete(`/api/subscriptions/${id}`),
};

// Reviews
export const reviewService = {
  createReview: (data) => api.post('/api/reviews', data),
  getFoodReviews: (foodId) => api.get(`/api/reviews/food/${foodId}`),
  getCookReviews: (cookId) => api.get(`/api/reviews/cook/${cookId}`),
};

// Favorites
export const favoriteService = {
  getFavorites: () => api.get('/api/favorites'),
  addFavorite: (foodId) => api.post(`/api/favorites/${foodId}`),
  removeFavorite: (foodId) => api.delete(`/api/favorites/${foodId}`),
  checkFavorite: (foodId) => api.get(`/api/favorites/check/${foodId}`),
};

// Notifications
export const notificationService = {
  getNotifications: () => api.get('/api/notifications'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
};

// User Dashboard
export const userService = {
  getCustomerDashboard: () => api.get('/api/users/dashboard'),
};

export default api;
