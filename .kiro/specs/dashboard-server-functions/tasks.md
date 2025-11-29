# Implementation Plan

- [x] 1. Update dashboard route configuration
  - Add beforeLoad hook with authentication guard using getCurrentUser
  - Add loader to pre-load invite data for admin users
  - Use dynamic imports for server functions to prevent client bundling
  - _Requirements: 1.1, 2.1, 2.2, 3.1_

- [ ]* 1.1 Write property test for authentication redirect
  - **Property 4: Unauthenticated users are redirected**
  - **Validates: Requirements 3.1**

- [x] 2. Refactor DashboardPage component
  - Replace useQuery for user data with Route.useRouteContext()
  - Replace useQuery for invites data with Route.useLoaderData()
  - Remove userLoading and invitesLoading state checks
  - Remove conditional rendering based on loading states
  - _Requirements: 2.3, 2.4, 6.1, 6.2_

- [ ]* 2.1 Write property test for user data pre-loading
  - **Property 2: User data is pre-loaded in loader**
  - **Validates: Requirements 2.1**

- [ ]* 2.2 Write property test for admin invite data pre-loading
  - **Property 3: Admin invite data is pre-loaded in loader**
  - **Validates: Requirements 2.2**

- [x] 3. Update invite generation mutation
  - Replace fetch() call with dynamic import of generateInvite server function
  - Update mutation function to use server function with type-safe data parameter
  - Verify Zod validation errors are properly handled
  - _Requirements: 1.4, 5.1, 5.2, 5.3_

- [ ]* 3.1 Write property test for email validation
  - **Property 1: Email validation rejects invalid inputs**
  - **Validates: Requirements 1.4, 5.1**

- [ ]* 3.2 Write property test for invalid input error handling
  - **Property 5: Invalid email inputs return errors**
  - **Validates: Requirements 5.2**

- [ ]* 3.3 Write property test for valid email invite generation
  - **Property 6: Valid email inputs generate invites**
  - **Validates: Requirements 5.3**

- [ ]* 3.4 Write property test for non-admin authorization
  - **Property 7: Non-admin users cannot generate invites**
  - **Validates: Requirements 5.4**

- [x] 4. Verify build output
  - Run production build and verify no errors
  - Confirm client bundle does not include database code
  - Confirm server bundle includes server functions
  - Check that PostgreSQL externalization warnings appear (expected behavior)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Test the refactored dashboard
  - Test unauthenticated access redirects to login
  - Test authenticated non-admin user sees dashboard without admin UI
  - Test authenticated admin user sees dashboard with invite management
  - Test invite generation with valid email
  - Test invite generation with invalid email shows error
  - Test that no loading spinners appear on initial page load
  - _Requirements: All_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
