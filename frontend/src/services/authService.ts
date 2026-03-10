import api from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
}

const AUTH_KEY = 'leadgen_auth';
const USER_KEY = 'leadgen_user';
const ACCESS_TOKEN_KEY = 'leadgen_accessToken';
const REFRESH_TOKEN_KEY = 'leadgen_refreshToken';

export const authService = {
  login: async (email: string, password: string): Promise<void> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      localStorage.setItem(AUTH_KEY, 'true');
      localStorage.setItem(USER_KEY, JSON.stringify({ id: crypto.randomUUID(), email, name: 'User' }));
      return;
    }

    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  register: async (email: string, password: string, name: string): Promise<void> => {
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      localStorage.setItem(AUTH_KEY, 'true');
      localStorage.setItem(USER_KEY, JSON.stringify({ id: crypto.randomUUID(), email, name }));
      return;
    }

    const response = await api.post('/auth/register', { email, password, name });
    const { accessToken, refreshToken, user } = response.data;

    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: () => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  },

  getUser: (): User | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
};