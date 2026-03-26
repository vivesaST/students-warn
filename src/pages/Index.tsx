import { useNavigate } from "react-router-dom";
import { GraduationCap, BarChart2, AlertTriangle, BookOpen, ArrowRight, GitBranch, Brain, Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { useProfile } from "@/hooks/useProfile";
import { useStudents } from "@/hooks/useStudents";

interface IndexProps {
  session: Session | null;
}

export default function Index({ session }: IndexProps) {
  const navigate = useNavigate();
  const { data: profile } = useProfile(session?.user?.id);
  const { data: students = [], isLoading } = useStudents(profile?.course_id);

  const highRisk = students.filter((s) => s.riskLevel === "high").length;
  const total = students.length;

  function goToDashboard() {
    if (!profile) return;
    navigate(profile.role === "instructor" ? "/instructor" : "/student");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">EarlyWarn</h1>
          <p className="text-xs text-muted-foreground">Student Risk Detection System</p>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center mb-10 max-w-lg">
        <h2 className="text-3xl font-bold text-foreground mb-3 leading-tight">
          Early Warning System for<br />
          <span className="text-primary">Student Project Failure</span>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Machine learning–powered platform that monitors GitHub activity, predicts project risk, and provides actionable recommendations before it's too late.
        </p>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-6 mb-10 p-4 rounded-xl border border-border bg-card/50 backdrop-blur">
        <div className="text-center">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /> : <p className="text-2xl font-bold text-foreground">{total || 12}</p>}
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Students</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /> : <p className="text-2xl font-bold text-[hsl(var(--risk-high))]">{highRisk || 3}</p>}
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">At Risk</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">15</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Features</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">3</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ML Models</p>
        </div>
      </div>

      {/* Single CTA based on role */}
      {profile ? (
        <button
          onClick={goToDashboard}
          className="group relative rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 w-full max-w-sm mb-8"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-4">
            {profile.role === "instructor" ? <BarChart2 className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">
            {profile.role === "instructor" ? "Instructor Dashboard" : "Student Dashboard"}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Welcome back, <strong>{profile.full_name.split(" ")[0]}</strong>. Click to open your dashboard.
          </p>
          <div className="flex items-center gap-1 text-xs font-semibold text-primary">
            Go to Dashboard <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
          <button
            onClick={() => navigate("/instructor")}
            className="group relative rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--chart-1)/0.15)] text-[hsl(var(--chart-1))] mb-4">
              <BarChart2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">Instructor View</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Monitor all students, risk distribution charts, and individual profiles.</p>
            <div className="flex items-center gap-1 text-xs font-semibold text-primary">
              Open Dashboard <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          <button
            onClick={() => navigate("/student")}
            className="group relative rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-[hsl(var(--risk-low)/0.5)] hover:shadow-xl hover:shadow-[hsl(var(--risk-low)/0.1)] hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))] mb-4">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">Student View</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">See your personal risk level, metrics vs class averages, and recommendations.</p>
            <div className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--risk-low))]">
              Open Dashboard <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      )}

      {/* Features row */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        {[
          { icon: GitBranch, label: "GitHub/GitLab Integration" },
          { icon: Brain, label: "ML Predictions" },
          { icon: AlertTriangle, label: "Real-time Risk Alerts" },
          { icon: BookOpen, label: "Course Management" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-primary" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
