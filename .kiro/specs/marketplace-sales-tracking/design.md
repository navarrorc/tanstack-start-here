# Design Document

## Overview

The marketplace sales tracking feature extends the existing application to allow users to register multiple marketplaces (e.g., Amazon, eBay, Etsy) and record daily sales totals for each marketplace. The system provides a centralized dashboard for viewing sales data, aggregate statistics, and managing marketplace records. This feature integrates seamlessly with the existing authentication system, ensuring each user can only access their own marketplace and sales data.

## Architecture

The feature follows the existing TanStack Start architecture with:

- **Database Layer**: Drizzle ORM with PostgreSQL (NeonDB) for data persistence
- **Server Functions**: Type-safe server-side functions for data operations
- **Client Components**: React components with TanStack Query for data fetching
- **File-based Routing**: TanStack Router for navigation and route protection

### Key Architectural Decisions

1. **User Isolation**: All marketplace and sales data is scoped to the authenticated user via foreign key relationships
2. **Server Functions**: All database operations are performed through server functions to maintain security and type safety
3. **Optimistic Updates**: Use TanStack Query mutations with automatic refetching for responsive UI
4. **Date Handling**: Store dates as PostgreSQL DATE type for accurate daily aggregation without timezone issues
5. **Cascade Deletion**: When a marketplace is deleted, all associated sales entries are automatically removed

## Components and Interfaces

### Database Schema

#### Marketplaces Table

```typescript
export const marketplaces = pgTable('marketplaces', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Unique constraint: user cannot have duplicate marketplace names
// Index on userId for efficient queries
```

#### Sales Entries Table

```typescript
export const salesEntries = pgTable('sales_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  marketplaceId: integer('marketplace_id').references(() => marketplaces.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(), // PostgreSQL DATE type
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(), // Supports up to 99,999,999.99
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Unique constraint: (userId, marketplaceId, date) - one entry per marketplace per day
// Index on userId for efficient queries
// Index on date for date-range queries
```

### Server Functions

All server functions follow the existing pattern using `createServerFn` with input validation via Zod schemas.

#### Marketplace Operations

```typescript
// Get all marketplaces for current user
export const getMarketplaces = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    // Validate session, get userId
    // Query marketplaces where userId matches
    // Return array of marketplaces ordered by createdAt desc
  })

// Create new marketplace
export const createMarketplace = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    name: z.string().min(1).max(255).trim()
  }))
  .handler(async ({ data, request }) => {
    // Validate session, get userId
    // Check for duplicate marketplace name for this user
    // Insert marketplace record
    // Return created marketplace
  })

// Delete marketplace (and cascade delete sales entries)
export const deleteMarketplace = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    marketplaceId: z.number().int().positive()
  }))
  .handler(async ({ data, request }) => {
    // Validate session, get userId
    // Verify marketplace belongs to user
    // Delete marketplace (cascade deletes sales entries)
    // Return success
  })
```

#### Sales Entry Operations

```typescript
// Get all sales entries for current user
export const getSalesEntries = createServerFn({ method: 'GET' })
  .inputValidator(z.object({
    marketplaceId: z.number().int().positive().optional()
  }))
  .handler(async ({ data, request }) => {
    // Validate session, get userId
    // Query sales entries with marketplace join
    // Filter by marketplaceId if provided
    // Return array ordered by date desc
  })

// Create or update sales entry (upsert)
export const upsertSalesEntry = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    marketplaceId: z.number().int().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    amount: z.number().nonnegative().multipleOf(0.01) // Two decimal places
  }))
  .handler(async ({ data, request }) => {
    // Validate session, get userId
    // Validate date is not in future
    // Verify marketplace belongs to user
    // Upsert sales entry (insert or update if exists)
    // Return created/updated entry
  })

// Delete sales entry
export const deleteSalesEntry = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    salesEntryId: z.number().int().positive()
  }))
  .handler(async ({ data, request }) => {
    // Validate session, get userId
    // Verify sales entry belongs to user
    // Delete sales entry
    // Return success
  })

// Get aggregate statistics
export const getSalesStatistics = createServerFn({ method: 'GET' })
  .handler(async ({ request }) => {
    // Validate session, get userId
    // Calculate total sales (all time)
    // Calculate current month sales
    // Calculate current week sales (Monday-Sunday)
    // Return statistics object
  })
```

### UI Components

#### Dashboard Route Enhancement

The existing `/dashboard` route will be enhanced to include marketplace and sales tracking sections. The layout will use tabs or sections to organize:

1. **Admin Section** (existing): Invite codes and user management
2. **Marketplaces Section** (new): List and manage marketplaces
3. **Sales Section** (new): Add/edit sales entries and view history
4. **Statistics Section** (new): Aggregate sales metrics

#### Marketplace Management Component

```typescript
interface MarketplaceListProps {
  marketplaces: Marketplace[]
  onDelete: (id: number) => void
}

// Displays list of marketplaces with delete action
// Shows empty state when no marketplaces exist
// Includes form to add new marketplace
```

