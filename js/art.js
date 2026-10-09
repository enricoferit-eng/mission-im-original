'use strict';
// ---------- Grafiken: Spielfiguren, Auftrags-Tiere, Deko-Tiere, Zutaten ----------

// Skins: 6 pro Stage und Schwierigkeit (6 Stages x 3 Stufen = 108). Jede Stufe hat ihre eigene Farbwelt.
const SKIN_STYLE = {
  easy: [['#ffadad', '#ffd6a5', 'dots'], ['#caffbf', '#9bf6ff', 'dots'], ['#bdb2ff', '#ffc6ff', 'stripes'], ['#fdffb6', '#ffadad', 'stars'], ['rainbow', 'rainbow', 'plain'], ['#a0c4ff', '#fdffb6', 'stars']],
  medium: [['#e76f51', '#f4a261', 'stripes'], ['#2a9d8f', '#e9c46a', 'dots'], ['#264653', '#e76f51', 'stars'], ['#8ecae6', '#219ebc', 'stripes'], ['#ffb703', '#fb8500', 'dots'], ['gold', '#6a4c93', 'stars']],
  hard: [['#d00000', '#370617', 'stripes'], ['#3a0ca3', '#4cc9f0', 'stars'], ['#1b1b1b', '#ffd60a', 'stripes'], ['#2b9348', '#007f5f', 'dots'], ['#7209b7', '#f72585', 'stars'], ['gold', '#d00000', 'stripes']],
};
const SKIN_STAGES = ['gastraum', 'kueche', 'aussen', 'chalet', 'spielplatz', 'parkplatz'];
const SKINS = {};
const stageSkins = (stage, diff) => [0, 1, 2, 3, 4, 5].map(i => `${stage}_${diff}_${i}`);
SKIN_STAGES.forEach((stage, si) => ['easy', 'medium', 'hard'].forEach(diff => stageSkins(stage, diff).forEach((id, i) => {
  const st = SKIN_STYLE[diff][(i + si) % 6];
  SKINS[id] = { cap: st[0], scarf: st[1], pat: st[2], dots: st[2] === 'dots' ? '#ffffff' : null };
})));
const DEFAULT_LOOK = { cap: '#5aa13a', scarf: '#6bb544' }; // Im-Original-Grün
// Die Figur sucht sich jedes Kind selbst aus (Konto); Standard je Stufe nur, solange noch nichts gewählt ist
const DEFAULT_CHAR = { easy: 'cat', medium: 'dog', hard: 'lion' };
const ANIMAL_OF = {};
['easy', 'medium', 'hard'].forEach(d => Object.defineProperty(ANIMAL_OF, d, { get() { const a = typeof ACC === 'function' && ACC(); return (a && a.char) || DEFAULT_CHAR[d]; } }));
let CUR_DIFF = 'medium';   // aktuelle Schwierigkeitsstufe (für Kappe + Skin der Figur)

