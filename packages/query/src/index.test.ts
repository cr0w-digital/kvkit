import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  urlSearchParamsToStringMap,
  stringMapToURLSearchParams,
  decodeFromQuery,
  updateQuery,
  URLSyncOptions,
} from './index';
import type { Codec } from '@kvkit/codecs';

// Mock codec for testing
const mockCodec: Codec<{ name: string; age: number }> = {
  encode: (value) => ({
    name: value.name,
    age: value.age.toString(),
  }),
  decode: (data) => ({
    name: data.name || '',
    age: parseInt(data.age || '0', 10),
  }),
};

// Mock window object for browser-dependent functions
const getMockWindow = (initialUrl = '/?name=John&age=30') => {
  const url = new URL(initialUrl, 'http://localhost');
  return {
    location: {
      search: url.search,
      hash: url.hash,
      href: url.href,
    },
    history: {
      pushState: vi.fn(),
      replaceState: vi.fn(),
    },
    dispatchEvent: vi.fn(),
  };
};

describe('query utilities', () => {
  let originalWindow: typeof globalThis.window;
  let mockWindow: ReturnType<typeof getMockWindow>;

  beforeEach(() => {
    originalWindow = globalThis.window;
    mockWindow = getMockWindow();
    // @ts-ignore
    globalThis.window = mockWindow;
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  describe('urlSearchParamsToStringMap', () => {
    it('should convert URLSearchParams to string map', () => {
      const params = new URLSearchParams('name=John&age=30&city=NYC');
      const result = urlSearchParamsToStringMap(params);
      expect(result).toEqual({
        name: 'John',
        age: '30',
        city: 'NYC',
      });
    });

    it('should handle empty URLSearchParams', () => {
      const params = new URLSearchParams();
      const result = urlSearchParamsToStringMap(params);
      expect(result).toEqual({});
    });

    it('should handle duplicate keys (keeps last value)', () => {
      const params = new URLSearchParams('name=John&name=Jane');
      const result = urlSearchParamsToStringMap(params);
      expect(result).toEqual({
        name: 'Jane',
      });
    });
  });

  describe('stringMapToURLSearchParams', () => {
    it('should convert string map to URLSearchParams', () => {
      const data = { name: 'John', age: '30', city: 'NYC' };
      const result = stringMapToURLSearchParams(data);
      expect(result.get('name')).toBe('John');
      expect(result.get('age')).toBe('30');
      expect(result.get('city')).toBe('NYC');
    });

    it('should handle empty object', () => {
      const data = {};
      const result = stringMapToURLSearchParams(data);
      expect(result.toString()).toBe('');
    });

    it('should skip null and undefined values', () => {
      const data = {
        name: 'John',
        age: null as any,
        city: undefined as any,
        country: 'USA',
      };
      const result = stringMapToURLSearchParams(data);
      expect(result.get('name')).toBe('John');
      expect(result.has('age')).toBe(false);
      expect(result.has('city')).toBe(false);
      expect(result.get('country')).toBe('USA');
    });
  });

  describe('decodeFromQuery', () => {
    it('should decode value from URL search params using codec', () => {
      const result = decodeFromQuery(mockCodec, {});
      expect(result).toEqual({
        name: 'John',
        age: 30,
      });
    });

    it('should handle missing parameters with codec defaults', () => {
      // @ts-ignore
      globalThis.window = getMockWindow('/?name=John');
      const result = decodeFromQuery(mockCodec, {});
      expect(result).toEqual({
        name: 'John',
        age: 0, // default from mock codec
      });
    });

    it('should decode from hash params if useHash is true', () => {
      // @ts-ignore
      globalThis.window = getMockWindow('/#name=Hashed&age=42');
      const result = decodeFromQuery(mockCodec, { useHash: true });
      expect(result).toEqual({
        name: 'Hashed',
        age: 42,
      });
    });

    it('should return default value in non-browser environment', () => {
      const defaultValue = { name: 'default', age: 99 };
      // @ts-ignore
      globalThis.window = undefined;
      const result = decodeFromQuery(mockCodec, {}, defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });

  describe('updateQuery', () => {
    it('should update URL query string with replaceState by default', () => {
      const value = { name: 'Jane', age: 25 };
      updateQuery(mockCodec, value);

      expect(mockWindow.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        'http://localhost/?name=Jane&age=25'
      );
      expect(mockWindow.history.pushState).not.toHaveBeenCalled();
    });

    it('should update URL query string with pushState when history option is true', () => {
      const value = { name: 'Bob', age: 40 };
      updateQuery(mockCodec, value, { history: 'push' });

      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        null,
        '',
        'http://localhost/?name=Bob&age=40'
      );
      expect(mockWindow.history.replaceState).not.toHaveBeenCalled();
    });

    it('should update hash when useHash is true', () => {
      const value = { name: 'Hashed', age: 42 };
      updateQuery(mockCodec, value, { useHash: true });
      // JSDOM doesn't automatically update location.href from hash, so we check the assignment
      expect(mockWindow.location.hash).toBe('#name=Hashed&age=42');
    });

    it('should do nothing in non-browser environment', () => {
      // @ts-ignore
      globalThis.window = undefined;
      const value = { name: 'Test', age: 20 };
      // Should not throw
      expect(() => updateQuery(mockCodec, value)).not.toThrow();
    });
  });
});
