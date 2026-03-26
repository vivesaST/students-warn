import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ClassAverageFeatures, WeeklyCommits } from "@/data/mockData";

export function useClassAverageFeatures(courseId: string | null | undefined) {
  return useQuery({
    queryKey: ["classAverageFeatures", courseId],
    queryFn: async (): Promise<ClassAverageFeatures> => {
      if (!courseId) throw new Error("No courseId");

      const { data, error } = await supabase
        .from("student_features")
        .select("*")
        .eq("course_id", courseId);

      if (error) throw error;
      if (!data || data.length === 0) {
        // Fallback to known averages
        return {
          commitFrequencyPerDay: 1.1, commitFrequencyPerWeek: 7.7, commitRegularityScore: 58,
          totalCommits: 37, avgCommitSizeLinesChanged: 148, codeChurnRatio: 0.38, branchCount: 5,
          mergeFrequency: 0.9, issueCreationRate: 1.4, issueResolutionTime: 58, daysSinceLastCommit: 3.5,
          commitsLast3Days: 3.4, commitsLastWeek: 6.2, filesModifiedCount: 37, commitMessageQualityScore: 63,
        };
      }

      const avg = (key: keyof typeof data[0]) =>
        data.reduce((sum, r) => sum + Number(r[key] ?? 0), 0) / data.length;

      return {
        commitFrequencyPerDay: avg("commit_frequency_per_day"),
        commitFrequencyPerWeek: avg("commit_frequency_per_week"),
        commitRegularityScore: avg("commit_regularity_score"),
        totalCommits: Math.round(avg("total_commits")),
        avgCommitSizeLinesChanged: avg("avg_commit_size_lines_changed"),
        codeChurnRatio: avg("code_churn_ratio"),
        branchCount: Math.round(avg("branch_count")),
        mergeFrequency: avg("merge_frequency"),
        issueCreationRate: avg("issue_creation_rate"),
        issueResolutionTime: avg("issue_resolution_time"),
        daysSinceLastCommit: avg("days_since_last_commit"),
        commitsLast3Days: avg("commits_last_3_days"),
        commitsLastWeek: avg("commits_last_week"),
        filesModifiedCount: Math.round(avg("files_modified_count")),
        commitMessageQualityScore: avg("commit_message_quality_score"),
      };
    },
    enabled: !!courseId,
  });
}

export function useClassWeeklyCommits(courseId: string | null | undefined) {
  return useQuery({
    queryKey: ["classWeeklyCommits", courseId],
    queryFn: async (): Promise<WeeklyCommits[]> => {
      if (!courseId) return [];
      const { data, error } = await supabase
        .from("class_weekly_commits")
        .select("*")
        .eq("course_id", courseId)
        .order("week_label", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((w) => ({
        week: w.week_label,
        commits: w.commits,
        linesAdded: w.lines_added,
        linesDeleted: w.lines_deleted,
      }));
    },
    enabled: !!courseId,
  });
}
