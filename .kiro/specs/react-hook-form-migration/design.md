# Design Document

## Overview

This design outlines the migration of MarketplaceForm and SalesEntryForm from manual state management to React Hook Form (RHF). The migration will reduce code volume by approximately 40%, eliminate manual state management boilerplate, and improve form performance through uncontrolled components. All existing functionality, validation rules, and user experience will be preserved.

## Architecture

The migration follows these architectural principles:

1. **Uncontrolled Components**: RHF uses refs to access DOM values directly, avoiding unnecessary re-renders
2. **Declarative Validation**: Validation rules are defined in Zod schemas, co-located with form setup
3. **Type Safety**: Full TypeScript inference from Zod schemas to form values
4. **Integration Preservation**: Maintain existing TanStack Query mutation patterns
5. **Progressive Enhancement**: Migrate one form at a time to minimize risk

### Key Architectural Decisions

1. **Zod for Validation**: Use Zod schemas with `@hookform/resolvers/zod` for type-safe validation
2. **Register Pattern**: Use `register()` for simple inputs, `Controller` for complex components if needed
3. **Error Display**: Use RHF's `formState.errors` instead of manual error state
4. **Form Reset**: Use RHF's `reset()` instead of manual state clearing
5. **Submission State**: Use RHF's `formState.isSubmitting` instead of mutation.isPending for input disabling

## Components and Interfaces

### React Hook Form Setup Pattern

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Define Zod schema
const schema = z.object({
  fieldName: z.string().min(1, 'Error message'),
})

// Infer TypeScript type from schema
type FormData = z.infer<typeof schema>

// In component
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  reset,
} = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

### MarketplaceForm Migration

**Current Approach (Manual State):**
```typescript
const [name, setName] = useState('')
const [validationError, setValidationError] = useState('')

const handleSubmit = (e) => {
  e.preventDefault()
  const trimmedName = name.trim()
  if (!trimmedName) {
    setValidationError('Marketplace name is required')
    return
  }
  // ... more validation
  createMutation.mutate(trimmedName)
}
```

**New Approach (React Hook Form):**
```typescript
const marketplaceSchema = z.object({
  name: z.string()
    .min(1, 'Marketplace name is required')
    .max(255, 'Marketplace name must be 255 characters or less')
    .transform(val => val.trim()),
})

type MarketplaceFormData = z.infer<typeof marketplaceSchema>

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  reset,
} = useForm<MarketplaceFormData>({
  resolver: zodResolver(marketplaceSchema),
})

const onSubmit = (data: MarketplaceFormData) => {
  createMutation.mutate(data.name)
}
```

### SalesEntryForm Migration

**Current Approach (Manual State):**
```typescript
const [marketplaceId, setMarketplaceId] = useState<number | ''>('')
const [date, setDate] = useState('')
const [amount, setAmount] = useState('')
const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

const validateForm = (): boolean => {
  const errors: Record<string, string> = {}
  if (!marketplaceId) errors.marketplace = 'Marketplace selection is required'
  // ... more validation
  setValidationErrors(errors)
  return Object.keys(errors).length === 0
}
```

**New Approach (React Hook Form):**
```typescript
const salesEntrySchema = z.object({
  marketplaceId: z.number({
    required_error: 'Marketplace selection is required',
    invalid_type_error: 'Marketplace selection is required',
  }).positive(),
  date: z.string()
    .min(1, 'Date is required')
    .refine(
      (date) => new Date(date) <= new Date(),
      'Sales date cannot be in the future'
    ),
  amount: z.number({
    required_error: 'Sales amount is required',
    invalid_type_error: 'Sales amount must be a valid number',
  })
    .nonnegative('Sales amount must be non-negative'),
})

type SalesEntryFormData = z.infer<typeof salesEntrySchema>

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  reset,
} = useForm<SalesEntryFormData>({
  resolver: zodResolver(salesEntrySchema),
  defaultValues: existingEntry ? {
    marketplaceId: existingEntry.marketplaceId,
    date: existingEntry.date,
    amount: parseFloat(existingEntry.amount),
  } : undefined,
})
```

## Data Models

### Zod Schemas

