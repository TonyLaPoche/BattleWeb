'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Ship, ShipType, Position, SHIPS_CONFIG, BOARD_SIZE, CellState } from '@/types/game';

interface ShipPlacerProps {
  ships: Ship[];
  onShipPlace: (shipId: string, positions: Position[]) => void;
  onShipRemove: (shipId: string) => void;
  gridCells: CellState[][];
  onGridDragOver?: (x: number, y: number) => void;
  onGridDrop?: (x: number, y: number) => void;
  className?: string;
}

export const ShipPlacer = forwardRef<{ handleDragOver: (x: number, y: number) => void; handleDrop: (x: number, y: number) => void }, ShipPlacerProps>(({
  ships,
  onShipPlace,
  onShipRemove,
  gridCells,
  onGridDragOver,
  onGridDrop,
  className = ""
}, ref) => {
  const [draggedShip, setDraggedShip] = useState<Ship | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<Position | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number; ship: Ship } | null>(null);

  // Générer les positions d'un navire à partir d'une position de départ
  const generateShipPositions = (
    startX: number,
    startY: number,
    ship: Ship,
    horizontal: boolean = true
  ): Position[] => {
    const positions: Position[] = [];

    for (let i = 0; i < ship.size; i++) {
      const x = horizontal ? startX + i : startX;
      const y = horizontal ? startY : startY + i;

      // Vérifier les limites de la grille
      if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
        return []; // Position invalide
      }

      positions.push({ x, y });
    }

    return positions;
  };

  // Vérifier si une position est valide pour placer un navire
  const isValidPosition = (positions: Position[]): boolean => {
    // Vérifier que toutes les positions sont dans la grille
    if (positions.length === 0) return false;

    // Vérifier qu'aucune position n'est déjà occupée
    for (const pos of positions) {
      if (gridCells[pos.y][pos.x] !== 'empty') {
        return false;
      }
    }

    return true;
  };

  // Gestionnaire de début de drag (souris)
  const handleDragStart = (e: React.DragEvent, ship: Ship) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ship.id); // Nécessaire pour Firefox
    setDraggedShip(ship);
  };

  // Gestionnaire de début de touch (mobile)
  const handleTouchStart = (e: React.TouchEvent, ship: Ship) => {
    if (ship.positions.length > 0) return; // Ne pas permettre de déplacer un navire déjà placé
    
    const touch = e.touches[0];
    setTouchStartPos({
      x: touch.clientX,
      y: touch.clientY,
      ship,
    });
    setDraggedShip(ship);
    e.preventDefault(); // Empêcher le scroll
  };

  // Gestionnaire de mouvement touch (mobile)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos || !draggedShip) return;
    e.preventDefault(); // Empêcher le scroll pendant le drag
  };

  // Gestionnaire de fin de touch (mobile)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos || !draggedShip) {
      setTouchStartPos(null);
      setDraggedShip(null);
      return;
    }

    const touch = e.changedTouches[0];
    // Trouver l'élément sous le touch
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Chercher la case de la grille la plus proche
    const gridCell = element?.closest('[data-grid-cell]');
    if (gridCell) {
      const x = parseInt(gridCell.getAttribute('data-x') || '0');
      const y = parseInt(gridCell.getAttribute('data-y') || '0');
      handleDrop(x, y);
    }

    setTouchStartPos(null);
    setDraggedShip(null);
    setDragOverPosition(null);
  };

  // Gestionnaire de survol pendant le drag
  const handleDragOver = (x: number, y: number) => {
    if (!draggedShip) return;

    // Essayer d'abord horizontalement, puis verticalement si ça ne marche pas
    let positions = generateShipPositions(x, y, draggedShip, true);
    if (!isValidPosition(positions)) {
      positions = generateShipPositions(x, y, draggedShip, false);
    }

    const isValid = positions.length > 0 && isValidPosition(positions);
    setDragOverPosition(isValid ? { x, y } : null);
    
    // Appeler le callback si fourni
    if (onGridDragOver) {
      onGridDragOver(x, y);
    }
  };

  // Gestionnaire de fin de drag
  const handleDrop = (x: number, y: number) => {
    if (!draggedShip) {
      setDraggedShip(null);
      setDragOverPosition(null);
      return;
    }

    // Essayer horizontalement d'abord
    let positions = generateShipPositions(x, y, draggedShip, true);
    let horizontal = true;

    // Si pas valide, essayer verticalement
    if (!isValidPosition(positions)) {
      positions = generateShipPositions(x, y, draggedShip, false);
      horizontal = false;
    }

    // Si toujours pas valide, annuler
    if (!isValidPosition(positions)) {
      setDraggedShip(null);
      setDragOverPosition(null);
      return;
    }

    // Placer le navire
    onShipPlace(draggedShip.id, positions);

    setDraggedShip(null);
    setDragOverPosition(null);
    
    // Appeler le callback si fourni
    if (onGridDrop) {
      onGridDrop(x, y);
    }
  };

  // Exposer les méthodes via ref
  useImperativeHandle(ref, () => ({
    handleDragOver,
    handleDrop,
  }));

  // Rendu d'un navire dans la palette
  const renderShipInPalette = (ship: Ship) => {
    const isPlaced = ship.positions.length > 0;
    const isDragging = draggedShip?.id === ship.id;

    return (
      <div
        key={ship.id}
        draggable={!isPlaced}
        onDragStart={(e) => handleDragStart(e, ship)}
        onDragEnd={() => {
          // Réinitialiser si le drop n'a pas été effectué
          setTimeout(() => {
            setDraggedShip(null);
            setDragOverPosition(null);
          }, 100);
        }}
        onTouchStart={(e) => handleTouchStart(e, ship)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`
          p-3 mb-2 rounded-lg border-2 transition-all cursor-move
          ${isPlaced
            ? 'bg-green-100 border-green-500 cursor-default'
            : 'bg-gray-100 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
          ${isDragging ? 'opacity-50' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm">
              {SHIPS_CONFIG[ship.type].name}
            </h4>
            <p className="text-xs text-gray-600">
              {ship.size} cases • {isPlaced ? 'Placé' : 'À placer'}
            </p>
          </div>

          {/* Représentation visuelle du navire */}
          <div className="flex space-x-1">
            {Array.from({ length: ship.size }, (_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gray-600 rounded-sm"
              />
            ))}
          </div>

          {/* Bouton supprimer si placé */}
          {isPlaced && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShipRemove(ship.id);
              }}
              className="ml-2 text-red-500 hover:text-red-700 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Placement des navires</h3>

      <div className="space-y-1">
        {ships.map(renderShipInPalette)}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Instructions :</strong> Glissez-déposez les navires sur la grille.
          Les navires s'orientent automatiquement selon l'espace disponible.
        </p>
      </div>

      {/* Indicateur de drag */}
      {draggedShip && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Placement du {SHIPS_CONFIG[draggedShip.type].name}...
            {dragOverPosition ? ' ✅ Position valide' : ' ❌ Position invalide'}
          </p>
        </div>
      )}
    </div>
  );
});
