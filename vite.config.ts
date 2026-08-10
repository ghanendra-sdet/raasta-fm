import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Only the production build is served from GitHub Pages'
  // /raasta-fm/ subpath — dev/test must stay at "/" so the local
  // dev server, Playwright, and other tooling keep working unchanged.
  base: command === 'build' ? '/raasta-fm/' : '/',
  plugins: [react(), tailwindcss()],
}))
