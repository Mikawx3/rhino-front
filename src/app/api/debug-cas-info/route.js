import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const debugFile = path.join(process.cwd(), 'debug-cas', 'cas-response.json');
    
    if (!fs.existsSync(debugFile)) {
      return NextResponse.json({ 
        error: 'Aucun fichier de debug trouvé', 
        message: 'Connectez-vous via CAS pour générer les données de debug' 
      });
    }
    
    const debugData = fs.readFileSync(debugFile, 'utf8');
    const debugInfo = JSON.parse(debugData);
    
    return NextResponse.json({
      success: true,
      debugInfo: debugInfo,
      message: 'Données CAS récupérées avec succès',
    });
    
  } catch (error) {
    console.error('Error reading debug file:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la lecture du fichier de debug',
      details: error.message 
    }, { status: 500 });
  }
} 