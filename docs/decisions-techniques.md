# Décisions Techniques à Prendre

## Questions Ouvertes

### Architecture Backend

#### Firebase vs Backend Custom
**Question** : Faut-il utiliser Firebase pour rapidité ou développer un backend Node.js personnalisé ?

**Options :**
1. **Firebase complet** (recommandé)
   - Auth, DB, Hosting, Functions
   - Développement 2x plus rapide
   - Coûts initiaux faibles
   - Évolutivité gérée

2. **Backend Node.js + MongoDB**
   - Contrôle total
   - + Socket.io pour temps réel
   - Migration facile
   - Plus de configuration

3. **Hybride**
   - Firebase pour Auth/DB
   - Backend custom pour logique métier

**Décision recommandée** : Firebase pour MVP, migration possible plus tard

### Gestion d'État Frontend

#### Quel système d'état global ?
**Question** : Comment gérer l'état complexe du jeu (grilles, tours, joueurs multiples) ?

**Options :**
1. **Redux Toolkit + RTK Query**
   - Standard de l'industrie
   - Outils de développement riches
   - Middleware pour API

2. **Zustand**
   - Plus léger que Redux
   - API simple
   - Types TypeScript excellents

3. **React Context + useReducer**
   - Zero dépendance
   - Intégré à React
   - Suffisant pour état modéré

**Décision recommandée** : Zustand pour simplicité, Redux si équipe expérimentée

### Communication Temps Réel

#### Protocole pour le multi-joueurs
**Question** : Comment implémenter les parties synchronisées ?

**Options :**
1. **Firebase Realtime Database**
   - Synchronisation automatique
   - Offline-first
   - Évolutif

2. **Firestore avec listeners**
   - Requêtes riches
   - Structure de données flexible
   - Moins adapté au temps réel pur

3. **WebSockets (Socket.io)**
   - Contrôle total des événements
   - Performance optimale
   - Gestion manuelle des connexions

**Décision recommandée** : Firebase Realtime pour démarrage, WebSockets si besoin de performance

### Interface Utilisateur

#### Framework UI
**Question** : Bibliothèque de composants ou composants custom ?

**Options :**
1. **Tailwind + Headless UI**
   - Contrôle total du design
   - Bundle size optimisé
   - Cohérence parfaite

2. **Material-UI / Mantine**
   - Composants prêts à l'emploi
   - Développement rapide
   - Thème cohérent

3. **Custom components**
   - Design unique
   - Apprentissage nécessaire
   - Maintenance

**Décision recommandée** : Tailwind + composants custom pour design unique

### Performance Mobile

#### Optimisations PWA
**Question** : Prioriser quelles optimisations ?

**Options :**
- Code splitting par route
- Virtual scrolling pour grilles
- Service worker avancé
- Compression d'images
- CDN pour assets

**Décision recommandée** : Toutes, par ordre de priorité : code splitting → service worker → virtual scrolling

## Décisions Techniques Prises

### ✅ Décidé : Stack Technologique

**Frontend :**
- React 18 + TypeScript
- Next.js pour PWA
- Tailwind CSS
- Framer Motion pour animations

**Backend :**
- Firebase (Auth, Firestore, Functions, Hosting)
- Firestore pour données persistantes
- Realtime Database pour synchronisation jeu

**Outils :**
- ESLint + Prettier
- Jest + React Testing Library
- Husky pour pre-commit hooks

### ✅ Décidé : Structure des Données

**Firestore Collections :**
```
users/{userId}
games/{gameId}
game_moves/{gameId}/moves/{moveId}
lobbies/{lobbyId}
```

**Temps réel :**
- `/games/{gameId}/currentPlayer`
- `/games/{gameId}/gameState`
- `/games/{gameId}/chat`

### ✅ Décidé : Gestion d'État

**Global State :**
- Zustand pour état jeu
- React Context pour auth utilisateur
- Local state pour composants UI

**Synchronisation :**
- Firebase listeners pour mises à jour temps réel
- Optimistic updates pour UX fluide
- Rollback automatique en cas d'erreur

### ✅ Décidé : Authentification

**Méthodes supportées :**
- Email/password (primaire)
- Google OAuth
- Apple Sign-In (iOS)
- Anonymous (démos)

**Sécurité :**
- Firebase Security Rules strictes
- Validation côté client ET serveur
- Rate limiting sur les actions sensibles

## Questions à Résoudre

### Gameplay Balance

#### Taille des grilles
**Question** : Quelle taille de grille pour le fun/stratégie équilibré ?
- **10x10** : Classique, rapide (5-10 min)
- **15x15** : Plus stratégique, plus long (15-30 min)
- **Variable** : Choix du créateur de partie

#### Ratio Bombes/Missiles
**Question** : Combien de bombes par partie ?
- **Illimité** : Stratégie risquée
- **Limité (3-5)** : Ressource précieuse
- **Recharge** : 1 tous les X tours

#### Zone de révélation
**Question** : Taille de la zone 9x9 appropriée ?
- **9x9 (81 cases)** : Très révélateur
- **7x7 (49 cases)** : Modéré
- **5x5 (25 cases)** : Limité

### Multi-joueurs Avancé

#### Gestion des déconnexions
**Question** : Que faire si un joueur se déconnecte ?
- **Pause automatique** : Attendre reconnection (timeout 5min)
- **Remplacement IA** : Bot temporaire
- **Abandon** : Joueur éliminé

#### Alliances temporaires
**Question** : Permettre les alliances en multi-joueurs ?
- **Non (v1)** : Chacun pour soi
- **Temporaires** : Pacts de non-agression
- **Permanentes** : Équipes fixes

### Monétisation

#### Modèle économique
**Question** : Freemium, pay-to-win, ou gratuit ?
- **Freemium** : Base gratuite, cosmétiques payants
- **Gratuit complet** : Ads + donations
- **Premium** : Abonnement pour features avancées

#### Features Premium
- Skins de grille/navires
- Statistiques avancées
- Mode spectateur
- Parties privées illimitées

### Analytics et Métriques

#### KPIs à suivre
- **Utilisation** : DAU, session time, retention
- **Gameplay** : Win rate, game duration, moves per game
- **Technical** : Load times, error rates, crashes

#### Outils
- Firebase Analytics (gratuit)
- Mixpanel ou Amplitude (payant)
- Custom events pour gameplay

## Prochaines Étapes

1. **Réunir feedback** sur ces décisions
2. **Créer prototypes** pour valider les choix
3. **Setup du projet** avec la stack décidée
4. **Développement itératif** basé sur les user stories prioritaires
