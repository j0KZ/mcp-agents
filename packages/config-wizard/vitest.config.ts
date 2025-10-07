import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Inherit from root config
    testTimeout: 30000,
    hookTimeout: 30000,
    globals: true,
    environment: 'node',

    // Exclude wizard tests in CI environment (inquirer regex issues)
    // Both wizard.test.ts and wizard-integration.test.ts import wizard.ts
    // which imports inquirer, causing "Invalid regular expression flags" in CI
    exclude: process.env.CI
      ? [
          '**/node_modules/**',
          '**/dist/**',
          '**/wizard.test.ts',
          '**/wizard-integration.test.ts',
        ]
      : ['**/node_modules/**', '**/dist/**'],
  },
});
