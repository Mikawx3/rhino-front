"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Trash2, Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRhinoAPI } from "@/lib/api-service";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const apiService = useRhinoAPI(user?.id);
  const [matieres, setMatieres] = useState([]);
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [newMatiere, setNewMatiere] = useState({
    name: "",
    description: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données au montage
  useEffect(() => {
    if (user && apiService) {
      loadDashboardData();
    }
  }, [user, apiService]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les matières et le challenge en parallèle
      const [matieresResponse, challengeResponse] = await Promise.allSettled([
        apiService.getMatieres(),
        apiService.getTodayChallenge()
      ]);

      // Traiter les matières
      if (matieresResponse.status === 'fulfilled') {
        setMatieres(matieresResponse.value.matieres || []);
      } else {
        console.error('Failed to load subjects:', matieresResponse.reason);
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

      // Recharger les matières
      const response = await apiService.getMatieres();
      setMatieres(response.matieres || []);
      
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

  const getSubjectColor = (subject) => {
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

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Challenge du jour</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayChallenge ? "✅" : "❌"}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayChallenge ? "Disponible" : "Aucun challenge"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Votre rôle</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.role}</div>
            <p className="text-xs text-muted-foreground">
              niveau d'accès
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Challenge du jour */}
      {todayChallenge && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🏆 Challenge du jour</CardTitle>
            <CardDescription>
              Matière: {todayChallenge.matiere} • {todayChallenge.date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{todayChallenge.question}</p>
            <Button>Répondre au challenge</Button>
          </CardContent>
        </Card>
      )}

      {/* Add Course Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Matières Disponibles
            {canManageSubjects && (
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une matière
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        {showAddForm && canManageSubjects && (
          <CardContent className="border-t">
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nom de la matière</label>
                <Input
                  placeholder="ex: JAVASCRIPT, PYTHON..."
                  value={newMatiere.name}
                  onChange={(e) => setNewMatiere({...newMatiere, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  placeholder="ex: Cours de JavaScript moderne"
                  value={newMatiere.description}
                  onChange={(e) => setNewMatiere({...newMatiere, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddMatiere}>Ajouter</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Courses List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matieres.map((matiere) => (
          <Card key={matiere.name} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className={getSubjectColor(matiere.name)}>
                    {matiere.name}
                  </Badge>
                  <CardTitle className="mt-2 text-lg">{matiere.description || matiere.name}</CardTitle>
                </div>
                {canManageSubjects && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMatiere(matiere.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="flex items-center text-sm">
                <BookOpen className="h-4 w-4 mr-1" />
                {matiere.document_count || 0} documents
              </CardDescription>
              {matiere.last_update && (
                <p className="text-xs text-gray-500 mt-1">
                  Mis à jour: {new Date(matiere.last_update).toLocaleDateString('fr-FR')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {matieres.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune matière disponible
          </h3>
          <p className="text-gray-500 mb-4">
            {canManageSubjects 
              ? "Commencez par créer votre première matière" 
              : "Aucune matière n'a encore été créée"}
          </p>
          {canManageSubjects && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une matière
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 