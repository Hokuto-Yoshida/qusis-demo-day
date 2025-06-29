// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Axios設定: 本番環境のベースURLを設定
if (typeof window !== 'undefined') {
  axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://qusis-demo-day-1.onrender.com' 
    : 'http://localhost:4000';
}

// Create context
const AuthContext = createContext();

// Hook for consuming context
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [token, setToken]       = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('qusis_auth');
    if (saved) {
      try {
        const { token: t, user: u } = JSON.parse(saved);
        axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        setToken(t);
        setUser(u);
      } catch (error) {
        console.error('Failed to parse saved auth data:', error);
        localStorage.removeItem('qusis_auth');
      }
    }
    setLoading(false);
  }, []);

  // Persist whenever user/token changes
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('qusis_auth', JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem('qusis_auth');
    }
  }, [user, token]);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('Login attempt to:', axios.defaults.baseURL + '/api/auth/login');
      const res = await axios.post('/api/auth/login', { email, password });
      
      if (res.data.success) {
        const { token: t, user: u } = res.data;
        axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        setToken(t);
        setUser(u);
        return { success: true };
      } else {
        return {
          success: false,
          error: res.data.message || 'ログインに失敗しました'
        };
      }
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'ネットワークエラーが発生しました'
      };
    }
  };

  // Registration function
  const register = async (payload) => {
    try {
      console.log('Register attempt to:', axios.defaults.baseURL + '/api/auth/register');
      const res = await axios.post('/api/auth/register', payload);
      
      if (res.data.success) {
        const { token: t, user: u } = res.data;
        axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        setToken(t);
        setUser(u);
        return { success: true };
      } else {
        return {
          success: false,
          error: res.data.message || '登録に失敗しました'
        };
      }
    } catch (err) {
      console.error('Register error:', err);
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'ネットワークエラーが発生しました'
      };
    }
  };

  // Logout
  const logout = () => {
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Update local user (e.g. balance)
  const updateUser = (updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('qusis_auth', JSON.stringify({ token, user: next }));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};