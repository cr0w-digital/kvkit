import { useState, useEffect, useCallback } from 'react';
import type { Codec } from '@kvkit/codecs';

/**
 * Source function that can provide values
 */
export type ValueSource<T> = () => T | Promise<T>;

/**
 * Hook to use a codec value from a source
 */
export function useCodecValue<T>(
  codec: Codec<T>,
  source: ValueSource<Record<string, string>>,
  defaultValue: T
): { value: T; error?: Error; loading: boolean } {
  const [state, setState] = useState<{
    value: T;
    error?: Error;
    loading: boolean;
  }>({
    value: defaultValue,
    error: undefined,
    loading: true,
  });

  const loadValue = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      
      const sourceResult = source();
      const data = await sourceResult;
      const decodedValue = codec.decode(data);
      
      setState({
        value: decodedValue,
        error: undefined,
        loading: false,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Unknown error'),
        loading: false,
      }));
    }
  }, [codec, source]);

  useEffect(() => {
    loadValue();
  }, [loadValue]);

  return state;
}

/**
 * Hook to use a codec value from localStorage
 */
export function useLocalStorageCodec<T>(
  codec: Codec<T>,
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return defaultValue;
      
      const parsed = JSON.parse(stored) as Record<string, string>;
      return codec.decode(parsed);
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T) => {
    try {
      setValue(newValue);
      
      if (typeof window !== 'undefined') {
        const encoded = codec.encode(newValue);
        const serialized = JSON.stringify(encoded);
        window.localStorage.setItem(key, serialized);
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [codec, key]);

  return [value, setStoredValue];
}

/**
 * Options for URL synchronization hooks
 */
export interface UrlSyncOptions {
  /** Whether to use pushState or replaceState for navigation */
  history?: 'push' | 'replace';
  /** Whether to use hash parameters instead of search parameters */
  useHash?: boolean;
  /** When using hash, whether to handle hash routing format "#/path?k=v&..." */
  hashRouting?: boolean;
}

/**
 * Hook to use a codec value synchronized with URL parameters (search or hash)
 * 
 * @param codec - The codec to encode/decode values
 * @param defaultValue - Default value when no URL params exist
 * @param options - Configuration for URL synchronization
 */
export function useUrlSyncedState<T>(
  codec: Codec<T>,
  defaultValue: T,
  options: UrlSyncOptions = {}
): [T, (value: T) => void] {
  const { history = 'replace', useHash = false, hashRouting = false } = options;

  const getParams = useCallback((): URLSearchParams => {
    if (typeof window === 'undefined') return new URLSearchParams();
    
    let paramString: string;
    
    if (useHash) {
      const hash = window.location.hash.slice(1); // Remove the '#'
      
      if (hashRouting) {
        // Handle hash routing format: "#/path?k=v&..."
        const queryIndex = hash.indexOf('?');
        paramString = queryIndex >= 0 ? hash.slice(queryIndex + 1) : '';
      } else {
        // Use entire hash as query string
        paramString = hash;
      }
    } else {
      paramString = window.location.search;
    }
    
    return new URLSearchParams(paramString);
  }, [useHash, hashRouting]);

  const getInitialValue = useCallback((): T => {
    try {
      const params = getParams();
      const data: Record<string, string> = {};
      
      for (const [key, val] of params.entries()) {
        data[key] = val;
      }
      
      return codec.decode(data);
    } catch {
      return defaultValue;
    }
  }, [codec, defaultValue, getParams]);

  const [value, setValue] = useState<T>(getInitialValue);

  // Listen for URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      setValue(getInitialValue());
    };

    if (useHash) {
      window.addEventListener('hashchange', handleUrlChange);
      return () => window.removeEventListener('hashchange', handleUrlChange);
    } else {
      window.addEventListener('popstate', handleUrlChange);
      return () => window.removeEventListener('popstate', handleUrlChange);
    }
  }, [getInitialValue, useHash]);

  const updateUrl = useCallback((newValue: T) => {
    try {
      setValue(newValue);
      
      if (typeof window !== 'undefined') {
        const encoded = codec.encode(newValue);
        const params = new URLSearchParams();
        
        for (const [key, val] of Object.entries(encoded)) {
          if (val !== undefined && val !== null) {
            params.set(key, String(val));
          }
        }
        
        if (useHash) {
          if (hashRouting) {
            // Handle hash routing format: preserve path, update query params
            const hash = window.location.hash.slice(1);
            const queryIndex = hash.indexOf('?');
            const path = queryIndex >= 0 ? hash.slice(0, queryIndex) : hash;
            const queryString = params.toString();
            
            window.location.hash = queryString ? `${path}?${queryString}` : path;
          } else {
            // Use entire hash as query string
            window.location.hash = params.toString();
          }
        } else {
          const url = new URL(window.location.href);
          url.search = params.toString();
          
          if (history === 'replace') {
            window.history.replaceState(null, '', url.toString());
          } else {
            window.history.pushState(null, '', url.toString());
          }
        }
      }
    } catch (error) {
      console.error('Failed to update URL:', error);
    }
  }, [codec, history, useHash, hashRouting]);

  return [value, updateUrl];
}

/**
 * Hook to use a codec value from URL search params
 */
export function useSearchParams<T>(
  codec: Codec<T>,
  defaultValue: T
): [T, (value: T) => void] {
  return useUrlSyncedState(codec, defaultValue, { useHash: false });
}

/**
 * Hook to use a codec value from URL hash params
 */
export function useHashParams<T>(
  codec: Codec<T>,
  defaultValue: T
): [T, (value: T) => void] {
  return useUrlSyncedState(codec, defaultValue, { useHash: true });
}

/**
 * Hook to use a codec value from hash routing params (handles "#/path?k=v&..." format)
 */
export function useHashRoutingParams<T>(
  codec: Codec<T>,
  defaultValue: T
): [T, (value: T) => void] {
  return useUrlSyncedState(codec, defaultValue, { useHash: true, hashRouting: true });
}
