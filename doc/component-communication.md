# Component Communication Map

**Date:** 2026-02-13
**Status:** Pre-refactoring snapshot

---

## Component Tree

```
App
├── SourcesView
│   └── SourcesManager
│       ├── SourceItems
│       └── SourceEditView
│
├── AppModeSelector
│
└── ModeContext.Provider
    └── HomeView
        └── SourceContext.Provider
            ├── CategoriesView
            │   ├── SearchBar
            │   └── CategoryItems
            │
            ├── StreamsView
            │   ├── SearchBar
            │   └── StreamItems
            │       ├── TvStreamCard
            │       └── FilmStreamCard
            │
            └── ChannelView
                ├── CopyToClipboard
                ├── MyImage
                ├── ChannelEpg
                └── VodDetailsView
```

---

## 3 Communication Channels

### 1. Props (top-down) — normal flow

| Parent | Child | Props passed |
|---|---|---|
| `App` | `AppModeSelector` | `onSelect` callback |
| `App` | `SourcesView` | `onClearData`, `onSourcesChanged` (from homeViewRef) |
| `HomeView` | `CategoriesView` | `onSelect` callback |
| `HomeView` | `StreamsView` | `category` data, `onSelect` callback |
| `HomeView` | `ChannelView` | `stream` data, `onCancelPlay` callback |
| `SourcesView` | `SourcesManager` | `onSourcesChanged` callback (forwarded from App) |
| `SourcesManager` | `SourceItems` | `sources` data, `onSelect` callback |
| `SourcesManager` | `SourceEditView` | `source`, `sources`, `isEdit`, `onSave`, `onCancel`, `onDelete` |
| `CategoriesView` | `SearchBar` | `onSearch`, `searchPlaceHolder` |
| `CategoriesView` | `CategoryItems` | `categories`, `onSelect` |
| `StreamsView` | `SearchBar` | `onSearch`, `searchPlaceHolder` |
| `StreamsView` | `StreamItems` | `streams`, `onSelect` |
| `StreamItems` | `TvStreamCard` | `stream`, `index`, `onSelect` |
| `StreamItems` | `FilmStreamCard` | `stream`, `onSelect` |
| `ChannelView` | `CopyToClipboard` | `textToCopy`, `buttonLabel` |
| `ChannelView` | `ChannelEpg` | `stream`, `className` |
| `ChannelView` | `VodDetailsView` | `stream` |

### 2. React Context (transversal top-down)

| Context | Provider location | Consumers |
|---|---|---|
| `ModeContext` | `App.tsx` | `CategoriesView`, `StreamItems`, `ChannelView`, `VodDetailsView` |
| `SourceContext` | `HomeView.tsx` | `CategoriesView`, `ChannelView`, `ChannelEpg`, `VodDetailsView` |

### 3. Imperative Refs (bottom-up) — the anti-pattern

| Parent | Child | Exposed method | Purpose |
|---|---|---|---|
| `App` | `HomeView` | `handleClearData()` | Reset selected category/stream + clear categories cache |
| `App` | `HomeView` | `handleSourceChanged()` | Reset selections + reload active source from localStorage |
| `HomeView` | `CategoriesView` | `handleClearData()` | Clean categories from localStorage + re-fetch from API |
| `CategoriesView` | `SearchBar` | `resetSearch()` | Clear search input field |
| `StreamsView` | `SearchBar` | `resetSearch()` | Clear search input field |
| `SourcesManager` | `SourceItems` | `clearSelection()` | Deselect highlighted source in list |

---

## Critical Call Chains

### "Clear & Reload" button (SourcesView)

```
SourcesView: onClick
  └─► calls onClearData prop
      └─► App: homeViewRef.current?.handleClearData  ⚠️ can be undefined on first render
          └─► HomeView.handleClearData:
              ├─ setSelectedStream(null)
              ├─ setSelectedCategory(null)
              └─► categoriesViewRef.current?.handleClearData  ⚠️ can be null
                  └─► CategoriesView.handleClearData:
                      ├─ storageApi.cleanCategories(source.name, mode)
                      └─ reFetchCategories()
```

