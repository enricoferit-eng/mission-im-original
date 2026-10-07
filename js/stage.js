'use strict';
// ---------- Stage "Spielplatz": Karte, Laufen, Suchen, Aufträge ----------
// Aufbau nach den echten Fotos: Hackschnitzel-Boden, zweistöckiges Holz-Spielhaus mit Treppe und Rutsche,
// Doppelschaukel am Haus, Raum unter dem Haus gesperrt. Oben Glashaus + Terrasse (Eingang), unten Zaun mit
// Ausgangstor zum Parkplatz (Endlevel), rechts Zypressen.
const WORLD_W = 1000, WORLD_H = 1400, CELL = 25, GW = 40, GH = 56;
const HOUSE = { x: 550, y: 550, w: 200, h: 150, fz: 60 };   // Plattform (Obergeschoss) auf 60 Höhe
const STAIRS = { x: 625, y: 700, w: 50, h: 125 };
const SLIDE = { x0: 750, x1: 905, y0: 600, y1: 650 };
const SWING = { y: 600, x0: 160, x1: 550, top: 118, seats: [270, 430] };
const START = { x: 500, y: 228 };                            // kommt von der Terrasse herunter
const GATE = { x: 520, y: 1214, ix: 520, iy: 1158 };        // Ausgang zum Parkplatz

function hasCap(k) { return !!(ACC() && SP(DIFF_OF[k], 'spielplatz').outfit); }

// Auftrags-Tiere: mehrere mögliche Plätze, pro Durchgang zufällig. Der Hase sitzt immer auf einer Schaukel.
const NPC_DEFS = [
  { id: 'hase', swing: true },
  { id: 'fuchs', pos: [[815, 435, 0], [560, 330, 0], [300, 1000, 0]] },
  { id: 'igel', pos: [[215, 1045, 0], [880, 1100, 0], [420, 860, 0]] },
  { id: 'waschbaer', pos: [[850, 735, 0], [650, 880, 0], [130, 780, 0]] },
  { id: 'eule', pos: [[705, 590, 1], [600, 662, 1], [400, 520, 0]] },
];
const ALL_IDS = NPC_DEFS.map(n => n.id).concat(['gate']);

const DECOR = [
  { id: 'y1', t: 'yucca', x: 300, y: 300, r: 30 }, { id: 'y2', t: 'yucca', x: 862, y: 330, r: 30 },
  { id: 'y3', t: 'yucca', x: 765, y: 1128, r: 28 }, { id: 'y4', t: 'yucca', x: 100, y: 650, r: 24 },
  { id: 'y5', t: 'yucca', x: 130, y: 430, r: 30 }, { id: 'y6', t: 'yucca', x: 150, y: 910, r: 30 },
  { id: 'y7', t: 'yucca', x: 835, y: 1035, r: 30 },
  { id: 'y8', t: 'yucca', x: 560, y: 455, r: 28 }, { id: 'y9', t: 'yucca', x: 250, y: 500, r: 28 },
  { id: 'r1', t: 'rock', x: 470, y: 335, r: 24 }, { id: 'r2', t: 'rock', x: 690, y: 300, r: 30 }, { id: 'r3', t: 'rock', x: 240, y: 835, r: 30 },
  { id: 'r4', t: 'rock', x: 560, y: 1060, r: 26 }, { id: 'r5', t: 'rock', x: 330, y: 940, r: 26 },
  { id: 'pl', t: 'planter', x: 390, y: 1110 }, { id: 'bench', t: 'bench', x: 690, y: 1020, w: 86, h: 26 },
  { id: 'lamp', t: 'lamp', x: 205, y: 215, r: 9 },
  { id: 'board', t: 'board', x: 588, y: 242, r: 16 },                                   // Kreidetafel "Willkommen" am Eingang
  { id: 'pp1', t: 'potpalm', x: 432, y: 166, r: 0 }, { id: 'pp2', t: 'potpalm', x: 568, y: 166, r: 0 },
  { id: 'pp3', t: 'potpalm', x: 30, y: 166, r: 0 }, { id: 'pp4', t: 'potpalm', x: 975, y: 166, r: 0 },
];
for (let y = 225, k = 0; y < 1180; y += 112, k++) DECOR.push({ id: 'cy' + k, t: 'cypress', x: 968 + (k % 2) * 8, y, r: 0 });
const DECOR_BY = {}; DECOR.forEach(d => (DECOR_BY[d.id] = d));

// Mögliche Verstecke in der Umgebung (zusätzlich kann alles im Hackschnitzel vergraben sein)
const SPOTS = [
  ...['y1', 'y2', 'y3', 'y4', 'y5', 'y6', 'y7', 'y8', 'y9'].map(id => ({ id: 's_' + id, x: DECOR_BY[id].x, y: DECOR_BY[id].y, reach: 72, decor: id })),
  ...['r1', 'r2', 'r3', 'r4', 'r5'].map(id => ({ id: 's_' + id, x: DECOR_BY[id].x, y: DECOR_BY[id].y, reach: 66, decor: id })),
  { id: 's_pl', x: 390, y: 1110, reach: 70, decor: 'pl' }, { id: 's_bench', x: 690, y: 1020, reach: 66, decor: 'bench' },
  { id: 's_lamp', x: 205, y: 215, reach: 52 }, { id: 's_wall1', x: 360, y: 190, reach: 52 }, { id: 's_wall2', x: 800, y: 190, reach: 52 },
  { id: 's_fence1', x: 230, y: 1185, reach: 52 }, { id: 's_fence2', x: 700, y: 1185, reach: 52 },
  { id: 's_cyp1', x: 950, y: 470, reach: 62 }, { id: 's_cyp2', x: 950, y: 880, reach: 62 },
  { id: 's_slide', x: 920, y: 668, reach: 50 }, { id: 's_stairs', x: 600, y: 815, reach: 46 },
  { id: 's_sw1', x: 270, y: 668, reach: 50 }, { id: 's_sw2', x: 430, y: 668, reach: 50 }, { id: 's_post', x: 160, y: 655, reach: 56 },
  { id: 's_h1', x: 568, y: 568, l: 1, reach: 48 }, { id: 's_h2', x: 732, y: 568, l: 1, reach: 48 }, { id: 's_h3', x: 568, y: 688, l: 1, reach: 48 },
];

// ---------- Begehbarkeits-Raster (2 Ebenen: Boden + Spielhaus-Plattform; Treppe verbindet) ----------
const G0 = new Uint8Array(GW * GH), G1 = new Uint8Array(GW * GH), ST = new Uint8Array(GW * GH), SL = new Uint8Array(GW * GH);
const cellIdx = (x, y) => { const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL); return cx < 0 || cy < 0 || cx >= GW || cy >= GH ? -1 : cy * GW + cx; };
function cellsIn(x0, y0, x1, y1, fn) {
  for (let cy = 0; cy < GH; cy++) for (let cx = 0; cx < GW; cx++) {
    const x = cx * CELL + CELL / 2, y = cy * CELL + CELL / 2;
    if (x >= x0 && x < x1 && y >= y0 && y < y1) fn(cy * GW + cx);
  }
}
function cellsCircle(x, y, r, fn) { cellsIn(x - r - 13, y - r - 13, x + r + 13, y + r + 13, i => { const cx = (i % GW) * CELL + CELL / 2, cy = Math.floor(i / GW) * CELL + CELL / 2; if (dist(cx, cy, x, y) < r + 7) fn(i); }); }
(function buildGrid() {
  cellsIn(75, 195, 925, 1170, i => (G0[i] = 1));
  cellsIn(HOUSE.x, HOUSE.y, HOUSE.x + HOUSE.w, HOUSE.y + HOUSE.h, i => { G0[i] = 0; G1[i] = 1; });
  cellsIn(STAIRS.x, STAIRS.y, STAIRS.x + STAIRS.w, STAIRS.y + STAIRS.h, i => { ST[i] = 1; G0[i] = 0; });
  cellsIn(STAIRS.x - 25, STAIRS.y, STAIRS.x, STAIRS.y + STAIRS.h - 25, i => (G0[i] = 0));            // Geländer
  cellsIn(STAIRS.x + STAIRS.w, STAIRS.y, STAIRS.x + STAIRS.w + 25, STAIRS.y + STAIRS.h - 25, i => (G0[i] = 0));
  cellsIn(SLIDE.x0, SLIDE.y0, SLIDE.x1, SLIDE.y1, i => (G0[i] = 0));
  cellsIn(SLIDE.x0, SLIDE.y0, SLIDE.x0 + 25, SLIDE.y1, i => { G1[i] = 1; SL[i] = 1; });               // Rutschen-Einstieg
  cellsIn(140, 572, 200, 632, i => (G0[i] = 0));                                                       // Schaukel-Gestell
  SWING.seats.forEach(x => cellsIn(x - 32, 560, x + 32, 650, i => (G0[i] = 0)));
  for (const d of DECOR) {
    if (d.t === 'bench') cellsIn(d.x - d.w / 2, d.y - d.h / 2, d.x + d.w / 2, d.y + d.h / 2, i => (G0[i] = 0));
    else if (d.t === 'planter') cellsIn(d.x - 42, d.y - 22, d.x + 42, d.y + 22, i => (G0[i] = 0));
    else if (d.r) cellsCircle(d.x, d.y, d.r - 4, i => (G0[i] = 0));
  }
})();
const walk = (l, i) => i >= 0 && (ST[i] || (l ? G1[i] : G0[i]));
function canStand(l, x, y) {
  return walk(l, cellIdx(x, y)) && walk(l, cellIdx(x - 9, y)) && walk(l, cellIdx(x + 9, y)) && walk(l, cellIdx(x, y - 6)) && walk(l, cellIdx(x, y + 6));
}
const stairsZ = y => HOUSE.fz * clamp((STAIRS.y + STAIRS.h - y) / STAIRS.h, 0, 1);

// A* über beide Ebenen
function nearestFree(l, x, y) {
  const i0 = cellIdx(clamp(x, 0, WORLD_W - 1), clamp(y, 0, WORLD_H - 1));
  if (walk(l, i0) && !SL[i0]) return i0;
  const cx0 = i0 % GW, cy0 = Math.floor(i0 / GW);
  let best = -1, bd = 1e9;
  for (let rr = 1; rr <= 6 && best < 0; rr++) for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) {
    const cx = cx0 + dx, cy = cy0 + dy; if (cx < 0 || cy < 0 || cx >= GW || cy >= GH) continue;
    const i = cy * GW + cx; if (!walk(l, i) || SL[i]) continue;
    const d = dist(cx * CELL + 12.5, cy * CELL + 12.5, x, y); if (d < bd) { bd = d; best = i; }
  }
  return best;
}
function findPath(sx, sy, sl, tx, ty, tl, exact) {
  const N = GW * GH, s = cellIdx(sx, sy), t = nearestFree(tl, tx, ty);
  if (s < 0 || t < 0) return null;
  const g = new Float32Array(2 * N).fill(1e9), came = new Int32Array(2 * N).fill(-1), closed = new Uint8Array(2 * N);
  const heap = [];
  const push = (f, n) => { heap.push([f, n]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  const tx0 = t % GW, ty0 = Math.floor(t / GW);
  const h = i => { const dx = Math.abs(i % GW - tx0), dy = Math.abs(Math.floor(i / GW) - ty0); return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); };
  const st = sl * N + s; g[st] = 0; push(h(s), st);
  let goal = -1, iter = 0;
  while (heap.length && iter++ < 20000) {
    const [, n] = pop(); if (closed[n]) continue; closed[n] = 1;
    const l = n >= N ? 1 : 0, i = n - l * N;
    if (i === t && (l === tl || ST[i])) { goal = n; break; }
    const cx = i % GW, cy = Math.floor(i / GW);
    const lv = ST[i] ? [0, 1] : [l];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const j = ny * GW + nx;
      for (const nl of lv) {
        if (!walk(nl, j) || SL[j]) continue;
        if (dx && dy && (!walk(nl, cy * GW + nx) || !walk(nl, ny * GW + cx))) continue;
        const nn = nl * N + j, ng = g[n] + (dx && dy ? 1.414 : 1);
        if (ng < g[nn]) { g[nn] = ng; came[nn] = n; push(ng + h(j), nn); }
      }
    }
  }
  if (goal < 0) return null;
  const out = [];
  for (let n = goal; n >= 0 && n !== st; n = came[n]) { const l = n >= N ? 1 : 0, i = n - l * N; out.push({ x: (i % GW) * CELL + 12.5, y: Math.floor(i / GW) * CELL + 12.5, l }); }
  out.reverse();
  if (exact && out.length && canStand(tl, tx, ty) && cellIdx(tx, ty) === t) out.push({ x: tx, y: ty, l: tl });
  return out;
}

