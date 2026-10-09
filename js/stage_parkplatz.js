'use strict';
// ---------- Stage "Parkplatz": der Weg nach Hause (nach dem Luftbild vom Original: großer heller Kiesplatz, daneben Asphalt mit
// Parkbuchten, Bäume auf Inseln, Laternen, Zufahrt zur Straße mit Bushaltestelle) ----------
// Oben der Zaun vom Spielplatz (Start), links Asphalt mit Buchten, rechts Kies mit locker geparkten Autos und Bauminseln,
// unten Fahrgasse mit Fahrradständer, Glascontainern, Parkautomat, Ladesäule, Bushaltestelle und der Schranke zur Straße.

Object.assign(STAFF_PEOPLE, {
  p_schmidt: { skin: '#e0ac85', hair: '#6c584c', stache: '#6c584c', jacket: '#495057', vest: '#ff9f1c', pants: '#343a40', shoes: '#212529', hat: 'cap', hatCol: '#ff9f1c' },
  p_julia: { skin: '#f1c7a5', hair: '#7a4a2a', long: true, sun: true, jacket: '#e76f51', pants: '#1d3557', shoes: '#f8f9fa' },
  p_karl: { skin: '#f6d2b8', hair: '#dee2e6', glasses: '#343a40', jacket: '#6c584c', pants: '#495057', shoes: '#212529', hat: 'flatcap', hatCol: '#495057', hold(c) { line(c, 0, 0, 2, 22, 3, '#6f4e37'); c.beginPath(); c.arc(-4, 0, 5, Math.PI, 0); c.lineWidth = 3; c.strokeStyle = '#6f4e37'; c.stroke(); } },
  p_petra: { skin: '#d9a57e', hair: '#2b1d14', bun: true, jacket: '#1d3557', pipe: '#ffd166', pants: '#1d3557', shoes: '#212529', hat: 'cap', hatCol: '#1d3557' },
  p_tim: { kid: true, skin: '#f1c7a5', hair: '#e9c46a', jacket: '#06d6a0', pants: '#343a40', shoes: '#ef476f', hat: 'helmet', hatCol: '#118ab2' },
});
Object.assign(NPC_NAMES, { p_schmidt: 'Herr Schmidt', p_julia: 'Julia', p_karl: 'Opa Karl', p_petra: 'Petra', p_tim: 'Tim' });
Object.assign(NPC_SHORT, { p_schmidt: 'Herrn Schmidt', p_julia: 'Julia', p_karl: 'Opa Karl', p_petra: 'Petra', p_tim: 'Tim' });
Object.assign(NPC_LINES, {
  p_schmidt: 'Ich passe auf den Parkplatz auf, aber mir ist einiges abhandengekommen!',
  p_julia: 'Wir wollen nach Hause fahren, aber ich finde meine Sachen nicht!',
  p_karl: 'Mein Auto steht hier irgendwo, und meine Sachen auch!',
  p_petra: 'Mein Bus fährt gleich, aber mir fehlen noch ein paar Sachen!',
  p_tim: 'Ich bin mit dem Fahrrad da, und jetzt ist meine Ausrüstung weg!',
});
Object.assign(VOICE_OF, { p_schmidt: { pitch: 0.8, rate: 0.95, pick: 4 }, p_julia: { pitch: 1.15, rate: 1.05, pick: 2 }, p_karl: { pitch: 0.75, rate: 0.85, pick: 6 }, p_petra: { pitch: 1.05, rate: 1.0, pick: 1 }, p_tim: { pitch: 1.45, rate: 1.1, pick: 3 } });

