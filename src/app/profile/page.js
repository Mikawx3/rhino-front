"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  BookOpen, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Award, 
  Target,
  Mail,
  Settings,
  BarChart3,
  University,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement du profil...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
          <p className="text-gray-600 mb-4">
            Veuillez vous connecter pour accéder à votre profil
          </p>
          <Button asChild>
            <a href="/login">Se connecter</a>
          </Button>
        </div>
      </div>
    );
  }

  const stats = user.stats || {
    totalCourses: user.subscriptions?.length || 0,
    questionsAnswered: 152,
    studyTime: "47h 30m",
    averageScore: 78,
    streak: 12,
    totalQuestions: 189
  };

  const courseProgress = user.subscriptions?.map((sub, index) => ({
    name: sub === "*" ? "Accès Complet" : sub,
    progress: 65 + Math.floor(Math.random() * 30), // Simulation
    subject: sub === "*" ? "Administration" : "Programmation"
  })) || [];

  const recentActivity = [
    { date: "2024-01-25", activity: `Questions répondues en ${user.subscriptions?.[0] || 'Programmation'}`, score: 80 },
    { date: "2024-01-24", activity: user.isCasUser ? "Connexion via CAS universitaire" : "Connexion test", score: null },
    { date: "2024-01-23", activity: "Consultation des documents de cours", score: 95 },
    { date: "2024-01-22", activity: "Participation au challenge du jour", score: 70 },
    { date: "2024-01-21", activity: "Consultation du dashboard", score: null }
  ];

  const achievements = [
    { name: "Premier pas", description: "Premier cours ajouté", icon: "🎯", earned: true },
    { name: "Assidu", description: "10 jours consécutifs", icon: "🔥", earned: user.stats?.streak >= 10 },
    { name: "Studieux", description: "100 questions répondues", icon: "📚", earned: user.stats?.totalChallenges >= 10 },
    { name: "Excellence", description: "90% de moyenne", icon: "⭐", earned: false },
    { name: "CAS User", description: "Connexion universitaire", icon: "🎓", earned: user.isCasUser },
    { name: "Polyvalent", description: "5 matières différentes", icon: "🎨", earned: user.subscriptions?.length >= 5 }
  ];
  console.log("USER",user);

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
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
              {user.username.split('').slice(0, 2).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-600">{user.email}</p>
            {user.isCasUser && (
              <div className="flex items-center mt-1 text-sm text-blue-600">
                <University className="h-4 w-4 mr-1" />
                <span>INSA Lyon - Authentification CAS</span>
              </div>
            )}
            <Badge variant="outline" className="mt-2">
              Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </Badge>
          </div>
          <div className="ml-auto">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="progress">Progression</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="achievements">Récompenses</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cours suivis</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">matières actives</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions répondues</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.questionsAnswered}</div>
                <p className="text-xs text-muted-foreground">sur {stats.totalQuestions} reçues</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temps d'étude</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.studyTime}</div>
                <p className="text-xs text-muted-foreground">temps total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Série actuelle</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.streak}</div>
                <p className="text-xs text-muted-foreground">jours consécutifs</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Score moyen</CardTitle>
              <CardDescription>Performance globale sur toutes les matières</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Progress value={stats.averageScore} className="flex-1" />
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progression par cours</CardTitle>
              <CardDescription>Votre avancement dans chaque matière</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {courseProgress.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{course.name}</p>
                      <p className="text-sm text-gray-500">{course.subject}</p>
                    </div>
                    <Badge variant="outline">{course.progress}%</Badge>
                  </div>
                  <Progress value={course.progress} />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Statistiques hebdomadaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Questions cette semaine</span>
                    <span className="font-bold">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps d'étude</span>
                    <span className="font-bold">8h 45m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moyenne des scores</span>
                    <span className="font-bold">82%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Objectif hebdomadaire</span>
                    <Badge className="bg-green-100 text-green-800">Atteint</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Préférences emails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Questions quotidiennes</span>
                    <Badge>Activé</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Heure d'envoi</span>
                    <span className="text-sm">9h00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rappels de série</span>
                    <Badge>Activé</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Résumé hebdomadaire</span>
                    <Badge variant="outline">Dimanche</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{item.activity}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleDateString('fr-FR', { 
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </div>
                    </div>
                    {item.score && (
                      <Badge variant={item.score >= 80 ? "default" : "secondary"}>
                        {item.score}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Récompenses</CardTitle>
              <CardDescription>Vos accomplissements et objectifs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <Card key={index} className={`p-4 ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-center">
                      <div className="text-2xl mb-2">{achievement.icon}</div>
                      <h3 className={`font-medium ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                        {achievement.name}
                      </h3>
                      <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && (
                        <Badge className="mt-2 bg-green-100 text-green-800">
                          <Award className="h-3 w-3 mr-1" />
                          Obtenu
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 