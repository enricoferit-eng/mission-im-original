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
    parkplatz: { map: 'assets/lowpoly/parkplatz/map.jpg?v=2', staff: {} },
    uebung: { map: 'assets/lowpoly/uebung/map.jpg?v=1', staff: {} },
    chalet: { map: 'assets/lowpoly/chalet/map.jpg?v=2', staff: {} },
    spielplatz: { map: 'assets/lowpoly/spielplatz/map.jpg?v=3', staff: {}, roof: [518, 395, 288, 168] },   // Schaukelgerüst, Rutsche, Treppe, Häuschen sind im Bild; Dach extra (wird durchsichtig)
  },
  zoomK: 0.72,   // Zoom in allen Bereichen gleich (Küche als Maß)
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

// ---------- Tore, Sperren, Schilder, Tauben, Leute: gemalte Bilder statt Zeichnung ----------
// Die alten Zeichen-Funktionen bleiben die Vorlage: ihre Größe/Lage wird einmal ausgemessen und das Bild genau dort eingesetzt.
const LP_SPR = {};
function lpSpr(path) {
  if (!LP.on) return null;
  let im = LP_SPR[path]; if (!im) { im = LP_SPR[path] = new Image(); im.src = 'assets/lowpoly/' + path + '.png?v=1'; }
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
// Leute (Gäste, Kinder, Kellner …): gemaltes Bild, 25 % größer als die alte Figur, leichtes Wippen; winken = kleiner Hüpfer
const LP_LEUTE = new Set(["a_hoffmann", "a_klaus", "a_mila", "a_noah", "a_ober", "a_weber", "c_anna", "c_berger", "c_felix", "c_gerda", "c_sepp", "c_toni", "eule", "fuchs", "g_becker", "g_ben", "g_jonas", "g_lina", "g_rosi", "g_s1", "g_s2", "g_s3", "g_s4", "g_schulz", "g_sophie", "hase", "igel", "leo", "olli", "p_julia", "p_karl", "p_petra", "p_schmidt", "p_tim", "waschbaer"]);   // nur für diese gibt es Bilder
function lpPersonWrap(orig, kind) {
  return function (c, id, x, y, s, t, o = {}) {
    const im = LP_LEUTE.has(id) && lpSpr('leute/' + id);
    if (!im) return orig.apply(this, arguments);
    const B = lpMeasure(kind + '_' + id, (g, gx, gy) => orig(g, id, gx, gy, 1, 0, { noShadow: true, staff: true })), h = B.h * s * 1.25, w = im.naturalWidth * h / im.naturalHeight;
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
  im.src = 'assets/lowpoly/welt/gelaende.jpg?v=1';
})();
