/**
 * EarlyWarn — Rule-Based Risk Assessment Engine
 * ---------------------------------------------
 * A forward-chaining production rule engine. Knowledge is encoded declaratively
 * as a set of IF-THEN production rules of the form:
 *
 *     IF   <condition over the student's GitHub activity features>
 *     THEN assert <risk points>  AND  assert <remediation advice>
 *
 * The inference cycle is:
 *   1. MATCH    — evaluate every rule condition against the working memory (features)
 *   2. CONFLICT — collect the rules that fired
 *   3. ACT      — accumulate their risk points and their recommendations
 *   4. CLASSIFY — apply the terminal classification rules to the accumulated score
 *
 * No statistical model, no trained weights: every decision is traceable to a
 * named rule that a lecturer can read, audit and modify.
 */

/** Working memory: the facts asserted about a student, derived from the GitHub API. */
export interface StudentFacts {
  daysSinceLastCommit: number;
  commitRegularityScore: number; // 0-100
  commitsLastWeek: number;
  commitsLast3Days: number;
  commitFrequencyPerDay: number;
  totalCommits: number;
  codeChurnRatio: number; // 0-1
  commitMessageQualityScore: number; // 0-100
  branchCount: number;
  mergeFrequency: number;
  issueCreationRate: number;
  avgCommitSizeLinesChanged: number;
}

export type RiskLevel = "high" | "moderate" | "low";
export type Priority = "high" | "medium" | "low";

export interface Recommendation {
  priority: Priority;
  title: string;
  description: string;
  icon: string;
}

/** A single IF-THEN production rule. */
export interface Rule {
  /** Stable identifier used in the dissertation rule table and in audit output. */
  id: string;
  category: string;
  /** Human-readable IF-THEN statement of the rule. */
  statement: string;
  /** IF part: the antecedent, evaluated against working memory. */
  condition: (f: StudentFacts) => boolean;
  /** THEN part: risk points asserted when the rule fires (negative = protective). */
  points: number;
  /** THEN part: the remediation advice asserted when the rule fires (optional). */
  recommendation?: (f: StudentFacts) => Recommendation;
}

/** Baseline risk assigned before any rule fires (neutral student). */
export const BASELINE_RISK = 30;

/** Terminal classification rules applied to the accumulated score. */
export const CLASSIFICATION_RULES = [
  { level: "high" as RiskLevel, statement: "IF risk_score >= 65 THEN risk_level = HIGH", test: (s: number) => s >= 65 },
  { level: "moderate" as RiskLevel, statement: "IF risk_score >= 40 THEN risk_level = MODERATE", test: (s: number) => s >= 40 },
  { level: "low" as RiskLevel, statement: "IF risk_score < 40 THEN risk_level = LOW", test: () => true },
];

/**
 * The rule base. Rules are grouped by the engagement dimension they inspect.
 * Points were elicited from supervision practice: inactivity and irregularity
 * dominate, process-quality signals contribute smaller adjustments.
 */
