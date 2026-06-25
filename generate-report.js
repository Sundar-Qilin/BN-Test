#!/usr/bin/env node
/**
 * Generates a comprehensive HTML test report combining:
 * - Playwright automation results (from playwright-report/results.json)
 * - All manual test cases (from tc-data-part1/2/3 + tc-cohorts)
 */

const fs = require('fs');

// ── Load all test cases ──────────────────────────────────────────────────────
const allSections = [
  ...require('./tc2-auth-dash'),
  ...require('./tc3-orgs'),
  ...require('./tc3-divs'),
  ...require('./tc3-usrs'),
  ...require('./tc3-invt'),
  ...require('./tc2-courses-list-info'),
  ...require('./tc2-courses-curriculum'),
  ...require('./tc2-courses-learners-settings'),
  ...require('./tc3-mlib'),
  ...require('./tc3-mdla'),
  ...require('./tc3-inst'),
  ...require('./tc3-bndl'),
  ...require('./tc3-path'),
  ...require('./tc3-frms'),
  ...require('./tc3-modr'),
  ...require('./tc3-rwrd'),
  ...require('./tc3-prod'),
  ...require('./tc3-tran'),
  ...require('./tc3-bill'),
  ...require('./tc-cohorts'),
  ...require('./tc2-settings'),
  ...require('./tc2-security'),
];

// Build flat map: id → {id, name, pre, steps, expected, priority, type, section}
const tcMap = {};
allSections.forEach(sec => {
  sec.cases.forEach(tc => {
    tcMap[tc.id] = { ...tc, sectionCode: sec.code, sectionTitle: sec.title };
  });
});

// ── Load Playwright JSON results ────────────────────────────────────────────
let playwrightResults = null;
const jsonPath = 'playwright-report/results-raw.json';
if (fs.existsSync(jsonPath)) {
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    // Skip dotenvx/console header lines — find the first line that starts with '{'
    const lines = raw.split('\n');
    let jsonStart = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('{')) { jsonStart = i; break; }
    }
    playwrightResults = JSON.parse(lines.slice(jsonStart).join('\n'));
  } catch (e) {
    console.warn('Could not parse results.json:', e.message);
  }
}

// ── Parse Playwright results into flat test list ─────────────────────────────
// Maps TC id → {status, title, duration, error}
const automatedResults = {};
let totalAutomated = 0, totalPass = 0, totalFail = 0, totalFlaky = 0, totalSkip = 0;

function walkSuites(suites) {
  if (!suites) return;
  suites.forEach(suite => {
    if (suite.suites) walkSuites(suite.suites);
    if (suite.specs) {
      suite.specs.forEach(spec => {
        spec.tests && spec.tests.forEach(test => {
          const title = spec.title;
          // Extract ID from title — e.g. "CL-001 Cohorts…" or "CS-001 Course…"
          const idMatch = title.match(/^([A-Z]{1,5}-\d{3}[a-z]?)\b/);
          const tcId = idMatch ? idMatch[1] : null;

          // Determine final status across retries
          const results = test.results || [];
          let status = test.status || 'unknown';
          if (status === 'unexpected') status = 'FAIL';
          else if (status === 'expected') status = 'PASS';
          else if (status === 'flaky') status = 'FLAKY';
          else if (status === 'skipped') status = 'SKIP';
          else status = status.toUpperCase();

          const duration = results.reduce((s, r) => s + (r.duration || 0), 0);
          const errorMsg = results.map(r => r.error?.message || '').filter(Boolean).join('\n').slice(0, 300);

          totalAutomated++;
          if (status === 'PASS') totalPass++;
          else if (status === 'FAIL') totalFail++;
          else if (status === 'FLAKY') { totalFlaky++; totalPass++; }
          else if (status === 'SKIP') totalSkip++;

          const entry = { status, title, duration, errorMsg, tcId };
          if (tcId) {
            automatedResults[tcId] = entry;
          }
          // Also store by full title for unmatched tests
          automatedResults['__title__' + title] = entry;
        });
      });
    }
  });
}

if (playwrightResults) {
  walkSuites(playwrightResults.suites);
}

