# Marketplace Types Seeding

## Overview
The marketplace dropdown requires data in the `marketplace_types` table. This is handled by a proper Drizzle seed script.

## Seeding Script

**File:** `src/db/seed.ts`

This script:
1. Loads environment variables from `.env.local`
2. Connects to the database using Drizzle ORM
3. Checks if marketplace types already exist
4. If empty, inserts all 10 marketplace types
5. Provides clear console output showing progress
6. Properly closes the database connection

## Usage

To seed the marketplace types:

```bash
pnpm db:seed
```

The script is idempotent - it will skip seeding if types already exist.

## Marketplace Types Seeded

1. Amazon
2. Bonanza
3. Depop
4. eBay
5. Facebook Marketplace
6. Mercari
7. OfferUp
8. Poshmark
9. TikTok Shop
10. Whatnot

## Adding More Types

### Option 1: Update the seed script (Recommended)
Edit `src/db/seed.ts` and add new marketplace names to the `MARKETPLACE_TYPES` array:

```typescript
const MARKETPLACE_TYPES = [
  'Amazon',
  'Bonanza',
  // ... existing types
  'Etsy',        // Add new types here
  'Shopify',
]
```

Then run:
```bash
pnpm db:seed
```

### Option 2: Direct database insert
Use Drizzle in your code:
```typescript
import { db } from './db'
import { marketplaceTypes } from './db/schema'

await db.insert(marketplaceTypes).values({ name: 'New Marketplace' })
```

### Option 3: Use Drizzle Studio
```bash
pnpm db:studio
```
Navigate to `marketplace_types` table and add rows manually.

## Setup Instructions

After cloning the project or running migrations:

1. Ensure `.env.local` has your `DATABASE_URL`
2. Run migrations: `pnpm db:push`
3. Seed the data: `pnpm db:seed`

## Verification

To verify marketplace types are seeded:

1. Run `pnpm db:seed` - it will show existing types if already seeded
2. Or visit http://localhost:3000/dashboard (after logging in)
3. Look at the "Add New Marketplace" section
4. Click the dropdown - you should see all 10 marketplace options
