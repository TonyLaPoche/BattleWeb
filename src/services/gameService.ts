import { db, realtimeDb } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot, deleteDoc, deleteField } from 'firebase/firestore';
import { ref, set, get, onValue, off, push, update } from 'firebase/database';
import { Game, Player, GameSettings, LobbyMessage, GameMove, CellState, GameBoard, Bomb, Position } from '@/types/game';
import { saveGameToHistory, GameHistoryEntry } from '@/utils/gameHistory';

// Générer un code d'invitation unique
function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Convertir un tableau 2D en objet pour Firestore
function cellsToFirestore(cells: CellState[][]): Record<string, CellState[]> {
  const result: Record<string, CellState[]> = {};
  cells.forEach((row, index) => {
    result[index.toString()] = row;
  });
  return result;
}

// Convertir un objet Firestore en tableau 2D
function cellsFromFirestore(firestoreCells: Record<string, CellState[]> | CellState[][]): CellState[][] {
  // Si c'est déjà un tableau 2D (cas de compatibilité)
  if (Array.isArray(firestoreCells) && Array.isArray(firestoreCells[0])) {
    return firestoreCells as CellState[][];
  }
  
  // Sinon, convertir depuis l'objet Firestore
  const obj = firestoreCells as Record<string, CellState[]>;
  const size = Math.max(...Object.keys(obj).map(k => parseInt(k))) + 1;
  const result: CellState[][] = [];
  for (let i = 0; i < size; i++) {
    result[i] = obj[i.toString()] || [];
  }
  return result;
}

// Convertir un Game pour Firestore (sérialiser les tableaux 2D)
function gameToFirestore(game: Game): any {
  return {
    ...game,
    players: game.players.map(player => ({
      ...player,
      board: {
        ...player.board,
        cells: cellsToFirestore(player.board.cells),
      },
    })),
  };
}

// Convertir un Game depuis Firestore (désérialiser les tableaux 2D)
function gameFromFirestore(firestoreGame: any): Game {
  return {
    ...firestoreGame,
    settings: {
      ...firestoreGame.settings,
      // Valeurs par défaut pour les settings manquants
      bombsPerPlayer: firestoreGame.settings?.bombsPerPlayer ?? 0,
      enableBombs: firestoreGame.settings?.enableBombs ?? false,
      turnTimeLimit: firestoreGame.settings?.turnTimeLimit ?? 0,
      maxPlayers: firestoreGame.settings?.maxPlayers ?? 3,
    },
    players: firestoreGame.players.map((player: any) => ({
      ...player,
      board: {
        ...player.board,
        cells: cellsFromFirestore(player.board.cells),
      },
      // Valeur par défaut pour bombsRemaining si manquante
      bombsRemaining: player.bombsRemaining ?? 0,
      // Valeur par défaut pour skipNextTurns si manquante
      skipNextTurns: player.skipNextTurns ?? 0,
    })),
    turnStartTime: firestoreGame.turnStartTime,
  };
}

