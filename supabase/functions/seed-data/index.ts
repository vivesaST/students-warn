import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // ── 1. Course ──────────────────────────────────────────────
    const { data: existingCourse } = await supabase.from("courses").select("id").eq("name", "Software Engineering 2025").single();
    let courseId: string;
    if (existingCourse) {
      courseId = existingCourse.id;
    } else {
      const { data: courseData, error: courseError } = await supabase.from("courses").insert({
        name: "Software Engineering 2025",
        instructor_name: "Dr. Sarah Mitchell",
        start_date: "2025-01-15",
        end_date: "2025-06-30",
      }).select("id").single();
      if (courseError) throw courseError;
      courseId = courseData.id;
    }

    // ── 2. Students ────────────────────────────────────────────
    const students = [
      { email: "marcus.chen@uni.edu", full_name: "Marcus Chen", github_username: "mchen-dev", github_url: "https://github.com/mchen-dev", risk_score: 87, risk_level: "high", last_commit_date: "2025-03-10", total_commits: 8, commits_this_week: 0, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 0.15, commit_frequency_per_week: 1.0, commit_regularity_score: 12, total_commits: 8, avg_commit_size_lines_changed: 210, code_churn_ratio: 0.78, branch_count: 1, merge_frequency: 0.1, issue_creation_rate: 0.2, issue_resolution_time: 168, days_since_last_commit: 14, commits_last_3_days: 0, commits_last_week: 0, files_modified_count: 12, commit_message_quality_score: 22 }, recommendations: [ { priority: "high", title: "Start committing immediately", description: "You haven't committed in 14 days. Break your work into small daily commits to show progress and avoid losing work.", icon: "AlertTriangle" }, { priority: "high", title: "Create feature branches", description: "You're working directly on main. Use branches for each feature to practice professional workflows.", icon: "GitBranch" }, { priority: "medium", title: "Improve commit messages", description: "Your commit messages score 22/100. Write descriptive messages like 'Add user authentication with JWT' instead of 'fix stuff'.", icon: "MessageSquare" } ], risk_trend: "rising" },
      { email: "aisha.patel@uni.edu", full_name: "Aisha Patel", github_username: "aisha-codes", github_url: "https://github.com/aisha-codes", risk_score: 79, risk_level: "high", last_commit_date: "2025-03-17", total_commits: 14, commits_this_week: 1, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 0.3, commit_frequency_per_week: 2.1, commit_regularity_score: 25, total_commits: 14, avg_commit_size_lines_changed: 340, code_churn_ratio: 0.65, branch_count: 2, merge_frequency: 0.3, issue_creation_rate: 0.5, issue_resolution_time: 120, days_since_last_commit: 7, commits_last_3_days: 1, commits_last_week: 2, files_modified_count: 28, commit_message_quality_score: 38 }, recommendations: [ { priority: "high", title: "Increase commit frequency", description: "Aim for at least 1 commit per day on working days. Daily commits help track progress and prevent large merge conflicts.", icon: "TrendingUp" }, { priority: "medium", title: "Reduce large commit sizes", description: "Your average commit changes 340 lines. Break large changes into smaller, focused commits.", icon: "GitCommit" }, { priority: "medium", title: "Track issues more actively", description: "Create GitHub issues for each feature or bug. This improves project planning and visibility.", icon: "Bug" } ], risk_trend: "rising" },
      { email: "jordan.w@uni.edu", full_name: "Jordan Williams", github_username: "jwilliams-cs", github_url: "https://github.com/jwilliams-cs", risk_score: 74, risk_level: "high", last_commit_date: "2025-03-19", total_commits: 18, commits_this_week: 2, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 0.45, commit_frequency_per_week: 3.1, commit_regularity_score: 30, total_commits: 18, avg_commit_size_lines_changed: 290, code_churn_ratio: 0.60, branch_count: 2, merge_frequency: 0.4, issue_creation_rate: 0.3, issue_resolution_time: 96, days_since_last_commit: 5, commits_last_3_days: 1, commits_last_week: 3, files_modified_count: 22, commit_message_quality_score: 41 }, recommendations: [ { priority: "high", title: "Establish a regular commit schedule", description: "Your commit regularity score is 30/100. Try committing at the same time each day to build consistency.", icon: "Clock" }, { priority: "medium", title: "Use more branches", description: "With only 2 branches, you're likely mixing multiple features. Create a branch per feature.", icon: "GitBranch" }, { priority: "low", title: "Review and refactor churned code", description: "60% code churn suggests rewrites. Spend time planning before coding to reduce rework.", icon: "RefreshCw" } ], risk_trend: "stable" },
      { email: "sofia.r@uni.edu", full_name: "Sofia Ramirez", github_username: "sofiadev", github_url: "https://github.com/sofiadev", risk_score: 58, risk_level: "moderate", last_commit_date: "2025-03-21", total_commits: 31, commits_this_week: 4, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 0.9, commit_frequency_per_week: 6.3, commit_regularity_score: 55, total_commits: 31, avg_commit_size_lines_changed: 145, code_churn_ratio: 0.42, branch_count: 4, merge_frequency: 0.7, issue_creation_rate: 1.1, issue_resolution_time: 48, days_since_last_commit: 3, commits_last_3_days: 3, commits_last_week: 6, files_modified_count: 35, commit_message_quality_score: 60 }, recommendations: [ { priority: "medium", title: "Improve commit message quality", description: "Your message quality is 60/100. Add more context: what changed and why.", icon: "MessageSquare" }, { priority: "medium", title: "Reduce code churn", description: "42% churn suggests design changes mid-implementation. Plan your architecture before coding.", icon: "RefreshCw" }, { priority: "low", title: "Close issues faster", description: "Average resolution time is 48 hours. Try to close issues within 24 hours of opening them.", icon: "CheckCircle" } ], risk_trend: "falling" },
      { email: "dmitri.v@uni.edu", full_name: "Dmitri Volkov", github_username: "dvolkov", github_url: "https://github.com/dvolkov", risk_score: 55, risk_level: "moderate", last_commit_date: "2025-03-22", total_commits: 28, commits_this_week: 3, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 0.8, commit_frequency_per_week: 5.6, commit_regularity_score: 52, total_commits: 28, avg_commit_size_lines_changed: 160, code_churn_ratio: 0.38, branch_count: 3, merge_frequency: 0.65, issue_creation_rate: 0.8, issue_resolution_time: 56, days_since_last_commit: 2, commits_last_3_days: 2, commits_last_week: 5, files_modified_count: 29, commit_message_quality_score: 62 }, recommendations: [ { priority: "medium", title: "Increase branch usage", description: "You're using 3 branches. Aim for 5-7 active branches with one per feature or sprint task.", icon: "GitBranch" }, { priority: "low", title: "Improve commit regularity", description: "Your regularity score is 52/100. Try committing at consistent times each day.", icon: "Clock" }, { priority: "low", title: "Write more descriptive messages", description: "Good progress on message quality (62/100). Aim for 75+ by including 'why' in each message.", icon: "MessageSquare" } ], risk_trend: "stable" },
      { email: "priya.s@uni.edu", full_name: "Priya Singh", github_username: "priya-builds", github_url: "https://github.com/priya-builds", risk_score: 62, risk_level: "moderate", last_commit_date: "2025-03-20", total_commits: 26, commits_this_week: 3, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 0.75, commit_frequency_per_week: 5.2, commit_regularity_score: 48, total_commits: 26, avg_commit_size_lines_changed: 175, code_churn_ratio: 0.45, branch_count: 3, merge_frequency: 0.6, issue_creation_rate: 0.9, issue_resolution_time: 60, days_since_last_commit: 4, commits_last_3_days: 2, commits_last_week: 4, files_modified_count: 26, commit_message_quality_score: 55 }, recommendations: [ { priority: "medium", title: "Commit more consistently", description: "Your regularity score is 48/100. Inconsistent commits make progress hard to track.", icon: "Clock" }, { priority: "medium", title: "Reduce days between commits", description: "You went 4 days without committing. Set a goal of committing every working day.", icon: "Calendar" }, { priority: "low", title: "Improve commit message quality", description: "Score of 55/100. Add ticket numbers and describe the purpose of each change.", icon: "MessageSquare" } ], risk_trend: "stable" },
      { email: "tom.a@uni.edu", full_name: "Tom Adeyemi", github_username: "tomadeyemi", github_url: "https://github.com/tomadeyemi", risk_score: 52, risk_level: "moderate", last_commit_date: "2025-03-22", total_commits: 33, commits_this_week: 5, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 0.95, commit_frequency_per_week: 6.6, commit_regularity_score: 60, total_commits: 33, avg_commit_size_lines_changed: 130, code_churn_ratio: 0.35, branch_count: 4, merge_frequency: 0.8, issue_creation_rate: 1.2, issue_resolution_time: 40, days_since_last_commit: 2, commits_last_3_days: 3, commits_last_week: 6, files_modified_count: 31, commit_message_quality_score: 65 }, recommendations: [ { priority: "medium", title: "Improve message quality to 75+", description: "You're at 65/100. Strong commit messages are a professional best practice — be specific about what and why.", icon: "MessageSquare" }, { priority: "low", title: "Work on commit regularity", description: "Score 60/100. Aim to commit every single working day, even if it's just a small change.", icon: "Clock" }, { priority: "low", title: "Keep up the good work", description: "Your risk trend is falling. Continue current habits and focus on commit quality.", icon: "Star" } ], risk_trend: "falling" },
      { email: "fatima.h@uni.edu", full_name: "Fatima Al-Hassan", github_username: "fatima-codes", github_url: "https://github.com/fatima-codes", risk_score: 49, risk_level: "moderate", last_commit_date: "2025-03-23", total_commits: 38, commits_this_week: 6, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 1.1, commit_frequency_per_week: 7.7, commit_regularity_score: 66, total_commits: 38, avg_commit_size_lines_changed: 118, code_churn_ratio: 0.30, branch_count: 5, merge_frequency: 0.9, issue_creation_rate: 1.4, issue_resolution_time: 32, days_since_last_commit: 1, commits_last_3_days: 4, commits_last_week: 7, files_modified_count: 37, commit_message_quality_score: 70 }, recommendations: [ { priority: "low", title: "Push commit regularity to 75+", description: "You're on a great path. Focus on consistent daily commits even during busy periods.", icon: "TrendingUp" }, { priority: "low", title: "Continue branch discipline", description: "Good use of 5 branches. Maintain this practice as your project grows in complexity.", icon: "GitBranch" }, { priority: "low", title: "Reduce average commit size", description: "118 lines/commit is still a bit large. Aim for under 100 lines per commit.", icon: "GitCommit" } ], risk_trend: "falling" },
      { email: "emma.t@uni.edu", full_name: "Emma Thompson", github_username: "emmathompson", github_url: "https://github.com/emmathompson", risk_score: 22, risk_level: "low", last_commit_date: "2025-03-24", total_commits: 67, commits_this_week: 9, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 1.95, commit_frequency_per_week: 13.6, commit_regularity_score: 88, total_commits: 67, avg_commit_size_lines_changed: 72, code_churn_ratio: 0.14, branch_count: 9, merge_frequency: 1.8, issue_creation_rate: 2.8, issue_resolution_time: 14, days_since_last_commit: 0, commits_last_3_days: 7, commits_last_week: 11, files_modified_count: 58, commit_message_quality_score: 91 }, recommendations: [ { priority: "low", title: "Excellent work! Keep it up", description: "Your commit frequency, regularity, and message quality are all outstanding. You're a model student.", icon: "Star" }, { priority: "low", title: "Consider mentoring peers", description: "Your strong Git practices could help struggling classmates. Consider pairing with lower-performing students.", icon: "Users" }, { priority: "low", title: "Experiment with advanced Git workflows", description: "Try rebase workflows, cherry-pick, or interactive rebase to expand your skills.", icon: "GitBranch" } ], risk_trend: "falling" },
      { email: "liam.ob@uni.edu", full_name: "Liam O'Brien", github_username: "liamobrien", github_url: "https://github.com/liamobrien", risk_score: 18, risk_level: "low", last_commit_date: "2025-03-24", total_commits: 72, commits_this_week: 11, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 2.1, commit_frequency_per_week: 14.7, commit_regularity_score: 92, total_commits: 72, avg_commit_size_lines_changed: 65, code_churn_ratio: 0.11, branch_count: 11, merge_frequency: 2.1, issue_creation_rate: 3.1, issue_resolution_time: 10, days_since_last_commit: 0, commits_last_3_days: 8, commits_last_week: 12, files_modified_count: 64, commit_message_quality_score: 94 }, recommendations: [ { priority: "low", title: "Outstanding performance", description: "Top of the class in all metrics. Your Git workflow is exemplary.", icon: "Star" }, { priority: "low", title: "Document your workflow", description: "Consider writing a README guide on your Git workflow for others to learn from.", icon: "FileText" }, { priority: "low", title: "Explore CI/CD integration", description: "Set up GitHub Actions for automated testing to further enhance your development workflow.", icon: "Settings" } ], risk_trend: "falling" },
      { email: "yuki.t@uni.edu", full_name: "Yuki Tanaka", github_username: "yukitanaka", github_url: "https://github.com/yukitanaka", risk_score: 28, risk_level: "low", last_commit_date: "2025-03-23", total_commits: 58, commits_this_week: 8, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 1.7, commit_frequency_per_week: 11.9, commit_regularity_score: 82, total_commits: 58, avg_commit_size_lines_changed: 85, code_churn_ratio: 0.18, branch_count: 8, merge_frequency: 1.5, issue_creation_rate: 2.4, issue_resolution_time: 18, days_since_last_commit: 1, commits_last_3_days: 6, commits_last_week: 10, files_modified_count: 51, commit_message_quality_score: 86 }, recommendations: [ { priority: "low", title: "Keep commit streak going", description: "Great consistency! Try to get your regularity score above 85.", icon: "TrendingUp" }, { priority: "low", title: "Increase issue tracking", description: "Creating more issues will help you plan sprints better and show progress to the instructor.", icon: "Bug" }, { priority: "low", title: "Push message quality to 90+", description: "86/100 is excellent. Adding ticket references will push you to the top.", icon: "MessageSquare" } ], risk_trend: "stable" },
      { email: "carlos.m@uni.edu", full_name: "Carlos Mendoza", github_username: "carlosmendoza", github_url: "https://github.com/carlosmendoza", risk_score: 31, risk_level: "low", last_commit_date: "2025-03-23", total_commits: 52, commits_this_week: 7, enrolled_date: "2025-01-15", features: { commit_frequency_per_day: 1.5, commit_frequency_per_week: 10.5, commit_regularity_score: 78, total_commits: 52, avg_commit_size_lines_changed: 92, code_churn_ratio: 0.22, branch_count: 7, merge_frequency: 1.3, issue_creation_rate: 2.1, issue_resolution_time: 22, days_since_last_commit: 1, commits_last_3_days: 5, commits_last_week: 9, files_modified_count: 47, commit_message_quality_score: 80 }, recommendations: [ { priority: "low", title: "Work on commit regularity", description: "78/100 is good. Try to get this above 85 by committing every single working day.", icon: "Clock" }, { priority: "low", title: "Improve message quality", description: "80/100 is solid. Adding more context to your commit messages will help reviewers.", icon: "MessageSquare" }, { priority: "low", title: "Excellent branch discipline", description: "7 branches shows great workflow hygiene. Keep creating feature branches consistently.", icon: "GitBranch" } ], risk_trend: "stable" },
    ];

    // Also create instructor
    const { data: existingInstructor } = await supabase.from("profiles").select("id").eq("email", "instructor@uni.edu").single();
    if (!existingInstructor) {
      // Create instructor auth user
      const { data: instrAuthData, error: instrAuthError } = await supabase.auth.admin.createUser({
        email: "instructor@uni.edu",
        password: "earlyWarn2025!",
        email_confirm: true,
      });
      if (instrAuthError && !instrAuthError.message.includes("already been registered")) throw instrAuthError;
      const instrId = instrAuthData?.user?.id;
      if (instrId) {
        await supabase.from("profiles").upsert({
          id: instrId,
          full_name: "Dr. Sarah Mitchell",
          email: "instructor@uni.edu",
          role: "instructor",
          course_id: courseId,
        });
      }
    }

    const results: string[] = [];

    for (const student of students) {
      // Check if user already exists
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("email", student.email).single();
      
      let studentId: string;
      if (existingProfile) {
        studentId = existingProfile.id;
        results.push(`Skipped existing: ${student.full_name}`);
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: student.email,
          password: "earlyWarn2025!",
          email_confirm: true,
        });
        if (authError) {
          if (authError.message.includes("already been registered")) {
            // Look up by listing users
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const existing = users.find(u => u.email === student.email);
            if (!existing) { results.push(`Error: ${student.full_name} - ${authError.message}`); continue; }
            studentId = existing.id;
          } else {
            results.push(`Auth error: ${student.full_name} - ${authError.message}`);
            continue;
          }
        } else {
          studentId = authData.user!.id;
        }

        // Create profile
        await supabase.from("profiles").upsert({
          id: studentId,
          full_name: student.full_name,
          email: student.email,
          role: "student",
          github_username: student.github_username,
          github_url: student.github_url,
          course_id: courseId,
          last_commit_date: student.last_commit_date,
          total_commits: student.total_commits,
          commits_this_week: student.commits_this_week,
          enrolled_date: student.enrolled_date,
        });

        // Insert features
        await supabase.from("student_features").upsert({
          student_id: studentId,
          course_id: courseId,
          ...student.features,
        });

        // Insert risk assessment
        await supabase.from("risk_assessments").insert({
          student_id: studentId,
          risk_score: student.risk_score,
          risk_level: student.risk_level,
        });

        // Insert weekly risk history
        const weeklyRisk = generateWeeklyRisk(student.risk_score, student.risk_trend as "rising" | "falling" | "stable");
        await supabase.from("weekly_risk_history").insert(
          weeklyRisk.map(w => ({ student_id: studentId, week_label: w.week, risk_score: w.risk_score }))
        );

        // Insert daily commits
        const dailyCommits = generateDailyCommits(student.features.commit_frequency_per_day);
        await supabase.from("daily_commits").upsert(
          dailyCommits.map(d => ({ student_id: studentId, commit_date: d.date, commit_count: d.commits }))
        );

        // Insert weekly commits
        const weeklyCommits = generateWeeklyCommits(student.features.commit_frequency_per_week);
        await supabase.from("weekly_commits").upsert(
          weeklyCommits.map(w => ({ student_id: studentId, week_label: w.week, commits: w.commits, lines_added: w.linesAdded, lines_deleted: w.linesDeleted }))
        );

        // Insert recommendations
        await supabase.from("recommendations").insert(
          student.recommendations.map(r => ({
            student_id: studentId,
            priority: r.priority,
            title: r.title,
            description: r.description,
            icon: r.icon,
          }))
        );

        results.push(`Created: ${student.full_name}`);
      }
    }

    // ── 3. Class weekly commits ────────────────────────────────
    const classWeekly = [
      { week_label: "Jan W2", commits: 38, lines_added: 4200, lines_deleted: 980 },
      { week_label: "Jan W3", commits: 52, lines_added: 5800, lines_deleted: 1200 },
      { week_label: "Jan W4", commits: 61, lines_added: 6900, lines_deleted: 1500 },
      { week_label: "Feb W1", commits: 73, lines_added: 8100, lines_deleted: 2100 },
      { week_label: "Feb W2", commits: 68, lines_added: 7600, lines_deleted: 1800 },
      { week_label: "Feb W3", commits: 81, lines_added: 9200, lines_deleted: 2400 },
      { week_label: "Feb W4", commits: 77, lines_added: 8700, lines_deleted: 2200 },
      { week_label: "Mar W1", commits: 88, lines_added: 9900, lines_deleted: 2600 },
    ];
    await supabase.from("class_weekly_commits").upsert(
      classWeekly.map(w => ({ course_id: courseId, ...w }))
    );

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateWeeklyRisk(baseScore: number, trend: "rising" | "falling" | "stable") {
  const weeks = ["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"];
  return weeks.map((week, i) => {
    let score = baseScore;
    if (trend === "rising") score = Math.min(95, baseScore - 20 + i * 3 + (Math.random() * 8 - 4));
    else if (trend === "falling") score = Math.max(10, baseScore + 20 - i * 3 + (Math.random() * 8 - 4));
    else score = baseScore + (Math.random() * 12 - 6);
    return { week, risk_score: Math.round(Math.min(95, Math.max(5, score))) };
  });
}

function generateDailyCommits(avgPerDay: number) {
  const result: { date: string; commits: number }[] = [];
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

function generateWeeklyCommits(avgPerWeek: number) {
  const weeks = ["Jan W2","Jan W3","Jan W4","Feb W1","Feb W2","Feb W3","Feb W4","Mar W1"];
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
