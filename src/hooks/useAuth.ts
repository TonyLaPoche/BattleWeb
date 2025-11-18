import { useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { createOrUpdateUserProfile } from '@/services/userService';
import { setOnline, setOffline } from '@/services/presenceService';

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Vérifier que auth est initialisé
    if (!auth) {
      console.error('Firebase Auth n\'est pas initialisé. Vérifiez vos variables d\'environnement.');
      setLoading(false);
      return;
    }

    // Timeout de sécurité pour éviter le chargement infini
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 secondes max

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      clearTimeout(timeout);
      
      // Mettre à jour la présence
      if (user) {
        setOnline(user.uid);
      } else {
        // Si l'utilisateur se déconnecte, la présence sera mise à jour automatiquement
        // via onDisconnect dans presenceService
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [setUser, setLoading]);

  const login = async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth n\'est pas initialisé. Vérifiez vos variables d\'environnement.');
      }
      
      // Validation basique
      if (!email || !email.includes('@')) {
        throw new Error('Email invalide');
      }
      if (!password) {
        throw new Error('Mot de passe requis');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      // Re-lancer l'erreur pour que le composant puisse la gérer
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth n\'est pas initialisé. Vérifiez vos variables d\'environnement.');
      }
      
      // Validation basique
      if (!email || !email.includes('@')) {
        throw new Error('Email invalide');
      }
      if (!password || password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Créer le profil utilisateur dans Firestore
      if (userCredential.user) {
        await createOrUpdateUserProfile(userCredential.user.uid, email);
      }
      
      return userCredential;
    } catch (error: any) {
      // Re-lancer l'erreur pour que le composant puisse la gérer
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Email invalide');
      }
      
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    isAuthenticated: !!user,
  };
};
