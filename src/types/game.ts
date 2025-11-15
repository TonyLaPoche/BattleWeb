// Types de base du jeu

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'revealed' | 'revealed_ship' | 'revealed_empty';

export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';

export interface Ship {
  id: string;
  type: ShipType;
  size: number;
  positions: Position[];
  hits: number;
  sunk: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameBoard {
  cells: CellState[][];
  ships: Ship[];
}

export interface Bomb {
  id: string;
  position: Position;
  ownerId: string; // Joueur qui a placé la bombe
  targetPlayerId: string; // Joueur sur qui la bombe est placée
  placedAt: number; // timestamp
  placedAtTurn: number; // Numéro du tour où elle a été placée
  activatesAtTurn: number; // Numéro du tour où elle s'activera (placedAtTurn + 2)
  detonated: boolean;
  defused: boolean; // Si désamorcée
}

export interface Player {
  id: string;
  name: string;
  color: string;
  board: GameBoard;
  bombsPlaced: Bomb[];
  bombsRemaining: number; // Nombre de bombes restantes
  isAlive: boolean;
  connected: boolean;
}

export interface GameSettings {
  enableBombs: boolean;
  bombsPerPlayer: number; // Nombre de bombes par joueur (0 = désactivé)
  turnTimeLimit: number; // en secondes, 0 = illimité
  maxPlayers: number;
}

export type GamePhase = 'lobby' | 'placement' | 'playing' | 'finished';

export type GameStatus = 'waiting' | 'active' | 'paused' | 'finished';

export interface Game {
  id: string;
  code: string; // code d'invitation
  adminId: string;
  players: Player[];
  currentPlayerIndex: number;
  currentTurn: number; // Numéro du tour actuel
  phase: GamePhase;
  status: GameStatus;
  settings: GameSettings;
  winnerId?: string;
  playerChoices?: Record<string, 'lobby' | 'menu'>; // Choix des joueurs après la fin de partie
  createdAt: number;
  lastActivity: number;
}

export interface LobbyMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export interface GameMove {
  id: string;
  gameId: string;
  playerId: string;
  type: 'shot' | 'bomb_placement' | 'bomb_defusal';
  position?: Position;
  bombId?: string;
  result?: 'hit' | 'miss' | 'sunk' | 'revealed';
  timestamp: number;
}

// Constantes du jeu
export const BOARD_SIZE = 12;

export const SHIPS_CONFIG: Record<ShipType, { size: number; name: string }> = {
  carrier: { size: 5, name: 'Porte-avions' },
  battleship: { size: 4, name: 'Croiseur' },
  cruiser: { size: 3, name: 'Contre-torpilleur' },
  submarine: { size: 3, name: 'Sous-marin' },
  destroyer: { size: 2, name: 'Torpilleur' },
};

export const TURN_TIME_OPTIONS = [
  { value: 0, label: 'Illimité' },
  { value: 30, label: '30 secondes' },
  { value: 60, label: '1 minute' },
  { value: 120, label: '2 minutes' },
  { value: 300, label: '5 minutes' },
];
