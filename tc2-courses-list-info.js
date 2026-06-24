// CRSE-LIST + CRSE-INFO — 70 cases
module.exports = [
  {
    code: 'CRSE-LIST',
    title: 'Courses — Listing & Management',
    cases: [
      // ── List Page ──────────────────────────────────────────────────────────
      { id:'CL-001', name:'Courses list loads with all courses visible', pre:'Logged in; courses exist', steps:'1. Click Courses in sidebar', expected:'List of courses showing title, thumbnail, status badge, instructor, learner count, category', priority:'Critical', type:'Positive' },
      { id:'CL-002', name:'Search by course title filters list', pre:'Multiple courses', steps:'1. Enter partial title in search box\n2. Observe', expected:'Only matching courses shown; non-matching hidden', priority:'High', type:'Positive' },
      { id:'CL-003', name:'Search is case-insensitive', pre:'Course titled "Budget Basics" exists', steps:'1. Type "budget basics" lowercase in search', expected:'Course still found', priority:'Medium', type:'Positive' },
      { id:'CL-004', name:'Search clears to show all courses', pre:'Search active', steps:'1. Clear search field', expected:'All courses displayed again', priority:'Medium', type:'Positive' },
      { id:'CL-005', name:'Filter by status: Draft', pre:'Draft and published courses exist', steps:'1. Select "Draft" from status filter', expected:'Only draft courses shown', priority:'High', type:'Positive' },
      { id:'CL-006', name:'Filter by status: Published', pre:'Mixed status courses', steps:'1. Select "Published" from status filter', expected:'Only published courses shown', priority:'High', type:'Positive' },
      { id:'CL-007', name:'Filter by status: Archived', pre:'Archived courses exist', steps:'1. Select "Archived" from status filter', expected:'Only archived courses shown', priority:'Medium', type:'Positive' },
      { id:'CL-008', name:'Filter by category', pre:'Courses in multiple categories', steps:'1. Select a category from filter dropdown', expected:'Only courses in that category listed', priority:'High', type:'Positive' },
      { id:'CL-009', name:'Combine title search and status filter', pre:'Many courses', steps:'1. Enter "Finance" in search AND select "Published" filter', expected:'Only published courses with "Finance" in title shown', priority:'Medium', type:'Positive' },
      { id:'CL-010', name:'Sort courses by newest first', pre:'Courses list', steps:'1. Select "Newest First" sort', expected:'Most recently created courses at top', priority:'Medium', type:'Positive' },
      { id:'CL-011', name:'Sort courses alphabetically A-Z', pre:'Courses list', steps:'1. Select "Title A-Z" sort', expected:'Courses in alphabetical order', priority:'Medium', type:'Positive' },
      { id:'CL-012', name:'Courses list pagination', pre:'More courses than page size', steps:'1. Click Next page\n2. Click Previous page', expected:'Different sets of courses shown per page; page indicator correct', priority:'Medium', type:'Positive' },
      { id:'CL-013', name:'Grid / List view toggle works', pre:'Courses list; toggle button visible', steps:'1. Click Grid view toggle\n2. Click List view toggle', expected:'Layout changes; data remains the same', priority:'Low', type:'UI/UX' },
      { id:'CL-014', name:'Empty state message when no courses exist', pre:'No courses created yet', steps:'1. Open Courses list', expected:'"No courses yet" or empty state with Create button shown', priority:'Medium', type:'Negative' },
      { id:'CL-015', name:'Search with no matches shows empty state', pre:'On courses list', steps:'1. Search for "ZZZNOMATCH999"', expected:'Empty state / "No results" message; no crash', priority:'Medium', type:'Negative' },

      // ── Bulk Operations ────────────────────────────────────────────────────
      { id:'CL-016', name:'Select all courses and bulk publish', pre:'Multiple draft courses; checkboxes available', steps:'1. Check select-all checkbox\n2. Choose "Publish" bulk action\n3. Confirm', expected:'All selected courses set to Published; success toast', priority:'High', type:'Positive' },
      { id:'CL-017', name:'Bulk archive selected courses', pre:'Select 3 published courses', steps:'1. Check 3 courses\n2. Select "Archive" bulk action\n3. Confirm', expected:'3 courses moved to Archived status', priority:'High', type:'Positive' },
      { id:'CL-018', name:'Bulk delete with confirmation', pre:'Select 2 draft courses', steps:'1. Check courses\n2. Select "Delete"\n3. Confirm dialog', expected:'Courses deleted; no longer in list', priority:'High', type:'Positive' },
      { id:'CL-019', name:'Bulk operation on zero selected items shows warning', pre:'No courses checked', steps:'1. Click a bulk action without selecting courses', expected:'Warning: "Please select at least one course"', priority:'Medium', type:'Validation' },
      { id:'CL-020', name:'Org_admin sees only their org\'s courses', pre:'Logged in as org_admin', steps:'1. Open Courses list', expected:'Only courses belonging to org_admin\'s organisation visible', priority:'Critical', type:'Security' },
      { id:'CL-021', name:'IDOR — cannot access another org\'s course via direct URL', pre:'Logged in as org_admin of Org A', steps:'1. Construct URL for a course belonging to Org B\n2. Navigate to it', expected:'403 Forbidden or redirect; course data from Org B not shown', priority:'Critical', type:'Security' },

      // ── Quick Actions ──────────────────────────────────────────────────────
      { id:'CL-022', name:'Duplicate course creates a copy as draft', pre:'Published course exists', steps:'1. Open course actions menu (three-dot or kebab)\n2. Click Duplicate', expected:'New course created: "[Original Title] (Copy)" in Draft status; all content copied', priority:'High', type:'Positive' },
      { id:'CL-023', name:'Quick publish from list changes status immediately', pre:'Draft course in list', steps:'1. Click Publish option from course action menu', expected:'Status badge changes to Published without opening course edit', priority:'Medium', type:'Positive' },
      { id:'CL-024', name:'Quick archive from list archives course', pre:'Published course in list', steps:'1. Click Archive from action menu', expected:'Course moves to Archived status; removed from default list unless filter applied', priority:'Medium', type:'Positive' },
      { id:'CL-025', name:'Delete course from list requires confirmation', pre:'Course in list', steps:'1. Click Delete from action menu\n2. Observe', expected:'Confirmation dialog appears before deletion', priority:'High', type:'UI/UX' },
    ]
  },
  {
    code: 'CRSE-INFO',
    title: 'Courses — Basic Info & Settings Tab',
    cases: [
      // ── Create Course ──────────────────────────────────────────────────────
      { id:'CI-001', name:'Create Course button opens creation flow', pre:'On Courses list', steps:'1. Click "Create Course" or "+ New"', expected:'Modal or page opens with course creation form', priority:'Critical', type:'Positive' },
      { id:'CI-002', name:'Create course with all required fields succeeds', pre:'Create course form', steps:'1. Enter title "Finance Fundamentals"\n2. Select category\n3. Set language\n4. Click Create/Save', expected:'Course created in Draft; redirected to course detail editor', priority:'Critical', type:'Positive' },
      { id:'CI-003', name:'Create course with blank title fails', pre:'Create course form', steps:'1. Leave title blank\n2. Click Create', expected:'Required field error on title', priority:'Critical', type:'Validation' },
      { id:'CI-004', name:'Create course title max length 255 chars accepted', pre:'Create course form', steps:'1. Enter exactly 255-character title\n2. Save', expected:'Created successfully', priority:'Medium', type:'Boundary' },
      { id:'CI-005', name:'Create course title 256 chars rejected', pre:'Create course form', steps:'1. Enter 256-character title\n2. Save', expected:'Validation error or input capped at max', priority:'Medium', type:'Boundary' },
      { id:'CI-006', name:'Create course without category — if required', pre:'Create form', steps:'1. Enter title only\n2. Do not select category\n3. Save', expected:'If category is required: validation error. If optional: course created without category.', priority:'Medium', type:'Validation' },

      // ── Basic Info Edit ────────────────────────────────────────────────────
      { id:'CI-007', name:'Edit course title on Basic Info tab', pre:'On course Basic Info tab', steps:'1. Change title to "Updated Title"\n2. Click Save', expected:'Title updated; shown in page header and list', priority:'High', type:'Positive' },
      { id:'CI-008', name:'Short description field accepts text up to max length', pre:'Basic Info tab', steps:'1. Enter 200-character short description\n2. Save', expected:'Saved; description visible on course card/list', priority:'Medium', type:'Boundary' },
      { id:'CI-009', name:'Long description rich text editor renders correctly', pre:'Basic Info tab', steps:'1. Click inside long description field\n2. Observe toolbar', expected:'Rich text toolbar appears with Bold, Italic, Lists, Link, Image insertion options', priority:'High', type:'UI/UX' },
      { id:'CI-010', name:'Long description accepts rich text formatting', pre:'Long description field active', steps:'1. Type text\n2. Apply Bold\n3. Add a bulleted list\n4. Save', expected:'Formatting saved; preview shows bold text and bullets', priority:'High', type:'Positive' },
      { id:'CI-011', name:'XSS in long description sanitized on save', pre:'Long description field', steps:'1. Enter "<script>alert(\'xss\')</script>" in description\n2. Save\n3. View description', expected:'Script tag stripped or encoded; no alert fires', priority:'Critical', type:'Security' },
      { id:'CI-012', name:'Thumbnail upload — valid JPG shows preview', pre:'Basic Info tab', steps:'1. Click thumbnail upload area\n2. Select valid 800×450 JPG < 2MB\n3. Observe', expected:'Thumbnail previewed immediately; save updates course card', priority:'High', type:'Positive' },
      { id:'CI-013', name:'Thumbnail upload — PNG accepted', pre:'Basic Info tab', steps:'1. Upload valid PNG thumbnail', expected:'PNG accepted and displayed', priority:'High', type:'Positive' },
      { id:'CI-014', name:'Thumbnail upload — file over size limit rejected', pre:'Basic Info tab', steps:'1. Upload 10MB image', expected:'Error: file exceeds size limit (e.g., 2MB); no upload', priority:'High', type:'Validation' },
      { id:'CI-015', name:'Thumbnail upload — non-image file (PDF) rejected', pre:'Basic Info tab', steps:'1. Upload a PDF as thumbnail', expected:'Error: only image files accepted', priority:'High', type:'Validation' },
      { id:'CI-016', name:'Preview video / trailer — upload or embed URL', pre:'Basic Info tab', steps:'1. Add a YouTube URL or upload video file as preview\n2. Save', expected:'Preview video associated; plays on course detail public page', priority:'Medium', type:'Positive' },
      { id:'CI-017', name:'Category dropdown shows all available categories', pre:'Categories exist in system', steps:'1. Click Category dropdown', expected:'All configured categories listed; searchable if many', priority:'High', type:'Positive' },
      { id:'CI-018', name:'Tags field allows multiple tags', pre:'Tags exist in system', steps:'1. Click Tags field\n2. Select or type multiple tags\n3. Save', expected:'Multiple tags associated to course', priority:'Medium', type:'Positive' },
      { id:'CI-019', name:'Language dropdown shows available languages', pre:'Basic Info tab', steps:'1. Click Language dropdown', expected:'Language options visible (English, French, Spanish, etc.)', priority:'Medium', type:'Positive' },
      { id:'CI-020', name:'Level selector shows Beginner, Intermediate, Advanced', pre:'Basic Info tab', steps:'1. Click Level dropdown', expected:'Three levels shown; selection saves correctly', priority:'Medium', type:'Positive' },
      { id:'CI-021', name:'Featured toggle turns on and off', pre:'Basic Info tab', steps:'1. Toggle "Featured" switch on\n2. Save\n3. Toggle off\n4. Save', expected:'Featured state saved correctly each time', priority:'Medium', type:'Positive' },
      { id:'CI-022', name:'Certificate enabled toggle works', pre:'Basic Info tab', steps:'1. Toggle "Certificate" switch\n2. Save', expected:'Certificate setting saved; learner receives certificate on completion if enabled', priority:'High', type:'Positive' },
      { id:'CI-023', name:'Unsaved changes prompt when navigating away', pre:'Edited some fields but not saved', steps:'1. Change title\n2. Click another sidebar link without saving', expected:'"You have unsaved changes" dialog with Leave/Stay options', priority:'High', type:'UI/UX' },
      { id:'CI-024', name:'Leave without saving discards changes', pre:'Unsaved changes warning shown', steps:'1. Click Leave', expected:'Navigation proceeds; changes NOT saved; original data intact', priority:'High', type:'Positive' },
      { id:'CI-025', name:'Stay and save keeps user on page with changes', pre:'Unsaved changes warning shown', steps:'1. Click Stay', expected:'Dialog dismissed; user remains on page to save changes', priority:'High', type:'Positive' },

      // ── Publishing ─────────────────────────────────────────────────────────
      { id:'CI-026', name:'Publish course changes status from Draft to Published', pre:'Course in Draft; all required fields filled', steps:'1. Click "Publish" button\n2. Confirm if dialog shown', expected:'Status changes to Published; success toast shown', priority:'Critical', type:'Positive' },
      { id:'CI-027', name:'Publish course with missing required fields fails', pre:'Course missing required info', steps:'1. Click Publish\n2. Observe validation', expected:'Validation error listing what must be filled before publishing', priority:'High', type:'Validation' },
      { id:'CI-028', name:'Unpublish published course reverts to Draft', pre:'Published course', steps:'1. Click "Unpublish" or change status\n2. Confirm', expected:'Status reverts to Draft; course no longer visible to learners', priority:'High', type:'Positive' },
      { id:'CI-029', name:'Archive course moves it to Archived status', pre:'Published or draft course', steps:'1. Click Archive action\n2. Confirm', expected:'Course archived; removed from default list; learners still have access per policy', priority:'Medium', type:'Positive' },
      { id:'CI-030', name:'Delete course with active learners warns user', pre:'Course with enrolled learners', steps:'1. Click Delete course\n2. Observe warning', expected:'Warning: "This course has N active learners. Deleting will remove their progress. Continue?"', priority:'Critical', type:'UI/UX' },
      { id:'CI-031', name:'Delete course confirmed removes it permanently', pre:'Delete confirmation shown', steps:'1. Confirm deletion', expected:'Course deleted; no longer in list or accessible; learner progress data removed', priority:'Critical', type:'Positive' },
      { id:'CI-032', name:'Instructor cannot publish a course (if restricted)', pre:'Logged in as instructor', steps:'1. Open a course assigned to them\n2. Look for Publish button', expected:'Publish button hidden or requires admin approval; instructor can only save draft', priority:'High', type:'Security' },
    ]
  }
];
