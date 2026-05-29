import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Electron mode uses relative paths so file:// protocol works
  // Web (GitHub Pages) mode uses the /sariq-bola-finance/ base path
  base: mode === 'electron' ? './' : '/sariq-bola-finance/',
  build: {
    outDir: mode === 'electron' ? 'dist-electron' : 'dist',
  },
}))
