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
      reporter: ['text', 'json', 'html', 'lcov'],

      // CRITICAL: Coverage thresholds - builds fail if below these
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },

      // Per-file thresholds (ensures every file meets minimum)
      perFile: true,

      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/mcp-server.ts',
        '**/types.ts',
        '**/index.ts', // Re-exports only
        '**/constants.ts', // Constant definitions
      ],

      // Include all source files for accurate metrics
      include: ['packages/*/src/**/*.ts'],

      // Check all files, not just tested ones
      all: true,
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
