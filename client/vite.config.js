import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base path for GitHub Pages deployment
// This ensures assets load correctly at: https://sanjay-murmu-au9.github.io/one-dot/
export default defineConfig({
  plugins: [react()],
  base: '/one-dot/',
})
