# Security & Best Practices Review

## Overview
This document reviews the authentication implementation against TanStack Start, Arctic OAuth, and Drizzle ORM best practices using Context7 documentation.

---

## ✅ What You're Doing Right

### 1. **OAuth Security (Arctic)**
- ✅ **PKCE Implementation**: Using `generateCodeVerifier()` and passing it to `createAuthorizationURL()`
- ✅ **State Parameter for CSRF**: Generating cryptographic state tokens with `generateStateToken()`
- ✅ **State Validation**: Properly comparing state from callback with stored state
- ✅ **Secure Cookie Storage**: Storing code verifier and state in HttpOnly cookies
- ✅ **Short-Lived Tokens**: 10-minute expiration on OAuth cookies (Max-Age=600)

### 2. **Session Management**
- ✅ **Token Hashing**: Using SHA-256 to hash session tokens before storage
- ✅ **Cryptographic Randomness**: Using `crypto.getRandomValues()` for token generation
- ✅ **HttpOnly Cookies**: All sensitive cookies use HttpOnly flag
- ✅ **SameSite Protection**: Using `SameSite=Lax` for CSRF protection
- ✅ **Session Refresh**: Automatic refresh when session is within 15 days of expiration
- ✅ **30-Day Sessions**: Reasonable session duration

### 3. **Database Transactions**
- ✅ **Atomic Operations**: Using `db.transaction()` for invite validation
- ✅ **All-or-Nothing**: User creation + invite marking + session creation in single transaction
- ✅ **Proper Error Handling**: Transaction automatically rolls back on error

### 4. **Input Validation**
- ✅ **Email Normalization**: Case-insensitive email comparison
- ✅ **Invite Code Validation**: Checking existence, usage status, and email match
- ✅ **Type Checking**: Validating input types before processing

---

## ⚠️ Security Improvements Needed

### 1. **Missing Secure Flag in Production**
**Issue**: Cookies don't have `Secure` flag set for production environments.

**Current Code**:
```typescript
`session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
```

**Recommended Fix**:
```typescript
// In src/lib/auth.ts, add helper function
export function getSecureCookieFlag(): string {
  return process.env.NODE_ENV === 'production' ? '; Secure' : ''
}

// Then use it in all cookie setting:
`session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax${getSecureCookieFlag()}; Max-Age=${60 * 60 * 24 * 30}`
```

**Files to Update**:
- `src/routes/api/auth/login.ts`
- `src/routes/api/auth/callback/google.ts`
- `src/routes/api/auth/validate-invite.ts`

**Why**: The `Secure` flag ensures cookies are only sent over HTTPS, preventing man-in-the-middle attacks in production.

---

### 2. **Temporary Auth Data Not Signed/Encrypted**
**Issue**: Temporary auth data is only base64-encoded, not cryptographically signed or encrypted.

**Current Code**:
```typescript
const encoded = Buffer.from(json).toString('base64')
```

**Risk**: An attacker could decode, modify, and re-encode the temp auth data to impersonate another user.

**Recommended Fix**: Use signed cookies or encrypt the data.

**Option A - Signed Cookies (Simpler)**:
```typescript
import { createHmac } from 'crypto'

const SECRET = process.env.SESSION_SECRET! // Use existing secret

export function createTempAuthCookie(data: TempAuthData): string {
  const tempData: TempAuthData = {
    googleId: data.googleId,
    email: data.email,
    name: data.name,
    picture: data.picture,
    expiresAt: Date.now() + 1000 * 60 * 10
  }
  
  const json = JSON.stringify(tempData)
  const encoded = Buffer.from(json).toString('base64')
  
  // Create HMAC signature
  const signature = createHmac('sha256', SECRET)
    .update(encoded)
    .digest('base64url')
  
  return `${encoded}.${signature}`
}

