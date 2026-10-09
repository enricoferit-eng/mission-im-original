'use strict';
// ---------- Stage "Chalet": Hüttenzauber im Winter (nach Website-Fotos: Holzhütte mit Wagenrad, Geweih, Herzen, roten Bändern,
// Fensterläden, Kreidetafel, Holzdeck; innen lange Holztafel, Lichterketten, Kerzen, Fondue) ----------
// Oben: die Hütte von innen (Dach weggedacht): Holzdielen, Blockwände, Kamin, lange Tische mit Fellen und Fondue-Töpfen, Christbaum.
// Unten: verschneiter Garten mit Tannen, Schneemann, Holzstapel + Hackklotz, zugefrorenem Teich, Laternen, Schlitten, Holztor.

Object.assign(STAFF_PEOPLE, {
  c_gerda: { skin: '#f6d2b8', hair: '#e9ecef', bun: true, glasses: '#6c584c', jacket: '#9d0208', knit: '#f8f9fa', scarf: '#e9c46a', skirt: '#343a40', shoes: '#6f4e37' },
  c_felix: { kid: true, skin: '#f1c7a5', hair: '#7a4a2a', jacket: '#1c7ed6', scarf: '#e63946', pants: '#343a40', shoes: '#212529', gloves: '#e63946', hat: 'beanie', hatCol: '#e63946', hatBand: '#fff', bobble: '#fff' },
  c_berger: { skin: '#e0ac85', hair: '#b5651d', pony: true, jacket: '#2a9d8f', knit: '#e9f5db', pants: '#495057', shoes: '#6f4e37', hat: 'beanie', hatCol: '#f8f9fa', hatBand: '#2a9d8f', bobble: '#2a9d8f' },
  c_toni: { skin: '#d9a57e', hair: '#2b1d14', beard: '#2b1d14', sun: true, jacket: '#e63946', pants: '#212529', shoes: '#495057', gloves: '#212529', hat: 'beanie', hatCol: '#212529', hatBand: '#e63946' },
  c_anna: { skin: '#f1c7a5', hair: '#e9c46a', long: true, jacket: '#c77dff', scarf: '#f8f9fa', pants: '#343a40', shoes: '#f8f9fa', gloves: '#f8f9fa' },
  c_sepp: { skin: '#e0ac85', hair: '#6c584c', beard: '#adb5bd', jacket: '#c1121f', check: 'rgba(255,255,255,.35)', apron: '#6f4e37', pants: '#3a5a40', shoes: '#3d2c1f' },
});
Object.assign(NPC_NAMES, { c_gerda: 'Oma Gerda', c_felix: 'Felix', c_berger: 'Frau Berger', c_toni: 'Toni', c_anna: 'Anna' });
Object.assign(NPC_SHORT, { c_gerda: 'Oma Gerda', c_felix: 'Felix', c_berger: 'Frau Berger', c_toni: 'Toni', c_anna: 'Anna' });
Object.assign(NPC_LINES, {
  c_gerda: 'In der warmen Hütte habe ich meine Sachen verlegt!',
  c_felix: 'Ich war Schlitten fahren, und jetzt sind meine Sachen im Schnee verschwunden!',
  c_berger: 'Gleich gibt es Fondue, aber mir fehlt noch etwas!',
  c_toni: 'Nach dem Skifahren finde ich meine Sachen nicht mehr!',
  c_anna: 'Ich wollte einen Schneemann bauen, aber meine Sachen sind weg!',
});
Object.assign(VOICE_OF, { c_gerda: { pitch: 1.0, rate: 0.88, pick: 1 }, c_felix: { pitch: 1.45, rate: 1.1, pick: 6 }, c_berger: { pitch: 1.15, rate: 1.0, pick: 2 }, c_toni: { pitch: 0.85, rate: 1.05, pick: 4 }, c_anna: { pitch: 1.25, rate: 1.05, pick: 3 } });

