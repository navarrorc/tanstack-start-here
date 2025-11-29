import { createFileRoute } from '@tanstack/react-router'
import { 
  validateTempAuthCookie, 
  validateInviteCode, 
  generateSessionToken, 
  createSession 
} from '../../../lib/auth'
import { db } from '../../../db/index'
import { users, inviteCodes, sessions } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/auth/validate-invite')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          // Parse request body
          const body = await request.json()
          const { inviteCode, token } = body

          if (!inviteCode || typeof inviteCode !== 'string') {
            return new Response(
              JSON.stringify({ success: false, error: 'Invite code is required' }),
              { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          }

          if (!token || typeof token !== 'string') {
            return new Response(
              JSON.stringify({ success: false, error: 'Authentication token is required' }),
              { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          }

          // Validate temporary auth data from token
          const tempAuthData = validateTempAuthCookie(token)

          if (!tempAuthData) {
            return new Response(
              JSON.stringify({ success: false, error: 'Your session has expired. Please sign in again.' }),
              { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          }

          // Validate invite code against authenticated email
          const validation = await validateInviteCode(inviteCode.trim(), tempAuthData.email)

          if (!validation.valid) {
            return new Response(
              JSON.stringify({ success: false, error: validation.error }),
              { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          }

          // Use database transaction for atomicity
          const result = await db.transaction(async (tx) => {
            // Create user account
            const newUser = await tx
              .insert(users)
              .values({
                email: tempAuthData.email,
                googleId: tempAuthData.googleId,
                name: tempAuthData.name,
                isAdmin: false,
              })
              .returning()

            const userId = newUser[0].id

            // Mark invite as used
            await tx
              .update(inviteCodes)
              .set({
                used: true,
                usedBy: userId,
                usedAt: new Date(),
              })
              .where(eq(inviteCodes.code, inviteCode))

            // Create session
            const sessionToken = generateSessionToken()
            const session = createSession(sessionToken, userId)
            await tx.insert(sessions).values(session)

            return { sessionToken, userId }
          })

          // Prepare response headers
          const headers = new Headers()
          headers.set('Content-Type', 'application/json')

          // Determine if we're using HTTPS (ngrok) or HTTP (localhost)
          const isSecure = process.env.GOOGLE_REDIRECT_URI?.startsWith('https')
          const secureCookie = isSecure ? '; Secure' : ''
          const sameSite = isSecure ? 'None' : 'Lax'

          // Set session cookie
          headers.append(
            'Set-Cookie',
            `session=${result.sessionToken}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${60 * 60 * 24 * 30}${secureCookie}`
          )

          return new Response(
            JSON.stringify({ success: true }),
            { 
              status: 200,
              headers
            }
          )
        } catch (error) {
          console.error('Invite validation error:', error)
          return new Response(
            JSON.stringify({ success: false, error: 'An error occurred. Please try again.' }),
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      },
    },
  },
})
