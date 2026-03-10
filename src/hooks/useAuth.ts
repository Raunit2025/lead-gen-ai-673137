import { useState, useEffect } from 'react';
import { authService, User } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        if (authenticated) {
          const currentUser = await authService.getUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading, isAuthenticated: !!user };
};
