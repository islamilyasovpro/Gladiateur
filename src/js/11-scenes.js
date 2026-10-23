/* ---------- scènes ---------- */
function crowdLv(f) { return f >= 70 ? 3 : f >= 45 ? 2 : f >= 20 ? 1 : 0; }
function stageHTML(kind, o) {
  o = o || {};
  const art = painted(...(o.paint || []), kind === 'arena' ? 'arena' : 'ludus');
  const wall = art ? `<div class="wall paint p-${art}"></div>` : kind === 'arena' ? ART.arenaWall() : ART.yardWall({ bed: S ? S.cell.bed : 0, hearth: S ? S.cell.hearth : 0, stash: S ? S.cell.stash : 0, weapon: S ? S.weapon : 0 });
  const floor = art ? '' : `<div class="floor ${kind === 'arena' ? 'arena' : 'yard'}">${ART.MEANDER(9, '#a97f1f')}</div>`;
  const hero = o.hero ? `<div class="fgt ${o.heroPos || 'L'}" id="fP">${ART.figure(Object.assign({}, o.hero, { cls: o.heroCls || '' }))}</div>` : '';
  const comp = (kind !== 'arena' && S && S.flags && S.flags.met && !S.flags.lost && !o.noComp) ? `<div class="fgt K">${ART.figure({ gender: S.comp.g, skin: S.comp.skin, hair: S.comp.hair, hairc: S.comp.hairc, rank: 0, armor: 0, weapon: 0 })}</div>` : '';
  const foe = o.foe ? `<div class="fgt R" id="fE">${ART.figure(Object.assign({}, o.foe, { cls: o.foeCls || '' }))}</div>` : '';
  return `<div class="stage ${kind === 'arena' ? 'lv' + (o.lv == null ? 1 : o.lv) : ''}" id="stage">${wall}${floor}${comp}${hero}${foe}<div class="fx" id="fx"></div></div>`;
}

/* ---------- création ---------- */
const NAMES = { h: ['Aron', 'Dacian', 'Galen', 'Marek', 'Titus', 'Brann'], f: ['Selene', 'Mira', 'Kora', 'Livia', 'Tamsin', 'Aria'] };
function renderCreate() {
  if (!ui.draft) ui.draft = { name: '', gender: 'h', skin: 1, hair: 0, hairc: 0, origin: 'capt' };
  const d = ui.draft;
  $('#root').innerHTML = `<div class="create"><div class="hero">${painted('create', 'ludus') ? `<div class="wall paint p-${painted('create', 'ludus')}"></div>` : `${ART.yardWall({})}<div class="floor yard" style="position:absolute;left:0;right:0;bottom:0;height:20%">${ART.MEANDER(9, '#a97f1f')}</div>`}<div class="fgt C" id="pv"></div><div class="ttl"><h1>LUDUS MAGNUS</h1><div class="cap">Prototype</div></div></div>
    <div class="body gut">
    <div><h2 style="font-size:22px;line-height:1.2">Tu es enchaîné.<br>Tu ne le resteras pas.</h2><p class="muted" style="margin:8px 0 0">Du sable de l’arène jusqu’au rudis, l’épée de bois des affranchis. Un rival t’attend à chaque marche, et la foule décide de ton sort.</p></div>
    <div><div class="cap">Ton nom</div><div class="row" style="margin-top:6px"><input type="text" id="nm" maxlength="18" placeholder="Comment t’appelle-t-on ?" autocomplete="off"><button class="btn ghost" data-act="dice" style="min-width:96px;align-items:center">Au hasard</button></div></div>
    <div><div class="cap">Qui es-tu</div><div class="seg two" style="margin-top:6px"><button data-act="g:h" data-k="g-h">Homme</button><button data-act="g:f" data-k="g-f">Femme</button></div></div>
    <div><div class="cap">Teint</div><div class="swatches" style="margin-top:6px">${ART.SKINS.map((c, i) => `<button class="pick" data-act="skin:${i}" data-k="skin-${i}" style="background:${c}" aria-label="Teint ${i + 1}"></button>`).join('')}</div></div>
    <div><div class="cap">Cheveux</div><div class="seg" style="margin-top:6px"><button data-act="hair:0" data-k="hair-0">Courts</button><button data-act="hair:1" data-k="hair-1">Longs</button><button data-act="hair:2" data-k="hair-2">Rasés</button></div>
      <div class="swatches" style="margin-top:10px">${ART.HAIRC.map((c, i) => `<button class="pick" data-act="hairc:${i}" data-k="hairc-${i}" style="background:${c}" aria-label="Couleur ${i + 1}"></button>`).join('')}</div></div>
    <div><div class="cap">D’où viens-tu</div><div style="display:flex;flex-direction:column;gap:8px;margin-top:6px">${G.ORIGINS.map(o => `<button class="origin" data-act="origin:${o.id}" data-k="origin-${o.id}"><strong>${o.n}</strong><span class="muted">${o.t}</span><em>${o.b}</em></button>`).join('')}</div></div>
    <button class="btn main" data-act="begin" style="min-height:58px">Entrer dans le ludus</button>
    ${META.legacy ? `<small style="text-align:center">Héritage de ${META.legacy} gladiateur(s) affranchi(s) : +${Math.min(3, META.legacy)} à chaque caractéristique de départ.</small>` : ''}
  </div></div>`;
  $('#nm').value = d.name;
  $('#nm').addEventListener('input', e => { d.name = e.target.value; });
  refreshDraft();
}
function refreshDraft() {
  const d = ui.draft;
  $('#pv').innerHTML = ART.figure({ gender: d.gender, skin: d.skin, hair: d.hair, hairc: d.hairc, rank: 0, armor: 0, weapon: 0 });
  document.querySelectorAll('[data-k]').forEach(el => {
    const [k, v] = el.dataset.k.split('-');
    const cur = k === 'g' ? d.gender : String(d[k]);
    el.classList.toggle('sel', cur === v);
    el.setAttribute('aria-pressed', cur === v);
  });
}

