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
- Le désamorceur perd **2 tours** (au lieu d'1) mais obtient une information stratégique majeure
- Le joueur qui désamorce doit sauter 2 tours consécutifs

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
- **Sélection de cible** : En mode 1v1v1, le joueur doit choisir quel adversaire attaquer à chaque tour
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
- **Chat intégré** (dans le lobby uniquement)
- **Historique des actions** (local storage)
- **Timer par tour** (configurable par l'admin, affiché visuellement)
- **Système de pause automatique** (déconnexions)
- **Bouton d'abandon** : Permet de se rendre et donner la victoire à l'adversaire

## Flow Utilisateur Détaillé

### Page d'accueil (non authentifié)
- Formulaire d'inscription/connexion
- Authentification Email/Mot de passe via Firebase

### Dashboard (authentifié)
- **Créer une partie** : Génère un lobby avec code unique
- **Rejoindre une partie** : Via code d'invitation
- **Parties en cours** : Liste des parties actives où le joueur participe
  - Permet de reprendre une partie en cours
  - Affiche la phase (lobby, placement, playing)
  - Indique si le joueur est admin
- **Historique des parties** : Parties terminées sauvegardées localement
  - Affiche le gagnant, les joueurs, la date
  - Limité à 50 parties

### Création de partie
- Création automatique d'un lobby
- Génération d'un code d'invitation
- L'utilisateur devient **admin** du lobby

### Lobby d'attente
- **Chat en temps réel** pour tous les participants
- **Admin** peut :
  - Régler les paramètres de partie
  - Activer/désactiver les bombes
  - Définir le nombre de bombes par joueur
  - Choisir le temps par tour (illimité, 45s, 75s)
  - Définir le nombre maximum de joueurs (2 ou 3)
  - Lancer la partie (si suffisamment de joueurs)
- **Joueurs rejoignant par code** :
  - Peuvent uniquement chatter
  - Attend le lancement par l'admin
- **Quitter le lobby** : 
  - Si admin quitte et qu'il reste des joueurs, le premier joueur devient admin
  - Si dernier joueur quitte, le lobby est supprimé
  - Si lobby vide pendant 30 secondes, suppression automatique

### Paramètres de partie (configurables par admin)
- **Activation des bombes** : Oui/Non
- **Nombre de bombes par joueur** : 0, 1, 2, 3... (configurable)
- **Temps par tour** : Illimité, 45s, 75s (configurable)
- **Choix des couleurs** : Chaque joueur choisit une couleur unique
- **Nombre maximum de joueurs** : 2 ou 3

### Phase de jeu
- Interface de grille 12x12
- Indicateur de tour actuel avec nom du joueur
- **Sélection de cible** (mode 1v1v1) : Choisir quel adversaire attaquer
- **Mode d'action** : Basculer entre tir et placement de bombe
- **Timer visuel** : Affiche le temps restant si limité
- **Indicateurs de bombes** :
  - Bombes placées : Affichage visuel sur les grilles
  - Bombes activées : Zone révélée (5x5)
  - Bombes désamorcées : Indicateur visuel
- **Bouton d'abandon** : Se rendre (icône drapeau blanc)
- Historique des actions (local storage)
- **Gestion de fin de partie** :
  - Modal de victoire/défaite
  - Choix : Retour au lobby ou Menu
  - Si retour au lobby : Réinitialisation de la partie
  - Si menu : Suppression du lobby (si tous choisissent menu)

## Statistiques et progression

### Par partie
- Nombre de coups
- Précision des tirs
- Navires coulés
- Temps de jeu
- Sauvegarde automatique dans l'historique local

### Globales
- Ratio victoires/défaites (à implémenter)
- Classement (à implémenter)
- Achievements (à implémenter)

## Profil utilisateur

### Informations
- **Nom d'utilisateur** : Par défaut, début de l'email
- **Email** : Adresse de connexion
- **Date de création** : Timestamp de création du compte
- **Date de mise à jour** : Dernière modification du profil

### Fonctionnalités
- **Modification du nom d'utilisateur** : Accessible depuis la page profil
- **Réinitialisation du mot de passe** : Via lien "Mot de passe oublié" sur la page de connexion

## Gestion des parties terminées

### Sauvegarde automatique
- Les parties terminées sont automatiquement sauvegardées dans l'historique local
- Limite de 50 parties dans l'historique
- Format : `GameHistoryEntry` avec code, joueurs, gagnant, date

### Nettoyage automatique
- **Parties terminées** : Supprimées de Firebase après 1 heure
- **Lobbies vides** : Supprimés après 30 secondes d'inactivité
- **Parties abandonnées** : Détectées automatiquement et marquées comme terminées
- **Parties orphelines** : Détectées et nettoyées lors du chargement du dashboard

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
