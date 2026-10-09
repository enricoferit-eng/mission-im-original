'use strict';
// ---------- Neue Aufgaben für Gastraum (Glashaus) und Außenbereich (Terrasse) ----------
// Hintergrund Glashaus: Glasdach-Streben, Himmel, Ziegelboden, Palmenblätter
function glassBg(c, floor = 330, t = 0) {
  const sky = c.createLinearGradient(0, 0, 0, floor); sky.addColorStop(0, '#8fd0ea'); sky.addColorStop(1, '#dff3fa');
  c.fillStyle = sky; c.fillRect(0, 0, GAME_W, floor);
  c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 5;
  for (let x = -40; x <= GAME_W + 40; x += 80) { c.beginPath(); c.moveTo(x, floor); c.lineTo(x + 60, 0); c.stroke(); }
  c.strokeStyle = 'rgba(110,125,135,.55)'; c.lineWidth = 3; for (let y = 40; y < floor; y += 70) { c.beginPath(); c.moveTo(0, y); c.lineTo(GAME_W, y); c.stroke(); }
  for (let k = 0; k < 2; k++) { const px = k ? 372 : 26; c.save(); c.translate(px, 40); c.rotate(Math.sin(t * 0.8 + k) * 0.04); for (let m = 0; m < 6; m++) { const a = (k ? Math.PI : 0) + (m - 2.5) * 0.35 * (k ? -1 : 1) + (k ? 0.4 : -0.4); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(Math.cos(a) * 40, Math.sin(a) * 40 - 14, Math.cos(a) * 80, Math.sin(a) * 80 + 10); c.lineWidth = 9; c.strokeStyle = OL; c.stroke(); c.lineWidth = 6; c.strokeStyle = m % 2 ? '#5f9a3f' : '#7cb85a'; c.stroke(); } c.restore(); }
  c.fillStyle = '#c96f4a'; c.fillRect(0, floor, GAME_W, GAME_H - floor);
  c.strokeStyle = 'rgba(90,40,25,.35)'; c.lineWidth = 1.5;
  for (let y = floor, k = 0; y < GAME_H; y += 22, k++) { c.beginPath(); c.moveTo(0, y); c.lineTo(GAME_W, y); c.stroke(); for (let x = (k % 2) * 22; x < GAME_W; x += 44) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 22); c.stroke(); } }
  c.fillStyle = 'rgba(255,240,200,.12)'; for (let k = 0; k < 4; k++) { polyPath(c, [[k * 120 - 40, floor], [k * 120 + 20, floor], [k * 120 - 20, GAME_H], [k * 120 - 90, GAME_H]]); c.fill(); }
}
// Hintergrund Terrasse: Himmel, rotes Sonnensegel, Zypressen, Kies
function terraceBg(c, floor = 300, t = 0, wind = 0) {
  const sky = c.createLinearGradient(0, 0, 0, floor); sky.addColorStop(0, '#74c0fc'); sky.addColorStop(1, '#d0ebff'); c.fillStyle = sky; c.fillRect(0, 0, GAME_W, floor);
  for (let k = 0; k < 3; k++) { const x = ((k * 160 + t * 12) % 520) - 60; ell(c, x, 50 + k * 26, 40, 13); c.fillStyle = 'rgba(255,255,255,.85)'; c.fill(); ell(c, x + 26, 44 + k * 26, 26, 12); c.fill(); }
  for (const x of [40, 360]) { const sw = Math.sin(t * 1.5 + x) * (3 + wind * 8); c.beginPath(); c.moveTo(x, floor - 190); c.quadraticCurveTo(x + 26 + sw, floor - 90, x + 16, floor); c.lineTo(x - 16, floor); c.quadraticCurveTo(x - 26 + sw, floor - 90, x, floor - 190); fs(c, '#2d6a4f', 3); }
  const fl = Math.sin(t * 2.2) * (6 + wind * 14);
  c.beginPath(); c.moveTo(70, 18); c.quadraticCurveTo(200, 60 + fl, 330, 24); c.lineTo(300, 110); c.quadraticCurveTo(200, 90 + fl * 0.6, 100, 120); c.closePath(); fs(c, '#e8590c', 3);
  c.fillStyle = 'rgba(255,255,255,.15)'; c.beginPath(); c.moveTo(70, 18); c.quadraticCurveTo(200, 60 + fl, 330, 24); c.lineTo(320, 40); c.quadraticCurveTo(200, 74 + fl, 84, 40); c.closePath(); c.fill();
  c.fillStyle = '#d6cebf'; c.fillRect(0, floor, GAME_W, GAME_H - floor);
  for (let i = 0; i < 260; i++) { const x = (i * 97.3) % GAME_W, y = floor + ((i * 53.7) % (GAME_H - floor)); c.fillStyle = ['#c5bcad', '#e6dfd3', '#b3aa9a'][i % 3]; c.fillRect(x, y, 3, 3); }
}
const txtGot = (c, got, need, col = BRAND.olive) => txt(c, got + ' / ' + need, 200, 36, 22, col, 'center', '#fff');
const progBar = (c, f, y = 22, col = '#06d6a0') => { rrPath(c, 50, y, 300, 22, 11); fs(c, 'rgba(0,0,0,.25)', 3); rrPath(c, 53, y + 3, 294 * clamp(f, 0, 1), 16, 8); c.fillStyle = col; c.fill(); };
function drawGlass(c, x, y, s, fill, col = '#ff9f1c', wob = 0) {
  c.save(); c.translate(x, y); c.rotate(wob); c.scale(s, s);
  polyPath(c, [[-16, -50], [16, -50], [12, 0], [-12, 0]]); c.fillStyle = 'rgba(220,240,255,.55)'; c.fill();
  if (fill > 0) { const h = 50 * clamp(fill, 0, 1.2); c.save(); polyPath(c, [[-16, -50], [16, -50], [12, 0], [-12, 0]]); c.clip(); c.fillStyle = col; c.fillRect(-20, -h, 40, h); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-20, -h, 40, 3); c.restore(); }
  polyPath(c, [[-16, -50], [16, -50], [12, 0], [-12, 0]]); fs(c, null, 3);
  line(c, -9, -42, -7, -10, 2.5, 'rgba(255,255,255,.7)', false);
  c.restore();
}

