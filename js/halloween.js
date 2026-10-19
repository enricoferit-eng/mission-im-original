// Halloween-Special: eigene Map "Geisterwald" mit eigener Währung (Kürbismünzen, gibt es nur dort), eigenen Fundsachen,
// Sammel-Bonbons und Aufgaben; dafür ein Kürbis-Laden mit Kostümen. Die normalen Bereiche bekommen nur Herbst-Deko,
// etwas Abendlicht und gruselige Musik.
// Probeversion: immer an. Vor dem Veröffentlichen auf den Zeitraum stellen (HW_FROM/HW_TO).
const HW_FORCE = true, HW_FROM = '10-24', HW_TO = '11-02';
const HALLOWEEN = (() => {
  const q = /[?&]halloween=([01])/.exec(location.search); if (q) return q[1] === '1';
  const md = new Date().toISOString().slice(5, 10); return HW_FORCE || (md >= HW_FROM && md <= HW_TO);
})();
// Kostüme im Kürbis-Laden (Preis in Kürbismünzen)
const HW_SKINS = [
  ['hwskin_vampir', 'Kleiner Vampir', 'rare', 20, { uniform: 'weste', uCol: '#212529', uCol2: '#c1121f', cap: '#212529', scarf: '#c1121f', sparkle: '#ff8fa3' }],
  ['hwskin_hexe', 'Hexen-Lehrling', 'rare', 20, { uniform: 'pulli', uCol: '#5a189a', uCol2: '#80ed99', cap: '#3c096c', scarf: '#80ed99', pat: 'stars', sparkle: '#c77dff' }],
  ['hwskin_kuerbis', 'Kürbis-Kopf', 'rare', 20, { uniform: 'latz', uCol: '#f77f00', uCol2: '#2b9348', cap: '#f77f00', scarf: '#2b9348', pat: 'stripes' }],
  ['hwskin_mumie', 'Mini-Mumie', 'rare', 25, { uniform: 'pulli', uCol: '#f1e3c8', uCol2: '#d4c4a8', cap: '#f1e3c8', scarf: '#d4c4a8', pat: 'stripes' }],
  ['hwskin_gespenst', 'Gespenst-Kostüm', 'legend', 45, { uniform: 'pulli', uCol: '#f8f9fa', uCol2: '#c8b6ff', cap: '#f8f9fa', scarf: '#c8b6ff', sparkle: '#e7f5ff', pat: 'stars', cape: '#e9ecef', aura: '#e7f5ff' }],   // Fähigkeiten gibt es jetzt als Upgrades
];
HW_SKINS.forEach(([id, name, rarity, price, look, ab]) => { SKINS[id] = Object.assign({ name, rarity, price, halloween: true, lvl: rarity === 'legend' ? 3 : 2 }, ab ? { ability: ab } : {}, look); });
function hwKM() { const m = META(); return m ? (m.km || 0) : 0; }
function hwAddKM(n, why) { const m = META(); if (!m || !n) return; m.km = (m.km || 0) + n; Save.write(); toast(why, '+' + n + ' Kürbismünzen', 'star'); }
// Kürbismünze: kleiner orangefarbener Taler mit Kürbisgesicht
function kmCoin(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); ell(c, 0, 0, 11, 11); fs(c, '#f77f00', 2, '#7f3b00'); ell(c, 0, 0, 7.5, 7.5); c.lineWidth = 1.2; c.strokeStyle = '#ffb703'; c.stroke(); c.fillStyle = '#5a2a00'; polyPath(c, [[-4.5, -1], [-1.5, -1], [-3, -4]]); c.fill(); polyPath(c, [[1.5, -1], [4.5, -1], [3, -4]]); c.fill(); polyPath(c, [[-4, 1.5], [-2, 3.5], [0, 1.5], [2, 3.5], [4, 1.5], [3, 5], [-3, 5]]); c.fill(); c.restore(); }

// Jack-o'-Lantern
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
function hwBats(c, t, n) {
  for (let i = 0; i < n; i++) {
    const x = ((t * (60 + i * 17) + i * 260) % (W + 200)) - 100, y = 70 + (i * 71) % Math.max(60, H * 0.35) + Math.sin(t * 3 + i) * 10, f = Math.sin(t * 14 + i * 3);
    c.save(); c.translate(x, y); c.fillStyle = '#1b1028';
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-8, -6 - f * 6, -18, -2 - f * 8); c.quadraticCurveTo(-12, 0, -10, 4); c.quadraticCurveTo(-5, 2, 0, 5);
    c.quadraticCurveTo(5, 2, 10, 4); c.quadraticCurveTo(12, 0, 18, -2 - f * 8); c.quadraticCurveTo(8, -6 - f * 6, 0, 0); c.fill();
    ell(c, 0, 1, 4, 5); c.fill(); c.restore();
  }
}

