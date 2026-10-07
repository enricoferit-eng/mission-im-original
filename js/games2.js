'use strict';
// ---------- Restaurant-Aufgaben aus dem Original (für alle Stufen; Schwierigkeit über env.diff) ----------
const LVL = env => (env.diff === 'easy' ? 0 : env.diff === 'medium' ? 1 : 2);

// kleine Zeichen-Helfer: Geschirr von oben
function dPlate(c, x, y, r, col = '#fff') { ell(c, x, y, r, r); fs(c, col, 3); ell(c, x, y, r * 0.68, r * 0.68); fs(c, null, 1.5, 'rgba(0,0,0,.15)'); }
function dFork(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); rrPath(c, -3, -4, 6, 34, 3); fs(c, '#ced4da', 2); for (let i = -1; i <= 1; i++) { rrPath(c, i * 4 - 1.2, -22, 2.4, 18, 1); fs(c, '#ced4da', 1.2); } rrPath(c, -6, -8, 12, 6, 2); fs(c, '#ced4da', 1.5); c.restore(); }
function dKnife(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); rrPath(c, -3, 2, 6, 28, 3); fs(c, '#8d5a3b', 2); c.beginPath(); c.moveTo(-3, 2); c.lineTo(-3, -24); c.quadraticCurveTo(4, -20, 3, 2); c.closePath(); fs(c, '#dee2e6', 2); c.restore(); }
function dSpoon(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); rrPath(c, -2.5, -4, 5, 32, 2.5); fs(c, '#ced4da', 2); ell(c, 0, -14, 7, 10); fs(c, '#dee2e6', 2); c.restore(); }
function dGlass(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); ell(c, 0, 0, 13, 13); fs(c, 'rgba(200,235,250,.85)', 2.5); ell(c, -4, -4, 4, 3); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill(); c.restore(); }
function dNapkin(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); polyPath(c, [[-14, -16], [14, -16], [14, 16], [-14, 16]]); fs(c, BRAND.lime, 2.5); line(c, -14, -16, 14, 16, 1.5, 'rgba(255,255,255,.6)', false); c.restore(); }
function dCup(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); ell(c, 0, 0, 16, 16); fs(c, '#fff', 2.5); ell(c, 0, 0, 10, 10); fs(c, '#8d5a3b', 1.5); rrPath(c, 13, -3, 9, 6, 3); fs(c, '#fff', 2); c.restore(); }
const SETTING = { teller: dPlate, gabel: dFork, messer: dKnife, loeffel: dSpoon, glas: dGlass, serviette: dNapkin, tasse: dCup };
function drawSetting(c, k, x, y, s = 1, ghost) {
  c.save(); if (ghost) { c.globalAlpha = 0.28; }
  if (k === 'teller') dPlate(c, x, y, 34 * s); else SETTING[k](c, x, y, s);
  c.restore();
}
function terraceBg(c) {
  c.fillStyle = '#e3dbcd'; c.fillRect(0, 0, GAME_W, GAME_H);
  c.strokeStyle = 'rgba(120,105,90,.2)'; c.lineWidth = 1.5;
  for (let x = 0; x < GAME_W; x += 50) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, GAME_H); c.stroke(); }
  for (let y = 0; y < GAME_H; y += 50) { c.beginPath(); c.moveTo(0, y); c.lineTo(GAME_W, y); c.stroke(); }
}
function recipeCard(c, x, y, w, h, title) {
  rrPath(c, x, y, w, h, 12); fs(c, '#fffaf0', 3); line(c, x + 10, y + 26, x + w - 10, y + 26, 1.5, 'rgba(53,69,47,.3)', false);
  txt(c, title, x + w / 2, y + 14, 13, BRAND.olive, 'center', null);
}

