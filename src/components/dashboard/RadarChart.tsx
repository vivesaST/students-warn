import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { StudentFeatures, ClassAverageFeatures } from "@/data/mockData";

interface FeatureRadarChartProps {
  studentFeatures: StudentFeatures;
  classAverageFeatures: ClassAverageFeatures;
  studentName?: string;
}

// Normalize features to 0–100 scale for radar display
function normalize(value: number, min: number, max: number, invert = false) {
  const clamped = Math.min(max, Math.max(min, value));
  const norm = ((clamped - min) / (max - min)) * 100;
  return invert ? 100 - norm : norm;
}

function buildRadarData(student: StudentFeatures, avg: ClassAverageFeatures) {
  return [
    {
      feature: "Commit\nFrequency",
      student: normalize(student.commitFrequencyPerWeek, 0, 20),
      classAvg: normalize(avg.commitFrequencyPerWeek, 0, 20),
    },
    {
      feature: "Regularity",
      student: normalize(student.commitRegularityScore, 0, 100),
      classAvg: normalize(avg.commitRegularityScore, 0, 100),
    },
    {
      feature: "Branch\nUsage",
      student: normalize(student.branchCount, 0, 12),
      classAvg: normalize(avg.branchCount, 0, 12),
    },
    {
      feature: "Issue\nResolution",
      student: normalize(student.issueResolutionTime, 0, 200, true), // invert: lower time = better
      classAvg: normalize(avg.issueResolutionTime, 0, 200, true),
    },
    {
      feature: "Low\nChurn",
      student: normalize(student.codeChurnRatio, 0, 1, true), // invert: lower churn = better
      classAvg: normalize(avg.codeChurnRatio, 0, 1, true),
    },
    {
      feature: "Msg\nQuality",
      student: normalize(student.commitMessageQualityScore, 0, 100),
      classAvg: normalize(avg.commitMessageQualityScore, 0, 100),
    },
  ];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
        <p className="font-semibold text-foreground mb-1">{label.replace(/\n/g, " ")}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.dataKey === "student" ? "You" : "Class avg"}:</span>
            <span className="font-medium text-foreground">{Math.round(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function FeatureRadarChart({ studentFeatures, classAverageFeatures, studentName }: FeatureRadarChartProps) {
  const data = buildRadarData(studentFeatures, classAverageFeatures);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Behavioral Profile</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Student vs class average — higher is better on all axes
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid
              gridType="polygon"
              stroke="hsl(222, 32%, 22%)"
            />
            <PolarAngleAxis
              dataKey="feature"
              tick={{ fill: "hsl(215, 20%, 60%)", fontSize: 10 }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="classAvg"
              dataKey="classAvg"
              stroke="hsl(215, 20%, 55%)"
              fill="hsl(215, 20%, 55%)"
              fillOpacity={0.12}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <Radar
              name="student"
              dataKey="student"
              stroke="hsl(199, 89%, 60%)"
              fill="hsl(199, 89%, 60%)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs justify-center mt-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(199,89%,60%)]" />
          <span className="text-muted-foreground">{studentName ?? "Student"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(215,20%,55%)]" />
          <span className="text-muted-foreground">Class Average</span>
        </div>
      </div>
    </div>
  );
}
