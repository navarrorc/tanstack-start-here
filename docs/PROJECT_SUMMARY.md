# TanStack Start Starter Template - Project Summary

## Overview

A production-ready starter template for building full-stack applications with TanStack Start. This template provides a complete authentication system with Google OAuth and invite-based user management, giving you a solid foundation to build your application on top of.

**This is designed to be cloned and customized for new projects.**

## Tech Stack

- **Framework**: TanStack Start (React)
- **Database**: PostgreSQL via NeonDB
- **ORM**: Drizzle ORM
- **Authentication**: Google OAuth (via Arctic)
- **Session Management**: Custom implementation with secure tokens
- **UI**: TailwindCSS + Shadcn components
- **State Management**: TanStack Query

## Key Features

### 1. Google OAuth Authentication
- Secure OAuth 2.0 flow with Google
- User profile information fetched from Google
- Session-based authentication with HttpOnly cookies

### 2. Invite Code System
- Email-specific invite codes
- First user automatically becomes admin
- Admins can generate unlimited invite codes
- Invite codes are single-use and tied to specific emails
- Full invite tracking (created, used, timestamps)

### 3. Admin Dashboard
- Generate invite codes for specific email addresses
- View all invite codes and their status
- Copy invite links to share with users
- See which users have used which codes
- Track invite code usage over time

### 4. Security Features
- HttpOnly session cookies
- Session tokens are hashed before storage (SHA-256)
- 30-day session expiration with automatic refresh
- Email validation for invite codes
- Admin-only endpoints protected
- CSRF protection via SameSite cookies

## Project Structure

```
src/
├── components/
│   └── Header.tsx              # Navigation header
├── db/
│   ├── index.ts                # Database connection
│   └── schema.ts               # Database schema (users, inviteCodes, sessions)
├── lib/
│   ├── auth.ts                 # Authentication utilities
│   └── utils.ts                # General utilities
├── routes/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.ts        # Initiate OAuth flow
│   │   │   ├── callback/
│   │   │   │   └── google.ts   # OAuth callback handler
│   │   │   ├── logout.ts       # Logout endpoint
│   │   │   └── me.ts           # Get current user
│   │   └── invites/
│   │       ├── generate.ts     # Generate invite code (admin)
│   │       └── list.ts         # List invite codes (admin)
│   ├── __root.tsx              # Root layout
│   ├── index.tsx               # Landing page
│   ├── login.tsx               # Login page
│   └── dashboard.tsx           # Admin/user dashboard
├── env.ts                      # Environment variable validation
└── router.tsx                  # Router configuration
```

## Database Schema

### Users Table
```typescript
{
  id: serial (primary key)
  email: varchar(255) unique
  googleId: varchar(255) unique
  name: text
  isAdmin: boolean (default: false)
  createdAt: timestamp
}
```

### Invite Codes Table
```typescript
{
  id: serial (primary key)
  code: varchar(50) unique
  email: varchar(255)
  used: boolean (default: false)
  usedBy: foreign key -> users.id
  createdBy: foreign key -> users.id
  createdAt: timestamp
  usedAt: timestamp
}
```

### Sessions Table
```typescript
{
  id: text (primary key, hashed token)
  userId: foreign key -> users.id
  expiresAt: timestamp
}
```

## API Endpoints

### Authentication
- `GET /api/auth/login?code={inviteCode}` - Start OAuth flow
- `GET /api/auth/callback/google` - OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Invites (Admin Only)
- `POST /api/invites/generate` - Generate new invite code
  - Body: `{ email: string }`
  - Returns: `{ code: string, email: string }`
- `GET /api/invites/list` - List all invite codes
  - Returns: `{ invites: Array<InviteCode> }`

## User Flows

### First User (Admin) Flow
1. Visit the app
2. Click "Get Started" → redirected to `/login`
3. Click "Continue with Google"
4. Authenticate with Google
5. Automatically made admin
6. Redirected to dashboard

### Admin Inviting Users
1. Log in as admin
2. Navigate to dashboard
3. Enter user's email address
4. Click "Generate"
5. Copy the invite link
6. Share link with user

### New User Registration
1. Receive invite link from admin
2. Click link (includes invite code)
3. Click "Continue with Google"
4. Sign in with Google (must match invited email)
5. Account created and logged in
6. Redirected to dashboard

## Environment Variables

Required environment variables (see `.env.local`):

```env
# NeonDB
DATABASE_URL=postgresql://...
VITE_DATABASE_URL=postgresql://...
VITE_DATABASE_URL_POOLER=postgresql://...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

## Setup Steps

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up NeonDB**
   - Create account at https://neon.tech
   - Create new project
   - Copy connection strings to `.env.local`

3. **Set up Google OAuth**
   - Go to https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy credentials to `.env.local`

4. **Push database schema**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Visit http://localhost:3000**

## Security Considerations

1. **Session Management**
   - Tokens are hashed with SHA-256 before storage
   - HttpOnly cookies prevent XSS attacks
   - SameSite=Lax prevents CSRF
   - 30-day expiration with auto-refresh

2. **Invite Code Validation**
   - Codes are tied to specific email addresses
   - Single-use only
   - Validated server-side

3. **Admin Protection**
   - Admin endpoints check user.isAdmin
   - First user automatically becomes admin
   - No way to self-promote to admin

4. **OAuth Security**
   - State parameter used for CSRF protection
   - Tokens validated with Google
   - User info fetched from Google's API

## Extending This Template

This starter template is designed to be customized. Here are common ways to extend it:

### Add Your Business Logic
- Create new database tables in `src/db/schema.ts`
- Add server functions in `src/lib/server-functions.ts`
- Build new routes in `src/routes/`
- Create reusable components in `src/components/`

### Optional Enhancements
- Email notifications when invite codes are generated
- Invite code expiration dates
- Bulk invite generation
- User management (deactivate, promote to admin)
- Activity logs
- Team/organization support
- Role-based permissions beyond admin/user
- Two-factor authentication
- API rate limiting
- Invite code usage analytics

### Example Use Cases
- **SaaS Dashboard**: Add subscription management, billing, feature flags
- **Internal Tool**: Add your business workflows, data management
- **Content Platform**: Add posts, comments, media uploads
- **E-commerce**: Add products, cart, checkout
- **Social App**: Add profiles, posts, connections

## Troubleshooting

### "Invite code required" error
- Ensure you're using the full invite link
- Verify the email matches the invited email

### Database connection errors
- Check DATABASE_URL is correct
- Ensure NeonDB project is active
- Run `pnpm db:push` to create tables

### OAuth errors
- Verify redirect URI matches exactly
- Check CLIENT_ID and CLIENT_SECRET
- Ensure OAuth consent screen is configured

### Session issues
- Clear cookies and try again
- Check session hasn't expired
- Verify DATABASE_URL is accessible

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm serve

# Database commands
pnpm db:push      # Push schema to database
pnpm db:generate  # Generate migrations
pnpm db:studio    # Open Drizzle Studio

# Run tests
pnpm test
```

## Using This Template

1. **Clone or fork this repository**
2. **Update environment variables** with your credentials
3. **Push the database schema** with `pnpm db:push`
4. **Start building** your unique features on top of this foundation

The authentication, session management, and invite system are production-ready. Focus on building what makes your application unique!

## License

MIT License - Free to use for any project
