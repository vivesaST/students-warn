import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Course {
  id: string;
  name: string;
  instructor_name: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupRole, setSignupRole] = useState<"student" | "instructor">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lecturer fields
  const [courseName, setCourseName] = useState("");

  // Student GitHub fields
  const [githubUsername, setGithubUsername] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // Student fields
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Fetch available courses when student signup is active
  useEffect(() => {
    if (mode === "signup" && signupRole === "student") {
      setCoursesLoading(true);
      supabase
        .from("courses")
        .select("id, name, instructor_name")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setCourses(data ?? []);
          setCoursesLoading(false);
        });
    }
  }, [mode, signupRole]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const metadata: Record<string, string> = {
          full_name: fullName.trim() || email.split("@")[0],
          role: signupRole,
        };

        if (signupRole === "instructor") {
          if (!courseName.trim()) {
            setError("Please enter a course name.");
            setLoading(false);
            return;
          }
          metadata.course_name = courseName.trim();
        } else {
          if (!selectedCourseId) {
            setError("Please select a course to join.");
            setLoading(false);
            return;
          }
          if (!githubUsername.trim() || !githubUrl.trim()) {
            setError("Please enter your GitHub username and repository URL.");
            setLoading(false);
            return;
          }
          const repoMatch = githubUrl
            .trim()
            .replace(/[?#].*$/, "")
            .replace(/\/+$/, "")
            .replace(/\.git$/i, "")
            .match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)$/i);
          if (!repoMatch) {
            setError("Enter a valid repository URL, e.g. https://github.com/your-username/your-project");
            setLoading(false);
            return;
          }
          metadata.course_id = selectedCourseId;
          metadata.github_username = githubUsername.trim().replace(/^@/, "");
          metadata.github_url = `https://github.com/${repoMatch[1]}/${repoMatch[2]}`;

        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: metadata,
          },
        });
        if (signUpError) throw signUpError;
        setError("Check your email for a confirmation link!");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <p className="text-xl font-bold text-foreground tracking-tight">EarlyWarn</p>
        </div>


        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
          <h1 className="text-lg font-bold text-foreground mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-xs text-muted-foreground mb-6">
            {mode === "login"
              ? "Sign in to access your dashboard"
              : "Register to join or create a course"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role toggle for signup */}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label className="text-xs">I am a</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole("student")}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                      signupRole === "student"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <GraduationCap className="h-4 w-4" />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole("instructor")}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                      signupRole === "instructor"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    Lecturer
                  </button>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Dr Sadiq Umar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-9 text-sm"
                />
              </div>
            )}

            {/* Lecturer: course name */}
            {mode === "signup" && signupRole === "instructor" && (
              <div className="space-y-1.5">
                <Label htmlFor="courseName" className="text-xs">Course Name</Label>
                <Input
                  id="courseName"
                  type="text"
                  placeholder="Software Engineering 2025"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="h-9 text-sm"
                />
              </div>
            )}

            {/* Student: GitHub details */}
            {mode === "signup" && signupRole === "student" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="ghUser" className="text-xs">GitHub Username</Label>
                  <Input
                    id="ghUser"
                    type="text"
                    placeholder="octocat"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ghUrl" className="text-xs">Project Repository URL</Label>
                  <Input
                    id="ghUrl"
                    type="url"
                    placeholder="https://github.com/octocat/my-project"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    required
                    className="h-9 text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">Your lecturer uses this to track your commit activity. The repository must be <span className="font-medium">public</span>.</p>
                </div>
              </>
            )}

            {/* Student: course picker */}

            {mode === "signup" && signupRole === "student" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Select Course</Label>
                {coursesLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading courses…
                  </div>
                ) : courses.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">No courses available. Ask your lecturer to register first.</p>
                ) : (
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Choose a course…" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} — {c.instructor_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@uni.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className={`text-xs rounded-md px-3 py-2 ${error.includes("Check your email") ? "bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))]" : "bg-destructive/10 text-destructive"}`}>
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-9 text-sm" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                className="text-primary hover:underline font-medium"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
