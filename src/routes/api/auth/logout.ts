import { createFileRoute } from '@tanstack/react-router'
import { invalidateSession } from '../../../lib/auth'
import { encodeHexLowerCase } from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const cookies = request.headers.get('cookie')
        const sessionToken = cookies
          ?.split(';')
          .find((c) => c.trim().startsWith('session='))
          ?.split('=')[1]

        if (sessionToken) {
          const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)))
          await invalidateSession(sessionId)
        }

        const headers = new Headers()
        headers.append(
          'Set-Cookie',
          'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
        )
        headers.append('Location', '/')

        return new Response(null, {
          status: 302,
          headers,
        })
      },
    },
  },
})
