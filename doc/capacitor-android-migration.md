# Capacitor Android Migration

**Date:** 2026-02-18

## Context

The app was originally deployed as a GitHub Pages SPA (HTTPS). IPTV sources use HTTP, causing two browser-level blockers:

- **Mixed content** — browser hard-blocks HTTP `fetch`/XHR/HLS from an HTTPS page, no header can fix it
- **CORS** — IPTV servers don't set `Access-Control-Allow-Origin`, blocking even HTTPS sources

Distributing as an Android app via Capacitor eliminates both problems at the platform level.

---

## How It's Solved

### API calls (`player_api.php`)
Replaced `axios` with `CapacitorHttp` from `@capacitor/core`. On Android, `CapacitorHttp` makes **native HTTP requests** outside the WebView — CORS and mixed content don't apply. On web (dev server), it falls back to `fetch`, so `npm run dev` still works.

### Stream URLs (HLS/MP4)
Loaded directly by the `<video>` element inside the WebView. Two settings allow HTTP stream URLs to load:
- `allowMixedContent: true` in `capacitor.config.ts` → sets `MIXED_CONTENT_ALWAYS_ALLOW` on the WebView
- `android:usesCleartextTraffic="true"` in `AndroidManifest.xml` → allows HTTP at the OS network layer

---

## Files Changed

| File | Change |
|---|---|
| `package.json` | Added `build:android` and `android:open` scripts |
| `vite.config.ts` | `base: './'` when `BUILD_TARGET=android`, keeps `/iptv-player/` for web |
| `capacitor.config.ts` | New — app ID `com.iptvyk.app`, webDir `dist`, `allowMixedContent: true` |
| `src/api/xtreamCodesApi.ts` | Removed `axios` and `proxyPrefix`, replaced all calls with `CapacitorHttp` |
| `android/app/src/main/AndroidManifest.xml` | Added `android:usesCleartextTraffic="true"` |

---

## Dependencies Added

```
@capacitor/core       (runtime)
@capacitor/android    (runtime)
@capacitor/cli        (devDependency)
```

`axios` is no longer used but kept in `package.json` — can be removed.

---

## Build Workflow

```bash
# Build web assets + sync to Android project
npm run build:android

# Open Android Studio (build APK or run on device from there)
npm run android:open
```

On every code change, re-run `build:android` then sync is done automatically.

---

## What `build:android` Does

```
BUILD_TARGET=android tsc -b
  → TypeScript compile

BUILD_TARGET=android vite build
  → Vite builds with base: './' (relative paths for filesystem loading)

npx cap sync android
  → Copies dist/ into android/app/src/main/assets/public/
  → Updates capacitor.config.json inside the Android project
```

---

## Remaining Limitations

- Updates require a new APK (no over-the-air deploy like GitHub Pages)
- iOS would need a Mac + Apple Developer account ($99/year)
- The web deployment (`npm run deploy`) still works unchanged for non-Android users
