'use strict';
// ---------- Stage "Gastraum": das Glashaus vom Original (nach Website- und Gäste-Fotos) ----------
// Rot-oranger Klinkerboden, dunkler Holzboden an Bar und Treppe, Glaswände mit Stahlstreben, Hanfpalmen und alte Olivenbäume,
// Bar mit Holzregal voller Flaschen + schwarze Barhocker, Holztreppe hoch zur Empore (Kunstrasen), Weinberg-Fototapete,
// helle Holztische mit geblümten Stühlen, die lange weiße Tafel mit stehenden Servietten, Weinfass, Lichterketten mit Glühbirnen.

// ---- gemeinsame Zeichen-Helfer für die Bereiche ----
function planks(g, x, y, w, h, cols = ['#5c4636', '#4e3b2d', '#66503f'], ph = 26, vertical = false) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  if (!vertical) for (let yy = y, k = 0; yy < y + h; yy += ph, k++) { g.fillStyle = cols[k % cols.length]; g.fillRect(x, yy, w, ph); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, yy + ph - 2, w, 2); for (let xx = x + ((k * 71) % 160) - 160; xx < x + w; xx += 160 + (k % 3) * 30) g.fillRect(xx, yy, 2, ph); }
  else for (let xx = x, k = 0; xx < x + w; xx += ph, k++) { g.fillStyle = cols[k % cols.length]; g.fillRect(xx, y, ph, h); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(xx + ph - 2, y, 2, h); for (let yy = y + ((k * 71) % 160) - 160; yy < y + h; yy += 160 + (k % 3) * 30) g.fillRect(xx, yy, ph, 2); }
  g.restore();
}
function brickFloor(g, x, y, w, h, R, cols = ['#c96f4a', '#d27d55', '#bb6342', '#d88a63', '#c4704f']) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = '#a65a3c'; g.fillRect(x, y, w, h);
  for (let yy = y, k = 0; yy < y + h; yy += 20, k++) for (let xx = x - (k % 2) * 20; xx < x + w; xx += 40) { g.fillStyle = cols[Math.floor(R() * cols.length)]; g.fillRect(xx + 1, yy + 1, 38, 18); if (R() < 0.15) { g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(xx + 1, yy + 1, 38, 18); } }
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,235,210,.05)'; ell(g, x + R() * w, y + R() * h, 60 + R() * 80, 30 + R() * 40); g.fill(); }
  g.restore();
}
function glassWall(g, x, y, w, h, R, side = 0) {
  const gr = g.createLinearGradient(x, y, x + w, y); gr.addColorStop(0, '#bfe3f0'); gr.addColorStop(1, '#e3f4fa'); g.fillStyle = gr; g.fillRect(x, y, w, h);
  // draußen: Hecke + Felder hinter dem Glas
  for (let yy = y; yy < y + h; yy += 30) { ell(g, x + w * (side ? 0.7 : 0.3), yy + R() * 20, w * 0.45, 16); g.fillStyle = R() < 0.5 ? 'rgba(82,140,80,.55)' : 'rgba(110,160,90,.5)'; g.fill(); }
  g.strokeStyle = '#f8f9fa'; g.lineWidth = 4; for (let yy = y; yy <= y + h; yy += 90) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); }
  g.strokeStyle = '#868e96'; g.lineWidth = 6; g.beginPath(); g.moveTo(side ? x + 3 : x + w - 3, y); g.lineTo(side ? x + 3 : x + w - 3, y + h); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.25)'; for (let yy = y + 20; yy < y + h; yy += 180) { polyPath(g, [[x + 6, yy], [x + w - 10, yy - 30], [x + w - 10, yy - 10], [x + 6, yy + 20]]); g.fill(); }
}
function steelPost(g, x, y0, y1) { line(g, x, y0, x, y1, 7, '#6c757d'); line(g, x - 2, y0, x - 2, y1, 1.5, 'rgba(255,255,255,.35)', false); }

// ---- Gäste im Gastraum (Auftraggeber) + Personal (läuft herum) ----
Object.assign(STAFF_PEOPLE, {
  g_rosi: { skin: '#f6d2b8', hair: '#dee2e6', bun: true, glasses: '#495057', jacket: '#9b5de5', knit: '#c77dff', skirt: '#495057', shoes: '#6c584c' },
  g_becker: { skin: '#e0ac85', hair: '#6c584c', beard: '#6c584c', jacket: '#4dabf7', check: 'rgba(28,126,214,.55)', pants: '#343a40', shoes: '#212529' },
  g_lina: { kid: true, skin: '#f1c7a5', hair: '#e9c46a', pony: true, jacket: '#ff8fab', skirt: '#ffd166', shoes: '#e63946', hat: 'party', hatCol: '#4dabf7' },
  g_schulz: { skin: '#c68863', hair: '#2b1d14', long: true, sun: true, jacket: '#2a9d8f', pants: '#e9ecef', shoes: '#f4a261' },
  g_ben: { skin: '#f1c7a5', hair: '#a0522d', jacket: '#adb5bd', pants: '#1d3557', shoes: '#f8f9fa', hat: 'cap', hatCol: '#e63946' },
  g_sophie: { skin: '#f1c7a5', hair: '#3b2416', bun: true, jacket: '#212529', apron: '#212529', leaf: true, pants: '#212529', shoes: '#f8f9fa' },
  g_jonas: { skin: '#d9a57e', hair: '#1f1a17', beard: '#1f1a17', jacket: '#212529', apron: '#6f4e37', pants: '#343a40', shoes: '#212529' },
  // sitzende Gäste an den Tischen
  g_s1: { skin: '#f1c7a5', hair: '#7a4a2a', long: true, jacket: '#e76f51', pants: '#343a40', shoes: '#212529' },
  g_s2: { skin: '#a8714f', hair: '#1f1a17', curly: true, jacket: '#ffd166', pants: '#343a40', shoes: '#212529' },
  g_s3: { skin: '#f6d2b8', hair: '#adb5bd', glasses: '#212529', jacket: '#2a9d8f', pants: '#343a40', shoes: '#212529' },
  g_s4: { skin: '#e0ac85', hair: '#e9c46a', pony: true, jacket: '#457b9d', pants: '#343a40', shoes: '#212529' },
});
Object.assign(NPC_NAMES, { g_rosi: 'Oma Rosi', g_becker: 'Herr Becker', g_lina: 'Lina', g_schulz: 'Frau Schulz', g_ben: 'Ben' });
Object.assign(NPC_SHORT, { g_rosi: 'Oma Rosi', g_becker: 'Herrn Becker', g_lina: 'Lina', g_schulz: 'Frau Schulz', g_ben: 'Ben' });
Object.assign(NPC_LINES, {
  g_rosi: 'Ach je, ich habe beim Kaffeetrinken ein paar Sachen verlegt!',
  g_becker: 'Wir wollten gerade bestellen, aber auf unserem Tisch fehlt etwas!',
  g_lina: 'Heute ist mein Geburtstag, und meine Party-Sachen sind weg!',
  g_schulz: 'Ich habe für meine Familie gedeckt, aber ein paar Sachen sind verschwunden!',
  g_ben: 'Ich wollte nur kurz zur Bar, und jetzt finde ich meine Sachen nicht mehr!',
});
Object.assign(VOICE_OF, { g_rosi: { pitch: 1.05, rate: 0.9, pick: 1 }, g_becker: { pitch: 0.85, rate: 1.0, pick: 4 }, g_lina: { pitch: 1.4, rate: 1.1, pick: 3 }, g_schulz: { pitch: 1.15, rate: 1.0, pick: 2 }, g_ben: { pitch: 1.05, rate: 1.05, pick: 6 } });

