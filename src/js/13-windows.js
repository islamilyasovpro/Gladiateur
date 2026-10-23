/* ---------- le temps qui passe ---------- */
function live() {
  if (!S) return;
  const mh = G.maxHp(S);
  const hi = $('#hp-i'); if (hi) { hi.style.width = pct(S.hp, mh) + '%'; $('#hp-t').textContent = `VIE ${S.hp}/${mh}`; }
  const gn = $('#gold-n'); if (gn) gn.textContent = S.gold;
  if (S.occ) {
    const left = G.occLeft(S), ot = $('#occ-t');
    if (ot) { ot.textContent = left <= 0 ? 'Terminé' : fmt(left); const oi = $('#occ-i'); if (oi) oi.style.width = pct(S.occ.durG - left, S.occ.durG) + '%'; }
    if (G.occReady(S) !== ui.ready) { render(); if (!ui.busy && S.occ && G.occReady(S)) { toast('Ton occupation est terminée.'); SFX.quest(); } }
  }
  const rb = $('#rush-btn'); if (rb) { rb.disabled = S.gold < G.rushCost(S); rb.querySelector('small').textContent = `Soudoyer le surveillant · ${G.rushCost(S)} sesterces`; }
}
function loop() {
  if (S && !ui.busy) { G.tick(S, Date.now()); live(); maybePop(); if (Date.now() - ui.lastSave > 8000) save(); }
  else if (S) S.lastReal = Date.now();
}
setInterval(loop, 1000);
document.addEventListener('visibilitychange', () => { if (document.hidden && S) save(); else loop(); });

