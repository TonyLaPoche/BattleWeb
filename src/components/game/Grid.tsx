'use client';

import { CellState, BOARD_SIZE } from '@/types/game';

interface GridProps {
  cells: CellState[][];
  onCellClick?: (x: number, y: number) => void;
  onCellHover?: (x: number, y: number) => void;
  onDragOver?: (x: number, y: number) => void;
  onDrop?: (x: number, y: number) => void;
  interactive?: boolean;
  showCoordinates?: boolean;
  className?: string;
}

export const Grid = ({
  cells,
  onCellClick,
  onCellHover,
  onDragOver,
  onDrop,
  interactive = false,
  showCoordinates = true,
  className = ""
}: GridProps) => {
  const getCellColor = (state: CellState): string => {
    switch (state) {
      case 'ship':
        return 'bg-slate-700 border-slate-800'; // Navire (visible seulement pour le propriétaire)
      case 'hit':
        return 'bg-red-600 border-red-700 shadow-inner'; // Touché - Rouge vif
      case 'miss':
        return 'bg-sky-300 border-sky-400'; // Raté - Bleu clair
      case 'revealed_ship':
        return 'bg-amber-400 border-amber-500 shadow-md'; // Révélé avec navire - Jaune/Ambre
      case 'revealed_empty':
        return 'bg-cyan-200 border-cyan-300'; // Révélé vide - Cyan clair
      case 'revealed':
        return 'bg-amber-400 border-amber-500'; // Révélé (ancien format, pour compatibilité)
      case 'empty':
      default:
        return 'bg-blue-100 border-blue-200 hover:bg-blue-200 hover:border-blue-300'; // Eau
    }
  };

  const getCellCursor = (state: CellState): string => {
    if (!onCellClick) return 'cursor-default';
    // Si la case a déjà été tirée ou révélée vide, pas de curseur pointer
    // MAIS on peut cliquer sur revealed_ship car il y a un navire à détruire
    if (state === 'hit' || state === 'miss' || state === 'revealed' || state === 'revealed_empty') {
      return 'cursor-not-allowed';
    }
    return 'cursor-pointer';
  };

  const handleCellClick = (x: number, y: number) => {
    if (onCellClick) {
      onCellClick(x, y);
    }
  };

  const handleCellHover = (x: number, y: number) => {
    if (interactive && onCellHover) {
      onCellHover(x, y);
    }
  };

  const handleDragOver = (e: React.DragEvent, x: number, y: number) => {
    if (onDragOver) {
      e.preventDefault(); // Permet le drop
      e.stopPropagation();
      onDragOver(x, y);
    }
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    if (onDrop) {
      e.preventDefault();
      e.stopPropagation();
      onDrop(x, y);
    }
  };

  return (
    <div className={`inline-block w-full max-w-full ${className}`}>
      <div className="grid gap-0.5 sm:gap-1 p-2 sm:p-4 bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg shadow-xl border-2 border-blue-700 mx-auto"
           style={{
             gridTemplateColumns: showCoordinates ? `auto repeat(${BOARD_SIZE}, minmax(0, 1fr))` : `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
             gridTemplateRows: showCoordinates ? `auto repeat(${BOARD_SIZE}, minmax(0, 1fr))` : `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
             maxWidth: '100%',
           }}>

        {/* Coordonnées des colonnes (A-L) */}
        {showCoordinates && (
          <>
            <div className="min-w-[20px] min-h-[20px] sm:min-w-[24px] sm:min-h-[24px] md:min-w-[32px] md:min-h-[32px] aspect-square"></div> {/* Coin supérieur gauche vide */}
            {Array.from({ length: BOARD_SIZE }, (_, i) => (
              <div key={`col-${i}`} className="min-w-[20px] min-h-[20px] sm:min-w-[24px] sm:min-h-[24px] md:min-w-[32px] md:min-h-[32px] aspect-square flex items-center justify-center text-white font-bold text-[10px] sm:text-xs md:text-sm bg-blue-700/50 rounded">
                {String.fromCharCode(65 + i)} {/* A, B, C, ... L */}
              </div>
            ))}
          </>
        )}

        {/* Lignes avec coordonnées */}
        {cells.map((row, y) => (
          <div key={`row-${y}`} className="contents">
            {/* Coordonnée de la ligne (1-12) */}
            {showCoordinates && (
              <div className="min-w-[20px] min-h-[20px] sm:min-w-[24px] sm:min-h-[24px] md:min-w-[32px] md:min-h-[32px] aspect-square flex items-center justify-center text-white font-bold text-[10px] sm:text-xs md:text-sm bg-blue-700/50 rounded">
                {y + 1}
              </div>
            )}

            {/* Cases de la ligne */}
            {row.map((cell, x) => (
              <button
                key={`${x}-${y}`}
                data-grid-cell
                data-x={x}
                data-y={y}
                className={`
                  min-w-[20px] min-h-[20px] sm:min-w-[24px] sm:min-h-[24px] md:min-w-[32px] md:min-h-[32px] aspect-square border border-1 sm:border-2 rounded transition-all duration-200 touch-none
                  ${getCellColor(cell)}
                  ${getCellCursor(cell)}
                  ${onCellClick && cell !== 'hit' && cell !== 'miss' && cell !== 'revealed' && cell !== 'revealed_ship' && cell !== 'revealed_empty' ? 'hover:scale-110 active:scale-95 hover:shadow-lg' : ''}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                `}
                onClick={() => handleCellClick(x, y)}
                onMouseEnter={() => handleCellHover(x, y)}
                onDragOver={(e) => handleDragOver(e, x, y)}
                onDrop={(e) => handleDrop(e, x, y)}
                onTouchStart={(e) => {
                  // Pour le drag and drop tactile, on laisse ShipPlacer gérer
                  // Mais on peut aussi permettre le clic tactile
                  if (onCellClick) {
                    e.preventDefault();
                    handleCellClick(x, y);
                  }
                }}
                disabled={!onCellClick || cell === 'hit' || cell === 'miss' || cell === 'revealed' || cell === 'revealed_empty'}
                title={showCoordinates ? `${String.fromCharCode(65 + x)}${y + 1}` : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
