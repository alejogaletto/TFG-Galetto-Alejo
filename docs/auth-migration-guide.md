# Supabase Auth Migration Guide

This guide explains the authentication changes and how to use the new Supabase Auth system in your application.

## What Changed

### Before (Custom Auth)
- Custom User table with password hashing
- Manual session management with localStorage
- Custom login API endpoint (`/api/auth/login`)
- No OAuth support

### After (Supabase Auth)
- Supabase Auth's `auth.users` table for authentication
- Automatic session management
- Built-in OAuth support (Google, Apple)
- Password policy enforcement
- Better security with industry-standard practices

## Key Benefits

1. **Better Security**: Industry-standard OAuth2 flows, secure token management
2. **OAuth Support**: Easy integration with Google, Apple, and other providers
3. **Session Management**: Automatic token refresh, secure session handling
4. **Password Policies**: Enforced password requirements
5. **User Management**: Built-in admin tools in Supabase Dashboard
6. **Email Verification**: Built-in email confirmation flows

## Breaking Changes

### 1. User Authentication

**Old Way:**
```typescript
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
})
const { user } = await response.json()
localStorage.setItem("user", JSON.stringify(user))
```

**New Way:**
```typescript
const supabase = createBrowserClient()
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
// Session is automatically managed
```

### 2. User Registration

**Old Way:**
```typescript
await fetch("/api/users", {
  method: "POST",
  body: JSON.stringify({ email, password, name, configs }),
})
```

**New Way:**
```typescript
const supabase = createBrowserClient()
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name, company_name: companyName }
  }
})
```

### 3. Checking Authentication Status

**Old Way:**
```typescript
const userStr = localStorage.getItem("user")
const user = userStr ? JSON.parse(userStr) : null
```

**New Way:**
```typescript
const supabase = createBrowserClient()
const { data: { session } } = await supabase.auth.getSession()
const user = session?.user
```

### 4. Logout

**Old Way:**
```typescript
localStorage.removeItem("user")
router.push("/login")
```

**New Way:**
```typescript
const supabase = createBrowserClient()
await supabase.auth.signOut()
router.push("/login")
```

## Using Auth in Your Components

### Client Components

For client-side components (with "use client" directive):

```typescript
"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase-client"
import { User } from "@supabase/supabase-js"

export default function MyComponent() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!user) {
    return <div>Please log in</div>
  }

  return <div>Welcome, {user.email}</div>
}
```

### Server Components

For server-side components and API routes:

```typescript
import { createServerClient } from "@/lib/supabase-client"

export default async function ServerComponent() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect("/login")
  }

  return <div>Welcome, {session.user.email}</div>
}
```

### API Routes

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-client"

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Your logic here
  return NextResponse.json({ user: session.user })
}
```

## Password Policy

All new passwords must meet these requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number  
- At least 1 special symbol

Validation helpers:
```typescript
import { validatePassword, getPasswordRequirements } from "@/lib/password"

// Validate a password
const validation = validatePassword(password)
if (!validation.isValid) {
  console.log(validation.errors) // Array of error messages
}

// Get individual requirement status
const reqs = getPasswordRequirements(password)
console.log(reqs.minLength) // true/false
console.log(reqs.hasUppercase) // true/false
console.log(reqs.hasNumber) // true/false
console.log(reqs.hasSymbol) // true/false
```

## OAuth Integration

### Google Sign-In

```typescript
const supabase = createBrowserClient()

const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

### Apple Sign-In

```typescript
const supabase = createBrowserClient()

const { error } = await supabase.auth.signInWithOAuth({
  provider: "apple",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

## User Data Access

### Getting User Metadata

OAuth and signup data is stored in `user_metadata`:

```typescript
const supabase = createBrowserClient()
const { data: { user } } = await supabase.auth.getUser()

const name = user?.user_metadata?.name
const companyName = user?.user_metadata?.company_name
```

### Updating User Profile

```typescript
const supabase = createBrowserClient()

await supabase.auth.updateUser({
  data: {
    name: "New Name",
    company_name: "New Company",
  }
})
```

### Custom User Table

The application maintains a custom `User` table for additional profile data. After authentication, user profiles are created/updated in this table with the same ID as `auth.users`.

```typescript
// The User table is automatically populated during signup
// You can query it like:
const { data } = await supabase
  .from("User")
  .select("*")
  .eq("id", user.id)
  .single()
```

## Environment Variables

Ensure these are set in your `.env.local`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth (Optional - only if using Google APIs directly)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Migration Path for Existing Users

### Option 1: Password Reset Flow
Have existing users reset their passwords, which will migrate them to Supabase Auth.

### Option 2: One-Time Migration Script
Create a script to migrate existing users:

```typescript
import { createServerAdminClient } from "@/lib/supabase-client"

async function migrateUsers() {
  const supabase = createServerAdminClient()
  
  // Get users from old User table
  const { data: oldUsers } = await supabase
    .from("User")
    .select("*")
  
  for (const oldUser of oldUsers) {
    // Create Supabase Auth user
    await supabase.auth.admin.createUser({
      email: oldUser.email,
      email_confirm: true,
      user_metadata: {
        name: oldUser.name,
        company_name: oldUser.configs?.companyName,
      },
    })
  }
}
```

## Testing

### Test Signup
```bash
# Navigate to /signup
# Fill in the form with a valid email and password meeting requirements
# Should redirect to /dashboard after successful signup
```

### Test Login
```bash
# Navigate to /login
# Enter credentials
# Should redirect to /dashboard after successful login
```

### Test OAuth
```bash
# Click "Continue with Google" or "Continue with Apple"
# Authorize with your Google/Apple account
# Should redirect to /dashboard after successful OAuth
```

### Test Password Reset
```bash
# Navigate to /reset-password
# Enter your email
# Check email for reset link
# Click link and set new password
# Should redirect to /login
```

## Common Issues

### "Invalid refresh token" Error
- Session expired, user needs to log in again
- Clear browser storage and try again

### OAuth Redirect Loop
- Check that redirect URLs are properly configured
- Verify callback handler is deployed at `/auth/callback`

### Password Doesn't Meet Requirements
- Ensure password has: 8+ chars, 1 uppercase, 1 number, 1 symbol
- Check for common mistakes (spaces, copy-paste issues)

### User Not Found After OAuth
- Check that profile creation in User table didn't fail
- Check server logs for errors during signup

## Best Practices

1. **Always use `createBrowserClient()` in client components**
2. **Use `createServerClient()` in server components and API routes**
3. **Never expose service role key in client-side code**
4. **Always check for session before accessing protected routes**
5. **Use auth state listeners to keep UI in sync**
6. **Handle auth errors gracefully with user-friendly messages**

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OAuth Setup Guide](./oauth-setup.md)
- [Password Reset Flow](./setup-deployment.md)