// Start-Fenster für den Geisterwald (aus dem Menü): Stufe wählen, Münzen sehen, Kürbis-Laden
class HwLauncher {
  constructor() { this.t = 0; Voice.say(HW_SAY.launch, true); }
  update(dt) { this.t += dt; }
  close() { if (overlay === this) overlay = null; Voice.stop(); }
  draw(c) {
    c.fillStyle = 'rgba(16,10,30,.7)'; c.fillRect(0, 0, W, H);
    const w = Math.min(W - 24, 520), h = Math.min(H - 24, 330), x = (W - w) / 2, y = (H - h) / 2;
    panel(c, x, y, w, h, '#2b1a4a', 24); hwBats(c, this.t, 2);
    roundBtn(c, x + w - 26, y + 26, 18, '#ced4da', 'cross', () => this.close());
    { const end = new Date(new Date().getFullYear(), 10, 2, 23, 59), days = Math.max(1, Math.ceil((end - Date.now()) / 864e5)); rrPath(c, x + w / 2 - 120, y - 16, 240, 30, 15); fs(c, '#ef476f', 3, '#fff'); txt(c, 'HALLOWEEN-EVENT · noch ' + days + (days === 1 ? ' Tag' : ' Tage'), x + w / 2, y - 1, 13, '#fff', 'center', null); }
    jackO(c, x + 44, y + 44, 1.6, 0.8); txt(c, 'Der Geisterwald', x + 76, y + 36, 22, '#ffd166', 'left', null);
    txt(c, 'Nur an Halloween: neue Leute, neue Sachen, neue Aufgaben', x + 76, y + 60, 12, '#e0c3fc', 'left', null);
    rrPath(c, x + 20, y + 84, w - 40, 54, 14); fs(c, 'rgba(255,255,255,.08)', 2, 'rgba(255,255,255,.25)');
    kmCoin(c, x + 46, y + 111, 1.5); txt(c, hwKM() + ' Kürbismünzen', x + 70, y + 104, 16, '#fff', 'left', null);
    txt(c, 'Gibt es nur im Geisterwald – für Kostüme im Kürbis-Laden', x + 70, y + 124, 11, '#e0c3fc', 'left', null);
    const D = [['easy', 'Leicht', '#f8d7b5'], ['medium', 'Mittel', '#d8f3b8'], ['hard', 'Schwer', '#e9b99a']], bw = (w - 60) / 3;
    D.forEach(([d, name, col], i) => { const bx = x + 20 + i * (bw + 10), by = y + 152; rrPath(c, bx, by, bw, 92, 16); fs(c, col, 3);
      drawAnimal(c, ANIMAL_OF[d], bx + bw / 2, by + 70, 0.75, { t: this.t + i, cap: hasCap(ANIMAL_OF[d]) }); if (typeof hwCostume === 'function') hwCostume(c, 'launch' + i, bx + bw / 2, by + 22, 0.75);
      txt(c, name, bx + bw / 2, by + 84, 14, '#3d2c1f', 'center', null);
      UI.btn(bx, by, bw, 92, () => { Sfx.play('win'); this.close(); setScene(new Play(d, { stage: 'geisterwald' })); }); });
    const sb = { x: x + w / 2 - 110, y: y + h - 64, w: 220, h: 44 };
    rrPath(c, sb.x, sb.y, sb.w, sb.h, 20); fs(c, '#f77f00', 3); jackO(c, sb.x + 30, sb.y + 22, 1.1, 0); txt(c, 'Kürbis-Laden', sb.x + 124, sb.y + 23, 16, '#fff', 'center', null);
    UI.btn(sb.x, sb.y, sb.w, sb.h, () => { this.close(); const s = new Shop(() => setScene(new Menu())); s.tab = 'hw'; setScene(s); });
  }
}
const HW_SAY = {
  launch: 'Willkommen im Geisterwald! Hier gibt es Kürbismünzen. Damit kaufst du Halloween-Kostüme im Kürbis-Laden.',
  hint: 'Halloween-Event! Der Geisterwald wartet auf dich. Tippe rechts auf den leuchtenden Kürbis.',
  shopEmpty: 'Kürbismünzen gibt es nur im Geisterwald: für jedes Bonbon, für jede Person, der du hilfst, und für das Kürbistor.',
};

