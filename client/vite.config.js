import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use relative base path for all builds (Web, GitHub Pages, Capacitor).
// Works perfectly with HashRouter.
function getBase() {
  return './'
}

export default defineConfig({
  plugins: [react()],
  base: './',
})
