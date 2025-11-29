import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { marketplaceTypes } from './schema'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})
const db = drizzle(pool, { schema: { marketplaceTypes } })

const MARKETPLACE_TYPES = [
  'Amazon',
  'Bonanza',
  'Depop',
  'eBay',
  'Facebook Marketplace',
  'Mercari',
  'OfferUp',
  'Poshmark',
  'TikTok Shop',
  'Whatnot',
]

async function seed() {
  console.log('🌱 Seeding marketplace types...\n')

  try {
    // Check if already seeded
    const existing = await db.select().from(marketplaceTypes)
    
    if (existing.length > 0) {
      console.log(`✓ Already seeded with ${existing.length} marketplace types:`)
      existing.forEach(type => console.log(`  - ${type.name}`))
      return
    }

    // Insert marketplace types
    for (const name of MARKETPLACE_TYPES) {
      await db.insert(marketplaceTypes).values({ name })
      console.log(`  ✓ ${name}`)
    }

    console.log(`\n✅ Successfully seeded ${MARKETPLACE_TYPES.length} marketplace types!`)
  } catch (error) {
    console.error('❌ Error seeding:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seed }
