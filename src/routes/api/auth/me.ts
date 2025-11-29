import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { validateSessionToken } from '../../../lib/auth'

export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const cookies = request.headers.get('cookie')
        const sessionToken = cookies
          ?.split(';')
          .find((c) => c.trim().startsWith('session='))
          ?.split('=')[1]

        if (!sessionToken) {
          return json({ user: null }, { status: 401 })
        }

        const { user } = await validateSessionToken(sessionToken)

        if (!user) {
          return json({ user: null }, { status: 401 })
        }

        return json({ user })
      },
    },
  },
})
