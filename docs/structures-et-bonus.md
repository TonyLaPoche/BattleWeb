# Documentation Technique - Structures et Bonus

## Vue d'ensemble

Ce document décrit l'implémentation technique des structures aléatoires, pouvoirs spéciaux et événements pour BattleWeb.

## Architecture des Structures

### Modèle de données

```typescript
// types/game.ts

export type StructureType = 
  | 'antenna'      // Antenne Radio
  | 'radar'        // Station Radar
  | 'repair'       // Base de Réparation
  | 'anti_air'     // Batterie Anti-Aérienne
  | 'submarine';   // Sous-marin de Reconnaissance

export interface Structure {
  id: string;
  type: StructureType;
  position: Position;
  ownerId: string;
  cooldown: number;           // Tours restants avant activation
  usesRemaining?: number;     // Pour structures à usage limité
  active: boolean;            // Si la structure est active
  lastActivated?: number;     // Timestamp de dernière activation
}

export interface StructureConfig {
  type: StructureType;
  name: string;
  description: string;
  cooldown: number;
  maxUses?: number;
  color: string;
  icon: string;
}
```

### Configuration des structures

```typescript
// utils/structures.ts

export const STRUCTURES_CONFIG: Record<StructureType, StructureConfig> = {
  antenna: {
    type: 'antenna',
    name: 'Antenne Radio',
    description: 'Révèle une ligne ou colonne entière tous les 3 tours',
    cooldown: 3,
    color: '#60A5FA',
    icon: '📡',
  },
  radar: {
    type: 'radar',
    name: 'Station Radar',
    description: 'Révèle les navires dans un rayon de 2 cases',
    cooldown: 2,
    color: '#34D399',
    icon: '🔍',
  },
  repair: {
    type: 'repair',
    name: 'Base de Réparation',
    description: 'Répare 1 case de navire endommagé par tour (max 3)',
    cooldown: 1,
    maxUses: 3,
    color: '#FB923C',
    icon: '🔧',
  },
  anti_air: {
    type: 'anti_air',
    name: 'Batterie Anti-Aérienne',
    description: '30% de chance d\'intercepter un tir ennemi',
    cooldown: 1,
    color: '#F87171',
    icon: '⚡',
  },
  submarine: {
    type: 'submarine',
    name: 'Sous-marin de Reconnaissance',
    description: 'Révèle un carré 3x3 aléatoire de la grille adverse (1 fois)',
    cooldown: 0,
    maxUses: 1,
    color: '#1E40AF',
    icon: '🌊',
  },
};
```

## Placement Aléatoire

### Algorithme de placement

```typescript
// services/structureService.ts

export function placeRandomStructures(
  board: GameBoard,
  playerId: string,
  structureTypes: StructureType[]
): Structure[] {
  const structures: Structure[] = [];
  const BOARD_SIZE = 12;
  const occupiedPositions = new Set<string>();
  
  // Marquer les positions occupées par les navires
  board.ships.forEach(ship => {
    ship.positions.forEach(pos => {
      occupiedPositions.add(`${pos.x},${pos.y}`);
    });
  });
  
  // Placer chaque structure
  structureTypes.forEach((type, index) => {
    let attempts = 0;
    let position: Position | null = null;
    
    while (attempts < 100 && !position) {
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);
      const key = `${x},${y}`;
      
      if (!occupiedPositions.has(key)) {
        position = { x, y };
        occupiedPositions.add(key);
      }
      attempts++;
    }
    
    if (position) {
      const config = STRUCTURES_CONFIG[type];
      structures.push({
        id: `structure_${playerId}_${index}_${Date.now()}`,
        type,
        position,
        ownerId: playerId,
        cooldown: config.cooldown,
        usesRemaining: config.maxUses,
        active: true,
      });
    }
  });
  
  return structures;
}
```

### Intégration dans le jeu

```typescript
// services/gameService.ts

export async function startGame(gameId: string, adminId: string): Promise<void> {
  const game = await getGame(gameId);
  if (!game) throw new Error('Partie non trouvée');
  
  // ... placement des navires ...
  
  // Placer les structures aléatoires
  const structuresPerPlayer: StructureType[] = ['antenna', 'radar'];
  const updatedPlayers = game.players.map(player => ({
    ...player,
    structures: placeRandomStructures(
      player.board,
      player.id,
      structuresPerPlayer
    ),
  }));
  
  await updateGame(gameId, {
    players: updatedPlayers,
    phase: 'placement',
  });
}
```

## Activation des Structures

### Système d'activation automatique

