/**
 * 🦏 Service API Rhino - Client Frontend
 * Service centralisé pour toutes les interactions avec l'API Rhino
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class RhinoAPIService {
  constructor(userId = null) {
    this.userId = userId;
    this.baseURL = API_BASE_URL;
  }

  /**
   * Requête HTTP générique avec gestion d'erreurs
   */
  async request(endpoint, options = {}) {
    const url = new URL(endpoint, this.baseURL);
    
    // Ajouter user_id si disponible (sauf pour les endpoints d'auth)
    if (this.userId && !endpoint.includes('/auth/')) {
      url.searchParams.set('user_id', this.userId.toString());
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url.toString(), config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============================================================================
  // 🔐 AUTHENTIFICATION & UTILISATEURS
  // ============================================================================

  /**
   * Inscription d'un nouvel utilisateur
   */
  async registerUser(userData) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Récupérer les informations d'un utilisateur
   * ⚠️ À IMPLÉMENTER dans le backend
   */
  async getUserInfo(userId) {
    return this.request(`/users/${userId}`);
  }

  /**
   * Mettre à jour les informations utilisateur
   */
  async updateUserInfo(userId, updates) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Gérer les abonnements aux matières
   */
  async getSubscriptions(userId) {
    return this.request('/users/subscriptions', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async updateSubscriptions(userId, subscriptions) {
    return this.request('/users/subscriptions', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, subscriptions }),
    });
  }

  /**
   * Statistiques utilisateur
   * ⚠️ À IMPLÉMENTER dans le backend
   */
  async getUserStats(userId) {
    return this.request(`/users/${userId}/stats`);
  }

  async getUserProgress(userId) {
    return this.request(`/users/${userId}/progress`);
  }

  async getUserActivity(userId) {
    return this.request(`/users/${userId}/activity`);
  }

  async getUserAchievements(userId) {
    return this.request(`/users/${userId}/achievements`);
  }

  // ============================================================================
  // 📚 MATIÈRES
  // ============================================================================

  /**
   * Récupérer toutes les matières
   */
  async getMatieres() {
    return this.request('/matieres/');
  }

  /**
   * Créer une nouvelle matière
   */
  async createMatiere(matiereData) {
    return this.request('/matieres/', {
      method: 'POST',
      body: JSON.stringify(matiereData),
    });
  }

  /**
   * Récupérer les détails d'une matière
   */
  async getMatiereDetails(matiereName) {
    return this.request(`/matieres/${matiereName}`);
  }

  /**
   * Supprimer une matière
   */
  async deleteMatiere(matiereName) {
    return this.request(`/matieres/${matiereName}`, {
      method: 'DELETE',
    });
  }

  /**
   * Réindexer une matière
   */
  async reindexMatiere(matiereName) {
    return this.request(`/matieres/${matiereName}/update`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // 📄 DOCUMENTS
  // ============================================================================

  /**
   * Récupérer les documents d'une matière
   */
  async getDocuments(matiere) {
    return this.request(`/matieres/${matiere}/documents`);
  }

  /**
   * Uploader un document
   */
  async uploadDocument(matiere, file, description = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    const url = new URL(`/matieres/${matiere}/documents`, this.baseURL);
    if (this.userId) {
      url.searchParams.set('user_id', this.userId.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  }

  /**
   * Supprimer un document
   */
  async deleteDocument(matiere, documentId) {
    return this.request(`/matieres/${matiere}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Récupérer le contenu d'un document
   */
  async getDocumentContent(matiere, documentId) {
    return this.request(`/matieres/${matiere}/documents/${documentId}/content`);
  }

  // ============================================================================
  // ❓ QUESTIONS & RAG
  // ============================================================================

  /**
   * Poser une question au système RAG
   */
  async askQuestion(query, matiere, maxTokens = 500) {
    return this.request('/question', {
      method: 'POST',
      body: JSON.stringify({
        query,
        matiere,
        max_tokens: maxTokens,
      }),
    });
  }

  /**
   * Générer une question de réflexion
   */
  async generateReflectionQuestion(matiere) {
    return this.request('/question/reflection', {
      method: 'POST',
      body: JSON.stringify({ matiere }),
    });
  }

  /**
   * Évaluer une réponse
   */
  async evaluateResponse(question, response, matiere, criteria = []) {
    return this.request('/evaluation/response', {
      method: 'POST',
      body: JSON.stringify({
        question,
        reponse_etudiant: response,
        matiere,
        criteres_evaluation: criteria,
      }),
    });
  }

  // ============================================================================
  // 🏆 CHALLENGES
  // ============================================================================

  /**
   * Récupérer le challenge du jour
   */
  async getTodayChallenge() {
    return this.request('/challenges/today');
  }

  /**
   * Récupérer le challenge du jour (version simple)
   */
  async getTodaySimpleChallenge() {
    return this.request('/challenges/today/simple');
  }

  /**
   * Récupérer tous les challenges
   */
  async getChallenges(matiere = null) {
    const url = '/challenges/';
    if (matiere) {
      return this.request(`${url}?matiere=${matiere}`);
    }
    return this.request(url);
  }

  /**
   * Créer un nouveau challenge
   */
  async createChallenge(challengeData) {
    return this.request('/challenges/', {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });
  }

  /**
   * Soumettre une réponse à un challenge
   */
  async submitChallengeResponse(challengeId, response) {
    return this.request(`/challenges/${challengeId}/response`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  /**
   * Récupérer le classement d'un challenge
   */
  async getChallengeLeaderboard(challengeId) {
    return this.request(`/challenges/${challengeId}/leaderboard`);
  }

  /**
   * Récupérer le prochain challenge
   */
  async getNextChallenge(matiere) {
    return this.request(`/challenges/next?matiere=${matiere}`);
  }

  // ============================================================================
  // 🏅 CLASSEMENTS
  // ============================================================================

  /**
   * Calculer le classement d'un challenge
   */
  async calculateLeaderboard(challengeData) {
    return this.request('/leaderboard/calcule/', {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });
  }
}

// Export du service et d'une instance par défaut
export default RhinoAPIService;

// Instance globale pour faciliter l'utilisation
export const apiService = new RhinoAPIService();

// Hook React personnalisé pour l'API
export function useRhinoAPI(userId) {
  const service = new RhinoAPIService(userId);
  return service;
} 