// 1) Tisch decken
GAMES.tisch = { make(env) {
  const r = env.r, L = LVL(env), sets = L === 0 ? 1 : 2;
  const layout = k => ({ teller: [0, 0], gabel: [-48, 0], messer: [48, 0], glas: [52, -46], serviette: [-82, 0], loeffel: [62, 0], tasse: [-52, -48] });
  const keys = L === 2 ? ['teller', 'gabel', 'messer', 'glas', 'serviette', 'tasse'] : ['teller', 'gabel', 'messer', 'glas', 'serviette'];
  const centers = sets === 1 ? [[200, 170]] : [[200, 110], [200, 255]];
  const slots = []; centers.forEach(([cx, cy]) => keys.forEach(k => { const [dx, dy] = layout()[k]; slots.push({ k, x: cx + dx, y: cy + dy, filled: false }); }));
  const extra = L > 0 ? ['loeffel'] : [];
  const pieces = shuffle(slots.map(sl => sl.k).concat(extra), r);
  const cols = Math.min(pieces.length, 7), rows = Math.ceil(pieces.length / cols);
  const its = pieces.map((k, i) => { const x = 40 + (i % cols) * (320 / Math.max(1, cols - 1)), y = 400 + Math.floor(i / cols) * 70; return { k, x, y, hx: x, hy: y, hw: 32, hh: 32, locked: false }; });
  const fin = finisher(env);
  const kit = dragKit(its, o => {
    const sl = slots.find(q => !q.filled && q.k === o.k && dist(o.x, o.y, q.x, q.y) < 46);
    if (sl) { sl.filled = true; o.hx = sl.x; o.hy = sl.y; o.locked = true; Sfx.play('good'); env.burst(sl.x, sl.y, 8); if (slots.every(q => q.filled)) fin.set(0.6); }
  });
  return {
    hint: { type: 'drag', x: its[0].x, y: its[0].y, x2: slots.find(q => q.k === its[0].k).x, y2: slots.find(q => q.k === its[0].k).y },
    update(dt) { kit.update(dt); fin.tick(dt); },
    draw(c) {
      terraceBg(c);
      rrPath(c, 30, 40, 340, sets === 1 ? 260 : 320, 26); fs(c, '#fbf8f2', 4);
      c.strokeStyle = 'rgba(53,69,47,.12)'; c.lineWidth = 10; for (let x = 50; x < 370; x += 30) { c.beginPath(); c.moveTo(x, 44); c.lineTo(x, sets === 1 ? 296 : 356); c.stroke(); }
      slots.forEach(sl => { if (!sl.filled) drawSetting(c, sl.k, sl.x, sl.y, 1, true); });
      rrPath(c, 14, 360, 372, 150, 18); fs(c, '#d9cfbf', 3);
      for (const q of kit.sorted()) drawSetting(c, q.k, q.x, q.y, 1);
    },
    down: (x, y) => kit.down(x, y), move: (x, y) => kit.move(x, y), up: () => kit.up(),
  };
} };

