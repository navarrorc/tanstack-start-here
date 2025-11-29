import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// Helper to safely access process.env (only available on server)
const getServerEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key]
  }
  return undefined
}

export const env = createEnv({
  server: {
    SERVER_URL: z.string().url().optional(),
    DATABASE_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_REDIRECT_URI: z.string().url(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    // Server variables from process.env
    SERVER_URL: getServerEnv('SERVER_URL'),
    DATABASE_URL: getServerEnv('DATABASE_URL'),
    GOOGLE_CLIENT_ID: getServerEnv('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: getServerEnv('GOOGLE_CLIENT_SECRET'),
    GOOGLE_REDIRECT_URI: getServerEnv('GOOGLE_REDIRECT_URI'),
    // Client variables from import.meta.env
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
  
  /**
   * Skip validation on the client side
   */
  skipValidation: typeof window !== 'undefined',
})
