# Roadmap Évolutions - BattleWeb

## Vue d'ensemble

Cette roadmap détaille les phases d'implémentation des évolutions futures proposées pour BattleWeb.

## Phase 5: Structures et Bâtiments (3-4 semaines)

### Objectifs
- Implémenter les structures aléatoires sur les grilles
- Système de placement et d'activation
- Interface utilisateur pour les structures

### Tâches techniques
- [ ] Créer le type `Structure` dans `types/game.ts`
- [ ] Implémenter le placement aléatoire des structures
- [ ] Créer les composants visuels pour chaque structure
- [ ] Implémenter la logique d'activation des structures
- [ ] Système de cooldown pour les structures
- [ ] Interface utilisateur pour interagir avec les structures
- [ ] Animations CSS pour les structures actives
- [ ] Tests d'équilibrage

### Structures à implémenter
1. **Antenne Radio** (Priorité 1)
   - Révélation ligne/colonne tous les 3 tours
   - Visuel : Carré bleu clair avec bordure pointillée

2. **Station Radar** (Priorité 1)
   - Révélation rayon 2 cases
   - Visuel : Carré vert avec cercle concentrique

3. **Base de Réparation** (Priorité 2)
   - Réparation 1 case par tour (max 3)
   - Visuel : Carré orange avec croix

4. **Batterie Anti-Aérienne** (Priorité 2)
   - 30% chance d'intercepter un tir
   - Visuel : Carré rouge avec éclair

5. **Sous-marin de Reconnaissance** (Priorité 3)
   - Révélation 3x3 aléatoire (1 fois)
   - Visuel : Carré bleu foncé avec vague

### Livrables
- Structures fonctionnelles et équilibrées
- Interface utilisateur intuitive
- Documentation des mécaniques

### Critères de succès
- ✅ Structures visuellement distinctes
- ✅ Mécaniques équilibrées
- ✅ Performance optimale
- ✅ UX fluide sur mobile

## Phase 6: Pouvoirs Spéciaux (2-3 semaines)

### Objectifs
- Implémenter les pouvoirs spéciaux coûtant plusieurs tours
- Interface de sélection et d'activation
- Système de cooldown

### Tâches techniques
- [ ] Créer le type `SpecialPower` dans `types/game.ts`
- [ ] Implémenter la logique des pouvoirs
- [ ] Interface de sélection des pouvoirs
- [ ] Système de coût en tours
- [ ] Animations pour chaque pouvoir
- [ ] Validation serveur des pouvoirs
- [ ] Tests d'équilibrage

### Pouvoirs à implémenter
1. **Barrage de Missiles** (Priorité 1)
   - Coût : 2 tours
   - Effet : 3 tirs aléatoires

2. **Sonar Actif** (Priorité 1)
   - Coût : 1 tour
   - Effet : Révèle présence des navires

3. **Brouillard de Guerre** (Priorité 2)
   - Coût : 1 tour
   - Effet : Masque la grille 2 tours

4. **Contre-Attaque** (Priorité 3)
   - Coût : 3 tours
   - Effet : Retour de tir automatique

### Livrables
- Pouvoirs fonctionnels
- Interface de sélection intuitive
- Animations fluides

### Critères de succès
- ✅ Pouvoirs équilibrés
- ✅ Interface claire
- ✅ Feedback visuel immédiat

## Phase 7: Événements Aléatoires (2 semaines)

### Objectifs
- Système d'événements globaux
- Notifications visuelles
- Effets sur le gameplay

### Tâches techniques
- [ ] Créer le type `GameEvent` dans `types/game.ts`
- [ ] Système de déclenchement d'événements
- [ ] Cloud Function pour gérer les événements
- [ ] Notifications visuelles
- [ ] Application des effets
- [ ] Tests de fréquence et équilibrage

### Événements à implémenter
1. **Tempête** (Priorité 1)
   - Fréquence : Tous les 10 tours
   - Effet : 20% échec de tir

2. **Brouillard** (Priorité 2)
   - Fréquence : Aléatoire (1/15)
   - Effet : Visibilité réduite

3. **Marée Basse** (Priorité 2)
   - Fréquence : Aléatoire (1/20)
   - Effet : Révèle bordures

### Livrables
- Système d'événements fonctionnel
- Notifications claires
- Équilibrage testé

### Critères de succès
- ✅ Événements équilibrés
- ✅ Notifications visuelles claires
- ✅ Impact gameplay mesurable

## Phase 8: Classes de Navires (2-3 semaines)

### Objectifs
- Système de classes avec bonus/malus
- Sélection dans le lobby
- Indicateurs visuels

### Tâches techniques
- [ ] Créer le type `ShipClass` dans `types/game.ts`
- [ ] Implémenter les 3 classes (Éclaireur, Défenseur, Assaut)
- [ ] Interface de sélection dans le lobby
- [ ] Application des bonus/malus
- [ ] Indicateurs visuels de classe
- [ ] Tests d'équilibrage

### Classes à implémenter
1. **Éclaireur**
   - Bonus : +1 portée révélation
   - Malus : -1 case navire

2. **Défenseur**
   - Bonus : +1 structure défensive
   - Malus : -1 navire

3. **Assaut**
   - Bonus : +1 tir par tour
   - Malus : Navires plus visibles

### Livrables
- Classes fonctionnelles et équilibrées
- Interface de sélection
- Documentation des classes

### Critères de succès
- ✅ Classes équilibrées
- ✅ Choix stratégique significatif
- ✅ Indicateurs visuels clairs

## Phase 9: Progression et Statistiques (2-3 semaines)

