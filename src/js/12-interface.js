/* ---------- interface de jeu ---------- */
const NAV = [['ludus', 'Ludus'], ['arene', 'Arène'], ['rang', 'Rang'], ['boutique', 'Boutique'], ['hero', 'Perso']];
function hud() {
  const mh = G.maxHp(S), gb = G.gloireBar(S);
  return `<header class="hud gut"><div class="r1">${medal(look(S))}
    <div class="who"><strong>${esc(S.name)}</strong><span>${S.freed ? 'Affranchi' : G.rankName(S)} · niveau ${S.level} · cote ${S.cote}</span></div>
    <div class="gold num" id="gold">${ART.coin}<span id="gold-n">${S.gold}</span></div>
    <button class="ibtn" data-act="snd" aria-label="${SFX.on ? 'Couper le son' : 'Activer le son'}">${ART.sound(SFX.on)}</button></div>
    <div class="bars"><div class="bar hp"><i id="hp-i" style="width:${pct(S.hp, mh)}%"></i><b class="num" id="hp-t">VIE ${S.hp}/${mh}</b></div>
    <div class="bar glo"><i style="width:${S.freed ? 100 : pct(gb.cur, gb.max)}%"></i><b class="num">GLOIRE ${S.freed ? S.gloire : gb.cur + '/' + gb.max}</b></div></div></header>`;
}
function questCard() {
  if (S.quest >= G.QUESTS.length) return '';
  const q = G.QUESTS[S.quest], n = G.QUESTS.length - 1;
  return `<section class="card quest"><div class="row"><span class="cap">Objectif ${Math.min(S.quest + 1, n)}/${n}</span>${q.r ? `<span class="chip eq">+${q.r} sesterces</span>` : ''}</div><h3>${q.t}</h3><small>${q.h}</small></section>`;
}
function occCard() {
  if (S.occ) {
    const left = G.occLeft(S), ready = left <= 0, o = S.occ;
    const name = o.kind === 'train' ? 'Entraînement : ' + G.STAT_N[o.k] : G.OCC[o.kind].n;
    return `<section class="card"><div class="row"><h2>${name}</h2><span class="num muted" id="occ-t">${ready ? 'Terminé' : fmt(left)}</span></div>
      <div class="bar thin xp"><i id="occ-i" style="width:${pct(o.durG - left, o.durG)}%"></i></div>
      <button class="btn main" id="occ-btn" data-act="collect" ${ready ? '' : 'disabled'}>${ready ? 'Récupérer' : 'En cours…'}<small>${ready ? 'Ton occupation est terminée' : 'Tu peux fermer le jeu, ça continue'}</small></button>
      ${ready || !G.canRush(S) ? '' : `<button class="btn ghost" id="rush-btn" data-act="rush" ${S.gold < G.rushCost(S) ? 'disabled' : ''}><b>Finir maintenant</b><small class="num">Soudoyer le surveillant · ${G.rushCost(S)} sesterces</small></button>`}</section>`;
  }
  const d = k => fmt(G.occDur(S, k));
  const tr = k => {
    const st = G.statsOf(S), v = { str: st.force, agi: st.agi, end: st.end }[k], need = G.trainNeed(S[k]);
    return `<button class="btn train" data-act="occ:train:${k}"><span><b>${G.STAT_N[k]}</b> <span class="num">${v}</span></span><div class="bar thin xp"><i style="width:${pct(S.tp[k], need)}%"></i></div></button>`;
  };
  return `<section class="card"><div class="row"><h2>Que fais-tu ?</h2><span class="muted num">${d('train')} l’entraînement</span></div>
    <div class="grid3">${tr('str')}${tr('agi')}${tr('end')}</div>
    <div class="grid2"><button class="btn" data-act="occ:work"><b>Travailler</b><small>${d('work')} · sesterces</small></button>
    <button class="btn" data-act="occ:search"><b>Fouiller la cellule</b><small>${d('search')} · trouvailles</small></button></div></section>`;
}
function compCard() {
  if (!G.compAvail(S)) return '';
  const n = S.comp.n;
  return `<section class="card chest"><div class="row"><h3>${esc(n)} t’attend</h3></div><small>${S.flags.saved ? `${esc(n)} ne te lâche plus d’une semelle depuis que tu l’as racheté${S.comp.g === 'f' ? 'e' : ''}.` : `${esc(n)} a quelque chose à te donner.`}</small><button class="btn main" data-act="compgift"><b>Voir ce que ${esc(n)} a pour toi</b></button></section>`;
}
function advice(o) {
  if (!G.compOn(S)) return '';
  const st = G.statsOf(S), P = [];
  if (o.str > st.force + 1) P.push('il frappe plus fort que toi, couvre-toi face à ses coups puissants'); else if (o.str < st.force - 1) P.push('tu es plus fort que lui, ne le lâche pas');
  if (o.agi > st.agi + 1) P.push('il est plus vif, tu vas en rater quelques-uns'); else if (o.agi < st.agi - 1) P.push('il est lent, il ratera souvent');
  if (!P.length) P.push('vous êtes à égalité, garde la foule avec toi');
  const t = P.slice(0, 2).join(', ');
  return `${S.comp.n} : « ${t.charAt(0).toUpperCase() + t.slice(1)}. »`;
}
function chestCard() {
  if (!S.chests) return '';
  return `<section class="card chest"><div class="row"><h3>Offrande du ludus</h3><span class="chip eq">×${S.chests}</span></div><small>Chaque jour au ludus, on dépose une offrande pour les gladiateurs. Elles s’accumulent, jusqu’à trois.</small><button class="btn main" data-act="chest"><b>Ouvrir l’offrande</b><small>Sesterces, et parfois du butin</small></button></section>`;
}
function msnCard() {
  G.ensureMissions(S);
  const M = S.msn, all = M.list.concat([M.ch]), n = all.filter(x => x.claimed).length;
  const row = (m, key) => {
    const i = G.msnInfo(S, m), pc = Math.round(100 * m.prog / m.tgt);
    const bar = m.tgt > 1 ? `<div class="bar thin xp"><i style="width:${pc}%"></i></div><small class="num" style="text-align:right">${m.prog}/${m.tgt}</small>` : '';
    return `<div class="msn ${m.claimed ? 'ok' : ''} ${i.ch ? 'ch' : ''}"><div class="mh"><span class="mg">${i.ch ? '★ Défi du jour' : esc(i.giver.n)}</span>${m.claimed ? '<span class="chip eq">Accompli</span>' : ''}</div>
      <strong>${esc(i.goal)}</strong><small class="mq">${esc(i.story)}</small>${m.claimed ? '' : bar}
      ${m.done && !m.claimed ? `<button class="btn main" data-act="msn:${key}"><b>Récupérer la récompense</b><small class="num">+${G.msnPay(S, i.ch).gold} sesterces · +${G.msnPay(S, i.ch).gloire} gloire${i.ch ? ' · butin' : ''}</small></button>` : ''}</div>`;
  };
  return `<section class="card msns"><div class="row"><h3>Ordres du jour</h3><span class="chip ${n >= 3 ? 'eq' : ''}">${Math.min(n, 3)}/3</span></div>
    <small>${M.bonus ? 'Le coffre du jour est ouvert. Du nouveau demain.' : 'Accomplis-en trois, défi compris, pour ouvrir le coffre du jour. Ils changent chaque jour à minuit.'}</small>
    ${M.list.map((m, i) => row(m, i)).join('')}${row(M.ch, 'ch')}</section>`;
}
function msnSheet(r) {
  SFX.coin();
  layer(`<div class="sheet box"><div class="cap">${esc(r.info.giver.n)}</div><h2 style="font-size:20px">${esc(r.info.goal)}</h2>
    <p class="quote" style="margin:0">${esc(r.info.thx)}</p><div class="gain num"><span>+${r.gold} sesterces</span><span>+${r.gloire} gloire</span></div>
    ${r.loot ? dropHTML(r.loot) : ''}${r.bonus ? `<div class="msn ch"><strong>Le coffre du jour s’ouvre</strong><small>+${r.bonus.gold} sesterces et une ${esc(r.bonus.pot.toLowerCase())}.</small></div>` : ''}
    <button class="btn main" data-act="popdone"><b>Continuer</b></button></div>`);
}
const IC = {
  orders: '<svg viewBox="0 0 24 24"><path d="M6 3h11a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2zm2 5h8M8 12h8M8 16h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  goal: '<svg viewBox="0 0 24 24"><path d="M6 21V4m0 0h11l-2.5 4L17 12H6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M5 4h9a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4V4zm0 12a4 4 0 0 1 4-4h9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
};
function tile(ic, title, sub, act, o) {
  o = o || {};
  return `<button class="tile ${o.cls || ''}" data-act="${act}"><span class="ti">${IC[ic]}${o.dot ? '<i class="tdot"></i>' : ''}</span><span class="tt"><b>${title}</b><small>${sub}</small></span>${o.bar != null ? `<span class="bar thin ${o.barCls || 'xp'}"><i style="width:${o.bar}%"></i></span>` : ''}</button>`;
}
function alertRow(title, sub, act, btn) {
  return `<div class="alertrow"><div class="at"><b>${title}</b><small>${sub}</small></div><button class="btn main" data-act="${act}"><b>${btn}</b></button></div>`;
}
function ludus() {
  const mh = G.maxHp(S), M = (G.ensureMissions(S), S.msn), n = M.list.concat([M.ch]).filter(x => x.claimed).length, rdy = G.msnReady(S);
  const q = S.quest < G.QUESTS.length ? G.QUESTS[S.quest] : null;
  let alerts = '';
  if (S.chests) alerts += alertRow(`Offrande du ludus ×${S.chests}`, 'Des sesterces, parfois du butin.', 'chest', 'Ouvrir');
  if (G.compAvail(S)) alerts += alertRow(`${esc(S.comp.n)} t’attend`, 'A quelque chose à te donner.', 'compgift', 'Voir');
  return `${occCard()}${alerts ? `<div class="alerts">${alerts}</div>` : ''}
  <div class="tiles">
    ${tile('orders', 'Ordres du jour', `${Math.min(n, 3)}/3 accomplis${rdy ? ' · à récupérer' : ''}`, 'panel:msn', { dot: rdy, cls: rdy ? 'hot' : '' })}
    ${q ? tile('goal', 'Objectif', esc(q.t), 'panel:quest') : tile('goal', 'Objectifs', 'Tous accomplis', 'panel:quest')}
    ${tile('heart', 'Santé', `${S.hp}/${mh}`, 'panel:health', { bar: pct(S.hp, mh), barCls: 'hp', cls: S.hp < mh * 0.5 ? 'hot' : '' })}
    ${tile('book', 'Journal', esc(S.log[0] || 'Rien de neuf').slice(0, 44) + (S.log[0] && S.log[0].length > 44 ? '…' : ''), 'panel:log')}
  </div>`;
}
function panel(kind) {
  const mh = G.maxHp(S), hc = G.healCost(S);
  let body = '';
  if (kind === 'msn') body = msnCard();
  else if (kind === 'quest') body = S.quest >= G.QUESTS.length ? '<section class="card"><h3>Objectifs</h3><small>Tu as accompli tous les objectifs. L’arène t’appartient.</small></section>' : questCard();
  else if (kind === 'health') body = `<section class="card"><div class="row"><h3>Ta santé</h3><span class="num muted">${S.hp}/${mh}</span></div>
    <small>La vie revient toute seule${S.cell.bed ? ', plus vite grâce à ta paillasse' : ''}. Le médecin va plus vite, mais il se fait payer.</small>
    <button class="btn" data-act="heal" ${S.gold < hc || S.hp >= mh ? 'disabled' : ''}><b>Voir le médecin</b><small>+50 % de vie · ${hc} sesterces</small></button></section>`;
  else body = `<section class="card"><h3>Journal</h3><ul class="log">${S.log.slice(0, 12).map(l => `<li>${esc(l)}</li>`).join('')}</ul></section>`;
  layer(`<div class="sheet box panel">${body}<button class="btn ghost" data-act="popdone"><b>Fermer</b></button></div>`);
}