export function validateTempAuthCookie(cookieValue: string): TempAuthData | null {
  try {
    const [encoded, signature] = cookieValue.split('.')
    
    if (!encoded || !signature) {
      return null
    }
    
    // Verify signature
    const expectedSignature = createHmac('sha256', SECRET)
      .update(encoded)
      .digest('base64url')
    
    if (signature !== expectedSignature) {
      return null // Tampered data
    }
    
    // Decode and validate
    const json = Buffer.from(encoded, 'base64').toString('utf-8')
    const data = JSON.parse(json) as TempAuthData
    
    if (!data.googleId || !data.email || !data.name || !data.expiresAt) {
      return null
    }
    
    if (Date.now() >= data.expiresAt) {
      return null
    }
    
    return data
  } catch (error) {
    return null
  }
}
```

**Why**: Signing prevents tampering. Even if someone decodes the data, they can't modify it without knowing the secret.

---

### 3. **Session Secret Not Validated**
**Issue**: No validation that `SESSION_SECRET` exists or meets minimum length requirements.

**Recommended Fix** in `src/env.ts`:
```typescript
// Add validation for SESSION_SECRET
SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
```

**Why**: Weak secrets make HMAC signatures vulnerable to brute-force attacks.

---

### 4. **Rate Limiting Missing**
**Issue**: No rate limiting on authentication endpoints.

**Risk**: Brute-force attacks on invite codes, OAuth callback abuse.

**Recommended**: Add rate limiting middleware for:
- `/api/auth/login` - Limit OAuth initiation attempts
- `/api/auth/validate-invite` - Limit invite code attempts (e.g., 5 attempts per 15 minutes)

**Simple Implementation** (using in-memory store for MVP):
```typescript
// src/lib/rate-limit.ts
const attempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now()
  const record = attempts.get(key)
  
  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (record.count >= maxAttempts) {
    return false
  }
  
  record.count++
  return true
}
```

**Usage in validate-invite**:
```typescript
const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
const rateLimitKey = `invite:${tempAuthData.email}:${clientIp}`

if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
  return new Response(
    JSON.stringify({ success: false, error: 'Too many attempts. Please try again later.' }),
    { status: 429, headers: { 'Content-Type': 'application/json' } }
  )
}
```

---

### 5. **Error Messages Too Detailed**
**Issue**: Error messages reveal system internals.

**Current**:
```typescript
redirectUrl.searchParams.set('error', 'missing_verifier')
redirectUrl.searchParams.set('error', 'csrf_validation_failed')
```

**Risk**: Helps attackers understand the authentication flow.

**Recommended**: Use generic error messages for users, log details server-side.

```typescript
// Generic user-facing error
redirectUrl.searchParams.set('error', 'authentication_failed')

// Detailed server-side logging
console.error('[AUTH_ERROR]', { 
  type: 'csrf_validation_failed', 
  timestamp: new Date().toISOString(),
  ip: request.headers.get('x-forwarded-for')
})
```

---

### 6. **No Session Fixation Protection**
**Issue**: Session tokens aren't regenerated after privilege escalation.

**Scenario**: If a user logs in as regular user, then becomes admin, the same session token is used.

**Recommended**: Regenerate session token when user role changes.

```typescript
export async function regenerateSession(oldSessionId: string, userId: number) {
  // Delete old session
  await db.delete(sessions).where(eq(sessions.id, oldSessionId))
  
  // Create new session
  const newToken = generateSessionToken()
  const newSession = createSession(newToken, userId)
  await db.insert(sessions).values(newSession)
  
  return newToken
}
```

---

## 📋 Additional Best Practices

### 7. **Add Security Headers**
Add security headers to all responses:

```typescript
// src/lib/security-headers.ts
export function addSecurityHeaders(headers: Headers) {
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return headers
}
```

---

### 8. **Audit Logging**
Add audit logging for security-sensitive operations:

```typescript
// Log successful/failed authentication attempts
// Log invite code usage
// Log session creation/destruction
// Log admin actions

export async function logSecurityEvent(event: {
  type: 'auth_success' | 'auth_failure' | 'invite_used' | 'session_created'
  userId?: number
  email?: string
  ip?: string
  userAgent?: string
  metadata?: Record<string, any>
}) {
  // Store in database or send to logging service
  console.log('[SECURITY_AUDIT]', JSON.stringify(event))
}
```

---

### 9. **Database Connection Pooling**
Ensure proper connection pooling for Drizzle with Neon:

```typescript
// src/db/index.ts - verify you have proper pooling
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)
```

✅ This is correct for Neon's HTTP API (serverless-friendly).

---

## 🎯 Priority Action Items

### High Priority (Security Risks)
1. ✅ **Add `Secure` flag to production cookies**
2. ✅ **Sign/encrypt temporary auth data**
3. ✅ **Validate SESSION_SECRET length**

### Medium Priority (Defense in Depth)
4. ⚠️ **Add rate limiting on auth endpoints**
5. ⚠️ **Use generic error messages**
6. ⚠️ **Add security headers**

### Low Priority (Nice to Have)
7. 📝 **Add audit logging**
8. 📝 **Implement session regeneration on privilege change**

---

## 📚 References

- [TanStack Start Authentication Guide](https://tanstack.com/start/latest/docs/framework/react/guide/authentication)
- [Arctic OAuth Security](https://github.com/pilcrowonpaper/arctic)
- [Drizzle ORM Transactions](https://orm.drizzle.team/docs/transactions)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

---

## Summary

Your implementation follows most OAuth and session management best practices. The main security gaps are:

1. Missing `Secure` flag on production cookies
2. Unsigned temporary auth data (tampering risk)
3. No rate limiting (brute-force risk)

These are straightforward to fix and will significantly improve your security posture.
