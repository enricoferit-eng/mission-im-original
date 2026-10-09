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
// Aufbau wie auf dem Luftbild (gedreht, Glashaus-Wand oben): Pavillon mit Glasdach direkt vor dem Glashaus (orange – weiß – orange),
// darunter links der eingezäunte Spielplatz (Hackschnitzel, Schaukel, Turm mit Rutsche), rechts Rasen; rechts Zypressenreihe,
// in der Mitte der geschwungene Kiesweg, Bäume, unten rechts die Holzhütte (Chalet), unten links der Wendehammer mit Autos.
const PAV = { x0: 200, x1: 840, y0: 150, y1: 470, H: 150, secs: [[200, 450, '#f26b3a'], [450, 590, '#f1ebdc'], [590, 840, '#f26b3a']] };
const PLAY = { x0: 0, x1: 490, y0: 535, y1: 905 };
const CIRC = { x: 150, y: 1330, r: 330 };
function drawGroundAussen(g, R) {
  lawn(g, 0, 0, WORLD_W, WORLD_H, R);
  // oben links: Parkplatz neben dem Glashaus
  g.fillStyle = '#7d8489'; g.fillRect(0, 0, 150, 160); for (let i = 0; i < 900; i++) { g.fillStyle = i % 2 ? '#868d92' : '#737a7f'; g.fillRect(R() * 150, R() * 160, 2, 2); }
  // Glashaus-Front: Glas, Stahlrahmen, offene Falttüren in der Mitte
  const sky = g.createLinearGradient(0, 0, 0, 150); sky.addColorStop(0, '#a5d8ff'); sky.addColorStop(1, '#e7f5ff'); g.fillStyle = sky; g.fillRect(150, 0, WORLD_W - 150, 150);
  for (let x = 170; x < WORLD_W; x += 125) { g.fillStyle = 'rgba(60,110,70,.4)'; ell(g, x + 60, 120, 40, 22); g.fill(); line(g, x + 40, 120, x + 46, 60, 4, 'rgba(80,60,40,.5)', false); for (let k = 0; k < 6; k++) { const a2 = -Math.PI / 2 + (k - 2.5) * 0.5; line(g, x + 46, 60, x + 46 + Math.cos(a2) * 30, 60 + Math.sin(a2) * 26, 3, 'rgba(70,120,60,.5)', false); } }
  g.strokeStyle = '#495057'; g.lineWidth = 5; for (let x = 150; x <= WORLD_W; x += 62) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 150); g.stroke(); } g.beginPath(); g.moveTo(150, 50); g.lineTo(WORLD_W, 50); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 170; x < WORLD_W; x += 186) { polyPath(g, [[x, 150], [x + 30, 150], [x + 90, 0], [x + 60, 0]]); g.fill(); }
  g.fillStyle = '#d27d55'; g.fillRect(430, 60, 140, 90);
  for (let k = 0; k < 3; k++) { rrPath(g, 380 + k * 12, 50, 12, 100, 2); fs(g, 'rgba(200,230,245,.9)', 2.5); rrPath(g, 584 + k * 12, 50, 12, 100, 2); fs(g, 'rgba(200,230,245,.9)', 2.5); }
  g.fillStyle = '#495057'; g.fillRect(150, 146, WORLD_W - 150, 8); g.fillRect(146, 0, 8, 154);
  // Pflaster unter und vor dem Pavillon (wie auf dem Foto: graue Betonpflaster im Verband)
  g.save(); g.beginPath(); g.rect(158, 154, 732, 372); g.clip();
  g.fillStyle = '#8a7f78'; g.fillRect(158, 154, 732, 372);
  for (let y = 154, k = 0; y < 530; y += 18, k++) for (let x = 158 - (k % 2) * 18; x < 890; x += 36) { g.fillStyle = ['#9c918a', '#a69b93', '#938880', '#ada39b'][Math.floor(R() * 4)]; g.fillRect(x + 1, y + 1, 34, 16); }
  for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(255,255,255,.05)'; ell(g, 158 + R() * 732, 154 + R() * 372, 60, 30); g.fill(); }
  g.restore(); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(158, 524, 732, 4);
  // Schatten des Pavillondachs (Sonne von links oben)
  g.fillStyle = 'rgba(70,30,15,.12)'; g.fillRect(PAV.x0 + 30, PAV.y0 + 20, PAV.x1 - PAV.x0, PAV.y1 - PAV.y0 - 10);
  // Spielplatz (eingezäunt): Hackschnitzel
  g.save(); g.beginPath(); g.rect(PLAY.x0, PLAY.y0, PLAY.x1 - PLAY.x0, PLAY.y1 - PLAY.y0); g.clip();
  g.fillStyle = CHIP_BASE; g.fillRect(PLAY.x0, PLAY.y0, PLAY.x1 - PLAY.x0, PLAY.y1 - PLAY.y0);
  for (let i = 0; i < 5000; i++) { g.fillStyle = CHIP_COLS[i % 6]; ell(g, R() * PLAY.x1, PLAY.y0 + R() * (PLAY.y1 - PLAY.y0), 2.2, 1.2, R() * 3); g.fill(); }
  g.restore();
  // Wendehammer unten links (Asphalt) mit Bordstein + Hecke
  g.save(); ell(g, CIRC.x, CIRC.y, CIRC.r, CIRC.r); g.clip(); g.fillStyle = '#7d8489'; g.fillRect(0, 900, 520, 500); for (let i = 0; i < 4000; i++) { g.fillStyle = i % 2 ? '#868d92' : '#737a7f'; g.fillRect(R() * 520, 960 + R() * 440, 2, 2); } g.restore();
  for (let a2 = -Math.PI; a2 < 0.2; a2 += 0.09) { const x = CIRC.x + Math.cos(a2) * (CIRC.r + 12), y = CIRC.y + Math.sin(a2) * (CIRC.r + 12); if (y > 1400 || x < -20) continue; ell(g, x, y, 20, 16); fs(g, (a2 * 10 | 0) % 2 ? '#2d6a4f' : '#40916c', 2); }
  // geschwungener Kiesweg vom Pavillon zum Gartentor + Abzweig zur Hütte
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const path = (w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(700, 520); g.bezierCurveTo(820, 640, 560, 820, 640, 1000); g.bezierCurveTo(700, 1140, 730, 1250, 720, 1400); g.stroke(); g.beginPath(); g.moveTo(660, 1060); g.quadraticCurveTo(780, 1100, 860, 1170); g.stroke(); };
  path(84, '#c8bfae'); path(74, '#e3dccd'); g.restore();
  for (let i = 0; i < 900; i++) { const u = R(), x = 640 + (R() - 0.5) * 60, y = 560 + u * 820; }
  // Zypressen-Schatten + kleine Blumenrabatte vor den Zypressen
  for (let y = 210; y < 500; y += 80) { ell(g, 925, y + 8, 30, 10); g.fillStyle = 'rgba(0,0,0,.18)'; g.fill(); }
}
const AGATE = { x: 720, y: 1392, ix: 720, iy: 1320 };
const ADECOR = [
  { id: 'topf1', t: 'blumentopf', x: 430, y: 192, r: 18, bb: [400, 132, 60, 66] },
  { id: 'topf2', t: 'blumentopf', x: 570, y: 192, r: 18, bb: [540, 132, 60, 66] },
  { id: 'olive1', t: 'oliventopf', x: 180, y: 240, r: 26, bb: [110, 90, 140, 156] },
  { id: 'olive2', t: 'oliventopf', x: 875, y: 515, r: 26, bb: [805, 365, 140, 156] },
  { id: 'kissenbox', t: 'kissenbox', x: 850, y: 235, r: 28, bb: [800, 170, 100, 70] },
  ...[[300, 250], [520, 250], [740, 250], [300, 400], [520, 400], [740, 400]].map(([x, y], i) => ({ id: 'tisch' + (i + 1), t: 'pavtisch', x, y: y + 34, cy: y, x0: x - 54, y0: y - 30, w: 108, h: 38, bb: [x - 70, y - 70, 140, 120] })),
  ...[[200, 310], [450, 310], [590, 310], [840, 310], [200, 470], [450, 470], [590, 470], [840, 470]].map(([x, y], i) => ({ id: 'pf' + i, t: 'pfosten', x, y, r: 9, bb: [x - 14, y - PAV.H - 12, 28, PAV.H + 20] })),
  { id: 'lounge', t: 'lounge', x: 185, y: 410, r: 18, bb: [155, 350, 60, 66] },
  ...[220, 300, 380, 460].map((y, i) => ({ id: 'cyp' + i, t: 'cypress', x: 905, y })),
  { id: 'kugel1', t: 'kugel', x: 520, y: 548, r: 14, anim: true },
  { id: 'kugel2', t: 'kugel', x: 880, y: 600, r: 14, anim: true },
  { id: 'brunnen', t: 'brunnen', x: 640, y: 700, r: 46, bb: [560, 490, 160, 220] },
  // Spielplatz-Ecke (hinter dem Zaun, gehört zum Bereich Spielplatz)
  { id: 'spielturm', t: 'spielturm', x: 120, y: 760, bb: [20, 560, 220, 210] },
  { id: 'schaukel', t: 'schaukelgerust', x: 330, y: 820, bb: [220, 640, 230, 190] },
  { id: 'schirmL1', t: 'schirmlila', x: 400, y: 600, bb: [320, 460, 160, 150] },
  { id: 'zaunP', t: 'spielzaun', x: 245, y: 905, bb: [0, 500, 500, 420] },
  { id: 'baum1', t: 'laubbaum', x: 620, y: 1010, r: 34, bb: [500, 820, 240, 200] },
  { id: 'baum2', t: 'laubbaum', x: 760, y: 900, r: 34, bb: [640, 710, 240, 200] },
  { id: 'baum3', t: 'laubbaum', x: 950, y: 820, r: 30, bb: [830, 630, 240, 200] },
  { id: 'bank', t: 'gartenbank', x: 590, y: 1150, x0: 520, y0: 1120, w: 140, h: 30, bb: [510, 1070, 160, 90] },
  { id: 'huette', t: 'huette', x: 920, y: 1330, x0: 840, y0: 1190, w: 160, h: 140, bb: [820, 1020, 200, 320] },
  { id: 'auto1', t: 'parkauto', x: 70, y: 110, cy: 60, a: 0, col: '#e9ecef', bb: [20, 0, 100, 120] },
  { id: 'auto2', t: 'parkauto', x: 90, y: 1210, cy: 1160, a: 0.4, col: '#e63946', bb: [30, 1090, 120, 130] },
  { id: 'auto3', t: 'parkauto', x: 250, y: 1290, cy: 1240, a: -0.3, col: '#343a40', bb: [190, 1170, 120, 130] },
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
Object.assign(ADRAW, {
  pavtisch(c, d) {
    // schwarzer Bistrotisch mit heller Steinplatte, Stühle aus Rattan (hell) mit schwarzen Beinen – wie auf dem Foto
    const x = d.x, y = d.cy, ch = (cx, cy, back) => { line(c, cx - 10, cy + 6, cx - 12, cy + 22, 2.5, '#212529', false); line(c, cx + 10, cy + 6, cx + 12, cy + 22, 2.5, '#212529', false); rrPath(c, cx - 14, cy - 6, 28, 13, 5); fs(c, '#c8a27a', 2.5); if (back) { c.beginPath(); c.moveTo(cx - 15, cy - 2); c.quadraticCurveTo(cx, cy - 30, cx + 15, cy - 2); c.lineWidth = 7; c.strokeStyle = OL; c.stroke(); c.lineWidth = 4.5; c.strokeStyle = '#c8a27a'; c.stroke(); for (let k = -1; k <= 1; k++) line(c, cx + k * 6, cy - 4, cx + k * 6, cy - 16, 1.2, 'rgba(110,70,30,.5)', false); } };
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, x, y + 30, 64, 12); c.fill();
    ch(x - 26, y - 22, true); ch(x + 26, y - 22, true);
    line(c, x, y + 4, x, y + 26, 4, '#212529', false); c.beginPath(); c.moveTo(x - 20, y + 30); c.quadraticCurveTo(x, y + 20, x + 20, y + 30); c.lineWidth = 3; c.strokeStyle = '#212529'; c.stroke();
    rrPath(c, x - 46, y - 14, 92, 20, 3); fs(c, '#212529', 2.5); rrPath(c, x - 44, y - 16, 88, 16, 3); fs(c, '#dee2e6', 2);
    rrPath(c, x - 6, y - 26, 12, 12, 2); fs(c, '#6c757d', 1.5); ell(c, x, y - 28, 8, 5); fs(c, '#74c69d', 1.5);
    ch(x - 26, y + 22, false); ch(x + 26, y + 22, false);
  },
  pfosten(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x + 6, d.y + 2, 12, 4); c.fill(); rrPath(c, d.x - 6, d.y - PAV.H, 12, PAV.H, 2); fs(c, '#495057', 2.5); line(c, d.x - 2, d.y - PAV.H + 4, d.x - 2, d.y - 4, 2, 'rgba(255,255,255,.25)', false); },
  lounge(c, d) {
    // bunter Streifen-Sessel (Foto)
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 22, 6); c.fill();
    line(c, d.x - 12, d.y, d.x - 10, d.y - 16, 3, '#212529', false); line(c, d.x + 12, d.y, d.x + 10, d.y - 16, 3, '#212529', false);
    c.save(); c.beginPath(); c.moveTo(d.x - 20, d.y - 14); c.quadraticCurveTo(d.x - 22, d.y - 52, d.x, d.y - 54); c.quadraticCurveTo(d.x + 22, d.y - 52, d.x + 20, d.y - 14); c.closePath(); c.clip();
    for (let k = 0; k < 12; k++) { c.fillStyle = ['#e63946', '#f8f9fa', '#457b9d', '#e9c46a', '#adb5bd', '#2a9d8f'][k % 6]; c.fillRect(d.x - 22 + k * 3.7, d.y - 56, 3.7, 44); } c.restore();
    c.beginPath(); c.moveTo(d.x - 20, d.y - 14); c.quadraticCurveTo(d.x - 22, d.y - 52, d.x, d.y - 54); c.quadraticCurveTo(d.x + 22, d.y - 52, d.x + 20, d.y - 14); c.closePath(); fs(c, null, 2.5);
  },
  spielturm(c, d) {
    // Holzturm mit Edelstahlrutsche (Blick vom Pavillon auf den Spielplatz)
    const x = d.x, y = d.y;
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, x + 20, y + 4, 70, 14); c.fill();
    for (const dx of [-36, 36]) line(c, x + dx, y, x + dx, y - 150, 8, '#8d5a3b');
    rrPath(c, x - 42, y - 90, 84, 10, 3); fs(c, '#a0673a', 2.5);
    polyPath(c, [[x - 50, y - 150], [x, y - 196], [x + 50, y - 150]]); fs(c, '#b5654a', 3);
    for (let k = 0; k < 5; k++) line(c, x - 34 + k * 17, y - 84, x - 34 + k * 17, y - 120, 2.5, '#c08b55', false);
    c.beginPath(); c.moveTo(x + 40, y - 90); c.quadraticCurveTo(x + 90, y - 60, x + 110, y - 4); c.lineWidth = 16; c.strokeStyle = OL; c.stroke(); c.lineWidth = 11; c.strokeStyle = '#ced4da'; c.stroke();
    for (let k = 0; k < 5; k++) line(c, x - 30, y - 10 - k * 16, x - 18, y - 10 - k * 16, 3, '#8d5a3b', false);
  },
  schaukelgerust(c, d, t) {
    const x = d.x, y = d.y;
    for (const dx of [-90, 90]) { line(c, x + dx - 20, y, x + dx, y - 150, 7, '#8d5a3b'); line(c, x + dx + 20, y, x + dx, y - 150, 7, '#8d5a3b'); }
    line(c, x - 96, y - 150, x + 96, y - 150, 9, '#6f4e37');
    for (const sx of [-40, 40]) { const sw = Math.sin(t * 1.6 + sx) * 6; line(c, x + sx, y - 146, x + sx + sw, y - 40, 2, '#495057', false); line(c, x + sx + 20, y - 146, x + sx + 20 + sw, y - 40, 2, '#495057', false); rrPath(c, x + sx - 4 + sw, y - 44, 28, 8, 3); fs(c, '#212529', 2); }
  },
  schirmlila(c, d, t) {
    line(c, d.x, d.y, d.x, d.y - 110, 4, '#adb5bd'); const w = Math.sin(t * 1.3) * 2;
    c.beginPath(); c.moveTo(d.x - 70, d.y - 96 + w); c.quadraticCurveTo(d.x, d.y - 150, d.x + 70, d.y - 96 - w); c.quadraticCurveTo(d.x, d.y - 112, d.x - 70, d.y - 96 + w); fs(c, '#5a3d8a', 3);
    txt(c, 'Weisse', d.x, d.y - 116, 11, '#fff', 'center', null);
  },
  spielzaun(c, d) {
    // niedriger Holzzaun um den Spielplatz (oben + rechts)
    for (let x = 6; x < PLAY.x1; x += 22) { rrPath(c, x - 3, PLAY.y0 - 24, 6, 26, 2); fs(c, '#a0673a', 1.5); }
    line(c, 0, PLAY.y0 - 16, PLAY.x1, PLAY.y0 - 16, 3, '#8d5a3b', false);
    for (let y = PLAY.y0; y < PLAY.y1; y += 22) { rrPath(c, PLAY.x1 - 3, y - 24, 6, 26, 2); fs(c, '#a0673a', 1.5); }
    line(c, PLAY.x1, PLAY.y0 - 16, PLAY.x1, PLAY.y1 - 16, 3, '#8d5a3b', false);
  },
  laubbaum(c, d) {
    c.fillStyle = 'rgba(0,0,0,.18)'; ell(c, d.x + 26, d.y + 4, 74, 26); c.fill();
    c.beginPath(); c.moveTo(d.x - 9, d.y - 4); c.quadraticCurveTo(d.x - 6, d.y - 60, d.x - 4, d.y - 90); c.lineTo(d.x + 6, d.y - 90); c.quadraticCurveTo(d.x + 8, d.y - 60, d.x + 9, d.y - 4); c.closePath(); fs(c, '#6f4e37', 2.5);
    for (const [dx, dy, rr] of [[-44, -112, 42], [34, -118, 46], [-6, -156, 48], [48, -152, 34], [-50, -150, 32]]) { ell(c, d.x + dx, d.y + dy, rr, rr * 0.85); fs(c, '#2d6a4f', 3); }
    for (let k = 0; k < 14; k++) { ell(c, d.x - 50 + (k * 37) % 100, d.y - 176 + (k * 23) % 80, 7, 5, k); c.fillStyle = k % 2 ? '#52b788' : '#40916c'; c.fill(); }
  },
  huette(c, d) {
    // die Holzhütte (Chalet) unten rechts: Bohlenwand, Satteldach, Fenster mit Läden, Wagenrad
    const x0 = d.x0, y0 = d.y0, w = d.w, h = d.h;
    rrPath(c, x0, y0, w + 10, h, 3); fs(c, '#8d5a3b', 3);
    for (let k = 0; k < 8; k++) line(c, x0 + 2, y0 + 10 + k * 16, x0 + w + 8, y0 + 10 + k * 16, 1.5, 'rgba(60,35,20,.4)', false);
    polyPath(c, [[x0 - 16, y0 + 6], [x0 + w / 2 + 5, y0 - 70], [x0 + w + 26, y0 + 6]]); fs(c, '#6c584c', 3);
    for (let k = 0; k < 5; k++) line(c, x0 - 8 + k * 8, y0 + 2 - k * 13, x0 + w + 18 - k * 8, y0 + 2 - k * 13, 1.5, 'rgba(0,0,0,.2)', false);
    rrPath(c, x0 + 26, y0 + 34, 40, 36, 3); fs(c, '#1d3557', 2.5); line(c, x0 + 46, y0 + 34, x0 + 46, y0 + 70, 2, '#5c3d2e', false); rrPath(c, x0 + 14, y0 + 32, 12, 40, 2); fs(c, '#6f4e37', 2); rrPath(c, x0 + 66, y0 + 32, 12, 40, 2); fs(c, '#6f4e37', 2);
    rrPath(c, x0 + 100, y0 + 40, 44, h - 40, 3); fs(c, '#5c3d2e', 2.5); heartPath(c, x0 + 122, y0 + 60, 6); c.fillStyle = '#c1121f'; c.fill();
    ell(c, x0 + 6, y0 + h - 34, 24, 24); c.lineWidth = 6; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3.5; c.strokeStyle = '#a0673a'; c.stroke(); for (let k = 0; k < 8; k++) { const a2 = k * TAU / 8; line(c, x0 + 6, y0 + h - 34, x0 + 6 + Math.cos(a2) * 22, y0 + h - 34 + Math.sin(a2) * 22, 1.8, '#a0673a', false); }
    rrPath(c, x0 + 40, y0 - 30, 70, 20, 4); fs(c, '#fbf8f2', 2); txt(c, 'Chalet', x0 + 75, y0 - 20, 12, '#6f4e37', 'center', null);
  },
  parkauto(c, d) { drawCar(c, d.x, d.cy, d.a, d.col, 1.05); },
});
function buildGridAussen() {
  cellsIn(160, 160, 990, 1336, i => (G0[i] = 1));
  cellsIn(AGATE.ix - 45, 1320, AGATE.ix + 45, 1345, i => (G0[i] = 1));
  cellsIn(0, PLAY.y0 - 22, PLAY.x1 + 8, PLAY.y1, i => (G0[i] = 0));                         // Spielplatz-Zaun
  for (let i = 0; i < G0.length; i++) { const x = (i % GW) * CELL + 12.5, y = Math.floor(i / GW) * CELL + 12.5; if (dist(x, y, CIRC.x, CIRC.y) < CIRC.r + 26) G0[i] = 0; }   // Wendehammer + Hecke
  for (const d of ADECOR) {
    if (d.w) cellsIn(d.x0 - 4, d.y0 - 4, d.x0 + d.w + 4, d.y0 + d.h + (d.t === 'pavtisch' ? 30 : 26), i => (G0[i] = 0));
    else if (d.t === 'cypress') cellsCircle(d.x, d.y - 6, 18, i => (G0[i] = 0));
    else if (d.r) cellsCircle(d.x, d.y - 6, Math.max(8, d.r - 6), i => (G0[i] = 0));
  }
}
const ASPOTS = [
  ...[1, 2, 3].map(k => furnSpot(ADECOR, 'tisch' + k, 'top', { px: [0, 300, 520, 740][k] + 26, py: 262, sx: [0, 300, 520, 740][k], sy: 318 })),
  ...[4, 5, 6].map(k => furnSpot(ADECOR, 'tisch' + k, 'top', { px: [0, 0, 0, 0, 300, 520, 740][k] - 26, py: 412, sx: [0, 0, 0, 0, 300, 520, 740][k], sy: 492 })),
  furnSpot(ADECOR, 'topf1', 'top', { px: 436, py: 160, sx: 430, sy: 228 }),
  furnSpot(ADECOR, 'topf2', 'top', { px: 564, py: 160, sx: 570, sy: 228 }),
  furnSpot(ADECOR, 'olive1', 'top', { px: 190, py: 196, sx: 230, sy: 290 }),
  furnSpot(ADECOR, 'olive2', 'top', { px: 865, py: 471, sx: 830, sy: 560 }),
  furnSpot(ADECOR, 'kissenbox', 'top', { px: 844, py: 186, cut: 194, front: true, sx: 850, sy: 285 }),
  furnSpot(ADECOR, 'lounge', 'top', { px: 190, py: 384, cut: 396, front: true, sx: 230, sy: 430 }),
  furnSpot(ADECOR, 'cyp1', 'left', { px: 888, py: 280, sx: 860, sy: 320 }),
  furnSpot(ADECOR, 'cyp3', 'left', { px: 888, py: 440, sx: 860, sy: 450 }),
  furnSpot(ADECOR, 'kugel1', 'right', { px: 530, py: 538, sx: 552, sy: 570 }),
  furnSpot(ADECOR, 'kugel2', 'left', { px: 868, py: 590, sx: 846, sy: 620 }),
  furnSpot(ADECOR, 'brunnen', 'top', { px: 630, py: 666, cut: 677, front: true, sx: 640, sy: 745 }),
  furnSpot(ADECOR, 'baum1', 'right', { px: 636, py: 970, sx: 668, sy: 1020 }),
  furnSpot(ADECOR, 'baum3', 'left', { px: 936, py: 780, sx: 905, sy: 830 }),
  furnSpot(ADECOR, 'bank', 'top', { px: 590, py: 1132, sx: 590, sy: 1100 }),
  furnSpot(ADECOR, 'huette', 'left', { px: 846, py: 1290, sx: 815, sy: 1300 }),
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
  id: 'aussen', bg: '#5b8c45', start: { x: 500, y: 200 }, gate: AGATE,
  npcs: [
    { id: 'a_weber', pos: [[300, 490], [520, 495], [740, 490]] },
    { id: 'a_hoffmann', pos: [[410, 325], [630, 325], [240, 330]] },
    { id: 'a_klaus', pos: [[520, 1240], [320, 960], [870, 900]] },
    { id: 'a_mila', pos: [[560, 620], [800, 660], [720, 770]] },
    { id: 'a_noah', pos: [[600, 840], [820, 1060], [600, 1290]] },
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
    // Pavillon-Dach (Glas + Sonnensegel, wie auf dem Luftbild orange – weiß – orange): wird durchsichtig, sobald man darunter steht.
    // Kellner läuft zwischen den Tischen, Heizstrahler unter dem Dach, Schmetterlinge über dem Rasen.
    const route = [[500, 200], [410, 330], [630, 330], [740, 470], [520, 470], [300, 470]], K = { x: 500, y: 200, i: 1, pause: 0 };
    const flies = [0, 1, 2].map(i => ({ x: 700, y: 760, ph: i * 2.1 }));
    let fade = 0.95;
    return {
      update(dt) {
        flies.forEach(f => { f.ph += dt; f.x = 760 + Math.sin(f.ph * 0.7) * 140; f.y = 760 + Math.sin(f.ph * 1.3) * 60; });
        const p = play.p, under = p.x > PAV.x0 - 30 && p.x < PAV.x1 + 30 && p.y > PAV.y0 && p.y < PAV.y1 + 60;
        fade = lerp(fade, under ? 0.14 : 0.95, Math.min(1, dt * 6));
        if (K.pause > 0) { K.pause -= dt; return; } if (dist(p.x, p.y, K.x, K.y) < 60) return;
        const [tx, ty] = route[K.i], d = dist(K.x, K.y, tx, ty), s2 = 75 * dt; if (d <= s2) { K.x = tx; K.y = ty; K.i = (K.i + 1) % route.length; if (Math.random() < 0.4) K.pause = 1.4; } else { K.x += (tx - K.x) / d * s2; K.y += (ty - K.y) / d * s2; }
      },
      draw(c, L, vis, t) {
        if (vis(K.x, K.y)) L.push({ y: K.y, f: () => { drawPerson(c, 'a_ober', K.x, K.y, 1.05, t * 2, { ph: 2 }); c.save(); c.translate(K.x + 18, K.y - 46); ell(c, 0, 0, 20, 6); fs(c, '#adb5bd', 2.5); drawGlass(c, -8, -2, 0.3, 0.7, '#ff9f1c'); drawGlass(c, 8, -2, 0.3, 0.6, '#e63946'); c.restore(); } });
        flies.forEach((f, i) => { if (!vis(f.x, f.y)) return; L.push({ y: f.y + 40, f: () => { const fl = Math.abs(Math.sin(t * 14 + i)); c.save(); c.translate(f.x, f.y - 40); for (const sd of [-1, 1]) { ell(c, sd * 6 * fl, -3, 6 * fl + 1, 5, sd * 0.4); fs(c, ['#ffd166', '#fff', '#74c0fc'][i], 1.2); } line(c, 0, -6, 0, 4, 1.5, OL, false); c.restore(); } }); });
        L.push({ y: 99998, f: () => {
          const H = PAV.H, y0 = PAV.y0 - H, y1 = PAV.y1 - H;
          c.save(); c.globalAlpha = fade;
          PAV.secs.forEach(([a2, b2, col], i) => {
            // Glasdach (bläulich durchscheinend) mit Stahlsprossen
            rrPath(c, a2, y0, b2 - a2, y1 - y0, 2); c.fillStyle = 'rgba(205,228,240,.85)'; c.fill();
            // Sonnensegel unter dem Glas (leicht durchhängend)
            const fl = Math.sin(t * 1.2 + i) * 3, m = 12;
            c.beginPath(); c.moveTo(a2 + m, y0 + m); c.quadraticCurveTo((a2 + b2) / 2, y0 + m + 10 + fl, b2 - m, y0 + m); c.quadraticCurveTo(b2 - m - 8, (y0 + y1) / 2, b2 - m, y1 - m); c.quadraticCurveTo((a2 + b2) / 2, y1 - m - 10 - fl, a2 + m, y1 - m); c.quadraticCurveTo(a2 + m + 8, (y0 + y1) / 2, a2 + m, y0 + m); c.closePath();
            c.fillStyle = col; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(80,40,20,.5)'; c.stroke();
            c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.12)'; for (let k = 0; k < 40; k++) c.fillRect(a2 + (k * 37) % (b2 - a2), y0 + (k * 53) % (y1 - y0), 3, 3); c.restore();
            c.strokeStyle = 'rgba(73,80,87,.9)'; c.lineWidth = 3; for (let x = a2 + 42; x < b2 - 10; x += 42) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); }
            c.fillStyle = 'rgba(255,255,255,.22)'; polyPath(c, [[a2 + 10, y1 - 10], [a2 + 40, y1 - 10], [a2 + 90, y0 + 10], [a2 + 60, y0 + 10]]); c.fill();
            ell(c, (a2 + b2) / 2, y1 - 40, 16, 6); fs(c, '#343a40', 2);   // Heizstrahler
          });
          c.lineWidth = 7; c.strokeStyle = '#495057'; c.strokeRect(PAV.x0, y0, PAV.x1 - PAV.x0, y1 - y0); c.lineWidth = 5; PAV.secs.forEach(([a2]) => { c.beginPath(); c.moveTo(a2, y0); c.lineTo(a2, y1); c.stroke(); });
          c.restore();
        } });
      },
    };
  },
};