// 2) Flammkuchen belegen (Mengen wie auf dem Rezept)
GAMES.belegen = { make(env) {
  const r = env.r, L = LVL(env);
  const TOP = [{ k: 'speck', col: '#e07a5f' }, { k: 'zwiebel', col: '#c9a0dc' }, { k: 'pilz', col: '#c8b6a6' }, { k: 'lauch', col: '#80b918' }];
  const kinds = TOP.slice(0, 2 + L);
  const want = kinds.map(() => ri(2, 3 + L, r)), have = kinds.map(() => 0), placed = [];
  let shake = -1, sT = 0, hideT = L === 2 ? 5 : 1e9; const fin = finisher(env);
  const topping = (c, k, x, y, s = 1) => {
    if (k === 'speck') { rrPath(c, x - 7 * s, y - 4 * s, 14 * s, 8 * s, 2); fs(c, '#e07a5f', 2); line(c, x - 5 * s, y, x + 5 * s, y, 1.5, '#fff', false); }
    else if (k === 'zwiebel') { c.beginPath(); c.arc(x, y, 7 * s, 0, TAU); c.lineWidth = 3 * s; c.strokeStyle = '#9d6bb5'; c.stroke(); c.beginPath(); c.arc(x, y, 4 * s, 0, TAU); c.lineWidth = 2 * s; c.strokeStyle = '#c9a0dc'; c.stroke(); }
    else if (k === 'pilz') { c.beginPath(); c.arc(x, y, 7 * s, Math.PI, 0); c.closePath(); fs(c, '#c8b6a6', 2); rrPath(c, x - 2.5 * s, y, 5 * s, 6 * s, 1.5); fs(c, '#efe6dd', 1.5); }
    else { ell(c, x, y, 3 * s, 6 * s, 0.5); fs(c, '#80b918', 1.5); }
  };
  return {
    hint: { type: 'tap', x: 70, y: 455 },
    update(dt) { sT -= dt; hideT -= dt; fin.tick(dt); },
    draw(c) {
      bgWood(c);
      recipeCard(c, 12, 12, 150, 40 + kinds.length * 30, 'Rezept');
      kinds.forEach((t, i) => { const y = 62 + i * 30; topping(c, t.k, 36, y, 1.2); if (hideT > 0) txt(c, '× ' + want[i], 80, y + 1, 18, BRAND.olive, 'left', null); else txt(c, '× ?', 80, y + 1, 18, '#adb5bd', 'left', null); });
      rrPath(c, 180, 40, 205, 300, 18); fs(c, '#c08b55', 4);
      rrPath(c, 196, 58, 173, 264, 34); fs(c, '#f3d39b', 3); rrPath(c, 210, 74, 145, 232, 26); c.fillStyle = '#fffaf0'; c.fill();
      placed.forEach(p => topping(c, p.k, p.x, p.y, 1.1));
      kinds.forEach((t, i) => {
        const x = 70 + i * (L === 2 ? 88 : L === 1 ? 110 : 140), y = 455, sx = shake === i && sT > 0 ? shakeX(sT) * 0.5 : 0;
        ell(c, x + sx, y, 38, 30); fs(c, '#fbf8f2', 3); for (let k = 0; k < 5; k++) topping(c, t.k, x + sx - 16 + (k % 3) * 16, y - 6 + Math.floor(k / 3) * 12, 0.9);
        ell(c, x + 26, y - 26, 12, 12); fs(c, '#fff', 2); txt(c, String(have[i]), x + 26, y - 25, 13, BRAND.olive, 'center', null);
      });
    },
    down(x, y) {
      if (fin.on() || y < 410) return;
      const step = L === 2 ? 88 : L === 1 ? 110 : 140, i = Math.round((x - 70) / step);
      if (i < 0 || i >= kinds.length) return;
      if (have[i] >= want[i]) { shake = i; sT = 0.4; Sfx.play('bad'); return; }
      have[i]++; placed.push({ k: kinds[i].k, x: 225 + r() * 115, y: 90 + r() * 200 }); Sfx.play('tap');
      if (have.every((v, j) => v === want[j])) { fin.set(0.6); env.burst(280, 190, 20); Sfx.play('good'); }
    },
  };
} };

