import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSyncGithub() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  async function sync() {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-github-data");
      if (error) {
        const details = error instanceof FunctionsHttpError
          ? await error.context.json().catch(() => null)
          : null;
        throw new Error(details?.error ?? error.message);
      }
      const results: { status: string }[] = data?.results ?? [];
      const synced = results.filter((result) => result.status === "synced").length;
      const failed = results.length - synced;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["students"] }),
        queryClient.invalidateQueries({ queryKey: ["student"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
      ]);
      toast({
        title: failed > 0 ? "GitHub sync partially complete" : "GitHub sync complete",
        description: failed > 0
          ? `Synced ${synced} student(s); ${failed} could not be synced.`
          : `Synced ${synced} student(s).`,
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
