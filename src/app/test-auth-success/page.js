"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, User, Crown, GraduationCap, ArrowRight, Home, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function TestAuthSuccessPage() {
  const { user, loading } = useAuth();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Animation confetti
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return GraduationCap;
      case 'teacher':
        return User;
      case 'admin':
        return Crown;
      default:
        return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student':
        return "bg-blue-100 text-blue-800";
      case 'teacher':
        return "bg-green-100 text-green-800";
      case 'admin':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWelcomeMessage = (role, username) => {
    switch (role) {
      case 'student':
        return `Bonjour ${username} ! Vous êtes maintenant connecté en tant qu'étudiant. Accédez à vos cours et challenges.`;
      case 'teacher':
        return `Bienvenue ${username} ! En tant qu'enseignant, vous pouvez créer des matières et gérer les contenus.`;
      case 'admin':
        return `Salut ${username} ! Vous avez un accès administrateur complet à la plateforme Rhino.`;
      default:
        return `Bienvenue ${username} !`;
    }
  };

  const getAvailableFeatures = (role) => {
    switch (role) {
      case 'student':
        return [
          "📚 Accéder aux cours et matières",
          "🏆 Participer aux challenges quotidiens",
          "🤖 Poser des questions au système IA",
          "📊 Consulter vos statistiques",
          "🎯 Suivre votre progression"
        ];
      case 'teacher':
        return [
          "➕ Créer et gérer des matières",
          "📄 Uploader des documents de cours",
          "🏆 Créer des challenges pour les étudiants",
          "❓ Générer des questions de réflexion",
          "📊 Consulter les statistiques des étudiants",
          "🏅 Calculer les classements"
        ];
      case 'admin':
        return [
          "👥 Gestion complète des utilisateurs",
          "⚙️ Administration de la plateforme",
          "📚 Gestion avancée des matières",
          "📊 Analytics et rapports système",
          "🔧 Configuration des paramètres",
          "🔐 Gestion des permissions"
        ];
      default:
        return ["🚀 Explorez la plateforme"];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Vérification de la connexion...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Aucune session active détectée.</p>
            <Button asChild>
              <a href="/test-profiles">Retour aux profils de test</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-4xl">
        {/* Titre de succès */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Connexion Réussie !</h1>
          </div>
          <p className="text-xl text-gray-600">
            Simulation de connexion effectuée avec succès
          </p>
        </div>

        {/* Informations du profil connecté */}
        <Card className="mb-8 border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <RoleIcon className="h-8 w-8 text-gray-700" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.username}</CardTitle>
                  <Badge className={getRoleColor(user.role)} variant="secondary">
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>ID: {user.id}</p>
                <p>{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <CardDescription className="text-lg mb-4">
              {getWelcomeMessage(user.role, user.username)}
            </CardDescription>
            
            {/* Abonnements */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Abonnements aux matières :</h3>
              <div className="flex flex-wrap gap-2">
                {user.subscriptions.map((sub, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {sub === "*" ? "ACCÈS COMPLET" : sub}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fonctionnalités disponibles */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Fonctionnalités Disponibles
            </CardTitle>
            <CardDescription>
              Voici ce que vous pouvez faire avec ce profil :
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {getAvailableFeatures(user.role).map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions disponibles */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button asChild size="lg" className="h-16">
            <a href="/dashboard" className="flex items-center justify-center space-x-2">
              <Home className="h-5 w-5" />
              <span>Aller au Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="h-16">
            <a href="/test-profiles" className="flex items-center justify-center space-x-2">
              <User className="h-5 w-5" />
              <span>Changer de Profil</span>
            </a>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-16">
            <a href="/profile" className="flex items-center justify-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Mon Profil</span>
            </a>
          </Button>
        </div>

        {/* Informations de test */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">🧪 Mode Test Actif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 text-sm">
              Vous utilisez actuellement des données simulées. Toutes les interactions 
              sont stockées localement et ne persistent pas entre les sessions. 
              Les délais réseau sont simulés pour une expérience réaliste.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 