import api from '../lib/api';

export interface User {
  id: string;
  email: string;
  name?: string;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const mockUser: User = {
  id: 'mock-user-id',
  email: 'demo@example.com',
  name: 'Demo User',
};

export const authService = {
  login: async (email: string, password: string): Promise<void> => {
    if (USE_MOCK) {
      localStorage.setItem('leadgen_accessToken', 'mock-access-token');
      localStorage.setItem('leadgen_refreshToken', 'mock-refresh-token');
      localStorage.setItem('leadgen_user', JSON.stringify(mockUser));
      return;
    }

    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('leadgen_accessToken', accessToken);
    localStorage.setItem('leadgen_refreshToken', refreshToken);
    localStorage.setItem('leadgen_user', JSON.stringify(user));
  },

  register: async (email: string, password: string, name: string): Promise<void> => {
    if (USE_MOCK) {
      localStorage.setItem('leadgen_accessToken', 'mock-access-token');
      localStorage.setItem('leadgen_refreshToken', 'mock-refresh-token');
      localStorage.setItem('leadgen_user', JSON.stringify({ ...mockUser, name, email }));
      return;
    }

    const response = await api.post('/auth/register', { email, password, name });
    const { accessToken, refreshToken, user } = response.data;

    localStorage.setItem('leadgen_accessToken', accessToken);
    localStorage.setItem('leadgen_refreshToken', refreshToken);
    localStorage.setItem('leadgen_user', JSON.stringify(user));
  },

  logout: async () => {
    // Clear local storage
    localStorage.removeItem('leadgen_accessToken');
    localStorage.removeItem('leadgen_refreshToken');
    localStorage.removeItem('leadgen_user');
    localStorage.removeItem('leadgen_auth');
  },

  isAuthenticated: async (): Promise<boolean> => {
    if (USE_MOCK) {
      return !!localStorage.getItem('leadgen_accessToken');
    }

    const token = localStorage.getItem('leadgen_accessToken');
    if (!token) return false;

    try {
      // We can call /auth/me to verify if the token is still valid
      await api.get('/auth/me');
      return true;
    } catch (error) {
      return false;
    }
  },

  getUser: async (): Promise<User | null> => {
    const userJson = localStorage.getItem('leadgen_user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  }
};