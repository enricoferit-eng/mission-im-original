'use strict';
// ---------- Stage "Küche": nach den Fotos aus der Küche vom Original ----------
// Weiße Fliesen, grauer Sprenkelboden, Edelstahl-Zeilen: Spülstraße mit Haube, Kombidämpfer, schwarzer Doppelstock-Flammkuchenofen,
// Herdzeile mit Induktion + Fritteuse, Pass mit Wärmebrücke und Bestell-Bildschirm, Salat-Kühltheke, Regale mit Behältern,
// dahinter das Lager: Kühlraum (gelbes Warnschild), Getränkekisten, Fässer, Getränkekühlschrank.

// ---- Mitarbeiter der Küche (Menschen, gleicher Stil wie die Kinder, nur größer) ----
const STAFF_PEOPLE = {
  k_marco: { skin: '#f1c7a5', hair: null, jacket: '#212529', pipe: '#95C11F', pants: '#4a6fa5', shoes: '#f8f9fa', hat: null },          // Chefkoch, schwarze Jacke
  k_luca: { skin: '#d9a57e', hair: '#2b1d14', jacket: '#f8f9fa', pipe: '#adb5bd', pants: '#495057', shoes: '#343a40', hat: 'toque' },     // Flammkuchen-Bäcker
  k_tom: { skin: '#a8714f', hair: '#1f1a17', curly: true, jacket: '#adb5bd', apron: '#3a50a0', pants: '#343a40', shoes: '#212529', gloves: '#ffd166' }, // Spüler
  k_nina: { skin: '#f6d2b8', hair: '#e9c46a', pony: true, jacket: '#868e96', pants: '#343a40', shoes: '#495057' },                       // Lager
  k_lea: { skin: '#f1c7a5', hair: '#7a4a2a', bun: true, jacket: '#d62828', apron: '#212529', leaf: true, pants: '#212529', shoes: '#212529' }, // Service, rotes Shirt
};
function drawPerson(c, id, x, y, s, t = 0, o = {}) {
  const P = STAFF_PEOPLE[id];
  c.save(); c.translate(x, y); c.scale(s * (P.kid ? 0.82 : 1), s * (P.kid ? 0.82 : 1)); c.lineJoin = 'round'; c.lineCap = 'round';
  if (!o.noShadow) { c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, 0, 0, 16, 6); c.fill(); }
  const bob = Math.sin(t * 2.5 + (o.ph || 0)) * 1.2; c.translate(0, -bob);
  if (P.pony) { c.save(); c.translate(-10, -50); c.rotate(0.5 + Math.sin(t * 3) * 0.12); ell(c, -2, 8, 4.5, 10); fs(c, P.hair, 2.5); c.restore(); }
  if (P.long) { rrPath(c, -14, -58, 28, 30, 10); fs(c, P.hair, 2.5); }
  // Beine (oder Rock)
  if (o.sit) { /* sitzt: Beine sind unter dem Tisch */ }
  else if (P.skirt) { polyPath(c, [[-11, -20], [11, -20], [14, -6], [-14, -6]]); fs(c, P.skirt, 2); rrPath(c, -6, -8, 4, 8, 2); fs(c, P.skin, 1.5); rrPath(c, 2, -8, 4, 8, 2); fs(c, P.skin, 1.5); }
  else { rrPath(c, -8, -18, 6.5, 16, 3); fs(c, P.pants, 2); rrPath(c, 1.5, -18, 6.5, 16, 3); fs(c, P.pants, 2); }
  if (!o.sit) { ell(c, -5, -2, 5.5, 3.2); fs(c, P.shoes, 2); ell(c, 5, -2, 5.5, 3.2); fs(c, P.shoes, 2); }
  // Oberkörper (Kochjacke/Shirt)
  rrPath(c, -11, -38, 22, 23, 6); fs(c, P.jacket, 2.5);
  if (P.check) { c.save(); rrPath(c, -11, -38, 22, 23, 6); c.clip(); c.fillStyle = P.check; for (let k = -3; k < 4; k++) { c.fillRect(k * 6, -38, 2.5, 23); c.fillRect(-11, -36 + k * 6, 22, 2.5); } c.restore(); rrPath(c, -11, -38, 22, 23, 6); fs(c, null, 2.5); }
  if (P.knit) { for (let k = 0; k < 2; k++) line(c, -10, -31 + k * 7, 10, -31 + k * 7, 2, P.knit, false); for (let m = -2; m <= 2; m++) { ell(c, m * 4, -27.5, 1.3, 1.3); c.fillStyle = P.knit; c.fill(); } }
  if (P.vest) { polyPath(c, [[-11, -36], [-3, -36], [0, -30], [3, -36], [11, -36], [11, -16], [-11, -16]]); fs(c, P.vest, 2); line(c, -10, -24, 10, -24, 2.5, '#e9ecef', false); line(c, -10, -20, 10, -20, 2.5, '#e9ecef', false); }
  if (P.pipe) { line(c, -11, -30, 11, -30, 1.4, P.pipe, false); for (let k = 0; k < 3; k++) { ell(c, -4, -33 + k * 6, 1.3, 1.3); c.fillStyle = P.pipe; c.fill(); ell(c, 4, -33 + k * 6, 1.3, 1.3); c.fill(); } }
  if (P.apron) { rrPath(c, -9, -28, 18, 22, 4); fs(c, P.apron, 2); if (P.apron === '#3a50a0') { c.save(); rrPath(c, -9, -28, 18, 22, 4); c.clip(); c.fillStyle = 'rgba(255,255,255,.35)'; for (let k = -2; k < 3; k++) { c.fillRect(k * 5, -28, 2, 22); c.fillRect(-9, -26 + k * 5, 18, 2); } c.restore(); } if (P.leaf) leaf(c, 0, -18, 0.6, BRAND.lime); }
  if (P.scarf) { rrPath(c, -11, -41, 22, 7, 3.5); fs(c, P.scarf, 2); rrPath(c, 3, -37, 6, 14, 3); fs(c, P.scarf, 2); }
  // Arme
  const wave = o.wave ? Math.sin(t * 9) * 0.5 : 0, hand = P.gloves || P.skin;
  c.save(); c.translate(-11, -35); c.rotate(0.3); rrPath(c, -3, 0, 6, 15, 3); fs(c, P.sleeve || P.jacket, 2); ell(c, 0, 16, 3, 3); fs(c, hand, 1.5); c.restore();
  if (P.hold && !o.wave) { c.save(); c.translate(15, -20); P.hold(c, t); c.restore(); }
  c.save(); c.translate(11, -35); c.rotate(-0.3 + wave - (o.wave ? 2.2 : 0)); rrPath(c, -3, 0, 6, 15, 3); fs(c, P.sleeve || P.jacket, 2); ell(c, 0, 16, 3, 3); fs(c, hand, 1.5); c.restore();
  // Kopf
  ell(c, 0, -50, 12, 12); fs(c, P.skin, 2.5); ell(c, -12, -49, 2.4, 3.4); fs(c, P.skin, 2); ell(c, 12, -49, 2.4, 3.4); fs(c, P.skin, 2);
  if (P.beard) { c.beginPath(); c.moveTo(-11.5, -50); c.quadraticCurveTo(-11, -36, 0, -35); c.quadraticCurveTo(11, -36, 11.5, -50); c.quadraticCurveTo(6, -43, 0, -43.5); c.quadraticCurveTo(-6, -43, -11.5, -50); c.closePath(); fs(c, P.beard, 2); }
  if (P.hair) {
    c.beginPath(); c.moveTo(-12.5, -48); c.quadraticCurveTo(-13, -64, 0, -63.5); c.quadraticCurveTo(13, -64, 12.5, -48); c.quadraticCurveTo(5, -56, -3, -55); c.quadraticCurveTo(-9, -53, -12.5, -48); c.closePath(); fs(c, P.hair, 2.5);
    if (P.curly) for (let k = 0; k < 6; k++) { ell(c, -11 + k * 4.4, -59 + Math.abs(k - 2.5), 3, 3); fs(c, P.hair, 1.5); }
    if (P.bun) { ell(c, 0, -66, 6, 5); fs(c, P.hair, 2.5); }
  } else if (!P.hat) { ell(c, -4, -58, 4, 2); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); }   // Glatze glänzt
  const hc = P.hatCol || '#e63946';
  if (P.hat === 'toque') { rrPath(c, -10, -66, 20, 10, 2); fs(c, '#fff', 2.5); for (const [dx, dy, rr] of [[-8, -71, 7], [0, -75, 8], [8, -71, 7]]) { ell(c, dx, dy, rr, rr); fs(c, '#fff', 2.5); } rrPath(c, -9, -67, 18, 6, 2); c.fillStyle = '#fff'; c.fill(); }
  else if (P.hat === 'beanie') { c.beginPath(); c.moveTo(-13, -54); c.quadraticCurveTo(-13, -70, 0, -70); c.quadraticCurveTo(13, -70, 13, -54); c.closePath(); fs(c, hc, 2.5); rrPath(c, -13.5, -57, 27, 6, 3); fs(c, P.hatBand || '#f8f9fa', 2); if (P.bobble) { ell(c, 0, -72, 5, 5); fs(c, P.bobble, 2); } }
  else if (P.hat === 'cap') { c.beginPath(); c.moveTo(-12.5, -55); c.quadraticCurveTo(-12, -67, 0, -67); c.quadraticCurveTo(12, -67, 12.5, -55); c.closePath(); fs(c, hc, 2.5); ell(c, 9, -55, 10, 3); fs(c, hc, 2); }
  else if (P.hat === 'flatcap') { c.beginPath(); c.moveTo(-13, -55); c.quadraticCurveTo(-10, -66, 4, -65); c.quadraticCurveTo(15, -62, 15, -55); c.closePath(); fs(c, hc, 2.5); }
  else if (P.hat === 'straw' || P.hat === 'sunhat') { ell(c, 0, -57, 22, 5.5); fs(c, hc, 2.5); c.beginPath(); c.moveTo(-10, -57); c.quadraticCurveTo(-10, -70, 0, -70); c.quadraticCurveTo(10, -70, 10, -57); c.closePath(); fs(c, hc, 2.5); rrPath(c, -10, -61, 20, 4, 2); c.fillStyle = P.hatBand || '#e63946'; c.fill(); }
  else if (P.hat === 'party') { polyPath(c, [[-8, -60], [8, -60], [2, -80]]); fs(c, hc, 2.5); ell(c, 2, -81, 3, 3); fs(c, '#ffd166', 1.5); for (let k = 0; k < 3; k++) { ell(c, -3 + k * 3, -64 - k * 5, 1.4, 1.4); c.fillStyle = '#fff'; c.fill(); } }
  else if (P.hat === 'helmet') { c.beginPath(); c.moveTo(-13.5, -53); c.quadraticCurveTo(-13, -70, 0, -70); c.quadraticCurveTo(13, -70, 13.5, -53); c.closePath(); fs(c, hc, 2.5); for (let k = -1; k <= 1; k++) line(c, k * 5, -68, k * 6, -60, 2, 'rgba(0,0,0,.35)', false); }
  else if (P.hat === 'scarfhead') { c.beginPath(); c.moveTo(-14, -44); c.quadraticCurveTo(-15, -68, 0, -67); c.quadraticCurveTo(15, -68, 14, -44); c.quadraticCurveTo(10, -58, 0, -58); c.quadraticCurveTo(-10, -58, -14, -44); c.closePath(); fs(c, hc, 2.5); }
  ell(c, -4.5, -49, 1.7, 2.2); c.fillStyle = OL; c.fill(); ell(c, 4.5, -49, 1.7, 2.2); c.fill();
  if (P.glasses) { ell(c, -4.5, -49, 4, 3.6); c.lineWidth = 1.4; c.strokeStyle = P.glasses; c.stroke(); ell(c, 4.5, -49, 4, 3.6); c.stroke(); line(c, -0.8, -49.5, 0.8, -49.5, 1.2, P.glasses, false); }
  if (P.sun) { rrPath(c, -9, -52, 8, 5.5, 2.5); fs(c, '#212529', 1.4); rrPath(c, 1, -52, 8, 5.5, 2.5); fs(c, '#212529', 1.4); line(c, -1, -50, 1, -50, 1.2, OL, false); }
  if (!P.beard) { c.beginPath(); c.moveTo(-3, -44); c.quadraticCurveTo(0, -41, 3, -44); c.lineWidth = 1.5; c.strokeStyle = OL; c.stroke(); }
  else { c.beginPath(); c.moveTo(-2.5, -41.5); c.quadraticCurveTo(0, -39.5, 2.5, -41.5); c.lineWidth = 1.4; c.strokeStyle = OL; c.stroke(); }
  if (P.stache) { c.beginPath(); c.moveTo(-6, -44); c.quadraticCurveTo(0, -47, 6, -44); c.quadraticCurveTo(0, -43, -6, -44); fs(c, P.stache, 1.2); }
  c.fillStyle = 'rgba(255,120,120,.3)'; ell(c, -8, -45.5, 2.3, 1.5); c.fill(); ell(c, 8, -45.5, 2.3, 1.5); c.fill();
  c.restore();
}
{ const _dc = drawCritter; drawCritter = function (c, id, x, y, s, t, o) { if (STAFF_PEOPLE[id]) return drawPerson(c, id, x, y, s, t, o); return _dc(c, id, x, y, s, t, o); }; }
Object.assign(NPC_NAMES, { k_marco: 'Marco', k_luca: 'Luca', k_tom: 'Tom', k_nina: 'Nina', k_lea: 'Lea' });
Object.assign(NPC_SHORT, { k_marco: 'Marco', k_luca: 'Luca', k_tom: 'Tom', k_nina: 'Nina', k_lea: 'Lea' });
Object.assign(NPC_LINES, {
  k_marco: 'Heute ist richtig was los in der Küche, und mir fehlen Sachen!',
  k_luca: 'Gleich müssen die Flammkuchen in den Ofen, aber meine Sachen sind weg!',
  k_tom: 'Beim Spülen ist mir einiges verloren gegangen!',
  k_nina: 'Im Lager ist alles durcheinander. Hilfst du mir suchen?',
  k_lea: 'Die Gäste warten schon! Mir fehlen noch ein paar Sachen.',
});
Object.assign(VOICE_OF, { k_marco: { pitch: 0.8, rate: 1.0, pick: 4 }, k_luca: { pitch: 1.0, rate: 1.05, pick: 2 }, k_tom: { pitch: 0.9, rate: 0.95, pick: 6 }, k_nina: { pitch: 1.15, rate: 1.0, pick: 1 }, k_lea: { pitch: 1.25, rate: 1.05, pick: 3 } });

