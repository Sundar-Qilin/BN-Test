module.exports = [
  {
    code:'MLIB-UPLD',title:'Media Library — File Upload',cases:[
      {id:'MU-001',name:'Upload valid MP4 video file <500MB succeeds',pre:'On Media Library page; Upload button',steps:'1. Click Upload\n2. Select valid .mp4 < 500MB\n3. Wait for completion',expected:'Video uploaded; thumbnail auto-generated; file appears in library with type badge',priority:'Critical',type:'Positive'},
      {id:'MU-002',name:'Upload valid PDF document succeeds',pre:'Media Library; Upload',steps:'1. Upload valid .pdf\n2. Wait',expected:'PDF uploaded; PDF icon shown; file size displayed',priority:'High',type:'Positive'},
      {id:'MU-003',name:'Upload valid image — JPEG succeeds',pre:'Media Library; Upload',steps:'1. Upload valid .jpg image',expected:'Image uploaded; thumbnail preview shown immediately',priority:'High',type:'Positive'},
      {id:'MU-004',name:'Upload valid image — PNG with transparency succeeds',pre:'Media Library; Upload',steps:'1. Upload .png file with transparent background',expected:'PNG uploaded; transparency rendered correctly in preview',priority:'Medium',type:'Positive'},
      {id:'MU-005',name:'Upload valid audio — MP3 succeeds',pre:'Media Library; Upload',steps:'1. Upload .mp3 audio file',expected:'Audio uploaded; audio player preview available; duration shown',priority:'High',type:'Positive'},
      {id:'MU-006',name:'Upload valid SCORM zip package',pre:'Media Library; Upload',steps:'1. Upload .zip containing SCORM manifest',expected:'Zip uploaded; recognized as SCORM package; available in SCORM lesson type',priority:'High',type:'Positive'},
      {id:'MU-007',name:'Upload file exceeding size limit rejected',pre:'Media Library; Upload; 600MB MP4',steps:'1. Select 600MB file\n2. Attempt upload',expected:'Error: "File exceeds the maximum allowed size of 500MB"',priority:'High',type:'Validation'},
      {id:'MU-008',name:'Upload unsupported file type (.exe) blocked',pre:'Media Library; Upload',steps:'1. Select .exe file\n2. Upload',expected:'Error: "File type .exe is not allowed"',priority:'Critical',type:'Security'},
      {id:'MU-009',name:'Upload PHP file disguised as video (magic byte check)',pre:'Media Library',steps:'1. Rename evil.php to evil.mp4\n2. Upload',expected:'Server-side magic byte check detects mismatch; file rejected',priority:'Critical',type:'Security'},
      {id:'MU-010',name:'Upload SVG with embedded JavaScript blocked',pre:'Media Library; Upload',steps:'1. Upload SVG file with <script> tag inside\n2. Check if XSS possible',expected:'SVG script stripped, or SVG rejected entirely; no XSS possible',priority:'Critical',type:'Security'},
      {id:'MU-011',name:'Upload zip bomb (recursive archive) rejected',pre:'Media Library',steps:'1. Upload zip bomb file (e.g., 42.zip)\n2. Observe server behavior',expected:'Upload rejected or safely handled; no server resource exhaustion',priority:'Critical',type:'Security'},
      {id:'MU-012',name:'Path traversal in filename neutralized',pre:'Media Library; upload',steps:'1. Upload file named "../../etc/passwd.mp4"\n2. Check storage path',expected:'Filename sanitized; stored as sanitized name; no path traversal possible',priority:'Critical',type:'Security'},
      {id:'MU-013',name:'Upload progress bar shown during upload',pre:'Uploading large file',steps:'1. Start upload of 100MB file\n2. Observe UI',expected:'Progress bar with percentage; cancel option available',priority:'Medium',type:'UI/UX'},
      {id:'MU-014',name:'Cancel in-progress upload stops transfer',pre:'Upload in progress',steps:'1. Click Cancel during upload',expected:'Upload cancelled; partial file not stored; upload removed from queue',priority:'Medium',type:'Positive'},
      {id:'MU-015',name:'Multiple files uploaded in parallel queue',pre:'Media Library',steps:'1. Select 5 files at once\n2. Upload',expected:'All 5 shown in upload queue; each with own progress bar; completed one by one or in parallel',priority:'Medium',type:'Positive'},
      {id:'MU-016',name:'Duplicate filename — conflict handling',pre:'File "intro.mp4" already exists',steps:'1. Upload another file named "intro.mp4"',expected:'Auto-renamed (e.g., "intro_2.mp4") or prompted to replace; original not silently overwritten',priority:'High',type:'Positive'},
      {id:'MU-017',name:'Upload to specific folder during upload',pre:'Folders exist in library',steps:'1. Select target folder during upload\n2. Upload file',expected:'File placed in selected folder; not in root',priority:'Medium',type:'Positive'},
      {id:'MU-018',name:'Null byte in filename neutralized',pre:'Media Library; upload',steps:'1. Upload file with null byte in name (e.g., "file\x00.php.mp4")',expected:'Null byte stripped; file stored safely',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'MLIB-FLDR',title:'Media Library — Folder Management',cases:[
      {id:'MF-001',name:'Create new folder with valid name',pre:'Media Library root view',steps:'1. Click "New Folder"\n2. Enter name "Course Videos"\n3. Confirm',expected:'Folder created; appears in library; clickable to navigate into',priority:'High',type:'Positive'},
      {id:'MF-002',name:'Create folder with blank name fails',pre:'New Folder dialog',steps:'1. Leave name empty\n2. Confirm',expected:'Required field error',priority:'High',type:'Validation'},
      {id:'MF-003',name:'Duplicate folder name in same directory rejected',pre:'Folder "Videos" exists',steps:'1. Create another "Videos" in same location',expected:'Error: "A folder with this name already exists here"',priority:'High',type:'Validation'},
      {id:'MF-004',name:'Duplicate folder name in different parent allowed',pre:'Folder "Videos" in root',steps:'1. Create "Videos" inside another folder',expected:'Created successfully; nested paths are distinct',priority:'Medium',type:'Positive'},
      {id:'MF-005',name:'Rename folder updates breadcrumb and path',pre:'Folder exists',steps:'1. Right-click or click rename\n2. Enter new name\n3. Confirm',expected:'Folder renamed; breadcrumb and all file paths within updated',priority:'High',type:'Positive'},
      {id:'MF-006',name:'Delete empty folder with confirmation',pre:'Empty folder',steps:'1. Delete folder\n2. Confirm',expected:'Folder deleted; removed from tree',priority:'Medium',type:'Positive'},
      {id:'MF-007',name:'Delete folder with files — warns about contained files',pre:'Folder has 10 files',steps:'1. Click Delete on non-empty folder',expected:'Warning: "This folder contains 10 files. Deleting it will also delete all contents. Continue?"',priority:'High',type:'Negative'},
      {id:'MF-008',name:'Delete folder with files and confirm — deletes all',pre:'Confirmed delete of folder with files',steps:'1. Confirm deletion',expected:'Folder and all contained files deleted; used-in-course references updated or broken with warning',priority:'High',type:'Positive'},
      {id:'MF-009',name:'Navigate into nested folder via breadcrumb',pre:'Nested folder structure',steps:'1. Click into folder\n2. Click breadcrumb to go up',expected:'Breadcrumb shows full path; clicking any breadcrumb level navigates to that level',priority:'Medium',type:'Positive'},
      {id:'MF-010',name:'Folder name XSS attempt sanitized',pre:'New folder dialog',steps:'1. Enter <script>alert(1)</script> as folder name\n2. Create',expected:'Script tags stripped; folder name rendered as literal text',priority:'High',type:'Security'},
      {id:'MF-011',name:'Move file to folder via drag-and-drop',pre:'File in root; folder exists',steps:'1. Drag file onto folder',expected:'File moved into folder; no longer in root',priority:'Medium',type:'Positive'},
      {id:'MF-012',name:'Move file via "Move to" context menu',pre:'File in library',steps:'1. Right-click file\n2. Move to\n3. Select folder\n4. Confirm',expected:'File moved to selected folder',priority:'Medium',type:'Positive'},
    ]
  },
  {
    code:'MLIB-SRCH',title:'Media Library — Search & Filter',cases:[
      {id:'MS-001',name:'Search by file name — partial match',pre:'Files in library',steps:'1. Enter partial filename in search',expected:'All matching files shown; others hidden',priority:'High',type:'Positive'},
      {id:'MS-002',name:'Search returns no results — empty state shown',pre:'Media Library',steps:'1. Search "ZZNONE999"',expected:'"No files match your search" empty state',priority:'Medium',type:'Negative'},
      {id:'MS-003',name:'Filter by file type — Videos only',pre:'Library has mixed file types',steps:'1. Select "Video" filter',expected:'Only video files shown (mp4, mov, etc.)',priority:'High',type:'Positive'},
      {id:'MS-004',name:'Filter by file type — PDFs only',pre:'Library; mixed types',steps:'1. Select "PDF" filter',expected:'Only PDF files shown',priority:'High',type:'Positive'},
      {id:'MS-005',name:'Filter by file type — Images only',pre:'Library; mixed types',steps:'1. Select "Image" filter',expected:'Only image files (jpg, png, gif) shown',priority:'Medium',type:'Positive'},
      {id:'MS-006',name:'Filter by file type — Audio only',pre:'Library; mixed types',steps:'1. Select "Audio"',expected:'Only audio files shown',priority:'Medium',type:'Positive'},
      {id:'MS-007',name:'Sort files by upload date newest first',pre:'Library',steps:'1. Select Sort by "Date (Newest)"',expected:'Most recently uploaded files at top',priority:'Medium',type:'Positive'},
      {id:'MS-008',name:'Sort files by file size descending',pre:'Library',steps:'1. Sort by "Size (Largest)"',expected:'Largest files shown first',priority:'Low',type:'Positive'},
      {id:'MS-009',name:'Sort files by name A-Z',pre:'Library',steps:'1. Sort by Name A-Z',expected:'Alphabetical order',priority:'Low',type:'Positive'},
      {id:'MS-010',name:'Combine search and filter — search "intro" + type "Video"',pre:'Library',steps:'1. Enter "intro" in search\n2. Select Video filter',expected:'Only video files with "intro" in name shown',priority:'Medium',type:'Positive'},
    ]
  },
  {
    code:'MLIB-MGMT',title:'Media Library — File Operations',cases:[
      {id:'MM-001',name:'Preview video file in modal/player',pre:'Video file in library',steps:'1. Click file or Preview button',expected:'Video player opens in modal; plays from beginning; controls available',priority:'High',type:'Positive'},
      {id:'MM-002',name:'Preview PDF in browser or modal',pre:'PDF file in library',steps:'1. Click PDF preview',expected:'PDF renders in browser viewer or modal; pages navigable',priority:'High',type:'Positive'},
      {id:'MM-003',name:'Preview image shows full-size in lightbox',pre:'Image file in library',steps:'1. Click image',expected:'Full-size image opens in lightbox; zoom and close available',priority:'Medium',type:'Positive'},
      {id:'MM-004',name:'Preview audio plays in inline player',pre:'Audio file in library',steps:'1. Click audio preview',expected:'Audio player shown; play/pause/seek controls work',priority:'Medium',type:'Positive'},
      {id:'MM-005',name:'Rename file',pre:'File in library',steps:'1. Right-click or edit icon on file\n2. Enter new name\n3. Confirm',expected:'File renamed; extension preserved; name updated in any course that uses it',priority:'High',type:'Positive'},
      {id:'MM-006',name:'Rename file to blank name fails',pre:'Rename dialog',steps:'1. Clear name\n2. Confirm',expected:'Required field error',priority:'High',type:'Validation'},
      {id:'MM-007',name:'Delete file with confirmation',pre:'File in library; not in use',steps:'1. Click Delete\n2. Confirm',expected:'File deleted; removed from library; storage freed',priority:'High',type:'Positive'},
      {id:'MM-008',name:'Delete file in use by a course — warns',pre:'File used in a lesson',steps:'1. Click Delete on used file',expected:'Warning: "This file is used in N lessons. Deleting it will break those lessons. Continue?"',priority:'High',type:'Negative'},
      {id:'MM-009',name:'Copy file URL / Get shareable link',pre:'File in library',steps:'1. Click "Copy Link" or "Get URL"',expected:'Signed URL or CDN URL copied to clipboard',priority:'Medium',type:'Positive'},
      {id:'MM-010',name:'Signed media URL expires after set time',pre:'File with expiring signed URL',steps:'1. Copy signed URL\n2. Wait for expiry\n3. Access URL',expected:'URL returns 403 or 404 after expiry',priority:'High',type:'Security'},
      {id:'MM-011',name:'Download original file',pre:'File in library',steps:'1. Click Download',expected:'File downloaded with original filename and extension',priority:'Medium',type:'Positive'},
      {id:'MM-012',name:'File detail shows metadata: size, type, dimensions (image), duration (video)',pre:'Click file info icon',steps:'1. Click file info / Details',expected:'Panel shows: file size, MIME type, upload date, uploader name, dimensions or duration',priority:'Medium',type:'Positive'},
      {id:'MM-013',name:'Bulk delete multiple files',pre:'Multiple files selected',steps:'1. Select 5 files\n2. Bulk Delete\n3. Confirm',expected:'5 files deleted; storage freed; any course references noted',priority:'High',type:'Positive'},
      {id:'MM-014',name:'Org-scoped media — org_admin cannot see other orgs\' files',pre:'Logged in as org_admin',steps:'1. Open Media Library\n2. Check if other org files visible\n3. Try GET /api/media/{other-org-file-id}',expected:'Only own org files shown; cross-org file access returns 403',priority:'Critical',type:'Security'},
      {id:'MM-015',name:'Video transcoding status shown after upload',pre:'Large video uploaded',steps:'1. View file in library after upload',expected:'"Processing" or "Transcoding" status shown; updates to "Ready" when complete',priority:'Medium',type:'UI/UX'},
    ]
  },
];
