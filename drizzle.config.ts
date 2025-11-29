import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Load .env.local file
config({ path: '.env.local' })

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Please add your NeonDB connection string to .env.local'
  )
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
})
