'use strict';
// ---------- Low-Poly-Grafik (von Magnific gemalt) ----------
// Erst nur die Küche: fertiges Hintergrundbild statt Boden + Möbel, gemalte Figuren statt gezeichneter.
// Figuren werden über das Bild gezeichnet (wie in Draufsicht-Spielen üblich). lpOcclude zeichnet Wand-/Möbelstücke
// wieder über eine Figur, steht aber nicht im Einsatz: Bei großen Figuren schneidet es sie neben Wänden halb ab.
const LP = {
  on: !/[?&]lowpoly=0/.test(location.search),
  stages: {
    kueche: { map: 'assets/lowpoly/kueche/map.jpg?v=2', staff: { k_nina: 'nina', k_tom: 'tom', k_luca: 'luca', k_marco: 'marco', k_lea: 'lea' } },
    gastraum: { map: 'assets/lowpoly/gastraum/map.jpg?v=1', staff: {} },
    aussen: { map: 'assets/lowpoly/aussen/map.jpg?v=1', staff: {} },
    parkplatz: { map: 'assets/lowpoly/parkplatz/map.jpg?v=1', staff: {} },
    uebung: { map: 'assets/lowpoly/uebung/map.jpg?v=1', staff: {} },
    chalet: { map: 'assets/lowpoly/chalet/map.jpg?v=1', staff: {} },
    spielplatz: { map: 'assets/lowpoly/spielplatz/map.jpg?v=2', staff: {}, roof: [518, 395, 288, 168] },   // Schaukelgerüst, Rutsche, Treppe, Häuschen sind im Bild; Dach extra (wird durchsichtig)
  },
  playerArt: false,   // gemalte Spielfigur erst, wenn Löwe/Bär/Hund + Skins fertig sind (bis dahin alte Figur)
  catH: 96, staffH: 118, part: 2,   // Kamera: man sieht etwa 1/2 des Raums, auf jedem Bildschirm gleich
    // Figurengröße passend zu den Möbeln im Bild
  img: {}, ready: false, runs: {},
  player: { face: 'front', flip: 1, dist: 0, lx: null, ly: null },
};
(function lpLoad() {
  if (!LP.on) return;
  const names = ['katze_steht', ...['side', 'front', 'back'].flatMap(d => [0, 1, 2, 3, 4, 5].map(i => `katze_${d}_${i}`)), 'nina', 'tom', 'luca', 'marco', 'lea'];
  const list = names.map(n => [n, `assets/lowpoly/figuren/${n}.png`]);
  for (const id in LP.stages) list.push(['map_' + id, LP.stages[id].map]);
  list.push(['dach', 'assets/lowpoly/spielplatz/dach.png?v=1']);
  list.push(['sitz', 'assets/lowpoly/spielplatz/sitz.png?v=2']);
  let left = list.length;
  for (const [k, src] of list) {
    const im = new Image();
    im.onload = im.onerror = () => {
      if (--left) return;
      LP.ready = list.every(([n]) => LP.img[n].naturalWidth > 0);
      if (LP.ready) {   // Boden mit dem Bild neu aufbauen – auch die Nachbar-Bereiche, die man am Rand sieht
        GROUND = null; for (const id in LP.stages) delete GROUND_CACHE[id];
        if (typeof scene !== 'undefined' && scene && scene.stage && !scene.mp && typeof worldPrepare === 'function') worldPrepare(scene.stage, scene.diff);
      }
    };
    im.src = src; LP.img[k] = im;
  }
})();
function lpActive() { return LP.ready && typeof SG !== 'undefined' && !!LP.stages[SG.id]; }
function lpFor(id) { return LP.ready && !!LP.stages[id]; }   // für Nachbar-Bereiche (SG ist dann ein anderer Bereich)
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
function lpDrawStaff(c, n, x, y, t, wave, sid = SG.id) {
  const key = LP.stages[sid] && LP.stages[sid].staff[n.id]; if (!key) return false;
  // ohne Vorne/hinten: Mitarbeiter stehen oft direkt neben Möbeln und würden sonst halb abgeschnitten
  lpSprite(c, LP.img[key], x, y, LP.staffH, 1, wave ? Math.abs(Math.sin(t * 6)) * 4 : Math.abs(Math.sin(t * 1.6 + x)) * 1.2);
  return true;
}
function lpRoof(c, alpha) {
  const r = LP.stages[SG.id].roof; if (!r) return false;
  c.save(); c.globalAlpha = alpha; c.drawImage(LP.img.dach, r[0], r[1], r[2], r[3]); c.restore();
  return true;
}
// Leckereien + Such-Gegenstände als gemalte Bilder (assets/lowpoly/items/<food|item>_<id>.png), werden erst bei Bedarf geladen.
// Solange ein Bild noch lädt, zeichnet das Spiel die alte Grafik.
const LP_ITEMS = {};
function lpItemImg(kind, id) {
  if (!LP.on) return null;
  const k = kind + '_' + id; let im = LP_ITEMS[k];
  if (!im) { im = LP_ITEMS[k] = new Image(); im.src = 'assets/lowpoly/items/' + k + '.png?v=1'; }
  return im.complete && im.naturalWidth ? im : null;
}
function lpDrawItem(c, kind, id, x, y, size, sil) {
  const im = lpItemImg(kind, id); if (!im) return false;
  const box = size * 1.25, s = box / Math.max(im.naturalWidth, im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
  if (!sil) { c.drawImage(im, x - w / 2, y - h / 2, w, h); return true; }
  // Schatten-Umriss (für „Welches Teil fehlt?“ usw.): Bild einfärben
  const cv = lpDrawItem.cv || (lpDrawItem.cv = document.createElement('canvas')), S = 160; cv.width = cv.height = S;
  const g = cv.getContext('2d'); g.clearRect(0, 0, S, S); const t = S / Math.max(im.naturalWidth, im.naturalHeight);
  g.drawImage(im, (S - im.naturalWidth * t) / 2, (S - im.naturalHeight * t) / 2, im.naturalWidth * t, im.naturalHeight * t);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = '#2a2340'; g.fillRect(0, 0, S, S);
  c.drawImage(cv, x - box / 2, y - box / 2, box, box); return true;
}

// ---------- Minispiel-Hintergründe (Low-Poly-Bausteine aus assets/lowpoly/bg) ----------
// Oben (Wand/Himmel) und unten (Boden/Tisch) werden getrennt eingesetzt, damit jede Trennlinie (counter, floor, horizon)
// weiter stimmt. Solange ein Bild lädt, zeichnet die alte Funktion.
const LP_BG = {};
function lpBgImg(name) {
  if (!LP.on) return null;
  let im = LP_BG[name]; if (!im) { im = LP_BG[name] = new Image(); im.src = 'assets/lowpoly/bg/' + name + '.jpg?v=1'; }
  return im.complete && im.naturalWidth ? im : null;
}
// Bild füllt das Rechteck ohne Verzerren (zugeschnitten); ay: 0 = oben ausrichten, 1 = unten
function lpCover(c, im, x, y, w, h, ay = 0.5, ox = 0) {
  if (h <= 0 || w <= 0) return;
  const s = Math.max(w / im.naturalWidth, h / im.naturalHeight), sw = w / s, sh = h / s;
  let sx = (im.naturalWidth - sw) / 2 + ox / s; sx = ((sx % (im.naturalWidth - sw + 1)) + (im.naturalWidth - sw + 1)) % (im.naturalWidth - sw + 1);
  c.drawImage(im, sx, (im.naturalHeight - sh) * ay, sw, sh, x, y, w, h);
}
function lpSplit(c, top, bottom, line) {   // oben bis `line`, darunter Boden, dazwischen eine weiche Kante
  const a = lpBgImg(top), b = lpBgImg(bottom); if (!a || !b) return false;
  lpCover(c, a, 0, 0, GAME_W, line, 1); lpCover(c, b, 0, line, GAME_W, GAME_H - line, 0);
  const g = c.createLinearGradient(0, line, 0, line + 14); g.addColorStop(0, 'rgba(40,25,10,.28)'); g.addColorStop(1, 'rgba(40,25,10,0)');
  c.fillStyle = g; c.fillRect(0, line, GAME_W, 14);
  return true;
}
{
  const area = () => { const a = typeof AREA === 'function' ? AREA() : 'spielplatz'; return a === 'uebung' ? 'spielplatz' : a; };
  const full = name => c => { const im = lpBgImg(name); if (!im) return false; lpCover(c, im, 0, 0, GAME_W, GAME_H); return true; };
  const easy0 = bgEasy, wood0 = bgWood, sky0 = bgSky, kit0 = kitchenBg, ter0 = terraceBg, glass0 = glassBg, chal0 = chaletBg, snow0 = snowBg, asph0 = asphaltBg, chips0 = chipsBand;
  const EASY = { spielplatz: 'easy_spielplatz', kueche: 'easy_kueche', gastraum: 'easy_gastraum', aussen: 'easy_aussen', chalet: 'easy_chalet', parkplatz: 'easy_parkplatz' };
  const WOOD = { kueche: 'wood_kueche', chalet: 'wood_chalet', parkplatz: 'wood_parkplatz', aussen: 'wood_aussen' };
  const SKY = { spielplatz: 'top_spielplatz', kueche: 'top_kueche', gastraum: 'top_gastraum', aussen: 'top_aussen', chalet: 'top_winterabend', parkplatz: 'top_parkplatz' };
  bgEasy = function (c, col) {   // eigene Farbe eines Spiels bleibt als leichter Farbton über dem Low-Poly-Hintergrund
    if (!full(EASY[area()] || 'easy_spielplatz')(c)) return easy0(c, col);
    if (col && col !== '#fff4d6') { c.save(); c.globalAlpha = 0.35; c.fillStyle = col; c.fillRect(0, 0, GAME_W, GAME_H); c.restore(); }
  };
  bgWood = function (c) { if (!full(WOOD[area()] || 'wood_default')(c)) wood0(c); };
  bgSky = function (c, ground = 400) { const im = lpBgImg(SKY[area()] || 'top_himmel'); if (!im) return sky0(c, ground); lpCover(c, im, 0, 0, GAME_W, ground, 1); };
  kitchenBg = function (c, counter = 330) {
    if (!lpSplit(c, 'easy_kueche', 'wood_kueche', counter)) return kit0(c, counter);
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, counter + 3); c.lineTo(GAME_W, counter + 3); c.stroke();
  };
  terraceBg = function (c, floor = 300, t = 0, wind = 0) { if (!lpSplit(c, 'top_terrasse', 'floor_kies', floor)) ter0(c, floor, t, wind); };
  glassBg = function (c, floor = 330, t = 0) { if (!lpSplit(c, 'top_glashaus', 'floor_terrakotta', floor)) glass0(c, floor, t); };
  chaletBg = function (c, floor = 330, t = 0, snow = true) { if (!lpSplit(c, 'top_chalet', 'floor_dielen', floor)) chal0(c, floor, t, snow); };
  snowBg = function (c, t = 0, horizon = 160) {
    if (!lpSplit(c, 'top_wald', 'floor_schnee', horizon)) return snow0(c, t, horizon);
    for (let k = 0; k < 30; k++) { ell(c, (k * 53 + Math.sin(t + k) * 10) % 400, (k * 31 + t * 30) % GAME_H, 2, 2); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); }   // Schneefall bleibt
  };
  asphaltBg = function (c, t = 0) { if (!full('floor_asphalt')(c)) asph0(c, t); };
  chipsBand = function (c, y0, y1, off = 0) {   // Spielplatz: Hackschnitzel-Streifen, läuft mit der Strecke mit
    if (area() !== 'spielplatz') return chips0(c, y0, y1, off);
    const im = lpBgImg('easy_spielplatz2'); if (!im) return chips0(c, y0, y1, off);
    const h = y1 - y0, tw = im.naturalWidth * h / im.naturalHeight, o = ((off % tw) + tw) % tw;
    for (let x = -o; x < GAME_W; x += tw) c.drawImage(im, x, y0, tw + 1, h);
  };
}
