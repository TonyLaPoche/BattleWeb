'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserProfile, updateUsername, UserProfile } from '@/services/userService';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    const loadProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        let userProfile = await getUserProfile(user.uid);
        
        // Si le profil n'existe pas, le créer avec le nom par défaut
        if (!userProfile && user.email) {
          const { createOrUpdateUserProfile } = await import('@/services/userService');
          userProfile = await createOrUpdateUserProfile(user.uid, user.email);
        }
        
        if (userProfile) {
          setProfile(userProfile);
          setUsername(userProfile.username);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, isAuthenticated, router]);

  const handleSaveUsername = async () => {
    if (!user || !username.trim()) {
      setError('Le nom d\'utilisateur ne peut pas être vide');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateUsername(user.uid, username.trim());
      setProfile(prev => prev ? { ...prev, username: username.trim() } : null);
      setSuccess('Nom d\'utilisateur mis à jour avec succès !');
      setIsEditing(false);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      setError(error.message || 'Erreur lors de la mise à jour du nom d\'utilisateur');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setUsername(profile.username);
    }
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Chargement du profil...</div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">BattleWeb</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-500 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base"
            >
              Retour au Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 Mon Profil</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <div className="flex items-center">
                  <span className="text-xl mr-2">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                <div className="flex items-center">
                  <span className="text-xl mr-2">✅</span>
                  <span>{success}</span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Email (non modifiable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  L'email ne peut pas être modifié
                </p>
              </div>

              {/* Nom d'utilisateur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={20}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Entrez votre nom d'utilisateur"
                    />
                    <p className="text-xs text-gray-500">
                      Maximum 20 caractères. Actuellement : {username.length}/20
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveUsername}
                        disabled={saving || !username.trim()}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          saving || !username.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={profile.username}
                        disabled
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                      <button
                        onClick={() => setIsEditing(true)}
                        className="ml-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        ✏️ Modifier
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Ce nom sera affiché dans les parties et le chat
                    </p>
                  </div>
                )}
              </div>

              {/* Informations supplémentaires */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Membre depuis :</span>{' '}
                    {new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {profile.updatedAt !== profile.createdAt && (
                    <p>
                      <span className="font-medium">Dernière mise à jour :</span>{' '}
                      {new Date(profile.updatedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

