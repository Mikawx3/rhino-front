/**
 * 🦏 Service API Rhino - Client Frontend (Mode Statique)
 * Service centralisé pour toutes les interactions simulées avec l'API Rhino
 */

// Données statiques simulées
const STATIC_MATIERES = [
  {
    name: "JAVASCRIPT",
    description: "Programmation JavaScript moderne - ES6+ et frameworks",
    document_count: 12,
    created_at: "2024-01-15T10:00:00Z",
    last_updated: "2024-01-20T15:30:00Z"
  },
  {
    name: "PYTHON",
    description: "Python pour la data science et développement web",
    document_count: 8,
    created_at: "2024-01-18T14:00:00Z",
    last_updated: "2024-01-22T09:15:00Z"
  },
  {
    name: "REACT",
    description: "Développement d'applications React et écosystème",
    document_count: 15,
    created_at: "2024-01-10T11:30:00Z",
    last_updated: "2024-01-25T16:45:00Z"
  },
  {
    name: "VUE",
    description: "Framework Vue.js pour applications front-end",
    document_count: 6,
    created_at: "2024-01-22T09:00:00Z",
    last_updated: "2024-01-24T14:20:00Z"
  },
  {
    name: "NODEJS",
    description: "Développement backend avec Node.js et Express",
    document_count: 10,
    created_at: "2024-01-12T13:15:00Z",
    last_updated: "2024-01-23T11:30:00Z"
  }
];

const STATIC_CHALLENGES = {
  today: {
    id: 1,
    title: "Challenge JavaScript du jour",
    description: "Créez une fonction qui inverse un tableau sans utiliser reverse()",
    matiere: "JAVASCRIPT",
    difficulty: "medium",
    points: 50,
    deadline: "2024-01-26T23:59:59Z",
    submissions: 23,
    completion_rate: 0.78
  },
  list: [
    {
      id: 1,
      title: "Challenge JavaScript du jour",
      description: "Créez une fonction qui inverse un tableau sans utiliser reverse()",
      matiere: "JAVASCRIPT",
      difficulty: "medium",
      points: 50,
      created_at: "2024-01-26T00:00:00Z"
    },
    {
      id: 2,
      title: "Défi Python - Algorithmes",
      description: "Implémentez un algorithme de tri rapide en Python",
      matiere: "PYTHON",
      difficulty: "hard",
      points: 100,
      created_at: "2024-01-25T00:00:00Z"
    },
    {
      id: 3,
      title: "React Components",
      description: "Créez un composant React réutilisable avec hooks",
      matiere: "REACT",
      difficulty: "easy",
      points: 30,
      created_at: "2024-01-24T00:00:00Z"
    }
  ]
};

const STATIC_DOCUMENTS = {
  "JAVASCRIPT": [
    {
      id: 1,
      name: "Introduction à ES6+",
      type: "pdf",
      size: "2.3 MB",
      uploaded_at: "2024-01-15T10:30:00Z",
      description: "Guide complet des nouvelles fonctionnalités JavaScript"
    },
    {
      id: 2,
      name: "Async/Await vs Promises",
      type: "md",
      size: "156 KB",
      uploaded_at: "2024-01-16T14:20:00Z",
      description: "Comparaison et meilleures pratiques"
    }
  ],
  "PYTHON": [
    {
      id: 3,
      name: "Python pour la Data Science",
      type: "pdf",
      size: "4.1 MB",
      uploaded_at: "2024-01-18T09:15:00Z",
      description: "Pandas, NumPy et Matplotlib"
    }
  ],
  "REACT": [
    {
      id: 4,
      name: "React Hooks Guide",
      type: "pdf",
      size: "1.8 MB",
      uploaded_at: "2024-01-10T16:00:00Z",
      description: "Guide complet des hooks React"
    },
    {
      id: 5,
      name: "State Management avec Redux",
      type: "md",
      size: "892 KB",
      uploaded_at: "2024-01-12T11:30:00Z",
      description: "Gestion d'état avec Redux Toolkit"
    }
  ]
};

class RhinoAPIService {
  constructor(userId = null) {
    this.userId = userId;
  }

