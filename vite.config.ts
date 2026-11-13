import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { contentWatcher } from './scripts/vite-content-watcher.ts'

export default defineConfig({
  plugins: [react(), contentWatcher()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