// Créer une nouvelle partie
export async function createGame(adminId: string, adminName: string, settings: GameSettings): Promise<Game> {
  const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const code = generateGameCode();

  const game: Game = {
    id: gameId,
    code,
    adminId,
    players: [{
      id: adminId,
      name: adminName,
      color: '#3B82F6', // Couleur par défaut
      board: { cells: Array(12).fill(null).map(() => Array(12).fill('empty')), ships: [] },
      bombsPlaced: [],
      bombsRemaining: settings.bombsPerPlayer || 0,
      isAlive: true,
      connected: true,
      skipNextTurns: 0,
    }],
    currentPlayerIndex: 0,
    currentTurn: 0,
    phase: 'lobby',
    status: 'waiting',
    settings,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  // Sauvegarder dans Firestore (convertir les tableaux 2D)
  await setDoc(doc(db, 'games', gameId), gameToFirestore(game));

  // Initialiser le chat en temps réel
  await set(ref(realtimeDb, `games/${gameId}/chat`), {
    messages: []
  });

  return game;
}

// Rejoindre une partie avec un code
export async function joinGame(code: string, playerId: string, playerName: string): Promise<Game | null> {
  try {
    // Chercher la partie par code
    const gamesRef = collection(db, 'games');
    const q = query(gamesRef, where('code', '==', code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Code de partie invalide');
    }

    const gameDoc = querySnapshot.docs[0];
    const game = gameFromFirestore(gameDoc.data());

    // Vérifier si la partie peut accueillir plus de joueurs
    if (game.players.length >= game.settings.maxPlayers) {
      throw new Error('Partie complète');
    }

    // Vérifier si le joueur est déjà dans la partie
    const existingPlayer = game.players.find(p => p.id === playerId);
    if (existingPlayer) {
      // Si le joueur est déjà dans la partie, retourner la partie (cas où il rafraîchit la page)
      return game;
    }

    // Générer une couleur unique
    const usedColors = game.players.map(p => p.color);
    const availableColors = ['#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316'];
    const color = availableColors.find(c => !usedColors.includes(c)) || '#6B7280';

    // Ajouter le joueur
    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      color,
      board: { cells: Array(12).fill(null).map(() => Array(12).fill('empty')), ships: [] },
      bombsPlaced: [],
      bombsRemaining: game.settings.bombsPerPlayer || 0,
      isAlive: true,
      connected: true,
      skipNextTurns: 0,
    };

    const updatedPlayers = [...game.players, newPlayer];
    const updatedGame = {
      ...game,
      players: updatedPlayers,
      lastActivity: Date.now(),
    };

    // Mettre à jour Firestore (convertir les tableaux 2D)
    await updateDoc(doc(db, 'games', game.id), {
      players: updatedPlayers.map(player => ({
        ...player,
        board: {
          ...player.board,
          cells: cellsToFirestore(player.board.cells),
        },
      })),
      lastActivity: Date.now(),
    });

    return updatedGame;
  } catch (error) {
    console.error('Erreur lors du rejoint de la partie:', error);
    return null;
  }
}

// Obtenir une partie par ID
export async function getGame(gameId: string): Promise<Game | null> {
  try {
    const gameDoc = await getDoc(doc(db, 'games', gameId));
    if (gameDoc.exists()) {
      return gameFromFirestore(gameDoc.data());
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la partie:', error);
    return null;
  }
}

// Écouter les changements d'une partie en temps réel
export function subscribeToGame(gameId: string, callback: (game: Game | null) => void) {
  const gameRef = doc(db, 'games', gameId);

  const unsubscribe = onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      const game = gameFromFirestore(doc.data());
      callback(game);
    } else {
      // Le jeu a été supprimé
      callback(null);
    }
  });

  return unsubscribe;
}

// Écouter le chat d'une partie
export function subscribeToChat(gameId: string, callback: (messages: LobbyMessage[]) => void) {
  const chatRef = ref(realtimeDb, `games/${gameId}/chat/messages`);

  const unsubscribe = onValue(chatRef, (snapshot) => {
    const messages = snapshot.val() || [];
    callback(Object.values(messages));
  });

  return () => off(chatRef);
}

// Envoyer un message dans le chat
export async function sendChatMessage(
  gameId: string, 
  playerId: string, 
  playerName: string, 
  message: string,
  type: 'lobby' | 'in-game' = 'lobby',
  gamePhase?: 'lobby' | 'placement' | 'playing' | 'finished'
) {
  const messagesRef = ref(realtimeDb, `games/${gameId}/chat/messages`);
  const newMessageRef = push(messagesRef);

  const chatMessage: any = {
    id: newMessageRef.key!,
    playerId,
    playerName,
    message: message.trim(),
    timestamp: Date.now(),
    type,
  };

  // Ne pas inclure gamePhase si elle est undefined (Firebase ne permet pas undefined)
  if (gamePhase !== undefined) {
    chatMessage.gamePhase = gamePhase;
  }

  await set(newMessageRef, chatMessage);
}

// Mettre à jour une partie
export async function updateGame(gameId: string, updates: Partial<Game>): Promise<void> {
  try {
    const gameRef = doc(db, 'games', gameId);
    
    // Filtrer les valeurs undefined (Firestore ne les supporte pas)
    const cleanUpdates: any = {
      lastActivity: Date.now(),
    };
    
    // Ajouter seulement les champs définis
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });
    
    // Si on met à jour les players, convertir leurs cells
    if (cleanUpdates.players) {
      cleanUpdates.players = cleanUpdates.players.map((player: Player) => ({
        ...player,
        board: {
          ...player.board,
          cells: cellsToFirestore(player.board.cells),
        },
      }));
    }
    
    await updateDoc(gameRef, cleanUpdates);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la partie:', error);
    throw error;
  }
}

