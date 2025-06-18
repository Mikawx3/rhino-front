# 🦏 Configuration d'Environnement Rhino

## Variables d'environnement

Les URLs sont maintenant gérées via des configurations d'environnement pour faciliter le déploiement entre développement et production.

## Fichiers à créer

### `.env.development`
```bash
# 🦏 Rhino - Configuration Développement

# API Backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888/api

# Frontend
NEXT_PUBLIC_FRONTEND_BASE_URL=http://localhost:3001

# CAS Authentication (Base)
NEXT_PUBLIC_CAS_LOGIN_URL=https://login.insa-lyon.fr/cas

# CAS URLs directes (optionnel - si vide, construites automatiquement)
NEXT_PUBLIC_CAS_LOGIN_DIRECT_URL=
NEXT_PUBLIC_CAS_CALLBACK_DIRECT_URL=

# Dashboard URL directe (optionnel - si vide, construite automatiquement)
NEXT_PUBLIC_DASHBOARD_DIRECT_URL=

# Environment
NODE_ENV=development
```

### `.env.production`
```bash
# 🦏 Rhino - Configuration Production

# API Backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888/api

# Frontend
NEXT_PUBLIC_FRONTEND_BASE_URL=http://localhost:3001

# CAS Authentication (Base)
NEXT_PUBLIC_CAS_LOGIN_URL=https://login.insa-lyon.fr/cas

# CAS URLs directes (optionnel - si vide, construites automatiquement)
NEXT_PUBLIC_CAS_LOGIN_DIRECT_URL=
NEXT_PUBLIC_CAS_CALLBACK_DIRECT_URL=

# Dashboard URL directe (optionnel - si vide, construite automatiquement)
NEXT_PUBLIC_DASHBOARD_DIRECT_URL=

# Environment
NODE_ENV=production
```

## Configuration CAS

### 🔧 **Mode automatique (recommandé)**
Laissez les URLs CAS directes vides. Le système construira automatiquement :
- **Login CAS** : `{CAS_LOGIN_URL}/login`
- **Callback CAS** : `{FRONTEND_BASE_URL}/api/auth/cas/callback`

### 🎯 **Mode manuel (URLs spécifiques)**
Spécifiez directement les URLs complètes :
```bash
# Exemple d'URLs manuelles
NEXT_PUBLIC_CAS_LOGIN_DIRECT_URL=https://login.insa-lyon.fr/cas/login
NEXT_PUBLIC_CAS_CALLBACK_DIRECT_URL=http://localhost:3001/api/auth/cas/callback
```

## Configuration Dashboard

### 🔧 **Mode automatique (recommandé)**
Laissez l'URL dashboard vide. Le système construira automatiquement :
- **Dashboard** : `{FRONTEND_BASE_URL}/dashboard`

### 🎯 **Mode manuel (URL spécifique)**
Spécifiez directement l'URL complète :
```bash
# Exemple d'URL manuelle
NEXT_PUBLIC_DASHBOARD_DIRECT_URL=https://custom-dashboard.example.com/admin
```

## Configuration automatique

Le système utilise automatiquement :
- **Développement** : URLs localhost
- **Production** : URLs de production

## Fichiers modifiés

- ✅ `src/config/environment.js` - Configuration centralisée
- ✅ `src/config/app.js` - Compatibilité avec l'ancienne config
- ✅ `src/app/api/auth/cas/callback/route.js` - URLs dynamiques
- ✅ `src/lib/api-service.js` - API dynamique

## Utilisation

```javascript
import { ENV_CONFIG } from '@/config/environment';

// URLs automatiques selon l'environnement
const apiUrl = ENV_CONFIG.API_BASE_URL;
const dashboardUrl = ENV_CONFIG.getDashboardUrl();

// URLs CAS (automatiques ou manuelles)
const casLoginUrl = ENV_CONFIG.getCasLoginDirectUrl();
const casCallbackUrl = ENV_CONFIG.getCasCallbackDirectUrl();
const casWithService = ENV_CONFIG.getCasLoginUrl(serviceUrl);

// URL Dashboard (automatique ou manuelle)
const dashboardDirectUrl = ENV_CONFIG.getDashboardDirectUrl();
```

## Exemples d'usage

### 🚀 **Configuration simple (automatique)**
```bash
NEXT_PUBLIC_CAS_LOGIN_URL=https://login.insa-lyon.fr/cas
NEXT_PUBLIC_CAS_LOGIN_DIRECT_URL=
NEXT_PUBLIC_CAS_CALLBACK_DIRECT_URL=
```
→ Génère : `https://login.insa-lyon.fr/cas/login` et `http://localhost:3001/api/auth/cas/callback`

### 🎯 **Configuration personnalisée**
```bash
NEXT_PUBLIC_CAS_LOGIN_URL=https://login.insa-lyon.fr/cas
NEXT_PUBLIC_CAS_LOGIN_DIRECT_URL=https://custom-cas.insa-lyon.fr/auth
NEXT_PUBLIC_CAS_CALLBACK_DIRECT_URL=https://app.example.com/auth/callback
NEXT_PUBLIC_DASHBOARD_DIRECT_URL=https://admin.example.com/dashboard
```
→ Utilise : URLs personnalisées spécifiées

### 🔀 **Configuration mixte**
```bash
NEXT_PUBLIC_CAS_LOGIN_URL=https://login.insa-lyon.fr/cas
NEXT_PUBLIC_CAS_LOGIN_DIRECT_URL=
NEXT_PUBLIC_CAS_CALLBACK_DIRECT_URL=
NEXT_PUBLIC_DASHBOARD_DIRECT_URL=https://custom-dashboard.example.com
```
→ CAS automatique + Dashboard personnalisé 