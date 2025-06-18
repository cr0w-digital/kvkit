import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/dist/',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@kvkit/types': './packages/types/src',
      '@kvkit/codecs': './packages/codecs/src',
      '@kvkit/query': './packages/query/src',
      '@kvkit/react': './packages/react/src'
    }
  }
})
