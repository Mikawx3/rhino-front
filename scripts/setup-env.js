#!/usr/bin/env node

/**
 * 🦏 Script de configuration d'environnement Rhino
 * Génère automatiquement les fichiers .env selon l'environnement
 */

const fs = require('fs');
const path = require('path');

const environments = {
  development: {
    API_BASE_URL: 'http://localhost:8888/api',
    FRONTEND_BASE_URL: 'http://localhost:3001',
    CAS_LOGIN_URL: 'https://login.insa-lyon.fr/cas',
    CAS_LOGIN_DIRECT_URL: '', // Optionnel - URL directe du login CAS
    CAS_CALLBACK_DIRECT_URL: '', // Optionnel - URL directe du callback CAS
    DASHBOARD_DIRECT_URL: '', // Optionnel - URL directe du dashboard
  },
  production: {
    API_BASE_URL: 'http://wired.city-lyon.fr:8888/api',
    FRONTEND_BASE_URL: 'http://app.insa-lyon.fr:3001',
    CAS_LOGIN_URL: 'https://login.insa-lyon.fr/cas',
    CAS_LOGIN_DIRECT_URL: '', // Optionnel - URL directe du login CAS
    CAS_CALLBACK_DIRECT_URL: '', // Optionnel - URL directe du callback CAS
    DASHBOARD_DIRECT_URL: '', // Optionnel - URL directe du dashboard
  }
};

function generateEnvFile(envName) {
  const config = environments[envName];
  if (!config) {
    console.error(`❌ Environnement '${envName}' non reconnu`);
    return;
  }

  const envContent = `# 🦏 Rhino - Configuration ${envName.charAt(0).toUpperCase() + envName.slice(1)}

# API Backend
NEXT_PUBLIC_API_BASE_URL=${config.API_BASE_URL}

# Frontend
NEXT_PUBLIC_FRONTEND_BASE_URL=${config.FRONTEND_BASE_URL}

# CAS Authentication (Base)
NEXT_PUBLIC_CAS_LOGIN_URL=${config.CAS_LOGIN_URL}

# CAS URLs directes (optionnel - si vide, construites automatiquement)
NEXT_PUBLIC_CAS_LOGIN_DIRECT_URL=${config.CAS_LOGIN_DIRECT_URL}
NEXT_PUBLIC_CAS_CALLBACK_DIRECT_URL=${config.CAS_CALLBACK_DIRECT_URL}

# Dashboard URL directe (optionnel - si vide, construite automatiquement)
NEXT_PUBLIC_DASHBOARD_DIRECT_URL=${config.DASHBOARD_DIRECT_URL}

# Environment
NODE_ENV=${envName}
`;

  const fileName = `.env.${envName}`;
  const filePath = path.join(process.cwd(), fileName);
  
  try {
    fs.writeFileSync(filePath, envContent);
    console.log(`✅ Fichier ${fileName} créé avec succès`);
  } catch (error) {
    console.error(`❌ Erreur lors de la création de ${fileName}:`, error.message);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const envName = args[0];

  if (!envName) {
    console.log('🦏 Générateur de configuration d\'environnement Rhino\n');
    console.log('Usage:');
    console.log('  node scripts/setup-env.js development');
    console.log('  node scripts/setup-env.js production');
    console.log('  node scripts/setup-env.js all\n');
    console.log('Environnements disponibles:', Object.keys(environments).join(', '));
    return;
  }

  if (envName === 'all') {
    Object.keys(environments).forEach(generateEnvFile);
  } else {
    generateEnvFile(envName);
  }
}

main(); 