// ---------- Boden einmal vorzeichnen ----------
let GROUND = null;
function buildGround() {
  const Q = 1.5, cv2 = document.createElement('canvas'); cv2.width = WORLD_W * Q; cv2.height = WORLD_H * Q;
  const g = cv2.getContext('2d'); g.scale(Q, Q); g.lineJoin = 'round';
  const R = mulberry32(4242);
  g.fillStyle = '#86a866'; g.fillRect(0, 0, WORLD_W, WORLD_H);
  // Terrasse + Glashaus (oben)
  g.fillStyle = '#e3dbcd'; g.fillRect(0, 0, WORLD_W, 178);
  g.strokeStyle = 'rgba(120,105,90,.22)'; g.lineWidth = 1.5;
  for (let x = 0; x < WORLD_W; x += 40) { g.beginPath(); g.moveTo(x, 84); g.lineTo(x, 178); g.stroke(); }
  for (let y = 84; y < 178; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(WORLD_W, y); g.stroke(); }
  const gl = g.createLinearGradient(0, 0, 0, 84); gl.addColorStop(0, '#9fd3e6'); gl.addColorStop(1, '#d6f0f7');
  g.fillStyle = gl; g.fillRect(0, 0, WORLD_W, 84);
  for (let x = 30; x < WORLD_W; x += 120) { // Palmen im Glashaus
    g.strokeStyle = 'rgba(60,110,70,.55)'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, 84); g.quadraticCurveTo(x + 6, 50, x + 2, 26); g.stroke();
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.55; g.beginPath(); g.moveTo(x + 2, 26); g.quadraticCurveTo(x + 2 + Math.cos(a) * 20, 26 + Math.sin(a) * 20 - 6, x + 2 + Math.cos(a) * 34, 26 + Math.sin(a) * 34 + 6); g.lineWidth = 4; g.stroke(); }
  }
  g.strokeStyle = '#f8f9fa'; g.lineWidth = 4;
  for (let x = 0; x <= WORLD_W; x += 50) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 84); g.stroke(); }
  g.beginPath(); g.moveTo(0, 40); g.lineTo(WORLD_W, 40); g.stroke();
  // Logo-Schild am Glashaus über dem Eingang
  rrPath(g, START.x - 120, 6, 240, 66, 16); fs(g, 'rgba(251,248,242,.95)', 3);
  drawLogo(g, START.x, 39, 150, false);
  for (let x = 145; x < WORLD_W; x += 150) if (Math.abs(x - START.x) > 80) drawUmbrella(g, x, 112, 24);
  g.fillStyle = '#e9ecef'; g.fillRect(0, 80, WORLD_W, 8); g.strokeStyle = OL; g.lineWidth = 2; g.strokeRect(-2, 80, WORLD_W + 4, 8);
  for (let x = 70; x < WORLD_W; x += 150) { // Tische + Rattanstühle
    if (Math.abs(x - START.x) < 60) continue;
    for (const [dx, dy] of [[-24, 0], [24, 0], [0, -22], [0, 22]]) { rrPath(g, x + dx - 9, 128 + dy - 9, 18, 18, 6); fs(g, '#c8a27a', 2); }
    ell(g, x, 128, 21, 21); fs(g, '#fbf8f2', 2.5); ell(g, x, 128, 16, 16); fs(g, null, 1, 'rgba(53,69,47,.25)');
    drawFood(g, FOOD6[(x / 150 | 0) % 6], x, 127, 24);
  }
  // Natursteinmauer mit Durchgang + Stufen (Eingang)
  g.fillStyle = '#cbbfa8'; g.fillRect(0, 170, WORLD_W, 24);
  for (let x = 0, k = 0; x < WORLD_W; k++) { const w = 34 + R() * 26; rrPath(g, x + 1, 171 + (k % 2), w - 2, 21, 3); fs(g, ['#d6cab3', '#c2b59c', '#ddd3bf'][k % 3], 1.5); x += w; }
  g.fillStyle = '#e3dbcd'; g.fillRect(START.x - 34, 166, 68, 30);
  for (let k = 0; k < 3; k++) { rrPath(g, START.x - 34, 168 + k * 9, 68, 9, 2); fs(g, ['#efe7da', '#e3dbcd', '#d8cfc0'][k], 1.5); }
  // Seitenbeete (Kies + Yucca)
  g.fillStyle = '#d6cebf'; g.fillRect(0, 194, 64, 1000); g.fillRect(936, 194, 64, 1000); g.fillRect(0, 1176, WORLD_W, 44);
  for (let i = 0; i < 900; i++) { g.fillStyle = ['#c5bcad', '#e6dfd3', '#b3aa9a'][i % 3]; g.fillRect(R() * WORLD_W, 1176 + R() * 44, 2.5, 2.5); g.fillRect(R() * 64, 194 + R() * 990, 2.5, 2.5); g.fillRect(936 + R() * 64, 194 + R() * 990, 2.5, 2.5); }
  // Hackschnitzel (hell, warm)
  rrPath(g, 64, 194, 872, 984, 30); g.fillStyle = CHIP_BASE; g.fill();
  g.save(); rrPath(g, 64, 194, 872, 984, 30); g.clip();
  for (let i = 0; i < 17000; i++) { g.fillStyle = CHIP_COLS[i % 6]; ell(g, 64 + R() * 872, 194 + R() * 984, 2 + R() * 3.5, 1 + R() * 1.6, R() * 3); g.fill(); }
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,240,210,.12)'; ell(g, 64 + R() * 872, 194 + R() * 984, 40 + R() * 60, 25 + R() * 30, R() * 3); g.fill(); }
  for (let i = 0; i < 160; i++) { const x = 70 + R() * 860, y = 200 + R() * 970, s = 2 + R() * 3; g.fillStyle = ['#b9b2a6', '#d4cec4', '#9e978b'][i % 3]; ell(g, x, y, s * 1.3, s, R() * 3); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; ell(g, x - s * 0.4, y - s * 0.4, s * 0.4, s * 0.3); g.fill(); }
  for (let i = 0; i < 70; i++) { const x = 70 + R() * 860, y = 200 + R() * 970, a = R() * 6; g.save(); g.translate(x, y); g.rotate(a); ell(g, 0, 0, 6, 3); g.fillStyle = ['#9cbf6b', '#c9a24a', '#b5654a'][i % 3]; g.fill(); g.strokeStyle = 'rgba(60,40,20,.4)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-5, 0); g.lineTo(5, 0); g.stroke(); g.restore(); }
  rrPath(g, 64, 194, 872, 984, 30); g.lineWidth = 30; g.strokeStyle = 'rgba(80,55,30,.13)'; g.stroke(); g.lineWidth = 14; g.strokeStyle = 'rgba(80,55,30,.12)'; g.stroke();
  g.restore();
  rrPath(g, 64, 194, 872, 984, 30); g.lineWidth = 7; g.strokeStyle = '#c9c2b6'; g.stroke(); g.lineWidth = 2; g.strokeStyle = OL; g.stroke();
  const tuft = (x, y) => { for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.28; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 11); g.lineWidth = 2; g.strokeStyle = k % 2 ? '#6f9a4a' : '#8dbb62'; g.stroke(); } };
  for (let i = 0; i < 70; i++) { const side = i % 4; if (side === 0) tuft(55 + R() * 12, 210 + R() * 950); else if (side === 1) tuft(935 + R() * 10, 210 + R() * 950); else tuft(80 + R() * 840, 1172 + R() * 6); }
  // Zaun + Parkplatz (unten), Kiesweg zum Tor
  g.fillStyle = '#6c757d'; g.fillRect(0, 1232, WORLD_W, WORLD_H - 1232);
  for (let i = 0; i < 2500; i++) { g.fillStyle = i % 2 ? '#737b83' : '#62696f'; g.fillRect(R() * WORLD_W, 1232 + R() * 170, 2, 2); }
  g.fillStyle = '#d6cebf'; g.fillRect(GATE.x - 48, 1176, 96, 60);
  g.strokeStyle = '#f8f9fa'; g.lineWidth = 4;
  for (let x = 20; x < WORLD_W; x += 110) { g.beginPath(); g.moveTo(x, 1300); g.lineTo(x, 1400); g.stroke(); }
  const carCols = ['#e9ecef', '#adb5bd', '#e63946', '#343a40', '#4dabf7', '#f8f9fa', '#8d99ae', '#ffd166', '#e9ecef'];
  for (let k = 0; k < 9; k++) {
    const x = 75 + k * 110, y = 1352;
    rrPath(g, x - 26, y - 46, 52, 92, 16); fs(g, carCols[k], 3);
    rrPath(g, x - 20, y - 26, 40, 22, 6); fs(g, '#5a6f7d', 2); rrPath(g, x - 20, y + 14, 40, 16, 6); fs(g, '#5a6f7d', 2);
  }
  g.strokeStyle = 'rgba(60,70,75,.8)'; g.lineWidth = 1.5;
  for (let x = 0; x < WORLD_W; x += 12) { if (Math.abs(x - GATE.x) < 60) continue; g.beginPath(); g.moveTo(x, 1214); g.lineTo(x + 12, 1236); g.moveTo(x + 12, 1214); g.lineTo(x, 1236); g.stroke(); }
  for (let x = 0; x <= WORLD_W; x += 100) { if (Math.abs(x - GATE.x) < 60) continue; rrPath(g, x - 3, 1206, 6, 34, 2); fs(g, '#adb5bd', 2); }
  g.fillStyle = '#495057'; g.fillRect(0, 1210, GATE.x - 62, 4); g.fillRect(GATE.x + 62, 1210, WORLD_W, 4);
  const yuccaFlat = (x, y, s) => { for (let k = 0; k < 9; k++) { const a = (k / 9) * TAU; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s * 0.7); g.lineWidth = 4; g.strokeStyle = '#7fa65a'; g.stroke(); } };
  for (let x = 40; x < WORLD_W; x += 95) if (Math.abs(x - GATE.x) > 70) yuccaFlat(x + R() * 20, 1196, 18);
  for (let y = 240; y < 1160; y += 120) yuccaFlat(30, y + R() * 30, 17);
  GROUND = cv2;
}

