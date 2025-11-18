'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/stores/gameStore';
import { Game, LobbyMessage } from '@/types/game';
import {
  joinGame,
  getGame,
  subscribeToGame,
  subscribeToChat,
  sendChatMessage,
  updateGameSettings,
  startGame,
  leaveGame
} from '@/services/gameService';
import { getUserProfile, createOrUpdateUserProfile } from '@/services/userService';
import { LobbyChat } from './LobbyChat';
import { LobbySettings } from './LobbySettings';
import { LobbyPlayers } from './LobbyPlayers';

interface LobbyProps {
  game?: Game | null;
  onGameStart: (game: Game) => void;
  initialCode?: string | null;
  initialGameId?: string;
}

export const Lobby = ({ game: initialGame, onGameStart, initialCode, initialGameId }: LobbyProps) => {
  const { user } = useAuth();
  const { currentGame, setCurrentGame } = useGameStore();
  const router = useRouter();

  const [game, setGame] = useState<Game | null>(initialGame || currentGame);
  const [chatMessages, setChatMessages] = useState<LobbyMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playerName, setPlayerName] = useState<string>('');

  // Charger le nom d'utilisateur du profil
  useEffect(() => {
    const loadPlayerName = async () => {
      if (!user?.uid || !user?.email) return;

      try {
        let profile = await getUserProfile(user.uid);
        
        // Si le profil n'existe pas, le créer
        if (!profile) {
          profile = await createOrUpdateUserProfile(user.uid, user.email);
        }
        
        if (profile) {
          setPlayerName(profile.username);
        } else {
          // Fallback sur l'email si le profil n'existe toujours pas
          setPlayerName(user.email.split('@')[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        // Fallback sur l'email en cas d'erreur
        setPlayerName(user.email?.split('@')[0] || 'Joueur');
      }
    };

    loadPlayerName();
  }, [user]);

  // Charger la partie si on a un gameId
  useEffect(() => {
    if (initialGameId && !game && user) {
      const loadGame = async () => {
        setLoading(true);
        try {
          const loadedGame = await getGame(initialGameId);
          if (loadedGame) {
            // Vérifier si l'utilisateur actuel est dans la partie
            const isUserInGame = loadedGame.players.some(p => p.id === user.uid);

            if (!isUserInGame) {
              // Si l'utilisateur n'est pas dans la partie, le faire rejoindre
              const playerName = user.displayName || user.email?.split('@')[0] || 'Joueur';
              const joinedGame = await joinGame(loadedGame.code, user.uid, playerName);
              if (joinedGame) {
                setGame(joinedGame);
                setCurrentGame(joinedGame);
              } else {
                throw new Error('Impossible de rejoindre la partie');
              }
            } else {
              // L'utilisateur est déjà dans la partie
              setGame(loadedGame);
              setCurrentGame(loadedGame);
            }
            // Si le jeu n'est pas en phase 'lobby', on attend que subscribeToGame le mette à jour
            // Ne pas afficher d'erreur immédiatement, le subscribeToGame gérera la redirection si nécessaire
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la partie:', error);
          setError('Erreur lors du chargement de la partie');
        } finally {
          setLoading(false);
        }
      };
      loadGame();
    }
  }, [initialGameId, game, user, setCurrentGame]);

  // Rejoindre une partie
  const handleJoinGame = async (code: string) => {
    if (!user || !playerName) return;

    setLoading(true);
    setError('');

    try {
      const joinedGame = await joinGame(code, user.uid, playerName);
      if (joinedGame) {
        setGame(joinedGame);
        setCurrentGame(joinedGame);
      } else {
        setError('Code de partie invalide');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors du rejoint de la partie');
    } finally {
      setLoading(false);
    }
  };

  // Rejoindre automatiquement si un code est fourni
  useEffect(() => {
    if (initialCode && !game && user && playerName && !loading) {
      handleJoinGame(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode, game, user, playerName]);

  // Écouter les changements de la partie
  useEffect(() => {
    if (!game?.id) return;

    const unsubscribe = subscribeToGame(game.id, (updatedGame) => {
      // Si le jeu a été supprimé, rediriger vers le dashboard
      if (!updatedGame) {
        router.push('/dashboard');
        return;
      }

      setGame(updatedGame);

      // Si la partie est en phase 'finished', rediriger vers la page de jeu pour afficher les résultats
      if (updatedGame.phase === 'finished') {
        router.push(`/game/${updatedGame.id}`);
        return;
      }

      // Si la partie commence (phase placement ou playing), rediriger vers la page de placement
      if (updatedGame.phase === 'placement' || updatedGame.phase === 'playing') {
        // Utiliser router.push directement au lieu de onGameStart pour éviter les problèmes de timing
        router.push(`/placement?gameId=${updatedGame.id}`);
        return;
      }
      
      // Si la phase est 'lobby', on reste sur la page lobby (pas de redirection)
      // Le composant affichera l'interface du lobby car game.phase === 'lobby'
    });

    return unsubscribe;
  }, [game?.id, router]);

  // Écouter le chat
  useEffect(() => {
    if (!game?.id) return;

    const unsubscribe = subscribeToChat(game.id, setChatMessages);
    return unsubscribe;
  }, [game?.id]);

  // Envoyer un message
  const handleSendMessage = async (message: string) => {
    if (!game?.id || !user || !playerName) return;

    try {
      await sendChatMessage(game.id, user.uid, playerName, message);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  // Mettre à jour les paramètres
  const handleUpdateSettings = async (settings: any) => {
    if (!game?.id || !user) return;

    try {
      await updateGameSettings(game.id, user.uid, settings);
    } catch (error) {
      setError('Erreur lors de la mise à jour des paramètres');
    }
  };

  // Lancer la partie
  const handleStartGame = async () => {
    if (!game?.id || !user) return;

    setLoading(true);
    try {
      await startGame(game.id, user.uid);
      // La redirection sera gérée par le subscribeToGame qui détectera le changement de phase
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Quitter le lobby
  const handleLeaveLobby = async () => {
    if (!game?.id || !user) return;

    // Demander confirmation
    if (!confirm('Êtes-vous sûr de vouloir quitter le lobby ?')) {
      return;
    }

    setLoading(true);
    try {
      await leaveGame(game.id, user.uid);
      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sortie du lobby');
      setLoading(false);
    }
  };

  // Si pas de partie, afficher un message avec un bouton retour
  if (!game) {
    // Si on est en train de charger ou de rejoindre une partie, afficher un message de chargement
    if (loading || (initialCode && playerName) || (initialGameId && !game)) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-4">BattleWeb Lobby</h1>
            
            <div className="text-center mb-6">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">
                {initialCode ? 'Rejoindre la partie...' : 'Chargement...'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-4">BattleWeb Lobby</h1>
          
          <p className="text-center text-gray-600 mb-6">
            Aucune partie trouvée. Retournez au tableau de bord pour créer ou rejoindre une partie.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            ← Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // Si la phase n'est pas 'lobby', afficher un message de chargement en attendant que la phase change
  if (game.phase !== 'lobby') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-4">BattleWeb Lobby</h1>
          
          <div className="text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">
              {game.phase === 'finished' ? 'Retour au lobby...' : 'Chargement du lobby...'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Afficher le lobby de la partie
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations de la partie */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Partie {game.code}</h2>
                <button
                  onClick={handleLeaveLobby}
                  disabled={loading}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded transition-colors"
                  title="Quitter le lobby"
                >
                  🚪 Quitter
                </button>
              </div>

              <LobbyPlayers
                players={game.players}
                adminId={game.adminId}
                currentUserId={user?.uid}
              />

              {user?.uid === game.adminId && (
                <LobbySettings
                  settings={game.settings}
                  onUpdateSettings={handleUpdateSettings}
                  onStartGame={handleStartGame}
                  canStart={game.players.length >= 2}
                  loading={loading}
                />
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-2">
            <LobbyChat
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              currentUserId={user?.uid}
              canChat={game.players.some(p => p.id === user?.uid)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
