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
// Aufbau wie auf dem Luftbild (Norden oben): oben links der Kreisverkehr mit Grasinsel (Brühlstraße), oben rechts der Spielplatz
// (dort kommt man her), rechts die Dächer von Chalet und Nebengebäude, darunter der große helle Platz mit zwei schrägen
// Pfostenreihen und einer Pflanzinsel in der Mitte, Hecken mit Bäumen links und unten, Anhänger + Transporter unten links,
// Ausfahrt mit Schranke unten rechts.
const RB = { x: 300, y: 330, r: 235, ri: 78 };
const PROWS = [[[60, 760], [620, 590]], [[90, 1020], [720, 830]]];
const PPOSTS = []; PROWS.forEach(([a, b], ri) => { const n = Math.floor(dist(a[0], a[1], b[0], b[1]) / 30); for (let k = 0; k <= n; k++) { if (Math.abs(k - n / 2) < 1.6) continue; const u = k / n; PPOSTS.push([Math.round(lerp(a[0], b[0], u)), Math.round(lerp(a[1], b[1], u))]); } });
const PUDDLES = [[640, 700, 34], [260, 1180, 40]];
function drawGroundParkplatz(g, R) {
  // heller Beton/Kies-Platz überall
  g.fillStyle = '#d3cec4'; g.fillRect(0, 0, WORLD_W, WORLD_H);
  for (let i = 0; i < 26000; i++) { g.fillStyle = ['#c9c3b8', '#dcd7ce', '#bfb9ad', '#e3dfd7'][i % 4]; g.fillRect(R() * WORLD_W, R() * WORLD_H, 2, 2); }
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(120,110,95,.06)'; ell(g, R() * WORLD_W, R() * WORLD_H, 70 + R() * 90, 30 + R() * 40, R() * 3); g.fill(); }
  // Reifenspuren
  g.strokeStyle = 'rgba(90,85,75,.08)'; g.lineWidth = 14; for (const [x1, y1, x2, y2] of [[300, 560, 520, 1300], [380, 560, 800, 1340], [520, 450, 880, 1300]]) { g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo((x1 + x2) / 2 + 60, (y1 + y2) / 2, x2, y2); g.stroke(); }
  // Brühlstraße von links in den Kreisverkehr
  g.save(); g.lineCap = 'butt'; g.strokeStyle = '#8b9196'; g.lineWidth = 150; g.beginPath(); g.moveTo(-60, RB.y); g.lineTo(RB.x, RB.y); g.stroke(); g.restore();
  // Kreisverkehr: Asphaltring mit Bordstein, Grasinsel mit Büschen
  ell(g, RB.x, RB.y, RB.r + 6, RB.r + 6); g.fillStyle = '#b8b2a6'; g.fill();
  ell(g, RB.x, RB.y, RB.r, RB.r); g.fillStyle = '#8b9196'; g.fill();
  g.save(); ell(g, RB.x, RB.y, RB.r, RB.r); g.clip(); for (let i = 0; i < 5000; i++) { g.fillStyle = i % 2 ? '#959ba0' : '#80868b'; g.fillRect(RB.x - RB.r + R() * RB.r * 2, RB.y - RB.r + R() * RB.r * 2, 2, 2); } g.restore();
  g.setLineDash([18, 16]); ell(g, RB.x, RB.y, (RB.r + RB.ri) / 2, (RB.r + RB.ri) / 2); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.55)'; g.stroke(); g.setLineDash([]);
  ell(g, RB.x, RB.y, RB.ri + 8, RB.ri + 8); g.fillStyle = '#ced4da'; g.fill(); ell(g, RB.x, RB.y, RB.ri, RB.ri); g.fillStyle = '#7fb069'; g.fill();
  for (let i = 0; i < 400; i++) { const a2 = R() * TAU, rr = R() * RB.ri; g.strokeStyle = ['#6a994e', '#8cbf6f', '#a7c957'][i % 3]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(RB.x + Math.cos(a2) * rr, RB.y + Math.sin(a2) * rr); g.lineTo(RB.x + Math.cos(a2) * rr, RB.y + Math.sin(a2) * rr - 5); g.stroke(); }
  // oben: Durchgang vom Spielplatz (heller Weg)
  g.save(); g.lineCap = 'round'; g.strokeStyle = '#e8e3d9'; g.lineWidth = 90; g.beginPath(); g.moveTo(520, -20); g.lineTo(520, 200); g.stroke(); g.restore();
  // Hecken: links + unten (mit Ausfahrt unten rechts)
  for (let y = 0; y < 1400; y += 26) { if (Math.abs(y - RB.y) < 90) continue; ell(g, 22 + (y % 52 ? 4 : 0), y, 30, 20); fs(g, y % 52 ? '#2d6a4f' : '#40916c', 2); }
  for (let y = 0; y < 1330; y += 26) { ell(g, 978 - (y % 52 ? 4 : 0), y, 30, 20); fs(g, y % 52 ? '#2d6a4f' : '#40916c', 2); }
  for (let x = 0; x < WORLD_W; x += 26) if (x < 730 || x > 870) { ell(g, x, 1340, 22, 24); fs(g, x % 52 ? '#2d6a4f' : '#40916c', 2); }
  g.fillStyle = '#6c757d'; g.fillRect(730, 1350, 140, 50);
  // Pfützen
  for (const [x, y, w] of PUDDLES) { ell(g, x, y, w, w * 0.42); g.fillStyle = 'rgba(70,100,130,.45)'; g.fill(); ell(g, x - w * 0.2, y - w * 0.1, w * 0.4, w * 0.12); g.fillStyle = 'rgba(200,225,245,.5)'; g.fill(); }
}
const car = (id, x, cy, a, col) => ({ id, t: 'auto', x, y: cy + 58, cy, a, col, r: 34, x0: x - 34 - Math.abs(a) * 40, y0: cy - 60, w: 68 + Math.abs(a) * 80, h: 120, bb: [x - 60, cy - 70, 120, 140] });
const PDECOR = [
  // am Rand vom Kreisverkehr geparkt (wie auf dem Bild)
  car('a1', 95, 640, 0.25, PCOLS[0]), car('a2', 170, 625, 0.2, PCOLS[3]), car('a3', 360, 625, -0.2, PCOLS[3]), car('a4', 440, 610, -0.25, PCOLS[2]),
  car('a5', 300, 858, 0.05, PCOLS[4]), car('a6', 470, 1200, 0.1, PCOLS[3]), car('a7', 640, 470, 0, PCOLS[1]),
  { id: 'anhaenger', t: 'anhaenger', x: 90, y: 1150, x0: 70, y0: 1010, w: 44, h: 140, bb: [55, 990, 80, 170] },
  { id: 'transporter', t: 'transporter', x: 92, y: 1290, x0: 64, y0: 1180, w: 56, h: 110, bb: [50, 1160, 90, 140] },
  { id: 'insel', t: 'rbinsel', x: RB.x, y: RB.y + RB.ri, bb: [RB.x - 110, RB.y - 180, 220, 270] },
  { id: 'pflanz', t: 'pflanzinsel', x: 420, y: 810, r: 34, bb: [370, 700, 100, 120] },
  ...PPOSTS.map(([x, y], i) => ({ id: 'po' + i, t: 'poller', x, y, r: 9, bb: [x - 8, y - 26, 16, 30] })),
  { id: 'lampe1', t: 'lampe_p', x: 640, y: 230, r: 10, bb: [615, 50, 70, 190] },
  { id: 'lampe2', t: 'lampe_p', x: 760, y: 900, r: 10, bb: [735, 720, 70, 190] },
  { id: 'busch1', t: 'busch', x: 70, y: 860, r: 26, bb: [30, 810, 80, 60] },
  { id: 'busch2', t: 'busch', x: 420, y: 1300, r: 26, bb: [380, 1250, 80, 60] },
  { id: 'busch3', t: 'busch', x: 880, y: 1290, r: 26, bb: [840, 1240, 80, 60] },
  { id: 'baum1', t: 'baum', x: 60, y: 520, r: 30, bb: [-50, 340, 220, 186] },
  { id: 'baum2', t: 'baum', x: 660, y: 1330, r: 30, bb: [550, 1150, 220, 186] },
  { id: 'pylon', t: 'pylon', x: 880, y: 1200, r: 22, bb: [840, 1010, 90, 196] },
];
const PDRAW = {
  auto(c, d) { c.fillStyle = 'rgba(0,0,0,.18)'; rrPath(c, d.x - 28, d.cy - 48, 64, 108, 18); c.fill(); drawCar(c, d.x, d.cy, d.a, d.col, 1.12); },
  anhaenger(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; rrPath(c, d.x0 + 6, d.y0 + 8, d.w, d.h, 4); c.fill(); rrPath(c, d.x0, d.y0, d.w, d.h, 4); fs(c, '#6c757d', 3); for (let k = 1; k < 6; k++) line(c, d.x0 + 4, d.y0 + k * d.h / 6, d.x0 + d.w - 4, d.y0 + k * d.h / 6, 1.5, 'rgba(255,255,255,.2)', false); line(c, d.x0 + d.w / 2, d.y0, d.x0 + d.w / 2, d.y0 - 22, 4, '#343a40'); },
  transporter(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; rrPath(c, d.x0 + 6, d.y0 + 8, d.w, d.h, 10); c.fill(); rrPath(c, d.x0, d.y0, d.w, d.h, 10); fs(c, '#f8f9fa', 3); rrPath(c, d.x0 + 6, d.y0 + 8, d.w - 12, 20, 5); fs(c, '#5a6f7d', 2); line(c, d.x0 + 6, d.y0 + 40, d.x0 + d.w - 6, d.y0 + 40, 1.5, 'rgba(0,0,0,.15)', false); },
  rbinsel(c, d, t) {
    // Büsche + kleiner Baum auf der Insel im Kreisverkehr
    for (const [dx, dy, rr] of [[-40, -10, 26], [30, -30, 28], [-10, 30, 24], [40, 30, 22], [-50, 40, 18]]) { ell(c, RB.x + dx, RB.y + dy, rr, rr * 0.8); fs(c, '#52b788', 2.5); ell(c, RB.x + dx - rr * 0.3, RB.y + dy - rr * 0.3, rr * 0.4, rr * 0.25); c.fillStyle = 'rgba(255,255,255,.15)'; c.fill(); }
    line(c, RB.x, RB.y, RB.x, RB.y - 70, 6, '#6f4e37'); for (const [dx, dy, rr] of [[-26, -90, 28], [22, -96, 30], [0, -120, 30]]) { ell(c, RB.x + dx, RB.y + dy, rr, rr * 0.85); fs(c, '#40916c', 2.5); }
  },
  pflanzinsel(c, d) {
    c.fillStyle = 'rgba(0,0,0,.18)'; ell(c, d.x + 6, d.y + 2, 46, 14); c.fill();
    rrPath(c, d.x - 40, d.y - 34, 80, 34, 6); fs(c, '#8d5a3b', 3); for (let k = 0; k < 4; k++) line(c, d.x - 36 + k * 24, d.y - 32, d.x - 36 + k * 24, d.y - 2, 1.5, 'rgba(60,35,20,.4)', false);
    line(c, d.x, d.y - 34, d.x + 2, d.y - 80, 5, '#6f4e37'); for (const [dx, dy, rr] of [[-20, -88, 20], [18, -92, 22], [0, -110, 22]]) { ell(c, d.x + dx, d.y + dy, rr, rr * 0.85); fs(c, '#40916c', 2.5); }
  },
  poller(c, d) { c.fillStyle = 'rgba(0,0,0,.18)'; ell(c, d.x + 3, d.y + 1, 8, 3); c.fill(); rrPath(c, d.x - 5, d.y - 22, 10, 22, 3); fs(c, '#8d5a3b', 2); ell(c, d.x, d.y - 22, 5, 2.5); fs(c, '#a0673a', 1.5); },
  baum(c, d) {
    c.fillStyle = 'rgba(0,0,0,.18)'; ell(c, d.x + 26, d.y + 4, 70, 26); c.fill();
    c.beginPath(); c.moveTo(d.x - 9, d.y - 4); c.quadraticCurveTo(d.x - 6, d.y - 60, d.x - 4, d.y - 90); c.lineTo(d.x + 6, d.y - 90); c.quadraticCurveTo(d.x + 8, d.y - 60, d.x + 9, d.y - 4); c.closePath(); fs(c, '#6f4e37', 2.5);
    for (const [dx, dy, rr] of [[-40, -110, 40], [30, -116, 44], [-6, -150, 46], [44, -150, 32], [-46, -146, 30]]) { ell(c, d.x + dx, d.y + dy, rr, rr * 0.85); fs(c, '#2d6a4f', 3); }
    for (let k = 0; k < 14; k++) { ell(c, d.x - 50 + (k * 37) % 100, d.y - 170 + (k * 23) % 80, 7, 5, k); c.fillStyle = k % 2 ? '#52b788' : '#40916c'; c.fill(); }
  },
  lampe_p(c, d) { line(c, d.x, d.y, d.x, d.y - 170, 5, '#adb5bd'); line(c, d.x, d.y - 170, d.x + 26, d.y - 176, 4, '#adb5bd'); rrPath(c, d.x + 14, d.y - 182, 30, 10, 4); fs(c, '#6c757d', 2.5); ell(c, d.x + 29, d.y - 172, 10, 3); c.fillStyle = '#fff3bf'; c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y, 10, 4); c.fill(); },
  pylon(c, d) {
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 28, 7); c.fill();
    rrPath(c, d.x - 24, d.y - 180, 48, 180, 6); fs(c, '#343a40', 3); rrPath(c, d.x - 20, d.y - 170, 40, 120, 4); fs(c, '#fbf8f2', 2);
    c.save(); c.translate(d.x, d.y - 110); c.rotate(-Math.PI / 2); drawLogo(c, 0, 0, 100, false); c.restore();
    rrPath(c, d.x - 20, d.y - 44, 40, 30, 4); fs(c, '#95C11F', 2); txt(c, 'P', d.x, d.y - 29, 18, '#fff', 'center', null);
  },
  busch(c, d) { for (const [dx, dy, rr] of [[-14, -10, 20], [12, -12, 22], [0, -26, 20]]) { ell(c, d.x + dx, d.y + dy, rr, rr * 0.85); fs(c, '#40916c', 2.5); } },
};
function buildGridParkplatz() {
  cellsIn(55, 30, 945, 1310, i => (G0[i] = 1));
  cellsIn(740, 1300, 860, 1345, i => (G0[i] = 1));                     // Ausfahrt
  cellsCircle(RB.x, RB.y, RB.ri + 10, i => (G0[i] = 0));              // Insel
  // Pfostenreihen: zwischen benachbarten Pfosten dicht (nur die Lücke in der Mitte ist frei)
  for (let k = 1; k < PPOSTS.length; k++) { const [x1, y1] = PPOSTS[k - 1], [x2, y2] = PPOSTS[k]; if (dist(x1, y1, x2, y2) > 40) continue; for (let u = 0; u <= 1; u += 0.1) { const i = cellIdx(lerp(x1, x2, u), lerp(y1, y2, u) - 6); if (i >= 0) G0[i] = 0; } }
  for (const d of PDECOR) {
    if (d.w) cellsIn(d.x0 - 4, d.y0 - 4, d.x0 + d.w + 4, d.y0 + d.h + (d.t === 'auto' ? 0 : 6), i => (G0[i] = 0));
    else if (d.r) cellsCircle(d.x, d.y - 6, Math.max(6, d.r - 6), i => (G0[i] = 0));
  }
}
const PSPOTS = [
  furnSpot(PDECOR, 'a1', 'top', { px: 100, py: 588, sx: 110, sy: 560 }),
  furnSpot(PDECOR, 'a2', 'top', { px: 176, py: 574, sx: 180, sy: 545 }),
  furnSpot(PDECOR, 'a3', 'right', { px: 392, py: 632, sx: 395, sy: 710 }),
  furnSpot(PDECOR, 'a4', 'right', { px: 472, py: 615, sx: 495, sy: 690 }),
  furnSpot(PDECOR, 'a5', 'left', { px: 262, py: 864, sx: 236, sy: 935 }),
  furnSpot(PDECOR, 'a6', 'right', { px: 502, py: 1206, sx: 525, sy: 1270 }),
  furnSpot(PDECOR, 'a7', 'left', { px: 608, py: 476, sx: 590, sy: 545 }),
  furnSpot(PDECOR, 'anhaenger', 'right', { px: 112, py: 1100, sx: 140, sy: 1110 }),
  furnSpot(PDECOR, 'transporter', 'right', { px: 118, py: 1250, sx: 148, sy: 1260 }),
  furnSpot(PDECOR, 'insel', 'top', { px: RB.x + 60, py: RB.y + 26, sx: RB.x + 115, sy: RB.y + 60 }),
  furnSpot(PDECOR, 'pflanz', 'top', { px: 434, py: 784, sx: 420, sy: 850 }),
  furnSpot(PDECOR, 'lampe2', 'left', { px: 752, py: 880, sx: 735, sy: 920 }),
  furnSpot(PDECOR, 'busch1', 'right', { px: 88, py: 846, sx: 112, sy: 870 }),
  furnSpot(PDECOR, 'busch2', 'top', { px: 424, py: 1262, sx: 420, sy: 1240 }),
  furnSpot(PDECOR, 'busch3', 'top', { px: 884, py: 1252, sx: 850, sy: 1240 }),
  furnSpot(PDECOR, 'baum1', 'right', { px: 76, py: 470, sx: 100, sy: 520 }),
  furnSpot(PDECOR, 'pylon', 'left', { px: 860, py: 1130, sx: 835, sy: 1180 }),
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
  id: 'parkplatz', bg: '#40916c', finalExit: true, start: { x: 520, y: 50 }, gate: { x: 800, y: 1392, ix: 800, iy: 1320 },
  npcs: [
    { id: 'p_schmidt', pos: [[560, 520], [300, 790], [620, 1060]] },
    { id: 'p_julia', pos: [[230, 790], [700, 380], [450, 1150]] },
    { id: 'p_karl', pos: [[530, 740], [800, 960], [300, 1180]] },
    { id: 'p_petra', pos: [[820, 620], [660, 1250], [190, 880]] },
    { id: 'p_tim', pos: [[640, 300], [860, 1080], [440, 990]] },
  ],
  decor: PDECOR, spots: PSPOTS, grid: buildGridParkplatz, ground: drawGroundParkplatz, decorDraw: PDRAW,
  feat: { swing: false, slide: false, house: false, racer: false, pigeons: false, waiter: false, dig: false },
  junk: ['cap', 'pebble', 'zettel'], items: PARK_ITEMS, cover: drawCardboard,
  drawGate: drawBarrier, gateName: 'Die Schranke', dialogGate: 0.4, gateFace: (c, x, y, s, t) => drawBarrier(c, x + 8, y, s * 0.3, 0, true, t),
  words: { one: 'Person', the: 'die Person', a: 'eine Person', many: 'Leute', dat: 'Leuten', back: 'zur Person', each: 'Jede Person',
    hide: 'hinter Autos, Anhänger und Transporter, an der Insel im Kreisverkehr und in den Büschen', junk: 'ein Kronkorken oder ein Zettel', gate: 'an der Schranke zur Straße', gateTap: 'Lauf zur Schranke und tippe sie an!',
    opened: 'Die Schranke ist offen!',
    lock: 'Die Schranke geht erst auf, wenn du allen fünf Leuten geholfen hast.',
    progress: 'Dir fehlen noch ein paar Sachen, oben siehst du welche. Schau hinter die Autos, zur Insel im Kreisverkehr und in die Büsche!',
    gateAsk: 'Die Schranke klemmt! Bring mir diese Sachen, dann geht sie auf und es geht ab nach Hause.',
    search: 'Schau hinter Autos und in Büsche – dann tippe auf die Lupe!' },
  pools: {
    easy: ['einparken', 'pumpen', 'bus', 'stau', 'memory', 'connect', 'shadow', 'trace', 'maze_easy', 'count_easy', 'findall', 'sort', 'size_row', 'cups', 'stack', 'color', 'pop', 'dots_easy'],
    puzzle: ['stau', 'einparken', 'dials', 'lights', 'pipes', 'diff', 'nextrow', 'mirror', 'puzzle', 'rotimg', 'sequence', 'dots', 'count', 'pattern', 'oddone', 'pairs'],
    std: ['einparken', 'pumpen', 'bus', 'collect'],
    sp: ['pumpen', 'bus', 'run', 'balance_walk'],
    hard: ['heimfahrt', 'jump', 'platform'],
  },
  extras(play) {
    // ein Auto fährt im Kreisverkehr (hält an, wenn man davor steht), Pfützen kräuseln sich
    const A = { ang: 0, rr: (RB.r + RB.ri) / 2, wait: 0 };
    const pos = () => ({ x: RB.x + Math.cos(A.ang) * A.rr, y: RB.y + Math.sin(A.ang) * A.rr });
    return {
      update(dt) {
        const p = play.p, P = pos(), ahead = { x: RB.x + Math.cos(A.ang - 0.35) * A.rr, y: RB.y + Math.sin(A.ang - 0.35) * A.rr };
        if (dist(p.x, p.y, ahead.x, ahead.y) < 70 || dist(p.x, p.y, P.x, P.y) < 50) return;
        A.ang -= dt * 0.55;
      },
      draw(c, L, vis, t) {
        const P = pos(); if (vis(P.x, P.y)) L.push({ y: P.y + 40, f: () => drawCar(c, P.x, P.y, A.ang - Math.PI, '#118ab2', 1.05, { lights: true }) });
        L.push({ y: -1, f: () => { PUDDLES.forEach(([x, y, w], i) => { if (!vis(x, y)) return; const p = (t * 0.6 + i * 0.3) % 1; ell(c, x + Math.sin(i * 3) * w * 0.3, y, w * 0.2 + p * w * 0.5, (w * 0.2 + p * w * 0.5) * 0.42); c.lineWidth = 1.5; c.strokeStyle = `rgba(220,240,255,${0.6 * (1 - p)})`; c.stroke(); }); } });
      },
    };
  },
};
