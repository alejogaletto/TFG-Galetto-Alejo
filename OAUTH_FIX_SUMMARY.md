# OAuth Authentication Fix - Deployment Guide

## What Was Fixed

### Root Cause
The cookie parsing errors (`"base64-eyJ"... is not valid JSON`) were caused by using two different Supabase client libraries:
- **Client-side**: `@supabase/auth-helpers-nextjs` (old, deprecated)
- **Server-side**: `@supabase/ssr` (new, recommended)

These packages handle cookies differently, causing parse failures and breaking authentication.

### Changes Made

#### 1. Standardized Supabase Client (`lib/supabase-client.ts`)
- ✅ Replaced `createClientComponentClient` from `@supabase/auth-helpers-nextjs`
- ✅ Now uses `createBrowserClient` from `@supabase/ssr` for consistent cookie handling
- ✅ Both client and server now use the same cookie format

#### 2. Enhanced OAuth Callback (`app/auth/callback/route.ts`)
- ✅ Added comprehensive logging for production debugging
- ✅ Improved error handling with specific error messages
- ✅ Better profile creation logic
- ✅ Environment-aware redirects (works in both prod and local)

#### 3. Environment Detection (`lib/auth-helpers.ts`)
- ✅ Added `getBaseUrl()` utility for automatic environment detection
- ✅ Prioritizes: `window.location.origin` > `NEXT_PUBLIC_VERCEL_URL` > `localhost:3000`

#### 4. Profile Page Improvements (`app/dashboard/profile/page.tsx`)
- ✅ Added retry logic for session loading
- ✅ Better error messages when session fails
- ✅ Catches cookie parsing errors and attempts session refresh

#### 5. Server-Side Auth Protection (`app/dashboard/profile/layout.tsx`)
- ✅ New server component that checks auth before rendering
- ✅ Prevents redirect loops and flash of unauthenticated content

## Testing Instructions

### Before Testing
Make sure your Supabase Dashboard is configured correctly:

1. **Go to Supabase Dashboard** → Authentication → URL Configuration

2. **For Production Testing:**
   - Site URL: `https://v0-low-code-web-platform-alejogalettos-projects.vercel.app`
   - Redirect URLs must include: `https://v0-low-code-web-platform-alejogalettos-projects.vercel.app/auth/callback`

3. **For Local Testing:**
   - Temporarily change Site URL to: `http://localhost:3000`
   - Redirect URLs must include: `http://localhost:3000/auth/callback`

4. **In Google Cloud Console:**
   - Add both callback URLs to Authorized redirect URIs:
     - `https://v0-low-code-web-platform-alejogalettos-projects.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`

### Testing Checklist

#### Production Testing (Priority)

1. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Fix OAuth authentication with consistent cookie handling"
   git push origin main
   ```

2. **Test New User Registration:**
   - Open: `https://v0-low-code-web-platform-alejogalettos-projects.vercel.app/signup`
   - Click "Conectar con Google"
   - Select a NEW email (not previously registered)
   - Should redirect to: `/onboarding`
   - Fill company name
   - Should redirect to: `/dashboard`
   - **Expected logs in Vercel:**
     ```
     [OAuth Callback] Starting callback handler
     [OAuth Callback] Code present: true
     [OAuth Callback] Session created for user: [uuid]
     [OAuth Callback] No profile found, creating new profile...
     [OAuth Callback] Profile created successfully
     [OAuth Callback] Redirecting to onboarding (no company name)
     ```

3. **Test Returning User Login:**
   - Open: `https://v0-low-code-web-platform-alejogalettos-projects.vercel.app/login`
   - Click "Conectar con Google"
   - Select the SAME email you just registered
   - Should redirect DIRECTLY to: `/dashboard`
   - **Expected logs:**
     ```
     [OAuth Callback] Existing profile found
     [OAuth Callback] Redirecting to dashboard
     ```

4. **Test Profile Page:**
   - Click "Mi Perfil" in dashboard
   - Should load profile WITHOUT redirecting to login
   - No cookie parsing errors in browser console
   - **Expected logs:**
     ```
     [Profile Layout] User authenticated: [uuid]
     [Profile] Loading profile...
     [Profile] User session found: [uuid]
     ```

5. **Test Data Isolation (RLS):**
   - With User A logged in, create a Form
   - Log out
   - Log in with User B (different Google account)
   - User B should NOT see User A's forms
   - Each user sees only their own data

#### Local Testing (Secondary)

1. **Change Supabase Site URL** to `http://localhost:3000`

2. **Start local dev server:**
   ```bash
   npm run dev:app-only
   ```

3. **Run same tests as production:**
   - New user registration → onboarding → dashboard
   - Returning user login → dashboard
   - Profile page loads correctly
   - No cookie errors

4. **Change Site URL back** to production when done

## What to Look For

### ✅ Success Indicators
- No cookie parsing errors in browser console
- OAuth redirects work smoothly (no loops)
- Profile page loads without redirect to login
- Console logs show clear flow progression
- Multiple users see only their own data

### ❌ Failure Indicators
- Browser console: `Failed to parse cookie string`
- Redirect loops (login → callback → login)
- Profile page immediately redirects to login
- OAuth users see other users' data

## Troubleshooting

### Issue: Still seeing cookie parsing errors
**Solution:** 
- Clear all browser cookies for the domain
- Try in incognito mode
- Verify `@supabase/ssr` is installed: `npm list @supabase/ssr`

### Issue: OAuth redirects to wrong environment
**Solution:**
- Check Supabase Dashboard → Site URL matches current environment
- Verify callback URL in Google Cloud Console

### Issue: Profile page redirect loop
**Solution:**
- Check browser console for specific error
- Look for logs: `[Profile Layout]` and `[Profile]`
- Session might not be persisting - check Supabase logs

### Issue: OAuth users see other users' data
**Solution:**
- RLS policies might not be applied
- Run: `supabase/migrations/add_rls_policies.sql`
- Verify in Supabase SQL Editor:
  ```sql
  SELECT tablename, policyname FROM pg_policies 
  WHERE schemaname = 'public' 
  ORDER BY tablename;
  ```

## Next Steps After Successful Testing

1. ✅ Mark the last todo as completed
2. 🎉 OAuth authentication is now production-ready
3. 🔒 Users are properly isolated with RLS
4. 📊 Monitor Vercel logs for any issues
5. 🧹 Optional: Remove `@supabase/auth-helpers-nextjs` from package.json (no longer needed)

## Environment Variables Checklist

Ensure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_VERCEL_URL` (automatically set by Vercel)

## Logs to Monitor

Production logs will show:
- `[OAuth Callback]` - OAuth flow progression
- `[Profile Layout]` - Server-side auth checks
- `[Profile]` - Client-side profile loading

These logs are production-safe (no sensitive data) and will help debug any issues.

---

**Questions or Issues?** Check the logs first, then review the troubleshooting section above.

