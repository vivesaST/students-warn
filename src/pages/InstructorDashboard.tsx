import { AlertTriangle as AT, Users as U, GitCommit as GC, TrendingUp as TU, Loader2, RefreshCw } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useSyncGithub } from "@/hooks/useSyncGithub";
import { KPICard } from "@/components/dashboard/KPICard";
import { RiskDonutChart } from "@/components/dashboard/RiskDonutChart";
import { CommitTimelineChart } from "@/components/dashboard/CommitTimelineChart";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { useProfile } from "@/hooks/useProfile";
import { useStudents } from "@/hooks/useStudents";
import { useCourse } from "@/hooks/useCourse";
import { useClassWeeklyCommits } from "@/hooks/useClassData";
import type { Student } from "@/data/mockData";

interface InstructorDashboardProps {
  session: Session | null;
}

export default function InstructorDashboard({ session }: InstructorDashboardProps) {
  const { data: profile } = useProfile(session?.user?.id);
  const { data: studentRows = [], isLoading: studentsLoading } = useStudents(profile?.course_id);
  const { data: course } = useCourse(profile?.course_id);
  const { data: classWeeklyCommits = [] } = useClassWeeklyCommits(profile?.course_id);
  const { sync, isSyncing } = useSyncGithub();

  const highRisk = studentRows.filter((s) => s.riskLevel === "high").length;
  const moderateRisk = studentRows.filter((s) => s.riskLevel === "moderate").length;
  const avgCommitsThisWeek = studentRows.length > 0
    ? Math.round(studentRows.reduce((sum, s) => sum + s.commits_this_week, 0) / studentRows.length)
    : 0;

  const studentsForTable: Student[] = studentRows.map((s) => ({
    id: s.id,
    name: s.full_name,
    email: s.email ?? "",
    githubUsername: s.github_username ?? "",
    githubUrl: s.github_url ?? "",
    courseId: s.course_id ?? "",
    riskLevel: s.riskLevel,
    riskScore: s.riskScore,
    lastCommitDate: s.last_commit_date ?? "",
    totalCommits: s.total_commits,
    commitsThisWeek: s.commits_this_week,
    enrolledDate: s.enrolled_date ?? "",
    features: {} as never,
    weeklyRiskHistory: [],
    commitHistory: [],
    weeklyCommitHistory: [],
    recommendations: [],
  }));

  return (
    <AppLayout
      role="instructor"
      session={session}
      breadcrumbs={[{ label: "Instructor Dashboard" }]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {course?.name ?? "Loading…"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Instructor: {course?.instructorName ?? "—"}{course?.startDate ? ` · ${course.startDate} → ${course.endDate}` : ""}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sync()}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing…" : "Sync GitHub"}
          </Button>
        </div>

        {studentsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard title="Total Students" value={studentRows.length} subtitle="Enrolled in course" icon={U} variant="default" />
              <KPICard title="High Risk" value={highRisk} subtitle={`${studentRows.length ? Math.round((highRisk / studentRows.length) * 100) : 0}% of class`} icon={AT} variant="danger" trend={{ value: 1, label: "since last week" }} />
              <KPICard title="Moderate Risk" value={moderateRisk} subtitle={`${studentRows.length ? Math.round((moderateRisk / studentRows.length) * 100) : 0}% of class`} icon={TU} variant="warning" />
              <KPICard title="Avg Commits/Week" value={avgCommitsThisWeek} subtitle="Class average this week" icon={GC} variant="info" trend={{ value: -2, label: "vs last week" }} />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <RiskDonutChart students={studentsForTable} />
              <CommitTimelineChart
                data={classWeeklyCommits}
                title="Class Commit Activity"
                subtitle="Aggregate lines changed per week"
              />
            </div>

            <StudentTable students={studentsForTable} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