// ---- Küchen-Gegenstände zum Suchen ----
Object.assign(ITEMS, {
  kochloeffel: { n: 'Kochlöffel', d(c, f) { c.rotate(-0.6); rrPath(c, -3, -4, 6, 34, 3); fs(c, f('#c08b55')); ell(c, 0, -14, 8, 11); fs(c, f('#c08b55')); } },
  schneebesen: { n: 'Schneebesen', d(c, f) { c.rotate(-0.5); rrPath(c, -3.5, 4, 7, 22, 3); fs(c, f('#212529')); for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(k * 7, -14, 0, -26); c.lineWidth = 4; c.strokeStyle = OL; c.stroke(); c.lineWidth = 2; c.strokeStyle = f('#ced4da'); c.stroke(); } } },
  kelle: { n: 'Suppenkelle', d(c, f) { c.rotate(-0.4); rrPath(c, -2.5, -26, 5, 34, 2.5); fs(c, f('#adb5bd')); ell(c, 0, 12, 12, 9); fs(c, f('#ced4da')); ell(c, 0, 10, 7, 4); fs(c, f('#868e96'), 0); } },
  sieb: { n: 'Sieb', d(c, f) { rrPath(c, 12, -3, 18, 6, 3); fs(c, f('#495057')); ell(c, 0, 0, 15, 15); fs(c, f('#dee2e6')); c.save(); ell(c, 0, 0, 12, 12); c.clip(); c.strokeStyle = f('#adb5bd'); c.lineWidth = 1; for (let k = -12; k <= 12; k += 4) { c.beginPath(); c.moveTo(k, -12); c.lineTo(k, 12); c.moveTo(-12, k); c.lineTo(12, k); c.stroke(); } c.restore(); } },
  nudelholz: { n: 'Nudelholz', d(c, f) { c.rotate(-0.3); rrPath(c, -16, -7, 32, 14, 6); fs(c, f('#e9c46a')); rrPath(c, -27, -3.5, 12, 7, 3); fs(c, f('#c08b55')); rrPath(c, 15, -3.5, 12, 7, 3); fs(c, f('#c08b55')); } },
  wender: { n: 'Pfannenwender', d(c, f) { c.rotate(-0.5); rrPath(c, -3, 2, 6, 26, 3); fs(c, f('#212529')); rrPath(c, -10, -24, 20, 24, 4); fs(c, f('#ced4da')); for (let k = 0; k < 3; k++) rrPath(c, -6 + k * 5, -20, 2.4, 14, 1), c.fillStyle = f('#868e96'), c.fill(); } },
  messbecher: { n: 'Messbecher', d(c, f) { polyPath(c, [[-12, -16], [12, -16], [10, 16], [-10, 16]]); fs(c, f('rgba(220,240,255,.95)')); rrPath(c, 11, -8, 8, 14, 4); fs(c, null, 2.5); for (let k = 0; k < 4; k++) line(c, -8, -8 + k * 6, -2, -8 + k * 6, 1.4, f('#e63946'), false); } },
  tomate: { n: 'Tomate', d(c, f) { ell(c, 0, 2, 16, 14); fs(c, f('#e63946')); ell(c, -5, -3, 4, 3); c.fillStyle = f('rgba(255,255,255,.5)'); c.fill(); for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; polyPath(c, [[0, -11], [Math.cos(a) * 8, -11 + Math.sin(a) * 4], [0, -9]]); fs(c, f('#2d6a4f'), 1.5); } } },
  kaese: { n: 'Käse', d(c, f) { polyPath(c, [[-16, 10], [16, 10], [16, -2], [-16, -12]]); fs(c, f('#ffd166')); for (const [a, b, r2] of [[-6, 2, 3], [5, 4, 2.5], [9, -2, 2]]) { ell(c, a, b, r2, r2); c.fillStyle = f('#e9a03b'); c.fill(); } } },
  salatkopf: { n: 'Salatkopf', d(c, f) { for (let k = 0; k < 7; k++) { const a = (k / 7) * TAU; ell(c, Math.cos(a) * 7, Math.sin(a) * 6, 10, 8, a); fs(c, f(k % 2 ? '#74c69d' : '#95d5b2'), 2); } ell(c, 0, 0, 8, 7); fs(c, f('#b7e4c7'), 2); } },
  eieruhr: { n: 'Eieruhr', d(c, f) { ell(c, 0, 4, 14, 13); fs(c, f('#fff')); ell(c, 0, -6, 8, 6); fs(c, f('#f6d38d')); line(c, 0, 4, 0, -4, 2, OL, false); line(c, 0, 4, 6, 6, 2, OL, false); for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; line(c, Math.cos(a) * 10, 4 + Math.sin(a) * 9, Math.cos(a) * 12, 4 + Math.sin(a) * 11, 1.2, '#adb5bd', false); } } },
  topflappen: { n: 'Topflappen', d(c, f) { rrPath(c, -14, -14, 28, 28, 6); fs(c, f('#e63946')); c.save(); rrPath(c, -14, -14, 28, 28, 6); c.clip(); c.fillStyle = f('rgba(255,255,255,.45)'); for (let k = -3; k < 3; k++) { c.fillRect(k * 8, -14, 3, 28); c.fillRect(-14, k * 8, 28, 3); } c.restore(); ell(c, 10, -14, 4, 4); fs(c, null, 2); } },
});
const KUECHE_ITEMS = ['kochloeffel', 'schneebesen', 'kelle', 'sieb', 'nudelholz', 'wender', 'messbecher', 'tomate', 'kaese', 'salatkopf', 'eieruhr', 'topflappen'];

