

## Remove Favicon & Update .lovable/plan.md

### Change 1: Delete `public/favicon.ico`
Remove the default Lovable favicon file. The browser will simply show no custom icon (or you can add your own EarlyWarn icon later).

### Change 2: Update `.lovable/plan.md`
Replace the current Lovable-branded rebrand plan with an EarlyWarn project plan that reflects the actual project scope:

```
## EarlyWarn — Project Plan

Student Risk Detection System for Software Engineering Courses.

### Core Features
- GitHub activity sync (commits, branches, issues)
- 15 behavioral metric tracking
- Risk score computation (0–100)
- Student & Instructor dashboards
- AI-generated recommendations

### Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Edge Functions)
- Recharts for data visualization
```

Two quick changes — no functional code affected.