**Risk:** 4 levels of imperative calls. If any ref is null, the chain breaks silently.

### Source changed (SourcesManager save/delete)

```
SourcesManager: handleSaveSource / handleDeleteSource
  └─► calls onSourcesChanged prop
      └─► SourcesView: forwards onSourcesChanged prop
          └─► App: homeViewRef.current?.handleSourceChanged  ⚠️ can be undefined
              └─► HomeView.handleSourceChanged:
                  ├─ setSelectedStream(null)
                  ├─ setSelectedCategory(null)
                  └─ loadActiveSource()  (re-reads localStorage)
```

### Mode change (AppModeSelector)

```
AppModeSelector: onSelect dropdown event
  └─► App: setMode(newMode)
      └─► ModeContext.Provider re-renders with new value
          └─► CategoriesView: useEffect([mode])
              ├─ reFetchCategories()
              ├─ clearFilter()
              └─► searchBarRef.current?.resetSearch()  ⚠️ imperative
```

### Category selection

```
CategoryItems: onClick
  └─► CategoriesView: onSelect prop
      └─► HomeView: handleSelectCategory
          ├─ setSelectedCategory(category)
          └─ setSelectedStream(null)
              └─► StreamsView renders with new category prop
                  └─► useQueryStreams fetches streams for category
```

### Stream selection → playback

```
StreamItems > TvStreamCard/FilmStreamCard: onClick
  └─► StreamsView: onSelect prop
      └─► HomeView: handleSelectStream
          └─ setSelectedStream(stream)
              └─► ChannelView renders with stream prop
                  ├─ useEffect builds stream URL
                  ├─ ReactPlayer starts playback
                  └─ ChannelEpg or VodDetailsView fetches details
```

---

## Data Sources per Component

| Component | Local state | Context | Hooks | localStorage (via hooks) |
|---|---|---|---|---|
| `App` | `mode` | — | — | — |
| `SourcesView` | — | — | `useActiveSource`, `useQuery(connect)` | active source |
| `HomeView` | `selectedCategory`, `selectedStream` | — | `useActiveSource` | active source |
| `CategoriesView` | — | `SourceContext`, `ModeContext` | `useFetchCategories`, `useFilterCategories` | categories cache |
| `StreamsView` | `displayStreams` | — | `useQueryStreams` | — |
| `StreamItems` | `displayedStreams` (paginated) | `ModeContext` | — | — |
| `ChannelView` | `streamUrl` | `SourceContext`, `ModeContext` | — | — |
| `ChannelEpg` | `shortEpgs`, `loading` | `SourceContext` | — | — |
| `VodDetailsView` | `vodInfo`, `loading`, `noImage` | `SourceContext`, `ModeContext` | — | — |
| `SourcesManager` | `source`, `sources`, `showModal`, `showSourceForm`, `editMode` | — | — | sources list |
| `SourceItems` | `selectedSourceInd` | — | — | — |
| `SourceEditView` | `formData`, `validated`, `createSourceError` | — | — | — |

---

## Problems Summary

1. **Imperative refs for bottom-up communication** — 5 `useImperativeHandle` usages creating fragile call chains that fail silently when refs are null
2. **`SourcesView` receives callbacks from a ref that may be undefined** — `homeViewRef.current?.handleClearData` is passed as a prop at render time, but `homeViewRef.current` is null until HomeView mounts
3. **Duplicate state** — `useActiveSource` called independently in both `SourcesView` and `HomeView`, reading the same localStorage value without shared state
4. **`displayStreams` in StreamsView duplicates React Query's data** — extra state layer with lodash `isEqual` comparison that React Query already handles
5. **No centralized reset mechanism** — clearing app state requires chaining imperative calls through 4 component levels
