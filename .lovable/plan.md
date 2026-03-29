

## Generate EarlyWarn Documentation Package (DOCX + PPTX)

Two downloadable files covering the full platform overview and student user guide.

### Document 1: DOCX -- "EarlyWarn Platform Guide"

**Sections:**
1. **What is EarlyWarn?** -- Early warning system for software engineering courses that monitors GitHub activity to predict project failure risk
2. **Why it Matters** -- Students fall behind silently; instructors can't monitor 50-200+ students manually; early intervention prevents failure
3. **How it Works** -- Students link GitHub, system syncs commits/branches/issues, computes 15 behavioral metrics, calculates risk score (0-100), generates recommendations
4. **The 15 Tracked Metrics** -- Table listing: commit frequency, regularity score, days since last commit, code churn ratio, branch count, merge frequency, commit message quality, lines added/deleted, avg commit size, issue creation rate, etc.
5. **Risk Score Explained** -- How the 0-100 score is computed (high-weight: inactivity + regularity + weekly commits; medium: frequency + churn + message quality; low: branches + merges + issues); thresholds for Low/Moderate/High
6. **Student Guide** -- Step-by-step: sign up, enter full name/email/password, link GitHub username + repo URL, view dashboard (risk banner, metrics vs class average, radar chart, risk trend, commit timeline, contributing factors, recommendations)
7. **Instructor Guide** -- Overview dashboard with KPIs, risk donut chart, commit timeline, student table with search/filter/sort, individual student profiles, Sync GitHub button, analytics page
8. **AI Recommendations** -- How the system generates personalized action items based on metric thresholds

### Document 2: PPTX -- "EarlyWarn Overview" (8-10 slides)

1. **Title slide** -- "EarlyWarn: Student Risk Detection System" with tagline
2. **The Problem** -- Students fall behind silently, instructors can't track everyone, failures are preventable
3. **How EarlyWarn Works** -- 3-step flow: Link GitHub -> Analyze Metrics -> Get Insights
4. **15 Behavioral Metrics** -- Grid/icons showing the key tracked features
5. **Risk Scoring** -- Visual of 0-100 scale with Low/Moderate/High zones
6. **Student Dashboard** -- Description of what students see (risk banner, comparisons, recommendations)
7. **Instructor Dashboard** -- KPIs, charts, student table overview
8. **AI Recommendations** -- Example recommendations with priority levels
9. **Getting Started** -- Step-by-step for students to begin

### Technical Approach

- DOCX: Generate using `docx` npm library with proper styles, headings, tables, and bullet lists
- PPTX: Generate using `pptxgenjs` with a bold color palette (Midnight Executive: navy `1E2761`, ice blue `CADCFC`, white) and Georgia/Calibri font pairing
- Both output to `/mnt/documents/`
- QA: Convert both to images, inspect every page/slide before delivery

