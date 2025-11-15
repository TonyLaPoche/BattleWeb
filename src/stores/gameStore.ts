import { create } from 'zustand';
import { Game, Player, GameMove, LobbyMessage, GamePhase, GameStatus } from '@/types/game';

interface GameState {
  // État du jeu actuel
  currentGame: Game | null;
  currentPlayer: Player | null;

  // État du lobby
  lobbyMessages: LobbyMessage[];
  isInLobby: boolean;

  // États de chargement
  loading: boolean;
  error: string | null;

  // Actions
  setCurrentGame: (game: Game | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  updateGame: (updates: Partial<Game>) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;

  // Lobby actions
  setLobbyMessages: (messages: LobbyMessage[]) => void;
  addLobbyMessage: (message: LobbyMessage) => void;
  setIsInLobby: (isInLobby: boolean) => void;

  // Utilitaires
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentGame: null,
  currentPlayer: null,
  lobbyMessages: [],
  isInLobby: false,
  loading: false,
  error: null,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setCurrentGame: (game) => set({ currentGame: game }),
  setCurrentPlayer: (player) => set({ currentPlayer: player }),

  updateGame: (updates) => {
    const { currentGame } = get();
    if (currentGame) {
      set({ currentGame: { ...currentGame, ...updates } });
    }
  },

  updatePlayer: (playerId, updates) => {
    const { currentGame } = get();
    if (currentGame) {
      const updatedPlayers = currentGame.players.map(player =>
        player.id === playerId ? { ...player, ...updates } : player
      );
      set({
        currentGame: { ...currentGame, players: updatedPlayers },
        currentPlayer: currentGame.players.find(p => p.id === playerId) || null
      });
    }
  },

  setLobbyMessages: (messages) => set({ lobbyMessages: messages }),
  addLobbyMessage: (message) => {
    const { lobbyMessages } = get();
    set({ lobbyMessages: [...lobbyMessages, message] });
  },

  setIsInLobby: (isInLobby) => set({ isInLobby }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
