'use strict';
// ---------- Taler, Erfolge, Laden, Freunde, Mehrspieler ----------
// Taler verdient man mit Erfolgen und im Mehrspieler; ausgeben im Laden (Joker max. 3 pro Tag, Skins, neue Tiere).

function META(a = ACC()) {
  if (!a) return null;
  if (!a.meta) a.meta = {};
  const m = a.meta;
  m.coins = m.coins || 0; m.ach = m.ach || {}; m.st = m.st || {}; m.skins = m.skins || []; m.animals = m.animals || []; m.bank = m.bank || 0; m.up = m.up || {};
  if (!m.upMig) upgradeMigrate(a, m);
  if (m.skins.some(id => !SKINS[id])) m.skins = m.skins.filter(id => SKINS[id]);
  if (m.animals.some(k => !BASE_ANIMALS.includes(k))) { for (const k of m.animals) { const o = OLD_ANIMALS.find(q => q[0] === k); if (o && !BASE_ANIMALS.includes(k)) m.coins += o[1]; } m.animals = []; }   // Figuren gibt es nicht mehr: Taler zurück
  if (a.char && !BASE_ANIMALS.includes(a.char)) a.char = DEFAULT_CHAR[a.lastDiff] || 'dog';   // Halloween-Kostüme u. a. gibt es nicht mehr
  if (m.skins.some(id => REMOVED_SKINS[id])) { for (const id of m.skins) if (REMOVED_SKINS[id]) m.coins += REMOVED_SKINS[id]; m.skins = m.skins.filter(id => !REMOVED_SKINS[id]); }   // kurz verkaufte Skins der Vorversion: Taler zurück
  return m;
}
const REMOVED_SKINS = { sk_erdbeer: 40, sk_meer: 40, sk_garten: 40, sk_zitrone: 40, sk_minze: 40, sk_kakao: 40, sk_himmel: 40, sk_kirsch: 40, sk_lavendel: 40, sk_huette: 40, sk_ranger: 100, sk_schnee: 100, sk_zirkus: 100, sk_goldkoch: 250 };
// ---------- Tagesgeschenk: jeden Tag ein Päckchen zum Auspacken, 7 im Wechsel (ein verpasster Tag macht nichts – es geht einfach weiter) ----------
const DAILY = [{ t: 'coins', n: 20 }, { t: 'coins', n: 30 }, { t: 'hint', n: 1 }, { t: 'coins', n: 40 }, { t: 'joker', n: 1 }, { t: 'coins', n: 50 }, { t: 'joker', n: 1 }];
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function giftReady() { return false; }   // Tagesgeschenk gibt es nicht mehr (User-Wunsch)
function giftText(g) { return g.t === 'coins' ? g.n + ' Taler' : g.t === 'hint' ? 'Such-Joker' : g.t === 'joker' ? 'Joker' : 'Joker'; }
function giftIcon(c, g, x, y, s) { if (g.t === 'coins') { icon(c, 'coin', x, y - s * 0.12, s * 0.8); txt(c, String(g.n), x, y + s * 0.42, Math.max(11, s * 0.32), '#3d2c1f', 'center', '#fff'); } else if (g.t === 'hint') icon(c, 'search', x, y, s * 0.85); else if (g.t === 'joker') icon(c, 'joker', x, y, s * 0.85); else { ell(c, x, y, s * 0.42, s * 0.42); for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(x, y); c.arc(x, y, s * 0.42, k * TAU / 6, (k + 1) * TAU / 6); c.closePath(); c.fillStyle = ['#ffd166', '#a5d8ff', '#ffafcc', '#80ed99', '#cdb4db', '#fff3bf'][k]; c.fill(); } ell(c, x, y, s * 0.42, s * 0.42); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); } }
function drawPresent(c, x, y, s, t = 0, open = 0) {   // Päckchen mit Schleife; open 0…1 hebt den Deckel ab
  c.save(); c.translate(x, y); c.scale(s / 40, s / 40);
  rrPath(c, -16, -10, 32, 26, 4); fs(c, '#ef476f', 2.5); c.fillStyle = '#ffd166'; c.fillRect(-3, -10, 6, 26); rrPath(c, -16, -10, 32, 26, 4); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke();
  c.save(); c.translate(0, -open * 18); c.rotate(-open * 0.5); rrPath(c, -19, -17, 38, 9, 3); fs(c, '#ef476f', 2.5); c.fillStyle = '#ffd166'; c.fillRect(-3, -17, 6, 9);
  for (const sx of [-1, 1]) { ell(c, sx * 7, -21, 7, 4.5, sx * 0.5); fs(c, '#ffd166', 2); } ell(c, 0, -19, 3, 3); fs(c, '#ffd166', 2); c.restore();
  c.restore();
}
function giveGift(g) {
  const m = META();
  if (g.t === 'coins') m.coins += g.n; else if (g.t === 'hint') m.hint = (m.hint || 0) + g.n; else m.bank = (m.bank || 0) + g.n;   // (früher: Gratis-Dreh – das Glücksrad gibt es nicht mehr)
  m.giftDay = todayStr(); m.giftIdx = ((m.giftIdx || 0) + 1) % DAILY.length; Save.write();
}
class DailyGift {
  constructor() { this.t = 0; this.open = 0; const m = META(); this.i = (m.giftIdx || 0) % DAILY.length; this.done = !giftReady(); Voice.say(this.done ? 'Das Geschenk für heute hast du schon. Morgen gibt es das nächste!' : 'Dein Geschenk für heute! Tippe drauf und pack es aus.', true); }
  update(dt) { this.t += dt; if (this.opening) this.open = Math.min(1, this.open + dt * 2.2); }
  close() { if (overlay === this) overlay = null; Voice.stop(); }
  draw(c) {
    c.fillStyle = 'rgba(16,28,18,.75)'; c.fillRect(0, 0, W, H);
    const w = Math.min(W - 24, 560), h = Math.min(H - 20, 330), x = (W - w) / 2, y = (H - h) / 2; fitBegin(c, w, h + 10);
    panel(c, x, y, w, h, '#fff7e6', 26); roundBtn(c, x + w - 28, y + 28, 18, '#ced4da', 'cross', () => this.close());
    txt(c, 'Tagesgeschenk', W / 2, y + 30, 22, BRAND.olive, 'center', null);
    // die 7 Päckchen: schon ausgepackt (Haken), heute (groß), noch zu (klein)
    const n = DAILY.length, cw = Math.min(64, (w - 40) / n - 6), y0 = y + h - 54;
    DAILY.forEach((g, k) => { const cx = W / 2 + (k - (n - 1) / 2) * (cw + 6), cur = k === this.i, past = k < this.i || (cur && (this.done || this.opening));
      rrPath(c, cx - cw / 2, y0 - 26, cw, 52, 12); fs(c, cur ? '#fff3bf' : past ? '#d8f5e3' : '#fff', cur ? 3 : 2, cur ? '#c9a227' : OL);
      if (past) { giftIcon(c, g, cx, y0 - 2, cw * 0.55); ell(c, cx + cw / 2 - 8, y0 - 18, 7, 7); fs(c, '#06d6a0', 1.5); icon(c, 'check', cx + cw / 2 - 8, y0 - 18, 10, '#fff'); }
      else drawPresent(c, cx, y0 + 4, cw * 0.62, this.t);
      txt(c, 'Tag ' + (k + 1), cx, y0 + 34, 10, '#6b5a48', 'center', null); });
    // heute: großes Päckchen
    const g = DAILY[this.i], gx = W / 2, gy = y + 118;
    if (this.done && !this.opening) { giftIcon(c, DAILY[(this.i + n - 1) % n], gx, gy - 6, 54); txt(c, 'Für heute schon ausgepackt – morgen gibt es das nächste!', W / 2, y + 178, 14, '#6b5a48', 'center', null, w - 40); return; }
    const pu = this.opening ? 1 : 1 + Math.sin(this.t * 5) * 0.05, wob = this.opening ? 0 : Math.sin(this.t * 9) * 0.06;
    c.save(); c.translate(gx, gy); c.rotate(wob); c.scale(pu, pu); drawPresent(c, 0, 10, 84, this.t, this.open); c.restore();
    if (this.open > 0.5) { const k = ease.back(clamp((this.open - 0.5) * 2, 0, 1)); c.save(); c.translate(gx, gy - 40 * k); c.scale(k, k); ell(c, 0, 0, 34, 34); fs(c, '#fff', 3, '#c9a227'); giftIcon(c, g, 0, 0, 46); c.restore(); txt(c, giftText(g) + '!', W / 2, y + 190, 18, '#2b9348', 'center', null, w - 40); }
    else txt(c, 'Tippe auf das Geschenk!', W / 2, y + 190, 15, '#6b5a48', 'center', null);
    if (!this.opening) UI.btn(gx - 60, gy - 60, 120, 120, () => { this.opening = true; giveGift(g); Sfx.play('win'); FX.confetti(W / 2, gy, 50); buzz([30, 40, 30]); Voice.say('Du bekommst: ' + giftText(g) + '!', true); });
    else if (this.open >= 1) { roundBtn(c, x + w - 60, y + 190, 22, '#06d6a0', 'check', () => this.close()); }
  }
}
// ---------- Upgrades: dauerhafte Verbesserungen mit 4 Stufen, jede teurer (Laden + Glücksrad) ----------
const UPGRADES = [
  { k: 'bonuszeit', name: 'Bonus-Uhr', icon: 'hourglass', col: '#ffd166', price: [50, 100, 170, 280], f: l => '+' + ABIL_VAL.bonuszeit[l] + ' Sekunden bei der Bonus-Jagd' },
  { k: 'turbo', name: 'Turbo-Schuhe', icon: 'shoe', col: '#80ed99', price: [50, 100, 170, 280], f: l => Math.round((ABIL_VAL.turbo[l] / 180 - 1) * 100) + ' % schneller laufen' },
  { k: 'extraherz', name: 'Extra-Herzen', icon: 'heart', col: '#ffafcc', price: [60, 120, 200, 320], f: l => ABIL_VAL.extraherz[l] + ' statt 4 Herzen in Geschick-Aufgaben' },
  { k: 'zeitplus', name: 'Zeit-Plus', icon: 'clock', col: '#a5d8ff', price: [60, 120, 200, 320], f: l => '+' + ABIL_VAL.zeitplus[l] + ' Sekunden in Geschick-Aufgaben' },
  { k: 'magnet', name: 'Sammel-Magnet', icon: 'bag', col: '#cdb4db', price: [40, 80, 140, 230], f: l => 'Sammel-Sachen fliegen dir zu – ' + ['', 'etwas', 'weiter', 'weit', 'sehr weit'][l] },
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
const BASE_ANIMALS = ['lion', 'bear', 'dog'];   // nur noch diese drei Figuren (User-Wunsch), alle gratis
const SHOP_ANIMALS = [];
const OLD_ANIMALS = [['bunny', 120], ['mouse', 120], ['bear', 150], ['panda', 150], ['fox', 150], ['raccoon', 180], ['koala', 180], ['wolf', 200], ['tiger', 250], ['frog', 120], ['pig', 140], ['cow', 160], ['monkey', 180], ['polar', 220], ['elefant', 260]];   // früher kaufbar – wer eine hatte, bekommt die Taler zurück (siehe META)
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
function achieve() {}   // Erfolge gibt es nicht mehr (User-Wunsch) – Aufrufe im Spiel bleiben harmlos
function stat() {}   // Erfolgs-Zähler gibt es nicht mehr
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
  const k = ease.back(clamp(q.t * 3, 0, 1)) * clamp((2.2 - q.t) * 3, 0, 1), w = Math.min(W - 30, 320), low = H > W && scene instanceof Play && !overlay, y = low ? H - 170 - (k - 1) * 70 : 8 + (k - 1) * 70;   // Hochformat im Spiel: unten statt über den Knöpfen der oberen Leiste
  c.save(); c.globalAlpha = clamp(k, 0, 1);
  rrPath(c, W / 2 - w / 2, y, w, 44, 18); fs(c, '#fff7e6', 2.5); ell(c, W / 2 - w / 2 + 24, y + 22, 15, 15); fs(c, '#ffd166', 2); icon(c, q.ic, W / 2 - w / 2 + 24, y + 22, 20);
  txt(c, q.title, W / 2 - w / 2 + 46, y + 15, 13, BRAND.olive, 'left', null); txt(c, q.sub, W / 2 - w / 2 + 46, y + 31, 12, '#c9762f', 'left', null);
  c.restore();
}
function coinChip(c, x, y, small) {   // small: schmale Bildschirme (Hochformat)
  const m = META(); if (!m) return 0;
  const fz = small ? 13 : 17, ih = small ? 28 : 36; c.font = `900 ${fz}px ${FONT}`; const w = c.measureText(String(m.coins)).width + (small ? 38 : 52);
  rrPath(c, x, y - ih / 2, w, ih, ih / 2); fs(c, '#fff7e6', 2.5); icon(c, 'coin', x + ih / 2, y, small ? 18 : 24); txt(c, String(m.coins), x + (small ? 28 : 36), y + 1, fz, '#8d5a3b', 'left', null);
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
  return upOff.concat([{ id: ex[0], price: Math.round(ex[3] * 0.7 / 5) * 5, ex: true, off: 30 }])   /* Highlight des Tages: immer 30 % günstiger */.concat(offs.map(o => { const off = pick([20, 30, 40, 50], r); return { id: o[0], off, price: Math.round(o[3] * (100 - off) / 100 / 5) * 5 }; }));
}
// ---------- Laden: 3 Reiter (Joker · Kostüme · Figuren), im Hochformat aufgeräumt ----------
// Joker gibt es NUR hier. Karten werden einmal in kleine Bilder gezeichnet (Zwischenspeicher) – so läuft das Scrollen flüssig.
const JOKER_PACKS = [[1, 30], [3, 80], [10, 240]];   // Anzahl, Preis
const SHOP_CARD_CACHE = new Map();
function cachedCard(key, w, h, draw) {   // zeichnet eine Karte einmal in ein eigenes Bild und merkt es sich
  const k = key + '|' + Math.round(w) + 'x' + Math.round(h) + '|' + DPR; let cv2 = SHOP_CARD_CACHE.get(k);
  if (!cv2) {
    if (SHOP_CARD_CACHE.size > 160) SHOP_CARD_CACHE.clear();
    cv2 = document.createElement('canvas'); cv2.width = Math.ceil((w + 24) * DPR); cv2.height = Math.ceil((h + 24) * DPR);
    const g = cv2.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 12 * DPR, 12 * DPR); draw(g); SHOP_CARD_CACHE.set(k, cv2);
  }
  return cv2;
}
function blitCard(c, cv2, x, y) { const m = c.getTransform(); c.save(); c.setTransform(1, 0, 0, 1, m.e + (x - 12) * m.a, m.f + (y - 12) * m.d); c.drawImage(cv2, 0, 0); c.restore(); }
class Shop {
  constructor(back) { this.back = back || (() => setScene(new Menu())); this.t = 0; this.tab = 'skins'; this.msg = ''; this.msgT = 0; this.sc = 0; this.vel = 0; }
  enter() { FX.clear(); }
  update(dt) {
    this.t += dt; this.msgT = Math.max(0, this.msgT - dt);
    if (!this.drag && Math.abs(this.vel) > 5) { this.sc += this.vel * dt; this.vel *= Math.pow(0.03, dt); if (this.sc < 0 || this.sc > (this.maxS || 0)) this.vel = 0; }   // Schwung beim Wischen
  }
  say(m) { this.msg = m; this.msgT = 2.5; }
  down(x, y) { this.vel = 0; this.drag = { y0: y, s0: this.sc, moved: false, ly: y, lt: performance.now() }; }
  move(x, y) {
    const d = this.drag; if (!d) return; if (Math.abs(y - d.y0) > 8) d.moved = true;
    if (d.moved) { this.sc = clamp(d.s0 - (y - d.y0), -40, (this.maxS || 0) + 40); const now = performance.now(), dt = Math.max(8, now - d.lt) / 1000; this.vel = -(y - d.ly) / dt; d.ly = y; d.lt = now; }
  }
  up(x, y) {
    const d = this.drag; this.drag = null; this.sc = clamp(this.sc, 0, this.maxS || 0); if (!d || d.moved) return;
    const h = (this.hits || []).find(o => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h); if (h) h.fn();
  }
  buy(price, fn, ok) {
    if (price >= 150 && !ok) { overlay = new ConfirmDialog({ text: 'Für ' + price + ' Taler kaufen?', icon: 'coin', onYes: () => this.buy(price, fn, true) }); return; }
    const m = META(); if (m.coins < price) { Sfx.play('bad'); this.say('Dafür fehlen dir noch ' + (price - m.coins) + ' Taler.'); return; }
    m.coins -= price; fn(m); Save.write(); Sfx.play('win'); FX.confetti(W / 2, H * 0.4, 40);
  }
  draw(c) {
    if (this.tab !== 'skins' && this.tab !== 'tiere') this.tab = 'skins';
    themeBg(c, 'shop');
    const m = META(); if (!m) return;
    const narrow = W < 600, hx = EMBED ? 20 : 74; if (!EMBED) roundBtn(c, 44, 44, 28, '#fff', 'back', this.back, '#ffd166');
    icon(c, 'shop', hx + 22, 40, 36); txt(c, 'Laden', hx + 46, 40, 22, '#fff', 'left', BRAND.olive);
    { c.font = `900 15px ${FONT}`; const cw0 = c.measureText(String(m.coins)).width + 46; coinChip(c, W - 14 - cw0, 40, narrow); }
    // eine Reiterleiste, immer in einer Reihe
    const gift = false, tabs = [['skins', 'Kostüme'], ['tiere', 'Figuren & Joker']], tw = Math.min(190, (W - 32) / 2), tH = 40, tY = 72;   // Joker ohne eigenen Reiter (nicht so aufdringlich)
    tabs.forEach(([id, name], i) => {
      const x = W / 2 + (i - (tabs.length - 1) / 2) * tw - tw / 2 + 3, on = this.tab === id;
      rrPath(c, x, tY, tw - 6, tH, 18); fs(c, on ? '#ffd166' : 'rgba(255,255,255,.92)', 3); txt(c, name, x + (tw - 6) / 2, tY + tH / 2 + 1, 16, '#3d2c1f', 'center', null, tw - 16);
      if (id === 'joker' && gift) { ell(c, x + tw - 12, tY + 2, 10, 10); fs(c, '#ef476f', 2, '#fff'); txt(c, '!', x + tw - 12, tY + 3, 12, '#fff', 'center', null); }
      UI.btn(x, tY, tw - 6, tH, () => { if (this.tab !== id) { this.tab = id; this.sc = 0; this.vel = 0; Sfx.play('tap'); } });
    });
    const top = tY + tH + 14, bottom = H - 10, view = bottom - top;
    this.hits = [];
    const hit = (x, y, w, h, fn) => { if (y + h > top && y < bottom) this.hits.push({ x, y: Math.max(y, top), w, h: Math.min(y + h, bottom) - Math.max(y, top), fn }); };
    c.save(); c.beginPath(); c.rect(0, top - 6, W, view + 6); c.clip(); c.translate(0, -this.sc);
    const Y = y => y - this.sc;   // Bildschirm-Lage (für Tipp-Flächen)
    let contentH = 0;
    if (this.tab === 'joker_alt') {   // (alte Joker-Seite mit Paketen – nicht mehr erreichbar)
      const cw = Math.min(W - 32, 560), x0 = (W - cw) / 2; let y = top;
      if (gift) {   // Tagesgeschenk: ein Balken ganz oben
        const gl = 0.5 + 0.5 * Math.sin(this.t * 4);
        rrPath(c, x0 - 3, y - 3, cw + 6, 52, 22); c.fillStyle = `rgba(255,214,10,${0.3 + gl * 0.35})`; c.fill();
        rrPath(c, x0, y, cw, 46, 20); fs(c, '#ffd6e0', 3); drawPresent(c, x0 + 28, y + 26, 28, this.t); txt(c, 'Tagesgeschenk öffnen!', x0 + 54, y + 24, 16, '#3d2c1f', 'left', null, cw - 70);
        hit(x0, Y(y), cw, 46, () => { Sfx.play('tap'); overlay = new DailyGift(); }); y += 60;
      }
      // Kopf: wie viele Joker man hat + was er kann
      rrPath(c, x0, y, cw, 92, 22); fs(c, '#fff7e6', 3);
      ell(c, x0 + 50, y + 46, 34, 34); fs(c, '#ffe066', 3, '#c9a227'); icon(c, 'joker', x0 + 50, y + 46, 44);
      txt(c, 'Du hast ' + m.bank + (m.bank === 1 ? ' Joker' : ' Joker'), x0 + 98, y + 32, 20, BRAND.olive, 'left', null, cw - 110);
      wrapLines(c, 'Ein Joker schafft eine Aufgabe sofort – wenn du mal nicht weiterkommst.', cw - 120, 13).slice(0, 2).forEach((l, k) => txt(c, l, x0 + 98, y + 56 + k * 16, 13, '#6b5a48', 'left', null));
      y += 106;
      // Joker-Pakete: Hochformat untereinander, quer nebeneinander
      const land = W > H * 1.2, n = JOKER_PACKS.length, pw = land ? (cw - 24) / n : cw, ph = land ? 150 : 74;
      JOKER_PACKS.forEach(([cnt, price], k) => {
        const x = land ? x0 + k * (pw + 12) : x0, yy = land ? y : y + k * (ph + 10), best = k === n - 1;
        rrPath(c, x, yy, pw, ph, 20); fs(c, best ? '#fff3bf' : '#fff', 3, best ? '#c9a227' : OL);
        if (best) { c.font = `900 11px ${FONT}`; const lab = 'Am günstigsten', lw = c.measureText(lab).width + 20; rrPath(c, x + pw - lw - 10, yy - 9, lw, 20, 10); fs(c, '#ef476f', 2, '#fff'); txt(c, lab, x + pw - lw / 2 - 10, yy + 1, 11, '#fff', 'center', null); }
        const ix = land ? x + pw / 2 : x + 40, iy = land ? yy + 46 : yy + ph / 2;
        for (let q = Math.min(cnt, 3) - 1; q >= 0; q--) icon(c, 'joker', ix + q * 8 - (Math.min(cnt, 3) - 1) * 4, iy - q * 4, 36);
        txt(c, cnt + (cnt === 1 ? ' Joker' : ' Joker'), land ? x + pw / 2 : x + 84, land ? yy + 92 : yy + ph / 2, 18, '#3d2c1f', land ? 'center' : 'left', null);
        const bw = 96, bx = land ? x + pw / 2 - bw / 2 : x + pw - bw - 14, by = land ? yy + ph - 46 : yy + ph / 2 - 17;
        rrPath(c, bx, by, bw, 34, 17); fs(c, '#06d6a0', 2.5); icon(c, 'coin', bx + 22, by + 17, 17); txt(c, String(price), bx + 60, by + 18, 16, '#fff', 'center', BRAND.ink);
        hit(x, Y(yy), pw, ph, () => this.buy(price, mm => { mm.bank += cnt; this.say(cnt === 1 ? 'Neuer Joker!' : cnt + ' neue Joker!'); }));
      });
      y += land ? ph + 14 : n * (ph + 10) + 4;
      contentH = y + 10 - top;
    } else {
      // Kostüme oder Figuren: Raster mit festen Kartengrößen, scrollbar
      const isSkin = this.tab === 'skins', kind = ACC().char || 'dog';
      const list = isSkin ? (this.skinList || (this.skinList = SHOP_SKINS.slice().sort((a, b) => ({ common: 0, rare: 1, legend: 2 })[a[2]] - ({ common: 0, rare: 1, legend: 2 })[b[2]] || a[3] - b[3] || a[1].localeCompare(b[1]))))
        : BASE_ANIMALS.map(k => [k, 0]).concat(SHOP_ANIMALS);
      const cols = W > H ? (W > 900 ? 6 : 5) : 3, gap = 12, cw = Math.min(150, (W - 28 - gap * (cols - 1)) / cols), ch = Math.round(cw * (isSkin ? 1.25 : 1.2)), x0 = (W - (cw * cols + gap * (cols - 1))) / 2;
      list.forEach((o, i) => {
        const x = x0 + (i % cols) * (cw + gap), y = top + 4 + Math.floor(i / cols) * (ch + gap);
        if (Y(y) > bottom || Y(y) + ch < top - 10) return;
        if (isSkin) {
          const [id, name, , price] = o, own = m.skins.includes(id), worn = own && DP(CUR_DIFF || 'medium').equip === id;
          blitCard(c, cachedCard('s:' + id + ':' + kind + ':' + own + ':' + worn, cw, ch, g => skinCard(g, 0, 0, cw, ch, id, { plain: true, kind, own, worn, price })), x, y);
          hit(x, Y(y), cw, ch, () => { if (own) { wearSkin(id); this.say(name + ' hast du jetzt an!'); return; } this.buy(price, mm => { mm.skins.push(id); wearSkin(id); this.say(name + ' gekauft und angezogen!'); }); });
        } else {
          const [k, price] = o, own = ownedAnimals().includes(k), cur = ACC().char === k;
          blitCard(c, cachedCard('a:' + k + ':' + own + ':' + cur, cw, ch, g => {
            rrPath(g, 0, 0, cw, ch, 16); fs(g, cur ? '#d8f5e3' : '#fff', 3, cur ? '#2b9348' : OL);
            drawAnimal(g, k, cw / 2, ch - 44, Math.min(1.5, (ch - 50) / 74), { look: DEFAULT_LOOK, t: 0, cap: false, noShadow: true });
            txt(g, ANIMAL_NAMES[k], cw / 2, ch - 30, 13, '#3d2c1f', 'center', null, cw - 8);
            if (cur) { rrPath(g, cw / 2 - 34, ch - 22, 68, 17, 8.5); fs(g, '#06d6a0', 0); txt(g, 'deine Figur', cw / 2, ch - 13, 10, '#fff', 'center', null); }
            else if (own) txt(g, 'wählen', cw / 2, ch - 13, 11, '#2b9348', 'center', null);
            else { rrPath(g, cw / 2 - 34, ch - 23, 68, 19, 9.5); fs(g, '#fff', 2); icon(g, 'coin', cw / 2 - 16, ch - 13, 13); txt(g, String(price), cw / 2 + 8, ch - 12, 12, '#3d2c1f', 'center', null); }
          }), x, y);
          hit(x, Y(y), cw, ch, () => { if (own) { ACC().char = k; Save.write(); Sfx.play('good'); this.say(ANIMAL_NAMES[k] + ' ist jetzt deine Figur!'); return; } this.buy(price, mm => { mm.animals.push(k); ACC().char = k; this.say(ANIMAL_NAMES[k] + ' ist jetzt deine Figur!'); }); });
        }
      });
      contentH = Math.ceil(list.length / cols) * (ch + gap) + 10;
      if (!isSkin) {   // ruhig darunter: eine einzelne Joker-Karte (Joker gibt es nur hier)
        const jw = Math.min(W - 28, 520), jx = (W - jw) / 2, jy = top + contentH + 18;
        txt(c, 'Joker', jx + 4, jy - 4, 15, '#fff', 'left', BRAND.olive);
        rrPath(c, jx, jy + 8, jw, 70, 20); fs(c, 'rgba(255,255,255,.92)', 2.5);
        icon(c, 'joker', jx + 36, jy + 43, 34);
        txt(c, 'Du hast ' + m.bank + ' Joker', jx + 66, jy + 32, 15, '#3d2c1f', 'left', null, jw - 190);
        txt(c, 'Schafft eine Aufgabe, wenn du feststeckst.', jx + 66, jy + 54, 12, '#6b5a48', 'left', null, jw - 190);
        const bw = 92, bx = jx + jw - bw - 12, by = jy + 26; rrPath(c, bx, by, bw, 34, 17); fs(c, '#fff3bf', 2, '#c9a227'); icon(c, 'coin', bx + 22, by + 17, 16); txt(c, '+1 · ' + JOKER_PRICE, bx + 58, by + 18, 13, '#3d2c1f', 'center', null);
        hit(jx, Y(jy + 8), jw, 70, () => this.buy(JOKER_PRICE, mm => { mm.bank += 1; this.say('Neuer Joker!'); }));
        contentH += 110;
      }
    }
    c.restore();
    this.maxS = Math.max(0, contentH - view);
    if (!this.drag) this.sc = clamp(this.sc, 0, this.maxS);
    if (this.maxS > 0) {   // Leiste rechts + Hinweis, dass es weitergeht
      const bh = Math.max(30, view * view / (view + this.maxS)), by = top + (view - bh) * clamp(this.sc / this.maxS, 0, 1); rrPath(c, W - 7, by, 4, bh, 2); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill();
      if (this.sc < this.maxS - 4) { const g2 = c.createLinearGradient(0, bottom - 34, 0, bottom); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(60,40,20,.25)'); c.fillStyle = g2; c.fillRect(0, bottom - 34, W, 34); }
    }
    if (this.msgT > 0) { c.save(); c.globalAlpha = clamp(this.msgT * 2, 0, 1); c.font = `900 15px ${FONT}`; const mw = Math.min(W - 30, c.measureText(this.msg).width + 30); rrPath(c, W / 2 - mw / 2, H - 56, mw, 36, 18); c.fillStyle = 'rgba(32,44,30,.92)'; c.fill(); txt(c, this.msg, W / 2, H - 37, 15, '#fff', 'center', null, mw - 20); c.restore(); }
  }
}

// ---------- Skin-Karte (Laden + Tagesangebot): Farbe/Rahmen je Seltenheit, Figur groß, unten Preis oder „an“ ----------
const RARE_LOOK = { common: { a: '#ffffff', b: '#eef2f5', line: '#3d2c1f', gem: '#adb5bd' }, rare: { a: '#eef7ff', b: '#cfe8ff', line: '#118ab2', gem: '#4dabf7' }, legend: { a: '#fffbe6', b: '#ffe8a3', line: '#c9a227', gem: '#ffc300' } };
function gemIcon(c, x, y, r, rarity) { const R = RARE_LOOK[rarity]; if (rarity === 'legend') { starPath(c, x, y, r, r * 0.45); fs(c, R.gem, 1.5); } else if (rarity === 'rare') { polyPath(c, [[x, y - r], [x + r * 0.8, y], [x, y + r], [x - r * 0.8, y]]); fs(c, R.gem, 1.5); } else { ell(c, x, y, r * 0.7, r * 0.7); fs(c, R.gem, 1.5); } }
function skinCard(c, x, y, cw, ch, id, o) {
  const sk = SKINS[id], R = RARE_LOOK[sk.rarity] || RARE_LOOK.common, t = o.t || 0;
  c.save(); if (sk.rarity === 'legend') { c.shadowColor = '#ffd60a'; c.shadowBlur = 10 + 6 * Math.sin(t * 3); }
  rrPath(c, x, y, cw, ch, 18); const g = c.createLinearGradient(0, y, 0, y + ch); g.addColorStop(0, R.a); g.addColorStop(1, R.b); c.fillStyle = g; c.fill(); c.restore();
  rrPath(c, x, y, cw, ch, 18); c.lineWidth = sk.rarity === 'legend' ? 4 : 3; c.strokeStyle = R.line; c.stroke();
  ell(c, x + cw / 2, y + ch * 0.62, cw * 0.3, cw * 0.09); c.fillStyle = 'rgba(0,0,0,.08)'; c.fill();
  drawAnimal(c, o.kind, x + cw / 2, y + ch * 0.64, Math.min(1.65, (ch - 50) / 78), { look: sk, cap: true, t, noShadow: true });
  if (!o.plain) gemIcon(c, x + 16, y + 16, 7, sk.rarity);
  if (o.info) { ell(c, x + 20, y + 20, 14, 14); fs(c, '#fff', 2.5, '#118ab2'); icon(c, 'info', x + 20, y + 20, 22); }   // „i“: zeigt die Fähigkeit des Kostüms
  { const sd = !o.plain && SKIN_SIDE[id]; if (sd) { ell(c, x + 36, y + 16, 9, 9); fs(c, '#fff3bf', 1.5, '#c9a227'); icon(c, SIDE[sd].icon, x + 36, y + 16, 12); } }   // eigene Neben-Fähigkeit
  txt(c, sk.name, x + cw / 2, y + ch - 32, cw < 130 ? 11 : 13, '#3d2c1f', 'center', null);
  if (o.worn) { rrPath(c, x + cw / 2 - 30, y + ch - 22, 60, 18, 9); fs(c, '#06d6a0', 2); txt(c, 'trägst du', x + cw / 2, y + ch - 13, 10, '#fff', 'center', null); }
  else if (o.own) { txt(c, 'anziehen', x + cw / 2, y + ch - 13, 11, '#2b9348', 'center', null); ell(c, x + cw - 16, y + 16, 9, 9); fs(c, '#06d6a0', 2); icon(c, 'check', x + cw - 16, y + 16, 12, '#fff'); }
  else {
    const pw = Math.min(cw - 20, o.oldPrice ? 96 : 70); rrPath(c, x + cw / 2 - pw / 2, y + ch - 23, pw, 19, 9.5); fs(c, '#fff', 2, R.line);
    if (o.oldPrice) { txt(c, String(o.oldPrice), x + cw / 2 - pw / 2 + 16, y + ch - 13, 10, '#adb5bd', 'center', null); line(c, x + cw / 2 - pw / 2 + 6, y + ch - 13, x + cw / 2 - pw / 2 + 26, y + ch - 13, 1.5, '#ef476f', false); }
    icon(c, 'coin', x + cw / 2 - (o.oldPrice ? -2 : 16), y + ch - 13, 13); txt(c, String(o.price), x + cw / 2 + (o.oldPrice ? 22 : 6), y + ch - 12, 12, '#3d2c1f', 'center', null);
  }
  if (o.sticker) { const sx = x + cw - 18, sy = y + 18, r = 19; c.save(); c.translate(sx, sy); c.rotate(0.25 + Math.sin(t * 3) * 0.05); ell(c, 0, 0, r, r); fs(c, '#ef476f', 2.5, '#fff'); txt(c, o.sticker, 0, 1, 12, '#fff', 'center', null); c.restore(); }
  if (o.ribbon) { c.font = `900 11px ${FONT}`; const rw = c.measureText(o.ribbon).width + 22; rrPath(c, x + cw / 2 - rw / 2, y - 10, rw, 20, 10); fs(c, '#c9a227', 2, '#fff'); txt(c, o.ribbon, x + cw / 2, y + 1, 11, '#fff', 'center', null); }
}
// ---------- Info zu einem Skin: Seltenheit + was die Fähigkeit kann ----------
function skinInfoBtn(c, x, y, sid, r = 12) { icon(c, 'info', x, y, r * 2); UI.btn(x - r - 6, y - r - 6, (r + 6) * 2, (r + 6) * 2, () => { overlay = new SkinInfo(sid, overlay); Sfx.play('tap'); }); }
class SkinInfo {
  constructor(sid, back) { this.sid = sid; this.back = back; this.t = 0; const sk = SKINS[sid] || {}; const sd = SKIN_SIDE[sid]; Voice.say(sd ? SIDE[sd].name + '. ' + SIDE[sd].f(1) : 'Dieser Skin hat keine eigene Fähigkeit.', true); }
  update(dt) { this.t += dt; }
  close() { Voice.stop(); overlay = this.back || null; }
  draw(c) {
    c.fillStyle = 'rgba(16,28,18,.75)'; c.fillRect(0, 0, W, H);
    const sk = SKINS[this.sid] || {}, w = Math.min(W - 30, 420), h = 300, x = (W - w) / 2, y = (H - h) / 2;
    fitBegin(c, w, h);
    panel(c, x, y, w, h, '#fff7e6', 26);
    roundBtn(c, x + w - 30, y + 30, 22, '#ced4da', 'cross', () => this.close());
    drawAnimal(c, (ACC() && ACC().char) || 'dog', x + 80, y + 170, 2.2, { look: sk, cap: true, t: this.t });
    const R = RARITY[sk.rarity || 'common'];
    txt(c, sk.name || 'Skin', x + 150, y + 50, 19, BRAND.olive, 'left', null);
    rrPath(c, x + 150, y + 66, 110, 22, 11); c.fillStyle = R.col; c.fill(); txt(c, R.name, x + 205, y + 77, 12, '#3d2c1f', 'center', null);
    if (sk.ability) {
      const A = ABILITIES[sk.ability];
      icon(c, ABIL_ICON[sk.ability], x + 162, y + 112, 22); txt(c, 'Fähigkeit: ' + A.name, x + 180, y + 112, 16, '#c9762f', 'left', null);
      wrapLines(c, abilityText(sk), w - 170, 14).forEach((l, i) => txt(c, l, x + 150, y + 138 + i * 19, 14, '#3d2c1f', 'left', null));
      wrapLines(c, 'Wirkt, wenn du den Skin anziehst – bei Mittel und Schwer.', w - 170, 12).forEach((l, i) => txt(c, l, x + 150, y + 214 + i * 16, 12, '#6b5a48', 'left', null));
    } else { const sd = SKIN_SIDE[this.sid], A = sd && SIDE[sd];   // kurz: was kann das Kostüm?
      if (A) { ell(c, x + 172, y + 122, 20, 20); fs(c, '#fff3bf', 2.5, '#c9a227'); icon(c, A.icon, x + 172, y + 122, 26); txt(c, A.name, x + 200, y + 122, 17, '#c9762f', 'left', null, w - 220);
        wrapLines(c, A.f(1), w - 170, 14).slice(0, 4).forEach((l, i) => txt(c, l, x + 150, y + 160 + i * 19, 14, '#3d2c1f', 'left', null));
        txt(c, 'Wirkt, wenn du es anziehst.', x + 150, y + h - 30, 12, '#6b5a48', 'left', null, w - 170); } }
    c.restore();
  }
  down() {} move() {} up() {}
}
SkinInfo.prototype.freezeBg = true;

// ---------- Freunde + Mehrspieler ----------
// ---------- Wirtschaft: alles kaufen (23 Skins, 5 Upgrades × 4, Skin-Stufen) kostet ≈ 7.600 Taler – das reicht nach ca. 2–3 Durchläufen (alle 6 Bereiche) ----------
// Rechnung: tools/qa/economy.js. Pro Bereich: 6 × Helfen + Bereichs-Bonus (+10 je späterem Bereich); nochmal schaffen = 90 % vom Bonus.
const CLEAR_BONUS = { easy: 250, medium: 300, hard: 350 }, CLEAR_STEP = 10, CLEAR_AGAIN = 0.9;
const HELP_COINS = { easy: 12, medium: 15, hard: 20 };   // je Person, der man hilft (Skin-Fähigkeit „Taler-Bonus“: mehr)
function clearBonus(diff, stage, again) { const b = CLEAR_BONUS[diff] + Math.max(0, STAGE_ORDER.indexOf(stage)) * CLEAR_STEP; return again ? Math.round(b * CLEAR_AGAIN / 5) * 5 : b; }
function helpCoins(diff) { return Math.round((HELP_COINS[diff] || 12) * (1 + ABIL_VAL.taler[ability('taler')] / 100)); }
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
  // Startseite rechts: 1) Spiel starten oder beitreten  2) eine von drei fertigen Spielarten (oder eigene Einstellungen)
  drawStart(c, rx, ry, rw, rh) {
    const o = this.opts, area = (STAGE_ORDER.includes(o.stages[0]) ? o.stages[0] : 'spielplatz'), diff = CUR_DIFF || 'medium';
    const big = (x, y, w, h, col, ic, title, sub, fn) => { rrPath(c, x, y + 4, w, h, 20); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill(); rrPath(c, x, y, w, h, 20); fs(c, col, 3);
      const ir = Math.min(26, h * 0.3); ell(c, x + 18 + ir, y + h / 2, ir, ir); fs(c, '#fff', 2.5); icon(c, ic, x + 18 + ir, y + h / 2, ir * 1.2);
      const tx = x + 30 + ir * 2; txt(c, title, tx, y + h / 2 - (sub ? 10 : 0), 17, '#3d2c1f', 'left', null, w - (tx - x) - 12); if (sub) txt(c, sub, tx, y + h / 2 + 13, 13, '#6b5a48', 'left', null, w - (tx - x) - 12);
      UI.btn(x, y, w, h, () => { Sfx.play('tap'); fn(); }); };
    if (this.step !== 'preset') {
      txt(c, 'Was möchtest du?', rx + rw / 2, ry + 30, 18, BRAND.olive, 'center', null);
      const h = Math.min(96, (rh - 80) / 2 - 8);
      big(rx + 16, ry + 54, rw - 32, h, '#b9fbc0', 'play', 'Spiel starten', 'Du lädst Freunde ein', () => { this.step = 'preset'; });
      big(rx + 16, ry + 66 + h, rw - 32, h, '#bde0fe', 'friends', 'Spiel beitreten', 'Mit dem Code von deinem Freund', () => { this.mode = 'code'; this.err = ''; nameInput.value = ''; });
      return;
    }
    roundBtn(c, rx + 30, ry + 28, 16, '#fff', 'back', () => { this.step = null; Sfx.play('tap'); });
    txt(c, 'Was wollt ihr spielen?', rx + 56, ry + 29, 17, BRAND.olive, 'left', null, rw - 70);
    const P = [
      ['#ffd6a5', 'jump', 'Wettrennen zu zweit', 'Wer hilft schneller? · ' + STAGE_INFO[area].name, { mode: 'duell', size: 2, kids: 3, boss: false, live: true }],
      ['#caffbf', 'friends', 'Zusammen helfen', 'Ein großer Auftrag für euch zwei', { mode: 'team', size: 2, kids: 1, boss: false, live: true }],
      ['#e7c6ff', 'trophy', 'Großes Rennen', 'Bis zu 4 Spieler · ' + STAGE_INFO[area].name, { mode: 'duell', size: 4, kids: 3, boss: false, live: true }]];
    const gap = 8, h = Math.min(78, (rh - 64) / 4 - gap);   // vier gleich große Karten: drei fertige Spielarten + eigene Einstellungen
    P.forEach(([col, ic, title, sub, set], i) => big(rx + 16, ry + 52 + i * (h + gap), rw - 32, h, col, ic, title, sub, () => { if (this.busy) return; Object.assign(o, set, { diff, stage: area, stages: [area] }); this.create(); }));
    big(rx + 16, ry + 52 + 3 * (h + gap), rw - 32, h, '#e7f5ff', 'menu', 'Eigene Einstellungen', 'Modus, Spieler, Bereiche selbst wählen', () => { this.step = 'custom'; });
    if (this.busy) txt(c, 'Spiel wird erstellt …', rx + rw / 2, ry + rh - 10, 13, '#6b5a48', 'center', null);
  }
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
    const r = await api({ action: 'friend_answer', from: req.id, yes }); if (r && r.status === 200) { this.data = r.data; Sfx.play(yes ? 'win' : 'tap'); if (yes) { achieve('freund'); toast('Ihr seid jetzt Freunde!', req.name, 'friends'); } }
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
    icon(c, 'friends', 104, 44, 40); txt(c, W < 600 ? 'Mehrspieler' : 'Freunde & Mehrspieler', 130, 44, 20, '#fff', 'left', BRAND.olive, W - 130 - 80);
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
    rrPath(c, lx + lw - 136, top + 8, 124, 32, 14); fs(c, '#caffbf', 2.5); txt(c, '+ Code eingeben', lx + lw - 74, top + 25, 13, '#2b9348', 'center', null);
    UI.btn(lx + lw - 136, top + 8, 124, 32, () => { this.mode = 'add'; this.err = ''; nameInput.value = ''; });
    const d = this.data;
    let yy = top + 52;
    if (d && d.myCode) {   // eigener Freundes-Code: weitergeben – wer ihn eingibt, schickt dir eine Anfrage
      rrPath(c, lx + 10, yy, lw - 20, 56, 14); fs(c, '#e7f5ff', 2.5, '#118ab2');   // zwei Zeilen: Wort oben, Code groß darunter – nichts läuft ineinander
      const sx = lx + lw - 46; txt(c, 'Dein Freundes-Code', lx + 24, yy + 16, 13, '#1d4e89', 'left', null, sx - lx - 70);
      txt(c, d.myCode, lx + 24, yy + 39, 20, '#118ab2', 'left', null, sx - lx - 70);
      roundBtn(c, sx, yy + 24, 16, '#caffbf', 'friends', null); txt(c, 'teilen', sx, yy + 49, 11, '#2b9348', 'center', null);
      UI.btn(lx + 10, yy, lw - 20, 56, async () => { const t = 'Werde mein Freund bei „Mission: Im Original“! Mein Freundes-Code: ' + d.myCode; try { if (navigator.share) await navigator.share({ title: 'Mission: Im Original', text: t }); else { await navigator.clipboard.writeText(t); toast('Kopiert!', 'Schick den Code deinem Freund', 'friends'); } } catch (e) { /* abgebrochen */ } });
      yy += 64;
    }
    { const L = ACC().mpLast; if (L && Date.now() - L.at < 30 * 60000) { rrPath(c, lx + 10, yy, lw - 20, 44, 14); fs(c, '#caffbf', 2.5); txt(c, 'Spiel ' + L.code + ' läuft noch', lx + 22, yy + 22, 14, '#3d2c1f', 'left', null);
      rrPath(c, lx + lw - 120, yy + 6, 100, 32, 12); fs(c, '#06d6a0', 2); txt(c, 'Zurück ins Spiel', lx + lw - 70, yy + 22, 11, '#fff', 'center', null); UI.btn(lx + lw - 120, yy + 6, 100, 32, () => { ACC().mpLast = null; this.join(L.code); }); yy += 52; } }   /* nach Verbindungsabbruch wieder beitreten */
    if (d && d.invites && d.invites.length) d.invites.slice(-2).forEach(inv => {
      rrPath(c, lx + 10, yy, lw - 20, 44, 14); fs(c, '#ffd166', 2.5); txt(c, inv.from.name + ' lädt dich ein!', lx + 22, yy + 22, 14, '#3d2c1f', 'left', null);
      rrPath(c, lx + lw - 100, yy + 6, 80, 32, 12); fs(c, '#06d6a0', 2); txt(c, 'Mitspielen', lx + lw - 60, yy + 22, 12, '#fff', 'center', null); UI.btn(lx + lw - 100, yy + 6, 80, 32, () => this.join(inv.code)); yy += 52;
    });
    if (d && d.requests && d.requests.length) d.requests.slice(-2).forEach(rq => {   // Freundschaftsanfragen: annehmen oder nicht
      rrPath(c, lx + 10, yy, lw - 20, 44, 14); fs(c, '#bde0fe', 2.5); c.font = `900 13px ${FONT}`;
      txt(c, rq.name, lx + 22, yy + 15, 14, '#3d2c1f', 'left', null, lw - 130); txt(c, 'möchte dein Freund sein', lx + 22, yy + 32, 11, '#1d4e89', 'left', null, lw - 130);
      roundBtn(c, lx + lw - 76, yy + 22, 15, '#06d6a0', 'check', () => this.answer(rq, true));
      roundBtn(c, lx + lw - 38, yy + 22, 15, '#ced4da', 'cross', () => this.answer(rq, false)); yy += 52;
    });
    if (!d) txt(c, this.err || 'Lade …', lx + lw / 2, yy + 20, 14, '#6b5a48', 'center', null);
    else if (!d.friends.length) wrapLines(c, 'Noch keine Freunde. Gib deinen Code weiter oder tipp auf „+ Code eingeben“!', lw - 40, 13).forEach((l, i) => txt(c, l, lx + lw / 2, yy + 16 + i * 18, 13, '#6b5a48', 'center', null));
    else { txt(c, 'Bestenliste – du: ★ ' + myScore(), lx + 18, yy + 8, 12, '#6b5a48', 'left', null); yy += 20; }
    if (d && d.friends.length) d.friends.slice().sort((p1, p2) => (p2.score || 0) - (p1.score || 0)).slice(0, Math.floor((top + lh - yy) / 46)).forEach(f => {
      rrPath(c, lx + 10, yy, lw - 20, 40, 14); fs(c, '#fff', 2);
      drawCritter(c, AVATARS[(f.avatar || 0) % 6], lx + 30, yy + 36, 0.5, this.t, { noShadow: true });
      ell(c, lx + 46, yy + 12, 5, 5); c.fillStyle = f.online ? '#06d6a0' : '#adb5bd'; c.fill();
      txt(c, f.name, lx + 56, yy + 14, 14, '#3d2c1f', 'left', null, lw - 56 - 120); txt(c, '★ ' + (f.score || 0), lx + 56, yy + 31, 12, '#c9762f', 'left', null);   // Sterne unter dem Namen (sonst stößt ein langer Name daran)
      rrPath(c, lx + lw - 100, yy + 5, 80, 30, 12); fs(c, '#bde0fe', 2); txt(c, 'Einladen', lx + lw - 60, yy + 20, 12, '#3d2c1f', 'center', null);
      UI.btn(lx + lw - 100, yy + 5, 80, 30, () => this.create(f.id)); yy += 46;
    });
    // Spiel einstellen: erst fragen (starten oder beitreten), dann fertige Spielarten – alle Einstellungen nur unter „Eigene Einstellungen“
    panel(c, rx, ry, rw, rh, '#fff7e6', 22);
    if (this.step !== 'custom') { this.drawStart(c, rx, ry, rw, rh); if (this.err && this.mode === 'menu') txt(c, this.err, W / 2, H - 10, 13, '#c1121f', 'center', null); return; }
    const o = this.opts, duel = o.mode !== 'team', multi = o.mode === 'duell', more = !!this.more, nRows = more ? (duel ? 6 : 5) + 0.6 : 3.6, rowH = clamp((rh - 72) / nRows, 38, 86), bh = clamp(rowH - 20, 22, 46), small = rowH < 52;
    const seg = (y, label, vals, isSel, set, maxW = 150) => {
      txt(c, label, rx + 16, y, 13, '#6b5a48', 'left', null); const bw = Math.min(maxW, (rw - 32) / vals.length - 6);
      vals.forEach(([v, name], i) => { const bx = rx + 16 + i * (bw + 6), sel = isSel(v); rrPath(c, bx, y + 10, bw, bh, 12); fs(c, sel ? '#ffd166' : '#fff', 2.5); txt(c, name, bx + bw / 2, y + 10 + bh / 2, 13, '#3d2c1f', 'center', null, bw - 8); UI.btn(bx, y + 10, bw, bh, () => { set(v); Sfx.play('tap'); }); });
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
    rrPath(c, rx + 28 + bw2, by - 22, bw2, 44, 16); fs(c, '#e9ecef', 3); txt(c, '‹ Zurück', rx + 28 + bw2 * 1.5, by, 15, '#3d2c1f', 'center', null); UI.btn(rx + 28 + bw2, by - 22, bw2, 44, () => { this.step = 'preset'; Sfx.play('tap'); });
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
[Shop, MultiScene, LobbyScene].forEach(K => { K.prototype.down = K.prototype.down || function () {}; K.prototype.move = K.prototype.move || function () {}; K.prototype.up = K.prototype.up || function () {}; });
MatchResult.prototype.freezeBg = true;
