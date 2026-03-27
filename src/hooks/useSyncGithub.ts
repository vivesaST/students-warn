import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSyncGithub() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  async function sync() {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-github-data");
      if (error) throw error;
      toast({
        title: "GitHub sync complete",
        description: `Synced ${data?.results?.filter((r: any) => r.status === "synced").length ?? 0} student(s).`,
      });
      return data;
    } catch (err) {
      toast({
        title: "Sync failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }

  return { sync, isSyncing };
}
