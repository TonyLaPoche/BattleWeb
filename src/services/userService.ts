import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  email: string;
  username: string; // Nom d'utilisateur personnalisé
  createdAt: number;
  updatedAt: number;
}

export interface UserStats {
  userId: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesAbandoned: number;
  totalShots: number;
  totalHits: number;
  totalShipsSunk: number;
  totalBombsPlaced: number;
  totalBombsDefused: number;
  averageAccuracy: number; // Pourcentage de précision
  winRate: number; // Pourcentage de victoires
  lastGameAt?: number; // Timestamp de la dernière partie
  createdAt: number;
  updatedAt: number;
}

// Obtenir le profil d'un utilisateur
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
}

// Créer ou mettre à jour le profil d'un utilisateur
export async function createOrUpdateUserProfile(
  userId: string,
  email: string,
  username?: string
): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    const defaultUsername = email.split('@')[0]; // Par défaut, le début de l'email
    const now = Date.now();
    
    if (!userDoc.exists()) {
      // Créer un nouveau profil
      const newProfile: UserProfile = {
        id: userId,
        email,
        username: username || defaultUsername,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(userRef, newProfile);
      return newProfile;
    } else {
      // Mettre à jour le profil existant
      const updates: Partial<UserProfile> = {
        updatedAt: now,
      };
      
      if (username !== undefined) {
        updates.username = username;
      }
      
      await updateDoc(userRef, updates);
      
      const updatedDoc = await getDoc(userRef);
      return updatedDoc.data() as UserProfile;
    }
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du profil:', error);
    throw error;
  }
}

// Mettre à jour le nom d'utilisateur
export async function updateUsername(userId: string, username: string): Promise<void> {
  try {
    if (!username || username.trim().length === 0) {
      throw new Error('Le nom d\'utilisateur ne peut pas être vide');
    }
    
    if (username.length > 20) {
      throw new Error('Le nom d\'utilisateur ne peut pas dépasser 20 caractères');
    }
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      username: username.trim(),
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du nom d\'utilisateur:', error);
    throw error;
  }
}

// Obtenir les statistiques d'un utilisateur
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const statsDoc = await getDoc(doc(db, 'user_stats', userId));
    
    if (!statsDoc.exists()) {
      // Créer des statistiques par défaut
      return await createDefaultStats(userId);
    }
    
    const data = statsDoc.data() as UserStats;
    
    // Calculer les pourcentages
    const stats: UserStats = {
      ...data,
      averageAccuracy: data.totalShots > 0 
        ? Math.round((data.totalHits / data.totalShots) * 100 * 100) / 100 
        : 0,
      winRate: data.gamesPlayed > 0 
        ? Math.round((data.gamesWon / data.gamesPlayed) * 100 * 100) / 100 
        : 0,
    };
    
    return stats;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return null;
  }
}

// Créer des statistiques par défaut
async function createDefaultStats(userId: string): Promise<UserStats> {
  const now = Date.now();
  const defaultStats: UserStats = {
    userId,
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesAbandoned: 0,
    totalShots: 0,
    totalHits: 0,
    totalShipsSunk: 0,
    totalBombsPlaced: 0,
    totalBombsDefused: 0,
    averageAccuracy: 0,
    winRate: 0,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(doc(db, 'user_stats', userId), defaultStats);
  return defaultStats;
}

// Mettre à jour les statistiques après une partie
export async function updateUserStatsAfterGame(
  userId: string,
  stats: {
    isWinner: boolean;
    isAbandoned: boolean;
    shots: number;
    hits: number;
    shipsSunk: number;
    bombsPlaced: number;
    bombsDefused: number;
  }
): Promise<void> {
  try {
    const statsRef = doc(db, 'user_stats', userId);
    const statsDoc = await getDoc(statsRef);
    
    const now = Date.now();
    
    if (!statsDoc.exists()) {
      // Créer les statistiques si elles n'existent pas
      await createDefaultStats(userId);
    }
    
    // Mettre à jour les statistiques
    await updateDoc(statsRef, {
      gamesPlayed: increment(1),
      gamesWon: stats.isWinner ? increment(1) : increment(0),
      gamesLost: !stats.isWinner && !stats.isAbandoned ? increment(1) : increment(0),
      gamesAbandoned: stats.isAbandoned ? increment(1) : increment(0),
      totalShots: increment(stats.shots),
      totalHits: increment(stats.hits),
      totalShipsSunk: increment(stats.shipsSunk),
      totalBombsPlaced: increment(stats.bombsPlaced),
      totalBombsDefused: increment(stats.bombsDefused),
      lastGameAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
    // Ne pas faire échouer la partie si les stats échouent
  }
}

