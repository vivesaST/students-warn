

## Plan: Clean Database, Make Everything Dynamic, Update Design

### 1. Clear All Seeded Data from Database

Use the Supabase insert tool (for DELETE operations) to remove all data from these tables in order:
- `recommendations`
- `daily_commits`, `weekly_commits`, `weekly_risk_history`
- `risk_assessments`, `student_features`
- `class_weekly_commits`
- `profiles` (all rows)
- `courses` (all rows)

This also clears the seeded auth users (they'll still exist in `auth.users` but their profiles will be gone — harmless).

### 2. Remove Hardcoded Fallbacks — Make Everything Dynamic

**Files to update:**

| File | Change |
|------|--------|
| `AppLayout.tsx` | Replace hardcoded "Software Engineering 2025" with dynamic course name fetched via `useCourse(profile?.course_id)` |
| `Sidebar.tsx` | Replace hardcoded `"Dr. Sarah Mitchell"` and `"Software Engineering 2025"` with values from `useCourse` hook; show "No course" if none |
| `InstructorDashboard.tsx` | Remove `?? "Software Engineering 2025"` and `?? "Dr. Sarah Mitchell"` fallbacks — show "Loading…" or empty if no course |
| `Auth.tsx` | Remove demo credentials box; change lecturer placeholder to "Dr Sadiq Umar" |

### 3. Fintech-Style Design Overhaul

Update `src/index.css` to replace the current dark analytics theme with a clean fintech aesthetic:

- **Background**: Very light gray (`210 20% 98%`) — clean, airy
- **Cards**: Pure white with subtle shadows instead of dark cards
- **Primary**: Deep indigo/violet (`243 75% 59%`) — fintech staple
- **Accent colors**: Teal for success, coral for danger, amber for warnings
- **Font**: Inter (add via Google Fonts in `index.html`)
- **Border radius**: Slightly rounder (`0.75rem`)
- **Borders**: Very subtle (`220 13% 91%`)
- **Scrollbar**: Lighter, minimal
- Remove the duplicate `:root` block and `.dark` block — single light theme
- Risk colors updated to fintech palette (deeper, more saturated)

Update `tailwind.config.ts` to use the Inter font family.

### 4. Remove Mock Data Dependency

The dashboard pages already use Supabase hooks (`useStudents`, `useCourse`, `useClassData`). The `import type { Student } from "@/data/mockData"` is only used as a TypeScript interface — this is fine since it's type-only. No mock data is actually rendered.

### Summary of Files Changed

1. **Database**: DELETE all rows from all tables (via insert tool)
2. `src/index.css` — Fintech light theme
3. `index.html` — Add Inter font
4. `tailwind.config.ts` — Inter font family
5. `src/components/layout/AppLayout.tsx` — Dynamic course name
6. `src/components/layout/Sidebar.tsx` — Dynamic names, remove hardcoded strings
7. `src/pages/InstructorDashboard.tsx` — Remove hardcoded fallbacks
8. `src/pages/Auth.tsx` — Remove demo credentials, update placeholder

