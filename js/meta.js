'use strict';
// ---------- Taler, Erfolge, Laden, Freunde, Mehrspieler ----------
// Taler verdient man mit Erfolgen und im Mehrspieler; ausgeben im Laden (Joker max. 3 pro Tag, Skins, neue Tiere).

function META(a = ACC()) {
  if (!a) return null;
  if (!a.meta) a.meta = {};
  const m = a.meta;
  m.coins = m.coins || 0; m.ach = m.ach || {}; m.st = m.st || {}; m.skins = m.skins || []; m.animals = m.animals || []; m.bank = m.bank || 0; m.up = m.up || {};
  if (!m.upMig) upgradeMigrate(a, m);
  return m;
}
// ---------- Upgrades: dauerhafte Verbesserungen mit 4 Stufen, jede teurer (Laden + Glücksrad) ----------
const UPGRADES = [
  { k: 'bonuszeit', name: 'Bonus-Uhr', icon: 'hourglass', col: '#ffd166', price: [80, 160, 300, 500], f: l => '+' + ABIL_VAL.bonuszeit[l] + ' Sekunden bei der Bonus-Jagd' },
  { k: 'turbo', name: 'Turbo-Schuhe', icon: 'shoe', col: '#80ed99', price: [80, 160, 300, 500], f: l => Math.round((ABIL_VAL.turbo[l] / 180 - 1) * 100) + ' % schneller laufen' },
  { k: 'extraherz', name: 'Extra-Herzen', icon: 'heart', col: '#ffafcc', price: [100, 200, 350, 550], f: l => ABIL_VAL.extraherz[l] + ' statt 4 Herzen in Geschick-Aufgaben' },
  { k: 'zeitplus', name: 'Zeit-Plus', icon: 'clock', col: '#a5d8ff', price: [100, 200, 350, 550], f: l => '+' + ABIL_VAL.zeitplus[l] + ' Sekunden in Geschick-Aufgaben' },
  { k: 'magnet', name: 'Sammel-Magnet', icon: 'bag', col: '#cdb4db', price: [60, 120, 220, 380], f: l => 'Sammel-Sachen fliegen dir zu – ' + ['', 'etwas', 'weiter', 'weit', 'sehr weit'][l] },
];
const UP_MAX = 4;
function upLevel(k) { const m = META(); return m ? m.up[k] || 0 : 0; }
// Einmalig: Fähigkeiten alter Skins werden zu Upgrade-Stufen; die übrigen (gibt es nicht mehr) zu Talern
function upgradeMigrate(a, m) {
  m.upMig = 1; let coins = 0; const ids = new Set(m.skins);
  ['easy', 'medium', 'hard'].forEach(d => { const st = a.diff && a.diff[d] && a.diff[d].stages; if (st) for (const k in st) (st[k].skins || []).forEach(id => ids.add(id)); });
  for (const id of ids) { const L = typeof LEGACY_ABIL !== 'undefined' && LEGACY_ABIL[id]; if (!L) continue; const [ab, lvl] = L;
    if (UPGRADES.some(u => u.k === ab)) m.up[ab] = Math.max(m.up[ab] || 0, Math.min(UP_MAX, lvl)); else coins += 40 * lvl; }
  if (coins) { m.coins += coins; m.upGift = coins; }
}
const BASE_ANIMALS = ['cat', 'dog', 'lion'];
const SHOP_ANIMALS = [['bunny', 120], ['mouse', 120], ['bear', 150], ['panda', 150], ['fox', 150], ['raccoon', 180], ['koala', 180], ['wolf', 200], ['tiger', 250], ['frog', 120], ['pig', 140], ['cow', 160], ['monkey', 180], ['polar', 220], ['elefant', 260]];
const JOKER_PRICE = 30, JOKERS_PER_DAY = 3;
function ownedAnimals() { const m = META(); return BASE_ANIMALS.concat(m ? m.animals : []); }

