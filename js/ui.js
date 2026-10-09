'use strict';
// ---------- Menü, Stage-Karte, Shop, Stage-Abschluss, Start ----------
const DIFFS = [
  { id: 'easy', stars: 1, age: '6–8', col: '#f6d3a3' },
  { id: 'medium', stars: 2, age: '9–11', col: '#d5e8a6' },
  { id: 'hard', stars: 3, age: '12–14', col: '#e9bb93' },
];

function skyBg(c) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#7cc6e8'); g.addColorStop(0.55, '#c9ecf7'); g.addColorStop(0.56, '#8fbf6a'); g.addColorStop(1, '#5d8f45');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // Glashaus-Silhouette mit Palmen
  const gy = H * 0.56, gh = Math.min(140, H * 0.16);
  c.fillStyle = 'rgba(220,245,252,.75)'; c.fillRect(0, gy - gh, W, gh);
  c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 3;
  for (let x = 0; x < W; x += 46) { c.beginPath(); c.moveTo(x, gy - gh); c.lineTo(x, gy); c.stroke(); }
  c.beginPath(); c.moveTo(0, gy - gh / 2); c.lineTo(W, gy - gh / 2); c.stroke();
  for (let x = 40; x < W; x += 170) {
    c.strokeStyle = 'rgba(50,110,60,.6)'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, gy); c.quadraticCurveTo(x + 8, gy - gh * 0.5, x + 3, gy - gh * 0.85); c.stroke();
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.55; c.beginPath(); c.moveTo(x + 3, gy - gh * 0.85); c.quadraticCurveTo(x + 3 + Math.cos(a) * 26, gy - gh * 0.85 + Math.sin(a) * 26 - 8, x + 3 + Math.cos(a) * 44, gy - gh * 0.85 + Math.sin(a) * 44 + 8); c.lineWidth = 5; c.stroke(); }
  }
  c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(0, gy - gh - 6, W, 8);
}
// Titel: "Mission:" + das echte Im-Original-Logo
function logo(c, x, y, s) {
  txt(c, 'Mission:', x, y - 58 * s, 26 * s, '#fff', 'center', BRAND.olive);
  drawLogo(c, x, y + 10 * s, 250 * s, true);
}
// Leitsatz von Im Original als Band
function claimBand(c, text, x, y, size = 16, col = BRAND.olive) {
  c.font = `800 ${size}px ${FONT}`; const w = c.measureText(text).width + size * 2;
  rrPath(c, x - w / 2, y - size * 0.95, w, size * 1.9, size * 0.95); c.fillStyle = 'rgba(251,248,242,.93)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = col; c.stroke();
  leaf(c, x - w / 2 + size * 0.75, y, size * 0.075); leaf(c, x + w / 2 - size * 0.75, y, size * 0.075, BRAND.lime, Math.PI + 0.5);
  txt(c, text, x, y + 1, size, col, 'center', null);
}
function soundBtn(c, x, y) {
  const a = ACC(), on = !!(a && a.sound);
  roundBtn(c, x, y, 22, on ? '#d0ebff' : '#e9ecef', on ? 'sound' : 'mute', () => { if (!a) return; a.sound = !a.sound; Save.write(); if (a.sound) { Sfx.play('tap'); } else Voice.stop(); });
}
function topBar(c, back) {
  if (back) roundBtn(c, 44, 44, 28, '#fff', 'back', back, '#ffd166');
  soundBtn(c, W - 40, 44);
}
function totalSkins(a = ACC()) {
  let n = 0; if (!a) return 0;
  for (const d of ['easy', 'medium', 'hard']) { const st = (a.diff[d] && a.diff[d].stages) || {}; for (const k in st) n += st[k].skins.length; }
  return n;
}
const AVATARS = ['hase', 'fuchs', 'igel', 'waschbaer', 'eule', 'baer'];
function accountChip(c, x, y, a, onTap) {
  c.font = `900 18px ${FONT}`; const w = Math.max(120, c.measureText(a.name).width + 86);
  panel(c, x, y, w, 52, '#fff7e6', 26);
  ell(c, x + 26, y + 26, 20, 20); fs(c, '#d8f3dc', 2.5);
  drawCritter(c, AVATARS[a.avatar % 6], x + 26, y + 42, 0.62, 0, { noShadow: true });
  txt(c, a.name, x + 52, y + 19, 17, '#3d2c1f', 'left', null);
  icon(c, 'hanger', x + 60, y + 38, 16); txt(c, totalSkins(a) + '/108', x + 72, y + 39, 13, '#8d5a3b', 'left', null);
  ell(c, x + w - 14, y + 14, 5, 5); c.fillStyle = Net.status(a).col; c.fill();
  if (onTap) UI.btn(x, y, w, 52, onTap);
  return w;
}

class Menu {
  constructor() { this.t = 0; }
  enter() {
    FX.clear(); ensureProfile(); const a = ACC(); if (!a) { setScene(new Accounts()); return; }
    if (!a.soundV2) { a.sound = true; a.soundV2 = true; Save.write(); }
    if (!a.char) { setScene(new CharSelect(() => setScene(new Menu()))); return; }
  }
  update(dt) { this.t += dt; }
  draw(c) {
    skyBg(c);
    // schwebende Leckereien im Hintergrund
    for (let i = 0; i < 9; i++) { const sp = 18 + (i % 4) * 7, y = H + 40 - ((this.t * sp + i * 137) % (H + 120)), x = ((i * 211) % 100) / 100 * W + Math.sin(this.t * 0.8 + i) * 24; c.save(); c.globalAlpha = 0.55; c.translate(x, y); c.rotate(Math.sin(this.t + i) * 0.4); drawFood(c, FOOD_IDS[i % FOOD_IDS.length], 0, 0, 34 + (i % 3) * 8); c.restore(); }
    const a = ACC(); if (!a) return;
    const land = W > H, ls = land ? clamp(H / 560, 0.55, 1.2) : clamp(Math.min(W / 420, H / 760), 0.7, 1.4);
    const LY = land ? 70 * ls + 18 : Math.max(132, H * 0.15);
    logo(c, W / 2, LY, ls);
    claimBand(c, CLAIMS.urlaub, W / 2, LY + 76 * ls, 15 * Math.min(1.2, Math.max(0.8, ls)));
    accountChip.lastW = accountChip(c, 12, 14, a, () => { overlay = new AccountPanel(); });
    soundBtn(c, W - 40, 40);
    roundBtn(c, W - 92, 40, 22, '#fff', 'play', () => setScene(new Trailer()), '#ef476f');
    roundBtn(c, W - 144, 40, 22, '#ffd166', 'book', () => setScene(new Tutorial()));
    if (!(a.tut && a.tut.guide)) { const b = Math.sin(this.t * 4) * 3; rrPath(c, W - 214, 70 + b, 140, 30, 15); c.fillStyle = 'rgba(32,44,30,.9)'; c.fill(); polyPath(c, [[W - 150, 70 + b], [W - 144, 62 + b], [W - 138, 70 + b]]); c.fill(); txt(c, 'Anleitung als Video', W - 144, 85 + b, 13, '#fff', 'center', null); }
    const wide = W > H * 0.95;
    const top = LY + 102 * ls, bottom = H - (land ? 72 : 86);
    // Untere Leiste: Mehrspieler, Laden, Erfolge + Taler
    { const B = [['friends', 'Mehrspieler', '#bde0fe', () => setScene(new MultiScene())], ['shop', 'Laden', '#ffd6a5', () => setScene(new Shop())], ['trophy', 'Erfolge', '#fff3b0', () => setScene(new Achievements())]];
      const bw = Math.min(170, (W - 60) / 3), by = H - (land ? 38 : 46);
      B.forEach(([ic, label, col, fn], i) => { const x = W / 2 + (i - 1) * (bw + 10) - bw / 2; rrPath(c, x, by - 24, bw, 48, 20); fs(c, col, 3); icon(c, ic, x + 28, by, 30); txt(c, label, x + 52, by + 1, Math.min(16, bw / 9), '#3d2c1f', 'left', null); UI.btn(x, by - 24, bw, 48, fn); });
    }
    { const cw = accountChip.lastW || 0; coinChip(c, 12 + (cw || 170) + 10, 40); }
    DIFFS.forEach((d, i) => {
      let x, y, w, h;
      if (wide) { w = Math.min(240, (W - 80) / 3); h = Math.min(bottom - top, w * 1.35); x = W / 2 + (i - 1) * (w + 20) - w / 2; y = top + (bottom - top - h) / 2; }
      else { w = Math.min(W - 40, 400); h = Math.min(190, (bottom - top - 28) / 3); x = (W - w) / 2; y = top + i * (h + 14); }
      const bob = Math.sin(this.t * 2 + i) * 2;
      panel(c, x, y + bob, w, h, d.col, 24);
      CUR_DIFF = d.id; const kind = ANIMAL_OF[d.id], sp = SP(d.id, 'spielplatz');
      if (wide) {
        for (let s = 0; s < d.stars; s++) icon(c, 'star', x + w / 2 + (s - (d.stars - 1) / 2) * 40, y + bob + 36, 38);
        drawAnimal(c, kind, x + w / 2, y + bob + h * 0.8, Math.min(2.6, h / 110), { t: this.t + i, cap: hasCap(kind) });
        txt(c, d.age, x + w / 2, y + bob + h - 18, 16, '#fff');
      } else {
        drawAnimal(c, kind, x + h * 0.55, y + bob + h * 0.86, Math.min(2.4, h / 76), { t: this.t + i, cap: hasCap(kind) });
        const sx0 = x + h * 1.05, ss = Math.min(42, (w - h * 1.05 - 60) / 3);
        for (let s = 0; s < d.stars; s++) icon(c, 'star', sx0 + s * ss * 1.08, y + bob + h * 0.42, ss);
        txt(c, d.age, sx0 - ss / 2, y + bob + h * 0.78, 16, '#fff', 'left');
        icon(c, 'play', x + w - 26, y + bob + h / 2, 28, '#fff');
      }
      if (sp.clears > 0) icon(c, 'crown', x + w - 26, y + bob + 24, 30);
      UI.btn(x, y + bob, w, h, () => { Sfx.play('good'); const sp0 = SP(d.id, 'spielplatz'); setScene(!sp0.clears && !sp0.run ? new Play(d.id) : new StageMap(d.id)); });
    });
  }
}

// ---------- Zum Home-Bildschirm hinzufügen (Handy/Tablet im Browser) ----------
// Im Browser stören Adressleiste und Knöpfe – als App vom Home-Bildschirm läuft das Spiel im Vollbild.
let INSTALL_PROMPT = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); INSTALL_PROMPT = e; });
function isStandalone() { try { return matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } }
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
class InstallGuide {
  constructor(next) { this.next = next; this.t = 0; this.portraitOk = true; }
  enter() { FX.clear(); Voice.say('Bitte füge das Spiel zuerst zum Home-Bildschirm hinzu. Sonst stören die Leisten vom Browser, und das Spielerlebnis ist eingeschränkt.', true); }
  update(dt) { this.t += dt; if (isStandalone()) this.next(); }
  draw(c) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BRAND.olive); g.addColorStop(1, '#5a7a4a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const w = Math.min(W - 24, 620), land = W > H, h = land ? Math.min(H - 20, 400) : Math.min(H - 40, 620), x = (W - w) / 2, y = (H - h) / 2;
    fitBegin(c, w, h);
    panel(c, x, y, w, h, '#fbf8f2', 26);
    const narrow = w < 520, title = 'Zuerst: Spiel zum Home-Bildschirm hinzufügen';
    let hy;
    if (narrow) { drawLogo(c, x + w / 2, y + 34, 120, false); const T = wrapLines(c, title, w - 40, 18); T.forEach((l, i) => txt(c, l, x + w / 2, y + 74 + i * 22, 18, BRAND.olive, 'center', null)); hy = y + 74 + T.length * 22; }
    else { drawLogo(c, x + 80, y + 40, 120, false); txt(c, title, x + w / 2 + 50, y + 34, Math.min(19, w / 30), BRAND.olive, 'center', null); hy = y + 62; }
    const warn = 'Sonst stören die Leisten vom Browser und das Spielerlebnis ist eingeschränkt. Als App läuft es im Vollbild.';
    const WL = wrapLines(c, warn, w - 60, 14); WL.forEach((l, i) => txt(c, l, x + w / 2, hy + 8 + i * 18, 14, '#9d0208', 'center', null));
    const steps = IS_IOS
      ? [['share', 'Tippe unten (oder oben) auf „Teilen“'], ['plus', 'Wähle „Zum Home-Bildschirm“ (evtl. etwas nach unten wischen)'], ['ok', 'Tippe oben rechts auf „Hinzufügen“'], ['app', 'Starte das Spiel über das neue Symbol']]
      : [['dots', 'Tippe oben rechts auf ⋮ (die drei Punkte)'], ['plus', 'Wähle „Zum Startbildschirm hinzufügen“ oder „App installieren“'], ['ok', 'Bestätige mit „Hinzufügen“ / „Installieren“'], ['app', 'Starte das Spiel über das neue Symbol']];
    const sy = hy + 8 + WL.length * 18 + 4, rowH = (y + h - 86 - sy) / 4;
    steps.forEach(([ic, label], i) => {
      const yy = sy + i * rowH + rowH / 2, hl = Math.floor(this.t / 1.6) % 4 === i;
      rrPath(c, x + 18, yy - rowH / 2 + 3, w - 36, rowH - 6, 14); fs(c, hl ? '#e8f5d0' : '#fff', 2);
      ell(c, x + 42, yy, 14, 14); fs(c, BRAND.lime, 2.5); txt(c, String(i + 1), x + 42, yy + 1, 15, '#fff', 'center', null);
      this.stepIcon(c, ic, x + 82, yy, Math.min(30, rowH * 0.6));
      const L = wrapLines(c, label, w - 150, 15); L.forEach((l, k) => txt(c, l, x + 108, yy + (k - (L.length - 1) / 2) * 18, 15, '#3d2c1f', 'left', null));
    });
    const by = y + h - 44;
    if (INSTALL_PROMPT) {
      const pu = 1 + Math.sin(this.t * 5) * 0.04;
      c.save(); c.translate(x + w / 2 - 60, by); c.scale(pu, pu); rrPath(c, -120, -26, 240, 52, 20); fs(c, '#06d6a0', 3.5); txt(c, 'Jetzt hinzufügen', 0, 1, 19, '#fff', 'center', BRAND.ink); c.restore();
      UI.btn(x + w / 2 - 180, by - 26, 240, 52, async () => { const p = INSTALL_PROMPT; INSTALL_PROMPT = null; try { p.prompt(); await p.userChoice; } catch (e) { /* egal */ } });
    }
    const sx = INSTALL_PROMPT ? x + w - 110 : x + w / 2;
    rrPath(c, sx - 96, by - 20, 192, 40, 16); fs(c, '#e9ecef', 2.5); txt(c, 'Trotzdem im Browser spielen', sx, by + 1, 13, '#495057', 'center', null);
    UI.btn(sx - 96, by - 22, 192, 44, () => { Voice.stop(); this.next(); });
    c.restore();
  }
  stepIcon(c, ic, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s / 30, s / 30); c.lineCap = 'round'; c.lineJoin = 'round';
    if (ic === 'share') { rrPath(c, -10, -4, 20, 18, 3); c.lineWidth = 2.5; c.strokeStyle = '#118ab2'; c.stroke(); c.fillStyle = '#fbf8f2'; c.fillRect(-4, -6, 8, 4); line(c, 0, 4, 0, -14, 2.5, '#118ab2', false); polyPath(c, [[-6, -8], [0, -15], [6, -8]]); c.stroke(); }
    else if (ic === 'plus') { rrPath(c, -12, -12, 24, 24, 5); c.lineWidth = 2.5; c.strokeStyle = '#3d2c1f'; c.stroke(); line(c, 0, -6, 0, 6, 2.5, '#3d2c1f', false); line(c, -6, 0, 6, 0, 2.5, '#3d2c1f', false); }
    else if (ic === 'dots') { for (let i = 0; i < 3; i++) { ell(c, 0, -9 + i * 9, 3, 3); c.fillStyle = '#3d2c1f'; c.fill(); } }
    else if (ic === 'ok') icon(c, 'check', 0, 0, 28, '#06d6a0');
    else { rrPath(c, -13, -13, 26, 26, 6); fs(c, BRAND.olive, 2); ell(c, 0, 0, 10, 10); c.fillStyle = '#fbf8f2'; c.fill(); leaf(c, 0, 0, 1.1, BRAND.lime, -0.5); }
    c.restore();
  }
}
function needsInstallGuide() { return TOUCH && !isStandalone(); }
// Erster Start: sofort spielen – ein Spielstand auf diesem Gerät wird automatisch angelegt.
// Ein Konto (Name + Geheim-Code, auf dem Server) kann man später über „Spielstand sichern“ machen.
function ensureProfile() {
  if (ACC() || Object.keys(Save.data.accounts).length) return;
  createAccount(pick(NAME_A) + ' ' + pick(NAME_B), [0, 1, 2, 3].map(() => ri(0, 5)));
  ACC().guest = true; Save.write();
}
// ---------- Konten: jedes Kind hat sein eigenes (Fantasiename + Bilder-Code, keine E-Mail) ----------
const nameInput = document.createElement('input');
Object.assign(nameInput.style, { position: 'fixed', display: 'none', font: `900 22px ${FONT}`, textAlign: 'center', border: '4px solid #2b1d14', borderRadius: '16px', padding: '8px', background: '#fff', color: '#2b1d14', outline: 'none', zIndex: 5, boxSizing: 'border-box', touchAction: 'manipulation' });
nameInput.maxLength = 14; nameInput.autocomplete = 'off'; nameInput.spellcheck = false; nameInput.placeholder = 'Fantasiename';
document.body.appendChild(nameInput);
const passInput = document.createElement('input');
passInput.style.cssText = nameInput.style.cssText; passInput.type = 'password'; passInput.placeholder = 'Passwort'; passInput.autocomplete = 'off'; passInput.maxLength = 64;
document.body.appendChild(passInput);
function isAdmin(a = ACC()) { return !!(a && a.admin); }
const NAME_A = ['Flinke', 'Mutige', 'Schlaue', 'Wilde', 'Lustige', 'Schnelle', 'Kleine', 'Starke'];
const NAME_B = ['Rakete', 'Wolke', 'Pfote', 'Banane', 'Socke', 'Kugel', 'Brezel', 'Feder'];

