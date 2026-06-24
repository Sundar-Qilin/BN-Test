module.exports = [
  {
    code:'INVT-LIST',title:'Invitees — List & Status',cases:[
      {id:'IL-001',name:'Invitees list shows pending, accepted, expired invitations',pre:'Logged in as super_admin; invitations sent',steps:'1. Click Invitees in sidebar\n2. Observe table',expected:'Table: invitee email, role, org, division, invited by, sent date, status (Pending/Accepted/Expired)',priority:'Critical',type:'Positive'},
      {id:'IL-002',name:'Filter invitations by status — Pending only',pre:'Invitees list; mixed statuses',steps:'1. Select "Pending" filter',expected:'Only pending invitations shown',priority:'High',type:'Positive'},
      {id:'IL-003',name:'Filter invitations by status — Accepted',pre:'Invitees list',steps:'1. Select "Accepted"',expected:'Only accepted invitations shown',priority:'High',type:'Positive'},
      {id:'IL-004',name:'Filter invitations by status — Expired',pre:'Invitees list',steps:'1. Select "Expired"',expected:'Only expired invitations shown',priority:'Medium',type:'Positive'},
      {id:'IL-005',name:'Filter by org shows invites for that org only',pre:'Super_admin; multiple orgs',steps:'1. Select an org in filter',expected:'Only invites sent to that org shown',priority:'High',type:'Positive'},
      {id:'IL-006',name:'Search by invitee email',pre:'Invitees list',steps:'1. Enter partial email in search',expected:'Matching invites shown',priority:'High',type:'Positive'},
      {id:'IL-007',name:'Sort invitations by sent date newest first',pre:'Invitees list',steps:'1. Click Sent Date column',expected:'Most recently sent invites at top',priority:'Low',type:'Positive'},
      {id:'IL-008',name:'Invitee list shows empty state when no invites',pre:'No invitations sent',steps:'1. Open Invitees page',expected:'"No invitations sent yet" with Send Invite button',priority:'Low',type:'Negative'},
      {id:'IL-009',name:'Org_admin sees only invites for own org',pre:'Logged in as org_admin',steps:'1. Open Invitees',expected:'Only own org\'s invitations visible',priority:'Critical',type:'Security'},
      {id:'IL-010',name:'Pagination on large invite list',pre:'More than page size invites',steps:'1. Click Next page',expected:'Next set of invites loads',priority:'Low',type:'Positive'},
    ]
  },
  {
    code:'INVT-SEND',title:'Invitees — Send Invitation',cases:[
      {id:'IS-001',name:'Send single invitation — all fields filled, sends successfully',pre:'Send invite form open',steps:'1. Enter email "newuser@example.com"\n2. Select role "Learner"\n3. Select org and division\n4. Click Send',expected:'Invitation email sent; appears in list as Pending',priority:'Critical',type:'Positive'},
      {id:'IS-002',name:'Email field required — blank fails',pre:'Send invite form',steps:'1. Leave email blank\n2. Send',expected:'Required field error',priority:'Critical',type:'Validation'},
      {id:'IS-003',name:'Invalid email format rejected',pre:'Send invite form',steps:'1. Enter "notanemail"\n2. Send',expected:'Validation error: invalid email format',priority:'High',type:'Validation'},
      {id:'IS-004',name:'Role field required — blank fails',pre:'Send invite form',steps:'1. Leave role unselected\n2. Send',expected:'Required field error on role',priority:'High',type:'Validation'},
      {id:'IS-005',name:'Invite existing registered user rejected',pre:'User with this email already registered',steps:'1. Enter registered user\'s email\n2. Send',expected:'Error: "A user with this email already exists"',priority:'High',type:'Validation'},
      {id:'IS-006',name:'Re-invite same email while pending — rejected or resends',pre:'Pending invite exists for email',steps:'1. Send invite to same email',expected:'Error "Pending invite exists" or option to resend replaces old invite',priority:'High',type:'Validation'},
      {id:'IS-007',name:'Invitation expiry set to custom days',pre:'Send invite form; expiry field',steps:'1. Set expiry to 7 days\n2. Send',expected:'Invite expires after 7 days; status changes to Expired',priority:'Medium',type:'Positive'},
      {id:'IS-008',name:'Invitation with no expiry set uses system default',pre:'Send invite form; expiry blank',steps:'1. Leave expiry blank\n2. Send',expected:'System default expiry (e.g., 30 days) applied',priority:'Medium',type:'Positive'},
      {id:'IS-009',name:'Include personal message in invitation',pre:'Send invite form; message field',steps:'1. Enter custom welcome message\n2. Send',expected:'Invitation email includes the custom message',priority:'Low',type:'Positive'},
      {id:'IS-010',name:'Custom message with XSS attempt sanitized',pre:'Send invite form',steps:'1. Enter <script>alert(1)</script> in message\n2. Send',expected:'Script stripped; email renders safe text',priority:'Critical',type:'Security'},
      {id:'IS-011',name:'Assign to specific division at invite time',pre:'Send invite form; division field',steps:'1. Select division\n2. Send',expected:'When user accepts and registers, they are placed in that division',priority:'High',type:'Positive'},
      {id:'IS-012',name:'Invitation email received with correct link and role',pre:'Invitation sent',steps:'1. Check email\n2. Observe invite link and role mention',expected:'Email has unique invite link and mentions assigned role',priority:'High',type:'Positive'},
    ]
  },
  {
    code:'INVT-BULK',title:'Invitees — Bulk Invite via CSV',cases:[
      {id:'IB-001',name:'Bulk invite via valid CSV succeeds',pre:'CSV with columns: email, role; valid emails',steps:'1. Click Bulk Invite / Import\n2. Upload CSV\n3. Confirm',expected:'All valid rows processed; invitations sent; summary shown (X sent, Y failed)',priority:'Critical',type:'Positive'},
      {id:'IB-002',name:'CSV template downloadable with correct headers',pre:'Bulk Invite dialog',steps:'1. Click "Download Template"',expected:'CSV template downloaded with headers: email, role, org, division, message',priority:'High',type:'UI/UX'},
      {id:'IB-003',name:'CSV with missing required columns fails',pre:'Bulk invite; CSV without "role" column',steps:'1. Upload invalid CSV',expected:'Error: "Required column \'role\' missing"',priority:'High',type:'Validation'},
      {id:'IB-004',name:'CSV with invalid email rows — partial success',pre:'CSV: 8 valid + 2 invalid emails',steps:'1. Upload CSV\n2. Confirm\n3. Observe result',expected:'8 invites sent; 2 rows listed as failed with reason "invalid email"',priority:'High',type:'Negative'},
      {id:'IB-005',name:'CSV with already-registered emails — partial skip',pre:'CSV includes existing user emails',steps:'1. Upload CSV\n2. Observe',expected:'Existing users skipped with note; others processed',priority:'High',type:'Negative'},
      {id:'IB-006',name:'CSV with 0 valid rows shows error',pre:'CSV with all invalid data',steps:'1. Upload all-invalid CSV\n2. Confirm',expected:'Error: "No valid invitations to send"',priority:'Medium',type:'Negative'},
      {id:'IB-007',name:'CSV with >500 rows — system handles or limits',pre:'CSV with 1000 rows',steps:'1. Upload large CSV\n2. Observe',expected:'Either processed in batch or error with max row limit (e.g., "Maximum 500 rows")',priority:'Medium',type:'Boundary'},
      {id:'IB-008',name:'Non-CSV file upload rejected',pre:'Bulk invite dialog',steps:'1. Upload .xlsx file instead of .csv',expected:'Error: "Please upload a CSV file"',priority:'Medium',type:'Validation'},
    ]
  },
  {
    code:'INVT-MGMT',title:'Invitees — Resend, Revoke & Acceptance',cases:[
      {id:'IM-001',name:'Resend pending invitation sends new email with fresh link',pre:'Pending invitation',steps:'1. Click Resend on pending invite\n2. Confirm',expected:'New invitation email sent; original link invalidated; expiry reset',priority:'High',type:'Positive'},
      {id:'IM-002',name:'Cannot resend accepted invitation',pre:'Accepted invitation',steps:'1. Try Resend on accepted invite',expected:'Resend button disabled or error: "User has already accepted this invitation"',priority:'Medium',type:'Negative'},
      {id:'IM-003',name:'Revoke pending invitation',pre:'Pending invitation',steps:'1. Click Revoke\n2. Confirm',expected:'Invitation cancelled; link no longer works; status shows Revoked',priority:'High',type:'Positive'},
      {id:'IM-004',name:'Revoked invite link shows error when followed',pre:'Invitation revoked',steps:'1. Use old invite link in browser',expected:'"This invitation has been cancelled or expired" error page',priority:'High',type:'Negative'},
      {id:'IM-005',name:'Expired invite link shows error when followed',pre:'Invitation expired',steps:'1. Use expired link',expected:'"This invitation has expired. Please contact your administrator." error',priority:'High',type:'Negative'},
      {id:'IM-006',name:'Invitee accepts invitation — account created with correct role',pre:'Pending invitation; invitee clicks link',steps:'1. Open invite link\n2. Fill registration form (name, password)\n3. Submit',expected:'Account created with role and org as specified in invitation; redirected to learner/admin portal',priority:'Critical',type:'Positive'},
      {id:'IM-007',name:'Invitee registration form validates password policy',pre:'Registration from invite link',steps:'1. Enter weak password "123"\n2. Submit',expected:'Password policy error; registration blocked',priority:'High',type:'Validation'},
      {id:'IM-008',name:'Invite link cannot be reused after acceptance',pre:'Invitation accepted',steps:'1. Follow same invite link again',expected:'"Invitation already used" error',priority:'High',type:'Security'},
      {id:'IM-009',name:'Bulk revoke multiple pending invitations',pre:'Multiple pending invites selected',steps:'1. Select 5 pending invites\n2. Bulk Revoke\n3. Confirm',expected:'5 invites revoked; their links invalidated; success toast',priority:'Medium',type:'Positive'},
      {id:'IM-010',name:'Bulk delete expired invitations',pre:'Expired invites in list',steps:'1. Select all expired\n2. Delete\n3. Confirm',expected:'Expired invites removed from list',priority:'Low',type:'Positive'},
    ]
  },
];