```typescript
// services/structureService.ts

export async function activateStructures(gameId: string): Promise<void> {
  const game = await getGame(gameId);
  if (!game || game.phase !== 'playing') return;
  
  const updatedPlayers = game.players.map(player => {
    const updatedStructures = player.structures?.map(structure => {
      // Décrémenter le cooldown
      if (structure.cooldown > 0) {
        return {
          ...structure,
          cooldown: structure.cooldown - 1,
        };
      }
      
      // Activer si cooldown terminé
      if (structure.cooldown === 0 && structure.active) {
        return activateStructure(game, player, structure);
      }
      
      return structure;
    }) || [];
    
    return {
      ...player,
      structures: updatedStructures,
    };
  });
  
  await updateGame(gameId, { players: updatedPlayers });
}

function activateStructure(
  game: Game,
  player: Player,
  structure: Structure
): Structure {
  switch (structure.type) {
    case 'antenna':
      // Révéler ligne ou colonne aléatoire
      revealLineOrColumn(game, player.id, structure);
      break;
    case 'radar':
      // Révéler rayon 2 cases
      revealRadarArea(game, player.id, structure);
      break;
    // ... autres structures
  }
  
  const config = STRUCTURES_CONFIG[structure.type];
  return {
    ...structure,
    cooldown: config.cooldown,
    usesRemaining: structure.usesRemaining 
      ? structure.usesRemaining - 1 
      : undefined,
    active: structure.usesRemaining === undefined || (structure.usesRemaining - 1) > 0,
    lastActivated: Date.now(),
  };
}
```

## Pouvoirs Spéciaux

### Modèle de données

```typescript
// types/game.ts

export type SpecialPowerType =
  | 'missile_barrage'    // Barrage de Missiles
  | 'active_sonar'       // Sonar Actif
  | 'war_fog'           // Brouillard de Guerre
  | 'counter_attack';    // Contre-Attaque

export interface SpecialPower {
  id: string;
  type: SpecialPowerType;
  playerId: string;
  cost: number;          // Tours à sauter
  cooldown: number;      // Tours avant réutilisation
  available: boolean;
}

export interface SpecialPowerConfig {
  type: SpecialPowerType;
  name: string;
  description: string;
  cost: number;
  cooldown: number;
  icon: string;
}
```

### Configuration des pouvoirs

```typescript
// utils/specialPowers.ts

export const SPECIAL_POWERS_CONFIG: Record<SpecialPowerType, SpecialPowerConfig> = {
  missile_barrage: {
    type: 'missile_barrage',
    name: 'Barrage de Missiles',
    description: 'Tire 3 cases aléatoirement (coûte 2 tours)',
    cost: 2,
    cooldown: 5,
    icon: '💥',
  },
  active_sonar: {
    type: 'active_sonar',
    name: 'Sonar Actif',
    description: 'Révèle la présence de tous les navires (coûte 1 tour)',
    cost: 1,
    cooldown: 3,
    icon: '🔊',
  },
  war_fog: {
    type: 'war_fog',
    name: 'Brouillard de Guerre',
    description: 'Masque votre grille pendant 2 tours (coûte 1 tour)',
    cost: 1,
    cooldown: 4,
    icon: '🌫️',
  },
  counter_attack: {
    type: 'counter_attack',
    name: 'Contre-Attaque',
    description: 'Retour de tir automatique si touché (coûte 3 tours)',
    cost: 3,
    cooldown: 6,
    icon: '⚔️',
  },
};
```

### Activation d'un pouvoir

```typescript
// services/specialPowerService.ts

export async function activateSpecialPower(
  gameId: string,
  playerId: string,
  powerType: SpecialPowerType
): Promise<void> {
  const game = await getGame(gameId);
  if (!game) throw new Error('Partie non trouvée');
  
  const player = game.players.find(p => p.id === playerId);
  if (!player) throw new Error('Joueur non trouvé');
  
  const power = player.specialPowers?.find(p => p.type === powerType);
  if (!power || !power.available) {
    throw new Error('Pouvoir non disponible');
  }
  
  const config = SPECIAL_POWERS_CONFIG[powerType];
  
  // Appliquer l'effet du pouvoir
  await applyPowerEffect(game, player, powerType);
  
  // Mettre à jour le joueur
  const updatedPlayers = game.players.map(p => {
    if (p.id === playerId) {
      return {
        ...p,
        skipNextTurns: (p.skipNextTurns || 0) + config.cost,
        specialPowers: p.specialPowers?.map(sp => 
          sp.id === power.id
            ? { ...sp, available: false, cooldown: config.cooldown }
            : sp
        ),
      };
    }
    return p;
  });
  
  await updateGame(gameId, { players: updatedPlayers });
}
```

## Événements Aléatoires

### Modèle de données

```typescript
// types/game.ts

export type GameEventType =
  | 'storm'        // Tempête
  | 'fog'         // Brouillard
  | 'low_tide';   // Marée Basse

export interface GameEvent {
  id: string;
  type: GameEventType;
  gameId: string;
  active: boolean;
  startTurn: number;
  duration: number;  // Nombre de tours
  effects: Record<string, any>;
}
```

