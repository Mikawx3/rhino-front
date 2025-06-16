"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Trash2, Calendar, Clock, AlertCircle, Loader2, MessageSquare, Trophy, Flame, UserPlus, UserMinus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRhinoAPI } from "@/lib/api-service";

export default function DashboardPage() {
  const { 
    user, 
    loading: authLoading, 
    subscriptions, 
    subscriptionsLoading,
    subscribeToSubject,
    unsubscribeFromSubject,
    filterSubjectsBySubscriptions 
  } = useAuth();
  const apiService = useRhinoAPI(user?.id);
  const [matieres, setMatieres] = useState([]);
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [newMatiere, setNewMatiere] = useState({
    name: "",
    description: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localSubscriptions, setLocalSubscriptions] = useState([]); // État local pour les abonnements
  const [error, setError] = useState(null);

  // Charger les données au montage
  useEffect(() => {
    if (user && apiService) {
      loadDashboardData();
      
    }
    console.log('🔍 Dashboard chargé pour user:', user?.i);
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les matières et le challenge - les abonnements sont gérés dans le contexte Auth
      const [matieresResponse, challengeResponse] = await Promise.allSettled([
        apiService.getMatieres(),
        apiService.getTodayChallenge()
      ]);

      // Traiter les matières
      if (matieresResponse.status === 'fulfilled') {
        const matieresData = matieresResponse.value.matieres || [];
        
        // Si on a des matières, charger les détails de chaque matière
        if (matieresData.length > 0) {
          const detailedMatieres = await Promise.allSettled(
            matieresData.map(async (matiere) => {
              try {
                const details = await apiService.getMatiereDetails(matiere.name || matiere);
                return details.matiere || { 
                  name: matiere.name || matiere, 
                  description: matiere.description || 'Aucune description',
                  document_count: 0,
                  last_updated: null
                };
              } catch (err) {
                console.error(`Failed to load details for ${matiere.name || matiere}:`, err);
                // Retourner une structure basique si le détail échoue
                return { 
                  name: matiere.name || matiere, 
                  description: matiere.description || 'Aucune description',
                  document_count: 0,
                  last_updated: null
                };
              }
            })
          );
          
          // Extraire les matières avec succès
          const validMatieres = detailedMatieres
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);
            
          // Dans le dashboard, afficher TOUTES les matières disponibles
          // pour que les utilisateurs puissent découvrir et s'abonner
          console.log('📚 Toutes les matières disponibles dans le dashboard:', validMatieres);
          setMatieres(validMatieres);
        } else {
          setMatieres([]);
        }
      } else {
        console.error('Failed to load subjects:', matieresResponse.reason);
        setMatieres([]);
      }

      // Traiter le challenge du jour
      if (challengeResponse.status === 'fulfilled') {
        setTodayChallenge(challengeResponse.value.challenge || null);
      } else {
        console.error('Failed to load challenge:', challengeResponse.reason);
      }

    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatiere = async () => {
    if (!newMatiere.name || !newMatiere.description) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setError(null);
      await apiService.createMatiere({
        name: newMatiere.name.toUpperCase(),
        description: newMatiere.description
      });

      // Recharger toutes les données du dashboard
      await loadDashboardData();
      
      // Réinitialiser le formulaire
      setNewMatiere({ name: "", description: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to create subject:', err);
      setError('Erreur lors de la création de la matière');
    }
  };

  const handleRemoveMatiere = async (matiereName) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la matière "${matiereName}" ?`)) {
      return;
    }

    try {
      setError(null);
      await apiService.deleteMatiere(matiereName);
      
      // Retirer de la liste locale
      setMatieres(matieres.filter(m => m.name !== matiereName));
    } catch (err) {
      console.error('Failed to delete subject:', err);
      setError('Erreur lors de la suppression de la matière');
    }
  };

  const handleSubscribeToMatiere = async (matiereName) => {
    try {
      setError(null);
      await subscribeToSubject(matiereName);
    } catch (err) {
      setError(`Erreur lors de l'abonnement à ${matiereName}`);
    }
  };

  const handleUnsubscribeFromMatiere = async (matiereName) => {
    try {
      setError(null);
      await unsubscribeFromSubject(matiereName);
    } catch (err) {
      setError(`Erreur lors du désabonnement de ${matiereName}`);
    }
  };

  const getSubjectColor = (subject) => {
    // Vérifier que subject existe et est une string
    if (!subject || typeof subject !== 'string') {
      return "bg-gray-100 text-gray-800";
    }
    
    const colors = {
      "JAVASCRIPT": "bg-yellow-100 text-yellow-800",
      "PYTHON": "bg-blue-100 text-blue-800",
      "REACT": "bg-cyan-100 text-cyan-800",
      "VUE": "bg-green-100 text-green-800",
      "NODEJS": "bg-emerald-100 text-emerald-800",
      "MATHEMATIQUES": "bg-purple-100 text-purple-800",
      "INFORMATIQUE": "bg-indigo-100 text-indigo-800",
      "PHYSIQUE": "bg-red-100 text-red-800"
    };
    return colors[subject.toUpperCase()] || "bg-gray-100 text-gray-800";
  };

  const canManageSubjects = user?.role === 'teacher' || user?.role === 'admin';

  // Loading states
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement du tableau de bord...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
          <p className="text-gray-600 mb-4">
            Veuillez vous connecter pour accéder au tableau de bord
          </p>
          <Button asChild>
            <a href="/login">Se connecter</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User info */}
      <div className="mb-4 text-right text-sm text-gray-700">
        Connecté en tant que <span className="font-semibold">{user.username}</span>
        <Badge variant="outline" className="ml-2">{user.role}</Badge>
        {user.isCasUser && (
          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
            🎓 CAS
          </Badge>
        )}
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Gérez vos abonnements aux cours et suivez votre progression</p>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poser une question</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">💬</div>
            <p className="text-xs text-muted-foreground mb-4">
              Utilisez le système RAG pour poser des questions sur vos cours
            </p>
            <Button asChild size="sm" className="w-full">
              <a href="/questions">Poser une question</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Challenges</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">🏆</div>
            <p className="text-xs text-muted-foreground mb-4">
              Participez aux défis quotidiens et testez vos connaissances
            </p>
            <Button asChild size="sm" className="w-full">
              <a href="/challenges">Voir les challenges</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours actifs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matieres.length}</div>
            <p className="text-xs text-muted-foreground">
              matières disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Challenge du jour */}
      {todayChallenge && (
        <Card className="mb-8 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flame className="h-5 w-5 mr-2 text-orange-500" />
              Challenge du jour
            </CardTitle>
            <CardDescription>
              {todayChallenge.matiere}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4 line-clamp-2">
              {todayChallenge.description || todayChallenge.question}
            </p>
            <Button asChild>
              <a href="/challenges">Participer au challenge</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview - now hidden since we don't have stats yet */}
      
      {/* Subjects grid */}
      <div className="grid gap-6 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Matières disponibles</h2>
          {canManageSubjects && (
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une matière
            </Button>
          )}
        </div>

        {/* Add new subject form */}
        {canManageSubjects && showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle matière</CardTitle>
              <CardDescription>Ajoutez une nouvelle matière au système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom de la matière</label>
                  <Input
                    placeholder="Ex: JAVASCRIPT, PYTHON..."
                    value={newMatiere.name}
                    onChange={(e) => setNewMatiere(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    placeholder="Description de la matière"
                    value={newMatiere.description}
                    onChange={(e) => setNewMatiere(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddMatiere}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer la matière
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subjects list */}
        {matieres.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune matière disponible
              </h3>
              <p className="text-gray-600 mb-4">
                {canManageSubjects 
                  ? "Commencez par créer votre première matière"
                  : "Aucune matière n'a encore été créée"
                }
              </p>
              {canManageSubjects && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer la première matière
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matieres.map((matiere) => (
              <Card key={matiere.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Badge className={getSubjectColor(matiere.name)} variant="secondary">
                        {matiere.name}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {/* Boutons d'abonnement pour tous les utilisateurs */}
                      {subscriptions.includes(matiere.name) ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUnsubscribeFromMatiere(matiere.name)}
                          className="text-green-600 hover:text-green-700"
                          title="Se désabonner"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSubscribeToMatiere(matiere.name)}
                          className="text-blue-600 hover:text-blue-700"
                          title="S'abonner"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Bouton de suppression seulement pour les enseignants/admins */}
                      {canManageSubjects && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveMatiere(matiere.name)}
                          className="text-red-500 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription>{matiere.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {matiere.document_count || 0} documents
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Dernière MAJ: {matiere.last_updated ? new Date(matiere.last_updated).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {user?.role !== 'student' && (
                      <Button asChild size="sm" className="w-full">
                        <a href={`/matieres/${matiere.name}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Voir les documents
                        </a>
                      </Button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild size="sm" variant="outline">
                        <a href={`/questions?matiere=${matiere.name}`}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Questions
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <a href={`/challenges?matiere=${matiere.name}`}>
                          <Trophy className="h-4 w-4 mr-1" />
                          Challenges
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 