class CodePad {
  // Bilder-Code aus 4 Symbolen statt Passwort-Tippen
  constructor(o) { this.o = o; this.code = []; this.t = 0; this.shake = 0; }
  update(dt) { this.t += dt; this.shake = Math.max(0, this.shake - dt); }
  close() { if (overlay === this) overlay = null; }
  draw(c) {
    c.fillStyle = 'rgba(16,28,18,.7)'; c.fillRect(0, 0, W, H);
    const w = Math.min(W - 24, 380), h = 470, x = (W - w) / 2, y = (H - h) / 2, sx = shakeX(this.shake);
    fitBegin(c, w, h);
    panel(c, x + sx, y, w, h, '#fff7e6', 26);
    if (this.o.acc) { ell(c, W / 2, y + 46, 30, 30); fs(c, '#d8f3dc', 3); drawCritter(c, AVATARS[this.o.acc.avatar % 6], W / 2, y + 70, 0.95, this.t, { noShadow: true }); txt(c, this.o.acc.name, W / 2, y + 96, 18, '#3d2c1f', 'center', null); }
    else { icon(c, 'lock', W / 2, y + 50, 46); txt(c, 'Dein Geheim-Code', W / 2, y + 92, 18, '#3d2c1f', 'center', null); }
    for (let i = 0; i < 4; i++) { const cx = W / 2 + (i - 1.5) * 62 + sx, cy = y + 150; rrPath(c, cx - 26, cy - 26, 52, 52, 12); fs(c, '#fff', 3); if (this.code[i] !== undefined) drawSym(c, this.code[i], cx, cy, 17); }
    for (let k = 0; k < 6; k++) {
      const cx = W / 2 + ((k % 3) - 1) * 92, cy = y + 238 + Math.floor(k / 3) * 88;
      ell(c, cx, cy, 36, 36); fs(c, '#fff', 4); drawSym(c, k, cx, cy, 20);
      UI.btn(cx - 40, cy - 40, 80, 80, () => this.add(k));
    }
    roundBtn(c, x + 46, y + h - 44, 26, '#ced4da', 'cross', () => { this.close(); if (this.o.onCancel) this.o.onCancel(); });
    roundBtn(c, x + w - 46, y + h - 44, 26, '#ffd166', 'back', () => { this.code.pop(); }, '#fff');
    c.restore();
  }
  add(k) {
    if (this.code.length >= 4) return;
    this.code.push(k); Sfx.play('tap');
    if (this.code.length === 4) setTimeout(() => {
      if (overlay !== this) return;
      if (this.o.check && !this.o.check(this.code)) { this.shake = 0.5; buzz(120); Sfx.play('bad'); this.code = []; return; }
      this.close(); this.o.onDone(this.code.slice());
    }, 250);
  }
  down() {} move() {} up() {}
}

// Konto-Kärtchen auf dem Gerät (zuletzt benutzte Konten)
class Accounts {
  constructor() { this.t = 0; }
  enter() { FX.clear(); nameInput.style.display = 'none'; }
  update(dt) { this.t += dt; }
  draw(c) {
    skyBg(c);
    const ls = clamp(Math.min(W / 420, H / 760), 0.7, 1.3);
    logo(c, W / 2, 100 * ls, ls);
    claimBand(c, 'Willkommen im Original!', W / 2, 172 * ls, 14);
    const list = Object.entries(Save.data.accounts).sort((a, b) => b[1].created - a[1].created);
    const cols = W > 600 ? 3 : 2, cw = Math.min(170, (W - 40) / cols - 12), ch = 150;
    const all = list.concat([['new', null], ['login', null]]);
    const x0 = W / 2 - (cols * (cw + 12) - 12) / 2, y0 = 205 * ls;
    all.forEach(([id, a], i) => {
      const x = x0 + (i % cols) * (cw + 12), y = y0 + Math.floor(i / cols) * (ch + 12);
      if (y > H - 40) return;
      panel(c, x, y, cw, ch, a ? '#fff7e6' : id === 'new' ? '#caffbf' : '#bde0fe', 22);
      if (a) {
        ell(c, x + cw / 2, y + 52, 36, 36); fs(c, '#d8f3dc', 3);
        drawCritter(c, AVATARS[a.avatar % 6], x + cw / 2, y + 82, 1.1, this.t + i, { noShadow: true });
        txt(c, a.name, x + cw / 2, y + 112, 17, '#3d2c1f', 'center', null);
        icon(c, 'hanger', x + cw / 2 - 22, y + 134, 16); txt(c, totalSkins(a) + '/108', x + cw / 2 + 8, y + 135, 14, '#8d5a3b', 'center', null);
        if (a.admin) UI.btn(x, y, cw, ch, () => { if (a.device) { Save.data.current = id; Save.write(false); Sfx.play('win'); setScene(new Menu()); } else setScene(new LoginScene('admin')); });
        else UI.btn(x, y, cw, ch, () => { Save.data.current = id; Save.write(); Sfx.play('win'); Net.refresh(); setScene(new Menu()); });   // Gerät ist gemerkt: kein Code nötig
        roundBtn(c, x + cw - 18, y + 18, 15, '#fff', 'trash', () => askDelete(id, a));
      } else if (id === 'new') {
        txt(c, '+', x + cw / 2, y + ch / 2 - 16, 64, '#fff');
        txt(c, 'Neues Konto', x + cw / 2, y + ch - 30, 16, '#2d6a4f', 'center', null);
        UI.btn(x, y, cw, ch, () => setScene(new NewAccount()));
        if (!list.length) drawHand(c, x + cw / 2 + 10, y + ch / 2 + 30 + Math.abs(Math.sin(this.t * 4)) * 10, 1.5);
      } else {
        icon(c, 'lock', x + cw / 2, y + ch / 2 - 18, 46);
        txt(c, 'Ich habe schon', x + cw / 2, y + ch - 46, 15, '#1d4e89', 'center', null);
        txt(c, 'ein Konto', x + cw / 2, y + ch - 26, 15, '#1d4e89', 'center', null);
        UI.btn(x, y, cw, ch, () => setScene(new LoginScene()));
      }
    });
  }
}
// Konto löschen: Geheim-Code, nochmal bestätigen, dann auch auf dem Server löschen
function askDelete(id, a) {
  overlay = new CodePad({ acc: a, check: code => code.join() === a.code.join(), onDone: () => {
    overlay = new ConfirmDialog({ text: 'Konto „' + a.name + '“ wirklich löschen? Alle Skins und der ganze Fortschritt sind dann für immer weg – auch auf anderen Geräten.', onYes: async () => {
      if (a.token) {
        overlay = new MsgDialog({ text: 'Konto wird gelöscht …', wait: true });
        const r = await Net.call({ action: 'delete', login: a.login, token: a.token });
        if (!r || (r.status !== 200 && r.status !== 401)) { overlay = new MsgDialog({ text: 'Keine Verbindung zum Server. Das Konto wurde nicht gelöscht. Bitte später nochmal versuchen.' }); return; }
      }
      delete Save.data.accounts[id]; if (Save.data.current === id) Save.data.current = null; Save.write(); Sfx.play('bad');
      if (!(scene instanceof Accounts)) setScene(new Accounts());
      overlay = new MsgDialog({ text: 'Das Konto wurde gelöscht.' });
    } });
  } });
}

class ConfirmDialog {
  constructor(o) { this.o = o; this.t = 0; }
  update(dt) { this.t += dt; }
  close() { if (overlay === this) overlay = null; Voice.stop(); }
  draw(c) {
    Voice.once(this.o.text);
    const lines = wrapLines(c, this.o.text, Math.min(W - 30, 380) - 48, 18);
    const w = Math.min(W - 30, 380), h = 150 + lines.length * 25, x = (W - w) / 2, y = (H - h) / 2;
    c.fillStyle = 'rgba(16,28,18,.7)'; c.fillRect(0, 0, W, H);
    fitBegin(c, w, h + 40);
    panel(c, x, y, w, h, '#fff7e6', 24);
    icon(c, 'trash', W / 2, y + 40, 40);
    lines.forEach((l, i) => txt(c, l, W / 2, y + 86 + i * 25, 18, '#3d2c1f', 'center', null));
    roundBtn(c, W / 2 - 60, y + h - 10, 28, '#ced4da', 'cross', () => this.close());
    roundBtn(c, W / 2 + 60, y + h - 10, 28, '#ef476f', 'check', () => { this.close(); this.o.onYes(); });
    c.restore();
  }
  down() {} move() {} up() {}
}
class MsgDialog {
  constructor(o) { this.o = o; this.t = 0; }
  update(dt) { this.t += dt; }
  close() { if (overlay === this) overlay = null; Voice.stop(); if (this.o.onClose) this.o.onClose(); }
  draw(c) {
    Voice.once(this.o.text);
    const lines = wrapLines(c, this.o.text, Math.min(W - 30, 380) - 48, 18);
    const w = Math.min(W - 30, 380), h = 90 + lines.length * 25, x = (W - w) / 2, y = (H - h) / 2;
    c.fillStyle = 'rgba(16,28,18,.6)'; c.fillRect(0, 0, W, H);
    fitBegin(c, w, h + 40);
    panel(c, x, y, w, h, '#fff7e6', 24);
    lines.forEach((l, i) => txt(c, l, W / 2, y + 40 + i * 25, 18, '#3d2c1f', 'center', null));
    if (this.o.wait) { for (let i = 0; i < 3; i++) { ell(c, W / 2 + (i - 1) * 22, y + h - 28, 6, 6); c.fillStyle = `rgba(17,138,178,${0.3 + 0.7 * Math.max(0, Math.sin(this.t * 6 - i))})`; c.fill(); } }
    else roundBtn(c, W / 2, y + h - 6, 26, '#06d6a0', 'check', () => this.close());
    c.restore();
    UI.btn(0, 0, W, H, () => {}); UI.next.push(UI.next.splice(UI.next.length - 2, 1)[0]);
  }
  down() {} move() {} up() {}
}

