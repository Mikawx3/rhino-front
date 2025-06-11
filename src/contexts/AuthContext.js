"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier la session au chargement
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      
      // Récupérer le token depuis les cookies ou localStorage
      const token = getCookie('rhino_token') || localStorage.getItem('rhino_token');
      
      if (token) {
        // Vérifier la validité du token
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUser(result.data.user);
          }
        }
      }
    } catch (err) {
      console.error('Session check failed:', err);
      setError('Failed to verify session');
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, token) => {
    setUser(userData);
    localStorage.setItem('rhino_token', token);
    setError(null);
  };

  const devLogin = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/dev/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userId)
      });

      const result = await response.json();
      
      if (result.success) {
        setUser(result.data.user);
        localStorage.setItem('rhino_token', result.data.token);
        setError(null);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = getCookie('rhino_token') || localStorage.getItem('rhino_token');
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
    
    setUser(null);
    localStorage.removeItem('rhino_token');
    document.cookie = 'rhino_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const value = {
    user,
    loading,
    error,
    login,
    devLogin,
    logout,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 