const ANIMALS = {
  cat: { body: '#f6a04d', light: '#ffe2bf', dark: '#c8702a' },
  dog: { body: '#c99460', light: '#f5e1c8', dark: '#7d5131' },
  lion: { body: '#f5c451', light: '#fdebb8', dark: '#c98a2b', mane: '#b9561d' },
  // im Laden mit Talern freischaltbar
  bunny: { body: '#f1ece4', light: '#ffffff', dark: '#cfc6b8', inner: '#f7b6c2' },
  panda: { body: '#f8f9fa', light: '#ffffff', dark: '#2b2d42' },
  fox: { body: '#e8742c', light: '#fff3e6', dark: '#9c3d10' },
};
const ANIMAL_NAMES = { cat: 'Katze', dog: 'Hund', lion: 'Löwe', bunny: 'Hase', panda: 'Panda', fox: 'Fuchs' };
function lookOf(kind) { const s = ACC() ? DP(CUR_DIFF).equip : null; return SKINS[s] || DEFAULT_LOOK; }
function paint(c, col, x0, x1) {
  if (col === 'gold') { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#b8860b'); g.addColorStop(0.5, '#ffe066'); g.addColorStop(1, '#c9a227'); return g; }
  if (col !== 'rainbow') return col;
  const g = c.createLinearGradient(x0, 0, x1, 0);
  ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5'].forEach((k, i) => g.addColorStop(i / 4, k));
  return g;
}

// Spielfigur in Seitenansicht (3/4), Füße bei (x,y)
function drawAnimal(c, kind, x, y, s, o = {}) {
  const A = ANIMALS[kind], t = o.t || 0, mv = o.moving;
  const L = o.look || lookOf(kind);
  const bob = mv ? Math.abs(Math.sin(t * 12)) * 3 : Math.sin(t * 2.2) * 0.8;
  c.save(); c.translate(x, y); c.scale(s, s);
  if (!o.noShadow) { c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, 0, (o.shadowY || 0), 17, 6); c.fill(); }
  if (L.sparkle) { for (let i = 0; i < 3; i++) { const a = t * 1.5 + i * 2.1, tw = 0.5 + 0.5 * Math.sin(t * 5 + i); c.globalAlpha = tw; starPath(c, Math.cos(a) * 22, -26 + Math.sin(a) * 26, 3.5, 1.4, 4); c.fillStyle = L.sparkle; c.fill(); c.globalAlpha = 1; } }
  c.scale(o.dir || 1, 1);
  c.lineJoin = 'round'; c.lineCap = 'round';
  const st = mv ? Math.sin(t * 12) * 5 : 0;
  ell(c, -7 + st * 0.6, -3, 6, 4.5); fs(c, A.dark, 2.5);
  ell(c, 7 - st * 0.6, -3, 6, 4.5); fs(c, A.dark, 2.5);
  c.translate(0, -bob);
  if (o.tilt) c.rotate(o.tilt);
  // Schwanz
  c.beginPath();
  if (kind === 'cat') { c.moveTo(-11, -14); c.quadraticCurveTo(-27, -16 + Math.sin(t * 3) * 3, -21, -34); }
  else if (kind === 'dog') { const w = Math.sin(t * 14); c.moveTo(-11, -16); c.quadraticCurveTo(-21, -19, -20 + w * 4, -29); }
  else if (kind === 'fox') { c.moveTo(-11, -14); c.quadraticCurveTo(-30, -14 + Math.sin(t * 3) * 2, -27, -32); }
  else if (kind !== 'bunny' && kind !== 'panda') { c.moveTo(-11, -14); c.quadraticCurveTo(-27, -12, -26, -26 + Math.sin(t * 3) * 2); }
  if (kind === 'bunny') { ell(c, -13, -12, 5, 5); fs(c, '#fff', 2.5); }
  else if (kind === 'panda') { ell(c, -12, -11, 4, 4); fs(c, A.dark, 2.5); }
  else if (kind === 'fox') { c.lineWidth = 13; c.strokeStyle = OL; c.stroke(); c.lineWidth = 8.5; c.strokeStyle = A.body; c.stroke(); ell(c, -27, -32, 4.5, 4.5); fs(c, '#fff', 2.5); }
  else { c.lineWidth = 9.5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 5; c.strokeStyle = A.body; c.stroke(); }
  if (kind === 'lion') { ell(c, -26, -28 + Math.sin(t * 3) * 2, 5, 5.5); fs(c, A.mane, 2.5); }
  // Körper
  ell(c, 0, -15, 13, 12); fs(c, A.body); shadeEll(c, 0, -15, 13, 12);
  ell(c, 3, -13, 7, 7.5); fs(c, A.light, 0);
  if (L.uniform) drawUniform(c, L, A);
  ell(c, 9, -5, 5, 4); fs(c, A.light, 2.5);
  // Mähne
  if (kind === 'lion') {
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ell(c, 1 + Math.cos(a) * 15, -37 + Math.sin(a) * 14, 7.5, 7.5); fs(c, A.mane, 2.5); }
    ell(c, 1, -37, 16, 15); c.fillStyle = A.mane; c.fill();
  }
  // Ohren hinten
  if (kind === 'cat') {
    polyPath(c, [[-10, -44], [-8, -56], [0, -48]]); fs(c, A.body);
    polyPath(c, [[3, -48], [10, -57], [13, -44]]); fs(c, A.body);
    polyPath(c, [[5, -48], [10, -54], [11, -46]]); fs(c, '#f7a9a8', 0);
  } else if (kind === 'lion') {
    ell(c, -7, -48, 5, 5); fs(c, A.body); ell(c, 9, -48, 5, 5); fs(c, A.body);
  } else if (kind === 'bunny') {
    const fl = Math.sin(t * 2) * 0.06;
    ell(c, -4, -59, 4.5, 13, -0.15 + fl); fs(c, A.body); ell(c, -4, -59, 2, 9, -0.15 + fl); fs(c, A.inner, 0);
    ell(c, 7, -60, 4.5, 13, 0.2 - fl); fs(c, A.body); ell(c, 7, -60, 2, 9, 0.2 - fl); fs(c, A.inner, 0);
  } else if (kind === 'panda') {
    ell(c, -8, -47, 5.5, 5.5); fs(c, A.dark); ell(c, 10, -47, 5.5, 5.5); fs(c, A.dark);
  } else if (kind === 'fox') {
    polyPath(c, [[-11, -42], [-9, -58], [1, -48]]); fs(c, A.body); polyPath(c, [[3, -48], [12, -58], [14, -42]]); fs(c, A.body);
    polyPath(c, [[5, -48], [11, -55], [12, -45]]); fs(c, '#5a2d12', 0);
  }
  // Kopf
  ell(c, 1, -37, 13.5, 12); fs(c, A.body); shadeEll(c, 1, -37, 13.5, 12);
  if (kind === 'cat') { line(c, -3, -48, -3, -44, 2, A.dark, false); line(c, 2, -49, 2, -45, 2, A.dark, false); }
  ell(c, 7, -33, 7, 5.2); fs(c, A.light, 0);
  if (kind === 'panda') { ell(c, 1, -38.5, 4, 4.8, 0.3); c.fillStyle = A.dark; c.fill(); ell(c, 9.5, -38.5, 4, 4.8, -0.3); c.fill(); }
  if (kind === 'fox') { polyPath(c, [[-1, -33], [14, -31], [6, -27]]); fs(c, '#fff', 0); }
  // Augen
  ell(c, 1, -39, 2.3, 3.2); c.fillStyle = kind === 'panda' ? '#fff' : OL; c.fill(); ell(c, 9, -39, 2.3, 3.2); c.fill();
  if (kind === 'panda') { ell(c, 1.3, -39, 1.4, 2); c.fillStyle = OL; c.fill(); ell(c, 9.3, -39, 1.4, 2); c.fill(); }
  c.fillStyle = '#fff'; ell(c, 1.7, -40.2, 0.9, 0.9); c.fill(); ell(c, 9.7, -40.2, 0.9, 0.9); c.fill();
  // Nase, Mund, Wangen
  ell(c, 12, -34.5, 2.6, 2); c.fillStyle = kind === 'dog' || kind === 'panda' || kind === 'fox' ? OL : '#d6457a'; c.fill();
  c.beginPath(); c.moveTo(12, -32.5); c.quadraticCurveTo(10, -29.5, 7.5, -31); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke();
  c.fillStyle = 'rgba(255,120,120,.35)'; ell(c, -2, -33, 3, 2); c.fill();
  // Hundeohren (vorne)
  if (kind === 'dog') { ell(c, -6, -40, 5.5, 10, 0.35); fs(c, A.dark); }
  // Halstuch (das Helfer-Zeichen aus der Geschichte)
  if (!o.noScarf) {
    const sc = paint(c, L.scarf, -10, 12);
    polyPath(c, [[-9, -25.5], [11, -25.5], [3, -15]]); fs(c, sc, 2.5);
    ell(c, 1, -25.5, 10.5, 3.6); fs(c, sc, 2.5);
    if (L.dots) { c.fillStyle = L.dots; ell(c, 3, -20, 1.4, 1.4); c.fill(); ell(c, -2, -24, 1.2, 1.2); c.fill(); }
    if (L.pat === 'stripes') { line(c, -4, -24, 6, -24, 1.4, 'rgba(255,255,255,.8)', false); line(c, 0, -20, 6, -20, 1.4, 'rgba(255,255,255,.8)', false); }
    if (L.pat === 'stars') { starPath(c, 3, -20, 2.6, 1.1); c.fillStyle = '#fff7ae'; c.fill(); }
    if (L.leaf) leaf(c, 3, -20, 0.55, '#fff');
  }
  // Spielplatz-Ausrüstung: Kappe
  if (o.cap) {
    const cp = paint(c, L.cap, -10, 14);
    if (!(L.hat && drawHat(c, L, cp))) {
    c.beginPath(); c.arc(1, -45, 11, Math.PI, 0); c.closePath(); fs(c, cp, 2.5);
    ell(c, 12, -45, 8, 2.8); fs(c, cp, 2.5);
    if (L.dots) { c.fillStyle = L.dots; ell(c, -2, -50, 1.5, 1.5); c.fill(); ell(c, 4, -52, 1.3, 1.3); c.fill(); }
    if (L.pat === 'stripes') { line(c, -8, -48, 10, -48, 1.6, 'rgba(255,255,255,.75)', false); }
    if (L.pat === 'stars') { starPath(c, 2, -50, 3.2, 1.4); c.fillStyle = '#fff7ae'; c.fill(); }
    ell(c, 1, -56, 2.2, 2.2); fs(c, '#fff', 1.5);
    leaf(c, 3, -49, 0.55, '#fff');
    }
  }
  c.restore();
}

