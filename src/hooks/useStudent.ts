import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Student, StudentFeatures, WeeklyRisk, DailyCommits, WeeklyCommits, Recommendation, RiskLevel, FiredRule } from "@/data/mockData";

export function useStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async (): Promise<Student | null> => {
      if (!studentId) return null;

      const [profileRes, featuresRes, riskRes, weeklyRiskRes, dailyCommitsRes, weeklyCommitsRes, recsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", studentId).single(),
        supabase.from("student_features").select("*").eq("student_id", studentId).maybeSingle(),
        supabase.from("risk_assessments").select("*").eq("student_id", studentId).order("assessed_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("weekly_risk_history").select("*").eq("student_id", studentId).order("assessed_at", { ascending: true }),
        supabase.from("daily_commits").select("*").eq("student_id", studentId).order("commit_date", { ascending: true }),
        supabase.from("weekly_commits").select("*").eq("student_id", studentId),
        supabase.from("recommendations").select("*").eq("student_id", studentId).order("created_at", { ascending: true }),
      ]);

      if (profileRes.error) throw profileRes.error;
      const p = profileRes.data;
      const f = featuresRes.data;
      const r = riskRes.data;

      const features: StudentFeatures = {
        commitFrequencyPerDay: Number(f?.commit_frequency_per_day ?? 0),
        commitFrequencyPerWeek: Number(f?.commit_frequency_per_week ?? 0),
        commitRegularityScore: Number(f?.commit_regularity_score ?? 0),
        totalCommits: f?.total_commits ?? 0,
        avgCommitSizeLinesChanged: Number(f?.avg_commit_size_lines_changed ?? 0),
        codeChurnRatio: Number(f?.code_churn_ratio ?? 0),
        branchCount: f?.branch_count ?? 0,
        mergeFrequency: Number(f?.merge_frequency ?? 0),
        issueCreationRate: Number(f?.issue_creation_rate ?? 0),
        issueResolutionTime: Number(f?.issue_resolution_time ?? 0),
        daysSinceLastCommit: f?.days_since_last_commit ?? 0,
        commitsLast3Days: f?.commits_last_3_days ?? 0,
        commitsLastWeek: f?.commits_last_week ?? 0,
        filesModifiedCount: f?.files_modified_count ?? 0,
        commitMessageQualityScore: Number(f?.commit_message_quality_score ?? 0),
      };

      const weeklyRiskHistory: WeeklyRisk[] = (weeklyRiskRes.data ?? []).map((w, i) => ({
        week: w.week_label,
        label: `Week ${i + 1}`,
        riskScore: w.risk_score,
      }));

      const commitHistory: DailyCommits[] = (dailyCommitsRes.data ?? []).map((d) => ({
        date: d.commit_date,
        commits: d.commit_count,
      }));

      const weeklyCommitHistory: WeeklyCommits[] = (weeklyCommitsRes.data ?? []).map((w) => ({
        week: w.week_label,
        commits: w.commits,
        linesAdded: w.lines_added,
        linesDeleted: w.lines_deleted,
      }));

      const recommendations: Recommendation[] = (recsRes.data ?? []).map((rec) => ({
        id: rec.id,
        priority: rec.priority as "high" | "medium" | "low",
        title: rec.title,
        description: rec.description ?? "",
        icon: rec.icon ?? "Star",
      }));

      return {
        id: p.id,
        name: p.full_name,
        email: p.email ?? "",
        githubUsername: p.github_username ?? "",
        githubUrl: p.github_url ?? "",
        courseId: p.course_id ?? "",
        riskLevel: (r?.risk_level ?? "low") as RiskLevel,
        riskScore: r?.risk_score ?? 0,
        lastCommitDate: p.last_commit_date ?? "",
        totalCommits: p.total_commits,
        commitsThisWeek: p.commits_this_week,
        enrolledDate: p.enrolled_date ?? "",
        features,
        weeklyRiskHistory,
        commitHistory,
        weeklyCommitHistory,
        recommendations,
        hasGithubData: Boolean(f),
        firedRules: Array.isArray(r?.fired_rules) ? (r!.fired_rules as unknown as FiredRule[]) : [],
        baselineScore: r?.baseline_score ?? 30,
      };
    },
    enabled: !!studentId,
  });
}