// ---- Hilfs-Zeichnungen: Edelstahl, Fliesen ----
function steel(c, x, y, w, h, r = 6) { const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#e9ecef'); g.addColorStop(0.5, '#ced4da'); g.addColorStop(1, '#dee2e6'); rrPath(c, x, y, w, h, r); fs(c, g, 3); }
function tiles(c, x, y, w, h, s = 22, col = '#fbfbfb') { c.fillStyle = col; c.fillRect(x, y, w, h); c.strokeStyle = 'rgba(0,0,0,.09)'; c.lineWidth = 1.2; for (let a = x; a <= x + w; a += s) { c.beginPath(); c.moveTo(a, y); c.lineTo(a, y + h); c.stroke(); } for (let b = y; b <= y + h; b += s) { c.beginPath(); c.moveTo(x, b); c.lineTo(x + w, b); c.stroke(); } }
function gnBox(c, x, y, w, h, col = 'rgba(230,240,248,.9)') { rrPath(c, x, y, w, h, 3); fs(c, col, 2); line(c, x + 3, y + 4, x + w - 3, y + 4, 1.2, 'rgba(255,255,255,.8)', false); }
// Arbeitszeile von oben mit sichtbarer Vorderseite (Höhe 30)
function counterBlock(c, x, y, w, h) {
  rrPath(c, x, y + h - 4, w, 34, 4); fs(c, '#adb5bd', 3);
  for (let k = 0; k < Math.floor(w / 46); k++) { rrPath(c, x + 6 + k * 46, y + h + 2, 40, 22, 3); fs(c, '#ced4da', 1.5); line(c, x + 16 + k * 46, y + h + 8, x + 36 + k * 46, y + h + 8, 2, '#868e96', false); }
  steel(c, x, y, w, h, 6);
}

// ---- Boden + Wände (fest, wird einmal gezeichnet) ----
function drawGroundKueche(g, R) {
  // grauer Sprenkelboden
  g.fillStyle = '#9aa0a6'; g.fillRect(0, 0, WORLD_W, WORLD_H);
  for (let i = 0; i < 26000; i++) { g.fillStyle = ['#8d939a', '#b1b6bb', '#a5abb0', '#7e848a', '#c3c7cb'][i % 5]; g.fillRect(R() * WORLD_W, 120 + R() * (WORLD_H - 120), 2.2, 2.2); }
  for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(255,255,255,.05)'; ell(g, R() * WORLD_W, 150 + R() * 1200, 60 + R() * 80, 30 + R() * 40); g.fill(); }
  // Bodenabläufe (Gitter)
  for (const [x, y] of [[320, 640], [700, 880], [520, 1150]]) { rrPath(g, x - 16, y - 12, 32, 24, 3); fs(g, '#495057', 2); g.strokeStyle = '#212529'; g.lineWidth = 1; for (let k = -12; k < 16; k += 5) { g.beginPath(); g.moveTo(x + k, y - 10); g.lineTo(x + k, y + 10); g.stroke(); } ell(g, x, y + 18, 30, 8); g.fillStyle = 'rgba(80,60,40,.12)'; g.fill(); }
  // Rückwand: weiße Fliesen + Regale mit Behältern
  tiles(g, 0, 0, WORLD_W, 128); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 120, WORLD_W, 8);
  rrPath(g, 380, 30, 160, 8, 2); fs(g, '#ced4da', 2); for (let k = 0; k < 5; k++) gnBox(g, 384 + k * 31, 6, 28, 24);
  rrPath(g, 600, 54, 140, 7, 2); fs(g, '#ced4da', 2); for (let k = 0; k < 4; k++) gnBox(g, 606 + k * 33, 30, 30, 24);
  ell(g, 570, 30, 15, 15); fs(g, '#fff', 3); g.strokeStyle = '#1c7ed6'; g.lineWidth = 3; g.stroke(); line(g, 570, 30, 570, 21, 2, OL, false); line(g, 570, 30, 577, 33, 2, OL, false);   // blaue Wanduhr
  rrPath(g, 470, 62, 70, 6, 2); fs(g, '#343a40', 2); [['#e63946', 478], ['#ffd166', 492], ['#212529', 506], ['#212529', 520]].forEach(([col, x]) => { rrPath(g, x, 66, 5, 26, 2); fs(g, '#dee2e6', 1.5); rrPath(g, x, 54, 5, 14, 2); fs(g, col, 1.5); });   // Magnetleiste mit Messern
  // Spülstraße: Haube, Spüle, Gitterkörbe
  steel(g, 60, 128, 270, 82, 4); rrPath(g, 70, 30, 120, 100, 6); fs(g, '#adb5bd', 3); rrPath(g, 80, 42, 100, 70, 4); fs(g, '#ced4da', 2); line(g, 95, 104, 165, 104, 4, '#868e96');
  ell(g, 255, 165, 40, 26); fs(g, '#868e96', 3); ell(g, 255, 165, 30, 18); fs(g, '#adb5bd', 2); rrPath(g, 238, 120, 6, 30, 3); fs(g, '#ced4da', 2);
  for (let k = 0; k < 2; k++) { rrPath(g, 92 + k * 60, 140, 52, 50, 3); fs(g, 'rgba(250,250,250,.9)', 2); g.strokeStyle = '#adb5bd'; g.lineWidth = 1; for (let a = 0; a < 6; a++) { g.beginPath(); g.moveTo(96 + k * 60 + a * 8, 142); g.lineTo(96 + k * 60 + a * 8, 188); g.stroke(); } }
  // Kombidämpfer mit roter Anzeige
  steel(g, 360, 120, 100, 92, 6); rrPath(g, 368, 128, 84, 18, 3); fs(g, '#495057', 2); txt(g, '180°', 392, 137, 9, '#ff4d4d', 'center', null); txt(g, '0:25', 428, 137, 9, '#ff4d4d', 'center', null); rrPath(g, 372, 152, 76, 52, 6); fs(g, '#343a40', 2.5); rrPath(g, 380, 160, 60, 36, 4); c_glow(g, 380, 160, 60, 36);
  // Mikrowelle + Fritteuse
  steel(g, 560, 128, 160, 82, 4); rrPath(g, 572, 80, 70, 46, 4); fs(g, '#dee2e6', 2.5); rrPath(g, 578, 86, 44, 34, 3); fs(g, '#343a40', 2); rrPath(g, 626, 86, 10, 34, 2); fs(g, '#495057', 1.5);
  for (let k = 0; k < 2; k++) { rrPath(g, 650 + k * 32, 138, 28, 44, 3); fs(g, '#e9c46a', 2); rrPath(g, 654 + k * 32, 130, 20, 10, 2); fs(g, '#adb5bd', 1.5); }
  // Flammkuchenofen (schwarz, Doppelstock) – auf den Fotos rechts
  rrPath(g, 760, 40, 180, 190, 8); fs(g, '#212529', 3);
  for (let k = 0; k < 2; k++) { rrPath(g, 782, 58 + k * 82, 136, 62, 6); fs(g, '#343a40', 2.5); rrPath(g, 800, 70 + k * 82, 100, 36, 4); fs(g, '#111', 2); rrPath(g, 790, 50 + k * 82, 120, 8, 3); fs(g, '#adb5bd', 1.5); }
  for (let k = 0; k < 5; k++) { rrPath(g, 770 + k * 6, 20 - k * 4, 150, 10, 3); fs(g, '#d4a373', 1.5); }   // Holzbretter-Stapel oben drauf
  // Seitenwände
  g.fillStyle = '#e9ecef'; g.fillRect(0, 120, 52, WORLD_H); g.fillRect(948, 120, 52, WORLD_H); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(48, 120, 6, WORLD_H); g.fillRect(946, 120, 6, WORLD_H);
  // Trennwand zum Lager mit zwei Durchgängen
  for (const [a, b] of [[52, 380], [480, 760], [850, 948]]) { tiles(g, a, 930, b - a, 52, 26); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(a, 978, b - a, 6); }
  // Lager: anderer Boden (heller), Holzdecke-Andeutung oben an der Trennwand
  g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(52, 984, 896, 356);
  // Unterer Rand mit Schwingtür zum Gastraum
  g.fillStyle = '#e9ecef'; g.fillRect(0, 1340, 470, 60); g.fillRect(560, 1340, 440, 60); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(0, 1336, 470, 6); g.fillRect(560, 1336, 440, 6);
  g.fillStyle = '#d6cebf'; g.fillRect(470, 1340, 90, 60);
}
function c_glow(g, x, y, w, h) { const gr = g.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, '#495057'); gr.addColorStop(1, '#212529'); g.fillStyle = gr; g.fillRect(x, y, w, h); line(g, x + 6, y + 10, x + w - 6, y + 10, 1.5, 'rgba(255,255,255,.25)', false); line(g, x + 6, y + 22, x + w - 6, y + 22, 1.5, 'rgba(255,255,255,.25)', false); }

