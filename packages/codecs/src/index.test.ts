import { describe, it, expect } from 'vitest';
import { stringCodec, numberCodec, booleanCodec, jsonCodec, dateCodec, stringArrayCodec, flatCodec, prefixCodec } from './index';

describe('stringCodec', () => {
  const codec = stringCodec();

  it('should encode string to value object', () => {
    const result = codec.encode('hello');
    expect(result).toEqual({ value: 'hello' });
  });

  it('should decode value object to string', () => {
    const result = codec.decode({ value: 'hello' });
    expect(result).toBe('hello');
  });

  it('should return empty string for missing value', () => {
    const result = codec.decode({});
    expect(result).toBe('');
  });
});

describe('numberCodec', () => {
  const codec = numberCodec();

  it('should encode number to string value', () => {
    const result = codec.encode(42);
    expect(result).toEqual({ value: '42' });
  });

  it('should decode string value to number', () => {
    const result = codec.decode({ value: '42' });
    expect(result).toBe(42);
  });

  it('should return 0 for invalid number', () => {
    const result = codec.decode({ value: 'not-a-number' });
    expect(result).toBe(0);
  });

  it('should return 0 for missing value', () => {
    const result = codec.decode({});
    expect(result).toBe(0);
  });
});

describe('booleanCodec', () => {
  const codec = booleanCodec();

  it('should encode true to "true" string', () => {
    const result = codec.encode(true);
    expect(result).toEqual({ value: 'true' });
  });

  it('should encode false to "false" string', () => {
    const result = codec.encode(false);
    expect(result).toEqual({ value: 'false' });
  });

  it('should decode "true" to true', () => {
    const result = codec.decode({ value: 'true' });
    expect(result).toBe(true);
  });

  it('should decode anything else to false', () => {
    expect(codec.decode({ value: 'false' })).toBe(false);
    expect(codec.decode({ value: 'anything' })).toBe(false);
    expect(codec.decode({})).toBe(false);
  });
});

describe('jsonCodec', () => {
  it('should encode object to JSON string with default key', () => {
    const codec = jsonCodec<{ name: string; age: number }>();
    const obj = { name: 'Alice', age: 30 };
    const result = codec.encode(obj);
    expect(result).toEqual({ data: '{"name":"Alice","age":30}' });
  });

  it('should decode JSON string from default key', () => {
    const codec = jsonCodec<{ name: string; age: number }>();
    const result = codec.decode({ data: '{"name":"Alice","age":30}' });
    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('should handle missing data', () => {
    const codec = jsonCodec<{ name: string; age: number }>();
    const result = codec.decode({});
    expect(result).toEqual({});
  });

  it('should handle invalid JSON', () => {
    const codec = jsonCodec<{ name: string; age: number }>();
    const result = codec.decode({ data: 'invalid-json' });
    expect(result).toEqual({});
  });

  it('should use custom key when provided', () => {
    const codec = jsonCodec<{ value: string }>('custom');
    const encoded = codec.encode({ value: 'test' });
    expect(encoded).toEqual({ custom: '{"value":"test"}' });
    
    const decoded = codec.decode({ custom: '{"value":"test"}' });
    expect(decoded).toEqual({ value: 'test' });
  });
});

describe('dateCodec', () => {
  const codec = dateCodec();

  it('should encode Date to ISO string', () => {
    const date = new Date('2023-01-01T00:00:00.000Z');
    const result = codec.encode(date);
    expect(result).toEqual({ value: '2023-01-01T00:00:00.000Z' });
  });

  it('should decode ISO string to Date', () => {
    const result = codec.decode({ value: '2023-01-01T00:00:00.000Z' });
    expect(result).toEqual(new Date('2023-01-01T00:00:00.000Z'));
  });

  it('should return current date for missing value', () => {
    const before = Date.now();
    const result = codec.decode({});
    const after = Date.now();
    
    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });
});

describe('stringArrayCodec', () => {
  const codec = stringArrayCodec();

  it('should encode array to comma-separated string', () => {
    const result = codec.encode(['a', 'b', 'c']);
    expect(result).toEqual({ value: 'a,b,c' });
  });

  it('should decode comma-separated string to array', () => {
    const result = codec.decode({ value: 'a,b,c' });
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should handle empty array', () => {
    const encoded = codec.encode([]);
    expect(encoded).toEqual({ value: '' });
    
    const decoded = codec.decode(encoded);
    expect(decoded).toEqual([]);
  });

  it('should return empty array for missing value', () => {
    const result = codec.decode({});
    expect(result).toEqual([]);
  });
});

describe('flatCodec', () => {
  it('should encode object as individual key-value pairs', () => {
    const codec = flatCodec<{ name: string; age: number; active: boolean }>();
    const encoded = codec.encode({ name: 'John', age: 30, active: true });
    
    expect(encoded).toEqual({
      name: 'John',
      age: '30',
      active: 'true'
    });
  });

  it('should decode individual key-value pairs', () => {
    const codec = flatCodec<{ name: string; age: number; active: boolean }>();
    const decoded = codec.decode({
      name: 'John',
      age: '30',
      active: 'true'
    });
    
    expect(decoded).toEqual({ name: 'John', age: 30, active: true });
  });

  it('should handle string values directly', () => {
    const codec = flatCodec<{ name: string; title: string }>();
    const encoded = codec.encode({ name: 'John', title: 'Developer' });
    
    expect(encoded).toEqual({
      name: 'John',
      title: 'Developer'
    });
  });

  it('should handle empty object', () => {
    const codec = flatCodec<Record<string, any>>();
    const decoded = codec.decode({});
    
    expect(decoded).toEqual({});
  });
});

describe('prefixCodec', () => {
  it('should prefix all keys with namespace', () => {
    const codec = prefixCodec<{ name: string; age: number }>('user');
    const encoded = codec.encode({ name: 'John', age: 30 });
    
    expect(encoded).toEqual({
      'user.name': 'John',
      'user.age': '30'
    });
  });

  it('should decode only prefixed keys', () => {
    const codec = prefixCodec<{ name: string; age: number }>('user');
    const decoded = codec.decode({
      'user.name': 'John',
      'user.age': '30',
      'other.value': 'ignored'
    });
    
    expect(decoded).toEqual({ name: 'John', age: 30 });
  });

  it('should use custom separator', () => {
    const codec = prefixCodec<{ name: string }>('user', '_');
    const encoded = codec.encode({ name: 'John' });
    
    expect(encoded).toEqual({
      'user_name': 'John'
    });
  });

  it('should handle empty object', () => {
    const codec = prefixCodec<Record<string, any>>('test');
    const decoded = codec.decode({});
    
    expect(decoded).toEqual({});
  });
});
