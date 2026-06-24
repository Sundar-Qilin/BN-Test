// MLIB + MDLA + INST + BNDL + PATH — 185 cases
module.exports = [
  {
    code: 'MLIB',
    title: 'Media Library',
    cases: [
      // ── Upload ─────────────────────────────────────────────────────────────
      { id:'ML-001', name:'Upload video file (MP4) to media library', pre:'Logged in; on Media Library', steps:'1. Click Upload button\n2. Select valid MP4 < 500MB\n3. Confirm upload', expected:'Upload progress shown; file appears in library after completion', priority:'Critical', type:'Positive' },
      { id:'ML-002', name:'Upload image (JPG, PNG, WebP, SVG)', pre:'Media Library', steps:'1. Upload valid image files of each type', expected:'All image types accepted and previewed with thumbnail', priority:'High', type:'Positive' },
      { id:'ML-003', name:'Upload PDF document', pre:'Media Library', steps:'1. Upload valid PDF\n2. Confirm', expected:'PDF added with PDF icon; can be selected for use in courses', priority:'High', type:'Positive' },
      { id:'ML-004', name:'Upload audio file (MP3, WAV, M4A)', pre:'Media Library', steps:'1. Upload each audio format', expected:'Audio files accepted; shown with audio player icon', priority:'High', type:'Positive' },
      { id:'ML-005', name:'Upload multiple files simultaneously', pre:'Media Library', steps:'1. Click Upload\n2. Select 5 files at once\n3. Upload', expected:'All 5 files upload concurrently; progress shown for each', priority:'High', type:'Positive' },
      { id:'ML-006', name:'Drag and drop file upload', pre:'Media Library', steps:'1. Drag file from file explorer onto upload zone\n2. Drop', expected:'File uploads via drag-and-drop as normal upload', priority:'Medium', type:'Positive' },
      { id:'ML-007', name:'Upload file exceeding size limit rejected', pre:'Media Library', steps:'1. Attempt to upload 2GB video file', expected:'Error: "File exceeds maximum size limit of X"', priority:'High', type:'Validation' },
      { id:'ML-008', name:'Upload disallowed file type (.exe) rejected', pre:'Media Library', steps:'1. Try to upload .exe or .sh file', expected:'Error: "File type not allowed"', priority:'Critical', type:'Security' },
      { id:'ML-009', name:'Upload PHP file disguised as image rejected', pre:'Media Library', steps:'1. Rename test.php to test.jpg\n2. Attempt upload', expected:'File type verified by content, not extension; PHP rejected', priority:'Critical', type:'Security' },
      { id:'ML-010', name:'Upload SVG with embedded XSS rejected or sanitized', pre:'Media Library', steps:'1. Upload SVG containing <script>alert(1)</script>\n2. Observe after upload', expected:'SVG script removed or file rejected entirely', priority:'Critical', type:'Security' },
      { id:'ML-011', name:'Upload shows progress bar', pre:'Large file uploading', steps:'1. Upload a 50MB video\n2. Observe progress', expected:'Progress bar or percentage shown during upload', priority:'Medium', type:'UI/UX' },
      { id:'ML-012', name:'Upload cancelled mid-way removes partial file', pre:'Upload in progress', steps:'1. Start large upload\n2. Click Cancel during upload', expected:'Upload cancelled; partial file not stored; no ghost entry in library', priority:'Medium', type:'Positive' },
      { id:'ML-013', name:'Storage usage indicator updates after upload', pre:'Media Library with storage meter', steps:'1. Note current storage used\n2. Upload 100MB file\n3. Check storage indicator', expected:'Storage usage increases by approx 100MB', priority:'Medium', type:'Positive' },
      { id:'ML-014', name:'Upload rejected when storage limit reached', pre:'Storage at 99% capacity', steps:'1. Attempt to upload file larger than remaining storage', expected:'Error: "Storage limit reached; delete files or upgrade plan"', priority:'High', type:'Boundary' },

      // ── Browse & Search ────────────────────────────────────────────────────
      { id:'ML-015', name:'Media library shows all uploaded files with name and type', pre:'Files uploaded', steps:'1. Open Media Library\n2. Observe grid/list', expected:'All files shown with thumbnail (image) or icon (video/PDF/audio), filename, size, type', priority:'High', type:'Positive' },
      { id:'ML-016', name:'Filter by file type — Images only', pre:'Mixed file types', steps:'1. Select "Images" from type filter', expected:'Only image files shown', priority:'High', type:'Positive' },
      { id:'ML-017', name:'Filter by file type — Videos only', pre:'Mixed file types', steps:'1. Select "Videos" from type filter', expected:'Only video files shown', priority:'High', type:'Positive' },
      { id:'ML-018', name:'Filter by file type — Documents (PDF)', pre:'Mixed file types', steps:'1. Select "Documents" filter', expected:'Only PDF/document files shown', priority:'Medium', type:'Positive' },
      { id:'ML-019', name:'Search by filename', pre:'Files with known names', steps:'1. Type partial filename in search\n2. Observe', expected:'Only matching files shown', priority:'High', type:'Positive' },
      { id:'ML-020', name:'Sort by date uploaded (newest first)', pre:'Media Library', steps:'1. Select "Newest" sort option', expected:'Most recently uploaded files at top', priority:'Medium', type:'Positive' },
      { id:'ML-021', name:'Sort by filename alphabetically', pre:'Media Library', steps:'1. Select "Name A-Z" sort', expected:'Files in alphabetical order by name', priority:'Medium', type:'Positive' },
      { id:'ML-022', name:'Sort by file size', pre:'Media Library', steps:'1. Select "Size" sort', expected:'Files sorted by size ascending or descending', priority:'Low', type:'Positive' },
      { id:'ML-023', name:'Grid view shows image thumbnails', pre:'Images uploaded', steps:'1. Select Grid view', expected:'Images show visual thumbnails; videos/docs show styled icons', priority:'Medium', type:'UI/UX' },
      { id:'ML-024', name:'List view shows file details in table', pre:'Media Library', steps:'1. Select List view', expected:'Table with columns: filename, type, size, uploaded date, actions', priority:'Medium', type:'UI/UX' },

      // ── Folders ────────────────────────────────────────────────────────────
      { id:'ML-025', name:'Create new folder', pre:'Media Library', steps:'1. Click "New Folder" or "+ Folder"\n2. Enter name "Course Thumbnails"\n3. Confirm', expected:'Folder created and visible in library', priority:'High', type:'Positive' },
      { id:'ML-026', name:'Create folder with blank name fails', pre:'New folder dialog', steps:'1. Leave name blank\n2. Confirm', expected:'Validation error: folder name required', priority:'Medium', type:'Validation' },
      { id:'ML-027', name:'Create nested subfolder', pre:'Folder exists', steps:'1. Open parent folder\n2. Create subfolder inside it', expected:'Subfolder created within parent folder', priority:'Medium', type:'Positive' },
      { id:'ML-028', name:'Move file to folder via drag or move action', pre:'File in root; folder exists', steps:'1. Select file\n2. Choose "Move to Folder"\n3. Select target folder', expected:'File moved to folder; no longer in root', priority:'High', type:'Positive' },
      { id:'ML-029', name:'Move file to root (out of folder)', pre:'File in a folder', steps:'1. Move file back to root level', expected:'File appears in root; removed from folder', priority:'Medium', type:'Positive' },
      { id:'ML-030', name:'Delete empty folder', pre:'Empty folder exists', steps:'1. Click delete on empty folder\n2. Confirm', expected:'Folder deleted', priority:'Medium', type:'Positive' },
      { id:'ML-031', name:'Delete folder with files warns about file loss', pre:'Folder has 3 files', steps:'1. Click delete on folder\n2. Observe warning', expected:'Warning: "Folder contains 3 files; deleting will also delete these files."', priority:'High', type:'UI/UX' },
      { id:'ML-032', name:'Rename folder', pre:'Folder exists', steps:'1. Click rename on folder\n2. Enter new name\n3. Save', expected:'Folder name updated', priority:'Medium', type:'Positive' },

      // ── File Operations ────────────────────────────────────────────────────
      { id:'ML-033', name:'Preview image file in modal/lightbox', pre:'Image in library', steps:'1. Click image thumbnail', expected:'Image opens in preview modal at full size', priority:'High', type:'UI/UX' },
      { id:'ML-034', name:'Preview video file plays in player', pre:'Video in library', steps:'1. Click video entry\n2. Observe', expected:'Video player opens with play controls', priority:'High', type:'Positive' },
      { id:'ML-035', name:'Preview PDF in browser viewer', pre:'PDF in library', steps:'1. Click PDF entry', expected:'PDF opens in browser PDF viewer or preview pane', priority:'Medium', type:'Positive' },
      { id:'ML-036', name:'Copy file URL to clipboard', pre:'File in library', steps:'1. Click "Copy URL" or link icon on a file', expected:'File URL copied to clipboard; toast confirmation shown', priority:'Medium', type:'Positive' },
      { id:'ML-037', name:'Copied URL is the CDN/public URL, not internal path', pre:'File URL copied', steps:'1. Inspect copied URL\n2. Paste in new browser tab', expected:'URL points to CDN or storage endpoint; file loads; no internal server paths exposed', priority:'Critical', type:'Security' },
      { id:'ML-038', name:'Rename file', pre:'File in library', steps:'1. Click rename option on file\n2. Enter new name\n3. Save', expected:'Filename updated in library', priority:'Medium', type:'Positive' },
      { id:'ML-039', name:'Rename file to empty name fails', pre:'Rename dialog', steps:'1. Clear filename\n2. Save', expected:'Validation error: filename required', priority:'Medium', type:'Validation' },
      { id:'ML-040', name:'Edit image alt text (accessibility)', pre:'Image in library', steps:'1. Open file details\n2. Edit "Alt Text" field\n3. Save', expected:'Alt text saved; used when image embedded in course content', priority:'Medium', type:'Positive' },
      { id:'ML-041', name:'Delete file with confirmation', pre:'File in library', steps:'1. Click delete on file\n2. Confirm dialog', expected:'File deleted from library and storage', priority:'High', type:'Positive' },
      { id:'ML-042', name:'Delete file in use (attached to lesson) warns', pre:'File used in a lesson', steps:'1. Try to delete file used in active course\n2. Observe', expected:'Warning: "This file is used in X lesson(s). Deleting will remove it from those lessons."', priority:'High', type:'Negative' },
      { id:'ML-043', name:'Bulk delete selected files', pre:'Multiple files selected', steps:'1. Check 3 files\n2. Choose Bulk Delete\n3. Confirm', expected:'All 3 files deleted', priority:'Medium', type:'Positive' },
      { id:'ML-044', name:'Replace file with new version', pre:'File in library', steps:'1. Click "Replace" or "Update file" option\n2. Upload new version\n3. Confirm', expected:'Old file replaced; URL preserved (CDN key same); existing references updated', priority:'Medium', type:'Positive' },

      // ── Security & Access ──────────────────────────────────────────────────
      { id:'ML-045', name:'Org_admin only sees their org\'s media', pre:'Logged in as org_admin', steps:'1. Open Media Library', expected:'Only files uploaded by users in their org visible', priority:'Critical', type:'Security' },
      { id:'ML-046', name:'Unauthenticated request to media API returns 401', pre:'No auth token', steps:'1. Call GET /api/v1/admin/media/ without token', expected:'401 Unauthorized', priority:'Critical', type:'Security' },
      { id:'ML-047', name:'Media URLs for private files require authentication or signed URL', pre:'File uploaded as private', steps:'1. Copy file URL\n2. Open in incognito/anonymous browser', expected:'File not accessible without auth; either 403 or signed URL required', priority:'Critical', type:'Security' },
    ]
  },
  {
    code: 'MDLA',
    title: 'Module Library (Reusable Modules)',
    cases: [
      // ── List ───────────────────────────────────────────────────────────────
      { id:'MD-001', name:'Module Library list loads with all modules', pre:'Logged in; modules exist', steps:'1. Click Module Library in sidebar', expected:'List of reusable modules with title, type, lesson count, category, tags, last modified', priority:'Critical', type:'Positive' },
      { id:'MD-002', name:'Filter modules by lesson type', pre:'Modules of multiple types', steps:'1. Select "Video" from lesson type filter', expected:'Only modules containing video lessons shown', priority:'High', type:'Positive' },
      { id:'MD-003', name:'Filter by module type', pre:'Multiple module types', steps:'1. Select module type from filter', expected:'Only matching modules shown', priority:'High', type:'Positive' },
      { id:'MD-004', name:'Search modules by title', pre:'Multiple modules', steps:'1. Type partial title in search', expected:'Matching modules shown', priority:'High', type:'Positive' },
      { id:'MD-005', name:'Filter by category', pre:'Modules in categories', steps:'1. Select category from filter', expected:'Category-filtered modules shown', priority:'Medium', type:'Positive' },
      { id:'MD-006', name:'Filter by tags', pre:'Modules with tags', steps:'1. Select tag from filter', expected:'Only modules with that tag shown', priority:'Medium', type:'Positive' },
      { id:'MD-007', name:'Module list shows archived count separately', pre:'Module Library with archive button', steps:'1. Observe archive count badge or filter', expected:'Archived module count shown; click shows archived modules', priority:'Low', type:'UI/UX' },

      // ── Create Module ──────────────────────────────────────────────────────
      { id:'MD-008', name:'Create new module with title and type', pre:'Module Library; click Create', steps:'1. Enter title "Communication Skills"\n2. Select module type\n3. Select category\n4. Add tags\n5. Save', expected:'Module created; appears in library list', priority:'Critical', type:'Positive' },
      { id:'MD-009', name:'Create module with blank title fails', pre:'Create module form', steps:'1. Leave title blank\n2. Save', expected:'Required field error', priority:'High', type:'Validation' },
      { id:'MD-010', name:'Add lessons to module (all types supported)', pre:'Module created; lesson editor open', steps:'1. Add video lesson\n2. Add PDF lesson\n3. Add quiz lesson\n4. Save each', expected:'All three lesson types added to module', priority:'High', type:'Positive' },
      { id:'MD-011', name:'Module inherits lesson ordering from creation sequence', pre:'Module with 3 lessons', steps:'1. Add lessons in specific order\n2. View module', expected:'Lessons appear in creation order; reorderable', priority:'Medium', type:'Positive' },
      { id:'MD-012', name:'Reorder lessons within module via drag', pre:'Multiple lessons in module', steps:'1. Drag lesson to new position\n2. Save', expected:'Order saved; persists on reload', priority:'High', type:'Positive' },

      // ── Reuse in Courses ───────────────────────────────────────────────────
      { id:'MD-013', name:'Add module to course curriculum', pre:'Module exists; inside course curriculum editor', steps:'1. Click "Add from Module Library"\n2. Search for module\n3. Select and confirm', expected:'Module\'s lessons copied into course section', priority:'Critical', type:'Positive' },
      { id:'MD-014', name:'Module used in course does not link back (copy, not reference)', pre:'Module added to course', steps:'1. Edit module in library after adding to course\n2. Check course curriculum', expected:'Course curriculum unchanged; module was copied, not live-linked', priority:'High', type:'Positive' },
      { id:'MD-015', name:'Module search inside course curriculum editor works', pre:'Curriculum editor; Add from library modal', steps:'1. Type module name in search\n2. Observe results', expected:'Matching modules shown with preview of lesson count and type', priority:'High', type:'Positive' },
      { id:'MD-016', name:'Module added to multiple courses independently', pre:'Module exists', steps:'1. Add module to Course A\n2. Add same module to Course B', expected:'Both courses get copy of module; each independent', priority:'High', type:'Positive' },

      // ── Edit & Delete ──────────────────────────────────────────────────────
      { id:'MD-017', name:'Edit module title and metadata', pre:'Module detail open', steps:'1. Change title\n2. Change category\n3. Add new tag\n4. Save', expected:'All changes saved', priority:'High', type:'Positive' },
      { id:'MD-018', name:'Add lesson to existing module', pre:'Module exists with 2 lessons', steps:'1. Open module\n2. Add 3rd lesson\n3. Save', expected:'3rd lesson appears in module', priority:'High', type:'Positive' },
      { id:'MD-019', name:'Delete lesson from module', pre:'Module with lessons', steps:'1. Click delete on a lesson\n2. Confirm', expected:'Lesson removed from module only; not from courses it was already copied to', priority:'High', type:'Positive' },
      { id:'MD-020', name:'Archive module removes it from active list', pre:'Module exists', steps:'1. Click Archive on module\n2. Confirm', expected:'Module moves to archived state; hidden from default list', priority:'Medium', type:'Positive' },
      { id:'MD-021', name:'Restore archived module', pre:'Archived module', steps:'1. View archived modules\n2. Click Restore', expected:'Module returns to active state', priority:'Medium', type:'Positive' },
      { id:'MD-022', name:'Delete module with confirmation', pre:'Module not used in any course', steps:'1. Click Delete\n2. Confirm', expected:'Module and its lessons deleted from library', priority:'High', type:'Positive' },
      { id:'MD-023', name:'IDOR — cannot view another org\'s module via API', pre:'Logged in as org_admin', steps:'1. Call GET /api/.../module-library/{id}/ for another org\'s module', expected:'403 Forbidden; no cross-org module data', priority:'Critical', type:'Security' },
    ]
  },
  {
    code: 'INST',
    title: 'Instructors',
    cases: [
      // ── List ───────────────────────────────────────────────────────────────
      { id:'IN-001', name:'Instructors list loads with all instructor profiles', pre:'Logged in; instructors exist', steps:'1. Click Instructors in sidebar', expected:'Grid or list of instructors with photo, name, bio excerpt, assigned course count', priority:'Critical', type:'Positive' },
      { id:'IN-002', name:'Search instructors by name', pre:'Multiple instructors', steps:'1. Enter partial name in search', expected:'Matching instructors shown', priority:'High', type:'Positive' },
      { id:'IN-003', name:'Filter instructors by organisation', pre:'Instructors in multiple orgs', steps:'1. Select org from filter', expected:'Only that org\'s instructors shown', priority:'High', type:'Positive' },
      { id:'IN-004', name:'Instructor list empty state', pre:'No instructors created', steps:'1. Open Instructors page', expected:'Empty state with "Create Instructor" prompt', priority:'Low', type:'Negative' },

      // ── Create Instructor ──────────────────────────────────────────────────
      { id:'IN-005', name:'Create instructor from existing user account', pre:'User with instructor role exists', steps:'1. Click Create Instructor\n2. Search existing user\n3. Complete profile form\n4. Save', expected:'Instructor profile created; linked to user account', priority:'Critical', type:'Positive' },
      { id:'IN-006', name:'Create instructor profile — fill all fields', pre:'Create instructor form', steps:'1. Enter first name, last name\n2. Upload profile photo\n3. Enter bio (rich text)\n4. Enter title (e.g., "Senior Financial Advisor")\n5. Add social links (LinkedIn, Twitter)\n6. Add credentials/qualifications\n7. Save', expected:'Complete instructor profile saved', priority:'High', type:'Positive' },
      { id:'IN-007', name:'Create instructor with blank first name fails', pre:'Create form', steps:'1. Leave first name blank\n2. Save', expected:'Required field error on first name', priority:'High', type:'Validation' },
      { id:'IN-008', name:'Instructor profile photo — valid image accepted', pre:'Create instructor form', steps:'1. Upload 200KB square JPG as profile photo', expected:'Photo uploaded and previewed in circular avatar', priority:'High', type:'Positive' },
      { id:'IN-009', name:'Instructor profile photo — oversized file rejected', pre:'Create form', steps:'1. Upload 5MB photo', expected:'Size limit error', priority:'Medium', type:'Validation' },
      { id:'IN-010', name:'Instructor bio supports rich text (bold, links)', pre:'Create form; bio field', steps:'1. Add bold text and a hyperlink in bio\n2. Save', expected:'Formatting preserved in profile display', priority:'Medium', type:'Positive' },
      { id:'IN-011', name:'XSS in instructor bio sanitized', pre:'Create form', steps:'1. Enter "<script>alert(1)</script>" in bio\n2. Save\n3. View profile', expected:'Script stripped; no alert fired', priority:'Critical', type:'Security' },
      { id:'IN-012', name:'Social link validation — invalid URL format rejected', pre:'Create form; social links', steps:'1. Enter "not-a-url" in LinkedIn field\n2. Save', expected:'Validation error: invalid URL', priority:'Medium', type:'Validation' },
      { id:'IN-013', name:'Credentials field — add qualification "MBA Finance"', pre:'Create form', steps:'1. Add credential entry\n2. Enter "MBA Finance, Harvard Business School"\n3. Save', expected:'Credential shown on public instructor profile', priority:'Medium', type:'Positive' },

      // ── Edit & Assign ──────────────────────────────────────────────────────
      { id:'IN-014', name:'Edit instructor profile updates display', pre:'Instructor profile exists', steps:'1. Click Edit on instructor\n2. Change title\n3. Save', expected:'Updated title shown on profile and course instructor cards', priority:'High', type:'Positive' },
      { id:'IN-015', name:'Assign instructor to course from instructor profile', pre:'Instructor profile; courses exist', steps:'1. Open instructor profile\n2. Find "Assigned Courses" section\n3. Click "Assign Course"\n4. Select course\n5. Save', expected:'Course appears under instructor\'s assigned courses', priority:'High', type:'Positive' },
      { id:'IN-016', name:'Unassign course from instructor', pre:'Instructor has course assigned', steps:'1. Open assigned courses\n2. Remove a course\n3. Save', expected:'Course removed from instructor profile; instructor no longer listed on that course', priority:'High', type:'Positive' },
      { id:'IN-017', name:'Instructor view shows their own courses only', pre:'Logged in as instructor', steps:'1. View Instructors section (if accessible)\n2. Check which courses shown', expected:'Instructor sees only courses assigned to them', priority:'Critical', type:'Security' },
      { id:'IN-018', name:'Delete instructor profile with confirmation', pre:'Instructor profile exists', steps:'1. Click Delete\n2. Confirm', expected:'Profile deleted; user account unaffected; instructor removed from course listings', priority:'High', type:'Positive' },
      { id:'IN-019', name:'Delete instructor assigned to active course — warn', pre:'Instructor assigned to published course', steps:'1. Attempt to delete instructor\n2. Observe warning', expected:'Warning: "Instructor is assigned to X active course(s). Deleting will remove them."', priority:'High', type:'UI/UX' },
      { id:'IN-020', name:'IDOR — org_admin cannot view another org\'s instructor via API', pre:'Logged in as org_admin', steps:'1. Call GET /api/.../instructors/{other-org-instructor-id}/', expected:'403 Forbidden', priority:'Critical', type:'Security' },
    ]
  },
  {
    code: 'BNDL',
    title: 'Bundles',
    cases: [
      // ── List ───────────────────────────────────────────────────────────────
      { id:'BN-001', name:'Bundles list loads all bundles', pre:'Logged in; bundles exist', steps:'1. Click Bundles in sidebar', expected:'List of bundles with name, thumbnail, courses count, price, status', priority:'Critical', type:'Positive' },
      { id:'BN-002', name:'Search bundles by name', pre:'Multiple bundles', steps:'1. Enter partial name in search', expected:'Matching bundles shown', priority:'High', type:'Positive' },
      { id:'BN-003', name:'Filter bundles by status (Draft/Published)', pre:'Mixed status bundles', steps:'1. Select "Published" filter', expected:'Only published bundles shown', priority:'High', type:'Positive' },

      // ── Create Bundle ──────────────────────────────────────────────────────
      { id:'BN-004', name:'Create bundle with title, description, thumbnail', pre:'Bundles list; click Create', steps:'1. Enter title "Complete Finance Bundle"\n2. Enter description\n3. Upload thumbnail\n4. Save', expected:'Bundle created in Draft; appears in list', priority:'Critical', type:'Positive' },
      { id:'BN-005', name:'Create bundle with blank title fails', pre:'Create form', steps:'1. Leave title blank\n2. Save', expected:'Required field error', priority:'High', type:'Validation' },
      { id:'BN-006', name:'Add courses to bundle', pre:'Bundle detail; published courses exist', steps:'1. Click "Add Courses"\n2. Search and select 3 courses\n3. Confirm\n4. Save', expected:'3 courses listed in bundle; total price calculated if applicable', priority:'Critical', type:'Positive' },
      { id:'BN-007', name:'Add same course to bundle twice is prevented', pre:'Bundle with Course A', steps:'1. Try to add Course A again', expected:'Error: "Course already in this bundle"', priority:'Medium', type:'Validation' },
      { id:'BN-008', name:'Remove course from bundle', pre:'Bundle with courses', steps:'1. Click remove on a course in bundle\n2. Confirm', expected:'Course removed; bundle updated', priority:'High', type:'Positive' },
      { id:'BN-009', name:'Bundle with zero courses cannot be published', pre:'Bundle with no courses', steps:'1. Click Publish', expected:'Validation error: "Bundle must contain at least one course"', priority:'High', type:'Validation' },
      { id:'BN-010', name:'Bundle price set (fixed price)', pre:'Bundle settings', steps:'1. Enter bundle price $49.99\n2. Save', expected:'Bundle priced at $49.99; individual course prices overridden', priority:'High', type:'Positive' },
      { id:'BN-011', name:'Bundle price validation — negative price rejected', pre:'Bundle settings', steps:'1. Enter price -10\n2. Save', expected:'Validation error: price must be non-negative', priority:'High', type:'Validation' },
      { id:'BN-012', name:'Bundle price validation — non-numeric rejected', pre:'Bundle settings', steps:'1. Enter "abc" as price\n2. Save', expected:'Validation error: numeric value required', priority:'Medium', type:'Validation' },
      { id:'BN-013', name:'Bundle enrollment type: open vs paid', pre:'Bundle settings', steps:'1. Set enrollment to Open\n2. Save\n3. Change to Paid\n4. Save', expected:'Each change saved; paid requires product association', priority:'High', type:'Positive' },
      { id:'BN-014', name:'Publish bundle changes status', pre:'Bundle with courses; all valid', steps:'1. Click Publish\n2. Confirm', expected:'Status changes to Published; bundle visible to learners', priority:'Critical', type:'Positive' },
      { id:'BN-015', name:'Unpublish bundle reverts to draft', pre:'Published bundle', steps:'1. Click Unpublish\n2. Confirm', expected:'Bundle returns to Draft; learners cannot access', priority:'High', type:'Positive' },
      { id:'BN-016', name:'Duplicate bundle creates copy as draft', pre:'Published bundle', steps:'1. Click Duplicate from action menu', expected:'New bundle "[Name] (Copy)" in Draft with same courses', priority:'Medium', type:'Positive' },
      { id:'BN-017', name:'Delete bundle with confirmation', pre:'Bundle exists', steps:'1. Click Delete\n2. Confirm', expected:'Bundle deleted; individual courses remain intact', priority:'High', type:'Positive' },
      { id:'BN-018', name:'Bundle thumbnail upload — image only, size limit enforced', pre:'Create/edit bundle', steps:'1. Upload 10MB image as thumbnail', expected:'Size limit error', priority:'Medium', type:'Validation' },
      { id:'BN-019', name:'IDOR — org_admin cannot access another org\'s bundle', pre:'Logged in as org_admin', steps:'1. Try to access bundle from another org via URL or API', expected:'403 Forbidden', priority:'Critical', type:'Security' },
      { id:'BN-020', name:'Bundle reorder courses inside the bundle', pre:'Bundle with multiple courses', steps:'1. Drag to reorder courses in bundle\n2. Save', expected:'Order persists; learner sees courses in new order', priority:'Medium', type:'Positive' },
    ]
  },
  {
    code: 'PATH',
    title: 'Pathways (Learning Paths)',
    cases: [
      // ── List ───────────────────────────────────────────────────────────────
      { id:'PT-001', name:'Pathways list loads all pathways', pre:'Logged in; pathways exist', steps:'1. Click Pathways in sidebar', expected:'List with pathway name, description, course count, status, duration estimate', priority:'Critical', type:'Positive' },
      { id:'PT-002', name:'Search pathway by name', pre:'Multiple pathways', steps:'1. Search partial name', expected:'Matching pathways shown', priority:'High', type:'Positive' },
      { id:'PT-003', name:'Filter pathways by status', pre:'Draft and published pathways', steps:'1. Select Published filter', expected:'Only published pathways shown', priority:'High', type:'Positive' },

      // ── Create & Configure ─────────────────────────────────────────────────
      { id:'PT-004', name:'Create pathway with title and description', pre:'Pathways list', steps:'1. Click Create Pathway\n2. Enter title and description\n3. Save', expected:'Pathway created in Draft; appears in list', priority:'Critical', type:'Positive' },
      { id:'PT-005', name:'Create pathway with blank title fails', pre:'Create form', steps:'1. Leave title blank\n2. Save', expected:'Required field error', priority:'High', type:'Validation' },
      { id:'PT-006', name:'Add courses to pathway in sequence', pre:'Pathway detail; courses exist', steps:'1. Click "Add Course"\n2. Select Course 1\n3. Add Course 2\n4. Add Course 3\n5. Save', expected:'3 courses in pathway in order 1→2→3', priority:'Critical', type:'Positive' },
      { id:'PT-007', name:'Reorder courses in pathway via drag', pre:'Multiple courses in pathway', steps:'1. Drag Course 3 to first position\n2. Save', expected:'Order changed; persists on reload', priority:'High', type:'Positive' },
      { id:'PT-008', name:'Remove course from pathway', pre:'Pathway with courses', steps:'1. Click remove on a course\n2. Confirm', expected:'Course removed; pathway updated; remaining courses shift', priority:'High', type:'Positive' },
      { id:'PT-009', name:'Set prerequisite between courses in pathway (Course 2 requires Course 1)', pre:'Pathway with 2 courses', steps:'1. On Course 2 in pathway\n2. Mark "Requires Course 1 completion"\n3. Save', expected:'Learner must complete Course 1 before Course 2 unlocks', priority:'High', type:'Positive' },
      { id:'PT-010', name:'Sequential access — learner cannot skip ahead in locked pathway', pre:'Pathway with sequential access', steps:'1. Enroll learner\n2. Check if Course 2 is locked until Course 1 complete', expected:'Course 2 locked; accessible only after Course 1 completion', priority:'High', type:'Positive' },
      { id:'PT-011', name:'Free-access pathway — learner can start any course', pre:'Pathway set to free access mode', steps:'1. Enroll learner\n2. Check if all courses accessible immediately', expected:'All courses in pathway accessible without order restriction', priority:'Medium', type:'Positive' },
      { id:'PT-012', name:'Pathway completion criteria — all courses completed', pre:'Pathway settings', steps:'1. Select "All Courses" completion criteria\n2. Save', expected:'Pathway marked complete only when all courses done', priority:'High', type:'Positive' },
      { id:'PT-013', name:'Pathway completion issues certificate', pre:'Certificate enabled on pathway', steps:'1. Learner completes all pathway courses\n2. Check certificate', expected:'Pathway completion certificate issued', priority:'High', type:'Positive' },
      { id:'PT-014', name:'Publish pathway with zero courses blocked', pre:'Pathway with no courses', steps:'1. Click Publish', expected:'Error: "Pathway must contain at least one course"', priority:'High', type:'Validation' },
      { id:'PT-015', name:'Publish valid pathway changes status', pre:'Pathway with courses', steps:'1. Click Publish\n2. Confirm', expected:'Status changes to Published', priority:'Critical', type:'Positive' },
      { id:'PT-016', name:'Pathway thumbnail upload and display', pre:'Pathway detail', steps:'1. Upload thumbnail image\n2. Save', expected:'Thumbnail shown on pathway card in list', priority:'Medium', type:'Positive' },
      { id:'PT-017', name:'Delete pathway with confirmation', pre:'Pathway exists', steps:'1. Click Delete\n2. Confirm', expected:'Pathway deleted; courses remain intact', priority:'High', type:'Positive' },
      { id:'PT-018', name:'Duplicate pathway', pre:'Pathway exists', steps:'1. Click Duplicate\n2. Observe', expected:'Copy created as "[Name] (Copy)" in Draft with same courses', priority:'Medium', type:'Positive' },
      { id:'PT-019', name:'IDOR — cannot access another org\'s pathway', pre:'Logged in as org_admin', steps:'1. Access another org\'s pathway via URL/API', expected:'403 Forbidden', priority:'Critical', type:'Security' },
      { id:'PT-020', name:'Pathway with non-published course shows warning', pre:'Pathway contains a draft course', steps:'1. Publish pathway\n2. Observe warning about draft courses', expected:'Warning: "Course [name] is not published. Learners may not be able to access it."', priority:'Medium', type:'Negative' },
    ]
  }
];
