export type RiskLevel = "high" | "moderate" | "low";

export interface Student {
  id: string;
  name: string;
  email: string;
  githubUsername: string;
  githubUrl: string;
  courseId: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100, higher = more at risk
  lastCommitDate: string;
  totalCommits: number;
  commitsThisWeek: number;
  enrolledDate: string;
  features: StudentFeatures;
  weeklyRiskHistory: WeeklyRisk[];
  commitHistory: DailyCommits[];
  weeklyCommitHistory: WeeklyCommits[];
  recommendations: Recommendation[];
  hasGithubData?: boolean;
}

export interface StudentFeatures {
  commitFrequencyPerDay: number;
  commitFrequencyPerWeek: number;
  commitRegularityScore: number; // 0-100
  totalCommits: number;
  avgCommitSizeLinesChanged: number;
  codeChurnRatio: number;
  branchCount: number;
  mergeFrequency: number;
  issueCreationRate: number;
  issueResolutionTime: number; // hours
  daysSinceLastCommit: number;
  commitsLast3Days: number;
  commitsLastWeek: number;
  filesModifiedCount: number;
  commitMessageQualityScore: number; // 0-100
}

export interface WeeklyRisk {
  week: string;
  riskScore: number;
  label: string;
}

export interface DailyCommits {
  date: string;
  commits: number;
}

export interface WeeklyCommits {
  week: string;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
}

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  icon: string;
}

export interface Course {
  id: string;
  name: string;
  instructorName: string;
  startDate: string;
  endDate: string;
  totalStudents: number;
}

export interface ClassAverageFeatures {
  commitFrequencyPerDay: number;
  commitFrequencyPerWeek: number;
  commitRegularityScore: number;
  totalCommits: number;
  avgCommitSizeLinesChanged: number;
  codeChurnRatio: number;
  branchCount: number;
  mergeFrequency: number;
  issueCreationRate: number;
  issueResolutionTime: number;
  daysSinceLastCommit: number;
  commitsLast3Days: number;
  commitsLastWeek: number;
  filesModifiedCount: number;
  commitMessageQualityScore: number;
}

// ── Course ──────────────────────────────────────────────────
export const course: Course = {
  id: "cs2025",
  name: "Software Engineering 2025",
  instructorName: "Dr. Sarah Mitchell",
  startDate: "2025-01-15",
  endDate: "2025-06-30",
  totalStudents: 12,
};

// ── Helpers ─────────────────────────────────────────────────
function generateWeeklyRisk(baseScore: number, trend: "rising" | "falling" | "stable"): WeeklyRisk[] {
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];
  return weeks.map((week, i) => {
    let score = baseScore;
    if (trend === "rising") score = Math.min(95, baseScore - 20 + i * 3 + (Math.random() * 8 - 4));
    else if (trend === "falling") score = Math.max(10, baseScore + 20 - i * 3 + (Math.random() * 8 - 4));
    else score = baseScore + (Math.random() * 12 - 6);
    return { week, label: `Week ${i + 1}`, riskScore: Math.round(Math.min(95, Math.max(5, score))) };
  });
}

function generateDailyCommits(avgPerDay: number): DailyCommits[] {
  const result: DailyCommits[] = [];
  const now = new Date("2025-03-24");
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const multiplier = isWeekend ? 0.3 : 1;
    const commits = Math.round(Math.max(0, (avgPerDay + (Math.random() * 4 - 2)) * multiplier));
    result.push({ date: dateStr, commits });
  }
  return result;
}

function generateWeeklyCommits(avgPerWeek: number): WeeklyCommits[] {
  const weeks = ["Jan W2", "Jan W3", "Jan W4", "Feb W1", "Feb W2", "Feb W3", "Feb W4", "Mar W1"];
  return weeks.map((week) => {
    const commits = Math.round(Math.max(0, avgPerWeek + (Math.random() * 6 - 3)));
    return {
      week,
      commits,
      linesAdded: Math.round(commits * (40 + Math.random() * 60)),
      linesDeleted: Math.round(commits * (10 + Math.random() * 30)),
    };
  });
}

