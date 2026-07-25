import type { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CommitTimelineChart } from "@/components/dashboard/CommitTimelineChart";
import { RiskTrendChart } from "@/components/dashboard/RiskTrendChart";
import { FeatureRadarChart } from "@/components/dashboard/RadarChart";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { useProfile } from "@/hooks/useProfile";
import { useStudent } from "@/hooks/useStudent";
import { useClassAverageFeatures } from "@/hooks/useClassData";

interface Props {
  session: Session | null;
}

export default function StudentProgress({ session }: Props) {
  const { data: profile } = useProfile(session?.user?.id);
  const { data: student, isLoading } = useStudent(profile?.id);
  const { data: classAverageFeatures } = useClassAverageFeatures(profile?.course_id);

  return (
    <AppLayout
      role="student"
      session={session}
      breadcrumbs={[{ label: "My Dashboard", href: "/student" }, { label: "My Progress" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">My Progress</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Commit activity, risk trend and how you compare with your class
            </p>
          </div>
          {student && <RiskBadge level={student.riskLevel} />}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !student ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No activity yet. Link your GitHub repository on your dashboard and wait for the next sync.
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-4">
              <Stat label="Total Commits" value={student.totalCommits} />
              <Stat label="Commits This Week" value={student.commitsThisWeek} />
              <Stat label="Risk Score" value={student.riskScore} />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <CommitTimelineChart
                data={student.weeklyCommitHistory}
                title="My Commit Activity"
                subtitle="Lines changed per week"
              />
              <RiskTrendChart data={student.weeklyRiskHistory} />
            </div>

            {classAverageFeatures && (
              <FeatureRadarChart
                studentFeatures={student.features}
                classAverage={classAverageFeatures}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground tabular-nums mt-1">{value}</p>
    </div>
  );
}
