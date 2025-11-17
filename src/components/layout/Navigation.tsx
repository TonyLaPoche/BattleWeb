'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToReceivedFriendRequests } from '@/services/friendService';
import { FriendRequest } from '@/types/friends';

interface NavigationProps {
  currentPage?: 'dashboard' | 'profile' | 'tutoriel';
}

export const Navigation = ({ currentPage }: NavigationProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const unsubscribe = subscribeToReceivedFriendRequests(user.uid, (requests) => {
      setFriendRequests(requests);
    });

    return unsubscribe;
  }, [user, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const pendingCount = friendRequests.length;

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">BattleWeb</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {currentPage !== 'tutoriel' && (
              <button
                onClick={() => router.push('/tutoriel')}
                className="bg-green-500 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base"
              >
                📚 Tutoriel
              </button>
            )}
            
            {/* Icône de notification pour les demandes d'ami */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative bg-blue-500 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base flex items-center gap-2"
              >
                🔔
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </button>

              {/* Menu déroulant des notifications */}
              {showNotifications && (
                <>
                  {/* Overlay pour fermer le menu */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  
                  {/* Menu des notifications */}
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        Demandes d'ami ({pendingCount})
                      </h3>
                    </div>
                    
                    {pendingCount === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Aucune demande d'ami en attente
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {friendRequests.map((request) => (
                          <div
                            key={request.id}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {request.fromUsername}
                                </p>
                                <p className="text-xs text-gray-500">
                                  vous a envoyé une demande d'ami
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  router.push('/profile');
                                  setShowNotifications(false);
                                }}
                                className="ml-2 px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors whitespace-nowrap"
                              >
                                Voir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="p-2 border-t border-gray-200">
                      <button
                        onClick={() => {
                          router.push('/profile');
                          setShowNotifications(false);
                        }}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
                      >
                        Voir toutes les demandes
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {currentPage !== 'profile' && (
              <button
                onClick={() => router.push('/profile')}
                className="bg-blue-500 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base"
              >
                👤 Profil
              </button>
            )}
            
            {currentPage === 'profile' && (
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-500 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base"
              >
                Retour au Dashboard
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