// Mettre à jour les paramètres de la partie (admin seulement)
export async function updateGameSettings(gameId: string, adminId: string, settings: Partial<GameSettings>) {
  try {
    const game = await getGame(gameId);
    if (!game || game.adminId !== adminId) {
      throw new Error('Accès non autorisé');
    }

    await updateDoc(doc(db, 'games', gameId), {
      settings: { ...game.settings, ...settings },
      lastActivity: Date.now(),
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    throw error;
  }
}

// Lancer la partie (admin seulement)
export async function startGame(gameId: string, adminId: string) {
  try {
    const game = await getGame(gameId);
    if (!game || game.adminId !== adminId) {
      throw new Error('Accès non autorisé');
    }

    if (game.players.length < 2) {
      throw new Error('Il faut au moins 2 joueurs pour commencer');
    }

    // Initialiser les bombes restantes pour tous les joueurs
    const updatedPlayers = game.players.map(player => ({
      ...player,
      bombsRemaining: game.settings.bombsPerPlayer || 0,
      skipNextTurns: 0, // Réinitialiser les tours à sauter au début de la partie
    }));

    // Préparer les mises à jour (ne pas inclure turnStartTime pendant le placement)
    const gameUpdates: any = {
      phase: 'placement',
      status: 'active',
      currentTurn: 0,
      players: updatedPlayers.map(player => ({
        ...player,
        board: {
          ...player.board,
          cells: cellsToFirestore(player.board.cells),
        },
      })),
      lastActivity: Date.now(),
    };

    // Supprimer turnStartTime s'il existe (pas de timer pendant le placement)
    await updateDoc(doc(db, 'games', gameId), {
      ...gameUpdates,
      turnStartTime: deleteField(),
    });
  } catch (error) {
    console.error('Erreur lors du lancement de la partie:', error);
    throw error;
  }
}

// Obtenir la zone 5x5 autour d'une position (sans dépasser les bords)
function getBombRevealZone(x: number, y: number, boardSize: number = 12): Position[] {
  const positions: Position[] = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const newX = x + dx;
      const newY = y + dy;
      if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize) {
        positions.push({ x: newX, y: newY });
      }
    }
  }
  return positions;
}

