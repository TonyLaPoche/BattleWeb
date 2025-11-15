'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Grid } from '@/components/game/Grid';
import { useShipPlacement } from '@/hooks/useGameLogic';
import { getGame, updateGame, subscribeToGame } from '@/services/gameService';
import { Game, Player } from '@/types/game';

function PlacementPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const gameId = searchParams.get('gameId');
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoPlaced, setAutoPlaced] = useState(false);

  const {
    ships,
    gridCells,
    allShipsPlaced,
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

  // Placement automatique au chargement si pas encore fait
  useEffect(() => {
    if (!autoPlaced && !loading && game) {
      autoPlaceShips();
      setAutoPlaced(true);
    }
  }, [autoPlaced, loading, game, autoPlaceShips]);

  // Gestionnaire de placement automatique
  const handleAutoPlace = () => {
    autoPlaceShips();
    setAutoPlaced(true);
  };

  // Gestionnaire de réinitialisation
  const handleReset = () => {
    resetPlacement();
    setAutoPlaced(false);
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
        turnStartTime: allPlayersReady ? Date.now() : undefined, // Démarrer le timer si la partie commence
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
            Vos navires seront placés automatiquement sur la grille
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Grille de jeu */}
            <div className="flex justify-center overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="inline-block">
                <Grid
                  cells={gridCells}
                  showCoordinates={true}
                  className="shadow-xl"
                />
              </div>
            </div>

            {/* Panneau de contrôle */}
            <div className="flex flex-col justify-center space-y-4">
              {/* Statistiques */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border-2 border-blue-200 p-6">
                <h4 className="text-xl font-bold text-blue-900 mb-4">📊 Votre flotte</h4>
                <div className="space-y-2 text-base text-blue-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Navires placés:</span>
                    <span className="font-bold text-blue-600">
                      {ships.filter(s => s.positions.length > 0).length}/{ships.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Cases occupées:</span>
                    <span className="font-bold text-blue-600">
                      {ships.reduce((total, ship) => total + ship.positions.length, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                {/* Placement automatique */}
                <button
                  onClick={handleAutoPlace}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  🔄 Nouveau placement automatique
                </button>

                {/* Réinitialiser */}
                <button
                  onClick={handleReset}
                  className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl font-semibold text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  🔃 Réinitialiser
                </button>

                {/* Bouton de validation */}
                <button
                  onClick={handleValidatePlacement}
                  disabled={!allShipsPlaced || saving}
                  className={`
                    w-full py-4 px-4 rounded-xl font-bold text-lg shadow-lg transition-all
                    ${allShipsPlaced && !saving
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-105 active:scale-95'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {saving ? '⏳ Sauvegarde...' : allShipsPlaced ? '✅ Valider le placement' : '⏸️ Placez tous vos navires'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlacementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement de la partie...</div>
      </div>
    }>
      <PlacementPageContent />
    </Suspense>
  );
}
