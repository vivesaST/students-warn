import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileRow {
  id: string;
  github_username: string | null;
  github_url: string | null;
  course_id: string | null;
}

interface GitHubCommit {
  sha: string;
  commit: { author: { date: string }; message: string };
  stats?: { additions: number; deletions: number; total: number };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const githubPat = Deno.env.get("GITHUB_PAT");

    if (!githubPat) {
      return new Response(
        JSON.stringify({ error: "GITHUB_PAT secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return new Response(JSON.stringify({ error: "Sign in as an instructor to sync GitHub data." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "Your session has expired. Sign in again and retry." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: caller } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
    if (caller?.role !== "instructor") {
      return new Response(JSON.stringify({ error: "Only instructors can run the GitHub sync." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ghHeaders: HeadersInit = {
      Authorization: `Bearer ${githubPat}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const credentialCheck = await fetch("https://api.github.com/user", { headers: ghHeaders });
    if (!credentialCheck.ok) {
      const detail = await credentialCheck.text();
      console.error(`GitHub credential check failed [${credentialCheck.status}]: ${detail}`);
      const message = credentialCheck.status === 401
        ? "The saved GitHub token is invalid or expired. Update GITHUB_PAT and retry."
        : `GitHub credential check failed (${credentialCheck.status}).`;
      return new Response(JSON.stringify({ error: message, status: credentialCheck.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await credentialCheck.text();

    // Get all students with a github_username
    const { data: students, error: studentsErr } = await supabase
      .from("profiles")
      .select("id, github_username, github_url, course_id")
      .eq("role", "student")
      .not("github_username", "is", null);

    if (studentsErr) throw studentsErr;
    if (!students || students.length === 0) {
      return new Response(
        JSON.stringify({ message: "No students with GitHub usernames found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { studentId: string; username: string; status: string; detail?: string }[] = [];

    for (const student of students as ProfileRow[]) {
      if (!student.github_username) continue;

      try {
        const parsed = parseRepo(student.github_url, student.github_username);
        if (!parsed) {
          results.push({
            studentId: student.id,
            username: student.github_username,
            status: "failed",
            detail: student.github_url
              ? `"${student.github_url}" is not a valid GitHub repository URL (expected https://github.com/owner/repo).`
              : "No GitHub repository URL is configured.",
          });
          continue;
        }
        const { owner, repo } = parsed;

        // --- Fetch commits (last 100) ---
        const commitsRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
          { headers: ghHeaders }
        );
        if (!commitsRes.ok) {
          const detail = await commitsRes.text();
          let message: string;
          if (commitsRes.status === 404) {
            // Distinguish "does not exist" from "exists but private / no token access"
            const publicProbe = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
              headers: { Accept: "application/vnd.github+json" },
            });
            message = publicProbe.ok
              ? `Repository ${owner}/${repo} exists but the lecturer's GitHub token has no access to it. Make the repository public, or give the token owner read access.`
              : `Repository ${owner}/${repo} does not exist (or is private and invisible to the lecturer's token). Ask the student to correct their repository URL.`;
          } else if (commitsRes.status === 409) {
            message = `Repository ${owner}/${repo} is empty — it has no commits yet.`;
          } else {
            message = `GitHub returned ${commitsRes.status} for ${owner}/${repo}.`;
          }
          results.push({ studentId: student.id, username: student.github_username, status: "failed", detail: message });
          console.error(`${message} ${detail}`);
          continue;
        }

        const commits: GitHubCommit[] = await commitsRes.json();

        // --- Fetch branches ---
        const branchesRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
          { headers: ghHeaders }
        );
        const branches = branchesRes.ok ? await branchesRes.json() : [];

        // --- Fetch issues ---
        const issuesRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`,
          { headers: ghHeaders }
        );
        const issues = issuesRes.ok ? await issuesRes.json() : [];

        // --- Fetch commit stats for recent commits (up to 20 for detail) ---
        const detailedCommits: GitHubCommit[] = [];
        for (const c of commits.slice(0, 20)) {
          const detailRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits/${c.sha}`,
            { headers: ghHeaders }
          );
          if (detailRes.ok) {
            detailedCommits.push(await detailRes.json());
          }
        }

        // === Compute features ===
        const now = new Date();
        const commitDates = commits.map((c) => new Date(c.commit.author.date));
        const totalCommits = commits.length;

        // Days since last commit
        const lastCommitDate = commitDates.length > 0 ? commitDates[0] : now;
        const daysSinceLastCommit = Math.max(0, Math.floor((now.getTime() - lastCommitDate.getTime()) / 86400000));

        // Commits last week / last 3 days
        const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
        const threeDaysAgo = new Date(now.getTime() - 3 * 86400000);
        const commitsLastWeek = commitDates.filter((d) => d >= oneWeekAgo).length;
        const commitsLast3Days = commitDates.filter((d) => d >= threeDaysAgo).length;

        // Commit frequency
        const firstCommit = commitDates.length > 0 ? commitDates[commitDates.length - 1] : now;
        const daysSpan = Math.max(1, Math.floor((now.getTime() - firstCommit.getTime()) / 86400000));
        const weeksSpan = Math.max(1, daysSpan / 7);
        const commitFrequencyPerDay = parseFloat((totalCommits / daysSpan).toFixed(2));
        const commitFrequencyPerWeek = parseFloat((totalCommits / weeksSpan).toFixed(2));

        // Commit regularity score (std dev of daily counts, inverted to 0-100)
        const dailyMap: Record<string, number> = {};
        commitDates.forEach((d) => {
          const key = d.toISOString().slice(0, 10);
          dailyMap[key] = (dailyMap[key] || 0) + 1;
        });
        const dailyCounts = Object.values(dailyMap);
        const mean = dailyCounts.length > 0 ? dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length : 0;
        const variance = dailyCounts.length > 0 ? dailyCounts.reduce((s, v) => s + (v - mean) ** 2, 0) / dailyCounts.length : 0;
        const stdDev = Math.sqrt(variance);
        const commitRegularityScore = Math.max(0, Math.min(100, Math.round(100 - stdDev * 15)));

        // Avg commit size + churn + files
        let totalAdded = 0, totalDeleted = 0, filesModified = 0;
        for (const dc of detailedCommits) {
          if (dc.stats) {
            totalAdded += dc.stats.additions;
            totalDeleted += dc.stats.deletions;
          }
        }
        const avgCommitSize = detailedCommits.length > 0
          ? Math.round((totalAdded + totalDeleted) / detailedCommits.length)
          : 0;
        const codeChurnRatio = totalAdded > 0 ? parseFloat((totalDeleted / totalAdded).toFixed(2)) : 0;
        filesModified = detailedCommits.length * 3; // approximation

        // Commit message quality (simple heuristic: length > 10 chars = good)
        const goodMessages = commits.filter((c) => c.commit.message.length > 10).length;
        const commitMessageQualityScore = totalCommits > 0 ? Math.round((goodMessages / totalCommits) * 100) : 50;

        // Branch count
        const branchCount = Array.isArray(branches) ? branches.length : 0;

        // Merge frequency (commits with "merge" in message)
        const mergeCommits = commits.filter((c) => c.commit.message.toLowerCase().includes("merge")).length;
        const mergeFrequency = parseFloat((mergeCommits / weeksSpan).toFixed(2));

        // Issue metrics
        const issueArr = Array.isArray(issues) ? issues.filter((i: any) => !i.pull_request) : [];
        const issueCreationRate = parseFloat((issueArr.length / weeksSpan).toFixed(2));
        const closedIssues = issueArr.filter((i: any) => i.state === "closed");
        const avgResolutionTime = closedIssues.length > 0
          ? parseFloat(
              (closedIssues.reduce((sum: number, i: any) => {
                return sum + (new Date(i.closed_at).getTime() - new Date(i.created_at).getTime()) / 3600000;
              }, 0) / closedIssues.length).toFixed(1)
            )
          : 0;

        // === Upsert student_features ===
        const { error: featuresError } = await supabase.from("student_features").upsert(
          {
            student_id: student.id,
            course_id: student.course_id,
            total_commits: totalCommits,
            days_since_last_commit: daysSinceLastCommit,
            commits_last_week: commitsLastWeek,
            commits_last_3_days: commitsLast3Days,
            commit_frequency_per_day: commitFrequencyPerDay,
            commit_frequency_per_week: commitFrequencyPerWeek,
            commit_regularity_score: commitRegularityScore,
            avg_commit_size_lines_changed: avgCommitSize,
            code_churn_ratio: codeChurnRatio,
            files_modified_count: filesModified,
            commit_message_quality_score: commitMessageQualityScore,
            branch_count: branchCount,
            merge_frequency: mergeFrequency,
            issue_creation_rate: issueCreationRate,
            issue_resolution_time: avgResolutionTime,
          },
          { onConflict: "student_id" }
        );
        if (featuresError) throw featuresError;

        // === Update profile ===
        const { error: profileError } = await supabase.from("profiles").update({
          total_commits: totalCommits,
          commits_this_week: commitsLastWeek,
          last_commit_date: lastCommitDate.toISOString().slice(0, 10),
        }).eq("id", student.id);
        if (profileError) throw profileError;

        // === Upsert daily_commits (last 21 days) ===
        const dailyRows: { student_id: string; commit_date: string; commit_count: number }[] = [];
        for (let d = 0; d < 21; d++) {
          const date = new Date(now.getTime() - d * 86400000);
          const key = date.toISOString().slice(0, 10);
          dailyRows.push({
            student_id: student.id,
            commit_date: key,
            commit_count: dailyMap[key] || 0,
          });
        }
        const { error: dailyError } = await supabase.from("daily_commits").upsert(dailyRows, { onConflict: "student_id,commit_date" });
        if (dailyError) throw dailyError;

        // === Upsert weekly_commits (last 12 weeks) ===
        const weeklyRows: { student_id: string; week_label: string; commits: number; lines_added: number; lines_deleted: number }[] = [];
        for (let w = 0; w < 12; w++) {
          const weekStart = new Date(now.getTime() - (w + 1) * 7 * 86400000);
          const weekEnd = new Date(now.getTime() - w * 7 * 86400000);
          const label = `W${12 - w}`;
          const weekCommits = commitDates.filter((d) => d >= weekStart && d < weekEnd);
          weeklyRows.push({
            student_id: student.id,
            week_label: label,
            commits: weekCommits.length,
            lines_added: weekCommits.length * Math.round(avgCommitSize * 0.6),
            lines_deleted: weekCommits.length * Math.round(avgCommitSize * 0.4),
          });
        }
        const { error: weeklyError } = await supabase.from("weekly_commits").upsert(weeklyRows, { onConflict: "student_id,week_label" });
        if (weeklyError) throw weeklyError;

        // === Risk scoring ===
        const riskScore = computeRiskScore({
          daysSinceLastCommit,
          commitRegularityScore,
          commitsLastWeek,
          commitFrequencyPerDay,
          codeChurnRatio,
          commitMessageQualityScore,
          branchCount,
          mergeFrequency,
          issueCreationRate,
        });
        const riskLevel = riskScore >= 65 ? "high" : riskScore >= 40 ? "moderate" : "low";

        const { error: riskError } = await supabase.from("risk_assessments").insert({
          student_id: student.id,
          risk_score: riskScore,
          risk_level: riskLevel,
        });
        if (riskError) throw riskError;

        // Weekly risk history entry
        const currentWeekLabel = `W${Math.ceil((now.getDate()) / 7)}`;
        const { error: riskHistoryError } = await supabase.from("weekly_risk_history").insert({
          student_id: student.id,
          week_label: currentWeekLabel,
          risk_score: riskScore,
        });
        if (riskHistoryError) throw riskHistoryError;

        // === Generate recommendations ===
        const recs = generateRecommendations({
          daysSinceLastCommit,
          commitRegularityScore,
          commitsLastWeek,
          codeChurnRatio,
          commitMessageQualityScore,
          branchCount,
        });
        // Delete old recs and insert new
        const { error: deleteRecommendationsError } = await supabase.from("recommendations").delete().eq("student_id", student.id);
        if (deleteRecommendationsError) throw deleteRecommendationsError;
        if (recs.length > 0) {
          const { error: recommendationsError } = await supabase.from("recommendations").insert(
            recs.map((r) => ({ ...r, student_id: student.id }))
          );
          if (recommendationsError) throw recommendationsError;
        }

        // === Aggregate class weekly commits ===
        if (student.course_id) {
          for (const wr of weeklyRows) {
            const { error: classWeeklyError } = await supabase.from("class_weekly_commits").upsert(
              {
                course_id: student.course_id,
                week_label: wr.week_label,
                commits: wr.commits,
                lines_added: wr.lines_added,
                lines_deleted: wr.lines_deleted,
              },
              { onConflict: "course_id,week_label" }
            );
            if (classWeeklyError) throw classWeeklyError;
          }
        }

        results.push({ studentId: student.id, username: owner, status: "synced" });
      } catch (studentErr) {
        results.push({
          studentId: student.id,
          username: student.github_username || "unknown",
          status: `error: ${(studentErr as Error).message}`,
        });
      }
    }

    const syncedCount = results.filter((result) => result.status === "synced").length;
    if (syncedCount === 0) {
      const summary = results
        .filter((result) => result.status !== "synced")
        .map((result) => `${result.username}: ${result.detail ?? result.status}`)
        .join(" | ");
      return new Response(
        JSON.stringify({ error: summary || "No students could be synced.", results }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Parses "owner/repo" out of a GitHub repository URL.
 * Tolerates trailing ".git", trailing slashes, query strings and fragments,
 * "git@github.com:owner/repo.git" SSH form, and bare "owner/repo" input.
 * Falls back to the student's github_username as owner when the value only
 * contains a repository name.
 */
function parseRepo(
  rawUrl: string | null,
  fallbackOwner: string | null
): { owner: string; repo: string } | null {
  const clean = (value: string) =>
    value.trim().replace(/[?#].*$/, "").replace(/\/+$/, "").replace(/\.git$/i, "");

  const owner0 = fallbackOwner ? clean(fallbackOwner).replace(/^@/, "") : "";
  if (!rawUrl || !rawUrl.trim()) return null;

  let value = clean(rawUrl);
  value = value.replace(/^git@github\.com:/i, "");
  value = value.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "");
  value = value.replace(/^\/+/, "");

  const segments = value.split("/").filter(Boolean);
  if (segments.length >= 2) {
    return { owner: segments[0], repo: segments[1] };
  }
  if (segments.length === 1 && owner0) {
    return { owner: owner0, repo: segments[0] };
  }
  return null;
}



function computeRiskScore(features: {
  daysSinceLastCommit: number;
  commitRegularityScore: number;
  commitsLastWeek: number;
  commitFrequencyPerDay: number;
  codeChurnRatio: number;
  commitMessageQualityScore: number;
  branchCount: number;
  mergeFrequency: number;
  issueCreationRate: number;
}): number {
  let score = 50; // baseline

  // High weight factors
  score += Math.min(20, features.daysSinceLastCommit * 3);
  score -= Math.min(15, features.commitRegularityScore * 0.15);
  score -= Math.min(15, features.commitsLastWeek * 3);

  // Medium weight factors
  score -= Math.min(10, features.commitFrequencyPerDay * 10);
  score += Math.min(10, features.codeChurnRatio * 5);
  score -= Math.min(10, features.commitMessageQualityScore * 0.1);

  // Low weight factors
  score -= Math.min(5, features.branchCount * 1.5);
  score -= Math.min(5, features.mergeFrequency * 2);
  score -= Math.min(5, features.issueCreationRate * 2);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function generateRecommendations(features: {
  daysSinceLastCommit: number;
  commitRegularityScore: number;
  commitsLastWeek: number;
  codeChurnRatio: number;
  commitMessageQualityScore: number;
  branchCount: number;
}): { priority: string; title: string; description: string; icon: string }[] {
  const recs: { priority: string; title: string; description: string; icon: string }[] = [];

  if (features.daysSinceLastCommit > 3) {
    recs.push({
      priority: "high",
      title: "Resume committing immediately",
      description: `You haven't committed in ${features.daysSinceLastCommit} days. Start with small, incremental changes to get back on track.`,
      icon: "AlertTriangle",
    });
  }

  if (features.commitRegularityScore < 50) {
    recs.push({
      priority: "high",
      title: "Improve commit consistency",
      description: "Your commit pattern is irregular. Try to commit at least once daily, even if changes are small.",
      icon: "Clock",
    });
  }

  if (features.commitsLastWeek < 3) {
    recs.push({
      priority: "medium",
      title: "Increase weekly commit volume",
      description: "Aim for at least 5 commits per week. Break large tasks into smaller, committable units.",
      icon: "TrendingUp",
    });
  }

  if (features.commitMessageQualityScore < 60) {
    recs.push({
      priority: "medium",
      title: "Write more descriptive commit messages",
      description: "Good commit messages explain 'what' and 'why'. Use the format: 'type: brief description of change'.",
      icon: "FileText",
    });
  }

  if (features.branchCount < 2) {
    recs.push({
      priority: "low",
      title: "Use feature branches",
      description: "Create separate branches for features and bug fixes. This shows professional Git workflow practices.",
      icon: "GitBranch",
    });
  }

  if (features.codeChurnRatio > 0.8) {
    recs.push({
      priority: "medium",
      title: "Reduce code churn",
      description: "You're deleting a lot of what you write. Plan your approach before coding to reduce rework.",
      icon: "RefreshCw",
    });
  }

  return recs.slice(0, 4);
}