// 3) Eisbecher nach Rezept (Reihenfolge von unten nach oben)
GAMES.eisbecher_r = { make(env) {
  const r = env.r, L = LVL(env);
  const FL = [{ n: 'Erdbeere', col: '#ff8fab' }, { n: 'Vanille', col: '#fff1c1' }, { n: 'Schoko', col: '#8d5a3b' }, { n: 'Pistazie', col: '#a7c957' }, { n: 'Blaubeere', col: '#9d8df1' }];
  const n = 3 + L, order = []; for (let i = 0; i < n; i++) order.push(ri(0, FL.length - 1, r));
  let idx = 0, shake = -1, sT = 0, hideT = L === 2 ? 4.5 : 1e9; const fin = finisher(env);
  return {
    hint: { type: 'tap', x: 52 + order[0] * 74, y: 460 },
    update(dt) { sT -= dt; hideT -= dt; fin.tick(dt); },
    draw(c) {
      terraceBg(c);
      recipeCard(c, 12, 12, 120, 60 + n * 34, 'Bestellung');
      for (let i = 0; i < n; i++) { const y = 60 + (n - 1 - i) * 34 + 14; if (hideT > 0 || i < idx) { ell(c, 72, y, 15, 13); fs(c, FL[order[i]].col, 2.5); } else { ell(c, 72, y, 15, 13); fs(c, '#e9ecef', 2); txt(c, '?', 72, y + 1, 14, '#adb5bd', 'center', null); } }
      // Becher
      polyPath(c, [[190, 300], [330, 300], [300, 380], [220, 380]]); fs(c, 'rgba(200,235,250,.85)', 4);
      rrPath(c, 252, 380, 16, 30, 3); fs(c, 'rgba(200,235,250,.85)', 3); ell(c, 260, 412, 40, 8); fs(c, 'rgba(200,235,250,.85)', 3);
      for (let i = 0; i < idx; i++) { ell(c, 260 + (i % 2 ? 8 : -8), 290 - i * 26, 30, 22); fs(c, FL[order[i]].col, 3); }
      if (idx >= n) { ell(c, 260, 290 - n * 26 + 4, 7, 7); fs(c, '#e63946', 2.5); }
      FL.forEach((f, i) => { const x = 52 + i * 74, sx = shake === i && sT > 0 ? shakeX(sT) * 0.5 : 0; rrPath(c, x - 30 + sx, 432, 60, 56, 10); fs(c, '#adb5bd', 3); ell(c, x + sx, 446, 24, 10); fs(c, f.col, 2.5); txt(c, f.n, x + sx, 478, 10, '#fff', 'center', BRAND.ink); });
    },
    down(x, y) {
      if (fin.on() || y < 425) return;
      const i = Math.round((x - 52) / 74); if (i < 0 || i >= FL.length) return;
      if (i === order[idx]) { idx++; Sfx.play('tap'); if (idx >= n) { fin.set(0.7); env.burst(260, 200, 20); Sfx.play('good'); } }
      else { shake = i; sT = 0.4; Sfx.play('bad'); buzz(50); }
    },
  };
} };

// 4) Hausgemachte Limo mixen
GAMES.limo_mix = { make(env) {
  const r = env.r, L = LVL(env);
  const ING = [{ k: 'zitrone', col: '#ffd60a' }, { k: 'minze', col: '#52b788' }, { k: 'eis', col: '#bde0fe' }, { k: 'himbeere', col: '#e63946' }].slice(0, 3 + (L > 0 ? 1 : 0));
  const want = ING.map(() => ri(1, 2 + L, r)), have = ING.map(() => 0), bits = [];
  let shake = -1, sT = 0, hideT = L === 2 ? 5 : 1e9; const fin = finisher(env);
  const ing = (c, k, x, y, s = 1) => {
    if (k === 'zitrone') { ell(c, x, y, 10 * s, 10 * s); fs(c, '#ffd60a', 2); ell(c, x, y, 6 * s, 6 * s); fs(c, '#fff3b0', 1); }
    else if (k === 'minze') { ell(c, x, y, 6 * s, 10 * s, 0.6); fs(c, '#52b788', 2); }
    else if (k === 'eis') { rrPath(c, x - 8 * s, y - 8 * s, 16 * s, 16 * s, 3); fs(c, 'rgba(220,240,255,.95)', 2); }
    else { ell(c, x, y, 8 * s, 8 * s); fs(c, '#e63946', 2); c.fillStyle = 'rgba(255,255,255,.6)'; ell(c, x - 2 * s, y - 2 * s, 2 * s, 2 * s); c.fill(); }
  };
  return {
    hint: { type: 'tap', x: 60, y: 455 },
    update(dt) { sT -= dt; hideT -= dt; fin.tick(dt); },
    draw(c) {
      terraceBg(c);
      recipeCard(c, 12, 12, 140, 40 + ING.length * 32, 'Limo-Rezept');
      ING.forEach((t, i) => { const y = 60 + i * 32; ing(c, t.k, 34, y, 1.1); txt(c, hideT > 0 ? '× ' + want[i] : '× ?', 70, y + 1, 18, hideT > 0 ? BRAND.olive : '#adb5bd', 'left', null); });
      // Krug
      rrPath(c, 200, 70, 140, 270, 26); fs(c, 'rgba(220,240,250,.8)', 4);
      const fill = clamp(bits.length / want.reduce((a, b) => a + b, 0), 0, 1);
      rrPath(c, 206, 330 - 250 * fill, 128, 250 * fill + 4, 20); c.fillStyle = 'rgba(255,224,102,.75)'; c.fill();
      bits.forEach(b => ing(c, b.k, b.x, b.y, 1.1));
      c.beginPath(); c.arc(345, 170, 34, -1.2, 1.2); c.lineWidth = 10; c.strokeStyle = OL; c.stroke(); c.lineWidth = 6; c.strokeStyle = 'rgba(220,240,250,.95)'; c.stroke();
      ING.forEach((t, i) => {
        const x = 60 + i * 94, y = 455, sx = shake === i && sT > 0 ? shakeX(sT) * 0.5 : 0;
        ell(c, x + sx, y, 38, 30); fs(c, '#fbf8f2', 3); for (let k = 0; k < 4; k++) ing(c, t.k, x + sx - 12 + (k % 2) * 24, y - 8 + Math.floor(k / 2) * 16, 0.8);
        ell(c, x + 28, y - 26, 12, 12); fs(c, '#fff', 2); txt(c, String(have[i]), x + 28, y - 25, 13, BRAND.olive, 'center', null);
      });
    },
    down(x, y) {
      if (fin.on() || y < 410) return;
      const i = Math.round((x - 60) / 94); if (i < 0 || i >= ING.length) return;
      if (have[i] >= want[i]) { shake = i; sT = 0.4; Sfx.play('bad'); return; }
      have[i]++; bits.push({ k: ING[i].k, x: 225 + r() * 90, y: 120 + r() * 190 }); Sfx.play('pop');
      if (have.every((v, j) => v === want[j])) { fin.set(0.7); env.burst(270, 200, 20); Sfx.play('good'); }
    },
  };
} };

