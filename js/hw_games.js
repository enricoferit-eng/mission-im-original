'use strict';
// Halloween-Special: neue Aufgaben (Kürbis schnitzen, Zaubertrank, Gespenster fangen, Süßes sortieren,
// Fledermaus-Flug, Spinnennetz, Besenflug, Süßes oder Saures, Kürbisse zählen) – sie ersetzen im Special die Aufgaben der Bereiche
const HL = env => (env.diff === 'easy' ? 0 : env.diff === 'medium' ? 1 : 2);
const hwFx = (c, list) => list.forEach(f => { c.globalAlpha = Math.max(0, 1 - f.t / 0.7); txt(c, f.s, f.x, f.y - f.t * 30, 18, f.ok ? '#80ed99' : '#ff8fa3', 'center', '#2b1a2f'); c.globalAlpha = 1; });
function hwNight(c, top = '#2b1a4a', bot = '#5b2f62') {
  const g = c.createLinearGradient(0, 0, 0, GAME_H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, GAME_W, GAME_H);
  c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 24; i++) c.fillRect((i * 97) % GAME_W, (i * 59) % 300, 2, 2);
}
function hwLabel(c, s, y = 30) { rrPath(c, 60, y - 18, 280, 36, 18); fs(c, 'rgba(255,247,230,.92)', 2.5); txt(c, s, 200, y, 15, '#3d2c1f', 'center', null); }
function hwGrave(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.3)'; ell(c, 0, 4, 34, 8); c.fill(); c.beginPath(); c.moveTo(-26, 2); c.lineTo(-26, -34); c.quadraticCurveTo(-26, -58, 0, -58); c.quadraticCurveTo(26, -58, 26, -34); c.lineTo(26, 2); c.closePath(); fs(c, '#8e8a9b', 3); line(c, -10, -36, 10, -36, 3, '#5c586b', false); line(c, -10, -26, 10, -26, 3, '#5c586b', false); c.restore(); }
function hwGhost(c, x, y, s = 1, a = 1) { c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); drawItem(c, 'hw_gespenst', 0, 0, 56); c.restore(); }

