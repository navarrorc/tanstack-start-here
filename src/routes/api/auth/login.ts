import { createFileRoute } from '@tanstack/react-router'
import { google, generateStateToken } from '../../../lib/auth'
import { generateCodeVerifier } from 'arctic'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      GET: async () => {
        // Generate cryptographic state token for CSRF protection
        const state = generateStateToken()
        const codeVerifier = generateCodeVerifier()
        const scopes = ['openid', 'profile', 'email']
        
        // Create authorization URL with PKCE and CSRF state
        const authUrl = google.createAuthorizationURL(state, codeVerifier, scopes)
        
        // Store both code verifier and state token in secure cookies
        const headers = new Headers()
        headers.append('Location', authUrl.toString())
        
        // Determine if we're using HTTPS (ngrok) or HTTP (localhost)
        const isSecure = process.env.GOOGLE_REDIRECT_URI?.startsWith('https')
        const secureCookie = isSecure ? '; Secure' : ''
        
        headers.append(
          'Set-Cookie',
          `google_code_verifier=${codeVerifier}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secureCookie}`
        )
        headers.append(
          'Set-Cookie',
          `google_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secureCookie}`
        )
        
        return new Response(null, {
          status: 302,
          headers,
        })
      },
    },
  },
})
