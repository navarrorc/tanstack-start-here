# Marketplace Types

## Overview

The application uses a lookup table (`marketplace_types`) to manage available marketplace options. Users select from a dropdown when adding a marketplace to their account.

## Current Marketplace Types

The following marketplace types are currently available:

1. eBay
2. Poshmark
3. Whatnot
4. TikTok Shop
5. Amazon
6. Mercari
7. Facebook Marketplace
8. Depop
9. Bonanza
10. OfferUp

## Database Schema

### `marketplace_types` Table
- `id` (serial, primary key)
- `name` (varchar 255, unique, not null)
- `created_at` (timestamp, default now)

### `marketplaces` Table
- `id` (serial, primary key)
- `user_id` (integer, foreign key to users)
- `marketplace_type_id` (integer, foreign key to marketplace_types)
- `created_at` (timestamp, default now)
- Unique constraint: `(user_id, marketplace_type_id)` - users cannot add the same marketplace type twice

## Adding New Marketplace Types

### Method 1: Using the Helper Script

1. Open `src/db/seed.ts`
2. Add new marketplace names to the `MARKETPLACE_TYPES` array
3. Run the script:
   ```bash
   pnpm db:seed
   ```

### Method 2: Direct Drizzle Insert

Use Drizzle in your code:
```typescript
import { db } from './db'
import { marketplaceTypes } from './db/schema'

await db.insert(marketplaceTypes).values({ name: 'New Marketplace' })
```

### Method 3: Using Drizzle Studio

1. Run `pnpm db:studio`
2. Navigate to the `marketplace_types` table
3. Add a new row with the marketplace name

## How It Works

1. **User Interface**: The `MarketplaceForm` component fetches all marketplace types and displays them in a dropdown
2. **Selection**: User selects a marketplace type from the dropdown
3. **Validation**: The form validates that a marketplace type is selected
4. **Creation**: A new marketplace record is created linking the user to the selected marketplace type
5. **Duplicate Prevention**: Users cannot add the same marketplace type twice (enforced by database constraint)

## API Endpoints

### Get Marketplace Types
```typescript
getMarketplaceTypes()
// Returns: { types: Array<{ id: number, name: string }> }
```

### Create Marketplace
```typescript
createMarketplace({ data: { marketplaceTypeId: number } })
// Creates a marketplace for the current user
```

### Get User's Marketplaces
```typescript
getMarketplaces()
// Returns: { marketplaces: Array<{ id, userId, marketplaceTypeId, name, createdAt }> }
```

## Migration History

- **Migration 0001**: Created `marketplace_types` table, converted `marketplaces` table from storing names to referencing marketplace types
- Initial seed data: 10 popular marketplace platforms
