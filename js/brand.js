'use strict';
// ---------- Im Original: Logo, Hausfarben, Versprechen, Leckereien, Arbeitsuniformen, Restaurant-Deko ----------
// Farben von im-original.de: dunkles Oliv, Creme, Aprikose, Kupfer + Logo-Grün
const BRAND = { olive: '#35452F', oliveSoft: '#4C5145', cream: '#FBF8F2', sand: '#F2EDE3', apricot: '#F0C08A', copper: '#C9762F', lime: '#95C11F', ink: '#23261F' };
// Was das Original verspricht (Leitsätze von der Webseite)
const CLAIMS = {
  urlaub: 'Dein Urlaub vor der Haustür',
  da: 'Immer für dich da',
  ankommen: 'Reinkommen, hinsetzen, ankommen.',
  rest: 'Der Rest ist unsere Sache.',
  feiern: 'Feiere das Leben im Original',
  fruehstueck: 'Frühstück ohne Eile',
  versprochen: 'Wir haben dir Urlaub versprochen – hier kommt er!',
  herz: 'Alles, was dein Herz begehrt',
};
// wechselnde Mottos (Stage-Auswahl, Danke-Banner)
const MOTTOS = [CLAIMS.urlaub, CLAIMS.da, CLAIMS.ankommen + ' ' + CLAIMS.rest, CLAIMS.feiern + '!', CLAIMS.fruehstueck, CLAIMS.versprochen, CLAIMS.herz];
const PRAISE = ['Super gemacht!', 'Klasse!', 'Toll gelöst!', 'Spitze!', 'Ganz Original!'];
// Dank der Kinder nach einem Auftrag (passend zum Spielplatz)
const THANKS = ['Danke! Jetzt ist auf dem Spielplatz wieder alles an seinem Platz.', 'Danke für deine Hilfe! Die Kinder können weiterspielen.', 'Super! Du bist ein echter Original-Helfer.', 'Danke! Das hätte ich ohne dich nie gefunden.', 'Klasse gemacht! Das Team ist stolz auf dich.'];
// Schild am Ausgang
function drawGateSign(c, x, y) {
  c.fillStyle = 'rgba(0,0,0,.22)'; ell(c, x, y + 3, 30, 7); c.fill();
  line(c, x - 24, y, x - 24, y - 70, 5, '#6c757d'); line(c, x + 24, y, x + 24, y - 70, 5, '#6c757d');
  rrPath(c, x - 52, y - 112, 104, 54, 10); fs(c, BRAND.cream, 3);
  drawLogo(c, x, y - 94, 74, false);
  txt(c, 'Danke für deinen Besuch!', x, y - 70, 8.5, BRAND.olive, 'center', null);
}

// Original-Logo (Datei von im-original.de). Bis es geladen ist, zeichnen wir eine Ersatz-Schrift.
const LOGO = new Image();
let LOGO_OK = false;
LOGO.onload = () => { LOGO_OK = true; if (typeof GROUND !== 'undefined') GROUND = null; clearSprites(); LOGO_CACHE.clear(); };
const LOGO_CACHE = new Map();
LOGO.src = 'assets/logo.png';
const LOGO_RATIO = 1280 / 529;
// Logo in Breite w, Mitte bei (x,y). halo = heller Rand für dunkle/bunte Hintergründe
function drawLogo(c, x, y, w, halo = true) {
  const h = w / LOGO_RATIO;
  if (LOGO_OK) {
    if (halo) {
      // Leuchtrand nur einmal pro Größe berechnen (shadowBlur ist teuer)
      const key = Math.round(w), pad = Math.ceil(Math.max(6, w * 0.04) * 2);
      let cv = LOGO_CACHE.get(key);
      if (!cv) {
        cv = document.createElement('canvas'); const q = 2; cv.width = (key + pad * 2) * q; cv.height = (Math.ceil(h) + pad * 2) * q;
        const g = cv.getContext('2d'); g.scale(q, q); g.shadowColor = 'rgba(255,255,255,.95)'; g.shadowBlur = Math.max(6, w * 0.04);
        for (let i = 0; i < 2; i++) g.drawImage(LOGO, pad, pad, key, h);
        g.shadowBlur = 0; g.drawImage(LOGO, pad, pad, key, h); LOGO_CACHE.set(key, cv);
      }
      c.drawImage(cv, x - w / 2 - pad, y - h / 2 - pad, key + pad * 2, Math.ceil(h) + pad * 2);
      return;
    }
    c.drawImage(LOGO, x - w / 2, y - h / 2, w, h);
  } else {
    txt(c, 'im Original', x, y, h * 0.6, BRAND.lime, 'center', halo ? '#fff' : null);
  }
}
// Kleines Blatt aus dem Logo als Abzeichen (für Uniformen, Schirme, Schilder)
function leaf(c, x, y, s, col = BRAND.lime, rot = -0.5) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(-6, 0); c.quadraticCurveTo(0, -6, 7, -1); c.quadraticCurveTo(1, 5, -6, 0); c.closePath();
  c.fillStyle = col; c.fill(); c.lineWidth = 0.8 / s; c.strokeStyle = 'rgba(0,0,0,.35)'; c.stroke();
  c.restore();
}