export const RULES: Rule[] = [
  // ---------------------------------------------------------------- Inactivity
  {
    id: "R01",
    category: "Inactivity",
    statement: "IF days_since_last_commit >= 14 THEN add 30 risk points",
    condition: (f) => f.daysSinceLastCommit >= 14,
    points: 30,
    recommendation: (f) => ({
      priority: "high",
      title: "Resume committing immediately",
      description: `No commits have been recorded for ${f.daysSinceLastCommit} days. Push a small change today to re-establish progress.`,
      icon: "AlertTriangle",
    }),
  },
  {
    id: "R02",
    category: "Inactivity",
    statement: "IF 7 <= days_since_last_commit < 14 THEN add 20 risk points",
    condition: (f) => f.daysSinceLastCommit >= 7 && f.daysSinceLastCommit < 14,
    points: 20,
    recommendation: (f) => ({
      priority: "high",
      title: "Break the week-long commit gap",
      description: `Your last commit was ${f.daysSinceLastCommit} days ago. Commit at least once every working day.`,
      icon: "AlertTriangle",
    }),
  },
  {
    id: "R03",
    category: "Inactivity",
    statement: "IF 3 <= days_since_last_commit < 7 THEN add 10 risk points",
    condition: (f) => f.daysSinceLastCommit >= 3 && f.daysSinceLastCommit < 7,
    points: 10,
    recommendation: () => ({
      priority: "medium",
      title: "Shorten the gap between commits",
      description: "Several days have passed without a commit. Smaller, more frequent commits make progress visible.",
      icon: "Clock",
    }),
  },
  {
    id: "R04",
    category: "Inactivity",
    statement: "IF commits_last_3_days >= 3 THEN subtract 5 risk points",
    condition: (f) => f.commitsLast3Days >= 3,
    points: -5,
  },

  // ------------------------------------------------------------ Commit volume
  {
    id: "R05",
    category: "Commit volume",
    statement: "IF commits_last_week = 0 THEN add 20 risk points",
    condition: (f) => f.commitsLastWeek === 0,
    points: 20,
    recommendation: () => ({
      priority: "high",
      title: "No activity this week",
      description: "Nothing was committed in the last seven days. Set a target of at least five commits per week.",
      icon: "TrendingUp",
    }),
  },
  {
    id: "R06",
    category: "Commit volume",
    statement: "IF 1 <= commits_last_week < 3 THEN add 10 risk points",
    condition: (f) => f.commitsLastWeek >= 1 && f.commitsLastWeek < 3,
    points: 10,
    recommendation: () => ({
      priority: "medium",
      title: "Increase weekly commit volume",
      description: "Fewer than three commits this week. Break tasks into smaller, committable units.",
      icon: "TrendingUp",
    }),
  },
  {
    id: "R07",
    category: "Commit volume",
    statement: "IF commits_last_week >= 8 THEN subtract 10 risk points",
    condition: (f) => f.commitsLastWeek >= 8,
    points: -10,
  },
  {
    id: "R08",
    category: "Commit volume",
    statement: "IF total_commits < 5 THEN add 10 risk points",
    condition: (f) => f.totalCommits < 5,
    points: 10,
    recommendation: () => ({
      priority: "high",
      title: "Project has barely started",
      description: "Fewer than five commits exist in total. Begin implementing and committing core functionality now.",
      icon: "GitCommit",
    }),
  },

  // -------------------------------------------------------------- Consistency
  {
    id: "R09",
    category: "Consistency",
    statement: "IF commit_regularity_score < 30 THEN add 15 risk points",
    condition: (f) => f.commitRegularityScore < 30,
    points: 15,
    recommendation: () => ({
      priority: "high",
      title: "Establish a regular commit rhythm",
      description: "Your commits arrive in bursts followed by long silences. Commit at a consistent time each day.",
      icon: "Clock",
    }),
  },
  {
    id: "R10",
    category: "Consistency",
    statement: "IF 30 <= commit_regularity_score < 55 THEN add 8 risk points",
    condition: (f) => f.commitRegularityScore >= 30 && f.commitRegularityScore < 55,
    points: 8,
    recommendation: () => ({
      priority: "medium",
      title: "Improve commit consistency",
      description: "Your commit pattern is uneven. Aim for steady daily activity rather than occasional large pushes.",
      icon: "Clock",
    }),
  },
  {
    id: "R11",
    category: "Consistency",
    statement: "IF commit_frequency_per_day >= 1 THEN subtract 8 risk points",
    condition: (f) => f.commitFrequencyPerDay >= 1,
    points: -8,
  },

  // ------------------------------------------------------------- Code quality
  {
    id: "R12",
    category: "Code quality",
    statement: "IF code_churn_ratio > 0.8 THEN add 10 risk points",
    condition: (f) => f.codeChurnRatio > 0.8,
    points: 10,
    recommendation: () => ({
      priority: "medium",
      title: "Reduce code churn",
      description: "A large share of written code is later deleted. Plan the design before implementing to cut rework.",
      icon: "RefreshCw",
    }),
  },
  {
    id: "R13",
    category: "Code quality",
    statement: "IF avg_commit_size_lines_changed > 400 THEN add 5 risk points",
    condition: (f) => f.avgCommitSizeLinesChanged > 400,
    points: 5,
    recommendation: () => ({
      priority: "low",
      title: "Commit smaller changes",
      description: "Your average commit is very large. Smaller commits are easier to review and to recover from.",
      icon: "GitCommit",
    }),
  },
  {
    id: "R14",
    category: "Code quality",
    statement: "IF commit_message_quality_score < 40 THEN add 10 risk points",
    condition: (f) => f.commitMessageQualityScore < 40,
    points: 10,
    recommendation: () => ({
      priority: "medium",
      title: "Write descriptive commit messages",
      description: "Commit messages are too short or generic. Use 'type: what changed and why'.",
      icon: "FileText",
    }),
  },
  {
    id: "R15",
    category: "Code quality",
    statement: "IF 40 <= commit_message_quality_score < 65 THEN add 5 risk points",
    condition: (f) => f.commitMessageQualityScore >= 40 && f.commitMessageQualityScore < 65,
    points: 5,
    recommendation: () => ({
      priority: "low",
      title: "Sharpen your commit messages",
      description: "Message quality is acceptable but vague. State the purpose of each change, not just the file touched.",
      icon: "FileText",
    }),
  },

  // ----------------------------------------------------------- Process maturity
  {
    id: "R16",
    category: "Process maturity",
    statement: "IF branch_count < 2 THEN add 5 risk points",
    condition: (f) => f.branchCount < 2,
    points: 5,
    recommendation: () => ({
      priority: "low",
      title: "Use feature branches",
      description: "All work is happening on a single branch. Create a branch per feature or fix.",
      icon: "GitBranch",
    }),
  },
  {
    id: "R17",
    category: "Process maturity",
    statement: "IF merge_frequency = 0 AND branch_count >= 2 THEN add 5 risk points",
    condition: (f) => f.mergeFrequency === 0 && f.branchCount >= 2,
    points: 5,
    recommendation: () => ({
      priority: "low",
      title: "Integrate your branches",
      description: "Branches exist but nothing has been merged. Merge completed work back regularly to avoid drift.",
      icon: "GitMerge",
    }),
  },
  {
    id: "R18",
    category: "Process maturity",
    statement: "IF issue_creation_rate = 0 THEN add 5 risk points",
    condition: (f) => f.issueCreationRate === 0,
    points: 5,
    recommendation: () => ({
      priority: "low",
      title: "Plan work using issues",
      description: "No GitHub issues have been raised. Track features and bugs as issues to evidence project planning.",
      icon: "Bug",
    }),
  },
];

export interface FiredRule {
  id: string;
  category: string;
  statement: string;
  points: number;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  firedRules: FiredRule[];
  recommendations: Recommendation[];
}

/** Priority ordering used when selecting the most important advice to display. */
const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/**
 * Run one inference cycle of the rule engine over a student's facts.
 * Returns the score, its classification, and the full audit trail of fired rules.
 */
export function evaluateRisk(facts: StudentFacts, maxRecommendations = 4): RiskAssessment {
  const firedRules: FiredRule[] = [];
  const recommendations: Recommendation[] = [];

  // MATCH + ACT
  for (const rule of RULES) {
    if (!rule.condition(facts)) continue;
    firedRules.push({ id: rule.id, category: rule.category, statement: rule.statement, points: rule.points });
    if (rule.recommendation) recommendations.push(rule.recommendation(facts));
  }

  // Accumulate
  const raw = firedRules.reduce((total, rule) => total + rule.points, BASELINE_RISK);
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  // CLASSIFY
  const level = CLASSIFICATION_RULES.find((rule) => rule.test(score))!.level;

  recommendations.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return { score, level, firedRules, recommendations: recommendations.slice(0, maxRecommendations) };
}
