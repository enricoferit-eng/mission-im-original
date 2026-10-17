// Halloween-Special: Bonbons statt Sammel-Sachen, Abendstimmung mit Fledermäusen und Gespenstern,
// Bonbon-Jagd über alle 6 Bereiche (Belohnung: Gespenst-Kostüm), Halloween-Kostüme im Laden.
// Probeversion: immer an. Vor dem Veröffentlichen auf den Zeitraum stellen (HW_FROM/HW_TO).
const HW_FORCE = true, HW_FROM = '10-24', HW_TO = '11-02';
const HALLOWEEN = (() => {
  const q = /[?&]halloween=([01])/.exec(location.search); if (q) return q[1] === '1';
  const md = new Date().toISOString().slice(5, 10); return HW_FORCE || (md >= HW_FROM && md <= HW_TO);
})();
const HW_AREAS = ['kueche', 'gastraum', 'aussen', 'spielplatz', 'parkplatz', 'chalet'];
const HW_SKINS = [
  ['hwskin_vampir', 'Kleiner Vampir', 'rare', 90, { uniform: 'weste', uCol: '#212529', uCol2: '#c1121f', cap: '#212529', scarf: '#c1121f', sparkle: '#ff8fa3' }],
  ['hwskin_hexe', 'Hexen-Lehrling', 'rare', 90, { uniform: 'pulli', uCol: '#5a189a', uCol2: '#80ed99', cap: '#3c096c', scarf: '#80ed99', pat: 'stars', sparkle: '#c77dff' }],
  ['hwskin_kuerbis', 'Kürbis-Kopf', 'rare', 90, { uniform: 'latz', uCol: '#f77f00', uCol2: '#2b9348', cap: '#f77f00', scarf: '#2b9348', pat: 'stripes' }],
];
const HW_GHOST = ['hwskin_gespenst', 'Gespenst-Kostüm', 'legend', 0, { uniform: 'pulli', uCol: '#f8f9fa', uCol2: '#dee2e6', cap: '#f8f9fa', scarf: '#ced4da', sparkle: '#e7f5ff' }, 'magnet'];
HW_SKINS.forEach(([id, name, rarity, price, look]) => { SKINS[id] = Object.assign({ name, rarity, price, shop: true, lvl: 2 }, look); });
{ const [id, name, rarity, price, look, ab] = HW_GHOST; SKINS[id] = Object.assign({ name, rarity, price, exclusive: true, ability: ab, lvl: 3 }, look); }
function hwMeta() { const m = META(); if (!m) return null; m.hw = m.hw || { areas: [] }; return m.hw; }

// Jack-o'-Lantern (auch fürs Menü und den Zähler oben)
function jackO(c, x, y, s, glow = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (glow) { ell(c, 0, 0, 24, 22); c.fillStyle = `rgba(255,170,40,${0.22 * glow})`; c.fill(); }
  for (const [dx, rw] of [[-7, 9], [7, 9], [0, 11]]) { ell(c, dx, 0, rw, 12); fs(c, '#f77f00', 2.2); }
  rrPath(c, -2, -16, 4, 6, 1.5); fs(c, '#6b4423', 1.5);
  c.fillStyle = '#ffd60a'; c.strokeStyle = '#3d2c1f'; c.lineWidth = 1;
  polyPath(c, [[-7, -4], [-3, -4], [-5, -8]]); c.fill(); polyPath(c, [[3, -4], [7, -4], [5, -8]]); c.fill();
  polyPath(c, [[-7, 3], [-4, 6], [-1, 3], [2, 6], [5, 3], [7, 3], [4, 8], [-4, 8], [-8, 3]]); c.fill();
  c.restore();
}

