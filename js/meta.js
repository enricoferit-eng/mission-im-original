'use strict';
// ---------- Taler, Erfolge, Laden, Freunde, Mehrspieler ----------
// Taler verdient man mit Erfolgen und im Mehrspieler; ausgeben im Laden (Joker max. 3 pro Tag, Skins, neue Tiere).

function META(a = ACC()) {
  if (!a) return null;
  if (!a.meta) a.meta = {};
  const m = a.meta;
  m.coins = m.coins || 0; m.ach = m.ach || {}; m.st = m.st || {}; m.skins = m.skins || []; m.animals = m.animals || []; m.bank = m.bank || 0;
  return m;
}
const BASE_ANIMALS = ['cat', 'dog', 'lion'];
const SHOP_ANIMALS = [['bunny', 250], ['panda', 300], ['fox', 300]];
const JOKER_PRICE = 30, JOKERS_PER_DAY = 3;
function ownedAnimals() { const m = META(); return BASE_ANIMALS.concat(m ? m.animals : []); }

// ---- Erfolge ----
const ACHIEVEMENTS = [
  { id: 'erster', name: 'Erste Hilfe', desc: 'Hilf deinem ersten Kind.', coins: 10, stat: 'kids', need: 1 },
  { id: 'kinder25', name: 'Guter Freund', desc: 'Hilf 25 Kindern.', coins: 40, stat: 'kids', need: 25 },
  { id: 'spielplatz', name: 'Spielplatz-Held', desc: 'Schaffe den Spielplatz.', coins: 30, stat: 'clears', need: 1 },
  { id: 'profi', name: 'Drei-Sterne-Profi', desc: 'Schaffe den Spielplatz mit drei Sternen.', coins: 60 },
  { id: 'ohnejoker', name: 'Ganz ohne Joker', desc: 'Schaffe den Spielplatz, ohne einen Joker zu benutzen.', coins: 50 },
  { id: 'bonus1', name: 'Blitzschnell', desc: 'Hol dir einen Bonus-Joker mit der Bonus-Uhr.', coins: 15, stat: 'bonusJ', need: 1 },
  { id: 'bonus5', name: 'Bonus-Jäger', desc: 'Hol dir 5 Bonus-Joker.', coins: 40, stat: 'bonusJ', need: 5 },
  { id: 'sterne1', name: 'Volle Sterne', desc: 'Schaffe eine Aufgabe mit allen drei Tempo-Sternen.', coins: 10, stat: 'stars3', need: 1 },
  { id: 'sterne25', name: 'Sternen-Sammler', desc: 'Schaffe 25 Aufgaben mit drei Tempo-Sternen.', coins: 40, stat: 'stars3', need: 25 },
  { id: 'combo5', name: 'Combo-König', desc: 'Schaffe eine Combo x5.', coins: 20 },
  { id: 'blaetter', name: 'Blätter-Sammler', desc: 'Finde alle 8 Original-Blätter in einem Durchgang.', coins: 20 },
  { id: 'g_swing', name: 'Weitspringer', desc: 'Geheimnis: Spring von der Schaukel über 4 Meter weit.', coins: 20, secret: true },
  { id: 'g_race', name: 'Schneller als Leo', desc: 'Geheimnis: Gewinne den Wettlauf gegen Leo.', coins: 20, secret: true },
  { id: 'g_pigeons', name: 'Tauben-Schreck', desc: 'Geheimnis: Scheuch alle drei Tauben schnell hintereinander auf.', coins: 20, secret: true },
  { id: 'g_slide', name: 'Rutschen-Profi', desc: 'Geheimnis: Rutsch dreimal kurz hintereinander.', coins: 20, secret: true },
  { id: 'geheim', name: 'Alle Geheimnisse', desc: 'Finde alle vier Geheimnisse auf dem Spielplatz.', coins: 60 },
  { id: 'schaukel6', name: 'Überflieger', desc: 'Spring von der Schaukel über 6 Meter weit.', coins: 30 },
  { id: 'skins10', name: 'Modeprofi', desc: 'Sammle 10 Skins.', coins: 30 },
  { id: 'freund', name: 'Freundschaft', desc: 'Füge einen Freund hinzu.', coins: 15 },
  { id: 'duell1', name: 'Herausforderer', desc: 'Spiele ein Duell.', coins: 15, stat: 'duels', need: 1 },
  { id: 'sieg1', name: 'Duell-Sieger', desc: 'Gewinne ein Duell.', coins: 20, stat: 'wins', need: 1 },
  { id: 'sieg10', name: 'Champion', desc: 'Gewinne 10 Duelle.', coins: 80, stat: 'wins', need: 10 },
  { id: 'team1', name: 'Teamwork', desc: 'Schafft einen großen Auftrag zusammen.', coins: 25, stat: 'teams', need: 1 },
  { id: 'einkauf', name: 'Shopping-Tour', desc: 'Kauf etwas im Laden.', coins: 10 },
];
const SECRET_NAMES = { swing: 'Weitsprung von der Schaukel', race: 'Wettlauf gegen Leo gewonnen', pigeons: 'Alle Tauben aufgescheucht', slide: 'Dreimal schnell gerutscht', leaves: 'Alle Original-Blätter gefunden', bonus: 'Kind schnell geholfen' };
function achieve(id) {
  const a = ACC(), m = META(a); if (!m || m.ach[id]) return;
  const A = ACHIEVEMENTS.find(x => x.id === id); if (!A) return;
  m.ach[id] = Date.now(); m.coins += A.coins; Save.write();
  toast('Erfolg: ' + A.name, '+' + A.coins + ' Taler', 'trophy');
  if (['g_swing', 'g_race', 'g_pigeons', 'g_slide'].every(k => m.ach[k])) achieve('geheim');
}
function stat(key, inc = 1) {
  const m = META(); if (!m) return;
  m.st[key] = (m.st[key] || 0) + inc; Save.write();
  ACHIEVEMENTS.forEach(A => { if (A.stat === key && m.st[key] >= A.need) achieve(A.id); });
}
function addCoins(n, why) { const m = META(); if (!m) return; m.coins += n; Save.write(); toast(why, '+' + n + ' Taler', 'coin'); }

