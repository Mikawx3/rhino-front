"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Plus, 
  Users,
  Target,
  Send,
  Star,
  Award,
  AlertCircle, 
  Loader2,
  BookOpen,
  Flame,
  UserPlus,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRhinoAPI } from "@/lib/api-service";

export default function ChallengesPage() {
  const { 
    user, 
    loading: authLoading, 
    subscriptions, 
    subscriptionsLoading,
    filterSubjectsBySubscriptions 
  } = useAuth();
  const apiService = useRhinoAPI(user?.id);
  
  const [matieres, setMatieres] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [selectedMatiere, setSelectedMatiere] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Création de challenge
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    matiere: "",
    question: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  
  // Réponse à un challenge
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeResponse, setChallengeResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  // États pour les popups de confirmation
  const [showCreateSuccess, setShowCreateSuccess] = useState(false);
  const [createdChallengeName, setCreatedChallengeName] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    // Vérifier que l'utilisateur et le service API sont correctement initialisés
    if (!user?.id || !apiService) {
      console.warn('User or API service not ready, skipping data load');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Chargement des données challenges pour user_id: ${user.id}`); // Debug
      
      const [matieresResponse, challengesResponse, todayResponse] = await Promise.allSettled([
        apiService.getMatieres(),
        apiService.getChallenges(),
        apiService.getTodayChallenge()
      ]);

      if (matieresResponse.status === 'fulfilled') {
        const allMatieres = matieresResponse.value.matieres || [];
        console.log('📚 Toutes les matières reçues:', allMatieres);
        
        // Filtrer les matières selon les abonnements de l'utilisateur via le contexte
        const filteredMatieres = filterSubjectsBySubscriptions(allMatieres);
        console.log('📚 Matières filtrées selon abonnements:', filteredMatieres);
        setMatieres(filteredMatieres);
      } else {
        console.warn('Failed to load subjects:', matieresResponse.reason);
        setMatieres([]);
      }

      if (challengesResponse.status === 'fulfilled') {
        const allChallengesData = challengesResponse.value.challenges || [];
        console.log('🎯 Tous les challenges reçus:', allChallengesData);
        
        // Stocker tous les challenges - le filtrage sera fait par la logique réactive
        setChallenges(allChallengesData);
      } else {
        console.warn('Failed to load challenges:', challengesResponse.reason);
        setChallenges([]);
      }

      if (todayResponse.status === 'fulfilled') {
        const todayData = todayResponse.value.challenge || null;
        console.log('📅 Challenge du jour reçu:', todayData);
        setTodayChallenge(todayData);
      } else {
        console.warn('Failed to load today challenge:', todayResponse.reason);
        setTodayChallenge(null);
      }
      
    } catch (err) {
      console.error('Failed to load challenges data:', err);
      setMatieres([]);
      setChallenges([]);
      setTodayChallenge(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    if (!newChallenge.matiere || !newChallenge.question.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      await apiService.createChallenge(newChallenge);
      
      const response = await apiService.getChallenges();
      setChallenges(response.challenges || []);
      
      // Afficher la popup de succès
      setCreatedChallengeName(`Challenge ${newChallenge.matiere}`);
      setShowCreateSuccess(true);
      
      setNewChallenge({ matiere: "", question: "" });
      setShowCreateForm(false);
      
    } catch (err) {
      console.error('Failed to create challenge:', err);
      setError('Erreur lors de la création du challenge');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitResponse = async (challenge = selectedChallenge) => {
    if (!challenge || !challengeResponse.trim()) {
      setError('Veuillez rédiger une réponse');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const result = await apiService.evaluateResponse(
        challenge.matiere, 
        challenge.question,
        challengeResponse
      );
      
      setSubmissionResult(result);
      setChallengeResponse("");
      
    } catch (err) {
      console.error('Failed to submit response:', err);
      setError('Erreur lors de la soumission de la réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCreateChallenges = user?.role === 'teacher' || user?.role === 'admin';
  
  // Filtrer d'abord les challenges selon les abonnements de l'utilisateur
  const challengesFilteredBySubscriptions = challenges.filter(challenge => {
    // Si admin, accès à tout
    if (user?.role === 'admin' || subscriptions.includes('*')) {
      return true;
    }
    
    // Vérifier si l'utilisateur est abonné à la matière du challenge
    return subscriptions.includes(challenge.matiere);
  });
  
  // Puis filtrer par matière sélectionnée
  const filteredChallenges = selectedMatiere && selectedMatiere !== "ALL"
    ? challengesFilteredBySubscriptions.filter(c => c.matiere === selectedMatiere)
    : challengesFilteredBySubscriptions;

  const loadChallengesForMatiere = async (matiere) => {
    try {
      setLoading(true);
      console.log(`🔍 Chargement challenges pour matière: ${matiere === "ALL" ? "toutes" : matiere}`);
      
      // Charger tous les challenges - le filtrage par abonnements sera fait par la logique réactive
      const response = await apiService.getChallenges();
      const allChallenges = response.challenges || [];
      
      console.log('🎯 Challenges reçus:', allChallenges);
      setChallenges(allChallenges);
      
    } catch (err) {
      console.error('Failed to load challenges for matiere:', err);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMatiereChange = async (newMatiere) => {
    setSelectedMatiere(newMatiere);
    await loadChallengesForMatiere(newMatiere);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement des challenges...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
          <p className="text-gray-600 mb-4">
            Veuillez vous connecter pour participer aux challenges
          </p>
          <Button asChild>
            <a href="/login">Se connecter</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          
          Challenges
        </h1>
        <p className="text-gray-600">
          Participez aux défis quotidiens et testez vos connaissances
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
            <span className="text-blue-700">Chargement des challenges...</span>
          </div>
        </div>
      )}

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today" className="flex items-center">
            <Flame className="h-4 w-4 mr-2" />
            Challenge du jour
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Tous les challenges
          </TabsTrigger>
          {canCreateChallenges && (
            <TabsTrigger value="create" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Créer un challenge
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="today">
          {todayChallenge && (
            // Vérifier si l'utilisateur est abonné à la matière du challenge du jour
            user?.role === 'admin' || 
            subscriptions.includes('*') || 
            subscriptions.includes(todayChallenge.matiere)
          ) ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Flame className="h-6 w-6 mr-2 text-orange-500" />
                    Challenge du jour
                  </CardTitle>
                  <Badge className={getDifficultyColor(todayChallenge.difficulty)}>
                    {todayChallenge.difficulty || 'Medium'}
                  </Badge>
                </div>
                <CardDescription className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {todayChallenge.matiere}
                  </span>
                  {todayChallenge.points && (
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {todayChallenge.points} points
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Question :</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {todayChallenge.description || todayChallenge.question}
                    </p>
                  </div>
                  
                  {todayChallenge.submissions !== undefined && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {todayChallenge.submissions} participants
                      </span>
                      {todayChallenge.completion_rate && (
                        <span>
                          Taux de réussite : {Math.round(todayChallenge.completion_rate * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Votre réponse au challenge..."
                      value={challengeResponse}
                      onChange={(e) => setChallengeResponse(e.target.value)}
                      rows={6}
                    />
                    
                    <Button
                      onClick={() => {
                        handleSubmitResponse(todayChallenge);
                      }}
                      disabled={!challengeResponse.trim() || isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Soumission en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Soumettre ma réponse
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {submissionResult && (
                    <div className="relative overflow-hidden p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
                      {/* Decorative background */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
                      
                      <div className="relative">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 animate-pulse">
                            <Award className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-green-900 mb-1">
                              Réponse soumise avec succès !
                            </h4>
                            <p className="text-green-700 text-sm">
                              Voici votre évaluation détaillée
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {submissionResult.score !== undefined && (
                            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-200/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-800">Score obtenu</span>
                                <Star className="h-4 w-4 text-yellow-500" />
                              </div>
                              <div className="flex items-baseline">
                                <span className="text-3xl font-bold text-green-900">{submissionResult.score}</span>
                                <span className="text-lg text-green-700 ml-1">/100</span>
                              </div>
                              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${submissionResult.score}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          {submissionResult.points_earned !== undefined && (
                            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-200/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-800">Points gagnés</span>
                                <Trophy className="h-4 w-4 text-yellow-500" />
                              </div>
                              <div className="flex items-baseline">
                                <span className="text-3xl font-bold text-green-900">+{submissionResult.points_earned}</span>
                                <span className="text-sm text-green-700 ml-1">pts</span>
                              </div>
                            </div>
                          )}
                          
                          {submissionResult.rank !== undefined && (
                            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-200/50 md:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-800">Votre classement</span>
                                <Award className="h-4 w-4 text-yellow-500" />
                              </div>
                              <div className="flex items-center">
                                <span className="text-2xl font-bold text-green-900">#{submissionResult.rank}</span>
                                <span className="text-sm text-green-700 ml-2">position</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {submissionResult.feedback && (
                          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-200/50">
                            <div className="flex items-center mb-3">
                              <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
                              <span className="font-medium text-green-800">Feedback de l'IA</span>
                            </div>
                            <p className="text-green-700 leading-relaxed whitespace-pre-wrap">
                              {submissionResult.feedback}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-center mt-6">
                          <Button 
                            onClick={() => setSubmissionResult(null)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Continuer
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Flame className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {todayChallenge ? 
                    "Challenge non accessible" : 
                    "Aucun challenge pour vous aujourd'hui"
                  }
                </h3>
                <p className="text-gray-600">
                  {todayChallenge ? 
                    `Le challenge du jour concerne ${todayChallenge.matiere}, mais vous n'êtes pas abonné à cette matière.` :
                    "Les challenges seront disponibles une fois que des défis seront créés. Revenez bientôt !"
                  }
                </p>
                {todayChallenge && (
                  <Button asChild className="mt-4">
                    <a href="/dashboard">
                      <UserPlus className="h-4 w-4 mr-2" />
                      S'abonner à {todayChallenge.matiere}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-6">
            {matieres.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Filtrer les challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedMatiere} onValueChange={handleMatiereChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les matières" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Toutes les matières</SelectItem>
                      {matieres
                        .filter(matiere => {
                          if (!matiere) return false;
                          const matiereId = matiere.name || matiere;
                          return matiereId && typeof matiereId === 'string' && matiereId.trim() !== '';
                        })
                        .map((matiere) => {
                          const matiereId = matiere.name || matiere;
                          const matiereDesc = matiere.description || '';
                          
                          return (
                            <SelectItem key={matiereId} value={matiereId}>
                              {matiereId}{matiereDesc ? ` - ${matiereDesc}` : ''}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {matieres.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    {subscriptions.length === 0 && user?.role !== 'admin' ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Aucun abonnement trouvé
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Vous devez vous abonner à des matières pour voir les challenges correspondants
                        </p>
                        <Button asChild>
                          <a href="/dashboard">
                            <UserPlus className="h-4 w-4 mr-2" />
                            S'abonner à des cours
                          </a>
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Aucune matière disponible
                        </h3>
                        <p className="text-gray-600">
                          Aucune matière n'a encore été créée dans le système
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : filteredChallenges.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun challenge disponible pour vous
                    </h3>
                    <p className="text-gray-600">
                      {selectedMatiere && selectedMatiere !== "ALL"
                        ? `Aucun challenge disponible pour ${selectedMatiere} pour le moment`
                        : 'Les challenges seront disponibles une fois créés par les enseignants'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredChallenges.map((challenge) => (
                  <Card key={challenge.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {challenge.title || `Challenge ${challenge.matiere}`}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty || 'Medium'}
                          </Badge>
                          <Badge variant="outline">
                            {challenge.matiere}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="flex items-center space-x-4">
                        {challenge.points && (
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {challenge.points} points
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap mb-4">
                        {challenge.description || challenge.question}
                      </p>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedChallenge(challenge);
                          setChallengeResponse("");
                          setSubmissionResult(null);
                        }}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Participer à ce challenge
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {canCreateChallenges && (
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Créer un nouveau challenge
                </CardTitle>
                <CardDescription>
                  Créez un défi pour les étudiants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matieres.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    {subscriptions.length === 0 && user?.role !== 'admin' ? (
                      <>
                        <p className="font-medium text-gray-700">Aucun abonnement trouvé</p>
                        <p className="text-sm mt-2">Vous devez vous abonner à des matières pour créer des challenges</p>
                        <Button asChild className="mt-4" size="sm">
                          <a href="/dashboard">
                            <UserPlus className="h-4 w-4 mr-2" />
                            S'abonner à des cours
                          </a>
                        </Button>
                      </>
                    ) : (
                      <>
                        <p>Aucune matière disponible pour créer un challenge</p>
                        <p className="text-sm mt-2">Créez d'abord des matières dans le tableau de bord</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Matière
                      </label>
                      <Select 
                        value={newChallenge.matiere} 
                        onValueChange={(value) => setNewChallenge(prev => ({ ...prev, matiere: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une matière" />
                        </SelectTrigger>
                        <SelectContent>
                          {matieres
                            .filter(matiere => {
                              if (!matiere) return false;
                              const matiereId = matiere.name || matiere;
                              return matiereId && typeof matiereId === 'string' && matiereId.trim() !== '';
                            })
                            .map((matiere) => {
                              const matiereId = matiere.name || matiere;
                              const matiereDesc = matiere.description || '';
                              
                              return (
                                <SelectItem key={matiereId} value={matiereId}>
                                  {matiereId}{matiereDesc ? ` - ${matiereDesc}` : ''}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Question du challenge
                      </label>
                      <Textarea
                        placeholder="Rédigez la question ou le défi..."
                        value={newChallenge.question}
                        onChange={(e) => setNewChallenge(prev => ({ ...prev, question: e.target.value }))}
                        rows={6}
                      />
                    </div>
                    
                    <Button
                      onClick={handleCreateChallenge}
                      disabled={!newChallenge.matiere || !newChallenge.question.trim() || isCreating}
                      className="w-full"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Création en cours...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Créer le challenge
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {selectedChallenge && selectedChallenge !== todayChallenge && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedChallenge(null);
              setChallengeResponse("");
              setSubmissionResult(null);
            }
          }}
        >
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedChallenge.title || `Challenge ${selectedChallenge.matiere}`}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedChallenge(null);
                    setChallengeResponse("");
                    setSubmissionResult(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Rédigez votre réponse à ce challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">
                    {selectedChallenge.description || selectedChallenge.question}
                  </p>
                </div>
                
                <Textarea
                  placeholder="Votre réponse..."
                  value={challengeResponse}
                  onChange={(e) => setChallengeResponse(e.target.value)}
                  rows={8}
                />
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleSubmitResponse(selectedChallenge)}
                    disabled={!challengeResponse.trim() || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Soumission...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Soumettre
                      </>
                    )}
                  </Button>
                </div>
                
                {submissionResult && (
                  <div className="relative overflow-hidden p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100 rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
                    
                    <div className="relative">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 animate-pulse">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-green-900 mb-1">
                            Réponse soumise avec succès !
                          </h4>
                          <p className="text-green-700 text-sm">
                            Voici votre évaluation détaillée
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {submissionResult.score !== undefined && (
                          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-200/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-800">Score obtenu</span>
                              <Star className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold text-green-900">{submissionResult.score}</span>
                              <span className="text-lg text-green-700 ml-1">/100</span>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${submissionResult.score}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {submissionResult.points_earned !== undefined && (
                          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-200/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-800">Points gagnés</span>
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold text-green-900">+{submissionResult.points_earned}</span>
                              <span className="text-sm text-green-700 ml-1">pts</span>
                            </div>
                          </div>
                        )}
                        
                        {submissionResult.rank !== undefined && (
                          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-200/50 md:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-800">Votre classement</span>
                              <Award className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div className="flex items-center">
                              <span className="text-2xl font-bold text-green-900">#{submissionResult.rank}</span>
                              <span className="text-sm text-green-700 ml-2">position</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {submissionResult.feedback && (
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-200/50">
                          <div className="flex items-center mb-3">
                            <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
                            <span className="font-medium text-green-800">Feedback de l'IA</span>
                          </div>
                          <p className="text-green-700 leading-relaxed whitespace-pre-wrap">
                            {submissionResult.feedback}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-center mt-6">
                        <Button 
                          onClick={() => setSubmissionResult(null)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Continuer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showCreateSuccess && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateSuccess(false);
              setCreatedChallengeName("");
            }
          }}
        >
          <Card className="w-full max-w-md transform animate-in zoom-in-95 duration-300 shadow-xl border-2">
            <CardContent className="p-6">
              <div className="text-center">
                {/* Animated success icon */}
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                
                {/* Success message */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🎉 Challenge créé !
                </h3>
                <p className="text-gray-600 mb-6">
                  <span className="font-medium text-green-600">{createdChallengeName}</span> a été créé avec succès et est maintenant disponible pour tous les étudiants !
                </p>
                
                {/* Action buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setShowCreateSuccess(false);
                      setCreatedChallengeName("");
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Parfait !
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateSuccess(false);
                      setCreatedChallengeName("");
                      setShowCreateForm(true);
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un autre challenge
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 