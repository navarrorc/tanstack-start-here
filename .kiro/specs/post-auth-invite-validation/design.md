# Design Document

## Overview

This design modifies the authentication flow to request invite codes after Google OAuth authentication rather than before. The change improves user experience by authenticating users first, then conditionally requesting an invite code only for new non-first users. This approach also strengthens security by validating invite codes against authenticated email addresses rather than user-provided input.

The key architectural change involves introducing an intermediate page between OAuth callback and dashboard that collects invite codes when needed, along with a temporary authentication state mechanism to bridge the OAuth callback and invite validation steps.

## Architecture

### Current Flow
1. User visits login page
2. User optionally enters invite code
3. User clicks "Continue with Google"
4. OAuth flow initiates with invite code in state parameter
5. OAuth callback validates invite code (if present) and creates user/session
6. User redirected to dashboard

### New Flow
1. User visits login page
2. User clicks "Continue with Google" (no invite code input)
3. OAuth flow initiates with CSRF state parameter
4. OAuth callback receives Google user data
5. **Decision point:**
   - If user exists → create session, redirect to dashboard
   - If first user → create admin user, create session, redirect to dashboard
   - If new non-first user → store temporary auth data, redirect to invite entry page
6. **New invite entry page** (only for new non-first users):
   - User enters invite code
   - System validates code against authenticated email
   - On success: create user, mark invite used, create session, redirect to dashboard
   - On failure: show error, allow retry

### Key Architectural Changes

1. **OAuth State Parameter**: Repurposed from invite code transmission to CSRF protection
2. **Temporary Authentication Storage**: New mechanism to store Google user data between callback and invite validation
3. **Invite Entry Page**: New route for post-authentication invite code collection
4. **Invite Validation Endpoint**: New API endpoint to process invite codes with authenticated context

## Components and Interfaces

### 1. Login Page (`src/routes/login.tsx`)

**Changes:**
- Remove invite code input field
- Remove invite code state management
- Simplify login handler to always call `/api/auth/login` without query parameters

**Interface:**
```typescript
// No props, simplified component
function LoginPage() {
  const handleLogin = () => {
    window.location.href = '/api/auth/login'
  }
  // ... render login button only
}
```

### 2. OAuth Login Endpoint (`src/routes/api/auth/login.ts`)

**Changes:**
- Generate cryptographic state parameter for CSRF protection
- Remove invite code handling from query parameters
- Store state in secure cookie for validation

**Interface:**
```typescript
GET /api/auth/login
Response: 302 redirect to Google OAuth
Cookies: 
  - google_code_verifier (PKCE)
  - google_oauth_state (CSRF protection)
```

### 3. OAuth Callback Handler (`src/routes/api/auth/callback/google.ts`)

**Changes:**
- Validate CSRF state parameter
- Check if user exists or is first user
- For new non-first users: store temporary auth data and redirect to invite entry
- For existing/first users: create session and redirect to dashboard

**Interface:**
```typescript
GET /api/auth/callback/google?code=...&state=...
Response: 302 redirect to dashboard OR invite entry page
Cookies:
  - session (if user created)
  - temp_auth_data (if invite needed)
```

**Temporary Auth Data Structure:**
```typescript
interface TempAuthData {
  googleId: string
  email: string
  name: string
  picture?: string
  expiresAt: number // timestamp
}
```

### 4. Invite Entry Page (`src/routes/invite-entry.tsx`) - NEW

**Purpose:** Collect invite code from authenticated new users

**Interface:**
```typescript
function InviteEntryPage() {
  // Read temp auth data from cookie
  // Display form for invite code entry
  // Submit to /api/auth/validate-invite
  // Handle success/error states
}
```

**State Management:**
- Invite code input value
- Loading state during validation
- Error message display
- Redirect on success

### 5. Invite Validation Endpoint (`src/routes/api/auth/validate-invite.ts`) - NEW

**Purpose:** Validate invite code and create user account

**Interface:**
```typescript
POST /api/auth/validate-invite
Body: { inviteCode: string }
Cookies: temp_auth_data
Response: 
  - Success: { success: true } + session cookie
  - Error: { success: false, error: string }
```

