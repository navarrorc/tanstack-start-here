# Requirements Document

## Introduction

This feature migrates the existing marketplace sales tracking forms from manual state management to React Hook Form, reducing boilerplate code while maintaining all existing functionality and validation rules.

## Glossary

- **React Hook Form (RHF)**: A performant, flexible form library using uncontrolled components with refs
- **Form Component**: A React component containing form inputs (MarketplaceForm, SalesEntryForm)
- **Validation Rule**: A constraint that form input must satisfy before submission
- **System**: The marketplace sales tracking application
- **Uncontrolled Component**: An input that stores its own state in the DOM rather than React state

## Requirements

### Requirement 1

**User Story:** As a developer, I want to migrate MarketplaceForm to React Hook Form, so that I can reduce boilerplate code and improve performance.

#### Acceptance Criteria

1. WHEN the MarketplaceForm component renders THEN the System SHALL use React Hook Form's useForm hook for state management
2. WHEN a user types in the marketplace name input THEN the System SHALL track the value using React Hook Form's register function
3. WHEN a user submits an empty marketplace name THEN the System SHALL display the validation error "Marketplace name is required"
4. WHEN a user submits a marketplace name exceeding 255 characters THEN the System SHALL display the validation error "Marketplace name must be 255 characters or less"
5. WHEN a user successfully submits the form THEN the System SHALL clear the form using React Hook Form's reset function

### Requirement 2

**User Story:** As a developer, I want to migrate SalesEntryForm to React Hook Form, so that I can simplify complex validation logic.

#### Acceptance Criteria

1. WHEN the SalesEntryForm component renders THEN the System SHALL use React Hook Form's useForm hook for state management
2. WHEN a user selects a marketplace THEN the System SHALL track the selection using React Hook Form's register function
3. WHEN a user selects a date THEN the System SHALL track the date using React Hook Form's register function
4. WHEN a user enters a sales amount THEN the System SHALL track the amount using React Hook Form's register function
5. WHEN a user submits without selecting a marketplace THEN the System SHALL display the validation error "Marketplace selection is required"
6. WHEN a user submits without entering a date THEN the System SHALL display the validation error "Date is required"
7. WHEN a user submits a future date THEN the System SHALL display the validation error "Sales date cannot be in the future"
8. WHEN a user submits without entering an amount THEN the System SHALL display the validation error "Sales amount is required"
9. WHEN a user submits a negative amount THEN the System SHALL display the validation error "Sales amount must be non-negative"

### Requirement 3

**User Story:** As a developer, I want to integrate React Hook Form with TanStack Query mutations, so that form submission continues to work seamlessly.

#### Acceptance Criteria

1. WHEN a form is submitted successfully THEN the System SHALL invoke the TanStack Query mutation with form data
2. WHEN a mutation is pending THEN the System SHALL disable form inputs using React Hook Form's formState.isSubmitting
3. WHEN a mutation succeeds THEN the System SHALL reset the form using React Hook Form's reset function
4. WHEN a mutation fails THEN the System SHALL display the error message using the existing toast system

### Requirement 4

**User Story:** As a developer, I want to maintain existing form behavior, so that users experience no functional changes.

#### Acceptance Criteria

1. WHEN a user interacts with migrated forms THEN the System SHALL maintain identical visual appearance to current forms
2. WHEN validation errors occur THEN the System SHALL display errors in the same location and style as current forms
3. WHEN a user submits a form THEN the System SHALL perform the same server-side operations as current forms
4. WHEN a form submission succeeds THEN the System SHALL show the same success toast messages as current forms
5. WHEN a form submission fails THEN the System SHALL show the same error toast messages as current forms

### Requirement 5

**User Story:** As a developer, I want to use Zod for validation schemas, so that I can leverage type-safe validation with React Hook Form.

#### Acceptance Criteria

1. WHEN defining form validation THEN the System SHALL use Zod schemas for validation rules
2. WHEN React Hook Form validates input THEN the System SHALL use the Zod resolver to integrate Zod schemas
3. WHEN validation errors occur THEN the System SHALL map Zod error messages to form fields
4. THE System SHALL maintain TypeScript type inference from Zod schemas to form values
5. THE System SHALL reuse existing validation logic patterns from current implementation

### Requirement 6

**User Story:** As a developer, I want to reduce code volume, so that forms are easier to maintain and understand.

#### Acceptance Criteria

1. WHEN comparing migrated forms to original forms THEN the System SHALL reduce code volume by at least 30%
2. WHEN comparing migrated forms to original forms THEN the System SHALL eliminate all individual useState hooks for form fields
3. WHEN comparing migrated forms to original forms THEN the System SHALL eliminate manual validation error state management
4. WHEN comparing migrated forms to original forms THEN the System SHALL maintain or improve code readability
5. THE System SHALL use React Hook Form's built-in error handling instead of custom error state

### Requirement 7

**User Story:** As a developer, I want to install and configure React Hook Form, so that the library is available for use.

#### Acceptance Criteria

1. WHEN installing dependencies THEN the System SHALL add react-hook-form package to package.json
2. WHEN installing dependencies THEN the System SHALL add @hookform/resolvers package for Zod integration
3. WHEN installing dependencies THEN the System SHALL ensure Zod is available as it's already in the project
4. THE System SHALL use compatible versions of react-hook-form and @hookform/resolvers
5. THE System SHALL not introduce breaking changes to existing dependencies
