// Utilitaires pour gérer l'historique des parties dans localStorage

export interface GameHistoryEntry {
  gameId: string;
  gameCode: string;
  players: Array<{ id: string; name: string; color: string }>;
  winnerId?: string;
  winnerName?: string;
  isWinner: boolean;
  finishedAt: number;
  duration?: number; // en millisecondes
  phase: 'finished' | 'abandoned';
}

const HISTORY_KEY = 'battleweb_game_history';
const MAX_HISTORY_ENTRIES = 50; // Limiter à 50 parties dans l'historique

// Sauvegarder une partie dans l'historique
export function saveGameToHistory(entry: GameHistoryEntry): void {
  try {
    const history = getGameHistory();
    
    // Ajouter la nouvelle entrée au début
    history.unshift(entry);
    
    // Limiter à MAX_HISTORY_ENTRIES
    if (history.length > MAX_HISTORY_ENTRIES) {
      history.splice(MAX_HISTORY_ENTRIES);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'historique:', error);
  }
}

// Récupérer l'historique des parties
export function getGameHistory(): GameHistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored) as GameHistoryEntry[];
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
}

// Supprimer l'historique
export function clearGameHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'historique:', error);
  }
}

// Supprimer une entrée spécifique de l'historique
export function removeGameFromHistory(gameId: string): void {
  try {
    const history = getGameHistory();
    const filtered = history.filter(entry => entry.gameId !== gameId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entrée:', error);
  }
}