**Logic:**
1. Read and validate temp_auth_data cookie
2. Validate invite code against authenticated email
3. Create user account
4. Mark invite as used
5. Create session
6. Clear temp_auth_data cookie
7. Return success

### 6. Authentication Library (`src/lib/auth.ts`)

**New Functions:**

```typescript
// Create temporary auth data cookie
function createTempAuthCookie(data: TempAuthData): string

// Parse and validate temporary auth data cookie
function validateTempAuthCookie(cookie: string): TempAuthData | null

// Generate CSRF state token
function generateStateToken(): string
```

**Modified Functions:**
- `validateInviteCode`: No changes needed, already validates email match

## Data Models

### Existing Models (No Changes)

**Users Table:**
```typescript
{
  id: number
  email: string
  googleId: string
  name: string
  isAdmin: boolean
  createdAt: Date
}
```

**Invite Codes Table:**
```typescript
{
  id: number
  code: string
  email: string
  used: boolean
  usedBy: number | null
  createdBy: number
  createdAt: Date
  usedAt: Date | null
}
```

**Sessions Table:**
```typescript
{
  id: string (hashed token)
  userId: number
  expiresAt: Date
}
```

### New Data Structures

**Temporary Authentication Data (Cookie):**
```typescript
interface TempAuthData {
  googleId: string      // Google user ID
  email: string          // Verified email from Google
  name: string           // Display name
  picture?: string       // Profile picture URL
  expiresAt: number      // Unix timestamp (10 minutes from creation)
}
```

**Cookie Specifications:**
- Name: `temp_auth_data`
- Value: Base64-encoded JSON of TempAuthData
- HttpOnly: true
- SameSite: Lax
- Max-Age: 600 seconds (10 minutes)
- Path: /

**CSRF State Token (Cookie):**
- Name: `google_oauth_state`
- Value: Cryptographically random string (32 bytes, base32 encoded)
- HttpOnly: true
- SameSite: Lax
- Max-Age: 600 seconds (10 minutes)
- Path: /


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing the acceptance criteria, several properties were identified as redundant:
- Criterion 2.5 (redirect after valid invite) is subsumed by 2.3 (complete success flow)
- Criterion 4.1 (email comparison) is redundant with 2.2 (validation against email)
- Criteria 4.2, 4.3, 4.4 (specific error cases) are edge cases that will be handled by property test generators

The following properties provide comprehensive coverage without redundancy:

### Property 1: New non-first user redirect

*For any* database state containing at least one user, and any authenticated Google user not in the database, the OAuth callback should redirect to the invite entry page rather than creating a session.

**Validates: Requirements 1.3**

### Property 2: Existing user session creation

*For any* authenticated Google user that already exists in the database, the OAuth callback should create a valid session and redirect to the dashboard.

**Validates: Requirements 1.5**

### Property 3: Invite code email validation

*For any* invite code and authenticated email, the validation function should only return success when the invite code's associated email matches the authenticated email (case-insensitive).

**Validates: Requirements 2.2, 4.2**

### Property 4: Valid invite code processing

*For any* valid invite code with matching authenticated email, submitting the code should result in: (1) a new user account created, (2) the invite marked as used, (3) a valid session established, and (4) redirect to dashboard.

**Validates: Requirements 2.3**

### Property 5: Invalid invite code rejection

*For any* invite code that is invalid (non-existent, already used, or email mismatch), submitting the code should result in an error response without creating a user or session.

**Validates: Requirements 2.4, 4.3, 4.4**

### Property 6: CSRF state generation

*For any* OAuth flow initiation, the system should generate a cryptographically random state parameter and store it in a secure cookie.

**Validates: Requirements 3.1**

### Property 7: CSRF state validation

*For any* OAuth callback, the system should validate that the state parameter from Google matches the state stored in the cookie, rejecting mismatches.

**Validates: Requirements 3.2**

### Property 8: Temporary auth data security

*For any* temporary authentication data stored, the cookie should have HttpOnly, SameSite=Lax, and appropriate expiration settings.

**Validates: Requirements 3.3**

### Property 9: Temporary auth data retrieval

*For any* valid temporary auth data cookie, the invite validation endpoint should be able to retrieve and parse the authenticated user's email and Google ID.

**Validates: Requirements 3.4**

