# Design Document

## Overview

This design refactors the dashboard route (`src/routes/dashboard.tsx`) to use TanStack Start server functions instead of traditional API routes. The refactoring follows the pattern established in the Context7 documentation and the video transcript best practices:

1. **Server functions** handle all database access and business logic
2. **Route loaders** call server functions to pre-load data (SSR)
3. **beforeLoad hooks** handle authentication guards
4. **Components** consume pre-loaded data without loading states

The existing server functions in `src/lib/server-functions.ts` already implement the required functionality:
- `getCurrentUser()` - Fetches current user from session
- `getInvites()` - Fetches invite codes (admin only)
- `generateInvite()` - Creates new invite code (admin only)

This design focuses on updating the dashboard route to properly consume these server functions.

## Architecture

### Current Architecture (API Routes)

```
Component → useQuery → fetch('/api/...') → API Route → Database
                ↓
         Loading State
                ↓
         Component Re-render
```

**Problems:**
- Manual type assertions
- Loading states in component
- Client-side authentication checks
- No SSR for data
- useEffect for redirects

### New Architecture (Server Functions)

```
Route Config:
  beforeLoad → getCurrentUser() → Redirect if no user
       ↓
  loader → getInvites() → Pre-load data
       ↓
  Component → Use pre-loaded data (no loading states)
```

**Benefits:**
- Automatic type inference
- No loading states
- Server-side authentication
- Full SSR with data
- No useEffect needed

### PostgreSQL Configuration Compatibility

The existing Vite configuration already supports server functions with PostgreSQL:

```typescript
// vite.config.ts
ssr: {
  external: ['pg', 'drizzle-orm', '@neondatabase/serverless'],
}
```

This configuration:
1. **Externalizes database modules** - Keeps `pg`, `drizzle-orm`, and Neon modules out of the client bundle
2. **Allows server-side imports** - Server functions can import `db` directly
3. **Prevents bundling errors** - Vite won't try to bundle Node.js-only modules for the browser

The warnings during build about "Module externalized for browser compatibility" are **expected and correct** - they confirm that database code is properly isolated to the server bundle.

**Verified Working Pattern:**
- Server functions in `src/lib/server-functions.ts` import database directly ✅
- Routes use dynamic imports: `await import('../lib/server-functions')` ✅
- Build produces separate client (562 kB) and server (114 kB) bundles ✅
- No PostgreSQL code in client bundle ✅

## Components and Interfaces

### Route Configuration

The dashboard route will be structured as follows:

```typescript
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    // Dynamic import to prevent client bundling
    const { getCurrentUser } = await import('../lib/server-functions')
    const user = await getCurrentUser()
    
    if (!user) {
      throw redirect({ to: '/login' })
    }
    
    return { user }
  },
  
  loader: async ({ context }) => {
    // Dynamic import to prevent client bundling
    const { getInvites } = await import('../lib/server-functions')
    
    if (context.user.isAdmin) {
      const invitesData = await getInvites()
      return { invites: invitesData.invites }
    }
    
    return { invites: [] }
  },
  
  component: DashboardPage,
})
```

**Why Dynamic Imports?**

Dynamic imports (`await import()`) are used in loaders for a critical reason:

1. **Loaders are isomorphic** - They run on both server (SSR) and client (navigation)
2. **Server functions contain database imports** - `src/lib/server-functions.ts` imports `db` from `src/db/index.ts`
3. **Database code must stay server-only** - PostgreSQL modules can't run in the browser

Without dynamic imports:
```typescript
// ❌ WRONG - Direct import in route file
import { getCurrentUser } from '../lib/server-functions'

// This causes Vite to try bundling server-functions.ts → db/index.ts → pg module
// Result: Build errors about PostgreSQL modules
```

With dynamic imports:
```typescript
// ✅ CORRECT - Dynamic import in loader
loader: async () => {
  const { getCurrentUser } = await import('../lib/server-functions')
  // Vite knows this only runs server-side, doesn't bundle for client
}
```

The existing `src/routes/index.tsx` already demonstrates this working pattern.

### Component Structure

The component will be simplified to consume pre-loaded data:

```typescript
function DashboardPage() {
  // Access pre-loaded data (no loading states!)
  const { user } = Route.useRouteContext()
  const { invites } = Route.useLoaderData()
  
  // Mutations still use server functions
  const generateMutation = useMutation({
    mutationFn: async (email: string) => {
      const { generateInvite } = await import('../lib/server-functions')
      return generateInvite({ data: { email } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] })
    },
  })
  
  // Component logic...
}
```

### Server Functions (Already Implemented)

The server functions in `src/lib/server-functions.ts` are already correctly implemented:

1. **getCurrentUser**: Returns user from session or null
2. **getInvites**: Returns invite codes (with admin check)
3. **generateInvite**: Creates invite with Zod validation

These functions already:
- Import database code directly
- Use Zod for validation
- Implement authorization checks
- Return type-safe data

## Data Models

### User Context (from beforeLoad)

