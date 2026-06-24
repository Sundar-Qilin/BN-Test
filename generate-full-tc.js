const ExcelJS = require('exceljs');
const path    = require('path');

const part1 = require('./tc-data-part1');
const part2 = require('./tc-data-part2');
const part3 = require('./tc-data-part3');
const sections = [...part1, ...part2, ...part3];

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy:'0E1C35', navy2:'1A3260', teal:'0EA87E', tealLt:'E6F7F2',
  white:'FFFFFF', bg:'F8F9FD', rowAlt:'F0F4FB', border:'DDE1EE',
  text:'1A2540', muted:'6B7A99',
  // Priority
  criTxt:'7C0404', criBg:'FFE4E4',
  hiTxt:'DC2626',  hiBg:'FEF2F2',
  mdTxt:'B45309',  mdBg:'FFFBEB',
  loTxt:'0EA87E',  loBg:'E6F7F2',
  // Type
  posTxt:'065F46', posBg:'D1FAE5',
  negTxt:'5B21B6', negBg:'EDE9FE',
  bndTxt:'075985', bndBg:'E0F2FE',
  uiTxt:'92400E',  uiBg:'FEF3C7',
  valTxt:'1D4ED8', valBg:'EFF6FF',
  secTxt:'7C0404', secBg:'FFF1F2',
};

const fill  = hex => ({ type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+hex } });
const bord  = () => ({ top:{style:'thin',color:{argb:'FF'+C.border}}, left:{style:'thin',color:{argb:'FF'+C.border}}, bottom:{style:'thin',color:{argb:'FF'+C.border}}, right:{style:'thin',color:{argb:'FF'+C.border}} });
const fnt   = (o={}) => ({ name:'Calibri', size:10, bold:!!o.bold, italic:!!o.italic, color:{ argb:'FF'+(o.color||C.text) } });
const algn  = (h='left', wrap=true) => ({ vertical:'top', horizontal:h, wrapText:wrap });

const PRIORITY = {
  Critical: { txt: C.criTxt, bg: C.criBg },
  High:     { txt: C.hiTxt,  bg: C.hiBg  },
  Medium:   { txt: C.mdTxt,  bg: C.mdBg  },
  Low:      { txt: C.loTxt,  bg: C.loBg  },
};
const TYPE = {
  Positive:   { txt: C.posTxt, bg: C.posBg },
  Negative:   { txt: C.negTxt, bg: C.negBg },
  Boundary:   { txt: C.bndTxt, bg: C.bndBg },
  'UI/UX':    { txt: C.uiTxt,  bg: C.uiBg  },
  Validation: { txt: C.valTxt, bg: C.valBg },
  Security:   { txt: C.secTxt, bg: C.secBg },
};

const COLS = [
  { header:'Test ID',         key:'id',       width:16 },
  { header:'Test Case',       key:'name',     width:40 },
  { header:'Precondition',    key:'pre',      width:34 },
  { header:'Steps',           key:'steps',    width:44 },
  { header:'Expected Result', key:'expected', width:48 },
  { header:'Priority',        key:'priority', width:11 },
  { header:'Type',            key:'type',     width:12 },
  { header:'Status',          key:'status',   width:10 },
  { header:'Notes / Actual',  key:'notes',    width:32 },
];

function applyBadge(cell, map, value) {
  const style = map[value];
  if (!style) return;
  cell.font = fnt({ bold:true, color: style.txt });
  cell.fill = fill(style.bg);
  cell.alignment = algn('center', false);
}

function writeHeaderRow(ws, rowNum, rowData, bgHex) {
  const row = ws.getRow(rowNum);
  rowData.forEach((val, i) => { row.getCell(i+1).value = val; });
  row.eachCell(c => {
    c.font = fnt({ bold:true, color: C.white });
    c.fill = fill(bgHex);
    c.border = bord();
    c.alignment = algn('center', false);
  });
  row.height = 22;
  return row;
}

function writeSectionLabel(ws, rowNum, text, colCount) {
  const row = ws.getRow(rowNum);
  row.getCell(1).value = text;
  ws.mergeCells(rowNum, 1, rowNum, colCount);
  row.getCell(1).font = fnt({ bold:true, color: C.white });
  row.getCell(1).fill = fill(C.navy2);
  row.getCell(1).alignment = algn('left', false);
  row.height = 20;
}

function writeCaseRow(ws, rowNum, tc, isEven) {
  const row = ws.getRow(rowNum);
  const bg = isEven ? C.rowAlt : C.white;
  [tc.id, tc.name, tc.pre, tc.steps, tc.expected, tc.priority, tc.type, '', ''].forEach((v,i) => {
    const cell = row.getCell(i+1);
    cell.value  = v;
    cell.fill   = fill(bg);
    cell.border = bord();
    cell.alignment = algn('left');
    cell.font   = fnt();
  });
  // ID — courier look
  row.getCell(1).font = { name:'Courier New', size:10, bold:true, color:{ argb:'FF'+C.navy } };
  // Priority badge
  applyBadge(row.getCell(6), PRIORITY, tc.priority);
  // Type badge
  applyBadge(row.getCell(7), TYPE, tc.type);
  // row height based on step lines
  const stepLines = (tc.steps || '').split('\n').length;
  row.height = Math.max(40, stepLines * 16);
}