// Konto-Seite: Login-Code anzeigen, Geheim-Code anzeigen, abmelden, löschen
class AccountPanel {
  constructor() { this.t = 0; this.showCode = false; }
  update(dt) { this.t += dt; }
  close() { if (overlay === this) overlay = null; }
  draw(c) {
    const a = ACC(); if (!a) { this.close(); return; }
    const w = Math.min(W - 24, 400), h = 470, x = (W - w) / 2, y = (H - h) / 2;
    c.fillStyle = 'rgba(16,28,18,.7)'; c.fillRect(0, 0, W, H);
    fitBegin(c, w, h);
    panel(c, x, y, w, h, '#fff7e6', 26);
    roundBtn(c, x + w - 30, y + 30, 22, '#ced4da', 'cross', () => this.close());
    rrPath(c, x + 14, y + 14, 112, 36, 14); fs(c, '#caffbf', 2.5); drawAnimal(c, a.char || 'cat', x + 34, y + 46, 0.55, { noShadow: true }); txt(c, 'Figur ändern', x + 50, y + 33, 12, BRAND.olive, 'left', null);
    UI.btn(x + 14, y + 14, 112, 36, () => { this.close(); setScene(new CharSelect(() => setScene(new Menu()))); });
    ell(c, W / 2, y + 62, 42, 42); fs(c, '#d8f3dc', 3); drawCritter(c, AVATARS[a.avatar % 6], W / 2, y + 100, 1.35, this.t, { noShadow: true });
    txt(c, a.name, W / 2, y + 132, 22, '#3d2c1f', 'center', null);
    const st = Net.status(a); ell(c, W / 2 - 70, y + 160, 6, 6); c.fillStyle = st.col; c.fill(); txt(c, st.text, W / 2 - 58, y + 161, 13, '#8d5a3b', 'left', null);
    if (a.admin) {
      rrPath(c, W / 2 - 130, y + 195, 260, 60, 20); fs(c, '#ffd166', 3.5); txt(c, 'Admin: Statistik & Test', W / 2, y + 225, 18, '#3d2c1f', 'center', null);
      UI.btn(W / 2 - 130, y + 195, 260, 60, () => { this.close(); overlay = new AdminPanel(); });
    } else if (!a.token) {
      const pu = 1 + Math.sin(this.t * 5) * 0.04;
      c.save(); c.translate(W / 2, y + 225); c.scale(pu, pu); rrPath(c, -130, -30, 260, 60, 20); fs(c, '#06d6a0', 3.5); txt(c, 'Spielstand sichern', 0, -6, 19, '#fff', 'center', BRAND.ink); txt(c, 'mit Namen + Geheim-Code', 0, 15, 12, '#fff', 'center', null); c.restore();
      UI.btn(W / 2 - 130, y + 195, 260, 60, () => { this.close(); setScene(new NewAccount({ migrate: Save.data.current })); });
    } else {
      txt(c, 'Dein Login-Code:', W / 2, y + 196, 15, '#8d5a3b', 'center', null);
      rrPath(c, W / 2 - 110, y + 210, 220, 44, 12); fs(c, '#fff', 3); txt(c, a.login || '–', W / 2, y + 233, 24, '#118ab2', 'center', null);
    }
    txt(c, 'Dein Geheim-Code:', W / 2, y + 282, 15, '#8d5a3b', 'center', null);
    if (this.showCode) a.code.forEach((k, i) => { const cx = W / 2 + (i - 1.5) * 56; rrPath(c, cx - 23, y + 296, 46, 46, 12); fs(c, '#fff', 3); drawSym(c, k, cx, y + 319, 15); });
    else { rrPath(c, W / 2 - 110, y + 296, 220, 46, 12); fs(c, '#e9ecef', 3); txt(c, 'antippen zum Zeigen', W / 2, y + 320, 15, '#495057', 'center', null); UI.btn(W / 2 - 110, y + 296, 220, 46, () => { this.showCode = true; }); }
    const by = y + h - 56;
    rrPath(c, x + 20, by - 26, w / 2 - 30, 52, 18); fs(c, '#ffd166', 3); txt(c, 'Abmelden', x + 20 + (w / 2 - 30) / 2, by, 17, '#3d2c1f', 'center', null);
    UI.btn(x + 20, by - 26, w / 2 - 30, 52, () => { Net.syncNow(); Save.data.current = null; Save.write(); this.close(); setScene(new Accounts()); });
    rrPath(c, x + w / 2 + 10, by - 26, w / 2 - 30, 52, 18); fs(c, '#ffc8c8', 3); txt(c, 'Konto löschen', x + w / 2 + 10 + (w / 2 - 30) / 2, by, 17, '#9d0208', 'center', null);
    UI.btn(x + w / 2 + 10, by - 26, w / 2 - 30, 52, () => askDelete(Save.data.current, a));
    c.restore();
  }
  down() {} move() {} up() {}
}

// ---------- Admin im Spiel: Statistik (vom Server) + Test-Werkzeuge ----------
let ADMIN_STATS = null;
class AdminPanel {
  constructor() { this.t = 0; this.busy = false; this.msg = ''; if (!ADMIN_STATS) this.load(); }
  async load() {
    const a = Save.data.accounts.admin; if (!a || !a.device) { this.msg = 'Bitte einmal neu als Admin anmelden.'; return; }
    this.busy = true; const r = await Net.call({ action: 'admin', device: a.device }); this.busy = false;
    if (r && r.status === 200) { ADMIN_STATS = r.data; this.msg = ''; }
    else if (r && r.status === 401) { delete a.device; Save.write(false); this.msg = 'Passwort wurde geändert – bitte neu anmelden.'; }
    else this.msg = 'Keine Verbindung zum Server.';
  }
  update(dt) { this.t += dt; }
  close() { if (overlay === this) overlay = null; }
  draw(c) {
    c.fillStyle = 'rgba(16,28,18,.75)'; c.fillRect(0, 0, W, H);
    const w = Math.min(W - 24, 640), h = 400, x = (W - w) / 2, y = (H - h) / 2;
    fitBegin(c, w, h);
    panel(c, x, y, w, h, '#fff7e6', 26);
    roundBtn(c, x + w - 30, y + 30, 22, '#ced4da', 'cross', () => this.close());
    txt(c, 'Admin', x + 26, y + 32, 22, BRAND.olive, 'left', null);
    const S = ADMIN_STATS;
    if (S) {
      const box = (i, label, v) => { const bw = (w - 60) / 5, bx = x + 20 + i * (bw + 5); rrPath(c, bx, y + 58, bw, 64, 14); fs(c, '#fff', 2.5); txt(c, String(v), bx + bw / 2, y + 82, 24, '#118ab2', 'center', null); txt(c, label, bx + bw / 2, y + 108, 11, '#6b5a48', 'center', null); };
      box(0, 'Konten', S.accounts); box(1, 'neu (7 Tage)', S.new7); box(2, 'aktiv (7 Tage)', S.active7); box(3, 'aktiv (30 Tage)', S.active30); box(4, 'Skins gesamt', S.skins);
      const cols = ['Stufe', 'Spieler', 'geschafft', 'Bereiche', 'Aufträge', 'Skins'], cx = [x + 24, x + w * 0.36, x + w * 0.5, x + w * 0.64, x + w * 0.77, x + w * 0.9];
      cols.forEach((t2, i) => txt(c, t2, cx[i], y + 146, 13, '#8d5a3b', i ? 'center' : 'left', null));
      [['easy', '1 Stern'], ['medium', '2 Sterne'], ['hard', '3 Sterne']].forEach(([k, label], r) => {
        const p = S.perDiff[k], yy = y + 172 + r * 28; [label, p.players, p.playersCleared, p.stageClears, p.questsDone, p.skins].forEach((v, i) => txt(c, String(v), cx[i], yy, 15, '#3d2c1f', i ? 'center' : 'left', null));
      });
      txt(c, 'Stand: ' + new Date(S.generated).toLocaleString('de-DE'), x + 24, y + 262, 12, '#8d5a3b', 'left', null);
    } else txt(c, this.busy ? 'Lade Statistik …' : (this.msg || 'Statistik nicht geladen.'), W / 2, y + 120, 15, '#6b5a48', 'center', null);
    if (this.msg && S) txt(c, this.msg, W / 2, y + 282, 13, '#c1121f', 'center', null);
    // Test-Werkzeuge
    const bt = (i, label, col, fn) => { const bw = (w - 60) / 3, bx = x + 20 + i * (bw + 10), by = y + h - 92; rrPath(c, bx, by, bw, 52, 16); fs(c, col, 3); txt(c, label, bx + bw / 2, by + 27, Math.min(15, bw / 12.5), '#3d2c1f', 'center', null); UI.btn(bx, by, bw, 52, fn); };
    bt(0, this.busy ? 'lädt …' : 'Statistik neu laden', '#bde0fe', () => { if (!this.busy) this.load(); });
    bt(1, 'Alle Skins freischalten', '#caffbf', () => { ['easy', 'medium', 'hard'].forEach(d => { const sp = SP(d, 'spielplatz'); sp.skins = stageSkins('spielplatz', d).slice(); }); Save.write(); Sfx.play('win'); this.msg = 'Alle 18 Spielplatz-Skins freigeschaltet.'; });
    bt(2, 'Durchgänge zurücksetzen', '#ffd6a5', () => { ['easy', 'medium', 'hard'].forEach(d => { SP(d, 'spielplatz').run = null; }); Save.write(); Sfx.play('good'); this.msg = 'Alle Durchgänge stehen wieder am Anfang.'; });
    txt(c, 'Als Admin hast du im Spiel unbegrenzt Joker zum Testen.', W / 2, y + h - 22, 12, '#6b5a48', 'center', null);
    c.restore();
  }
  down() {} move() {} up() {}
}

// Anmelden mit bestehendem Konto: Name + Geheim-Code ODER Login-Code
class LoginScene {
  constructor(mode) { this.t = 0; this.mode = 'choose'; this.err = ''; this.busy = false; this.start = mode; }
  enter() { FX.clear(); nameInput.value = ''; passInput.value = ''; if (this.start) this.setMode(this.start); }
  update(dt) { this.t += dt; }
  leave(to) { nameInput.style.display = 'none'; nameInput.blur(); passInput.style.display = 'none'; passInput.blur(); setScene(to); }
  async adminLogin() {
    const user = nameInput.value.trim(), pass = passInput.value; nameInput.blur(); passInput.blur(); this.busy = true;
    const r = await Net.call({ action: 'admin', user, pass }); this.busy = false;
    if (r && r.status === 200) {
      ADMIN_STATS = r.data;
      if (!Save.data.accounts.admin) Save.data.accounts.admin = { name: 'Admin', admin: true, code: [0, 0, 0, 0], login: 'ADMIN', avatar: 5, created: Date.now(), sound: true, soundV2: true, char: 'lion', tut: { guide: true, coach: true }, recent: [], recentEasy: [], diff: { easy: {}, medium: {}, hard: {} } };
      Save.data.accounts.admin.device = r.data.device;   // Gerät merken (kein Passwort gespeichert)
      Save.data.current = 'admin'; Save.write(false); Sfx.play('win'); passInput.value = ''; this.leave(new Menu()); setTimeout(() => { overlay = new AdminPanel(); }, 50); return;
    }
    this.err = !r ? 'Keine Verbindung zum Server.' : 'Benutzer oder Passwort stimmt nicht.'; Sfx.play('bad');
  }
  setMode(m) { this.mode = m; this.err = ''; nameInput.value = ''; nameInput.placeholder = m === 'code' ? 'z. B. K7P2-9QXA' : 'Dein Fantasiename'; nameInput.maxLength = m === 'code' ? 9 : 14; }
  async done(r) {
    this.busy = false;
    if (r && r.status === 200) { adoptAccount(r.data); Sfx.play('win'); this.leave(new Menu()); return; }
    const e = r && r.data && r.data.error;
    this.err = !r ? 'Keine Verbindung zum Server. Bitte Internet prüfen.' : e === 'not_found' ? (this.mode === 'code' ? 'Diesen Login-Code gibt es nicht.' : 'Ein Konto mit diesem Namen gibt es nicht.') : e === 'wrong_code' ? 'Der Geheim-Code stimmt nicht.' : e === 'locked' ? 'Zu oft falsch. Bitte in ' + r.data.wait + ' Minuten nochmal versuchen.' : 'Das hat nicht geklappt. Bitte nochmal versuchen.';
    Sfx.play('bad');
  }
  draw(c) {
    skyBg(c);
    roundBtn(c, 44, 44, 28, '#fff', 'back', () => (this.mode === 'choose' ? this.leave(new Accounts()) : (passInput.style.display = 'none', this.setMode('choose'))), '#ffd166');
    const w = Math.min(W - 28, 420), x = (W - w) / 2, y = H < 560 ? 12 : 110;
    if (this.mode === 'choose') {
      nameInput.style.display = 'none';
      panel(c, x, y, w, 300, '#fff7e6', 26);
      icon(c, 'lock', W / 2, y + 46, 46);
      txt(c, 'Wie möchtest du dich anmelden?', W / 2, y + 96, 17, '#3d2c1f', 'center', null);
      const btn = (yy, label, col, fn) => { rrPath(c, x + 24, yy, w - 48, 58, 18); fs(c, col, 3); txt(c, label, W / 2, yy + 30, 18, '#3d2c1f', 'center', null); UI.btn(x + 24, yy, w - 48, 58, fn); };
      btn(y + 124, 'Mit Name + Geheim-Code', '#caffbf', () => this.setMode('name'));
      btn(y + 196, 'Mit Login-Code', '#bde0fe', () => this.setMode('code'));
      rrPath(c, W / 2 - 50, y + 262, 100, 26, 13); fs(c, '#e9ecef', 2); txt(c, 'Admin', W / 2, y + 276, 13, '#495057', 'center', null); UI.btn(W / 2 - 60, y + 256, 120, 40, () => this.setMode('admin'));
      return;
    }
    if (this.mode === 'admin') {
      panel(c, x, y, w, 330, '#fff7e6', 26);
      icon(c, 'lock', W / 2, y + 34, 34); txt(c, 'Admin-Anmeldung', W / 2, y + 70, 18, '#3d2c1f', 'center', null);
      const show = this.busy || overlay ? 'none' : 'block';
      Object.assign(nameInput.style, { display: show, left: (x + 24) + 'px', top: (y + 92) + 'px', width: (w - 48) + 'px', height: '52px' }); nameInput.placeholder = 'Benutzer'; nameInput.maxLength = 32;
      Object.assign(passInput.style, { display: show, left: (x + 24) + 'px', top: (y + 154) + 'px', width: (w - 48) + 'px', height: '52px', font: nameInput.style.font, textAlign: 'center', border: nameInput.style.border, borderRadius: '16px', padding: '8px', background: '#fff', color: '#2b1d14', outline: 'none', zIndex: 5, boxSizing: 'border-box', position: 'fixed' });
      if (this.err) txt(c, this.err, W / 2, y + 226, 15, '#c1121f', 'center', null);
      const ok = nameInput.value.trim() && passInput.value && !this.busy;
      if (this.busy) for (let i = 0; i < 3; i++) { ell(c, W / 2 + (i - 1) * 22, y + 276, 7, 7); c.fillStyle = `rgba(17,138,178,${0.3 + 0.7 * Math.max(0, Math.sin(this.t * 6 - i))})`; c.fill(); }
      else { c.save(); if (!ok) c.globalAlpha = 0.4; roundBtn(c, W / 2, y + 276, 32, '#06d6a0', 'check', ok ? () => this.adminLogin() : null); c.restore(); }
      return;
    }
    passInput.style.display = 'none';
    panel(c, x, y, w, 300, '#fff7e6', 26);
    txt(c, this.mode === 'code' ? 'Gib deinen Login-Code ein' : 'Wie heißt dein Konto?', W / 2, y + 44, 18, '#3d2c1f', 'center', null);
    Object.assign(nameInput.style, { display: this.busy || overlay ? 'none' : 'block', left: (x + 24) + 'px', top: (y + 70) + 'px', width: (w - 48) + 'px', height: '56px' });
    if (this.mode === 'code') nameInput.value = nameInput.value.toUpperCase();
    if (this.err) { const L = wrapLines(c, this.err, w - 48, 15); L.forEach((l, i) => txt(c, l, W / 2, y + 150 + i * 20, 15, '#c1121f', 'center', null)); }
    const ok = nameInput.value.trim().length >= (this.mode === 'code' ? 8 : 2) && !this.busy;
    if (this.busy) for (let i = 0; i < 3; i++) { ell(c, W / 2 + (i - 1) * 22, y + 240, 7, 7); c.fillStyle = `rgba(17,138,178,${0.3 + 0.7 * Math.max(0, Math.sin(this.t * 6 - i))})`; c.fill(); }
    else { c.save(); if (!ok) c.globalAlpha = 0.4; roundBtn(c, W / 2, y + 240, 32, '#06d6a0', 'check', ok ? () => {
      const v = nameInput.value.trim(); nameInput.blur();
      if (this.mode === 'code') { this.busy = true; Net.call({ action: 'login', login: v }).then(r => this.done(r)); }
      else if (v.toLowerCase() === 'admin') { this.setMode('admin'); nameInput.value = 'admin'; }   // Admin hat keinen Bilder-Code, sondern ein Passwort
      else overlay = new CodePad({ acc: { name: v, avatar: 0 }, onDone: code => { this.busy = true; Net.call({ action: 'login', name: v, code }).then(r => this.done(r)); } });
    } : null); c.restore(); }
  }
}

