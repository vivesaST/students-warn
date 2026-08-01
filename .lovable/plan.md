## Fix GitHub sync and the endless student loading screen

1. **Make the Edge Function report failures correctly**
   - Validate the GitHub credential before processing students.
   - Preserve useful GitHub errors such as invalid/expired token, repository not found, or inaccessible/private repository.
   - Check every database write and report failures instead of returning `success: true` when no student was actually synced.

2. **Fix the instructor Sync GitHub action**
   - Read the function’s per-student results.
   - Show an accurate success, partial-success, or failure message.
   - Refresh the student/profile queries automatically after a successful sync.

3. **Remove the infinite student “Syncing” loop**
   - Stop using `total commits === 0` as proof that syncing is underway; a valid repository may genuinely have zero commits, and a failed sync also leaves zero.
   - Show the syncing state only while an actual sync request is running.
   - Otherwise show a clear pending/error/empty-repository state with a route back to the lecturer or an appropriate retry action.

4. **Deploy and verify end to end**
   - Deploy `sync-github-data`.
   - Test it with the current student repository and confirm that feature, commit, risk, and recommendation rows are created when GitHub succeeds.
   - Verify that Dashboard, My Progress, and Course Info no longer bounce back to an endless spinner.

**Confirmed current state:** the registered student `@vivesaST` has no `student_features` row and still has zero profile commits. The implementation currently converts GitHub HTTP failures into a normal function response, and the student dashboard interprets the resulting zero as perpetual syncing. If GitHub still returns `401` after this fix, the saved `GITHUB_PAT` must be replaced with a valid token before data can sync.