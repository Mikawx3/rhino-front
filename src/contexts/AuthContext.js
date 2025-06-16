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
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

  // Vérifier la session au chargement (mode statique + CAS)
  useEffect(() => {
    checkSession();
  }, []);

  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
  };

  const determineCasUserRole = (username) => {
    // Logique pour déterminer le rôle basé sur le username
    // Vous pouvez ajuster selon vos besoins
    if (username.includes('admin') || username.includes('prof') || username.startsWith('p')) {
      return 'admin';
    } else if (username.includes('teacher') || username.includes('enseignant')) {
      return 'teacher';
    } else {
      return 'student';
    }
  };

  const getCasUserSubscriptions = (role) => {
    switch (role) {
      case 'admin':
        return ['*']; // Accès complet
      case 'teacher':
        return ['JAVASCRIPT', 'PYTHON', 'REACT', 'VUE', 'NODEJS'];
      case 'student':
      default:
        return ['JAVASCRIPT', 'PYTHON', 'REACT'];
    }
  };

  const checkSession = async () => {
    try {
      setLoading(true);
      
      // 1. Vérifier d'abord les cookies CAS
      const casUsername = getCookie('user');
      const casUserId = getCookie('user_id');
      const casUserRole = getCookie('user_role');
      console.log('CAS Cookies - Username:', casUsername, 'User ID:', casUserId, 'Role:', casUserRole);
      
      
      if (casUsername && casUserId) {
        // Convertir l'ID en nombre
        const numericUserId = parseInt(casUserId);
        if (isNaN(numericUserId)) {
          console.error('❌ Invalid user ID from cookie:', casUserId);
          // Nettoyer les cookies invalides
          document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          setUser(null);
          return;
        }
        
        // Utiliser le rôle du cookie ou déterminer automatiquement
        const role = casUserRole || determineCasUserRole(casUsername);
        const subscriptions = getCasUserSubscriptions(role);
        
        // Créer un profil pour l'utilisateur CAS avec l'ID numérique du backend
        const casProfile = {
          id: numericUserId, // ID numérique retourné par l'API backend
          username: casUsername,
          email: `${casUsername}@insa-lyon.fr`,
          role: role,
          subscriptions: subscriptions,
          avatar: null,
          created_at: new Date().toISOString(),
          stats: {
            totalChallenges: Math.floor(Math.random() * 10) + 1,
            completedChallenges: Math.floor(Math.random() * 5) + 1,
            streak: Math.floor(Math.random() * 7) + 1
          },
          isCasUser: true // Marquer comme utilisateur CAS
        };
        
        console.log('✅ CAS User Profile created:', casProfile);
        setUser(casProfile);
        setError(null);
        return;
      }
      
      // 2. Sinon, vérifier localStorage pour les profils de test
      const storedUserId = localStorage.getItem('rhino_static_user_id');
      
      if (storedUserId) {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const profile = STATIC_PROFILES.find(p => p.id.toString() === storedUserId);
        if (profile) {
          console.log('✅ Test User Profile loaded:', profile);
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
    if (!userData.isCasUser) {
      localStorage.setItem('rhino_static_user_id', userData.id.toString());
    }
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
    
    const isCurrentlyCasUser = user?.isCasUser;
    
    setUser(null);
    setSubscriptions([]);
    localStorage.removeItem('rhino_static_user_id');
    
    // Supprimer tous les cookies CAS s'ils existent
    if (getCookie('user')) {
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    if (getCookie('user_id')) {
      document.cookie = 'user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    if (getCookie('user_role')) {
      document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    
    // Si c'était un utilisateur CAS, rediriger vers la déconnexion CAS complète
    if (isCurrentlyCasUser) {
      logoutCAS();
    }
    
    setError(null);
  };

  const logoutCAS = () => {
    // URL de déconnexion CAS de l'INSA Lyon
    const casLogoutUrl = 'https://login.insa-lyon.fr/cas/logout';
    const serviceUrl = encodeURIComponent('http://app.insa-lyon.fr:3001/login');
    
    // Rediriger vers la déconnexion CAS avec retour vers la page de login
    window.location.href = `${casLogoutUrl}?service=${serviceUrl}`;
  };

  // ============================================================================
  // 📋 GESTION DES ABONNEMENTS CENTRALISÉE
  // ============================================================================

  /**
   * Charger les abonnements de l'utilisateur depuis l'API
   */
  const loadUserSubscriptions = async (userId) => {
    if (!userId) return;
    
    try {
      setSubscriptionsLoading(true);
      
      // Dynamiquement importer le service API pour éviter les dépendances circulaires
      const { useRhinoAPI } = await import('@/lib/api-service');
      const apiService = useRhinoAPI(userId);
      
      const response = await apiService.getUserSubscriptions(userId);
      const userSubs = response.subscriptions || [];
      
      setSubscriptions(userSubs);
      console.log('✅ Abonnements chargés:', userSubs);
      
      return userSubs;
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
      // En cas d'erreur, utiliser les abonnements du profil utilisateur
      const fallbackSubs = user?.subscriptions || [];
      setSubscriptions(fallbackSubs);
      return fallbackSubs;
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  /**
   * S'abonner à une matière
   */
  const subscribeToSubject = async (subjectName) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSubscriptionsLoading(true);
      
      const { useRhinoAPI } = await import('@/lib/api-service');
      const apiService = useRhinoAPI(user.id);
      
      await apiService.subscribeToMatiere(subjectName);
      
      // Mettre à jour l'état local
      setSubscriptions(prev => {
        if (!prev.includes(subjectName)) {
          return [...prev, subjectName];
        }
        return prev;
      });
      
      console.log('✅ Abonné à:', subjectName);
    } catch (err) {
      console.error('Failed to subscribe:', err);
      throw err;
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  /**
   * Se désabonner d'une matière
   */
  const unsubscribeFromSubject = async (subjectName) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSubscriptionsLoading(true);
      
      const { useRhinoAPI } = await import('@/lib/api-service');
      const apiService = useRhinoAPI(user.id);
      
      await apiService.unsubscribeFromMatiere(subjectName);
      
      // Mettre à jour l'état local
      setSubscriptions(prev => prev.filter(sub => sub !== subjectName));
      
      console.log('✅ Désabonné de:', subjectName);
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
      throw err;
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  /**
   * Filtrer les matières selon les abonnements de l'utilisateur
   */
  const filterSubjectsBySubscriptions = (allSubjects) => {
    // Si admin, accès à tout
    if (user?.role === 'admin' || subscriptions.includes('*')) {
      return allSubjects;
    }
    
    // Si pas d'abonnements, retourner liste vide pour forcer l'utilisateur à s'abonner
    if (subscriptions.length === 0) {
      return [];
    }
    
    // Filtrer selon les abonnements
    return allSubjects.filter(subject => {
      const subjectId = subject.name || subject;
      return subscriptions.includes(subjectId);
    });
  };

  /**
   * Vérifier si l'utilisateur est abonné à une matière
   */
  const isSubscribedTo = (subjectName) => {
    return user?.role === 'admin' || 
           subscriptions.includes('*') || 
           subscriptions.includes(subjectName);
  };

  // Charger les abonnements quand l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      // Pour les utilisateurs CAS, utiliser les abonnements du profil
      if (user.isCasUser) {
        setSubscriptions(user.subscriptions || []);
      } else {
        // Pour les autres, charger depuis l'API
        loadUserSubscriptions(user.id);
      }
    } else if (!user) {
      setSubscriptions([]);
    }
  }, [user?.id]);

  const value = {
    user,
    loading,
    error,
    login,
    devLogin,
    logout,
    logoutCAS,
    checkSession,
    // Exposer les profils disponibles
    availableProfiles: STATIC_PROFILES,
    subscriptions,
    subscriptionsLoading,
    loadUserSubscriptions,
    subscribeToSubject,
    unsubscribeFromSubject,
    filterSubjectsBySubscriptions,
    isSubscribedTo
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