# Implementation Plan

- [x] 1. Install React Hook Form dependencies
  - Install react-hook-form package
  - Install @hookform/resolvers package for Zod integration
  - Verify Zod is available (already in project)
  - Run pnpm install to update lock file
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2. Migrate MarketplaceForm to React Hook Form
  - [x] 2.1 Create Zod validation schema for marketplace form
    - Define schema with name field validation (min 1, max 255 chars)
    - Add transform to trim whitespace
    - Export TypeScript type inferred from schema
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 2.2 Replace useState with useForm hook
    - Remove individual useState hooks (name, validationError)
    - Initialize useForm with zodResolver
    - Destructure register, handleSubmit, formState, reset
    - _Requirements: 1.1, 6.2_

  - [x] 2.3 Update input to use register pattern
    - Replace value/onChange with {...register('name')}
    - Remove manual handleNameChange function
    - Maintain existing className and placeholder
    - _Requirements: 1.2_

  - [x] 2.4 Update error display to use formState.errors
    - Replace validationError state with errors.name
    - Display errors.name.message when present
    - Maintain existing error styling
    - _Requirements: 1.3, 1.4, 4.2, 6.5_

  - [x] 2.5 Update form submission handler
    - Replace manual handleSubmit with RHF handleSubmit(onSubmit)
    - Remove manual validation logic
    - Call mutation.mutate with form data
    - Call reset() on successful mutation
    - _Requirements: 1.5, 3.1, 3.3, 6.3_

  - [x] 2.6 Update disabled states
    - Use isSubmitting instead of mutation.isPending for input disabled state
    - Update submit button disabled logic
    - _Requirements: 3.2_

  - [ ]* 2.7 Write unit tests for MarketplaceForm
    - Test validation: empty name shows error
    - Test validation: name > 255 chars shows error
    - Test submission: valid name calls mutation
    - Test reset: form clears after successful submission
    - _Requirements: 1.3, 1.4, 1.5_

- [x] 3. Migrate SalesEntryForm to React Hook Form
  - [x] 3.1 Create Zod validation schema for sales entry form
    - Define marketplaceId field (number, positive, required)
    - Define date field (string, required, not future)
    - Define amount field (number, non-negative, required)
    - Add custom refinement for future date validation
    - Export TypeScript type inferred from schema
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 3.2 Replace useState hooks with useForm hook
    - Remove individual useState hooks (marketplaceId, date, amount, validationErrors)
    - Initialize useForm with zodResolver
    - Configure defaultValues for edit mode using existingEntry prop
    - Destructure register, handleSubmit, formState, reset
    - _Requirements: 2.1, 6.2, 6.3_

  - [x] 3.3 Update marketplace select to use register pattern
    - Replace value/onChange with {...register('marketplaceId')}
    - Add setValueAs to parse string to number
    - Remove manual handleMarketplaceChange function
    - Maintain existing className and options
    - _Requirements: 2.2_

  - [x] 3.4 Update date input to use register pattern
    - Replace value/onChange with {...register('date')}
    - Remove manual handleDateChange function
    - Maintain existing max date attribute
    - _Requirements: 2.3_

  - [x] 3.5 Update amount input to use register pattern
    - Replace value/onChange with {...register('amount', { valueAsNumber: true })}
    - Remove manual handleAmountChange function
    - Maintain existing min, step, and placeholder attributes
    - _Requirements: 2.4_

  - [x] 3.6 Update error display to use formState.errors
    - Replace validationErrors state with errors object
    - Display errors.marketplaceId.message when present
    - Display errors.date.message when present
    - Display errors.amount.message when present
    - Maintain existing error styling
    - _Requirements: 2.5, 2.6, 2.7, 2.8, 2.9, 4.2, 6.5_

  - [x] 3.7 Update form submission handler
    - Replace manual handleSubmit with RHF handleSubmit(onSubmit)
    - Remove validateForm function
    - Call mutation.mutate with form data
    - Call reset() on successful mutation (only if not editing)
    - _Requirements: 3.1, 3.3, 6.3, 6.4_

  - [x] 3.8 Update disabled states
    - Use isSubmitting for input disabled states
    - Update submit button disabled logic
    - _Requirements: 3.2_

  - [x] 3.9 Remove useEffect for existingEntry
    - Remove useEffect that sets state from existingEntry
    - Rely on defaultValues in useForm configuration
    - _Requirements: 2.1_

  - [ ]* 3.10 Write unit tests for SalesEntryForm
    - Test validation: missing marketplace shows error
    - Test validation: missing date shows error
    - Test validation: future date shows error
    - Test validation: missing amount shows error
    - Test validation: negative amount shows error
    - Test submission: valid data calls mutation
    - Test edit mode: defaultValues populate form
    - _Requirements: 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 4. Verify migration maintains existing behavior
  - [x] 4.1 Test MarketplaceForm functionality
    - Manually test creating marketplace with valid name
    - Manually test validation errors for empty and long names
    - Verify form clears after successful submission
    - Verify success toast appears
    - Verify error toast appears on failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.2 Test SalesEntryForm functionality
    - Manually test creating sales entry with valid data
    - Manually test all validation errors
    - Manually test edit mode with existing entry
    - Verify form behavior matches original
    - Verify success and error toasts
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.3 Verify visual parity
    - Compare rendered HTML structure
    - Verify CSS classes are identical
    - Verify error message positioning
    - Verify loading states
    - Verify disabled states
    - _Requirements: 4.1, 4.2_

  - [x] 4.4 Measure code reduction
    - Count lines in original MarketplaceForm
    - Count lines in migrated MarketplaceForm
    - Count lines in original SalesEntryForm
    - Count lines in migrated SalesEntryForm
    - Verify at least 30% reduction
    - _Requirements: 6.1_

- [x] 5. Run all existing tests
  - Run pnpm test to execute all test suites
  - Verify all marketplace and sales entry tests pass
  - Verify no regressions in other tests
  - _Requirements: All_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
