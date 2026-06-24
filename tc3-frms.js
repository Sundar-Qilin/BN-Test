module.exports = [
  {
    code:'FRMS-CAT',title:'Forums — Category Management',cases:[
      {id:'FC-001',name:'Forum categories list loads with name, thread count, visibility',pre:'Logged in as admin; forums configured',steps:'1. Click Forums in sidebar\n2. Observe category list',expected:'Table/tree: category name, description, thread count, visibility (public/private/org-only), display order',priority:'Critical',type:'Positive'},
      {id:'FC-002',name:'Create forum category — required fields filled',pre:'Forums page; Create Category',steps:'1. Enter name "General Discussion"\n2. Set description\n3. Set visibility "Public"\n4. Save',expected:'Category created; appears in forum list; order assigned',priority:'Critical',type:'Positive'},
      {id:'FC-003',name:'Category name required — blank fails',pre:'Create category form',steps:'1. Leave name blank\n2. Save',expected:'Required field error on name',priority:'High',type:'Validation'},
      {id:'FC-004',name:'Duplicate category name rejected',pre:'Category "General" exists',steps:'1. Create another "General"\n2. Save',expected:'Error: "Category with this name already exists"',priority:'High',type:'Validation'},
      {id:'FC-005',name:'Set category visibility — org only (restricted)',pre:'Create category',steps:'1. Set visibility "Org Members Only"\n2. Save',expected:'Only authenticated org members see this category; public/guest cannot',priority:'High',type:'Positive'},
      {id:'FC-006',name:'Set category visibility — div only (division restricted)',pre:'Create category',steps:'1. Set visibility "Division Only"\n2. Select division\n3. Save',expected:'Only that division\'s members see the category',priority:'High',type:'Positive'},
      {id:'FC-007',name:'Create sub-category under a parent',pre:'Parent category exists',steps:'1. Create category\n2. Set parent to existing category\n3. Save',expected:'Sub-category appears nested under parent in forum tree',priority:'High',type:'Positive'},
      {id:'FC-008',name:'Reorder categories via drag-and-drop or up/down',pre:'Multiple categories',steps:'1. Drag category 3 to position 1',expected:'Display order updated; learner-facing forum reflects new order',priority:'Medium',type:'Positive'},
      {id:'FC-009',name:'Edit category — change name',pre:'Category exists; edit',steps:'1. Change name\n2. Save',expected:'Name updated in forum; existing threads retain category association',priority:'High',type:'Positive'},
      {id:'FC-010',name:'XSS in category name sanitized',pre:'Create category',steps:'1. Enter <script>alert(1)</script> as name\n2. Save',expected:'Script stripped; rendered as literal text',priority:'Critical',type:'Security'},
      {id:'FC-011',name:'Delete empty category with confirmation',pre:'Category with 0 threads',steps:'1. Delete\n2. Confirm',expected:'Category deleted',priority:'Medium',type:'Positive'},
      {id:'FC-012',name:'Delete category with threads — warns and offers move or delete',pre:'Category has 25 threads',steps:'1. Click Delete',expected:'Warning with options: Move all threads to another category, or Delete all threads',priority:'High',type:'Negative'},
      {id:'FC-013',name:'Toggle category to allow or prevent learner posts',pre:'Category settings',steps:'1. Toggle "Allow Learner Posts" off\n2. Save',expected:'Learners can read but not create new threads in this category',priority:'High',type:'Positive'},
      {id:'FC-014',name:'Set category as announcement-only (admin posts only)',pre:'Category settings',steps:'1. Toggle "Announcements Only"\n2. Save',expected:'Only admins and instructors can post; learners read-only',priority:'High',type:'Positive'},
      {id:'FC-015',name:'Org_admin cannot create global/platform-wide forum categories',pre:'Logged in as org_admin',steps:'1. Try to create category with visibility "All Platforms"',expected:'Option not available; org_admin limited to org-scoped categories',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'FRMS-THRD',title:'Forums — Thread Management',cases:[
      {id:'FT-001',name:'Thread list within category loads with title, author, replies, last activity',pre:'Click category; threads exist',steps:'1. Open forum category\n2. Observe thread list',expected:'List: thread title, author avatar+name, reply count, views, last reply timestamp, pinned/locked badges',priority:'Critical',type:'Positive'},
      {id:'FT-002',name:'Pin thread — stays at top of category',pre:'Thread in category; admin logged in',steps:'1. Click Pin on a thread\n2. Observe list',expected:'Thread moved to top with Pinned badge; remains at top regardless of latest activity',priority:'High',type:'Positive'},
      {id:'FT-003',name:'Unpin thread — returns to chronological position',pre:'Pinned thread',steps:'1. Click Unpin',expected:'Thread loses Pinned badge; returns to normal sort position',priority:'Medium',type:'Positive'},
      {id:'FT-004',name:'Lock thread — prevents new replies',pre:'Thread in category',steps:'1. Click Lock on thread\n2. Log in as learner\n3. Try to reply',expected:'Thread shows Locked badge; reply form disabled/hidden; message "This thread is locked"',priority:'High',type:'Positive'},
      {id:'FT-005',name:'Unlock thread — re-enables replies',pre:'Locked thread; admin',steps:'1. Click Unlock',expected:'Lock removed; learners can reply again',priority:'Medium',type:'Positive'},
      {id:'FT-006',name:'Move thread to another category',pre:'Thread in Category A',steps:'1. Click Move Thread\n2. Select Category B\n3. Confirm',expected:'Thread moved to Category B; no longer in A; original URL may redirect',priority:'High',type:'Positive'},
      {id:'FT-007',name:'Delete thread with confirmation',pre:'Thread with replies',steps:'1. Click Delete\n2. Confirm',expected:'Thread and all its replies deleted permanently',priority:'High',type:'Positive'},
      {id:'FT-008',name:'Thread title length — 500 chars accepted',pre:'Create/edit thread',steps:'1. Enter 500-char title\n2. Save',expected:'Saved successfully',priority:'Low',type:'Boundary'},
      {id:'FT-009',name:'Thread title blank fails',pre:'Create thread form',steps:'1. Leave title blank\n2. Post',expected:'Required field error',priority:'High',type:'Validation'},
      {id:'FT-010',name:'Thread body blank fails',pre:'Create thread form',steps:'1. Leave body blank\n2. Post',expected:'Required field error',priority:'High',type:'Validation'},
      {id:'FT-011',name:'XSS in thread body sanitized',pre:'Thread composer',steps:'1. Enter <script>alert(1)</script> in body\n2. Post',expected:'Script stripped; rendered as safe text',priority:'Critical',type:'Security'},
      {id:'FT-012',name:'Stored XSS via image src in thread body',pre:'Thread composer',steps:'1. Post <img src=x onerror=alert(1)>\n2. View thread',expected:'onerror attribute stripped; no XSS possible',priority:'Critical',type:'Security'},
      {id:'FT-013',name:'Thread pagination — load more or page navigation',pre:'Thread with 50+ replies',steps:'1. Open thread\n2. Click next page or Load More',expected:'Next set of replies loads',priority:'Medium',type:'Positive'},
      {id:'FT-014',name:'Search within forum finds threads by keyword',pre:'Forum search bar',steps:'1. Enter keyword present in thread title/body',expected:'Matching threads shown with highlighted matches',priority:'High',type:'Positive'},
      {id:'FT-015',name:'Mark thread as "Best Answer" designates a reply',pre:'Thread with replies; admin or thread author',steps:'1. Click "Mark as Answer" on a reply',expected:'Reply highlighted as Best Answer at top of thread',priority:'Medium',type:'Positive'},
      {id:'FT-016',name:'Spam thread — flag for moderation',pre:'Thread in forum',steps:'1. Click Flag/Report on thread\n2. Select reason\n3. Submit',expected:'Thread flagged; appears in moderation queue; count increments',priority:'High',type:'Positive'},
      {id:'FT-017',name:'Thread view count increments on each unique view',pre:'Thread in forum',steps:'1. Open thread as learner\n2. Open as different learner',expected:'View count increments with each unique user view',priority:'Low',type:'Positive'},
      {id:'FT-018',name:'Learner cannot delete another learner\'s thread',pre:'Learner A tries to delete Learner B\'s thread',steps:'1. Try to delete via UI or API DELETE',expected:'403 Forbidden; only admin or thread author can delete own thread',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'FRMS-RPLY',title:'Forums — Reply & Moderation',cases:[
      {id:'FR-001',name:'Reply to thread saves and displays in chronological order',pre:'Thread open; user logged in',steps:'1. Type reply text\n2. Click Post\n3. Observe reply list',expected:'Reply appears at bottom with author, timestamp, content',priority:'Critical',type:'Positive'},
      {id:'FR-002',name:'Reply with empty body fails',pre:'Reply form',steps:'1. Leave body blank\n2. Post',expected:'Required field error',priority:'High',type:'Validation'},
      {id:'FR-003',name:'Reply with XSS attempt sanitized',pre:'Reply form',steps:'1. Enter <script>alert(1)</script>\n2. Post',expected:'Script stripped; rendered as safe text',priority:'Critical',type:'Security'},
      {id:'FR-004',name:'Edit own reply',pre:'User has a reply; within edit window',steps:'1. Click Edit on own reply\n2. Modify text\n3. Save',expected:'Reply updated; "(edited)" tag shown',priority:'Medium',type:'Positive'},
      {id:'FR-005',name:'Delete own reply with confirmation',pre:'User has a reply',steps:'1. Click Delete\n2. Confirm',expected:'Reply deleted; placeholder "[reply deleted]" shown or removed',priority:'Medium',type:'Positive'},
      {id:'FR-006',name:'Admin can edit any reply',pre:'Admin logged in; reply by learner',steps:'1. Click Edit on learner reply\n2. Modify\n3. Save',expected:'Reply updated with "(edited by admin)" note',priority:'High',type:'Positive'},
      {id:'FR-007',name:'Admin can delete any reply',pre:'Admin logged in; any reply',steps:'1. Click Delete on any reply\n2. Confirm',expected:'Reply deleted',priority:'High',type:'Positive'},
      {id:'FR-008',name:'Reply to a reply (nested/quoted)',pre:'Reply exists; nested reply enabled',steps:'1. Click Reply on an existing reply\n2. Post',expected:'Nested reply shown indented under parent; "@author" attribution shown',priority:'Medium',type:'Positive'},
      {id:'FR-009',name:'Quote reply includes original text in reply form',pre:'Reply form; Quote button on reply',steps:'1. Click Quote on a reply',expected:'Reply form pre-filled with quoted text block; user adds response below',priority:'Medium',type:'Positive'},
      {id:'FR-010',name:'Like/upvote a reply',pre:'Forum with like feature',steps:'1. Click Like on a reply',expected:'Like count increments; user cannot like again until unlike',priority:'Low',type:'Positive'},
      {id:'FR-011',name:'Unlike a previously liked reply',pre:'Reply already liked by user',steps:'1. Click Like again',expected:'Like count decrements; user\'s like removed',priority:'Low',type:'Positive'},
      {id:'FR-012',name:'Flag reply for moderation',pre:'Reply in thread',steps:'1. Click Flag on reply\n2. Select reason\n3. Submit',expected:'Reply flagged; appears in moderation queue',priority:'High',type:'Positive'},
    ]
  },
  {
    code:'FRMS-SRCH',title:'Forums — Search & Navigation',cases:[
      {id:'FS-001',name:'Global forum search finds threads by title keyword',pre:'Forum search bar',steps:'1. Enter keyword in search\n2. Press Enter',expected:'Threads matching keyword in title shown with category, author, date',priority:'High',type:'Positive'},
      {id:'FS-002',name:'Global forum search finds threads by body keyword',pre:'Forum search',steps:'1. Search for keyword only in thread body (not title)',expected:'Threads with body match shown',priority:'High',type:'Positive'},
      {id:'FS-003',name:'Search returns no results — shows empty state',pre:'Forum search',steps:'1. Search "ZZNONE999"',expected:'"No threads found" empty state',priority:'Medium',type:'Negative'},
      {id:'FS-004',name:'Search respects category visibility (private categories excluded)',pre:'Private category exists; logged out user',steps:'1. Search for term only in private category\n2. Check results',expected:'Private category threads not returned to unauthorized users',priority:'Critical',type:'Security'},
      {id:'FS-005',name:'Filter search results by category',pre:'Search results',steps:'1. Search term\n2. Filter by specific category',expected:'Results narrowed to selected category',priority:'Medium',type:'Positive'},
      {id:'FS-006',name:'Filter search results by date range',pre:'Search results',steps:'1. Apply date filter "Last 30 Days"',expected:'Only threads posted in last 30 days shown',priority:'Medium',type:'Positive'},
      {id:'FS-007',name:'Forum breadcrumb navigation — home > category > thread',pre:'Deep in a thread',steps:'1. Observe breadcrumb\n2. Click each breadcrumb level',expected:'Breadcrumbs accurately show hierarchy; each link navigates to that level',priority:'Medium',type:'UI/UX'},
      {id:'FS-008',name:'Forum notification subscription — notify on new replies',pre:'Thread open; Subscribe button',steps:'1. Click Subscribe to thread\n2. Another user replies\n3. Check email',expected:'Subscriber receives email notification of new reply',priority:'Medium',type:'Positive'},
      {id:'FS-009',name:'Unsubscribe from thread notifications',pre:'Subscribed to thread',steps:'1. Click Unsubscribe',expected:'No further notifications for new replies',priority:'Medium',type:'Positive'},
      {id:'FS-010',name:'SQL injection in search input handled safely',pre:'Forum search',steps:'1. Enter "\' OR 1=1--" in search field\n2. Submit',expected:'Search treated as literal string; no SQL error; no data leak',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'FRMS-MODS',title:'Forums — Moderator Management',cases:[
      {id:'FM-001',name:'Assign forum moderator role to a user',pre:'Admin on forum settings',steps:'1. Open forum category settings\n2. Add user as moderator\n3. Save',expected:'User gets moderator permissions for that forum category (pin, lock, delete threads)',priority:'High',type:'Positive'},
      {id:'FM-002',name:'Forum moderator can pin threads in assigned category',pre:'Moderator assigned to category',steps:'1. Log in as forum moderator\n2. Pin a thread in own category',expected:'Thread pinned successfully',priority:'High',type:'Positive'},
      {id:'FM-003',name:'Forum moderator cannot moderate in other categories',pre:'Moderator assigned to Category A only',steps:'1. Try to pin/delete in Category B',expected:'403 Forbidden or button not visible',priority:'Critical',type:'Security'},
      {id:'FM-004',name:'Remove forum moderator role from user',pre:'User is forum moderator',steps:'1. Remove moderator role\n2. Save',expected:'User loses moderator permissions; reverts to learner-level access',priority:'High',type:'Positive'},
      {id:'FM-005',name:'Forum statistics per category shown to admin',pre:'Admin on forum management',steps:'1. View category stats',expected:'Per-category: thread count, reply count, unique contributors, last activity date',priority:'Medium',type:'Positive'},
      {id:'FM-006',name:'Enable/disable entire forum per org',pre:'Admin on forum settings',steps:'1. Toggle "Enable Forums" off\n2. Save',expected:'Forum section removed from learner portal; existing data preserved',priority:'High',type:'Positive'},
      {id:'FM-007',name:'Anonymous posting toggle per category',pre:'Category settings',steps:'1. Toggle "Allow Anonymous Posts"\n2. Save',expected:'Learners can post without name displayed; admin can still see identity',priority:'Medium',type:'Positive'},
    ]
  },
];
