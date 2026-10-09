'use strict';
// ---------- Stage "Außenbereich": die Terrasse vor dem Glashaus (nach Website- und Gäste-Fotos + Luftbild) ----------
// Glashaus-Front mit Falttüren, Klinker an der Hauswand, dann Kiesterrasse unter roten Sonnensegeln: dunkle Rattan-Sitzgruppen,
// hölzerner Wunschbrunnen mit Dach, weiße Leuchtkugeln, Olivenbäumchen in Kübeln, Zypressen, Fahne. Unten Rasen mit Lavendel,
// gestreiften Liegestühlen und dem Gartentor (Weg zum Chalet).

Object.assign(STAFF_PEOPLE, {
  a_weber: { skin: '#e0ac85', hair: '#6c584c', sun: true, jacket: '#f8f9fa', pipe: '#95C11F', pants: '#d4a373', shoes: '#6f4e37', hat: 'straw', hatCol: '#e9c46a', hatBand: '#343a40' },
  a_hoffmann: { skin: '#f1c7a5', hair: '#b5651d', long: true, jacket: '#ef476f', skirt: '#f8f9fa', shoes: '#f4a261', hat: 'sunhat', hatCol: '#e63946', hatBand: '#fff' },
  a_klaus: { skin: '#f6d2b8', hair: '#ced4da', stache: '#ced4da', glasses: '#343a40', jacket: '#6c584c', knit: '#a68a64', pants: '#495057', shoes: '#343a40', hat: 'flatcap', hatCol: '#868e96' },
  a_mila: { kid: true, skin: '#a8714f', hair: '#1f1a17', curly: true, jacket: '#ffd166', skirt: '#4dabf7', shoes: '#f8f9fa', hat: 'sunhat', hatCol: '#fff3bf', hatBand: '#ef476f' },
  a_noah: { skin: '#f1c7a5', hair: '#e9c46a', jacket: '#118ab2', pants: '#343a40', shoes: '#f8f9fa', hat: 'cap', hatCol: '#212529' },
  a_ober: { skin: '#d9a57e', hair: '#2b1d14', jacket: '#212529', apron: '#212529', leaf: true, pants: '#212529', shoes: '#212529' },
});
Object.assign(NPC_NAMES, { a_weber: 'Herr Weber', a_hoffmann: 'Frau Hoffmann', a_klaus: 'Opa Klaus', a_mila: 'Mila', a_noah: 'Noah' });
Object.assign(NPC_SHORT, { a_weber: 'Herrn Weber', a_hoffmann: 'Frau Hoffmann', a_klaus: 'Opa Klaus', a_mila: 'Mila', a_noah: 'Noah' });
Object.assign(NPC_LINES, {
  a_weber: 'Ich wollte die Sonne genießen, aber meine Sachen sind weg!',
  a_hoffmann: 'Der Wind hat ein paar Sachen von meinem Tisch geweht!',
  a_klaus: 'Ich habe hier draußen ein Nickerchen gemacht, und jetzt fehlt etwas!',
  a_mila: 'Ich habe beim Spielen auf der Terrasse meine Sachen verloren!',
  a_noah: 'Ich war kurz am Brunnen, und jetzt sind meine Sachen verschwunden!',
});
Object.assign(VOICE_OF, { a_weber: { pitch: 0.85, rate: 0.95, pick: 4 }, a_hoffmann: { pitch: 1.15, rate: 1.0, pick: 2 }, a_klaus: { pitch: 0.75, rate: 0.85, pick: 6 }, a_mila: { pitch: 1.45, rate: 1.1, pick: 3 }, a_noah: { pitch: 1.0, rate: 1.05, pick: 2 } });

