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
      const results: { username?: string; status: string; detail?: string }[] = data?.results ?? [];
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
          ? `Synced ${synced} student(s). Failed: ` +
            results
              .filter((result) => result.status !== "synced")
              .map((result) => `${result.username ?? "unknown"} — ${result.detail ?? result.status}`)
              .join(" | ")
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
