## Plan: Restructure Chapter 3 to Match Required Outline

I will generate a new DOCX (`Chapter3_System_Design_Methodology_v3.docx`) that reorganises the existing content into the exact section structure you specified, fills in missing sections, and keeps all the substantive material from the current draft (functional/non-functional requirements tables, sprint table, ERD, schema, scoring algorithm, security, etc.).

### Final Section Structure

```
3.0 Introduction
    - Overview of the chapter
    - Link to research objectives
    - Outline of sections

3.1 System Overview
    3.1.1 Description of the Proposed System
    3.1.2 Justification of the System

3.2 Research Methodology
    3.2.1 Research Design
    3.2.2 Data Collection Method
        - Source of data (GitHub REST API v3)
        - Types of data (commits, branches, issues, PRs, metadata)
        - Data acquisition process
    3.2.3 Dataset Description
        - Volume, granularity, time window, schema of raw vs derived data

3.3 System Requirements
    3.3.1 Functional Requirements
        - Data collection
        - Feature extraction
        - Prediction (risk scoring)
        - Dashboard (student + instructor)
    3.3.2 Non-Functional Requirements
        - Performance, Usability, Security, Scalability

3.4 System Architecture and Design
    3.4.1 Architecture Overview (3-tier description)
    3.4.2 Architecture Diagram
    3.4.3 Data Flow Diagram (DFD)
    3.4.4 Use Case Diagram
    3.4.5 Sequence Diagram

3.5 Database Design
    3.5.1 Entity-Relationship Diagram
    3.5.2 Database Schema
        - Tables and relationships
        - Sample table structure (profiles, courses, student_features,
          risk_assessments, recommendations, daily/weekly_commits)

3.6 Machine Learning Methodology
    3.6.1 Feature Engineering (15 metrics: commit frequency, regularity,
          churn, branch count, merge frequency, message quality, etc.)
    3.6.2 Risk Scoring Model (weighted algorithm, baseline 50, tiered weights)
    3.6.3 Classification Thresholds (low / moderate / high)
    3.6.4 Recommendation Generation Rules

3.7 Software Development Methodology
    3.7.1 Agile / Scrum Approach
    3.7.2 Sprint Planning Summary (existing 8-sprint table)
    3.7.3 Continuous Integration and Testing

3.8 System Security
    - Authentication, RLS policies, role-based access, secrets management

3.9 Chapter Summary
```

### Source Material Mapping

| New section | Source in current draft |
|---|---|
| 3.1 | Existing 3.1.1 / 3.1.2 (System Overview + Justification) |
| 3.2 | NEW — research design, GitHub data sources, dataset description |
| 3.3 | Existing 3.2.1 / 3.2.2 tables (FR-01…FR-10, NFR-01…) |
| 3.4.1–3.4.3 | Existing architecture + DFD figures and descriptions |
| 3.4.4–3.4.5 | NEW — Use case + sequence (described textually + Mermaid-style ASCII) |
| 3.5 | Existing ERD + schema tables (pages 14–16) |
| 3.6 | Existing feature list + scoring algorithm (pages 19–20) reorganised under ML methodology |
| 3.7 | Existing Agile section + sprint table |
| 3.8 | Existing System Security section |
| 3.9 | Existing chapter summary |

### Style & Formatting

- Times New Roman 12pt, 1.5 line spacing (academic standard, matches existing doc)
- Numbered headings, bold section titles
- Preserve all existing tables (Functional Reqs, Non-Functional Reqs, Sprint Plan, Schema)
- Add captions: Table 3.x and Figure 3.x
- US Letter, 1" margins

### Technical Implementation

1. Generate the document with `docx-js` (Node) following the existing style.
2. Write to `/mnt/documents/Chapter3_System_Design_Methodology_v3.docx`.
3. QA by converting to PDF + page images via LibreOffice, inspecting every page for layout issues, and fixing any overflow/clipping before delivery.
4. Deliver as a `<lov-artifact>` for download.

### Out of Scope

- No code/app changes (this is a document-only task).
- Diagrams (3.4.2–3.4.5, 3.5.1) will be described and represented as labelled ASCII/box diagrams inside the doc, since the original embedded image figures are not regenerated. If you'd prefer rendered Mermaid/PNG diagrams embedded, say so and I'll add that step.
