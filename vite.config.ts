import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  server: {
    host: true, // Listen on all network interfaces
    port: 3000,
    allowedHosts: [
      'nummulitic-understatedly-fredric.ngrok-free.dev',
      '.ngrok-free.dev', // Allow all ngrok-free.dev subdomains
      '.ngrok.app', // Allow all ngrok.app subdomains (if you upgrade)
    ],
  },
  ssr: {
    noExternal: [],
    external: ['pg', 'drizzle-orm', '@neondatabase/serverless'],
  },
})

export default config