// ---------- Leckereien aus dem Original (ersetzen die allgemeinen Formen in allen Rätseln) ----------
const FOOD = {
  kuchen: { n: 'Kuchenstück', d(c) {
    polyPath(c, [[-19, 13], [17, 13], [17, -7], [-19, 7]]); fs(c, '#f6d7a7');
    polyPath(c, [[-19, 9], [17, 3], [17, 6], [-19, 11]]); fs(c, '#fff8e7', 0);
    polyPath(c, [[-19, 3], [17, -5], [17, -2], [-19, 5.5]]); fs(c, '#ff8fab', 0);
    polyPath(c, [[-19, 13], [17, 13], [17, -7], [-19, 7]]); fs(c, null);
    polyPath(c, [[-21, 6], [17, -9], [19, -6], [-19, 9]]); fs(c, '#ffc2d1', 2.5);
    ell(c, 9, -13, 7, 5.5); fs(c, '#fff', 2.2); ell(c, 9, -19, 5.5, 5.5, 0.2); fs(c, '#e63946', 2.2);
    polyPath(c, [[7, -24], [10, -27], [12, -23]]); fs(c, '#52b788', 1.5);
    c.fillStyle = '#ffd60a'; ell(c, 7, -19, 0.9, 0.9); c.fill(); ell(c, 11, -17, 0.9, 0.9); c.fill();
  } },
  eisclown: { n: 'Eisclown', d(c) {
    polyPath(c, [[-15, 2], [15, 2], [10, 14], [-10, 14]]); fs(c, '#bde0fe');
    rrPath(c, -3, 14, 6, 5, 1); fs(c, '#bde0fe', 2); ell(c, 0, 20, 9, 2.5); fs(c, '#bde0fe', 2);
    ell(c, 0, -3, 12.5, 11.5); fs(c, '#fff1c1');
    ell(c, -4, -4, 1.6, 2); c.fillStyle = OL; c.fill(); ell(c, 4, -4, 1.6, 2); c.fill();
    c.beginPath(); c.arc(0, 0, 5, 0.25, Math.PI - 0.25); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke();
    ell(c, 0, -0.5, 2.6, 2.6); fs(c, '#ef233c', 1.5);
    c.fillStyle = 'rgba(255,120,120,.5)'; ell(c, -7, 0, 2.2, 1.4); c.fill(); ell(c, 7, 0, 2.2, 1.4); c.fill();
    polyPath(c, [[-9, -11], [8, -14], [-3, -31]]); fs(c, '#e0a85b');
    c.save(); polyPath(c, [[-9, -11], [8, -14], [-3, -31]]); c.clip(); c.strokeStyle = 'rgba(120,70,20,.6)'; c.lineWidth = 1.2;
    for (let i = -30; i < 20; i += 5) { c.beginPath(); c.moveTo(i, -32); c.lineTo(i + 20, -8); c.stroke(); c.beginPath(); c.moveTo(i + 20, -32); c.lineTo(i, -8); c.stroke(); } c.restore();
    ell(c, -3, -31, 2.6, 2.6); fs(c, '#ef476f', 1.5);
    ['#ef476f', '#06d6a0', '#ffd166'].forEach((k, i) => { ell(c, -8 + i * 8, 7, 1.8, 1.8); c.fillStyle = k; c.fill(); });
  } },
  limo: { n: 'Hausgemachte Limo', d(c) {
    line(c, 1, -8, 8, -27, 3, '#ef476f');
    polyPath(c, [[-11, -14], [11, -14], [8, 17], [-8, 17]]); fs(c, 'rgba(220,240,250,.85)');
    polyPath(c, [[-10, -6], [10, -6], [8, 16], [-8, 16]]); c.fillStyle = '#ffe066'; c.fill();
    c.fillStyle = 'rgba(255,255,255,.75)'; ell(c, -3, 5, 1.6, 1.6); c.fill(); ell(c, 2, 10, 1.3, 1.3); c.fill(); ell(c, 4, 1, 1.1, 1.1); c.fill();
    polyPath(c, [[-11, -14], [11, -14], [8, 17], [-8, 17]]); fs(c, null);
    line(c, -7, -10, -5, 12, 2, 'rgba(255,255,255,.7)', false);
    ell(c, 11, -14, 7, 7); fs(c, '#ffd60a', 2); ell(c, 11, -14, 4.5, 4.5); fs(c, '#fff3b0', 1);
    for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 4; line(c, 11 - Math.cos(a) * 4, -14 - Math.sin(a) * 4, 11 + Math.cos(a) * 4, -14 + Math.sin(a) * 4, 0.8, '#e9c46a', false); }
    ell(c, -8, -16, 4, 2.2, -0.6); fs(c, '#52b788', 1.5);
  } },
  flammkuchen: { n: 'Flammkuchen', d(c) {
    rrPath(c, -20, -10, 33, 22, 4); fs(c, '#c08b55'); rrPath(c, 12, -3, 9, 8, 3); fs(c, '#c08b55', 2);
    rrPath(c, -17, -8, 27, 18, 7); fs(c, '#f3d39b', 2);
    rrPath(c, -14, -5, 21, 12, 5); c.fillStyle = '#fffaf0'; c.fill();
    [[-10, -2], [-3, 2], [3, -2], [-8, 4], [5, 4]].forEach(([x, y]) => { rrPath(c, x - 2, y - 1.5, 4, 3, 1); c.fillStyle = '#e07a5f'; c.fill(); });
    c.strokeStyle = '#c9a0dc'; c.lineWidth = 1; [[-6, 0], [1, 3], [6, 0]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 2, 0, TAU); c.stroke(); });
    c.fillStyle = 'rgba(90,50,20,.45)'; [[-15, -6], [7, 8], [8, -7], [-15, 8]].forEach(([x, y]) => { ell(c, x, y, 1.5, 1); c.fill(); });
  } },
  pasta: { n: 'Pasta', d(c) {
    ell(c, 0, 7, 20, 9); fs(c, '#ffffff'); ell(c, 0, 6, 14, 5.5); fs(c, null, 1.5, 'rgba(0,0,0,.15)');
    c.lineWidth = 2.2; c.strokeStyle = '#e9b949';
    for (let k = 0; k < 7; k++) { c.beginPath(); c.ellipse(Math.sin(k * 2) * 3, 2 - k * 0.8, 10 - k, 5 - k * 0.4, k * 0.4, 0, TAU); c.stroke(); }
    c.lineWidth = 1; c.strokeStyle = 'rgba(120,80,20,.5)'; c.beginPath(); c.ellipse(0, 0, 11, 6, 0, 0, TAU); c.stroke();
    ell(c, 1, -4, 6, 4); fs(c, '#d62828', 1.5); ell(c, -1, -5, 1.6, 1.2); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill();
    ell(c, 6, -7, 3.5, 2, 0.5); fs(c, '#52b788', 1.2);
  } },
  croissant: { n: 'Croissant', d(c) {
    const seg = (x, y, rx, ry, rot, col) => { ell(c, x, y, rx, ry, rot); fs(c, col, 2.2); };
    seg(-14, 4, 6, 4.5, 0.9, '#d98e2b'); seg(14, 4, 6, 4.5, -0.9, '#d98e2b');
    seg(-8, -1, 7, 7, 0.4, '#e9a23b'); seg(8, -1, 7, 7, -0.4, '#e9a23b');
    seg(0, -4, 8, 8.5, 0, '#f2b84b');
    c.strokeStyle = 'rgba(120,60,10,.45)'; c.lineWidth = 1.2; [-3, 3].forEach(x => { c.beginPath(); c.moveTo(x, -11); c.lineTo(x * 0.6, 3); c.stroke(); });
    ell(c, -2, -8, 2.5, 1.4, -0.3); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill();
  } },
  // weitere Motive für Bilder-Rätsel
  eisbecher: { n: 'Eisbecher', d(c) {
    polyPath(c, [[-14, 0], [14, 0], [9, 13], [-9, 13]]); fs(c, '#bde0fe'); rrPath(c, -3, 13, 6, 5, 1); fs(c, '#bde0fe', 2); ell(c, 0, 19, 9, 2.5); fs(c, '#bde0fe', 2);
    ell(c, -6, -4, 7, 6.5); fs(c, '#ffc2d1'); ell(c, 6, -4, 7, 6.5); fs(c, '#a0522d'); ell(c, 0, -11, 7, 6.5); fs(c, '#fff1c1');
    c.beginPath(); c.moveTo(-10, -12); c.quadraticCurveTo(0, -24, 10, -12); c.lineWidth = 3; c.strokeStyle = '#fff'; c.stroke();
    ell(c, 0, -20, 3, 3); fs(c, '#e63946', 1.5); line(c, 5, -16, 12, -24, 2.5, '#f4a261');
  } },
  palme: { n: 'Palme', d(c) {
    rrPath(c, -9, 6, 18, 14, 3); fs(c, BRAND.copper);
    c.beginPath(); c.moveTo(-1, 7); c.quadraticCurveTo(2, -4, 0, -12); c.lineWidth = 5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3; c.strokeStyle = '#8d5a3b'; c.stroke();
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.6; c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(Math.cos(a) * 10, -12 + Math.sin(a) * 10 - 4, Math.cos(a) * 20, -12 + Math.sin(a) * 18 + 6); c.lineWidth = 6; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3.5; c.strokeStyle = '#52b788'; c.stroke(); }
  } },
  glashaus: { n: 'Glashaus', d(c) {
    polyPath(c, [[-20, -2], [0, -18], [20, -2]]); fs(c, '#d6f0f7'); rrPath(c, -18, -2, 36, 20, 2); fs(c, '#d6f0f7');
    c.strokeStyle = '#fff'; c.lineWidth = 2; for (let x = -12; x <= 12; x += 8) { c.beginPath(); c.moveTo(x, -1); c.lineTo(x, 17); c.stroke(); }
    rrPath(c, -4, 6, 8, 12, 1); fs(c, BRAND.olive, 1.5);
    c.beginPath(); c.moveTo(-10, 16); c.quadraticCurveTo(-9, 6, -12, 2); c.lineWidth = 2; c.strokeStyle = '#52b788'; c.stroke();
    leaf(c, 0, -9, 1.1);
  } },
};
const FOOD6 = ['kuchen', 'eisclown', 'limo', 'flammkuchen', 'pasta', 'croissant'];
function drawFood(c, id, x, y, size, sil) {
  c.save(); c.translate(x, y); const k = size / 44; c.scale(k, k); c.lineJoin = 'round'; c.lineCap = 'round';
  if (sil) {
    // Schatten: auf eigene Leinwand zeichnen und einfärben (funktioniert in allen Browsern)
    const S = 96, cv = drawFood.sc || (drawFood.sc = document.createElement('canvas')); cv.width = cv.height = S;
    const g = cv.getContext('2d'); g.clearRect(0, 0, S, S); g.save(); g.translate(S / 2, S / 2); g.scale(S / 52, S / 52); g.lineJoin = 'round'; g.lineCap = 'round';
    FOOD[id].d(g); g.restore();
    g.globalCompositeOperation = 'source-in'; g.fillStyle = '#2a2340'; g.fillRect(0, 0, S, S); g.globalCompositeOperation = 'source-over';
    c.drawImage(cv, -26, -26, 52, 52); c.restore(); return;
  }
  FOOD[id].d(c);
  c.restore();
}
// Die 6 Rätsel-Symbole sind jetzt Leckereien aus dem Original (Farbe bleibt als zweites Merkmal)
SYMS.splice(0, SYMS.length,
  { s: 'kuchen', col: '#ef476f' }, { s: 'eisclown', col: '#118ab2' }, { s: 'limo', col: '#ffd166' },
  { s: 'flammkuchen', col: '#06d6a0' }, { s: 'pasta', col: '#f78c6b' }, { s: 'croissant', col: '#9b5de5' });
