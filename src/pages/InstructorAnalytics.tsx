import { Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { AppLayout } from "@/components/layout/AppLayout";
import { RiskDonutChart } from "@/components/dashboard/RiskDonutChart";
import { CommitTimelineChart } from "@/components/dashboard/CommitTimelineChart";
import { useProfile } from "@/hooks/useProfile";
import { useStudents } from "@/hooks/useStudents";
import { useClassWeeklyCommits } from "@/hooks/useClassData";
import type { Student } from "@/data/mockData";

interface InstructorAnalyticsProps {
  session: Session | null;
}

export default function InstructorAnalytics({ session }: InstructorAnalyticsProps) {
  const { data: profile } = useProfile(session?.user?.id);
  const { data: studentRows = [], isLoading } = useStudents(profile?.course_id);
  const { data: classWeeklyCommits = [] } = useClassWeeklyCommits(profile?.course_id);

  function handleRoleSwitch() {
    window.location.href = "/student";
  }

  const studentsForChart: Student[] = studentRows.map((s) => ({
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
      onRoleSwitch={handleRoleSwitch}
      breadcrumbs={[{ label: "Instructor Dashboard", href: "/instructor" }, { label: "Analytics" }]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Risk distribution and commit trends</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-4">
              <RiskDonutChart students={studentsForChart} />
              <CommitTimelineChart
                data={classWeeklyCommits}
                title="Class Commit Activity"
                subtitle="Aggregate lines changed per week"
              />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