// Figur selbst aussuchen (gilt für alle Schwierigkeitsstufen)
class CharSelect {
  constructor(next) { this.next = next; this.t = 0; }
  enter() { FX.clear(); Voice.say('Wähle deine Figur.', true); }
  update(dt) { this.t += dt; }
  draw(c) {
    skyBg(c);
    txt(c, 'Wähle deine Figur', W / 2, 44, Math.min(32, W / 14), '#fff', 'center', BRAND.olive);
    const opts = (typeof ownedAnimals === 'function' ? ownedAnimals() : ['cat', 'dog', 'lion']).map(k => [k, ANIMAL_NAMES[k]]), a = ACC(), n = opts.length;
    const land = W > H * 0.9, cw = land ? Math.min(240, (W - 40) / n - 14) : Math.min(W - 40, 360), ch = land ? Math.min(H - 110, 300) : Math.min(190, (H - 120) / n - 12);
    opts.forEach(([k, name], i) => {
      const x = land ? W / 2 + (i - (n - 1) / 2) * (cw + 14) - cw / 2 : (W - cw) / 2, y = land ? 84 : 84 + i * (ch + 12);
      const sel = a && a.char === k, bob = Math.sin(this.t * 2 + i) * 3;
      panel(c, x, y + bob, cw, ch, sel ? '#d8f5e3' : '#fbf8f2', 22);
      drawAnimal(c, k, land ? x + cw / 2 : x + ch * 0.6, land ? y + bob + ch * 0.78 : y + bob + ch * 0.86, land ? Math.min(3, ch / 85) : Math.min(2.4, ch / 76), { t: this.t + i, look: DEFAULT_LOOK, moving: sel });
      txt(c, name, land ? x + cw / 2 : x + ch * 1.3, land ? y + bob + ch - 24 : y + bob + ch / 2, 24, BRAND.olive, land ? 'center' : 'left', null);
      UI.btn(x, y + bob, cw, ch, () => { if (!a) return; a.char = k; Save.write(); Sfx.play('win'); setTimeout(() => this.next(), 500); });
    });
  }
}

class NewAccount {
  constructor(o = {}) { this.t = 0; this.step = 'name'; this.avatar = Math.floor(rnd() * 6); this.err = ''; this.migrate = o.migrate || null; }
  enter() { FX.clear(); nameInput.value = ''; nameInput.placeholder = 'Fantasiename'; nameInput.maxLength = 14; }
  update(dt) { this.t += dt; }
  leave(to) { nameInput.style.display = 'none'; nameInput.blur(); setScene(to); }
  async register(code) {
    this.step = 'wait';
    const r = await Net.call({ action: 'register', name: this.name, code, avatar: this.avatar });
    if (r && r.status === 200) {
      const old = this.migrate && Save.data.accounts[this.migrate];
      adoptAccount(r.data);
      if (old) {   // bisherigen Spielstand vom Gerät ins neue Konto übernehmen
        const a = ACC(); ['diff', 'tut', 'char', 'recent', 'recentEasy', 'sound'].forEach(k => { if (old[k] !== undefined) a[k] = old[k]; });
        delete Save.data.accounts[this.migrate]; a.changed = Date.now(); Save.write(false); Net.syncNow();
      }
      this.step = 'done'; Sfx.play('win'); FX.confetti(W / 2, 200, 50); return;
    }
    const e = r && r.data && r.data.error;
    this.err = !r ? 'Keine Verbindung zum Server. Bitte Internet prüfen und nochmal versuchen.' : e === 'name_taken' ? 'Diesen Namen gibt es schon. Denk dir einen anderen aus!' : 'Das hat nicht geklappt. Bitte nochmal versuchen.';
    this.step = 'name'; Sfx.play('bad');
  }
  draw(c) {
    skyBg(c);
    roundBtn(c, 44, 44, 28, '#fff', 'back', () => this.leave(this.migrate ? new Menu() : new Accounts()), '#ffd166');
    const w = Math.min(W - 28, 420), x = (W - w) / 2, y = H < 560 ? 8 : 100;
    if (this.step === 'name') {
      panel(c, x, y, w, 350, '#fff7e6', 26);
      ell(c, W / 2, y + 60, 40, 40); fs(c, '#d8f3dc', 3); drawCritter(c, AVATARS[this.avatar], W / 2, y + 96, 1.3, this.t, { noShadow: true });
      UI.btn(W / 2 - 44, y + 16, 88, 88, () => { this.avatar = (this.avatar + 1) % 6; Sfx.play('tap'); });
      icon(c, 'retry', W / 2 + 44, y + 30, 22);
      txt(c, 'Denk dir einen Fantasienamen aus', W / 2, y + 128, 16, '#3d2c1f', 'center', null);
      txt(c, '(bitte nicht deinen echten Namen)', W / 2, y + 150, 13, '#8d5a3b', 'center', null);
      const iw = w - 110;
      Object.assign(nameInput.style, { display: 'block', left: (x + 20) + 'px', top: (y + 172) + 'px', width: iw + 'px', height: '54px' });
      roundBtn(c, x + w - 46, y + 199, 26, '#ffd166', 'retry', () => { nameInput.value = pick(NAME_A) + ' ' + pick(NAME_B) + ' ' + ri(1, 99); Sfx.play('tap'); });
      if (this.err) wrapLines(c, this.err, w - 40, 14).forEach((l, i) => txt(c, l, W / 2, y + 246 + i * 18, 14, '#c1121f', 'center', null));
      const ok = nameInput.value.trim().length >= 2;
      c.save(); if (!ok) c.globalAlpha = 0.4; roundBtn(c, W / 2, y + 300, 32, '#06d6a0', 'check', ok ? () => {
        this.name = nameInput.value.trim().slice(0, 14); nameInput.style.display = 'none'; nameInput.blur(); this.err = '';
        this.step = 'code';
        overlay = new CodePad({ onDone: code => this.register(code), onCancel: () => { this.step = 'name'; } });
      } : null); c.restore();
    } else if (this.step === 'wait') {
      panel(c, x, y, w, 160, '#fff7e6', 26);
      txt(c, 'Konto wird angelegt …', W / 2, y + 60, 18, '#3d2c1f', 'center', null);
      for (let i = 0; i < 3; i++) { ell(c, W / 2 + (i - 1) * 22, y + 110, 7, 7); c.fillStyle = `rgba(17,138,178,${0.3 + 0.7 * Math.max(0, Math.sin(this.t * 6 - i))})`; c.fill(); }
    } else if (this.step === 'done' && ACC()) {
      const a = ACC();
      panel(c, x, y, w, 380, '#fff7e6', 26);
      ell(c, W / 2, y + 64, 44, 44); fs(c, '#d8f3dc', 3); drawCritter(c, AVATARS[a.avatar % 6], W / 2, y + 104, 1.4, this.t, { noShadow: true, wave: true });
      txt(c, a.name, W / 2, y + 140, 24, '#3d2c1f', 'center', null);
      txt(c, 'Merk dir deinen Geheim-Code:', W / 2, y + 180, 15, '#8d5a3b', 'center', null);
      a.code.forEach((k, i) => { const cx = W / 2 + (i - 1.5) * 58; rrPath(c, cx - 24, y + 196, 48, 48, 12); fs(c, '#fff', 3); drawSym(c, k, cx, y + 220, 16); });
      txt(c, 'Dein Login-Code (für andere Geräte):', W / 2, y + 272, 14, '#8d5a3b', 'center', null);
      rrPath(c, W / 2 - 110, y + 286, 220, 40, 12); fs(c, '#fff', 3); txt(c, a.login, W / 2, y + 307, 22, '#118ab2', 'center', null);
      roundBtn(c, H < 560 ? x + w + 40 : W / 2, H < 560 ? y + 190 : y + 380, 34, '#06d6a0', 'play', () => this.leave(new Menu()));
    }
  }
}

function stageIcon(c, id, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s / 40, s / 40); c.lineJoin = 'round'; c.lineCap = 'round';
  if (id === 'gastraum') { ell(c, 0, 2, 16, 16); fs(c, '#fff', 3); ell(c, 0, 2, 9, 9); fs(c, null, 1.5); line(c, -22, -12, -22, 16, 3, '#adb5bd'); line(c, 22, -12, 22, 16, 3, '#adb5bd'); }
  else if (id === 'kueche') { line(c, 8, 4, 24, -8, 5, '#495057'); ell(c, -4, 6, 16, 11); fs(c, '#343a40', 3); ell(c, -4, 4, 6, 4); fs(c, '#ffd166', 1.5); }
  else if (id === 'aussen') { line(c, -2, 18, 2, -8, 5, '#8d5a3b'); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * 0.6; line(c, 2, -8, 2 + Math.cos(a) * 18, -8 + Math.sin(a) * 14 + 6, 4, '#52b788'); } }
  else if (id === 'chalet') { rrPath(c, -16, -2, 32, 20, 3); fs(c, '#6f4518', 3); polyPath(c, [[-22, 0], [0, -20], [22, 0]]); fs(c, '#f8f9fa', 3); rrPath(c, -4, 6, 8, 12, 2); fs(c, '#ffd166', 2); }
  else if (id === 'spielplatz') { rrPath(c, -18, -6, 16, 24, 3); fs(c, '#c08b55', 3); polyPath(c, [[-22, -6], [-10, -20], [2, -6]]); fs(c, '#9e3b2f', 3); polyPath(c, [[-2, -2], [20, 16], [20, 20], [-2, 4]]); fs(c, '#dee2e6', 3); }
  else if (id === 'parkplatz') { rrPath(c, -20, -4, 40, 16, 6); fs(c, '#4dabf7', 3); polyPath(c, [[-11, -4], [-6, -14], [8, -14], [13, -4]]); fs(c, '#a5d8ff', 3); ell(c, -11, 13, 5, 5); fs(c, '#343a40', 2); ell(c, 11, 13, 5, 5); fs(c, '#343a40', 2); }
  c.restore();
}

// ---------- Das Gelände von Im Original als Karte (Stil der Geschichte) ----------
// Bereiche liegen wie in echt um das Glashaus; der Helfer arbeitet sich vom Zentrum nach außen vor.
const AREAS = {
  gastraum: { x: 0.5, y: 0.42, w: 0.4, h: 0.2 }, kueche: { x: 0.5, y: 0.15, w: 0.32, h: 0.12 },
  aussen: { x: 0.85, y: 0.44, w: 0.24, h: 0.24 }, chalet: { x: 0.15, y: 0.33, w: 0.22, h: 0.16 },
  spielplatz: { x: 0.27, y: 0.72, w: 0.4, h: 0.22 }, parkplatz: { x: 0.73, y: 0.84, w: 0.42, h: 0.16 },
};
const OPEN_STAGES = ['spielplatz'];
function drawGrounds(c, X, Y, Wd, Hd, o = {}) {
  const t = o.t || 0, reveal = o.reveal === undefined ? 6 : o.reveal;
  const A = id => { const a = AREAS[id]; return { x: X + a.x * Wd, y: Y + a.y * Hd, w: a.w * Wd, h: a.h * Hd }; };
  rrPath(c, X, Y, Wd, Hd, 26); fs(c, '#9cc27a', 4);
  c.save(); rrPath(c, X, Y, Wd, Hd, 26); c.clip();
  c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 40; i++) { ell(c, X + ((i * 97) % 100) / 100 * Wd, Y + ((i * 61) % 100) / 100 * Hd, 14, 8); c.fill(); }
  // Kieswege in der Reihenfolge der Geschichte
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); STAGE_ORDER.forEach((id, i) => { const a = A(id); i ? c.lineTo(a.x, a.y) : c.moveTo(a.x, a.y); });
  c.lineWidth = 22; c.strokeStyle = '#e9dfcc'; c.stroke(); c.setLineDash([2, 14]); c.lineWidth = 6; c.strokeStyle = 'rgba(160,130,90,.5)'; c.stroke(); c.setLineDash([]);
  // Bereiche
  const g = A('gastraum'); rrPath(c, g.x - g.w / 2, g.y - g.h / 2, g.w, g.h, 10); fs(c, '#cfeef7', 3.5);
  c.strokeStyle = '#fff'; c.lineWidth = 2.5; for (let i = 1; i < 8; i++) { const xx = g.x - g.w / 2 + (g.w * i) / 8; c.beginPath(); c.moveTo(xx, g.y - g.h / 2 + 3); c.lineTo(xx, g.y + g.h / 2 - 3); c.stroke(); }
  for (let i = 0; i < 4; i++) { const px = g.x - g.w * 0.35 + i * g.w * 0.23, py = g.y + Math.sin(i) * 6; for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU + t * 0.3; ell(c, px + Math.cos(a) * 9, py + Math.sin(a) * 6, 8, 4, a); c.fillStyle = '#52b788'; c.fill(); } }
  drawLogo(c, g.x, g.y - g.h * 0.08, Math.min(g.w * 0.62, 170), true);
  const kc = A('kueche'); rrPath(c, kc.x - kc.w / 2, kc.y - kc.h / 2, kc.w, kc.h, 6); fs(c, '#e9ecef', 3.5); rrPath(c, kc.x - kc.w / 2, kc.y - kc.h / 2, kc.w, kc.h * 0.35, 6); fs(c, '#b5654a', 3);
  for (let i = 0; i < 3; i++) { const sy = kc.y - kc.h / 2 - 8 - ((t * 20 + i * 12) % 36); c.globalAlpha = 0.6 - ((t * 20 + i * 12) % 36) / 60; ell(c, kc.x + kc.w * 0.3 + Math.sin(t * 2 + i) * 4, sy, 7, 6); c.fillStyle = '#fff'; c.fill(); c.globalAlpha = 1; }
  const au = A('aussen'); rrPath(c, au.x - au.w / 2, au.y - au.h / 2, au.w, au.h, 10); fs(c, '#e3dbcd', 3);
  [[-0.25, -0.22], [0.2, -0.05], [-0.15, 0.25]].forEach(([dx, dy], i) => { ell(c, au.x + dx * au.w, au.y + dy * au.h, au.w * 0.2, au.w * 0.2); fs(c, ['#ef476f', '#ffd166', '#06d6a0'][i], 2.5); });
  const ch = A('chalet'); polyPath(c, [[ch.x - ch.w / 2, ch.y], [ch.x, ch.y - ch.h / 2], [ch.x + ch.w / 2, ch.y]]); fs(c, '#f8f9fa', 3); rrPath(c, ch.x - ch.w * 0.4, ch.y, ch.w * 0.8, ch.h * 0.45, 4); fs(c, '#6f4518', 3); rrPath(c, ch.x - 6, ch.y + ch.h * 0.15, 12, ch.h * 0.3, 2); fs(c, '#ffd166', 2);
  const sp = A('spielplatz'); rrPath(c, sp.x - sp.w / 2, sp.y - sp.h / 2, sp.w, sp.h, 18); fs(c, CHIP_BASE, 3);
  for (let i = 0; i < 60; i++) { c.fillStyle = CHIP_COLS[i % 6]; ell(c, sp.x - sp.w / 2 + 8 + ((i * 37) % 100) / 100 * (sp.w - 16), sp.y - sp.h / 2 + 8 + ((i * 53) % 100) / 100 * (sp.h - 16), 2.5, 1.2, i); c.fill(); }
  rrPath(c, sp.x + sp.w * 0.05, sp.y - sp.h * 0.25, sp.w * 0.16, sp.h * 0.4, 3); fs(c, '#c08b55', 2.5); polyPath(c, [[sp.x + sp.w * 0.02, sp.y - sp.h * 0.25], [sp.x + sp.w * 0.13, sp.y - sp.h * 0.42], [sp.x + sp.w * 0.24, sp.y - sp.h * 0.25]]); fs(c, '#9e3b2f', 2.5);
  polyPath(c, [[sp.x + sp.w * 0.21, sp.y - sp.h * 0.05], [sp.x + sp.w * 0.4, sp.y + sp.h * 0.25], [sp.x + sp.w * 0.36, sp.y + sp.h * 0.3], [sp.x + sp.w * 0.21, sp.y + sp.h * 0.05]]); fs(c, '#dee2e6', 2.5);
  line(c, sp.x - sp.w * 0.38, sp.y - sp.h * 0.1, sp.x + sp.w * 0.05, sp.y - sp.h * 0.1, 4, '#8d5a3b');
  [-0.28, -0.12].forEach(dx => { const sw = Math.sin(t * 2 + dx * 10) * 4; line(c, sp.x + dx * sp.w, sp.y - sp.h * 0.1, sp.x + dx * sp.w + sw, sp.y + sp.h * 0.15, 1.5, '#adb5bd', false); rrPath(c, sp.x + dx * sp.w + sw - 7, sp.y + sp.h * 0.15, 14, 4, 2); fs(c, '#343a40', 1.5); });
  const pk = A('parkplatz'); rrPath(c, pk.x - pk.w / 2, pk.y - pk.h / 2, pk.w, pk.h, 8); fs(c, '#868e96', 3);
  for (let i = 0; i < 4; i++) { const cx2 = pk.x - pk.w * 0.36 + i * pk.w * 0.24; rrPath(c, cx2 - 10, pk.y - pk.h * 0.32, 20, pk.h * 0.64, 6); fs(c, ['#e63946', '#4dabf7', '#f8f9fa', '#ffd166'][i], 2); }
  c.restore();
  // Knoten: Symbol, Ausrüstungsteil, Status
  const nodes = {};
  STAGE_ORDER.forEach((id, i) => {
    const a = A(id), open = OPEN_STAGES.includes(id), shown = i < reveal, R = clamp(Math.min(Wd, Hd) * 0.075, 24, 44);
    const nx = a.x, ny = a.y - (id === 'gastraum' ? 0 : 0);
    nodes[id] = { x: nx, y: ny, R };
    if (!open && shown && !o.trailer) { rrPath(c, a.x - a.w / 2, a.y - a.h / 2, a.w, a.h, 10); c.fillStyle = 'rgba(40,50,40,.32)'; c.fill(); }
    const pop = o.trailer ? ease.back(clamp((o.revealT || 0) - i * 0.6, 0, 1)) : 1;
    if (!shown || pop <= 0) return;
    c.save(); c.translate(nx, ny); c.scale(pop * (open && !o.trailer ? 1 + Math.sin(t * 4) * 0.05 : 1), pop);
    ell(c, 0, 4, R, R); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill();
    ell(c, 0, 0, R, R); fs(c, open || o.trailer ? '#fff7e6' : '#ced4da', 4);
    c.globalAlpha = open || o.trailer ? 1 : 0.5; stageIcon(c, id, 0, 0, R * 1.1); c.globalAlpha = 1;
    const earned = o.kind && id === 'spielplatz' && hasCap(o.kind);
    ell(c, R * 0.85, R * 0.75, R * 0.45, R * 0.45); fs(c, earned ? '#ffd166' : '#fff', 3);
    drawOutfitIcon(c, OUTFIT_OF[id], R * 0.85, R * 0.75, R * 0.7, !earned && !o.trailer);
    if (!open && !o.trailer) { ell(c, -R * 0.75, -R * 0.75, R * 0.36, R * 0.36); fs(c, '#fff', 3); icon(c, 'hourglass', -R * 0.75, -R * 0.75, R * 0.45); }
    c.restore();
  });
  return nodes;
}