// ── Students ─────────────────────────────────────────────────
export const students: Student[] = [
  // ── HIGH RISK (3) ──
  {
    id: "s001",
    name: "Marcus Chen",
    email: "marcus.chen@uni.edu",
    githubUsername: "mchen-dev",
    githubUrl: "https://github.com/mchen-dev",
    courseId: "cs2025",
    riskLevel: "high",
    riskScore: 87,
    lastCommitDate: "2025-03-10",
    totalCommits: 8,
    commitsThisWeek: 0,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 0.15,
      commitFrequencyPerWeek: 1.0,
      commitRegularityScore: 12,
      totalCommits: 8,
      avgCommitSizeLinesChanged: 210,
      codeChurnRatio: 0.78,
      branchCount: 1,
      mergeFrequency: 0.1,
      issueCreationRate: 0.2,
      issueResolutionTime: 168,
      daysSinceLastCommit: 14,
      commitsLast3Days: 0,
      commitsLastWeek: 0,
      filesModifiedCount: 12,
      commitMessageQualityScore: 22,
    },
    weeklyRiskHistory: generateWeeklyRisk(87, "rising"),
    commitHistory: generateDailyCommits(0.2),
    weeklyCommitHistory: generateWeeklyCommits(1),
    recommendations: [
      { id: "r1", priority: "high", title: "Start committing immediately", description: "You haven't committed in 14 days. Break your work into small daily commits to show progress and avoid losing work.", icon: "AlertTriangle" },
      { id: "r2", priority: "high", title: "Create feature branches", description: "You're working directly on main. Use branches for each feature to practice professional workflows.", icon: "GitBranch" },
      { id: "r3", priority: "medium", title: "Improve commit messages", description: "Your commit messages score 22/100. Write descriptive messages like 'Add user authentication with JWT' instead of 'fix stuff'.", icon: "MessageSquare" },
    ],
  },
  {
    id: "s002",
    name: "Aisha Patel",
    email: "aisha.patel@uni.edu",
    githubUsername: "aisha-codes",
    githubUrl: "https://github.com/aisha-codes",
    courseId: "cs2025",
    riskLevel: "high",
    riskScore: 79,
    lastCommitDate: "2025-03-17",
    totalCommits: 14,
    commitsThisWeek: 1,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 0.3,
      commitFrequencyPerWeek: 2.1,
      commitRegularityScore: 25,
      totalCommits: 14,
      avgCommitSizeLinesChanged: 340,
      codeChurnRatio: 0.65,
      branchCount: 2,
      mergeFrequency: 0.3,
      issueCreationRate: 0.5,
      issueResolutionTime: 120,
      daysSinceLastCommit: 7,
      commitsLast3Days: 1,
      commitsLastWeek: 2,
      filesModifiedCount: 28,
      commitMessageQualityScore: 38,
    },
    weeklyRiskHistory: generateWeeklyRisk(79, "rising"),
    commitHistory: generateDailyCommits(0.4),
    weeklyCommitHistory: generateWeeklyCommits(2),
    recommendations: [
      { id: "r1", priority: "high", title: "Increase commit frequency", description: "Aim for at least 1 commit per day on working days. Daily commits help track progress and prevent large merge conflicts.", icon: "TrendingUp" },
      { id: "r2", priority: "medium", title: "Reduce large commit sizes", description: "Your average commit changes 340 lines. Break large changes into smaller, focused commits.", icon: "GitCommit" },
      { id: "r3", priority: "medium", title: "Track issues more actively", description: "Create GitHub issues for each feature or bug. This improves project planning and visibility.", icon: "Bug" },
    ],
  },
  {
    id: "s003",
    name: "Jordan Williams",
    email: "jordan.w@uni.edu",
    githubUsername: "jwilliams-cs",
    githubUrl: "https://github.com/jwilliams-cs",
    courseId: "cs2025",
    riskLevel: "high",
    riskScore: 74,
    lastCommitDate: "2025-03-19",
    totalCommits: 18,
    commitsThisWeek: 2,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 0.45,
      commitFrequencyPerWeek: 3.1,
      commitRegularityScore: 30,
      totalCommits: 18,
      avgCommitSizeLinesChanged: 290,
      codeChurnRatio: 0.60,
      branchCount: 2,
      mergeFrequency: 0.4,
      issueCreationRate: 0.3,
      issueResolutionTime: 96,
      daysSinceLastCommit: 5,
      commitsLast3Days: 1,
      commitsLastWeek: 3,
      filesModifiedCount: 22,
      commitMessageQualityScore: 41,
    },
    weeklyRiskHistory: generateWeeklyRisk(74, "stable"),
    commitHistory: generateDailyCommits(0.5),
    weeklyCommitHistory: generateWeeklyCommits(3),
    recommendations: [
      { id: "r1", priority: "high", title: "Establish a regular commit schedule", description: "Your commit regularity score is 30/100. Try committing at the same time each day to build consistency.", icon: "Clock" },
      { id: "r2", priority: "medium", title: "Use more branches", description: "With only 2 branches, you're likely mixing multiple features. Create a branch per feature.", icon: "GitBranch" },
      { id: "r3", priority: "low", title: "Review and refactor churned code", description: "60% code churn suggests rewrites. Spend time planning before coding to reduce rework.", icon: "RefreshCw" },
    ],
  },

  // ── MODERATE RISK (5) ──
  {
    id: "s004",
    name: "Sofia Ramirez",
    email: "sofia.r@uni.edu",
    githubUsername: "sofiadev",
    githubUrl: "https://github.com/sofiadev",
    courseId: "cs2025",
    riskLevel: "moderate",
    riskScore: 58,
    lastCommitDate: "2025-03-21",
    totalCommits: 31,
    commitsThisWeek: 4,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 0.9,
      commitFrequencyPerWeek: 6.3,
      commitRegularityScore: 55,
      totalCommits: 31,
      avgCommitSizeLinesChanged: 145,
      codeChurnRatio: 0.42,
      branchCount: 4,
      mergeFrequency: 0.7,
      issueCreationRate: 1.1,
      issueResolutionTime: 48,
      daysSinceLastCommit: 3,
      commitsLast3Days: 3,
      commitsLastWeek: 6,
      filesModifiedCount: 35,
      commitMessageQualityScore: 60,
    },
    weeklyRiskHistory: generateWeeklyRisk(58, "falling"),
    commitHistory: generateDailyCommits(0.9),
    weeklyCommitHistory: generateWeeklyCommits(6),
    recommendations: [
      { id: "r1", priority: "medium", title: "Improve commit message quality", description: "Your message quality is 60/100. Add more context: what changed and why.", icon: "MessageSquare" },
      { id: "r2", priority: "medium", title: "Reduce code churn", description: "42% churn suggests design changes mid-implementation. Plan your architecture before coding.", icon: "RefreshCw" },
      { id: "r3", priority: "low", title: "Close issues faster", description: "Average resolution time is 48 hours. Try to close issues within 24 hours of opening them.", icon: "CheckCircle" },
    ],
  },
  {
    id: "s005",
    name: "Dmitri Volkov",
    email: "dmitri.v@uni.edu",
    githubUsername: "dvolkov",
    githubUrl: "https://github.com/dvolkov",
    courseId: "cs2025",
    riskLevel: "moderate",
    riskScore: 55,
    lastCommitDate: "2025-03-22",
    totalCommits: 28,
    commitsThisWeek: 3,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 0.8,
      commitFrequencyPerWeek: 5.6,
      commitRegularityScore: 52,
      totalCommits: 28,
      avgCommitSizeLinesChanged: 160,
      codeChurnRatio: 0.38,
      branchCount: 3,
      mergeFrequency: 0.65,
      issueCreationRate: 0.8,
      issueResolutionTime: 56,
      daysSinceLastCommit: 2,
      commitsLast3Days: 2,
      commitsLastWeek: 5,
      filesModifiedCount: 29,
      commitMessageQualityScore: 62,
    },
    weeklyRiskHistory: generateWeeklyRisk(55, "stable"),
    commitHistory: generateDailyCommits(0.8),
    weeklyCommitHistory: generateWeeklyCommits(5),
    recommendations: [
      { id: "r1", priority: "medium", title: "Increase branch usage", description: "You're using 3 branches. Aim for 5-7 active branches with one per feature or sprint task.", icon: "GitBranch" },
      { id: "r2", priority: "low", title: "Improve commit regularity", description: "Your regularity score is 52/100. Try committing at consistent times each day.", icon: "Clock" },
      { id: "r3", priority: "low", title: "Write more descriptive messages", description: "Good progress on message quality (62/100). Aim for 75+ by including 'why' in each message.", icon: "MessageSquare" },
    ],
  },
  {
    id: "s006",
    name: "Priya Singh",
    email: "priya.s@uni.edu",
    githubUsername: "priya-builds",
    githubUrl: "https://github.com/priya-builds",
    courseId: "cs2025",
    riskLevel: "moderate",
    riskScore: 62,
    lastCommitDate: "2025-03-20",
    totalCommits: 26,
    commitsThisWeek: 3,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 0.75,
      commitFrequencyPerWeek: 5.2,
      commitRegularityScore: 48,
      totalCommits: 26,
      avgCommitSizeLinesChanged: 175,
      codeChurnRatio: 0.45,
      branchCount: 3,
      mergeFrequency: 0.6,
      issueCreationRate: 0.9,
      issueResolutionTime: 60,
      daysSinceLastCommit: 4,
      commitsLast3Days: 2,
      commitsLastWeek: 4,
      filesModifiedCount: 26,
      commitMessageQualityScore: 55,
    },
    weeklyRiskHistory: generateWeeklyRisk(62, "stable"),
    commitHistory: generateDailyCommits(0.7),
    weeklyCommitHistory: generateWeeklyCommits(5),
    recommendations: [
      { id: "r1", priority: "medium", title: "Commit more consistently", description: "Your regularity score is 48/100. Inconsistent commits make progress hard to track.", icon: "Clock" },
      { id: "r2", priority: "medium", title: "Reduce days between commits", description: "You went 4 days without committing. Set a goal of committing every working day.", icon: "Calendar" },
      { id: "r3", priority: "low", title: "Improve commit message quality", description: "Score of 55/100. Add ticket numbers and describe the purpose of each change.", icon: "MessageSquare" },
    ],
  },
  {
    id: "s007",
    name: "Tom Adeyemi",
    email: "tom.a@uni.edu",
    githubUsername: "tomadeyemi",
    githubUrl: "https://github.com/tomadeyemi",
    courseId: "cs2025",
    riskLevel: "moderate",
    riskScore: 52,
    lastCommitDate: "2025-03-22",
    totalCommits: 33,
    commitsThisWeek: 5,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 0.95,
      commitFrequencyPerWeek: 6.6,
      commitRegularityScore: 60,
      totalCommits: 33,
      avgCommitSizeLinesChanged: 130,
      codeChurnRatio: 0.35,
      branchCount: 4,
      mergeFrequency: 0.8,
      issueCreationRate: 1.2,
      issueResolutionTime: 40,
      daysSinceLastCommit: 2,
      commitsLast3Days: 3,
      commitsLastWeek: 6,
      filesModifiedCount: 31,
      commitMessageQualityScore: 65,
    },
    weeklyRiskHistory: generateWeeklyRisk(52, "falling"),
    commitHistory: generateDailyCommits(1.0),
    weeklyCommitHistory: generateWeeklyCommits(6),
    recommendations: [
      { id: "r1", priority: "medium", title: "Improve message quality to 75+", description: "You're at 65/100. Strong commit messages are a professional best practice — be specific about what and why.", icon: "MessageSquare" },
      { id: "r2", priority: "low", title: "Work on commit regularity", description: "Score 60/100. Aim to commit every single working day, even if it's just a small change.", icon: "Clock" },
      { id: "r3", priority: "low", title: "Keep up the good work", description: "Your risk trend is falling. Continue current habits and focus on commit quality.", icon: "Star" },
    ],
  },
  {
    id: "s008",
    name: "Fatima Al-Hassan",
    email: "fatima.h@uni.edu",
    githubUsername: "fatima-codes",
    githubUrl: "https://github.com/fatima-codes",
    courseId: "cs2025",
    riskLevel: "moderate",
    riskScore: 49,
    lastCommitDate: "2025-03-23",
    totalCommits: 38,
    commitsThisWeek: 6,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 1.1,
      commitFrequencyPerWeek: 7.7,
      commitRegularityScore: 66,
      totalCommits: 38,
      avgCommitSizeLinesChanged: 118,
      codeChurnRatio: 0.30,
      branchCount: 5,
      mergeFrequency: 0.9,
      issueCreationRate: 1.4,
      issueResolutionTime: 32,
      daysSinceLastCommit: 1,
      commitsLast3Days: 4,
      commitsLastWeek: 7,
      filesModifiedCount: 37,
      commitMessageQualityScore: 70,
    },
    weeklyRiskHistory: generateWeeklyRisk(49, "falling"),
    commitHistory: generateDailyCommits(1.1),
    weeklyCommitHistory: generateWeeklyCommits(7),
    recommendations: [
      { id: "r1", priority: "low", title: "Push commit regularity to 75+", description: "You're on a great path. Focus on consistent daily commits even during busy periods.", icon: "TrendingUp" },
      { id: "r2", priority: "low", title: "Continue branch discipline", description: "Good use of 5 branches. Maintain this practice as your project grows in complexity.", icon: "GitBranch" },
      { id: "r3", priority: "low", title: "Reduce average commit size", description: "118 lines/commit is still a bit large. Aim for under 100 lines per commit.", icon: "GitCommit" },
    ],
  },

  // ── LOW RISK (4) ──
  {
    id: "s009",
    name: "Emma Thompson",
    email: "emma.t@uni.edu",
    githubUsername: "emmathompson",
    githubUrl: "https://github.com/emmathompson",
    courseId: "cs2025",
    riskLevel: "low",
    riskScore: 22,
    lastCommitDate: "2025-03-24",
    totalCommits: 67,
    commitsThisWeek: 9,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 1.95,
      commitFrequencyPerWeek: 13.6,
      commitRegularityScore: 88,
      totalCommits: 67,
      avgCommitSizeLinesChanged: 72,
      codeChurnRatio: 0.14,
      branchCount: 9,
      mergeFrequency: 1.8,
      issueCreationRate: 2.8,
      issueResolutionTime: 14,
      daysSinceLastCommit: 0,
      commitsLast3Days: 7,
      commitsLastWeek: 11,
      filesModifiedCount: 58,
      commitMessageQualityScore: 91,
    },
    weeklyRiskHistory: generateWeeklyRisk(22, "falling"),
    commitHistory: generateDailyCommits(2.0),
    weeklyCommitHistory: generateWeeklyCommits(13),
    recommendations: [
      { id: "r1", priority: "low", title: "Excellent work! Keep it up", description: "Your commit frequency, regularity, and message quality are all outstanding. You're a model student.", icon: "Star" },
      { id: "r2", priority: "low", title: "Consider mentoring peers", description: "Your strong Git practices could help struggling classmates. Consider pairing with lower-performing students.", icon: "Users" },
      { id: "r3", priority: "low", title: "Experiment with advanced Git workflows", description: "Try rebase workflows, cherry-pick, or interactive rebase to expand your skills.", icon: "GitBranch" },
    ],
  },
  {
    id: "s010",
    name: "Liam O'Brien",
    email: "liam.ob@uni.edu",
    githubUsername: "liamobrien",
    githubUrl: "https://github.com/liamobrien",
    courseId: "cs2025",
    riskLevel: "low",
    riskScore: 18,
    lastCommitDate: "2025-03-24",
    totalCommits: 72,
    commitsThisWeek: 11,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 2.1,
      commitFrequencyPerWeek: 14.7,
      commitRegularityScore: 92,
      totalCommits: 72,
      avgCommitSizeLinesChanged: 65,
      codeChurnRatio: 0.11,
      branchCount: 11,
      mergeFrequency: 2.1,
      issueCreationRate: 3.1,
      issueResolutionTime: 10,
      daysSinceLastCommit: 0,
      commitsLast3Days: 8,
      commitsLastWeek: 12,
      filesModifiedCount: 64,
      commitMessageQualityScore: 94,
    },
    weeklyRiskHistory: generateWeeklyRisk(18, "falling"),
    commitHistory: generateDailyCommits(2.2),
    weeklyCommitHistory: generateWeeklyCommits(14),
    recommendations: [
      { id: "r1", priority: "low", title: "Outstanding performance", description: "Top of the class in all metrics. Your Git workflow is exemplary.", icon: "Star" },
      { id: "r2", priority: "low", title: "Document your workflow", description: "Consider writing a README guide on your Git workflow for others to learn from.", icon: "FileText" },
      { id: "r3", priority: "low", title: "Explore CI/CD integration", description: "Set up GitHub Actions for automated testing to further enhance your development workflow.", icon: "Settings" },
    ],
  },
  {
    id: "s011",
    name: "Yuki Tanaka",
    email: "yuki.t@uni.edu",
    githubUsername: "yukitanaka",
    githubUrl: "https://github.com/yukitanaka",
    courseId: "cs2025",
    riskLevel: "low",
    riskScore: 28,
    lastCommitDate: "2025-03-23",
    totalCommits: 58,
    commitsThisWeek: 8,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 1.7,
      commitFrequencyPerWeek: 11.9,
      commitRegularityScore: 82,
      totalCommits: 58,
      avgCommitSizeLinesChanged: 85,
      codeChurnRatio: 0.18,
      branchCount: 8,
      mergeFrequency: 1.5,
      issueCreationRate: 2.4,
      issueResolutionTime: 18,
      daysSinceLastCommit: 1,
      commitsLast3Days: 6,
      commitsLastWeek: 10,
      filesModifiedCount: 51,
      commitMessageQualityScore: 86,
    },
    weeklyRiskHistory: generateWeeklyRisk(28, "stable"),
    commitHistory: generateDailyCommits(1.7),
    weeklyCommitHistory: generateWeeklyCommits(11),
    recommendations: [
      { id: "r1", priority: "low", title: "Keep commit streak going", description: "Great consistency! Try to get your regularity score above 85.", icon: "TrendingUp" },
      { id: "r2", priority: "low", title: "Increase issue tracking", description: "Creating more issues will help you plan sprints better and show progress to the instructor.", icon: "Bug" },
      { id: "r3", priority: "low", title: "Push message quality to 90+", description: "86/100 is excellent. Adding ticket references will push you to the top.", icon: "MessageSquare" },
    ],
  },
  {
    id: "s012",
    name: "Carlos Mendoza",
    email: "carlos.m@uni.edu",
    githubUsername: "carlosmendoza",
    githubUrl: "https://github.com/carlosmendoza",
    courseId: "cs2025",
    riskLevel: "low",
    riskScore: 31,
    lastCommitDate: "2025-03-23",
    totalCommits: 52,
    commitsThisWeek: 7,
    enrolledDate: "2025-01-15",
    features: {
      commitFrequencyPerDay: 1.5,
      commitFrequencyPerWeek: 10.5,
      commitRegularityScore: 78,
      totalCommits: 52,
      avgCommitSizeLinesChanged: 92,
      codeChurnRatio: 0.22,
      branchCount: 7,
      mergeFrequency: 1.3,
      issueCreationRate: 2.1,
      issueResolutionTime: 22,
      daysSinceLastCommit: 1,
      commitsLast3Days: 5,
      commitsLastWeek: 9,
      filesModifiedCount: 47,
      commitMessageQualityScore: 80,
    },
    weeklyRiskHistory: generateWeeklyRisk(31, "stable"),
    commitHistory: generateDailyCommits(1.5),
    weeklyCommitHistory: generateWeeklyCommits(10),
    recommendations: [
      { id: "r1", priority: "low", title: "Work on commit regularity", description: "78/100 is good. Try to get this above 85 by committing every single working day.", icon: "Clock" },
      { id: "r2", priority: "low", title: "Improve message quality", description: "80/100 is solid. Adding more context to your commit messages will help reviewers.", icon: "MessageSquare" },
      { id: "r3", priority: "low", title: "Excellent branch discipline", description: "7 branches shows great workflow hygiene. Keep creating feature branches consistently.", icon: "GitBranch" },
    ],
  },
];

