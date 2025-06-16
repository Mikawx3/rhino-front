/**
 * 🦏 Service API Rhino - Client Frontend (Mode Dynamique)
 * Service centralisé pour toutes les interactions avec l'API Rhino
 */

// Configuration de l'API
const API_BASE_URL = 'http://app.insa-lyon.fr:8888/api';

class RhinoAPIService {
  constructor(userId = null) {
    this.userId = userId;
  }

  /**
   * Méthode helper pour faire des requêtes HTTP
   */
  async makeRequest(endpoint, options = {}) {
    if (!this.userId) {
      throw new Error('User ID is required for API requests');
    }

    // Construire l'URL complète
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    const url = new URL(fullUrl);
    
    // Ajouter le user_id seulement s'il n'est pas déjà présent
    if (!url.searchParams.has('user_id')) {
      url.searchParams.append('user_id', this.userId);
    }

    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    // console.log(`🌐 API Request: ${mergedOptions.method} ${url.toString()}`);

    const response = await fetch(url.toString(), mergedOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    // console.log(`✅ API Response:`, data);
    
    // Cas spéciaux : gérer les erreurs de "no data available" de façon gracieuse
    if (!data.success) {
      const errorMessage = data.message || 'API request failed';
      
      // Pour les challenges, ne pas lancer d'erreur si c'est juste "pas de challenge disponible"
      if (endpoint.includes('/challenges') && (
        errorMessage.includes('Aucun challenge disponible') ||
        errorMessage.includes('No challenge available') ||
        errorMessage.includes('pour vos abonnements')
      )) {
        console.log('ℹ️ No challenges available, returning empty response');
        return { 
          challenges: endpoint === '/challenges' ? [] : undefined,
          challenge: endpoint === '/challenges/today' ? null : undefined
        };
      }
      
      // Pour toute autre erreur, la lancer normalement
      throw new Error(errorMessage);
    }
    
    return data.data;
  }

  // ============================================================================
  // 👥 UTILISATEURS
  // ============================================================================

  /**
   * Récupérer tous les utilisateurs
   */
  async getUsers() {
    return await this.makeRequest('/users/');
  }

  /**
   * Créer un nouvel utilisateur
   */
  async registerUser(userData) {
    return await this.makeRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Récupérer les abonnements d'un utilisateur
   */
  async getUserSubscriptions(userId) {
    return await this.makeRequest('/users/subscriptions', {
      method: 'PUT',
      body: JSON.stringify({
        user_id: userId,
      }),
    });
  }

  /**
   * Mettre à jour les abonnements d'un utilisateur (ajouter ou retirer)
   */
  async updateUserSubscriptions(userId, subscriptions) {
    return await this.makeRequest('/users/subscriptions', {
      method: 'PUT',
      body: JSON.stringify({
        user_id: userId,
        subscriptions: subscriptions,
      }),
    });
  }

  /**
   * Mettre à jour les informations d'un utilisateur
   */
  async updateUserInfo(userId, userData) {
    return await this.makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // ============================================================================
  // 📚 MATIÈRES
  // ============================================================================

  /**
   * Récupérer toutes les matières
   */
  async getMatieres() {
    try {
      return await this.makeRequest('/matieres/');
    } catch (error) {
      // Si l'erreur indique qu'il n'y a pas de matières disponibles, retourner une liste vide
      if (error.message && (
        error.message.includes('Aucune matière') || 
        error.message.includes('No subjects') ||
        error.message.includes('matières disponibles')
      )) {
        console.log('ℹ️ No subjects available, returning empty list');
        return { matieres: [] };
      }
      // Pour toute autre erreur, la relancer
      throw error;
    }
  }

  /**
   * Créer une nouvelle matière
   */
  async createMatiere(matiereData) {
    return await this.makeRequest('/matieres/', {
      method: 'POST',
      body: JSON.stringify(matiereData),
    });
  }

  /**
   * Récupérer les détails d'une matière
   */
  async getMatiereDetails(matiereName) {
    return await this.makeRequest(`/matieres/${matiereName}`);
  }

  /**
   * Supprimer une matière
   */
  async deleteMatiere(matiereName) {
    return await this.makeRequest(`/matieres/${matiereName}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // 📄 DOCUMENTS
  // ============================================================================

  /**
   * Récupérer tous les documents d'une matière
   */
  async getDocuments(matiere) {
    try {
      return await this.makeRequest(`/matieres/${matiere}/documents`);
    } catch (error) {
      // Si l'erreur indique qu'il n'y a pas de documents disponibles, retourner une liste vide
      if (error.message && (
        error.message.includes('Aucun document') || 
        error.message.includes('No documents') ||
        error.message.includes('documents disponibles') ||
        error.message.includes('404')
      )) {
        console.log('ℹ️ No documents available for this subject, returning empty list');
        return { documents: [] };
      }
      // Pour toute autre erreur, la relancer
      throw error;
    }
  }

  /**
   * Uploader un document
   */
  async uploadDocument(matiere, file, isExam = false) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_exam', isExam);
    
    const url = `${API_BASE_URL}/matieres/${matiere}/documents?user_id=${this.userId}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }
      
      return data.data;
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  }

  /**
   * Supprimer un document
   */
  async deleteDocument(matiere, documentId) {
    return await this.makeRequest(`/matieres/${matiere}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Télécharger le contenu d'un document
   */
  async getDocumentContent(matiere, documentId) {
    const url = `${API_BASE_URL}/matieres/${matiere}/documents/${documentId}/content?user_id=${this.userId}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      return response; // Retourne la réponse pour téléchargement
    } catch (error) {
      console.error('Document download failed:', error);
      throw error;
    }
  }

  /**
   * Réindexer les documents d'une matière
   */
  async reindexMatiere(matiereName) {
    return await this.makeRequest(`/matieres/${matiereName}/documents/reindex`, {
      method: 'POST',
    });
  }

  /**
   * Récupérer les changements de documents
   */
  async getDocumentChanges(matiere) {
    return await this.makeRequest(`/matieres/${matiere}/documents/changes`);
  }

  // ============================================================================
  // ❓ QUESTIONS (RAG)
  // ============================================================================

  /**
   * Poser une question au système RAG
   */
  async askQuestion(query, matiere) {
    return await this.makeRequest('/question', {
      method: 'POST',
      body: JSON.stringify({
        matiere: matiere,
        query: query,
      }),
    });
  }

  /**
   * Générer une question de réflexion
   */
  async generateReflectionQuestion(matiere, conceptCle = '') {
    return await this.makeRequest('/question/reflection', {
      method: 'POST',
      body: JSON.stringify({
        matiere: matiere,
        concept_cle: conceptCle,
      }),
    });
  }

  // ============================================================================
  // 📊 ÉVALUATIONS
  // ============================================================================

  /**
   * Évaluer une réponse d'étudiant
   */
  async evaluateResponse(matiere, question, reponseEtudiant) {
    return await this.makeRequest('/evaluation/response', {
      method: 'POST',
      body: JSON.stringify({
        matiere: matiere,
        question: question,
        reponse_etudiant: reponseEtudiant,
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
    const result = await this.makeRequest('/challenges/today');
    return { challenge: result.challenge };
  }

  /**
   * Récupérer tous les challenges
   */
  async getChallenges(matiere = null) {
    let endpoint = '/challenges';
    if (matiere) {
      endpoint += `?matiere=${matiere}`;
    }
    const result = await this.makeRequest(endpoint);
    return { challenges: result.challenges };
  }

  /**
   * Créer un nouveau challenge
   */
  async createChallenge(challengeData) {
    return await this.makeRequest('/challenges', {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });
  }

  /**
   * Soumettre une réponse à un challenge
   */
  async submitChallengeResponse(challengeId, response) {
    return await this.makeRequest(`/challenges/${challengeId}/response`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: this.userId.toString(),
        response: response,
      }),
    });
  }

  /**
   * Récupérer le leaderboard d'un challenge
   */
  async getChallengeLeaderboard(challengeId) {
    return await this.makeRequest(`/challenges/${challengeId}/leaderboard`);
  }

  /**
   * Récupérer le prochain challenge pour une matière
   */
  async getNextChallenge(matiere) {
    return await this.makeRequest(`/challenges/next?matiere=${matiere}`);
  }

  // ============================================================================
  // 🏅 LEADERBOARD
  // ============================================================================

  /**
   * Calculer le leaderboard
   */
  async calculateLeaderboard(matiere = null, limit = 10) {
    return await this.makeRequest('/leaderboard/calcule', {
      method: 'POST',
      body: JSON.stringify({
        matiere: matiere,
        limit: limit,
      }),
    });
  }

  // ============================================================================
  // 📈 STATS (Méthodes utilitaires)
  // ============================================================================

  /**
   * Récupérer les statistiques d'un utilisateur
   */
  async getUserStats(userId = null) {
    const targetUserId = userId || this.userId;
    
    try {
      // Récupérer différentes statistiques en parallèle
      const [challenges, matieres] = await Promise.allSettled([
        this.getChallenges(),
        this.getMatieres(),
      ]);
      
      const stats = {
        totalChallenges: challenges.status === 'fulfilled' ? (challenges.value.challenges?.length || 0) : 0,
        totalMatieres: matieres.status === 'fulfilled' ? (matieres.value.matieres?.length || 0) : 0,
        lastActivity: new Date().toISOString(),
      };
      
      return stats;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalChallenges: 0,
        totalMatieres: 0,
        lastActivity: new Date().toISOString(),
      };
    }
  }

  /**
   * S'abonner à une matière
   */
  async subscribeToMatiere(matiereName) {
    try {
      // D'abord récupérer les abonnements actuels
      const currentSubs = await this.getUserSubscriptions(this.userId);
      const subscriptions = currentSubs.subscriptions || [];
      
      // Vérifier si déjà abonné
      if (!subscriptions.includes(matiereName)) {
        subscriptions.push(matiereName);
        return await this.updateUserSubscriptions(this.userId, subscriptions);
      }
      
      return currentSubs; // Déjà abonné
    } catch (error) {
      console.error('Failed to subscribe to matiere:', error);
      throw error;
    }
  }

  /**
   * Se désabonner d'une matière
   */
  async unsubscribeFromMatiere(matiereName) {
    try {
      // D'abord récupérer les abonnements actuels
      const currentSubs = await this.getUserSubscriptions(this.userId);
      const subscriptions = (currentSubs.subscriptions || []).filter(sub => sub !== matiereName);
      
      return await this.updateUserSubscriptions(this.userId, subscriptions);
    } catch (error) {
      console.error('Failed to unsubscribe from matiere:', error);
      throw error;
    }
  }
}

/**
 * Hook React pour utiliser le service API
 */
export function useRhinoAPI(userId) {
  return new RhinoAPIService(userId);
} 