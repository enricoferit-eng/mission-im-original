'use strict';
// ---------- Aufgaben passend zum Bereich: Motive, Hintergründe und Deko ----------
// Die allgemeinen Spiele (Memory, Schatten, Suchbild, Laufspiele …) holen sich hier, was in den aktuellen Bereich passt.
const AREA = () => (typeof SG !== 'undefined' && SG && SG.id) || 'spielplatz';
const AREA_FOOD = {
  spielplatz: [],
  kueche: ['pasta', 'flammkuchen', 'kuchen', 'croissant'],
  gastraum: ['kuchen', 'flammkuchen', 'pasta', 'croissant', 'limo'],
  aussen: ['eisclown', 'eisbecher', 'limo', 'palme'],
  chalet: [],
  parkplatz: [],
};
const AREA_HERO = { spielplatz: 'ball', kueche: 'tomate', gastraum: 'saftglas', aussen: 'wasserball', chalet: 'kakao', parkplatz: 'spielzeugauto' };
// Motive des Bereichs: die Fundsachen des Bereichs plus passende Gerichte
function MOT() {
  const a = AREA(), base = a === 'spielplatz' ? ITEM_IDS : ((SG && SG.items) || ITEM_IDS);
  return base.concat(AREA_FOOD[a] || []).filter(id => FOOD[id] || ITEMS[id]);
}
// Auf dem Spielplatz bleibt die alte Auswahl, sonst Motive des Bereichs
function areaPick(orig) { return AREA() === 'spielplatz' ? orig : MOT(); }
function heroId(def) { return AREA() === 'spielplatz' ? def : (AREA_HERO[AREA()] || def); }