  /**
   * Simuler un délai réseau
   */
  async simulateNetworkDelay(ms = 300) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // 📚 MATIÈRES
  // ============================================================================

  /**
   * Récupérer toutes les matières
   */
  async getMatieres() {
    await this.simulateNetworkDelay();
    return { matieres: STATIC_MATIERES };
  }

  /**
   * Créer une nouvelle matière
   */
  async createMatiere(matiereData) {
    await this.simulateNetworkDelay(500);
    
    const newMatiere = {
      name: matiereData.name.toUpperCase(),
      description: matiereData.description,
      document_count: 0,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };
    
    // Ajouter à la liste statique (simulation)
    STATIC_MATIERES.push(newMatiere);
    
    return { matiere: newMatiere };
  }

  /**
   * Récupérer les détails d'une matière
   */
  async getMatiereDetails(matiereName) {
    await this.simulateNetworkDelay();
    
    const matiere = STATIC_MATIERES.find(m => m.name === matiereName.toUpperCase());
    if (!matiere) {
      throw new Error('Matière non trouvée');
    }
    
    return { matiere };
  }

  /**
   * Supprimer une matière
   */
  async deleteMatiere(matiereName) {
    await this.simulateNetworkDelay(400);
    
    const index = STATIC_MATIERES.findIndex(m => m.name === matiereName.toUpperCase());
    if (index === -1) {
      throw new Error('Matière non trouvée');
    }
    
    // Supprimer de la liste statique
    STATIC_MATIERES.splice(index, 1);
    
    return { success: true };
  }

  /**
   * Réindexer une matière
   */
  async reindexMatiere(matiereName) {
    await this.simulateNetworkDelay(1000);
    return { message: `Matière ${matiereName} réindexée avec succès` };
  }

  // ============================================================================
  // 📄 DOCUMENTS
  // ============================================================================

  /**
   * Récupérer les documents d'une matière
   */
  async getDocuments(matiere) {
    await this.simulateNetworkDelay();
    
    const documents = STATIC_DOCUMENTS[matiere.toUpperCase()] || [];
    return { documents };
  }

  /**
   * Uploader un document (simulation)
   */
  async uploadDocument(matiere, file, description = '') {
    await this.simulateNetworkDelay(1500);
    
    const newDocument = {
      id: Date.now(), // Simple ID simulation
      name: file.name,
      type: file.name.split('.').pop(),
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploaded_at: new Date().toISOString(),
      description: description || `Document uploadé: ${file.name}`
    };
    
    // Ajouter à la liste statique
    if (!STATIC_DOCUMENTS[matiere.toUpperCase()]) {
      STATIC_DOCUMENTS[matiere.toUpperCase()] = [];
    }
    STATIC_DOCUMENTS[matiere.toUpperCase()].push(newDocument);
    
    return { document: newDocument };
  }

  /**
   * Supprimer un document
   */
  async deleteDocument(matiere, documentId) {
    await this.simulateNetworkDelay();
    
    const documents = STATIC_DOCUMENTS[matiere.toUpperCase()];
    if (documents) {
      const index = documents.findIndex(d => d.id === documentId);
      if (index !== -1) {
        documents.splice(index, 1);
      }
    }
    
    return { success: true };
  }

  // ============================================================================
  // 🤖 IA & RAG
  // ============================================================================

  /**
   * Poser une question au système RAG (simulation)
   */
  async askQuestion(query, matiere, maxTokens = 500) {
    await this.simulateNetworkDelay(2000);
    
    // Réponses simulées selon la matière
    const simulatedResponses = {
      JAVASCRIPT: `Voici une explication concernant "${query}" en JavaScript:\n\n• JavaScript est un langage interprété\n• Utilise le principe de hoisting\n• Support des fonctions fléchées depuis ES6\n\nPour plus de détails, consultez les documents disponibles.`,
      PYTHON: `Concernant "${query}" en Python:\n\n• Python utilise l'indentation pour structurer le code\n• Syntaxe simple et lisible\n• Large écosystème de bibliothèques\n\nRéférez-vous aux ressources Python pour approfondir.`,
      REACT: `À propos de "${query}" en React:\n\n• React utilise un DOM virtuel\n• Composants fonctionnels avec hooks\n• Gestion d'état moderne\n\nConsultez la documentation React pour plus d'exemples.`,
      default: `Voici des informations sur "${query}":\n\nCette question nécessite une analyse plus approfondie. Je vous encourage à consulter les documents disponibles dans la matière concernée.`
    };
    
    const response = simulatedResponses[matiere.toUpperCase()] || simulatedResponses.default;
    
    return {
      response,
      sources: [
        { document: "Guide ES6+", relevance: 0.85 },
        { document: "Best Practices", relevance: 0.72 }
      ],
      tokens_used: Math.min(maxTokens, response.length * 0.75)
    };
  }

