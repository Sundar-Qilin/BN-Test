module.exports = [
  {
    code:'DIVS-LIST',title:'Divisions & Access — List Page',cases:[
      {id:'DL-001',name:'Divisions list loads with name, org, user count, role count',pre:'Logged in as super_admin; divisions exist',steps:'1. Click "Divisions & Access" in sidebar\n2. Observe table',expected:'Table: division name, parent org, user count, created date, status, actions',priority:'Critical',type:'Positive'},
      {id:'DL-002',name:'Filter divisions by parent org',pre:'Multiple orgs with divisions',steps:'1. Select an org from the filter dropdown',expected:'Only divisions belonging to that org listed',priority:'High',type:'Positive'},
      {id:'DL-003',name:'Search divisions by name',pre:'Multiple divisions',steps:'1. Enter partial division name',expected:'Matching divisions shown; others hidden',priority:'High',type:'Positive'},
      {id:'DL-004',name:'Search with no match shows empty state',pre:'Divisions list',steps:'1. Search "ZZZNO"',expected:'"No divisions found" empty state; no crash',priority:'Medium',type:'Negative'},
      {id:'DL-005',name:'Sort divisions by name A-Z',pre:'Divisions list',steps:'1. Click Name header',expected:'Alphabetical order ascending',priority:'Low',type:'Positive'},
      {id:'DL-006',name:'Sort divisions by user count',pre:'Divisions list',steps:'1. Click Users column header',expected:'Sorted by user count',priority:'Low',type:'Positive'},
      {id:'DL-007',name:'Pagination loads next page of divisions',pre:'More divisions than page size',steps:'1. Click Next page',expected:'Next set of divisions shown; page indicator updates',priority:'Medium',type:'Positive'},
      {id:'DL-008',name:'Click division name opens division detail',pre:'Division in list',steps:'1. Click division name',expected:'Division detail page opens with tabs: Info, Members, Courses, Access Control',priority:'High',type:'Positive'},
      {id:'DL-009',name:'Org_admin sees only own org divisions',pre:'Logged in as org_admin',steps:'1. Open Divisions & Access page',expected:'Only divisions within own org visible; cross-org divisions hidden',priority:'Critical',type:'Security'},
      {id:'DL-010',name:'Division list is empty for new org',pre:'New org with no divisions',steps:'1. Open Divisions list with new org filter',expected:'"No divisions" empty state with Create button',priority:'Low',type:'Negative'},
    ]
  },
  {
    code:'DIVS-FORM',title:'Divisions & Access — Create & Edit',cases:[
      {id:'DF-001',name:'Create division — all required fields filled saves successfully',pre:'On Divisions list; Create Division button clicked',steps:'1. Enter name "Engineering"\n2. Select parent org\n3. Add description\n4. Click Save',expected:'Division created; redirected to detail; success toast',priority:'Critical',type:'Positive'},
      {id:'DF-002',name:'Create division — name required field blank fails',pre:'Create division form',steps:'1. Leave name blank\n2. Save',expected:'Required field error on name',priority:'Critical',type:'Validation'},
      {id:'DF-003',name:'Create division — parent org required if mandatory',pre:'Create form; org field',steps:'1. Leave parent org unselected\n2. Save',expected:'Required field error on org',priority:'High',type:'Validation'},
      {id:'DF-004',name:'Duplicate division name within same org rejected',pre:'Division "Engineering" exists in Org A',steps:'1. Create "Engineering" in same Org A',expected:'Error: "A division with this name already exists in this organisation"',priority:'High',type:'Validation'},
      {id:'DF-005',name:'Duplicate name in different org allowed',pre:'Division "Engineering" in Org A',steps:'1. Create "Engineering" in Org B',expected:'Created successfully; names can repeat across orgs',priority:'Medium',type:'Positive'},
      {id:'DF-006',name:'Division name max 100 chars accepted',pre:'Create form',steps:'1. Enter 100-char name\n2. Save',expected:'Saved successfully',priority:'Low',type:'Boundary'},
      {id:'DF-007',name:'Division name 101 chars rejected',pre:'Create form',steps:'1. Enter 101-char name',expected:'Input capped at 100 or validation error',priority:'Low',type:'Boundary'},
      {id:'DF-008',name:'Edit division — change name saves and updates list',pre:'Division exists; edit page',steps:'1. Change name\n2. Save',expected:'Name updated in list and detail header',priority:'High',type:'Positive'},
      {id:'DF-009',name:'Edit division — change parent org moves division',pre:'Division in Org A; edit page',steps:'1. Change parent org to Org B\n2. Save',expected:'Division now appears under Org B; members\' org association updated',priority:'High',type:'Positive'},
      {id:'DF-010',name:'Delete division — confirmation dialog shown',pre:'Division with no members',steps:'1. Click Delete\n2. Observe dialog',expected:'Confirmation dialog: "Delete division? This cannot be undone."',priority:'High',type:'UI/UX'},
      {id:'DF-011',name:'Delete division — confirms and removes',pre:'Division with no members; confirm clicked',steps:'1. Click Confirm in delete dialog',expected:'Division deleted; removed from list; success toast',priority:'High',type:'Positive'},
      {id:'DF-012',name:'Delete division with active members — warn about reassignment',pre:'Division has 5 members',steps:'1. Click Delete\n2. Observe warning',expected:'Warning: "5 members will lose their division assignment. Reassign them first or they will be unassigned."',priority:'High',type:'Negative'},
      {id:'DF-013',name:'IDOR — org_admin cannot create division in another org via API',pre:'Logged in as org_admin',steps:'1. POST to create division with another org\'s ID in payload',expected:'403 Forbidden',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'DIVS-MEMBERS',title:'Divisions & Access — Members Tab',cases:[
      {id:'DM-001',name:'Division members tab shows all users with role in this division',pre:'Division detail; members exist',steps:'1. Click Members tab on division detail',expected:'Table: name, email, role, status, last active',priority:'Critical',type:'Positive'},
      {id:'DM-002',name:'Search division members by name or email',pre:'Members tab; multiple users',steps:'1. Type name in search',expected:'Filtered results shown',priority:'High',type:'Positive'},
      {id:'DM-003',name:'Filter members by role within division',pre:'Members tab; mixed roles',steps:'1. Select "learner" filter',expected:'Only learners in this division shown',priority:'High',type:'Positive'},
      {id:'DM-004',name:'Add existing user to division with role',pre:'Members tab; user not in division',steps:'1. Click Add Member\n2. Search user\n3. Assign role (e.g., learner)\n4. Confirm',expected:'User added to division with selected role',priority:'High',type:'Positive'},
      {id:'DM-005',name:'Add user already in division rejected',pre:'User already in division',steps:'1. Try to add same user\n2. Confirm',expected:'Error: "User is already a member of this division"',priority:'High',type:'Validation'},
      {id:'DM-006',name:'Assign user to division — no role selected fails',pre:'Add member dialog',steps:'1. Select user\n2. Skip role\n3. Confirm',expected:'Required field error on role',priority:'High',type:'Validation'},
      {id:'DM-007',name:'Change member role in division',pre:'Member has learner role',steps:'1. Click edit on member\n2. Change role to instructor\n3. Save',expected:'Role updated; member gets instructor permissions in division',priority:'High',type:'Positive'},
      {id:'DM-008',name:'Remove member from division with confirmation',pre:'Member exists in division',steps:'1. Click Remove\n2. Confirm',expected:'Member removed; loses division-specific permissions',priority:'High',type:'Positive'},
      {id:'DM-009',name:'Bulk import members from CSV',pre:'Members tab; Import button',steps:'1. Click Import\n2. Upload CSV with email, role columns\n3. Confirm',expected:'All valid CSV rows added; invalid rows shown in error report',priority:'High',type:'Positive'},
      {id:'DM-010',name:'CSV import with invalid email rows — partial success',pre:'CSV with mix of valid and invalid emails',steps:'1. Import CSV\n2. Observe result',expected:'Valid rows added; invalid rows listed in error report; total success/fail counts shown',priority:'High',type:'Negative'},
      {id:'DM-011',name:'CSV import with wrong column headers fails',pre:'CSV missing required headers',steps:'1. Import malformed CSV',expected:'Error: "Invalid file format. Expected columns: email, role"',priority:'Medium',type:'Validation'},
      {id:'DM-012',name:'Export division members as CSV',pre:'Members tab',steps:'1. Click Export',expected:'CSV downloaded with name, email, role, status',priority:'Medium',type:'Positive'},
      {id:'DM-013',name:'Div_admin can only manage their own division members',pre:'Logged in as div_admin',steps:'1. Try to access another division\'s members via API',expected:'403 Forbidden; can only manage own division',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'DIVS-ACCESS',title:'Divisions & Access — Access Control Matrix',cases:[
      {id:'DA-001',name:'Access Control tab loads role-permission matrix',pre:'Division detail; Access Control tab',steps:'1. Click Access Control tab',expected:'Matrix showing roles (learner, instructor, div_admin) and permissions (view, enroll, create, manage) as toggles',priority:'High',type:'Positive'},
      {id:'DA-002',name:'Enable course creation permission for instructors in division',pre:'Access Control; instructor role row',steps:'1. Toggle "Create Courses" on for instructor\n2. Save',expected:'Instructors in this division can create courses; others cannot',priority:'High',type:'Positive'},
      {id:'DA-003',name:'Disable enrollment for learners in division',pre:'Access Control; learner row',steps:'1. Toggle "Self-Enroll" off for learner\n2. Save',expected:'Learners cannot self-enroll in courses in this division; must be manually enrolled',priority:'High',type:'Positive'},
      {id:'DA-004',name:'Access control changes take effect on next login/action',pre:'Changed permission',steps:'1. Change a permission\n2. Log in as affected user\n3. Try the restricted action',expected:'New permission applied; restricted action blocked or allowed as configured',priority:'High',type:'Positive'},
      {id:'DA-005',name:'Course Access tab — restrict which courses are visible to division',pre:'Division detail; Courses tab or Course Visibility setting',steps:'1. Open course visibility settings\n2. Restrict to specific course IDs',expected:'Division members can only see those courses; others hidden',priority:'High',type:'Positive'},
      {id:'DA-006',name:'Course access — add course to division whitelist',pre:'Course visibility restricted',steps:'1. Add new course to allowed list\n2. Log in as learner in division',expected:'Newly added course visible to learner',priority:'Medium',type:'Positive'},
      {id:'DA-007',name:'Course access — remove course from division whitelist',pre:'Course whitelisted',steps:'1. Remove course from allowed list\n2. Log in as learner',expected:'Course no longer visible to learner in this division',priority:'Medium',type:'Positive'},
      {id:'DA-008',name:'Inheritance — division inherits org-level defaults if not overridden',pre:'Org has default permissions; division has no overrides',steps:'1. View division\'s Access Control tab',expected:'Shows inherited org defaults with indication that they are inherited',priority:'Medium',type:'Positive'},
      {id:'DA-009',name:'Override inheritance for specific division permission',pre:'Division inheriting from org',steps:'1. Change a permission in the division\n2. Save',expected:'Division now uses its own value; no longer inherits for that permission',priority:'Medium',type:'Positive'},
      {id:'DA-010',name:'Org_admin cannot modify super_admin permission level',pre:'Access Control; editing roles',steps:'1. Try to change permissions for super_admin role',expected:'Super_admin permissions not editable here; grayed out or hidden',priority:'Critical',type:'Security'},
    ]
  },
];
