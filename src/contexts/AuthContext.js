"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

// Profils de test statiques (simulation backend)
const STATIC_PROFILES = [
  {
    id: 1,
    username: "student1",
    email: "student1@example.com",
    role: "student",
    subscriptions: ["JAVASCRIPT", "PYTHON", "REACT"],
    avatar: null,
    created_at: "2024-01-15T10:00:00Z",
    stats: {
      totalChallenges: 15,
      completedChallenges: 12,
      streak: 5
    }
  },
  {
    id: 2,
    username: "student2", 
    email: "student2@example.com",
    role: "student",
    subscriptions: ["PYTHON", "VUE"],
    avatar: null,
    created_at: "2024-01-20T14:30:00Z",
    stats: {
      totalChallenges: 8,
      completedChallenges: 6,
      streak: 2
    }
  },
  {
    id: 3,
    username: "teacher1",
    email: "teacher1@example.com", 
    role: "teacher",
    subscriptions: ["JAVASCRIPT", "PYTHON", "REACT", "VUE"],
    avatar: null,
    created_at: "2024-01-10T09:00:00Z",
    stats: {
      studentsCount: 25,
      coursesCreated: 8,
      totalDocuments: 42
    }
  },
  {
    id: 4,
    username: "teacher2",
    email: "teacher2@example.com",
    role: "teacher", 
    subscriptions: ["NODEJS", "REACT"],
    avatar: null,
    created_at: "2024-01-12T16:45:00Z",
    stats: {
      studentsCount: 18,
      coursesCreated: 5,
      totalDocuments: 28
    }
  },
  {
    id: 5,
    username: "admin1",
    email: "admin1@example.com",
    role: "admin",
    subscriptions: ["*"], // Accès à tout
    avatar: null,
    created_at: "2024-01-01T08:00:00Z",
    stats: {
      totalUsers: 150,
      totalCourses: 25,
      systemUptime: "99.9%"
    }
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier la session au chargement (mode statique)
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      
      // Simuler une vérification de session (récupérer depuis localStorage)
      const storedUserId = localStorage.getItem('rhino_static_user_id');
      
      if (storedUserId) {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const profile = STATIC_PROFILES.find(p => p.id.toString() === storedUserId);
        if (profile) {
          setUser(profile);
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
    localStorage.setItem('rhino_static_user_id', userData.id.toString());
    setError(null);
  };

  const devLogin = async (userId) => {
    try {
      setLoading(true);
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Trouver le profil correspondant
      const profile = STATIC_PROFILES.find(p => p.id === userId);
      
      if (profile) {
        setUser(profile);
        localStorage.setItem('rhino_static_user_id', profile.id.toString());
        setError(null);
        return true;
      } else {
        setError('Profil non trouvé');
        return false;
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Échec de la connexion');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      console.error('Logout failed:', err);
    }
    
    setUser(null);
    localStorage.removeItem('rhino_static_user_id');
  };

  const value = {
    user,
    loading,
    error,
    login,
    devLogin,
    logout,
    checkSession,
    // Exposer les profils disponibles
    availableProfiles: STATIC_PROFILES
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