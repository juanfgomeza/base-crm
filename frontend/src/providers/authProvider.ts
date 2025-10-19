import type { AuthProvider } from '@refinedev/core';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';

export const authProvider: AuthProvider = {
  login: async ({ email, password }: any) => {
    try {
      // Backend expects OAuth2 password flow with form data
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 uses 'username' field
      formData.append('password', password);

      const { data } = await axios.post(
        `${API_CONFIG.baseURL}/auth/login`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      localStorage.setItem('token', data.access_token); // Backend returns 'access_token'
      return {
        success: true,
        redirectTo: '/',
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: 'LoginError',
          message:
            error?.response?.data?.detail || 'Email o contraseña inválidos',
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
    return { success: true };
  },

  check: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      return { authenticated: true };
    }
    return {
      authenticated: false,
      redirectTo: '/login',
    };
  },

  getIdentity: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { data } = await axios.get(`${API_CONFIG.baseURL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } catch {
        return null;
      }
    }
    return null;
  },

  onError: async (error: any) => {
    if (error.status === 401 || error.status === 403) {
      return { logout: true };
    }
    return {};
  },
};
