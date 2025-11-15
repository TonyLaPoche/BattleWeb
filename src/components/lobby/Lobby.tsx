'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGameStore } from '@/stores/gameStore';
import { Game, LobbyMessage } from '@/types/game';
import {
  createGame,
  joinGame,
  getGame,
  subscribeToGame,
  subscribeToChat,
  sendChatMessage,
  updateGameSettings,
  startGame
} from '@/services/gameService';
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

  const [game, setGame] = useState<Game | null>(initialGame || currentGame);
  const [chatMessages, setChatMessages] = useState<LobbyMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger la partie si on a un gameId
  useEffect(() => {
    if (initialGameId && !game && user) {
      const loadGame = async () => {
        setLoading(true);
        try {
          const loadedGame = await getGame(initialGameId);
          if (loadedGame) {
            setGame(loadedGame);
            setCurrentGame(loadedGame);
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la partie:', error);
        } finally {
          setLoading(false);
        }
      };
      loadGame();
    }
  }, [initialGameId, game, user, setCurrentGame]);

  // Créer une nouvelle partie
  const handleCreateGame = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const newGame = await createGame(user.uid, user.email || 'Joueur', {
        enableBombs: true,
        bombsPerPlayer: 1,
        turnTimeLimit: 60, // 1 minute
        maxPlayers: 3,
      });

      setGame(newGame);
      setCurrentGame(newGame);
    } catch (error) {
      setError('Erreur lors de la création de la partie');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Rejoindre une partie
  const handleJoinGame = async (code: string) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const joinedGame = await joinGame(code, user.uid, user.email || 'Joueur');
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
    if (initialCode && !game && user && !loading) {
      handleJoinGame(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode, game, user]);

  // Écouter les changements de la partie
  useEffect(() => {
    if (!game?.id) return;

    const unsubscribe = subscribeToGame(game.id, (updatedGame) => {
      setGame(updatedGame);

      // Si la partie commence, appeler le callback
      if (updatedGame.phase !== 'lobby') {
        onGameStart(updatedGame);
      }
    });

    return unsubscribe;
  }, [game?.id, onGameStart]);

  // Écouter le chat
  useEffect(() => {
    if (!game?.id) return;

    const unsubscribe = subscribeToChat(game.id, setChatMessages);
    return unsubscribe;
  }, [game?.id]);

  // Envoyer un message
  const handleSendMessage = async (message: string) => {
    if (!game?.id || !user) return;

    try {
      await sendChatMessage(game.id, user.uid, user.email || 'Joueur', message);
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
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Si pas de partie, afficher l'écran d'accueil du lobby
  if (!game) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-8">BattleWeb Lobby</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleCreateGame}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Création...' : 'Créer une partie'}
            </button>

            <div className="text-center text-gray-500">ou</div>

            <JoinGameForm onJoin={handleJoinGame} loading={loading} />
          </div>
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
              <h2 className="text-xl font-bold mb-4">Partie {game.code}</h2>

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

// Composant pour rejoindre une partie
const JoinGameForm = ({ onJoin, loading }: { onJoin: (code: string) => void; loading: boolean }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onJoin(code.toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Code de partie
      </label>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="ABC123"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        maxLength={6}
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Recherche...' : 'Rejoindre'}
      </button>
    </form>
  );
};
