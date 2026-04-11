

## Plan: Fix "Redirecting to dashboard" Infinite Spinner

### Root Cause

The database was truncated (profiles deleted), but the old auth user (`instructor@uni.edu`) still exists in `auth.users`. On login, `handle_new_user` doesn't fire (it only triggers on signup). So the profile query returns `[]`, `profile` is `null`, and the redirect never happens.

### Fix (two parts)

**1. Index.tsx — Handle missing profile gracefully**

Add a fallback: if loading is done and profile is `null`, sign the user out and redirect to `/auth`. This handles orphaned auth users cleanly.

```tsx
useEffect(() => {
  if (!isLoading && profile) {
    navigate(profile.role === "instructor" ? "/instructor" : "/student", { replace: true });
  } else if (!isLoading && !profile && session) {
    // Orphaned auth user with no profile — sign out
    supabase.auth.signOut().then(() => navigate("/auth", { replace: true }));
  }
}, [isLoading, profile, navigate, session]);
```

**2. (Optional) Delete the orphaned auth user**

The old `instructor@uni.edu` user has no profile. After this fix, logging in with it will auto-sign-out. The user can then re-register fresh with the new signup flow.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Add sign-out + redirect when profile is missing |