// ===== Gastraum =====
// 1) Servietten falten: Pfeil zeigt die Faltrichtung – in diese Richtung über die Serviette wischen
GAMES.servietten = { make(env) {
  const r = env.r, L = LVL(env), need = 3 + L, folds = 2 + (L ? 1 : 0);
  const DIRS = L === 2 ? ['r', 'l', 'u', 'd', 'ur', 'dl'] : ['r', 'l', 'u', 'd'];
  const V = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1], ur: [0.7, -0.7], dl: [-0.7, 0.7] };
  const COLS = ['#fff', '#ffe066', '#ffadad', '#a5d8ff'];
  let nap = null, got = 0, t = 0, anim = 0, start = null, shake = 0, fly = 0; const fin = finisher(env), done = [];
  const mk = () => { nap = { k: 0, seq: [...Array(folds)].map(() => pick(DIRS, r)), col: COLS[got % COLS.length], w: 220, h: 220, x: 200 }; };
  mk();
  return {
    hint: { type: 'swipe', x: 200, y: 300 },
    update(dt) {
      t += dt; anim = Math.max(0, anim - dt * 3.5); shake = Math.max(0, shake - dt);
      nap.x = 200 + Math.sin(t * 1.3) * (14 + L * 14) * GAME_MOTION;
      if (fly > 0) { fly -= dt; if (fly <= 0) { got++; if (got >= need) fin.set(0.3); else mk(); } }
      fin.tick(dt);
    },
    draw(c) {
      glassBg(c, 140, t); txtGot(c, got, need);
      rrPath(c, 30, 170, 340, 300, 20); fs(c, '#e9c46a', 3);
      done.forEach((d, i) => { const x = 60 + i * 34; polyPath(c, [[x - 14, 470], [x + 14, 470], [x, 430]]); fs(c, d, 2.5); });
      if (fly > 0) { const k = 1 - fly / 0.5; c.save(); c.translate(lerp(nap.x, 60 + (done.length - 1) * 34, k), lerp(320, 455, k)); c.scale(1 - k * 0.6, 1 - k * 0.6); polyPath(c, [[-34, 40], [34, 40], [0, -50]]); fs(c, nap.col, 3); c.restore(); return; }
      const sx = shake ? Math.sin(t * 70) * 6 : 0, flap = Math.sin(t * 7) * 0.04;
      c.save(); c.translate(nap.x + sx, 320); c.rotate(flap);
      const fw = nap.w, fh = nap.h;
      rrPath(c, -fw / 2, -fh / 2, fw, fh, 8); fs(c, nap.col, 3);
      c.strokeStyle = 'rgba(0,0,0,.1)'; c.lineWidth = 2; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(-fw / 2 + 8, -fh / 2 + k * fh / 4); c.lineTo(fw / 2 - 8, -fh / 2 + k * fh / 4); c.stroke(); }
      leaf(c, -fw / 2 + 22, fh / 2 - 22, 0.7, BRAND.lime);
      if (anim > 0) { c.globalAlpha = anim; rrPath(c, -fw / 2, -fh / 2, fw, fh, 8); c.fillStyle = '#fff'; c.fill(); c.globalAlpha = 1; }
      const d = V[nap.seq[nap.k]], pu = 0.5 + 0.5 * Math.sin(t * 6);
      c.setLineDash([8, 8]); line(c, -d[1] * fw * 0.45, d[0] * fh * 0.45, d[1] * fw * 0.45, -d[0] * fh * 0.45, 3, '#118ab2', false); c.setLineDash([]);
      c.save(); c.rotate(Math.atan2(d[1], d[0])); c.globalAlpha = 0.6 + pu * 0.4; const ax = -40 + pu * 20;
      line(c, ax - 40, 0, ax + 40, 0, 10, '#ef476f'); polyPath(c, [[ax + 56, 0], [ax + 32, -20], [ax + 32, 20]]); fs(c, '#ef476f', 3); c.restore();
      c.restore();
      for (let k = 0; k < folds; k++) { ell(c, 200 + (k - (folds - 1) / 2) * 26, 490, 8, 8); fs(c, k < nap.k ? '#06d6a0' : '#fff', 2.5); }
    },
    down(x, y) { start = { x, y }; },
    up(x, y) {
      if (!start || fin.on() || fly > 0) { start = null; return; }
      const dx = x - start.x, dy = y - start.y, d = Math.hypot(dx, dy); start = null;
      if (d < 50) return;
      const v = V[nap.seq[nap.k]], dot = (dx * v[0] + dy * v[1]) / d;
      if (dot > 0.75) {
        nap.k++; anim = 1; Sfx.note(500 + nap.k * 120, 0.1, 'triangle', 0.06); env.burst(nap.x, 320, 8);
        if (v[0]) nap.w *= 0.62; else if (v[1]) nap.h *= 0.62; if (v[0] && v[1]) nap.h *= 0.8;
        if (nap.k >= nap.seq.length) { Sfx.play('good'); done.push(nap.col); fly = 0.5; }
      } else { shake = 0.35; Sfx.play('bad'); }
    },
  };
} };

// 2) Tablett balancieren: Finger nach links/rechts = Tablett kippen. Gäste rempeln, die Gläser rutschen
GAMES.tablett = { make(env) {
  const r = env.r, L = LVL(env), n = 3 + L, len = 14 + L * 4;
  const G = [...Array(n)].map((_, i) => ({ x: (i - (n - 1) / 2) * 40, v: 0, down: 0, col: pick(['#ff9f1c', '#e63946', '#ffd166', '#06d6a0'], r) }));
  let tilt = 0, target = 0, el = 0, bump = 0, bumpT = 2.5, walk = 0, crash = []; const fin = finisher(env);
  return {
    hint: { type: 'drag', x: 200, y: 400, x2: 300, y2: 400 },
    update(dt) {
      if (fin.on()) { fin.tick(dt); return; }
      el += dt; walk += dt * 3;
      tilt = lerp(tilt, target, Math.min(1, dt * 6));
      bumpT -= dt; if (bumpT <= 0) { bump = (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.5) * (1 + L * 0.4); bumpT = 1.6 + r() * (2.2 - L * 0.5); Sfx.note(160, 0.12, 'square', 0.04); }
      const sway = Math.sin(walk * 0.7) * 0.05 * (1 + L * 0.5) * GAME_MOTION;
      G.forEach(g => {
        if (g.down > 0) { g.down -= dt; if (g.down <= 0) { g.x = 0; g.v = 0; } return; }
        g.v += (Math.sin(tilt + sway) * 520 + bump * 260) * dt; g.v *= 1 - dt * 0.8; g.x += g.v * dt;
        if (Math.abs(g.x) > 112) { g.down = 1.2; crash.push({ x: 200 + Math.sign(g.x) * 130, y: 400, t: 0 }); Sfx.play('bad'); el = Math.max(0, el - 2.5); buzz(40); }
      });
      bump *= Math.pow(0.02, dt);
      crash.forEach(k => (k.t += dt)); crash = crash.filter(k => k.t < 0.8);
      if (el >= len) fin.set(0.4);
      fin.tick(dt);
    },
    draw(c) {
      glassBg(c, 200, el); progBar(c, el / len); icon(c, 'clock', 32, 33, 24);
      for (let k = 0; k < 3; k++) { const x = ((k * 170 - el * 80) % 600 + 600) % 600 - 100; rrPath(c, x, 230, 80, 40, 6); fs(c, '#b08968', 3); ell(c, x + 40, 228, 26, 8); fs(c, '#fff', 2); }
      if (bump) { const bx = bump > 0 ? 20 : 380; for (let k = 0; k < 3; k++) line(c, bx + (bump > 0 ? -k * 8 : k * 8), 380 + k * 12, bx + (bump > 0 ? 30 - k * 8 : -30 + k * 8), 380 + k * 12, 3, 'rgba(255,255,255,.9)', false); }
      const by = 470 + Math.abs(Math.sin(walk)) * 6;
      rrPath(c, 170, by - 40, 60, 90, 20); fs(c, '#212529', 3); leaf(c, 200, by - 10, 0.6, BRAND.lime);
      c.save(); c.translate(200, 420); c.rotate(tilt + Math.sin(walk * 0.7) * 0.05);
      line(c, -20, 30, -60, 6, 8, '#212529'); line(c, 20, 30, 60, 6, 8, '#212529');
      ell(c, 0, 0, 130, 16); fs(c, '#adb5bd', 3); ell(c, 0, -3, 118, 11); fs(c, '#ced4da', 2);
      G.forEach(g => { if (g.down <= 0) drawGlass(c, g.x, -4, 0.75, 0.7, g.col, g.v * 0.0008); });
      c.restore();
      crash.forEach(k => { for (let m = 0; m < 5; m++) { const a = m * 1.3; polyPath(c, [[k.x + Math.cos(a) * k.t * 60, k.y + 40 + Math.sin(a) * k.t * 30], [k.x + Math.cos(a) * k.t * 60 + 8, k.y + 44], [k.x + Math.cos(a) * k.t * 60, k.y + 50]]); c.fillStyle = 'rgba(220,240,255,.9)'; c.fill(); } });
      txt(c, 'Finger links / rechts = kippen', 200, 506, 13, '#fff', 'center', OL);
    },
    down(x) { target = clamp((x - 200) / 160, -1, 1) * 0.5; },
    move(x) { target = clamp((x - 200) / 160, -1, 1) * 0.5; },
    up() { target = 0; },
  };
} };