// Gesichter für den Kürbis: Augen, Nase, Mund
const HW_EYES = ['tri', 'rund', 'stern', 'mond'], HW_NOSE = ['tri', 'herz', 'eckig'], HW_MOUTH = ['zack', 'laecheln', 'oh', 'zahn'];
function hwPart(c, kind, sh, x, y, s, col = '#ffd60a') {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.strokeStyle = '#3d2c1f'; c.lineWidth = 1.5;
  const eye = dx => { c.save(); c.translate(dx, 0);
    if (sh === 'tri') polyPath(c, [[-8, 6], [8, 6], [0, -8]]); else if (sh === 'rund') ell(c, 0, 0, 7, 7); else if (sh === 'stern') starPath(c, 0, 0, 9, 4); else { c.beginPath(); c.arc(0, 0, 8, 0.6, Math.PI * 2 - 0.6); c.arc(4, 0, 6, Math.PI * 2 - 0.9, 0.9, true); c.closePath(); }
    c.fill(); c.stroke(); c.restore(); };
  if (kind === 'eyes') { eye(-16); eye(16); }
  else if (kind === 'nose') { if (sh === 'tri') polyPath(c, [[-5, 5], [5, 5], [0, -5]]); else if (sh === 'herz') { c.beginPath(); c.moveTo(0, 6); c.bezierCurveTo(-10, -2, -4, -9, 0, -3); c.bezierCurveTo(4, -9, 10, -2, 0, 6); } else rrPath(c, -5, -5, 10, 10, 1); c.fill(); c.stroke(); }
  else {
    if (sh === 'zack') polyPath(c, [[-20, -4], [-13, 4], [-6, -4], [0, 4], [6, -4], [13, 4], [20, -4], [14, 8], [-14, 8]]);
    else if (sh === 'laecheln') { c.beginPath(); c.moveTo(-20, -4); c.quadraticCurveTo(0, 18, 20, -4); c.quadraticCurveTo(0, 6, -20, -4); }
    else if (sh === 'oh') ell(c, 0, 2, 8, 9);
    else { c.beginPath(); c.moveTo(-18, -2); c.quadraticCurveTo(0, 14, 18, -2); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#fff'; polyPath(c, [[-8, -1], [-3, -1], [-5.5, 6]]); c.fill(); polyPath(c, [[3, -1], [8, -1], [5.5, 6]]); }
    c.fill(); c.stroke();
  }
  c.restore();
}
function hwPumpkin(c, x, y, s, face, glow = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (glow) { ell(c, 0, 0, 80, 70); c.fillStyle = `rgba(255,190,60,${0.25 * glow})`; c.fill(); }
  for (const [dx, rw] of [[-30, 36], [30, 36], [-14, 34], [14, 34], [0, 40]]) { ell(c, dx, 0, rw, 50); fs(c, '#f77f00', 3); }
  rrPath(c, -7, -62, 14, 18, 4); fs(c, '#6b4423', 2.5); ell(c, 20, -54, 16, 6, -0.4); fs(c, '#2b9348', 2.5);
  if (face.eyes) hwPart(c, 'eyes', face.eyes, 0, -14, 1.2); if (face.nose) hwPart(c, 'nose', face.nose, 0, 4, 1.2); if (face.mouth) hwPart(c, 'mouth', face.mouth, 0, 24, 1.2);
  c.restore();
}

// 1) Kürbis schnitzen: Mach den Kürbis genau so wie auf dem Bild
GAMES.hw_schnitzen = { make(env) {
  const r = env.r, L = HL(env), parts = L === 0 ? ['eyes', 'mouth'] : ['eyes', 'nose', 'mouth'], nOpt = L === 2 ? 4 : 3, rounds = L === 2 ? 2 : 1;
  const LIST = { eyes: HW_EYES, nose: HW_NOSE, mouth: HW_MOUTH };
  let round = 0, goal, opts, face, shake = 0, t = 0, fx = []; const fin = finisher(env);
  const newRound = () => { goal = {}; opts = {}; face = {}; for (const p of parts) { const l = LIST[p], o = shuffle(l, r).slice(0, Math.min(nOpt, l.length)); goal[p] = pick(o, r); opts[p] = o; } };
  newRound();
  const rowY = i => 330 + i * 64, optX = (i, n) => 200 + (i - (n - 1) / 2) * 86;
  return {
    hint: { type: 'tap', x: optX(0, opts[parts[0]].length), y: rowY(0) },
    update(dt) { t += dt; shake = Math.max(0, shake - dt); fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7); fin.tick(dt); },
    draw(c) {
      hwNight(c);
      rrPath(c, 14, 50, 120, 120, 16); fs(c, 'rgba(255,247,230,.95)', 3); txt(c, 'So soll er aussehen', 74, 64, 10, '#6b5a48', 'center', null); hwPumpkin(c, 74, 118, 0.62, goal);
      c.save(); c.translate(Math.sin(shake * 50) * shake * 14, 0); hwPumpkin(c, 262, 160, 1.05, face, parts.every(p => face[p] === goal[p]) ? 1 : 0.4); c.restore();
      if (rounds > 1) roundDots(c, rounds, round, 30);
      parts.forEach((p, i) => { rrPath(c, 14, rowY(i) - 30, 372, 60, 16); fs(c, 'rgba(255,247,230,.16)', 2, 'rgba(255,255,255,.4)');
        opts[p].forEach((sh, j) => { const x = optX(j, opts[p].length), y = rowY(i), on = face[p] === sh; rrPath(c, x - 38, y - 25, 76, 50, 12); fs(c, on ? '#ffd166' : '#f77f00', 2.5); hwPart(c, p, sh, x, y + (p === 'mouth' ? -2 : 0), p === 'eyes' ? 0.8 : 1, '#3d2c1f'); }); });
      hwFx(c, fx);
    },
    down(x, y) {
      if (fin.on()) return;
      parts.forEach((p, i) => opts[p].forEach((sh, j) => {
        if (Math.abs(x - optX(j, opts[p].length)) > 40 || Math.abs(y - rowY(i)) > 28) return;
        if (sh === goal[p]) { face[p] = sh; Sfx.play('good'); env.burst(262, 160, 8); fx.push({ s: 'Genau!', x: 262, y: 70, t: 0, ok: true });
          if (parts.every(q => face[q] === goal[q])) { round++; if (round >= rounds) fin.set(0.7); else setTimeout(newRound, 700); } }
        else { Sfx.play('bad'); shake = 0.35; fx.push({ s: 'Schau nochmal aufs Bild!', x: 262, y: 70, t: 0, ok: false }); }
      }));
    },
  };
} };

