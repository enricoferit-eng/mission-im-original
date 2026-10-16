'use strict';
// ---------- Weitere Spezial-Aufgaben: zu jedem Bereich zwei, die genau dorthin passen ----------
const L6 = env => (env.diff === 'easy' ? 0 : env.diff === 'medium' ? 1 : 2);
const fxText = (c, list) => list.forEach(f => { c.globalAlpha = Math.max(0, 1 - f.t / 0.7); txt(c, f.s, f.x, f.y - f.t * 30, 18, f.ok ? '#2b9348' : '#e63946', 'center', '#fff'); c.globalAlpha = 1; });

// Zutaten für die Küche (einfach gezeichnet, gut erkennbar)
const INGR = ['tomate', 'kaese', 'salatkopf', 'zwiebel', 'pilz', 'paprika'];
function drawIngr(c, k, x, y, s = 1) {
  if (ITEMS[k]) { drawItem(c, k, x, y, 44 * s); return; }
  c.save(); c.translate(x, y); c.scale(s, s);
  if (k === 'zwiebel') { ell(c, 0, 2, 16, 15); fs(c, '#c77dff', 2.5); line(c, -6, -10, 0, 14, 1.5, 'rgba(255,255,255,.5)', false); line(c, 6, -10, 0, 14, 1.5, 'rgba(255,255,255,.5)', false); polyPath(c, [[-3, -12], [0, -22], [3, -12]]); fs(c, '#7cb518', 2); }
  else if (k === 'pilz') { rrPath(c, -6, -2, 12, 16, 4); fs(c, '#f1e3c8', 2.5); c.beginPath(); c.arc(0, -2, 17, Math.PI, 0); c.closePath(); fs(c, '#a0673a', 2.5); ell(c, -6, -9, 3, 2.5); c.fillStyle = '#e9c9a3'; c.fill(); ell(c, 6, -7, 2.5, 2); c.fill(); }
  else if (k === 'paprika') { c.beginPath(); c.moveTo(0, -12); c.bezierCurveTo(20, -14, 18, 14, 4, 16); c.bezierCurveTo(-2, 18, -18, 14, -16, -2); c.bezierCurveTo(-15, -12, -6, -13, 0, -12); fs(c, '#2b9348', 2.5); rrPath(c, -2, -20, 4, 9, 2); fs(c, '#6a994e', 2); }
  c.restore();
}

// ===== Küche =====
// 1) Rezept nachkochen: Erst das Rezept ansehen, dann die Zutaten in der richtigen Reihenfolge in den Topf tippen
GAMES.rezept = { make(env) {
  const r = env.r, L = L6(env), n = 3 + L, rounds = L === 0 ? 1 : 2, shelf = shuffle(INGR, r);
  let round = 0, seq = [], pos = 0, show = 0, t = 0, shake = 0, fx = [], drops = []; const fin = finisher(env);
  const newRound = () => { seq = []; for (let k = 0; k < n; k++) seq.push(pick(INGR.filter(q => q !== seq[k - 1]), r)); pos = 0; show = L === 0 ? 999 : 3.2 + n * 0.5; };
  newRound();
  const slot = i => ({ x: 50 + (i % 3) * 150, y: i < 3 ? 400 : 470 });
  return {
    dbg: () => ({ seq, pos, shelf, show, slots: shelf.map((k, i) => slot(i)) }),
    hint: { type: 'tap', x: slot(shelf.indexOf(seq[0])).x, y: slot(shelf.indexOf(seq[0])).y },
    update(dt) { t += dt; show -= dt; shake = Math.max(0, shake - dt); fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7); drops.forEach(d => (d.t += dt)); drops = drops.filter(d => d.t < 0.5); fin.tick(dt); },
    draw(c) {
      kitchenBg(c, 330);
      // Topf auf dem Herd
      rrPath(c, 120, 300, 160, 30, 6); fs(c, '#343a40', 3);
      c.save(); c.translate(200 + Math.sin(shake * 40) * shake * 20, 0); pot(c, 0, 260, 64, '#adb5bd');
      for (let k = 0; k < 4; k++) { const by = 230 - ((t * 30 + k * 13) % 30); ell(c, -30 + k * 20, by, 5, 5); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); }
      c.restore();
      drops.forEach(d => drawIngr(c, d.k, lerp(d.x, 200, d.t / 0.5), lerp(d.y, 230, d.t / 0.5), 1 - d.t));
      // Rezeptkarte
      rrPath(c, 40, 60, 320, 110, 14); fs(c, '#fff7e6', 3);
      const visible = show > 0;
      seq.forEach((k, i) => { const x = 200 + (i - (n - 1) / 2) * 58, y = 118; ell(c, x, y, 25, 25); fs(c, i < pos ? '#d8f5e3' : '#fff', 2.5); if (visible || i < pos) drawIngr(c, k, x, y, 0.9); else icon(c, 'question', x, y, 26); txt(c, String(i + 1), x - 20, y - 22, 12, BRAND.olive, 'center', '#fff'); });
      if (!visible) txt(c, 'Weißt du es noch?', 200, 76, 13, '#6b5a48', 'center', null); else if (L > 0) txt(c, 'Merk dir das Rezept!', 200, 76, 13, '#6b5a48', 'center', null);
      roundDots(c, rounds, round, 30);
      // Regal mit Zutaten
      rrPath(c, 10, 362, 380, 150, 12); fs(c, '#e9ecef', 3);
      shelf.forEach((k, i) => { const p = slot(i); ell(c, p.x, p.y, 30, 30); fs(c, '#fff', 2.5); drawIngr(c, k, p.x, p.y, 1); });
      fxText(c, fx);
    },
    down(x, y) {
      if (fin.on() || (L > 0 && show > 0 && show < 900)) return;
      const i = shelf.findIndex((k, j) => dist(x, y, slot(j).x, slot(j).y) < 34); if (i < 0) return;
      const k = shelf[i], p = slot(i);
      if (k === seq[pos]) { pos++; drops.push({ k, x: p.x, y: p.y, t: 0 }); Sfx.play('good'); env.burst(200, 240, 6); fx.push({ s: 'Lecker!', x: 200, y: 200, t: 0, ok: true });
        if (pos >= n) { round++; if (round >= rounds) fin.set(0.6); else setTimeout(newRound, 600); } }
      else { Sfx.play('bad'); shake = 0.4; fx.push({ s: 'Erst ' + (pos + 1) + '. Zutat!', x: 200, y: 200, t: 0, ok: false }); if (L > 0) show = Math.max(show, 1.2); }
    },
  };
} };