// 3) Sonnenstrahl lenken: Spiegel antippen (drehen), bis das Licht die Palme trifft
GAMES.sonnenstrahl = { make(env) {
  const r = env.r, L = LVL(env), N = 5 + (L ? 1 : 0), cs = 300 / N, ox = 50, oy = 120;
  let M, src, tgt, tries = 0, seen;
  // Weg vom Licht (links) zur Palme zufällig bauen – an Knicken stehen Spiegel, dazu Ablenk-Spiegel
  for (;;) {
    tries++; M = new Array(N * N).fill(null);
    const sy = ri(0, N - 1, r); src = { x: -1, y: sy }; let x = 0, y = sy, dx = 1, dy = 0, turns = 0, steps = 0; seen = new Set();
    let ok = false;
    while (steps++ < 40) {
      if (x < 0 || y < 0 || x >= N || y >= N || seen.has(x + ',' + y)) break;
      seen.add(x + ',' + y);
      if (steps > 3 && turns >= 2 + L && r() < 0.35) { tgt = { x, y }; ok = true; break; }
      if (r() < 0.4 && steps > 1) { const ndx = dy ? (r() < 0.5 ? 1 : -1) : 0, ndy = dx ? (r() < 0.5 ? 1 : -1) : 0; M[y * N + x] = { m: (ndx === -dy && ndy === -dx) ? '/' : '\\' }; dx = ndx; dy = ndy; turns++; }
      x += dx; y += dy;
    }
    if (ok || tries > 200) break;
  }
  if (!tgt) tgt = { x: N - 1, y: src.y };
  const sol = M.map(m => m && m.m);
  for (let k = 0; k < 2 + L * 2; k++) { const i = ri(0, N * N - 1, r); if (!M[i] && !seen.has((i % N) + ',' + Math.floor(i / N))) M[i] = { m: r() < 0.5 ? '/' : '\\', fix: false }; }
  M.forEach(m => { if (m && r() < 0.8) m.m = m.m === '/' ? '\\' : '/'; });
  let beam = [], hit = false, t = 0, spin = {}; const fin = finisher(env);
  const trace = () => {
    beam = [[ox, oy + src.y * cs + cs / 2]]; let x = 0, y = src.y, dx = 1, dy = 0; hit = false;
    for (let s = 0; s < 80; s++) {
      if (x < 0 || y < 0 || x >= N || y >= N) { beam.push([ox + (x + 0.5) * cs - dx * cs / 2, oy + (y + 0.5) * cs - dy * cs / 2]); break; }
      if (x === tgt.x && y === tgt.y) { beam.push([ox + (x + 0.5) * cs, oy + (y + 0.5) * cs]); hit = true; break; }
      const m = M[y * N + x];
      if (m) { beam.push([ox + (x + 0.5) * cs, oy + (y + 0.5) * cs]); if (m.m === '/') { const k = dx; dx = -dy; dy = -k; } else { const k = dx; dx = dy; dy = k; } }
      x += dx; y += dy;
    }
  };
  trace(); for (let g = 0; g < N * N && hit; g++) { if (M[g] && sol[g]) { M[g].m = M[g].m === '/' ? '\\' : '/'; trace(); } }
  return {
    hint: { type: 'tap', x: ox + cs / 2, y: oy + cs / 2 },
    update(dt) { t += dt; Object.keys(spin).forEach(k => { spin[k] = Math.max(0, spin[k] - dt * 5); }); fin.tick(dt); },
    draw(c) {
      glassBg(c, 90, t);
      rrPath(c, ox - 8, oy - 8, N * cs + 16, N * cs + 16, 14); fs(c, '#c96f4a', 3);
      for (let i = 0; i < N * N; i++) { const x = ox + (i % N) * cs, y = oy + Math.floor(i / N) * cs; rrPath(c, x + 2, y + 2, cs - 4, cs - 4, 6); c.fillStyle = (i + Math.floor(i / N)) % 2 ? '#d98a62' : '#cf7c55'; c.fill(); }
      // Sonne links
      const sy = oy + src.y * cs + cs / 2; c.save(); c.translate(ox - 26, sy); c.rotate(t * 0.8); for (let k = 0; k < 8; k++) { c.rotate(TAU / 8); line(c, 18, 0, 28, 0, 4, '#ffd166', false); } c.restore(); ell(c, ox - 26, sy, 16, 16); fs(c, '#ffd166', 3);
      // Palme (Ziel)
      const tx = ox + (tgt.x + 0.5) * cs, ty = oy + (tgt.y + 0.5) * cs;
      c.save(); c.translate(tx, ty + cs * 0.42); const s = cs / 60; c.scale(s, s); drawPotPalm(c, 0, 0, 1.0, hit ? t * 3 : 0); c.restore();
      if (hit) { ell(c, tx, ty, cs * 0.45 + Math.sin(t * 8) * 4, cs * 0.45 + Math.sin(t * 8) * 4); c.fillStyle = 'rgba(255,230,120,.35)'; c.fill(); }
      // Strahl
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); beam.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
      c.lineWidth = 12; c.strokeStyle = 'rgba(255,214,90,.35)'; c.stroke(); c.lineWidth = 4 + Math.sin(t * 12); c.strokeStyle = '#fff3bf'; c.stroke(); c.restore();
      M.forEach((m, i) => { if (!m) return; const x = ox + (i % N + 0.5) * cs, y = oy + (Math.floor(i / N) + 0.5) * cs, a = (m.m === '/' ? -0.785 : 0.785) + (spin[i] || 0) * 1.57;
        c.save(); c.translate(x, y); c.rotate(a); rrPath(c, -cs * 0.42, -5, cs * 0.84, 10, 4); fs(c, '#e7f5ff', 3); line(c, -cs * 0.34, -2, cs * 0.3, -2, 2, '#74c0fc', false); c.restore(); });
    },
    down(x, y) {
      if (fin.on()) return; const gx = Math.floor((x - ox) / cs), gy = Math.floor((y - oy) / cs); if (gx < 0 || gy < 0 || gx >= N || gy >= N) return;
      const m = M[gy * N + gx]; if (!m) return; m.m = m.m === '/' ? '\\' : '/'; spin[gy * N + gx] = 1; Sfx.note(700, 0.06, 'sine', 0.05); trace();
      if (hit) { Sfx.play('good'); env.burst(ox + (tgt.x + 0.5) * cs, oy + (tgt.y + 0.5) * cs, 20); fin.set(0.8); }
    },
  };
} };

