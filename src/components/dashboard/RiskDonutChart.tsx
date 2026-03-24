import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { students } from "@/data/mockData";

const riskColors: Record<string, string> = {
  "High Risk": "hsl(0, 70%, 55%)",
  "Moderate Risk": "hsl(38, 92%, 55%)",
  "Low Risk": "hsl(142, 71%, 45%)",
};

function buildData() {
  const high = students.filter((s) => s.riskLevel === "high").length;
  const moderate = students.filter((s) => s.riskLevel === "moderate").length;
  const low = students.filter((s) => s.riskLevel === "low").length;
  return [
    { name: "High Risk", value: high },
    { name: "Moderate Risk", value: moderate },
    { name: "Low Risk", value: low },
  ];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
        <p className="font-semibold text-foreground">{entry.name}</p>
        <p className="text-muted-foreground">
          {entry.value} student{entry.value !== 1 ? "s" : ""} ({Math.round((entry.value / students.length) * 100)}%)
        </p>
      </div>
    );
  }
  return null;
};

export function RiskDonutChart() {
  const data = buildData();
  const total = students.length;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Risk Distribution</h3>
      <p className="text-xs text-muted-foreground mb-4">{total} students enrolled</p>
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={riskColors[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">Students</span>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-3 space-y-1.5">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: riskColors[entry.name] }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-semibold text-foreground tabular-nums">
              {entry.value} ({Math.round((entry.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
