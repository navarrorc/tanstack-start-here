# Marketplace Dropdown Implementation

## Summary

Converted the marketplace input from a free-text field to a dropdown selection with a lookup table. This ensures data consistency and makes it easy to add new marketplace options over time.

## Changes Made

### 1. Database Schema Changes

**New Table: `marketplace_types`**
```sql
CREATE TABLE marketplace_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
)
```

**Modified Table: `marketplaces`**
- Removed: `name` column (varchar)
- Added: `marketplace_type_id` column (foreign key to marketplace_types)
- Updated unique constraint: `(user_id, marketplace_type_id)` instead of `(user_id, name)`

**Initial Data**
Seeded with 10 marketplace types:
- eBay
- Poshmark
- Whatnot
- TikTok Shop
- Amazon
- Mercari
- Facebook Marketplace
- Depop
- Bonanza
- OfferUp

### 2. Server Functions Updates

**New Function: `getMarketplaceTypes()`**
- Fetches all available marketplace types for the dropdown
- No authentication required (public data)
- Returns types sorted alphabetically

**Updated Function: `createMarketplace()`**
- Changed input from `{ name: string }` to `{ marketplaceTypeId: number }`
- Validates marketplace type exists
- Checks for duplicate marketplace type per user
- Error message changed to "You have already added this marketplace"

**Updated Function: `getMarketplaces()`**
- Now joins with `marketplace_types` table to get the name
- Returns `marketplaceTypeId` in addition to other fields

**Updated Function: `getSalesEntries()`**
- Updated join to include `marketplace_types` table
- Still returns `marketplaceName` for display purposes

### 3. Component Changes

**MarketplaceForm.tsx**
- Changed from text input to dropdown select
- Added `useQuery` to fetch marketplace types
- Updated validation schema to use `marketplaceTypeId` (number) instead of `name` (string)
- Dropdown shows "Select a marketplace..." placeholder
- Disabled state includes loading state for marketplace types
- Error message: "Please select a marketplace"

### 4. New Files

**`src/data/add-marketplace-type.ts`**
- Helper script for adding new marketplace types
- Handles duplicates gracefully
- Easy to use: just add names to array and run

**`docs/MARKETPLACE_TYPES.md`**
- Documentation for marketplace types system
- Instructions for adding new types
- Schema reference

### 5. Migration

**File: `drizzle/0001_wild_carnage.sql`**
- Creates `marketplace_types` table
- Seeds initial 10 marketplace types
- Modifies `marketplaces` table structure
- Drops old unique constraint and name column
- Adds new foreign key and unique constraint

## Benefits

1. **Data Consistency**: All users select from the same list of marketplaces
2. **Easy Maintenance**: Add new marketplace types without code changes
3. **Better UX**: Dropdown is faster than typing and prevents typos
4. **Duplicate Prevention**: Database constraint prevents users from adding the same marketplace twice
5. **Scalability**: Easy to add new marketplace types as the platform grows

## Testing

All existing tests pass (34/34):
- Dashboard integration tests
- Sales entry server function tests
- Dashboard server function tests

## Future Enhancements

Potential improvements:
1. Add marketplace logos/icons
2. Add marketplace categories (e.g., "Fashion", "General", "Electronics")
3. Add marketplace metadata (URL, commission rates, etc.)
4. Admin interface for managing marketplace types
5. Marketplace popularity tracking
6. Suggested marketplaces based on user activity