// 2) Pfannkuchen fangen: Der Koch wirft Essen hoch – fang es mit der Pfanne, aber nichts Angebranntes!
GAMES.auffangen = { challenge: true, make(env) {
  const r = env.r, L = L6(env), need = 8 + L * 3, sp = (150 + L * 50) * env.slow;
  let px = 200, tx = 200, items = [], spawn = 0.4, got = 0, t = 0, fx = []; const fin = finisher(env);
  return {
    timeLimit: 30 + L * 5,
    dbg: () => ({ items, px }),
    hint: { type: 'swipe', x: 200, y: 450 },
    update(dt) {
      t += dt; px = lerp(px, tx, Math.min(1, dt * 16)); spawn -= dt; fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7);
      if (spawn <= 0 && !fin.on()) { spawn = (0.95 - L * 0.18) / env.slow; const bad = r() < 0.22 + L * 0.08; items.push({ x: 40 + r() * 320, y: 60, vy: sp * (0.8 + r() * 0.4), bad, k: bad ? 'burnt' : pick(['tomate', 'kaese', 'pfannkuchen', 'pilz'], r), a: 0 }); }
      for (const o of items) {
        o.y += o.vy * dt; o.a += dt * 3;
        if (!o.done && o.y > 420 && o.y < 450 && Math.abs(o.x - px) < 52) { o.done = true;
          if (o.bad) { env.hit(); Sfx.play('bad'); fx.push({ s: 'Angebrannt!', x: px, y: 380, t: 0 }); }
          else { got++; Sfx.play('good'); env.burst(px, 420, 6); fx.push({ s: '+1', x: px, y: 380, t: 0, ok: true }); if (got >= need) fin.set(0.5); } }
      }
      items = items.filter(o => !o.done && o.y < 560); fin.tick(dt);
    },
    draw(c) {
      kitchenBg(c, 470); txtGot(c, got, need);
      drawPersonMini(c, 200, 120);
      for (const o of items) { c.save(); c.translate(o.x, o.y); c.rotate(o.a);
        if (o.k === 'burnt') { ell(c, 0, 0, 20, 12); fs(c, '#343a40', 2.5); for (let k = 0; k < 2; k++) { ell(c, -6 + k * 12, -18 - Math.sin(t * 6 + k) * 4, 5, 5); c.fillStyle = 'rgba(80,80,80,.5)'; c.fill(); } }
        else if (o.k === 'pfannkuchen') { ell(c, 0, 0, 22, 12); fs(c, '#f4c87a', 2.5); ell(c, 0, -2, 12, 6); c.fillStyle = '#e9a94f'; c.fill(); }
        else drawIngr(c, o.k, 0, 0, 0.8);
        c.restore(); }
      // Pfanne
      ell(c, px, 440, 52, 16); fs(c, '#343a40', 3); ell(c, px, 436, 42, 10); c.fillStyle = '#495057'; c.fill(); rrPath(c, px + 48, 432, 50, 10, 5); fs(c, '#8d5a3b', 2.5);
      fxText(c, fx);
    },
    down(x) { tx = clamp(x, 50, 350); }, move(x) { tx = clamp(x, 50, 350); },
  };
} };
function drawPersonMini(c, x, y) {   // Koch mit Mütze, wirft von oben
  ell(c, x, y + 30, 26, 26); fs(c, '#fff', 3); ell(c, x, y - 4, 18, 17); fs(c, '#f1c27d', 2.5);
  ell(c, x - 6, y - 6, 2, 2.5); c.fillStyle = OL; c.fill(); ell(c, x + 6, y - 6, 2, 2.5); c.fill();
  c.beginPath(); c.arc(x, y + 2, 6, 0.2, Math.PI - 0.2); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
  rrPath(c, x - 16, y - 26, 32, 12, 4); fs(c, '#fff', 2.5); ell(c, x - 8, y - 32, 10, 9); fs(c, '#fff', 2.5); ell(c, x + 8, y - 32, 10, 9); fs(c, '#fff', 2.5); ell(c, x, y - 36, 10, 9); fs(c, '#fff', 2.5);
}

