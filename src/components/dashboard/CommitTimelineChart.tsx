import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WeeklyCommits } from "@/data/mockData";

interface CommitTimelineChartProps {
  data: WeeklyCommits[];
  title?: string;
  subtitle?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl space-y-1">
        <p className="font-semibold text-foreground">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: p.fill }} />
            <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
            <span className="font-medium text-foreground tabular-nums">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CommitTimelineChart({ data, title = "Commit Activity", subtitle }: CommitTimelineChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}
      <div className="h-56 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={14} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 32%, 20%)" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(222, 32%, 18%)" }} />
            <Bar dataKey="linesAdded" name="Lines Added" fill="hsl(199, 89%, 60%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="linesDeleted" name="Lines Deleted" fill="hsl(0, 70%, 55%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(199,89%,60%)]" />
          <span className="text-muted-foreground">Lines Added</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(0,70%,55%)]" />
          <span className="text-muted-foreground">Lines Deleted</span>
        </div>
      </div>
    </div>
  );
}

// Commits-only bar chart for student profile
export function CommitBarChart({ data, title = "Daily Commit Activity" }: { data: { date: string; commits: number }[]; title?: string }) {
  const displayData = data.slice(-21).map((d) => ({
    ...d,
    label: d.date.slice(5), // MM-DD
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">Last 21 days</p>
      <div className="h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 32%, 20%)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={22}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(222, 32%, 18%)" }}
              contentStyle={{
                background: "hsl(222, 40%, 11%)",
                border: "1px solid hsl(222, 32%, 20%)",
                borderRadius: "8px",
                fontSize: "11px",
                color: "hsl(213, 31%, 91%)",
              }}
              formatter={(v: number) => [v, "Commits"]}
              labelFormatter={(l) => `Date: ${l}`}
            />
            <Bar dataKey="commits" fill="hsl(199, 89%, 60%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
