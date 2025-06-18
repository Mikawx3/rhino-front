# LeRhino - Plateforme d'apprentissage intelligente

## 🎯 Description

LeRhino est une application frontend moderne développée avec Next.js, conçue pour aider les étudiants à améliorer leur apprentissage grâce à des questions personnalisées générées par IA. Les étudiants peuvent s'abonner à des cours et recevoir automatiquement des questions adaptées par email.

## ✨ Fonctionnalités

### 🔐 Authentification
- Page de connexion avec authentification universitaire sécurisée
- Redirection vers le système d'authentification de l'université
- Gestion automatique des comptes étudiants

### 📊 Dashboard
- Vue d'ensemble des cours suivis
- Statistiques en temps réel (cours actifs, questions reçues, temps d'étude)
- Ajout et suppression de cours par matière
- Interface intuitive pour gérer les abonnements

### 👤 Profil Utilisateur
- Statistiques détaillées de progression
- Suivi des performances par matière
- Historique d'activité
- Système de récompenses et accomplissements
- Préférences pour les notifications email

### 📧 Système de Questions (À venir)
- Questions quotidiennes générées par IA
- Personnalisation selon le niveau et les objectifs
- Envoi automatique par email
- Suivi des réponses et de la progression

## 🛠️ Technologies Utilisées

- **Next.js 15** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **Tailwind CSS** - Framework CSS utilitaire
- **shadcn/ui** - Composants UI modernes et accessibles
- **Lucide React** - Icônes vectorielles
- **clsx** - Gestion conditionnelle des classes CSS

## 🚀 Installation et Développement

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone [url-du-repo]
cd rhino-front

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Scripts disponibles
```bash
# Développement
npm run dev

# Build de production
npm run build

# Lancer en production
npm start

# Linting
npm run lint
```

## 📱 Pages et Navigation

### Page d'Accueil (`/`)
- Landing page avec présentation de la plateforme
- Appel à l'action vers la connexion
- Aperçu des fonctionnalités principales

### Connexion (`/login`)
- Interface de connexion universitaire
- Informations de sécurité
- Redirection vers le dashboard après authentification

### Dashboard (`/dashboard`)
- Gestion des cours et abonnements
- Statistiques en temps réel
- Ajout/suppression de cours par matière
- Vue d'ensemble de l'activité

### Profil (`/profile`)
- Informations personnelles
- Statistiques détaillées de progression
- Onglets : Vue d'ensemble, Progression, Activité, Récompenses
- Préférences utilisateur

## 🎨 Design et UX

- **Design System** : Composants shadcn/ui cohérents
- **Responsive** : Interface adaptative mobile/desktop
- **Accessibilité** : Respect des standards WCAG
- **Thème** : Palette moderne en bleu/gris avec accents colorés
- **Animations** : Transitions fluides et micro-interactions

## 📦 Structure du Projet

```
src/
├── app/                    # App Router Next.js
│   ├── dashboard/         # Page dashboard
│   ├── login/            # Page connexion
│   ├── profile/          # Page profil
│   ├── page.js           # Page d'accueil
│   ├── layout.js         # Layout principal
│   └── globals.css       # Styles globaux
├── components/
│   ├── ui/               # Composants shadcn/ui
│   └── navigation.jsx    # Navigation principale
└── lib/
    └── utils.js          # Utilitaires
```

## 🔮 Roadmap

### Phase 1 (Actuelle) - Frontend Statique
- ✅ Interface utilisateur complète
- ✅ Navigation et pages principales
- ✅ Composants UI et design system

### Phase 2 - Backend et Authentification
- 🔄 Intégration authentification universitaire
- 🔄 API REST pour la gestion des cours
- 🔄 Base de données utilisateurs et progression

### Phase 3 - IA et Questions
- 🔄 Intégration IA pour génération de questions
- 🔄 Système d'email automatisé
- 🔄 Algorithmes de personnalisation

### Phase 4 - Fonctionnalités Avancées
- 🔄 Analytics et reporting
- 🔄 Système de gamification étendu
- 🔄 Collaboration entre étudiants
- 🔄 Application mobile

## 🤝 Contribution

Le projet est en développement actif. Les contributions sont les bienvenues !

### Guidelines
1. Suivre les conventions Next.js et React
2. Utiliser les composants shadcn/ui existants
3. Maintenir la cohérence du design system
4. Écrire du code accessible et responsive

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 📞 Contact

Pour toute question ou suggestion concernant le projet, n'hésitez pas à ouvrir une issue GitHub.

---

**LeRhino** - Révolutionner l'apprentissage avec l'intelligence artificielle 🎓


# Supprimer le conteneur existant
podman rm -f rhino-front

# Rebuild l'image (si besoin)
podman build -t rhino-front .

# Relancer le conteneur sur le port 3001
podman run -d --name rhino-front -p 3001:3001 rhino-front
