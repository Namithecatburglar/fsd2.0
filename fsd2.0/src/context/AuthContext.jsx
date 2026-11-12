import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('windops_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('windops_token');
      if (savedToken) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.data);
          }
        } catch (err) {
          console.warn('[Auth] Session expired or invalid');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    const handleExpired = () => logout();
    window.addEventListener('windops-auth-expired', handleExpired);
    return () => window.removeEventListener('windops-auth-expired', handleExpired);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.data?.token) {
      setToken(res.data.token);
      setUser(res.data);
      localStorage.setItem('windops_token', res.data.token);
      localStorage.setItem('windops_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('windops_token');
    localStorage.removeItem('windops_user');
  };

  // Quick switch between demo personas for testing
  const switchDemoRole = async (targetRole) => {
    const roleCredentials = {
      admin: { email: 'admin@windops.io', password: 'windops123' },
      operations_manager: { email: 'ops@windops.io', password: 'windops123' },
      maintenance_engineer: { email: 'tech@windops.io', password: 'windops123' },
      inspector: { email: 'inspector@windops.io', password: 'windops123' },
    };

    const creds = roleCredentials[targetRole];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin bypass
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        switchDemoRole,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
