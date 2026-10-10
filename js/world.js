'use strict';
// ---------- Offene Welt: die 6 Bereiche liegen nebeneinander wie auf dem Luftbild ----------
//   (Wiese)      | Küche      | (Straße)
//   (Wiese)      | Gastraum   | (Straße)      Küche liegt hinter der Bar
//   Spielplatz   | Außen      | (Straße)
//   Parkplatz    | Chalet     | (Straße)
// Man läuft über Durchgänge nahtlos weiter; Nachbarbereiche sieht man am Rand schon. Ein Bereich ist erst offen,
// wenn der vorige (Reihenfolge der Geschichte) geschafft ist.
const TILE_W = WORLD_W, TILE_H = WORLD_H;
const WORLD_POS = { kueche: [1, 0], gastraum: [1, 1], aussen: [1, 2], spielplatz: [0, 2], chalet: [1, 3], parkplatz: [0, 3] };
const WORLD_FILL = { '0,0': 'wiese', '0,1': 'wiese', '2,0': 'strasse', '2,1': 'strasse', '2,2': 'strasse', '2,3': 'strasse' };
// Durchgänge: side = Seite von a; r = Bereich entlang der Kante; gate = dort steht das Boss-Tor von a
const LINKS = [
  { a: 'kueche', side: 'bottom', b: 'gastraum', r: [565, 645], gate: true },
  { a: 'gastraum', side: 'bottom', b: 'aussen', r: [445, 555], gate: true },
  { a: 'aussen', side: 'left', b: 'spielplatz', r: [540, 640], gate: true },
  { a: 'spielplatz', side: 'bottom', b: 'parkplatz', r: [470, 570], gate: true },
  { a: 'parkplatz', side: 'right', b: 'chalet', r: [900, 1000], bar: 'fence' },
  { a: 'aussen', side: 'bottom', b: 'chalet', r: [925, 985], bar: 'garden' },
];
const OPP = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' };
const stageAt = (c, r) => Object.keys(WORLD_POS).find(k => WORLD_POS[k][0] === c && WORLD_POS[k][1] === r);
function areaCleared(diff, id) { return SP(diff, id).clears > 0; }
function areaUnlocked(diff, id) {
  if (typeof ACC === 'function' && ACC() && ACC().admin) return true;
  const i = STAGE_ORDER.indexOf(id); if (i <= 0) return true;
  const s = SP(diff, id); return areaCleared(diff, STAGE_ORDER[i - 1]) || s.clears > 0 || !!s.run;
}
const linkOpen = (diff, L) => areaUnlocked(diff, L.a) && areaUnlocked(diff, L.b);
function exitsOf(id) { return LINKS.filter(L => L.a === id || L.b === id).map(L => ({ L, side: L.a === id ? L.side : OPP[L.side], to: L.a === id ? L.b : L.a })); }