// ===== Innenbereich =====
// 3) Teelichter: Auf den Tischen gehen Kerzen aus – tippe sie an, damit sie wieder brennen
GAMES.teelichter = { challenge: true, make(env) {
  const r = env.r, L = L6(env), need = 8 + L * 4, spots = [[80, 200], [200, 200], [320, 200], [80, 350], [200, 350], [320, 350]];
  const lights = spots.map(([x, y]) => ({ x, y, on: true, off: 0 }));
  let next = 1.2, got = 0, t = 0, fx = []; const fin = finisher(env);
  return {
    timeLimit: 32 + L * 4,
    dbg: () => ({ lights }),
    hint: { type: 'tap', x: 200, y: 200 },
    update(dt) {
      t += dt; next -= dt; fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7);
      if (next <= 0 && !fin.on()) { next = (1.6 - L * 0.35) / env.slow; const on = lights.filter(q => q.on); if (on.length && lights.length - on.length < 2 + L) { const q = pick(on, r); q.on = false; q.off = 0; Sfx.note(220, 0.15, 'sine', 0.04); } }
      lights.forEach(q => { if (!q.on) { q.off += dt; if (q.off > 4.5 - L && !fin.on()) { q.off = 0; env.hit(); } } });
      fin.tick(dt);
    },
    draw(c) {
      glassBg(c, 140, t); txtGot(c, got, need);
      lights.forEach((q, i) => {
        ell(c, q.x, q.y + 34, 58, 18); fs(c, '#a0673a', 3); rrPath(c, q.x - 6, q.y + 50, 12, 40, 3); fs(c, '#6b4423', 2);
        if (q.on) { ell(c, q.x, q.y - 8, 26, 30); c.fillStyle = `rgba(255,214,90,${0.25 + 0.1 * Math.sin(t * 7 + i)})`; c.fill(); }
        rrPath(c, q.x - 16, q.y + 8, 32, 18, 5); fs(c, 'rgba(220,240,255,.9)', 2.5); ell(c, q.x, q.y + 10, 12, 4); fs(c, '#fff', 1.5);
        line(c, q.x, q.y + 8, q.x, q.y, 2, OL, false);
        if (q.on) { const fl = Math.sin(t * 12 + i) * 1.5; c.beginPath(); c.moveTo(q.x, q.y - 18 + fl); c.quadraticCurveTo(q.x + 7, q.y - 6, q.x, q.y); c.quadraticCurveTo(q.x - 7, q.y - 6, q.x, q.y - 18 + fl); fs(c, '#ffb703', 2); }
        else { for (let k = 0; k < 3; k++) { ell(c, q.x + Math.sin(t * 2 + k) * 4, q.y - 8 - ((t * 20 + k * 9) % 26), 4, 4); c.fillStyle = 'rgba(120,120,120,.45)'; c.fill(); } ell(c, q.x, q.y - 30, 18, 18); c.lineWidth = 3; c.strokeStyle = `rgba(239,71,111,${0.5 + 0.5 * Math.sin(t * 8)})`; c.stroke(); }
      });
      fxText(c, fx);
    },
    down(x, y) {
      if (fin.on()) return;
      const q = lights.find(q2 => dist(x, y, q2.x, q2.y) < 46); if (!q) return;
      if (!q.on) { q.on = true; got++; Sfx.play('good'); env.burst(q.x, q.y - 10, 6); fx.push({ s: 'Brennt!', x: q.x, y: q.y - 40, t: 0, ok: true }); if (got >= need) fin.set(0.5); }
    },
  };
} };

// 4) Tischnummern: Jeder Gast hat eine Nummer – zieh ihn an den Tisch mit derselben Nummer
GAMES.tischnummer = { make(env) {
  const r = env.r, L = L6(env), nT = 3 + L, rounds = L === 2 ? 2 : 1;
  const tables = [...Array(nT).keys()].map(i => ({ n: i + 1, x: 70 + (i % 3) * 130 + (nT === 4 && i === 3 ? 65 : 0), y: i < 3 ? 160 : 290 }));
  let guests = [], drag = null, round = 0, t = 0, fx = []; const fin = finisher(env);
  const newRound = () => { const nums = shuffle(tables.map(q => q.n), r); guests = nums.map((n, i) => ({ n, x: 70 + i * (260 / Math.max(1, nT - 1)), y: 440, hx: 70 + i * (260 / Math.max(1, nT - 1)), hy: 440, seat: null, col: pick(['#e63946', '#118ab2', '#ffd166', '#06d6a0', '#9b5de5', '#f77f00'], r), skin: pick(['#f1c27d', '#c68642', '#8d5524', '#ffdbac'], r) })); tables.forEach(q => (q.taken = false)); };
  newRound();
  return {
    dbg: () => ({ guests, tables }),
    hint: { type: 'drag', x: 70, y: 440, x2: tables[0].x, y2: tables[0].y },
    update(dt) { t += dt; fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7); guests.forEach(g => { if (g !== drag) { g.x = lerp(g.x, g.hx, Math.min(1, dt * 10)); g.y = lerp(g.y, g.hy, Math.min(1, dt * 10)); } }); fin.tick(dt); },
    draw(c) {
      bgEasy(c); roundDots(c, rounds, round, 26);
      tables.forEach(q => { ell(c, q.x, q.y + 8, 52, 30); fs(c, '#c99a63', 3); ell(c, q.x, q.y + 4, 44, 24); fs(c, '#fff', 0); rrPath(c, q.x - 18, q.y - 36, 36, 28, 8); fs(c, '#35452F', 2.5); txt(c, String(q.n), q.x, q.y - 21, 20, '#fff', 'center', null); });
      guests.forEach(g => { const y = g.y + (g.seat ? 0 : Math.sin(t * 3 + g.n) * 2); ell(c, g.x, y + 22, 18, 22); fs(c, g.col, 2.5); ell(c, g.x, y - 8, 14, 14); fs(c, g.skin, 2.5); ell(c, g.x - 5, y - 9, 1.8, 2.2); c.fillStyle = OL; c.fill(); ell(c, g.x + 5, y - 9, 1.8, 2.2); c.fill(); ell(c, g.x + 14, y + 16, 12, 12); fs(c, '#fff', 2.5); txt(c, String(g.n), g.x + 14, y + 17, 15, BRAND.olive, 'center', null); });
      fxText(c, fx);
    },
    down(x, y) { if (fin.on()) return; drag = guests.find(g => !g.seat && dist(x, y, g.x, g.y + 6) < 34) || null; if (drag) Sfx.play('tap'); },
    move(x, y) { if (drag) { drag.x = x; drag.y = y; } },
    up(x, y) {
      const g = drag; drag = null; if (!g) return;
      const q = tables.find(q2 => dist(x, y, q2.x, q2.y) < 60);
      if (q && q.n === g.n && !q.taken) { q.taken = true; g.seat = q; g.hx = q.x - 40; g.hy = q.y - 4; Sfx.play('good'); env.burst(q.x, q.y, 8); fx.push({ s: 'Danke!', x: q.x, y: q.y - 50, t: 0, ok: true });
        if (guests.every(g2 => g2.seat)) { round++; if (round >= rounds) fin.set(0.6); else setTimeout(newRound, 700); } }
      else if (q) { Sfx.play('bad'); fx.push({ s: 'Das ist Tisch ' + q.n, x: q.x, y: q.y - 50, t: 0 }); }
    },
  };
} };