// 5) Geschirr spülen (mit dem Finger sauber wischen)
GAMES.spuelen = { make(env) {
  const r = env.r, L = LVL(env), plates = 3 + L;
  let cur = 0, spots = [], slide = 0, done = 0; const fin = finisher(env);
  const mk = () => { spots = []; const n = 5 + L * 3; for (let i = 0; i < n; i++) { const a = r() * TAU, d = r() * 95; spots.push({ x: 200 + Math.cos(a) * d, y: 250 + Math.sin(a) * d, s: 14 + r() * 14, a: 1, col: pick(['#8d5a3b', '#d62828', '#e9b949'], r) }); } slide = 1; };
  mk();
  let drag = false;
  return {
    hint: { type: 'swipe', x: 200, y: 250 },
    update(dt) { slide = Math.max(0, slide - dt * 3); fin.tick(dt); },
    draw(c) {
      c.fillStyle = '#cfe8ef'; c.fillRect(0, 0, GAME_W, GAME_H);
      for (let i = 0; i < 14; i++) { c.fillStyle = 'rgba(255,255,255,.6)'; ell(c, (i * 71) % 400, (i * 53) % 520, 8 + (i % 4) * 4, 8 + (i % 4) * 4); c.fill(); }
      txt(c, (done) + ' / ' + plates, 200, 34, 20, BRAND.olive, 'center', '#fff');
      c.save(); c.translate(slide * 300, 0);
      dPlate(c, 200, 250, 140);
      spots.forEach(s => { if (s.a <= 0) return; c.globalAlpha = s.a; ell(c, s.x, s.y, s.s, s.s * 0.8); c.fillStyle = s.col; c.fill(); c.globalAlpha = 1; });
      c.restore();
      for (let i = 0; i < plates - done - 1; i++) { ell(c, 60 + i * 14, 470 - i * 6, 34, 12); fs(c, '#fff', 2.5); }
    },
    down() { drag = true; },
    move(x, y) {
      if (!drag || fin.on() || slide > 0.1) return;
      let any = false;
      for (const s of spots) if (s.a > 0 && dist(x, y, s.x, s.y) < s.s + 22) { s.a -= 0.12; any = true; }
      if (any && Math.random() < 0.3) Sfx.play('tap');
      if (spots.every(s => s.a <= 0)) { done++; Sfx.play('good'); env.burst(200, 250, 14); if (done >= plates) fin.set(0.5); else mk(); }
    },
    up() { drag = false; },
  };
} };

