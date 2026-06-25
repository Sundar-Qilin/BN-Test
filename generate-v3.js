const ExcelJS = require('exceljs');
const path    = require('path');

const sections = [
  // Auth & Dashboard (already deep)
  ...require('./tc2-auth-dash'),

  // Organisations — expanded to 6 sub-sections
  ...require('./tc3-orgs'),

  // Divisions & Access — expanded to 4 sub-sections
  ...require('./tc3-divs'),

  // Users — expanded to 5 sub-sections
  ...require('./tc3-usrs'),

  // Invitees — expanded to 4 sub-sections
  ...require('./tc3-invt'),

  // Courses — already deep (6 sub-sections)
  ...require('./tc2-courses-list-info'),
  ...require('./tc2-courses-curriculum'),
  ...require('./tc2-courses-learners-settings'),

  // Media Library — expanded to 4 sub-sections
  ...require('./tc3-mlib'),

  // Module Library — expanded to 4 sub-sections
  ...require('./tc3-mdla'),

  // Instructors — expanded to 4 sub-sections
  ...require('./tc3-inst'),

  // Bundles — expanded to 5 sub-sections
  ...require('./tc3-bndl'),

  // Pathways — expanded to 5 sub-sections
  ...require('./tc3-path'),

  // Forums — expanded to 5 sub-sections
  ...require('./tc3-frms'),

  // Moderation — expanded to 4 sub-sections
  ...require('./tc3-modr'),

  // Rewards — expanded to 5 sub-sections
  ...require('./tc3-rwrd'),

  // Products — expanded to 5 sub-sections
  ...require('./tc3-prod'),

  // Transactions — expanded to 4 sub-sections
  ...require('./tc3-tran'),

  // Billing — expanded to 4 sub-sections
  ...require('./tc3-bill'),

  // Cohorts — new feature (course config, admin list, flags, detail, members, merge/split, delete, audit, learner, discussion, player, RBAC)
  ...require('./tc-cohorts'),

  // Settings (already deep — 65 cases in 8 sub-areas)
  ...require('./tc2-settings'),

  // Platform Security / Pentest (already comprehensive — 85 cases)
  ...require('./tc2-security'),
];

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  navy:'0E1C35', navy2:'1A3260', teal:'0EA87E', tealLt:'E6F7F2',
  white:'FFFFFF', bg:'F8F9FD', rowAlt:'F0F4FB', border:'DDE1EE',
  text:'1A2540', muted:'6B7A99',
  criTxt:'7C0404', criBg:'FFE4E4',
  hiTxt:'DC2626',  hiBg:'FEF2F2',
  mdTxt:'B45309',  mdBg:'FFFBEB',
  loTxt:'0EA87E',  loBg:'E6F7F2',
  posTxt:'065F46', posBg:'D1FAE5',
  negTxt:'5B21B6', negBg:'EDE9FE',
  bndTxt:'075985', bndBg:'E0F2FE',
  uiTxt:'92400E',  uiBg:'FEF3C7',
  valTxt:'1D4ED8', valBg:'EFF6FF',
  secTxt:'7C0404', secBg:'FFF1F2',
};
const fill = h => ({ type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+h } });
const bord = () => ({
  top:{style:'thin',color:{argb:'FFDDE1EE'}},
  left:{style:'thin',color:{argb:'FFDDE1EE'}},
  bottom:{style:'thin',color:{argb:'FFDDE1EE'}},
  right:{style:'thin',color:{argb:'FFDDE1EE'}},
});
const fnt  = (o={}) => ({ name:'Calibri', size:10, bold:!!o.bold, color:{ argb:'FF'+(o.color||C.text) } });
const algn = (h='left', wrap=true) => ({ vertical:'top', horizontal:h, wrapText:wrap });

const PRIORITY = {
  Critical:{ txt:C.criTxt, bg:C.criBg },
  High:    { txt:C.hiTxt,  bg:C.hiBg  },
  Medium:  { txt:C.mdTxt,  bg:C.mdBg  },
  Low:     { txt:C.loTxt,  bg:C.loBg  },
};
const TYPE = {
  Positive:   { txt:C.posTxt, bg:C.posBg },
  Negative:   { txt:C.negTxt, bg:C.negBg },
  Boundary:   { txt:C.bndTxt, bg:C.bndBg },
  'UI/UX':    { txt:C.uiTxt,  bg:C.uiBg  },
  Validation: { txt:C.valTxt, bg:C.valBg },
  Security:   { txt:C.secTxt, bg:C.secBg },
};