// 2) Zaubertrank: Rezept merken und die Zutaten der Reihe nach in den Kessel tippen
GAMES.hw_trank = { make(env) {
  const r = env.r, L = HL(env), n = 3 + L, rounds = L === 0 ? 1 : 2, ING = ['hw_kastanie', 'hw_spinne', 'hw_blatt', 'hw_eichel', 'hw_wurm', 'hw_fledermaus'], shelf = shuffle(ING, r);
  const COLS = ['#70e000', '#c77dff', '#ff8fab', '#4cc9f0', '#ffd60a'];
  let round = 0, seq = [], pos = 0, show = 0, t = 0, shake = 0, fx = [], drops = [], col = '#70e000'; const fin = finisher(env);
  const newRound = () => { seq = []; for (let k = 0; k < n; k++) seq.push(pick(ING.filter(q => q !== seq[k - 1]), r)); pos = 0; show = L === 0 ? 999 : 3.2 + n * 0.5; col = '#70e000'; };
  newRound();
  const slot = i => ({ x: 70 + (i % 3) * 130, y: i < 3 ? 400 : 470 });
  return {
    hint: { type: 'tap', x: slot(shelf.indexOf(seq[0])).x, y: slot(shelf.indexOf(seq[0])).y },
    update(dt) { t += dt; show -= dt; shake = Math.max(0, shake - dt); fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7); drops.forEach(d => (d.t += dt)); drops = drops.filter(d => d.t < 0.5); fin.tick(dt); },
    draw(c) {
      hwNight(c, '#1f1430', '#3c2a4f');
      c.save(); c.translate(200 + Math.sin(shake * 40) * shake * 20, 0);
      for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-30 + k * 30, 330); c.quadraticCurveTo(-20 + k * 30 + Math.sin(t * 8 + k) * 6, 310, -30 + k * 30, 296); c.lineWidth = 8; c.strokeStyle = ['#ff9f1c', '#ffd60a', '#ff6b35'][k]; c.stroke(); }
      ell(c, 0, 268, 72, 54); fs(c, '#343a40', 3.5); ell(c, 0, 226, 66, 14); fs(c, col, 3);
      for (let k = 0; k < 5; k++) { const by = 226 - ((t * 26 + k * 11) % 40), bx = -46 + k * 23; ell(c, bx, by, 6, 6); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); }
      c.restore();
      drops.forEach(d => drawItem(c, d.k, lerp(d.x, 200, d.t / 0.5), lerp(d.y, 226, d.t / 0.5), 44 * (1 - d.t)));
      rrPath(c, 30, 54, 340, 110, 14); fs(c, '#f1e3c8', 3); txt(c, 'Zaubertrank-Rezept', 200, 70, 12, '#6b4423', 'center', null);
      seq.forEach((k, i) => { const x = 200 + (i - (n - 1) / 2) * 60, y = 118; ell(c, x, y, 25, 25); fs(c, i < pos ? '#d8f5e3' : '#fff', 2.5); if (show > 0 || i < pos) drawItem(c, k, x, y, 38); else icon(c, 'question', x, y, 26); });
      if (show <= 0) txt(c, 'Weißt du es noch?', 200, 150, 12, '#6b5a48', 'center', null);
      if (rounds > 1) roundDots(c, rounds, round, 30);
      rrPath(c, 10, 362, 380, 150, 12); fs(c, 'rgba(255,247,230,.9)', 3);
      shelf.forEach((k, i) => { const p = slot(i); ell(c, p.x, p.y, 30, 30); fs(c, '#fff', 2.5); drawItem(c, k, p.x, p.y, 44); });
      hwFx(c, fx);
    },
    down(x, y) {
      if (fin.on() || (L > 0 && show > 0 && show < 900)) return;
      const i = shelf.findIndex((k, j) => dist(x, y, slot(j).x, slot(j).y) < 34); if (i < 0) return;
      const k = shelf[i], p = slot(i);
      if (k === seq[pos]) { pos++; drops.push({ k, x: p.x, y: p.y, t: 0 }); col = COLS[pos % COLS.length]; Sfx.play('good'); env.burst(200, 230, 8); fx.push({ s: 'Blubb!', x: 200, y: 200, t: 0, ok: true });
        if (pos >= n) { round++; if (round >= rounds) fin.set(0.6); else setTimeout(newRound, 700); } }
      else { Sfx.play('bad'); shake = 0.4; fx.push({ s: 'Erst die ' + (pos + 1) + '. Zutat!', x: 200, y: 200, t: 0, ok: false }); if (L > 0) show = Math.max(show, 1.2); }
    },
  };
} };

