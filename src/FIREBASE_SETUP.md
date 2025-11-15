# 🚀 Configuration Firebase - Guide Rapide

## 1. Accéder à Firebase Console

1. Aller sur [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Sélectionner votre projet **"BattleWeb"**

## 2. Activer Authentication

1. Dans le menu gauche : **Authentication**
2. Onglet **"Sign-in method"**
3. Activer **"Email/Password"**
4. Sauvegarder

## 3. Configurer Firestore

1. Dans le menu gauche : **Firestore Database**
2. Cliquer **"Créer une base de données"**
3. Choisir **"Commencer en mode test"** (pour développement)
4. Sélectionner une région (ex: `europe-west1`)
5. Terminer

## 4. Configurer Realtime Database

1. Dans le menu gauche : **Realtime Database**
2. Cliquer **"Créer une base de données"**
3. Choisir **"Commencer en mode test"**
4. Sélectionner une région (même que Firestore)
5. Terminer

## 5. Obtenir les clés API

1. Dans le menu gauche : **Project Settings** (icône ⚙️)
2. Onglet **"General"**
3. Section **"Your apps"**
4. Cliquer sur l'app Web (icône `</>`) si elle existe, sinon :
   - Cliquer **"Add app"**
   - Choisir **Web** (`</>`)
   - Nommer l'app : "BattleWeb Web App"
   - **COCHER** "Also set up Firebase Hosting" (optionnel mais recommandé)
   - Terminer

5. Dans la section **"SDK setup and configuration"**, copier la config JavaScript

```
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiHzosm4MWc1zMENAKrmaB9HNsrMvtICU",
  authDomain: "battleweb-77067.firebaseapp.com",
  databaseURL: "https://battleweb-77067-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "battleweb-77067",
  storageBucket: "battleweb-77067.firebasestorage.app",
  messagingSenderId: "860367319048",
  appId: "1:860367319048:web:6c994d604e3d10861561bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
```

## 6. Configurer les variables d'environnement

1. Créer le fichier `.env.local` dans le dossier `src/` :
   ```bash
   cp firebase-config.example.ts .env.local
   ```

2. Remplacer les valeurs par celles de votre config Firebase :

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC... (votre clé)
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
   ```

## 7. Tester la connexion

1. Lancer l'application :
   ```bash
   npm run dev
   ```

2. Aller sur [http://localhost:3000](http://localhost:3000)

3. Tester l'inscription/connexion

## 🔧 Dépannage

### Erreur "PROJECT_NOT_FOUND"
- Vérifier que le project ID dans `.env.local` correspond exactement à celui dans Firebase Console

### Erreur "INVALID_API_KEY"
- Vérifier que la clé API est correctement copiée (elle commence par "AIzaSy")

### Erreur "PERMISSION_DENIED"
- Vérifier que Firestore/Realtime DB sont en mode "test"
- Vérifier les Security Rules (elles devraient accepter tout en mode test)

### Application ne se lance pas
- Vérifier que toutes les variables d'environnement sont définies
- Vérifier qu'il n'y a pas d'espaces ou de caractères spéciaux

## 📋 Checklist de validation

- [ ] Projet Firebase créé ✅
- [ ] Authentication activée (Email/Password) ✅
- [ ] Firestore configuré ✅
- [ ] Realtime Database configuré ✅
- [ ] Clés API copiées dans `.env.local` ⏳
- [ ] Application se lance sans erreur ⏳
- [ ] Inscription fonctionne ⏳
- [ ] Connexion fonctionne ⏳

---

**Une fois configuré, dites-moi si ça fonctionne !** 🎉
