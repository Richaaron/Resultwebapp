import { defineStore } from 'pinia';
import api from '../api';

export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'TEACHER';
  fullName: string;
  assignments?: any[];
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isTeacher: (state) => state.user?.role === 'TEACHER',
  },
  actions: {
    async login(credentials: any) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token!);
        return response.data;
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Login failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchMe() {
      if (!this.token) return;
      try {
        const response = await api.get('/auth/me');
        this.user = response.data;
      } catch (err) {
        this.logout();
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    },
  },
});
