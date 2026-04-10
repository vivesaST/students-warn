

## Plan: Role-Specific Registration and Remove Role Switching

### Summary
Update the signup flow so users register as either Student or Lecturer with role-specific fields, update the DB trigger to handle course creation/linking, and remove the manual role-switch button from the sidebar.

### 1. Database Migration — Update `handle_new_user` trigger

Replace the existing trigger function with the version from the earlier conversation:
- Reads `role` from signup metadata (defaults to `student`)
- For `instructor`: creates a new course row and links the profile to it
- For `student`: links to an existing course via `course_id` from metadata
- Uses `ON CONFLICT DO UPDATE` to handle edge cases

### 2. Update Auth.tsx — Role-specific signup form

- Add a role toggle (Student / Lecturer) in signup mode
- **Lecturer signup**: show "Full Name" + "Course Name" fields; pass `role: 'instructor'` and `course_name` in signup metadata
- **Student signup**: show "Full Name" + "Course Code" dropdown (fetched from `courses` table); pass `role: 'student'` and `course_id` in metadata
- Fetch available courses from Supabase to populate the dropdown (public select policy needed)

### 3. Database Migration — Allow anon to read courses

Add an RLS policy so the signup form can list available courses:
```sql
CREATE POLICY "Anyone can view courses" ON public.courses
  FOR SELECT TO anon USING (true);
```

### 4. Remove `onRoleSwitch` from Sidebar and AppLayout

- **Sidebar.tsx**: Remove the "Student View" switch button and the `onRoleSwitch` prop
- **AppLayout.tsx**: Remove `onRoleSwitch` from props interface

### 5. Update all pages that pass `onRoleSwitch`

Remove `onRoleSwitch` prop and the `handleRoleSwitch` function from:
- `InstructorDashboard.tsx`
- `InstructorStudents.tsx`
- `InstructorAnalytics.tsx`
- `StudentDashboard.tsx`
- `StudentProfile.tsx`

### 6. Update App.tsx — Auto-redirect by role

Update the `/` route: instead of showing the Index page, redirect to `/instructor` or `/student` based on the user's profile role.

### Files Changed

| File | Change |
|------|--------|
| Migration SQL | New `handle_new_user` trigger + anon courses policy |
| `src/pages/Auth.tsx` | Role toggle, course name/code fields, updated metadata |
| `src/components/layout/Sidebar.tsx` | Remove `onRoleSwitch` prop and switch button |
| `src/components/layout/AppLayout.tsx` | Remove `onRoleSwitch` from props |
| `src/pages/InstructorDashboard.tsx` | Remove `onRoleSwitch` usage |
| `src/pages/InstructorStudents.tsx` | Remove `onRoleSwitch` usage |
| `src/pages/InstructorAnalytics.tsx` | Remove `onRoleSwitch` usage |
| `src/pages/StudentDashboard.tsx` | Remove `onRoleSwitch` usage |
| `src/pages/StudentProfile.tsx` | Remove `onRoleSwitch` usage |
| `src/pages/Index.tsx` | Auto-redirect based on role |