// ---- Hintergründe je Bereich ----
{
  const easy0 = bgEasy, wood0 = bgWood, sky0 = bgSky, chips0 = chipsBand, cyp0 = cypress;
  const GW_ = () => GAME_W, GH_ = () => GAME_H;
  bgEasy = function (c, col) {
    const a = AREA();
    if (a === 'spielplatz' || (col && col !== '#fff4d6')) return easy0(c, col);
    const W_ = GW_(), H_ = GH_();
    if (a === 'kueche') {   // weiße Fliesen
      c.fillStyle = '#f3f6f7'; c.fillRect(0, 0, W_, H_); c.strokeStyle = 'rgba(120,140,150,.18)'; c.lineWidth = 2;
      for (let x = 0; x <= W_; x += 50) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H_); c.stroke(); }
      for (let y = 0; y <= H_; y += 50) { c.beginPath(); c.moveTo(0, y); c.lineTo(W_, y); c.stroke(); }
    } else if (a === 'gastraum') {   // warme Wand mit Holzvertäfelung unten
      c.fillStyle = '#fbefdc'; c.fillRect(0, 0, W_, H_); c.fillStyle = 'rgba(160,110,60,.12)'; c.fillRect(0, H_ * 0.72, W_, H_ * 0.28);
      c.strokeStyle = 'rgba(120,80,40,.15)'; c.lineWidth = 2; for (let x = 0; x <= W_; x += 40) { c.beginPath(); c.moveTo(x, H_ * 0.72); c.lineTo(x, H_); c.stroke(); }
    } else if (a === 'aussen') {   // Terrasse: helle Steine, ein paar Blätter
      c.fillStyle = '#fff4d6'; c.fillRect(0, 0, W_, H_); c.fillStyle = 'rgba(82,183,136,.16)';
      for (let i = 0; i < 12; i++) { ell(c, (i * 97) % 400, (i * 151) % 520, 14 + (i % 3) * 6, 8 + (i % 2) * 4, i); c.fill(); }
    } else if (a === 'chalet') {   // Winter: hellblau mit Schneeflocken
      c.fillStyle = '#eaf3fb'; c.fillRect(0, 0, W_, H_); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2.5;
      for (let i = 0; i < 14; i++) { const x = (i * 113) % 400, y = (i * 167) % 520, s = 6 + (i % 3) * 3; for (let k = 0; k < 3; k++) { const an = k * Math.PI / 3; c.beginPath(); c.moveTo(x - Math.cos(an) * s, y - Math.sin(an) * s); c.lineTo(x + Math.cos(an) * s, y + Math.sin(an) * s); c.stroke(); } }
    } else if (a === 'parkplatz') {   // heller Beton mit Markierungen
      c.fillStyle = '#eceff1'; c.fillRect(0, 0, W_, H_); c.strokeStyle = 'rgba(255,209,102,.35)'; c.lineWidth = 6; c.setLineDash([24, 18]);
      for (let x = 60; x < W_; x += 140) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H_); c.stroke(); } c.setLineDash([]);
    } else return easy0(c, col);
  };
  bgWood = function (c) {
    const a = AREA(), W_ = GW_(), H_ = GH_();
    if (a === 'kueche') {   // Edelstahl-Arbeitsfläche
      const g = c.createLinearGradient(0, 0, W_, H_); g.addColorStop(0, '#cfd6db'); g.addColorStop(0.5, '#eef2f4'); g.addColorStop(1, '#bcc5cb'); c.fillStyle = g; c.fillRect(0, 0, W_, H_);
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; for (let y = 0; y < H_; y += 6) { c.beginPath(); c.moveTo(0, y); c.lineTo(W_, y + 4); c.stroke(); }
    } else if (a === 'chalet') {   // dunkles Hüttenholz
      c.fillStyle = '#7a4b2a'; c.fillRect(0, 0, W_, H_); c.strokeStyle = 'rgba(40,20,5,.35)'; c.lineWidth = 3;
      for (let y = 0; y < H_; y += 46) { c.beginPath(); c.moveTo(0, y); c.lineTo(W_, y); c.stroke(); }
      for (let i = 0; i < 12; i++) { c.beginPath(); c.arc((i * 131) % 400, (i * 71) % 520 + 20, 8, 0, Math.PI); c.stroke(); }
    } else if (a === 'parkplatz') {   // Asphalt mit Parkstreifen
      c.fillStyle = '#6c757d'; c.fillRect(0, 0, W_, H_); c.fillStyle = 'rgba(0,0,0,.12)';
      for (let i = 0; i < 60; i++) { ell(c, (i * 67) % 400, (i * 113) % 520, 2 + (i % 3), 2); c.fill(); }
      c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 5; for (let x = 20; x < W_; x += 95) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H_); c.stroke(); }
    } else if (a === 'aussen') {   // helles Terrassenholz
      c.fillStyle = '#d9b384'; c.fillRect(0, 0, W_, H_); c.strokeStyle = 'rgba(110,70,30,.22)'; c.lineWidth = 2;
      for (let y = 0; y < H_; y += 36) { c.beginPath(); c.moveTo(0, y); c.lineTo(W_, y); c.stroke(); }
    } else return wood0(c);
  };
  bgSky = function (c, ground = 400) {
    const a = AREA(), W_ = GW_();
    if (a === 'kueche') {   // Küchenwand mit Fliesenspiegel und Regal
      c.fillStyle = '#f3f6f7'; c.fillRect(0, 0, W_, ground); c.strokeStyle = 'rgba(120,140,150,.2)'; c.lineWidth = 2;
      for (let x = 0; x <= W_; x += 40) { c.beginPath(); c.moveTo(x, ground * 0.45); c.lineTo(x, ground); c.stroke(); }
      for (let y = ground * 0.45; y <= ground; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(W_, y); c.stroke(); }
      rrPath(c, 40, ground * 0.22, 320, 10, 3); fs(c, '#adb5bd', 2.5);
      for (let i = 0; i < 4; i++) { rrPath(c, 70 + i * 80, ground * 0.22 - 26, 26, 26, 6); fs(c, ['#e63946', '#ffd166', '#adb5bd', '#2a9d8f'][i], 2.5); }
    } else if (a === 'gastraum') {   // warme Gastraum-Wand mit Fenstern und Lampen
      c.fillStyle = '#f5e6cf'; c.fillRect(0, 0, W_, ground);
      for (let i = 0; i < 3; i++) { const x = 30 + i * 130; rrPath(c, x, ground * 0.15, 90, ground * 0.45, 8); fs(c, '#cfe8f7', 3, '#6b4423'); line(c, x + 45, ground * 0.15, x + 45, ground * 0.6, 3, '#6b4423', false); }
      for (let i = 0; i < 3; i++) { const x = 95 + i * 105; line(c, x, 0, x, 30, 2, '#3d2c1f', false); ell(c, x, 36, 12, 8); fs(c, '#ffd166', 2.5); }
      c.fillStyle = 'rgba(160,110,60,.18)'; c.fillRect(0, ground * 0.7, W_, ground * 0.3);
    } else if (a === 'chalet') {   // Winterabend mit Bergen und Schnee
      const g = c.createLinearGradient(0, 0, 0, ground); g.addColorStop(0, '#5e7fb8'); g.addColorStop(1, '#cfe1f5'); c.fillStyle = g; c.fillRect(0, 0, W_, ground);
      polyPath(c, [[-20, ground], [80, ground * 0.45], [170, ground], [230, ground * 0.5], [330, ground * 0.3], [440, ground]]); c.fillStyle = '#e9f1f9'; c.fill();
      c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 26; i++) { ell(c, (i * 89) % 400, (i * 53) % ground, 2.2, 2.2); c.fill(); }
    } else if (a === 'parkplatz') {   // Himmel mit Straßenlaternen-Silhouetten
      sky0(c, ground); c.fillStyle = 'rgba(80,90,100,.18)';
      for (let i = 0; i < 4; i++) { const x = 40 + i * 110; c.fillRect(x, ground - 150, 5, 150); rrPath(c, x - 12, ground - 156, 30, 9, 4); c.fill(); }
    } else return sky0(c, ground);
  };
  chipsBand = function (c, y0, y1, off = 0) {
    const a = AREA(), W_ = GW_(), hgt = y1 - y0;
    if (a === 'kueche') {   // Fliesenboden im Schachbrett
      const s = 40, o = ((off % s) + s) % s, b = Math.floor(off / s);
      for (let i = -1; i * s - o < W_; i++) for (let j = 0; y0 + j * s < y1; j++) { c.fillStyle = (i + b + j) % 2 ? '#dfe6ea' : '#c4ced4'; c.fillRect(i * s - o, y0 + j * s, s, Math.min(s, y1 - y0 - j * s)); }
    } else if (a === 'gastraum') {   // Holzdielen
      c.fillStyle = '#b07d4f'; c.fillRect(0, y0, W_, hgt); c.strokeStyle = 'rgba(70,40,15,.3)'; c.lineWidth = 2;
      for (let y = y0; y < y1; y += 22) { c.beginPath(); c.moveTo(0, y); c.lineTo(W_, y); c.stroke(); const sh = (((y - y0) / 22) % 2) * 60; for (let x = -((off + sh) % 120); x < W_; x += 120) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, Math.min(y1, y + 22)); c.stroke(); } }
    } else if (a === 'aussen') {   // Terrassen-Pflaster
      c.fillStyle = '#c9c1b4'; c.fillRect(0, y0, W_, hgt); c.strokeStyle = 'rgba(90,80,70,.28)'; c.lineWidth = 2;
      for (let y = y0; y < y1; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(W_, y); c.stroke(); const sh = (((y - y0) / 30) % 2) * 25; for (let x = -((off + sh) % 50); x < W_; x += 50) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, Math.min(y1, y + 30)); c.stroke(); } }
    } else if (a === 'chalet') {   // Schnee mit Glitzer
      c.fillStyle = '#f4f8fc'; c.fillRect(0, y0, W_, hgt); c.fillStyle = 'rgba(160,190,220,.35)';
      for (let i = 0; i < hgt * 0.5; i++) { const x = ((i * 53.7 + off) % 440 + 440) % 440 - 20, y = y0 + ((i * 37.3) % hgt); ell(c, x, y, 5, 2); c.fill(); }
    } else if (a === 'parkplatz') {   // Asphalt mit Mittelstreifen
      c.fillStyle = '#5c6670'; c.fillRect(0, y0, W_, hgt); c.fillStyle = 'rgba(0,0,0,.15)';
      for (let i = 0; i < hgt * 0.8; i++) { const x = ((i * 47.1 + off) % 440 + 440) % 440 - 20, y = y0 + ((i * 29.3) % hgt); ell(c, x, y, 2, 1.5); c.fill(); }
      c.fillStyle = '#f8f9fa'; const ym = y0 + hgt / 2; for (let x = -((off % 80 + 80) % 80); x < W_; x += 80) c.fillRect(x, ym - 3, 44, 6);
    } else return chips0(c, y0, y1, off);
  };
  cypress = function (c, x, y, h) {
    const a = AREA();
    if (a === 'kueche') {   // hoher Kühlschrank
      rrPath(c, x - h * 0.16, y - h, h * 0.32, h, 6); fs(c, '#e9ecef', 3); line(c, x - h * 0.16, y - h * 0.62, x + h * 0.16, y - h * 0.62, 2.5, OL, false); line(c, x + h * 0.1, y - h * 0.9, x + h * 0.1, y - h * 0.7, 3, '#868e96', false);
    } else if (a === 'gastraum') {   // Topfpalme
      rrPath(c, x - 14, y - 26, 28, 26, 5); fs(c, '#c1121f', 3); line(c, x, y - 26, x, y - h * 0.8, 4, '#8d5a3b', false);
      for (let k = 0; k < 5; k++) { const an = -Math.PI / 2 + (k - 2) * 0.55; ell(c, x + Math.cos(an) * 20, y - h * 0.8 + Math.sin(an) * 14, 18, 6, an); fs(c, '#40916c', 2.5); }
    } else if (a === 'chalet') {   // verschneite Tanne
      for (let k = 0; k < 3; k++) { const ty = y - h + k * h * 0.28, w = h * (0.18 + k * 0.08); polyPath(c, [[x, ty], [x + w, ty + h * 0.4], [x - w, ty + h * 0.4]]); fs(c, '#2d6a4f', 2.5); polyPath(c, [[x, ty], [x + w * 0.5, ty + h * 0.14], [x - w * 0.5, ty + h * 0.14]]); fs(c, '#fff', 0); }
      rrPath(c, x - 5, y - h * 0.08, 10, h * 0.08, 2); fs(c, '#6b4423', 2);
    } else if (a === 'parkplatz') {   // Straßenlaterne
      rrPath(c, x - 3, y - h, 6, h, 2); fs(c, '#495057', 2); rrPath(c, x - 14, y - h - 6, 28, 10, 4); fs(c, '#343a40', 2); ell(c, x, y - h + 6, 8, 4); c.fillStyle = '#ffe066'; c.fill();
    } else return cyp0(c, x, y, h);
  };
  // Bilder für Puzzle/Schiebe-/Dreh-Rätsel: Hintergrund passend zum Bereich
  const img0 = makeImage;
  makeImage = function (subj, size = 300) {
    const a = AREA(); if (a === 'spielplatz') return img0(subj, size);
    const img = document.createElement('canvas'); img.width = img.height = size * 2;
    const ic = img.getContext('2d'); ic.scale(2 * size / 200, 2 * size / 200);
    const BG = { kueche: ['#f3f6f7', '#c4ced4'], gastraum: ['#f5e6cf', '#b07d4f'], aussen: ['#bde0fe', '#c9c1b4'], chalet: ['#cfe1f5', '#f4f8fc'], parkplatz: ['#d8f3ff', '#6c757d'] }[a] || ['#bde0fe', '#95d5b2'];
    ic.fillStyle = BG[0]; ic.fillRect(0, 0, 200, 200); ic.fillStyle = BG[1]; ic.fillRect(0, 140, 200, 60);
    if (a === 'kueche') { ic.strokeStyle = 'rgba(120,140,150,.25)'; ic.lineWidth = 1.5; for (let x = 0; x <= 200; x += 25) { ic.beginPath(); ic.moveTo(x, 0); ic.lineTo(x, 140); ic.stroke(); } }
    if (a === 'gastraum') { rrPath(ic, 20, 20, 50, 70, 6); fs(ic, '#cfe8f7', 2.5, '#6b4423'); ell(ic, 160, 30, 12, 8); fs(ic, '#ffd166', 2); }
    if (a === 'aussen') { ic.fillStyle = '#fff'; ell(ic, 40, 40, 22, 12); ic.fill(); polyPath(ic, [[120, 60], [190, 60], [180, 80], [130, 80]]); fs(ic, '#f77f00', 2); }
    if (a === 'chalet') { ic.fillStyle = '#fff'; for (let i = 0; i < 14; i++) { ell(ic, (i * 37) % 200, (i * 23) % 130, 2, 2); ic.fill(); } }
    if (a === 'parkplatz') { ic.fillStyle = '#fff'; ic.fillRect(0, 168, 200, 4); ic.fillStyle = '#ffd166'; ell(ic, 175, 30, 12, 12); ic.fill(); }
    drawAny(ic, subj, 100, 100, 150);
    return img;
  };
}