const COLS = [
  { header:'Test ID',         key:'id',       width:16 },
  { header:'Test Case',       key:'name',     width:44 },
  { header:'Precondition',    key:'pre',      width:36 },
  { header:'Steps',           key:'steps',    width:48 },
  { header:'Expected Result', key:'expected', width:52 },
  { header:'Priority',        key:'priority', width:11 },
  { header:'Type',            key:'type',     width:12 },
  { header:'Status',          key:'status',   width:10 },
  { header:'Notes / Actual',  key:'notes',    width:34 },
];

function badge(cell, map, val) {
  const s = map[val]; if (!s) return;
  cell.font = fnt({ bold:true, color:s.txt });
  cell.fill = fill(s.bg);
  cell.alignment = algn('center', false);
}

function headerRow(ws, rowNum, data, bg) {
  const row = ws.getRow(rowNum);
  data.forEach((v, i) => { row.getCell(i+1).value = v; });
  row.eachCell(c => {
    c.font = fnt({ bold:true, color:C.white });
    c.fill = fill(bg);
    c.border = bord();
    c.alignment = algn('center', false);
  });
  row.height = 22;
}

function sectionLabel(ws, rowNum, text, cols) {
  const row = ws.getRow(rowNum);
  row.getCell(1).value = text;
  ws.mergeCells(rowNum, 1, rowNum, cols);
  row.getCell(1).font = fnt({ bold:true, color:C.white });
  row.getCell(1).fill = fill(C.navy2);
  row.getCell(1).alignment = algn('left', false);
  row.height = 20;
}

function caseRow(ws, rowNum, tc, even) {
  const row = ws.getRow(rowNum);
  const bg = even ? C.rowAlt : C.white;
  [tc.id, tc.name, tc.pre, tc.steps, tc.expected, tc.priority, tc.type, '', ''].forEach((v, i) => {
    const c = row.getCell(i+1);
    c.value = v; c.fill = fill(bg); c.border = bord();
    c.alignment = algn('left'); c.font = fnt();
  });
  row.getCell(1).font = { name:'Courier New', size:10, bold:true, color:{ argb:'FF'+C.navy } };
  badge(row.getCell(6), PRIORITY, tc.priority);
  badge(row.getCell(7), TYPE, tc.type);
  const lines = (tc.steps||'').split('\n').length;
  row.height = Math.max(40, lines * 15);
}

