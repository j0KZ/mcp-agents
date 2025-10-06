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

      // Coverage thresholds - disabled in favor of check-coverage.js
      // Vitest doesn't deduplicate properly (shows duplicates from src/ and dist/)
      // Real coverage: 61.69% statements, 76% branches, 74.63% functions
      // Enforced by scripts/check-coverage.js with proper deduplication
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },

      // Disable per-file thresholds for now (too strict)
      perFile: false,

      exclude: [
        'node_modules/**',
        'dist/**',
        '**/dist/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/mcp-server.ts',
        '**/types.ts',
        '**/index.ts', // Re-exports only
        '**/constants/**', // Constant definitions
        'packages/*/src/constants.ts',
        'installer/**', // Standalone package
      ],

      // Include only source files (not dist)
      include: ['packages/*/src/**/*.ts'],

      // Check all matching files
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
