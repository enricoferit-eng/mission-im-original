'use strict';
// ---------- Offene Welt: die 6 Bereiche liegen nebeneinander wie auf dem Luftbild ----------
//            [Küche][ Innenbereich ]
//                [   Außenbereich    ]
//      [Spielplatz]            [ Chalet ]
//  [ Kreisel + Parkplatz      ]
// Man läuft über Durchgänge nahtlos weiter; Nachbarbereiche sieht man am Rand schon. Ein Bereich ist erst offen,
// wenn der vorige (Reihenfolge der Geschichte) geschafft ist.
// Jeder Bereich liegt an seiner echten Stelle (linke obere Ecke in Welt-Koordinaten) und hat seine eigene Größe.
// Lage wie auf dem Luftbild (Gebäude-Achse waagerecht): oben Küche + Glashaus, darunter Terrasse, links unten Spielplatz,
// darunter Kreisel + Parkplatz, rechts unten das Chalet mit dem großen Haus. Dazwischen und rundherum: Gelände.
const WORLD_XY = { kueche: [1000, 0], gastraum: [2400, 0], aussen: [2100, 1000], spielplatz: [1100, 1200], parkplatz: [0, 2600], chalet: [2900, 1800] };
const areaW = id => (STAGE_DEFS[id] && STAGE_DEFS[id].w) || 1000, areaH = id => (STAGE_DEFS[id] && STAGE_DEFS[id].h) || 1400;
const offOf = (from, to) => [WORLD_XY[to][0] - WORLD_XY[from][0], WORLD_XY[to][1] - WORLD_XY[from][1]];
function worldBox() { const ids = Object.keys(WORLD_XY); return { x0: Math.min(...ids.map(k => WORLD_XY[k][0])) - TERRAIN_PAD, y0: Math.min(...ids.map(k => WORLD_XY[k][1])) - TERRAIN_PAD, x1: Math.max(...ids.map(k => WORLD_XY[k][0] + areaW(k))) + TERRAIN_PAD, y1: Math.max(...ids.map(k => WORLD_XY[k][1] + areaH(k))) + TERRAIN_PAD }; }
const TERRAIN_PAD = 1000;
// Bereiche, die einander berühren oder sehr nah sind (für Vorab-Laden und Speicher)
const nearAreas = id => Object.keys(WORLD_XY).filter(k => k !== id && WORLD_XY[k][0] < WORLD_XY[id][0] + areaW(id) + 400 && WORLD_XY[k][0] + areaW(k) > WORLD_XY[id][0] - 400 && WORLD_XY[k][1] < WORLD_XY[id][1] + areaH(id) + 400 && WORLD_XY[k][1] + areaH(k) > WORLD_XY[id][1] - 400);
// Durchgänge: side = Seite von a; r = Bereich entlang der Kante; gate = dort steht das Boss-Tor von a
const LINKS = [
  { a: 'kueche', side: 'right', b: 'gastraum', r: [220, 300], gate: true },
  { a: 'gastraum', side: 'bottom', b: 'aussen', r: [650, 780], gate: true },
  { a: 'aussen', side: 'left', b: 'spielplatz', r: [520, 640], gate: true },
  { a: 'spielplatz', side: 'bottom', b: 'parkplatz', r: [450, 570], gate: true },
  { a: 'parkplatz', side: 'right', b: 'chalet', r: [500, 620], bar: 'fence' },
  { a: 'aussen', side: 'bottom', b: 'chalet', r: [1400, 1480], bar: 'garden' },
];
const OPP = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' };
function areaCleared(diff, id) { return SP(diff, id).clears > 0; }
function areaUnlocked(diff, id) {
  if (isGameAdmin()) return true;
  const i = STAGE_ORDER.indexOf(id); if (i <= 0) return true;
  return STAGE_ORDER.slice(0, i).every(k => areaCleared(diff, k));   // streng: alle Bereiche davor müssen geschafft sein
}
const linkOpen = (diff, L) => areaUnlocked(diff, L.a) && areaUnlocked(diff, L.b);
// Durchgänge eines Bereichs; r = Lage entlang der Kante in den Koordinaten DIESES Bereichs (die Bereiche liegen versetzt)
function exitsOf(id) {
  return LINKS.filter(L => L.a === id || L.b === id).map(L => {
    const side = L.a === id ? L.side : OPP[L.side], to = L.a === id ? L.b : L.a, horiz = side === 'top' || side === 'bottom';
    const sh = L.a === id ? 0 : (horiz ? WORLD_XY[L.a][0] - WORLD_XY[id][0] : WORLD_XY[L.a][1] - WORLD_XY[id][1]);
    return { L, side, to, r: [L.r[0] + sh, L.r[1] + sh] };
  });
}