async function build() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Budgetnista QA';
  wb.created = new Date();

  const total = sections.reduce((s, sec) => s + sec.cases.length, 0);
  const byType = {};
  sections.flatMap(s => s.cases).forEach(tc => { byType[tc.type] = (byType[tc.type]||0)+1; });

  // ── COVER ──────────────────────────────────────────────────────────────────
  const cover = wb.addWorksheet('Cover');
  cover.columns = [{ width:18 },{ width:48 },{ width:12 },{ width:22 },{ width:20 }];

  cover.mergeCells('A1:E1');
  const t = cover.getCell('A1');
  t.value = 'Budgetnista Admin — Complete Manual Test Suite v4 (+ Cohorts)';
  t.font  = { name:'Calibri', size:22, bold:true, color:{ argb:'FF'+C.white } };
  t.fill  = fill(C.navy);
  t.alignment = { vertical:'middle', horizontal:'center' };
  cover.getRow(1).height = 52;

  cover.mergeCells('A2:E2');
  const sub = cover.getCell('A2');
  sub.value = `${total} Test Cases  ·  ${sections.length} Sections  ·  Positive · Negative · Boundary · UI/UX · Validation · Security  ·  Generated 2026-06-25 (Cohorts added)`;
  sub.font  = { name:'Calibri', size:11, color:{ argb:'FF'+C.tealLt } };
  sub.fill  = fill(C.navy2);
  sub.alignment = { vertical:'middle', horizontal:'center' };
  cover.getRow(2).height = 28;
  cover.addRow([]);

  cover.mergeCells('A4:E4');
  const lh = cover.getCell('A4');
  lh.value = 'PRIORITY & TYPE LEGEND';
  lh.font  = fnt({ bold:true, color:C.white });
  lh.fill  = fill(C.teal);
  lh.alignment = algn('center', false);
  cover.getRow(4).height = 20;

  [
    ['PRIORITY','','TYPE','',''],
    ['Critical','Security-critical; auth bypass; data loss','Positive','Happy-path; valid inputs',''],
    ['High','Core functionality; main user flows','Negative','Invalid inputs; error paths',''],
    ['Medium','Important but non-blocking','Boundary','Max/min limits; edge values',''],
    ['Low','Cosmetic; nice-to-have','UI/UX','Layout; accessibility; responsive',''],
    ['','','Validation','Field constraints; format; required',''],
    ['','','Security','Pentest; OWASP Top 10; injection',''],
  ].forEach((r, ri) => {
    const row = cover.addRow(r);
    row.eachCell(c => { c.font = fnt(); c.border = bord(); c.fill = fill(C.bg); });
    if (ri === 0) row.eachCell(c => { c.font = fnt({ bold:true, color:C.muted }); c.fill = fill(C.rowAlt); });
    if (PRIORITY[r[0]]) badge(row.getCell(1), PRIORITY, r[0]);
    if (TYPE[r[2]])     badge(row.getCell(3), TYPE, r[2]);
  });

  cover.addRow([]);

  // Type summary
  cover.mergeCells(`A${cover.rowCount+1}:E${cover.rowCount+1}`);
  const sh = cover.getCell(`A${cover.rowCount}`);
  sh.value = 'TEST CASE TYPE SUMMARY';
  sh.font  = fnt({ bold:true, color:C.white });
  sh.fill  = fill(C.teal);
  sh.alignment = algn('center', false);
  cover.getRow(cover.rowCount).height = 20;

  Object.entries(byType).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => {
    const r = cover.addRow([k, v, `${((v/total)*100).toFixed(1)}%`, '', '']);
    if (TYPE[k]) badge(r.getCell(1), TYPE, k);
    r.getCell(2).font = fnt({ bold:true });
    r.getCell(3).font = fnt({ color:C.muted });
    r.eachCell(c => { c.border = bord(); });
  });

  cover.addRow([]);
  headerRow(cover, cover.rowCount+1, ['Section Code','Section Name','Cases','Sheet Tab',''], C.teal);

  // Group sections by feature group for cover display
  const groups = {
    'AUTH & DASHBOARD': ['AUTH','DASH'],
    'ORGANISATIONS': ['ORGS-LIST','ORGS-FORM','ORGS-MEMBERS','ORGS-COURSES','ORGS-STNG'],
    'DIVISIONS': ['DIVS-LIST','DIVS-FORM','DIVS-MEMBERS','DIVS-ACCESS'],
    'USERS': ['USRS-LIST','USRS-DETAIL','USRS-CRSES','USRS-ACTVT'],
    'INVITEES': ['INVT-LIST','INVT-SEND','INVT-BULK','INVT-MGMT'],
    'COURSES': ['CRSE-LIST','CRSE-INFO','CRSE-CURR','CRSE-LRNR','CRSE-STNG','CRSE-ANLT'],
    'MEDIA LIBRARY': ['MLIB-UPLD','MLIB-FLDR','MLIB-SRCH','MLIB-MGMT'],
    'MODULE LIBRARY': ['MDLA-LIST','MDLA-FORM','MDLA-LSNS','MDLA-REUSE'],
    'INSTRUCTORS': ['INST-LIST','INST-PROF','INST-CRSES','INST-ANLT'],
    'BUNDLES': ['BNDL-LIST','BNDL-FORM','BNDL-CRSES','BNDL-LRNR','BNDL-ANLT'],
    'PATHWAYS': ['PATH-LIST','PATH-FORM','PATH-SEQ','PATH-LRNR','PATH-ANLT'],
    'FORUMS': ['FRMS-CAT','FRMS-THRD','FRMS-RPLY','FRMS-SRCH','FRMS-MODS'],
    'MODERATION': ['MODR-QUEUE','MODR-ACTN','MODR-LOG','MODR-CFG'],
    'REWARDS': ['RWRD-RULES','RWRD-BDGS','RWRD-LBRD','RWRD-HIST','RWRD-LVLS'],
    'PRODUCTS': ['PROD-LIST','PROD-FORM','PROD-COUP','PROD-ANLT','PROD-STNG'],
    'TRANSACTIONS': ['TRAN-LIST','TRAN-DETL','TRAN-RFND','TRAN-EXPO'],
    'BILLING': ['BILL-PLAN','BILL-PAY','BILL-HIST','BILL-CFG'],
    'COHORTS': ['COHT-CRSE','COHT-LIST','COHT-FLGS','COHT-DETL','COHT-MBRS','COHT-MSPL','COHT-DELT','COHT-AUDT','COHT-LRNR','COHT-DISC','COHT-PLYR','COHT-RBAC'],
    'SETTINGS': ['STNG'],
    'SECURITY / PENTEST': ['PSEC'],
  };

  sections.forEach(s => {
    const r = cover.addRow([s.code, s.title, s.cases.length, s.code.slice(0,31), '']);
    r.getCell(1).font = { name:'Courier New', size:10, bold:true, color:{ argb:'FF'+C.navy } };
    r.getCell(3).font = fnt({ bold:true });
    r.getCell(3).alignment = algn('center', false);
    r.eachCell(c => { c.border = bord(); });
  });
  const tot = cover.addRow(['','TOTAL', total,'','']);
  tot.getCell(2).font = fnt({ bold:true });
  tot.getCell(3).font = fnt({ bold:true });
  tot.getCell(3).alignment = algn('center', false);
  tot.eachCell(c => { c.fill = fill(C.tealLt); c.border = bord(); });

  // ── ALL TESTS ──────────────────────────────────────────────────────────────
  const all = wb.addWorksheet('All Tests');
  all.columns = COLS;
  headerRow(all, 1, COLS.map(c => c.header), C.navy);
  all.views = [{ state:'frozen', ySplit:1 }];
  all.autoFilter = { from:'A1', to:'I1' };

  let ar = 2;
  sections.forEach(sec => {
    sectionLabel(all, ar, sec.code+' — '+sec.title, COLS.length); ar++;
    sec.cases.forEach((tc, i) => { caseRow(all, ar, tc, i%2===1); ar++; });
  });

  // ── Per-section sheets ─────────────────────────────────────────────────────
  sections.forEach(sec => {
    const tabName = sec.code.slice(0,31);
    const ws = wb.addWorksheet(tabName);
    ws.columns = COLS;

    ws.mergeCells('A1:I1');
    ws.getCell('A1').value = sec.code+' — '+sec.title;
    ws.getCell('A1').font  = fnt({ bold:true, color:C.white });
    ws.getCell('A1').fill  = fill(C.navy);
    ws.getCell('A1').alignment = algn('left', false);
    ws.getRow(1).height = 28;

    headerRow(ws, 2, COLS.map(c => c.header), C.teal);
    ws.views = [{ state:'frozen', ySplit:2 }];
    ws.autoFilter = { from:'A2', to:'I2' };

    sec.cases.forEach((tc, i) => caseRow(ws, i+3, tc, i%2===1));
  });

  // ── Write file ─────────────────────────────────────────────────────────────
  const outPath = path.join(__dirname, 'Budgetnista-Complete-Test-Suite.xlsx');
  await wb.xlsx.writeFile(outPath);

  console.log('\n✓ Written:', outPath);
  console.log('  Sections :', sections.length);
  console.log('  Total TCs:', total);
  console.log('\n  By Type:');
  Object.entries(byType).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) =>
    console.log(`    ${k.padEnd(12)}: ${v} (${((v/total)*100).toFixed(1)}%)`));
  console.log('\n  By Priority:');
  const byPri = {};
  sections.flatMap(s=>s.cases).forEach(tc=>{ byPri[tc.priority]=(byPri[tc.priority]||0)+1; });
  ['Critical','High','Medium','Low'].forEach(p =>
    console.log(`    ${p.padEnd(10)}: ${byPri[p]||0}`));
}

build().catch(e => { console.error(e); process.exit(1); });
