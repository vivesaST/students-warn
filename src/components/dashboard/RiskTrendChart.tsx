import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { WeeklyRisk } from "@/data/mockData";

interface RiskTrendChartProps {
  data: WeeklyRisk[];
  title?: string;
  subtitle?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const score = payload[0].value as number;
    const level = score >= 65 ? "High Risk" : score >= 40 ? "Moderate Risk" : "Low Risk";
    const color = score >= 65 ? "hsl(0,70%,55%)" : score >= 40 ? "hsl(38,92%,55%)" : "hsl(142,71%,45%)";
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-muted-foreground">
          Risk Score: <span className="font-bold tabular-nums" style={{ color }}>{score}</span>
        </p>
        <p style={{ color }} className="font-medium">{level}</p>
      </div>
    );
  }
  return null;
};

function getRiskColor(score: number) {
  if (score >= 65) return "hsl(0,70%,55%)";
  if (score >= 40) return "hsl(38,92%,55%)";
  return "hsl(142,71%,45%)";
}

export function RiskTrendChart({ data, title = "Risk Score Over Time", subtitle }: RiskTrendChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>}
      <p className="text-xs text-muted-foreground mb-4">Higher score = greater risk of failure</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 32%, 20%)" />
            <XAxis
              dataKey="week"
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Risk zone reference lines */}
            <ReferenceLine y={65} stroke="hsl(0,70%,55%)" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "High", fill: "hsl(0,70%,55%)", fontSize: 9, position: "right" }} />
            <ReferenceLine y={40} stroke="hsl(38,92%,55%)" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "Mod", fill: "hsl(38,92%,55%)", fontSize: 9, position: "right" }} />
            <Line
              type="monotone"
              dataKey="riskScore"
              stroke="hsl(199, 89%, 60%)"
              strokeWidth={2.5}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                return (
                  <circle
                    key={payload.week}
                    cx={cx}
                    cy={cy}
                    r={3.5}
                    fill={getRiskColor(payload.riskScore)}
                    stroke="hsl(222, 40%, 11%)"
                    strokeWidth={1.5}
                  />
                );
              }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
