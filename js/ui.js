'use strict';
// ---------- Menü, Stage-Karte, Shop, Stage-Abschluss, Start ----------
const DIFFS = [
  { id: 'easy', stars: 1, age: '6–8', col: '#ffd6a5' },
  { id: 'medium', stars: 2, age: '9–11', col: '#caffbf' },
  { id: 'hard', stars: 3, age: '12–14', col: '#ffc8c8' },
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
function logo(c, x, y, s) {
  txt(c, 'Mission:', x, y - 34 * s, 26 * s, '#fff');
  c.save(); c.translate(x, y + 8 * s); c.rotate(-0.03);
  txt(c, 'Im Original', 0, 0, 50 * s, '#ffd23f');
  c.restore();
}
function soundBtn(c, x, y) {
  const a = ACC(), on = !!(a && a.sound);
  roundBtn(c, x, y, 22, on ? '#d0ebff' : '#e9ecef', on ? 'sound' : 'mute', () => { if (!a) return; a.sound = !a.sound; Save.write(); Sfx.play('tap'); });
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
  enter() { FX.clear(); if (!ACC()) setScene(new Accounts()); }
  update(dt) { this.t += dt; }
  draw(c) {
    skyBg(c);
    const a = ACC(); if (!a) return;
    const ls = clamp(Math.min(W / 420, H / 760), 0.7, 1.4);
    logo(c, W / 2, Math.max(132, H * 0.15), ls);
    accountChip(c, 12, 14, a, () => { overlay = new AccountPanel(); });
    soundBtn(c, W - 40, 40);
    roundBtn(c, W - 92, 40, 22, '#fff', 'play', () => setScene(new Trailer()), '#ef476f');
    const wide = W > H * 0.95;
    const top = Math.max(132, H * 0.15) + 66 * ls, bottom = H - 24;
    DIFFS.forEach((d, i) => {
      let x, y, w, h;
      if (wide) { w = Math.min(240, (W - 80) / 3); h = Math.min(bottom - top, w * 1.35); x = W / 2 + (i - 1) * (w + 20) - w / 2; y = top + (bottom - top - h) / 2; }
      else { w = Math.min(W - 40, 400); h = Math.min(190, (bottom - top - 28) / 3); x = (W - w) / 2; y = top + i * (h + 14); }
      const bob = Math.sin(this.t * 2 + i) * 2;
      panel(c, x, y + bob, w, h, d.col, 24);
      const kind = ANIMAL_OF[d.id], sp = SP(d.id, 'spielplatz');
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
      UI.btn(x, y + bob, w, h, () => { Sfx.play('good'); setScene(new StageMap(d.id)); });
    });
  }
}

// ---------- Konten: jedes Kind hat sein eigenes (Fantasiename + Bilder-Code, keine E-Mail) ----------
const nameInput = document.createElement('input');
Object.assign(nameInput.style, { position: 'fixed', display: 'none', font: `900 22px ${FONT}`, textAlign: 'center', border: '4px solid #2b1d14', borderRadius: '16px', padding: '8px', background: '#fff', color: '#2b1d14', outline: 'none', zIndex: 5, boxSizing: 'border-box', touchAction: 'manipulation' });
nameInput.maxLength = 14; nameInput.autocomplete = 'off'; nameInput.spellcheck = false; nameInput.placeholder = 'Fantasiename';
document.body.appendChild(nameInput);
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
    logo(c, W / 2, 96 * ls, ls);
    const list = Object.entries(Save.data.accounts).sort((a, b) => b[1].created - a[1].created);
    const cols = W > 600 ? 3 : 2, cw = Math.min(170, (W - 40) / cols - 12), ch = 150;
    const all = list.concat([['new', null], ['login', null]]);
    const x0 = W / 2 - (cols * (cw + 12) - 12) / 2, y0 = 170 * ls;
    all.forEach(([id, a], i) => {
      const x = x0 + (i % cols) * (cw + 12), y = y0 + Math.floor(i / cols) * (ch + 12);
      if (y > H - 40) return;
      panel(c, x, y, cw, ch, a ? '#fff7e6' : id === 'new' ? '#caffbf' : '#bde0fe', 22);
      if (a) {
        ell(c, x + cw / 2, y + 52, 36, 36); fs(c, '#d8f3dc', 3);
        drawCritter(c, AVATARS[a.avatar % 6], x + cw / 2, y + 82, 1.1, this.t + i, { noShadow: true });
        txt(c, a.name, x + cw / 2, y + 112, 17, '#3d2c1f', 'center', null);
        icon(c, 'hanger', x + cw / 2 - 22, y + 134, 16); txt(c, totalSkins(a) + '/108', x + cw / 2 + 8, y + 135, 14, '#8d5a3b', 'center', null);
        UI.btn(x, y, cw, ch, () => { overlay = new CodePad({ acc: a, check: code => code.join() === a.code.join(), onDone: () => { Save.data.current = id; Save.write(); Sfx.play('win'); Net.refresh(); setScene(new Menu()); } }); });
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
  close() { if (overlay === this) overlay = null; }
  draw(c) {
    const lines = wrapLines(c, this.o.text, Math.min(W - 30, 380) - 48, 18);
    const w = Math.min(W - 30, 380), h = 150 + lines.length * 25, x = (W - w) / 2, y = (H - h) / 2;
    c.fillStyle = 'rgba(16,28,18,.7)'; c.fillRect(0, 0, W, H);
    panel(c, x, y, w, h, '#fff7e6', 24);
    icon(c, 'trash', W / 2, y + 40, 40);
    lines.forEach((l, i) => txt(c, l, W / 2, y + 86 + i * 25, 18, '#3d2c1f', 'center', null));
    roundBtn(c, W / 2 - 60, y + h - 10, 28, '#ced4da', 'cross', () => this.close());
    roundBtn(c, W / 2 + 60, y + h - 10, 28, '#ef476f', 'check', () => { this.close(); this.o.onYes(); });
  }
  down() {} move() {} up() {}
}
class MsgDialog {
  constructor(o) { this.o = o; this.t = 0; }
  update(dt) { this.t += dt; }
  close() { if (overlay === this) overlay = null; if (this.o.onClose) this.o.onClose(); }
  draw(c) {
    const lines = wrapLines(c, this.o.text, Math.min(W - 30, 380) - 48, 18);
    const w = Math.min(W - 30, 380), h = 90 + lines.length * 25, x = (W - w) / 2, y = (H - h) / 2;
    c.fillStyle = 'rgba(16,28,18,.6)'; c.fillRect(0, 0, W, H);
    panel(c, x, y, w, h, '#fff7e6', 24);
    lines.forEach((l, i) => txt(c, l, W / 2, y + 40 + i * 25, 18, '#3d2c1f', 'center', null));
    if (this.o.wait) { for (let i = 0; i < 3; i++) { ell(c, W / 2 + (i - 1) * 22, y + h - 28, 6, 6); c.fillStyle = `rgba(17,138,178,${0.3 + 0.7 * Math.max(0, Math.sin(this.t * 6 - i))})`; c.fill(); } }
    else roundBtn(c, W / 2, y + h - 6, 26, '#06d6a0', 'check', () => this.close());
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
    panel(c, x, y, w, h, '#fff7e6', 26);
    roundBtn(c, x + w - 30, y + 30, 22, '#ced4da', 'cross', () => this.close());
    ell(c, W / 2, y + 62, 42, 42); fs(c, '#d8f3dc', 3); drawCritter(c, AVATARS[a.avatar % 6], W / 2, y + 100, 1.35, this.t, { noShadow: true });
    txt(c, a.name, W / 2, y + 132, 22, '#3d2c1f', 'center', null);
    const st = Net.status(a); ell(c, W / 2 - 70, y + 160, 6, 6); c.fillStyle = st.col; c.fill(); txt(c, st.text, W / 2 - 58, y + 161, 13, '#8d5a3b', 'left', null);
    txt(c, 'Dein Login-Code:', W / 2, y + 196, 15, '#8d5a3b', 'center', null);
    rrPath(c, W / 2 - 110, y + 210, 220, 44, 12); fs(c, '#fff', 3); txt(c, a.login || '–', W / 2, y + 233, 24, '#118ab2', 'center', null);
    txt(c, 'Dein Geheim-Code:', W / 2, y + 282, 15, '#8d5a3b', 'center', null);
    if (this.showCode) a.code.forEach((k, i) => { const cx = W / 2 + (i - 1.5) * 56; rrPath(c, cx - 23, y + 296, 46, 46, 12); fs(c, '#fff', 3); drawSym(c, k, cx, y + 319, 15); });
    else { rrPath(c, W / 2 - 110, y + 296, 220, 46, 12); fs(c, '#e9ecef', 3); txt(c, 'antippen zum Zeigen', W / 2, y + 320, 15, '#495057', 'center', null); UI.btn(W / 2 - 110, y + 296, 220, 46, () => { this.showCode = true; }); }
    const by = y + h - 56;
    rrPath(c, x + 20, by - 26, w / 2 - 30, 52, 18); fs(c, '#ffd166', 3); txt(c, 'Abmelden', x + 20 + (w / 2 - 30) / 2, by, 17, '#3d2c1f', 'center', null);
    UI.btn(x + 20, by - 26, w / 2 - 30, 52, () => { Net.syncNow(); Save.data.current = null; Save.write(); this.close(); setScene(new Accounts()); });
    rrPath(c, x + w / 2 + 10, by - 26, w / 2 - 30, 52, 18); fs(c, '#ffc8c8', 3); txt(c, 'Konto löschen', x + w / 2 + 10 + (w / 2 - 30) / 2, by, 17, '#9d0208', 'center', null);
    UI.btn(x + w / 2 + 10, by - 26, w / 2 - 30, 52, () => askDelete(Save.data.current, a));
  }
  down() {} move() {} up() {}
}

// Anmelden mit bestehendem Konto: Name + Geheim-Code ODER Login-Code
class LoginScene {
  constructor() { this.t = 0; this.mode = 'choose'; this.err = ''; this.busy = false; }
  enter() { FX.clear(); nameInput.value = ''; }
  update(dt) { this.t += dt; }
  leave(to) { nameInput.style.display = 'none'; nameInput.blur(); setScene(to); }
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
    roundBtn(c, 44, 44, 28, '#fff', 'back', () => (this.mode === 'choose' ? this.leave(new Accounts()) : this.setMode('choose')), '#ffd166');
    const w = Math.min(W - 28, 420), x = (W - w) / 2, y = 110;
    if (this.mode === 'choose') {
      nameInput.style.display = 'none';
      panel(c, x, y, w, 300, '#fff7e6', 26);
      icon(c, 'lock', W / 2, y + 46, 46);
      txt(c, 'Wie möchtest du dich anmelden?', W / 2, y + 96, 17, '#3d2c1f', 'center', null);
      const btn = (yy, label, col, fn) => { rrPath(c, x + 24, yy, w - 48, 58, 18); fs(c, col, 3); txt(c, label, W / 2, yy + 30, 18, '#3d2c1f', 'center', null); UI.btn(x + 24, yy, w - 48, 58, fn); };
      btn(y + 124, 'Mit Name + Geheim-Code', '#caffbf', () => this.setMode('name'));
      btn(y + 196, 'Mit Login-Code', '#bde0fe', () => this.setMode('code'));
      return;
    }
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
      else overlay = new CodePad({ acc: { name: v, avatar: 0 }, onDone: code => { this.busy = true; Net.call({ action: 'login', name: v, code }).then(r => this.done(r)); } });
    } : null); c.restore(); }
  }
}

