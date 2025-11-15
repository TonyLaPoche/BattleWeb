import { useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Timeout de sécurité pour éviter le chargement infini
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 secondes max

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      clearTimeout(timeout);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [setUser, setLoading]);

  const login = async (email: string, password: string) => {
    try {
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
      // Validation basique
      if (!email || !email.includes('@')) {
        throw new Error('Email invalide');
      }
      if (!password || password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};
