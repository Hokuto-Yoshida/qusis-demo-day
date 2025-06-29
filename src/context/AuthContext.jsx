// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
      const { token: t, user: u } = JSON.parse(saved);
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      setToken(t);
      setUser(u);
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
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: t, user: u } = res.data;
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      setToken(t);
      setUser(u);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.message
      };
    }
  };

  // Registration function
  const register = async (payload) => {
    try {
      const res = await axios.post('/api/auth/register', payload);
      const { token: t, user: u } = res.data;
      axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      setToken(t);
      setUser(u);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.message
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
