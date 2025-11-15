'use client';

import { Player } from '@/types/game';

interface LobbyPlayersProps {
  players: Player[];
  adminId: string;
  currentUserId?: string;
}

export const LobbyPlayers = ({ players, adminId, currentUserId }: LobbyPlayersProps) => {
  return (
    <div>
      <h4 className="font-medium mb-3">Joueurs ({players.length})</h4>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              player.id === currentUserId
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Couleur du joueur */}
              <div
                className="w-4 h-4 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: player.color }}
              />

              {/* Nom et statut */}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{player.name}</span>
                  {player.id === adminId && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                  {player.id === currentUserId && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Vous
                    </span>
                  )}
                </div>

                {/* Statut de connexion */}
                <div className="flex items-center space-x-1 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      player.connected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-xs text-gray-500">
                    {player.connected ? 'Connecté' : 'Déconnecté'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions potentielles (pour plus tard) */}
            <div className="text-sm text-gray-500">
              Prêt
            </div>
          </div>
        ))}
      </div>

      {/* Message si partie vide */}
      {players.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          Aucun joueur
        </div>
      )}
    </div>
  );
};
