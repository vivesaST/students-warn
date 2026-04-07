import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AppLayout } from "@/components/layout/AppLayout";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { FeatureRadarChart } from "@/components/dashboard/RadarChart";
import { CommitTimelineChart } from "@/components/dashboard/CommitTimelineChart";
import { RiskTrendChart } from "@/components/dashboard/RiskTrendChart";
import { RecommendationsPanel } from "@/components/dashboard/RecommendationsPanel";
import { useProfile } from "@/hooks/useProfile";
import { useStudent } from "@/hooks/useStudent";
import { useClassAverageFeatures } from "@/hooks/useClassData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, Minus, Github, ExternalLink, TrendingUp, TrendingDown, Loader2, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentDashboardProps {
  session: Session | null;
}

const topMetrics = [
  { key: "commitFrequencyPerWeek", label: "Commits / Week", unit: "/wk", higherIsBetter: true },
  { key: "commitRegularityScore", label: "Regularity", unit: "/100", higherIsBetter: true },
  { key: "branchCount", label: "Branches", unit: "", higherIsBetter: true },
  { key: "daysSinceLastCommit", label: "Days Inactive", unit: " days", higherIsBetter: false },
  { key: "commitMessageQualityScore", label: "Msg Quality", unit: "/100", higherIsBetter: true },
  { key: "codeChurnRatio", label: "Code Churn", unit: "", higherIsBetter: false },
];

function CompareBar({ studentVal, avgVal, higherIsBetter, unit }: { studentVal: number; avgVal: number; higherIsBetter: boolean; unit: string }) {
  const maxVal = Math.max(studentVal, avgVal) * 1.2 || 1;
  const studentPct = Math.min(100, (studentVal / maxVal) * 100);
  const avgPct = Math.min(100, (avgVal / maxVal) * 100);
  const isBetter = higherIsBetter ? studentVal >= avgVal : studentVal <= avgVal;
  const barColor = isBetter ? "hsl(142,71%,45%)" : "hsl(0,70%,55%)";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground font-bold tabular-nums">{typeof studentVal === "number" && studentVal % 1 !== 0 ? studentVal.toFixed(2) : studentVal}{unit}</span>
        <div className="flex items-center gap-1">
          {isBetter
            ? <TrendingUp className="h-3 w-3 text-[hsl(var(--risk-low))]" />
            : <TrendingDown className="h-3 w-3 text-[hsl(var(--risk-high))]" />}
          <span className="text-muted-foreground text-[10px]">avg {typeof avgVal === "number" && avgVal % 1 !== 0 ? avgVal.toFixed(1) : avgVal}{unit}</span>
        </div>
      </div>
      <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="absolute inset-y-0 left-0 h-full rounded-full" style={{ width: `${studentPct}%`, backgroundColor: barColor }} />
      </div>
      <div className="relative h-0.5 rounded-full bg-muted overflow-hidden">
        <div className="absolute inset-y-0 left-0 h-full rounded-full bg-muted-foreground/40" style={{ width: `${avgPct}%` }} />
      </div>
    </div>
  );
}

