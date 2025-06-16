  "use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  RefreshCw, 
  ArrowLeft,
  AlertCircle, 
  Loader2,
  BookOpen,
  Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRhinoAPI } from "@/lib/api-service";

export default function MatierePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, isSubscribedTo } = useAuth();
  const apiService = useRhinoAPI(user?.id);
  
  const matiere = params.matiere;
  
  const [matiereInfo, setMatiereInfo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  
  // Formulaire d'upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [isExam, setIsExam] = useState(false);

  useEffect(() => {
    if (user?.id && matiere) {
      loadMatiereData();
    }
  }, [user?.id, matiere]);

  const loadMatiereData = async () => {
    if (!user?.id || !matiere) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Charger les infos de la matière et les documents en parallèle
      const [matiereResponse, documentsResponse] = await Promise.allSettled([
        apiService.getMatiereDetails(matiere),
        apiService.getDocuments(matiere)
      ]);

      // Traiter les infos de la matière
      if (matiereResponse.status === 'fulfilled') {
        setMatiereInfo(matiereResponse.value.matiere || null);
      } else {
        console.error('Failed to load matiere info:', matiereResponse.reason);
        // Vérifier si c'est une erreur 404 (matière non trouvée)
        if (matiereResponse.reason?.message?.includes('404') || 
            matiereResponse.reason?.message?.includes('not found') ||
            matiereResponse.reason?.message?.includes('non trouvée')) {
          setError('Matière non trouvée');
        } else {
          setError('Erreur lors du chargement des informations de la matière');
        }
        return;
      }

      // Traiter les documents
      if (documentsResponse.status === 'fulfilled') {
        const documents = documentsResponse.value.documents || [];
        console.log('📄 Documents reçus:', documents); // Debug: voir la structure
        setDocuments(documents);
      } else {
        console.error('Failed to load documents:', documentsResponse.reason);
        // Si on ne peut pas charger les documents, on continue avec une liste vide
        // mais on ne bloque pas toute la page
        setDocuments([]);
        if (!documentsResponse.reason?.message?.includes('Aucun document')) {
          // Seulement afficher l'erreur si ce n'est pas juste "pas de documents"
          setError('Impossible de charger les documents');
        }
      }

    } catch (err) {
      console.error('Matiere page loading error:', err);
      setError('Erreur lors du chargement de la matière');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      await apiService.uploadDocument(matiere, selectedFile, isExam);
      
      // Recharger la liste des documents
      const response = await apiService.getDocuments(matiere);
      setDocuments(response.documents || []);
      
      // Réinitialiser le formulaire
      setSelectedFile(null);
      setIsExam(false);
      
    } catch (err) {
      console.error('Failed to upload document:', err);
      setError('Erreur lors de l\'upload du document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId, documentName) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${documentName}" ?`)) {
      return;
    }

    try {
      setError(null);
      await apiService.deleteDocument(matiere, documentId);
      
      // Retirer de la liste locale
      setDocuments(documents.filter(d => d.id !== documentId));
    } catch (err) {
      console.error('Failed to delete document:', err);
      setError('Erreur lors de la suppression du document');
    }
  };

  const handleDownloadDocument = async (documentId, documentName) => {
    try {
      const response = await apiService.getDocumentContent(matiere, documentId);
      
      // Créer un lien de téléchargement
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Failed to download document:', err);
      setError('Erreur lors du téléchargement du document');
    }
  };

  const handleReindex = async () => {
    try {
      setReindexing(true);
      setError(null);
      
      await apiService.reindexMatiere(matiere);
      
      // Recharger la liste des documents
      const response = await apiService.getDocuments(matiere);
      setDocuments(response.documents || []);
      
    } catch (err) {
      console.error('Failed to reindex:', err);
      setError('Erreur lors de la réindexation');
    } finally {
      setReindexing(false);
    }
  };

  const formatFileSize = (bytes) => {
    // Vérifier si bytes est défini et est un nombre
    if (!bytes || typeof bytes !== 'number' || isNaN(bytes)) {
      return 'Taille inconnue';
    }
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    // Vérifier si dateString est défini et valide
    if (!dateString) {
      return 'Date inconnue';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canManageDocuments = user?.role === 'teacher' || user?.role === 'admin';

  // Loading states
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement de la matière...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
          <p className="text-gray-600 mb-4">
            Veuillez vous connecter pour accéder à cette matière
          </p>
          <Button asChild>
            <a href="/login">Se connecter</a>
          </Button>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a accès à cette matière
  if (!isSubscribedTo(matiere)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 mb-4">
            Vous n'êtes pas abonné à la matière "{matiere}". Vous devez vous abonner pour accéder au contenu.
          </p>
          <Button asChild>
            <a href="/dashboard">Retour au tableau de bord</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {matiereInfo?.name || matiere}
            </h1>
            <p className="text-gray-600">
              {matiereInfo?.description || 'Gestion des documents'}
            </p>
          </div>
          
          {canManageDocuments && (
            <Button 
              onClick={handleReindex}
              disabled={reindexing}
              variant="outline"
            >
              {reindexing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Réindexer
            </Button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Upload section */}
      {canManageDocuments && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Ajouter un document
            </CardTitle>
            <CardDescription>
              Uploadez un nouveau document pour cette matière
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.txt,.md,.ppt,.pptx"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isExam"
                  checked={isExam}
                  onChange={(e) => setIsExam(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isExam" className="text-sm">
                  Ce document est un examen
                </label>
              </div>
              
              <Button 
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Uploader le document
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Documents ({documents.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun document disponible pour cette matière</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc, index) => {
                // Debug : afficher la structure de chaque document
                console.log(`📄 Document ${index}:`, doc);
                
                // Gérer différents noms de propriétés possibles
                const docName = doc.name || doc.filename || doc.title || `Document ${index + 1}`;
                const docSize = doc.size || doc.file_size || doc.fileSize || 0;
                const docDate = doc.uploaded_at || doc.created_at || doc.date || doc.timestamp;
                const docId = doc.id || doc.document_id || index;
                const isExam = doc.is_exam || doc.isExam || false;
                
                return (
                  <div key={docId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="font-medium">{docName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatFileSize(docSize)}</span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(docDate)}
                          </span>
                          {isExam && (
                            <Badge variant="secondary">Examen</Badge>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(docId, docName)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      {canManageDocuments && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDocument(docId, docName)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 