// ---------- Auftrags-Tiere (frontal, mit eigener Farbe) ----------
// Arbeitskleidung (Schürzen-Farben, frühere Mitarbeiter-Figuren)
const STAFF_COL = { hase: '#35452F', fuchs: '#ffffff', igel: '#ff8fab', waschbaer: '#6a994e', eule: '#35452F' };
const CRIT = {
  hase: { body: '#ece6dc', light: '#ffffff', ear: 'long', inner: '#f7b6c2' },
  fuchs: { body: '#e8742c', light: '#fff3e6', ear: 'point', inner: '#5a2d12' },
  igel: { body: '#c49a6c', light: '#f1dcc0', ear: 'round', spikes: '#6b4a2f' },
  waschbaer: { body: '#9aa0a6', light: '#e9ecef', ear: 'round', mask: '#3d4247' },
  eule: { body: '#a47148', light: '#f3d9b1', ear: 'tuft', owl: true },
  baer: { body: '#8b5a2b', light: '#d9b38c', ear: 'round' },
};
// Die Kinder auf dem Spielplatz (früher Tiere): gleiche Größe wie die Tierfiguren, Füße auf dem Boden
const KIDS = {
  hase:      { skin: '#f6d2b8', hair: '#f2c94c', shirt: '#e63946', pants: '#e63946', dress: true, style: 'pigtails' },   // Mia
  fuchs:     { skin: '#f1c7a5', hair: '#b5541c', shirt: '#4dabf7', pants: '#495057', style: 'cap', cap: '#ffd166' },     // Paul
  igel:      { skin: '#a8714f', hair: '#2b1d14', shirt: '#ffd166', pants: '#118ab2', style: 'bun' },                    // Ida
  waschbaer: { skin: '#d9a57e', hair: '#1f1a17', shirt: '#52b788', pants: '#6c4f3d', style: 'short', glasses: true, stripes: true }, // Willi
  eule:      { skin: '#f6d2b8', hair: '#7a4a2a', shirt: '#9b5de5', pants: '#343a40', style: 'long', band: '#ef476f' },   // Emma
  leo:       { skin: '#e0ac85', hair: '#3b2a1e', shirt: '#f77f00', pants: '#1d3557', style: 'short', band: '#06d6a0' },  // Leo: sportlich, Stirnband
};
function drawKid(c, id, x, y, s, t = 0, o = {}) {
  const K = KIDS[id];
  c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round';
  if (!o.noShadow) { c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, 0, 0, 15, 5.5); c.fill(); }
  const bob = Math.sin(t * 2.5 + (o.ph || 0)) * 1.2; c.translate(0, -bob);
  // Haare hinten (lange Haare / Zöpfe)
  if (K.style === 'long') { rrPath(c, -14, -44, 28, 30, 10); fs(c, K.hair, 2.5); }
  if (K.style === 'pigtails') { const sw = Math.sin(t * 3 + (o.ph || 0)) * 0.15; [-1, 1].forEach(d => { c.save(); c.translate(d * 12, -36); c.rotate(d * (0.5 + sw)); ell(c, d * 4, 6, 4.5, 8); fs(c, K.hair, 2.5); c.restore(); }); }
  // Beine + Schuhe
  rrPath(c, -7, -12, 5.5, 10, 2.5); fs(c, K.dress ? K.skin : K.pants, 2); rrPath(c, 1.5, -12, 5.5, 10, 2.5); fs(c, K.dress ? K.skin : K.pants, 2);
  ell(c, -4.5, -2, 4.5, 3); fs(c, '#343a40', 2); ell(c, 4.5, -2, 4.5, 3); fs(c, '#343a40', 2);
  // Körper: Kleid oder T-Shirt
  if (K.dress) { polyPath(c, [[-6, -24], [6, -24], [12, -9], [-12, -9]]); fs(c, K.shirt, 2.5); }
  else { rrPath(c, -9, -25, 18, 15, 5); fs(c, K.shirt, 2.5); if (K.stripes) { c.save(); rrPath(c, -9, -25, 18, 15, 5); c.clip(); for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(-9, -22 + i * 4.5, 18, 1.8); } c.restore(); } }
  // Arme (einer winkt)
  const wave = o.wave ? Math.sin(t * 9) * 0.5 : 0;
  c.save(); c.translate(-9, -22); c.rotate(0.35); rrPath(c, -2.5, 0, 5, 11, 2.5); fs(c, K.shirt, 2); ell(c, 0, 12, 2.6, 2.6); fs(c, K.skin, 1.5); c.restore();
  c.save(); c.translate(9, -22); c.rotate(-0.35 + wave - (o.wave ? 2.2 : 0)); rrPath(c, -2.5, 0, 5, 11, 2.5); fs(c, K.shirt, 2); ell(c, 0, 12, 2.6, 2.6); fs(c, K.skin, 1.5); c.restore();
  // Kopf
  ell(c, 0, -36, 12, 12); fs(c, K.skin, 2.5);
  ell(c, -12, -35, 2.5, 3.5); fs(c, K.skin, 2); ell(c, 12, -35, 2.5, 3.5); fs(c, K.skin, 2);
  // Haare vorne
  c.fillStyle = K.hair; c.strokeStyle = OL; c.lineWidth = 2.5;
  if (K.style === 'cap') {
    c.beginPath(); c.arc(0, -39, 12.5, Math.PI, 0); c.closePath(); fs(c, K.cap, 2.5); rrPath(c, -16, -41, 9, 4, 2); fs(c, K.cap, 2);
    c.beginPath(); c.moveTo(-11, -38); c.quadraticCurveTo(-6, -34, -2, -38); c.quadraticCurveTo(3, -34, 8, -38); c.lineTo(11, -38); c.lineTo(11, -40); c.lineTo(-11, -40); c.closePath(); c.fillStyle = K.hair; c.fill();
  } else {
    c.beginPath(); c.moveTo(-12.5, -34); c.quadraticCurveTo(-13, -50, 0, -49.5); c.quadraticCurveTo(13, -50, 12.5, -34);
    if (K.style === 'short') { c.quadraticCurveTo(6, -42, -2, -40); c.quadraticCurveTo(-8, -42, -12.5, -34); }
    else { c.quadraticCurveTo(4, -43, -3, -41); c.quadraticCurveTo(-9, -39, -12.5, -34); }
    c.closePath(); fs(c, K.hair, 2.5);
    if (K.style === 'bun') { ell(c, 0, -51, 6.5, 5.5); fs(c, K.hair, 2.5); for (let i = 0; i < 5; i++) { ell(c, -10 + i * 5, -46 + Math.abs(i - 2), 2.6, 2.6); c.fillStyle = 'rgba(255,255,255,.12)'; c.fill(); } }
    if (K.style === 'pigtails') { ell(c, -12, -36, 2.5, 2.5); fs(c, '#ef476f', 1.5); ell(c, 12, -36, 2.5, 2.5); fs(c, '#ef476f', 1.5); }
    if (K.band) { c.beginPath(); c.arc(0, -37, 12.5, Math.PI * 1.08, Math.PI * 1.92); c.lineWidth = 3; c.strokeStyle = K.band; c.stroke(); }
  }
  // Gesicht
  ell(c, -4.5, -34, 1.7, 2.2); c.fillStyle = OL; c.fill(); ell(c, 4.5, -34, 1.7, 2.2); c.fill();
  ell(c, -4, -34.8, 0.6, 0.7); c.fillStyle = '#fff'; c.fill(); ell(c, 5, -34.8, 0.6, 0.7); c.fill();
  if (K.glasses) { c.lineWidth = 1.3; c.strokeStyle = OL; ell(c, -4.5, -34, 3.6, 3.2); c.stroke(); ell(c, 4.5, -34, 3.6, 3.2); c.stroke(); c.beginPath(); c.moveTo(-1, -34.5); c.lineTo(1, -34.5); c.stroke(); }
  c.beginPath(); c.moveTo(-3, -29.5); c.quadraticCurveTo(0, -26.5, 3, -29.5); c.lineWidth = 1.5; c.strokeStyle = OL; c.stroke();
  c.fillStyle = 'rgba(255,120,120,.35)'; ell(c, -8, -30.5, 2.4, 1.6); c.fill(); ell(c, 8, -30.5, 2.4, 1.6); c.fill();
  c.restore();
}