/* arène : choisir son adversaire */
function cands() {
  const L = [];
  if (S.tour) return [{ key: 'tour', opp: G.tourOpp(S), kind: 'tour' }];
  if (!S.freed && G.canDuel(S)) { if (ui.rvRank !== S.rank) { ui.rv = G.genRival(S); ui.rvRank = S.rank; } L.push({ key: 'rival', opp: ui.rv, kind: 'rival' }); }
  if (G.nightAvail(S)) { if (ui.nightDay !== G.dayOf(S)) { ui.nightO = G.nightOpp(S); ui.nightDay = G.dayOf(S); } L.push({ key: 'night', opp: ui.nightO, kind: 'night' }); }
  if (S.level < 5) { if (!ui.spar) ui.spar = G.sparOpp(S); L.push({ key: 'spar', opp: ui.spar, kind: 'spar' }); }
  G.pickOpps(S).forEach(p => L.push({ key: p.id, opp: p, kind: 'opp' }));
  if (G.tourCan(S)) L.push({ key: 'tour', opp: { id: 'tour', name: 'Tournoi', cote: '', look: S.ghosts[0].look, kind: 'Tournoi' }, kind: 'tour' });
  return L;
}
const potTag = p => p.pots && p.pots.length ? ` · potions ×${p.pots.length}` : (p.spar ? '' : ' · sans potion');
function foeBits(p, extra) {
  const t = G.traitOf(p), tr = t ? G.TRAIT_BY[t] : null, cd = p.cond ? G.ARENA_RULES.find(r => r.id === p.cond) : null;
  const chips = (p.nem ? '<span class="chip hard">Revanche</span>' : '') + (tr ? `<span class="chip eq">${tr.n}</span>` : '') + (cd ? `<span class="chip hard">${cd.n}</span>` : '');
  let det = '';
  if (p.nem) det += `<small class="quote nem">${esc(p.name)} ${p.nem.n > 1 ? 'est revenu encore plus fort. ' : 'est revenu plus fort. '}${esc(G.nemLine(p))} Le battre rapporte gloire et sesterces ×1,5.</small>`;
  if (tr) det += `<small><b>${tr.n}</b> : ${tr.d}</small>`;
  if (cd) det += `<small><b>${cd.n}</b> : ${cd.d} Gloire +15 %.</small>`;
  det += extra || '';
  let h = chips ? `<div class="chips">${chips}</div>` : '';
  if (p.ctr) { const ci = G.CTR_INFO[p.ctr.t]; h += `<div class="ctr ${p.ctr.t}"><b>${ci.n}</b><small>${ci.d(p.ctr)}${p.ctr.t === 'bet' && S.gold < p.ctr.stake ? ' (Pas assez de sesterces : le pari sera ignoré.)' : ''}</small></div>`; }
  if (det) h += fold('foe-' + (p.id || 'x'), 'Détails et conseils', '', det, false);
  return h;
}
function oddsOf(p) {
  const sig = [p.id, S.hp, S.level, S.weapon, G.SLOTS.map(k => S.gear[k] ? S.gear[k].id : '-').join(''), S.str, S.agi, S.end, S.perks.length, S.rank, p.cond || '', p.nem ? p.nem.n : 0, p.trait || '', S.school || '', p.tour ? 1 : 0].join('|');
  if (ui.odds[p.id] && ui.odds[p.id].sig === sig) return ui.odds[p.id].v;
  const v = G.odds(S, p); ui.odds[p.id] = { sig, v }; return v;
}
function selected(L) {
  let c = L.find(x => x.key === ui.sel);
  if (!c) { c = S.tour ? L[0] : L.find(x => x.kind === 'rival') || (S.cnt.spar < 1 && L.find(x => x.kind === 'spar')) || L.find(x => x.kind === 'night') || L.find(x => x.kind === 'opp') || L[0]; ui.sel = c && c.key; }
  return c;
}
function arena() {
  const L = cands(), c = selected(L), sick = S.hp < G.maxHp(S) * 0.25;
  let o = questCard();
  o += `<div class="carousel">${L.map(x => {
    const p = x.opp, d = x.kind === 'opp' ? G.diffOf(S, p) : 0;
    const extra = (p.nem ? '<span class="chip hard">Revanche</span>' : '') + (p.ctr ? `<span class="chip eq">${G.CTR_INFO[p.ctr.t].n}</span>` : '') + (p.cond ? '<span class="chip eq">Condition</span>' : '');
    const tag = x.kind === 'tour' ? '<span class="chip hard">Tournoi</span>' : x.kind === 'night' ? '<span class="chip hard">Jeux du soir</span>' : x.kind === 'rival' ? '<span class="chip hard">Rival</span>' : x.kind === 'spar' ? '<span class="chip eq">Sans risque</span>' : `<span class="chip ${d < 0 ? 'easy' : d > 0 ? 'hard' : 'eq'}">${d < 0 ? 'Abordable' : d > 0 ? 'Redoutable' : 'À ta mesure'}</span>`;
    return `<button class="cand ${x.key === c.key ? 'sel' : ''} ${x.kind === 'rival' ? 'rv' : ''} ${x.kind === 'spar' ? 'sp' : ''} ${x.kind === 'night' ? 'nt' : ''}" data-act="sel:${x.key}" aria-pressed="${x.key === c.key}">${medal(p.look)}<strong>${esc(x.kind === 'spar' ? 'Sparring' : p.name)}</strong><small class="num">${x.kind === 'spar' ? 'Maître d’armes' : x.kind === 'tour' && !S.tour ? 'Trois combats' : 'cote ' + p.cote}</small>${tag}${x.kind === 'opp' ? extra : ''}</button>`;
  }).join('')}</div>`;
  if (!c) return o;
  const p = c.opp;
  if (c.kind === 'night') {
    const ru = G.nightRule(S), od = oddsOf(p), oc = od >= 0.75 ? ['easy', 'Bonnes chances'] : od >= 0.5 ? ['eq', 'Incertain'] : od >= 0.3 ? ['hard', 'Risqué'] : ['hard', 'Très risqué'];
    o += `<section class="card foe night-card"><div class="cap">Jeux de ce soir · une seule fois par jour</div><div class="row"><h3>${ru.n}</h3><span class="chip ${oc[0]}">${oc[1]}</span></div><small>${ru.d}</small><small class="num">Contre ${esc(p.name)} · ${p.kind} · niveau ${p.level}. Butin garanti (rare ou mieux), sesterces ×1,5.</small>
      ${sick ? '<small>Tu es trop blessé pour combattre. Repose-toi ou va voir le médecin.</small>' : ''}<button class="btn main" data-act="go" ${sick ? 'disabled' : ''}>Entrer dans l’arène en feu</button></section>`.replace('Entrer dans l’arène en feu', 'Relever le défi');
  } else if (c.kind === 'tour') {
    const fee = G.tourFee(S);
    if (!S.tour) {
      o += `<section class="card foe night-card"><div class="cap">Tournoi de l’arène</div><h3>Trois combats, pas de retour au ludus</h3><small>Quarts de finale, demi-finale, finale, contre des adversaires de plus en plus forts. Ta vie ne revient que de 15 % entre deux rounds, et les potions que tu emportes sont tout ce qui te reste. Chaque victoire rapporte normalement.</small>
        <small class="num">Inscription : ${fee} sesterces. Éliminé, tu ne perds rien d’autre. Champion : ${fee * 4} sesterces, ${30 + 8 * S.rank} gloire et un butin épique ou mieux.</small>
        ${sick ? '<small>Tu es trop blessé pour t’inscrire.</small>' : ''}<button class="btn main" data-act="tourjoin" ${sick || S.gold < fee ? 'disabled' : ''}>S’inscrire<small class="num">${fee} sesterces</small></button></section>`;
    } else {
      const od = oddsOf(p), oc = od >= 0.75 ? ['easy', 'Bonnes chances'] : od >= 0.5 ? ['eq', 'Incertain'] : od >= 0.3 ? ['hard', 'Risqué'] : ['hard', 'Très risqué'];
      o += `<section class="card foe night-card"><div class="cap">Tournoi · ${G.TOUR_ROUNDS[S.tour.rd]} (${S.tour.rd + 1}/3)</div><div class="row"><h3>${esc(p.name)}</h3><span class="chip ${oc[0]}">${oc[1]}</span></div><small class="num">${p.kind} · niveau ${p.level} · cote ${p.cote}${potTag(p)}</small>${foeBits(p)}
        ${sick ? '<small>Tu es trop blessé pour combattre. Boire une potion ne suffira pas : tu peux abandonner.</small>' : ''}<button class="btn main" data-act="go" ${sick ? 'disabled' : ''}>Entrer dans l’arène</button><button class="btn ghost" data-act="tourquit"><b>Abandonner le tournoi</b><small>L’inscription n’est pas remboursée</small></button></section>`;
    }
  } else if (c.kind === 'spar') {
    o += `<section class="card foe"><h3>Sparring avec ${esc(p.name)}</h3><small>Sans risque : tu ne perds pas de vie. ${G.sparXp(S) ? `+${G.sparXp(S)} d’expérience, et une caractéristique progresse.` : 'Il n’a plus rien à t’apprendre.'}</small>
      <button class="btn main" data-act="go">S’entraîner au combat</button></section>`;
  } else if (c.kind === 'rival') {
    o += `<section class="card foe rival-card"><div class="cap">Duel de rang · ${S.rank === G.LAST ? 'pour la liberté' : 'pour devenir ' + G.rankName(S, S.rank + 1)}</div><h3>${esc(S.rival.name)}</h3><small class="num">${G.SCHOOL_BY[G.rivalSchool(S)].n}</small><p class="quote">« ${G.RIVAL_INTRO[S.rank]} »</p>${(G.matchup(S, { kind: G.SCHOOL_KIND[G.rivalSchool(S)] }) || {}).tip ? `<small class="quote">${esc(G.matchup(S, { kind: G.SCHOOL_KIND[G.rivalSchool(S)] }).tip)}</small>` : ''}
      ${sick ? '<small>Tu es trop blessé pour combattre. Repose-toi ou va voir le médecin.</small>' : ''}<button class="btn main" data-act="go" ${sick ? 'disabled' : ''}>Relever le défi<small>Gloire ×1,6</small></button></section>`;
  } else {
    const d = G.diffOf(S, p), pv = G.preview(S, p), od = oddsOf(p), oc = od >= 0.75 ? ['easy', 'Bonnes chances'] : od >= 0.5 ? ['eq', 'Incertain'] : od >= 0.3 ? ['hard', 'Risqué'] : ['hard', 'Très risqué'];
    o += `<section class="card foe"><div class="row"><h3>${esc(p.name)}</h3><span class="chip ${oc[0]}">${oc[1]}</span></div><small class="num">${p.kind} · niveau ${p.level} · cote ${p.cote}${potTag(p)}${p.clan ? ' · ' + esc(clanName(p.clan)) : ''}</small>${foeBits(p, (advice(p) ? `<small class="quote">${esc(advice(p))}</small>` : '') + ((G.matchup(S, p) || {}).tip ? `<small class="quote">${esc(G.matchup(S, p).tip)}</small>` : ''))}
      ${sick ? '<small>Tu es trop blessé pour combattre. Repose-toi ou va voir le médecin.</small>' : ''}${pv.tired ? '<small>Il commence à te connaître : tu gagnes moins de gloire contre lui.</small>' : ''}<button class="btn main" data-act="go" ${sick ? 'disabled' : ''}>${od < 0.4 ? 'Combattre malgré les risques' : 'Combattre'}<small class="num">≈ +${pv.gloire} gloire · +${pv.gold} sesterces</small></button></section>`;
  }
  if (!S.freed && !G.canDuel(S)) {
    const gb = G.gloireBar(S), need = G.duelCote(S.rank), gOk = G.gloireOk(S), cOk = G.coteOk(S);
    o += `<section class="card"><div class="row"><h3>Prochain duel de rang</h3></div>
      <div class="row"><small>Gloire</small><span class="num muted">${gOk ? 'Atteinte' : gb.cur + '/' + gb.max}</span></div><div class="bar thin glo"><i style="width:${pct(gb.cur, gb.max)}%"></i></div>
      <div class="row"><small>Cote (classement)</small><span class="num muted">${cOk ? 'Atteinte' : S.cote + '/' + need}</span></div><div class="bar thin xp"><i style="width:${cOk ? 100 : pct(S.cote - 850, need - 850)}%"></i></div>
      <small>${esc(S.rival.name)} ne te défiera que si ta gloire <b>et</b> ta cote suffisent. La cote monte en battant des adversaires plus forts que toi.</small></section>`;
  }
  return o;
}
function board() {
  let o = `<div class="seg two"><button data-act="lb:joueurs" class="${lbTab === 'joueurs' ? 'sel' : ''}">Gladiateurs</button><button data-act="lb:clans" class="${lbTab === 'clans' ? 'sel' : ''}">Clans</button></div>`;
  if (lbTab === 'joueurs') {
    const L = G.ladder(S), me = L.findIndex(r => r.me);
    const show = L.filter((r, i) => i < 10 || Math.abs(i - me) <= 1);
    let last = -1, rows = '';
    show.forEach(r => {
      const i = L.indexOf(r);
      if (last >= 0 && i - last > 1) rows += `<div class="muted" style="text-align:center;padding:4px 0">···</div>`;
      last = i;
      rows += `<div class="lrow ${r.me ? 'me' : ''} ${r.rival ? 'rv' : ''}"><span class="pos num">${r.pos}</span><div class="nm"><strong>${esc(r.name)}${r.me ? ' (toi)' : r.rival ? ' · ton rival' : ''}</strong><span class="tag">${rk(r.rank, r.gender)}${r.clan ? ' · ' + esc(clanName(r.clan)) : ''}</span></div><span class="cote num">${r.cote}</span></div>`;
    });
    o += `<section class="card"><div class="row"><h2>Classement</h2><span class="muted num">${L.length} gladiateurs</span></div><small>Ta cote monte quand tu bats plus fort que toi et chute quand tu perds contre plus faible.</small><div>${rows}</div></section>`;
  } else {
    const B = G.clanBoard(S);
    o += `<section class="card"><h2>Clans</h2><small>${S.clan ? 'Tu fais partie de ' + esc(clanName(S.clan)) + ' : +10 % de gloire sur chaque victoire.' : S.rank < 1 ? 'Les clans n’acceptent que les recrues. Monte d’un rang d’abord.' : 'Rejoins un clan pour gagner 10 % de gloire en plus sur chaque victoire.'}</small>`;
    B.forEach(c => {
      o += `<div class="lrow ${c.mine ? 'me' : ''}"><span class="pos num">${c.pos}</span><div class="nm"><strong>${esc(c.n)}</strong><span class="tag">${esc(c.t)} · ${c.members} membres</span></div><span class="cote num">${c.pts}</span></div>`;
      if (!S.clan && S.rank >= 1) o += `<div style="padding:0 0 8px 44px"><button class="btn ghost" data-act="join:${c.id}" style="min-height:40px"><b>Rejoindre</b></button></div>`;
    });
    o += `${S.clan ? `<button class="btn ghost" data-act="leave"><b>Quitter mon clan</b></button>` : ''}</section>`;
  }
  return o;
}
const pcLookSet = k => ({ h: k, c: k, b: k, l: k, s: k });
function shop() {
  const sh = ui.sh || 'armes';
  const seg = `<div class="seg five" style="margin-bottom:10px">${[['armes', 'Armes'], ['pano', 'Armures'], ['forge', 'Forge'], ['alch', 'Alchimie'], ['cell', 'Cellule']].map(x => `<button data-act="shp:${x[0]}" class="${sh === x[0] ? 'sel' : ''}" aria-pressed="${sh === x[0]}">${x[1]}</button>`).join('')}</div>`;
  if (sh === 'forge') {
    const pool = []; const seen = new Set();
    G.SLOTS.forEach(k => { const it = S.gear[k]; if (it && G.UP_MAX(it)) { pool.push([it, true]); seen.add(it.id); } });
    S.inv.forEach(it => { if (!seen.has(it.id) && G.UP_MAX(it)) pool.push([it, false]); });
    const rows = pool.map(([it, on]) => {
      const max = G.UP_MAX(it), up = it.up || 0, c = G.forgeCost(S, it), full = up >= max;
      return `<div class="gslot bag">${itemHTML(it)}<div class="row"><div class="pips">${Array.from({ length: max }, (_, i) => `<i class="${i < up ? 'on' : ''}"></i>`).join('')}</div>${on ? '<span class="chip eq">Équipé</span>' : ''}</div><button class="btn ${full ? 'ghost' : 'main'}" data-act="forge:${it.id}" ${!full && S.gold >= c ? '' : 'disabled'}><b>${full ? 'Au maximum' : 'Améliorer'}</b>${full ? '' : `<small class="num">${c} sesterces · ${it.slot === 'w' ? '+1 dégât' : '+1 protection'}</small>`}</button></div>`;
    }).join('');
    return seg + `<section class="card"><h2>Forgeron</h2>${fold('help-forge', 'À savoir', '', '<small>Chaque amélioration est garantie. Tes armes montent jusqu’à +5, tes pièces d’armure jusqu’à +3.</small>', false)}${rows || '<small>Rien à améliorer pour l’instant.</small>'}</section>`;
  }
  if (sh === 'alch') {
    const rows = G.POTIONS.map(x => {
      const own = S.pots[x.id] || 0, locked = S.rank < x.r && !S.freed, pp = G.potPrice(S, x), full = own >= G.POT_MAX;
      return `<div class="row alch" style="padding:7px 0;border-top:1px solid var(--line)"><div class="pic ${x.id}">${evIcon('potion')}</div><div style="flex:1"><strong style="font-family:var(--display);font-size:14px">${x.n}</strong><small>${x.d}${locked ? ' · rang requis : ' + G.rankName(S, x.r) : ''}</small><small class="num">En stock : ${own}/${G.POT_MAX}</small></div><button class="btn" data-act="buypot:${x.id}" ${!locked && !full && S.gold >= pp ? '' : 'disabled'} style="min-width:104px;align-items:center"><b class="num">${pp} sesterces</b><small>${locked ? 'Rang insuffisant' : full ? 'Plein' : S.gold < pp ? 'Trop cher' : 'Acheter'}</small></button></div>`;
    }).join('');
    return seg + `<section class="card"><h2>Alchimiste</h2>${beltHTML()}${fold('help-alch', 'À savoir', '', '<small>Une potion se boit en combat et te coûte ton tour : l’adversaire frappe pendant ce temps. Équipe-en 3 au maximum avant le combat.</small>', false)}${rows}</section>`;
  }
  if (sh === 'cell') {
    const cell = G.CELL.map(c => {
      const lv = S.cell[c.id], cost = G.cellCost(S, c.id);
      const btn = cost == null ? `<span class="chip eq">Max</span>` : `<button class="btn" data-act="cell:${c.id}" ${S.gold < cost ? 'disabled' : ''} style="min-width:112px;align-items:center"><b class="num">${cost} sesterces</b><small>${S.gold < cost ? 'Trop cher' : 'Améliorer'}</small></button>`;
      return `<div class="row" style="padding:6px 0"><div style="flex:1"><strong style="font-family:var(--display);font-size:14px">${c.n}</strong><div class="pips" style="margin:4px 0">${Array.from({ length: c.max }, (_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</div><small>${c.d}</small></div>${btn}</div>`;
    }).join('');
    return seg + `<section class="card"><h2>Ta cellule</h2>${cell}</section>`;
  }
  if (sh === 'pano') {
    const sets = G.SETS.filter(x => x.r <= S.rank + 1 || S.freed);
    let cur = sets.find(x => x.id === ui.ss);
    if (!cur) { const mine = sets.filter(x => G.setCount(S, x.id) > 0).sort((a, b) => G.setCount(S, b.id) - G.setCount(S, a.id))[0]; cur = mine || sets.filter(x => S.rank >= x.r).pop() || sets[0]; }
    const idx = sets.indexOf(cur), prev = sets[(idx + sets.length - 1) % sets.length], next = sets[(idx + 1) % sets.length];
    const locked = S.rank < cur.r && !S.freed, n = G.setCount(S, cur.id), info = G.completeCost(S, cur.id);
    const SHARE = { c: 0.32, h: 0.2, b: 0.16, l: 0.16, s: 0.16 }, STAT = { c: 'end', b: 'str', l: 'agi' };
    const pieces = G.PSLOTS.map(k => {
      const worn = S.gear[k] && S.gear[k].set === cur.id, own = S.inv.find(i => i.set === cur.id && i.slot === k), pp = G.price(S, G.piecePrice(cur, k));
      const A = G.pieceA(cur.t, k);
      const fake = { id: '~', slot: k, rar: 0, tier: cur.t, set: cur.id, fx: [], a: A, st: STAT[k] ? { [STAT[k]]: 1 + Math.floor(cur.t / 5) } : null };
      const cmp = worn ? '' : cmpHTML(fake);
      const action = worn ? '<span class="chip eq">Porté</span>' : own ? `<button class="btn" data-act="eq:${own.id}" style="min-height:40px;align-items:center"><b>Porter</b></button>` : `<button class="btn" data-act="buyp:${cur.id}-${k}" ${!locked && S.gold >= pp && S.inv.length < G.INV_MAX ? '' : 'disabled'} style="min-height:40px;align-items:center"><b class="num">${pp} sesterces</b><small>${locked ? 'Rang requis' : S.gold < pp ? 'Trop cher' : 'Acheter'}</small></button>`;
      return `<div class="prow ${worn ? 'worn' : ''}"><div class="ico">${ART.pieceIcon(k, cur.sty)}</div><div class="pi"><strong>${cur.nm[k]}</strong><small class="num">Protection ${A}${STAT[k] ? ` · +${1 + Math.floor(cur.t / 5)} ${G.STAT_N[STAT[k]]}` : ''}</small>${cmp}</div><div class="act">${action}</div></div>`;
    }).join('');
    const bon = [2, 4, 5].map(k => `<div class="bn ${n >= k ? 'on' : ''}"><b class="num">${k}</b><span>${cur.bonus[k].map(f => `${G.FX[f.id].n} ${f.id === 'ecu' ? '−' + f.v : '+' + f.v}`).join(' · ')}</span></div>`).join('');
    const cbtn = locked ? `<button class="btn main" disabled><b>Rang requis : ${G.rankName(S, cur.r)}</b></button>` : !info.todo.length ? `<button class="btn ghost" disabled><b>Panoplie complète</b></button>` : `<button class="btn main" data-act="comp:${cur.id}" ${S.gold >= info.cost && info.room ? '' : 'disabled'}><b>Compléter la panoplie</b><small class="num">${info.buy ? info.cost + ' sesterces · ' + info.buy + ' pièce' + (info.buy > 1 ? 's' : '') + ' à acheter' : 'tu as déjà tout dans ton sac'}${S.gold < info.cost ? ' · trop cher' : ''}</small></button>`;
    const mq = pcLookSet(cur.sty);
    return seg + `<section class="card"><div class="setnav"><button data-act="ss:${prev.id}" aria-label="Panoplie précédente">‹</button><div style="text-align:center"><h2 style="margin:0">${cur.n}</h2><small>Protection ${G.ARMORS[cur.t].a} · ${n}/5 portées</small></div><button data-act="ss:${next.id}" aria-label="Panoplie suivante">›</button></div>
      <div class="dots">${sets.map(x => `<i class="${x.id === cur.id ? 'on' : ''} ${G.setCount(S, x.id) ? 'mine' : ''}"></i>`).join('')}</div>
      <div class="mannequin">${ART.figure({ gender: S.gender, skin: S.skin, hair: S.hair, hairc: S.hairc, rank: 1, pc: mq, weapon: -1, cls: 'mq' })}</div>
      <div class="cap" style="margin:6px 0 2px">Bonus de panoplie</div>${bon}
      <div class="cap" style="margin:10px 0 2px">Les 5 pièces</div>${pieces}${cbtn}</section>`;
  }
  const win = (arr, own) => arr.filter(x => x.id >= own - 1 && x.id <= own + 3);
  const slot = it => {
    const own = S.weapon, eq = own === it.id, locked = S.rank < it.r && !S.freed, pp = G.price(S, it.p), poor = S.gold < pp, past = it.id < own;
    const key = 'w:' + it.id, vn = G.weaponVariant(it.id, ui.wt && G.wtAvail(it.id).includes(ui.wt) ? ui.wt : 'gladius') || { n: it.n };
    return `<button class="slot ${ui.shopSel === key ? 'sel' : ''} ${eq ? 'own' : ''} ${locked ? 'lock' : ''} ${poor && !eq && !past ? 'poor' : ''}" data-act="shopsel:w:${it.id}" aria-pressed="${ui.shopSel === key}"><div class="ico">${ART.weaponIcon(it.id)}</div><strong>${it.id === 0 ? it.n : vn.n}</strong>${eq ? '<span class="chip eq">Équipé</span>' : past ? '<span class="tag">Dépassé</span>' : `<span class="pr num">${pp}</span>`}</button>`;
  };
  let detail = '<small>Touche une arme pour voir ce qu’elle t’apporte.</small>';
  if (ui.shopSel && ui.shopSel.startsWith('w:')) {
    const tier = +ui.shopSel.slice(2), W = G.WEAPONS[tier], own = S.weapon, curW = G.WEAPONS[own];
    const avail = tier === 0 ? [] : G.wtAvail(tier), wt = avail.includes(ui.wt) ? ui.wt : (avail[0] || null), V = wt ? G.weaponVariant(tier, wt) : { n: W.n, d: W.d, fx: W.fx || [] }, T = wt ? G.WT[wt] : null;
    const curD = S.gear.w ? S.gear.w.d : curW.d, locked = S.rank < W.r && !S.freed, pp = G.price(S, W.p);
    const same = tier === own && S.gear.w && (S.gear.w.wt || 'x') === wt, can = !locked && wt && !same && tier >= own && tier > 0 && S.gold >= pp && !(tier < own);
    const chips = avail.map(k => `<button class="fchip ${k === wt ? 'sel' : ''}" data-act="wtsel:${k}">${G.WT[k].n}</button>`).join('');
    detail = `<div class="row"><div><h3>${V.n}</h3><small>Dégâts ${V.d}${tier >= own ? ` (${V.d - curD >= 0 ? '+' : ''}${V.d - curD})` : ''}${locked ? ' · rang requis : ' + G.rankName(S, W.r) : ''}</small></div></div>
      ${chips ? `<div class="fchips">${chips}</div>` : ''}
      ${T ? `<small class="efx"><b>Effet</b> : ${T.e}</small>${T.m ? `<small class="efx mal"><b>Malus</b> : ${T.m}</small>` : ''}` : ''}
      ${(V.fx || []).map(f => `<small class="efx"><b>${G.FX[f.id].n}</b> : ${G.FX[f.id].d(f.v)}</small>`).join('')}
      <button class="btn main" data-act="buy:w:${tier}-${wt || ''}" ${can ? '' : 'disabled'}>${same ? 'Équipé' : tier < own ? 'Dépassé' : locked ? 'Rang insuffisant' : S.gold < pp ? 'Trop cher' : `Acheter · ${pp} sesterces`}</button>`;
  }
  return seg + `<section class="card"><h2>Forge</h2><div class="slots">${win(G.WEAPONS, S.weapon).map(slot).join('')}</div><div class="card" style="background:var(--night2)">${detail}</div></section>`;
}
const ICONS = {
  potion: '<path d="M19 6h10M21 6v10L11 38a4 4 0 0 0 4 6h18a4 4 0 0 0 4-6L27 16V6"/><path d="M14 30h20"/>',
  dice: '<rect x="8" y="8" width="32" height="32" rx="5"/><circle cx="17" cy="17" r="2"/><circle cx="31" cy="17" r="2"/><circle cx="24" cy="24" r="2"/><circle cx="17" cy="31" r="2"/><circle cx="31" cy="31" r="2"/>',
  chest: '<rect x="6" y="20" width="36" height="20" rx="3"/><path d="M6 28h36M8 20c0-9 32-9 32 0M24 25v6"/>',
  scroll: '<path d="M12 8h22a4 4 0 0 1 4 4v24a4 4 0 0 0 4 4H14a4 4 0 0 1-4-4V12"/><path d="M18 16h14M18 22h14M18 28h10"/>',
  spear: '<path d="M8 40L34 14"/><path d="M29 8h11v11z"/>',
  bread: '<path d="M6 30c0-10 8-16 18-16s18 6 18 16c0 4-4 6-18 6S6 34 6 30z"/><path d="M16 22l3 4M24 20l3 4M32 22l3 4"/>',
  amulet: '<circle cx="24" cy="29" r="10"/><path d="M24 19V8M14 6c4 6 16 6 20 0"/><path d="M24 25v8M20 29h8"/>'
};
const evIcon = k => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ICONS.scroll}</svg>`;
const itemIco = it => it.slot === 'w' ? ART.weaponIcon(G.vt(it.tier)) : it.slot === 't' ? evIcon('amulet') : ART.pieceIcon(it.slot, G.SET_BY[it.set].sty);
const itemStat = it => it.slot === 'w' ? `Dégâts ${it.d}` : it.slot === 't' ? 'Amulette' : `Protection ${it.a}${it.st ? ' · ' + Object.keys(it.st).map(k => `+${it.st[k]} ${G.STAT_N[k]}`).join(' · ') : ''}`;
function cmpHTML(it) {
  const c = G.compare(S, it); if (c.same) return '';
  const cls = c.dir > 0 ? 'up' : c.dir < 0 ? 'dn' : 'eq', ar = c.dir > 0 ? '▲' : c.dir < 0 ? '▼' : '＝';
  const head = c.empty ? 'Emplacement libre' : c.mixed ? (c.dir > 0 ? 'Mieux dans l’ensemble (compromis)' : c.dir < 0 ? 'Moins bien dans l’ensemble (compromis)' : 'Équivalent (compromis)') : c.dir > 0 ? 'Mieux que ton équipement' : c.dir < 0 ? 'Moins bien que ton équipement' : 'Équivalent';
  const txt = c.lines.length ? c.lines.join(' · ') : '';
  return `<div class="cmp ${cls}"><b>${ar} ${head}</b>${txt ? `<small>${esc(txt)}</small>` : ''}${c.set ? `<small class="setn">${esc(c.set)}</small>` : ''}${c.loss ? `<small class="lossn">${esc(c.loss)}</small>` : ''}</div>`;
}
function itemHTML(it, note, cmp) {
  const R = G.RAR[it.rar];
  return `<div class="item" style="--rc:${R.c}"><div class="ico">${itemIco(it)}</div><div><span class="rar">${R.n} · ${G.SLOT_N[it.slot]}${it.set ? ' · ' + G.SET_BY[it.set].n : ''}</span><strong>${esc(it.n)}</strong><small class="num">${itemStat(it)}</small>${it.wt && G.WT[it.wt] && it.wt !== 'gladius' ? `<small class="efx"><b>${G.WT[it.wt].n}</b> : ${G.WT[it.wt].e} <span class="mal">${G.WT[it.wt].m}</span></small>` : ''}${it.fx.map(f => `<small class="efx"><b>${G.FX[f.id].n}</b> : ${G.FX[f.id].d(f.v)}</small>`).join('')}${note ? `<small>${note}</small>` : ''}${cmp ? cmpHTML(it) : ''}</div></div>`;
}
function dropHTML(l) {
  const it = l.item, c = G.compare(S, it), good = c.empty || c.dir > 0;
  const sub = c.lines.slice(0, 2).join(' · ') || (c.dir === 0 ? 'équivalent' : '');
  const eq = `<button class="btn ${good ? 'main' : 'ghost'}" data-act="eqnow:${it.id}" style="align-items:center"><b>${good ? 'Équiper maintenant' : 'Équiper quand même'}</b>${sub ? `<small class="num">${esc(sub)}</small>` : ''}</button>`;
  const keep = `<button class="btn ${good ? 'ghost' : 'main'}" data-act="keep" style="align-items:center"><b>Garder dans le sac</b></button>`;
  return `<div class="drop"><div class="cap">Butin</div>${itemHTML(it, null, true)}<div class="row2" id="dropbtns">${good ? eq + keep : keep + eq}</div>${l.sold ? `<small class="muted">Sac plein : ${esc(l.sold.n)} revendu (+${l.sold.v}).</small>` : ''}</div>`;
}
const EMPTY_ICO = { h: '<path d="M10 30c0-12 6-18 14-18s14 6 14 18v6H10z"/>', c: '<path d="M14 8l-8 8 6 6v18h24V22l6-6-8-8c-2 4-6 6-10 6s-8-2-10-6z"/>', b: '<path d="M10 36l16-16 6 6-16 16zM30 14l6-6 6 6-6 6z"/>', l: '<path d="M16 6h16l-2 20 4 16H14l4-16z"/>', s: '<path d="M8 10c10 0 22 0 32 0 0 18-4 28-16 34C12 38 8 28 8 10z"/>', w: '<path d="M8 40L34 14"/><path d="M29 8h11v11z"/>', t: '<circle cx="24" cy="29" r="10"/><path d="M24 19V8"/>' };
function beltHTML() {
  return `<div class="belt">${S.potSlots.map((id, i) => { const x = id && G.POT_BY[id], n = id ? (S.pots[id] || 0) : 0; return `<button class="pslot ${x ? '' : 'empty'}" data-act="pslot:${i}">${x ? `<div class="pic ${id}">${evIcon('potion')}</div><span>${esc(x.n.replace('potion de soin', 'soin').replace('Potion de soin', 'Soin').replace('Petite ', 'Petit ').replace('Grande ', 'Grand '))}</span><small class="num">×${n}</small>` : '<span>Vide</span><small>Touche</small>'}</button>`; }).join('')}</div><small>Touche un emplacement pour changer de potion.</small>`;
}
const heroTab = () => ui.ht || 'perso';
function slotBtn(k) {
  const it = S.gear[k], base = k === 'w' && !it;
  const rc = it ? G.RAR[it.rar].c : '#4a3326';
  const ico = it ? itemIco(it) : base ? ART.weaponIcon(S.weapon) : `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" opacity=".35" aria-hidden="true">${EMPTY_ICO[k]}</svg>`;
  return `<button class="gs ${ui.hs === k ? 'sel' : ''} ${it || base ? '' : 'empty'}" style="--rc:${rc}" data-act="hslot:${k}" aria-pressed="${ui.hs === k}"><div class="ico">${ico}</div><span>${G.SLOT_N[k]}</span></button>`;
}
function slotPanel() {
  const k = ui.hs; if (!k) return '<small>Touche un emplacement pour voir ou changer ton équipement.</small>';
  const it = S.gear[k], alts = S.inv.filter(x => x.slot === k && (!it || x.id !== it.id));
  let o = `<h3>${G.SLOT_N[k]}</h3>`;
  if (it) o += itemHTML(it) + `<button class="btn ghost" data-act="un:${k}" style="min-height:40px;align-items:center"><b>Retirer</b></button>`;
  else if (k === 'w') o += `<small>${G.WEAPONS[S.weapon].n} (acheté en boutique) · Dégâts ${G.WEAPONS[S.weapon].d}</small>`;
  else o += '<small>Rien d’équipé ici.</small>';
  if (alts.length) {
    o += `<div class="cap" style="margin-top:6px">Dans ton sac</div>` + alts.map(x => {
      const d = k === 'w' ? x.d - G.gearW(S) : k === 't' ? 0 : x.a - (it ? it.a : 0);
      return `<div class="gslot bag">${itemHTML(x, null, true)}<div class="row2"><button class="btn" data-act="eq:${x.id}"><b>Équiper</b></button><button class="btn ghost" data-act="sell:${x.id}"><b>Vendre</b><small class="num">${G.sellValue(S, x)} sesterces</small></button></div></div>`;
    }).join('');
  } else if (!it && k !== 'w') o += '<small>Aucune pièce de ce type dans ton sac. Le butin et l’armurerie en proposent.</small>';
  return o;
}
function setsCard() {
  const owned = {}; S.inv.forEach(x => { if (x.set) owned[x.set] = (owned[x.set] || 0) + 1; });
  const B = G.setBonuses(S), seen = new Set(B.map(b => b.set.id));
  const rows = G.SETS.filter(x => seen.has(x.id) || owned[x.id]).map(x => {
    const n = G.setCount(S, x.id);
    const lines = [2, 4, 5].map(k => `<div class="bn ${n >= k ? 'on' : ''}"><b class="num">${k}</b><span>${x.bonus[k].map(f => `${G.FX[f.id].n} ${f.id === 'ecu' ? '−' + f.v : '+' + f.v}`).join(' · ')}</span></div>`).join('');
    return `<div class="setrow"><div class="row"><strong style="font-family:var(--display)">${x.n}</strong><span class="muted num">${n}/5</span></div><div class="pips" style="margin:3px 0 6px">${Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>${lines}</div>`;
  }).join('');
  return `<section class="card"><h2>Panoplies</h2>${rows || '<small>Équipe plusieurs pièces du même style pour déclencher des bonus : à 2, 4 et 5 pièces.</small>'}</section>`;
}
function bagTools() {
  const J = G.junkItems(S), jv = J.reduce((a, x) => a + G.sellValue(S, x), 0);
  return `<div class="row2" style="margin:6px 0 4px"><button class="btn" data-act="best"><b>Équiper le meilleur</b><small>Choisit les pièces qui marchent le mieux ensemble</small></button><button class="btn ghost" data-act="junk" ${J.length ? '' : 'disabled'}><b>Vendre les inutiles</b><small class="num">${J.length ? J.length + ' pièces · +' + jv + ' sesterces' : 'Rien d’inutile'}</small></button></div>`;
}
function bagCard() {
  const f = ui.bf || 'all', inv = S.inv.filter(x => f === 'all' || x.slot === f);
  const eqId = new Set(G.SLOTS.map(k => S.gear[k] && S.gear[k].id));
  const chips = ['all', ...G.SLOTS].map(k => `<button class="fchip ${f === k ? 'sel' : ''}" data-act="bf:${k}">${k === 'all' ? 'Tout' : G.SLOT_N[k]}</button>`).join('');
  const rows = inv.sort((a, b) => b.rar - a.rar).map(it => {
    const on = eqId.has(it.id);
    return `<div class="gslot bag">${itemHTML(it, null, !on)}<div class="row2">${on ? '<span class="chip eq" style="align-self:center">Équipé</span>' : `<button class="btn" data-act="eq:${it.id}"><b>Équiper</b></button>`}<button class="btn ghost" data-act="sell:${it.id}" ${on ? 'disabled' : ''}><b>Vendre</b><small class="num">${G.sellValue(S, it)} sesterces</small></button></div></div>`;
  }).join('');
  return `<section class="card"><div class="row"><h2>Ton sac</h2><span class="muted num">${S.inv.length}/${G.INV_MAX}</span></div>${bagTools()}<div class="fchips">${chips}</div>${rows || '<small>Rien ici.</small>'}</section>`;
}
ui.folds = ui.folds || {};
function fold(key, title, sub, html, def) {
  const o = ui.folds[key] == null ? !!def : ui.folds[key];
  return `<details class="fold" data-f="${key}" ${o ? 'open' : ''}><summary><span class="ft"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span><i class="chev"></i></summary><div class="fb">${html}</div></details>`;
}
document.addEventListener('toggle', e => { const d = e.target; if (d && d.dataset && d.dataset.f) ui.folds[d.dataset.f] = d.open; }, true);
function hero() {
  const st = G.statsOf(S), og = G.ORIGINS.find(o => o.id === S.origin), gs = G.gearStat(S), pcb = G.playerCombatant(S);
  const row = (k, v) => `<div class="stat-row"><span>${G.STAT_N[k]}</span><div class="bar thin xp"><i style="width:${pct(S.tp[k], G.trainNeed(S[k]))}%"></i></div><b class="num">${v}${gs[k] ? `<small class="plus"> +${gs[k]}</small>` : ''}</b></div>`;
  const pc = {}; S.perks.forEach(p => pc[p] = (pc[p] || 0) + 1);
  const perks = Object.keys(pc).map(id => { const p = G.PERKS.find(x => x.id === id); return `<div class="perk-li"><strong>${p.n}${pc[id] > 1 ? ' ×' + pc[id] : ''}</strong><div class="muted">${p.d}</div></div>`; }).join('');
  const L = G.ladder(S), pos = L.find(r => r.me).pos, ht = heroTab();
  const sc0 = G.SCHOOL_BY[S.school];
  const head = `<div class="herohead"><div><b>${og.n}${sc0 ? ' · ' + sc0.n.replace('École ', 'école ') : ''}</b><small>${S.clan ? esc(clanName(S.clan)) + ' · ' : ''}${pos}ᵉ du classement · ${S.wins} V / ${S.losses} D</small></div></div>
    <div class="seg four" style="margin-bottom:10px">${[['perso', 'Tenue'], ['sac', 'Sac'], ['talents', 'Talents'], ['tac', 'Tactique']].map(x => `<button data-act="ht:${x[0]}" class="${ht === x[0] ? 'sel' : ''}" aria-pressed="${ht === x[0]}">${x[1]}</button>`).join('')}</div>`;
  if (ht === 'sac') return head + bagCard();
  if (ht === 'tac') {
    const act = G.tacOf(S), off = G.TACTICS.filter(t => !act.some(e => e.id === t.id));
    const row = (e, i) => { const t = G.TAC_BY[e.id], q = (k, lab) => `<div class="tq"><button class="btn ghost" data-act="tac:${k}-:${e.id}" aria-label="Moins">−</button><span class="num">${lab}</span><button class="btn ghost" data-act="tac:${k}+:${e.id}" aria-label="Plus">+</button></div>`; return `<div class="tacrow2"><div class="tacrow"><div class="tn"><span class="num tp">${i + 1}</span><div><strong>${t.n}${t.thr ? ' sous ' + e.t + ' %' : ''}</strong><small>${t.d}</small></div></div><div class="tb"><button class="btn ghost" data-act="tac:up:${e.id}" ${i === 0 ? 'disabled' : ''} aria-label="Monter">▲</button><button class="btn ghost" data-act="tac:down:${e.id}" ${i === act.length - 1 ? 'disabled' : ''} aria-label="Descendre">▼</button><button class="btn ghost" data-act="tac:off:${e.id}">Retirer</button></div></div><div class="tctl"><span>Chance de le faire</span>${q('p', e.p + ' %')}${t.thr ? '<span>Seuil de vie</span>' + q('t', e.t + ' %') : ''}</div></div>`; };
    return head + `<section class="card"><h2>Tactique</h2><small>Ce que ton gladiateur fait en « Laisser faire ». Les règles sont lues de haut en bas.</small>${fold('tachelp', 'Comment ça marche ?', '', '<small>À chaque tour, on parcourt les règles dans l’ordre. Si la condition est vraie, il la joue selon sa chance (100 % = toujours, 70 % = sept fois sur dix). Sinon on passe à la suivante, et s’il ne reste rien, il frappe. Plus tard, un autre joueur affrontera ton gladiateur avec cette tactique.</small>', false)}${act.length ? act.map((e, i) => row(e, i)).join('') : '<small>Aucune règle : il frappera sans réfléchir.</small>'}</section>
    ${off.length ? `<section class="card"><h2>Règles disponibles</h2>${off.map(t => `<div class="tacrow"><div class="tn"><div><strong>${t.n}</strong><small>${t.d}</small></div></div><div class="tb"><button class="btn" data-act="tac:on:${t.id}"><b>Ajouter</b></button></div></div>`).join('')}</section>` : ''}
    <button class="btn ghost" data-act="tac:reset:x"><b>Remettre la tactique par défaut</b></button>`;
  }
  if (ht === 'talents') return head + `<section class="card"><h2>École de combat</h2>${(() => { const sc = G.SCHOOL_BY[S.school]; return sc ? `<strong style="font-family:var(--display)">${sc.n}</strong><small><em>« ${sc.motto} »</em></small><small>${sc.d}</small>${fold('lore', 'Histoire de l’école', G.MASTERS[sc.id].n, `<small>${sc.lore}</small><small>Maître d’armes : <b>${G.MASTERS[sc.id].n}</b>.</small>`, false)}<small class="efx"><b>${sc.elan}</b> : ${sc.ed}</small><button class="btn ghost" data-act="schools" style="margin-top:6px"><b>Changer d’école</b><small class="num">${G.schoolCost(S)} sesterces</small></button>` : S.rank >= 2 ? `<button class="btn main" data-act="schools"><b>Choisir mon école</b></button>` : '<small>Tu choisiras ton école en devenant gladiateur (grade 2). Elle te donne un style et une frappe d’élan.</small>'; })()}</section>
    <section class="card"><h2>Talents</h2>${perks || '<small>Aucun talent pour l’instant. Chaque niveau t’en offre un à choisir.</small>'}</section>
    ${fold('pyr', 'La pyramide', S.freed ? 'Affranchi' : G.rankName(S), `${ART.pyramid(S.rank, S.freed, RNAMES(S.gender))}<small style="text-align:center">${S.freed ? 'Tu as touché le rudis.' : S.rank === G.LAST ? 'Il ne reste qu’un duel pour la liberté.' : `Prochain degré : ${G.rankName(S, S.rank + 1)}. Gloire ${G.gloireBar(S).cur}/${G.gloireBar(S).max}.`}</small>`, false)}
    ${fold('hist', 'Ton histoire', og.n, `<p style="margin:0" class="muted">${og.t}</p>`, false)}
    ${fold('opts', 'Réglages', 'Vitesse du temps, recommencer', `<div class="seg">${[[60, '×60'], [600, '×600'], [1, 'Réel']].map(x => `<button data-act="speed:${x[0]}" class="${S.speed === x[0] ? 'sel' : ''}" aria-pressed="${S.speed === x[0]}">${x[1]}</button>`).join('')}</div>
    <small>${S.speed === 60 ? 'Une minute réelle vaut une heure de jeu.' : S.speed === 600 ? 'Pour tester vite : dix minutes de jeu par seconde.' : 'Temps réel.'}</small>
    <button class="btn ghost" data-act="${ui.confirmReset ? 'reset' : 'ask'}"><b>${ui.confirmReset ? 'Confirmer : tout effacer et recommencer' : 'Recommencer avec un autre gladiateur'}</b><small>${ui.confirmReset ? 'Cette action est définitive.' : 'Efface ce gladiateur'}</small></button>`, false)}`;
  const der = [['Vie', pcb.maxHp], ['Dégâts', pcb.w], ['Armure', pcb.ar + (pcb.ecu ? ' (+' + pcb.ecu + ')' : '')], ['Critique', Math.round(pcb.crit * 100) + ' %'], ['Esquive', Math.round(pcb.esq * 100) + ' %']];
  const slots = S.potSlots ? S.potSlots.filter(Boolean).length : 0, nb = G.setBonuses(S).length;
  return head + `<section class="card"><h2>Équipement</h2><div class="gslots">${['h', 'c', 'b', 'l', 's', 'w', 't'].map(slotBtn).join('')}<div class="gs tot"><b class="num">${G.gearA(S)}</b><span>Armure</span></div></div><button class="btn" data-act="best" style="margin:8px 0"><b>Équiper le meilleur</b><small>Choisit les pièces qui marchent le mieux ensemble</small></button><div class="card" style="background:var(--night2)">${slotPanel()}</div></section>
    <section class="card"><h2>Caractéristiques</h2>${row('str', st.force)}${row('agi', st.agi)}${row('end', st.end)}<div class="ders">${der.map(d => `<div><b class="num">${d[1]}</b><small>${d[0]}</small></div>`).join('')}</div></section>
    ${fold('potions', 'Potions de combat', `${slots}/3 à la ceinture`, beltHTML(), false)}
    ${fold('sets', 'Panoplies', nb ? `${nb} bonus actif${nb > 1 ? 's' : ''}` : 'Aucun bonus actif', setsCard().replace('<h2>Panoplies</h2>', '').replace(/<section class="card">/, '<div>').replace(/<\/section>\s*$/, '</div>'), false)}`;
}
function stageForTab() {
  const lk = look(S);
  if (tab === 'arene') {
    const L = cands(), c = selected(L);
    return stageHTML('arena', { hero: lk, foe: c && c.opp.look, lv: 1 });
  }
  if (tab === 'ludus') {
    const cls = S.occ && !G.occReady(S) ? (S.occ.kind === 'train' ? 'train' : S.occ.kind === 'work' ? 'work' : '') : '';
    return stageHTML('yard', { hero: lk, heroPos: 'M', heroCls: cls });
  }
  return stageHTML('yard', { hero: lk, heroPos: 'M' });
}
function renderGame() {
  const body = { ludus, arene: arena, rang: board, boutique: shop, hero }[tab]();
  const old = $('.dock'), keep = old && ui.lastTab === tab ? old.scrollTop : 0, car = $('.carousel'), ckeep = car ? car.scrollLeft : 0;
  ui.lastTab = tab;
  $('#root').innerHTML = `<div class="game t-${tab}">${hud()}${stageForTab()}<main class="dock gut">${body}</main><nav class="tabs gut"><div class="in">${NAV.map(t => `<button data-tab="${t[0]}" class="${tab === t[0] ? 'on' : ''}" aria-current="${tab === t[0]}">${ART.navIcon(t[0] === 'hero' ? 'hero' : t[0])}${t[1]}${t[0] === 'ludus' && G.msnReady(S) ? '<i class="ndot"></i>' : ''}</button>`).join('')}</div></nav></div>`;
  const nd = $('.dock'); if (nd) nd.scrollTop = keep;
  const nc = $('.carousel'); if (nc) nc.scrollLeft = ckeep;
  ui.ready = G.occReady(S);
}
function render() { S ? renderGame() : renderCreate(); }