// Durchgänge ins Raster schneiden (offen) bzw. am Rand dicht machen (gesperrt)
function carveLinks(id, diff) {
  for (const E of exitsOf(id)) {
    const open = linkOpen(diff, E.L), [r0, r1] = E.r, horiz = E.side === 'top' || E.side === 'bottom';
    for (let k = 0; k < (horiz ? GW : GH); k++) {
      const mid = k * CELL + CELL / 2; if (mid < r0 || mid > r1) continue;
      for (let d = 0; d < 44; d++) {
        const cx = horiz ? k : (E.side === 'left' ? d : GW - 1 - d), cy = horiz ? (E.side === 'top' ? d : GH - 1 - d) : k;
        if (cx < 0 || cy < 0 || cx >= GW || cy >= GH) break;
        const i = cy * GW + cx;
        if (!open) { if (d < 3) G0[i] = 0; else break; continue; }
        if (G0[i] && d > 1) break;
        G0[i] = 1;
      }
    }
  }
}
// Boden + Raster eines anderen Bereichs kurz "ausleihen"
function withStage(id, fn) { const cur = SG && SG.id; useStage(id); try { fn(); } finally { if (cur) useStage(cur); } }
// Gelände rund um alle Bereiche (Wiese, Straßen, Kreisel, L114 …) – ein großes, grobes Bild für die ganze Welt
let TERRAIN = null;
function terrainImage() {
  if (TERRAIN) return TERRAIN;
  const B = worldBox(), Q = 0.35, cv = document.createElement('canvas'); cv.width = Math.ceil((B.x1 - B.x0) * Q); cv.height = Math.ceil((B.y1 - B.y0) * Q);
  const g = cv.getContext('2d'); g.scale(Q, Q); g.translate(-B.x0, -B.y0); paintTerrain(g, B, mulberry32(77));
  TERRAIN = { cv, B }; return TERRAIN;
}
function terrainTree(g, x, y, rr, col) { g.fillStyle = 'rgba(0,0,0,.18)'; ell(g, x + rr * 0.5, y + rr * 0.35, rr * 1.1, rr * 0.5); g.fill(); rrPath(g, x - 6, y - rr * 0.6, 12, rr * 0.7, 4); fs(g, '#8d5a3b', 2.5);
  for (const [dx, dy, k] of [[-rr * 0.55, -rr * 1.0, 0.7], [rr * 0.55, -rr * 1.05, 0.72], [0, -rr * 1.45, 0.8]]) { ell(g, x + dx, y + dy, rr * k, rr * k * 0.9); fs(g, col, 2.5); } }
