'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserProfile, updateUsername, getUserStats, UserProfile, UserStats } from '@/services/userService';
import { AddFriend } from '@/components/friends/AddFriend';
import { FriendsList } from '@/components/friends/FriendsList';
import { Navigation } from '@/components/layout/Navigation';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
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
        // Cela créera aussi automatiquement friends et user_stats
        if (!userProfile && user.email) {
          const { createOrUpdateUserProfile } = await import('@/services/userService');
          userProfile = await createOrUpdateUserProfile(user.uid, user.email);
        }
        
        if (userProfile) {
          setProfile(userProfile);
          setUsername(userProfile.username);
        }
        
        // Charger les statistiques (créées automatiquement à l'inscription)
        const userStats = await getUserStats(user.uid);
        if (userStats) {
          setStats(userStats);
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
      <Navigation currentPage="profile" />

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

              {/* Statistiques de jeu */}
              {stats && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Statistiques de Jeu</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Parties jouées */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Parties jouées</div>
                      <div className="text-2xl font-bold text-blue-700">{stats.gamesPlayed}</div>
                    </div>
                    
                    {/* Taux de victoire */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Taux de victoire</div>
                      <div className="text-2xl font-bold text-green-700">{stats.winRate}%</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.gamesWon} victoires / {stats.gamesPlayed} parties
                      </div>
                    </div>
                    
                    {/* Précision */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Précision moyenne</div>
                      <div className="text-2xl font-bold text-purple-700">{stats.averageAccuracy}%</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stats.totalHits} touches / {stats.totalShots} tirs
                      </div>
                    </div>
                    
                    {/* Navires coulés */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Navires coulés</div>
                      <div className="text-2xl font-bold text-orange-700">{stats.totalShipsSunk}</div>
                    </div>
                    
                    {/* Bombes placées */}
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Bombes placées</div>
                      <div className="text-2xl font-bold text-red-700">{stats.totalBombsPlaced}</div>
                    </div>
                    
                    {/* Bombes désamorcées */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Bombes désamorcées</div>
                      <div className="text-2xl font-bold text-yellow-700">{stats.totalBombsDefused}</div>
                    </div>
                  </div>
                  
                  {/* Détails supplémentaires */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Victoires :</span>
                        <span className="ml-2 font-semibold text-green-600">{stats.gamesWon}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Défaites :</span>
                        <span className="ml-2 font-semibold text-red-600">{stats.gamesLost}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Abandons :</span>
                        <span className="ml-2 font-semibold text-gray-600">{stats.gamesAbandoned}</span>
                      </div>
                      {stats.lastGameAt && (
                        <div>
                          <span className="text-gray-600">Dernière partie :</span>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(stats.lastGameAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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

          {/* Section Amis */}
          {user && (
            <div className="mt-6 space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 Amis</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ajouter un ami */}
                  <div>
                    <AddFriend />
                  </div>
                  {/* Liste des amis */}
                  <div>
                    <FriendsList userId={user.uid} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

