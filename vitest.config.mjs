import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./tests/globalSetup.mjs'],
    setupFiles: ['./tests/setup.js'],
    testTimeout: 30000,
  },
})
