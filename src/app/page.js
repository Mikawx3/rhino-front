"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Brain, Mail, User, Loader2 } from "lucide-react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);

  const determineCasUserRole = (username) => {
    // Logique pour déterminer le rôle basé sur le username
    if (username.includes('admin') || username.includes('prof') || username.startsWith('p')) {
      return 'admin';
    } else if (username.includes('teacher') || username.includes('enseignant')) {
      return 'teacher';
    } else {
      return 'student';
    }
  };

  const handleQuickLogin = async () => {
    if (!username.trim()) return;

    try {
      setIsLoggingIn(true);
      
      const role = determineCasUserRole(username);

      // Helper function to make API requests (similar to CAS callback)
      const makeAPIRequest = async (endpoint, options = {}) => {
        const url = `http://localhost:8888/api${endpoint}`;
        const defaultOptions = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
        
        try {
          const response = await fetch(url, { ...defaultOptions, ...options });
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.message || 'API request failed');
          }
          
          return data.data;
        } catch (error) {
          console.error(`API Request failed for ${url}:`, error);
          throw error;
        }
      };

      // Variables pour stocker les infos utilisateur
      let userExists = false;
      let userId = null;
      let userRole = role;

      console.log('🔍 Vérification si l\'utilisateur existe...', username);

      try {
        // D'abord, vérifier si l'utilisateur existe déjà
        const usersData = await makeAPIRequest('/users/');
        
        if (usersData && usersData.users) {
          const existingUser = usersData.users.find(user => user.username === username);
          if (existingUser) {
            userExists = true;
            userId = existingUser.id;
            userRole = existingUser.role || role;
            console.log('✅ Utilisateur existant trouvé:', existingUser);
          }
        }
        
        // Si l'utilisateur n'existe pas, le créer
        if (!userExists) {
          console.log('🆕 Création d\'un nouvel utilisateur:', username);
          
          const registerData = await makeAPIRequest('/users/register', {
            method: 'POST',
            body: JSON.stringify({
              username: username,
              email: `${username}@insa-lyon.fr`,
              role: userRole,
              subscriptions: []
            })
          });
          
          if (registerData && registerData.user_id) {
            userId = registerData.user_id;
            console.log('✅ Utilisateur créé avec succès, ID:', userId, 'Role:', userRole);
          } else {
            throw new Error('Erreur lors de la création de l\'utilisateur');
          }
        } else {
          console.log('✅ Utilisateur existant, ID:', userId, 'Role:', userRole);
        }
        
      } catch (apiError) {
        console.error('❌ Erreur API:', apiError);
        throw new Error('Erreur lors de la communication avec le serveur');
      }

      // Validation finale
      if (!userId) {
        throw new Error('Impossible d\'obtenir l\'ID utilisateur');
      }

      // Créer les cookies CAS avec l'ID réel du backend
      const expires = new Date();
      expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24h
      
      document.cookie = `user=${encodeURIComponent(username)}; path=/; expires=${expires.toUTCString()};`;
      document.cookie = `user_id=${userId}; path=/; expires=${expires.toUTCString()};`;
      document.cookie = `user_role=${userRole}; path=/; expires=${expires.toUTCString()};`;

      console.log('🍪 Cookies créés avec ID réel du backend - user:', username, 'user_id:', userId, 'user_role:', userRole);

      // Simuler un délai comme un vrai login
      await new Promise(resolve => setTimeout(resolve, 500));

      // Rediriger vers le dashboard
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Quick login failed:', error);
      alert(`Erreur de connexion: ${error.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="text-6xl">🦏</div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Bienvenue sur <span className="text-blue-600">LeRhino</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            La plateforme d'apprentissage intelligente qui vous accompagne dans vos études 
            avec des questions personnalisées générées par IA.
          </p>
          
          {/* Login Options */}
          <div className="space-y-4 max-w-md mx-auto">
            <Button asChild size="lg" className="text-lg px-8 py-3 w-full">
              <Link href="/login">
                Connexion CAS INSA
              </Link>
            </Button>
            
            <div className="text-gray-500 text-sm">ou</div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              className="w-full"
            >
              <User className="h-4 w-4 mr-2" />
              Connexion rapide (test)
            </Button>
          </div>

          {/* Quick Login Form */}
          {showQuickLogin && (
            <Card className="max-w-md mx-auto mt-6 animate-in slide-in-from-top-4 duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Connexion rapide</CardTitle>
                <CardDescription>
                  Entrez un nom d'utilisateur pour tester l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Nom d'utilisateur (ex: student1, prof1, admin1)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleQuickLogin()}
                      disabled={isLoggingIn}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Conseil: utilisez "admin", "prof" ou "teacher" pour les rôles élevés
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleQuickLogin}
                      disabled={!username.trim() || isLoggingIn}
                      className="flex-1"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        'Se connecter'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowQuickLogin(false)}
                      disabled={isLoggingIn}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Cours Diversifiés</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Abonnez-vous aux cours qui vous intéressent et suivez votre progression.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Brain className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>IA Personnalisée</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Recevez des questions adaptées à votre niveau et à vos objectifs d'apprentissage.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Questions par Email</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Des questions quotidiennes envoyées directement dans votre boîte mail.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
