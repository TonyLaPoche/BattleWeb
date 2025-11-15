'use client';

import { GameSettings, TURN_TIME_OPTIONS } from '@/types/game';

interface LobbySettingsProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onStartGame: () => void;
  canStart: boolean;
  loading: boolean;
}

export const LobbySettings = ({
  settings,
  onUpdateSettings,
  onStartGame,
  canStart,
  loading
}: LobbySettingsProps) => {
  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    onUpdateSettings({ [key]: value });
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h4 className="font-medium mb-4">Paramètres de la partie</h4>

      <div className="space-y-4">
        {/* Bombes activées */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Bombes de détection
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableBombs && (settings.bombsPerPlayer ?? 0) > 0}
                onChange={(e) => {
                  const checked = e.target.checked;
                  // Mettre à jour les deux valeurs en même temps
                  onUpdateSettings({
                    enableBombs: checked,
                    bombsPerPlayer: checked ? ((settings.bombsPerPlayer ?? 0) > 0 ? settings.bombsPerPlayer : 1) : 0,
                  });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Nombre de bombes par joueur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de bombes par joueur
            </label>
            <select
              value={settings.bombsPerPlayer ?? 0}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                // Mettre à jour les deux valeurs en même temps
                onUpdateSettings({
                  bombsPerPlayer: value,
                  enableBombs: value > 0,
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>0 (désactivé)</option>
              <option value={1}>1 bombe</option>
              <option value={2}>2 bombes</option>
              <option value={3}>3 bombes</option>
            </select>
          </div>
        </div>

        {/* Temps par tour */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temps par tour
          </label>
          <select
            value={settings.turnTimeLimit}
            onChange={(e) => handleSettingChange('turnTimeLimit', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TURN_TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nombre max de joueurs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre maximum de joueurs
          </label>
          <select
            value={settings.maxPlayers}
            onChange={(e) => handleSettingChange('maxPlayers', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>2 joueurs</option>
            <option value={3}>3 joueurs</option>
          </select>
        </div>

        {/* Bouton lancer la partie */}
        <div className="pt-4">
          <button
            onClick={onStartGame}
            disabled={!canStart || loading}
            className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${
              canStart && !loading
                ? 'bg-green-500 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Lancement...' : 'Lancer la partie'}
          </button>

          {!canStart && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Il faut au moins 2 joueurs pour commencer
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