if (HALLOWEEN) {
  // 1) Sammel-Sachen werden überall zu Bonbons
  for (const k of Object.keys(COLLECT_NAME)) COLLECT_NAME[k] = 'Bonbons';
  COLLECT_NAME.spielplatz = 'Bonbons';
  const origCollect = drawCollect;
  drawCollect = function (c, stage, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot * 0.5); drawItem(c, 'hw_bonbon', 0, 0, 17 * s); c.restore(); };   // Bonbons: nicht verwechselbar mit den Deko-Kürbissen   // eslint-disable-line no-func-assign

  // 2) Bonbon-Jagd: alle Bonbons eines Bereichs = Haken; alle 6 Bereiche = Gespenst-Kostüm
  const origLeaves = Play.prototype.updateLeaves;
  Play.prototype.updateLeaves = function () {
    const before = this.st.leaves.filter(o => o.got).length;
    origLeaves.call(this);
    const after = this.st.leaves.filter(o => o.got).length;
    if (this.mp || after === before || after !== this.st.leaves.length) return;
    const hw = hwMeta(); if (!hw || hw.areas.includes(this.stage)) return;
    hw.areas.push(this.stage); addCoins(15, 'Bonbon-Jagd');
    if (hw.areas.length >= HW_AREAS.length && !META().skins.includes(HW_GHOST[0])) {
      META().skins.push(HW_GHOST[0]);
      setTimeout(() => { FX.confetti(W / 2, H * 0.3, 90); Sfx.play('win'); this.banner = { text: 'Alle Bonbons in allen Bereichen! Du bekommst das Gespenst-Kostüm!', t: 0 }; }, 2200);
    } else setTimeout(() => { this.banner = { text: 'Bonbon-Jagd: ' + hw.areas.length + ' von 6 Bereichen geschafft!', t: 0 }; }, 2200);
    Save.write();
  };

  // 3) Gruselstimmung über der Spielwelt (unter der Anzeige oben): Abendlicht, Fledermäuse, kleine Gespenster
  var hwWorldFx = function (play, c, t) {
    const g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(60,20,90,0.06)'); g.addColorStop(1, 'rgba(40,10,70,0.42)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 3; i++) {   // Gespenster schweben am Rand
      const x = ((t * (14 + i * 5) + i * 330) % (W + 120)) - 60, y = 110 + i * (H - 200) / 3 + Math.sin(t * 1.4 + i * 2) * 14;
      c.save(); c.globalAlpha = 0.55; c.translate(x, y);
      c.beginPath(); c.moveTo(-14, 10); c.quadraticCurveTo(-16, -18, 0, -20); c.quadraticCurveTo(16, -18, 14, 10);
      for (let k = 0; k < 4; k++) c.quadraticCurveTo(14 - k * 7 - 3.5, 15 + (k % 2) * 3, 14 - (k + 1) * 7, 10);
      fs(c, '#fff', 2, 'rgba(61,44,31,.6)'); c.fillStyle = '#3d2c1f'; ell(c, -5, -6, 2.2, 3); c.fill(); ell(c, 5, -6, 2.2, 3); c.fill(); ell(c, 0, 2, 3, 3.5); c.fill(); c.restore();
    }
    hwBats(c, t, 4);
  };

  // 4) Menü: Nachthimmel mit Mond, Fledermäuse, Halloween-Schild mit Fortschritt
  const origSky = skyBg;
  skyBg = function (c) {   // eslint-disable-line no-func-assign
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b1a4a'); g.addColorStop(0.5, '#7b3f72'); g.addColorStop(0.56, '#e07a3f'); g.addColorStop(0.561, '#4f6b3a'); g.addColorStop(1, '#2f4526');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    { const mx = W * 0.055, my = H * 0.47; ell(c, mx, my, 30, 30); c.fillStyle = '#fff3bf'; c.fill(); ell(c, mx + 11, my - 6, 26, 26); c.fillStyle = '#5b2f62'; c.fill(); }   // Mond links neben den Karten
    c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 30; i++) c.fillRect((i * 137) % W, (i * 53) % (H * 0.45), 2, 2);
    const gy = H * 0.56;   // Grabstein-Zaun-Silhouette statt Glashaus
    c.fillStyle = '#2b1a2f'; for (let x = 20; x < W; x += 120) { rrPath(c, x, gy - 34, 26, 36, 12); c.fill(); }
    c.strokeStyle = '#2b1a2f'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, gy - 14); c.lineTo(W, gy - 14); c.stroke();
    for (let x = 0; x < W; x += 16) { c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 24); c.stroke(); }
  };
  const origMenuDraw = Menu.prototype.draw;
  Menu.prototype.draw = function (c) {
    origMenuDraw.call(this, c);
    hwBats(c, this.t, 3);
    const hw = hwMeta(), n = hw ? hw.areas.length : 0, land = W > H, bw = 172, bx = land ? W - bw - 14 : W / 2 - bw / 2, by = land ? 94 : H - 128;
    const b = Math.sin(this.t * 2.2) * 2;
    rrPath(c, bx, by + b, bw, 38, 19); fs(c, '#3c096c', 3, '#f77f00'); jackO(c, bx + 22, by + 19 + b, 0.85, 0.6);
    txt(c, 'Halloween-Special', bx + 42, by + 13 + b, 12, '#ffd166', 'left', null); txt(c, 'Bonbon-Jagd ' + n + '/6', bx + 42, by + 29 + b, 11, '#fff', 'left', null);
    UI.btn(bx, by, bw, 38, () => { overlay = new MsgDialog({ icon: 'star', text: n >= 6 ? 'Du hast alle Bonbons gefunden! Das Gespenst-Kostüm liegt in deiner Garderobe.' : 'Halloween-Special! In jedem Bereich liegen 8 leuchtende Bonbons. Sammle alle Bonbons in allen 6 Bereichen, dann bekommst du das Gespenst-Kostüm. Im Laden gibt es außerdem Halloween-Kostüme.' }); });
  };

  // 5) Laden: an Halloween ist das Tages-Angebot ein Halloween-Kostüm
  const origOffers = dailyOffers;
  dailyOffers = function () {   // eslint-disable-line no-func-assign
    const D = origOffers(), day = new Date().getDate(), s = HW_SKINS[day % HW_SKINS.length];
    D[0] = { id: s[0], price: s[3], ex: true, off: 0 }; return D;
  };
}
function hwBats(c, t, n) {
  for (let i = 0; i < n; i++) {
    const x = ((t * (60 + i * 17) + i * 260) % (W + 200)) - 100, y = 70 + (i * 71) % Math.max(60, H * 0.35) + Math.sin(t * 3 + i) * 10, f = Math.sin(t * 14 + i * 3);
    c.save(); c.translate(x, y); c.fillStyle = '#1b1028';
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-8, -6 - f * 6, -18, -2 - f * 8); c.quadraticCurveTo(-12, 0, -10, 4); c.quadraticCurveTo(-5, 2, 0, 5);
    c.quadraticCurveTo(5, 2, 10, 4); c.quadraticCurveTo(12, 0, 18, -2 - f * 8); c.quadraticCurveTo(8, -6 - f * 6, 0, 0); c.fill();
    ell(c, 0, 1, 4, 5); c.fill(); c.restore();
  }
}