### Property 10: Temporary data cleanup

*For any* successful session creation (whether first user, existing user, or invite validation), all temporary authentication cookies should be cleared.

**Validates: Requirements 3.5**

### Property 11: Atomic invite processing

*For any* valid invite code submission, either both the user creation and invite marking operations succeed, or both fail, ensuring database consistency.

**Validates: Requirements 4.5**

## Error Handling

### OAuth Errors

**Missing Authorization Code:**
- Response: 400 Bad Request
- User Experience: Redirect to login with error message

**Invalid Code Verifier:**
- Response: 302 Redirect to login with error parameter
- User Experience: Error message displayed on login page

**Google API Failure:**
- Response: 302 Redirect to login with error parameter
- Logging: Full error details logged server-side
- User Experience: Generic "Authentication failed" message

**State Parameter Mismatch:**
- Response: 302 Redirect to login with error parameter
- User Experience: "Security validation failed" message
- Security: Log potential CSRF attempt

### Invite Validation Errors

**Missing Temporary Auth Data:**
- Response: 302 Redirect to login
- User Experience: Must restart authentication flow
- Reason: Cookie expired or tampered with

**Invalid Invite Code:**
- Response: 400 JSON error response
- User Experience: Error message displayed inline, allow retry
- Message: "Invalid invite code"

**Invite Code Already Used:**
- Response: 400 JSON error response
- User Experience: Error message displayed inline
- Message: "This invite code has already been used"

**Email Mismatch:**
- Response: 400 JSON error response
- User Experience: Error message displayed inline
- Message: "This invite code is not valid for your email address"

**Database Transaction Failure:**
- Response: 500 JSON error response
- Logging: Full error details logged
- User Experience: "An error occurred. Please try again."
- Cleanup: Rollback any partial changes

### Session Errors

**Expired Temporary Auth Data:**
- Response: 302 Redirect to login
- User Experience: "Your session expired. Please sign in again."
- Timeout: 10 minutes from OAuth callback

**Session Creation Failure:**
- Response: 500 Internal Server Error
- Logging: Full error details logged
- User Experience: Redirect to login with error message

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and integration points:

1. **OAuth Flow Initiation:**
   - Test that `/api/auth/login` generates state and code verifier cookies
   - Test that redirect URL contains correct parameters

2. **Temporary Auth Data:**
   - Test cookie creation with correct attributes
   - Test cookie parsing and validation
   - Test expiration handling

3. **Invite Entry Page:**
   - Test rendering with valid temp auth data
   - Test rendering without temp auth data (redirect)
   - Test form submission handling

4. **Error Message Display:**
   - Test each error type renders appropriate message
   - Test error parameter parsing from URL

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript/TypeScript property testing library). Each test will run a minimum of 100 iterations.

**Test Configuration:**
```typescript
import fc from 'fast-check'

// Configure to run 100+ iterations per property
fc.assert(
  fc.property(/* generators */, /* test function */),
  { numRuns: 100 }
)
```

**Property Test Implementations:**

1. **Property 1: New non-first user redirect**
   - Generator: Random database state with users, random new Google user
   - Test: Verify redirect to invite entry page
   - Tag: `**Feature: post-auth-invite-validation, Property 1: New non-first user redirect**`

2. **Property 2: Existing user session creation**
   - Generator: Random existing user, matching Google auth data
   - Test: Verify session created and dashboard redirect
   - Tag: `**Feature: post-auth-invite-validation, Property 2: Existing user session creation**`

3. **Property 3: Invite code email validation**
   - Generator: Random invite codes, random emails (matching and non-matching)
   - Test: Verify validation only succeeds on exact match
   - Tag: `**Feature: post-auth-invite-validation, Property 3: Invite code email validation**`

4. **Property 4: Valid invite code processing**
   - Generator: Random valid invite with matching email
   - Test: Verify user created, invite marked used, session created
   - Tag: `**Feature: post-auth-invite-validation, Property 4: Valid invite code processing**`

5. **Property 5: Invalid invite code rejection**
   - Generator: Random invalid invites (non-existent, used, mismatched)
   - Test: Verify rejection without side effects
   - Tag: `**Feature: post-auth-invite-validation, Property 5: Invalid invite code rejection**`