// ── Build workbook ────────────────────────────────────────────────────────────
async function build() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Budgetnista QA';
  wb.created = new Date();

  const totalCases = sections.reduce((s,sec) => s + sec.cases.length, 0);

  // ── COVER ──────────────────────────────────────────────────────────────────
  const cover = wb.addWorksheet('Cover');
  cover.columns = [
    { width:16 }, { width:42 }, { width:12 }, { width:18 }, { width:18 }
  ];

  cover.mergeCells('A1:E1');
  const titleCell = cover.getCell('A1');
  titleCell.value = 'Budgetnista Admin — Full Site Manual Test Suite';
  titleCell.font  = { name:'Calibri', size:22, bold:true, color:{ argb:'FF'+C.white } };
  titleCell.fill  = fill(C.navy);
  titleCell.alignment = { vertical:'middle', horizontal:'center' };
  cover.getRow(1).height = 52;

  cover.mergeCells('A2:E2');
  const subCell = cover.getCell('A2');
  subCell.value = `${totalCases} Test Cases  ·  ${sections.length} Sections  ·  Positive · Negative · Boundary · UI/UX · Validation · Security/Penetration  ·  Generated: 2026-06-24`;
  subCell.font  = { name:'Calibri', size:11, color:{ argb:'FF'+C.tealLt } };
  subCell.fill  = fill(C.navy2);
  subCell.alignment = { vertical:'middle', horizontal:'center' };
  cover.getRow(2).height = 28;

  cover.addRow([]);

  // Legend
  cover.mergeCells('A4:E4');
  cover.getCell('A4').value = 'PRIORITY & TYPE LEGEND';
  cover.getCell('A4').font  = fnt({ bold:true, color: C.white });
  cover.getCell('A4').fill  = fill(C.teal);
  cover.getCell('A4').alignment = algn('center', false);
  cover.getRow(4).height = 20;

  const legendItems = [
    ['PRIORITY', '', 'TYPE', '', ''],
    ['Critical', 'Security-critical issues', 'Positive', 'Happy-path scenarios', ''],
    ['High',     'Core functionality',       'Negative', 'Invalid input / error paths', ''],
    ['Medium',   'Important but not blocking','Boundary','Edge cases / limits', ''],
    ['Low',      'Nice-to-have / cosmetic',  'UI/UX',   'Layout, accessibility, visuals', ''],
    ['',         '',                          'Validation','Form field constraints', ''],
    ['',         '',                          'Security', 'Penetration & security testing', ''],
  ];
  legendItems.forEach((row, ri) => {
    const r = cover.addRow(row);
    r.eachCell(c => { c.font = fnt(); c.border = bord(); c.fill = fill(C.bg); });
    if (ri === 0) {
      r.eachCell(c => { c.font = fnt({ bold:true, color: C.muted }); c.fill = fill(C.rowAlt); });
    }
    // colour the badge cells
    const pKey = row[0]; const tKey = row[2];
    if (PRIORITY[pKey]) applyBadge(r.getCell(1), PRIORITY, pKey);
    if (TYPE[tKey])     applyBadge(r.getCell(3), TYPE, tKey);
  });

  cover.addRow([]);

  // Section index
  writeHeaderRow(cover, cover.rowCount + 1,
    ['Section Code', 'Section Name', 'Cases', 'Sheet Tab', ''], C.teal);

  sections.forEach(s => {
    const r = cover.addRow([s.code, s.title, s.cases.length, s.code, '']);
    r.getCell(1).font = { name:'Courier New', size:10, bold:true, color:{ argb:'FF'+C.navy } };
    r.getCell(2).font = fnt();
    r.getCell(3).font = fnt({ bold:true });
    r.getCell(3).alignment = algn('center', false);
    r.eachCell(c => { c.border = bord(); });
  });

  const totRow = cover.addRow(['', 'TOTAL', totalCases, '', '']);
  totRow.getCell(2).font = fnt({ bold:true });
  totRow.getCell(3).font = fnt({ bold:true });
  totRow.getCell(3).alignment = algn('center', false);
  totRow.eachCell(c => { c.fill = fill(C.tealLt); c.border = bord(); });

  // ── ALL TESTS sheet ────────────────────────────────────────────────────────
  const allWs = wb.addWorksheet('All Tests');
  allWs.columns = COLS;
  writeHeaderRow(allWs, 1, COLS.map(c => c.header), C.navy);
  allWs.views = [{ state:'frozen', ySplit:1 }];
  allWs.autoFilter = { from:'A1', to:'I1' };

  let allRow = 2;
  sections.forEach(sec => {
    writeSectionLabel(allWs, allRow, sec.code + ' — ' + sec.title, COLS.length);
    allRow++;
    sec.cases.forEach((tc, i) => {
      writeCaseRow(allWs, allRow, tc, i % 2 === 1);
      allRow++;
    });
  });

  // ── Per-section sheets ─────────────────────────────────────────────────────
  sections.forEach(sec => {
    const ws = wb.addWorksheet(sec.code);
    ws.columns = COLS;

    // Title row
    ws.mergeCells('A1:I1');
    ws.getCell('A1').value = sec.code + ' — ' + sec.title;
    ws.getCell('A1').font  = fnt({ bold:true, color: C.white });
    ws.getCell('A1').fill  = fill(C.navy);
    ws.getCell('A1').alignment = algn('left', false);
    ws.getRow(1).height = 28;

    // Header row
    writeHeaderRow(ws, 2, COLS.map(c => c.header), C.teal);
    ws.views = [{ state:'frozen', ySplit:2 }];
    ws.autoFilter = { from:'A2', to:'I2' };

    sec.cases.forEach((tc, i) => {
      writeCaseRow(ws, i + 3, tc, i % 2 === 1);
    });
  });

  // ── Write file ─────────────────────────────────────────────────────────────
  const outPath = path.join(__dirname, 'Budgetnista-Full-Site-Test-Cases.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log(`\n✓ Written: ${outPath}`);
  console.log(`  Sections : ${sections.length}`);
  console.log(`  Total TCs: ${totalCases}`);
}

build().catch(e => { console.error(e); process.exit(1); });