// ===== Außenbereich =====
// 5) Schmetterlinge: Oben steht die Farbe – tippe nur Schmetterlinge in dieser Farbe an, keine Bienen!
GAMES.schmetterlinge = { challenge: true, make(env) {
  const r = env.r, L = L6(env), need = 6 + L * 3, COLS = [['#ef476f', 'rosa'], ['#ffd166', 'gelb'], ['#118ab2', 'blau'], ['#9b5de5', 'lila']].slice(0, 2 + L);
  let want = pick(COLS, r), bugs = [], spawn = 0.2, got = 0, t = 0, fx = []; const fin = finisher(env);
  return {
    timeLimit: 32 + L * 4,
    dbg: () => ({ bugs, want }),
    hint: { type: 'tap', x: 200, y: 260 },
    update(dt) {
      t += dt; spawn -= dt; fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7);
      if (spawn <= 0 && bugs.length < 5 + L * 2) { spawn = 0.55 / env.slow; const bee = r() < 0.15 + L * 0.07, col = bee ? null : (r() < 0.45 ? want : pick(COLS, r)); const fromL = r() < 0.5; bugs.push({ x: fromL ? -30 : 430, y: 140 + r() * 280, vx: (fromL ? 1 : -1) * (50 + r() * 50 + L * 25) * env.slow, ph: r() * 6, bee, col, a: 1 }); }
      bugs.forEach(b => { b.x += b.vx * dt; b.y += Math.sin(t * 3 + b.ph) * 40 * dt; if (b.dead) b.a -= dt * 3; });
      bugs = bugs.filter(b => b.x > -60 && b.x < 460 && b.a > 0); fin.tick(dt);
    },
    draw(c) {
      terraceBg(c, 200, t);
      c.fillStyle = '#74c69d'; c.fillRect(0, 200, GAME_W, GAME_H - 200);
      for (let k = 0; k < 18; k++) { const x = (k * 71) % 400, y = 230 + (k * 53) % 280; line(c, x, y, x, y - 14, 2, '#2d6a4f', false); ell(c, x, y - 16, 5, 5); c.fillStyle = ['#ef476f', '#fff', '#ffd166', '#c77dff'][k % 4]; c.fill(); }
      rrPath(c, 110, 18, 180, 40, 20); fs(c, '#fff', 3); txt(c, got + ' / ' + need, 250, 39, 17, BRAND.olive, 'center', null); drawFly(c, 150, 38, want[0], t, 0.8);
      bugs.forEach(b => { c.globalAlpha = Math.max(0, b.a); if (b.bee) drawBee(c, b.x, b.y, t); else drawFly(c, b.x, b.y, b.col[0], t + b.ph, 1, b.vx < 0); c.globalAlpha = 1; });
      fxText(c, fx);
    },
    down(x, y) {
      if (fin.on()) return;
      const b = bugs.find(q => !q.dead && dist(x, y, q.x, q.y) < 34); if (!b) return; b.dead = true;
      if (b.bee) { env.hit(); Sfx.play('bad'); fx.push({ s: 'Au, Biene!', x: b.x, y: b.y - 20, t: 0 }); }
      else if (b.col === want) { got++; Sfx.play('good'); env.burst(b.x, b.y, 6); fx.push({ s: '+1', x: b.x, y: b.y - 20, t: 0, ok: true }); if (got >= need) fin.set(0.5); else if (L > 0 && got % 4 === 0) { want = pick(COLS.filter(q => q !== want), r); fx.push({ s: 'Jetzt ' + want[1] + '!', x: 200, y: 90, t: 0, ok: true }); } }
      else { Sfx.play('bad'); fx.push({ s: 'Falsche Farbe', x: b.x, y: b.y - 20, t: 0 }); }
    },
  };
} };
function drawFly(c, x, y, col, t, s = 1, flip) {
  c.save(); c.translate(x, y); c.scale(flip ? -s : s, s); const w = 0.55 + 0.45 * Math.abs(Math.sin(t * 10));
  c.save(); c.scale(w, 1); ell(c, -10, -6, 12, 10); fs(c, col, 2); ell(c, -8, 8, 8, 7); fs(c, col, 2); c.restore();
  c.save(); c.scale(w, 1); ell(c, 10, -6, 12, 10); fs(c, col, 2); ell(c, 8, 8, 8, 7); fs(c, col, 2); c.restore();
  rrPath(c, -2.5, -10, 5, 22, 2.5); fs(c, '#3d2c1f', 1.5); line(c, 0, -10, -4, -17, 1.2, OL, false); line(c, 0, -10, 4, -17, 1.2, OL, false);
  c.restore();
}
function drawBee(c, x, y, t) {
  c.save(); c.translate(x, y); const w = Math.abs(Math.sin(t * 30));
  ell(c, -4, -12, 8, 6 * w + 2); fs(c, 'rgba(255,255,255,.8)', 1.5); ell(c, 6, -12, 8, 6 * w + 2); fs(c, 'rgba(255,255,255,.8)', 1.5);
  ell(c, 0, 0, 15, 10); fs(c, '#ffd60a', 2.5); line(c, -4, -9, -4, 9, 3.5, OL, false); line(c, 4, -9, 4, 9, 3.5, OL, false);
  polyPath(c, [[-15, 0], [-22, -2], [-15, 3]]); fs(c, OL, 0); ell(c, 10, -2, 2, 2); c.fillStyle = OL; c.fill();
  c.restore();
}

