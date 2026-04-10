import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { useProfile } from "@/hooks/useProfile";

interface IndexProps {
  session: Session | null;
}

export default function Index({ session }: IndexProps) {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile(session?.user?.id);

  useEffect(() => {
    if (!isLoading && profile) {
      navigate(profile.role === "instructor" ? "/instructor" : "/student", { replace: true });
    }
  }, [isLoading, profile, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">EarlyWarn</h1>
          <p className="text-xs text-muted-foreground">Student Risk Detection System</p>
        </div>
      </div>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground mt-4">Redirecting to your dashboard…</p>
    </div>
  );
}
