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
  ['hwskin_gespenst', 'Gespenst-Kostüm', 'legend', 45, { uniform: 'pulli', uCol: '#f8f9fa', uCol2: '#c8b6ff', cap: '#f8f9fa', scarf: '#c8b6ff', sparkle: '#e7f5ff', pat: 'stars' }, 'magnet'],
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
  shopEmpty: 'Kürbismünzen gibt es nur im Geisterwald: für jedes Bonbon, für jede Person, der du hilfst, und für das Kürbistor.',
};

if (HALLOWEEN) {
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
    if (this.stage !== 'geisterwald') {   // aus jedem Bereich erreichbar: Knopf unter der Karte
      const x = W - 46, y = 122, b = Math.sin(this.t * 2.4) * 1.5;
      roundBtn(c, x, y + b, 21, '#3c096c', null, () => { Sfx.play('tap'); overlay = new ConfirmDialog({ text: 'In den Geisterwald reisen? Dein Fortschritt hier bleibt gespeichert.', icon: 'play', onYes: () => { Sfx.play('win'); Save.write(); setScene(new Play(this.diff, { stage: 'geisterwald' })); } }); }, '#f77f00');
      jackO(c, x, y + b, 1.25, 0.6); txt(c, 'Geisterwald', x, y + 34, 11, '#ffd166', 'center', '#3c096c');
      return;
    }
    { const back = ((ACC() || {}).lastArea || {})[this.diff] || 'kueche', x = W - 46, y = 100;   // zurück in den Bereich, aus dem man kam
      roundBtn(c, x, y, 20, '#fff', 'back', () => { Sfx.play('tap'); overlay = new ConfirmDialog({ text: 'Zurück in den Bereich ' + STAGE_NAME[back] + '?', icon: 'play', onYes: () => { Save.write(); setScene(new Play(this.diff, { stage: back })); } }); });
      txt(c, 'Zurück', x, y + 32, 11, '#fff', 'center', '#3c096c'); }
    const s = String(hwKM()), w = 52 + s.length * 10, x = W - w - 14, y = 30;
    rrPath(c, x, y, w, 34, 17); c.fillStyle = 'rgba(30,15,45,.7)'; c.fill(); kmCoin(c, x + 20, y + 17, 1.15); txt(c, s, x + 38, y + 18, 17, '#ffd166', 'left', null);
  };
  if (Play.prototype.drawHud._src === undefined) Play.prototype.drawHud._src = hud0._src || hud0;

  // Bereichs-Übersicht: Knopf zum Geisterwald unten links
  const smap0 = StageMap.prototype.draw;
  StageMap.prototype.draw = function (c) {
    smap0.call(this, c);
    if (overlay) return;
    const x = W - 42, y = H - 128, b = Math.sin(this.t * 2.2) * 1.5;   // über dem Garderoben-Knopf, verdeckt nichts
    roundBtn(c, x, y + b, 22, '#3c096c', null, () => { Sfx.play('win'); setScene(new Play(this.diff, { stage: 'geisterwald' })); }, '#f77f00');
    jackO(c, x, y + b, 1.3, 0.6); txt(c, 'Geisterwald', x - 4, y + 36, 11, '#ffd166', 'center', '#3c096c');
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
    const land = W > H, bw = 180, bx = land ? W - bw - 14 : W / 2 - bw / 2, by = land ? 94 : H - 128, b = Math.sin(this.t * 2.2) * 2;
    rrPath(c, bx, by + b, bw, 40, 20); fs(c, '#3c096c', 3, '#f77f00'); jackO(c, bx + 22, by + 20 + b, 0.9, 0.6);
    txt(c, 'Geisterwald', bx + 42, by + 13 + b, 13, '#ffd166', 'left', null); kmCoin(c, bx + 50, by + 29 + b, 0.6); txt(c, hwKM() + ' Kürbismünzen', bx + 58, by + 30 + b, 11, '#fff', 'left', null);
    UI.btn(bx, by, bw, 40, () => { Sfx.play('tap'); overlay = new HwLauncher(); });
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
