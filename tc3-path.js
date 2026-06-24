module.exports = [
  {
    code:'PATH-LIST',title:'Pathways — List Page',cases:[
      {id:'PL-001',name:'Pathways list loads with title, course count, enrolled learners, status',pre:'Logged in; pathways exist',steps:'1. Click Pathways in sidebar\n2. Observe list',expected:'Table/cards: title, number of courses, enrolled learners, completion rate, status, actions',priority:'Critical',type:'Positive'},
      {id:'PL-002',name:'Search pathways by title',pre:'Multiple pathways',steps:'1. Enter partial title',expected:'Matching pathways shown',priority:'High',type:'Positive'},
      {id:'PL-003',name:'Filter by status — Published/Draft/Archived',pre:'Mixed status pathways',steps:'1. Select "Published"',expected:'Only published pathways shown',priority:'High',type:'Positive'},
      {id:'PL-004',name:'Sort by enrolled learners',pre:'Pathways list',steps:'1. Sort by Learners',expected:'Most-enrolled pathway at top',priority:'Low',type:'Positive'},
      {id:'PL-005',name:'Click pathway opens detail page with tabs',pre:'Pathway in list',steps:'1. Click pathway title',expected:'Detail page with tabs: Info, Courses/Sequence, Learners, Analytics',priority:'High',type:'Positive'},
      {id:'PL-006',name:'Empty state — no pathways',pre:'No pathways',steps:'1. Open Pathways',expected:'"No pathways yet" with Create button',priority:'Low',type:'Negative'},
    ]
  },
  {
    code:'PATH-FORM',title:'Pathways — Create & Edit',cases:[
      {id:'PF-001',name:'Create pathway — all required fields, saves successfully',pre:'Create Pathway form open',steps:'1. Enter title "Full-Stack Developer Path"\n2. Add description\n3. Save',expected:'Pathway created as Draft; redirected to detail page',priority:'Critical',type:'Positive'},
      {id:'PF-002',name:'Title required — blank fails',pre:'Create form',steps:'1. Leave title blank\n2. Save',expected:'Required field error',priority:'Critical',type:'Validation'},
      {id:'PF-003',name:'Publish pathway — moves to Published status',pre:'Draft pathway with courses',steps:'1. Click Publish\n2. Confirm',expected:'Status changes to Published; visible in learner portal',priority:'Critical',type:'Positive'},
      {id:'PF-004',name:'Publish pathway with no courses — rejected',pre:'Draft pathway; 0 courses',steps:'1. Click Publish',expected:'Error: "Add at least one course before publishing"',priority:'High',type:'Validation'},
      {id:'PF-005',name:'Archive pathway',pre:'Published pathway',steps:'1. Click Archive\n2. Confirm',expected:'Pathway archived; removed from public; enrolled learners retain access',priority:'High',type:'Positive'},
      {id:'PF-006',name:'Delete pathway with confirmation',pre:'Draft pathway',steps:'1. Delete\n2. Confirm',expected:'Pathway deleted permanently',priority:'High',type:'Positive'},
      {id:'PF-007',name:'Delete published pathway with enrolled learners warns',pre:'Published pathway with learners',steps:'1. Click Delete',expected:'Warning: "X learners enrolled. Deleting will revoke their access."',priority:'High',type:'Negative'},
      {id:'PF-008',name:'Add thumbnail to pathway',pre:'Create/edit form',steps:'1. Upload thumbnail image\n2. Save',expected:'Thumbnail shown on pathway card in learner portal',priority:'Medium',type:'Positive'},
      {id:'PF-009',name:'Set estimated completion time for pathway',pre:'Edit form; duration field',steps:'1. Enter "6 months"\n2. Save',expected:'Estimated duration shown in learner portal pathway info',priority:'Medium',type:'Positive'},
      {id:'PF-010',name:'Set pathway as free or paid',pre:'Edit form; pricing field',steps:'1. Set price $299\n2. Save',expected:'Pathway requires purchase; Stripe checkout triggered on enroll',priority:'High',type:'Positive'},
    ]
  },
  {
    code:'PATH-SEQ',title:'Pathways — Course Sequence & Prerequisites',cases:[
      {id:'PS-001',name:'Add course to pathway sequence',pre:'Pathway detail; Courses tab',steps:'1. Click "Add Course"\n2. Select course\n3. Confirm',expected:'Course added to pathway sequence at next position; course count increments',priority:'Critical',type:'Positive'},
      {id:'PS-002',name:'Add course already in pathway rejected',pre:'Course already in pathway',steps:'1. Try to add same course',expected:'Error: "This course is already in this pathway"',priority:'High',type:'Validation'},
      {id:'PS-003',name:'Reorder courses via drag-and-drop',pre:'Pathway with multiple courses',steps:'1. Drag course 3 to position 1',expected:'Sequence updated; learners must now take new position 1 first',priority:'High',type:'Positive'},
      {id:'PS-004',name:'Set prerequisite — Course B requires Course A completion',pre:'Pathway with A and B; prereq setting',steps:'1. Edit Course B\n2. Set prerequisite: "Must complete Course A first"\n3. Save',expected:'Learners locked from Course B until Course A is 100% complete',priority:'Critical',type:'Positive'},
      {id:'PS-005',name:'Remove prerequisite from course in pathway',pre:'Prerequisite set',steps:'1. Remove prerequisite\n2. Save',expected:'Learners can now access course without completing the prerequisite',priority:'High',type:'Positive'},
      {id:'PS-006',name:'Circular prerequisite rejected',pre:'A requires B; try to make B require A',steps:'1. Set B prerequisite to A, A to B\n2. Save',expected:'Error: "Circular dependency detected in prerequisites"',priority:'High',type:'Validation'},
      {id:'PS-007',name:'Sequential enforcement — locked course shows lock icon to learner',pre:'Learner has not completed Course A',steps:'1. Log in as learner\n2. Open pathway',expected:'Course B shows padlock icon; click shows "Complete Course A first" message',priority:'High',type:'Positive'},
      {id:'PS-008',name:'Remove course from pathway',pre:'Course in pathway',steps:'1. Click Remove on course\n2. Confirm',expected:'Course removed from sequence; positions of remaining courses adjusted',priority:'High',type:'Positive'},
      {id:'PS-009',name:'Pathway progress updates when course completed',pre:'Learner in pathway; completes Course 1 of 5',steps:'1. Learner completes Course 1\n2. Admin views pathway learner detail',expected:'Progress updates to 20% (1/5); Course 2 unlocked if sequential',priority:'High',type:'Positive'},
      {id:'PS-010',name:'Set optional vs required courses within pathway',pre:'Pathway with elective option',steps:'1. Mark course as "Optional"\n2. Save',expected:'Optional courses shown with optional badge; completion of pathway does not require them',priority:'Medium',type:'Positive'},
      {id:'PS-011',name:'Pathway completion requires all non-optional courses',pre:'Pathway with 4 required, 1 optional',steps:'1. Learner completes all 4 required courses\n2. Check completion status',expected:'Pathway marked complete; certificate issued; optional course untouched',priority:'High',type:'Positive'},
      {id:'PS-012',name:'Pathway certificate issued on completion',pre:'Pathway has certificate configured',steps:'1. Learner completes all required pathway courses',expected:'Certificate with pathway name issued; visible in learner profile',priority:'High',type:'Positive'},
    ]
  },
  {
    code:'PATH-LRNR',title:'Pathways — Learner Enrollment & Progress',cases:[
      {id:'PLR-001',name:'Learners tab shows enrolled learners with per-course progress',pre:'Pathway detail; Learners tab',steps:'1. Click Learners tab',expected:'Table: name, email, enrolled date, courses completed, overall %, last active',priority:'Critical',type:'Positive'},
      {id:'PLR-002',name:'Manually enroll learner in pathway',pre:'Learners tab',steps:'1. Click Enroll Learner\n2. Select user\n3. Confirm',expected:'Learner enrolled in all pathway courses; appears in Learners tab',priority:'High',type:'Positive'},
      {id:'PLR-003',name:'Unenroll learner from pathway',pre:'Learner enrolled',steps:'1. Click Unenroll\n2. Confirm',expected:'Learner unenrolled from pathway and all its courses',priority:'High',type:'Positive'},
      {id:'PLR-004',name:'Search learners by name/email',pre:'Learners tab',steps:'1. Enter name in search',expected:'Matching learners shown',priority:'High',type:'Positive'},
      {id:'PLR-005',name:'Filter learners by completion status',pre:'Learners tab',steps:'1. Filter by "In Progress"',expected:'Only in-progress learners shown',priority:'Medium',type:'Positive'},
      {id:'PLR-006',name:'Export learner progress as CSV',pre:'Learners tab',steps:'1. Export CSV',expected:'CSV: learner details + per-course completion status',priority:'Medium',type:'Positive'},
      {id:'PLR-007',name:'Click learner row shows detailed breakdown of course completions',pre:'Learners tab',steps:'1. Click learner name',expected:'Breakdown: each course in pathway with status (locked, in progress, complete, not started)',priority:'High',type:'Positive'},
      {id:'PLR-008',name:'IDOR — learner cannot view other learners\' pathway progress',pre:'Learner in pathway',steps:'1. GET /api/pathways/{id}/learners/{other-learner-id}',expected:'403 Forbidden',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'PATH-ANLT',title:'Pathways — Analytics',cases:[
      {id:'PA-001',name:'Analytics tab shows total enrolled learners',pre:'Pathway detail; Analytics tab',steps:'1. Click Analytics tab',expected:'Total enrollment count metric',priority:'High',type:'Positive'},
      {id:'PA-002',name:'Analytics shows overall completion rate',pre:'Analytics tab',steps:'1. View completion rate',expected:'% of enrolled learners who completed all required courses',priority:'High',type:'Positive'},
      {id:'PA-003',name:'Analytics shows drop-off by course (which course learners quit)',pre:'Analytics tab; learner abandonment data',steps:'1. View drop-off section',expected:'Per-course breakdown showing how many learners stopped at each course',priority:'High',type:'Positive'},
      {id:'PA-004',name:'Analytics — most challenging course in pathway',pre:'Analytics tab',steps:'1. View bottleneck insight',expected:'Course with lowest completion rate highlighted as the bottleneck',priority:'Medium',type:'Positive'},
      {id:'PA-005',name:'Analytics — average days to complete pathway',pre:'Analytics tab; completion data',steps:'1. View time-to-complete metric',expected:'Avg. number of days from enrollment to full pathway completion',priority:'Medium',type:'Positive'},
      {id:'PA-006',name:'Date range filter on analytics',pre:'Analytics tab',steps:'1. Change to Last 60 Days',expected:'All metrics reflect only that period',priority:'Medium',type:'Positive'},
      {id:'PA-007',name:'Export pathway analytics as CSV',pre:'Analytics tab',steps:'1. Click Export',expected:'CSV with enrollment, completion, and drop-off data',priority:'Medium',type:'Positive'},
      {id:'PA-008',name:'Empty analytics for new pathway',pre:'Pathway with 0 enrollments',steps:'1. Open Analytics',expected:'"No data yet" placeholder',priority:'Low',type:'Negative'},
    ]
  },
];
