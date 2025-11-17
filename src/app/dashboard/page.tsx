'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cleanupEmptyLobbies, createGame, getActiveGamesForPlayer } from '@/services/gameService';
import { getGameHistory, GameHistoryEntry } from '@/utils/gameHistory';
import { getUserProfile, createOrUpdateUserProfile } from '@/services/userService';
import { Game } from '@/types/game';
import { FriendsList } from '@/components/friends/FriendsList';
import { Navigation } from '@/components/layout/Navigation';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [creating, setCreating] = useState(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [activeGames, setActiveGames] = useState<Game[]>([]);
  const [loadingActiveGames, setLoadingActiveGames] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else {
      // Charger l'historique
      setGameHistory(getGameHistory());
      
      // Nettoyer les lobbies vides au chargement
      cleanupEmptyLobbies().catch(console.error);
      
      // Charger le nom d'utilisateur
      const loadPlayerName = async () => {
        if (!user?.uid || !user?.email) return;
        
        try {
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            profile = await createOrUpdateUserProfile(user.uid, user.email);
          }
          if (profile) {
            setPlayerName(profile.username);
          } else {
            setPlayerName(user.email.split('@')[0]);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
          setPlayerName(user.email?.split('@')[0] || 'Joueur');
        }
      };
      
      // Charger les parties actives
      const loadActiveGames = async () => {
        if (!user?.uid) return;
        
        setLoadingActiveGames(true);
        try {
          const games = await getActiveGamesForPlayer(user.uid);
          setActiveGames(games);
        } catch (error) {
          console.error('Erreur lors du chargement des parties actives:', error);
        } finally {
          setLoadingActiveGames(false);
        }
      };
      
      loadPlayerName();
      loadActiveGames();
    }
  }, [isAuthenticated, router, user]);

  const handleCreateGame = async () => {
    if (!user || !playerName) {
      // Attendre que le nom soit chargé
      return;
    }

    setCreating(true);
    try {
      const newGame = await createGame(user.uid, playerName, {
        enableBombs: false,
        bombsPerPlayer: 0,
        turnTimeLimit: 0, // Illimité par défaut
        maxPlayers: 3,
      });

      // Rediriger vers le lobby avec le gameId
      router.push(`/lobby?gameId=${newGame.id}`);
    } catch (error) {
      console.error('Erreur lors de la création de la partie:', error);
      alert('Erreur lors de la création de la partie. Veuillez réessayer.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGame = () => {
    if (joinCode.trim()) {
      // Passer le code via l'URL
      router.push(`/lobby?code=${joinCode.toUpperCase()}`);
    }
  };


  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Navigation currentPage="dashboard" />

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
                  disabled={creating || !playerName}
                  className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  {creating ? 'Création...' : 'Créer une partie'}
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

          {/* Parties actives */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                🎮 Parties en cours
              </h3>
              <button
                onClick={async () => {
                  if (!user?.uid) return;
                  setLoadingActiveGames(true);
                  try {
                    const games = await getActiveGamesForPlayer(user.uid);
                    setActiveGames(games);
                  } catch (error) {
                    console.error('Erreur lors du rafraîchissement:', error);
                  } finally {
                    setLoadingActiveGames(false);
                  }
                }}
                disabled={loadingActiveGames}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
              >
                {loadingActiveGames ? 'Chargement...' : '🔄 Rafraîchir'}
              </button>
            </div>
            {activeGames.length > 0 ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="space-y-3">
                  {activeGames.map((game) => {
                    const currentPlayer = game.players.find(p => p.id === user?.uid);
                    const isAdmin = game.adminId === user?.uid;
                    const phaseLabels: Record<string, string> = {
                      'lobby': 'Lobby',
                      'placement': 'Placement des navires',
                      'playing': 'Partie en cours',
                    };
                    const phaseColors: Record<string, string> = {
                      'lobby': 'bg-blue-100 text-blue-800',
                      'placement': 'bg-yellow-100 text-yellow-800',
                      'playing': 'bg-green-100 text-green-800',
                    };

                    return (
                      <div
                        key={game.id}
                        className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">
                                Code: {game.code}
                              </span>
                              {isAdmin && (
                                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full font-bold">
                                  👑 Admin
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${phaseColors[game.phase] || 'bg-gray-100 text-gray-800'}`}>
                                {phaseLabels[game.phase] || game.phase}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>
                                Joueurs: {game.players.map(p => p.name).join(', ')} ({game.players.length}/{game.settings.maxPlayers})
                              </p>
                              {currentPlayer && !currentPlayer.isAlive && (
                                <p className="text-red-600 font-semibold mt-1">
                                  💀 Vous avez été éliminé
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              // Rediriger vers la page appropriée selon la phase
                              if (game.phase === 'lobby') {
                                router.push(`/lobby?gameId=${game.id}`);
                              } else if (game.phase === 'placement') {
                                router.push(`/placement?gameId=${game.id}`);
                              } else if (game.phase === 'playing') {
                                router.push(`/game/${game.id}`);
                              }
                            }}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded transition-colors whitespace-nowrap"
                          >
                            {game.phase === 'lobby' ? 'Rejoindre le lobby' : 
                             game.phase === 'placement' ? 'Continuer le placement' : 
                             'Reprendre la partie'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-500 text-center">
                  Aucune partie en cours
                </p>
              </div>
            )}
          </div>

          {/* Liste des amis */}
          {user && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                👥 Mes Amis
              </h3>
              <FriendsList userId={user.uid} />
            </div>
          )}

          {/* Historique des parties */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              📜 Historique des parties
            </h3>
            <div className="bg-white shadow rounded-lg p-6">
              {gameHistory.length === 0 ? (
                <p className="text-gray-500 text-center">
                  Aucune partie dans l'historique
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {gameHistory.map((entry) => (
                    <div
                      key={entry.gameId}
                      className={`p-4 rounded-lg border-2 ${
                        entry.isWinner
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              Code: {entry.gameCode}
                            </span>
                            {entry.isWinner && (
                              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-bold">
                                🏆 VICTOIRE
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>
                              Joueurs: {entry.players.map(p => p.name).join(', ')}
                            </p>
                            <p>
                              Gagnant: <span className="font-semibold" style={{ color: entry.players.find(p => p.id === entry.winnerId)?.color }}>
                                {entry.winnerName || 'Inconnu'}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(entry.finishedAt).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
