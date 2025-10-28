# Authentication Temporarily Disabled

## Current Status
Authentication has been temporarily disabled for development purposes to avoid login prompts when refreshing the page (F5).

## What's Changed

### 1. `lib/auth-context.tsx`
- `isAuthenticated` is set to `true` by default
- Default user is set to HR agent (`hragent`)
- `login()` function always returns `true`
- `logout()` function does nothing
- localStorage check is commented out

### 2. `components/protected-route.tsx`
- Authentication check is commented out
- No redirect to login page
- Always renders children components

## How to Re-enable Authentication

### Step 1: Restore `lib/auth-context.tsx`
```typescript
// Change this line:
const [isAuthenticated, setIsAuthenticated] = useState(true)
// Back to:
const [isAuthenticated, setIsAuthenticated] = useState(false)

// Change this line:
const [user, setUser] = useState<{ username: string; email: string; role: 'hr' | 'bpcm' } | null>({
  username: "hragent",
  email: "hragent@mobifone.vn",
  role: "hr" as const
})
// Back to:
const [user, setUser] = useState<{ username: string; email: string; role: 'hr' | 'bpcm' } | null>(null)

// Uncomment the useEffect localStorage check
// Uncomment the login function logic
// Uncomment the logout function logic
```

### Step 2: Restore `components/protected-route.tsx`
```typescript
// Uncomment the authentication check in useEffect:
if (!isAuthenticated) {
  router.push("/login")
  return
}

// Uncomment the render check:
if (!isAuthenticated) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}
```

## Login Credentials (when re-enabled)
- **HR Agent**: `hragent` / `1`
- **BPCM**: `bpcm` / `1`

## Benefits of Current Setup
- ✅ No login prompts when refreshing (F5)
- ✅ Direct access to HR Agent page
- ✅ Faster development workflow
- ✅ No localStorage dependency

## When to Re-enable
- Before production deployment
- When testing authentication flows
- When demonstrating login functionality
- When role-based access control is needed
