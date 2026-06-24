const ExcelJS = require('exceljs');
const path    = require('path');

const sections = [
  ...require('./tc2-auth-dash'),
  ...require('./tc2-people'),
  ...require('./tc2-courses-list-info'),
  ...require('./tc2-courses-curriculum'),
  ...require('./tc2-courses-learners-settings'),
  ...require('./tc2-content'),
  ...require('./tc2-community'),
  ...require('./tc2-commerce'),
  ...require('./tc2-settings'),
  ...require('./tc2-security'),
];

// ── Palette ──────────────────────────────────────────────────────────────────
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
  { header:'Test Case',       key:'name',     width:42 },
  { header:'Precondition',    key:'pre',      width:36 },
  { header:'Steps',           key:'steps',    width:46 },
  { header:'Expected Result', key:'expected', width:50 },
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

  // ── COVER ──────────────────────────────────────────────────────────────────
  const cover = wb.addWorksheet('Cover');
  cover.columns = [{ width:16 },{ width:44 },{ width:12 },{ width:20 },{ width:20 }];

  cover.mergeCells('A1:E1');
  const t = cover.getCell('A1');
  t.value = 'Budgetnista Admin — Complete Manual Test Suite v2';
  t.font  = { name:'Calibri', size:22, bold:true, color:{ argb:'FF'+C.white } };
  t.fill  = fill(C.navy);
  t.alignment = { vertical:'middle', horizontal:'center' };
  cover.getRow(1).height = 52;

  cover.mergeCells('A2:E2');
  const sub = cover.getCell('A2');
  sub.value = `${total} Test Cases  ·  ${sections.length} Sections  ·  Positive · Negative · Boundary · UI/UX · Validation · Security/Pentest  ·  Generated 2026-06-24`;
  sub.font  = { name:'Calibri', size:11, color:{ argb:'FF'+C.tealLt } };
  sub.fill  = fill(C.navy2);
  sub.alignment = { vertical:'middle', horizontal:'center' };
  cover.getRow(2).height = 28;
  cover.addRow([]);

  // Legend header
  cover.mergeCells('A4:E4');
  const lh = cover.getCell('A4');
  lh.value = 'PRIORITY & TYPE LEGEND';
  lh.font  = fnt({ bold:true, color:C.white });
  lh.fill  = fill(C.teal);
  lh.alignment = algn('center', false);
  cover.getRow(4).height = 20;

  [
    ['PRIORITY','','TYPE','',''],
    ['Critical','Security-critical; auth bypass; data loss','Positive','Happy-path; valid inputs; expected success',''],
    ['High','Core functionality; main user flows','Negative','Invalid inputs; error paths; rejection',''],
    ['Medium','Important but non-blocking','Boundary','Max/min limits; edge case values',''],
    ['Low','Cosmetic; nice-to-have','UI/UX','Layout; accessibility; responsive; visuals',''],
    ['','','Validation','Field constraints; format; regex; required',''],
    ['','','Security','Pentest; injection; auth; OWASP Top 10',''],
  ].forEach((r, ri) => {
    const row = cover.addRow(r);
    row.eachCell(c => { c.font = fnt(); c.border = bord(); c.fill = fill(C.bg); });
    if (ri === 0) row.eachCell(c => { c.font = fnt({ bold:true, color:C.muted }); c.fill = fill(C.rowAlt); });
    if (PRIORITY[r[0]]) badge(row.getCell(1), PRIORITY, r[0]);
    if (TYPE[r[2]])     badge(row.getCell(3), TYPE, r[2]);
  });

  cover.addRow([]);
  headerRow(cover, cover.rowCount+1, ['Section Code','Section Name','Cases','Sheet Tab',''], C.teal);

  sections.forEach(s => {
    const r = cover.addRow([s.code, s.title, s.cases.length, s.code, '']);
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
    // Excel sheet name: max 31 chars
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
  const byType = {};
  sections.flatMap(s => s.cases).forEach(tc => { byType[tc.type] = (byType[tc.type]||0)+1; });
  Object.entries(byType).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k.padEnd(12)}: ${v}`));
}

build().catch(e => { console.error(e); process.exit(1); });
