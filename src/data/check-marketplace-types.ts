/**
 * Check and populate marketplace types in the database
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from '../db/index'
import { marketplaceTypes } from '../db/schema'

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

async function checkAndPopulate() {
  console.log('Checking marketplace types...\n')
  
  // Check existing types
  const existing = await db.select().from(marketplaceTypes)
  console.log(`Found ${existing.length} existing marketplace types:`)
  existing.forEach(type => console.log(`  - ${type.name}`))
  
  if (existing.length === 0) {
    console.log('\nNo marketplace types found. Populating...\n')
    
    for (const name of MARKETPLACE_TYPES) {
      try {
        await db.insert(marketplaceTypes).values({ name })
        console.log(`✓ Added: ${name}`)
      } catch (error) {
        console.error(`✗ Error adding ${name}:`, error)
      }
    }
    
    console.log('\nDone! Checking again...\n')
    const updated = await db.select().from(marketplaceTypes)
    console.log(`Now have ${updated.length} marketplace types:`)
    updated.forEach(type => console.log(`  - ${type.name}`))
  }
  
  process.exit(0)
}

checkAndPopulate().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