// 6) Rasensprenger: Zieh den Wasserstrahl über die braunen Stellen, bis der Rasen wieder grün ist
GAMES.sprenger = { make(env) {
  const r = env.r, L = L6(env), n = 4 + L * 2, sx = 200, sy = 470;
  const spots = []; for (let k = 0; k < n; k++) { let x, y, g = 0; do { x = 50 + r() * 300; y = 110 + r() * 250; g++; } while (g < 60 && spots.some(s => dist(s.x, s.y, x, y) < 80)); spots.push({ x, y, w: 0, r: 26 + r() * 10 }); }
  let ang = -Math.PI / 2, len = 220, t = 0, aiming = false, drops = []; const fin = finisher(env);
  const tip = () => ({ x: sx + Math.cos(ang) * len, y: sy + Math.sin(ang) * len });
  return {
    dbg: () => ({ spots, sx, sy }),
    hint: { type: 'drag', x: 200, y: 300, x2: spots[0].x, y2: spots[0].y },
    update(dt) {
      t += dt; const p = tip();
      if (aiming) { drops.push({ x: sx, y: sy - 20, tx: p.x + (r() - 0.5) * 24, ty: p.y + (r() - 0.5) * 24, t: 0 });
        spots.forEach(s => { if (s.w < 1 && dist(p.x, p.y, s.x, s.y) < s.r + 30) { s.w = Math.min(1, s.w + dt / (0.6 + L * 0.25)); if (s.w >= 1) { Sfx.play('good'); env.burst(s.x, s.y, 8); if (spots.every(q => q.w >= 1)) fin.set(0.6); } } }); }
      drops.forEach(d => (d.t += dt * 2.4)); drops = drops.filter(d => d.t < 1); fin.tick(dt);
    },
    draw(c) {
      c.fillStyle = '#74c69d'; c.fillRect(0, 0, GAME_W, GAME_H);
      for (let k = 0; k < 120; k++) { const x = (k * 67) % 400, y = (k * 113) % 520; line(c, x, y, x + 2, y - 7, 1.5, 'rgba(45,106,79,.35)', false); }
      spots.forEach(s => { ell(c, s.x, s.y, s.r, s.r * 0.7); c.fillStyle = `rgba(${Math.round(176 - s.w * 60)},${Math.round(137 + s.w * 60)},${Math.round(84 + s.w * 50)},${1 - s.w * 0.9})`; c.fill(); if (s.w < 1) { c.lineWidth = 2; c.strokeStyle = 'rgba(120,80,40,.4)'; c.stroke(); } });
      const done = spots.filter(s => s.w >= 1).length; txtGot(c, done, n);
      drops.forEach(d => { const k = d.t, x = lerp(d.x, d.tx, k), y = lerp(d.y, d.ty, k) - Math.sin(k * Math.PI) * 50; ell(c, x, y, 3, 3); c.fillStyle = 'rgba(160,220,255,.9)'; c.fill(); });
      // Sprenger
      ell(c, sx, sy, 30, 12); fs(c, '#495057', 3); c.save(); c.translate(sx, sy - 14); c.rotate(ang + Math.PI / 2); rrPath(c, -6, -30, 12, 30, 5); fs(c, '#ffd166', 2.5); c.restore();
      ell(c, sx, sy - 14, 10, 10); fs(c, '#118ab2', 2.5);
      if (!aiming) { const p = tip(); ell(c, p.x, p.y, 16, 16); c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,.8)'; c.stroke(); }
    },
    down(x, y) { aiming = true; this.move(x, y); },
    move(x, y) { if (!aiming) return; ang = clamp(Math.atan2(y - sy, x - sx), -Math.PI + 0.15, -0.15); len = clamp(dist(x, y, sx, sy), 80, 380); },
    up() { aiming = false; },
  };
} };

