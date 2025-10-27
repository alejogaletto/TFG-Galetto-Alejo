# OAuth Authentication Setup Guide

This guide walks you through configuring Google and Apple OAuth providers for user authentication with Supabase Auth.

## Overview

The application now uses Supabase Auth's built-in OAuth functionality for user authentication. This provides:
- Secure authentication flow
- Automatic session management
- Built-in user management
- Password policy enforcement
- Easy integration with multiple providers

## Prerequisites

- Supabase project created and configured
- Environment variables set up (see main setup docs)
- OAuth callback handler deployed (`/app/auth/callback/route.ts`)

## Google OAuth Configuration

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application** as the application type
6. Configure the following:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
```

7. Note down the **Client ID** and **Client Secret**

### 2. Configure in Supabase Dashboard

1. Open your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **Authentication > Providers**
3. Find **Google** in the list and enable it
4. Enter your Google OAuth credentials:
   - **Client ID**: Your Google Client ID
   - **Client Secret**: Your Google Client Secret
5. Save the configuration

### 3. Update Environment Variables (Optional)

If you need to access Google APIs beyond authentication (like Google Sheets), add these to your `.env.local`:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Note:** For user authentication, Supabase Auth handles the OAuth flow, so these env vars are only needed if you're using Google APIs directly.

### 4. Test Google Login

1. Go to `/login` or `/signup` page
2. Click "Continuar con Google"
3. Authorize the application
4. You should be redirected to `/dashboard` after successful authentication

## Apple OAuth Configuration

### 1. Apple Developer Account Setup

1. Ensure you have an active [Apple Developer Account](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**

### 2. Create an App ID

1. Go to **Identifiers**
2. Click the **+** button to register a new identifier
3. Select **App IDs** and click Continue
4. Select **App** and click Continue
5. Configure:
   - **Description**: Your app name (e.g., "AutomateSMB")
   - **Bundle ID**: Use explicit App ID (e.g., `com.yourcompany.automatesmb`)
   - **Capabilities**: Check **Sign in with Apple**
6. Click Continue and Register

### 3. Create a Services ID

1. Go to **Identifiers** and click **+**
2. Select **Services IDs** and click Continue
3. Configure:
   - **Description**: Your service name (e.g., "AutomateSMB Web")
   - **Identifier**: Your service ID (e.g., `com.yourcompany.automatesmb.web`)
4. Click Continue and Register
5. Find your new Services ID in the list and click on it
6. Enable **Sign in with Apple**
7. Click **Configure** next to Sign in with Apple
8. Configure domains and return URLs:
   - **Domains and Subdomains**:
     ```
     your-production-domain.com
     <your-supabase-project-ref>.supabase.co
     ```
   - **Return URLs**:
     ```
     https://your-production-domain.com/auth/callback
     https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
     ```
9. Click Save, then Continue, then Register

### 4. Create a Private Key

1. Go to **Keys** and click **+**
2. Configure:
   - **Key Name**: e.g., "Sign in with Apple Auth Key"
   - **Enable**: Check **Sign in with Apple**
   - Click **Configure** and select your primary App ID
3. Click Continue and Register
4. **Download the key file** (you can only download it once)
5. Note down:
   - **Key ID** (shown after creation)
   - **Team ID** (found in the top right of the developer console)

### 5. Configure in Supabase Dashboard

1. Open your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **Authentication > Providers**
3. Find **Apple** in the list and enable it
4. Enter your Apple OAuth credentials:
   - **Services ID**: Your Services ID (e.g., `com.yourcompany.automatesmb.web`)
   - **Team ID**: Your Apple Team ID
   - **Key ID**: The Key ID from your downloaded key
   - **Private Key**: Open the downloaded `.p8` file and paste its entire contents
5. Save the configuration

### 6. Test Apple Login

1. Go to `/login` or `/signup` page
2. Click "Continuar con Apple"
3. Authorize the application with your Apple ID
4. You should be redirected to `/dashboard` after successful authentication

## OAuth Callback Flow

The OAuth callback is handled by `/app/auth/callback/route.ts`:

```typescript
// Simplified flow
1. User clicks "Continue with Google/Apple"
2. Browser redirects to OAuth provider
3. User authorizes the application
4. OAuth provider redirects to: /auth/callback?code=xxx
5. Callback handler exchanges code for session
6. User is redirected to /dashboard
```

## Password Policy

When users sign up with email/password (not OAuth), they must meet these requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special symbol (!@#$%^&*()_+-=[]{};':"\\|,.<>/?)

## User Profile Management

After successful OAuth authentication:
1. Supabase creates an entry in `auth.users`
2. The application creates a matching profile in the `User` table
3. User metadata (name, company_name) is stored in `auth.users.user_metadata`
4. Additional profile data can be stored in the `User` table

## Troubleshooting

### "OAuth provider not configured" Error

- Verify that the provider is enabled in Supabase Dashboard
- Check that all credentials are correctly entered
- Ensure there are no trailing spaces in credential fields

### Redirect URI Mismatch

- Verify that all redirect URIs are added to both:
  - OAuth provider console (Google/Apple)
  - Match exactly (including http/https and trailing slashes)

### Session Not Created After Callback

- Check browser console for errors
- Verify `/app/auth/callback/route.ts` is deployed
- Check Supabase logs in the Dashboard

### Testing Locally

For local development with OAuth:
1. Use `http://localhost:3000/auth/callback` as redirect URI
2. Add `localhost:3000` to authorized domains
3. Some providers (like Apple) may not work on localhost - use a tunneling service like ngrok

## Security Considerations

1. **Never commit OAuth secrets** to version control
2. Use different OAuth apps for development and production
3. Regularly rotate OAuth secrets
4. Monitor failed authentication attempts in Supabase Dashboard
5. Set up rate limiting for authentication endpoints

## Migration from Custom Auth

If you have existing users with the old authentication system:
1. Users can reset their password to migrate to Supabase Auth
2. Or implement a one-time migration script
3. OAuth users will automatically create new accounts

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)

