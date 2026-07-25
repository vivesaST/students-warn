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
  course_name: string | null;
  last_commit_date: string | null;
  total_commits: number;
  commits_this_week: number;
  enrolled_date: string | null;
  riskScore: number;
  riskLevel: RiskLevel;
}

/**
 * Returns every student enrolled in ANY course created by this instructor,
 * not just the instructor's currently active course.
 */
export function useStudents(instructorId: string | null | undefined) {
  return useQuery({
    queryKey: ["students", "byInstructor", instructorId],
    queryFn: async (): Promise<StudentRow[]> => {
      if (!instructorId) return [];

      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id, name")
        .eq("created_by", instructorId);
      if (coursesError) throw coursesError;

      const courseIds = (courses ?? []).map((c) => c.id);
      if (courseIds.length === 0) return [];
      const courseNames = new Map((courses ?? []).map((c) => [c.id, c.name]));

      const [profilesRes, assessmentsRes] = await Promise.all([
        supabase.from("profiles").select("*").in("course_id", courseIds).eq("role", "student"),
        supabase
          .from("risk_assessments")
          .select("student_id, risk_score, risk_level, assessed_at")
          .order("assessed_at", { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;

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
          course_name: p.course_id ? courseNames.get(p.course_id) ?? null : null,
          last_commit_date: p.last_commit_date,
          total_commits: p.total_commits,
          commits_this_week: p.commits_this_week,
          enrolled_date: p.enrolled_date,
          riskScore: risk?.risk_score ?? 0,
          riskLevel: (risk?.risk_level ?? "low") as RiskLevel,
        } as StudentRow;
      });
    },
    enabled: !!instructorId,
  });
}
