# kvkit

A lightweight toolkit for type-safe, composable data serialization and transformation.

## Overview

**kvkit** provides simple, composable utilities for encoding and decoding data to/from string-based formats like URL parameters, localStorage, and other key-value stores. It focuses on **lightweight, codec-driven operations** without complex reactivity or state management.

## Installation

```bash
npm install @kvkit/codecs @kvkit/query @kvkit/react
```

## Quick Start

### Basic Codecs

```typescript
import { stringCodec, numberCodec, jsonCodec, flatCodec, prefixCodec } from '@kvkit/codecs';

// JSON codec with default key
const userCodec = jsonCodec<{ name: string; age: number }>();

const user = { name: 'John', age: 30 };
const encoded = userCodec.encode(user);
// { "data": "{\"name\":\"John\",\"age\":30}" }

const decoded = userCodec.decode(encoded);
// { name: 'John', age: 30 }

// JSON codec with custom key
const stateCodec = jsonCodec<{ items: string[]; count: number }>('appState');
const state = { items: ['a', 'b'], count: 2 };
const customEncoded = stateCodec.encode(state);
// { appState: '{"items":["a","b"],"count":2}' }

// Flat codec for individual key-value pairs
const filterCodec = flatCodec<{ query: string; category: string; active: boolean }>();
const filters = { query: 'search', category: 'tech', active: true };
const flatEncoded = filterCodec.encode(filters);
// { query: 'search', category: 'tech', active: 'true' }

// Prefix codec for namespaced keys
const userPrefixCodec = prefixCodec<{ name: string; role: string }>('user');
const userData = { name: 'Alice', role: 'admin' };
const prefixEncoded = userPrefixCodec.encode(userData);
// { 'user.name': 'Alice', 'user.role': 'admin' }
```

> 💡 **Try it yourself**: Run `npm run example` to see all codec strategies in action!

### React URL Synchronization

```typescript
import { useHashParams, useSearchParams } from '@kvkit/react';
import { flatCodec } from '@kvkit/codecs';

function SearchForm() {
  const searchCodec = flatCodec<{ query: string; filters: string[] }>();
  
  // Sync with URL hash parameters
  const [hashState, setHashState] = useHashParams(
    searchCodec,
    { query: '', filters: [] }
  );

  // Sync with URL search parameters
  const [search, setSearch] = useSearchParams(
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

### localStorage Persistence

```typescript
import { useLocalStorageCodec } from '@kvkit/react';
import { flatCodec } from '@kvkit/codecs';

function UserProfile() {
  const userCodec = flatCodec<{ name: string; theme: 'light' | 'dark' }>();
  
  const [user, setUser] = useLocalStorageCodec(
    userCodec,
    'user-profile',
    { name: '', theme: 'light' }
  );
  
  return (
    <div>
      <input 
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />
      <button onClick={() => setUser({ ...user, theme: user.theme === 'light' ? 'dark' : 'light' })}>
        Toggle Theme ({user.theme})
      </button>
    </div>
  );
}
```

## Packages

### @kvkit/codecs

Core codec implementations for common data types:

- `booleanCodec` - Boolean values
- `dateCodec` - Date objects
- `flatCodec<T>()` - Individual key-value pairs with JSON values
- `jsonCodec<T>(key?)` - JSON-serializable objects with configurable parameter key
- `numberCodec` - Numeric values
- `prefixCodec<T>(namespace, separator?)` - Namespaced keys
- `stringCodec` - Simple string values
- `stringArrayCodec` - String arrays

#### Codec Strategies

**JSON Codec** (`jsonCodec`):
- Serializes entire state as JSON in one parameter
- Compact URL representation
- Configurable parameter key (default: 'data')
- Good for complex nested objects
- Example: `?data={"name":"John","preferences":{"theme":"dark"}}` or `?user={"name":"John","role":"admin"}`

**Flat Codec** (`flatCodec`):
- Each property becomes a separate parameter
- Easy to read and modify individual values
- Good for forms and filters
- Example: `?name=John&age=30&active=true`

**Prefix Codec** (`prefixCodec`):
- Namespaces parameters with a prefix
- Avoids conflicts when multiple components use URL state
- Good for modular applications
- Example: `?user.name=John&user.role=admin&search.query=test`

### @kvkit/query

URL and query string utilities:

```typescript
import { encodeToQuery, decodeFromQuery, updateQuery } from '@kvkit/query';

// Convert objects to/from URL parameters
const params = encodeToQuery(userCodec, { name: 'John', age: 30 });
const user = decodeFromQuery(userCodec, params);

// Update current URL
updateQuery(userCodec, { name: 'Jane', age: 25 }, { replace: true });
```

### @kvkit/react

React hooks for codec-driven synchronization:

#### `useUrlSyncedState<T>(codec, defaultValue, options?)`

The main hook for URL search parameter synchronization.

**Options:**
- `history: 'push' | 'replace'` - Navigation method (default: `'replace'`)

```typescript
// Search parameters (?key=value) - default behavior
const [state, setState] = useUrlSyncedState(codec, defaultValue);

// Use pushState for navigation history
const [state, setState] = useUrlSyncedState(codec, defaultValue, { history: 'push' });
```

#### `useHashParams<T>(codec, defaultValue)`

Synchronize state with hash parameters (`#key=value`).

```typescript
const [state, setState] = useHashParams(codec, defaultValue);
// Handles hash parameters (#key=value)
```

#### `useSearchParams<T>(codec, defaultValue)`

Synchronize state with search parameters (`?key=value`).

```typescript
import { useSearchParams } from '@kvkit/react';
import { flatCodec } from '@kvkit/codecs';

const searchCodec = flatCodec<{ query: string; page: number }>();
const [search, setSearch] = useSearchParams(searchCodec, { query: '', page: 1 });

// Updates the URL as you change state
setSearch({ query: 'test', page: 2 });
```

- Keeps state in sync with the URL parameters.
- Useful for search/filter forms and pagination.
- Automatically updates the URL and parses changes from the address bar.

### @kvkit/codecs

Core codec implementations and the `Codec<T>` interface:

```typescript
interface Codec<T> {
  encode(value: T): Record<string, string>;
  decode(data: Record<string, string>): T;
}
```

## Custom Codecs

Create your own codecs by implementing the `Codec<T>` interface:

```typescript
import type { Codec } from '@kvkit/codecs';

const customUserCodec: Codec<User> = {
  encode: (user) => ({
    name: user.name,
    age: user.age.toString(),
    active: user.active ? 'true' : 'false'
  }),
  
  decode: (data) => ({
    name: data.name || '',
    age: parseInt(data.age || '0', 10),
    active: data.active === 'true'
  })
};
```
