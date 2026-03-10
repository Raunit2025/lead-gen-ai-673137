import { supabase } from '../lib/supabaseClient';

export interface User {
  id: string;
  email: string;
  name?: string;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !supabase;

const MOCK_USER: User = {
  id: 'mock-user-id',
  email: 'demo@leadgenai.com',
  name: 'Demo User',
};

export const authService = {
  login: async (email: string, password: string): Promise<void> => {
    if (USE_MOCK) {
      localStorage.setItem('leadgen_auth_mock', 'true');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
  },

  register: async (email: string, password: string, name: string): Promise<void> => {
    if (USE_MOCK) {
      localStorage.setItem('leadgen_auth_mock', 'true');
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
  },

  logout: async () => {
    if (USE_MOCK) {
      localStorage.removeItem('leadgen_auth_mock');
      localStorage.clear();
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Clear any local storage that might be left
    localStorage.clear(); 
  },

  isAuthenticated: async () => {
    if (USE_MOCK) {
      return localStorage.getItem('leadgen_auth_mock') === 'true';
    }
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  getUser: async (): Promise<User | null> => {
    if (USE_MOCK) {
      const isAuth = localStorage.getItem('leadgen_auth_mock') === 'true';
      return isAuth ? MOCK_USER : null;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || '',
    };
  }
};
