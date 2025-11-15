# 🎯 Prochaines étapes de développement

## ✅ Ce qui est fait

1. **Authentification** : Création de compte, connexion, déconnexion
2. **Dashboard** : Créer/rejoindre une partie
3. **Lobby** : Chat en temps réel, liste des joueurs, paramètres admin
4. **Placement des navires** : Grille 12x12, placement manuel/automatique, sauvegarde Firebase

## 🚀 Prochaines étapes

### 1. **Page de jeu** (`/game/[gameId]`)
   - Afficher les grilles des adversaires (masquées)
   - Système de tir (cliquer sur une case)
   - Indicateur de tour actif
   - Affichage des résultats de tir (touché/coulé/raté)
   - Gestion de la victoire/défaite

### 2. **Logique de jeu**
   - Vérifier si un navire est touché/coulé
   - Gérer le changement de tour
   - Détecter la fin de partie (un seul joueur vivant)
   - Synchronisation temps réel entre joueurs

### 3. **Bombes de détection**
   - Permettre de placer une bombe (1 par joueur)
   - Timer de 2 tours avant activation
   - Option de désamorçage (perd un tour)
   - Révélation 5x5 si non désamorcée
   - Révélation aléatoire si désamorcée

### 4. **Améliorations UX**
   - Animations de tir
   - Sons (optionnel)
   - Indicateurs visuels pour les bombes
   - Historique des tirs

### 5. **PWA**
   - Service Worker
   - Manifest.json
   - Installation sur mobile

## 📝 Pour tester maintenant

1. **Créer une partie** :
   - Aller sur `/dashboard`
   - Cliquer sur "Créer une partie"
   - Noter le code de la partie

2. **Rejoindre avec un autre compte** :
   - Ouvrir un onglet privé
   - Se connecter avec un autre compte
   - Aller sur `/dashboard`
   - Entrer le code et rejoindre

3. **Tester le lobby** :
   - Vérifier que les deux joueurs apparaissent
   - Tester le chat
   - L'admin peut lancer la partie

4. **Tester le placement** :
   - Placer les navires
   - Valider le placement
   - Vérifier que ça sauvegarde dans Firebase

## 🔧 Commandes utiles

```bash
# Démarrer le serveur
npm run dev

# Vérifier les erreurs TypeScript
npm run type-check

# Build de production
npm run build
```

## 🐛 Points à vérifier

- [ ] Les règles Firestore permettent la lecture/écriture pour les utilisateurs authentifiés
- [ ] Realtime Database est activé dans Firebase
- [ ] Les variables d'environnement sont correctement configurées
- [ ] Le placement des navires se synchronise entre les joueurs

## 📚 Documentation utile

- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
