import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '../db/index'
import { users, inviteCodes, marketplaces, marketplaceTypes, salesEntries } from '../db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'
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

// Seed marketplace types (admin utility)
export const seedMarketplaceTypes = createServerFn({ method: 'POST' })
  .handler(async () => {
    const MARKETPLACE_TYPES = [
      'eBay',
      'Poshmark',
      'Whatnot',
      'TikTok Shop',
      'Amazon',
      'Mercari',
      'Facebook Marketplace',
      'Depop',
      'Bonanza',
      'OfferUp',
    ]

    // Check existing types
    const existing = await db.select().from(marketplaceTypes)
    
    if (existing.length > 0) {
      return {
        success: true,
        message: `Already have ${existing.length} marketplace types`,
        types: existing,
      }
    }

    // Insert marketplace types
    const results = []
    for (const name of MARKETPLACE_TYPES) {
      try {
        const [inserted] = await db.insert(marketplaceTypes).values({ name }).returning()
        results.push(inserted)
      } catch (error) {
        console.error(`Error inserting ${name}:`, error)
      }
    }

    return {
      success: true,
      message: `Inserted ${results.length} marketplace types`,
      types: results,
    }
  })

// Get all marketplace types (for dropdown)
export const getMarketplaceTypes = createServerFn({ method: 'GET' })
  .handler(async () => {
    const types = await db
      .select({
        id: marketplaceTypes.id,
        name: marketplaceTypes.name,
      })
      .from(marketplaceTypes)
      .orderBy(sql`LOWER(${marketplaceTypes.name})`)

    return { types }
  })

// Get all marketplaces for current user
export const getMarketplaces = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    const user = await getCurrentUser({ request })
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    const userMarketplaces = await db
      .select({
        id: marketplaces.id,
        userId: marketplaces.userId,
        marketplaceTypeId: marketplaces.marketplaceTypeId,
        name: marketplaceTypes.name,
        createdAt: marketplaces.createdAt,
      })
      .from(marketplaces)
      .innerJoin(marketplaceTypes, eq(marketplaces.marketplaceTypeId, marketplaceTypes.id))
      .where(eq(marketplaces.userId, user.id))
      .orderBy(desc(marketplaces.createdAt))

    return { marketplaces: userMarketplaces }
  })

// Create new marketplace
export const createMarketplace = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      marketplaceTypeId: z.number().int().positive('Please select a marketplace'),
    })
  )
  .handler(async ({ data, request }) => {
    const user = await getCurrentUser({ request })
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Verify marketplace type exists
    const [type] = await db
      .select()
      .from(marketplaceTypes)
      .where(eq(marketplaceTypes.id, data.marketplaceTypeId))
      .limit(1)

    if (!type) {
      throw new Error('Invalid marketplace type')
    }

    // Check for duplicate marketplace type for this user
    const existing = await db
      .select()
      .from(marketplaces)
      .where(and(
        eq(marketplaces.userId, user.id),
        eq(marketplaces.marketplaceTypeId, data.marketplaceTypeId)
      ))
      .limit(1)

    if (existing.length > 0) {
      throw new Error('You have already added this marketplace')
    }

    // Insert marketplace record
    const [marketplace] = await db
      .insert(marketplaces)
      .values({
        userId: user.id,
        marketplaceTypeId: data.marketplaceTypeId,
      })
      .returning()

    return { marketplace }
  })

// Delete marketplace (and cascade delete sales entries)
export const deleteMarketplace = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      marketplaceId: z.number().int().positive(),
    })
  )
  .handler(async ({ data, request }) => {
    const user = await getCurrentUser({ request })
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Verify marketplace belongs to user
    const [marketplace] = await db
      .select()
      .from(marketplaces)
      .where(and(
        eq(marketplaces.id, data.marketplaceId),
        eq(marketplaces.userId, user.id)
      ))
      .limit(1)

    if (!marketplace) {
      throw new Error("You don't have permission to access this resource")
    }

    // Delete marketplace (cascade deletes sales entries)
    await db
      .delete(marketplaces)
      .where(eq(marketplaces.id, data.marketplaceId))

    return { success: true }
  })

