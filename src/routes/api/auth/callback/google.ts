import { createFileRoute } from '@tanstack/react-router'
import { google, generateSessionToken, createSession, createTempAuthCookie } from '../../../../lib/auth'
import { db } from '../../../../db/index'
import { users, sessions } from '../../../../db/schema'
import { eq, count } from 'drizzle-orm'

export const Route = createFileRoute('/api/auth/callback/google')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    
    if (!code) {
      const redirectUrl = new URL('/login', url.origin)
      redirectUrl.searchParams.set('error', 'auth_failed')
      return Response.redirect(redirectUrl.toString())
    }

    // Get cookies
    const cookies = request.headers.get('cookie')
    const codeVerifier = cookies
      ?.split(';')
      .find((c) => c.trim().startsWith('google_code_verifier='))
      ?.split('=')[1]
    
    const storedState = cookies
      ?.split(';')
      .find((c) => c.trim().startsWith('google_oauth_state='))
      ?.split('=')[1]

    if (!codeVerifier) {
      const redirectUrl = new URL('/login', url.origin)
      redirectUrl.searchParams.set('error', 'missing_verifier')
      return Response.redirect(redirectUrl.toString())
    }

    // CSRF state validation
    if (!state || !storedState || state !== storedState) {
      const redirectUrl = new URL('/login', url.origin)
      redirectUrl.searchParams.set('error', 'csrf_validation_failed')
      return Response.redirect(redirectUrl.toString())
    }

    try {
      const tokens = await google.validateAuthorizationCode(code, codeVerifier)
      const accessToken = tokens.accessToken()
      const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const googleUser: {
        sub: string
        email: string
        name: string
        picture?: string
      } = await response.json()

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.googleId, googleUser.sub))
        .limit(1)

      console.log('Google user:', googleUser.email)
      console.log('Existing user found:', existingUser.length > 0)

      const headers = new Headers()
      
      // Determine if we're using HTTPS (ngrok) or HTTP (localhost)
      const isSecure = process.env.GOOGLE_REDIRECT_URI?.startsWith('https')
      const secureCookie = isSecure ? '; Secure' : ''
      const sameSite = isSecure ? 'None' : 'Lax'

      console.log('Cookie settings:', { isSecure, sameSite })

      if (existingUser.length > 0) {
        console.log('Existing user - redirecting to dashboard')
        // Existing user - create session and redirect to dashboard
        const userId = existingUser[0].id
        const sessionToken = generateSessionToken()
        const session = createSession(sessionToken, userId)
        await db.insert(sessions).values(session)

        // Set session cookie
        headers.append(
          'Set-Cookie',
          `session=${sessionToken}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${60 * 60 * 24 * 30}${secureCookie}`
        )
        
        // Clear temporary cookies
        headers.append(
          'Set-Cookie',
          `google_code_verifier=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0${secureCookie}`
        )
        headers.append(
          'Set-Cookie',
          `google_oauth_state=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0${secureCookie}`
        )
        
        const dashboardUrl = new URL('/dashboard', url.origin)
        headers.append('Location', dashboardUrl.toString())

        return new Response(null, {
          status: 302,
          headers,
        })
      }

      // New user - check if first user
      const userCountResult = await db.select({ count: count() }).from(users)
      const isFirstUser = userCountResult[0].count === 0

      console.log('User count:', userCountResult[0].count)
      console.log('Is first user:', isFirstUser)

      if (isFirstUser) {
        console.log('First user - creating admin and redirecting to dashboard')
        // First user - create admin user, create session, redirect to dashboard
        const newUser = await db
          .insert(users)
          .values({
            email: googleUser.email,
            googleId: googleUser.sub,
            name: googleUser.name,
            isAdmin: true,
          })
          .returning()

        const userId = newUser[0].id
        const sessionToken = generateSessionToken()
        const session = createSession(sessionToken, userId)
        await db.insert(sessions).values(session)

        // Set session cookie
        headers.append(
          'Set-Cookie',
          `session=${sessionToken}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${60 * 60 * 24 * 30}${secureCookie}`
        )
        
        // Clear temporary cookies
        headers.append(
          'Set-Cookie',
          `google_code_verifier=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0${secureCookie}`
        )
        headers.append(
          'Set-Cookie',
          `google_oauth_state=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0${secureCookie}`
        )
        
        const dashboardUrl = new URL('/dashboard', url.origin)
        headers.append('Location', dashboardUrl.toString())

        return new Response(null, {
          status: 302,
          headers,
        })
      }

      // New non-first user - pass auth data via URL parameter
      const tempAuthData = createTempAuthCookie({
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        expiresAt: Date.now() + 1000 * 60 * 10, // 10 minutes
      })

      console.log('Creating temp auth token for:', googleUser.email)
      
      // Clear OAuth cookies
      headers.append(
        'Set-Cookie',
        `google_code_verifier=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0${secureCookie}`
      )
      headers.append(
        'Set-Cookie',
        `google_oauth_state=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0${secureCookie}`
      )
      
      // Pass temp auth data as URL parameter (more reliable than cookies with SameSite=None)
      const inviteEntryUrl = new URL('/invite-entry', url.origin)
      inviteEntryUrl.searchParams.set('token', tempAuthData)
      console.log('Redirecting to:', inviteEntryUrl.toString())
      headers.append('Location', inviteEntryUrl.toString())

      return new Response(null, {
        status: 302,
        headers,
      })
    } catch (error) {
      console.error('Auth error:', error)
      const redirectUrl = new URL('/login', url.origin)
      redirectUrl.searchParams.set('error', 'auth_failed')
      return Response.redirect(redirectUrl.toString())
    }
      },
    },
  },
})
