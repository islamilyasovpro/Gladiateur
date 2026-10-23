/* ---------- actions ---------- */
function tourNote(out) {
  const t = out.tour; if (!t) return '';
  if (t.state === 'out') return '<p class="muted" style="margin:0;text-align:center"><span class="chip hard">Tournoi</span> Tu es éliminé. Tu récupères à peine.</p>';
  if (t.state === 'next') return `<p style="margin:0;text-align:center"><span class="chip eq">Tournoi</span> ${G.TOUR_ROUNDS[t.rd]} contre ${esc(t.next.name)}. On te soigne un peu : +15 % de vie.</p>`;
  return `<div class="msn ch"><strong>Champion du tournoi !</strong><small class="num">+${t.prize.gold} sesterces · +${t.prize.gloire} gloire</small></div>${t.prize.loot ? dropHTML(t.prize.loot) : ''}`;
}
function questNote(qd) { return qd.map(q => `<p style="margin:0;text-align:center"><span class="chip eq">Objectif accompli</span> ${esc(q.t)}${q.r ? ` · +${q.r} sesterces` : ''}</p>`).join(''); }
function afterAct(msg, snd) {
  const qd = G.checkQuests(S);
  save(); render();
  if (qd.length) { toast('Objectif accompli : ' + qd[0].t + (qd[0].r ? ' (+' + qd[0].r + ')' : '')); SFX.quest(); }
  else { if (msg) toast(msg.length > 70 ? msg.slice(0, 68) + '…' : msg); if (snd) SFX[snd](); }
  if (S.pendingPerks > 0) next();
}
document.addEventListener('click', e => {
  SFX.init();
  const t = e.target.closest('[data-tab]');
  if (t && S) { SFX.click(); tab = t.dataset.tab; ui.confirmReset = false; render(); return; }
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  const [a, b, c] = el.dataset.act.split(':');
  if (a === 'snd') { SFX.toggle(); render(); return; }
  if (!S) {
    const d = ui.draft;
    if (a === 'g') d.gender = b; else if (a === 'skin') d.skin = +b; else if (a === 'hair') d.hair = +b; else if (a === 'hairc') d.hairc = +b; else if (a === 'origin') d.origin = b;
    else if (a === 'dice') { d.name = G.pick(NAMES[d.gender]); $('#nm').value = d.name; }
    else if (a === 'begin') {
      const nm = (d.name || '').trim() || G.pick(NAMES[d.gender]);
      S = G.newState({ ...d, name: nm }, Math.min(3, META.legacy), Date.now()); tab = 'ludus'; ui.sel = null; save(); SFX.drum(); render(); return;
    }
    SFX.click(); refreshDraft(); return;
  }
  SFX.click();
  if (a === 'occ') { if (G.startOcc(S, b, c)) afterAct(); return; }
  if (a === 'collect') { const m = G.collectOcc(S); if (m) afterAct(m, 'coin'); return; }
  if (a === 'rush') { if (G.rush(S)) afterAct('Terminé', 'coin'); return; }
  if (a === 'panel') { panel(b); return; }
  if (a === 'heal') { const m = G.heal(S); if (m) { layer(''); afterAct(m, 'coin'); } return; }
  if (a === 'cell') { if (G.buyCell(S, b)) afterAct('Cellule améliorée', 'level'); return; }
  if (a === 'compgift') { const r = G.compGift(S); ui.pop = null; showResult(r, S.comp.n); return; }
  if (a === 'chest') { const r = G.openChest(S); if (r) { ui.pop = null; showResult({ t: `Tu ouvres l’offrande : +${r.gold} sesterces${r.loot ? '.' : '. Rien d’autre cette fois.'}`, tone: 'good', loot: r.loot }, 'Offrande du ludus'); } return; }
  if (a === 'pop') { const i = +b, r = ui.pop && (ui.pop.kind === 'story' ? G.resolveScene(S, i) : G.resolveEvent(S, ui.pop.id, i)); if (!r) return; if (ui.pop.id === 'nuit') ui.rvRank = -1; showResult(r, ui.pop.kind === 'story' ? 'Ton histoire' : 'Imprévu'); return; }
  if (a === 'popdone') { ui.pop = null; layer(''); render(); next(); return; }
  if (a === 'eqnow' || a === 'keep') { const w = $('#dropbtns'); if (a === 'eqnow' && G.equipItem(S, b)) { SFX.level(); if (w) w.innerHTML = '<small class="muted" style="text-align:center;width:100%">Équipé.</small>'; save(); } else if (w) w.innerHTML = '<small class="muted" style="text-align:center;width:100%">Rangé dans ton sac.</small>'; return; }
  if (a === 'best') { const n = G.bestGear(S); save(); render(); toast(n ? `Équipement optimisé : ${n} pièce${n > 1 ? 's' : ''} changée${n > 1 ? 's' : ''}` : 'Tu portes déjà le meilleur.'); if (n) SFX.level(); return; }
  if (a === 'junk') { const r = G.sellJunk(S); save(); render(); if (r.n) { SFX.coin(); toast(`${r.n} pièces vendues : +${r.gold} sesterces`); } return; }
  if (a === 'ss') { ui.ss = b; render(); return; }
  if (a === 'comp') { const r = G.completeSet(S, b); if (r) afterAct('Panoplie équipée', 'level'); return; }
  if (a === 'schools') { schoolSheet(true); return; }
  if (a === 'school') { const r = G.chooseSchool(S, b); if (r) { layer(''); afterAct(G.MASTERS[r.id].n + ' : ' + G.MASTERS[r.id].join.split('« ')[1].replace(' »',''), 'level'); } return; }
  if (a === 'hslot') { ui.hs = ui.hs === b ? null : b; render(); return; }
  if (a === 'msn') { const r = G.claimMission(S, b); if (r) { save(); render(); msnSheet(r); } return; }
  if (a === 'tourjoin') { const r = G.tourStart(S); if (r) { ui.sel = 'tour'; afterAct('Tu es inscrit au tournoi', 'coin'); } return; }
  if (a === 'tourquit') { G.tourQuit(S); ui.sel = null; afterAct('Tu abandonnes le tournoi', 'lose'); return; }
  if (a === 'tac') { if (b === 'reset') S.tac = null; else G.tacMove(S, c, b); save(); render(); return; }
  if (a === 'ht') { ui.ht = b; render(); return; }
  if (a === 'bf') { ui.bf = b; render(); return; }
  if (a === 'buyp') { const [sid, sl] = b.split('-'); const it = G.buyPiece(S, sid, sl); if (it) { afterAct(it.n + ' acheté', 'level'); } return; }
  if (a === 'eq') { if (G.equipItem(S, b)) { save(); render(); SFX.level(); } return; }
  if (a === 'un') { G.unequip(S, b); save(); render(); return; }
  if (a === 'sell') { const v = G.sellItem(S, b); if (v) { save(); render(); SFX.coin(); toast(`Vendu : +${v} sesterces`); } return; }
  if (a === 'lb') { lbTab = b; render(); return; }
  if (a === 'join') { if (G.joinClan(S, b)) afterAct('Clan rejoint', 'win'); return; }
  if (a === 'leave') { G.leaveClan(S); afterAct(); return; }
  if (a === 'speed') { S.speed = +b; afterAct(); return; }
  if (a === 'sel') { ui.sel = b; render(); return; }
  if (a === 'go') { const c2 = selected(cands()); if (c2) startFight(c2.opp); return; }
  if (a === 'shopsel') { ui.shopSel = b + ':' + c; render(); return; }
  if (a === 'wtsel') { ui.wt = b; render(); return; }
  if (a === 'buy') { const cc = String(c).split('-'); const it = G.buyWeapon(S, +cc[0], cc[1] || undefined); if (it) afterAct(it.n + ' acheté', 'level'); return; }
  if (a === 'forge') { const it = G.forge(S, b); if (it) { SFX.level(); afterAct(it.n + ' : amélioré', 'coin'); } return; }
  if (a === 'buypot') { const x = G.buyPotion(S, b); if (x) afterAct(x.n + ' acheté', 'coin'); return; }
  if (a === 'pslot') { G.cyclePot(S, +b); save(); render(); return; }
  if (a === 'shp') { ui.sh = b; ui.shopSel = null; render(); return; }
  if (a === 'perk') { G.takePerk(S, b); save(); next(); return; }
  if (a === 'next') { next(); return; }
  if (a === 'stay') { tab = 'hero'; layer(''); render(); return; }
  if (a === 'legacy') { META.legacy++; S = null; ui.draft = null; save(); layer(''); render(); return; }
  if (a === 'ask') { ui.confirmReset = true; render(); return; }
  if (a === 'reset') { S = null; ui.draft = null; ui.confirmReset = false; save(); render(); return; }
});

/* ---------- démarrage ---------- */
if (S) {
  const gap = Date.now() - S.lastReal, hpBefore = S.hp;
  G.tick(S, Date.now());
  render();
  if (gap > 120000) setTimeout(() => toast(G.occReady(S) ? 'Pendant ton absence, ton occupation s’est terminée.' : S.hp > hpBefore ? 'Pendant ton absence, tes forces sont revenues.' : 'Content de te revoir.'), 400);
} else render();