// Get all sales entries for current user
export const getSalesEntries = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      marketplaceId: z.number().int().positive().optional(),
    }).optional()
  )
  .handler(async ({ data, request }) => {
    const user = await getCurrentUser({ request })
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Build query conditions
    const conditions = [eq(salesEntries.userId, user.id)]
    
    if (data?.marketplaceId) {
      conditions.push(eq(salesEntries.marketplaceId, data.marketplaceId))
    }

    // Query sales entries with marketplace join
    const entries = await db
      .select({
        id: salesEntries.id,
        userId: salesEntries.userId,
        marketplaceId: salesEntries.marketplaceId,
        date: salesEntries.date,
        amount: salesEntries.amount,
        createdAt: salesEntries.createdAt,
        updatedAt: salesEntries.updatedAt,
        marketplaceName: marketplaceTypes.name,
      })
      .from(salesEntries)
      .innerJoin(marketplaces, eq(salesEntries.marketplaceId, marketplaces.id))
      .innerJoin(marketplaceTypes, eq(marketplaces.marketplaceTypeId, marketplaceTypes.id))
      .where(and(...conditions))
      .orderBy(desc(salesEntries.date))

    return { entries }
  })

// Create or update sales entry (upsert)
export const upsertSalesEntry = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      marketplaceId: z.number().int().positive(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
      amount: z.number().nonnegative('Sales amount must be non-negative').multipleOf(0.01, 'Amount must have at most 2 decimal places'),
    })
  )
  .handler(async ({ data, request }) => {
    const user = await getCurrentUser({ request })
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Validate date is not in future
    const entryDate = new Date(data.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (entryDate > today) {
      throw new Error('Sales date cannot be in the future')
    }

    // Verify marketplace belongs to authenticated user
    const [marketplace] = await db
      .select()
      .from(marketplaces)
      .where(and(
        eq(marketplaces.id, data.marketplaceId),
        eq(marketplaces.userId, user.id)
      ))
      .limit(1)

    if (!marketplace) {
      throw new Error("The selected marketplace no longer exists")
    }

    // Upsert sales entry (insert or update if userId + marketplaceId + date exists)
    const [entry] = await db
      .insert(salesEntries)
      .values({
        userId: user.id,
        marketplaceId: data.marketplaceId,
        date: data.date,
        amount: data.amount.toFixed(2),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [salesEntries.userId, salesEntries.marketplaceId, salesEntries.date],
        set: {
          amount: data.amount.toFixed(2),
          updatedAt: new Date(),
        },
      })
      .returning()

    return { entry }
  })

// Delete sales entry
export const deleteSalesEntry = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      salesEntryId: z.number().int().positive(),
    })
  )
  .handler(async ({ data, request }) => {
    const user = await getCurrentUser({ request })
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Verify sales entry belongs to authenticated user
    const [entry] = await db
      .select()
      .from(salesEntries)
      .where(and(
        eq(salesEntries.id, data.salesEntryId),
        eq(salesEntries.userId, user.id)
      ))
      .limit(1)

    if (!entry) {
      throw new Error("You don't have permission to access this resource")
    }

    // Delete sales entry record
    await db
      .delete(salesEntries)
      .where(eq(salesEntries.id, data.salesEntryId))

    return { success: true }
  })

// Get aggregate sales statistics
export const getSalesStatistics = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    const user = await getCurrentUser({ request })
    
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Get all sales entries for the user
    const entries = await db
      .select({
        date: salesEntries.date,
        amount: salesEntries.amount,
      })
      .from(salesEntries)
      .where(eq(salesEntries.userId, user.id))

    // Handle empty data case
    if (entries.length === 0) {
      return {
        totalSales: 0,
        monthSales: 0,
        weekSales: 0,
      }
    }

    // Get current date information
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-indexed
    
    // Calculate start of current week (Monday)
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1 // If Sunday, go back 6 days
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - daysFromMonday)
    weekStart.setHours(0, 0, 0, 0)
    
    // Calculate statistics
    let totalSales = 0
    let monthSales = 0
    let weekSales = 0

    for (const entry of entries) {
      const amount = parseFloat(entry.amount)
      const entryDate = new Date(entry.date)
      
      // Total sales: sum all amounts
      totalSales += amount
      
      // Month sales: sum amounts where date is in current month
      if (entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth) {
        monthSales += amount
      }
      
      // Week sales: sum amounts where date is in current week (Monday-Sunday)
      if (entryDate >= weekStart) {
        weekSales += amount
      }
    }

    return {
      totalSales: Math.round(totalSales * 100) / 100, // Round to 2 decimal places
      monthSales: Math.round(monthSales * 100) / 100,
      weekSales: Math.round(weekSales * 100) / 100,
    }
  })