if (HALLOWEEN) {
  // Bonus-Münzen in den Aufgaben: im Geisterwald sind es Kürbismünzen
  { const C0 = GAME_COIN, inWald = () => typeof scene !== 'undefined' && scene && scene.stage === 'geisterwald';
    GAME_COIN = { add(n) { if (inWald()) { const m = META(); if (m) { m.km = (m.km || 0) + n; Save.write(); } } else C0.add(n); },
      toast(n) { if (inWald()) toast('Kürbismünzen gesammelt', '+' + n + ' Kürbismünzen', 'star'); else C0.toast(n); },
      draw(c, x, y, r) { if (inWald()) kmCoin(c, x, y, r / 11); else C0.draw(c, x, y, r); } }; }
  // Sammel-Sachen im Geisterwald: leuchtende Bonbons
  COLLECT_NAME.geisterwald = 'Bonbons';
  const dc0 = drawCollect;
  drawCollect = function (c, stage, x, y, s, rot) {   // eslint-disable-line no-func-assign
    if (stage !== 'geisterwald') return dc0(c, stage, x, y, s, rot);
    c.save(); c.translate(x, y); c.rotate(rot * 0.5); drawItem(c, 'hw_bonbon', 0, 0, 17 * s); c.restore();
  };
  // Kürbismünzen verdienen (nur im Geisterwald): Bonbon +1, alle Bonbons +5, Person geholfen +5, Kürbistor +10
  const up0 = Play.prototype.update;
  Play.prototype.update = function (dt) {
    up0.call(this, dt);
    if (this.stage !== 'geisterwald' || this.mp || !this.st) return;
    const got = (this.st.leaves || []).filter(l => l.got).length, D = this.st.done || {}, kids = Object.keys(D).filter(k => k !== 'gate' && D[k]).length, gate = !!D.gate;
    if (this.hwSeen == null) { this.hwSeen = { got, kids, gate }; return; }
    if (got > this.hwSeen.got) { const all = got === this.st.leaves.length; hwAddKM(got - this.hwSeen.got + (all ? 5 : 0), all ? 'Alle Bonbons!' : 'Bonbon gefunden'); }
    if (kids > this.hwSeen.kids) hwAddKM(5 * (kids - this.hwSeen.kids), 'Geholfen!');
    if (gate && !this.hwSeen.gate) hwAddKM(10, 'Kürbistor geöffnet!');
    this.hwSeen = { got, kids, gate };
  };
  // Anzeige der Kürbismünzen oben rechts (im Geisterwald gibt es keine Weltkarte)
  const hud0 = Play.prototype.drawHud;
  Play.prototype.drawHud = function (c) {
    hud0.call(this, c);
    if (this.mp || this.helpOpen) return;
    if (this.stage === 'uebung') return;   // in der Helfer-Schule nicht ablenken
    if (this.stage !== 'geisterwald') {   // aus jedem Bereich erreichbar: Knopf unter der Karte
      const x = W - 50, y = 146, pu = 1 + Math.sin(this.t * 4) * 0.07, gl = 0.5 + 0.5 * Math.sin(this.t * 3);   // groß, leuchtend, nicht zu übersehen
      const go = () => { Sfx.play('tap'); overlay = new ConfirmDialog({ text: 'In den Geisterwald reisen? Dein Fortschritt hier bleibt gespeichert.', icon: 'play', onYes: () => { Sfx.play('win'); Save.write(); setScene(new Play(this.diff, { stage: 'geisterwald' })); } }); };
      ell(c, x, y, 40 * pu, 40 * pu); c.fillStyle = `rgba(255,150,30,${0.25 + gl * 0.25})`; c.fill();
      c.save(); c.translate(x, y); c.scale(pu, pu); ell(c, 0, 0, 27, 27); fs(c, '#3c096c', 3.5, '#f77f00'); jackO(c, 0, 1, 1.6, 0.8); c.restore();
      rrPath(c, x - 26, y - 40, 52, 16, 8); fs(c, '#ef476f', 2, '#fff'); txt(c, 'EVENT', x, y - 31, 10, '#fff', 'center', null);
      txt(c, 'Geisterwald', x, y + 40, 12, '#ffd166', 'center', '#3c096c');
      UI.btn(x - 34, y - 42, 68, 92, go);
      return;
    }
    { const back = ((ACC() || {}).lastArea || {})[this.diff] || 'kueche', x = W - 46, y = 100;   // zurück in den Bereich, aus dem man kam
      roundBtn(c, x, y, 20, '#fff', 'back', () => { Sfx.play('tap'); overlay = new ConfirmDialog({ text: 'Zurück in den Bereich ' + STAGE_NAME[back] + '?', icon: 'play', onYes: () => { Save.write(); setScene(new Play(this.diff, { stage: back })); } }); });
      txt(c, 'Zurück', x, y + 32, 11, '#fff', 'center', '#3c096c'); }
    const s = String(hwKM()), w = 52 + s.length * 10, x = W - w - 14, y = 30;
    rrPath(c, x, y, w, 34, 17); c.fillStyle = 'rgba(30,15,45,.7)'; c.fill(); kmCoin(c, x + 20, y + 17, 1.15); txt(c, s, x + 38, y + 18, 17, '#ffd166', 'left', null);
  };
  if (Play.prototype.drawHud._src === undefined) Play.prototype.drawHud._src = hud0._src || hud0;

  // Hinweis beim Betreten eines normalen Bereichs (einmal pro Sitzung)
  const upd1 = Play.prototype.update;
  Play.prototype.update = function (dt) {
    upd1.call(this, dt);
    if (!window.HW_HINTED && !this.mp && this.stage !== 'geisterwald' && this.stage !== 'uebung' && this.t > 2.5 && !overlay && scene === this) { window.HW_HINTED = true; this.banner = { text: HW_SAY.hint, t: 0 }; Voice.say(HW_SAY.hint, true); }
  };
  // Bereichs-Übersicht: der Geisterwald ist ein eigener Punkt am Ende des Wegs (immer offen)
  mapOrder = () => STAGE_ORDER.concat(['geisterwald']);   // eslint-disable-line no-func-assign
  STAGE_INFO.geisterwald = { name: 'Geisterwald', sub: 'Halloween-Event: Kürbismünzen & Kostüme' };
  const icon0 = stageIcon;
  stageIcon = function (c, id, x, y, s) { if (id === 'geisterwald') jackO(c, x, y + s * 0.05, s / 30, 0); else icon0(c, id, x, y, s); };   // eslint-disable-line no-func-assign
  const art0 = stageArt;
  stageArt = function (c, id, x, y, w, h, t) {   // eslint-disable-line no-func-assign
    if (id !== 'geisterwald') { art0(c, id, x, y, w, h, t); return; }
    c.save(); rrPath(c, x, y, w, h, 14); c.clip();
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2b1a4a'); g.addColorStop(0.7, '#7b3f72'); g.addColorStop(0.71, '#2f4526'); g.addColorStop(1, '#22341b'); c.fillStyle = g; c.fillRect(x, y, w, h);
    ell(c, x + w * 0.8, y + h * 0.25, h * 0.14, h * 0.14); c.fillStyle = '#fff3bf'; c.fill();
    for (const [fx, fh] of [[0.12, 0.62], [0.3, 0.5], [0.9, 0.58]]) { c.fillStyle = '#1b1028'; polyPath(c, [[x + w * fx - 9, y + h * 0.72], [x + w * fx, y + h * (0.72 - fh)], [x + w * fx + 9, y + h * 0.72]]); c.fill(); }
    jackO(c, x + w * 0.55, y + h * 0.7, h / 60, 1); jackO(c, x + w * 0.72, y + h * 0.8, h / 110, 0.7);
    c.restore();
  };
  const smap0 = StageMap.prototype.draw;
  StageMap.prototype.draw = function (c) {
    smap0.call(this, c);
    const ei = this.order.indexOf('geisterwald'), n = this.geo().nodes[ei]; if (!n) return;
    // Event-Punkt hervorheben: Leuchten + EVENT-Schild (in Kartenkoordinaten)
    const x = n.x - this.camX, sy = n.y - 78 + Math.sin(this.t * 3 + ei) * 3, gl = 0.5 + 0.5 * Math.sin(this.t * 3);
    if (x > -80 && x < W + 80) {
      ell(c, x, n.y + 2, 52 + gl * 6, 30 + gl * 4); c.lineWidth = 5; c.strokeStyle = `rgba(255,140,20,${0.45 + gl * 0.4})`; c.stroke();
      rrPath(c, x - 100, sy - 9, 56, 18, 9); fs(c, '#ef476f', 2, '#fff'); txt(c, 'EVENT', x - 72, sy + 1, 11, '#fff', 'center', null);   // links neben dem Schild (oben Bildrand, rechts Ton-Knopf)
    }
    if (overlay || this.cur === ei || this.walk) return;
    // Abkürzung unten rechts: läuft zum Event-Punkt
    const bx = W - 42, by = H - 128, b = Math.sin(this.t * 2.2) * 1.5;   // über dem Garderoben-Knopf, verdeckt nichts
    roundBtn(c, bx, by + b, 22, '#3c096c', null, () => this.goTo(ei), '#f77f00');
    jackO(c, bx, by + b, 1.3, 0.6); txt(c, 'Geisterwald', bx - 4, by + 36, 11, '#ffd166', 'center', '#3c096c');
  };
  // Weltkarte im Spiel: Geisterwald als eigene Insel rechts neben dem Gelände
  const wm0 = WorldMap.prototype.draw;
  WorldMap.prototype.draw = function (c) {
    wm0.call(this, c);
    if (overlay !== this) return;
    const T = terrainImage(), B = T.B, pad = 14, top = 62, aw = W - pad * 2 - 80, ah = H - top - pad, sc = Math.min(aw / (B.x1 - B.x0), ah / (B.y1 - B.y0));
    const mw = (B.x1 - B.x0) * sc, mx = (W - mw) / 2, free = W - (mx + mw + 6) - 12;
    const w = Math.min(170, Math.max(96, free - 12)), h = Math.min(150, ah - 20);
    const x = free >= 96 ? mx + mw + 6 + (free - w) / 2 + 6 : W - w - 12, y = top + (ah - h) / 2, here = this.play.stage === 'geisterwald', t = this.t;
    c.save(); ell(c, x + w / 2, y + h / 2, w * 0.62, h * 0.62); c.fillStyle = `rgba(255,140,20,${0.18 + 0.12 * Math.sin(t * 3)})`; c.fill(); c.restore();
    stageArt(c, 'geisterwald', x, y, w, h, t);
    rrPath(c, x, y, w, h, 14); c.lineWidth = here ? 4 : 3; c.strokeStyle = here ? '#ffd166' : '#f77f00'; c.stroke();
    rrPath(c, x + w / 2 - 30, y - 9, 60, 18, 9); fs(c, '#ef476f', 2, '#fff'); txt(c, 'EVENT', x + w / 2, y + 1, 11, '#fff', 'center', null);
    rrPath(c, x + 8, y + h - 28, w - 16, 22, 10); fs(c, here ? '#ffd166' : 'rgba(255,255,255,.95)', 1.5); txt(c, 'Geisterwald', x + w / 2, y + h - 16, 13, '#3c096c', 'center', null);
    kmCoin(c, x + 16, y + 18, 0.9); txt(c, String(hwKM()), x + 30, y + 19, 13, '#fff', 'left', '#3c096c');
    if (!here) UI.btn(x, y - 10, w, h + 10, () => { Sfx.play('tap'); const pl = this.play; overlay = new ConfirmDialog({ text: 'In den Geisterwald reisen? Dein Fortschritt hier bleibt gespeichert.', icon: 'play', onYes: () => { Sfx.play('win'); Save.write(); setScene(new Play(pl.diff, { stage: 'geisterwald' })); } }); });
  };
  // Menü: Nachthimmel mit Mond, Fledermäuse, Schild zum Geisterwald
  skyBg = function (c) {   // eslint-disable-line no-func-assign
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b1a4a'); g.addColorStop(0.5, '#7b3f72'); g.addColorStop(0.56, '#e07a3f'); g.addColorStop(0.561, '#4f6b3a'); g.addColorStop(1, '#2f4526');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    { const mx = W * 0.055, my = H * 0.47; ell(c, mx, my, 30, 30); c.fillStyle = '#fff3bf'; c.fill(); ell(c, mx + 11, my - 6, 26, 26); c.fillStyle = '#5b2f62'; c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 30; i++) c.fillRect((i * 137) % W, (i * 53) % (H * 0.45), 2, 2);
    const gy = H * 0.56;
    c.fillStyle = '#2b1a2f'; for (let x = 20; x < W; x += 120) { rrPath(c, x, gy - 34, 26, 36, 12); c.fill(); }
    c.strokeStyle = '#2b1a2f'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, gy - 14); c.lineTo(W, gy - 14); c.stroke();
    for (let x = 0; x < W; x += 16) { c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 24); c.stroke(); }
  };
  const menu0 = Menu.prototype.draw;
  Menu.prototype.draw = function (c) {
    menu0.call(this, c);
    hwBats(c, this.t, 3);
    const land = W > H, bw = land ? Math.min(300, W - 560) > 220 ? Math.min(300, W - 560) : 250 : Math.min(W - 40, 320), bh = 56, bx = land ? W - bw - 12 : W / 2 - bw / 2, by = land ? 88 : H - 150, b = Math.sin(this.t * 2.2) * 2, gl = 0.5 + 0.5 * Math.sin(this.t * 3);
    rrPath(c, bx - 5, by - 5 + b, bw + 10, bh + 10, 30); c.fillStyle = `rgba(255,140,20,${0.25 + gl * 0.3})`; c.fill();   // leuchtender Rand
    rrPath(c, bx, by + b, bw, bh, 26); { const g = c.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, '#5a189a'); g.addColorStop(1, '#f77f00'); fs(c, g, 3, '#ffd166'); }
    jackO(c, bx + 30, by + bh / 2 + b + Math.sin(this.t * 6) * 2, 1.5, 0.9);
    txt(c, 'HALLOWEEN-EVENT', bx + 58, by + 19 + b, 15, '#ffd166', 'left', '#3c096c');
    txt(c, 'Geisterwald – jetzt spielen ▶', bx + 58, by + 39 + b, 12, '#fff', 'left', null);
    kmCoin(c, bx + bw - 26, by + 18 + b, 0.7); txt(c, String(hwKM()), bx + bw - 26, by + 40 + b, 11, '#fff', 'center', null);
    UI.btn(bx - 5, by - 5, bw + 10, bh + 10, () => { Sfx.play('tap'); overlay = new HwLauncher(); });
    if (!window.HW_POPPED && this.t > 0.7 && !overlay) { window.HW_POPPED = true; overlay = new HwLauncher(); }   // einmal pro Sitzung von selbst aufpoppen
  };
}

