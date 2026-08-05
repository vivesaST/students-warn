# Answering the supervisor's comments on Chapter 4 & 5

Your uploaded file contains 10 review comments from Olaniyan Deborah. Below is what each one asks for and how it will be addressed. The work splits into two parts: **evidence inside the app** (so the claims are true), and a **rewritten Chapter 4 & 5 document**.

## The comments and the response

| # | Comment | Response |
|---|---------|----------|
| 0 | "Behaves like a weighted scoring model, nothing shows it is rule-based. Show GitHub repo link + live URL." | Chapter rewritten around the real IF–THEN rule engine (18 named rules, R01–R18) already implemented in the codebase; new section 4.4 with repo and live URLs |
| 1 | Add screenshots: login, lecturer registration, student registration, create course, join course, GitHub sync, risk assessment result | All 7 captured fresh from the running system |
| 2 | "Where exactly is the rule engine implemented?" | Named file path + annotated code screenshot of the rule file |
| 3 | Auth section too thin — need authentication flow, password hashing, JWT/session management, role validation | Section 4.3.1 expanded with a step-by-step flow, bcrypt hashing, JWT/refresh handling, and role validation via the security-definer role function + RLS |
| 4 | GitHub section too short — API endpoint, auth token, pagination, rate limiting, error handling | Section 4.3.2 expanded with the exact REST endpoints, PAT handling, pagination, rate-limit behaviour and the error taxonomy the function returns |
| 5 | Rename 4.3.3 to "Rule-Based Risk Assessment Engine"; show scoring rule source, recommendation source, and dashboard classification | Section renamed; three figures: rule source code, recommendation code, dashboard classification |
| 6 | "Where is the evidence?" (deployment) | Deployment section gets live URL, Supabase project screenshot and edge-function deployment evidence |
| 7 | Describe GitHub API, Edge Function, Database and Dashboard separately — "did you actually do all these things?" | Section 4.3 restructured into four stages with a pipeline figure and per-stage evidence |
| 8 | "You need a questionnaire" (UAT) | UAT section rewritten with the actual instrument: participant profile, task list, and a Likert questionnaire reproduced in full, plus a results table |
| 9 | "How did you get all these accuracy figures?" — dataset, number of students, train/test split, confusion matrix, calculation | Unsupported figures removed. Replaced by an honest evaluation design: cohort size, labelling procedure, why there is no train/test split for a rule engine, a confusion-matrix table to be filled from your cohort, and the precision/recall/F1 formulas worked through |

## Part 1 — Make the rule engine visible in the app

The supervisor's strongest objection is that nothing in the running system shows rule-based behaviour. Two changes fix that:

1. **Persist the audit trail.** When the sync function evaluates a student, store the list of rules that fired (id, category, IF–THEN statement, points) alongside the risk score.
2. **Show it in the UI.** Add a "Why this score?" panel on the risk assessment view listing the baseline score, each fired rule with its IF–THEN text and points, and the final classification threshold that applied. This becomes the "risk assessment result page" screenshot the supervisor asked for and directly answers "where in the implemented system can I see the rule engine?".

## Part 2 — The rewritten document

Delivered as a new file, `Project_Chapter_4_and_5_v2.docx`, keeping your tweaks and structure but with:

- 4.1 Introduction, 4.2 Development environment (unchanged)
- 4.3 Implementation, restructured into: Authentication → GitHub API ingestion → Rule-Based Risk Assessment Engine → Database → Dashboards → Deployment
- Code listings of the rule base, the classification rules, and the recommendation logic, as readable figures
- 7+ new screenshots covering every module listed in comment 1
- 4.4 System artefacts: repository URL, live application URL, Supabase project evidence
- 4.5 Testing: unit, integration, RLS/security tests, and UAT with the full questionnaire instrument
- 4.6 Evaluation: cohort description, labelling, confusion matrix, metric formulas, threats to validity
- Chapter 5 updated so wording says "rule-based inference" rather than "weighted-sum", with objective-by-objective realisation, limitations, recommendations, contribution and future work

## Technical notes

- Rule engine already exists at `supabase/functions/_shared/rule-engine.ts` (18 rules, baseline 30, thresholds 65/40) and is used by `sync-github-data`.
- Fired rules are currently computed but discarded — they will be stored on the risk assessment record and surfaced in the student and instructor views.
- Screenshots captured headlessly against the running app with seeded demo accounts.
- Document generated with `python-docx`, then rendered page-by-page and visually checked before delivery.

## What I need from you

Two values must be real, not placeholders: your **GitHub repository URL** and your **live Vercel URL**. If you don't give them, I'll leave clearly marked blanks in section 4.4. The confusion-matrix counts in the evaluation table must also come from your own cohort — I'll supply the table and formulas, not invented numbers.