// 4) Fliegen verscheuchen: Fliegen schwirren ums Essen – antippen; nicht aufs Essen tippen
GAMES.fliegen = { make(env) {
  const r = env.r, L = LVL(env), need = 10 + L * 4, plates = [[110, 330], [290, 330], [200, 440]];
  const F = []; let got = 0, t = 0, spawn = 0.4, miss = 0, foods = shuffle(FOOD6, r); const ruin = [0, 0, 0]; const fin = finisher(env);
  const mk = () => { const p = ri(0, 2, r), a = r() * TAU; F.push({ x: 200 + Math.cos(a) * 260, y: 260 + Math.sin(a) * 260, p, ph: r() * 6, land: 0, sp: 70 + L * 30 + r() * 30, rad: 50 + r() * 40, dead: 0 }); };
  return {
    hint: { type: 'tap', x: 110, y: 300 },
    update(dt) {
      t += dt; miss = Math.max(0, miss - dt); spawn -= dt;
      if (spawn <= 0 && F.filter(f => !f.dead).length < 2 + L) { mk(); spawn = 0.7 - L * 0.15 + r() * 0.5; }
      F.forEach(f => {
        if (f.dead) { f.dead += dt; f.y += 200 * dt * f.dead; return; }
        const [px, py] = plates[f.p];
        f.ph += dt * (2.5 + L);
        const tx = px + Math.cos(f.ph) * f.rad * (f.land ? 0.15 : 1), ty = py - 20 + Math.sin(f.ph * 1.7) * f.rad * 0.5 * (f.land ? 0.1 : 1);
        const d = dist(f.x, f.y, tx, ty), s = f.sp * dt * 1.5 * GAME_MOTION; if (d > s) { f.x += (tx - f.x) / d * s; f.y += (ty - f.y) / d * s; } else { f.x = tx; f.y = ty; }
        f.rad = Math.max(8, f.rad - dt * (6 + L * 4)); if (f.rad < 12) f.land += dt;
        if (f.land > 2.2 - L * 0.4) { ruin[f.p] = 1; f.land = 0; f.rad = 70; got = Math.max(0, got - 1); Sfx.play('bad'); }
      });
      for (let i = F.length - 1; i >= 0; i--) if (F[i].dead > 0.8) F.splice(i, 1);
      for (let k = 0; k < 3; k++) ruin[k] = Math.max(0, ruin[k] - dt);
      fin.tick(dt);
    },
    draw(c) {
      glassBg(c, 180, t); txtGot(c, got, need);
      rrPath(c, 20, 260, 360, 230, 20); fs(c, '#fbf8f2', 3); c.strokeStyle = 'rgba(0,0,0,.08)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(20, 280 + k * 36); c.lineTo(380, 280 + k * 36); c.stroke(); }
      plates.forEach(([x, y], i) => { const sx = ruin[i] ? Math.sin(t * 60) * 3 : 0; ell(c, x + sx, y, 62, 30); fs(c, '#fff', 3); ell(c, x + sx, y, 46, 21); fs(c, '#f1f3f5', 1.5); drawFood(c, foods[i], x + sx, y - 6, 62); });
      F.forEach(f => {
        c.save(); c.translate(f.x, f.y); if (f.dead) c.rotate(f.dead * 8);
        const flap = Math.sin(t * 60) * 0.5;
        ell(c, -5, -6, 7, 4, -0.6 + flap); c.fillStyle = 'rgba(220,240,255,.8)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = OL; c.stroke();
        ell(c, 5, -6, 7, 4, 0.6 - flap); c.fillStyle = 'rgba(220,240,255,.8)'; c.fill(); c.stroke();
        ell(c, 0, 0, 7, 6); fs(c, '#343a40', 2); ell(c, 4, -1, 2.5, 2.5); c.fillStyle = '#e63946'; c.fill();
        c.restore();
      });
      if (miss) txt(c, 'Nicht aufs Essen!', 200, 220, 22, '#ef476f', 'center', '#fff');
    },
    down(x, y) {
      if (fin.on()) return;
      const f = F.filter(q => !q.dead).sort((a, b) => dist(x, y, a.x, a.y) - dist(x, y, b.x, b.y))[0];
      if (f && dist(x, y, f.x, f.y) < 34 - L * 4) { f.dead = 0.01; got++; Sfx.play('pop'); env.burst(f.x, f.y, 8); if (got >= need) fin.set(0.5); return; }
      if (plates.some(([px, py]) => dist(x, y, px, py) < 50)) { miss = 0.7; Sfx.play('bad'); }
    },
  };
} };

// 5) Musik-Box: Noten fliegen heran – tippe die Spur, wenn die Note auf der Linie ist
GAMES.musikbox = { make(env) {
  const r = env.r, L = LVL(env), lanes = 2 + Math.min(L, 1) + (L === 2 ? 1 : 0), need = 14 + L * 4, beat = 0.55 - L * 0.07, sp = 230 + L * 50;
  const lx = k => 200 + (k - (lanes - 1) / 2) * (300 / lanes), HY = 430, TONES = [523, 587, 659, 784];
  const N = []; let tt = 0.6, got = 0, combo = 0, t = 0, fx = [], flash = new Array(lanes).fill(0); const fin = finisher(env);
  return {
    hint: { type: 'tap', x: lx(0), y: HY },
    update(dt) {
      t += dt; tt -= dt;
      if (tt <= 0) { const k = ri(0, lanes - 1, r); N.push({ k, y: 60, hit: false }); if (L && r() < 0.25) N.push({ k: (k + 1) % lanes, y: 60 - sp * beat / 2, hit: false }); tt = beat * (r() < 0.3 ? 2 : 1); }
      N.forEach(n => (n.y += sp * dt * GAME_MOTION));
      for (let i = N.length - 1; i >= 0; i--) { const n = N[i]; if (n.y > HY + 50 && !n.hit) { N.splice(i, 1); combo = 0; Sfx.note(150, 0.08, 'square', 0.03); } else if (n.hit && n.y > 600) N.splice(i, 1); }
      fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.5);
      for (let k = 0; k < lanes; k++) flash[k] = Math.max(0, flash[k] - dt * 4);
      fin.tick(dt);
    },
    draw(c) {
      c.fillStyle = '#2b2d42'; c.fillRect(0, 0, GAME_W, GAME_H);
      for (let k = 0; k < 14; k++) { ell(c, (k * 71) % 400, 30 + ((k * 37 + t * 20) % 380), 2, 2); c.fillStyle = `rgba(255,214,90,${0.3 + 0.3 * Math.sin(t * 3 + k)})`; c.fill(); }
      txtGot(c, got, need, '#ffd166');
      for (let k = 0; k < lanes; k++) { const x = lx(k); rrPath(c, x - 36, 70, 72, 420, 18); c.fillStyle = `rgba(255,255,255,${0.06 + flash[k] * 0.25})`; c.fill(); }
      line(c, 30, HY, 370, HY, 6, '#ffd166'); for (let k = 0; k < lanes; k++) { ell(c, lx(k), HY, 30, 30); fs(c, ['#ef476f', '#06d6a0', '#118ab2', '#ffd166'][k], 3); }
      N.forEach(n => { if (n.hit) return; const x = lx(n.k); ell(c, x - 6, n.y + 8, 13, 10); fs(c, '#fff', 3); line(c, x + 6, n.y + 6, x + 6, n.y - 26, 4, '#fff'); line(c, x + 6, n.y - 26, x + 18, n.y - 18, 4, '#fff'); });
      fx.forEach(f => { c.globalAlpha = 1 - f.t * 2; txt(c, f.s, f.x, HY - 50 - f.t * 60, 20, f.ok ? '#80ed99' : '#ef476f', 'center', OL); c.globalAlpha = 1; });
      if (combo >= 4) txt(c, combo + 'er Serie!', 200, 76, 18, '#ffd166', 'center', OL);
    },
    down(x) {
      if (fin.on()) return;
      let k = 0, bd = 1e9; for (let i = 0; i < lanes; i++) { const d = Math.abs(x - lx(i)); if (d < bd) { bd = d; k = i; } }
      flash[k] = 1;
      const n = N.filter(q => q.k === k && !q.hit).sort((a, b) => Math.abs(a.y - HY) - Math.abs(b.y - HY))[0];
      if (n && Math.abs(n.y - HY) < 46 - L * 6) { n.hit = true; got++; combo++; Sfx.note(TONES[k] * (combo > 5 ? 2 : 1), 0.18, 'triangle', 0.09); env.burst(lx(k), HY, 6); fx.push({ x: lx(k), t: 0, s: Math.abs(n.y - HY) < 16 ? 'Super!' : 'Gut', ok: true }); if (got >= need) fin.set(0.5); }
      else { combo = 0; Sfx.note(180, 0.1, 'square', 0.04); fx.push({ x: lx(k), t: 0, s: 'Zu früh', ok: false }); }
    },
  };
} };