// ---------- Stage-Auswahl: 6 klare Karten in der Reihenfolge der Geschichte ----------
const STAGE_INFO = {
  gastraum: { name: 'Gastraum', sub: 'Das Glashaus mit Palmen' },
  kueche: { name: 'Küche', sub: 'Blick hinter die Kulissen' },
  aussen: { name: 'Außenbereich', sub: 'Terrasse unter Palmen' },
  chalet: { name: 'Chalet', sub: 'Fondue & Hüttenzauber im Winter' },
  spielplatz: { name: 'Spielplatz', sub: 'Spielhaus, Rutsche & Schaukel' },
  parkplatz: { name: 'Parkplatz', sub: 'Der Weg nach Hause' },
};
// Kleines gezeichnetes Bild für jeden Bereich
function stageArt(c, id, x, y, w, h, t) {
  c.save(); rrPath(c, x, y, w, h, 14); c.clip();
  const cx = x + w / 2, gy = y + h * 0.78, s = h / 100;
  const sky = c.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#9fd3e6'); sky.addColorStop(1, '#e0f4fa'); c.fillStyle = sky; c.fillRect(x, y, w, h);
  if (id === 'gastraum') {
    c.fillStyle = '#d9cfbf'; c.fillRect(x, gy, w, h);
    polyPath(c, [[x + w * 0.08, gy], [x + w * 0.08, y + h * 0.3], [cx, y + h * 0.1], [x + w * 0.92, y + h * 0.3], [x + w * 0.92, gy]]); fs(c, 'rgba(214,240,247,.95)', 3);
    c.strokeStyle = '#fff'; c.lineWidth = 2.5; for (let i = 1; i < 6; i++) { const xx = x + w * 0.08 + (w * 0.84 * i) / 6; c.beginPath(); c.moveTo(xx, y + h * 0.25); c.lineTo(xx, gy); c.stroke(); }
    drawPotPalm(c, x + w * 0.24, gy + 2, 0.55 * s, t); drawPotPalm(c, x + w * 0.78, gy + 2, 0.5 * s, t + 1);
    drawLogo(c, cx, y + h * 0.42, w * 0.5, true);
    ell(c, cx, gy - 4 * s, 14 * s, 5 * s); fs(c, '#fbf8f2', 2); drawFood(c, 'flammkuchen', cx, gy - 12 * s, 20 * s);
  } else if (id === 'kueche') {
    c.fillStyle = '#f1f3f5'; c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 1.5; for (let i = 0; i < w; i += 14) { c.beginPath(); c.moveTo(x + i, y); c.lineTo(x + i, gy); c.stroke(); } for (let j = 0; j < h; j += 14) { c.beginPath(); c.moveTo(x, y + j); c.lineTo(x + w, y + j); c.stroke(); }
    rrPath(c, x + w * 0.15, gy - 30 * s, w * 0.7, 30 * s + 20, 4); fs(c, '#495057', 3);
    ell(c, cx - 14 * s, gy - 30 * s, 14 * s, 4 * s); fs(c, '#212529', 2); line(c, cx, gy - 31 * s, cx + 22 * s, gy - 36 * s, 4 * s, '#212529');
    for (let i = 0; i < 3; i++) { const sy = gy - 40 * s - ((t * 18 + i * 10) % 30) * s; c.globalAlpha = 0.7 - ((t * 18 + i * 10) % 30) / 45; ell(c, cx - 14 * s + Math.sin(t * 2 + i) * 4, sy, 6 * s, 5 * s); c.fillStyle = '#fff'; c.fill(); c.globalAlpha = 1; }
    c.save(); c.translate(x + w * 0.8, y + h * 0.3); c.scale(s * 0.8, s * 0.8); [[-6, -6, 7], [1, -9, 8], [8, -6, 7]].forEach(([a, b, r]) => { ell(c, a, b, r, r); fs(c, '#fff', 2); }); rrPath(c, -8, -3, 18, 10, 2); fs(c, '#fff', 2); c.restore();
    drawFood(c, 'pasta', x + w * 0.25, y + h * 0.32, 26 * s);
  } else if (id === 'aussen') {
    c.fillStyle = '#e3dbcd'; c.fillRect(x, gy - 6, w, h);
    const umb = (ux, r) => { line(c, ux, gy, ux, gy - 40 * s, 3, '#6c757d'); c.beginPath(); c.moveTo(ux - r, gy - 38 * s); c.quadraticCurveTo(ux, gy - 70 * s, ux + r, gy - 38 * s); c.closePath(); fs(c, BRAND.olive, 2.5); c.beginPath(); c.moveTo(ux - r * 0.35, gy - 42 * s); c.quadraticCurveTo(ux, gy - 66 * s, ux + r * 0.35, gy - 42 * s); c.closePath(); c.fillStyle = BRAND.cream; c.fill(); };
    umb(x + w * 0.3, 30 * s); umb(x + w * 0.72, 26 * s);
    drawPotPalm(c, x + w * 0.92, gy + 2, 0.5 * s, t);
    rrPath(c, x + w * 0.22, gy - 16 * s, 24 * s, 4 * s, 2); fs(c, '#adb5bd', 1.5); drawFood(c, 'limo', x + w * 0.29, gy - 26 * s, 18 * s);
    ell(c, x + w * 0.85, y + h * 0.18, 10 * s, 10 * s); fs(c, '#ffd166', 0);
  } else if (id === 'chalet') {
    const nsky = c.createLinearGradient(0, y, 0, y + h); nsky.addColorStop(0, '#1d2d44'); nsky.addColorStop(1, '#3e5c76'); c.fillStyle = nsky; c.fillRect(x, y, w, h);
    c.fillStyle = '#f8f9fa'; c.fillRect(x, gy, w, h);
    rrPath(c, cx - 30 * s, gy - 34 * s, 60 * s, 34 * s, 3); fs(c, '#6f4518', 3);
    polyPath(c, [[cx - 40 * s, gy - 32 * s], [cx, gy - 62 * s], [cx + 40 * s, gy - 32 * s]]); fs(c, '#8d5a3b', 3);
    polyPath(c, [[cx - 42 * s, gy - 32 * s], [cx, gy - 64 * s], [cx + 42 * s, gy - 32 * s], [cx + 34 * s, gy - 30 * s], [cx, gy - 55 * s], [cx - 34 * s, gy - 30 * s]]); fs(c, '#fff', 2);
    rrPath(c, cx - 8 * s, gy - 24 * s, 16 * s, 14 * s, 2); fs(c, '#ffd166', 2);
    for (let i = 0; i < 14; i++) { c.fillStyle = 'rgba(255,255,255,.85)'; ell(c, x + ((i * 37 + t * 10) % w), y + ((i * 23 + t * 18 * (1 + (i % 3) * 0.3)) % h), 1.8, 1.8); c.fill(); }
  } else if (id === 'spielplatz') {
    c.fillStyle = CHIP_BASE; c.fillRect(x, gy - 6, w, h);
    for (let i = 0; i < 50; i++) { c.fillStyle = CHIP_COLS[i % 6]; ell(c, x + (i * 37) % w, gy + ((i * 13) % 20), 2.5, 1.2, i); c.fill(); }
    cypress(c, x + w * 0.9, gy, 70 * s);
    line(c, x + w * 0.08, gy, x + w * 0.12, gy - 45 * s, 5, '#8d5a3b'); line(c, x + w * 0.12, gy - 45 * s, x + w * 0.45, gy - 45 * s, 5, '#8d5a3b');
    const sw = Math.sin(t * 2) * 8; line(c, x + w * 0.27, gy - 45 * s, x + w * 0.27 + sw, gy - 14 * s, 1.5, '#adb5bd', false); rrPath(c, x + w * 0.27 + sw - 8, gy - 15 * s, 16, 4, 2); fs(c, '#343a40', 1.5);
    rrPath(c, x + w * 0.46, gy - 44 * s, 32 * s, 44 * s, 3); fs(c, '#c08b55', 2.5);
    polyPath(c, [[x + w * 0.46 - 5, gy - 44 * s], [x + w * 0.46 + 16 * s, gy - 66 * s], [x + w * 0.46 + 32 * s + 5, gy - 44 * s]]); fs(c, '#9e3b2f', 2.5);
    polyPath(c, [[x + w * 0.46 + 32 * s, gy - 26 * s], [x + w * 0.8, gy], [x + w * 0.8 - 6, gy + 3], [x + w * 0.46 + 32 * s, gy - 20 * s]]); fs(c, '#dee2e6', 2);
  } else if (id === 'parkplatz') {
    c.fillStyle = '#6c757d'; c.fillRect(x, gy - 10, w, h);
    c.strokeStyle = '#fff'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x + w * (0.12 + i * 0.25), gy - 8); c.lineTo(x + w * (0.12 + i * 0.25), y + h); c.stroke(); }
    ['#e63946', '#4dabf7', '#ffd166'].forEach((k, i) => { const ccx = x + w * (0.25 + i * 0.25); rrPath(c, ccx - 14 * s, gy - 14 * s, 28 * s, 12 * s, 4); fs(c, k, 2); polyPath(c, [[ccx - 8 * s, gy - 14 * s], [ccx - 5 * s, gy - 22 * s], [ccx + 6 * s, gy - 22 * s], [ccx + 9 * s, gy - 14 * s]]); fs(c, '#a5d8ff', 2); });
    c.strokeStyle = 'rgba(60,70,75,.6)'; c.lineWidth = 1; for (let i = 0; i < w; i += 8) { c.beginPath(); c.moveTo(x + i, y + h * 0.35); c.lineTo(x + i + 8, y + h * 0.5); c.stroke(); }
  }
  c.restore();
  rrPath(c, x, y, w, h, 14); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
}

