import { defineStore } from 'pinia';
import api from '@/services/api';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    error: null,
    loading: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    initializeAuth() {
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        // Optional: Fetch user details if needed
        // this.fetchUser(); 
      }
    },
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', credentials);
        
        const { token, user } = response.data;
        
        this.token = token;
        this.user = user;
        
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed. Please check your credentials.';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  }
});
