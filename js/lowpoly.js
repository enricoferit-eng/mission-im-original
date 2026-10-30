'use strict';
// ---------- Low-Poly-Grafik (von Magnific gemalt) ----------
// Erst nur die Küche: fertiges Hintergrundbild statt Boden + Möbel, gemalte Figuren statt gezeichneter.
// Figuren werden über das Bild gezeichnet (wie in Draufsicht-Spielen üblich). lpOcclude zeichnet Wand-/Möbelstücke
// wieder über eine Figur, steht aber nicht im Einsatz: Bei großen Figuren schneidet es sie neben Wänden halb ab.
const LP = {
  on: !/[?&]lowpoly=0/.test(location.search),
  stages: {
    kueche: { map: 'assets/lowpoly/kueche/map.jpg?v=2', staff: { k_nina: 'nina', k_tom: 'tom', k_luca: 'luca', k_marco: 'marco', k_lea: 'lea' } },
    gastraum: { map: 'assets/lowpoly/gastraum/map.jpg?v=2', staff: {} },
    aussen: { map: 'assets/lowpoly/aussen/map.jpg?v=1', staff: {} },
    parkplatz: { map: 'assets/lowpoly/parkplatz/map.jpg?v=3', staff: {} },
    uebung: { map: 'assets/lowpoly/uebung/map.jpg?v=1', staff: {} },
    chalet: { map: 'assets/lowpoly/chalet/map.jpg?v=2', staff: {} },
    spielplatz: { map: 'assets/lowpoly/spielplatz/map.jpg?v=3', staff: {}, roof: [518, 395, 288, 168] },   // Schaukelgerüst, Rutsche, Treppe, Häuschen sind im Bild; Dach extra (wird durchsichtig)
  },
  zoomK: 0.72,   // Zoom in allen Bereichen gleich (Küche als Maß)
  playerArt: true,   // gemalte Spielfigur (Löwe/Bär/Hund); andere Tiere zeichnen weiter die alte Figur
  catH: 74, staffH: 90, part: 2,   // Kamera: man sieht etwa 1/2 des Raums, auf jedem Bildschirm gleich
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
const LP_STEP = [0, 1, 3, 4];   // Laufbilder 3 und 6 stehen fast still (hakt) – nur die 4 Schrittbilder
function lpSprite(c, im, x, y, h, flip = 1, bob = 0, tilt = 0) {
  const w = h * im.naturalWidth / im.naturalHeight;
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(40,25,10,.28)'; c.beginPath(); c.ellipse(0, -2, w * 0.4, h * 0.07, 0, 0, Math.PI * 2); c.fill();
  c.translate(0, -bob); c.rotate(tilt); c.scale(flip, 1); c.drawImage(im, -w / 2, -h, w, h); c.restore();
}
// Spielfigur: Richtung aus der Bewegung, alle 11 px Weg ein neues Laufbild (6 Bilder = ein Schritt)
// Ordner der gemalten Figur: spieler/<tier>/<skin oder basis>; null = keine Bilder (alte Zeichnung)
const LP_KINDS = new Set(['lion', 'bear', 'dog']);
function lpPlayerSet(kind) {
  if (!LP_KINDS.has(kind)) return null;
  const sk = typeof ACC === 'function' && ACC() ? DP(CUR_DIFF).equip : null, dir = (sk && typeof lpSkinDir === 'function' && lpSkinDir(sk)) || 'basis';
  const base = 'spieler/' + kind + '/' + dir + '/';
  return lpSpr(base + 'stand_front') ? base : lpSpr('spieler/' + kind + '/basis/stand_front') ? 'spieler/' + kind + '/basis/' : null;
}
function lpDrawPlayer(c, p, x, y, tilt, kind) {
  const set = lpPlayerSet(kind); if (!set) return false;
  const P = LP.player, dx = P.lx == null ? 0 : p.x - P.lx, dy = P.ly == null ? 0 : p.y - P.ly; P.lx = p.x; P.ly = p.y;
  const d = Math.hypot(dx, dy);
  if (p.moving && d > 0.05) {
    if (Math.abs(dx) > Math.abs(dy) * 0.8) { P.face = 'side'; P.flip = dx < 0 ? -1 : 1; } else P.face = dy < 0 ? 'back' : 'front';
    P.dist += d;
  }
  if (p.slide) { const sim = lpSpr(set + 'stand_side') || lpSpr(set + 'stand_front'); lpSprite(c, sim, x, y + 6, LP.catH * 0.92, 1, 0, 0.42); P.face = 'side'; P.flip = 1; return true; }   // Rutschen: seitlich, nach vorn geneigt wie die Rutsche
  const im = (p.moving && lpSpr(`${set}${P.face}_${LP_STEP[Math.floor(P.dist / 14) % 4]}`)) || lpSpr(set + 'stand_front');
  lpSprite(c, im, x, y, LP.catH, p.moving && P.face === 'side' ? P.flip : 1, p.moving ? 0 : Math.sin(p.t * 2.2) * 0.6, tilt || 0);
  return true;
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

// ---------- Tore, Sperren, Schilder, Tauben, Leute: gemalte Bilder statt Zeichnung ----------
// Die alten Zeichen-Funktionen bleiben die Vorlage: ihre Größe/Lage wird einmal ausgemessen und das Bild genau dort eingesetzt.
const LP_SPR = {};
function lpSpr(path) {
  if (!LP.on) return null;
  let im = LP_SPR[path]; if (!im) { im = LP_SPR[path] = new Image(); im.src = 'assets/lowpoly/' + path + '.png?v=2'; }
  return im.complete && im.naturalWidth ? im : null;
}
const LP_BOX = new Map();
// Rahmen einer Zeichnung bei Maßstab 1, relativ zum Fußpunkt (x, y)
function lpMeasure(key, draw) {
  let b = LP_BOX.get(key); if (b) return b;
  const S = 900, cv = document.createElement('canvas'); cv.width = cv.height = S; const g = cv.getContext('2d'); g.lineJoin = 'round'; g.lineCap = 'round';
  try { draw(g, S / 2, S * 0.8); } catch (e) { /* egal */ }
  let d; try { d = g.getImageData(0, 0, S, S).data; } catch (e) { d = null; }
  let x0 = S, y0 = S, x1 = -1, y1 = -1;
  if (d) for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (d[(y * S + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  b = x1 < 0 ? { x0: -40, y0: -120, w: 80, h: 120 } : { x0: x0 - S / 2, y0: y0 - S * 0.8, w: x1 - x0, h: y1 - y0 };
  LP_BOX.set(key, b); return b;
}
function lpLock(c, x, y, r, t) { const im = lpSpr('tore/schloss'); if (!im) return; const b = Math.sin((t || 0) * 3) * 2; c.drawImage(im, x - r, y - r + b, r * 2, r * 2); }
// Tor: geschlossen/offen als Bild, gleiche Breite wie die alte Zeichnung, gleicher Boden
function lpGateWrap(orig, name) {
  const f = function (c, x, y, s, open, locked, t, ...rest) {
    const a = lpSpr('tore/tor_' + name + '_0'), b = lpSpr('tore/tor_' + name + '_1');
    if (!a || !b) return orig.call(this, c, x, y, s, open, locked, t, ...rest);
    const B = lpMeasure('gate_' + name, (g, gx, gy) => orig(g, gx, gy, 1, 0, false, 0)), k = B.w * s / a.naturalWidth, im = (open || 0) > 0.5 ? b : a;
    const w = im.naturalWidth * k, h = im.naturalHeight * k, left = x + B.x0 * s, bottom = y + (B.y0 + B.h) * s;
    const side = s >= 0.9 && typeof WORLD_W !== 'undefined' && (x < 140 || x > WORLD_W - 140) ? (x < 140 ? -1 : 1) : 0;   // Tor in einer Seitenwand: von der Seite gesehen (schmal), nicht quer im Raum
    if (side) {
      const cx = x + (B.x0 + B.w / 2) * s, sw = w * 0.34;
      c.save(); c.fillStyle = 'rgba(40,25,10,.22)'; ell(c, cx, bottom - 2 * s, sw * 0.7, 6 * s); c.fill();
      c.translate(cx, bottom); c.transform(1, side * -0.35, 0, 1, 0, 0); c.drawImage(im, -sw / 2, -h, sw, h); c.restore();
      if (locked) lpLock(c, cx, bottom - h * 0.55, 20 * Math.max(0.6, s), t);
      return;
    }
    c.save(); c.fillStyle = 'rgba(40,25,10,.22)'; ell(c, x + (B.x0 + B.w / 2) * s, bottom - 2 * s, B.w * 0.5 * s, 7 * s); c.fill(); c.restore();
    c.drawImage(im, left, bottom - h, w, h);
    if (locked) lpLock(c, x + (B.x0 + B.w / 2) * s, bottom - h * 0.55, 20 * Math.max(0.6, s), t);
  };
  f.lpOrig = orig; return f;
}
// Taube: steht oder fliegt (Flügel abwechselnd oben/unten)
function lpPigeonWrap(orig) {
  return function (c, x, y, s, t, dir, flying) {
    const im = flying ? lpSpr((Math.sin((t || 0) * 22) > 0) ? 'tore/taube_hoch' : 'tore/taube_runter') : lpSpr('tore/taube_steht');
    if (!im) return orig.apply(this, arguments);
    const B = lpMeasure('pigeon', (g, gx, gy) => orig(g, gx, gy, 1, 0, 1, false)), h = B.h * s * 1.25, w = im.naturalWidth * h / im.naturalHeight;
    if (!flying) { c.save(); c.fillStyle = 'rgba(40,25,10,.22)'; ell(c, x, y, w * 0.35, 3 * s); c.fill(); c.restore(); }
    c.save(); c.translate(x, y); c.scale(dir < 0 ? -1 : 1, 1); c.drawImage(im, -w / 2, -h, w, h); c.restore();
  };
}
// Leute (Gäste, Kinder, Kellner …): gemaltes Bild, etwa so groß wie die alte Figur (passend zu Stühlen/Tischen), leichtes Wippen; winken = kleiner Hüpfer
const LP_LEUTE = new Set(["a_hoffmann", "a_klaus", "a_mila", "a_noah", "a_ober", "a_weber", "c_anna", "c_berger", "c_felix", "c_gerda", "c_sepp", "c_toni", "eule", "fuchs", "g_becker", "g_ben", "g_jonas", "g_lina", "g_rosi", "g_s1", "g_s2", "g_s3", "g_s4", "g_schulz", "g_sophie", "hase", "igel", "leo", "olli", "p_julia", "p_karl", "p_petra", "p_schmidt", "p_tim", "waschbaer"]);   // nur für diese gibt es Bilder
function lpPersonWrap(orig, kind) {
  return function (c, id, x, y, s, t, o = {}) {
    const im = LP_LEUTE.has(id) && lpSpr('leute/' + id);
    if (!im) return orig.apply(this, arguments);
    const B = lpMeasure(kind + '_' + id, (g, gx, gy) => orig(g, id, gx, gy, 1, 0, { noShadow: true, staff: true })), h = B.h * s * 0.96, w = im.naturalWidth * h / im.naturalHeight;
    const bob = o.wave ? Math.abs(Math.sin((t || 0) * 6)) * 4 * s : Math.abs(Math.sin((t || 0) * 1.6 + (o.ph || x))) * 1.2 * s;
    if (!o.noShadow) { c.save(); c.fillStyle = 'rgba(40,25,10,.25)'; ell(c, x, y - 1, w * 0.36, 5 * s); c.fill(); c.restore(); }
    c.drawImage(im, x - w / 2, y - h - bob - (o.sit ? -h * 0.12 : 0), w, h);
  };
}
function lpPatch() {
  if (!LP.on || lpPatch.done) return; lpPatch.done = true;
  const G = { kueche: 'kueche', gastraum: 'gastraum', aussen: 'aussen', chalet: 'chalet', parkplatz: 'parkplatz' };
  for (const id in G) { const D = STAGE_DEFS[id]; if (!D || !D.drawGate) continue; const w = lpGateWrap(D.drawGate, G[id]); D.drawGate = w; if (D.gateFace) D.gateFace = (c, x, y, s, t) => w(c, x, y + 0, s * 0.42, 0, true, t); }
  if (typeof drawGate === 'function') drawGate = lpGateWrap(drawGate, 'spielplatz');
  if (typeof drawGardenGate === 'function') drawGardenGate = lpGateWrap(drawGardenGate, 'aussen');
  if (typeof drawPigeon === 'function') drawPigeon = lpPigeonWrap(drawPigeon);
  if (typeof drawAnimal === 'function') drawAnimal = lpAnimalWrap(drawAnimal);
  if (typeof cachedCard === 'function') { const cc0 = cachedCard;   // Laden-Karten erst merken, wenn die gemalte Figur geladen ist
    cachedCard = function (key, w, h, draw) { LP_MISS = false; const r = cc0(key, w, h, draw); if (LP_MISS) { SHOP_CARD_CACHE.clear(); LP_MISS = false; } return r; }; }
  if (typeof drawPerson === 'function') drawPerson = lpPersonWrap(drawPerson, 'p');
  if (typeof drawCritter === 'function') drawCritter = lpPersonWrap(drawCritter, 'c');
  if (typeof drawLockedDoors === 'function') { const o = drawLockedDoors; drawLockedDoors = function (c, x, y, w, t) { const im = lpSpr('tore/glastuer'); if (!im) return o(c, x, y, w, t); const h = 118; c.drawImage(im, x - w / 2 - 6, y - h, w + 12, h); lpLock(c, x, y - 60, 18, t); }; }
  if (typeof drawLockedFence === 'function') { const o = drawLockedFence; drawLockedFence = function (c, x, y0, y1, t) {   // Zaun von der Seite: Zaunstücke übereinander
      const im = lpSpr('tore/zaun'); if (!im) return o(c, x, y0, y1, t);
      const sw = 44, sh = sw * im.naturalHeight / im.naturalWidth;
      for (let y = y0 - 10; y < y1 + 10; y += sw * 0.8) { c.save(); c.translate(x, y); c.rotate(Math.PI / 2); c.drawImage(im, 0, -sh / 2, sw, sh); c.restore(); }
      lpLock(c, x + 26, (y0 + y1) / 2 - 50, 18, t); }; }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lpPatch); else setTimeout(lpPatch, 0);

// ---------- Gelände rund um die Bereiche (Wiesen, Straßen, Garten) als gemaltes Bild ----------
// Ersetzt das gezeichnete Gelände unter allem (und auf der Weltkarte), sobald es geladen ist.
(function lpTerrain() {
  if (!LP.on) return;
  const im = new Image();
  im.onload = () => { if (typeof worldBox === 'function') TERRAIN = { cv: im, B: worldBox() }; };
  im.src = 'assets/lowpoly/welt/gelaende.jpg?v=2';
})();

// ---------- Skins der Spielfigur: welcher Ordner mit gemalten Bildern gehört zu welchem Skin ----------
// LP_SKIN_HAVE wird beim Hinzufügen neuer Bögen aktualisiert (tier -> vorhandene Ordner).
const LP_SKIN_HAVE = {"bear":["sk_astro","sk_bau","sk_biene","sk_cowboy","sk_detektiv","sk_dino","sk_drache","sk_einhorn","sk_feuer","sk_gaertner","sk_held","sk_hexe","sk_koch","sk_koenig","sk_matrose","sk_ninja","sk_pirat","sk_ritter","sk_schlaf","sk_sport","sk_surfer","sk_wikinger","sk_zauberer","u_eis","u_koch","u_latz","u_pulli","u_schuerze","u_weste"],"dog":["sk_astro","sk_bau","sk_biene","sk_cowboy","sk_detektiv","sk_dino","sk_drache","sk_einhorn","sk_feuer","sk_gaertner","sk_held","sk_hexe","sk_koch","sk_koenig","sk_matrose","sk_ninja","sk_pirat","sk_ritter","sk_schlaf","sk_sport","sk_surfer","sk_wikinger","sk_zauberer","u_eis","u_koch","u_latz","u_pulli","u_schuerze","u_weste"],"lion":["sk_astro","sk_bau","sk_biene","sk_cowboy","sk_detektiv","sk_dino","sk_drache","sk_einhorn","sk_feuer","sk_gaertner","sk_held","sk_hexe","sk_koch","sk_koenig","sk_matrose","sk_ninja","sk_pirat","sk_ritter","sk_schlaf","sk_sport","sk_surfer","sk_wikinger","sk_zauberer","u_eis","u_koch","u_latz","u_pulli","u_schuerze","u_weste"]};   // @@SKINLISTE@@
function lpSkinDir(id) {
  const sk = typeof SKINS !== 'undefined' && SKINS[id]; if (!sk) return null;
  const kind = typeof scene !== 'undefined' && scene && scene.kind, have = new Set(LP_SKIN_HAVE[kind] || []);
  if (have.has(id)) return id;
  if (sk.uniform && have.has('u_' + sk.uniform)) return 'u_' + sk.uniform;
  return null;
}

// Spielfigur überall (Laden, Garderobe, Menü, Minispiele, Film): gemalte Figur statt Zeichnung.
// Welcher Skin? look ist meist SKINS[id] (gleiches Objekt) -> Ordner; ohne look der angezogene Skin.
let LP_LOOK2ID = null, LP_MISS = false;
function lpAnimalWrap(orig) {
  return function (c, kind, x, y, s, o = {}) {
    if (!LP.playerArt || !LP_KINDS.has(kind)) return orig.apply(this, arguments);
    if (!LP_LOOK2ID) { LP_LOOK2ID = new Map(); for (const id in SKINS) LP_LOOK2ID.set(SKINS[id], id); }
    let id = null;
    if (o.look) id = LP_LOOK2ID.get(o.look) || null;
    else if (typeof ACC === 'function' && ACC()) id = DP(CUR_DIFF).equip || null;
    const have = new Set(LP_SKIN_HAVE[kind] || []), sk = id && SKINS[id];
    const dir = id && have.has(id) ? id : sk && sk.uniform && have.has('u_' + sk.uniform) ? 'u_' + sk.uniform : 'basis';
    const base = 'spieler/' + kind + '/' + dir + '/', t = o.t || 0;
    const im = (o.moving && lpSpr(base + 'side_' + LP_STEP[Math.floor(t * 8) % 4])) || lpSpr(base + 'stand_front') || lpSpr('spieler/' + kind + '/basis/stand_front');
    if (dir !== 'basis' && !lpSpr(base + 'stand_front')) LP_MISS = true;   // Kostüm-Bild lädt noch: Karte nicht mit der Grundfigur merken
    if (!im) { LP_MISS = true; return orig.apply(this, arguments); }
    const B = lpMeasure('animal_' + kind, (g, gx, gy) => orig(g, kind, gx, gy, 1, { noShadow: true, look: DEFAULT_LOOK, noOutfit: true }));
    const h = B.h * s * 1.2, w = im.naturalWidth * h / im.naturalHeight, flip = o.moving && (o.dir || 1) < 0 ? -1 : 1;
    c.save(); c.translate(x, y);
    if (!o.noShadow) { c.fillStyle = 'rgba(40,25,10,.25)'; ell(c, 0, -1, w * 0.36, 5 * s); c.fill(); }
    const bob = o.moving ? 0 : Math.sin(t * 2.2) * 0.8 * s;
    c.translate(0, -bob); if (o.tilt) c.rotate(o.tilt); c.scale(flip, 1); c.drawImage(im, -w / 2, -h, w, h); c.restore();
  };
}

// ---------- Menü-Hintergründe (assets/lowpoly/menu): Hauptmenü, Konten, Laden, Garderobe, Pokale, Park ----------
const LP_MENU = {};
function lpMenuImg(name) {
  if (!LP.on) return null;
  let im = LP_MENU[name]; if (!im) { im = LP_MENU[name] = new Image(); im.src = 'assets/lowpoly/menu/' + name + '.jpg?v=1'; }
  return im.complete && im.naturalWidth ? im : null;
}
function lpMenuCover(c, name, ay = 0.5) {
  const im = lpMenuImg(name); if (!im) return false;
  c.save(); c.setTransform(DPR, 0, 0, DPR, 0, 0); lpCover(c, im, 0, 0, W, H, ay); c.restore(); return true;
}
function lpMenuPatch() {
  if (typeof menuBg !== 'function') return;
  const menu0 = menuBg, sky0 = skyBg, theme0 = themeBg;
  ['menu', 'sky', 'shop', 'dress', 'trophy', 'park'].forEach(lpMenuImg);   // früh laden, damit kein alter Hintergrund aufblitzt
  menuBg = function (c, t) {
    if (!lpMenuCover(c, 'menu', 0.55)) return menu0(c, t);
  };
  skyBg = function (c) { if (!lpMenuCover(c, 'sky', 0.6)) sky0(c); };
  themeBg = function (c, kind) { if (!lpMenuCover(c, kind, 0.5)) theme0(c, kind); };
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lpMenuPatch); else setTimeout(lpMenuPatch, 0);

// ---------- Knöpfe (assets/lowpoly/ui): runde Knöpfe in 6 Farben, große Pillen-Knöpfe grün/gelb ----------
const LP_RUND = { white: [242, 242, 242], yellow: [240, 185, 74], green: [166, 207, 74], blue: [140, 200, 234], grey: [203, 200, 200], red: [238, 107, 85] };
const LP_RUND_PICK = new Map();
function lpRundFor(bg) {   // nächste gemalte Farbe zur Code-Farbe
  if (typeof bg !== 'string' || bg[0] !== '#') return null;
  let k = LP_RUND_PICK.get(bg);
  if (!k) {
    let h = bg.slice(1); if (h.length === 3) h = h.split('').map(q => q + q).join('');
    const v = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)), sat = Math.max(...v) - Math.min(...v);
    let best = 1e9; for (const n in LP_RUND) { if (sat < 30 && n !== 'white' && n !== 'grey') continue;
      const d = LP_RUND[n].reduce((s, q, i) => s + (q - v[i]) ** 2, 0); if (d < best) { best = d; k = n; } }
    LP_RUND_PICK.set(bg, k);
  }
  return lpSpr('ui/rund_' + k);
}
function lpRund(c, x, y, r, bg = '#fff') {   // runder gemalter Knopf (ohne Symbol); false, solange das Bild lädt
  const im = lpRundFor(bg); if (!im) return false;
  c.save(); c.fillStyle = 'rgba(0,0,0,.28)'; ell(c, x, y + 4, r, r); c.fill(); c.drawImage(im, x - r * 1.04, y - r * 1.04, r * 2.08, r * 2.08); c.restore(); return true;
}
function lpPill(c, x, y, w, h, kind = 'green') {   // Pillen-Knopf, Enden fest, Mitte gestreckt
  const im = lpSpr('ui/pill_' + kind); if (!im) return false;
  const iw = im.naturalWidth, ih = im.naturalHeight, cap = ih / 2, dc = Math.min(h / 2, w / 2);
  c.save(); c.fillStyle = 'rgba(0,0,0,.25)'; rrPath(c, x, y + 6, w, h, h / 2); c.fill();
  c.drawImage(im, 0, 0, cap, ih, x, y, dc, h);
  c.drawImage(im, cap, 0, iw - cap * 2, ih, x + dc, y, w - dc * 2, h);
  c.drawImage(im, iw - cap, 0, cap, ih, x + w - dc, y, dc, h);
  c.restore(); return true;
}
function lpBtnPatch() {
  if (typeof roundBtn !== 'function') return;
  const rb0 = roundBtn;
  roundBtn = function (c, x, y, r, bg, ic, fn, icCol) {
    if (!LP.on || !lpRund(c, x, y, r, bg)) return rb0.apply(this, arguments);
    icon(c, ic, x, y, r * 1.15, icCol);
    if (fn) UI.btn(x - r - 6, y - r - 6, r * 2 + 12, r * 2 + 12, fn);
  };
  ['white', 'yellow', 'green', 'blue', 'grey', 'red'].forEach(n => lpSpr('ui/rund_' + n)); lpSpr('ui/pill_green'); lpSpr('ui/pill_yellow');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lpBtnPatch); else setTimeout(lpBtnPatch, 0);

// ---------- Minispiel-Teile (assets/lowpoly/teile): Autos von oben, Memory-Karten, Kochtopf ----------
const LP_AUTO = { red: [190, 80, 60], blue: [90, 115, 150], green: [130, 175, 90], yellow: [215, 175, 70], white: [235, 228, 215], orange: [215, 125, 80] };
const LP_AUTO_PICK = new Map();
function lpAutoFor(col) {
  if (typeof col !== 'string' || col[0] !== '#') col = '#e63946';
  let k = LP_AUTO_PICK.get(col);
  if (!k) { let h = col.slice(1); if (h.length === 3) h = h.split('').map(q => q + q).join('');
    const v = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); let best = 1e9;
    for (const n in LP_AUTO) { const d = LP_AUTO[n].reduce((s, q, i) => s + (q - v[i]) ** 2, 0); if (d < best) { best = d; k = n; } }
    LP_AUTO_PICK.set(col, k); }
  return lpSpr('teile/auto_' + k);
}
function lpCard(c, front, cw, ch) {   // Memory-Karte (Mitte 0,0); false, solange das Bild lädt
  const im = lpSpr(front ? 'teile/karte_vorne' : 'teile/karte_hinten'); if (!im) return false;
  c.drawImage(im, -cw / 2 - 3, -ch / 2 - 3, cw + 6, ch + 6); return true;
}
function lpTeilePatch() {
  if (typeof drawCar === 'function') { const car0 = drawCar;
    drawCar = function (c, x, y, a, col, s = 1, o = {}) {
      const im = LP.on && lpAutoFor(col); if (!im) return car0.apply(this, arguments);
      const h = 100, w = h * im.naturalWidth / im.naturalHeight;
      c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
      c.drawImage(im, -w / 2, -h / 2, w, h);
      if (o.lights) { c.fillStyle = 'rgba(255,243,191,.55)'; ell(c, -15, -50, 7, 4); c.fill(); ell(c, 15, -50, 7, 4); c.fill(); }
      if (o.brake) { c.fillStyle = 'rgba(255,60,60,.8)'; ell(c, -15, 47, 7, 3.5); c.fill(); ell(c, 15, 47, 7, 3.5); c.fill(); }
      if (o.mine) { ell(c, 0, 6, 11, 11); fs(c, '#fff', 2); leaf(c, 0, 6, 0.6, BRAND.lime); }
      c.restore();
    }; }
  if (typeof pot === 'function') { const pot0 = pot;
    pot = function (c, x, y, r, col) {
      const im = LP.on && lpSpr('teile/topf'); if (!im) return pot0.apply(this, arguments);
      const w = r * 2 + 30, h = w * im.naturalHeight / im.naturalWidth, top = y - r * 0.2 - h * 0.27;
      c.fillStyle = 'rgba(0,0,0,.18)'; ell(c, x, top + h * 0.95, r * 1.05, r * 0.3); c.fill();
      c.drawImage(im, x - w / 2, top, w, h);
    }; }
  ['red', 'blue', 'green', 'yellow', 'white', 'orange'].forEach(n => lpSpr('teile/auto_' + n)); ['karte_vorne', 'karte_hinten', 'topf'].forEach(n => lpSpr('teile/' + n));
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lpTeilePatch); else setTimeout(lpTeilePatch, 0);

// Gesperrter Nachbarbereich: gemalte Karte blass hinter dem Nebel (statt grauer Fläche)
function lpFogPatch() {
  if (typeof drawFog !== 'function') return;
  const fog0 = drawFog;
  drawFog = function (c, ox, oy, id, t) {
    const im = LP.on && LP.img['map_' + id];
    if (!im || !im.complete || !im.naturalWidth) return fog0.apply(this, arguments);
    c.drawImage(im, ox, oy, areaW(id), areaH(id));
    const TW = areaW(id), TH = areaH(id), cx = ox + TW / 2, cy = oy + TH / 2;   // ruhiger Schleier statt Wolken + vieler Schilder
    c.fillStyle = 'rgba(232,238,241,.62)'; c.fillRect(ox, oy, TW, TH);
    // Schloss + Name dort, wo man gerade hinschaut (sonst sieht man es im Hochformat oft nicht)
    const sc = typeof scene !== 'undefined' && scene, vx = sc && sc.camX != null ? clamp(sc.camX, ox + 140, ox + TW - 140) : cx, vy = sc && sc.camY != null ? clamp(sc.camY, oy + 140, oy + TH - 160) : cy;
    const bx = Math.abs(vx - cx) < TW * 0.35 ? cx : vx, by = Math.abs(vy - cy) < TH * 0.35 ? cy : vy;
    ell(c, bx, by, 54, 54); fs(c, 'rgba(255,255,255,.92)', 4, '#868e96'); icon(c, 'lock', bx, by - 4, 54);
    txt(c, STAGE_NAME[id] || '', bx, by + 84, 32, '#495057', 'center', '#fff');
    { const i = STAGE_ORDER.indexOf(id), prev = STAGE_ORDER[i - 1]; if (prev) txt(c, 'Schaffe zuerst: ' + STAGE_NAME[prev], bx, by + 120, 20, '#6c757d', 'center', '#fff'); }
  };
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lpFogPatch); else setTimeout(lpFogPatch, 0);

// Deko, die im Low-Poly-Modus trotzdem als Sprite gezeichnet wird (nicht im Bodenbild): Autos auf dem Parkplatz
const LP_DECOR_KEEP = { parkplatz: new Set(['auto']) };
function lpKeep(id, d) { const K = LP_DECOR_KEEP[id]; return !!(K && K.has(d.t)); }
function lpOccDraw(c, id, o) { const im = lpSpr(id + '/occ/' + o[0]); if (im) c.drawImage(im, o[1], o[2], o[3], o[4]); }
