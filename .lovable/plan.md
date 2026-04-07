

## Fix: Signup Profile Creation & Post-GitHub "Waiting for Sync" State

There are two bugs visible from the network logs:

### Problem 1: Profile never gets created on signup
During signup, the profile INSERT fails with RLS error `42501`. This happens because `supabase.auth.signUp()` doesn't immediately authenticate the user — the user must confirm their email first. So `auth.uid()` is null when the upsert runs, and the RLS policy `auth.uid() = id` blocks it.

**Result**: User confirms email, logs in, but their profile row doesn't exist. Every subsequent query returns 0 rows.

### Problem 2: After saving GitHub info, student sees nothing useful
The student dashboard checks `useStudent()` which queries `student_features`. Since no sync has run yet, `student_features` has no rows. The `useStudent` hook returns data with all-zero features, but the dashboard shows the full analytics view with empty charts — or worse, the profile query itself fails because no profile exists (Problem 1).

---

### Fix Plan

**Step 1: Create a database trigger to auto-create profiles on signup**

Create a migration with a trigger function on `auth.users` that automatically inserts a row into `profiles` whenever a new user signs up. This runs as `SECURITY DEFINER` so RLS doesn't block it.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Step 2: Update Auth.tsx signup to pass full_name in user metadata**

Change the `signUp` call to include `full_name` in `options.data` so the trigger can read it. Remove the manual profile upsert since the trigger handles it.

**Step 3: Add a "Waiting for Sync" state in StudentDashboard**

When the profile exists and has `github_username` set but `useStudent` returns data with all-zero features (no `student_features` row yet), show a friendly "Your data is being synced" message instead of empty charts. This tells the user to wait for the next GitHub sync or trigger one manually.

**Step 4: Fix the useProfile hook to handle missing profile gracefully**

Use `.maybeSingle()` instead of `.single()` so it returns `null` instead of throwing when the profile doesn't exist yet (race condition between trigger and first query).

---

### Files Changed
1. **New migration SQL** — trigger on `auth.users` to auto-create profiles
2. **`src/pages/Auth.tsx`** — pass `full_name` in metadata, remove manual upsert
3. **`src/pages/StudentDashboard.tsx`** — add "waiting for sync" state when GitHub is linked but no features exist
4. **`src/hooks/useProfile.ts`** — use `.maybeSingle()` for resilience