// eslint-disable-next-line no-func-assign
drawSym = function (c, i, x, y, r) { drawFood(c, FOOD6[i], x, y, r * 2.5); };
// Kachel in Symbolfarbe mit Leckerei darauf (für Muster-, Spiegel-, Reihen-Rätsel)
function symTile(c, i, x, y, s, col) {
  rrPath(c, x - s / 2, y - s / 2, s, s, s * 0.2); fs(c, col || SYMS[i].col, s > 40 ? 3 : 2);
  ell(c, x, y, s * 0.38, s * 0.38); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill();
  drawFood(c, FOOD6[i], x, y, s * 0.62);
}

// ---------- Arbeitsuniformen (Skins) ----------
// type: schuerze (Service), koch (Kochjacke + Kochmütze), weste (Kellner), eis (Eis-Uniform gestreift), latz (Gärtner für die Palmen), pulli (Chalet-Strickpulli)
function drawUniform(c, L, A) {
  const u = L.uniform; if (!u) return;
  const a = L.uCol || '#fff', b = L.uCol2 || BRAND.olive;
  c.save();
  ell(c, 0, -15, 13, 12); c.clip();
  if (u === 'koch' || u === 'eis' || u === 'pulli') {
    c.fillStyle = a; c.fillRect(-14, -28, 28, 28);
    if (u === 'eis') { c.fillStyle = b; for (let y = -27; y < 0; y += 6) c.fillRect(-14, y, 28, 3); }
    if (u === 'pulli') { c.strokeStyle = b; c.lineWidth = 1.5; for (let y = -24; y < 0; y += 6) { c.beginPath(); for (let x = -14; x <= 14; x += 4) c.lineTo(x, y + ((x / 4) % 2 ? 2 : -1)); c.stroke(); } }
    if (u === 'koch') { c.fillStyle = b; [-10, -5].forEach(y => { ell(c, 4, y, 1.4, 1.4); c.fill(); ell(c, 9, y, 1.4, 1.4); c.fill(); }); line(c, 2, -27, 6, -18, 1.4, 'rgba(0,0,0,.2)', false); }
  } else if (u === 'weste') {
    c.fillStyle = '#fff'; c.fillRect(-14, -28, 28, 28);
    c.fillStyle = a; c.fillRect(-14, -28, 13, 28); c.fillRect(7, -28, 8, 28);
    c.fillStyle = b; ell(c, 4, -12, 1.2, 1.2); c.fill(); ell(c, 4, -7, 1.2, 1.2); c.fill();
  } else if (u === 'latz') {
    c.fillStyle = a; c.fillRect(-14, -14, 28, 16); c.fillRect(-1, -22, 12, 9);
    line(c, 1, -22, -6, -28, 2.2, a, false); line(c, 9, -22, 12, -28, 2.2, a, false);
    c.fillStyle = b; ell(c, 1, -20, 1.2, 1.2); c.fill(); ell(c, 9, -20, 1.2, 1.2); c.fill();
  } else if (u === 'schuerze') {
    rrPath(c, -2, -19, 15, 22, 3); c.fillStyle = a; c.fill();
    line(c, -12, -12, 12, -12, 1.6, b, false);
  }
  c.restore();
  ell(c, 0, -15, 13, 12); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
  if (u === 'schuerze') { rrPath(c, -2, -19, 15, 22, 3); c.save(); ell(c, 0, -15, 13, 12); c.clip(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); c.restore(); }
  leaf(c, 7, -15, 0.9, u === 'koch' || u === 'weste' ? BRAND.lime : '#fff');
}
// Mützen je Uniform (ersetzen die Spielplatz-Kappe optisch)
function drawHat(c, L, cp) {
  if (L.hat === 'toque') {
    rrPath(c, -8, -52, 18, 9, 2); fs(c, '#fff', 2.5);
    [[-6, -57, 6], [1, -60, 7], [8, -57, 6]].forEach(([x, y, r]) => { ell(c, x, y, r, r); fs(c, '#fff', 2.5); });
    rrPath(c, -7, -53, 16, 5, 2); c.fillStyle = '#fff'; c.fill(); leaf(c, 1, -48, 0.7);
    return true;
  }
  if (L.hat === 'beret') { ell(c, 2, -48, 13, 5, -0.15); fs(c, cp, 2.5); ell(c, 2, -53, 2, 2); fs(c, cp, 1.5); return true; }
  if (L.hat === 'muetze') { c.beginPath(); c.arc(1, -45, 11, Math.PI, 0); c.closePath(); fs(c, cp, 2.5); rrPath(c, -10, -47, 22, 5, 2); fs(c, L.uCol2 || '#fff', 2); ell(c, 1, -57, 3.5, 3.5); fs(c, L.uCol2 || '#fff', 2); return true; }
  return false;
}

