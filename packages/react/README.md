# @kvkit/react

React hooks for codec-driven state synchronization with URLs and localStorage.

## Installation

```bash
npm install @kvkit/react @kvkit/codecs
# Peer dependency
npm install react
```

## Overview

@kvkit/react provides React hooks that automatically synchronize component state with URL parameters, hash parameters, and localStorage using kvkit codecs. Perfect for building stateful UIs with shareable URLs.

## Basic Usage

```typescript
import { useSearchParams, useHashParams, useLocalStorageCodec } from '@kvkit/react';
import { flatCodec } from '@kvkit/codecs';

function SearchForm() {
  const searchCodec = flatCodec<{ query: string; filters: string[] }>();
  
  // Sync with URL search parameters (?key=value)
  const [search, setSearch] = useSearchParams(
    searchCodec,
    { query: '', filters: [] }
  );
  
  // Sync with URL hash parameters (#key=value)
  const [hashState, setHashState] = useHashParams(
    searchCodec,
    { query: '', filters: [] }
  );

  return (
    <div>
      <input 
        value={search.query}
        onChange={(e) => setSearch({ ...search, query: e.target.value })}
      />
      {/* URL automatically updates as you type */}
    </div>
  );
}
```

## Available Hooks

### `useSearchParams<T>(codec: Codec<T>, defaultValue: T): [T, (value: T) => void]`

Synchronizes state with URL search parameters (`?key=value`).

```typescript
import { useSearchParams } from '@kvkit/react';
import { flatCodec } from '@kvkit/codecs';

function SearchPage() {
  const searchCodec = flatCodec<{ query: string; page: number }>();
  const [search, setSearch] = useSearchParams(searchCodec, { query: '', page: 1 });

  // Updating state automatically updates the URL
  const handleSearch = (query: string) => {
    setSearch({ ...search, query, page: 1 }); // Reset to page 1 on new search
  };

  return (
    <div>
      <input 
        value={search.query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <p>Page: {search.page}</p>
      <button onClick={() => setSearch({ ...search, page: search.page + 1 })}>
        Next Page
      </button>
    </div>
  );
}
```

**Use cases:**
- Search and filter forms
- Pagination state
- Form inputs that should be shareable via URL

### `useHashParams<T>(codec: Codec<T>, defaultValue: T): [T, (value: T) => void]`

Synchronizes state with URL hash parameters (`#key=value`).

```typescript
import { useHashParams } from '@kvkit/react';
import { flatCodec } from '@kvkit/codecs';

function TabsComponent() {
  const tabCodec = flatCodec<{ tab: string; section: string }>();
  const [tabState, setTabState] = useHashParams(tabCodec, { tab: 'overview', section: 'main' });

  return (
    <div>
      <nav>
        <button 
          onClick={() => setTabState({ ...tabState, tab: 'overview' })}
          className={tabState.tab === 'overview' ? 'active' : ''}
        >
          Overview
        </button>
        <button 
          onClick={() => setTabState({ ...tabState, tab: 'details' })}
          className={tabState.tab === 'details' ? 'active' : ''}
        >
          Details
        </button>
      </nav>
      
      {tabState.tab === 'overview' && <OverviewTab />}
      {tabState.tab === 'details' && <DetailsTab />}
    </div>
  );
}
```

**Use cases:**
- Tab/modal state
- Accordion/collapsible sections
- Secondary navigation that doesn't trigger page reloads

### `useLocalStorageCodec<T>(codec: Codec<T>, key: string, defaultValue: T): [T, (value: T) => void]`

Synchronizes state with localStorage using codec serialization.

```typescript
import { useLocalStorageCodec } from '@kvkit/react';
import { flatCodec } from '@kvkit/codecs';

function UserPreferences() {
  const prefsCodec = flatCodec<{ theme: 'light' | 'dark'; fontSize: number; lang: string }>();
  const [prefs, setPrefs] = useLocalStorageCodec(
    prefsCodec,
    'user-preferences',
    { theme: 'light', fontSize: 14, lang: 'en' }
  );

  return (
    <div>
      <label>
        Theme:
        <select 
          value={prefs.theme}
          onChange={(e) => setPrefs({ ...prefs, theme: e.target.value as 'light' | 'dark' })}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      
      <label>
        Font Size:
        <input 
          type="range"
          min="10" 
          max="20"
          value={prefs.fontSize}
          onChange={(e) => setPrefs({ ...prefs, fontSize: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}
```