Object.assign(ITEMS, {
  handschuhe: { n: 'Handschuhe', d(c, f) { for (const sd of [-1, 1]) { c.save(); c.translate(sd * 9, 0); c.rotate(sd * 0.2); rrPath(c, -8, -12, 16, 22, 7); fs(c, f('#e63946')); ell(c, sd * -9, -2, 4, 7, sd * 0.4); fs(c, f('#e63946'), 2.5); rrPath(c, -8, 8, 16, 7, 2); fs(c, f('#fff'), 2); c.restore(); } } },
  muetze: { n: 'Pudelmütze', d(c, f) { c.beginPath(); c.moveTo(-17, 8); c.quadraticCurveTo(-17, -16, 0, -16); c.quadraticCurveTo(17, -16, 17, 8); c.closePath(); fs(c, f('#1c7ed6')); rrPath(c, -18, 4, 36, 10, 5); fs(c, f('#fff')); ell(c, 0, -19, 7, 7); fs(c, f('#fff')); if (!f.sil) for (let k = -1; k <= 1; k++) line(c, k * 8, -10, k * 8, 2, 2, 'rgba(255,255,255,.4)', false); } },
  schal: { n: 'Schal', d(c, f) { c.rotate(-0.3); rrPath(c, -22, -7, 44, 14, 6); fs(c, f('#e63946')); rrPath(c, 6, -2, 12, 28, 5); fs(c, f('#e63946')); if (!f.sil) { for (let k = 0; k < 4; k++) line(c, -16 + k * 10, -6, -16 + k * 10, 6, 3, '#fff', false); line(c, 8, 18, 16, 18, 3, '#fff', false); } } },
  fonduegabel: { n: 'Fondue-Gabel', d(c, f) { c.rotate(0.6); rrPath(c, -3, -2, 6, 30, 2); fs(c, f('#ced4da')); rrPath(c, -4, 14, 8, 14, 3); fs(c, f('#e63946')); line(c, -2, -2, -3, -22, 2, f('#ced4da')); line(c, 2, -2, 3, -22, 2, f('#ced4da')); rrPath(c, -8, -32, 16, 13, 4); fs(c, f('#e9c46a'), 2); } },
  laterne: { n: 'Laterne', d(c, f) { rrPath(c, -12, -14, 24, 30, 4); fs(c, f('#343a40')); rrPath(c, -8, -10, 16, 22, 2); c.fillStyle = f.sil ? f('#000') : 'rgba(255,214,110,.95)'; c.fill(); polyPath(c, [[-14, -14], [14, -14], [0, -24]]); fs(c, f('#343a40'), 2); c.beginPath(); c.arc(0, -26, 5, Math.PI, 0); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke(); } },
  tannenzapfen: { n: 'Tannenzapfen', d(c, f) { ell(c, 0, 0, 11, 18); fs(c, f('#8d5a3b')); if (!f.sil) for (let k = 0; k < 4; k++) for (let m = -1; m <= 1; m++) { ell(c, m * 6, -12 + k * 7, 4, 3); fs(c, '#a0673a', 1.2); } line(c, 0, -18, 0, -24, 2.5, f('#6f4e37'), false); } },
  holzscheit: { n: 'Holzscheit', d(c, f) { c.rotate(-0.25); rrPath(c, -20, -9, 40, 18, 5); fs(c, f('#a0673a')); ell(c, 20, 0, 6, 9); fs(c, f('#e9c46a'), 2); if (!f.sil) { line(c, -14, -3, 10, -4, 1.5, 'rgba(60,35,20,.5)', false); line(c, -10, 4, 12, 3, 1.5, 'rgba(60,35,20,.5)', false); } } },
  schlittschuh: { n: 'Schlittschuh', d(c, f) { rrPath(c, -14, -18, 18, 26, 6); fs(c, f('#fff')); rrPath(c, -14, 0, 30, 10, 5); fs(c, f('#fff')); line(c, -16, 16, 18, 16, 3, f('#adb5bd')); line(c, -10, 10, -10, 16, 2, f('#adb5bd'), false); line(c, 10, 10, 10, 16, 2, f('#adb5bd'), false); if (!f.sil) for (let k = 0; k < 3; k++) line(c, -10, -14 + k * 5, 0, -14 + k * 5, 1.5, '#e63946', false); } },
  kakao: { n: 'Tasse Kakao', d(c, f) { rrPath(c, -14, -10, 26, 26, 6); fs(c, f('#e63946')); c.beginPath(); c.arc(13, 3, 6, -1.2, 1.2); c.lineWidth = 6; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3; c.strokeStyle = f('#e63946'); c.stroke(); ell(c, -1, -10, 13, 4); fs(c, f('#6f4e37'), 2); if (!f.sil) { ell(c, -4, -12, 5, 3); c.fillStyle = '#fff'; c.fill(); heartPath(c, -1, 4, 4); c.fillStyle = '#fff'; c.fill(); } } },
  lebkuchen: { n: 'Lebkuchenherz', d(c, f) { heartPath(c, 0, 0, 18); fs(c, f('#b5651d')); if (!f.sil) { heartPath(c, 0, 0, 14); c.lineWidth = 2; c.strokeStyle = '#fff'; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]); ell(c, -4, -2, 3, 3); c.fillStyle = '#e63946'; c.fill(); ell(c, 5, 0, 3, 3); c.fillStyle = '#52b788'; c.fill(); } c.beginPath(); c.moveTo(-6, -14); c.quadraticCurveTo(0, -24, 6, -14); c.lineWidth = 2; c.strokeStyle = f('#e63946'); c.stroke(); } },
  schneekugel: { n: 'Schneekugel', d(c, f) { rrPath(c, -14, 8, 28, 10, 3); fs(c, f('#8d5a3b')); ell(c, 0, -4, 16, 15); fs(c, f('rgba(210,235,250,.9)')); if (!f.sil) { polyPath(c, [[-6, 6], [0, -10], [6, 6]]); c.fillStyle = '#2d6a4f'; c.fill(); for (let k = 0; k < 6; k++) { ell(c, -9 + (k * 7) % 18, -12 + (k * 5) % 14, 1.5, 1.5); c.fillStyle = '#fff'; c.fill(); } ell(c, -6, -10, 4, 2.5); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); } } },
  kuhglocke: { n: 'Kuhglocke', d(c, f) { rrPath(c, -16, -20, 32, 6, 3); fs(c, f('#e63946'), 2); c.beginPath(); c.moveTo(-10, -14); c.lineTo(10, -14); c.lineTo(15, 14); c.lineTo(-15, 14); c.closePath(); fs(c, f('#e9c46a')); ell(c, 0, 16, 4, 4); fs(c, f('#6f4e37'), 2); if (!f.sil) line(c, -5, -8, -8, 10, 2, 'rgba(255,255,255,.5)', false); } },
});
const CHALET_ITEMS = ['handschuhe', 'muetze', 'schal', 'fonduegabel', 'laterne', 'tannenzapfen', 'holzscheit', 'schlittschuh', 'kakao', 'lebkuchen', 'schneekugel', 'kuhglocke'];

