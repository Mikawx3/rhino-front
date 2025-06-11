"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Crown, GraduationCap, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function TestProfilesPage() {
  const { devLogin, user, loading } = useAuth();
  const [testLoading, setTestLoading] = useState(false);

  const testProfiles = [
    {
      id: 1,
      username: "student1",
      email: "student1@example.com",
      role: "student",
      subscriptions: ["JAVASCRIPT", "PYTHON", "REACT"],
      icon: GraduationCap,
      color: "bg-blue-100 text-blue-800",
      description: "Étudiant avec accès aux cours et challenges"
    },
    {
      id: 2,
      username: "student2", 
      email: "student2@example.com",
      role: "student",
      subscriptions: ["PYTHON", "VUE"],
      icon: GraduationCap,
      color: "bg-blue-100 text-blue-800",
      description: "Deuxième profil étudiant"
    },
    {
      id: 3,
      username: "teacher1",
      email: "teacher1@example.com", 
      role: "teacher",
      subscriptions: ["JAVASCRIPT", "PYTHON", "REACT", "VUE"],
      icon: User,
      color: "bg-green-100 text-green-800",
      description: "Enseignant avec droits de création et gestion"
    },
    {
      id: 4,
      username: "teacher2",
      email: "teacher2@example.com",
      role: "teacher", 
      subscriptions: ["NODEJS", "REACT"],
      icon: User,
      color: "bg-green-100 text-green-800",
      description: "Deuxième profil enseignant"
    },
    {
      id: 5,
      username: "admin1",
      email: "admin1@example.com",
      role: "admin",
      subscriptions: ["*"],
      icon: Crown,
      color: "bg-purple-100 text-purple-800", 
      description: "Administrateur avec accès complet"
    }
  ];

  const handleTestLogin = async (profileId) => {
    setTestLoading(true);
    try {
      const success = await devLogin(profileId);
      if (success) {
        window.location.href = '/test-auth-success';
      }
    } catch (error) {
      console.error('Test login failed:', error);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Profils de Test</h1>
        <p className="text-gray-600">
          Testez l'application avec différents types d'utilisateurs pour valider les permissions et fonctionnalités.
        </p>
      </div>

      {user && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <User className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              Connecté en tant que: {user.username} ({user.role})
            </span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {testProfiles.map((profile) => {
          const Icon = profile.icon;
          
          return (
            <Card key={profile.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{profile.username}</CardTitle>
                      <Badge className={profile.color}>{profile.role}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription>{profile.description}</CardDescription>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Email:</p>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Abonnements:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.subscriptions.map((sub, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleTestLogin(profile.id)}
                  disabled={testLoading || loading}
                  className="w-full"
                  variant={user?.id === profile.id ? "secondary" : "default"}
                >
                  {user?.id === profile.id ? "Actuellement connecté" : "Se connecter"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Guide de Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-green-800 mb-2">👨‍🎓 Tests Étudiant</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Accéder au dashboard et voir les matières disponibles</li>
              <li>Consulter le challenge du jour</li>
              <li>Poser des questions au système RAG</li>
              <li>Consulter son profil et ses statistiques</li>
              <li>Vérifier qu'il ne peut pas créer/supprimer des matières</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">👨‍🏫 Tests Enseignant</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Créer de nouvelles matières</li>
              <li>Uploader des documents dans les matières</li>
              <li>Créer des challenges pour les étudiants</li>
              <li>Générer des questions de réflexion</li>
              <li>Consulter les statistiques des étudiants</li>
              <li>Calculer les classements</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-purple-800 mb-2">👨‍💼 Tests Administrateur</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Accès complet à toutes les fonctionnalités</li>
              <li>Gestion des utilisateurs</li>
              <li>Administration des matières</li>
              <li>Configuration système</li>
              <li>Vérifier les permissions élevées</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 