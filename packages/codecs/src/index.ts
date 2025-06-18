/**
 * A codec that can encode and decode values to/from string maps
 */
export interface Codec<T> {
  /**
   * Encode a value to a string map
   */
  encode(value: T): Record<string, string>;
  
  /**
   * Decode a string map to a value
   */
  decode(data: Record<string, string>): T;
}


/**
 * Generic codec for single values with custom serialization
 */
export function valueCodec<T>(
  serialize: (value: T) => string,
  deserialize: (value: string) => T,
  key = 'value'
): Codec<T> {
  return {
    encode: (value: T) => ({ [key]: serialize(value) }),
    decode: (data: Record<string, string>) => deserialize(data[key] || ''),
  };
}

/**
 * Creates a codec for string values
 */
export function stringCodec(key = 'value'): Codec<string> {
  return valueCodec<string>(
    (v) => v,
    (v) => v || '',
    key
  );
}

/**
 * Creates a codec for number values
 */
export function numberCodec(key = 'value'): Codec<number> {
  return valueCodec<number>(
    (v) => v.toString(),
    (v) => Number(v) || 0,
    key
  );
}

/**
 * Creates a codec for boolean values
 */
export function booleanCodec(key = 'value'): Codec<boolean> {
  return valueCodec<boolean>(
    (v) => v.toString(),
    (v) => v === 'true',
    key
  );
}

/**
 * Creates a codec for Date objects
 */
export function dateCodec(key = 'value'): Codec<Date> {
  return valueCodec<Date>(
    (v) => v.toISOString(),
    (v) => new Date(v || Date.now()),
    key
  );
}

/**
 * Creates a codec for arrays of strings
 */
export function stringArrayCodec(key = 'value'): Codec<string[]> {
  return valueCodec<string[]>(
    (v) => v.join(','),
    (v) => v ? v.split(',') : [],
    key
  );
}

/**
 * Creates a codec for JSON-serializable objects
 * @param key - The key to use for the parameter (default: 'data')
 * @returns A codec that serializes objects as JSON in a single parameter
 */
export function jsonCodec<T>(key = 'data'): Codec<T> {
  return {
    encode: (value: T) => ({
      [key]: JSON.stringify(value),
    }),
    decode: (data: Record<string, string>) => {
      const raw = data[key];
      if (!raw) return {} as T;
      try {
        return JSON.parse(raw);
      } catch {
        return {} as T;
      }
    },
  };
}



/**
 * Creates a codec that serializes state as individual key-value pairs.
 * This is equivalent to statelet's flatCodec but adapted for kvkit's Codec interface.
 * Non-string values are JSON-serialized.
 *
 * @returns A codec that serializes state as individual key-value pairs
 */
export function flatCodec<T extends Record<string, any>>(): Codec<T> {
  return {
    encode: (value: T) => {
      const out: Record<string, string> = {};
      for (const key in value) {
        const val = value[key];
        out[key] = typeof val === 'string' ? val : JSON.stringify(val);
      }
      return out;
    },
    decode: (data: Record<string, string>) => {
      const out: Partial<T> = {};
      for (const [key, value] of Object.entries(data)) {
        try {
          out[key as keyof T] = JSON.parse(value);
        } catch {
          out[key as keyof T] = value as any;
        }
      }
      return out as T;
    },
  };
}

/**
 * Creates a codec that prefixes all keys with a given namespace.
 * This is equivalent to statelet's prefixCodec but adapted for kvkit's Codec interface.
 *
 * @param namespace - The namespace to prefix keys with
 * @param separator - The separator to use between the namespace and the keys (default: '.')
 * @returns A codec that prefixes keys with the given namespace
 */
export function prefixCodec<T extends Record<string, any>>(
  namespace: string,
  separator = '.'
): Codec<T> {
  const prefix = namespace + separator;
  return {
    encode: (value: T) => {
      const out: Record<string, string> = {};
      for (const key in value) {
        const val = value[key];
        out[`${prefix}${key}`] = typeof val === 'string' ? val : JSON.stringify(val);
      }
      return out;
    },
    decode: (data: Record<string, string>) => {
      const out: Partial<T> = {};
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith(prefix)) {
          const sub = key.slice(prefix.length);
          try {
            out[sub as keyof T] = JSON.parse(value);
          } catch {
            out[sub as keyof T] = value as any;
          }
        }
      }
      return out as T;
    },
  };
}
