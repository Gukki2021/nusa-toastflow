/*
 * ToastFlow — Google Sheet "Meeting Appointment Holders" importer
 * -------------------------------------------------------------
 * Reads the club's appointment sheet, published to the web as CSV
 * (Google Sheets → File → Share → Publish to web → that tab → CSV).
 *
 * The sheet is "wide": the header row holds meeting DATES across the
 * columns, and each following row is a ROLE whose cells hold the
 * appointed member per meeting. This one file therefore feeds BOTH:
 *   • per-meeting appointments (the target date's column), and
 *   • the recommendation engine's history (all past columns).
 *
 * Depends on ToastFlow.canonicalRole (recommend.js), loaded first.
 */
(function (root, factory) {
  const api = factory(root.ToastFlow || {});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ToastFlow = Object.assign(root.ToastFlow || {}, api);
})(typeof self !== 'undefined' ? self : this, function (TF) {
  'use strict';

  // ---- RFC-4180-ish CSV parser (handles quotes, commas, newlines in cells) ----
  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', i = 0, inQ = false;
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    while (i < text.length) {
      const c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
        else field += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else field += c;
      }
      i++;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  // normalise many date spellings to YYYY-MM-DD
  function normDate(v) {
    if (!v) return null;
    v = String(v).trim();
    let m = v.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);            // 2025-11-07
    if (m) return `${m[1]}-${(+m[2]).toString().padStart(2, '0')}-${(+m[3]).toString().padStart(2, '0')}`;
    m = v.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);                // 14/11/2025 (D/M/Y)
    if (m) return `${m[3]}-${(+m[2]).toString().padStart(2, '0')}-${(+m[1]).toString().padStart(2, '0')}`;
    const d = new Date(v);
    return isNaN(d) ? null : d.toISOString().slice(0, 10);
  }

  const canon = r => (TF.canonicalRole ? TF.canonicalRole(r) : null);

  /**
   * Parse the wide appointment sheet.
   * Returns { dates:[YYYY-MM-DD], byDate:{date:{canonRole:{name,rawRole}}},
   *           rawByDate:{date:{rawRole:name}}, historyRows:[{date,role,raw}] }
   * Assumes row 0 = dates (col 0 is a label like "Meeting Dates"),
   * an optional "Theme" row, then role rows.
   */
  function parseWide(rows) {
    if (!rows || !rows.length) return { dates: [], byDate: {}, rawByDate: {}, historyRows: [] };
    const header = rows[0];
    const cols = [];                       // {idx, date}
    for (let j = 1; j < header.length; j++) {
      const d = normDate(header[j]);
      if (d) cols.push({ idx: j, date: d });
    }
    const byDate = {}, rawByDate = {}, historyRows = [];
    cols.forEach(c => { byDate[c.date] = {}; rawByDate[c.date] = {}; });

    for (let r = 1; r < rows.length; r++) {
      const label = (rows[r][0] || '').trim();
      if (!label) continue;
      if (/^theme/i.test(label)) continue;
      for (const c of cols) {
        const cell = (rows[r][c.idx] || '').trim();
        if (!cell || cell.toLowerCase() === 'x') continue;
        rawByDate[c.date][label] = cell;
        historyRows.push({ date: c.date, role: label, raw: cell });
        const cr = canon(label);
        if (cr && !byDate[c.date][cr]) byDate[c.date][cr] = { name: cell, rawRole: label };
      }
    }
    return { dates: cols.map(c => c.date), byDate, rawByDate, historyRows };
  }

  async function fetchAppointments(csvUrl) {
    if (!csvUrl) return null;
    const res = await fetch(csvUrl, { redirect: 'follow' });
    if (!res.ok) throw new Error('CSV fetch failed: ' + res.status);
    return parseWide(parseCSV(await res.text()));
  }

  return { parseCSV, parseWide, fetchAppointments, normDate };
});
