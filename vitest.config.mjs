import { mkdirSync, mkdtempSync } from 'node:fs'
import { resolve } from 'node:path'
import { webdriverio } from '@vitest/browser-webdriverio'
import { defineConfig } from 'vitest/config'

const cacheRoot = resolve('.cache')
mkdirSync(cacheRoot, { recursive: true })
const profile = mkdtempSync(resolve(cacheRoot, 'edge-profile-'))

export default defineConfig({
  optimizeDeps: { force: true },
  test: {
    watch: false,
    fileParallelism: false,
    browser: {
      enabled: true,
      headless: true,
      provider: webdriverio({
        cacheDir: resolve(cacheRoot, 'driver'),
        capabilities: {
          'ms:edgeOptions': {
            ...(process.env.EDGE_BINARY ? { binary: process.env.EDGE_BINARY } : {}),
            args: ['--no-first-run', '--disable-background-networking', `--user-data-dir=${profile}`],
          },
        },
      }),
      instances: [{ browser: 'edge' }],
    },
  },
})
