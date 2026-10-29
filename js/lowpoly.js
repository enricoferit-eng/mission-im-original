'use strict';
// ---------- Low-Poly-Grafik (von Magnific gemalt) ----------
// Erst nur die Küche: fertiges Hintergrundbild statt Boden + Möbel, gemalte Figuren statt gezeichneter.
// Figuren werden über das Bild gezeichnet (wie in Draufsicht-Spielen üblich). lpOcclude zeichnet Wand-/Möbelstücke
// wieder über eine Figur, steht aber nicht im Einsatz: Bei großen Figuren schneidet es sie neben Wänden halb ab.
const LP = {
  on: !/[?&]lowpoly=0/.test(location.search),
  stages: { kueche: { map: 'assets/lowpoly/kueche/map.jpg', staff: { k_nina: 'nina', k_tom: 'tom', k_luca: 'luca', k_marco: 'marco', k_lea: 'lea' } } },
  catH: 96, staffH: 118,   // Figurengröße passend zu den Möbeln im Bild
  img: {}, ready: false, runs: {},
  player: { face: 'front', flip: 1, dist: 0, lx: null, ly: null },
};
(function lpLoad() {
  if (!LP.on) return;
  const names = ['katze_steht', ...['side', 'front', 'back'].flatMap(d => [0, 1, 2, 3, 4, 5].map(i => `katze_${d}_${i}`)), 'nina', 'tom', 'luca', 'marco', 'lea'];
  const list = names.map(n => [n, `assets/lowpoly/figuren/${n}.png`]);
  for (const id in LP.stages) list.push(['map_' + id, LP.stages[id].map]);
  let left = list.length;
  for (const [k, src] of list) {
    const im = new Image();
    im.onload = im.onerror = () => {
      if (--left) return;
      LP.ready = list.every(([n]) => LP.img[n].naturalWidth > 0);
      if (LP.ready) { GROUND = null; for (const id in LP.stages) delete GROUND_CACHE[id]; }   // Boden mit dem Bild neu aufbauen
    };
    im.src = src; LP.img[k] = im;
  }
})();
function lpActive() { return LP.ready && typeof SG !== 'undefined' && !!LP.stages[SG.id]; }
function lpGround(g) { g.drawImage(LP.img['map_' + SG.id], 0, 0, WORLD_W, WORLD_H); }
// Für jede gesperrte Rasterzelle: untere Kante ihrer senkrechten Reihe (in Welt-Pixeln)
function lpRuns() {
  if (LP.runs[SG.id]) return LP.runs[SG.id];
  const bot = new Float32Array(GW * GH);
  for (let x = 0; x < GW; x++) {
    let y = GH - 1;
    while (y >= 0) {
      if (canStand(0, x * CELL + CELL / 2, y * CELL + CELL / 2)) { y--; continue; }
      const e = (y + 1) * CELL;
      while (y >= 0 && !canStand(0, x * CELL + CELL / 2, y * CELL + CELL / 2)) bot[y-- * GW + x] = e;
    }
  }
  return (LP.runs[SG.id] = bot);
}
function lpOcclude(c, x, y, w, h) {
  const bot = lpRuns(), im = LP.img['map_' + SG.id], sx = im.naturalWidth / WORLD_W, sy = im.naturalHeight / WORLD_H;
  const x0 = Math.max(0, Math.floor((x - w / 2) / CELL)), x1 = Math.min(GW - 1, Math.floor((x + w / 2) / CELL));
  const y0 = Math.max(0, Math.floor((y - h) / CELL)), y1 = Math.min(GH - 1, Math.floor(y / CELL));
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
    const b = bot[cy * GW + cx]; if (!b || b <= y + 2) continue;
    c.drawImage(im, cx * CELL * sx, cy * CELL * sy, CELL * sx, CELL * sy, cx * CELL, cy * CELL, CELL + 0.5, CELL + 0.5);
  }
}
function lpSprite(c, im, x, y, h, flip = 1, bob = 0, tilt = 0) {
  const w = h * im.naturalWidth / im.naturalHeight;
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(40,25,10,.28)'; c.beginPath(); c.ellipse(0, -2, w * 0.4, h * 0.07, 0, 0, Math.PI * 2); c.fill();
  c.translate(0, -bob); c.rotate(tilt); c.scale(flip, 1); c.drawImage(im, -w / 2, -h, w, h); c.restore();
}
// Spielfigur: Richtung aus der Bewegung, alle 11 px Weg ein neues Laufbild (6 Bilder = ein Schritt)
function lpDrawPlayer(c, p, x, y, tilt) {
  const P = LP.player, dx = P.lx == null ? 0 : p.x - P.lx, dy = P.ly == null ? 0 : p.y - P.ly; P.lx = p.x; P.ly = p.y;
  const d = Math.hypot(dx, dy);
  if (p.moving && d > 0.05) {
    if (Math.abs(dx) > Math.abs(dy) * 0.8) { P.face = 'side'; P.flip = dx < 0 ? -1 : 1; } else P.face = dy < 0 ? 'back' : 'front';
    P.dist += d;
  }
  const im = p.moving ? LP.img[`katze_${P.face}_${Math.floor(P.dist / 11) % 6}`] : LP.img.katze_steht;
  lpSprite(c, im, x, y, LP.catH, p.moving && P.face === 'side' ? P.flip : 1, p.moving ? 0 : Math.sin(p.t * 2.2) * 0.6, tilt || 0);
}
function lpDrawStaff(c, n, x, y, t, wave) {
  const key = LP.stages[SG.id].staff[n.id]; if (!key) return false;
  // ohne Vorne/hinten: Mitarbeiter stehen oft direkt neben Möbeln und würden sonst halb abgeschnitten
  lpSprite(c, LP.img[key], x, y, LP.staffH, 1, wave ? Math.abs(Math.sin(t * 6)) * 4 : Math.abs(Math.sin(t * 1.6 + x)) * 1.2);
  return true;
}
