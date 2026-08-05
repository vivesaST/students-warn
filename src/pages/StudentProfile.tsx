import { useParams } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { AppLayout } from "@/components/layout/AppLayout";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { RiskTrendChart } from "@/components/dashboard/RiskTrendChart";
import { FeatureRadarChart } from "@/components/dashboard/RadarChart";
import { CommitBarChart } from "@/components/dashboard/CommitTimelineChart";
import { RecommendationsPanel } from "@/components/dashboard/RecommendationsPanel";
import { useStudent } from "@/hooks/useStudent";
import { useProfile } from "@/hooks/useProfile";
import { useClassAverageFeatures } from "@/hooks/useClassData";
import { ArrowUp, ArrowDown, Minus, ExternalLink, Github, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentProfileProps {
  session: Session | null;
}

const featureLabels: Record<string, { label: string; unit: string; higherIsBetter: boolean }> = {
  commitFrequencyPerDay: { label: "Commit Freq / Day", unit: "/day", higherIsBetter: true },
  commitFrequencyPerWeek: { label: "Commit Freq / Week", unit: "/wk", higherIsBetter: true },
  commitRegularityScore: { label: "Regularity Score", unit: "/100", higherIsBetter: true },
  totalCommits: { label: "Total Commits", unit: "", higherIsBetter: true },
  avgCommitSizeLinesChanged: { label: "Avg Commit Size", unit: " lines", higherIsBetter: false },
  codeChurnRatio: { label: "Code Churn Ratio", unit: "", higherIsBetter: false },
  branchCount: { label: "Branch Count", unit: "", higherIsBetter: true },
  mergeFrequency: { label: "Merge Frequency", unit: "/wk", higherIsBetter: true },
  issueCreationRate: { label: "Issue Creation Rate", unit: "/wk", higherIsBetter: true },
  issueResolutionTime: { label: "Issue Resolution", unit: " hrs", higherIsBetter: false },
  daysSinceLastCommit: { label: "Days Since Commit", unit: " days", higherIsBetter: false },
  commitsLast3Days: { label: "Commits (3 days)", unit: "", higherIsBetter: true },
  commitsLastWeek: { label: "Commits (last wk)", unit: "", higherIsBetter: true },
  filesModifiedCount: { label: "Files Modified", unit: "", higherIsBetter: true },
  commitMessageQualityScore: { label: "Msg Quality Score", unit: "/100", higherIsBetter: true },
};

function CompareArrow({ studentVal, avgVal, higherIsBetter }: { studentVal: number; avgVal: number; higherIsBetter: boolean }) {
  const better = higherIsBetter ? studentVal >= avgVal : studentVal <= avgVal;
  const neutral = Math.abs(studentVal - avgVal) / Math.max(avgVal, 0.001) < 0.05;
  if (neutral) return <Minus className="h-3 w-3 text-muted-foreground" />;
  return better
    ? <ArrowUp className="h-3 w-3 text-[hsl(var(--risk-low))]" />
    : <ArrowDown className="h-3 w-3 text-[hsl(var(--risk-high))]" />;
}

export default function StudentProfile({ session }: StudentProfileProps) {
  const { id } = useParams<{ id: string }>();
  const { data: profile } = useProfile(session?.user?.id);
  const { data: student, isLoading } = useStudent(id);
  const { data: classAverageFeatures } = useClassAverageFeatures(profile?.course_id);

  if (isLoading) {
    return (
      <AppLayout role="instructor" session={session} breadcrumbs={[{ label: "Dashboard", href: "/instructor" }, { label: "Loading..." }]}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout role="instructor" session={session} breadcrumbs={[{ label: "Dashboard", href: "/instructor" }, { label: "Not Found" }]}>
        <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          Student not found.
        </div>
      </AppLayout>
    );
  }

  const featureKeys = Object.keys(featureLabels) as (keyof typeof student.features)[];

  return (
    <AppLayout
      role="instructor"
      session={session}
      breadcrumbs={[
        { label: "Dashboard", href: "/instructor" },
        { label: "Students", href: "/instructor" },
        { label: student.name },
      ]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
              student.riskLevel === "high"
                ? "bg-[hsl(var(--risk-high-bg))] text-[hsl(var(--risk-high))]"
                : student.riskLevel === "moderate"
                ? "bg-[hsl(var(--risk-moderate-bg))] text-[hsl(var(--risk-moderate))]"
                : "bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))]"
            )}>
              {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
                <RiskBadge level={student.riskLevel} score={student.riskScore} showScore />
              </div>
              <p className="text-xs text-muted-foreground">{student.email}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Github className="h-3.5 w-3.5" />@{student.githubUsername}<ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-xs text-muted-foreground">Enrolled: {student.enrolledDate}</span>
                <span className="text-xs text-muted-foreground">Last commit: {student.lastCommitDate}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold tabular-nums" style={{
                color: student.riskLevel === "high" ? "hsl(0,70%,55%)" : student.riskLevel === "moderate" ? "hsl(38,92%,55%)" : "hsl(142,71%,45%)"
              }}>{student.riskScore}</p>
              <p className="text-xs text-muted-foreground">Risk Score</p>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-4">
          <RiskTrendChart data={student.weeklyRiskHistory} title="Risk Score Trend" subtitle={`${student.name}'s risk progression over 12 weeks`} />
          {classAverageFeatures && (
            <FeatureRadarChart studentFeatures={student.features} classAverageFeatures={classAverageFeatures} studentName={student.name.split(" ")[0]} />
          )}
        </div>

        <CommitBarChart data={student.commitHistory} title={`${student.name}'s Daily Commits`} />

        {/* Features grid */}
        {classAverageFeatures && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Rule Engine Input Features</h3>
            <p className="text-xs text-muted-foreground mb-4">All 15 features evaluated by the rule-based risk engine. Arrows compare to class average.</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {featureKeys.map((key) => {
                const meta = featureLabels[key];
                const studentVal = student.features[key] as number;
                const avgVal = classAverageFeatures[key as keyof typeof classAverageFeatures] as number;
                const displayVal = typeof studentVal === "number"
                  ? studentVal % 1 === 0 ? studentVal.toString() : studentVal.toFixed(2)
                  : studentVal;
                return (
                  <div key={key} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">{meta.label}</p>
                      <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">{displayVal}{meta.unit}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <CompareArrow studentVal={studentVal} avgVal={avgVal} higherIsBetter={meta.higherIsBetter} />
                      <p className="text-[9px] text-muted-foreground">avg: {typeof avgVal === "number" ? (avgVal % 1 === 0 ? avgVal : avgVal.toFixed(2)) : avgVal}{meta.unit}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <RuleAuditPanel
          firedRules={student.firedRules}
          baselineScore={student.baselineScore}
          riskScore={student.riskScore}
          riskLevel={student.riskLevel}
        />

        <RecommendationsPanel recommendations={student.recommendations} title={`Recommendations for ${student.name.split(" ")[0]}`} />
      </div>
    </AppLayout>
  );
}
