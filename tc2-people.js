// ORGS + DIVS + USRS + INVT — 185 cases
module.exports = [
  {
    code: 'ORGS',
    title: 'Organisations Management',
    cases: [
      // ── List Page ──────────────────────────────────────────────────────────
      { id:'ORGS-001', name:'Organisation list page loads with all orgs visible', pre:'Logged in as super_admin; orgs exist', steps:'1. Click Organizations in sidebar\n2. Observe list', expected:'Table/card list of all organisations with name, status, user count visible', priority:'Critical', type:'Positive' },
      { id:'ORGS-002', name:'Search by organisation name filters list', pre:'Multiple orgs exist', steps:'1. Type partial org name in search box\n2. Observe filtered results', expected:'Only matching organisations shown; non-matching hidden', priority:'High', type:'Positive' },
      { id:'ORGS-003', name:'Empty search returns full list', pre:'Search box has text', steps:'1. Clear search box', expected:'All organisations listed again', priority:'Medium', type:'Positive' },
      { id:'ORGS-004', name:'Search with no matches shows empty state', pre:'On Orgs list', steps:'1. Search for "ZZZNOMATCH999"', expected:'"No results" or empty state message shown; no crash', priority:'Medium', type:'Negative' },
      { id:'ORGS-005', name:'Pagination works on org list', pre:'More than page-size orgs exist', steps:'1. Observe pagination controls\n2. Click Next page', expected:'Second page of orgs loads; page indicator updates', priority:'Medium', type:'Positive' },
      { id:'ORGS-006', name:'Org list shows active and inactive status badges', pre:'Orgs with different statuses exist', steps:'1. Open orgs list', expected:'Active orgs show green badge; inactive orgs show grey/red badge', priority:'Medium', type:'UI/UX' },
      { id:'ORGS-007', name:'Org list accessible to super_admin only; org_admin cannot access other orgs', pre:'Logged in as org_admin', steps:'1. Access Organisations list\n2. Check if other orgs listed', expected:'org_admin sees only their own org; cannot see or access other orgs', priority:'Critical', type:'Security' },

      // ── Create Organisation ────────────────────────────────────────────────
      { id:'ORGS-008', name:'Create Organisation button opens creation form', pre:'Logged in as super_admin on Orgs list', steps:'1. Click "Create Organisation" or "+ New" button', expected:'Form or modal opens with fields: Name, Slug/Domain, Logo, Description, Status', priority:'High', type:'Positive' },
      { id:'ORGS-009', name:'Create org with all valid fields saves successfully', pre:'Create org form open', steps:'1. Enter Name: "Test Org Alpha"\n2. Enter unique slug/subdomain\n3. Upload valid logo\n4. Enter description\n5. Set status Active\n6. Save', expected:'Org created; appears in list with correct data', priority:'Critical', type:'Positive' },
      { id:'ORGS-010', name:'Create org with name only (minimal required fields) succeeds', pre:'Create org form open', steps:'1. Enter Name only\n2. Leave optional fields blank\n3. Save', expected:'Org created if name is only required field; optional fields default correctly', priority:'High', type:'Positive' },
      { id:'ORGS-011', name:'Create org with blank name shows validation error', pre:'Create org form open', steps:'1. Leave Name blank\n2. Click Save', expected:'Required field error on Name; form not submitted', priority:'High', type:'Validation' },
      { id:'ORGS-012', name:'Create org with duplicate name shows error', pre:'Org with same name already exists', steps:'1. Enter duplicate org name\n2. Save', expected:'Error: "Organisation with this name already exists"', priority:'High', type:'Validation' },
      { id:'ORGS-013', name:'Org name max length boundary — 255 chars accepted', pre:'Create org form', steps:'1. Enter exactly 255-character name\n2. Save', expected:'Saved successfully (or appropriate max enforced)', priority:'Medium', type:'Boundary' },
      { id:'ORGS-014', name:'Org name exceeds max length rejected', pre:'Create org form', steps:'1. Enter 256-character name\n2. Save', expected:'Validation error or input truncated at max', priority:'Medium', type:'Boundary' },
      { id:'ORGS-015', name:'Logo upload — valid PNG under size limit accepted', pre:'Create org form', steps:'1. Upload 200KB PNG logo\n2. Save', expected:'Logo uploaded and previewed; org saved with logo', priority:'High', type:'Positive' },
      { id:'ORGS-016', name:'Logo upload — oversized file rejected', pre:'Create org form', steps:'1. Upload 10MB PNG\n2. Try to save', expected:'Error: file exceeds size limit; org not saved', priority:'High', type:'Validation' },
      { id:'ORGS-017', name:'Logo upload — invalid file type (PDF) rejected', pre:'Create org form', steps:'1. Upload a PDF as logo\n2. Try to save', expected:'Error: only image files accepted (PNG, JPG, SVG)', priority:'High', type:'Validation' },
      { id:'ORGS-018', name:'Create org with SVG logo containing XSS rejected or sanitized', pre:'Create org form', steps:'1. Upload SVG file with <script>alert(1)</script> embedded\n2. Save', expected:'SVG rejected or sanitized; script does not execute when logo renders', priority:'Critical', type:'Security' },

      // ── Edit Organisation ──────────────────────────────────────────────────
      { id:'ORGS-019', name:'Edit org name updates successfully', pre:'Org exists; on org detail/edit view', steps:'1. Click Edit on existing org\n2. Change name to "Updated Org Name"\n3. Save', expected:'Org name updated in list and detail view', priority:'High', type:'Positive' },
      { id:'ORGS-020', name:'Edit org with blank name shows validation error', pre:'Edit org form open', steps:'1. Clear the name field\n2. Save', expected:'Validation error: name required', priority:'High', type:'Validation' },
      { id:'ORGS-021', name:'Replace org logo with new image', pre:'Org has existing logo; on edit form', steps:'1. Click logo area / replace\n2. Upload new image\n3. Save', expected:'New logo replaces old; updated immediately', priority:'Medium', type:'Positive' },
      { id:'ORGS-022', name:'Deactivate active organisation', pre:'Active org exists', steps:'1. Open org edit\n2. Set status to Inactive\n3. Save', expected:'Org marked inactive; users in that org may lose access per business rules', priority:'High', type:'Positive' },
      { id:'ORGS-023', name:'IDOR — org_admin cannot edit another org by manipulating URL', pre:'Logged in as org_admin of Org A', steps:'1. Note URL pattern for editing your own org\n2. Change org ID to a different org ID in URL\n3. Attempt to edit', expected:'403 Forbidden or redirected; another org\'s data not modified', priority:'Critical', type:'Security' },

      // ── Org Admin Assignment ───────────────────────────────────────────────
      { id:'ORGS-024', name:'Assign org_admin role to a user within org', pre:'Org detail open; users exist', steps:'1. Open org detail page\n2. Find admin assignment section\n3. Search and select a user\n4. Assign org_admin role\n5. Save', expected:'User now listed as org admin; user gains org_admin permissions', priority:'High', type:'Positive' },
      { id:'ORGS-025', name:'Remove org_admin reverts user to standard role', pre:'User has org_admin role', steps:'1. Open org admin settings\n2. Remove the org_admin assignment\n3. Save', expected:'User loses org_admin access; reverted to previous role', priority:'High', type:'Positive' },
      { id:'ORGS-026', name:'Org with no admin can still be managed by super_admin', pre:'Org has no assigned admin', steps:'1. Open org; manage settings as super_admin', expected:'Super_admin can still edit org settings and assign admin', priority:'High', type:'Positive' },

      // ── Delete Organisation ────────────────────────────────────────────────
      { id:'ORGS-027', name:'Delete org requires confirmation dialog', pre:'Super_admin on org list/detail', steps:'1. Click Delete on an org\n2. Observe prompt', expected:'Confirmation dialog appears: "Are you sure? This will delete all data for this org."', priority:'High', type:'UI/UX' },
      { id:'ORGS-028', name:'Cancel delete confirmation does not delete org', pre:'Delete confirmation dialog open', steps:'1. Click Cancel', expected:'Dialog closes; org remains in list unchanged', priority:'High', type:'Positive' },
      { id:'ORGS-029', name:'Confirm delete removes org from list', pre:'Delete confirmation dialog open', steps:'1. Click Confirm/Delete\n2. Observe list', expected:'Org removed from list; success toast shown', priority:'High', type:'Positive' },
      { id:'ORGS-030', name:'Org admin cannot delete an organisation', pre:'Logged in as org_admin', steps:'1. Look for delete option on org detail\n2. Or call DELETE /api/.../org/{id}/', expected:'Delete option not visible; API returns 403', priority:'Critical', type:'Security' },
    ]
  },
  {
    code: 'DIVS',
    title: 'Divisions & Access Control',
    cases: [
      // ── List ───────────────────────────────────────────────────────────────
      { id:'DIVS-001', name:'Divisions list page loads all divisions', pre:'Logged in; divisions exist', steps:'1. Click Divisions & Access in sidebar', expected:'List of divisions shown with name, parent org, user count, status', priority:'Critical', type:'Positive' },
      { id:'DIVS-002', name:'Filter divisions by organisation', pre:'Multiple orgs with divisions exist', steps:'1. Select an org from filter dropdown\n2. Observe list', expected:'Only divisions belonging to selected org shown', priority:'High', type:'Positive' },
      { id:'DIVS-003', name:'Search divisions by name', pre:'Multiple divisions exist', steps:'1. Type partial name in search\n2. Observe', expected:'Matching divisions shown; others hidden', priority:'High', type:'Positive' },

      // ── Create Division ────────────────────────────────────────────────────
      { id:'DIVS-004', name:'Create new division with valid data', pre:'On divisions page', steps:'1. Click Create Division\n2. Enter name, select parent org, set status Active\n3. Save', expected:'Division created; appears in list under selected org', priority:'Critical', type:'Positive' },
      { id:'DIVS-005', name:'Create division without name shows validation error', pre:'Create division form', steps:'1. Leave name blank\n2. Save', expected:'Name required error shown', priority:'High', type:'Validation' },
      { id:'DIVS-006', name:'Create division without selecting org shows error', pre:'Create division form', steps:'1. Enter name but no org selected\n2. Save', expected:'Organisation required error', priority:'High', type:'Validation' },
      { id:'DIVS-007', name:'Duplicate division name within same org rejected', pre:'Division with same name exists in target org', steps:'1. Try to create same-name division in same org\n2. Save', expected:'Duplicate name error shown', priority:'Medium', type:'Validation' },
      { id:'DIVS-008', name:'Same division name in different org is allowed', pre:'Division name exists in Org A', steps:'1. Create division with same name in Org B', expected:'Created successfully; names are org-scoped', priority:'Medium', type:'Positive' },

      // ── Edit Division ──────────────────────────────────────────────────────
      { id:'DIVS-009', name:'Edit division name updates list and detail', pre:'Division exists', steps:'1. Click edit on division\n2. Change name\n3. Save', expected:'Name updated everywhere it appears', priority:'High', type:'Positive' },
      { id:'DIVS-010', name:'Move division to different org', pre:'Division belongs to Org A', steps:'1. Edit division\n2. Change parent org to Org B\n3. Save', expected:'Division re-assigned; users\' access may be affected', priority:'High', type:'Positive' },
      { id:'DIVS-011', name:'Deactivate division blocks div_admin access', pre:'Active division; div_admin assigned', steps:'1. Deactivate division\n2. Log in as div_admin\n3. Check access', expected:'div_admin cannot access deactivated division resources', priority:'High', type:'Negative' },

      // ── Role Assignments ───────────────────────────────────────────────────
      { id:'DIVS-012', name:'Assign div_admin role to user in division', pre:'Division detail open', steps:'1. Go to members/access tab in division\n2. Search for user\n3. Assign div_admin role\n4. Save', expected:'User gains div_admin permissions for this division', priority:'High', type:'Positive' },
      { id:'DIVS-013', name:'div_admin cannot manage users outside their division', pre:'Logged in as div_admin', steps:'1. Attempt to view or edit a user not in their division\n2. Or call API with another division\'s user ID', expected:'403 or access denied; no cross-division data', priority:'Critical', type:'Security' },
      { id:'DIVS-014', name:'Assign instructor role within division', pre:'Division detail open', steps:'1. Find user\n2. Assign instructor role\n3. Save', expected:'User gets instructor permissions; can manage courses in division', priority:'High', type:'Positive' },
      { id:'DIVS-015', name:'Remove user from division revokes division access', pre:'User is member of division', steps:'1. Remove user from division members list', expected:'User loses division-specific access immediately', priority:'High', type:'Positive' },
      { id:'DIVS-016', name:'Super_admin can manage all divisions across all orgs', pre:'Logged in as super_admin', steps:'1. Navigate to divisions list\n2. Edit any division from any org', expected:'Full access to all divisions without restriction', priority:'Critical', type:'Positive' },
      { id:'DIVS-017', name:'org_admin can only manage divisions in their org', pre:'Logged in as org_admin', steps:'1. Attempt to access division belonging to a different org\n2. Or via API call', expected:'403 Forbidden; no cross-org division access', priority:'Critical', type:'Security' },

      // ── Delete Division ────────────────────────────────────────────────────
      { id:'DIVS-018', name:'Delete division with confirmation removes it', pre:'Empty division exists', steps:'1. Click Delete\n2. Confirm dialog\n3. Confirm', expected:'Division removed from list', priority:'High', type:'Positive' },
      { id:'DIVS-019', name:'Delete division with active users warns or reassigns', pre:'Division has active members', steps:'1. Click Delete on division with users\n2. Observe warning', expected:'Warning shown about active members; option to reassign or confirm cascade delete', priority:'High', type:'Negative' },
      { id:'DIVS-020', name:'IDOR — div_admin cannot delete another division via API', pre:'Logged in as div_admin', steps:'1. Call DELETE /api/.../divisions/{other-division-id}/', expected:'403 Forbidden; division not deleted', priority:'Critical', type:'Security' },
    ]
  },
  {
    code: 'USRS',
    title: 'User Management',
    cases: [
      // ── List Page ──────────────────────────────────────────────────────────
      { id:'USRS-001', name:'Users list loads all users with correct columns', pre:'Logged in; users exist', steps:'1. Click Users in sidebar', expected:'Table shows Name, Email, Role, Organisation, Division, Status, Last Active columns', priority:'Critical', type:'Positive' },
      { id:'USRS-002', name:'Search by email filters user list', pre:'Multiple users', steps:'1. Enter partial email in search\n2. Observe', expected:'Only matching users shown', priority:'High', type:'Positive' },
      { id:'USRS-003', name:'Search by name filters user list', pre:'Multiple users', steps:'1. Enter partial first or last name\n2. Observe', expected:'Matching users shown', priority:'High', type:'Positive' },
      { id:'USRS-004', name:'Filter by role shows only users with that role', pre:'Users with different roles', steps:'1. Select "org_admin" from role filter\n2. Observe', expected:'Only org_admin users shown', priority:'High', type:'Positive' },
      { id:'USRS-005', name:'Filter by status shows only active users', pre:'Active and inactive users exist', steps:'1. Select "Active" from status filter', expected:'Only active users listed', priority:'High', type:'Positive' },
      { id:'USRS-006', name:'Filter by organisation shows only that org\'s users', pre:'Multi-org setup', steps:'1. Select specific org from filter', expected:'Only users belonging to that org listed', priority:'High', type:'Positive' },
      { id:'USRS-007', name:'Combine search + filter narrows results correctly', pre:'Many users', steps:'1. Enter search term + select role filter\n2. Observe', expected:'Only users matching both criteria shown', priority:'Medium', type:'Positive' },
      { id:'USRS-008', name:'Pagination on user list works correctly', pre:'More users than page size', steps:'1. Click Next page', expected:'Next set of users loads; total count shown', priority:'Medium', type:'Positive' },
      { id:'USRS-009', name:'Sort users by name A-Z', pre:'User list', steps:'1. Click Name column header', expected:'Users sorted alphabetically A-Z', priority:'Medium', type:'Positive' },
      { id:'USRS-010', name:'Sort users by date created', pre:'User list', steps:'1. Click Date Joined / Created column', expected:'Users sorted by registration date', priority:'Medium', type:'Positive' },
      { id:'USRS-011', name:'Org_admin sees only users in their org', pre:'Logged in as org_admin', steps:'1. Open Users page', expected:'Only users belonging to org_admin\'s org visible', priority:'Critical', type:'Security' },
      { id:'USRS-012', name:'Export users list to CSV', pre:'Users list', steps:'1. Click Export button\n2. Select CSV format', expected:'CSV downloaded with Name, Email, Role, Status, Organisation columns', priority:'Medium', type:'Positive' },

      // ── User Detail ────────────────────────────────────────────────────────
      { id:'USRS-013', name:'Clicking user row opens user detail page', pre:'User list loaded', steps:'1. Click on any user row or name', expected:'User detail page loads: profile info, role, org, courses enrolled, activity', priority:'High', type:'Positive' },
      { id:'USRS-014', name:'User detail shows enrolled courses', pre:'User has course enrollments', steps:'1. Open user detail\n2. Check courses section', expected:'List of courses user is enrolled in with progress % shown', priority:'High', type:'Positive' },
      { id:'USRS-015', name:'User detail shows last login date', pre:'User has previously logged in', steps:'1. Open user detail', expected:'Last login date/time displayed accurately', priority:'Medium', type:'Positive' },
      { id:'USRS-016', name:'IDOR — cannot access another user\'s detail by manipulating user ID in URL', pre:'Logged in as org_admin', steps:'1. Note current user detail URL (e.g., /users/123)\n2. Change 123 to ID of user in another org\n3. Observe', expected:'403 Forbidden or redirect; no cross-org user data exposed', priority:'Critical', type:'Security' },

      // ── Edit User ──────────────────────────────────────────────────────────
      { id:'USRS-017', name:'Edit user first name and last name', pre:'User detail open', steps:'1. Click Edit\n2. Change first name and last name\n3. Save', expected:'Name updated and reflected everywhere', priority:'High', type:'Positive' },
      { id:'USRS-018', name:'Edit user email to new unique email', pre:'Edit user form', steps:'1. Change email to new unique address\n2. Save', expected:'Email updated; user must verify new email if applicable', priority:'High', type:'Positive' },
      { id:'USRS-019', name:'Edit user email to already-used email fails', pre:'Edit user form', steps:'1. Enter an email that belongs to another user\n2. Save', expected:'Error: email already in use', priority:'High', type:'Validation' },
      { id:'USRS-020', name:'Edit user email to invalid format fails', pre:'Edit user form', steps:'1. Enter "notvalid@"\n2. Save', expected:'Validation error: invalid email format', priority:'High', type:'Validation' },
      { id:'USRS-021', name:'Change user role from instructor to org_admin', pre:'Edit user form; roles available', steps:'1. Change role dropdown\n2. Select org_admin\n3. Save', expected:'Role updated; user gains org_admin permissions on next login', priority:'High', type:'Positive' },
      { id:'USRS-022', name:'Edit user first name to blank fails validation', pre:'Edit user form', steps:'1. Clear first name field\n2. Save', expected:'Required field error', priority:'High', type:'Validation' },

      // ── Activate / Deactivate ──────────────────────────────────────────────
      { id:'USRS-023', name:'Deactivate active user prevents login', pre:'User is active', steps:'1. Toggle user to Inactive\n2. Confirm\n3. Have that user attempt login', expected:'Login rejected with inactive account message', priority:'Critical', type:'Positive' },
      { id:'USRS-024', name:'Reactivate inactive user restores login access', pre:'User is inactive', steps:'1. Toggle user to Active\n2. Confirm\n3. User logs in', expected:'Login succeeds', priority:'Critical', type:'Positive' },
      { id:'USRS-025', name:'Admin cannot deactivate their own account', pre:'Logged in as super_admin; viewing own profile', steps:'1. Attempt to set own status to inactive', expected:'Action blocked with warning: "Cannot deactivate your own account"', priority:'High', type:'Negative' },

      // ── Admin Password Reset ───────────────────────────────────────────────
      { id:'USRS-026', name:'Admin triggers password reset email for user', pre:'User detail open', steps:'1. Click "Reset Password" or "Send Reset Email"\n2. Confirm', expected:'Success message; user receives password reset email', priority:'High', type:'Positive' },
      { id:'USRS-027', name:'Reset password action not available for own account (use profile flow)', pre:'Viewing own user detail', steps:'1. Check for reset password option', expected:'Admin-triggered reset not applicable to self (uses forgot password instead)', priority:'Medium', type:'UI/UX' },

      // ── Bulk Operations ────────────────────────────────────────────────────
      { id:'USRS-028', name:'Select all users and bulk deactivate', pre:'User list; checkboxes available', steps:'1. Select all using header checkbox\n2. Choose bulk action "Deactivate"\n3. Confirm', expected:'All selected users deactivated; success toast', priority:'High', type:'Positive' },
      { id:'USRS-029', name:'Bulk export selected users to CSV', pre:'User list; select 5 users', steps:'1. Check 5 users\n2. Select "Export Selected"\n3. Download', expected:'CSV contains only the 5 selected users', priority:'Medium', type:'Positive' },
      { id:'USRS-030', name:'Bulk operation with zero selection shows error', pre:'User list; no users checked', steps:'1. Click bulk action without selecting users', expected:'Error: "Select at least one user"', priority:'Medium', type:'Validation' },

      // ── Delete User ────────────────────────────────────────────────────────
      { id:'USRS-031', name:'Delete user requires confirmation', pre:'User detail or list', steps:'1. Click Delete User\n2. Observe', expected:'Confirmation dialog with warning about data implications', priority:'High', type:'UI/UX' },
      { id:'USRS-032', name:'Confirmed delete removes user from system', pre:'Confirmation dialog', steps:'1. Click Confirm\n2. Check user list', expected:'User no longer in list; their data handled per privacy policy', priority:'High', type:'Positive' },
      { id:'USRS-033', name:'Super_admin account cannot be deleted', pre:'On super_admin user detail', steps:'1. Attempt to delete super_admin\n2. Or call DELETE /api/.../users/{super_admin_id}/', expected:'Action blocked; error: "Cannot delete super_admin account"', priority:'Critical', type:'Security' },

      // ── Profile / Security ─────────────────────────────────────────────────
      { id:'USRS-034', name:'Admin can view their own profile', pre:'Logged in', steps:'1. Click avatar/name in top-right\n2. Open My Profile', expected:'Profile page shows own name, email, role, account settings', priority:'High', type:'Positive' },
      { id:'USRS-035', name:'Admin can change their own password from profile', pre:'On profile settings', steps:'1. Enter current password\n2. Enter new password\n3. Confirm new password\n4. Save', expected:'Password changed; success message shown', priority:'High', type:'Positive' },
      { id:'USRS-036', name:'Wrong current password when changing password fails', pre:'Profile password change form', steps:'1. Enter wrong current password\n2. Submit', expected:'Error: "Current password is incorrect"', priority:'High', type:'Negative' },
      { id:'USRS-037', name:'Weak new password rejected on profile change', pre:'Profile password change form', steps:'1. Enter current password correctly\n2. Enter "password" as new password\n3. Submit', expected:'Validation error: password too weak', priority:'High', type:'Validation' },
    ]
  },
  {
    code: 'INVT',
    title: 'Invitations Management',
    cases: [
      // ── List ───────────────────────────────────────────────────────────────
      { id:'INVT-001', name:'Invitations list shows all pending invitations', pre:'Logged in; invitations sent', steps:'1. Click Invitees in sidebar', expected:'Table showing email, role, org, sent date, status (Pending/Accepted/Expired)', priority:'Critical', type:'Positive' },
      { id:'INVT-002', name:'Filter invitations by status — Pending only', pre:'Invitations in various states', steps:'1. Select "Pending" from status filter', expected:'Only pending invitations shown', priority:'High', type:'Positive' },
      { id:'INVT-003', name:'Filter invitations by Accepted', pre:'Some accepted invitations', steps:'1. Select "Accepted" from status filter', expected:'Only accepted invitations shown', priority:'Medium', type:'Positive' },
      { id:'INVT-004', name:'Search invitation by email', pre:'Multiple invitations', steps:'1. Enter partial email in search\n2. Observe', expected:'Matching invitation rows shown', priority:'High', type:'Positive' },

      // ── Send Invitation ────────────────────────────────────────────────────
      { id:'INVT-005', name:'Send invitation with valid email and role', pre:'On Invitations page', steps:'1. Click "Invite User" or "+ New Invitation"\n2. Enter valid email "newuser@test.com"\n3. Select role "instructor"\n4. Select org/division\n5. Send', expected:'Invitation created; invitation email sent; appears in list as Pending', priority:'Critical', type:'Positive' },
      { id:'INVT-006', name:'Invite with invalid email format rejected', pre:'Invite form open', steps:'1. Enter "invalidemail"\n2. Click Send', expected:'Validation error: invalid email format', priority:'High', type:'Validation' },
      { id:'INVT-007', name:'Invite with blank email rejected', pre:'Invite form open', steps:'1. Leave email blank\n2. Click Send', expected:'Required field error', priority:'High', type:'Validation' },
      { id:'INVT-008', name:'Invite an email that already has an account', pre:'User with that email already exists', steps:'1. Enter existing user\'s email\n2. Send', expected:'Error: "User with this email already exists"', priority:'High', type:'Negative' },
      { id:'INVT-009', name:'Invite with duplicate pending invitation for same email', pre:'Pending invitation exists for email@test.com', steps:'1. Try to invite email@test.com again', expected:'Error: "Invitation already pending for this email" or offer to resend', priority:'Medium', type:'Negative' },
      { id:'INVT-010', name:'Invite without selecting role shows validation error', pre:'Invite form', steps:'1. Enter valid email\n2. Leave role unselected\n3. Send', expected:'Role required validation error', priority:'High', type:'Validation' },
      { id:'INVT-011', name:'Invite with role higher than sender\'s own role is blocked', pre:'Logged in as org_admin', steps:'1. Attempt to invite with role "super_admin"', expected:'super_admin role not available in dropdown; or rejected with 403', priority:'Critical', type:'Security' },

      // ── Bulk Invite ────────────────────────────────────────────────────────
      { id:'INVT-012', name:'Bulk invite via CSV — valid CSV accepted', pre:'Valid CSV with email,role,org columns', steps:'1. Click "Bulk Invite" or CSV upload\n2. Upload valid CSV\n3. Submit', expected:'All valid rows processed; invitations sent; invalid rows reported', priority:'High', type:'Positive' },
      { id:'INVT-013', name:'Bulk invite CSV with invalid emails reports errors per row', pre:'CSV with some invalid emails', steps:'1. Upload CSV with mix of valid and invalid emails\n2. Submit', expected:'Valid invitations sent; each invalid row listed with reason; partial success', priority:'High', type:'Negative' },
      { id:'INVT-014', name:'Bulk invite with empty CSV shows error', pre:'On bulk invite', steps:'1. Upload empty CSV\n2. Submit', expected:'"CSV is empty or has no valid rows" error', priority:'Medium', type:'Validation' },
      { id:'INVT-015', name:'Bulk invite with wrong file type (Excel .xlsx) rejected', pre:'On bulk invite', steps:'1. Upload .xlsx file\n2. Submit', expected:'Error: only CSV files accepted', priority:'Medium', type:'Validation' },
      { id:'INVT-016', name:'Bulk invite CSV missing required columns rejected', pre:'CSV without email column', steps:'1. Upload CSV with only a name column\n2. Submit', expected:'Error: required columns missing (email, role)', priority:'Medium', type:'Validation' },

      // ── Resend & Revoke ────────────────────────────────────────────────────
      { id:'INVT-017', name:'Resend invitation sends new email', pre:'Pending invitation exists', steps:'1. Click Resend on a pending invitation\n2. Confirm', expected:'New invitation email sent; sent timestamp updated; status remains Pending', priority:'High', type:'Positive' },
      { id:'INVT-018', name:'Cannot resend an accepted invitation', pre:'Accepted invitation exists', steps:'1. Check for Resend option on accepted invitation', expected:'Resend option not available; invitation is closed', priority:'Medium', type:'Negative' },
      { id:'INVT-019', name:'Revoke pending invitation', pre:'Pending invitation exists', steps:'1. Click Revoke on pending invitation\n2. Confirm', expected:'Invitation status changed to Revoked; link in email no longer works', priority:'High', type:'Positive' },
      { id:'INVT-020', name:'Revoked invitation link shows expired/invalid error', pre:'Invitation revoked', steps:'1. Use the invitation link from email\n2. Observe', expected:'Error: "This invitation is no longer valid" shown; no account creation possible', priority:'High', type:'Negative' },

      // ── Invitation Acceptance ──────────────────────────────────────────────
      { id:'INVT-021', name:'Valid invitation link allows account creation', pre:'Pending invitation; use link from email', steps:'1. Open invitation link\n2. Fill registration form (name, password)\n3. Submit', expected:'Account created; user logged in with assigned role', priority:'Critical', type:'Positive' },
      { id:'INVT-022', name:'Expired invitation link shows error', pre:'Invitation older than expiry period (e.g., 7 days)', steps:'1. Use expired invitation link', expected:'Error: "Invitation has expired"; user prompted to request new invite', priority:'High', type:'Negative' },
      { id:'INVT-023', name:'Invitation link for already-accepted invite cannot be reused', pre:'Invitation already accepted', steps:'1. Try to use same invitation link again', expected:'Error: "Invitation already used"', priority:'Critical', type:'Security' },
      { id:'INVT-024', name:'Invitation shows correct role assignment after acceptance', pre:'Invitation sent with role "instructor"', steps:'1. Accept invitation\n2. Log in\n3. Check role in profile', expected:'User has "instructor" role as specified in invitation', priority:'High', type:'Positive' },

      // ── Org_admin / Security ───────────────────────────────────────────────
      { id:'INVT-025', name:'Org_admin can only invite users to their org', pre:'Logged in as org_admin', steps:'1. Open invite form\n2. Check org selector', expected:'Only own org available in org selector; cannot invite to another org', priority:'Critical', type:'Security' },
    ]
  }
];
