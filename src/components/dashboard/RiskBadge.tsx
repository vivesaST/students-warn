import { cn } from "@/lib/utils";
import { RiskLevel } from "@/data/mockData";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showScore?: boolean;
  className?: string;
}

const riskConfig = {
  high: {
    label: "High Risk",
    icon: AlertTriangle,
    className: "bg-[hsl(var(--risk-high-bg))] text-[hsl(var(--risk-high))] border border-[hsl(var(--risk-high)/0.3)]",
    dot: "bg-[hsl(var(--risk-high))]",
  },
  moderate: {
    label: "Moderate Risk",
    icon: AlertCircle,
    className: "bg-[hsl(var(--risk-moderate-bg))] text-[hsl(var(--risk-moderate))] border border-[hsl(var(--risk-moderate)/0.3)]",
    dot: "bg-[hsl(var(--risk-moderate))]",
  },
  low: {
    label: "Low Risk",
    icon: CheckCircle,
    className: "bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))] border border-[hsl(var(--risk-low)/0.3)]",
    dot: "bg-[hsl(var(--risk-low))]",
  },
};

const sizeConfig = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-4 py-2 text-sm gap-2",
};

const iconSizeConfig = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function RiskBadge({
  level,
  score,
  size = "md",
  showIcon = true,
  showScore = false,
  className,
}: RiskBadgeProps) {
  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        config.className,
        sizeConfig[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizeConfig[size]} />}
      {config.label}
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-75">({score}%)</span>
      )}
    </span>
  );
}

export function RiskDot({ level }: { level: RiskLevel }) {
  return (
    <span className={cn("inline-block h-2 w-2 rounded-full", riskConfig[level].dot)} />
  );
}
