import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  limit,
  addDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { Friend, FriendRequest, FriendsCollection, FriendStatus } from '@/types/friends';
import { UserProfile } from './userService';
import { subscribeToFriendPresence, getPresence } from './presenceService';

// Obtenir la collection d'amis d'un utilisateur
// Note: La collection est créée automatiquement lors de l'inscription
// Pour les anciens utilisateurs, elle sera créée à la première utilisation
async function getFriendsCollection(userId: string): Promise<FriendsCollection> {
  const friendsRef = doc(db, 'friends', userId);

  try {
    const friendsDoc = await getDoc(friendsRef);

    if (!friendsDoc.exists()) {
      // Pour les anciens utilisateurs, créer la collection à la première utilisation
      const newCollection: FriendsCollection = {
        userId,
        friends: [],
        pendingSent: [],
        pendingReceived: [],
        blocked: [],
        updatedAt: Date.now(),
      };

      try {
        await setDoc(friendsRef, newCollection);
        return newCollection;
      } catch (error: any) {
        // Si la création échoue (permissions), retourner une collection vide en mémoire
        // L'utilisateur devra attendre que le propriétaire crée sa collection
        return newCollection;
      }
    }

    return friendsDoc.data() as FriendsCollection;
  } catch (error: any) {
    throw error;
  }
}

// Rechercher des utilisateurs par nom d'utilisateur
export async function searchUsers(searchQuery: string, currentUserId: string): Promise<UserProfile[]> {
  if (!searchQuery || searchQuery.trim().length < 2) {
    return [];
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('username', '>=', searchQuery.trim()),
      where('username', '<=', searchQuery.trim() + '\uf8ff'),
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    const users: UserProfile[] = [];
    
    snapshot.forEach((doc) => {
      const userData = doc.data() as UserProfile;
      // Exclure l'utilisateur actuel
      if (doc.id !== currentUserId) {
        users.push({ ...userData, id: doc.id });
      }
    });
    
    return users;
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs:', error);
    return [];
  }
}

// Envoyer une demande d'ami
export async function sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
  if (fromUserId === toUserId) {
    throw new Error('Vous ne pouvez pas vous ajouter vous-même comme ami');
  }

  try {
    // Vérifier que les utilisateurs existent
    const [fromUserDoc, toUserDoc] = await Promise.all([
      getDoc(doc(db, 'users', fromUserId)),
      getDoc(doc(db, 'users', toUserId)),
    ]);

    if (!fromUserDoc.exists() || !toUserDoc.exists()) {
      throw new Error('Utilisateur introuvable');
    }

    const fromUser = fromUserDoc.data() as UserProfile;
    const toUser = toUserDoc.data() as UserProfile;

    // Vérifier qu'ils ne sont pas déjà amis
    const fromFriends = await getFriendsCollection(fromUserId);
    const toFriends = await getFriendsCollection(toUserId);

    if (fromFriends.friends.some(f => f.userId === toUserId)) {
      throw new Error('Vous êtes déjà amis avec cet utilisateur');
    }

    // Vérifier qu'il n'y a pas déjà une demande en attente
    if (fromFriends.pendingSent.includes(toUserId) || toFriends.pendingReceived.includes(fromUserId)) {
      throw new Error('Une demande d\'ami est déjà en attente');
    }

    // Vérifier qu'ils ne sont pas bloqués
    if (fromFriends.blocked.includes(toUserId) || toFriends.blocked.includes(fromUserId)) {
      throw new Error('Cette action n\'est pas possible');
    }

    // Créer la demande d'ami
    const requestRef = await addDoc(collection(db, 'friendRequests'), {
      fromUserId,
      fromUsername: fromUser.username,
      toUserId,
      toUsername: toUser.username,
      status: 'pending',
      createdAt: Date.now(),
    });

    // Mettre à jour les collections d'amis
    try {
      await updateDoc(doc(db, 'friends', fromUserId), {
        pendingSent: arrayUnion(toUserId),
        updatedAt: Date.now(),
      });
    } catch (error: any) {
      throw error;
    }

    try {
      await updateDoc(doc(db, 'friends', toUserId), {
        pendingReceived: arrayUnion(fromUserId),
        updatedAt: Date.now(),
      });
    } catch (error: any) {
      throw error;
    }

  } catch (error: any) {
    throw error;
  }
}