// ===== Chalet =====
// 7) Schneemann bauen: Die Schneekugel schwingt hin und her – tippe, damit sie genau oben drauf fällt
GAMES.schneemann = { make(env) {
  const r = env.r, L = L6(env), need = 1 + L, tol = [34, 26, 20][L];
  let made = 0, stack = [], ball = null, t = 0, fx = [], done = []; const fin = finisher(env);
  const sizes = [44, 34, 25], baseY = 470;
  const newBall = () => { ball = { x: 200, y: 110, s: sizes[stack.length], ph: r() * 6, drop: false, vy: 0 }; };
  newBall();
  const topY = () => stack.reduce((y, b) => y - b.s * 1.8, baseY);
  return {
    dbg: () => ({ ball, stack, tol }),
    hint: { type: 'tap', x: 200, y: 260 },
    update(dt) {
      t += dt; fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7);
      if (ball && !ball.drop) ball.x = 200 + Math.sin(t * (1.6 + L * 0.6) + ball.ph) * 140;
      if (ball && ball.drop) { ball.vy += 1200 * dt; ball.y += ball.vy * dt; const land = topY() - ball.s * 0.9;
        if (ball.y >= land) { const below = stack[stack.length - 1], off = below ? Math.abs(ball.x - below.x) : Math.abs(ball.x - 200);
          if (off <= (below ? tol : 60)) { ball.y = land; stack.push({ x: below ? ball.x : ball.x, s: ball.s, y: land }); Sfx.play('good'); env.burst(ball.x, land, 6);
            if (stack.length === 3) { made++; fx.push({ s: 'Fertig!', x: 200, y: 160, t: 0, ok: true }); if (made >= need) { ball = null; fin.set(0.8); } else { const s = stack; setTimeout(() => { done.push(s.map(b => ({ ...b }))); stack = []; newBall(); }, 700); ball = null; } }
            else newBall(); }
          else { Sfx.play('bad'); fx.push({ s: 'Daneben!', x: ball.x, y: land - 30, t: 0 }); newBall(); } } }
      fin.tick(dt);
    },
    draw(c) {
      snowBg(c, t, 180); roundDots(c, need, made, 26);
      done.forEach((s, i) => { c.save(); c.translate(-140 + i * 50, 30); c.scale(0.5, 0.5); c.translate(200, 300); s.forEach(b => drawSnowBall(c, b.x - 200, b.y - 470, b.s)); c.restore(); });
      ell(c, 200, baseY + 4, 70, 12); c.fillStyle = 'rgba(165,200,228,.5)'; c.fill();
      stack.forEach((b, i) => drawSnowBall(c, b.x, b.y, b.s, i === 2));
      if (ball) { if (!ball.drop) line(c, ball.x, 70, ball.x, ball.y - ball.s, 2, 'rgba(0,0,0,.25)', false); drawSnowBall(c, ball.x, ball.y, ball.s, stack.length === 2); }
      fxText(c, fx);
    },
    down() { if (ball && !ball.drop && !fin.on()) { ball.drop = true; Sfx.play('tap'); } },
  };
} };
function drawSnowBall(c, x, y, s, head) {
  ell(c, x, y, s, s * 0.92); fs(c, '#fff', 3); ell(c, x - s * 0.3, y - s * 0.3, s * 0.3, s * 0.2); c.fillStyle = 'rgba(200,225,245,.6)'; c.fill();
  if (head) { ell(c, x - 7, y - 4, 2.5, 2.5); c.fillStyle = OL; c.fill(); ell(c, x + 7, y - 4, 2.5, 2.5); c.fill(); polyPath(c, [[x, y + 1], [x + 16, y + 4], [x, y + 6]]); fs(c, '#f77f00', 1.5); rrPath(c, x - 14, y - s - 12, 28, 14, 3); fs(c, '#212529', 2); rrPath(c, x - 20, y - s, 40, 5, 2); fs(c, '#212529', 2); }
  else if (s < 40) { ell(c, x, y - 6, 3, 3); c.fillStyle = OL; c.fill(); ell(c, x, y + 8, 3, 3); c.fill(); }
}