#### Sales Entry Form Component

```typescript
interface SalesEntryFormProps {
  marketplaces: Marketplace[]
  existingEntry?: SalesEntry
  onSubmit: (data: SalesEntryInput) => void
  onCancel?: () => void
}

// Form with marketplace dropdown, date picker, amount input
// Validates amount is non-negative
// Validates date is not in future
// Pre-populates fields when editing existing entry
```

#### Sales History Component

```typescript
interface SalesHistoryProps {
  entries: SalesEntryWithMarketplace[]
  onEdit: (entry: SalesEntry) => void
  onDelete: (id: number) => void
  onFilterMarketplace: (marketplaceId: number | null) => void
}

// Table displaying sales entries with date, marketplace, amount
// Sortable by date (default: desc)
// Filterable by marketplace
// Edit and delete actions per row
// Shows empty state when no entries exist
```

#### Statistics Dashboard Component

```typescript
interface StatisticsProps {
  stats: {
    totalSales: number
    monthSales: number
    weekSales: number
  }
}

// Card-based layout showing key metrics
// Currency formatting with $ symbol and 2 decimals
// Visual indicators (icons, colors) for each metric
```

## Data Models

### TypeScript Interfaces

```typescript
interface Marketplace {
  id: number
  userId: number
  name: string
  createdAt: Date
}

interface SalesEntry {
  id: number
  userId: number
  marketplaceId: number
  date: string // YYYY-MM-DD format
  amount: string // Decimal string from database
  createdAt: Date
  updatedAt: Date
}

interface SalesEntryWithMarketplace extends SalesEntry {
  marketplaceName: string
}

interface SalesStatistics {
  totalSales: number
  monthSales: number
  weekSales: number
}

interface MarketplaceInput {
  name: string
}

interface SalesEntryInput {
  marketplaceId: number
  date: string
  amount: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Marketplace creation persists with correct associations
*For any* valid marketplace name and authenticated user, creating a marketplace should result in a queryable marketplace record associated with that user's ID.
**Validates: Requirements 1.1, 1.4, 1.5**

### Property 2: Duplicate marketplace names are rejected
*For any* marketplace name and user, if a marketplace with that name already exists for that user, attempting to create another marketplace with the same name should be rejected.
**Validates: Requirements 1.3**

### Property 3: Users only see their own marketplaces
*For any* set of marketplaces created by different users, when a user queries their marketplaces, the results should only contain marketplaces where the userId matches the authenticated user's ID.
**Validates: Requirements 2.1**

### Property 4: Marketplaces are returned with required fields
*For any* created marketplace, querying marketplaces should return records containing both the marketplace name and creation date fields.
**Validates: Requirements 2.3**

### Property 5: Marketplaces are ordered by creation date descending
*For any* set of marketplaces with different creation timestamps, querying marketplaces should return them ordered with the most recent first.
**Validates: Requirements 2.4**

### Property 6: Marketplace deletion cascades to sales entries
*For any* marketplace with associated sales entries, deleting the marketplace should result in both the marketplace and all its sales entries being removed from the database.
**Validates: Requirements 3.2, 3.3**

### Property 7: Sales entry creation persists with valid data
*For any* valid marketplace ID, date, and non-negative amount, creating a sales entry should result in a queryable sales entry record with those values.
**Validates: Requirements 4.1**

### Property 8: Future dates are rejected for sales entries
*For any* date that is after the current date, attempting to create a sales entry with that date should be rejected.
**Validates: Requirements 4.4**

### Property 9: Multiple sales entries allowed for different dates
*For any* marketplace, creating sales entries with different dates should result in all entries being persisted and queryable.
**Validates: Requirements 4.5**

### Property 10: Upsert behavior for duplicate marketplace-date combinations
*For any* marketplace and date combination, if a sales entry already exists, creating another entry with the same marketplace and date but different amount should update the existing entry rather than create a duplicate, resulting in exactly one entry with the new amount.
**Validates: Requirements 4.6**

### Property 11: Sales entries ordered by date descending
*For any* set of sales entries with different dates, querying sales entries should return them ordered with the most recent date first.
**Validates: Requirements 5.1**

### Property 12: Sales entries include marketplace information
*For any* sales entry, querying sales entries should return records containing the date, marketplace name, and sales amount fields.
**Validates: Requirements 5.2**

### Property 13: Amount formatting preserves two decimal places
*For any* sales amount, formatting the amount as currency should result in a string with exactly two decimal places.
**Validates: Requirements 5.4**

### Property 14: Marketplace filtering returns only matching entries
*For any* marketplace ID and set of sales entries across multiple marketplaces, filtering by that marketplace ID should return only sales entries where the marketplaceId matches the filter.
**Validates: Requirements 5.5**

### Property 15: Update validation matches creation validation
*For any* invalid sales entry data that would be rejected during creation (negative amount, future date, missing marketplace), the same data should be rejected during update operations.
**Validates: Requirements 6.2**

### Property 16: Sales entry updates persist to database
*For any* existing sales entry, updating its amount should result in querying that entry returning the new amount value.
**Validates: Requirements 6.3**

### Property 17: Sales entry deletion removes from database
*For any* sales entry, deleting it should result in that entry no longer being queryable.
**Validates: Requirements 7.2, 7.3**

### Property 18: Total sales aggregates all user entries
*For any* set of sales entries for a user, the total sales statistic should equal the sum of all sales entry amounts for that user.
**Validates: Requirements 8.1**

### Property 19: Monthly sales aggregates current month only
*For any* set of sales entries spanning multiple months, the monthly sales statistic should equal the sum of only those entries with dates in the current calendar month.
**Validates: Requirements 8.2**

### Property 20: Weekly sales aggregates current week only
*For any* set of sales entries spanning multiple weeks, the weekly sales statistic should equal the sum of only those entries with dates in the current calendar week (Monday through Sunday).
**Validates: Requirements 8.3**

### Property 21: Statistics isolated by user
*For any* set of sales entries created by different users, each user's statistics should only include the sum of their own sales entries, not entries from other users.
**Validates: Requirements 8.4**

## Error Handling

### Validation Errors

All server functions will use Zod schemas for input validation. Invalid inputs will throw errors with descriptive messages:

- **Empty marketplace name**: "Marketplace name is required"
- **Duplicate marketplace**: "A marketplace with this name already exists"
- **Negative sales amount**: "Sales amount must be non-negative"
- **Future date**: "Sales date cannot be in the future"
- **Missing marketplace**: "Marketplace selection is required"
- **Invalid date format**: "Date must be in YYYY-MM-DD format"

### Authorization Errors

All server functions will validate the session token and ensure users can only access their own data:

- **No session**: Return null or redirect to login
- **Invalid session**: Return null or redirect to login
- **Unauthorized access**: "You don't have permission to access this resource"

### Database Errors

Database operations will be wrapped in try-catch blocks:

- **Connection errors**: "Unable to connect to database. Please try again."
- **Constraint violations**: Map to user-friendly messages (e.g., unique constraint → "duplicate marketplace")
- **Foreign key violations**: "The selected marketplace no longer exists"

### Client-Side Error Handling

React components will use TanStack Query's error states:

- Display error messages in toast notifications or inline alerts
- Provide retry mechanisms for failed operations
- Show loading states during async operations
- Disable form submissions while mutations are pending

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and integration points:

- **Marketplace CRUD operations**: Test create, read, delete with specific example data
- **Sales entry CRUD operations**: Test create, read, update, delete with specific example data
- **Date validation**: Test specific edge cases (today, yesterday, tomorrow)
- **Amount validation**: Test specific values (0, 0.01, negative numbers)
- **Statistics calculations**: Test with known data sets and expected results
- **User isolation**: Test that user A cannot access user B's data

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript/TypeScript property testing library). Each test will run a minimum of 100 iterations.

**Test Configuration**:
```typescript
import fc from 'fast-check'

