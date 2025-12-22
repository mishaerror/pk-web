# Auth Context Update - Fix for Nav Not Updating

## Problem

After successful OAuth login and redirect to dashboard, the navigation header still showed "Login" button instead of merchant name and "Logout" button. It only updated after a page refresh.

## Root Cause

The `Nav` component was reading directly from `localStorage`, which doesn't trigger React re-renders when values change. When `OAuthCallback` updated localStorage, React had no way to know the Nav component needed to re-render.

## Solution

Implemented **React Context API** for centralized authentication state management.

## What Was Changed

### 1. Created AuthContext (`src/contexts/AuthContext.jsx`)

A new context provider that:
- Manages authentication state in React state (not just localStorage)
- Provides `setAuth()` to update auth state
- Provides `clearAuth()` to clear auth state
- Automatically syncs with localStorage
- Triggers re-renders when auth state changes

### 2. Updated App.jsx

- Wrapped entire app with `<AuthProvider>`
- Updated `Nav` component to use `useAuth()` hook
- Now reads `isAuthenticated` and `merchantName` from context (not localStorage)
- Nav automatically re-renders when auth state changes

### 3. Updated OAuthCallback.jsx

- Uses `setAuth(merchant)` to update auth state after successful login
- This updates both React state AND localStorage
- Triggers immediate re-render of Nav component

### 4. Updated ProtectedRoute.jsx

- Uses `useAuth()` to check authentication status
- Uses `clearAuth()` when session is invalid
- More reactive to auth state changes

### 5. Updated api.js logout()

- Removed localStorage clearing and redirect from logout function
- Now only calls backend `/logout` endpoint
- Component handles state clearing via `clearAuth()`

## How It Works Now

### Login Flow:
```
1. User clicks "Sign in with Google"
2. OAuth flow completes
3. OAuthCallback receives user data
4. OAuthCallback calls setAuth(merchant)
   ↓
5. AuthContext updates React state
   ↓
6. Nav component re-renders immediately
   ↓
7. Shows merchant name and Logout button
8. Redirects to dashboard
```

### Logout Flow:
```
1. User clicks "Logout"
2. Nav calls logout() (backend)
3. Nav calls clearAuth() (context)
   ↓
4. AuthContext clears React state
   ↓
5. Nav re-renders immediately
   ↓
6. Shows Login button
7. Redirects to /login
```

## Benefits

✅ **Immediate UI updates** - No page refresh needed
✅ **Centralized state** - Single source of truth for auth
✅ **Automatic re-renders** - Components update when auth changes
✅ **Better UX** - Nav updates instantly after login/logout
✅ **Cleaner code** - No manual localStorage reads in components

## Usage in Components

### Get auth state:
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, merchantName, merchantEmail } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome, {merchantName}!</p>}
    </div>
  );
}
```

### Update auth state:
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { setAuth } = useAuth();
  
  const handleLogin = (userData) => {
    setAuth(userData); // Updates state + localStorage
  };
}
```

### Clear auth state:
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { clearAuth } = useAuth();
  
  const handleLogout = () => {
    clearAuth(); // Clears state + localStorage
  };
}
```

## Files Modified

- ✨ `src/contexts/AuthContext.jsx` - New context provider
- ✏️ `src/App.jsx` - Wrapped with AuthProvider, Nav uses useAuth
- ✏️ `src/pages/OAuthCallback.jsx` - Uses setAuth() instead of direct localStorage
- ✏️ `src/components/ProtectedRoute.jsx` - Uses useAuth() and clearAuth()
- ✏️ `src/utils/api.js` - Simplified logout() function

## Testing

1. **Login**: Click "Sign in with Google" → Nav should update immediately after redirect
2. **Logout**: Click "Logout" → Nav should update immediately
3. **Refresh**: Refresh page → Auth state persists (from localStorage)
4. **Protected Routes**: Try accessing /dashboard without login → Redirects to /login

## Notes

- Auth state is stored in BOTH React context (for reactivity) AND localStorage (for persistence)
- Context is the source of truth during runtime
- localStorage is used to restore state on page load
- All components should use `useAuth()` hook, not direct localStorage access