// 8) Geschenke packen: Zieh jedes Geschenk in den Sack mit der gleichen Schleifenfarbe
GAMES.geschenke = { make(env) {
  const r = env.r, L = L6(env), COLS = ['#e63946', '#118ab2', '#2b9348', '#ffd166'].slice(0, 2 + Math.min(2, L + 1)), need = 6 + L * 3;
  const sacks = COLS.map((col, i) => ({ col, x: 200 + (i - (COLS.length - 1) / 2) * (360 / COLS.length), y: 430, n: 0 }));
  let gifts = [], drag = null, got = 0, t = 0, fx = [], spawn = 0; const fin = finisher(env);
  const add = () => { const free = [80, 200, 320].filter(x => !gifts.some(g => Math.abs(g.hx - x) < 10)); if (!free.length) return; const x = pick(free, r); gifts.push({ col: pick(COLS, r), box: pick(['#fff', '#ffc8dd', '#bde0fe', '#d8f5e3'], r), x, y: -40, hx: x, hy: 200 + (r() - 0.5) * 40, s: 0.85 + r() * 0.3 }); };
  return {
    dbg: () => ({ gifts, sacks }),
    hint: { type: 'drag', x: 200, y: 200, x2: sacks[0].x, y2: 430 },
    update(dt) {
      t += dt; spawn -= dt; if (spawn <= 0 && gifts.length < 3 && got + gifts.length < need) { spawn = 0.3; add(); }
      fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7);
      gifts.forEach(g => { if (g !== drag) { g.x = lerp(g.x, g.hx, Math.min(1, dt * 8)); g.y = lerp(g.y, g.hy, Math.min(1, dt * 6)); } });
      fin.tick(dt);
    },
    draw(c) {
      chaletBg(c, 330, t); txtGot(c, got, need);
      sacks.forEach(s => { c.beginPath(); c.moveTo(s.x - 42, s.y - 20); c.quadraticCurveTo(s.x - 60, s.y + 70, s.x, s.y + 70); c.quadraticCurveTo(s.x + 60, s.y + 70, s.x + 42, s.y - 20); c.closePath(); fs(c, '#a0673a', 3); ell(c, s.x, s.y - 20, 42, 12); fs(c, '#6b4423', 3); rrPath(c, s.x - 40, s.y - 6, 80, 12, 6); fs(c, s.col, 2.5); });
      gifts.forEach(g => drawGift(c, g.x, g.y, g.s, g.box, g.col));
      fxText(c, fx);
    },
    down(x, y) { if (fin.on()) return; drag = gifts.slice().reverse().find(g => Math.abs(x - g.x) < 36 && Math.abs(y - g.y) < 36) || null; if (drag) Sfx.play('tap'); },
    move(x, y) { if (drag) { drag.x = x; drag.y = y; } },
    up(x, y) {
      const g = drag; drag = null; if (!g) return;
      const s = sacks.find(q => Math.abs(x - q.x) < 56 && y > q.y - 70);
      if (s && s.col === g.col) { gifts = gifts.filter(q => q !== g); got++; Sfx.play('good'); env.burst(s.x, s.y - 20, 8); if (got >= need) fin.set(0.5); }
      else if (s) { Sfx.play('bad'); fx.push({ s: 'Andere Farbe!', x: s.x, y: s.y - 60, t: 0 }); }
    },
  };
} };
function drawGift(c, x, y, s, box, rib) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rrPath(c, -28, -22, 56, 46, 5); fs(c, box, 3); rrPath(c, -32, -30, 64, 14, 4); fs(c, box, 3);
  c.fillStyle = rib; c.fillRect(-5, -30, 10, 54); c.fillRect(-28, -6, 56, 8);
  ell(c, -10, -36, 11, 7, -0.4); fs(c, rib, 2.5); ell(c, 10, -36, 11, 7, 0.4); fs(c, rib, 2.5); ell(c, 0, -33, 5, 5); fs(c, rib, 2);
  c.restore();
}

// ===== Parkplatz =====
// 9) Parkschein: Wirf genau den Betrag in den Automaten, der angezeigt wird
GAMES.parkschein = { make(env) {
  const r = env.r, L = L6(env), rounds = 2 + (L === 2 ? 1 : 0);
  const COINS = L === 0 ? [100, 200] : L === 1 ? [50, 100, 200] : [10, 20, 50, 100, 200];
  let price = 0, paid = 0, round = 0, t = 0, fx = [], ticket = 0, flying = []; const fin = finisher(env);
  const newPrice = () => { const step = L === 0 ? 100 : L === 1 ? 50 : 10; price = step * (1 + Math.floor(r() * (L === 0 ? 4 : L === 1 ? 7 : 30))); if (price < 100) price += 100; paid = 0; };
  newPrice();
  const eur = v => (v / 100).toFixed(2).replace('.', ',') + ' €';
  const cpos = i => ({ x: 200 + (i - (COINS.length - 1) / 2) * 72, y: 440 });
  return {
    dbg: () => ({ price, paid, ticket, coins: COINS.map((v, i) => ({ v, ...cpos(i) })) }),
    hint: { type: 'tap', x: cpos(COINS.length - 1).x, y: 440 },
    update(dt) { t += dt; ticket = Math.max(0, ticket - dt); fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.9); flying.forEach(f => (f.t += dt * 3)); flying = flying.filter(f => f.t < 1); fin.tick(dt); },
    draw(c) {
      asphaltBg(c, t);
      // Automat
      rrPath(c, 110, 50, 180, 300, 16); fs(c, '#1c7ed6', 3.5); rrPath(c, 126, 70, 148, 70, 8); fs(c, '#0b3d2e', 3);
      txt(c, eur(price), 200, 96, 26, '#80ed99', 'center', null); txt(c, 'bezahlt: ' + eur(paid), 200, 126, 13, '#b7e4c7', 'center', null);
      txt(c, 'P', 150, 180, 40, '#fff', 'center', null); rrPath(c, 230, 160, 40, 8, 4); fs(c, '#212529', 2); rrPath(c, 140, 300, 120, 14, 6); fs(c, '#212529', 2);
      if (ticket > 0) { rrPath(c, 150, 304 + (1 - ticket) * 30, 100, 40, 4); fs(c, '#fff', 2.5); txt(c, 'Parkschein', 200, 320 + (1 - ticket) * 30, 11, BRAND.olive, 'center', null); }
      roundDots(c, rounds, round, 26);
      flying.forEach(f => drawCoin(c, lerp(f.x, 250, f.t), lerp(f.y, 164, f.t) - Math.sin(f.t * Math.PI) * 60, f.v, 1 - f.t * 0.4));
      COINS.forEach((v, i) => { const p = cpos(i); drawCoin(c, p.x, p.y, v, 1); });
      fxText(c, fx);
    },
    down(x, y) {
      if (fin.on() || ticket > 0) return;
      const i = COINS.findIndex((v, k) => dist(x, y, cpos(k).x, cpos(k).y) < 32); if (i < 0) return;
      const v = COINS[i], p = cpos(i); paid += v; flying.push({ x: p.x, y: p.y, v, t: 0 }); Sfx.play('coin');
      if (paid === price) { round++; ticket = 1; Sfx.play('good'); env.burst(200, 320, 10); fx.push({ s: 'Passt genau!', x: 200, y: 260, t: 0, ok: true }); if (round >= rounds) fin.set(1); else setTimeout(newPrice, 900); }
      else if (paid > price) { Sfx.play('bad'); fx.push({ s: 'Zu viel – nochmal!', x: 200, y: 260, t: 0 }); setTimeout(() => { paid = 0; }, 500); }
    },
  };
} };
function drawCoin(c, x, y, v, s = 1) {
  const big = v >= 100, R = (big ? 28 : 22) * s;
  ell(c, x, y, R, R); fs(c, v === 200 ? '#c9a227' : v === 100 ? '#adb5bd' : '#e9a94f', 3); ell(c, x, y, R * 0.72, R * 0.72); fs(c, v === 200 ? '#adb5bd' : v === 100 ? '#c9a227' : '#f4c87a', 1.5);
  txt(c, v >= 100 ? (v / 100) + '€' : v + 'ct', x, y + 1, 13 * s, OL, 'center', null);
}

