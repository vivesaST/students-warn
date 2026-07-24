import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">EarlyWarn</h1>
      </div>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground mt-4">Redirecting to your dashboard…</p>
    </div>
  );
}
