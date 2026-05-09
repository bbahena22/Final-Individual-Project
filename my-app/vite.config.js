import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for GitHub Pages deployment. Update the value if your repo name differs.
export default defineConfig({
  base: '/Final-Individual-Project/',
  plugins: [react()],
})