// 12 Uniform-Looks; je Stage + Stufe werden 6 davon (mit Stufen-Farben) zu Skins
const UNIFORM_LOOKS = [
  { uniform: 'schuerze', uCol: BRAND.olive, uCol2: BRAND.lime, cap: BRAND.lime, scarf: BRAND.olive },                     // Service
  { uniform: 'koch', uCol: '#ffffff', uCol2: BRAND.olive, cap: '#ffffff', scarf: '#ffffff', hat: 'toque' },                // Küche
  { uniform: 'weste', uCol: BRAND.ink, uCol2: '#ffd166', cap: BRAND.ink, scarf: '#e63946' },                             // Kellner
  { uniform: 'eis', uCol: '#ffffff', uCol2: '#ff8fab', cap: '#ff8fab', scarf: '#ffffff', hat: 'beret' },                 // Eis-Theke
  { uniform: 'latz', uCol: '#6a994e', uCol2: BRAND.copper, cap: '#f2e8cf', scarf: '#a7c957' },                           // Palmen-Gärtner
  { uniform: 'pulli', uCol: '#9d0208', uCol2: '#ffffff', cap: '#9d0208', scarf: '#ffffff', hat: 'muetze' },             // Chalet
  { uniform: 'schuerze', uCol: BRAND.copper, uCol2: BRAND.apricot, cap: BRAND.apricot, scarf: BRAND.copper },            // Barista
  { uniform: 'koch', uCol: BRAND.ink, uCol2: BRAND.lime, cap: BRAND.ink, scarf: BRAND.ink, hat: 'toque' },              // Chefkoch schwarz
  { uniform: 'eis', uCol: '#ffffff', uCol2: '#4dabf7', cap: '#4dabf7', scarf: '#ffffff', hat: 'beret' },                 // Limo-Stand
  { uniform: 'weste', uCol: BRAND.olive, uCol2: BRAND.lime, cap: BRAND.olive, scarf: BRAND.lime },                       // Original-Weste
  { uniform: 'pulli', uCol: BRAND.olive, uCol2: BRAND.apricot, cap: BRAND.olive, scarf: BRAND.apricot, hat: 'muetze' },  // Hüttenpulli
  { uniform: 'schuerze', uCol: '#ffffff', uCol2: BRAND.lime, cap: 'gold', scarf: BRAND.lime },                           // Festtags-Service
];
const UNIFORM_NAMES = ['Service-Schürze', 'Koch-Jacke', 'Kellner-Weste', 'Eis-Theke', 'Palmen-Gärtner', 'Chalet-Pulli', 'Barista', 'Chefkoch', 'Limo-Stand', 'Original-Weste', 'Hütten-Pulli', 'Festtags-Service'];
// Seltenheit: 4 normal, 1 selten, 1 legendär (mit Fähigkeit – nur bei 2 und 3 Sternen)
const ABILITIES = {
  detektor: { name: 'Metalldetektor', text: 'Ein Pfeil zeigt dir das nächste Versteck, und du findest Dinge schon aus größerer Entfernung.' },
  adlerauge: { name: 'Adlerauge', text: 'Verstecke in deiner Nähe leuchten golden auf.' },
  turbo: { name: 'Turbo-Schuhe', text: 'Du läufst viel schneller über den Spielplatz.' },
  extraherz: { name: 'Extra-Herz', text: 'In Geschicklichkeits-Aufgaben hast du 4 statt 3 Herzen.' },
  zeitplus: { name: 'Zeit-Uhr', text: 'In Geschicklichkeits-Aufgaben hast du 6 Sekunden mehr Zeit.' },
  glueck: { name: 'Glücksklee', text: 'Der Hilfe-Stern lädt sich schon nach 1 Minute statt nach 2,5 Minuten.' },
};
const ABIL_KEYS = Object.keys(ABILITIES);
const RARITY = { common: { name: 'Normal', col: '#e9ecef', w: 1 }, rare: { name: 'Selten', col: '#4dabf7', w: 0.6 }, legend: { name: 'Legendär', col: '#ffc300', w: 0.35 } };
SKIN_STAGES.forEach((stage, si) => ['easy', 'medium', 'hard'].forEach((diff, di) => stageSkins(stage, diff).forEach((id, i) => {
  const k = (i * 2 + di + si * 5) % UNIFORM_LOOKS.length;
  const rarity = i === 5 ? 'legend' : i === 4 ? 'rare' : 'common';
  const sk = Object.assign({}, UNIFORM_LOOKS[k], { name: UNIFORM_NAMES[k], rarity });
  if (rarity === 'rare') { sk.cap = '#4dabf7'; sk.sparkle = '#bde0fe'; }
  if (rarity === 'legend') { sk.cap = 'gold'; sk.sparkle = '#ffd60a'; sk.name = 'Gold-' + UNIFORM_NAMES[k]; if (diff !== 'easy') sk.ability = ABIL_KEYS[(si * 2 + di) % ABIL_KEYS.length]; }
  SKINS[id] = sk;
})));
// Laden-Skins: mit Talern kaufbar (je seltener, desto teurer; legendäre haben eine Fähigkeit)
const SHOP_SKINS = [
  ['shop_sport', 'Sport-Trikot', 'common', 60, { uniform: 'pulli', uCol: '#4dabf7', uCol2: '#ffffff', cap: '#4dabf7', scarf: '#ffffff', pat: 'stripes' }],
  ['shop_garten', 'Gärtner-Latzhose', 'common', 60, { uniform: 'latz', uCol: '#2d6a4f', uCol2: '#ffd166', cap: '#ffd166', scarf: '#2d6a4f', leaf: true }],
  ['shop_matrose', 'Matrosen-Look', 'common', 60, { uniform: 'weste', uCol: '#1d3557', uCol2: '#ffffff', cap: '#ffffff', scarf: '#e63946', pat: 'stripes' }],
  ['shop_pirat', 'Piraten-Look', 'rare', 150, { uniform: 'weste', uCol: '#212529', uCol2: '#e63946', cap: '#212529', scarf: '#e63946', dots: '#ffffff', sparkle: '#bde0fe' }],
  ['shop_astro', 'Astronauten-Anzug', 'rare', 150, { uniform: 'pulli', uCol: '#f8f9fa', uCol2: '#118ab2', cap: '#f8f9fa', scarf: '#118ab2', pat: 'stars', sparkle: '#bde0fe' }],
  ['shop_feuer', 'Feuerwehr-Look', 'rare', 150, { uniform: 'weste', uCol: '#d00000', uCol2: '#ffd166', cap: '#d00000', scarf: '#ffd166', sparkle: '#bde0fe' }],
  ['shop_regenbogen', 'Regenbogen-Look', 'legend', 400, { uniform: 'schuerze', uCol: '#ffffff', uCol2: '#9b5de5', cap: 'rainbow', scarf: 'rainbow', sparkle: '#ffd60a', ability: 'turbo' }],
  ['shop_goldchef', 'Goldener Chefkoch', 'legend', 400, { uniform: 'koch', uCol: '#ffffff', uCol2: '#c9a227', cap: 'gold', scarf: 'gold', hat: 'toque', sparkle: '#ffd60a', ability: 'glueck' }],
  ['shop_ninja', 'Nacht-Ninja', 'legend', 400, { uniform: 'pulli', uCol: '#212529', uCol2: '#7209b7', cap: '#212529', scarf: '#7209b7', pat: 'stars', sparkle: '#ffd60a', ability: 'adlerauge' }],
];
SHOP_SKINS.forEach(([id, name, rarity, price, look]) => { SKINS[id] = Object.assign({ name, rarity, price, shop: true }, look); });
// Ist eine Fähigkeit gerade aktiv? (angezogener legendärer Skin, nur Mittel/Schwer)
function ability(name) { const a = ACC(); if (!a || CUR_DIFF === 'easy') return false; const sk = SKINS[DP(CUR_DIFF).equip]; return !!(sk && sk.ability === name); }
// Standard-Look: grünes Helfer-Halstuch mit Blatt
DEFAULT_LOOK.cap = BRAND.lime; DEFAULT_LOOK.scarf = BRAND.lime; DEFAULT_LOOK.leaf = true;

