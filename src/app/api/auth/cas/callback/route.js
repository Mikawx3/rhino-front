import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Configuration de l'API (même que dans api-service.js)
const API_BASE_URL = 'http://app.insa-lyon.fr:8000/api';

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

  // Helper function to make API requests
  const makeAPIRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data.data;
    } catch (error) {
      console.error(`API Request failed for ${url}:`, error);
      throw error;
    }
  };

  // Déclaration des variables
  let userExists = false;
  let userId = null;
  let userRole = 'student'; // Rôle par défaut

  // Vérification/création de l'utilisateur via l'API
  try {
    // D'abord, vérifier si l'utilisateur existe déjà
    console.log('🔍 Checking if user exists...');
    const usersData = await makeAPIRequest('/users/');
    
    if (usersData && usersData.users) {
      const existingUser = usersData.users.find(user => user.username === username);
      if (existingUser) {
        userExists = true;
        userId = existingUser.id;
        userRole = existingUser.role || 'student';
        console.log('✅ Utilisateur existant trouvé:', existingUser);
      }
    }
    
    // Si l'utilisateur n'existe pas, le créer
    if (!userExists) {
      console.log('🆕 Création d\'un nouvel utilisateur:', username);
      
      // Déterminer le rôle basé sur le username
      if (username.includes('admin') || username.includes('prof') || username.startsWith('p')) {
        userRole = 'admin';
      } else if (username.includes('teacher') || username.includes('enseignant')) {
        userRole = 'teacher';
      } else {
        userRole = 'student';
      }
      
      const registerData = await makeAPIRequest('/users/register', {
        method: 'POST',
        body: JSON.stringify({
          username: username,
          email: `${username}@insa-lyon.fr`, // Email généré basé sur le username
          role: userRole,
          subscriptions: []
        })
      });
      
      if (registerData && registerData.user_id) {
        userId = registerData.user_id;
        console.log('✅ Utilisateur créé avec succès, ID:', userId, 'Role:', userRole);
      } else {
        console.error('❌ Erreur: pas d\'user_id dans la réponse:', registerData);
        return NextResponse.redirect('http://app.insa-lyon.fr:3001/login?error=usercreation');
      }
    } else {
      console.log('✅ Utilisateur existant, ID:', userId, 'Role:', userRole);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la communication avec l\'API:', error);
    return NextResponse.redirect('http://app.insa-lyon.fr:3001/login?error=apierror');
  }

  // Validation finale
  if (!userId) {
    console.error('❌ Erreur: Aucun userId obtenu');
    return NextResponse.redirect('http://app.insa-lyon.fr:3001/login?error=nouserid');
  }

  // Création de cookies de session avec toutes les infos nécessaires
  const res = NextResponse.redirect('http://app.insa-lyon.fr:3001/dashboard');
  
  // Cookies avec les informations utilisateur
  res.cookies.set('user', username, { path: '/', httpOnly: false });
  res.cookies.set('user_id', userId.toString(), { path: '/', httpOnly: false });
  res.cookies.set('user_role', userRole, { path: '/', httpOnly: false });
  
  console.log('🍪 Cookies créés - user:', username, 'user_id:', userId, 'user_role:', userRole);
  
  return res;
} 