// 3) Gespenster fangen: Gespenster gucken aus den Grabsteinen – schnell antippen! Fledermäuse nicht antippen.
GAMES.hw_geister = { challenge: true, make(env) {
  const r = env.r, L = HL(env), need = [6, 10, 14][L], up = [1.6, 1.2, 0.9][L] / env.slow;
  const holes = []; for (let i = 0; i < 6; i++) holes.push({ x: 80 + (i % 3) * 120, y: 250 + Math.floor(i / 3) * 150, a: 0, kind: null, t: 0 });
  let got = 0, spT = 0.6, t = 0, fx = []; const fin = finisher(env);
  return {
    timeLimit: need * 2.2 + 6,
    hint: { type: 'tap', x: 200, y: 220 },
    update(dt) {
      t += dt; spT -= dt; fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7);
      if (spT <= 0 && !fin.on()) { spT = (L === 2 ? 0.5 : 0.75) / env.slow; const free = holes.filter(h => !h.kind); if (free.length) { const h = pick(free, r); h.kind = r() < [0.12, 0.22, 0.3][L] ? 'bat' : 'ghost'; h.t = up; h.a = 0; } }
      for (const h of holes) if (h.kind) { h.t -= dt; h.a = Math.min(1, h.a + dt * 6); if (h.t <= 0) { h.kind = null; } }
      fin.tick(dt);
    },
    draw(c) {
      hwNight(c, '#1d2b3a', '#2f3e46'); c.fillStyle = '#2f4f3a'; c.fillRect(0, 200, GAME_W, GAME_H - 200);
      ell(c, 330, 80, 30, 30); c.fillStyle = '#fff3bf'; c.fill();
      hwLabel(c, 'Fang die Gespenster! ' + got + ' / ' + need);
      for (const h of holes) {
        if (h.kind === 'ghost') hwGhost(c, h.x, h.y - 50 - h.a * 30 + Math.sin(t * 6) * 3, 1.15, h.a);
        else if (h.kind === 'bat') { c.save(); c.globalAlpha = h.a; drawItem(c, 'hw_fledermaus', h.x, h.y - 60 - h.a * 24 + Math.sin(t * 14) * 4, 58); c.restore(); }
        hwGrave(c, h.x, h.y);
      }
      hwFx(c, fx);
    },
    down(x, y) {
      if (fin.on()) return;
      for (const h of holes) {
        if (!h.kind || Math.abs(x - h.x) > 46 || y < h.y - 130 || y > h.y + 10) continue;
        if (h.kind === 'ghost') { got++; Sfx.play('good'); env.burst(h.x, h.y - 70, 12); fx.push({ s: 'Buh!', x: h.x, y: h.y - 110, t: 0, ok: true }); if (got >= need) fin.set(0.4); }
        else { env.hit(); fx.push({ s: 'Das ist eine Fledermaus!', x: 200, y: 120, t: 0, ok: false }); if (!env.hard) got = Math.max(0, got - 1); }
        h.kind = null; return;
      }
    },
  };
} };

// 4) Süßes sortieren: Zieh jede Süßigkeit in die passende Schale
GAMES.hw_suesses = { make(env) {
  const r = env.r, L = HL(env), kinds = shuffle(['hw_bonbon', 'hw_lolli', 'hw_gummibaer', 'hw_schoko'], r).slice(0, L === 0 ? 2 : 3), n = [6, 9, 12][L];
  const bowls = kinds.map((k, i) => ({ k, x: 200 + (i - (kinds.length - 1) / 2) * 130, y: 440, got: 0 }));
  const sweets = []; for (let i = 0; i < n; i++) sweets.push({ k: kinds[i % kinds.length], x: 60 + r() * 280, y: 110 + r() * 180, done: false, rot: (r() - 0.5) * 0.8 });
  let drag = null, t = 0, fx = []; const fin = finisher(env);
  return {
    hint: { type: 'drag', x: sweets[0].x, y: sweets[0].y, x2: bowls[kinds.indexOf(sweets[0].k)].x, y2: 440 },
    update(dt) { t += dt; fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7); fin.tick(dt); },
    draw(c) {
      hwNight(c, '#3c1f4a', '#6b3a5a'); rrPath(c, 10, 90, 380, 230, 18); fs(c, '#7f4f24', 3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let y = 110; y < 310; y += 30) c.fillRect(20, y, 360, 3);
      hwLabel(c, 'Sortiere die Süßigkeiten!');
      for (const b of bowls) { ell(c, b.x, b.y + 10, 58, 22); fs(c, '#f77f00', 3); ell(c, b.x, b.y, 54, 16); fs(c, '#3d2c1f', 2); drawItem(c, b.k, b.x, b.y + 48, 30); for (let k = 0; k < Math.min(b.got, 5); k++) drawItem(c, b.k, b.x - 24 + k * 12, b.y - 4, 26); }
      for (const s of sweets) if (!s.done && s !== drag) { c.save(); c.translate(s.x, s.y); c.rotate(s.rot); drawItem(c, s.k, 0, 0, 50); c.restore(); }
      if (drag) drawItem(c, drag.k, drag.x, drag.y, 60);
      hwFx(c, fx);
    },
    down(x, y) { if (fin.on()) return; let best = null, bd = 50; for (const s of sweets) if (!s.done) { const d = dist(x, y, s.x, s.y); if (d < bd) { bd = d; best = s; } } if (best) { drag = best; drag.ox = best.x; drag.oy = best.y; } },
    move(x, y) { if (drag) { drag.x = x; drag.y = y; } },
    up() {
      if (!drag) return; const s = drag; drag = null;
      const b = bowls.find(q => Math.abs(s.x - q.x) < 64 && Math.abs(s.y - q.y) < 60);
      if (b && b.k === s.k) { s.done = true; b.got++; Sfx.play('good'); env.burst(b.x, b.y, 8); if (sweets.every(q => q.done)) fin.set(0.5); }
      else { if (b) { Sfx.play('bad'); fx.push({ s: 'Andere Schale!', x: s.x, y: s.y - 30, t: 0, ok: false }); } s.x = s.ox; s.y = s.oy; }
    },
  };
} };

