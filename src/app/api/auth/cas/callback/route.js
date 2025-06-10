import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ticket = searchParams.get('ticket');
  if (!ticket) {
    return NextResponse.redirect('http://localhost:3000/login?error=noticket');
  }

  const serviceUrl = 'http://localhost:3000/api/auth/cas/callback';
  const casValidateUrl = `https://login.insa-lyon.fr/cas/serviceValidate?ticket=${ticket}&service=${encodeURIComponent(serviceUrl)}`;

  const response = await fetch(casValidateUrl);
  const text = await response.text();

  // Extraction simple du username depuis la réponse XML
  const usernameMatch = text.match(/<cas:user>([^<]+)<\/cas:user>/);
  if (!usernameMatch) {
    return NextResponse.redirect('http://localhost:3000/login?error=casfail');
  }
  const username = usernameMatch[1];

  // Création d'un cookie de session (simple, non sécurisé pour la prod)
  const res = NextResponse.redirect('http://localhost:3000/dashboard');
  res.cookies.set('user', username, { path: '/', httpOnly: false });
  return res;
} 