// Accepter une demande d'ami
export async function acceptFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
  // Trouver la demande
  const requestsRef = collection(db, 'friendRequests');
  const q = query(
    requestsRef,
    where('fromUserId', '==', fromUserId),
    where('toUserId', '==', toUserId),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error('Demande d\'ami introuvable');
  }

  const requestDoc = snapshot.docs[0];
  const requestData = requestDoc.data() as FriendRequest;

  // Obtenir les profils des deux utilisateurs
  const [fromUserDoc, toUserDoc] = await Promise.all([
    getDoc(doc(db, 'users', fromUserId)),
    getDoc(doc(db, 'users', toUserId)),
  ]);

  if (!fromUserDoc.exists() || !toUserDoc.exists()) {
    throw new Error('Utilisateur introuvable');
  }

  const fromUser = fromUserDoc.data() as UserProfile;
  const toUser = toUserDoc.data() as UserProfile;

  // Obtenir la présence actuelle
  const fromPresence = await getPresence(fromUserId);
  const toPresence = await getPresence(toUserId);

  // Créer les objets Friend (sans inclure currentGameId si undefined)
  const fromFriend: any = {
    userId: fromUserId,
    username: fromUser.username,
    status: fromPresence?.status || 'offline',
    addedAt: Date.now(),
  };
  
  // Ajouter currentGameId seulement s'il est défini
  if (fromPresence?.currentGameId) {
    fromFriend.currentGameId = fromPresence.currentGameId;
  }

  const toFriend: any = {
    userId: toUserId,
    username: toUser.username,
    status: toPresence?.status || 'offline',
    addedAt: Date.now(),
  };
  
  // Ajouter currentGameId seulement s'il est défini
  if (toPresence?.currentGameId) {
    toFriend.currentGameId = toPresence.currentGameId;
  }

  // Mettre à jour la demande
  await updateDoc(requestDoc.ref, {
    status: 'accepted',
    respondedAt: Date.now(),
  });


  // Obtenir les collections actuelles pour vérifier et mettre à jour
  const [fromFriendsDoc, toFriendsDoc] = await Promise.all([
    getDoc(doc(db, 'friends', fromUserId)),
    getDoc(doc(db, 'friends', toUserId)),
  ]);

  if (!fromFriendsDoc.exists() || !toFriendsDoc.exists()) {
    throw new Error('Collection d\'amis introuvable');
  }

  const fromFriendsData = fromFriendsDoc.data() as FriendsCollection;
  const toFriendsData = toFriendsDoc.data() as FriendsCollection;

  // Vérifier si l'ami n'est pas déjà dans la liste
  const fromFriendsList = fromFriendsData.friends || [];
  const toFriendsList = toFriendsData.friends || [];

  const fromAlreadyHasFriend = fromFriendsList.some(f => f.userId === toUserId);
  const toAlreadyHasFriend = toFriendsList.some(f => f.userId === fromUserId);

  // Mettre à jour les collections d'amis
  // Utiliser une approche de mise à jour directe du tableau pour éviter les problèmes avec arrayUnion
  const updatePromises: Promise<void>[] = [];

  // Mettre à jour la collection de fromUserId
  if (!fromAlreadyHasFriend) {
    const updatedFromFriends = [...fromFriendsList, toFriend];
    const updatedFromPendingSent = (fromFriendsData.pendingSent || []).filter(id => id !== toUserId);
    
    updatePromises.push(
      updateDoc(doc(db, 'friends', fromUserId), {
        friends: updatedFromFriends,
        pendingSent: updatedFromPendingSent,
        updatedAt: Date.now(),
      }).catch((error: any) => {
        throw error;
      })
    );
  } else {
    // Si déjà ami, juste retirer de pendingSent
    const updatedFromPendingSent = (fromFriendsData.pendingSent || []).filter(id => id !== toUserId);
    updatePromises.push(
      updateDoc(doc(db, 'friends', fromUserId), {
        pendingSent: updatedFromPendingSent,
        updatedAt: Date.now(),
      })
    );
  }

  // Mettre à jour la collection de toUserId
  if (!toAlreadyHasFriend) {
    const updatedToFriends = [...toFriendsList, fromFriend];
    const updatedToPendingReceived = (toFriendsData.pendingReceived || []).filter(id => id !== fromUserId);
    
    updatePromises.push(
      updateDoc(doc(db, 'friends', toUserId), {
        friends: updatedToFriends,
        pendingReceived: updatedToPendingReceived,
        updatedAt: Date.now(),
      }).catch((error: any) => {
        throw error;
      })
    );
  } else {
    // Si déjà ami, juste retirer de pendingReceived
    const updatedToPendingReceived = (toFriendsData.pendingReceived || []).filter(id => id !== fromUserId);
    updatePromises.push(
      updateDoc(doc(db, 'friends', toUserId), {
        pendingReceived: updatedToPendingReceived,
        updatedAt: Date.now(),
      })
    );
  }

  await Promise.all(updatePromises);
}

// Refuser une demande d'ami
export async function rejectFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
  // Trouver la demande
  const requestsRef = collection(db, 'friendRequests');
  const q = query(
    requestsRef,
    where('fromUserId', '==', fromUserId),
    where('toUserId', '==', toUserId),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error('Demande d\'ami introuvable');
  }

  const requestDoc = snapshot.docs[0];

  // Mettre à jour la demande
  await updateDoc(requestDoc.ref, {
    status: 'rejected',
    respondedAt: Date.now(),
  });

  // Retirer des listes pending
  await Promise.all([
    updateDoc(doc(db, 'friends', fromUserId), {
      pendingSent: arrayRemove(toUserId),
      updatedAt: Date.now(),
    }),
    updateDoc(doc(db, 'friends', toUserId), {
      pendingReceived: arrayRemove(fromUserId),
      updatedAt: Date.now(),
    }),
  ]);
}

