
## Making EarlyWarn Fully Functional with Supabase

### What's Currently Static (needs to become real)
- All student/course data lives in `mockData.ts` — hardcoded
- No authentication — anyone can access either role by just clicking
- The "Switch Role" is a simple React state toggle with no real user identity
- `StudentDashboard` is hardcoded to `students[0]` (Marcus Chen)
- `AppLayout` header hardcodes "DS" / "MC" initials

### Full Plan

---

#### Phase 1 — Database Schema (migrations)

Create these tables in Supabase:

**`courses`** — course info
- `id`, `name`, `instructor_name`, `start_date`, `end_date`

**`profiles`** — linked to `auth.users`, stores role
- `id` (= auth uid), `full_name`, `email`, `role` (enum: `instructor` | `student`), `github_username`, `github_url`, `course_id`

**`student_features`** — the 15 ML features per student
- `id`, `student_id` (→ profiles), `course_id`, all 15 feature columns

**`risk_assessments`** — risk score + level per student (current + history)
- `id`, `student_id`, `risk_score`, `risk_level`, `assessed_at`

**`weekly_risk_history`** — 12-week trend per student
- `id`, `student_id`, `week_label`, `risk_score`, `assessed_at`

**`daily_commits`** — per-day commit count
- `id`, `student_id`, `commit_date`, `commit_count`

**`weekly_commits`** — per-week aggregate
- `id`, `student_id`, `week_label`, `commits`, `lines_added`, `lines_deleted`

**`recommendations`** — per-student action items
- `id`, `student_id`, `priority`, `title`, `description`, `icon`

RLS policies:
- Instructors can read all rows for their course
- Students can only read their own rows
- Uses `profiles.role` to gate access

---

#### Phase 2 — Authentication

Add login/signup page at `/auth`:
- Email + password sign-in via Supabase Auth
- On successful login, read `profiles.role` → redirect to `/instructor` or `/student`
- Protect `/instructor`, `/student`, `/instructor/student/:id` behind auth check
- `AppLayout` header shows real name + initials from profile
- `App.tsx` role state driven by `profiles.role` from DB, not client toggle

---

#### Phase 3 — Seed Data

Insert all 12 mock students as real Supabase users + profile rows, plus all their features, risk history, commits, and recommendations. This replaces `mockData.ts` with real DB-backed data via `@supabase/supabase-js` queries.

---

#### Phase 4 — Replace Mock Data with Real Queries (React hooks)

Create `src/hooks/` query hooks using TanStack Query:
- `useStudents(courseId)` → replaces `students` array
- `useStudent(id)` → replaces `students.find()`
- `useCourse(id)` → replaces `course` object
- `useCurrentStudentProfile()` → replaces `currentStudent` (reads from auth session)
- `useClassAverageFeatures(courseId)` → computed from `student_features`

Update all pages:
- `InstructorDashboard` → `useStudents()` + `useCourse()`
- `StudentProfile` → `useStudent(id)` with `useParams`
- `StudentDashboard` → `useCurrentStudentProfile()` (real logged-in student)
- `Index` → `useStudents()` for stats (or read from courses table)

---

#### Phase 5 — UI wiring

- `AppLayout` header: show real user name/initials from auth session + profile
- `Sidebar` footer: show real `profiles.full_name` and role
- Remove all imports of `mockData.ts` from pages (keep types only)
- Add loading skeletons while queries are fetching
- Add error states for failed queries

---

### Files to create/edit

| Action | File |
|---|---|
| New migration | `supabase/migrations/` — full schema |
| Edit | `src/App.tsx` — auth state, protected routes |
| New | `src/pages/Auth.tsx` — login/signup page |
| New | `src/hooks/useStudents.ts` |
| New | `src/hooks/useStudent.ts` |
| New | `src/hooks/useCourse.ts` |
| New | `src/hooks/useCurrentStudent.ts` |
| Edit | `src/pages/InstructorDashboard.tsx` |
| Edit | `src/pages/StudentProfile.tsx` |
| Edit | `src/pages/StudentDashboard.tsx` |
| Edit | `src/pages/Index.tsx` |
| Edit | `src/components/layout/AppLayout.tsx` |
| Edit | `src/components/layout/Sidebar.tsx` |
| New | `src/components/auth/AuthGuard.tsx` |

The `mockData.ts` types stay (reused by hooks), but the data exports are replaced by DB queries.