// ---- Einblendungen oben (Erfolge, Taler) ----
const TOASTS = [];
function toast(title, sub, ic = 'trophy') { TOASTS.push({ title, sub, ic, t: 0 }); Sfx.note(784, 0.15, 'triangle', 0.07, 1.3); setTimeout(() => Sfx.note(1047, 0.2, 'triangle', 0.07, 1.2), 120); }
function drawToasts(c, dt) {
  const q = TOASTS[0]; if (!q) return;
  q.t += dt; if (q.t > 3.2) { TOASTS.shift(); return; }
  const k = ease.back(clamp(q.t * 3, 0, 1)) * clamp((3.2 - q.t) * 3, 0, 1), w = Math.min(W - 30, 380), y = 12 + (k - 1) * 80;
  c.save(); c.globalAlpha = clamp(k, 0, 1);
  rrPath(c, W / 2 - w / 2, y, w, 58, 22); fs(c, '#fff7e6', 3); ell(c, W / 2 - w / 2 + 32, y + 29, 20, 20); fs(c, '#ffd166', 2.5); icon(c, q.ic, W / 2 - w / 2 + 32, y + 29, 26);
  txt(c, q.title, W / 2 - w / 2 + 62, y + 21, 16, BRAND.olive, 'left', null); txt(c, q.sub, W / 2 - w / 2 + 62, y + 41, 14, '#c9762f', 'left', null);
  c.restore();
}
function coinChip(c, x, y) {
  const m = META(); if (!m) return;
  c.font = `900 17px ${FONT}`; const w = c.measureText(String(m.coins)).width + 52;
  rrPath(c, x, y - 18, w, 36, 18); fs(c, '#fff7e6', 2.5); icon(c, 'coin', x + 18, y, 24); txt(c, String(m.coins), x + 36, y + 1, 17, '#8d5a3b', 'left', null);
  return w;
}

// ---- Joker-Bank (gekaufte Joker gelten in jedem Durchgang zusätzlich) ----
function jokerBank() { const m = META(); return m ? m.bank : 0; }