function drawCritter(c, id, x, y, s, t = 0, o = {}) {
  if (KIDS[id]) { drawKid(c, id, x, y, s, t, o); return; }
  const C = CRIT[id];
  c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round';
  if (!o.noShadow) { c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, 0, 0, 16, 6); c.fill(); }
  const bob = Math.sin(t * 2.5 + (o.ph || 0)) * 1.2;
  c.translate(0, -bob);
  if (C.spikes) {
    c.beginPath();
    for (let i = 0; i <= 18; i++) { const a = Math.PI + (i / 18) * Math.PI, r = i % 2 ? 19 : 25; c.lineTo(Math.cos(a) * r, -26 + Math.sin(a) * r * 1.1); }
    c.lineTo(20, -10); c.lineTo(-20, -10); c.closePath(); fs(c, C.spikes);
  }
  if (C.owl) {
    ell(c, 0, -20, 15, 19); fs(c, C.body); shadeEll(c, 0, -20, 15, 19);
    ell(c, 0, -14, 9, 11); fs(c, C.light, 0);
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-4 + i * 4, -12 + (i % 2) * 4, 2, 0, Math.PI); c.lineWidth = 1.4; c.strokeStyle = '#a47148'; c.stroke(); }
    polyPath(c, [[-13, -34], [-9, -44], [-5, -35]]); fs(c, C.body);
    polyPath(c, [[13, -34], [9, -44], [5, -35]]); fs(c, C.body);
    ell(c, -6, -28, 6, 6); fs(c, '#fff', 2.5); ell(c, 6, -28, 6, 6); fs(c, '#fff', 2.5);
    ell(c, -6, -28, 2.8, 3.2); c.fillStyle = OL; c.fill(); ell(c, 6, -28, 2.8, 3.2); c.fill();
    polyPath(c, [[-2.5, -24], [2.5, -24], [0, -19]]); fs(c, '#f4a261', 1.5);
    ell(c, -15, -18, 4, 9, 0.3); fs(c, '#8a5a36', 2.5); ell(c, 15, -18, 4, 9, -0.3); fs(c, '#8a5a36', 2.5);
    ell(c, -5, -1, 4, 2.2); fs(c, '#f4a261', 2); ell(c, 5, -1, 4, 2.2); fs(c, '#f4a261', 2);
    if (o.staff) { polyPath(c, [[0, -17], [-6, -20], [-6, -14]]); fs(c, BRAND.olive, 1.5); polyPath(c, [[0, -17], [6, -20], [6, -14]]); fs(c, BRAND.olive, 1.5); }
    c.restore(); return;
  }
  // Füße + Körper
  ell(c, -7, -3, 5.5, 4); fs(c, C.body, 2.5); ell(c, 7, -3, 5.5, 4); fs(c, C.body, 2.5);
  ell(c, 0, -14, 12, 11); fs(c, C.body); shadeEll(c, 0, -14, 12, 11);
  ell(c, 0, -12, 7, 7); fs(c, C.light, 0);
  if (o.staff) { const col = STAFF_COL[id] || BRAND.olive; rrPath(c, -6.5, -21, 13, 17, 3); c.fillStyle = col; c.fill(); c.lineWidth = 1.5; c.strokeStyle = OL; c.stroke(); leaf(c, 0, -13, 0.6, col === '#ffffff' ? BRAND.lime : '#fff'); }
  // Arme (einer winkt ab und zu)
  const wave = o.wave ? Math.sin(t * 9) * 0.5 : 0;
  ell(c, -12, -15, 4, 7, 0.5); fs(c, C.body, 2.5);
  c.save(); c.translate(12, -18); c.rotate(-0.5 + wave - (o.wave ? 1.4 : 0)); ell(c, 0, 4, 4, 7); fs(c, C.body, 2.5); c.restore();
  // Ohren
  if (C.ear === 'long') {
    ell(c, -6, -52, 4.5, 12, -0.15); fs(c, C.body); ell(c, -6, -52, 2, 8, -0.15); fs(c, C.inner, 0);
    ell(c, 6, -52, 4.5, 12, 0.15); fs(c, C.body); ell(c, 6, -52, 2, 8, 0.15); fs(c, C.inner, 0);
  } else if (C.ear === 'point') {
    polyPath(c, [[-12, -38], [-11, -52], [-3, -44]]); fs(c, C.body); polyPath(c, [[12, -38], [11, -52], [3, -44]]); fs(c, C.body);
    polyPath(c, [[-10, -41], [-10, -48], [-6, -44]]); fs(c, C.inner, 0); polyPath(c, [[10, -41], [10, -48], [6, -44]]); fs(c, C.inner, 0);
  } else {
    ell(c, -10, -44, 5, 5); fs(c, C.body); ell(c, 10, -44, 5, 5); fs(c, C.body);
  }
  // Kopf
  ell(c, 0, -33, 13, 11.5); fs(c, C.body); shadeEll(c, 0, -33, 13, 11.5);
  if (id === 'fuchs') { polyPath(c, [[-12, -31], [0, -24], [12, -31], [8, -24], [0, -21], [-8, -24]]); fs(c, C.light, 0); }
  if (C.mask) { ell(c, -5, -35, 5, 3.5, 0.2); c.fillStyle = C.mask; c.fill(); ell(c, 5, -35, 5, 3.5, -0.2); c.fill(); }
  ell(c, 0, -28, 5.5, 4); fs(c, C.light, 0);
  ell(c, -5, -35, 2.2, 2.8); c.fillStyle = C.mask ? '#fff' : OL; c.fill(); ell(c, 5, -35, 2.2, 2.8); c.fill();
  if (C.mask) { ell(c, -5, -35, 1.3, 1.6); c.fillStyle = OL; c.fill(); ell(c, 5, -35, 1.3, 1.6); c.fill(); }
  ell(c, 0, -29.5, 2.4, 1.8); c.fillStyle = OL; c.fill();
  c.beginPath(); c.moveTo(-3, -26.5); c.quadraticCurveTo(0, -24, 3, -26.5); c.lineWidth = 1.5; c.strokeStyle = OL; c.stroke();
  c.fillStyle = 'rgba(255,120,120,.35)'; ell(c, -8.5, -29, 2.5, 1.7); c.fill(); ell(c, 8.5, -29, 2.5, 1.7); c.fill();
  if (id === 'baer' && o.chef) { // Chefkoch: Kochmütze + Schürze
    rrPath(c, -6, -20, 12, 16, 3); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = OL; c.stroke();
    rrPath(c, -9, -50, 18, 10, 2); fs(c, '#fff', 2.5);
    for (const [dx, dy, rr] of [[-8, -56, 7], [0, -60, 8], [8, -56, 7]]) { ell(c, dx, dy, rr, rr); fs(c, '#fff', 2.5); }
    rrPath(c, -8, -51, 16, 6, 2); c.fillStyle = '#fff'; c.fill();
  } else if (id === 'baer' && o.waiter) { // Kellner: Fliege + Schürze mit Blatt
    rrPath(c, -7, -20, 14, 17, 3); c.fillStyle = BRAND.olive; c.fill(); c.lineWidth = 1.5; c.strokeStyle = OL; c.stroke(); leaf(c, 0, -12, 0.6, BRAND.lime);
    polyPath(c, [[0, -24], [-6, -27], [-6, -21]]); fs(c, '#e63946', 1.5); polyPath(c, [[0, -24], [6, -27], [6, -21]]); fs(c, '#e63946', 1.5);
  } else if (id === 'baer') { // Platzwart-Mütze + Pfeife
    c.beginPath(); c.arc(0, -41, 10, Math.PI, 0); c.closePath(); fs(c, '#e63946', 2.5);
    ell(c, 0, -41, 13, 3); fs(c, '#e63946', 2.5);
    line(c, 3, -16, 6, -7, 1.5, '#adb5bd', false); ell(c, 7, -6, 3, 2); fs(c, '#ced4da', 1.5);
  }
  c.restore();
}

