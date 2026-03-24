import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "./RiskBadge";
import { Student, RiskLevel } from "@/data/mockData";
import { ArrowUpDown, ChevronRight, GitCommit, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentTableProps {
  students: Student[];
}

type SortKey = "name" | "riskScore" | "lastCommitDate" | "totalCommits";
type SortDir = "asc" | "desc";

const riskOrder: Record<RiskLevel, number> = { high: 0, moderate: 1, low: 2 };

export function StudentTable({ students }: StudentTableProps) {
  const navigate = useNavigate();
  const [filterRisk, setFilterRisk] = useState<RiskLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("riskScore");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const filtered = students
    .filter((s) => filterRisk === "all" || s.riskLevel === filterRisk)
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.githubUsername.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "riskScore") cmp = a.riskScore - b.riskScore;
      else if (sortKey === "lastCommitDate") cmp = a.lastCommitDate.localeCompare(b.lastCommitDate);
      else if (sortKey === "totalCommits") cmp = a.totalCommits - b.totalCommits;
      return sortDir === "asc" ? cmp : -cmp;
    });

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  function avatarColor(level: RiskLevel) {
    if (level === "high") return "bg-[hsl(var(--risk-high-bg))] text-[hsl(var(--risk-high))]";
    if (level === "moderate") return "bg-[hsl(var(--risk-moderate-bg))] text-[hsl(var(--risk-moderate))]";
    return "bg-[hsl(var(--risk-low-bg))] text-[hsl(var(--risk-low))]";
  }

  function SortIcon({ k }: { k: SortKey }) {
    return (
      <ArrowUpDown className={cn(
        "ml-1 h-3 w-3 inline",
        sortKey === k ? "text-primary" : "text-muted-foreground"
      )} />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground shrink-0">All Students</h3>
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 rounded-md border border-border bg-input pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-40"
            />
          </div>
          {/* Risk filter */}
          {(["all", "high", "moderate", "low"] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterRisk(lvl)}
              className={cn(
                "h-7 rounded-md px-2.5 text-xs font-medium transition-colors",
                filterRisk === lvl
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {lvl === "all" ? "All" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs">
                <button onClick={() => handleSort("name")} className="flex items-center hover:text-foreground">
                  Student <SortIcon k="name" />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground text-xs">
                <button onClick={() => handleSort("riskScore")} className="flex items-center hover:text-foreground">
                  Risk Level <SortIcon k="riskScore" />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground text-xs hidden md:table-cell">
                <button onClick={() => handleSort("lastCommitDate")} className="flex items-center hover:text-foreground">
                  Last Commit <SortIcon k="lastCommitDate" />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground text-xs hidden lg:table-cell">
                <button onClick={() => handleSort("totalCommits")} className="flex items-center hover:text-foreground">
                  Commits <SortIcon k="totalCommits" />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground text-xs hidden xl:table-cell">Prediction Score</TableHead>
              <TableHead className="text-muted-foreground text-xs text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((student) => (
              <TableRow
                key={student.id}
                className="border-border cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/instructor/student/${student.id}`)}
              >
                {/* Student */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      avatarColor(student.riskLevel)
                    )}>
                      {getInitials(student.name)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{student.name}</p>
                      <p className="text-[10px] text-muted-foreground">@{student.githubUsername}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Risk */}
                <TableCell>
                  <RiskBadge level={student.riskLevel} score={student.riskScore} showScore size="sm" />
                </TableCell>

                {/* Last Commit */}
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {student.lastCommitDate}
                </TableCell>

                {/* Commits */}
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <GitCommit className="h-3 w-3 text-muted-foreground" />
                    <span className="tabular-nums">{student.totalCommits}</span>
                    <span className="text-muted-foreground">({student.commitsThisWeek}/wk)</span>
                  </div>
                </TableCell>

                {/* Prediction Score bar */}
                <TableCell className="hidden xl:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${student.riskScore}%`,
                          backgroundColor:
                            student.riskLevel === "high"
                              ? "hsl(0,70%,55%)"
                              : student.riskLevel === "moderate"
                              ? "hsl(38,92%,55%)"
                              : "hsl(142,71%,45%)",
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums w-6">{student.riskScore}</span>
                  </div>
                </TableCell>

                {/* Action */}
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={(e) => { e.stopPropagation(); navigate(`/instructor/student/${student.id}`); }}
                  >
                    View <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                  No students match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
        Showing {filtered.length} of {students.length} students
      </div>
    </div>
  );
}