// ---- Gegenstände im Gastraum ----
Object.assign(ITEMS, {
  speisekarte: { n: 'Speisekarte', d(c, f) { c.rotate(-0.15); rrPath(c, -14, -19, 28, 38, 3); fs(c, f('#fbf8f2')); rrPath(c, -14, -19, 6, 38, 2); fs(c, f('#2d6a4f'), 2); if (!f.sil) { leaf(c, 4, -9, 0.45, BRAND.lime); for (let k = 0; k < 3; k++) line(c, -3, 2 + k * 5, 9, 2 + k * 5, 1.4, '#adb5bd', false); } } },
  salzstreuer: { n: 'Salzstreuer', d(c, f) { rrPath(c, -10, -12, 20, 30, 6); fs(c, f('rgba(230,245,255,.95)')); rrPath(c, -10, -14, 20, 14, 2); c.save(); rrPath(c, -10, 2, 20, 16, 5); c.clip(); c.fillStyle = f('#fff'); c.fillRect(-10, 2, 20, 16); c.restore(); ell(c, 0, -14, 10, 4); fs(c, f('#ced4da'), 2.5); rrPath(c, -10, -22, 20, 9, 4); fs(c, f('#adb5bd')); if (!f.sil) for (let k = -1; k <= 1; k++) { ell(c, k * 4, -19, 1.2, 1.2); c.fillStyle = OL; c.fill(); } } },
  pfeffermuehle: { n: 'Pfeffermühle', d(c, f) { c.beginPath(); c.moveTo(-9, 18); c.quadraticCurveTo(-13, 0, -7, -10); c.lineTo(7, -10); c.quadraticCurveTo(13, 0, 9, 18); c.closePath(); fs(c, f('#6f4e37')); rrPath(c, -8, -18, 16, 10, 4); fs(c, f('#8d5a3b')); ell(c, 0, -21, 4, 3); fs(c, f('#adb5bd'), 2); if (!f.sil) line(c, -4, -4, -4, 12, 2, 'rgba(255,255,255,.3)', false); } },
  teelicht: { n: 'Windlicht', d(c, f) { rrPath(c, -13, -14, 26, 30, 5); fs(c, f('rgba(255,236,190,.8)')); ell(c, 0, -14, 13, 4); fs(c, f('rgba(255,255,255,.7)'), 2.5); rrPath(c, -8, 6, 16, 8, 2); fs(c, f('#f8f9fa'), 2); if (!f.sil) { c.beginPath(); c.moveTo(0, -8); c.quadraticCurveTo(5, -1, 0, 5); c.quadraticCurveTo(-5, -1, 0, -8); fs(c, '#ffb703', 1.5); } } },
  vase: { n: 'Blumenvase', d(c, f) { for (const [a, col] of [[-0.5, '#ef476f'], [0, '#ffd166'], [0.5, '#9b5de5']]) { line(c, 0, 0, Math.sin(a) * 14, -14, 2, f('#2d6a4f'), false); ell(c, Math.sin(a) * 16, -18, 6, 6); fs(c, f(col), 2); } c.beginPath(); c.moveTo(-8, -2); c.quadraticCurveTo(-14, 10, -8, 20); c.lineTo(8, 20); c.quadraticCurveTo(14, 10, 8, -2); c.closePath(); fs(c, f('#74c0fc')); } },
  brotkorb: { n: 'Brotkorb', d(c, f) { ell(c, -7, -6, 10, 7, -0.3); fs(c, f('#e9c46a')); ell(c, 7, -7, 10, 7, 0.3); fs(c, f('#d4a373')); c.beginPath(); c.moveTo(-20, -4); c.lineTo(20, -4); c.lineTo(15, 14); c.lineTo(-15, 14); c.closePath(); fs(c, f('#b08968')); if (!f.sil) for (let k = 0; k < 4; k++) line(c, -14 + k * 9, -2, -11 + k * 9, 12, 1.5, 'rgba(90,60,30,.5)', false); } },
  gabel: { n: 'Gabel', d(c, f) { c.rotate(0.5); rrPath(c, -3, -4, 6, 26, 3); fs(c, f('#ced4da')); rrPath(c, -8, -14, 16, 12, 4); fs(c, f('#ced4da')); for (let k = 0; k < 4; k++) { rrPath(c, -7 + k * 4, -24, 2.6, 12, 1.3); fs(c, f('#ced4da'), 1.5); } } },
  tischglocke: { n: 'Tischglocke', d(c, f) { ell(c, 0, 12, 18, 5); fs(c, f('#495057')); c.beginPath(); c.moveTo(-15, 11); c.quadraticCurveTo(-15, -12, 0, -12); c.quadraticCurveTo(15, -12, 15, 11); c.closePath(); fs(c, f('#ffd166')); ell(c, 0, -15, 4, 4); fs(c, f('#e9c46a'), 2); if (!f.sil) ell(c, -6, -2, 3, 6), c.fillStyle = 'rgba(255,255,255,.5)', c.fill(); } },
  kellnerblock: { n: 'Kellnerblock', d(c, f) { c.rotate(0.12); rrPath(c, -13, -18, 26, 34, 3); fs(c, f('#fff')); rrPath(c, -13, -18, 26, 7, 2); fs(c, f('#212529'), 2); if (!f.sil) for (let k = 0; k < 4; k++) line(c, -8, -4 + k * 5, 8 - (k % 2) * 5, -4 + k * 5, 1.4, '#4dabf7', false); line(c, 14, -12, 20, 14, 3, f('#e63946')); } },
  zuckerdose: { n: 'Zuckerdose', d(c, f) { rrPath(c, -14, -6, 28, 22, 8); fs(c, f('#fff')); ell(c, 0, -6, 14, 5); fs(c, f('#f1f3f5')); ell(c, 0, -12, 4, 3); fs(c, f('#adb5bd'), 2); if (!f.sil) { for (let k = 0; k < 3; k++) { rrPath(c, -6 + k * 5, -19 - k, 4, 4, 1); fs(c, '#fff', 1.5); } line(c, -8, 6, 8, 6, 2, '#74c0fc', false); } } },
  saftglas: { n: 'Saftglas', d(c, f) { polyPath(c, [[-11, -18], [11, -18], [8, 18], [-8, 18]]); c.fillStyle = f('rgba(255,159,28,.85)'); c.fill(); fs(c, null); ell(c, 9, -18, 6, 6); fs(c, f('#ffd166'), 2); line(c, -2, -26, 4, -10, 3, f('#e63946')); if (!f.sil) line(c, -7, -12, -5, 12, 2, 'rgba(255,255,255,.6)', false); } },
});
const GAST_ITEMS = ['speisekarte', 'salzstreuer', 'pfeffermuehle', 'teelicht', 'vase', 'brotkorb', 'gabel', 'tischglocke', 'kellnerblock', 'zuckerdose', 'saftglas', 'luftballon'];