Object.assign(ITEMS, {
  autoschluessel: { n: 'Autoschlüssel', d(c, f) { rrPath(c, -16, -12, 18, 26, 7); fs(c, f('#343a40')); ell(c, -7, -4, 3, 3); fs(c, f('#adb5bd'), 1.5); ell(c, -7, 5, 3, 3); fs(c, f('#adb5bd'), 1.5); rrPath(c, 2, -3, 20, 6, 2); fs(c, f('#ced4da')); for (let k = 0; k < 3; k++) rrPath(c, 8 + k * 5, 3, 3, 4, 1), c.fillStyle = f('#ced4da'), c.fill(); ell(c, -7, -18, 6, 5); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke(); } },
  geldbeutel: { n: 'Geldbeutel', d(c, f) { rrPath(c, -18, -12, 36, 26, 6); fs(c, f('#8d5a3b')); rrPath(c, -18, -12, 36, 12, 6); fs(c, f('#a0673a'), 2.5); ell(c, 10, -2, 4, 4); fs(c, f('#ffd166'), 2); if (!f.sil) line(c, -12, 8, 6, 8, 1.5, 'rgba(255,255,255,.3)', false); } },
  handy: { n: 'Handy', d(c, f) { c.rotate(0.15); rrPath(c, -11, -20, 22, 40, 5); fs(c, f('#212529')); rrPath(c, -8, -15, 16, 28, 2); c.fillStyle = f.sil ? f('#000') : '#4dabf7'; c.fill(); if (!f.sil) { leaf(c, 0, -2, 0.4, BRAND.lime); ell(c, 0, 16, 2, 2); c.fillStyle = '#495057'; c.fill(); } } },
  parkschein: { n: 'Parkschein', d(c, f) { c.rotate(-0.2); rrPath(c, -14, -18, 28, 36, 2); fs(c, f('#fff')); if (!f.sil) { rrPath(c, -14, -18, 28, 9, 2); c.fillStyle = '#1c7ed6'; c.fill(); txt(c, 'P', 0, -13, 9, '#fff', 'center', null); for (let k = 0; k < 4; k++) line(c, -9, -2 + k * 5, 9 - (k % 2) * 6, -2 + k * 5, 1.4, '#adb5bd', false); } } },
  regenschirm: { n: 'Regenschirm', d(c, f) { c.beginPath(); c.moveTo(-22, 0); c.quadraticCurveTo(0, -30, 22, 0); c.quadraticCurveTo(16, -5, 11, 0); c.quadraticCurveTo(5, -5, 0, 0); c.quadraticCurveTo(-5, -5, -11, 0); c.quadraticCurveTo(-16, -5, -22, 0); fs(c, f('#7209b7')); line(c, 0, -2, 0, 18, 2.5, f('#495057'), false); c.beginPath(); c.arc(-4, 18, 4, 0, Math.PI); c.lineWidth = 2.5; c.strokeStyle = f('#495057'); c.stroke(); } },
  trinkflasche: { n: 'Trinkflasche', d(c, f) { rrPath(c, -9, -12, 18, 32, 7); fs(c, f('#06d6a0')); rrPath(c, -6, -20, 12, 9, 3); fs(c, f('#343a40')); if (!f.sil) { rrPath(c, -9, -2, 18, 8, 2); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill(); } } },
  rucksack: { n: 'Rucksack', d(c, f) { rrPath(c, -16, -16, 32, 36, 10); fs(c, f('#ef476f')); rrPath(c, -10, 2, 20, 14, 5); fs(c, f('#d6285a'), 2); c.beginPath(); c.arc(0, -16, 8, Math.PI, 0); c.lineWidth = 5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 2.5; c.strokeStyle = f('#d6285a'); c.stroke(); } },
  kappe_i: { n: 'Kappe', d(c, f) { c.beginPath(); c.arc(-2, 4, 16, Math.PI, 0); c.closePath(); fs(c, f('#118ab2')); ell(c, 16, 4, 12, 4); fs(c, f('#118ab2')); ell(c, -2, -12, 2.5, 2.5); fs(c, f('#fff'), 1.5); } },
  luftpumpe: { n: 'Luftpumpe', d(c, f) { c.rotate(-0.5); rrPath(c, -5, -14, 10, 32, 3); fs(c, f('#adb5bd')); rrPath(c, -12, -20, 24, 7, 3); fs(c, f('#212529')); line(c, 0, 18, 6, 26, 3, f('#212529')); } },
  spielzeugauto: { n: 'Spielzeugauto', d(c, f) { rrPath(c, -20, -4, 40, 14, 5); fs(c, f('#e63946')); c.beginPath(); c.moveTo(-10, -4); c.lineTo(-6, -14); c.lineTo(8, -14); c.lineTo(12, -4); c.closePath(); fs(c, f('#e63946')); if (!f.sil) { rrPath(c, -5, -12, 6, 7, 1); c.fillStyle = '#a5d8ff'; c.fill(); rrPath(c, 3, -12, 6, 7, 1); c.fill(); } ell(c, -11, 11, 5, 5); fs(c, f('#212529'), 2); ell(c, 11, 11, 5, 5); fs(c, f('#212529'), 2); } },
});
const PARK_ITEMS = ['autoschluessel', 'geldbeutel', 'handy', 'helm', 'parkschein', 'pluesch', 'regenschirm', 'trinkflasche', 'rucksack', 'kappe_i', 'luftpumpe', 'spielzeugauto'];

