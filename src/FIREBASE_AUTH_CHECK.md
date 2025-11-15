# 🔍 Vérification Firebase Authentication

## Erreur 400 lors de la création de compte

Si vous obtenez une erreur 400, vérifiez ces points :

### 1. ✅ Activer Email/Password dans Firebase Console

1. Aller sur [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Sélectionner votre projet **"BattleWeb"**
3. Menu gauche : **Authentication**
4. Onglet **"Sign-in method"**
5. Cliquer sur **"Email/Password"**
6. **Activer** le premier toggle (Email/Password)
7. **Sauvegarder**

### 2. ✅ Vérifier les règles de sécurité

**Firestore :**
- Aller dans **Firestore Database** > **Rules**
- Pour le développement, utilisez :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Realtime Database :**
- Aller dans **Realtime Database** > **Rules**
- Pour le développement, utilisez :
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### 3. ✅ Vérifier les variables d'environnement

Assurez-vous que `.env.local` contient bien toutes les clés Firebase :
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- etc.

### 4. ✅ Tester avec un email valide

- Email doit être au format valide : `exemple@email.com`
- Mot de passe minimum 6 caractères
- Pas d'espaces dans l'email

### 5. ✅ Messages d'erreur améliorés

Le code a été mis à jour pour afficher des messages d'erreur plus clairs :
- "Cet email est déjà utilisé" → L'utilisateur existe déjà
- "Email invalide" → Format incorrect
- "Le mot de passe est trop faible" → Moins de 6 caractères
- "Email ou mot de passe incorrect" → Erreur de connexion

## 🐛 Bug corrigé

**Problème** : Le formulaire utilisait `mode` (prop initiale) au lieu de `currentMode` (état actuel)
**Solution** : Utilisation de `currentMode` dans `handleSubmit`

Maintenant, quand vous cliquez sur "Créer un compte", le formulaire utilise bien la fonction `register()` au lieu de `login()`.

## 🧪 Test

1. Vider le cache du navigateur
2. Aller sur [http://localhost:3000](http://localhost:3000)
3. Cliquer sur "Créer un compte"
4. Entrer un email valide et un mot de passe (6+ caractères)
5. Cliquer sur "S'inscrire"

Si ça ne fonctionne toujours pas, vérifiez la console du navigateur pour voir le message d'erreur exact.
