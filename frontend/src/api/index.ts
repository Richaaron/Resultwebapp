import axios from 'axios';
import { useNotificationStore } from '../store/notifications';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
