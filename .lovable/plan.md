

## Plan: Generate Defense Presentation (PPTX) for EarlyWarn Project

This will create a downloadable `.pptx` file with 20 slides covering all requested sections, using bold headers and 23pt body text.

### Design
- **Palette**: Midnight Executive — Navy (`1E2761`), Ice Blue (`CADCFC`), White (`FFFFFF`), Accent Gold (`F9C846`)
- **Headers**: 36-44pt, bold, white on dark backgrounds
- **Body text**: 23pt as requested
- **Font**: Arial throughout

### Slides (20 total)

1. **Title** — "EarlyWarn: Student Risk Detection System" + subtitle "Project Defense Presentation"
2. **Introduction** — Overview of the platform
3. **Problem Statement** — Students fail silently, no early warning
4. **Aim and Objectives** — Primary aim + 4-5 objectives
5. **Significance of the Study** — Why this matters
6. **Scope of the Study** — What the system covers
7. **Limitation of the Study** — Known constraints
8. **Literature Review** — Summary of related work
9. **Literature Review (Table)** — Tabular comparison of existing systems
10. **Research Gap** — What existing systems miss
11. **Methodology** — Approach taken (agile, data pipeline, scoring)
12. **System Architecture** — Text description of architecture layers
13. **System Architecture Diagram** — Built-in chart/visual showing components
14. **Logical Design Diagram** — Data flow description
15. **Class Diagram** — Key entities and relationships
16. **Technology Used** — React, Supabase, TypeScript, Recharts, etc.
17. **Key Features** — 15 metrics, risk scoring, dashboards, GitHub sync
18. **Expected Outcome** — What the system delivers
19. **Timeline** — Project phases with dates
20. **Conclusion** — Summary and future work

### Implementation
- Single Node.js script using `pptxgenjs`
- Output to `/mnt/documents/EarlyWarn_Defense_Presentation.pptx`
- QA via LibreOffice PDF conversion + image inspection

### Files
- `/tmp/gen_defense.js` — generation script (ephemeral)
- `/mnt/documents/EarlyWarn_Defense_Presentation.pptx` — final output

