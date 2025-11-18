'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToReceivedFriendRequests } from '@/services/friendService';
import { FriendRequest } from '@/types/friends';

interface NavigationProps {
  currentPage?: 'dashboard' | 'profile' | 'tutoriel' | 'game';
}

export const Navigation = ({ currentPage }: NavigationProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b-2 border-blue-500">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between py-3">
          {/* Logo */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              ⚔️ BattleWeb
            </span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 min-w-[120px] justify-center"
            >
              <span className="text-lg">🔔</span>
              <span className="hidden lg:inline">Notifications</span>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>

            {/* Menu déroulant des notifications */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-2xl z-20 border-2 border-blue-500">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-bold text-white text-lg">
                      🔔 Demandes d'ami
                      {pendingCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {pendingCount}
                        </span>
                      )}
                    </h3>
                  </div>

                  {pendingCount === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      Aucune demande d'ami en attente
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {friendRequests.map((request) => (
                        <div
                          key={request.id}
                          className="p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                {request.fromUsername}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                vous a envoyé une demande d'ami
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                router.push('/profile');
                                setShowNotifications(false);
                              }}
                              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap font-semibold"
                            >
                              Voir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 border-t border-gray-700">
                    <button
                      onClick={() => {
                        router.push('/profile');
                        setShowNotifications(false);
                      }}
                      className="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-semibold py-2 transition-colors"
                    >
                      Voir toutes les demandes →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-3">
            {currentPage !== 'tutoriel' && (
              <button
                onClick={() => router.push('/tutoriel')}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm"
              >
                📚 Tutoriel
              </button>
            )}



            {currentPage !== 'profile' && (
              <button
                onClick={() => router.push('/profile')}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm"
              >
                👤 Profil
              </button>
            )}

            {currentPage === 'profile' && (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm"
              >
                🏠 Dashboard
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm"
            >
              🚪 Déconnexion
            </button>
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ⚔️ BattleWeb
              </span>
            </button>

            {/* Mobile Menu Button & Notifications */}
            <div className="flex items-center gap-2">
              {/* Notifications Button */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center min-w-[50px]"
                >
                  <span className="text-xl">🔔</span>
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </button>

                {/* Mobile Notifications Menu */}
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-10 bg-black bg-opacity-50"
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="fixed top-16 right-3 left-3 bg-gray-800 rounded-lg shadow-2xl z-20 border-2 border-blue-500 max-h-[70vh] overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-gray-700">
                        <h3 className="font-bold text-white text-lg">
                          🔔 Demandes d'ami
                          {pendingCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {pendingCount}
                            </span>
                          )}
                        </h3>
                      </div>

                      {pendingCount === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">
                          Aucune demande d'ami en attente
                        </div>
                      ) : (
                        <div className="overflow-y-auto flex-1">
                          {friendRequests.map((request) => (
                            <div
                              key={request.id}
                              className="p-4 border-b border-gray-700 hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">
                                    {request.fromUsername}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    vous a envoyé une demande d'ami
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    router.push('/profile');
                                    setShowNotifications(false);
                                  }}
                                  className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap font-semibold"
                                >
                                  Voir
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-3 border-t border-gray-700">
                        <button
                          onClick={() => {
                            router.push('/profile');
                            setShowNotifications(false);
                          }}
                          className="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-semibold py-2 transition-colors"
                        >
                          Voir toutes les demandes →
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Hamburger Menu */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold rounded-lg shadow-md transition-all"
              >
                {showMobileMenu ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="pb-3 space-y-2">
              {currentPage !== 'tutoriel' && (
                <button
                  onClick={() => {
                    router.push('/tutoriel');
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md transition-all text-left"
                >
                  📚 Tutoriel
                </button>
              )}

              {currentPage !== 'profile' && (
                <button
                  onClick={() => {
                    router.push('/profile');
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-md transition-all text-left"
                >
                  👤 Profil
                </button>
              )}

              {currentPage === 'profile' && (
                <button
                  onClick={() => {
                    router.push('/dashboard');
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-md transition-all text-left"
                >
                  🏠 Dashboard
                </button>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-lg shadow-md transition-all text-left"
              >
                🚪 Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

