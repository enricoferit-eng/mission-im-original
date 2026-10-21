'use strict';
// Halloween-Special: Aufgaben-Hintergründe und Motive im Geisterwald, Kostüme für alle Leute, Gruselmusik.
// Die normalen Bereiche behalten ihre Sachen, Aufgaben und Texte – nur Aussehen und Musik ändern sich ein bisschen.
const HW_AREA = () => typeof AREA === 'function' && AREA() === 'geisterwald';
// Kostüm-Teile auf dem Kopf: 0 Hexenhut, 1 Katzenohren, 2 Teufelshörner, 3 Vampir-Tolle, 'sheet' Gespenst-Tuch, 'none'
const HW_COSTUME_OF = { h_hexe: 0, h_vamp: 3, h_geist: 'sheet', h_bauer: 'none', h_mond: 1, h_mumie: 'none', h_zauber: 0, h_katze: 1 };
function hwCostume(c, id, x, y, s = 1) {
  let k = HW_COSTUME_OF[id]; if (k === 'none') return;
  if (k == null) { let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; k = h % 4; }
  c.save(); c.translate(x, y); c.scale(s, s);
  if (k === 'sheet') { c.globalAlpha = 0.92; c.beginPath(); c.moveTo(-17, 56); c.quadraticCurveTo(-20, -6, 0, -8); c.quadraticCurveTo(20, -6, 17, 56); for (let q = 0; q < 4; q++) c.quadraticCurveTo(17 - q * 8.5 - 4.25, 62 - (q % 2) * 3, 17 - (q + 1) * 8.5, 56); fs(c, '#f8f9fa', 2.5);
    c.globalAlpha = 1; ell(c, -6, 12, 3, 4); c.fillStyle = OL; c.fill(); ell(c, 6, 12, 3, 4); c.fill(); ell(c, 0, 24, 4, 5); c.fill(); }
  else if (k === 0) { ell(c, 0, 0, 20, 5); fs(c, '#3c096c', 2); polyPath(c, [[-11, -1], [11, -1], [4, -20], [10, -28], [0, -21]]); fs(c, '#5a189a', 2); rrPath(c, -11, -5, 22, 4, 1); c.fillStyle = '#ff9f1c'; c.fill(); }
  else if (k === 1) { for (const sx of [-1, 1]) { polyPath(c, [[sx * 4, 0], [sx * 14, -14], [sx * 15, 2]]); fs(c, '#212529', 2); } }
  else if (k === 2) { for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 5, 0); c.quadraticCurveTo(sx * 14, -6, sx * 12, -16); c.quadraticCurveTo(sx * 8, -6, sx * 2, -1); c.closePath(); fs(c, '#d00000', 2); } }
  else { rrPath(c, -12, -4, 24, 6, 3); fs(c, '#212529', 2); polyPath(c, [[-6, -3], [0, -12], [6, -3]]); fs(c, '#212529', 2); }
  c.restore();
}
if (HALLOWEEN) {
  // ---- Motive der allgemeinen Aufgaben: im Geisterwald nur Halloween-Sachen ----
  const mot0 = MOT, pick0 = areaPick, hero0 = heroId;
  MOT = function () { return HW_AREA() ? HW_ITEM_IDS.slice() : mot0(); };   // eslint-disable-line no-func-assign
  areaPick = function (orig) { return HW_AREA() ? HW_ITEM_IDS.slice() : pick0(orig); };   // eslint-disable-line no-func-assign
  heroId = function (def) { return HW_AREA() ? 'hw_kuerbis' : hero0(def); };   // eslint-disable-line no-func-assign

  // ---- Hintergründe der Aufgaben im Geisterwald: Nacht, Sterne, Spinnweben, Kürbisse ----
  const web = (c, x, y, s, flip) => { c.save(); c.translate(x, y); c.scale(flip ? -s : s, s); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.2;
    for (let k = 0; k <= 4; k++) { const a = k * Math.PI / 8; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 70, Math.sin(a) * 70); c.stroke(); }
    for (let r = 18; r <= 66; r += 16) { c.beginPath(); for (let k = 0; k <= 4; k++) { const a = k * Math.PI / 8, px = Math.cos(a) * r, py = Math.sin(a) * r; if (!k) c.moveTo(px, py); else c.lineTo(px, py); } c.stroke(); }
    c.restore(); };
  const stars = (c, w, h, n = 22) => { c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < n; i++) c.fillRect((i * 97) % w, (i * 59) % h, 2, 2); };
  const easy0 = bgEasy, wood0 = bgWood, sky0 = bgSky, chips0 = chipsBand, cyp0 = cypress, img0 = makeImage;
  bgEasy = function (c, col) {   // eslint-disable-line no-func-assign
    if (!HW_AREA()) return easy0(c, col);
    const g = c.createLinearGradient(0, 0, 0, GAME_H); g.addColorStop(0, '#e9d8f5'); g.addColorStop(1, '#f6c48f'); c.fillStyle = g; c.fillRect(0, 0, GAME_W, GAME_H);
    web(c, 0, 0, 1); web(c, GAME_W, 0, 1, true); c.fillStyle = 'rgba(247,127,0,.12)'; for (let i = 0; i < 7; i++) { ell(c, (i * 131) % 400, 120 + (i * 173) % 400, 30 + (i % 3) * 14, 30 + (i % 3) * 14); c.fill(); }
  };
  bgWood = function (c) {   // eslint-disable-line no-func-assign
    if (!HW_AREA()) return wood0(c);
    c.fillStyle = '#5b4256'; c.fillRect(0, 0, GAME_W, GAME_H); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3;
    for (let y = 0; y < GAME_H; y += 44) { c.beginPath(); c.moveTo(0, y); c.lineTo(GAME_W, y); c.stroke(); }
    web(c, 0, 0, 0.9); web(c, GAME_W, 0, 0.9, true);
  };
  bgSky = function (c, ground = 400) {   // eslint-disable-line no-func-assign
    if (!HW_AREA()) return sky0(c, ground);
    const g = c.createLinearGradient(0, 0, 0, ground); g.addColorStop(0, '#3c2a63'); g.addColorStop(1, '#c86b5a'); c.fillStyle = g; c.fillRect(0, 0, GAME_W, ground);
    stars(c, GAME_W, ground * 0.6); ell(c, 330, 70, 28, 28); c.fillStyle = '#fff3bf'; c.fill(); ell(c, 342, 62, 24, 24); c.fillStyle = '#3c2a63'; c.fill();
    c.fillStyle = '#2b1a2f'; for (let x = 10; x < GAME_W; x += 90) { rrPath(c, x, ground - 34, 26, 36, 12); c.fill(); }
  };
  chipsBand = function (c, y0, y1, off = 0) {   // eslint-disable-line no-func-assign
    if (!HW_AREA()) return chips0(c, y0, y1, off);
    const hgt = y1 - y0; c.fillStyle = '#4a3c2a'; c.fillRect(0, y0, GAME_W, hgt);
    const cols = ['#e85d04', '#9d0208', '#ffb703', '#6a4c93'];
    for (let i = 0; i < hgt * 0.35; i++) { const x = ((i * 53.7 + off) % 440 + 440) % 440 - 20, y = y0 + ((i * 37.3) % hgt); ell(c, x, y, 6, 3, i); c.fillStyle = cols[i % 4]; c.globalAlpha = 0.6; c.fill(); }
    c.globalAlpha = 1;
  };
  cypress = function (c, x, y, h) {   // eslint-disable-line no-func-assign
    if (!HW_AREA()) return cyp0(c, x, y, h);
    c.strokeStyle = '#2b1d14'; c.lineCap = 'round'; c.lineWidth = 10; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 6, y - h * 0.5, x + 4, y - h * 0.9); c.stroke();
    c.lineWidth = 5; for (let k = 0; k < 4; k++) { const by = y - h * (0.4 + k * 0.14), s = k % 2 ? 1 : -1; c.beginPath(); c.moveTo(x, by); c.quadraticCurveTo(x + s * 22, by - 18, x + s * 34, by - 34); c.stroke(); }
    jackO(c, x + 14, y - 6, 0.9, 0.7);
  };
  makeImage = function (subj, size = 300) {   // eslint-disable-line no-func-assign
    if (!HW_AREA()) return img0(subj, size);
    const img = document.createElement('canvas'); img.width = img.height = size * 2;
    const ic = img.getContext('2d'); ic.scale(2 * size / 200, 2 * size / 200);
    ic.fillStyle = '#3c2a63'; ic.fillRect(0, 0, 200, 200); ic.fillStyle = '#4a3c2a'; ic.fillRect(0, 140, 200, 60);
    ic.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 14; i++) ic.fillRect((i * 37) % 200, (i * 23) % 130, 2, 2);
    ell(ic, 170, 32, 14, 14); ic.fillStyle = '#fff3bf'; ic.fill(); jackO(ic, 30, 160, 0.9, 0.6); jackO(ic, 172, 166, 0.7, 0.6);
    drawAny(ic, subj, 100, 100, 150);
    return img;
  };

  // ---- Kostüme für alle Leute (kleine Kopf-Teile) ----
  const dc0 = drawCritter;
  drawCritter = function (c, id, x, y, s, t, o = {}) {   // eslint-disable-line no-func-assign
    dc0(c, id, x, y, s, t, o);
    if (id === 'gate' || o.noCostume) return;
    const top = STAFF_PEOPLE[id] ? (STAFF_PEOPLE[id].kid ? 0.82 : 1) * 70 : KIDS[id] ? 54 : 50;
    hwCostume(c, id, x, y - (top - Math.sin((t || 0) * 2.5 + (o.ph || 0)) * 1.2) * s, s);
  };

  // ---- Gruselmusik: gleiche Bereichs-Melodien, aber in Moll, langsamer und mit Glöckchen ----
  for (const k of Object.keys(TUNES)) { const T = TUNES[k]; T.bpm = Math.round(T.bpm * 0.85); T.wave = 'triangle'; T.mel = T.mel.map(m => (m === null ? null : [4, 9, 11, 16, 21, 23].includes(m % 24) ? m - 1 : m)); T.bass = T.bass.map(b => (b % 12 === 4 || b % 12 === 9 ? b - 1 : b)); T.bells = true; }
  TUNES.geisterwald = { bpm: 84, wave: 'triangle', vol: 0.035, bass: [0, 3, 8, 7], mel: [12, 15, 19, 18, 19, null, 15, 12, 11, null, 14, 17, 15, null, 12, null], bells: true };
}
