# Implementation Plan

- [x] 1. Update authentication library with new helper functions
  - Add `createTempAuthCookie()` function to create temporary auth data cookies with proper security attributes
  - Add `validateTempAuthCookie()` function to parse and validate temporary auth cookies
  - Add `generateStateToken()` function for CSRF protection
  - _Requirements: 3.1, 3.3, 3.4_

- [ ]* 1.1 Write property test for temporary auth data security
  - **Property 8: Temporary auth data security**
  - **Validates: Requirements 3.3**

- [ ]* 1.2 Write property test for temporary auth data retrieval
  - **Property 9: Temporary auth data retrieval**
  - **Validates: Requirements 3.4**

- [ ]* 1.3 Write property test for CSRF state generation
  - **Property 6: CSRF state generation**
  - **Validates: Requirements 3.1**

- [x] 2. Modify OAuth login endpoint
  - Remove invite code handling from query parameters
  - Generate cryptographic state token for CSRF protection
  - Store state token in secure cookie
  - Update redirect to use state parameter for CSRF instead of invite code
  - _Requirements: 3.1_

- [ ]* 2.1 Write unit test for OAuth login endpoint
  - Test state and code verifier cookie generation
  - Test redirect URL format
  - _Requirements: 3.1_

- [x] 3. Update OAuth callback handler
  - Add CSRF state validation against stored cookie
  - Implement user existence check logic
  - Implement first user detection logic
  - For new non-first users: create temporary auth cookie and redirect to invite entry page
  - For existing users: create session and redirect to dashboard
  - For first user: create admin user, create session, redirect to dashboard
  - Clear temporary cookies on session creation
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 3.2, 3.5_

- [ ]* 3.1 Write property test for CSRF state validation
  - **Property 7: CSRF state validation**
  - **Validates: Requirements 3.2**

- [ ]* 3.2 Write property test for new non-first user redirect
  - **Property 1: New non-first user redirect**
  - **Validates: Requirements 1.3**

- [ ]* 3.3 Write property test for existing user session creation
  - **Property 2: Existing user session creation**
  - **Validates: Requirements 1.5**

- [ ]* 3.4 Write property test for temporary data cleanup
  - **Property 10: Temporary data cleanup**
  - **Validates: Requirements 3.5**

- [ ]* 3.5 Write unit test for first user edge case
  - Test first user becomes admin
  - Test session creation for first user
  - _Requirements: 1.4_

- [x] 4. Create invite entry page component
  - Create new route at `/invite-entry`
  - Read and validate temporary auth data from cookie
  - Display form with invite code input field
  - Handle form submission to validation endpoint
  - Display error messages for invalid codes
  - Redirect to login if temp auth data missing or expired
  - Show loading state during validation
  - _Requirements: 2.1, 2.4_

- [ ]* 4.1 Write unit test for invite entry page
  - Test rendering with valid temp auth data
  - Test redirect when temp auth data missing
  - Test error message display
  - _Requirements: 2.1_

- [x] 5. Create invite validation API endpoint
  - Create new endpoint at `/api/auth/validate-invite`
  - Accept POST requests with invite code in body
  - Read temporary auth data from cookie
  - Validate invite code against authenticated email
  - Create user account on success
  - Mark invite as used on success
  - Create session on success
  - Clear temporary auth cookie
  - Return appropriate error responses for failures
  - Implement database transaction for atomicity
  - _Requirements: 2.2, 2.3, 2.4, 3.4, 3.5, 4.5_

- [ ]* 5.1 Write property test for invite code email validation
  - **Property 3: Invite code email validation**
  - **Validates: Requirements 2.2**

- [ ]* 5.2 Write property test for valid invite code processing
  - **Property 4: Valid invite code processing**
  - **Validates: Requirements 2.3**

- [ ]* 5.3 Write property test for invalid invite code rejection
  - **Property 5: Invalid invite code rejection**
  - **Validates: Requirements 2.4, 4.3, 4.4**

- [ ]* 5.4 Write property test for atomic invite processing
  - **Property 11: Atomic invite processing**
  - **Validates: Requirements 4.5**

- [x] 6. Simplify login page
  - Remove invite code input field and state management
  - Remove invite code from login handler
  - Update login button to call `/api/auth/login` without parameters
  - Keep error message display for OAuth errors
  - _Requirements: 1.1_

- [ ]* 6.1 Write unit test for simplified login page
  - Test login button triggers OAuth flow
  - Test error message display
  - _Requirements: 1.1_

- [x] 7. Update error handling and messages
  - Add error messages for CSRF validation failures
  - Add error messages for expired temporary auth data
  - Update error message display on login page
  - Add error message display on invite entry page
  - Ensure all error paths redirect appropriately
  - _Requirements: 2.4, 3.2_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
