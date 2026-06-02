## Goal
Address the supervisor's feedback by inserting a dedicated **Slide 3.6 — Risk Assessment Methodology (Mathematical Formulation)** into the defense deck, showing the actual risk-scoring equation, variable definitions, weights, and classification thresholds. Math is taken directly from the implemented `computeRiskScore` function in `supabase/functions/sync-github-data/index.ts` so the slide matches the running system.

## What I'll add

### New Slide 3.6 — Risk Assessment Methodology
Inserted after the current Methodology slide (slide 11), before System Architecture.

**Title:** 3.6 Risk Assessment Methodology — Mathematical Formulation

**1. Risk Score Function**

The risk score `R(s)` for a student `s` is a bounded weighted sum of nine behavioural indicators, anchored at a neutral baseline of 50:

```
R(s) = clamp[0,100] (
        50
      + min(20, 3 · d_last)              ← inactivity penalty
      − min(15, 0.15 · S_reg)            ← regularity reward
      − min(15, 3 · C_week)              ← recent-activity reward
      − min(10, 10 · F_day)              ← frequency reward
      + min(10, 5  · χ)                  ← churn penalty
      − min(10, 0.1 · Q_msg)             ← message-quality reward
      − min(5,  1.5 · B)                 ← branching reward
      − min(5,  2 · M_freq)              ← merge-workflow reward
      − min(5,  2 · I_rate)              ← issue-engagement reward
   )
```

**2. Variable Definitions**

| Symbol | Variable | Source |
|---|---|---|
| d_last | Days since last commit | GitHub commits API |
| S_reg | Commit regularity score (0–100) | 100 − 15·σ(daily commits) |
| C_week | Commits in last 7 days | GitHub commits API |
| F_day | Mean commits per day | total_commits / days_span |
| χ | Code churn ratio | lines_deleted / lines_added |
| Q_msg | Commit-message quality (0–100) | % of messages > 10 chars |
| B | Distinct branches | GitHub branches API |
| M_freq | Merge commits per week | commits matching /merge/i ÷ weeks |
| I_rate | Issues opened per week | issues ÷ weeks |

**3. Weight Rationale**

Weights reflect predictive importance reported in Hellas et al. (2022) and Cui et al. (2022/2023):
- **High weight (≤ 20)** — inactivity, regularity, recent commits (strongest at-risk signals)
- **Medium weight (≤ 10)** — frequency, churn, message quality
- **Low weight (≤ 5)** — branching, merges, issue activity (workflow maturity)

Each term is capped via `min(·)` to prevent any single metric from dominating the score.

**4. Risk-Level Classification**

```
Level(s) = High     if R(s) ≥ 65
         = Moderate if 40 ≤ R(s) < 65
         = Low      if R(s) < 40
```

**5. Worked Example**

Student with d_last=5, S_reg=40, C_week=1, F_day=0.2, χ=0.6, Q_msg=55, B=1, M_freq=0.3, I_rate=0.2:

```
R = 50 + 15 − 6 − 3 − 2 + 3 − 5.5 − 1.5 − 0.6 − 0.4
  ≈ 49  →  Moderate Risk
```

## Update to existing Methodology slide (11)
Tighten the "Risk Scoring" bullet to: *"Risk Scoring: Weighted heuristic function R(s) combining 9 behavioural indicators (see Slide 3.6)."*

## Technical implementation
- Open the uploaded `.pptx` with `python-pptx`
- Duplicate the layout of slide 11 and insert the new slide at position 12
- Add equation as monospace text frame (Consolas 14pt) for readability
- Add variable table using `add_table`
- Update slide 11 bullet
- Save as `EarlyWarning_Defense_Presentation_v3.pptx` in `/mnt/documents/`
- QA: render to PDF via LibreOffice and inspect slides 11–13 as images for overflow/alignment

## Deliverable
`EarlyWarning_Defense_Presentation_v3.pptx` with the new Risk Assessment Methodology slide containing the explicit mathematical function, ready for defense.