```typescript
{
  user: {
    id: string
    email: string
    name: string | null
    picture: string | null
    isAdmin: boolean
  }
}
```

### Loader Data

```typescript
{
  invites: Array<{
    id: string
    code: string
    email: string
    used: boolean
    createdAt: Date
    usedAt: Date | null
    usedByEmail: string | null
  }>
}
```

### Mutation Input

```typescript
{
  data: {
    email: string  // Validated by Zod schema
  }
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Email validation rejects invalid inputs

*For any* string that is not a valid email format, when passed to the generateInvite server function, the system should reject the input and throw a validation error.

**Validates: Requirements 1.4, 5.1**

### Property 2: User data is pre-loaded in loader

*For any* authenticated user, when the dashboard loader executes, the system should return user data that is immediately accessible in the component without additional fetching.

**Validates: Requirements 2.1**

### Property 3: Admin invite data is pre-loaded in loader

*For any* authenticated admin user, when the dashboard loader executes, the system should return invite codes data that is immediately accessible in the component without additional fetching.

**Validates: Requirements 2.2**

### Property 4: Unauthenticated users are redirected

*For any* request to the dashboard route where getCurrentUser returns null, the beforeLoad hook should throw a redirect to the login page before the component renders.

**Validates: Requirements 3.1**

### Property 5: Invalid email inputs return errors

*For any* invalid email input (empty string, malformed email, non-string), when passed to generateInvite, the system should return a type-safe error response.

**Validates: Requirements 5.2**

### Property 6: Valid email inputs generate invites

*For any* valid email string, when passed to generateInvite by an admin user, the system should successfully generate an invite code and return it in the response.

**Validates: Requirements 5.3**

### Property 7: Non-admin users cannot generate invites

*For any* non-admin user, when attempting to call generateInvite, the system should throw an authorization error before generating any invite code.

**Validates: Requirements 5.4**

## Error Handling

### Authentication Errors

- **No session token**: `getCurrentUser()` returns `null`, beforeLoad redirects to `/login`
- **Invalid session token**: `validateSessionToken()` throws error, caught and treated as no session
- **Expired session**: Treated same as invalid session, redirect to login

### Authorization Errors

- **Non-admin accessing admin functions**: Server functions throw `Error('Unauthorized')`
- **Missing user context**: Server functions check for user before proceeding

### Validation Errors

- **Invalid email format**: Zod validation throws error with message "Invalid email address"
- **Missing required fields**: Zod validation throws error describing missing field
- **Type mismatches**: Zod validation throws error describing type mismatch

### Database Errors

- **Connection failures**: Propagate to client as generic error
- **Query failures**: Propagate to client as generic error
- **Constraint violations**: Propagate to client with appropriate message

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **Route Configuration Tests**
   - Test that beforeLoad redirects when user is null
   - Test that beforeLoad returns user when authenticated
   - Test that loader returns empty invites for non-admin users
   - Test that loader returns invites for admin users

2. **Component Tests**
   - Test that component renders with user data
   - Test that admin UI shows for admin users
   - Test that non-admin UI shows for regular users
   - Test that logout button triggers logout flow
   - Test that copy button copies invite URL

3. **Integration Tests**
   - Test full flow: unauthenticated → redirect to login
   - Test full flow: authenticated non-admin → dashboard without admin UI
   - Test full flow: authenticated admin → dashboard with invite management
   - Test full flow: generate invite → refresh → see new invite in list

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript property testing library):

1. **Property 1: Email validation rejects invalid inputs**
   - Generate random invalid email strings
   - Verify all are rejected by generateInvite
   - Run 100+ iterations

2. **Property 2: User data is pre-loaded in loader**
   - Generate random user objects
   - Mock getCurrentUser to return them
   - Verify loader returns user data
   - Run 100+ iterations

3. **Property 3: Admin invite data is pre-loaded in loader**
   - Generate random admin users and invite lists
   - Mock getInvites to return them
   - Verify loader returns invite data for admins
   - Run 100+ iterations

4. **Property 4: Unauthenticated users are redirected**
   - Test with getCurrentUser returning null
   - Verify redirect is thrown
   - Run 100+ iterations

5. **Property 5: Invalid email inputs return errors**
   - Generate random invalid inputs (empty, malformed, wrong type)
   - Verify all throw validation errors
   - Run 100+ iterations

6. **Property 6: Valid email inputs generate invites**
   - Generate random valid email addresses
   - Mock admin user context
   - Verify all successfully generate invites
   - Run 100+ iterations

7. **Property 7: Non-admin users cannot generate invites**
   - Generate random non-admin users
   - Attempt to generate invites
   - Verify all throw authorization errors
   - Run 100+ iterations

Each property-based test will be tagged with:
```typescript
// Feature: dashboard-server-functions, Property X: [property description]
```

### Testing Configuration

- **Framework**: Vitest for unit and property tests
- **Property Testing Library**: fast-check
- **Minimum Iterations**: 100 per property test
- **Mocking**: Mock server functions for route tests, test real implementations separately
- **Coverage Target**: 80%+ for route configuration and component logic

