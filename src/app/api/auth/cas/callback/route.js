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

  // Déclaration des variables en dehors du bloc try
  let userExists = false;
  let userId = null;

  // Vérification/création de l'utilisateur via l'API
  try {
    // D'abord, vérifier si l'utilisateur existe déjà
    const usersResponse = await fetch('http://app.insa-lyon.fr:8000/api/users/');
    const usersData = await usersResponse.json();
    
    if (usersData.success && usersData.data && usersData.data.users) {
      const existingUser = usersData.data.users.find(user => user.username === username);
      if (existingUser) {
        userExists = true;
        userId = existingUser.id;
        console.log('✅ Utilisateur existant trouvé:', existingUser);
      }
    }
    
    // Si l'utilisateur n'existe pas, le créer
    if (!userExists) {
      console.log('🆕 Création d\'un nouvel utilisateur:', username);
      
      const registerResponse = await fetch('http://app.insa-lyon.fr:8000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: `${username}@insa-lyon.fr`, // Email généré basé sur le username
          role: 'student', // Rôle par défaut
          subscriptions: []
        })
      });
      
      const registerData = await registerResponse.json();
      
      if (registerData.success) {
        userId = registerData.data.user_id;
        console.log('✅ Utilisateur créé avec succès, ID:', userId);
      } else {
        console.error('❌ Erreur lors de la création de l\'utilisateur:', registerData);
        return NextResponse.redirect('http://app.insa-lyon.fr:3001/login?error=usercreation');
      }
    } else {
      console.log('✅ Utilisateur existant, ID:', userId);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la communication avec l\'API:', error);
    return NextResponse.redirect('http://app.insa-lyon.fr:3001/login?error=apierror');
  }

  // Création d'un cookie de session
  const res = NextResponse.redirect('http://app.insa-lyon.fr:3001/dashboard');
  
  res.cookies.set('user', username, { path: '/', httpOnly: false });
  res.cookies.set('user_id', userId.toString(), { path: '/', httpOnly: false });
  
  return res;
} 