// ---- Erfolge ----
const ACHIEVEMENTS = [
  { id: 'erster', name: 'Erste Hilfe', desc: 'Hilf deiner ersten Person.', coins: 10, stat: 'kids', need: 1 },
  { id: 'kinder25', name: 'Guter Freund', desc: 'Hilf 25 Leuten.', coins: 40, stat: 'kids', need: 25 },
  { id: 'spielplatz', name: 'Spielplatz-Held', desc: 'Schaffe den Spielplatz.', coins: 30 },
  { id: 'profi', name: 'Schwer-Profi', desc: 'Schaffe einen Bereich auf Schwer.', coins: 60 },
  { id: 'ohnejoker', name: 'Ganz ohne Joker', desc: 'Schaffe einen Bereich, ohne einen Joker zu benutzen.', coins: 50 },
  { id: 'bonus1', name: 'Blitzschnell', desc: 'Hol dir einen Bonus-Joker mit der Bonus-Uhr.', coins: 15, stat: 'bonusJ', need: 1 },
  { id: 'bonus5', name: 'Bonus-Jäger', desc: 'Hol dir 5 Bonus-Joker.', coins: 40, stat: 'bonusJ', need: 5 },
  { id: 'sterne1', name: 'Volle Sterne', desc: 'Schaffe eine Aufgabe mit allen drei Tempo-Sternen.', coins: 10, stat: 'stars3', need: 1 },
  { id: 'sterne25', name: 'Sternen-Sammler', desc: 'Schaffe 25 Aufgaben mit drei Tempo-Sternen.', coins: 40, stat: 'stars3', need: 25 },
  { id: 'combo5', name: 'Combo-König', desc: 'Schaffe eine Combo x5.', coins: 20 },
  { id: 'blaetter', name: 'Blätter-Sammler', desc: 'Finde alle 8 Sammel-Sachen in einem Bereich (Blätter, Kochmützen, Sterne …).', coins: 20 },
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
// Erfolge zählen je Schwierigkeitsstufe getrennt (Schlüssel 'id@stufe')
const GENERAL_ACH = new Set(['profi', 'skins10', 'freund', 'duell1', 'sieg1', 'sieg10', 'team1', 'einkauf', 'entdecker', 'welt', 'duels', 'wins', 'teams']);
const achKey = (id, d = CUR_DIFF || 'medium') => (GENERAL_ACH.has(id) ? id : id + '@' + d);
function achieve(id) {
  const a = ACC(), m = META(a), k = achKey(id); if (!m || m.ach[k]) return;
  const A = ACHIEVEMENTS.find(x => x.id === id); if (!A) return;
  m.ach[k] = Date.now(); m.coins += A.coins; Save.write();
  toast('Erfolg: ' + A.name, '+' + A.coins + ' Taler', 'trophy');
  setTimeout(() => { try { Sfx.note(784, 0.18, 'triangle', 0.08); setTimeout(() => Sfx.note(1047, 0.3, 'triangle', 0.08), 140); FX.sparkle(W / 2, 56, 26, '#ffd23f'); } catch (e) {} }, 250);   // kurze Feier
  if (['g_swing', 'g_race', 'g_pigeons', 'g_slide'].every(x => m.ach[achKey(x)])) achieve('geheim');
}
function stat(key, inc = 1) {
  const m = META(); if (!m) return;
  const sk = achKey(key); m.st[sk] = (m.st[sk] || 0) + inc; Save.write();
  ACHIEVEMENTS.forEach(A => { if (A.stat === key && m.st[sk] >= A.need) achieve(A.id); });
}
function addCoins(n, why) { const m = META(); if (!m) return; m.coins += n; Save.write(); toast(why, '+' + n + ' Taler', 'coin'); }

// ---- Einblendungen oben (Erfolge, Taler) ----
const TOASTS = [];
function toast(title, sub, ic = 'trophy') {
  // Taler-Meldungen zusammenfassen statt viele hintereinander
  const coin = ic === 'coin' && /^\+(\d+) Taler$/.exec(sub), last = TOASTS[TOASTS.length - 1];
  if (coin && last && last.ic === 'coin' && last.t < 1.2) { last.n = (last.n || +/\d+/.exec(last.sub)[0]) + +coin[1]; last.sub = '+' + last.n + ' Taler'; last.title = last.title === title ? title : 'Taler bekommen'; last.t = Math.min(last.t, 0.4); return; }
  TOASTS.push({ title, sub, ic, t: 0 }); if (!coin || +coin[1] >= 50) Sfx.note(784, 0.12, 'triangle', 0.05, 1.3);
}
function drawToasts(c, dt) {
  const q = TOASTS[0]; if (!q) return;
  q.t += dt * (TOASTS.length > 2 ? 2 : 1); if (q.t > 2.2) { TOASTS.shift(); return; }
  const k = ease.back(clamp(q.t * 3, 0, 1)) * clamp((2.2 - q.t) * 3, 0, 1), w = Math.min(W - 30, 320), y = 8 + (k - 1) * 70;
  c.save(); c.globalAlpha = clamp(k, 0, 1);
  rrPath(c, W / 2 - w / 2, y, w, 44, 18); fs(c, '#fff7e6', 2.5); ell(c, W / 2 - w / 2 + 24, y + 22, 15, 15); fs(c, '#ffd166', 2); icon(c, q.ic, W / 2 - w / 2 + 24, y + 22, 20);
  txt(c, q.title, W / 2 - w / 2 + 46, y + 15, 13, BRAND.olive, 'left', null); txt(c, q.sub, W / 2 - w / 2 + 46, y + 31, 12, '#c9762f', 'left', null);
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
// Tagesangebote: für alle gleich (aus dem Datum gewürfelt)
function dailyOffers() {
  const day = new Date().toISOString().slice(0, 10); let h = 2166136261; for (const ch of day) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const r = mulberry32(h), ex = pick(EXCLUSIVE_SKINS, r), offs = shuffle(SHOP_SKINS.filter(o => o[2] !== 'legend'), r).slice(0, 2);
  const m = META(), ups = UPGRADES.filter(u => !m || (m.up[u.k] || 0) < UP_MAX), u = ups.length ? ups[Math.floor(r() * ups.length)] : null;   // Upgrade des Tages: 25 % günstiger
  const upOff = u ? [{ up: u.k, off: 25, price: Math.round(u.price[m ? m.up[u.k] || 0 : 0] * 0.75 / 5) * 5 }] : [];
  return upOff.concat([{ id: ex[0], price: ex[3], ex: true, off: 0 }]).concat(offs.map(o => { const off = pick([20, 30, 40, 50], r); return { id: o[0], off, price: Math.round(o[3] * (100 - off) / 100 / 5) * 5 }; }));
}
class Shop {
  constructor(back) { this.back = back || (() => setScene(new Menu())); this.t = 0; this.tab = 'up'; this.msg = ''; this.msgT = 0; }
  enter() { FX.clear(); }
  update(dt) { this.t += dt; this.msgT = Math.max(0, this.msgT - dt); if (!this.drag && Math.abs(this.vel || 0) > 5) { this.sc = (this.sc || 0) + this.vel * dt; this.vel *= Math.pow(0.04, dt); } }   // Schwung beim Wischen
  say(m) { this.msg = m; this.msgT = 2.5; }
  down(x, y) { this.vel = 0; if (this.tab === 'skins') this.drag = { y0: y, s0: this.sc || 0, moved: false, x, y, ly: y, lt: performance.now() }; }
  move(x, y) { if (this.drag) { if (Math.abs(y - this.drag.y0) > 8) this.drag.moved = true; this.sc = this.drag.s0 - (y - this.drag.y0); const now = performance.now(), dt = Math.max(1, now - this.drag.lt) / 1000; this.vel = -(y - this.drag.ly) / dt; this.drag.ly = y; this.drag.lt = now; } }
  up(x, y) {
    const d = this.drag; this.drag = null; if (!d || d.moved || this.tab !== 'skins') return;
    const h = (this.skinHit || []).find(o => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h); if (!h) return;
    if (h.own) { wearSkin(h.id); this.say(h.name + ' hast du jetzt an!'); return; }
    this.buy(h.price, mm => { mm.skins.push(h.id); wearSkin(h.id); this.say(h.name + ' gekauft und gleich angezogen!'); });
  }
  buy(price, fn, ok) { if (price >= 150 && !ok) { overlay = new ConfirmDialog({ text: 'Für ' + price + ' Taler kaufen?', icon: 'coin', onYes: () => this.buy(price, fn, true) }); return; } const m = META(); if (m.coins < price) { Sfx.play('bad'); this.say('Dafür fehlen dir noch ' + (price - m.coins) + ' Taler.'); return; } m.coins -= price; fn(m); Save.write(); Sfx.play('win'); FX.confetti(W / 2, H * 0.4, 40); achieve('einkauf'); }
  draw(c) {
    themeBg(c, 'shop');
    const m = META(); if (!m) return;
    topBar(c, this.back);
    icon(c, 'shop', 104, 44, 40); txt(c, 'Laden', 130, 44, 24, '#fff', 'left', BRAND.olive);
    coinChip(c, W - 170, 44);
    roundBtn(c, W - 212, 44, 16, '#fff', 'question', () => { overlay = new MsgDialog({ icon: 'coin', text: 'So bekommst du Taler: Hilf den Leuten in den Bereichen, schaffe Aufgaben mit vielen Sternen, hol dir Erfolge, spiele mit anderen zusammen – und jeden Tag gibt es ein Tagesgeschenk.' }); });   /* wie verdiene ich Taler? */
    const tabs = [['up', 'Upgrades'], ['joker', 'Angebote'], ['rad', 'Glücksrad'], ['skins', 'Skins'], ['tiere', 'Figur'], ['garderobe', 'Garderobe']], tw = Math.min(130, (W - 40) / tabs.length - 8);
    tabs.forEach(([id, name], i) => { const x = W / 2 + (i - (tabs.length - 1) / 2) * (tw + 8) - tw / 2; if (id === 'up') { c.save(); c.shadowColor = '#ffd60a'; c.shadowBlur = 10 + 8 * Math.sin(this.t * 4); rrPath(c, x, 80, tw, 40, 16); c.fillStyle = '#ffd60a'; c.fill(); c.restore(); } rrPath(c, x, 80, tw, 40, 16); fs(c, this.tab === id ? '#ffd166' : id === 'up' ? '#ffe066' : id === 'garderobe' ? '#d8f5e3' : '#fff', 3); txt(c, name, x + tw / 2, 101, Math.min(16, tw / 6.2), '#3d2c1f', 'center', null); UI.btn(x, 80, tw, 40, () => { if (id === 'garderobe') { const w = new Wardrobe(CUR_DIFF || 'medium'); w.stage = 'laden'; overlay = w; Sfx.play('tap'); return; } this.tab = id; if (id === 'rad' && !this.spin) this.radPool = null; Sfx.play('tap'); }); });
    const top = 134, bottom = H - 16;
    if (this.tab === 'joker') {
      // Tages-Shop: jeden Tag 1 exklusiver Skin + 3 Skins mit Rabatt (für alle gleich, wechselt um Mitternacht)
      const D = dailyOffers(), kind = ACC().char || 'cat', n = D.length, gap = 12, jh = 64, cw = Math.min(190, (W - 40 - gap * (n - 1)) / n), ch = Math.min(bottom - top - 36 - jh - 14, 230), x0 = (W - (cw * n + gap * (n - 1))) / 2;
      const ms = new Date(); ms.setHours(24, 0, 0, 0); const left = Math.max(0, ms - Date.now()), hh = Math.floor(left / 3600000), mm2 = Math.floor(left / 60000) % 60;
      txt(c, 'Neue Angebote in ' + hh + ' Std ' + mm2 + ' Min', W / 2, top + 4, 13, '#fff', 'center', BRAND.olive);
      D.forEach((o, i) => {
        if (o.up) {   // Upgrade des Tages: leuchtend, auffälliger als die Skins
          const u = UPGRADES.find(q => q.k === o.up), l = m.up[u.k] || 0, x = x0 + i * (cw + gap), y = top + 30, bob = Math.sin(this.t * 2 + i) * 2, gl = 0.5 + 0.5 * Math.sin(this.t * 3);
          c.save(); c.shadowColor = '#ffd60a'; c.shadowBlur = 16 + gl * 14; rrPath(c, x, y + bob, cw, ch, 18); fs(c, '#fff3bf', 4, '#c9a227'); c.restore();
          const iy = y + bob + 34, ir = Math.min(24, (ch - 110) / 2 + 18);
          ell(c, x + cw / 2, iy, ir + 5 + gl * 3, ir + 5 + gl * 3); c.fillStyle = u.col; c.globalAlpha = 0.5; c.fill(); c.globalAlpha = 1; ell(c, x + cw / 2, iy, ir, ir); fs(c, '#fff', 3); icon(c, u.icon, x + cw / 2, iy, ir * 1.35);
          txt(c, u.name, x + cw / 2, iy + ir + 16, 14, '#3d2c1f', 'center', null); if (ch > 150) txt(c, 'Stufe ' + (l + 1) + ' von ' + UP_MAX, x + cw / 2, iy + ir + 32, 11, '#6b5a48', 'center', null);
          { const lab = 'UPGRADE · -' + o.off + ' %', lw = Math.min(cw - 16, 150); rrPath(c, x + cw / 2 - lw / 2, y + bob - 10, lw, 22, 11); fs(c, '#ef476f', 2, '#fff'); txt(c, lab, x + cw / 2, y + bob + 1, 11, '#fff', 'center', null); }
          const today = new Date().toISOString().slice(0, 10), done = m.upDeal === today;   // nur einmal am Tag
          rrPath(c, x + 14, y + bob + ch - 36, cw - 28, 28, 14); fs(c, done ? '#d8f5e3' : '#06d6a0', 2.5);
          if (done) txt(c, 'gekauft – morgen neu', x + cw / 2, y + bob + ch - 21, 12, '#2b9348', 'center', null); else { icon(c, 'coin', x + 32, y + bob + ch - 22, 15); txt(c, String(o.price), x + cw / 2 + 8, y + bob + ch - 21, 14, '#fff', 'center', BRAND.ink); }
          UI.btn(x, y + bob, cw, ch, () => { if (done) { this.say('Morgen gibt es ein neues Upgrade-Angebot.'); return; } this.buy(o.price, mm => { mm.up[u.k] = Math.min(UP_MAX, (mm.up[u.k] || 0) + 1); mm.upDeal = today; this.say(u.name + ': Stufe ' + mm.up[u.k] + '!'); FX.confetti(x + cw / 2, y + 60, 30); }); });
          return;
        }
        const x = x0 + i * (cw + gap), y = top + 30, sk = SKINS[o.id], own = m.skins.includes(o.id), bob = Math.sin(this.t * 2 + i) * 2;
        rrPath(c, x, y + bob, cw, ch, 18); fs(c, own ? '#d8f5e3' : o.ex ? '#fff3bf' : '#fff', 3.5, o.ex ? '#c9a227' : OL);
        drawAnimal(c, kind, x + cw / 2, y + bob + ch - 60, Math.min(1.4, (ch - 66) / 80), { look: sk, cap: true, t: this.t + i });
        txt(c, sk.name, x + cw / 2, y + bob + ch - 52, 13, '#3d2c1f', 'center', null);
        txt(c, RARITY[sk.rarity].name + (sk.ability ? ' · ' + ABILITIES[sk.ability].name : ''), x + cw / 2, y + bob + ch - 34, 11, '#6b5a48', 'center', null);
        { const lab = o.ex ? (cw < 170 ? 'Nur heute!' : 'NUR HEUTE · exklusiv') : '-' + o.off + ' % Rabatt', lw = Math.min(cw - 24, lab.length * 7 + 20); rrPath(c, x + cw / 2 - lw / 2, y + bob - 9, lw, 20, 10); fs(c, o.ex ? '#ef476f' : '#06d6a0', 2, OL); txt(c, lab, x + cw / 2, y + bob + 1, 11, '#fff', 'center', null); }   // Schild auf der Kante, nicht über dem Kopf
        if (sk.ability) { ell(c, x + 20, y + bob + 26, 13, 13); fs(c, '#fff3bf', 2, '#c9a227'); icon(c, ABIL_ICON[sk.ability], x + 20, y + bob + 26, 16); }
        if (own) txt(c, 'gekauft', x + cw / 2, y + bob + ch - 14, 13, '#2b9348', 'center', null);
        else { if (o.off) { txt(c, String(sk.price), x + cw / 2 - 30, y + bob + ch - 14, 11, '#adb5bd', 'center', null); line(c, x + cw / 2 - 42, y + bob + ch - 14, x + cw / 2 - 18, y + bob + ch - 14, 1.5, '#adb5bd', false); } icon(c, 'coin', x + cw / 2 - 2, y + bob + ch - 14, 16); txt(c, String(o.price), x + cw / 2 + 24, y + bob + ch - 13, 14, '#8d5a3b', 'center', null); }
        UI.btn(x, y + bob, cw, ch, () => { if (own) { wearSkin(o.id); this.say(sk.name + ' hast du jetzt an!'); return; } this.buy(o.price, mm => { mm.skins.push(o.id); wearSkin(o.id); this.say(sk.name + ' gekauft und gleich angezogen!'); }); });
        skinInfoBtn(c, x + cw - 18, y + bob + ch - 70, o.id);
      });
      { const today = new Date().toISOString().slice(0, 10); if (m.day !== today) { m.day = today; m.dayJ = 0; m.dayS = 0; }
        [['Aufgaben-Joker', 'joker', JOKER_PRICE, JOKERS_PER_DAY - (m.dayJ || 0), m.bank, mm => { mm.bank++; mm.dayJ = (mm.dayJ || 0) + 1; }, 'Schafft eine Aufgabe sofort.'],
         ['Such-Joker', 'search', 20, 5 - (m.dayS || 0), m.hint || 0, mm => { mm.hint = (mm.hint || 0) + 1; mm.dayS = (mm.dayS || 0) + 1; }, 'Zeigt sofort ein Versteck.']].forEach(([name, ic, price, left, have, give, desc], j) => {
          const tw2 = cw * n + gap * (n - 1), bw = (tw2 - gap) / 2, x = x0 + j * (bw + gap), y = top + 30 + ch + 14, ok = left > 0, w = bw, h = jh;   /* Joker: eigene Zeile unter den Skins */
          rrPath(c, x, y, w, h, 18); fs(c, ok ? '#e7f5ff' : '#e9ecef', 3.5);
          icon(c, ic, x + 34, y + h / 2, 38);
          txt(c, name, x + 62, y + 20, 14, '#3d2c1f', 'left', null);
          txt(c, 'Du hast ' + have + ' · heute noch ' + Math.max(0, left), x + 62, y + 42, 12, '#2b9348', 'left', null);
          rrPath(c, x + w - 78, y + h / 2 - 16, 68, 32, 14); fs(c, '#ffd166', 2.5); icon(c, 'coin', x + w - 60, y + h / 2, 16); txt(c, String(price), x + w - 34, y + h / 2 + 1, 14, '#3d2c1f', 'center', null);
          UI.btn(x, y, w, h, () => { if (!ok) { this.say('Morgen gibt es wieder welche.'); Sfx.play('bad'); return; } this.buy(price, give); });
        }); }
    } else if (this.tab === 'joker2') {
      const today = new Date().toISOString().slice(0, 10); if (m.day !== today) { m.day = today; m.dayJ = 0; m.dayS = 0; }
      const J = [['Aufgaben-Joker', 'Schafft eine Aufgabe sofort, wenn du nicht weiterkommst.', 'joker', JOKER_PRICE, JOKERS_PER_DAY - (m.dayJ || 0), m.bank, mm => { mm.bank++; mm.dayJ = (mm.dayJ || 0) + 1; }],
        ['Such-Joker', 'Zeigt sofort, wo ein gesuchtes Ding versteckt ist – der Hilfe-Stern muss nicht erst laden.', 'search', 20, 5 - (m.dayS || 0), m.hint || 0, mm => { mm.hint = (mm.hint || 0) + 1; mm.dayS = (mm.dayS || 0) + 1; }]];
      const w = Math.min((W - 50) / 2, 380), h = Math.min(bottom - top, 230);
      J.forEach(([name, desc, ic, price, left, have, give], i) => {
        const x = W / 2 + (i ? 8 : -8 - w), y = top; panel(c, x, y, w, h, '#fff7e6', 24);
        icon(c, ic, x + 52, y + 56, 64); txt(c, name, x + 100, y + 36, 18, BRAND.olive, 'left', null);
        wrapLines(c, desc, w - 116, 12).slice(0, 3).forEach((l, k) => txt(c, l, x + 100, y + 60 + k * 16, 12, '#6b5a48', 'left', null));
        txt(c, 'Heute noch ' + Math.max(0, left) + ' · Du hast: ' + have, x + w / 2, y + h - 84, 13, left > 0 ? '#2b9348' : '#c1121f', 'center', null);
        const ok = left > 0, bx = x + w / 2, by = y + h - 40; c.save(); if (!ok) c.globalAlpha = 0.45; rrPath(c, bx - 90, by - 22, 180, 44, 18); fs(c, '#06d6a0', 3); icon(c, 'coin', bx - 50, by, 22); txt(c, price + ' Taler', bx + 12, by + 1, 16, '#fff', 'center', BRAND.ink); c.restore();
        UI.btn(bx - 90, by - 22, 180, 44, () => { if (!ok) { this.say('Morgen gibt es wieder welche.'); Sfx.play('bad'); return; } this.buy(price, give); });
      });
    } else if (this.tab === 'rad') {
      // Glücksrad: Skins, die man noch nicht hat, Upgrades (je höher die Stufe, desto seltener) und Taler
      const SPIN = 80, cx = W / 2, cy = top + (bottom - top) / 2 - 10, R = Math.min((bottom - top) / 2 - 22, 130);
      if (!this.radPool) {
        const free = shuffle(SHOP_SKINS.filter(o => !m.skins.includes(o[0]))).slice(0, 4).map(o => ({ kind: 'skin', id: o[0], w: RARITY[o[2]].w, col: RARITY[o[2]].col }));
        const ups = shuffle(UPGRADES.filter(u => (m.up[u.k] || 0) < UP_MAX)).slice(0, 3).map(u => { const l = m.up[u.k] || 0; return { kind: 'up', k: u.k, w: 0.7 / Math.pow(l + 1, 1.3), col: u.col }; });
        this.radPool = shuffle(free.concat(ups, [{ kind: 'coins', n: 40, w: 1.2, col: '#fff3bf' }, { kind: 'coins', n: 120, w: 0.35, col: '#ffd166' }])); this.radA = this.radA || 0;
      }
      const pool = this.radPool, n = pool.length, seg = TAU / Math.max(1, n);
      const sp = this.spin; const ang = sp ? sp.a0 + (sp.a1 - sp.a0) * (1 - Math.pow(1 - Math.min(1, (this.t - sp.t0) / 2.2), 3)) : (this.radA || 0);
      pool.forEach((o, i) => {
        const a0 = ang + i * seg, a1 = a0 + seg, mx = cx + Math.cos(a0 + seg / 2) * R * 0.64, my = cy + Math.sin(a0 + seg / 2) * R * 0.64;
        c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, a0, a1); c.closePath(); fs(c, o.col, 3);
        if (o.kind === 'skin') { c.save(); c.translate(mx, my); drawAnimal(c, ACC().char || 'cat', 0, 18, R / (n > 6 ? 118 : 100), { look: SKINS[o.id], cap: true, noShadow: true }); c.restore(); }
        else if (o.kind === 'up') { const u = UPGRADES.find(q => q.k === o.k); ell(c, mx, my, 17, 17); fs(c, '#fff', 2.5); icon(c, u.icon, mx, my, 24); txt(c, '↑', mx + 14, my - 14, 14, '#2b9348', 'center', '#fff'); }
        else { icon(c, 'coin', mx, my - 6, 24); txt(c, String(o.n), mx, my + 14, 12, '#3d2c1f', 'center', '#fff'); }
      });
      ell(c, cx, cy, 22, 22); fs(c, '#fff', 3); polyPath(c, [[cx + R - 6, cy], [cx + R + 22, cy - 14], [cx + R + 22, cy + 14]]); fs(c, '#ef476f', 3);
      if (sp && this.t - sp.t0 > 2.3 && !sp.done) {
        sp.done = true; const o = pool[sp.k], mm = META();
        if (o.kind === 'skin') { mm.skins.push(o.id); this.say('Gewonnen: ' + SKINS[o.id].name + '!'); }
        else if (o.kind === 'up') { const u = UPGRADES.find(q => q.k === o.k); mm.up[o.k] = Math.min(UP_MAX, (mm.up[o.k] || 0) + 1); this.say('Upgrade: ' + u.name + ' Stufe ' + mm.up[o.k] + '!'); }
        else { mm.coins += o.n; this.say('Gewonnen: ' + o.n + ' Taler!'); }
        FX.confetti(W / 2, H * 0.3, 60); Sfx.play('win'); Save.write(); this.spin = null; this.radNext = this.t + 1.6;
      }
      if (this.radNext && this.t > this.radNext) { this.radNext = 0; this.radPool = null; }   // neue Mischung fürs nächste Mal
      const bx = W - Math.min(120, W * 0.16), by = cy; c.save(); if (this.spin || this.radNext) c.globalAlpha = 0.5; rrPath(c, bx - 80, by - 26, 160, 52, 20); fs(c, '#ffd166', 3); txt(c, 'Drehen', bx, by - 6, 18, '#3d2c1f', 'center', null); icon(c, 'coin', bx - 22, by + 14, 16); txt(c, String(SPIN), bx + 8, by + 15, 13, '#8d5a3b', 'center', null); c.restore();
      UI.btn(bx - 80, by - 26, 160, 52, () => { if (this.spin || this.radNext) return; this.buy(SPIN, () => { const ws = pool.map(o => o.w), tot = ws.reduce((x, y) => x + y, 0); let r = rnd() * tot, k = 0; while (r > ws[k]) { r -= ws[k]; k++; } const target = -(k * seg + seg / 2), base = this.radA || 0; this.spin = { t0: this.t, a0: base, a1: base + TAU * 5 + (((target - base) % TAU) + TAU) % TAU, k }; this.radA = this.spin.a1; }); });
      wrapLines(c, 'Dreh das Rad: Skins, Upgrades oder Taler!', Math.min(220, W * 0.25), 12).forEach((l, i) => txt(c, l, Math.max(110, W * 0.14), cy - 20 + i * 16, 12, '#fff', 'center', BRAND.olive));
    } else if (this.tab === 'up') {
      // Upgrades: groß und leuchtend – das Wichtigste im Laden
      const n = UPGRADES.length, gap = 10, land = W > H, cw = land ? Math.min(176, (W - 40 - gap * (n - 1)) / n) : Math.min(W - 40, 420), ch = land ? Math.min(bottom - top - 6, 236) : Math.min(120, (bottom - top - gap * (n - 1)) / n), x0 = land ? (W - (cw * n + gap * (n - 1))) / 2 : (W - cw) / 2;
      txt(c, 'Upgrades gelten immer – egal welchen Skin du trägst', W / 2, H - 8, 12, '#fff', 'center', BRAND.olive);
      UPGRADES.forEach((u, i) => {
        const l = m.up[u.k] || 0, max = l >= UP_MAX, price = max ? 0 : u.price[l], x = land ? x0 + i * (cw + gap) : x0, y = land ? top + 2 : top + i * (ch + gap), bob = Math.sin(this.t * 2 + i) * 2, gl = 0.5 + 0.5 * Math.sin(this.t * 3 + i);
        c.save(); c.shadowColor = u.col; c.shadowBlur = 14 + gl * 12; rrPath(c, x, y + bob, cw, ch, 20); fs(c, '#fffdf5', 4, '#c9a227'); c.restore();
        rrPath(c, x, y + bob, cw, ch, 20); c.lineWidth = 4; c.strokeStyle = '#c9a227'; c.stroke();
        const ix = land ? x + cw / 2 : x + 48, iy = land ? y + bob + 46 : y + bob + ch / 2;
        ell(c, ix, iy, 32 + gl * 3, 32 + gl * 3); c.fillStyle = u.col; c.globalAlpha = 0.45; c.fill(); c.globalAlpha = 1; ell(c, ix, iy, 27, 27); fs(c, '#fff', 3); icon(c, u.icon, ix, iy, 36);
        const tx = land ? x + cw / 2 : x + 92, al = land ? 'center' : 'left';
        txt(c, u.name, tx, land ? y + bob + 96 : y + bob + 22, 15, '#3d2c1f', al, null);
        for (let k = 0; k < UP_MAX; k++) { const px = land ? x + cw / 2 + (k - 1.5) * 20 : tx + 7 + k * 20, py = land ? y + bob + 116 : y + bob + 44; rrPath(c, px - 8, py - 5, 16, 10, 5); fs(c, k < l ? '#06d6a0' : '#e9ecef', 2); }
        const desc = max ? u.f(l) : (l ? 'Jetzt: ' + u.f(l) + ' · Nächste: ' + u.f(l + 1) : u.f(1));
        wrapLines(c, desc, land ? cw - 18 : cw - 210, 11).slice(0, land ? 4 : 2).forEach((t2, k) => txt(c, t2, tx, (land ? y + bob + 138 : y + bob + 64) + k * 14, 11, '#6b5a48', al, null));
        const bw = land ? cw - 24 : 150, bx = land ? x + 12 : x + cw - bw - 12, by = land ? y + bob + ch - 44 : y + bob + ch / 2 - 18;
        rrPath(c, bx, by, bw, 36, 16); fs(c, max ? '#d8f5e3' : '#06d6a0', 3);
        if (max) txt(c, 'MAX', bx + bw / 2, by + 19, 15, '#2b9348', 'center', null);
        else { icon(c, 'coin', bx + 22, by + 18, 18); txt(c, 'Stufe ' + (l + 1) + ' · ' + price, bx + bw / 2 + 10, by + 19, 13, '#fff', 'center', BRAND.ink); }
        UI.btn(x, y + bob, cw, ch, () => { if (max) { this.say(u.name + ' ist schon ganz oben!'); return; } this.buy(price, mm => { mm.up[u.k] = l + 1; FX.confetti(ix, iy, 30); this.say(u.name + ': Stufe ' + (l + 1) + '!'); }, price < 150); });
      });
    } else if (this.tab === 'skins') {
      // alle Skins auf einer Seite untereinander, sortiert: Normal → Selten → Legendär, dann nach Preis
      const RO = { common: 0, rare: 1, legend: 2 }, list = this.skinList || (this.skinList = SHOP_SKINS.slice().sort((a, b) => RO[a[2]] - RO[b[2]] || a[3] - b[3] || a[1].localeCompare(b[1])));
      const cols = W > H ? 6 : 3, gap = 10, cw = Math.min(150, (W - 110 - gap * (cols - 1)) / cols), ch = Math.min(150, cw * 1.05), x0 = (W - 70 - (cw * cols + gap * (cols - 1))) / 2;
      const kind = ACC().char || 'cat', rows = Math.ceil(list.length / cols), headH = 28;
      // Abschnitte je Seltenheit
      const groups = [['common', 'Normal'], ['rare', 'Selten'], ['legend', 'Legendär']].map(([r, n]) => [n, list.filter(o => o[2] === r)]);
      let yy = 0; const pos = []; groups.forEach(([n, L]) => { pos.push({ head: n, y: yy }); yy += headH; L.forEach((o, i) => { pos.push({ o, x: x0 + (i % cols) * (cw + gap), y: yy + Math.floor(i / cols) * (ch + gap) }); }); yy += Math.ceil(L.length / cols) * (ch + gap) + 8; });
      const maxS = Math.max(0, yy - (bottom - top)); this.sc = clamp(this.sc || 0, 0, maxS); this.skinHit = [];
      c.save(); c.beginPath(); c.rect(0, top - 4, W, bottom - top + 8); c.clip();
      pos.forEach(P => {
        const y = top + P.y - this.sc; if (y > bottom || y + ch < top - 40) return;
        if (P.head) { txt(c, P.head, x0, y + 14, 16, '#fff', 'left', BRAND.olive); return; }
        const [id, name, rarity, price] = P.o, x = P.x, own = m.skins.includes(id), sk = SKINS[id];
        rrPath(c, x, y, cw, ch, 16); fs(c, own ? '#d8f5e3' : '#fff', 3, rarity === 'legend' ? '#c9a227' : rarity === 'rare' ? '#118ab2' : OL);
        drawAnimal(c, kind, x + cw / 2, y + ch * 0.66, Math.min(1.4, ch / 115), { look: sk, cap: true, t: this.t });
        rrPath(c, x + 6, y + 6, cw - 12, 18, 9); c.fillStyle = RARITY[rarity].col; c.fill(); txt(c, sk.ability ? ABILITIES[sk.ability].name : RARITY[rarity].name, x + cw / 2 + (sk.ability ? 7 : 0), y + 15, 10, '#3d2c1f', 'center', null); if (sk.ability) icon(c, ABIL_ICON[sk.ability], x + 16, y + 15, 14);
        txt(c, name, x + cw / 2, y + ch - 30, 11, '#3d2c1f', 'center', null);
        if (own) txt(c, DP(CUR_DIFF || 'medium').equip === id ? '✓ an' : 'antippen = anziehen', x + cw / 2, y + ch - 12, cw < 120 ? 10 : 12, '#2b9348', 'center', null);
        else { icon(c, 'coin', x + cw / 2 - 20, y + ch - 12, 15); txt(c, String(price), x + cw / 2 + 6, y + ch - 11, 13, '#8d5a3b', 'center', null); }
        skinInfoBtn(c, x + cw - 16, y + ch - 50, id);
        this.skinHit.push({ x, y, w: cw, h: ch, id, name, price, own });
      });
      c.restore();
      // gut sichtbare Pfeile zum Blättern (zusätzlich zu Ziehen und Mausrad)
      if (maxS > 0) { const bx = W - 36, step = (bottom - top) * 0.8;
        c.save(); if (this.sc <= 0) c.globalAlpha = 0.35; c.translate(bx, top + 30); c.rotate(Math.PI / 2); roundBtn(c, 0, 0, 24, '#fff', 'back', null); c.restore(); UI.btn(bx - 26, top + 4, 52, 52, () => { this.sc = Math.max(0, (this.sc || 0) - step); });
        c.save(); if (this.sc >= maxS) c.globalAlpha = 0.35; c.translate(bx, bottom - 30); c.rotate(-Math.PI / 2); roundBtn(c, 0, 0, 24, '#ffd166', 'back', null); c.restore(); UI.btn(bx - 26, bottom - 56, 52, 52, () => { this.sc = Math.min(maxS, (this.sc || 0) + step); });
        txt(c, Math.round(this.sc / maxS * 100) + '%', bx, (top + bottom) / 2, 11, '#fff', 'center', BRAND.olive); }
      if (maxS > 0) { const h = (bottom - top) * (bottom - top) / (bottom - top + maxS), y = top + (bottom - top - h) * (this.sc / maxS); rrPath(c, W - 9, y, 5, h, 3); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill(); }
    } else {
      { const bw = 220, bx = W / 2 - bw / 2, by = H - 52; rrPath(c, bx, by, bw, 40, 18); fs(c, '#ffd166', 3); icon(c, 'hanger', bx + 28, by + 20, 22); txt(c, 'Aussehen gestalten', bx + 46, by + 21, 15, '#3d2c1f', 'left', null); UI.btn(bx, by, bw, 40, () => { const back = () => { const s2 = new Shop(this.back); s2.tab = 'tiere'; setScene(s2); }; setScene(new CharEditor(back)); }); }
      const bottom = H - 62;
      const all = BASE_ANIMALS.map(k => [k, 0]).concat(SHOP_ANIMALS), cols = W > H ? (all.length > 12 ? 9 : 6) : 3, gap = 10, cw = Math.min(140, (W - 30 - gap * (cols - 1)) / cols), ch = Math.min(180, (bottom - top - gap) / Math.ceil(all.length / cols) - gap), x0 = (W - (cw * cols + gap * (cols - 1))) / 2;
      all.forEach(([k, price], i) => {
        const x = x0 + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (ch + gap), own = ownedAnimals().includes(k), cur = ACC().char === k;
        rrPath(c, x, y, cw, ch, 16); fs(c, cur ? '#d8f5e3' : '#fff', 3);
        drawAnimal(c, k, x + cw / 2, y + ch - 38, Math.min(1.6, (ch - 42) / 76), { look: DEFAULT_LOOK, t: this.t + i, cap: false });   // Füße über dem Namen
        txt(c, ANIMAL_NAMES[k], x + cw / 2, y + ch - 27, 14, '#3d2c1f', 'center', null);
        if (cur) txt(c, 'deine Figur', x + cw / 2, y + ch - 12, 12, '#2b9348', 'center', null);
        else if (own) txt(c, cw < 120 ? 'wählen' : 'antippen = wählen', x + cw / 2, y + ch - 12, 11, '#6b5a48', 'center', null);
        else { icon(c, 'coin', x + cw / 2 - 22, y + ch - 12, 16); txt(c, String(price), x + cw / 2 + 4, y + ch - 11, 13, '#8d5a3b', 'center', null); }
        UI.btn(x, y, cw, ch, () => { if (own) { ACC().char = k; Save.write(); Sfx.play('good'); return; } this.buy(price, mm => { mm.animals.push(k); ACC().char = k; this.say(ANIMAL_NAMES[k] + ' ist jetzt deine Figur!'); }); });
      });
    }
    if (this.msgT > 0) { c.globalAlpha = clamp(this.msgT * 2, 0, 1); c.font = `900 15px ${FONT}`; const mw = c.measureText(this.msg).width + 30; rrPath(c, W / 2 - mw / 2, H - 52, mw, 36, 18); c.fillStyle = 'rgba(32,44,30,.92)'; c.fill(); txt(c, this.msg, W / 2, H - 34, 15, '#fff', 'center', null); c.globalAlpha = 1; }
  }
}

// ---------- Info zu einem Skin: Seltenheit + was die Fähigkeit kann ----------
function skinInfoBtn(c, x, y, sid, r = 12) { icon(c, 'info', x, y, r * 2); UI.btn(x - r - 6, y - r - 6, (r + 6) * 2, (r + 6) * 2, () => { overlay = new SkinInfo(sid, overlay); Sfx.play('tap'); }); }
class SkinInfo {
  constructor(sid, back) { this.sid = sid; this.back = back; this.t = 0; const sk = SKINS[sid] || {}; Voice.say('Skins sind nur zum Aussehen. Upgrades gelten immer, egal welchen Skin du trägst.', true); }
  update(dt) { this.t += dt; }
  close() { Voice.stop(); overlay = this.back || null; }
  draw(c) {
    c.fillStyle = 'rgba(16,28,18,.75)'; c.fillRect(0, 0, W, H);
    const sk = SKINS[this.sid] || {}, w = Math.min(W - 30, 420), h = 300, x = (W - w) / 2, y = (H - h) / 2;
    fitBegin(c, w, h);
    panel(c, x, y, w, h, '#fff7e6', 26);
    roundBtn(c, x + w - 30, y + 30, 22, '#ced4da', 'cross', () => this.close());
    drawAnimal(c, (ACC() && ACC().char) || 'cat', x + 80, y + 170, 2.2, { look: sk, cap: true, t: this.t });
    const R = RARITY[sk.rarity || 'common'];
    txt(c, sk.name || 'Skin', x + 150, y + 50, 19, BRAND.olive, 'left', null);
    rrPath(c, x + 150, y + 66, 110, 22, 11); c.fillStyle = R.col; c.fill(); txt(c, R.name, x + 205, y + 77, 12, '#3d2c1f', 'center', null);
    if (sk.ability) {
      const A = ABILITIES[sk.ability];
      icon(c, ABIL_ICON[sk.ability], x + 162, y + 112, 22); txt(c, 'Fähigkeit: ' + A.name, x + 180, y + 112, 16, '#c9762f', 'left', null);
      wrapLines(c, abilityText(sk), w - 170, 14).forEach((l, i) => txt(c, l, x + 150, y + 138 + i * 19, 14, '#3d2c1f', 'left', null));
      wrapLines(c, 'Wirkt, wenn du den Skin anziehst – bei Mittel und Schwer.', w - 170, 12).forEach((l, i) => txt(c, l, x + 150, y + 214 + i * 16, 12, '#6b5a48', 'left', null));
    } else wrapLines(c, 'Skins sind nur zum Aussehen. Upgrades fürs Spiel (Bonus-Uhr, Turbo, Herzen …) gibt es im Laden unter „Upgrades“ – die gelten immer, egal welchen Skin du trägst.', w - 170, 14).forEach((l, i) => txt(c, l, x + 150, y + 112 + i * 19, 14, '#3d2c1f', 'left', null));
    c.restore();
  }
  down() {} move() {} up() {}
}
SkinInfo.prototype.freezeBg = true;

// ---------- Erfolge ansehen ----------
class Achievements {
  constructor(back) { this.back = back || (() => setScene(new Menu())); this.t = 0; this.scroll = 0; this.drag = null; this.tab = 'lvl'; this.vel = 0; }
  enter() { FX.clear(); this.wheel = e => { this.scroll += e.deltaY; e.preventDefault(); }; try { cv.addEventListener('wheel', this.wheel, { passive: false }); } catch (e) { /* egal */ } }
  leave() { try { cv.removeEventListener('wheel', this.wheel); } catch (e) { /* egal */ } }
  update(dt) { this.t += dt; if (!this.drag && Math.abs(this.vel) > 5) { this.scroll += this.vel * dt; this.vel *= Math.pow(0.04, dt); } }
  draw(c) {
    themeBg(c, 'trophy');
    const m = META(); if (!m) return;
    topBar(c, () => { this.leave(); this.back(); });
    const tab = this.tab, DF = ['easy', 'medium', 'hard'], hasD = (A, d) => !!m.ach[achKey(A.id, d)] || (d === 'medium' && !!m.ach[A.id]);
    const has = A => tab === 'all' ? hasD(A, 'medium') || !!m.ach[A.id] : DF.every(d => hasD(A, d));   /* pro Stufe: Bronze (Leicht), Silber (Mittel), Gold (Schwer) in einer Karte */
    const LIST = ACHIEVEMENTS.filter(A => (tab === 'all') === GENERAL_ACH.has(A.id)).sort((a, b) => a.coins - b.coins || a.name.localeCompare(b.name));
    const nDone = tab === 'all' ? LIST.filter(has).length : LIST.reduce((n, A) => n + DF.filter(d => hasD(A, d)).length, 0), nAll = tab === 'all' ? LIST.length : LIST.length * 3;
    icon(c, 'trophy', 104, 44, 40); txt(c, 'Erfolge ' + nDone + '/' + nAll, 130, 44, 20, '#fff', 'left', BRAND.olive);
    coinChip(c, W - 170, 44);
    // Reiter: Leicht / Mittel / Schwer
    const tw = Math.min(150, (W - 40) / 2), tx0 = W / 2 - tw, ty = 74;
    [['lvl', 'Pro Stufe'], ['all', 'Allgemein']].forEach(([d, n], i) => { const x = tx0 + i * tw, sel = d === tab; rrPath(c, x + 3, ty, tw - 6, 30, 14); fs(c, sel ? '#ffd166' : 'rgba(255,255,255,.8)', 2.5); txt(c, n, x + tw / 2, ty + 15, 14, '#3d2c1f', 'center', null); UI.btn(x + 3, ty, tw - 6, 30, () => { this.tab = d; this.scroll = 0; }); });
    if (tab !== 'all') txt(c, 'Bronze = Leicht · Silber = Mittel · Gold = Schwer', W / 2, 114, 12, '#fff', 'center', BRAND.olive);
    const cols = W > 700 ? 2 : 1, gap = 10, cw = Math.min(420, (W - 30 - gap * (cols - 1)) / cols), ch = 64, x0 = (W - (cw * cols + gap * (cols - 1))) / 2, top = tab !== 'all' ? 128 : 116;
    const rows = Math.ceil(LIST.length / cols), maxScroll = Math.max(0, top + rows * (ch + gap) - H + 16);
    this.scroll = clamp(this.scroll, 0, maxScroll);
    c.save(); c.beginPath(); c.rect(0, top - 4, W, H - top + 4); c.clip();
    LIST.forEach((A, i) => {
      const x = x0 + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (ch + gap) - this.scroll, done = tab === 'all' ? has(A) : DF.some(d => hasD(A, d));
      if (y > H || y + ch < top - 4) return;
      rrPath(c, x, y, cw, ch, 18); fs(c, done ? '#fff7e6' : 'rgba(255,255,255,.75)', 3);
      ell(c, x + 32, y + ch / 2, 22, 22); fs(c, done ? '#ffd166' : '#dee2e6', 2.5); icon(c, done ? 'trophy' : (A.secret ? 'question' : 'lock'), x + 32, y + ch / 2, 26, done ? undefined : '#868e96');
      const sd = tab === 'all' ? 'medium' : DF.find(d => !hasD(A, d)) || 'hard', hidden = A.secret && !done, st = m.st[A.stat && GENERAL_ACH.has(A.stat) ? A.stat : achKey(A.stat, sd)] || (sd === 'medium' ? m.st[A.stat] : 0) || 0;
      txt(c, hidden ? 'Geheimer Erfolg' : A.name, x + 64, y + 22, 15, done ? BRAND.olive : '#495057', 'left', null);
      const desc = hidden ? (A.area ? 'Ein Geheimnis im Bereich ' + A.area + ' …' : 'Entdecke es selbst …') : A.desc + (A.stat && !done ? ' (' + Math.min(A.need, st) + '/' + A.need + ')' : '');
      wrapLines(c, desc, cw - (tab === 'all' ? 140 : 180), 12).slice(0, 2).forEach((l, k) => txt(c, l, x + 64, y + 40 + k * 14, 12, '#6b5a48', 'left', null));
      if (tab === 'all') { icon(c, 'coin', x + cw - 50, y + ch / 2, 18); txt(c, String(A.coins), x + cw - 38, y + ch / 2 + 1, 14, '#8d5a3b', 'left', null); if (done) icon(c, 'check', x + cw - 14, y + 14, 16, '#06d6a0'); }
      else DF.forEach((d, k) => { const on = hasD(A, d), mx = x + cw - 100 + k * 34, my = y + ch / 2; ell(c, mx, my, 14, 14); fs(c, on ? ['#cd7f32', '#c0c0c0', '#ffd700'][k] : '#e9ecef', 2.5, on ? '#6b4a1f' : ['#e0b08a', '#d0d0d0', '#f5d76e'][k]); txt(c, 'LMS'[k], mx, my + 1, 12, on ? '#fff' : '#adb5bd', 'center', on ? 'rgba(0,0,0,.35)' : null); });
    });
    c.restore();
    if (maxScroll > 0) { const h = (H - top) * (H - top) / (H - top + maxScroll), y = top + (H - top - h) * (this.scroll / maxScroll); rrPath(c, W - 8, y, 5, h, 3); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); }
  }
  down(x, y) { this.drag = { y0: y, s0: this.scroll, ly: y, lt: performance.now() }; this.vel = 0; }
  move(x, y) { if (!this.drag) return; this.scroll = this.drag.s0 - (y - this.drag.y0); const now = performance.now(), dt = Math.max(1, now - this.drag.lt) / 1000; this.vel = -(y - this.drag.ly) / dt; this.drag.ly = y; this.drag.lt = now; }
  up() { this.drag = null; }
}

