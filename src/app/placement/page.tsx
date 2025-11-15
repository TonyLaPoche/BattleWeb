'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Grid } from '@/components/game/Grid';
import { ShipPlacer } from '@/components/game/ShipPlacer';
import { useShipPlacement } from '@/hooks/useGameLogic';
import { getGame, updateGame, subscribeToGame } from '@/services/gameService';
import { Game, Player } from '@/types/game';

export default function PlacementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const gameId = searchParams.get('gameId');
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const shipPlacerRef = useRef<{ handleDragOver: (x: number, y: number) => void; handleDrop: (x: number, y: number) => void } | null>(null);

  const {
    ships,
    gridCells,
    allShipsPlaced,
    placeShip,
    removeShip,
    autoPlaceShips,
    resetPlacement,
  } = useShipPlacement();

  // Charger la partie depuis Firebase et écouter les changements
  useEffect(() => {
    if (!gameId || !user) {
      router.push('/dashboard');
      return;
    }

    const loadGame = async () => {
      try {
        const loadedGame = await getGame(gameId);
        if (loadedGame) {
          setGame(loadedGame);
          // Vérifier que l'utilisateur est dans la partie
          const player = loadedGame.players.find(p => p.id === user.uid);
          if (!player) {
            router.push('/dashboard');
            return;
          }
          
          // Si la phase est 'playing', rediriger vers le jeu
          if (loadedGame.phase === 'playing') {
            router.push(`/game/${gameId}`);
            return;
          }
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la partie:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadGame();
    
    // Écouter les changements de la partie en temps réel
    const unsubscribe = subscribeToGame(gameId, (updatedGame) => {
      setGame(updatedGame);
      
      // Si la phase passe à 'playing', rediriger vers le jeu
      if (updatedGame.phase === 'playing') {
        router.push(`/game/${gameId}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [gameId, user, router]);

  // Gestionnaire de survol (pour preview du placement)
  const handleCellHover = (x: number, y: number) => {
    // TODO: Implémenter la preview du placement
  };

  // Gestionnaire de drag over sur la grille
  const handleGridDragOver = (x: number, y: number) => {
    if (shipPlacerRef.current) {
      shipPlacerRef.current.handleDragOver(x, y);
    }
  };

  // Gestionnaire de drop sur la grille
  const handleGridDrop = (x: number, y: number) => {
    if (shipPlacerRef.current) {
      shipPlacerRef.current.handleDrop(x, y);
    }
  };

  // Gestionnaire de placement de navire (drag & drop)
  const handleShipPlace = (shipId: string, positions: any[]) => {
    placeShip(shipId, positions);
  };

  // Gestionnaire de suppression de navire
  const handleShipRemove = (shipId: string) => {
    removeShip(shipId);
  };

  // Valider le placement et sauvegarder dans Firebase
  const handleValidatePlacement = async () => {
    if (!allShipsPlaced || !game || !user) return;

    setSaving(true);
    try {
      // Trouver le joueur actuel
      const currentPlayer = game.players.find(p => p.id === user.uid);
      if (!currentPlayer) {
        throw new Error('Joueur non trouvé dans la partie');
      }

      // Mettre à jour la grille et les navires du joueur
      const updatedPlayer: Player = {
        ...currentPlayer,
        board: {
          cells: gridCells,
          ships: ships,
        },
      };

      // Mettre à jour la liste des joueurs
      const updatedPlayers = game.players.map(p =>
        p.id === user.uid ? updatedPlayer : p
      );

      // Vérifier si tous les joueurs ont placé leurs navires
      const allPlayersReady = updatedPlayers.every(p => 
        p.board.ships.length > 0 && p.board.ships.every(s => s.positions.length > 0)
      );

      // Mettre à jour la partie dans Firebase
      await updateGame(game.id, {
        players: updatedPlayers,
        phase: allPlayersReady ? 'playing' : 'placement',
        status: allPlayersReady ? 'active' : 'active',
        lastActivity: Date.now(),
      });

      // Si tous les joueurs sont prêts, passer au jeu
      if (allPlayersReady) {
        router.push(`/game/${game.id}`);
      } else {
        // Sinon, attendre que les autres joueurs placent leurs navires
        alert('Placement enregistré ! En attente des autres joueurs...');
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du placement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement de la partie...</div>
      </div>
    );
  }

  if (!game) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Placement de la flotte</h1>
          <p className="text-gray-600 mt-2">
            Placez vos navires sur la grille avant de commencer la partie
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Grille de jeu */}
          <div className="lg:col-span-2 flex justify-center overflow-x-auto">
            <Grid
              cells={gridCells}
              onCellHover={handleCellHover}
              onDragOver={handleGridDragOver}
              onDrop={handleGridDrop}
              showCoordinates={true}
              className="shadow-xl"
            />
          </div>

          {/* Panneau de placement */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <ShipPlacer
              ref={shipPlacerRef}
              ships={ships}
              onShipPlace={handleShipPlace}
              onShipRemove={handleShipRemove}
              gridCells={gridCells}
              onGridDragOver={handleGridDragOver}
              onGridDrop={handleGridDrop}
            />

            {/* Boutons d'action */}
            <div className="mt-6 space-y-3">
              {/* Placement automatique */}
              <button
                onClick={autoPlaceShips}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Placement automatique
              </button>

              {/* Réinitialiser */}
              <button
                onClick={resetPlacement}
                className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
              >
                Réinitialiser
              </button>

              {/* Bouton de validation */}
              <button
                onClick={handleValidatePlacement}
                disabled={!allShipsPlaced || saving}
                className={`
                  w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors
                  ${allShipsPlaced && !saving
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                {saving ? 'Sauvegarde...' : allShipsPlaced ? 'Valider le placement' : 'Placez tous vos navires'}
              </button>
            </div>

            {/* Statistiques */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Votre flotte</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>• Navires placés: {ships.filter(s => s.positions.length > 0).length}/{ships.length}</p>
                <p>• Cases occupées: {ships.reduce((total, ship) => total + ship.positions.length, 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