// Deko: Taube (hat nie ein Symbol)
function drawPigeon(c, x, y, s, t, dir, flying) {
  c.save(); c.translate(x, y); c.scale(s * dir, s); c.lineJoin = 'round';
  if (!flying) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, 0, 0, 9, 3); c.fill(); }
  const peck = flying ? 0 : Math.max(0, Math.sin(t * 5)) * 3;
  ell(c, 0, -8, 9, 6); fs(c, '#9aa5b1', 2);
  if (flying) { const f = Math.sin(t * 30) * 8; polyPath(c, [[-3, -10], [4, -10], [0, -18 - f]]); fs(c, '#7b8794', 2); }
  else { ell(c, -2, -9, 6, 3.5); fs(c, '#7b8794', 1.5); }
  ell(c, 7, -13 + peck, 4, 4); fs(c, '#6c7a89', 2);
  ell(c, 8.5, -14 + peck, 0.9, 0.9); c.fillStyle = OL; c.fill();
  polyPath(c, [[10.5, -13 + peck], [14, -12 + peck], [10.5, -11.5 + peck]]); fs(c, '#f4a261', 1);
  polyPath(c, [[-8, -9], [-14, -11], [-13, -6]]); fs(c, '#6c7a89', 1.5);
  if (!flying) { line(c, -1, -2, -1, 0, 1.4, '#e76f51', false); line(c, 2, -2, 2, 0, 1.4, '#e76f51', false); }
  c.restore();
}

