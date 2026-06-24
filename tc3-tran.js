module.exports = [
  {
    code:'TRAN-LIST',title:'Transactions — List & Search',cases:[
      {id:'TL-001',name:'Transactions list loads with ID, learner, product, amount, status, date',pre:'Logged in; transactions exist',steps:'1. Click Transactions in sidebar\n2. Observe table',expected:'Table: transaction ID, learner name/email, product name, amount paid, payment method, status, date',priority:'Critical',type:'Positive'},
      {id:'TL-002',name:'Filter by status — Successful only',pre:'Mixed statuses (success/failed/refunded)',steps:'1. Select "Successful"',expected:'Only successful transactions shown',priority:'High',type:'Positive'},
      {id:'TL-003',name:'Filter by status — Failed',pre:'Mixed statuses',steps:'1. Select "Failed"',expected:'Only failed transactions shown',priority:'High',type:'Positive'},
      {id:'TL-004',name:'Filter by status — Refunded',pre:'Mixed statuses',steps:'1. Select "Refunded"',expected:'Only refunded transactions shown',priority:'High',type:'Positive'},
      {id:'TL-005',name:'Filter by date range — last 30 days',pre:'Transactions list',steps:'1. Set date filter to Last 30 Days',expected:'Only transactions in that period shown',priority:'High',type:'Positive'},
      {id:'TL-006',name:'Filter by date range — custom (From/To dates)',pre:'Transactions list',steps:'1. Set From: 2026-01-01, To: 2026-01-31',expected:'Only January 2026 transactions shown',priority:'High',type:'Positive'},
      {id:'TL-007',name:'Filter by product/product type',pre:'Transactions list; multiple products',steps:'1. Select specific product from filter',expected:'Only transactions for that product shown',priority:'High',type:'Positive'},
      {id:'TL-008',name:'Search by learner email',pre:'Transactions list',steps:'1. Enter learner email in search',expected:'Transactions for that learner shown',priority:'High',type:'Positive'},
      {id:'TL-009',name:'Search by transaction ID',pre:'Transactions list',steps:'1. Enter exact transaction ID',expected:'Single matching transaction shown',priority:'High',type:'Positive'},
      {id:'TL-010',name:'Sort by amount — highest first',pre:'Transactions list',steps:'1. Sort by Amount (Desc)',expected:'Largest transactions at top',priority:'Medium',type:'Positive'},
      {id:'TL-011',name:'Sort by date — newest first (default)',pre:'Transactions list',steps:'1. Verify default sort',expected:'Most recent transaction at top by default',priority:'Medium',type:'Positive'},
      {id:'TL-012',name:'Combine status + date filters',pre:'Transactions list',steps:'1. Filter Refunded AND Last 90 Days',expected:'Only refunds in last 90 days shown',priority:'Medium',type:'Positive'},
      {id:'TL-013',name:'Pagination — large transaction lists',pre:'Many transactions',steps:'1. Click Next page',expected:'Next set loads; page indicator updates',priority:'Medium',type:'Positive'},
      {id:'TL-014',name:'Summary bar shows total revenue and refunds for current filter',pre:'Filtered transaction list',steps:'1. Apply filter\n2. View summary',expected:'"Total: $X, Refunded: $Y, Net: $Z" shown above table for current filter',priority:'High',type:'Positive'},
      {id:'TL-015',name:'Org_admin sees only own org transactions',pre:'Logged in as org_admin',steps:'1. Open Transactions',expected:'Only own org\'s transactions; no cross-org data',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'TRAN-DETL',title:'Transactions — Transaction Detail',cases:[
      {id:'TD-001',name:'Click transaction opens detail with full information',pre:'Transaction in list',steps:'1. Click transaction ID or row',expected:'Detail page: transaction ID, Stripe charge ID, learner info, product, amount, tax, discount, payment method last 4, status, date, timeline',priority:'Critical',type:'Positive'},
      {id:'TD-002',name:'Payment method shown masked (last 4 digits only)',pre:'Transaction detail',steps:'1. View payment method section',expected:'Card shown as "Visa ••••4242"; never full 16 digits',priority:'Critical',type:'Security'},
      {id:'TD-003',name:'Transaction timeline shows payment events',pre:'Transaction detail; Timeline section',steps:'1. View timeline',expected:'Events: "Payment initiated", "Payment captured", "Email sent", "Access granted" with timestamps',priority:'High',type:'Positive'},
      {id:'TD-004',name:'Link to Stripe dashboard for this transaction',pre:'Transaction detail; super_admin',steps:'1. Click "View in Stripe"',expected:'Opens Stripe dashboard payment page in new tab',priority:'Medium',type:'Positive'},
      {id:'TD-005',name:'Failed transaction detail shows failure reason',pre:'Failed transaction',steps:'1. Open failed transaction detail',expected:'Failure reason shown: e.g., "Card declined: insufficient funds" (from Stripe)',priority:'High',type:'Positive'},
      {id:'TD-006',name:'Refunded transaction shows refund amount and date',pre:'Refunded transaction detail',steps:'1. View refunded transaction',expected:'Refund amount, date, and initiating admin shown',priority:'High',type:'Positive'},
      {id:'TD-007',name:'Transaction detail — coupon applied shown',pre:'Transaction where coupon used',steps:'1. View transaction detail',expected:'Coupon code, discount type, and discount amount shown in price breakdown',priority:'High',type:'Positive'},
      {id:'TD-008',name:'Tax breakdown shown in price detail',pre:'Transaction with tax applied',steps:'1. View price section of transaction detail',expected:'Subtotal, tax amount (with rate %), total shown separately',priority:'High',type:'Positive'},
      {id:'TD-009',name:'Download invoice/receipt PDF from transaction detail',pre:'Transaction detail',steps:'1. Click "Download Invoice"',expected:'PDF invoice downloaded with all transaction details, company name, and line items',priority:'High',type:'Positive'},
      {id:'TD-010',name:'Resend receipt email to learner',pre:'Transaction detail; Resend button',steps:'1. Click "Resend Receipt"\n2. Confirm',expected:'Receipt email resent to learner\'s email; success toast shown',priority:'Medium',type:'Positive'},
      {id:'TD-011',name:'IDOR — learner cannot view other learners\' transaction detail',pre:'Learner logged in',steps:'1. GET /api/transactions/{other-user-transaction-id}',expected:'403 Forbidden',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'TRAN-RFND',title:'Transactions — Refunds',cases:[
      {id:'TR-001',name:'Full refund — 100% of amount returned',pre:'Successful transaction; Refund button',steps:'1. Click Refund on transaction\n2. Select "Full Refund"\n3. Enter reason\n4. Confirm',expected:'Full amount refunded via Stripe; transaction status changes to Refunded; learner loses access',priority:'Critical',type:'Positive'},
      {id:'TR-002',name:'Partial refund — specific dollar amount',pre:'Successful transaction; Refund form',steps:'1. Select "Partial Refund"\n2. Enter $20 of $49 total\n3. Reason\n4. Confirm',expected:'$20 refunded; transaction shows "Partially Refunded"; learner retains access (policy-dependent)',priority:'Critical',type:'Positive'},
      {id:'TR-003',name:'Partial refund > total amount rejected',pre:'Refund form; transaction was $49',steps:'1. Enter $60 partial refund\n2. Confirm',expected:'Validation error: "Cannot refund more than the original amount ($49.00)"',priority:'High',type:'Validation'},
      {id:'TR-004',name:'Refund reason required',pre:'Refund form',steps:'1. Leave reason blank\n2. Confirm',expected:'Required field error',priority:'High',type:'Validation'},
      {id:'TR-005',name:'Cannot refund already-refunded transaction',pre:'Fully refunded transaction',steps:'1. Try to refund again',expected:'Refund button disabled or error: "Transaction has already been fully refunded"',priority:'High',type:'Negative'},
      {id:'TR-006',name:'Refund outside of allowed window blocked',pre:'Transaction >30 days old; 30-day refund window policy',steps:'1. Try to refund old transaction',expected:'Error: "Refund window has expired (30 days)"',priority:'High',type:'Validation'},
      {id:'TR-007',name:'Refund confirmation email sent to learner',pre:'Refund initiated',steps:'1. Process refund\n2. Check learner email',expected:'Refund confirmation email sent with amount and reason',priority:'High',type:'Positive'},
      {id:'TR-008',name:'Access revoked after full refund',pre:'Learner purchased course; full refund processed',steps:'1. Refund purchase\n2. Learner tries to access course',expected:'Access denied; course locked; learner sees "Purchase required"',priority:'Critical',type:'Positive'},
      {id:'TR-009',name:'Access retained after partial refund (policy-based)',pre:'Partial refund policy: retain access',steps:'1. Partial refund processed\n2. Learner accesses course',expected:'Learner retains access (per policy setting)',priority:'Medium',type:'Positive'},
      {id:'TR-010',name:'Refund logged in transaction audit trail',pre:'Refund processed',steps:'1. View transaction detail timeline',expected:'Refund event logged: amount, admin who initiated, timestamp, reason',priority:'High',type:'Positive'},
      {id:'TR-011',name:'Bulk refund not available (each transaction individually reviewed)',pre:'Multiple transactions selected',steps:'1. Select multiple transactions\n2. Check for bulk refund option',expected:'No bulk refund option; each requires individual review',priority:'Medium',type:'Positive'},
      {id:'TR-012',name:'Chargeback handling — disputed transaction status updates',pre:'Stripe chargeback webhook received',steps:'1. Simulate chargeback webhook\n2. Check transaction status',expected:'Transaction status updates to "Disputed"; admin alerted; access optionally suspended',priority:'High',type:'Positive'},
    ]
  },
  {
    code:'TRAN-EXPO',title:'Transactions — Export & Analytics',cases:[
      {id:'TE-001',name:'Export all transactions as CSV',pre:'Transactions list',steps:'1. Click Export\n2. Select All\n3. Download',expected:'CSV: transaction ID, date, learner, product, amount, tax, discount, status, payment method type',priority:'High',type:'Positive'},
      {id:'TE-002',name:'Export filtered transactions only',pre:'Filtered list (e.g., Last 30 Days)',steps:'1. Apply filter\n2. Export',expected:'Only filtered transactions exported; not all history',priority:'High',type:'Positive'},
      {id:'TE-003',name:'Export does not include PAN or full card data',pre:'Export CSV',steps:'1. Download CSV\n2. Check for card numbers',expected:'No full card numbers in export; only card type and last 4 if included',priority:'Critical',type:'Security'},
      {id:'TE-004',name:'Revenue chart shows income over time',pre:'Transactions tab with analytics section',steps:'1. View revenue analytics section',expected:'Bar/line chart: daily/weekly/monthly revenue over selected period',priority:'High',type:'Positive'},
      {id:'TE-005',name:'Revenue by product breakdown chart',pre:'Analytics section',steps:'1. View revenue breakdown',expected:'Pie/bar chart showing revenue contribution by product',priority:'Medium',type:'Positive'},
      {id:'TE-006',name:'Refund rate metric shown in analytics',pre:'Analytics section',steps:'1. View refund metrics',expected:'Total refunded amount and % of gross revenue',priority:'Medium',type:'Positive'},
      {id:'TE-007',name:'Analytics date range filter',pre:'Transactions analytics',steps:'1. Change to Last Quarter',expected:'All metrics and charts update to that period',priority:'Medium',type:'Positive'},
      {id:'TE-008',name:'Export large dataset — no timeout or truncation',pre:'100,000+ transactions',steps:'1. Click Export All\n2. Wait for completion',expected:'Full export completes; no truncation; download delivers all rows',priority:'High',type:'Boundary'},
    ]
  },
];
