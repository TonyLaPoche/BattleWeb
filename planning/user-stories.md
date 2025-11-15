# User Stories - BattleWeb

## Épic 1: Authentification et Profil

### US-001: Inscription/Connexion
**En tant que** nouvel utilisateur  
**Je veux** m'inscrire et me connecter facilement  
**Afin de** pouvoir jouer et sauvegarder mes parties  

**Critères d'acceptation :**
- Inscription par email/mot de passe
- Connexion via Google/Apple
- Récupération de mot de passe
- Validation des champs
- Messages d'erreur clairs

### US-002: Gestion du profil
**En tant que** joueur  
**Je veux** gérer mon profil  
**Afin de** personnaliser mon expérience  

**Critères d'acceptation :**
- Modification du pseudo
- Upload d'avatar
- Préférences de jeu
- Historique des parties
- Statistiques personnelles

## Épic 2: Création et Gestion des Parties

### US-003: Créer une partie
**En tant que** joueur  
**Je veux** créer une nouvelle partie  
**Afin de** inviter des amis à jouer  

**Critères d'acceptation :**
- Choix du mode (1vs1, multi-joueurs)
- Paramètres personnalisables (taille grille, temps tour)
- Génération d'un code d'invitation
- Lien partageable

### US-004: Rejoindre une partie
**En tant que** joueur  
**Je veux** rejoindre une partie existante  
**Afin de** jouer avec d'autres joueurs  

**Critères d'acceptation :**
- Saisie du code d'invitation
- Liste des parties publiques
- Vérification de la disponibilité
- Notification d'entrée dans le lobby

### US-005: Lobby d'attente
**En tant que** joueur dans une partie  
**Je veux** attendre que tous soient prêts  
**Afin de** commencer le jeu dans de bonnes conditions  

**Critères d'acceptation :**
- Liste des joueurs présents
- Statut prêt/pas prêt
- Chat du lobby
- Démarrage automatique quand tous prêts

## Épic 3: Phase de Placement

### US-006: Placement des navires
**En tant que** joueur  
**Je veux** placer ma flotte sur la grille  
**Afin de** préparer ma stratégie de défense  

**Critères d'acceptation :**
- Glisser-déposer des navires
- Rotation des navires
- Validation des placements (pas de chevauchement)
- Placement automatique (optionnel)
- Prévisualisation en temps réel

### US-007: Validation de la flotte
**En tant que** joueur  
**Je veux** confirmer mon placement  
**Afin de** passer à la phase de jeu  

**Critères d'acceptation :**
- Vérification que tous les navires sont placés
- Possibilité de modifier avant validation
- Confirmation finale irréversible

## Épic 4: Gameplay de Base

### US-008: Tour de jeu - Missile
**En tant que** joueur à mon tour  
**Je veux** tirer un missile  
**Afin de** attaquer la flotte adverse  

**Critères d'acceptation :**
- Sélection d'une case sur la grille adverse
- Animation du tir
- Feedback immédiat (touché/raté/coulé)
- Mise à jour de la grille
- Passage au tour suivant

### US-009: Gestion des tours
**En tant que** joueur  
**Je veux** savoir quand c'est mon tour  
**Afin de** ne pas rater mon action  

**Critères d'acceptation :**
- Indicateur visuel du tour actuel
- Notification push (optionnel)
- Timer avec alerte
- Historique des derniers tours

## Épic 5: Mécaniques Avancées

### US-010: Placement de bombe de détection
**En tant que** joueur à mon tour  
**Je veux** placer une bombe de détection  
**Afin de** obtenir des informations stratégiques  

**Critères d'acceptation :**
- Choix entre missile ou bombe
- Sélection de la case cible
- Confirmation du placement
- Bombe visible sur la grille adverse

### US-011: Désamorçage de bombe
**En tant que** joueur ciblé par une bombe  
**Je veux** décider de désamorcer ou non  
**Afin de** contrôler les révélations  

**Critères d'acceptation :**
- Alerte au début du tour
- Choix désamorcer/laisser exploser
- Timer de décision (30 secondes)
- Conséquences immédiates

### US-012: Effets de la bombe
**En tant que** joueur  
**Je veux** voir les effets de la bombe  
**Afin de** adapter ma stratégie  

