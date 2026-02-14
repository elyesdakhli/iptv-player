# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IPTV Player (Iptvyk) — a React SPA for streaming IPTV content via the Xtream Codes API protocol. Supports three modes: TV (live streams), FILMS (VOD), and SERIES (not yet implemented).

## Commands

- **Dev server:** `npm run dev` (Vite with `--host`)
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Lint:** `npm run lint` (ESLint flat config, ESLint 9+)
- **Deploy:** `npm run deploy` (builds then deploys to GitHub Pages via `gh-pages -d dist`)
- **Preview:** `npm run preview`

No test framework is configured.

## Architecture

### Data Flow

Source selection → Xtream Codes API connection → Categories (cached in localStorage) → Streams (paginated via infinite scroll, cached with React Query) → Video playback (ReactPlayer/HLS.js)

### Key Layers

- **`src/api/xtreamCodesApi.ts`** — All Xtream Codes API calls. Snake_case API responses are mapped to camelCase TypeScript types via explicit mapper functions defined in the same file.
- **`src/api/storageApi.ts`** — localStorage wrapper. Categories cached with key format `{sourceName}_cat_{MODE}`. Sources stored under `sources` key.
- **`src/hooks/`** — Custom hooks for data fetching and filtering. `useQueryStreams` uses TanStack React Query (`staleTime: Infinity`). `useFetchCategories` fetches then caches to localStorage.
- **`src/context/`** — Two React Contexts: `ModeContext` (AppMode: TV/FILMS/SERIES) and `SourceContext` (active Source).
- **`src/components/`** — No router; navigation is conditional rendering based on selected category/stream. Components use `forwardRef`/`useImperativeHandle` for ref-based parent-child communication.
- **`src/types/Types.ts`** — All shared type definitions.

### Component Hierarchy

`App` → `HomeView` (provides SourceContext) → `CategoriesView` + `StreamsView` + `ChannelView`/`VodDetailsView`

### CORS Proxy

Non-HTTPS URLs are prefixed with a CORS proxy (`src/utils/proxy.ts`). The proxy URL is configured via `VITE_CORS_PROXY` in `.env`.

### Stream URL Format

`{sourceUrl}/{type}/{username}/{password}/{streamId}.{extension}` — constructed in `ChannelView`.

## Conventions

- TypeScript strict mode. No `any` except in storageApi and API response mappers.
- API responses: snake_case → camelCase mapping in `xtreamCodesApi.ts`.
- React Bootstrap for UI components; custom CSS in `src/css/`.
- Infinite scroll loads 50 streams at a time in `StreamsView`.
- `MyImage` component handles cross-origin images via blob URLs with fallback support.
- Base path is `/iptv-player/` (configured in `vite.config.ts` for GitHub Pages).
