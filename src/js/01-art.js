/* ---------- art : figures rouges sur fond noir, tout en SVG ---------- */
const ART = (() => {
const INK = '#1a0c06', IVORY = '#ecdcbc', STEEL = '#8f959c', BRONZE = '#b2813a', GOLD = '#e2b341', BLOOD = '#8e2b22', WOOD = '#7d5230', LEATHER = '#5e3b1e';
const SKINS = ['#e39a62', '#cb6a33', '#a84f22', '#7e3718'];
const HAIRC = ['#1c0e07', '#4f2c15', '#caa14a', '#0c0c10'];

/* volume : la lumière vient d'en haut à gauche (face au personnage), l'ombre tombe en bas à droite */
const mix = (hex, to, t) => {
  const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
  const c = sft => Math.round(((a >> sft) & 255) * (1 - t) + ((b >> sft) & 255) * t);
  return '#' + ((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1);
};
/* un membre musclé : épais à l'attache, ventre du muscle au tiers, fin à l'articulation */
const f1 = v => Math.round(v * 10) / 10;
function taper(p0, p1, w0, w1) {
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const a = w0 / 2, c = w1 / 2, b = w0 * 0.6, mx = p0[0] + dx * 0.36, my = p0[1] + dy * 0.36;
  const P = (x, y, k) => `${f1(x + nx * k)} ${f1(y + ny * k)}`;
  return `M${P(p0[0], p0[1], a)}Q${P(mx, my, b * 1.25)} ${P(p1[0], p1[1], c)}A${f1(c)} ${f1(c)} 0 0 0 ${P(p1[0], p1[1], -c)}Q${P(mx, my, -b * 1.12)} ${P(p0[0], p0[1], -a)}A${f1(a)} ${f1(a)} 0 0 0 ${P(p0[0], p0[1], a)}Z`;
}
const limb = (pts, ws, fill) => {
  const solid = /^#[0-9a-f]{6}$/i.test(fill);
  const segs = pts.slice(0, -1).map((p, i) => taper(p, pts[i + 1], ws[i], ws[i + 1] != null ? ws[i + 1] * 0.95 : ws[i] * 0.7));
  const line = (col, k, dx, dy, op) => pts.slice(0, -1).map((p, i) => `<path d="M${f1(p[0] + dx * ws[i])} ${f1(p[1] + dy * ws[i])}L${f1(pts[i + 1][0] + dx * ws[i])} ${f1(pts[i + 1][1] + dy * ws[i])}" stroke="${col}" stroke-width="${f1(ws[i] * k)}" stroke-linecap="round" fill="none" opacity="${op}"/>`).join('');
  return segs.map(d => `<path d="${d}" fill="${INK}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`).join('')
    + segs.map(d => `<path d="${d}" fill="${fill}"/>`).join('')
    + (solid ? line(mix(fill, '#1a0a04', 0.5), 0.3, 0.24, 0.2, 0.5) + line(mix(fill, '#fff4e0', 0.42), 0.24, -0.16, -0.2, 0.55) : '');
};
const sh = (d, fill, sw) => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw || 1.4}" stroke-linejoin="round"/>` + (fill[0] === '#' ? `<path d="${d}" fill="url(#vol)"/>` : '');
const ln = (d, c, w, op) => `<path d="${d}" fill="none" stroke="${c || INK}" stroke-width="${w || 1.2}" stroke-linecap="round" opacity="${op || 0.75}"/>`;

function weaponG(i) {
  if (i < 0) return '';
  const blade = (len, col, fuller, gold) => {
    const x2 = 146 + len;
    return `<g>${sh(`M146 95 L${x2 - 6} 96.4 L${x2 + 4} 98 L${x2 - 6} 99.6 L146 101Z`, col, 1.4)}${fuller ? ln(`M150 98 L${x2 - 6} 98`, INK, 1, 0.4) : ''}
      ${sh('M143.5 91 L147 91 L147 105 L143.5 105Z', gold ? GOLD : BRONZE, 1.3)}<circle cx="140" cy="98" r="3.4" fill="${gold ? GOLD : BRONZE}" stroke="${INK}" stroke-width="1.2"/></g>`;
  };
  if (i === 0) return `<g transform="rotate(-20 142 98)">${ln('M118 99 L206 99', INK, 8, 1)}${ln('M118 99 L206 99', WOOD, 5, 1)}${ln('M170 99 L172 99', INK, 1)}</g>`;
  if (i === 1) return `<g transform="rotate(-26 142 98)">${blade(34, '#7d6a58', false, false)}</g>`;
  if (i === 2) return `<g transform="rotate(-26 142 98)">${blade(40, '#b9bec4', true, false)}</g>`;
  if (i === 3) return `<g transform="rotate(-12 142 98)">${ln('M120 99 L196 99', INK, 7, 1)}${ln('M120 99 L196 99', STEEL, 4, 1)}<path d="M194 99 L214 99 M194 99 Q199 85 212 84 M194 99 Q199 113 212 114" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/><path d="M194 99 L214 99 M194 99 Q199 85 212 84 M194 99 Q199 113 212 114" fill="none" stroke="#c4c9cf" stroke-width="2.6" stroke-linecap="round"/></g>`;
  if (i === 4) return `<g transform="rotate(-28 142 98)">${blade(58, '#c9ced4', true, false)}</g>`;
  return `<g transform="rotate(-30 142 98)" filter="url(#glow)">${blade(64, GOLD, true, true)}</g>`;
}

/* panoplies : 0 = rien, 1..7 = styles */
const STY = [
  null,
  { metal: '#8a5a2b', trim: '#4a2c12', helm: 'cap', crest: null, chest: 'leather', pauld: 0, shield: 'round', rim: '#4a2c12' },
  { metal: BRONZE, trim: '#7a5624', helm: 'open', crest: null, chest: 'plate', pauld: 1, shield: 'round', rim: BRONZE },
  { metal: '#b8bec6', trim: '#9a3a2c', helm: 'crest', crest: '#b8382c', chest: 'plate', pauld: 1, shield: 'rect', rim: '#b8bec6' },
  { metal: '#9aa3ab', trim: '#2f5c9a', helm: 'full', crest: '#2f5c9a', chest: 'plate', pauld: 1, shield: 'large', rim: '#cfd5da' },
  { metal: '#7a8c70', trim: '#4a5a40', helm: 'none', crest: null, chest: 'harness', pauld: 2, shield: 'net', rim: '#a7b39c' },
  { metal: '#d3d8de', trim: '#a8302a', helm: 'crest', crest: '#a8302a', chest: 'plate', pauld: 1, shield: 'large', rim: GOLD },
  { metal: GOLD, trim: '#9c2a22', helm: 'crest', crest: '#b02e24', chest: 'plate', pauld: 1, shield: 'large', rim: '#fff3bb' }
];
const AR2STY = [0, 1, 2, 3, 4, 6];
function pcOf(o) {
  if (o.pc) return { h: o.pc.h | 0, c: o.pc.c | 0, b: o.pc.b | 0, l: o.pc.l | 0, s: o.pc.s | 0 };
  const k = AR2STY[Math.min(5, o.armor || 0)];
  return { h: k, c: k, b: k, l: k, s: k };
}
function figure(o) {
  const g = o.gender === 'f', skin = SKINS[o.skin == null ? 1 : o.skin], hc = HAIRC[o.hairc || 0], hs = o.hair == null ? 0 : o.hair;
  const rank = o.rank || 0, ar = o.armor || 0, wp = o.weapon == null ? 0 : o.weapon, sc = o.scars || 0;
  const pc = pcOf(o), SH = STY[pc.h], SC = STY[pc.c], SB = STY[pc.b], SL = STY[pc.l], SS = STY[pc.s];
  let s = '';
  s += `<ellipse cx="108" cy="278" rx="58" ry="9" fill="url(#gshadow)"/>`;
  s += `<g class="root">`;
  if (rank >= 3) s += `<g class="cape">${sh('M98 86 C70 108 64 168 70 222 L96 206 L104 124Z', rank >= 5 ? '#9c2a22' : '#6e2019', 1.6)}${ln('M92 110 C84 150 84 180 86 208', INK, 1.2, 0.5)}</g>`;
  /* jambes */
  const back = [[97, 150], [84, 205], [68, 257]], front = [[106, 150], [121, 203], [126, 260]];
  s += `<g class="legB">${limb(back, [19, 13], skin)}${limb([[68, 257], [90, 268]], [8], skin)}${ln('M90 168 Q82 188 86 202', INK, 1.2, 0.55)}${ln('M82 222 Q76 238 74 250', INK, 1.2, 0.5)}</g>`;
  if (SL) s += `<g class="legB">${limb([[82, 222], [74, 246]], [8], SL.metal)}${SL.chest !== 'leather' ? ln('M80 226 L84 226 M78 236 L82 236', INK, 1, 0.5) : ln('M79 230 L85 233 M77 240 L83 243', INK, 1.1, 0.6)}</g>`;
  s += `<g class="legF">${limb(front, [20, 13], skin)}${limb([[126, 260], [148, 268]], [8], skin)}${ln('M114 168 Q124 186 120 200', INK, 1.2, 0.55)}${ln('M122 220 Q129 236 126 250', INK, 1.2, 0.5)}
    ${ln('M123 236 L134 240 M124 246 L135 250', INK, 1.4, 0.8)}</g>`;
  if (SL) s += `<g class="legF">${limb([[122, 222], [125, 247]], [8], SL.metal)}${SL.chest !== 'leather' ? ln('M120 226 L124 226 M121 236 L125 236', INK, 1, 0.5) : ln('M119 230 L125 233 M120 240 L126 243', INK, 1.1, 0.6)}</g>`;
  /* cou, torse */
  s += `<g class="torso">${limb([[103, 68], [104, 90]], [14], skin)}`;
  s += g ? sh('M93 84 C89 104 92 124 95 152 L114 152 C115 130 120 108 116 86Z', skin) : sh('M92 84 C86 102 86 128 92 152 L116 152 C124 132 126 108 118 86Z', skin);
  s += g ? ln('M112 100 Q119 104 116 110', INK, 1.3, 0.6) : ln('M108 98 Q118 104 116 112', INK, 1.4, 0.65) + ln('M106 124 L113 124 M106 134 L112 134', INK, 1.1, 0.5);
  if (g && !SC) s += sh('M95 94 L118 92 L118 106 L96 108Z', IVORY, 1.3);
  if (SC) {
    if (SC.chest === 'harness') {
      s += ln('M96 90 L114 148', SC.metal, 5, 1) + ln('M118 92 L96 146', SC.metal, 5, 1) + ln('M96 90 L114 148', INK, 1, 0.4) + ln('M118 92 L96 146', INK, 1, 0.4);
      s += sh('M93 140 L117 140 L117 150 L93 150Z', SC.trim, 1.3);
    } else {
      s += sh('M92 88 C88 106 90 128 94 150 L115 150 C121 130 122 108 117 90Z', SC.metal, 1.6);
      if (SC.chest === 'leather') [104, 114, 124, 134].forEach(y => { s += ln(`M96 ${y} L112 ${y + 2}`, SC.trim, 1.3, 0.75); }), s += ln('M104 90 L105 148', SC.trim, 1.4, 0.6);
      else { [102, 112, 122, 132, 142].forEach(y => { s += ln(`M90 ${y} Q104 ${y + 3} 119 ${y}`, INK, 1.1, 0.55); }); if (pc.c >= 6) s += ln('M104 90 L104 148', '#fff3bb', 1.4, 0.55); if (pc.c >= 6) s += `<circle cx="104" cy="118" r="4" fill="${SC.trim}" stroke="${INK}" stroke-width="1.2"/>`; }
    }
  }
  s += `</g>`;
  /* jupe */
  const skirt = rank === 0 ? '#7a6650' : IVORY;
  s += `<g class="skirt">${rank === 0 ? sh('M91 146 L117 146 L120 174 L115 169 L110 177 L104 170 L98 178 L93 170 L89 175Z', skirt, 1.4) : sh('M91 146 L117 146 L122 176 L112 180 L106 172 L100 180 L89 174Z', skirt, 1.4)}${ln('M100 150 L98 172 M108 150 L108 174', INK, 1.1, 0.5)}`;
  if (pc.c >= 2 && SC.chest !== 'harness') [95, 102, 109].forEach((x, i) => { s += sh(`M${x} 152 L${x + 6} 152 L${x + 6} ${166 + i} L${x} ${166 + i}Z`, LEATHER, 1); });
  s += `${sh('M91 143 L117 143 L117 150 L91 150Z', pc.c >= 6 ? GOLD : LEATHER, 1.4)}</g>`;
  /* blessures (visibles quand la vie baisse) */
  s += `<g class="wnd wnd1"><path d="M99 104 L112 126" stroke="#7d1812" stroke-width="3.2" stroke-linecap="round"/><path d="M104 102 L116 120" stroke="#a82a20" stroke-width="1.6" stroke-linecap="round"/><circle cx="117" cy="130" r="2.6" fill="#7d1812"/><path d="M104 188 q3 6 1 14" stroke="#7d1812" stroke-width="2.6" stroke-linecap="round" fill="none"/></g>`;
  s += `<g class="wnd wnd2"><path d="M94 120 L122 112" stroke="#7d1812" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="134" r="3.4" fill="#7d1812"/><circle cx="110" cy="96" r="2.4" fill="#7d1812"/><path d="M118 196 q4 8 -1 16" stroke="#7d1812" stroke-width="2.8" stroke-linecap="round" fill="none"/></g>`;
  /* tête */
  s += `<g class="head">`;
  if (hs === 1) s += sh('M96 40 C84 56 78 82 86 108 C93 100 98 84 100 66Z', hc, 1.4);
  if (g && hs === 0) s += sh('M95 44 C86 52 84 66 90 74 C96 70 98 58 99 48Z', hc, 1.3);
  s += sh('M92 44 C92 32 102 24 113 26 C121 28 125 36 125 43 L130 52 L125 54 L126 58 L123 60 L125 65 C124 71 119 75 112 75 C104 75 98 71 96 66 C92 60 92 52 92 44Z', skin);
  s += `<circle cx="103" cy="51" r="4" fill="${skin}" stroke="${INK}" stroke-width="1.3"/>`;
  s += `<path d="M113 44 Q117 41 122 44 Q117 47.5 113 44Z" fill="${IVORY}" stroke="${INK}" stroke-width="1.2"/><circle cx="118.5" cy="44" r="1.9" fill="${INK}"/>${ln('M112 39 L123 40.5', INK, 2, 0.95)}${ln('M123 60 L127.5 59', INK, 1.4, 0.8)}`;
  if (sc >= 1) s += ln('M117 51 L123 62', '#4a1208', 1.6, 0.85) + ln('M118 54 L121 53 M120 58 L123 57', '#4a1208', 1, 0.8);
  if (sc >= 2) s += ln('M101 64 Q106 70 112 71', '#4a1208', 1.4, 0.8);
  if (!SH || SH.helm === 'none') {
    if (hs === 0) s += sh('M91 46 C90 30 104 22 115 25 C122 27 125 33 125 38 C118 33 108 33 100 40 C97 43 96 48 97 54 L92 54Z', hc, 1.4);
    else if (hs === 1) s += sh('M91 46 C88 30 104 20 116 25 C123 27 126 34 125 40 C118 33 108 32 101 38 C97 42 96 48 97 56 L91 56Z', hc, 1.4);
    else s += ln('M100 34 Q108 30 116 34', '#fff1d8', 1.6, 0.3);
  } else if (SH.helm === 'cap') {
    s += sh('M91 46 C90 30 104 22 115 25 C122 27 125 33 125 38 L121 44 L121 40 C114 36 104 38 98 44 L96 56 L92 54Z', SH.metal, 1.6);
    s += ln('M96 34 Q108 26 120 32', SH.trim, 1.4, 0.7);
  } else {
    s += sh('M91 46 C90 28 104 20 116 24 C124 27 126 36 125 44 L121 46 L121 40 C114 36 104 38 98 44 L97 62 L92 62Z', SH.metal, 1.6);
    s += sh('M99 48 L110 52 L112 70 L103 66Z', SH.metal, 1.4);
    s += ln('M96 32 Q108 24 120 30', '#fff1d8', 1.4, 0.35);
    if (SH.helm === 'full') {
      s += sh('M108 38 L125 40 L124 62 L110 66Z', SH.metal, 1.5);
      [112, 116, 120].forEach(x => { s += ln(`M${x} 42 L${x + 1} 64`, INK, 1.1, 0.8); });
      s += ln('M110 48 L125 49 M110 55 L124 56', INK, 1, 0.5);
      s += sh('M100 24 C96 10 116 8 126 22 C118 20 108 20 104 27Z', SH.crest, 1.5);
    } else if (SH.helm === 'crest') {
      s += sh('M100 24 C94 2 126 0 134 20 C122 14 110 18 106 27Z', SH.crest, 1.5) + ln('M104 20 Q116 10 128 18', INK, 1, 0.5);
      if (pc.h === 7) s += ln('M110 24 L110 14', '#fff3bb', 1.4, 0.8);
    }
  }
  if (o.laurel) { for (let i = 0; i < 8; i++) { const t = i / 7, x = 92 + t * 32, y = 36 - Math.sin(t * Math.PI) * 8 + t * 2; s += `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.4" transform="rotate(${-40 + t * 80} ${x} ${y})" fill="#7ea03c" stroke="${INK}" stroke-width="1"/>`; } }
  s += `</g>`;
  /* bouclier */
  if (SS) {
    s += `<g class="shieldArm">${limb([[100, 94], [114, 122], [124, 122]], [12, 10], skin)}</g><g class="shield">`;
    if (SS.shield === 'large') s += sh('M118 90 C128 86 142 88 148 94 L148 156 C142 162 128 162 118 158Z', SS.trim, 1.8) + ln('M133 90 L133 160', SS.rim, 2.4, 0.95) + `<circle cx="133" cy="124" r="6.5" fill="${SS.rim}" stroke="${INK}" stroke-width="1.5"/>` + ln('M121 96 L145 96 M121 154 L145 154', SS.rim, 1.6, 0.85);
    else if (SS.shield === 'rect') s += sh('M122 104 L146 104 L146 142 L122 142Z', SS.metal, 1.8) + ln('M122 104 L146 104 L146 142 L122 142Z', SS.trim, 2.4, 0.9) + `<circle cx="134" cy="123" r="5" fill="${SS.trim}" stroke="${INK}" stroke-width="1.4"/>`;
    else if (SS.shield === 'net') { s += sh('M118 98 C130 92 144 98 146 112 C140 132 128 146 118 150Z', 'rgba(167,179,156,.18)', 1.4); for (let i = 0; i < 5; i++) s += ln(`M${120 + i * 5} ${98 + i * 2} L${130 + i * 3} ${150 - i * 2}`, SS.rim, 1.1, 0.8); for (let j = 0; j < 4; j++) s += ln(`M119 ${104 + j * 12} Q132 ${100 + j * 12} 146 ${110 + j * 8}`, SS.rim, 1.1, 0.8); }
    else s += `<ellipse cx="133" cy="124" rx="13" ry="25" fill="${WOOD}" stroke="${INK}" stroke-width="1.8"/><ellipse cx="133" cy="124" rx="9" ry="19" fill="none" stroke="${SS.rim}" stroke-width="1.4" opacity=".7"/><circle cx="133" cy="124" r="5" fill="${SS.rim}" stroke="${INK}" stroke-width="1.4"/>`;
    s += `</g>`;
  }
  /* bras armé */
  s += `<g class="arm">${limb([[106, 92], [124, 116], [142, 98]], [13, 11], skin)}`;
  if (SB && SB.chest === 'leather') s += limb([[128, 112], [137, 103]], [13], SB.metal);
  else if (SB) s += limb([[116, 106], [128, 112], [138, 102]], [13, 13], SB.metal).replace(/stroke-linecap="round"/g, 'stroke-linecap="butt"');
  if (SB && SB.pauld === 1 && pc.b >= 3) s += sh('M97 84 C106 78 124 84 127 96 C116 94 106 94 100 100Z', SB.metal, 1.6);
  if (SB && SB.pauld === 2) s += sh('M92 84 C98 70 124 72 132 90 C130 100 124 102 120 100 C112 94 100 94 94 98Z', SB.metal, 1.6) + ln('M100 80 Q114 76 126 86', '#e9efe4', 1.3, 0.4) + ln('M100 90 L124 94', INK, 1, 0.5);
  s += `<circle cx="142" cy="98" r="6.2" fill="${skin}" stroke="${INK}" stroke-width="1.5"/>`;
  if (rank === 0) s += `<circle cx="141" cy="104" r="7.5" fill="none" stroke="#9aa0a6" stroke-width="3"/><path d="M141 112 Q148 134 136 154" fill="none" stroke="#9aa0a6" stroke-width="2.2" stroke-dasharray="3 2"/>`;
  s += weaponG(wp) + `</g>`;
  if (rank === 0) s += `<circle cx="126" cy="258" r="8" fill="none" stroke="#9aa0a6" stroke-width="3"/><path d="M126 266 Q134 276 150 276" fill="none" stroke="#9aa0a6" stroke-width="2.2" stroke-dasharray="3 2"/>`;
  s += `</g>`;
  const vb = o.crop || '-12 -22 252 312';
  return `<svg class="fig ${o.cls || ''}" viewBox="${vb}" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${s}</svg>`;
}
const head = o => figure(Object.assign({}, o, { crop: '82 14 62 66', cls: 'headonly' }));

/* ---------- icônes ---------- */
function weaponIcon(i) {
  return `<svg viewBox="108 56 116 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${weaponG(i)}</svg>`;
}
function pieceIcon(slot, sty) {
  const pc = {}; pc[slot] = sty;
  const crop = { h: '84 16 56 56', c: '82 80 48 76', b: '92 70 64 50', l: '60 172 100 108', s: '112 80 46 90' }[slot];
  return figure({ gender: 'h', skin: 1, hair: 2, hairc: 0, rank: 1, pc, weapon: -1, cls: 'icon', crop });
}
function armorIcon(i) {
  return figure({ gender: 'h', skin: 1, hair: 2, hairc: 0, rank: 1, armor: i, weapon: -1, cls: 'icon', crop: '60 10 110 175' });
}
const MV = {
  strike: '<path d="M6 26 L24 8 M20 6 L26 12 M6 26 L4 28" /><path d="M24 8 L28 4"/>',
  heavy: '<path d="M5 27 L22 10 M18 4 L26 12 M10 8 L28 26 M24 28 L28 24"/>',
  guard: '<path d="M16 4 L27 8 L27 17 C27 23 22 27 16 29 C10 27 5 23 5 17 L5 8Z"/><path d="M16 10 V25"/>',
  flair: '<path d="M16 3 L19 12 L28 12 L21 18 L24 27 L16 22 L8 27 L11 18 L4 12 L13 12Z"/>'
};
const mvIcon = k => `<svg viewBox="0 0 32 32" class="mvi" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MV[k]}</svg>`;
const NAVI = {
  ludus: '<path d="M4 28 V13 L16 5 L28 13 V28 M12 28 V19 H20 V28"/>',
  arene: '<path d="M3 26 H29 M5 26 V14 C5 9 9 6 16 6 C23 6 27 9 27 14 V26 M11 26 V16 C11 13 13 11 16 11 C19 11 21 13 21 16 V26"/>',
  rang: '<path d="M6 28 V15 M13 28 V7 M20 28 V12 M27 28 V19"/>',
  boutique: '<path d="M7 11 H25 L24 28 H8Z M12 11 C12 7 14 5 16 5 C18 5 20 7 20 11"/>',
  hero: '<circle cx="16" cy="10" r="5"/><path d="M5 28 C6 20 10 17 16 17 C22 17 26 20 27 28"/>'
};
const navIcon = k => `<svg viewBox="0 0 32 32" class="ni" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NAVI[k]}</svg>`;
const coin = `<svg viewBox="0 0 20 20" class="coin" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="${GOLD}" stroke="${INK}" stroke-width="1.5"/><circle cx="10" cy="10" r="5.2" fill="none" stroke="${INK}" stroke-width="1" opacity=".55"/><path d="M10 6.5 V13.5" stroke="${INK}" stroke-width="1.3" opacity=".6"/></svg>`;
const sound = on => `<svg viewBox="0 0 24 24" class="ni" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9 H8 L13 5 V19 L8 15 H4Z"/>${on ? '<path d="M16 9 C18 11 18 13 16 15 M19 6 C23 10 23 14 19 18"/>' : '<path d="M17 9 L23 15 M23 9 L17 15"/>'}</svg>`;

/* ---------- ornements ---------- */
const MEANDER = (h, col) => `<svg class="mean" width="100%" height="${h}" aria-hidden="true"><defs><pattern id="mp${h}" width="${h * 1.6}" height="${h}" patternUnits="userSpaceOnUse"><path d="M0 ${h - 1} V1 H${h * 1.4} V${h * 0.7} H${h * 0.35} V${h * 0.35} H${h} " fill="none" stroke="${col || 'currentColor'}" stroke-width="${Math.max(1.2, h / 7)}" stroke-linejoin="miter"/></pattern></defs><rect width="100%" height="${h}" fill="url(#mp${h})"/></svg>`;

/* ---------- foule ---------- */
function crowd() {
  let s = '';
  const tiers = [{ y: 38, n: 36, r: 4.2 }, { y: 70, n: 30, r: 5 }, { y: 112, n: 22, r: 6 }];
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  tiers.forEach((t, ti) => {
    for (let i = 0; i < t.n; i++) {
      const x = 8 + i * (384 / (t.n - 1)) + (rnd() - 0.5) * 4, y = t.y + (rnd() - 0.5) * 3, col = [IVORY, '#c4622d', '#9c4a22', '#e0925a'][Math.floor(rnd() * 4)], d = (rnd() * 1.4).toFixed(2);
      s += `<g class="p" style="--d:${d}s;--a:${(ti + 1) * 0.8}">`;
      s += `<path d="M${x - t.r * 1.5} ${y + t.r * 2.6} Q${x} ${y + t.r * 0.6} ${x + t.r * 1.5} ${y + t.r * 2.6}Z" fill="#241710"/><circle cx="${x}" cy="${y}" r="${t.r}" fill="${col}" stroke="${INK}" stroke-width="1"/>`;
      s += `<path class="raise" d="M${x - t.r * 1.3} ${y + t.r * 1.8} L${x - t.r * 2} ${y - t.r * 1.4} M${x + t.r * 1.3} ${y + t.r * 1.8} L${x + t.r * 2} ${y - t.r * 1.4}" stroke="${col}" stroke-width="1.8" stroke-linecap="round"/></g>`;
    }
  });
  return s;
}
function torch(x) {
  return `<g transform="translate(${x} 160)"><rect x="-3" y="14" width="6" height="40" fill="#3a2518" stroke="${INK}"/><path d="M-8 14 H8 L5 24 H-5Z" fill="${BRONZE}" stroke="${INK}"/><circle class="halo" cx="0" cy="0" r="46" fill="url(#torchGlow)"/><g class="flame"><path d="M0 -26 C10 -12 12 0 6 12 C2 16 -2 16 -6 12 C-12 0 -8 -12 0 -26Z" fill="#e06a1c"/><path d="M0 -14 C6 -6 6 2 3 9 C1 11 -1 11 -3 9 C-6 2 -5 -6 0 -14Z" fill="#ffd36a"/></g></g>`;
}
function arenaWall() {
  let arches = '';
  for (let i = 0; i < 8; i++) { const x = 20 + i * 45; arches += `<path d="M${x} 188 V148 C${x} 128 ${x + 36} 128 ${x + 36} 148 V188Z" fill="#0b0605" stroke="${INK}" stroke-width="2"/>`; }
  let bricks = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) bricks += `<rect x="${c * 46 - (r % 2) * 23}" y="${196 + r * 26}" width="46" height="26" fill="none" stroke="#120a07" stroke-width="2"/>`;
  return `<svg class="wall" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <rect width="400" height="300" fill="url(#arenaSky)"/>
  <circle cx="320" cy="34" r="22" fill="#f3d9a8" opacity=".08"/>
  <g class="crowd">${crowd()}</g>
  <rect y="124" width="400" height="72" fill="#2b1a11"/>${arches}
  <rect y="124" width="400" height="6" fill="#4a2c1c"/><rect y="188" width="400" height="10" fill="#4a2c1c"/>
  <rect y="196" width="400" height="104" fill="#241710"/>${bricks}
  <rect y="196" width="400" height="4" fill="${BRONZE}" opacity=".55"/>
  ${torch(52)}${torch(348)}
  </svg>`;
}

/* ---------- cour du ludus ---------- */
function yardWall(o) {
  const bed = o.bed || 0, hearth = o.hearth || 0, stash = o.stash || 0;
  let bricks = '';
  for (let r = 0; r < 9; r++) for (let c = 0; c < 10; c++) bricks += `<rect x="${c * 44 - (r % 2) * 22}" y="${r * 24 + 84}" width="44" height="24" fill="none" stroke="#120a07" stroke-width="2"/>`;
  let flames = '';
  if (hearth >= 1) flames = `<g class="flame f${hearth}" transform="translate(324 230)"><path d="M0 -${14 + hearth * 10} C${8 + hearth * 2} -${6 + hearth * 4} ${10 + hearth * 2} 0 5 8 L-5 8 C-10 0 -8 -${6 + hearth * 4} 0 -${14 + hearth * 10}Z" fill="#e06a1c"/><path d="M0 -${8 + hearth * 5} C5 -2 5 3 2 8 L-2 8 C-5 3 -5 -2 0 -${8 + hearth * 5}Z" fill="#ffd36a"/></g><circle class="halo" cx="324" cy="228" r="${40 + hearth * 18}" fill="url(#torchGlow)"/>`;
  const bedArt = `<g transform="translate(34 214)">
    <path d="M0 0 H96 V70 H0Z" fill="#0b0605" stroke="${INK}" stroke-width="2"/>
    ${bed === 0 ? `<path d="M10 66 L18 44 L24 66 L34 40 L42 66 L54 46 L62 66 L74 42 L80 66Z" fill="#a98238" stroke="${INK}"/>` : ''}
    ${bed >= 1 ? `<rect x="8" y="50" width="80" height="14" fill="${WOOD}" stroke="${INK}" stroke-width="1.5"/><path d="M12 50 L20 40 L30 50 L42 38 L54 50 L66 40 L84 50Z" fill="#b99440" stroke="${INK}"/>` : ''}
    ${bed >= 2 ? `<rect x="14" y="40" width="68" height="12" rx="3" fill="${BLOOD}" stroke="${INK}" stroke-width="1.5"/>` : ''}
    ${bed >= 3 ? `<ellipse cx="22" cy="38" rx="12" ry="6" fill="${IVORY}" stroke="${INK}" stroke-width="1.5"/><path d="M50 40 Q66 30 82 40 L82 50 L50 50Z" fill="#6a4a30" stroke="${INK}"/>` : ''}
    <path d="M-6 74 H102" stroke="${INK}" stroke-width="3"/></g>`;
  const brazier = `<g transform="translate(324 240)"><path d="M-22 -2 H22 L16 18 H-16Z" fill="${BRONZE}" stroke="${INK}" stroke-width="2"/><rect x="-3" y="18" width="6" height="26" fill="#3a2518" stroke="${INK}"/><path d="M-14 44 H14" stroke="${INK}" stroke-width="3"/></g>`;
  const stashArt = stash === 0 ? '' : `<g transform="translate(212 296)"><path d="M-22 0 H22 L16 12 H-16Z" fill="#2d1c12" stroke="${INK}" stroke-width="1.6"/>${stash >= 2 ? `<circle class="glint" cx="-6" cy="2" r="3" fill="${GOLD}"/><circle class="glint g2" cx="6" cy="3" r="2.4" fill="${GOLD}"/>` : ''}${stash >= 3 ? `<rect x="-14" y="-16" width="28" height="16" rx="3" fill="${WOOD}" stroke="${INK}" stroke-width="1.6"/><rect x="-14" y="-16" width="28" height="5" fill="${GOLD}" opacity=".75"/>` : ''}</g>`;
  const rack = `<g transform="translate(158 140)"><rect x="-4" y="0" width="108" height="8" fill="${WOOD}" stroke="${INK}" stroke-width="1.6"/><rect x="0" y="0" width="6" height="86" fill="${WOOD}" stroke="${INK}" stroke-width="1.6"/><rect x="96" y="0" width="6" height="86" fill="${WOOD}" stroke="${INK}" stroke-width="1.6"/><rect x="-4" y="44" width="108" height="6" fill="${WOOD}" stroke="${INK}" stroke-width="1.6"/>
    <g transform="translate(22 4) scale(.55) rotate(70 150 70)">${weaponG(Math.min(5, o.weapon || 0))}</g></g>`;
  const post = `<g transform="translate(378 240)"><rect x="-6" y="-70" width="12" height="130" fill="${WOOD}" stroke="${INK}" stroke-width="1.8"/><rect x="-22" y="-52" width="44" height="10" rx="3" fill="${WOOD}" stroke="${INK}" stroke-width="1.8"/><path d="M-12 -70 Q0 -88 12 -70Z" fill="#b99440" stroke="${INK}" stroke-width="1.5"/></g>`;
  return `<svg class="wall" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <rect width="400" height="300" fill="url(#yardSky)"/>
  <circle cx="300" cy="46" r="26" fill="#f3e2bd" opacity=".9"/><circle cx="300" cy="46" r="40" fill="#f3e2bd" opacity=".08"/>
  <g fill="#f3e2bd" opacity=".7"><circle cx="40" cy="30" r="1.2"/><circle cx="96" cy="58" r="1"/><circle cx="170" cy="22" r="1.4"/><circle cx="224" cy="52" r="1"/><circle cx="372" cy="24" r="1.2"/><circle cx="130" cy="14" r="1"/></g>
  <rect y="84" width="400" height="216" fill="#2a1a12"/>${bricks}
  <rect y="80" width="400" height="8" fill="#4a2c1c"/>
  <path d="M276 84 V40 C276 22 340 22 340 40 V84Z" fill="#0b0605" opacity=".0"/>
  ${bedArt}${rack}${brazier}${flames}${stashArt}${post}
  </svg>`;
}

function pyramid(rank, freed, names) {
  const N = names.length, H = 27, top = 38, W = names.map((_, i) => Math.round(280 - i * (190 / (N - 1))));
  let o = `<svg class="pyr" viewBox="0 0 320 ${top + N * H + 8}" role="img" aria-label="Pyramide des rangs">`;
  o += `<path d="M160 36 V8" stroke="${freed ? GOLD : '#5a4030'}" stroke-width="5" stroke-linecap="round"/><path d="M148 8 H172" stroke="${freed ? GOLD : '#5a4030'}" stroke-width="4" stroke-linecap="round"/>`;
  for (let r = 0; r < N; r++) {
    const y = top + (N - 1 - r) * H, w = W[r], st = freed || r < rank ? 'done' : r === rank ? 'cur' : 'todo';
    o += `<rect class="${st}" x="${(320 - w) / 2}" y="${y}" width="${w}" height="${H - 3}" rx="2"/><text x="160" y="${y + 18}">${names[r]}</text>`;
  }
  return o + '</svg>';
}

const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="arenaSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0605"/><stop offset=".55" stop-color="#2a0f08"/><stop offset="1" stop-color="#4a1a0a"/></linearGradient>
  <linearGradient id="yardSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07080e"/><stop offset=".6" stop-color="#181018"/><stop offset="1" stop-color="#2b1710"/></linearGradient>
  <radialGradient id="torchGlow"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".55"/><stop offset="1" stop-color="#ff7a1c" stop-opacity="0"/></radialGradient>
  <radialGradient id="vol" cx=".34" cy=".26" r=".85"><stop offset="0" stop-color="#fff6e6" stop-opacity=".34"/><stop offset=".4" stop-color="#fff6e6" stop-opacity="0"/><stop offset=".7" stop-color="#140703" stop-opacity=".1"/><stop offset="1" stop-color="#140703" stop-opacity=".5"/></radialGradient>
  <radialGradient id="gshadow"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset=".6" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <filter id="glow"x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs></svg>`;

return { SKINS, HAIRC, STY, pieceIcon, figure, head, weaponIcon, armorIcon, mvIcon, navIcon, coin, sound, MEANDER, arenaWall, yardWall, pyramid, DEFS };
})();

