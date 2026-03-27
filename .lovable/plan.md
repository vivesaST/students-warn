

## GitHub API Integration for Real Student Data

### How it works

Students sign up and enter their GitHub username + repository URL in their profile. A scheduled Edge Function runs daily (via `pg_cron`), fetches each student's commit data from the GitHub REST API, and updates the database tables. The instructor sees fresh data on their dashboard without any manual work.

```text
┌──────────┐     ┌──────────────────┐     ┌────────────┐     ┌──────────┐
│ Students │────▶│ profiles table   │────▶│ Edge Func  │────▶│ GitHub   │
│ (signup) │     │ github_username  │     │ (scheduled)│     │ REST API │
└──────────┘     │ github_url       │     └─────┬──────┘     └──────────┘
                 └──────────────────┘           │
                                                ▼
                                    ┌───────────────────────┐
                                    │ daily_commits          │
                                    │ weekly_commits         │
                                    │ student_features       │
                                    │ risk_assessments       │
                                    │ weekly_risk_history    │
                                    │ recommendations        │
                                    └───────────────────────┘
```

### Step 1 — Store a GitHub Personal Access Token (secret)

A single GitHub PAT (with `repo` read scope) is stored as a Supabase secret `GITHUB_PAT`. This token is used by the Edge Function to call the GitHub API (avoids the 60 req/hr unauthenticated limit, gets 5,000 req/hr instead).

### Step 2 — Create `sync-github-data` Edge Function

This function:
1. Queries `profiles` for all students with a `github_username`
2. For each student, calls GitHub's REST API:
   - `GET /users/{username}/events` — recent push events
   - `GET /repos/{owner}/{repo}/commits` — commit history with stats
   - `GET /repos/{owner}/{repo}/branches` — branch count
   - `GET /repos/{owner}/{repo}/issues` — issue tracking
3. Computes the 15 behavioral features from raw API data (commit frequency, regularity, churn, etc.)
4. Upserts into `daily_commits`, `weekly_commits`, `student_features`, and `profiles` (updating `total_commits`, `commits_this_week`, `last_commit_date`)
5. Runs a simple risk scoring formula on the features to produce `risk_score` + `risk_level`, inserts into `risk_assessments` and `weekly_risk_history`
6. Generates recommendations based on feature thresholds (same logic as current mock data)

### Step 3 — Schedule with `pg_cron`

A cron job calls the Edge Function once daily (e.g., 2 AM UTC):
```sql
SELECT cron.schedule('sync-github-daily', '0 2 * * *', $$
  SELECT net.http_post(
    url := 'https://antbykdmufaooxsnzsbv.supabase.co/functions/v1/sync-github-data',
    headers := '{"Authorization": "Bearer <anon_key>"}'::jsonb,
    body := '{}'::jsonb
  );
$$);
```

### Step 4 — Add "Sync Now" button for instructor

Add a button on the Instructor Dashboard that manually triggers the Edge Function so the instructor can refresh data on-demand without waiting for the daily cron.

### Step 5 — Student profile: GitHub field

On signup or in the Student Dashboard, students enter/update their `github_username` and `github_url` (repo link). The profile page gets an edit form for these fields.

### Files to create/edit

| Action | File |
|---|---|
| New | `supabase/functions/sync-github-data/index.ts` — main sync logic |
| SQL insert | `pg_cron` schedule (via SQL editor, not migration) |
| Edit | `src/pages/InstructorDashboard.tsx` — add "Sync Now" button |
| Edit | `src/pages/StudentDashboard.tsx` — add GitHub username/repo edit form |
| Secret | `GITHUB_PAT` — added via Supabase secrets |

### Risk scoring formula (built into the Edge Function)

Uses the same thresholds from the mock data to compute risk:
- High weight: `days_since_last_commit`, `commit_regularity_score`, `commits_last_week`
- Medium weight: `commit_frequency_per_day`, `code_churn_ratio`, `commit_message_quality_score`
- Low weight: `branch_count`, `merge_frequency`, `issue_creation_rate`

Score 0-100 where higher = more at risk. Thresholds: 0-39 = low, 40-64 = moderate, 65-100 = high.

### What the user needs to provide

A GitHub Personal Access Token (classic) with `repo` read access. This will be stored as a Supabase secret.