// 5) Fledermaus-Flug: Tippen = flattern. Flieg durch die Lücken zwischen den Bäumen.
GAMES.hw_flug = { challenge: true, make(env) {
  const r = env.r, L = HL(env), need = [6, 9, 12][L], gap = [210, 175, 150][L], v = [120, 145, 170][L] * env.slow, gr = 520, flap = -250;
  let by = 240, vy = 0, t = 0, inv = 0, passed = 0, started = false; const trees = []; let nx = 420; const fin = finisher(env);
  const add = () => { trees.push({ x: nx, gy: 140 + r() * (300 - gap * 0.5), done: false }); nx += 210; };
  for (let i = 0; i < 3; i++) add();
  return {
    timeLimit: need * 2.2 + 8,
    hint: { type: 'tap', x: 200, y: 300 },
    update(dt) {
      t += dt; inv -= dt; if (!started) { by = 240 + Math.sin(t * 3) * 8; fin.tick(dt); return; }
      vy = Math.min(360, vy + gr * dt); by += vy * dt;
      if (by < 40) { by = 40; vy = 0; } if (by > 470) { by = 470; vy = flap * 0.6; if (inv <= 0) { env.hit(); inv = 1; } }
      for (const tr of trees) { tr.x -= v * dt;
        if (!tr.done && tr.x < 120) { tr.done = true; passed++; Sfx.play('good'); env.burst(120, by, 6); if (passed >= need) fin.set(0.4); }
        if (inv <= 0 && Math.abs(tr.x - 120) < 34 && (by < tr.gy - gap / 2 + 14 || by > tr.gy + gap / 2 - 14)) { env.hit(); inv = 1; vy = by < tr.gy ? 120 : -200; }
      }
      while (trees.length && trees[0].x < -60) trees.shift(); if (nx - 210 < 600) { nx = trees[trees.length - 1].x + 210; add(); }
      fin.tick(dt);
    },
    draw(c) {
      hwNight(c, '#1b1f3b', '#46325e'); ell(c, 320, 90, 34, 34); c.fillStyle = '#fff3bf'; c.fill();
      for (const tr of trees) { const top = tr.gy - gap / 2, bot = tr.gy + gap / 2;
        rrPath(c, tr.x - 26, -10, 52, top + 10, 8); fs(c, '#3b2a20', 3); rrPath(c, tr.x - 26, bot, 52, GAME_H - bot + 10, 8); fs(c, '#3b2a20', 3);
        drawItem(c, 'hw_spinne', tr.x, top + 10, 30); jackO(c, tr.x, bot - 4, 1.1, 0.8); }
      c.fillStyle = '#1a1225'; c.fillRect(0, 495, GAME_W, 30);
      hwLabel(c, started ? passed + ' / ' + need : 'Tippe zum Flattern!', 474);
      if (!(inv > 0 && Math.floor(t * 12) % 2)) { c.save(); c.translate(120, by); c.rotate(clamp(vy / 600, -0.5, 0.6)); drawItem(c, 'hw_fledermaus', 0, Math.sin(t * 20) * 2, 64); c.restore(); }
    },
    down() { if (fin.on()) return; started = true; vy = flap; Sfx.note && Sfx.note(660, 0.06, 'triangle', 0.04); },
  };
} };

