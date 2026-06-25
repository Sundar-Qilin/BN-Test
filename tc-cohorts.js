module.exports = [
  // ── COHT-CRSE: Course-Level Cohort Configuration ─────────────────────────
  {
    code: 'COHT-CRSE', title: 'Cohorts — Course Settings', cases: [
      { id: 'CS-001', name: 'Cohorts toggle OFF by default on a new course', pre: 'Logged in as super_admin; open any course → Settings', steps: '1. Navigate to /courses\n2. Open any course\n3. Click Settings tab\n4. Scroll to Cohorts section', expected: 'Toggle is OFF; cohort length and proximity fields are hidden/disabled', priority: 'High', type: 'Positive' },
      { id: 'CS-002', name: 'Enable cohorts toggle — inputs appear', pre: 'Course settings open; cohorts disabled', steps: '1. Click the "Group learners into cohorts" toggle to ON\n2. Observe form', expected: 'Toggle turns ON; "Cohort length (weeks)" and "Solo-merge window (days)" inputs become visible', priority: 'Critical', type: 'Positive' },
      { id: 'CS-003', name: 'Set cohort length and save', pre: 'Cohorts enabled on course', steps: '1. Enter 6 in "Cohort length (weeks)"\n2. Blur/tab away or click Save', expected: 'Value auto-saves; reload page and field shows 6', priority: 'High', type: 'Positive' },
      { id: 'CS-004', name: 'Set proximity threshold and save', pre: 'Cohorts enabled on course', steps: '1. Enter 14 in "Solo-merge window (days)"\n2. Blur/save', expected: 'Value saves; persists on page reload', priority: 'High', type: 'Positive' },
      { id: 'CS-005', name: 'Cohort length — value 0 rejected', pre: 'Cohorts enabled; settings open', steps: '1. Enter 0 in cohort length field\n2. Save', expected: 'Validation error: value must be between 1 and 52', priority: 'Medium', type: 'Boundary' },
      { id: 'CS-006', name: 'Cohort length — value 53 rejected', pre: 'Cohorts enabled; settings open', steps: '1. Enter 53 in cohort length\n2. Save', expected: 'Validation error: maximum is 52 weeks', priority: 'Medium', type: 'Boundary' },
      { id: 'CS-007', name: 'Proximity threshold — value 0 rejected', pre: 'Cohorts enabled; settings open', steps: '1. Enter 0 in solo-merge window\n2. Save', expected: 'Validation error: minimum is 1 day', priority: 'Medium', type: 'Boundary' },
      { id: 'CS-008', name: 'Proximity threshold — value 91 rejected', pre: 'Cohorts enabled; settings open', steps: '1. Enter 91 in solo-merge window\n2. Save', expected: 'Validation error: maximum is 90 days', priority: 'Medium', type: 'Boundary' },
      { id: 'CS-009', name: 'Disable cohorts — inputs hide; existing cohorts untouched', pre: 'Cohorts enabled; cohorts already exist for this course', steps: '1. Toggle cohorts OFF\n2. Save', expected: 'Toggle OFF; input fields hidden; existing cohorts in DB are NOT deleted', priority: 'Medium', type: 'Positive' },
      { id: 'CS-010', name: 'org_admin cannot access course cohort settings', pre: 'Logged in as org_admin', steps: '1. Open course settings\n2. Look for cohorts toggle', expected: 'Cohorts section not visible or read-only for org_admin', priority: 'Critical', type: 'Security' },
    ]
  },

  // ── COHT-LIST: Admin Cohort List Page ────────────────────────────────────
  {
    code: 'COHT-LIST', title: 'Cohorts — Admin List Page', cases: [
      { id: 'CL-001', name: 'Cohorts accessible via Community → Cohorts in sidebar', pre: 'Logged in as super_admin', steps: '1. Expand "Community" group in sidebar\n2. Click "Cohorts"', expected: 'Navigate to /cohorts; page heading "Cohorts"; subtitle: "Weekly peer groups formed from course enrolments — automated creation, proximity assignment, and admin management."', priority: 'Critical', type: 'Positive' },
      { id: 'CL-002', name: 'Cohorts tab and Flags tab visible', pre: 'On /cohorts page', steps: '1. Observe tabs at top of page', expected: 'Two tabs: "Cohorts" (with person icon) and "Flags" (with flag icon)', priority: 'Critical', type: 'UI/UX' },
      { id: 'CL-003', name: 'Empty state shown when no cohorts exist', pre: 'No cohorts configured', steps: '1. Open /cohorts tab', expected: '"No cohorts yet" with icon; link text: "Turn on cohorts for a course in Course → Settings → Cohorts. The weekly job then groups each week\'s enrolments into a cohort every Monday."', priority: 'High', type: 'Positive' },
      { id: 'CL-004', name: 'Cohort list shows 5 filter controls', pre: 'On /cohorts page', steps: '1. Observe filter row above the cohort list', expected: 'Confirmed 5 controls visible: text search "Search cohort name…", "All courses" dropdown, "All organisations" dropdown, "All statuses" dropdown, "All origins" dropdown; count label "N cohorts" visible', priority: 'Critical', type: 'UI/UX' },
      { id: 'CL-004b', name: 'Cohort list shows correct columns when data exists', pre: 'Cohorts created via job', steps: '1. Open /cohorts with cohorts in DB', expected: 'Columns: NAME, COURSE, ORG, ISO WEEK, DATE RANGE, MEMBERS, STATUS, ORIGIN', priority: 'Critical', type: 'Positive' },
      { id: 'CL-005', name: 'Search cohorts by name (debounced)', pre: 'Multiple cohorts exist', steps: '1. Type partial cohort name in "Search cohort name…" text box', expected: 'Filtered rows appear after debounce delay (~300ms); non-matching rows hidden', priority: 'High', type: 'Positive' },
      { id: 'CL-006', name: 'Filter by course', pre: 'Cohorts from multiple courses', steps: '1. Select a specific course in "All courses" dropdown', expected: 'Only cohorts for that course shown', priority: 'High', type: 'Positive' },
      { id: 'CL-007', name: 'Filter by organisation', pre: 'Cohorts from multiple orgs', steps: '1. Select specific org in "All organisations" dropdown', expected: 'Only that org\'s cohorts shown', priority: 'High', type: 'Positive' },
      { id: 'CL-008', name: 'Filter by status — Upcoming/Active/Completed/Archived', pre: 'Cohorts with various statuses', steps: '1. Select "Active" in "All statuses" dropdown\n2. Repeat for Upcoming, Completed, Archived', expected: 'Correct subset per status; badges correctly colour-coded', priority: 'High', type: 'Positive' },
      { id: 'CL-009', name: 'Filter by origin — Auto/Manual/Solo', pre: 'Mixed-origin cohorts', steps: '1. Select "Auto" in "All origins" dropdown\n2. Repeat for Manual, Solo', expected: 'Correct subset per origin type', priority: 'Medium', type: 'Positive' },
      { id: 'CL-010', name: 'Clear all filters restores full list', pre: 'One or more filters applied', steps: '1. Click clear/reset filters button', expected: 'All cohorts return; filter controls reset to defaults', priority: 'Medium', type: 'Positive' },
      { id: 'CL-011', name: 'Pagination — 20 rows per page', pre: 'More than 20 cohorts exist', steps: '1. Observe page; click Next page', expected: 'Max 20 rows per page; page navigation works; indicator updates', priority: 'Medium', type: 'Positive' },
      { id: 'CL-012', name: 'Click row navigates to cohort detail', pre: 'Cohort in list', steps: '1. Click any cohort row', expected: 'Navigate to /cohorts/{id}; detail page loads', priority: 'Critical', type: 'Positive' },
      { id: 'CL-013', name: 'org_admin/div_admin cannot access /cohorts', pre: 'Logged in as org_admin', steps: '1. Expand Community group (if visible)\n2. Check for Cohorts item\n3. Navigate to /cohorts directly', expected: '"Cohorts" item not shown under Community; direct URL returns access denied or redirects to dashboard', priority: 'Critical', type: 'Security' },
      { id: 'CL-014', name: 'Unauthenticated user redirected to login', pre: 'Logged out', steps: '1. Navigate to /cohorts', expected: 'Redirect to /login; cohorts page not shown', priority: 'High', type: 'Security' },
      { id: 'CL-015', name: 'Cohorts page has correct page title/breadcrumb', pre: 'On /cohorts', steps: '1. Observe heading and breadcrumb', expected: 'Page title "Cohorts"; subtitle "Weekly peer groups formed from course enrolments — automated creation, proximity assignment, and admin management."', priority: 'Low', type: 'UI/UX' },
    ]
  },

  // ── COHT-FLGS: Admin Flags Tab ───────────────────────────────────────────
  {
    code: 'COHT-FLGS', title: 'Cohorts — Flags Queue', cases: [
      { id: 'CF-001', name: 'Flags tab shows empty state with no flags', pre: 'No flags raised', steps: '1. Click Flags tab on /cohorts', expected: '"No flags match your filters. Nothing needs attention." message shown; count shows "0 flags"', priority: 'High', type: 'Positive' },
      { id: 'CF-002', name: 'Flags table columns present', pre: 'On Flags tab (any state)', steps: '1. Open Flags tab\n2. Observe column headers', expected: 'Confirmed columns: FLAG, COURSE, ORGANISATION, LEARNER, Raised (sortable ↑↓), Status (sortable ↑↓)', priority: 'High', type: 'UI/UX' },
      { id: 'CF-003', name: 'Status filter options — Open, Resolved, Dismissed, All statuses', pre: 'On Flags tab', steps: '1. Click status dropdown', expected: 'Confirmed options: Open (default/checked), Resolved, Dismissed, All statuses', priority: 'High', type: 'Positive' },
      { id: 'CF-004', name: 'Kind filter options — All kinds, Solo cohort, Proximity, Merge proposal', pre: 'On Flags tab', steps: '1. Click "All kinds" dropdown', expected: 'Confirmed options: All kinds (default), Solo cohort, Proximity, Merge proposal', priority: 'High', type: 'Positive' },
      { id: 'CF-005', name: 'Course filter on Flags tab', pre: 'On Flags tab', steps: '1. Click "All courses" dropdown', expected: 'Dropdown lists available courses; selecting one filters flags by that course', priority: 'High', type: 'Positive' },
      { id: 'CF-006', name: 'Flag count shown (e.g. "0 flags")', pre: 'On Flags tab', steps: '1. Observe count badge/text', expected: 'Count of flags shown matching current filter (e.g. "0 flags" when none match)', priority: 'Medium', type: 'UI/UX' },
      { id: 'CF-007', name: 'Accept SOLO/PROXIMITY flag — acknowledges only', pre: 'A SOLO or PROXIMITY flag exists in Open status', steps: '1. Click Accept on flag\n2. Confirm', expected: 'Flag status changes to resolved/accepted; learner cohort assignment unchanged', priority: 'Critical', type: 'Positive' },
      { id: 'CF-008', name: 'Accept MERGE_PROPOSAL flag — performs merge', pre: 'A MERGE_PROPOSAL flag exists', steps: '1. Click Accept on merge proposal flag\n2. Confirm', expected: 'Merge executed; source cohort archived; flag resolved as merged; toast shown', priority: 'Critical', type: 'Positive' },
      { id: 'CF-009', name: 'Dismiss flag — resolves without action', pre: 'Any open flag', steps: '1. Click Dismiss\n2. Confirm', expected: 'Flag status becomes dismissed; learner assignment unchanged', priority: 'High', type: 'Positive' },
      { id: 'CF-010', name: 'Override — reassign learner to different cohort', pre: 'Open flag exists; alternative cohorts for same course/org', steps: '1. Click Override\n2. Pick destination cohort\n3. Submit', expected: 'Learner moved to selected cohort; membership marked source=override, is_override=true; flag resolved as overridden', priority: 'Critical', type: 'Positive' },
      { id: 'CF-011', name: 'Override destination scoped to flag\'s course and org', pre: 'Override dialog open', steps: '1. Inspect destination cohort picker options', expected: 'Only cohorts for same course and organisation listed', priority: 'High', type: 'Positive' },
      { id: 'CF-012', name: 'Flags sorted by Raised date (newest first)', pre: 'Multiple flags', steps: '1. Click Raised column header\n2. Toggle sort', expected: 'Flags sort ascending/descending by raised date', priority: 'Low', type: 'Positive' },
    ]
  },

  // ── COHT-DETL: Admin Cohort Detail & Edit ────────────────────────────────
  {
    code: 'COHT-DETL', title: 'Cohorts — Detail & Edit', cases: [
      { id: 'CD-001', name: 'Cohort detail page shows masthead info', pre: 'Cohort exists; navigate to /cohorts/{id}', steps: '1. Open cohort detail', expected: 'Masthead: cohort name format "Week {N} — {Course Name}"; Status badge (Active/Upcoming/etc.); Origin badge (Auto/Manual/Solo); "← Cohorts" breadcrumb; metadata row: org name, date range e.g. "Jun 8, 2026 – Jun 14, 2026 · W24 2026", member count; "Manage ▼" button top-right', priority: 'Critical', type: 'Positive' },
      { id: 'CD-002', name: 'Members tab and Activity tab present', pre: 'On cohort detail page', steps: '1. Observe tabs', expected: '"Members" and "Activity" tabs visible; Members is default active', priority: 'High', type: 'UI/UX' },
      { id: 'CD-003', name: 'Manage menu shows correct options', pre: 'On cohort detail page', steps: '1. Click "Manage ▼" button top-right\n2. Observe dropdown options', expected: 'Dropdown shows exactly 4 items: "Edit cohort", "Merge a cohort in…", "Split cohort…", "Delete cohort" (Delete is styled red/destructive)', priority: 'Critical', type: 'UI/UX' },
      { id: 'CD-004', name: 'Rename cohort via Edit', pre: 'Cohort detail open; click Manage → Edit', steps: '1. Open Manage menu\n2. Click Edit cohort\n3. Change name\n4. Save', expected: 'Name updates in detail header and list page; audit entry "renamed" added', priority: 'Critical', type: 'Positive' },
      { id: 'CD-005', name: 'Shift cohort start/end dates via Edit', pre: 'Edit form open', steps: '1. Change start date\n2. Change end date\n3. Save', expected: 'Dates update; members receive COHORT_DATES_CHANGED notification; audit shows dates_changed', priority: 'Critical', type: 'Positive' },
      { id: 'CD-006', name: 'End date before start date rejected', pre: 'Edit form open', steps: '1. Set end date earlier than start date\n2. Save', expected: '400 error; validation message: end date must be after start date', priority: 'Medium', type: 'Boundary' },
      { id: 'CD-007', name: 'Past end date shows confirmation prompt', pre: 'Edit form open', steps: '1. Set end date in the past\n2. Click Save', expected: 'Prompt: "End date is in the past — Apply anyway?"; confirming with force:true saves successfully', priority: 'High', type: 'Positive' },
      { id: 'CD-008', name: 'Optimistic lock — stale edit rejected with 409', pre: 'Edit form open in two tabs simultaneously', steps: '1. Open same cohort in Tab A and Tab B\n2. Edit and save in Tab A\n3. Edit and save in Tab B', expected: 'Tab B gets 409; toast "This cohort has changed since you opened it"; form stays open; data refetches', priority: 'High', type: 'Negative' },
    ]
  },

  // ── COHT-MBRS: Admin Member Management ──────────────────────────────────
  {
    code: 'COHT-MBRS', title: 'Cohorts — Member Management', cases: [
      { id: 'CM-001', name: 'Members tab roster columns correct', pre: 'Cohort with members; Members tab open', steps: '1. Open Members tab', expected: 'Confirmed columns: LEARNER (avatar + name/email), State (sortable), JOINED VIA, Progress % (sortable), Joined (sortable); "Add members" button top-right; empty state: "No members in this cohort yet."', priority: 'Critical', type: 'Positive' },
      { id: 'CM-002', name: 'Add multiple members to cohort', pre: 'Cohort detail; Members tab', steps: '1. Click "Add members"\n2. Search and select 3 learners\n3. Submit', expected: 'All 3 added; toast "Added 3"; member count increments; roster updated', priority: 'Critical', type: 'Positive' },
      { id: 'CM-003', name: 'Add already-enrolled member shows partial success', pre: 'Learner already in another cohort for same course', steps: '1. Add members including one already in a cohort\n2. Submit', expected: 'Toast: "Added X · 1 already in a cohort"; successful adds proceed; duplicate gets 409 handled gracefully', priority: 'High', type: 'Negative' },
      { id: 'CM-004', name: 'Move member to another cohort (same course)', pre: 'Member in cohort; other cohorts exist for same course', steps: '1. Click Move on a member\n2. Select destination cohort\n3. Confirm', expected: 'Member removed from source; appears in destination; progress preserved; audit: member_moved; COHORT_MOVED notification sent', priority: 'Critical', type: 'Positive' },
      { id: 'CM-005', name: 'Move destination picker excludes archived cohorts', pre: 'Move dialog open', steps: '1. Inspect destination picker options', expected: 'Archived cohorts not listed; source cohort not listed; only same-course non-archived cohorts shown', priority: 'High', type: 'Positive' },
      { id: 'CM-006', name: 'Remove member from cohort', pre: 'Cohort with at least 2 members', steps: '1. Click Remove on a member\n2. Confirm', expected: 'Member removed from roster; count decrements; progress preserved on enrollment; audit: member_removed; COHORT_REMOVED notification sent', priority: 'Critical', type: 'Positive' },
      { id: 'CM-007', name: 'Cannot add learner to two active cohorts for same course', pre: 'Learner is active in cohort A for Course X', steps: '1. Try to add same learner to cohort B (Course X)\n2. Submit', expected: '409 already_in_cohort; partial-unique constraint enforced', priority: 'Critical', type: 'Negative' },
      { id: 'CM-008', name: 'Remove then re-add same learner succeeds', pre: 'Learner removed from cohort', steps: '1. Remove learner from cohort\n2. Add same learner back', expected: 'Re-add succeeds; freed unique slot reused; learner rejoins successfully', priority: 'High', type: 'Positive' },
    ]
  },

  // ── COHT-MSPL: Admin Merge & Split ──────────────────────────────────────
  {
    code: 'COHT-MSPL', title: 'Cohorts — Merge & Split', cases: [
      { id: 'CMS-001', name: 'Merge cohort — happy path', pre: 'Two non-archived cohorts exist for same course and org', steps: '1. Open destination cohort\n2. Click Manage → Merge a cohort in\n3. Select source cohort\n4. Submit', expected: 'All source members move to destination; later end_date adopted; source status → archived, merged_into=dest; audit: merged; COHORT_MERGED notification to destination members', priority: 'Critical', type: 'Positive' },
      { id: 'CMS-002', name: 'Merge source picker excludes archived and different-org cohorts', pre: 'Merge dialog open', steps: '1. Inspect source picker options', expected: 'Only same-course, same-org, non-archived cohorts listed; current cohort excluded', priority: 'High', type: 'Positive' },
      { id: 'CMS-003', name: 'Merge rejected with 409 on stale data', pre: 'Stale expected_modified_date on dest cohort', steps: '1. Open Edit in two tabs; save in Tab A\n2. Merge from Tab B using stale data', expected: '409 CohortConflict; "changed since opened" toast; refetch triggered', priority: 'High', type: 'Negative' },
      { id: 'CMS-004', name: 'Split cohort — happy path', pre: 'Cohort with ≥3 members', steps: '1. Click Manage → Split\n2. Select a subset of members (not all, not none)\n3. Enter name for new cohort\n4. Submit', expected: 'New MANUAL cohort created; selected members moved; original cohort retains remainder; audit: split', priority: 'Critical', type: 'Positive' },
      { id: 'CMS-005', name: 'Split blocked — selecting all members', pre: 'Split form open', steps: '1. Check-select all members\n2. Submit', expected: 'Error: must leave at least 1 member in source cohort', priority: 'High', type: 'Boundary' },
      { id: 'CMS-006', name: 'Split blocked — selecting zero members', pre: 'Split form open', steps: '1. Submit with no members selected', expected: 'Error: must select at least 1 member to split', priority: 'High', type: 'Boundary' },
    ]
  },

  // ── COHT-DELT: Admin Delete ──────────────────────────────────────────────
  {
    code: 'COHT-DELT', title: 'Cohorts — Delete', cases: [
      { id: 'CV-001', name: 'Delete cohort with members blocked', pre: 'Cohort with live members', steps: '1. Click Manage → Delete\n2. Confirm in dialog', expected: '400 cohort_not_empty; inline message "reassign or remove members first"; dialog remains open', priority: 'Critical', type: 'Negative' },
      { id: 'CV-002', name: 'Delete empty cohort succeeds', pre: 'Cohort with all members removed', steps: '1. Remove all members\n2. Click Manage → Delete\n3. Confirm', expected: 'Cohort soft-deleted (204); redirect to /cohorts; audit: deleted; cohort disappears from list', priority: 'High', type: 'Positive' },
      { id: 'CV-003', name: 'Direct POST to /admin/cohorts/ blocked (405)', pre: 'API access; super_admin token', steps: '1. POST /api/v1/admin/cohorts/ directly', expected: '405 Method Not Allowed — cohorts can only be created via job or split, not directly', priority: 'High', type: 'Security' },
    ]
  },

  // ── COHT-AUDT: Audit Trail ───────────────────────────────────────────────
  {
    code: 'COHT-AUDT', title: 'Cohorts — Audit Trail', cases: [
      { id: 'CA-001', name: 'Activity tab shows audit timeline', pre: 'Cohort with actions performed', steps: '1. Open cohort detail\n2. Click Activity tab', expected: 'Timeline entries; each shows: action verb, actor email, before/after diff, timestamp; paginated. Empty state text: "No activity yet." / "Admin actions on this cohort will appear here."', priority: 'High', type: 'Positive' },
      { id: 'CA-002', name: 'All action verbs captured in audit', pre: 'After performing rename, date change, add/remove/move member, merge/split', steps: '1. Open Activity tab and scroll', expected: 'Verbs present: created, renamed, dates_changed, member_added, member_removed, member_moved, merged, split, override_assignment', priority: 'High', type: 'Positive' },
      { id: 'CA-003', name: 'System-created cohort shows null actor gracefully', pre: 'Cohort created by weekly Celery job', steps: '1. Open Activity tab for auto-created cohort', expected: 'Created entry shows "System" or blank actor; no crash or JS error', priority: 'Medium', type: 'Positive' },
      { id: 'CA-004', name: 'Activity tab is read-only — no mutating controls', pre: 'On Activity tab', steps: '1. Inspect Activity tab UI', expected: 'No edit/delete/action buttons on audit entries; view-only display', priority: 'Medium', type: 'UI/UX' },
    ]
  },

  // ── COHT-LRNR: Learner — My Cohorts / Groups ─────────────────────────────
  {
    code: 'COHT-LRNR', title: 'Cohorts — Learner Community / Groups', cases: [
      { id: 'CLR-001', name: 'Learner sees Groups tab in community with cohort cards', pre: 'Logged in as learner (complete OTP step); member of ≥1 cohort; navigate to /community', steps: '1. Navigate to /community\n2. Confirm page tabs: Forums | Groups | Challenges\n3. Click "Groups" tab\n4. Confirm cohort cards visible', expected: 'Community page subtitle: "Connect with fellow learners through forums and groups"; tabs: Forums | Groups | Challenges (no standalone Cohorts tab); Groups tab shows cohort cards (name, status chip, member count, peer avatars); backend calls GET /api/v1/cohorts/me/', priority: 'Critical', type: 'Positive' },
      { id: 'CLR-002', name: 'Learner with no cohort sees empty state', pre: 'Logged in as learner; not in any cohort', steps: '1. Open Groups/Cohorts tab', expected: '"No cohort groups yet" or similar copy; no CTA button', priority: 'High', type: 'Positive' },
      { id: 'CLR-003', name: 'Click cohort card navigates to /community/cohorts/{id}', pre: 'Learner in a cohort; on Groups tab', steps: '1. Click cohort card', expected: 'Navigate to /community/cohorts/{id}; cohort detail page loads', priority: 'Critical', type: 'Positive' },
      { id: 'CLR-004', name: 'Learner cohort detail shows hero and member roster', pre: 'On /community/cohorts/{id} as member', steps: '1. Open cohort detail page', expected: 'Hero: cohort name, status, member count; progress distribution bar; members roster with progress %', priority: 'Critical', type: 'Positive' },
      { id: 'CLR-005', name: 'Non-member gets 404 — no data leak', pre: 'Logged in as learner not in cohort', steps: '1. Navigate to /community/cohorts/{someOtherCohortId}', expected: '"Cohort not found" card; no cohort data visible; status 404', priority: 'Critical', type: 'Security' },
      { id: 'CLR-006', name: 'Solo cohort shows "You\'re the first here" copy', pre: 'Learner in a solo cohort (single member)', steps: '1. Open cohort detail for a solo cohort', expected: '"You\'re the first here — peers join as they enrol this week." copy shown', priority: 'Medium', type: 'Positive' },
      { id: 'CLR-007', name: 'Roster ordered by progress descending; self marked', pre: 'Multi-member cohort', steps: '1. View members roster', expected: 'Members sorted by progress % highest first; current learner has "is_me" indicator', priority: 'Medium', type: 'Positive' },
      { id: 'CLR-008', name: 'My Courses page — "In a cohort" chip on cohort-enabled course', pre: 'Learner enrolled in cohort-enabled course and in a cohort', steps: '1. Navigate to My Courses page', expected: '"In a cohort" chip visible on the relevant course card', priority: 'Medium', type: 'Positive' },
      { id: 'CLR-009', name: 'Cohort auto-created when multiple learners enrol same week', pre: 'Course has cohorts_enabled=true; 2+ learners from same org enrol in same ISO week; weekly job runs', steps: '1. Learner A and Learner B both enrol in Course X in same week\n2. Admin runs/waits for weekly cohort job\n3. Admin checks /cohorts', expected: 'One cohort created for that course/org/week; both learners appear as members; both learners see the cohort on their learner portal', priority: 'Critical', type: 'Positive' },
      { id: 'CLR-010', name: 'Learner enrolled in different weeks get separate cohorts', pre: 'Course cohorts enabled; Learner A enrolls Week 24; Learner B enrolls Week 25', steps: '1. Both enrol in different weeks\n2. Weekly job runs\n3. Admin checks /cohorts', expected: 'Two separate cohorts created — one for Week 24, one for Week 25; learners NOT grouped together', priority: 'Critical', type: 'Positive' },
      { id: 'CLR-011', name: 'Learner login requires 2-step email OTP verification', pre: 'Learner not logged in; navigate to learner portal', steps: '1. Enter email + password on login page\n2. Click "Continue →"\n3. Observe redirect', expected: 'Redirected to /verify-email?email=... with "Verify your email" heading; 6-digit OTP required; all /community/* routes redirect to /verify-email if OTP not completed', priority: 'High', type: 'Positive' },
      { id: 'CLR-012', name: '/community/groups route exists and is auth-gated', pre: 'Learner not authenticated; navigate to /community/groups', steps: '1. Navigate to /community/groups\n2. Navigate to /community/cohorts', expected: 'Both routes exist (do not 404); unauthenticated access redirects to /verify-email rather than showing a 404 or "unknown workspace" error', priority: 'Medium', type: 'Positive' },
    ]
  },

  // ── COHT-DISC: Learner — Cohort Discussion ───────────────────────────────
  {
    code: 'COHT-DISC', title: 'Cohorts — Discussion Thread', cases: [
      { id: 'CDI-001', name: 'Empty thread shows start conversation prompt', pre: 'Cohort with no messages; on /community/cohorts/{id}/discussion', steps: '1. Open discussion tab/page', expected: '"No messages yet. Start the conversation…" or similar; composer visible', priority: 'High', type: 'Positive' },
      { id: 'CDI-002', name: 'Post a message — appears in thread', pre: 'Cohort member; discussion open', steps: '1. Type message in composer\n2. Click Send or press Ctrl+Enter', expected: 'Message appears in thread oldest-to-newest; thread invalidates and reloads', priority: 'Critical', type: 'Positive' },
      { id: 'CDI-003', name: 'Reply to top-level message (single level)', pre: 'A message exists in thread', steps: '1. Click Reply on a message\n2. Type reply text\n3. Send', expected: 'Reply appears nested under parent; no reply-to-reply option shown', priority: 'Critical', type: 'Positive' },
      { id: 'CDI-004', name: 'Like/unlike toggle on message', pre: 'Message exists in thread', steps: '1. Click like icon\n2. Click again to unlike', expected: 'Like count increments then decrements; is_liked toggles; no toast notification', priority: 'High', type: 'Positive' },
      { id: 'CDI-005', name: 'Delete own message shows tombstone', pre: 'Learner\'s own message in thread', steps: '1. Click delete/trash icon on own message\n2. Confirm', expected: 'Message replaced with "[deleted]" tombstone; no actions available on tombstone', priority: 'High', type: 'Positive' },
      { id: 'CDI-006', name: 'Cannot delete another learner\'s message', pre: 'Other learner\'s message visible', steps: '1. Inspect other learner\'s message for delete icon', expected: 'No trash icon on other learners\' messages (only own messages and super_admin)', priority: 'High', type: 'Security' },
      { id: 'CDI-007', name: 'Suspended learner sees suspension banner instead of composer', pre: 'Learner account suspended from moderation', steps: '1. Suspended learner opens cohort discussion', expected: 'SuspensionBanner shown instead of composer; existing messages visible; likes still work', priority: 'Critical', type: 'Negative' },
      { id: 'CDI-008', name: 'Non-member cannot post to discussion', pre: 'Learner NOT in cohort; attempts API POST', steps: '1. POST /api/v1/cohorts/{id}/messages/ as non-member', expected: '403 or 404 returned; message not created', priority: 'Critical', type: 'Security' },
      { id: 'CDI-009', name: 'Reply notification sent to parent author', pre: 'Learner B replies to Learner A\'s message', steps: '1. B replies to A\'s message\n2. Check A\'s notifications', expected: 'A receives COHORT_DISCUSSION_REPLY in-app notification', priority: 'High', type: 'Positive' },
      { id: 'CDI-010', name: 'Rate limit — posting more than 20 messages/minute throttled', pre: 'Authenticated cohort member', steps: '1. Post 21+ messages within 60 seconds', expected: 'After 20th message, 429 rate-limit response; throttle error shown', priority: 'Medium', type: 'Boundary' },
    ]
  },

  // ── COHT-PLYR: Learner — In-Player Cohort Tab ────────────────────────────
  {
    code: 'COHT-PLYR', title: 'Cohorts — In-Player Tab', cases: [
      { id: 'CPL-001', name: 'Cohort tab appears in lesson player for cohort members', pre: 'Learner in a cohort; course has cohorts_enabled=true; lesson open', steps: '1. Open a lesson in a cohort-enabled course\n2. Check lesson player sidebar tabs', expected: '"Cohort" tab visible with member-count chip', priority: 'High', type: 'Positive' },
      { id: 'CPL-002', name: 'Cohort tab hidden when learner not in a cohort', pre: 'Learner not in any cohort; opens lesson', steps: '1. Open lesson in cohort-enabled course\n2. Check tabs', expected: 'No "Cohort" tab shown in player', priority: 'High', type: 'Positive' },
      { id: 'CPL-003', name: 'In-player Cohort tab shows thread with reply/like', pre: 'Cohort tab open in player', steps: '1. Click Cohort tab\n2. Observe content', expected: 'Cohort header (name/status) + discussion thread; reply and like work from within player', priority: 'High', type: 'Positive' },
      { id: 'CPL-004', name: 'Jump to full cohort page from in-player tab', pre: 'In-player Cohort tab open', steps: '1. Click "View cohort →" link/button', expected: 'Navigate to /community/cohorts/{id}; full cohort detail page opens', priority: 'Medium', type: 'Positive' },
    ]
  },

  // ── COHT-RBAC: Permissions & RBAC ────────────────────────────────────────
  {
    code: 'COHT-RBAC', title: 'Cohorts — Permissions & RBAC', cases: [
      { id: 'CR-001', name: 'super_admin sees Cohorts under Community in sidebar', pre: 'Logged in as super_admin', steps: '1. Expand "Community" group in sidebar\n2. Observe sub-items', expected: '"Cohorts" item visible under Community (alongside Forums and Moderation)', priority: 'Critical', type: 'Positive' },
      { id: 'CR-002', name: 'org_admin does NOT see Cohorts under Community', pre: 'Logged in as org_admin', steps: '1. Expand Community group (if visible)\n2. Check for Cohorts', expected: '"Cohorts" item absent from Community group (or Community group itself hidden)', priority: 'Critical', type: 'Security' },
      { id: 'CR-003', name: 'div_admin does NOT see Cohorts under Community', pre: 'Logged in as div_admin', steps: '1. Expand Community group (if visible)\n2. Check for Cohorts', expected: '"Cohorts" item absent from Community group', priority: 'Critical', type: 'Security' },
      { id: 'CR-004', name: 'instructor does NOT see Cohorts in sidebar', pre: 'Logged in as instructor', steps: '1. Expand Community group (if visible)\n2. Check for Cohorts', expected: 'No "Cohorts" item visible', priority: 'Critical', type: 'Security' },
      { id: 'CR-005', name: 'org_admin direct URL /cohorts returns access denied', pre: 'Logged in as org_admin', steps: '1. Navigate directly to /cohorts', expected: 'Redirected to dashboard or "Access denied" page shown', priority: 'Critical', type: 'Security' },
      { id: 'CR-006', name: 'Admin API /admin/cohorts/ requires IsPlatformAdmin', pre: 'Logged in as org_admin; make API call', steps: '1. GET /api/v1/admin/cohorts/ with org_admin JWT', expected: '403 Forbidden — IsPlatformAdmin permission required', priority: 'Critical', type: 'Security' },
      { id: 'CR-007', name: 'Learner cannot access admin cohort endpoints', pre: 'Learner token', steps: '1. GET /api/v1/admin/cohorts/ with learner JWT', expected: '403 Forbidden', priority: 'Critical', type: 'Security' },
      { id: 'CR-008', name: 'Learner membership gate — 404 on non-member cohort', pre: 'Learner not in cohort', steps: '1. GET /api/v1/cohorts/{otherId}/ as non-member learner', expected: '404 Not Found — no existence leak', priority: 'Critical', type: 'Security' },
    ]
  },
];