// ---------- Laden ----------
class Shop {
  constructor(back) { this.back = back || (() => setScene(new Menu())); this.t = 0; this.tab = 'joker'; this.msg = ''; this.msgT = 0; }
  enter() { FX.clear(); }
  update(dt) { this.t += dt; this.msgT = Math.max(0, this.msgT - dt); }
  say(m) { this.msg = m; this.msgT = 2.5; }
  buy(price, fn) { const m = META(); if (m.coins < price) { Sfx.play('bad'); this.say('Dafür fehlen dir noch ' + (price - m.coins) + ' Taler.'); return; } m.coins -= price; fn(m); Save.write(); Sfx.play('win'); FX.confetti(W / 2, H * 0.4, 40); achieve('einkauf'); }
  draw(c) {
    skyBg(c);
    const m = META(); if (!m) return;
    topBar(c, this.back);
    icon(c, 'shop', 104, 44, 40); txt(c, 'Laden', 130, 44, 24, '#fff', 'left', BRAND.olive);
    coinChip(c, W - 170, 44);
    const tabs = [['joker', 'Joker'], ['skins', 'Skins'], ['tiere', 'Tiere']], tw = Math.min(150, (W - 40) / 3);
    tabs.forEach(([id, name], i) => { const x = W / 2 + (i - 1) * (tw + 8) - tw / 2; rrPath(c, x, 80, tw, 40, 16); fs(c, this.tab === id ? '#ffd166' : '#fff', 3); txt(c, name, x + tw / 2, 101, 16, '#3d2c1f', 'center', null); UI.btn(x, 80, tw, 40, () => { this.tab = id; Sfx.play('tap'); }); });
    const top = 134, bottom = H - 16;
    if (this.tab === 'joker') {
      const today = new Date().toISOString().slice(0, 10); if (m.day !== today) { m.day = today; m.dayJ = 0; }
      const left = JOKERS_PER_DAY - m.dayJ, w = Math.min(W - 40, 420), x = (W - w) / 2, h = Math.min(bottom - top, 230);
      panel(c, x, top, w, h, '#fff7e6', 24);
      icon(c, 'joker', x + 70, top + 70, 80);
      txt(c, 'Extra-Joker', x + 130, top + 44, 22, BRAND.olive, 'left', null);
      txt(c, 'Gilt in jedem Durchgang zusätzlich.', x + 130, top + 70, 13, '#6b5a48', 'left', null);
      txt(c, 'Heute noch ' + left + ' von ' + JOKERS_PER_DAY, x + 130, top + 92, 14, left ? '#2b9348' : '#c1121f', 'left', null);
      txt(c, 'Du hast: ' + m.bank, x + 130, top + 114, 14, '#3d2c1f', 'left', null);
      const ok = left > 0, bx = x + w / 2, by = top + h - 44;
      c.save(); if (!ok) c.globalAlpha = 0.45; rrPath(c, bx - 100, by - 24, 200, 48, 20); fs(c, '#06d6a0', 3); icon(c, 'coin', bx - 60, by, 24); txt(c, JOKER_PRICE + ' Taler', bx + 10, by + 1, 18, '#fff', 'center', BRAND.ink); c.restore();
      UI.btn(bx - 100, by - 24, 200, 48, () => { if (!ok) { this.say('Morgen kannst du wieder Joker kaufen.'); Sfx.play('bad'); return; } this.buy(JOKER_PRICE, mm => { mm.bank++; mm.dayJ++; }); });
    } else if (this.tab === 'skins') {
      const cols = W > H ? 5 : 3, gap = 10, cw = Math.min(160, (W - 30 - gap * (cols - 1)) / cols), ch = Math.min(170, (bottom - top - gap) / Math.ceil(SHOP_SKINS.length / cols) - gap), x0 = (W - (cw * cols + gap * (cols - 1))) / 2;
      const kind = ACC().char || 'cat';
      SHOP_SKINS.forEach(([id, name, rarity, price], i) => {
        const x = x0 + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (ch + gap), own = m.skins.includes(id), sk = SKINS[id];
        rrPath(c, x, y, cw, ch, 16); fs(c, own ? '#d8f5e3' : '#fff', 3, rarity === 'legend' ? '#c9a227' : rarity === 'rare' ? '#118ab2' : OL);
        drawAnimal(c, kind, x + cw / 2, y + ch * 0.62, Math.min(1.5, ch / 110), { look: sk, cap: true, t: this.t + i });
        rrPath(c, x + 8, y + 6, cw - 16, 18, 9); c.fillStyle = RARITY[rarity].col; c.fill(); txt(c, RARITY[rarity].name + (sk.ability ? ' · ' + ABILITIES[sk.ability].name : ''), x + cw / 2, y + 16, 10, '#3d2c1f', 'center', null);
        txt(c, name, x + cw / 2, y + ch - 30, 12, '#3d2c1f', 'center', null);
        if (own) txt(c, 'gekauft', x + cw / 2, y + ch - 12, 12, '#2b9348', 'center', null);
        else { icon(c, 'coin', x + cw / 2 - 22, y + ch - 12, 16); txt(c, String(price), x + cw / 2 + 4, y + ch - 11, 13, '#8d5a3b', 'center', null); }
        UI.btn(x, y, cw, ch, () => { if (own) { this.say('Anziehen kannst du ihn im Kleiderschrank.'); return; } this.buy(price, mm => { mm.skins.push(id); this.say(name + ' liegt jetzt im Kleiderschrank.'); }); });
      });
    } else {
      const all = BASE_ANIMALS.map(k => [k, 0]).concat(SHOP_ANIMALS), cols = W > H ? 6 : 3, gap = 10, cw = Math.min(140, (W - 30 - gap * (cols - 1)) / cols), ch = Math.min(180, (bottom - top - gap) / Math.ceil(all.length / cols) - gap), x0 = (W - (cw * cols + gap * (cols - 1))) / 2;
      all.forEach(([k, price], i) => {
        const x = x0 + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (ch + gap), own = ownedAnimals().includes(k), cur = ACC().char === k;
        rrPath(c, x, y, cw, ch, 16); fs(c, cur ? '#d8f5e3' : '#fff', 3);
        drawAnimal(c, k, x + cw / 2, y + ch * 0.66, Math.min(1.7, ch / 100), { look: DEFAULT_LOOK, t: this.t + i, cap: false });
        txt(c, ANIMAL_NAMES[k], x + cw / 2, y + ch - 30, 15, '#3d2c1f', 'center', null);
        if (cur) txt(c, 'deine Figur', x + cw / 2, y + ch - 12, 12, '#2b9348', 'center', null);
        else if (own) txt(c, 'antippen = wählen', x + cw / 2, y + ch - 12, 11, '#6b5a48', 'center', null);
        else { icon(c, 'coin', x + cw / 2 - 22, y + ch - 12, 16); txt(c, String(price), x + cw / 2 + 4, y + ch - 11, 13, '#8d5a3b', 'center', null); }
        UI.btn(x, y, cw, ch, () => { if (own) { ACC().char = k; Save.write(); Sfx.play('good'); return; } this.buy(price, mm => { mm.animals.push(k); ACC().char = k; this.say(ANIMAL_NAMES[k] + ' ist jetzt deine Figur!'); }); });
      });
    }
    if (this.msgT > 0) { c.globalAlpha = clamp(this.msgT * 2, 0, 1); c.font = `900 15px ${FONT}`; const mw = c.measureText(this.msg).width + 30; rrPath(c, W / 2 - mw / 2, H - 52, mw, 36, 18); c.fillStyle = 'rgba(32,44,30,.92)'; c.fill(); txt(c, this.msg, W / 2, H - 34, 15, '#fff', 'center', null); c.globalAlpha = 1; }
  }
}

