import { AlertTriangle as AT, Users as U, GitCommit as GC, TrendingUp as TU } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { RiskDonutChart } from "@/components/dashboard/RiskDonutChart";
import { CommitTimelineChart } from "@/components/dashboard/CommitTimelineChart";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { students, course, classWeeklyCommits } from "@/data/mockData";

interface InstructorDashboardProps {
  onRoleSwitch: () => void;
}

export default function InstructorDashboard({ onRoleSwitch }: InstructorDashboardProps) {
  const highRisk = students.filter((s) => s.riskLevel === "high").length;
  const moderateRisk = students.filter((s) => s.riskLevel === "moderate").length;
  const avgCommitsThisWeek = Math.round(
    students.reduce((sum, s) => sum + s.commitsThisWeek, 0) / students.length
  );

  return (
    <AppLayout
      role="instructor"
      onRoleSwitch={onRoleSwitch}
      breadcrumbs={[{ label: "Instructor Dashboard" }]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">{course.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Instructor: {course.instructorName} · {course.startDate} → {course.endDate}
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Students"
            value={students.length}
            subtitle="Enrolled in course"
            icon={U}
            variant="default"
          />
          <KPICard
            title="High Risk"
            value={highRisk}
            subtitle={`${Math.round((highRisk / students.length) * 100)}% of class`}
            icon={AT}
            variant="danger"
            trend={{ value: 1, label: "since last week" }}
          />
          <KPICard
            title="Moderate Risk"
            value={moderateRisk}
            subtitle={`${Math.round((moderateRisk / students.length) * 100)}% of class`}
            icon={TU}
            variant="warning"
          />
          <KPICard
            title="Avg Commits/Week"
            value={avgCommitsThisWeek}
            subtitle="Class average this week"
            icon={GC}
            variant="info"
            trend={{ value: -2, label: "vs last week" }}
          />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-4">
          <RiskDonutChart />
          <CommitTimelineChart
            data={classWeeklyCommits}
            title="Class Commit Activity"
            subtitle="Aggregate lines changed per week"
          />
        </div>

        {/* Student table */}
        <StudentTable students={students} />
      </div>
    </AppLayout>
  );
}
