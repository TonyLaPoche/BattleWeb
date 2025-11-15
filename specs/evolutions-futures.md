# Évolutions Futures - BattleWeb

## Vue d'ensemble

Ce document décrit les propositions d'évolutions pour enrichir le gameplay de BattleWeb avec de nouvelles mécaniques, structures et fonctionnalités.

## 1. Structures et Bâtiments Aléatoires

### Concept
Des structures spéciales placées aléatoirement sur la grille de chaque joueur au début de la partie, offrant des capacités stratégiques uniques.

### Structures proposées

#### 📡 Antenne Radio
- **Placement** : Aléatoire, 1 par joueur
- **Effet** : Révèle une ligne ou colonne entière tous les 3 tours
- **Visuel** : Carré bleu clair (#60A5FA) avec bordure pointillée
- **Stratégie** : Structure à protéger ou cibler en priorité
- **Cooldown** : 3 tours
- **Activation** : Automatique

#### 🔍 Station Radar
- **Placement** : Aléatoire, 1 par joueur
- **Effet** : Révèle les navires dans un rayon de 2 cases autour
- **Visuel** : Carré vert (#34D399) avec cercle concentrique animé
- **Stratégie** : Détection passive continue
- **Cooldown** : 2 tours
- **Activation** : Automatique

#### 🔧 Base de Réparation
- **Placement** : Aléatoire, 1 par joueur
- **Effet** : Répare 1 case de navire endommagé par tour
- **Visuel** : Carré orange (#FB923C) avec croix blanche
- **Stratégie** : Permet de récupérer des navires touchés
- **Limite** : 3 réparations maximum par partie
- **Activation** : Manuelle (bouton d'action)

#### ⚡ Batterie Anti-Aérienne
- **Placement** : Aléatoire, 1 par joueur
- **Effet** : 30% de chance d'intercepter un tir ennemi
- **Visuel** : Carré rouge (#F87171) avec éclair jaune
- **Stratégie** : Défense passive aléatoire
- **Cooldown** : 1 interception par tour
- **Activation** : Automatique (défense)

#### 🌊 Sous-marin de Reconnaissance
- **Placement** : Aléatoire (sur l'eau uniquement)
- **Effet** : Révèle un carré 3x3 aléatoire de la grille adverse
- **Visuel** : Carré bleu foncé (#1E40AF) avec vague animée
- **Stratégie** : Révélation ponctuelle stratégique
- **Activation** : Une fois par partie (action manuelle)

### Implémentation technique

#### Structure de données
```typescript
export interface Structure {
  id: string;
  type: 'antenna' | 'radar' | 'repair' | 'anti_air' | 'submarine';
  position: Position;
  ownerId: string;
  cooldown: number; // Tours restants avant prochaine activation
  usesRemaining?: number; // Pour structures à usage limité
  active: boolean;
}
```

#### Placement aléatoire
- Généré lors de la phase de placement
- Vérification de non-chevauchement avec navires
- Distribution équitable entre joueurs

## 2. Pouvoirs Spéciaux par Tour

### Concept
Des actions spéciales coûtant plusieurs tours, offrant des avantages tactiques majeurs.

### Pouvoirs proposés

#### Barrage de Missiles
- **Coût** : 2 tours (le joueur saute 1 tour après activation)
- **Effet** : Tire 3 cases aléatoirement sur la grille adverse
- **Visuel** : Animation de 3 explosions simultanées
- **Stratégie** : Attaque massive mais coûteuse en temps

#### Sonar Actif
- **Coût** : 1 tour
- **Effet** : Révèle tous les navires non coulés (positions masquées, juste présence)
- **Visuel** : Onde sonore animée sur toute la grille
- **Stratégie** : Information globale sans révéler les positions exactes

#### Brouillard de Guerre
- **Coût** : 1 tour
- **Effet** : Masque votre grille pour 2 tours (l'adversaire ne voit pas vos tirs)
- **Visuel** : Grille avec effet de brouillard (opacité réduite)
- **Stratégie** : Protection temporaire

#### Contre-Attaque
- **Coût** : 3 tours
- **Effet** : Si touché, tire automatiquement sur la case d'origine
- **Visuel** : Flèche de retour animée
- **Stratégie** : Défense offensive

### Interface utilisateur
- Bouton "Pouvoirs" dans l'interface de jeu
- Menu déroulant avec liste des pouvoirs disponibles
- Indicateur de cooldown pour chaque pouvoir
- Confirmation avant activation

## 3. Événements Aléatoires

### Concept
Des événements globaux affectant tous les joueurs, ajoutant de l'imprévisibilité.

### Événements proposés

#### Tempête
- **Fréquence** : Tous les 10 tours
- **Effet** : 20% de chance d'échec de tir pour tous
- **Visuel** : Animation de vague sur toutes les grilles
- **Durée** : 1 tour
- **Notification** : Message global visible par tous

#### Brouillard
- **Fréquence** : Aléatoire (1 chance sur 15 tours)
- **Effet** : Réduit la visibilité (cases masquées temporairement)
- **Visuel** : Cases avec opacité réduite
- **Durée** : 2 tours
- **Stratégie** : Ralentit le rythme de jeu

#### Marée Basse
- **Fréquence** : Aléatoire (1 chance sur 20 tours)
- **Effet** : Révèle les navires en bordure de grille
- **Visuel** : Bordure de grille surlignée
- **Durée** : 1 tour
- **Stratégie** : Avantage pour les navires centraux

### Implémentation
- Système d'événements déclenché par le serveur
- Notification visuelle et sonore
- Effets appliqués automatiquement à tous les joueurs

## 4. Système de Classes de Navires

### Concept
Chaque joueur choisit une classe au début de la partie, modifiant ses capacités.

### Classes proposées

#### Éclaireur
- **Bonus** : +1 portée de révélation pour toutes les structures
- **Malus** : -1 case de taille sur un navire (navire le plus grand réduit)
- **Stratégie** : Focus sur l'information

#### Défenseur
- **Bonus** : +1 structure défensive (batterie anti-aérienne supplémentaire)
- **Malus** : -1 navire (4 navires au lieu de 5)
- **Stratégie** : Focus sur la survie

#### Assaut
- **Bonus** : +1 tir par tour (2 tirs au lieu d'1)
- **Malus** : Navires plus visibles (révélation +1 case autour)
- **Stratégie** : Focus sur l'attaque

### Interface
- Sélection de classe dans le lobby (avant le placement)
- Indicateur visuel de la classe pendant le jeu
- Statistiques affichées dans le profil

## 5. Améliorations Visuelles

### Animations CSS
- **Pulsation** : Pour structures actives
- **Onde de choc** : Pour explosions
- **Fade in/out** : Pour révélations
- **Particules** : Pour impacts de tirs
- **Glow** : Pour cases spéciales

### Codes couleur
- **Antenne** : Bleu clair (#60A5FA) avec bordure pointillée
- **Radar** : Vert (#34D399) avec cercle concentrique
- **Réparation** : Orange (#FB923C) avec croix blanche
- **Anti-aérienne** : Rouge (#F87171) avec éclair jaune
- **Sous-marin** : Bleu foncé (#1E40AF) avec vague

### Indicateurs visuels
- **Compteur de tours** : Sur les structures (badge numérique)
- **Barre de progression** : Pour cooldowns (barre circulaire)
- **Effets de particules** : Pour actions spéciales
- **Animations de transition** : Entre les phases de jeu

## 6. Modes de Jeu Additionnels

### King of the Hill
- **Concept** : Contrôler une zone centrale de la grille
- **Mécanique** : Zone 3x3 au centre, points de contrôle
- **Victoire** : Contrôler la zone pendant X tours consécutifs

### Capture the Flag
- **Concept** : Chaque joueur a un navire "drapeau"
- **Mécanique** : Protéger son drapeau, capturer celui des autres
- **Victoire** : Capturer tous les drapeaux adverses

### Mode Tournoi
- **Concept** : Brackets éliminatoires
- **Mécanique** : Plusieurs parties, élimination progressive
- **Récompenses** : Classement final, badges

## 7. Système de Progression

### Niveaux et XP
- **XP par partie** : Basé sur performance
- **Niveaux** : Déblocage de contenus
- **Récompenses** : Nouvelles classes, structures, skins

### Achievements
- **Collectionneur** : Gagner avec chaque classe
- **Perfectionniste** : Gagner sans perdre de navire
- **Stratège** : Gagner en désamorçant 3 bombes
- **Rapide** : Gagner en moins de 20 tours

### Statistiques détaillées
- **Ratio victoires/défaites**
- **Précision moyenne**
- **Temps de jeu total**
- **Structures préférées**
- **Classes préférées**

## 8. Fonctionnalités Sociales

### Système d'amis
- **Ajout d'amis** : Par nom d'utilisateur ou code
- **Liste d'amis** : Dans le profil
- **Invitations directes** : Partie privée entre amis
- **Statut en ligne** : Voir qui est disponible

### Classements
- **Classement global** : Top 100
- **Classement par classe** : Meilleurs joueurs par classe
- **Classement mensuel** : Reset chaque mois
- **Badges** : Récompenses visuelles

### Chat amélioré
- **Emojis** : Réactions rapides
- **Stickers** : Expressions de jeu
- **Messages privés** : Entre amis

## Priorités d'implémentation

### Phase 1 : Structures de base (Priorité Haute)
1. Antenne Radio
2. Station Radar
3. Base de Réparation
4. Améliorations visuelles de base

### Phase 2 : Pouvoirs et événements (Priorité Moyenne)
1. Barrage de Missiles
2. Sonar Actif
3. Événement Tempête
4. Animations avancées

### Phase 3 : Classes et progression (Priorité Moyenne)
1. Système de classes
2. Niveaux et XP
3. Achievements de base
4. Statistiques détaillées

### Phase 4 : Social et compétitif (Priorité Basse)
1. Système d'amis
2. Classements
3. Mode Tournoi
4. Chat amélioré

## Notes techniques

### Performance
- Structures : Calculs côté client avec validation serveur
- Événements : Déclenchés par Cloud Functions
- Animations : CSS pur pour performance optimale

### Équilibrage
- Tests nécessaires pour chaque nouvelle mécanique
- Ajustements basés sur les statistiques de jeu
- Feedback utilisateurs essentiel

### Compatibilité
- Toutes les nouvelles fonctionnalités doivent rester compatibles mobile
- Interface adaptative pour nouveaux éléments
- Tests sur différents appareils