Object.assign(ITEMS, {
  sonnenbrille: { n: 'Sonnenbrille', d(c, f) { line(c, -16, -2, 16, -2, 2.5, f('#212529'), false); rrPath(c, -18, -6, 15, 12, 5); fs(c, f('#343a40')); rrPath(c, 3, -6, 15, 12, 5); fs(c, f('#343a40')); line(c, -18, -4, -24, 4, 2.5, f('#212529'), false); line(c, 18, -4, 24, 4, 2.5, f('#212529'), false); if (!f.sil) { ell(c, -13, -2, 3, 2); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill(); ell(c, 8, -2, 3, 2); c.fill(); } } },
  sonnencreme: { n: 'Sonnencreme', d(c, f) { c.rotate(0.2); rrPath(c, -10, -12, 20, 30, 7); fs(c, f('#ffd166')); rrPath(c, -6, -20, 12, 9, 3); fs(c, f('#f77f00')); if (!f.sil) { ell(c, 0, 4, 6, 6); c.fillStyle = '#f77f00'; c.fill(); for (let k = 0; k < 6; k++) { const a = k * 1.05; line(c, Math.cos(a) * 8, 4 + Math.sin(a) * 8, Math.cos(a) * 10, 4 + Math.sin(a) * 10, 1.5, '#f77f00', false); } } } },
  sonnenhut: { n: 'Sonnenhut', d(c, f) { ell(c, 0, 6, 24, 9); fs(c, f('#e9c46a')); c.beginPath(); c.moveTo(-12, 6); c.quadraticCurveTo(-12, -16, 0, -16); c.quadraticCurveTo(12, -16, 12, 6); c.closePath(); fs(c, f('#e9c46a')); rrPath(c, -12, -1, 24, 5, 2); c.fillStyle = f('#e63946'); c.fill(); } },
  wasserball: { n: 'Wasserball', d(c, f) { ell(c, 0, 0, 18, 18); fs(c, f('#fff')); ['#ef476f', '#ffd166', '#118ab2'].forEach((k, i) => { c.save(); ell(c, 0, 0, 18, 18); c.clip(); c.beginPath(); c.ellipse(0, 0, 6 + i * 6, 18, 0, -Math.PI / 2, Math.PI / 2); c.lineWidth = 5; c.strokeStyle = f(k); c.stroke(); c.restore(); }); ell(c, 0, 0, 18, 18); fs(c, null); ell(c, -6, -6, 3, 2); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); } },
  giesskanne: { n: 'Gießkanne', d(c, f) { rrPath(c, -14, -8, 24, 24, 5); fs(c, f('#2a9d8f')); line(c, 8, 2, 22, -14, 4, f('#2a9d8f')); ell(c, 23, -15, 5, 3, -0.6); fs(c, f('#2a9d8f'), 2); c.beginPath(); c.arc(-2, -8, 10, Math.PI, 0); c.lineWidth = 6; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3; c.strokeStyle = f('#2a9d8f'); c.stroke(); } },
  windrad: { n: 'Windrad', d(c, f) { line(c, 0, 0, 0, 22, 3, f('#8d5a3b')); for (let k = 0; k < 4; k++) { c.save(); c.rotate(k * Math.PI / 2 + 0.3); polyPath(c, [[0, 0], [0, -18], [12, -10]]); fs(c, f(['#ef476f', '#ffd166', '#118ab2', '#06d6a0'][k]), 2); c.restore(); } ell(c, 0, 0, 3, 3); fs(c, f('#fff'), 1.5); } },
  limoflasche: { n: 'Limo-Flasche', d(c, f) { rrPath(c, -9, -6, 18, 26, 6); fs(c, f('rgba(255,180,60,.9)')); rrPath(c, -5, -20, 10, 16, 3); fs(c, f('rgba(255,180,60,.9)')); rrPath(c, -6, -24, 12, 5, 2); fs(c, f('#e63946'), 2); if (!f.sil) { rrPath(c, -9, 0, 18, 10, 2); c.fillStyle = '#fff'; c.fill(); leaf(c, 0, 5, 0.3, BRAND.lime); } } },
  fernglas: { n: 'Fernglas', d(c, f) { rrPath(c, -16, -12, 13, 26, 5); fs(c, f('#343a40')); rrPath(c, 3, -12, 13, 26, 5); fs(c, f('#343a40')); rrPath(c, -4, -6, 8, 10, 2); fs(c, f('#495057'), 2); ell(c, -9.5, 14, 6, 3); fs(c, f('#74c0fc'), 2); ell(c, 9.5, 14, 6, 3); fs(c, f('#74c0fc'), 2); } },
  federball: { n: 'Federball', d(c, f) { c.rotate(-0.5); polyPath(c, [[-12, -18], [12, -18], [6, 6], [-6, 6]]); fs(c, f('#fff')); for (let k = -1; k <= 1; k++) line(c, k * 6, -16, k * 3, 4, 1.5, 'rgba(0,0,0,.2)', false); ell(c, 0, 10, 7, 7); fs(c, f('#ef476f')); } },
  sitzkissen: { n: 'Sitzkissen', d(c, f) { rrPath(c, -20, -12, 40, 24, 10); fs(c, f('#e76f51')); if (!f.sil) { line(c, -12, 0, 12, 0, 2, 'rgba(255,255,255,.4)', false); ell(c, 0, 0, 3, 3); c.fillStyle = '#9c3d10'; c.fill(); } } },
  kescher: { n: 'Kescher', d(c, f) { c.rotate(-0.6); line(c, 0, 0, 0, 26, 3.5, f('#d4a373')); ell(c, 0, -10, 13, 11); fs(c, f('rgba(255,255,255,.6)')); if (!f.sil) { c.save(); ell(c, 0, -10, 12, 10); c.clip(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; for (let k = -12; k < 13; k += 4) { c.beginPath(); c.moveTo(k, -22); c.lineTo(k, 2); c.moveTo(-12, -10 + k); c.lineTo(12, -10 + k); c.stroke(); } c.restore(); } } },
});
const AUSSEN_ITEMS = ['sonnenbrille', 'sonnencreme', 'sonnenhut', 'frisbee', 'wasserball', 'giesskanne', 'windrad', 'limoflasche', 'fernglas', 'federball', 'sitzkissen', 'kescher'];