### Objectifs
- Système de niveaux et XP
- Achievements
- Statistiques détaillées

### Tâches techniques
- [ ] Créer le type `PlayerStats` dans `types/user.ts`
- [ ] Système de calcul d'XP
- [ ] Système de niveaux
- [ ] Achievements (définition et tracking)
- [ ] Page de statistiques détaillées
- [ ] Graphiques et visualisations
- [ ] Sauvegarde dans Firestore

### Fonctionnalités
1. **Niveaux et XP**
   - Calcul basé sur performance
   - Déblocage de contenus
   - Barre de progression

2. **Achievements**
   - Collection de badges
   - Défis variés
   - Récompenses visuelles

3. **Statistiques**
   - Ratio victoires/défaites
   - Précision moyenne
   - Temps de jeu
   - Préférences (classes, structures)

### Livrables
- Système de progression complet
- Page de statistiques
- Achievements fonctionnels

### Critères de succès
- ✅ Progression motivante
- ✅ Statistiques précises
- ✅ Achievements variés

## Phase 10: Fonctionnalités Sociales (3-4 semaines)

### Objectifs
- Système d'amis
- Classements
- Chat amélioré

### Tâches techniques
- [ ] Créer la collection `friends` dans Firestore
- [ ] Interface d'ajout d'amis
- [ ] Liste d'amis dans le profil
- [ ] Invitations directes
- [ ] Système de classement
- [ ] Page de classements
- [ ] Chat amélioré (emojis, stickers)
- [ ] Statut en ligne

### Fonctionnalités
1. **Système d'amis**
   - Ajout par nom/code
   - Liste et statut
   - Invitations privées

2. **Classements**
   - Classement global
   - Classement par classe
   - Classement mensuel
   - Badges de classement

3. **Chat amélioré**
   - Emojis de réaction
   - Stickers de jeu
   - Messages privés

### Livrables
- Système social complet
- Classements fonctionnels
- Chat enrichi

### Critères de succès
- ✅ Ajout d'amis fluide
- ✅ Classements équitables
- ✅ Chat intuitif

## Phase 11: Modes de Jeu Additionnels (4-5 semaines)

### Objectifs
- Nouveaux modes de jeu
- Variété de gameplay
- Réjouabilité accrue

### Tâches techniques
- [ ] Mode "King of the Hill"
- [ ] Mode "Capture the Flag"
- [ ] Mode "Tournoi"
- [ ] Interface de sélection de mode
- [ ] Logique spécifique à chaque mode
- [ ] Tests d'équilibrage

### Modes à implémenter
1. **King of the Hill**
   - Zone centrale à contrôler
   - Points de contrôle
   - Victoire par contrôle prolongé

2. **Capture the Flag**
   - Navire drapeau par joueur
   - Protection et capture
   - Victoire par capture complète

3. **Mode Tournoi**
   - Brackets éliminatoires
   - Gestion des phases
   - Récompenses finales

### Livrables
- 3 nouveaux modes fonctionnels
- Interface de sélection
- Documentation des modes

### Critères de succès
- ✅ Modes équilibrés
- ✅ Gameplay varié
- ✅ Interface claire

## Phase 12: Polish Final (2-3 semaines)

### Objectifs
- Améliorations visuelles finales
- Optimisations de performance
- Tests complets

### Tâches techniques
- [ ] Animations CSS avancées
- [ ] Effets de particules
- [ ] Optimisations de performance
- [ ] Tests sur différents appareils
- [ ] Corrections de bugs
- [ ] Documentation utilisateur
- [ ] Tutoriel interactif

### Améliorations
1. **Visuelles**
   - Animations fluides
   - Effets de particules
   - Transitions douces

2. **Performance**
   - Optimisation du rendu
   - Réduction de la latence
   - Cache intelligent

3. **UX**
   - Feedback immédiat
   - Messages d'aide
   - Tutoriel complet

### Livrables
- Application polie et optimisée
- Documentation complète
- Tests réussis

### Critères de succès
- ✅ Performance optimale
- ✅ UX exceptionnelle
- ✅ Zéro bug critique

## Estimation globale

### Durée totale
- **Phases 5-12** : 20-28 semaines (~5-7 mois)

### Ressources nécessaires
- Développement : Temps plein
- Design : Partiel (animations, UI)
- Tests : Continu
- Équilibrage : Par phase

### Risques
- **Complexité** : Nouvelles mécaniques à équilibrer
- **Performance** : Nombreux calculs en temps réel
- **Compatibilité** : Tests sur multiples appareils

### Mitigation
- Implémentation progressive
- Tests utilisateurs réguliers
- Ajustements basés sur feedback
- Monitoring de performance

## Priorisation

### Must Have (MVP Évolutions)
1. Structures de base (Antenne, Radar)
2. 2-3 pouvoirs spéciaux
3. Système de progression basique

### Should Have
1. Toutes les structures
2. Tous les pouvoirs
3. Événements aléatoires
4. Classes de navires

### Nice to Have
1. Modes additionnels
2. Fonctionnalités sociales avancées
3. Achievements complexes

## Métriques de succès

### Engagement
- **Temps de jeu moyen** : +30%
- **Parties par joueur** : +50%
- **Retention 7 jours** : +20%

### Équilibrage
- **Taux de victoire par classe** : 45-55%
- **Utilisation des structures** : Équilibrée
- **Satisfaction joueurs** : >80%

### Technique
- **Performance** : <2s chargement
- **Latence** : <100ms
- **Stabilité** : <0.1% crash rate