// ---------- Objekte zeichnen ----------
function drawYucca(c, x, y, s, t, rustle = 0) {
  c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, x, y, 30 * s, 10 * s); c.fill();
  const wob = rustle > 0 ? Math.sin(t * 40) * 0.12 * rustle * 2 : Math.sin(t * 1.3 + x) * 0.03;
  const order = [0, 12, 1, 11, 2, 10, 3, 9, 4, 8, 5, 7, 6];
  for (const k of order) {
    const a = -Math.PI / 2 + (k - 6) * 0.24 + wob, len = (30 + ((k * 5) % 3) * 7) * s;
    const ex = x + Math.cos(a) * len, ey = y - 6 + Math.sin(a) * len * 0.95;
    const nx = -Math.sin(a) * 6 * s, ny = Math.cos(a) * 6 * s;
    c.beginPath(); c.moveTo(x - 4, y - 4);
    c.quadraticCurveTo((x + ex) / 2 + nx, (y + ey) / 2 + ny, ex, ey);
    c.quadraticCurveTo((x + ex) / 2 - nx, (y + ey) / 2 - ny, x + 4, y - 4);
    fs(c, k % 2 ? '#8dbb62' : '#a3cc74', 2);
    c.beginPath(); c.moveTo(x, y - 5); c.lineTo(lerp(x, ex, 0.8), lerp(y - 5, ey, 0.8)); c.lineWidth = 1.2; c.strokeStyle = 'rgba(60,90,40,.45)'; c.stroke();
  }
}
function drawRock(c, x, y, r, shake) {
  const sx = shake > 0 ? Math.sin(shake * 60) * 4 : 0;
  c.fillStyle = 'rgba(0,0,0,.22)'; ell(c, x, y + 2, r * 1.1, r * 0.4); c.fill();
  c.beginPath(); c.moveTo(x - r + sx, y); c.quadraticCurveTo(x - r * 1.05 + sx, y - r * 0.9, x - r * 0.2 + sx, y - r * 1.1);
  c.quadraticCurveTo(x + r * 0.8 + sx, y - r * 1.15, x + r + sx, y - r * 0.2); c.quadraticCurveTo(x + r * 0.9 + sx, y + 4, x + sx, y + 4); c.closePath();
  fs(c, '#a39b8b', 3.5);
  c.beginPath(); c.moveTo(x - r * 0.4 + sx, y - r * 0.85); c.quadraticCurveTo(x + r * 0.2 + sx, y - r, x + r * 0.55 + sx, y - r * 0.6); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.35)'; c.stroke();
}
function drawCypress(c, x, y) {
  c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, x - 14, y + 2, 26, 9); c.fill();
  c.beginPath(); c.moveTo(x, y - 220); c.quadraticCurveTo(x + 30, y - 120, x + 18, y); c.lineTo(x - 18, y); c.quadraticCurveTo(x - 30, y - 120, x, y - 220);
  fs(c, '#2d6a4f', 3);
  c.beginPath(); c.moveTo(x - 4, y - 200); c.quadraticCurveTo(x + 14, y - 120, x + 6, y - 20); c.lineWidth = 4; c.strokeStyle = 'rgba(120,180,120,.35)'; c.stroke();
}
function drawPlanter(c, x, y, t, sh) {
  c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, x, y + 4, 46, 10); c.fill();
  rrPath(c, x - 40, y - 26, 80, 30, 4); fs(c, '#a39b8b', 3);
  rrPath(c, x - 40, y - 34, 80, 10, 3); fs(c, '#bfb6a5', 3);
  for (let k = 0; k < 7; k++) { const px = x - 30 + k * 10, sw = Math.sin(t * 2 + k) * 2 + (sh > 0 ? Math.sin(t * 40) * 5 : 0); c.beginPath(); c.moveTo(px, y - 30); c.quadraticCurveTo(px + sw - 4, y - 44, px + sw + (k % 2 ? 6 : -6), y - 54 - (k % 3) * 4); c.lineWidth = 5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3; c.strokeStyle = k % 2 ? '#7fa65a' : '#95c56b'; c.stroke(); }
}
// Wo ein Versteck sichtbar "herausguckt": vor dem Busch/Stein, an der Mauer, am Zaun ...
function peekOf(h) {
  if (h.buried || !h.spot) return { x: h.x, y: h.y };
  const id = h.spot;
  if (id.startsWith('s_wall')) return { x: h.x, y: 208 };
  if (id.startsWith('s_fence')) return { x: h.x, y: 1166 };
  if (id.startsWith('s_cyp')) return { x: h.x - 40, y: h.y + 8 };
  if (h.behind) { const d = DECOR_BY[id.slice(2)], rr = d.t === 'planter' ? 34 : d.t === 'bench' ? 38 : d.r; return { x: h.x + (h.side || 1) * rr * 0.75, y: h.y - 4 }; }
  return { x: h.x + 10, y: h.y + 10 };
}
function moundAt(c, x, y, w) {
  c.beginPath(); c.moveTo(x - w, y + 3); c.quadraticCurveTo(x, y - w * 0.45, x + w, y + 3); c.closePath(); c.fillStyle = '#a9835b'; c.fill();
  for (let k = 0; k < 6; k++) { c.fillStyle = CHIP_COLS[k]; ell(c, x - w * 0.7 + k * w * 0.28, y - (k % 2) * 3, 3.2, 1.5, k); c.fill(); }
}
// Gegenstand steckt halb im Boden: nur der obere Teil ist zu sehen
function drawPeek(c, x, y, id, size, sink, tilt, wob) {
  c.save(); c.beginPath(); c.rect(x - size, y - size * 1.6, size * 2, size * 1.6); c.clip();
  c.translate(x, y + size * sink); c.rotate(tilt + wob); drawItem(c, id, 0, 0, size); c.restore();
  moundAt(c, x, y + 2, size * 0.62);
}
const JUNK = ['twig', 'leaf', 'pebble', 'cap'];
function drawJunk(c, x, y, kind, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round';
  if (kind === 'twig') { line(c, -10, 2, 8, -14, 3.5, '#7a4f2a'); line(c, 2, -7, 10, -4, 2.5, '#7a4f2a'); }
  else if (kind === 'leaf') { ell(c, 2, -6, 9, 5, -0.6); fs(c, '#95c56b', 2); line(c, -6, 0, 9, -11, 1.2, '#5f8a3a', false); }
  else if (kind === 'pebble') { ell(c, 0, -4, 8, 6); fs(c, '#adb5bd', 2); ell(c, -2, -6, 3, 2); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill(); }
  else { ell(c, 0, -5, 8, 4); fs(c, '#e63946', 2); ell(c, 0, -6, 5, 2); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); }
  c.restore();
  moundAt(c, x, y + 2, 13 * s);
}
function drawFace(c, id, x, y, s, t, o = {}) {
  if (id === 'gate') drawGate(c, x, y, s * 0.42, 0, true, t);
  else drawCritter(c, id, x, y, s, t, o);
}