```typescript
// Marketplace Form Schema
const marketplaceSchema = z.object({
  name: z.string()
    .min(1, 'Marketplace name is required')
    .max(255, 'Marketplace name must be 255 characters or less')
    .transform(val => val.trim()),
})

// Sales Entry Form Schema
const salesEntrySchema = z.object({
  marketplaceId: z.number({
    required_error: 'Marketplace selection is required',
    invalid_type_error: 'Marketplace selection is required',
  }).positive(),
  date: z.string()
    .min(1, 'Date is required')
    .refine(
      (date) => new Date(date) <= new Date(),
      'Sales date cannot be in the future'
    ),
  amount: z.number({
    required_error: 'Sales amount is required',
    invalid_type_error: 'Sales amount must be a valid number',
  })
    .nonnegative('Sales amount must be non-negative'),
})
```

### TypeScript Types

```typescript
// Inferred from Zod schemas
type MarketplaceFormData = z.infer<typeof marketplaceSchema>
// { name: string }

type SalesEntryFormData = z.infer<typeof salesEntrySchema>
// { marketplaceId: number; date: string; amount: number }
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Form validation prevents invalid submissions
*For any* form input that violates validation rules, submitting the form should prevent the mutation from being called and display appropriate error messages.
**Validates: Requirements 1.3, 1.4, 2.5, 2.6, 2.7, 2.8, 2.9**

### Property 2: Valid form submissions trigger mutations
*For any* form input that satisfies all validation rules, submitting the form should invoke the TanStack Query mutation with the correct data.
**Validates: Requirements 3.1, 4.3**

### Property 3: Form reset clears all fields
*For any* form state, calling reset should clear all input values and error messages, returning the form to its initial state.
**Validates: Requirements 1.5, 3.3**

### Property 4: Error messages match validation rules
*For any* validation error, the displayed error message should match the message defined in the Zod schema for that specific validation rule.
**Validates: Requirements 4.2, 5.3**

### Property 5: Form submission state disables inputs
*For any* form during submission (isSubmitting === true), all form inputs should be disabled to prevent duplicate submissions.
**Validates: Requirements 3.2**

### Property 6: Type inference maintains type safety
*For any* form data submitted, the TypeScript type should match the inferred type from the Zod schema, ensuring compile-time type safety.
**Validates: Requirements 5.4**

### Property 7: Migrated forms maintain visual parity
*For any* migrated form component, the rendered HTML structure and CSS classes should be identical to the original implementation.
**Validates: Requirements 4.1, 4.2**

### Property 8: Success and error toasts remain unchanged
*For any* form submission result (success or error), the toast messages displayed should be identical to the original implementation.
**Validates: Requirements 4.4, 4.5**

## Error Handling

### Validation Errors

React Hook Form with Zod provides automatic error handling:

```typescript
// Access errors from formState
const { errors } = formState

// Display field errors
{errors.fieldName && (
  <p className="text-red-600 text-sm">{errors.fieldName.message}</p>
)}
```

**Error Message Mapping:**
- Empty marketplace name → "Marketplace name is required"
- Name > 255 chars → "Marketplace name must be 255 characters or less"
- No marketplace selected → "Marketplace selection is required"
- No date → "Date is required"
- Future date → "Sales date cannot be in the future"
- No amount → "Sales amount is required"
- Negative amount → "Sales amount must be non-negative"

### Submission Errors

Mutation errors continue to use the existing toast system:

```typescript
const createMutation = useMutation({
  mutationFn: async (data) => { /* ... */ },
  onError: (error: Error) => {
    showToast('error', error.message || 'Failed to create marketplace')
  },
})
```

### Type Errors

Zod handles type coercion and validation:

```typescript
// For number inputs, use valueAsNumber
<input
  type="number"
  {...register('amount', { valueAsNumber: true })}
/>

// For select inputs, parse to number
<select
  {...register('marketplaceId', {
    setValueAs: (v) => v === '' ? undefined : parseInt(v, 10),
  })}