// 10) Auto waschen: Wisch mit dem Schwamm über die Dreckflecken, bis das Auto glänzt
GAMES.autowasch = { make(env) {
  const r = env.r, L = L6(env), n = 6 + L * 3;
  const spots = []; for (let k = 0; k < n; k++) spots.push({ x: 110 + r() * 180, y: 140 + r() * 260, r: 14 + r() * 10, d: 1 });
  let sp = { x: 330, y: 470 }, down = false, t = 0, bubbles = [], bird = L === 2 ? 4 : 99; const fin = finisher(env);
  return {
    dbg: () => ({ spots }),
    hint: { type: 'drag', x: spots[0].x, y: spots[0].y, x2: spots[0].x + 40, y2: spots[0].y + 20 },
    update(dt) {
      t += dt; bird -= dt;
      if (bird <= 0 && !fin.on()) { bird = 99; spots.push({ x: 120 + r() * 160, y: 150 + r() * 240, r: 12, d: 1 }); Sfx.note(900, 0.08, 'sine', 0.03); }
      bubbles.forEach(b => (b.t += dt)); bubbles = bubbles.filter(b => b.t < 0.8);
      if (down) spots.forEach(s => { if (s.d > 0 && dist(sp.x, sp.y, s.x, s.y) < s.r + 26) { s.d = Math.max(0, s.d - dt * (2.2 - L * 0.5)); if (s.d === 0) { Sfx.play('good'); env.burst(s.x, s.y, 5); if (spots.every(q => q.d === 0)) fin.set(0.6); } } });
      fin.tick(dt);
    },
    draw(c) {
      asphaltBg(c, t); c.fillStyle = 'rgba(160,210,240,.25)'; c.fillRect(0, 0, GAME_W, GAME_H);
      drawCar(c, 200, 270, 0, '#ef476f', 2.2);
      spots.forEach(s => { if (s.d <= 0) return; ell(c, s.x, s.y, s.r, s.r * 0.8); c.fillStyle = `rgba(110,80,50,${0.85 * s.d})`; c.fill(); ell(c, s.x + s.r * 0.6, s.y + s.r * 0.4, s.r * 0.4, s.r * 0.3); c.fill(); });
      bubbles.forEach(b => { ell(c, b.x, b.y - b.t * 30, 6 + b.t * 6, 6 + b.t * 6); c.lineWidth = 1.5; c.strokeStyle = `rgba(255,255,255,${1 - b.t})`; c.stroke(); });
      const left = spots.filter(s => s.d > 0).length; txtGot(c, spots.length - left, spots.length);
      rrPath(c, sp.x - 30, sp.y - 20, 60, 40, 12); fs(c, '#ffd60a', 3); for (let k = 0; k < 5; k++) { ell(c, sp.x - 20 + k * 10, sp.y - 6 + (k % 2) * 10, 3, 3); c.fillStyle = 'rgba(200,150,0,.5)'; c.fill(); }
    },
    down(x, y) { down = true; sp = { x, y }; },
    move(x, y) { if (!down) return; if (dist(x, y, sp.x, sp.y) > 4 && Math.random() < 0.5) bubbles.push({ x, y, t: 0 }); sp = { x, y }; },
    up() { down = false; },
  };
} };

Object.assign(HELP_TEXT, {
  rezept: 'Schau dir das Rezept oben an. Tippe dann die Zutaten in der richtigen Reihenfolge an – sie fallen in den Topf.',
  auffangen: 'Der Koch wirft Essen hoch. Schieb die Pfanne mit dem Finger hin und her und fang es auf. Nichts Angebranntes fangen!',
  teelichter: 'Auf den Tischen gehen Kerzen aus. Tippe eine Kerze an, dann brennt sie wieder.',
  tischnummer: 'Jeder Gast hat eine Nummer. Zieh ihn an den Tisch mit derselben Nummer.',
  schmetterlinge: 'Oben siehst du eine Farbe. Tippe nur die Schmetterlinge in dieser Farbe an – und lass die Bienen in Ruhe!',
  sprenger: 'Zieh mit dem Finger, dann spritzt der Rasensprenger dorthin. Mach alle braunen Stellen wieder grün.',
  schneemann: 'Die Schneekugel schwingt hin und her. Tippe, damit sie fällt – genau oben auf die andere Kugel!',
  geschenke: 'Zieh jedes Geschenk in den Sack, der die gleiche Farbe hat wie die Schleife.',
  parkschein: 'Oben steht, was das Parken kostet. Tippe die Münzen an, bis es genau passt. Zu viel? Dann fängst du neu an.',
  autowasch: 'Wisch mit dem gelben Schwamm über die Dreckflecken, bis das Auto wieder sauber ist.',
});
