# kvkit

A lightweight toolkit for type-safe, composable data serialization and transformation.

## Quick Start

```bash
npm install @kvkit/codecs @kvkit/query @kvkit/react
```

### Basic Example

```typescript
import { flatCodec } from '@kvkit/codecs';
import { useSearchParams, useHashRoutingParams } from '@kvkit/react';

function SearchForm() {
  const searchCodec = flatCodec<{ query: string; filters: string[] }>();
  const [search, setSearch] = useSearchParams(searchCodec, { query: '', filters: [] });

  return (
    <input 
      value={search.query}
      onChange={(e) => setSearch({ ...search, query: e.target.value })}
    />
  );
}

// For hash routing (e.g., #/products?query=laptop&category=electronics)
function ProductSearch() {
  const searchCodec = flatCodec<{ query: string; category: string }>();
  const [search, setSearch] = useHashRoutingParams(searchCodec, { query: '', category: '' });

  return (
    <div>
      <input 
        value={search.query}
        onChange={(e) => setSearch({ ...search, query: e.target.value })}
      />
      <select 
        value={search.category}
        onChange={(e) => setSearch({ ...search, category: e.target.value })}
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="books">Books</option>
      </select>
    </div>
  );
}
```

> 💡 **Try it yourself**: Run `npm run demo:react` to see kvkit in action!

## Overview

**kvkit** provides simple, composable utilities for encoding and decoding data to/from string-based formats like URL parameters, localStorage, and other key-value stores. It focuses on **lightweight, codec-driven operations** without complex reactivity or state management.

### kvkit vs statelet

- **kvkit**: Simple codec utilities for data transformation and basic synchronization
- **statelet**: Reactive state management with advanced features like computed values, effects, and complex state coordination

Use **kvkit** when you need:
- Simple URL parameter synchronization
- localStorage persistence with type safety
- Lightweight data transformation
- Basic React hooks for URL/localStorage sync

Use **statelet** when you need:
- Complex reactive state management
- Computed values and effects
## Packages

| Package | Description | README |
|---------|-------------|---------|
| [`@kvkit/codecs`](./packages/codecs) | Core codec implementations for data transformation | [📖](./packages/codecs/README.md) |
| [`@kvkit/query`](./packages/query) | URL and query string utilities | [📖](./packages/query/README.md) |
| [`@kvkit/react`](./packages/react) | React hooks for URL and localStorage sync | [📖](./packages/react/README.md) |

## Hash Routing

kvkit now supports hash-based routing patterns like `#/path?param=value`. See the [Hash Routing Guide](./packages/react/HASH_ROUTING.md) for detailed documentation and examples.

## Key Features

### 🎯 **Type-Safe**
All codecs are fully typed with TypeScript, providing excellent developer experience.

### 🧩 **Composable**
Mix and match different codec strategies based on your needs.

### 🪶 **Lightweight**
No complex state management - just simple utilities for data transformation.

### 🔄 **Framework Agnostic**
Core codecs work anywhere, with optional React integration.

### 🚀 **Hash Routing Support**
Built-in support for hash-based routing patterns like `#/path?param=value`.

## Codec Strategies

### JSON Codec
Best for complex nested objects:
```typescript
// URL: ?data={"user":{"name":"Alice","role":"admin"}}
const codec = jsonCodec<{ user: { name: string; role: string } }>();
```

### Flat Codec  
Best for simple form data:
```typescript
// URL: ?name=Alice&role=admin&active=true
const codec = flatCodec<{ name: string; role: string; active: boolean }>();
```

### Prefix Codec
Best for avoiding parameter conflicts:
```typescript
// URL: ?user.name=Alice&user.role=admin
const codec = prefixCodec<{ name: string; role: string }>('user');
```

## URL Synchronization

### Search Parameters
Sync state with URL search parameters:
```typescript
// URL: ?name=Alice&role=admin
const [user, setUser] = useSearchParams(flatCodec<User>(), defaultUser);
```

### Hash Parameters
Sync state with URL hash parameters:
```typescript
// URL: #name=Alice&role=admin
const [user, setUser] = useHashParams(flatCodec<User>(), defaultUser);
```

### Hash Routing
Sync state with hash routing patterns (preserves path):
```typescript
// URL: #/products?query=laptop&category=electronics
const [search, setSearch] = useHashRoutingParams(flatCodec<SearchFilters>(), defaultFilters);
// Path "/products" is preserved when updating parameters
```

## Examples

### React Demo
See the comprehensive React demo showing all kvkit features:

```bash
npm run demo:react
```

### Basic Examples
See the [basic.ts](./examples/basic.ts) file for codec usage examples:

```bash
npm run example
```

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Run React demo
npm run demo:react

# Run basic examples
npm run example

# Add a changeset for your changes
npm run changeset
```

## License

MIT

## Contributing

Contributions welcome! Please read the [contributing guidelines](./CONTRIBUTING.md) and submit pull requests to the main repository.
