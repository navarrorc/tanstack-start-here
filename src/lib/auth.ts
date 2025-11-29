import { Google } from 'arctic'
import { env } from '../env'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
)

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

export function createSession(token: string, userId: number): { id: string; userId: number; expiresAt: Date } {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
  }
  return session
}

export async function validateSessionToken(token: string) {
  // Dynamic import to prevent client bundling
  const { db } = await import('../db/index')
  const { users, sessions } = await import('../db/schema')
  const { eq } = await import('drizzle-orm')
  
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const result = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1)

  if (result.length < 1) {
    return { session: null, user: null }
  }

  const { user, session } = result[0]

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, session.id))
    return { session: null, user: null }
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await db
      .update(sessions)
      .set({ expiresAt: session.expiresAt })
      .where(eq(sessions.id, session.id))
  }

  return { session, user }
}

export async function invalidateSession(sessionId: string) {
  // Dynamic import to prevent client bundling
  const { db } = await import('../db/index')
  const { sessions } = await import('../db/schema')
  const { eq } = await import('drizzle-orm')
  
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

export async function validateInviteCode(code: string, email: string) {
  // Dynamic import to prevent client bundling
  const { db } = await import('../db/index')
  const { inviteCodes } = await import('../db/schema')
  const { eq } = await import('drizzle-orm')
  
  const result = await db
    .select()
    .from(inviteCodes)
    .where(eq(inviteCodes.code, code))
    .limit(1)

  if (result.length < 1) {
    return { valid: false, error: 'Invalid invite code. Please check the code and try again.' }
  }

  const invite = result[0]

  if (invite.used) {
    return { valid: false, error: 'This invite code has already been used.' }
  }

  if (invite.email.toLowerCase() !== email.toLowerCase()) {
    return { valid: false, error: 'This invite code is not valid for your email address.' }
  }

  return { valid: true, invite }
}

export async function generateInviteCode(email: string, createdBy: number): Promise<string> {
  // Dynamic import to prevent client bundling
  const { db } = await import('../db/index')
  const { inviteCodes } = await import('../db/schema')
  
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const code = encodeBase32LowerCaseNoPadding(bytes)

  await db.insert(inviteCodes).values({
    code,
    email,
    createdBy,
  })

  return code
}

// Temporary authentication data structure
export interface TempAuthData {
  googleId: string
  email: string
  name: string
  picture?: string
  expiresAt: number
}

// Generate CSRF state token
export function generateStateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

// Create temporary auth data cookie value
export function createTempAuthCookie(data: TempAuthData): string {
  const tempData: TempAuthData = {
    googleId: data.googleId,
    email: data.email,
    name: data.name,
    picture: data.picture,
    expiresAt: Date.now() + 1000 * 60 * 10 // 10 minutes from now
  }
  
  // Encode as base64 JSON
  const json = JSON.stringify(tempData)
  const encoded = Buffer.from(json).toString('base64')
  return encoded
}

// Validate and parse temporary auth data cookie
export function validateTempAuthCookie(cookieValue: string): TempAuthData | null {
  try {
    // Decode from base64
    const json = Buffer.from(cookieValue, 'base64').toString('utf-8')
    const data = JSON.parse(json) as TempAuthData
    
    // Validate required fields
    if (!data.googleId || !data.email || !data.name || !data.expiresAt) {
      return null
    }
    
    // Check expiration
    if (Date.now() >= data.expiresAt) {
      return null
    }
    
    return data
  } catch (error) {
    // Invalid format or parsing error
    return null
  }
}
