# Spécifications Fonctionnelles

## Vue d'ensemble du jeu

BattleWeb est un jeu de stratégie naval multi-joueurs où les joueurs doivent découvrir et détruire la flotte adverse tout en protégeant la leur.

## Règles de base

### Plateau de jeu
- Grille de **12x12 cases**
- Chaque joueur possède sa propre grille
- Cases peuvent être :
  - Eau (vide)
  - Navire (différents types)
  - Touché
  - Raté

### Flotte
- **5 navires** par joueur :
  - Porte-avions (5 cases)
  - Croiseur (4 cases)
  - Contre-torpilleur (3 cases)
  - Sous-marin (3 cases)
  - Torpilleur (2 cases)

### Déroulement d'une partie

#### Phase de préparation
1. Chaque joueur place sa flotte sur sa grille
2. Validation du placement (pas de chevauchements, respect des limites)
3. Confirmation de prêt

#### Phase de jeu
- **Tour par tour** séquentiel
- Chaque joueur peut effectuer **une action** par tour :
  - Tirer un missile à l'aveugle
  - Placer une bombe de détection

## Mécaniques spéciales

### Missile à l'aveugle
- Attaque classique de la bataille navale
- Résultat immédiat :
  - **Touché** : Case rouge, navire endommagé
  - **Raté** : Case blanche
  - **Coulé** : Navire entièrement détruit

### Bombe de détection

#### Règles générales
- **1 bombe par joueur** maximum par partie
- Les bombes sont **optionnelles** (activables par l'admin du lobby)
- Toujours tirée depuis un navire ennemi existant

#### Placement
- Le joueur choisit une case vide sur la grille adverse
- La bombe nécessite **2 tours** pour s'activer (délai stratégique)

#### Phase de désamorçage (après 2 tours)
- Au tour d'activation, **avant toute action**, le joueur cible peut :
  - **Désamorcer** la bombe : coûte son tour de jeu mais révèle la grille du lanceur
  - **Laisser exploser** : subit les effets de révélation

#### Effets selon le choix

##### Si NON désamorcée :
- **Explosion** : Révèle une zone de **5x5 cases** centrée sur la bombe
- Toutes les cases dans cette zone deviennent visibles pour le lanceur
- Les navires présents sont révélés
- La zone reste visible pour le reste de la partie

##### Si désamorcée :
- **Contre-effet** : Révèle complètement la grille du lanceur de bombe
- Le désamorceur perd son tour mais obtient une information stratégique majeure

## Conditions de victoire

### Victoire
- **Destruction complète** de la flotte adverse
- Le joueur doit couler tous les navires ennemis

### Égalité
- *(À définir)* - peut-être temps limite ou abandon mutuel

## Modes de jeu

### 1 vs 1
- Duel classique
- Tours alternés
- Fin quand une flotte est détruite

### Multi-joueurs (1vs1vs1)
- **Maximum 3 joueurs** par partie
- **Tours séquentiels** : Joueur 1 → 2 → 3 → 1...
- **Gestion des déconnexions** :
  - Attente de 30 secondes pour reconnexion
  - Si non reconnecté : joueur considéré comme mort (défaite)
- **Dernier survivant** gagne

## Interface utilisateur

### Mobile-first
- Design optimisé pour mobiles
- Gestes tactiles intuitifs
- Interface adaptative

### Fonctionnalités PWA
- Installation sur mobile
- Jeu hors ligne (parties locales ?)
- Notifications push
- Synchronisation des données

## Gestion des parties

### Création de partie
- **Code d'invitation** ou **lien partageable**
- **Paramètres personnalisables** :
  - Taille de grille
  - Nombre de joueurs
  - Temps par tour
  - Règles spéciales

### Rejoindre une partie
- **Via code** ou **liste publique**
- **Système de lobby** avec chat
- **Prêt/Absence** des joueurs

### Pendant la partie
- **Chat intégré**
- **Historique des actions**
- **Timer par tour** (configurable par l'admin)
- **Système de pause automatique** (déconnexions)

## Flow Utilisateur Détaillé

### Page d'accueil (non authentifié)
- Formulaire d'inscription/connexion
- Authentification Email/Mot de passe via Firebase

### Page d'accueil (authentifié)
- Option : Créer une partie ou Rejoindre via code
- Historique des parties récentes

### Création de partie
- Création automatique d'un lobby
- Génération d'un code d'invitation
- L'utilisateur devient **admin** du lobby

### Lobby d'attente
- **Chat en temps réel** pour tous les participants
- **Admin** peut :
  - Régler les paramètres de partie
  - Activer/désactiver les bombes
  - Choisir le temps par tour
  - Lancer la partie (si suffisamment de joueurs)
- **Joueurs rejoignant par code** :
  - Peuvent uniquement chatter
  - Attend le lancement par l'admin

### Paramètres de partie (configurables par admin)
- **Activation des bombes** : Oui/Non
- **Temps par tour** : 30s, 1min, 2min, 5min, illimité
- **Choix des couleurs** : Chaque joueur choisit une couleur unique

### Phase de jeu
- Interface de grille 12x12
- Indicateur de tour actuel
- Historique des actions
- Chat toujours disponible

## Statistiques et progression

### Par partie
- Nombre de coups
- Précision des tirs
- Navires coulés
- Temps de jeu

### Globales
- Ratio victoires/défaites
- Classement
- Achievements

## Aspects sociaux

### Amis
- Liste d'amis
- Invitations directes
- Parties privées

### Classement
- Classement global
- Par niveau
- Saisons ?

### Tournois
- Événements spéciaux
- Récompenses
