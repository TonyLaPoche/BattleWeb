import { realtimeDb } from '@/lib/firebase';
import { ref, set, onValue, off, remove, push } from 'firebase/database';
import { getPresence } from './presenceService';

export interface GameInvitation {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: number;
  respondedAt?: number;
  gameId?: string; // ID de la partie créée si acceptée
}

// Envoyer une invitation à jouer
export async function sendGameInvitation(
  fromUserId: string,
  fromUsername: string,
  toUserId: string
): Promise<string> {
  if (!realtimeDb) {
    throw new Error('Realtime Database non initialisé');
  }

  // Vérifier que le joueur invité n'est pas déjà en partie
  const toUserPresence = await getPresence(toUserId);
  if (toUserPresence?.status === 'in-game') {
    throw new Error('Ce joueur est déjà en partie');
  }

  const invitationsRef = ref(realtimeDb, `gameInvitations/${toUserId}`);
  const newInvitationRef = push(invitationsRef);

  const invitation: GameInvitation = {
    id: newInvitationRef.key!,
    fromUserId,
    fromUsername,
    toUserId,
    status: 'pending',
    createdAt: Date.now(),
  };

  await set(newInvitationRef, invitation);

  // Supprimer automatiquement l'invitation après 30 secondes si elle n'a pas été répondue
  setTimeout(async () => {
    const invitationRef = ref(realtimeDb, `gameInvitations/${toUserId}/${invitation.id}`);
    const snapshot = await new Promise<any>((resolve) => {
      onValue(invitationRef, resolve, { onlyOnce: true });
    });
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data.status === 'pending') {
        // Marquer comme expirée
        await set(invitationRef, {
          ...data,
          status: 'expired',
          respondedAt: Date.now(),
        });
        
        // Supprimer après 5 secondes
        setTimeout(() => {
          remove(invitationRef);
        }, 5000);
      }
    }
  }, 30000);

  return invitation.id;
}

// Accepter une invitation
export async function acceptGameInvitation(
  toUserId: string,
  invitationId: string,
  gameId?: string
): Promise<void> {
  if (!realtimeDb) {
    throw new Error('Realtime Database non initialisé');
  }

  const invitationRef = ref(realtimeDb, `gameInvitations/${toUserId}/${invitationId}`);
  
  // Lire l'invitation actuelle
  const snapshot = await new Promise<any>((resolve) => {
    onValue(invitationRef, resolve, { onlyOnce: true });
  });

  if (!snapshot.exists()) {
    throw new Error('Invitation introuvable');
  }

  const invitation = snapshot.val() as GameInvitation;

  if (invitation.status !== 'pending') {
    throw new Error('Cette invitation a déjà été traitée');
  }

  // Mettre à jour le statut avec l'ID de la partie si fourni
  const updatedInvitation: GameInvitation = {
    ...invitation,
    status: 'accepted',
    respondedAt: Date.now(),
  };
  
  if (gameId) {
    updatedInvitation.gameId = gameId;
  }

  await set(invitationRef, updatedInvitation);

  // Supprimer après 10 secondes pour laisser le temps à l'inviteur de récupérer l'ID de la partie
  setTimeout(() => {
    remove(invitationRef);
  }, 10000);
}

// Refuser une invitation
export async function rejectGameInvitation(
  toUserId: string,
  invitationId: string
): Promise<void> {
  if (!realtimeDb) {
    throw new Error('Realtime Database non initialisé');
  }

  const invitationRef = ref(realtimeDb, `gameInvitations/${toUserId}/${invitationId}`);
  
  // Lire l'invitation actuelle
  const snapshot = await new Promise<any>((resolve) => {
    onValue(invitationRef, resolve, { onlyOnce: true });
  });

  if (!snapshot.exists()) {
    throw new Error('Invitation introuvable');
  }

  const invitation = snapshot.val() as GameInvitation;

  if (invitation.status !== 'pending') {
    throw new Error('Cette invitation a déjà été traitée');
  }

  // Mettre à jour le statut
  await set(invitationRef, {
    ...invitation,
    status: 'rejected',
    respondedAt: Date.now(),
  });

  // Supprimer après 5 secondes
  setTimeout(() => {
    remove(invitationRef);
  }, 5000);
}

// S'abonner aux invitations reçues
export function subscribeToGameInvitations(
  userId: string,
  callback: (invitations: GameInvitation[]) => void
): () => void {
  if (!realtimeDb) {
    console.warn('Realtime Database non initialisé');
    return () => {};
  }

  const invitationsRef = ref(realtimeDb, `gameInvitations/${userId}`);

  const unsubscribe = onValue(invitationsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const invitations: GameInvitation[] = Object.keys(data)
      .map(key => ({
        ...data[key],
        id: key,
      }))
      .filter((inv: GameInvitation) => inv.status === 'pending')
      .sort((a: GameInvitation, b: GameInvitation) => b.createdAt - a.createdAt);

    callback(invitations);
  });

  return () => {
    off(invitationsRef);
  };
}

// S'abonner aux réponses d'invitations envoyées
export function subscribeToInvitationResponse(
  fromUserId: string,
  toUserId: string,
  invitationId: string,
  callback: (status: 'accepted' | 'rejected' | 'expired', gameId?: string) => void
): () => void {
  if (!realtimeDb) {
    console.warn('Realtime Database non initialisé');
    return () => {};
  }

  const invitationRef = ref(realtimeDb, `gameInvitations/${toUserId}/${invitationId}`);

  const unsubscribe = onValue(invitationRef, (snapshot) => {
    if (!snapshot.exists()) {
      return;
    }

    const invitation = snapshot.val() as GameInvitation;
    
    if (invitation.status !== 'pending') {
      callback(invitation.status, invitation.gameId);
      // Se désabonner après avoir reçu la réponse
      setTimeout(() => {
        off(invitationRef);
      }, 1000);
    }
  });

  return () => {
    off(invitationRef);
  };
}

