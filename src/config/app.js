// Configuration des URLs de l'application
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Côté client
    return window.location.origin;
  }
  // Côté serveur - sera remplacé par l'URL de la requête
  return process.env.NEXT_PUBLIC_APP_URL;
};

export const config = {
  getBaseUrl,
  casLoginUrl: 'https://login.insa-lyon.fr/cas/login',
  casLogoutUrl: 'https://login.insa-lyon.fr/cas/logout',
  getCasCallbackUrl: () => `${getBaseUrl()}/api/auth/cas/callback`,
  getLoginUrl: () => `${getBaseUrl()}/login`,
  getDashboardUrl: () => `${getBaseUrl()}/dashboard`,
}; 