// 6) Getränke einschenken: Finger halten = Zapfhahn auf; loslassen, wenn das Glas bis zum Strich voll ist
GAMES.einschenken = { make(env) {
  const r = env.r, L = LVL(env), need = 5 + L * 2;
  let gl = null, pour = false, got = 0, t = 0, spill = 0, fx = []; const fin = finisher(env);
  const COLS = ['#ff9f1c', '#e63946', '#ffd166', '#06d6a0', '#f4a261'];
  const mk = () => { gl = { x: -60, s: 0.9 + r() * 0.6, f: 0, line: 0.55 + r() * 0.3, col: pick(COLS, r), state: 'in', v: 140 + L * 30 }; };
  mk();
  return {
    hint: { type: 'tap', x: 200, y: 300 },
    update(dt) {
      t += dt; spill = Math.max(0, spill - dt);
      if (gl.state === 'in') { gl.x += 300 * dt; if (gl.x >= 200 - L * 50) { gl.state = 'pour'; } }
      else if (gl.state === 'pour') { gl.x += (L ? 22 + L * 14 : 0) * dt * GAME_MOTION;
        if (pour) { if (Math.abs(gl.x - 200) < 26 * gl.s) gl.f += dt * (0.38 / gl.s) * (1 + L * 0.3); else spill = 0.4; }
        if (gl.f > gl.line + 0.12) { gl.state = 'out'; fx.push({ t: 0, s: 'Übergelaufen!', ok: false }); Sfx.play('bad'); got = Math.max(0, got - 1); }
        if (gl.x > 200 + 40 * gl.s && !pour) { gl.state = 'out'; fx.push({ t: 0, s: 'Vorbei!', ok: false }); Sfx.play('bad'); } }
      else { gl.x += 360 * dt; if (gl.x > 480) mk(); }
      fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.8);
      fin.tick(dt);
    },
    draw(c) {
      c.fillStyle = '#5c3d2e'; c.fillRect(0, 0, GAME_W, GAME_H);
      for (let k = 0; k < 4; k++) { rrPath(c, 20, 40 + k * 70, 360, 10, 3); fs(c, '#8d5a3b', 2); for (let m = 0; m < 7; m++) { rrPath(c, 32 + m * 50, 0 + k * 70, 14, 40, 4); fs(c, ['#2b9348', '#e9c46a', '#9d0208', '#adb5bd'][(m + k) % 4], 2); } }
      txtGot(c, got, need, '#ffd166');
      // Zapfhahn
      rrPath(c, 170, 250, 60, 40, 10); fs(c, '#adb5bd', 3); rrPath(c, 190, 288, 20, 26, 5); fs(c, '#868e96', 3); rrPath(c, 196, 214, 8, 40, 4); fs(c, pour ? '#ef476f' : '#212529', 2.5);
      if (pour && gl.state === 'pour') { const y2 = 470 - 50 * gl.s * Math.min(gl.f, 1.1); c.fillStyle = gl.col; c.fillRect(196 + Math.sin(t * 40), 312, 8, y2 - 312); }
      // Theke mit Laufband
      rrPath(c, 0, 470, 400, 50, 6); fs(c, '#343a40', 3); for (let k = 0; k < 10; k++) line(c, ((k * 44 + t * 120) % 440) - 20, 478, ((k * 44 + t * 120) % 440) - 10, 478, 3, 'rgba(255,255,255,.2)', false);
      drawGlass(c, gl.x, 470, gl.s, gl.f, gl.col, 0);
      const ly = 470 - 50 * gl.s * gl.line; line(c, gl.x - 20 * gl.s, ly, gl.x + 20 * gl.s, ly, 3, '#06d6a0', false); line(c, gl.x - 20 * gl.s, ly - 50 * gl.s * 0.12, gl.x + 20 * gl.s, ly - 50 * gl.s * 0.12, 2, 'rgba(239,71,111,.8)', false);
      if (spill) txt(c, 'Daneben!', 200, 200, 22, '#ef476f', 'center', '#fff');
      fx.forEach(f => { c.globalAlpha = 1 - f.t / 0.8; txt(c, f.s, 200, 170 - f.t * 40, 24, f.ok ? '#80ed99' : '#ef476f', 'center', '#fff'); c.globalAlpha = 1; });
      txt(c, 'Halten = einschenken', 200, 506, 13, '#fff', 'center', OL);
    },
    down() { if (fin.on()) return; pour = true; Sfx.note(320, 0.08, 'sine', 0.03); },
    up() {
      if (!pour) return; pour = false; if (gl.state !== 'pour' || gl.f < 0.1) return;
      if (gl.f >= gl.line - 0.07 && gl.f <= gl.line + 0.12) { got++; gl.state = 'out'; Sfx.play('good'); env.burst(gl.x, 420, 12); fx.push({ t: 0, s: 'Genau richtig!', ok: true }); if (got >= need) fin.set(0.5); }
    },
  };
} };