// Each property test should use:
fc.assert(
  fc.property(/* arbitraries */, /* test function */),
  { numRuns: 100 }
)
```

**Generators/Arbitraries**:

```typescript
// Marketplace name generator (1-255 chars, non-empty after trim)
const marketplaceNameArb = fc.string({ minLength: 1, maxLength: 255 })
  .filter(s => s.trim().length > 0)

// User ID generator (positive integers)
const userIdArb = fc.integer({ min: 1 })

// Date generator (past and present dates only)
const pastDateArb = fc.date({ max: new Date() })
  .map(d => d.toISOString().split('T')[0]) // YYYY-MM-DD format

// Sales amount generator (non-negative, 2 decimal places)
const salesAmountArb = fc.double({ min: 0, max: 999999.99, noNaN: true })
  .map(n => Math.round(n * 100) / 100) // Round to 2 decimals

// Marketplace ID generator
const marketplaceIdArb = fc.integer({ min: 1 })
```

**Property Test Tags**:

Each property-based test must include a comment tag in this exact format:
```typescript
// **Feature: marketplace-sales-tracking, Property 1: Marketplace creation persists with correct associations**
```

**Test Organization**:

- Property tests will be co-located with unit tests in `src/__tests__/marketplace-sales-tracking.test.ts`
- Each correctness property will be implemented as a single property-based test
- Tests will use the actual database (test database) to verify real behavior, not mocks
- Setup and teardown will ensure test isolation (clean database state between tests)

### Integration Testing

Integration tests will verify end-to-end workflows:

- Complete user flow: create marketplace → add sales entry → view statistics
- Cascade deletion: create marketplace with sales → delete marketplace → verify all data removed
- Upsert flow: create entry → update same entry → verify single record with new value
- Multi-user scenarios: verify data isolation between users

### Test Database Setup

Tests will use a separate test database:

- Use environment variable `TEST_DATABASE_URL` for test database connection
- Run migrations before test suite
- Clear all data between test runs
- Seed with minimal required data (test users)

