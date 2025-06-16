"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Lightbulb, 
  Send, 
  AlertCircle, 
  Loader2,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserPlus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRhinoAPI } from "@/lib/api-service";

export default function QuestionsPage() {
  const { 
    user, 
    loading: authLoading, 
    subscriptions, 
    subscriptionsLoading,
    filterSubjectsBySubscriptions 
  } = useAuth();
  const apiService = useRhinoAPI(user?.id);
  
  const [matieres, setMatieres] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Questions & Réponses
  const [questionQuery, setQuestionQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [questionResponse, setQuestionResponse] = useState(null);
  
  // Questions de réflexion
  const [conceptCle, setConceptCle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reflectionQuestion, setReflectionQuestion] = useState(null);
  
  // Historique
  const [questionHistory, setQuestionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user && apiService) {
      loadMatieres();
    }
  }, [user?.id]);

  const loadMatieres = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger seulement les matières - les abonnements sont gérés dans le contexte Auth
      const response = await apiService.getMatieres();
      const allMatieres = response.matieres || [];
      
      // Filtrer les matières selon les abonnements de l'utilisateur via le contexte
      const filteredMatieres = filterSubjectsBySubscriptions(allMatieres);
      setMatieres(filteredMatieres);
      
    } catch (err) {
      console.error('Failed to load matieres:', err);
      setMatieres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!questionQuery.trim() || !selectedMatiere) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsAsking(true);
      setError(null);
      
      const response = await apiService.askQuestion(questionQuery, selectedMatiere);
      setQuestionResponse(response);
      
      // Ajouter à l'historique
      const historyItem = {
        id: Date.now(),
        type: 'question',
        matiere: selectedMatiere,
        query: questionQuery,
        response: response,
        timestamp: new Date().toISOString()
      };
      setQuestionHistory(prev => [historyItem, ...prev]);
      
      // Réinitialiser le formulaire
      setQuestionQuery("");
      
    } catch (err) {
      console.error('Failed to ask question:', err);
      setError('Erreur lors de la pose de la question');
    } finally {
      setIsAsking(false);
    }
  };

  const handleGenerateReflection = async () => {
    if (!selectedMatiere) {
      setError('Veuillez sélectionner une matière');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await apiService.generateReflectionQuestion(selectedMatiere, conceptCle);
      setReflectionQuestion(response);
      
      // Ajouter à l'historique
      const historyItem = {
        id: Date.now(),
        type: 'reflection',
        matiere: selectedMatiere,
        conceptCle: conceptCle,
        response: response,
        timestamp: new Date().toISOString()
      };
      setQuestionHistory(prev => [historyItem, ...prev]);
      
      // Réinitialiser le formulaire
      setConceptCle("");
      
    } catch (err) {
      console.error('Failed to generate reflection:', err);
      setError('Erreur lors de la génération de la question');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading states
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement...</span>
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
            Veuillez vous connecter pour poser des questions
          </p>
          <Button asChild>
            <a href="/login">Se connecter</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Questions & Réflexions
        </h1>
        <p className="text-gray-600">
          Posez des questions sur vos cours ou générez des questions de réflexion
        </p>
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

      {/* Matière selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Sélectionner une matière
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement des matières...</span>
            </div>
          ) : matieres.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              {subscriptions.length === 0 && user?.role !== 'admin' ? (
                <>
                  <p className="font-medium text-gray-700">Aucun abonnement trouvé</p>
                  <p className="text-sm mt-2">Vous devez vous abonner à des matières pour poser des questions</p>
                  <Button asChild className="mt-4" size="sm">
                    <a href="/dashboard">
                      <UserPlus className="h-4 w-4 mr-2" />
                      S'abonner à des cours
                    </a>
                  </Button>
                </>
              ) : (
                <>
                  <p>Aucune matière disponible pour le moment</p>
                  <p className="text-sm mt-2">Les matières seront disponibles une fois que des cours seront créés</p>
                </>
              )}
            </div>
          ) : (
            <Select value={selectedMatiere} onValueChange={setSelectedMatiere}>
              <SelectTrigger>
                <SelectValue placeholder="Choisissez une matière..." />
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
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Poser une question */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Poser une question
            </CardTitle>
            <CardDescription>
              Posez une question sur le contenu de vos cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Quelle est votre question ?"
                value={questionQuery}
                onChange={(e) => setQuestionQuery(e.target.value)}
                rows={4}
              />
              
              <Button 
                onClick={handleAskQuestion}
                disabled={!questionQuery.trim() || !selectedMatiere || isAsking || matieres.length === 0}
                className="w-full"
              >
                {isAsking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Poser la question
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Générer une question de réflexion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Question de réflexion
            </CardTitle>
            <CardDescription>
              Générez une question de réflexion sur un concept
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Concept clé (optionnel)"
                value={conceptCle}
                onChange={(e) => setConceptCle(e.target.value)}
              />
              
              <Button 
                onClick={handleGenerateReflection}
                disabled={!selectedMatiere || isGenerating || matieres.length === 0}
                className="w-full"
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer une question
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Réponses récentes */}
      {(questionResponse || reflectionQuestion) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dernière réponse</CardTitle>
          </CardHeader>
          <CardContent>
            {questionResponse && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Réponse à votre question :
                </h4>
                <p className="text-blue-800 whitespace-pre-wrap">
                  {questionResponse.response || questionResponse.answer}
                </p>
                {questionResponse.sources && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-blue-900">Sources :</p>
                    <ul className="text-sm text-blue-800">
                      {questionResponse.sources.map((source, index) => (
                        <li key={index}>• {source.document} (pertinence: {Math.round(source.relevance * 100)}%)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {reflectionQuestion && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Question de réflexion générée :
                </h4>
                <p className="text-green-800 whitespace-pre-wrap">
                  {reflectionQuestion.question}
                </p>
                {reflectionQuestion.context && (
                  <p className="text-sm text-green-700 mt-2">
                    Contexte : {reflectionQuestion.context}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historique */}
      {questionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowHistory(!showHistory)}
            >
              <span>Historique ({questionHistory.length})</span>
              {showHistory ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CardTitle>
          </CardHeader>
          
          {showHistory && (
            <CardContent>
              <div className="space-y-4">
                {questionHistory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {item.type === 'question' ? (
                          <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                        ) : (
                          <Lightbulb className="h-4 w-4 mr-2 text-green-500" />
                        )}
                        <span className="font-medium">{item.matiere}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    
                    {item.type === 'question' ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Question :</strong> {item.query}
                        </p>
                        <p className="text-sm">
                          <strong>Réponse :</strong> {item.response.response || item.response.answer}
                        </p>
                      </div>
                    ) : (
                      <div>
                        {item.conceptCle && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Concept :</strong> {item.conceptCle}
                          </p>
                        )}
                        <p className="text-sm">
                          <strong>Question générée :</strong> {item.response.question}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
} 