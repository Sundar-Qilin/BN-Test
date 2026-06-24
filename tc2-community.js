// FRMS + MODR + RWRD — 115 cases
module.exports = [
  {
    code: 'FRMS',
    title: 'Forums & Community',
    cases: [
      // ── Forum Categories ───────────────────────────────────────────────────
      { id:'FM-001', name:'Forums page loads all forum categories', pre:'Logged in; forums exist', steps:'1. Click Forums in sidebar', expected:'List of forum categories with name, description, thread count, post count', priority:'Critical', type:'Positive' },
      { id:'FM-002', name:'Create new forum category', pre:'Forums page; super_admin or org_admin', steps:'1. Click "Create Forum" or "+ Category"\n2. Enter name "General Discussion"\n3. Enter description\n4. Save', expected:'Category created; visible in forums list', priority:'High', type:'Positive' },
      { id:'FM-003', name:'Create forum with blank name fails', pre:'Create forum form', steps:'1. Leave name blank\n2. Save', expected:'Required field error', priority:'High', type:'Validation' },
      { id:'FM-004', name:'Edit forum category name and description', pre:'Forum exists', steps:'1. Click Edit on category\n2. Change name and description\n3. Save', expected:'Changes reflected in forum list', priority:'High', type:'Positive' },
      { id:'FM-005', name:'Delete empty forum category', pre:'Forum with no threads', steps:'1. Click Delete\n2. Confirm', expected:'Forum category removed', priority:'Medium', type:'Positive' },
      { id:'FM-006', name:'Delete forum with threads warns about data loss', pre:'Forum has active threads', steps:'1. Click Delete on forum with threads\n2. Observe', expected:'Warning: "This forum has X threads. Deleting will remove all threads and posts."', priority:'High', type:'UI/UX' },
      { id:'FM-007', name:'Reorder forum categories via drag', pre:'Multiple categories', steps:'1. Drag category to new position\n2. Save order', expected:'Order persists for learners', priority:'Medium', type:'Positive' },
      { id:'FM-008', name:'Set forum visibility (all orgs vs specific org)', pre:'Super_admin; forum settings', steps:'1. Restrict forum to specific org\n2. Save', expected:'Forum only visible to that org\'s learners', priority:'High', type:'Positive' },

      // ── Threads ────────────────────────────────────────────────────────────
      { id:'FM-009', name:'View threads within a forum category', pre:'Forum category with threads', steps:'1. Click forum category\n2. Observe threads list', expected:'Threads listed with title, author, reply count, last activity date', priority:'High', type:'Positive' },
      { id:'FM-010', name:'Create new thread', pre:'Inside forum category', steps:'1. Click "New Thread" or "Create Post"\n2. Enter title\n3. Enter body text\n4. Submit', expected:'Thread created; visible in category thread list', priority:'High', type:'Positive' },
      { id:'FM-011', name:'Create thread with blank title fails', pre:'New thread form', steps:'1. Leave title blank\n2. Submit', expected:'Required field error', priority:'High', type:'Validation' },
      { id:'FM-012', name:'Create thread with blank body fails', pre:'New thread form', steps:'1. Enter title\n2. Leave body blank\n3. Submit', expected:'Required field error on body', priority:'High', type:'Validation' },
      { id:'FM-013', name:'Thread title max length validation', pre:'New thread form', steps:'1. Enter 500-character title\n2. Submit', expected:'Truncated or validation error at max length', priority:'Low', type:'Boundary' },
      { id:'FM-014', name:'Pin thread to top of category', pre:'Thread exists; admin role', steps:'1. Click Pin on a thread\n2. Confirm', expected:'Thread appears at top of category; "Pinned" badge shown', priority:'High', type:'Positive' },
      { id:'FM-015', name:'Unpin thread', pre:'Thread is pinned', steps:'1. Click Unpin', expected:'Thread returns to normal chronological position', priority:'Medium', type:'Positive' },
      { id:'FM-016', name:'Lock thread prevents new replies', pre:'Thread exists', steps:'1. Click Lock on thread\n2. Confirm\n3. Check reply option', expected:'"Locked" badge shown; reply input hidden or disabled', priority:'High', type:'Positive' },
      { id:'FM-017', name:'Unlock thread re-enables replies', pre:'Thread is locked', steps:'1. Click Unlock', expected:'Reply input visible; replies accepted', priority:'Medium', type:'Positive' },
      { id:'FM-018', name:'Delete thread with confirmation', pre:'Thread exists; admin role', steps:'1. Click Delete thread\n2. Confirm', expected:'Thread and all replies removed', priority:'High', type:'Positive' },
      { id:'FM-019', name:'Move thread to different forum category', pre:'Thread in Category A; Category B exists', steps:'1. Click Move Thread\n2. Select Category B\n3. Confirm', expected:'Thread moved; no longer in Category A', priority:'Medium', type:'Positive' },

      // ── Replies ────────────────────────────────────────────────────────────
      { id:'FM-020', name:'Admin can reply to any thread', pre:'Thread open; admin logged in', steps:'1. Open thread\n2. Type reply in reply box\n3. Submit', expected:'Reply appears below original post with admin name, timestamp', priority:'High', type:'Positive' },
      { id:'FM-021', name:'Reply with blank text fails', pre:'Reply form open', steps:'1. Leave reply text blank\n2. Submit', expected:'Required field error', priority:'High', type:'Validation' },
      { id:'FM-022', name:'Edit own reply', pre:'Admin has a reply', steps:'1. Click Edit on own reply\n2. Change text\n3. Save', expected:'Reply updated; "Edited" indicator shown', priority:'Medium', type:'Positive' },
      { id:'FM-023', name:'Delete reply with confirmation', pre:'Reply exists', steps:'1. Click Delete on reply\n2. Confirm', expected:'Reply removed; thread shows remaining replies', priority:'High', type:'Positive' },
      { id:'FM-024', name:'XSS in thread body sanitized', pre:'Thread form', steps:'1. Enter "<img src=x onerror=alert(1)>" in body\n2. Submit\n3. View thread', expected:'Script not executed; sanitized output shown', priority:'Critical', type:'Security' },
      { id:'FM-025', name:'Forum accessible only to authenticated users', pre:'No login', steps:'1. Call GET /api/.../forums/ without token', expected:'401 Unauthorized', priority:'Critical', type:'Security' },

      // ── Search & Filter ────────────────────────────────────────────────────
      { id:'FM-026', name:'Search threads by title keyword', pre:'Forums; threads exist', steps:'1. Enter keyword in thread search\n2. Observe', expected:'Threads with keyword in title shown', priority:'Medium', type:'Positive' },
      { id:'FM-027', name:'Filter threads by status (Pinned, Locked, Open)', pre:'Threads with different statuses', steps:'1. Select filter\n2. Observe', expected:'Only threads with matching status shown', priority:'Medium', type:'Positive' },
      { id:'FM-028', name:'Forum UI responsive on mobile viewport', pre:'Viewport 375×812', steps:'1. Open forums\n2. Open a thread\n3. Check layout', expected:'Thread list and reply form usable on mobile; no overflow', priority:'Medium', type:'UI/UX' },
      { id:'FM-029', name:'Forum shows last reply timestamp correctly', pre:'Thread with replies', steps:'1. View thread list\n2. Check "Last Activity" column', expected:'Shows date/time of last reply correctly', priority:'Low', type:'UI/UX' },
      { id:'FM-030', name:'Org_admin cannot access forums from another org', pre:'Logged in as org_admin', steps:'1. Access another org\'s forum via URL or API', expected:'403 Forbidden', priority:'Critical', type:'Security' },
    ]
  },
  {
    code: 'MODR',
    title: 'Moderation',
    cases: [
      // ── Reported Content Queue ─────────────────────────────────────────────
      { id:'MO-001', name:'Moderation page loads reported content queue', pre:'Logged in; reports exist', steps:'1. Click Moderation in sidebar', expected:'Queue of reported items: content excerpt, reporter, reason, date, actions', priority:'Critical', type:'Positive' },
      { id:'MO-002', name:'Filter reports by content type (forum post, review, comment)', pre:'Reports of multiple types', steps:'1. Select "Forum Post" filter', expected:'Only forum post reports shown', priority:'High', type:'Positive' },
      { id:'MO-003', name:'Filter reports by status (Pending, Reviewed, Resolved)', pre:'Reports in various states', steps:'1. Select "Pending" filter', expected:'Only pending reports shown', priority:'High', type:'Positive' },
      { id:'MO-004', name:'Empty moderation queue shows empty state', pre:'No pending reports', steps:'1. Open Moderation page', expected:'"All clear — no pending reports" or empty state message', priority:'Low', type:'Negative' },
      { id:'MO-005', name:'View reported content in context', pre:'Report in queue', steps:'1. Click "View Context" on a report', expected:'Opens the original thread/review/comment in context; reported content highlighted', priority:'High', type:'UI/UX' },

      // ── Moderation Actions ─────────────────────────────────────────────────
      { id:'MO-006', name:'Approve reported content (mark as not violating)', pre:'Report in queue', steps:'1. Click "Approve" or "Keep" on a report\n2. Confirm', expected:'Report marked resolved; content remains visible; reporter notified if applicable', priority:'High', type:'Positive' },
      { id:'MO-007', name:'Remove/delete reported content', pre:'Report in queue', steps:'1. Click "Remove Content" or "Delete"\n2. Confirm', expected:'Content removed; report marked resolved; author notified if policy requires', priority:'High', type:'Positive' },
      { id:'MO-008', name:'Warn user who posted reported content', pre:'Report in queue', steps:'1. Click "Warn User"\n2. Enter warning message\n3. Send', expected:'User receives warning notification; warning logged in their profile', priority:'High', type:'Positive' },
      { id:'MO-009', name:'Suspend user from forum for N days', pre:'Repeat offender; report in queue', steps:'1. Click "Suspend User"\n2. Enter duration 7 days\n3. Enter reason\n4. Confirm', expected:'User suspended; cannot post for 7 days; suspension logged', priority:'High', type:'Positive' },
      { id:'MO-010', name:'Permanently ban user from forums', pre:'Serious violation', steps:'1. Click "Ban User"\n2. Enter reason\n3. Confirm', expected:'User permanently banned from all forum activity', priority:'High', type:'Positive' },
      { id:'MO-011', name:'Add internal moderation note to a report', pre:'Report in queue', steps:'1. Click "Add Note"\n2. Type internal comment\n3. Save', expected:'Note saved with timestamp; visible to other moderators; not shown to user', priority:'Medium', type:'Positive' },
      { id:'MO-012', name:'Bulk approve multiple reports', pre:'Multiple pending reports', steps:'1. Select 5 reports\n2. Bulk Approve\n3. Confirm', expected:'All 5 marked approved; queue count decreases by 5', priority:'Medium', type:'Positive' },
      { id:'MO-013', name:'Moderation actions logged with moderator identity and timestamp', pre:'Any action taken', steps:'1. Take moderation action\n2. Check audit log', expected:'Log entry shows: action, content ID, moderator name, timestamp', priority:'High', type:'Positive' },
      { id:'MO-014', name:'Instructor cannot access Moderation page', pre:'Logged in as instructor', steps:'1. Navigate to Moderation in sidebar', expected:'Access denied; hidden or 403 returned', priority:'Critical', type:'Security' },
      { id:'MO-015', name:'Moderation page is responsive and usable on tablet', pre:'Tablet viewport', steps:'1. Open Moderation page at 768×1024\n2. Check layout', expected:'Report queue readable; action buttons visible and usable', priority:'Low', type:'UI/UX' },
      { id:'MO-016', name:'Org_admin moderates only their org\'s content', pre:'Logged in as org_admin', steps:'1. Open Moderation page\n2. Check if reports from other orgs visible', expected:'Only reports from own org\'s forums/content visible', priority:'Critical', type:'Security' },
    ]
  },
  {
    code: 'RWRD',
    title: 'Rewards & Gamification',
    cases: [
      // ── Reward Configuration ───────────────────────────────────────────────
      { id:'RW-001', name:'Rewards page loads all reward types', pre:'Logged in; rewards configured', steps:'1. Click Rewards in sidebar', expected:'Sections: Points Rules, Badges, Leaderboard, Reward History visible', priority:'Critical', type:'Positive' },
      { id:'RW-002', name:'View existing points rules', pre:'Rules exist', steps:'1. Open Points Rules section', expected:'List of rules with trigger event, points awarded, status', priority:'High', type:'Positive' },
      { id:'RW-003', name:'Create points rule — award 10 points on course completion', pre:'Rewards > Points Rules', steps:'1. Click "Create Rule"\n2. Select trigger "Course Completion"\n3. Enter 10 points\n4. Save', expected:'Rule active; learner earns 10 points when they complete any course', priority:'Critical', type:'Positive' },
      { id:'RW-004', name:'Create points rule — award on quiz pass', pre:'Rewards > Rules', steps:'1. Create rule with trigger "Quiz Passed"\n2. Enter 5 points\n3. Save', expected:'5 points awarded every time learner passes a quiz', priority:'High', type:'Positive' },
      { id:'RW-005', name:'Create points rule — award on first login', pre:'Rules page', steps:'1. Create rule: trigger "First Login"\n2. Award 50 points', expected:'New users earn 50 points on first login', priority:'Medium', type:'Positive' },
      { id:'RW-006', name:'Create points rule with 0 points fails', pre:'Create rule form', steps:'1. Enter 0 points\n2. Save', expected:'Validation error: must award at least 1 point', priority:'Medium', type:'Validation' },
      { id:'RW-007', name:'Create points rule with negative points rejected', pre:'Create rule form', steps:'1. Enter -5 points\n2. Save', expected:'Validation error: points must be positive', priority:'Medium', type:'Validation' },
      { id:'RW-008', name:'Edit existing points rule', pre:'Rule exists', steps:'1. Click Edit on rule\n2. Change points to 15\n3. Save', expected:'Rule updated; future triggers use new point value', priority:'High', type:'Positive' },
      { id:'RW-009', name:'Disable points rule — no points awarded while disabled', pre:'Rule is active', steps:'1. Toggle rule to Disabled\n2. Trigger the event\n3. Check learner points', expected:'No points earned while rule disabled', priority:'High', type:'Positive' },
      { id:'RW-010', name:'Delete points rule with confirmation', pre:'Rule exists', steps:'1. Click Delete\n2. Confirm', expected:'Rule deleted; no longer triggers', priority:'Medium', type:'Positive' },

      // ── Badges ─────────────────────────────────────────────────────────────
      { id:'RW-011', name:'View badge list', pre:'Badges created', steps:'1. Click Badges section', expected:'All badges shown with icon, name, description, condition, awarded count', priority:'High', type:'Positive' },
      { id:'RW-012', name:'Create badge with image, name, condition', pre:'Badges section; click Create', steps:'1. Upload badge icon image\n2. Enter name "Course Champion"\n3. Enter description\n4. Set condition: "Complete 5 courses"\n5. Save', expected:'Badge created; shown in badge list', priority:'Critical', type:'Positive' },
      { id:'RW-013', name:'Create badge with blank name fails', pre:'Create badge form', steps:'1. Upload icon\n2. Leave name blank\n3. Save', expected:'Required field error', priority:'High', type:'Validation' },
      { id:'RW-014', name:'Create badge without icon is allowed (uses default)', pre:'Create badge form', steps:'1. Enter name and condition without uploading image\n2. Save', expected:'Badge created with default placeholder icon', priority:'Medium', type:'Positive' },
      { id:'RW-015', name:'Badge icon upload — invalid file type rejected', pre:'Create badge', steps:'1. Upload .pdf as badge icon\n2. Save', expected:'Error: image file required', priority:'Medium', type:'Validation' },
      { id:'RW-016', name:'Badge awarded automatically when condition met', pre:'Badge "Complete 3 Courses" exists; learner just completed 3rd course', steps:'1. Check learner\'s profile badges after completion', expected:'Badge automatically awarded; visible in learner profile', priority:'Critical', type:'Positive' },
      { id:'RW-017', name:'Manually award badge to a specific user', pre:'Badge exists; user exists', steps:'1. Open badge detail or user profile\n2. Click "Award Badge"\n3. Select user\n4. Confirm', expected:'Badge manually awarded; shown in user\'s profile', priority:'Medium', type:'Positive' },
      { id:'RW-018', name:'Revoke badge from user', pre:'User has badge', steps:'1. Open user\'s awarded badges\n2. Revoke specific badge\n3. Confirm', expected:'Badge removed from user\'s profile', priority:'Medium', type:'Positive' },
      { id:'RW-019', name:'Edit badge condition updates rule', pre:'Badge with condition', steps:'1. Edit badge\n2. Change condition from "5 courses" to "3 courses"\n3. Save', expected:'New condition active; badge awards at 3 courses henceforth', priority:'High', type:'Positive' },
      { id:'RW-020', name:'Delete badge with confirmation', pre:'Badge exists', steps:'1. Click Delete\n2. Confirm', expected:'Badge deleted; removed from all awarded users', priority:'Medium', type:'Positive' },

      // ── Leaderboard ────────────────────────────────────────────────────────
      { id:'RW-021', name:'Leaderboard shows top learners by points', pre:'Rewards page; learners have points', steps:'1. Click Leaderboard section', expected:'Top N learners listed by points descending: rank, name, points, badges count', priority:'High', type:'Positive' },
      { id:'RW-022', name:'Leaderboard filter by org', pre:'Multiple orgs', steps:'1. Select specific org from filter', expected:'Leaderboard shows only learners from that org', priority:'High', type:'Positive' },
      { id:'RW-023', name:'Leaderboard filter by time period', pre:'Leaderboard section', steps:'1. Select "This Month" filter', expected:'Only points earned this month counted in ranking', priority:'Medium', type:'Positive' },
      { id:'RW-024', name:'Leaderboard with zero learners shows empty state', pre:'No learner points', steps:'1. View leaderboard', expected:'Empty state: "No data yet"', priority:'Low', type:'Negative' },
      { id:'RW-025', name:'User reward history — see all points earned', pre:'Learner has earned points', steps:'1. Click on a learner in leaderboard or user detail\n2. View reward history', expected:'Chronological list of all point events: event, points, date', priority:'Medium', type:'Positive' },
      { id:'RW-026', name:'Org_admin leaderboard scoped to own org', pre:'Logged in as org_admin', steps:'1. View Leaderboard\n2. Check for cross-org data', expected:'Only own org\'s learners visible; no cross-org point data', priority:'Critical', type:'Security' },
      { id:'RW-027', name:'Manually adjust learner points (add/deduct)', pre:'Rewards; user exists', steps:'1. Find learner in rewards\n2. Manually add 100 points with reason\n3. Save', expected:'100 points added; logged in history with admin name and reason', priority:'High', type:'Positive' },
      { id:'RW-028', name:'Points cannot be manually set to negative total via API', pre:'Learner has 10 points', steps:'1. Call API to deduct 50 points from learner with 10 points', expected:'Points floor at 0 or request rejected; no negative balance', priority:'Medium', type:'Boundary' },
      { id:'RW-029', name:'Instructor cannot manage rewards configuration', pre:'Logged in as instructor', steps:'1. Access Rewards page', expected:'Read-only view or access denied; cannot create/edit rules or badges', priority:'High', type:'Security' },
      { id:'RW-030', name:'Rewards page loads even with no data', pre:'No rewards configured', steps:'1. Open Rewards page', expected:'Empty state for each section; no errors; Create buttons available', priority:'Medium', type:'Negative' },
    ]
  }
];