// ── Stats ────────────────────────────────────────────────────────────────────
// Count all cases including those with duplicate IDs across sections
const totalTCs = allSections.reduce((s, sec) => s + sec.cases.length, 0);
// Count how many TCs (including dups) have automated coverage
const automatedCoverageCount = allSections.reduce((s, sec) => s + sec.cases.filter(tc => automatedResults[tc.id]).length, 0);
const totalManual = totalTCs - automatedCoverageCount;

// Section-level stats
const sectionStats = {};
allSections.forEach(sec => {
  let pass = 0, fail = 0, flaky = 0, skip = 0, manual = 0;
  sec.cases.forEach(tc => {
    const r = automatedResults[tc.id];
    if (!r) { manual++; }
    else if (r.status === 'PASS') pass++;
    else if (r.status === 'FAIL') fail++;
    else if (r.status === 'FLAKY') flaky++;
    else if (r.status === 'SKIP') skip++;
    else manual++;
  });
  sectionStats[sec.code] = { pass, fail, flaky, skip, manual, total: sec.cases.length };
});

// ── HTML helpers ─────────────────────────────────────────────────────────────
const statusBadge = (s) => {
  const map = {
    PASS:   ['#16a34a', '#dcfce7', '✓ PASS'],
    FAIL:   ['#dc2626', '#fee2e2', '✗ FAIL'],
    FLAKY:  ['#d97706', '#fef3c7', '~ FLAKY'],
    SKIP:   ['#6b7280', '#f3f4f6', '— SKIP'],
    MANUAL: ['#7c3aed', '#ede9fe', '⊙ MANUAL'],
  };
  const [color, bg, label] = map[s] || ['#374151', '#f9fafb', s];
  return `<span style="background:${bg};color:${color};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;white-space:nowrap">${label}</span>`;
};

const priorityBadge = (p) => {
  const map = { Critical: '#dc2626', High: '#ea580c', Medium: '#ca8a04', Low: '#6b7280' };
  const color = map[p] || '#374151';
  return `<span style="color:${color};font-weight:600;font-size:11px">${p || ''}</span>`;
};

const pct = (n, d) => d === 0 ? '0' : Math.round(n / d * 100);

const sectionRow = (sec) => {
  const st = sectionStats[sec.code];
  const auto = st.pass + st.fail + st.flaky + st.skip;
  const passRate = auto > 0 ? pct(st.pass + st.flaky, auto) : null;
  const barParts = [];
  if (st.pass) barParts.push(`<div style="flex:${st.pass};background:#16a34a" title="${st.pass} pass"></div>`);
  if (st.flaky) barParts.push(`<div style="flex:${st.flaky};background:#d97706" title="${st.flaky} flaky"></div>`);
  if (st.fail) barParts.push(`<div style="flex:${st.fail};background:#dc2626" title="${st.fail} fail"></div>`);
  if (st.skip) barParts.push(`<div style="flex:${st.skip};background:#9ca3af" title="${st.skip} skip"></div>`);
  if (st.manual) barParts.push(`<div style="flex:${st.manual};background:#ddd6fe" title="${st.manual} manual"></div>`);
  const bar = `<div style="display:flex;height:8px;border-radius:4px;overflow:hidden;min-width:80px">${barParts.join('')}</div>`;
  const passCell = passRate !== null
    ? `<span style="color:${passRate >= 80 ? '#16a34a' : passRate >= 50 ? '#d97706' : '#dc2626'};font-weight:700">${passRate}%</span>`
    : `<span style="color:#9ca3af">—</span>`;
  return `<tr class="sec-hdr" data-sec="${sec.code}" onclick="toggleSection('${sec.code}')">
    <td style="padding:8px 12px;cursor:pointer">
      <span class="toggle-icon" id="icon-${sec.code}">▶</span>
      <strong>${sec.code}</strong> <span style="color:#6b7280;font-size:12px">— ${sec.title}</span>
    </td>
    <td style="padding:8px 12px;text-align:center">${st.total}</td>
    <td style="padding:8px 12px;text-align:center"><span style="color:#16a34a;font-weight:600">${st.pass}</span>${st.flaky ? `<span style="color:#d97706;font-size:11px"> +${st.flaky}~</span>` : ''}</td>
    <td style="padding:8px 12px;text-align:center"><span style="color:#dc2626;font-weight:600">${st.fail}</span></td>
    <td style="padding:8px 12px;text-align:center"><span style="color:#7c3aed">${st.manual}</span></td>
    <td style="padding:8px 12px;text-align:center">${passCell}</td>
    <td style="padding:8px 12px">${bar}</td>
  </tr>`;
};

