'use strict';
// ---------- Halloween-Map "Geisterwald" (nur im Halloween-Special): eigener Bereich, nicht mit der Weltkarte verbunden ----------
// Unten kommt man auf dem Waldweg herein. Links oben das Hexenhaus mit Kessel, rechts oben der Nebelteich, links unten das
// Kürbisfeld mit Vogelscheuche, rechts unten der kleine Friedhof, oben in der Mitte das Kürbistor (Finale).
Object.assign(STAFF_PEOPLE, {
  h_hexe: { skin: '#b5e48c', hair: '#3c096c', long: true, jacket: '#5a189a', pants: '#240046', shoes: '#212529', skirt: '#3c096c' },
  h_vamp: { kid: true, skin: '#f1e3f3', hair: '#212529', jacket: '#212529', vest: '#c1121f', pants: '#212529', shoes: '#212529' },
  h_geist: { kid: true, skin: '#f8f9fa', hair: '#f8f9fa', jacket: '#f8f9fa', pants: '#e9ecef', shoes: '#adb5bd' },
  h_bauer: { skin: '#e0ac85', hair: '#bc6c25', beard: '#bc6c25', jacket: '#bc4749', check: true, pants: '#1d3557', shoes: '#6f4e37', hat: 'straw', hatCol: '#e9c46a' },
  h_mumie: { kid: true, skin: '#f1e3c8', hair: '#f1e3c8', jacket: '#f1e3c8', pants: '#e9dcc4', shoes: '#adb5bd' },
  h_zauber: { skin: '#e0ac85', hair: '#adb5bd', beard: '#e9ecef', jacket: '#3a0ca3', pants: '#240046', shoes: '#212529' },
  h_katze: { kid: true, skin: '#f3c9a8', hair: '#212529', long: true, jacket: '#212529', pants: '#212529', shoes: '#ef476f', skirt: '#495057' },
  h_mond: { skin: '#d9a57e', hair: '#e9ecef', bun: true, glasses: '#7b2cbf', jacket: '#3a0ca3', scarf: '#ffd60a', pants: '#3a0ca3', shoes: '#212529' },
});
Object.assign(NPC_NAMES, { h_hexe: 'Hexe Hilda', h_vamp: 'Vampir Vinz', h_geist: 'Gespenst Greta', h_bauer: 'Bauer Kurt', h_mond: 'Frau Mondschein', h_mumie: 'Mumie Mo', h_zauber: 'Zauberer Zappo', h_katze: 'Katzen-Kim' });
Object.assign(NPC_SHORT, { h_hexe: 'Hexe Hilda', h_vamp: 'Vampir Vinz', h_geist: 'Gespenst Greta', h_bauer: 'Bauer Kurt', h_mond: 'Frau Mondschein', h_mumie: 'Mumie Mo', h_zauber: 'Zauberer Zappo', h_katze: 'Katzen-Kim' });
Object.assign(NPC_LINES, {
  h_mumie: 'Mmmh! Meine Binden haben sich gelöst, und meine Sachen sind weg!',
  h_zauber: 'Simsalabim! Mein Zauberkasten ist leer – hilfst du mir suchen?',
  h_katze: 'Miau! Ich habe mich im Spukhaus verlaufen und meine Sachen verloren!',
  h_hexe: 'Hihihi! Mein Zaubertrank wird nichts, mir fehlen noch Zutaten!',
  h_vamp: 'Ich will heute Nacht Süßes sammeln, aber mein Kostüm ist nicht komplett!',
  h_geist: 'Buuuh! Ich habe beim Spuken meine Sachen verloren!',
  h_bauer: 'Auf meinem Kürbisfeld ist alles durcheinander. Hilfst du mir?',
  h_mond: 'Meine Kristallkugel sagt: Du findest meine Sachen bestimmt!',
});
Object.assign(VOICE_OF, { h_mumie: { pitch: 1.2, rate: 0.95, pick: 3 }, h_zauber: { pitch: 0.85, rate: 0.95, pick: 4 }, h_katze: { pitch: 1.35, rate: 1.1, pick: 2 }, h_hexe: { pitch: 1.3, rate: 1.1, pick: 2 }, h_vamp: { pitch: 1.25, rate: 1.05, pick: 3 }, h_geist: { pitch: 1.35, rate: 0.95, pick: 2 }, h_bauer: { pitch: 0.8, rate: 0.9, pick: 4 }, h_mond: { pitch: 1.0, rate: 0.85, pick: 1 } });

