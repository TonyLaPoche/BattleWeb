'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthForm = ({ mode, onSuccess }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const { login, register, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Utiliser currentMode au lieu de mode pour refléter l'état actuel
      if (currentMode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        if (password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        await register(email, password);
      } else {
        await login(email, password);
      }

      onSuccess?.();
    } catch (error: any) {
      // Gérer les erreurs Firebase de manière plus claire
      let errorMessage = 'Une erreur est survenue';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide. Veuillez entrer un email valide.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible. Utilisez au moins 6 caractères.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cet email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mot de passe incorrect.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou mot de passe incorrect.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const [currentMode, setCurrentMode] = useState(mode);

  const toggleMode = () => {
    setCurrentMode(currentMode === 'login' ? 'register' : 'login');
    setError('');
    setShowResetPassword(false);
    setResetEmailSent(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !email.includes('@')) {
        throw new Error('Veuillez entrer un email valide');
      }

      await resetPassword(email);
      setResetEmailSent(true);
    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cet email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email invalide. Veuillez entrer un email valide.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Si on affiche le formulaire de réinitialisation
  if (showResetPassword) {
    return (
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleResetPassword} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
            Réinitialiser le mot de passe
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {resetEmailSent && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              ✅ Un email de réinitialisation a été envoyé à {email}. Vérifiez votre boîte de réception.
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="resetEmail">
              Email
            </label>
            <input
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              id="resetEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || resetEmailSent}
              placeholder="Entrez votre email"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors ${
                loading || resetEmailSent ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="submit"
              disabled={loading || resetEmailSent}
            >
              {loading ? 'Envoi...' : resetEmailSent ? 'Email envoyé' : 'Envoyer l\'email'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowResetPassword(false);
                setResetEmailSent(false);
                setError('');
              }}
              className="text-blue-500 hover:text-blue-800 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Retour à la connexion
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          {currentMode === 'login' ? 'Connexion' : 'Inscription'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Mot de passe
          </label>
          <input
            className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />
        </div>

        {currentMode === 'register' && (
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirmer le mot de passe
            </label>
            <input
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
        )}

        {currentMode === 'login' && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              className="text-blue-500 hover:text-blue-800 text-sm transition-colors"
            >
              Mot de passe oublié ?
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Chargement...' : currentMode === 'login' ? 'Se connecter' : 'S\'inscrire'}
          </button>

          <button
            type="button"
            onClick={() => setCurrentMode(currentMode === 'login' ? 'register' : 'login')}
            className="text-blue-500 hover:text-blue-800 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {currentMode === 'login' ? 'Créer un compte' : 'Déjà un compte ?'}
          </button>
        </div>
      </form>
    </div>
  );
};