**Use cases:**
- User preferences and settings
- Form drafts and auto-save
- App configuration that persists across sessions

### `useUrlSyncedState<T>(codec: Codec<T>, defaultValue: T, options?): [T, (value: T) => void]`

Generic hook for URL synchronization with configurable options.

**Options:**
- `useHash: boolean` - Use hash parameters instead of search parameters (default: `false`)
- `history: 'push' | 'replace'` - Navigation method (default: `'replace'`)

```typescript
import { useUrlSyncedState } from '@kvkit/react';

// Search parameters with push history
const [state, setState] = useUrlSyncedState(
  codec, 
  defaultValue, 
  { useHash: false, history: 'push' }
);

// Hash parameters
const [hashState, setHashState] = useUrlSyncedState(
  codec, 
  defaultValue, 
  { useHash: true }
);
```

**Note:** `useSearchParams` and `useHashParams` are convenience wrappers around this hook.

### `useCodecValue<T>(codec: Codec<T>, source: ValueSource<Record<string, string>>, defaultValue: T)`

Generic hook for loading data from any source using a codec.

```typescript
import { useCodecValue } from '@kvkit/react';

function ConfigComponent() {
  const configCodec = jsonCodec<{ apiUrl: string; features: string[] }>();
  
  const source = () => fetch('/api/config').then(r => r.json());
  
  const { value: config, error, loading } = useCodecValue(
    configCodec, 
    source, 
    { apiUrl: '', features: [] }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>API URL: {config.apiUrl}</div>;
}
```

## Usage with Different Codecs

### JSON Codec

Best for complex state objects:

```typescript
import { jsonCodec } from '@kvkit/codecs';

const appStateCodec = jsonCodec<{
  user: { name: string; id: string };
  view: { mode: string; filters: string[] };
}>('appState');

const [appState, setAppState] = useSearchParams(appStateCodec, {
  user: { name: '', id: '' },
  view: { mode: 'grid', filters: [] }
});
```

### Flat Codec

Best for form-like state:

```typescript
import { flatCodec } from '@kvkit/codecs';

const formCodec = flatCodec<{
  name: string;
  email: string;
  age: number;
  newsletter: boolean;
}>();

const [form, setForm] = useSearchParams(formCodec, {
  name: '',
  email: '',
  age: 0,
  newsletter: false
});
```

### Prefix Codec

Best for modular components:

```typescript
import { prefixCodec } from '@kvkit/codecs';

function SearchWidget() {
  const searchCodec = prefixCodec<{ query: string; category: string }>('search');
  const [search, setSearch] = useSearchParams(searchCodec, { query: '', category: 'all' });
  
  // URL will have parameters like: ?search.query=test&search.category=books
}

function UserWidget() {
  const userCodec = prefixCodec<{ name: string; role: string }>('user');
  const [user, setUser] = useSearchParams(userCodec, { name: '', role: 'guest' });
  
  // URL will have parameters like: ?user.name=alice&user.role=admin
  // No conflicts with SearchWidget parameters
}
```

## Combining Hooks

You can use multiple hooks together for complex state management:

```typescript
function App() {
  // URL search params for main app state
  const [search, setSearch] = useSearchParams(
    flatCodec<{ query: string; page: number }>(),
    { query: '', page: 1 }
  );
  
  // Hash params for UI state
  const [ui, setUi] = useHashParams(
    flatCodec<{ tab: string; modal: boolean }>(),
    { tab: 'main', modal: false }
  );
  
  // localStorage for user preferences
  const [prefs, setPrefs] = useLocalStorageCodec(
    flatCodec<{ theme: string; pageSize: number }>(),
    'user-prefs',
    { theme: 'light', pageSize: 10 }
  );

  return (
    <div className={prefs.theme}>
      {/* Your app with synced state */}
    </div>
  );
}
```

## Error Handling

All hooks handle errors gracefully:

- URL hooks work in SSR environments by using default values
- localStorage hooks handle storage errors and quota exceeded scenarios
- Invalid data is decoded to defaults using codec behavior

## TypeScript Support

All hooks are fully typed and will provide excellent IntelliSense:

```typescript
const [state, setState] = useSearchParams(codec, defaultValue);
// 'state' and 'setState' are properly typed based on your codec
```

## License

MIT
