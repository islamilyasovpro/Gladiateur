const G = (() => {
'use strict';
const H = 3600000;
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const TUNE = { ak: 8, ab: 0.7, rk: 1.8, lv: 0.3, tr: 10, rv: 0, rq: 0.14, rm: 1.1, rw: 1.0 };
const vt = t => Math.min(5, Math.round(t * 5 / 10)); /* palier visuel 0..5 pour l’art */

const RANKS = [
  { m: 'Esclave', f: 'Esclave', need: 80 },
  { m: 'Recrue', f: 'Recrue', need: 380 },
  { m: 'Gladiateur', f: 'Gladiatrice', need: 950 },
  { m: 'Vétéran', f: 'Vétérane', need: 1650 },
  { m: 'Quartus Palus', f: 'Quartus Palus', need: 2450 },
  { m: 'Tertius Palus', f: 'Tertius Palus', need: 3400 },
  { m: 'Secundus Palus', f: 'Secundus Palus', need: 4500 },
  { m: 'Champion', f: 'Championne', need: 5800 },
  { m: 'Héros de la plèbe', f: 'Héroïne de la plèbe', need: 7300 },
  { m: 'Légende vivante', f: 'Légende vivante', need: 9100 },
  { m: 'Primus Palus', f: 'Primus Palus', need: 11100 }
];
const LAST = RANKS.length - 1;
const floorOf = r => r > 0 ? RANKS[r - 1].need : 0;
const duelCote = r => 850 + 85 * r;
const rankName = (s, r) => RANKS[r === undefined ? s.rank : r][s.gender === 'f' ? 'f' : 'm'];

const WEAPONS = [
  { id: 0, n: 'Bâton d’entraînement', d: 2, p: 0, r: 0 },
  { id: 1, n: 'Gladius rouillé', d: 4, p: 30, r: 0 },
  { id: 2, n: 'Gladius de fer', d: 5, p: 90, r: 1 },
  { id: 3, n: 'Épée de légionnaire', d: 7, p: 190, r: 2 },
  { id: 4, n: 'Trident de rétiaire', d: 9, p: 330, r: 3 },
  { id: 5, n: 'Spatha d’acier', d: 10, p: 520, r: 4 },
  { id: 6, n: 'Lame de Damas', d: 12, p: 780, r: 5, fx: [{ id: 'saign', v: 2 }] },
  { id: 7, n: 'Glaive du champion', d: 14, p: 1100, r: 6, fx: [{ id: 'saign', v: 2 }, { id: 'crit', v: 6 }] },
  { id: 8, n: 'Épée du sénateur', d: 16, p: 1500, r: 7, fx: [{ id: 'saign', v: 3 }, { id: 'crit', v: 8 }] },
  { id: 9, n: 'Lame de l’empereur', d: 18, p: 2000, r: 8, fx: [{ id: 'saign', v: 3 }, { id: 'vamp', v: 1 }] },
  { id: 10, n: 'Lame du Primus', d: 20, p: 2700, r: 9, fx: [{ id: 'saign', v: 4 }, { id: 'vamp', v: 2 }] }
];
const WT = {
  gladius: { n: 'Gladius', e: 'Équilibré. Aucun bonus, aucun malus.', m: '', dm: 1, mt: 1 },
  sica: { n: 'Sica', e: '+10 % de coups critiques.', m: 'Dégâts de base −8 %.', dm: 0.92, crit: 0.1, mt: 2 },
  trident: { n: 'Trident', e: 'Saignement : +2 dégâts bruts à chaque touche.', m: 'Dégâts de base −8 %.', dm: 0.92, bleed: 2, mt: 3 },
  hache: { n: 'Hache', e: 'Ignore 60 % de l’armure adverse et +6 % de dégâts de base.', m: '−4 % de chances de toucher.', dm: 1.06, pierce: 0.6, hit: -0.04, mt: 4 },
  masse: { n: 'Masse', e: 'Ton coup puissant étourdit l’adversaire 50 % du temps. Dégâts de base +4 %.', m: '−3 % de chances de toucher.', dm: 1.04, stun: 0.5, hit: -0.03, mt: 5 },
  spatha: { n: 'Spatha', e: 'Dégâts de base +12 %.', m: 'Coups puissants −5 % de précision.', dm: 1.12, hitHeavy: -0.05, mt: 5 }
};
const WT_IDS = Object.keys(WT);
const TIER_ADJ = ['d’entraînement', 'de rebut', 'de fer', 'de légionnaire', 'de bronze', 'd’acier', 'de Damas', 'du champion', 'du sénateur', 'de l’empereur', 'du Primus'];
const wtAvail = tier => WT_IDS.filter(k => tier >= WT[k].mt);
function weaponVariant(tier, wt) {
  const W = WEAPONS[tier], T = WT[wt]; if (!W || !T) return null;
  return { tier, wt, n: T.n + ' ' + TIER_ADJ[tier], d: Math.max(1, Math.round(W.d * T.dm)), p: W.p, r: W.r, fx: W.fx || [] };
}
const ARMORS = [
  { id: 0, n: 'Tunique de toile', a: 0, p: 0, r: 0 },
  { id: 1, n: 'Manica de cuir', a: 1, p: 40, r: 0 },
  { id: 2, n: 'Casque de bronze', a: 2, p: 110, r: 1 },
  { id: 3, n: 'Brassards et jambières', a: 3, p: 240, r: 2 },
  { id: 4, n: 'Cuirasse segmentée', a: 4, p: 400, r: 3 },
  { id: 5, n: 'Cuirasse renforcée', a: 5, p: 620, r: 4 },
  { id: 6, n: 'Armure d’apparat', a: 6, p: 900, r: 5, fx: [{ id: 'ecu', v: 1 }] },
  { id: 7, n: 'Armure du légat', a: 7, p: 1250, r: 6, fx: [{ id: 'ecu', v: 1 }] },
  { id: 8, n: 'Cuirasse d’écailles', a: 8, p: 1700, r: 7, fx: [{ id: 'ecu', v: 1 }, { id: 'esq', v: 5 }] },
  { id: 9, n: 'Panoplie d’argent', a: 9, p: 2300, r: 8, fx: [{ id: 'ecu', v: 1 }, { id: 'riposte', v: 4 }] },
  { id: 10, n: 'Panoplie dorée', a: 11, p: 3000, r: 9, fx: [{ id: 'ecu', v: 2 }, { id: 'riposte', v: 5 }, { id: 'esq', v: 5 }] }
];
const PERKS = [
  /* brute */
  { id: 'poing', fam: 'brute', max: 2, n: 'Poing de fer', d: '+3 Force.', fx: { str: 3 } },
  { id: 'bourreau', fam: 'brute', max: 2, n: 'Bourreau', d: '+10 % de dégâts.', fx: { dmg: 0.1 } },
  { id: 'lourd', fam: 'brute', max: 1, n: 'Frappe lourde', d: '+30 % de dégâts sur les coups puissants.', fx: { heavy: 0.3 } },
  { id: 'rage', fam: 'brute', max: 1, n: 'Rage de l’arène', d: '+30 % de dégâts quand ta vie passe sous la moitié.', fx: { low: 0.3 } },
  { id: 'oeil', fam: 'brute', max: 2, n: 'Œil du lanista', d: '+12 % de chances de coup critique.', fx: { crit: 0.12 } },
  { id: 'grace', fam: 'brute', max: 1, n: 'Coup de grâce', d: 'Tes coups critiques font 40 % de dégâts en plus.', fx: { critDmg: 0.4 } },
  { id: 'sang', fam: 'brute', max: 1, n: 'Premier sang', d: 'Ta première touche inflige +6 dégâts et tu frappes en premier.', fx: { sang: 1 } },
  { id: 'poison', fam: 'brute', max: 2, n: 'Lame empoisonnée', d: '+2 dégâts bruts à chaque touche (ignore l’armure).', fx: { bleed: 2 } },
  { id: 'tranchant', fam: 'brute', max: 2, n: 'Lame affûtée', d: '+2 dégâts d’arme.', fx: { w: 2 } },
  { id: 'soif', fam: 'brute', max: 2, n: 'Soif de sang', d: 'Tu récupères 1 de vie à chaque touche.', fx: { vamp: 1 } },
  /* défense */
  { id: 'cuir', fam: 'defense', max: 2, n: 'Cuir tanné', d: '+3 Endurance.', fx: { end: 3 } },
  { id: 'souffle', fam: 'defense', max: 3, n: 'Souffle de bête', d: '+14 de vie maximale.', fx: { hp: 14 } },
  { id: 'sable', fam: 'defense', max: 1, n: 'Garde de sable', d: '−2 dégâts reçus à chaque coup.', fx: { ecu: 2 } },
  { id: 'pierre', fam: 'defense', max: 2, n: 'Peau de pierre', d: '−8 % de dégâts reçus.', fx: { dr: 0.08 } },
  { id: 'tenace', fam: 'defense', max: 1, n: 'Ténacité', d: 'Une fois par combat, tu survis à un coup mortel avec 1 de vie.', fx: { tenace: 1 } },
  { id: 'bouclier', fam: 'defense', max: 1, n: 'Bouclier vivant', d: 'Se couvrir te rend 1 point d’action de plus.', fx: { guardPa: 1 } },
  { id: 'riposte', fam: 'defense', max: 2, n: 'Riposte instinctive', d: 'Quand tu te couvres face à un coup, l’ennemi subit 4 dégâts.', fx: { riposte: 4 } },
  { id: 'second', fam: 'defense', max: 2, n: 'Second souffle', d: '+2 de vie à la fin de chaque tour.', fx: { regen: 2 } },
  { id: 'felin', fam: 'defense', max: 2, n: 'Esquive féline', d: 'L’ennemi a 6 % de chances de toucher en moins.', fx: { esq: 0.06 } },
  /* vivacité */
  { id: 'pied', fam: 'vif', max: 2, n: 'Pied léger', d: '+3 Agilité.', fx: { agi: 3 } },
  { id: 'eclair', fam: 'vif', max: 1, n: 'Vif comme l’éclair', d: 'Tu frappes toujours en premier.', fx: { first: 1 } },
  { id: 'precis', fam: 'vif', max: 2, n: 'Précision', d: '+8 % de chances de toucher.', fx: { hit: 0.08 } },
  { id: 'longs', fam: 'vif', max: 2, n: 'Souffle long', d: '+1 point d’action au départ du combat.', fx: { pa: 1 } },
  { id: 'complet', fam: 'vif', max: 1, n: 'Gladiateur complet', d: '+1 à toutes les caractéristiques.', fx: { all: 1 } },
  /* foule */
  { id: 'cri', fam: 'foule', max: 1, n: 'Cri de guerre', d: 'La foule t’acclame dès l’entrée : +8 de faveur au départ.', fx: { favS: 8 } },
  { id: 'favori', fam: 'foule', max: 1, n: 'Favori de la foule', d: '+50 % de faveur gagnée pendant le combat.', fx: { favMul: 0.5 } },
  { id: 'idole', fam: 'foule', max: 1, n: 'Idole du peuple', d: 'L’ovation après une victoire te rend 50 % de vie en plus.', fx: { ov: 0.5 } },
  { id: 'showman', fam: 'foule', max: 1, n: 'Showman', d: 'Tes coups critiques donnent +6 de faveur.', fx: { critFav: 6 } },
  { id: 'panache', fam: 'foule', max: 1, n: 'Panache éclatant', d: 'Le Panache donne +10 de faveur en plus.', fx: { flairFav: 10 } },
  /* fortune */
  { id: 'fortuna', fam: 'fortune', max: 1, n: 'Faveur de Fortuna', d: '+30 % de sesterces gagnés.', fx: { gold: 0.3 } },
  { id: 'marchand', fam: 'fortune', max: 1, n: 'Sens du marchandage', d: 'Tout est 10 % moins cher à la boutique.', fx: { shop: 0.1 } },
  { id: 'fouineur', fam: 'fortune', max: 1, n: 'Œil de fouineur', d: 'Ce que tu trouves en fouillant vaut 50 % de plus.', fx: { search: 0.5 } },
  { id: 'calleux', fam: 'fortune', max: 1, n: 'Mains calleuses', d: 'Le travail rapporte 40 % de plus.', fx: { work: 0.4 } },
  { id: 'chanceux', fam: 'fortune', max: 2, n: 'Chanceux', d: '+10 % de chances de butin après un combat.', fx: { lootCh: 0.1 } },
  { id: 'collection', fam: 'fortune', max: 1, n: 'Collectionneur', d: 'Tes butins sont plus souvent rares.', fx: { lootBonus: 5 } },
  /* croissance */
  { id: 'vif', fam: 'croissance', max: 2, n: 'Esprit vif', d: '+15 % d’expérience.', fx: { xp: 0.15 } },
  { id: 'ambitieux', fam: 'croissance', max: 1, n: 'Ambitieux', d: '+15 % de gloire.', fx: { glo: 0.15 } },
  { id: 'recup', fam: 'croissance', max: 1, n: 'Récupération', d: 'Ta vie revient 30 % plus vite.', fx: { regen2: 0.3 } },
  { id: 'endurci', fam: 'croissance', max: 1, n: 'Endurci', d: 'Les entraînements durent 15 % de moins.', fx: { train: -0.15 } },
  { id: 'amimed', fam: 'croissance', max: 1, n: 'Médecin ami', d: 'Les soins coûtent 40 % de moins.', fx: { healDisc: 0.4 } }
];
const PERK_BY = {}; PERKS.forEach(p => { PERK_BY[p.id] = p; });
const pmod = s => { const o = {}; s.perks.forEach(id => { const p = PERK_BY[id]; if (p) for (const k in p.fx) o[k] = (o[k] || 0) + p.fx[k]; }); return o; };
const ORIGINS = [
  { id: 'capt', n: 'Captif de guerre', stat: 'str', b: '+2 Force', t: 'Ta tribu a perdu sa dernière bataille. Tu t’es battu jusqu’à tomber, et c’est pour cette raison qu’on t’a gardé en vie.' },
  { id: 'debt', n: 'Débiteur ruiné', stat: 'agi', b: '+2 Agilité, +15 % de sesterces', t: 'Une dette que tu ne pouvais pas payer t’a vendu au ludus. Tu comptes vite et tu te faufiles plus vite encore.' },
  { id: 'mine', n: 'Forçat des carrières', stat: 'end', b: '+2 Endurance', t: 'Des années à tailler la pierre sous le fouet ont durci ton corps. On t’a choisi pour ça.' }
];
const STAT_N = { str: 'Force', agi: 'Agilité', end: 'Endurance' };
const CELL = [
  { id: 'bed', n: 'Paillasse', d: 'Ta vie revient 20 % plus vite par niveau.', max: 3, p: [25, 70, 160] },
  { id: 'hearth', n: 'Foyer et râtelier', d: 'Les entraînements durent 15 % de moins par niveau.', max: 3, p: [40, 100, 220] },
  { id: 'stash', n: 'Cachette sous la dalle', d: '+15 % de sesterces par niveau.', max: 3, p: [30, 80, 180] }
];
const CLANS = [
  { id: 'lions', n: 'Les Lions de Capoue', t: 'Ancienne école, fière et brutale.' },
  { id: 'garde', n: 'La Garde de Pompéi', t: 'Des vétérans qui protègent les leurs.' },
  { id: 'corbeaux', n: 'Les Corbeaux de Ravenne', t: 'Rapides, rusés, jamais là où on les attend.' },
  { id: 'mirm', n: 'Les Mirmillons d’Ostie', t: 'Peu nombreux, très disciplinés.' }
];
const CLAN_BONUS = 1.1;

const RIVALS_M = ['Marcus Varro', 'Lucius Sertor', 'Kaeso Brenn', 'Tigranes'];
const RIVALS_F = ['Valeria Nox', 'Aurelia Fera', 'Drusilla Kor', 'Cassia Ferrea'];
const GM = ['Aulus', 'Brutus', 'Cato', 'Drusus', 'Faustus', 'Gaius', 'Hadrien', 'Ennius', 'Lucan', 'Nero', 'Otho', 'Quintus', 'Rufus', 'Sextus', 'Tarquin', 'Varius'];
const GF = ['Aelia', 'Bella', 'Camilla', 'Delia', 'Flavia', 'Gratia', 'Helena', 'Julia', 'Livia', 'Octavia', 'Petra', 'Sabina', 'Tullia', 'Vibia'];
const EP = ['le Thrace', 'l’Ours', 'la Louve', 'le Borgne', 'le Manchot', 'la Vipère', 'le Taureau', 'l’Aigle', 'le Fer', 'la Cendre', 'le Silencieux', 'le Gaulois', 'la Numide', 'le Cruel'];
const KINDS = ['Mirmillon', 'Thraex', 'Rétiaire', 'Secutor', 'Provocator', 'Hoplomaque'];

const RIVAL_INTRO = [
  'Tu portes encore les chaînes et tu rêves d’arène ? Viens, que je te montre ce qui t’attend.',
  'Recrue… Le ludus a donc les yeux fermés ? Je vais lui rouvrir.',
  'Gladiateur, hein ? Ici, ce nom se mérite chaque matin.',
  'On dit que tu as du mordant. Les mordants, je les use jusqu’à la gencive.',
  'Un rang de plus et tu crois déjà respirer l’air du sommet ? Il est plus rare que tu ne penses.',
  'Tu me suis depuis des mois. Aujourd’hui, tu me dépasses ou tu t’inclines.',
  'La foule scande ton nom. Elle scandait le mien avant. Elle oublie vite.',
  'Le sable se souvient de tout, Champion. Il se souvient de moi aussi.',
  'On chante déjà ton nom dans les tavernes. Moi, je chante une autre chanson.',
  'Plus qu’une marche. Je ne te la céderai pas.',
  'Il ne reste que nous deux au sommet. Un seul sortira libre.'
];
const RIVAL_LOSE = [
  'Pas mal, pour quelqu’un qui traînait des chaînes.',
  'Tu apprends vite. Trop vite.',
  'La foule t’aime. Profites-en, elle oublie tout.',
  'Tu mords bien. Je m’en souviendrai.',
  'Une marche de plus. Je te retrouverai plus haut.',
  'Je croyais te connaître. J’avais tort.',
  'Tu as gagné ce soir. Demain, tout recommence.',
  'Respect. Je le dis rarement.',
  'Ils vont écrire ton nom sur les murs de la ville.',
  'Va. Finis ce que tu as commencé.',
  'Tu as gagné ta liberté. Je la voulais autant que toi.'
];
const RIVAL_NEWS = [
  n => `${n} a gagné devant les gradins pleins. On ne parle que de ça au ludus.`,
  n => `${n} t’a lancé un regard dans la cour. Rien d’aimable.`,
  n => `${n} s’entraîne seul(e) à la nuit tombée. Tu l’as entendu(e) à travers le mur.`,
  n => `Un esclave t’a rapporté ce que ${n} dit de toi. Ce n’est pas flatteur.`
];

const cnt = (s, id) => s.perks.filter(p => p === id).length;
function statsOf(s) { const m = pmod(s), g = gearStat(s); return { force: s.str + g.str + (m.str || 0) + (m.all || 0), agi: s.agi + g.agi + (m.agi || 0) + (m.all || 0), end: s.end + g.end + (m.end || 0) + (m.all || 0) }; }
function maxHp(s) { const st = statsOf(s), m = pmod(s); return Math.round(30 + st.end * 4 + (s.level - 1) * 3 + (m.hp || 0) + (s.school === 'mirmillon' ? 6 : 0)); }
const xpNeed = lv => Math.round(22 + lv * 10 + lv * lv * 0.9);
const trainNeed = v => 3 + Math.floor(v * v / TUNE.tr);

function playerCombatant(s) {
  const st = statsOf(s), gx = gearFx(s), m = pmod(s), wtp = (s.gear && s.gear.w && WT[s.gear.w.wt]) || {};
  return {
    wtHit: wtp.hit || 0, wtHeavy: wtp.hitHeavy || 0, wtPierce: wtp.pierce || 0, wtStun: wtp.stun || 0,
    name: s.name, force: st.force, agi: st.agi, hp: s.hp, maxHp: maxHp(s), w: gearW(s) + (m.w || 0), ar: gearA(s), arm: Math.round(gearA(s) * TUNE.ak * (s.school === 'mirmillon' ? 1.2 : 1)), armMax: Math.round(gearA(s) * TUNE.ak * (s.school === 'mirmillon' ? 1.2 : 1)), school: s.school || null,
    cheer: s.flags && s.flags.met && !s.flags.lost ? (s.flags.saved ? 2 : 1) : 0, cheerName: s.comp ? s.comp.n : '',
    bleed: (m.bleed || 0) + (gx.saign || 0) + (wtp.bleed || 0), vamp: (m.vamp || 0) + (gx.vamp || 0), riposte: (m.riposte || 0) + (gx.riposte || 0),
    ecu: (m.ecu || 0) + (gx.ecu || 0), esq: (m.esq || 0) + (gx.esq || 0) / 100 + (s.school === 'retiaire' ? 0.06 : 0), favS: (m.favS || 0) + (gx.foule || 0),
    crit: 0.06 + (m.crit || 0) + (gx.crit || 0) / 100 + (wtp.crit || 0) + (s.school === 'thrace' ? 0.08 : 0), critDmg: m.critDmg || 0, dmgMul: m.dmg || 0, low: m.low || 0, heavyMul: m.heavy || 0,
    hit: m.hit || 0, dr: Math.min(0.6, m.dr || 0), first: !!m.first, pa: m.pa || 0, guardPa: m.guardPa || 0, regen: m.regen || 0,
    favMul: 1 + (m.favMul || 0), critFav: m.critFav || 0, flairFav: m.flairFav || 0,
    sang: (m.sang || 0) > 0, tenace: (m.tenace || 0) > 0, soft: [0.7, 0.85][s.rank] || 1
  };
}
const hashStr = str => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; };
const TRAITS = [
  { id: 'prudent', n: 'Prudent', d: 'Se couvre souvent et frappe rarement fort.' },
  { id: 'furieux', n: 'Furieux', d: 'Ne se couvre jamais, mais enchaîne les coups puissants.' },
  { id: 'ruse', n: 'Rusé', d: 'Cache ses intentions un tour sur trois.' },
  { id: 'oppo', n: 'Opportuniste', d: 'Frappe fort dès que tu te couvres.' }
];
const TRAIT_BY = {}; TRAITS.forEach(t => { TRAIT_BY[t.id] = t; });
function traitOf(o) {
  if (!o || o.spar) return null;
  if (o.trait === undefined) { const h = hashStr(String(o.id || '') + (o.name || '')) % 10; o.trait = h < 6 ? TRAITS[h % 4].id : null; }
  return o.trait;
}
function oppCombatant(o) {
  const nb = o.nem ? Math.min(2, o.nem.n) : 0;
  const mh = Math.round(30 + o.end * 4 + (o.level - 1) * 3) + nb * 6;
  return { name: o.name, trait: traitOf(o), force: o.str + nb, agi: o.agi + nb, hp: mh, maxHp: mh, w: o.w, ar: o.ar, arm: Math.round(o.ar * TUNE.ak), armMax: Math.round(o.ar * TUNE.ak), crit: 0.06, pots: (o.pots || []).map(id => ({ id, used: false })) };
}

/* ---------- combat au tour par tour ---------- */
const MOVES = {
  strike: { cost: 1, dm: 1, hit: 0 },
  heavy: { cost: 3, dm: 2.2, hit: -0.1 },
  guard: { cost: 0 },
  flair: { cost: 2, dm: 1.2, hit: 0 }
};
const HIT = [
  (a, b, d) => `${a} porte un coup sec à ${b} (−${d}).`,
  (a, b, d) => `${a} entaille ${b} (−${d}).`,
  (a, b, d) => `${a} enfonce la garde de ${b} (−${d}).`,
  (a, b, d) => `${a} frappe ${b} du plat de la lame (−${d}).`
];
const MISS = [
  (a, b) => `${b} esquive le coup de ${a}.`,
  (a, b) => `${a} frappe dans le vide.`,
  (a, b) => `${b} pare de justesse.`
];
function newFight(s, opp, rule, sim) {
  const f = { st: { elans: 0, pots: 0, guards: 0, auto: 0, turns: 0, maxStk: 0 }, rule: rule || opp.cond || null, streak: 0, elan: false, stun: 0, tangle: 0, buffs: { dmg: 0, esq: 0, left: 0 }, ebuffs: { dmg: 0, esq: 0, left: 0 }, pots: (opp.spar || !s.potSlots) ? [] : s.potSlots.map(id => id && (s.pots[id] || 0) > 0 ? { id, used: false } : null), s: sim ? Object.assign({}, s, { pots: Object.assign({}, s.pots) }) : s, P: playerCombatant(s), E: oppCombatant(opp), opp, round: 0, sp: 3, esp: 3, sang: false, tenace: false, c40: false, c75: false, over: false, win: null, intent: 'strike' };
  f.fav = 10 + f.P.favS + (s.bless || 0);
  f.sp = 3 + f.P.pa + (f.P.school === 'retiaire' ? 1 : 0);
  setIntent(f);
  return f;
}
function enemyPot(f) {
  const E = f.E; if (!E.pots || !E.pots.length) return -1;
  if (E.hp < E.maxHp * 0.35) { const i = E.pots.findIndex(p => !p.used && POT_BY[p.id].heal); if (i >= 0 && Math.random() < 0.85) return i; }
  if (f.round === 0) { const i = E.pots.findIndex(p => !p.used && POT_BY[p.id].buff); if (i >= 0 && Math.random() < 0.5) return i; }
  return -1;
}
function setIntent(f) {
  const pi = enemyPot(f);
  if (pi >= 0) { f.intent = 'drink'; f.epi = pi; return; }
  const t = f.E.trait; let pg = 0.2, ph = 0.22;
  if (t === 'prudent') { pg = 0.4; ph = 0.12; }
  else if (t === 'furieux') { pg = 0; ph = 0.42; }
  else if (t === 'oppo') { if (f.pLast === 'guard') { pg = 0.05; ph = 0.65; } else { pg = 0.15; ph = 0.2; } }
  f.hide = t === 'ruse' && Math.random() < 0.35;
  const r = Math.random(); f.intent = r < pg ? 'guard' : (r < pg + ph && f.esp >= 3) ? 'heavy' : 'strike';
}
function fightRound(f, move) {
  if (f.over) return [];
  const potI = /^pot\d$/.test(move) ? +move[3] : -1, pt = potI >= 0 ? f.pots[potI] : null;
  if (potI >= 0 && (!pt || pt.used || !(f.s.pots[pt.id] > 0))) return null;
  const en = SCHOOL_BY[f.P.school] ? Object.assign({ id: f.P.school }, SCHOOL_BY[f.P.school]) : ELAN_NONE;
  if (move === 'elan' && !f.elan) return null;
  const m = potI >= 0 ? { cost: 0 } : move === 'elan' ? { cost: 0, dm: en.dm, hit: en.hit } : MOVES[move];
  if (!m || f.sp < m.cost) return null;
  const P = f.P, E = f.E, ev = [];
  const push = o => ev.push(Object.assign({ pHp: Math.max(0, P.hp), eHp: Math.max(0, E.hp), stk: f.streak, elanOn: f.elan, pArm: P.arm, eArm: E.arm, ePots: (E.pots || []).filter(z => !z.used).length, fav: Math.round(f.fav), sp: f.sp }, o));
  const fm = P.favMul * (f.rule === 'frenzy' ? 2 : f.rule === 'hostile' ? 0.5 : 1);
  const addFav = v => { f.fav = clamp(f.fav + v * fm, 0, 100); };
  f.sp -= m.cost;
  if (move === 'elan') { f.elan = false; f.streak = 0; f.st.elans++; }
  f.st.turns++; if (move === 'guard') f.st.guards++;
  let gainedElan = false;
  const pGuard = move === 'guard', pDrink = potI >= 0, eMove = f.intent, eGuard = eMove === 'guard';
  const eDrink = eMove === 'drink';
  if (eMove === 'heavy') f.esp -= 3; else if (eMove === 'strike') f.esp -= 1;
  if (pDrink) {
    const x = POT_BY[pt.id]; pt.used = true; f.st.pots++; f.s.pots[pt.id]--; if (f.s.pots[pt.id] <= 0) delete f.s.pots[pt.id];
    let msg = `${P.name} vide ${x.n.toLowerCase()}.`, healed = 0;
    if (x.heal) { const h = Math.round(P.maxHp * x.heal), b4 = P.hp; P.hp = Math.min(P.maxHp, P.hp + h); healed = P.hp - b4; msg += ` (+${healed} vie)`; }
    if (x.buff) { f.buffs[x.buff] = x.v; f.buffs.left = x.dur; }
    if (x.pa) f.sp = Math.min(f.rule === 'sand' ? 4 : 6, f.sp + x.pa);
    push({ k: 'potion', side: 'p', t: msg, pot: x.id, heal: healed });
  }
  if (pGuard) push({ k: 'guard', side: 'p', t: `${P.name} se couvre et reprend son souffle.` });
  if (eGuard) push({ k: 'guard', side: 'e', t: `${E.name} se couvre.` });
  const pf = P.agi + rnd(0, 4) + (P.sang && f.round === 0 ? 3 : 0) + (P.first ? 99 : 0), ef = E.agi + rnd(0, 4);
  for (const who of (pf >= ef ? ['p', 'e'] : ['e', 'p'])) {
    if (P.hp <= 0 || E.hp <= 0) break;
    const isP = who === 'p';
    if (isP ? (pGuard || pDrink) : eGuard) continue;
    if (!isP && f.stun > 0) { f.stun--; push({ k: 'stun', side: 'e', t: `${E.name} est sonné et rate son tour.` }); continue; }
    if (!isP && eDrink) {
      const ep = E.pots[f.epi], x = ep && POT_BY[ep.id];
      if (x && !ep.used) {
        ep.used = true; let msg = `${E.name} vide ${x.n.toLowerCase()}.`, healed = 0;
        if (x.heal) { const h = Math.round(E.maxHp * x.heal), b4 = E.hp; E.hp = Math.min(E.maxHp, E.hp + h); healed = E.hp - b4; msg += ` (+${healed} vie)`; }
        if (x.buff) { f.ebuffs[x.buff] = x.v; f.ebuffs.left = x.dur; }
        push({ k: 'potion', side: 'e', t: msg, pot: x.id, heal: healed });
      }
      continue;
    }
    const att = isP ? P : E, def = isP ? E : P;
    const mv = isP ? m : (eMove === 'heavy' ? { dm: 1.8, hit: -0.1 } : { dm: 1, hit: 0 });
    let hit = 0.62 + (att.agi - def.agi) * 0.03 + mv.hit;
    if (isP) hit += P.hit + P.wtHit + (move === 'heavy' ? P.wtHeavy : 0) - f.ebuffs.esq * (f.ebuffs.left > 0 ? 1 : 0);
    if (!isP && move === 'flair') hit += 0.1;
    if (!isP) hit -= P.esq + f.buffs.esq * (f.buffs.left > 0 ? 1 : 0);
    if (!isP && f.tangle > 0) hit -= 0.2;
    if (f.rule === 'dust') hit -= 0.12;
    hit = clamp(hit, 0.2, 0.95);
    if (Math.random() > hit) {
      if (!isP) addFav(1); else { if (move === 'flair') addFav(4); if (move !== 'elan') f.streak = 0; }
      push({ k: 'miss', side: who, t: pick(MISS)(att.name, def.name) });
      continue;
    }
    let d = (att.w + att.force * 0.7 + rnd(0, 3)) * mv.dm;
    const crit = (isP && move === 'elan' && P.school === 'thrace') || Math.random() < att.crit;
    if (crit) d *= 1.6 + (isP ? P.critDmg : 0);
    if (isP) {
      d *= 1 + P.dmgMul + (f.buffs.left > 0 ? f.buffs.dmg : 0);
      if (P.hp < P.maxHp / 2) d *= 1 + P.low;
      if (mv.dm >= 1.8) d *= 1 + P.heavyMul;
      if (P.sang && !f.sang) { d += 6; f.sang = true; }
    }
    if (!isP && f.ebuffs.left > 0) d *= 1 + f.ebuffs.dmg;
    if (!isP && f.tangle > 0) d *= 0.85;
    if (f.rule === 'blood') d *= 1.3;
    d -= (!isP ? P.ecu : 0);
    if (!isP) d *= 1 - P.dr;
    let heroic = false;
    if (isP && eGuard) d *= 0.5;
    if (!isP && pGuard) { d *= eMove === 'heavy' ? 0.35 : 0.5; heroic = eMove === 'heavy'; }
    if (!isP) d *= P.soft || 1;
    d = Math.max(1, Math.round(d));
    const bl = isP && P.bleed ? P.bleed : 0;
    let ab = 0;
    if (def.arm > 0) { ab = Math.min(def.arm, Math.round(d * TUNE.ab)); def.arm -= ab; if (isP && P.wtPierce) ab = Math.round(ab * (1 - P.wtPierce)); }
    d = d - ab + bl;
    def.hp -= d;
    if (isP && P.vamp) P.hp = Math.min(P.maxHp, P.hp + P.vamp);
    let rip = '';
    if (!isP && pGuard && P.riposte && E.hp > 0) { E.hp -= P.riposte; rip = ` Riposte : ${E.name} subit ${P.riposte}.`; }
    let extra = '';
    if (isP && move === 'heavy' && P.wtStun && E.hp > 0 && Math.random() < P.wtStun) { f.stun = 1; extra += ` ${E.name} est sonné par le choc.`; }
    if (!isP && def.hp <= 0 && P.tenace && !f.tenace) { def.hp = 1; f.tenace = true; extra = ` Mais ${P.name} tient debout, à un souffle de la mort.`; }
    let t, k = crit ? 'crit' : 'hit';
    let elanTxt = '';
    if (isP && move === 'elan') {
      if (P.school === 'mirmillon' && E.hp > 0) { f.stun = 1; elanTxt = ` ${E.name} vacille.`; }
      if (P.school === 'retiaire' && E.hp > 0) { f.tangle = 2; elanTxt = ` ${E.name} s’emmêle dans le filet.`; }
    } else if (isP && (move === 'strike' || move === 'heavy' || move === 'flair')) {
      f.streak++; f.st.maxStk = Math.max(f.st.maxStk, f.streak); if (f.streak >= 3 && !f.elan) { f.elan = true; gainedElan = true; }
    }
    if (isP && move === 'elan') { t = `${att.name} lance ${en.elan.toLowerCase()} ! (−${d})${elanTxt}`; }
    else if (isP && move === 'flair') { k = 'flair'; t = `${att.name} fait tournoyer son arme devant la foule, puis frappe (−${d}). Les gradins rugissent.`; }
    else if (heroic) { k = 'flair'; t = `${def.name} pare le coup puissant de ${att.name} et encaisse (−${d}). La foule apprécie.`; }
    else if (crit) t = `${att.name} saisit une ouverture : coup critique ! (−${d})`;
    else if (mv.dm >= 1.8) t = `${att.name} abat un coup puissant sur ${def.name} (−${d}).`;
    else t = pick(HIT)(att.name, def.name, d);
    if (isP) addFav(2 + (crit ? 4 + P.critFav : 0) + (move === 'flair' ? 10 + P.flairFav : 0) + (move === 'heavy' ? 3 : 0));
    if (heroic) addFav(3);
    push({ k, side: who, elan: isP && move === 'elan' ? en.elan : null, t: t + (ab ? ` Armure : −${ab}.` : '') + extra + rip, d, ab, heavy: mv.dm >= 1.8 || (move === 'elan' && isP), mvp: isP ? move : eMove });
    if (gainedElan) push({ k: 'momentum', side: 'p', t: `${P.name} est lancé : ${en.elan} est prête !` });
  }
  f.round++; if (f.tangle > 0) f.tangle--;
  if (f.ebuffs.left > 0) { f.ebuffs.left--; if (f.ebuffs.left === 0) { f.ebuffs.dmg = 0; f.ebuffs.esq = 0; } }
  if (f.buffs.left > 0) { f.buffs.left--; if (f.buffs.left === 0) { f.buffs.dmg = 0; f.buffs.esq = 0; } }
  f.sp = Math.min(f.rule === 'sand' ? 4 : 6, f.sp + (pGuard ? 2 + P.guardPa : 1));
  if (P.regen && P.hp > 0 && E.hp > 0) P.hp = Math.min(P.maxHp, P.hp + P.regen);
  f.esp = Math.min(6, f.esp + 1 + (eGuard ? 1 : 0));
  if (f.rule === 'fire' && P.hp > 0 && E.hp > 0) { P.hp = Math.max(1, P.hp - 2); E.hp -= 2; push({ k: 'fire', t: 'Les flammes lèchent le sable : −2 de vie pour chacun.' }); }
  if (P.cheer && !f.cheer && P.hp > 0 && E.hp > 0 && P.hp < P.maxHp * 0.35) {
    f.cheer = true; f.sp = Math.min(f.rule === 'sand' ? 4 : 6, f.sp + 1 + P.cheer); f.fav = clamp(f.fav + 4 * P.cheer, 0, 100);
    push({ k: 'cheer', t: `${P.cheerName} hurle depuis les gradins : « Relève-toi ! » (+${1 + P.cheer} points d’action)` });
  }
  if (!f.c40 && f.fav >= 40) { f.c40 = true; push({ k: 'crowd', t: 'La foule commence à scander.' }); }
  if (!f.c75 && f.fav >= 75) { f.c75 = true; push({ k: 'crowd', t: 'Le public est debout.' }); }
  if (P.hp <= 0 || E.hp <= 0 || f.round >= 30) {
    f.over = true;
    f.win = P.hp > 0 && (E.hp <= 0 || P.hp / P.maxHp >= E.hp / E.maxHp);
  } else { f.pLast = move; setIntent(f); }
  ev.forEach(e => { e.sp = f.sp; });
  return ev;
}
/* ---------- tactiques : règles de priorité du combat automatique ---------- */
const healIdx = f => { const hs = f.pots.map((p, i) => p && !p.used && POT_BY[p.id].heal && f.s.pots[p.id] > 0 ? [i, POT_BY[p.id].heal] : null).filter(Boolean).sort((a, b) => b[1] - a[1]); return hs.length ? hs[0][0] : -1; };
const TACTICS = [
  { id: 'elan', n: 'Frappe d’élan', d: 'La lance dès qu’elle est prête.', fn: f => f.elan ? 'elan' : null },
  { id: 'heal', n: 'Potion de soin', d: 'Boit une potion de soin quand ta vie passe sous le seuil.', thr: 40, fn: (f, t) => { if (f.P.hp < f.P.maxHp * t / 100 && f.intent !== 'heavy') { const i = healIdx(f); if (i >= 0) return 'pot' + i; } return null; } },
  { id: 'buff', n: 'Potion de départ', d: 'Boit une potion de force ou de vitesse dans les premiers tours.', fn: f => { if (f.round < 2 && f.sp >= 1) { const bi = f.pots.findIndex(p => p && !p.used && POT_BY[p.id].buff && f.s.pots[p.id] > 0); if (bi >= 0) return 'pot' + bi; } return null; } },
  { id: 'counter', n: 'Parer les gros coups', d: 'Se couvre quand l’adversaire prépare un coup puissant.', fn: f => f.intent === 'heavy' ? 'guard' : null },
  { id: 'punish', n: 'Punir la garde', d: 'Panache quand l’adversaire se couvre.', fn: f => f.intent === 'guard' && f.sp >= 2 ? 'flair' : null },
  { id: 'cautious', n: 'Prudence', d: 'Se couvre quand ta vie passe sous le seuil.', thr: 30, fn: (f, t) => f.P.hp < f.P.maxHp * t / 100 ? 'guard' : null },
  { id: 'build', n: 'Économiser les PA', d: 'Se couvre quand il te reste moins de 3 PA, pour frapper fort ensuite.', fn: f => f.sp < 3 ? 'guard' : null },
  { id: 'power', n: 'Coup puissant', d: 'Frappe fort dès que tu as 3 PA.', fn: f => f.sp >= 3 ? 'heavy' : null }
];
const TAC_BY = {}; TACTICS.forEach(t => { TAC_BY[t.id] = t; });
const mkTac = (id, p, t) => ({ id, p: p == null ? 100 : p, t: t == null ? TAC_BY[id].thr : t });
const TAC_DEFAULT = [mkTac('elan'), mkTac('heal'), mkTac('buff'), mkTac('counter'), mkTac('punish'), mkTac('power')];
function tacOf(s) {
  const src = s.tac || TAC_DEFAULT, out = [];
  src.forEach(x => {
    if (typeof x === 'string') x = x === 'heal2' ? mkTac('heal', 100, 60) : mkTac(x);
    if (x && TAC_BY[x.id] && !out.some(y => y.id === x.id)) out.push({ id: x.id, p: Math.min(100, Math.max(10, x.p || 100)), t: TAC_BY[x.id].thr ? Math.min(80, Math.max(10, x.t || TAC_BY[x.id].thr)) : undefined });
  });
  return out;
}
function tacMove(s, id, op) {
  const a = tacOf(s).map(x => Object.assign({}, x)), i = a.findIndex(x => x.id === id);
  if (op === 'on') { if (i < 0) a.push(mkTac(id)); }
  else if (op === 'off') { if (i >= 0) a.splice(i, 1); }
  else if (i >= 0) {
    if (op === 'up' || op === 'down') { const j = i + (op === 'up' ? -1 : 1); if (j >= 0 && j < a.length) { [a[i], a[j]] = [a[j], a[i]]; } }
    else if (op === 'p+') a[i].p = Math.min(100, a[i].p + 10);
    else if (op === 'p-') a[i].p = Math.max(10, a[i].p - 10);
    else if (op === 't+' && a[i].t != null) a[i].t = Math.min(80, a[i].t + 10);
    else if (op === 't-' && a[i].t != null) a[i].t = Math.max(10, a[i].t - 10);
  }
  s.tac = a; return a;
}
function autoChoice(f) {
  if (f.st) f.st.auto++;
  for (const e of tacOf(f.s)) {
    const m = TAC_BY[e.id].fn(f, e.t);
    if (m && (e.p >= 100 || Math.random() * 100 < e.p)) return m;
  }
  return f.sp >= 1 ? 'strike' : 'guard';
}
const fightResult = f => ({ st: f.st, win: f.win, fav: Math.round(f.fav), pHp: Math.max(0, f.P.hp), pMax: f.P.maxHp, eMax: f.E.maxHp, rounds: f.round });
function autoFight(s, opp) { const f = newFight(s, opp, null, true); while (!f.over) fightRound(f, autoChoice(f)); return fightResult(f); }

/* ---------- adversaires, classement, clans ---------- */
function ghostPots(rank, min) {
  const n = Math.max(min || 0, rank < 2 ? 0 : rank < 4 ? (Math.random() < 0.6 ? 1 : 0) : rank < 7 ? ri(1, 2) : ri(2, 3));
  const heal = rank < 3 ? 'hp1' : rank < 6 ? 'hp2' : 'hp3', out = [];
  for (let i = 0; i < n; i++) out.push(i === 0 ? heal : pick([heal, 'rage', 'vif']));
  return out;
}
function genGhost(rank, used) {
  const fem = Math.random() < 0.45;
  let name; do { name = pick(fem ? GF : GM) + ' ' + pick(EP); } while (used.has(name));
  used.add(name);
  const level = Math.max(1, 1 + rank * 3 + ri(-1, 2));
  const base = 3 + rank * TUNE.rk + rank * rank * TUNE.rq + (level - 1) * TUNE.lv + rnd(-1, 1.2) - (rank === 0 ? 0.8 : 0);
  const r = () => Math.max(2, Math.round(base + rnd(-1, 1.2)));
  return {
    id: 'g' + used.size, rk: rank, pots: ghostPots(rank), name, kind: pick(KINDS), level, str: r(), agi: r(), end: r(), w: Math.round(2 + rank * 1.45 + rank * rank * TUNE.rq * 0.5), ar: Math.floor(rank * 0.6 + rank * rank * TUNE.rq * 0.2),
    cote: Math.round(850 + rank * 100 + ri(-60, 60)), clan: Math.random() < 0.75 ? pick(CLANS).id : null,
    look: { gender: fem ? 'f' : 'h', skin: ri(0, 3), hair: ri(0, 2), hairc: ri(0, 3), rank: vt(rank), armor: vt(Math.round(rank * 0.9)), weapon: vt(rank), scars: ri(0, 2) }
  };
}
function genRival(s) {
  const rk = Math.min(s.rank + 1, LAST + 1), rr = Math.min(rk, LAST);
  const st = statsOf(s), mean = (st.force + st.agi + st.end) / 3;
  const floor = 3 + rk * TUNE.rk + rk * rk * TUNE.rq + (s.level - 1) * TUNE.lv;
  const r = () => Math.max(2, Math.round(Math.max(floor, mean * TUNE.rm) + TUNE.rv + rnd(-1, 1.2)));
  const tr = s.flags && s.flags.truce === 1 ? -1 : s.flags && s.flags.truce === 0 ? 1 : 0;
  return {
    id: 'rival', rival: true, pots: ghostPots(rr, 1), name: s.rival.name, kind: SCHOOL_KIND[rivalSchool(s)], level: Math.max(1, s.level + 1), str: Math.max(2, r() + tr), agi: Math.max(2, r() + tr), end: Math.max(2, r() + tr),
    w: Math.max(Math.round(2 + rr * 1.45), Math.round(gearW(s) * TUNE.rw)), ar: Math.max(Math.floor(rr * 0.6) + 1, gearA(s) + 1), cote: s.cote + 70,
    look: { gender: s.rival.gender, skin: ri(0, 3), hair: ri(0, 2), hairc: ri(0, 3), rank: vt(rr), armor: vt(Math.round(rr * 0.9)), weapon: vt(rr), scars: 2 }
  };
}
function diffOf(s, o) { const d = o.cote - s.cote; return o.rival ? 1 : d > 60 ? 1 : d < -60 ? -1 : 0; }
const recentWins = (s, id) => { const h = s.hist && s.hist[id]; return h && s.gameMs - h.t < 48 * H ? h.n : 0; };
const fatigue = (s, o) => (o.rival || o.night || o.spar || o.tour) ? 1 : Math.max(0.35, 1 - 0.2 * recentWins(s, o.id));
const gloireGain = (s, o, fav) => Math.round((10 + 2 * s.rank + fav / 6) * dmult(s, o) * (1 + (pmod(s).glo || 0)) * (s.clan ? CLAN_BONUS : 1) * fatigue(s, o));
const gloireBar = s => { const p = floorOf(s.rank), n = RANKS[s.rank].need; return { cur: Math.max(0, s.gloire - p), max: n - p }; };
const dmult = (s, o) => o.rival ? 1.6 : [0.75, 1, 1.4][diffOf(s, o) + 1];
const goldMul = s => (s.origin === 'debt' ? 1.15 : 1) * (1 + (gearFx(s).fortune || 0) / 100) * (1 + (pmod(s).gold || 0)) * (1 + 0.15 * s.cell.stash);
function preview(s, o) {
  const m = dmult(s, o);
  return { gloire: gloireGain(s, o, 18), gold: Math.round((14 + s.rank * 8) * m * goldMul(s)), tired: fatigue(s, o) < 1 };
}
/* ---------- arène : contrats, conditions, némésis, tournois ---------- */
const CTR_INFO = {
  loot: { n: 'Butin ciblé', d: c => `Il porte la ${SET_BY[c.set].n.toLowerCase()} : une pièce est garantie si tu gagnes.` },
  bet: { n: 'Pari', d: c => `Mise de ${c.stake} sesterces. Tu les perds si tu échoues, tu touches le triple si tu gagnes.` },
  fame: { n: 'Prime de gloire', d: () => 'Combat très regardé : gloire +60 % si tu gagnes.' }
};
function mkCtr(s, t) {
  if (t === 'loot') { const ok = SETS.filter(x => x.r <= s.rank + 1); return { t, set: pick(ok.slice(-3)).id }; }
  if (t === 'bet') return { t, stake: Math.round((20 + 10 * s.rank) / 5) * 5 };
  return { t };
}
function arenaRoll(s, g) {
  const d = dayOf(s); if (g.xday === d) return;
  g.xday = d;
  const h = hashStr(g.id + ':' + d), r1 = (h % 100) / 100, r3 = (Math.floor(h / 7) % 100) / 100;
  g.cond = (s.rank >= 1 && r1 < 0.3) ? ARENA_RULES[Math.floor(h / 100) % ARENA_RULES.length].id : null;
  const hi = g.cote > s.cote + 40, eq = Math.abs(g.cote - s.cote) <= 40;
  g.ctr = hi ? (r3 < 0.4 ? mkCtr(s, 'loot') : r3 < 0.75 ? mkCtr(s, 'fame') : null) : eq ? (r3 < 0.4 ? mkCtr(s, 'bet') : r3 < 0.6 ? mkCtr(s, 'fame') : null) : (r3 < 0.2 ? mkCtr(s, 'bet') : null);
}
const NEM_LINES = ['« Je t’attendais. »', '« La dernière fois, tu as eu de la chance. »', '« Tu te souviens de moi ? Moi, oui. »', '« Cette fois, tu ne t’en sortiras pas. »'];
const nemLine = o => NEM_LINES[hashStr(o.name || '') % NEM_LINES.length];
function engage(s, opp) {
  if (opp.ctr && opp.ctr.t === 'bet' && s.gold >= opp.ctr.stake) {
    s.gold -= opp.ctr.stake; s.wager = (s.wager || 0) + opp.ctr.stake; s.wagerMul = 3; return true;
  }
  if (opp.ctr && opp.ctr.t === 'bet') opp.ctr = null;
  return false;
}
const TOUR_ROUNDS = ['Quarts de finale', 'Demi-finale', 'Finale'];
const tourFee = s => 30 + 15 * s.rank;
const tourCan = s => !s.freed && !s.tour && s.wins >= 10 && s.rank >= 1 && dayOf(s) - (s.tourLast == null ? -99 : s.tourLast) >= 2;
function tourStart(s) {
  if (!tourCan(s) || s.gold < tourFee(s)) return null;
  s.gold -= tourFee(s);
  const used = new Set(), opps = [];
  [-40, 0, 70].forEach((off, i) => {
    const g = s.ghosts.filter(x => !used.has(x.id)).sort((a, b) => Math.abs(a.cote - (s.cote + off)) - Math.abs(b.cote - (s.cote + off)))[0];
    used.add(g.id);
    const o = JSON.parse(JSON.stringify(g)); o.tour = true; o.nem = null; o.ctr = null; o.trait = traitOf(g); o.cond = (i > 0 && Math.random() < 0.4) ? pick(ARENA_RULES).id : null; o.tr = i;
    opps.push(o);
  });
  s.tour = { rd: 0, opps };
  log(s, `Tu t’inscris au tournoi : ${s.tour.opps[0].name} t’attend en quarts de finale.`);
  return s.tour;
}
const tourOpp = s => s.tour ? s.tour.opps[s.tour.rd] : null;
function tourQuit(s) { if (s.tour) { s.tour = null; s.tourLast = dayOf(s); } }
function tourAfter(s, win) {
  const t = s.tour; if (!t) return null;
  if (!win) { tourQuit(s); log(s, 'Tu es éliminé du tournoi.'); return { state: 'out' }; }
  t.rd++;
  if (t.rd >= 3) {
    const prize = { gold: tourFee(s) * 4, gloire: 30 + 8 * s.rank };
    s.gold += prize.gold; s.gloire += prize.gloire;
    prize.loot = lootDrop(s, { force: true, minRar: 2, legend: 0.05 });
    tourQuit(s); log(s, `Tu remportes le tournoi ! +${prize.gold} sesterces, +${prize.gloire} gloire.`);
    return { state: 'champ', prize };
  }
  s.hp = Math.min(maxHp(s), s.hp + Math.round(maxHp(s) * 0.15));
  return { state: 'next', rd: t.rd, next: t.opps[t.rd] };
}
function pickOpps(s) {
  const avail = s.ghosts.filter(g => !(s.fought[g.id] != null && s.gameMs - s.fought[g.id] < 6 * H));
  const byD = avail.slice().sort((a, b) => Math.abs(a.cote - s.cote) - Math.abs(b.cote - s.cote));
  const res = [];
  [byD.find(g => g.cote < s.cote - 40), byD.find(g => Math.abs(g.cote - s.cote) <= 40), byD.find(g => g.cote > s.cote + 40)].forEach(g => { if (g && !res.includes(g)) res.push(g); });
  for (const g of byD) { if (res.length >= 3) break; if (!res.includes(g)) res.push(g); }
  const nemG = s.nems ? avail.filter(g => s.nems[g.id])[0] : null;
  if (nemG && !res.includes(nemG)) { if (res.length >= 3) res[res.length - 1] = nemG; else res.push(nemG); }
  s.ghosts.forEach(g => { g.nem = (s.nems && s.nems[g.id]) || null; });
  res.forEach(g => arenaRoll(s, g));
  return res.sort((a, b) => a.cote - b.cote);
}
function ladder(s) {
  const rows = s.ghosts.map(g => ({ id: g.id, name: g.name, cote: g.cote, rank: g.rk != null ? g.rk : g.look.rank, clan: g.clan, gender: g.look.gender }));
  rows.push({ id: 'me', me: true, name: s.name, cote: s.cote, rank: s.rank, clan: s.clan, gender: s.gender });
  rows.push({ id: 'rival', rival: true, name: s.rival.name, cote: s.freed ? s.cote - 30 : s.cote + 70, rank: vt(Math.min(LAST, s.rank + 1)), clan: null, gender: s.rival.gender });
  rows.sort((a, b) => b.cote - a.cote);
  rows.forEach((r, i) => { r.pos = i + 1; });
  return rows;
}
function clanBoard(s) {
  const rows = CLANS.map(c => {
    const mem = s.ghosts.filter(g => g.clan === c.id).map(g => g.cote);
    if (s.clan === c.id) mem.push(s.cote);
    const pts = Math.round(mem.reduce((a, v) => a + Math.max(0, v - 800), 0) / 10);
    return { id: c.id, n: c.n, t: c.t, members: mem.length, pts, mine: s.clan === c.id };
  });
  rows.sort((a, b) => b.pts - a.pts);
  rows.forEach((r, i) => { r.pos = i + 1; });
  return rows;
}
function joinClan(s, id) { if (s.rank < 1 || s.clan) return false; s.clan = id; log(s, `Tu rejoins ${CLANS.find(c => c.id === id).n}. Tes gains de gloire augmentent de 10 %.`); return true; }
function leaveClan(s) { if (!s.clan) return; log(s, 'Tu quittes ton clan.'); s.clan = null; }

/* ---------- état ---------- */
function newState(d, legacy, now) {
  const og = ORIGINS.find(x => x.id === d.origin) || ORIGINS[0];
  const rg = Math.random() < 0.5 ? 'f' : 'h';
  const s = {
    v: 3, nr: 11, name: d.name, gender: d.gender, skin: d.skin, hair: d.hair, hairc: d.hairc, origin: og.id,
    str: 3 + legacy, agi: 3 + legacy, end: 3 + legacy, tp: { str: 0, agi: 0, end: 0 },
    level: 1, xp: 0, hp: 1, hpAcc: 0, gold: 0, gloire: 0, rank: 0, cote: 900,
    lastReal: now, speed: 60, gameMs: 0, dayAcc: 0, occ: null, cnt: { train: 0, work: 0, search: 0, spar: 0, heal: 0, buy: 0 }, quest: 0,
    weapon: 0, armor: 0, cell: { bed: 0, hearth: 0, stash: 0 }, perks: [], pendingPerks: 0,
    wins: 0, losses: 0, freed: false, mercy: null, clan: null, fought: {}, bestFav: 0, log: [],
    rival: { gender: rg, name: pick(rg === 'f' ? RIVALS_F : RIVALS_M), school: pick(['thrace', 'mirmillon', 'retiaire']) }, ghosts: []
  };
  s[og.stat] += 2;
  s.hp = maxHp(s);
  const used = new Set();
  [[0, 8], [1, 7], [2, 6], [3, 6], [4, 5], [5, 5], [6, 4], [7, 4], [8, 3], [9, 2], [10, 2]].forEach(([r, n]) => { for (let i = 0; i < n; i++) s.ghosts.push(genGhost(r, used)); });
  migrate(s); s.nextEv = 150 * 60000;
  s.log = ['On t’a jeté dans une cellule du ludus. Quelque part dans la cour, ' + s.rival.name + ' t’observe déjà.'];
  return s;
}
function log(s, t) { s.log.unshift(t); if (s.log.length > 14) s.log.length = 14; }
const dayOf = s => Math.floor(s.gameMs / (24 * H)) + 1;

/* ---------- le temps ---------- */
function advance(s, dt) {
  if (dt <= 0) return;
  s.gameMs += dt;
  const mh = maxHp(s);
  if (s.hp < mh) {
    s.hpAcc += mh * (s.rank === 0 ? 0.2 : 0.12) * (1 + 0.2 * s.cell.bed + 0.25 * (s.flags && s.flags.saved ? 1 : 0) + (pmod(s).regen2 || 0)) * dt / H;
    const add = Math.floor(s.hpAcc); s.hpAcc -= add; s.hp = Math.min(mh, s.hp + add);
    if (s.hp >= mh) s.hpAcc = 0;
  }
  s.dayAcc += dt;
  while (s.dayAcc >= 24 * H) {
    s.dayAcc -= 24 * H;
    s.chests = Math.min(3, (s.chests || 0) + 1);
    s.ghosts.forEach(g => { if (Math.random() < 0.35) g.cote = Math.max(500, g.cote + ri(-10, 18)); if (Math.random() < 0.15) { g[pick(['str', 'agi', 'end'])]++; g.cote += 8; } });
  }
}
function tick(s, now) {
  const dt = (now - s.lastReal) * s.speed;
  s.lastReal = now;
  advance(s, Math.min(dt, 7 * 24 * H));
}
function occLeft(s) { return s.occ ? Math.max(0, s.occ.startG + s.occ.durG - s.gameMs) : 0; }
const occReady = s => !!s.occ && occLeft(s) <= 0;
const OCC = {
  train: { n: 'Entraînement', dur: 1.5 * H },
  work: { n: 'Travail', dur: 1 * H },
  search: { n: 'Fouille de la cellule', dur: 0.5 * H }
};
function occDur(s, kind) { return Math.round(OCC[kind].dur * (1 + 0.3 * s.rank) * (kind === 'train' ? 1 - 0.15 * s.cell.hearth + (pmod(s).train || 0) : 1)); }
const canRush = s => !!s.occ && s.occ.kind === 'train' && !occReady(s);
const rushCost = s => s.occ ? Math.max(4, Math.ceil(occLeft(s) / H * (4 + 3 * s.rank))) : 0;
function rush(s) {
  const c = rushCost(s);
  if (!canRush(s) || s.gold < c) return false;
  s.gold -= c; s.occ.startG = s.gameMs - s.occ.durG;
  log(s, `Tu graisses la patte du surveillant : ${c} sesterces, et c’est déjà fini.`);
  return true;
}
function startOcc(s, kind, k) {
  if (s.occ) return false;
  s.occ = { kind, k: k || null, startG: s.gameMs, durG: occDur(s, kind) };
  s.cnt[kind]++;
  return true;
}
function addXp(s, n) {
  s.xp += Math.round(n * (1 + (pmod(s).xp || 0)));
  let up = 0;
  while (s.xp >= xpNeed(s.level)) { s.xp -= xpNeed(s.level); s.level++; if (s.level <= 10 || s.level % 2 === 0) s.pendingPerks++; up++; if (s.level % 2 === 0) s[pick(['str', 'agi', 'end'])]++; s.hp = Math.min(maxHp(s), s.hp + Math.round(maxHp(s) * 0.2)); }
  return up;
}
const FOUND = [
  ['une dent de lion', 3], ['un dé d’os', 2], ['un denier ébréché', 5], ['une fibule de bronze', 6],
  ['un flacon d’huile', 4], ['un papyrus griffonné', 1], ['une amulette de Fortuna', 12], ['un gladius cassé', 7]
];
const EVENTS = [
  s => { s.tp.agi += 2; return 'Un vieux gladiateur te montre une feinte. (+2 de progression en Agilité)'; },
  s => { s.gold += 8; return 'Un marchand te glisse quelques sesterces pour un service. (+8)'; },
  s => pick(RIVAL_NEWS)(s.rival.name)
];
function gainTp(s, k, n) {
  s.tp[k] += n;
  let up = '';
  while (s.tp[k] >= trainNeed(s[k])) { s.tp[k] -= trainNeed(s[k]); s[k]++; up = ` Tu franchis un cap : ${STAT_N[k]} ${s[k]}.`; }
  return up;
}
function collectOcc(s) {
  if (!occReady(s)) return null;
  const o = s.occ; s.occ = null;
  let t;
  if (o.kind === 'train') {
    const k = o.k, up = gainTp(s, k, ri(2, 4));
    addXp(s, 4);
    t = `Séance de ${STAT_N[k].toLowerCase()} terminée.${up}`;
  } else if (o.kind === 'work') {
    const g = Math.round((ri(9, 14) + s.rank * 5) * goldMul(s) * (1 + (pmod(s).work || 0)));
    s.gold += g;
    t = pick(['Tu portes des amphores pour le cuisinier', 'Tu graisses les armes du maître d’armes', 'Tu nettoies les gradins de l’entraînement']) + ` : +${g} sesterces.`;
  } else {
    if (Math.random() < 0.12) t = 'Rien que de la poussière et des punaises.';
    else { const [n, v] = pick(FOUND); const g = Math.round((v + s.rank * 2) * (1 + 0.15 * s.cell.stash) * (1 + (pmod(s).search || 0))); s.gold += g; t = `Tu trouves ${n} sous la paillasse. Revendu : +${g} sesterces.`; }
  }
  log(s, t);
  if (Math.random() < 0.25) log(s, pick(EVENTS)(s));
  return t;
}
const healCost = s => Math.max(1, Math.round((5 + 8 * s.rank) * (1 - (pmod(s).healDisc || 0))));
const price = (s, p) => Math.round(p * (1 - (pmod(s).shop || 0)));
function heal(s) {
  const c = healCost(s);
  if (s.hp >= maxHp(s) || s.gold < c) return null;
  s.gold -= c; const h = Math.round(maxHp(s) * 0.5);
  s.hp = Math.min(maxHp(s), s.hp + h);
  s.cnt.heal++;
  const t = `Le médecin du ludus te recoud. (+${h} vie, −${c} sesterces)`; log(s, t); return t;
}
function odds(s, opp, n) {
  let w = 0; n = n || 60;
  for (let i = 0; i < n; i++) if (autoFight(s, opp).win) w++;
  return w / n;
}
/* ---------- sparring : sans risque, utile au début ---------- */
function sparOpp(s) {
  const b = 3.5 + (s.level - 1) * 0.5, r = () => Math.max(2, Math.round(b + rnd(-0.6, 0.6)));
  return { id: 'spar', spar: true, name: 'Ennius, maître d’armes', kind: 'Maître d’armes', level: s.level, str: r(), agi: r(), end: r(), w: 2, ar: 0, cote: s.cote,
    look: { gender: 'h', skin: 1, hair: 2, hairc: 0, rank: 1, armor: 1, weapon: 0, scars: 2 } };
}
const sparXp = s => Math.max(0, 9 - 2 * s.level);
function sparState(s) { return Object.assign({}, s, { hp: maxHp(s) }); }
function resolveSpar(s, win) {
  const out = { win, xp: 0, up: '', k: null, levels: 0, useless: sparXp(s) === 0 };
  s.cnt.spar++;
  const xp = Math.round(sparXp(s) * (win ? 1 : 0.5));
  if (xp > 0) {
    out.xp = xp; out.k = ['str', 'agi', 'end'].sort((a, b) => s[a] - s[b])[0];
    out.up = gainTp(s, out.k, 2); out.levels = addXp(s, xp);
  }
  log(s, win ? `Séance de sparring gagnée contre le maître d’armes.${out.xp ? '' : ' Il n’a plus rien à t’apprendre.'}` : 'Le maître d’armes te corrige. Tu t’en souviendras.');
  return out;
}
/* ---------- objectifs guidés ---------- */
const QUESTS = [
  { t: 'Lance un entraînement', h: 'Dans l’onglet Ludus, choisis Force, Agilité ou Endurance.', r: 12, ok: s => s.cnt.train >= 1 },
  { t: 'Fais un combat de sparring', h: 'Dans l’Arène : aucun risque, aucune perte de vie.', r: 15, ok: s => s.cnt.spar >= 1 },
  { t: 'Remporte un combat en arène', h: 'Choisis un adversaire « Bonnes chances ».', r: 25, ok: s => s.wins >= 1 },
  { t: 'Équipe-toi d’une arme ou d’une armure', h: 'La boutique vend de quoi t’améliorer dès 30 sesterces.', r: 20, ok: s => s.cnt.buy >= 1 },
  { t: 'Atteins le niveau 3', h: 'Chaque victoire et chaque entraînement donnent de l’expérience.', r: 30, ok: s => s.level >= 3 },
  { t: 'Deviens Recrue', h: 'Accumule de la gloire, puis relève le défi de ton rival.', r: 60, ok: s => s.rank >= 1 },
  { t: 'Rejoins un clan', h: 'Onglet Rang, puis Clans. Tes victoires rapportent 10 % de gloire en plus.', r: 40, ok: s => !!s.clan },
  { t: 'Deviens Gladiateur', h: 'Gloire, puis duel contre ton rival.', r: 100, ok: s => s.rank >= 2 },
  { t: 'Gagne ta liberté', h: 'Grimpe jusqu’en haut de la pyramide.', r: 0, ok: s => s.freed }
];
function checkQuests(s) {
  const done = [];
  while (s.quest < QUESTS.length && QUESTS[s.quest].ok(s)) {
    const q = QUESTS[s.quest]; s.gold += q.r; s.quest++;
    done.push({ t: q.t, r: q.r }); log(s, `Objectif accompli : ${q.t}${q.r ? ` (+${q.r} sesterces)` : ''}.`);
  }
  return done;
}
const cellCost = (s, id) => { const c = CELL.find(x => x.id === id); return s.cell[id] >= c.max ? null : c.p[s.cell[id]]; };
function buyCell(s, id) {
  const c = cellCost(s, id);
  if (c == null || s.gold < c) return false;
  s.gold -= c; s.cell[id]++;
  log(s, `Ta cellule s’améliore : ${CELL.find(x => x.id === id).n} niveau ${s.cell[id]}.`);
  return true;
}

/* ---------- fin de combat ---------- */
function resolve(s, opp, res) {
  const out = { win: res.win, xp: 0, gloire: 0, gold: 0, levels: 0, spared: false, rankUp: null, freed: false, fav: res.fav, cote: 0, lostGloire: 0 };
  s.bestFav = Math.max(s.bestFav, res.fav);
  const ex = 1 / (1 + Math.pow(10, (opp.cote - s.cote) / 400));
  out.cote = Math.round(28 * ((res.win ? 1 : 0) - ex));
  s.cote = Math.max(500, s.cote + out.cote);
  if (!opp.rival && !opp.night && !opp.tour) { opp.cote = Math.max(500, opp.cote - out.cote); s.fought[opp.id] = s.gameMs; }
  if (opp.night) s.night.done = dayOf(s);
  s.bless = 0;
  if (s.wager) { out.wager = s.wager; out.wagerWin = s.wager * (s.wagerMul || 2); if (res.win) { s.gold += out.wagerWin; } s.wager = 0; s.wagerMul = 0; }
  if (res.win) {
    const m = dmult(s, opp);
    out.xp = Math.round((12 + opp.level * 3) * m * fatigue(s, opp));
    out.gloire = gloireGain(s, opp, res.fav);
    if (!opp.rival && !opp.night && !opp.spar && !opp.tour) { if (!s.hist) s.hist = {}; s.hist[opp.id] = { n: recentWins(s, opp.id) + 1, t: s.gameMs }; }
    out.gold = Math.round((14 + s.rank * 8) * m * goldMul(s) * (opp.night ? 1.5 : 1));
    let xmul = 1, gmul = 1;
    if (opp.ctr && opp.ctr.t === 'fame') xmul *= 1.6;
    if (opp.cond && !opp.night) xmul *= 1.15;
    if (opp.nem) { xmul *= 1.5; gmul *= 1.5; out.nem = true; }
    out.gloire = Math.round(out.gloire * xmul); out.gold = Math.round(out.gold * gmul);
    out.ovation = Math.round(maxHp(s) * res.fav / 100 * 0.25 * (1 + (pmod(s).ov || 0))); s.hp = Math.min(maxHp(s), Math.max(1, res.pHp) + out.ovation); s.gold += out.gold; s.gloire += out.gloire; s.wins++;
    out.levels = addXp(s, out.xp);
    if (opp.ctr && opp.ctr.t === 'loot') { out.loot = lootDrop(s, { force: true, set: opp.ctr.set, minRar: s.rank >= 3 ? 1 : 0 }); out.ctrLoot = true; }
    else out.loot = lootDrop(s, { fav: res.fav, force: !!opp.rival || !!opp.night, minRar: opp.rival ? 2 : opp.night ? 1 : 0, bonus: opp.night ? 6 : 0, legend: opp.rival ? 0.04 + s.rank * 0.004 : 0 });
    if (opp.rival) {
      out.quote = RIVAL_LOSE[s.rank];
      if (s.rank < LAST) { out.rankUp = { from: s.rank, to: s.rank + 1 }; s.rank++; }
      else { s.freed = true; out.freed = true; }
    }
    if (opp.nem && s.nems) delete s.nems[opp.id];
    log(s, `Victoire contre ${opp.name}. +${out.gloire} gloire, +${out.gold} sesterces, cote ${out.cote >= 0 ? '+' : ''}${out.cote}.`);
  } else {
    s.losses++;
    out.xp = 5; out.levels = addXp(s, 5);
    out.spared = opp.tour ? true : Math.random() < 0.15 + res.fav / 130;
    if (/^g\d+$/.test(String(opp.id)) && !opp.tour) { s.nems = s.nems || {}; s.nems[opp.id] = { n: Math.min(3, ((s.nems[opp.id] || {}).n || 0) + 1) }; out.nemNew = true; }
    if (out.spared) { s.hp = Math.max(1, Math.round(maxHp(s) * 0.15)); log(s, `Défaite contre ${opp.name}. La foule a réclamé ta grâce.`); }
    else {
      s.hp = 1; out.lost = Math.round(s.gold * 0.2); s.gold -= out.lost; out.coins = 4 + 2 * s.rank; s.gold += out.coins;
      out.lostGloire = Math.max(0, Math.min(s.gloire - floorOf(s.rank), 5 + 2 * s.rank)); s.gloire -= out.lostGloire;
      log(s, `Défaite contre ${opp.name}. Tu t’en sors à peine.`);
    }
  }
  if (opp.ctr) { out.ctr = opp.ctr; opp.ctr = null; }
  if (opp.tour) out.tour = tourAfter(s, res.win);
  mTrack(s, 'fight', { win: res.win, res, opp });
  return out;
}
function perkOptions(s) {
  const avail = shuffle(PERKS.filter(p => cnt(s, p.id) < p.max)), out = [], fams = new Set();
  for (const p of avail) { if (out.length >= 3) break; if (!fams.has(p.fam)) { fams.add(p.fam); out.push(p); } }
  for (const p of avail) { if (out.length >= 3) break; if (!out.includes(p)) out.push(p); }
  return out;
}
function takePerk(s, id) {
  const before = maxHp(s);
  s.perks.push(id); s.pendingPerks = Math.max(0, s.pendingPerks - 1);
  s.hp = Math.min(maxHp(s), s.hp + Math.max(0, maxHp(s) - before));
}
const gloireOk = s => s.gloire >= RANKS[s.rank].need;
const coteOk = s => s.cote >= duelCote(s.rank);
const canDuel = s => !s.freed && gloireOk(s) && coteOk(s);

/* ---------- v4 : butin, imprévus, histoire, offrande et jeux du soir ---------- */
const RAR = [{ n: 'Commun', c: '#b9a98d' }, { n: 'Rare', c: '#5fa8e8' }, { n: 'Épique', c: '#b57be8' }, { n: 'Légendaire', c: '#f0b73a' }];
const FX = {
  saign: { n: 'Saignement', v: [2, 3, 4], d: v => `+${v} dégâts bruts à chaque touche (ignore l’armure).` },
  vamp: { n: 'Soif de sang', v: [1, 2, 3], d: v => `Tu récupères ${v} de vie à chaque touche.` },
  riposte: { n: 'Riposte', v: [3, 5, 7], d: v => `Quand tu te couvres face à un coup, l’ennemi subit ${v} dégâts.` },
  crit: { n: 'Œil de lynx', v: [6, 10, 14], d: v => `+${v} % de coups critiques.` },
  foule: { n: 'Charisme', v: [6, 10, 14], d: v => `+${v} de faveur dès l’entrée.` },
  ecu: { n: 'Peau dure', v: [1, 1, 2], d: v => `−${v} dégâts reçus à chaque coup.` },
  fortune: { n: 'Bourse pleine', v: [10, 20, 30], d: v => `+${v} % de sesterces gagnés.` },
  esq: { n: 'Pied sûr', v: [4, 7, 10], d: v => `L’ennemi a ${v} % de chances de toucher en moins.` }
};
const PSLOTS = ['h', 'c', 'b', 'l', 's'];
const SLOTS = ['w', 'h', 'c', 'b', 'l', 's', 't'];
const SLOT_FX = { w: ['saign', 'vamp', 'crit'], t: ['fortune', 'foule', 'crit', 'esq', 'vamp'] };
const SLOT_N = { w: 'Arme', h: 'Casque', c: 'Plastron', b: 'Bras', l: 'Jambes', s: 'Bouclier', t: 'Amulette' };
const SHARE = { c: 0.32, h: 0.2, b: 0.16, l: 0.16, s: 0.16 };
const PSTAT = { c: 'end', b: 'str', l: 'agi' };
const PFX = { h: 'crit', c: 'ecu', b: 'riposte', l: 'esq', s: 'riposte' };
const SETS = [
  { id: 'cuir', n: 'Cuir de recrue', t: 1, sty: 1, r: 0, nm: { h: 'Calot de cuir', c: 'Pourpoint de cuir', b: 'Manica de cuir', l: 'Jambières de cuir', s: 'Rondache de bois' },
    bonus: { 2: [{ id: 'esq', v: 4 }], 4: [{ id: 'fortune', v: 10 }], 5: [{ id: 'ecu', v: 1 }] } },
  { id: 'bronze', n: 'Bronze de légionnaire', t: 3, sty: 2, r: 1, nm: { h: 'Casque de bronze', c: 'Cuirasse de bronze', b: 'Brassard de bronze', l: 'Jambières de bronze', s: 'Scutum de bronze' },
    bonus: { 2: [{ id: 'ecu', v: 1 }], 4: [{ id: 'riposte', v: 4 }], 5: [{ id: 'foule', v: 8 }] } },
  { id: 'thrace', n: 'Panoplie du Thrace', t: 4, sty: 3, r: 2, nm: { h: 'Heaume à crête de Thrace', c: 'Plastron de Thrace', b: 'Manica de Thrace', l: 'Jambières de Thrace', s: 'Parma de Thrace' },
    bonus: { 2: [{ id: 'crit', v: 6 }], 4: [{ id: 'saign', v: 2 }], 5: [{ id: 'crit', v: 6 }, { id: 'vamp', v: 1 }] } },
  { id: 'mirmillon', n: 'Panoplie du Mirmillon', t: 5, sty: 4, r: 3, nm: { h: 'Heaume au poisson', c: 'Cuirasse de Mirmillon', b: 'Manica de Mirmillon', l: 'Jambières de Mirmillon', s: 'Grand scutum' },
    bonus: { 2: [{ id: 'ecu', v: 1 }], 4: [{ id: 'riposte', v: 5 }], 5: [{ id: 'ecu', v: 1 }, { id: 'esq', v: 4 }] } },
  { id: 'retiaire', n: 'Panoplie du Rétiaire', t: 6, sty: 5, r: 4, nm: { h: 'Bandeau de Rétiaire', c: 'Harnais de Rétiaire', b: 'Galerus', l: 'Jambières de Rétiaire', s: 'Filet de lestage' },
    bonus: { 2: [{ id: 'esq', v: 6 }], 4: [{ id: 'crit', v: 6 }], 5: [{ id: 'esq', v: 6 }, { id: 'saign', v: 2 }] } },
  { id: 'champion', n: 'Panoplie du Champion', t: 8, sty: 6, r: 6, nm: { h: 'Heaume du Champion', c: 'Cuirasse du Champion', b: 'Brassard du Champion', l: 'Jambières du Champion', s: 'Bouclier du Champion' },
    bonus: { 2: [{ id: 'foule', v: 8 }], 4: [{ id: 'vamp', v: 1 }], 5: [{ id: 'foule', v: 10 }, { id: 'riposte', v: 5 }] } },
  { id: 'imperial', n: 'Panoplie impériale', t: 10, sty: 7, r: 8, nm: { h: 'Heaume doré', c: 'Cuirasse dorée', b: 'Brassard doré', l: 'Jambières dorées', s: 'Bouclier doré' },
    bonus: { 2: [{ id: 'ecu', v: 1 }, { id: 'esq', v: 5 }], 4: [{ id: 'saign', v: 3 }, { id: 'vamp', v: 1 }], 5: [{ id: 'foule', v: 12 }, { id: 'vamp', v: 1 }, { id: 'ecu', v: 1 }] } }
];
const SET_BY = {}; SETS.forEach(x => { SET_BY[x.id] = x; });
const setForTier = tr => { let b = SETS[0]; SETS.forEach(x => { if (x.t <= tr) b = x; }); return b; };
const pieceA = (tr, slot) => { const A = ARMORS[tr].a; return A ? Math.max(slot === 'c' || A >= 2 ? 1 : 0, Math.round(A * SHARE[slot])) : 0; };
const pstat = tr => 1 + Math.floor(tr / 5);
const piecePrice = (set, slot) => Math.round(ARMORS[set.t].p * SHARE[slot] * 1.05 / 5) * 5;
const BASE_WT = { 'Gladius': 'gladius', 'Glaive': 'gladius', 'Épée courte': 'gladius', 'Lame': 'gladius', 'Faux de Thrace': 'sica', 'Trident': 'trident', 'Spatha': 'spatha', 'Hache': 'hache', 'Masse': 'masse' };
const BASE_N = { w: ['Gladius', 'Glaive', 'Épée courte', 'Lame', 'Faux de Thrace', 'Trident', 'Spatha', 'Hache', 'Masse'], t: ['Amulette', 'Fibule', 'Talisman', 'Anneau', 'Pendentif'] };
const EPI = { saign: 'de la Morsure', vamp: 'du Loup affamé', crit: 'du Lynx', riposte: 'du Mur', ecu: 'de l’Ours', esq: 'de la Vipère', fortune: 'de Fortuna', foule: 'du Triomphe' };
const setCount = (s, id) => PSLOTS.filter(k => s.gear[k] && s.gear[k].set === id).length;
function setBonuses(s) {
  const out = [];
  SETS.forEach(x => { const n = setCount(s, x.id); if (!n) return; const act = [2, 4, 5].filter(k => n >= k); out.push({ set: x, n, act, fx: act.reduce((a, k) => a.concat(x.bonus[k]), []) }); });
  return out;
}
function gearFx(s) {
  const o = {}, add = f => { o[f.id] = (o[f.id] || 0) + f.v; };
  if (!(s.gear && s.gear.w) && WEAPONS[s.weapon].fx) WEAPONS[s.weapon].fx.forEach(add);
  SLOTS.forEach(k => { const it = s.gear && s.gear[k]; if (it) it.fx.forEach(add); });
  setBonuses(s).forEach(b => b.fx.forEach(add));
  return o;
}
function gearStat(s) {
  const o = { str: 0, agi: 0, end: 0 };
  PSLOTS.forEach(k => { const it = s.gear && s.gear[k]; if (it && it.st) Object.keys(it.st).forEach(z => { o[z] += it.st[z]; }); });
  return o;
}
const gearW = s => (s.gear && s.gear.w) ? s.gear.w.d : WEAPONS[s.weapon].d;
const gearA = s => PSLOTS.reduce((a, k) => a + (s.gear[k] ? s.gear[k].a : 0), 0);
function genItem(s, slot, rar, forceSet) {
  const tier = clamp(s.rank + ri(-1, 1), 1, 10);
  if (PSLOTS.includes(slot)) {
    const ok = SETS.filter(x => x.t <= tier && x.t >= tier - 3);
    let set = forceSet && SET_BY[forceSet] ? SET_BY[forceSet] : ok.length ? pick(ok) : setForTier(tier);
    if (!forceSet && Math.random() < 0.4) {
      const mine = SETS.filter(x => setCount(s, x.id) >= 2 && x.t <= s.rank + 2).sort((a, b) => setCount(s, b.id) - setCount(s, a.id))[0];
      if (mine) set = mine;
    }
    const it = { id: Math.random().toString(36).slice(2, 9), slot, rar, tier: set.t, set: set.id, fx: [], base: set.nm[slot] };
    it.a = pieceA(set.t, slot) + Math.floor(rar * (0.4 + set.t * 0.06));
    if (PSTAT[slot]) it.st = { [PSTAT[slot]]: pstat(set.t) + (rar >= 2 ? 1 : 0) + (rar === 3 ? 1 : 0) };
    if (rar >= 1) it.fx.push({ id: PFX[slot], v: FX[PFX[slot]].v[Math.min(2, rar - 1)] });
    if (rar === 3) { const o2 = shuffle(['crit', 'esq', 'ecu', 'riposte', 'foule', 'vamp'].filter(z => z !== PFX[slot]))[0]; it.fx.push({ id: o2, v: FX[o2].v[2] }); }
    it.n = it.base + (rar >= 2 ? ' ' + EPI[it.fx[0].id] : '');
    return it;
  }
  const it = { id: Math.random().toString(36).slice(2, 9), slot, rar, tier, fx: [], base: pick(BASE_N[slot]) };
  if (slot === 'w') { it.wt = BASE_WT[it.base]; it.d = Math.max(1, Math.round((WEAPONS[tier].d + Math.round(rar * (1 + tier * 0.12))) * WT[it.wt].dm)); }
  const nfx = slot === 't' ? Math.max(1, rar === 3 ? 2 : 1) : rar === 0 ? 0 : rar === 3 ? 2 : 1;
  shuffle(SLOT_FX[slot]).slice(0, nfx).forEach(id => it.fx.push({ id, v: FX[id].v[Math.max(0, rar - 1)] }));
  it.n = `${it.base} ${it.fx.length ? EPI[it.fx[0].id] : 'de caserne'}`;
  return it;
}
/* ---------- écoles de combat ---------- */
const SCHOOLS = [
  { id: 'thrace', grp: 'Les Thraces', lore: 'Venus des montagnes de Thrace, leurs guerriers furent vaincus par Rome, puis enchaînés et envoyés dans l’arène avec leur courbe d’épée et leur petit bouclier rond. Ils ne cherchent pas à tenir : ils cherchent la faille, et ils la trouvent vite.', motto: 'Un seul coup, mais à l’endroit où ça ne pardonne pas.', n: 'École thrace', tag: 'Vif et précis', d: 'Tu frappes juste. +8 % de coups critiques.', elan: 'Estocade', ed: 'Coup d’estoc : si elle touche, c’est un critique garanti.', dm: 1.5, hit: -0.08 },
  { id: 'mirmillon', grp: 'Les Mirmillons', lore: 'On les appelait jadis les Gaulois, à cause de leurs armes prises aux tribus vaincues. Leur casque porte un poisson sur la crête, et leur grand bouclier fait d’eux une porte close. Ils ne gagnent pas en dansant : ils gagnent parce que l’autre finit par se fatiguer de frapper un mur.', motto: 'Tiens debout. Le reste vient tout seul.', n: 'École du mirmillon', tag: 'Solide comme un mur', d: 'Tu encaisses. +20 % de réserve d’armure et +6 de vie.', elan: 'Choc de bouclier', ed: 'Tu écrases l’adversaire de ton bouclier : s’il est touché, il perd son prochain tour.', dm: 1.3, hit: 0 },
  { id: 'retiaire', grp: 'Les Rétiaires', lore: 'Fils de pêcheurs, ils entrent dans l’arène presque nus, avec un filet, un trident et une dague. Les autres écoles les méprisent : pas de casque, pas de bouclier, pas d’honneur, disent-elles. Mais celui qui s’est déjà pris le filet ne rit plus beaucoup.', motto: 'Ils te regardent de haut. Jusqu’à ce que tu les entoures.', n: 'École du rétiaire', tag: 'Insaisissable', d: 'Tu danses autour de lui. +6 % d’esquive et 1 point d’action de plus au départ.', elan: 'Coup de filet', ed: 'Tu jettes le filet : s’il est touché, il s’emmêle et touche bien moins pendant 2 tours.', dm: 1.1, hit: -0.04 }
];
const SCHOOL_BY = {}; SCHOOLS.forEach(x => { SCHOOL_BY[x.id] = x; });

/* ---------- maîtres, répliques et rivaux par école ---------- */
const KIND_SCHOOL = { 'Thraex': 'thrace', 'Mirmillon': 'mirmillon', 'Rétiaire': 'retiaire' };
const SCHOOL_KIND = { thrace: 'Thraex', mirmillon: 'Mirmillon', retiaire: 'Rétiaire' };
const MASTERS = {
  thrace: { n: 'Zoltes le Borgne', t: 'maître thrace', hello: 'Il te regarde un long moment, puis te lance une sica de bois. « Montre-moi comment tu tiens ta lame. Pas comment tu la brandis. »', join: 'Zoltes t’attrape le poignet et corrige ton geste d’un millimètre. « Voilà. Maintenant, tue-le avant qu’il ne comprenne. »' },
  mirmillon: { n: 'Gaius Murena', t: 'maître mirmillon', hello: 'Il frappe ton bouclier du plat de l’épée, sans prévenir. Tu ne bouges pas. « Bien. On peut commencer. »', join: 'Murena cogne sur ton bouclier jusqu’à ce que tes bras tremblent. « Encore. Un mur ne se plaint pas. »' },
  retiaire: { n: 'Nerea la Pêcheuse', t: 'maîtresse rétiaire', hello: 'Elle fait tournoyer son filet autour de ton épaule sans te toucher. « Tu es trop lourd. Allège-toi, ou tu finiras dedans. »', join: 'Nerea te jette un filet sur la tête et te regarde te débattre. « Première leçon : ne jamais être là où on te cherche. »' }
};
const QUIPS = {
  thrace: { open: ['« Les Thraces ne se battent pas longtemps. »', '« Lève ton bouclier, si tu veux qu’on ait l’air d’un vrai combat. »', '« Un coup. Je n’en ai besoin que d’un. »', '« Je t’ai repéré avant même que tu entres. »'],
    down: ['« Trop… lent. »', '« Alors c’était ça, la faille… »', '« Bien frappé. Je ne l’ai pas vu venir. »'], win: ['« Un seul coup, je t’avais prévenu. »', '« Tu attends, je frappe. C’est tout. »'] },
  mirmillon: { open: ['« Frappe tant que tu veux. Je suis encore là. »', '« On ne passe pas un mur en lui souriant. »', '« Mon bouclier a vu pire que toi. »', '« Je tiendrai plus longtemps que toi. »'],
    down: ['« Un mur… peut tomber. »', '« Tu as fini par me fatiguer. »', '« Rien de personnel. Pas de rancune. »'], win: ['« Tu t’es usé contre moi. »', '« Je n’ai même pas eu besoin de bouger. »'] },
  retiaire: { open: ['« Viens. Je t’attends dans mon filet. »', '« Tu cherches un adversaire. Moi, je cherche un poisson. »', '« Les casques, ça ne sert qu’à ne pas voir. »', '« Un pas de plus et tu es à moi. »'],
    down: ['« Le filet… s’est déchiré. »', '« Tu es sorti de mon filet. Bravo. »', '« Je dansais. Tu m’as rattrapé. »'], win: ['« Un poisson de plus. »', '« Je te l’avais dit : ne t’approche pas. »'] },
  none: { open: ['« Allons-y. »', '« La foule attend. Ne la déçois pas. »', '« Que le sable décide. »'], down: ['« Bien joué. »', '« Je reviendrai. »'], win: ['« C’était écrit. »', '« Tu feras mieux la prochaine fois. »'] }
};
const schoolOfOpp = o => KIND_SCHOOL[o.kind] || null;
function quip(o, type) {
  const sc = schoolOfOpp(o) || 'none', arr = QUIPS[sc][type];
  let h = 0; const k = String(o.id || '') + (o.name || '');
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}
function rivalSchool(s) {
  if (s.rival.school && SCHOOL_BY[s.rival.school]) return s.rival.school;
  let h = 0; for (const c of s.rival.name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  s.rival.school = ['thrace', 'mirmillon', 'retiaire'][h % 3]; return s.rival.school;
}

/* duels d'écoles : [école du joueur][école de l'adversaire] -> réplique adverse + conseil du maître */
const MATCH = {
  thrace: {
    thrace: { open: '« Deux Thraces. L’un de nous a mal appris. »', tip: 'Zoltes : « Contre un frère de lame, c’est celui qui hésite qui saigne. Ne bats pas des cils. »' },
    mirmillon: { open: '« Ta petite lame contre mon mur ? Essaie. »', tip: 'Zoltes : « Ne cogne pas le bouclier. Attends qu’il baisse la garde, c’est là qu’on le troue. »' },
    retiaire: { open: '« Un Thrace. Parfait. Les Thraces sont faciles à emmêler. »', tip: 'Zoltes : « Méfie-toi du filet : un Thrace emmêlé est un Thrace mort. Frappe avant qu’il ne le lance. »' } },
  mirmillon: {
    thrace: { open: '« Un Thrace contre un mirmillon. Tu peux frapper toute la journée. »', tip: 'Murena : « Il va chercher la faille. N’en laisse pas. Tiens ton bouclier, laisse-le s’épuiser. »' },
    mirmillon: { open: '« Deux murs face à face. Le plus têtu gagnera. »', tip: 'Murena : « Aucun de vous deux ne cédera. Alors gagne par la patience, et par le coup puissant. »' },
    retiaire: { open: '« Un mirmillon. Bien lourd. Bien lent. Tu vas tomber. »', tip: 'Murena : « Il tourne autour de toi pour te fatiguer. Ne cours pas après lui : reste là, il viendra. »' } },
  retiaire: {
    thrace: { open: '« Un rétiaire… Tu es à moitié nu, tu sais ? »', tip: 'Nerea : « Il frappe fort mais une seule fois. Esquive, et il est à toi. »' },
    mirmillon: { open: '« Un rétiaire. Tu cours bien ? Tu auras besoin. »', tip: 'Nerea : « Son bouclier est trop lourd pour qu’il te suive. Use-le, puis jette ton filet. »' },
    retiaire: { open: '« Deux pêcheurs sur le même sable. Un de nous retourne à l’eau. »', tip: 'Nerea : « Il connaît tous mes tours, c’est moi qui les lui ai appris. Surprends-le. »' } }
};
function matchup(s, o) {
  const a = s.school, b = schoolOfOpp(o);
  return a && b && MATCH[a] && MATCH[a][b] ? MATCH[a][b] : null;
}
const ELAN_NONE = { id: 'none', elan: 'Frappe d’élan', dm: 1.9, hit: -0.15 };
const SCHOOL_RANK = 2;
const schoolDue = s => s.rank >= SCHOOL_RANK && !s.school && !s.freed;
const schoolCost = s => 100 * (s.rank + 1);
function chooseSchool(s, id) {
  if (!SCHOOL_BY[id]) return null;
  if (s.school) { const c = schoolCost(s); if (s.gold < c || s.school === id) return null; s.gold -= c; }
  s.school = id; log(s, `Tu rejoins l’${SCHOOL_BY[id].n.toLowerCase()}. ${MASTERS[id].n} sera ton maître d’armes.`);
  return SCHOOL_BY[id];
}

/* ---------- potions de combat ---------- */
const POTIONS = [
  { id: 'hp1', n: 'Petite potion de soin', d: 'Rend 25 % de ta vie.', heal: 0.25, p: 30, r: 0 },
  { id: 'hp2', n: 'Potion de soin', d: 'Rend 45 % de ta vie.', heal: 0.45, p: 75, r: 2 },
  { id: 'hp3', n: 'Grande potion de soin', d: 'Rend 70 % de ta vie.', heal: 0.7, p: 170, r: 4 },
  { id: 'rage', n: 'Élixir de rage', d: '+35 % de dégâts pendant 4 tours.', buff: 'dmg', v: 0.35, dur: 4, p: 60, r: 1 },
  { id: 'vif', n: 'Huile de vif-argent', d: '+20 % d’esquive pendant 4 tours.', buff: 'esq', v: 0.2, dur: 4, p: 60, r: 1 },
  { id: 'ambr', n: 'Ambroisie', d: 'Rend 3 points d’action.', pa: 3, p: 50, r: 1 }
];
const POT_BY = {}; POTIONS.forEach(x => { POT_BY[x.id] = x; });
const POT_MAX = 6;
const potPrice = (s, x) => price(s, Math.round(x.p * (1 + 0.12 * s.rank) / 5) * 5);
function buyPotion(s, id) {
  const x = POT_BY[id]; if (!x) return null;
  if (s.rank < x.r && !s.freed) return null;
  const p = potPrice(s, x);
  if (s.gold < p || (s.pots[id] || 0) >= POT_MAX) return null;
  s.gold -= p; s.pots[id] = (s.pots[id] || 0) + 1; s.cnt.buy++; mTrack(s, 'spend', { n: p });
  const free = s.potSlots.findIndex(z => !z);
  if (free >= 0 && !s.potSlots.includes(id)) s.potSlots[free] = id;
  return x;
}
function buyWeapon(s, id, wt) {
  const W = WEAPONS[id]; if (!W || id < s.weapon) return null;
  const V = wt ? weaponVariant(id, wt) : null;
  if (wt && !V) return null;
  if (!wt && id <= s.weapon) return null;
  if (wt && id === s.weapon && s.gear.w && (s.gear.w.wt || 'x') === wt) return null;
  if (wt && !wtAvail(id).includes(wt)) return null;
  if (s.rank < W.r && !s.freed) return null;
  const p = price(s, W.p); if (s.gold < p || s.inv.length >= INV_MAX) return null;
  s.gold -= p; s.cnt.buy++; s.weapon = id;
  const nm = V ? V.n : W.n;
  const it = { id: Math.random().toString(36).slice(2, 9), slot: 'w', rar: 0, tier: W.id, d: V ? V.d : W.d, fx: (W.fx || []).map(f => Object.assign({}, f)), base: nm, n: nm, up: 0 };
  if (wt) it.wt = wt;
  s.inv.push(it); s.gear.w = it; log(s, `Tu t’équipes : ${nm}.`);
  return it;
}
function cyclePot(s, i) {
  const owned = Object.keys(s.pots).filter(k => s.pots[k] > 0 && POT_BY[k]).sort((a, b) => POTIONS.indexOf(POT_BY[a]) - POTIONS.indexOf(POT_BY[b]));
  const cur = s.potSlots[i], at = cur ? owned.indexOf(cur) : -1;
  const nx = at + 1 >= owned.length ? null : owned[at + 1];
  s.potSlots[i] = nx;
  return nx;
}

/* ---------- forge ---------- */
const UP_MAX = it => it.slot === 'w' ? 5 : PSLOTS.includes(it.slot) ? 3 : 0;
const forgeCost = (s, it) => Math.round((30 + 22 * it.tier) * (1 + 0.9 * (it.up || 0)) * (1 + 0.15 * it.rar) * (1 - (pmod(s).shop || 0)));
function forge(s, id) {
  const it = SLOTS.map(k => s.gear[k]).concat(s.inv).find(x => x && x.id === id);
  if (!it || (it.up || 0) >= UP_MAX(it)) return null;
  const c = forgeCost(s, it); if (s.gold < c) return null;
  s.gold -= c; it.up = (it.up || 0) + 1; mTrack(s, 'spend', { n: c });
  if (it.slot === 'w') it.d += 1; else it.a += 1;
  it.n = it.n.replace(/ \+\d+$/, '') + ' +' + it.up;
  s.cnt.buy++; log(s, `Le forgeron améliore ${it.n}.`);
  return it;
}
function rollRar(s, bonus) {
  const L = 0.4 + s.rank * 0.12, E = 5 + s.rank * 0.8, R = 22 + s.rank * 1.5;
  const x = Math.max(0, Math.random() * 100 - (bonus || 0));
  return x < L ? 3 : x < L + E ? 2 : x < L + E + R ? 1 : 0;
}
const itemVal = it => it.slot === 'w' ? it.d : PSLOTS.includes(it.slot) ? it.a : 0;
function betterThanEquipped(s, it) {
  if (it.slot === 't') return !s.gear.t;
  const cur = s.gear[it.slot];
  if (!cur) return true;
  return itemVal(it) > itemVal(cur) || (itemVal(it) === itemVal(cur) && it.fx.length > cur.fx.length);
}
const sellValue = (s, it) => Math.round([6, 22, 60, 150][it.rar] * (1 + 0.3 * s.rank) + (it.up || 0) * 12);
const INV_MAX = 20;
function stashItem(s, it) {
  s.inv.push(it);
  const out = { item: it, auto: false, sold: null };
  out.better = betterThanEquipped(s, it);
  if (s.inv.length > INV_MAX) {
    const eq = new Set(SLOTS.map(k => s.gear[k] && s.gear[k].id));
    const cand = s.inv.filter(x => !eq.has(x.id) && x.id !== it.id).sort((a, b) => a.rar - b.rar || itemVal(a) - itemVal(b))[0];
    if (cand) { const v = sellValue(s, cand); s.gold += v; s.inv = s.inv.filter(x => x !== cand); out.sold = { n: cand.n, v }; }
  }
  return out;
}
function lootDrop(s, o) {
  o = o || {};
  const ch = (o.chance == null ? 0.22 + (o.fav || 0) / 100 * 0.12 : o.chance) + (pmod(s).lootCh || 0);
  if (!o.force && s.dry < 5 && Math.random() > ch) { s.dry++; return null; }
  s.dry = 0;
  let rar = Math.max(o.minRar || 0, rollRar(s, (o.bonus || 0) + (pmod(s).lootBonus || 0)));
  if (o.legend && Math.random() < o.legend) rar = 3;
  const r = stashItem(s, genItem(s, o.set ? pick(PSLOTS) : pick(['w', 'w', 'h', 'c', 'c', 'b', 'l', 's', 't', 't']), rar, o.set));
  log(s, `Butin : ${r.item.n} (${RAR[r.item.rar].n}).`);
  return r;
}
function buyPiece(s, setId, slot) {
  const set = SET_BY[setId]; if (!set || !PSLOTS.includes(slot)) return null;
  if (s.rank < set.r && !s.freed) return null;
  const p = price(s, piecePrice(set, slot));
  if (s.gold < p || s.inv.length >= INV_MAX) return null;
  if (s.inv.some(x => x.set === setId && x.slot === slot && x.rar === 0)) return null;
  const it = { id: Math.random().toString(36).slice(2, 9), slot, rar: 0, tier: set.t, set: set.id, fx: [], base: set.nm[slot], n: set.nm[slot], a: pieceA(set.t, slot) };
  if (PSTAT[slot]) it.st = { [PSTAT[slot]]: pstat(set.t) };
  s.gold -= p; s.cnt.buy++; s.inv.push(it); s.gear[slot] = it; log(s, `Tu t’équipes : ${it.n}.`);
  return it;
}
/* ---------- comparer, trier, assembler ---------- */
const pieceScore = it => !it ? 0 : it.slot === 'w' ? it.d + it.fx.length * 2 : it.slot === 't' ? 1 + it.rar * 2 + it.fx.length * 2 : it.a + (it.st ? Object.keys(it.st).reduce((a, k) => a + it.st[k] * 2, 0) : 0) + it.fx.length * 2;
function compare(s, it) {
  const cur = s.gear[it.slot];
  if (cur && cur.id === it.id) return { dir: 0, lines: [], same: true, set: null };
  const lines = [];
  if (it.slot === 'w') { const dd = it.d - (cur ? cur.d : WEAPONS[s.weapon].d); if (dd) lines.push(`${dd > 0 ? '+' : ''}${dd} dégâts`); }
  else if (PSLOTS.includes(it.slot)) {
    const da = it.a - (cur ? cur.a : 0); if (da) lines.push(`${da > 0 ? '+' : ''}${da} protection`);
    ['str', 'agi', 'end'].forEach(k => { const d = ((it.st && it.st[k]) || 0) - ((cur && cur.st && cur.st[k]) || 0); if (d) lines.push(`${d > 0 ? '+' : ''}${d} ${STAT_N[k]}`); });
  }
  const cf = new Set((cur ? cur.fx : (it.slot === 'w' ? (WEAPONS[s.weapon].fx || []) : [])).map(f => f.id));
  it.fx.forEach(f => { if (!cf.has(f.id)) lines.push(`effet : ${FX[f.id].n}`); });
  [...cf].forEach(id => { if (!it.fx.some(f => f.id === id)) lines.push(`perd : ${FX[id].n}`); });
  let set = null;
  if (it.set && (!cur || cur.set !== it.set)) {
    const n = setCount(s, it.set), n2 = n + 1, S1 = SET_BY[it.set];
    set = `${S1.n} ${n2}/5` + ([2, 4, 5].includes(n2) ? ' : bonus activé' : '');
  }
  let loss = null;
  if (cur && cur.set && cur.set !== (it.set || '') ) { const nc = setCount(s, cur.set); if ([2, 4, 5].includes(nc)) loss = `perd le bonus ${SET_BY[cur.set].n} ${nc}/5`; }
  const diff = pieceScore(it) - (cur ? pieceScore(cur) : it.slot === 'w' ? WEAPONS[s.weapon].d : 0);
  const neg = lines.some(l => /^-\d/.test(l) || l.startsWith('perd')), pos = lines.some(l => /^\+\d/.test(l) || l.startsWith('effet'));
  return { dir: diff > 0 ? 1 : diff < 0 ? -1 : 0, lines, set, loss, diff, empty: !cur, mixed: neg && pos };
}
function bestGear(s) {
  const pool = SLOTS.map(k => s.gear[k]).concat(s.inv).filter(Boolean);
  const uniq = [...new Map(pool.map(x => [x.id, x])).values()];
  let chosen = {};
  for (let pass = 0; pass < 3; pass++) {
    SLOTS.forEach(k => {
      let best = null, bv = -1;
      uniq.filter(x => x.slot === k).forEach(x => {
        const syn = x.set ? PSLOTS.filter(z => z !== k && chosen[z] && chosen[z].set === x.set).length * 2.5 : 0;
        const v = pieceScore(x) + syn;
        if (v > bv) { bv = v; best = x; }
      });
      if (best) chosen[k] = best;
    });
  }
  let n = 0;
  SLOTS.forEach(k => { const c = chosen[k]; if (c && (!s.gear[k] || s.gear[k].id !== c.id)) { if (k === 'w' && !s.gear.w && c.d <= WEAPONS[s.weapon].d && !c.fx.length) return; s.gear[k] = c; n++; } });
  return n;
}
function junkItems(s) {
  const eq = new Set(SLOTS.map(k => s.gear[k] && s.gear[k].id));
  const keepSets = new Set(); SETS.forEach(x => { if (setCount(s, x.id) >= 2) keepSets.add(x.id); });
  return s.inv.filter(it => {
    if (eq.has(it.id)) return false;
    const cur = s.gear[it.slot];
    if (!cur) return false;
    if (it.rar >= 3) return false;
    if (it.set && keepSets.has(it.set)) return false;
    return pieceScore(it) <= pieceScore(cur);
  });
}
function sellJunk(s) {
  const J = junkItems(s); let g = 0;
  J.forEach(it => { g += sellValue(s, it); });
  s.gold += g; const ids = new Set(J.map(x => x.id)); s.inv = s.inv.filter(x => !ids.has(x.id));
  return { n: J.length, gold: g };
}
function completeCost(s, setId) {
  const set = SET_BY[setId]; let c = 0, n = 0; const todo = [];
  PSLOTS.forEach(k => {
    if (s.gear[k] && s.gear[k].set === setId) return;
    const own = s.inv.find(x => x.set === setId && x.slot === k);
    if (own) { todo.push([k, own, 0]); return; }
    const p = price(s, piecePrice(set, k)); c += p; n++; todo.push([k, null, p]);
  });
  return { cost: c, buy: n, todo, locked: s.rank < set.r && !s.freed, room: s.inv.length + n <= INV_MAX };
}
function completeSet(s, setId) {
  const info = completeCost(s, setId); const set = SET_BY[setId];
  if (info.locked || s.gold < info.cost || !info.room || !info.todo.length) return null;
  s.gold -= info.cost;
  info.todo.forEach(([k, own, p]) => {
    if (own) { s.gear[k] = own; return; }
    const it = { id: Math.random().toString(36).slice(2, 9), slot: k, rar: 0, tier: set.t, set: set.id, fx: [], base: set.nm[k], n: set.nm[k], a: pieceA(set.t, k) };
    if (PSTAT[k]) it.st = { [PSTAT[k]]: pstat(set.t) };
    s.inv.push(it); s.gear[k] = it; s.cnt.buy++;
  });
  log(s, `Tu t’équipes de la ${set.n}.`);
  return info;
}
function equipItem(s, id) { const it = s.inv.find(x => x.id === id); if (!it) return false; s.gear[it.slot] = it; return true; }
function unequip(s, slot) { s.gear[slot] = null; }
function sellItem(s, id) {
  const it = s.inv.find(x => x.id === id); if (!it) return 0;
  const v = sellValue(s, it); s.gold += v; s.inv = s.inv.filter(x => x !== it);
  if (s.gear[it.slot] && s.gear[it.slot].id === id) s.gear[it.slot] = null;
  return v;
}

/* offrande quotidienne */
function openChest(s) {
  if (!s.chests) return null;
  s.chests--;
  const gold = Math.round((ri(12, 20) + s.rank * 8) * goldMul(s));
  s.gold += gold;
  const loot = lootDrop(s, { force: Math.random() < 0.5, bonus: 3 });
  log(s, `Offrande du ludus : +${gold} sesterces${loot ? ' et ' + loot.item.n : ''}.`);
  return { gold, loot };
}

/* jeux du soir */
const NIGHT_RULES = [
  { id: 'fire', n: 'Arène en flammes', d: 'Les flammes brûlent les deux combattants : −2 de vie chacun à chaque tour.' },
  { id: 'blind', n: 'Combat dans la fumée', d: 'Tu ne vois plus ce que prépare ton adversaire.' },
  { id: 'frenzy', n: 'Foule en délire', d: 'La faveur de la foule monte deux fois plus vite.' },
  { id: 'dust', n: 'Tempête de sable', d: 'Tout le monde rate plus souvent : −12 % de chances de toucher.' },
  { id: 'sand', n: 'Sable lourd', d: 'Tu ne peux pas stocker plus de 4 points d’action.' },
  { id: 'blood', n: 'Duel sans merci', d: 'Tous les coups font 30 % de dégâts en plus.' },
  { id: 'hostile', n: 'Foule hostile', d: 'La faveur de la foule monte deux fois moins vite.' }
];
const ARENA_RULES = NIGHT_RULES;
const nightAvail = s => s.wins >= 2 && s.night.done !== dayOf(s);
const nightRule = s => NIGHT_RULES[dayOf(s) % NIGHT_RULES.length];
function nightOpp(s) {
  const g = s.ghosts.slice().sort((a, b) => Math.abs(a.cote - s.cote) - Math.abs(b.cote - s.cote));
  const base = g[dayOf(s) % Math.min(3, g.length)];
  return Object.assign({}, base, { id: 'night', night: true, pots: (base.pots && base.pots.length ? base.pots : ghostPots(base.rk || 0, 1)).slice() });
}

/* imprévus au ludus : scènes en DSL */
const hurt = (s, f) => { const d = Math.max(1, Math.round(maxHp(s) * f)); s.hp = Math.max(1, s.hp - d); return d; };
const loseGold = (s, n) => { const d = Math.min(s.gold, n); s.gold -= d; return d; };
const rstat = () => pick(['str', 'agi', 'end']);
const SCENES = [{ id: 'potion', min: 0, ic: 'potion', t: 'Le marchand de potions', x: ['Un marchand ambulant se glisse dans la cour, une fiole fumante à la main.', '« Ma toute dernière création ! D’après moi, elle rend plus fort. Quinze sesterces seulement. Je ne garantis rien, bien sûr. »'],
  ch: [{ l: 'Tenter la potion', cost: 15, o: [
    [30, 'Ça brûle la gorge, puis la force te monte aux bras.', [['stat', 'r', 2]]],
    [18, 'Un goût de miel et de poussière. Tu te sens mieux.', [['stat', 'r', 1], ['hp', 0.3]]],
    [20, 'Du vinaigre coloré. Le marchand a déjà disparu dans la foule.', []],
    [32, 'Ton ventre se tord et la cour tourne. Tu passes une heure à vomir.', [['hp', -0.35]]]] },
   { l: 'Refuser', o: [[1, 'Le marchand hausse les épaules et passe à la cellule suivante.', []]] }] },
{ id: 'des', min: 0, ic: 'dice', t: 'Les dés des gardes', x: ['Deux gardes jouent aux dés dans un coin de la cour. L’un d’eux te fait signe.', '« Dix sesterces, double ou rien ? Allez, sois pas timide. »'],
  ch: [{ l: 'Jouer', cost: 10, o: [[46, 'Le dé s’arrête sur Vénus !', [['g', 20]]], [54, 'Les gardes éclatent de rire. Les dés étaient pipés, évidemment.', []]] },
   { l: 'Passer ton chemin', o: [[1, 'Tu les laisses à leur jeu.', []]] }] },
{ id: 'louche', min: 1, ic: 'chest', t: 'Le paquet du soldat', x: ['Un soldat te glisse un paquet enveloppé dans un chiffon.', '« Pris sur un officier. Vingt-cinq sesterces, et tu ne m’as jamais vu. »'],
  ch: [{ l: 'Acheter sans regarder', cost: 25, o: [[72, 'Sous le chiffon, quelque chose qui brille. Le soldat n’avait pas menti.', [['loot', 1]]], [28, 'Du plomb peint en doré. Le soldat riait déjà au bout de la cour.', []]] },
   { l: 'Refuser', o: [[1, 'Tu ne tiens pas à finir au cachot pour un chiffon.', []]] }] },
{ id: 'ragout', min: 0, ic: 'bread', t: 'Le ragoût du cuisinier', x: ['Le cuisinier te tend une gamelle fumante.', '« Un reste de ragoût spécial. Huit sesterces, et tu me diras ce que tu en penses. »'],
  ch: [{ l: 'Goûter', cost: 8, o: [[55, 'Gras, salé, délicieux.', [['hp', 0.3]]], [25, 'Tu préfères ne pas savoir ce qu’il y avait dedans.', []], [20, 'Indigestion monumentale.', [['hp', -0.12]]]] },
   { l: 'Décliner', o: [[1, 'Le cuisinier se vexe un peu.', []]] }] },
{ id: 'guerisseur', min: 0, ic: 'potion', cond: ['hurt'], t: 'Le guérisseur grec', x: ['Un guérisseur à la barbe poivre et sel propose un « traitement miracle ».', '« Dix sesterces, résultats garantis. Par moi. »'],
  ch: [{ l: 'Se faire soigner', cost: 10, o: [[50, 'Une pâte verte sur les plaies, et tu te sens neuf. Le Grec n’a pas menti.', [['hp', 1]]], [30, 'Ça sent la menthe, ça ne fait rien. Tu gardes l’odeur toute la journée.', []], [20, 'Ça pique, ça gratte, ça enfle.', [['hp', -0.15]]]] },
   { l: 'Refuser', o: [[1, 'Tu préfères ta paillasse.', []]] }] },
{ id: 'admiratrice', min: 1, ic: 'chest', t: 'Une admiratrice', x: ['Une matrone a remarqué ton nom dans les gradins. Son serviteur t’apporte deux présents : une bourse et un coffret fermé.', '« Un seul, au choix. »'],
  ch: [{ l: 'La bourse', o: [[1, 'Prudent. La bourse est bien pleine.', [['g', 30]]]] },
   { l: 'Le coffret', o: [[55, 'Le coffret contenait un vrai trésor.', [['loot', 1]]], [45, 'Un rat mort et un mot moqueur. Quelqu’un s’est bien amusé.', []]] }] },
{ id: 'voleur', min: 1, ic: 'dice', cond: ['gold:20'], t: 'Le voleur à la tire', x: ['Un frôlement, un coup d’épaule… ta bourse a disparu ! Un gamin file vers le portail.'],
  ch: [{ l: 'Courir après lui', by: 'agi', o: [[35, 'Tu le plaques au sol. Il te rend tout, et un peu plus par peur.', [['g', 10]]], [65, 'Il connaît mieux la cour que toi.', [['g', -16]]]] },
   { l: 'Laisser filer', o: [[1, 'Tu laisses courir. C’est une leçon comme une autre.', [['g', -10]]]] }] },
{ id: 'huiles', min: 0, ic: 'potion', t: 'Le marchand d’huiles', x: ['Un homme parfumé frotte tes avant-bras d’autorité avec une huile qui sent le thym et la sueur de cheval.', '« Pour la souplesse, gladiateur. Douze sesterces, ou je reprends mon huile. »'],
  ch: [{ l: 'Payer', cost: 12, o: [[70, 'Tes articulations glissent comme neuves. La foule le verra.', [['bless', 12]]], [30, 'De l’huile de cuisine. Tu sens la friture jusqu’au soir.', []]] },
   { l: 'Refuser de payer', by: 'str', o: [[40, 'Tu le repousses d’une main. Il détale en laissant la fiole. Tu la vends plus loin.', [['g', 8]]], [60, 'Il crie au voleur. Un garde te colle une amende.', [['g', -12]]]] }] },
{ id: 'amulettes', min: 1, ic: 'amulet', t: 'La boutique d’amulettes', x: ['Un colporteur étale sur une peau de chèvre des amulettes en os, en bronze, en dents de lion.', '« Chacune a protégé un héros. Celle-ci, un consul ! Trente sesterces et elle est à toi. »'],
  ch: [{ l: 'En acheter une au hasard', cost: 30, o: [[55, 'Le bronze est tiède dans ta main, comme s’il t’attendait.', [['loot', 0]]], [30, 'De la ferraille vernie. Le colporteur est déjà loin.', []], [15, 'Un mauvais présage : tu dors mal toute la nuit.', [['hp', -0.1]]]] },
   { l: 'Marchander', by: 'agi', o: [[40, 'Tu obtiens une dent de lion pour presque rien.', [['loot', 0]]], [60, 'Il remballe sans un mot. Tu n’as rien gagné, sinon un regard noir.', []]] }] },
{ id: 'colporteur', min: 0, ic: 'scroll', t: 'Le colporteur de rumeurs', x: ['Un vieux tisserand qui connaît tout le monde s’assoit près de toi.', '« J’ai des nouvelles de l’arène. Gratuites pour les beaux yeux, plus précises pour dix sesterces. »'],
  ch: [{ l: 'Écouter gratuitement', o: [[60, 'Du bavardage, mais un détail t’apprend quelque chose sur la façon de te placer.', [['xp', 4]]], [40, 'Que des ragots sur les cuisiniers. Tu as perdu une heure.', []]] },
   { l: 'Payer pour le tuyau', cost: 10, o: [[75, 'Il te souffle les habitudes du prochain adversaire. Tu t’en souviendras.', [['bless', 10]]], [25, 'Son tuyau était périmé de trois mois.', []]] }] },
{ id: 'poulet', min: 0, ic: 'bread', t: 'Le poulet rôti', x: ['Une odeur de graisse chaude traverse la grille de la cour. Un marchand pousse une charrette où tournent trois poulets sur une broche.', '« Six sesterces la cuisse ! »'],
  ch: [{ l: 'En acheter une', cost: 6, o: [[78, 'Croustillante, salée, parfaite. Tes forces reviennent.', [['hp', 0.25]]], [22, 'Un peu trop cuite côté poil. Ça passe quand même.', [['hp', 0.05]]]] },
   { l: 'Passer', o: [[1, 'Tu avales ta salive et tu continues.', []]] }] },
{ id: 'tatoueur', min: 1, ic: 'spear', t: 'Le tatoueur', x: ['Un tatoueur gaulois aux doigts bleus plante son aiguille dans le bras d’un autre gladiateur. Il lève les yeux vers toi.', '« Ton nom sur l’épaule, ou le dessin que tu veux. Ça fait mal, mais les gradins adorent. »'],
  ch: [{ l: 'Se faire tatouer', cost: 25, o: [[75, 'Il dessine un loup. La foule te reconnaîtra de loin.', [['glo', 6], ['hp', -0.05]]], [25, 'La main a tremblé, le loup ressemble à un chien. Il faudra assumer.', [['glo', 2], ['hp', -0.08]]]] },
   { l: 'Passer son tour', o: [[1, 'Tu préfères garder la peau vierge pour l’instant.', []]] }] },
{ id: 'usurier', min: 1, ic: 'scroll', t: 'Le prêteur sur gage', x: ['Un petit homme à la bourse pleine marche entre les cellules, un registre sous le bras.', '« Soixante sesterces tout de suite, rien à signer. Tu me les rends avec un petit intérêt, plus tard. Je sais toujours où te trouver. »'],
  ch: [{ l: 'Emprunter', o: [[1, 'Les pièces sont lourdes. Il sourit trop pour que ce soit sain.', [['g', 60], ['flag', 'dette']]]] },
   { l: 'Refuser', o: [[1, 'Il hausse les épaules et continue, sans te quitter des yeux.', []]] }] },
{ id: 'usurier2', min: 1, w: 4, ic: 'scroll', cond: ['flag:dette'], t: 'Le prêteur revient', x: ['Le petit homme au registre t’attend à la sortie de l’entraînement.', '« Mon intérêt. Quatre-vingts, le total. Je ne suis pas méchant, je suis juste ponctuel. »'],
  ch: [{ l: 'Payer', cost: 80, o: [[1, 'Il vérifie chaque pièce. « Un plaisir. » Il disparaît.', [['unflag', 'dette'], ['honor', 1]]]] },
   { l: 'Refuser de payer', by: 'str', o: [[45, 'Tu le regardes dans les yeux jusqu’à ce qu’il comprenne. Il part, sans rien dire.', [['unflag', 'dette'], ['glo', 3]]], [55, 'Il fait un signe, deux gardes te passent à tabac. Puis il prend ce qu’il veut.', [['unflag', 'dette'], ['hp', -0.3], ['g', -70]]]] }] },
{ id: 'pari', min: 1, ic: 'dice', t: 'Parier sur toi-même', x: ['Un parieur de l’arène te tend une tablette de cire.', '« Les gradins parient sur tout, même sur toi. Mets quelque chose sur ta prochaine victoire : si tu gagnes, je double. Si tu perds… je garde. »'],
  ch: [{ l: 'Parier vingt sesterces', cost: 20, o: [[1, 'Il inscrit ton nom en souriant. Il ne te reste qu’à gagner.', [['wager', 20]]]] },
   { l: 'Parier cinquante sesterces', cost: 50, o: [[1, 'Il siffle entre ses dents. « Voilà quelqu’un qui croit en lui. »', [['wager', 50]]]] },
   { l: 'Ne pas parier', o: [[1, 'Le parieur hausse les épaules. « Les prudents ne rentrent pas dans la légende. »', []]] }] },
{ id: 'forgeron', min: 0, ic: 'spear', t: 'Le forgeron', x: ['Le forgeron du ludus examine ton arme d’un œil critique.', '« Ça n’a plus de fil. Vingt sesterces, je te l’affûte, ou tu te débrouilles avec ce que tu as. »'],
  ch: [{ l: 'La faire affûter', cost: 20, o: [[80, 'Le fil chante sur la meule. Ton arme est comme neuve.', [['tp', 'str', 3]]], [20, 'Il a un peu trop poncé. Elle est plus légère, mais plus fragile.', [['tp', 'agi', 1]]]] },
   { l: 'Aiguiser toi-même', by: 'str', o: [[50, 'Tu y passes l’heure, et tu y prends goût.', [['tp', 'str', 2]]], [50, 'Tu t’entailles le pouce. Le forgeron éclate de rire.', [['hp', -0.05]]]] }] },
{ id: 'diseuse', min: 0, ic: 'amulet', t: 'La diseuse de bonne aventure', x: ['Une vieille femme assise sur un tabouret regarde les lignes de ta main. Elle ne dit rien pendant longtemps.', '« Cinq sesterces, et je te dis ce que les dieux m’ont soufflé. »'],
  ch: [{ l: 'Écouter ce qu’elle voit', cost: 5, o: [[35, '« Un grand combat t’attend, et tu ne le perdras pas seul. » Elle sourit. Tu te sens plus léger.', [['bless', 10]]], [25, '« Tu seras libre, mais pas comme tu crois. » Elle ne veut rien ajouter.', [['xp', 6]]], [25, '« Méfie-toi du jour où tout te réussira. » Tu fronces les sourcils.', []], [15, 'Elle garde le silence, rend la pièce et te chasse d’un geste.', [['g', 5]]]] },
   { l: 'Passer', o: [[1, 'Tu préfères ne pas savoir.', []]] }] },
{ id: 'jongleur', min: 0, ic: 'dice', t: 'Le jongleur', x: ['Un jongleur de rue a réussi à se faufiler jusqu’à la cour. Cinq poignards tournent dans l’air.', '« Qui veut essayer ? »'],
  ch: [{ l: 'Essayer', by: 'agi', o: [[40, 'Tu en rattrapes deux, puis trois. Le jongleur applaudit : « Tu as des mains ! »', [['tp', 'agi', 3]]], [60, 'Un poignard te frôle le pied. Plus de peur que de mal.', [['hp', -0.04], ['tp', 'agi', 1]]]] },
   { l: 'Regarder', o: [[1, 'Tu observes ses gestes. Il y a quelque chose à prendre dans cette précision.', [['tp', 'agi', 1]]]] }] },
{ id: 'tablettes', min: 1, ic: 'scroll', t: 'Les tablettes du lettré', x: ['Un esclave lettré vend sous le manteau des tablettes de cire. Tes yeux s’arrêtent sur un titre : « De l’art d’éviter les coups ».', '« Vingt sesterces. Je les ai copiées moi-même. »'],
  ch: [{ l: 'Les acheter', cost: 20, o: [[60, 'Des schémas précis de gardes et d’esquives. Tu les apprends par cœur.', [['xp', 12]]], [25, 'La moitié est illisible, le reste dit des évidences.', [['xp', 3]]], [15, 'C’est une recette de ragoût.', []]] },
   { l: 'Refuser', o: [[1, 'Tu ne sais pas lire de toute façon.', []]] }] },
{ id: 'vin', min: 0, ic: 'bread', t: 'Le tonneau de vin', x: ['Un tonneau de vin mal bouché trône dans l’ombre de la cuisine. Un garde ferme les yeux.', '« Huit sesterces la coupe. Pour le courage. »'],
  ch: [{ l: 'Boire une coupe', cost: 8, o: [[50, 'La chaleur te monte au cœur. Tu veux te battre contre le ciel.', [['bless', 10]]], [30, 'Ça te rend joyeux, rien de plus.', []], [20, 'Trois coupes plus tard, la cour tourne.', [['hp', -0.1]]]] },
   { l: 'Refuser', o: [[1, 'Tu gardes la tête claire.', [['honor', 1]]]] }] },
{ id: 'rats', min: 0, ic: 'dice', t: 'La course de rats', x: ['Des esclaves ont lâché deux rats sur une planche inclinée. Les paris montent.', '« Six sesterces sur le gris ! » crie quelqu’un. Le rat roux a l’air plus vif.'],
  ch: [{ l: 'Parier sur le gris', cost: 6, o: [[45, 'Le gris prend la tête dans les trois dernières coudées. Tu gagnes le double.', [['g', 12]]], [55, 'Le roux était pipé de bonne naissance.', []]] },
   { l: 'Parier sur le roux', cost: 6, o: [[55, 'Le roux bondit sur la ligne. Les rats ont un instinct sûr.', [['g', 12]]], [45, 'Le gris le dépasse dans un couinement ridicule.', []]] },
   { l: 'Regarder sans parier', o: [[1, 'Tu ris pour la première fois depuis des jours.', [['honor', 1]]]] }] },{ id: 'garde_chat', min: 0, ic: 'bread', t: 'Le chat du ludus', x: ['Un chat maigre vient se frotter contre tes chevilles, comme s’il te connaissait.', 'Tu as un bout de lard dans la poche.'],
  ch: [{ l: 'Partager ton lard', o: [[65, 'Il ronronne comme une forge. Pendant une heure, tu oublies où tu es.', [['hp', 0.15], ['honor', 1]]], [35, 'Il avale tout et disparaît sans un regard. Les chats ne remercient pas.', []]] },
   { l: 'Le chasser', o: [[1, 'Il file sous une porte. Tu as gardé ton lard, mais pas ta conscience tranquille.', [['honor', -1]]]] }] },
{ id: 'garde_inspection', min: 0, ic: 'scroll', t: 'L’inspection', x: ['Les gardes fouillent les cellules une à une. Dans la tienne, il y a… tout ce que tu as trouvé depuis ton arrivée.', 'Ils approchent.'],
  ch: [{ l: 'Cacher tes affaires', by: 'agi', o: [[55, 'Tu as caché tes trouvailles juste à temps. Ils repartent bredouilles.', [['xp', 4]]], [45, 'Ils trouvent ta cache et empochent une part. Le reste est à toi.', [['g', -14]]]] },
   { l: 'Les laisser faire', o: [[1, 'Ils fouillent, râlent et repartent. Tu n’avais pas grand-chose à perdre.', []]] }] },
{ id: 'garde_ordre', min: 1, ic: 'spear', t: 'L’ordre du garde-chef', x: ['Le garde-chef t’arrête sur le chemin du réfectoire. Il a l’air de mauvaise humeur.', '« Toi. Tu as l’air de savoir tenir un balai. Les écuries sont dégoûtantes. »'],
  ch: [{ l: 'Nettoyer les écuries', o: [[70, 'Deux heures de fumier et d’odeur. Il te glisse quelques pièces, sans te regarder.', [['g', 14]]], [30, 'Un cheval t’envoie un coup de sabot. Le garde rit.', [['g', 8], ['hp', -0.1]]]] },
   { l: 'Refuser poliment', by: 'str', o: [[40, 'Il te regarde de haut en bas. « Un gladiateur, ça sait dire non. Bien. » Il passe.', [['glo', 3]]], [60, 'Il te colle deux jours de pain sec.', [['hp', -0.1]]]] }] },
{ id: 'garde_confidence', min: 1, ic: 'scroll', t: 'Le garde qui parle trop', x: ['Un jeune garde, nouveau au ludus, a trop bu. Il s’assoit près de toi, désabusé.', '« Mon père voulait que je sois soldat. Je suis gardien de tes semblables. Tu le crois, ça ? »'],
  ch: [{ l: 'Le consoler', o: [[60, 'Il t’avoue des choses qu’il ne devrait pas. Tu retiens une faille dans les rondes.', [['xp', 6], ['honor', 1]]], [40, 'Il se reprend, honteux, et te fait garder la cour au pain sec.', [['hp', -0.05]]]] },
   { l: 'Te lever sans un mot', o: [[1, 'Tu n’as pas de temps pour les confidences d’un geôlier.', []]] }] },
{ id: 'garde_amende', min: 0, ic: 'scroll', t: 'L’amende injuste', x: ['Un garde t’accuse d’avoir volé du pain. C’est faux, mais il est le seul témoin.', '« Quinze sesterces, ou deux jours de cachot. À toi de voir. »'],
  ch: [{ l: 'Payer l’amende', cost: 15, o: [[1, 'Il empoche et s’éloigne. L’injustice a un prix, et tu viens de le payer.', []]] },
   { l: 'Contester', by: 'agi', o: [[35, 'Tu plaides si bien qu’il abandonne, agacé.', [['honor', 1], ['xp', 4]]], [65, 'Il n’aime pas qu’on lui réponde. Tu finis au cachot.', [['hp', -0.15], ['g', -5]]]] }] },
{ id: 'lanista_visite', min: 1, ic: 'scroll', t: 'La visite du lanista', x: ['{lanista} traverse la cour avec un scribe. Il s’arrête devant toi, les mains dans le dos.', '« On parle de toi à l’extérieur. Continue, et je te trouverai un meilleur logement. Déçois-moi, et… »'],
  ch: [{ l: 'Le fixer sans ciller', o: [[60, 'Il hoche la tête, presque approbateur. « Voilà un regard qui vaut de l’or. »', [['glo', 5]]], [40, 'Il t’ignore et passe à ton voisin.', []]] },
   { l: 'Baisser la tête', o: [[1, 'Il ne dit rien. Tu as évité les ennuis.', []]] }] },
{ id: 'lanista_prime', min: 2, ic: 'chest', t: 'La prime du lanista', x: ['Le lanista fait battre un tambour : une prime sera offerte au gladiateur qui fera le plus de bruit aux prochains jeux.', '« Bruit, c’est-à-dire public. Les gradins, mes amis. Les gradins. »'],
  ch: [{ l: 'Promettre un grand spectacle', o: [[1, 'Il te fait un clin d’œil. La foule sera à toi.', [['bless', 20]]]] },
   { l: 'Se moquer de la prime', o: [[1, 'Quelques rires dans la cour. Il t’a vu, et il ne rit pas.', [['honor', 1]]]] }] },
{ id: 'lanista_cadeau', min: 3, ic: 'chest', t: 'Un cadeau étrange', x: ['{lanista} t’envoie un coffret par un esclave. Dedans, un mot : « Pour le prix que tu vaudras demain. »', 'Rien d’autre, sinon un objet soigneusement emballé.'],
  ch: [{ l: 'Ouvrir', o: [[65, 'Un objet de qualité. Il t’en offrira d’autres si tu continues.', [['loot', 1]]], [35, 'Des bandages, du sel, une potion. Des soins plus que des armes.', [['hp', 0.5]]]] },
   { l: 'Refuser de l’ouvrir', o: [[1, 'Tu le renvoies. Il le prendra comme une insulte ou comme un respect. Impossible de savoir.', [['honor', 1]]]] }] },
{ id: 'maitre_armes_defi', min: 0, ic: 'spear', cond: ['safe'], t: 'Le défi du maître d’armes', x: ['Le maître d’armes t’interpelle en plein exercice, une épée de bois à la main.', '« Toi. Montre-moi ce que tu as appris. Je te garantis que tu vas souffrir. »'],
  ch: [{ l: 'Relever le défi', by: 'agi', o: [[40, 'Tu pares, tu esquives, tu frappes enfin. Il recule, impressionné.', [['xp', 10], ['tp', 'r', 3]]], [60, 'Il te met au sol cinq fois en trois minutes. Il te tend la main à la fin.', [['hp', -0.2], ['tp', 'r', 2]]]] },
   { l: 'Refuser', o: [[1, 'Il crache par terre. « Poule mouillée. » Tu t’en remettras.', []]] }] },
{ id: 'maitre_armes_secret', min: 2, ic: 'spear', t: 'Le coup du maître d’armes', x: ['Après l’entraînement, le maître d’armes te retient. Il baisse la voix.', '« Je ne montre ça qu’à ceux qui le méritent. Un coup que mon père m’a appris. Mais ça se paie. »'],
  ch: [{ l: 'Payer pour l’apprendre', cost: 40, o: [[70, 'Il te montre un enchaînement vicieux. Tes bras s’en souviendront.', [['tp', 'r', 6], ['xp', 8]]], [30, 'Il t’apprend… à mieux respirer. Utile, mais pas ce qu’il avait promis.', [['tp', 'end', 3]]]] },
   { l: 'Refuser', o: [[1, 'Il hausse les épaules. L’offre ne reviendra pas ce soir.', []]] }] },
{ id: 'cuisinier_pain', min: 0, ic: 'bread', t: 'Le pain du cuisinier', x: ['Le cuisinier est de bonne humeur. Il te lance un pain encore chaud.', '« Pour le gladiateur le plus gras de la région. Allez, mange, tu en as besoin. »'],
  ch: [{ l: 'Le manger', o: [[1, 'Il est encore tiède. Le monde te semble moins dur.', [['hp', 0.2]]]] },
   { l: 'Le partager', o: [[1, 'Les esclaves autour de toi n’en croient pas leurs yeux. Tu gagnes un peu de respect.', [['honor', 1], ['glo', 2]]]] }] },
{ id: 'puits', min: 0, ic: 'scroll', t: 'Le seau du puits', x: ['Un esclave porte un seau trop lourd vers les cuisines. Il trébuche près de toi.', 'L’eau se répand sur le sol. Il lève vers toi un regard terrorisé.'],
  ch: [{ l: 'L’aider à le porter', o: [[70, 'Il te remercie à voix basse. « Si tu as besoin d’un service, un jour… »', [['honor', 1], ['xp', 3]]], [30, 'Un garde te voit et te réprimande, mais l’esclave t’a souri.', [['honor', 1]]]] },
   { l: 'Ne pas t’en mêler', o: [[1, 'Tu passes ton chemin. L’eau sèche vite.', []]] }] },
{ id: 'meurtrier', min: 2, ic: 'spear', cond: ['safe'], t: 'La dispute au couteau', x: ['Deux esclaves, gamelle contre gamelle, se sont sorti des couteaux. Les gardes arrivent mais pas assez vite.', 'Ils sont tout près de toi.'],
  ch: [{ l: 'Intervenir', by: 'str', o: [[45, 'Tu désarmes l’un, tu retiens l’autre. Les gardes arrivent. Le ludus parle de toi.', [['glo', 6], ['honor', 1]]], [55, 'Tu prends un coup de couteau dans le bras, mais tout le monde recule.', [['hp', -0.2], ['glo', 3]]]] },
   { l: 'Te mettre à l’abri', o: [[1, 'Tu attends que ça passe. Quelqu’un a été blessé, sans toi.', [['honor', -1]]]] }] },{ id: 'malade', min: 0, ic: 'bread', t: 'L’esclave qui grelotte', x: ['Dans un coin de la cour, un esclave grelotte de fièvre. Il n’a rien mangé depuis hier.', 'Tu as un reste de pain.'],
  ch: [{ l: 'Partager ton pain', o: [[60, 'Il murmure un merci, et plus tard glisse quelques pièces sous ta paillasse.', [['g', 12], ['honor', 1]]], [40, 'Il avale tout sans un mot. Tu n’en tires rien, sinon la conscience tranquille.', [['honor', 1]]]] },
   { l: 'Passer', o: [[1, 'Tu détournes les yeux. Ici, on apprend vite.', []]] }] },
{ id: 'tunnel', min: 1, ic: 'scroll', cond: ['safe'], t: 'La dalle qui bouge', x: ['Derrière les latrines, une dalle bouge sous ton pied. Un tunnel, qui mène peut-être aux égouts de la ville.', 'Personne ne regarde.'],
  ch: [{ l: 'Ramper dans le tunnel', o: [[35, 'Tu ressors dans un entrepôt vide… avec une bourse oubliée sur une caisse. Tu es de retour avant l’appel.', [['g', 45]]], [65, 'Les gardes t’attendent au bout. Le fouet est généreux.', [['hp', -0.3], ['g', -15]]]] },
   { l: 'Remettre la dalle', o: [[1, 'Tu replaces la pierre et t’éloignes, le cœur battant.', []]] }] },
{ id: 'fortuna', min: 0, ic: 'amulet', t: 'Le prêtre de Fortuna', x: ['Un prêtre de Fortuna longe les cellules, un bol d’encens à la main.', '« Une offrande, et la déesse t’éclairera pour ton prochain combat. »'],
  ch: [{ l: 'Faire une offrande', cost: 20, o: [[70, 'La fumée monte droit. Fortuna te sourit.', [['bless', 15]]], [30, 'La déesse reste muette. Le prêtre empoche l’offrande avec le sourire.', []]] },
   { l: 'Refuser', o: [[1, 'Tu regardes le prêtre s’éloigner.', []]] }] },
{ id: 'lecon', min: 0, ic: 'spear', cond: ['safe'], t: 'La leçon à la dure', x: ['Un vieux gladiateur boiteux te regarde t’entraîner depuis un moment.', '« Mauvaise garde. Viens, je vais te la corriger. Ça va faire mal. »'],
  ch: [{ l: 'Accepter la leçon', o: [[65, 'Il te frappe vingt fois au même endroit jusqu’à ce que tu comprennes.', [['tp', 'r', 4], ['xp', 6]]], [35, 'Mauvais jour : il t’envoie au sol trois fois de suite. Tu retiens la leçon, et les bleus.', [['hp', -0.22]]]] },
   { l: 'Décliner poliment', o: [[1, 'Il crache par terre et retourne à sa boiterie.', []]] }] },
{ id: 'bagarre', min: 0, ic: 'spear', cond: ['safe'], t: 'La bagarre de la cour', x: ['Deux esclaves se battent pour une gamelle. Les gardes regardent ailleurs.'],
  ch: [{ l: 'Les séparer', o: [[55, 'Ils te regardent avec respect, et le ludus en parle ce soir.', [['glo', 6], ['honor', 1]]], [45, 'Un coup de coude que tu n’avais pas vu venir.', [['hp', -0.18]]]] },
   { l: 'Regarder', o: [[1, 'Tu observes leurs déplacements.', [['tp', 'agi', 2]]]] }] },
{ id: 'chant', min: 0, ic: 'amulet', t: 'La chanson du soir', x: ['Quelqu’un entonne une vieille chanson dans la cour, un air de chez toi, ou presque. D’autres voix reprennent.', 'La nuit tombe. Plus personne ne parle.'],
  ch: [{ l: 'Chanter avec eux', o: [[1, 'Pendant quelques minutes, ce n’est plus un ludus, c’est un village.', [['hp', 0.15], ['honor', 1]]]] },
   { l: 'Écouter en silence', o: [[1, 'Tu fermes les yeux. L’air te porte loin.', [['xp', 4]]]] }] },
{ id: 'couture', min: 0, ic: 'scroll', t: 'La couturière', x: ['Une vieille esclave reprise des tuniques à la lueur d’une lampe. Elle remarque ta manche déchirée.', '« Donne. Je te la reprise pour rien. Mais tu me dois une histoire. »'],
  ch: [{ l: 'Raconter une histoire', o: [[70, 'Elle écoute en souriant. Elle te donne un petit bout de lin porte-bonheur.', [['bless', 8], ['honor', 1]]], [30, 'Tu bafouilles. Elle rit, et répare quand même.', []]] },
   { l: 'Décliner', o: [[1, 'Tu gardes ta manche déchirée, et ton silence.', []]] }] },
{ id: 'orage', min: 0, ic: 'scroll', t: 'L’orage', x: ['Le tonnerre roule sur le ludus. L’eau tombe en nappes dans la cour, et les toits fuient.', 'Il y a de quoi s’abriter, mais aussi de quoi s’entraîner dans la boue.'],
  ch: [{ l: 'T’entraîner sous la pluie', o: [[55, 'Tes pieds glissent, tes muscles hurlent. Tu en sors plus solide.', [['tp', 'end', 3]]], [45, 'Tu glisses et t’écrases dans la boue. Tu ris malgré toi.', [['hp', -0.08], ['tp', 'agi', 1]]]] },
   { l: 'T’abriter', o: [[1, 'Tu dors un peu, au chaud. Ça fait du bien.', [['hp', 0.2]]]] }] },
{ id: 'rumeur_rival', min: 0, ic: 'spear', t: 'La rumeur sur ton rival', x: ['Dans la cuisine, on murmure que {rival} s’entraîne en secret la nuit, avec un maître que personne ne connaît.', 'Un esclave te regarde, attendant ta réaction.'],
  ch: [{ l: 'T’entraîner plus dur', o: [[1, 'Tu y passes la soirée. Si l’autre se prépare, tu te prépareras mieux.', [['tp', 'r', 3], ['hp', -0.06]]]] },
   { l: 'Ignorer les ragots', o: [[1, 'Tu as appris à ne pas croire tout ce qui se dit.', [['honor', 1]]]] }] },
{ id: 'pieds_nus', min: 0, ic: 'scroll', t: 'Les pieds nus', x: ['Un esclave plus âgé te regarde marcher sur les dalles froides.', '« Tes pieds saignent. Tu n’as pas l’habitude, hein ? Je peux te montrer comment marcher sans tomber. »'],
  ch: [{ l: 'Apprendre', o: [[75, 'Il te montre comment poser chaque pied. Tu t’en tires mieux.', [['tp', 'agi', 3]]], [25, 'Il se moque de toi. Tu apprends quand même.', [['tp', 'agi', 1]]]] },
   { l: 'Décliner', o: [[1, 'Tu préfères apprendre par toi-même.', []]] }] },
{ id: 'lettre', min: 1, ic: 'scroll', t: 'La lettre qui n’est pas pour toi', x: ['Un messager te remet par erreur une lettre cachetée, destinée à un autre gladiateur. Elle sent le parfum.', 'Tu pourrais l’ouvrir. Personne ne le saurait.'],
  ch: [{ l: 'La lire', o: [[50, 'Une femme promet à un inconnu de l’attendre. Tu te sens mal, mais tu retiens un nom.', [['honor', -1], ['xp', 5]]], [50, 'Une dette et des menaces. Tu refermes vite, troublé.', [['honor', -1]]]] },
   { l: 'La remettre à son destinataire', o: [[1, 'Il t’adresse un regard reconnaissant. Quelque chose a changé entre vous.', [['honor', 1], ['glo', 3]]]] }] },
{ id: 'danse', min: 0, ic: 'amulet', t: 'La fête de la Saturnale', x: ['Pendant une nuit par an, les esclaves ont le droit de rire sans crainte. Les gardes ferment les yeux, le vin coule.', 'Une danse commence dans la cour.'],
  ch: [{ l: 'Danser jusqu’à l’aube', o: [[70, 'Tu danses, tu ris, tu oublies tout. Le lendemain, tu as mal aux jambes, mais pas au cœur.', [['hp', 0.2], ['honor', 1]]], [30, 'Tu tombes d’épuisement à minuit. Le plaisir valait l’effort.', [['hp', 0.1]]]] },
   { l: 'T’entraîner pendant ce temps', o: [[1, 'Tu t’isoles et tu forges ton corps pendant que les autres chantent.', [['tp', 'r', 3]]]] }] },{ id: 'rival_defi', min: 1, ic: 'spear', t: 'Un mot de {rival}', x: ['Un esclave te remet un morceau de poterie gravé : « Je t’attends en haut. Ne me fais pas perdre mon temps. — {rival} »'],
  ch: [{ l: 'Graver une réponse', o: [[1, 'Tu écris : « Je viens. » Court, mais ça pèse.', [['glo', 3]]]] },
   { l: 'Briser le tesson', o: [[1, 'Tu écrases le message sous ton pied. Tu t’entraînes plus fort ce soir.', [['tp', 'r', 3]]]] }] },
{ id: 'rival_sabotage', min: 2, ic: 'scroll', cond: ['!flag:sabot'], t: 'Le sabotage', x: ['Ton arme a un défaut que tu n’avais pas vu : la sangle est à moitié coupée.', 'Quelqu’un voulait que tu tombes en plein combat.'],
  ch: [{ l: 'Accuser {rival}', o: [[40, 'Le maître d’armes prend note. {rival} reçoit un avertissement.', [['honor', 1], ['flag', 'sabot']]], [60, 'Pas de preuve. Les gardes rient de ton accusation.', [['honor', -1]]]] },
   { l: 'Réparer en silence', o: [[1, 'Tu répares en silence. Le message est reçu des deux côtés.', [['xp', 6], ['flag', 'sabot']]]] }] },
{ id: 'rival_offre', min: 2, ic: 'chest', t: 'La main tendue', x: ['{rival} s’assied près de toi au réfectoire pour la première fois. Ni sourire, ni défi.', '« Une alliance temporaire. Je te laisse tranquille avant le duel, et toi de même. Cinquante sesterces chacun, en gage. »'],
  ch: [{ l: 'Accepter', cost: 50, o: [[55, '{rival} tient parole. Quelques semaines de répit, et il te respecte pour ça.', [['glo', 8], ['honor', 1]]], [45, 'À peine parti, {rival} raconte au ludus que tu as demandé la paix. Ta réputation en prend un coup.', [['glo', -4]]]] },
   { l: 'Cracher par terre', o: [[1, 'Il hausse un sourcil, puis sourit à peine. Le duel sera sans pitié.', [['honor', 1]]]] }] },
{ id: 'rival_blessure', min: 3, ic: 'amulet', t: 'La blessure de {rival}', x: ['On raconte que {rival} s’est blessé à l’épaule en s’entraînant. Il le cache.', 'Une chance, peut-être. Ou une obligation de ne pas frapper un homme à terre.'],
  ch: [{ l: 'Ne rien dire, en profiter', o: [[1, 'Tu gardes le secret. Ça pèsera au moment du duel.', [['bless', 12], ['honor', -1]]]] },
   { l: 'Lui envoyer des bandages', o: [[1, 'Tu fais livrer des bandages, sans nom. Il sait d’où ils viennent.', [['honor', 2], ['glo', 4]]]] }] },
{ id: 'foule_fan', min: 1, ic: 'amulet', t: 'Un enfant à la grille', x: ['À la sortie de l’arène, un enfant agrippe les barreaux : « C’est toi ! Je t’ai vu hier ! »', 'Il te tend un petit pain.'],
  ch: [{ l: 'Prendre le pain', o: [[1, 'Il rayonne. Pour lui, tu es déjà un héros.', [['hp', 0.2], ['glo', 2]]]] },
   { l: 'Lui donner ta pièce', o: [[1, 'Il court la montrer à sa mère. La nouvelle fait le tour du quartier.', [['g', -4], ['glo', 5], ['honor', 1]]]] }] },
{ id: 'poete', min: 2, ic: 'scroll', t: 'Le poète des gradins', x: ['Un poète à tunique rapiécée t’aborde : « Une ode pour dix sesterces. Elle sera déclamée dans toute la ville. »'],
  ch: [{ l: 'Commander l’ode', cost: 10, o: [[60, 'Les rimes sont mauvaises mais la foule adore. Ton nom circule.', [['glo', 10]]], [40, 'Il l’a vendue aussi à ton rival. Les deux sont presque identiques.', [['glo', 2]]]] },
   { l: 'Refuser', o: [[1, 'Il soupire et part chercher un client plus généreux.', []]] }] },
{ id: 'matrone_billet', min: 3, ic: 'chest', t: 'Le billet parfumé', x: ['Un billet parfumé te parvient, scellé de cire rouge : une matrone te propose de venir « discuter de ta carrière » dans sa litière.'],
  ch: [{ l: 'Y aller', o: [[50, 'Elle t’offre un cadeau pour ton prochain duel. Tu n’en dis rien à personne.', [['loot', 1]]], [50, 'Rien qu’un long dîner d’éloges et de rumeurs. Tu rentres flatté, c’est déjà ça.', [['glo', 6]]]] },
   { l: 'Décliner', o: [[1, 'Tu ne mélanges pas la sueur et les parfums.', [['honor', 1]]]] }] },
{ id: 'scribe_cote', min: 2, ic: 'scroll', t: 'Le scribe des cotes', x: ['Un scribe taille ses plumes à l’entrée de l’arène. Il note les résultats de tous les gladiateurs de la ville.', '« Cinq sesterces pour connaître celui qui te surveille le plus de près. »'],
  ch: [{ l: 'Payer', cost: 5, o: [[1, 'Un nom, un style de combat, une faiblesse. De quoi mieux s’y préparer.', [['bless', 10], ['xp', 3]]]] },
   { l: 'Ignorer', o: [[1, 'Tu préfères te battre sans connaître.', []]] }] },
{ id: 'jaloux', min: 2, ic: 'spear', cond: ['safe'], t: 'Un jaloux dans les couloirs', x: ['Un gladiateur plus âgé te barre le passage. « On parle trop de toi, petit. » Il bombe le torse.'],
  ch: [{ l: 'Le défier du regard', by: 'str', o: [[50, 'Il cède et grommelle. Tu as marqué un point devant les autres.', [['glo', 5]]], [50, 'Il te pousse contre le mur. Tu retiens l’affront.', [['hp', -0.1], ['honor', 1]]]] },
   { l: 'Contourner', o: [[1, 'Tu passes. Il crache dans ton dos.', []]] }] },
{ id: 'ex_champion', min: 4, ic: 'amulet', t: 'L’ancien champion', x: ['Un vieil homme au dos voûté te regarde t’entraîner. Un champion d’il y a vingt ans, dit-on, libéré depuis longtemps et revenu au ludus comme balayeur.', '« Je te vois te battre. Tu fais une erreur. Veux-tu que je te la montre ? »'],
  ch: [{ l: 'Écouter', o: [[80, 'Il te corrige en trois phrases. Tu comprends pourquoi on parlait de lui.', [['tp', 'r', 6], ['xp', 10]]], [20, 'Il radote sur des combats que personne ne se rappelle. Tu l’écoutes quand même.', [['honor', 1]]]] },
   { l: 'Poursuivre ton entraînement', o: [[1, 'Il hausse les épaules. Les vieux champions ont l’habitude qu’on ne les écoute pas.', []]] }] },
{ id: 'aveu', min: 3, ic: 'scroll', t: 'Un aveu en pleine nuit', x: ['{rival} t’aborde, hors de la vue des gardes, les mains vides.', '« Je n’en peux plus de ce jeu. Si je gagne, je ne suis pas libre. Si tu gagnes, tu ne l’es pas non plus. Tu y crois, toi ? »'],
  ch: [{ l: 'Répondre que oui', o: [[1, 'Il sourit avec amertume. « Alors montre-moi. »', [['honor', 1], ['xp', 6]]]] },
   { l: 'Répondre que non', o: [[1, 'Il hoche la tête. Quelque chose a changé entre vous.', [['honor', 1], ['glo', 3]]]] }] },
{ id: 'ruse_gradins', min: 2, ic: 'dice', t: 'Un homme dans les gradins', x: ['Un homme en tunique fine te fait signe : il connaît quelqu’un qui connaît quelqu’un. Pour trente sesterces, il peut « faciliter » ton prochain combat.'],
  ch: [{ l: 'Payer', cost: 30, o: [[45, 'Ton adversaire arrive fatigué. Tu n’as rien demandé de plus.', [['bless', 25], ['honor', -1]]], [55, 'Il a pris l’argent. Rien ne se passe.', [['honor', -1]]]] },
   { l: 'Refuser', o: [[1, 'Tu veux gagner à la loyale. Ou au moins en avoir l’air.', [['honor', 1]]]] }] },{ id: 'comp_conte', min: 0, ic: 'bread', cond: ['met'], t: '{c} te raconte', x: ['{c} s’assied près de toi à la tombée du jour.', '« Tu sais d’où je viens ? Je ne l’ai jamais dit à personne. »'],
  ch: [{ l: 'L’écouter jusqu’au bout', o: [[1, '{Il} parle longtemps. Quand {il} finit, vous avez tous deux l’air plus léger.', [['hp', 0.2], ['honor', 1]]]] },
   { l: 'Parler de toi à ton tour', o: [[1, 'Tu racontes ce que tu n’as jamais dit. Ce soir, vous n’êtes plus seuls.', [['xp', 6], ['honor', 1]]]] }] },
{ id: 'comp_defi', min: 1, ic: 'spear', cond: ['met', 'safe'], t: '{c} te défie', x: ['{c} te lance une branche de bois : « Un duel amical. Perdant fait la vaisselle ce soir. »'],
  ch: [{ l: 'Relever', by: 'agi', o: [[50, 'Tu gagnes de peu. {c} proteste en riant, la tête dans les mains.', [['tp', 'agi', 2], ['honor', 1]]], [50, '{c} gagne et fanfaronne toute la soirée.', [['tp', 'agi', 3], ['hp', -0.04]]]] },
   { l: 'Décliner', o: [[1, '{c} fait la moue, puis éclate de rire.', []]] }] },
{ id: 'comp_cadeau', min: 1, ic: 'amulet', cond: ['bond'], t: 'Le cadeau de {c}', x: ['{c} te tend un petit objet taillé dans l’os, une figurine grossière.', '« Pour que tu reviennes toujours. »'],
  ch: [{ l: 'La garder sur toi', o: [[1, 'Elle ne pèse rien, et pourtant elle compte.', [['bless', 10], ['honor', 1]]]] },
   { l: 'La donner à quelqu’un d’autre', o: [[1, '{c} fait semblant de ne rien voir, mais sourit.', [['honor', 2]]]] }] },
{ id: 'comp_malade', min: 1, ic: 'potion', cond: ['met', 'gold:20'], t: '{c} est souffrant{e}', x: ['{c} n’a pas quitté sa paillasse de la matinée. {Il} a le front brûlant.', 'Un guérisseur demande vingt sesterces.'],
  ch: [{ l: 'Payer le guérisseur', cost: 20, o: [[80, '{c} se remet vite. {Il} te doit une fière chandelle.', [['honor', 2], ['flag', 'saved']]], [20, 'Le traitement fait peu. Vous veillez toute la nuit.', [['honor', 1]]]] },
   { l: 'Veiller {c} toi-même', o: [[1, 'Tu restes. La fièvre cède à l’aube.', [['hp', -0.05], ['honor', 1]]]] }] },
{ id: 'comp_dispute', min: 1, ic: 'scroll', cond: ['met'], t: 'Une dispute avec {c}', x: ['Un mot de trop, un sous-entendu, et {c} se braque. {Il} te tourne le dos au milieu du repas.'],
  ch: [{ l: 'T’excuser', o: [[1, 'Un silence, puis un rire gêné. Ça passe.', [['honor', 1]]]] },
   { l: 'Tenir ta position', o: [[60, '{c} finit par revenir, un peu bougon.', []], [40, '{c} ne t’adresse plus la parole pendant plusieurs jours.', [['honor', -1]]]] }] },
{ id: 'comp_idee', min: 2, ic: 'scroll', cond: ['met'], t: 'Le plan de {c}', x: ['{c} a repéré un recoin du ludus où personne ne regarde. « Une cache. Pour tes affaires, tes pièces. »'],
  ch: [{ l: 'Y cacher de l’argent', cost: 20, o: [[1, 'Le lendemain, la cache a rapporté un peu. {c} est fier{e} de son plan.', [['g', 35]]]] },
   { l: 'Ne pas t’y fier', o: [[1, '{c} hausse les épaules, mais l’idée vous reste en tête.', []]] }] },
{ id: 'comp_nuit', min: 2, ic: 'amulet', cond: ['bond'], t: 'La veillée', x: ['La nuit avant les jeux, {c} te rejoint dans ta cellule et s’assied par terre sans rien dire.', 'Vous restez longtemps ainsi.'],
  ch: [{ l: 'Rester éveillé avec {il}', o: [[1, 'Quand le jour se lève, tu te sens prêt.', [['bless', 15], ['hp', 0.1]]]] },
   { l: 'Dormir quand même', o: [[1, '{c} reste à côté de toi, jusqu’au matin.', [['hp', 0.25]]]] }] },
{ id: 'comp_rumeur', min: 2, ic: 'scroll', cond: ['met'], t: 'Ce que murmure {c}', x: ['{c} te rejoint, essoufflé{e}. « J’ai entendu les gardes parler. Quelque chose se prépare au ludus. »'],
  ch: [{ l: 'En savoir plus', by: 'agi', o: [[50, 'Tu apprends qu’un riche visiteur observe tes combats.', [['glo', 6]]], [50, 'Rien de concret. Mais tu as appris à écouter.', [['xp', 4]]]] },
   { l: 'Laisser tomber', o: [[1, 'Les rumeurs vont et viennent.', []]] }] },
{ id: 'comp_peur', min: 3, ic: 'bread', cond: ['met'], t: 'La peur de {c}', x: ['{c} tremble en te regardant te préparer pour l’arène.', '« Si tu ne reviens pas… je ne sais pas ce que je ferais. »'],
  ch: [{ l: 'Rassurer {c}', o: [[1, 'Tu promets de revenir. Tu le feras.', [['honor', 1], ['bless', 8]]]] },
   { l: 'Ne rien dire', o: [[1, 'Le silence pèse lourd.', []]] }] },
{ id: 'comp_sauve', min: 3, ic: 'spear', cond: ['met', 'safe'], t: 'Quand {c} se fait attraper', x: ['Un garde tient {c} par le col. « Il a volé du vin ! Un jour de cachot ! »', '{c} te cherche des yeux.'],
  ch: [{ l: 'Prendre sa défense', by: 'str', o: [[50, 'Le garde recule. {c} t’adresse un regard de gratitude.', [['honor', 2], ['flag', 'saved']]], [50, 'Le garde te frappe. {c} est relâché, mais te doit quelque chose.', [['hp', -0.15], ['honor', 1]]]] },
   { l: 'Ne pas bouger', o: [[1, '{c} passe la nuit au cachot. Il ne te regarde plus de la même façon.', [['honor', -2]]]] }] },{ id: 'capt_cicatrice', min: 0, ic: 'amulet', cond: ['origin:capt'], t: 'Le chant de ta tribu', x: ['Un vent venu du nord porte une odeur de pin et de fumée. Tu fermes les yeux : tu entends presque le chant de ta tribu.'],
  ch: [{ l: 'Fredonner à voix basse', o: [[1, 'Les larmes ne viennent pas, mais la rage oui. Elle te nourrit.', [['tp', 'str', 3], ['bless', 8]]]] },
   { l: 'Chasser le souvenir', o: [[1, 'Il faut survivre d’abord. Pleurer ensuite.', [['xp', 5]]]] }] },
{ id: 'capt_ancien', min: 1, ic: 'spear', cond: ['origin:capt'], t: 'Un ancien de ta tribu', x: ['Au détour d’un couloir, un homme plus âgé te dévisage. Il parle ta langue, avec un accent d’un village voisin.', '« Je savais que tu viendrais ici. Les combattants comme toi finissent tous ici. »'],
  ch: [{ l: 'Parler avec lui', o: [[70, 'Il t’apprend un vieux geste de guerre que les Romains ne connaissent pas.', [['tp', 'str', 5], ['xp', 8]]], [30, 'Il pleure plus qu’il ne parle. Tu restes avec lui.', [['honor', 2]]]] },
   { l: 'T’éloigner', o: [[1, 'Il baisse la tête. Tu portes enfin ta part de honte.', [['honor', -1]]]] }] },
{ id: 'debt_creancier', min: 0, ic: 'scroll', cond: ['origin:debt'], t: 'Les comptes d’hier', x: ['Un jeune scribe te reconnaît : il travaillait chez ton ancien créancier. Il te glisse un papier : « Ta dette est encore enregistrée. Mais il y a une erreur. »'],
  ch: [{ l: 'Vérifier l’erreur', by: 'agi', o: [[50, 'Ton ancien créancier te devait quelques pièces. Le scribe te les fait passer discrètement.', [['g', 40]]], [50, 'L’erreur n’en était pas une. Tu es juste plus triste.', []]] },
   { l: 'Brûler le papier', o: [[1, 'La dette est dans ta tête, pas sur le papier.', [['honor', 1]]]] }] },
{ id: 'debt_marche', min: 1, ic: 'dice', cond: ['origin:debt', 'gold:30'], t: 'Un tuyau de marché', x: ['Un ancien associé te fait passer un message : une cargaison de vin va arriver à bas prix, à revendre dans les gradins.', '« Trente sesterces d’avance, bénéfice assuré. »'],
  ch: [{ l: 'Investir', cost: 30, o: [[55, 'Le vin arrive. Tu le revends trois fois son prix aux supporters.', [['g', 80]]], [45, 'Le bateau n’est jamais arrivé. Ton associé non plus.', []]] },
   { l: 'Ne pas risquer', o: [[1, 'Tu as déjà perdu une fois sur un coup comme ça.', []]] }] },
{ id: 'mine_poussiere', min: 0, ic: 'bread', cond: ['origin:mine'], t: 'L’odeur de la pierre', x: ['On rénove un mur du ludus. L’odeur de la pierre mouillée te ramène à la carrière.', 'Un ouvrier maladroit lâche son burin. Tu le ramasses par réflexe.'],
  ch: [{ l: 'Aider à tailler', o: [[70, 'Tes mains se souviennent. Le contremaître te glisse quelques pièces.', [['g', 14], ['tp', 'end', 2]]], [30, 'Le contremaître t’éloigne : « Tu es un gladiateur, pas un tailleur. »', []]] },
   { l: 'Tourner le dos', o: [[1, 'Tu ne veux plus jamais toucher cette pierre.', [['xp', 4]]]] }] },
{ id: 'mine_ancien', min: 1, ic: 'spear', cond: ['origin:mine'], t: 'Un ancien forçat', x: ['Un homme boite dans la cour : tu le reconnais, vous avez partagé les chaînes pendant des années. Il a été vendu au même ludus que toi.', '« Alors c’est toi. On a tous les deux fini ici. »'],
  ch: [{ l: 'Partager un repas', o: [[1, 'Vous mangez ensemble comme dans les galeries. Il connaît tes silences.', [['hp', 0.2], ['honor', 1]]]] },
   { l: 'Garder tes distances', o: [[1, 'Vous ne vous parlerez plus.', []]] }] },
{ id: 'saturnales', min: 0, ic: 'amulet', t: 'La vente aux enchères', x: ['Dans la cour, un commissaire-priseur vante des esclaves « de qualité » à des acheteurs de passage. Tu regardes le sol.', 'L’un des acheteurs s’arrête devant toi. Il hoche la tête.'],
  ch: [{ l: 'Tenir son regard', o: [[50, 'Il note quelque chose sur sa tablette. Ton prix monte dans les carnets de la ville.', [['glo', 5]]], [50, 'Il passe son chemin. Pas assez fort pour l’intéresser.', []]] },
   { l: 'Baisser les yeux', o: [[1, 'Tu t’effaces dans la foule des cellules.', []]] }] },
{ id: 'fugitif', min: 1, ic: 'scroll', t: 'L’évadé', x: ['Un fugitif, attrapé hors des murs, est ramené par les gardes. On le fouette devant tout le monde.', 'Il croise ton regard. Tu pourrais lui glisser un morceau de pain.'],
  ch: [{ l: 'Lui donner ton pain', o: [[60, 'Un garde te voit, mais fait semblant de ne rien voir.', [['honor', 2]]], [40, 'Le garde te fouette aussi. Tu l’as mérité, pense-t-il.', [['hp', -0.1], ['honor', 2]]]] },
   { l: 'Détourner les yeux', o: [[1, 'Ce n’est pas ton combat.', [['honor', -1]]]] }] },
{ id: 'serment', min: 2, ic: 'amulet', t: 'Le serment du gladiateur', x: ['Le maître d’armes réunit les anciens pour renouveler le serment : « Je jure d’endurer le feu, les chaînes, le fouet et le fer. »', 'On te tend la coupe.'],
  ch: [{ l: 'Prêter serment', o: [[1, 'Les mots te serrent la gorge, mais tu les dis. Quelque chose en toi se fige, comme un pacte.', [['tp', 'end', 4], ['glo', 5]]]] },
   { l: 'Garder le silence', o: [[1, 'Les anciens te regardent de travers. Ils ne disent rien.', [['honor', 1]]]] }] },{ id: 'senateur', min: 4, ic: 'chest', t: 'Le sénateur curieux', x: ['Un sénateur en toge pourpre, entouré de gardes, fait une visite surprise au ludus. Il demande à voir « le gladiateur dont on parle ».'],
  ch: [{ l: 'Te présenter fièrement', o: [[55, 'Il te jauge en silence puis te remet une bourse, déçu de ne pas t’avoir fait peur.', [['g', 80], ['glo', 8]]], [45, 'Il pose une question : tu hésites. Il repart avec une moue.', [['glo', 2]]]] },
   { l: 'Rester en retrait', o: [[1, 'Il passe. Tu n’existes pas.', []]] }] },
{ id: 'sculpteur', min: 4, ic: 'amulet', t: 'Le sculpteur', x: ['Un sculpteur veut faire ton buste pour une villa de Pompéi. Trente sesterces pour la pose, et il te laisse la plus belle expression.'],
  ch: [{ l: 'Poser', cost: 30, o: [[1, 'Ton nom sera dans un jardin, pour toujours.', [['glo', 18]]]] },
   { l: 'Refuser', o: [[1, 'Il hausse les épaules et trouve un autre modèle.', []]] }] },
{ id: 'banquet', min: 4, ic: 'bread', t: 'Le banquet d’avant-jeux', x: ['La veille d’un grand jeu, le lanista offre un banquet aux gladiateurs : ragoûts, fruits, vin.', 'Les anciens disent que celui qui mange trop meurt le lendemain.'],
  ch: [{ l: 'Te goinfrer', o: [[50, 'Tu t’endors repu, plein de forces.', [['hp', 0.5]]], [50, 'Le lendemain, ton ventre te trahit.', [['hp', -0.1]]]] },
   { l: 'Manger raisonnablement', o: [[1, 'Un repas sobre. L’esprit léger.', [['hp', 0.25], ['bless', 8]]]] }] },
{ id: 'journaliste', min: 5, ic: 'scroll', t: 'Le récitant de rues', x: ['Un récitant des rues raconte tes exploits à la foule, avec quelques embellissements.', 'Il t’aperçoit et fait signe de venir.'],
  ch: [{ l: 'Corriger ses erreurs', o: [[1, 'Il est ravi : une version « vraie » de ton histoire. La foule applaudit.', [['glo', 10], ['honor', 1]]]] },
   { l: 'Le laisser broder', o: [[1, 'Ta légende grandit plus vite que toi.', [['glo', 14]]]] }] },
{ id: 'rival_ville', min: 5, ic: 'spear', cond: ['safe'], t: 'Le duelliste de passage', x: ['Un gladiateur d’une autre cité, de passage, te défie dans la cour : « On dit que tu es bon. Montre-moi. »'],
  ch: [{ l: 'Accepter le duel amical', by: 'str', o: [[50, 'Tu le bats à la loyale. Il te serre le bras avec respect.', [['glo', 12], ['tp', 'r', 5]]], [50, 'Il te met à terre. Tu te relèves, plus sage.', [['hp', -0.2], ['tp', 'r', 5]]]] },
   { l: 'Refuser', o: [[1, 'Il crache par terre. On te traitera de lâche pendant quelques jours.', [['glo', -3]]]] }] },
{ id: 'empereur_don', min: 7, ic: 'chest', t: 'Le présent du palais', x: ['Un messager portant la pourpre dépose devant toi un coffret scellé. Aucun mot, aucun nom.', 'Le palais a des yeux partout.'],
  ch: [{ l: 'L’ouvrir', o: [[60, 'Un objet de grande valeur. Une dette invisible aussi.', [['loot', 2]]], [40, 'Une simple bourse. Les puissants sont avares.', [['g', 120]]]] },
   { l: 'Le renvoyer', o: [[1, 'Un geste dangereux. Le messager te regarde comme un fou.', [['honor', 2], ['glo', 6]]]] }] },
{ id: 'duel_a_mort', min: 6, ic: 'spear', t: 'Un marchand propose un combat privé', x: ['Un riche marchand propose un combat d’exhibition dans sa villa, pour ses invités. Cent sesterces, à toi seul.', '« Pas de mort, bien sûr. Enfin, pas prévu. »'],
  ch: [{ l: 'Accepter', by: 'str', o: [[55, 'Tu te bats sous les lampes. Les invités ne s’en lassent pas.', [['g', 120], ['glo', 6]]], [45, 'Il y a eu des blessures. Tu es payé, mais tu as perdu du sang.', [['g', 80], ['hp', -0.25]]]] },
   { l: 'Refuser', o: [[1, 'Tu ne te bats plus pour distraire les fortunés.', [['honor', 2]]]] }] },
{ id: 'prisonnier_fete', min: 6, ic: 'scroll', t: 'Un message de ta terre', x: ['Un voyageur, venu de très loin, demande à te voir. Il porte un petit paquet de ta région.', '« On me l’a confié pour toi. Je ne sais pas par qui. »'],
  ch: [{ l: 'Ouvrir le paquet', o: [[1, 'Une poignée de terre, une plume, un mot : « Reviens. » Tu serres le tout contre toi.', [['bless', 25], ['honor', 1]]]] },
   { l: 'Le refuser', o: [[1, 'Tu refuses. Le voyageur repart sans rien dire.', []]] }] },
{ id: 'prophetie', min: 5, ic: 'amulet', t: 'La prophétie', x: ['Une vieille aveugle t’attrape par le poignet à la sortie de l’arène : « Je vois ton visage sur une pièce. Un jour. »', 'Elle tend la main : elle veut quelque chose.'],
  ch: [{ l: 'Lui donner une pièce', cost: 5, o: [[1, 'Elle sourit sans dents. Peut-être ment-elle. Peut-être pas.', [['bless', 18]]]] },
   { l: 'Passer', o: [[1, 'Les prophéties, c’est pour ceux qui ont le temps.', []]] }] },
{ id: 'ecole', min: 5, ic: 'scroll', t: 'Les jeunes recrues', x: ['Le lanista te charge d’enseigner aux nouvelles recrues : « Tu as des choses à leur apprendre. Ça te rapportera. »'],
  ch: [{ l: 'Accepter', o: [[65, 'Tu leur montres comment tenir le bouclier. Tu apprends en expliquant.', [['g', 40], ['tp', 'r', 4]]], [35, 'Ils sont lents et maladroits. Une journée longue.', [['g', 25]]]] },
   { l: 'Refuser', o: [[1, 'Chacun son métier.', []]] }] },
{ id: 'cicatrice', min: 4, ic: 'amulet', cond: ['hurt'], t: 'Une vieille cicatrice', x: ['Une vieille blessure te lance quand l’humidité monte. Un esclave guérisseur te propose un onguent maison.'],
  ch: [{ l: 'L’essayer', o: [[70, 'La douleur s’efface. Tu te sens presque neuf.', [['hp', 0.5]]], [30, 'L’onguent brûle. Tu hurles un peu.', [['hp', -0.05]]]] },
   { l: 'Serrer les dents', o: [[1, 'Tu as appris à vivre avec.', [['tp', 'end', 2]]]] }] },
{ id: 'tournoi_local', min: 3, ic: 'spear', t: 'Un tournoi de quartier', x: ['Un tournoi improvisé dans un quartier pauvre : des gladiateurs de plusieurs ludus, pour le plaisir des gens. Pas de mort, un petit prix.'],
  ch: [{ l: 'Participer', by: 'agi', o: [[45, 'Tu gagnes la finale, couvert de poussière. Le quartier t’adopte.', [['g', 50], ['glo', 8]]], [55, 'Tu perds en demi-finale, mais on te porte en triomphe pour la bataille.', [['glo', 4], ['hp', -0.1]]]] },
   { l: 'Regarder seulement', o: [[1, 'Tu notes quelques techniques.', [['xp', 6]]]] }] },{ id: 'rat_gros', min: 0, ic: 'bread', t: 'Le rat de la cellule', x: ['Un rat énorme te regarde depuis le coin de ta cellule, sans peur. Il a l’air de te défier de partager ton pain.'],
  ch: [{ l: 'Lui jeter une miette', o: [[1, 'Il disparaît avec. Le lendemain, une pièce brille dans le coin.', [['g', 6]]]] },
   { l: 'L’écraser', o: [[1, 'Un bruit sec. Tu ne dors pas bien cette nuit.', [['honor', -1]]]] }] },
{ id: 'chien_errant', min: 1, ic: 'bread', t: 'Le chien du boucher', x: ['Un chien errant pose sa tête sur tes genoux, les yeux humides.', 'Tu as un os dans ta gamelle.'],
  ch: [{ l: 'Le lui donner', o: [[1, 'Il te suit toute la journée comme un frère.', [['honor', 1], ['hp', 0.1]]]] },
   { l: 'Garder l’os', o: [[1, 'Il soupire, repart.', []]] }] },
{ id: 'faucon', min: 2, ic: 'amulet', t: 'Le faucon', x: ['Un faucon se perche sur le mur du ludus, droit comme une statue. Il te fixe.', 'On dit que c’est un signe.'],
  ch: [{ l: 'Le saluer', o: [[1, 'Il s’envole. Tu te sens plus léger.', [['bless', 10]]]] },
   { l: 'Ignorer', o: [[1, 'Les oiseaux sont des oiseaux.', []]] }] },
{ id: 'grele', min: 0, ic: 'scroll', t: 'La grêle', x: ['Une grêle violente s’abat sur le ludus. Les gardes se réfugient, et pour une fois, la cour est à vous.'],
  ch: [{ l: 'Danser sous la grêle', o: [[1, 'Ça fait mal et c’est magnifique.', [['tp', 'end', 2], ['hp', -0.05]]]] },
   { l: 'T’abriter', o: [[1, 'Tu écoutes le tonnerre depuis un coin sec.', [['hp', 0.1]]]] }] },
{ id: 'chaleur', min: 0, ic: 'potion', t: 'La canicule', x: ['Une chaleur épaisse écrase le ludus. L’entraînement est impossible, l’eau est rare.', 'Un esclave vend de l’eau fraîche au prix fort.'],
  ch: [{ l: 'Acheter de l’eau', cost: 6, o: [[1, 'Une eau fraîche qui ressemble à du vin.', [['hp', 0.25]]]] },
   { l: 'Endurer', o: [[1, 'La soif te forge, doucement.', [['tp', 'end', 2], ['hp', -0.08]]]] }] },
{ id: 'neige', min: 2, ic: 'scroll', t: 'La première neige', x: ['Il neige, chose rare. Les anciens regardent le ciel comme des enfants.', 'Quelqu’un lance une boule. Un instant, personne ne se souvient d’où il est.'],
  ch: [{ l: 'Répondre', o: [[1, 'Une bataille de boules de neige s’improvise. Même les gardes en prennent une.', [['honor', 1], ['hp', 0.15]]]] },
   { l: 'Rester dehors, immobile', o: [[1, 'Le silence de la neige t’apaise.', [['xp', 4]]]] }] },
{ id: 'incendie', min: 2, ic: 'spear', cond: ['safe'], t: 'Le feu aux écuries', x: ['Un cri : le feu aux écuries ! Les chevaux hennissent, la fumée monte.'],
  ch: [{ l: 'Courir aider', by: 'end', o: [[60, 'Tu sauves deux chevaux. Le lanista, ému, te remercie.', [['glo', 8], ['honor', 1], ['g', 30]]], [40, 'Tu t’en sors avec des brûlures.', [['hp', -0.2], ['glo', 4]]]] },
   { l: 'Rester à l’écart', o: [[1, 'D’autres s’en chargent. Tu vois une écurie brûler.', [['honor', -1]]]] }] },
{ id: 'cirque_ours', min: 3, ic: 'spear', t: 'L’ours enchaîné', x: ['Un dompteur promène un ours sur une chaîne dans la cour. Il propose aux gladiateurs de le toucher pour cinq sesterces.'],
  ch: [{ l: 'Toucher l’ours', cost: 5, o: [[60, 'Sa fourrure est rude et chaude. Tu ressens quelque chose d’étrange.', [['bless', 8]]], [40, 'Il grogne et te donne un coup de patte. Tu t’en sors avec une griffure.', [['hp', -0.1]]]] },
   { l: 'Passer', o: [[1, 'Tu as déjà assez de bêtes à affronter.', []]] }] },
{ id: 'mercenaire', min: 3, ic: 'spear', t: 'Le mercenaire syrien', x: ['Un mercenaire syrien en transit propose une leçon de combat à la lance, au prix de trente sesterces.'],
  ch: [{ l: 'Payer la leçon', cost: 30, o: [[80, 'Il t’enseigne un geste inconnu des Romains. Tu le sens déjà dans tes muscles.', [['tp', 'r', 7], ['xp', 8]]], [20, 'Il parle plus qu’il n’enseigne.', [['xp', 4]]]] },
   { l: 'Refuser', o: [[1, 'Tu préfères ta propre méthode.', []]] }] },
{ id: 'cauchemar', min: 2, ic: 'amulet', t: 'Le cauchemar', x: ['Tu te réveilles en sueur : tu étais dans l’arène, seul, face à un adversaire sans visage.', 'Ta paillasse est trempée.'],
  ch: [{ l: 'Te rendormir', o: [[60, 'Le sommeil revient, tranquille.', [['hp', 0.2]]], [40, 'Le rêve revient. Tu te lèves à l’aube, brisé.', [['hp', -0.08]]]] },
   { l: 'Faire quelques pas dans la cour', o: [[1, 'L’air nocturne te vide la tête. Tu t’entraînes dans le silence.', [['tp', 'agi', 2]]]] }] },
{ id: 'veille', min: 1, ic: 'scroll', t: 'Un bruit dans la nuit', x: ['Un bruit étrange derrière la cloison, la nuit. Quelqu’un creuse.'],
  ch: [{ l: 'Regarder par le trou', by: 'agi', o: [[50, 'Deux esclaves creusent un tunnel. Ils te supplient du regard de ne rien dire.', [['honor', 1], ['flag', 'secret']]], [50, 'Un garde te voit. Tu passes une nuit sans sommeil.', [['hp', -0.05]]]] },
   { l: 'Faire semblant de dormir', o: [[1, 'Tu n’as rien vu, rien entendu.', []]] }] },
{ id: 'evasion', min: 2, ic: 'scroll', cond: ['flag:secret'], w: 4, t: 'Les évadés', x: ['Le tunnel dont tu as vu le début est terminé. Les deux esclaves viennent te voir, nerveux.', '« On part ce soir. Un coup de main pour détourner les gardes ? »'],
  ch: [{ l: 'Les aider', by: 'agi', o: [[50, 'Ils s’échappent. Tu reçois une bourse en remerciement, glissée dans ta cellule.', [['g', 70], ['unflag', 'secret'], ['honor', 1]]], [50, 'Les gardes les rattrapent. Tu es soupçonné.', [['hp', -0.2], ['unflag', 'secret']]]] },
   { l: 'Les dénoncer', o: [[1, 'Les gardes les prennent. Tu reçois une récompense qui te laisse un goût amer.', [['g', 40], ['honor', -3], ['unflag', 'secret']]]] }] },
{ id: 'oracle_ludus', min: 3, ic: 'amulet', t: 'Les os de poulet', x: ['Un esclave lit l’avenir dans des os de poulet. « Je vois une victoire, une défaite, et un rendez-vous manqué. »'],
  ch: [{ l: 'Le croire', o: [[1, 'La peur et l’espoir se mélangent. Ça te donne du cœur.', [['bless', 8]]]] },
   { l: 'Rire', o: [[1, 'Il rit avec toi. L’avenir, il vaut mieux le vivre que le lire.', [['hp', 0.1]]]] }] },
{ id: 'cadeau_lanista2', min: 2, ic: 'chest', t: 'Une récompense inattendue', x: ['Un esclave te glisse une petite bourse : « De la part d’un inconnu. Il a aimé ton dernier combat. »'],
  ch: [{ l: 'La prendre', o: [[1, 'Tu ne sauras jamais qui. Mais ça arrive.', [['g', 30]]]] },
   { l: 'La rendre', o: [[1, 'L’esclave n’en revient pas. Il te regarde avec stupeur.', [['honor', 2]]]] }] }];
const POP = SCENES;
const gm = s => 1 + 0.25 * s.rank;
const costOf = (s, c) => c.cost ? Math.round(c.cost * gm(s)) : 0;
const evById = id => SCENES.find(e => e.id === id);
const eventDue = s => !s.curEv && s.gameMs >= s.nextEv;
const COND = {
  safe: s => s.hp > maxHp(s) * 0.45, hurt: s => s.hp < maxHp(s) * 0.8, healthy: s => s.hp > maxHp(s) * 0.7,
  met: s => !!s.flags.met, bond: s => !!s.flags.bond, noclan: s => !s.clan, clan: s => !!s.clan, night: s => s.night && s.night.done > 0,
  nogear: s => !s.gear.w && !s.gear.c
};
function condOk(s, c) {
  if (!c) return true;
  const [k, v] = c.split(':'), neg = k[0] === '!', kk = neg ? k.slice(1) : k;
  let r;
  if (COND[kk]) r = COND[kk](s);
  else if (kk === 'gold') r = s.gold >= +v;
  else if (kk === 'flag') r = !!s.flags[v];
  else if (kk === 'honor') r = s.flags.honor >= +v;
  else if (kk === 'dis') r = s.flags.honor <= +v;
  else if (kk === 'origin') r = s.origin === v;
  else if (kk === 'max') r = s.rank <= +v;
  else if (kk === 'wins') r = s.wins >= +v;
  else if (kk === 'lvl') r = s.level >= +v;
  else if (kk === 'sex') r = s.gender === v;
  else if (kk === 'comp') r = s.comp.g === v;
  else r = true;
  return neg ? !r : r;
}
function tpl(s, str) {
  const c = cp(s);
  return str.replace(/\{c\}/g, c.n).replace(/\{il\}/g, c.il).replace(/\{Il\}/g, c.Il).replace(/\{e\}/g, c.e).replace(/\{le\}/g, c.il === 'elle' ? 'la' : 'le')
    .replace(/\{rival\}/g, s.rival.name).replace(/\{lanista\}/g, LANISTA).replace(/\{nom\}/g, s.name);
}
function sceneView(s, e) {
  return { id: e.id, ic: e.ic, t: tpl(s, e.t), x: e.x.map(p => tpl(s, p)),
    ch: e.ch.map(c => ({ l: tpl(s, c.l), cost: costOf(s, c) })) };
}
function drawEvent(s) {
  if (s.curEv && evById(s.curEv)) return evById(s.curEv);
  if (!s.seen) s.seen = [];
  let pool = SCENES.filter(e => s.rank >= e.min && (e.max == null || s.rank <= e.max) && (!e.cond || e.cond.every(c => condOk(s, c))) && !s.seen.includes(e.id));
  if (!pool.length) { s.seen = []; pool = SCENES.filter(e => s.rank >= e.min && (!e.cond || e.cond.every(c => condOk(s, c))) && e.id !== s.lastEv); }
  if (!pool.length) pool = SCENES.filter(e => e.id === 'des');
  let tot = pool.reduce((a, e) => a + (e.w || 10), 0), r = Math.random() * tot, e = pool[0];
  for (const x of pool) { r -= (x.w || 10); if (r <= 0) { e = x; break; } }
  s.curEv = e.id; return e;
}
function applyFx(s, f, out) {
  const [k, a, b] = f; const st = n => STAT_N[n] || n;
  switch (k) {
    case 'g': { const v = Math.round(a * gm(s)); if (v >= 0) { s.gold += v; return `+${v} sesterces`; } const d = loseGold(s, -v); return d ? `−${d} sesterces` : ''; }
    case 'hp': { if (a >= 0) { const h = Math.round(maxHp(s) * a); s.hp = Math.min(maxHp(s), s.hp + h); return `+${h} vie`; } return `−${hurt(s, -a)} vie`; }
    case 'xp': { const v = Math.round(a * (1 + 0.15 * s.level)); out.levels = (out.levels || 0) + addXp(s, v); return `+${v} xp`; }
    case 'glo': { const v = Math.round(a * (1 + 0.2 * s.rank)); s.gloire += v; return `+${v} gloire`; }
    case 'honor': s.flags.honor += a; return a > 0 ? 'honneur' : 'déshonneur';
    case 'bless': s.bless = Math.max(s.bless, a); return `+${a} de faveur au prochain combat`;
    case 'stat': { const n = a === 'r' ? rstat() : a; s[n] += b; return `+${b} ${st(n)}`; }
    case 'tp': { const n = a === 'r' ? rstat() : a; gainTp(s, n, Math.round(b * (1 + 0.2 * s.rank))); return `${st(n)} progresse`; }
    case 'loot': { const l = lootDrop(s, { force: true, minRar: a }); if (l) out.loot = l; return ''; }
    case 'flag': s.flags[a] = b == null ? 1 : b; return '';
    case 'unflag': delete s.flags[a]; return '';
    case 'wager': s.wager = (s.wager || 0) + a; return '';
    case 'chest': s.chests = Math.min(3, s.chests + a); return a > 0 ? 'un coffre' : '';
  }
  return '';
}
function resolveEvent(s, id, i) {
  const e = evById(id), c = e && e.ch[i];
  if (!c) return null;
  const cost = costOf(s, c);
  if (cost) { if (s.gold < cost) return null; s.gold -= cost; }
  let os = c.o.map(o => o.slice());
  if (c.by && os.length > 1) os[0][0] = Math.max(5, Math.min(92, os[0][0] + Math.max(-8, Math.min(20, (s[c.by] - 5) * 1.2))));
  let tot = os.reduce((a, o) => a + o[0], 0), r = Math.random() * tot, o = os[0];
  for (const x of os) { r -= x[0]; if (r <= 0) { o = x; break; } }
  const out = {}; const bits = [];
  for (const f of o[2]) { const b = applyFx(s, f, out); if (b) bits.push(b); }
  const good = o[2].some(f => ['stat', 'tp', 'xp', 'glo', 'loot', 'bless', 'chest'].includes(f[0]) || (f[0] === 'g' && f[1] > 0) || (f[0] === 'hp' && f[1] > 0) || (f[0] === 'honor' && f[1] > 0));
  const bad = o[2].some(f => (f[0] === 'g' && f[1] < 0) || (f[0] === 'hp' && f[1] < 0) || (f[0] === 'honor' && f[1] < 0));
  const tone = bad && !good ? 'bad' : good && !bad ? 'good' : good && bad ? 'neutral' : 'neutral';
  const res = Object.assign({ t: tpl(s, o[1]) + (bits.length ? ` (${bits.join(', ')})` : ''), tone }, out.loot ? { loot: out.loot } : {});
  s.curEv = null; s.lastEv = id; s.nextEv = s.gameMs + ri(150, 330) * 60000;
  if (!s.seen) s.seen = [];
  s.seen.push(id); if (s.seen.length > 40) s.seen.shift();
  log(s, res.t); mTrack(s, 'scene');
  return res;
}


/* ---------- ordres du jour : missions racontées ---------- */
const dayKey = d => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const GROUPS = { thrace: 'Thraces', mirmillon: 'Mirmillons', retiaire: 'Rétiaires' };
const GV = {
  cass: () => ({ n: LANISTA, t: 'le lanista' }),
  syrus: () => ({ n: 'Livia la cuisinière', t: 'cuisinière du ludus' }),
  alch: () => ({ n: 'Brynn l’alchimiste', t: 'alchimiste' }),
  maitre: s => ({ n: MASTERS[s.school].n, t: MASTERS[s.school].t })
};
const MSN = {
  wins: { gv: 'cass', ok: () => true, mk: s => ({ tgt: s.rank < 3 ? 2 : 3 }), goal: m => `Gagne ${m.tgt} combats`,
    story: m => `Le lanista t’attrape par l’épaule dans la cour. « La foule réclame du spectacle, et mon coffre aussi. Ramène-moi ${m.tgt} victoires avant la nuit. »`, ev: (m, t, d) => t === 'fight' && d.win ? 1 : 0,
    thx: 'Cassius Rufus compte les pièces d’un air satisfait. « Voilà qui me plaît. »' },
  kind: { gv: 'maitre', ok: s => !!s.school, mk: s => ({ k: pick(Object.keys(GROUPS)), tgt: s.rank < 5 ? 1 : 2 }), goal: m => `Vaincs ${m.tgt} ${m.tgt > 1 ? GROUPS[m.k] : GROUPS[m.k].replace(/s$/, '')}`,
    story: (m, s) => `${MASTERS[s.school].n} t’arrête près des râteliers. « Les ${GROUPS[m.k]} se croient intouchables. Va leur apprendre le contraire. »`, ev: (m, t, d) => t === 'fight' && d.win && schoolOfOpp(d.opp) === m.k ? 1 : 0,
    thx: 'Ton maître hoche la tête, un rare sourire au coin des lèvres.' },
  elan: { gv: 'maitre', ok: s => !!s.school, mk: s => ({ tgt: s.rank < 4 ? 2 : 3 }), goal: m => `Lance ${m.tgt} frappes d’élan`,
    story: (m, s) => `« Trois touches d’affilée, puis le coup qui compte. » ${MASTERS[s.school].n} croise les bras. « Je veux te le voir faire ${m.tgt} fois. »`, ev: (m, t, d) => t === 'fight' ? Math.min(d.res.st ? d.res.st.elans : 0, 3) : 0,
    thx: 'Le maître ajuste ta garde du bout du doigt. « Mieux. Encore mieux demain. »' },
  nopot: { gv: 'cass', ok: () => true, mk: () => ({ tgt: 1 }), goal: () => 'Gagne sans boire de potion',
    story: () => 'Cassius Rufus ricane. « Les fioles, c’est pour ceux qui n’ont pas confiance en leur bras. Prouve-moi que tu en as un. »', ev: (m, t, d) => t === 'fight' && d.win && d.res.st && d.res.st.pots === 0 ? 1 : 0,
    thx: '« Voilà un bras que je peux vendre », dit le lanista.' },
  auto: { gv: 'maitre', ok: s => !!s.school, mk: () => ({ tgt: 1 }), goal: () => 'Gagne en laissant ta tactique faire',
    story: (m, s) => `${MASTERS[s.school].n} te tend un bout de parchemin usé. « Un bon gladiateur prépare son combat avant d’entrer. Fais confiance à ta tactique, et gagne. »`, ev: (m, t, d) => { const st = d.res.st; return t === 'fight' && d.win && st && st.turns >= 3 && st.auto >= st.turns * 0.9 ? 1 : 0; },
    thx: 'Le maître relit ta tactique et se gratte la barbe. « Pas mal pour un début. »' },
  scene: { gv: 'syrus', ok: () => true, mk: () => ({ tgt: 1 }), goal: () => 'Prends part à un événement du ludus',
    story: () => 'Livia la cuisinière essuie ses mains sur son tablier. « Ça bouge, dans la cour. Va voir ce qui s’y passe, et reviens me raconter. »', ev: (m, t) => t === 'scene' ? 1 : 0,
    thx: '« Tu me raconteras les détails ce soir », dit Livia en te glissant une galette.' },
  spend: { gv: 'alch', ok: () => true, mk: s => ({ tgt: Math.round((70 + 30 * s.rank) / 10) * 10 }), goal: m => `Dépense ${m.tgt} sesterces chez le forgeron ou l’alchimiste`,
    story: () => 'Brynn l’alchimiste renifle une fiole fumante. « Un gladiateur mal équipé est un gladiateur mort. Passe chez le forgeron, ou chez moi, et dépense tes pièces à bon escient. »', ev: (m, t, d) => t === 'spend' ? d.n : 0,
    thx: 'Brynn range ses fioles. « Un bon client est un client vivant. »' }
};
const CHAL = {
  nopot2: { goal: () => 'Gagne en te couvrant au plus 2 fois', story: () => 'Cassius Rufus propose un pari à la cantonade. « Quelqu’un ici peut gagner sans trembler derrière son bouclier ? Deux parades, pas plus. »', test: (d) => d.win && d.res.st && d.res.st.guards <= 2 },
  fast: { goal: () => 'Gagne en 7 tours ou moins', story: () => '« La foule s’ennuie, » grogne le lanista. « Finis-en vite. Sept tours, pas un de plus. »', test: d => d.win && d.res.rounds <= 7 },
  healthy: { goal: () => 'Gagne en gardant les trois quarts de ta vie', story: () => '« On ne veut pas du sang de la maison, » dit le lanista. « Gagne, et sors d’ici sur tes deux jambes. »', test: d => d.win && d.res.pHp >= d.res.pMax * 0.75 },
  risky: { goal: () => 'Gagne contre un adversaire mieux classé que toi', story: () => 'Le lanista a parié gros : « Il y a un favori là-bas. Bats-le, et nous mangerons bien ce soir. »', test: (d, s) => d.win && d.opp.cote > s.cote + 40 },
  elan1: { ok: s => !!s.school, goal: () => 'Gagne en lançant ton élan', story: (s) => `${MASTERS[s.school].n} t’observe depuis les gradins vides. « Ce soir, je veux voir ton coup spécial décider d’un combat. »`, test: d => d.win && d.res.st && d.res.st.elans >= 1 }
};
const msnPay = (s, ch) => ({ gold: Math.round((24 + 11 * s.rank) * (ch ? 2.2 : 1)), gloire: Math.round((5 + 2 * s.rank) * (ch ? 2 : 1)) });
function msnGen(s, day) {
  const ids = shuffle(Object.keys(MSN).filter(k => MSN[k].ok(s)));
  if (!ids.includes('wins')) ids.push('wins');
  const pickIds = ['wins'].concat(ids.filter(k => k !== 'wins').slice(0, 2));
  const list = pickIds.map(t => Object.assign({ t, prog: 0, done: false, claimed: false }, MSN[t].mk(s)));
  const cs = shuffle(Object.keys(CHAL).filter(k => !CHAL[k].ok || CHAL[k].ok(s)));
  return { day, list, ch: { t: cs[0], prog: 0, tgt: 1, done: false, claimed: false }, bonus: false };
}
function msnAuto(s) {
  let g = 0, x = 0;
  const all = s.msn.list.concat([s.msn.ch]);
  all.forEach(m => { if (m.done && !m.claimed) { const p = msnPay(s, m === s.msn.ch); g += p.gold; x += p.gloire; m.claimed = true; } });
  if (g || x) { s.gold += g; s.gloire += x; log(s, `Les ordres de la veille te sont payés : +${g} sesterces, +${x} gloire.`); }
}
function ensureMissions(s, day) {
  day = day || dayKey();
  if (s.msn && s.msn.day === day) return false;
  if (s.msn) msnAuto(s);
  s.msn = msnGen(s, day); return true;
}
function mTrack(s, type, d) {
  if (!s || !s.cnt) return;
  ensureMissions(s);
  d = d || {};
  s.msn.list.forEach(m => {
    if (m.done || !MSN[m.t]) return;
    const n = MSN[m.t].ev(m, type, d, s);
    if (n > 0) { m.prog = Math.min(m.tgt, m.prog + n); if (m.prog >= m.tgt) m.done = true; }
  });
  const c = s.msn.ch;
  if (type === 'fight' && !c.done && CHAL[c.t] && CHAL[c.t].test(d, s)) { c.prog = 1; c.done = true; }
}
const msnInfo = (s, m) => {
  if (m === s.msn.ch) { const c = CHAL[m.t]; return { giver: GV.cass(), goal: c.goal(), story: c.story(s), thx: 'Le lanista t’envoie une bourse bien remplie. « Voilà un pari que j’ai plaisir à perdre. »', ch: true }; }
  const t = MSN[m.t]; return { giver: GV[t.gv](s), goal: t.goal(m), story: t.story(m, s), thx: t.thx, ch: false };
};
function msnReady(s) { return !!s.msn && s.msn.list.concat([s.msn.ch]).some(m => m.done && !m.claimed); }
function claimMission(s, key) {
  ensureMissions(s);
  const ch = key === 'ch', m = ch ? s.msn.ch : s.msn.list[+key];
  if (!m || !m.done || m.claimed) return null;
  const p = msnPay(s, ch), out = { gold: p.gold, gloire: p.gloire, info: msnInfo(s, m) };
  m.claimed = true; s.gold += p.gold; s.gloire += p.gloire;
  if (ch) { out.loot = lootDrop(s, { force: true, minRar: s.rank >= 2 ? 1 : 0 }); }
  const n = s.msn.list.concat([s.msn.ch]).filter(x => x.claimed).length;
  if (n >= 3 && !s.msn.bonus) {
    s.msn.bonus = true;
    const g = 30 + 12 * s.rank; s.gold += g;
    const pid = s.rank < 3 ? 'hp1' : 'hp2'; if ((s.pots[pid] || 0) < POT_MAX) s.pots[pid] = (s.pots[pid] || 0) + 1;
    out.bonus = { gold: g, pot: POT_BY[pid].n };
  }
  log(s, `Ordre accompli : ${out.info.goal}. +${p.gold} sesterces, +${p.gloire} gloire.`);
  return out;
}

/* l'histoire */
const LANISTA = 'Cassius Rufus';
const cp = s => { const f = s.comp.g === 'f'; return { n: s.comp.n, il: f ? 'elle' : 'il', Il: f ? 'Elle' : 'Il', e: f ? 'e' : '' }; };
const STORY = [
  { id: 'nael', when: s => s.wins >= 1, ic: 'bread', t: s => `${cp(s).n}, voisin de cellule`.replace('voisin', s.comp.g === 'f' ? 'voisine' : 'voisin'),
    x: s => { const c = cp(s); return [`Depuis ton arrivée, quelqu’un te regarde à travers un trou de la cloison. Ce soir, ${c.il} vient s’asseoir près de toi dans la cour.`, `« Moi, c’est ${c.n}. Ici on ne survit pas seul. Toi, tu as l’air d’en valoir la peine. »`]; },
    ch: [{ l: s => 'Partager ta gamelle', run: s => { s.flags.met = 1; s.flags.bond = 1; s.flags.honor++; return { t: `Vous mangez en silence. C’est la première fois depuis longtemps que quelqu’un s’assoit près de toi. ${cp(s).n} sera désormais dans la cour quand tu rentres.`, tone: 'good' }; } },
      { l: s => 'Garder tes distances', run: s => { s.flags.met = 1; return { t: `Tu hoches la tête sans répondre. ${cp(s).n} sourit quand même : « Je reste dans le coin. »`, tone: 'neutral' }; } }] },
  { id: 'vente', when: s => s.rank >= 2 || (s.rank >= 1 && s.gold >= 50), ic: 'scroll', t: s => 'La liste des ventes',
    x: s => { const c = cp(s); return [`Le lanista, ${LANISTA}, a affiché la liste des ventes. ${c.n} est inscrit${c.e} pour les mines de sel. Départ à l’aube.`, s.flags.bond ? `${c.Il} ne dit rien, mais ses mains tremblent quand ${c.il} croise les tiens.` : `${c.Il} évite ton regard. Vous ne vous êtes presque pas parlé, et pourtant.`, 'Cinquante sesterces suffiraient à faire rayer un nom.']; },
    ch: [{ l: s => 'Racheter ' + s.comp.n, cost: 50, run: s => { s.flags.saved = 1; s.flags.honor++; return { t: `Le lanista compte les pièces d’un air amusé. ${cp(s).n} te serre l’avant-bras sans trouver les mots. ${cp(s).Il} soignera tes plaies : ta vie reviendra plus vite.`, tone: 'good' }; } },
      { l: s => 'Détourner les yeux', run: s => { s.flags.lost = 1; return { t: `Le chariot part à l’aube. Tu regardes la poussière jusqu’à ce qu’elle retombe. La cour semble plus vide.`, tone: 'bad' }; } }] },
  { id: 'truque', when: s => s.rank >= 3, ic: 'chest', t: s => 'Une proposition du lanista',
    x: s => [`${LANISTA} t’attend dans son cabinet. Il parle bas.`, '« Le prochain combat est gagné d’avance… pour l’autre. Couche-toi au troisième coup et cette bourse est à toi. Refuse, et personne ne t’en voudra. Presque personne. »'],
    ch: [{ l: s => 'Accepter la bourse', run: s => { s.gold += 90; const g = Math.min(s.gloire, 12); s.gloire -= g; s.flags.honor--; return { t: `Tu prends l’argent. Il pèse plus lourd que prévu. (+90 sesterces${g ? `, −${g} gloire` : ''})`, tone: 'neutral' }; } },
      { l: s => 'Refuser avec fierté', run: s => { s.gloire += 8; s.flags.honor++; return { t: 'Le lanista sourit sans chaleur. La rumeur de ton refus se répand dans le ludus avant la nuit. (+8 gloire)', tone: 'good' }; } }] },
  { id: 'nuit', when: s => s.rank >= 5, ic: 'spear', t: s => 'La nuit, près du puits',
    x: s => [`${s.rival.name} t’attend près du puits, adossé${s.rival.gender === 'f' ? 'e' : ''} à la margelle.`, '« Il n’y a de place que pour un seul au sommet. Alors autant se respecter jusque-là. Une trêve : on se battra, mais sans coups bas. »'],
    ch: [{ l: s => 'Accepter la trêve', run: s => { s.flags.truce = 1; s.flags.honor++; return { t: `Vous vous serrez l’avant-bras. Ça ne change rien à ce qui vous attend, mais ${s.rival.name} hésitera une seconde avant de te frapper.`, tone: 'good' }; } },
      { l: s => 'Cracher dans le puits', run: s => { s.flags.truce = 0; s.gloire += 15; return { t: `La foule adore ton insolence. ${s.rival.name} aussi, à sa façon : votre prochain duel sera sans pitié. (+15 gloire)`, tone: 'neutral' }; } }] },
  { id: 'don', when: s => s.rank >= 7, ic: 'amulet', t: s => 'Ce que laissent les amis',
    x: s => { const c = cp(s); return s.flags.saved ? [`${c.n} a travaillé pendant des semaines sur quelque chose, la nuit, à la lueur d’une lampe d’huile.`, '« Pour que tu reviennes toujours. »'] : [`En vidant ta paillasse, tu retrouves une fibule oubliée. Elle appartenait à ${c.n}.`, 'Tu la tiens longtemps dans ta main.']; },
    ch: [{ l: s => 'La garder contre toi', run: s => {
      const c = cp(s), it = { id: 'c' + Math.random().toString(36).slice(2, 8), slot: 't', tier: 3, base: 'Talisman' };
      if (s.flags.saved) Object.assign(it, { rar: 3, fx: [{ id: 'foule', v: 14 }, { id: 'esq', v: 10 }], n: `Talisman de ${c.n}` });
      else Object.assign(it, { rar: 2, fx: [{ id: 'crit', v: 10 }], n: `Fibule de ${c.n}` });
      const r = stashItem(s, it); return { t: s.flags.saved ? 'Une amulette de bronze gravée à la pointe : ton nom, et le sien. Tu ne la quitteras plus.' : 'Elle ne vaut presque rien. Tu ne la quitteras plus.', tone: 'good', loot: r };
    } }] }
];
function nextScene(s) { const b = STORY[s.story]; return b && b.when(s) ? b : null; }
function resolveScene(s, i) {
  const b = STORY[s.story], c = b && b.ch[i];
  if (!c) return null;
  if (c.cost) { if (s.gold < c.cost) return null; s.gold -= c.cost; }
  const r = c.run(s); s.story++; log(s, r.t); mTrack(s, 'scene'); return r;
}
function epilogue(s) {
  const L = [], c = cp(s);
  if (s.flags.saved) L.push(`${c.n} t’attend à la porte du ludus, un baluchon sur l’épaule. Vous partirez ensemble.`);
  else if (s.flags.lost) L.push(`Tu penses à ${c.n}, quelque part dans les mines. Un jour, tu le${c.e ? 'la' : ''} retrouveras.`);
  if (s.flags.honor >= 3) L.push('La foule scande ton nom. On dira de toi que tu es resté debout.');
  else if (s.flags.honor <= -1) L.push('Les gradins applaudissent. Dans le ludus, certains murmurent sur le prix de ta liberté.');
  if (s.flags.truce === 1) L.push(`${s.rival.name} te salue du poing contre le cœur.`);
  return L;
}
/* le compagnon */
const compOn = s => !!(s.flags && s.flags.met && !s.flags.lost);
const compAvail = s => compOn(s) && s.compDay !== dayOf(s);
function compGift(s) {
  s.compDay = dayOf(s);
  const c = cp(s), big = s.flags.saved ? 1.5 : 1, r = Math.random();
  let t;
  if (r < 0.5) { const g = Math.round((6 + s.rank * 3) * big * goldMul(s)); s.gold += g; t = pick([`${c.n} a fouillé la cour avant l’aube et te tend une poignée de pièces. (+${g} sesterces)`, `${c.n} a troqué sa ration contre quelques pièces pour toi. (+${g} sesterces)`]); }
  else if (r < 0.8) { const h = Math.round(maxHp(s) * 0.25 * big); s.hp = Math.min(maxHp(s), s.hp + h); t = `${c.n} t’a préparé un cataplasme avec des herbes chapardées. (+${h} vie)`; }
  else { const k = pick(['str', 'agi', 'end']); gainTp(s, k, 2); t = `${c.n} te fait répéter un geste jusqu’à ce qu’il soit parfait. (${STAT_N[k]} progresse)`; }
  log(s, t);
  return { t, tone: 'good' };
}
function migrate(s) {
  if (!s.nr) {
    /* ancienne échelle à 6 rangs : on convertit */
    s.nr = 11;
    const wm = [0, 1, 2, 4, 5, 7], am = [0, 1, 2, 4, 6, 7];
    s.weapon = wm[Math.min(5, s.weapon || 0)]; s.armor = am[Math.min(5, s.armor || 0)];
    let r = 0; while (r < LAST && s.gloire >= RANKS[r].need) r++;
    s.rank = Math.min(s.rank, r);
    const used = new Set(); s.ghosts = [];
    [[0, 8], [1, 7], [2, 6], [3, 6], [4, 5], [5, 5], [6, 4], [7, 4], [8, 3], [9, 2], [10, 2]].forEach(([rk, n]) => { for (let i = 0; i < n; i++) s.ghosts.push(genGhost(rk, used)); });
    s.fought = {}; s.inv = (s.inv || []).filter(x => x.tier <= 5).map(x => { x.tier = Math.min(10, x.tier * 2); return x; }); s.gear = { w: null, a: null, t: null };
    if (s.freed) s.freed = false;
  }
  if (!s.hist) s.hist = {};
  if (!s.gear) s.gear = { w: null, a: null, t: null };
  if (!s.gv) {
    s.gv = 2; const g0 = s.gear;
    s.gear = { w: g0.w || null, h: null, c: null, b: null, l: null, s: null, t: g0.t || null };
    const conv = it => { if (!it || it.slot !== 'a') return it; const set = setForTier(it.tier || 1); it.slot = 'c'; it.set = set.id; it.base = set.nm.c; it.tier = set.t; it.st = { end: pstat(set.t) }; if (it.n && !it.fx.length) it.n = set.nm.c; return it; };
    s.inv = (s.inv || []).map(conv);
    if (g0.a) { const c = conv(g0.a); s.gear.c = s.inv.find(x => x.id === c.id) || c; }
    if (s.armor > 0) {
      const set = setForTier(s.armor);
      PSLOTS.forEach(k => { if (s.gear[k]) return; const it = { id: Math.random().toString(36).slice(2, 9), slot: k, rar: 0, tier: set.t, set: set.id, fx: [], base: set.nm[k], n: set.nm[k], a: pieceA(set.t, k) }; if (PSTAT[k]) it.st = { [PSTAT[k]]: pstat(set.t) }; s.inv.push(it); s.gear[k] = it; });
    }
    s.armor = 0;
  }
  if (s.gv < 3) {
    s.gv = 3;
    if (!s.gear.w && s.weapon > 0) { const W = WEAPONS[s.weapon]; const it = { id: Math.random().toString(36).slice(2, 9), slot: 'w', rar: 0, tier: W.id, d: W.d, fx: (W.fx || []).map(f => Object.assign({}, f)), base: W.n, n: W.n, up: 0 }; s.inv.push(it); s.gear.w = it; }
  }
  if (!s.inv) s.inv = [];
  if (!s.flags) s.flags = { honor: 0 };
  if (s.story == null) s.story = 0;
  if (s.chests == null) s.chests = 1;
  if (!s.night) s.night = { done: 0 };
  if (s.nextEv == null) s.nextEv = s.gameMs + 120 * 60000;
  if (s.ghosts) s.ghosts.forEach(g => { if (!g.pots) g.pots = ghostPots(g.rk || 0); });
  if (s.school === undefined) s.school = null;
  if (!s.pots) s.pots = {};
  if (!s.potSlots) s.potSlots = [null, null, null];
  if (s.dry == null) s.dry = 0;
  if (s.bless == null) s.bless = 0;
  if (!s.comp) { const g = Math.random() < 0.5 ? 'f' : 'h'; s.comp = { n: pick(g === 'f' ? ['Nerea', 'Ysolde', 'Brenna', 'Ilda'] : ['Nael', 'Tomas', 'Corin', 'Evander']), g, skin: ri(0, 3), hair: ri(0, 2), hairc: ri(0, 3) }; }
  return s;
}

return { TUNE, H, RANKS, rankName, WEAPONS, WT, WT_IDS, wtAvail, weaponVariant, TIER_ADJ, ARMORS, PERKS, ORIGINS, CELL, CLANS, CLAN_BONUS, STAT_N, OCC, RIVAL_INTRO, statsOf, maxHp, xpNeed, trainNeed, playerCombatant, oppCombatant, newFight, fightRound, autoChoice, fightResult, autoFight, genRival, diffOf, preview, pickOpps, ladder, clanBoard, joinClan, leaveClan, newState, dayOf, advance, tick, occLeft, occReady, occDur, rushCost, canRush, rush, startOcc, collectOcc, healCost, odds, heal, sparOpp, sparXp, sparState, resolveSpar, QUESTS, checkQuests, cellCost, buyCell, resolve, perkOptions, takePerk, canDuel, log, pick, ri, cnt, RAR, FX, SLOT_N, price, pmod, PERK_BY, vt, LAST, floorOf, duelCote, gloireOk, coteOk, gloireBar, fatigue, recentWins, NIGHT_RULES, buyWeapon, pieceA, pieceScore, compare, bestGear, junkItems, sellJunk, completeCost, completeSet, SCHOOLS, SCHOOL_BY, MSN, CHAL, msnInfo, msnPay, ensureMissions, claimMission, msnReady, dayKey, TRAITS, TRAIT_BY, traitOf, ARENA_RULES, CTR_INFO, engage, nemLine, TOUR_ROUNDS, tourFee, tourCan, tourStart, tourOpp, tourQuit, TACTICS, TAC_BY, TAC_DEFAULT, tacOf, tacMove, MASTERS, MATCH, matchup, quip, schoolOfOpp, rivalSchool, SCHOOL_KIND, schoolDue, schoolCost, chooseSchool, ELAN_NONE, POTIONS, POT_BY, POT_MAX, potPrice, buyPotion, cyclePot, UP_MAX, forgeCost, forge, gearFx, gearW, gearA, gearStat, PSLOTS, SLOTS, SETS, SET_BY, setBonuses, setCount, setForTier, piecePrice, buyPiece, INV_MAX, genItem, lootDrop, stashItem, equipItem, unequip, sellItem, sellValue, itemVal, openChest, nightAvail, nightRule, nightOpp, POP, SCENES, evById, costOf, sceneView, condOk, eventDue, drawEvent, resolveEvent, STORY, nextScene, resolveScene, epilogue, migrate, cp, LANISTA, compOn, compAvail, compGift };
})();
if (typeof module !== 'undefined') module.exports = G;

