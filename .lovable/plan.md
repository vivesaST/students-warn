
## Early Warning System — UI Plan

A full-featured dark analytics dashboard with two role-based views (Instructor & Student), powered by realistic mock data and Recharts visualizations.

---

### Pages & Routes

| Route | Description |
|---|---|
| `/` | Role selector (switch between Instructor / Student view) |
| `/instructor` | Instructor dashboard |
| `/instructor/student/:id` | Individual student profile |
| `/student` | Student personal dashboard |

---

### Design System
- **Dark theme** throughout: `#0f172a` base, `#1e293b` cards, slate borders
- **Risk colors**: Red (high), Amber (moderate), Green (low)
- **Accent**: Sky blue `#38bdf8` for interactive elements
- Update `index.css` with a dark color palette

---

### Shared Layout
- **Sidebar navigation** with role badge (Instructor / Student)
- Role toggle in header to switch views (simulating login switch)
- Breadcrumb for drill-down pages

---

### Instructor Dashboard (`/instructor`)

**Top stats row** (4 KPI cards):
- Total Students enrolled
- High-risk count (red)
- Moderate-risk count (amber)
- Avg. commits this week

**Charts row:**
1. **Risk Distribution Donut** — high/moderate/low breakdown
2. **Commit Activity Timeline** — stacked bar chart, last 8 weeks, class aggregate

**Student Table** (sortable + filterable by risk level):
- Student name, avatar initials, course, risk level badge, last commit date, commit count, prediction score, "View Profile" button

---

### Individual Student Profile (`/instructor/student/:id`)
- Header: name, course, risk badge, GitHub URL
- **Risk Trend Line Chart** — weekly risk score over 12 weeks
- **Radar Chart** — 6 behavioral features vs class average (commit frequency, regularity, branch usage, issue resolution, code churn, message quality)
- **Commit Activity Bar Chart** — daily commits last 30 days
- **Metrics grid**: 15 prediction features with values and comparison arrows
- **AI Recommendations panel** — 3 actionable recommendations based on risk factors

---

### Student Dashboard (`/student`)
- **Personal risk level banner** — large risk badge with explanation text
- **Behavioral metrics grid** — personal vs class average for 6 key metrics
- **Radar Chart** — same as instructor view but from student perspective
- **Commit Activity Timeline** — personal activity last 8 weeks
- **Risk Trend Chart** — own risk score progression
- **Recommendations cards** — personalized action items (e.g., "Commit more regularly", "Use feature branches")
- **Contributing factors list** — top 3 features pushing risk up/down

---

### Mock Data
- **1 course**: "Software Engineering 2025"
- **12 students**: mix of high (3), moderate (5), low (4) risk
- **12 weeks of history** per student with realistic commit patterns
- All 15 prediction features populated per student

---

### Components to create
- `src/pages/Index.tsx` — role selector landing
- `src/pages/InstructorDashboard.tsx`
- `src/pages/StudentProfile.tsx`
- `src/pages/StudentDashboard.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/dashboard/RiskBadge.tsx`
- `src/components/dashboard/KPICard.tsx`
- `src/components/dashboard/RiskDonutChart.tsx`
- `src/components/dashboard/CommitTimelineChart.tsx`
- `src/components/dashboard/RiskTrendChart.tsx`
- `src/components/dashboard/RadarChart.tsx`
- `src/components/dashboard/StudentTable.tsx`
- `src/components/dashboard/RecommendationsPanel.tsx`
- `src/data/mockData.ts` — all mock students, courses, features, predictions
- Install `recharts` for all charts