// ---------- Freunde + Mehrspieler ----------
const CLEAR_BONUS = 200;   // extra Taler, wenn ein Bereich geschafft ist (statt Skin)
const HELP_COINS = { easy: 10, medium: 15, hard: 25 };   // je Person, der man hilft
const MP_COINS = { win: 40, lose: 25, team: 50, perKid: 10, place: [60, 35, 20, 10] };   // Mehrspieler: pro geschafftem Auftrag + nach Platzierung
function needOnline(c, back) {
  const a = ACC();
  if (a && a.token) return false;
  const w = Math.min(W - 30, 420), h = 200, x = (W - w) / 2, y = (H - h) / 2;
  panel(c, x, y, w, h, '#fff7e6', 24);
  icon(c, 'friends', W / 2, y + 40, 44);
  wrapLines(c, 'Für Freunde und Mehrspieler brauchst du ein gesichertes Konto. Tippe auf „Spielstand sichern“.', w - 40, 15).forEach((l, i) => txt(c, l, W / 2, y + 84 + i * 20, 15, '#3d2c1f', 'center', null));
  const qa = false,   /* Sofort-Sichern mit dem Bilder-Code gibt es nicht mehr: gesichert wird mit Passwort */ bw = qa ? Math.min(190, (w - 40) / 2) : 220;
  rrPath(c, W / 2 - (qa ? bw + 6 : 110), y + h - 56, bw, 44, 18); fs(c, qa ? '#bde0fe' : '#06d6a0', 3); txt(c, qa ? 'Selbst einrichten' : 'Spielstand sichern', W / 2 - (qa ? bw / 2 + 6 : 0), y + h - 33, 15, qa ? '#3d2c1f' : '#fff', 'center', qa ? null : BRAND.ink);
  UI.btn(W / 2 - (qa ? bw + 6 : 110), y + h - 56, bw, 44, () => setScene(new NewAccount({ migrate: Save.data.current })));
  if (qa) {   // Gast-Modus: mit einem Tipp sichern – mit dem Namen und Code, die man schon hat
    rrPath(c, W / 2 + 6, y + h - 56, bw, 44, 18); fs(c, '#06d6a0', 3); txt(c, quickSecure.busy ? '…' : 'Sofort mitspielen', W / 2 + 6 + bw / 2, y + h - 33, 15, '#fff', 'center', BRAND.ink);
    UI.btn(W / 2 + 6, y + h - 56, bw, 44, () => quickSecure());
  }
  return true;
}
async function quickSecure() {
  if (quickSecure.busy) return; quickSecure.busy = true;
  const a = ACC(), na = new NewAccount({ migrate: Save.data.current }); na.avatar = a.avatar || 0;
  try {
    for (let k = 0; k < 4; k++) {
      na.name = (k ? a.name.slice(0, 10) + Math.floor(10 + rnd() * 89) : a.name).slice(0, 14); na.err = '';
      await na.register(a.code.slice());
      if (ACC() && ACC().token) { toast('Gesichert!', 'Jetzt kannst du mitspielen', 'friends'); setScene(new MultiScene()); return; }
      if (!/Namen gibt es schon/.test(na.err || '')) break;
    }
    toast('Hat nicht geklappt', na.err || 'Versuch es gleich nochmal', 'friends');
  } finally { quickSecure.busy = false; }
}
function wearSkin(id) { ['easy', 'medium', 'hard'].forEach(d => { DP(d).equip = id; }); Save.write(); Sfx.play('good'); }
function api(body) { const a = ACC(); return Net.call(Object.assign({ login: a.login, token: a.token }, body)); }

