# Tech Stack

## Framework & Runtime

- **TanStack Start**: Full-stack React framework with SSR support
- **React 19**: UI library
- **Vite**: Build tool and dev server
- **TypeScript**: Strict mode enabled with comprehensive linting

## Database & ORM

- **NeonDB**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe database queries and schema management
- **Drizzle Kit**: Database migrations and schema management

## Authentication & Security

- **Arctic**: OAuth library for Google authentication
- **Oslo**: Cryptographic utilities (@oslojs/crypto, @oslojs/encoding)
- **Custom Session Management**: SHA-256 hashed tokens with HttpOnly cookies

## UI & Styling

- **TailwindCSS v4**: Utility-first CSS framework
- **Shadcn**: Component library (via class-variance-authority, clsx, tailwind-merge)
- **Lucide React**: Icon library

## State Management & Data Fetching

- **TanStack Query**: Server state management and caching
- **TanStack Router**: File-based routing with type-safe navigation

## Environment & Validation

- **T3 Env**: Type-safe environment variable validation
- **Zod**: Schema validation

## Common Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000
pnpm build            # Build for production
pnpm serve            # Preview production build
pnpm test             # Run tests with Vitest

# Database
pnpm db:push          # Push schema changes to database
pnpm db:generate      # Generate migration files
pnpm db:migrate       # Run migrations
pnpm db:pull          # Pull schema from database
pnpm db:studio        # Open Drizzle Studio GUI
```

## Build Configuration

- **Module System**: ESNext with bundler resolution
- **Path Aliases**: `@/*` maps to `src/*`
- **Vite Plugins**: TanStack Router, React, TailwindCSS, TsConfig Paths, Neon, Devtools
- **Target**: ES2022 with DOM libraries

## Environment Variables

Required variables in `.env.local`:
- `DATABASE_URL`: NeonDB connection string (server-side)
- `VITE_DATABASE_URL`: NeonDB connection string (client-side)
- `VITE_DATABASE_URL_POOLER`: NeonDB pooler connection string
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_REDIRECT_URI`: OAuth callback URL (e.g., `http://localhost:3000/api/auth/callback/google`)

Access environment variables via `src/env.ts` for type safety.
