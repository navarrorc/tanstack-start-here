# Product Overview

**TanStack Start Starter Template** - A production-ready foundation for building full-stack applications with authentication.

This is a starter template designed to be cloned and customized for new projects. It provides a complete authentication system so you can focus on building your unique features.

## Core Features (Ready to Use)

- **Google OAuth Authentication**: Secure login via Google accounts
- **Invite Code System**: Email-specific, single-use invite codes for controlled access
- **Auto-Admin**: First registered user automatically receives admin privileges
- **Admin Dashboard**: Interface for generating and managing invite codes
- **Session Management**: Secure 30-day sessions with automatic refresh
- **Clean Foundation**: Minimal "Hello World" dashboard ready to customize

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

## Extending This Template

The authentication system is complete. Add your features by:
- Creating new database tables in `src/db/schema.ts`
- Adding server functions in `src/lib/server-functions.ts`
- Building routes in `src/routes/`
- Creating components in `src/components/`
