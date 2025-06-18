# @kvkit/query

URL and query string utilities for codec-driven data transformation.

## Installation

```bash
npm install @kvkit/query @kvkit/codecs
```

## Overview

@kvkit/query provides utilities for encoding and decoding data to/from URL parameters using kvkit codecs. It handles URL search parameters, hash parameters, and browser history management.

## Basic Usage

```typescript
import { encodeToQuery, decodeFromQuery, updateQuery, getCurrentQuery } from '@kvkit/query';
import { flatCodec } from '@kvkit/codecs';

const codec = flatCodec<{ query: string; page: number }>();

// Encode data to URLSearchParams
const params = encodeToQuery(codec, { query: 'search', page: 2 });
console.log(params.toString()); // "query=search&page=2"

// Decode URLSearchParams back to data
const data = decodeFromQuery(codec, params);
console.log(data); // { query: 'search', page: 2 }

// Update the current URL (browser only)
updateQuery(codec, { query: 'new search', page: 1 });

// Get current URL state (browser only)
const currentState = getCurrentQuery(codec);
```

## API Reference

### `encodeToQuery<T>(codec: Codec<T>, value: T): URLSearchParams`

Converts a value to URLSearchParams using the provided codec.

```typescript
import { jsonCodec } from '@kvkit/codecs';

const userCodec = jsonCodec<{ name: string; role: string }>();
const params = encodeToQuery(userCodec, { name: 'Alice', role: 'admin' });
// URLSearchParams with: data={"name":"Alice","role":"admin"}
```

### `decodeFromQuery<T>(codec: Codec<T>, params: URLSearchParams): T`

Converts URLSearchParams back to a value using the provided codec.

```typescript
const params = new URLSearchParams('name=John&age=30');
const userCodec = flatCodec<{ name: string; age: number }>();
const user = decodeFromQuery(userCodec, params);
// { name: 'John', age: 30 }
```

### `updateQuery<T>(codec: Codec<T>, value: T, options?): void`

Updates the current browser URL with the encoded value.

**Options:**
- `replace: boolean` - Use `replaceState` instead of `pushState` (default: `false`)

```typescript
// Add to history
updateQuery(codec, newState);

// Replace current history entry
updateQuery(codec, newState, { replace: true });
```

### `getCurrentQuery<T>(codec: Codec<T>): T`

Gets the current URL state decoded using the provided codec.

```typescript
// For URL: https://example.com?query=search&page=2
const searchState = getCurrentQuery(flatCodec<{ query: string; page: number }>());
// { query: 'search', page: 2 }
```

## Utility Functions

### `urlSearchParamsToStringMap(params: URLSearchParams): Record<string, string>`

Converts URLSearchParams to a plain string map.

```typescript
const params = new URLSearchParams('name=John&age=30');
const map = urlSearchParamsToStringMap(params);
// { name: 'John', age: '30' }
```

### `stringMapToURLSearchParams(data: Record<string, string>): URLSearchParams`

Converts a string map to URLSearchParams.

```typescript
const map = { name: 'John', age: '30' };
const params = stringMapToURLSearchParams(map);
// URLSearchParams with name=John&age=30
```

## Usage with Different Codecs

### JSON Codec

Best for complex objects:

```typescript
import { jsonCodec } from '@kvkit/codecs';

const stateCodec = jsonCodec<{ 
  user: { name: string; id: string }; 
  preferences: { theme: string; lang: string };
}>();

updateQuery(stateCodec, {
  user: { name: 'Alice', id: '123' },
  preferences: { theme: 'dark', lang: 'en' }
});
// URL: ?data={"user":{"name":"Alice","id":"123"},"preferences":{"theme":"dark","lang":"en"}}
```

### Flat Codec

Best for simple form data:

```typescript
import { flatCodec } from '@kvkit/codecs';

const searchCodec = flatCodec<{ 
  query: string; 
  category: string; 
  minPrice: number; 
  maxPrice: number; 
}>();

updateQuery(searchCodec, {
  query: 'laptop',
  category: 'electronics',
  minPrice: 100,
  maxPrice: 2000
});
// URL: ?query=laptop&category=electronics&minPrice=100&maxPrice=2000
```

### Prefix Codec

Best for avoiding conflicts:

```typescript
import { prefixCodec } from '@kvkit/codecs';

const userCodec = prefixCodec<{ name: string; role: string }>('user');
const searchCodec = prefixCodec<{ query: string; filters: string[] }>('search');

// Multiple codecs can coexist without conflicts
updateQuery(userCodec, { name: 'Bob', role: 'admin' });
updateQuery(searchCodec, { query: 'reports', filters: ['recent'] });
// URL: ?user.name=Bob&user.role=admin&search.query=reports&search.filters=["recent"]
```

## Error Handling

All functions handle errors gracefully:

- `updateQuery` and `getCurrentQuery` throw errors in non-browser environments
- `decodeFromQuery` returns codec defaults for missing or invalid data
- Invalid JSON in codecs returns empty objects or default values

## Browser Compatibility

Requires `URLSearchParams` and `History API` support. Compatible with all modern browsers.

## License

MIT