/>
```

## Testing Strategy

### Unit Testing

Unit tests will verify form behavior with specific inputs:

- **Validation Tests**: Submit forms with invalid data, verify error messages
- **Submission Tests**: Submit forms with valid data, verify mutation is called
- **Reset Tests**: Submit form, verify reset clears all fields
- **Error Display Tests**: Trigger validation errors, verify error messages appear
- **Disabled State Tests**: Submit form, verify inputs are disabled during submission

### Integration Testing

Integration tests will verify end-to-end form workflows:

- **MarketplaceForm Flow**: Enter name → submit → verify marketplace created → verify form cleared
- **SalesEntryForm Flow**: Select marketplace → enter date → enter amount → submit → verify entry created
- **Edit Flow**: Load existing entry → modify fields → submit → verify entry updated
- **Error Flow**: Submit invalid data → verify error messages → correct data → submit → verify success

### Visual Regression Testing

Manual verification that migrated forms are visually identical:

- Compare rendered HTML structure
- Compare CSS classes and styling
- Compare error message positioning
- Compare loading states
- Compare disabled states

### Migration Validation

Before/after comparison tests:

- **Code Volume**: Measure line count reduction (target: 30%+ reduction)
- **Bundle Size**: Verify no significant bundle size increase
- **Performance**: Verify no performance regression in form interactions
- **Functionality**: Verify all existing features work identically

## Implementation Notes

### Register Pattern for Inputs

```typescript
// Text input
<input {...register('name')} />

// Number input (with type coercion)
<input
  type="number"
  {...register('amount', { valueAsNumber: true })}
/>

// Select input (with type coercion)
<select
  {...register('marketplaceId', {
    setValueAs: (v) => v === '' ? undefined : parseInt(v, 10),
  })}
>
  <option value="">Select...</option>
  <option value="1">Option 1</option>
</select>

// Date input
<input
  type="date"
  {...register('date')}
/>
```

### Error Display Pattern

```typescript
// Single error message
{errors.fieldName && (
  <p className="mt-1 text-red-600 text-sm">
    {errors.fieldName.message}
  </p>
)}

// Multiple error types (if using criteriaMode: 'all')
{errors.fieldName?.types && (
  <div>
    {Object.values(errors.fieldName.types).map((error, i) => (
      <p key={i} className="text-red-600 text-sm">{error}</p>
    ))}
  </div>
)}
```

### Form Submission Pattern

```typescript
const onSubmit = (data: FormData) => {
  mutation.mutate(data, {
    onSuccess: () => {
      reset() // Clear form
      showToast('success', 'Success message')
    },
  })
}

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    {/* form fields */}
  </form>
)
```

### Disabled State Pattern

```typescript
// Disable inputs during submission
<input
  {...register('name')}
  disabled={isSubmitting}
/>

// Disable submit button
<button
  type="submit"
  disabled={isSubmitting}
>
  {isSubmitting ? 'Saving...' : 'Save'}
</button>
```

## Migration Strategy

### Phase 1: Setup
1. Install react-hook-form and @hookform/resolvers
2. Verify Zod is available (already in project)
3. Create Zod schemas for both forms

### Phase 2: MarketplaceForm Migration
1. Replace useState with useForm
2. Replace manual validation with Zod schema
3. Update input to use register()
4. Update error display to use formState.errors
5. Update submit handler to use handleSubmit()
6. Test thoroughly

### Phase 3: SalesEntryForm Migration
1. Replace useState hooks with useForm
2. Replace validateForm() with Zod schema
3. Update all inputs to use register()
4. Update error display to use formState.errors
5. Handle defaultValues for edit mode
6. Update submit handler to use handleSubmit()
7. Test thoroughly

### Phase 4: Validation
1. Run all existing tests
2. Perform manual testing of all form interactions
3. Verify visual parity with original forms
4. Measure code reduction
5. Document any behavioral changes (should be none)

## Benefits Summary

### Code Reduction
- **Before**: ~150-200 lines per form
- **After**: ~80-120 lines per form
- **Reduction**: 30-40% less code

### Eliminated Boilerplate
- ❌ Individual `useState` for each field
- ❌ Manual `validationErrors` state
- ❌ Custom `validateForm()` functions
- ❌ Manual `handleChange` functions
- ❌ Manual form reset logic

### Improved Developer Experience
- ✅ Type-safe validation with Zod
- ✅ Automatic error handling
- ✅ Built-in form state management
- ✅ Better performance (uncontrolled components)
- ✅ Industry-standard patterns
