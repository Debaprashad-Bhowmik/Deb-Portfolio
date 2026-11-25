import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    {
      name: 'portfolio-opening',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          const css = readFileSync(new URL('./src/opening/loading-screen.css', import.meta.url), 'utf8')
          const artwork = readFileSync(new URL('./src/opening/loading-screen.html', import.meta.url), 'utf8')
          return html
            .replace('<!-- Opening screen styles -->', () => `<style>\n${css.trim()}\n</style>`)
            .replace('<!-- Opening screen -->', () => artwork.trim())
        },
      },
    },
    react(),
  ],
  resolve: {
    dedupe: ['three'],
  },
})