// Umgebung wie auf dem Luftbild: Wiesen + Bäume, links die Brühlstraße in den Kreisel, rechts und unten die L114
function paintTerrain(g, B, R) {
  const W0 = B.x1 - B.x0, H0 = B.y1 - B.y0;
  g.fillStyle = '#7fb069'; g.fillRect(B.x0, B.y0, W0, H0);
  for (let i = 0; i < W0 * H0 / 7000; i++) { const x = B.x0 + R() * W0, y = B.y0 + R() * H0; g.fillStyle = ['#6a994e', '#8cbf6f', '#a7c957', '#5b8c45'][i % 4]; g.fillRect(x, y, 7, 7); }
  const road = (pts, w, mark) => { g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    const pathIt = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]); };
    pathIt(); g.strokeStyle = '#b8b2a6'; g.lineWidth = w + 24; g.stroke(); pathIt(); g.strokeStyle = '#6c7177'; g.lineWidth = w; g.stroke();
    if (mark) { pathIt(); g.setLineDash([60, 50]); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 8; g.stroke(); g.setLineDash([]); }
    g.restore(); };
  // L114: rechts am Glashaus vorbei nach unten, dann quer unter allem durch (mit Zebrastreifen-Markierung oben)
  road([[4900, B.y0], [4900, 3700], [4500, 4500], [3000, 4700], [B.x0, 4700]], 300, true);
  g.save(); g.fillStyle = 'rgba(255,255,255,.8)'; for (let k = 0; k < 6; k++) g.fillRect(4770 + k * 46, 200, 24, 260); g.restore();
  // Brühlstraße: von links oben in den Kreisel (Kreisel liegt im Parkplatz bei 760 / 2960)
  road([[B.x0, 1600], [-300, 2300], [0, 2960]], 150, false);
  // Feld oben links + Nachbar-Parkplatz oben (wie auf dem Luftbild)
  g.fillStyle = '#c9c3b8'; g.fillRect(-200, -800, 1100, 700); for (let k = 0; k < 7; k++) { g.save(); g.translate(-100 + k * 150, -500); drawCar(g, 0, 0, 0.2, ['#adb5bd', '#343a40', '#e9ecef', '#4dabf7'][k % 4], 1.1); g.restore(); }
  g.fillStyle = '#b5a46a'; g.fillRect(2600, -1000, 2100, 900); for (let y = -980; y < -120; y += 40) { g.fillStyle = 'rgba(120,100,40,.25)'; g.fillRect(2600, y, 2100, 6); }
  // Hecken + Bäume rund um die Anlage (nicht auf den Bereichen)
  const inArea = (x, y, m = 120) => Object.keys(WORLD_XY).some(k => x > WORLD_XY[k][0] - m && x < WORLD_XY[k][0] + areaW(k) + m && y > WORLD_XY[k][1] - m && y < WORLD_XY[k][1] + areaH(k) + 200);
  const onRoad = (x, y) => (x > 4650 && x < 5150) || (y > 4450 && y < 4950) || (x < 100 && y > 1500 && y < 3100);
  for (let k = 0; k < 260; k++) { const x = B.x0 + R() * W0, y = B.y0 + R() * H0, rr = 50 + R() * 30; if (inArea(x, y) || onRoad(x, y)) continue;   // gemischt: Laubbäume, Nadelbäume, Büsche, blühende Bäume
    const kind = k % 5;
    if (kind === 3) { g.fillStyle = 'rgba(0,0,0,.18)'; ell(g, x + rr * 0.4, y + 6, rr * 0.8, rr * 0.35); g.fill(); rrPath(g, x - 5, y - 20, 10, 24, 3); fs(g, '#6f4e37', 2); for (let j = 0; j < 3; j++) { polyPath(g, [[x - rr * (0.75 - j * 0.18), y - 16 - j * rr * 0.45], [x, y - 16 - (j + 1.4) * rr * 0.45], [x + rr * (0.75 - j * 0.18), y - 16 - j * rr * 0.45]]); fs(g, j % 2 ? '#2d6a4f' : '#1b4332', 2.5); } }
    else if (kind === 4) { for (const [dx, dy, s2] of [[-rr * 0.4, 0, 0.5], [rr * 0.35, 4, 0.45], [0, -rr * 0.25, 0.55]]) { ell(g, x + dx, y + dy, rr * s2, rr * s2 * 0.8); fs(g, '#74c69d', 2.5); } }
    else terrainTree(g, x, y, rr, ['#40916c', '#52b788', '#2d6a4f'][k % 3]);
    if (kind === 1 && k % 3 === 0) for (let j = 0; j < 9; j++) { ell(g, x + (R() - 0.5) * rr * 1.4, y - rr * (0.7 + R() * 0.9), 6, 6); g.fillStyle = ['#ffc8dd', '#fff', '#ffafcc'][j % 3]; g.fill(); }   // blühend
  }
  // Wiese rechts vom Außenbereich: Blumenbeete
  for (const [x, y, w, h] of [[4050, 1150, 260, 90], [4300, 1500, 220, 80], [4000, 1800, 300, 90]]) { rrPath(g, x, y, w, h, 40); fs(g, '#8d6346', 3); for (let j = 0; j < w * h / 260; j++) { const fx = x + 14 + R() * (w - 28), fy = y + 12 + R() * (h - 24); ell(g, fx, fy, 7, 7); g.fillStyle = ['#ef476f', '#ffd166', '#9b5de5', '#fff', '#f77f00'][j % 5]; g.fill(); ell(g, fx, fy, 2.5, 2.5); g.fillStyle = '#ffd60a'; g.fill(); } }
  // Wiese zwischen Spielplatz, Terrasse, Chalet und Parkplatz: Hecke mit kleinem Weg
  for (let x = 2100; x < 2900; x += 30) { ell(g, x, 2560, 26, 22); fs(g, x % 60 ? '#2d6a4f' : '#40916c', 2); }
}
function worldPrepare(id, diff) {
  for (const nb of nearAreas(id)) if (!GROUND_CACHE[nb] && areaUnlocked(diff, nb)) withStage(nb, () => buildGround());
}
// Nachbarn eines Play-Objekts: Böden, Deko, Tore, Figuren, Effekte
function worldNeighbors(play) {
  const id = play.stage, near = nearAreas(id);
  // Speicher sparen: nur aktueller Bereich + direkte Nachbarn behalten
  const keep = new Set([id].concat(near));
  for (const k in GROUND_CACHE) if (!keep.has(k)) delete GROUND_CACHE[k];
  for (const k in SPR) { const i = k.indexOf('_d_'); if (i > 0 && !keep.has(k.slice(0, i))) delete SPR[k]; }
  play.nb = []; play.nbExtras = [];
  const B = worldBox(), [X0, Y0] = WORLD_XY[id];
  play.wb = { x0: B.x0 + 600 - X0, x1: B.x1 - 600 - X0, y0: B.y0 + 600 - Y0, y1: B.y1 - 600 - Y0 };
  for (const sid of near) {
    const [ox, oy] = offOf(id, sid), w = areaW(sid), h = areaH(sid);
    if (!areaUnlocked(play.diff, sid)) { play.nb.push({ fog: sid, ox, oy, w, h }); continue; }   // noch nicht freigeschaltet: Nebel
    const N = { id: sid, ox, oy, w, h, D: STAGE_DEFS[sid] };
    const run = SP(play.diff, sid).run, lay = run && run.layout;
    N.npcs = N.D.npcs.filter(n => n.pos).map(n => { const p = n.pos[lay && lay[n.id] != null ? lay[n.id] : 0]; return { id: n.id, x: p[0], y: p[1], l: p[2] || 0, done: !!(run && run.done[n.id]) }; });
    play.nb.push(N);
    if (N.D.extras) {   // Effekte des Nachbarn (Dach, Lichter, Schnee ...), mit umgerechneter Spielerposition
      const proxy = { get p() { return { x: play.p.x - ox, y: play.p.y - oy, level: 0 }; }, stage: sid, diff: play.diff };
      let ex = null; withStage(sid, () => { ex = N.D.extras(proxy); });
      play.nbExtras.push({ ex, ox, oy, id: sid, w, h });
    }
  }
  if (!play.mp) carveLinks(id, play.diff);   // withStage hat das Raster neu gebaut
}
Object.assign(Play.prototype, {
  checkCross() {
    const p = this.p; if (this.exiting || p.level || this.mp) return false;
    for (const E of exitsOf(this.stage)) {
      if (!linkOpen(this.diff, E.L)) continue;
      const [r0, r1] = E.r, along = E.side === 'top' || E.side === 'bottom' ? p.x : p.y;
      if (along < r0 - 20 || along > r1 + 20) continue;
      if ((E.side === 'bottom' && p.y > WORLD_H - 16) || (E.side === 'top' && p.y < 16) || (E.side === 'left' && p.x < 16) || (E.side === 'right' && p.x > WORLD_W - 16)) { this.crossTo(E); return true; }
    }
    return false;
  },
  crossTo(E) {
    const [ox, oy] = offOf(this.stage, E.to), p = this.p, tw = areaW(E.to), th = areaH(E.to);
    let nx = p.x - ox, ny = p.y - oy;
    if (E.side === 'bottom') ny = 24; if (E.side === 'top') ny = th - 24; if (E.side === 'right') nx = 24; if (E.side === 'left') nx = tw - 24;
    nx = clamp(nx, 24, tw - 24); ny = clamp(ny, 24, th - 24);
    Save.write(); overlay = null; Voice.stop();
    setScene(new Play(this.diff, { stage: E.to, enter: { x: nx, y: ny, dir: p.dir }, cam: { x: this.camX - ox, y: this.camY - oy }, joy: this.joy }));
  },
  tapOutside(w) {
    if (w.x >= 0 && w.x <= WORLD_W && w.y >= 0 && w.y <= WORLD_H) return false;
    const side = w.y > WORLD_H ? 'bottom' : w.y < 0 ? 'top' : w.x < 0 ? 'left' : 'right';
    const E = exitsOf(this.stage).filter(e => linkOpen(this.diff, e.L)).sort((a, b) => (a.side === side ? 0 : 1) - (b.side === side ? 0 : 1))[0];
    if (!E) { Sfx.play('bad'); return true; }
    const [r0, r1] = E.r, horiz = E.side === 'top' || E.side === 'bottom', al = clamp(horiz ? w.x : w.y, r0 + 10, r1 - 10);
    const tx = horiz ? al : (E.side === 'left' ? 12 : WORLD_W - 12), ty = horiz ? (E.side === 'top' ? 12 : WORLD_H - 12) : al;
    const path = findPath(this.p.x, this.p.y, this.p.level, tx, ty, 0, false);
    if (path) { this.p.path = path; this.p.target = null; this.tapMark = { x: tx, y: ty, l: 0, t: 0 }; }
    return true;
  },
  drawNbGrounds(c) {
    { const T = terrainImage(), [X0, Y0] = WORLD_XY[this.stage]; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(T.cv, T.B.x0 - X0, T.B.y0 - Y0, T.B.x1 - T.B.x0, T.B.y1 - T.B.y0);   // Gelände unter allem
      // ab und zu fährt ein Auto auf der L114 vorbei
      const P = [[4900, T.B.y0], [4900, 3700], [4500, 4500], [3000, 4700], [T.B.x0, 4700]], len = []; let tot = 0; for (let k = 1; k < P.length; k++) { const l = dist(P[k - 1][0], P[k - 1][1], P[k][0], P[k][1]); len.push(l); tot += l; }
      for (const [off, col, dir] of [[0, '#e63946', 1], [0.45, '#118ab2', -1]]) { const per = tot / 520 + 9, ph = ((this.t / per) + off) % 1, dd = (dir > 0 ? ph : 1 - ph) * (tot + 4000) - 2000; if (dd < 0 || dd > tot) continue; let rem = dd, k = 0; while (k < len.length - 1 && rem > len[k]) { rem -= len[k]; k++; } const a = P[k], b = P[k + 1], f = rem / len[k], gx = a[0] + (b[0] - a[0]) * f, gy = a[1] + (b[1] - a[1]) * f, ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (dir < 0 ? Math.PI : 0), side = dir > 0 ? 70 : -70; const nx = -Math.sin(Math.atan2(b[1] - a[1], b[0] - a[0])) * side, ny = Math.cos(Math.atan2(b[1] - a[1], b[0] - a[0])) * side;
        const x = gx + nx - X0, y = gy + ny - Y0; if (x > this.camX - W && x < this.camX + W && y > this.camY - H && y < this.camY + H) drawCar(c, x, y, ang + Math.PI / 2, col, 1.3, { lights: true }); } }
    for (const N of this.nb || []) {
      if (!this.tileVisible(N.ox, N.oy, N.w, N.h)) continue;
      if (N.fog) { drawFog(c, N.ox, N.oy, N.fog, this.t); continue; }
      const img = GROUND_CACHE[N.id];
      if (img) c.drawImage(img, N.ox, N.oy, N.w, N.h);
    }
  },
  tileVisible(ox, oy, w = 1000, h = 1400) {
    const z = this.zoom, hw = W / 2 / z, hh = H / 2 / z;
    return ox < this.camX + hw + 300 && ox + w > this.camX - hw - 300 && oy < this.camY + hh + 400 && oy + h > this.camY - hh - 300;
  },
  pushNb(c, L, t) {
    const z = this.zoom, vx0 = this.camX - W / 2 / z - 160, vx1 = this.camX + W / 2 / z + 160, vy0 = this.camY - H / 2 / z - 80, vy1 = this.camY + H / 2 / z + 320;
    const inView = (x0, y0, w, h) => !(x0 > vx1 || x0 + w < vx0 || y0 > vy1 || y0 + h < vy0);
    // eigene Durchgangs-Sperren + Wegweiser
    pushLinkBarriers(c, L, this.stage, 0, 0, this.diff, t);
    pushSigns(c, L, this.stage, this.diff, t);
    for (const N of this.nb || []) {
      if (N.fog || !this.tileVisible(N.ox, N.oy, N.w, N.h)) continue;
      const { ox, oy, D } = N, tr = f => () => { c.save(); c.translate(ox, oy); f(); c.restore(); };
      const lpN = typeof lpFor === 'function' && lpFor(N.id);   // Low-Poly: Möbel/Deko sind schon im Bodenbild
      for (const d of (lpN ? [] : D.decor)) {
        const bb = BB_CACHE[N.id + '_d_' + d.id] || decorBB(d); if (!inView(bb[0] + ox, bb[1] + oy, bb[2], bb[3] + 100)) continue;
        const fn = decorStatic(N.id, D, d); if (fn) L.push({ y: d.y + (d.zy || 0) + (d.t === 'bench' ? 10 : 0) + oy, f: tr(() => fn(c, t)) });
      }
      if (N.id === 'spielplatz') pushPlaygroundProps(c, L, ox, oy, inView, lpN);
      const G = D.gate, cl = areaCleared(this.diff, N.id);
      if (G && inView(G.x - 120 + ox, G.y - 220 + oy, 240, 260)) L.push({ y: G.y + oy, f: tr(() => (D.drawGate || drawGate)(c, G.x, G.y, 1, cl ? 1 : 0, !cl, t)) });
      for (const n of N.npcs) if (inView(n.x - 40 + ox, n.y - 120 + oy, 80, 130)) L.push({ y: n.y + oy, f: tr(() => { if (!(lpN && lpDrawStaff(c, n, n.x, n.y, t, false, N.id))) drawCritter(c, n.id, n.x, n.y, 1.12, t, { staff: true, ph: n.x }); }) });
      pushLinkBarriers(c, L, N.id, ox, oy, this.diff, t);
    }
    for (const E of this.nbExtras || []) {
      if (!this.tileVisible(E.ox, E.oy, E.w, E.h) || !E.ex.draw) continue;
      const Lp = { push: o => L.push({ y: o.y + E.oy, f: () => { c.save(); c.translate(E.ox, E.oy); o.f(); c.restore(); } }) };
      E.ex.draw(c, Lp, (x, y) => x + E.ox > vx0 && x + E.ox < vx1 && y + E.oy > vy0 && y + E.oy < vy1, t);
    }
  },
});
// Sprite-Bereich einer Deko (großzügig, damit nichts abgeschnitten wird)
function decorBB(d) {
  if (d.bb) return [d.bb[0] - 24, d.bb[1] - 30, d.bb[2] + 48, d.bb[3] + 54];
  const T = { yucca: [-48, -62, 96, 76], cypress: [-42, -232, 84, 246], planter: [-52, -72, 104, 90], potpalm: [-46, -92, 92, 102], gatesign: [-56, -116, 112, 126], board: [-42, -102, 84, 116], lamp: [-16, -190, 54, 200], bench: [-52, -26, 104, 52] }[d.t];
  if (T) return [d.x + T[0] - 20, d.y + T[1] - 20, T[2] + 40, T[3] + 40];
  if (d.t === 'rock') return [d.x - d.r - 20, d.y - d.r * 1.25 - 20, d.r * 2 + 40, d.r * 1.25 + 40];
  return [d.x - 80, d.y - 160, 160, 180];
}
// statisches Bild einer Deko aus einem anderen Bereich (als Sprite)
function decorStatic(sid, D, d) {
  const bb = decorBB(d), k = sid + '_d_' + d.id;
  const raw = {
    yucca: g => drawYucca(g, d.x, d.y, 1, 0, 0), rock: g => drawRock(g, d.x, d.y, d.r, 0), potpalm: g => drawPotPalm(g, d.x, d.y, 0.85, 0),
    gatesign: g => drawGateSign(g, d.x, d.y), board: g => drawChalkboard(g, d.x, d.y, 0), cypress: g => drawCypress(g, d.x, d.y), planter: g => drawPlanter(g, d.x, d.y, 0, 0),
    lamp: g => { g.fillStyle = 'rgba(0,0,0,.2)'; ell(g, d.x, d.y, 12, 4); g.fill(); line(g, d.x, d.y, d.x, d.y - 170, 5, '#adb5bd'); rrPath(g, d.x - 4, d.y - 182, 30, 10, 4); fs(g, '#6c757d', 3); },
    bench: g => { g.fillStyle = 'rgba(0,0,0,.2)'; ell(g, d.x, d.y + 12, 48, 8); g.fill(); rrPath(g, d.x - 43, d.y - 18, 86, 12, 4); fs(g, '#a0673a', 3); rrPath(g, d.x - 43, d.y - 2, 86, 12, 4); fs(g, '#8d5a3b', 3); rrPath(g, d.x - 38, d.y + 8, 8, 10, 2); fs(g, '#495057', 2); rrPath(g, d.x + 30, d.y + 8, 8, 10, 2); fs(g, '#495057', 2); },
  }[d.t] || (D.decorDraw && D.decorDraw[d.t] ? g => D.decorDraw[d.t](g, d, 0, 0) : null);
  if (!raw) return null;
  return (c, t) => { if (d.anim && D.decorDraw && D.decorDraw[d.t]) D.decorDraw[d.t](c, d, t, 0); else { const B = measureBB(k, d.x, d.y, raw); drawSprite(c, sprite(k, B[0], B[1], B[2], B[3], raw)); } };
}
// Spielhaus, Rutsche, Schaukel des Spielplatzes als Nachbar (ohne Bewegung)
function pushPlaygroundProps(c, L, ox, oy, inView, lp) {
  const D = STAGE_DEFS.spielplatz;
  if (!inView(D.house.x - 120 + ox, D.house.y - 260 + oy, D.house.w + 400, 500) && !inView(D.swing.x0 + ox, D.swing.y - 200 + oy, 500, 300)) return;
  const fake = Object.assign(Object.create(Play.prototype), { npcs: [], swinging: null, t: 0, kind: 'dog', npcAnim: {}, seatOff: () => 0, peeksUp: [], p: { x: -999, y: -999, level: 0 }, onStairs: () => false });
  const swap = f => () => { const keep = [HOUSE, STAIRS, SLIDE, SWING]; HOUSE = D.house; STAIRS = D.stairs; SLIDE = D.slide; SWING = D.swing; c.save(); c.translate(ox, oy); try { f(); } finally { c.restore(); [HOUSE, STAIRS, SLIDE, SWING] = keep; } };
  if (lp) {   // Low-Poly: Gerüst, Rutsche, Häuschen sind im Bodenbild – nur Schaukelsitze und Dach dazu
    D.swing.seats.forEach((sx, k) => L.push({ y: D.swing.y + 1 + oy, f: swap(() => Play.prototype.drawSeatLp.call(fake, c, sx, 0, k)) }));
    L.push({ y: 99990 + oy, f: () => { const r = LP.stages.spielplatz.roof; c.drawImage(LP.img.dach, r[0] + ox, r[1] + oy, r[2], r[3]); } });
    return;
  }
  L.push({ y: D.swing.y + oy, f: swap(() => Play.prototype.drawSwingFrameRaw.call(fake, c)) });
  D.swing.seats.forEach((sx, k) => L.push({ y: D.swing.y + 1 + oy, f: swap(() => Play.prototype.drawSeat.call(fake, c, sx, 0, k)) }));
  L.push({ y: D.slide.y1 + oy, f: swap(() => Play.prototype.drawSlide.call(fake, c)) });
  L.push({ y: D.house.y + D.house.h + oy, f: swap(() => { drawSprite(c, sprite('houseBack', 530, 338, 240, 372, g => Play.prototype.houseBack.call(fake, g))); drawSprite(c, sprite('houseFront', 530, 548, 240, 162, g => Play.prototype.houseFront.call(fake, g))); }) });
  L.push({ y: D.house.y + D.house.h + 0.5 + oy, f: swap(() => Play.prototype.drawStairs.call(fake, c)) });
  L.push({ y: 99990 + oy, f: swap(() => drawSprite(c, sprite('roof', 505, 370, 310, 200, g => Play.prototype.drawRoofRaw.call(fake, g, 1)))) });
}
// gesperrte Durchgänge ohne Boss-Tor: Glastüren / Holztor mit Schloss
function pushLinkBarriers(c, L, sid, ox, oy, diff, t) {
  for (const Lk of LINKS) {
    if (Lk.a !== sid || Lk.gate || linkOpen(diff, Lk)) continue;
    const [r0, r1] = Lk.r, m = (r0 + r1) / 2, TW = areaW(sid), TH = areaH(sid);
    if (Lk.bar === 'garden') L.push({ y: TH - 8 + oy, f: () => { c.save(); c.translate(ox, oy); drawGardenGate(c, m, TH - 8, 0.8, 0, true, t, 'Chalet'); c.restore(); } });
    else if (Lk.side === 'bottom') L.push({ y: TH - 4 + oy, f: () => { c.save(); c.translate(ox, oy); drawLockedDoors(c, m, TH - 4, r1 - r0 + 20, t); c.restore(); } });
    else if (Lk.side === 'left') L.push({ y: r1 + oy, f: () => { c.save(); c.translate(ox, oy); drawLockedFence(c, 14, r0 - 10, r1 + 10, t); c.restore(); } });
    else if (Lk.side === 'right') L.push({ y: r1 + oy, f: () => { c.save(); c.translate(ox, oy); drawLockedFence(c, TW - 14, r0 - 10, r1 + 10, t); c.restore(); } });
    { const bx = Lk.side === 'bottom' ? m : Lk.side === 'left' ? 60 : TW - 60, by = Lk.side === 'bottom' ? TH - 110 : m - 70, bob = Math.sin(t * 2.5) * 5;   /* schwebendes Schloss: schon von weitem sieht man, dass es hier (noch) nicht weitergeht */
      L.push({ y: 99980, f: () => { c.save(); c.translate(ox, oy); ell(c, bx, by + bob, 26, 26); fs(c, 'rgba(255,255,255,.92)', 3); icon(c, 'lock', bx, by + bob, 30); c.restore(); } }); }
  }
}
function drawLockedDoors(c, x, y, w, t) {
  for (const sd of [-1, 1]) { rrPath(c, x + (sd < 0 ? -w / 2 : 0), y - 110, w / 2, 110, 3); fs(c, 'rgba(200,230,245,.92)', 3); line(c, x + sd * w / 4, y - 100, x + sd * w / 4, y - 10, 1.5, 'rgba(255,255,255,.8)', false); }
  rrPath(c, x - w / 2 - 6, y - 118, w + 12, 10, 3); fs(c, '#495057', 2.5);
  const b = Math.sin(t * 3) * 2; ell(c, x, y - 60 + b, 15, 15); fs(c, '#fff', 2.5); icon(c, 'lock', x, y - 60 + b, 20);
}
function drawLockedFence(c, x, y0, y1, t) {
  for (let y = y0; y <= y1; y += 18) { rrPath(c, x - 5, y - 40, 10, 42, 3); fs(c, '#a0673a', 1.8); }
  line(c, x, y0 - 30, x, y1 - 30, 4, '#8d5a3b'); line(c, x, y0 - 12, x, y1 - 12, 4, '#8d5a3b');
  const b = Math.sin(t * 3) * 2, m = (y0 + y1) / 2; ell(c, x + 26, m - 50 + b, 15, 15); fs(c, '#fff', 2.5); icon(c, 'lock', x + 26, m - 50 + b, 20);
}

