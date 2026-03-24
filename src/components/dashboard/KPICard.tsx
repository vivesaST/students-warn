import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "danger" | "warning" | "success" | "info";
  className?: string;
}

const variantConfig = {
  default: {
    iconBg: "bg-[hsl(var(--chart-1)/0.15)]",
    iconColor: "text-[hsl(var(--chart-1))]",
    valueColor: "text-foreground",
  },
  danger: {
    iconBg: "bg-[hsl(var(--risk-high-bg))]",
    iconColor: "text-[hsl(var(--risk-high))]",
    valueColor: "text-[hsl(var(--risk-high))]",
  },
  warning: {
    iconBg: "bg-[hsl(var(--risk-moderate-bg))]",
    iconColor: "text-[hsl(var(--risk-moderate))]",
    valueColor: "text-[hsl(var(--risk-moderate))]",
  },
  success: {
    iconBg: "bg-[hsl(var(--risk-low-bg))]",
    iconColor: "text-[hsl(var(--risk-low))]",
    valueColor: "text-[hsl(var(--risk-low))]",
  },
  info: {
    iconBg: "bg-[hsl(var(--chart-5)/0.15)]",
    iconColor: "text-[hsl(var(--chart-5))]",
    valueColor: "text-foreground",
  },
};

export function KPICard({ title, value, subtitle, icon: Icon, trend, variant = "default", className }: KPICardProps) {
  const cfg = variantConfig[variant];

  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-5 flex items-start gap-4 transition-all hover:border-border/80 hover:shadow-lg hover:shadow-black/20",
      className
    )}>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", cfg.iconBg)}>
        <Icon className={cn("h-5 w-5", cfg.iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">{title}</p>
        <p className={cn("mt-1 text-2xl font-bold tabular-nums", cfg.valueColor)}>{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground truncate">{subtitle}</p>}
        {trend && (
          <p className={cn(
            "mt-1 text-xs font-medium",
            trend.value > 0 ? "text-[hsl(var(--risk-high))]" : "text-[hsl(var(--risk-low))]"
          )}>
            {trend.value > 0 ? "↑" : "↓"} {Math.abs(trend.value)} {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
