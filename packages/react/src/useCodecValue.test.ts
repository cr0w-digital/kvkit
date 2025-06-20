
import { renderHook, act } from '@testing-library/react';
import { useCodecValue } from './index';
import type { Codec } from '@kvkit/codecs';
import { describe, it, expect } from 'vitest';

// A simple codec for testing purposes
const stringCodec: Codec<string> = {
  encode: (value: string) => ({ value }),
  decode: (data: Record<string, string>) => data.value,
};

describe('useCodecValue', () => {
  it('should return the default value initially and then the resolved value', async () => {
    const source = () => Promise.resolve({ value: 'resolved' });
    const { result } = renderHook(() => useCodecValue(stringCodec, source, 'default'));

    expect(result.current.loading).toBe(true);
    expect(result.current.value).toBe('default');

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.value).toBe('resolved');
    expect(result.current.error).toBeUndefined();
  });

  it('should handle errors from the source function', async () => {
    const error = new Error('Failed to fetch');
    const source = () => Promise.reject(error);
    const { result } = renderHook(() => useCodecValue(stringCodec, source, 'default'));

    expect(result.current.loading).toBe(true);

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.value).toBe('default');
    expect(result.current.error).toBe(error);
  });
});
