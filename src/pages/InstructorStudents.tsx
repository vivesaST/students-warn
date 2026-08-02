import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useStudents } from "@/hooks/useStudents";
import type { Student } from "@/data/mockData";

interface InstructorStudentsProps {
  session: Session | null;
}

function normaliseRepoUrl(value: string): string | null {
  const match = value
    .trim()
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "")
    .replace(/\.git$/i, "")
    .match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)$/i);
  return match ? `https://github.com/${match[1]}/${match[2]}` : null;
}

export default function InstructorStudents({ session }: InstructorStudentsProps) {
  const { data: profile } = useProfile(session?.user?.id);
  const { data: studentRows = [], isLoading } = useStudents(profile?.role === "instructor" ? profile.id : undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function saveRepo(studentId: string, currentUrl: string) {
    const raw = edits[studentId] ?? currentUrl;
    const normalised = normaliseRepoUrl(raw);
    if (!normalised) {
      toast({
        title: "Invalid repository URL",
        description: "Use the form https://github.com/owner/repository",
        variant: "destructive",
      });
      return;
    }
    setSavingId(studentId);
    const owner = normalised.split("/")[3];
    const { error } = await supabase
      .from("profiles")
      .update({ github_url: normalised, github_username: owner })
      .eq("id", studentId);
    setSavingId(null);
    if (error) {
      toast({ title: "Could not update repository", description: error.message, variant: "destructive" });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["students"] });
    setEdits((prev) => ({ ...prev, [studentId]: normalised }));
    toast({ title: "Repository updated", description: `${normalised} saved. Run Sync GitHub to pull the data.` });
  }


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
      breadcrumbs={[{ label: "Instructor Dashboard", href: "/instructor" }, { label: "Students" }]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{studentRows.length} students enrolled</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <StudentTable students={studentsForTable} />
        )}
      </div>
    </AppLayout>
  );
}
