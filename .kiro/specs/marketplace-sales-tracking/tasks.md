# Implementation Plan

- [x] 1. Extend database schema with marketplace and sales tables
  - Add `marketplaces` table with userId foreign key and unique constraint on (userId, name)
  - Add `salesEntries` table with userId and marketplaceId foreign keys, cascade delete, and unique constraint on (userId, marketplaceId, date)
  - Create database indexes for efficient queries (userId, date)
  - Generate and run Drizzle migration
  - _Requirements: 1.1, 1.3, 3.2, 4.1, 4.6_

- [x] 2. Implement marketplace server functions
  - [x] 2.1 Create `getMarketplaces` server function
    - Validate session and extract userId
    - Query marketplaces table filtered by userId
    - Order results by createdAt descending
    - Return array of marketplace objects
    - _Requirements: 2.1, 2.3, 2.4_

  - [ ]* 2.2 Write property test for marketplace query isolation
    - **Property 3: Users only see their own marketplaces**
    - **Validates: Requirements 2.1**

  - [ ]* 2.3 Write property test for marketplace field inclusion
    - **Property 4: Marketplaces are returned with required fields**
    - **Validates: Requirements 2.3**

  - [ ]* 2.4 Write property test for marketplace ordering
    - **Property 5: Marketplaces are ordered by creation date descending**
    - **Validates: Requirements 2.4**

  - [x] 2.5 Create `createMarketplace` server function
    - Validate session and extract userId
    - Validate input with Zod schema (name: non-empty string, max 255 chars)
    - Check for duplicate marketplace name for this user
    - Insert marketplace record with userId
    - Return created marketplace object
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 2.6 Write property test for marketplace creation persistence
    - **Property 1: Marketplace creation persists with correct associations**
    - **Validates: Requirements 1.1, 1.4, 1.5**

  - [ ]* 2.7 Write property test for duplicate marketplace rejection
    - **Property 2: Duplicate marketplace names are rejected**
    - **Validates: Requirements 1.3**

  - [x] 2.8 Create `deleteMarketplace` server function
    - Validate session and extract userId
    - Validate input with Zod schema (marketplaceId: positive integer)
    - Verify marketplace belongs to authenticated user
    - Delete marketplace record (cascade deletes sales entries)
    - Return success response
    - _Requirements: 3.2_

  - [ ]* 2.9 Write property test for cascade deletion
    - **Property 6: Marketplace deletion cascades to sales entries**
    - **Validates: Requirements 3.2, 3.3**

- [x] 3. Implement sales entry server functions
  - [x] 3.1 Create `getSalesEntries` server function
    - Validate session and extract userId
    - Accept optional marketplaceId filter parameter
    - Query salesEntries with marketplace join
    - Filter by userId and optional marketplaceId
    - Order results by date descending
    - Return array of sales entry objects with marketplace names
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ]* 3.2 Write property test for sales entry ordering
    - **Property 11: Sales entries ordered by date descending**
    - **Validates: Requirements 5.1**

  - [ ]* 3.3 Write property test for sales entry field inclusion
    - **Property 12: Sales entries include marketplace information**
    - **Validates: Requirements 5.2**

  - [ ]* 3.4 Write property test for marketplace filtering
    - **Property 14: Marketplace filtering returns only matching entries**
    - **Validates: Requirements 5.5**

  - [x] 3.5 Create `upsertSalesEntry` server function
    - Validate session and extract userId
    - Validate input with Zod schema (marketplaceId: positive int, date: YYYY-MM-DD format, amount: non-negative number with 2 decimals)
    - Validate date is not in future
    - Verify marketplace belongs to authenticated user
    - Upsert sales entry (insert or update if userId + marketplaceId + date exists)
    - Set updatedAt timestamp
    - Return created/updated sales entry
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 6.2_

  - [ ]* 3.6 Write property test for sales entry creation
    - **Property 7: Sales entry creation persists with valid data**
    - **Validates: Requirements 4.1**

  - [ ]* 3.7 Write property test for future date rejection
    - **Property 8: Future dates are rejected for sales entries**
    - **Validates: Requirements 4.4**

  - [ ]* 3.8 Write property test for multiple entries on different dates
    - **Property 9: Multiple sales entries allowed for different dates**
    - **Validates: Requirements 4.5**

  - [ ]* 3.9 Write property test for upsert behavior
    - **Property 10: Upsert behavior for duplicate marketplace-date combinations**
    - **Validates: Requirements 4.6**

  - [ ]* 3.10 Write property test for update validation consistency
    - **Property 15: Update validation matches creation validation**
    - **Validates: Requirements 6.2**

  - [ ]* 3.11 Write property test for update persistence
    - **Property 16: Sales entry updates persist to database**
    - **Validates: Requirements 6.3**

  - [x] 3.12 Create `deleteSalesEntry` server function
    - Validate session and extract userId
    - Validate input with Zod schema (salesEntryId: positive integer)
    - Verify sales entry belongs to authenticated user
    - Delete sales entry record
    - Return success response
    - _Requirements: 7.2_

  - [ ]* 3.13 Write property test for sales entry deletion
    - **Property 17: Sales entry deletion removes from database**
    - **Validates: Requirements 7.2, 7.3**

