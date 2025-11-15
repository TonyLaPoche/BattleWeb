# BattleWeb - Jeu de Bataille Navale Multi-Joueurs

## Vue d'ensemble

BattleWeb est un jeu de stratégie naval en ligne développé comme Progressive Web App (PWA) avec un design mobile-first. Le jeu combine les mécaniques classiques de la bataille navale avec des éléments modernes de stratégie tour par tour, permettant des parties 1vs1 ou multi-joueurs (1vs1vs1+).

## Fonctionnalités principales

### Modes de jeu
- **1 vs 1** : Duel classique entre deux joueurs
- **Multi-joueurs** : Parties avec 3 joueurs ou plus

### Mécaniques de jeu
- **Tour par tour** : Système de jeu stratégique
- **Missiles à l'aveugle** : Attaques classiques sans visibilité
- **Bombes de détection** :
  - Si non désamorcée : révèle une zone 9x9 autour de l'emplacement
  - Si désamorcée : révèle une zone aléatoire chez l'expéditeur

### Technologies
- **Frontend** : PWA mobile-first
- **Backend** : Architecture temps réel pour les parties multi-joueurs
- **Base de données** : Stockage des parties et statistiques

## État du projet

🟢 **Phase 3 en cours** - Mécaniques avancées implémentées

### ✅ Fonctionnalités complétées
- Authentification Firebase (email/password, réinitialisation)
- Dashboard avec création/rejoindre des parties
- Lobby avec chat temps réel et paramètres admin
- Placement automatique des navires (grille 12x12)
- Système de jeu 1v1 et 1v1v1 avec sélection de cible
- Bombes de détection avec désamorçage (pénalité 2 tours)
- Timer par tour configurable
- Gestion de fin de partie avec retour lobby/menu
- Système d'abandon
- Historique local des parties
- Profil utilisateur
- Nettoyage automatique des parties terminées
- Reprise de parties actives depuis le dashboard

## Structure du projet

```
BattleWeb/
├── docs/           # Documentation technique
├── planning/       # Planification et roadmap
├── specs/         # Spécifications fonctionnelles
├── src/           # Code source (à créer)
└── README.md      # Ce fichier
```

## Installation et développement

*(À définir lors de la phase de développement)*

## Contribution

*(À définir)*

## Licence

*(À définir)*