// Weltkarte wie bei Super Mario: ein Weg, die Figur läuft hüpfend von Bereich zu Bereich
class StageMap {
  constructor(diff) {
    this.diff = diff; this.t = 0; this.camX = null; this.drag = null;
    this.cur = Math.max(0, STAGE_ORDER.indexOf('spielplatz')); this.sel = this.cur; this.walk = null; this.card = 0;
  }
  enter() { FX.clear(); }
  geo() {
    const top = 78, bot = H - 150, mid = (top + bot) / 2, amp = Math.max(30, (bot - top) * 0.3), gap = clamp(W * 0.32, 220, 300);
    const N = STAGE_ORDER.length, mapW = Math.max(W, 140 + gap * (N - 1) + 140);
    const nodes = STAGE_ORDER.map((id, i) => ({ id, x: 140 + i * gap, y: mid + (i % 2 ? amp : -amp) * (i % 4 < 2 ? 1 : 0.6) }));
    if (!this.pts || this.pts.mapW !== mapW || this.pts.H !== H) {
      const pts = [], at = [];
      for (let i = 0; i < N - 1; i++) {
        const a = nodes[i], b = nodes[i + 1], c1 = { x: a.x + gap * 0.5, y: a.y }, c2 = { x: b.x - gap * 0.5, y: b.y };
        at[i] = pts.length;
        for (let k = 0; k < 40; k++) { const u = k / 40, v = 1 - u; pts.push({ x: v * v * v * a.x + 3 * v * v * u * c1.x + 3 * v * u * u * c2.x + u * u * u * b.x, y: v * v * v * a.y + 3 * v * v * u * c1.y + 3 * v * u * u * c2.y + u * u * u * b.y }); }
      }
      at[N - 1] = pts.length; pts.push({ x: nodes[N - 1].x, y: nodes[N - 1].y });
      this.pts = { list: pts, at, mapW, H };
      if (this.pos === undefined) this.pos = at[this.cur];
    }
    return { nodes, mapW, top, bot };
  }
  update(dt) {
    this.t += dt; this.card = Math.min(1, this.card + dt * 4);
    const G = this.geo(), P = this.pts;
    if (this.walk) {
      const dir = Math.sign(this.walk.to - this.pos), step = dt * 9;   // Punkte pro Bild
      this.pos += dir * Math.min(Math.abs(this.walk.to - this.pos), step * 6);
      if (Math.floor(this.pos / 8) !== Math.floor((this.pos - dir * step * 6) / 8)) Sfx.note(700 + rnd() * 200, 0.05, 'sine', 0.03);
      if (Math.abs(this.walk.to - this.pos) < 0.01) { this.pos = this.walk.to; this.cur = this.walk.node; this.walk = null; this.card = 0; Sfx.play('good'); const p = this.scr(P.list[Math.round(this.pos)]); FX.sparkle(p.x, p.y - 30, 14, '#ffd23f'); }
    }
    const me = P.list[Math.round(this.pos)], want = clamp(me.x - W / 2, 0, G.mapW - W);
    if (this.camX === null) this.camX = want;
    if (!this.drag) this.camX = lerp(this.camX, want + (this.panOff || 0), Math.min(1, dt * 4));
    if (!this.drag && this.panOff) this.panOff *= Math.pow(0.2, dt);
  }
  scr(p) { return { x: p.x - this.camX, y: p.y }; }
  goTo(i) {
    if (this.walk) return;
    this.sel = i; this.panOff = 0;
    if (i === this.cur) { this.card = 0; return; }
    this.walk = { to: this.pts.at[i], node: i }; Sfx.play('jump');
  }
  play() { const id = STAGE_ORDER[this.cur]; if (!OPEN_STAGES.includes(id)) { Sfx.play('bad'); return; } Sfx.play('win'); setScene(new Play(this.diff)); }
  draw(c) {
    const G = this.geo(), P = this.pts, t = this.t, kind = ANIMAL_OF[this.diff], d = DIFFS.find(q => q.id === this.diff);
    // Himmel + Hügel mit Parallaxe
    const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#8fd3f4'); sky.addColorStop(0.55, '#d6f2fb'); sky.addColorStop(1, '#bfe3a5'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
    ell(c, W - 90, 110, 34, 34); fs(c, '#ffd166', 0);
    for (let i = 0; i < 6; i++) { const cx = ((i * 260 - this.camX * 0.2 + t * 12) % (W + 300) + W + 300) % (W + 300) - 150, cy = 90 + (i % 3) * 34; c.fillStyle = 'rgba(255,255,255,.85)'; ell(c, cx, cy, 46, 16); c.fill(); ell(c, cx + 26, cy - 10, 28, 16); c.fill(); }
    [[0.35, '#a3d483', 0.55], [0.6, '#8cc46a', 0.7]].forEach(([sp, col, hy]) => { c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W + 20; x += 20) { const wx = x + this.camX * sp; c.lineTo(x, H * hy + Math.sin(wx / 160) * 26 + Math.sin(wx / 63) * 9); } c.lineTo(W, H); c.closePath(); c.fillStyle = col; c.fill(); });
    c.fillStyle = '#7cb95a'; c.fillRect(0, G.bot - 10, W, H);
    c.save(); c.translate(-this.camX, 0);
    // Deko entlang des Wegs
    for (let i = 0; i < G.mapW / 90; i++) {
      const x = i * 90 + 30, yy = (i % 2 ? H * 0.64 : G.bot - 4) + ((i * 37) % 19);
      if (x < this.camX - 80 || x > this.camX + W + 80) continue;
      if (i % 3 === 0) cypress(c, x, yy, 70); else if (i % 3 === 1) { drawPotPalm(c, x, yy, 0.5, t + i); } else { ell(c, x, yy - 8, 18, 12); fs(c, '#52b788', 3); ell(c, x + 4, yy - 12, 5, 4); c.fillStyle = ['#ef476f', '#ffd166', '#fff'][i % 3]; c.fill(); }
    }
    // Weg: breiter Kiesweg + Punkte; schon gelaufener Teil leuchtet
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); P.list.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.lineWidth = 30; c.strokeStyle = '#6b4f2a'; c.stroke(); c.lineWidth = 24; c.strokeStyle = '#e9dfcc'; c.stroke();
    for (let i = 0; i < P.list.length; i += 6) { const p = P.list[i], open = i <= P.at[OPEN_STAGES.map(o => STAGE_ORDER.indexOf(o)).reduce((a, b) => Math.max(a, b), 0)]; ell(c, p.x, p.y, 4, 4); c.fillStyle = open ? '#c9a46b' : 'rgba(150,130,100,.45)'; c.fill(); }
    // Knoten
    G.nodes.forEach((n, i) => {
      const open = OPEN_STAGES.includes(n.id), sp = SP(this.diff, n.id), here = i === this.cur, R = 40;
      const bob = open ? Math.sin(t * 3 + i) * 3 : 0, pu = here && !this.walk ? 1 + Math.sin(t * 5) * 0.05 : 1;
      c.save(); c.translate(n.x, n.y + bob); c.scale(pu, pu);
      ell(c, 0, 10, R + 6, (R + 6) * 0.45); c.fillStyle = 'rgba(0,0,0,.2)'; c.fill();
      ell(c, 0, 4, R, R * 0.55); fs(c, open ? '#b5651d' : '#868e96', 4);
      ell(c, 0, 0, R, R * 0.55); fs(c, open ? (here ? BRAND.lime : '#ffd166') : '#ced4da', 4);
      c.restore();
      // Bereichs-Symbol als Schild über dem Knoten
      const sx = n.x, sy = n.y - 78 + bob;
      line(c, sx, sy + 20, sx, n.y - 8 + bob, 5, '#8d5a3b');
      c.save(); if (!open) c.globalAlpha = 0.65; ell(c, sx, sy, 30, 30); fs(c, '#fff7e6', 4); stageIcon(c, n.id, sx, sy, 36); c.restore();
      ell(c, sx - 26, sy - 22, 12, 12); fs(c, open ? BRAND.lime : '#adb5bd', 2.5); txt(c, String(i + 1), sx - 26, sy - 21, 13, '#fff', 'center', null);
      if (!open) { ell(c, sx + 26, sy - 22, 13, 13); fs(c, '#fff', 2.5); icon(c, 'hourglass', sx + 26, sy - 22, 16); }
      if (sp.clears) icon(c, 'crown', sx + 26, sy - 24, 24);
      txt(c, STAGE_INFO[n.id].name, n.x, n.y + 40, 15, '#fff', 'center', BRAND.ink);
      UI.btn(n.x - 50, n.y - 115, 100, 170, () => this.goTo(i));   // UI.btn rechnet die Verschiebung selbst um
    });
    // Figur auf dem Weg
    const fp = Math.round(this.pos), me = P.list[fp], nxt = P.list[Math.min(P.list.length - 1, fp + 1)], hop = this.walk ? Math.abs(Math.sin(t * 12)) * 16 : 0;
    const dir = this.walk ? Math.sign(this.walk.to - this.pos) || 1 : 1;
    drawAnimal(c, kind, me.x, me.y - 14 - hop, 1.25, { t, moving: !!this.walk, dir, cap: hasCap(kind) });
    if (this.walk && Math.floor(t * 10) % 2) { FX.puff && FX.puff(me.x - this.camX, me.y - 6, 1); }
    c.restore();
    // Kopfleiste
    topBar(c, () => setScene(new Menu()));
    for (let s2 = 0; s2 < d.stars; s2++) icon(c, 'star', 96 + s2 * 30, 44, 28);
    // Info-Karte zum gewählten Bereich
    const id = STAGE_ORDER[this.cur], open = OPEN_STAGES.includes(id), info = STAGE_INFO[id], sp = SP(this.diff, id);
    const cw = Math.min(W - 120, 560), ch = 104, cx = 16 + (W - 120 - cw) / 2, k = ease.back(this.card), cy = H - ch - 12 + (1 - k) * 140;
    if (!this.walk) {
      panel(c, cx, cy, cw, ch, open ? '#fbf8f2' : '#e9e4d8', 20);
      stageArt(c, id, cx + 8, cy + 8, ch * 1.3, ch - 16, t);
      const tx = cx + ch * 1.3 + 20;
      txt(c, info.name, tx, cy + 28, 22, open ? BRAND.olive : '#6c757d', 'left', null);
      txt(c, info.sub, tx, cy + 52, 13, '#6b5a48', 'left', null);
      if (open) {
        const done = ALL_IDS.filter(q => sp.run && sp.run.done && sp.run.done[q]).length;
        for (let q = 0; q < 6; q++) { ell(c, tx + 6 + q * 15, cy + 78, 5.5, 5.5); fs(c, q < done ? '#06d6a0' : '#e9ecef', 2); }
        icon(c, 'hanger', tx + 110, cy + 78, 18); txt(c, sp.skins.length + '/6', tx + 122, cy + 79, 13, '#6b5a48', 'left', null);
        const pu = 1 + Math.sin(t * 6) * 0.07;
        c.save(); c.translate(cx + cw - 46, cy + ch / 2); c.scale(pu, pu); roundBtn(c, 0, 0, 34, '#06d6a0', 'play', null); c.restore();
        UI.btn(cx + cw - 90, cy, 90, ch, () => this.play());
      } else { rrPath(c, tx, cy + 64, 120, 28, 14); fs(c, '#fff', 2); icon(c, 'hourglass', tx + 16, cy + 78, 18); txt(c, 'kommt bald', tx + 30, cy + 79, 13, '#6c757d', 'left', null); }
    }
    roundBtn(c, W - 50, H - 60, 30, '#ffd166', 'hanger', () => { overlay = new Wardrobe(this.diff); });
  }
  down(x, y) { this.drag = { x0: x, cam0: this.camX, moved: false }; }
  move(x) { const d = this.drag; if (!d) return; if (Math.abs(x - d.x0) > 10) d.moved = true; if (d.moved) { const G = this.geo(); this.camX = clamp(d.cam0 - (x - d.x0), 0, G.mapW - W); } }
  up() { const d = this.drag; this.drag = null; if (d && d.moved) { const me = this.pts.list[Math.round(this.pos)], G = this.geo(); this.panOff = this.camX - clamp(me.x - W / 2, 0, G.mapW - W); } }
}

