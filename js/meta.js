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
// Tagesangebote: für alle gleich (aus dem Datum gewürfelt)
function dailyOffers() {
  const day = new Date().toISOString().slice(0, 10); let h = 2166136261; for (const ch of day) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const r = mulberry32(h), ex = pick(EXCLUSIVE_SKINS, r), offs = shuffle(SHOP_SKINS, r).slice(0, 3);
  return [{ id: ex[0], price: ex[3], ex: true, off: 0 }].concat(offs.map(o => { const off = pick([20, 30, 40, 50], r); return { id: o[0], off, price: Math.round(o[3] * (100 - off) / 100 / 5) * 5 }; }));
}
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
    const tabs = [['joker', 'Tages-Shop'], ['joker2', 'Joker'], ['rad', 'Glücksrad'], ['skins', 'Skins'], ['tiere', 'Tiere']], tw = Math.min(140, (W - 40) / 5 - 8);
    tabs.forEach(([id, name], i) => { const x = W / 2 + (i - 2) * (tw + 8) - tw / 2; rrPath(c, x, 80, tw, 40, 16); fs(c, this.tab === id ? '#ffd166' : '#fff', 3); txt(c, name, x + tw / 2, 101, 16, '#3d2c1f', 'center', null); UI.btn(x, 80, tw, 40, () => { this.tab = id; Sfx.play('tap'); }); });
    const top = 134, bottom = H - 16;
    if (this.tab === 'joker') {
      // Tages-Shop: jeden Tag 1 exklusiver Skin + 3 Skins mit Rabatt (für alle gleich, wechselt um Mitternacht)
      const D = dailyOffers(), kind = ACC().char || 'cat', n = D.length, gap = 12, cw = Math.min(190, (W - 40 - gap * (n - 1)) / n), ch = Math.min(bottom - top - 26, 230), x0 = (W - (cw * n + gap * (n - 1))) / 2;
      const ms = new Date(); ms.setHours(24, 0, 0, 0); const left = Math.max(0, ms - Date.now()), hh = Math.floor(left / 3600000), mm2 = Math.floor(left / 60000) % 60;
      txt(c, 'Neue Angebote in ' + hh + ' Std ' + mm2 + ' Min', W / 2, top + 4, 13, '#fff', 'center', BRAND.olive);
      D.forEach((o, i) => {
        const x = x0 + i * (cw + gap), y = top + 20, sk = SKINS[o.id], own = m.skins.includes(o.id), bob = Math.sin(this.t * 2 + i) * 2;
        rrPath(c, x, y + bob, cw, ch, 18); fs(c, own ? '#d8f5e3' : o.ex ? '#fff3bf' : '#fff', 3.5, o.ex ? '#c9a227' : OL);
        rrPath(c, x + 8, y + bob + 8, cw - 16, 22, 11); c.fillStyle = o.ex ? '#ef476f' : '#06d6a0'; c.fill(); txt(c, o.ex ? 'NUR HEUTE · exklusiv' : '-' + o.off + ' % Rabatt', x + cw / 2, y + bob + 19, 11, '#fff', 'center', null);
        drawAnimal(c, kind, x + cw / 2, y + bob + ch * 0.62, Math.min(1.6, ch / 120), { look: sk, cap: true, t: this.t + i });
        txt(c, sk.name, x + cw / 2, y + bob + ch - 52, 13, '#3d2c1f', 'center', null);
        txt(c, RARITY[sk.rarity].name + (sk.ability ? ' · ' + ABILITIES[sk.ability].name : ''), x + cw / 2, y + bob + ch - 34, 10, '#6b5a48', 'center', null);
        if (own) txt(c, 'gekauft', x + cw / 2, y + bob + ch - 14, 13, '#2b9348', 'center', null);
        else { if (o.off) { txt(c, String(sk.price), x + cw / 2 - 30, y + bob + ch - 14, 11, '#adb5bd', 'center', null); line(c, x + cw / 2 - 42, y + bob + ch - 14, x + cw / 2 - 18, y + bob + ch - 14, 1.5, '#adb5bd', false); } icon(c, 'coin', x + cw / 2 - 2, y + bob + ch - 14, 16); txt(c, String(o.price), x + cw / 2 + 24, y + bob + ch - 13, 14, '#8d5a3b', 'center', null); }
        UI.btn(x, y + bob, cw, ch, () => { if (own) { this.say('Anziehen kannst du ihn im Kleiderschrank.'); return; } this.buy(o.price, mm => { mm.skins.push(o.id); this.say(sk.name + ' liegt jetzt im Kleiderschrank.'); }); });
        skinInfoBtn(c, x + cw - 18, y + bob + ch - 70, o.id);
      });
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
      // Glücksrad: zufälliger Skin aus dem Laden (selten/legendär seltener). Schon gehabt = halber Preis zurück.
      const SPIN = 120, cx = W / 2, cy = top + (bottom - top) / 2 - 10, R = Math.min((bottom - top) / 2 - 22, 130), pool = this.radPool || (this.radPool = shuffle(SHOP_SKINS.concat(EXCLUSIVE_SKINS), mulberry32(7)).slice(0, 8));
      const sp = this.spin; let ang = sp ? sp.a0 + (sp.a1 - sp.a0) * (1 - Math.pow(1 - Math.min(1, (this.t - sp.t0) / 3.2), 3)) : (this.radA || 0);
      pool.forEach((o, i) => { const a0 = ang + i * TAU / 8, a1 = a0 + TAU / 8; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, a0, a1); c.closePath(); fs(c, RARITY[o[2]].col, 3); c.save(); c.translate(cx + Math.cos(a0 + TAU / 16) * R * 0.62, cy + Math.sin(a0 + TAU / 16) * R * 0.62); drawAnimal(c, ACC().char || 'cat', 0, 14, R / 150, { look: SKINS[o[0]], cap: true, noShadow: true }); c.restore(); });
      ell(c, cx, cy, 22, 22); fs(c, '#fff', 3); polyPath(c, [[cx + R - 6, cy], [cx + R + 22, cy - 14], [cx + R + 22, cy + 14]]); fs(c, '#ef476f', 3);
      if (sp && this.t - sp.t0 > 3.3 && !sp.done) { sp.done = true; this.radA = ang; const id = pool[sp.k][0], mm = META(); if (mm.skins.includes(id)) { mm.coins += SPIN / 2; this.say('Den hattest du schon – ' + SPIN / 2 + ' Taler zurück!'); } else { mm.skins.push(id); this.say('Gewonnen: ' + SKINS[id].name + '!'); FX.confetti(W / 2, H * 0.3, 60); Sfx.play('win'); } Save.write(); this.spin = null; }
      const bx = W - Math.min(120, W * 0.16), by = cy; c.save(); if (this.spin) c.globalAlpha = 0.5; rrPath(c, bx - 80, by - 26, 160, 52, 20); fs(c, '#ffd166', 3); txt(c, 'Drehen', bx, by - 6, 18, '#3d2c1f', 'center', null); icon(c, 'coin', bx - 22, by + 14, 16); txt(c, String(SPIN), bx + 8, by + 15, 13, '#8d5a3b', 'center', null); c.restore();
      UI.btn(bx - 80, by - 26, 160, 52, () => { if (this.spin) return; this.buy(SPIN, () => { const ws = pool.map(o => RARITY[o[2]].w), tot = ws.reduce((a, b) => a + b, 0); let r = rnd() * tot, k = 0; while (r > ws[k]) { r -= ws[k]; k++; } const target = -(k * TAU / 8 + TAU / 16); const base = this.radA || 0; this.spin = { t0: this.t, a0: base, a1: base + TAU * 5 + (((target - base) % TAU) + TAU) % TAU, k }; }); });
      wrapLines(c, 'Dreh das Rad und gewinne einen zufälligen Skin – legendäre sind seltener!', Math.min(220, W * 0.25), 12).forEach((l, i) => txt(c, l, Math.max(110, W * 0.14), cy - 20 + i * 16, 12, '#fff', 'center', BRAND.olive));
    } else if (this.tab === 'skins') {
      const cols = W > H ? 5 : 3, gap = 10, cw = Math.min(160, (W - 110 - gap * (cols - 1)) / cols), ch = Math.min(170, (bottom - top - gap) / 2 - gap), x0 = (W - (cw * cols + gap * (cols - 1))) / 2;
      const kind = ACC().char || 'cat', per = cols * 2, pages = Math.ceil(SHOP_SKINS.length / per); this.page = clamp(this.page || 0, 0, pages - 1);
      if (pages > 1) { const my = top + ch + gap / 2; if (this.page > 0) roundBtn(c, x0 - 30, my, 22, '#fff', 'back', () => { this.page--; }); if (this.page < pages - 1) { c.save(); c.translate(x0 + cols * (cw + gap) + 20, my); c.scale(-1, 1); roundBtn(c, 0, 0, 22, '#fff', 'back', null); c.restore(); UI.btn(x0 + cols * (cw + gap) - 2, my - 22, 44, 44, () => { this.page++; }); } txt(c, (this.page + 1) + ' / ' + pages, W / 2, bottom + 8, 12, '#fff', 'center', BRAND.olive); }
      SHOP_SKINS.slice(this.page * per, this.page * per + per).forEach(([id, name, rarity, price], i) => {
        const x = x0 + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (ch + gap), own = m.skins.includes(id), sk = SKINS[id];
        rrPath(c, x, y, cw, ch, 16); fs(c, own ? '#d8f5e3' : '#fff', 3, rarity === 'legend' ? '#c9a227' : rarity === 'rare' ? '#118ab2' : OL);
        drawAnimal(c, kind, x + cw / 2, y + ch * 0.62, Math.min(1.5, ch / 110), { look: sk, cap: true, t: this.t + i });
        rrPath(c, x + 8, y + 6, cw - 16, 18, 9); c.fillStyle = RARITY[rarity].col; c.fill(); txt(c, RARITY[rarity].name + (sk.ability ? ' · ' + ABILITIES[sk.ability].name : ''), x + cw / 2, y + 16, 10, '#3d2c1f', 'center', null);
        txt(c, name, x + cw / 2, y + ch - 30, 12, '#3d2c1f', 'center', null);
        if (own) txt(c, 'gekauft', x + cw / 2, y + ch - 12, 12, '#2b9348', 'center', null);
        else { icon(c, 'coin', x + cw / 2 - 22, y + ch - 12, 16); txt(c, String(price), x + cw / 2 + 4, y + ch - 11, 13, '#8d5a3b', 'center', null); }
        UI.btn(x, y, cw, ch, () => { if (own) { this.say('Anziehen kannst du ihn im Kleiderschrank.'); return; } this.buy(price, mm => { mm.skins.push(id); this.say(name + ' liegt jetzt im Kleiderschrank.'); }); });
        skinInfoBtn(c, x + cw - 18, y + ch - 46, id);
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

// ---------- Info zu einem Skin: Seltenheit + was die Fähigkeit kann ----------
function skinInfoBtn(c, x, y, sid, r = 12) { icon(c, 'info', x, y, r * 2); UI.btn(x - r - 6, y - r - 6, (r + 6) * 2, (r + 6) * 2, () => { overlay = new SkinInfo(sid, overlay); Sfx.play('tap'); }); }
class SkinInfo {
  constructor(sid, back) { this.sid = sid; this.back = back; this.t = 0; const sk = SKINS[sid] || {}; Voice.say(sk.ability ? ABILITIES[sk.ability].name + '. ' + abilityText(sk) : 'Dieser Skin hat keine besondere Fähigkeit.', true); }
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
      txt(c, 'Fähigkeit: ' + A.name, x + 150, y + 112, 16, '#c9762f', 'left', null);
      wrapLines(c, abilityText(sk), w - 170, 14).forEach((l, i) => txt(c, l, x + 150, y + 138 + i * 19, 14, '#3d2c1f', 'left', null));
      wrapLines(c, 'Wirkt, wenn du den Skin anziehst – bei Mittel und Schwer.', w - 170, 12).forEach((l, i) => txt(c, l, x + 150, y + 214 + i * 16, 12, '#6b5a48', 'left', null));
    } else wrapLines(c, 'Dieser Skin hat keine besondere Fähigkeit – er sieht einfach gut aus! Fähigkeiten haben nur legendäre Skins.', w - 170, 14).forEach((l, i) => txt(c, l, x + 150, y + 112 + i * 19, 14, '#3d2c1f', 'left', null));
    c.restore();
  }
  down() {} move() {} up() {}
}
SkinInfo.prototype.freezeBg = true;

// ---------- Erfolge ansehen ----------
class Achievements {
  constructor(back) { this.back = back || (() => setScene(new Menu())); this.t = 0; this.scroll = 0; this.drag = null; this.tab = CUR_DIFF || 'medium'; this.vel = 0; }
  enter() { FX.clear(); this.wheel = e => { this.scroll += e.deltaY; e.preventDefault(); }; try { cv.addEventListener('wheel', this.wheel, { passive: false }); } catch (e) { /* egal */ } }
  leave() { try { cv.removeEventListener('wheel', this.wheel); } catch (e) { /* egal */ } }
  update(dt) { this.t += dt; if (!this.drag && Math.abs(this.vel) > 5) { this.scroll += this.vel * dt; this.vel *= Math.pow(0.04, dt); } }
  draw(c) {
    skyBg(c);
    const m = META(); if (!m) return;
    topBar(c, () => { this.leave(); this.back(); });
    const tab = this.tab, has = A => !!m.ach[achKey(A.id, tab)] || (tab === 'medium' && !!m.ach[A.id]);
    const LIST = ACHIEVEMENTS.filter(A => (tab === 'all') === GENERAL_ACH.has(A.id)).sort((a, b) => a.coins - b.coins || a.name.localeCompare(b.name));
    icon(c, 'trophy', 104, 44, 40); txt(c, 'Erfolge ' + LIST.filter(has).length + '/' + LIST.length, 130, 44, 20, '#fff', 'left', BRAND.olive);
    coinChip(c, W - 170, 44);
    // Reiter: Leicht / Mittel / Schwer
    const tw = Math.min(110, (W - 40) / 4), tx0 = W / 2 - tw * 2, ty = 74;
    [['all', 'Allgemein'], ['easy', 'Leicht'], ['medium', 'Mittel'], ['hard', 'Schwer']].forEach(([d, n], i) => { const x = tx0 + i * tw, sel = d === tab; rrPath(c, x + 3, ty, tw - 6, 30, 14); fs(c, sel ? '#ffd166' : 'rgba(255,255,255,.8)', 2.5); txt(c, n, x + tw / 2, ty + 15, 14, '#3d2c1f', 'center', null); UI.btn(x + 3, ty, tw - 6, 30, () => { this.tab = d; this.scroll = 0; }); });
    const cols = W > 700 ? 2 : 1, gap = 10, cw = Math.min(420, (W - 30 - gap * (cols - 1)) / cols), ch = 64, x0 = (W - (cw * cols + gap * (cols - 1))) / 2, top = 116;
    const rows = Math.ceil(LIST.length / cols), maxScroll = Math.max(0, top + rows * (ch + gap) - H + 16);
    this.scroll = clamp(this.scroll, 0, maxScroll);
    c.save(); c.beginPath(); c.rect(0, top - 4, W, H - top + 4); c.clip();
    LIST.forEach((A, i) => {
      const x = x0 + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (ch + gap) - this.scroll, done = has(A);
      if (y > H || y + ch < top - 4) return;
      rrPath(c, x, y, cw, ch, 18); fs(c, done ? '#fff7e6' : 'rgba(255,255,255,.75)', 3);
      ell(c, x + 32, y + ch / 2, 22, 22); fs(c, done ? '#ffd166' : '#dee2e6', 2.5); icon(c, done ? 'trophy' : (A.secret ? 'question' : 'lock'), x + 32, y + ch / 2, 26, done ? undefined : '#868e96');
      const hidden = A.secret && !done, st = m.st[A.stat && GENERAL_ACH.has(A.stat) ? A.stat : achKey(A.stat, tab)] || (tab === 'medium' ? m.st[A.stat] : 0) || 0;
      txt(c, hidden ? 'Geheimer Erfolg' : A.name, x + 64, y + 22, 15, done ? BRAND.olive : '#495057', 'left', null);
      const desc = hidden ? 'Entdecke es selbst …' : A.desc + (A.stat && !done ? ' (' + Math.min(A.need, st) + '/' + A.need + ')' : '');
      wrapLines(c, desc, cw - 140, 12).slice(0, 2).forEach((l, k) => txt(c, l, x + 64, y + 40 + k * 14, 12, '#6b5a48', 'left', null));
      icon(c, 'coin', x + cw - 50, y + ch / 2, 18); txt(c, String(A.coins), x + cw - 38, y + ch / 2 + 1, 14, '#8d5a3b', 'left', null);
      if (done) icon(c, 'check', x + cw - 14, y + 14, 16, '#06d6a0');
    });
    c.restore();
    if (maxScroll > 0) { const h = (H - top) * (H - top) / (H - top + maxScroll), y = top + (H - top - h) * (this.scroll / maxScroll); rrPath(c, W - 8, y, 5, h, 3); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); }
  }
  down(x, y) { this.drag = { y0: y, s0: this.scroll, ly: y, lt: performance.now() }; this.vel = 0; }
  move(x, y) { if (!this.drag) return; this.scroll = this.drag.s0 - (y - this.drag.y0); const now = performance.now(), dt = Math.max(1, now - this.drag.lt) / 1000; this.vel = -(y - this.drag.ly) / dt; this.drag.ly = y; this.drag.lt = now; }
  up() { this.drag = null; }
}

