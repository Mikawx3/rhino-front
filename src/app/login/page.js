"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ExternalLink, User, Crown, GraduationCap, TestTube } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const { devLogin, loading } = useAuth();

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )user=([^;]*)/);
    if (match) setUsername(decodeURIComponent(match[1]));
  }, []);

  const testProfiles = [
    {
      id: 1,
      username: "student1",
      role: "student",
      icon: GraduationCap,
      color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      description: "Étudiant - Accès lecture"
    },
    {
      id: 3,
      username: "teacher1", 
      role: "teacher",
      icon: User,
      color: "bg-green-100 text-green-800 hover:bg-green-200",
      description: "Enseignant - Création de cours"
    },
    {
      id: 5,
      username: "admin1",
      role: "admin", 
      icon: Crown,
      color: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      description: "Admin - Accès complet"
    }
  ];

  const handleTestLogin = async (profileId) => {
    try {
      const success = await devLogin(profileId);
      if (success) {
        window.location.href = '/test-auth-success';
      }
    } catch (error) {
      console.error('Test login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Section de test temporaire - EN TÊTE */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center text-orange-800">
              <TestTube className="h-5 w-5 mr-2" />
              🧪 Mode Test - Connexion Rapide
            </CardTitle>
            <CardDescription className="text-orange-700">
              Testez l'application avec différents profils utilisateur (temporaire)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {testProfiles.map((profile) => {
                const Icon = profile.icon;
                return (
                  <Button
                    key={profile.id}
                    onClick={() => handleTestLogin(profile.id)}
                    disabled={loading}
                    variant="outline"
                    className={`p-4 h-auto flex-col space-y-2 ${profile.color} border-current`}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="text-center">
                      <div className="font-semibold">{profile.username}</div>
                      <div className="text-xs opacity-75">{profile.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
            <div className="mt-3 text-center">
              <Link href="/test-profiles" className="text-orange-600 hover:underline text-xs">
                → Interface de test complète
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Connexion CAS réelle */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <div className="text-white text-2xl">🦏</div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Connexion LeRhino</CardTitle>
            <CardDescription>
              Connectez-vous avec votre compte universitaire pour accéder à vos cours
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Utilisez votre authentification universitaire sécurisée
              </p>
              
              <Button asChild size="lg" className="w-full">
                <a href="https://login.insa-lyon.fr/cas/login?renew=true&service=http://app.insa-lyon.fr:3001/api/auth/cas/callback" className="flex items-center justify-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Se connecter avec l'université</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="border-t pt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  🔒 Connexion sécurisée
                </h3>
                <p className="text-sm text-blue-700">
                  Vos données sont protégées par le système d'authentification de votre université.
                  Aucun mot de passe n'est stocké sur nos serveurs.
                </p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Première fois sur LeRhino ?</p>
              <p className="mt-1">
                La connexion universitaire créera automatiquement votre compte.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
} 