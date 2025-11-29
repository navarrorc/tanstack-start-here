# Requirements Document

## Introduction

This specification describes the refactoring of the dashboard route to use TanStack Start server functions instead of traditional API routes. The goal is to achieve end-to-end type safety, eliminate loading states, implement server-side rendering with pre-loaded data, and follow TanStack Start best practices as documented in Context7.

## Glossary

- **Server Function**: A function created with `createServerFn()` that executes only on the server and can access database resources
- **Loader**: An isomorphic function in route configuration that pre-loads data on the server during SSR and on the client during navigation
- **beforeLoad**: A route lifecycle hook that runs before the loader, used for authentication guards and redirects
- **Dashboard Route**: The `/dashboard` route component that displays user information and admin invite management
- **SSR**: Server-Side Rendering - rendering components on the server before sending HTML to the client
- **Isomorphic**: Code that runs on both server and client environments

## Requirements

### Requirement 1

**User Story:** As a developer, I want the dashboard route to use server functions for data fetching, so that I have end-to-end type safety and eliminate manual API typing.

#### Acceptance Criteria

1. WHEN the dashboard route loads THEN the system SHALL call server functions instead of fetch() API calls
2. WHEN a server function is invoked THEN the system SHALL provide automatic type inference from server to client
3. WHEN the dashboard component renders THEN the system SHALL have access to fully typed data without manual type assertions
4. WHEN an admin generates an invite THEN the system SHALL use a server function with Zod validation for the email input
5. WHEN data is fetched THEN the system SHALL eliminate all manual JSON parsing and response handling

### Requirement 2

**User Story:** As a user, I want the dashboard to load instantly without loading spinners, so that I have a better user experience.

#### Acceptance Criteria

1. WHEN a user navigates to the dashboard THEN the system SHALL pre-load user data on the server before rendering
2. WHEN an admin views the dashboard THEN the system SHALL pre-load invite codes on the server before rendering
3. WHEN the dashboard component renders THEN the system SHALL display data immediately without loading states
4. WHEN data is being fetched THEN the system SHALL not display loading spinners for initial page load
5. WHEN the page loads THEN the system SHALL render complete HTML with data on the server (SSR)

### Requirement 3

**User Story:** As a developer, I want authentication checks in the route configuration, so that unauthorized users are redirected before the component renders.

#### Acceptance Criteria

1. WHEN an unauthenticated user accesses the dashboard THEN the system SHALL redirect to login before rendering the component
2. WHEN authentication is checked THEN the system SHALL use the beforeLoad hook in route configuration
3. WHEN a redirect occurs THEN the system SHALL perform the redirect on the server during SSR
4. WHEN the dashboard component renders THEN the system SHALL guarantee that a valid user exists in context
5. WHEN authentication fails THEN the system SHALL not render any dashboard content

### Requirement 4

**User Story:** As a developer, I want to use dynamic imports for server functions in loaders, so that database code is not bundled into client JavaScript.

#### Acceptance Criteria

1. WHEN a loader imports server functions THEN the system SHALL use dynamic import() syntax
2. WHEN the client bundle is built THEN the system SHALL not include database connection code
3. WHEN the server bundle is built THEN the system SHALL include server function implementations
4. WHEN Vite builds the application THEN the system SHALL properly externalize PostgreSQL modules for browser compatibility
5. WHEN the build completes THEN the system SHALL produce separate client and server bundles without errors

### Requirement 5

**User Story:** As an admin, I want to generate invite codes with validated email addresses, so that invalid inputs are caught before reaching the database.

#### Acceptance Criteria

1. WHEN an admin submits an email THEN the system SHALL validate it using a Zod schema in the server function
2. WHEN validation fails THEN the system SHALL return a type-safe error to the client
3. WHEN validation succeeds THEN the system SHALL process the invite generation with the validated email
4. WHEN the server function executes THEN the system SHALL verify the user is an admin before generating invites
5. WHEN an invite is generated THEN the system SHALL return a type-safe success response with the invite code

### Requirement 6

**User Story:** As a developer, I want to eliminate useEffect hooks for data fetching, so that the code is cleaner and more maintainable.

#### Acceptance Criteria

1. WHEN the dashboard route is implemented THEN the system SHALL not use useEffect for authentication checks
2. WHEN the dashboard route is implemented THEN the system SHALL not use useEffect for data fetching
3. WHEN the dashboard route is implemented THEN the system SHALL not use useEffect for redirects
4. WHEN data needs to be loaded THEN the system SHALL use route loaders instead of useEffect
5. WHEN authentication needs to be checked THEN the system SHALL use beforeLoad instead of useEffect
