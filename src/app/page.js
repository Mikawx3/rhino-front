import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Mail } from "lucide-react";

export default function Home() {
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
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/login">
              Commencer maintenant
            </Link>
          </Button>
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