// ---------- Zutaten-Pool Spielplatz (final laut Konzept, genau diese 20) ----------
const ITEMS = {
  ball: { n: 'Ball', d(c, f) {
    ell(c, 0, 0, 17, 17); fs(c, f('#fff'));
    ['#e63946', '#ffb703', '#219ebc'].forEach((k, i) => { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 17, i * TAU / 3 - 1.3, i * TAU / 3 - 0.3); c.closePath(); fs(c, f(k), 0); });
    ell(c, 0, 0, 17, 17); fs(c, null); ell(c, 0, 0, 4, 4); fs(c, f('#fff'), 2);
  } },
  springseil: { n: 'Springseil', d(c, f) {
    c.beginPath(); c.moveTo(-13, -8); c.bezierCurveTo(-22, 26, 22, 26, 13, -8);
    c.lineWidth = 7; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3.5; c.strokeStyle = f('#f4a261'); c.stroke();
    rrPath(c, -18, -21, 9, 15, 4); fs(c, f('#e63946')); rrPath(c, 9, -21, 9, 15, 4); fs(c, f('#e63946'));
  } },
  sandfoermchen: { n: 'Sandförmchen', d(c, f) {
    starPath(c, 0, 2, 19, 9); fs(c, f('#ffd166')); starPath(c, 0, 2, 11, 5); fs(c, f('#f4b400'), 2);
  } },
  sandschaufel: { n: 'Sandschaufel', d(c, f) {
    c.rotate(0.5); rrPath(c, -3, -22, 6, 24, 3); fs(c, f('#2a9d8f'));
    rrPath(c, -7, -24, 14, 6, 3); fs(c, f('#2a9d8f'));
    polyPath(c, [[-10, 1], [10, 1], [8, 18], [0, 22], [-8, 18]]); fs(c, f('#2a9df4'));
  } },
  schaukelkissen: { n: 'Schaukel-Kissen', d(c, f) {
    rrPath(c, -19, -12, 38, 24, 10); fs(c, f('#f28482'));
    rrPath(c, -14, -7, 28, 14, 6); fs(c, null, 1.5, f('#b5446e'));
    ell(c, 0, 0, 3, 3); fs(c, f('#b5446e'), 1.5);
  } },
  frisbee: { n: 'Frisbee', d(c, f) {
    ell(c, 0, 3, 20, 10); fs(c, f('#7b2cbf')); ell(c, 0, 0, 20, 9); fs(c, f('#9b5de5')); ell(c, 0, -1, 11, 4.5); fs(c, f('#c39bf0'), 2);
  } },
  kreide: { n: 'Kreide', d(c, f) {
    ['#ff8fab', '#8ecae6', '#ffe066'].forEach((k, i) => { c.save(); c.translate(-11 + i * 11, 1); c.rotate(-0.35 + i * 0.1); rrPath(c, -4, -16, 8, 32, 3.5); fs(c, f(k)); c.restore(); });
  } },
  luftballon: { n: 'Luftballon', d(c, f) {
    c.beginPath(); c.moveTo(0, 12); c.quadraticCurveTo(6, 17, 0, 23); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
    ell(c, 0, -5, 13, 16); fs(c, f('#ef233c')); polyPath(c, [[-3, 13], [3, 13], [0, 9]]); fs(c, f('#ef233c'), 2);
    ell(c, -5, -11, 3, 5, 0.3); fs(c, f('rgba(255,255,255,.6)'), 0);
  } },
  drachen: { n: 'Drachen', d(c, f) {
    c.beginPath(); c.moveTo(0, 15); c.bezierCurveTo(4, 20, -6, 22, 2, 25); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
    polyPath(c, [[0, -21], [15, -3], [0, 15], [-15, -3]]); fs(c, f('#06d6a0'));
    polyPath(c, [[0, -21], [15, -3], [0, -3]]); fs(c, f('#ffd166'), 0); polyPath(c, [[0, -3], [-15, -3], [0, 15]]); fs(c, f('#ffd166'), 0);
    polyPath(c, [[0, -21], [15, -3], [0, 15], [-15, -3]]); fs(c, null);
    line(c, 0, -21, 0, 15, 1.5, OL, false); line(c, -15, -3, 15, -3, 1.5, OL, false);
  } },
  seifenblasen: { n: 'Seifenblasen-Flasche', d(c, f) {
    rrPath(c, -14, -5, 15, 24, 4); fs(c, f('#90e0ef')); rrPath(c, -12, -11, 11, 7, 2); fs(c, f('#ff70a6'));
    line(c, 0, -8, 9, -14, 2, OL, false); ell(c, 12, -17, 5, 5); fs(c, null, 2);
    ell(c, 13, 3, 5, 5); fs(c, f('rgba(190,235,255,.8)'), 2); ell(c, 8, 13, 3, 3); fs(c, f('rgba(190,235,255,.8)'), 2);
  } },
  hulahoop: { n: 'Hula-Hoop-Reifen', d(c, f) {
    ell(c, 0, 0, 18, 13); c.lineWidth = 9; c.strokeStyle = OL; c.stroke(); c.lineWidth = 5; c.strokeStyle = f('#ff006e'); c.stroke();
    c.setLineDash([5, 6]); c.strokeStyle = f('#ffbe0b'); c.stroke(); c.setLineDash([]);
  } },
  eimerchen: { n: 'Eimerchen', d(c, f) {
    c.beginPath(); c.arc(0, -8, 13, Math.PI, 0); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
    polyPath(c, [[-14, -8], [14, -8], [10, 17], [-10, 17]]); fs(c, f('#ff9f1c')); ell(c, 0, -8, 14, 4); fs(c, f('#ffbf69'));
  } },
  pluesch: { n: 'Plüschtier', d(c, f) {
    ell(c, 0, 12, 11, 9); fs(c, f('#a0673a'));
    ell(c, -10, -15, 5, 5); fs(c, f('#a0673a')); ell(c, 10, -15, 5, 5); fs(c, f('#a0673a'));
    ell(c, 0, -6, 12.5, 11); fs(c, f('#a0673a')); ell(c, 0, -2, 5.5, 4); fs(c, f('#e3c09b'), 0);
    ell(c, -4.5, -8, 1.8, 1.8); c.fillStyle = f(OL); c.fill(); ell(c, 4.5, -8, 1.8, 1.8); c.fill(); ell(c, 0, -3.5, 2, 1.5); c.fill();
  } },
  helm: { n: 'Fahrradhelm', d(c, f) {
    c.beginPath(); c.moveTo(-19, 7); c.quadraticCurveTo(-19, -17, 0, -17); c.quadraticCurveTo(19, -17, 19, 7); c.closePath(); fs(c, f('#4361ee'));
    [-8, 0, 8].forEach(x => { rrPath(c, x - 2, -14, 4, 12, 2); fs(c, f('#4cc9f0'), 0); });
    c.beginPath(); c.moveTo(-12, 7); c.quadraticCurveTo(0, 20, 12, 7); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke();
  } },
  roller: { n: 'Roller', d(c, f) {
    line(c, 11, 8, 14, -16, 4, f('#e63946')); line(c, 7, -17, 21, -17, 4, f('#343a40'));
    rrPath(c, -18, 5, 30, 6, 3); fs(c, f('#adb5bd'));
    ell(c, -14, 14, 4.5, 4.5); fs(c, f('#343a40'), 2); ell(c, 13, 14, 4.5, 4.5); fs(c, f('#343a40'), 2);
  } },
  murmeln: { n: 'Murmeln', d(c, f) {
    [[-8, 5, 8, '#4cc9f0'], [8, 7, 7, '#f72585'], [0, -8, 7.5, '#80ed99']].forEach(([x, y, r, k]) => {
      ell(c, x, y, r, r); fs(c, f(k)); c.beginPath(); c.arc(x, y, r * 0.5, 0.5, 2.6); c.lineWidth = 1.5; c.strokeStyle = f('rgba(255,255,255,.8)'); c.stroke();
    });
  } },
  kreisel: { n: 'Kreisel', d(c, f) {
    rrPath(c, -2.5, -20, 5, 13, 2); fs(c, f('#8d5a3b'), 2.5);
    polyPath(c, [[-16, -6], [16, -6], [0, 19]]); fs(c, f('#ffd60a')); ell(c, 0, -6, 16, 5); fs(c, f('#ef476f'));
  } },
  springball: { n: 'Springball', d(c, f) {
    [-1, 1].forEach(s => { c.beginPath(); c.arc(0, 21, 6 + 4 * (s + 1), Math.PI * 1.2, Math.PI * 1.8); c.lineWidth = 1.8; c.strokeStyle = f('#adb5bd'); c.stroke(); });
    ell(c, 0, -2, 14, 14); fs(c, f('#70e000'));
    c.beginPath(); c.moveTo(-14, -2); c.bezierCurveTo(-5, -12, 5, 8, 14, -2); c.lineWidth = 3; c.strokeStyle = f('#ffee32'); c.stroke();
  } },
  bauklotz: { n: 'Bauklotz', d(c, f) {
    polyPath(c, [[-14, -6], [-7, -14], [16, -14], [9, -6]]); fs(c, f('#ff6b6b'));
    polyPath(c, [[9, -6], [16, -14], [16, 9], [9, 17]]); fs(c, f('#b5172b'));
    rrPath(c, -14, -6, 23, 23, 2); fs(c, f('#e63946'));
    if (!f.sil) txt(c, 'A', -2.5, 6, 15, '#fff', 'center', null);
  } },
  wasserpistole: { n: 'Wasserpistole', d(c, f) {
    c.save(); c.translate(1, 4); c.rotate(0.25); rrPath(c, -4, -2, 9, 16, 3); fs(c, f('#0096c7')); c.restore();
    rrPath(c, 13, -6, 7, 5, 2); fs(c, f('#ffd60a'), 2);
    rrPath(c, -17, -9, 31, 11, 5); fs(c, f('#00b4d8'));
    ell(c, -8, -13, 7, 5); fs(c, f('#ffd60a'));
  } },
};
const ITEM_IDS = Object.keys(ITEMS);
function drawItem(c, id, x, y, size, sil) {
  c.save(); c.translate(x, y); const k = size / 44; c.scale(k, k);
  c.lineJoin = 'round'; c.lineCap = 'round';
  const prev = OL;
  let f;
  if (sil) { OL = '#2a2340'; f = () => '#2a2340'; f.sil = true; } else { f = col => col; }
  ITEMS[id].d(c, f);
  OL = prev;
  c.restore();
}