// 6) Palmen gießen
GAMES.giessen = { make(env) {
  const r = env.r, L = LVL(env), n = 3 + L, dry = [0, 0.05, 0.09][L];
  const palms = []; for (let i = 0; i < n; i++) palms.push({ x: 50 + (i + 0.5) * (300 / n), w: 0.15 + r() * 0.3 });
  let can = { x: 200, y: 140 }, held = false, t = 0; const fin = finisher(env);
  return {
    hint: { type: 'drag', x: 200, y: 140, x2: palms[0].x, y2: 170 },
    update(dt) {
      t += dt;
      for (const p of palms) { if (held && Math.abs(can.x - p.x) < 40 && can.y < 260) p.w = Math.min(1, p.w + dt * 0.55); else p.w = Math.max(0, p.w - dry * dt); }
      if (!fin.on() && palms.every(p => p.w >= 1)) { fin.set(0.6); env.burst(200, 260, 24); Sfx.play('good'); }
      fin.tick(dt);
    },
    draw(c) {
      terraceBg(c);
      palms.forEach(p => {
        const wilt = 1 - p.w;
        c.save(); c.translate(p.x, 420); c.rotate(wilt * 0.15);
        drawPotPalm(c, 0, 0, 1.15, t);
        c.restore();
        rrPath(c, p.x - 26, 440, 52, 12, 6); fs(c, '#fff', 2); rrPath(c, p.x - 24, 442, 48 * p.w, 8, 4); c.fillStyle = p.w >= 1 ? '#06d6a0' : '#4dabf7'; c.fill();
      });
      if (held) for (let i = 0; i < 4; i++) { const yy = can.y + 20 + ((t * 300 + i * 30) % 120); ell(c, can.x - 30, yy, 3, 5); c.fillStyle = '#4dabf7'; c.fill(); }
      c.save(); c.translate(can.x, can.y);
      rrPath(c, -20, -18, 40, 34, 8); fs(c, '#4dabf7', 3); line(c, -18, -2, -40, 18, 6, '#4dabf7'); c.beginPath(); c.arc(8, -18, 14, Math.PI, 0); c.lineWidth = 4; c.strokeStyle = OL; c.stroke(); leaf(c, 0, 0, 1.1);
      c.restore();
    },
    down(x, y) { if (dist(x, y, can.x, can.y) < 60) held = true; },
    move(x, y) { if (held) { can.x = clamp(x, 30, 370); can.y = clamp(y, 60, 300); } },
    up() { held = false; },
  };
} };