// Hütte: Innenraum x 110–890, y 150–640; Blockwände ringsum, Tür unten in der Mitte
const HUT = { x0: 110, x1: 890, y0: 150, y1: 640, door0: 455, door1: 545 };
function snowGround(g, x, y, w, h, R) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = '#f1f5f9'; g.fillRect(x, y, w, h);
  for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(165,200,228,.16)'; ell(g, x + R() * w, y + R() * h, 60 + R() * 90, 18 + R() * 26); g.fill(); }
  for (let i = 0; i < w * h / 300; i++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.9)' : 'rgba(190,215,235,.5)'; g.fillRect(x + R() * w, y + R() * h, 2, 2); }
  g.restore();
}
function logWall(g, x, y, w, h, horiz = true) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  if (horiz) for (let yy = y, k = 0; yy < y + h; yy += 16, k++) { rrPath(g, x - 6, yy, w + 12, 15, 7); fs(g, k % 2 ? '#8d5a3b' : '#9c6644', 1.5); for (let xx = x + (k * 37) % 70; xx < x + w; xx += 70) { ell(g, xx, yy + 7, 2.5, 2); g.fillStyle = 'rgba(60,30,15,.4)'; g.fill(); } }
  else for (let xx = x, k = 0; xx < x + w; xx += 16, k++) { rrPath(g, xx, y - 6, 15, h + 12, 7); fs(g, k % 2 ? '#8d5a3b' : '#9c6644', 1.5); }
  g.restore();
}
function drawGroundChalet(g, R) {
  snowGround(g, 0, 0, WORLD_W, WORLD_H, R);
  // Wald hinten (oben)
  for (let x = -20; x < WORLD_W + 40; x += 46) { const h = 90 + (x * 7) % 40; polyPath(g, [[x - 28, 120], [x, 120 - h], [x + 28, 120]]); fs(g, '#2d6a4f', 2.5); polyPath(g, [[x - 16, 120 - h * 0.55], [x, 120 - h], [x + 16, 120 - h * 0.55]]); g.fillStyle = '#fff'; g.fill(); }
  // Hütte: Holzdielen innen
  planks(g, HUT.x0, HUT.y0, HUT.x1 - HUT.x0, HUT.y1 - HUT.y0, ['#b07d4b', '#a0673a', '#bb8a57'], 28);
  g.fillStyle = 'rgba(255,190,90,.08)'; g.fillRect(HUT.x0, HUT.y0, HUT.x1 - HUT.x0, HUT.y1 - HUT.y0);
  // Teppich vor dem Kamin
  rrPath(g, 400, 230, 200, 90, 20); fs(g, '#9d0208', 3); rrPath(g, 412, 240, 176, 70, 14); fs(g, null, 2, 'rgba(255,255,255,.5)'); for (let k = 0; k < 5; k++) { ell(g, 440 + k * 30, 275, 6, 6); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); }
  // Rückwand innen (Blockbohlen) mit Fenstern, Kamin, Geweih
  logWall(g, HUT.x0 - 30, 40, HUT.x1 - HUT.x0 + 60, 112);
  for (const wx of [200, 720]) {
    rrPath(g, wx - 52, 56, 104, 76, 4); fs(g, '#5c3d2e', 3); rrPath(g, wx - 46, 62, 92, 64, 2); g.fillStyle = '#1d3557'; g.fill();
    for (let k = 0; k < 4; k++) { polyPath(g, [[wx - 40 + k * 24, 126], [wx - 30 + k * 24, 82 + (k % 2) * 8], [wx - 20 + k * 24, 126]]); g.fillStyle = '#2d6a4f'; g.fill(); }
    g.fillStyle = '#e7f5ff'; g.fillRect(wx - 46, 118, 92, 8); line(g, wx, 62, wx, 126, 4, '#5c3d2e', false); line(g, wx - 46, 94, wx + 46, 94, 4, '#5c3d2e', false);
    rrPath(g, wx - 64, 56, 12, 76, 2); fs(g, '#6f4e37', 2); rrPath(g, wx + 52, 56, 12, 76, 2); fs(g, '#6f4e37', 2);
    for (let k = 0; k < 5; k++) { ell(g, wx - 40 + k * 20, 58 + Math.sin(k) * 2, 3, 4); g.fillStyle = '#ffe066'; g.fill(); }
  }
  // Kamin aus Naturstein (Mitte)
  rrPath(g, 430, 20, 140, 136, 8); fs(g, '#adb5bd', 3);
  for (let k = 0; k < 14; k++) { rrPath(g, 436 + (k % 4) * 33 + (Math.floor(k / 4) % 2) * 12, 26 + Math.floor(k / 4) * 32, 30, 28, 8); fs(g, ['#ced4da', '#adb5bd', '#dee2e6'][k % 3], 1.5); }
  rrPath(g, 456, 82, 88, 74, 30); fs(g, '#212529', 3); rrPath(g, 420, 72, 160, 12, 4); fs(g, '#6f4e37', 2.5);
  // Geweih über dem Kamin + Herzen
  for (const sd of [-1, 1]) { line(g, 500, 10, 500 + sd * 30, -2, 4, '#e9d8a6'); line(g, 500 + sd * 18, 4, 500 + sd * 26, 16, 3, '#e9d8a6'); line(g, 500 + sd * 30, -2, 500 + sd * 44, 6, 3, '#e9d8a6'); }
  for (const hx of [330, 640, 800]) { heartPath(g, hx, 70, 9); fs(g, '#c1121f', 2); line(g, hx, 50, hx, 62, 1.5, '#c1121f', false); }
  // Seitenwände (Blockbohlen, senkrecht gesehen)
  logWall(g, HUT.x0 - 30, HUT.y0, 30, HUT.y1 - HUT.y0 + 30, false); logWall(g, HUT.x1, HUT.y0, 30, HUT.y1 - HUT.y0 + 30, false);
  // Vorderwand mit Tür (Holzdeck davor)
  logWall(g, HUT.x0 - 30, HUT.y1, HUT.door0 - HUT.x0 + 30, 26); logWall(g, HUT.door1, HUT.y1, HUT.x1 - HUT.door1 + 30, 26);
  rrPath(g, 300, 666, 400, 40, 4); fs(g, '#c08b55', 2.5); for (let x = 310; x < 700; x += 26) line(g, x, 668, x, 704, 1.5, 'rgba(90,60,30,.35)', false);
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(HUT.x0 - 30, HUT.y1 + 26, HUT.x1 - HUT.x0 + 60, 5);
  g.fillStyle = '#b07d4b'; g.fillRect(HUT.door0, HUT.y1, HUT.door1 - HUT.door0, 30);
  // getretener Weg im Schnee zum Tor + zum Teich
  g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(190,205,220,.6)'; g.lineWidth = 70; g.beginPath(); g.moveTo(500, 700); g.quadraticCurveTo(470, 1000, 500, 1360); g.stroke(); g.lineWidth = 40; g.beginPath(); g.moveTo(500, 900); g.quadraticCurveTo(650, 960, 720, 1060); g.stroke(); g.restore();
  for (let k = 0; k < 24; k++) { const y = 720 + k * 26, x = 488 + Math.sin(k * 0.6) * 14 + (k % 2) * 16; ell(g, x, y, 5, 7); g.fillStyle = 'rgba(120,140,160,.3)'; g.fill(); }
  // zugefrorener Teich
  ell(g, 760, 1120, 150, 80); fs(g, '#a5d8ff', 3); ell(g, 760, 1120, 136, 68); g.fillStyle = '#d0ebff'; g.fill();
  for (let k = 0; k < 8; k++) { g.beginPath(); g.arc(760 + Math.cos(k) * 30, 1120 + Math.sin(k * 1.3) * 18, 26 + k * 6, k, k + 1.6); g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke(); }
  ell(g, 720, 1100, 30, 8); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill();
  // Zaun unten links/rechts vom Tor + seitlich
  for (let x = 10; x < WORLD_W; x += 40) if (Math.abs(x - 500) > 70) { rrPath(g, x - 5, 1338, 10, 50, 3); fs(g, '#8d5a3b', 2); ell(g, x, 1338, 7, 4); g.fillStyle = '#fff'; g.fill(); }
  g.fillStyle = '#6f4e37'; g.fillRect(0, 1350, 430, 6); g.fillRect(570, 1350, 430, 6); g.fillRect(0, 1370, 430, 6); g.fillRect(570, 1370, 430, 6);
}
const CDECOR = [
  // innen
  { id: 'tafel1', t: 'huettentafel', x: 300, y: 450, x0: 170, y0: 380, w: 260, h: 50, bb: [140, 300, 320, 170] },
  { id: 'tafel2', t: 'huettentafel', x: 700, y: 450, x0: 570, y0: 380, w: 260, h: 50, bb: [540, 300, 320, 170] },
  { id: 'baum', t: 'christbaum', x: 830, y: 260, r: 34, bb: [760, 60, 140, 216] },
  { id: 'holzkorb', t: 'holzkorb', x: 380, y: 200, r: 22, bb: [340, 150, 80, 62] },
  { id: 'garderobe', t: 'garderobe', x: 160, y: 250, r: 24, bb: [110, 110, 100, 150] },
  { id: 'fass', t: 'kaesefass', x: 620, y: 210, r: 22, bb: [580, 140, 80, 76] },
  { id: 'schaukelstuhl', t: 'schaukelstuhl', x: 180, y: 590, r: 24, bb: [130, 520, 100, 80], anim: true },
  { id: 'kiste', t: 'skikiste', x: 820, y: 595, r: 26, bb: [770, 500, 100, 104] },
  // draußen
  { id: 'tanne1', t: 'tanne', x: 90, y: 820, r: 30, bb: [10, 600, 160, 230] },
  { id: 'tanne2', t: 'tanne', x: 930, y: 790, r: 30, bb: [850, 570, 160, 230] },
  { id: 'tanne3', t: 'tanne', x: 120, y: 1240, r: 30, bb: [40, 1020, 160, 230] },
  { id: 'tanne4', t: 'tanne', x: 360, y: 1180, r: 30, bb: [280, 960, 160, 230] },
  { id: 'schneemann', t: 'schneemann', x: 300, y: 880, r: 26, bb: [250, 750, 100, 140] },
  { id: 'holzstapel', t: 'holzstapel', x: 790, y: 800, x0: 700, y0: 760, w: 180, h: 40, bb: [690, 700, 200, 110] },
  { id: 'hackklotz', t: 'hackklotz', x: 640, y: 830, r: 20, bb: [600, 760, 80, 76] },
  { id: 'schlitten', t: 'schlitten', x: 220, y: 1060, r: 26, bb: [170, 1020, 100, 50] },
  { id: 'laterne1', t: 'laternenpfahl', x: 400, y: 760, r: 10, bb: [380, 640, 40, 126], anim: true },
  { id: 'laterne2', t: 'laternenpfahl', x: 600, y: 1000, r: 10, bb: [580, 880, 40, 126], anim: true },
  { id: 'laterne3', t: 'laternenpfahl', x: 400, y: 1300, r: 10, bb: [380, 1180, 40, 126], anim: true },
  { id: 'rentier', t: 'rentier', x: 880, y: 1260, r: 26, bb: [830, 1150, 100, 116] },
  { id: 'wagenrad', t: 'wagenrad', x: 620, y: 1290, r: 22, bb: [570, 1220, 100, 76] },
  { id: 'schneehaufen', t: 'schneehaufen', x: 180, y: 920, r: 30, bb: [130, 880, 100, 46] },
];
const CDRAW = {
  huettentafel(c, d) {
    // lange Holztafel mit Bänken, Schaffellen, Fondue-Topf, Kerzen, Lichterkette
    const benches = y => { rrPath(c, d.x0 - 6, y, d.w + 12, 18, 5); fs(c, '#8d5a3b', 2.5); for (let k = 0; k < 3; k++) { ell(c, d.x0 + 40 + k * 90, y + 6, 22, 10); fs(c, '#f1ebdc', 2); } };
    benches(d.y0 - 30);
    rrPath(c, d.x0, d.y0, d.w, d.h, 6); fs(c, '#c08b55', 3); for (let k = 1; k < 4; k++) line(c, d.x0 + 4, d.y0 + k * d.h / 4, d.x0 + d.w - 4, d.y0 + k * d.h / 4, 1.5, 'rgba(90,60,30,.3)', false);
    line(c, d.x0 + 16, d.y0 + d.h, d.x0 + 16, d.y0 + d.h + 22, 6, '#6f4e37', false); line(c, d.x0 + d.w - 16, d.y0 + d.h, d.x0 + d.w - 16, d.y0 + d.h + 22, 6, '#6f4e37', false);
    const cx = d.x0 + d.w / 2; ell(c, cx, d.y0 + 26, 24, 9); fs(c, '#343a40', 2); rrPath(c, cx - 20, d.y0, 40, 24, 8); fs(c, '#c1121f', 2.5); ell(c, cx, d.y0, 20, 7); fs(c, '#9d0208', 2); ell(c, cx, d.y0 + 1, 16, 5); c.fillStyle = '#ffd166'; c.fill();
    for (const kx of [d.x0 + 40, d.x0 + d.w - 40]) { rrPath(c, kx - 4, d.y0 - 4, 8, 22, 2); fs(c, '#f8f9fa', 2); }
    for (let k = 0; k < 6; k++) { const mx = d.x0 + 24 + k * 44; rrPath(c, mx - 6, d.y0 + (k % 2 ? 28 : 6), 12, 14, 3); fs(c, '#f8f9fa', 1.5); }
    benches(d.y0 + d.h + 6);
  },
  christbaum(c, d, t) {
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 40, 10); c.fill();
    rrPath(c, d.x - 16, d.y - 24, 32, 24, 4); fs(c, '#8d5a3b', 2.5);
    for (let k = 0; k < 4; k++) { const w = 64 - k * 13, y = d.y - 26 - k * 40; polyPath(c, [[d.x - w, y], [d.x, y - 62], [d.x + w, y]]); fs(c, k % 2 ? '#2d6a4f' : '#40916c', 3); }
    for (let k = 0; k < 14; k++) { const yy = d.y - 40 - (k * 11) % 150, ww = (64 - ((d.y - 26 - yy) / 40) * 13) * 0.8, xx = d.x + ((k * 37) % 100 - 50) / 50 * ww * 0.6; ell(c, xx, yy, 4, 4); c.fillStyle = ['#e63946', '#ffd166', '#4dabf7', '#f8f9fa'][k % 4]; c.fill(); }
    starPath(c, d.x, d.y - 194, 12, 5); fs(c, '#ffd60a', 2.5);
    for (let k = 0; k < 3; k++) { rrPath(c, d.x - 44 + k * 30, d.y - 18, 24, 20, 3); fs(c, ['#e63946', '#4dabf7', '#ffd166'][k], 2); line(c, d.x - 32 + k * 30, d.y - 18, d.x - 32 + k * 30, d.y + 2, 2, '#fff', false); }
  },
  holzkorb(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 26, 7); c.fill(); for (let k = 0; k < 5; k++) { ell(c, d.x - 14 + (k % 3) * 14, d.y - 30 - Math.floor(k / 3) * 10, 7, 7); fs(c, '#e9c46a', 2); } rrPath(c, d.x - 24, d.y - 28, 48, 28, 6); fs(c, '#a68a64', 2.5); for (let k = 0; k < 5; k++) line(c, d.x - 20 + k * 10, d.y - 26, d.x - 20 + k * 10, d.y - 2, 1.5, 'rgba(60,40,20,.4)', false); },
  garderobe(c, d) {
    line(c, d.x - 30, d.y, d.x - 30, d.y - 130, 5, '#6f4e37'); line(c, d.x + 30, d.y, d.x + 30, d.y - 130, 5, '#6f4e37'); line(c, d.x - 36, d.y - 120, d.x + 36, d.y - 120, 5, '#6f4e37');
    rrPath(c, d.x - 30, d.y - 116, 26, 60, 8); fs(c, '#e63946', 2.5); rrPath(c, d.x + 2, d.y - 114, 26, 56, 8); fs(c, '#1c7ed6', 2.5);
    line(c, d.x - 20, d.y - 4, d.x - 12, d.y - 100, 4, '#f8f9fa'); line(c, d.x - 8, d.y - 4, d.x, d.y - 100, 4, '#f8f9fa'); line(c, d.x + 18, d.y - 2, d.x + 22, d.y - 60, 3, '#adb5bd');
  },
  kaesefass(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 26, 7); c.fill(); rrPath(c, d.x - 22, d.y - 40, 44, 40, 8); fs(c, '#8d5a3b', 2.5); line(c, d.x - 22, d.y - 28, d.x + 22, d.y - 28, 3, '#495057', false); line(c, d.x - 22, d.y - 10, d.x + 22, d.y - 10, 3, '#495057', false); ell(c, d.x, d.y - 40, 22, 7); fs(c, '#a0673a', 2); ell(c, d.x, d.y - 50, 18, 9); fs(c, '#ffd166', 2.5); polyPath(c, [[d.x, d.y - 52], [d.x + 18, d.y - 50], [d.x + 4, d.y - 42]]); c.fillStyle = '#e9c46a'; c.fill(); },
  schaukelstuhl(c, d, t) { const r = Math.sin(t * 1.2) * 0.08; c.save(); c.translate(d.x, d.y); c.rotate(r); c.beginPath(); c.moveTo(-30, 0); c.quadraticCurveTo(0, 10, 30, -2); c.lineWidth = 5; c.strokeStyle = '#6f4e37'; c.stroke(); line(c, -20, 2, -18, -24, 4, '#8d5a3b'); line(c, 20, 0, 18, -24, 4, '#8d5a3b'); rrPath(c, -24, -30, 48, 10, 4); fs(c, '#8d5a3b', 2.5); rrPath(c, -24, -70, 14, 44, 4); fs(c, '#8d5a3b', 2.5); rrPath(c, -22, -40, 44, 12, 5); fs(c, '#c1121f', 2); c.save(); rrPath(c, -22, -40, 44, 12, 5); c.clip(); c.fillStyle = 'rgba(255,255,255,.3)'; for (let k = -3; k < 4; k++) c.fillRect(k * 7, -40, 2, 12); c.restore(); c.restore(); },
  skikiste(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 32, 8); c.fill(); for (let k = 0; k < 3; k++) line(c, d.x - 18 + k * 12, d.y - 4, d.x - 22 + k * 12, d.y - 96, 5, ['#e63946', '#ffd166', '#1c7ed6'][k]); rrPath(c, d.x - 28, d.y - 30, 56, 30, 4); fs(c, '#a0673a', 2.5); for (let k = 0; k < 4; k++) line(c, d.x - 24 + k * 16, d.y - 28, d.x - 24 + k * 16, d.y - 2, 1.5, 'rgba(60,35,20,.4)', false); },
  tanne(c, d) {
    c.fillStyle = 'rgba(70,90,110,.18)'; ell(c, d.x + 20, d.y + 6, 60, 16); c.fill();
    rrPath(c, d.x - 8, d.y - 24, 16, 26, 3); fs(c, '#6f4e37', 2.5);
    for (let k = 0; k < 4; k++) { const w = 66 - k * 13, y = d.y - 20 - k * 44; polyPath(c, [[d.x - w, y], [d.x, y - 70], [d.x + w, y]]); fs(c, k % 2 ? '#1b4332' : '#2d6a4f', 3);
      c.beginPath(); c.moveTo(d.x - w + 6, y - 2); c.quadraticCurveTo(d.x - w * 0.5, y - 14, d.x - w * 0.2, y - 6); c.quadraticCurveTo(d.x + w * 0.2, y - 16, d.x + w - 6, y - 2); c.lineTo(d.x + w * 0.4, y - 24); c.lineTo(d.x, y - 62); c.lineTo(d.x - w * 0.4, y - 24); c.closePath(); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); }
  },
  schneemann(c, d) {
    c.fillStyle = 'rgba(70,90,110,.18)'; ell(c, d.x, d.y + 2, 36, 10); c.fill();
    ell(c, d.x, d.y - 26, 32, 28); fs(c, '#fff', 3); ell(c, d.x, d.y - 70, 23, 21); fs(c, '#fff', 3); ell(c, d.x, d.y - 104, 16, 15); fs(c, '#fff', 3);
    for (let k = 0; k < 3; k++) { ell(c, d.x, d.y - 80 + k * 10, 2.5, 2.5); c.fillStyle = OL; c.fill(); }
    ell(c, d.x - 5, d.y - 107, 2.2, 2.2); c.fill(); ell(c, d.x + 5, d.y - 107, 2.2, 2.2); c.fill(); polyPath(c, [[d.x, d.y - 103], [d.x + 18, d.y - 100], [d.x, d.y - 98]]); fs(c, '#f77f00', 1.5);
    rrPath(c, d.x - 18, d.y - 92, 36, 8, 4); fs(c, '#e63946', 2); rrPath(c, d.x + 6, d.y - 88, 8, 22, 3); fs(c, '#e63946', 2);
    rrPath(c, d.x - 12, d.y - 138, 24, 22, 3); fs(c, '#212529', 2.5); rrPath(c, d.x - 18, d.y - 120, 36, 6, 2); fs(c, '#212529', 2);
    line(c, d.x - 22, d.y - 72, d.x - 46, d.y - 92, 3, '#6f4e37'); line(c, d.x + 22, d.y - 72, d.x + 44, d.y - 86, 3, '#6f4e37');
  },
  holzstapel(c, d) {
    rrPath(c, d.x0 - 6, d.y0 - 70, d.w + 12, 12, 3); fs(c, '#6f4e37', 2.5); polyPath(c, [[d.x0 - 14, d.y0 - 70], [d.x0 + d.w / 2, d.y0 - 96], [d.x0 + d.w + 14, d.y0 - 70]]); fs(c, '#5c3d2e', 2.5); polyPath(c, [[d.x0 - 10, d.y0 - 72], [d.x0 + d.w / 2, d.y0 - 94], [d.x0 + d.w + 10, d.y0 - 72], [d.x0 + d.w / 2, d.y0 - 84]]); c.fillStyle = '#fff'; c.fill();
    line(c, d.x0, d.y0 - 60, d.x0, d.y0 + d.h, 5, '#5c3d2e'); line(c, d.x0 + d.w, d.y0 - 60, d.x0 + d.w, d.y0 + d.h, 5, '#5c3d2e');
    for (let r2 = 0; r2 < 5; r2++) for (let k = 0; k < 9; k++) { const x = d.x0 + 12 + k * 20 + (r2 % 2) * 6, y = d.y0 + d.h - 12 - r2 * 18; if (x > d.x0 + d.w - 8) continue; ell(c, x, y, 10, 9); fs(c, '#d4a373', 1.5); ell(c, x, y, 5, 4); c.lineWidth = 1; c.strokeStyle = 'rgba(120,80,40,.5)'; c.stroke(); }
  },
  hackklotz(c, d) { c.fillStyle = 'rgba(70,90,110,.18)'; ell(c, d.x, d.y + 2, 26, 8); c.fill(); rrPath(c, d.x - 20, d.y - 30, 40, 30, 6); fs(c, '#8d5a3b', 2.5); ell(c, d.x, d.y - 30, 20, 7); fs(c, '#d4a373', 2.5); line(c, d.x + 4, d.y - 32, d.x + 26, d.y - 70, 4, '#8d5a3b'); polyPath(c, [[d.x - 2, d.y - 30], [d.x + 14, d.y - 44], [d.x + 4, d.y - 26]]); fs(c, '#adb5bd', 2); },
  schlitten(c, d) { c.fillStyle = 'rgba(70,90,110,.18)'; ell(c, d.x, d.y + 2, 36, 8); c.fill(); c.beginPath(); c.moveTo(d.x - 36, d.y); c.lineTo(d.x + 30, d.y); c.quadraticCurveTo(d.x + 44, d.y, d.x + 40, d.y - 14); c.lineWidth = 4; c.strokeStyle = '#495057'; c.stroke(); line(c, d.x - 24, d.y, d.x - 24, d.y - 12, 3, '#8d5a3b'); line(c, d.x + 20, d.y, d.x + 20, d.y - 12, 3, '#8d5a3b'); rrPath(c, d.x - 34, d.y - 22, 64, 12, 4); fs(c, '#c1121f', 2.5); c.beginPath(); c.moveTo(d.x + 30, d.y - 16); c.quadraticCurveTo(d.x + 60, d.y - 30, d.x + 50, d.y + 2); c.lineWidth = 1.5; c.strokeStyle = '#f8f9fa'; c.stroke(); },
  laternenpfahl(c, d, t) { const gl = 0.75 + 0.25 * Math.sin(t * 6 + d.x) * Math.sin(t * 2.3); ell(c, d.x, d.y - 104, 34, 34); c.fillStyle = `rgba(255,214,110,${0.18 * gl})`; c.fill(); line(c, d.x, d.y, d.x, d.y - 90, 5, '#343a40'); rrPath(c, d.x - 10, d.y - 120, 20, 28, 4); fs(c, '#212529', 2.5); rrPath(c, d.x - 6, d.y - 116, 12, 20, 2); c.fillStyle = `rgba(255,214,110,${gl})`; c.fill(); polyPath(c, [[d.x - 12, d.y - 120], [d.x + 12, d.y - 120], [d.x, d.y - 130]]); fs(c, '#212529', 2); ell(c, d.x, d.y - 131, 8, 3); c.fillStyle = '#fff'; c.fill(); },
  rentier(c, d) {
    // Holz-Rentier aus Ästen (wie die Holzdeko an der Hütte)
    c.fillStyle = 'rgba(70,90,110,.18)'; ell(c, d.x, d.y + 2, 32, 8); c.fill();
    for (const [x1, x2] of [[-18, -22], [-8, -6], [12, 10], [20, 24]]) line(c, d.x + x1, d.y, d.x + x2, d.y - 34, 4, '#a0673a');
    rrPath(c, d.x - 26, d.y - 52, 52, 22, 10); fs(c, '#c08b55', 2.5); line(c, d.x + 18, d.y - 48, d.x + 30, d.y - 74, 6, '#c08b55');
    rrPath(c, d.x + 24, d.y - 88, 22, 14, 6); fs(c, '#c08b55', 2.5); ell(c, d.x + 46, d.y - 82, 3.5, 3.5); c.fillStyle = '#c1121f'; c.fill();
    for (const sd of [-1, 1]) { line(c, d.x + 30, d.y - 88, d.x + 30 + sd * 12, d.y - 106, 2.5, '#6f4e37', false); line(c, d.x + 30 + sd * 6, d.y - 97, d.x + 30 + sd * 16, d.y - 98, 2, '#6f4e37', false); }
    rrPath(c, d.x - 14, d.y - 56, 28, 6, 3); c.fillStyle = '#c1121f'; c.fill();
  },
  wagenrad(c, d) { c.fillStyle = 'rgba(70,90,110,.18)'; ell(c, d.x, d.y + 2, 30, 7); c.fill(); ell(c, d.x, d.y - 34, 32, 32); c.lineWidth = 8; c.strokeStyle = OL; c.stroke(); c.lineWidth = 5; c.strokeStyle = '#8d5a3b'; c.stroke(); for (let k = 0; k < 10; k++) { const a = k * TAU / 10; line(c, d.x, d.y - 34, d.x + Math.cos(a) * 29, d.y - 34 + Math.sin(a) * 29, 2.5, '#a0673a', false); } ell(c, d.x, d.y - 34, 7, 7); fs(c, '#6f4e37', 2); c.beginPath(); c.arc(d.x, d.y - 34, 32, Math.PI * 1.15, Math.PI * 1.85); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke(); },
  schneehaufen(c, d) { for (const [dx, dy, r2] of [[-18, -6, 20], [14, -8, 22], [0, -20, 18]]) { ell(c, d.x + dx, d.y + dy, r2, r2 * 0.7); fs(c, '#fff', 2.5); } ell(c, d.x - 4, d.y - 26, 8, 4); c.fillStyle = 'rgba(190,215,235,.6)'; c.fill(); },
};
function buildGridChalet() {
  cellsIn(HUT.x0 + 8, 168, HUT.x1 - 8, HUT.y1 - 6, i => (G0[i] = 1));                 // innen
  cellsIn(HUT.door0 + 6, HUT.y1 - 10, HUT.door1 - 6, HUT.y1 + 40, i => (G0[i] = 1));   // Tür
  cellsIn(40, HUT.y1 + 34, 960, 1330, i => (G0[i] = 1));                               // Garten
  cellsIn(455, 1320, 545, 1345, i => (G0[i] = 1));
  cellsIn(440, 150, 560, 240, i => (G0[i] = 0));                                         // Kamin-Vorplatz
  cellsCircle(760, 1120, 70, () => {});
  for (const d of CDECOR) {
    if (d.w) cellsIn(d.x0 - 4, d.y0 - (d.t === 'huettentafel' ? 34 : 4), d.x0 + d.w + 4, d.y0 + d.h + 26, i => (G0[i] = 0));
    else if (d.r) cellsCircle(d.x, d.y - 6, Math.max(8, d.r - 6), i => (G0[i] = 0));
  }
}
const CSPOTS = [
  furnSpot(CDECOR, 'tafel1', 'top', { px: 230, py: 462, sx: 230, sy: 500 }),
  furnSpot(CDECOR, 'tafel2', 'top', { px: 770, py: 462, sx: 770, sy: 500 }),
  furnSpot(CDECOR, 'baum', 'top', { px: 812, py: 240, sx: 790, sy: 305 }),
  furnSpot(CDECOR, 'holzkorb', 'top', { px: 386, py: 168, sx: 380, sy: 245 }),
  furnSpot(CDECOR, 'garderobe', 'left', { px: 140, py: 212, sx: 205, sy: 285 }),
  furnSpot(CDECOR, 'fass', 'right', { px: 638, py: 192, sx: 655, sy: 255 }),
  furnSpot(CDECOR, 'schaukelstuhl', 'top', { px: 196, py: 556, cut: 566, front: true, sx: 232, sy: 600 }),
  furnSpot(CDECOR, 'kiste', 'top', { px: 832, py: 562, sx: 780, sy: 615 }),
  furnSpot(CDECOR, 'tanne1', 'right', { px: 112, py: 790, sx: 140, sy: 830 }),
  furnSpot(CDECOR, 'tanne2', 'left', { px: 908, py: 760, sx: 880, sy: 800 }),
  furnSpot(CDECOR, 'tanne3', 'right', { px: 142, py: 1210, sx: 170, sy: 1250 }),
  furnSpot(CDECOR, 'tanne4', 'left', { px: 338, py: 1150, sx: 310, sy: 1190 }),
  furnSpot(CDECOR, 'schneemann', 'left', { px: 282, py: 846, sx: 255, sy: 892 }),
  furnSpot(CDECOR, 'holzstapel', 'top', { px: 762, py: 738, sx: 762, sy: 842 }),
  furnSpot(CDECOR, 'hackklotz', 'right', { px: 656, py: 806, sx: 676, sy: 848 }),
  furnSpot(CDECOR, 'schlitten', 'on', { px: 212, py: 1040, sx: 220, sy: 1098, sz: 0.6 }),
  furnSpot(CDECOR, 'rentier', 'left', { px: 862, py: 1226, sx: 835, sy: 1272 }),
  furnSpot(CDECOR, 'wagenrad', 'left', { px: 598, py: 1270, sx: 580, sy: 1302 }),
  furnSpot(CDECOR, 'schneehaufen', 'top', { px: 190, py: 896, cut: 906, front: true, sx: 180, sy: 960 }),
];
// innen: rot karierte Wolldecke, draußen: Schneehaufen
function drawChaletCover(c, x, y, w, seed = 0) {
  if (y < HUT.y1 && x > HUT.x0 && x < HUT.x1) {
    c.save(); c.translate(x, y); c.rotate(((seed * 37) % 7 - 3) * 0.06);
    c.beginPath(); c.moveTo(-w, -w * 0.1); c.quadraticCurveTo(-w * 0.2, -w * 0.45, w * 0.4, -w * 0.3); c.quadraticCurveTo(w * 0.9, -w * 0.25, w, 0); c.lineTo(w * 0.85, w * 0.32); c.quadraticCurveTo(0, w * 0.46, -w * 0.9, w * 0.3); c.closePath();
    fs(c, '#c1121f', 2.5); c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.35)'; for (let k = -6; k < 6; k++) { c.fillRect(k * w * 0.22, -w, w * 0.07, w * 2); c.fillRect(-w, k * w * 0.22, w * 2, w * 0.07); } c.restore(); c.restore(); return;
  }
  c.save(); c.translate(x, y);
  for (const [dx, dy, r2] of [[-w * 0.5, 0, w * 0.55], [w * 0.45, -2, w * 0.6], [0, -w * 0.2, w * 0.55]]) { ell(c, dx, dy, r2, r2 * 0.55); fs(c, '#fff', 2.5); }
  ell(c, -w * 0.1, -w * 0.38, w * 0.25, w * 0.1); c.fillStyle = 'rgba(190,215,235,.6)'; c.fill();
  c.restore();
}
const CJUNK = {
  zapfen(c) { ell(c, 0, -6, 6, 9); fs(c, '#8d5a3b', 2); for (let k = 0; k < 3; k++) { ell(c, 0, -11 + k * 5, 4, 2); c.fillStyle = '#a0673a'; c.fill(); } },
  ast(c) { line(c, -12, 0, 10, -10, 3.5, '#6f4e37'); line(c, 0, -5, 6, 2, 2.5, '#6f4e37'); ell(c, 4, -8, 4, 2); c.fillStyle = '#fff'; c.fill(); },
  schneeball(c) { ell(c, 0, -6, 9, 8); fs(c, '#fff', 2); ell(c, -3, -9, 3, 2); c.fillStyle = 'rgba(190,215,235,.8)'; c.fill(); },
};
// Holztor mit Schneehäubchen + Schild "Spielplatz" (Boss-Level)
function drawWoodGate(c, x, y, s, open, locked, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, 0, 4, 76, 12); c.fill();
  rrPath(c, -64, -120, 18, 124, 4); fs(c, '#6f4e37', 3); rrPath(c, 46, -120, 18, 124, 4); fs(c, '#6f4e37', 3);
  ell(c, -55, -122, 14, 7); fs(c, '#fff', 2); ell(c, 55, -122, 14, 7); fs(c, '#fff', 2);
  rrPath(c, -46, -150, 92, 26, 5); fs(c, '#8d5a3b', 3); ell(c, 0, -152, 46, 8); fs(c, '#fff', 2); txt(c, 'Spielplatz', 0, -136, 13, '#fff', 'center', null);
  const o = clamp(open, 0, 1);
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * 46, 0); c.scale(1 - o * 0.85, 1); const x0 = sd > 0 ? -46 : 0; rrPath(c, x0 + 2, -94, 42, 90, 3); fs(c, '#a0673a', 2.5); line(c, x0 + 4, -90, x0 + 42, -8, 4, '#6f4e37'); line(c, x0 + 2, -50, x0 + 44, -50, 3, '#6f4e37', false); for (let k = 1; k < 4; k++) line(c, x0 + k * 11, -92, x0 + k * 11, -6, 1.5, 'rgba(60,35,20,.4)', false); c.restore(); }
  if (locked) { const b = Math.sin(t * 3) * 2; ell(c, 0, -60 + b, 14, 14); fs(c, '#fff', 2.5); icon(c, 'lock', 0, -60 + b, 18); }
  c.restore();
}
STAGE_DEFS.chalet = {
  id: 'chalet', bg: '#dbe4ee', start: { x: 500, y: 330 }, gate: { x: 500, y: 1392, ix: 500, iy: 1320 },
  npcs: [
    { id: 'c_gerda', pos: [[300, 300], [700, 300], [240, 560]] },
    { id: 'c_felix', pos: [[300, 1000], [460, 1120], [200, 1160]] },
    { id: 'c_berger', pos: [[500, 520], [760, 560], [600, 300]] },
    { id: 'c_toni', pos: [[860, 700], [880, 880], [640, 740]] },
    { id: 'c_anna', pos: [[380, 880], [600, 1220], [770, 1300]] },
  ],
  decor: CDECOR, spots: CSPOTS, grid: buildGridChalet, ground: drawGroundChalet, decorDraw: CDRAW,
  feat: { swing: false, slide: false, house: false, racer: false, pigeons: false, waiter: false, dig: false },
  junk: ['zapfen', 'ast', 'schneeball'], junkDraw: CJUNK, items: CHALET_ITEMS, cover: drawChaletCover,
  drawGate: drawWoodGate, gateName: 'Das Holztor', dialogGate: 0.48, gateFace: (c, x, y, s, t) => drawWoodGate(c, x, y, s * 0.38, 0, true, t),
  words: { one: 'Gast', the: 'den Gast', a: 'einen Gast', many: 'Gäste', dat: 'Gästen', back: 'zum Gast', each: 'Jeder Gast',
    hide: 'unter den Tischen, beim Christbaum, im Holzstapel, hinter Tannen und dem Schneemann', junk: 'ein Tannenzapfen oder ein Schneeball', gate: 'am Holztor zum Spielplatz', gateTap: 'Lauf zum Holztor und tippe es an!',
    opened: 'Das Holztor ist offen!',
    lock: 'Das Holztor zum Spielplatz geht erst auf, wenn du allen fünf Gästen geholfen hast.',
    progress: 'Dir fehlen noch ein paar Sachen, oben siehst du welche. Schau unter die Tische, zum Christbaum, in den Holzstapel und hinter die Tannen!',
    gateAsk: 'Das Holztor ist eingefroren! Bring mir diese Sachen, dann geht es auf und du kommst zum Spielplatz.',
    search: 'Schau hinter Tannen und unter Tische – dann tippe auf die Lupe!' },
  pools: {
    easy: ['fondue', 'holzhacken', 'kaminfeuer', 'schneeball', 'eisrutsch', 'eisstock', 'memory', 'limo_mix', 'stack', 'trace', 'lights', 'count_easy', 'cups', 'findall', 'shadow', 'maze_easy', 'connect', 'color', 'sort', 'size_row', 'pop'],
    puzzle: ['eisrutsch', 'hanoi', 'lights', 'diff', 'puzzle', 'balance', 'pattern', 'dots', 'pairs', 'nextrow', 'count', 'mirror', 'rotimg', 'sequence', 'shell', 'oddone'],
    std: ['fondue', 'holzhacken', 'kaminfeuer', 'schneeball', 'eisstock', 'collect'],
    sp: ['holzhacken', 'eisstock', 'slide', 'run'],
    hard: ['jump', 'slide', 'platform'],
  },
  extras(play) {
    // Schneefall draußen, Kaminfeuer flackert, Wirt Sepp rührt im großen Fondue-Topf, Rauch aus dem Kamin
    const flakes = [...Array(90)].map((_, i) => ({ x: Math.random() * 1000, y: Math.random() * 1400, s: 1.5 + Math.random() * 2.5, v: 30 + Math.random() * 40, ph: Math.random() * 6 }));
    return {
      update(dt) { flakes.forEach(f => { f.y += f.v * dt; f.ph += dt; f.x += Math.sin(f.ph) * 12 * dt; if (f.y > 1400) { f.y = -10; f.x = Math.random() * 1000; } }); },
      draw(c, L, vis, t) {
        L.push({ y: 151, f: () => { for (let k = 0; k < 6; k++) { const fx = 470 + k * 12, h = 26 + Math.sin(t * 9 + k * 1.7) * 9; c.beginPath(); c.moveTo(fx - 10, 150); c.quadraticCurveTo(fx - 6, 150 - h * 0.6, fx + Math.sin(t * 7 + k) * 4, 150 - h); c.quadraticCurveTo(fx + 8, 150 - h * 0.6, fx + 10, 150); c.closePath(); c.fillStyle = k % 2 ? '#f77f00' : '#ffd166'; c.fill(); } ell(c, 500, 150, 60, 14); c.fillStyle = `rgba(255,140,40,${0.25 + 0.1 * Math.sin(t * 5)})`; c.fill(); } });
        const sx = 260 + Math.sin(t * 0.3) * 24;
        if (vis(sx, 225)) L.push({ y: 225, f: () => { drawPerson(c, 'c_sepp', sx, 225, 1.05, t, {}); c.save(); c.translate(sx + 22, 220); line(c, 0, -24, -8 + Math.sin(t * 4) * 6, -6, 3, '#8d5a3b'); c.restore(); } });
        L.push({ y: 99997, f: () => {
          c.save(); c.fillStyle = 'rgba(255,255,255,.92)';
          flakes.forEach(f => { if (f.y < HUT.y1 + 30 && f.y > HUT.y0 - 120 && f.x > HUT.x0 - 30 && f.x < HUT.x1 + 30) return; if (!vis(f.x, f.y)) return; ell(c, f.x, f.y, f.s, f.s); c.fill(); });
          for (let k = 0; k < 4; k++) { const p = ((t * 0.25 + k / 4) % 1); ell(c, 500 + Math.sin(p * 6 + k) * 14, 10 - p * 120, 10 + p * 18, 8 + p * 14); c.fillStyle = `rgba(220,225,230,${0.5 * (1 - p)})`; c.fill(); }
          c.restore();
        } });
      },
    };
  },
};
