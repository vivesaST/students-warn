# Answering the supervisor: make it genuinely rule-based, then re-document Chapter 4

## What the supervisor is right about

Verified in the code:

- `computeRiskScore()` in `supabase/functions/sync-github-data/index.ts` (lines 440-469) is a weighted sum — `score += min(20, daysSinceLastCommit * 3)` etc. There is no explicit IF-THEN rule anywhere in it.
- Only `generateRecommendations()` (line 471 onward) uses IF-THEN conditions, and it does not feed the score.
- Risk level is a single threshold line: `riskScore >= 65 ? "high" : >= 40 ? "moderate" : "low"`.

So the chapter's claim of a rule-based engine is not supported by the implementation. Part 1 fixes that in code; Part 2 rewrites the chapter around the fixed code.

## Part 1 — Build a real rule engine

Create a dedicated, screenshottable module: `supabase/functions/_shared/rule-engine.ts`.

It holds a declarative rule table — each rule an object with `id`, `category`, `description`, a `condition(features)` predicate, `points`, and a `message`. Example shape:

```text
{ id: "R1", category: "Inactivity",
  description: "IF days_since_last_commit >= 7 THEN add 25 risk points",
  condition: f => f.daysSinceLastCommit >= 7,
  points: 25,
  message: "No commits for a week or more" }
```

Roughly 15-18 rules covering the same 15 features already collected: inactivity bands, commit frequency, regularity, weekly volume, churn, commit-message quality, branch usage, merge frequency, issue activity.

The engine function evaluates every rule in order, collects the rules that fired, sums their points, clamps to 0-100, and applies explicit classification rules (IF score >= 65 THEN High, ELSE IF >= 40 THEN Moderate, ELSE Low). It returns `{ score, level, firedRules[] }` so the dashboard can show *why* a student is at risk.

Recommendation generation moves into the same file and is driven by the same fired rules, so each rule owns both its score contribution and its advice — this is the "source code implementing the recommendation generation logic" the supervisor asked for.

`sync-github-data/index.ts` then imports the engine instead of its own `computeRiskScore` / `generateRecommendations`, and the old functions are deleted.

Thresholds are chosen so current scores stay in the same ballpark; no database change is required (score and level columns are unchanged). Optionally the fired-rule list can be stored so the dashboard shows triggered rules — this needs one new column on `risk_assessments`, which I will include only if you want the dashboard evidence.

## Part 2 — Rewrite Chapter 4 with real evidence

Deliver a new `.docx` restructured to answer each comment directly:

- **4.2 Implementation environment** — plus placeholders for the GitHub repository link and the live URL, which you fill in once you push and deploy.
- **4.3.1 Authentication and authorisation** — expanded past "Supabase Auth": registration/login flow diagram, bcrypt password hashing performed by GoTrue (passwords never reach the app), JWT issue/refresh and session persistence in the browser client, and role validation on two levels — the `app_role` enum with `get_user_role()` and the RLS policies (`owns_course`, `is_my_student`) that scope every query server-side.
- **4.3.2 GitHub data ingestion pipeline** — split into four subsections instead of one paragraph: GitHub REST API calls made, the Edge Function orchestration and error handling, the database tables written (`student_features`, `daily_commits`, `weekly_commits`, `risk_assessments`, `recommendations`), and the dashboard consumption via TanStack Query.
- **4.3.3 Rule-Based Risk Assessment Engine** — retitled as requested, with the rule table listed in full, a code screenshot of `rule-engine.ts`, a code screenshot of the recommendation logic, and a dashboard screenshot showing the resulting classification.
- **4.4 Screenshots** — login, lecturer registration, student registration, create course, join course, GitHub sync operation, risk assessment result, plus the two code screenshots. Captured from the running app with Playwright.
- **4.5 Testing and evaluation** — rewritten honestly. The previous accuracy figures are not defensible, so they are replaced with: the pilot cohort (the students actually registered, stated as n), no train/test split because the engine is knowledge-based rather than trained, rule-by-rule validation against lecturer judgement, a confusion matrix over the pilot cohort with the arithmetic for precision/recall/F1 shown, and an explicit limitation that the sample is small and results are indicative only.

## Technical notes

- New file: `supabase/functions/_shared/rule-engine.ts` (declarative rules + evaluator + recommendation mapping).
- Edited: `supabase/functions/sync-github-data/index.ts` (import engine, delete the two local functions).
- No schema change unless you want fired rules persisted for the dashboard.
- The Edge Function redeploys automatically.
- Screenshots captured against the local preview; the document is generated with `python-docx` and page-checked before delivery.
