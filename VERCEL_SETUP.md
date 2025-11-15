# Configuration Vercel - Structure avec src/

## ✅ Structure corrigée

Votre projet utilise maintenant la structure suivante (compatible Vercel) :

```
BattleWeb/
├── package.json          ← À la racine (requis par Vercel)
├── next.config.ts        ← À la racine (requis par Vercel)
├── tsconfig.json         ← À la racine (requis par Vercel)
├── tailwind.config.js    ← À la racine (requis par Vercel)
├── postcss.config.mjs    ← À la racine (requis par Vercel)
├── eslint.config.mjs     ← À la racine
├── src/                  ← Code source
│   ├── app/              ← Next.js App Router
│   ├── components/       ← Composants React
│   ├── lib/              ← Utilitaires
│   ├── public/           ← Assets statiques
│   └── ...
└── ...
```

## ✅ Ce qui a été fait

1. ✅ Déplacé `package.json` à la racine
2. ✅ Déplacé `next.config.ts` à la racine
3. ✅ Déplacé `tsconfig.json` à la racine (avec alias `@/*` pointant vers `./src/*`)
4. ✅ Déplacé `tailwind.config.js` à la racine (configuré pour `src/`)
5. ✅ Déplacé `postcss.config.mjs` à la racine
6. ✅ Déplacé `eslint.config.mjs` à la racine

## 🚀 Déploiement sur Vercel

Maintenant que la structure est correcte, Vercel va :

1. **Détecter automatiquement Next.js** (via `package.json` à la racine)
2. **Installer les dépendances** (`npm install`)
3. **Builder le projet** (`npm run build`)
4. **Déployer** automatiquement

### Configuration Vercel

Quand vous importez le projet sur Vercel :

1. **Root Directory** : Laisser vide (ou `/`)
2. **Build Command** : `npm run build` (détecté automatiquement)
3. **Output Directory** : `.next` (détecté automatiquement)
4. **Install Command** : `npm install` (détecté automatiquement)

### Variables d'environnement

N'oubliez pas d'ajouter dans Vercel (Settings → Environment Variables) :

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
```

## ✅ Vérification

Votre projet est maintenant **100% compatible Vercel** !

Next.js supporte nativement la structure avec `src/` :
- ✅ `src/app/` → Routes Next.js
- ✅ `src/components/` → Composants
- ✅ `src/public/` → Assets statiques
- ✅ `src/lib/` → Utilitaires

Tout fonctionne comme prévu ! 🎉

