'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleCreateGame = () => {
    router.push('/lobby');
  };

  const handleJoinGame = () => {
    if (joinCode.trim()) {
      // Passer le code via l'URL
      router.push(`/lobby?code=${joinCode.toUpperCase()}`);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">BattleWeb</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <span className="text-sm sm:text-base text-gray-700 text-center sm:text-left">Bonjour, {user?.email?.split('@')[0]}</span>
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Créer une partie */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Créer une partie
                </h3>
                <p className="text-gray-600 mb-4">
                  Créez une nouvelle partie et invitez vos amis avec un code unique.
                </p>
                <button
                  onClick={handleCreateGame}
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Créer une partie
                </button>
              </div>
            </div>

            {/* Rejoindre une partie */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Rejoindre une partie
                </h3>
                <p className="text-gray-600 mb-4">
                  Entrez le code d'invitation pour rejoindre une partie existante.
                </p>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Entrez le code..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={6}
                  />
                  <button
                    onClick={handleJoinGame}
                    disabled={!joinCode.trim()}
                    className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
                  >
                    Rejoindre
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Parties récentes (TODO) */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Parties récentes
            </h3>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-500 text-center">
                Aucune partie récente
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