- [x] 4. Implement sales statistics server function
  - [x] 4.1 Create `getSalesStatistics` server function
    - Validate session and extract userId
    - Calculate total sales: sum all amounts where userId matches
    - Calculate month sales: sum amounts where userId matches and date is in current month
    - Calculate week sales: sum amounts where userId matches and date is in current week (Monday-Sunday)
    - Return statistics object with totalSales, monthSales, weekSales
    - Handle empty data case (return zeros)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 4.2 Write property test for total sales aggregation
    - **Property 18: Total sales aggregates all user entries**
    - **Validates: Requirements 8.1**

  - [ ]* 4.3 Write property test for monthly sales aggregation
    - **Property 19: Monthly sales aggregates current month only**
    - **Validates: Requirements 8.2**

  - [ ]* 4.4 Write property test for weekly sales aggregation
    - **Property 20: Weekly sales aggregates current week only**
    - **Validates: Requirements 8.3**

  - [ ]* 4.5 Write property test for statistics user isolation
    - **Property 21: Statistics isolated by user**
    - **Validates: Requirements 8.4**

- [x] 5. Create marketplace management UI components
  - [x] 5.1 Create MarketplaceList component
    - Display list of marketplaces with name and creation date
    - Show empty state message when no marketplaces exist
    - Include delete button for each marketplace with confirmation dialog
    - Use TanStack Query to fetch marketplaces
    - Handle loading and error states
    - _Requirements: 2.1, 2.2, 2.3, 3.1_

  - [x] 5.2 Create MarketplaceForm component
    - Input field for marketplace name
    - Submit button to create marketplace
    - Validate non-empty name on client side
    - Use TanStack Query mutation for creation
    - Display validation errors
    - Clear form on successful creation
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 5.3 Write unit tests for marketplace components
    - Test MarketplaceList renders marketplaces correctly
    - Test MarketplaceList shows empty state
    - Test MarketplaceForm validates empty input
    - Test MarketplaceForm submits valid data
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [x] 6. Create sales entry management UI components
  - [x] 6.1 Create SalesEntryForm component
    - Dropdown to select marketplace
    - Date picker input (max date: today)
    - Number input for sales amount (min: 0, step: 0.01)
    - Submit button to create/update entry
    - Validate all required fields on client side
    - Pre-populate fields when editing existing entry
    - Use TanStack Query mutation for upsert
    - Display validation errors
    - Clear form on successful submission
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2_

  - [x] 6.2 Create SalesHistory component
    - Table displaying sales entries with date, marketplace name, and formatted amount
    - Format amounts as currency with $ symbol and 2 decimal places
    - Dropdown filter to select marketplace (with "All" option)
    - Edit button for each entry (opens form with pre-populated data)
    - Delete button for each entry with confirmation dialog
    - Show empty state message when no entries exist
    - Use TanStack Query to fetch sales entries
    - Handle loading and error states
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 7.1_

  - [ ]* 6.3 Write property test for amount formatting
    - **Property 13: Amount formatting preserves two decimal places**
    - **Validates: Requirements 5.4**

  - [ ]* 6.4 Write unit tests for sales entry components
    - Test SalesEntryForm validates required fields
    - Test SalesEntryForm validates future dates
    - Test SalesEntryForm validates negative amounts
    - Test SalesHistory renders entries correctly
    - Test SalesHistory shows empty state
    - Test SalesHistory filters by marketplace
    - _Requirements: 4.2, 4.3, 4.4, 5.3, 5.5_

- [x] 7. Create statistics dashboard component
  - [x] 7.1 Create StatisticsDashboard component
    - Display three metric cards: Total Sales, Month Sales, Week Sales
    - Format all amounts as currency with $ symbol and 2 decimal places
    - Use icons to visually distinguish each metric
    - Use TanStack Query to fetch statistics
    - Handle loading and error states
    - Show $0.00 when no data exists
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [ ]* 7.2 Write unit tests for statistics component
    - Test StatisticsDashboard renders all three metrics
    - Test StatisticsDashboard formats amounts correctly
    - Test StatisticsDashboard shows zeros for empty data
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 8. Integrate marketplace and sales features into dashboard route
  - [x] 8.1 Update dashboard route layout
    - Add new sections for Marketplaces, Sales, and Statistics
    - Use tabs or collapsible sections to organize content
    - Keep existing admin section (invites and users) for admin users
    - Show marketplace/sales sections for all authenticated users
    - Ensure responsive layout for mobile devices
    - _Requirements: All_

  - [x] 8.2 Wire up all components with data fetching
    - Import and render MarketplaceList and MarketplaceForm
    - Import and render SalesEntryForm and SalesHistory
    - Import and render StatisticsDashboard
    - Configure TanStack Query to refetch data after mutations
    - Add error toast notifications for failed operations
    - Add success feedback for completed operations
    - _Requirements: All_

  - [ ]* 8.3 Write integration tests for complete user flows
    - Test complete flow: create marketplace → add sales entry → view in history
    - Test cascade deletion: create marketplace with sales → delete marketplace → verify all removed
    - Test upsert flow: create entry → update same entry → verify single record
    - Test statistics update after adding sales entries
    - _Requirements: All_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
