# Project Structure

## Directory Organization

```
src/
├── components/          # Reusable React components (add your components here)
├── db/                 # Database configuration and schema
├── integrations/       # Third-party integrations (TanStack Query)
├── lib/                # Utility functions and shared logic
│   ├── auth.ts        # Authentication utilities
│   ├── server-functions.ts  # Server-side functions
│   └── utils.ts       # General utilities
├── routes/             # File-based routing (TanStack Router)
│   ├── api/           # API endpoints
│   │   ├── auth/      # Authentication endpoints
│   │   └── invites/   # Invite management endpoints
│   ├── __root.tsx     # Root layout component
│   ├── index.tsx      # Landing page
│   ├── login.tsx      # Login page
│   └── dashboard.tsx  # Dashboard (customize this!)
└── styles.css          # Global styles
```

## Key Files

- `src/env.ts`: Type-safe environment variable validation using T3 Env
- `src/db/schema.ts`: Drizzle ORM database schema (users, inviteCodes, sessions)
- `src/db/index.ts`: Database connection setup
- `src/lib/auth.ts`: Authentication utilities (session management, OAuth, invite validation)
- `src/router.tsx`: Router configuration
- `src/routeTree.gen.ts`: Auto-generated route tree (do not edit manually)

## Routing Conventions

### File-Based Routing

TanStack Router uses file-based routing where files in `src/routes/` automatically become routes:

- `index.tsx` → `/`
- `login.tsx` → `/login`
- `dashboard.tsx` → `/dashboard`
- `__root.tsx` → Root layout (wraps all routes)

### API Routes

API endpoints are defined in `src/routes/api/`:

- `api/auth/login.ts` → `GET /api/auth/login`
- `api/auth/callback/google.ts` → `GET /api/auth/callback/google`
- `api/auth/logout.ts` → `POST /api/auth/logout`
- `api/auth/me.ts` → `GET /api/auth/me`
- `api/invites/generate.ts` → `POST /api/invites/generate`
- `api/invites/list.ts` → `GET /api/invites/list`

API routes export functions that handle HTTP requests and return JSON responses.

## Database Schema

### Tables

- **users**: User accounts with Google OAuth data and admin flag
- **inviteCodes**: Email-specific invite codes with usage tracking
- **sessions**: Session tokens (hashed) with expiration

### Relationships

- `inviteCodes.createdBy` → `users.id`
- `inviteCodes.usedBy` → `users.id`
- `sessions.userId` → `users.id`

## Import Patterns

Use path aliases for cleaner imports:

```typescript
import { db } from '@/db'
import { users } from '@/db/schema'
import { validateSessionToken } from '@/lib/auth'
import { env } from '@/env'
```

## Component Organization

- Place reusable UI components in `src/components/`
- Keep route-specific components in the route file itself
- Use TailwindCSS for styling with utility classes
- Leverage Shadcn patterns for consistent component structure

## Demo Files

Files prefixed with `demo` or in the `demo/` folder are examples and can be safely deleted. They demonstrate TanStack features but are not part of the core application.

## Configuration Files

- `vite.config.ts`: Vite build configuration with plugins
- `tsconfig.json`: TypeScript compiler options
- `drizzle.config.ts`: Drizzle ORM configuration
- `components.json`: Shadcn component configuration
- `.env.local`: Environment variables (not committed to git)
- `.env.example`: Template for required environment variables
