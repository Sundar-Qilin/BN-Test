module.exports = [
  {
    code:'INST-LIST',title:'Instructors — List Page',cases:[
      {id:'IL-001',name:'Instructors list loads with name, avatar, bio excerpt, course count, rating',pre:'Logged in; instructors exist',steps:'1. Click Instructors in sidebar\n2. Observe list',expected:'Cards or table: avatar, name, short bio, number of courses, average learner rating',priority:'Critical',type:'Positive'},
      {id:'IL-002',name:'Search instructors by name',pre:'Multiple instructors',steps:'1. Enter partial name in search',expected:'Matching instructors shown',priority:'High',type:'Positive'},
      {id:'IL-003',name:'Filter instructors by org',pre:'Super_admin; multi-org',steps:'1. Select org filter',expected:'Only instructors in that org shown',priority:'High',type:'Positive'},
      {id:'IL-004',name:'Sort instructors by rating (highest first)',pre:'Instructors list',steps:'1. Sort by Rating',expected:'Highest-rated instructor at top',priority:'Medium',type:'Positive'},
      {id:'IL-005',name:'Sort instructors by course count',pre:'Instructors list',steps:'1. Sort by Courses',expected:'Instructor with most courses at top',priority:'Low',type:'Positive'},
      {id:'IL-006',name:'Click instructor card opens instructor detail',pre:'Instructor in list',steps:'1. Click instructor name',expected:'Instructor detail page opens with tabs: Profile, Courses, Analytics, Reviews',priority:'High',type:'Positive'},
      {id:'IL-007',name:'Empty state — no instructors',pre:'No instructors created',steps:'1. Open Instructors page',expected:'"No instructors yet" with Create button',priority:'Low',type:'Negative'},
      {id:'IL-008',name:'Org_admin sees only own org instructors',pre:'Logged in as org_admin',steps:'1. Open Instructors',expected:'Only own org instructors visible',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'INST-PROF',title:'Instructors — Profile Management',cases:[
      {id:'IP-001',name:'Create instructor profile — all fields filled successfully',pre:'Click Create Instructor or create instructor from Users',steps:'1. Enter full name, email, bio, credentials\n2. Upload headshot\n3. Assign to org\n4. Save',expected:'Instructor profile created; appears in instructor list',priority:'Critical',type:'Positive'},
      {id:'IP-002',name:'Name required — blank fails',pre:'Create form',steps:'1. Leave name blank\n2. Save',expected:'Required field error',priority:'Critical',type:'Validation'},
      {id:'IP-003',name:'Email required — blank fails',pre:'Create form',steps:'1. Leave email blank\n2. Save',expected:'Required field error',priority:'Critical',type:'Validation'},
      {id:'IP-004',name:'Duplicate email rejected',pre:'User with this email exists',steps:'1. Enter existing email\n2. Save',expected:'Error: "Email already in use"',priority:'High',type:'Validation'},
      {id:'IP-005',name:'Upload profile headshot — valid JPEG succeeds',pre:'Create/edit form',steps:'1. Upload JPEG headshot\n2. Save',expected:'Headshot displayed in profile and course listings',priority:'High',type:'Positive'},
      {id:'IP-006',name:'Headshot file too large rejected',pre:'Edit form',steps:'1. Upload 10MB headshot\n2. Save',expected:'Error: file too large',priority:'Medium',type:'Validation'},
      {id:'IP-007',name:'Bio field allows rich text (bold, links)',pre:'Edit form; bio field with rich editor',steps:'1. Add bold text and hyperlink in bio\n2. Save',expected:'Rich text formatting preserved in bio display',priority:'Medium',type:'Positive'},
      {id:'IP-008',name:'XSS in bio sanitized',pre:'Edit form; bio field',steps:'1. Enter <script>alert(1)</script> in bio\n2. Save',expected:'Script stripped; bio renders as safe text',priority:'Critical',type:'Security'},
      {id:'IP-009',name:'Add credentials — degree, certification, institution',pre:'Edit profile; Credentials section',steps:'1. Add "MSc Computer Science, MIT, 2015"\n2. Save',expected:'Credential shown in learner-facing instructor profile',priority:'High',type:'Positive'},
      {id:'IP-010',name:'Add social profile links',pre:'Edit form; Social links section',steps:'1. Add LinkedIn URL, Twitter handle\n2. Save',expected:'Links shown in profile; open correctly in new tab',priority:'Medium',type:'Positive'},
      {id:'IP-011',name:'Social link invalid URL format rejected',pre:'Edit form',steps:'1. Enter "not a url" in LinkedIn field\n2. Save',expected:'Validation error: invalid URL',priority:'Medium',type:'Validation'},
      {id:'IP-012',name:'Deactivate instructor profile',pre:'Active instructor',steps:'1. Click Deactivate\n2. Confirm',expected:'Profile deactivated; hidden from learner-facing search; courses remain but attribution shows "Inactive Instructor"',priority:'High',type:'Positive'},
      {id:'IP-013',name:'Reactivate deactivated instructor',pre:'Inactive instructor',steps:'1. Click Activate\n2. Confirm',expected:'Profile reactivated; visible again in listings',priority:'High',type:'Positive'},
      {id:'IP-014',name:'Delete instructor with courses — warn about course attribution',pre:'Instructor has courses',steps:'1. Click Delete',expected:'Warning: "Instructor has X courses. Deleting will unassign them. Continue?"',priority:'High',type:'Negative'},
      {id:'IP-015',name:'Edit instructor profile — all fields update correctly',pre:'Existing instructor',steps:'1. Change name, bio, credentials\n2. Save',expected:'All changes saved and reflected in profile and course cards',priority:'High',type:'Positive'},
      {id:'IP-016',name:'Instructor profile URL / public link',pre:'Instructor profile',steps:'1. Copy public profile link\n2. Open in incognito',expected:'Public-facing instructor page shows bio, credentials, courses',priority:'Medium',type:'Positive'},
      {id:'IP-017',name:'Instructor profile page responsive on mobile',pre:'Profile page; mobile viewport',steps:'1. Open on 375px viewport',expected:'Avatar, bio, course list stacked cleanly; no overflow',priority:'Medium',type:'UI/UX'},
    ]
  },
  {
    code:'INST-CRSES',title:'Instructors — Assigned Courses',cases:[
      {id:'IC-001',name:'Courses tab shows all courses instructor is assigned to',pre:'Instructor detail; Courses tab',steps:'1. Click Courses tab on instructor detail',expected:'List: course name, status, enrolled learners, avg. rating, completion rate',priority:'High',type:'Positive'},
      {id:'IC-002',name:'Assign instructor to a course from instructor detail',pre:'Courses tab; instructor not assigned to course X',steps:'1. Click "Assign to Course"\n2. Search and select course\n3. Confirm',expected:'Instructor assigned; appears on course as instructor',priority:'High',type:'Positive'},
      {id:'IC-003',name:'Instructor assigned to same course twice rejected',pre:'Already assigned',steps:'1. Try to assign again',expected:'Error or no-op: "Already assigned to this course"',priority:'Medium',type:'Validation'},
      {id:'IC-004',name:'Unassign instructor from course',pre:'Instructor assigned to course',steps:'1. Click Remove/Unassign on a course\n2. Confirm',expected:'Instructor unassigned; course shows no instructor or "TBD"',priority:'High',type:'Positive'},
      {id:'IC-005',name:'Filter assigned courses by status',pre:'Courses tab; mixed statuses',steps:'1. Filter by Published',expected:'Only published courses shown',priority:'Medium',type:'Positive'},
      {id:'IC-006',name:'Click course name navigates to course detail',pre:'Courses tab',steps:'1. Click a course name',expected:'Course detail editor opens',priority:'Medium',type:'Positive'},
      {id:'IC-007',name:'Empty state — instructor assigned to no courses',pre:'Instructor with no courses',steps:'1. Open Courses tab',expected:'"Not assigned to any courses" with Assign button',priority:'Low',type:'Negative'},
      {id:'IC-008',name:'IDOR — instructor cannot self-assign to courses via API',pre:'Logged in as instructor',steps:'1. POST to assign self to unauthorized course',expected:'403 Forbidden',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'INST-ANLT',title:'Instructors — Analytics & Reviews',cases:[
      {id:'IA-001',name:'Analytics tab shows total learner count across all courses',pre:'Instructor detail; Analytics tab',steps:'1. Click Analytics tab',expected:'Total learners enrolled in instructor\'s courses shown as metric card',priority:'High',type:'Positive'},
      {id:'IA-002',name:'Analytics tab shows average course rating',pre:'Analytics tab; learner reviews exist',steps:'1. View analytics',expected:'Average rating (e.g., 4.3/5) displayed as metric',priority:'High',type:'Positive'},
      {id:'IA-003',name:'Analytics tab shows average course completion rate',pre:'Analytics tab; learner completions exist',steps:'1. View analytics',expected:'Completion rate % shown; calculates across all courses',priority:'High',type:'Positive'},
      {id:'IA-004',name:'Analytics — learner count chart over time',pre:'Analytics tab',steps:'1. View chart area',expected:'Line or bar chart showing new enrollments per month across all instructor courses',priority:'Medium',type:'Positive'},
      {id:'IA-005',name:'Analytics — date range filter changes all metrics',pre:'Analytics tab',steps:'1. Change from All Time to Last 90 Days',expected:'All metrics and charts update to reflect selected period',priority:'Medium',type:'Positive'},
      {id:'IA-006',name:'Reviews tab shows learner reviews for all courses',pre:'Instructor detail; Reviews tab',steps:'1. Click Reviews tab',expected:'List of reviews: learner name, course, star rating, review text, date',priority:'High',type:'Positive'},
      {id:'IA-007',name:'Reviews tab — filter by star rating',pre:'Reviews tab; reviews with 1–5 stars',steps:'1. Select 1-star filter',expected:'Only 1-star reviews shown',priority:'Medium',type:'Positive'},
      {id:'IA-008',name:'Reviews tab — flag/remove inappropriate review',pre:'Reviews tab; super_admin or org_admin',steps:'1. Click Flag/Delete on a review\n2. Confirm',expected:'Review removed from public view; instructor no longer sees it in rating calculation',priority:'High',type:'Positive'},
      {id:'IA-009',name:'Analytics data inaccessible to other instructors',pre:'Logged in as different instructor',steps:'1. Try GET /api/instructors/{other-instructor-id}/analytics',expected:'403 Forbidden; cross-instructor analytics not accessible',priority:'Critical',type:'Security'},
      {id:'IA-010',name:'Analytics shows empty state if no learner data',pre:'New instructor with no enrollments',steps:'1. Open Analytics tab',expected:'"No analytics data yet" with encourage message',priority:'Low',type:'Negative'},
    ]
  },
];
