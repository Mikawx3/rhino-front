"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Trash2, Calendar, Clock } from "lucide-react";

export default function DashboardPage() {
  const [courses, setCourses] = useState([
    {
      id: 1,
      subject: "Mathématiques",
      courseName: "Algèbre Linéaire",
      subscriptionDate: "2024-01-15"
    },
    {
      id: 2,
      subject: "Informatique",
      courseName: "Algorithmes et Structures de Données",
      subscriptionDate: "2024-01-10"
    },
    {
      id: 3,
      subject: "Physique",
      courseName: "Mécanique Quantique",
      subscriptionDate: "2024-01-20"
    }
  ]);

  const [newCourse, setNewCourse] = useState({
    subject: "",
    courseName: ""
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )user=([^;]*)/);
      if (match) setUsername(decodeURIComponent(match[1]));
    }
  }, []);

  const handleAddCourse = () => {
    if (newCourse.subject && newCourse.courseName) {
      const course = {
        id: Date.now(),
        subject: newCourse.subject,
        courseName: newCourse.courseName,
        subscriptionDate: new Date().toISOString().split('T')[0]
      };
      setCourses([...courses, course]);
      setNewCourse({ subject: "", courseName: "" });
      setShowAddForm(false);
    }
  };

  const handleRemoveCourse = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const getSubjectColor = (subject) => {
    const colors = {
      "Mathématiques": "bg-blue-100 text-blue-800",
      "Informatique": "bg-green-100 text-green-800",
      "Physique": "bg-purple-100 text-purple-800",
      "Chimie": "bg-yellow-100 text-yellow-800",
      "Biologie": "bg-red-100 text-red-800",
      "Histoire": "bg-orange-100 text-orange-800",
      "Littérature": "bg-pink-100 text-pink-800"
    };
    return colors[subject] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {username && (
        <div className="mb-4 text-right text-sm text-gray-700">
          Connecté en tant que <span className="font-semibold">{username}</span>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Gérez vos abonnements aux cours et suivez votre progression</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cours actifs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              cours auxquels vous êtes abonné
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions reçues</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps d'étude</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12h 30m</div>
            <p className="text-xs text-muted-foreground">
              cette semaine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Course Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Mes Cours
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un cours
            </Button>
          </CardTitle>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t">
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Matière</label>
                <Input
                  placeholder="ex: Mathématiques, Informatique..."
                  value={newCourse.subject}
                  onChange={(e) => setNewCourse({...newCourse, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Nom du cours</label>
                <Input
                  placeholder="ex: Algèbre Linéaire"
                  value={newCourse.courseName}
                  onChange={(e) => setNewCourse({...newCourse, courseName: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddCourse}>Ajouter</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Courses List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className={getSubjectColor(course.subject)}>
                    {course.subject}
                  </Badge>
                  <CardTitle className="mt-2 text-lg">{course.courseName}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCourse(course.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Abonné depuis le {new Date(course.subscriptionDate).toLocaleDateString('fr-FR')}
              </CardDescription>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-green-600 font-medium">Actif</span>
                <span className="text-xs text-gray-500">Questions quotidiennes</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl mb-2">Aucun cours encore</CardTitle>
            <CardDescription className="mb-4">
              Commencez par ajouter vos premiers cours pour recevoir des questions personnalisées.
            </CardDescription>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre premier cours
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 