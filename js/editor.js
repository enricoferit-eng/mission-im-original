'use strict';
// ---------- Figur bearbeiten: Tier, Fellfarbe, Halstuch, Kappe, Muster ----------
const FUR_TINTS = {
  normal: null,
  hell: { body: '#f3d9b1', light: '#fff4e0', dark: '#c9a77a' },
  braun: { body: '#8d5a3b', light: '#d4a373', dark: '#5c3d2e' },
  grau: { body: '#adb5bd', light: '#eef0f2', dark: '#6c757d' },
  schoko: { body: '#5c3d2e', light: '#a0673a', dark: '#3d2c1f' },
  rosa: { body: '#f7b6c2', light: '#ffe5ec', dark: '#d6869a' },
};
const EDIT_COLS = ['#6bb544', '#ef476f', '#ffd166', '#118ab2', '#9b5de5', '#f77f00', '#212529', '#f8f9fa', 'rainbow'];
const EDIT_PATS = [['', 'Ohne'], ['dots', 'Punkte'], ['stripes', 'Streifen'], ['stars', 'Sterne'], ['leaf', 'Blatt']];
function customLook() {
  const a = ACC(), u = a && a.custom; if (!u) return null;
  const L = { cap: u.cap || DEFAULT_LOOK.cap, scarf: u.scarf || DEFAULT_LOOK.scarf };
  if (u.pat === 'dots') L.dots = '#fff'; else if (u.pat === 'leaf') L.leaf = true; else if (u.pat) L.pat = u.pat;
  return L;
}
{
  // ohne angezogenen Skin gilt das selbst gestaltete Aussehen
  const lookOf0 = lookOf;
  lookOf = function (kind) { const s = ACC() ? DP(CUR_DIFF).equip : null; if (s && SKINS[s]) return SKINS[s]; return customLook() || lookOf0(kind); };
  // Fellfarbe: das Tier wird mit den gewählten Farben gezeichnet
  const draw0 = drawAnimal;
  drawAnimal = function (c, kind, x, y, s, o = {}) {
    const a = ACC(), tint = a && a.custom && FUR_TINTS[a.custom.fur];
    if (!tint || o.noTint || kind !== (a.char || kind)) return draw0(c, kind, x, y, s, o);
    const keep = ANIMALS[kind]; ANIMALS[kind] = Object.assign({}, keep, tint);
    try { return draw0(c, kind, x, y, s, o); } finally { ANIMALS[kind] = keep; }
  };
}
class CharEditor {
  constructor(back) { this.back = back || (() => setScene(new Menu())); this.t = 0; this.tab = 'tier'; const a = ACC(); if (a && !a.custom) a.custom = {}; }
  enter() { FX.clear(); Voice.say('Gestalte deine Figur.', true); }
  update(dt) { this.t += dt; }
  draw(c) {
    skyBg(c);
    const a = ACC(); if (!a) return; const u = a.custom;
    topBar(c, () => { Save.write(); this.back(); });
    txt(c, 'Figur bearbeiten', 104, 44, 22, '#fff', 'left', BRAND.olive);
    const land = W > H, pw = land ? Math.min(W * 0.36, 300) : W - 24, ph = land ? H - 100 : Math.min(250, H * 0.36);
    const px = 12, py = 86;
    panel(c, px, py, pw, ph, '#d8f3dc', 24);
    const sc = Math.min(pw / 48, ph / 78);
    drawAnimal(c, a.char || 'cat', px + pw / 2, py + ph * 0.86, sc, { t: this.t, moving: Math.sin(this.t * 0.8) > 0.3, dir: Math.sin(this.t * 0.4) > 0 ? 1 : -1, look: customLook() || DEFAULT_LOOK, cap: true });
    if (DP(CUR_DIFF).equip) wrapLines(c, 'Du trägst gerade einen Skin – dein Aussehen siehst du, wenn du ihn im Kleiderschrank ausziehst.', pw - 24, 11).forEach((l, i) => txt(c, l, px + pw / 2, py + 18 + i * 14, 11, '#2d6a4f', 'center', null));
    // rechts: Reiter + Auswahl
    const rx = land ? px + pw + 12 : 12, ry = land ? 86 : py + ph + 10, rw = land ? W - rx - 12 : W - 24, rh = H - ry - 12;
    panel(c, rx, ry, rw, rh, '#fff7e6', 22);
    const tabs = [['tier', 'Tier'], ['fell', 'Fell'], ['tuch', 'Halstuch'], ['kappe', 'Kappe'], ['muster', 'Muster']], tw = (rw - 20) / tabs.length;
    tabs.forEach(([k, n], i) => { const x = rx + 10 + i * tw, sel = this.tab === k; rrPath(c, x + 2, ry + 10, tw - 4, 30, 12); fs(c, sel ? '#ffd166' : '#fff', 2.5); txt(c, n, x + tw / 2, ry + 25, 13, '#3d2c1f', 'center', null); UI.btn(x + 2, ry + 10, tw - 4, 30, () => { this.tab = k; }); });
    const gx = rx + 14, gy = ry + 52, gw = rw - 28, gh = rh - 62, pick = (fn) => { fn(); Save.write(); Sfx.play('pop'); };
    if (this.tab === 'tier') {
      const L = typeof ownedAnimals === 'function' ? ownedAnimals() : ['cat', 'dog', 'lion'], n = L.length, cw = Math.min(110, gw / Math.min(n, 3) - 8), rows = Math.ceil(n / 3), ch = Math.min(110, gh / rows - 8);
      L.forEach((k, i) => { const x = gx + (i % 3) * (cw + 8), y = gy + Math.floor(i / 3) * (ch + 8), sel = a.char === k; rrPath(c, x, y, cw, ch, 16); fs(c, sel ? '#d8f5e3' : '#fff', 2.5); drawAnimal(c, k, x + cw / 2, y + ch * 0.8, ch / 80, { t: this.t + i, noTint: true, look: DEFAULT_LOOK, noShadow: true }); txt(c, ANIMAL_NAMES[k], x + cw / 2, y + ch - 10, 11, BRAND.olive, 'center', null); UI.btn(x, y, cw, ch, () => pick(() => { a.char = k; })); });
    } else if (this.tab === 'fell') {
      const K = Object.keys(FUR_TINTS), cw = Math.min(110, gw / 3 - 8), ch = Math.min(100, gh / 2 - 8);
      K.forEach((k, i) => { const x = gx + (i % 3) * (cw + 8), y = gy + Math.floor(i / 3) * (ch + 8), sel = (u.fur || 'normal') === k, T = FUR_TINTS[k] || ANIMALS[a.char || 'cat']; rrPath(c, x, y, cw, ch, 16); fs(c, sel ? '#d8f5e3' : '#fff', 2.5); ell(c, x + cw / 2, y + ch * 0.42, ch * 0.26, ch * 0.26); fs(c, T.body, 3); ell(c, x + cw / 2 + ch * 0.08, y + ch * 0.47, ch * 0.13, ch * 0.11); c.fillStyle = T.light; c.fill(); txt(c, k[0].toUpperCase() + k.slice(1), x + cw / 2, y + ch - 12, 12, BRAND.olive, 'center', null); UI.btn(x, y, cw, ch, () => pick(() => { u.fur = k; })); });
    } else if (this.tab === 'tuch' || this.tab === 'kappe') {
      const key = this.tab === 'tuch' ? 'scarf' : 'cap', r = Math.min(30, gw / 10), per = Math.max(1, Math.floor(gw / (r * 2 + 12)));
      EDIT_COLS.forEach((col, i) => { const x = gx + r + (i % per) * (r * 2 + 12), y = gy + r + 6 + Math.floor(i / per) * (r * 2 + 12), sel = (u[key] || DEFAULT_LOOK[key]) === col; ell(c, x, y, r, r); fs(c, paint(c, col, x - r, x + r), sel ? 5 : 3, sel ? '#06d6a0' : OL); UI.btn(x - r, y - r, r * 2, r * 2, () => pick(() => { u[key] = col; })); });
      txt(c, key === 'cap' ? 'Die Kappe bekommst du auf dem Spielplatz.' : '', gx + gw / 2, gy + gh - 10, 11, '#6b5a48', 'center', null);
    } else {
      const bw = Math.min(140, gw / 2 - 8), bh = 40;
      EDIT_PATS.forEach(([k, n], i) => { const x = gx + (i % 2) * (bw + 8), y = gy + Math.floor(i / 2) * (bh + 8), sel = (u.pat || '') === k; rrPath(c, x, y, bw, bh, 14); fs(c, sel ? '#ffd166' : '#fff', 2.5); txt(c, n, x + bw / 2, y + bh / 2, 14, '#3d2c1f', 'center', null); UI.btn(x, y, bw, bh, () => pick(() => { u.pat = k; })); });
    }
  }
}