// Sandförmchen-Formen (Memory)
const MOLDS = ['star', 'heart', 'fish', 'flower', 'moon', 'shell'];
function drawMold(c, shape, x, y, size, col) {
  c.save(); c.translate(x, y); const k = size / 44; c.scale(k, k); c.lineJoin = 'round';
  const inner = () => { c.globalAlpha = 0.35; c.fillStyle = '#fff'; c.fill(); c.globalAlpha = 1; };
  if (shape === 'star') { starPath(c, 0, 1, 20, 9); fs(c, col); starPath(c, 0, 1, 11, 5); inner(); }
  else if (shape === 'heart') { heartPath(c, 0, 1, 18); fs(c, col); heartPath(c, 0, 1, 9); inner(); }
  else if (shape === 'fish') {
    polyPath(c, [[10, 0], [21, -11], [21, 11]]); fs(c, col); ell(c, -3, 0, 16, 11); fs(c, col);
    ell(c, -9, -3, 2.4, 2.4); c.fillStyle = OL; c.fill(); ell(c, -2, 1, 8, 5); inner();
  } else if (shape === 'flower') {
    for (let i = 0; i < 5; i++) { const a = (i * TAU) / 5 - Math.PI / 2; ell(c, Math.cos(a) * 10, Math.sin(a) * 10, 8, 8); fs(c, col); }
    ell(c, 0, 0, 7, 7); fs(c, '#ffd166');
  } else if (shape === 'moon') {
    c.beginPath(); c.arc(0, 0, 18, 0.6, TAU - 0.6, false); c.arc(9, -2, 13, TAU - 1.15, 1.15, true); c.closePath(); fs(c, col);
  } else if (shape === 'shell') {
    c.beginPath(); c.moveTo(0, 16); c.lineTo(-19, -4); c.quadraticCurveTo(0, -26, 19, -4); c.closePath(); fs(c, col);
    for (let i = -2; i <= 2; i++) line(c, 0, 14, i * 8, -10 - (2 - Math.abs(i)) * 2, 1.6, OL, false);
  }
  c.restore();
}
const MOLD_COLS = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#da77f2', '#ffa94d'];