// ---------- Restaurant-Deko für Karten ----------
function drawUmbrella(c, x, y, r, t = 0) {
  c.fillStyle = 'rgba(40,30,20,.18)'; ell(c, x + 10, y + 14, r, r * 0.55); c.fill();
  for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, (k / 8) * TAU, ((k + 1) / 8) * TAU); c.closePath(); c.fillStyle = k % 2 ? BRAND.cream : BRAND.olive; c.fill(); }
  ell(c, x, y, r, r); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke();
  ell(c, x, y, r * 0.32, r * 0.32); fs(c, '#fff', 1.5); leaf(c, x, y, r * 0.06);
}
function drawPotPalm(c, x, y, s = 1, t = 0) {
  c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, x, y + 2, 16 * s, 6 * s); c.fill();
  polyPath(c, [[x - 13 * s, y - 22 * s], [x + 13 * s, y - 22 * s], [x + 10 * s, y], [x - 10 * s, y]]); fs(c, BRAND.copper, 2.5);
  rrPath(c, x - 14 * s, y - 26 * s, 28 * s, 6 * s, 2); fs(c, '#b5652a', 2);
  c.beginPath(); c.moveTo(x, y - 24 * s); c.quadraticCurveTo(x + 4 * s, y - 50 * s, x + 2 * s, y - 70 * s); c.lineWidth = 7 * s; c.strokeStyle = OL; c.stroke(); c.lineWidth = 4.5 * s; c.strokeStyle = '#8d5a3b'; c.stroke();
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI / 2 + (k - 3) * 0.5 + Math.sin(t * 1.2 + k) * 0.04, ex = x + 2 * s + Math.cos(a) * 34 * s, ey = y - 70 * s + Math.sin(a) * 20 * s + 14 * s;
    c.beginPath(); c.moveTo(x + 2 * s, y - 70 * s); c.quadraticCurveTo(x + 2 * s + Math.cos(a) * 18 * s, y - 76 * s + Math.sin(a) * 14 * s, ex, ey);
    c.lineWidth = 8 * s; c.strokeStyle = OL; c.stroke(); c.lineWidth = 5 * s; c.strokeStyle = k % 2 ? '#52b788' : '#74c69d'; c.stroke();
  }
}
// Kreidetafel am Eingang: Logo-Farbe, Begrüßung, Leckereien
function drawChalkboard(c, x, y, t = 0) {
  c.fillStyle = 'rgba(0,0,0,.22)'; ell(c, x, y + 3, 34, 8); c.fill();
  line(c, x - 26, y, x - 18, y - 80, 5, '#8d5a3b'); line(c, x + 26, y, x + 18, y - 80, 5, '#8d5a3b');
  rrPath(c, x - 34, y - 96, 68, 62, 6); fs(c, '#8d5a3b', 3);
  rrPath(c, x - 29, y - 91, 58, 52, 4); fs(c, '#2f3a2c', 0);
  drawLogo(c, x, y - 80, 46, false);
  txt(c, 'Willkommen!', x, y - 64, 9, '#fff', 'center', null);
  drawFood(c, 'eisclown', x - 15, y - 49, 15); drawFood(c, 'flammkuchen', x + 1, y - 48, 15); drawFood(c, 'limo', x + 17, y - 49, 15);
}
// Kellner-Bär mit Tablett (Deko auf der Terrasse, ohne Auftrag)
function drawWaiter(c, x, y, s, t, dir, dish) {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  drawCritter(c, 'baer', 0, 0, s, t, { noShadow: false, waiter: true });
  c.restore();
  const tx = x + dir * 12 * s, ty = y - 30 * s - Math.abs(Math.sin(t * 8)) * 1.5;
  ell(c, tx, ty, 13 * s, 3.5 * s); fs(c, '#adb5bd', 2);
  drawFood(c, dish, tx, ty - 7 * s, 20 * s);
}
const FOOD_IDS = Object.keys(FOOD);
function drawAny(c, id, x, y, s, sil) { if (FOOD[id]) drawFood(c, id, x, y, s, sil); else drawItem(c, id, x, y, s, sil); }