// ---------- Erfolge ansehen ----------
class Achievements {
  constructor(back) { this.back = back || (() => setScene(new Menu())); this.t = 0; this.scroll = 0; this.drag = null; }
  enter() { FX.clear(); }
  update(dt) { this.t += dt; }
  draw(c) {
    skyBg(c);
    const m = META(); if (!m) return;
    topBar(c, this.back);
    icon(c, 'trophy', 104, 44, 40); txt(c, 'Erfolge ' + Object.keys(m.ach).length + '/' + ACHIEVEMENTS.length, 130, 44, 22, '#fff', 'left', BRAND.olive);
    coinChip(c, W - 170, 44);
    const cols = W > 700 ? 2 : 1, gap = 10, cw = Math.min(420, (W - 30 - gap * (cols - 1)) / cols), ch = 64, x0 = (W - (cw * cols + gap * (cols - 1))) / 2, top = 84;
    const rows = Math.ceil(ACHIEVEMENTS.length / cols), maxScroll = Math.max(0, top + rows * (ch + gap) - H + 16);
    this.scroll = clamp(this.scroll, 0, maxScroll);
    c.save(); c.beginPath(); c.rect(0, top - 4, W, H - top + 4); c.clip();
    ACHIEVEMENTS.forEach((A, i) => {
      const x = x0 + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (ch + gap) - this.scroll, done = !!m.ach[A.id];
      if (y > H || y + ch < top - 4) return;
      rrPath(c, x, y, cw, ch, 18); fs(c, done ? '#fff7e6' : 'rgba(255,255,255,.75)', 3);
      ell(c, x + 32, y + ch / 2, 22, 22); fs(c, done ? '#ffd166' : '#dee2e6', 2.5); icon(c, done ? 'trophy' : (A.secret ? 'question' : 'lock'), x + 32, y + ch / 2, 26, done ? undefined : '#868e96');
      const hidden = A.secret && !done;
      txt(c, hidden ? 'Geheimer Erfolg' : A.name, x + 64, y + 22, 15, done ? BRAND.olive : '#495057', 'left', null);
      const desc = hidden ? 'Entdecke es selbst auf dem Spielplatz …' : A.desc + (A.stat && !done ? ' (' + Math.min(A.need, m.st[A.stat] || 0) + '/' + A.need + ')' : '');
      wrapLines(c, desc, cw - 140, 12).slice(0, 2).forEach((l, k) => txt(c, l, x + 64, y + 40 + k * 14, 12, '#6b5a48', 'left', null));
      icon(c, 'coin', x + cw - 50, y + ch / 2, 18); txt(c, String(A.coins), x + cw - 38, y + ch / 2 + 1, 14, '#8d5a3b', 'left', null);
      if (done) icon(c, 'check', x + cw - 14, y + 14, 16, '#06d6a0');
    });
    c.restore();
  }
  down(x, y) { this.drag = { y0: y, s0: this.scroll }; }
  move(x, y) { if (this.drag) this.scroll = this.drag.s0 - (y - this.drag.y0); }
  up() { this.drag = null; }
}

