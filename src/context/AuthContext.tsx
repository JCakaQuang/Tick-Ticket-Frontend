'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiRequest } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  login: (emailOrToken: string, passwordOrUser?: any) => Promise<{ success: boolean; message?: string }>;
  register: (dto: { fullName: string; email: string; phoneNumber?: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Verify token validity with backend to prevent phantom sessions
        apiRequest<User>('/auth/me').then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          } else if (res.statusCode === 401 || res.statusCode === 403) {
            // Token is expired or revoked
            logout();
          }
        }).catch(() => {
          // Network error or offline, keep cached user
        });
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrToken: string, passwordOrUser?: any): Promise<{ success: boolean; message?: string }> => {
    if (typeof passwordOrUser === 'string') {
      const email = emailOrToken;
      const password = passwordOrUser;
      const res = await apiRequest<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Đăng nhập không thành công' };
    } else {
      const newToken = emailOrToken;
      const newUser = passwordOrUser;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    }
  };

  const register = async (dto: { fullName: string; email: string; phoneNumber?: string; password: string }): Promise<{ success: boolean; message?: string }> => {
    const res = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return { success: true };
    }
    return { success: false, message: res.message || 'Đăng ký không thành công' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    if (!token) return;
    const res = await apiRequest<User>('/auth/me');
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } else {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, loading: isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};