class NewAccount {
  constructor() { this.t = 0; this.step = 'name'; this.avatar = Math.floor(rnd() * 6); this.err = ''; }
  enter() { FX.clear(); nameInput.value = ''; nameInput.placeholder = 'Fantasiename'; nameInput.maxLength = 14; }
  update(dt) { this.t += dt; }
  leave(to) { nameInput.style.display = 'none'; nameInput.blur(); setScene(to); }
  async register(code) {
    this.step = 'wait';
    const r = await Net.call({ action: 'register', name: this.name, code, avatar: this.avatar });
    if (r && r.status === 200) { adoptAccount(r.data); this.step = 'done'; Sfx.play('win'); FX.confetti(W / 2, 200, 50); return; }
    const e = r && r.data && r.data.error;
    this.err = !r ? 'Keine Verbindung zum Server. Bitte Internet prüfen und nochmal versuchen.' : e === 'name_taken' ? 'Diesen Namen gibt es schon. Denk dir einen anderen aus!' : 'Das hat nicht geklappt. Bitte nochmal versuchen.';
    this.step = 'name'; Sfx.play('bad');
  }
  draw(c) {
    skyBg(c);
    roundBtn(c, 44, 44, 28, '#fff', 'back', () => this.leave(new Accounts()), '#ffd166');
    const w = Math.min(W - 28, 420), x = (W - w) / 2, y = 100;
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
      roundBtn(c, W / 2, y + 380, 34, '#06d6a0', 'play', () => this.leave(new Menu()));
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

class StageMap {
  constructor(diff) { this.diff = diff; this.t = 0; }
  enter() { FX.clear(); }
  update(dt) { this.t += dt; }
  draw(c) {
    c.fillStyle = '#6f9a52'; c.fillRect(0, 0, W, H);
    const d = DIFFS.find(q => q.id === this.diff), kind = ANIMAL_OF[this.diff];
    topBar(c, () => setScene(new Menu()));
    for (let s = 0; s < d.stars; s++) icon(c, 'star', 96 + s * 30, 44, 28);
    const bx = 14, by = 84, bw = W - 28, bh = H - by - 116;
    const nodes = drawGrounds(c, bx, by, bw, bh, { t: this.t, kind });
    const spp = SP(this.diff, 'spielplatz'), sp = spp.run ? Object.assign({ clears: spp.clears }, spp.run) : { clears: spp.clears }, n = nodes.spielplatz;
    txt(c, spp.skins.length + '/6', n.x + n.R + 18, n.y + 30, 14, '#fff');
    const ids = ALL_IDS;
    ids.forEach((id, k) => { const done = sp && sp.done && sp.done[id]; ell(c, n.x + (k - 2.5) * 13, n.y + n.R + 14, 5, 5); fs(c, done ? '#06d6a0' : 'rgba(255,255,255,.8)', 2); });
    if (sp && sp.clears) icon(c, 'crown', n.x, n.y - n.R - 12, 28);
    drawAnimal(c, kind, n.x - n.R - 22, n.y + n.R * 0.7, 1.35, { t: this.t, cap: hasCap(kind) });
    icon(c, 'play', n.x + n.R + 18, n.y, 30, '#06d6a0');
    UI.btn(n.x - n.R - 50, n.y - n.R - 14, n.R * 2 + 90, n.R * 2 + 34, () => { Sfx.play('good'); setScene(new Play(this.diff)); });
    // Outfit-Leiste: was der Helfer schon hat
    const ow = Math.min(W - 120, 330), ox = W / 2 - ow / 2 + 30, oy = H - 70;
    panel(c, ox - 64, oy - 30, ow + 64, 60, '#fff7e6', 22);
    drawAnimal(c, kind, ox - 34, oy + 24, 0.95, { t: this.t, cap: hasCap(kind), noShadow: true });
    STAGE_ORDER.forEach((id, i) => {
      const x = ox + (i + 0.5) * (ow / 6), got = id === 'spielplatz' && hasCap(kind);
      ell(c, x, oy, 20, 20); fs(c, got ? '#ffd166' : '#e9ecef', 2.5); drawOutfitIcon(c, OUTFIT_OF[id], x, oy, 28, !got);
    });
    roundBtn(c, W - 40, H - 136, 28, '#ffd166', 'hanger', () => { overlay = new Wardrobe(this.diff); });
  }
}

// ---------- Trailer: die Geschichte "Der neue Helfer" ohne Worte ----------
class Trailer {
  constructor() { this.t = 0; this.cuts = [0, 4.5, 10.5, 16.5, 21, 25.5]; }
  enter() { FX.clear(); }
  end() { Save.data.seenTrailer = true; Save.write(); setScene(ACC() ? new Menu() : new Accounts()); }
  scene() { let i = 0; while (i < this.cuts.length - 1 && this.t >= this.cuts[i + 1]) i++; return i; }
  update(dt) {
    const s0 = this.scene(); this.t += dt; const s1 = this.scene();
    if (this.t >= this.cuts[this.cuts.length - 1]) this.end();
    if (s1 === 1 && s0 === 1 && this.t > 8 && this.t - dt <= 8) { const k = this.k(); FX.sparkle(W / 2 - 60 * k, H * 0.62, 24, '#80ed99'); Sfx.play('good'); }
    if (s1 === 3 && this.t > 18.6 && this.t - dt <= 18.6) { FX.sparkle(W * 0.62, H * 0.5, 22); Sfx.play('good'); }
    if (s1 === 4 && this.t > 22.6 && this.t - dt <= 22.6) { FX.confetti(W / 2, H * 0.4, 40); Sfx.play('win'); }
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
      const pos = [['hase', 0.18, 0.32], ['fuchs', 0.82, 0.28], ['igel', 0.2, 0.82], ['waschbaer', 0.85, 0.8], ['eule', 0.5, 0.2]];
      pos.forEach(([id, x, y], i) => {
        const pk = ease.back(clamp(lt * 2 - i * 0.4, 0, 1)); if (pk <= 0) return;
        drawCritter(c, id, W * x, H * y, 1.3 * k * pk, t, { wave: true });
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
    c.fillStyle = `rgba(0,0,0,${1 - fade})`; c.fillRect(0, 0, W, H);
    // Fortschritt + Überspringen
    for (let i = 0; i < 5; i++) { ell(c, cx + (i - 2) * 18, H - 24, 5, 5); fs(c, i <= s ? '#fff' : 'rgba(255,255,255,.35)', 2); }
    roundBtn(c, W - 40, 40, 26, '#fff', 'play', () => this.end(), '#06d6a0');
    icon(c, 'play', W - 32, 40, 22, '#06d6a0');
  }
  down() { const s = this.scene(); if (s < this.cuts.length - 2) this.t = this.cuts[s + 1]; else this.end(); }
}

// ---------- Kleiderschrank: gesammelte Skins je Stage + Stufe ansehen und anziehen ----------
class Wardrobe {
  constructor(diff) { this.diff = diff; this.kind = ANIMAL_OF[diff]; this.stage = 'spielplatz'; this.t = 0; }
  update(dt) { this.t += dt; }
  close() { if (overlay === this) overlay = null; }
  draw(c) {
    c.fillStyle = 'rgba(16,28,18,.72)'; c.fillRect(0, 0, W, H);
    const w = Math.min(W - 20, 560), h = Math.min(H - 30, 660), x = (W - w) / 2, y = (H - h) / 2;
    panel(c, x, y, w, h, '#fff7e6', 26);
    roundBtn(c, x + w - 30, y + 30, 22, '#ced4da', 'cross', () => this.close());
    icon(c, 'hanger', x + 34, y + 32, 34);
    const d = DP(this.diff);
    txt(c, totalSkins() + '/108', x + 60, y + 33, 18, '#8d5a3b', 'left', null);
    // Stage-Reiter
    const tw = (w - 30) / 6;
    STAGE_ORDER.forEach((id, i) => {
      const tx = x + 15 + i * tw, sel = id === this.stage, open = OPEN_STAGES.includes(id);
      rrPath(c, tx + 3, y + 64, tw - 6, 52, 14); fs(c, sel ? '#ffd166' : '#e9ecef', 3);
      c.save(); if (!open) c.globalAlpha = 0.4; stageIcon(c, id, tx + tw / 2, y + 86, Math.min(34, tw * 0.55)); c.restore();
      const n = SP(this.diff, id).skins.length; txt(c, n + '/6', tx + tw / 2, y + 108, 11, '#3d2c1f', 'center', null);
      UI.btn(tx, y + 64, tw, 52, () => { this.stage = id; Sfx.play('tap'); });
    });
    const sp = SP(this.diff, this.stage), ids = stageSkins(this.stage, this.diff);
    const cols = 3, cw = (w - 30 - 2 * 10) / cols, ch = Math.min(170, (h - 200 - 10) / 2);
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
    if (!OPEN_STAGES.includes(this.stage)) { icon(c, 'hourglass', W / 2, y + 128 + ch, 44); }
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
    const cx = W / 2, cy = H * 0.38, R = Math.min(W, H) * 0.42;
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
    const ry = cy + 128, kk = ease.back(clamp(t * 2 - 1, 0, 1));
    c.save(); c.translate(cx, ry); c.scale(kk, kk);
    panel(c, -150, -34, 300, 76, '#fff7e6', 20);
    if (o.newPiece) { ell(c, -110, 4, 26, 26); fs(c, '#ffd166', 3); drawOutfitIcon(c, 'kappe', -110, 4, 34); }
    icon(c, 'hanger', -40, 4, 32);
    for (let i = 0; i < 6; i++) { ell(c, 0 + i * 22, 4, 8, 8); fs(c, i < o.have ? '#06d6a0' : '#dee2e6', 2); }
    c.restore();
    if (t > 1.4) {
      roundBtn(c, cx - 60, H - 80, 34, '#06d6a0', 'retry', () => this.close(true));
      roundBtn(c, cx + 60, H - 80, 34, '#ffd166', 'home', () => this.close(false));
    }
  }
  down() {} move() {} up() {}
}

// ---------- Start, Spielschleife, Eingabe ----------
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1, scene = null, overlay = null, last = performance.now();
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2.5);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
}
function setScene(s) { scene = s; overlay = null; if (!['NewAccount', 'LoginScene'].includes(s.constructor.name)) nameInput.style.display = 'none'; if (s.enter) s.enter(); }
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); UI.next = [];
  try {
    scene.update(dt); scene.draw(ctx);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (overlay) { UI.next = []; overlay.update(dt); if (overlay) overlay.draw(ctx); }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    FX.update(dt); FX.draw(ctx);
  } catch (e) { console.error(e); }
  UI.flip();
  requestAnimationFrame(frame);
}
const swallowed = new Set();
cv.addEventListener('pointerdown', e => {
  e.preventDefault();
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

Save.load();
resize();
setScene(!Save.data.seenTrailer ? new Trailer() : ACC() ? new Menu() : new Accounts());
requestAnimationFrame(frame);
