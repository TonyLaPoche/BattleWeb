// Types pour le système d'amis

export type FriendStatus = 'online' | 'offline' | 'in-game';

export interface Friend {
  userId: string;
  username: string;
  status: FriendStatus;
  currentGameId?: string;
  addedAt: number;
  lastInteraction?: number; // Dernière partie ensemble
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  toUsername?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  respondedAt?: number;
}

export interface FriendsCollection {
  userId: string;
  friends: Friend[];
  pendingSent: string[]; // IDs des demandes envoyées en attente
  pendingReceived: string[]; // IDs des demandes reçues en attente
  blocked: string[]; // IDs des utilisateurs bloqués
  updatedAt: number;
}

export interface Presence {
  status: FriendStatus;
  lastSeen: number;
  currentGameId?: string;
}

// Extension du message de chat pour supporter le chat en jeu
export interface GameChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'lobby' | 'in-game';
  gamePhase?: 'lobby' | 'placement' | 'playing' | 'finished';
}

