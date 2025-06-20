import { renderHook, act } from '@testing-library/react';
import { useLocalStorageCodec } from './index';
import type { Codec } from '@kvkit/codecs';
import { describe, it, expect, beforeEach } from 'vitest';

// A simple codec for testing purposes
const stringCodec: Codec<string> = {
  encode: (value: string) => ({ value }),
  decode: (data: Record<string, string>) => data.value,
};

describe('useLocalStorageCodec', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should return the default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorageCodec(stringCodec, 'test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should return the value from localStorage if it exists', () => {
    window.localStorage.setItem('test-key', JSON.stringify({ value: 'stored-value' }));
    const { result } = renderHook(() => useLocalStorageCodec(stringCodec, 'test-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('should update the value in localStorage when the setter is called', () => {
    const { result } = renderHook(() => useLocalStorageCodec(stringCodec, 'test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(window.localStorage.getItem('test-key')).toBe(JSON.stringify({ value: 'new-value' }));
  });

  it('should handle JSON parsing errors gracefully', () => {
    window.localStorage.setItem('test-key', 'invalid-json');
    const { result } = renderHook(() => useLocalStorageCodec(stringCodec, 'test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });
});
