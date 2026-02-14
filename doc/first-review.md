# First Code Review — IPTV Player

**Date:** 2026-02-13
**Overall Score: 6/10 — Functional MVP, not production-ready**

---

## What's Done Well

- **Project structure** — clear separation into `api/`, `hooks/`, `components/`, `context/`, `types/`
- **React Query** used correctly in `useQueryStreams` with proper caching (`staleTime: Infinity`)
- **API layer** (`xtreamCodesApi.ts`) cleanly separates snake_case API responses from camelCase domain types with explicit mapper functions
- **Storage abstraction** (`storageApi.ts`) is clean, focused, and uses generics properly
- **Bootstrap integration** gives a functional responsive UI quickly
- **Type definitions** — good upfront types in `Types.ts`, clean hierarchy with `VodStream extends Stream`
- **Common components** (LoadingSpinner, ErrorAlert, SearchBar) are reusable and focused

---

## Critical Issues

| Issue | File | Line(s) |
|---|---|---|
| Memory leak — `URL.createObjectURL()` never revoked | `MyImage.tsx` | 22-31 |
| Bug — `useState<Error\|null>(Error)` initializes with the Error constructor instead of `null` | `useFetchCategories.ts` | 14 |
| Missing dependencies in `useEffect`/`useCallback` arrays | `StreamsView`, `useFetchCategories`, `VodDetailsView` | various |
| Lost promise error — `new Promise((reject) => reject(e))` never returned | `MyImage.tsx` | 18 |

---

## Architectural Concerns

### 1. Imperative Ref Anti-Pattern
`useImperativeHandle` + `forwardRef` used extensively for parent-child communication across HomeView, CategoriesView, SourceItems, and SearchBar. This creates tight coupling and makes data flow hard to trace. Should be replaced with standard state-driven React patterns (callbacks, context, or lifted state).

### 2. Duplicate Stream-Fetching Hooks
Both `useFetchStreams` (manual useState/useEffect) and `useQueryStreams` (React Query) exist for the same purpose. Only `useQueryStreams` should be kept.

### 3. No Error Boundaries
Errors crash the app silently or get swallowed with `console.log`. No global error boundary exists at the App level.

### 4. No Tests
Zero test infrastructure — no test runner, no test files, no testing libraries.

### 5. Inconsistent Error Handling
- `connect()` uses `console.error`, other API functions use `console.log`
- Some errors are rejected, some are silently caught
- No unified error logging or reporting strategy

### 6. Type Inconsistency
`categoryId` is `string` in the `Category` type but `number` in the `Stream` type. This causes confusion and potential bugs throughout the codebase.

---

## Minor Issues

- **Filename typo:** `CopyToClipboad.tsx` should be `CopyToClipboard.tsx`
- **Unnecessary lodash dependency:** imported only for `isEqual` in `StreamsView` — React Query already handles comparison
- **URL construction:** manual string concatenation instead of the `URL` API in `xtreamCodesApi.ts`
- **`AppModeSelector`** maintains local state duplicating parent state — should be a controlled component
- **Magic numbers:** 50 and 150 hardcoded for infinite scroll pagination in `StreamsView`
- **Console.log scattered** across production code (App.tsx, HomeView, CategoriesView, hooks)
- **`activeSource?: Source | null`** in Types.ts — `?` and `| null` are redundant together
- **CSS:** `!important` used in `main.css`, hardcoded colors instead of CSS variables

---

## File-by-File Scores

| File | Score | Key Issue |
|---|---|---|
| `types/Types.ts` | 6/10 | categoryId type inconsistency |
| `context/*.ts` | 5/10 | No provider wrappers, no consumer hooks |
| `hooks/useQueryStreams.ts` | 7/10 | Good React Query usage |
| `hooks/useFetchCategories.ts` | 5/10 | Error init bug, dependency array issues |
| `hooks/useFetchStreams.ts` | 5/10 | Duplicate of useQueryStreams, should be removed |
| `hooks/useActiveSource.ts` | 5/10 | Over-engineered for a localStorage read |
| `hooks/useFilterCategories.ts` | 6/10 | Redundant state, unnecessary wrapping |
| `api/xtreamCodesApi.ts` | 6/10 | Inconsistent error handling, string concat URLs |
| `api/storageApi.ts` | 7/10 | Business logic mixed with persistence in saveSource |
| `utils/proxy.ts` | 8/10 | Simple, correct |
| `main.tsx` | 8/10 | Clean setup |
| `App.tsx` | 5/10 | Ref anti-pattern, mode not persisted |
| `components/HomeView.tsx` | 6/10 | Imperative handle pattern, redundant reset functions |
| `components/CategoriesView.tsx` | 6/10 | Double wrapping memo+forwardRef, missing deps |
| `components/StreamsView.tsx` | 5/10 | Lodash import, state duplication, circular deps |
| `components/ChannelView.tsx` | 6/10 | Duplicated null checks |
| `components/VodDetailsView.tsx` | 5/10 | Missing effect dependencies |
| `components/AppModeSelector.tsx` | 6/10 | Local state duplicates parent |
| `components/SourcesView.tsx` | 6/10 | Error displayed as string |
| `components/common/MyImage.tsx` | 4/10 | Memory leak, lost promise, unnecessary fetch |
| `components/common/SearchBar.tsx` | 7/10 | Good imperative handle, clean UI |
| `components/common/LoadingSpinner.tsx` | 8/10 | Simple, accessible |
| `components/common/ErrorAlert.tsx` | 7/10 | Good error type handling |
| `components/common/CopyToClipboad.tsx` | 7/10 | Filename typo |
| `components/source/SourcesManager.tsx` | 6/10 | Complex state, should use useReducer |
| `components/source/SourceItems.tsx` | 6/10 | Index-based selection fragile |
| `components/source/SourceEditView.tsx` | 6/10 | Validation logic issues |

---

## Verdict: Continue or Rewrite?

**Continue — but refactor before adding features.**

A rewrite is not justified because:
- The component hierarchy and data flow are sound
- The API layer and type system are a reasonable foundation
- React Query is already in place for async state management

### Recommended Cleanup (in priority order)

1. **Fix critical bugs** — MyImage memory leak, Error constructor init, dependency arrays
2. **Remove `useFetchStreams`** — consolidate on `useQueryStreams`
3. **Replace imperative ref patterns** with state callbacks or context
4. **Add error boundary** at the App level
5. **Remove console.log calls** — add proper error handling
6. **Fix `categoryId` type inconsistency** across types
7. **Add test infrastructure** — at minimum for hooks and API layer
