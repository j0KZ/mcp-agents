import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Set reasonable timeouts
    testTimeout: 30000, // 30 seconds per test
    hookTimeout: 30000, // 30 seconds for hooks

    // Run tests in parallel for better performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },

    // Enable coverage collection
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/mcp-server.ts',
      ],
    },

    // Reporter configuration
    reporter: ['verbose'],

    // Global setup
    globals: true,
    environment: 'node',

    // File patterns - removed to let each package handle its own tests
    // This prevents workspace issues in monorepo setup
  },
});