const tcRow = (tc, sec) => {
  const r = automatedResults[tc.id];
  const status = r ? r.status : 'MANUAL';
  const durMs = r ? r.duration : null;
  const dur = durMs != null ? (durMs >= 1000 ? (durMs / 1000).toFixed(1) + 's' : durMs + 'ms') : '—';
  const errHtml = (r && r.errorMsg)
    ? `<div style="margin-top:4px;font-size:11px;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;border-radius:4px;padding:4px 8px;max-width:500px;overflow:hidden;text-overflow:ellipsis;white-space:pre-wrap;font-family:monospace">${r.errorMsg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`
    : '';
  return `<tr class="tc-row" id="sec-${sec.code}" style="display:none">
    <td style="padding:6px 12px 6px 32px;font-family:monospace;font-size:12px;white-space:nowrap;color:#374151">${tc.id}</td>
    <td style="padding:6px 12px;font-size:13px">${tc.name}${errHtml}</td>
    <td style="padding:6px 12px;text-align:center">${statusBadge(status)}</td>
    <td style="padding:6px 12px;text-align:center">${priorityBadge(tc.priority)}</td>
    <td style="padding:6px 12px;text-align:center;font-size:12px;color:#6b7280">${tc.type || ''}</td>
    <td style="padding:6px 12px;text-align:center;font-size:12px;color:#6b7280">${dur}</td>
  </tr>`;
};

