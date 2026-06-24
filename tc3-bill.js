module.exports = [
  {
    code:'BILL-PLAN',title:'Billing — Plan Management',cases:[
      {id:'BP-001',name:'Billing page loads with current plan, usage, and renewal date',pre:'Logged in as super_admin or org_admin; subscription active',steps:'1. Click Billing in sidebar\n2. Observe plan section',expected:'Current plan name, price, billing cycle, next renewal date, usage stats (users, courses, storage) shown',priority:'Critical',type:'Positive'},
      {id:'BP-002',name:'Upgrade plan — from Basic to Pro',pre:'On Basic plan; Billing page',steps:'1. Click "Upgrade Plan"\n2. Select Pro plan\n3. Review proration\n4. Confirm',expected:'Plan upgraded immediately; proration charge applied; access to Pro features unlocked',priority:'Critical',type:'Positive'},
      {id:'BP-003',name:'Downgrade plan — from Pro to Basic',pre:'On Pro plan; Billing page',steps:'1. Click "Change Plan"\n2. Select Basic\n3. Confirm',expected:'Downgrade scheduled at next billing cycle (not immediately); confirmation email sent',priority:'Critical',type:'Positive'},
      {id:'BP-004',name:'Downgrade blocked if current usage exceeds new plan limits',pre:'500 users on plan that allows 100 in Basic',steps:'1. Try to downgrade\n2. Observe',expected:'Error: "Your current usage (500 users) exceeds the Basic plan limit (100). Reduce usage before downgrading."',priority:'High',type:'Negative'},
      {id:'BP-005',name:'Proration calculation shown before upgrade confirmation',pre:'Upgrade flow; mid-billing-cycle',steps:'1. Select upgrade plan\n2. View confirmation screen',expected:'Proration amount clearly shown: "You owe $X for the remainder of this billing period"',priority:'High',type:'UI/UX'},
      {id:'BP-006',name:'Cancel subscription — moves to cancelled at period end',pre:'Active subscription',steps:'1. Click "Cancel Subscription"\n2. Confirm',expected:'Subscription set to cancel at end of current period; "Cancelled — access until [date]" shown',priority:'High',type:'Positive'},
      {id:'BP-007',name:'Reactivate cancelled subscription before period end',pre:'Subscription cancelled but not yet ended',steps:'1. Click "Reactivate"\n2. Confirm',expected:'Subscription reactivated; billing resumes; no data loss',priority:'High',type:'Positive'},
      {id:'BP-008',name:'Plan comparison modal shows all plans clearly',pre:'Upgrade flow',steps:'1. Click Upgrade or Change Plan',expected:'Modal or page showing all plans with features, limits, and prices side-by-side',priority:'Medium',type:'UI/UX'},
      {id:'BP-009',name:'Usage limits shown with progress bars',pre:'Billing page; usage section',steps:'1. View usage metrics',expected:'Users: 450/500 (bar 90%), Courses: 45/100 (bar 45%), Storage: 20GB/50GB shown',priority:'High',type:'Positive'},
      {id:'BP-010',name:'Warning shown when approaching plan limit (>80% used)',pre:'Usage at 85% of limit',steps:'1. View billing page',expected:'Warning banner: "You are using 85% of your user limit. Upgrade to avoid disruption."',priority:'High',type:'Positive'},
      {id:'BP-011',name:'Exceeding plan limit — new resource creation blocked',pre:'User count at plan max',steps:'1. Try to create new user when at limit',expected:'Error: "User limit reached. Upgrade your plan to add more users."',priority:'Critical',type:'Negative'},
      {id:'BP-012',name:'Free trial shown with days remaining',pre:'Account in free trial',steps:'1. View billing page',expected:'"Free Trial — 8 days remaining" prominently shown; CTA to upgrade',priority:'High',type:'Positive'},
      {id:'BP-013',name:'Trial expiry — access restricted after trial ends',pre:'Free trial expired; no payment method',steps:'1. Admin logs in after trial end\n2. Tries to access features',expected:'Paywall or limited access modal shown; must add payment method to continue',priority:'Critical',type:'Positive'},
    ]
  },
  {
    code:'BILL-PAY',title:'Billing — Payment Methods',cases:[
      {id:'BPY-001',name:'Payment methods tab shows saved cards',pre:'Billing page; Payment Methods tab',steps:'1. Click Payment Methods tab',expected:'Saved cards listed: card type, last 4, expiry, billing name, default badge',priority:'Critical',type:'Positive'},
      {id:'BPY-002',name:'Add new credit card via Stripe Elements',pre:'Payment Methods tab; Add Card',steps:'1. Click Add Payment Method\n2. Enter valid test card details in Stripe Elements\n3. Submit',expected:'Card added; tokenized by Stripe; only last 4 + type stored on platform',priority:'Critical',type:'Positive'},
      {id:'BPY-003',name:'Full card number never stored in platform database',pre:'Card added',steps:'1. Check network requests and any API that returns card data',expected:'Only Stripe payment method ID, last 4, card type, expiry stored; no PAN in platform DB',priority:'Critical',type:'Security'},
      {id:'BPY-004',name:'Invalid card number rejected by Stripe',pre:'Add card form',steps:'1. Enter invalid card number\n2. Submit',expected:'Stripe validation error: "Invalid card number"',priority:'High',type:'Validation'},
      {id:'BPY-005',name:'Expired card rejected',pre:'Add card form',steps:'1. Enter card with past expiry date\n2. Submit',expected:'Error: "Your card\'s expiration date is in the past"',priority:'High',type:'Validation'},
      {id:'BPY-006',name:'CVC validation failure',pre:'Add card form',steps:'1. Enter wrong CVC\n2. Submit',expected:'Error: "Your card\'s security code is incorrect"',priority:'High',type:'Validation'},
      {id:'BPY-007',name:'Set a card as default payment method',pre:'Multiple cards saved',steps:'1. Click "Set as Default" on non-default card',expected:'Card marked as default; billing uses this card for next renewal',priority:'High',type:'Positive'},
      {id:'BPY-008',name:'Remove non-default payment method',pre:'Multiple cards; removing non-default',steps:'1. Click Remove on non-default card\n2. Confirm',expected:'Card removed from account',priority:'High',type:'Positive'},
      {id:'BPY-009',name:'Cannot remove the only/default payment method if subscription active',pre:'Only one card saved; active subscription',steps:'1. Click Remove on only card',expected:'Error: "Cannot remove your only payment method while subscription is active. Add another card first."',priority:'High',type:'Negative'},
      {id:'BPY-010',name:'Card expiry warning — email sent before card expires',pre:'Card expires next month',steps:'1. Check email 30 days before card expiry',expected:'Warning email: "Your card on file expires next month. Update it to avoid service interruption."',priority:'High',type:'Positive'},
      {id:'BPY-011',name:'Failed payment retry — automatic retry after 3, 5, 7 days',pre:'Payment fails',steps:'1. Simulate payment failure\n2. Check retry schedule',expected:'System retries on day 3, 5, 7; email notifications sent before each retry',priority:'High',type:'Positive'},
      {id:'BPY-012',name:'Account suspended after all retries exhausted',pre:'All retry attempts failed',steps:'1. All retries fail\n2. Admin logs in',expected:'Account suspended with payment required message; no data deleted yet',priority:'Critical',type:'Positive'},
      {id:'BPY-013',name:'Grace period before suspension — access continues briefly',pre:'Payment failed; grace period setting',steps:'1. Payment fails\n2. Check access within grace period (e.g., 7 days)',expected:'Access continues during grace period; warning banner shown to admin',priority:'High',type:'Positive'},
    ]
  },
  {
    code:'BILL-HIST',title:'Billing — Payment History & Invoices',cases:[
      {id:'BH-001',name:'Billing history shows all invoices with date, amount, status',pre:'Billing page; History tab',steps:'1. Click History/Invoices tab',expected:'List: invoice date, description, amount, status (Paid/Unpaid/Failed), download link',priority:'Critical',type:'Positive'},
      {id:'BH-002',name:'Filter billing history by status — Paid',pre:'History tab',steps:'1. Filter by "Paid"',expected:'Only paid invoices shown',priority:'High',type:'Positive'},
      {id:'BH-003',name:'Filter billing history by date range',pre:'History tab',steps:'1. Filter by Last Year',expected:'Only that year\'s invoices shown',priority:'Medium',type:'Positive'},
      {id:'BH-004',name:'Download individual invoice as PDF',pre:'History tab; invoice row',steps:'1. Click Download PDF on invoice',expected:'PDF invoice downloaded with invoice number, date, items, subtotal, tax, total',priority:'Critical',type:'Positive'},
      {id:'BH-005',name:'Invoice PDF contains correct company information',pre:'Company details configured in billing settings',steps:'1. Download invoice PDF\n2. Check company info',expected:'PDF shows company name, address, VAT/tax number as configured',priority:'High',type:'Positive'},
      {id:'BH-006',name:'Invoice PDF shows itemized line items',pre:'Invoice for plan + add-ons',steps:'1. Download PDF',expected:'Each charge shown as separate line item with description and amount',priority:'High',type:'Positive'},
      {id:'BH-007',name:'Failed invoice — shows retry or manual payment option',pre:'Failed invoice in list',steps:'1. View failed invoice row',expected:'"Pay Now" button visible; allows manual retry payment',priority:'High',type:'Positive'},
      {id:'BH-008',name:'Manual payment for failed invoice succeeds',pre:'Failed invoice; valid card on file',steps:'1. Click Pay Now\n2. Confirm',expected:'Payment processed; invoice status changes to Paid; access restored if suspended',priority:'Critical',type:'Positive'},
    ]
  },
  {
    code:'BILL-CFG',title:'Billing — Configuration & Settings',cases:[
      {id:'BC-001',name:'Configure billing contact email for invoices and renewal notices',pre:'Billing settings',steps:'1. Enter billing email "finance@company.com"\n2. Save',expected:'All billing-related emails sent to this address',priority:'High',type:'Positive'},
      {id:'BC-002',name:'Billing email invalid format rejected',pre:'Billing settings',steps:'1. Enter invalid email\n2. Save',expected:'Validation error: invalid email',priority:'High',type:'Validation'},
      {id:'BC-003',name:'Configure company name for invoices',pre:'Billing settings; company info',steps:'1. Enter company name\n2. Save',expected:'Company name shown on all generated invoices and receipts',priority:'High',type:'Positive'},
      {id:'BC-004',name:'Configure billing address for invoices',pre:'Billing settings',steps:'1. Enter address, city, country, ZIP\n2. Save',expected:'Full address shown on invoices',priority:'High',type:'Positive'},
      {id:'BC-005',name:'Configure VAT/tax number for invoices',pre:'Billing settings',steps:'1. Enter VAT number\n2. Save',expected:'VAT number shown on invoices for tax compliance',priority:'High',type:'Positive'},
      {id:'BC-006',name:'Auto-renewal enabled by default',pre:'Billing settings',steps:'1. Check auto-renewal toggle state',expected:'Auto-renewal is ON by default; subscription renews automatically',priority:'High',type:'Positive'},
      {id:'BC-007',name:'Disable auto-renewal',pre:'Billing settings; auto-renewal toggle',steps:'1. Toggle auto-renewal off\n2. Save',expected:'Subscription will not auto-renew; reminder emails sent before expiry',priority:'High',type:'Positive'},
      {id:'BC-008',name:'Only super_admin can manage billing settings',pre:'Logged in as org_admin',steps:'1. Navigate to Billing page',expected:'Billing page hidden or read-only for org_admin; payment management restricted to super_admin',priority:'Critical',type:'Security'},
    ]
  },
];
