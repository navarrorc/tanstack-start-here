# Invite-Based Authentication App Setup Guide

This application features Google OAuth authentication with an invite code system and NeonDB PostgreSQL database.

## ⚠️ Before You Start

**You MUST complete these steps before running `pnpm db:push`:**

1. ✅ Create a NeonDB account and project at https://neon.tech
2. ✅ Get your NeonDB connection strings
3. ✅ Create Google OAuth credentials at https://console.cloud.google.com
4. ✅ Update `.env.local` with your ACTUAL credentials (not the placeholders)

**The error you're seeing** (`Either connection "url" or "host", "database" are required`) means you need to add your real NeonDB connection string to `.env.local` first!

## Features

- 🔐 Google OAuth authentication
- 📧 Invite code system for user registration
- 👑 First user automatically becomes admin
- 🗄️ PostgreSQL database via NeonDB
- 🎨 Modern UI with TailwindCSS
- ⚡ Built with TanStack Start

## Prerequisites

1. Node.js 18+ and pnpm installed
2. A NeonDB account (https://neon.tech)
3. A Google Cloud Console project with OAuth credentials

## Setup Instructions

### 1. Database Setup (NeonDB)

1. Go to https://neon.tech and create a free account
2. Click "Create Project"
3. Give your project a name (e.g., "invite-auth-app")
4. Once created, you'll see the connection string
5. Click on "Connection Details" and copy:
   - **Connection string** (for DATABASE_URL and VITE_DATABASE_URL)
   - **Pooled connection string** (for VITE_DATABASE_URL_POOLER)
6. Update `.env.local` with your actual database URLs:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
VITE_DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
VITE_DATABASE_URL_POOLER=postgresql://user:password@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Important**: Replace the placeholder values in `.env.local` with your actual NeonDB connection strings before proceeding!

### 2. Google OAuth Setup

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new project (or select an existing one)
3. Click "Configure Consent Screen"
   - Choose "External" user type
   - Fill in app name, user support email, and developer contact
   - Add scopes: `openid`, `profile`, `email`
   - Save and continue
4. Go back to "Credentials" tab
5. Click "Create Credentials" → "OAuth 2.0 Client ID"
6. Choose "Web application"
7. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
8. Click "Create"
9. Copy your Client ID and Client Secret
10. Update `.env.local`:

```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

**Important**: Replace the placeholder values with your actual Google OAuth credentials!

### 3. Database Migration

Run the database migration to create tables:

```bash
pnpm db:push
```

### 4. Start the Development Server

```bash
pnpm dev
```

The app will be available at http://localhost:3000

## Usage

### First User (Admin)

1. Navigate to http://localhost:3000
2. Click "Get Started" or go to `/login`
3. Click "Continue with Google"
4. Sign in with your Google account
5. You'll be automatically made an administrator

### Admin Dashboard

As an admin, you can:
- Generate invite codes for new users
- View all invite codes and their status
- See which users have used invite codes
- Copy invite links to share with users

### Inviting New Users

1. Log in as admin
2. Go to the dashboard
3. Enter the user's email address
4. Click "Generate" to create an invite code
5. Click "Copy Link" to get the full invite URL
6. Share the link with the user

### New User Registration

1. Receive an invite link from an admin
2. Click the link (it will include the invite code)
3. Click "Continue with Google"
4. Sign in with the email address the invite was sent to
5. You'll be registered and logged in

## Database Schema

### Users Table
- `id`: Primary key
- `email`: User email (unique)
- `googleId`: Google OAuth ID (unique)
- `name`: User's display name
- `isAdmin`: Admin flag
- `createdAt`: Registration timestamp

### Invite Codes Table
- `id`: Primary key
- `code`: Unique invite code
- `email`: Email the invite is for
- `used`: Whether the code has been used
- `usedBy`: User ID who used the code
- `createdBy`: Admin ID who created the code
- `createdAt`: Creation timestamp
- `usedAt`: Usage timestamp

### Sessions Table
- `id`: Session ID (hashed token)
- `userId`: User ID
- `expiresAt`: Expiration timestamp

## API Endpoints

- `GET /api/auth/login` - Initiate Google OAuth flow
- `GET /api/auth/callback/google` - OAuth callback handler
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/invites/generate` - Generate invite code (admin only)
- `GET /api/invites/list` - List all invite codes (admin only)

## Security Features

- HttpOnly cookies for session management
- Session tokens are hashed before storage
- Invite codes are validated against email addresses
- Admin-only endpoints are protected
- Sessions expire after 30 days
- Automatic session refresh

## Development

### Database Commands

```bash
# Push schema changes to database
pnpm db:push

# Generate migrations
pnpm db:generate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Build for Production

```bash
pnpm build
pnpm serve
```

## Troubleshooting

### "Invite code required" error
- Make sure you're using the correct invite link
- Verify the email matches the one the invite was created for

### Database connection errors
- Check your DATABASE_URL is correct
- Ensure your NeonDB project is active
- Verify network connectivity

### OAuth errors
- Verify redirect URI matches exactly in Google Console
- Check CLIENT_ID and CLIENT_SECRET are correct
- Ensure your Google Cloud project has OAuth consent screen configured

## Next Steps

You can extend this application by:
- Adding user profiles
- Implementing role-based permissions
- Adding email notifications for invites
- Creating user management features
- Adding activity logs
- Implementing team/organization features
