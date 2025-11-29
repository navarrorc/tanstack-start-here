import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db/index'
import { users, inviteCodes } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { validateSessionToken, generateInviteCode } from './auth'

// Get current user from session cookie
export const getCurrentUser = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    const cookies = request.headers.get('cookie')
    const sessionToken = cookies
      ?.split(';')
      .find((c) => c.trim().startsWith('session='))
      ?.split('=')[1]

    if (!sessionToken) {
      return null
    }

    const { user } = await validateSessionToken(sessionToken)
    return user
  })

// Get all invite codes (admin only)
export const getInvites = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    const user = await getCurrentUser({ request })
    
    if (!user?.isAdmin) {
      throw new Error('Unauthorized')
    }

    const invites = await db
      .select({
        id: inviteCodes.id,
        code: inviteCodes.code,
        email: inviteCodes.email,
        used: inviteCodes.used,
        createdAt: inviteCodes.createdAt,
        usedAt: inviteCodes.usedAt,
        usedByEmail: users.email,
      })
      .from(inviteCodes)
      .leftJoin(users, eq(inviteCodes.usedBy, users.id))
      .orderBy(desc(inviteCodes.createdAt))

    return { invites }
  })

// Generate new invite code (admin only)
export const generateInvite = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      email: z.string().email('Invalid email address'),
    })
  )
  .handler(async ({ data, request }) => {
    const user = await getCurrentUser({ request })
    
    if (!user?.isAdmin) {
      throw new Error('Unauthorized')
    }

    const code = await generateInviteCode(data.email, user.id)
    
    return { code, success: true }
  })

// Get all users (admin only)
export const getUsers = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    const user = await getCurrentUser({ request })
    
    if (!user?.isAdmin) {
      throw new Error('Unauthorized')
    }

    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))

    return { users: allUsers }
  })


