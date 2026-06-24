// PROD + TRAN + BILL — 130 cases
module.exports = [
  {
    code: 'PROD',
    title: 'Products & Pricing',
    cases: [
      // ── List ───────────────────────────────────────────────────────────────
      { id:'PR-001', name:'Products list loads all products', pre:'Logged in; products exist', steps:'1. Click Products in sidebar', expected:'Table: product name, price, type (one-time/subscription), associated course/bundle, status, sales count', priority:'Critical', type:'Positive' },
      { id:'PR-002', name:'Filter products by type — one-time', pre:'Mix of product types', steps:'1. Select "One-time" filter', expected:'Only one-time payment products shown', priority:'High', type:'Positive' },
      { id:'PR-003', name:'Filter by status (Active/Inactive)', pre:'Mixed status products', steps:'1. Select "Active" filter', expected:'Only active products listed', priority:'High', type:'Positive' },
      { id:'PR-004', name:'Search products by name', pre:'Multiple products', steps:'1. Type partial product name', expected:'Matching products shown', priority:'High', type:'Positive' },
      { id:'PR-005', name:'Products list shows correct total sales count', pre:'Products with sales', steps:'1. View products list\n2. Check sales column', expected:'Sales count accurate for each product', priority:'Medium', type:'Positive' },

      // ── Create Product ─────────────────────────────────────────────────────
      { id:'PR-006', name:'Create one-time payment product', pre:'Products page; click Create', steps:'1. Enter name "Finance Course Access"\n2. Select type "One-time"\n3. Enter price $29.99\n4. Add description\n5. Associate with course\n6. Save', expected:'Product created; associates with chosen course', priority:'Critical', type:'Positive' },
      { id:'PR-007', name:'Create subscription product (monthly)', pre:'Create product form', steps:'1. Select type "Subscription"\n2. Select billing period "Monthly"\n3. Enter price $9.99/month\n4. Save', expected:'Monthly subscription product created', priority:'Critical', type:'Positive' },
      { id:'PR-008', name:'Create subscription product (annual)', pre:'Create product form', steps:'1. Select "Annual" billing\n2. Enter price $99/year\n3. Save', expected:'Annual subscription created with correct pricing', priority:'High', type:'Positive' },
      { id:'PR-009', name:'Create product with blank name fails', pre:'Create form', steps:'1. Leave name blank\n2. Save', expected:'Required field error', priority:'High', type:'Validation' },
      { id:'PR-010', name:'Create product with zero price fails for paid type', pre:'Create form; type One-time', steps:'1. Enter price $0.00\n2. Save', expected:'Error: price must be greater than zero for paid products', priority:'High', type:'Validation' },
      { id:'PR-011', name:'Create product with negative price rejected', pre:'Create form', steps:'1. Enter -9.99 as price\n2. Save', expected:'Validation error: price must be positive', priority:'High', type:'Validation' },
      { id:'PR-012', name:'Create product with non-numeric price rejected', pre:'Create form', steps:'1. Enter "abc" as price\n2. Save', expected:'Validation error: numeric value required', priority:'High', type:'Validation' },
      { id:'PR-013', name:'Product price with too many decimal places rejected', pre:'Create form', steps:'1. Enter 9.999 as price\n2. Save', expected:'Error: price limited to 2 decimal places', priority:'Medium', type:'Validation' },
      { id:'PR-014', name:'Associate product with course', pre:'Create product form; course exists', steps:'1. Click "Associate with Course"\n2. Search and select course\n3. Save', expected:'Product linked to course; course requires purchase', priority:'High', type:'Positive' },
      { id:'PR-015', name:'Associate product with bundle', pre:'Create product form; bundle exists', steps:'1. Associate with bundle instead of course', expected:'Product linked to bundle', priority:'High', type:'Positive' },
      { id:'PR-016', name:'Product can be standalone (no course/bundle attached)', pre:'Create form', steps:'1. Create product without associating a course\n2. Save', expected:'Product created standalone; can be associated later', priority:'Medium', type:'Positive' },
      { id:'PR-017', name:'Product thumbnail upload', pre:'Create product form', steps:'1. Upload product thumbnail image\n2. Save', expected:'Thumbnail shown on product', priority:'Low', type:'Positive' },

      // ── Edit Product ───────────────────────────────────────────────────────
      { id:'PR-018', name:'Edit product name and description', pre:'Product exists', steps:'1. Click Edit\n2. Change name and description\n3. Save', expected:'Changes saved and reflected', priority:'High', type:'Positive' },
      { id:'PR-019', name:'Edit product price', pre:'Product exists', steps:'1. Change price to $49.99\n2. Save', expected:'New price applies to future transactions; existing subs may be grandfathered per policy', priority:'High', type:'Positive' },
      { id:'PR-020', name:'Activate/deactivate product', pre:'Active product', steps:'1. Toggle to Inactive\n2. Save\n3. Check if product purchasable', expected:'Inactive products not purchasable; existing access unaffected', priority:'High', type:'Positive' },

      // ── Coupons & Discounts ────────────────────────────────────────────────
      { id:'PR-021', name:'Create coupon — percentage discount (20% off)', pre:'Product exists; Coupons section', steps:'1. Click "Create Coupon"\n2. Enter code "SAVE20"\n3. Select type "Percentage"\n4. Enter 20%\n5. Associate with product\n6. Save', expected:'Coupon created; applying SAVE20 gives 20% discount on checkout', priority:'Critical', type:'Positive' },
      { id:'PR-022', name:'Create coupon — fixed amount discount ($10 off)', pre:'Product exists', steps:'1. Create coupon type "Fixed"\n2. Enter $10.00 discount\n3. Save', expected:'Coupon applies $10 discount at checkout', priority:'High', type:'Positive' },
      { id:'PR-023', name:'Coupon discount > product price clamps to $0', pre:'Product $5; coupon $20 off', steps:'1. Apply $20 off coupon to $5 product\n2. Observe checkout price', expected:'Price shown as $0.00; not negative', priority:'High', type:'Boundary' },
      { id:'PR-024', name:'Create coupon with 100% discount (free access)', pre:'Coupons section', steps:'1. Enter 100% discount\n2. Save', expected:'Coupon grants free access; valid use case', priority:'Medium', type:'Boundary' },
      { id:'PR-025', name:'Percentage discount > 100% rejected', pre:'Create coupon form', steps:'1. Enter 110%\n2. Save', expected:'Validation error: percentage max is 100', priority:'High', type:'Validation' },
      { id:'PR-026', name:'Create coupon with expiry date', pre:'Create coupon form', steps:'1. Set expiry to next month\n2. Save', expected:'Coupon valid until expiry; auto-expires after that date', priority:'High', type:'Positive' },
      { id:'PR-027', name:'Expired coupon rejected at checkout', pre:'Expired coupon exists', steps:'1. Apply expired coupon code at checkout', expected:'Error: "Coupon has expired"', priority:'High', type:'Negative' },
      { id:'PR-028', name:'Set max usage limit on coupon (100 uses)', pre:'Create coupon form', steps:'1. Enter usage limit 100\n2. Save', expected:'Coupon rejected after 100 uses; counter tracked per use', priority:'High', type:'Positive' },
      { id:'PR-029', name:'Coupon at max usage rejected', pre:'Coupon used 100/100 times', steps:'1. Try to apply coupon at 101st use', expected:'Error: "Coupon usage limit reached"', priority:'High', type:'Boundary' },
      { id:'PR-030', name:'Coupon code case-insensitive', pre:'Coupon code "SAVE20" exists', steps:'1. Apply "save20" (lowercase) at checkout', expected:'Coupon accepted; discount applied', priority:'Medium', type:'Positive' },
      { id:'PR-031', name:'Non-existent coupon code rejected', pre:'Checkout form', steps:'1. Enter "INVALIDCODE"\n2. Apply', expected:'Error: "Coupon code not found or not valid"', priority:'High', type:'Negative' },
      { id:'PR-032', name:'Coupon restricted to one product rejected on another product', pre:'Coupon for Course A; user buying Course B', steps:'1. Apply Course-A-specific coupon to Course B checkout', expected:'Error: "Coupon not valid for this product"', priority:'High', type:'Negative' },
      { id:'PR-033', name:'Delete coupon with confirmation', pre:'Coupon exists', steps:'1. Click Delete on coupon\n2. Confirm', expected:'Coupon deleted; can no longer be applied', priority:'Medium', type:'Positive' },
      { id:'PR-034', name:'Deactivate coupon without deleting', pre:'Active coupon', steps:'1. Toggle coupon to Inactive\n2. Save', expected:'Coupon inactive; code rejected if applied', priority:'Medium', type:'Positive' },
      { id:'PR-035', name:'XSS attempt in coupon code field sanitized', pre:'Create coupon form', steps:'1. Enter "<script>alert(1)</script>" as coupon code\n2. Save', expected:'Script tags stripped or rejected; not stored raw', priority:'Critical', type:'Security' },

      // ── Security ───────────────────────────────────────────────────────────
      { id:'PR-036', name:'Org_admin cannot manage another org\'s products', pre:'Logged in as org_admin', steps:'1. Access another org\'s product via URL/API', expected:'403 Forbidden', priority:'Critical', type:'Security' },
      { id:'PR-037', name:'Product price cannot be manipulated via API parameter tampering', pre:'Checkout API call', steps:'1. Intercept checkout API request\n2. Change price field to $0.01\n3. Submit', expected:'Server ignores client-supplied price; charges correct product price from DB', priority:'Critical', type:'Security' },
      { id:'PR-038', name:'Coupon cannot be applied more than max times via race condition', pre:'Coupon with limit 1; two simultaneous requests', steps:'1. Send two simultaneous coupon-apply requests for the same single-use coupon', expected:'Only one succeeds; second rejected; no race condition exploit', priority:'Critical', type:'Security' },
    ]
  },
  {
    code: 'TRAN',
    title: 'Transactions',
    cases: [
      // ── List & Filter ──────────────────────────────────────────────────────
      { id:'TN-001', name:'Transactions list loads all transactions', pre:'Logged in; transactions exist', steps:'1. Click Transactions in sidebar', expected:'Table: ID, learner, product, amount, status, date, payment method', priority:'Critical', type:'Positive' },
      { id:'TN-002', name:'Filter by status — Completed', pre:'Mixed status transactions', steps:'1. Select "Completed" filter', expected:'Only completed transactions shown', priority:'High', type:'Positive' },
      { id:'TN-003', name:'Filter by status — Failed', pre:'Some failed transactions', steps:'1. Select "Failed" filter', expected:'Only failed transactions shown', priority:'High', type:'Positive' },
      { id:'TN-004', name:'Filter by status — Refunded', pre:'Some refunds issued', steps:'1. Select "Refunded" filter', expected:'Only refunded transactions shown', priority:'High', type:'Positive' },
      { id:'TN-005', name:'Filter by date range', pre:'Transactions over multiple dates', steps:'1. Set date range to last 7 days', expected:'Only transactions within last 7 days shown', priority:'High', type:'Positive' },
      { id:'TN-006', name:'Search by order ID', pre:'Known order ID', steps:'1. Enter order ID in search\n2. Observe', expected:'Exact matching transaction shown', priority:'High', type:'Positive' },
      { id:'TN-007', name:'Search by learner email', pre:'Learner has transactions', steps:'1. Enter learner email in search', expected:'All transactions for that learner shown', priority:'High', type:'Positive' },
      { id:'TN-008', name:'Search by product name', pre:'Transactions exist for product', steps:'1. Enter product name in search', expected:'Transactions for that product shown', priority:'Medium', type:'Positive' },
      { id:'TN-009', name:'Transactions sorted by date newest first by default', pre:'Transactions list', steps:'1. Observe default sort', expected:'Most recent transactions at top', priority:'Medium', type:'Positive' },
      { id:'TN-010', name:'Sort transactions by amount', pre:'Transactions list', steps:'1. Click Amount column header', expected:'Sorted by amount ascending/descending', priority:'Low', type:'Positive' },
      { id:'TN-011', name:'Pagination on transactions list', pre:'Many transactions', steps:'1. Click Next page', expected:'Next set of transactions loaded', priority:'Medium', type:'Positive' },

      // ── Transaction Detail ─────────────────────────────────────────────────
      { id:'TN-012', name:'Click transaction to view detail', pre:'Transaction list', steps:'1. Click transaction row', expected:'Detail view: order ID, learner info, product, price, tax, total, payment method, date, status', priority:'High', type:'Positive' },
      { id:'TN-013', name:'Transaction detail shows payment gateway reference ID', pre:'Completed transaction', steps:'1. Open transaction detail', expected:'Payment gateway reference ID visible (Stripe payment_intent, etc.)', priority:'Medium', type:'Positive' },
      { id:'TN-014', name:'Transaction detail shows coupon applied (if any)', pre:'Transaction with coupon', steps:'1. Open detail for a discounted transaction', expected:'Coupon code and discount amount shown in breakdown', priority:'Medium', type:'Positive' },

      // ── Refunds ────────────────────────────────────────────────────────────
      { id:'TN-015', name:'Initiate full refund for completed transaction', pre:'Completed transaction; refund policy allows', steps:'1. Open transaction detail\n2. Click "Issue Refund"\n3. Select Full Refund\n4. Enter reason\n5. Confirm', expected:'Refund initiated; status changes to Refunded; learner access revoked per policy', priority:'Critical', type:'Positive' },
      { id:'TN-016', name:'Initiate partial refund', pre:'Completed transaction; partial refund supported', steps:'1. Click Issue Refund\n2. Select Partial Refund\n3. Enter refund amount $10\n4. Enter reason\n5. Confirm', expected:'Partial refund processed; status shows "Partially Refunded"', priority:'High', type:'Positive' },
      { id:'TN-017', name:'Partial refund > original amount rejected', pre:'Refund form; transaction $20', steps:'1. Enter $25 refund amount\n2. Confirm', expected:'Error: refund cannot exceed original payment amount', priority:'High', type:'Validation' },
      { id:'TN-018', name:'Refund already-refunded transaction fails', pre:'Transaction already refunded', steps:'1. Try to issue another refund on same transaction', expected:'Error: "Transaction already refunded"', priority:'High', type:'Negative' },
      { id:'TN-019', name:'Failed transaction cannot be refunded', pre:'Failed/declined transaction', steps:'1. Try to refund a failed transaction', expected:'Refund option not available for failed payments', priority:'Medium', type:'Negative' },
      { id:'TN-020', name:'Refund without reason is blocked (if required)', pre:'Refund dialog', steps:'1. Leave reason blank\n2. Confirm', expected:'Error: reason for refund is required', priority:'Medium', type:'Validation' },

      // ── Export & Security ──────────────────────────────────────────────────
      { id:'TN-021', name:'Export transactions as CSV', pre:'Transactions list', steps:'1. Click Export CSV\n2. Download', expected:'CSV with all transaction columns downloaded', priority:'High', type:'Positive' },
      { id:'TN-022', name:'Export with active filters applies to export', pre:'Transactions filtered by status "Completed"', steps:'1. Apply filter\n2. Export CSV', expected:'Only filtered (completed) transactions in CSV', priority:'Medium', type:'Positive' },
      { id:'TN-023', name:'Org_admin sees only their org\'s transactions', pre:'Logged in as org_admin', steps:'1. Open Transactions page', expected:'Only transactions from own org\'s learners visible', priority:'Critical', type:'Security' },
      { id:'TN-024', name:'Instructor cannot access Transactions page', pre:'Logged in as instructor', steps:'1. Navigate to Transactions', expected:'Access denied; hidden or 403', priority:'Critical', type:'Security' },
      { id:'TN-025', name:'Transaction IDs not predictably sequential (IDOR prevention)', pre:'Observe transaction IDs', steps:'1. Note transaction IDs in list\n2. Check if sequential integers', expected:'Transaction IDs are UUIDs or non-sequential; cannot enumerate others\' transactions', priority:'Critical', type:'Security' },
    ]
  },
  {
    code: 'BILL',
    title: 'Billing & Subscriptions',
    cases: [
      // ── Current Plan ───────────────────────────────────────────────────────
      { id:'BL-001', name:'Billing page loads current subscription plan', pre:'Logged in as super_admin', steps:'1. Click Billing in sidebar', expected:'Current plan name, features, billing cycle, price, next billing date shown', priority:'Critical', type:'Positive' },
      { id:'BL-002', name:'Billing page shows usage metrics', pre:'Platform in use', steps:'1. View Billing page usage section', expected:'Current usage shown: active users, courses, storage used vs plan limits', priority:'High', type:'Positive' },
      { id:'BL-003', name:'Usage at 80% shows warning indicator', pre:'Platform near limits', steps:'1. Use 80% of storage\n2. View Billing', expected:'Yellow warning indicator: "You\'re at 80% of your storage limit"', priority:'High', type:'Positive' },
      { id:'BL-004', name:'Usage at 100% shows critical alert', pre:'Storage/user limit reached', steps:'1. View Billing at full capacity', expected:'Red alert; prompt to upgrade plan', priority:'High', type:'Boundary' },
      { id:'BL-005', name:'Org_admin cannot access Billing page', pre:'Logged in as org_admin', steps:'1. Navigate to Billing', expected:'Access denied; page hidden or 403 Forbidden', priority:'Critical', type:'Security' },

      // ── Payment Methods ────────────────────────────────────────────────────
      { id:'BL-006', name:'View saved payment methods', pre:'Payment method on file', steps:'1. Open Payment Methods section', expected:'Card details shown: last 4 digits, expiry, card brand (Visa/Mastercard)', priority:'High', type:'Positive' },
      { id:'BL-007', name:'Add new credit card', pre:'Payment Methods section', steps:'1. Click "Add Payment Method"\n2. Enter card details (number, expiry, CVC)\n3. Save', expected:'Card tokenized via payment gateway; last 4 digits shown; full card number NOT stored', priority:'Critical', type:'Positive' },
      { id:'BL-008', name:'Add invalid card number rejected', pre:'Add payment form', steps:'1. Enter invalid card number "1234 5678 9012 3456"\n2. Save', expected:'Payment gateway rejects; error shown: invalid card number', priority:'High', type:'Negative' },
      { id:'BL-009', name:'Add expired credit card rejected', pre:'Add payment form', steps:'1. Enter expiry date in the past\n2. Save', expected:'Error: card expired', priority:'High', type:'Negative' },
      { id:'BL-010', name:'Set payment method as default', pre:'Multiple payment methods', steps:'1. Click "Set as Default" on a card\n2. Confirm', expected:'Card marked as default for future billing', priority:'High', type:'Positive' },
      { id:'BL-011', name:'Remove payment method', pre:'Non-default payment method', steps:'1. Click Remove on card\n2. Confirm', expected:'Card removed; no longer charged', priority:'High', type:'Positive' },
      { id:'BL-012', name:'Cannot remove last payment method when subscription active', pre:'Only one payment method; active subscription', steps:'1. Try to remove the only card', expected:'Error: "Cannot remove last payment method while subscription is active"', priority:'High', type:'Negative' },
      { id:'BL-013', name:'Full card number never stored or shown in UI', pre:'Payment method on file', steps:'1. Inspect payment methods UI\n2. Check network response for card data', expected:'Only last 4 digits and card type visible; full PAN not in DOM or API response', priority:'Critical', type:'Security' },

      // ── Plan Upgrade / Downgrade ───────────────────────────────────────────
      { id:'BL-014', name:'View available plans for upgrade', pre:'Billing page; Upgrade button', steps:'1. Click "Upgrade Plan" or "View Plans"', expected:'Pricing table shown with feature comparison; current plan highlighted', priority:'High', type:'Positive' },
      { id:'BL-015', name:'Upgrade plan — select higher tier', pre:'Plans page', steps:'1. Click Upgrade to Pro\n2. Confirm payment\n3. Check plan', expected:'Plan upgraded immediately; higher limits active; prorated charge if applicable', priority:'High', type:'Positive' },
      { id:'BL-016', name:'Downgrade plan warning about feature loss', pre:'On higher plan; clicking downgrade', steps:'1. Select lower plan\n2. Observe warning', expected:'Warning: "Downgrading will remove access to: [features]. Current data may be affected."', priority:'High', type:'UI/UX' },
      { id:'BL-017', name:'Cancel subscription with confirmation', pre:'Active subscription', steps:'1. Click "Cancel Subscription"\n2. Enter reason\n3. Confirm', expected:'Subscription set to cancel at end of billing period; access continues until then', priority:'High', type:'Positive' },
      { id:'BL-018', name:'Subscription cancelled — access ends on period end date', pre:'Subscription cancelled', steps:'1. Note period end date\n2. After that date, log in', expected:'Platform access restricted; upgrade prompt shown', priority:'High', type:'Positive' },
      { id:'BL-019', name:'Reactivate cancelled subscription before end date', pre:'Subscription cancelled but within period', steps:'1. Click "Reactivate"\n2. Confirm', expected:'Subscription reactivated; cancellation reversed', priority:'High', type:'Positive' },

      // ── Billing History ────────────────────────────────────────────────────
      { id:'BL-020', name:'Billing history shows all past invoices', pre:'Previous billing cycles', steps:'1. Open Billing History section', expected:'List of invoices: date, amount, plan, status (Paid/Failed)', priority:'High', type:'Positive' },
      { id:'BL-021', name:'Download invoice as PDF', pre:'Invoice in billing history', steps:'1. Click Download on an invoice', expected:'PDF downloaded with correct billing details', priority:'High', type:'Positive' },
      { id:'BL-022', name:'Failed payment invoice shows retry option', pre:'Failed invoice in history', steps:'1. View failed invoice\n2. Observe options', expected:'"Retry Payment" button visible; can attempt to charge again', priority:'High', type:'Positive' },
      { id:'BL-023', name:'Billing page shows next invoice date and amount', pre:'Active subscription', steps:'1. View Billing page overview', expected:'Next billing date and amount shown clearly', priority:'Medium', type:'Positive' },
      { id:'BL-024', name:'Invoice contains all required tax/billing info', pre:'Invoice downloaded', steps:'1. Open invoice PDF\n2. Check contents', expected:'Invoice has: company name, address, invoice number, date, line items, subtotal, tax, total', priority:'High', type:'Positive' },
      { id:'BL-025', name:'Billing information protected — org_admin cannot access billing API', pre:'Logged in as org_admin', steps:'1. Call GET /api/.../billing/ with org_admin token', expected:'403 Forbidden; billing restricted to super_admin', priority:'Critical', type:'Security' },
    ]
  }
];
