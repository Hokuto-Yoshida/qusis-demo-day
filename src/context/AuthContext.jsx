import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock user data - in real app this would come from API
  const mockUsers = {
    'viewer1@example.com': {
      id: 4,
      name: 'viewer1',
      email: 'viewer1@example.com',
      role: 'viewer',
      coinBalance: 2430,
      avatar: 'vi'
    },
    'presenter1@example.com': {
      id: 2,
      name: 'presenter1', 
      email: 'presenter1@example.com',
      role: 'presenter',
      coinBalance: 1680,
      team: 'teamα',
      avatar: 'pr'
    },
    'admin@example.com': {
      id: 1,
      name: 'admin',
      email: 'admin@example.com', 
      role: 'admin',
      coinBalance: 5710,
      avatar: 'ad'
    }
  };

  useEffect(() => {
    // Check for stored user session
    const storedUser = sessionStorage.getItem('qusis_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Mock login validation
      const foundUser = mockUsers[email];
      if (foundUser && password === 'password') {
        setUser(foundUser);
        sessionStorage.setItem('qusis_user', JSON.stringify(foundUser));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // Mock registration
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role || 'viewer',
        coinBalance: 1000, // Starting coins
        team: userData.team || null,
        avatar: userData.name.substring(0, 2).toLowerCase()
      };
      
      setUser(newUser);
      sessionStorage.setItem('qusis_user', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('qusis_user');
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    sessionStorage.setItem('qusis_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};