import type { Session } from "@supabase/supabase-js";
import { Loader2, Github, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { useCourse } from "@/hooks/useCourse";

interface Props {
  session: Session | null;
}

export default function StudentCourse({ session }: Props) {
  const { data: profile, isLoading: profileLoading } = useProfile(session?.user?.id);
  const { data: course, isLoading: courseLoading } = useCourse(profile?.course_id);

  const loading = profileLoading || (!!profile?.course_id && courseLoading);

  return (
    <AppLayout
      role="student"
      session={session}
      breadcrumbs={[{ label: "My Dashboard", href: "/student" }, { label: "Course Info" }]}
    >
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-foreground">Course Info</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your enrolment and linked repository</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !course ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            You are not enrolled in a course yet. Ask your instructor for the course to join.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            <Row label="Course" value={course.name} />
            <Row label="Instructor" value={course.instructorName} />
            <Row label="Start Date" value={course.startDate || "—"} />
            <Row label="End Date" value={course.endDate || "—"} />
            <Row label="Enrolled On" value={profile?.enrolled_date || "—"} />
            <Row label="GitHub Username" value={profile?.github_username || "Not linked"} />
            <div className="flex items-center justify-between gap-4 p-4">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Repository</span>
              {profile?.github_url ? (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Github className="h-3.5 w-3.5" />
                  {profile.github_url.replace("https://github.com/", "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">Not linked</span>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