// ---------- Freunde + Mehrspieler ----------
const MP_COINS = { win: 30, lose: 5, team: 25 };
function needOnline(c, back) {
  const a = ACC();
  if (a && a.token) return false;
  const w = Math.min(W - 30, 420), h = 200, x = (W - w) / 2, y = (H - h) / 2;
  panel(c, x, y, w, h, '#fff7e6', 24);
  icon(c, 'friends', W / 2, y + 40, 44);
  wrapLines(c, 'Für Freunde und Mehrspieler brauchst du ein gesichertes Konto. Tippe auf „Spielstand sichern“.', w - 40, 15).forEach((l, i) => txt(c, l, W / 2, y + 84 + i * 20, 15, '#3d2c1f', 'center', null));
  rrPath(c, W / 2 - 110, y + h - 56, 220, 44, 18); fs(c, '#06d6a0', 3); txt(c, 'Spielstand sichern', W / 2, y + h - 33, 16, '#fff', 'center', BRAND.ink);
  UI.btn(W / 2 - 110, y + h - 56, 220, 44, () => setScene(new NewAccount({ migrate: Save.data.current })));
  return true;
}
function api(body) { const a = ACC(); return Net.call(Object.assign({ login: a.login, token: a.token }, body)); }

class MultiScene {
  constructor() { this.t = 0; this.data = null; this.err = ''; this.busy = false; this.mode = 'menu'; this.opts = { mode: 'duell', diff: CUR_DIFF || 'medium', kids: 3, boss: false, live: true }; this.pollT = 0; }
  enter() { FX.clear(); nameInput.value = ''; if (ACC() && ACC().token) this.refresh(); }
  async refresh() { const r = await api({ action: 'friends' }); if (r && r.status === 200) { this.data = r.data; this.err = ''; } else if (!r) this.err = 'Keine Verbindung zum Server.'; }
  update(dt) { this.t += dt; this.pollT += dt; if (this.pollT > 8 && ACC() && ACC().token) { this.pollT = 0; this.refresh(); } }
  leave(s) { nameInput.style.display = 'none'; nameInput.blur(); setScene(s); }
  async addFriend() {
    const v = nameInput.value.trim(); if (v.length < 2) return; nameInput.blur(); this.busy = true;
    const r = await api({ action: 'friend_add', name: v }); this.busy = false;
    if (r && r.status === 200) { this.data = r.data; this.mode = 'menu'; nameInput.value = ''; Sfx.play('win'); achieve('freund'); }
    else this.err = !r ? 'Keine Verbindung zum Server.' : r.data && r.data.error === 'self' ? 'Das bist du selbst!' : 'Ein Konto mit diesem Namen gibt es nicht.';
  }
  async create(invite) {
    this.busy = true; const r = await api({ action: 'lobby_new', opts: this.opts, invite: invite || null }); this.busy = false;
    if (r && r.status === 200) this.leave(new LobbyScene(r.data, this.opts.mode)); else this.err = 'Das hat nicht geklappt.';
  }
  async join(code) {
    this.busy = true; const r = await api({ action: 'lobby_join', code }); this.busy = false;
    if (r && r.status === 200) this.leave(new LobbyScene(r.data, r.data.opts.mode || 'duell')); else this.err = !r ? 'Keine Verbindung zum Server.' : r.status === 409 ? 'Dieses Spiel ist schon voll.' : 'Diesen Code gibt es nicht.';
  }
  draw(c) {
    skyBg(c);
    topBar(c, () => (this.mode === 'menu' ? this.leave(new Menu()) : (this.mode = 'menu', nameInput.style.display = 'none')));
    icon(c, 'friends', 104, 44, 40); txt(c, 'Freunde & Mehrspieler', 130, 44, 20, '#fff', 'left', BRAND.olive);
    if (needOnline(c)) return;
    const land = W > H, top = 86;
    if (this.mode === 'add' || this.mode === 'code') {
      const w = Math.min(W - 30, 420), x = (W - w) / 2, y = top + 10;
      panel(c, x, y, w, 220, '#fff7e6', 24);
      txt(c, this.mode === 'add' ? 'Name deines Freundes' : 'Spiel-Code (4 Buchstaben)', W / 2, y + 36, 17, '#3d2c1f', 'center', null);
      Object.assign(nameInput.style, { display: this.busy ? 'none' : 'block', left: (x + 24) + 'px', top: (y + 58) + 'px', width: (w - 48) + 'px', height: '52px' });
      nameInput.placeholder = this.mode === 'add' ? 'Fantasiename' : 'z. B. KLMP'; nameInput.maxLength = this.mode === 'add' ? 14 : 4;
      if (this.mode === 'code') nameInput.value = nameInput.value.toUpperCase();
      if (this.err) txt(c, this.err, W / 2, y + 132, 14, '#c1121f', 'center', null);
      const ok = !this.busy && nameInput.value.trim().length >= (this.mode === 'code' ? 4 : 2);
      c.save(); if (!ok) c.globalAlpha = 0.4; roundBtn(c, W / 2, y + 176, 30, '#06d6a0', 'check', ok ? () => (this.mode === 'add' ? this.addFriend() : this.join(nameInput.value.trim())) : null); c.restore();
      return;
    }
    nameInput.style.display = 'none';
    // links: Freunde + Einladungen, rechts: Spiel erstellen
    const lw = land ? Math.min(W * 0.42, 380) : W - 24, lx = 12, rx = land ? lx + lw + 12 : 12, rw = land ? W - rx - 12 : W - 24;
    const lh = land ? H - top - 12 : (H - top) * 0.45, rh = land ? H - top - 12 : H - top - lh - 24, ry = land ? top : top + lh + 12;
    panel(c, lx, top, lw, lh, '#fff7e6', 22);
    txt(c, 'Freunde', lx + 18, top + 24, 17, BRAND.olive, 'left', null);
    rrPath(c, lx + lw - 136, top + 8, 124, 32, 14); fs(c, '#caffbf', 2.5); txt(c, '+ hinzufügen', lx + lw - 74, top + 25, 13, '#2b9348', 'center', null);
    UI.btn(lx + lw - 136, top + 8, 124, 32, () => { this.mode = 'add'; this.err = ''; nameInput.value = ''; });
    const d = this.data;
    let yy = top + 52;
    if (d && d.invites && d.invites.length) d.invites.slice(-2).forEach(inv => {
      rrPath(c, lx + 10, yy, lw - 20, 44, 14); fs(c, '#ffd166', 2.5); txt(c, inv.from.name + ' lädt dich ein!', lx + 22, yy + 22, 14, '#3d2c1f', 'left', null);
      rrPath(c, lx + lw - 100, yy + 6, 80, 32, 12); fs(c, '#06d6a0', 2); txt(c, 'Mitspielen', lx + lw - 60, yy + 22, 12, '#fff', 'center', null); UI.btn(lx + lw - 100, yy + 6, 80, 32, () => this.join(inv.code)); yy += 52;
    });
    if (!d) txt(c, this.err || 'Lade …', lx + lw / 2, yy + 20, 14, '#6b5a48', 'center', null);
    else if (!d.friends.length) wrapLines(c, 'Noch keine Freunde. Füge Freunde mit ihrem Fantasienamen hinzu!', lw - 40, 13).forEach((l, i) => txt(c, l, lx + lw / 2, yy + 16 + i * 18, 13, '#6b5a48', 'center', null));
    else d.friends.slice(0, Math.floor((top + lh - yy) / 46)).forEach(f => {
      rrPath(c, lx + 10, yy, lw - 20, 40, 14); fs(c, '#fff', 2);
      drawCritter(c, AVATARS[(f.avatar || 0) % 6], lx + 30, yy + 36, 0.5, this.t, { noShadow: true });
      ell(c, lx + 46, yy + 12, 5, 5); c.fillStyle = f.online ? '#06d6a0' : '#adb5bd'; c.fill();
      txt(c, f.name, lx + 56, yy + 21, 14, '#3d2c1f', 'left', null);
      rrPath(c, lx + lw - 100, yy + 5, 80, 30, 12); fs(c, '#bde0fe', 2); txt(c, 'Einladen', lx + lw - 60, yy + 20, 12, '#3d2c1f', 'center', null);
      UI.btn(lx + lw - 100, yy + 5, 80, 30, () => this.create(f.login)); yy += 46;
    });
    // Spiel einstellen
    panel(c, rx, ry, rw, rh, '#fff7e6', 22);
    const o = this.opts, seg = (y, label, vals, cur, set) => {
      txt(c, label, rx + 16, y, 13, '#6b5a48', 'left', null); const bw = Math.min(110, (rw - 32) / vals.length - 6);
      vals.forEach(([v, name], i) => { const bx = rx + 16 + i * (bw + 6), sel = cur === v; rrPath(c, bx, y + 10, bw, 32, 12); fs(c, sel ? '#ffd166' : '#fff', 2.5); txt(c, name, bx + bw / 2, y + 27, 13, '#3d2c1f', 'center', null); UI.btn(bx, y + 10, bw, 32, () => { set(v); Sfx.play('tap'); }); });
    };
    seg(ry + 22, 'Modus', [['duell', 'Gegeneinander'], ['team', 'Zusammen']], o.mode, v => (o.mode = v));
    seg(ry + 74, 'Stufe', [['easy', '1 Stern'], ['medium', '2 Sterne'], ['hard', '3 Sterne']], o.diff, v => (o.diff = v));
    if (o.mode === 'duell') { seg(ry + 126, 'Wie viele Kinder?', [[1, '1'], [3, '3'], [5, 'alle 5']], o.kids, v => (o.kids = v)); seg(ry + 178, 'Tor am Ende · Gegner sehen', [['b', o.boss ? 'Tor: ja' : 'Tor: nein'], ['l', o.live ? 'live: ja' : 'live: nein']], null, v => (v === 'b' ? (o.boss = !o.boss) : (o.live = !o.live))); }
    else wrapLines(c, 'Ein großer gemeinsamer Auftrag: Was einer findet, zählt für beide. Zwei Sachen schafft ihr nur zusammen!', rw - 32, 13).forEach((l, i) => txt(c, l, rx + 16, ry + 140 + i * 18, 13, '#3d2c1f', 'left', null));
    const by = ry + rh - 34, bw2 = (rw - 42) / 2;
    rrPath(c, rx + 14, by - 22, bw2, 44, 16); fs(c, '#06d6a0', 3); txt(c, this.busy ? '…' : 'Spiel erstellen', rx + 14 + bw2 / 2, by, 15, '#fff', 'center', BRAND.ink); UI.btn(rx + 14, by - 22, bw2, 44, () => { if (!this.busy) this.create(); });
    rrPath(c, rx + 28 + bw2, by - 22, bw2, 44, 16); fs(c, '#bde0fe', 3); txt(c, 'Code eingeben', rx + 28 + bw2 * 1.5, by, 15, '#3d2c1f', 'center', null); UI.btn(rx + 28 + bw2, by - 22, bw2, 44, () => { this.mode = 'code'; this.err = ''; nameInput.value = ''; });
    if (this.err && this.mode === 'menu') txt(c, this.err, W / 2, H - 10, 13, '#c1121f', 'center', null);
  }
}