// ---- Deko-Objekte (mit Tiefensortierung, damit man hinter ihnen vorbeigehen kann) ----
const KDECOR = [
  { id: 'herd', t: 'herd', x: 130, y: 860, x0: 60, y0: 300, w: 140, h: 560, bb: [52, 290, 160, 610] },
  { id: 'pass', t: 'pass', x: 520, y: 740, x0: 430, y0: 360, w: 180, h: 380, bb: [418, 300, 205, 485] },
  { id: 'salat', t: 'salat', x: 870, y: 620, x0: 800, y0: 320, w: 140, h: 300, bb: [790, 310, 160, 350] },
  { id: 'regal', t: 'regal', x: 890, y: 900, x0: 840, y0: 700, w: 100, h: 200, bb: [830, 640, 120, 300] },
  { id: 'wagen1', t: 'wagen', x: 330, y: 900, r: 32, bb: [290, 840, 82, 80] },
  { id: 'wagen2', t: 'wagen', x: 640, y: 255, r: 32, bb: [600, 195, 82, 80] },
  { id: 'eimer', t: 'eimer', x: 240, y: 262, r: 20, bb: [214, 226, 54, 50] },
  { id: 'kuehlraum', t: 'kuehlraum', x: 170, y: 1220, x0: 60, y0: 1000, w: 220, h: 220, bb: [52, 900, 250, 345] },
  { id: 'kisten1', t: 'kisten', x: 430, y: 1090, r: 34, bb: [390, 990, 84, 120] },
  { id: 'kisten2', t: 'kisten', x: 480, y: 1210, r: 34, bb: [440, 1110, 84, 120] },
  { id: 'kistenregal', t: 'kistenregal', x: 905, y: 1250, x0: 865, y0: 1000, w: 80, h: 250, bb: [850, 910, 100, 360] },
  { id: 'faesser', t: 'faesser', x: 660, y: 1275, r: 42, bb: [606, 1196, 110, 100] },
  { id: 'getraenke', t: 'getraenke', x: 610, y: 1050, x0: 570, y0: 990, w: 80, h: 60, bb: [560, 880, 100, 180] },
  { id: 'stahl', t: 'stahl', x: 715, y: 1050, x0: 680, y0: 990, w: 70, h: 60, bb: [670, 880, 90, 180] },
  { id: 'saecke', t: 'saecke', x: 570, y: 1185, r: 26, bb: [536, 1140, 70, 60] },
  { id: 'kanister', t: 'kanister', x: 770, y: 1180, r: 16, bb: [748, 1148, 44, 44] },
  { id: 'lagerregal', t: 'lagerregal', x: 360, y: 1330, x0: 300, y0: 1270, w: 120, h: 60, bb: [290, 1180, 140, 160] },
];
const KDRAW = {
  herd(c, d, t) {
    counterBlock(c, d.x0, d.y0, d.w, d.h);
    for (let k = 0; k < 3; k++) { rrPath(c, d.x0 + 18, d.y0 + 30 + k * 120, 104, 90, 6); fs(c, '#212529', 2.5); ell(c, d.x0 + 45, d.y0 + 75 + k * 120, 18, 18); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.2)'; c.stroke(); ell(c, d.x0 + 95, d.y0 + 75 + k * 120, 18, 18); c.stroke(); }
    rrPath(c, d.x0 + 18, d.y0 + 400, 104, 120, 6); fs(c, '#868e96', 2.5); rrPath(c, d.x0 + 26, d.y0 + 410, 88, 100, 4); fs(c, '#c99a3b', 2);   // Fritteuse/Bräter
    ell(c, d.x0 + 45, d.y0 + 75, 22, 20); fs(c, '#343a40', 3); rrPath(c, d.x0 + 60, d.y0 + 70, 40, 8, 4); fs(c, '#212529', 2); for (let k = 0; k < 6; k++) { ell(c, d.x0 + 38 + (k % 3) * 7, d.y0 + 70 + Math.floor(k / 3) * 9, 3.5, 3); c.fillStyle = k % 2 ? '#f77f00' : '#e63946'; c.fill(); }   // Pfanne mit Gemüse (Foto)
    pot(c, d.x0 + 95, d.y0 + 205, 22, '#ced4da');
  },
  pass(c, d, t) {
    counterBlock(c, d.x0, d.y0, d.w, d.h);
    for (let k = 0; k < 5; k++) { rrPath(c, d.x0 + 14 + (k % 2) * 80, d.y0 + 30 + Math.floor(k / 2) * 70, 70, 54, 4); fs(c, '#adb5bd', 2); rrPath(c, d.x0 + 18 + (k % 2) * 80, d.y0 + 34 + Math.floor(k / 2) * 70, 62, 46, 3); c.fillStyle = ['#e63946', '#95d5b2', '#f6d38d', '#6c584c', '#ffd166'][k]; c.fill(); }   // Kühltheke mit Zutaten
    rrPath(c, d.x0 + 20, d.y0 + 250, 140, 100, 6); fs(c, '#f8f9fa', 2.5); line(c, d.x0 + 60, d.y0 + 290, d.x0 + 120, d.y0 + 280, 3, '#ffd166');   // Schneidbrett mit Messer
    // Wärmebrücke (Regal darüber) + Bildschirm
    rrPath(c, d.x0 - 6, d.y0 - 60, d.w + 12, 14, 4); fs(c, '#dee2e6', 3); line(c, d.x0 + 4, d.y0 - 46, d.x0 + 4, d.y0 + 10, 4, '#adb5bd'); line(c, d.x0 + d.w - 4, d.y0 - 46, d.x0 + d.w - 4, d.y0 + 10, 4, '#adb5bd');
    for (let k = 0; k < 3; k++) { ell(c, d.x0 + 30 + k * 60, d.y0 - 72, 18, 7); fs(c, '#fff', 2); }
    rrPath(c, d.x0 + d.w - 70, d.y0 - 120, 76, 52, 6); fs(c, '#212529', 3); rrPath(c, d.x0 + d.w - 64, d.y0 - 114, 64, 40, 3); c.fillStyle = '#2b9348'; c.fill(); for (let k = 0; k < 4; k++) line(c, d.x0 + d.w - 58, d.y0 - 106 + k * 8, d.x0 + d.w - 20 - (k % 2) * 14, d.y0 - 106 + k * 8, 2, 'rgba(255,255,255,.7)', false);
    rrPath(c, d.x0 + 10, d.y0 - 104, 60, 30, 10); fs(c, '#d4a373', 2.5);   // Brotkorb
  },
  salat(c, d) {
    counterBlock(c, d.x0, d.y0, d.w, d.h);
    for (let k = 0; k < 4; k++) { rrPath(c, d.x0 + 14, d.y0 + 20 + k * 66, d.w - 28, 54, 4); fs(c, '#adb5bd', 2); rrPath(c, d.x0 + 18, d.y0 + 24 + k * 66, d.w - 36, 46, 3); c.fillStyle = ['#74c69d', '#e63946', '#f1faee', '#ffd166'][k]; c.fill(); if (k === 0) for (let m = 0; m < 6; m++) { ell(c, d.x0 + 30 + m * 16, d.y0 + 40 + (m % 2) * 10, 8, 6, m); c.fillStyle = '#95d5b2'; c.fill(); } }
  },
  regal(c, d) {
    for (let k = 0; k < 3; k++) { rrPath(c, d.x0, d.y0 + k * 66, d.w, 10, 2); fs(c, '#ced4da', 2); }
    for (let k = 0; k < 3; k++) for (let m = 0; m < 3; m++) gnBox(c, d.x0 + 6 + m * 31, d.y0 - 26 + k * 66, 28, 26, k === 1 ? 'rgba(255,255,255,.95)' : 'rgba(230,240,248,.9)');
    rrPath(c, d.x0 + 10, d.y0 + 150, 80, 34, 12); fs(c, '#d4a373', 2.5); for (let k = 0; k < 5; k++) line(c, d.x0 + 16 + k * 15, d.y0 + 154, d.x0 + 16 + k * 15, d.y0 + 180, 1.5, 'rgba(120,80,40,.4)', false);
  },
  wagen(c, d) {
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 38, 10); c.fill();
    for (let k = 0; k < 3; k++) { steel(c, d.x - 34, d.y - 58 + k * 22, 68, 14, 3); }
    line(c, d.x - 32, d.y - 60, d.x - 32, d.y, 3, '#adb5bd'); line(c, d.x + 32, d.y - 60, d.x + 32, d.y, 3, '#adb5bd');
    gnBox(c, d.x - 26, d.y - 72, 30, 16); rrPath(c, d.x + 6, d.y - 70, 22, 12, 3); fs(c, '#212529', 1.5);
    ell(c, d.x - 30, d.y + 2, 5, 5); fs(c, '#343a40', 2); ell(c, d.x + 30, d.y + 2, 5, 5); fs(c, '#343a40', 2);
  },
  eimer(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 20, 6); c.fill(); rrPath(c, d.x - 16, d.y - 34, 32, 34, 6); fs(c, '#adb5bd', 2.5); ell(c, d.x, d.y - 36, 18, 8); fs(c, '#b7e4c7', 2.5); },
  kuehlraum(c, d) {
    rrPath(c, d.x0, d.y0 - 80, d.w, d.h + 80, 6); fs(c, '#f1f3f5', 3);
    for (let k = 1; k < 5; k++) line(c, d.x0 + k * d.w / 5, d.y0 - 76, d.x0 + k * d.w / 5, d.y0 + d.h - 4, 2, 'rgba(0,0,0,.08)', false);
    rrPath(c, d.x0, d.y0 + d.h - 100, d.w, 100, 6); fs(c, '#e9ecef', 3);   // Vorderseite
    rrPath(c, d.x0 + d.w - 110, d.y0 + d.h - 96, 96, 92, 4); fs(c, '#f8f9fa', 2.5); rrPath(c, d.x0 + d.w - 30, d.y0 + d.h - 64, 10, 34, 4); fs(c, '#343a40', 2);
    rrPath(c, d.x0 + 18, d.y0 + d.h - 90, 120, 50, 4); fs(c, '#ffd60a', 2.5); txt(c, 'Kühlraum', d.x0 + 78, d.y0 + d.h - 74, 13, OL, 'center', null); txt(c, 'Tür offen lassen', d.x0 + 78, d.y0 + d.h - 56, 9, OL, 'center', null);
    for (let k = 0; k < 4; k++) { const fx = d.x0 + 30 + k * 60, fy = d.y0 - 40 + ((k * 23) % 30); ell(c, fx, fy, 3, 3); c.fillStyle = 'rgba(160,210,255,.6)'; c.fill(); }   // Kälte
  },
  kisten(c, d) {
    c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, d.x, d.y + 2, 40, 10); c.fill();
    for (let k = 0; k < 3; k++) { rrPath(c, d.x - 34, d.y - 34 - k * 30, 68, 34, 4); fs(c, '#212529', 2.5); for (let m = 0; m < 4; m++) { rrPath(c, d.x - 28 + m * 15, d.y - 30 - k * 30, 10, 24, 4); fs(c, '#4dabf7', 1.5); } line(c, d.x - 30, d.y - 20 - k * 30, d.x + 30, d.y - 20 - k * 30, 2, 'rgba(255,255,255,.2)', false); }
  },
  kistenregal(c, d) {
    rrPath(c, d.x0, d.y0 - 60, d.w, d.h + 60, 3); fs(c, '#ced4da', 2.5);
    const cols = ['#1c4fd8', '#e63946', '#1c4fd8', '#2b9348', '#2b9348', '#212529'];
    for (let k = 0; k < 6; k++) { rrPath(c, d.x0 - 10, d.y0 - 52 + k * 48, d.w + 6, 40, 5); fs(c, cols[k], 2.5); txt(c, k < 3 ? (k === 1 ? 'Paulaner' : 'PAULANER') : k < 5 ? 'JEVER' : '', d.x0 + d.w / 2 - 2, d.y0 - 32 + k * 48, 9, '#fff', 'center', null); }
  },
  faesser(c, d) {
    c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, d.x, d.y + 2, 54, 14); c.fill();
    for (const [dx, dy] of [[-30, -16], [0, -22], [30, -16], [-15, 0], [15, 0]]) { rrPath(c, d.x + dx - 13, d.y + dy - 38, 26, 38, 5); fs(c, '#ced4da', 2.5); rrPath(c, d.x + dx - 13, d.y + dy - 8, 26, 7, 3); fs(c, '#1c4fd8', 1.5); ell(c, d.x + dx, d.y + dy - 38, 13, 5); fs(c, '#adb5bd', 2); }
  },
  getraenke(c, d) {
    rrPath(c, d.x0, d.y0 - 110, d.w, d.h + 110, 4); fs(c, '#212529', 3); rrPath(c, d.x0 + 4, d.y0 - 106, d.w - 8, 18, 3); c.fillStyle = '#1c4fd8'; c.fill(); txt(c, 'Alkoholfrei', d.x0 + d.w / 2, d.y0 - 97, 8, '#fff', 'center', null);
    rrPath(c, d.x0 + 6, d.y0 - 84, d.w - 12, d.h + 70, 3); c.fillStyle = 'rgba(160,210,255,.25)'; c.fill(); for (let k = 0; k < 5; k++) { line(c, d.x0 + 8, d.y0 - 70 + k * 24, d.x0 + d.w - 8, d.y0 - 70 + k * 24, 2, '#4dabf7', false); rrPath(c, d.x0 + 12, d.y0 - 84 + k * 24, d.w - 24, 12, 2); c.fillStyle = ['#f77f00', '#fff', '#e63946', '#ffd166', '#fff'][k]; c.fill(); }
  },
  stahl(c, d) { steel(c, d.x0, d.y0 - 110, d.w, d.h + 110, 4); rrPath(c, d.x0 + 6, d.y0 - 104, d.w - 12, 14, 2); fs(c, '#212529', 1.5); rrPath(c, d.x0 + 18, d.y0 - 70, 34, 44, 2); fs(c, '#fff', 1.5); rrPath(c, d.x0 + d.w - 12, d.y0 - 60, 5, 40, 2); fs(c, '#495057', 1.5); },
  saecke(c, d) { for (const [dx, dy] of [[-12, 0], [10, -4]]) { rrPath(c, d.x + dx - 16, d.y + dy - 36, 32, 38, 10); fs(c, '#f1e3c8', 2.5); txt(c, 'Mehl', d.x + dx, d.y + dy - 18, 8, '#8d5a3b', 'center', null); } },
  kanister(c, d) { rrPath(c, d.x - 13, d.y - 30, 26, 30, 4); fs(c, '#1c7ed6', 2.5); rrPath(c, d.x - 4, d.y - 36, 9, 7, 2); fs(c, '#e63946', 2); rrPath(c, d.x - 8, d.y - 22, 16, 12, 2); fs(c, '#fff', 1.2); },
  lagerregal(c, d) { rrPath(c, d.x0, d.y0 - 90, d.w, d.h + 90, 3); fs(c, '#adb5bd', 2.5); for (let k = 0; k < 3; k++) { rrPath(c, d.x0 - 2, d.y0 - 84 + k * 44, d.w + 4, 6, 2); fs(c, '#868e96', 1.5); for (let m = 0; m < 3; m++) { rrPath(c, d.x0 + 6 + m * 37, d.y0 - 112 + k * 44 + 28, 32, 26, 3); fs(c, ['#d4a373', '#e9c46a', '#fff'][(m + k) % 3], 2); } } },
};
function buildGridKueche() {
  cellsIn(60, 210, 940, 925, i => (G0[i] = 1));        // Küche
  cellsIn(60, 990, 940, 1330, i => (G0[i] = 1));       // Lager
  cellsIn(380, 920, 480, 995, i => (G0[i] = 1)); cellsIn(760, 920, 850, 995, i => (G0[i] = 1));   // Durchgänge
  cellsIn(470, 1320, 560, 1345, i => (G0[i] = 1));     // vor der Tür
  cellsIn(60, 200, 340, 225, i => (G0[i] = 0)); cellsIn(560, 200, 720, 225, i => (G0[i] = 0)); cellsIn(760, 200, 940, 245, i => (G0[i] = 0)); cellsIn(360, 200, 460, 220, i => (G0[i] = 0));
  for (const d of KDECOR) { if (d.w) cellsIn(d.x0 - 4, d.y0 - 4, d.x0 + d.w + 4, d.y0 + d.h + 26, i => (G0[i] = 0)); else if (d.r) cellsCircle(d.x, d.y - 6, d.r - 6, i => (G0[i] = 0)); }
}
// Verstecke an den Möbeln: im Topf, in der Pfanne, auf der Wärmebrücke, hinterm Kühlschrank, auf den Servierwagen, im Eimer,
// in der obersten Kiste, zwischen den Fässern, hinter Kühlraum, Säcken und Kanister, im Regal
const KSPOTS = [
  furnSpot(KDECOR, 'herd', 'top', { px: 155, py: 492, cut: 501, front: true, sx: 232, sy: 505, tag: 'topf' }),
  furnSpot(KDECOR, 'herd', 'top', { px: 104, py: 366, cut: 380, front: true, sx: 232, sy: 380, tag: 'pfanne', rot: -0.3 }),
  furnSpot(KDECOR, 'herd', 'top', { px: 128, py: 742, cut: 758, front: true, sx: 232, sy: 750, tag: 'fritteuse', rot: 0.25 }),
  furnSpot(KDECOR, 'pass', 'on', { px: 468, py: 288, sx: 470, sy: 338, tag: 'bruecke', sz: 0.62 }),
  furnSpot(KDECOR, 'pass', 'left', { py: 600, sx: 400, sy: 600 }),
  furnSpot(KDECOR, 'pass', 'right', { py: 520, sx: 640, sy: 520 }),
  furnSpot(KDECOR, 'salat', 'left', { py: 480, sx: 772, sy: 480 }),
  furnSpot(KDECOR, 'regal', 'on', { px: 872, py: 758, sx: 812, sy: 790, sz: 0.58, rot: -0.2 }),
  furnSpot(KDECOR, 'wagen1', 'on', { px: 342, py: 880, sx: 330, sy: 945, sz: 0.6 }),
  furnSpot(KDECOR, 'wagen2', 'on', { px: 652, py: 236, sx: 640, sy: 302, sz: 0.6 }),
  furnSpot(KDECOR, 'eimer', 'top', { px: 240, py: 226, sx: 240, sy: 300 }),
  furnSpot(KDECOR, 'kuehlraum', 'right', { px: 276, py: 1150, sx: 304, sy: 1170 }),
  furnSpot(KDECOR, 'kisten1', 'top', { px: 430, py: 992, sx: 430, sy: 1135 }),
  furnSpot(KDECOR, 'kisten2', 'right', { px: 512, py: 1172, sx: 532, sy: 1215 }),
  furnSpot(KDECOR, 'kistenregal', 'left', { px: 868, py: 1150, sx: 840, sy: 1150 }),
  furnSpot(KDECOR, 'faesser', 'top', { px: 662, py: 1226, sx: 660, sy: 1318 }),
  furnSpot(KDECOR, 'getraenke', 'left', { px: 574, py: 960, sx: 545, sy: 1062 }),
  furnSpot(KDECOR, 'stahl', 'right', { px: 746, py: 965, sx: 775, sy: 1062 }),
  furnSpot(KDECOR, 'saecke', 'top', { px: 582, py: 1140, sx: 570, sy: 1228 }),
  furnSpot(KDECOR, 'kanister', 'left', { px: 757, py: 1158, sx: 742, sy: 1210 }),
  furnSpot(KDECOR, 'lagerregal', 'left', { px: 304, py: 1288, sx: 272, sy: 1300 }),
];
// Schwingtür zum Gastraum = Boss-Level am Ende
function drawKitchenDoor(c, x, y, s, open, locked, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrPath(c, -48, -100, 96, 104, 6); fs(c, '#adb5bd', 3);
  const o = clamp(open, 0, 1);
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * 44, 0); c.scale(1 - o * 0.8, 1); rrPath(c, sd > 0 ? -44 : 0, -96, 44, 96, 4); fs(c, '#f8f9fa', 3); ell(c, sd > 0 ? -22 : 22, -62, 9, 9); fs(c, 'rgba(160,210,255,.8)', 2); rrPath(c, sd > 0 ? -40 : 4, -40, 36, 6, 2); fs(c, '#adb5bd', 1.5); c.restore(); }
  if (locked) { const b = Math.sin(t * 3) * 2; ell(c, 0, -110 + b, 14, 14); fs(c, '#fff', 2.5); icon(c, 'lock', 0, -110 + b, 18); }
  c.restore();
}
STAGE_DEFS.kueche = {
  id: 'kueche', bg: '#5c636a', start: { x: 300, y: 430 }, gate: { x: 515, y: 1392, ix: 515, iy: 1320 },
  npcs: [
    { id: 'k_marco', pos: [[250, 520, 0], [250, 780, 0], [670, 560, 0]] },
    { id: 'k_luca', pos: [[850, 285, 0], [700, 330, 0], [760, 470, 0]] },
    { id: 'k_tom', pos: [[160, 260, 0], [400, 270, 0], [380, 860, 0]] },
    { id: 'k_nina', pos: [[560, 1110, 0], [770, 1260, 0], [400, 1300, 0]] },
    { id: 'k_lea', pos: [[520, 820, 0], [700, 800, 0], [350, 650, 0]] },
  ],
  decor: KDECOR, spots: KSPOTS, grid: buildGridKueche, ground: drawGroundKueche, decorDraw: KDRAW,
  feat: { swing: false, slide: false, house: false, racer: false, pigeons: false, waiter: false, dig: false },
  junk: ['cap', 'nudel', 'zettel', 'salat'], items: KUECHE_ITEMS,
  drawGate: drawKitchenDoor, gateName: 'Die Schwingtür', dialogGate: 0.58, gateFace: (c, x, y, s, t) => drawKitchenDoor(c, x, y, s * 0.42, 0, true, t),
  words: { one: 'Mitarbeiter', the: 'den Mitarbeiter', a: 'einen Mitarbeiter', many: 'Mitarbeiter', dat: 'Mitarbeitern', back: 'zum Mitarbeiter', each: 'Jeder Mitarbeiter',
    hide: 'in Töpfen und Kisten, auf den Servierwagen und hinter Kühlschrank, Fässern und Säcken', junk: 'eine Nudel oder ein Kronkorken', gate: 'an der Tür zum Gastraum', gateTap: 'Lauf zur Tür und tippe sie an!',
    opened: 'Die Tür ist offen!',
    lock: 'Die Tür zum Gastraum geht erst auf, wenn du allen fünf Mitarbeitern geholfen hast.',
    progress: 'Dir fehlen noch ein paar Sachen, oben siehst du welche. Schau in Töpfe und Kisten, auf die Wagen und hinter den Kühlschrank!',
    gateAsk: 'Die Schwingtür klemmt! Bring mir diese Sachen, dann geht sie auf und du kommst in den Gastraum.',
    search: 'Schau in Töpfe, auf Wagen und hinter Kühlschränke – dann tippe auf die Lupe!' },
  pools: {
    easy: ['schnippeln', 'pfannkuchen', 'eier', 'kneten', 'ruehren', 'ueberkochen', 'kuehlpacken', 'pizzaofen', 'belegen', 'spuelen', 'bestellung', 'tisch', 'memory', 'sort', 'size_row', 'count_easy', 'cups', 'stack', 'findall', 'shadow', 'trace', 'maze_easy', 'connect', 'color'],
    puzzle: ['kuehlpacken', 'eier', 'belegen', 'bestellung', 'hanoi', 'pipes', 'lights', 'pairs', 'sequence', 'dials', 'balance', 'diff', 'count', 'pattern', 'sort'],
    std: ['schnippeln', 'pfannkuchen', 'ueberkochen', 'pizzaofen', 'collect'],
    sp: ['ruehren', 'kneten', 'spuelen', 'run'],
    hard: ['jump', 'slide', 'platform'],
  },
  extras(play) {   // Dampf über den Töpfen, flackernder Ofen
    const steam = [];
    return {
      update(dt) { if (Math.random() < 0.3) steam.push({ x: 155 + (Math.random() - 0.5) * 20, y: 505, t: 0 }); if (Math.random() < 0.2) steam.push({ x: 100, y: 375, t: 0 }); steam.forEach(s => (s.t += dt)); for (let i = steam.length - 1; i >= 0; i--) if (steam[i].t > 1.6) steam.splice(i, 1); },
      draw(c, L, vis, t) {
        L.push({ y: 2000, f: () => { steam.forEach(s => { c.globalAlpha = 0.5 * (1 - s.t / 1.6); ell(c, s.x + Math.sin(s.t * 3 + s.x) * 8, s.y - s.t * 60, 8 + s.t * 10, 6 + s.t * 8); c.fillStyle = '#fff'; c.fill(); }); c.globalAlpha = 1; } });
        L.push({ y: 230, f: () => { for (let k = 0; k < 2; k++) { c.globalAlpha = 0.25 + 0.15 * Math.sin(t * 7 + k); rrPath(c, 800, 70 + k * 82, 100, 36, 4); c.fillStyle = '#ff8c42'; c.fill(); } c.globalAlpha = 1; } });
      },
    };
  },
};
