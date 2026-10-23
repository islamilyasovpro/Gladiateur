/* ---------- état et sauvegarde ---------- */
const KEY = 'ludus-magnus-proto-3';
let S = null, META = { legacy: 0 };
let tab = 'ludus', lbTab = 'joueurs';
const ui = { draft: null, confirmReset: false, queue: [], busy: false, rv: null, rvRank: -1, spar: null, sel: null, shopSel: null, ready: false, lastSave: 0, lastTab: null, odds: {} };
try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j) { META = j.meta || META; if (j.hero && j.hero.v === 3) S = G.migrate(j.hero); } } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify({ meta: META, hero: S })); ui.lastSave = Date.now(); } catch (e) {} }
const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (a, b) => Math.max(0, Math.min(100, b ? a / b * 100 : 0));
const rk = (r, g) => G.RANKS[r][g === 'f' ? 'f' : 'm'];
const clanName = id => (G.CLANS.find(c => c.id === id) || {}).n || '';
const RNAMES = g => G.RANKS.map(r => r[g === 'f' ? 'f' : 'm']);
function fmt(gameMs) {
  const sec = Math.ceil(gameMs / S.speed / 1000);
  if (sec >= 3600) return Math.floor(sec / 3600) + ' h ' + String(Math.floor(sec % 3600 / 60)).padStart(2, '0');
  if (sec >= 60) return Math.floor(sec / 60) + ' min ' + String(sec % 60).padStart(2, '0') + ' s';
  return sec + ' s';
}
document.getElementById('sprite').innerHTML = ART.DEFS;
const pcLook = s => { const o = {}; G.PSLOTS.forEach(k => { const it = s.gear[k]; o[k] = it ? G.SET_BY[it.set].sty : 0; }); return o; };
const look = s => ({ gender: s.gender, skin: s.skin, hair: s.hair, hairc: s.hairc, rank: G.vt(s.rank), pc: pcLook(s), weapon: G.vt(s.gear && s.gear.w ? s.gear.w.tier : s.weapon), scars: Math.min(2, Math.floor(s.losses / 4)), laurel: s.freed });
const medal = o => `<div class="medal">${ART.head(o)}</div>`;

