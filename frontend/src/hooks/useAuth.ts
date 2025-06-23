import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, TokenResponse } from '../types/user';
import { ApiResponse } from '../types/api';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export default function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoading(false);
      return false;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const userData = await response.json();
      setUser(userData);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('expires_at');
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: TokenResponse = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('expires_at', data.expires_at);

      // Get user details
      await checkAuth();
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('expires_at');
    setUser(null);
    router.push('/auth/login');
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };
}