// ---------- Spielszene ----------
class Play {
  constructor(diff) {
    this.diff = diff; this.kind = ANIMAL_OF[diff];
    this.sp = SP(diff, 'spielplatz');
    if (!this.sp.run) this.sp.run = { done: {}, active: null, easy: {} };
    this.st = this.sp.run; this.st.clears = this.sp.clears;
    if (!this.st.layout) { const r = mulberry32((Date.now() ^ 0x5bd1e995) >>> 0); this.st.layout = { seat: ri(0, 1, r) }; NPC_DEFS.forEach(n => { if (n.pos) this.st.layout[n.id] = ri(0, n.pos.length - 1, r); }); Save.write(); }
    this.npcs = NPC_DEFS.map(n => {
      if (n.swing) return { id: n.id, swing: this.st.layout.seat, x: SWING.seats[this.st.layout.seat], y: SWING.y + 55, l: 0 };
      const p = n.pos[this.st.layout[n.id]]; return { id: n.id, x: p[0], y: p[1], l: p[2] };
    });
    this.p = { x: START.x, y: START.y, level: 0, dir: 1, t: 0, moving: false, path: null, target: null, slide: null, slideZ: 0 };
    this.camX = START.x; this.camY = START.y; this.zoom = 1;
    this.joy = null; this.pending = null; this.toast = null; this.t = 0; this.searching = null; this.exiting = null;
    this.gateA = this.st.done.gate ? 1 : 0;
    if (diff !== 'easy' && ACC() && !ACC().tut['intro_' + diff]) { this.helpOpen = true; ACC().tut['intro_' + diff] = true; Save.write(); }
    this.shake = {};
    this.npcAnim = {}; ALL_IDS.forEach((id, i) => (this.npcAnim[id] = { ph: i * 1.7, wave: 0, jump: 0 }));
    this.pigeons = [0, 1, 2].map(i => ({ x: 300 + i * 200, y: 950 + i * 40, tx: 0, ty: 0, wait: i, fly: 0, dir: 1, t: i }));
    if (!GROUND) buildGround();
  }
  enter() { FX.clear(); }
  // ---- Hilfsfunktionen ----
  z() { const p = this.p; if (p.slide) return p.slideZ; const i = cellIdx(p.x, p.y); if (i >= 0 && ST[i]) return stairsZ(p.y); return p.level ? HOUSE.fz : 0; }
  w2s(x, y, z = 0) { return { x: (x - this.camX) * this.zoom + W / 2, y: (y - z - this.camY) * this.zoom + H / 2 }; }
  s2w(sx, sy) { return { x: (sx - W / 2) / this.zoom + this.camX, y: (sy - H / 2) / this.zoom + this.camY }; }
  seatOff(k) { return 30 * Math.sin(this.t * 1.6 + k * 2.1); }
  bossOpen() { return NPC_DEFS.every(n => this.st.done[n.id]); }
  npcState(id) {
    const st = this.st;
    if (st.done[id]) return 'done';
    if (id === 'gate' && !this.bossOpen()) return 'locked';
    if (this.diff === 'easy') return st.easy[id] ? 'busy' : id === 'gate' ? 'boss' : 'open';
    const q = st.active;
    if (q && q.npc === id) return q.got.every(Boolean) ? 'ready' : 'active';
    if (q) return 'waiting';
    return id === 'gate' ? 'boss' : 'open';
  }
  tryMove(nx, ny) {
    const p = this.p, i = cellIdx(p.x, p.y), lv = i >= 0 && ST[i] ? [p.level, 1 - p.level] : [p.level];
    for (const l of lv) if (canStand(l, nx, ny)) { p.x = nx; p.y = ny; p.level = l; return true; }
    return false;
  }
  onStairs() { const i = cellIdx(this.p.x, this.p.y); return i >= 0 && !!ST[i]; }
  // ---- Ablauf ----
  stop() { overlay = null; Save.write(); setScene(new Menu()); }
  update(dt) {
    this.t += dt;
    this.zoom = clamp(Math.min(W / 560, H / 780), 0.5, 1.6);
    const p = this.p; p.t += dt;
    if (this.pending) { this.pending.t -= dt; if (this.pending.t <= 0) { const f = this.pending.fn; this.pending = null; f(); } }
    for (const k in this.shake) this.shake[k] = Math.max(0, this.shake[k] - dt);
    for (const id in this.npcAnim) { const a = this.npcAnim[id]; a.wave = Math.max(0, a.wave - dt); a.jump = Math.max(0, a.jump - dt); }
    if (this.toast) { this.toast.t += dt; if (this.toast.t > 2.2) this.toast = null; }
    this.gateA = lerp(this.gateA, this.st.done.gate ? 1 : 0, Math.min(1, dt * 3));
    const hase = this.npcs.find(n => n.swing !== undefined);
    if (hase) { const off = this.seatOff(hase.swing); hase.y = SWING.y + off; hase.z = 24 + Math.abs(off) * 0.35; }
    if (this.exiting) this.updateExit(dt);
    else if (!overlay) {
      if (this.searching) this.updateSearch(dt); else this.updatePlayer(dt);
      // Hilfe-Uhr: läuft nur, solange gesucht wird
      const hq = this.st.active;
      if (this.canSearch() && hq) {
        hq.helpT = (hq.helpT || 0) + dt;
        this.saveAcc = (this.saveAcc || 0) + dt; if (this.saveAcc > 5) { this.saveAcc = 0; Save.write(); }
      }
    }
    else { this.joy = null; this.p.moving = false; }
    this.updatePigeons(dt);
    // Kellner auf der Terrasse (Deko, ohne Auftrag)
    const wt = this.waiter || (this.waiter = { x: 260, dir: 1, dish: 0 });
    wt.x += wt.dir * 45 * dt;
    if (wt.x > 900 || wt.x < 90) { wt.dir *= -1; wt.dish = (wt.dish + 1) % 6; }
    const z = this.z(), hw = W / 2 / this.zoom, hh = H / 2 / this.zoom;
    const tx = WORLD_W < hw * 2 ? WORLD_W / 2 : clamp(p.x, hw, WORLD_W - hw);
    const ty = WORLD_H < hh * 2 ? WORLD_H / 2 : clamp(p.y - z - 30, hh, WORLD_H - hh);
    const k = Math.min(1, dt * 6); this.camX = lerp(this.camX, tx, k); this.camY = lerp(this.camY, ty, k);
  }
  updatePlayer(dt) {
    const p = this.p, spd = 180;
    if (p.slide) {
      p.slide.t += dt / 0.8; const e = Math.min(1, p.slide.t * p.slide.t);
      p.x = lerp(SLIDE.x0 + 8, SLIDE.x1 + 10, e); p.slideZ = HOUSE.fz * (1 - (p.x - SLIDE.x0) / (SLIDE.x1 - SLIDE.x0)); p.dir = 1; p.moving = false;
      if (p.slide.t >= 1) { p.slide = null; p.level = 0; p.x = SLIDE.x1 + 12; p.slideZ = 0; const s = this.w2s(p.x, p.y); FX.puff(s.x, s.y, 10); Sfx.play('good'); buzz(30); }
      return;
    }
    let mx = 0, my = 0;
    const j = this.joy;
    if (j && j.moved) {
      const dx = j.x - j.x0, dy = j.y - j.y0, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 55);
      mx = (dx / d) * k; my = (dy / d) * k; p.path = null; p.target = null;
    }
    if (mx || my) {
      const s = spd * dt; const a = this.tryMove(p.x + mx * s, p.y); const b = this.tryMove(p.x, p.y + my * s);
      p.moving = a || b; if (Math.abs(mx) > 0.15) p.dir = mx > 0 ? 1 : -1;
    } else if (p.path && p.path.length) {
      const w = p.path[0], dx = w.x - p.x, dy = w.y - p.y, d = Math.hypot(dx, dy), s = spd * dt;
      if (d <= s) { p.x = w.x; p.y = w.y; p.level = w.l; p.path.shift(); }
      else { p.x += (dx / d) * s; p.y += (dy / d) * s; const i = cellIdx(p.x, p.y); if (i >= 0 && !ST[i]) p.level = w.l; }
      if (Math.abs(dx) > 2) p.dir = dx > 0 ? 1 : -1;
      p.moving = true;
    } else p.moving = false;
    const ci = cellIdx(p.x, p.y);
    if (p.level === 1 && ci >= 0 && SL[ci]) { p.slide = { t: 0 }; p.path = null; p.target = null; p.y = clamp(p.y, SLIDE.y0 + 8, SLIDE.y1 - 8); Sfx.play('jump'); return; }
    if (p.target) {
      const T = p.target;
      if (this.inRange(T)) { p.target = null; p.path = null; p.moving = false; this.interact(T); }
      else if (!p.path || !p.path.length) p.target = null;
    }
  }
  updatePigeons(dt) {
    const p = this.p;
    for (const b of this.pigeons) {
      b.t += dt;
      if (b.fly > 0) { b.fly -= dt; b.x += (b.tx - b.x) * Math.min(1, dt * 2); b.y += (b.ty - b.y) * Math.min(1, dt * 2); continue; }
      if (dist(b.x, b.y, p.x, p.y) < 70 && p.level === 0) {
        let tries = 0; do { b.tx = 120 + rnd() * 760; b.ty = 760 + rnd() * 380; tries++; } while (!canStand(0, b.tx, b.ty) && tries < 20);
        b.fly = 1.4; b.dir = b.tx > b.x ? 1 : -1; Sfx.play('pop'); continue;
      }
      b.wait -= dt;
      if (b.wait <= 0) {
        const nx = b.x + (rnd() - 0.5) * 80, ny = b.y + (rnd() - 0.5) * 50;
        if (canStand(0, nx, ny)) { b.dir = nx > b.x ? 1 : -1; b.mx = nx; b.my = ny; }
        b.wait = 1 + rnd() * 2;
      }
      if (b.mx !== undefined) { b.x = lerp(b.x, b.mx, Math.min(1, dt * 1.5)); b.y = lerp(b.y, b.my, Math.min(1, dt * 1.5)); }
    }
  }
  // ---- Suchen ----
  canSearch() { return this.diff !== 'easy' && !!this.st.active && !this.st.active.got.every(Boolean); }
  startSearch() {
    if (this.searching || !this.canSearch() || this.p.slide) return;
    this.p.path = null; this.p.target = null; this.searching = { t: 0 };
    Sfx.play('open');
    if (!ACC().tut.search) { ACC().tut.search = true; Save.write(); }
    // Umgebung raschelt
    for (const d of DECOR) if (dist(d.x, d.y, this.p.x, this.p.y) < 95) this.shake[d.id] = 0.6;
  }
  updateSearch(dt) {
    const s = this.searching, p = this.p; s.t += dt; p.moving = false;
    if (Math.floor(s.t * 8) !== Math.floor((s.t - dt) * 8)) { const sc = this.w2s(p.x + p.dir * 14, p.y, this.z()); FX.puff(sc.x, sc.y, 2); }
    if (s.t < 0.7) return;
    this.searching = null;
    const q = this.st.active; if (!q) return;
    const onSt = this.onStairs();
    let k = -1, bd = 1e9;
    q.hidden.forEach((h, i) => { if (q.got[i]) return; if (!onSt && h.l !== p.level) return; const pk = peekOf(h); const d = Math.min(dist(p.x, p.y, h.x, h.y), dist(p.x, p.y, pk.x, pk.y) + 4); if (d < h.reach && d < bd) { bd = d; k = i; } });
    if (k >= 0) {
      const h = q.hidden[k], sc = this.w2s(h.x, h.y, (h.l ? HOUSE.fz : 0) + 20);
      FX.sparkle(sc.x, sc.y, 18); Sfx.play('good');
      this.toast = { kind: 'found', item: q.items[k], x: h.x, y: h.y, l: h.l, t: 0 };
      this.pending = { t: 0.6, fn: () => this.earn(q, k) };
    } else {
      const dc = p.level === 0 && (q.decoys || []).find(d => !d.done && dist(p.x, p.y, d.x, d.y) < 46);
      if (dc) dc.done = true;
      q.dug.push([dc ? dc.x : Math.round(p.x), dc ? dc.y : Math.round(p.y), p.level]); if (q.dug.length > 60) q.dug.shift(); Save.write();
      Sfx.play('bad'); this.toast = dc ? { kind: 'junk', junk: dc.kind, x: dc.x, y: dc.y, l: 0, t: 0 } : { kind: 'empty', x: p.x, y: p.y, l: p.level, t: 0 };
    }
  }
  // ---- Interaktion ----
  npcPos(n) { return n.swing !== undefined ? { x: n.x, y: SWING.y + 62, z: 0, l: 0, r: 72, hy: n.y, hz: n.z || 24 } : { x: n.x, y: n.y, z: n.l ? HOUSE.fz : 0, l: n.l, r: 56, hy: n.y, hz: n.l ? HOUSE.fz : 0 }; }
  interactables() {
    const out = [];
    for (const n of this.npcs) { const P = this.npcPos(n); out.push({ k: 'npc', id: n.id, x: P.x, y: P.y, l: P.l, r: P.r, sx: n.x, sy: P.hy - P.hz - 26 }); }
    out.push({ k: 'gate', id: 'gate', x: GATE.ix, y: GATE.iy, l: 0, r: 64, sx: GATE.x, sy: GATE.y - 50 });
    if (this.canSearch()) for (const s of SPOTS) out.push({ k: 'spot', x: s.x, y: s.y, l: s.l || 0, r: s.reach - 12, sx: s.x, sy: s.y - (s.l ? HOUSE.fz : 0) - 16 });
    const q = this.st.active;
    if (this.canSearch() && q) {
      q.hidden.forEach((h, i) => { if (q.got[i]) return; const pk = peekOf(h); out.push({ k: 'spot', x: pk.x, y: pk.y, l: h.l, r: 40, sx: pk.x, sy: pk.y - (h.l ? HOUSE.fz : 0) - 8 }); });
      (q.decoys || []).forEach(d => { if (!d.done) out.push({ k: 'spot', x: d.x, y: d.y, l: 0, r: 40, sx: d.x, sy: d.y - 8 }); });
    }
    out.push({ k: 'slide', x: SLIDE.x0 - 10, y: (SLIDE.y0 + SLIDE.y1) / 2, l: 1, r: 22, sx: SLIDE.x0 + 20, sy: SLIDE.y0 - HOUSE.fz + 20 });
    return out;
  }
  inRange(T) {
    const p = this.p, onSt = this.onStairs();
    if (!onSt && p.level !== T.l) return false;
    if (onSt && T.l === 1 && p.y > STAIRS.y + 30) return false;
    return dist(p.x, p.y, T.x, T.y) < T.r;
  }
  tap(sx, sy) {
    if (this.exiting) return;
    const w = this.s2w(sx, sy);
    let best = null, bd = 44;
    for (const T of this.interactables()) {
      const d = dist(w.x, w.y, T.sx, T.sy) * (T.k === 'spot' ? 1.15 : 1);
      if (d < bd) { bd = d; best = T; }
    }
    const p = this.p;
    if (best) {
      if (best.k === 'slide' && p.level === 1 && dist(p.x, p.y, best.x, best.y) < 60) { p.path = [{ x: SLIDE.x0 + 12, y: clamp(p.y, SLIDE.y0 + 8, SLIDE.y1 - 8), l: 1 }]; return; }
      if (best.k !== 'slide' && this.inRange(best)) { this.interact(best); return; }
      const path = findPath(p.x, p.y, p.level, best.x, best.y, best.l, best.k === 'npc');
      if (path) {
        p.path = path;
        if (best.k === 'slide') { path.push({ x: SLIDE.x0 + 12, y: best.y, l: 1 }); p.target = null; }
        else p.target = best;
      }
      return;
    }
    let tx = w.x, ty = w.y, tl = 0;
    if (w.x > HOUSE.x && w.x < HOUSE.x + HOUSE.w && w.y + HOUSE.fz > HOUSE.y && w.y + HOUSE.fz < HOUSE.y + HOUSE.h) { ty = w.y + HOUSE.fz; tl = 1; }
    const path = findPath(p.x, p.y, p.level, tx, ty, tl, true);
    if (path) { p.path = path; p.target = null; this.tapMark = { x: tx, y: ty, l: tl, t: 0 }; }
  }
  interact(T) {
    if (T.k === 'npc' || T.k === 'gate') this.talk(T.id);
    else if (T.k === 'spot') this.startSearch();
  }
  talk(id) {
    const st = this.st, s = this.npcState(id), a = this.npcAnim[id];
    a.wave = 1; Sfx.play('tap');
    if (!ACC().tut.symbol) { ACC().tut.symbol = true; Save.write(); }
    if (id === 'gate' && st.done.gate) { this.startExit(); return; }
    if (s === 'done') { a.jump = 0.5; return; }
    if (s === 'locked') { overlay = new QuestDialog({ mode: 'lock', npc: id, done: NPC_DEFS.filter(x => st.done[x.id]).length }); return; }
    if (this.diff === 'easy') { this.startEasy(id); return; }
    const q = st.active;
    if (s === 'waiting') { overlay = new QuestDialog({ mode: 'busy', npc: id, other: q.npc, items: q.items, got: q.got }); return; }
    if (s === 'active') { overlay = new QuestDialog({ mode: 'progress', npc: id, items: q.items, got: q.got, boss: q.boss }); return; }
    if (s === 'ready') { this.deliver(id); return; }
    const nq = this.genQuest(id);
    overlay = new QuestDialog({ mode: 'offer', npc: id, items: nq.items, got: nq.got, boss: nq.boss, onYes: () => { st.active = nq; Save.write(); Sfx.play('good'); } });
  }
  genQuest(id) {
    const seed = (Date.now() ^ (id.length * 7919) ^ ((this.st.clears + 1) * 104729)) >>> 0, r = mulberry32(seed);
    const boss = id === 'gate';
    const cnt = (this.diff === 'medium' ? ri(2, 3, r) : ri(4, 6, r)) + (boss ? 2 : 0);
    const items = shuffle(ITEM_IDS, r).slice(0, cnt);
    // Verstecke: mal in der Umgebung, mal irgendwo im Hackschnitzel vergraben – jedes Mal neu
    const hidden = [], spots = shuffle(SPOTS, r), npcP = this.npcs.map(n => this.npcPos(n));
    const farEnough = (x, y, l) => hidden.every(h => h.l !== l || dist(h.x, h.y, x, y) > 120);
    for (let k = 0; k < cnt; k++) {
      let h = null;
      const roll = r();
      if (roll < 0.9) {
        const behindPool = spots.filter(s2 => s2.decor), pool = roll < 0.75 ? behindPool : spots;
        const s = pool.find(s2 => !hidden.some(hh => hh.spot === s2.id) && farEnough(s2.x, s2.y, s2.l || 0));
        if (s) h = { x: s.x, y: s.y, l: s.l || 0, reach: s.reach, spot: s.id, behind: !!s.decor, side: r() < 0.5 ? -1 : 1 };
      }
      if (!h) {
        let x = 0, y = 0, g = 0;
        do { x = 95 + r() * 810; y = 240 + r() * 900; g++; }
        while (g < 400 && (!canStand(0, x, y) || !farEnough(x, y, 0) || npcP.some(P => dist(P.x, P.y, x, y) < 70) || dist(x, y, START.x, START.y) < 140));
        h = { x: Math.round(x), y: Math.round(y), l: 0, reach: 44, buried: true };
      }
      hidden.push(h);
    }
    // Spiele: möglichst abwechslungsreich (nichts doppelt im Auftrag, zuletzt gespielte meiden)
    const recent = ACC().recent || [], used = [];
    const games = items.map(() => {
      const ch = r() < (boss ? 0.7 : 0.4);
      const pool = ch ? (this.diff === 'hard' && r() < 0.4 ? CHALLENGES_HARD : r() < 0.45 ? CHALLENGES_SP : CHALLENGES_STD) : PUZZLES;
      let cand = pool.filter(g => !used.includes(g) && !recent.includes(g));
      if (!cand.length) cand = pool.filter(g => !used.includes(g));
      if (!cand.length) cand = pool;
      const g = pick(cand, r); used.push(g); return g;
    });
    // Täuschungen: an anderen Stellen guckt auch etwas heraus (Stöckchen, Blatt, Steinchen, Kronkorken)
    const decoys = [], nd = this.diff === 'hard' ? 7 : 4;
    for (let k = 0; k < nd; k++) {
      let x = 0, y = 0, g = 0;
      do { x = 95 + r() * 810; y = 240 + r() * 900; g++; }
      while (g < 300 && (!canStand(0, x, y) || hidden.some(h => dist(peekOf(h).x, peekOf(h).y, x, y) < 110) || decoys.some(d => dist(d.x, d.y, x, y) < 110) || dist(x, y, START.x, START.y) < 120));
      decoys.push({ x: Math.round(x), y: Math.round(y), kind: pick(JUNK, r), done: false });
    }
    return { npc: id, boss, items, got: items.map(() => false), hidden, decoys, dug: [], games, seed };
  }
  earn(q, k) {
    const gid = q.games[k], ch = !!GAMES[gid].challenge;
    const slow = ch && !ACC().tut.challenge;
    const h = q.hidden[k];
    overlay = new GameOverlay(gid, { diff: this.diff, kind: ch ? 'challenge' : 'puzzle', item: q.items[k], slow, seed: (q.seed + k * 7919) >>> 0, onStop: () => this.stop() }, ok => {
      if (!ok) return;
      if (ch && !ACC().tut.challenge) ACC().tut.challenge = true;
      ACC().recent = (ACC().recent || []).concat([gid]).slice(-8);
      q.got[k] = true; if (q.hint === k) q.hint = null; Save.write();
      const s = this.w2s(h.x, h.y, (h.l ? HOUSE.fz : 0) + 20);
      FX.flyTo(s.x, s.y, W / 2, 104, (c, x, y, sc) => drawItem(c, q.items[k], x, y, 44 * sc));
      this.coinBurst(s.x, s.y);
      if (q.got.every(Boolean)) this.npcAnim[q.npc].jump = 1.2;
    });
  }
  deliver(id) {
    const st = this.st, q = st.active;
    st.done[id] = true; st.active = null;
    Save.write();
    const P = this.anchor(id), s = this.w2s(P.x, P.y, P.z + 40);
    FX.confetti(s.x, s.y, 60); Sfx.play('win'); buzz([40, 50, 80]); this.coinBurst(s.x, s.y);
    this.npcAnim[id].jump = 1.5;
    if (id === 'gate') this.pending = { t: 1.0, fn: () => this.startExit() };
    else if (this.bossOpen()) this.pending = { t: 1.0, fn: () => { const gs = this.w2s(GATE.x, GATE.y, 60); FX.sparkle(gs.x, gs.y, 30, '#ffd23f'); Sfx.play('good'); } };
  }
  anchor(id) {
    if (id === 'gate') return { x: GATE.x, y: GATE.y, z: 40 };
    const n = this.npcs.find(x => x.id === id), P = this.npcPos(n); return { x: n.x, y: P.hy, z: P.hz };
  }
  startEasy(id) {
    const st = this.st;
    let e = st.easy[id];
    if (!e) {
      const seed = (Date.now() ^ (id.length * 31337)) >>> 0, r = mulberry32(seed);
      const cnt = id === 'gate' ? 6 : ri(4, 6, r), steps = [];
      const recent = ACC().recentEasy || [];
      let pool = shuffle(EASY_GAMES.filter(g => !recent.includes(g)), r);
      if (pool.length < cnt) pool = pool.concat(shuffle(EASY_GAMES.filter(g => !pool.includes(g)), r));
      steps.push(...pool.slice(0, cnt));
      e = st.easy[id] = { steps, idx: 0, seed }; Save.write();
    }
    this.runEasyStep(id);
  }
  runEasyStep(id) {
    const e = this.st.easy[id];
    if (!e) return;
    if (e.idx >= e.steps.length) { this.finishEasy(id); return; }
    overlay = new GameOverlay(e.steps[e.idx], { diff: 'easy', kind: 'easy', steps: { i: e.idx, n: e.steps.length }, seed: (e.seed + e.idx * 101) >>> 0, onStop: () => this.stop() }, ok => {
      if (!ok) return;
      ACC().recentEasy = (ACC().recentEasy || []).concat([e.steps[e.idx]]).slice(-8);
      e.idx++; Save.write();
      if (e.idx >= e.steps.length) this.finishEasy(id);
      else this.pending = { t: 0.2, fn: () => this.runEasyStep(id) };
    });
  }
  finishEasy(id) {
    const st = this.st; st.done[id] = true; delete st.easy[id];
    Save.write();
    const P = this.anchor(id), s = this.w2s(P.x, P.y, P.z + 40);
    FX.confetti(s.x, s.y, 60); Sfx.play('win'); buzz([40, 50, 80]); this.coinBurst(s.x, s.y);
    this.npcAnim[id].jump = 1.5;
    if (id === 'gate') this.pending = { t: 1.0, fn: () => this.startExit() };
  }
  // Tor geht auf, Figur läuft hinaus zum Parkplatz
  startExit() {
    if (this.exiting) return;
    const p = this.p;
    overlay = null;
    const path = findPath(p.x, p.y, p.level, GATE.ix, GATE.iy - 4, 0, true) || [];
    path.push({ x: GATE.x, y: GATE.iy, l: 0 });
    this.exiting = { t: 0, path, phase: 'walk' };
  }
  updateExit(dt) {
    const E = this.exiting, p = this.p, spd = 260;
    E.t += dt;
    if (E.phase === 'walk') {
      const w = E.path[0];
      if (!w) { E.phase = 'out'; E.t = 0; return; }
      const dx = w.x - p.x, dy = w.y - p.y, d = Math.hypot(dx, dy), s = spd * dt;
      if (d <= s) { p.x = w.x; p.y = w.y; p.level = w.l; E.path.shift(); } else { p.x += (dx / d) * s; p.y += (dy / d) * s; }
      if (Math.abs(dx) > 2) p.dir = dx > 0 ? 1 : -1;
      p.moving = true;
      if (E.t > 8) { E.phase = 'out'; E.t = 0; }
    } else {
      p.y += spd * 0.7 * dt; p.x = lerp(p.x, GATE.x, Math.min(1, dt * 5)); p.moving = true;
      if (E.t > 1.6 && !E.done) { E.done = true; this.exiting = null; this.stageClear(); }
    }
  }
  stageClear() {
    const kind = this.kind, sp = this.sp;
    const newPiece = !sp.outfit; sp.outfit = true;
    // Belohnung: ein zufälliger Skin dieser Stage + Stufe (bevorzugt einer, den man noch nicht hat)
    const all = stageSkins('spielplatz', this.diff), missing = all.filter(s => !sp.skins.includes(s));
    const skin = pick(missing.length ? missing : all);
    const newSkin = !sp.skins.includes(skin); if (newSkin) sp.skins.push(skin);
    if (newSkin) DP(this.diff).equip = skin;
    sp.clears++; sp.run = null;
    Save.write();
    overlay = new ClearOverlay({ kind, newPiece, skin, newSkin, have: sp.skins.length, diff: this.diff }, again => {
      if (again) setScene(new Play(this.diff)); else setScene(new StageMap(this.diff));
    });
  }
  coinBurst(sx, sy) { FX.sparkle(sx, sy, 16, '#ffd23f'); }
  // ---- Eingabe ----
  down(x, y, id) { if (this.joy || this.helpOpen) return; this.joy = { id, x0: x, y0: y, x, y, t: this.t, moved: false }; }
  move(x, y, id) { const j = this.joy; if (!j || j.id !== id) return; j.x = x; j.y = y; if (!j.moved && dist(x, y, j.x0, j.y0) > 14) j.moved = true; }
  up(x, y, id) { const j = this.joy; if (!j || j.id !== id) return; if (!j.moved && this.t - j.t < 0.4 && !this.searching) this.tap(x, y); this.joy = null; }
  // ---- Zeichnen ----
  draw(c) {
    const z = this.zoom, p = this.p, t = this.t, pz = this.z();
    c.fillStyle = '#86a866'; c.fillRect(0, 0, W, H);
    c.setTransform(DPR * z, 0, 0, DPR * z, DPR * (W / 2 - this.camX * z), DPR * (H / 2 - this.camY * z));
    if (!GROUND) buildGround();
    c.drawImage(GROUND, 0, 0, WORLD_W, WORLD_H);
    const q = this.st.active;
    // Gegrabene Stellen + vergrabene Hinweise
    if (q) {
      for (const [x, y, l] of q.dug) {
        const zz = l ? HOUSE.fz : 0;
        c.fillStyle = 'rgba(120,85,50,.35)'; ell(c, x, y - zz + 4, 20, 8); c.fill();
        c.fillStyle = 'rgba(90,60,35,.45)'; ell(c, x - 6, y - zz + 3, 3, 1.5, 0.4); c.fill(); ell(c, x + 7, y - zz + 6, 3, 1.5, -0.3); c.fill();
      }
    }
    if (this.tapMark) { const m = this.tapMark; m.t += 1 / 60; if (m.t < 0.6) { ell(c, m.x, m.y - (m.l ? HOUSE.fz : 0), 14 + m.t * 20, (14 + m.t * 20) * 0.45); c.lineWidth = 3; c.strokeStyle = `rgba(255,255,255,${0.8 - m.t})`; c.stroke(); } }
    c.fillStyle = 'rgba(60,35,15,.17)';
    polyPath(c, [[HOUSE.x + 10, HOUSE.y + HOUSE.h], [HOUSE.x + HOUSE.w, HOUSE.y + HOUSE.h], [HOUSE.x + HOUSE.w + 95, HOUSE.y + HOUSE.h + 55], [HOUSE.x + 70, HOUSE.y + HOUSE.h + 55]]); c.fill();
    polyPath(c, [[HOUSE.x + HOUSE.w, HOUSE.y], [HOUSE.x + HOUSE.w + 95, HOUSE.y + 55], [HOUSE.x + HOUSE.w + 95, HOUSE.y + HOUSE.h + 55], [HOUSE.x + HOUSE.w, HOUSE.y + HOUSE.h]]); c.fill();
    polyPath(c, [[SWING.x0, SWING.y + 4], [SWING.x1, SWING.y + 4], [SWING.x1 + 50, SWING.y + 34], [SWING.x0 + 50, SWING.y + 34]]); c.fill();
    polyPath(c, [[SLIDE.x0, SLIDE.y1], [SLIDE.x1, SLIDE.y1], [SLIDE.x1 + 10, SLIDE.y1 + 14], [SLIDE.x0 + 40, SLIDE.y1 + 40]]); c.fill();
    for (const d of DECOR) if (d.t === 'cypress') { ell(c, d.x - 10, d.y + 30, 18, 70, -0.6); c.fill(); }
    const onSt = this.onStairs();
    const behind = p.level === 0 && !onSt && p.y < HOUSE.y + 5 && p.y > HOUSE.y - 170 && p.x > HOUSE.x - 30 && p.x < HOUSE.x + HOUSE.w + 30;
    const L = [];
    this.peeksUp = [];
    if (q && this.diff !== 'easy') {
      const hard = this.diff === 'hard', size = hard ? 42 : 50, sink = hard ? 0.05 : -0.15;
      q.hidden.forEach((h, i) => {
        if (q.got[i]) return;
        const pk = peekOf(h), tilt = ((i * 37) % 7 - 3) * 0.12;
        const wob = !hard && Math.sin(t * 2 + i) > 0.97 ? Math.sin(t * 40) * 0.15 : 0;
        const f = h.behind ? () => {
          c.save(); c.translate(pk.x, pk.y - size * 0.32); c.rotate((h.side || 1) * 0.35 + tilt + wob); drawItem(c, q.items[i], 0, 0, size * 0.95); c.restore();
        } : () => {
          const zz = h.l ? HOUSE.fz : 0;
          if (!hard) { const pu = 0.5 + 0.5 * Math.sin(t * 3 + i); ell(c, pk.x, pk.y - zz + 2, size * 0.75 + pu * 4, size * 0.3 + pu * 2); c.lineWidth = 3; c.strokeStyle = `rgba(255,255,255,${0.35 + pu * 0.35})`; c.stroke(); }
          drawPeek(c, pk.x, pk.y - zz, q.items[i], size, sink, tilt, wob);
        };
        if (h.l) this.peeksUp.push({ y: pk.y, f }); else L.push({ y: pk.y + 0.5, f });
      });
      (q.decoys || []).forEach(d => { if (!d.done) L.push({ y: d.y + 0.5, f: () => drawJunk(c, d.x, d.y, d.kind, hard ? 1.25 : 1.4) }); });
    }
    const dig = this.searching ? Math.abs(Math.sin(this.searching.t * 18)) * 0.25 : 0;
    const drawPlayer = () => drawAnimal(c, this.kind, p.x, p.y - pz, 1.12, { t: p.t, moving: p.moving, dir: p.dir, cap: hasCap(this.kind), tilt: p.slide ? -0.35 : dig * p.dir });
    for (const d of DECOR) {
      const sh = this.shake[d.id] || 0;
      if (d.t === 'yucca') L.push({ y: d.y, f: () => drawYucca(c, d.x, d.y, 1, t, sh) });
      else if (d.t === 'rock') L.push({ y: d.y, f: () => drawRock(c, d.x, d.y, d.r, sh) });
      else if (d.t === 'potpalm') L.push({ y: d.y, f: () => drawPotPalm(c, d.x, d.y, 0.85, t) });
      else if (d.t === 'board') L.push({ y: d.y, f: () => drawChalkboard(c, d.x, d.y, t) });
      else if (d.t === 'cypress') L.push({ y: d.y, f: () => drawCypress(c, d.x, d.y) });
      else if (d.t === 'planter') L.push({ y: d.y, f: () => drawPlanter(c, d.x, d.y, t, sh) });
      else if (d.t === 'lamp') L.push({ y: d.y, f: () => { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y, 12, 4); c.fill(); line(c, d.x, d.y, d.x, d.y - 170, 5, '#adb5bd'); rrPath(c, d.x - 4, d.y - 182, 30, 10, 4); fs(c, '#6c757d', 3); } });
      else if (d.t === 'bench') L.push({ y: d.y + 10, f: () => { const sx = sh > 0 ? Math.sin(sh * 60) * 2 : 0; c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 12, 48, 8); c.fill(); rrPath(c, d.x - 43 + sx, d.y - 18, 86, 12, 4); fs(c, '#a0673a', 3); rrPath(c, d.x - 43 + sx, d.y - 2, 86, 12, 4); fs(c, '#8d5a3b', 3); rrPath(c, d.x - 38, d.y + 8, 8, 10, 2); fs(c, '#495057', 2); rrPath(c, d.x + 30, d.y + 8, 8, 10, 2); fs(c, '#495057', 2); } });
    }
    for (const n of this.npcs) if (!n.l && n.swing === undefined) L.push({ y: n.y, f: () => this.drawNpc(c, n) });
    if (this.waiter) L.push({ y: 160, f: () => drawWaiter(c, this.waiter.x, 160, 1.05, t, this.waiter.dir, FOOD6[this.waiter.dish]) });
    for (const b of this.pigeons) L.push({ y: b.fly > 0 ? b.y + 200 : b.y, f: () => drawPigeon(c, b.x, b.y - (b.fly > 0 ? 40 + Math.sin(b.fly * 2.2) * 40 : 0), 1.3, b.t, b.dir, b.fly > 0) });
    L.push({ y: SWING.y, f: () => this.drawSwingFrame(c) });
    SWING.seats.forEach((sx, k) => { const off = this.seatOff(k); L.push({ y: SWING.y + off + 1, f: () => this.drawSeat(c, sx, off, k) }); });
    L.push({ y: SLIDE.y1, f: () => this.drawSlide(c) });
    L.push({ y: HOUSE.y + HOUSE.h, f: () => this.drawHouse(c, behind, drawPlayer) });
    L.push({ y: HOUSE.y + HOUSE.h + 0.5, f: () => this.drawStairs(c) });
    L.push({ y: GATE.y, f: () => drawGate(c, GATE.x, GATE.y, 1, this.gateA, this.npcState('gate') === 'locked', t) });
    if (p.slide) L.push({ y: SLIDE.y1 + 1, f: drawPlayer });
    else if (onSt || p.level === 0) L.push({ y: p.y, f: drawPlayer });
    L.sort((a, b) => a.y - b.y).forEach(d => d.f());
    this.drawRoof(c, pz > 2 || behind || p.slide ? 0.22 : 1);
    this.drawMarkers(c);
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    const vg = c.createRadialGradient(W * 0.35, H * 0.3, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.8);
    vg.addColorStop(0, 'rgba(255,240,200,.10)'); vg.addColorStop(0.6, 'rgba(255,240,200,0)'); vg.addColorStop(1, 'rgba(40,25,10,.30)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    if (this.exiting && this.exiting.phase === 'out') { c.fillStyle = `rgba(20,30,20,${clamp(this.exiting.t / 1.4, 0, 1)})`; c.fillRect(0, 0, W, H); }
    this.drawHud(c);
  }
  drawNpc(c, n) {
    const a = this.npcAnim[n.id], j = a.jump > 0 ? Math.abs(Math.sin(a.jump * 9)) * 12 : 0;
    const zz = n.l ? HOUSE.fz : 0;
    drawCritter(c, n.id, n.x, n.y - zz - j, 1.12, this.t, { ph: a.ph, wave: a.wave > 0 || this.npcState(n.id) === 'ready' });
  }
  drawSwingFrame(c) {
    const bY = SWING.y - SWING.top;
    line(c, SWING.x0 - 22, SWING.y - 18, SWING.x0, bY, 11, '#7a4f2a'); line(c, SWING.x0 + 20, SWING.y + 22, SWING.x0, bY, 11, '#8d5a3b');
    line(c, SWING.x0 - 10, SWING.y - 2, SWING.x0 + 12, SWING.y + 6, 7, '#8d5a3b');
    c.beginPath(); c.moveTo(SWING.x0 - 10, bY - 7); c.lineTo(SWING.x1, bY - 7); c.lineTo(SWING.x1, bY + 7); c.lineTo(SWING.x0 - 10, bY + 7); c.closePath(); fs(c, '#9c6b3f', 3.5);
    c.strokeStyle = 'rgba(60,35,15,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(SWING.x0, bY); c.lineTo(SWING.x1, bY + 1); c.stroke();
  }
  drawSeat(c, sx, off, k) {
    const bY = SWING.y - SWING.top, sy = SWING.y + off, zz = 24 + Math.abs(off) * 0.35;
    const rider = this.npcs.find(n => n.swing === k);
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, sx, sy, 20, 6); c.fill();
    line(c, sx - 14, bY + 4, sx - 15, sy - zz, 2, '#ced4da');
    if (rider) { const a = this.npcAnim[rider.id], j = a.jump > 0 ? Math.abs(Math.sin(a.jump * 9)) * 10 : 0; drawCritter(c, rider.id, sx, sy - zz + 4 - j, 1.0, this.t, { ph: a.ph, noShadow: true, wave: a.wave > 0 || this.npcState(rider.id) === 'ready' }); }
    rrPath(c, sx - 19, sy - zz - 4, 38, 9, 3); fs(c, '#343a40', 3);
    line(c, sx + 14, bY + 4, sx + 15, sy - zz, 2, '#ced4da');
  }
  drawSlide(c) {
    const { x0, x1, y0, y1 } = SLIDE, fz = HOUSE.fz;
    line(c, x1 - 30, y1 + 2, x1 - 30, y1 - 14, 6, '#adb5bd');
    const g = c.createLinearGradient(0, y0 - fz, 0, y1); g.addColorStop(0, '#f1f3f5'); g.addColorStop(1, '#adb5bd');
    polyPath(c, [[x0, y0 - fz], [x1, y0], [x1 + 14, y0 + 4], [x1 + 14, y1], [x1, y1], [x0, y1 - fz]]); fs(c, g, 3.5);
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + 10, y0 - fz + 25); c.lineTo(x1 - 5, y0 + 26); c.stroke();
    line(c, x0, y0 - fz - 6, x1, y0 - 6, 5, '#dee2e6'); line(c, x0, y1 - fz - 2, x1, y1 - 2, 5, '#dee2e6');
  }
  drawStairs(c) {
    const { x, y, w, h } = STAIRS, fz = HOUSE.fz, top = y - fz, bot = y + h;
    line(c, x - 4, bot, x - 4, top, 8, '#8d5a3b'); line(c, x + w + 4, bot, x + w + 4, top, 8, '#8d5a3b');
    for (let k = 0; k <= 9; k++) { const yy = lerp(top + 8, bot - 6, k / 9); rrPath(c, x - 2, yy - 5, w + 4, 11, 5); fs(c, k % 2 ? '#b07a45' : '#a06a38', 2.5); }
    c.beginPath(); c.moveTo(x - 6, bot - 30); c.quadraticCurveTo(x - 14, (top + bot) / 2 - 30, x - 4, top - 30); c.lineWidth = 3; c.strokeStyle = '#d4a373'; c.stroke();
  }
  drawHouse(c, ghost, drawPlayer) {
    const { x, y, w, h, fz } = HOUSE, p = this.p;
    c.save(); if (ghost) c.globalAlpha = 0.5;
    c.fillStyle = '#2e2117'; c.fillRect(x, y + h - fz, w, fz);
    for (let k = 0; k < 11; k++) {
      const px = x + 4 + k * 18, ph = fz * (0.62 + ((k * 37) % 5) * 0.07);
      c.beginPath(); c.moveTo(px, y + h); c.lineTo(px, y + h - ph + 4); c.lineTo(px + 7, y + h - ph - 2); c.lineTo(px + 14, y + h - ph + 4); c.lineTo(px + 14, y + h); c.closePath();
      fs(c, k % 2 ? '#b8875a' : '#a87648', 2);
    }
    rrPath(c, x - 6, y - fz - 4, w + 12, h + 8, 6); fs(c, '#a06a38', 3.5);
    for (let k = 0; k < 7; k++) { c.strokeStyle = 'rgba(70,40,20,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - fz + k * 22 + 4); c.lineTo(x + w, y - fz + k * 22 + 4); c.stroke(); }
    rrPath(c, x - 6, y + h - fz - 2, w + 12, 10, 3); fs(c, '#7a4f2a', 3);
    for (let k = 0; k < 11; k++) {
      const px = x + k * 18.5, ph = 46 + ((k * 53) % 7) * 3;
      c.beginPath(); c.moveTo(px, y - fz); c.lineTo(px, y - fz - ph + 5); c.lineTo(px + 8, y - fz - ph); c.lineTo(px + 16, y - fz - ph + 5); c.lineTo(px + 16, y - fz); c.closePath();
      fs(c, k % 2 ? '#d1a06c' : '#c08b55', 2);
    }
    line(c, x - 2, y - fz - 30, x - 2, y + h - fz - 30, 6, '#c08b55'); line(c, x + w + 2, y - fz - 30, x + w + 2, y + h - fz - 30, 6, '#c08b55');
    line(c, x - 2, y - fz - 140, x - 2, y - fz, 9, '#7a4f2a'); line(c, x + w + 2, y - fz - 140, x + w + 2, y - fz, 9, '#7a4f2a');
    c.restore();
    // Was oben im Haus ist
    const up = [];
    for (const n of this.npcs) if (n.l) up.push({ y: n.y, f: () => this.drawNpc(c, n) });
    for (const pk of this.peeksUp || []) up.push(pk);
    if (p.level === 1 && !this.onStairs() && !p.slide) up.push({ y: p.y, f: drawPlayer });
    up.sort((a, b) => a.y - b.y).forEach(d => d.f());
    c.save(); if (ghost) c.globalAlpha = 0.5;
    for (let k = 0; k < 11; k++) {
      const px = x + 2 + k * 18; if (px + 14 > STAIRS.x - 2 && px < STAIRS.x + STAIRS.w + 2) continue;
      const ph = 30 + ((k * 29) % 4) * 3;
      c.beginPath(); c.moveTo(px, y + h - fz); c.lineTo(px, y + h - fz - ph + 4); c.lineTo(px + 7, y + h - fz - ph); c.lineTo(px + 14, y + h - fz - ph + 4); c.lineTo(px + 14, y + h - fz); c.closePath();
      fs(c, k % 2 ? '#d9a873' : '#c99560', 2);
    }
    line(c, x - 2, y + h, x - 2, y + h - 140, 10, '#8d5a3b'); line(c, x + w + 2, y + h, x + w + 2, y + h - 140, 10, '#8d5a3b');
    c.restore();
  }
  drawRoof(c, alpha) {
    const { x, y, w, h } = HOUSE, eF = y + h - 140, ridge = y + h / 2 - 195, eB = y - 140;
    c.save(); c.globalAlpha = alpha;
    polyPath(c, [[x - 18, ridge], [x + w + 18, ridge], [x + w + 28, eB - 4], [x - 28, eB - 4]]); fs(c, '#7d2e25', 3.5);
    polyPath(c, [[x - 30, eF], [x + w + 30, eF], [x + w + 18, ridge], [x - 18, ridge]]); fs(c, '#9e3b2f', 3.5);
    c.save(); polyPath(c, [[x - 30, eF], [x + w + 30, eF], [x + w + 18, ridge], [x - 18, ridge]]); c.clip();
    const rg = c.createLinearGradient(x - 30, ridge, x + w + 30, eF); rg.addColorStop(0, 'rgba(255,220,180,.28)'); rg.addColorStop(0.5, 'rgba(255,220,180,0)'); rg.addColorStop(1, 'rgba(40,10,5,.25)');
    c.fillStyle = rg; c.fillRect(x - 40, ridge, w + 80, eF - ridge); c.restore();
    c.strokeStyle = 'rgba(60,20,15,.45)'; c.lineWidth = 2;
    for (let k = 1; k < 6; k++) { const yy = lerp(ridge, eF, k / 6); c.beginPath(); c.moveTo(x - 18 - k * 2, yy); c.lineTo(x + w + 18 + k * 2, yy); c.stroke(); }
    for (let k = 0; k < 12; k++) { const xx = x - 20 + k * 21; c.beginPath(); c.moveTo(xx, eF - 4); c.lineTo(xx + 2, eF - 22); c.stroke(); }
    line(c, x - 22, ridge, x + w + 22, ridge, 8, '#6f4518');
    line(c, x + w + 14, ridge, x + w + 26, ridge - 30, 5, '#6f4518');
    polyPath(c, [[x + w + 26, ridge - 30], [x + w + 50, ridge - 26], [x + w + 26, ridge - 18]]); fs(c, '#6bb544', 2.5);
    c.restore();
  }
  drawMarkers(c) {
    const t = this.t, q = this.st.active, diff = this.diff, p = this.p;
    const marks = this.npcs.map(n => { const P = this.npcPos(n); return { id: n.id, x: n.x, y: P.hy - P.hz - 72 }; });
    marks.push({ id: 'gate', x: GATE.x, y: GATE.y - 128 });
    for (const m of marks) {
      const s = this.npcState(m.id), bx = m.x, by = m.y, bob = Math.sin(t * 4 + m.x) * 4;
      if (s === 'done') { if (m.id !== 'gate') { ell(c, bx, by + 8, 13, 13); fs(c, '#06d6a0', 3); icon(c, 'check', bx, by + 8, 20); } continue; }
      if (s === 'locked') continue;
      const big = s === 'boss' || s === 'ready';
      const r = big ? 24 : 20, col = s === 'boss' ? '#ef476f' : s === 'ready' ? '#06d6a0' : s === 'active' || s === 'busy' ? '#118ab2' : '#ffd23f';
      c.save(); if (s === 'waiting') c.globalAlpha = 0.5;
      const pulse = 1 + (big ? Math.sin(t * 8) * 0.08 : 0);
      c.translate(bx, by + bob); c.scale(pulse, pulse);
      polyPath(c, [[-7, r - 4], [7, r - 4], [0, r + 9]]); fs(c, col, 3);
      ell(c, 0, 0, r, r); fs(c, col, 3.5);
      if (s === 'boss') icon(c, 'crown', 0, 0, 30);
      else if (s === 'ready') icon(c, 'bag', 0, 0, 28);
      else if (s === 'active') icon(c, 'search', 0, 0, 26);
      else if (s === 'busy') { const e = this.st.easy[m.id]; txt(c, '!', 0, 1, 26, '#fff'); if (e) for (let i = 0; i < e.steps.length; i++) { ell(c, (i - (e.steps.length - 1) / 2) * 8, r + 16, 3, 3); fs(c, i < e.idx ? '#ffd23f' : '#fff', 1.5); } }
      else txt(c, '!', 0, 1, 28, OL, 'center', null);
      if (s === 'open' || s === 'waiting') { c.globalAlpha = 0.6 * (0.5 + 0.5 * Math.sin(t * 6)); ell(c, 0, 0, r + 6, r + 6); c.lineWidth = 3; c.strokeStyle = '#fff'; c.stroke(); }
      c.restore();
    }
    // Hilfe: großer Pfeil + Lichtkegel über dem Versteck
    if (q && q.hint !== null && q.hint !== undefined && !q.got[q.hint]) {
      const h = q.hidden[q.hint], pk = peekOf(h), zz = h.l ? HOUSE.fz : 0, b = Math.abs(Math.sin(t * 4)) * 16;
      const g = c.createLinearGradient(0, pk.y - zz - 260, 0, pk.y - zz); g.addColorStop(0, 'rgba(255,230,120,0)'); g.addColorStop(1, 'rgba(255,230,120,.45)');
      c.fillStyle = g; polyPath(c, [[pk.x - 18, pk.y - zz - 260], [pk.x + 18, pk.y - zz - 260], [pk.x + 46, pk.y - zz], [pk.x - 46, pk.y - zz]]); c.fill();
      for (let k = 0; k < 2; k++) { const rr = 30 + ((t * 40 + k * 30) % 60); ell(c, pk.x, pk.y - zz, rr, rr * 0.45); c.lineWidth = 4; c.strokeStyle = `rgba(255,214,10,${1 - rr / 90})`; c.stroke(); }
      polyPath(c, [[pk.x - 22, pk.y - zz - 110 - b], [pk.x + 22, pk.y - zz - 110 - b], [pk.x + 22, pk.y - zz - 80 - b], [pk.x + 36, pk.y - zz - 80 - b], [pk.x, pk.y - zz - 46 - b], [pk.x - 36, pk.y - zz - 80 - b], [pk.x - 22, pk.y - zz - 80 - b]]);
      fs(c, '#ffd23f', 4);
    }
    // Schwer: nur ein kurzes, kleines Glitzern aus der Nähe
    if (q && diff === 'hard') q.hidden.forEach((h, i) => {
      if (q.got[i] || dist(h.x, h.y, p.x, p.y) > 150) return;
      const tw = Math.pow(Math.max(0, Math.sin(t * 2.4 + i * 1.3)), 16);
      if (tw > 0.05) { c.globalAlpha = tw; starPath(c, h.x + 8, h.y - (h.l ? HOUSE.fz : 0) - 14, 6, 2, 4); c.fillStyle = '#fff7ae'; c.fill(); c.globalAlpha = 1; }
    });
    // Wortlose "Schau-her"-Hinweise beim ersten Mal
    let hintT = null;
    if (!ACC().tut.symbol) {
      let bd = 1e9; for (const m of marks) { const s = this.npcState(m.id); if (s !== 'open' && s !== 'busy') continue; const d = dist(m.x, m.y, p.x, p.y); if (d < bd) { bd = d; hintT = { x: m.x, y: m.y }; } }
    }
    if (hintT) {
      const b = Math.abs(Math.sin(t * 4)) * 14;
      ell(c, hintT.x, hintT.y, 34 + b * 0.5, 34 + b * 0.5); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke();
      drawHand(c, hintT.x + 16, hintT.y + 22 + b, 1.6);
    }
    if (this.toast) {
      const T = this.toast, k = clamp(T.t * 4, 0, 1), a = 1 - clamp((T.t - 1.4) / 0.6, 0, 1);
      c.save(); c.globalAlpha = a; c.translate(T.x, T.y - (T.l ? HOUSE.fz : 0) - 70 - T.t * 20); c.scale(ease.back(k), ease.back(k));
      ell(c, 0, 0, 26, 26); fs(c, T.kind === 'found' ? '#fff7e6' : '#dee2e6', 3);
      if (T.kind === 'found') drawItem(c, T.item, 0, 0, 36); else if (T.kind === 'junk') { drawJunk(c, 0, 8, T.junk, 1.4); icon(c, 'cross', 14, 12, 18, '#ef476f'); } else icon(c, 'puff', 0, 0, 34);
      if (this.diff !== 'easy') {
        const JN = { twig: 'ein Stöckchen', leaf: 'ein Blatt', pebble: 'ein Steinchen', cap: 'ein Kronkorken' };
        const tx = T.kind === 'found' ? ITEMS[T.item].n + ' gefunden!' : T.kind === 'junk' ? 'Nur ' + JN[T.junk] + ' …' : 'Hier ist nichts.';
        txt(c, tx, 0, 44, 17, T.kind === 'found' ? '#fff' : '#fbf8f2', 'center', BRAND.olive);
      }
      c.restore();
    }
  }
  heat() {
    const q = this.st.active, p = this.p; let bd = 1e9;
    if (!q) return 0;
    q.hidden.forEach((h, i) => { if (!q.got[i]) bd = Math.min(bd, dist(h.x, h.y, p.x, p.y) + (h.l !== p.level && !this.onStairs() ? 60 : 0)); });
    return bd < 80 ? 5 : bd < 170 ? 4 : bd < 300 ? 3 : bd < 460 ? 2 : 1;
  }
  drawHud(c) {
    roundBtn(c, 46, 46, 30, '#fff', 'stop', () => this.stop());
    roundBtn(c, 112, 46, 24, '#bde0fe', 'question', () => { this.helpOpen = true; }, '#118ab2');
    soundBtn(c, W - 40, 46);
    const q = this.st.active;
    if (q && this.diff !== 'easy') {
      const n = q.items.length, iw = Math.min(48, (W - 40) / (n + 1.6)), w = iw * (n + 1.4) + 16, x0 = W / 2 - w / 2, y0 = 82;
      panel(c, x0, y0, w, iw + 18, '#fff7e6', 18);
      drawFace(c, q.npc, x0 + 10 + iw * 0.6, y0 + iw + 6, iw / 70, this.t, { noShadow: true });
      q.items.forEach((it, k) => {
        const x = x0 + 8 + iw * (1.4 + k) + iw / 2, y = y0 + 9 + iw / 2;
        c.save(); if (!q.got[k]) c.globalAlpha = 0.35; drawItem(c, it, x, y, iw * 0.9); c.restore();
        if (q.got[k]) icon(c, 'check', x + iw * 0.3, y + iw * 0.3, iw * 0.42, '#06d6a0');
      });
    }
    // Fortschritt: 5 Tiere + Ausgang
    const fw = 40, ids = ALL_IDS, fx = W / 2 - (ids.length - 1) * fw / 2, fy = H - 30;
    rrPath(c, fx - 30, fy - 26, (ids.length - 1) * fw + 60, 46, 23); c.fillStyle = 'rgba(30,20,10,.45)'; c.fill();
    ids.forEach((id, i) => {
      const x = fx + i * fw, done = this.st.done[id];
      c.save(); if (!done) c.globalAlpha = 0.55;
      if (id === 'gate') drawGate(c, x, fy + 14, 0.26, done ? 1 : 0, !this.bossOpen(), 0); else drawCritter(c, id, x, fy + 14, 0.55, 0, { noShadow: true });
      c.restore();
      if (done) icon(c, 'check', x + 10, fy + 6, 16, '#06d6a0');
    });
    // Hilfe-Knopf: füllt sich in 2,5 Minuten Suchzeit, dann zeigt er ein fehlendes Teil
    const hq = this.st.active;
    if (this.canSearch() && hq) {
      const HELP = 150, f = clamp((hq.helpT || 0) / HELP, 0, 1), ready = f >= 1, hx = W - 150, hy = H - 112;
      const pu = ready ? 1 + Math.sin(this.t * 6) * 0.08 : 1;
      c.save(); c.translate(hx, hy); c.scale(pu, pu);
      ell(c, 0, 4, 32, 32); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill();
      ell(c, 0, 0, 32, 32); fs(c, ready ? '#ffd166' : '#e9ecef', 4);
      if (!ready) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 26, -Math.PI / 2, -Math.PI / 2 + f * TAU); c.closePath(); c.fillStyle = 'rgba(255,209,102,.7)'; c.fill(); }
      c.globalAlpha = ready ? 1 : 0.55; icon(c, 'star', 0, 0, 34, ready ? '#fff' : '#adb5bd'); c.globalAlpha = 1;
      c.restore();
      txt(c, 'Hilfe', hx, hy + 44, 13, '#fff');
      if (ready) UI.btn(hx - 40, hy - 40, 80, 90, () => {
        let k = -1, bd = 1e9; hq.hidden.forEach((h, i) => { if (hq.got[i]) return; const d = dist(h.x, h.y, this.p.x, this.p.y); if (d < bd) { bd = d; k = i; } });
        if (k >= 0) { hq.hint = k; hq.helpT = 0; Save.write(); Sfx.play('good'); FX.sparkle(hx, hy, 16, '#ffd23f'); }
      });
      // Pfeil am Rand, wenn das markierte Teil nicht im Bild ist
      if (hq.hint !== null && hq.hint !== undefined && !hq.got[hq.hint]) {
        const h = hq.hidden[hq.hint], pk = peekOf(h), sp2 = this.w2s(pk.x, pk.y, h.l ? HOUSE.fz : 0);
        if (sp2.x < 20 || sp2.x > W - 20 || sp2.y < 120 || sp2.y > H - 150) {
          const ax = clamp(sp2.x, 50, W - 50), ay = clamp(sp2.y, 150, H - 170), ang = Math.atan2(sp2.y - H / 2, sp2.x - W / 2);
          c.save(); c.translate(ax, ay); c.rotate(ang); polyPath(c, [[26, 0], [-12, -20], [-4, 0], [-12, 20]]); fs(c, '#ffd23f', 4); c.restore();
        }
      }
    }
    // Lupe zum Suchen + Spürnase (Mittel)
    if (this.canSearch()) {
      const bx = W - 58, by = H - 112, pulse = !ACC().tut.search ? 1 + Math.sin(this.t * 6) * 0.08 : 1;
      c.save(); c.translate(bx, by); c.scale(pulse, pulse);
      roundBtn(c, 0, 0, 38, this.searching ? '#ffd166' : '#fff', 'search', null);
      c.restore();
      UI.btn(bx - 46, by - 46, 92, 92, () => this.startSearch());
      if (!ACC().tut.search) drawHand(c, bx + 4, by + 30 + Math.abs(Math.sin(this.t * 4)) * 10, 1.4);
      if (this.diff === 'medium') {
        const h = this.heat(), px = bx - 30, py = by - 112;
        panel(c, px - 4, py, 68, 64, '#3d2c1f', 16);
        ell(c, px + 30, py + 18, 12, 9); fs(c, '#2b1d14', 2.5, '#000'); ell(c, px + 26, py + 15, 3, 2); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
        const cols = ['#4dabf7', '#74c0fc', '#ffd166', '#f78c6b', '#ef476f'];
        for (let i = 0; i < 5; i++) { rrPath(c, px + 6 + i * 11, py + 50 - (i + 1) * 4, 8, (i + 1) * 4, 2); c.fillStyle = i < h ? cols[h - 1] : 'rgba(255,255,255,.2)'; c.fill(); }
      }
    }
    if (this.helpOpen) {
      const T = this.diff === 'easy' ? [
        'Tippe auf die Tiere mit dem gelben Ausrufezeichen. Jedes Tier hat ein paar Aufgaben für dich.',
        'Wenn alle Tiere fertig sind, geht das Tor zum Parkplatz auf. Dort wartet die letzte Aufgabe.',
        'Laufen: Tippe irgendwo hin oder zieh mit dem Finger.',
      ] : [
        'Sprich mit den Tieren mit dem gelben Ausrufezeichen. Oben siehst du dann, welche Dinge sie suchen.',
        'Die Dinge liegen hinter Steinen und Büschen oder gucken aus dem Boden. Aber Vorsicht: Manchmal ist es nur ein Stöckchen!',
        'Geh hin und tippe auf die Lupe zum Suchen. Dann musst du dir das Ding mit einem Rätsel oder einer Geschicklichkeits-Aufgabe verdienen.',
        this.diff === 'medium' ? 'Die Spürnase zeigt dir, wie nah du an einem Versteck bist: viele rote Striche = ganz nah.' : 'Halte nach kleinen Zipfeln und einem kurzen Glitzern Ausschau.',
        'Hast du alles, bring es zurück zum Tier. Wenn du lange nichts findest, leuchtet der Hilfe-Stern auf.',
        'Wenn alle Tiere fertig sind, stellt das Tor zum Parkplatz die letzte große Aufgabe.',
      ];
      helpPanel(c, T, () => { this.helpOpen = false; });
    }
    const j = this.joy;
    if (j && j.moved) {
      ell(c, j.x0, j.y0, 54, 54); c.fillStyle = 'rgba(255,255,255,.18)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.5)'; c.stroke();
      const dx = j.x - j.x0, dy = j.y - j.y0, d = Math.hypot(dx, dy), k = Math.min(1, 50 / (d || 1));
      ell(c, j.x0 + dx * k, j.y0 + dy * k, 24, 24); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill();
    }
  }
}