// ---- Boden + Wände ----
function drawGroundGastraum(g, R) {
  brickFloor(g, 0, 0, WORLD_W, WORLD_H, R);
  // dunkler Holzboden an der Bar und an der Treppe (wie auf den Fotos)
  planks(g, 52, 150, 560, 200); planks(g, 720, 150, 228, 300);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(52, 346, 560, 4); g.fillRect(720, 446, 228, 4); g.fillRect(612, 150, 4, 200); g.fillRect(716, 150, 4, 300);
  // Schatten der Glasdach-Streben + Sonnenflecken
  g.save(); g.beginPath(); g.rect(52, 150, 896, 1190); g.clip();
  for (let k = -6; k < 12; k++) { g.fillStyle = 'rgba(40,20,10,.07)'; polyPath(g, [[k * 150, 150], [k * 150 + 14, 150], [k * 150 + 14 + 500, 1340], [k * 150 + 500, 1340]]); g.fill(); }
  for (let k = 0; k < 9; k++) { g.fillStyle = 'rgba(40,20,10,.05)'; g.fillRect(52, 300 + k * 130, 896, 8); }
  for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(255,240,200,.08)'; polyPath(g, [[R() * 900, 200 + R() * 1100], [0, 0], [0, 0]].map((p, k, a) => k ? [a[0][0] + (k === 1 ? 90 : 60), a[0][1] + (k === 1 ? 30 : 90)] : p)); g.fill(); }
  g.restore();
  // Rückwand links: Bar-Regalwand aus Holz mit Flaschen, Gläsern, Kreidetafel
  g.fillStyle = '#6f4e37'; g.fillRect(0, 0, 560, 150);
  for (let x = 0; x < 560; x += 24) { g.fillStyle = x % 48 ? '#7a5640' : '#6a4a35'; g.fillRect(x, 0, 24, 150); }
  rrPath(g, 60, 12, 430, 132, 4); fs(g, '#4e3b2d', 3);
  for (let k = 0; k < 3; k++) {
    const y = 48 + k * 40; rrPath(g, 66, y, 418, 6, 2); fs(g, '#a0673a', 2);
    for (let m = 0; m < 17; m++) { const x = 74 + m * 24, kind = (m + k * 3) % 5;
      if (kind < 2 || k === 2) { rrPath(g, x, y - 26, 9, 26, 3); fs(g, ['#2b9348', '#9d0208', '#e9c46a', '#1d3557', '#f77f00'][(m * 7 + k) % 5], 1.5); rrPath(g, x + 2.5, y - 33, 4, 8, 1.5); fs(g, '#343a40', 1); }
      else { rrPath(g, x - 2, y - 18, 13, 18, 3); g.fillStyle = 'rgba(210,235,250,.85)'; g.fill(); g.lineWidth = 1.2; g.strokeStyle = 'rgba(30,30,30,.6)'; g.stroke(); } }
  }
  rrPath(g, 80, 16, 120, 26, 3); fs(g, '#212529', 2.5); txt(g, 'Original Kaffee', 140, 29, 11, '#f8f9fa', 'center', null);
  rrPath(g, 500, 14, 52, 70, 3); fs(g, '#95C11F', 2.5); rrPath(g, 510, 26, 32, 40, 2); fs(g, '#c1121f', 2); leaf(g, 526, 46, 0.5, '#fff');
  // Mitte: Weinberg-Fototapete im Abendlicht
  { const x0 = 560, w = 180, sky = g.createLinearGradient(0, 0, 0, 150); sky.addColorStop(0, '#f9c74f'); sky.addColorStop(0.55, '#f8961e'); sky.addColorStop(1, '#d9480f'); g.fillStyle = sky; g.fillRect(x0, 0, w, 150);
    ell(g, x0 + 120, 46, 18, 18); g.fillStyle = '#fff3bf'; g.fill();
    g.fillStyle = '#9c6644'; g.beginPath(); g.moveTo(x0, 70); g.quadraticCurveTo(x0 + 60, 50, x0 + 110, 66); g.quadraticCurveTo(x0 + 150, 76, x0 + w, 60); g.lineTo(x0 + w, 150); g.lineTo(x0, 150); g.closePath(); g.fill();
    for (let k = 0; k < 9; k++) { g.strokeStyle = k % 2 ? '#386641' : '#4f772d'; g.lineWidth = 4 + k * 0.8; g.beginPath(); g.moveTo(x0 + w * 0.55, 72); g.lineTo(x0 + (k - 1) * 26, 152); g.stroke(); }
    for (const cx of [x0 + 24, x0 + 160]) { g.fillStyle = '#2d4a22'; g.beginPath(); g.moveTo(cx, 30); g.quadraticCurveTo(cx + 9, 50, cx + 6, 72); g.lineTo(cx - 6, 72); g.quadraticCurveTo(cx - 9, 50, cx, 30); g.fill(); }
    g.lineWidth = 3; g.strokeStyle = OL; g.strokeRect(x0, 0, w, 150); }
  // rechts: graue Steintapete + Empore mit Geländer und Kunstrasen
  g.fillStyle = '#ced4da'; g.fillRect(740, 0, 260, 150);
  for (let y = 0, k = 0; y < 150; y += 16, k++) for (let x = 740 + (k % 2) * 14; x < 1000; x += 28) { rrPath(g, x + 1, y + 1, 26, 14, 4); g.fillStyle = ['#d8dde2', '#c5ccd3', '#e1e5e9'][(x + k) % 3]; g.fill(); }
  g.fillStyle = '#74c69d'; g.fillRect(740, 0, 260, 26); for (let x = 744; x < 1000; x += 6) line(g, x, 26, x + 2, 18, 1.5, '#40916c', false);
  for (let x = 744; x <= 1000; x += 16) line(g, x, 26, x, 64, 2.5, '#868e96', false); line(g, 740, 26, 1000, 26, 5, '#6c757d'); line(g, 740, 64, 1000, 64, 3, '#868e96', false);
  for (let k = 0; k < 6; k++) { const x = 770 + k * 34, y = 92 + Math.sin(k) * 6; starPath(g, x, y, 7, 3); fs(g, '#f8f9fa', 1.5); }
  // Glaswände links/rechts mit Stahlstützen
  glassWall(g, 0, 150, 52, 1190, R, 0); glassWall(g, 948, 150, 52, 1190, R, 1);
  for (let y = 150; y < 1340; y += 238) { steelPost(g, 50, y, y + 60); steelPost(g, 950, y, y + 60); }
  g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(52, 150, 6, 1190); g.fillRect(942, 150, 6, 1190); g.fillRect(0, 146, WORLD_W, 6);
  // untere Wand (zur Küche): Holzvertäfelung mit Kreidetafeln, Tür in der Mitte
  g.fillStyle = '#8d5a3b'; g.fillRect(0, 1340, 455, 60); g.fillRect(545, 1340, 455, 60);
  for (let x = 0; x < 1000; x += 30) if (x < 455 || x > 545) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, 1340, 2, 60); }
  g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, 1336, 455, 6); g.fillRect(545, 1336, 455, 6);
  g.fillStyle = '#d27d55'; g.fillRect(455, 1340, 90, 60);
}