// ---------- Hackschnitzel-Farben (hell, warm) ----------
const CHIP_BASE = '#c19c72';
const CHIP_COLS = ['#d2ad83', '#ad875f', '#e1c39b', '#a27c55', '#e9d0ab', '#c8a27a'];

// ---------- Geschichte "Der neue Helfer": ein Ausrüstungsteil pro Bereich ----------
const STAGE_ORDER = ['gastraum', 'kueche', 'aussen', 'chalet', 'spielplatz', 'parkplatz'];
const OUTFIT_OF = { gastraum: 'fliege', kueche: 'schuerze', aussen: 'brille', chalet: 'schal', spielplatz: 'kappe', parkplatz: 'weste' };
function drawOutfitIcon(c, id, x, y, s, sil) {
  c.save(); c.translate(x, y); const k = s / 40; c.scale(k, k); c.lineJoin = 'round'; c.lineCap = 'round';
  const prev = OL; let f = col => col;
  if (sil) { OL = 'rgba(40,30,25,.55)'; f = () => 'rgba(60,45,35,.35)'; }
  if (id === 'fliege') { polyPath(c, [[0, 0], [-17, -10], [-17, 10]]); fs(c, f('#e63946')); polyPath(c, [[0, 0], [17, -10], [17, 10]]); fs(c, f('#e63946')); ell(c, 0, 0, 5, 6); fs(c, f('#b5172b')); }
  else if (id === 'schuerze') { polyPath(c, [[-10, -17], [10, -17], [12, -6], [16, 18], [-16, 18], [-12, -6]]); fs(c, f('#fff')); rrPath(c, -7, 2, 14, 9, 2); fs(c, f('#e9ecef'), 2); line(c, -12, -6, -20, -10, 2, OL, false); line(c, 12, -6, 20, -10, 2, OL, false); }
  else if (id === 'brille') { ell(c, -10, 0, 9, 7); fs(c, f('#343a40')); ell(c, 10, 0, 9, 7); fs(c, f('#343a40')); line(c, -2, -1, 2, -1, 2.5, OL, false); if (!sil) { ell(c, -13, -3, 2.5, 1.5); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); } }
  else if (id === 'schal') { rrPath(c, -18, -10, 36, 10, 5); fs(c, f('#4361ee')); rrPath(c, 4, -2, 10, 22, 4); fs(c, f('#4361ee')); if (!sil) { line(c, -10, -9, -10, -1, 3, '#f8f9fa', false); line(c, 0, -9, 0, -1, 3, '#f8f9fa', false); line(c, 5, 8, 13, 8, 3, '#f8f9fa', false); } }
  else if (id === 'kappe') { c.beginPath(); c.arc(-2, 4, 15, Math.PI, 0); c.closePath(); fs(c, f('#5aa13a')); ell(c, 15, 4, 11, 3.5); fs(c, f('#5aa13a')); ell(c, -2, -11, 2.5, 2.5); fs(c, f('#fff'), 1.5); }
  else if (id === 'weste') { polyPath(c, [[-14, -16], [-5, -16], [0, -6], [5, -16], [14, -16], [16, 18], [-16, 18]]); fs(c, f('#ff9f1c')); if (!sil) { line(c, -15, 6, 15, 6, 3.5, '#e9ecef', false); line(c, -15, 12, 15, 12, 3.5, '#e9ecef', false); } }
  OL = prev; c.restore();
}

// ---------- Ausgangstor (Endlevel jeder Stage) ----------
function drawGate(c, x, y, s, open, locked, t = 0) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round';
  c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, 0, 4, 70, 10); c.fill();
  rrPath(c, -62, -96, 14, 100, 4); fs(c, '#6c757d', 3); rrPath(c, 48, -96, 14, 100, 4); fs(c, '#6c757d', 3);
  ell(c, -55, -98, 9, 5); fs(c, '#495057', 2.5); ell(c, 55, -98, 9, 5); fs(c, '#495057', 2.5);
  const leaf = (dir) => {
    const w = 48 * (1 - open * 0.85);
    c.save(); c.translate(dir * -48, 0);
    rrPath(c, dir > 0 ? 0 : -w, -84, w, 80, 4); fs(c, '#adb5bd', 3);
    for (let i = 1; i < 5; i++) { const bx = dir > 0 ? (w * i) / 5 : -(w * i) / 5; line(c, bx, -80, bx, -8, 2, '#6c757d', false); }
    line(c, dir > 0 ? 0 : -w, -44, dir > 0 ? w : 0, -44, 3, '#6c757d', false);
    c.restore();
  };
  leaf(1); leaf(-1);
  if (locked) { const b = Math.sin(t * 3) * 2; icon(c, 'lock', 0, -46 + b, 30); }
  c.restore();
}