  /**
   * Générer une question de réflexion
   */
  async generateReflectionQuestion(matiere) {
    await this.simulateNetworkDelay(1500);
    
    const questions = {
      JAVASCRIPT: "Expliquez la différence entre var, let et const en JavaScript et donnez des exemples d'utilisation appropriée pour chacun.",
      PYTHON: "Décrivez les avantages de l'utilisation des list comprehensions en Python par rapport aux boucles traditionnelles.",
      REACT: "Comment optimiseriez-vous les performances d'un composant React qui affiche une grande liste d'éléments ?",
      VUE: "Expliquez le concept de réactivité dans Vue.js et comment il diffère des autres frameworks.",
      NODEJS: "Quels sont les avantages et inconvénients de l'architecture événementielle de Node.js ?"
    };
    
    return {
      question: questions[matiere.toUpperCase()] || "Décrivez un concept important que vous avez appris récemment.",
      context: `Question générée pour la matière ${matiere}`,
      difficulty: "medium"
    };
  }

  // ============================================================================
  // 🏆 CHALLENGES
  // ============================================================================

  /**
   * Récupérer le challenge du jour
   */
  async getTodayChallenge() {
    await this.simulateNetworkDelay();
    return { challenge: STATIC_CHALLENGES.today };
  }

  /**
   * Récupérer la liste des challenges
   */
  async getChallenges(matiere = null) {
    await this.simulateNetworkDelay();
    
    let challenges = STATIC_CHALLENGES.list;
    if (matiere) {
      challenges = challenges.filter(c => c.matiere === matiere.toUpperCase());
    }
    
    return { challenges };
  }

  /**
   * Créer un nouveau challenge
   */
  async createChallenge(challengeData) {
    await this.simulateNetworkDelay(800);
    
    const newChallenge = {
      id: Date.now(),
      title: challengeData.title,
      description: challengeData.description,
      matiere: challengeData.matiere.toUpperCase(),
      difficulty: challengeData.difficulty || "medium",
      points: challengeData.points || 50,
      created_at: new Date().toISOString()
    };
    
    STATIC_CHALLENGES.list.push(newChallenge);
    
    return { challenge: newChallenge };
  }

  /**
   * Soumettre une réponse au challenge
   */
  async submitChallengeResponse(challengeId, response) {
    await this.simulateNetworkDelay(1200);
    
    // Simulation d'évaluation
    const score = Math.floor(Math.random() * 100) + 1;
    const feedback = score > 70 ? "Excellente réponse !" : score > 40 ? "Bonne tentative, quelques améliorations possibles." : "Continuez vos efforts !";
    
    return {
      score,
      feedback,
      points_earned: Math.floor(score * 0.5),
      rank: Math.floor(Math.random() * 10) + 1
    };
  }

  // ============================================================================
  // 👤 UTILISATEURS (simulation basique)
  // ============================================================================

  /**
   * Statistiques utilisateur
   */
  async getUserStats(userId) {
    await this.simulateNetworkDelay();
    
    return {
      stats: {
        totalChallenges: Math.floor(Math.random() * 20) + 5,
        completedChallenges: Math.floor(Math.random() * 15) + 3,
        streak: Math.floor(Math.random() * 10) + 1,
        totalPoints: Math.floor(Math.random() * 1000) + 200,
        averageScore: Math.floor(Math.random() * 40) + 60
      }
    };
  }
}

// Export du hook pour utiliser le service
export function useRhinoAPI(userId) {
  return new RhinoAPIService(userId);
} 