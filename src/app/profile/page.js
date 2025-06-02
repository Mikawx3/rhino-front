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
  BarChart3
} from "lucide-react";

export default function ProfilePage() {
  const user = {
    name: "Alex Martin",
    email: "alex.martin@universite.fr",
    university: "Université de Paris",
    joinDate: "2024-01-01",
    avatar: ""
  };

  const stats = {
    totalCourses: 3,
    questionsAnswered: 152,
    studyTime: "47h 30m",
    averageScore: 78,
    streak: 12,
    totalQuestions: 189
  };

  const courseProgress = [
    { name: "Algèbre Linéaire", progress: 85, subject: "Mathématiques" },
    { name: "Algorithmes et Structures de Données", progress: 92, subject: "Informatique" },
    { name: "Mécanique Quantique", progress: 67, subject: "Physique" }
  ];

  const recentActivity = [
    { date: "2024-01-25", activity: "5 questions répondues en Algèbre Linéaire", score: 80 },
    { date: "2024-01-24", activity: "Nouveau cours ajouté: Mécanique Quantique", score: null },
    { date: "2024-01-23", activity: "7 questions répondues en Informatique", score: 95 },
    { date: "2024-01-22", activity: "3 questions répondues en Mathématiques", score: 70 },
    { date: "2024-01-21", activity: "Série de 10 jours consécutifs atteinte!", score: null }
  ];

  const achievements = [
    { name: "Premier pas", description: "Premier cours ajouté", icon: "🎯", earned: true },
    { name: "Assidu", description: "10 jours consécutifs", icon: "🔥", earned: true },
    { name: "Studieux", description: "100 questions répondues", icon: "📚", earned: true },
    { name: "Excellence", description: "90% de moyenne", icon: "⭐", earned: false },
    { name: "Marathonien", description: "50h d'étude", icon: "💪", earned: false },
    { name: "Polyvalent", description: "5 matières différentes", icon: "🎨", earned: false }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">{user.university}</p>
            <Badge variant="outline" className="mt-2">
              Membre depuis {new Date(user.joinDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
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