## Fix the 404s and clarify the GitHub token model

Your new token works — the credential check now passes and the function reaches GitHub. The remaining failures are per-repository, and I verified both against the live GitHub API:

- `vivesaST/local-connect-market` → **exists and is public (200)**. The sync fails only because the saved URL ends in `.git`, and the code takes the last URL segment verbatim, so it asks GitHub for a repo literally named `local-connect-market.git` → 404.
- `vivesaST/students-warn` → **genuinely does not exist (404)**. Wrong/typed repo name, renamed, deleted, or private.

### Your questions answered
- **Whose token?** The **lecturer's** (or a dedicated project account's). It's one server-side token stored as the `GITHUB_PAT` secret and used for every student. Students never supply tokens — they only give their username and repo URL.
- **Same org?** Not required. Public student repos are readable by any token. An org only matters if repos are **private** — then the token owner must be a member/collaborator with read access, and a shared org is the cleanest way to arrange that.
- **Recommendation:** tell students their project repo must be **public**. Then the lecturer's token needs only public read and nothing else has to be configured.

### What I'll change

1. **Robust repo-URL parsing** (`supabase/functions/sync-github-data/index.ts`)
   - Strip a trailing `.git`, trailing slashes, query strings and `#` fragments.
   - Parse owner **and** repo from the URL itself (`github.com/<owner>/<repo>`) instead of assuming the owner equals `github_username` — they differ when the repo is under an org.
   - Fall back to `github_username` as owner only when the URL has no owner segment.

2. **Clearer failure messages**
   - Distinguish "repository not found" from "repository is private — the lecturer's token has no access" by checking the authenticated user's visibility, and say which owner/repo was actually requested.

3. **Validate the URL at registration** (`src/pages/Auth.tsx`)
   - Reject anything that isn't a `github.com/<owner>/<repo>` URL, and normalise it (drop `.git`) before saving, so bad values never reach the database.

4. **Let the lecturer fix a wrong repo** (instructor Students page)
   - Add an inline "Edit GitHub repo" action so a typo like `students-warn` can be corrected without re-registering the student, with an RLS-safe update restricted to students in the instructor's own courses.

5. **Per-student sync feedback** (`src/hooks/useSyncGithub.ts`)
   - Toast lists each student and their outcome instead of only the first error, so partial success is visible.

6. **Verify live**
   - Run the function after the fix and confirm `local-connect-market` syncs (commits, features, risk rows written). `students-warn` will still fail until that student supplies a real repo URL — which step 4 now lets you fix in the UI.