// ---------- Auftrags-Dialog (ohne Text, nur Bilder) ----------
// Namen + Sätze der Tiere (Text für die Älteren; Leicht bleibt bei Bildern)
const NPC_NAMES = { hase: 'Hase Hoppel', fuchs: 'Fuchs Fridolin', igel: 'Igel Ida', waschbaer: 'Waschbär Willi', eule: 'Eule Emma', gate: 'Das Tor' };
const NPC_LINES = {
  hase: 'Beim Schaukeln ist mir einiges aus der Tasche gefallen!',
  fuchs: 'Ich wollte gerade spielen – aber meine Sachen sind weg!',
  igel: 'Ich habe alles versteckt und vergessen, wo!',
  waschbaer: 'Irgendwer hat meine Spielsachen auf dem Spielplatz verteilt!',
  eule: 'Von hier oben sehe ich viel – nur meine Sachen nicht!',
};
function itemList(ids) { const n = ids.map(i => (ITEMS[i] || FOOD[i] || { n: i }).n); return n.length > 1 ? n.slice(0, -1).join(', ') + ' und ' + n[n.length - 1] : n[0] || ''; }
function questText(o) {
  if (o.mode === 'lock') return 'Das Tor zum Parkplatz geht erst auf, wenn alle 5 Tiere zufrieden sind. Geschafft: ' + o.done + ' von 5.';
  if (o.mode === 'busy') return 'Hilf zuerst ' + NPC_NAMES[o.other] + ' – danach bin ich dran!';
  if (o.mode === 'progress') { const miss = o.items.filter((_, i) => !o.got[i]); return 'Dir fehlen noch: ' + itemList(miss) + '. Schau hinter Steinen und Büschen und im Hackschnitzel!'; }
  if (o.npc === 'gate') return 'Das Tor klemmt! Bring mir ' + itemList(o.items) + ', dann geht es auf und du kommst zum Parkplatz.';
  return (NPC_LINES[o.npc] || '') + ' Kannst du ' + itemList(o.items) + ' für mich finden?';
}

