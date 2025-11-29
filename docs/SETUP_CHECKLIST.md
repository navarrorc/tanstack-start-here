# Setup Checklist ✅

Use this checklist to ensure you've completed all setup steps correctly.

## Prerequisites
- [ ] Node.js 18+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Git installed (optional)

## Step 1: NeonDB Setup
- [ ] Created account at https://neon.tech
- [ ] Created new project named "invite-auth-app"
- [ ] Copied connection string (starts with `postgresql://`)
- [ ] Copied pooled connection string (has `-pooler` in URL)
- [ ] Both connection strings saved somewhere safe

## Step 2: Google OAuth Setup
- [ ] Went to https://console.cloud.google.com/apis/credentials
- [ ] Created or selected a project
- [ ] Configured OAuth consent screen
  - [ ] Chose "External" user type
  - [ ] Added app name
  - [ ] Added user support email
  - [ ] Added developer contact email
  - [ ] Added scopes: openid, profile, email
- [ ] Created OAuth 2.0 Client ID
  - [ ] Type: Web application
  - [ ] Added redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Copied Client ID (ends with `.apps.googleusercontent.com`)
- [ ] Copied Client Secret (starts with `GOCSPX-`)

## Step 3: Environment Configuration
- [ ] Opened `.env.local` file in the project
- [ ] Replaced `DATABASE_URL` with NeonDB connection string
- [ ] Replaced `VITE_DATABASE_URL` with NeonDB connection string
- [ ] Replaced `VITE_DATABASE_URL_POOLER` with NeonDB pooled connection string
- [ ] Replaced `GOOGLE_CLIENT_ID` with your Client ID
- [ ] Replaced `GOOGLE_CLIENT_SECRET` with your Client Secret
- [ ] Verified `GOOGLE_REDIRECT_URI` is `http://localhost:3000/api/auth/callback/google`
- [ ] Saved the file

## Step 4: Database Setup
- [ ] Ran `pnpm install` (if not already done)
- [ ] Ran `pnpm db:push` successfully
- [ ] No errors appeared
- [ ] Saw message about tables being created

## Step 5: Start the App
- [ ] Ran `pnpm dev`
- [ ] Server started on http://localhost:3000
- [ ] No errors in terminal
- [ ] Opened http://localhost:3000 in browser
- [ ] Landing page loaded successfully

## Step 6: First Login (Become Admin)
- [ ] Clicked "Get Started" button
- [ ] Redirected to login page
- [ ] Clicked "Continue with Google"
- [ ] Redirected to Google sign-in
- [ ] Signed in with Google account
- [ ] Redirected back to app
- [ ] Landed on dashboard
- [ ] See "Admin" badge next to name

## Step 7: Test Invite System
- [ ] On dashboard, entered an email address
- [ ] Clicked "Generate" button
- [ ] Invite code appeared in table below
- [ ] Clicked "Copy Link" button
- [ ] Link copied to clipboard
- [ ] Opened link in incognito/private window
- [ ] Invite code pre-filled in login page
- [ ] (Optional) Tested signing up with invited email

## Verification
- [ ] Can log in and out successfully
- [ ] Admin dashboard shows invite generation form
- [ ] Can generate invite codes
- [ ] Invite codes appear in the table
- [ ] Can copy invite links
- [ ] Logout works and redirects to home

## If Something Went Wrong

### Database Push Failed
- Check that `.env.local` has real NeonDB URLs (not placeholders)
- Verify NeonDB project is active
- Try running `pnpm db:push` again

### OAuth Error
- Verify redirect URI in Google Console matches exactly
- Check Client ID and Secret are correct in `.env.local`
- Make sure OAuth consent screen is configured

### Can't Access Dashboard
- Clear browser cookies
- Try logging out and back in
- Check browser console for errors

### Invite Code Not Working
- Verify email matches the invited email exactly
- Check that code hasn't been used already
- Generate a new code if needed

## Success! 🎉

If all items are checked, your app is fully set up and working!

You can now:
- ✅ Log in with Google
- ✅ Generate invite codes as admin
- ✅ Invite other users
- ✅ Manage your user base

## Next Steps

Consider adding:
- Email notifications for invites
- User profile pages
- Activity logs
- Additional admin features
- Custom branding

See `PROJECT_SUMMARY.md` for more enhancement ideas!
