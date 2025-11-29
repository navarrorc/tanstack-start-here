# Quick Start Guide

## 🎯 What This Template Provides

```
┌─────────────────────────────────────────────────────────────┐
│  Ready-to-Use Features                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Google OAuth Authentication                             │
│  ✅ Invite-based User Management                            │
│  ✅ Admin Dashboard                                         │
│  ✅ Session Management                                      │
│  ✅ Database Schema & ORM                                   │
│  ✅ Production-Ready Security                               │
│                                                             │
│  🚀 Start Building Your App on Top of This!                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Step-by-Step Setup (5 minutes)

### Step 1: Get NeonDB Connection String (2 min)

1. Go to **https://neon.tech** → Sign up (free)
2. Click **"Create Project"**
3. Name it: `invite-auth-app`
4. Copy the **Connection String** shown on screen
5. It looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Step 2: Get Google OAuth Credentials (2 min)

1. Go to **https://console.cloud.google.com/apis/credentials**
2. Create new project or select existing
3. Click **"Configure Consent Screen"** → External → Fill basic info
4. Go to **"Credentials"** → **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Click **"Create"** and copy the Client ID and Secret

### Step 3: Update .env.local (1 min)

Open `.env.local` and replace ALL placeholder values:

```env
# Replace these with your ACTUAL values from NeonDB
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
VITE_DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
VITE_DATABASE_URL_POOLER=postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Replace these with your ACTUAL values from Google Cloud Console
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### Step 4: Run the App

```bash
# Push database schema to NeonDB
pnpm db:push

# Start the development server
pnpm dev
```

### Step 5: Test It Out

1. Open **http://localhost:3000**
2. Click **"Get Started"**
3. Click **"Continue with Google"**
4. Sign in with your Google account
5. You're now the admin! 🎉

## What You Have Now

✅ **Working Authentication System**
- Google OAuth login
- Session management
- Admin/user roles

✅ **Invite System**
- Generate invite codes
- Email-specific invites
- Track usage

✅ **Clean Dashboard**
- "Hello World" placeholder
- Admin controls
- Ready to customize

## Next Steps: Build Your App!

Now that authentication is set up, you can:
1. **Add your database tables** in `src/db/schema.ts`
2. **Create new routes** in `src/routes/`
3. **Build components** in `src/components/`
4. **Add server functions** in `src/lib/server-functions.ts`

The foundation is ready - focus on your unique features!

## Common Issues

### ❌ "Either connection url or host, database are required"
**Solution**: You didn't update `.env.local` with your real NeonDB connection string. Go back to Step 3.

### ❌ "OAuth error" or "Redirect URI mismatch"
**Solution**: Make sure you added `http://localhost:3000/api/auth/callback/google` exactly as shown in Google Cloud Console.

### ❌ "Invite code required"
**Solution**: This is normal for non-admin users. As admin, generate an invite code and share the full link with them.

## Need More Help?

See `SETUP.md` for detailed instructions or `PROJECT_SUMMARY.md` for technical details.
