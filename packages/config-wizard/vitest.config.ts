import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Inherit from root config
    testTimeout: 30000,
    hookTimeout: 30000,
    globals: true,
    environment: 'node',

    // Exclude wizard.test.ts in CI environment (inquirer regex issues)
    exclude: process.env.CI
      ? ['**/node_modules/**', '**/dist/**', '**/wizard.test.ts']
      : ['**/node_modules/**', '**/dist/**'],
  },
});