const PCOLS = ['#e9ecef', '#adb5bd', '#e63946', '#343a40', '#4dabf7', '#f8f9fa', '#8d99ae', '#ffd166', '#2a9d8f', '#6c584c'];
const BAYS = [105, 175, 245, 315, 385, 455];
function drawGroundParkplatz(g, R) {
  // Rasen + Spielplatz-Zaun oben (dort kommt man her)
  lawn(g, 0, 0, WORLD_W, 160, R);
  g.fillStyle = CHIP_BASE; g.fillRect(80, 0, 840, 100); for (let i = 0; i < 2500; i++) { g.fillStyle = CHIP_COLS[i % 6]; ell(g, 80 + R() * 840, R() * 100, 2.2, 1.2, R() * 3); g.fill(); }
  g.strokeStyle = 'rgba(60,70,75,.8)'; g.lineWidth = 1.5;
  for (let x = 0; x < WORLD_W; x += 12) { if (Math.abs(x - 500) < 50) continue; g.beginPath(); g.moveTo(x, 118); g.lineTo(x + 12, 142); g.moveTo(x + 12, 118); g.lineTo(x, 142); g.stroke(); }
  for (let x = 0; x <= WORLD_W; x += 100) { if (Math.abs(x - 500) < 50) continue; rrPath(g, x - 3, 110, 6, 36, 2); fs(g, '#adb5bd', 2); }
  g.fillStyle = '#495057'; g.fillRect(0, 114, 446, 4); g.fillRect(554, 114, 446, 4);
  // linke Fläche: Asphalt mit Buchten
  g.fillStyle = '#6c757d'; g.fillRect(0, 150, 515, 620);
  for (let i = 0; i < 9000; i++) { g.fillStyle = i % 2 ? '#737b83' : '#62696f'; g.fillRect(R() * 515, 150 + R() * 620, 2, 2); }
  for (const [y0, y1] of [[195, 312], [500, 617]]) { for (let k = 0; k <= 6; k++) line(g, 70 + k * 70, y0, 70 + k * 70, y1, 3, '#f1f3f5', false); line(g, 70, y0, 490, y0, 3, '#f1f3f5', false); }
  txt(g, 'P', 245, 420, 46, 'rgba(255,255,255,.45)', 'center', null);
  // rechte Fläche: heller Kies (wie auf dem Luftbild)
  gravel(g, 515, 150, 485, 640, R, '#ddd5c6');
  g.fillStyle = '#adb5bd'; g.fillRect(511, 150, 6, 620);
  // untere Fahrgasse (Asphalt) über die ganze Breite
  g.fillStyle = '#6c757d'; g.fillRect(0, 770, WORLD_W, 470);
  for (let i = 0; i < 8000; i++) { g.fillStyle = i % 2 ? '#737b83' : '#62696f'; g.fillRect(R() * WORLD_W, 770 + R() * 470, 2, 2); }
  g.fillStyle = '#adb5bd'; g.fillRect(0, 766, WORLD_W, 6);
  for (const [x, y, a] of [[300, 880, 0], [650, 900, Math.PI], [120, 650, -Math.PI / 2]]) { g.save(); g.translate(x, y); g.rotate(a); polyPath(g, [[-30, -6], [10, -6], [10, -16], [32, 0], [10, 16], [10, 6], [-30, 6]]); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill(); g.restore(); }
  // Pfützen
  for (const [x, y, w] of PUDDLES) { ell(g, x, y, w, w * 0.42); g.fillStyle = 'rgba(70,100,130,.55)'; g.fill(); ell(g, x - w * 0.2, y - w * 0.1, w * 0.4, w * 0.12); g.fillStyle = 'rgba(200,225,245,.5)'; g.fill(); }
  // Gehweg + Straße unten, Zebrastreifen vor der Schranke
  g.fillStyle = '#ced4da'; g.fillRect(0, 1240, WORLD_W, 30); for (let x = 0; x < WORLD_W; x += 40) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, 1240, 2, 30); }
  g.fillStyle = '#495057'; g.fillRect(0, 1270, WORLD_W, 130); for (let i = 0; i < 3000; i++) { g.fillStyle = i % 2 ? '#525a61' : '#40474d'; g.fillRect(R() * WORLD_W, 1270 + R() * 130, 2, 2); }
  for (let x = 0; x < WORLD_W; x += 70) line(g, x, 1336, x + 36, 1336, 4, '#f8f9fa', false);
  for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(450 + k * 18, 1272, 10, 126); }
  // Bordstein-Inseln für Bäume
  for (const d of PDECOR) if (d.t === 'baum') { ell(g, d.x, d.y - 6, 44, 24); fs(g, '#7fb069', 3, '#ced4da'); }
}
const PUDDLES = [[350, 990, 44], [720, 690, 36], [170, 445, 30], [880, 1040, 40]];
const car = (id, x, cy, a, col) => ({ id, t: 'auto', x, y: cy + 50, cy, a, col, r: 34, x0: x - 31, y0: cy - 54, w: 62, h: 78, bb: [x - 44, cy - 66, 88, 132] });
const PDECOR = [
  car('a1', BAYS[0], 255, 0, PCOLS[0]), car('a2', BAYS[1], 255, Math.PI, PCOLS[2]), car('a3', BAYS[3], 255, 0, PCOLS[4]), car('a4', BAYS[5], 255, 0, PCOLS[3]),
  car('a5', BAYS[2], 560, Math.PI, PCOLS[7]), car('a6', BAYS[3], 560, 0, PCOLS[1]), car('a7', BAYS[4], 560, Math.PI, PCOLS[8]),
  car('a8', 600, 290, 0.08, PCOLS[5]), car('a9', 690, 300, -0.06, PCOLS[6]), car('a10', 880, 320, 0.05, PCOLS[9]), car('a11', 630, 600, Math.PI + 0.1, PCOLS[3]), car('a12', 880, 640, Math.PI - 0.05, PCOLS[2]),
  { id: 'baum1', t: 'baum', x: 780, y: 470, r: 34, bb: [670, 300, 220, 186] },
  { id: 'baum2', t: 'baum', x: 300, y: 1170, r: 34, bb: [190, 1000, 220, 186] },
  { id: 'baum3', t: 'baum', x: 930, y: 860, r: 34, bb: [820, 690, 220, 186] },
  { id: 'lampe1', t: 'lampe_p', x: 548, y: 370, r: 10, bb: [523, 190, 70, 190] },
  { id: 'lampe2', t: 'lampe_p', x: 548, y: 735, r: 10, bb: [523, 555, 70, 190] },
  { id: 'lampe3', t: 'lampe_p', x: 640, y: 1230, r: 10, bb: [615, 1050, 70, 190] },
  { id: 'automat', t: 'automat', x: 560, y: 1000, r: 16, bb: [530, 920, 60, 86] },
  { id: 'ladesaeule', t: 'ladesaeule', x: 60, y: 760, r: 14, bb: [34, 670, 60, 96] },
  { id: 'pylon', t: 'pylon', x: 720, y: 1230, r: 22, bb: [680, 1040, 90, 196] },
  { id: 'rad', t: 'fahrradstaender', x: 170, y: 1150, x0: 90, y0: 1100, w: 160, h: 30, bb: [80, 1040, 180, 116] },
  { id: 'container', t: 'container', x: 430, y: 1160, x0: 360, y0: 1110, w: 150, h: 30, bb: [350, 1040, 170, 126] },
  { id: 'halt', t: 'haltestelle', x: 860, y: 1170, x0: 770, y0: 1130, w: 170, h: 30, bb: [760, 1020, 190, 156] },
  { id: 'busch1', t: 'busch', x: 950, y: 220, r: 26, bb: [910, 170, 80, 60] },
  { id: 'busch2', t: 'busch', x: 50, y: 1230, r: 26, bb: [10, 1180, 80, 60] },
];
const PDRAW = {
  auto(c, d) { c.fillStyle = 'rgba(0,0,0,.18)'; rrPath(c, d.x - 30, d.cy - 50, 64, 108, 18); c.fill(); drawCar(c, d.x, d.cy, d.a, d.col, 1.12); },
  baum(c, d) {
    c.fillStyle = 'rgba(0,0,0,.18)'; ell(c, d.x + 26, d.y + 4, 70, 26); c.fill();
    c.beginPath(); c.moveTo(d.x - 9, d.y - 4); c.quadraticCurveTo(d.x - 6, d.y - 60, d.x - 4, d.y - 90); c.lineTo(d.x + 6, d.y - 90); c.quadraticCurveTo(d.x + 8, d.y - 60, d.x + 9, d.y - 4); c.closePath(); fs(c, '#6f4e37', 2.5);
    for (const [dx, dy, rr] of [[-40, -110, 40], [30, -116, 44], [-6, -150, 46], [44, -150, 32], [-46, -146, 30]]) { ell(c, d.x + dx, d.y + dy, rr, rr * 0.85); fs(c, '#40916c', 3); }
    for (let k = 0; k < 14; k++) { ell(c, d.x - 50 + (k * 37) % 100, d.y - 170 + (k * 23) % 80, 7, 5, k); c.fillStyle = k % 2 ? '#74c69d' : '#52b788'; c.fill(); }
  },
  lampe_p(c, d, t) { line(c, d.x, d.y, d.x, d.y - 170, 5, '#adb5bd'); line(c, d.x, d.y - 170, d.x + 26, d.y - 176, 4, '#adb5bd'); rrPath(c, d.x + 14, d.y - 182, 30, 10, 4); fs(c, '#6c757d', 2.5); ell(c, d.x + 29, d.y - 172, 10, 3); c.fillStyle = '#fff3bf'; c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y, 10, 4); c.fill(); },
  automat(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 18, 5); c.fill(); rrPath(c, d.x - 14, d.y - 74, 28, 74, 5); fs(c, '#adb5bd', 2.5); rrPath(c, d.x - 14, d.y - 74, 28, 14, 5); fs(c, '#1c7ed6', 2); txt(c, 'P', d.x, d.y - 67, 10, '#fff', 'center', null); rrPath(c, d.x - 9, d.y - 54, 18, 12, 2); fs(c, '#212529', 1.5); rrPath(c, d.x - 5, d.y - 36, 10, 4, 2); c.fillStyle = '#212529'; c.fill(); for (let k = 0; k < 4; k++) { ell(c, d.x - 6 + (k % 2) * 12, d.y - 26 + Math.floor(k / 2) * 7, 2.5, 2.5); c.fillStyle = '#495057'; c.fill(); } },
  ladesaeule(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 18, 5); c.fill(); rrPath(c, d.x - 13, d.y - 86, 26, 86, 6); fs(c, '#f8f9fa', 2.5); rrPath(c, d.x - 13, d.y - 86, 26, 20, 6); fs(c, '#95C11F', 2); polyPath(c, [[d.x + 2, d.y - 82], [d.x - 5, d.y - 74], [d.x, d.y - 74], [d.x - 3, d.y - 68], [d.x + 5, d.y - 77], [d.x, d.y - 77]]); c.fillStyle = '#fff'; c.fill(); c.beginPath(); c.moveTo(d.x + 12, d.y - 50); c.quadraticCurveTo(d.x + 30, d.y - 30, d.x + 14, d.y - 14); c.lineWidth = 3; c.strokeStyle = '#212529'; c.stroke(); },
  pylon(c, d) {
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 28, 7); c.fill();
    rrPath(c, d.x - 24, d.y - 180, 48, 180, 6); fs(c, '#343a40', 3); rrPath(c, d.x - 20, d.y - 170, 40, 120, 4); fs(c, '#fbf8f2', 2);
    c.save(); c.translate(d.x, d.y - 110); c.rotate(-Math.PI / 2); drawLogo(c, 0, 0, 100, false); c.restore();
    rrPath(c, d.x - 20, d.y - 44, 40, 30, 4); fs(c, '#95C11F', 2); txt(c, 'P', d.x, d.y - 29, 18, '#fff', 'center', null);
  },
  fahrradstaender(c, d) {
    for (let k = 0; k < 4; k++) { const x = d.x0 + 20 + k * 40; c.beginPath(); c.arc(x, d.y0 + 14, 14, Math.PI, 0); c.lineWidth = 4; c.strokeStyle = '#adb5bd'; c.stroke(); }
    for (let k = 0; k < 3; k++) { const x = d.x0 + 22 + k * 52; ell(c, x, d.y0 - 4, 18, 18); c.lineWidth = 3.5; c.strokeStyle = OL; c.stroke(); ell(c, x + 26, d.y0 + 26, 14, 14); c.stroke(); line(c, x, d.y0 - 4, x + 26, d.y0 + 26, 3.5, ['#e63946', '#1c7ed6', '#ffd166'][k]); line(c, x + 4, d.y0 - 4, x + 10, d.y0 - 26, 3, ['#e63946', '#1c7ed6', '#ffd166'][k]); rrPath(c, x + 2, d.y0 - 30, 18, 6, 3); fs(c, '#212529', 1.5); }
  },
  container(c, d) {
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y0 + d.h + 4, 86, 10); c.fill();
    [['#f8f9fa', 'Weiß'], ['#2b9348', 'Grün'], ['#8d5a3b', 'Braun']].forEach(([col, lab], k) => { const x = d.x0 + k * 50; rrPath(c, x + 2, d.y0 - 60, 46, 90, 10); fs(c, col, 3); ell(c, x + 25, d.y0 - 44, 9, 9); c.fillStyle = '#212529'; c.fill(); rrPath(c, x + 8, d.y0 - 20, 34, 14, 3); fs(c, '#fff', 1.5); txt(c, lab, x + 25, d.y0 - 13, 8, '#212529', 'center', null); });
  },
  haltestelle(c, d) {
    // Wartehäuschen mit Glas + gelbes H-Schild
    rrPath(c, d.x0, d.y0 - 110, d.w, 12, 4); fs(c, '#495057', 2.5);
    rrPath(c, d.x0 + 4, d.y0 - 98, d.w - 8, 100, 2); c.fillStyle = 'rgba(200,230,245,.45)'; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
    line(c, d.x0 + 6, d.y0 - 98, d.x0 + 6, d.y0 + d.h, 4, '#868e96'); line(c, d.x0 + d.w - 6, d.y0 - 98, d.x0 + d.w - 6, d.y0 + d.h, 4, '#868e96');
    rrPath(c, d.x0 + 30, d.y0 - 10, d.w - 60, 12, 3); fs(c, '#c08b55', 2);
    line(c, d.x0 + d.w + 16, d.y0 + d.h, d.x0 + d.w + 16, d.y0 - 120, 4, '#adb5bd'); ell(c, d.x0 + d.w + 16, d.y0 - 130, 16, 16); fs(c, '#ffd60a', 2.5); ell(c, d.x0 + d.w + 16, d.y0 - 130, 12, 12); fs(c, null, 1.5, '#2b9348'); txt(c, 'H', d.x0 + d.w + 16, d.y0 - 130, 14, '#2b9348', 'center', null);
    rrPath(c, d.x0 + 16, d.y0 - 90, 40, 54, 3); fs(c, '#fbf8f2', 2); leaf(c, d.x0 + 36, d.y0 - 66, 0.5, BRAND.lime);
  },
  busch(c, d) { for (const [dx, dy, rr] of [[-14, -10, 20], [12, -12, 22], [0, -26, 20]]) { ell(c, d.x + dx, d.y + dy, rr, rr * 0.85); fs(c, '#40916c', 2.5); } },
};
function buildGridParkplatz() {
  cellsIn(20, 160, 980, 1236, i => (G0[i] = 1));
  cellsIn(455, 100, 545, 170, i => (G0[i] = 1));
  cellsIn(455, 1230, 545, 1345, i => (G0[i] = 1));
  for (const d of PDECOR) {
    if (d.w) cellsIn(d.x0 - 4, d.y0 - 4, d.x0 + d.w + 4, d.y0 + d.h + (d.t === 'auto' ? 0 : 26), i => (G0[i] = 0));
    else if (d.r) cellsCircle(d.x, d.y - 6, Math.max(8, d.r - 6), i => (G0[i] = 0));
  }
}
const PSPOTS = [
  furnSpot(PDECOR, 'a1', 'right', { px: 138, py: 262, sx: 130, sy: 345 }),
  furnSpot(PDECOR, 'a3', 'left', { px: 282, py: 262, sx: 300, sy: 345 }),
  furnSpot(PDECOR, 'a4', 'left', { px: 422, py: 262, sx: 420, sy: 345 }),
  furnSpot(PDECOR, 'a5', 'right', { px: 278, py: 566, sx: 270, sy: 650 }),
  furnSpot(PDECOR, 'a7', 'left', { px: 352, py: 566, sx: 360, sy: 650 }),
  furnSpot(PDECOR, 'a8', 'left', { px: 568, py: 298, sx: 560, sy: 385 }),
  furnSpot(PDECOR, 'a10', 'left', { px: 848, py: 328, sx: 840, sy: 415 }),
  furnSpot(PDECOR, 'a11', 'right', { px: 662, py: 606, sx: 670, sy: 690 }),
  furnSpot(PDECOR, 'a12', 'left', { px: 848, py: 646, sx: 840, sy: 730 }),
  furnSpot(PDECOR, 'automat', 'right', { px: 573, py: 962, sx: 592, sy: 1010 }),
  furnSpot(PDECOR, 'ladesaeule', 'right', { px: 74, py: 722, sx: 98, sy: 790 }),
  furnSpot(PDECOR, 'pylon', 'left', { px: 700, py: 1160, sx: 678, sy: 1205 }),
  furnSpot(PDECOR, 'rad', 'top', { px: 152, py: 1098, sx: 150, sy: 1180 }),
  furnSpot(PDECOR, 'container', 'right', { px: 506, py: 1080, sx: 532, sy: 1140 }),
  furnSpot(PDECOR, 'container', 'left', { px: 366, py: 1080, sx: 338, sy: 1140, tag: 'l' }),
  furnSpot(PDECOR, 'halt', 'on', { px: 832, py: 1120, sx: 830, sy: 1205, sz: 0.55 }),
  furnSpot(PDECOR, 'busch1', 'left', { px: 932, py: 202, sx: 905, sy: 235 }),
  furnSpot(PDECOR, 'busch2', 'right', { px: 66, py: 1212, sx: 92, sy: 1222 }),
  furnSpot(PDECOR, 'baum2', 'right', { px: 314, py: 1130, sx: 345, sy: 1175 }),
];
// flach gedrückter Pappkarton – darunter guckt etwas hervor
function drawCardboard(c, x, y, w, seed = 0) {
  c.save(); c.translate(x, y); c.rotate(((seed * 37) % 7 - 3) * 0.07);
  polyPath(c, [[-w, -w * 0.2], [w * 0.8, -w * 0.32], [w, w * 0.25], [-w * 0.85, w * 0.36]]); fs(c, '#c8a27a', 2.5);
  line(c, -w * 0.9, w * 0.05, w * 0.9, -w * 0.05, 1.5, 'rgba(90,60,30,.4)', false); rrPath(c, -w * 0.3, -w * 0.12, w * 0.5, w * 0.16, 2); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
  c.restore();
}
// Schranke mit Häuschen (Boss-Level: Ausfahrt nach Hause)
function drawBarrier(c, x, y, s, open, locked, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, -40, 4, 40, 10); c.fill();
  rrPath(c, -86, -64, 36, 68, 6); fs(c, '#f8f9fa', 3); rrPath(c, -86, -64, 36, 16, 6); fs(c, '#e63946', 2.5); rrPath(c, -80, -42, 24, 20, 3); fs(c, '#212529', 2); ell(c, -68, -32, 4, 4); c.fillStyle = locked ? '#ff4d4d' : '#2bff6a'; c.fill();
  const a = -clamp(open, 0, 1) * 1.35;
  c.save(); c.translate(-56, -40); c.rotate(a); rrPath(c, 0, -6, 150, 12, 6); fs(c, '#fff', 3); c.save(); rrPath(c, 0, -6, 150, 12, 6); c.clip(); c.fillStyle = '#e63946'; for (let k = 0; k < 8; k++) c.fillRect(8 + k * 20, -6, 10, 12); c.restore(); c.restore();
  rrPath(c, 84, -30, 10, 34, 3); fs(c, '#adb5bd', 2);
  if (locked) { const b = Math.sin(t * 3) * 2; ell(c, 20, -80 + b, 14, 14); fs(c, '#fff', 2.5); icon(c, 'lock', 20, -80 + b, 18); }
  c.restore();
}
STAGE_DEFS.parkplatz = {
  id: 'parkplatz', bg: '#5b8c45', start: { x: 520, y: 190 }, gate: { x: 500, y: 1392, ix: 500, iy: 1320 },
  npcs: [
    { id: 'p_schmidt', pos: [[300, 470], [600, 450], [420, 960]] },
    { id: 'p_julia', pos: [[245, 280], [700, 410], [380, 1010]] },
    { id: 'p_karl', pos: [[315, 660], [880, 500], [560, 1170]] },
    { id: 'p_petra', pos: [[820, 1080], [700, 1010], [900, 960]] },
    { id: 'p_tim', pos: [[180, 1030], [385, 660], [640, 790]] },
  ],
  decor: PDECOR, spots: PSPOTS, grid: buildGridParkplatz, ground: drawGroundParkplatz, decorDraw: PDRAW,
  feat: { swing: false, slide: false, house: false, racer: false, pigeons: false, waiter: false, dig: false },
  junk: ['cap', 'pebble', 'zettel'], items: PARK_ITEMS, cover: drawCardboard,
  drawGate: drawBarrier, gateName: 'Die Schranke', dialogGate: 0.4, gateFace: (c, x, y, s, t) => drawBarrier(c, x + 8, y, s * 0.3, 0, true, t),
  words: { one: 'Person', the: 'die Person', a: 'eine Person', many: 'Leute', dat: 'Leuten', back: 'zur Person', each: 'Jede Person',
    hide: 'hinter Autos, an Containern, Automat und Büschen', junk: 'ein Kronkorken oder ein Zettel', gate: 'an der Schranke zur Straße', gateTap: 'Lauf zur Schranke und tippe sie an!',
    opened: 'Die Schranke ist offen!',
    lock: 'Die Schranke geht erst auf, wenn du allen fünf Leuten geholfen hast.',
    progress: 'Dir fehlen noch ein paar Sachen, oben siehst du welche. Schau hinter die Autos, an die Container und den Automaten!',
    gateAsk: 'Die Schranke klemmt! Bring mir diese Sachen, dann geht sie auf und es geht ab nach Hause.',
    search: 'Schau hinter Autos und Container – dann tippe auf die Lupe!' },
  pools: {
    easy: ['einparken', 'pumpen', 'bus', 'stau', 'memory', 'connect', 'shadow', 'trace', 'maze_easy', 'count_easy', 'findall', 'sort', 'size_row', 'cups', 'stack', 'color', 'pop', 'dots_easy'],
    puzzle: ['stau', 'einparken', 'dials', 'lights', 'pipes', 'diff', 'nextrow', 'mirror', 'puzzle', 'rotimg', 'sequence', 'dots', 'count', 'pattern', 'oddone', 'pairs'],
    std: ['einparken', 'pumpen', 'bus', 'collect'],
    sp: ['pumpen', 'bus', 'run', 'balance_walk'],
    hard: ['heimfahrt', 'jump', 'platform'],
  },
  extras(play) {
    // ein Auto dreht seine Runde (hält an, wenn man davor steht), auf der Straße fährt der Verkehr, der Bus hält an der Haltestelle, Pfützen kräuseln sich
    const route = [[105, 900], [105, 410], [480, 410], [500, 880]], A = { x: 105, y: 900, i: 1, a: 0, wait: 0 };
    const road = [0, 1, 2].map(k => ({ x: k * 420, dir: -1, col: PCOLS[(k * 3 + 2) % PCOLS.length] }));
    const bus = { x: -300, stop: 0 };
    return {
      update(dt) {
        const p = play.p, [tx, ty] = route[A.i], d = dist(A.x, A.y, tx, ty), ahead = dist(p.x, p.y, A.x + Math.sin(A.a) * 60, A.y - Math.cos(A.a) * 60) < 70;
        if (A.wait > 0) A.wait -= dt;
        else if (!ahead) { const s = 80 * dt; if (d <= s) { A.x = tx; A.y = ty; A.i = (A.i + 1) % route.length; A.wait = 0.6; } else { A.x += (tx - A.x) / d * s; A.y += (ty - A.y) / d * s; const na = Math.atan2(tx - A.x, -(ty - A.y)); let da = na - A.a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; A.a += da * Math.min(1, dt * 5); } }
        road.forEach(r2 => { r2.x += r2.dir * 160 * dt; if (r2.x > 1100) r2.x = -100; if (r2.x < -100) r2.x = 1100; });
        if (bus.stop > 0) bus.stop -= dt; else { bus.x += 130 * dt; if (bus.x > 1300) bus.x = -600; if (Math.abs(bus.x - 860) < 2 && !bus.done) { bus.stop = 4; bus.done = true; } if (bus.x > 900) bus.done = false; }
      },
      draw(c, L, vis, t) {
        if (vis(A.x, A.y)) L.push({ y: A.y + 50, f: () => drawCar(c, A.x, A.y, A.a, '#118ab2', 1.12, { lights: true, brake: A.wait > 0 }) });
        L.push({ y: 1300, f: () => {
          road.forEach(r2 => { if (vis(r2.x, 1300)) drawCar(c, r2.x, r2.dir > 0 ? 1366 : 1306, r2.dir > 0 ? Math.PI / 2 : -Math.PI / 2, r2.col, 0.95, { lights: true }); });
          if (vis(bus.x, 1300)) { c.save(); c.translate(bus.x, 1360); rrPath(c, -130, -30, 260, 60, 14); fs(c, '#ffd166', 3); for (let k = 0; k < 6; k++) { rrPath(c, -118 + k * 40, -22, 32, 20, 4); fs(c, '#a5d8ff', 2); } rrPath(c, 80, -6, 30, 30, 3); fs(c, bus.stop > 0 ? '#343a40' : '#fff3bf', 2); c.restore(); }
        } });
        L.push({ y: -1, f: () => { PUDDLES.forEach(([x, y, w], i) => { if (!vis(x, y)) return; const p = (t * 0.6 + i * 0.3) % 1; ell(c, x + Math.sin(i * 3) * w * 0.3, y, w * 0.2 + p * w * 0.5, (w * 0.2 + p * w * 0.5) * 0.42); c.lineWidth = 1.5; c.strokeStyle = `rgba(220,240,255,${0.6 * (1 - p)})`; c.stroke(); }); } });
      },
    };
  },
};
