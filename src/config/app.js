/**
 * 🦏 Configuration d'application Rhino
 * Re-export de la configuration d'environnement pour maintenir la compatibilité
 */

import { ENV_CONFIG } from './environment';

// Configuration des URLs de l'application (legacy)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Côté client
    return window.location.origin;
  }
  // Côté serveur
  return ENV_CONFIG.FRONTEND_BASE_URL;
};

export const config = {
  getBaseUrl,
  casLoginUrl: ENV_CONFIG.CAS_LOGIN_URL + '/login',
  casLogoutUrl: ENV_CONFIG.CAS_LOGIN_URL + '/logout',
  getCasCallbackUrl: () => ENV_CONFIG.getCasCallbackUrl(),
  getLoginUrl: () => ENV_CONFIG.getFrontendUrl('/login'),
  getDashboardUrl: () => ENV_CONFIG.getDashboardUrl(),
  
  // Export de la nouvelle configuration pour utilisation directe
  ...ENV_CONFIG,
}; 