module.exports = [
  {
    code:'PROD-LIST',title:'Products — List Page',cases:[
      {id:'PRL-001',name:'Products list loads with name, type, price, status, revenue',pre:'Logged in; products exist',steps:'1. Click Products in sidebar\n2. Observe table',expected:'Table: product name, type (course/bundle/path/plan), price, status, total sales, revenue, created date',priority:'Critical',type:'Positive'},
      {id:'PRL-002',name:'Filter products by type — Courses only',pre:'Mixed product types',steps:'1. Select "Course" filter',expected:'Only course products shown',priority:'High',type:'Positive'},
      {id:'PRL-003',name:'Filter products by type — Subscriptions',pre:'Products list',steps:'1. Select "Subscription"',expected:'Only subscription plans shown',priority:'High',type:'Positive'},
      {id:'PRL-004',name:'Filter products by status — Active',pre:'Mixed active/inactive/archived',steps:'1. Select "Active" filter',expected:'Only active, purchasable products shown',priority:'High',type:'Positive'},
      {id:'PRL-005',name:'Search products by name',pre:'Products list',steps:'1. Enter partial name in search',expected:'Matching products shown',priority:'High',type:'Positive'},
      {id:'PRL-006',name:'Sort by revenue — highest first',pre:'Products list',steps:'1. Sort by Revenue',expected:'Highest revenue product at top',priority:'Medium',type:'Positive'},
      {id:'PRL-007',name:'Sort by price — lowest first',pre:'Products list',steps:'1. Sort by Price (Asc)',expected:'Cheapest product at top',priority:'Low',type:'Positive'},
      {id:'PRL-008',name:'Click product row opens product detail',pre:'Product in list',steps:'1. Click product name',expected:'Product detail with tabs: Info, Coupons, Buyers, Analytics',priority:'High',type:'Positive'},
      {id:'PRL-009',name:'Empty state when no products',pre:'No products created',steps:'1. Open Products',expected:'"No products yet" with Create button',priority:'Low',type:'Negative'},
      {id:'PRL-010',name:'Products total revenue shown in page summary',pre:'Products page with sales',steps:'1. View page header or summary bar',expected:'Total revenue across all products shown',priority:'Medium',type:'Positive'},
    ]
  },
  {
    code:'PROD-FORM',title:'Products — Create & Edit',cases:[
      {id:'PF-001',name:'Create one-time purchase product for a course',pre:'Course exists; Create Product',steps:'1. Select type "Course"\n2. Link to existing course\n3. Set price $49\n4. Set name "Finance Fundamentals"\n5. Save',expected:'Product created; course purchasable at $49; appears in storefront',priority:'Critical',type:'Positive'},
      {id:'PF-002',name:'Create subscription plan product',pre:'Create Product form',steps:'1. Select type "Subscription"\n2. Set billing cycle "Monthly"\n3. Price $29/month\n4. Name "Pro Monthly"\n5. Save',expected:'Subscription plan created; recurring billing configured',priority:'Critical',type:'Positive'},
      {id:'PF-003',name:'Product name required — blank fails',pre:'Create form',steps:'1. Leave name blank\n2. Save',expected:'Required field error',priority:'Critical',type:'Validation'},
      {id:'PF-004',name:'Product price required for paid product',pre:'Paid product form',steps:'1. Leave price blank\n2. Save',expected:'Required field error',priority:'Critical',type:'Validation'},
      {id:'PF-005',name:'Price must be positive number',pre:'Create form',steps:'1. Enter -$5\n2. Save',expected:'Validation error: price must be ≥ 0',priority:'High',type:'Validation'},
      {id:'PF-006',name:'Free product — price $0 allowed',pre:'Create form',steps:'1. Enter price $0\n2. Save',expected:'Product created as free; no payment at checkout',priority:'High',type:'Positive'},
      {id:'PF-007',name:'Subscription — set trial period',pre:'Subscription product form; trial field',steps:'1. Set 14-day free trial\n2. Save',expected:'First 14 days free; billing starts after trial; trial shown in product description',priority:'High',type:'Positive'},
      {id:'PF-008',name:'Subscription — billing cycle required',pre:'Subscription form',steps:'1. Leave billing cycle blank\n2. Save',expected:'Required field error: billing cycle must be selected',priority:'High',type:'Validation'},
      {id:'PF-009',name:'Subscription — annual billing with discount option',pre:'Subscription form',steps:'1. Set annual cycle with 20% discount\n2. Save',expected:'Annual plan shows "Save 20%" in learner portal',priority:'Medium',type:'Positive'},
      {id:'PF-010',name:'Link product to specific content (course/bundle/pathway)',pre:'Create product form',steps:'1. Select "Link to content"\n2. Search and select a course\n3. Save',expected:'Purchasing product grants access to that specific content',priority:'Critical',type:'Positive'},
      {id:'PF-011',name:'Set product thumbnail and description',pre:'Create product; thumbnail and description fields',steps:'1. Upload thumbnail\n2. Add marketing description\n3. Save',expected:'Thumbnail and description shown in storefront/checkout page',priority:'High',type:'Positive'},
      {id:'PF-012',name:'Activate product — makes it purchasable',pre:'Draft product',steps:'1. Click Activate/Publish\n2. Confirm',expected:'Product live; appears in learner storefront; can be purchased',priority:'Critical',type:'Positive'},
      {id:'PF-013',name:'Deactivate product — removes from storefront, preserves buyer access',pre:'Active product with buyers',steps:'1. Deactivate product\n2. Check storefront\n3. Check existing buyer access',expected:'Product hidden from storefront; existing buyers retain access',priority:'High',type:'Positive'},
      {id:'PF-014',name:'Archive product — permanent removal from sale',pre:'Deactivated product',steps:'1. Archive product\n2. Check existing buyers',expected:'Archived; never shown in storefront; buyer access preserved per policy',priority:'High',type:'Positive'},
      {id:'PF-015',name:'Delete product with no buyers — permanent deletion',pre:'Product with 0 buyers',steps:'1. Delete\n2. Confirm',expected:'Product permanently deleted',priority:'Medium',type:'Positive'},
      {id:'PF-016',name:'Delete product with buyers — blocked or warns',pre:'Product has 50 buyers',steps:'1. Try to delete',expected:'Block with: "Cannot delete product with existing buyers. Archive instead."',priority:'High',type:'Negative'},
      {id:'PF-017',name:'Tax rate configuration per product',pre:'Product edit form; tax section',steps:'1. Set tax rate 10%\n2. Save',expected:'Checkout adds 10% tax to product price; shown as separate line item',priority:'Medium',type:'Positive'},
      {id:'PF-018',name:'Currency setting — product in USD and EUR',pre:'Multi-currency enabled',steps:'1. Set product price in USD\n2. Add EUR equivalent\n3. Save',expected:'Learners see price in their currency; stripe handles currency conversion',priority:'Medium',type:'Positive'},
    ]
  },
  {
    code:'PROD-COUP',title:'Products — Coupons & Discounts',cases:[
      {id:'PC-001',name:'Create percentage discount coupon — SAVE20',pre:'Product detail; Coupons tab',steps:'1. Click Create Coupon\n2. Code "SAVE20"\n3. Type "Percentage"\n4. Value 20%\n5. Save',expected:'Coupon created; applying SAVE20 at checkout gives 20% off',priority:'Critical',type:'Positive'},
      {id:'PC-002',name:'Create fixed amount coupon — $10 off',pre:'Coupons tab',steps:'1. Code "FLAT10"\n2. Type "Fixed"\n3. Amount $10\n4. Save',expected:'FLAT10 gives $10 off at checkout',priority:'High',type:'Positive'},
      {id:'PC-003',name:'Coupon code required — blank fails',pre:'Create coupon form',steps:'1. Leave code blank\n2. Save',expected:'Required field error',priority:'High',type:'Validation'},
      {id:'PC-004',name:'Duplicate coupon code rejected',pre:'SAVE20 coupon exists',steps:'1. Create another "SAVE20"',expected:'Error: "Coupon code already in use"',priority:'High',type:'Validation'},
      {id:'PC-005',name:'Coupon code case-insensitive uniqueness (SAVE20 = save20)',pre:'SAVE20 exists',steps:'1. Try to create "save20"',expected:'Error: duplicate code (case-insensitive match)',priority:'Medium',type:'Validation'},
      {id:'PC-006',name:'Discount value > 100% rejected for percentage coupon',pre:'Create percentage coupon',steps:'1. Enter 150% discount\n2. Save',expected:'Validation error: percentage cannot exceed 100',priority:'High',type:'Validation'},
      {id:'PC-007',name:'Fixed coupon > product price — results in $0 minimum (not negative)',pre:'Product $20; coupon $30 off',steps:'1. Apply $30 coupon to $20 product at checkout',expected:'Total shows $0 (not negative); user not overcharged',priority:'High',type:'Boundary'},
      {id:'PC-008',name:'Set coupon expiry date',pre:'Create coupon; expiry field',steps:'1. Set expiry to specific date\n2. After expiry, try to use',expected:'Before expiry: works. After expiry: "Coupon has expired"',priority:'High',type:'Positive'},
      {id:'PC-009',name:'Set usage limit — max N redemptions',pre:'Create coupon; usage limit field',steps:'1. Set max uses to 50\n2. Save',expected:'After 50 uses, coupon shows "Coupon usage limit reached"',priority:'High',type:'Positive'},
      {id:'PC-010',name:'Usage limit race condition — two simultaneous uses at limit',pre:'Coupon with 1 use remaining; 2 concurrent checkouts',steps:'1. Two users apply coupon simultaneously at checkout',expected:'Only one succeeds; second gets "Coupon limit reached" error; database-level enforcement',priority:'Critical',type:'Security'},
      {id:'PC-011',name:'Per-user usage limit — one use per learner',pre:'Create coupon; per-user limit 1',steps:'1. Learner A uses coupon successfully\n2. Learner A tries to reuse',expected:'Second use rejected: "You have already used this coupon"',priority:'High',type:'Positive'},
      {id:'PC-012',name:'Coupon restricted to specific product only',pre:'Create coupon; product restriction',steps:'1. Restrict coupon to Product X\n2. Apply at checkout for Product Y',expected:'"This coupon is not valid for this product"',priority:'High',type:'Positive'},
      {id:'PC-013',name:'Deactivate coupon stops it from being used',pre:'Active coupon',steps:'1. Deactivate coupon\n2. Try to apply at checkout',expected:'"Invalid coupon code" error',priority:'High',type:'Positive'},
      {id:'PC-014',name:'Coupon usage report shows who used it and when',pre:'Coupon with uses; Coupons tab',steps:'1. Click coupon name\n2. View usage history',expected:'Table: learner email, used date, product purchased, discount applied',priority:'High',type:'Positive'},
      {id:'PC-015',name:'Delete coupon with uses — warns but allows',pre:'Coupon with 20 uses',steps:'1. Delete coupon\n2. Check previous orders',expected:'Coupon deleted; existing purchases show discount applied; no retroactive change',priority:'Medium',type:'Positive'},
      {id:'PC-016',name:'SQL injection in coupon code field rejected',pre:'Checkout coupon field',steps:'1. Enter "\'; DROP TABLE coupons;--"\n2. Apply',expected:'Treated as literal string; "Invalid coupon" returned; no SQL error',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'PROD-ANLT',title:'Products — Buyers & Analytics',cases:[
      {id:'PA-001',name:'Buyers tab shows all learners who purchased the product',pre:'Product detail; Buyers tab',steps:'1. Click Buyers tab',expected:'Table: learner name, email, purchase date, price paid, coupon used, refund status',priority:'Critical',type:'Positive'},
      {id:'PA-002',name:'Search buyers by email or name',pre:'Buyers tab',steps:'1. Enter name/email',expected:'Matching buyer rows shown',priority:'High',type:'Positive'},
      {id:'PA-003',name:'Filter buyers by date range',pre:'Buyers tab',steps:'1. Filter by Last 30 Days',expected:'Only purchases in that period shown',priority:'Medium',type:'Positive'},
      {id:'PA-004',name:'Export buyers list as CSV',pre:'Buyers tab',steps:'1. Click Export',expected:'CSV with buyer details and transaction info',priority:'High',type:'Positive'},
      {id:'PA-005',name:'Analytics tab shows revenue over time chart',pre:'Product detail; Analytics tab',steps:'1. Click Analytics tab',expected:'Line/bar chart: daily or monthly revenue for this product',priority:'High',type:'Positive'},
      {id:'PA-006',name:'Analytics shows total buyers and total revenue',pre:'Analytics tab',steps:'1. View metric cards',expected:'Total buyers count, total revenue, avg order value shown',priority:'High',type:'Positive'},
      {id:'PA-007',name:'Analytics shows coupon usage rate',pre:'Analytics tab; coupons used',steps:'1. View coupon metrics',expected:'% of orders using a coupon; most used coupon code',priority:'Medium',type:'Positive'},
      {id:'PA-008',name:'Analytics shows refund rate',pre:'Analytics tab',steps:'1. View refund metrics',expected:'Refund count and refund % of total revenue shown',priority:'Medium',type:'Positive'},
      {id:'PA-009',name:'Analytics date range filter updates chart and metrics',pre:'Analytics tab',steps:'1. Change to Last 90 Days',expected:'Chart and all metrics update to selected period',priority:'Medium',type:'Positive'},
      {id:'PA-010',name:'Org_admin cannot see product analytics for other orgs',pre:'Org_admin on own product analytics',steps:'1. Try to access other org product analytics via API',expected:'403 Forbidden',priority:'Critical',type:'Security'},
    ]
  },
  {
    code:'PROD-STNG',title:'Products — Pricing & Tax Settings',cases:[
      {id:'PST-001',name:'Configure default currency for all products',pre:'Products > Settings',steps:'1. Set default currency to USD\n2. Save',expected:'All new products default to USD pricing',priority:'High',type:'Positive'},
      {id:'PST-002',name:'Enable multi-currency support',pre:'Settings; multi-currency toggle',steps:'1. Toggle multi-currency on\n2. Save',expected:'Stripe handles currency conversion; learners see price in local currency',priority:'Medium',type:'Positive'},
      {id:'PST-003',name:'Configure tax settings — enable tax collection',pre:'Products Settings; Tax section',steps:'1. Enable tax collection\n2. Set default tax rate 15%\n3. Save',expected:'All products charge 15% tax at checkout unless individually overridden',priority:'High',type:'Positive'},
      {id:'PST-004',name:'Tax-exempt product configured at product level',pre:'Product edit; tax override',steps:'1. Set product tax to 0% override\n2. Save',expected:'This product charges no tax regardless of default setting',priority:'Medium',type:'Positive'},
      {id:'PST-005',name:'Receipt email template configured for purchases',pre:'Products Settings; receipt email',steps:'1. Configure receipt email template\n2. Test purchase\n3. Check email',expected:'Buyer receives formatted receipt email after successful purchase',priority:'High',type:'Positive'},
      {id:'PST-006',name:'Payment gateway not configured — product cannot go live',pre:'No Stripe configured',steps:'1. Try to activate a paid product',expected:'Error: "Configure a payment gateway in Settings before activating paid products"',priority:'Critical',type:'Validation'},
      {id:'PST-007',name:'Stripe webhook secret configured for payment events',pre:'Products Settings; webhook section',steps:'1. Set Stripe webhook signing secret\n2. Verify',expected:'Incoming Stripe webhooks validated with signing secret; prevents spoofed payment events',priority:'Critical',type:'Security'},
    ]
  },
];