6. **Property 6: CSRF state generation**
   - Generator: Random OAuth initiation requests
   - Test: Verify state parameter generated and stored
   - Tag: `**Feature: post-auth-invite-validation, Property 6: CSRF state generation**`

7. **Property 7: CSRF state validation**
   - Generator: Random state values (matching and non-matching)
   - Test: Verify callback validates state correctly
   - Tag: `**Feature: post-auth-invite-validation, Property 7: CSRF state validation**`

8. **Property 8: Temporary auth data security**
   - Generator: Random temp auth data
   - Test: Verify cookie has HttpOnly, SameSite, expiration
   - Tag: `**Feature: post-auth-invite-validation, Property 8: Temporary auth data security**`

9. **Property 9: Temporary auth data retrieval**
   - Generator: Random valid temp auth cookies
   - Test: Verify correct parsing and retrieval
   - Tag: `**Feature: post-auth-invite-validation, Property 9: Temporary auth data retrieval**`

10. **Property 10: Temporary data cleanup**
    - Generator: Random successful session creation scenarios
    - Test: Verify temp cookies cleared
    - Tag: `**Feature: post-auth-invite-validation, Property 10: Temporary data cleanup**`

11. **Property 11: Atomic invite processing**
    - Generator: Random invite validation scenarios with simulated failures
    - Test: Verify all-or-nothing transaction behavior
    - Tag: `**Feature: post-auth-invite-validation, Property 11: Atomic invite processing**`

**Generator Strategies:**

- **User Generator:** Create random users with valid email formats and Google IDs
- **Invite Code Generator:** Create random invite codes with various states (unused, used, expired)
- **Email Generator:** Generate valid email addresses with various formats
- **State Token Generator:** Generate random cryptographic tokens
- **Cookie Generator:** Generate cookies with various attributes and expiration times

**Edge Cases Handled by Generators:**

- Empty databases (first user scenario)
- Expired temporary auth data
- Malformed cookies
- Case sensitivity in email matching
- Already-used invite codes
- Non-existent invite codes
- Email mismatches

### Integration Testing

Integration tests will verify end-to-end flows:

1. **Complete New User Flow:**
   - Start at login page
   - Complete OAuth flow
   - Enter invite code
   - Verify dashboard access

2. **Existing User Flow:**
   - Start at login page
   - Complete OAuth flow
   - Verify immediate dashboard access

3. **First User Flow:**
   - Start with empty database
   - Complete OAuth flow
   - Verify admin privileges and dashboard access

4. **Error Recovery:**
   - Test retry after invalid invite code
   - Test restart after expired temp auth data

### Test Organization

Tests will be organized as follows:

```
src/
├── routes/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.test.ts
│   │   │   ├── callback/
│   │   │   │   └── google.test.ts
│   │   │   └── validate-invite.test.ts
│   │   └── ...
│   ├── invite-entry.test.tsx
│   └── login.test.tsx
├── lib/
│   └── auth.test.ts
└── test/
    ├── generators/
    │   ├── user.generator.ts
    │   ├── invite.generator.ts
    │   └── auth.generator.ts
    └── properties/
        ├── oauth-flow.property.test.ts
        ├── invite-validation.property.test.ts
        └── session-management.property.test.ts
```

## Implementation Notes

### Security Considerations

1. **Temporary Auth Data Expiration:** 10-minute window balances security and user experience
2. **HttpOnly Cookies:** Prevent XSS attacks on sensitive tokens
3. **CSRF Protection:** State parameter prevents cross-site request forgery
4. **Email Validation:** Case-insensitive comparison prevents bypass attempts
5. **Atomic Operations:** Database transactions ensure consistency

### Performance Considerations

1. **Cookie Size:** Temporary auth data kept minimal (< 1KB)
2. **Database Queries:** Indexed lookups on email and Google ID
3. **Session Creation:** Single transaction for user + invite update

### Backward Compatibility

This change modifies the authentication flow but maintains:
- Existing database schema (no migrations needed)
- Existing session management
- Existing invite code generation and admin features
- Existing user model and permissions

### Migration Path

1. Deploy new code with feature flag (optional)
2. Existing sessions remain valid
3. New logins use new flow immediately
4. No data migration required