// ---------- Freunde + Mehrspieler ----------
const MP_COINS = { win: 15, lose: 5, team: 20 };
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
  constructor() { this.t = 0; this.data = null; this.err = ''; this.busy = false; this.mode = 'menu'; this.opts = { mode: 'duell', diff: CUR_DIFF || 'medium', kids: 3, boss: false, live: true, stage: 'spielplatz', stages: ['spielplatz'] }; this.pollT = 0; }
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
    seg(ry + 74, 'Stufe', [['easy', 'Leicht'], ['medium', 'Mittel'], ['hard', 'Schwer']], o.diff, v => (o.diff = v));
    { const cw = 190, cx = rx + rw - cw - 14, cy = ry + 64, st = o.mode === 'team' ? [o.stages[0]] : o.stages, nm = st.length === 1 ? STAGE_INFO[st[0]].name : st.length + ' Bereiche'; rrPath(c, cx, cy, cw, 20, 10); fs(c, '#caffbf', 2); txt(c, (st.length === 1 ? 'Bereich: ' : 'Bereiche: ') + nm + ' ▸', cx + cw / 2, cy + 10, 12, '#2b9348', 'center', null); UI.btn(cx, cy - 4, cw, 28, () => { this.mode = 'stages'; Sfx.play('tap'); }); }
    if (o.mode === 'duell') { seg(ry + 126, 'Wie vielen Leuten pro Bereich helfen?', [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']], o.kids, v => (o.kids = v)); { const hw = (rw - 44) / 2, y = ry + 178;   // zwei getrennte Felder: Boss-Level | Gegner live sehen
      [['Boss-Level am Ende', o.boss, () => (o.boss = !o.boss)], ['Gegner live sehen', o.live, () => (o.live = !o.live)]].forEach(([lab, on, fn], i) => {
        const bx = rx + 14 + i * (hw + 16); rrPath(c, bx, y - 12, hw, 66, 14); fs(c, 'rgba(255,255,255,.55)', 2, 'rgba(61,44,31,.35)');
        txt(c, lab, bx + hw / 2, y + 4, 12, '#6b5a48', 'center', null);
        const tw2 = Math.min(64, hw / 2 - 10); [['Ja', true], ['Nein', false]].forEach(([n, v], k) => { const tx = bx + hw / 2 - tw2 - 3 + k * (tw2 + 6), sel = on === v; rrPath(c, tx, y + 16, tw2, 30, 12); fs(c, sel ? (v ? '#06d6a0' : '#ffd166') : '#fff', 2.5); txt(c, n, tx + tw2 / 2, y + 31, 13, '#3d2c1f', 'center', null); UI.btn(tx, y + 16, tw2, 30, () => { if (on !== v) fn(); Sfx.play('tap'); }); });
      }); } }
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
    const o = this.lob.opts, stars = { easy: 'Leicht', medium: 'Mittel', hard: 'Schwer' }[o.diff];
    txt(c, o.mode === 'team' ? 'Zusammen spielen · ' + stars : 'Duell · ' + o.kids + (o.kids === 1 ? ' Kind' : ' Kinder') + (o.boss ? ' + Boss-Level' : '') + ' · ' + stars, W / 2, y + 30, Math.min(18, w / 22), BRAND.olive, 'center', null);
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
  get stage() { return this.stages[this.si] || 'spielplatz'; }
  constructor(lob, me) { this.stages = (lob.opts && lob.opts.stages && lob.opts.stages.length ? lob.opts.stages : [(lob.opts && lob.opts.stage) || 'spielplatz']); if (lob.opts && lob.opts.mode === 'team') this.stages = this.stages.slice(0, 1); this.si = 0; this.elapsed = 0; this.lob = lob; this.me = me; this.code = lob.code; this.seed = lob.seed; this.opts = lob.opts; this.mode = lob.opts.mode || 'duell'; this.other = null; this.otherName = (me === 'host' ? lob.guest : lob.host).name; this.prog = {}; this.lastOther = Date.now(); this.over = null; this.busy = false; this.t0 = Date.now(); this.loop(); }
  // Abgleich ohne Pause: nach jeder Antwort sofort (0,3 s) die nächste Abfrage
  async loop() { while (this.over !== 'done') { await this.sync(); await new Promise(r => setTimeout(r, 1500)); } }   // sparsam: jeder Abgleich kostet Speicher-Zugriffe
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