class QuestDialog {
  constructor(o) { this.o = o; this.t = 0; }
  update(dt) { this.t += dt; }
  close() { if (overlay === this) overlay = null; }
  draw(c) {
    const o = this.o, k = ease.back(clamp(this.t * 4, 0, 1));
    c.fillStyle = `rgba(16,28,18,${0.55 * clamp(this.t * 5, 0, 1)})`; c.fillRect(0, 0, W, H);
    const older = scene && scene.diff && scene.diff !== 'easy';
    const lines = older ? wrapLines(c, questText(o), Math.min(W - 28, 460) - 48, 16) : [];
    const w = Math.min(W - 28, 460), h = 300 + (older ? 34 + lines.length * 22 : 0), x = (W - w) / 2, y = (H - h) / 2;
    c.save(); c.translate(W / 2, H / 2); c.scale(k, k); c.translate(-W / 2, -H / 2);
    panel(c, x, y, w, h, '#fff7e6', 26);
    ell(c, x + 70, y + 110, 52, 52); fs(c, '#d8f3dc', 3);
    if (o.npc === 'gate') drawGate(c, x + 70, y + 150, 0.75, 0, o.mode === 'lock', this.t);
    else drawCritter(c, o.npc, x + 70, y + 150, 1.9, this.t, { wave: true, noShadow: true });
    const bx = x + 135, by = y + 26, bw = w - 155, bh = 170;
    rrPath(c, bx, by, bw, bh, 20); fs(c, '#fff', 3.5);
    polyPath(c, [[bx + 2, by + 70], [bx - 16, by + 86], [bx + 2, by + 96]]); fs(c, '#fff', 0);
    c.beginPath(); c.moveTo(bx, by + 70); c.lineTo(bx - 16, by + 86); c.lineTo(bx, by + 96); c.lineWidth = 3.5; c.strokeStyle = OL; c.stroke();
    if (o.mode === 'lock') {
      for (let i = 0; i < 5; i++) { const px = bx + bw / 2 + (i - 2) * Math.min(48, bw / 5.5); drawCritter(c, NPC_DEFS[i].id, px, by + 90, 0.62, 0, { noShadow: true }); if (i < o.done) icon(c, 'check', px + 10, by + 100, 18, '#06d6a0'); }
      icon(c, 'lock', bx + bw / 2, by + 135, 32);
    } else if (o.mode === 'busy') {
      drawFace(c, o.other, bx + 40, by + 70, 0.9, this.t, { noShadow: true });
      icon(c, 'back', bx + 92, by + 50, 30, '#ffd166');
      this.items(c, bx + 10, by + 92, bw - 20, 70, o.items, o.got);
    } else {
      if (o.boss) icon(c, 'crown', bx + bw - 26, by + 24, 32);
      this.items(c, bx + 10, by + 14, bw - 20, bh - 28, o.items, o.mode === 'progress' ? o.got : null);
      if (o.mode === 'progress') icon(c, 'search', bx + 24, by + bh - 22, 30);
    }
    if (older) {
      txt(c, NPC_NAMES[o.npc] || '', x + 24, y + 222, 16, BRAND.olive, 'left', null);
      lines.forEach((l, i) => txt(c, l, x + 24, y + 248 + i * 22, 16, '#3d2c1f', 'left', null));
    }
    c.restore();
    if (this.t > 0.2) {
      const yb = y + h - 46;
      if (o.mode === 'offer') {
        roundBtn(c, W / 2 + 50, yb, 32, '#06d6a0', 'check', () => { this.close(); if (o.onYes) o.onYes(); });
        roundBtn(c, W / 2 - 50, yb, 26, '#ced4da', 'cross', () => this.close());
      } else roundBtn(c, W / 2, yb, 30, '#06d6a0', 'check', () => this.close());
    }
  }
  items(c, x, y, w, h, items, got) {
    const n = items.length, cols = Math.min(n, n > 4 ? Math.ceil(n / 2) : n), rows = Math.ceil(n / cols);
    const s = Math.min(w / cols, h / rows, 70);
    items.forEach((it, i) => {
      const cx = x + w / 2 + ((i % cols) - (cols - 1) / 2) * s, cy = y + h / 2 + (Math.floor(i / cols) - (rows - 1) / 2) * s;
      const pop = ease.back(clamp(this.t * 4 - i * 0.15, 0, 1));
      c.save(); c.translate(cx, cy); c.scale(pop, pop);
      if (got && !got[i]) c.globalAlpha = 0.4;
      drawItem(c, it, 0, 0, s * 0.82); c.restore();
      if (got && got[i]) icon(c, 'check', cx + s * 0.28, cy + s * 0.28, s * 0.4, '#06d6a0');
    });
  }
  down() {} move() {} up() {}
}
