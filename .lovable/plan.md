

## Plan: Generate Chapter 3 DOCX — System Design and Methodology

Create an 18-page academic DOCX document for Chapter 3 of the EarlyWarn project, with embedded Mermaid-to-image diagrams.

### Content Sections (mapped to the codebase)

| Section | Source |
|---------|--------|
| 3.1 System Overview & Justification | App.tsx routes, project purpose |
| 3.2 Requirements | DB schema (profiles, student_features, risk_assessments), AuthGuard, RLS policies |
| 3.3 Methodology | Agile/Scrum framing for the project |
| 3.4 Architecture | 3-tier: React frontend, Supabase Edge Functions, PostgreSQL. Includes high-level diagram, component descriptions, logical design diagram |
| 3.5 Languages & Tools | React 18, TypeScript 5, Vite 5, Tailwind CSS, Supabase, Recharts, TanStack Query, Deno |
| 3.6 Database Design | ER diagram from actual schema (8 tables: profiles, courses, student_features, risk_assessments, daily_commits, weekly_commits, weekly_risk_history, recommendations, class_weekly_commits), indexes |
| 3.7 Software Modules | Auth module (AuthGuard + Supabase Auth), Data Collection (sync-github-data edge function), Feature Engineering (15 metrics computed in edge function), ML Module (risk scoring algorithm) |
| 3.8 Security | RLS policies, SECURITY DEFINER functions, JWT auth, service_role separation |
| 3.9 Summary | Chapter wrap-up |

### Diagrams (generated as PNG via Mermaid CLI)

1. **High-Level Architecture Diagram** (Section 3.4.1) — 3-tier showing Browser, Supabase Edge Functions, PostgreSQL
2. **Logical Design / Data Flow Diagram** (Section 3.4.3) — GitHub API to Feature Extraction to Risk Scoring to Dashboard
3. **Entity-Relationship Diagram** (Section 3.6.1) — All 9 tables with relationships
4. **Component Diagram** (Section 3.7) — Auth, Data Collection, Feature Engineering, Risk Scoring modules

### Formatting

- **Font**: Times New Roman (academic standard)
- **Headings**: Bold, 14pt for chapter title, 13pt for major sections, 12pt for subsections
- **Body text**: 12pt, 1.5 line spacing, justified
- **Page size**: A4 with 1-inch margins
- **Target**: 18 pages

### Implementation Steps

1. Install dependencies (`docx`, `@mermaid-js/mermaid-cli` or use mermaid-js via puppeteer)
2. Generate 4 diagram PNGs from Mermaid definitions
3. Build the DOCX with `docx` npm package, embedding diagram images
4. Output to `/mnt/documents/EarlyWarn_Chapter3_System_Design.docx`
5. Convert to PDF for visual QA, inspect all pages

### Output

- `/mnt/documents/EarlyWarn_Chapter3_System_Design.docx`

