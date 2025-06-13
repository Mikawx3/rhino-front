import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ticket = searchParams.get('ticket');
  if (!ticket) {
    return NextResponse.redirect('http://app.insa-lyon.fr:3001/login?error=noticket');
  }

  const serviceUrl = 'http://app.insa-lyon.fr:3001/api/auth/cas/callback';
  const casValidateUrl = `https://login.insa-lyon.fr/cas/serviceValidate?ticket=${ticket}&service=${encodeURIComponent(serviceUrl)}`;

  const response = await fetch(casValidateUrl);
  
  const text = await response.text();
  
  // ÉCRITURE DANS UN FICHIER DE DEBUG
  const debugInfo = {
    timestamp: new Date().toISOString(),
    ticket: ticket,
    validationUrl: casValidateUrl,
    responseStatus: response.status,
    responseHeaders: Object.fromEntries(response.headers.entries()),
    responseText: text,
    cookies: req.headers.get('cookie') || '',
    response: response,
  };

  try {
    // Créer le dossier debug s'il n'existe pas
    const debugDir = path.join(process.cwd(), 'debug-cas');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }
    
    // Écrire dans le fichier de debug
    const debugFile = path.join(debugDir, 'cas-response.json');
    fs.writeFileSync(debugFile, JSON.stringify(debugInfo, null, 2));
    
    console.log('📁 Debug info saved to:', debugFile);
  } catch (error) {
    console.error('❌ Error saving debug info:', error);
  }

  // Extraction simple du username depuis la réponse XML
  const usernameMatch = text.match(/<cas:user>([^<]+)<\/cas:user>/);
  if (!usernameMatch) {
    console.log('❌ Aucun username trouvé dans la réponse CAS');
    return NextResponse.redirect('http://app.insa-lyon.fr:3001/login?error=casfail');
  }
  const username = usernameMatch[1];
  console.log('👤 Username extrait:', username);

  // Tentative d'extraction de l'email depuis la réponse
  const emailMatch = text.match(/<cas:mail>([^<]+)<\/cas:mail>/);
  const emailMatch2 = text.match(/<cas:email>([^<]+)<\/cas:email>/);
  const emailMatch3 = text.match(/<cas:emailAddress>([^<]+)<\/cas:emailAddress>/);
  
  let email = null;
  if (emailMatch) {
    email = emailMatch[1];
    console.log('📧 Email trouvé (cas:mail):', email);
  } else if (emailMatch2) {
    email = emailMatch2[1];
    console.log('📧 Email trouvé (cas:email):', email);
  } else if (emailMatch3) {
    email = emailMatch3[1];
    console.log('📧 Email trouvé (cas:emailAddress):', email);
  } else {
    console.log('⚠️ Aucun email trouvé dans la réponse CAS');
  }

  // Extraction d'autres attributs possibles
  const attributesMatch = text.match(/<cas:attributes>(.*?)<\/cas:attributes>/s);
  if (attributesMatch) {
    console.log('🏷️ Attributs CAS trouvés:', attributesMatch[1]);
  }

  // Création d'un cookie de session (simple, non sécurisé pour la prod)
  const res = NextResponse.redirect('http://app.insa-lyon.fr:3001/dashboard');
  
  res.cookies.set('user', username, { path: '/', httpOnly: false });
  
  // Si on a trouvé un email, l'ajouter aussi comme cookie
  if (email) {
    res.cookies.set('user_email', email, { path: '/', httpOnly: false });
  }
  
  return res;
} 