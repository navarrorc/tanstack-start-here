# Product Overview

An invite-based authentication application with Google OAuth integration. The system implements a controlled user registration flow where the first user becomes an admin, and subsequent users can only join via email-specific invite codes.

## Core Features

- **Google OAuth Authentication**: Secure login via Google accounts
- **Invite Code System**: Email-specific, single-use invite codes for controlled access
- **Auto-Admin**: First registered user automatically receives admin privileges
- **Admin Dashboard**: Interface for generating and managing invite codes
- **Session Management**: Secure 30-day sessions with automatic refresh

## User Flows

1. **First User**: Signs up with Google → automatically becomes admin
2. **Admin**: Generates invite codes for specific email addresses
3. **New Users**: Receive invite link → authenticate with Google using matching email
4. **All Users**: Access dashboard after successful authentication

## Security Model

- HttpOnly session cookies prevent XSS attacks
- SHA-256 hashed session tokens
- Email validation ensures invite codes match user email
- Admin-only endpoints for invite management
- Single-use invite codes prevent sharing
