import { useState, useEffect, useCallback } from 'react';
import type { Codec } from '@kvkit/codecs';
import { decodeFromQuery, updateQuery, type URLSyncOptions} from '@kvkit/query';

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
 * Hook to use a codec value synchronized with URL parameters (search or hash)
 * 
 * @param codec - The codec to encode/decode values
 * @param defaultValue - Default value when no URL params exist
 * @param options - Configuration for URL synchronization
 */
export function useUrlSyncedState<T>(
  codec: Codec<T>,
  defaultValue: T,
  options: URLSyncOptions = {}
): [T, (value: T) => void] {
  const getInitialValue = useCallback(() => {
    try {
      return decodeFromQuery(codec, options);
    } catch {
      return defaultValue;
    }
  }, [codec, defaultValue, options]);

  const [value, setValue] = useState<T>(getInitialValue);

  // Listen for URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      setValue(getInitialValue());
    };

    const eventType = options.useHash ? 'hashchange' : 'popstate';
    window.addEventListener(eventType, handleUrlChange);
    return () => window.removeEventListener(eventType, handleUrlChange);
  }, [getInitialValue, options.useHash]);

  const updateUrl = useCallback((newValue: T) => {
    // Update the state immediately for better responsiveness
    setValue(newValue);
    // Update the URL, which will be the single source of truth
    updateQuery(codec, newValue, options);
  }, [codec, options]);

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
