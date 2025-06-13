"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DebugCasPage() {
  const [cookies, setCookies] = useState({});
  const [casDebugInfo, setCasDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Récupérer tous les cookies
    if (typeof document !== 'undefined') {
      const cookieObj = {};
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookieObj[name] = decodeURIComponent(value);
        }
      });
      setCookies(cookieObj);
    }
    
    // Charger automatiquement les infos de debug
    loadCasDebugInfo();
  }, []);

  const loadCasDebugInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/debug-cas-info', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        setCasDebugInfo(data.debugInfo);
      } else {
        setError(data.error || data.message);
      }
    } catch (err) {
      setError('Erreur lors du chargement des informations de debug');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatXml = (xmlString) => {
    // Simple formatage pour affichage
    return xmlString
      .replace(/></g, '>\n<')
      .replace(/^\s*\n/gm, '')
      .trim();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🔍 Debug CAS INSA Lyon</h1>
          <Button onClick={loadCasDebugInfo} disabled={loading}>
            {loading ? 'Chargement...' : '🔄 Recharger'}
          </Button>
        </div>
        
        <div className="grid gap-6">
          {/* Informations de debug CAS depuis fichier */}
          <Card>
            <CardHeader>
              <CardTitle>📄 Réponse CAS (depuis fichier de debug)</CardTitle>
              <CardDescription>
                Dernière connexion CAS enregistrée
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  <strong>Erreur:</strong> {error}
                </div>
              )}
              
              {casDebugInfo ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold">Timestamp:</label>
                      <div className="text-sm text-gray-600">
                        {new Date(casDebugInfo.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold">Status HTTP:</label>
                      <Badge className={casDebugInfo.responseStatus === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {casDebugInfo.responseStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="font-semibold">URL de validation:</label>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs break-all">
                      {casDebugInfo.validationUrl}
                    </div>
                  </div>
                  
                  <div>
                    <label className="font-semibold">Réponse XML complète:</label>
                    <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-96">
                      <pre>{formatXml(casDebugInfo.responseText)}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <label className="font-semibold">Headers de réponse:</label>
                    <div className="bg-gray-100 p-3 rounded">
                      <pre className="text-xs">{JSON.stringify(casDebugInfo.responseHeaders, null, 2)}</pre>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold">Réponse:</label>
                    <div className="bg-gray-100 p-3 rounded">
                      <pre className="text-xs">{JSON.stringify(casDebugInfo.response, null, 2)}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <label className="font-semibold">Cookies de la requête:</label>
                    <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                      {casDebugInfo.cookies || 'Aucun cookie'}
                    </div>
                  </div>
                </div>
              ) : !loading && !error && (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune donnée de debug disponible</p>
                  <p className="text-sm mt-2">Connectez-vous via CAS pour générer les données</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cookies actuels */}
          <Card>
            <CardHeader>
              <CardTitle>🍪 Cookies actuels</CardTitle>
              <CardDescription>
                Cookies présents dans le navigateur maintenant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {Object.keys(cookies).length > 0 ? (
                  Object.entries(cookies).map(([name, value]) => (
                    <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="font-semibold text-sm">{name}</div>
                      <div className="text-sm font-mono bg-white px-2 py-1 rounded border max-w-md truncate">
                        {value}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    Aucun cookie trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations utilisateur CAS */}
          <Card>
            <CardHeader>
              <CardTitle>👤 Informations utilisateur CAS</CardTitle>
              <CardDescription>
                Données extraites des cookies CAS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Username:</label>
                  <div className="mt-1">
                    {cookies.user ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        {cookies.user}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Non connecté</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="font-semibold">Email:</label>
                  <div className="mt-1">
                    {cookies.user_email ? (
                      <Badge className="bg-green-100 text-green-800">
                        {cookies.user_email}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Non disponible</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>📖 Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
                  <h4 className="font-semibold text-blue-800">Comment utiliser cette page :</h4>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-700">
                    <li>Connectez-vous via CAS (lien ci-dessous)</li>
                    <li>Revenez sur cette page</li>
                    <li>Cliquez sur "🔄 Recharger" pour voir les nouvelles données</li>
                    <li>Analysez la réponse XML complète du serveur CAS</li>
                  </ol>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                  <h4 className="font-semibold text-yellow-800">Informations recherchées :</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-yellow-700">
                    <li>Adresse email de l'utilisateur</li>
                    <li>Attributs supplémentaires (nom, prénom, etc.)</li>
                    <li>Structure complète de la réponse XML</li>
                    <li>Cookies reçus (AGIMUS, etc.)</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded border-l-4 border-green-400">
                  <h4 className="font-semibold text-green-800">Liens utiles :</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-green-700">
                    <li><a href="/login" className="underline hover:text-green-900">🔗 Se connecter via CAS</a></li>
                    <li><a href="/profile" className="underline hover:text-green-900">👤 Voir le profil utilisateur</a></li>
                    <li><a href="/dashboard" className="underline hover:text-green-900">🏠 Dashboard</a></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 