// CRSE-LRNR + CRSE-STNG + CRSE-ANLT — 110 cases
module.exports = [
  {
    code: 'CRSE-LRNR',
    title: 'Courses — Learners Tab',
    cases: [
      // ── Learners List ──────────────────────────────────────────────────────
      { id:'CLR-001', name:'Learners tab shows enrolled user list', pre:'Course has enrolled learners', steps:'1. Open course\n2. Click Learners tab', expected:'Table with Name, Email, Progress %, Status (enrolled/completed/dropped), Last Active, Enrolled Date', priority:'Critical', type:'Positive' },
      { id:'CLR-002', name:'Learners tab shows zero enrollments message', pre:'Course has no learners', steps:'1. Open Learners tab on new course', expected:'"No learners enrolled yet" or empty state message', priority:'Medium', type:'Negative' },
      { id:'CLR-003', name:'Search learners by name', pre:'Learners tab; multiple learners', steps:'1. Enter partial name in search\n2. Observe', expected:'Only matching learner rows shown', priority:'High', type:'Positive' },
      { id:'CLR-004', name:'Search learners by email', pre:'Learners tab', steps:'1. Enter partial email in search', expected:'Matching learner rows shown', priority:'High', type:'Positive' },
      { id:'CLR-005', name:'Filter by completion status — Completed', pre:'Mix of completed and in-progress learners', steps:'1. Select "Completed" from status filter', expected:'Only learners who completed the course shown', priority:'High', type:'Positive' },
      { id:'CLR-006', name:'Filter by completion status — In Progress', pre:'Learners tab', steps:'1. Select "In Progress"', expected:'Only learners with partial progress shown', priority:'High', type:'Positive' },
      { id:'CLR-007', name:'Filter by completion status — Not Started', pre:'Learners tab', steps:'1. Select "Not Started"', expected:'Only enrolled learners with 0% progress shown', priority:'Medium', type:'Positive' },
      { id:'CLR-008', name:'Sort learners by progress ascending', pre:'Learners tab', steps:'1. Click Progress column header', expected:'Learner with lowest progress at top', priority:'Medium', type:'Positive' },
      { id:'CLR-009', name:'Sort learners by enrolled date newest first', pre:'Learners tab', steps:'1. Click Enrolled Date column', expected:'Most recently enrolled at top', priority:'Medium', type:'Positive' },
      { id:'CLR-010', name:'Pagination on learners list', pre:'More than page-size learners', steps:'1. Click Next page', expected:'Next set of learners loads', priority:'Medium', type:'Positive' },
      { id:'CLR-011', name:'Click learner row to view individual progress detail', pre:'Learners tab', steps:'1. Click a learner\'s name or row', expected:'Learner detail opens: lesson-by-lesson progress, quiz scores, time spent', priority:'High', type:'Positive' },
      { id:'CLR-012', name:'Individual learner detail shows lesson completion checkmarks', pre:'Learner has completed some lessons', steps:'1. Open learner detail\n2. View lesson list', expected:'Completed lessons have checkmark/tick; incomplete have empty circle', priority:'High', type:'Positive' },
      { id:'CLR-013', name:'Learner quiz scores shown in detail', pre:'Learner has taken quizzes', steps:'1. Open learner detail\n2. Find quiz section', expected:'Quiz name, score, attempts, pass/fail status shown', priority:'High', type:'Positive' },

      // ── Manual Enrollment ──────────────────────────────────────────────────
      { id:'CLR-014', name:'Manually enroll a user in the course', pre:'Learners tab; user exists in system not yet enrolled', steps:'1. Click "Enroll Learner" or "+ Add Learner"\n2. Search user by email\n3. Select user\n4. Confirm enrollment', expected:'User enrolled; appears in learners list with 0% progress', priority:'Critical', type:'Positive' },
      { id:'CLR-015', name:'Enroll non-existent user shows error', pre:'Enroll learner dialog', steps:'1. Search for non-existent email\n2. Try to enroll', expected:'Error: "No user found with this email"', priority:'High', type:'Negative' },
      { id:'CLR-016', name:'Enroll already-enrolled user shows error', pre:'Enroll dialog; user already enrolled', steps:'1. Search for already-enrolled user\n2. Try to enroll', expected:'Error: "User is already enrolled in this course"', priority:'High', type:'Negative' },
      { id:'CLR-017', name:'Enroll with enrollment capacity limit — last spot fills', pre:'Course capacity set to 10; 9 enrolled', steps:'1. Enroll the 10th learner', expected:'Enrollment succeeds; capacity indicator shows 10/10', priority:'High', type:'Boundary' },
      { id:'CLR-018', name:'Enroll when course is at full capacity — rejected', pre:'Course at max capacity (10/10)', steps:'1. Try to enroll an 11th learner', expected:'Error: "Course is full; enrollment capacity reached"', priority:'High', type:'Boundary' },

      // ── Bulk Enrollment ────────────────────────────────────────────────────
      { id:'CLR-019', name:'Bulk enroll via CSV — valid emails enrolled', pre:'Valid CSV with one email per row', steps:'1. Click "Bulk Enroll"\n2. Upload CSV with 5 valid user emails\n3. Submit', expected:'5 learners enrolled; success message with count', priority:'High', type:'Positive' },
      { id:'CLR-020', name:'Bulk enroll CSV with invalid emails reports per-row errors', pre:'CSV with mix of valid and invalid emails', steps:'1. Upload CSV with 3 valid and 2 invalid emails\n2. Submit', expected:'3 enrolled; 2 invalid rows reported with reason; partial success', priority:'High', type:'Negative' },
      { id:'CLR-021', name:'Bulk enroll CSV with non-existent emails shows errors', pre:'CSV with emails not in system', steps:'1. Upload CSV with unknown emails', expected:'Each unknown email reported as "User not found"', priority:'Medium', type:'Negative' },
      { id:'CLR-022', name:'Bulk enroll with empty CSV shows error', pre:'Bulk enroll flow', steps:'1. Upload empty CSV\n2. Submit', expected:'Error: CSV file is empty', priority:'Medium', type:'Validation' },

      // ── Remove / Unenroll ──────────────────────────────────────────────────
      { id:'CLR-023', name:'Remove learner with confirmation dialog', pre:'Learner enrolled in course', steps:'1. Click remove/unenroll on a learner\n2. Observe confirmation', expected:'Dialog: "Remove this learner? Their progress will be lost."', priority:'High', type:'UI/UX' },
      { id:'CLR-024', name:'Confirm remove learner deletes enrollment and progress', pre:'Confirmation dialog shown', steps:'1. Click Confirm', expected:'Learner removed from list; progress data deleted', priority:'High', type:'Positive' },
      { id:'CLR-025', name:'Cancel remove keeps learner enrolled', pre:'Confirmation dialog shown', steps:'1. Click Cancel', expected:'Dialog dismissed; learner remains with progress intact', priority:'High', type:'Positive' },
      { id:'CLR-026', name:'IDOR — cannot remove learner from another org\'s course', pre:'Logged in as org_admin; call API with different course ID', steps:'1. Call DELETE /api/.../courses/{other-course-id}/learners/{user-id}/', expected:'403 Forbidden', priority:'Critical', type:'Security' },

      // ── Progress & Export ──────────────────────────────────────────────────
      { id:'CLR-027', name:'Progress percentage calculated correctly', pre:'Learner completed 3 of 10 lessons', steps:'1. View learner in Learners tab', expected:'Progress shown as 30%', priority:'High', type:'Positive' },
      { id:'CLR-028', name:'Course completion triggers certificate issuance', pre:'Certificate enabled on course; learner at 100%', steps:'1. Learner completes final lesson\n2. Check learner detail', expected:'Status changes to "Completed"; certificate generated and available', priority:'Critical', type:'Positive' },
      { id:'CLR-029', name:'Export learners list as CSV', pre:'Learners tab', steps:'1. Click Export CSV button', expected:'CSV downloaded with Name, Email, Progress, Status, Enrolled Date, Completed Date columns', priority:'High', type:'Positive' },
      { id:'CLR-030', name:'Export selected learners only', pre:'Check 5 learners; click Export Selected', steps:'1. Select 5 learners\n2. Export', expected:'CSV contains only the 5 selected learners', priority:'Medium', type:'Positive' },
      { id:'CLR-031', name:'Bulk actions — mark selected learners as complete manually', pre:'Admin has "mark complete" option', steps:'1. Select learners\n2. Choose "Mark as Complete"\n3. Confirm', expected:'Selected learners set to 100% complete; certificate issued if enabled', priority:'High', type:'Positive' },
      { id:'CLR-032', name:'Learner progress resets correctly when re-enrolled after removal', pre:'Learner removed and re-enrolled', steps:'1. Remove learner\n2. Re-enroll same learner\n3. Check progress', expected:'Progress starts at 0%; fresh enrollment', priority:'High', type:'Positive' },
      { id:'CLR-033', name:'Last Active date updates when learner accesses a lesson', pre:'Learner enrolled; has not accessed in 5 days', steps:'1. Learner opens a lesson\n2. Admin checks Learners tab', expected:'"Last Active" updated to today', priority:'Medium', type:'Positive' },
      { id:'CLR-034', name:'Learner list shows correct total enrollment count', pre:'8 learners enrolled', steps:'1. View Learners tab header', expected:'Shows "8 Learners" or "Total: 8" accurately', priority:'Medium', type:'Positive' },
      { id:'CLR-035', name:'Learner data protected — one org cannot see another org\'s learner details', pre:'Logged in as org_admin Org A', steps:'1. Call API for learners of a course in Org B', expected:'403 Forbidden; no cross-org learner data', priority:'Critical', type:'Security' },
    ]
  },
  {
    code: 'CRSE-STNG',
    title: 'Courses — Settings Tab',
    cases: [
      // ── Enrollment Settings ────────────────────────────────────────────────
      { id:'CS-001', name:'Settings tab loads with all configuration sections', pre:'On course; click Settings tab', steps:'1. Click Settings tab\n2. Observe sections', expected:'Sections visible: Enrollment, Access, Completion, Certificate, Drip, Discussions, Pricing', priority:'High', type:'UI/UX' },
      { id:'CS-002', name:'Set enrollment type to Open (anyone can enroll)', pre:'Course settings tab', steps:'1. Select "Open" enrollment type\n2. Save', expected:'Learners can self-enroll without invitation', priority:'Critical', type:'Positive' },
      { id:'CS-003', name:'Set enrollment type to Invite Only', pre:'Course settings tab', steps:'1. Select "Invite Only"\n2. Save', expected:'Only manually enrolled or invited learners can access', priority:'Critical', type:'Positive' },
      { id:'CS-004', name:'Set enrollment type to Paid (requires product association)', pre:'Product exists; course settings tab', steps:'1. Select "Paid"\n2. Associate a product/price\n3. Save', expected:'Course requires purchase; free enrollment disabled', priority:'Critical', type:'Positive' },
      { id:'CS-005', name:'Set enrollment type to Approval Required', pre:'Course settings tab', steps:'1. Select "Approval Required"\n2. Save', expected:'Learners can request enrollment; admin must approve each request', priority:'High', type:'Positive' },
      { id:'CS-006', name:'Set enrollment capacity (max learners)', pre:'Settings tab', steps:'1. Enter 50 in "Maximum Learners" field\n2. Save', expected:'Enrollment capped at 50; 51st enrollee rejected', priority:'High', type:'Positive' },
      { id:'CS-007', name:'Enrollment capacity of 0 means unlimited', pre:'Settings tab', steps:'1. Set capacity to 0 or leave blank\n2. Save', expected:'No enrollment cap; unlimited learners', priority:'Medium', type:'Positive' },
      { id:'CS-008', name:'Set course start date', pre:'Settings tab', steps:'1. Select a future start date\n2. Save', expected:'Course access restricted until start date; learners see countdown', priority:'High', type:'Positive' },
      { id:'CS-009', name:'Set course end date', pre:'Settings tab', steps:'1. Select a future end date\n2. Save', expected:'Course access ends on end date; no new enrollments after', priority:'High', type:'Positive' },
      { id:'CS-010', name:'End date before start date rejected', pre:'Settings tab; start date set', steps:'1. Set end date earlier than start date\n2. Save', expected:'Validation error: end date must be after start date', priority:'High', type:'Validation' },
      { id:'CS-011', name:'Start date in the past is allowed (for existing courses)', pre:'Settings tab', steps:'1. Set start date to yesterday\n2. Save', expected:'Saved without error; course immediately accessible', priority:'Medium', type:'Positive' },

      // ── Access & Prerequisites ─────────────────────────────────────────────
      { id:'CS-012', name:'Set course access duration — lifetime', pre:'Settings tab', steps:'1. Select "Lifetime Access"\n2. Save', expected:'Learner access never expires after enrollment', priority:'High', type:'Positive' },
      { id:'CS-013', name:'Set course access duration — 30 days after enrollment', pre:'Settings tab', steps:'1. Select "Fixed Duration"\n2. Enter 30 days\n3. Save', expected:'Learner loses access 30 days after enrollment date', priority:'High', type:'Positive' },
      { id:'CS-014', name:'Access duration of 0 days rejected', pre:'Fixed duration selected', steps:'1. Enter 0 in duration field\n2. Save', expected:'Validation error: must be at least 1 day', priority:'Medium', type:'Validation' },
      { id:'CS-015', name:'Add prerequisite course — must complete Course A before Course B', pre:'Course A exists and is published', steps:'1. Open settings of Course B\n2. Add Course A as prerequisite\n3. Save', expected:'Prerequisite set; learner cannot start B until A is 100% complete', priority:'High', type:'Positive' },
      { id:'CS-016', name:'Remove prerequisite course', pre:'Prerequisite set', steps:'1. Remove Course A from prerequisites list\n2. Save', expected:'Prerequisite removed; course B freely accessible', priority:'Medium', type:'Positive' },
      { id:'CS-017', name:'Self-referential prerequisite (course requires itself) blocked', pre:'Course settings', steps:'1. Try to add the same course as its own prerequisite', expected:'Error: "A course cannot be its own prerequisite"', priority:'Medium', type:'Negative' },
      { id:'CS-018', name:'Circular prerequisite chain blocked (A→B→A)', pre:'Course A requires B; Course B settings', steps:'1. Try to set Course A as prerequisite of Course B', expected:'Error: "Circular prerequisite detected"', priority:'High', type:'Negative' },

      // ── Completion Criteria ────────────────────────────────────────────────
      { id:'CS-019', name:'Completion criteria — all lessons must be completed', pre:'Settings tab', steps:'1. Select "Complete all lessons"\n2. Save', expected:'100% lesson completion required to mark course complete', priority:'High', type:'Positive' },
      { id:'CS-020', name:'Completion criteria — complete 80% of lessons', pre:'Settings tab', steps:'1. Select percentage-based\n2. Enter 80%\n3. Save', expected:'Course marked complete when learner finishes 80% of lessons', priority:'High', type:'Positive' },
      { id:'CS-021', name:'Completion percentage 0% rejected', pre:'Percentage completion selected', steps:'1. Enter 0 in percentage field\n2. Save', expected:'Validation error: must be 1-100', priority:'Medium', type:'Validation' },
      { id:'CS-022', name:'Completion percentage over 100 rejected', pre:'Percentage completion', steps:'1. Enter 101\n2. Save', expected:'Validation error', priority:'Medium', type:'Validation' },
      { id:'CS-023', name:'Completion criteria — pass final quiz', pre:'Settings tab; quiz lesson exists', steps:'1. Select "Pass Final Quiz"\n2. Save', expected:'Course only marked complete when final quiz is passed', priority:'High', type:'Positive' },

      // ── Certificate Settings ───────────────────────────────────────────────
      { id:'CS-024', name:'Enable certificate auto-issue on completion', pre:'Certificate settings section', steps:'1. Toggle "Issue Certificate on Completion" on\n2. Save', expected:'Certificate issued automatically when learner meets completion criteria', priority:'High', type:'Positive' },
      { id:'CS-025', name:'Select certificate template', pre:'Multiple certificate templates exist', steps:'1. Click template selector\n2. Choose a template\n3. Save', expected:'Selected template used for this course\'s certificates', priority:'Medium', type:'Positive' },
      { id:'CS-026', name:'Certificate preview shows correct course name', pre:'Certificate template selected', steps:'1. Click "Preview Certificate"\n2. Observe', expected:'Preview shows correct course title and sample learner name', priority:'Medium', type:'UI/UX' },

      // ── Drip Content ───────────────────────────────────────────────────────
      { id:'CS-027', name:'Enable course-level drip schedule', pre:'Settings tab', steps:'1. Toggle "Drip Content" on\n2. Save', expected:'Drip enabled; individual lessons can have day-after-enrollment unlock settings', priority:'High', type:'Positive' },
      { id:'CS-028', name:'Disable course-level drip — all lessons immediately accessible', pre:'Drip was enabled', steps:'1. Toggle Drip off\n2. Save', expected:'All lessons immediately accessible upon enrollment; no delays', priority:'High', type:'Positive' },

      // ── Discussions & Comments ─────────────────────────────────────────────
      { id:'CS-029', name:'Enable course discussions', pre:'Settings tab', steps:'1. Toggle "Enable Discussions" on\n2. Save', expected:'Discussion forum tab appears on course for enrolled learners', priority:'Medium', type:'Positive' },
      { id:'CS-030', name:'Disable discussions hides discussion tab', pre:'Discussions enabled', steps:'1. Toggle off\n2. Save', expected:'Discussion tab hidden from learner view', priority:'Medium', type:'Positive' },
      { id:'CS-031', name:'Enable lesson-level comments', pre:'Settings tab', steps:'1. Toggle "Enable Lesson Comments" on\n2. Save', expected:'Comment section appears below each lesson', priority:'Medium', type:'Positive' },

      // ── Pricing Association ────────────────────────────────────────────────
      { id:'CS-032', name:'Associate a product (price) with paid course', pre:'Enrollment type Paid; product exists', steps:'1. Click "Associate Product"\n2. Select product from list\n3. Save', expected:'Product/price linked to course; learner must purchase to access', priority:'High', type:'Positive' },
      { id:'CS-033', name:'Remove product association from course', pre:'Product associated', steps:'1. Remove product from course settings\n2. Save', expected:'Course no longer requires purchase; depends on enrollment type setting', priority:'Medium', type:'Positive' },
      { id:'CS-034', name:'Settings page shows unsaved changes indicator', pre:'Changed a setting without saving', steps:'1. Toggle a setting\n2. Observe page header or save button', expected:'Unsaved changes indicator visible; Save button enabled', priority:'Medium', type:'UI/UX' },
      { id:'CS-035', name:'Save settings shows success toast', pre:'Changed a valid setting', steps:'1. Click Save\n2. Observe', expected:'Success toast: "Settings saved successfully"', priority:'High', type:'Positive' },
    ]
  },
  {
    code: 'CRSE-ANLT',
    title: 'Courses — Analytics & Reviews',
    cases: [
      // ── Course Analytics ───────────────────────────────────────────────────
      { id:'CA-001', name:'Analytics tab shows enrollment trend chart', pre:'Course with enrollment history', steps:'1. Click Analytics tab on course', expected:'Line chart showing enrollments over time (days/weeks)', priority:'High', type:'Positive' },
      { id:'CA-002', name:'Completion rate displayed as percentage', pre:'Some learners completed the course', steps:'1. View Analytics tab', expected:'Completion rate shown: e.g., "42% (21/50 learners)"', priority:'High', type:'Positive' },
      { id:'CA-003', name:'Lesson engagement — which lessons have highest completion', pre:'Analytics tab; learners have interacted', steps:'1. View lesson engagement section', expected:'Bar chart or list showing completion % per lesson; highlights drop-off points', priority:'High', type:'Positive' },
      { id:'CA-004', name:'Quiz performance chart shows score distribution', pre:'Quiz taken by learners', steps:'1. View quiz analytics section', expected:'Score distribution chart; average score; pass rate shown', priority:'High', type:'Positive' },
      { id:'CA-005', name:'Analytics date range filter', pre:'Analytics tab', steps:'1. Change date range from "All Time" to "Last 30 Days"\n2. Observe charts', expected:'Charts update to reflect only the selected time window', priority:'Medium', type:'Positive' },
      { id:'CA-006', name:'Analytics with zero data shows empty state', pre:'New course with no learner activity', steps:'1. Open Analytics tab', expected:'Empty state or zero-value charts; no errors', priority:'Medium', type:'Negative' },
      { id:'CA-007', name:'Drop-off point identified in analytics', pre:'Learners have stopped at a specific lesson', steps:'1. View lesson engagement section', expected:'Lessons with < 20% completion highlighted as drop-off points', priority:'Medium', type:'Positive' },
      { id:'CA-008', name:'Total revenue from course shown (if paid)', pre:'Paid course with transactions', steps:'1. View Analytics tab revenue section', expected:'Total revenue earned from this course displayed', priority:'High', type:'Positive' },
      { id:'CA-009', name:'Analytics data is org-scoped (org_admin cannot see other org data)', pre:'Logged in as org_admin', steps:'1. Open analytics for own course\n2. Check if cross-org data present', expected:'Only own org\'s learner data in analytics', priority:'Critical', type:'Security' },
      { id:'CA-010', name:'Export course analytics as CSV/PDF', pre:'Analytics tab', steps:'1. Click Export button\n2. Choose format', expected:'File downloaded with analytics data in readable format', priority:'Medium', type:'Positive' },

      // ── Reviews & Ratings ──────────────────────────────────────────────────
      { id:'CA-011', name:'Reviews tab shows all learner reviews with ratings', pre:'Learners have submitted reviews', steps:'1. Click Reviews tab on course', expected:'List of reviews with star rating (1-5), text, reviewer name, date', priority:'High', type:'Positive' },
      { id:'CA-012', name:'Average rating displayed prominently', pre:'Multiple reviews exist', steps:'1. View Reviews tab header', expected:'Average star rating displayed (e.g., 4.3/5.0) with total review count', priority:'High', type:'Positive' },
      { id:'CA-013', name:'Rating distribution bar chart shown', pre:'Reviews tab', steps:'1. View rating breakdown', expected:'5-star, 4-star, 3-star etc. counts shown as bar or count list', priority:'Medium', type:'UI/UX' },
      { id:'CA-014', name:'Hide / moderate a review', pre:'Inappropriate review exists', steps:'1. Click Hide or Moderate on a review\n2. Confirm', expected:'Review hidden from learner view; status shows "Hidden" in admin view', priority:'High', type:'Positive' },
      { id:'CA-015', name:'Unhide a previously hidden review', pre:'Review is hidden', steps:'1. Click Unhide / Approve\n2. Confirm', expected:'Review restored to learner view', priority:'Medium', type:'Positive' },
      { id:'CA-016', name:'Reply to a learner review', pre:'Review exists', steps:'1. Click Reply on a review\n2. Type response "Thank you for your feedback!"\n3. Submit', expected:'Admin reply appears below the review in learner view', priority:'Medium', type:'Positive' },
      { id:'CA-017', name:'Delete a review with confirmation', pre:'Inappropriate review', steps:'1. Click Delete on review\n2. Confirm', expected:'Review permanently removed', priority:'High', type:'Positive' },
      { id:'CA-018', name:'Filter reviews by rating — 1-star only', pre:'Reviews tab', steps:'1. Select "1 star" filter', expected:'Only 1-star reviews shown', priority:'Medium', type:'Positive' },
      { id:'CA-019', name:'Reviews tab empty state when no reviews', pre:'No reviews submitted', steps:'1. Open Reviews tab', expected:'"No reviews yet" shown; not an error', priority:'Low', type:'Negative' },
      { id:'CA-020', name:'XSS in learner review sanitized in admin view', pre:'Review submitted with script in text', steps:'1. View a review containing "<script>alert(1)</script>"\n2. Observe', expected:'Script not executed; text displayed as plain escaped text', priority:'Critical', type:'Security' },
    ]
  }
];