// Warteraum: Code zeigen, auf Mitspieler warten, Host startet
class LobbyScene {
  constructor(lobby, mode) { this.lob = lobby; this.mode = lobby.opts.mode || mode || 'duell'; this.t = 0; this.pollT = 0; this.me = null; this.started = false; }
  enter() { FX.clear(); this.poll(); }
  async poll(extra = {}) {
    const r = await api(Object.assign({ action: 'lobby_poll', code: this.lob.code }, extra));
    if (r && r.status === 200) { this.lob = r.data.lobby; this.me = r.data.me; if (this.lob.status === 'run' && !this.started) this.start(); if (this.lob.status === 'closed' && !this.started) { setScene(new MultiScene()); } }
  }
  start() { this.started = true; Sfx.play('win'); const m = new Match(this.lob, this.me); setScene(new Play(this.lob.opts.diff, { mp: m })); }
  update(dt) { this.t += dt; this.pollT += dt; if (this.pollT > 1.5) { this.pollT = 0; this.poll(); } }
  draw(c) {
    skyBg(c);
    topBar(c, () => { api({ action: 'lobby_poll', code: this.lob.code, leave: true }); setScene(new MultiScene()); });
    const w = Math.min(W - 30, 460), h = Math.min(H - 150, 290), x = (W - w) / 2, y = 76, py = y + Math.min(190, h - 60);
    panel(c, x, y, w, h, '#fff7e6', 24);
    txt(c, this.lob.opts.mode === 'team' ? 'Zusammen spielen' : 'Duell', W / 2, y + 30, 20, BRAND.olive, 'center', null);
    txt(c, 'Spiel-Code', W / 2, y + 62, 13, '#6b5a48', 'center', null);
    this.lob.code.split('').forEach((ch, i) => { const cx = W / 2 + (i - 1.5) * 52; rrPath(c, cx - 22, y + 74, 44, 52, 12); fs(c, '#fff', 3); txt(c, ch, cx, y + 101, 30, '#118ab2', 'center', null); });
    const ppl = [this.lob.host, this.lob.guest];
    ppl.forEach((p, i) => { const cx = W / 2 + (i ? 90 : -90), cy = py; ell(c, cx, cy - 10, 30, 30); fs(c, p ? '#d8f3dc' : '#e9ecef', 3); if (p) { drawCritter(c, AVATARS[(p.avatar || 0) % 6], cx, cy + 14, 0.9, this.t + i, { noShadow: true }); txt(c, p.name, cx, cy + 40, 14, '#3d2c1f', 'center', null); } else { const b = Math.sin(this.t * 4) * 3; txt(c, '?', cx, cy - 10 + b, 28, '#adb5bd', 'center', null); txt(c, 'wartet …', cx, cy + 40, 13, '#6b5a48', 'center', null); } });
    txt(c, this.lob.opts.mode === 'team' ? 'mit' : 'gegen', W / 2, py - 8, 14, '#6b5a48', 'center', null);
    if (this.me === 'host' && this.lob.guest) {
      const pu = 1 + Math.sin(this.t * 5) * 0.05; c.save(); c.translate(W / 2, y + h + 34); c.scale(pu, pu); rrPath(c, -110, -26, 220, 52, 22); fs(c, '#06d6a0', 3.5); txt(c, 'Los geht’s!', 0, 1, 20, '#fff', 'center', BRAND.ink); c.restore();
      UI.btn(W / 2 - 110, y + h + 8, 220, 52, () => this.poll({ start: true }));
    } else txt(c, this.me === 'guest' ? 'Warte, bis ' + this.lob.host.name + ' startet …' : 'Sag deinem Freund den Code!', W / 2, y + h + 30, 15, '#fff', 'center', BRAND.ink);
  }
}

