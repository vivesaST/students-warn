import { FiredRule, RiskLevel } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { ScrollText } from "lucide-react";

interface RuleAuditPanelProps {
  firedRules?: FiredRule[];
  baselineScore?: number;
  riskScore: number;
  riskLevel: RiskLevel;
  title?: string;
}

const THRESHOLDS: Record<RiskLevel, string> = {
  high: "IF risk_score >= 65 THEN risk_level = HIGH",
  moderate: "IF risk_score >= 40 THEN risk_level = MODERATE",
  low: "IF risk_score < 40 THEN risk_level = LOW",
};

/**
 * Displays the audit trail of the rule-based inference cycle: the baseline
 * score, every IF-THEN production rule that fired, the points it asserted,
 * and the terminal classification rule that produced the final risk level.
 */
export function RuleAuditPanel({
  firedRules,
  baselineScore = 30,
  riskScore,
  riskLevel,
  title = "Why this score? — Rule engine audit trail",
}: RuleAuditPanelProps) {
  const rules = firedRules ?? [];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <ScrollText className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Every point in the score comes from a named IF-THEN production rule evaluated against this
        student's GitHub activity. No statistical model is used.
      </p>

      {rules.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4">
          No rule audit trail recorded yet. Run a GitHub sync to evaluate this student.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
            <div>
              <p className="text-xs font-medium text-foreground">Baseline risk (no rule fired)</p>
              <p className="text-[10px] text-muted-foreground font-mono">BASELINE_RISK</p>
            </div>
            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
              {baselineScore}
            </span>
          </div>

          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {rule.id}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {rule.category}
                  </span>
                </div>
                <p className="mt-1 text-xs font-mono text-foreground break-words">{rule.statement}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-xs font-semibold tabular-nums",
                  rule.points > 0
                    ? "text-[hsl(var(--risk-high))]"
                    : "text-[hsl(var(--risk-low))]"
                )}
              >
                {rule.points > 0 ? `+${rule.points}` : rule.points}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
            <p className="text-xs font-semibold text-foreground">Accumulated risk score</p>
            <span className="text-xs font-bold tabular-nums text-foreground">{riskScore}</span>
          </div>

          <div className="rounded-lg border border-dashed border-border px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
              Terminal classification rule
            </p>
            <p className="text-xs font-mono text-foreground">{THRESHOLDS[riskLevel]}</p>
          </div>
        </div>
      )}
    </div>
  );
}