// Nebel über noch gesperrten Bereichen (die Welt wächst mit jedem geschafften Bereich)
const STAGE_NAME = { gastraum: 'Innenbereich', kueche: 'Küche', aussen: 'Außenbereich', chalet: 'Chalet', spielplatz: 'Spielplatz', parkplatz: 'Parkplatz' };
function drawFog(c, ox, oy, id, t) {
  const TILE_W = areaW(id), TILE_H = areaH(id);
  const g = c.createLinearGradient(ox, oy, ox + TILE_W, oy + TILE_H); g.addColorStop(0, '#b8c2c7'); g.addColorStop(1, '#a3afb5');
  c.fillStyle = g; c.fillRect(ox - 2, oy - 2, TILE_W + 4, TILE_H + 4);
  for (let k = 0; k < 26; k++) { const x = ox + ((k * 173 + t * 12 * (k % 3 + 1)) % (TILE_W + 300)) - 150, y = oy + (k * 211) % TILE_H; ell(c, x, y, 140 + (k % 4) * 30, 70 + (k % 3) * 20); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill(); }
  // überall im Nebel kleine Schilder „gesperrt“ – egal welcher Teil gerade im Bild ist, sieht man, was los ist (sonst wirkt es wie ein Ladefehler)
  for (let gy = oy + 160; gy < oy + TILE_H - 60; gy += 300) for (let gx = ox + 140 + ((gy - oy) / 300 % 2) * 160; gx < ox + TILE_W - 60; gx += 320) {
    if (Math.abs(gx - (ox + TILE_W / 2)) < 160 && Math.abs(gy - (oy + TILE_H / 2)) < 160) continue;
    rrPath(c, gx - 74, gy - 26, 148, 52, 22); fs(c, 'rgba(255,255,255,.85)', 3, '#868e96'); icon(c, 'lock', gx - 46, gy, 30); txt(c, STAGE_NAME[id] || 'Gesperrt', gx + 14, gy - 6, 17, '#495057', 'center', null, 92); txt(c, 'noch gesperrt', gx + 14, gy + 13, 13, '#868e96', 'center', null, 92);
  }
  const cx = ox + TILE_W / 2, cy = oy + TILE_H / 2;
  ell(c, cx, cy, 70, 70); fs(c, 'rgba(255,255,255,.9)', 4); icon(c, 'lock', cx, cy - 6, 70);
  txt(c, STAGE_NAME[id] || '', cx, cy + 100, 40, '#495057', 'center', '#fff');
  { const i = STAGE_ORDER.indexOf(id), prev = STAGE_ORDER[i - 1]; if (prev) txt(c, 'Schaffe zuerst: ' + STAGE_NAME[prev], cx, cy + 146, 24, '#6c757d', 'center', '#fff'); }
}
// Wegweiser an jedem Durchgang: Name des Nachbarbereichs + Pfeil (gesperrt: Schloss)
function pushSigns(c, L, id, diff, t) {
  for (const E of exitsOf(id)) {
    const [r0, r1] = E.r, m = (r0 + r1) / 2, open = linkOpen(diff, E.L), name = STAGE_NAME[E.to];
    let x, y, arrow;
    if (E.side === 'top') { x = r1 + 60; y = 230; arrow = '↑'; }
    else if (E.side === 'bottom') { x = r0 - 70; y = WORLD_H - 90; arrow = '↓'; }
    else if (E.side === 'left') { x = 110; y = r0 - 30; arrow = '←'; }
    else { x = WORLD_W - 110; y = r0 - 30; arrow = '→'; }
    x = clamp(x, 90, WORLD_W - 90);
    { const P = typeof scene !== 'undefined' && scene && scene.stage === id && scene.npcs;   // steht dort jemand (mit „!“ über dem Kopf)? Dann rückt das Schild zur Seite
      if (P) for (let k = 0; k < 3; k++) { const hit = P.find(n => Math.abs(n.x - x) < 75 && n.y - y > -40 && n.y - y < 140); if (!hit) break; let nx = x <= hit.x ? hit.x - 110 : hit.x + 110; if (nx < 90 || nx > WORLD_W - 90) nx = x <= hit.x ? hit.x + 110 : hit.x - 110; x = clamp(nx, 90, WORLD_W - 90); } }
    L.push({ y, f: () => {
      c.font = `900 15px ${FONT}`; const w = Math.max(96, c.measureText(arrow + ' ' + name).width + 26);
      const sim = typeof lpSpr === 'function' && lpSpr(open ? 'tore/schild_hell' : 'tore/schild_grau');
      if (sim) {   // gemaltes Holzschild: Brett oben (ca. 62 % der Bildhöhe), Text darauf
        const iw = w + 34, ih = iw * sim.naturalHeight / sim.naturalWidth, top = y - ih;
        c.fillStyle = 'rgba(40,25,10,.22)'; ell(c, x, y, 18, 5); c.fill(); c.drawImage(sim, x - iw / 2, top, iw, ih);
        txt(c, arrow + ' ' + name, x, top + ih * 0.33, 15, open ? '#35452F' : '#f1f3f5', 'center', null);
        if (!open) lpLock(c, x + iw / 2 - 6, top + 8, 13, t);
        return;
      }
      c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, x, y + 2, 16, 5); c.fill(); line(c, x, y, x, y - 70, 5, '#8d5a3b');
      rrPath(c, x - w / 2, y - 100, w, 34, 8); fs(c, open ? '#fbf8f2' : '#dee2e6', 3);
      txt(c, arrow + ' ' + name, x, y - 83, 15, open ? '#35452F' : '#868e96', 'center', null);
      if (!open) { ell(c, x + w / 2, y - 100, 13, 13); fs(c, '#fff', 2.5); icon(c, 'lock', x + w / 2, y - 100, 16); }
    } });
  }
}
// wo man weiterspielt: der Bereich, in dem man zuletzt war (wenn frei), sonst der neueste freie
function startArea(diff) {
  const a = ACC(), last = a && a.lastArea && a.lastArea[diff];
  // Wo geht es weiter? Im laufenden Bereich (noch nicht geschafft), sonst im ersten noch nicht geschafften –
  // sind alle geschafft, wieder vorne (nicht immer im Chalet, User-Wunsch)
  if (last && STAGE_ORDER.includes(last) && areaUnlocked(diff, last) && !areaCleared(diff, last)) return last;
  for (const id of STAGE_ORDER) if (areaUnlocked(diff, id) && !areaCleared(diff, id)) return id;
  return STAGE_ORDER[0];
}
{ const c0 = Play.prototype.constructor; }
Object.assign(Play.prototype, {
  markArea() { const a = ACC(); if (!a || this.mp) return; a.lastArea = a.lastArea || {}; if (a.lastArea[this.diff] !== this.stage) { a.lastArea[this.diff] = this.stage; Save.write(); } },
});