/* ---------- fenêtres ---------- */
function layer(html) { $('#layer').innerHTML = html ? `<div class="layer">${html}</div>` : ''; }
function showPop(kind, o) {
  const isS = kind === 'story', e = isS ? o : G.sceneView(S, G.drawEvent(S));
  ui.pop = { kind, id: e.id };
  const t = isS ? e.t(S) : e.t, x = isS ? e.x(S) : e.x;
  SFX.event();
  layer(`<div class="sheet box pop"><div class="evic">${evIcon(e.ic)}</div><div class="cap">${isS ? 'Au ludus · ton histoire' : 'Au ludus · imprévu'}</div><h2>${esc(t)}</h2>${x.map(p => `<p>${esc(p)}</p>`).join('')}<div class="chs">${e.ch.map((c, i) => {
    const lab = isS ? c.l(S) : c.l, poor = c.cost && S.gold < c.cost;
    return `<button class="btn ${i === 0 ? 'main' : 'ghost'}" data-act="pop:${i}" ${poor ? 'disabled' : ''}><b>${esc(lab)}</b>${c.cost ? `<small class="num">${c.cost} sesterces${poor ? ' · tu n’as pas assez' : ''}</small>` : ''}</button>`;
  }).join('')}</div></div>`);
}
function showResult(r, cap) {
  const tl = { good: 'Bien joué', bad: 'Aïe', neutral: 'Voilà' }[r.tone] || 'Voilà';
  if (r.tone === 'good') SFX.coin(); else if (r.tone === 'bad') SFX.bad();
  if (r.loot) setTimeout(() => SFX.loot(r.loot.item.rar), 250);
  const qd = G.checkQuests(S);
  save();
  layer(`<div class="sheet box pop"><div class="cap">${esc(cap || 'Au ludus')}</div><div class="tone ${r.tone}">${tl}</div><p>${esc(r.t)}</p>${r.loot ? dropHTML(r.loot) : ''}${questNote(qd)}<button class="btn main" data-act="popdone">Continuer</button></div>`);
}
function maybePop() {
  if (!S || ui.busy || $('#layer').firstChild || tab !== 'ludus') return;
  const sc = G.nextScene(S);
  if (sc) { showPop('story', sc); return; }
  if (G.schoolDue(S)) { schoolSheet(); return; }
  if (G.eventDue(S) && S.wins >= 1) showPop('ev');
}
function toast(t) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = t; document.body.appendChild(el); setTimeout(() => el.remove(), 2400); }
function next() {
  if (ui.queue.length) { ui.queue.shift()(); return; }
  if (S && S.pendingPerks > 0) { perkSheet(); return; }
  if (S && G.schoolDue(S)) { schoolSheet(); return; }
  const sc = S && G.nextScene(S); if (sc) { showPop('story', sc); return; }
  layer(''); render();
}
const FAM = { brute: 'Offensif', defense: 'Défense', vif: 'Vivacité', foule: 'Foule', fortune: 'Fortune', croissance: 'Croissance' };
function schoolSheet(change) {
  SFX.level();
  const cur = S.school;
  layer(`<div class="sheet box"><div class="cap">${change ? 'Changer d’école' : 'Tu es désormais gladiateur'}</div><h2 style="font-size:22px">Choisis ton école de combat</h2>
    <small>${change ? `Changer coûte ${G.schoolCost(S)} sesterces.` : 'Elle donne un style à ton gladiateur et un coup spécial : la frappe d’élan, que tu débloques en touchant trois fois de suite.'}</small>
    ${G.SCHOOLS.map(x => `<button class="perk-opt" data-act="school:${x.id}" ${cur === x.id || (change && S.gold < G.schoolCost(S)) ? 'disabled' : ''}><span class="chip eq" style="float:right">${esc(x.tag)}</span><strong>${x.n}${cur === x.id ? ' (actuelle)' : ''}</strong><em style="display:block;font-size:12.5px;opacity:.75;margin:2px 0 4px">« ${x.motto} »</em><span style="display:block;font-size:13px;opacity:.85;margin-bottom:4px">${x.lore}</span><span style="display:block;font-size:12.5px;opacity:.8;margin-bottom:4px"><b>${G.MASTERS[x.id].n}</b>, ${G.MASTERS[x.id].t} : ${G.MASTERS[x.id].hello}</span><span style="display:block;margin:2px 0">${x.d}</span><span class="efx" style="display:block"><b>${x.elan}</b> : ${x.ed}</span></button>`).join('')}
    ${change ? '<button class="btn ghost" data-act="popdone">Garder mon école</button>' : ''}</div>`);
}
function perkSheet() {
  const opts = G.perkOptions(S);
  if (!opts.length) { S.pendingPerks = 0; S.str++; S.agi++; S.end++; save(); next(); return; }
  SFX.level();
  layer(`<div class="sheet box"><div class="cap">Niveau ${S.level}</div><h2 style="font-size:22px">Un talent, à toi de choisir</h2>${opts.map(p => `<button class="perk-opt" data-act="perk:${p.id}"><span class="chip eq" style="float:right">${FAM[p.fam]}</span><strong>${p.n}${G.cnt(S, p.id) ? ' (' + (G.cnt(S, p.id) + 1) + '/' + p.max + ')' : ''}</strong><span class="muted">${p.d}</span></button>`).join('')}</div>`);
}
function rankSheet(out, quote) {
  SFX.win();
  if (out.freed) {
    layer(`<div class="sheet box rank-up"><div class="cap">Le sénat de l’arène se lève</div><h1 style="font-size:40px;color:var(--gold);letter-spacing:.2em">RUDIS</h1>
      <div style="height:200px;position:relative">${'<div class="fgt C" style="height:100%;bottom:0">' + ART.figure(Object.assign({}, look(S), { cls: 'win' })) + '</div>'}</div>
      <p style="margin:0">Le lanista te tend l’épée de bois. ${esc(S.name)}, tu entres dans l’arène sous les chaînes et tu en sors libre. Il y a quelques jours, personne ne savait ton nom.</p>${G.epilogue(S).map(l => `<p class="muted" style="margin:0">${esc(l)}</p>`).join('')}
      <p class="quote">« ${esc(quote)} » dit ${esc(S.rival.name)}.</p>
      <div class="gain num"><span>${S.wins} victoires</span><span>jour ${G.dayOf(S)}</span></div>
      <button class="btn main" data-act="legacy">Un nouveau gladiateur<small>Héritage : +1 à chaque caractéristique de départ</small></button>
      <button class="btn ghost" data-act="stay">Rester et voir ma pyramide</button></div>`);
    return;
  }
  layer(`<div class="sheet box rank-up"><div class="cap">Un degré de plus</div>
    <h2>${G.rankName(S, out.from)} devient<br>${G.rankName(S)}</h2>
    <div style="height:210px;position:relative"><div class="fgt C" style="height:100%;bottom:0">${ART.figure(Object.assign({}, look(S), { cls: 'win' }))}</div></div>
    <p class="quote">« ${esc(quote)} » dit ${esc(S.rival.name)}, et déjà ${S.rival.gender === 'f' ? 'elle' : 'il'} regarde plus haut.</p>
    <button class="btn main" data-act="next">Continuer</button></div>`);
}