// 6) Spinnennetz: Tippe die Punkte der Reihe nach an (1, 2, 3 …), dann ist das Netz fertig
GAMES.hw_netz = { make(env) {
  const r = env.r, L = HL(env), n = [5, 7, 9][L], pts = [];
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / n + (r() - 0.5) * 0.3, rad = 120 + r() * 40; pts.push({ x: 200 + Math.cos(a) * rad, y: 300 + Math.sin(a) * rad * 0.95 }); }
  const order = L === 2 ? shuffle(pts.map((_, i) => i), r) : pts.map((_, i) => i);
  let pos = 0, t = 0, fx = [], spin = 0; const fin = finisher(env);
  return {
    hint: { type: 'tap', x: pts[order[0]].x, y: pts[order[0]].y },
    update(dt) { t += dt; spin = Math.max(0, spin - dt); fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7); fin.tick(dt); },
    draw(c) {
      hwNight(c, '#241a35', '#463059'); hwLabel(c, 'Spinne das Netz: tippe 1, 2, 3 …');
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2.5;
      for (let i = 1; i < pos; i++) { const a = pts[order[i - 1]], b = pts[order[i]]; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
      for (let i = 0; i < pos; i++) { const a = pts[order[i]]; c.beginPath(); c.moveTo(200, 300); c.lineTo(a.x, a.y); c.lineWidth = 1.2; c.stroke(); c.lineWidth = 2.5; }
      if (pos >= n) { const a = pts[order[n - 1]], b = pts[order[0]]; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
      const sp = pos > 0 ? pts[order[pos - 1]] : { x: 200, y: 300 }; line(c, sp.x, 60, sp.x, sp.y - 16, 1.2, 'rgba(255,255,255,.6)', false); drawItem(c, 'hw_spinne', sp.x, sp.y + Math.sin(t * 4) * 2, 46);
      pts.forEach((p, i) => { const k = order.indexOf(i), done = k < pos; ell(c, p.x, p.y, 20, 20); fs(c, done ? '#80ed99' : '#fff7e6', 2.5); txt(c, String(k + 1), p.x, p.y + 1, 16, '#3d2c1f', 'center', null); });
      hwFx(c, fx);
    },
    down(x, y) {
      if (fin.on()) return; const i = pts.findIndex(p => dist(x, y, p.x, p.y) < 30); if (i < 0) return;
      if (i === order[pos]) { pos++; Sfx.play('good'); env.burst(pts[i].x, pts[i].y, 6); if (pos >= n) fin.set(0.7); }
      else if (order.indexOf(i) >= pos) { Sfx.play('bad'); fx.push({ s: 'Erst die ' + (pos + 1) + '!', x: 200, y: 90, t: 0, ok: false }); }
    },
  };
} };

// 7) Besenflug: Schieb die Hexe hin und her, sammle Sterne und weich den Gewitterwolken aus
GAMES.hw_besen = { challenge: true, make(env) {
  const r = env.r, L = HL(env), need = [8, 11, 14][L], v = [200, 240, 290][L] * env.slow;
  let got = 0, px = 200, tx = 200, spT = 0.4, inv = 0, t = 0; const its = []; const fin = finisher(env);
  return {
    timeLimit: need * 2.1 + 6,
    hint: { type: 'swipe', x: 200, y: 440 },
    update(dt) {
      t += dt; inv -= dt; spT -= dt;
      if (spT <= 0) { spT = [0.7, 0.55, 0.45][L] / env.slow; const good = r() < 0.55; its.push({ x: 50 + r() * 300, y: -40, good, ph: r() * 6 }); }
      px = lerp(px, tx, Math.min(1, dt * 14));
      for (const o of its) { o.y += v * dt; o.ph += dt * 2;
        if (!o.done && dist(o.x, o.y, px, 430) < 42) { o.done = true;
          if (o.good) { got++; Sfx.play('good'); env.burst(px, 420, 10); if (got >= need) fin.set(0.4); }
          else if (inv <= 0) { env.hit(); inv = 0.9; if (!env.hard) got = Math.max(0, got - 1); } } }
      for (let i = its.length - 1; i >= 0; i--) if (its[i].done || its[i].y > 580) its.splice(i, 1);
      fin.tick(dt);
    },
    draw(c) {
      hwNight(c, '#14213d', '#3c2a63'); for (let i = 0; i < 5; i++) { const y = ((t * 40 + i * 120) % 600) - 40; c.fillStyle = 'rgba(255,255,255,.12)'; ell(c, (i * 97) % 400, y, 50, 14); c.fill(); }
      hwLabel(c, 'Sterne: ' + got + ' / ' + need);
      for (const o of its) { if (o.good) { starPath(c, o.x, o.y, 18, 8); fs(c, '#ffd60a', 2.5); }
        else { c.save(); c.translate(o.x, o.y); for (const [dx, dy, rr] of [[-14, 4, 14], [0, -6, 18], [14, 4, 14]]) { ell(c, dx, dy, rr, rr); fs(c, '#6c757d', 2.5); } polyPath(c, [[-2, 14], [8, 14], [0, 26], [10, 26], [-6, 44], [0, 30], [-8, 30]]); fs(c, '#ffd60a', 1.5); c.restore(); } }
      if (!(inv > 0 && Math.floor(t * 12) % 2)) { c.save(); c.translate(px, 440 + Math.sin(t * 4) * 4); c.rotate((tx - px) / 300);
        rrPath(c, -54, 8, 108, 8, 4); fs(c, '#8d5a3b', 2); polyPath(c, [[-54, 4], [-78, -6], [-80, 30], [-54, 20]]); fs(c, '#e9c46a', 2);
        drawAnimal(c, env.kind, 0, 14, 1.3, { t, look: Object.assign({}, DEFAULT_LOOK), cap: false }); if (typeof hwCostume === 'function') hwCostume(c, 'hexe0', 0, -56, 1.3); c.restore(); }
    },
    down(x) { tx = clamp(x, 50, 350); }, move(x) { tx = clamp(x, 50, 350); },
  };
} };