// Retirer un ami
export async function removeFriend(userId: string, friendId: string): Promise<void> {
  const [userFriends, friendFriends] = await Promise.all([
    getFriendsCollection(userId),
    getFriendsCollection(friendId),
  ]);

  // Retirer de la liste d'amis
  const updatedUserFriends = userFriends.friends.filter(f => f.userId !== friendId);
  const updatedFriendFriends = friendFriends.friends.filter(f => f.userId !== userId);

  await Promise.all([
    updateDoc(doc(db, 'friends', userId), {
      friends: updatedUserFriends,
      updatedAt: Date.now(),
    }),
    updateDoc(doc(db, 'friends', friendId), {
      friends: updatedFriendFriends,
      updatedAt: Date.now(),
    }),
  ]);
}

// Obtenir la liste des amis avec statut en temps réel
export function subscribeToFriends(
  userId: string, 
  callback: (friends: Friend[]) => void
): () => void {
  const friendsRef = doc(db, 'friends', userId);
  const presenceUnsubscribes: Map<string, () => void> = new Map();
  const friendStatuses: Map<string, { status: FriendStatus; currentGameId?: string | null }> = new Map();
  
  // Fonction pour reconstruire la liste d'amis avec les statuts actuels
  const buildFriendsList = (baseFriends: Friend[]): Friend[] => {
    return baseFriends.map(friend => {
      const statusInfo = friendStatuses.get(friend.userId);
      return {
        ...friend,
        status: statusInfo?.status || friend.status || 'offline',
        currentGameId: statusInfo?.currentGameId || friend.currentGameId,
      };
    });
  };
  
  // Stocker la liste actuelle d'amis pour la reconstruire lors des mises à jour de présence
  let currentFriendsList: Friend[] = [];
  
  // Fonction pour mettre à jour et notifier
  const updateAndNotify = () => {
    const enrichedFriends = buildFriendsList(currentFriendsList);
    callback(enrichedFriends);
  };
  
  // S'abonner aux changements de la liste d'amis
  const unsubscribeFriends = onSnapshot(friendsRef, (snapshot) => {
    if (!snapshot.exists()) {
      // Nettoyer les subscriptions de présence
      presenceUnsubscribes.forEach(unsub => unsub());
      presenceUnsubscribes.clear();
      friendStatuses.clear();
      currentFriendsList = [];
      callback([]);
      return;
    }

    const data = snapshot.data() as FriendsCollection;
    currentFriendsList = data.friends || [];

    // Nettoyer les anciennes subscriptions de présence pour les amis qui ne sont plus dans la liste
    const currentFriendIds = new Set(currentFriendsList.map(f => f.userId));
    presenceUnsubscribes.forEach((unsub, friendId) => {
      if (!currentFriendIds.has(friendId)) {
        unsub();
        presenceUnsubscribes.delete(friendId);
        friendStatuses.delete(friendId);
      }
    });

    // S'abonner à la présence de chaque ami en temps réel
    currentFriendsList.forEach(friend => {
      // Si on n'est pas déjà abonné à cet ami
      if (!presenceUnsubscribes.has(friend.userId)) {
        // Initialiser avec le statut stocké dans Firestore
        friendStatuses.set(friend.userId, {
          status: friend.status || 'offline',
          currentGameId: friend.currentGameId,
        });
        
        const unsubscribePresence = subscribeToFriendPresence(friend.userId, (presence) => {
          // Mettre à jour le statut de cet ami
          friendStatuses.set(friend.userId, {
            status: presence?.status || 'offline',
            currentGameId: presence?.currentGameId,
          });
          
          // Reconstruire la liste avec tous les statuts à jour
          updateAndNotify();
        });
        presenceUnsubscribes.set(friend.userId, unsubscribePresence);
      }
    });

    // Envoyer la liste initiale avec les statuts
    updateAndNotify();
  });

  // Retourner une fonction de nettoyage
  return () => {
    unsubscribeFriends();
    presenceUnsubscribes.forEach(unsub => unsub());
    presenceUnsubscribes.clear();
    friendStatuses.clear();
  };
}

// Obtenir les demandes d'ami reçues
export function subscribeToReceivedFriendRequests(
  userId: string,
  callback: (requests: FriendRequest[]) => void
): () => void {
  const requestsRef = collection(db, 'friendRequests');
  const q = query(
    requestsRef,
    where('toUserId', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const requests: FriendRequest[] = [];
    snapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      } as FriendRequest);
    });
    callback(requests);
  });
}

// Obtenir les demandes d'ami envoyées
export function subscribeToSentFriendRequests(
  userId: string,
  callback: (requests: FriendRequest[]) => void
): () => void {
  const requestsRef = collection(db, 'friendRequests');
  const q = query(
    requestsRef,
    where('fromUserId', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const requests: FriendRequest[] = [];
    snapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      } as FriendRequest);
    });
    callback(requests);
  });
}

// Obtenir la collection d'amis (sans subscription)
export async function getFriends(userId: string): Promise<FriendsCollection> {
  return getFriendsCollection(userId);
}

