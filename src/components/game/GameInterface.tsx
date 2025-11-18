'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Game, CellState } from '@/types/game';
import { Grid } from './Grid';
import { GameChatCollapsible } from './GameChatCollapsible';

interface GameInterfaceProps {
  game: Game;
  currentPlayer: any;
  opponents: any[];
  isCurrentTurn: boolean;
  hasShotThisTurn: boolean;
  actionMode: 'shot' | 'bomb';
  selectedTarget: string | null;
  error: string;
  turnTimeLimit: number;
  chatMessages: any[];
  onCellClick: (opponentId: string, x: number, y: number) => void;
  onSendChatMessage: (message: string) => void;
  onActionModeChange: (mode: 'shot' | 'bomb') => void;
  onTargetSelect: (targetId: string | null) => void;
  onDefuseBomb: (bombId: string) => void;
  onSurrender: () => void;
}

export const GameInterface = ({
  game,
  currentPlayer,
  opponents,
  isCurrentTurn,
  hasShotThisTurn,
  actionMode,
  selectedTarget,
  error,
  turnTimeLimit,
  chatMessages,
  onCellClick,
  onSendChatMessage,
  onActionModeChange,
  onTargetSelect,
  onDefuseBomb,
  onSurrender,
}: GameInterfaceProps) => {
  const { user } = useAuth();

  // Fonction pour masquer les navires non découverts de l'adversaire
  const getOpponentGrid = (opponentCells: any[][]): any[][] => {
    return opponentCells.map((row) =>
      row.map((cell) => {
        // Si c'est un navire non touché, on le masque (affiche comme 'empty')
        if (cell === 'ship') {
          return 'empty';
        }
        // Sinon, on affiche l'état réel (hit, miss, revealed_ship, revealed_empty, etc.)
        return cell;
      })
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header avec navigation */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isCurrentTurn ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <div>
              <div className="text-white font-bold">Tour {game.currentTurn || 1}</div>
              <div className="text-white/70 text-sm">
                {isCurrentTurn ? '🎯 Votre tour' : `⏳ Tour de ${opponents[0]?.name || 'l\'adversaire'}`}
              </div>
            </div>
          </div>
          {turnTimeLimit > 0 && isCurrentTurn && (
            <div className="text-red-400 font-bold">
              Timer actif
            </div>
          )}
        </div>
      </div>

      {/* Layout principal gaming */}
      <div className="relative h-screen overflow-hidden">
        {/* Mode Desktop - Layout 3 colonnes */}
        <div className="hidden lg:grid lg:grid-cols-12 h-full gap-4 p-4">
          {/* Colonne gauche - Grille joueur + actions */}
          <div className="col-span-3 flex flex-col gap-4">
            {/* Actions et raccourcis */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${isCurrentTurn ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <h2 className="text-white font-bold text-lg">🎮 Actions</h2>
              </div>

              {/* Tour info */}
              <div className="mb-4 text-center">
                <div className="text-white/80 text-sm mb-1">Tour {game.currentTurn || 1}</div>
                <div className="text-white font-semibold text-sm">
                  {isCurrentTurn ? '🎯 Votre tour !' : `⏳ ${opponents[0]?.name || 'Adversaire'}`}
                </div>
                {turnTimeLimit > 0 && isCurrentTurn && (
                  <div className="text-red-400 font-bold text-sm mt-1">
                    ⏰ Timer actif
                  </div>
                )}
              </div>

              {/* Actions */}
              {isCurrentTurn && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onActionModeChange('shot');
                      onTargetSelect(null);
                    }}
                    className={`w-full px-4 py-3 rounded-lg font-bold transition-all shadow-lg ${
                      actionMode === 'shot'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-105 ring-2 ring-blue-300'
                        : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-500 hover:to-slate-600 hover:scale-105'
                    }`}
                  >
                    🎯 Tir
                  </button>

                  {game.settings.enableBombs && game.settings.bombsPerPlayer > 0 && (
                    <button
                      onClick={() => {
                        onActionModeChange('bomb');
                        onTargetSelect(null);
                      }}
                      disabled={currentPlayer.bombsRemaining <= 0}
                      className={`w-full px-4 py-3 rounded-lg font-bold transition-all shadow-lg ${
                        actionMode === 'bomb'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white scale-105 ring-2 ring-orange-300'
                          : currentPlayer.bombsRemaining > 0
                          ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-500 hover:to-slate-600 hover:scale-105'
                          : 'bg-gradient-to-r from-slate-800 to-slate-900 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      💣 Bombe ({currentPlayer.bombsRemaining})
                    </button>
                  )}

                  {hasShotThisTurn && (
                    <div className="px-3 py-2 bg-green-600/20 border border-green-500 text-green-300 rounded-lg text-center text-sm font-semibold">
                      ✓ Action effectuée
                    </div>
                  )}
                </div>
              )}

              {/* Bouton Abandonner */}
              {game.phase === 'playing' && currentPlayer && currentPlayer.isAlive && (
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir abandonner la partie ?')) {
                      onSurrender();
                    }
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  title="Abandonner la partie"
                >
                  🏳️ Abandonner
                </button>
              )}

              {/* Sélecteur d'adversaire */}
              {isCurrentTurn && actionMode === 'shot' && !hasShotThisTurn && opponents.length > 1 && (
                <div className="mt-4">
                  <h4 className="text-white/80 text-sm font-semibold mb-2">🎯 Cible :</h4>
                  <div className="space-y-1">
                    {opponents.map((opponent) => (
                      <button
                        key={opponent.id}
                        onClick={() => onTargetSelect(opponent.id)}
                        className={`w-full px-3 py-2 rounded-lg font-medium text-left transition-all ${
                          selectedTarget === opponent.id
                            ? 'bg-red-600/30 border-2 border-red-500 text-white'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border-2 border-transparent'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full inline-block mr-2" style={{ backgroundColor: opponent.color }}></span>
                        {opponent.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Légende mini */}
              <div className="mt-4 pt-4 border-t border-slate-600">
                <h4 className="text-white/80 text-sm font-semibold mb-2">📖 Légende</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 border border-red-700 rounded"></div>
                    <span className="text-slate-300">Touché</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 border border-blue-500 rounded"></div>
                    <span className="text-slate-300">Raté</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-400 border border-amber-500 rounded"></div>
                    <span className="text-slate-300">Navire</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grille du joueur - Miniature */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-4 flex-1">
              <h3 className="text-white font-bold text-sm mb-2 text-center">⚓ Votre flotte</h3>
              <div className="flex justify-center">
                <div className="relative">
                  <Grid
                    cells={currentPlayer.board.cells}
                    showCoordinates={false}
                    size="small"
                    className="shadow-lg"
                  />

                  {/* Bombes sur la grille du joueur */}
                  {game.players
                    .flatMap(p => p.bombsPlaced.filter(b => b.targetPlayerId === user?.uid && !b.detonated && !b.defused))
                    .map(bomb => {
                      const turnsRemaining = Math.max(0, bomb.activatesAtTurn - (game.currentTurn || 0));
                      return (
                        <div
                          key={bomb.id}
                          className="absolute z-10 pointer-events-none"
                          style={{
                            left: `${(bomb.position.x + 1) * (100 / 13)}%`,
                            top: `${(bomb.position.y + 1) * (100 / 13)}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <div className="bg-orange-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-lg animate-pulse">
                            {turnsRemaining}
                          </div>
                          {isCurrentTurn && (
                            <button
                              onClick={() => onDefuseBomb(bomb.id)}
                              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap transition-all hover:scale-105 pointer-events-auto"
                            >
                              ✂️
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne centrale - Espace ou minimap futur */}
          <div className="col-span-1"></div>

          {/* Colonne droite - Grille adversaire */}
          <div className="col-span-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl">
                🎯 {opponents.length === 1 ? opponents[0].name : 'Adversaires'}
              </h2>
              {opponents.length > 0 && (
                <div className="text-slate-300 text-sm">
                  ⚓ {opponents[0].board.ships.filter((s: any) => s.sunk).length}/{opponents[0].board.ships.length} coulés
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <Grid
                  cells={getOpponentGrid(opponents[0]?.board.cells || [])}
                  showCoordinates={true}
                  onCellClick={(!isCurrentTurn || actionMode === 'bomb' || hasShotThisTurn || (opponents.length > 1 && selectedTarget !== opponents[0]?.id)) ? undefined : (x, y) => onCellClick(opponents[0]?.id || '', x, y)}
                  className="shadow-xl"
                />

                {/* Bombes sur la grille adverse */}
                {game.players
                  .flatMap(p => p.bombsPlaced.filter(b => b.targetPlayerId === opponents[0]?.id && !b.detonated && !b.defused))
                  .map(bomb => {
                    const turnsRemaining = Math.max(0, bomb.activatesAtTurn - (game.currentTurn || 0));
                    return (
                      <div
                        key={bomb.id}
                        className="absolute z-10 pointer-events-none"
                        style={{
                          left: `${(bomb.position.x + 1) * (100 / 13)}%`,
                          top: `${(bomb.position.y + 1) * (100 / 13)}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div className="bg-orange-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-xl animate-pulse">
                          {turnsRemaining}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Actions pour bombes en mode placement */}
            {isCurrentTurn && actionMode === 'bomb' && opponents[0] && (
              <div className="mt-4 text-center">
                <div className="text-yellow-300 text-sm mb-2">
                  💣 Cliquez sur la grille de {opponents[0].name} pour placer votre bombe !
                </div>
                <button
                  onClick={() => {
                    onActionModeChange('shot');
                    onTargetSelect(null);
                  }}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mode Mobile - Layout empilé */}
        <div className="lg:hidden h-full flex flex-col">
          {/* Header mobile */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isCurrentTurn ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <div>
                  <div className="text-white font-bold">Tour {game.currentTurn || 1}</div>
                  <div className="text-white/70 text-sm">
                    {isCurrentTurn ? '🎯 Votre tour' : `⏳ ${opponents[0]?.name || 'Adversaire'}`}
                  </div>
                </div>
              </div>
              {turnTimeLimit > 0 && isCurrentTurn && (
                <div className="text-red-400 font-bold">
                  Timer actif
                </div>
              )}
            </div>

            {/* Actions mobile */}
            {isCurrentTurn && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    onActionModeChange('shot');
                    onTargetSelect(null);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                    actionMode === 'shot'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-600 text-white hover:bg-slate-500'
                  }`}
                >
                  🎯 Tir
                </button>
                {game.settings.enableBombs && game.settings.bombsPerPlayer > 0 && (
                  <button
                    onClick={() => {
                      onActionModeChange('bomb');
                      onTargetSelect(null);
                    }}
                    disabled={currentPlayer.bombsRemaining <= 0}
                    className={`flex-1 px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                      actionMode === 'bomb'
                        ? 'bg-orange-600 text-white'
                        : currentPlayer.bombsRemaining > 0
                        ? 'bg-slate-600 text-white hover:bg-slate-500'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    💣 ({currentPlayer.bombsRemaining})
                  </button>
                )}
              </div>
            )}

            {/* Bouton Abandonner mobile */}
            {game.phase === 'playing' && currentPlayer && currentPlayer.isAlive && (
              <button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir abandonner la partie ?')) {
                    onSurrender();
                  }
                }}
                className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                title="Abandonner la partie"
              >
                🏳️ Abandonner
              </button>
            )}
          </div>

          {/* Zone de jeu mobile */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Grille adverse */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">
                  🎯 {opponents.length === 1 ? opponents[0].name : 'Adversaires'}
                </h3>
                {opponents.length > 0 && (
                  <span className="text-slate-300 text-sm">
                    ⚓ {opponents[0].board.ships.filter((s: any) => s.sunk).length}/{opponents[0].board.ships.length}
                  </span>
                )}
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <Grid
                    cells={getOpponentGrid(opponents[0]?.board.cells || [])}
                    showCoordinates={true}
                    onCellClick={(!isCurrentTurn || actionMode === 'bomb' || hasShotThisTurn || (opponents.length > 1 && selectedTarget !== opponents[0]?.id)) ? undefined : (x, y) => onCellClick(opponents[0]?.id || '', x, y)}
                    className="shadow-xl"
                  />

                  {/* Bombes sur grille adverse */}
                  {game.players
                    .flatMap(p => p.bombsPlaced.filter(b => b.targetPlayerId === opponents[0]?.id && !b.detonated && !b.defused))
                    .map(bomb => {
                      const turnsRemaining = Math.max(0, bomb.activatesAtTurn - (game.currentTurn || 0));
                      return (
                        <div
                          key={bomb.id}
                          className="absolute z-10 pointer-events-none"
                          style={{
                            left: `${(bomb.position.x + 1) * (100 / 13)}%`,
                            top: `${(bomb.position.y + 1) * (100 / 13)}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <div className="bg-orange-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-xl animate-pulse">
                            {turnsRemaining}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Grille du joueur */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-4">
              <h3 className="text-white font-bold mb-3 text-center">⚓ Votre flotte</h3>
              <div className="flex justify-center">
                <div className="relative">
                  <Grid
                    cells={currentPlayer.board.cells}
                    showCoordinates={true}
                    className="shadow-lg"
                  />

                  {/* Bombes sur la grille du joueur */}
                  {game.players
                    .flatMap(p => p.bombsPlaced.filter(b => b.targetPlayerId === user?.uid && !b.detonated && !b.defused))
                    .map(bomb => {
                      const turnsRemaining = Math.max(0, bomb.activatesAtTurn - (game.currentTurn || 0));
                      return (
                        <div
                          key={bomb.id}
                          className="absolute z-10 flex flex-col items-center pointer-events-none"
                          style={{
                            left: `${(bomb.position.x + 1) * (100 / 13)}%`,
                            top: `${(bomb.position.y + 1) * (100 / 13)}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <div className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white shadow-xl mb-1 animate-pulse pointer-events-auto">
                            {turnsRemaining}
                          </div>
                          {isCurrentTurn && (
                            <button
                              onClick={() => onDefuseBomb(bomb.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap transition-all hover:scale-105 active:scale-95"
                            >
                              ✂️ Désamorcer
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Sélecteur d'adversaire mobile */}
            {isCurrentTurn && actionMode === 'shot' && !hasShotThisTurn && opponents.length > 1 && (
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-4">
                <h4 className="text-white font-semibold mb-3 text-center">🎯 Sélectionnez une cible</h4>
                <div className="grid grid-cols-2 gap-2">
                  {opponents.map((opponent) => (
                    <button
                      key={opponent.id}
                      onClick={() => onTargetSelect(opponent.id)}
                      className={`px-3 py-2 rounded-lg font-medium transition-all ${
                        selectedTarget === opponent.id
                          ? 'bg-red-600/30 border-2 border-red-500 text-white'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border-2 border-transparent'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full inline-block mr-2" style={{ backgroundColor: opponent.color }}></span>
                      {opponent.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat collapsable - Position fixe */}
        <GameChatCollapsible
          messages={chatMessages}
          onSendMessage={onSendChatMessage}
          currentUserId={user?.uid}
          canChat={!!currentPlayer}
          gamePhase={game.phase}
          filterByPhase={true}
        />

        {/* Messages d'erreur */}
        {error && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
            <div className="bg-red-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-2xl border border-red-500">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