// Bereichsname immer gut sichtbar oben in der Mitte (Farbe je Bereich)
const STAGE_COL = { kueche: '#adb5bd', gastraum: '#d27d55', aussen: '#74c69d', spielplatz: '#c19c72', parkplatz: '#868e96', chalet: '#a5d8ff' };
{
  const hud0 = Play.prototype.drawHud;
  Play.prototype.drawHud = function (c) {
    this.coachTop = 0; hud0.call(this, c);
    const name = STAGE_NAME[this.stage]; if (!name || this.helpOpen || overlay) return;   // nicht über Hilfe/Fenstern
    // über dem Hinweis-Band, damit sich nichts überdeckt
    // Bereichsname + Stufe (Farbe grün/orange/rot, Punkte) – man sieht immer, wo und wie schwer
    const D = DIFF_OF(this.diff);
    c.font = `900 16px ${FONT}`; const nw = c.measureText(name).width, dw = 30, w = nw + 54 + dw, x = W / 2 - w / 2, y = this.coachTop ? this.coachTop - 40 : H - 42;
    rrPath(c, x, y, w, 32, 16); fs(c, 'rgba(255,255,255,.9)', 2.5, D.col); ell(c, x + 18, y + 16, 11, 11); fs(c, STAGE_COL[this.stage] || '#fff', 2);
    drawCollect(c, this.stage, x + 18, y + 16, 1.15, -0.5);
    txt(c, name, x + 34, y + 17, 16, '#35452F', 'left', null);
    rrPath(c, x + w - dw - 8, y + 6, dw, 20, 10); fs(c, D.col, 0); diffDots(c, D, x + w - 8 - dw / 2, y + 16, 3);
  };
  if (Play.prototype.drawHud._src === undefined) Play.prototype.drawHud._src = hud0._src || hud0;
}

