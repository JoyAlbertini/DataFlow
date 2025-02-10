import { defineConfig } from 'vite';
import fixReactVirtualized from 'esbuild-plugin-react-virtualized'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      plugins: [fixReactVirtualized],
    },
  },
})

