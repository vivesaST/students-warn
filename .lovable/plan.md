

## Fix: Student GitHub Form Access, Empty Pages, and Profile Creation

### Problems Identified

1. **Student Dashboard stuck on loading** — `useStudent` hook calls `.single()` on `student_features` and `risk_assessments`, which throws an error when no rows exist yet. The `if (isLoading || !student)` guard at line 97 blocks the entire page, including the GitHub form.

2. **No profile created on signup** — `Auth.tsx` calls `supabase.auth.signUp()` but never inserts a row into `profiles`. New users get no profile, so all hooks return null.

3. **Students and Analytics sidebar links are dead** — Both point to `/instructor` (same as Dashboard). There are no separate `/instructor/students` or `/instructor/analytics` routes.

### Plan

**File 1: `src/hooks/useStudent.ts`** — Make resilient to missing data
- Change `.single()` calls on `student_features` and `risk_assessments` to `.maybeSingle()` so they return `null` instead of throwing when no rows exist
- This allows the Student Dashboard to render even before the first GitHub sync

**File 2: `src/pages/StudentDashboard.tsx`** — Show GitHub form when no data exists
- Change the loading guard: if `profile` exists but `student` is null (no features yet), render the GitHub form and a message like "Link your GitHub to get started" instead of an infinite spinner
- Keep the loading spinner only for `isLoading === true`

**File 3: `src/pages/Auth.tsx`** — Create profile on signup
- After successful `signUp`, insert a profile row with `id = user.id`, `full_name` (derived from email or a new name field), `email`, and `role = 'student'`
- Add a "Full Name" input field to the signup form

**File 4: `src/pages/InstructorStudents.tsx`** (new) — Dedicated students list page
- Extract the `StudentTable` section from `InstructorDashboard` into its own page at route `/instructor/students`
- Full-page view with search, filters, and the student table

**File 5: `src/pages/InstructorAnalytics.tsx`** (new) — Dedicated analytics page
- Show the `RiskDonutChart`, `CommitTimelineChart`, and risk trend data in a full analytics layout at `/instructor/analytics`

**File 6: `src/App.tsx`** — Add new routes
- Add `/instructor/students` and `/instructor/analytics` routes

**File 7: `src/components/layout/Sidebar.tsx`** — Fix nav URLs
- Change Students link from `/instructor` to `/instructor/students`
- Change Analytics link from `/instructor` to `/instructor/analytics`

### Technical Details

- `maybeSingle()` returns `{ data: null, error: null }` when no row is found, unlike `single()` which throws a `PGRST116` error
- The signup profile insert uses the authenticated user's ID from the signup response
- New pages reuse existing hooks (`useStudents`, `useClassWeeklyCommits`, `useProfile`, `useCourse`)

