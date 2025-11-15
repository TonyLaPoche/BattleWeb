# BattleWeb - Développement

## 🚀 Démarrage rapide

### 1. Configuration Firebase

1. **Créer un projet Firebase** (vous l'avez déjà fait : "BattleWeb")

2. **Activer les services nécessaires :**
   - **Authentication** : Activer Email/Password
   - **Firestore** : Créer une base de données
   - **Realtime Database** : Créer une base de données
   - **Hosting** : (optionnel pour plus tard)

3. **Obtenir les clés API :**
   - Aller dans Project Settings > General > Your apps
   - Créer une Web App (icône `</>`)
   - Copier la configuration

4. **Créer le fichier `.env.local` :**
   ```bash
   cp .env.example .env.local
   ```
   Puis remplacer les valeurs par celles de Firebase.

### 2. Installation et lancement

```bash
# Installation (déjà fait)
npm install

# Lancement du serveur de développement
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 📋 État actuel du développement

### ✅ Implémenté
- **Configuration Firebase** (Auth, Firestore, Realtime DB)
- **Types TypeScript** complets pour le jeu
- **Stores Zustand** (Auth + Game)
- **Authentification** Email/Password
- **Pages de base** : Accueil + Dashboard
- **Composants UI** : AuthForm

### 🔄 En cours
- **Authentification fonctionnelle**

### 📝 À faire ensuite
- **Créer/rejoindre des parties**
- **Système de lobby avec chat**
- **Grille de jeu 12x12**
- **Placement des navires**
- **Logique de jeu de base**
- **Bombes de détection**
- **Synchronisation multi-joueurs**

## 🏗️ Architecture

```
src/
├── app/                    # Pages Next.js
│   ├── page.tsx           # Accueil (auth)
│   └── dashboard/         # Dashboard utilisateur
├── components/            # Composants React
│   └── auth/             # Authentification
├── hooks/                # Hooks personnalisés
├── lib/                  # Utilitaires
│   └── firebase.ts       # Config Firebase
├── stores/               # État global (Zustand)
├── types/                # Types TypeScript
└── firebase-config.example.ts  # Exemple config
```

## 🔧 Technologies utilisées

- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Firebase** pour backend temps réel
- **Zustand** pour gestion d'état

## 🎯 Fonctionnalités implémentées

### Authentification
- ✅ Inscription/Connexion Email/Password
- ✅ Gestion d'état utilisateur
- ✅ Redirections automatiques
- ✅ Gestion des erreurs

### Interface
- ✅ Design responsive mobile-first
- ✅ Dashboard utilisateur
- ✅ Formulaires d'authentification

## 🚀 Prochaines étapes

1. **Tester l'authentification** avec vos clés Firebase
2. **Implémenter la création de parties**
3. **Ajouter le système de lobby**
4. **Développer la grille de jeu**

N'hésitez pas à tester l'application actuelle et me dire si l'authentification fonctionne ! 🎮