/* ---------- combat ---------- */
const INTENT = { drink: 's’apprête à boire une potion. Frappe avant qu’il ne boive !', strike: 'se prépare à frapper.', heavy: 'arme un coup puissant. Couvre-toi, ou encaisse.', guard: 'se couvre. Un coup direct fera moins mal.' };
const MOVE_UI = [['strike', 'Frapper', '1 PA'], ['heavy', 'Coup puissant', '3 PA'], ['guard', 'Se couvrir', '+2 PA'], ['flair', 'Panache', '2 PA · foule']];
const MOVE_COST = { strike: 1, heavy: 3, guard: 0, flair: 2 };
const BURST = `<svg viewBox="-50 -50 100 100"><g fill="#fff3c4" stroke="#ff9a3c" stroke-width="2" stroke-linejoin="round"><path d="M0 -46 L7 -12 L40 -24 L16 2 L46 20 L10 14 L4 46 L-6 16 L-40 28 L-16 4 L-46 -16 L-10 -12Z"/></g></svg>`;
function startFight(opp) {
  if (ui.busy) return;
  if (!opp.spar && S.hp < G.maxHp(S) * 0.25) { toast('Tu es trop blessé pour combattre.'); return; }
  ui.busy = true; SFX.init(); SFX.drum();
  if (opp.spar) ui.spar = null;
  const rule = opp.night ? G.nightRule(S).id : null;
  if (!opp.spar && !opp.night && !opp.rival && !opp.tour) G.engage(S, opp);
  fightView(G.newFight(opp.spar ? G.sparState(S) : S, opp, rule), opp, look(S));
}
function fightView(f, opp, myLook) {
  let locked = false, auto = false, spd = 1, shownLv = 1;
  document.querySelectorAll('#root [id]').forEach(e => e.removeAttribute('id')); /* évite les doublons d’identifiants avec la scène du dessous */
  const bar = (id, cls, v, t) => `<div class="bar ${cls}"><i id="${id}" style="width:${v}%"></i><b class="num" id="${id}t">${t}</b></div>`;
  $('#layer').innerHTML = `<div class="battle"><div class="in" id="bin">
    <div class="stage lv1 ${f.rule ? 'r-' + f.rule : ''}" id="stage">${paint('arena') ? '<div class="wall paint p-arena"></div>' : `${ART.arenaWall()}<div class="floor arena">${ART.MEANDER(9, '#a97f1f')}</div>`}
      <div class="fgt L" id="fP">${ART.figure(Object.assign({}, myLook, { cls: '' }))}</div><div class="fgt R" id="fE">${ART.figure(Object.assign({}, opp.look, { cls: '' }))}</div>
      <div class="bhud"><div><div class="nm">${esc(S.name)}</div>${bar('ph', 'hp', pct(f.P.hp, f.P.maxHp), f.P.hp + '/' + f.P.maxHp)}${f.P.armMax ? bar('pm', 'arm', 100, f.P.arm + '/' + f.P.armMax) : ''}</div><div><div class="nm r">${esc(opp.name)}</div>${bar('eh', 'hp', 100, f.E.maxHp + '/' + f.E.maxHp)}${f.E.armMax ? bar('em', 'arm', 100, f.E.arm + '/' + f.E.armMax) : ''}${f.E.pots.length ? `<div class="epots" id="ep">${f.E.pots.map(() => `<span class="ep on">${evIcon('potion')}</span>`).join('')}</div>` : ''}</div></div>
      <div class="favrow"><span class="cap">Faveur de la foule</span>${bar('fv', 'fav', f.fav, Math.round(f.fav))}</div>
      <div class="fx" id="fx"></div><div class="caption" id="caption">${esc(S.name)} entre sur le sable. ${esc(opp.name)} se dresse en face.${f.rule ? ' ' + esc(G.ARENA_RULES.find(r => r.id === f.rule).n) + ' : ' + esc(G.ARENA_RULES.find(r => r.id === f.rule).d) : ''} ${esc(opp.name)} : ${esc(((G.matchup(S, opp) || {}).open) || G.quip(opp, 'open'))}${advice(opp) ? ' ' + esc(advice(opp)) : ''}</div>${f.rule ? `<div class="rulebar"><span>${esc(G.NIGHT_RULES.find(r => r.id === f.rule).n)}</span></div>` : ''}</div>
    <div class="ctl gut"><div class="row"><span class="cap">Points d’action</span><span class="pa" id="pa"></span></div><div class="intent" id="intent"></div>
      ${f.pots.some(Boolean) ? `<div class="pots" id="pots">${f.pots.map((p, i) => { if (!p) return ''; const x = G.POT_BY[p.id]; return `<button class="btn pbtn" data-pt="${i}"><div class="pic ${p.id}">${evIcon('potion')}</div><span class="t"><b>${esc(x.n)}</b><small>Coûte ton tour</small></span></button>`; }).join('')}</div>` : ''}<div class="elanrow"><span class="cap">Élan</span><span class="pa el" id="elp"></span><small id="elh"></small></div><div class="moves" id="moves"><button class="btn elanbtn" data-mv="elan" hidden><span class="t"><b id="elname"></b><small id="eld"></small></span></button>${MOVE_UI.map(m => `<button class="btn" data-mv="${m[0]}">${ART.mvIcon(m[0])}<span class="t"><b>${m[1]}</b><small>${m[2]}</small></span></button>`).join('')}</div>
      <div class="grid2"><button class="btn ghost" id="auto" style="align-items:center"><b>Laisser faire</b></button><button class="btn ghost" id="spd" style="align-items:center"><b>Vitesse ×1</b></button></div></div>
  </div></div>`;
  const stage = $('#stage'), fx = $('#fx');
  const set = (id, v, mx, txt) => { $('#' + id).style.width = pct(v, mx) + '%'; $('#' + id + 't').textContent = txt; };
  const anim = (who, cls, ms) => { const el = $((who === 'p' ? '#fP' : '#fE') + ' .fig'); if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); };
  const at = ms => setTimeout.bind(null, undefined, 0) && ms / spd;
  const later = (fn, ms) => setTimeout(fn, ms / spd);
  const dmg = (who, txt, cls, top) => { const d = document.createElement('div'); d.className = 'dmg ' + (cls || ''); d.style.left = (who === 'p' ? 27 : 73) + '%'; d.style.top = top || '30%'; d.textContent = txt; fx.appendChild(d); setTimeout(() => d.remove(), 1000); };
  const spark = () => { const s = document.createElement('div'); s.className = 'spark'; s.style.left = '50%'; s.style.top = '56%'; s.innerHTML = BURST; fx.appendChild(s); setTimeout(() => s.remove(), 420); };
  const cutin = (txt, foe) => { const c = document.createElement('div'); c.className = 'cutin' + (foe ? ' foe' : ''); c.innerHTML = `<span>${txt}</span>`; fx.appendChild(c); setTimeout(() => c.remove(), 800 / spd); };
  const puff = (who, n) => { for (let i = 0; i < n; i++) { const p = document.createElement('div'); p.className = 'puff'; p.style.left = (who === 'p' ? 24 + i * 3 : 70 - i * 3) + '%'; p.style.bottom = '12%'; p.style.setProperty('--dx', (who === 'p' ? -1 : 1) * (14 + i * 10) + 'px'); fx.appendChild(p); setTimeout(() => p.remove(), 700); } };
  const blood = (who, n) => { for (let i = 0; i < n; i++) { const b = document.createElement('div'); b.className = 'bd'; b.style.left = (who === 'p' ? 27 : 73) + '%'; b.style.top = '50%'; b.style.setProperty('--bx', (Math.random() * 90 - 45) * (who === 'p' ? -1 : 1) + 'px'); b.style.setProperty('--by', (Math.random() * 70 - 25) + 'px'); fx.appendChild(b); setTimeout(() => b.remove(), 600); } };
  const shake = big => { stage.classList.remove('shake', 'shakeb'); void stage.offsetWidth; stage.classList.add(big ? 'shakeb' : 'shake'); setTimeout(() => stage.classList.remove('shake', 'shakeb'), 480); };
  const wnd = e => { [['#fP', e.pHp / f.P.maxHp], ['#fE', e.eHp / f.E.maxHp]].forEach(([id, r]) => { const el = $(id + ' .fig'); if (el) { el.classList.toggle('w1', r <= 0.6); el.classList.toggle('w2', r <= 0.3); } }); };
  const bars = e => { if (e.pHp != null) wnd(e); const ep = $('#ep'); if (ep) { const n = e.ePots != null ? e.ePots : f.E.pots.filter(z => !z.used).length; ep.innerHTML = Array.from({ length: f.E.pots.length }, (_, i) => `<span class="ep ${i < n ? 'on' : ''}">${evIcon('potion')}</span>`).join(''); } set('ph', e.pHp, f.P.maxHp, e.pHp + '/' + f.P.maxHp); set('eh', e.eHp, f.E.maxHp, e.eHp + '/' + f.E.maxHp); set('fv', e.fav, 100, e.fav); if (f.P.armMax && e.pArm != null) set('pm', e.pArm, f.P.armMax, e.pArm + '/' + f.P.armMax); if (f.E.armMax && e.eArm != null) set('em', e.eArm, f.E.armMax, e.eArm + '/' + f.E.armMax); const lv = crowdLv(e.fav); stage.classList.remove('lv0', 'lv1', 'lv2', 'lv3'); stage.classList.add('lv' + lv); if (lv > shownLv) SFX.crowd(lv); shownLv = lv; };
  const MOVE_COST = { strike: 1, heavy: 3, guard: 0, flair: 2 };
  const paint = () => {
    $('#pa').innerHTML = Array.from({ length: 6 }, (_, i) => `<i class="${i < f.sp ? 'on' : ''}"></i>`).join('');
    $('#intent').textContent = f.over ? '' : f.rule === 'blind' ? `La fumée t’empêche de voir ce que prépare ${opp.name}.` : f.hide ? `${opp.name} masque ses intentions.` : `${opp.name} ${INTENT[f.intent]}`; $('#intent').hidden = f.over;
    const sch = G.SCHOOL_BY[f.P.school] || G.ELAN_NONE, eb = document.querySelector('[data-mv="elan"]');
    $('#elp').innerHTML = Array.from({ length: 3 }, (_, i) => `<i class="${f.elan || i < f.streak ? 'on' : ''}"></i>`).join('');
    $('#elh').textContent = f.elan ? 'prête' : f.streak ? `${f.streak}/3 touches` : '3 touches d’affilée';
    if (eb) { eb.hidden = !(f.elan && !f.over); $('#elname').textContent = sch.elan + ' · gratuit'; $('#eld').textContent = sch.ed || 'Un coup lourd qui peut rater.'; }
    document.querySelectorAll('[data-mv]').forEach(b => { b.disabled = locked || f.over || MOVE_COST[b.dataset.mv] > f.sp; });
    document.querySelectorAll('[data-pt]').forEach(b => { const p = f.pots[+b.dataset.pt]; b.disabled = locked || f.over || !p || p.used || !(f.s.pots[p.id] > 0); b.classList.toggle('used', !!(p && p.used)); });
  };
  const apply = e => {
    const cap = $('#caption'); if (cap) cap.textContent = e.t;
    const att = e.side, tgt = att === 'p' ? 'e' : 'p';
    if (e.k === 'hit' || e.k === 'crit' || e.k === 'flair') {
      anim(att, e.heavy ? 'heavy' : e.k === 'flair' ? 'flair' : 'atk', e.heavy ? 720 : 520);
      puff(att, e.heavy ? 3 : 2);
      if (e.elan) { cutin(e.elan); SFX.slash(); } else if (e.k === 'crit') { cutin('Coup critique', att === 'e'); SFX.slash(); } else if (e.heavy) { cutin('Coup puissant', att === 'e'); SFX.slash(); } else if (e.k === 'flair') cutin(att === 'p' ? 'Panache !' : 'Parade !', att === 'e' && false);
      later(() => {
        anim(tgt, 'hurt', 420); spark(); shake(e.heavy || e.k === 'crit'); blood(tgt, e.heavy || e.k === 'crit' ? 9 : 5);
        if (e.d > 0 || !e.ab) dmg(tgt, '−' + e.d, e.k === 'crit' ? 'crit' : ''); if (e.ab) dmg(tgt, e.d > 0 ? 'Armure −' + e.ab : 'Absorbé −' + e.ab, 'armd', e.d > 0 ? '16%' : '30%');
        if (e.k === 'crit' || e.heavy) SFX.crit(); else SFX.hit();
        if (tgt === 'p') { const r = document.createElement('div'); r.className = 'redflash'; fx.appendChild(r); setTimeout(() => r.remove(), 520); }
        if (e.k === 'flair') { dmg(att, 'Panache !', 'fav'); SFX.crowd(2); }
        bars(e);
      }, e.heavy ? 300 : 200);
    } else if (e.k === 'cheer') {
      cutin('Relève-toi !'); SFX.crowd(2); SFX.level(); bars(e);
    } else if (e.k === 'miss') {
      anim(att, 'atk', 520); later(() => { anim(tgt, 'dodge', 460); dmg(tgt, 'Raté', 'miss'); SFX.miss(); bars(e); }, 200);
    } else if (e.k === 'momentum') {
      cutin('Élan !'); SFX.crowd(2); bars(e);
    } else if (e.k === 'stun') {
      anim('e', 'hurt', 420); dmg('e', 'Sonné', 'miss'); SFX.block(); bars(e);
    } else if (e.k === 'potion') {
      cutin('Potion', att === 'e'); SFX.level(); bars(e); anim(att, 'grd', 620); if (e.heal) dmg(att, '+' + e.heal, 'fav');
    } else if (e.k === 'guard') {
      anim(att, 'grd', 620); SFX.block(); bars(e);
    } else bars(e);
  };
  const play = mv => {
    if (locked || f.over) return;
    SFX.click();
    const ev = G.fightRound(f, mv);
    if (!ev) { toast('Pas assez de points d’action.'); return; }
    locked = true; paint();
    let i = 0;
    const step = () => {
      if (i < ev.length) { apply(ev[i++]); setTimeout(step, 720 / spd); return; }
      if (f.over) {
        stage.classList.add('slow'); anim(f.win ? 'e' : 'p', 'dead', 1000); const el = $((f.win ? '#fE' : '#fP') + ' .fig'); if (el) el.classList.add('dead');
        const w = $((f.win ? '#fP' : '#fE') + ' .fig'); if (w) w.classList.add('win');
        setTimeout(() => { stage.classList.remove('slow'); locked = false; paint(); finish(); }, 1300 / spd);
        return;
      }
      locked = false; paint();
      if (auto) setTimeout(() => play(G.autoChoice(f)), 250 / spd);
    };
    step();
  };
  const finish = () => {
    const res = G.fightResult(f);
    const box = document.createElement('div'); box.className = 'res'; $('#bin').appendChild(box);
    const done = html => { box.innerHTML = `<div class="tablet">${html}</div>`; };
    if (opp.spar) {
      const so = G.resolveSpar(S, res.win), qd = G.checkQuests(S);
      save(); ui.busy = false; S.lastReal = Date.now(); res.win ? SFX.win() : SFX.lose(); if (qd.length) setTimeout(SFX.quest, 600);
      done(`<div class="cap">Sparring</div><h2>${res.win ? 'Bien joué' : 'Le maître d’armes t’a battu'}</h2><div class="gain num">${so.xp ? `<span>+${so.xp} xp</span>` : ''}${so.k ? `<span>${G.STAT_N[so.k]} progresse</span>` : ''}</div>${so.up ? `<p class="muted" style="margin:0;text-align:center">${so.up.trim()}</p>` : ''}${so.levels ? `<p class="muted" style="margin:0;text-align:center">Niveau ${S.level} atteint.</p>` : ''}${so.useless ? '<p class="muted" style="margin:0;text-align:center">Il n’a plus rien à t’apprendre.</p>' : ''}${questNote(qd)}<button class="btn main" id="cont">Continuer</button>`);
      $('#cont').onclick = () => { layer(''); render(); next(); };
      return;
    }
    const out = G.resolve(S, opp, res), qd = G.checkQuests(S);
    save(); ui.busy = false; S.lastReal = Date.now();
    out.win ? SFX.win() : SFX.lose(); if (out.win) setTimeout(SFX.coin, 500); if (out.loot) setTimeout(() => SFX.loot(out.loot.item.rar), 900); if (qd.length) setTimeout(SFX.quest, 900);
    const cote = `<span>cote ${out.cote >= 0 ? '+' : ''}${out.cote}</span>`;
    done((out.win
      ? `<div class="cap">Victoire</div><h2>${esc(opp.name)} est à terre</h2><p class="quote" style="margin:0;text-align:center">${esc(out.quote ? '« ' + out.quote + ' »' : G.quip(opp, 'down'))}</p><div class="gain num"><span>+${out.gloire} gloire</span><span>+${out.gold} sesterces</span>${cote}${out.wager ? `<span>pari gagné +${out.wagerWin}</span>` : ''}</div>${out.ovation ? `<p class="muted" style="margin:0;text-align:center">Les gradins t’ont porté : +${out.ovation} de vie.</p>` : ''}${out.levels ? `<p class="muted" style="margin:0;text-align:center">Niveau ${S.level} atteint. Une caractéristique progresse.</p>` : ''}${out.nem ? '<p class="muted" style="margin:0;text-align:center">Revanche prise : gloire et sesterces ×1,5.</p>' : ''}${out.ctrLoot ? '<p class="muted" style="margin:0;text-align:center">Butin du contrat :</p>' : ''}${out.loot ? dropHTML(out.loot) : ''}${tourNote(out)}`
      : `<div class="cap">Défaite</div><h2>${out.spared ? 'La foule réclame ta grâce' : 'Tu t’effondres sur le sable'}</h2><p class="quote" style="margin:0;text-align:center">${esc(opp.name)} : ${esc(G.quip(opp, 'win'))}</p><div class="gain num">${cote}${out.lostGloire ? `<span>−${out.lostGloire} gloire</span>` : ''}${out.lost ? `<span>−${out.lost} sesterces</span>` : ''}${out.wager ? `<span>pari perdu −${out.wager}</span>` : ''}</div><p class="muted" style="margin:0;text-align:center">${out.spared ? 'Ton panache t’a sauvé. Tu t’en sors avec presque rien.' : `Le public ne t’a pas épargné. Quelques spectateurs te lancent ${out.coins} sesterces.`}</p>${out.nemNew ? `<p class="muted" style="margin:0;text-align:center">${esc(opp.name)} s’en souviendra. Il reviendra plus fort, et une revanche te rapportera gros.</p>` : ''}${tourNote(out)}`) + questNote(qd) + `<button class="btn main" id="cont">Continuer</button>`);
    if (out.tour && out.tour.state === 'next') {
      $('#cont').textContent = 'Round suivant';
      const q = document.createElement('button'); q.className = 'btn ghost'; q.textContent = 'Abandonner le tournoi'; $('#cont').after(q);
      q.onclick = () => { G.tourQuit(S); save(); layer(''); render(); next(); };
      $('#cont').onclick = () => { $('#layer').innerHTML = ''; render(); startFight(out.tour.next); };
      return;
    }
    $('#cont').onclick = () => {
      if (out.freed) ui.queue.push(() => rankSheet(out, out.quote));
      else if (out.rankUp) ui.queue.push(() => rankSheet(out.rankUp, out.quote));
      $('#layer').innerHTML = ''; render(); next();
    };
  };
  if ($('#pots')) $('#pots').addEventListener('click', e => { const b = e.target.closest('[data-pt]'); if (b && !b.disabled) play('pot' + b.dataset.pt); });
  $('#moves').addEventListener('click', e => { const b = e.target.closest('[data-mv]'); if (b && !b.disabled) play(b.dataset.mv); });
  $('#auto').onclick = () => { auto = !auto; $('#auto b').textContent = auto ? 'Reprendre la main' : 'Laisser faire'; if (auto && !locked && !f.over) play(G.autoChoice(f)); };
  $('#spd').onclick = () => { spd = spd === 1 ? 2 : 1; $('#spd b').textContent = 'Vitesse ×' + spd; };
  paint();
}

