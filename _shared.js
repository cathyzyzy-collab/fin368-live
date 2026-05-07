'use strict';

// ── Formatting helpers ──────────────────────────────────────────────
const fmt = (n, d = 2) => n == null || isNaN(n) ? '—' :
  Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n, d = 2) => n == null || isNaN(n) ? '—' : `${Number(n).toFixed(d)}%`;
const usd = (n, d = 0) => n == null ? '—' : '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: d });

// ── Error display ───────────────────────────────────────────────────
const showErr = (id, msg) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="err">${msg}</div>`;
};

// ── Tab navigation with chart resize ───────────────────────────────
const _charts = {};  // tabId → [Chart instances]
const registerChart = (tabId, c) => { (_charts[tabId] = _charts[tabId] || []).push(c); };

function initTabs() {
  document.querySelectorAll('nav.tabs button').forEach(b => {
    b.onclick = () => {
      document.querySelectorAll('nav.tabs button')
        .forEach(x => x.classList.toggle('active', x === b));
      document.querySelectorAll('section.tab')
        .forEach(s => s.classList.toggle('active', s.id === b.dataset.tab));
      (_charts[b.dataset.tab] || []).forEach(c => c && c.resize());
    };
  });
}

// ── Sortable table helper ───────────────────────────────────────────
function initSortTable(tableId, rows, renderFn) {
  const table = document.getElementById(tableId);
  if (!table) return;
  let sortKey = null, sortDir = 1;
  table.querySelectorAll('th[data-sort]').forEach(th => {
    th.onclick = () => {
      const k = th.dataset.sort;
      sortDir = (k === sortKey) ? -sortDir : (th.dataset.dir === 'asc' ? 1 : -1);
      sortKey = k;
      table.querySelectorAll('th').forEach(x => {
        x.classList.remove('sort-asc', 'sort-desc');
        if (x === th) x.classList.add(sortDir > 0 ? 'sort-asc' : 'sort-desc');
      });
      const sorted = [...rows].sort((a, b) => {
        const va = a[k], vb = b[k];
        return typeof va === 'string' ? va.localeCompare(vb) * sortDir : ((va ?? -Infinity) - (vb ?? -Infinity)) * sortDir;
      });
      table.querySelector('tbody').innerHTML = sorted.map(renderFn).join('');
    };
  });
}

// ── OECD SDMX-JSON parser ───────────────────────────────────────────
// Returns { COUNTRY_CODE: { value, period } } — the most recent obs per country.
function parseOecdLatest(json) {
  const dims = json.data.structures[0].dimensions.observation;
  const obs   = json.data.dataSets[0].observations || {};
  const cDim  = dims.findIndex(d => d.id === 'REF_AREA');
  const tDim  = dims.length - 1;
  const result = {};
  for (const [key, val] of Object.entries(obs)) {
    if (val[0] == null) continue;
    const idx     = key.split(':').map(x => x === '~' ? null : +x);
    const country = dims[cDim].values[idx[cDim]].id;
    const period  = dims[tDim].values[idx[tDim]].id;
    if (!result[country] || period > result[country].period)
      result[country] = { value: val[0], period };
  }
  return result;
}

// ── Fetch OECD series (FINMARK) ─────────────────────────────────────
async function fetchOecd(countries, measure) {
  const url = `https://sdmx.oecd.org/public/rest/data/OECD.SDD.STES,DSD_STES@DF_FINMARK,4.0/${countries}.M.${measure}.PA.....?lastNObservations=1&dimensionAtObservation=AllDimensions&format=jsondata`;
  return fetch(url).then(r => r.json()).then(parseOecdLatest);
}

// ── Fetch live spot rates (Frankfurter/ECB) ─────────────────────────
async function fetchSpot(base, symbols) {
  const url = `https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${symbols.join(',')}`;
  const r = await fetch(url).then(r => r.json());
  return { rates: r.rates, date: r.date };
}

// ── Fetch IMF inflation with World Bank fallback ────────────────────
async function fetchInflation(imfCodes, wbCodes) {
  const thisYear = new Date().getFullYear();

  // Primary: IMF DataMapper (works from file://, blocked from localhost)
  try {
    const j = await fetch(`https://www.imf.org/external/datamapper/api/v1/PCPIPCH/${imfCodes.join('/')}`).then(r => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
    const series = (j.values || {}).PCPIPCH || {};
    const out = {};
    for (const [iso, data] of Object.entries(series)) {
      for (let y = thisYear; y >= thisYear - 2; y--) {
        if (data[y] != null) { out[iso] = { value: data[y], year: String(y), source: 'IMF' }; break; }
      }
    }
    if (Object.keys(out).length) return out;
  } catch (_) { /* fall through */ }

  // Fallback: World Bank annual CPI
  const j = await fetch(`https://api.worldbank.org/v2/country/${wbCodes.join(';')}/indicator/FP.CPI.TOTL.ZG?format=json&date=${thisYear - 5}:${thisYear}&per_page=500`).then(r => r.json());
  const out = {};
  for (const row of (j[1] || [])) {
    if (row.value == null) continue;
    const c = row.countryiso3code;
    if (!out[c] || +row.date > +out[c].year)
      out[c] = { value: row.value, year: row.date, source: 'World Bank' };
  }
  return out;
}

// ── Colour helpers ──────────────────────────────────────────────────
const colPos   = (v, threshold = 0) => v >= threshold ? '#2e7d32' : '#c62828';
const colHeat  = v => v > 5 ? '#c62828' : v > 2.5 ? '#e6a23c' : '#2e7d32';
const colBlue  = () => '#1d4e89';
const ACCENT   = '#1d4e89';
