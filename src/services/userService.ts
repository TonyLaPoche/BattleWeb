import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  email: string;
  username: string; // Nom d'utilisateur personnalisé
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