// ── Donut SVG ─────────────────────────────────────────────────────────────────
function donut(pass, fail, flaky, manual, total) {
  if (total === 0) return '';
  const r = 50, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  const segs = [
    { v: pass,   c: '#16a34a' },
    { v: flaky,  c: '#d97706' },
    { v: fail,   c: '#dc2626' },
    { v: manual, c: '#ddd6fe' },
  ];
  let offset = 0;
  const paths = segs.map(s => {
    const len = (s.v / total) * circ;
    const el = `<circle r="${r}" cx="${cx}" cy="${cy}" fill="none" stroke="${s.c}" stroke-width="18"
      stroke-dasharray="${len} ${circ - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += len;
    return el;
  }).join('');
  const passRate = total > 0 ? pct(pass + flaky, pass + fail + flaky) : 0;
  return `<svg viewBox="0 0 120 120" width="120" height="120">
    ${paths}
    <circle r="36" cx="${cx}" cy="${cy}" fill="white"/>
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
      font-size="18" font-weight="700" fill="#111">${passRate}%</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" dominant-baseline="middle"
      font-size="9" fill="#6b7280">pass rate</text>
  </svg>`;
}

// ── Assemble full HTML ────────────────────────────────────────────────────────
const now = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
const runDateStr = playwrightResults
  ? `Test run completed · ${now} IST`
  : `No Playwright run data found — showing manual inventory only · ${now} IST`;

const sectionRows = allSections.map(sec =>
  sectionRow(sec) + sec.cases.map(tc => tcRow(tc, sec)).join('')
).join('');

const donutSvg = donut(totalPass, totalFail, totalFlaky, totalTCs - automatedCoverageCount, totalTCs);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Budgetnista — Test Suite Report</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#111;font-size:14px}
  .header{background:linear-gradient(135deg,#1e3a5f,#0ea5e9);color:#fff;padding:32px 40px}
  .header h1{font-size:24px;font-weight:700;margin-bottom:4px}
  .header .sub{font-size:13px;opacity:.75}
  .kpi-row{display:flex;gap:16px;flex-wrap:wrap;padding:24px 40px 0}
  .kpi{background:#fff;border-radius:12px;padding:16px 22px;flex:1;min-width:120px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  .kpi .val{font-size:28px;font-weight:700}
  .kpi .lbl{font-size:11px;color:#6b7280;margin-top:2px;text-transform:uppercase;letter-spacing:.5px}
  .kpi.green .val{color:#16a34a} .kpi.red .val{color:#dc2626}
  .kpi.amber .val{color:#d97706} .kpi.purple .val{color:#7c3aed}
  .chart-row{display:flex;align-items:center;gap:24px;padding:20px 40px 16px;flex-wrap:wrap}
  .legend{display:flex;flex-direction:column;gap:6px}
  .legend-item{display:flex;align-items:center;gap:8px;font-size:13px}
  .dot{width:12px;height:12px;border-radius:50%;flex-shrink:0}
  .main{padding:0 40px 40px}
  table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  th{background:#1e3a5f;color:#fff;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.5px;font-weight:600;white-space:nowrap}
  tr.sec-hdr{background:#f1f5f9;border-top:2px solid #e2e8f0}
  tr.sec-hdr:hover{background:#e2e8f0}
  tr.tc-row:hover{background:#f8fafc}
  tr.tc-row td{border-bottom:1px solid #f1f5f9}
  .toggle-icon{font-size:10px;color:#64748b;margin-right:6px;display:inline-block;transition:transform .2s}
  .toggle-icon.open{transform:rotate(90deg)}
  .filter-row{display:flex;gap:12px;padding:16px 40px;flex-wrap:wrap;align-items:center}
  .filter-row input,.filter-row select{padding:7px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;outline:none;background:#fff}
  .filter-row input:focus,.filter-row select:focus{border-color:#0ea5e9}
  .badge-legend{display:flex;gap:10px;flex-wrap:wrap;margin-left:auto;align-items:center;font-size:11px;color:#6b7280}
</style>
</head>
<body>

<div class="header">
  <h1>Budgetnista LMS — Complete Test Suite Report</h1>
  <div class="sub">${runDateStr}</div>
</div>

<div class="kpi-row">
  <div class="kpi"><div class="val">${totalTCs}</div><div class="lbl">Total Test Cases</div></div>
  <div class="kpi green"><div class="val">${totalPass}</div><div class="lbl">Automated Pass${totalFlaky ? ' (incl. ' + totalFlaky + ' flaky)' : ''}</div></div>
  <div class="kpi red"><div class="val">${totalFail}</div><div class="lbl">Automated Fail</div></div>
  <div class="kpi amber"><div class="val">${totalAutomated}</div><div class="lbl">Automated Total</div></div>
  <div class="kpi purple"><div class="val">${totalTCs - automatedCoverageCount}</div><div class="lbl">Manual / Not Automated</div></div>
</div>

<div class="chart-row">
  ${donutSvg}
  <div class="legend">
    <div class="legend-item"><div class="dot" style="background:#16a34a"></div><strong>${totalPass}</strong>&nbsp;pass${totalFlaky ? ' (incl. ' + totalFlaky + ' flaky)' : ''}</div>
    <div class="legend-item"><div class="dot" style="background:#dc2626"></div><strong>${totalFail}</strong>&nbsp;fail</div>
    <div class="legend-item"><div class="dot" style="background:#ddd6fe"></div><strong>${totalTCs - automatedCoverageCount}</strong>&nbsp;manual / not automated</div>
    <div class="legend-item"><div class="dot" style="background:#9ca3af"></div><strong>${allSections.length}</strong>&nbsp;sections</div>
  </div>
  <div style="margin-left:auto;background:#fff;border-radius:12px;padding:14px 20px;box-shadow:0 1px 4px rgba(0,0,0,.08);font-size:13px;line-height:2">
    <div><strong>Automation coverage:</strong> ${pct(automatedCoverageCount, totalTCs)}% (${automatedCoverageCount}/${totalTCs})</div>
    <div><strong>Automated pass rate:</strong> ${totalAutomated > 0 ? pct(totalPass, totalAutomated) : 0}% (${totalPass}/${totalAutomated})</div>
    <div><strong>Spec files run:</strong> 19 production specs</div>
    <div><strong>Sections covered:</strong> ${allSections.length}</div>
  </div>
</div>

<div class="filter-row">
  <input id="search" type="text" placeholder="🔍 Search test ID or name…" style="width:260px" oninput="filterTable()">
  <select id="filterStatus" onchange="filterTable()">
    <option value="">All statuses</option>
    <option value="PASS">Pass</option>
    <option value="FAIL">Fail</option>
    <option value="FLAKY">Flaky</option>
    <option value="MANUAL">Manual</option>
    <option value="SKIP">Skip</option>
  </select>
  <select id="filterPriority" onchange="filterTable()">
    <option value="">All priorities</option>
    <option value="Critical">Critical</option>
    <option value="High">High</option>
    <option value="Medium">Medium</option>
    <option value="Low">Low</option>
  </select>
  <div class="badge-legend">
    <span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">✓ PASS</span>
    <span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">✗ FAIL</span>
    <span style="background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">~ FLAKY</span>
    <span style="background:#ede9fe;color:#7c3aed;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">⊙ MANUAL</span>
    <span style="background:#f3f4f6;color:#6b7280;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700">— SKIP</span>
  </div>
</div>

<div class="main">
<table id="mainTable">
  <thead>
    <tr>
      <th style="width:30%">Section / Test Case</th>
      <th style="width:8%;text-align:center">Total</th>
      <th style="width:8%;text-align:center">Pass</th>
      <th style="width:8%;text-align:center">Fail</th>
      <th style="width:8%;text-align:center">Manual</th>
      <th style="width:8%;text-align:center">Rate</th>
      <th style="width:12%">Coverage</th>
    </tr>
  </thead>
  <tbody id="tableBody">
${sectionRows}
  </tbody>
</table>
</div>

<script>
// ── section toggle ─────────────────────────────────────────────────────────
function toggleSection(code) {
  const rows = document.querySelectorAll('.tc-row[id="sec-' + code + '"]');
  const icon = document.getElementById('icon-' + code);
  const isOpen = icon.classList.contains('open');
  rows.forEach(r => r.style.display = isOpen ? 'none' : '');
  icon.classList.toggle('open', !isOpen);
}

// ── filter ─────────────────────────────────────────────────────────────────
const tcData = ${JSON.stringify(Object.fromEntries(
  allSections.flatMap(sec => sec.cases.map(tc => {
    const r = automatedResults[tc.id];
    return [tc.id, {
      name: tc.name,
      priority: tc.priority || '',
      status: r ? r.status : 'MANUAL',
      sec: sec.code,
    }];
  }))
))};

function filterTable() {
  const q = document.getElementById('search').value.toLowerCase();
  const st = document.getElementById('filterStatus').value;
  const pr = document.getElementById('filterPriority').value;

  // Determine which sections should be visible
  const visibleSecs = new Set();
  const visibleTcs = new Set();

  Object.entries(tcData).forEach(([id, tc]) => {
    const matchQ = !q || id.toLowerCase().includes(q) || tc.name.toLowerCase().includes(q);
    const matchSt = !st || tc.status === st;
    const matchPr = !pr || tc.priority === pr;
    if (matchQ && matchSt && matchPr) {
      visibleTcs.add(id);
      visibleSecs.add(tc.sec);
    }
  });

  // Show/hide section headers
  document.querySelectorAll('.sec-hdr').forEach(row => {
    const code = row.dataset.sec;
    row.style.display = visibleSecs.has(code) ? '' : 'none';
  });

  // Show/hide TC rows (expand if filter active)
  document.querySelectorAll('.tc-row').forEach(row => {
    const id = row.querySelector('td').textContent.trim();
    const show = visibleTcs.has(id);
    row.style.display = show ? '' : 'none';
    if (show) {
      const icon = document.getElementById('icon-' + row.id.replace('sec-',''));
      if (icon) icon.classList.add('open');
    }
  });

  // If no filter, reset to collapsed
  if (!q && !st && !pr) {
    document.querySelectorAll('.tc-row').forEach(r => r.style.display = 'none');
    document.querySelectorAll('.toggle-icon').forEach(i => i.classList.remove('open'));
    document.querySelectorAll('.sec-hdr').forEach(r => r.style.display = '');
  }
}
</script>
</body>
</html>`;

fs.writeFileSync('test-report.html', html, 'utf8');
console.log('Report written to test-report.html');
console.log(`  Total TCs   : ${totalTCs}`);
console.log(`  Automated   : ${totalAutomated} (${pct(totalAutomated, totalTCs)}% coverage)`);
console.log(`  Pass        : ${totalPass}`);
console.log(`  Fail        : ${totalFail}`);
console.log(`  Flaky       : ${totalFlaky}`);
console.log(`  Manual      : ${totalTCs - automatedCoverageCount}`);
if (totalAutomated > 0)
  console.log(`  Pass rate   : ${pct(totalPass, totalAutomated)}%`);