// ── Class averages ────────────────────────────────────────────
export const classAverageFeatures: ClassAverageFeatures = {
  commitFrequencyPerDay: 1.1,
  commitFrequencyPerWeek: 7.7,
  commitRegularityScore: 58,
  totalCommits: 37,
  avgCommitSizeLinesChanged: 148,
  codeChurnRatio: 0.38,
  branchCount: 5,
  mergeFrequency: 0.9,
  issueCreationRate: 1.4,
  issueResolutionTime: 58,
  daysSinceLastCommit: 3.5,
  commitsLast3Days: 3.4,
  commitsLastWeek: 6.2,
  filesModifiedCount: 37,
  commitMessageQualityScore: 63,
};

// ── Class weekly commit aggregate ─────────────────────────────
export const classWeeklyCommits = [
  { week: "Jan W2", commits: 38, linesAdded: 4200, linesDeleted: 980 },
  { week: "Jan W3", commits: 52, linesAdded: 5800, linesDeleted: 1200 },
  { week: "Jan W4", commits: 61, linesAdded: 6900, linesDeleted: 1500 },
  { week: "Feb W1", commits: 73, linesAdded: 8100, linesDeleted: 2100 },
  { week: "Feb W2", commits: 68, linesAdded: 7600, linesDeleted: 1800 },
  { week: "Feb W3", commits: 81, linesAdded: 9200, linesDeleted: 2400 },
  { week: "Feb W4", commits: 77, linesAdded: 8700, linesDeleted: 2200 },
  { week: "Mar W1", commits: 88, linesAdded: 9900, linesDeleted: 2600 },
];

// ── Logged-in student (for student dashboard) ─────────────────
export const currentStudent = students[0]; // Marcus Chen — high risk demo
