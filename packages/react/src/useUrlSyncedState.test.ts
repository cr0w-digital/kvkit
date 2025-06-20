import { renderHook, act, waitFor } from '@testing-library/react';
import { useUrlSyncedState } from './index';
import { describe, it, expect, beforeEach } from 'vitest';
import type { Codec } from '@kvkit/codecs';

// Codec factory for a single URL parameter
const createParamCodec = (paramName: string, defaultValue: string): Codec<string> => ({
  encode: (value: string) => {
    if (value === defaultValue) {
      return {};
    }
    return { [paramName]: value };
  },
  decode: (data: Record<string, string>) => data[paramName] ?? defaultValue,
});

// Helper to set the URL for a test
const setUrl = (url: string, state: any = null) => {
  window.history.pushState(state, '', url);
};

describe('useUrlSyncedState', () => {
  const defaultValue = 'default';
  const paramName = 'param';
  const codec = createParamCodec(paramName, defaultValue);

  beforeEach(() => {
    // Reset the URL to a clean state before each test
    window.history.replaceState(null, '', '/');
  });

  it('should initialize state from the URL search params', () => {
    setUrl(`/?${paramName}=initial`);
    const { result } = renderHook(() => useUrlSyncedState(codec, defaultValue));
    expect(result.current[0]).toBe('initial');
  });

  it('should use the default value if the param is not in the URL', () => {
    const { result } = renderHook(() => useUrlSyncedState(codec, defaultValue));
    expect(result.current[0]).toBe(defaultValue);
  });

  it('should update the URL when the state is set (replace)', () => {
    const { result } = renderHook(() => useUrlSyncedState(codec, defaultValue, { history: 'replace' }));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(window.location.search).toBe(`?${paramName}=new-value`);
  });

  it('should update the URL when the state is set (push)', () => {
    const { result } = renderHook(() => useUrlSyncedState(codec, defaultValue, { history: 'push' }));

    act(() => {
      result.current[1]('pushed-value');
    });

    expect(result.current[0]).toBe('pushed-value');
    expect(window.location.search).toBe(`?${paramName}=pushed-value`);
  });

  it('should update state when the URL changes (popstate event)', async () => {
    const { result } = renderHook(() => useUrlSyncedState(codec, defaultValue));

    act(() => {
      setUrl(`/?${paramName}=updated`);
      const event = new PopStateEvent('popstate');
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(result.current[0]).toBe('updated');
    });
  });

  it('should remove the param from the URL if the new value is the default value', () => {
    setUrl(`/?${paramName}=some-value`);
    const { result } = renderHook(() => useUrlSyncedState(codec, defaultValue));

    act(() => {
      result.current[1](defaultValue);
    });

    expect(result.current[0]).toBe(defaultValue);
    expect(window.location.search).toBe('');
  });

  it('should work with hash params', () => {
    setUrl(`/#${paramName}=hashed`);
    const { result } = renderHook(() => useUrlSyncedState(codec, defaultValue, { useHash: true }));
    expect(result.current[0]).toBe('hashed');

    act(() => {
        result.current[1]('new-hash');
    });

    expect(result.current[0]).toBe('new-hash');
    expect(window.location.hash).toBe(`#${paramName}=new-hash`);
  });
});
