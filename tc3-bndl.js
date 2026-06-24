module.exports = [
  {
    code:'BNDL-LIST',title:'Bundles — List Page',cases:[
      {id:'BL-001',name:'Bundles list loads with title, price, course count, status, revenue',pre:'Logged in; bundles exist',steps:'1. Click Bundles in sidebar\n2. Observe list',expected:'Table/card: title, price, course count, enrolled learners, status, revenue, created date',priority:'Critical',type:'Positive'},
      {id:'BL-002',name:'Search bundles by title',pre:'Multiple bundles',steps:'1. Enter partial title in search',expected:'Matching bundles shown',priority:'High',type:'Positive'},
      {id:'BL-003',name:'Filter bundles by status — Published/Draft/Archived',pre:'Bundles list; mixed statuses',steps:'1. Select "Published" filter',expected:'Only published bundles shown',priority:'High',type:'Positive'},
      {id:'BL-004',name:'Sort bundles by price ascending',pre:'Bundles list',steps:'1. Sort by Price A-Z (Low to High)',expected:'Cheapest bundle at top',priority:'Low',type:'Positive'},
      {id:'BL-005',name:'Sort bundles by enrolled learners',pre:'Bundles list',steps:'1. Sort by Learners',expected:'Bundle with most learners at top',priority:'Low',type:'Positive'},
      {id:'BL-006',name:'Click bundle opens bundle detail page',pre:'Bundle in list',steps:'1. Click bundle title',expected:'Bundle detail with tabs: Info, Courses, Learners, Analytics',priority:'High',type:'Positive'},
      {id:'BL-007',name:'Empty state — no bundles',pre:'No bundles created',steps:'1. Open Bundles',expected:'"No bundles yet" with Create button',priority:'Low',type:'Negative'},
    ]
  },
  {
    code:'BNDL-FORM',title:'Bundles — Create & Edit',cases:[
      {id:'BF-001',name:'Create bundle — required fields, saves successfully',pre:'Create Bundle form open',steps:'1. Enter title "Complete Finance Bundle"\n2. Add description\n3. Set price $199\n4. Save',expected:'Bundle created in Draft status; redirect to bundle detail',priority:'Critical',type:'Positive'},
      {id:'BF-002',name:'Bundle title required — blank fails',pre:'Create form',steps:'1. Leave title blank\n2. Save',expected:'Required field error',priority:'Critical',type:'Validation'},
      {id:'BF-003',name:'Bundle price — zero price creates a free bundle',pre:'Create form',steps:'1. Enter $0 price\n2. Save',expected:'Bundle created as free; no payment required at checkout',priority:'High',type:'Positive'},
      {id:'BF-004',name:'Bundle price — negative value rejected',pre:'Create form',steps:'1. Enter -$10\n2. Save',expected:'Validation error: price must be 0 or greater',priority:'High',type:'Validation'},
      {id:'BF-005',name:'Bundle price — non-numeric rejected',pre:'Create form',steps:'1. Enter "abc" in price\n2. Save',expected:'Validation error: must be a number',priority:'High',type:'Validation'},
      {id:'BF-006',name:'Bundle thumbnail upload — valid image accepted',pre:'Create form',steps:'1. Upload PNG thumbnail\n2. Save',expected:'Thumbnail shown on bundle card in learner portal',priority:'High',type:'Positive'},
      {id:'BF-007',name:'Bundle thumbnail — non-image rejected',pre:'Create form',steps:'1. Upload .exe as thumbnail',expected:'Error: image files only',priority:'Medium',type:'Validation'},
      {id:'BF-008',name:'Rich text description with formatting',pre:'Create form; description field',steps:'1. Add bold heading and bullet list\n2. Save',expected:'Formatting preserved in bundle description on learner-facing page',priority:'Medium',type:'Positive'},
      {id:'BF-009',name:'Set bundle as "On Sale" with discounted price',pre:'Create/edit bundle; sale price field',steps:'1. Set original price $299\n2. Set sale price $199\n3. Toggle "On Sale"\n4. Save',expected:'Bundle shows strikethrough original price and sale price in learner portal',priority:'High',type:'Positive'},
      {id:'BF-010',name:'Sale price > original price rejected',pre:'Edit bundle; pricing fields',steps:'1. Set sale price $350 when original is $299\n2. Save',expected:'Validation error: sale price must be less than original price',priority:'High',type:'Validation'},
      {id:'BF-011',name:'Publish bundle — moves from Draft to Published',pre:'Draft bundle; all required data set',steps:'1. Click Publish\n2. Confirm',expected:'Bundle status changes to Published; visible in learner portal',priority:'Critical',type:'Positive'},
      {id:'BF-012',name:'Publish bundle with no courses — rejected',pre:'Draft bundle; no courses added',steps:'1. Click Publish',expected:'Error: "Bundle must contain at least one course before publishing"',priority:'High',type:'Validation'},
      {id:'BF-013',name:'Archive bundle — removes from public listing',pre:'Published bundle',steps:'1. Click Archive\n2. Confirm',expected:'Bundle archived; no longer visible in learner portal; existing learners retain access',priority:'High',type:'Positive'},
      {id:'BF-014',name:'Delete bundle — permanent with confirmation',pre:'Draft or archived bundle',steps:'1. Click Delete\n2. Confirm by typing bundle name\n3. Delete',expected:'Bundle deleted; associated learner access optionally revoked',priority:'High',type:'Positive'},
      {id:'BF-015',name:'Edit bundle while published — changes live immediately',pre:'Published bundle; edit title',steps:'1. Change title\n2. Save',expected:'Title updates immediately in learner portal; no re-publishing needed',priority:'Medium',type:'Positive'},
    ]
  },
  {
    code:'BNDL-CRSES',title:'Bundles — Course Management',cases:[
      {id:'BC-001',name:'Courses tab shows all courses in bundle',pre:'Bundle detail; Courses tab',steps:'1. Click Courses tab',expected:'List of courses in bundle: title, status, lesson count, instructor',priority:'High',type:'Positive'},
      {id:'BC-002',name:'Add course to bundle',pre:'Courses tab; course not in bundle',steps:'1. Click "Add Course"\n2. Search and select course\n3. Confirm',expected:'Course added to bundle; bundle course count increments',priority:'High',type:'Positive'},
      {id:'BC-003',name:'Add already-included course rejected',pre:'Courses tab',steps:'1. Try to add course already in bundle',expected:'Error: "This course is already in this bundle"',priority:'Medium',type:'Validation'},
      {id:'BC-004',name:'Remove course from bundle with confirmation',pre:'Course in bundle',steps:'1. Click Remove on course\n2. Confirm',expected:'Course removed from bundle; bundle count decrements',priority:'High',type:'Positive'},
      {id:'BC-005',name:'Reorder courses in bundle',pre:'Bundle with multiple courses',steps:'1. Drag course to new position',expected:'Course order updated; learner portal reflects new order',priority:'Medium',type:'Positive'},
      {id:'BC-006',name:'Only published courses can be added to bundle',pre:'Draft course exists',steps:'1. Try to add Draft course to bundle',expected:'Draft courses excluded from picker or warning shown',priority:'High',type:'Validation'},
      {id:'BC-007',name:'Minimum course count enforced for published bundle',pre:'Bundle with 1 course',steps:'1. Remove the only course from a published bundle',expected:'Error or bundle auto-reverted to Draft',priority:'High',type:'Negative'},
    ]
  },
  {
    code:'BNDL-LRNR',title:'Bundles — Learner Enrollment & Access',cases:[
      {id:'BLR-001',name:'Learners tab shows all enrolled learners with progress per course',pre:'Bundle detail; Learners tab; enrollments exist',steps:'1. Click Learners tab',expected:'Table: learner name, email, enrolled date, progress per course, overall completion %',priority:'Critical',type:'Positive'},
      {id:'BLR-002',name:'Search enrolled learners by name or email',pre:'Learners tab',steps:'1. Enter name in search',expected:'Matching learners shown',priority:'High',type:'Positive'},
      {id:'BLR-003',name:'Filter learners by completion status',pre:'Learners tab; mixed progress',steps:'1. Filter by "Completed"',expected:'Only learners who completed all bundle courses shown',priority:'High',type:'Positive'},
      {id:'BLR-004',name:'Manually enroll learner in bundle',pre:'Learners tab',steps:'1. Click "Enroll Learner"\n2. Search user\n3. Confirm',expected:'User enrolled in all bundle courses; appears in Learners tab',priority:'High',type:'Positive'},
      {id:'BLR-005',name:'Unenroll learner from bundle with confirmation',pre:'Learner enrolled in bundle',steps:'1. Click Unenroll\n2. Confirm',expected:'Learner unenrolled from all bundle courses; loses access',priority:'High',type:'Positive'},
      {id:'BLR-006',name:'Export learner list as CSV',pre:'Learners tab',steps:'1. Click Export',expected:'CSV with learner details and per-course progress',priority:'Medium',type:'Positive'},
      {id:'BLR-007',name:'Pagination on large learner list',pre:'Many learners enrolled',steps:'1. Click Next page',expected:'Next set of learners loads',priority:'Low',type:'Positive'},
      {id:'BLR-008',name:'IDOR — learner cannot access other bundles via direct URL',pre:'Learner enrolled in Bundle A',steps:'1. GET /api/bundles/{bundle-B-id} with learner token',expected:'403 Forbidden if not enrolled or not accessible',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'BNDL-ANLT',title:'Bundles — Analytics',cases:[
      {id:'BA-001',name:'Analytics tab shows total revenue from bundle sales',pre:'Bundle detail; Analytics tab; purchases exist',steps:'1. Click Analytics tab',expected:'Total revenue metric shown (sum of all payments)',priority:'High',type:'Positive'},
      {id:'BA-002',name:'Analytics shows enrollment count over time (chart)',pre:'Analytics tab',steps:'1. View chart area',expected:'Bar or line chart: new enrollments per week/month',priority:'High',type:'Positive'},
      {id:'BA-003',name:'Analytics shows average completion rate across all courses',pre:'Analytics tab',steps:'1. View completion rate metric',expected:'Avg. % of bundle courses completed by enrolled learners',priority:'High',type:'Positive'},
      {id:'BA-004',name:'Analytics shows refund rate and refund count',pre:'Analytics tab; refunds exist',steps:'1. View refund metrics',expected:'Refund count and refund % of total sales shown',priority:'Medium',type:'Positive'},
      {id:'BA-005',name:'Date range filter updates all analytics metrics',pre:'Analytics tab',steps:'1. Change to Last 30 Days',expected:'All metrics and charts update',priority:'Medium',type:'Positive'},
      {id:'BA-006',name:'Export bundle analytics report as CSV',pre:'Analytics tab',steps:'1. Click Export',expected:'CSV with date-bucketed enrollment and revenue data',priority:'Medium',type:'Positive'},
      {id:'BA-007',name:'Empty analytics state for new bundle',pre:'Bundle with 0 enrollments',steps:'1. Open Analytics tab',expected:'"No analytics data yet" placeholder',priority:'Low',type:'Negative'},
    ]
  },
];
