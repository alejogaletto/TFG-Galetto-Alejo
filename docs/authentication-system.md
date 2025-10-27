# Authentication System

This document provides a comprehensive overview of the authentication system implemented in AutomateSMB.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Files Structure](#files-structure)
- [Documentation](#documentation)

## Overview

AutomateSMB uses **Supabase Auth** as the authentication backend, providing secure, scalable user authentication with support for email/password and OAuth providers (Google, Apple).

### Why Supabase Auth?

- ✅ Industry-standard security practices
- ✅ Built-in OAuth support
- ✅ Automatic session management
- ✅ Email verification
- ✅ Password reset flows
- ✅ User management dashboard
- ✅ Row Level Security (RLS) integration

## Features

### ✨ Core Features

1. **Email/Password Authentication**
   - Secure password hashing
   - Password policy enforcement
   - Email verification (optional)

2. **OAuth Authentication**
   - Google Sign-In
   - Apple Sign-In
   - Automatic account linking

3. **Password Policy**
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 number
   - At least 1 special symbol
   - Real-time validation UI

4. **Password Recovery**
   - Email-based password reset
   - Secure token validation
   - Password policy enforcement on reset

5. **Session Management**
   - Automatic token refresh
   - Secure HTTP-only cookies
   - Client and server-side session access

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │   Login    │  │   Signup   │  │  Reset Password  │  │
│  │   Page     │  │    Page    │  │      Page        │  │
│  └─────┬──────┘  └─────┬──────┘  └────────┬─────────┘  │
│        │                │                   │            │
│        └────────────────┴───────────────────┘            │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │   Supabase Auth (Authentication)    │
        │  ┌──────────────────────────────┐   │
        │  │  Email/Password Auth         │   │
        │  │  OAuth Providers (Google,    │   │
        │  │  Apple)                      │   │
        │  │  Session Management          │   │
        │  │  Token Refresh               │   │
        │  └──────────────────────────────┘   │
        └────────────┬────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────────────────┐
        │     Database (Supabase Postgres)    │
        │  ┌──────────────────────────────┐   │
        │  │  auth.users (managed by      │   │
        │  │  Supabase)                   │   │
        │  │                              │   │
        │  │  User (custom profile table) │   │
        │  └──────────────────────────────┘   │
        └─────────────────────────────────────┘
```

### Data Flow

1. **Signup Flow:**
   ```
   User fills form → Validate password → Create auth user → Create profile → Auto login → Dashboard
   ```

2. **Login Flow:**
   ```
   User enters credentials → Validate with Supabase → Create session → Dashboard
   ```

3. **OAuth Flow:**
   ```
   Click OAuth button → Redirect to provider → Authorize → Callback → Create/link account → Dashboard
   ```

4. **Password Reset Flow:**
   ```
   Request reset → Send email → Click link → Validate token → Set new password → Login
   ```

## Quick Start

### For Users

1. **Sign Up:**
   - Go to `/signup`
   - Fill in name, email, company name, and password
   - Password must meet policy requirements (shown in real-time)
   - Or click "Continue with Google/Apple" for OAuth

2. **Login:**
   - Go to `/login`
   - Enter email and password
   - Or use Google/Apple OAuth

3. **Reset Password:**
   - Click "Recuperar contraseña" on login page
   - Enter your email
   - Check email for reset link
   - Click link and set new password

### For Developers

1. **Check Auth Status:**
   ```typescript
   import { useAuth } from "@/hooks/use-auth"
   
   function MyComponent() {
     const { user, loading, signOut } = useAuth()
     
     if (loading) return <div>Loading...</div>
     if (!user) return <div>Please log in</div>
     
     return <button onClick={signOut}>Sign Out</button>
   }
   ```

2. **Require Authentication:**
   ```typescript
   import { useRequireAuth } from "@/hooks/use-auth"
   
   function ProtectedPage() {
     const { user, loading } = useRequireAuth()
     // Automatically redirects to /login if not authenticated
     
     if (loading) return <div>Loading...</div>
     return <div>Welcome {user.email}</div>
   }
   ```

3. **Server-Side Auth:**
   ```typescript
   import { createServerClient } from "@/lib/supabase-client"
   
   export default async function ServerPage() {
     const supabase = createServerClient()
     const { data: { session } } = await supabase.auth.getSession()
     
     if (!session) redirect("/login")
     
     return <div>Server-side auth check passed</div>
   }
   ```

## Files Structure

```
app/
├── login/
│   └── page.tsx                 # Login page with email/password and OAuth
├── signup/
│   └── page.tsx                 # Signup page with password validation
├── reset-password/
│   ├── page.tsx                 # Request password reset
│   └── update/
│       └── page.tsx             # Set new password
├── auth/
│   └── callback/
│       └── route.ts             # OAuth callback handler
└── api/
    ├── auth/
    │   ├── login/
    │   │   └── route.ts         # (Legacy) Login API - can be deprecated
    │   └── google/              # Google OAuth for Sheets integration (separate)
    │       ├── route.ts
    │       └── callback/
    │           └── route.ts
    └── users/
        └── route.ts             # User profile management

lib/
├── supabase-client.ts           # Supabase client factory functions
└── password.ts                  # Password validation utilities

hooks/
└── use-auth.tsx                 # React hooks for auth state management

docs/
├── authentication-system.md     # This file
├── oauth-setup.md              # OAuth configuration guide
└── auth-migration-guide.md     # Migration and usage guide
```

## Documentation

### Setup & Configuration

- **[OAuth Setup Guide](./oauth-setup.md)** - Complete guide for configuring Google and Apple OAuth
- **[Setup & Deployment](./setup-deployment.md)** - General application setup including auth environment variables

### Development

- **[Auth Migration Guide](./auth-migration-guide.md)** - How to use the auth system in your code
- **[API Endpoints](./api-endpoints.md)** - API documentation including auth endpoints

### Key Components

#### Password Validation (`lib/password.ts`)

```typescript
// Validate password against policy
validatePassword(password: string): PasswordValidationResult

// Get individual requirement status
getPasswordRequirements(password: string): PasswordRequirements
```

#### Supabase Client (`lib/supabase-client.ts`)

```typescript
// Browser client (respects RLS)
createBrowserClient(): SupabaseClient

// Server client (respects RLS)
createServerClient(): SupabaseClient

// Admin client (bypasses RLS)
createServerAdminClient(): SupabaseClient
```

#### Auth Hooks (`hooks/use-auth.tsx`)

```typescript
// Get auth state
useAuth(): UseAuthReturn

// Require authentication (auto-redirect)
useRequireAuth(): UseAuthReturn
```

## Environment Variables

Required environment variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OAuth (optional - only if using Google APIs directly)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

## Security Considerations

1. **Never expose service role key** - Only use in server-side code
2. **Always validate sessions** - Check auth state before accessing protected resources
3. **Use RLS policies** - Leverage Supabase Row Level Security for database access
4. **Rotate OAuth secrets** - Regularly update OAuth credentials
5. **Monitor auth logs** - Check Supabase Dashboard for suspicious activity
6. **HTTPS only** - Always use HTTPS in production

## Testing

### Manual Testing Checklist

- [ ] Sign up with email/password
- [ ] Sign up with Google OAuth
- [ ] Sign up with Apple OAuth
- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Login with Apple OAuth
- [ ] Request password reset
- [ ] Reset password with valid token
- [ ] Try weak password (should reject)
- [ ] Try mismatched passwords (should reject)
- [ ] Sign out
- [ ] Access protected page without login (should redirect)

### Automated Testing

```bash
# Run tests (when implemented)
npm test
```

## Troubleshooting

### Common Issues

1. **"OAuth provider not configured"**
   - Solution: Configure provider in Supabase Dashboard

2. **"Invalid refresh token"**
   - Solution: Session expired, user needs to log in again

3. **Password validation fails**
   - Solution: Ensure password meets all requirements (8+ chars, 1 uppercase, 1 number, 1 symbol)

4. **OAuth redirect loop**
   - Solution: Check redirect URLs in OAuth provider console

5. **Session not persisting**
   - Solution: Check browser cookie settings, ensure HTTPS in production

### Debug Mode

Enable auth debugging:
```typescript
const supabase = createBrowserClient()
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event)
  console.log("Session:", session)
})
```

## Roadmap

Future enhancements:

- [ ] Two-factor authentication (2FA)
- [ ] Magic link authentication
- [ ] Social login with GitHub, Microsoft
- [ ] Admin user management UI
- [ ] Audit logs for security events
- [ ] Custom email templates
- [ ] Multi-language support for auth pages

## Support

For issues or questions:
1. Check this documentation
2. Review [Supabase Auth docs](https://supabase.com/docs/guides/auth)
3. Check application logs
4. Contact development team

## License

This authentication system is part of the AutomateSMB application.

