import { Recommendation } from "@/data/mockData";
import { AlertTriangle, AlertCircle, CheckCircle, Clock, GitBranch, GitCommit, MessageSquare, RefreshCw, Star, TrendingUp, Bug, Users, FileText, Settings, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  GitBranch,
  GitCommit,
  MessageSquare,
  RefreshCw,
  Star,
  TrendingUp,
  Bug,
  Users,
  FileText,
  Settings,
  Calendar,
};

const priorityConfig = {
  high: {
    border: "border-l-[hsl(var(--risk-high))]",
    badge: "bg-[hsl(var(--risk-high-bg))] text-[hsl(var(--risk-high))]",
    label: "High Priority",
  },
  medium: {
    border: "border-l-[hsl(var(--risk-moderate))]",
    badge: "bg-[hsl(var(--risk-moderate-bg))] text-[hsl(var(--risk-moderate))]",
    label: "Medium Priority",
  },
  low: {
    border: "border-l-[hsl(var(--risk-low))]",
    badge: "bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))]",
    label: "Low Priority",
  },
};

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  title?: string;
}

export function RecommendationsPanel({ recommendations, title = "Recommendations" }: RecommendationsPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">AI-generated action items based on behavioral analysis</p>
      <div className="space-y-3">
        {recommendations.map((rec) => {
          const cfg = priorityConfig[rec.priority];
          const Icon = iconMap[rec.icon] ?? AlertCircle;
          return (
            <div
              key={rec.id}
              className={cn(
                "rounded-lg border border-border bg-muted/30 p-4 border-l-2 transition-colors hover:bg-muted/50",
                cfg.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  cfg.badge
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-xs font-semibold text-foreground">{rec.title}</p>
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide", cfg.badge)}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
