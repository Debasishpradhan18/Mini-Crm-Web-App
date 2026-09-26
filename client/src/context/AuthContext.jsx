import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexus_crm_token') || null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Handle unauthorized events dispatched by API
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('nexus_crm_token');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Validate session on initial load
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.auth.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          setSettings(res.settings || {});
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('nexus_crm_token', res.token);
      setToken(res.token);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      return res.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('nexus_crm_token', res.token);
      setToken(res.token);
      setUser(res.user);
      showToast('Account created successfully!', 'success');
      return res.user;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const demoLogin = async () => {
    const res = await api.auth.demoLogin();
    if (res.success && res.token) {
      localStorage.setItem('nexus_crm_token', res.token);
      setToken(res.token);
      setUser(res.user);
      showToast('Logged in with Demo Account!', 'success');
      return res.user;
    }
    throw new Error(res.error || 'Demo login failed');
  };

  const logout = () => {
    localStorage.removeItem('nexus_crm_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  const updateProfile = async (profileData) => {
    const res = await api.auth.updateProfile(profileData);
    if (res.success) {
      setUser(res.user);
      if (profileData.aiApiKey !== undefined || profileData.aiProvider !== undefined) {
        setSettings(prev => ({
          ...prev,
          ai_api_key: profileData.aiApiKey,
          ai_provider: profileData.aiProvider
        }));
      }
      showToast('Profile & Settings updated!', 'success');
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        settings,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
