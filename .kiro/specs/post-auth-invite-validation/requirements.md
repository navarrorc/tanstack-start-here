# Requirements Document

## Introduction

This specification defines the modification of the authentication flow to request invite codes after Google OAuth authentication rather than before. Currently, users must enter an invite code on the login page before authenticating with Google. The new flow will authenticate users with Google first, then prompt for an invite code only if they are a new user (not the first user).

## Glossary

- **OAuth Flow**: The authentication process using Google's OAuth 2.0 protocol
- **Invite Code**: A unique, email-specific, single-use code required for non-first users to register
- **First User**: The initial user who registers in the system and automatically receives admin privileges
- **Session Token**: A cryptographic token used to maintain authenticated user sessions
- **Callback Handler**: The server endpoint that processes the OAuth response from Google

## Requirements

### Requirement 1

**User Story:** As a new user, I want to authenticate with Google before being asked for an invite code, so that I can verify my identity first and have a smoother authentication experience.

#### Acceptance Criteria

1. WHEN a user clicks "Continue with Google" on the login page THEN the system SHALL initiate the OAuth flow without requiring an invite code input
2. WHEN the OAuth callback receives a response from Google THEN the system SHALL extract the user's email and Google ID
3. WHEN the system determines the authenticated user is not the first user and does not exist in the database THEN the system SHALL redirect to an invite code entry page
4. WHEN the system determines the authenticated user is the first user THEN the system SHALL create the user account with admin privileges and establish a session
5. WHEN the system determines the authenticated user already exists in the database THEN the system SHALL establish a session and redirect to the dashboard

### Requirement 2

**User Story:** As a new user who needs an invite code, I want to enter my invite code after Google authentication, so that the system can validate it against my authenticated email address.

#### Acceptance Criteria

1. WHEN a new non-first user is redirected to the invite code entry page THEN the system SHALL display a form requesting the invite code
2. WHEN a user submits an invite code THEN the system SHALL validate the code against the authenticated user's email address
3. WHEN the invite code is valid for the authenticated email THEN the system SHALL create the user account, mark the invite as used, and establish a session
4. WHEN the invite code is invalid or does not match the authenticated email THEN the system SHALL display an error message and allow retry
5. WHEN a user has successfully entered a valid invite code THEN the system SHALL redirect to the dashboard

### Requirement 3

**User Story:** As a developer, I want the OAuth state parameter to be used for security rather than invite code transmission, so that the authentication flow follows OAuth best practices.

#### Acceptance Criteria

1. WHEN initiating the OAuth flow THEN the system SHALL generate a cryptographic state parameter for CSRF protection
2. WHEN the OAuth callback receives a response THEN the system SHALL validate the state parameter matches the expected value
3. WHEN storing temporary authentication data THEN the system SHALL use secure session storage mechanisms
4. WHEN the invite code validation occurs THEN the system SHALL retrieve the authenticated user's email from secure session storage
5. WHEN a session is established THEN the system SHALL clear any temporary authentication data

### Requirement 4

**User Story:** As a system administrator, I want the invite code validation to occur after authentication, so that I can ensure only users with matching email addresses can use their invite codes.

#### Acceptance Criteria

1. WHEN validating an invite code THEN the system SHALL compare the code's associated email with the authenticated user's Google email
2. WHEN an invite code email does not match the authenticated user's email THEN the system SHALL reject the code with a descriptive error message
3. WHEN an invite code has already been used THEN the system SHALL reject the code with a descriptive error message
4. WHEN an invite code does not exist THEN the system SHALL reject the code with a descriptive error message
5. WHEN an invite code is successfully validated THEN the system SHALL atomically mark it as used and create the user account