// ---------- Trailer: die Geschichte "Der neue Helfer" ohne Worte ----------
const STORY_SAY = [
  'Willkommen im Original in Teningen!',
  'Chefkoch Bruno macht dich zum neuen Helfer.',
  'Sechs Bereiche, sechs Uniform-Teile – sammle sie alle!',
  'Die Kinder haben Sachen verloren. Finde sie!',
  'Hilf allen, dann geht das Tor auf. Los geht’s!',
];
class Trailer {
  constructor() { this.t = 0; this.cuts = [0, 7, 15.5, 23.5, 33, 41]; this.said = -1; }
  enter() { FX.clear(); }
  end() { Voice.stop(); Save.data.seenTrailer = true; Save.write(); ensureProfile(); setScene(ACC() ? new Menu() : new Accounts()); }
  scene() { let i = 0; while (i < this.cuts.length - 1 && this.t >= this.cuts[i + 1]) i++; return i; }
  update(dt) {
    dt *= 2; this.t += dt; const s1 = this.scene(), lt = this.t - this.cuts[s1], at = v => lt > v && lt - dt <= v;   // läuft doppelt so schnell: ~20 s
    if (this.t >= this.cuts[this.cuts.length - 1]) { this.end(); return; }
    if (this.said !== s1) { this.said = s1; Voice.say(STORY_SAY[s1], true); }
    if (s1 === 1 && at(3.6)) { const k = this.k(); FX.sparkle(W / 2 - 60 * k, H * 0.62, 24, '#80ed99'); Sfx.play('good'); }
    if (s1 === 3 && at(2.6)) { FX.sparkle(W * 0.62, H * 0.5, 22); Sfx.play('good'); }
    if (s1 === 4 && at(1.6)) { FX.confetti(W / 2, H * 0.4, 40); Sfx.play('win'); }
  }
  k() { return clamp(Math.min(W / 400, H / 720), 0.7, 2); }
  draw(c) {
    const t = this.t, s = this.scene(), lt = t - this.cuts[s], k = this.k(), cx = W / 2, gy = H * 0.68;
    const fade = Math.min(clamp(lt * 3, 0, 1), clamp((this.cuts[s + 1] - t) * 3, 0, 1));
    if (s === 0) {
      skyBg(c);
      const sunY = H * 0.3 - ease.out(clamp(lt / 2, 0, 1)) * H * 0.12;
      ell(c, W * 0.8, sunY, 40 * k, 40 * k); fs(c, '#ffd166', 0);
      const lk = ease.back(clamp(lt - 0.8, 0, 1));
      c.save(); c.translate(cx, H * 0.22); c.scale(lk, lk); logo(c, 0, 0, k * 1.1); c.restore();
      ['cat', 'dog', 'lion'].forEach((a, i) => { const pk = ease.back(clamp(lt - 1.8 - i * 0.3, 0, 1)); if (pk > 0) drawAnimal(c, a, cx + (i - 1) * 90 * k, gy + 60 * k, 1.6 * k * pk, { t, noScarf: true }); });
    } else if (s === 1) {
      skyBg(c);
      drawCritter(c, 'baer', cx + 110 * k, gy + 40 * k, 2.2 * k, t, { chef: true, wave: lt > 1 && lt < 3.5 });
      const scarfOn = lt > 3.5;
      ['cat', 'dog', 'lion'].forEach((a, i) => {
        const tx = cx - (150 - i * 60) * k, x = lerp(-80 - i * 60, tx, ease.out(clamp(lt / 2.5, 0, 1)));
        const jump = scarfOn && lt < 5 ? Math.abs(Math.sin((lt - 3.5) * 8 + i)) * 14 * k : 0;
        drawAnimal(c, a, x, gy + 40 * k - jump, 1.35 * k, { t: t + i, moving: lt < 2.5, noScarf: !scarfOn });
      });
      if (lt > 2.6 && lt < 3.6) { const f = (lt - 2.6) / 1; for (let i = 0; i < 3; i++) { const sx = cx + 90 * k, ex = cx - (150 - i * 60) * k; const x = lerp(sx, ex, f), y = lerp(gy - 20 * k, gy - 8 * k, f) - Math.sin(f * Math.PI) * 80 * k; polyPath(c, [[x - 10 * k, y], [x + 10 * k, y], [x, y + 12 * k]]); fs(c, '#6bb544', 2.5); } }
      if (lt > 3.6) for (let i = 0; i < 3; i++) { const hx = cx - (150 - i * 60) * k, hy = gy - 50 * k - (lt - 3.6) * 30 * k; c.globalAlpha = clamp(1.5 - (lt - 3.6), 0, 1); icon(c, 'heart', hx, hy, 22 * k); c.globalAlpha = 1; }
    } else if (s === 2) {
      c.fillStyle = '#6f9a52'; c.fillRect(0, 0, W, H);
      const bw = Math.min(W - 30, 560), bh = Math.min(H - 180, 760), bx = (W - bw) / 2, by = (H - bh) / 2 - 20;
      const nodes = drawGrounds(c, bx, by, bw, bh, { t, trailer: true, reveal: 6, revealT: lt * 1.2 });
      const n = nodes.spielplatz;
      if (lt > 4) { const b = Math.abs(Math.sin(t * 4)) * 10; drawHand(c, n.x + 10, n.y + 24 + b, 1.5 * k); }
      // alle Ausrüstungsteile = Chef-Helfer
      const ow = Math.min(W - 60, 360), oy = by + bh + 40;
      STAGE_ORDER.forEach((id, i) => { const pk = ease.back(clamp(lt * 1.2 - i * 0.6 - 0.4, 0, 1)); if (pk <= 0) return; const x = W / 2 - ow / 2 + (i + 0.5) * (ow / 6); c.save(); c.translate(x, oy); c.scale(pk, pk); ell(c, 0, 0, 22, 22); fs(c, '#fff7e6', 3); drawOutfitIcon(c, OUTFIT_OF[id], 0, 0, 30); c.restore(); });
    } else if (s === 3) {
      c.fillStyle = CHIP_BASE; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 500; i++) { c.fillStyle = CHIP_COLS[i % 6]; ell(c, (i * 97.3) % W, (i * 61.7) % H, 3, 1.5, i); c.fill(); }
      drawYucca(c, W * 0.62, H * 0.56, 1.6 * k, t, lt > 1.6 && lt < 2.6 ? 0.5 : 0);
      const pos = W > H ? [['hase', 0.12, 0.56], ['fuchs', 0.88, 0.56], ['igel', 0.24, 0.9], ['waschbaer', 0.78, 0.9], ['eule', 0.36, 0.6]] : [['hase', 0.18, 0.36], ['fuchs', 0.82, 0.34], ['igel', 0.2, 0.82], ['waschbaer', 0.85, 0.8], ['eule', 0.5, 0.3]];
      pos.forEach(([id, x, y], i) => {
        const pk = ease.back(clamp(lt * 2 - i * 0.4, 0, 1)); if (pk <= 0) return;
        drawCritter(c, id, W * x, H * y, 1.3 * k * pk, t, { wave: true, staff: true });
        if (pk >= 1) txt(c, NPC_NAMES[id], W * x, H * y + 22 * k, 13 * Math.min(k, 1.3), '#fff', 'center', BRAND.olive);
        const b = Math.sin(t * 4 + i) * 4; ell(c, W * x, H * y - 90 * k + b, 18 * k, 18 * k); fs(c, '#ffd23f', 3); txt(c, '!', W * x, H * y - 89 * k + b, 22 * k, OL, 'center', null);
      });
      const ax = lerp(W * 0.3, W * 0.5, ease.out(clamp(lt / 1.4, 0, 1)));
      drawAnimal(c, 'dog', ax, H * 0.6, 1.5 * k, { t, moving: lt < 1.4, tilt: lt > 1.6 && lt < 2.6 ? Math.abs(Math.sin(t * 18)) * 0.25 : 0 });
      roundBtn(c, W - 60, H - 110, 34, lt > 1.4 && lt < 2.6 ? '#ffd166' : '#fff', 'search', null);
      if (lt > 2.6) { const pk = ease.back(clamp((lt - 2.6) * 3, 0, 1)); c.save(); c.translate(W * 0.62, H * 0.44 - (lt - 2.6) * 10); c.scale(pk, pk); ell(c, 0, 0, 36 * k, 36 * k); fs(c, '#fff7e6', 3); drawItem(c, 'ball', 0, 0, 50 * k); c.restore(); }
    } else if (s === 4) {
      c.fillStyle = CHIP_BASE; c.fillRect(0, 0, W, H * 0.62);
      for (let i = 0; i < 300; i++) { c.fillStyle = CHIP_COLS[i % 6]; ell(c, (i * 97.3) % W, (i * 61.7) % (H * 0.62), 3, 1.5, i); c.fill(); }
      c.fillStyle = '#6c757d'; c.fillRect(0, H * 0.62, W, H * 0.38);
      for (let i = 0; i < 4; i++) { const x = W * (0.12 + i * 0.25); rrPath(c, x - 26 * k, H * 0.8, 52 * k, 92 * k, 16 * k); fs(c, ['#e63946', '#4dabf7', '#f8f9fa', '#ffd166'][i], 3); }
      const open = clamp((lt - 1.6) / 0.8, 0, 1);
      drawGate(c, cx, H * 0.62, 1.4 * k, open, lt < 1.4, t);
      if (lt > 1.2 && lt < 1.6) FX.sparkle(cx, H * 0.62 - 64 * k, 2, '#ffd23f');
      const py = lerp(H * 0.48, H * 0.75, ease.inout(clamp((lt - 2.2) / 1.8, 0, 1)));
      drawAnimal(c, 'lion', cx, py, 1.6 * k, { t, moving: lt > 2.2, cap: true });
      if (lt > 2.4) { const pk = ease.back(clamp(lt - 2.4, 0, 1)); c.save(); c.translate(cx + 120 * k, H * 0.88); c.scale(pk, pk); ell(c, 0, 0, 34, 34); fs(c, '#fff7e6', 3); stageIcon(c, 'parkplatz', 0, 0, 40); icon(c, 'hourglass', 24, -24, 20); c.restore(); }
    }
    // Erzähler-Untertitel (wird auch vorgelesen)
    if (lt > 0.4) {
      const fz = clamp(W / 34, 14, 19), tw = Math.min(W - 40, 640), lines = wrapLines(c, STORY_SAY[s], tw - 28, fz), lh = fz * 1.3, ph = lines.length * lh + 20;
      const py = s === 0 ? H - ph - 44 : 14; c.globalAlpha = clamp((lt - 0.4) * 3, 0, 1);
      rrPath(c, (W - tw) / 2, py, tw, ph, 16); c.fillStyle = 'rgba(32,44,30,.82)'; c.fill();
      lines.forEach((l, i) => txt(c, l, W / 2, py + 10 + lh / 2 + i * lh, fz, '#fff', 'center', null)); c.globalAlpha = 1;
    }
    if (s === 1 && lt > 0.8) drawLogo(c, cx + 110 * k, gy - 120 * k, 120 * k, true);
    c.fillStyle = `rgba(0,0,0,${1 - fade})`; c.fillRect(0, 0, W, H);
    // Fortschritt + Überspringen
    for (let i = 0; i < 5; i++) { ell(c, cx + (i - 2) * 18, H - 24, 5, 5); fs(c, i <= s ? '#fff' : 'rgba(255,255,255,.35)', 2); }
    roundBtn(c, W - 40, 40, 26, '#fff', 'play', () => this.end(), '#06d6a0');
    icon(c, 'play', W - 32, 40, 22, '#06d6a0'); txt(c, 'Überspringen', W - 40, 80, 13, '#fff', 'center', BRAND.ink);
  }
  down() { const s = this.scene(); if (s < this.cuts.length - 2) this.t = this.cuts[s + 1]; else this.end(); }
}

// ---------- Kleiderschrank: gesammelte Skins je Stage + Stufe ansehen und anziehen ----------
class Wardrobe {
  constructor(diff) { this.diff = diff; CUR_DIFF = diff; this.kind = ANIMAL_OF[diff]; this.stage = 'spielplatz'; this.t = 0; }
  update(dt) { this.t += dt; }
  close() { if (overlay === this) overlay = null; }
  draw(c) {
    c.fillStyle = 'rgba(16,28,18,.72)'; c.fillRect(0, 0, W, H);
    const land = W > H, w = Math.min(W - 20, land ? 860 : 560), h = Math.min(H - 20, 660), x = (W - w) / 2, y = (H - h) / 2;
    panel(c, x, y, w, h, '#fff7e6', 26);
    roundBtn(c, x + w - 30, y + 30, 22, '#ced4da', 'cross', () => this.close());
    icon(c, 'hanger', x + 34, y + 32, 34);
    const d = DP(this.diff);
    txt(c, totalSkins() + '/108', x + 60, y + 33, 18, '#8d5a3b', 'left', null);
    // Stage-Reiter
    const tw = (w - 30) / 7;
    { const tx = x + 15 + 6 * tw, sel = this.stage === 'laden'; rrPath(c, tx + 3, y + 64, tw - 6, 52, 14); fs(c, sel ? '#ffd166' : '#e9ecef', 3); icon(c, 'shop', tx + tw / 2, y + 86, Math.min(30, tw * 0.5)); const m = META(); txt(c, (m ? m.skins.length : 0) + '/' + SHOP_SKINS.length, tx + tw / 2, y + 108, 11, '#3d2c1f', 'center', null); UI.btn(tx, y + 64, tw, 52, () => { this.stage = 'laden'; Sfx.play('tap'); }); }
    STAGE_ORDER.forEach((id, i) => {
      const tx = x + 15 + i * tw, sel = id === this.stage, open = OPEN_STAGES.includes(id);
      rrPath(c, tx + 3, y + 64, tw - 6, 52, 14); fs(c, sel ? '#ffd166' : '#e9ecef', 3);
      c.save(); if (!open) c.globalAlpha = 0.4; stageIcon(c, id, tx + tw / 2, y + 86, Math.min(34, tw * 0.55)); c.restore();
      const n = SP(this.diff, id).skins.length; txt(c, n + '/6', tx + tw / 2, y + 108, 11, '#3d2c1f', 'center', null);
      UI.btn(tx, y + 64, tw, 52, () => { this.stage = id; Sfx.play('tap'); });
    });
    const shop = this.stage === 'laden', sp = shop ? { skins: META().skins } : SP(this.diff, this.stage), ids = shop ? SHOP_SKINS.map(x => x[0]) : stageSkins(this.stage, this.diff);
    const cols = land ? (shop ? 9 : 6) : 3, cw = (w - 30 - (cols - 1) * 10) / cols, ch = land ? Math.min(190, h - 196) : Math.min(170, (h - 200 - 10) / (shop ? 3 : 2));
    ids.forEach((sid, i) => {
      const cx = x + 15 + (i % cols) * (cw + 10), cy = y + 128 + Math.floor(i / cols) * (ch + 10);
      const own = sp.skins.includes(sid), eq = d.equip === sid;
      rrPath(c, cx, cy, cw, ch, 18); fs(c, eq ? '#d8f5e3' : own ? '#fff' : '#dee2e6', 3.5, eq ? '#2b9348' : OL);
      if (own) drawAnimal(c, this.kind, cx + cw / 2, cy + ch * 0.82, Math.min(1.9, ch / 85), { look: SKINS[sid], cap: true, t: this.t + i });
      else { c.save(); c.globalAlpha = 0.25; drawAnimal(c, this.kind, cx + cw / 2, cy + ch * 0.82, Math.min(1.9, ch / 85), { look: { cap: '#495057', scarf: '#495057' }, cap: true, noShadow: true }); c.restore(); icon(c, 'question', cx + cw / 2, cy + ch * 0.45, 40, '#868e96'); }
      if (eq) icon(c, 'check', cx + cw - 20, cy + 20, 24, '#06d6a0');
      if (own) UI.btn(cx, cy, cw, ch, () => { d.equip = sid; Save.write(); Sfx.play('good'); });
    });
    // Standard-Look
    const by = y + h - 50;
    rrPath(c, W / 2 - 70, by - 26, 140, 52, 18); fs(c, d.equip === null ? '#d8f5e3' : '#fff', 3);
    drawAnimal(c, this.kind, W / 2 - 30, by + 20, 0.75, { look: DEFAULT_LOOK, cap: hasCap(this.kind), noShadow: true });
    if (d.equip === null) icon(c, 'check', W / 2 + 30, by, 24, '#06d6a0');
    UI.btn(W / 2 - 70, by - 26, 140, 52, () => { d.equip = null; Save.write(); Sfx.play('tap'); });
    if (!shop && !OPEN_STAGES.includes(this.stage)) { icon(c, 'hourglass', W / 2, y + 128 + ch, 44); }
  }
  down() {} move() {} up() {}
}

