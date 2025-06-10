"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Shield, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )user=([^;]*)/);
    if (match) setUsername(decodeURIComponent(match[1]));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Connexion StudyHub</CardTitle>
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
                <a href="https://login.insa-lyon.fr/cas/login?service=http://localhost:3000/api/auth/cas/callback" className="flex items-center justify-center space-x-2">
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
              <p>Première fois sur StudyHub ?</p>
              <p className="mt-1">
                La connexion universitaire créera automatiquement votre compte.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
} 