const GWW = 2900, GWH = 1500,   /* rechts (x 2000–2900): das Spukgelände mit Spukhaus und zweitem Friedhof */ GW_POND = { x: 1600, y: 330, rx: 240, ry: 140 }, GW_IN = 1000;
function drawGroundGeisterwald(g, R) {
  g.fillStyle = '#3f5a3a'; g.fillRect(0, 0, WORLD_W, WORLD_H);   // Waldboden, Moos
  for (let i = 0; i < 22000; i++) { g.fillStyle = ['#36502f', '#4a6a41', '#2f4628', '#557548'][i % 4]; g.fillRect(R() * WORLD_W, R() * WORLD_H, 2, 2); }
  for (let i = 0; i < 50; i++) { g.fillStyle = 'rgba(20,30,15,.12)'; ell(g, R() * WORLD_W, R() * WORLD_H, 60 + R() * 90, 30 + R() * 40, R() * 3); g.fill(); }
  // Waldweg von unten zum Kürbistor, mit Abzweigen
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [w, col] of [[110, '#6b5638'], [90, '#8a7350']]) { g.strokeStyle = col; g.lineWidth = w;
    g.beginPath(); g.moveTo(GW_IN, GWH + 20); g.bezierCurveTo(1150, 1150, 820, 900, 1000, 640); g.bezierCurveTo(1120, 460, 940, 260, 1000, 40); g.stroke();
    g.beginPath(); g.moveTo(980, 700); g.quadraticCurveTo(700, 560, 520, 420); g.stroke();
    g.beginPath(); g.moveTo(1040, 820); g.quadraticCurveTo(1300, 900, 1500, 960); g.stroke();
    g.beginPath(); g.moveTo(960, 1000); g.quadraticCurveTo(700, 1080, 420, 1050); g.stroke();
    g.beginPath(); g.moveTo(1500, 960); g.quadraticCurveTo(1960, 1240, 2300, 1120); g.quadraticCurveTo(2560, 1020, 2500, 640); g.quadraticCurveTo(2460, 420, 2300, 380); g.stroke(); }   // Weg ins Spukgelände
  g.restore();
  for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(60,45,25,.35)'; ell(g, 650 + R() * 700, R() * WORLD_H, 2 + R() * 2, 1.5, R() * 3); g.fill(); }
  // Kürbisfeld: Erd-Reihen mit Ranken
  for (let k = 0; k < 6; k++) { const y = 860 + k * 90; rrPath(g, 90, y, 520, 40, 18); g.fillStyle = '#4a3624'; g.fill(); g.strokeStyle = '#2d6a4f'; g.lineWidth = 3; g.beginPath(); for (let x = 100; x < 600; x += 20) g.lineTo(x, y + 20 + Math.sin(x / 15 + k) * 8); g.stroke(); }
  // Friedhof: heller Kies und niedriger Zaun mit Tor-Lücke
  rrPath(g, 1340, 790, 560, 380, 20); g.fillStyle = '#5c5a52'; g.fill(); for (let i = 0; i < 1600; i++) { g.fillStyle = i % 2 ? '#6e6b62' : '#4f4d46'; g.fillRect(1350 + R() * 540, 800 + R() * 360, 2, 2); }
  g.strokeStyle = '#2b2b2b'; g.lineWidth = 4; for (let x = 1340; x <= 1900; x += 22) { if (x > 1360 && x < 1460) continue; line(g, x, 780, x, 810, 4, '#2b2b2b', false); } line(g, 1460, 790, 1900, 790, 3, '#2b2b2b', false); line(g, 1340, 790, 1360, 790, 3, '#2b2b2b', false);
  // Spukgelände: zweiter, kleiner Friedhof und ein Kürbis-Hügel
  rrPath(g, 2520, 1140, 330, 280, 20); g.fillStyle = '#5c5a52'; g.fill(); for (let i = 0; i < 900; i++) { g.fillStyle = i % 2 ? '#6e6b62' : '#4f4d46'; g.fillRect(2530 + R() * 310, 1150 + R() * 260, 2, 2); }
  ell(g, 2150, 700, 220, 130); g.fillStyle = '#4a3624'; g.fill(); for (let i = 0; i < 14; i++) { ell(g, 2000 + (i % 5) * 70, 620 + Math.floor(i / 5) * 70, 16, 6); g.fillStyle = '#2d6a4f'; g.fill(); }
  // Nebelteich
  ell(g, GW_POND.x, GW_POND.y, GW_POND.rx + 14, GW_POND.ry + 12); g.fillStyle = '#4a4036'; g.fill();
  ell(g, GW_POND.x, GW_POND.y, GW_POND.rx, GW_POND.ry); g.fillStyle = '#2c4a5a'; g.fill();
  for (let i = 0; i < 6; i++) { ell(g, GW_POND.x - 160 + i * 60, GW_POND.y - 40 + (i % 3) * 40, 22, 8); g.fillStyle = '#2d6a4f'; g.fill(); }   // Seerosen
  // hinter dem Kürbistor: dunkler Wald
  g.fillStyle = 'rgba(10,20,12,.55)'; g.fillRect(860, 0, 280, 200);
  // Waldrand: dunkle Büsche rundum (Lücke unten für den Weg, oben für das Tor)
  for (let x = 0; x < GWW; x += 30) { if (Math.abs(x - GW_IN) > 80) { ell(g, x, GWH - 16, 26, 22); fs(g, x % 60 ? '#1b3022' : '#22402b', 2); } if (Math.abs(x - 1000) > 110) { ell(g, x, 16, 26, 22); fs(g, x % 60 ? '#1b3022' : '#22402b', 2); } }
  for (let y = 0; y < GWH; y += 30) { ell(g, 16, y, 24, 26); fs(g, y % 60 ? '#1b3022' : '#22402b', 2); ell(g, GWW - 16, y, 24, 26); fs(g, y % 60 ? '#1b3022' : '#22402b', 2); }
}
const deadTree = (id, x, y) => ({ id, t: 'totbaum', x, y, r: 24, bb: [x - 100, y - 270, 200, 280] });
const grave = (id, x, y, k) => ({ id, t: 'grab', x, y, r: 22, k, bb: [x - 32, y - 74, 64, 80] });
const bigPumpkin = (id, x, y, s = 1) => ({ id, t: 'riesenkuerbis', x, y, r: 26 * s, s, bb: [x - 44 * s, y - 70 * s, 88 * s, 78 * s] });
const GWDECOR = [
  { id: 'hexenhaus', t: 'hexenhaus', x: 380, y: 360, x0: 220, y0: 170, w: 320, h: 190, bb: [190, 0, 380, 372] },
  { id: 'kessel', t: 'kessel', x: 640, y: 380, r: 34, bb: [590, 290, 100, 100], anim: true },
  { id: 'besenstaender', t: 'besen', x: 170, y: 420, r: 12, bb: [140, 300, 60, 126] },
  deadTree('baum1', 820, 560), deadTree('baum2', 1260, 600), deadTree('baum3', 130, 640), deadTree('baum4', 1880, 640), deadTree('baum5', 760, 1250), deadTree('baum6', 1240, 1330),
  grave('grab1', 1420, 900, 0), grave('grab2', 1560, 880, 1), grave('grab3', 1700, 900, 2), grave('grab4', 1830, 880, 0), grave('grab5', 1480, 1060, 2), grave('grab6', 1640, 1080, 1), grave('grab7', 1800, 1060, 0),
  { id: 'gruft', t: 'gruft', x: 1640, y: 1150, x0: 1580, y0: 1100, w: 120, h: 50, bb: [1560, 960, 160, 196] },
  bigPumpkin('pk1', 200, 900), bigPumpkin('pk2', 440, 990, 1.2), bigPumpkin('pk3', 180, 1170, 0.9), bigPumpkin('pk4', 520, 1260), bigPumpkin('pk5', 330, 1350, 1.1),
  { id: 'vogelscheuche', t: 'vogelscheuche', x: 330, y: 1080, r: 12, bb: [270, 940, 120, 146] },
  { id: 'heu', t: 'heu', x: 640, y: 1130, x0: 590, y0: 1090, w: 110, h: 44, bb: [580, 1040, 130, 96] },
  { id: 'karren', t: 'karren', x: 1180, y: 1060, x0: 1120, y0: 1010, w: 120, h: 54, bb: [1100, 960, 160, 110] },
  { id: 'steg', t: 'steg', x: 1380, y: 420, r: 10, bb: [1340, 380, 90, 50] },
  { id: 'schild', t: 'schild', x: 1120, y: 1400, r: 8, bb: [1070, 1300, 110, 108] },
  { id: 'lat1', t: 'laterne', x: 800, y: 330, r: 8, bb: [780, 220, 40, 116] },
  { id: 'lat2', t: 'laterne', x: 1120, y: 760, r: 8, bb: [1100, 650, 40, 116] },
  { id: 'lat3', t: 'laterne', x: 880, y: 1120, r: 8, bb: [860, 1010, 40, 116] },
  { id: 'lat4', t: 'laterne', x: 1500, y: 600, r: 8, bb: [1480, 490, 40, 116] },
  { id: 'busch1', t: 'gbusch', x: 1780, y: 1290, r: 26, bb: [1730, 1240, 100, 60] },
  { id: 'busch2', t: 'gbusch', x: 620, y: 700, r: 26, bb: [570, 650, 100, 60] },
  // ---- Spukgelände (rechts) ----
  { id: 'spukhaus', t: 'hexenhaus', x: 2420, y: 360, x0: 2260, y0: 170, w: 320, h: 190, bb: [2230, 0, 380, 372] },
  deadTree('baum7', 2120, 420), deadTree('baum8', 2760, 560), deadTree('baum9', 2240, 1380), deadTree('baum10', 2050, 980),
  grave('grab9', 2580, 1210, 1), grave('grab10', 2700, 1200, 0), grave('grab11', 2800, 1230, 2), grave('grab12', 2620, 1350, 0), grave('grab13', 2760, 1370, 1),
  bigPumpkin('pk6', 2030, 650, 1.1), bigPumpkin('pk7', 2250, 760, 0.9), bigPumpkin('pk8', 2130, 830, 1.2),
  { id: 'heu2', t: 'heu', x: 2380, y: 900, x0: 2330, y0: 860, w: 110, h: 44, bb: [2320, 810, 130, 96] },
  { id: 'kessel2', t: 'kessel', x: 2680, y: 400, r: 34, bb: [2630, 310, 100, 100], anim: true },
  { id: 'lat5', t: 'laterne', x: 2200, y: 560, r: 8, bb: [2180, 450, 40, 116] },
  { id: 'lat6', t: 'laterne', x: 2560, y: 980, r: 8, bb: [2540, 870, 40, 116] },
  { id: 'lat7', t: 'laterne', x: 2000, y: 1180, r: 8, bb: [1980, 1070, 40, 116] },
  { id: 'busch3', t: 'gbusch', x: 2800, y: 820, r: 26, bb: [2750, 770, 100, 60] },
  { id: 'busch4', t: 'gbusch', x: 2440, y: 1300, r: 26, bb: [2390, 1250, 100, 60] },
];
const GWDRAW = {
  hexenhaus(c, d) {
    const x0 = d.x0, y0 = d.y0, w = d.w, h = d.h;
    c.fillStyle = 'rgba(0,0,0,.3)'; rrPath(c, x0 + 10, y0 + h - 20, w, 30, 10); c.fill();
    polyPath(c, [[x0, y0 + 40], [x0 + w, y0 + 30], [x0 + w - 6, y0 + h], [x0 + 6, y0 + h]]); fs(c, '#6f4e37', 3);
    for (let k = 1; k < 6; k++) line(c, x0 + 4, y0 + 40 + k * 26, x0 + w - 4, y0 + 34 + k * 26, 2, 'rgba(40,25,10,.35)', false);
    polyPath(c, [[x0 - 30, y0 + 50], [x0 + w / 2 + 20, y0 - 150], [x0 + w + 30, y0 + 40]]); fs(c, '#4a2c6b', 3.5);
    polyPath(c, [[x0 + w / 2 + 20, y0 - 150], [x0 + w / 2 + 70, y0 - 170], [x0 + w / 2 + 40, y0 - 120]]); fs(c, '#4a2c6b', 3);
    rrPath(c, x0 + w - 90, y0 - 70, 30, 70, 4); fs(c, '#5c4a3a', 2.5);
    rrPath(c, x0 + 30, y0 + 70, 70, 56, 6); fs(c, '#ffd166', 3); line(c, x0 + 65, y0 + 70, x0 + 65, y0 + 126, 3, '#3d2c1f', false); line(c, x0 + 30, y0 + 98, x0 + 100, y0 + 98, 3, '#3d2c1f', false);
    rrPath(c, x0 + w / 2 + 20, y0 + 80, 70, h - 80, 30); fs(c, '#3d2c1f', 3); ell(c, x0 + w / 2 + 75, y0 + 140, 5, 5); fs(c, '#ffd60a', 1.5);
    jackO(c, x0 + w / 2 - 10, y0 + h - 10, 1.4, 0); jackO(c, x0 + w + 4, y0 + h - 6, 1.1, 0);
  },
  kessel(c, d, t) {
    for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(d.x - 24 + k * 24, d.y + 4); c.quadraticCurveTo(d.x - 14 + k * 24 + Math.sin(t * 8 + k) * 6, d.y - 14, d.x - 24 + k * 24, d.y - 24); c.lineWidth = 8; c.strokeStyle = ['#ff9f1c', '#ffd60a', '#ff6b35'][k]; c.stroke(); }
    ell(c, d.x, d.y - 34, 42, 32); fs(c, '#343a40', 3); ell(c, d.x, d.y - 60, 38, 9); fs(c, '#70e000', 2.5);
    for (let k = 0; k < 4; k++) { const by = d.y - 64 - ((t * 24 + k * 9) % 34); ell(c, d.x - 24 + k * 16, by, 5, 5); c.fillStyle = 'rgba(158,240,26,.75)'; c.fill(); }
  },
  besen(c, d) { c.save(); c.translate(d.x, d.y); c.rotate(0.15); rrPath(c, -4, -110, 8, 100, 3); fs(c, '#8d5a3b', 2.5); polyPath(c, [[-8, -14], [8, -14], [18, 6], [-18, 6]]); fs(c, '#e9c46a', 2.5); c.restore(); },
  totbaum(c, d) {
    c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, d.x + 20, d.y + 4, 60, 18); c.fill();
    c.beginPath(); c.moveTo(d.x - 16, d.y); c.quadraticCurveTo(d.x - 8, d.y - 120, d.x - 4, d.y - 200); c.lineTo(d.x + 8, d.y - 200); c.quadraticCurveTo(d.x + 10, d.y - 120, d.x + 16, d.y); c.closePath(); fs(c, '#3b2a20', 3);
    c.strokeStyle = '#3b2a20'; c.lineCap = 'round';
    for (const [y, s, len] of [[-120, -1, 70], [-150, 1, 80], [-180, -1, 60], [-200, 1, 50], [-90, 1, 50]]) { c.lineWidth = 8; c.beginPath(); c.moveTo(d.x, d.y + y); c.quadraticCurveTo(d.x + s * len * 0.6, d.y + y - 20, d.x + s * len, d.y + y - 50); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(d.x + s * len * 0.8, d.y + y - 36); c.lineTo(d.x + s * len * 1.1, d.y + y - 40); c.stroke(); }
    ell(c, d.x - 2, d.y - 110, 9, 11); c.fillStyle = '#1a1225'; c.fill();   // Astloch
  },
  grab(c, d) {
    c.fillStyle = 'rgba(0,0,0,.3)'; ell(c, d.x + 4, d.y + 2, 30, 8); c.fill();
    if (d.k === 1) { rrPath(c, d.x - 6, d.y - 70, 12, 70, 3); fs(c, '#9a96a8', 3); rrPath(c, d.x - 24, d.y - 56, 48, 12, 3); fs(c, '#9a96a8', 3); }
    else { c.beginPath(); c.moveTo(d.x - 24, d.y); c.lineTo(d.x - 24, d.y - 40); c.quadraticCurveTo(d.x - 24, d.y - 66, d.x, d.y - 66); c.quadraticCurveTo(d.x + 24, d.y - 66, d.x + 24, d.y - 40); c.lineTo(d.x + 24, d.y); c.closePath(); fs(c, d.k === 2 ? '#8e8a9b' : '#a5a1b3', 3);
      c.font = `bold 14px ${FONT}`; c.textAlign = 'center'; c.fillStyle = '#5c586b'; c.fillText(d.k === 2 ? 'R.I.P.' : 'BUH', d.x, d.y - 34); }
    ell(c, d.x - 14, d.y - 4, 8, 4); c.fillStyle = '#40916c'; c.fill();
  },
  gruft(c, d) { polyPath(c, [[d.x0 - 10, d.y0 - 60], [d.x0 + d.w / 2, d.y0 - 120], [d.x0 + d.w + 10, d.y0 - 60]]); fs(c, '#6c6878', 3); rrPath(c, d.x0, d.y0 - 60, d.w, d.h + 60, 4); fs(c, '#8e8a9b', 3); rrPath(c, d.x0 + d.w / 2 - 22, d.y0 - 30, 44, d.h + 30, 20); fs(c, '#2b2b2b', 2.5); },
  riesenkuerbis(c, d) { c.fillStyle = 'rgba(0,0,0,.3)'; ell(c, d.x, d.y + 2, 40 * d.s, 10 * d.s); c.fill(); c.save(); c.translate(d.x, d.y - 30 * d.s); c.scale(d.s, d.s); for (const [dx, rw] of [[-22, 22], [22, 22], [-10, 22], [10, 22], [0, 26]]) { ell(c, dx, 0, rw, 30); fs(c, '#f77f00', 3); } rrPath(c, -5, -40, 10, 14, 3); fs(c, '#6b4423', 2.5); ell(c, 14, -34, 12, 5, -0.4); fs(c, '#2b9348', 2); c.restore(); },
  vogelscheuche(c, d) {
    line(c, d.x, d.y, d.x, d.y - 120, 6, '#8d5a3b'); line(c, d.x - 50, d.y - 90, d.x + 50, d.y - 90, 5, '#8d5a3b');
    polyPath(c, [[d.x - 30, d.y - 96], [d.x + 30, d.y - 96], [d.x + 24, d.y - 40], [d.x - 24, d.y - 40]]); fs(c, '#bc4749', 3); line(c, d.x - 24, d.y - 70, d.x + 24, d.y - 70, 2, '#6a040f', false);
    for (const s of [-1, 1]) { polyPath(c, [[d.x + s * 50, d.y - 92], [d.x + s * 60, d.y - 84], [d.x + s * 56, d.y - 96]]); fs(c, '#e9c46a', 2); }
    jackO(c, d.x, d.y - 116, 1.3, 0); polyPath(c, [[d.x - 22, d.y - 128], [d.x + 22, d.y - 128], [d.x + 6, d.y - 150], [d.x - 6, d.y - 150]]); fs(c, '#6f4e37', 2.5); rrPath(c, d.x - 30, d.y - 132, 60, 8, 4); fs(c, '#6f4e37', 2.5);
  },
  heu(c, d) { rrPath(c, d.x0, d.y0 - 30, d.w, d.h + 30, 8); fs(c, '#e9c46a', 3); for (let x = d.x0 + 10; x < d.x0 + d.w; x += 14) line(c, x, d.y0 - 24, x + 4, d.y0 + d.h - 4, 1.5, '#b08d3a', false); line(c, d.x0, d.y0 - 4, d.x0 + d.w, d.y0 - 4, 3, '#8d5a3b', false); },
  karren(c, d) {
    rrPath(c, d.x0, d.y0 - 30, d.w, 44, 6); fs(c, '#8d5a3b', 3); for (const [dx, s] of [[25, 0.9], [60, 1], [92, 0.85]]) jackO(c, d.x0 + dx, d.y0 - 40, s * 1.4, 0);
    for (const dx of [18, d.w - 18]) { ell(c, d.x0 + dx, d.y0 + 20, 18, 18); fs(c, '#6f4e37', 3); ell(c, d.x0 + dx, d.y0 + 20, 4, 4); c.fillStyle = '#3d2c1f'; c.fill(); }
    line(c, d.x0 + d.w, d.y0 - 10, d.x0 + d.w + 30, d.y0 + 10, 4, '#6f4e37', false);
  },
  steg(c, d) { rrPath(c, d.x - 40, d.y - 30, 80, 34, 3); fs(c, '#8d5a3b', 2.5); for (let k = 1; k < 5; k++) line(c, d.x - 40 + k * 16, d.y - 30, d.x - 40 + k * 16, d.y + 4, 1.5, '#5c3d24', false); },
  schild(c, d) { line(c, d.x, d.y, d.x, d.y - 90, 5, '#6f4e37'); rrPath(c, d.x - 54, d.y - 98, 108, 34, 6); fs(c, '#8d5a3b', 3); txt(c, 'Geisterwald', d.x, d.y - 81, 14, '#fff3bf', 'center', null); },
  laterne(c, d) { line(c, d.x, d.y, d.x, d.y - 90, 5, '#343a40'); line(c, d.x, d.y - 90, d.x + 16, d.y - 96, 3, '#343a40'); jackO(c, d.x + 16, d.y - 82, 1.1, 0); },
  gbusch(c, d) { for (const [dx, dy, rr] of [[-16, -10, 22], [14, -12, 24], [0, -28, 22]]) { ell(c, d.x + dx, d.y + dy, rr, rr * 0.85); fs(c, '#22402b', 2.5); } ell(c, d.x + 6, d.y - 22, 3, 3); c.fillStyle = '#ffd60a'; c.fill(); ell(c, d.x - 4, d.y - 20, 3, 3); c.fill(); },
};
function buildGridGeisterwald() {
  cellsIn(50, 50, GWW - 50, GWH - 40, i => (G0[i] = 1));
  cellsIn(GW_IN - 60, GWH - 60, GW_IN + 60, GWH, i => (G0[i] = 1));   // Waldweg rein
  cellsIn(930, 0, 1070, 60, i => (G0[i] = 1));                        // zum Tor
  for (let y = GW_POND.y - GW_POND.ry - 10; y <= GW_POND.y + GW_POND.ry + 10; y += 10) for (let x = GW_POND.x - GW_POND.rx - 10; x <= GW_POND.x + GW_POND.rx + 10; x += 10) {
    const k = ((x - GW_POND.x) / (GW_POND.rx + 8)) ** 2 + ((y - GW_POND.y) / (GW_POND.ry + 8)) ** 2; if (k <= 1) { const i = cellIdx(x, y); if (i >= 0) G0[i] = 0; } }
  for (const d of GWDECOR) {
    if (d.w) cellsIn(d.x0 - 4, d.y0 - 4, d.x0 + d.w + 4, d.y0 + d.h + 6, i => (G0[i] = 0));
    else if (d.r) cellsCircle(d.x, d.y - 6, Math.max(6, d.r - 6), i => (G0[i] = 0));
  }
}
const GWSPOTS = [
  furnSpot(GWDECOR, 'hexenhaus', 'left', { px: 222, py: 330, sx: 195, sy: 380 }),
  furnSpot(GWDECOR, 'hexenhaus', 'right', { px: 540, py: 330, sx: 565, sy: 380, tag: 'r' }),
  furnSpot(GWDECOR, 'kessel', 'right'),
  furnSpot(GWDECOR, 'besenstaender', 'right'),
  furnSpot(GWDECOR, 'baum1', 'left'), furnSpot(GWDECOR, 'baum2', 'right'), furnSpot(GWDECOR, 'baum3', 'right'), furnSpot(GWDECOR, 'baum4', 'left'), furnSpot(GWDECOR, 'baum5', 'right'), furnSpot(GWDECOR, 'baum6', 'left'),
  furnSpot(GWDECOR, 'grab1', 'left'), furnSpot(GWDECOR, 'grab3', 'right'), furnSpot(GWDECOR, 'grab5', 'left'), furnSpot(GWDECOR, 'grab7', 'right'),
  furnSpot(GWDECOR, 'gruft', 'left'),
  furnSpot(GWDECOR, 'pk2', 'right'), furnSpot(GWDECOR, 'pk3', 'left'), furnSpot(GWDECOR, 'pk4', 'right'),
  furnSpot(GWDECOR, 'vogelscheuche', 'right'),
  furnSpot(GWDECOR, 'heu', 'top'),
  furnSpot(GWDECOR, 'karren', 'right'),
  furnSpot(GWDECOR, 'busch1', 'top'), furnSpot(GWDECOR, 'busch2', 'top'),
  furnSpot(GWDECOR, 'spukhaus', 'left', { px: 2262, py: 330, sx: 2235, sy: 380, tag: 's' }), furnSpot(GWDECOR, 'spukhaus', 'right', { px: 2580, py: 330, sx: 2605, sy: 380, tag: 's' }),
  furnSpot(GWDECOR, 'baum7', 'right'), furnSpot(GWDECOR, 'baum8', 'left'), furnSpot(GWDECOR, 'baum9', 'right'), furnSpot(GWDECOR, 'baum10', 'left'),
  furnSpot(GWDECOR, 'grab9', 'left'), furnSpot(GWDECOR, 'grab11', 'right'), furnSpot(GWDECOR, 'grab13', 'left'),
  furnSpot(GWDECOR, 'pk6', 'left'), furnSpot(GWDECOR, 'pk8', 'right'),
  furnSpot(GWDECOR, 'heu2', 'top'), furnSpot(GWDECOR, 'kessel2', 'left'), furnSpot(GWDECOR, 'busch3', 'top'), furnSpot(GWDECOR, 'busch4', 'top'),
];
// Kürbistor (Finale): Bogen aus Ästen mit Kürbissen, geht auf, wenn allen geholfen wurde
function drawPumpkinGate(c, x, y, s, open, locked, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const sx of [-1, 1]) { rrPath(c, sx * 90 - 10, -150, 20, 150, 6); fs(c, '#3b2a20', 3); }
  c.beginPath(); c.moveTo(-100, -140); c.quadraticCurveTo(0, -230, 100, -140); c.lineWidth = 16; c.strokeStyle = '#3b2a20'; c.stroke();
  for (let k = 0; k < 5; k++) { const a = Math.PI + (k + 0.5) * Math.PI / 5; jackO(c, Math.cos(a) * 100, -150 + Math.sin(a) * 60, 1.6, locked ? 0.4 : 1); }
  const o = clamp(open, 0, 1);
  for (const sx of [-1, 1]) { c.save(); c.translate(sx * 80, 0); c.scale(1 - o * 0.85, 1); rrPath(c, sx > 0 ? -80 : 0, -130, 80, 130, 4); fs(c, '#5c3d24', 3); for (let k = 1; k < 4; k++) line(c, (sx > 0 ? -80 : 0) + k * 20, -128, (sx > 0 ? -80 : 0) + k * 20, -2, 2, '#3d2c1f', false); c.restore(); }
  if (locked) { const b = Math.sin(t * 3) * 2; ell(c, 0, -190 + b, 16, 16); fs(c, '#fff', 2.5); icon(c, 'lock', 0, -190 + b, 20); }
  c.restore();
}
STAGE_DEFS.geisterwald = {
  id: 'geisterwald', w: GWW, h: GWH, bg: '#1b3022', solo: true, finalExit: true, start: { x: GW_IN, y: GWH - 70 }, gate: { x: 1000, y: 230, ix: 1000, iy: 290, side: 'top' },
  npcs: [
    { id: 'h_hexe', pos: [[700, 470], [420, 520], [820, 440]] },
    { id: 'h_vamp', pos: [[1300, 740], [1700, 1300], [1100, 900]] },
    { id: 'h_geist', pos: [[1560, 980], [1360, 1200], [1820, 1240]] },
    { id: 'h_bauer', pos: [[260, 1290], [620, 1010], [120, 1020]] },
    { id: 'h_mond', pos: [[1420, 560], [1160, 420], [1780, 560]] },
    { id: 'h_mumie', pos: [[2400, 520], [2160, 1000], [2700, 700]] },
    { id: 'h_zauber', pos: [[2680, 1060], [2300, 1240], [2050, 520]] },
    { id: 'h_katze', pos: [[1880, 1100], [2500, 820], [1300, 1300]] },
  ],
  decor: GWDECOR, spots: GWSPOTS, grid: buildGridGeisterwald, ground: drawGroundGeisterwald, decorDraw: GWDRAW,
  feat: { swing: false, slide: false, house: false, racer: false, pigeons: false, waiter: false, dig: false },
  junk: ['leaf', 'twig', 'pebble'], items: HW_ITEM_IDS, cover: typeof drawLeafPile === 'function' ? drawLeafPile : undefined,
  drawGate: drawPumpkinGate, gateName: 'Das Kürbistor', dialogGate: 0.35, gateFace: (c, x, y, s, t) => drawPumpkinGate(c, x, y + 20, s * 0.25, 0, true, t),
  words: { one: 'Person', the: 'die Person', a: 'eine Person', many: 'Leute', dat: 'Leuten', back: 'zur Person', each: 'Jede Person',
    hide: 'hinter Grabsteinen, Riesenkürbissen und kahlen Bäumen, am Hexenhaus und im Heu', junk: 'ein Blatt oder ein Stöckchen', gate: 'am Kürbistor', gateTap: 'Lauf zum Kürbistor und tippe es an!',
    opened: 'Das Kürbistor ist offen!',
    lock: 'Das Kürbistor geht erst auf, wenn du allen im Geisterwald geholfen hast.',
    progress: 'Dir fehlen noch ein paar Sachen, oben siehst du welche. Schau hinter Grabsteine, Riesenkürbisse und kahle Bäume!',
    gateAsk: 'Das Kürbistor ist verhext! Bring mir diese Sachen, dann löse ich den Zauber.',
    search: 'Schau hinter Grabsteine und Kürbisse – dann tippe auf die Lupe!' },
  pools: {   // eigene Halloween-Spiele + viele allgemeine Spiele im Halloween-Look (Motive/Hintergründe aus hw_theme.js)
    easy: ['hw_schnitzen', 'hw_trank', 'hw_suesses', 'hw_netz', 'hw_klingeln', 'hw_zaehlen', 'memory', 'connect', 'pop', 'shadow', 'sort', 'findall', 'count_easy', 'cups', 'maze_easy', 'dots_easy', 'size_row', 'stack'],
    puzzle: ['hw_schnitzen', 'hw_trank', 'hw_klingeln', 'hw_zaehlen', 'hw_suesses', 'hw_netz', 'pairs', 'diff', 'maze', 'pipes', 'lights', 'sequence', 'oddone', 'pattern', 'nextrow', 'count', 'dials', 'mirror'],
    std: ['hw_geister', 'hw_flug', 'hw_besen', 'run', 'jump', 'collect', 'balance_walk'],
    sp: ['hw_geister', 'hw_besen', 'hw_flug', 'run', 'collect'],
    hard: ['hw_flug', 'hw_geister', 'hw_besen', 'platform'],
  },

  extras(play) {   // Nebel über dem Teich, Glühwürmchen
    const flies = []; for (let i = 0; i < 26; i++) flies.push({ x: Math.random() * GWW, y: Math.random() * GWH, p: Math.random() * 6 });
    return {
      update(dt) { for (const f of flies) { f.p += dt; f.x += Math.sin(f.p * 0.7) * 12 * dt; f.y += Math.cos(f.p * 0.9) * 10 * dt; } },
      draw(c, L, vis, t) {
        L.push({ y: GW_POND.y + GW_POND.ry, f: () => { for (let k = 0; k < 5; k++) { const x = GW_POND.x - 180 + ((t * 14 + k * 90) % 360); c.fillStyle = 'rgba(230,230,255,.18)'; ell(c, x, GW_POND.y - 30 + (k % 3) * 30, 70, 18); c.fill(); } } });
        L.push({ y: 99999, f: () => { for (const f of flies) { if (!vis(f.x, f.y)) continue; const a = 0.4 + 0.6 * Math.abs(Math.sin(f.p * 2)); ell(c, f.x, f.y, 3, 3); c.fillStyle = `rgba(255,240,120,${a})`; c.fill(); } } });
      },
    };
  },
};
if (typeof STAGE_NAME !== 'undefined') STAGE_NAME.geisterwald = 'Geisterwald';
if (typeof STAGE_COL !== 'undefined') STAGE_COL.geisterwald = '#7b2cbf';
