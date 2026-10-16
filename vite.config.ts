import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        indexExperimental: resolve(__dirname, 'indexExperimental.html'),
        monteCarloSimulation: resolve(__dirname, 'monteCarloSimulation.html'),
        summary: resolve(__dirname, 'summary.html'),
      },
    },
  },
})