import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  urlSearchParamsToStringMap,
  stringMapToURLSearchParams,
  decodeFromQuery,
  encodeToQuery,
  getCurrentQuery,
  updateQuery,
} from './index.js';
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
const mockWindow = {
  location: {
    search: '?name=John&age=30',
    href: 'https://example.com?name=John&age=30',
  },
  history: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
  },
};

describe('query utilities', () => {
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    originalWindow = globalThis.window;
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
        country: 'USA'
      };
      const result = stringMapToURLSearchParams(data);
      
      expect(result.get('name')).toBe('John');
      expect(result.get('age')).toBeNull();
      expect(result.get('city')).toBeNull();
      expect(result.get('country')).toBe('USA');
    });
  });

  describe('decodeFromQuery', () => {
    it('should decode value from URLSearchParams using codec', () => {
      const params = new URLSearchParams('name=John&age=30');
      const result = decodeFromQuery(mockCodec, params);
      
      expect(result).toEqual({
        name: 'John',
        age: 30,
      });
    });

    it('should handle missing parameters with codec defaults', () => {
      const params = new URLSearchParams('name=John');
      const result = decodeFromQuery(mockCodec, params);
      
      expect(result).toEqual({
        name: 'John',
        age: 0, // default from mock codec
      });
    });
  });

  describe('encodeToQuery', () => {
    it('should encode value to URLSearchParams using codec', () => {
      const value = { name: 'John', age: 30 };
      const result = encodeToQuery(mockCodec, value);
      
      expect(result.get('name')).toBe('John');
      expect(result.get('age')).toBe('30');
    });

    it('should handle complex objects', () => {
      const value = { name: 'Jane Doe', age: 25 };
      const result = encodeToQuery(mockCodec, value);
      
      expect(result.get('name')).toBe('Jane Doe');
      expect(result.get('age')).toBe('25');
    });
  });

  describe('getCurrentQuery', () => {
    it('should get current query string as value using codec', () => {
      // @ts-ignore - Mock window for testing
      globalThis.window = mockWindow;
      
      const result = getCurrentQuery(mockCodec);
      
      expect(result).toEqual({
        name: 'John',
        age: 30,
      });
    });

    it('should throw error in non-browser environment', () => {
      // @ts-ignore - Remove window for testing
      globalThis.window = undefined;
      
      expect(() => getCurrentQuery(mockCodec)).toThrow(
        'getCurrentQuery can only be used in browser environment'
      );
    });
  });

  describe('updateQuery', () => {
    it('should update URL query string with pushState by default', () => {
      // @ts-ignore - Mock window for testing
      globalThis.window = mockWindow;
      
      const value = { name: 'Jane', age: 25 };
      updateQuery(mockCodec, value);
      
      expect(mockWindow.history.pushState).toHaveBeenCalledWith(
        null,
        '',
        'https://example.com/?name=Jane&age=25'
      );
      expect(mockWindow.history.replaceState).not.toHaveBeenCalled();
    });

    it('should update URL query string with replaceState when replace option is true', () => {
      // @ts-ignore - Mock window for testing
      globalThis.window = mockWindow;
      
      const value = { name: 'Bob', age: 40 };
      updateQuery(mockCodec, value, { replace: true });
      
      expect(mockWindow.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        'https://example.com/?name=Bob&age=40'
      );
      expect(mockWindow.history.pushState).not.toHaveBeenCalled();
    });

    it('should throw error in non-browser environment', () => {
      // @ts-ignore - Remove window for testing
      globalThis.window = undefined;
      
      const value = { name: 'Test', age: 20 };
      
      expect(() => updateQuery(mockCodec, value)).toThrow(
        'updateQuery can only be used in browser environment'
      );
    });
  });
});
