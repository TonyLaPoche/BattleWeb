import { realtimeDb } from '@/lib/firebase';
import { ref, set, onValue, off, onDisconnect } from 'firebase/database';
import { Presence, FriendStatus } from '@/types/friends';

// Mettre à jour le statut de présence
export function updatePresence(
  userId: string, 
  status: FriendStatus, 
  gameId?: string
): void {
  if (!realtimeDb) {
    console.warn('Realtime Database non initialisé');
    return;
  }

  const presenceRef = ref(realtimeDb, `presence/${userId}`);
  
  // Construire l'objet presence sans inclure currentGameId si undefined
  const presence: any = {
    status,
    lastSeen: Date.now(),
  };
  
  // Ajouter currentGameId seulement s'il est défini
  if (gameId) {
    presence.currentGameId = gameId;
  }

  set(presenceRef, presence);

  // Quand l'utilisateur se déconnecte, mettre le statut à offline
  onDisconnect(presenceRef).set({
    status: 'offline',
    lastSeen: Date.now(),
  });
}

// Écouter le statut de présence d'un utilisateur
export function subscribeToPresence(
  userId: string,
  callback: (presence: Presence | null) => void
): () => void {
  if (!realtimeDb) {
    console.warn('Realtime Database non initialisé');
    return () => {};
  }

  const presenceRef = ref(realtimeDb, `presence/${userId}`);
  
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val();
    callback(data as Presence | null);
  });

  return () => {
    off(presenceRef);
    unsubscribe();
  };
}

// Écouter le statut de présence d'un ami
export function subscribeToFriendPresence(
  friendId: string,
  callback: (presence: Presence | null) => void
): () => void {
  return subscribeToPresence(friendId, callback);
}

// Obtenir le statut de présence actuel (sans subscription)
export async function getPresence(userId: string): Promise<Presence | null> {
  if (!realtimeDb) {
    return null;
  }

  return new Promise((resolve) => {
    const presenceRef = ref(realtimeDb, `presence/${userId}`);
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      unsubscribe();
      resolve(data as Presence | null);
    }, {
      onlyOnce: true,
    });
  });
}

// Mettre le statut à "en ligne"
export function setOnline(userId: string): void {
  updatePresence(userId, 'online');
}

// Mettre le statut à "hors ligne"
export function setOffline(userId: string): void {
  updatePresence(userId, 'offline');
}

// Mettre le statut à "en partie"
export function setInGame(userId: string, gameId: string): void {
  updatePresence(userId, 'in-game', gameId);
}