// ---- Deko (tiefensortiert) ----
const GDECOR = [
  { id: 'bar', t: 'bar', x: 300, y: 236, x0: 70, y0: 160, w: 460, h: 40, bb: [56, 40, 490, 210] },
  ...[0, 1, 2, 3, 4].map(k => ({ id: 'hocker' + k, t: 'hocker', x: 120 + k * 92, y: 270, r: 14, bb: [100 + k * 92, 200, 40, 76] })),
  { id: 'treppe', t: 'treppe', x: 840, y: 430, x0: 760, y0: 150, w: 150, h: 280, bb: [740, 20, 220, 420] },
  { id: 'kuebel2', t: 'kuebel', x: 580, y: 300, r: 24, bb: [530, 200, 100, 108] },
  { id: 'yucca', t: 'yuccatopf', x: 712, y: 330, r: 22, bb: [650, 200, 124, 138] },
  { id: 'palmtisch', t: 'palmtisch', x: 500, y: 480, r: 52, bb: [360, 120, 280, 380] },
  { id: 'palme1', t: 'palme', x: 95, y: 520, r: 22, bb: [-40, 180, 270, 352] },
  { id: 'palme2', t: 'palme', x: 905, y: 610, r: 22, bb: [770, 270, 270, 352] },
  { id: 'palme3', t: 'palme', x: 95, y: 1010, r: 22, bb: [-40, 670, 270, 352] },
  { id: 'palme4', t: 'palme', x: 905, y: 1100, r: 22, bb: [770, 760, 270, 352] },
  { id: 'tisch1', t: 'tisch4', x: 250, y: 545, x0: 195, y0: 480, w: 110, h: 64, seat: ['g_s1', 'g_s2'], bb: [180, 420, 140, 150] },
  { id: 'tisch2', t: 'tisch4', x: 700, y: 545, x0: 645, y0: 480, w: 110, h: 64, seat: ['g_s3'], bb: [630, 420, 140, 150] },
  { id: 'olive1', t: 'olive', x: 310, y: 800, r: 58, bb: [160, 520, 300, 320] },
  { id: 'olive2', t: 'olive', x: 690, y: 800, r: 58, bb: [540, 520, 300, 320] },
  { id: 'wagen', t: 'servierwagen', x: 160, y: 720, r: 28, bb: [120, 650, 80, 80] },
  { id: 'tisch3', t: 'tisch4', x: 260, y: 1035, x0: 205, y0: 970, w: 110, h: 64, seat: ['g_s4', 'g_s2'], bb: [190, 910, 140, 150] },
  { id: 'tisch4', t: 'tisch4', x: 740, y: 1035, x0: 685, y0: 970, w: 110, h: 64, seat: [], bb: [670, 910, 140, 150] },
  { id: 'tafel', t: 'tafel', x: 500, y: 1240, x0: 300, y0: 1170, w: 400, h: 46, bb: [270, 1100, 460, 160] },
  { id: 'kuebel1', t: 'kuebel', x: 150, y: 1285, r: 24, bb: [100, 1185, 100, 108] },
  { id: 'fass', t: 'fass', x: 860, y: 1285, r: 26, bb: [810, 1170, 100, 122] },
];
// Stuhl mit geblümtem Rücken (cremefarbener Sitz) – von vorne/hinten gesehen
function flowerChair(c, x, y, back) {
  rrPath(c, x - 13, y - 6, 26, 12, 4); fs(c, '#e9dfc4', 2.5);
  line(c, x - 10, y + 6, x - 11, y + 18, 2.5, '#343a40', false); line(c, x + 10, y + 6, x + 11, y + 18, 2.5, '#343a40', false);
  if (back) { rrPath(c, x - 13, y - 32, 26, 28, 8); fs(c, '#f1ebdc', 2.5); for (let k = 0; k < 4; k++) { ell(c, x - 6 + (k % 2) * 11, y - 24 + Math.floor(k / 2) * 11, 3.2, 2.6); c.fillStyle = k % 3 ? '#8fa9c4' : '#e5989b'; c.fill(); } }
}
const GDRAW = {
  bar(c, d, t) {
    rrPath(c, d.x0, d.y0 + d.h - 6, d.w, 42, 4); fs(c, '#4e3b2d', 3);
    for (let x = d.x0 + 6; x < d.x0 + d.w - 6; x += 22) { rrPath(c, x, d.y0 + d.h, 18, 32, 2); c.fillStyle = (x / 22) % 2 ? '#5c4636' : '#66503f'; c.fill(); }
    rrPath(c, d.x0 - 6, d.y0, d.w + 12, d.h, 6); fs(c, '#d4a373', 3); line(c, d.x0, d.y0 + 6, d.x0 + d.w, d.y0 + 6, 2, 'rgba(255,255,255,.35)', false);
    // Zapfanlage, Kasse, Gläser, Zitronen
    rrPath(c, d.x0 + 40, d.y0 - 30, 50, 34, 6); fs(c, '#ced4da', 2.5); for (let k = 0; k < 3; k++) { rrPath(c, d.x0 + 48 + k * 14, d.y0 - 44, 6, 16, 3); fs(c, '#212529', 1.5); }
    rrPath(c, d.x0 + 330, d.y0 - 26, 50, 30, 4); fs(c, '#212529', 2.5); rrPath(c, d.x0 + 336, d.y0 - 20, 38, 14, 2); c.fillStyle = '#4dabf7'; c.fill();
    for (let k = 0; k < 5; k++) drawGlass(c, d.x0 + 140 + k * 26, d.y0 + 20, 0.36, k % 2 ? 0.6 : 0, ['#ff9f1c', '#e63946', '#ffd166', '#06d6a0', '#f4a261'][k]);
    ell(c, d.x0 + 290, d.y0 + 14, 18, 8); fs(c, '#fff', 2); for (let k = 0; k < 4; k++) { ell(c, d.x0 + 282 + (k % 2) * 14, d.y0 + 10 + Math.floor(k / 2) * 6, 5, 4); c.fillStyle = '#ffd60a'; c.fill(); }
    rrPath(c, d.x0 + 410, d.y0 - 18, 26, 22, 6); fs(c, '#c1121f', 2); leaf(c, d.x0 + 423, d.y0 - 7, 0.4, '#fff');
  },
  hocker(c, d) {
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 16, 5); c.fill();
    line(c, d.x - 11, d.y, d.x - 8, d.y - 30, 3, '#212529', false); line(c, d.x + 11, d.y, d.x + 8, d.y - 30, 3, '#212529', false); line(c, d.x - 10, d.y - 12, d.x + 10, d.y - 12, 2, '#212529', false);
    rrPath(c, d.x - 13, d.y - 38, 26, 10, 4); fs(c, '#343a40', 2.5);
    line(c, d.x - 11, d.y - 38, d.x - 11, d.y - 66, 3, '#212529'); line(c, d.x + 11, d.y - 38, d.x + 11, d.y - 66, 3, '#212529'); line(c, d.x - 11, d.y - 40, d.x + 11, d.y - 64, 2.5, '#212529', false); line(c, d.x + 11, d.y - 40, d.x - 11, d.y - 64, 2.5, '#212529', false);
  },
  treppe(c, d) {
    // Holzstufen mit Stahlwangen, unten breit, oben schmaler (läuft nach hinten zur Empore)
    const n = 11;
    for (let k = n - 1; k >= 0; k--) { const y = d.y0 + 20 + k * (d.h - 30) / n, sh = 1 - (n - 1 - k) * 0.025, w = d.w * sh, x = d.x0 + (d.w - w) / 2;
      rrPath(c, x, y, w, 18, 3); fs(c, k % 2 ? '#c08b55' : '#b07d4b', 2.5); line(c, x + 4, y + 4, x + w - 4, y + 4, 1.5, 'rgba(255,255,255,.3)', false); }
    for (const sx of [0, 1]) { const x0 = d.x0 + (sx ? d.w - 4 : 4); line(c, x0, d.y0 + d.h, x0 + (sx ? -8 : 8), d.y0 - 120, 7, '#868e96'); for (let k = 0; k < 9; k++) line(c, x0 + (sx ? -1 : 1) * k, d.y0 + d.h - k * 44, x0 + (sx ? -1 : 1) * k, d.y0 + d.h - k * 44 - 60, 2, '#adb5bd', false); line(c, x0, d.y0 + d.h - 60, x0 + (sx ? -8 : 8), d.y0 - 180, 3.5, '#6c757d'); }
    // Lichterkette mit Sternen am Geländer
    for (let k = 0; k < 7; k++) { const y = d.y0 + d.h - 70 - k * 50; ell(c, d.x0 + d.w + 2, y, 3.5, 4.5); c.fillStyle = '#ffe066'; c.fill(); }
  },
  kuebel(c, d) {
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 30, 8); c.fill();
    polyPath(c, [[d.x - 26, d.y - 40], [d.x + 26, d.y - 40], [d.x + 20, d.y], [d.x - 20, d.y]]); fs(c, '#adb5bd', 3); line(c, d.x - 22, d.y - 34, d.x + 22, d.y - 34, 2, 'rgba(255,255,255,.35)', false);
    line(c, d.x, d.y - 40, d.x - 2, d.y - 70, 4, '#6f4e37');
    for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * 0.4; ell(c, d.x + Math.cos(a) * 22, d.y - 78 + Math.sin(a) * 16, 12, 9); fs(c, k % 2 ? '#8a9a5b' : '#a3b18a', 2); }
  },
  yuccatopf(c, d, t) {
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 26, 7); c.fill();
    rrPath(c, d.x - 20, d.y - 34, 40, 34, 6); fs(c, '#343a40', 3);
    line(c, d.x, d.y - 34, d.x + 4, d.y - 90, 7, '#8d5a3b');
    for (let k = 0; k < 14; k++) { const a = -Math.PI / 2 + (k - 6.5) * 0.24, L2 = 36 + (k % 3) * 8; c.beginPath(); c.moveTo(d.x + 4, d.y - 92); c.lineTo(d.x + 4 + Math.cos(a) * L2, d.y - 92 + Math.sin(a) * L2 * 0.9); c.lineWidth = 5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3; c.strokeStyle = k % 2 ? '#52b788' : '#74c69d'; c.stroke(); }
  },
  palme(c, d, t) {
    // Hanfpalme: faseriger Stamm, Fächerblätter oben
    c.fillStyle = 'rgba(0,0,0,.22)'; ell(c, d.x, d.y + 2, 30, 9); c.fill();
    ell(c, d.x, d.y - 2, 26, 9); fs(c, '#6f4e37', 2.5);
    const H = 250;
    c.beginPath(); c.moveTo(d.x - 14, d.y - 4); c.quadraticCurveTo(d.x - 10, d.y - H * 0.5, d.x - 8, d.y - H); c.lineTo(d.x + 8, d.y - H); c.quadraticCurveTo(d.x + 12, d.y - H * 0.5, d.x + 14, d.y - 4); c.closePath(); fs(c, '#8d6346', 3);
    for (let y = d.y - 12; y > d.y - H; y -= 9) { line(c, d.x - 12, y, d.x + 12, y - 5, 2, 'rgba(60,35,20,.45)', false); line(c, d.x - 11, y - 4, d.x + 2, y + 2, 1.5, 'rgba(200,160,110,.35)', false); }
    const fan = (a, len) => { c.save(); c.translate(d.x, d.y - H); c.rotate(a); line(c, 0, 0, len, 0, 3, '#5f7d3a', false);
      for (let m = -6; m <= 6; m++) { c.beginPath(); c.moveTo(len, 0); c.lineTo(len + Math.cos(m * 0.16) * 46, Math.sin(m * 0.16) * 46); c.lineWidth = 6; c.strokeStyle = OL; c.stroke(); c.lineWidth = 4; c.strokeStyle = m % 2 ? '#4f8a3a' : '#6aa84f'; c.stroke(); } c.restore(); };
    for (let k = 0; k < 9; k++) fan(-Math.PI / 2 + (k - 4) * 0.42, 38 + (k % 2) * 10);
    ell(c, d.x, d.y - H, 12, 10); fs(c, '#6f4e37', 2);
  },
  palmtisch(c, d, t) {
    // Palme mitten im Raum mit rundem Holz-Ablagetisch um den Stamm (Foto)
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 4, 66, 18); c.fill();
    line(c, d.x - 30, d.y - 4, d.x - 34, d.y - 52, 4, '#6f4e37', false); line(c, d.x + 30, d.y - 4, d.x + 34, d.y - 52, 4, '#6f4e37', false);
    GDRAW.palme(c, { x: d.x, y: d.y - 2 }, t);
    ell(c, d.x, d.y - 54, 62, 18); fs(c, '#c08b55', 3); ell(c, d.x, d.y - 54, 18, 7); fs(c, '#8d6346', 2);
    drawGlass(c, d.x - 36, d.y - 50, 0.32, 0.5, '#e63946'); drawGlass(c, d.x + 40, d.y - 52, 0.32, 0.7, '#ffd166');
  },
  tisch4(c, d) {
    const x = d.x, y = d.y0 + 26;
    c.fillStyle = 'rgba(0,0,0,.18)'; ell(c, x, d.y0 + d.h, 62, 12); c.fill();
    flowerChair(c, x - 24, y - 20, true); flowerChair(c, x + 24, y - 20, true);
    (d.seat || []).slice(0, 2).forEach((id, k) => drawPerson(c, id, x + (k ? 24 : -24), y - 12, 0.95, 0, { sit: true, noShadow: true }));
    line(c, x - 40, y + 10, x - 40, y + 36, 4, '#212529', false); line(c, x + 40, y + 10, x + 40, y + 36, 4, '#212529', false);
    rrPath(c, x - 52, y - 14, 104, 30, 4); fs(c, '#d4b07a', 3); line(c, x - 48, y - 8, x + 48, y - 8, 1.5, 'rgba(255,255,255,.35)', false);
    rrPath(c, x - 8, y - 20, 16, 12, 3); fs(c, '#fff', 2); ell(c, x, y - 24, 6, 5); fs(c, '#74c69d', 1.5);
    rrPath(c, x + 18, y - 22, 12, 14, 2); fs(c, '#fbf8f2', 1.5);
    flowerChair(c, x - 24, y + 34, false); flowerChair(c, x + 24, y + 34, false);
    rrPath(c, x - 37, y + 20, 26, 22, 8); fs(c, '#f1ebdc', 2.5); rrPath(c, x + 11, y + 20, 26, 22, 8); fs(c, '#f1ebdc', 2.5);
    for (let k = 0; k < 2; k++) { ell(c, x - 24 + k * 48, y + 30, 3, 2.5); c.fillStyle = '#8fa9c4'; c.fill(); }
  },
  tafel(c, d) {
    // lange weiße Tafel: stehende Servietten, Weingläser, Blumenkiste, Laterne; graue Stoffstühle
    for (let k = 0; k < 6; k++) { const x = d.x0 + 30 + k * 68; rrPath(c, x - 14, d.y0 - 30, 28, 28, 8); fs(c, k % 3 === 1 ? '#e9c46a' : '#6c757d', 2.5); c.save(); rrPath(c, x - 14, d.y0 - 30, 28, 28, 8); c.clip(); c.fillStyle = 'rgba(255,255,255,.12)'; for (let m = -3; m < 4; m++) c.fillRect(x + m * 5, d.y0 - 30, 2, 28); c.restore(); }
    rrPath(c, d.x0, d.y0, d.w, d.h, 5); fs(c, '#d4b07a', 3); rrPath(c, d.x0 + 6, d.y0 + 4, d.w - 12, d.h - 8, 3); fs(c, '#fbfbf7', 2);
    rrPath(c, d.x0 + 6, d.y0 + d.h / 2 - 8, d.w - 12, 16, 2); c.fillStyle = '#c8a27a'; c.fill();
    line(c, d.x0 + 14, d.y0 + d.h, d.x0 + 14, d.y0 + d.h + 26, 4, '#212529', false); line(c, d.x0 + d.w - 14, d.y0 + d.h, d.x0 + d.w - 14, d.y0 + d.h + 26, 4, '#212529', false);
    for (let k = 0; k < 6; k++) { const x = d.x0 + 30 + k * 68; polyPath(c, [[x - 10, d.y0 + 12], [x + 10, d.y0 + 12], [x, d.y0 - 14]]); fs(c, '#f1f3f5', 2); drawGlass(c, x + 18, d.y0 + 16, 0.28, 0, '#fff'); }
    rrPath(c, d.x + 20, d.y0 + 4, 50, 18, 3); fs(c, '#8d5a3b', 2); for (let k = 0; k < 6; k++) { ell(c, d.x + 26 + k * 8, d.y0 + 2 - (k % 2) * 3, 5, 5); c.fillStyle = k % 2 ? '#c77dff' : '#f8f9fa'; c.fill(); }
    rrPath(c, d.x - 60, d.y0 - 10, 18, 26, 4); fs(c, '#343a40', 2); ell(c, d.x - 51, d.y0 + 3, 4, 6); c.fillStyle = '#ffd166'; c.fill();
    for (let k = 0; k < 6; k++) { const x = d.x0 + 30 + k * 68; rrPath(c, x - 14, d.y0 + d.h + 4, 28, 24, 8); fs(c, k % 3 === 2 ? '#e9c46a' : '#6c757d', 2.5); }
  },
  olive(c, d, t) {
    // alter Olivenbaum mit knorrigem Doppelstamm, Holz-Rundbank darum
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 4, 74, 20); c.fill();
    ell(c, d.x, d.y - 8, 66, 22); fs(c, '#8d5a3b', 3); ell(c, d.x, d.y - 14, 54, 16); fs(c, '#6f4e37', 2); ell(c, d.x, d.y - 16, 46, 12); c.fillStyle = '#5c4033'; c.fill();
    for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; rrPath(c, d.x + Math.cos(a) * 58 - 6, d.y - 8 + Math.sin(a) * 18 - 28, 12, 28, 3); if (Math.sin(a) > -0.2) fs(c, '#a0673a', 2); }
    c.beginPath(); c.moveTo(d.x - 20, d.y - 16); c.bezierCurveTo(d.x - 34, d.y - 60, d.x + 10, d.y - 80, d.x - 18, d.y - 140); c.lineTo(d.x - 4, d.y - 140); c.bezierCurveTo(d.x + 18, d.y - 90, d.x - 14, d.y - 60, d.x + 2, d.y - 16); c.closePath(); fs(c, '#7f7364', 3);
    c.beginPath(); c.moveTo(d.x + 2, d.y - 16); c.bezierCurveTo(d.x + 30, d.y - 70, d.x - 4, d.y - 90, d.x + 24, d.y - 150); c.lineTo(d.x + 38, d.y - 146); c.bezierCurveTo(d.x + 14, d.y - 96, d.x + 44, d.y - 64, d.x + 22, d.y - 16); c.closePath(); fs(c, '#8c8070', 3);
    for (let k = 0; k < 4; k++) line(c, d.x - 8 + k * 9, d.y - 40 - k * 12, d.x - 2 + k * 9, d.y - 60 - k * 12, 1.5, 'rgba(50,40,30,.5)', false);
    const blobs = [[-70, -170, 44], [-20, -200, 50], [40, -190, 48], [80, -160, 40], [-40, -140, 40], [20, -150, 44], [-90, -130, 30], [96, -120, 28]];
    blobs.forEach(([dx, dy, rr], i) => { ell(c, d.x + dx, d.y + dy, rr, rr * 0.8); fs(c, i % 2 ? '#8a9a5b' : '#7d8d52', 3); });
    blobs.forEach(([dx, dy, rr]) => { for (let m = 0; m < 7; m++) { ell(c, d.x + dx + Math.cos(m * 1.7) * rr * 0.55, d.y + dy + Math.sin(m * 1.7) * rr * 0.45, 6, 2.5, m); c.fillStyle = m % 2 ? '#b5c99a' : '#c8d5b9'; c.fill(); } });
  },
  servierwagen(c, d) {
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 34, 9); c.fill();
    for (let k = 0; k < 2; k++) { rrPath(c, d.x - 30, d.y - 48 + k * 28, 60, 12, 3); fs(c, '#c08b55', 2.5); }
    line(c, d.x - 28, d.y - 50, d.x - 28, d.y, 3, '#6f4e37'); line(c, d.x + 28, d.y - 50, d.x + 28, d.y, 3, '#6f4e37'); line(c, d.x + 28, d.y - 50, d.x + 34, d.y - 64, 3, '#6f4e37');
    for (let k = 0; k < 3; k++) { ell(c, d.x - 16 + k * 16, d.y - 52, 10, 4); fs(c, '#fff', 2); }
    ell(c, d.x - 24, d.y + 2, 4, 4); fs(c, '#343a40', 1.5); ell(c, d.x + 24, d.y + 2, 4, 4); fs(c, '#343a40', 1.5);
  },
  fass(c, d) {
    c.fillStyle = 'rgba(0,0,0,.22)'; ell(c, d.x, d.y + 2, 34, 9); c.fill();
    c.beginPath(); c.moveTo(d.x - 24, d.y - 4); c.quadraticCurveTo(d.x - 32, d.y - 34, d.x - 24, d.y - 64); c.lineTo(d.x + 24, d.y - 64); c.quadraticCurveTo(d.x + 32, d.y - 34, d.x + 24, d.y - 4); c.closePath(); fs(c, '#8d5a3b', 3);
    for (let k = -2; k <= 2; k++) line(c, d.x + k * 10, d.y - 62, d.x + k * 11, d.y - 6, 1.5, 'rgba(60,35,20,.4)', false);
    for (const y of [-14, -54]) { c.beginPath(); c.moveTo(d.x - 28, d.y + y); c.quadraticCurveTo(d.x, d.y + y + 6, d.x + 28, d.y + y); c.lineWidth = 4; c.strokeStyle = '#495057'; c.stroke(); }
    ell(c, d.x, d.y - 64, 24, 7); fs(c, '#a0673a', 2.5);
    for (let k = 0; k < 9; k++) { ell(c, d.x - 18 + (k % 5) * 9, d.y - 74 - Math.floor(k / 5) * 9, 6, 6); fs(c, ['#c77dff', '#f8f9fa', '#9b5de5'][k % 3], 1.5); }
    for (let k = 0; k < 5; k++) line(c, d.x - 14 + k * 7, d.y - 66, d.x - 18 + k * 9, d.y - 92, 1.5, '#52b788', false);
  },
};
function buildGridGastraum() {
  cellsIn(58, 180, 942, 1334, i => (G0[i] = 1));
  cellsIn(455, 1320, 545, 1345, i => (G0[i] = 1));
  for (const d of GDECOR) {
    if (d.w) cellsIn(d.x0 - 4, d.y0 - 4, d.x0 + d.w + 4, d.y0 + d.h + (d.t === 'tafel' || d.t === 'tisch4' ? 30 : 26), i => (G0[i] = 0));
    else if (d.r) cellsCircle(d.x, d.y - 6, Math.max(8, d.r - 6), i => (G0[i] = 0));
  }
}
// Verstecke an den Möbeln: auf der Bar, unter Tischen und der langen Tafel, hinter Palmenstämmen, in Kübeln und im Weinfass,
// auf dem Servierwagen und dem Palmentisch, unter der Treppe, in der Rundbank der Olivenbäume
const GSPOTS = [
  furnSpot(GDECOR, 'bar', 'on', { px: 505, py: 180, sx: 548, sy: 262, sz: 0.6, tag: 'r' }),
  furnSpot(GDECOR, 'bar', 'on', { px: 150, py: 178, sx: 166, sy: 300, sz: 0.6, tag: 'l' }),
  furnSpot(GDECOR, 'treppe', 'left', { px: 772, py: 404, sx: 735, sy: 440 }),
  furnSpot(GDECOR, 'kuebel2', 'top', { px: 592, py: 262, sx: 580, sy: 345 }),
  furnSpot(GDECOR, 'yucca', 'top', { px: 700, py: 300, sx: 676, sy: 372 }),
  furnSpot(GDECOR, 'palmtisch', 'on', { px: 470, py: 420, sx: 500, sy: 545, sz: 0.58 }),
  furnSpot(GDECOR, 'palme1', 'right', { px: 108, py: 470, sx: 140, sy: 535 }),
  furnSpot(GDECOR, 'palme2', 'left', { px: 892, py: 560, sx: 860, sy: 625 }),
  furnSpot(GDECOR, 'palme3', 'right', { px: 108, py: 960, sx: 140, sy: 1025 }),
  furnSpot(GDECOR, 'palme4', 'left', { px: 892, py: 1050, sx: 860, sy: 1115 }),
  furnSpot(GDECOR, 'tisch1', 'top', { px: 286, py: 530, sx: 250, sy: 590 }),
  furnSpot(GDECOR, 'tisch2', 'top', { px: 736, py: 530, sx: 700, sy: 590 }),
  furnSpot(GDECOR, 'tisch3', 'top', { px: 296, py: 1020, sx: 260, sy: 1080 }),
  furnSpot(GDECOR, 'tisch4', 'top', { px: 704, py: 1020, sx: 740, sy: 1080 }),
  furnSpot(GDECOR, 'olive1', 'top', { px: 342, py: 768, sx: 310, sy: 842 }),
  furnSpot(GDECOR, 'olive2', 'top', { px: 658, py: 768, sx: 690, sy: 842 }),
  furnSpot(GDECOR, 'wagen', 'on', { px: 168, py: 694, sx: 160, sy: 762, sz: 0.55 }),
  furnSpot(GDECOR, 'tafel', 'top', { px: 600, py: 1226, sx: 600, sy: 1290 }),
  furnSpot(GDECOR, 'tafel', 'on', { px: 420, py: 1192, sx: 420, sy: 1290, sz: 0.55, tag: 'tisch' }),
  furnSpot(GDECOR, 'kuebel1', 'top', { px: 162, py: 1248, sx: 205, sy: 1300 }),
  furnSpot(GDECOR, 'fass', 'top', { px: 866, py: 1216, sx: 810, sy: 1300 }),
];
// Leinen-Serviette (weiß, grünes Blatt) – darunter guckt etwas hervor
function drawNapkin(c, x, y, w, seed = 0) {
  c.save(); c.translate(x, y); c.rotate(((seed * 37) % 7 - 3) * 0.06);
  c.beginPath(); c.moveTo(-w, -w * 0.12); c.quadraticCurveTo(-w * 0.2, -w * 0.4, w * 0.3, -w * 0.28); c.quadraticCurveTo(w * 0.85, -w * 0.3, w, -w * 0.05); c.lineTo(w * 0.85, w * 0.32); c.quadraticCurveTo(0, w * 0.44, -w * 0.9, w * 0.3); c.closePath();
  fs(c, '#fbfbf7', 2.5); line(c, -w * 0.7, w * 0.05, w * 0.6, -w * 0.08, 1.5, 'rgba(0,0,0,.12)', false); line(c, -w * 0.2, -w * 0.3, -w * 0.05, w * 0.36, 1.5, 'rgba(0,0,0,.1)', false);
  leaf(c, w * 0.55, w * 0.12, 0.35, BRAND.lime);
  c.restore();
}
const GJUNK = {
  korken(c) { c.rotate(0.4); rrPath(c, -8, -9, 16, 12, 4); fs(c, '#d4a373', 2); for (let k = 0; k < 4; k++) { ell(c, -5 + k * 3.5, -4 + (k % 2) * 2, 1, 1); c.fillStyle = 'rgba(90,60,30,.6)'; c.fill(); } },
  zucker(c) { c.rotate(-0.3); rrPath(c, -10, -9, 20, 10, 2); fs(c, '#fff', 2); line(c, -6, -4, 6, -4, 1.5, '#95C11F', false); },
  strohhalm(c) { c.rotate(-0.5); line(c, -12, -3, 12, -3, 3.5, '#e63946'); line(c, -6, -3, -2, -3, 3.5, '#fff', false); line(c, 4, -3, 8, -3, 3.5, '#fff', false); },
};
STAGE_DEFS.gastraum = {
  id: 'gastraum', bg: '#7a4a35', start: { x: 650, y: 380 }, gate: { x: 500, y: 1392, ix: 500, iy: 1320 },
  npcs: [
    { id: 'g_rosi', pos: [[420, 1300], [600, 1300], [200, 1185]] },
    { id: 'g_becker', pos: [[250, 615], [845, 760], [420, 930]] },
    { id: 'g_lina', pos: [[500, 900], [170, 880], [850, 930]] },
    { id: 'g_schulz', pos: [[740, 1110], [260, 1110], [860, 1210]] },
    { id: 'g_ben', pos: [[300, 305], [450, 305], [175, 305]] },
  ],
  decor: GDECOR, spots: GSPOTS, grid: buildGridGastraum, ground: drawGroundGastraum, decorDraw: GDRAW,
  feat: { swing: false, slide: false, house: false, racer: false, pigeons: false, waiter: false, dig: false },
  junk: ['korken', 'zucker', 'strohhalm'], junkDraw: GJUNK, items: GAST_ITEMS, cover: drawNapkin,
  drawGate: drawKitchenDoor, gateName: 'Die Küchentür', dialogGate: 0.58, gateFace: (c, x, y, s, t) => drawKitchenDoor(c, x, y, s * 0.42, 0, true, t),
  words: { one: 'Gast', the: 'den Gast', a: 'einen Gast', many: 'Gäste', dat: 'Gästen', back: 'zum Gast', each: 'Jeder Gast',
    hide: 'unter Tischen, auf der Bar, hinter Palmen und in Kübeln und im Weinfass', junk: 'ein Korken oder ein Strohhalm', gate: 'an der Tür zur Küche', gateTap: 'Lauf zur Küchentür und tippe sie an!',
    opened: 'Die Küchentür ist offen!',
    lock: 'Die Küchentür geht erst auf, wenn du allen fünf Gästen geholfen hast.',
    progress: 'Dir fehlen noch ein paar Sachen, oben siehst du welche. Schau unter die Tische, auf die Bar und hinter die Palmen!',
    gateAsk: 'Die Küchentür klemmt! Bring mir diese Sachen, dann geht sie auf und du kommst in die Küche.',
    search: 'Schau unter Tische und hinter Palmen – dann tippe auf die Lupe!' },
  pools: {
    easy: ['servietten', 'tablett', 'fliegen', 'musikbox', 'einschenken', 'sonnenstrahl', 'tisch', 'bestellung', 'memory', 'sort', 'size_row', 'count_easy', 'cups', 'stack', 'findall', 'shadow', 'trace', 'maze_easy', 'connect', 'color', 'pop', 'giessen'],
    puzzle: ['sonnenstrahl', 'servietten', 'bestellung', 'tisch', 'sequence', 'diff', 'lights', 'mirror', 'rotimg', 'pattern', 'pairs', 'nextrow', 'count', 'puzzle', 'maze', 'shell'],
    std: ['tablett', 'fliegen', 'einschenken', 'musikbox', 'collect'],
    sp: ['tablett', 'musikbox', 'run', 'balance_walk'],
    hard: ['jump', 'platform', 'run'],
  },
  extras(play) {
    // Kellnerin Sophie läuft mit Tablett ihre Runde, Barkeeper Jonas poliert Gläser, Lichterketten schaukeln
    const route = [[650, 360], [620, 660], [500, 700], [500, 1110], [860, 1150], [850, 880], [620, 660]];
    const S = { x: 650, y: 360, i: 1, pause: 0, dir: 1 };
    return {
      update(dt) {
        const p = play.p, near = dist(p.x, p.y, S.x, S.y) < 60;
        if (S.pause > 0) { S.pause -= dt; return; }
        if (near) return;   // wartet höflich, wenn man im Weg steht
        const [tx, ty] = route[S.i], d = dist(S.x, S.y, tx, ty), s = 70 * dt;
        if (d <= s) { S.x = tx; S.y = ty; S.i = (S.i + 1) % route.length; if (S.i === 0) S.i = 1; if (Math.random() < 0.4) S.pause = 1.2; } else { S.x += (tx - S.x) / d * s; S.y += (ty - S.y) / d * s; S.dir = tx > S.x ? 1 : -1; }
      },
      draw(c, L, vis, t) {
        if (vis(S.x, S.y)) L.push({ y: S.y, f: () => { drawPerson(c, 'g_sophie', S.x, S.y, 1.05, t * 2, { ph: 1 }); c.save(); c.translate(S.x + 18, S.y - 46); ell(c, 0, 0, 20, 6); fs(c, '#adb5bd', 2.5); drawFood(c, FOOD6[Math.floor(t / 8) % 6], 0, -6, 26); c.restore(); } });
        const jx = 300 + Math.sin(t * 0.4) * 170;
        if (vis(jx, 150)) L.push({ y: 150, f: () => { drawPerson(c, 'g_jonas', jx, 150, 1.05, t, { sit: true, noShadow: true }); drawGlass(c, jx + 16, 112 + Math.sin(t * 6) * 3, 0.35, 0, '#fff'); } });
        L.push({ y: 99999, f: () => {
          c.save(); c.globalAlpha = 0.95;
          for (const [y0, ph] of [[300, 0], [560, 1], [840, 2], [1120, 3]]) {
            const sag = 34 + Math.sin(t * 0.9 + ph) * 4, yy = y0 - 170;
            c.beginPath(); c.moveTo(52, yy); c.quadraticCurveTo(500, yy + sag * 2, 948, yy); c.lineWidth = 1.5; c.strokeStyle = 'rgba(40,30,20,.6)'; c.stroke();
            for (let k = 1; k < 18; k++) { const u = k / 18, bx = 52 + 896 * u, by = yy + sag * 2 * 2 * u * (1 - u) + 6; if (!vis(bx, by + 170)) continue; line(c, bx, by - 6, bx, by, 1, 'rgba(40,30,20,.6)', false); ell(c, bx, by + 4, 4, 5.5); c.fillStyle = `rgba(255,214,110,${0.75 + 0.25 * Math.sin(t * 2 + k + ph)})`; c.fill(); ell(c, bx, by + 4, 10, 10); c.fillStyle = 'rgba(255,200,90,.12)'; c.fill(); }
          }
          c.restore();
        } });
      },
    };
  },
};