// Durchgänge ins Raster schneiden (offen) bzw. am Rand dicht machen (gesperrt)
function carveLinks(id, diff) {
  for (const E of exitsOf(id)) {
    const open = linkOpen(diff, E.L), [r0, r1] = E.L.r, horiz = E.side === 'top' || E.side === 'bottom';
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
const FILL_CACHE = {};
function fillGround(kind) {
  if (FILL_CACHE[kind]) return FILL_CACHE[kind];
  const Q = 0.5, cv = document.createElement('canvas'); cv.width = TILE_W * Q; cv.height = TILE_H * Q; const g = cv.getContext('2d'); g.scale(Q, Q); const R = mulberry32(kind === 'wiese' ? 11 : 12);
  lawn(g, 0, 0, TILE_W, TILE_H, R);
  if (kind === 'strasse') {
    g.fillStyle = '#74c69d'; g.fillRect(0, 0, 120, TILE_H);
    g.fillStyle = '#5c6066'; g.fillRect(260, 0, 420, TILE_H); for (let i = 0; i < 6000; i++) { g.fillStyle = i % 2 ? '#646970' : '#55595f'; g.fillRect(260 + R() * 420, R() * TILE_H, 2, 2); }
    g.fillStyle = '#f8f9fa'; g.fillRect(262, 0, 4, TILE_H); g.fillRect(674, 0, 4, TILE_H); for (let y = 0; y < TILE_H; y += 90) g.fillRect(468, y, 4, 46);
    for (let y = 40; y < TILE_H; y += 110) { const x = 150 + (y * 7) % 60; g.fillStyle = 'rgba(0,0,0,.15)'; ell(g, x + 18, y + 6, 26, 10); g.fill(); g.beginPath(); g.moveTo(x, y - 90); g.quadraticCurveTo(x + 20, y - 40, x + 12, y); g.lineTo(x - 12, y); g.quadraticCurveTo(x - 20, y - 40, x, y - 90); fs(g, '#2d6a4f', 2.5); }
  } else {
    for (let k = 0; k < 14; k++) { const x = 80 + (k * 137) % 840, y = 120 + (k * 251) % 1200; g.fillStyle = 'rgba(0,0,0,.15)'; ell(g, x + 24, y + 8, 60, 20); g.fill(); for (const [dx, dy, rr] of [[-30, -60, 36], [26, -64, 38], [0, -96, 40]]) { ell(g, x + dx, y + dy, rr, rr * 0.85); fs(g, k % 2 ? '#40916c' : '#2d6a4f', 2.5); } }
  }
  return (FILL_CACHE[kind] = cv);
}
function worldPrepare(id, diff) {
  const [c0, r0] = WORLD_POS[id] || [0, 0];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nb = stageAt(c0 + dx, r0 + dy); if (nb && !GROUND_CACHE[nb]) withStage(nb, () => buildGround()); }
}
// Nachbarn eines Play-Objekts: Böden, Deko, Tore, Figuren, Effekte
function worldNeighbors(play) {
  const id = play.stage, [c0, r0] = WORLD_POS[id];
  // Speicher sparen: nur aktueller Bereich + direkte Nachbarn behalten
  const keep = new Set([id]); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nb = stageAt(c0 + dx, r0 + dy); if (nb) keep.add(nb); }
  for (const k in GROUND_CACHE) if (!keep.has(k)) delete GROUND_CACHE[k];
  for (const k in SPR) { const i = k.indexOf('_d_'); if (i > 0 && !keep.has(k.slice(0, i))) delete SPR[k]; }
  play.nb = []; play.nbExtras = [];
  const cols = Object.values(WORLD_POS).map(v => v[0]).concat(Object.keys(WORLD_FILL).map(k => +k.split(',')[0])), rows = Object.values(WORLD_POS).map(v => v[1]).concat(Object.keys(WORLD_FILL).map(k => +k.split(',')[1]));
  play.wb = { x0: (Math.min(...cols) - c0) * TILE_W, x1: (Math.max(...cols) - c0 + 1) * TILE_W, y0: (Math.min(...rows) - r0) * TILE_H, y1: (Math.max(...rows) - r0 + 1) * TILE_H };
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const sid = stageAt(c0 + dx, r0 + dy), fill = WORLD_FILL[(c0 + dx) + ',' + (r0 + dy)], ox = dx * TILE_W, oy = dy * TILE_H;
    if (sid && !areaUnlocked(play.diff, sid)) { play.nb.push({ fog: sid, ox, oy }); continue; }   // noch nicht freigeschaltet: Nebel
    if (sid) {
      const N = { id: sid, ox, oy, D: STAGE_DEFS[sid] };
      const run = SP(play.diff, sid).run, lay = run && run.layout;
      N.npcs = N.D.npcs.filter(n => n.pos).map(n => { const p = n.pos[lay && lay[n.id] != null ? lay[n.id] : 0]; return { id: n.id, x: p[0], y: p[1], l: p[2] || 0, done: !!(run && run.done[n.id]) }; });
      play.nb.push(N);
      if (N.D.extras) {   // Effekte des Nachbarn (Dach, Lichter, Schnee ...), mit umgerechneter Spielerposition
        const proxy = { get p() { return { x: play.p.x - ox, y: play.p.y - oy, level: 0 }; }, stage: sid, diff: play.diff };
        let ex = null; withStage(sid, () => { ex = N.D.extras(proxy); });
        play.nbExtras.push({ ex, ox, oy, id: sid });
      }
    } else if (fill) play.nb.push({ fill, ox, oy });
  }
  if (!play.mp) carveLinks(id, play.diff);   // withStage hat das Raster neu gebaut
}
Object.assign(Play.prototype, {
  checkCross() {
    const p = this.p; if (this.exiting || p.level || this.mp) return false;
    for (const E of exitsOf(this.stage)) {
      if (!linkOpen(this.diff, E.L)) continue;
      const [r0, r1] = E.L.r, along = E.side === 'top' || E.side === 'bottom' ? p.x : p.y;
      if (along < r0 - 20 || along > r1 + 20) continue;
      if ((E.side === 'bottom' && p.y > TILE_H - 16) || (E.side === 'top' && p.y < 16) || (E.side === 'left' && p.x < 16) || (E.side === 'right' && p.x > TILE_W - 16)) { this.crossTo(E); return true; }
    }
    return false;
  },
  crossTo(E) {
    const [c0, r0] = WORLD_POS[this.stage], [c1, r1] = WORLD_POS[E.to], ox = (c1 - c0) * TILE_W, oy = (r1 - r0) * TILE_H, p = this.p;
    let nx = p.x - ox, ny = p.y - oy;
    if (E.side === 'bottom') ny = 24; if (E.side === 'top') ny = TILE_H - 24; if (E.side === 'right') nx = 24; if (E.side === 'left') nx = TILE_W - 24;
    Save.write(); overlay = null; Voice.stop();
    setScene(new Play(this.diff, { stage: E.to, enter: { x: nx, y: ny, dir: p.dir }, cam: { x: this.camX - ox, y: this.camY - oy }, joy: this.joy }));
  },
  tapOutside(w) {
    if (w.x >= 0 && w.x <= TILE_W && w.y >= 0 && w.y <= TILE_H) return false;
    const side = w.y > TILE_H ? 'bottom' : w.y < 0 ? 'top' : w.x < 0 ? 'left' : 'right';
    const E = exitsOf(this.stage).filter(e => linkOpen(this.diff, e.L)).sort((a, b) => (a.side === side ? 0 : 1) - (b.side === side ? 0 : 1))[0];
    if (!E) { Sfx.play('bad'); return true; }
    const [r0, r1] = E.L.r, horiz = E.side === 'top' || E.side === 'bottom', al = clamp(horiz ? w.x : w.y, r0 + 10, r1 - 10);
    const tx = horiz ? al : (E.side === 'left' ? 12 : TILE_W - 12), ty = horiz ? (E.side === 'top' ? 12 : TILE_H - 12) : al;
    const path = findPath(this.p.x, this.p.y, this.p.level, tx, ty, 0, false);
    if (path) { this.p.path = path; this.p.target = null; this.tapMark = { x: tx, y: ty, l: 0, t: 0 }; }
    return true;
  },
  drawNbGrounds(c) {
    for (const N of this.nb || []) {
      if (!this.tileVisible(N.ox, N.oy)) continue;
      if (N.fog) { drawFog(c, N.ox, N.oy, N.fog, this.t); continue; }
      const img = N.fill ? fillGround(N.fill) : GROUND_CACHE[N.id];
      if (img) c.drawImage(img, N.ox, N.oy, TILE_W, TILE_H);
    }
  },
  tileVisible(ox, oy) {
    const z = this.zoom, hw = W / 2 / z, hh = H / 2 / z;
    return ox < this.camX + hw + 300 && ox + TILE_W > this.camX - hw - 300 && oy < this.camY + hh + 400 && oy + TILE_H > this.camY - hh - 300;
  },
  pushNb(c, L, t) {
    const z = this.zoom, vx0 = this.camX - W / 2 / z - 160, vx1 = this.camX + W / 2 / z + 160, vy0 = this.camY - H / 2 / z - 80, vy1 = this.camY + H / 2 / z + 320;
    const inView = (x0, y0, w, h) => !(x0 > vx1 || x0 + w < vx0 || y0 > vy1 || y0 + h < vy0);
    // eigene Durchgangs-Sperren + Wegweiser
    pushLinkBarriers(c, L, this.stage, 0, 0, this.diff, t);
    pushSigns(c, L, this.stage, this.diff, t);
    for (const N of this.nb || []) {
      if (N.fill || N.fog || !this.tileVisible(N.ox, N.oy)) continue;
      const { ox, oy, D } = N, tr = f => () => { c.save(); c.translate(ox, oy); f(); c.restore(); };
      for (const d of D.decor) {
        const bb = decorBB(d); if (!inView(bb[0] + ox, bb[1] + oy, bb[2], bb[3])) continue;
        const fn = decorStatic(N.id, D, d); if (fn) L.push({ y: d.y + (d.zy || 0) + (d.t === 'bench' ? 10 : 0) + oy, f: tr(() => fn(c, t)) });
      }
      if (N.id === 'spielplatz') pushPlaygroundProps(c, L, ox, oy, inView);
      const G = D.gate, cl = areaCleared(this.diff, N.id);
      if (G && inView(G.x - 120 + ox, G.y - 220 + oy, 240, 260)) L.push({ y: G.y + oy, f: tr(() => (D.drawGate || drawGate)(c, G.x, G.y, 1, cl ? 1 : 0, !cl, t)) });
      for (const n of N.npcs) if (inView(n.x - 40 + ox, n.y - 120 + oy, 80, 130)) L.push({ y: n.y + oy, f: tr(() => drawCritter(c, n.id, n.x, n.y, 1.12, t, { staff: true, ph: n.x })) });
      pushLinkBarriers(c, L, N.id, ox, oy, this.diff, t);
    }
    for (const E of this.nbExtras || []) {
      if (!this.tileVisible(E.ox, E.oy) || !E.ex.draw) continue;
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
  return (c, t) => { if (d.anim && D.decorDraw && D.decorDraw[d.t]) D.decorDraw[d.t](c, d, t, 0); else drawSprite(c, sprite(k, bb[0], bb[1], bb[2], bb[3], raw)); };
}
// Spielhaus, Rutsche, Schaukel des Spielplatzes als Nachbar (ohne Bewegung)
function pushPlaygroundProps(c, L, ox, oy, inView) {
  const D = STAGE_DEFS.spielplatz;
  if (!inView(D.house.x - 120 + ox, D.house.y - 260 + oy, D.house.w + 400, 500) && !inView(D.swing.x0 + ox, D.swing.y - 200 + oy, 500, 300)) return;
  const fake = Object.assign(Object.create(Play.prototype), { npcs: [], swinging: null, t: 0, kind: 'dog', npcAnim: {}, seatOff: () => 0, peeksUp: [], p: { x: -999, y: -999, level: 0 }, onStairs: () => false });
  const swap = f => () => { const keep = [HOUSE, STAIRS, SLIDE, SWING]; HOUSE = D.house; STAIRS = D.stairs; SLIDE = D.slide; SWING = D.swing; c.save(); c.translate(ox, oy); try { f(); } finally { c.restore(); [HOUSE, STAIRS, SLIDE, SWING] = keep; } };
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
    const [r0, r1] = Lk.r, m = (r0 + r1) / 2;
    if (Lk.bar === 'garden') L.push({ y: TILE_H - 8 + oy, f: () => { c.save(); c.translate(ox, oy); drawGardenGate(c, m, TILE_H - 8, 0.8, 0, true, t, 'Chalet'); c.restore(); } });
    else if (Lk.side === 'bottom') L.push({ y: TILE_H - 4 + oy, f: () => { c.save(); c.translate(ox, oy); drawLockedDoors(c, m, TILE_H - 4, r1 - r0 + 20, t); c.restore(); } });
    else if (Lk.side === 'left') L.push({ y: r1 + oy, f: () => { c.save(); c.translate(ox, oy); drawLockedFence(c, 14, r0 - 10, r1 + 10, t); c.restore(); } });
    else if (Lk.side === 'right') L.push({ y: r1 + oy, f: () => { c.save(); c.translate(ox, oy); drawLockedFence(c, TILE_W - 14, r0 - 10, r1 + 10, t); c.restore(); } });
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
  const g = c.createLinearGradient(ox, oy, ox + TILE_W, oy + TILE_H); g.addColorStop(0, '#dfe7ea'); g.addColorStop(1, '#c9d4d8');
  c.fillStyle = g; c.fillRect(ox - 2, oy - 2, TILE_W + 4, TILE_H + 4);
  for (let k = 0; k < 26; k++) { const x = ox + ((k * 173 + t * 12 * (k % 3 + 1)) % (TILE_W + 300)) - 150, y = oy + (k * 211) % TILE_H; ell(c, x, y, 140 + (k % 4) * 30, 70 + (k % 3) * 20); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill(); }
  const cx = ox + TILE_W / 2, cy = oy + TILE_H / 2;
  ell(c, cx, cy, 70, 70); fs(c, 'rgba(255,255,255,.9)', 4); icon(c, 'lock', cx, cy - 6, 70);
  txt(c, STAGE_NAME[id] || '', cx, cy + 100, 40, '#495057', 'center', '#fff');
}
// Wegweiser an jedem Durchgang: Name des Nachbarbereichs + Pfeil (gesperrt: Schloss)
function pushSigns(c, L, id, diff, t) {
  for (const E of exitsOf(id)) {
    const [r0, r1] = E.L.r, m = (r0 + r1) / 2, open = linkOpen(diff, E.L), name = STAGE_NAME[E.to];
    let x, y, arrow;
    if (E.side === 'top') { x = r1 + 60; y = 230; arrow = '↑'; }
    else if (E.side === 'bottom') { x = r0 - 70; y = TILE_H - 90; arrow = '↓'; }
    else if (E.side === 'left') { x = 110; y = r0 - 30; arrow = '←'; }
    else { x = TILE_W - 110; y = r0 - 30; arrow = '→'; }
    x = clamp(x, 90, TILE_W - 90);
    L.push({ y, f: () => {
      c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, x, y + 2, 16, 5); c.fill(); line(c, x, y, x, y - 70, 5, '#8d5a3b');
      c.font = `900 15px ${FONT}`; const w = Math.max(96, c.measureText(arrow + ' ' + name).width + 26);
      rrPath(c, x - w / 2, y - 100, w, 34, 8); fs(c, open ? '#fbf8f2' : '#dee2e6', 3);
      txt(c, arrow + ' ' + name, x, y - 83, 15, open ? '#35452F' : '#868e96', 'center', null);
      if (!open) { ell(c, x + w / 2, y - 100, 13, 13); fs(c, '#fff', 2.5); icon(c, 'lock', x + w / 2, y - 100, 16); }
    } });
  }
}
// wo man weiterspielt: der Bereich, in dem man zuletzt war (wenn frei), sonst der neueste freie
function startArea(diff) {
  const a = ACC(), last = a && a.lastArea && a.lastArea[diff];
  if (last && areaUnlocked(diff, last)) return last;
  let best = STAGE_ORDER[0]; for (const id of STAGE_ORDER) if (areaUnlocked(diff, id)) best = id; return best;
}
{ const c0 = Play.prototype.constructor; }
Object.assign(Play.prototype, {
  markArea() { const a = ACC(); if (!a || this.mp) return; a.lastArea = a.lastArea || {}; if (a.lastArea[this.diff] !== this.stage) { a.lastArea[this.diff] = this.stage; Save.write(); } },
});