function gravel(g, x, y, w, h, R, base = '#d8cfbf') {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = base; g.fillRect(x, y, w, h);
  for (let i = 0; i < w * h / 40; i++) { g.fillStyle = ['#c5bcad', '#e6dfd3', '#b3aa9a', '#efe9df', '#a39b8b'][i % 5]; ell(g, x + R() * w, y + R() * h, 1.6 + R() * 1.6, 1.2 + R() * 1.2, R() * 3); g.fill(); }
  for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(255,255,255,.06)'; ell(g, x + R() * w, y + R() * h, 50 + R() * 70, 20 + R() * 30); g.fill(); }
  g.restore();
}
function lawn(g, x, y, w, h, R) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = '#7fb069'; g.fillRect(x, y, w, h);
  for (let i = 0; i < w * h / 60; i++) { const px = x + R() * w, py = y + R() * h; g.strokeStyle = ['#6a994e', '#8cbf6f', '#a7c957', '#5b8c45'][i % 4]; g.lineWidth = 1.6; g.beginPath(); g.moveTo(px, py); g.lineTo(px + (R() - 0.5) * 3, py - 5 - R() * 4); g.stroke(); }
  g.restore();
}
function drawGroundAussen(g, R) {
  gravel(g, 0, 0, WORLD_W, WORLD_H, R);
  // Glashaus-Front (oben): Glas, Stahlrahmen, offene Falttüren in der Mitte
  const sky = g.createLinearGradient(0, 0, 0, 150); sky.addColorStop(0, '#a5d8ff'); sky.addColorStop(1, '#e7f5ff'); g.fillStyle = sky; g.fillRect(0, 0, WORLD_W, 150);
  for (let x = 0; x < WORLD_W; x += 125) { g.fillStyle = 'rgba(60,110,70,.4)'; ell(g, x + 60, 120, 40, 22); g.fill(); line(g, x + 40, 120, x + 46, 60, 4, 'rgba(80,60,40,.5)', false); for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.5; line(g, x + 46, 60, x + 46 + Math.cos(a) * 30, 60 + Math.sin(a) * 26, 3, 'rgba(70,120,60,.5)', false); } }
  g.strokeStyle = '#495057'; g.lineWidth = 5; for (let x = 0; x <= WORLD_W; x += 62) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 150); g.stroke(); } g.beginPath(); g.moveTo(0, 50); g.lineTo(WORLD_W, 50); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 20; x < WORLD_W; x += 186) { polyPath(g, [[x, 150], [x + 30, 150], [x + 90, 0], [x + 60, 0]]); g.fill(); }
  // offene Falttüren
  g.fillStyle = '#d27d55'; g.fillRect(430, 60, 140, 90);
  for (let k = 0; k < 3; k++) { rrPath(g, 380 + k * 12, 50, 12, 100, 2); fs(g, 'rgba(200,230,245,.9)', 2.5); rrPath(g, 584 + k * 12, 50, 12, 100, 2); fs(g, 'rgba(200,230,245,.9)', 2.5); }
  rrPath(g, 420, 4, 160, 40, 10); fs(g, 'rgba(251,248,242,.95)', 3); drawLogo(g, 500, 24, 110, false);
  g.fillStyle = '#495057'; g.fillRect(0, 146, WORLD_W, 8);
  // Klinkerstreifen an der Hauswand + Sonnensegel-Schatten
  brickFloor(g, 0, 154, WORLD_W, 240, R);
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 392, WORLD_W, 4);
  // Rasen unten + Lavendel-Rand, Trittsteine zum Tor
  lawn(g, 0, 990, WORLD_W, 410, R);
  g.save(); g.beginPath(); g.moveTo(0, 990); for (let x = 0; x <= WORLD_W; x += 40) g.quadraticCurveTo(x + 20, 984 + (x % 80 ? 6 : -4), x + 40, 990); g.lineTo(WORLD_W, 1000); g.lineTo(0, 1000); g.closePath(); g.fillStyle = '#d8cfbf'; g.fill(); g.restore();
  for (let k = 0; k < 9; k++) { const y = 1010 + k * 38, x = 500 + Math.sin(k * 0.8) * 22; ell(g, x, y, 26, 13); fs(g, '#cfc7b8', 2); ell(g, x - 6, y - 3, 8, 3); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); }
  // Hecken links/rechts + unten
  for (let y = 160; y < 1360; y += 26) { ell(g, 18 + (y % 52 ? 4 : 0), y, 30, 20); fs(g, y % 52 ? '#2d6a4f' : '#40916c', 2); ell(g, 982 - (y % 52 ? 4 : 0), y, 30, 20); fs(g, y % 52 ? '#2d6a4f' : '#40916c', 2); }
  for (let x = 0; x < WORLD_W; x += 26) if (Math.abs(x - 500) > 60) { ell(g, x, 1366, 22, 26); fs(g, x % 52 ? '#2d6a4f' : '#40916c', 2); }
  // feste Schatten der Sonnensegel (leicht versetzt, Sonne von links oben)
  for (const P of ASAILS) { sailPath(g, P.map(([x, y]) => [x + 30, y + 14])); g.fillStyle = 'rgba(90,35,10,.13)'; g.fill(); }
}
// Sonnensegel: gespannte Dreiecke mit nach innen gebogenen Kanten; Eckpunkte = Masten am Boden, Segel hängt in der Höhe
const ASAILS = [[[150, 430], [560, 410], [330, 660]], [[470, 430], [880, 460], [700, 700]], [[160, 700], [560, 720], [360, 960]]];
const SAIL_H = 170, S_FADE = [0.5, 0.5, 0.5];
function sailPath(c, P, sag = 0.18, fl = 0) {
  c.beginPath(); c.moveTo(P[0][0], P[0][1]);
  for (let k = 0; k < 3; k++) { const A = P[k], B = P[(k + 1) % 3], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, cx = (P[0][0] + P[1][0] + P[2][0]) / 3, cy = (P[0][1] + P[1][1] + P[2][1]) / 3; c.quadraticCurveTo(mx + (cx - mx) * sag, my + (cy - my) * sag + fl, B[0], B[1]); }
  c.closePath();
}
const ADECOR = [
  { id: 'topf1', t: 'blumentopf', x: 330, y: 200, r: 18, bb: [300, 140, 60, 66] },
  { id: 'topf2', t: 'blumentopf', x: 670, y: 200, r: 18, bb: [640, 140, 60, 66] },
  { id: 'fahne', t: 'fahne', x: 890, y: 260, r: 10, bb: [870, 40, 110, 226] },
  { id: 'olive1', t: 'oliventopf', x: 110, y: 350, r: 26, bb: [40, 200, 140, 156] },
  { id: 'olive2', t: 'oliventopf', x: 880, y: 470, r: 26, bb: [810, 320, 140, 156] },
  { id: 'set1', t: 'rattan', x: 230, y: 520, x0: 175, y0: 470, w: 110, h: 50, bb: [160, 420, 140, 130] },
  { id: 'set2', t: 'rattan', x: 540, y: 520, x0: 485, y0: 470, w: 110, h: 50, bb: [470, 420, 140, 130] },
  { id: 'brunnen', t: 'brunnen', x: 770, y: 680, r: 46, bb: [690, 470, 160, 220] },
  { id: 'kugel1', t: 'kugel', x: 380, y: 650, r: 14, anim: true },
  { id: 'kugel2', t: 'kugel', x: 120, y: 700, r: 14, anim: true },
  { id: 'kugel3', t: 'kugel', x: 620, y: 880, r: 14, anim: true },
  { id: 'kugel4', t: 'kugel', x: 900, y: 860, r: 14, anim: true },
  { id: 'set3', t: 'rattan', x: 240, y: 820, x0: 185, y0: 770, w: 110, h: 50, bb: [170, 720, 140, 130] },
  { id: 'set4', t: 'rattan', x: 470, y: 820, x0: 415, y0: 770, w: 110, h: 50, bb: [400, 720, 140, 130] },
  { id: 'cyp1', t: 'cypress', x: 935, y: 640 }, { id: 'cyp2', t: 'cypress', x: 935, y: 960 }, { id: 'cyp3', t: 'cypress', x: 65, y: 980 },
  { id: 'kissenbox', t: 'kissenbox', x: 110, y: 880, r: 30, bb: [60, 820, 100, 70] },
  { id: 'olive3', t: 'oliventopf', x: 760, y: 950, r: 26, bb: [690, 800, 140, 156] },
  { id: 'liege1', t: 'liege', x: 200, y: 1260, x0: 150, y0: 1200, w: 100, h: 60, bb: [140, 1150, 120, 120] },
  { id: 'liege2', t: 'liege', x: 330, y: 1260, x0: 280, y0: 1200, w: 100, h: 60, bb: [270, 1150, 120, 120] },
  { id: 'schirm', t: 'schirm', x: 265, y: 1150, r: 16, bb: [150, 910, 230, 250] },
  { id: 'beet', t: 'lavendel', x: 760, y: 1170, x0: 640, y0: 1120, w: 240, h: 50, bb: [630, 1070, 260, 110] },
  { id: 'bank', t: 'gartenbank', x: 770, y: 1290, x0: 700, y0: 1260, w: 140, h: 30, bb: [690, 1210, 160, 90] },
];
const ADRAW = {
  blumentopf(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 22, 6); c.fill(); polyPath(c, [[d.x - 18, d.y - 26], [d.x + 18, d.y - 26], [d.x + 13, d.y], [d.x - 13, d.y]]); fs(c, '#d27d55', 2.5); for (let k = 0; k < 7; k++) { ell(c, d.x - 16 + (k % 4) * 11, d.y - 34 - Math.floor(k / 4) * 10, 8, 7); fs(c, '#52b788', 1.5); } for (let k = 0; k < 6; k++) { ell(c, d.x - 14 + (k % 3) * 14, d.y - 40 - Math.floor(k / 3) * 10, 4.5, 4.5); c.fillStyle = '#ef233c'; c.fill(); } },
  fahne(c, d, t) { line(c, d.x, d.y, d.x, d.y - 210, 4, '#adb5bd'); const w = Math.sin(t * 3) * 6; c.beginPath(); c.moveTo(d.x, d.y - 205); c.quadraticCurveTo(d.x + 40, d.y - 205 + w, d.x + 80, d.y - 200); c.lineTo(d.x + 80, d.y - 150); c.quadraticCurveTo(d.x + 40, d.y - 156 - w, d.x, d.y - 152); c.closePath(); fs(c, '#95C11F', 2.5); leaf(c, d.x + 40, d.y - 177, 0.7, '#fff'); },
  oliventopf(c, d) {
    c.fillStyle = 'rgba(0,0,0,.22)'; ell(c, d.x, d.y + 2, 34, 9); c.fill();
    rrPath(c, d.x - 28, d.y - 40, 56, 40, 6); fs(c, '#495057', 3); line(c, d.x - 24, d.y - 34, d.x + 24, d.y - 34, 2, 'rgba(255,255,255,.25)', false);
    c.beginPath(); c.moveTo(d.x - 6, d.y - 40); c.quadraticCurveTo(d.x - 14, d.y - 70, d.x - 2, d.y - 92); c.lineTo(d.x + 6, d.y - 92); c.quadraticCurveTo(d.x - 2, d.y - 70, d.x + 6, d.y - 40); c.closePath(); fs(c, '#7f7364', 2.5);
    for (let k = 0; k < 7; k++) { const a = (k / 7) * TAU; ell(c, d.x + Math.cos(a) * 30, d.y - 110 + Math.sin(a) * 22, 22, 17); fs(c, k % 2 ? '#8a9a5b' : '#a3b18a', 2.5); }
    ell(c, d.x, d.y - 112, 24, 18); fs(c, '#94a56a', 2.5);
    for (let k = 0; k < 12; k++) { ell(c, d.x + Math.cos(k * 2.3) * 34, d.y - 110 + Math.sin(k * 2.3) * 24, 5, 2, k); c.fillStyle = '#c8d5b9'; c.fill(); }
  },
  rattan(c, d) {
    // dunkle Rattanstühle + grauer Tisch (Terrassenfoto)
    const x = d.x, y = d.y0 + 24, chair = (cx, cy, back) => { rrPath(c, cx - 15, cy - 8, 30, 16, 5); fs(c, '#4a3f35', 2.5); if (back) { rrPath(c, cx - 15, cy - 34, 30, 28, 8); fs(c, '#5c4f42', 2.5); c.save(); rrPath(c, cx - 15, cy - 34, 30, 28, 8); c.clip(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; for (let k = -30; k < 30; k += 5) { c.beginPath(); c.moveTo(cx + k, cy - 34); c.lineTo(cx + k + 20, cy - 6); c.stroke(); } c.restore(); } };
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, x, d.y0 + d.h, 64, 12); c.fill();
    chair(x - 26, y - 18, true); chair(x + 26, y - 18, true);
    line(c, x - 40, y + 8, x - 40, y + 32, 4, '#343a40', false); line(c, x + 40, y + 8, x + 40, y + 32, 4, '#343a40', false);
    rrPath(c, x - 50, y - 12, 100, 26, 4); fs(c, '#6c757d', 3); rrPath(c, x - 46, y - 8, 92, 18, 3); c.fillStyle = '#868e96'; c.fill();
    drawGlass(c, x - 20, y + 6, 0.3, 0.6, '#ff9f1c'); drawGlass(c, x + 18, y + 6, 0.3, 0.7, '#e63946'); ell(c, x, y - 2, 6, 6); fs(c, '#fff', 1.5);
    chair(x - 26, y + 34, false); chair(x + 26, y + 34, false);
    for (const dx of [-26, 26]) { rrPath(c, x + dx - 15, y + 12, 30, 22, 8); fs(c, '#5c4f42', 2.5); }
  },
  brunnen(c, d, t) {
    // hölzerner Wunschbrunnen mit Satteldach (Foto vom Außenbereich)
    c.fillStyle = 'rgba(0,0,0,.22)'; ell(c, d.x, d.y + 4, 54, 14); c.fill();
    ell(c, d.x, d.y - 24, 46, 16); fs(c, '#6c757d', 3);
    rrPath(c, d.x - 46, d.y - 24, 92, 26, 4); fs(c, '#adb5bd', 3); for (let k = 0; k < 5; k++) { rrPath(c, d.x - 44 + k * 18, d.y - 22 + (k % 2) * 3, 16, 10, 3); c.fillStyle = 'rgba(0,0,0,.08)'; c.fill(); }
    ell(c, d.x, d.y - 26, 38, 12); c.fillStyle = '#1d3557'; c.fill(); ell(c, d.x - 8, d.y - 28, 12, 3); c.fillStyle = `rgba(160,210,255,${0.4 + 0.2 * Math.sin(t * 2)})`; c.fill();
    line(c, d.x - 40, d.y - 24, d.x - 40, d.y - 130, 7, '#8d5a3b'); line(c, d.x + 40, d.y - 24, d.x + 40, d.y - 130, 7, '#8d5a3b');
    line(c, d.x - 40, d.y - 92, d.x + 40, d.y - 92, 4, '#6f4e37'); ell(c, d.x + 12, d.y - 92, 6, 6); fs(c, '#495057', 2);
    line(c, d.x - 4, d.y - 92, d.x - 4, d.y - 58, 1.5, '#343a40', false); rrPath(c, d.x - 12, d.y - 58, 16, 14, 3); fs(c, '#8d5a3b', 2);
    polyPath(c, [[d.x - 60, d.y - 122], [d.x, d.y - 168], [d.x + 60, d.y - 122], [d.x + 52, d.y - 116], [d.x, d.y - 156], [d.x - 52, d.y - 116]]); fs(c, '#6f4e37', 3);
    polyPath(c, [[d.x - 56, d.y - 120], [d.x, d.y - 164], [d.x, d.y - 152], [d.x - 48, d.y - 114]]); c.fillStyle = '#8d5a3b'; c.fill();
    for (let k = 0; k < 4; k++) line(c, d.x - 50 + k * 12, d.y - 118 - k * 9, d.x - 46 + k * 12, d.y - 112 - k * 9, 1.5, 'rgba(0,0,0,.25)', false);
    rrPath(c, d.x - 4, d.y - 186, 8, 20, 2); fs(c, '#6f4e37', 2);
  },
  kugel(c, d, t) {
    const gl = 0.55 + 0.25 * Math.sin(t * 1.5 + d.x);
    ell(c, d.x, d.y + 2, 20, 6); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill();
    ell(c, d.x, d.y - 16, 28, 26); c.fillStyle = `rgba(255,248,220,${gl * 0.25})`; c.fill();
    ell(c, d.x, d.y - 14, 16, 15); fs(c, `rgba(255,253,240,${0.85 + gl * 0.15})`, 2.5); ell(c, d.x - 5, d.y - 19, 5, 3); c.fillStyle = '#fff'; c.fill();
  },
  kissenbox(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 46, 9); c.fill(); rrPath(c, d.x - 42, d.y - 40, 84, 40, 6); fs(c, '#8d5a3b', 3); for (let k = 0; k < 6; k++) line(c, d.x - 38 + k * 15, d.y - 38, d.x - 38 + k * 15, d.y - 2, 1.5, 'rgba(60,35,20,.35)', false); rrPath(c, d.x - 46, d.y - 50, 92, 14, 5); fs(c, '#a0673a', 3); rrPath(c, d.x - 30, d.y - 62, 26, 14, 6); fs(c, '#e76f51', 2); rrPath(c, d.x + 2, d.y - 60, 26, 12, 6); fs(c, '#ffd166', 2); },
  liege(c, d) {
    // Liegestuhl mit blau-weißem Streifenstoff
    const x = d.x0, y = d.y0;
    line(c, x + 10, y + d.h, x + 30, y, 4, '#c08b55'); line(c, x + d.w - 10, y + d.h, x + d.w - 30, y, 4, '#c08b55');
    c.save(); polyPath(c, [[x + 12, y + 4], [x + d.w - 12, y + 4], [x + d.w - 4, y + d.h - 6], [x + 4, y + d.h - 6]]); c.clip(); for (let k = 0; k < 12; k++) { c.fillStyle = k % 2 ? '#1c7ed6' : '#f8f9fa'; c.fillRect(x + k * 10, y, 10, d.h); } c.restore();
    polyPath(c, [[x + 12, y + 4], [x + d.w - 12, y + 4], [x + d.w - 4, y + d.h - 6], [x + 4, y + d.h - 6]]); fs(c, null, 2.5);
    rrPath(c, x + 20, y - 8, d.w - 40, 14, 6); fs(c, '#f8f9fa', 2);
  },
  schirm(c, d, t) {
    c.fillStyle = 'rgba(0,0,0,.15)'; ell(c, d.x + 30, d.y - 10, 100, 40); c.fill();
    rrPath(c, d.x - 14, d.y - 8, 28, 12, 4); fs(c, '#495057', 2); line(c, d.x, d.y - 4, d.x, d.y - 180, 5, '#f8f9fa');
    const w = Math.sin(t * 1.4) * 3; c.beginPath(); c.moveTo(d.x - 100, d.y - 150 + w); c.quadraticCurveTo(d.x, d.y - 230, d.x + 100, d.y - 150 - w); c.quadraticCurveTo(d.x, d.y - 168, d.x - 100, d.y - 150 + w); fs(c, '#fbf8f2', 3);
    for (let k = -2; k <= 2; k++) line(c, d.x, d.y - 196, d.x + k * 42, d.y - 156, 1.5, 'rgba(0,0,0,.15)', false);
  },
  lavendel(c, d, t) {
    rrPath(c, d.x0, d.y0 + 10, d.w, d.h - 10, 10); fs(c, '#8d6346', 2.5);
    for (let k = 0; k < 22; k++) { const x = d.x0 + 10 + (k % 11) * ((d.w - 20) / 10), y = d.y0 + 30 + Math.floor(k / 11) * 14, sw = Math.sin(t * 2 + k) * 2;
      for (let m = -2; m <= 2; m++) { line(c, x, y, x + m * 4 + sw, y - 24 - Math.abs(m) * -2, 1.5, '#6a994e', false); ell(c, x + m * 4 + sw, y - 26 + Math.abs(m) * 2, 2.4, 5); c.fillStyle = m % 2 ? '#9d4edd' : '#c77dff'; c.fill(); } }
  },
  gartenbank(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y0 + d.h, 76, 9); c.fill(); rrPath(c, d.x0, d.y0 - 26, d.w, 12, 4); fs(c, '#a0673a', 2.5); rrPath(c, d.x0, d.y0 - 10, d.w, 12, 4); fs(c, '#a0673a', 2.5); rrPath(c, d.x0, d.y0 + 6, d.w, 12, 4); fs(c, '#8d5a3b', 2.5); line(c, d.x0 + 10, d.y0 + 16, d.x0 + 10, d.y0 + d.h + 2, 4, '#343a40', false); line(c, d.x0 + d.w - 10, d.y0 + 16, d.x0 + d.w - 10, d.y0 + d.h + 2, 4, '#343a40', false); },
};
function buildGridAussen() {
  cellsIn(42, 160, 958, 1340, i => (G0[i] = 1));
  cellsIn(455, 1320, 545, 1345, i => (G0[i] = 1));
  for (const d of ADECOR) {
    if (d.w) cellsIn(d.x0 - 4, d.y0 - 4, d.x0 + d.w + 4, d.y0 + d.h + 26, i => (G0[i] = 0));
    else if (d.t === 'cypress') cellsCircle(d.x, d.y - 6, 18, i => (G0[i] = 0));
    else if (d.r) cellsCircle(d.x, d.y - 6, Math.max(8, d.r - 6), i => (G0[i] = 0));
  }
}
const ASPOTS = [
  furnSpot(ADECOR, 'topf1', 'top', { px: 336, py: 168, sx: 330, sy: 236 }),
  furnSpot(ADECOR, 'topf2', 'top', { px: 664, py: 168, sx: 670, sy: 236 }),
  furnSpot(ADECOR, 'olive1', 'top', { px: 120, py: 306, sx: 110, sy: 390 }),
  furnSpot(ADECOR, 'olive2', 'top', { px: 870, py: 426, sx: 880, sy: 510 }),
  furnSpot(ADECOR, 'olive3', 'top', { px: 770, py: 906, sx: 760, sy: 990 }),
  furnSpot(ADECOR, 'set1', 'top', { px: 258, py: 510, sx: 230, sy: 565 }),
  furnSpot(ADECOR, 'set2', 'top', { px: 512, py: 510, sx: 540, sy: 565 }),
  furnSpot(ADECOR, 'set3', 'top', { px: 268, py: 810, sx: 240, sy: 865 }),
  furnSpot(ADECOR, 'set4', 'top', { px: 442, py: 810, sx: 470, sy: 865 }),
  furnSpot(ADECOR, 'brunnen', 'top', { px: 760, py: 646, cut: 657, front: true, sx: 770, sy: 722 }),
  furnSpot(ADECOR, 'kugel1', 'right', { px: 390, py: 640, sx: 412, sy: 660 }),
  furnSpot(ADECOR, 'kugel3', 'left', { px: 610, py: 870, sx: 588, sy: 890 }),
  furnSpot(ADECOR, 'kissenbox', 'top', { px: 104, py: 832, cut: 840, front: true, sx: 150, sy: 912 }),
  furnSpot(ADECOR, 'cyp1', 'left', { px: 918, py: 620, sx: 890, sy: 650 }),
  furnSpot(ADECOR, 'cyp3', 'right', { px: 82, py: 960, sx: 110, sy: 990 }),
  furnSpot(ADECOR, 'liege1', 'top', { px: 200, py: 1240, sx: 200, sy: 1306 }),
  furnSpot(ADECOR, 'liege2', 'top', { px: 330, py: 1240, sx: 330, sy: 1306 }),
  furnSpot(ADECOR, 'beet', 'top', { px: 700, py: 1146, sx: 700, sy: 1212 }),
  furnSpot(ADECOR, 'beet', 'top', { px: 830, py: 1146, sx: 830, sy: 1212, tag: 'b' }),
  furnSpot(ADECOR, 'bank', 'top', { px: 790, py: 1276, sx: 790, sy: 1240 }),
];
// Laubhaufen: darunter guckt etwas hervor
function drawLeafPile(c, x, y, w, seed = 0) {
  c.save(); c.translate(x, y);
  ell(c, 0, 2, w * 0.95, w * 0.32); c.fillStyle = 'rgba(0,0,0,.12)'; c.fill();
  for (let k = 0; k < 14; k++) { const a = (k * 2.4 + seed) % TAU, rr = (k % 4) * w * 0.2; c.save(); c.translate(Math.cos(a) * rr, -Math.abs(Math.sin(a)) * rr * 0.35 - (k > 9 ? 6 : 0)); c.rotate(a * 2); ell(c, 0, 0, w * 0.26, w * 0.13); fs(c, ['#6a994e', '#a7c957', '#dda15e', '#bc6c25'][(k + seed) % 4], 1.5); c.restore(); }
  c.restore();
}
// Gartentor mit Holzbogen und Schild "Chalet" (Boss-Level)
function drawGardenGate(c, x, y, s, open, locked, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, 0, 4, 76, 12); c.fill();
  rrPath(c, -62, -130, 16, 134, 4); fs(c, '#8d5a3b', 3); rrPath(c, 46, -130, 16, 134, 4); fs(c, '#8d5a3b', 3);
  c.beginPath(); c.moveTo(-66, -122); c.quadraticCurveTo(0, -176, 66, -122); c.lineWidth = 14; c.strokeStyle = OL; c.stroke(); c.lineWidth = 9; c.strokeStyle = '#a0673a'; c.stroke();
  for (let k = 0; k < 8; k++) { const u = k / 7, xx = -60 + u * 120, yy = -122 - Math.sin(u * Math.PI) * 30; ell(c, xx, yy, 7, 5); fs(c, k % 2 ? '#52b788' : '#74c69d', 1.5); }
  rrPath(c, -34, -162, 68, 24, 5); fs(c, '#fbf8f2', 2.5); txt(c, 'Chalet', 0, -150, 14, '#6f4e37', 'center', null);
  const o = clamp(open, 0, 1);
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * 46, 0); c.scale(1 - o * 0.85, 1); const x0 = sd > 0 ? -46 : 0; for (let k = 0; k < 4; k++) { rrPath(c, x0 + 3 + k * 11, -86 + (sd > 0 ? 3 - k : k) * 2, 9, 84, 3); fs(c, '#c08b55', 2); } line(c, x0 + 2, -66, x0 + 44, -66, 4, '#8d5a3b'); line(c, x0 + 2, -22, x0 + 44, -22, 4, '#8d5a3b'); c.restore(); }
  if (locked) { const b = Math.sin(t * 3) * 2; ell(c, 0, -104 + b, 14, 14); fs(c, '#fff', 2.5); icon(c, 'lock', 0, -104 + b, 18); }
  c.restore();
}
STAGE_DEFS.aussen = {
  id: 'aussen', bg: '#5b8c45', start: { x: 500, y: 230 }, gate: { x: 500, y: 1392, ix: 500, iy: 1320 },
  npcs: [
    { id: 'a_weber', pos: [[230, 610], [560, 640], [870, 590]] },
    { id: 'a_hoffmann', pos: [[400, 450], [700, 440], [160, 450]] },
    { id: 'a_klaus', pos: [[200, 1060], [120, 1310], [430, 1250]] },
    { id: 'a_mila', pos: [[640, 760], [820, 800], [340, 980]] },
    { id: 'a_noah', pos: [[880, 1040], [640, 1300], [600, 1050]] },
  ],
  decor: ADECOR, spots: ASPOTS, grid: buildGridAussen, ground: drawGroundAussen, decorDraw: ADRAW,
  feat: { swing: false, slide: false, house: false, racer: false, pigeons: false, waiter: false, dig: false },
  junk: ['leaf', 'pebble', 'cap'], items: AUSSEN_ITEMS, cover: drawLeafPile,
  drawGate: drawGardenGate, gateName: 'Das Gartentor', dialogGate: 0.44, gateFace: (c, x, y, s, t) => drawGardenGate(c, x, y, s * 0.36, 0, true, t),
  words: { one: 'Gast', the: 'den Gast', a: 'einen Gast', many: 'Gäste', dat: 'Gästen', back: 'zum Gast', each: 'Jeder Gast',
    hide: 'in Blumentöpfen, unter Tischen und Liegestühlen, im Brunnen und im Lavendel', junk: 'ein Blatt oder ein Kronkorken', gate: 'am Gartentor zum Chalet', gateTap: 'Lauf zum Gartentor und tippe es an!',
    opened: 'Das Gartentor ist offen!',
    lock: 'Das Gartentor zum Chalet geht erst auf, wenn du allen fünf Gästen geholfen hast.',
    progress: 'Dir fehlen noch ein paar Sachen, oben siehst du welche. Schau in die Blumentöpfe, unter Tische und Liegestühle und in den Brunnen!',
    gateAsk: 'Das Gartentor klemmt! Bring mir diese Sachen, dann geht es auf und du kommst zum Chalet.',
    search: 'Schau in Blumentöpfe und unter Tische – dann tippe auf die Lupe!' },
  pools: {
    easy: ['schirme', 'wespen', 'tauben', 'werfen', 'kissen', 'giessen', 'fegen', 'limo_mix', 'eisbecher_r', 'memory', 'sort', 'size_row', 'count_easy', 'cups', 'stack', 'findall', 'shadow', 'trace', 'maze_easy', 'connect', 'color', 'pop'],
    puzzle: ['tauben', 'limo_mix', 'eisbecher_r', 'pipes', 'lights', 'pattern', 'diff', 'mirror', 'rotimg', 'nextrow', 'count', 'puzzle', 'maze', 'oddone', 'pairs', 'dials'],
    std: ['schirme', 'wespen', 'werfen', 'kissen', 'collect'],
    sp: ['werfen', 'kissen', 'balance_walk', 'run'],
    hard: ['jump', 'platform', 'slide'],
  },
  extras(play) {
    // Sonnensegel flattern, Schmetterlinge am Lavendel, Kellner läuft mit Getränken
    const flies = [0, 1, 2, 3].map(i => ({ x: 680 + i * 50, y: 1120, ph: i * 1.7 }));
    const route = [[500, 300], [380, 660], [360, 960], [600, 960], [640, 420]], K = { x: 500, y: 300, i: 1, pause: 0 };
    return {
      update(dt) {
        flies.forEach(f => { f.ph += dt; f.x = 760 + Math.sin(f.ph * 0.7 + f.y) * 120; f.y = 1110 + Math.sin(f.ph * 1.3) * 40; });
        const p = play.p; if (K.pause > 0) { K.pause -= dt; return; } if (dist(p.x, p.y, K.x, K.y) < 60) return;
        const [tx, ty] = route[K.i], d = dist(K.x, K.y, tx, ty), s = 75 * dt; if (d <= s) { K.x = tx; K.y = ty; K.i = (K.i + 1) % route.length; if (Math.random() < 0.4) K.pause = 1.4; } else { K.x += (tx - K.x) / d * s; K.y += (ty - K.y) / d * s; }
      },
      draw(c, L, vis, t) {
        if (vis(K.x, K.y)) L.push({ y: K.y, f: () => { drawPerson(c, 'a_ober', K.x, K.y, 1.05, t * 2, { ph: 2 }); c.save(); c.translate(K.x + 18, K.y - 46); ell(c, 0, 0, 20, 6); fs(c, '#adb5bd', 2.5); drawGlass(c, -8, -2, 0.3, 0.7, '#ff9f1c'); drawGlass(c, 8, -2, 0.3, 0.6, '#e63946'); c.restore(); } });
        flies.forEach((f, i) => { if (!vis(f.x, f.y)) return; L.push({ y: f.y + 40, f: () => { const fl = Math.abs(Math.sin(t * 14 + i)); c.save(); c.translate(f.x, f.y - 40); for (const sd of [-1, 1]) { ell(c, sd * 6 * fl, -3, 6 * fl + 1, 5, sd * 0.4); fs(c, ['#ffd166', '#fff', '#74c0fc', '#ff8fab'][i], 1.2); } line(c, 0, -6, 0, 4, 1.5, OL, false); c.restore(); } }); });
        L.push({ y: 99998, f: () => {
          ASAILS.forEach((P, i) => {
            const mx = (P[0][0] + P[1][0] + P[2][0]) / 3, my = (P[0][1] + P[1][1] + P[2][1]) / 3;
            if (!vis(mx, my)) return;
            c.save();
            for (const [x, y] of P) { line(c, x, y, x, y - SAIL_H - 10, 4, '#6c757d'); ell(c, x, y, 6, 3); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); }
            const fl = Math.sin(t * 1.6 + i * 2) * 6, Q = P.map(([x, y]) => [x, y - SAIL_H]);
            const pp = play.p, under = dist(pp.x, pp.y, mx, my) < 230 || [K].some(k => dist(k.x, k.y, mx, my) < 150);
            S_FADE[i] = lerp(S_FADE[i], under ? 0.16 : 0.5, 0.08); c.globalAlpha = S_FADE[i]; sailPath(c, Q, 0.2, fl);
            const gr = c.createLinearGradient(Q[0][0], Q[0][1], Q[2][0], Q[2][1]); gr.addColorStop(0, i === 1 ? '#ff922b' : '#f76707'); gr.addColorStop(1, i === 1 ? '#e8590c' : '#d9480f'); c.fillStyle = gr; c.fill();
            c.globalAlpha = Math.min(0.9, S_FADE[i] * 1.8); c.lineWidth = 2.5; c.strokeStyle = 'rgba(110,40,10,.8)'; c.stroke();
            c.globalAlpha = S_FADE[i] * 0.45; sailPath(c, Q.map(([x, y]) => [x + (mx - x) * 0.35, y + (my - SAIL_H - y) * 0.35]), 0.2, fl * 0.5); c.fillStyle = '#fff'; c.fill();
            c.restore();
          });
        } });
      },
    };
  },
};
