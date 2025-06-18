import type { Codec } from '@kvkit/codecs';

/**
 * Convert URLSearchParams to a string map
 */
export function urlSearchParamsToStringMap(params: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

/**
 * Convert a string map to URLSearchParams
 */
export function stringMapToURLSearchParams(data: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      params.set(key, value);
    }
  }
  return params;
}

/**
 * Decode a value from URLSearchParams using a codec
 */
export function decodeFromQuery<T>(codec: Codec<T>, params: URLSearchParams): T {
  const stringMap = urlSearchParamsToStringMap(params);
  return codec.decode(stringMap);
}

/**
 * Encode a value to URLSearchParams using a codec
 */
export function encodeToQuery<T>(codec: Codec<T>, value: T): URLSearchParams {
  const stringMap = codec.encode(value);
  return stringMapToURLSearchParams(stringMap);
}

/**
 * Get the current query string as a value using a codec
 */
export function getCurrentQuery<T>(codec: Codec<T>): T {
  if (typeof window === 'undefined') {
    throw new Error('getCurrentQuery can only be used in browser environment');
  }
  const params = new URLSearchParams(window.location.search);
  return decodeFromQuery(codec, params);
}

/**
 * Update the current URL query string with a value using a codec
 */
export function updateQuery<T>(codec: Codec<T>, value: T, options: { replace?: boolean } = {}): void {
  if (typeof window === 'undefined') {
    throw new Error('updateQuery can only be used in browser environment');
  }
  
  const params = encodeToQuery(codec, value);
  const url = new URL(window.location.href);
  url.search = params.toString();
  
  if (options.replace) {
    window.history.replaceState(null, '', url.toString());
  } else {
    window.history.pushState(null, '', url.toString());
  }
}
