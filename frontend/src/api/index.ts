import axios from 'axios';
import { useNotificationStore } from '../store/notifications';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Extract school slug from URL if present
  const pathParts = window.location.pathname.split('/');
  // If path is /school-slug/dashboard, the slug is at index 1
  if (pathParts[1] && pathParts[1] !== 'login' && pathParts[1] !== 'setup') {
    config.headers['x-school-slug'] = pathParts[1];
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const notifications = useNotificationStore();
    const message = error.response?.data?.error || 'Something went wrong';
    
    // Don't show notification for 401 if it's a login attempt
    if (error.response?.status === 401 && error.config.url?.includes('login')) {
      return Promise.reject(error);
    }

    notifications.error(message);
    return Promise.reject(error);
  }
);

export default api;
