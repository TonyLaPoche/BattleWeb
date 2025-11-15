# Nettoyage automatique des lobbies vides

## Solution actuelle (côté client)

Le nettoyage des lobbies vides est actuellement effectué côté client :
- Appelé au chargement du dashboard
- Supprime les lobbies sans joueurs ou inactifs depuis 30 secondes

**Limitation** : Cette solution dépend des utilisateurs qui visitent le dashboard.

## Solution recommandée : Cloud Function Firebase

Pour un nettoyage automatique et fiable, il est recommandé d'utiliser une **Cloud Function Firebase** qui s'exécute périodiquement.

### Installation

1. Installer Firebase CLI :
```bash
npm install -g firebase-tools
```

2. Initialiser Firebase Functions dans le projet :
```bash
firebase init functions
```

3. Choisir TypeScript et installer les dépendances.

### Code de la Cloud Function

Créer le fichier `functions/src/index.ts` :

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Nettoyer les lobbies vides toutes les minutes
export const cleanupEmptyLobbies = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const db = admin.firestore();
    const gamesRef = db.collection('games');
    const now = Date.now();
    const THIRTY_SECONDS = 30 * 1000;

    try {
      // Récupérer tous les lobbies
      const snapshot = await gamesRef
        .where('phase', '==', 'lobby')
        .get();

      const deletePromises: Promise<void>[] = [];

      snapshot.forEach((doc) => {
        const game = doc.data();
        const players = game.players || [];
        const lastActivity = game.lastActivity || 0;

        // Supprimer si :
        // 1. Le lobby n'a pas de joueurs
        // 2. Le lobby n'a pas été actif depuis 30 secondes ET n'a pas de joueurs
        if (
          players.length === 0 ||
          (lastActivity > 0 && (now - lastActivity) > THIRTY_SECONDS && players.length === 0)
        ) {
          deletePromises.push(doc.ref.delete());
        }
      });

      await Promise.all(deletePromises);

      if (deletePromises.length > 0) {
        console.log(`Nettoyage: ${deletePromises.length} lobby(s) vide(s) supprimé(s)`);
      }

      return null;
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      return null;
    }
  });
```

### Déploiement

```bash
firebase deploy --only functions
```

### Configuration du plan Firebase

- **Spark Plan (gratuit)** : Limité, mais suffisant pour un petit projet
- **Blaze Plan (pay-as-you-go)** : Recommandé pour la production, mais reste gratuit jusqu'à un certain seuil

### Alternative : Scheduled Function avec Cloud Scheduler

Si vous préférez utiliser Cloud Scheduler directement :

1. Créer une fonction HTTP :
```typescript
export const cleanupLobbiesHttp = functions.https.onRequest(async (req, res) => {
  // Même logique que ci-dessus
  res.status(200).send('Cleanup completed');
});
```

2. Configurer Cloud Scheduler dans la console Firebase pour appeler cette fonction toutes les minutes.

## Avantages de la Cloud Function

- ✅ Nettoyage automatique sans dépendre des utilisateurs
- ✅ Exécution fiable et planifiée
- ✅ Réduction de la charge sur Firestore
- ✅ Pas de coût supplémentaire significatif pour un petit projet

