module.exports = [
  {
    code:'MODR-QUEUE',title:'Moderation — Reports Queue',cases:[
      {id:'MQ-001',name:'Moderation queue loads all pending reports with type and status',pre:'Logged in as admin; reports exist',steps:'1. Click Moderation in sidebar\n2. Observe queue',expected:'Table: report type (thread/reply/user), content preview, reporter, date, status (Pending/Reviewed), actions',priority:'Critical',type:'Positive'},
      {id:'MQ-002',name:'Filter queue by content type — Threads only',pre:'Mixed reports',steps:'1. Select "Thread" filter',expected:'Only thread reports shown',priority:'High',type:'Positive'},
      {id:'MQ-003',name:'Filter queue by content type — Replies',pre:'Moderation queue',steps:'1. Select "Reply" filter',expected:'Only reply reports shown',priority:'High',type:'Positive'},
      {id:'MQ-004',name:'Filter queue by report reason — Spam',pre:'Reports with different reasons',steps:'1. Select "Spam" reason filter',expected:'Only spam reports shown',priority:'High',type:'Positive'},
      {id:'MQ-005',name:'Filter by status — Pending only',pre:'Queue with pending and reviewed',steps:'1. Select "Pending" filter',expected:'Only pending, unresolved reports shown',priority:'High',type:'Positive'},
      {id:'MQ-006',name:'Sort queue by report date (oldest first for triage)',pre:'Moderation queue',steps:'1. Sort by Date (Oldest First)',expected:'Oldest unresolved report at top',priority:'Medium',type:'Positive'},
      {id:'MQ-007',name:'Click report expands full content and report details',pre:'Report in queue',steps:'1. Click report row or Expand',expected:'Full thread/reply content shown; reporter\'s reason; user history; previous violations',priority:'High',type:'Positive'},
      {id:'MQ-008',name:'Queue shows reporter count per piece of content',pre:'Same content reported by 5 users',steps:'1. View queue',expected:'"Reported by 5 users" shown; badge or count visible',priority:'High',type:'Positive'},
      {id:'MQ-009',name:'Queue count badge in sidebar updates in real-time',pre:'New report submitted',steps:'1. Check sidebar Moderation badge count',expected:'Count increments without page refresh',priority:'Medium',type:'UI/UX'},
      {id:'MQ-010',name:'Empty queue shows empty state with no pending reports',pre:'All reports resolved',steps:'1. View moderation queue',expected:'"All clear — no pending reports" empty state',priority:'Low',type:'Positive'},
      {id:'MQ-011',name:'Org_admin sees only own org\'s moderation reports',pre:'Logged in as org_admin',steps:'1. Open Moderation queue',expected:'Only reports from own org\'s forum visible',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'MODR-ACTN',title:'Moderation — Actions on Reported Content',cases:[
      {id:'MA-001',name:'Approve/Dismiss report — content cleared',pre:'Pending report in queue',steps:'1. Click "Approve" or "Dismiss"\n2. Select reason\n3. Confirm',expected:'Report marked as Reviewed; content remains visible; reporter notified if enabled',priority:'Critical',type:'Positive'},
      {id:'MA-002',name:'Delete reported thread — permanent removal',pre:'Report on a thread',steps:'1. Click "Delete Content"\n2. Confirm',expected:'Thread and all replies deleted; reporter notified; moderation action logged',priority:'Critical',type:'Positive'},
      {id:'MA-003',name:'Delete reported reply — removes reply only',pre:'Report on a reply',steps:'1. Click "Delete Reply"\n2. Confirm',expected:'Reply removed; thread remains with "[reply deleted]" placeholder',priority:'High',type:'Positive'},
      {id:'MA-004',name:'Edit reported content to remove violating portion',pre:'Admin on report; content has partial violation',steps:'1. Click "Edit Content"\n2. Remove violating text\n3. Save',expected:'Content updated; report closed; "(edited by moderator)" tag shown',priority:'High',type:'Positive'},
      {id:'MA-005',name:'Warn user about violation via in-app notification',pre:'Report reviewed; user to be warned',steps:'1. Click "Warn User"\n2. Enter warning message\n3. Send',expected:'Warning sent to user as in-app notification and/or email; warning logged in user history',priority:'High',type:'Positive'},
      {id:'MA-006',name:'Suspend user from forum posting for N days',pre:'Report; action = Suspend Poster',steps:'1. Click "Suspend Poster"\n2. Set duration "7 days"\n3. Confirm',expected:'User suspended; cannot post in any forum for 7 days; suspension visible in user profile',priority:'High',type:'Positive'},
      {id:'MA-007',name:'Suspended user trying to post sees suspension message',pre:'User is suspended from forums',steps:'1. Log in as suspended user\n2. Try to post a reply',expected:'"Your forum posting has been suspended until [date]" message; reply form disabled',priority:'High',type:'Positive'},
      {id:'MA-008',name:'Lift suspension early',pre:'User is suspended',steps:'1. Find user in Users section\n2. Click "Lift Forum Suspension"\n3. Confirm',expected:'Suspension lifted; user can post immediately',priority:'Medium',type:'Positive'},
      {id:'MA-009',name:'Permanently ban user from forums',pre:'Repeat violator',steps:'1. Click "Permanent Forum Ban"\n2. Enter reason\n3. Confirm',expected:'User permanently banned from forum; cannot post or reply; ban shown in user profile',priority:'High',type:'Positive'},
      {id:'MA-010',name:'Banned user sees ban message',pre:'User has permanent ban',steps:'1. Log in as banned user\n2. Open forum',expected:'Forum displays "Your forum access has been permanently removed"',priority:'High',type:'Positive'},
      {id:'MA-011',name:'Move reported thread to appropriate category as moderation action',pre:'Thread in wrong category, also reported',steps:'1. Click "Move Thread"\n2. Select correct category\n3. Dismiss report',expected:'Thread moved; report dismissed; one action',priority:'Medium',type:'Positive'},
      {id:'MA-012',name:'Bulk dismiss multiple low-priority reports',pre:'Multiple spam bot reports selected',steps:'1. Select 10 reports\n2. Bulk Dismiss\n3. Confirm',expected:'All 10 reports marked reviewed; actions logged',priority:'Medium',type:'Positive'},
      {id:'MA-013',name:'Moderation action cannot be undone after confirm (audit trail)',pre:'Content deleted via moderation',steps:'1. Try to restore deleted content',expected:'No undo option; but action logged in audit trail with admin identity and timestamp',priority:'High',type:'Negative'},
      {id:'MA-014',name:'Admin cannot self-moderate own flagged content',pre:'Admin\'s own post flagged; admin reviewing queue',steps:'1. Admin tries to approve own report',expected:'Conflict of interest warning; action should be performed by another admin',priority:'High',type:'Security'},
    ]
  },
  {
    code:'MODR-LOG',title:'Moderation — Audit Log & History',cases:[
      {id:'ML-001',name:'Moderation audit log shows all actions taken',pre:'Admin on Moderation > Audit Log tab',steps:'1. Open Audit Log',expected:'Chronological list: action type, moderator name, target content/user, reason, timestamp',priority:'Critical',type:'Positive'},
      {id:'ML-002',name:'Audit log filter by action type (delete/warn/suspend/ban)',pre:'Audit log',steps:'1. Filter by "Suspend"',expected:'Only suspension actions shown',priority:'High',type:'Positive'},
      {id:'ML-003',name:'Audit log filter by moderator',pre:'Audit log; multiple moderators',steps:'1. Select moderator filter',expected:'Only that moderator\'s actions shown',priority:'High',type:'Positive'},
      {id:'ML-004',name:'Audit log filter by date range',pre:'Audit log',steps:'1. Set date range to last 7 days',expected:'Only last 7 days\' actions shown',priority:'Medium',type:'Positive'},
      {id:'ML-005',name:'Audit log entries are immutable',pre:'Action logged',steps:'1. Try to edit or delete an audit log entry via API',expected:'405 Method Not Allowed or 403; audit log is append-only',priority:'Critical',type:'Security'},
      {id:'ML-006',name:'Export audit log as CSV',pre:'Audit log',steps:'1. Click Export',expected:'CSV with all action details downloaded',priority:'Medium',type:'Positive'},
      {id:'ML-007',name:'User violation history — view all prior actions against a user',pre:'User detail page; Moderation tab or History',steps:'1. Open user detail\n2. View moderation history section',expected:'List of all warnings, suspensions, bans, and reason for each',priority:'High',type:'Positive'},
      {id:'ML-008',name:'Moderation log accessible to super_admin and org_admin only',pre:'Logged in as instructor',steps:'1. Try to access moderation audit log',expected:'Section hidden or 403 if accessed directly',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'MODR-CFG',title:'Moderation — Configuration & Auto-Moderation',cases:[
      {id:'MC-001',name:'Configure word filter / banned keywords',pre:'Admin on Moderation > Settings',steps:'1. Add banned words: "spam, scam, bad-word"\n2. Save',expected:'Posts containing banned words automatically flagged or blocked',priority:'High',type:'Positive'},
      {id:'MC-002',name:'Banned keyword triggers auto-flag in forum post',pre:'Word filter configured',steps:'1. Post a forum thread containing banned word',expected:'Post auto-flagged and placed in moderation queue; user sees pending message or blocked message',priority:'High',type:'Positive'},
      {id:'MC-003',name:'Banned word matching is case-insensitive',pre:'Word filter has "spam"',steps:'1. Post with "SPAM" (uppercase)',expected:'Still matched and flagged; case-insensitive matching',priority:'Medium',type:'Positive'},
      {id:'MC-004',name:'Configure auto-action on repeated violations (e.g., 3 strikes → auto-suspend)',pre:'Moderation settings; auto-escalation toggle',steps:'1. Set "Auto-suspend after 3 violations"\n2. Save',expected:'After 3 moderator-confirmed violations, user auto-suspended; no manual step needed',priority:'High',type:'Positive'},
      {id:'MC-005',name:'Notification settings — admin email on new report',pre:'Moderation settings; notifications',steps:'1. Enable "Email admin on new report"\n2. Save\n3. Submit a test report',expected:'Admin email received when new report submitted',priority:'High',type:'Positive'},
      {id:'MC-006',name:'Disable forum moderation entirely',pre:'Admin on settings',steps:'1. Toggle "Require Approval for New Posts" off\n2. Save',expected:'Posts published immediately without moderation; queue hidden',priority:'Medium',type:'Positive'},
      {id:'MC-007',name:'Enable pre-moderation for new users (first N posts require approval)',pre:'Moderation settings',steps:'1. Enable "Moderate first 3 posts from new users"\n2. Save\n3. New user posts',expected:'First 3 posts from that user require moderator approval before visible',priority:'Medium',type:'Positive'},
      {id:'MC-008',name:'Link-only posts flagged when link-posting disabled',pre:'Setting: "Block posts with external links"',steps:'1. Post a thread with http link\n2. Save',expected:'Post rejected or flagged: "External links not allowed"',priority:'Medium',type:'Positive'},
    ]
  },
];
