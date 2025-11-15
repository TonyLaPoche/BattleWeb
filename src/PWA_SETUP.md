# Configuration PWA - BattleWeb

## ✅ Ce qui a été configuré

### 1. Manifest.json
- ✅ Créé dans `/public/manifest.json`
- ✅ Configuration pour installation PWA
- ✅ Support iOS (Apple Web App)

### 2. Service Worker
- ✅ Créé dans `/public/sw.js`
- ✅ Enregistrement automatique via `sw-register.tsx`
- ✅ Stratégie de cache: Network First, puis Cache
- ✅ Exclusion des requêtes Firebase du cache

### 3. Viewport et Meta Tags
- ✅ Viewport configuré dans `layout.tsx`
- ✅ Meta tags pour iOS
- ✅ Theme color configuré

### 4. Support Tactile (Touch)
- ✅ Drag and drop tactile pour le placement des navires
- ✅ Support des événements touch sur mobile
- ✅ Grille responsive avec tailles adaptatives

### 5. Responsive Design
- ✅ Grille adaptative (8px → 10px → 12px selon la taille d'écran)
- ✅ Header responsive avec layout flex
- ✅ Pages adaptées mobile-first

## 📱 Icônes nécessaires

Vous devez créer deux icônes et les placer dans `/public/` :

1. **icon-192x192.png** (192x192 pixels)
2. **icon-512x512.png** (512x512 pixels)

### Comment créer les icônes

#### Option 1: Outil en ligne
- Utilisez [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- Ou [RealFaviconGenerator](https://realfavicongenerator.net/)

#### Option 2: Créer manuellement
1. Créez une image carrée (512x512 minimum)
2. Redimensionnez en 192x192 et 512x512
3. Placez-les dans `/public/`

#### Option 3: Placeholder temporaire
Pour tester, vous pouvez créer des icônes simples avec un outil comme:
- [Favicon.io](https://favicon.io/)
- Ou utiliser un logo temporaire

## 🧪 Tester la PWA

### Sur Desktop (Chrome/Edge)
1. Ouvrez l'application
2. Ouvrez les DevTools (F12)
3. Onglet "Application" → "Service Workers"
4. Vérifiez que le service worker est actif
5. Onglet "Application" → "Manifest"
6. Vérifiez que le manifest est chargé
7. Cliquez sur l'icône d'installation dans la barre d'adresse

### Sur Mobile (Android)
1. Ouvrez l'application dans Chrome
2. Menu (⋮) → "Ajouter à l'écran d'accueil"
3. L'application s'installe comme une app native

### Sur Mobile (iOS)
1. Ouvrez l'application dans Safari
2. Partage (□↑) → "Sur l'écran d'accueil"
3. L'application s'installe comme une app native

## 📝 Notes importantes

- Le service worker exclut les requêtes Firebase du cache pour garantir la synchronisation temps réel
- La stratégie de cache est "Network First" pour toujours avoir les dernières données
- Le support tactile fonctionne pour le drag and drop des navires
- La grille s'adapte automatiquement à la taille de l'écran

## 🔧 Prochaines améliorations possibles

- [ ] Notifications push pour les tours
- [ ] Mode hors ligne complet
- [ ] Synchronisation en arrière-plan
- [ ] Partage de partie via Web Share API