// ---------- Weltkarte: Übersicht aller Bereiche + Teleport in freigeschaltete ----------
class WorldMap {
  constructor(play) { this.play = play; this.t = 0; Voice.say('Tippe auf einen freigeschalteten Bereich, dann reist du dorthin.', true); }
  update(dt) { this.t += dt; }
  close() { if (overlay === this) overlay = null; }
  draw(c) {
    c.fillStyle = 'rgba(20,30,20,.6)'; c.fillRect(0, 0, W, H);
    txt(c, 'Weltkarte', W / 2, 32, 24, '#fff', 'center', BRAND.olive);
    roundBtn(c, W - 40, 36, 22, '#ced4da', 'cross', () => this.close());
    // ganze Anlage maßstabsgetreu wie auf dem Luftbild
    const T = terrainImage(), B = T.B, pad = 14, top = 62, aw = W - pad * 2 - 80, ah = H - top - pad, sc = Math.min(aw / (B.x1 - B.x0), ah / (B.y1 - B.y0));
    const mw = (B.x1 - B.x0) * sc, mh = (B.y1 - B.y0) * sc, mx = (W - mw) / 2, my = top + (ah - mh) / 2, X = wx => mx + (wx - B.x0) * sc, Y = wy => my + (wy - B.y0) * sc;
    rrPath(c, mx - 6, my - 6, mw + 12, mh + 12, 14); fs(c, '#fbf8f2', 3);
    c.save(); c.beginPath(); c.rect(mx, my, mw, mh); c.clip(); c.drawImage(T.cv, mx, my, mw, mh);
    for (const id of Object.keys(WORLD_XY)) {
      const [wx, wy] = WORLD_XY[id], x = X(wx), y = Y(wy), tw = areaW(id) * sc, th = areaH(id) * sc;
      const open = areaUnlocked(this.play.diff, id), img = GROUND_CACHE[id], here = id === this.play.stage, cl = areaCleared(this.play.diff, id);
      if (img) c.drawImage(img, x, y, tw, th); else { c.fillStyle = STAGE_COL[id] || '#ddd'; c.fillRect(x, y, tw, th); stageIcon(c, id, x + tw / 2, y + th * 0.42, Math.min(tw, th) * 0.3); }
      if (!open) { c.fillStyle = 'rgba(210,220,224,.92)'; c.fillRect(x, y, tw, th); icon(c, 'lock', x + tw / 2, y + th * 0.42, Math.min(tw, th) * 0.3); }
      c.lineWidth = here ? 4 : 2; c.strokeStyle = here ? '#ffd166' : 'rgba(0,0,0,.35)'; c.strokeRect(x, y, tw, th);
      const lab = (cl ? '✓ ' : '') + STAGE_NAME[id]; c.font = `900 ${Math.max(10, Math.min(14, tw / 8))}px ${FONT}`; const lw = c.measureText(lab).width + 14;
      rrPath(c, x + tw / 2 - lw / 2, y + th - 26, lw, 20, 9); fs(c, here ? '#ffd166' : open ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.7)', 1.5);
      txt(c, lab, x + tw / 2, y + th - 15, Math.max(10, Math.min(14, tw / 8)), open ? '#35452F' : '#868e96', 'center', null);
      if (here) { const p = this.play.p, pu = 1 + Math.sin(this.t * 6) * 0.2; ell(c, x + p.x * sc, y + p.y * sc, 8 * pu, 8 * pu); fs(c, '#ef476f', 2.5); }
      if (open && !cl && !here) { const pu = 1 + Math.sin(this.t * 5) * 0.12, bx = x + tw - 12, by = y + 12; ell(c, bx, by, 11 * pu, 11 * pu); fs(c, '#ffd166', 2); txt(c, '!', bx, by + 1, 15, '#35452F', 'center', null); }   /* hier gibt es noch etwas zu tun */
      const bw = Math.max(tw, 70), bh = Math.max(th, 54), bx0 = x + tw / 2 - bw / 2, by0 = y + th / 2 - bh / 2;   /* kleine Bereiche: größere Tippfläche */
      if (open && !here) UI.btn(bx0, by0, bw, bh, () => { Sfx.play('tap'); const pl = this.play; overlay = new ConfirmDialog({ text: 'Zum Bereich ' + STAGE_NAME[id] + ' reisen?', icon: 'play', onYes: () => { Sfx.play('win'); Save.write(); setScene(new Play(pl.diff, { stage: id })); } }); });
      else if (!open) UI.btn(bx0, by0, bw, bh, () => { Sfx.play('bad'); const i = STAGE_ORDER.indexOf(id); toast('Noch gesperrt', 'Schaffe zuerst ' + STAGE_NAME[STAGE_ORDER[i - 1]], 'lock'); });
    }
    c.restore();
  }
}
{
  const hud1 = Play.prototype.drawHud;
  Play.prototype.drawHud = function (c) {
    hud1.call(this, c);
    if (this.mp || SG.solo) return;   // eigene Bereiche (Helfer-Schule, Halloween-Map) haben keine Weltkarte
    const x = W - 46, y = 50;
    roundBtn(c, x, y, 21, '#caffbf', null, () => { Sfx.play('tap'); overlay = new WorldMap(this); }, '#2d6a4f');
    // kleines Karten-Symbol: 3 x 2 Kacheln
    for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) { rrPath(c, x - 13 + k * 9, y - 9 + r * 9, 8, 8, 2); c.fillStyle = (r + k) % 2 ? '#2d6a4f' : '#74c69d'; c.fill(); }
    txt(c, 'Karte', x, y + 34, 11, '#fff', 'center', BRAND.olive);
  };
  Play.prototype.drawHud._src = hud1._src || hud1;
}