// ---------- Laufendes Mehrspieler-Spiel: Fortschritt senden/abholen ----------
class Match {
  constructor(lob, me) { this.lob = lob; this.me = me; this.code = lob.code; this.seed = lob.seed; this.opts = lob.opts; this.mode = lob.opts.mode || 'duell'; this.other = null; this.otherName = (me === 'host' ? lob.guest : lob.host).name; this.prog = {}; this.lastOther = Date.now(); this.over = null; this.busy = false; this.t0 = Date.now(); this.timer = setInterval(() => this.sync(), 1200); }
  set(p) { Object.assign(this.prog, p); }
  async sync() {
    if (this.busy || this.over === 'done') return; this.busy = true;
    const r = await api({ action: 'lobby_poll', code: this.code, progress: this.prog }); this.busy = false;
    if (r && r.status === 200) {
      if (r.data.other) { if (!this.other || r.data.other.at !== this.other.at) this.lastOther = Date.now(); this.other = r.data.other; }
      if (r.data.lobby.status === 'closed' && r.data.lobby.left !== cleanL(ACC().login) && !this.over) this.over = 'left';
    }
    if (!this.over && Date.now() - this.lastOther > 45000) this.over = 'lost';   // Verbindung zum anderen weg
  }
  stop() { clearInterval(this.timer); this.over = this.over || 'done'; }
  leave() { api({ action: 'lobby_poll', code: this.code, leave: true }); this.stop(); }
}
const cleanL = l => String(l || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// Ergebnis-Fenster am Ende eines Mehrspieler-Spiels
class MatchResult {
  constructor(o) { this.o = o; this.t = 0; if (o.win || o.team) FX.confetti(W / 2, H * 0.3, 80); }
  update(dt) { this.t += dt; }
  draw(c) {
    c.fillStyle = 'rgba(16,28,18,.72)'; c.fillRect(0, 0, W, H);
    const o = this.o, w = Math.min(W - 30, 420), h = 280, x = (W - w) / 2, y = (H - h) / 2, k = ease.back(clamp(this.t * 3, 0, 1));
    c.save(); c.translate(W / 2, H / 2); c.scale(k, k); c.translate(-W / 2, -H / 2);
    panel(c, x, y, w, h, '#fff7e6', 26);
    icon(c, o.win || o.team ? 'trophy' : 'friends', W / 2, y + 56, 70);
    txt(c, o.title, W / 2, y + 120, 24, BRAND.olive, 'center', null);
    wrapLines(c, o.sub, w - 40, 15).forEach((l, i) => txt(c, l, W / 2, y + 152 + i * 20, 15, '#3d2c1f', 'center', null));
    if (o.coins) { icon(c, 'coin', W / 2 - 40, y + 204, 28); txt(c, '+' + o.coins + ' Taler', W / 2 + 14, y + 205, 20, '#c9762f', 'center', null); }
    c.restore();
    if (this.t > 0.8) { rrPath(c, W / 2 - 90, y + h - 52, 180, 40, 16); fs(c, '#06d6a0', 3); txt(c, 'Weiter', W / 2, y + h - 31, 16, '#fff', 'center', BRAND.ink); UI.btn(W / 2 - 90, y + h - 52, 180, 40, () => setScene(new MultiScene())); }
  }
  down() {} move() {} up() {}
}
[Shop, Achievements, MultiScene, LobbyScene].forEach(K => { K.prototype.down = K.prototype.down || function () {}; K.prototype.move = K.prototype.move || function () {}; K.prototype.up = K.prototype.up || function () {}; });
MatchResult.prototype.freezeBg = true;
