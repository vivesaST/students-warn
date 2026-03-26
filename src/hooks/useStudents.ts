import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RiskLevel } from "@/data/mockData";

export interface StudentRow {
  id: string;
  full_name: string;
  email: string | null;
  github_username: string | null;
  github_url: string | null;
  course_id: string | null;
  last_commit_date: string | null;
  total_commits: number;
  commits_this_week: number;
  enrolled_date: string | null;
  riskScore: number;
  riskLevel: RiskLevel;
}

export function useStudents(courseId: string | null | undefined) {
  return useQuery({
    queryKey: ["students", courseId],
    queryFn: async () => {
      if (!courseId) return [];

      // Fetch profiles + latest risk assessment in parallel
      const [profilesRes, assessmentsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("course_id", courseId).eq("role", "student"),
        supabase.from("risk_assessments").select("student_id, risk_score, risk_level, assessed_at").order("assessed_at", { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      // Build a map of latest risk per student
      const latestRisk = new Map<string, { risk_score: number; risk_level: string }>();
      for (const a of assessmentsRes.data ?? []) {
        if (!latestRisk.has(a.student_id)) {
          latestRisk.set(a.student_id, { risk_score: a.risk_score, risk_level: a.risk_level });
        }
      }

      return (profilesRes.data ?? []).map((p) => {
        const risk = latestRisk.get(p.id);
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          github_username: p.github_username,
          github_url: p.github_url,
          course_id: p.course_id,
          last_commit_date: p.last_commit_date,
          total_commits: p.total_commits,
          commits_this_week: p.commits_this_week,
          enrolled_date: p.enrolled_date,
          riskScore: risk?.risk_score ?? 0,
          riskLevel: (risk?.risk_level ?? "low") as RiskLevel,
        } as StudentRow;
      });
    },
    enabled: !!courseId,
  });
}
