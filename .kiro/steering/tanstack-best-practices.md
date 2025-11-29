---
inclusion: always
---

# TanStack Start Best Practices

## Routing Conventions

### File-Based Routes
- `src/routes/index.tsx` → `/`
- `src/routes/about.tsx` → `/about`
- `src/routes/users.$userId.tsx` → `/users/:userId` (dynamic parameter)

### Route Files Must Export
```typescript
export const Route = createFileRoute('/path')({
  // Route configuration
})
```

### Dynamic Parameters
- Use `$paramName` in filename for dynamic segments
- Access via `Route.useParams()` in component
- Pass via `params` prop in `<Link>` component

```typescript
// In component
const { userId } = Route.useParams()

// In Link
<Link to="/users/$userId" params={{ userId: '123' }} />
```

### Flat vs Nested Routes
- Flat: `users.$userId.profile.tsx` → `/users/:userId/profile`
- Nested: `users/$userId/profile/index.tsx` → `/users/:userId/profile`
- Prefix folders/files with `-` to exclude from routing (e.g., `-components/`)

## Layouts

### Root Layout (`__root.tsx`)
- Wraps all routes with `<Outlet />`
- Define global metadata, headers, footers
- Use `useRouterState()` to conditionally show/hide elements based on current path

### Nested Layouts (`_route.tsx`)
- Create shared layouts for route groups
- Place `_route.tsx` in folder to wrap all child routes
- Use pathless layouts (prefix with `_`) for flexible layout application

## Data Loading

### Loaders (Isomorphic - runs on server AND client)
```typescript
export const Route = createFileRoute('/path')({
  loader: async ({ params }) => {
    // Call server functions, NOT database directly
    const data = await myServerFn({ userId: params.userId })
    return data
  }
})

// In component
const data = Route.useLoaderData()
```

**CRITICAL**: Loaders are isomorphic - they run on both server and client during navigation. NEVER call database directly in loaders.

### Server Functions (Server-only)
```typescript
const myServerFn = createServerFn()
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    // Database calls, secrets, heavy processing HERE
    const result = await db.query.users.findFirst(...)
    return result
  })
```

Use server functions for:
- Database queries (Drizzle, Prisma)
- Accessing environment secrets
- Heavy server-side processing
- Any Node.js-specific operations

### Client-Side Data Fetching

**Use `useSuspenseQuery` when:**
- Data must be available before rendering
- Blocking SSR is acceptable
- Component should wait for data

**Use `useQuery` when:**
- Page should render immediately
- Data can load after initial render
- Show loading states while fetching

```typescript
// Blocks rendering until data loads
const { data } = useSuspenseQuery({
  queryKey: ['user', userId],
  queryFn: () => myServerFn({ userId })
})

// Renders immediately, shows loading state
const { data, isLoading } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => myServerFn({ userId })
})
```

## Authentication & Guards

### Route Protection
```typescript
export const Route = createFileRoute('/protected')({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  }
})
```

Use `beforeLoad` for:
- Authentication checks
- Authorization validation
- Redirects before page loads

## API Endpoints

### Location
Place API routes in `src/routes/api/`

### Structure
```typescript
// src/routes/api/users.ts
export const GET = async ({ request }) => {
  // Handle GET request
  return json({ data })
}

export const POST = async ({ request }) => {
  // Handle POST request
  return json({ data })
}
```

### When to Use
- External webhooks (Stripe, etc.)
- Third-party integrations
- Public APIs

**Prefer server functions over API endpoints for internal application logic** - they provide better type safety and simpler code.

## Router State

### Conditional UI
```typescript
const routerState = useRouterState()
const isLoginPage = routerState.location.pathname === '/login'

// Hide header/footer on specific routes
{!isLoginPage && <Header />}
```

Use for:
- Hiding navigation on auth pages
- Showing different layouts per route
- Route-specific UI behavior

## Code Organization

### Recommended Structure
```
src/
├── routes/           # File-based routes
│   ├── api/         # API endpoints
│   └── __root.tsx   # Root layout
├── components/       # Reusable components
├── lib/             # Utilities, server functions
└── db/              # Database schema, queries
```

### Component Placement
- Route-specific components: Keep in route file or `-components/` subfolder
- Reusable components: Place in `src/components/`
- Server functions: Place in `src/lib/` or near usage

## Key Principles

1. **Never call database directly in loaders** - always use server functions
2. **Server functions for backend logic** - database, secrets, Node.js APIs
3. **Loaders call server functions** - bridge between routes and backend
4. **Use TanStack Query** - for client-side data fetching with caching
5. **Prefer server functions over API endpoints** - for internal application needs
6. **Use `beforeLoad` for guards** - authentication, authorization, redirects
7. **Flat or nested routes** - choose based on project preference, both work
8. **Pathless layouts** - use `_` prefix for flexible layout application