export default function StudentDashboard({ session }: StudentDashboardProps) {
  const { data: profile, refetch: refetchProfile } = useProfile(session?.user?.id);
  const { data: student, isLoading } = useStudent(profile?.id);
  const { data: classAverageFeatures } = useClassAverageFeatures(profile?.course_id);
  const { toast } = useToast();

  const [editingGithub, setEditingGithub] = useState(false);
  const [ghUsername, setGhUsername] = useState("");
  const [ghUrl, setGhUrl] = useState("");
  const [saving, setSaving] = useState(false);

  function startEditGithub() {
    setGhUsername(profile?.github_username ?? "");
    setGhUrl(profile?.github_url ?? "");
    setEditingGithub(true);
  }

  async function saveGithub() {
    if (!session?.user?.id) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      github_username: ghUsername.trim(),
      github_url: ghUrl.trim(),
    }).eq("id", session.user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "GitHub info updated" });
      setEditingGithub(false);
      refetchProfile();
    }
  }

  async function handleRoleSwitch() {
    window.location.href = "/instructor";
  }

  if (isLoading) {
    return (
      <AppLayout role="student" session={session} onRoleSwitch={handleRoleSwitch} breadcrumbs={[{ label: "My Dashboard" }]}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  const hasGithub = !!profile?.github_username;
  const isSyncing = hasGithub && (!student || student.features.totalCommits === 0);

  if (isSyncing) {
    return (
      <AppLayout role="student" session={session} onRoleSwitch={handleRoleSwitch} breadcrumbs={[{ label: "My Dashboard" }]}>
        <div className="max-w-lg mx-auto mt-16 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
            <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
            <h2 className="text-lg font-bold text-foreground">Syncing Your GitHub Data…</h2>
            <p className="text-sm text-muted-foreground">
              We've linked your GitHub account <strong>@{profile?.github_username}</strong>. Your commit history and metrics will appear here after the next sync cycle runs (usually within a few minutes).
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-2">
              <Loader2 className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout role="student" session={session} onRoleSwitch={handleRoleSwitch} breadcrumbs={[{ label: "My Dashboard" }]}>
        <div className="max-w-lg mx-auto mt-16 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
            <Github className="h-10 w-10 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">Link Your GitHub to Get Started</h2>
            <p className="text-sm text-muted-foreground">Add your GitHub username and repository URL so EarlyWarn can analyze your progress.</p>
            <div className="space-y-3 text-left">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase">GitHub Username</label>
                <Input value={ghUsername} onChange={(e) => setGhUsername(e.target.value)} placeholder="octocat" className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase">Repository URL</label>
                <Input value={ghUrl} onChange={(e) => setGhUrl(e.target.value)} placeholder="https://github.com/user/repo" className="h-9 text-sm" />
              </div>
              <Button onClick={saveGithub} disabled={saving || !ghUsername.trim()} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save GitHub Info
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const riskBannerColor = {
    high: "from-[hsl(var(--risk-high-bg))] border-[hsl(var(--risk-high)/0.4)]",
    moderate: "from-[hsl(var(--risk-moderate-bg))] border-[hsl(var(--risk-moderate)/0.4)]",
    low: "from-[hsl(var(--risk-low-bg))] border-[hsl(var(--risk-low)/0.4)]",
  }[student.riskLevel];

  const riskDescription = {
    high: "Your current activity patterns suggest a significant risk of not meeting project requirements. Immediate action is recommended.",
    moderate: "Your activity is below the class average in several areas. Focus on consistency and branch usage to improve your standing.",
    low: "Great work! Your Git habits are strong. Keep maintaining your commit frequency and quality.",
  }[student.riskLevel];

  // Derive contributing factors from actual features vs class average
  const contributingFactors = classAverageFeatures ? [
    student.features.commitRegularityScore < classAverageFeatures.commitRegularityScore
      ? { label: "Commit Regularity", impact: "negative", description: `Score of ${student.features.commitRegularityScore}/100 — below class average of ${Math.round(classAverageFeatures.commitRegularityScore)}/100` }
      : null,
    student.features.daysSinceLastCommit > classAverageFeatures.daysSinceLastCommit
      ? { label: "Days Since Last Commit", impact: "negative", description: `${student.features.daysSinceLastCommit} days without a commit — above class average of ${Math.round(classAverageFeatures.daysSinceLastCommit)} days` }
      : null,
    student.features.branchCount < classAverageFeatures.branchCount
      ? { label: "Branch Usage", impact: "negative", description: `Only ${student.features.branchCount} branch(es) — below class average of ${Math.round(classAverageFeatures.branchCount)} branches` }
      : null,
    student.features.commitFrequencyPerWeek >= classAverageFeatures.commitFrequencyPerWeek
      ? { label: "Commit Frequency", impact: "positive", description: `${student.features.commitFrequencyPerWeek.toFixed(1)} commits/week — above class average of ${classAverageFeatures.commitFrequencyPerWeek.toFixed(1)}` }
      : null,
  ].filter(Boolean) as { label: string; impact: string; description: string }[] : [];

  return (
    <AppLayout role="student" session={session} onRoleSwitch={handleRoleSwitch} breadcrumbs={[{ label: "My Dashboard" }]}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Risk Banner */}
        <div className={cn("rounded-xl border bg-gradient-to-r to-card p-6", riskBannerColor)}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-bold text-foreground">Hello, {student.name.split(" ")[0]} 👋</h2>
                <RiskBadge level={student.riskLevel} score={student.riskScore} showScore size="lg" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{riskDescription}</p>
              {editingGithub ? (
                <div className="flex flex-wrap items-end gap-2 mt-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase">GitHub Username</label>
                    <Input value={ghUsername} onChange={(e) => setGhUsername(e.target.value)} placeholder="octocat" className="h-8 text-xs w-40" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase">Repository URL</label>
                    <Input value={ghUrl} onChange={(e) => setGhUrl(e.target.value)} placeholder="https://github.com/user/repo" className="h-8 text-xs w-64" />
                  </div>
                  <Button size="sm" variant="default" onClick={saveGithub} disabled={saving} className="h-8 gap-1">
                    <Check className="h-3 w-3" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingGithub(false)} className="h-8 gap-1">
                    <X className="h-3 w-3" /> Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Github className="h-3.5 w-3.5" />
                    {student.githubUsername ? (
                      <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        @{student.githubUsername} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Not set</span>
                    )}
                    <button onClick={startEditGithub} className="text-muted-foreground hover:text-foreground ml-1">
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                  <span>Total commits: <strong className="text-foreground">{student.totalCommits}</strong></span>
                  <span>This week: <strong className="text-foreground">{student.commitsThisWeek}</strong></span>
                  <span>Last commit: <strong className="text-foreground">{student.lastCommitDate}</strong></span>
                </div>
              )}
            </div>
            <div className="text-center shrink-0">
              <div className={cn(
                "inline-flex h-20 w-20 items-center justify-center rounded-full border-4 text-3xl font-black tabular-nums",
                student.riskLevel === "high"
                  ? "border-[hsl(var(--risk-high))] text-[hsl(var(--risk-high))] bg-[hsl(var(--risk-high-bg))]"
                  : student.riskLevel === "moderate"
                  ? "border-[hsl(var(--risk-moderate))] text-[hsl(var(--risk-moderate))] bg-[hsl(var(--risk-moderate-bg))]"
                  : "border-[hsl(var(--risk-low))] text-[hsl(var(--risk-low))] bg-[hsl(var(--risk-low-bg))]"
              )}>
                {student.riskScore}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Risk Score</p>
            </div>
          </div>
        </div>

        {/* Metrics grid vs class average */}
        {classAverageFeatures && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Your Metrics vs Class Average</h3>
            <p className="text-xs text-muted-foreground mb-4">Blue bar = you · Gray bar = class average</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topMetrics.map(({ key, label, unit, higherIsBetter }) => {
                const studentVal = student.features[key as keyof typeof student.features] as number;
                const avgVal = classAverageFeatures[key as keyof typeof classAverageFeatures] as number;
                return (
                  <div key={key} className="rounded-lg bg-muted/40 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
                    <CompareBar studentVal={studentVal} avgVal={avgVal} higherIsBetter={higherIsBetter} unit={unit} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Radar + Risk Trend */}
        <div className="grid lg:grid-cols-2 gap-4">
          {classAverageFeatures && (
            <FeatureRadarChart studentFeatures={student.features} classAverageFeatures={classAverageFeatures} studentName="You" />
          )}
          <RiskTrendChart data={student.weeklyRiskHistory} title="Your Risk Score Over Time" subtitle="Track your progress week by week" />
        </div>

        {/* Commit timeline */}
        <CommitTimelineChart data={student.weeklyCommitHistory} title="Your Commit Activity" subtitle="Lines added and deleted per week" />

        {/* Contributing factors */}
        {contributingFactors.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Top Contributing Risk Factors</h3>
            <p className="text-xs text-muted-foreground mb-4">Features with the greatest impact on your risk prediction</p>
            <div className="space-y-3">
              {contributingFactors.map((factor, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
                  <div className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5",
                    factor.impact === "negative"
                      ? "bg-[hsl(var(--risk-high-bg))] text-[hsl(var(--risk-high))]"
                      : "bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))]"
                  )}>
                    {factor.impact === "negative" ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{factor.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <RecommendationsPanel recommendations={student.recommendations} title="Your Personalized Action Plan" />
      </div>
    </AppLayout>
  );
}
