# @kvkit/codecs

Core codec implementations for type-safe data serialization and transformation.

## Installation

```bash
npm install @kvkit/codecs
```

## Overview

@kvkit/codecs provides a set of composable codecs for converting JavaScript objects to/from string maps. These are particularly useful for URL parameters, localStorage, and other key-value stores.

## Basic Usage

```typescript
import { stringCodec, numberCodec, jsonCodec, flatCodec, prefixCodec } from '@kvkit/codecs';

// JSON codec with default key
const userCodec = jsonCodec<{ name: string; age: number }>();

const user = { name: 'John', age: 30 };
const encoded = userCodec.encode(user);
// { "data": "{\"name\":\"John\",\"age\":30}" }

const decoded = userCodec.decode(encoded);
// { name: 'John', age: 30 }
```

## Available Codecs

### Simple Value Codecs

- **`stringCodec(key?)`** - String values
- **`numberCodec(key?)`** - Numeric values  
- **`booleanCodec(key?)`** - Boolean values
- **`dateCodec(key?)`** - Date objects
- **`stringArrayCodec(key?)`** - String arrays

All simple value codecs accept an optional `key` parameter (default: `'value'`).

```typescript
const nameCodec = stringCodec('name');
const ageCodec = numberCodec('age');
const activeCodec = booleanCodec('active');

const encoded = nameCodec.encode('John'); // { name: 'John' }
const name = nameCodec.decode({ name: 'John' }); // 'John'
```

### Object Codecs

#### `jsonCodec<T>(key?)`

Serializes entire objects as JSON in a single parameter.

```typescript
const userCodec = jsonCodec<{ name: string; role: string }>('user');
const encoded = userCodec.encode({ name: 'Alice', role: 'admin' });
// { user: '{"name":"Alice","role":"admin"}' }
```

**Use cases:**
- Complex nested objects
- When you want compact URL representation
- Objects with dynamic properties

#### `flatCodec<T>()`

Serializes each object property as a separate key-value pair.

```typescript
const filterCodec = flatCodec<{ query: string; category: string; active: boolean }>();
const encoded = filterCodec.encode({ query: 'search', category: 'tech', active: true });
// { query: 'search', category: 'tech', active: 'true' }
```

**Use cases:**
- Form data
- Search/filter parameters
- When individual values need to be easily readable/editable

#### `prefixCodec<T>(namespace, separator?)`

Adds a namespace prefix to all keys to avoid conflicts.

```typescript
const userCodec = prefixCodec<{ name: string; role: string }>('user');
const encoded = userCodec.encode({ name: 'Alice', role: 'admin' });
// { 'user.name': 'Alice', 'user.role': 'admin' }

// Custom separator
const configCodec = prefixCodec<{ theme: string }>('app', '_');
// Results in keys like 'app_theme'
```

**Use cases:**
- Modular applications with multiple state sources
- Avoiding parameter name conflicts
- Organizing related parameters

## Codec Interface

All codecs implement the `Codec<T>` interface:

```typescript
interface Codec<T> {
  encode(value: T): Record<string, string>;
  decode(data: Record<string, string>): T;
}
```

## Custom Codecs

Create your own codecs by implementing the interface:

```typescript
import type { Codec } from '@kvkit/codecs';

const customCodec: Codec<{ lat: number; lng: number; zoom: number }> = {
  encode: (location) => ({
    location: `${location.lat},${location.lng},${location.zoom}`
  }),
  
  decode: (data) => {
    const [lat, lng, zoom] = (data.location || '0,0,1').split(',').map(Number);
    return { lat, lng, zoom };
  }
};
```

## Generic Value Codec

For simple custom serialization, use the `valueCodec` helper:

```typescript
import { valueCodec } from '@kvkit/codecs';

const dateCodec = valueCodec<Date>(
  (date) => date.toISOString(),
  (str) => new Date(str || Date.now()),
  'timestamp'
);
```

## License

MIT
