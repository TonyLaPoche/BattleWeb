# Guide de Déploiement - BattleWeb

## 🎯 Recommandation : **Vercel** (Meilleur choix)

### Pourquoi Vercel ?
- ✅ **Gratuit** avec un plan généreux
- ✅ **Optimisé pour Next.js** (créé par les mêmes personnes)
- ✅ **Déploiement automatique** depuis GitHub
- ✅ **HTTPS automatique** et domaine gratuit `.vercel.app`
- ✅ **CDN global** pour performance optimale
- ✅ **Variables d'environnement** faciles à configurer
- ✅ **Preview deployments** pour chaque PR
- ✅ **Pas de configuration complexe** nécessaire

### Déploiement sur Vercel (5 minutes)

1. **Préparer le projet**
   ```bash
   # S'assurer que tout fonctionne en local
   npm run build
   ```

2. **Pousser sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE_USERNAME/BattleWeb.git
   git push -u origin main
   ```

3. **Déployer sur Vercel**
   - Aller sur [vercel.com](https://vercel.com)
   - Se connecter avec GitHub
   - Cliquer sur "New Project"
   - Importer le repository BattleWeb
   - Vercel détecte automatiquement Next.js
   - **Ajouter les variables d'environnement** :
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=...
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
     NEXT_PUBLIC_FIREBASE_APP_ID=...
     NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
     ```
   - Cliquer sur "Deploy"
   - ✅ Votre app est en ligne sur `battleweb.vercel.app` (ou un nom similaire)

### Avantages Vercel
- Déploiement en ~2 minutes
- Mise à jour automatique à chaque push
- Analytics intégrés
- Support excellent

---

## 🔥 Alternative : Firebase Hosting

### Pourquoi Firebase Hosting ?
- ✅ **Gratuit** (10 Go de stockage, 360 MB/jour de bande passante)
- ✅ **Intégration native** avec Firebase
- ✅ **HTTPS automatique**
- ✅ **CDN global**
- ⚠️ **Nécessite une configuration** pour Next.js (export statique ou fonctions)

### Déploiement sur Firebase Hosting

#### Option 1 : Export statique (Recommandé pour votre cas)

1. **Installer Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Configurer Next.js pour export statique**
   Modifier `next.config.ts` :
   ```typescript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };
   ```

3. **Initialiser Firebase**
   ```bash
   firebase init hosting
   # Choisir "Use an existing project"
   # Public directory: out (ou .next/out selon votre config)
   # Single-page app: No
   # Set up automatic builds: No
   ```

4. **Build et déployer**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

#### Option 2 : Next.js avec Firebase Functions (Plus complexe)

Nécessite de configurer Firebase Functions pour le SSR. Plus complexe mais plus flexible.

### Avantages Firebase Hosting
- Même écosystème que votre backend
- Facile si vous utilisez déjà Firebase
- Bon pour les apps statiques

### Inconvénients
- Configuration plus complexe pour Next.js
- Export statique = pas de SSR/API routes
- Moins optimisé que Vercel pour Next.js

---

## ❌ GitHub Pages - Non recommandé

### Pourquoi ça ne fonctionne pas bien ?
- ❌ **Pas de support SSR** (Server-Side Rendering)
- ❌ **Pas d'API routes** Next.js
- ❌ **Nécessite export statique** uniquement
- ❌ **Pas de variables d'environnement** côté serveur
- ❌ **Configuration complexe** pour Next.js

**Conclusion** : Évitez GitHub Pages pour Next.js.

---

## 📊 Comparaison rapide

| Critère | Vercel | Firebase Hosting | GitHub Pages |
|---------|--------|------------------|--------------|
| **Gratuit** | ✅ Oui | ✅ Oui | ✅ Oui |
| **Next.js optimisé** | ✅✅✅ Excellent | ⚠️ Moyen | ❌ Non |
| **Facilité déploiement** | ✅✅✅ Très facile | ⚠️ Moyen | ❌ Difficile |
| **SSR/API routes** | ✅ Oui | ⚠️ Avec config | ❌ Non |
| **HTTPS** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Domaine gratuit** | ✅ .vercel.app | ✅ .web.app | ✅ .github.io |
| **CDN** | ✅ Global | ✅ Global | ⚠️ Limité |
| **Intégration Firebase** | ✅ Facile | ✅✅ Native | ⚠️ Possible |

---

## 🎯 Ma recommandation finale

### **Utilisez Vercel** pour :
1. **Simplicité** : Déploiement en 2 minutes
2. **Performance** : Optimisé pour Next.js
3. **Gratuit** : Plan gratuit généreux
4. **Workflow** : Déploiement automatique depuis GitHub

### **Utilisez Firebase Hosting** si :
- Vous voulez tout centraliser sur Firebase
- Vous avez besoin de fonctions serverless Firebase
- Vous préférez l'écosystème Firebase complet

---

## 🚀 Étapes suivantes (Vercel)

1. Créer un compte sur [vercel.com](https://vercel.com)
2. Connecter votre compte GitHub
3. Importer le projet
4. Ajouter les variables d'environnement Firebase
5. Déployer !

Votre app sera accessible sur `https://battleweb-xxx.vercel.app` (ou un nom personnalisé).

---

## 📝 Note sur les domaines personnalisés

Même sans nom de domaine :
- Vercel : `battleweb.vercel.app` (gratuit)
- Firebase : `battleweb.web.app` (gratuit)

Vous pourrez ajouter un domaine personnalisé plus tard si besoin (gratuit aussi sur Vercel).

