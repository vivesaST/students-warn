import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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

  const noProfile = !isLoading && !profile;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">EarlyWarn</h1>
      </div>

      {noProfile ? (
        <div className="text-center max-w-sm space-y-3">
          <p className="text-sm text-foreground font-medium">No profile found for this account</p>
          <p className="text-xs text-muted-foreground">
            This account has no profile record. Sign out and register again to set up your account.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/auth", { replace: true });
            }}
          >
            Sign out
          </Button>
        </div>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-4">Redirecting to your dashboard…</p>
        </>
      )}
    </div>
  );
}