**Critères d'acceptation :**
- Zone 9x9 révélée (si non désamorcée)
- Zone aléatoire révélée chez le lanceur (si désamorcée)
- Animation de révélation
- Cases découvertes permanentes

## Épic 6: Multi-joueurs

### US-013: Jeu 3+ joueurs
**En tant que** joueur  
**Je veux** jouer avec plus de 2 joueurs  
**Afin de** avoir des parties plus stratégiques  

**Critères d'acceptation :**
- Tours séquentiels (joueur 1 → 2 → 3 → 1...)
- Gestion des états pour tous les joueurs
- Synchronisation parfaite
- Interface adaptée au nombre de joueurs

### US-014: Conditions de victoire multi-joueurs
**En tant que** joueur  
**Je veux** comprendre les règles de fin de partie  
**Afin de** savoir quand la partie se termine  

**Critères d'acceptation :**
- Dernier joueur avec flotte intacte gagne
- Possibilité d'alliances temporaires (futur)
- Écran de résultats détaillé

## Épic 7: Fonctionnalités Sociales

### US-015: Chat en jeu
**En tant que** joueur  
**Je veux** communiquer pendant la partie  
**Afin de** rendre le jeu plus social  

**Critères d'acceptation :**
- Chat intégré à l'interface
- Messages temps réel
- Historique scrollable
- Emojis et messages prédéfinis

### US-016: Système d'amis
**En tant que** joueur  
**Je veux** gérer mes amis  
**Afin de** jouer facilement avec eux  

**Critères d'acceptation :**
- Recherche d'utilisateurs
- Liste d'amis
- Invitations directes
- Statut en ligne

## Épic 8: PWA et Mobile

### US-017: Installation PWA
**En tant que** joueur mobile  
**Je veux** installer l'app  
**Afin de** jouer hors navigateur  

**Critères d'acceptation :**
- Prompt d'installation
- Icône sur l'écran d'accueil
- Lancement en fullscreen
- Mise à jour automatique

### US-018: Jeu hors ligne
**En tant que** joueur  
**Je veux** accéder au jeu sans connexion  
**Afin de** jouer partout  

**Critères d'acceptation :**
- Cache des assets principaux
- Mode dégradé hors ligne
- Synchronisation à la reconnexion
- Parties locales (futur)

### US-019: Notifications
**En tant que** joueur  
**Je veux** être notifié des événements  
**Afin de** rester engagé  

**Critères d'acceptation :**
- Notification de tour
- Rappel de partie en attente
- Messages non lus
- Paramètres de notifications

## Épic 9: Statistiques et Progression

### US-020: Statistiques personnelles
**En tant que** joueur  
**Je veux** voir mes performances  
**Afin de** m'améliorer  

**Critères d'acceptation :**
- Ratio victoires/défaites
- Précision des tirs
- Temps moyen par partie
- Navires préférés

### US-021: Classement
**En tant que** joueur  
**Je veux** me comparer aux autres  
**Afin de** avoir un objectif  

**Critères d'acceptation :**
- Classement global
- Classement par amis
- Saisons de jeu
- Récompenses

## Épic 10: Accessibilité et UX

### US-022: Accessibilité
**En tant que** joueur avec handicap  
**Je veux** pouvoir jouer facilement  
**Afin de** profiter du jeu  

**Critères d'acceptation :**
- Support du lecteur d'écran
- Contraste élevé
- Navigation clavier
- Tailles de texte ajustables

### US-023: Performance
**En tant que** joueur  
**Je veux** une expérience fluide  
**Afin de** profiter du jeu sans lag  

**Critères d'acceptation :**
- Temps de chargement < 2s
- Animations fluides 60fps
- Pas de freeze pendant le jeu
- Optimisé pour mobile

## Priorisation

### Must Have (MVP)
- US-001, US-003, US-004, US-005
- US-006, US-007, US-008, US-009
- US-017, US-023

### Should Have
- US-002, US-010, US-011, US-012
- US-015, US-018, US-019
- US-020, US-022

### Could Have
- US-013, US-014, US-016
- US-021

### Won't Have (v1)
- Tournois, monnaie virtuelle, IA