// 7) Bestellungen an die Tische bringen
GAMES.bestellung = { make(env) {
  const r = env.r, L = LVL(env), nt = 3 + L, per = L === 0 ? 1 : 2;
  const dishes = shuffle(FOOD6, r);
  const tables = []; for (let i = 0; i < nt; i++) tables.push({ x: 60 + (i % 3) * 140 + (Math.floor(i / 3) % 2) * 70, y: 90 + Math.floor(i / 3) * 140, want: [], got: [] });
  tables.forEach(tb => { for (let k = 0; k < per; k++) tb.want.push(pick(dishes.slice(0, 3 + L), r)); });
  const need = tables.flatMap(tb => tb.want);
  const tray = shuffle(need.concat(L > 0 ? [pick(dishes, r)] : []), r);
  const its = tray.map((k, i) => { const x = 40 + (i % 7) * 54, y = 420 + Math.floor(i / 7) * 54; return { k, x, y, hx: x, hy: y, hw: 26, hh: 26, locked: false }; });
  let hideT = L === 2 ? 6 : 1e9; const fin = finisher(env);
  const kit = dragKit(its, o => {
    const tb = tables.find(q => dist(o.x, o.y, q.x, q.y) < 60);
    if (!tb) return;
    const open = tb.want.filter((w, i) => !tb.got[i]);
    const wi = tb.want.findIndex((w, i) => w === o.k && !tb.got[i]);
    if (wi >= 0) { tb.got[wi] = true; o.locked = true; o.hx = tb.x - 18 + wi * 36; o.hy = tb.y + 6; Sfx.play('good'); env.burst(tb.x, tb.y, 8); if (tables.every(q => q.want.every((w, i) => q.got[i]))) fin.set(0.6); }
    else if (open.length) Sfx.play('bad');
  });
  return {
    hint: { type: 'drag', x: its[0].x, y: its[0].y, x2: tables[0].x, y2: tables[0].y },
    update(dt) { hideT -= dt; kit.update(dt); fin.tick(dt); },
    draw(c) {
      terraceBg(c);
      tables.forEach(tb => {
        drawUmbrella(c, tb.x + 46, tb.y - 40, 18);
        ell(c, tb.x, tb.y, 44, 44); fs(c, '#fbf8f2', 3.5);
        const done = tb.want.every((w, i) => tb.got[i]);
        rrPath(c, tb.x - 30, tb.y - 72, 60, 30, 12); fs(c, done ? '#d8f5e3' : '#fff', 2.5);
        tb.want.forEach((w, i) => { const bx = tb.x - (per - 1) * 13 + i * 26; if (hideT > 0 || tb.got[i]) drawFood(c, w, bx, tb.y - 57, 22); else txt(c, '?', bx, tb.y - 56, 16, '#adb5bd', 'center', null); });
      });
      rrPath(c, 10, 388, 380, 124, 18); fs(c, '#adb5bd', 3); txt(c, 'Tablett', 46, 400, 11, '#fff', 'center', BRAND.ink);
      for (const q of kit.sorted()) drawFood(c, q.k, q.x, q.y, 40);
    },
    down: (x, y) => kit.down(x, y), move: (x, y) => kit.move(x, y), up: () => kit.up(),
  };
} };

// 8) Laub auf der Terrasse fegen (bei Schwer weht der Wind neue Blätter herein)
GAMES.fegen = { make(env) {
  const r = env.r, L = LVL(env), n = [12, 18, 24][L];
  const leaves = []; const add = () => leaves.push({ x: 30 + r() * 340, y: 30 + r() * 400, rot: r() * 6, col: pick(['#c9a24a', '#b5654a', '#9cbf6b', '#e9a23b'], r), gone: false, vx: 0, vy: 0 });
  for (let i = 0; i < n; i++) add();
  let bx = 200, by = 470, drag = false, wind = L === 2 ? 3 : 1e9, cleared = 0, target = n + (L === 2 ? 6 : 0); const fin = finisher(env);
  return {
    hint: { type: 'swipe', x: 200, y: 250 },
    update(dt) {
      for (const l of leaves) { if (l.gone) continue; l.x += l.vx * dt; l.y += l.vy * dt; l.vx *= 0.9; l.vy *= 0.9; if (l.x < -10 || l.x > 410 || l.y < -10 || l.y > 530) { l.gone = true; cleared++; } }
      wind -= dt; if (wind <= 0 && leaves.filter(l => !l.gone).length < 30 && leaves.length < target) { add(); wind = 2.5; }
      if (!fin.on() && leaves.length >= Math.min(target, leaves.length) && leaves.every(l => l.gone) && (L < 2 || leaves.length >= target)) { fin.set(0.5); env.burst(200, 250, 20); Sfx.play('good'); }
      fin.tick(dt);
    },
    draw(c) {
      terraceBg(c);
      rrPath(c, 330, 440, 60, 70, 8); fs(c, '#6a994e', 3); txt(c, 'Kompost', 360, 430, 11, BRAND.olive, 'center', '#fff');
      leaves.forEach(l => { if (l.gone) return; c.save(); c.translate(l.x, l.y); c.rotate(l.rot); ell(c, 0, 0, 9, 5); fs(c, l.col, 1.5); c.restore(); });
      c.save(); c.translate(bx, by); rrPath(c, -4, -60, 8, 60, 3); fs(c, '#8d5a3b', 2); rrPath(c, -26, -4, 52, 18, 5); fs(c, '#e9c46a', 2.5); for (let i = -20; i <= 20; i += 6) line(c, i, 14, i, 22, 1.5, '#c9a24a', false); c.restore();
      txt(c, String(leaves.filter(l => !l.gone).length), 30, 24, 18, BRAND.olive, 'left', '#fff');
    },
    down(x, y) { drag = true; bx = x; by = y; },
    move(x, y) {
      if (!drag) return;
      const dx = x - bx, dy = y - by; bx = x; by = y;
      for (const l of leaves) if (!l.gone && dist(x, y + 8, l.x, l.y) < 40) { l.vx += dx * 14; l.vy += dy * 14; l.rot += 0.3; }
    },
    up() { drag = false; },
  };
} };

