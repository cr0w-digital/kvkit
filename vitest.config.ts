import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, './setup-tests.ts'),
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
      '@kvkit/types': path.resolve(__dirname, './packages/types/src'),
      '@kvkit/codecs': path.resolve(__dirname, './packages/codecs/src'),
      '@kvkit/query': path.resolve(__dirname, './packages/query/src'),
      '@kvkit/react': path.resolve(__dirname, './packages/react/src')
    }
  }
})