// ===== Außenbereich =====
// 7) Sonnenschirme aufspannen: nur aufspannen, wenn der Wind gerade ruhig ist – sonst klappt er um
GAMES.schirme = { make(env) {
  const r = env.r, L = LVL(env), n = 3 + L;
  const U = [...Array(n)].map((_, i) => ({ x: 200 + (i - (n - 1) / 2) * (320 / n), open: 0, want: false, flip: 0, col: ['#e8590c', '#fff', '#e8590c', '#fff', '#e8590c'][i] }));
  let wind = 0, wt = 0, gust = 0, t = 0, leaves = []; const fin = finisher(env);
  const calm = () => wind < 0.35;
  return {
    hint: { type: 'tap', x: U[0].x, y: 330 },
    update(dt) {
      t += dt; wt -= dt;
      if (wt <= 0) { gust = gust > 0.5 ? 0.1 : 0.7 + r() * 0.3; wt = gust > 0.5 ? 1.2 + r() * (1.4 + L * 0.6) : 1.1 + r() * 1.2 - L * 0.25; }
      wind = lerp(wind, gust, Math.min(1, dt * 2.5));
      if (r() < wind * 0.4) leaves.push({ x: -20, y: 120 + r() * 300, v: 200 + r() * 200, a: r() * 6 });
      leaves.forEach(l => { l.x += l.v * dt * (0.5 + wind); l.a += dt * 6; l.y += Math.sin(l.a) * 1.5; }); leaves = leaves.filter(l => l.x < 440);
      U.forEach(u => { u.open = lerp(u.open, u.want ? 1 : 0, Math.min(1, dt * 5)); u.flip = Math.max(0, u.flip - dt); if (u.want && u.open > 0.9 && wind > 0.75 && L === 2 && r() < dt * 0.4) { u.want = false; u.flip = 1; Sfx.play('bad'); } });
      if (U.every(u => u.want && u.open > 0.95)) fin.set(0.5);
      fin.tick(dt);
    },
    draw(c) {
      terraceBg(c, 300, t, wind);
      // Windmesser
      rrPath(c, 110, 140, 180, 26, 13); fs(c, '#fff', 3); const wcol = calm() ? '#06d6a0' : wind < 0.6 ? '#ffd166' : '#ef476f';
      rrPath(c, 113, 143, 174 * wind, 20, 10); c.fillStyle = wcol; c.fill(); txt(c, calm() ? 'Ruhig – jetzt!' : 'Wind!', 200, 184, 18, wcol, 'center', '#fff');
      leaves.forEach(l => { c.save(); c.translate(l.x, l.y); c.rotate(l.a); ell(c, 0, 0, 7, 3.5); fs(c, '#95c56b', 1.5); c.restore(); });
      U.forEach(u => {
        const sw = Math.sin(t * 6 + u.x) * wind * 0.12, o = u.open;
        c.save(); c.translate(u.x, 470); c.rotate(sw);
        line(c, 0, 0, 0, -200, 5, '#868e96');
        if (u.flip > 0) { c.beginPath(); c.moveTo(-44, -240); c.quadraticCurveTo(0, -190, 44, -240); c.lineTo(0, -196); c.closePath(); fs(c, u.col, 3); }
        else if (o > 0.15) { const w = 18 + 56 * o, h = 12 + 26 * o; c.beginPath(); c.moveTo(-w, -200 + h * 0.2); c.quadraticCurveTo(0, -200 - h * 1.6, w, -200 + h * 0.2); c.closePath(); fs(c, u.col, 3); for (let k = -2; k <= 2; k++) line(c, 0, -200 - h * 0.7, k * w / 2.4, -200 + h * 0.15, 1.5, 'rgba(0,0,0,.2)', false); }
        else { polyPath(c, [[-8, -230], [8, -230], [5, -150], [-5, -150]]); fs(c, u.col, 3); }
        c.restore();
        ell(c, u.x, 474, 26, 8); fs(c, '#495057', 2.5);
        if (u.want && o > 0.9) { ell(c, u.x, 500, 9, 9); fs(c, '#06d6a0', 2); }
      });
    },
    down(x) {
      if (fin.on()) return;
      const u = U.slice().sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0]; if (Math.abs(u.x - x) > 60 || u.want) return;
      if (calm()) { u.want = true; Sfx.play('open'); env.burst(u.x, 280, 8); } else { u.flip = 1.2; Sfx.play('bad'); buzz(30); }
    },
  };
} };

// 8) Wespen wegwedeln: mit der Speisekarte über die Wespen wischen, damit sie nicht ans Eis kommen
GAMES.wespen = { make(env) {
  const r = env.r, L = LVL(env), len = 16 + L * 4, IX = 200, IY = 360;
  const Wsp = []; let el = 0, ice = 1, t = 0, spawn = 0.5, last = null, fan = 0; const fin = finisher(env);
  return {
    hint: { type: 'swipe', x: 200, y: 260 },
    update(dt) {
      if (fin.on()) { fin.tick(dt); return; }
      t += dt; el += dt; spawn -= dt; fan = Math.max(0, fan - dt * 3);
      if (spawn <= 0 && Wsp.length < 3 + L * 2) { const a = r() * TAU; Wsp.push({ x: IX + Math.cos(a) * 280, y: IY - 80 + Math.sin(a) * 240, vx: 0, vy: 0, ph: r() * 6 }); spawn = 1 - L * 0.2 + r() * 0.6; }
      Wsp.forEach(w => {
        w.ph += dt * 7;
        const dx = IX - w.x, dy = IY - 40 - w.y, d = Math.hypot(dx, dy) || 1, sp = (90 + L * 30) * GAME_MOTION;
        w.vx = lerp(w.vx, dx / d * sp + Math.cos(w.ph) * 80, dt * 3); w.vy = lerp(w.vy, dy / d * sp + Math.sin(w.ph * 1.3) * 80, dt * 3);
        if (w.blown) { w.vx = w.bx; w.vy = w.by; w.blown -= dt; if (w.blown <= 0) w.blown = 0; }
        w.x += w.vx * dt; w.y += w.vy * dt;
        if (d < 34) { ice = Math.max(0, ice - dt * 0.25); if (r() < dt * 3) Sfx.note(240, 0.05, 'square', 0.02); }
      });
      for (let i = Wsp.length - 1; i >= 0; i--) { const w = Wsp[i]; if (w.x < -80 || w.x > 480 || w.y < -80 || w.y > 600) Wsp.splice(i, 1); }
      if (ice <= 0) { ice = 0.6; el = Math.max(0, el - 5); Sfx.play('bad'); }
      if (el >= len) fin.set(0.4);
      fin.tick(dt);
    },
    draw(c) {
      terraceBg(c, 260, t); progBar(c, el / len); icon(c, 'clock', 32, 33, 24);
      ell(c, IX, IY + 70, 140, 34); fs(c, '#343a40', 3); ell(c, IX, IY + 64, 134, 28); fs(c, '#495057', 1.5);
      c.save(); c.translate(IX, IY + 40); c.scale(0.8 + ice * 0.2, 0.8 + ice * 0.2); drawFood(c, 'eisbecher', 0, -30, 130); c.restore();
      for (let k = 0; k < Math.floor((1 - ice) * 6); k++) { ell(c, IX - 40 + k * 16, IY + 60, 7, 3); c.fillStyle = '#ffd6e0'; c.fill(); }
      rrPath(c, 120, 470, 160, 14, 7); fs(c, 'rgba(0,0,0,.25)', 2); rrPath(c, 122, 472, 156 * ice, 10, 5); c.fillStyle = ice > 0.5 ? '#80ed99' : '#ef476f'; c.fill();
      Wsp.forEach(w => { c.save(); c.translate(w.x, w.y); if (w.vx < 0) c.scale(-1, 1); const fl = Math.sin(t * 70) * 0.6;
        ell(c, -2, -10, 8, 5, -0.8 + fl); c.fillStyle = 'rgba(220,240,255,.85)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = OL; c.stroke();
        ell(c, 0, 0, 12, 8); fs(c, '#ffd60a', 2.5); c.save(); ell(c, 0, 0, 12, 8); c.clip(); c.fillStyle = '#212529'; c.fillRect(-6, -9, 3, 18); c.fillRect(1, -9, 3, 18); c.restore();
        ell(c, 11, -1, 4.5, 4.5); fs(c, '#212529', 1.5); line(c, -12, 0, -17, 0, 2, OL, false); c.restore(); });
      if (last && fan) { c.save(); c.translate(last.x, last.y); c.rotate(-0.4); rrPath(c, -30, -40, 60, 80, 6); fs(c, '#fbf8f2', 3); leaf(c, 0, -10, 0.8, BRAND.lime); line(c, -18, 14, 18, 14, 2, '#adb5bd', false); line(c, -18, 24, 12, 24, 2, '#adb5bd', false); c.restore(); }
    },
    down(x, y) { last = { x, y }; },
    move(x, y) {
      if (!last || fin.on()) return; const vx = x - last.x, vy = y - last.y, sp = Math.hypot(vx, vy);
      if (sp > 6) { fan = 1; Wsp.forEach(w => { if (dist(w.x, w.y, x, y) < 56 && !w.blown) { const k = 900 / sp; w.blown = 0.8; w.bx = vx * k * 0.6 + (w.x - IX) * 2; w.by = vy * k * 0.6 + (w.y - IY) * 2; env.burst(w.x, w.y, 4); Sfx.note(900, 0.06, 'sine', 0.04); } }); }
      last = { x, y };
    },
    up() { last = null; },
  };
} };