// 8) Süßes oder Saures: Hinter den Türen sind Süßigkeiten – finde immer zwei gleiche
GAMES.hw_klingeln = { make(env) {
  const r = env.r, L = HL(env), pairs = [3, 4, 6][L], kinds = shuffle(HW_ITEM_IDS, r).slice(0, pairs), cards = shuffle(kinds.concat(kinds), r);
  const cols = pairs <= 3 ? 3 : 4, rows = Math.ceil(cards.length / cols), cw = 82, ch = 104;
  const D = cards.map((k, i) => ({ k, x: 200 + ((i % cols) - (cols - 1) / 2) * (cw + 10), y: 150 + Math.floor(i / cols) * (ch + 14) + (rows < 3 ? 40 : 0), open: false, done: false }));
  let first = null, wait = 0, t = 0; const fin = finisher(env);
  return {
    hint: { type: 'tap', x: D[0].x, y: D[0].y },
    update(dt) { t += dt; if (wait > 0) { wait -= dt; if (wait <= 0) D.forEach(d => { if (!d.done) d.open = false; }); } fin.tick(dt); },
    draw(c) {
      hwNight(c, '#2a1d3d', '#4a2f55'); hwLabel(c, 'Klingel und finde zwei gleiche!');
      for (const d of D) {
        rrPath(c, d.x - cw / 2, d.y - ch / 2, cw, ch, 10); fs(c, d.open || d.done ? '#fff7e6' : '#8d5a3b', 3);
        if (d.open || d.done) drawItem(c, d.k, d.x, d.y, 56);
        else { rrPath(c, d.x - cw / 2 + 8, d.y - ch / 2 + 8, cw - 16, ch / 2 - 12, 6); fs(c, '#6f4527', 2); rrPath(c, d.x - cw / 2 + 8, d.y + 4, cw - 16, ch / 2 - 12, 6); fs(c, '#6f4527', 2); ell(c, d.x + cw / 2 - 16, d.y, 4, 4); fs(c, '#ffd60a', 1.5); jackO(c, d.x, d.y - ch / 2 + 2, 0.55, 0); }
        if (d.done) icon(c, 'check', d.x + cw / 2 - 12, d.y - ch / 2 + 12, 18, '#06d6a0');
      }
    },
    down(x, y) {
      if (fin.on() || wait > 0) return; const d = D.find(q => Math.abs(x - q.x) < cw / 2 && Math.abs(y - q.y) < ch / 2); if (!d || d.open || d.done) return;
      d.open = true; Sfx.play('pop');
      if (!first) { first = d; return; }
      if (first.k === d.k) { first.done = d.done = true; Sfx.play('good'); env.burst(d.x, d.y, 8); first = null; if (D.every(q => q.done)) fin.set(0.5); }
      else { Sfx.play('bad'); first = null; wait = L === 0 ? 1.1 : 0.8; }
    },
  };
} };

