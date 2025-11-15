import { useState, useCallback } from 'react';
import { Ship, Position, ShipType, BOARD_SIZE, SHIPS_CONFIG, CellState } from '@/types/game';

// Hook pour gérer la logique de placement des navires
export const useShipPlacement = () => {
  const [ships, setShips] = useState<Ship[]>(() => {
    return Object.entries(SHIPS_CONFIG).map(([type, config], index) => ({
      id: `ship-${index}`,
      type: type as ShipType,
      size: config.size,
      positions: [],
      hits: 0,
      sunk: false,
    }));
  });

  const [gridCells, setGridCells] = useState<CellState[][]>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill('empty' as CellState))
  );

  // Vérifier si une position est valide pour un navire
  const isValidShipPosition = useCallback((
    positions: Position[],
    grid: CellState[][]
  ): boolean => {
    // Vérifier les limites
    for (const pos of positions) {
      if (pos.x < 0 || pos.x >= BOARD_SIZE || pos.y < 0 || pos.y >= BOARD_SIZE) {
        return false;
      }
    }

    // Vérifier les collisions
    for (const pos of positions) {
      if (grid[pos.y][pos.x] !== 'empty') {
        return false;
      }
    }

    return true;
  }, []);

  // Générer les positions d'un navire
  const generateShipPositions = useCallback((
    startX: number,
    startY: number,
    size: number,
    horizontal: boolean
  ): Position[] => {
    const positions: Position[] = [];

    for (let i = 0; i < size; i++) {
      const x = horizontal ? startX + i : startX;
      const y = horizontal ? startY : startY + i;
      positions.push({ x, y });
    }

    return positions;
  }, []);

  // Placer un navire automatiquement (pour les tests ou placement rapide)
  const placeShip = useCallback((shipId: string, positions: Position[]) => {
    if (!isValidShipPosition(positions, gridCells)) {
      return false;
    }

    // Mettre à jour le navire
    setShips(prevShips =>
      prevShips.map(ship =>
        ship.id === shipId
          ? { ...ship, positions }
          : ship
      )
    );

    // Mettre à jour la grille
    setGridCells(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      positions.forEach(pos => {
        newGrid[pos.y][pos.x] = 'ship';
      });
      return newGrid;
    });

    return true;
  }, [gridCells, isValidShipPosition]);

  // Retirer un navire
  const removeShip = useCallback((shipId: string) => {
    const ship = ships.find(s => s.id === shipId);
    if (!ship || ship.positions.length === 0) return;

    // Nettoyer la grille
    setGridCells(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      ship.positions.forEach(pos => {
        newGrid[pos.y][pos.x] = 'empty';
      });
      return newGrid;
    });

    // Retirer les positions du navire
    setShips(prevShips =>
      prevShips.map(s =>
        s.id === shipId
          ? { ...s, positions: [] }
          : s
      )
    );
  }, [ships]);

  // Placement automatique de tous les navires (pour les tests)
  const autoPlaceShips = useCallback(() => {
    const newGrid = Array(BOARD_SIZE).fill(null).map(() =>
      Array(BOARD_SIZE).fill('empty')
    );
    const placedShips = [...ships];

    ships.forEach((ship, index) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const horizontal = Math.random() > 0.5;
        const startX = Math.floor(Math.random() * (horizontal ? BOARD_SIZE - ship.size : BOARD_SIZE));
        const startY = Math.floor(Math.random() * (horizontal ? BOARD_SIZE : BOARD_SIZE - ship.size));

        const positions = generateShipPositions(startX, startY, ship.size, horizontal);

        if (isValidShipPosition(positions, newGrid)) {
          // Placer le navire
          positions.forEach(pos => {
            newGrid[pos.y][pos.x] = 'ship';
          });

          placedShips[index] = { ...ship, positions };
          placed = true;
        }

        attempts++;
      }
    });

    setShips(placedShips);
    setGridCells(newGrid);
  }, [ships, generateShipPositions, isValidShipPosition]);

  // Réinitialiser le placement
  const resetPlacement = useCallback(() => {
    setShips(prevShips =>
      prevShips.map(ship => ({ ...ship, positions: [] }))
    );
    setGridCells(
      Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill('empty'))
    );
  }, []);

  // Vérifier si tous les navires sont placés
  const allShipsPlaced = ships.every(ship => ship.positions.length > 0);

  return {
    ships,
    gridCells,
    allShipsPlaced,
    placeShip,
    removeShip,
    autoPlaceShips,
    resetPlacement,
    isValidShipPosition,
    generateShipPositions,
  };
};
