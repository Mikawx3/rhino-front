/**
 * 🦏 Configuration d'environnement Rhino
 * Gère les URLs selon l'environnement (development/production)
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Configuration par environnement avec variables d'environnement (priorité sur fallbacks)
const environments = {
  development: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888/api',
    FRONTEND_BASE_URL: process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3001',
    CAS_LOGIN_URL: process.env.NEXT_PUBLIC_CAS_LOGIN_URL || 'https://login.insa-lyon.fr/cas',
    
    // URLs CAS spécifiques (optionnel - sinon construites automatiquement)
    CAS_LOGIN_DIRECT_URL: process.env.NEXT_PUBLIC_CAS_LOGIN_DIRECT_URL || 'https://login.insa-lyon.fr/cas/login',
    CAS_CALLBACK_DIRECT_URL: process.env.NEXT_PUBLIC_CAS_CALLBACK_DIRECT_URL || 'http://app.insa-lyon.fr:3001/api/auth/cas/callback',
    
    // URL Dashboard spécifique (optionnel - sinon construite automatiquement)
    DASHBOARD_DIRECT_URL: process.env.NEXT_PUBLIC_DASHBOARD_DIRECT_URL || null,
  },
  production: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888/api',
    FRONTEND_BASE_URL: process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3001',
    CAS_LOGIN_URL: process.env.NEXT_PUBLIC_CAS_LOGIN_URL || 'https://login.insa-lyon.fr/cas',
    
    // URLs CAS spécifiques (optionnel - sinon construites automatiquement)
    CAS_LOGIN_DIRECT_URL: process.env.NEXT_PUBLIC_CAS_LOGIN_DIRECT_URL || 'https://login.insa-lyon.fr/cas/login',
    CAS_CALLBACK_DIRECT_URL: process.env.NEXT_PUBLIC_CAS_CALLBACK_DIRECT_URL || 'http://app.insa-lyon.fr:3001/api/auth/cas/callback',
    
    // URL Dashboard spécifique (optionnel - sinon construite automatiquement)
    DASHBOARD_DIRECT_URL: process.env.NEXT_PUBLIC_DASHBOARD_DIRECT_URL || null,
  }
};

// Déterminer l'environnement actuel
const currentEnv = isProduction ? 'production' : 'development';
const config = environments[currentEnv];

// Export des variables d'environnement
export const ENV_CONFIG = {
  ...config,
  
  // Helpers
  isDevelopment,
  isProduction,
  currentEnv,
  
  // Fonctions utilitaires
  getApiUrl: (endpoint = '') => `${config.API_BASE_URL}${endpoint}`,
  getCasCallbackUrl: () => config.CAS_CALLBACK_DIRECT_URL || `${config.FRONTEND_BASE_URL}/api/auth/cas/callback`,
  getCasLoginUrl: (service) => {
    const loginUrl = config.CAS_LOGIN_DIRECT_URL || `${config.CAS_LOGIN_URL}/login`;
    return service ? `${loginUrl}?service=${encodeURIComponent(service)}` : loginUrl;
  },
  getCasBaseUrl: () => config.CAS_LOGIN_URL,
  getFrontendUrl: (path = '') => `${config.FRONTEND_BASE_URL}${path}`,
  
  // URLs de redirection
  getLoginErrorUrl: (error) => `${config.FRONTEND_BASE_URL}/login?error=${error}`,
  getDashboardUrl: () => config.DASHBOARD_DIRECT_URL || `${config.FRONTEND_BASE_URL}/dashboard`,
  
  // URLs CAS directes (pour usage manuel)
  getCasLoginDirectUrl: () => config.CAS_LOGIN_DIRECT_URL || `${config.CAS_LOGIN_URL}/login`,
  getCasCallbackDirectUrl: () => config.CAS_CALLBACK_DIRECT_URL || `${config.FRONTEND_BASE_URL}/api/auth/cas/callback`,
  
  // URL Dashboard directe (pour usage manuel)
  getDashboardDirectUrl: () => config.DASHBOARD_DIRECT_URL || `${config.FRONTEND_BASE_URL}/dashboard`,
};