// 9) Tauben weglocken: Tippe auf den Boden, dort fallen Krümel – die Tauben laufen hin. Lock alle auf die Wiese
GAMES.tauben = { make(env) {
  const r = env.r, L = LVL(env), n = 3 + L, ZX = 300, ZY = 380, ZR = 70;
  const P = [...Array(n)].map((_, i) => ({ x: 80 + r() * 160, y: 330 + r() * 120, tx: 0, ty: 0, dir: 1, t: r() * 6, home: false, peck: 0 }));
  P.forEach(p => { p.tx = p.x; p.ty = p.y; });
  const crumbs = []; let t = 0, flyAway = 0; const fin = finisher(env);
  const inZone = p => dist(p.x, p.y, ZX, ZY) < ZR - 6;
  return {
    hint: { type: 'tap', x: 230, y: 400 },
    update(dt) {
      t += dt;
      // Tauben laufen zu den nächsten Krümeln (wenn nah genug), sonst zurück zum Tisch
      P.forEach(p => {
        p.t += dt; p.peck = Math.max(0, p.peck - dt);
        const cr = crumbs.filter(k => k.n > 0 && dist(k.x, k.y, p.x, p.y) < 170).sort((a, b) => dist(a.x, a.y, p.x, p.y) - dist(b.x, b.y, p.x, p.y))[0];
        if (cr) { p.tx = cr.x; p.ty = cr.y; if (dist(p.x, p.y, cr.x, cr.y) < 10 && p.peck <= 0) { cr.n--; p.peck = 0.35; Sfx.note(1200, 0.03, 'sine', 0.02); } }
        else if (!inZone(p)) { p.tx = lerp(p.tx, 120, dt * 0.25); p.ty = lerp(p.ty, 330, dt * 0.25); }
        const d = dist(p.x, p.y, p.tx, p.ty), s = (60 + L * 18) * dt * GAME_MOTION; if (d > 2) { p.x += (p.tx - p.x) / d * Math.min(s, d); p.y += (p.ty - p.y) / d * Math.min(s, d); if (Math.abs(p.tx - p.x) > 1) p.dir = p.tx > p.x ? 1 : -1; }
      });
      for (let i = crumbs.length - 1; i >= 0; i--) if (crumbs[i].n <= 0) crumbs.splice(i, 1);
      if (P.every(inZone) && !fin.on()) { fin.set(0.8); Sfx.play('good'); env.burst(ZX, ZY, 20); }
      fin.tick(dt);
    },
    draw(c) {
      terraceBg(c, 250, t);
      ell(c, ZX, ZY, ZR + 10, ZR * 0.8 + 8); fs(c, '#74c69d', 3); for (let k = 0; k < 30; k++) { const a = k * 2.4, rr = (k * 13) % ZR; line(c, ZX + Math.cos(a) * rr, ZY + Math.sin(a) * rr * 0.75, ZX + Math.cos(a) * rr + 2, ZY + Math.sin(a) * rr * 0.75 - 8, 2, '#40916c', false); }
      txt(c, 'Wiese', ZX, ZY + ZR * 0.8 + 22, 14, '#2d6a4f', 'center', '#fff');
      // Tisch mit Pommes
      rrPath(c, 40, 270, 140, 70, 10); fs(c, '#6c584c', 3); drawFood(c, 'flammkuchen', 110, 300, 60);
      crumbs.forEach(k => { for (let m = 0; m < k.n; m++) { ell(c, k.x + Math.cos(m * 2.1) * 6, k.y + Math.sin(m * 2.1) * 4, 2.5, 2); c.fillStyle = '#e9c46a'; c.fill(); } });
      P.slice().sort((a, b) => a.y - b.y).forEach(p => drawPigeon(c, p.x, p.y, 1.1, t * 3 + p.t, p.dir, false));
      txt(c, P.filter(inZone).length + ' / ' + n + ' auf der Wiese', 200, 36, 20, BRAND.olive, 'center', '#fff');
    },
    down(x, y) { if (fin.on() || y < 260) return; crumbs.push({ x, y, n: 4 }); if (crumbs.length > 3) crumbs.shift(); Sfx.play('tap'); },
  };
} };

// 10) Bälle zurückwerfen: Ball mit dem Finger nach oben schnippen – Stärke = Weite. Das Kind läuft hin und her
GAMES.werfen = { make(env) {
  const r = env.r, L = LVL(env), need = 4 + L * 2;
  let ball = null, got = 0, t = 0, kid = { x: 300, dir: 1 }, start = null, fx = [], wind = L === 2 ? (r() - 0.5) * 80 : 0; const fin = finisher(env);
  const reset = () => { ball = { x: 90, y: 440, vx: 0, vy: 0, fly: false, a: 0 }; };
  reset();
  return {
    hint: { type: 'swipe', x: 90, y: 440 },
    update(dt) {
      t += dt;
      kid.x += kid.dir * (40 + L * 30) * dt * GAME_MOTION; if (kid.x > 360) kid.dir = -1; if (kid.x < 210) kid.dir = 1;
      if (ball.fly) {
        ball.vy += 700 * dt; ball.vx += wind * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; ball.a += dt * 10;
        if (ball.vy > 0 && Math.abs(ball.y - 200) < 14 && Math.abs(ball.x - kid.x) < 34) { got++; Sfx.play('good'); env.burst(kid.x, 190, 14); fx.push({ t: 0, s: 'Gefangen!', ok: true }); reset(); if (got >= need) fin.set(0.5); }
        else if (ball.y > 560 || ball.x > 440 || ball.x < -40) { fx.push({ t: 0, s: 'Daneben!', ok: false }); Sfx.play('bad'); reset(); }
      }
      fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.8);
      fin.tick(dt);
    },
    draw(c) {
      terraceBg(c, 250, t);
      // Hecke + Rasen hinten
      c.fillStyle = '#74c69d'; c.fillRect(170, 200, 230, 50); for (let k = 0; k < 12; k++) { ell(c, 170 + k * 20, 236, 14, 16); fs(c, '#40916c', 2); }
      c.save(); c.translate(kid.x, 210); const kp = { skin: '#f1c7a5' }; rrPath(c, -10, -28, 20, 22, 6); fs(c, '#4dabf7', 2.5); ell(c, 0, -38, 10, 10); fs(c, kp.skin, 2.5); line(c, -10, -24, -18, -40 + Math.sin(t * 8) * 4, 4, kp.skin); line(c, 10, -24, 18, -40 - Math.sin(t * 8) * 4, 4, kp.skin); ell(c, 0, -46, 10, 5); fs(c, '#7a4a2a', 2); c.restore();
      txtGot(c, got, need);
      if (wind) txt(c, (wind > 0 ? 'Wind →' : '← Wind'), 200, 70, 16, '#118ab2', 'center', '#fff');
      c.save(); c.translate(ball.x, ball.y); c.rotate(ball.a); const s = ball.fly ? clamp(1 - (440 - ball.y) / 900, 0.6, 1) : 1; c.scale(s, s); drawItem(c, 'ball', 0, 0, 44); c.restore();
      if (!ball.fly) { ell(c, 90, 452, 26, 8); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill(); txt(c, 'Nach oben schnippen', 200, 500, 14, '#fff', 'center', OL); }
      fx.forEach(f => { c.globalAlpha = 1 - f.t / 0.8; txt(c, f.s, 200, 150 - f.t * 30, 24, f.ok ? '#80ed99' : '#ef476f', 'center', '#fff'); c.globalAlpha = 1; });
    },
    down(x, y) { if (!ball.fly && dist(x, y, ball.x, ball.y) < 120) start = { x, y, t: t }; },
    up(x, y) {
      if (!start || ball.fly || fin.on()) { start = null; return; }
      const dx = x - start.x, dy = y - start.y, dt = Math.max(0.06, t - start.t); start = null;
      if (dy > -30) return;
      const vx = clamp(dx / dt * 0.35, -420, 520), vy = clamp(dy / dt * 0.5, -720, -260);
      ball.vx = vx; ball.vy = vy; ball.fly = true; Sfx.play('jump');
    },
  };
} };