// 9) Kürbisse zählen: Wie viele (leuchtende) Kürbisse siehst du?
GAMES.hw_zaehlen = { make(env) {
  const r = env.r, L = HL(env), rounds = L === 0 ? 2 : 3;
  let round = 0, P = [], ans = 0, opts = [], t = 0, fx = []; const fin = finisher(env);
  const newRound = () => {
    const n = L === 0 ? 3 + Math.floor(r() * 4) : 6 + Math.floor(r() * 6); P = [];
    let g = 0; while (P.length < n && g++ < 500) { const x = 50 + r() * 300, y = 120 + r() * 220; if (!P.some(p => dist(p.x, p.y, x, y) < 52)) P.push({ x, y, lit: L === 0 || r() < 0.55, s: 0.8 + r() * 0.4 }); }
    ans = P.filter(p => p.lit).length; if (!ans) { P[0].lit = true; ans = 1; }
    const o = new Set([ans]); while (o.size < 3) o.add(Math.max(0, ans + pick([-2, -1, 1, 2], r))); opts = shuffle([...o], r);
  };
  newRound();
  const ox = i => 200 + (i - 1) * 110;
  return {
    hint: { type: 'tap', x: ox(0), y: 440 },
    update(dt) { t += dt; fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.7); fin.tick(dt); },
    draw(c) {
      hwNight(c, '#1f2a44', '#3d3424'); c.fillStyle = '#3d5a3a'; c.fillRect(0, 100, GAME_W, 270);
      hwLabel(c, L === 0 ? 'Wie viele Kürbisse sind es?' : 'Wie viele Kürbisse leuchten?');
      roundDots(c, rounds, round, 70);
      for (const p of P) { if (p.lit) jackO(c, p.x, p.y, 1.5 * p.s, 0.9); else { c.save(); c.translate(p.x, p.y); c.scale(1.5 * p.s, 1.5 * p.s); for (const [dx, rw] of [[-7, 9], [7, 9], [0, 11]]) { ell(c, dx, 0, rw, 12); fs(c, '#b35c00', 2.2); } rrPath(c, -2, -16, 4, 6, 1.5); fs(c, '#6b4423', 1.5); c.restore(); } }
      opts.forEach((v, i) => { rrPath(c, ox(i) - 44, 405, 88, 70, 18); fs(c, '#ffd166', 3); txt(c, String(v), ox(i), 441, 34, '#3d2c1f', 'center', null); });
      hwFx(c, fx);
    },
    down(x, y) {
      if (fin.on() || y < 400) return; const i = opts.findIndex((_, j) => Math.abs(x - ox(j)) < 46); if (i < 0) return;
      if (opts[i] === ans) { Sfx.play('good'); env.burst(ox(i), 440, 10); fx.push({ s: 'Richtig!', x: 200, y: 380, t: 0, ok: true }); round++; if (round >= rounds) fin.set(0.6); else newRound(); }
      else { Sfx.play('bad'); fx.push({ s: 'Zähl nochmal!', x: 200, y: 380, t: 0, ok: false }); }
    },
  };
} };

Object.assign(HELP_TEXT, {
  hw_schnitzen: 'Schau dir den kleinen Kürbis an. Tippe unten Augen, Nase und Mund an, bis dein Kürbis genauso aussieht.',
  hw_trank: 'Merk dir das Zaubertrank-Rezept. Tippe dann die Zutaten in der richtigen Reihenfolge an – sie fallen in den Kessel.',
  hw_geister: 'Gespenster gucken aus den Grabsteinen. Tippe sie schnell an! Aber lass die Fledermäuse in Ruhe.',
  hw_suesses: 'Zieh jede Süßigkeit in die Schale, auf der dieselbe Süßigkeit abgebildet ist.',
  hw_flug: 'Tippe, dann flattert die Fledermaus nach oben. Flieg durch die Lücken zwischen den Bäumen.',
  hw_netz: 'Tippe die Punkte der Reihe nach an: erst die 1, dann die 2 und so weiter. Dann spinnt die Spinne ihr Netz.',
  hw_besen: 'Schieb die Hexe auf dem Besen hin und her. Sammle die Sterne und weich den Gewitterwolken aus.',
  hw_klingeln: 'Tippe zwei Türen an. Finde immer zwei gleiche Süßigkeiten.',
  hw_zaehlen: 'Zähle die Kürbisse und tippe unten die richtige Zahl an.',
});

if (HALLOWEEN) {
  // Im Special bekommt jeder Bereich nur noch Halloween-Aufgaben (plus ein paar allgemeine Rätsel, die jetzt Halloween-Motive zeigen)
  const POOLS = {
    easy: ['hw_schnitzen', 'hw_trank', 'hw_suesses', 'hw_netz', 'hw_klingeln', 'hw_zaehlen', 'memory', 'shadow', 'findall'],
    puzzle: ['hw_schnitzen', 'hw_trank', 'hw_klingeln', 'hw_zaehlen', 'hw_suesses', 'hw_netz', 'pairs', 'oddone', 'diff'],
    std: ['hw_geister', 'hw_flug', 'hw_besen'],
    sp: ['hw_geister', 'hw_besen', 'hw_flug'],
    hard: ['hw_flug', 'hw_geister', 'hw_besen'],
  };
  for (const D of Object.values(STAGE_DEFS)) D.pools = POOLS;
}
