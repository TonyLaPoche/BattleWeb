import { db, realtimeDb } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot, deleteDoc, deleteField } from 'firebase/firestore';
import { ref, set, get, onValue, off, push, update } from 'firebase/database';
import { Game, Player, GameSettings, LobbyMessage, GameMove, CellState, GameBoard, Bomb, Position } from '@/types/game';

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
    },
    players: firestoreGame.players.map((player: any) => ({
      ...player,
      board: {
        ...player.board,
        cells: cellsFromFirestore(player.board.cells),
      },
      // Valeur par défaut pour bombsRemaining si manquante
      bombsRemaining: player.bombsRemaining ?? 0,
    })),
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

    // Vérifier si le joueur n'est pas déjà dans la partie
    if (game.players.some(p => p.id === playerId)) {
      throw new Error('Vous êtes déjà dans cette partie');
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
export function subscribeToGame(gameId: string, callback: (game: Game) => void) {
  const gameRef = doc(db, 'games', gameId);

  const unsubscribe = onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      const game = gameFromFirestore(doc.data());
      callback(game);
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
export async function sendChatMessage(gameId: string, playerId: string, playerName: string, message: string) {
  const messagesRef = ref(realtimeDb, `games/${gameId}/chat/messages`);
  const newMessageRef = push(messagesRef);

  const chatMessage: LobbyMessage = {
    id: newMessageRef.key!,
    playerId,
    playerName,
    message: message.trim(),
    timestamp: Date.now(),
  };

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
    }));

    await updateDoc(doc(db, 'games', gameId), {
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

    const player = game.players.find(p => p.id === playerId);
    if (!player) throw new Error('Joueur non trouvé');

    if (player.bombsRemaining <= 0) {
      throw new Error('Vous n\'avez plus de bombes disponibles');
    }

    if (!game.settings.enableBombs || game.settings.bombsPerPlayer === 0) {
      throw new Error('Les bombes ne sont pas activées dans cette partie');
    }

    // Créer la bombe
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

    // Trouver la bombe
    let targetBomb: Bomb | null = null;
    let bombOwner: Player | null = null;

    for (const player of game.players) {
      const bomb = player.bombsPlaced.find(b => b.id === bombId && b.targetPlayerId === playerId);
      if (bomb && !bomb.detonated && !bomb.defused) {
        targetBomb = bomb;
        bombOwner = player;
        break;
      }
    }

    if (!targetBomb || !bombOwner) {
      throw new Error('Bombe non trouvée ou déjà désamorcée/activée');
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

      // Marquer la bombe comme désamorcée
      const updatedPlayers = game.players.map(p => {
        if (p.id === bombOwner!.id) {
          return {
            ...p,
            bombsPlaced: p.bombsPlaced.map(b =>
              b.id === bombId ? { ...b, defused: true } : b
            ),
            board: {
              ...p.board,
              cells: updatedCells,
            },
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
    
    for (const player of game.players) {
      for (const bomb of player.bombsPlaced) {
        if (
          !bomb.detonated &&
          !bomb.defused &&
          game.currentTurn >= bomb.activatesAtTurn
        ) {
          bombsToActivate.push({ bomb, targetPlayerId: bomb.targetPlayerId });
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
export async function handleGameEnd(gameId: string): Promise<void> {
  try {
    const game = await getGame(gameId);
    if (!game || game.phase !== 'finished') return;

    const choices = game.playerChoices || {};
    const allPlayersChose = game.players.every(p => choices[p.id] !== undefined);

    if (!allPlayersChose) return; // Attendre que tous les joueurs choisissent

    const allChoseLobby = game.players.every(p => choices[p.id] === 'lobby');
    const allChoseMenu = game.players.every(p => choices[p.id] === 'menu');

    if (allChoseMenu) {
      // Supprimer le lobby
      await deleteDoc(doc(db, 'games', gameId));
    } else if (allChoseLobby) {
      // Retourner au lobby - réinitialiser la partie
      const updatedPlayers = game.players.map(player => ({
        ...player,
        board: {
          cells: Array(12).fill(null).map(() => Array(12).fill('empty')),
          ships: [],
        },
        bombsPlaced: [],
        bombsRemaining: game.settings.bombsPerPlayer || 0,
        isAlive: true,
      }));

      await updateDoc(doc(db, 'games', gameId), {
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
    } else {
      // Cas mixte : certains ont choisi lobby, d'autres menu
      // Garder seulement les joueurs qui ont choisi lobby
      const playersWhoChoseLobby = game.players.filter(p => choices[p.id] === 'lobby');
      
      if (playersWhoChoseLobby.length > 0) {
        // Le premier joueur qui a choisi lobby devient admin
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

    if (updatedPlayers.length === 0) {
      // Supprimer la partie si plus de joueurs
      await deleteDoc(doc(db, 'games', gameId));
    } else {
      // Mettre à jour la partie
      const updates: any = {
        players: updatedPlayers,
        lastActivity: Date.now(),
      };

      // Si l'admin quitte, donner l'admin au premier joueur restant
      if (game.adminId === playerId && updatedPlayers.length > 0) {
        updates.adminId = updatedPlayers[0].id;
      }

      await updateDoc(doc(db, 'games', gameId), updates);
    }
  } catch (error) {
    console.error('Erreur lors de la sortie de la partie:', error);
  }
}