// 11) Kissen vor dem Regen retten: Regen kommt von links – Kissen in die Kissenbox ziehen, bevor sie nass werden
GAMES.kissen = { make(env) {
  const r = env.r, L = LVL(env), n = 4 + L * 2, BX = 320, BY = 430;
  const K = [...Array(n)].map((_, i) => ({ x: 40 + (i % 4) * 66 + r() * 10, y: 300 + Math.floor(i / 4) * 80 + r() * 10, hx: 0, hy: 0, wet: 0, safe: false, lost: false, col: pick(['#e63946', '#ffd166', '#4dabf7', '#f4a261', '#9b5de5'], r) }));
  K.forEach(k => { k.hx = k.x; k.hy = k.y; });
  let front = -40, t = 0, drag = null, drops = []; const fin = finisher(env);
  return {
    hint: { type: 'drag', x: K[0].x, y: K[0].y, x2: BX, y2: BY },
    update(dt) {
      t += dt; front += (16 + L * 10) * dt * GAME_MOTION * (1 + t / 30);
      for (let k = 0; k < 6 + L * 3; k++) if (r() < 0.8) drops.push({ x: r() * Math.max(0, front), y: -10 + r() * 40, v: 500 + r() * 200 });
      drops.forEach(d => (d.y += d.v * dt)); drops = drops.filter(d => d.y < 540);
      K.forEach(k => { if (k.safe || k.lost || (drag && drag.k === k)) return; if (k.x < front) { k.wet += dt * (0.5 + L * 0.2); if (k.wet >= 1) { k.lost = true; Sfx.play('bad'); } } });
      const left = K.filter(k => !k.safe && !k.lost);
      if (!left.length && !fin.on()) { if (K.filter(k => k.safe).length >= n - L) fin.set(0.4); else { K.forEach(k => { k.lost = false; k.safe = false; k.wet = 0; k.x = k.hx; k.y = k.hy; }); front = -40; Sfx.play('bad'); } }
      fin.tick(dt);
    },
    draw(c) {
      terraceBg(c, 230, t);
      c.fillStyle = 'rgba(52,58,64,.35)'; c.fillRect(0, 0, Math.max(0, front), GAME_H);
      for (let k = 0; k < 3; k++) { const cx = front - 60 - k * 90; ell(c, cx, 70 + (k % 2) * 20, 70, 32); fs(c, '#6c757d', 3); ell(c, cx + 40, 60 + (k % 2) * 20, 46, 26); fs(c, '#868e96', 0); }
      c.strokeStyle = 'rgba(160,210,255,.9)'; c.lineWidth = 2; drops.forEach(d => { c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x - 3, d.y + 12); c.stroke(); });
      // Kissenbox
      rrPath(c, BX - 60, BY - 50, 120, 90, 10); fs(c, '#8d5a3b', 3); rrPath(c, BX - 66, BY - 66, 132, 22, 8); fs(c, '#a0673a', 3); txt(c, 'Kissenbox', BX, BY - 4, 13, '#fff', 'center', null);
      K.forEach(k => { if (k.safe) return; c.save(); c.translate(k.x, k.y); if (k.lost) c.globalAlpha = 0.4; rrPath(c, -26, -18, 52, 36, 12); fs(c, k.col, 3); if (k.wet > 0) { c.fillStyle = `rgba(30,80,140,${k.wet * 0.5})`; rrPath(c, -26, -18, 52, 36, 12); c.fill(); } line(c, -14, 0, 14, 0, 2, 'rgba(255,255,255,.5)', false); c.restore(); });
      txt(c, K.filter(k => k.safe).length + ' / ' + n + ' gerettet', 200, 36, 20, BRAND.olive, 'center', '#fff');
    },
    down(x, y) { if (fin.on()) return; const k = K.filter(q => !q.safe && !q.lost).sort((a, b) => dist(x, y, a.x, a.y) - dist(x, y, b.x, b.y))[0]; if (k && dist(x, y, k.x, k.y) < 46) { drag = { k, ox: k.x - x, oy: k.y - y }; Sfx.play('tap'); } },
    move(x, y) { if (drag) { drag.k.x = x + drag.ox; drag.k.y = y + drag.oy; } },
    up() { if (!drag) return; const k = drag.k; drag = null; if (Math.abs(k.x - BX) < 70 && Math.abs(k.y - BY) < 70) { k.safe = true; Sfx.play('good'); env.burst(BX, BY - 40, 10); } },
  };
} };

Object.assign(HELP_TEXT, {
  servietten: 'Der rote Pfeil zeigt, wie die Serviette gefaltet wird. Wisch in diese Richtung über die Serviette.',
  tablett: 'Halte die Gläser auf dem Tablett! Leg den Finger links oder rechts hin, dann kippt das Tablett. Pass auf, wenn jemand anrempelt.',
  sonnenstrahl: 'Tippe die Spiegel an, damit sie sich drehen. Lenk den Sonnenstrahl so, dass er die Palme trifft.',
  fliegen: 'Fliegen wollen ans Essen! Tippe die Fliegen an, aber nicht aufs Essen.',
  musikbox: 'Die Noten fliegen herunter. Tippe genau dann auf den Kreis, wenn die Note auf der gelben Linie ist.',
  einschenken: 'Halte den Finger gedrückt, dann läuft das Getränk ins Glas. Lass los, wenn es genau bis zum grünen Strich voll ist.',
  schirme: 'Tippe auf einen Schirm, um ihn aufzuspannen – aber nur, wenn der Wind ruhig ist. Sonst klappt er um.',
  wespen: 'Die Wespen wollen ans Eis! Wisch mit dem Finger über die Wespen, dann fliegen sie weg – bis die Zeit-Leiste voll ist.',
  tauben: 'Tippe auf den Boden, dann fallen dort Krümel. Die Tauben laufen hin. Lock alle Tauben auf die Wiese.',
  werfen: 'Schnipp den Ball mit dem Finger nach oben. Je schneller du wischst, desto weiter fliegt er. Das Kind soll ihn fangen.',
  kissen: 'Der Regen kommt! Zieh die Kissen schnell in die Kissenbox, bevor sie nass werden.',
});