### Système de déclenchement

```typescript
// services/eventService.ts

export async function checkAndTriggerEvents(gameId: string): Promise<void> {
  const game = await getGame(gameId);
  if (!game || game.phase !== 'playing') return;
  
  const currentTurn = game.currentTurn || 0;
  
  // Tempête tous les 10 tours
  if (currentTurn > 0 && currentTurn % 10 === 0) {
    await triggerEvent(gameId, 'storm', 1);
  }
  
  // Brouillard aléatoire (1 chance sur 15)
  if (Math.random() < 1/15) {
    await triggerEvent(gameId, 'fog', 2);
  }
  
  // Marée basse aléatoire (1 chance sur 20)
  if (Math.random() < 1/20) {
    await triggerEvent(gameId, 'low_tide', 1);
  }
}

async function triggerEvent(
  gameId: string,
  eventType: GameEventType,
  duration: number
): Promise<void> {
  const event: GameEvent = {
    id: `event_${gameId}_${Date.now()}`,
    type: eventType,
    gameId,
    active: true,
    startTurn: (await getGame(gameId))?.currentTurn || 0,
    duration,
    effects: getEventEffects(eventType),
  };
  
  // Sauvegarder l'événement
  await setDoc(doc(db, 'game_events', event.id), event);
  
  // Appliquer les effets
  await applyEventEffects(gameId, event);
  
  // Programmer la fin de l'événement
  setTimeout(async () => {
    await endEvent(event.id);
  }, duration * (game.settings.turnTimeLimit || 60000));
}
```

## Interface Utilisateur

### Composant Structure

```typescript
// components/game/Structure.tsx

interface StructureProps {
  structure: Structure;
  cellSize: number;
  onClick?: () => void;
}

export function Structure({ structure, cellSize, onClick }: StructureProps) {
  const config = STRUCTURES_CONFIG[structure.type];
  const isReady = structure.cooldown === 0;
  
  return (
    <div
      className="absolute inset-0 flex items-center justify-center cursor-pointer"
      style={{
        backgroundColor: config.color,
        opacity: isReady ? 1 : 0.6,
      }}
      onClick={onClick}
    >
      <span className="text-2xl">{config.icon}</span>
      {structure.cooldown > 0 && (
        <div className="absolute top-0 right-0 bg-black text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
          {structure.cooldown}
        </div>
      )}
    </div>
  );
}
```

### Composant Pouvoirs

```typescript
// components/game/SpecialPowers.tsx

export function SpecialPowers({ 
  player, 
  onActivate 
}: { 
  player: Player;
  onActivate: (powerType: SpecialPowerType) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-bold">Pouvoirs Spéciaux</h3>
      {player.specialPowers?.map(power => {
        const config = SPECIAL_POWERS_CONFIG[power.type];
        return (
          <button
            key={power.id}
            disabled={!power.available}
            onClick={() => onActivate(power.type)}
            className="w-full p-2 bg-gray-200 rounded disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span>{config.icon} {config.name}</span>
              {power.cooldown > 0 && (
                <span className="text-xs">Cooldown: {power.cooldown}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

## Animations CSS

### Styles pour structures

```css
/* styles/structures.css */

.structure-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.structure-radar {
  animation: radar-sweep 3s infinite;
}

@keyframes radar-sweep {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.structure-ready {
  box-shadow: 0 0 10px currentColor;
  animation: glow 1s infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px currentColor;
  }
  to {
    box-shadow: 0 0 20px currentColor;
  }
}
```

## Tests

### Tests unitaires

```typescript
// __tests__/structures.test.ts

describe('Structure Placement', () => {
  it('should place structures without overlapping ships', () => {
    const board = createTestBoard();
    const structures = placeRandomStructures(board, 'player1', ['antenna', 'radar']);
    
    expect(structures).toHaveLength(2);
    structures.forEach(structure => {
      const shipAtPosition = board.ships.some(ship =>
        ship.positions.some(pos =>
          pos.x === structure.position.x && pos.y === structure.position.y
        )
      );
      expect(shipAtPosition).toBe(false);
    });
  });
});
```

## Performance

### Optimisations

1. **Calculs côté client** : Structures calculées localement, validation serveur
2. **Cache** : Configuration des structures en cache
3. **Lazy loading** : Composants de structures chargés à la demande
4. **Debounce** : Activation des structures avec debounce pour éviter les spams

## Sécurité

### Validations

1. **Côté serveur** : Toutes les activations validées par Cloud Functions
2. **Cooldown** : Vérification stricte des cooldowns
3. **Limites** : Respect des limites d'utilisation
4. **Anti-triche** : Validation des positions et effets

