module.exports = [
  {
    code:'MDLA-LIST',title:'Module Library — List & Overview',cases:[
      {id:'ML-001',name:'Module Library list loads with module name, lesson count, type, org, created date',pre:'Logged in as super_admin; modules exist',steps:'1. Click Module Library in sidebar\n2. Observe table',expected:'Table: module name, lesson count, category/type, org, created date, reuse count, actions',priority:'Critical',type:'Positive'},
      {id:'ML-002',name:'Search modules by name',pre:'Module Library; multiple modules',steps:'1. Enter partial module name in search',expected:'Matching modules shown',priority:'High',type:'Positive'},
      {id:'ML-003',name:'Filter modules by type/category',pre:'Modules with mixed types',steps:'1. Select type filter (e.g., "Quiz Module")',expected:'Only that type shown',priority:'Medium',type:'Positive'},
      {id:'ML-004',name:'Filter modules by org',pre:'Super_admin; multi-org setup',steps:'1. Select org filter',expected:'Only modules from that org shown',priority:'High',type:'Positive'},
      {id:'ML-005',name:'Sort modules by reuse count (most reused first)',pre:'Modules with varying reuse counts',steps:'1. Click Reuse Count column',expected:'Most-reused modules at top',priority:'Low',type:'Positive'},
      {id:'ML-006',name:'Module list empty state for new installation',pre:'No modules created',steps:'1. Open Module Library',expected:'"No modules yet" with Create Module button',priority:'Low',type:'Negative'},
      {id:'ML-007',name:'Click module name opens module detail/edit page',pre:'Module in list',steps:'1. Click module name',expected:'Module detail page opens with lesson list and settings',priority:'High',type:'Positive'},
      {id:'ML-008',name:'Pagination on module list',pre:'More modules than page size',steps:'1. Click Next page',expected:'Next set loads correctly',priority:'Low',type:'Positive'},
    ]
  },
  {
    code:'MDLA-FORM',title:'Module Library — Create & Edit Module',cases:[
      {id:'MF-001',name:'Create module — required fields filled, saves successfully',pre:'Click Create Module',steps:'1. Enter title "Fundamentals of Finance"\n2. Add description\n3. Assign org\n4. Save',expected:'Module created; redirected to module detail; success toast',priority:'Critical',type:'Positive'},
      {id:'MF-002',name:'Create module — title required blank fails',pre:'Create form',steps:'1. Leave title blank\n2. Save',expected:'Required field error on title',priority:'Critical',type:'Validation'},
      {id:'MF-003',name:'Create module — duplicate title within org rejected',pre:'Module "Intro to Finance" exists in org',steps:'1. Create another "Intro to Finance"\n2. Save',expected:'Error: "Module with this title already exists in this organisation"',priority:'High',type:'Validation'},
      {id:'MF-004',name:'Create module — title max 200 chars accepted',pre:'Create form',steps:'1. Enter 200-char title\n2. Save',expected:'Saved successfully',priority:'Low',type:'Boundary'},
      {id:'MF-005',name:'Create module — title 201 chars rejected',pre:'Create form',steps:'1. Enter 201-char title',expected:'Input capped or validation error',priority:'Low',type:'Boundary'},
      {id:'MF-006',name:'Add cover image to module',pre:'Create/edit module form',steps:'1. Upload valid image as cover\n2. Save',expected:'Cover image shown in module library card',priority:'Medium',type:'Positive'},
      {id:'MF-007',name:'Cover image — non-image file rejected',pre:'Edit module form',steps:'1. Upload .pdf as cover image',expected:'Error: image files only',priority:'Medium',type:'Validation'},
      {id:'MF-008',name:'Edit module title and description',pre:'Module edit page',steps:'1. Change title\n2. Change description\n3. Save',expected:'Updates reflected in library list and all courses using this module',priority:'High',type:'Positive'},
      {id:'MF-009',name:'Delete module not in use',pre:'Module with no course references',steps:'1. Click Delete\n2. Confirm',expected:'Module deleted',priority:'High',type:'Positive'},
      {id:'MF-010',name:'Delete module in use by courses — warns',pre:'Module used in 3 courses',steps:'1. Click Delete',expected:'Warning: "Used in 3 courses. Deleting will remove it from those courses."',priority:'High',type:'Negative'},
      {id:'MF-011',name:'Tag/categorize module for easier search',pre:'Edit module; Tags field',steps:'1. Add tags "finance, beginner, self-paced"\n2. Save',expected:'Tags saved; searchable via tag filter',priority:'Medium',type:'Positive'},
      {id:'MF-012',name:'Unsaved form changes prompt on navigation',pre:'Edit module; changed title unsaved',steps:'1. Click browser back or sidebar link',expected:'"Unsaved changes" confirmation dialog',priority:'Medium',type:'UI/UX'},
    ]
  },
  {
    code:'MDLA-LSNS',title:'Module Library — Lessons Within Module',cases:[
      {id:'MLS-001',name:'Add Video lesson to module',pre:'Module detail; Add Lesson button',steps:'1. Click Add Lesson\n2. Select Video type\n3. Enter title\n4. Upload or link video\n5. Save',expected:'Video lesson created; appears in module lesson list',priority:'Critical',type:'Positive'},
      {id:'MLS-002',name:'Add PDF lesson to module',pre:'Module detail',steps:'1. Add Lesson > PDF type\n2. Upload PDF\n3. Save',expected:'PDF lesson created in module',priority:'High',type:'Positive'},
      {id:'MLS-003',name:'Add Text/Article lesson to module',pre:'Module detail',steps:'1. Add Lesson > Text type\n2. Write content in rich editor\n3. Save',expected:'Text lesson created; rich text content saved',priority:'High',type:'Positive'},
      {id:'MLS-004',name:'Add Quiz lesson to module',pre:'Module detail',steps:'1. Add Lesson > Quiz type\n2. Add 3 MCQ questions with correct answers\n3. Set pass score 70%\n4. Save',expected:'Quiz lesson created with all questions and settings',priority:'Critical',type:'Positive'},
      {id:'MLS-005',name:'Add Audio lesson to module',pre:'Module detail',steps:'1. Add Lesson > Audio type\n2. Upload MP3\n3. Save',expected:'Audio lesson created with player',priority:'High',type:'Positive'},
      {id:'MLS-006',name:'Add Embed lesson to module',pre:'Module detail',steps:'1. Add Lesson > Embed type\n2. Enter YouTube URL\n3. Save',expected:'Embed lesson created; video renders in module',priority:'High',type:'Positive'},
      {id:'MLS-007',name:'Add SCORM lesson to module',pre:'Module detail',steps:'1. Add Lesson > SCORM type\n2. Upload SCORM zip\n3. Save',expected:'SCORM package lesson created and tracked',priority:'High',type:'Positive'},
      {id:'MLS-008',name:'Add Assignment lesson to module',pre:'Module detail',steps:'1. Add Lesson > Assignment type\n2. Enter instructions\n3. Set deadline\n4. Save',expected:'Assignment lesson created',priority:'High',type:'Positive'},
      {id:'MLS-009',name:'Reorder lessons in module via drag-and-drop',pre:'Module with multiple lessons',steps:'1. Drag lesson 3 to position 1\n2. Save order',expected:'Lesson order updated; courses using module reflect new order',priority:'High',type:'Positive'},
      {id:'MLS-010',name:'Reorder lessons via up/down arrows',pre:'Module with multiple lessons',steps:'1. Click Up arrow on lesson 3',expected:'Lesson moves up one position',priority:'Medium',type:'Positive'},
      {id:'MLS-011',name:'Edit existing lesson in module',pre:'Lesson in module',steps:'1. Click edit on lesson\n2. Change title\n3. Save',expected:'Lesson title updated; changes reflected wherever module is used',priority:'High',type:'Positive'},
      {id:'MLS-012',name:'Delete lesson from module with confirmation',pre:'Lesson in module',steps:'1. Click Delete on lesson\n2. Confirm',expected:'Lesson removed from module; course progress for this lesson reset or archived',priority:'High',type:'Positive'},
      {id:'MLS-013',name:'Lesson title required — blank fails',pre:'Add lesson form',steps:'1. Leave title blank\n2. Save',expected:'Required field error on title',priority:'High',type:'Validation'},
      {id:'MLS-014',name:'Lesson with no content (empty video, empty quiz) rejected',pre:'Add lesson form; quiz with no questions',steps:'1. Create quiz lesson with 0 questions\n2. Save',expected:'Error: "Quiz must have at least one question"',priority:'High',type:'Validation'},
      {id:'MLS-015',name:'Set lesson as required or optional',pre:'Lesson in module',steps:'1. Toggle "Required" on lesson\n2. Save',expected:'Lesson marked required; learners must complete it to progress to next',priority:'High',type:'Positive'},
      {id:'MLS-016',name:'Mark lesson as free preview',pre:'Lesson in module',steps:'1. Toggle "Free Preview" on lesson\n2. Save',expected:'Lesson accessible to non-enrolled users as preview sample',priority:'Medium',type:'Positive'},
      {id:'MLS-017',name:'Lesson count in module header accurate',pre:'Module with 7 lessons',steps:'1. View module detail header',expected:'"7 Lessons" count shown',priority:'Low',type:'Positive'},
    ]
  },
  {
    code:'MDLA-REUSE',title:'Module Library — Module Reuse & Versioning',cases:[
      {id:'MR-001',name:'Reuse module in a course via course curriculum builder',pre:'Module exists; editing course curriculum',steps:'1. Open course curriculum\n2. Click "Add from Module Library"\n3. Select module\n4. Confirm',expected:'Module\'s lessons inserted into course curriculum; linked to source module',priority:'Critical',type:'Positive'},
      {id:'MR-002',name:'Reuse same module in multiple courses',pre:'Module in library',steps:'1. Add module to Course A\n2. Add same module to Course B',expected:'Module used in both courses; reuse count incremented to 2',priority:'High',type:'Positive'},
      {id:'MR-003',name:'Update module — changes propagate to all courses using it',pre:'Module used in 3 courses; edit module title',steps:'1. Edit module title\n2. Save\n3. Check all 3 courses',expected:'All courses show updated module title',priority:'High',type:'Positive'},
      {id:'MR-004',name:'Update module lesson — prompt to sync or detach',pre:'Module lesson edited; courses use module',steps:'1. Edit lesson in module\n2. Save',expected:'Either auto-propagates or prompt: "Sync to all N courses or detach?"',priority:'High',type:'Positive'},
      {id:'MR-005',name:'Detach module copy in a course (make course-specific)',pre:'Course using module',steps:'1. Detach module from course\n2. Confirm',expected:'Course gets its own copy; changes to original module no longer affect this course',priority:'Medium',type:'Positive'},
      {id:'MR-006',name:'Reuse count displayed on module list',pre:'Module reused in 5 courses',steps:'1. View Module Library list',expected:'"Used in 5 courses" shown for that module',priority:'Medium',type:'Positive'},
      {id:'MR-007',name:'Delete module used in courses warns about impact',pre:'Module in use',steps:'1. Try to delete reused module',expected:'Warning lists all courses using it; requires confirmation',priority:'High',type:'Negative'},
      {id:'MR-008',name:'Org_admin cannot reuse another org\'s modules',pre:'Logged in as org_admin',steps:'1. Open Add from Module Library\n2. Check if other org modules visible',expected:'Only own org\'s modules listed; cross-org modules hidden',priority:'Critical',type:'Security'},
    ]
  },
];