// Punkte verbinden: ergibt jetzt ein Bild aus dem Original
const DOT_SHAPES = {
  glashaus: [[60, 470], [60, 250], [200, 120], [340, 250], [340, 470], [250, 470], [250, 380], [150, 380], [150, 470]],
  eisbecher: [[200, 470], [140, 470], [180, 430], [190, 380], [110, 300], [130, 220], [200, 180], [270, 220], [290, 300], [210, 380], [220, 430], [260, 470]],
  palme: [[180, 470], [190, 300], [100, 330], [170, 250], [90, 200], [200, 220], [240, 140], [230, 230], [330, 210], [240, 270], [310, 330], [215, 300], [220, 470]],
  flammkuchen: [[60, 200], [340, 200], [360, 260], [340, 420], [60, 420], [40, 340]],
};
function shapeDots(name, n) {
  const pts = DOT_SHAPES[name], segs = []; let total = 0;
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], l = dist(a[0], a[1], b[0], b[1]); segs.push([a, b, l]); total += l; }
  const out = [];
  for (let k = 0; k < n; k++) {
    let d = (k / n) * total;
    for (const [a, b, l] of segs) { if (d <= l) { out.push({ x: lerp(a[0], b[0], d / l), y: lerp(a[1], b[1], d / l) }); break; } d -= l; }
  }
  return out;
}

// Neue Restaurant-Aufgaben anmelden (für alle Stufen) + Anleitungen
const RESTO_GAMES = ['tisch', 'belegen', 'eisbecher_r', 'limo_mix', 'spuelen', 'giessen', 'bestellung', 'fegen'];
EASY_GAMES.push(...RESTO_GAMES);
PUZZLES.push(...RESTO_GAMES);
Object.assign(HELP_TEXT, {
  tisch: 'Deck den Tisch für die Gäste! Zieh Teller, Besteck, Glas und Serviette genau auf die hellen Umrisse auf dem Tisch.',
  belegen: 'Beleg den Flammkuchen wie auf dem Rezept: Tippe unten auf die Schalen, bis von jeder Zutat genau so viele drauf sind wie auf dem Zettel steht. Bei 3 Sternen verschwindet das Rezept nach ein paar Sekunden – merk es dir gut!',
  eisbecher_r: 'Bau den Eisbecher nach der Bestellung: Tippe die Eissorten in der richtigen Reihenfolge an – von unten nach oben. Bei 3 Sternen musst du dir die Bestellung merken.',
  limo_mix: 'Misch die hausgemachte Limo: Tippe auf die Zutaten, bis im Krug genau so viele sind wie auf dem Rezept. Zu viel geht nicht!',
  spuelen: 'Spül das Geschirr: Wisch mit dem Finger so lange über die Flecken, bis jeder Teller sauber ist.',
  giessen: 'Gieß die Palmen auf der Terrasse: Nimm die Gießkanne und halte sie über jede Palme, bis ihr Balken voll und grün ist. Bei 2 und 3 Sternen trocknen sie langsam wieder aus – alle müssen gleichzeitig voll sein!',
  bestellung: 'Bring jedem Tisch seine Bestellung: Zieh das Essen vom Tablett auf den Tisch, über dem es in der Sprechblase steht. Bei 3 Sternen verschwinden die Bestellungen nach ein paar Sekunden.',
  fegen: 'Feg das Laub von der Terrasse: Wisch mit dem Finger wie mit einem Besen, bis kein Blatt mehr auf dem Boden liegt. Bei 3 Sternen weht der Wind neue Blätter herein!',
});
