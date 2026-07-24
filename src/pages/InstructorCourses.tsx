import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface InstructorCoursesProps {
  session: Session | null;
}

interface CourseRow {
  id: string;
  name: string;
  instructor_name: string;
  start_date: string | null;
  end_date: string | null;
  student_count: number;
}

export default function InstructorCourses({ session }: InstructorCoursesProps) {
  const userId = session?.user?.id;
  const { data: profile } = useProfile(userId);
  const { toast } = useToast();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["my-courses", userId],
    queryFn: async (): Promise<CourseRow[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("id, name, instructor_name, start_date, end_date")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: students } = await supabase
        .from("profiles")
        .select("course_id")
        .eq("role", "student");

      return (data ?? []).map((c) => ({
        ...c,
        student_count: (students ?? []).filter((s) => s.course_id === c.id).length,
      }));
    },
    enabled: !!userId,
  });

  async function addCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !name.trim()) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("courses")
      .insert({
        name: name.trim(),
        instructor_name: profile?.full_name ?? "Instructor",
        created_by: userId,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      .select("id")
      .single();
    setBusy(false);

    if (error) {
      toast({ title: "Could not add course", description: error.message, variant: "destructive" });
      return;
    }
    // Make it the active course if the instructor has none
    if (!profile?.course_id && data) {
      await supabase.from("profiles").update({ course_id: data.id }).eq("id", userId);
      qc.invalidateQueries({ queryKey: ["profile", userId] });
    }
    setName("");
    setStartDate("");
    setEndDate("");
    qc.invalidateQueries({ queryKey: ["my-courses", userId] });
    toast({ title: "Course created", description: "Students can now select it when registering." });
  }

  async function setActive(courseId: string) {
    if (!userId) return;
    const { error } = await supabase.from("profiles").update({ course_id: courseId }).eq("id", userId);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["profile", userId] });
    toast({ title: "Active course updated" });
  }

  async function deleteCourse(courseId: string, studentCount: number) {
    if (studentCount > 0) {
      toast({
        title: "Cannot delete",
        description: "Students are still enrolled in this course.",
        variant: "destructive",
      });
      return;
    }
    if (!confirm("Delete this course? This cannot be undone.")) return;
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["my-courses", userId] });
    toast({ title: "Course deleted" });
  }

  return (
    <AppLayout
      role="instructor"
      session={session}
      breadcrumbs={[{ label: "Instructor Dashboard", href: "/instructor" }, { label: "Courses" }]}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-foreground">Courses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create courses students can select when they register.
          </p>
        </div>

        <form onSubmit={addCourse} className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-3">
              <Label htmlFor="cname" className="text-xs">Course Name</Label>
              <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} placeholder="COS 206 — Software Engineering" required className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="csd" className="text-xs">Start Date</Label>
              <Input id="csd" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ced" className="text-xs">End Date</Label>
              <Input id="ced" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={busy} className="gap-2 h-9 w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Course
              </Button>
            </div>
          </div>
        </form>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses yet. Add your first course above.</p>
        ) : (
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {courses.map((c) => {
              const isActive = profile?.course_id === c.id;
              return (
                <div key={c.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.student_count} student{c.student_count === 1 ? "" : "s"}
                      {c.start_date ? ` · ${c.start_date} → ${c.end_date ?? "—"}` : ""}
                    </p>
                  </div>
                  {!isActive && (
                    <Button variant="outline" size="sm" onClick={() => setActive(c.id)}>
                      Set active
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCourse(c.id, c.student_count)}
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