// Kürbis-Laden (Reiter im Laden): Kostüme nur für Kürbismünzen
function hwShopDraw(shop, c, top, bottom) {
  const m = META(), n = HW_SKINS.length, gap = 12, cw = Math.min(150, (W - 40 - gap * (n - 1)) / n), ch = Math.min(bottom - top - 40, 200), x0 = (W - (cw * n + gap * (n - 1))) / 2, y = top + 30;
  rrPath(c, W / 2 - 150, top - 2, 300, 26, 13); c.fillStyle = 'rgba(60,20,90,.85)'; c.fill(); kmCoin(c, W / 2 - 128, top + 11, 0.8);
  txt(c, 'Du hast ' + hwKM() + ' Kürbismünzen', W / 2 + 8, top + 12, 13, '#ffd166', 'center', null);
  HW_SKINS.forEach(([id, name, rarity, price], i) => {
    const x = x0 + i * (cw + gap), own = m.skins.includes(id), sk = SKINS[id], bob = Math.sin(shop.t * 2 + i) * 2;
    rrPath(c, x, y + bob, cw, ch, 18); fs(c, own ? '#d8f5e3' : '#2b1a4a', 3.5, rarity === 'legend' ? '#c9a227' : OL);
    drawAnimal(c, ACC().char || 'cat', x + cw / 2, y + bob + ch - 66, Math.min(1.3, (ch - 80) / 80), { look: sk, cap: true, t: shop.t + i });
    txt(c, name, x + cw / 2, y + bob + ch - 50, 13, own ? '#3d2c1f' : '#fff', 'center', null);
    if (sk.ability) txt(c, ABILITIES[sk.ability].name, x + cw / 2, y + bob + ch - 33, 11, own ? '#6b5a48' : '#e0c3fc', 'center', null);
    if (own) txt(c, 'gekauft', x + cw / 2, y + bob + ch - 14, 13, '#2b9348', 'center', null);
    else { kmCoin(c, x + cw / 2 - 14, y + bob + ch - 14, 0.75); txt(c, String(price), x + cw / 2 + 8, y + bob + ch - 13, 15, '#ffd166', 'center', null); }
    UI.btn(x, y + bob, cw, ch, () => {
      if (own) { wearSkin(id); shop.say(name + ' hast du jetzt an!'); return; }
      if (hwKM() < price) { Sfx.play('bad'); overlay = new MsgDialog({ icon: 'star', text: HW_SAY.shopEmpty }); return; }
      m.km -= price; m.skins.push(id); wearSkin(id); Save.write(); Sfx.play('win'); FX.confetti(W / 2, H * 0.3, 40); shop.say(name + ' gekauft und gleich angezogen!');
    });
  });
}