// Placer une bombe
export async function placeBomb(
  gameId: string,
  playerId: string,
  targetPlayerId: string,
  position: Position
): Promise<void> {
  try {
    const game = await getGame(gameId);
    if (!game) throw new Error('Partie non trouvée');

    // Vérifications de sécurité
    if (game.phase !== 'playing') {
      throw new Error('La partie n\'est pas en cours');
    }

    const player = game.players.find(p => p.id === playerId);
    if (!player) throw new Error('Joueur non trouvé');

    // Vérifier que c'est le tour du joueur
    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      throw new Error('Ce n\'est pas votre tour');
    }

    // Vérifier que le joueur n'a pas de tours à sauter
    if (player.skipNextTurns && player.skipNextTurns > 0) {
      throw new Error('Vous devez sauter ce tour');
    }

    // Vérifier que le joueur est vivant
    if (!player.isAlive) {
      throw new Error('Vous ne pouvez pas placer de bombe si vous êtes éliminé');
    }

    // Vérifier les bombes disponibles
    if (player.bombsRemaining <= 0) {
      throw new Error('Vous n\'avez plus de bombes disponibles');
    }

    // Vérifier que les bombes sont activées
    if (!game.settings.enableBombs || game.settings.bombsPerPlayer === 0) {
      throw new Error('Les bombes ne sont pas activées dans cette partie');
    }

    // Vérifier que la position est valide
    if (position.x < 0 || position.x >= 12 || position.y < 0 || position.y >= 12) {
      throw new Error('Position invalide');
    }

    // Vérifier que le joueur cible existe et est vivant
    const targetPlayer = game.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer) {
      throw new Error('Joueur cible non trouvé');
    }
    if (targetPlayer.id === playerId) {
      throw new Error('Vous ne pouvez pas vous attaquer vous-même');
    }
    if (!targetPlayer.isAlive) {
      throw new Error('Vous ne pouvez pas placer de bombe sur un joueur éliminé');
    }

    // Vérifier qu'il n'y a pas déjà une bombe à cette position sur cette grille
    const existingBomb = game.players
      .flatMap(p => p.bombsPlaced)
      .find(b => 
        b.targetPlayerId === targetPlayerId && 
        b.position.x === position.x && 
        b.position.y === position.y &&
        !b.detonated &&
        !b.defused
      );
    if (existingBomb) {
      throw new Error('Une bombe existe déjà à cette position');
    }

    // Créer la bombe
    // Note: activatesAtTurn est calculé avec currentTurn + 2 car :
    // - La bombe est placée au tour N
    // - currentTurn sera incrémenté à N+1 juste après le placement
    // - Donc activatesAtTurn = N + 2 signifie que la bombe s'activera 2 tours après le placement
    //   (au tour N+2, après que currentTurn soit passé de N à N+1 puis à N+2)
    const bomb: Bomb = {
      id: `bomb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position,
      ownerId: playerId,
      targetPlayerId,
      placedAt: Date.now(),
      placedAtTurn: game.currentTurn,
      activatesAtTurn: game.currentTurn + 2,
      detonated: false,
      defused: false,
    };

    // Mettre à jour le joueur
    const updatedPlayers = game.players.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          bombsPlaced: [...p.bombsPlaced, bomb],
          bombsRemaining: p.bombsRemaining - 1,
        };
      }
      return p;
    });

    await updateGame(gameId, { players: updatedPlayers });
  } catch (error) {
    console.error('Erreur lors du placement de la bombe:', error);
    throw error;
  }
}

// Désamorcer une bombe
export async function defuseBomb(gameId: string, playerId: string, bombId: string): Promise<void> {
  try {
    const game = await getGame(gameId);
    if (!game) throw new Error('Partie non trouvée');

    // Vérifications de sécurité
    if (game.phase !== 'playing') {
      throw new Error('La partie n\'est pas en cours');
    }

    const player = game.players.find(p => p.id === playerId);
    if (!player) throw new Error('Joueur non trouvé');

    // Vérifier que c'est le tour du joueur
    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      throw new Error('Ce n\'est pas votre tour');
    }

    // Vérifier que le joueur n'a pas de tours à sauter
    if (player.skipNextTurns && player.skipNextTurns > 0) {
      throw new Error('Vous devez sauter ce tour');
    }

    // Vérifier que le joueur est vivant
    if (!player.isAlive) {
      throw new Error('Vous ne pouvez pas désamorcer de bombe si vous êtes éliminé');
    }

    // Trouver la bombe
    let targetBomb: Bomb | null = null;
    let bombOwner: Player | null = null;

    for (const player of game.players) {
      const bomb = player.bombsPlaced.find(b => b.id === bombId && b.targetPlayerId === playerId);
      // Permettre le désamorçage dès que le joueur reçoit la bombe (tour suivant le placement)
      // Le joueur peut désamorcer dès que c'est son tour et que la bombe a été placée
      // (pas besoin d'attendre le tour d'activation)
      if (bomb && !bomb.defused) {
        // Le joueur peut désamorcer dès le tour suivant le placement
        // (placedAtTurn + 1) ou au tour d'activation ou après
        // Cela permet au joueur de désamorcer dès qu'il reçoit la bombe
        if (game.currentTurn >= bomb.placedAtTurn + 1) {
          targetBomb = bomb;
          bombOwner = player;
          break;
        }
      }
    }

    if (!targetBomb || !bombOwner) {
      // Vérifier si la bombe existe mais n'est pas encore prête
      const bombExists = game.players.some(p => 
        p.bombsPlaced.some(b => b.id === bombId && b.targetPlayerId === playerId && !b.defused)
      );
      if (bombExists) {
        // Trouver la bombe pour donner plus d'infos sur le problème
        let foundBomb: Bomb | null = null;
        for (const player of game.players) {
          const bomb = player.bombsPlaced.find(b => b.id === bombId && b.targetPlayerId === playerId && !b.defused);
          if (bomb) {
            foundBomb = bomb;
            break;
          }
        }
        if (foundBomb) {
          throw new Error(`La bombe n'est pas encore prête à être désamorcée (tour actuel: ${game.currentTurn}, tour de placement: ${foundBomb.placedAtTurn}, tour d'activation: ${foundBomb.activatesAtTurn})`);
        }
        throw new Error('La bombe n\'est pas encore prête à être désamorcée');
      }
      throw new Error('Bombe non trouvée ou déjà désamorcée');
    }

    // Vérifier que le propriétaire de la bombe existe toujours
    if (!bombOwner.isAlive) {
      throw new Error('Le propriétaire de la bombe a été éliminé');
    }

    // Révéler la zone sur la grille de l'envoyeur (effet miroir)
    const revealZone = getBombRevealZone(targetBomb.position.x, targetBomb.position.y);
    const ownerPlayer = game.players.find(p => p.id === bombOwner!.id);
    if (ownerPlayer) {
      const updatedCells = ownerPlayer.board.cells.map((row, y) =>
        row.map((cell, x) => {
          const pos = revealZone.find(p => p.x === x && p.y === y);
          if (pos && (cell === 'empty' || cell === 'ship')) {
            // Différencier les cases avec navires et les cases vides
            return cell === 'ship' ? 'revealed_ship' : 'revealed_empty';
          }
          return cell;
        })
      );

      // Marquer la bombe comme désamorcée et marquer le joueur qui désamorce pour sauter 2 tours
      // Le propriétaire de la bombe reçoit 2 tours bonus pour jouer deux fois
      const updatedPlayers = game.players.map(p => {
        if (p.id === bombOwner!.id) {
          // Vérifier que le propriétaire n'a pas déjà des tours bonus (éviter les accumulations)
          const existingBonusTurns = p.bonusTurns || 0;
          return {
            ...p,
            bombsPlaced: p.bombsPlaced.map(b =>
              b.id === bombId ? { ...b, defused: true } : b
            ),
            board: {
              ...p.board,
              cells: updatedCells,
            },
            bonusTurns: Math.max(2, existingBonusTurns), // Ne pas réduire si déjà supérieur
          };
        } else if (p.id === playerId) {
          // Le joueur qui désamorce doit sauter 2 tours
          // Vérifier qu'il n'a pas déjà des tours à sauter (éviter les accumulations)
          const existingSkipTurns = p.skipNextTurns || 0;
          return {
            ...p,
            skipNextTurns: Math.max(2, existingSkipTurns), // Ne pas réduire si déjà supérieur
          };
        }
        return p;
      });

      await updateGame(gameId, { players: updatedPlayers });
    }
  } catch (error) {
    console.error('Erreur lors du désamorçage de la bombe:', error);
    throw error;
  }
}

// Activer les bombes qui doivent s'activer (appelé à chaque changement de tour)
export async function activateBombs(gameId: string): Promise<void> {
  try {
    const game = await getGame(gameId);
    if (!game) return;

    // Trouver toutes les bombes à activer
    const bombsToActivate: Array<{ bomb: Bomb; targetPlayerId: string }> = [];
    const currentPlayer = game.players[game.currentPlayerIndex];
    
    for (const player of game.players) {
      for (const bomb of player.bombsPlaced) {
        if (
          !bomb.detonated &&
          !bomb.defused &&
          game.currentTurn >= bomb.activatesAtTurn
        ) {
          // Ne pas activer immédiatement si c'est le tour du joueur cible
          // Le joueur doit avoir la possibilité de désamorcer avant que la bombe n'explose
          // On active seulement si ce n'est PAS le tour du joueur cible
          // OU si le tour d'activation est dépassé (currentTurn > activatesAtTurn)
          if (bomb.targetPlayerId !== currentPlayer.id || game.currentTurn > bomb.activatesAtTurn) {
            bombsToActivate.push({ bomb, targetPlayerId: bomb.targetPlayerId });
          }
        }
      }
    }

    if (bombsToActivate.length === 0) return;

    // Mettre à jour les joueurs cibles et marquer les bombes comme activées
    const updatedPlayers = game.players.map(player => {
      // Mettre à jour les cellules si ce joueur est ciblé
      let updatedCells = player.board.cells;
      for (const { bomb, targetPlayerId } of bombsToActivate) {
        if (targetPlayerId === player.id) {
            const revealZone = getBombRevealZone(bomb.position.x, bomb.position.y);
            updatedCells = updatedCells.map((row, y) =>
              row.map((cell, x) => {
                const pos = revealZone.find(p => p.x === x && p.y === y);
                // Révéler seulement les cases non révélées (empty ou ship)
                // Différencier les cases avec navires et les cases vides
                if (pos && (cell === 'empty' || cell === 'ship')) {
                  return cell === 'ship' ? 'revealed_ship' : 'revealed_empty';
                }
                return cell;
              })
            );
        }
      }

      // Marquer les bombes de ce joueur comme activées
      const updatedBombs = player.bombsPlaced.map(bomb => {
        const shouldActivate = bombsToActivate.some(
          ({ bomb: b }) => b.id === bomb.id
        );
        return shouldActivate ? { ...bomb, detonated: true } : bomb;
      });

      return {
        ...player,
        board: {
          ...player.board,
          cells: updatedCells,
        },
        bombsPlaced: updatedBombs,
      };
    });

    await updateGame(gameId, { players: updatedPlayers });
  } catch (error) {
    console.error('Erreur lors de l\'activation des bombes:', error);
  }
}

// Enregistrer le choix d'un joueur après la fin de partie
export async function setPlayerChoice(gameId: string, playerId: string, choice: 'lobby' | 'menu'): Promise<void> {
  try {
    const game = await getGame(gameId);
    if (!game) throw new Error('Partie non trouvée');

    const playerChoices = game.playerChoices || {};
    playerChoices[playerId] = choice;

    await updateDoc(doc(db, 'games', gameId), {
      playerChoices,
      lastActivity: Date.now(),
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du choix:', error);
    throw error;
  }
}

// Gérer la fin de partie et les choix des joueurs
export async function handleGameEnd(gameId: string, immediateReturnToLobby: boolean = false): Promise<void> {
  try {
    const game = await getGame(gameId);
    if (!game || game.phase !== 'finished') return;

    const choices = game.playerChoices || {};
    
    // Si retour immédiat au lobby, traiter directement sans attendre les autres
    if (immediateReturnToLobby) {
      const playersWhoChoseLobby = game.players.filter(p => choices[p.id] === 'lobby');
      
      if (playersWhoChoseLobby.length > 0) {
        const newAdmin = playersWhoChoseLobby[0];
        
        // Inclure tous les joueurs (ceux qui ont choisi lobby ET ceux qui n'ont pas encore choisi)
        // Les joueurs qui ont choisi "menu" seront exclus
        const playersToKeep = game.players.filter(p => 
          choices[p.id] === 'lobby' || choices[p.id] === undefined
        );
        
        // Réinitialiser les joueurs qui retournent au lobby
        const updatedPlayers = playersToKeep.map(player => ({
          ...player,
          board: {
            cells: Array(12).fill(null).map(() => Array(12).fill('empty')),
            ships: [],
          },
          bombsPlaced: [],
          bombsRemaining: game.settings.bombsPerPlayer || 0,
          isAlive: true,
          skipNextTurns: 0,
          bonusTurns: 0,
        }));

        await updateDoc(doc(db, 'games', gameId), {
          adminId: newAdmin.id,
          players: updatedPlayers.map(player => ({
            ...player,
            board: {
              ...player.board,
              cells: cellsToFirestore(player.board.cells),
            },
          })),
          phase: 'lobby',
          status: 'waiting',
          currentPlayerIndex: 0,
          currentTurn: 0,
          winnerId: deleteField(),
          playerChoices: {}, // Réinitialiser les choix
          lastActivity: Date.now(),
        });
        return;
      }
    }

    // Si un joueur choisit "menu", il quitte la partie
    // On ne fait rien ici, le joueur sera simplement retiré du lobby s'il n'y retourne pas
    // Si tous les joueurs ont choisi "menu", supprimer le lobby
    const allChoseMenu = game.players.every(p => choices[p.id] === 'menu');
    if (allChoseMenu) {
      await deleteDoc(doc(db, 'games', gameId));
      return;
    }

    // Si au moins un joueur a choisi "lobby", on peut retourner au lobby
    // Les joueurs qui ont choisi "menu" seront simplement absents du lobby
    const playersWhoChoseLobby = game.players.filter(p => choices[p.id] === 'lobby');
    if (playersWhoChoseLobby.length > 0) {
      const newAdmin = playersWhoChoseLobby[0];
      
      const updatedPlayers = playersWhoChoseLobby.map(player => ({
        ...player,
        board: {
          cells: Array(12).fill(null).map(() => Array(12).fill('empty')),
          ships: [],
        },
        bombsPlaced: [],
        bombsRemaining: game.settings.bombsPerPlayer || 0,
        isAlive: true,
        skipNextTurns: 0,
        bonusTurns: 0,
      }));

      await updateDoc(doc(db, 'games', gameId), {
        adminId: newAdmin.id,
        players: updatedPlayers.map(player => ({
          ...player,
          board: {
            ...player.board,
            cells: cellsToFirestore(player.board.cells),
          },
        })),
        phase: 'lobby',
        status: 'waiting',
        currentPlayerIndex: 0,
        currentTurn: 0,
        winnerId: deleteField(),
        playerChoices: {},
        lastActivity: Date.now(),
      });
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la fin de partie:', error);
  }
}

// Quitter une partie
export async function leaveGame(gameId: string, playerId: string) {
  try {
    const game = await getGame(gameId);
    if (!game) return;

    const updatedPlayers = game.players.filter(p => p.id !== playerId);

    // Si plus de joueurs, supprimer le lobby
    if (updatedPlayers.length === 0) {
      await deleteDoc(doc(db, 'games', gameId));
      return;
    }

    // Si la partie est en cours et qu'un joueur quitte, vérifier si la partie doit se terminer
    let updates: any = {
      players: updatedPlayers.map(player => ({
        ...player,
        board: {
          ...player.board,
          cells: cellsToFirestore(player.board.cells),
        },
      })),
      lastActivity: Date.now(),
    };

    // Si l'admin quitte, donner l'admin au premier joueur restant
    if (game.adminId === playerId) {
      updates.adminId = updatedPlayers[0].id;
    }

    // Si la partie est en cours (playing) et qu'il ne reste qu'un joueur vivant, terminer la partie
    if (game.phase === 'playing') {
      const alivePlayers = updatedPlayers.filter(p => p.isAlive);
      if (alivePlayers.length === 1) {
        updates.phase = 'finished';
        updates.status = 'finished';
        updates.winnerId = alivePlayers[0].id;
      }
    }

    await updateDoc(doc(db, 'games', gameId), updates);
  } catch (error) {
    console.error('Erreur lors de la sortie de la partie:', error);
    throw error;
  }
}

// Récupérer les parties actives d'un joueur
export async function getActiveGamesForPlayer(playerId: string): Promise<Game[]> {
  try {
    const gamesRef = collection(db, 'games');
    // Récupérer toutes les parties actives (lobby, placement, playing)
    // Firestore ne supporte pas !=, donc on utilise 'in' avec les phases actives
    const q = query(gamesRef, where('phase', 'in', ['lobby', 'placement', 'playing']));
    const querySnapshot = await getDocs(q);

    const activeGames: Game[] = [];

    querySnapshot.forEach((docSnapshot) => {
      try {
        const game = gameFromFirestore(docSnapshot.data());
        
        // Vérifier si le joueur est dans cette partie
        if (!game.players.some(p => p.id === playerId)) {
          return; // Le joueur n'est pas dans cette partie
        }
        
        // Vérifier que la partie n'est pas réellement terminée
        // (au cas où la phase n'aurait pas été mise à jour)
        const alivePlayers = game.players.filter(p => p.isAlive);
        if (alivePlayers.length <= 1 && (game.phase === 'playing' || game.phase === 'placement')) {
          // La partie devrait être terminée mais ne l'est pas encore
          // Marquer comme terminée et sauvegarder dans l'historique
          const winnerId = alivePlayers.length === 1 ? alivePlayers[0].id : undefined;
          
          // Mettre à jour la partie pour la marquer comme terminée (asynchrone, ne pas attendre)
          updateDoc(doc(db, 'games', game.id), {
            phase: 'finished',
            status: 'finished',
            winnerId: winnerId || deleteField(),
            lastActivity: Date.now(),
          }).then(() => {
            // Sauvegarder dans l'historique pour tous les joueurs
            game.players.forEach(player => {
              const historyEntry: GameHistoryEntry = {
                gameId: game.id,
                gameCode: game.code,
                players: game.players.map(p => ({
                  id: p.id,
                  name: p.name,
                  color: p.color,
                })),
                winnerId: winnerId,
                winnerName: winnerId ? game.players.find(p => p.id === winnerId)?.name : undefined,
                isWinner: player.id === winnerId,
                finishedAt: Date.now(),
                phase: 'finished',
              };
              saveGameToHistory(historyEntry);
            });
          }).catch(console.error);
          
          // Ne pas inclure dans les parties actives
          return;
        }
        
        // Vérifier que la partie n'est pas en phase 'finished'
        if (game.phase === 'finished') {
          return; // Ne pas inclure les parties terminées
        }
        
        activeGames.push(game);
      } catch (error) {
        console.error('Erreur lors de la conversion d\'une partie:', error);
      }
    });

    // Trier par dernière activité (plus récent en premier)
    activeGames.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));

    return activeGames;
  } catch (error) {
    console.error('Erreur lors de la récupération des parties actives:', error);
    return [];
  }
}

// Nettoyer les lobbies vides et les parties finies anciennes (appelé périodiquement)
export async function cleanupEmptyLobbies(): Promise<void> {
  try {
    const gamesRef = collection(db, 'games');
    const snapshot = await getDocs(gamesRef);
    const now = Date.now();
    const THIRTY_SECONDS = 30 * 1000;
    const ONE_HOUR = 60 * 60 * 1000; // 1 heure pour les parties finies

    const deletePromises: Promise<void>[] = [];
    const updatePromises: Promise<void>[] = [];

    snapshot.forEach((docSnapshot) => {
      try {
        const gameData = docSnapshot.data();
        const gameId = docSnapshot.id;
        const players = gameData.players || [];
        const lastActivity = gameData.lastActivity || 0;
        const phase = gameData.phase || 'lobby';
        const game = gameFromFirestore(gameData);

        // Nettoyer les lobbies vides
        if (phase === 'lobby') {
          // Supprimer si :
          // 1. Le lobby n'a pas de joueurs
          // 2. Le lobby n'a pas été actif depuis 30 secondes ET n'a pas de joueurs
          if (
            players.length === 0 ||
            (lastActivity > 0 && (now - lastActivity) > THIRTY_SECONDS && players.length === 0)
          ) {
            deletePromises.push(deleteDoc(doc(db, 'games', gameId)));
          }
        }
        
        // Vérifier les parties en cours qui devraient être terminées
        if (phase === 'playing' || phase === 'placement') {
          const alivePlayers = game.players.filter(p => p.isAlive);
          
          // Si tous les joueurs sont morts ou il n'en reste qu'un, marquer comme terminée
          if (alivePlayers.length <= 1) {
            const winnerId = alivePlayers.length === 1 ? alivePlayers[0].id : undefined;
            
            // Mettre à jour la partie pour la marquer comme terminée
            updatePromises.push(
              updateDoc(doc(db, 'games', gameId), {
                phase: 'finished',
                status: 'finished',
                winnerId: winnerId || deleteField(),
                lastActivity: Date.now(),
              }).then(() => {
                // Sauvegarder dans l'historique pour tous les joueurs
                game.players.forEach(player => {
                  const historyEntry: GameHistoryEntry = {
                    gameId: game.id,
                    gameCode: game.code,
                    players: game.players.map(p => ({
                      id: p.id,
                      name: p.name,
                      color: p.color,
                    })),
                    winnerId: winnerId,
                    winnerName: winnerId ? game.players.find(p => p.id === winnerId)?.name : undefined,
                    isWinner: player.id === winnerId,
                    finishedAt: Date.now(),
                    phase: 'finished',
                  };
                  saveGameToHistory(historyEntry);
                });
              })
            );
          }
        }
        
        // Nettoyer les parties finies anciennes (plus d'1 heure)
        if (phase === 'finished') {
          if (lastActivity > 0 && (now - lastActivity) > ONE_HOUR) {
            deletePromises.push(deleteDoc(doc(db, 'games', gameId)));
          }
        }
      } catch (error) {
        console.error('Erreur lors du traitement d\'une partie:', error);
      }
    });

    await Promise.all([...deletePromises, ...updatePromises]);
    
    if (deletePromises.length > 0 || updatePromises.length > 0) {
      console.log(`Nettoyage: ${deletePromises.length} partie(s) supprimée(s), ${updatePromises.length} partie(s) marquée(s) comme terminée(s)`);
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des lobbies vides:', error);
  }
}

