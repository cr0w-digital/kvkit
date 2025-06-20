import type { Codec } from '@kvkit/codecs';

/**
 * Options for URL synchronization
 */
export interface URLSyncOptions {
  /** Whether to use pushState or replaceState for navigation */
  history?: 'push' | 'replace';
  /** Whether to use hash parameters instead of search parameters */
  useHash?: boolean;
  /** When using hash, whether to handle hash routing format "#/path?k=v&..." */
  hashRouting?: boolean;
}

/**
 * Convert URLSearchParams to a string map
 */
export function urlSearchParamsToStringMap(
  params: URLSearchParams
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

/**
 * Convert a string map to URLSearchParams
 */
export function stringMapToURLSearchParams(
  data: Record<string, string>
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      params.set(key, value);
    }
  }
  return params;
}

/**
 * Gets the correct parameter string from the URL based on options.
 * @internal
 */
function getParamString(options: URLSyncOptions = {}): string {
  if (typeof window === 'undefined') return '';

  const { useHash = false, hashRouting = false } = options;

  if (useHash) {
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (hashRouting) {
      const queryIndex = hash.indexOf('?');
      return queryIndex >= 0 ? hash.slice(queryIndex + 1) : '';
    }
    return hash;
  }
  return window.location.search;
}

/**
 * Decode a value from URL parameters (search or hash) using a codec
 */
export function decodeFromQuery<T>(
  codec: Codec<T>,
  options: URLSyncOptions = {},
  defaultValue?: T
): T {
  const fallback = () => {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    // If no specific default is provided, use the codec's own default
    return codec.decode({});
  };

  if (typeof window === 'undefined') {
    return fallback();
  }

  try {
    const paramString = getParamString(options);
    if (!paramString) {
      return fallback();
    }
    const params = new URLSearchParams(paramString);
    const stringMap = urlSearchParamsToStringMap(params);
    return codec.decode(stringMap);
  } catch {
    return fallback();
  }
}

/**
 * Update the current URL query string with a value using a codec
 */
export function updateQuery<T>(
  codec: Codec<T>,
  value: T,
  options: URLSyncOptions = {}
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const { history = 'replace', useHash = false, hashRouting = false } = options;
  const encoded = codec.encode(value);
  const params = stringMapToURLSearchParams(encoded);
  const queryString = params.toString();

  if (useHash) {
    if (hashRouting) {
      const hash = window.location.hash.slice(1);
      const queryIndex = hash.indexOf('?');
      const path = queryIndex >= 0 ? hash.slice(0, queryIndex) : hash;
      const newHash = queryString ? `${path}?${queryString}` : path;
      if (`#${newHash}` !== window.location.hash) {
        window.location.hash = `#${newHash}`;
      }
    } else {
      const newHash = `#${queryString}`;
      if (newHash !== window.location.hash) {
        window.location.hash = newHash;
      }
    }
  } else {
    const url = new URL(window.location.href);
    if (url.search !== `?${queryString}`) {
      url.search = queryString;
      if (history === 'replace') {
        window.history.replaceState(null, '', url.toString());
      } else {
        window.history.pushState(null, '', url.toString());
      }
    }
  }
}
