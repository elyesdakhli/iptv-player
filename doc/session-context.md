# Session Context — 2026-02-18

Colle ce fichier en entier dans le premier message de la prochaine session.

---

## Problème de départ

L'app IPTV Player était déployée sur GitHub Pages (HTTPS). Les sources IPTV utilisent HTTP. Deux blocages navigateur :
- **Mixed content** — le navigateur bloque les requêtes HTTP depuis une page HTTPS
- **CORS** — les serveurs IPTV ne renvoient pas `Access-Control-Allow-Origin`

Un proxy CORS gratuit (cors-anywhere) était en place mais ne fonctionnait pas pour le streaming.

## Décision prise

Migrer de SPA web vers **application Android via Capacitor**. Raisons :
- `CapacitorHttp` = requêtes HTTP natives, hors WebView → CORS inexistant
- `usesCleartextTraffic` + `allowMixedContent` → les streams HTTP passent dans la WebView
- Réutilise 100% du code React existant

## Ce qui a été fait (commité sur `apk-packaging`)

### Capacitor wiring — commit `67afd20`
- Installé `@capacitor/core`, `@capacitor/android`, `@capacitor/cli`
- Créé `capacitor.config.ts` (appId: `com.iptvyk.app`, allowMixedContent: true)
- Modifié `vite.config.ts` : `base: './'` si `BUILD_TARGET=android`, sinon `/iptv-player/`
- Ajouté scripts `build:android` et `android:open` dans `package.json`
- Remplacé `axios` + `proxyPrefix` par `CapacitorHttp` dans `src/api/xtreamCodesApi.ts`
- Ajouté `android:usesCleartextTraffic="true"` dans `AndroidManifest.xml`
- Documenté dans `doc/capacitor-android-migration.md`

## Prochaine étape convenue

**Redesign mobile UI** — l'app est desktop-first, peu lisible sur petit écran.

Plan détaillé établi (voir échange précédent) :

### Problèmes identifiés par composant
| Composant | Problème |
|---|---|
| `App.tsx` | 3 rows dans le header, trop tall sur mobile |
| `SourcesView` | Colonnes inline qui wrappent mal |
| `AppModeSelector` | Dropdown peu découvrable sur mobile |
| `CategoriesView` | Touch targets trop petits (50px) |
| `StreamsView` TV | Hover states inutiles sur touch |
| `ChannelView` | Ligne Back + titre + Copy trop dense |
| `ChannelEpg` | Colonne latérale invisible sur xs |

### Architecture mobile cible
- **Header condensé** : une seule ligne (nom app + status source + icône gear)
- **Bottom tab bar** : remplace le dropdown mode (TV / Films / Series)
- **Navigation en stack** : catégories → streams → player (plein écran)
- **Player** : plein largeur, EPG en panneau collapsible en dessous
- **StreamsView TV** : liste plate (icon + nom) plutôt que cards avec hover
- **StreamsView Films** : grille 2 colonnes (xs=6) plutôt que plein largeur

## Repo
- GitHub : `elyesdakhli/iptv-player`
- Branche active : `apk-packaging`
- Main branch : `master`