// ---------- Glücksrad: welcher Skin dieser Stage ist es geworden? ----------
class WheelOverlay {
  constructor(o, done) {
    this.o = o; this.done = done; this.t = 0; this.state = 'spin';
    this.ids = stageSkins(o.stage, o.diff);
    const ws = this.ids.map(id => RARITY[SKINS[id].rarity].w), tot = ws.reduce((a, b) => a + b, 0);
    let acc = 0; this.segs = this.ids.map((id, i) => { const a0 = acc / tot * TAU; acc += ws[i]; return { id, a0, a1: acc / tot * TAU }; });
    const sg = this.segs[this.ids.indexOf(o.skin)], mid = (sg.a0 + sg.a1) / 2 + (rnd() - 0.5) * (sg.a1 - sg.a0) * 0.6;
    this.target = TAU * 6 - mid;   // Zeiger oben: Segmentmitte nach oben drehen
    this.ang = 0; this.dur = 4.2; this.lastSeg = -1;
  }
  update(dt) {
    this.t += dt;
    if (this.state === 'spin') {
      const k = clamp(this.t / this.dur, 0, 1); this.ang = this.target * (1 - Math.pow(1 - k, 3));
      const pa = ((-this.ang) % TAU + TAU) % TAU, si = this.segs.findIndex(s => pa >= s.a0 && pa < s.a1);
      if (si !== this.lastSeg) { this.lastSeg = si; Sfx.play('tap'); buzz(8); }
      if (k >= 1) {
        this.state = 'won'; this.wt = 0; const sk = SKINS[this.o.skin];
        Sfx.play('win'); buzz([40, 60, 120]); FX.confetti(W / 2, H * 0.35, sk.rarity === 'legend' ? 140 : 80, 1.3);

      }
    } else this.wt += dt;
  }
  close() { if (overlay === this) overlay = null; this.done(); }
  draw(c) {
    c.fillStyle = 'rgba(16,28,18,.82)'; c.fillRect(0, 0, W, H);
    const land = W > H, R = Math.min(land ? H * 0.38 : W * 0.4, 230), cx = land && this.state === 'won' ? W * 0.3 : W / 2, cy = land ? H / 2 + 8 : H * 0.4;
    // Strahlen
    c.save(); c.translate(cx, cy); c.rotate(this.t * 0.4); for (let i = 0; i < 16; i++) { c.rotate(TAU / 16); polyPath(c, [[0, 0], [R * 1.6, -R * 0.1], [R * 1.6, R * 0.1]]); c.fillStyle = 'rgba(255,214,10,.10)'; c.fill(); } c.restore();
    c.save(); c.translate(cx, cy); c.rotate(this.ang - Math.PI / 2);
    this.segs.forEach((sg, i) => {
      const sk = SKINS[sg.id], col = sk.rarity === 'legend' ? '#ffc300' : sk.rarity === 'rare' ? '#74c0fc' : (i % 2 ? '#fbf8f2' : BRAND.apricot);
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, sg.a0, sg.a1); c.closePath(); fs(c, col, 3);
      const m = (sg.a0 + sg.a1) / 2; c.save(); c.translate(Math.cos(m) * R * 0.62, Math.sin(m) * R * 0.62); c.rotate(m + Math.PI / 2);
      drawAnimal(c, this.o.kind, 0, 18, R / 120, { look: sk, cap: true, noShadow: true, t: this.t });
      c.restore();
    });
    ell(c, 0, 0, R, R); c.lineWidth = 8; c.strokeStyle = BRAND.olive; c.stroke();
    for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU; ell(c, Math.cos(a) * (R - 2), Math.sin(a) * (R - 2), 4, 4); c.fillStyle = i % 2 ? '#fff' : '#ffd60a'; c.fill(); }
    c.restore();
    ell(c, cx, cy, R * 0.16, R * 0.16); fs(c, BRAND.olive, 4); leaf(c, cx, cy, R * 0.02 + 1.2);
    polyPath(c, [[cx - 16, cy - R - 22], [cx + 16, cy - R - 22], [cx, cy - R + 8]]); fs(c, '#ef476f', 4);
    if (this.state === 'won') {
      const sk = SKINS[this.o.skin], k = ease.back(clamp(this.wt * 2.5, 0, 1));
      const px = land ? W * 0.72 : W / 2, py = land ? H / 2 : H * 0.8, pw = Math.min(land ? W * 0.42 : W - 30, 380);
      c.save(); c.translate(px, py); c.scale(k, k);
      const ph = sk.ability ? 250 : 190;
      panel(c, -pw / 2, -ph / 2, pw, ph, '#fbf8f2', 22);
      const rc = RARITY[sk.rarity];
      rrPath(c, -60, -ph / 2 - 16, 120, 32, 16); fs(c, rc.col, 3); txt(c, rc.name, 0, -ph / 2, 16, sk.rarity === 'common' ? BRAND.olive : '#fff', 'center', sk.rarity === 'common' ? null : BRAND.ink);
      drawAnimal(c, this.o.kind, -pw / 2 + 64, ph / 2 - 30, 1.6, { look: sk, cap: true, t: this.t });
      txt(c, sk.name, -pw / 2 + 126, -ph / 2 + 44, 18, BRAND.olive, 'left', null);
      txt(c, this.o.newSkin ? 'Neu im Kleiderschrank!' : 'Den hattest du schon.', -pw / 2 + 126, -ph / 2 + 70, 14, '#6b5a48', 'left', null);
      if (sk.ability) {
        const A = ABILITIES[sk.ability];
        rrPath(c, -pw / 2 + 120, -ph / 2 + 88, pw - 136, 26, 13); fs(c, '#ffd60a', 2); txt(c, 'Fähigkeit: ' + A.name, -pw / 2 + 132, -ph / 2 + 101, 14, BRAND.ink, 'left', null);
        wrapLines(c, A.text, pw - 140, 13).forEach((l, i) => txt(c, l, -pw / 2 + 122, -ph / 2 + 134 + i * 18, 13, '#3d2c1f', 'left', null));
      }
      c.restore();
      if (this.wt > 1) roundBtn(c, px, py + (sk.ability ? 125 : 95) * k + 6, 30, '#06d6a0', 'play', () => this.close());
    } else txt(c, 'Glücksrad!', W / 2, Math.max(28, cy - R - 44), 26, '#fff', 'center', BRAND.olive);
  }
  down() {} move() {} up() {}
}

// ---------- Stage geschafft: neues Ausrüstungsteil + zufälliger Skin ----------
class ClearOverlay {
  constructor(o, done) { this.o = o; this.done = done; this.t = 0; FX.confetti(W / 2, H * 0.3, 90, 1.2); Sfx.play('win'); }
  update(dt) { this.t += dt; if (this.t > 0.5 && Math.floor(this.t * 2) !== Math.floor((this.t - dt) * 2) && this.t < 4) FX.confetti(rnd() * W, H * 0.2, 20); }
  close(again) { if (overlay === this) overlay = null; this.done(again); }
  draw(c) {
    const o = this.o, t = this.t;
    c.fillStyle = 'rgba(16,28,18,.75)'; c.fillRect(0, 0, W, H);
    // im flachen Querformat: auf eine virtuelle Höhe von 700 skalieren
    const HH = Math.max(H, 700), sk = H / HH;
    c.save(); c.translate(W / 2, 0); c.scale(sk, sk); c.translate(-W / 2, 0);
    const cx = W / 2, cy = HH * 0.38, R = Math.min(W, HH) * 0.42;
    c.save(); c.translate(cx, cy); c.rotate(t * 0.3);
    for (let i = 0; i < 12; i++) { c.rotate(TAU / 12); polyPath(c, [[0, 0], [R, -R * 0.12], [R, R * 0.12]]); c.fillStyle = 'rgba(255,214,10,.16)'; c.fill(); }
    c.restore();
    const k = ease.back(clamp(t * 2, 0, 1));
    c.save(); c.translate(cx, cy); c.scale(k, k);
    ell(c, 0, 0, 92, 92); fs(c, '#fff7e6', 5);
    drawAnimal(c, o.kind, 0, 60, 2.7, { t, cap: true, look: SKINS[o.skin] });
    if (o.newSkin) { c.save(); c.translate(70, -70); c.rotate(0.3); starPath(c, 0, 0, 30, 15, 8); fs(c, '#ef476f', 3); txt(c, 'NEU', 0, 1, 14, '#fff', 'center', null); c.restore(); }
    c.restore();
    for (let s = 0; s < 3; s++) { const kk = ease.back(clamp(t * 2 - 0.4 - s * 0.2, 0, 1)); c.save(); c.translate(cx + (s - 1) * 56, cy - 122 - (s === 1 ? 14 : 0)); c.scale(kk, kk); icon(c, 'star', 0, 0, s === 1 ? 54 : 44); c.restore(); }
    drawLogo(c, cx, Math.max(56, cy - 200), Math.min(220, W - 80), true);
    if (t > 1.2) { claimBand(c, 'Bereich geschafft – du bist ein echter Original-Helfer!', cx, cy + 196, 16); }
    const ry = cy + 128, kk = ease.back(clamp(t * 2 - 1, 0, 1));
    c.save(); c.translate(cx, ry); c.scale(kk, kk);
    panel(c, -150, -34, 300, 76, '#fff7e6', 20);
    if (o.newPiece) { ell(c, -110, 4, 26, 26); fs(c, '#ffd166', 3); drawOutfitIcon(c, 'kappe', -110, 4, 34); }
    icon(c, 'hanger', -40, 4, 32);
    for (let i = 0; i < 6; i++) { ell(c, 0 + i * 22, 4, 8, 8); fs(c, i < o.have ? '#06d6a0' : '#dee2e6', 2); }
    c.restore();
    if (t > 1.4) {
      roundBtn(c, cx - 60, HH - 80, 34, '#06d6a0', 'retry', () => this.close(true));
      roundBtn(c, cx + 60, HH - 80, 34, '#ffd166', 'home', () => this.close(false));
    }
    c.restore();
  }
  down() {} move() {} up() {}
}

// ---------- Start, Spielschleife, Eingabe ----------
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1, scene = null, overlay = null, last = performance.now();
// Leistung: Auflösung max. 2x, bei ruckelnden Geräten automatisch etwas niedriger
const Perf = { cap: 2, acc: 0, n: 0, slow: 0 };
const TOUCH = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
let frozen = null, frozenFor = null;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, Perf.cap);
  frozenFor = null;
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
}
function setScene(s) { Voice.stop(); Music.stop(); scene = s; overlay = null; passInput.style.display = 'none'; if (!['NewAccount', 'LoginScene', 'MultiScene'].includes(s.constructor.name)) nameInput.style.display = 'none'; if (s.enter) s.enter(); }
// Hochformat auf dem Handy: bitte drehen (das Spiel ist fürs Querformat gemacht)
function drawRotate(c, t) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BRAND.olive); g.addColorStop(1, '#5a7a4a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  drawLogo(c, W / 2, H * 0.2, Math.min(240, W * 0.6), true);
  const a = (Math.sin(t * 1.6) * 0.5 + 0.5) * Math.PI / 2;
  c.save(); c.translate(W / 2, H * 0.48); c.rotate(-a);
  rrPath(c, -40, -70, 80, 140, 14); fs(c, '#fbf8f2', 5, BRAND.ink); rrPath(c, -30, -56, 60, 104, 6); fs(c, '#9fd3e6', 2, BRAND.ink);
  drawAnimal(c, 'dog', 0, 34, 1.1, { t, noShadow: true }); c.restore();
  c.beginPath(); c.arc(W / 2, H * 0.48, 105, -2.6, -1.2); c.lineWidth = 6; c.strokeStyle = BRAND.lime; c.stroke();
  polyPath(c, [[W / 2 + 40, H * 0.48 - 110], [W / 2 + 58, H * 0.48 - 92], [W / 2 + 28, H * 0.48 - 88]]); c.fillStyle = BRAND.lime; c.fill();
  txt(c, 'Bitte dreh dein Handy', W / 2, H * 0.72, 24, '#fff', 'center', BRAND.ink);
  txt(c, 'ins Querformat', W / 2, H * 0.72 + 32, 24, '#fff', 'center', BRAND.ink);
}
// Auf Android: Vollbild + Querformat festhalten (iPhone erlaubt das nicht, dort hilft der Hinweis)
let triedLock = false;
function tryLandscape() {
  if (triedLock || !TOUCH) return; triedLock = true;
  const el = document.documentElement, rq = el.requestFullscreen || el.webkitRequestFullscreen;
  try {
    const pr = rq ? rq.call(el, { navigationUI: 'hide' }) : null;
    const lock = () => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (e) { /* egal */ } };
    if (pr && pr.then) pr.then(lock).catch(() => {}); else lock();
  } catch (e) { /* egal */ }
}
let rotT = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); UI.next = [];
  if (Music.on && !(overlay instanceof GameOverlay)) Music.stop();
  // Leistung messen: dauerhaft unter ~45 Bildern/s -> Auflösung senken
  Perf.acc += (now - (frame.prev || now)) / 1000; frame.prev = now; Perf.n++;
  if (Perf.acc > 2) { const avg = Perf.acc / Perf.n; if (avg > 0.022 && Perf.cap > 1.01 && document.visibilityState === 'visible') { Perf.cap = Math.max(1, Perf.cap - 0.25); resize(); } Perf.acc = 0; Perf.n = 0; }
  if (TOUCH && H > W && !(scene && scene.portraitOk)) { rotT += dt; try { drawRotate(ctx, rotT); } catch (e) { console.error(e); } UI.flip(); requestAnimationFrame(frame); return; }
  try {
    // Während Minispielen/Dialogen: Hintergrund einfrieren statt ständig neu zu zeichnen
    const freeze = overlay && overlay.freezeBg;
    if (freeze && frozenFor === overlay) {
      scene.update(dt);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(frozen, 0, 0); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    } else {
      scene.update(dt); scene.draw(ctx);
      if (freeze) {
        if (!frozen) frozen = document.createElement('canvas');
        if (frozen.width !== cv.width || frozen.height !== cv.height) { frozen.width = cv.width; frozen.height = cv.height; }
        const fc = frozen.getContext('2d'); fc.setTransform(1, 0, 0, 1, 0, 0); fc.clearRect(0, 0, frozen.width, frozen.height); fc.drawImage(cv, 0, 0); frozenFor = overlay;
      }
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (overlay) { UI.next = []; overlay.update(dt); if (overlay) overlay.draw(ctx); }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    FX.update(dt); FX.draw(ctx);
    if (typeof drawToasts === 'function') drawToasts(ctx, dt);
    // Jeder Fingertipp bekommt sofort einen Ring (Rückmeldung unter 0,1 s)
    for (let i = TAPS.length - 1; i >= 0; i--) { const q = TAPS[i]; q.t += dt; if (q.t > 0.35) { TAPS.splice(i, 1); continue; } const k = q.t / 0.35; ell(ctx, q.x, q.y, 10 + k * 26, 10 + k * 26); ctx.lineWidth = 4 * (1 - k); ctx.strokeStyle = `rgba(255,255,255,${0.85 * (1 - k)})`; ctx.stroke(); }
  } catch (e) { console.error(e); }
  UI.flip();
  requestAnimationFrame(frame);
}
const swallowed = new Set(), TAPS = [];
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); TAPS.push({ x: e.clientX, y: e.clientY, t: 0 });
  try { if (Sfx.on()) Sfx.ctx(); } catch (err) { /* Audio erst nach einer Berührung erlaubt (iPhone) */ }
  tryLandscape();
  if (TOUCH && H > W && !(scene && scene.portraitOk)) return;
  try { cv.setPointerCapture(e.pointerId); } catch (err) { /* egal */ }
  const b = UI.hit(e.clientX, e.clientY);
  if (b) { swallowed.add(e.pointerId); Sfx.play('tap'); b.fn(); return; }
  const tgt = overlay || scene; if (tgt && tgt.down) tgt.down(e.clientX, e.clientY, e.pointerId);
});
cv.addEventListener('pointermove', e => {
  if (swallowed.has(e.pointerId)) return;
  const tgt = overlay || scene; if (tgt && tgt.move) tgt.move(e.clientX, e.clientY, e.pointerId);
});
const endPtr = e => {
  if (swallowed.has(e.pointerId)) { swallowed.delete(e.pointerId); return; }
  const tgt = overlay || scene; if (tgt && tgt.up) tgt.up(e.clientX, e.clientY, e.pointerId);
};
cv.addEventListener('pointerup', endPtr);
cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => { if (document.hidden && Save.data) { Save.write(); Net.syncNow(true); } });

// Diese Fenster decken das Spiel ab: Hintergrund einfrieren spart viel Rechenzeit
[GameOverlay, QuestDialog, Wardrobe, ClearOverlay, WheelOverlay, CodePad, AccountPanel, AdminPanel, ConfirmDialog, MsgDialog].forEach(K => { K.prototype.freezeBg = true; });

Save.load();
resize();
if (Save.data.seenTrailer) ensureProfile();
const firstScene = () => (!Save.data.seenTrailer ? new Trailer() : ACC() ? new Menu() : new Accounts());
setScene(needsInstallGuide() ? new InstallGuide(() => setScene(firstScene())) : firstScene());
requestAnimationFrame(frame);
