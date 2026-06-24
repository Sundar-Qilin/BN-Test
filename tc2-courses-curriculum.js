// CRSE-CURR — Curriculum Builder: Modules + All Lesson Types — 130 cases
module.exports = [
  {
    code: 'CRSE-CURR',
    title: 'Courses — Curriculum Builder',
    cases: [

      // ══════════════════════════════════════════════════════════════════════
      // MODULE / SECTION MANAGEMENT
      // ══════════════════════════════════════════════════════════════════════
      { id:'CC-001', name:'Curriculum tab opens with empty state prompt', pre:'New course with no curriculum', steps:'1. Open course\n2. Click Curriculum tab', expected:'"Add your first section" or empty state prompt with Add Section button', priority:'High', type:'UI/UX' },
      { id:'CC-002', name:'Add new section/module creates it in the list', pre:'Curriculum tab open', steps:'1. Click "Add Section"\n2. Enter section title "Module 1: Introduction"\n3. Confirm', expected:'Section appears in curriculum list; ready to add lessons', priority:'Critical', type:'Positive' },
      { id:'CC-003', name:'Add section with blank title shows validation error', pre:'Add section dialog open', steps:'1. Leave title blank\n2. Confirm', expected:'Required field error; section not created', priority:'High', type:'Validation' },
      { id:'CC-004', name:'Add multiple sections — all appear in order', pre:'Curriculum tab', steps:'1. Add Section A\n2. Add Section B\n3. Add Section C', expected:'Three sections visible in creation order', priority:'High', type:'Positive' },
      { id:'CC-005', name:'Rename section updates title inline or via edit modal', pre:'Section exists in curriculum', steps:'1. Click edit/pencil on section title\n2. Change to "Module 1: Foundations"\n3. Save', expected:'Title updated immediately in curriculum list', priority:'High', type:'Positive' },
      { id:'CC-006', name:'Rename section to blank title fails', pre:'Section title edit active', steps:'1. Clear title\n2. Save', expected:'Required field error; previous title retained', priority:'High', type:'Validation' },
      { id:'CC-007', name:'Reorder sections via drag and drop', pre:'Multiple sections exist', steps:'1. Drag Section 3 above Section 1\n2. Drop\n3. Save order', expected:'Section 3 now first; order persists on page refresh', priority:'High', type:'Positive' },
      { id:'CC-008', name:'Collapse section hides its lessons', pre:'Section with lessons visible', steps:'1. Click collapse arrow on section', expected:'Lessons hidden; section remains with toggle visible', priority:'Medium', type:'UI/UX' },
      { id:'CC-009', name:'Expand collapsed section reveals lessons', pre:'Section collapsed', steps:'1. Click expand arrow', expected:'Lessons visible again', priority:'Medium', type:'UI/UX' },
      { id:'CC-010', name:'Delete empty section with confirmation', pre:'Section with no lessons', steps:'1. Click delete on section\n2. Confirm dialog', expected:'Section removed from curriculum', priority:'High', type:'Positive' },
      { id:'CC-011', name:'Delete section with lessons warns about lesson loss', pre:'Section has 3 lessons', steps:'1. Click delete on section\n2. Observe warning', expected:'Warning: "This section contains 3 lessons. Deleting it will also delete all lessons. Continue?"', priority:'Critical', type:'UI/UX' },
      { id:'CC-012', name:'Cancel delete section leaves it intact', pre:'Delete confirmation shown', steps:'1. Click Cancel', expected:'Section and all its lessons remain unchanged', priority:'High', type:'Positive' },
      { id:'CC-013', name:'Confirm delete section with lessons removes all', pre:'Delete section confirmed', steps:'1. Click Confirm', expected:'Section and all nested lessons deleted', priority:'High', type:'Positive' },
      { id:'CC-014', name:'Max sections boundary — create 50 sections', pre:'Curriculum tab empty', steps:'1. Add 50 sections programmatically or via UI', expected:'All 50 created; or system-defined limit enforced with clear error', priority:'Low', type:'Boundary' },
      { id:'CC-015', name:'Section title max length validated', pre:'Edit section title', steps:'1. Enter 500-character title\n2. Save', expected:'Truncated at max or validation error shown', priority:'Low', type:'Boundary' },

      // ══════════════════════════════════════════════════════════════════════
      // VIDEO LESSONS
      // ══════════════════════════════════════════════════════════════════════
      { id:'CC-016', name:'Add Video lesson — upload MP4 file', pre:'Section exists; Add Lesson clicked', steps:'1. Select lesson type "Video"\n2. Choose "Upload file"\n3. Select valid MP4 < 500MB\n4. Enter title "Intro Video"\n5. Save', expected:'Video uploaded; lesson appears in section with video icon', priority:'Critical', type:'Positive' },
      { id:'CC-017', name:'Add Video lesson — embed YouTube URL', pre:'Add lesson; type Video; URL option', steps:'1. Select "Embed URL"\n2. Paste YouTube URL\n3. Enter title\n4. Save', expected:'Embedded video lesson created; preview shows YouTube player', priority:'Critical', type:'Positive' },
      { id:'CC-018', name:'Add Video lesson — embed Vimeo URL', pre:'Video lesson; URL embed', steps:'1. Paste Vimeo URL\n2. Save', expected:'Vimeo video embedded and previews correctly', priority:'High', type:'Positive' },
      { id:'CC-019', name:'Video lesson — non-video file rejected', pre:'Add video lesson; upload option', steps:'1. Upload a .docx file\n2. Save', expected:'Error: only video files accepted (MP4, MOV, AVI, etc.)', priority:'High', type:'Validation' },
      { id:'CC-020', name:'Video lesson — oversized file (>500MB) rejected', pre:'Upload option', steps:'1. Upload 600MB MP4\n2. Observe', expected:'Error: file exceeds maximum size limit', priority:'High', type:'Validation' },
      { id:'CC-021', name:'Video lesson — invalid URL shows error', pre:'URL embed option', steps:'1. Enter "notaurl" as video URL\n2. Save', expected:'Validation error: invalid URL format', priority:'High', type:'Validation' },
      { id:'CC-022', name:'Video lesson — blank title validation', pre:'Add video lesson form', steps:'1. Upload/embed video\n2. Leave title blank\n3. Save', expected:'Required field error on title', priority:'High', type:'Validation' },
      { id:'CC-023', name:'Video lesson — set description', pre:'Video lesson form', steps:'1. Add optional description text\n2. Save', expected:'Description saved and displayed in lesson view', priority:'Medium', type:'Positive' },
      { id:'CC-024', name:'Video lesson — set manual duration', pre:'Video lesson form', steps:'1. Enter duration "00:12:34"\n2. Save', expected:'Duration displayed on lesson card in curriculum', priority:'Medium', type:'Positive' },
      { id:'CC-025', name:'Video lesson — toggle free preview on', pre:'Video lesson form', steps:'1. Enable "Free Preview" toggle\n2. Save', expected:'Lesson marked as free preview; learners can view without enrollment', priority:'High', type:'Positive' },
      { id:'CC-026', name:'Video lesson — set drip release (7 days after enrollment)', pre:'Video lesson form', steps:'1. Enable drip\n2. Enter 7 days\n3. Save', expected:'Lesson locked for 7 days after enrollment; unlocks automatically on day 7', priority:'High', type:'Positive' },
      { id:'CC-027', name:'Video lesson — drip with negative days rejected', pre:'Drip field visible', steps:'1. Enter -1 in drip days\n2. Save', expected:'Validation error: must be 0 or positive', priority:'Medium', type:'Validation' },
      { id:'CC-028', name:'Video lesson — add downloadable resource attachment', pre:'Video lesson form', steps:'1. Find "Resources" or "Attachments" section\n2. Upload a PDF as resource\n3. Save', expected:'Resource attached; learners can download it alongside the video', priority:'Medium', type:'Positive' },
      { id:'CC-029', name:'Video lesson — assign instructor to lesson', pre:'Instructors exist in system', steps:'1. Find "Instructor" field on lesson form\n2. Select an instructor\n3. Save', expected:'Instructor assigned; shown on lesson card', priority:'Medium', type:'Positive' },
      { id:'CC-030', name:'Video lesson — upload captions/subtitles (SRT file)', pre:'Video lesson saved', steps:'1. Edit video lesson\n2. Upload .srt captions file\n3. Save', expected:'Captions associated; learner can toggle subtitles', priority:'Medium', type:'Positive' },
      { id:'CC-031', name:'Video lesson — SRT file with wrong format rejected', pre:'Captions upload', steps:'1. Upload .doc file as captions', expected:'Error: only SRT/VTT files accepted for captions', priority:'Medium', type:'Validation' },
      { id:'CC-032', name:'Video lesson — edit existing saves new data', pre:'Video lesson saved', steps:'1. Click edit on lesson\n2. Change title\n3. Save', expected:'Updated title shown in curriculum', priority:'High', type:'Positive' },
      { id:'CC-033', name:'Video lesson — duplicate creates copy in same section', pre:'Video lesson exists', steps:'1. Click duplicate option on lesson\n2. Observe', expected:'Copy created as "[Lesson Title] (Copy)"; same content', priority:'Medium', type:'Positive' },
      { id:'CC-034', name:'Video lesson — move to different section', pre:'Video lesson in Section A; Section B exists', steps:'1. Open lesson options\n2. Move to Section B', expected:'Lesson appears in Section B; removed from Section A', priority:'Medium', type:'Positive' },
      { id:'CC-035', name:'Video lesson — delete with confirmation', pre:'Video lesson exists', steps:'1. Click delete on lesson\n2. Confirm', expected:'Lesson removed from section; video file also removed if stored internally', priority:'High', type:'Positive' },
      { id:'CC-036', name:'Video lesson — reorder within section via drag', pre:'Multiple lessons in section', steps:'1. Drag video lesson to a different position\n2. Drop\n3. Save order', expected:'New order persists after page refresh', priority:'High', type:'Positive' },
      { id:'CC-037', name:'Video lesson — IDOR via direct API call', pre:'Logged in as instructor of Course A', steps:'1. Call API to fetch lesson from Course B\n2. Or edit Course B lesson via API', expected:'403 Forbidden; no cross-course lesson access', priority:'Critical', type:'Security' },

      // ══════════════════════════════════════════════════════════════════════
      // PDF LESSONS
      // ══════════════════════════════════════════════════════════════════════
      { id:'CC-038', name:'Add PDF lesson — upload valid PDF', pre:'Lesson type PDF selected', steps:'1. Upload valid PDF < 50MB\n2. Enter title "Course Workbook"\n3. Save', expected:'PDF lesson created; PDF icon on lesson card', priority:'Critical', type:'Positive' },
      { id:'CC-039', name:'PDF lesson — non-PDF file rejected', pre:'PDF lesson form; upload', steps:'1. Upload a .jpg file\n2. Save', expected:'Error: only PDF files accepted', priority:'High', type:'Validation' },
      { id:'CC-040', name:'PDF lesson — file too large rejected', pre:'PDF lesson form', steps:'1. Upload 200MB PDF\n2. Observe', expected:'Error: file exceeds size limit', priority:'High', type:'Validation' },
      { id:'CC-041', name:'PDF lesson — blank title fails', pre:'PDF lesson form', steps:'1. Upload PDF\n2. Leave title blank\n3. Save', expected:'Required field error on title', priority:'High', type:'Validation' },
      { id:'CC-042', name:'PDF lesson — allow download toggle', pre:'PDF lesson form', steps:'1. Toggle "Allow Download" on\n2. Save', expected:'Learner sees download button; can download PDF', priority:'Medium', type:'Positive' },
      { id:'CC-043', name:'PDF lesson — prevent download hides download button', pre:'PDF lesson saved with download disabled', steps:'1. Toggle off "Allow Download"\n2. Save\n3. Check learner view', expected:'Download button not visible; PDF displayed in viewer only', priority:'Medium', type:'Positive' },
      { id:'CC-044', name:'PDF lesson — upload malicious file disguised as PDF', pre:'PDF lesson form', steps:'1. Rename a .php file to .pdf\n2. Upload it\n3. Save', expected:'File rejected by content-type check; or stored safely and not executable', priority:'Critical', type:'Security' },
      { id:'CC-045', name:'PDF lesson — free preview enabled', pre:'PDF lesson form', steps:'1. Enable Free Preview\n2. Save', expected:'PDF accessible without enrollment', priority:'Medium', type:'Positive' },
      { id:'CC-046', name:'PDF lesson — drip release', pre:'PDF lesson form', steps:'1. Set drip to 3 days\n2. Save', expected:'PDF locked for 3 days post-enrollment', priority:'Medium', type:'Positive' },

      // ══════════════════════════════════════════════════════════════════════
      // TEXT / ARTICLE LESSONS
      // ══════════════════════════════════════════════════════════════════════
      { id:'CC-047', name:'Add Text lesson — editor loads with toolbar', pre:'Lesson type Text/Article selected', steps:'1. Select Text lesson type\n2. Observe editor', expected:'Rich text editor visible with formatting toolbar (Bold, Italic, Underline, H1-H3, Lists, Links, Images, Code)', priority:'High', type:'UI/UX' },
      { id:'CC-048', name:'Text lesson — enter content and save', pre:'Text lesson form', steps:'1. Enter title "Module Overview"\n2. Type rich text content with headings and bullets\n3. Save', expected:'Lesson saved; content displays correctly in learner view', priority:'Critical', type:'Positive' },
      { id:'CC-049', name:'Text lesson — apply heading formatting', pre:'Text editor active', steps:'1. Type "Introduction"\n2. Apply H2 heading style', expected:'Text rendered as H2 in preview and learner view', priority:'High', type:'Positive' },
      { id:'CC-050', name:'Text lesson — insert hyperlink', pre:'Text editor active', steps:'1. Select text "click here"\n2. Click link tool\n3. Enter URL https://example.com\n4. Save', expected:'Link inserted; opens in new tab in learner view', priority:'Medium', type:'Positive' },
      { id:'CC-051', name:'Text lesson — insert image inline', pre:'Text editor active', steps:'1. Click image insert icon\n2. Upload or paste image URL\n3. Confirm', expected:'Image embedded in text content', priority:'Medium', type:'Positive' },
      { id:'CC-052', name:'Text lesson — blank title fails', pre:'Text lesson form', steps:'1. Write content but leave title blank\n2. Save', expected:'Required field error on title', priority:'High', type:'Validation' },
      { id:'CC-053', name:'Text lesson — blank content fails or warns', pre:'Text lesson form', steps:'1. Enter title\n2. Leave editor body empty\n3. Save', expected:'Warning or error: content is required', priority:'Medium', type:'Validation' },
      { id:'CC-054', name:'Text lesson — XSS in editor sanitized on render', pre:'Text editor', steps:'1. Paste "<script>alert(1)</script>" in editor\n2. Save\n3. View as learner', expected:'Script tag not rendered; no alert fires; sanitized output', priority:'Critical', type:'Security' },
      { id:'CC-055', name:'Text lesson — extremely long content (10,000 words) handles gracefully', pre:'Text editor', steps:'1. Paste 10,000 words of content\n2. Save', expected:'Saved without error; learner view shows content with scrollbar', priority:'Low', type:'Boundary' },

      // ══════════════════════════════════════════════════════════════════════
      // QUIZ LESSONS
      // ══════════════════════════════════════════════════════════════════════
      { id:'CC-056', name:'Add Quiz lesson — form shows question builder', pre:'Lesson type Quiz selected', steps:'1. Select Quiz lesson type\n2. Enter title "Chapter 1 Quiz"\n3. Observe form', expected:'Form shows question builder with "Add Question" button, passing score, time limit fields', priority:'Critical', type:'UI/UX' },
      { id:'CC-057', name:'Quiz — add multiple choice question', pre:'Quiz builder open', steps:'1. Click "Add Question"\n2. Select type "Multiple Choice"\n3. Enter question text\n4. Add 4 answer options\n5. Mark one as correct\n6. Save question', expected:'MCQ question saved in quiz', priority:'Critical', type:'Positive' },
      { id:'CC-058', name:'Quiz — MCQ with no correct answer shows error', pre:'MCQ question added', steps:'1. Add 4 answer options\n2. Do NOT mark any as correct\n3. Save question', expected:'Validation error: must mark at least one correct answer', priority:'High', type:'Validation' },
      { id:'CC-059', name:'Quiz — MCQ with less than 2 options shows error', pre:'MCQ question form', steps:'1. Add only 1 answer option\n2. Save', expected:'Validation error: minimum 2 options required', priority:'High', type:'Validation' },
      { id:'CC-060', name:'Quiz — add True/False question', pre:'Quiz builder', steps:'1. Add question type "True/False"\n2. Enter question\n3. Mark True as correct\n4. Save', expected:'True/False question saved with correct answer indicated', priority:'High', type:'Positive' },
      { id:'CC-061', name:'Quiz — add Short Answer question', pre:'Quiz builder', steps:'1. Add question type "Short Answer"\n2. Enter question text\n3. Optionally add expected answer keywords\n4. Save', expected:'Short answer question saved; learner sees text input box', priority:'High', type:'Positive' },
      { id:'CC-062', name:'Quiz — question with blank question text fails', pre:'Quiz question form', steps:'1. Leave question text blank\n2. Save question', expected:'Required field error on question text', priority:'High', type:'Validation' },
      { id:'CC-063', name:'Quiz — set passing score 70%', pre:'Quiz form', steps:'1. Enter 70 in passing score field\n2. Save', expected:'Quiz requires 70% to pass; failure shown if score < 70', priority:'High', type:'Positive' },
      { id:'CC-064', name:'Quiz — passing score > 100 rejected', pre:'Quiz form', steps:'1. Enter 101 in passing score\n2. Save', expected:'Validation error: score must be 0-100', priority:'Medium', type:'Validation' },
      { id:'CC-065', name:'Quiz — passing score negative rejected', pre:'Quiz form', steps:'1. Enter -10 in passing score\n2. Save', expected:'Validation error: must be non-negative', priority:'Medium', type:'Validation' },
      { id:'CC-066', name:'Quiz — set time limit 30 minutes', pre:'Quiz form', steps:'1. Enter 30 in time limit field\n2. Save', expected:'Timer shown during quiz; auto-submits when time expires', priority:'High', type:'Positive' },
      { id:'CC-067', name:'Quiz — zero time limit means unlimited time', pre:'Quiz form', steps:'1. Enter 0 or leave time limit blank\n2. Save', expected:'No timer shown; learner takes quiz without time pressure', priority:'Medium', type:'Positive' },
      { id:'CC-068', name:'Quiz — set maximum retry attempts to 3', pre:'Quiz form', steps:'1. Enter 3 in "Retry Attempts" field\n2. Save', expected:'Learner gets 3 attempts; blocked after 3rd failed attempt', priority:'High', type:'Positive' },
      { id:'CC-069', name:'Quiz — "show correct answers after submission" toggle', pre:'Quiz form', steps:'1. Enable "Show Answers After Submission"\n2. Save', expected:'After submitting quiz, learner sees which answers were correct/incorrect', priority:'Medium', type:'Positive' },
      { id:'CC-070', name:'Quiz — reorder questions via drag', pre:'Multiple questions in quiz', steps:'1. Drag Question 3 to first position\n2. Save', expected:'Questions reordered; new order saved', priority:'Medium', type:'Positive' },
      { id:'CC-071', name:'Quiz — delete question with confirmation', pre:'Question exists in quiz', steps:'1. Click delete on question\n2. Confirm', expected:'Question removed from quiz; remaining questions re-numbered', priority:'Medium', type:'Positive' },
      { id:'CC-072', name:'Quiz — save quiz with zero questions fails', pre:'Quiz lesson with no questions added', steps:'1. Try to save quiz lesson with no questions', expected:'Validation error: at least one question required', priority:'High', type:'Validation' },

      // ══════════════════════════════════════════════════════════════════════
      // AUDIO LESSONS
      // ══════════════════════════════════════════════════════════════════════
      { id:'CC-073', name:'Add Audio lesson — upload MP3 file', pre:'Lesson type Audio selected', steps:'1. Upload valid MP3 < 100MB\n2. Enter title "Podcast Episode 1"\n3. Save', expected:'Audio lesson created; audio player icon on lesson card', priority:'High', type:'Positive' },
      { id:'CC-074', name:'Audio lesson — upload WAV file', pre:'Audio lesson form', steps:'1. Upload valid WAV file', expected:'WAV accepted; lesson created', priority:'Medium', type:'Positive' },
      { id:'CC-075', name:'Audio lesson — non-audio file rejected', pre:'Audio lesson form', steps:'1. Upload .jpg as audio', expected:'Error: only audio files accepted (MP3, WAV, OGG, M4A)', priority:'High', type:'Validation' },
      { id:'CC-076', name:'Audio lesson — embed audio URL', pre:'Audio lesson form; URL option', steps:'1. Paste direct audio file URL or SoundCloud embed\n2. Save', expected:'Audio URL embedded; player shown in learner view', priority:'Medium', type:'Positive' },
      { id:'CC-077', name:'Audio lesson — blank title fails', pre:'Audio lesson form', steps:'1. Upload audio\n2. Leave title blank\n3. Save', expected:'Required field error', priority:'High', type:'Validation' },
      { id:'CC-078', name:'Audio lesson — free preview enabled', pre:'Audio lesson form', steps:'1. Toggle Free Preview on\n2. Save', expected:'Audio accessible without enrollment', priority:'Medium', type:'Positive' },

      // ══════════════════════════════════════════════════════════════════════
      // EMBED / URL LESSONS
      // ══════════════════════════════════════════════════════════════════════
      { id:'CC-079', name:'Add Embed lesson — enter valid iframe URL', pre:'Lesson type Embed selected', steps:'1. Enter embed URL (e.g., Typeform, H5P, Loom)\n2. Enter title\n3. Save', expected:'Lesson created; iframe renders in learner view', priority:'High', type:'Positive' },
      { id:'CC-080', name:'Embed lesson — blank URL fails', pre:'Embed lesson form', steps:'1. Leave URL blank\n2. Save', expected:'Required field error on URL', priority:'High', type:'Validation' },
      { id:'CC-081', name:'Embed lesson — malformed URL rejected', pre:'Embed form', steps:'1. Enter "javascript:alert(1)" as URL\n2. Save', expected:'Error: disallowed protocol; only http/https allowed', priority:'Critical', type:'Security' },
      { id:'CC-082', name:'Embed lesson — SSRF via internal URL blocked', pre:'Embed form', steps:'1. Enter "http://169.254.169.254/metadata" as embed URL\n2. Save', expected:'URL rejected; internal/private IP ranges blocked', priority:'Critical', type:'Security' },
      { id:'CC-083', name:'Embed lesson — set iframe dimensions', pre:'Embed lesson form', steps:'1. Enter width 800, height 600\n2. Save', expected:'Iframe renders at specified dimensions', priority:'Low', type:'Positive' },
      { id:'CC-084', name:'Embed lesson — blank title fails', pre:'Embed form', steps:'1. Enter URL but no title\n2. Save', expected:'Required field error on title', priority:'High', type:'Validation' },

      // ══════════════════════════════════════════════════════════════════════
      // SCORM LESSONS
      // ══════════════════════════════════════════════════════════════════════
      { id:'CC-085', name:'Add SCORM lesson — upload valid SCORM 1.2 zip', pre:'Lesson type SCORM selected', steps:'1. Upload valid SCORM 1.2 .zip file\n2. Enter title "SCORM Module"\n3. Save', expected:'SCORM package processed; lesson created with SCORM player', priority:'High', type:'Positive' },
      { id:'CC-086', name:'Add SCORM lesson — upload valid SCORM 2004 zip', pre:'SCORM lesson form', steps:'1. Upload SCORM 2004 zip\n2. Save', expected:'SCORM 2004 package accepted and loaded', priority:'High', type:'Positive' },
      { id:'CC-087', name:'SCORM — non-zip file rejected', pre:'SCORM lesson form', steps:'1. Upload a .pdf file\n2. Save', expected:'Error: only ZIP packages accepted for SCORM', priority:'High', type:'Validation' },
      { id:'CC-088', name:'SCORM — zip without imsmanifest.xml rejected', pre:'SCORM form; zip without manifest', steps:'1. Upload zip missing imsmanifest.xml\n2. Save', expected:'Error: invalid SCORM package; manifest file missing', priority:'High', type:'Negative' },
      { id:'CC-089', name:'SCORM — oversized package (>500MB) rejected', pre:'SCORM form', steps:'1. Upload 600MB zip\n2. Observe', expected:'Error: file exceeds SCORM package size limit', priority:'Medium', type:'Validation' },
      { id:'CC-090', name:'SCORM lesson — completion tracked via SCORM API', pre:'SCORM lesson; learner enrolled', steps:'1. Learner opens and completes SCORM module\n2. Check progress in admin learners tab', expected:'Completion status updated from SCORM API response (cmi.completion_status)', priority:'High', type:'Positive' },
      { id:'CC-091', name:'SCORM lesson — zip bomb (nested archives) rejected or safely extracted', pre:'SCORM form', steps:'1. Upload a zip bomb (deeply nested archives)\n2. Observe extraction', expected:'System detects zip bomb; rejects or extracts within safe limits', priority:'Critical', type:'Security' },

      // ══════════════════════════════════════════════════════════════════════
      // ASSIGNMENT LESSONS
      // ══════════════════════════════════════════════════════════════════════
      { id:'CC-092', name:'Add Assignment lesson — form shows instruction editor', pre:'Lesson type Assignment selected', steps:'1. Select Assignment\n2. Observe form', expected:'Rich text editor for instructions; file submission toggle; deadline field visible', priority:'High', type:'UI/UX' },
      { id:'CC-093', name:'Assignment — save with instructions and file submission enabled', pre:'Assignment form', steps:'1. Enter instructions in rich text\n2. Toggle "Allow File Submission" on\n3. Set deadline 30 days from now\n4. Enter title\n5. Save', expected:'Assignment lesson created; learners can submit files by deadline', priority:'Critical', type:'Positive' },
      { id:'CC-094', name:'Assignment — blank title fails', pre:'Assignment form', steps:'1. Leave title blank\n2. Save', expected:'Required field error', priority:'High', type:'Validation' },
      { id:'CC-095', name:'Assignment — deadline in the past shows warning', pre:'Assignment form', steps:'1. Set deadline to yesterday\'s date', expected:'Warning: "Deadline is in the past; learners cannot submit"', priority:'Medium', type:'Validation' },
      { id:'CC-096', name:'Assignment — max file size for submissions configured', pre:'Assignment form; file submission enabled', steps:'1. Set max submission file size to 10MB\n2. Save', expected:'Learner upload capped at 10MB; larger files rejected', priority:'Medium', type:'Positive' },
      { id:'CC-097', name:'Assignment — allowed file types configured (PDF, DOCX only)', pre:'Assignment form', steps:'1. Set allowed types to PDF and DOCX\n2. Save', expected:'Learner cannot submit other file types', priority:'Medium', type:'Positive' },

      // ══════════════════════════════════════════════════════════════════════
      // COMMON LESSON FEATURES
      // ══════════════════════════════════════════════════════════════════════
      { id:'CC-098', name:'Lesson marked required — must complete before next unlocks', pre:'Lesson "required" toggle enabled; course has sequential setting', steps:'1. Toggle "Required" on lesson\n2. Enroll a learner\n3. Check if next lesson locked', expected:'Next lesson locked until this required lesson is completed', priority:'High', type:'Positive' },
      { id:'CC-099', name:'Lesson marked optional — learner can skip it', pre:'Lesson "required" toggle disabled', steps:'1. Verify learner can skip this lesson and access next', expected:'Next lesson accessible without completing optional one', priority:'Medium', type:'Positive' },
      { id:'CC-100', name:'Multiple resource attachments on one lesson', pre:'Lesson form open', steps:'1. Attach PDF resource 1\n2. Attach PDF resource 2\n3. Attach DOCX resource 3\n4. Save', expected:'All 3 resources listed on lesson; learner can download each', priority:'Medium', type:'Positive' },
      { id:'CC-101', name:'Resource attachment — executable file (.exe) blocked', pre:'Lesson attachment upload', steps:'1. Try to attach .exe file', expected:'Error: executable file types not allowed', priority:'Critical', type:'Security' },
      { id:'CC-102', name:'Lesson counts visible on section header', pre:'Section has 5 lessons', steps:'1. View section in curriculum', expected:'Section header shows "5 lessons" count', priority:'Low', type:'UI/UX' },
      { id:'CC-103', name:'Total course duration calculated from all lessons', pre:'Course with multiple video lessons', steps:'1. View course Basic Info or curriculum summary', expected:'Total duration summed from all lesson durations shown', priority:'Medium', type:'Positive' },
      { id:'CC-104', name:'Curriculum accessible only to authenticated users', pre:'No auth', steps:'1. Call GET /api/.../courses/{id}/curriculum/ without token', expected:'401 Unauthorized', priority:'Critical', type:'Security' },
      { id:'CC-105', name:'Instructor cannot delete lessons from a course not assigned to them', pre:'Logged in as instructor; different course', steps:'1. Call DELETE /api/.../lessons/{lesson_id}/ for another course\'s lesson', expected:'403 Forbidden', priority:'Critical', type:'Security' },
      { id:'CC-106', name:'Curriculum saves lesson order to database on reorder', pre:'Lessons reordered via drag', steps:'1. Drag to reorder\n2. Refresh page\n3. Observe order', expected:'Order persists after refresh; not just client-side state', priority:'High', type:'Positive' },
      { id:'CC-107', name:'Preview lesson as learner from curriculum builder', pre:'Admin on curriculum tab', steps:'1. Click "Preview" on a lesson', expected:'Lesson preview opens as a learner would see it; without course enrollment context', priority:'Medium', type:'Positive' },
      { id:'CC-108', name:'Curriculum tab shows lesson type icons clearly', pre:'Multiple lesson types in curriculum', steps:'1. View curriculum list', expected:'Video, PDF, Quiz, Text, Audio, Embed, SCORM each have distinct icons', priority:'Medium', type:'UI/UX' },
      { id:'CC-109', name:'Curriculum drag-and-drop is keyboard accessible', pre:'Curriculum open', steps:'1. Focus a lesson using Tab\n2. Use keyboard to move it up/down (Space + Arrow)', expected:'Lesson reorderable via keyboard; accessibility requirement', priority:'Low', type:'UI/UX' },
      { id:'CC-110', name:'Cross-section lesson move via drag', pre:'Lessons in Section A; Section B exists', steps:'1. Drag lesson from Section A to Section B', expected:'Lesson moved between sections; count updates on both', priority:'Medium', type:'Positive' },
    ]
  }
];