// Punkte für die Freundes-Bestenliste: geschaffte Bereiche (je Stufe) × 10 + Erfolge
function myScore() { let n = 0; try { ['easy', 'medium', 'hard'].forEach(d => STAGE_ORDER.forEach(id => { if (SP(d, id).clears > 0) n += 10; })); n += Object.keys(META().ach || {}).length; } catch (e) {} return n; }
class MultiScene {
  constructor() { this.t = 0; this.data = null; this.err = ''; this.busy = false; this.mode = 'menu'; this.opts = { mode: 'duell', size: 2, diff: CUR_DIFF || 'medium', kids: 3, boss: false, live: true, stage: 'spielplatz', stages: ['spielplatz'] }; this.pollT = 0; }
  enter() { FX.clear(); nameInput.value = ''; if (ACC() && ACC().token) this.refresh(); }
  async refresh() { const r = await api({ action: 'friends', score: myScore() }); if (r && r.status === 200) { this.data = r.data; this.err = ''; } else if (!r) this.err = 'Gerade keine Verbindung. Versuch es gleich nochmal.'; }
  update(dt) { this.t += dt; this.pollT += dt; if (this.pollT > 8 && ACC() && ACC().token) { this.pollT = 0; this.refresh(); } }
  leave(s) { nameInput.style.display = 'none'; nameInput.blur(); setScene(s); }
  // Freunde: per Freundes-Code eine Anfrage schicken – befreundet erst, wenn der andere annimmt
  async addFriend() {
    const v = nameInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); if (v.length !== 6) return; nameInput.blur(); this.busy = true;
    const r = await api({ action: 'friend_request', fcode: v }); this.busy = false;
    if (r && r.status === 200) {
      this.data = r.data; this.mode = 'menu'; nameInput.value = ''; Sfx.play('win');
      if (r.data.result === 'friends') { achieve('freund'); toast('Ihr seid jetzt Freunde!', r.data.name, 'friends'); }
      else if (r.data.result === 'already') toast('Schon befreundet', r.data.name || '', 'friends');
      else toast('Anfrage geschickt!', (r.data.name || 'Dein Freund') + ' muss sie noch annehmen', 'friends');
    }
    else this.err = !r ? 'Gerade keine Verbindung. Versuch es gleich nochmal.' : r.data && r.data.error === 'self' ? 'Das ist dein eigener Code!' : 'Diesen Freundes-Code gibt es nicht.';
  }
  async answer(req, yes) {
    const r = await api({ action: 'friend_answer', from: req.login, yes }); if (r && r.status === 200) { this.data = r.data; Sfx.play(yes ? 'win' : 'tap'); if (yes) { achieve('freund'); toast('Ihr seid jetzt Freunde!', req.name, 'friends'); } }
  }
  async create(invite) {
    this.busy = true; const r = await api({ action: 'lobby_new', opts: this.opts, invite: invite || null }); this.busy = false;
    if (r && r.status === 200) this.leave(new LobbyScene(r.data, this.opts.mode)); else this.err = 'Das hat nicht geklappt.';
  }
  async join(code) {
    this.busy = true; const r = await api({ action: 'lobby_join', code }); this.busy = false;
    if (r && r.status === 200) this.leave(new LobbyScene(r.data, r.data.opts.mode || 'duell')); else this.err = !r ? 'Gerade keine Verbindung. Versuch es gleich nochmal.' : r.status === 409 ? 'Dieses Spiel ist schon voll.' : 'Diesen Code gibt es nicht.';
  }
  draw(c) {
    themeBg(c, 'park');
    topBar(c, () => (this.mode === 'menu' ? this.leave(new Menu()) : (this.mode = 'menu', nameInput.style.display = 'none')));
    icon(c, 'friends', 104, 44, 40); txt(c, 'Freunde & Mehrspieler', 130, 44, 20, '#fff', 'left', BRAND.olive);
    if (needOnline(c)) return;
    const land = W > H, top = 86;
    if (this.mode === 'stages') {   // Bereiche auswählen (Duell: mehrere nacheinander, Zusammen: einer)
      const o = this.opts, w = Math.min(W - 30, 460), x = (W - w) / 2, y = top + 4, team = o.mode === 'team';
      panel(c, x, y, w, Math.min(H - top - 12, 260), '#fff7e6', 24);
      txt(c, team ? 'In welchem Bereich spielt ihr?' : 'Welche Bereiche spielt ihr nacheinander?', W / 2, y + 26, 15, '#3d2c1f', 'center', null);
      const bw = (w - 40) / 3;
      STAGE_ORDER.forEach((id, i) => { const bx = x + 14 + (i % 3) * (bw + 6), by = y + 50 + Math.floor(i / 3) * 56, on = o.stages.includes(id); rrPath(c, bx, by, bw, 46, 14); fs(c, on ? '#ffd166' : '#fff', 2.5); txt(c, STAGE_INFO[id].name, bx + bw / 2, by + 23, 13, '#3d2c1f', 'center', null); if (on && !team) txt(c, String(o.stages.indexOf(id) + 1), bx + 14, by + 12, 11, '#c9762f', 'center', null);
        UI.btn(bx, by, bw, 46, () => { if (team) o.stages = [id]; else if (on) { if (o.stages.length > 1) o.stages = o.stages.filter(s => s !== id); } else o.stages = STAGE_ORDER.filter(s => s === id || o.stages.includes(s)); o.stage = o.stages[0]; Sfx.play('tap'); }); });
      roundBtn(c, W / 2, y + 196, 26, '#06d6a0', 'check', () => { this.mode = 'menu'; });
      return;
    }
    if (this.mode === 'add' || this.mode === 'code') {
      const w = Math.min(W - 30, 420), x = (W - w) / 2, y = top + 10;
      const add = this.mode === 'add', my = this.data && this.data.myCode;
      panel(c, x, y, w, add ? 290 : 220, '#fff7e6', 24);
      txt(c, add ? 'Freundes-Code deines Freundes' : 'Spiel-Code (4 Buchstaben)', W / 2, y + 36, 17, '#3d2c1f', 'center', null);
      if (add) {   // eigenen Code zeigen + teilen
        txt(c, 'Dein Freundes-Code:', W / 2 - 40, y + 238, 13, '#6b5a48', 'right', null);
        rrPath(c, W / 2 - 34, y + 222, 120, 32, 10); fs(c, '#e7f5ff', 2.5); txt(c, my || '…', W / 2 + 26, y + 239, 20, '#118ab2', 'center', null);
        if (my) roundBtn(c, W / 2 + 112, y + 238, 17, '#caffbf', 'friends', async () => { const t = 'Werde mein Freund bei „Mission: Im Original“! Mein Freundes-Code: ' + my; try { if (navigator.share) await navigator.share({ title: 'Mission: Im Original', text: t }); else { await navigator.clipboard.writeText(t); toast('Kopiert!', 'Schick den Code deinem Freund', 'friends'); } } catch (e) { /* abgebrochen */ } });
        wrapLines(c, 'Der andere muss deine Anfrage annehmen.', w - 40, 12).forEach((l, i) => txt(c, l, W / 2, y + 270 + i * 15, 12, '#8d5a3b', 'center', null));
      }
      Object.assign(nameInput.style, { display: this.busy ? 'none' : 'block', left: (x + 24) + 'px', top: (y + 58) + 'px', width: (w - 48) + 'px', height: '52px' });
      nameInput.placeholder = this.mode === 'add' ? 'z. B. K7P2QX' : 'z. B. KLMP'; nameInput.maxLength = this.mode === 'add' ? 6 : 4;
      nameInput.value = nameInput.value.toUpperCase();
      if (this.err) txt(c, this.err, W / 2, y + 132, 14, '#c1121f', 'center', null);
      const ok = !this.busy && nameInput.value.trim().length >= (this.mode === 'code' ? 4 : 6);
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
    { const L = ACC().mpLast; if (L && Date.now() - L.at < 30 * 60000) { rrPath(c, lx + 10, yy, lw - 20, 44, 14); fs(c, '#caffbf', 2.5); txt(c, 'Spiel ' + L.code + ' läuft noch', lx + 22, yy + 22, 14, '#3d2c1f', 'left', null);
      rrPath(c, lx + lw - 120, yy + 6, 100, 32, 12); fs(c, '#06d6a0', 2); txt(c, 'Zurück ins Spiel', lx + lw - 70, yy + 22, 11, '#fff', 'center', null); UI.btn(lx + lw - 120, yy + 6, 100, 32, () => { ACC().mpLast = null; this.join(L.code); }); yy += 52; } }   /* nach Verbindungsabbruch wieder beitreten */
    if (d && d.invites && d.invites.length) d.invites.slice(-2).forEach(inv => {
      rrPath(c, lx + 10, yy, lw - 20, 44, 14); fs(c, '#ffd166', 2.5); txt(c, inv.from.name + ' lädt dich ein!', lx + 22, yy + 22, 14, '#3d2c1f', 'left', null);
      rrPath(c, lx + lw - 100, yy + 6, 80, 32, 12); fs(c, '#06d6a0', 2); txt(c, 'Mitspielen', lx + lw - 60, yy + 22, 12, '#fff', 'center', null); UI.btn(lx + lw - 100, yy + 6, 80, 32, () => this.join(inv.code)); yy += 52;
    });
    if (d && d.requests && d.requests.length) d.requests.slice(-2).forEach(rq => {   // Freundschaftsanfragen: annehmen oder nicht
      rrPath(c, lx + 10, yy, lw - 20, 44, 14); fs(c, '#bde0fe', 2.5); c.font = `900 13px ${FONT}`;
      txt(c, rq.name, lx + 22, yy + 15, 14, '#3d2c1f', 'left', null); txt(c, 'möchte dein Freund sein', lx + 22, yy + 32, 11, '#1d4e89', 'left', null);
      roundBtn(c, lx + lw - 76, yy + 22, 15, '#06d6a0', 'check', () => this.answer(rq, true));
      roundBtn(c, lx + lw - 38, yy + 22, 15, '#ced4da', 'cross', () => this.answer(rq, false)); yy += 52;
    });
    if (!d) txt(c, this.err || 'Lade …', lx + lw / 2, yy + 20, 14, '#6b5a48', 'center', null);
    else if (!d.friends.length) wrapLines(c, 'Noch keine Freunde. Tipp auf „+ hinzufügen“ und gib den Freundes-Code deines Freundes ein!', lw - 40, 13).forEach((l, i) => txt(c, l, lx + lw / 2, yy + 16 + i * 18, 13, '#6b5a48', 'center', null));
    else { txt(c, 'Bestenliste – du: ★ ' + myScore(), lx + 18, yy + 8, 12, '#6b5a48', 'left', null); yy += 20; }
    if (d && d.friends.length) d.friends.slice().sort((p1, p2) => (p2.score || 0) - (p1.score || 0)).slice(0, Math.floor((top + lh - yy) / 46)).forEach(f => {
      rrPath(c, lx + 10, yy, lw - 20, 40, 14); fs(c, '#fff', 2);
      drawCritter(c, AVATARS[(f.avatar || 0) % 6], lx + 30, yy + 36, 0.5, this.t, { noShadow: true });
      ell(c, lx + 46, yy + 12, 5, 5); c.fillStyle = f.online ? '#06d6a0' : '#adb5bd'; c.fill();
      txt(c, f.name, lx + 56, yy + 21, 14, '#3d2c1f', 'left', null); txt(c, '★ ' + (f.score || 0), lx + lw - 112, yy + 21, 12, '#c9762f', 'right', null);
      rrPath(c, lx + lw - 100, yy + 5, 80, 30, 12); fs(c, '#bde0fe', 2); txt(c, 'Einladen', lx + lw - 60, yy + 20, 12, '#3d2c1f', 'center', null);
      UI.btn(lx + lw - 100, yy + 5, 80, 30, () => this.create(f.login)); yy += 46;
    });
    // Spiel einstellen
    panel(c, rx, ry, rw, rh, '#fff7e6', 22);
    const o = this.opts, duel = o.mode !== 'team', multi = o.mode === 'duell', more = !!this.more, nRows = more ? (duel ? 6 : 5) + 0.6 : 3.6, rowH = clamp((rh - 72) / nRows, 38, 86), bh = clamp(rowH - 20, 22, 46), small = rowH < 52;
    const seg = (y, label, vals, isSel, set, maxW = 150) => {
      txt(c, label, rx + 16, y, 13, '#6b5a48', 'left', null); const bw = Math.min(maxW, (rw - 32) / vals.length - 6);
      vals.forEach(([v, name], i) => { const bx = rx + 16 + i * (bw + 6), sel = isSel(v); rrPath(c, bx, y + 10, bw, bh, 12); fs(c, sel ? '#ffd166' : '#fff', 2.5); txt(c, name, bx + bw / 2, y + 10 + bh / 2, bw < 80 ? 11 : 13, '#3d2c1f', 'center', null); UI.btn(bx, y + 10, bw, bh, () => { set(v); Sfx.play('tap'); }); });
    };
    let y = ry + 20;
    seg(y, 'Modus', [['duell', small || rw < 520 ? 'Jeder gegen jeden' : 'Jeder gegen jeden'], ['team', 'Alle zusammen'], ['2v2', '2 gegen 2']], v => o.mode === v, v => { o.mode = v; if (v !== 'duell') o.stages = [o.stages[0]]; if (v === '2v2') { o.size = 4; o.boss = false; } o.stage = o.stages[0]; }, 180); y += rowH;
    seg(y, 'Wie viele Spieler?', [[2, '2'], [3, '3'], [4, '4']], v => (o.mode === '2v2' ? v === 4 : o.size === v), v => { if (o.mode === '2v2') { o.size = 4; this.err = '2 gegen 2 braucht genau 4 Spieler.'; } else o.size = v; }, 90); y += rowH;
    seg(y, multi ? 'Bereiche (mehrere = nacheinander)' : 'Bereich', STAGE_ORDER.map(id => [id, small || rw < 560 ? { kueche: 'Küche', gastraum: 'Innen', aussen: 'Außen', spielplatz: 'Spielplatz', parkplatz: 'Parkplatz', chalet: 'Chalet' }[id] : STAGE_INFO[id].name]), v => o.stages.includes(v), v => { if (!multi) o.stages = [v]; else if (o.stages.includes(v)) { if (o.stages.length > 1) o.stages = o.stages.filter(x => x !== v); } else o.stages = STAGE_ORDER.filter(x => x === v || o.stages.includes(x)); o.stage = o.stages[0]; }); y += rowH;
    { const lab = more ? 'Weniger Optionen ▲' : 'Mehr Optionen ▼ (' + { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' }[o.diff] + ', ' + o.kids + (o.mode === 'team' ? ' Aufträge' : ' Leute') + (duel ? ', Finale ' + (o.boss ? 'ja' : 'nein') : '') + ')'; c.font = `900 13px ${FONT}`; const lw = c.measureText(lab).width + 26; rrPath(c, rx + 16, y + 2, lw, 28, 14); fs(c, 'rgba(255,255,255,.7)', 2, 'rgba(61,44,31,.3)'); txt(c, lab, rx + 29, y + 17, 13, '#6b5a48', 'left', null); UI.btn(rx + 16, y + 2, lw, 28, () => { this.more = !more; Sfx.play('tap'); }); y += rowH * 0.6; }   /* selten gebrauchte Einstellungen eingeklappt */
    if (more) {
    seg(y, 'Stufe', [['easy', 'Leicht'], ['medium', 'Mittel'], ['hard', 'Schwer']], v => o.diff === v, v => (o.diff = v)); y += rowH;
    seg(y, o.mode === 'team' ? 'Wie viele Aufträge? (1 = ein großer Team-Auftrag)' : 'Wie vielen Leuten pro Bereich helfen?', [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']], v => o.kids === v, v => (o.kids = v), 90); y += rowH;
    if (duel) {
      
      const hw = (rw - 44) / 2;
      [[hw < 300 ? 'Finale' : 'Finale am Ende', o.boss, () => (o.boss = o.mode === '2v2' ? false : !o.boss)], [hw < 300 ? 'Gegner sehen' : 'Gegner live sehen', o.live, () => (o.live = !o.live)]].forEach(([lab, on, fn], i) => {
        const bx = rx + 14 + i * (hw + 16), boxH = bh + 12; rrPath(c, bx, y - 4, hw, boxH, 14); fs(c, 'rgba(255,255,255,.55)', 2, 'rgba(61,44,31,.35)');
        txt(c, lab, bx + 10, y + boxH / 2 - 4, 12, '#6b5a48', 'left', null);
        const tw2 = Math.min(64, hw / 5); [['Ja', true], ['Nein', false]].forEach(([n, v], k) => { const tx = bx + hw - 8 - (2 - k) * (tw2 + 4), sel = on === v; rrPath(c, tx, y + 2, tw2, bh, 12); fs(c, sel ? (v ? '#06d6a0' : '#ffd166') : '#fff', 2.5); txt(c, n, tx + tw2 / 2, y + 2 + bh / 2, 13, '#3d2c1f', 'center', null); UI.btn(tx, y + 2, tw2, bh, () => { if (on !== v) fn(); Sfx.play('tap'); }); });
      });
    }
    }
    const by = ry + rh - 34, bw2 = (rw - 42) / 2;
    rrPath(c, rx + 14, by - 22, bw2, 44, 16); fs(c, '#06d6a0', 3); txt(c, this.busy ? '…' : 'Spiel erstellen', rx + 14 + bw2 / 2, by, 15, '#fff', 'center', BRAND.ink); UI.btn(rx + 14, by - 22, bw2, 44, () => { if (!this.busy) this.create(); });
    rrPath(c, rx + 28 + bw2, by - 22, bw2, 44, 16); fs(c, '#bde0fe', 3); txt(c, 'Code eingeben', rx + 28 + bw2 * 1.5, by, 15, '#3d2c1f', 'center', null); UI.btn(rx + 28 + bw2, by - 22, bw2, 44, () => { this.mode = 'code'; this.err = ''; nameInput.value = ''; });
    if (this.err && this.mode === 'menu') txt(c, this.err, W / 2, H - 10, 13, '#c1121f', 'center', null);
  }
}

// QR-Code-Bibliothek erst laden, wenn man sie braucht
function lobbyQR(url) {
  if (lobbyQR.url === url && lobbyQR.q) return lobbyQR.q;
  if (typeof qrcode === 'function') { try { const q = qrcode(0, 'M'); q.addData(url); q.make(); lobbyQR.url = url; lobbyQR.q = q; return q; } catch (e) { return null; } }
  if (!lobbyQR.loading) { lobbyQR.loading = true; const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'; document.head.appendChild(sc); }
  return null;
}
// Warteraum: Code zeigen, auf Mitspieler warten, Host startet
class LobbyScene {
  constructor(lobby, mode) { this.lob = lobby; this.mode = lobby.opts.mode || mode || 'duell'; this.t = 0; this.pollT = 0; this.me = null; this.started = false; }
  enter() { FX.clear(); this.poll(); }
  async poll(extra = {}) {
    const r = await api(Object.assign({ action: 'lobby_poll', code: this.lob.code }, extra));
    if (r && r.status === 200) { this.lob = r.data.lobby; this.me = r.data.me; if (this.lob.status === 'run' && !this.started) this.start(); if (this.lob.status === 'closed' && !this.started) { setScene(new MultiScene()); } }
  }
  start() { this.started = true; Sfx.play('win'); ACC().mpLast = { code: this.lob.code, at: Date.now() }; Save.write(); const m = new Match(this.lob, this.me); setScene(new Play(this.lob.opts.diff, { mp: m })); }
  update(dt) { this.t += dt; this.pollT += dt; if (this.pollT > 1.5) { this.pollT = 0; this.poll(); } }
  draw(c) {
    themeBg(c, 'park');
    topBar(c, () => { api({ action: 'lobby_poll', code: this.lob.code, leave: true }); setScene(new MultiScene()); });
    const w = Math.min(W - 30, 460), h = Math.min(H - 150, 290), x = (W - w) / 2, y = 76, py = y + Math.min(190, h - 78);
    panel(c, x, y, w, h, '#fff7e6', 24);
    const o = this.lob.opts, stars = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' }[o.diff];
    txt(c, (o.size || 2) + ' Spieler · ' + (o.mode === 'team' ? 'Zusammen · ' + stars : (o.mode === '2v2' ? '2 gegen 2 · ' : 'Duell · ') + o.kids + (o.kids === 1 ? ' Person' : ' Leute') + ' pro Bereich' + (o.boss ? ' + Finale' : '') + ' · ' + stars), W / 2, y + 30, Math.min(18, w / 22), BRAND.olive, 'center', null);
    txt(c, 'Spiel-Code', W / 2, y + 62, 13, '#6b5a48', 'center', null);
    { const url = location.href.split('?')[0].split('#')[0] + '?mit=' + this.lob.code, bx = W / 2 + 140, by = y + 96;
      roundBtn(c, bx, by, 20, '#caffbf', 'friends', async () => { const t = 'Spiel mit mir „Mission: Im Original“! Code: ' + this.lob.code; try { if (navigator.share) await navigator.share({ title: 'Mission: Im Original', text: t, url }); else { await navigator.clipboard.writeText(t + ' ' + url); toast('Link kopiert', 'Schick ihn deinen Freunden', 'friends'); } } catch (e) { /* abgebrochen */ } }, '#2d6a4f');
      if (h >= 270) txt(c, 'Teilen', bx, by + 30, 11, '#6b5a48', 'center', null);
      const Q = lobbyQR(url); if (Q && W > 620) { const n = Q.getModuleCount(), qs = Math.min(150, (W - x - w - 30)), cell = qs / (n + 2), qx = x + w + 14, qy = y; if (qs > 90) { rrPath(c, qx, qy, qs, qs + 22, 12); fs(c, '#fff', 3); c.fillStyle = '#212529'; for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (Q.isDark(r, k)) c.fillRect(qx + (k + 1) * cell, qy + (r + 1) * cell, cell + 0.4, cell + 0.4); txt(c, 'Mit Handy scannen', qx + qs / 2, qy + qs + 8, 11, '#6b5a48', 'center', null); } } }   /* QR-Code: Freunde scannen statt abtippen */
    this.lob.code.split('').forEach((ch, i) => { const cx = W / 2 + (i - 1.5) * 52; rrPath(c, cx - 22, y + 74, 44, 52, 12); fs(c, '#fff', 3); txt(c, ch, cx, y + 101, 30, '#118ab2', 'center', null); });
    const size = o.size || 2, ppl = (this.lob.players || [this.lob.host, this.lob.guest].filter(Boolean)).slice(0, size); while (ppl.length < size) ppl.push(null);
    const gap = Math.min(110, (w - 40) / size);
    ppl.forEach((p, i) => { const cx = W / 2 + (i - (size - 1) / 2) * gap, cy = py, teamCol = o.mode === '2v2' ? (i % 2 ? '#ffc8dd' : '#bde0fe') : null; ell(c, cx, cy - 10, 30, 30); fs(c, p ? (teamCol || '#d8f3dc') : '#e9ecef', 3);
      if (p) { drawCritter(c, AVATARS[(p.avatar || 0) % 6], cx, cy + 14, 0.9, this.t + i, { noShadow: true }); txt(c, p.name, cx, cy + 40, 13, '#3d2c1f', 'center', null); }
      else { const b = Math.sin(this.t * 4 + i) * 3; txt(c, '?', cx, cy - 10 + b, 26, '#adb5bd', 'center', null); txt(c, 'wartet …', cx, cy + 40, 12, '#adb5bd', 'center', null); } });
    const need = o.mode === '2v2' ? 4 : 2, have = ppl.filter(Boolean).length;
    txt(c, o.mode === 'team' ? 'alle zusammen' : o.mode === '2v2' ? (have < 4 ? 'Für 2 gegen 2 braucht ihr 4 (' + have + '/4)' : 'Blau gegen Rosa') : 'jeder gegen jeden', W / 2, Math.min(py + 62, y + h - 14), 13, '#6b5a48', 'center', null);
    if (this.me === 'host' && have >= need) {
      const pu = 1 + Math.sin(this.t * 5) * 0.05; c.save(); c.translate(W / 2, y + h + 34); c.scale(pu, pu); rrPath(c, -110, -26, 220, 52, 22); fs(c, '#06d6a0', 3.5); txt(c, 'Los geht’s!', 0, 1, 20, '#fff', 'center', BRAND.ink); c.restore();
      UI.btn(W / 2 - 110, y + h + 8, 220, 52, () => this.poll({ start: true }));
    } else if (this.me === 'host' && o.mode === '2v2' && have >= 2) {
      rrPath(c, W / 2 - 130, y + h + 8, 260, 48, 20); fs(c, '#ffd166', 3); txt(c, 'Ohne Teams starten (' + have + ' Spieler)', W / 2, y + h + 33, 15, '#3d2c1f', 'center', null);
      UI.btn(W / 2 - 130, y + h + 8, 260, 48, () => this.poll({ start: true, asDuel: true }));
    } else txt(c, this.me === 'guest' ? 'Warte, bis ' + this.lob.host.name + ' startet …' : have < need ? 'Sag deinen Freunden den Code! (' + have + '/' + need + ')' : 'Sag deinen Freunden den Code!', W / 2, y + h + 30, 15, '#fff', 'center', BRAND.ink);
  }
}

// ---------- Laufendes Mehrspieler-Spiel: Fortschritt senden/abholen ----------
class Match {
  get stage() { return this.stages[this.si] || 'spielplatz'; }
  constructor(lob, me) {
    this.stages = (lob.opts && lob.opts.stages && lob.opts.stages.length ? lob.opts.stages : [(lob.opts && lob.opts.stage) || 'spielplatz']);
    this.mode = lob.opts.mode || 'duell'; if (this.mode !== 'duell') this.stages = this.stages.slice(0, 1);
    this.si = 0; this.elapsed = 0; this.lob = lob; this.me = me; this.code = lob.code; this.seed = lob.seed; this.opts = lob.opts;
    this.players = lob.players || [lob.host].concat(lob.guest ? [lob.guest] : []);
    const mine = cleanL(ACC().login); this.idx = Math.max(0, this.players.findIndex(p => cleanL(p.login) === mine)); if (this.idx === 0 && me === 'guest') this.idx = 1;
    this.n = this.players.length; this.team = this.mode === '2v2' ? this.idx % 2 : 0;
    const oth = this.players.filter((p, i) => i !== this.idx);
    this.mates = this.mode === '2v2' ? this.players.filter((p, i) => i !== this.idx && i % 2 === this.team) : this.mode === 'team' ? oth : [];
    this.foes = this.mode === '2v2' ? this.players.filter((p, i) => i % 2 !== this.team) : [];
    this.otherName = this.mode === '2v2' ? this.foes.map(p => p.name).join(' & ') : oth.map(p => p.name).join(' & ');
    this.others = []; this.other = null; this.prog = {}; this.lastOther = Date.now(); this.over = null; this.busy = false; this.t0 = Date.now(); this.loop();
  }
  async loop() { while (this.over !== 'done') { await this.sync(); await new Promise(r => setTimeout(r, 1000)); } }   // sparsam: jeder Abgleich kostet Speicher-Zugriffe
  set(p) { Object.assign(this.prog, p); }
  async sync() {
    if (this.busy || this.over === 'done') return; this.busy = true;
    const r = await api({ action: 'lobby_poll', code: this.code, progress: this.prog }); this.busy = false;
    if (r && r.status === 200) {
      const prev = this.others; this.others = (r.data.others || (r.data.other ? [{ idx: this.idx ? 0 : 1, name: this.otherName, prog: r.data.other }] : [])).map(o => ({ ...o, mate: this.mode === 'team' || (this.mode === '2v2' && o.idx % 2 === this.team) }));
      if (this.others.some(o => o.prog && !(prev.find(q => q.idx === o.idx && q.prog && q.prog.at === o.prog.at)))) this.lastOther = Date.now();
      // zusammengefasste Sicht auf die Mitspieler (für Team-Aufgaben + Anzeige)
      const P = this.others.filter(o => o.prog && !o.gone).map(o => o.prog);
      if (P.length) this.other = { pos: P[0].pos, done: Math.max(...P.map(p => p.done || 0)), got: [].concat(...P.map(p => p.got || [])), sw: (P.find(p => p.sw) || {}).sw || 0, hold: P.some(p => p.hold), chestOpen: P.some(p => p.chestOpen), chest: P.some(p => p.chest), roof: P.some(p => p.roof), fin: P.some(p => p.fin), at: Math.max(...P.map(p => p.at || 0)) };
      const lob = r.data.lobby; if (lob.status === 'closed' && lob.left !== cleanL(ACC().login) && !this.over) this.over = 'left';
    }
    if (!this.over && Date.now() - this.lastOther > 90000) this.over = 'lost';   // Verbindung zu allen anderen weg
  }
  stop() { this.over = 'done'; }
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
