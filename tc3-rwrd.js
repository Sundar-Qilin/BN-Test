module.exports = [
  {
    code:'RWRD-RULES',title:'Rewards — Point Rules',cases:[
      {id:'RR-001',name:'Reward rules page loads with action, points, status',pre:'Logged in as admin; rewards configured',steps:'1. Click Rewards in sidebar\n2. Open Rules tab',expected:'Table: trigger action, points awarded, status (active/inactive), daily limit',priority:'Critical',type:'Positive'},
      {id:'RR-002',name:'Create rule — award 50 points for course completion',pre:'Rules tab; Create Rule',steps:'1. Select trigger "Course Completed"\n2. Enter 50 points\n3. Set active\n4. Save',expected:'Rule saved; learners earn 50 points on course completion',priority:'Critical',type:'Positive'},
      {id:'RR-003',name:'Create rule — award 10 points for forum post',pre:'Create rule form',steps:'1. Trigger "Forum Post"\n2. 10 points\n3. Save',expected:'Rule saved; learners earn 10 points when posting in forum',priority:'High',type:'Positive'},
      {id:'RR-004',name:'Create rule — award 5 points per lesson completion',pre:'Create rule form',steps:'1. Trigger "Lesson Completed"\n2. 5 points\n3. Daily limit 50\n4. Save',expected:'Learners earn 5 pts per lesson; max 50 per day from this rule',priority:'High',type:'Positive'},
      {id:'RR-005',name:'Trigger action required — blank fails',pre:'Create rule form',steps:'1. Leave trigger blank\n2. Save',expected:'Required field error',priority:'High',type:'Validation'},
      {id:'RR-006',name:'Points required — blank fails',pre:'Create rule form',steps:'1. Leave points blank\n2. Save',expected:'Required field error',priority:'High',type:'Validation'},
      {id:'RR-007',name:'Points must be positive number',pre:'Create rule',steps:'1. Enter -10 points\n2. Save',expected:'Validation error: must be positive',priority:'High',type:'Validation'},
      {id:'RR-008',name:'Points max boundary — 10000 accepted',pre:'Create rule',steps:'1. Enter 10000 points\n2. Save',expected:'Saved successfully',priority:'Low',type:'Boundary'},
      {id:'RR-009',name:'Disable a rule stops points being awarded',pre:'Active rule',steps:'1. Toggle rule to inactive\n2. Save\n3. Trigger the action as learner',expected:'No points awarded; rule inactive',priority:'High',type:'Positive'},
      {id:'RR-010',name:'Re-enable disabled rule resumes awarding points',pre:'Inactive rule',steps:'1. Toggle to active\n2. Save\n3. Trigger action',expected:'Points awarded again',priority:'High',type:'Positive'},
      {id:'RR-011',name:'Edit rule — change points value',pre:'Existing rule',steps:'1. Change points from 50 to 75\n2. Save',expected:'Future completions award 75 points; existing awards unchanged',priority:'High',type:'Positive'},
      {id:'RR-012',name:'Delete rule — existing points earned retained',pre:'Rule with history of awards',steps:'1. Delete rule\n2. Check learner history',expected:'Rule deleted; previously awarded points kept in learner accounts',priority:'High',type:'Positive'},
      {id:'RR-013',name:'Daily limit enforced — learner cannot exceed daily cap',pre:'Rule: 5pts/lesson, daily cap 50',steps:'1. Learner completes 15 lessons in one day',expected:'First 10 lessons award 5pts each (50pts total); lessons 11-15 award 0 pts that day',priority:'High',type:'Boundary'},
      {id:'RR-014',name:'Rule applies per-org (org_admin cannot set platform-wide rules)',pre:'Logged in as org_admin',steps:'1. Create a reward rule',expected:'Rule scoped to own org only; not visible to other orgs',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'RWRD-BDGS',title:'Rewards — Badge Management',cases:[
      {id:'RB-001',name:'Badge list loads with name, image, type, award count',pre:'Rewards > Badges tab',steps:'1. Open Badges tab',expected:'List: badge name, image, type (manual/auto), total times awarded, status',priority:'Critical',type:'Positive'},
      {id:'RB-002',name:'Create badge — all fields, saves successfully',pre:'Create Badge form',steps:'1. Enter name "First Course"\n2. Upload badge image\n3. Add description\n4. Set type "Automatic"\n5. Set trigger "First Course Completed"\n6. Save',expected:'Badge created; awarded automatically to learners meeting trigger',priority:'Critical',type:'Positive'},
      {id:'RB-003',name:'Badge name required — blank fails',pre:'Create badge form',steps:'1. Leave name blank\n2. Save',expected:'Required field error',priority:'High',type:'Validation'},
      {id:'RB-004',name:'Badge image required — blank fails',pre:'Create badge form',steps:'1. Leave image unset\n2. Save',expected:'Required field error on image',priority:'High',type:'Validation'},
      {id:'RB-005',name:'Badge image — non-image file rejected',pre:'Create badge; image upload',steps:'1. Upload .pdf as badge image',expected:'Error: image files only',priority:'Medium',type:'Validation'},
      {id:'RB-006',name:'Auto badge — triggered on completion of specific course',pre:'Auto badge with trigger "Complete Course X"',steps:'1. Learner completes Course X\n2. Check learner profile',expected:'Badge auto-awarded; visible in learner profile; notification sent',priority:'Critical',type:'Positive'},
      {id:'RB-007',name:'Auto badge — not awarded if trigger not met',pre:'Auto badge trigger not met',steps:'1. Learner partially completes course\n2. Check profile',expected:'Badge not awarded; only granted on meeting full trigger criteria',priority:'High',type:'Negative'},
      {id:'RB-008',name:'Manual badge — award to specific learner',pre:'Manual badge exists; admin on Badges tab',steps:'1. Click "Award Badge"\n2. Search learner\n3. Select badge\n4. Enter reason\n5. Award',expected:'Badge awarded to learner immediately; shows in learner profile with award reason',priority:'High',type:'Positive'},
      {id:'RB-009',name:'Manual badge award — reason field required',pre:'Award badge form',steps:'1. Leave reason blank\n2. Award',expected:'Required field error on reason',priority:'High',type:'Validation'},
      {id:'RB-010',name:'Revoke badge from learner with reason',pre:'Badge awarded to learner',steps:'1. Click Revoke on awarded badge\n2. Enter reason\n3. Confirm',expected:'Badge revoked; removed from learner profile; revocation logged',priority:'High',type:'Positive'},
      {id:'RB-011',name:'Cannot award same badge twice to same learner',pre:'Learner already has badge',steps:'1. Try to award same badge again',expected:'Error: "Learner already has this badge"',priority:'Medium',type:'Validation'},
      {id:'RB-012',name:'Badge display order configurable',pre:'Multiple badges; display order field',steps:'1. Set display order 1 for featured badge\n2. Save',expected:'Featured badge shown first in learner profile badges section',priority:'Low',type:'Positive'},
      {id:'RB-013',name:'Edit badge — update name and description',pre:'Badge exists',steps:'1. Change name and description\n2. Save',expected:'Badge updated; existing awards retain new name',priority:'Medium',type:'Positive'},
      {id:'RB-014',name:'Delete badge — removes from all learner profiles',pre:'Badge awarded to 20 learners',steps:'1. Delete badge\n2. Check learner profiles',expected:'Badge removed from all learner profiles; cannot be re-awarded; action logged',priority:'High',type:'Positive'},
      {id:'RB-015',name:'Badge award history — see who has the badge',pre:'Badge list; click badge',steps:'1. Click badge name\n2. Open awarded-to tab',expected:'List of learners who have earned the badge with award date',priority:'Medium',type:'Positive'},
    ]
  },
  {
    code:'RWRD-LBRD',title:'Rewards — Leaderboard',cases:[
      {id:'RL-001',name:'Leaderboard tab shows top learners by total points',pre:'Rewards > Leaderboard tab; learners have points',steps:'1. Open Leaderboard tab',expected:'Ranked list: position, learner name, avatar, total points, badges count',priority:'Critical',type:'Positive'},
      {id:'RL-002',name:'Leaderboard updates when learner earns new points',pre:'Leaderboard visible; learner earns 100 points',steps:'1. Award points to learner\n2. Refresh leaderboard',expected:'Learner position updated; new points reflected',priority:'High',type:'Positive'},
      {id:'RL-003',name:'Filter leaderboard by time period — This Week',pre:'Leaderboard tab',steps:'1. Select "This Week" filter',expected:'Rankings based on points earned in current week only',priority:'High',type:'Positive'},
      {id:'RL-004',name:'Filter leaderboard by time period — This Month',pre:'Leaderboard tab',steps:'1. Select "This Month"',expected:'Rankings based on points earned this calendar month',priority:'High',type:'Positive'},
      {id:'RL-005',name:'Filter leaderboard by time period — All Time',pre:'Leaderboard tab',steps:'1. Select "All Time"',expected:'Rankings based on total cumulative points',priority:'Medium',type:'Positive'},
      {id:'RL-006',name:'Filter leaderboard by org',pre:'Super_admin; leaderboard',steps:'1. Select specific org filter',expected:'Only learners from that org ranked',priority:'High',type:'Positive'},
      {id:'RL-007',name:'Filter leaderboard by division',pre:'Leaderboard tab; multiple divisions',steps:'1. Select division filter',expected:'Only learners from that division shown',priority:'Medium',type:'Positive'},
      {id:'RL-008',name:'Tie-breaking — equal points sorted by most recent activity',pre:'Two learners with same points',steps:'1. View leaderboard',expected:'Learner who earned points most recently ranked higher; clear tie-break rule',priority:'Medium',type:'Positive'},
      {id:'RL-009',name:'Privacy — anonymous mode hides learner identity on public leaderboard',pre:'Anonymous mode enabled for org',steps:'1. View leaderboard as learner',expected:'Names replaced with "Learner #1", "Learner #2" etc.; avatars hidden',priority:'Medium',type:'Positive'},
      {id:'RL-010',name:'Export leaderboard as CSV',pre:'Leaderboard tab',steps:'1. Click Export',expected:'CSV with rank, name, email, total points, badges count',priority:'Medium',type:'Positive'},
      {id:'RL-011',name:'Leaderboard position visible to learner in their profile',pre:'Learner logged in',steps:'1. Learner opens own profile/dashboard',expected:'"You are #12 on the leaderboard" shown with their rank',priority:'Low',type:'Positive'},
      {id:'RL-012',name:'Learner cannot see other learners\' emails on leaderboard',pre:'Learner views leaderboard',steps:'1. View leaderboard as learner',expected:'Only names and points shown; no email addresses visible to other learners',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'RWRD-HIST',title:'Rewards — Points History & Manual Adjustment',cases:[
      {id:'RH-001',name:'Points history tab shows all earning events for all learners',pre:'Rewards > History tab',steps:'1. Open History tab',expected:'Table: learner name, action trigger, points earned, date, rule name',priority:'Critical',type:'Positive'},
      {id:'RH-002',name:'Filter history by learner',pre:'History tab',steps:'1. Search for specific learner\n2. Observe filtered history',expected:'Only that learner\'s point events shown',priority:'High',type:'Positive'},
      {id:'RH-003',name:'Filter history by trigger action',pre:'History tab',steps:'1. Filter by "Course Completed"',expected:'Only course completion point events shown',priority:'High',type:'Positive'},
      {id:'RH-004',name:'Filter history by date range',pre:'History tab',steps:'1. Set date range to last 30 days',expected:'Only events in that period shown',priority:'Medium',type:'Positive'},
      {id:'RH-005',name:'Manual point adjustment — add points to learner',pre:'History tab or User detail; Rewards section',steps:'1. Click "Adjust Points"\n2. Select learner\n3. Enter +200 points\n4. Enter reason "Contest Winner"\n5. Confirm',expected:'200 points added to learner balance; event logged in history',priority:'High',type:'Positive'},
      {id:'RH-006',name:'Manual point adjustment — deduct points from learner',pre:'Adjust points form; learner has 500 points',steps:'1. Enter -100 points\n2. Reason "Correction"\n3. Confirm',expected:'100 points deducted; learner now has 400; deduction event logged',priority:'High',type:'Positive'},
      {id:'RH-007',name:'Manual deduction cannot make balance negative',pre:'Learner has 100 points; deduct 200',steps:'1. Try to deduct 200 from 100-point balance\n2. Confirm',expected:'Error: "Cannot deduct more than current balance (100 pts)"',priority:'High',type:'Validation'},
      {id:'RH-008',name:'Reason required for manual adjustment',pre:'Adjust points form',steps:'1. Leave reason blank\n2. Confirm',expected:'Required field error',priority:'High',type:'Validation'},
      {id:'RH-009',name:'Manual adjustment logged with admin identity',pre:'Admin adjusts points',steps:'1. Adjust points\n2. View history entry',expected:'History shows "Manually adjusted by [admin name]" with reason',priority:'High',type:'Positive'},
      {id:'RH-010',name:'Export points history as CSV',pre:'History tab',steps:'1. Click Export',expected:'CSV with all point events',priority:'Medium',type:'Positive'},
    ]
  },
  {
    code:'RWRD-LVLS',title:'Rewards — Levels & Achievements',cases:[
      {id:'RLV-001',name:'Levels tab shows configured point thresholds and level names',pre:'Rewards > Levels tab',steps:'1. Open Levels tab',expected:'Table: level number, name, minimum points required, icon/badge',priority:'High',type:'Positive'},
      {id:'RLV-002',name:'Create level — Beginner at 0 points',pre:'Levels tab; Create Level',steps:'1. Name "Beginner"\n2. Min points 0\n3. Upload icon\n4. Save',expected:'Level created; learners at 0+ points show as Beginner',priority:'High',type:'Positive'},
      {id:'RLV-003',name:'Create level — Expert at 5000 points',pre:'Levels configured',steps:'1. Name "Expert"\n2. Min points 5000\n3. Save',expected:'Learners reaching 5000 pts advance to Expert level',priority:'High',type:'Positive'},
      {id:'RLV-004',name:'Overlapping level thresholds rejected',pre:'Levels configured',steps:'1. Create level with same min points as existing level',expected:'Error: "Threshold must be unique"',priority:'High',type:'Validation'},
      {id:'RLV-005',name:'Level up notification sent to learner',pre:'Learner crosses threshold for new level',steps:'1. Learner earns enough points to level up\n2. Check in-app notifications',expected:'Notification: "Congratulations! You reached Expert level!" shown',priority:'High',type:'Positive'},
      {id:'RLV-006',name:'Learner current level shown in their profile',pre:'Learner has points; level configured',steps:'1. View learner profile',expected:'Current level name and icon shown with progress to next level',priority:'High',type:'Positive'},
      {id:'RLV-007',name:'Level progress bar shows points to next level',pre:'Learner profile; levels configured',steps:'1. View levels section in learner profile',expected:'Progress bar showing "500/1000 pts to Intermediate" or similar',priority:'Medium',type:'Positive'},
      {id:'RLV-008',name:'Edit level — change name and icon',pre:'Level exists',steps:'1. Change name from "Pro" to "Professional"\n2. Upload new icon\n3. Save',expected:'Level name and icon updated; all learners at that level see new name',priority:'Medium',type:'Positive'},
      {id:'RLV-009',name:'Delete level — reassigns learners at that level to adjacent level',pre:'Level with learners assigned',steps:'1. Delete level\n2. Confirm',expected:'Learners reassigned to next lower or higher level; no orphaned records',priority:'High',type:'Positive'},
      {id:'RLV-010',name:'Achievements list shows special milestones',pre:'Rewards > Achievements section',steps:'1. Open Achievements tab',expected:'List of milestone achievements: "Enrolled in first course", "Completed 5 courses", "Posted first forum reply"',priority:'Medium',type:'Positive'},
    ]
  },
];
