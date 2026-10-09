'use strict';
// ---------- Neue Aufgaben für das Chalet (Winter) und den Parkplatz ----------
function chaletBg(c, floor = 330, t = 0, snow = true) {
  c.fillStyle = '#8d5a3b'; c.fillRect(0, 0, GAME_W, floor);
  for (let y = 0, k = 0; y < floor; y += 34, k++) { rrPath(c, -4, y, GAME_W + 8, 32, 4); fs(c, k % 2 ? '#9c6644' : '#a0673a', 1.5); for (let x = (k * 53) % 90; x < GAME_W; x += 90) { ell(c, x, y + 16, 3, 2); c.fillStyle = 'rgba(60,30,15,.4)'; c.fill(); } }
  // Fenster mit Schneetreiben
  rrPath(c, 250, 30, 120, 100, 6); fs(c, '#1d3557', 4); c.save(); rrPath(c, 254, 34, 112, 92, 4); c.clip();
  for (let k = 0; k < 3; k++) { polyPath(c, [[260 + k * 40, 126], [280 + k * 40, 70], [300 + k * 40, 126]]); c.fillStyle = '#2d6a4f'; c.fill(); }
  if (snow) for (let k = 0; k < 24; k++) { ell(c, 254 + ((k * 37 + t * 20) % 112), 34 + ((k * 23 + t * 40) % 92), 1.8, 1.8); c.fillStyle = '#fff'; c.fill(); }
  c.restore(); line(c, 310, 30, 310, 130, 4, '#5c3d2e'); line(c, 250, 80, 370, 80, 4, '#5c3d2e');
  // Lichterkette
  c.beginPath(); c.moveTo(0, 14); c.quadraticCurveTo(100, 40, 200, 14); c.quadraticCurveTo(300, 40, 400, 14); c.lineWidth = 1.5; c.strokeStyle = '#3d2c1f'; c.stroke();
  for (let k = 0; k < 12; k++) { const x = 16 + k * 33, y = 14 + Math.sin((x % 200) / 200 * Math.PI) * 20; ell(c, x, y + 4, 4, 5); c.fillStyle = `rgba(255,214,90,${0.6 + 0.4 * Math.sin(t * 3 + k)})`; c.fill(); }
  c.fillStyle = '#d4a373'; c.fillRect(0, floor, GAME_W, GAME_H - floor);
  for (let x = 0; x < GAME_W; x += 50) line(c, x, floor, x, GAME_H, 2, 'rgba(90,60,35,.3)', false);
}
function snowBg(c, t = 0, horizon = 160) {
  const sky = c.createLinearGradient(0, 0, 0, horizon); sky.addColorStop(0, '#a5c8e4'); sky.addColorStop(1, '#e7f5ff'); c.fillStyle = sky; c.fillRect(0, 0, GAME_W, horizon);
  for (let k = 0; k < 6; k++) { const x = 20 + k * 72; polyPath(c, [[x - 26, horizon], [x, horizon - 70 - (k % 2) * 20], [x + 26, horizon]]); fs(c, '#2d6a4f', 2.5); polyPath(c, [[x - 12, horizon - 40], [x, horizon - 70 - (k % 2) * 20], [x + 12, horizon - 40]]); c.fillStyle = '#fff'; c.fill(); }
  c.fillStyle = '#f8f9fa'; c.fillRect(0, horizon, GAME_W, GAME_H - horizon);
  c.fillStyle = 'rgba(165,200,228,.35)'; for (let k = 0; k < 5; k++) { ell(c, (k * 97) % 400, horizon + 60 + k * 70, 90, 16); c.fill(); }
  for (let k = 0; k < 30; k++) { ell(c, (k * 53 + Math.sin(t + k) * 10) % 400, (k * 31 + t * 30) % GAME_H, 2, 2); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); }
}
function asphaltBg(c, t = 0) {
  c.fillStyle = '#6c757d'; c.fillRect(0, 0, GAME_W, GAME_H);
  for (let i = 0; i < 500; i++) { c.fillStyle = i % 2 ? '#737b83' : '#62696f'; c.fillRect((i * 97.1) % 400, (i * 57.3) % 520, 2, 2); }
}
function drawCar(c, x, y, a, col, s = 1, o = {}) {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.25)'; rrPath(c, -24, -40, 52, 86, 16); c.fill();
  rrPath(c, -26, -46, 52, 92, 16); fs(c, col, 3);
  rrPath(c, -20, -28, 40, 20, 6); fs(c, '#5a6f7d', 2); rrPath(c, -20, 14, 40, 16, 6); fs(c, '#5a6f7d', 2);
  rrPath(c, -18, -6, 36, 18, 4); c.fillStyle = 'rgba(255,255,255,.18)'; c.fill();
  ell(c, -16, -44, 5, 3); c.fillStyle = o.lights ? '#fff3bf' : '#fff'; c.fill(); ell(c, 16, -44, 5, 3); c.fill();
  ell(c, -16, 45, 5, 2.5); c.fillStyle = o.brake ? '#ff4d4d' : '#c1121f'; c.fill(); ell(c, 16, 45, 5, 2.5); c.fill();
  if (o.mine) { leaf(c, 0, 4, 0.7, BRAND.lime); }
  c.restore();
}

// ===== Chalet =====
// 1) Fondue: Die Gabel kreist um den Topf. Halten = eintunken (nur über dem Käse!), loslassen, wenn das Brot gelb ist
GAMES.fondue = { make(env) {
  const r = env.r, L = LVL(env), need = 4 + L * 2, PX = 200, PY = 350;
  let a = 0, sp = 1.2 + L * 0.5, dip = 0, hold = false, coat = 0, got = 0, burn = 0, drop = 0, t = 0, fx = [], strings = []; const fin = finisher(env);
  const fork = () => ({ x: PX + Math.cos(a) * 120, y: PY - 40 + Math.sin(a) * 40 });
  const overPot = () => Math.abs(Math.cos(a)) < 0.62;
  return {
    hint: { type: 'tap', x: PX, y: PY - 80 },
    update(dt) {
      t += dt; a += sp * dt * (1 + got / need * 0.4) * GAME_MOTION; burn = Math.max(0, burn - dt); drop = Math.max(0, drop - dt);
      dip = lerp(dip, hold ? 1 : 0, Math.min(1, dt * 10));
      if (hold && dip > 0.7) {
        if (overPot()) { coat += dt * (0.7 + L * 0.15); if (coat > 1.35) { coat = 0; drop = 0.8; hold = false; Sfx.play('bad'); fx.push({ t: 0, s: 'Ins Fondue gefallen!' }); } }
        else { burn = 0.6; coat = Math.max(0, coat - dt); if (r() < dt * 6) Sfx.note(180, 0.06, 'sawtooth', 0.02); }
      }
      strings.forEach(s2 => (s2.t += dt)); strings = strings.filter(s2 => s2.t < 0.7);
      fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.9);
      fin.tick(dt);
    },
    draw(c) {
      chaletBg(c, 250, t);
      txtGot(c, got, need, '#ffd166');
      // Rechaud mit Flamme
      rrPath(c, PX - 70, PY + 30, 140, 70, 10); fs(c, '#343a40', 3);
      for (let k = 0; k < 5; k++) { const fx2 = PX - 40 + k * 20, h = 18 + Math.sin(t * 14 + k) * 6; polyPath(c, [[fx2 - 8, PY + 34], [fx2, PY + 34 - h], [fx2 + 8, PY + 34]]); c.fillStyle = k % 2 ? '#ffd166' : '#f77f00'; c.fill(); }
      // Topf mit Käse
      const back = Math.sin(a) < 0;
      const drawFork = () => { const f = fork(), fy = f.y + dip * 50; line(c, f.x + 30, fy - 120, f.x, fy - 10, 4, '#adb5bd'); rrPath(c, f.x + 24, fy - 140, 14, 34, 5); fs(c, '#e63946', 2.5);
        rrPath(c, f.x - 12, fy - 12, 24, 22, 6); fs(c, coat > 0.75 ? '#ffd166' : coat > 0.3 ? '#f6d38d' : '#e9c46a', 2.5); if (coat > 0.3) { ell(c, f.x, fy + 6, 10, 4); c.fillStyle = '#ffd166'; c.fill(); }
        if (burn) for (let k = 0; k < 3; k++) { ell(c, f.x - 8 + k * 8, fy - 20 - ((t * 40 + k * 10) % 20), 5, 4); c.fillStyle = 'rgba(80,80,80,.5)'; c.fill(); } };
      if (back) drawFork();
      ell(c, PX, PY + 30, 92, 26); fs(c, '#9d0208', 3); rrPath(c, PX - 92, PY - 20, 184, 50, 20); fs(c, '#c1121f', 3);
      ell(c, PX, PY - 20, 92, 24); fs(c, '#9d0208', 3); ell(c, PX, PY - 18, 80, 18); fs(c, '#ffd166', 2);
      for (let k = 0; k < 4; k++) { const bx = PX - 50 + ((k * 37 + t * 20) % 100); ell(c, bx, PY - 18 + Math.sin(t * 4 + k) * 3, 6, 3); c.fillStyle = '#ffe066'; c.fill(); }
      rrPath(c, PX - 80, PY - 34, 160, 10, 5); c.fillStyle = 'rgba(6,214,160,.0)'; c.fill();
      if (!back) drawFork();
      strings.forEach(s2 => { c.globalAlpha = 1 - s2.t / 0.7; c.beginPath(); c.moveTo(s2.x, s2.y); c.quadraticCurveTo(s2.x + 10, s2.y + 40 + s2.t * 40, PX, PY - 20); c.lineWidth = 3; c.strokeStyle = '#ffd166'; c.stroke(); c.globalAlpha = 1; });
      // Brot-Leiste
      rrPath(c, 100, 480, 200, 16, 8); fs(c, 'rgba(0,0,0,.3)', 2); rrPath(c, 100 + 200 * 0.55, 480, 200 * 0.3, 16, 6); c.fillStyle = 'rgba(6,214,160,.6)'; c.fill(); ell(c, 100 + 200 * clamp(coat / 1.35, 0, 1), 488, 9, 9); fs(c, '#ffd166', 2.5);
      if (burn) txt(c, 'Nicht ins Feuer!', 200, 200, 22, '#ef476f', 'center', '#fff');
      fx.forEach(f => { c.globalAlpha = 1 - f.t / 0.9; txt(c, f.s, 200, 170 - f.t * 30, 20, f.ok ? '#80ed99' : '#ef476f', 'center', '#fff'); c.globalAlpha = 1; });
    },
    down() { if (fin.on() || drop) return; hold = true; Sfx.note(260, 0.06, 'sine', 0.03); },
    up() {
      if (!hold) return; hold = false;
      if (coat >= 0.55 * 1.35 && coat <= 0.85 * 1.35) { got++; const f = fork(); strings.push({ x: f.x, y: f.y + 30, t: 0 }); coat = 0; Sfx.play('good'); env.burst(f.x, f.y + 20, 12); fx.push({ t: 0, s: 'Lecker!', ok: true }); if (got >= need) fin.set(0.5); }
    },
  };
} };

// 2) Holz hacken: Der Holzklotz wackelt. Wisch nach unten, wenn er gerade steht (grün)
GAMES.holzhacken = { make(env) {
  const r = env.r, L = LVL(env), need = 5 + L * 2;
  let ang = 0, av = 0, t = 0, got = 0, axe = 0, bounce = 0, halves = [], start = null, ph = 0; const fin = finisher(env);
  const upright = () => Math.abs(ang) < 0.16 - L * 0.035;
  return {
    hint: { type: 'swipe', x: 200, y: 250 },
    update(dt) {
      t += dt; ph += dt * (1.8 + L * 0.8 + got * 0.1) * GAME_MOTION;
      ang = Math.sin(ph) * 0.55 + Math.sin(ph * 2.7) * 0.12 * L;
      axe = Math.max(0, axe - dt * 4); bounce = Math.max(0, bounce - dt * 2);
      halves.forEach(h => { h.vy += 900 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.a += h.va * dt; }); halves = halves.filter(h => h.y < 600);
      fin.tick(dt);
    },
    draw(c) {
      snowBg(c, t, 200); txtGot(c, got, need);
      for (let k = 0; k < got; k++) { rrPath(c, 20 + (k % 6) * 22, 470 - Math.floor(k / 6) * 16, 20, 14, 4); fs(c, '#c08b55', 2); }
      rrPath(c, 140, 380, 120, 70, 10); fs(c, '#8d5a3b', 3); ell(c, 200, 380, 60, 16); fs(c, '#d4a373', 3); for (let k = 1; k < 4; k++) { ell(c, 200, 380, k * 14, k * 4); c.lineWidth = 1.2; c.strokeStyle = 'rgba(120,80,40,.5)'; c.stroke(); }
      c.save(); c.translate(200, 376); c.rotate(ang); rrPath(c, -26, -110, 52, 110, 10); fs(c, upright() ? '#c08b55' : '#b07d4b', 3); ell(c, 0, -110, 26, 8); fs(c, '#e9c46a', 2.5); line(c, 0, -104, 0, -10, 1.5, 'rgba(90,60,30,.4)', false); c.restore();
      ell(c, 200, 240, 36, 10); c.fillStyle = upright() ? 'rgba(6,214,160,.6)' : 'rgba(239,71,111,.35)'; c.fill();
      halves.forEach(h => { c.save(); c.translate(h.x, h.y); c.rotate(h.a); rrPath(c, -13, -50, 26, 100, 6); fs(c, '#c08b55', 2.5); c.restore(); });
      // Axt
      c.save(); c.translate(330, 200); c.rotate(-1.2 + axe * 1.4 - bounce * 0.4 + Math.sin(t * 3) * 0.05); line(c, 0, 0, 0, -150, 8, '#8d5a3b'); polyPath(c, [[-6, -130], [-46, -150], [-42, -110], [-6, -118]]); fs(c, '#adb5bd', 3); c.restore();
      if (bounce) txt(c, 'Abgerutscht!', 200, 160, 22, '#ef476f', 'center', '#fff');
    },
    down(x, y) { start = { x, y }; },
    up(x, y) {
      if (!start || fin.on()) { start = null; return; } const dy = y - start.y; start = null; if (dy < 50) return;
      axe = 1;
      if (upright()) { got++; Sfx.play('hit'); env.burst(200, 300, 14); halves.push({ x: 186, y: 320, vx: -180, vy: -260, a: 0, va: -4 }, { x: 214, y: 320, vx: 180, vy: -260, a: 0, va: 4 }); ph = r() * 6; if (got >= need) fin.set(0.6); }
      else { bounce = 1; Sfx.play('bad'); buzz(30); }
    },
  };
} };

// 3) Kaminfeuer: Nach oben über die Glut wischen = Blasebalg. Fliegende Funken antippen, bevor sie auf den Teppich fallen
GAMES.kaminfeuer = { make(env) {
  const r = env.r, L = LVL(env), len = 16 + L * 4;
  let fire = 0.5, el = 0, t = 0, last = null, sparks = [], burns = [], st = 0.8; const fin = finisher(env);
  return {
    hint: { type: 'swipe', x: 200, y: 300 },
    update(dt) {
      if (fin.on()) { fin.tick(dt); return; }
      t += dt; fire = Math.max(0, fire - dt * (0.09 + L * 0.03));
      if (fire > 0.45) el += dt; else el = Math.max(0, el - dt * 0.5);
      st -= dt; if (st <= 0 && fire > 0.3) { sparks.push({ x: 200 + (r() - 0.5) * 80, y: 290, vx: (r() - 0.5) * 220, vy: -200 - r() * 120, t: 0 }); st = (1.1 - L * 0.25 - fire * 0.3) * (0.6 + r() * 0.8); }
      sparks.forEach(s => { s.vy += 260 * dt; s.x += s.vx * dt * GAME_MOTION; s.y += s.vy * dt * GAME_MOTION; s.t += dt; });
      for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; if (s.y > 470) { burns.push({ x: s.x, y: 476, t: 0 }); sparks.splice(i, 1); el = Math.max(0, el - 2); Sfx.play('bad'); } }
      burns.forEach(b => (b.t += dt)); burns = burns.filter(b => b.t < 2);
      if (el >= len) fin.set(0.4);
      fin.tick(dt);
    },
    draw(c) {
      chaletBg(c, 440, t); progBar(c, el / len, 22, '#f77f00'); icon(c, 'clock', 32, 33, 24);
      // Kamin aus Stein
      rrPath(c, 60, 120, 280, 320, 14); fs(c, '#adb5bd', 3); for (let k = 0; k < 18; k++) { rrPath(c, 66 + (k % 5) * 54 + (Math.floor(k / 5) % 2) * 20, 126 + Math.floor(k / 5) * 40, 48, 34, 8); fs(c, ['#ced4da', '#adb5bd', '#dee2e6'][k % 3], 1.5); }
      rrPath(c, 110, 220, 180, 200, 50); fs(c, '#212529', 3);
      for (let k = 0; k < 3; k++) { rrPath(c, 140 + k * 20, 380 - k * 10, 120 - k * 30, 18, 8); fs(c, '#6c4f3d', 2); }
      const H = 30 + fire * 130;
      for (let k = 0; k < 7; k++) { const fx = 140 + k * 20, h = H * (0.6 + 0.4 * Math.sin(t * 9 + k * 1.7)); c.beginPath(); c.moveTo(fx - 16, 380); c.quadraticCurveTo(fx - 10, 380 - h * 0.6, fx + Math.sin(t * 7 + k) * 6, 380 - h); c.quadraticCurveTo(fx + 12, 380 - h * 0.6, fx + 16, 380); c.closePath(); c.fillStyle = k % 2 ? '#f77f00' : '#ffd166'; c.fill(); }
      ell(c, 200, 400, 90, 14); c.fillStyle = `rgba(255,120,40,${0.3 + fire * 0.5})`; c.fill();
      rrPath(c, 40, 460, 320, 50, 20); fs(c, '#9d0208', 3); for (let k = 0; k < 6; k++) line(c, 60 + k * 50, 470, 60 + k * 50, 500, 3, 'rgba(255,255,255,.3)', false);
      burns.forEach(b => { ell(c, b.x, b.y + 10, 12, 5); c.fillStyle = `rgba(30,20,10,${0.7 * (1 - b.t / 2)})`; c.fill(); });
      sparks.forEach(s => { ell(c, s.x, s.y, 7, 7); c.fillStyle = '#ffd166'; c.fill(); ell(c, s.x, s.y, 12, 12); c.fillStyle = 'rgba(255,160,40,.35)'; c.fill(); });
      rrPath(c, 360, 200, 22, 200, 11); fs(c, 'rgba(0,0,0,.3)', 2); rrPath(c, 363, 203 + 194 * (1 - fire), 16, 194 * fire, 8); c.fillStyle = fire > 0.45 ? '#f77f00' : '#adb5bd'; c.fill(); line(c, 356, 203 + 194 * 0.55, 386, 203 + 194 * 0.55, 2, '#fff', false);
    },
    down(x, y) {
      if (fin.on()) return;
      const s = sparks.sort((a, b) => dist(x, y, a.x, a.y) - dist(x, y, b.x, b.y))[0];
      if (s && dist(x, y, s.x, s.y) < 40) { sparks.splice(sparks.indexOf(s), 1); Sfx.play('pop'); env.burst(s.x, s.y, 6); last = null; return; }
      last = { x, y };
    },
    move(x, y) {
      if (!last || fin.on()) return; const dy = last.y - y;
      if (dy > 0 && Math.abs(x - 200) < 140 && y > 180) { fire = Math.min(1, fire + dy * 0.0028); if (r() < 0.2) Sfx.note(120 + fire * 80, 0.08, 'sawtooth', 0.02); }
      last = { x, y };
    },
    up() { last = null; },
  };
} };

// 4) Schneeball-Zielwurf: Schnipp den Schneeball nach oben – triff die Schneemänner, die hin und her rutschen
GAMES.schneeball = { make(env) {
  const r = env.r, L = LVL(env), need = 5 + L * 2;
  const S = [0, 1, 2].slice(0, 2 + (L ? 1 : 0)).map(i => ({ y: 210 - i * 50, x: 80 + r() * 240, dir: r() < 0.5 ? 1 : -1, sp: 60 + i * 20 + L * 30, hit: 0, s: 1 - i * 0.18 }));
  let ball = null, got = 0, t = 0, start = null, fx = []; const fin = finisher(env);
  return {
    hint: { type: 'swipe', x: 200, y: 460 },
    update(dt) {
      t += dt;
      S.forEach(s => { s.x += s.dir * s.sp * dt * GAME_MOTION; if (s.x > 340) s.dir = -1; if (s.x < 60) s.dir = 1; s.hit = Math.max(0, s.hit - dt); });
      if (ball) {
        ball.t += dt; const k = ball.t / ball.dur; ball.x = ball.x0 + ball.vx * ball.t; ball.y = lerp(470, ball.ty, k) - Math.sin(k * Math.PI) * 60;
        if (k >= 1) { const s = S.find(q => Math.abs(q.y - ball.ty) < 2 && Math.abs(q.x - ball.x) < 30 * q.s); if (s) { s.hit = 0.6; got++; Sfx.play('good'); env.burst(s.x, s.y - 40 * s.s, 12); if (got >= need) fin.set(0.5); } else { Sfx.note(200, 0.1, 'sine', 0.05); fx.push({ x: ball.x, y: ball.ty, t: 0 }); } ball = null; }
      }
      fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.6);
      fin.tick(dt);
    },
    draw(c) {
      snowBg(c, t, 120); txtGot(c, got, need);
      S.slice().reverse().forEach(s => { c.save(); c.translate(s.x, s.y); c.scale(s.s, s.s); if (s.hit) c.rotate(Math.sin(s.hit * 30) * 0.2);
        ell(c, 0, 0, 30, 9); c.fillStyle = 'rgba(0,0,0,.1)'; c.fill(); ell(c, 0, -22, 26, 24); fs(c, '#fff', 3); ell(c, 0, -58, 19, 18); fs(c, '#fff', 3); ell(c, 0, -86, 13, 13); fs(c, '#fff', 3);
        ell(c, -4, -88, 2, 2); c.fillStyle = OL; c.fill(); ell(c, 4, -88, 2, 2); c.fill(); polyPath(c, [[0, -85], [14, -82], [0, -80]]); fs(c, '#f77f00', 1.5);
        if (!s.hit) { rrPath(c, -12, -112, 24, 16, 3); fs(c, '#212529', 2.5); rrPath(c, -17, -98, 34, 5, 2); fs(c, '#212529', 2); } else { rrPath(c, 10, -130 - s.hit * 40, 24, 16, 3); fs(c, '#212529', 2.5); }
        line(c, -16, -58, -36, -72, 3, '#8d5a3b'); line(c, 16, -58, 36, -72, 3, '#8d5a3b'); c.restore(); });
      fx.forEach(f => { for (let k = 0; k < 6; k++) { ell(c, f.x + Math.cos(k) * f.t * 40, f.y + Math.sin(k) * f.t * 20, 4, 4); c.fillStyle = `rgba(255,255,255,${1 - f.t / 0.6})`; c.fill(); } });
      if (ball) { const sc = 1 - (ball.t / ball.dur) * 0.6; ell(c, ball.x, ball.y, 14 * sc, 14 * sc); fs(c, '#fff', 2.5); }
      else { ell(c, 200, 470, 16, 16); fs(c, '#fff', 3); txt(c, 'Nach oben schnippen', 200, 506, 13, '#495057', 'center', '#fff'); }
    },
    down(x, y) { if (!ball && y > 360) start = { x, y, t }; },
    up(x, y) {
      if (!start || ball || fin.on()) { start = null; return; } const dx = x - start.x, dy = y - start.y, dt2 = Math.max(0.05, t - start.t); start = null; if (dy > -40) return;
      const sp = Math.min(1, -dy / dt2 / 1800), row = S.length === 3 ? (sp > 0.75 ? 2 : sp > 0.45 ? 1 : 0) : (sp > 0.55 ? 1 : 0);
      const dur = 0.45 + row * 0.12; ball = { x0: 200, x: 200, y: 470, ty: S[row].y, vx: (dx / dt2) * 0.4 / 1, t: 0, dur }; ball.vx = clamp(ball.vx, -400, 400); Sfx.play('jump');
    },
  };
} };

// 5) Rutschiges Eis: Wisch in eine Richtung – die Figur rutscht, bis sie an etwas stößt. Bring sie zur Tasse Kakao
GAMES.eisrutsch = { make(env) {
  const r = env.r, L = LVL(env), N = 6 + (L === 2 ? 1 : 0), cs = 300 / N, ox = 50, oy = 140, minMoves = 3 + L;
  let B, S, G, best;
  const slide = (B, x, y, dx, dy) => { while (true) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N || B[ny * N + nx]) return [x, y]; x = nx; y = ny; } };
  const solve = (B, sx, sy, gx, gy) => { const Q = [[sx, sy, 0]], seen = new Set([sx + ',' + sy]); while (Q.length) { const [x, y, d] = Q.shift(); if (x === gx && y === gy) return d; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const [nx, ny] = slide(B, x, y, dx, dy); if (!seen.has(nx + ',' + ny)) { seen.add(nx + ',' + ny); Q.push([nx, ny, d + 1]); } } } return -1; };
  for (let g = 0; g < 600; g++) {
    B = new Array(N * N).fill(0); const nr = 5 + L * 2 + ri(0, 2, r); for (let k = 0; k < nr; k++) B[ri(0, N * N - 1, r)] = 1;
    S = [ri(0, N - 1, r), N - 1]; G = [ri(0, N - 1, r), ri(0, 2, r)]; if (B[S[1] * N + S[0]] || B[G[1] * N + G[0]] || (S[0] === G[0] && S[1] === G[1])) continue;
    // Ziel muss ein "Halt" sein: daneben Stein oder Rand in mindestens einer Richtung – das prüft der Löser
    best = solve(B, S[0], S[1], G[0], G[1]); if (best >= minMoves) break;
  }
  let px = S[0], py = S[1], ax = px, ay = py, moving = false, moves = 0, t = 0, start = null, bump = 0; const fin = finisher(env);
  return {
    hint: { type: 'swipe', x: ox + (px + 0.5) * cs, y: oy + (py + 0.5) * cs },
    update(dt) {
      t += dt; bump = Math.max(0, bump - dt * 3);
      if (moving) { const tx = px, ty = py, d = dist(ax, ay, tx, ty), s = dt * 14; if (d <= s) { ax = tx; ay = ty; moving = false; Sfx.note(400, 0.05, 'sine', 0.04); if (px === G[0] && py === G[1]) { Sfx.play('good'); env.burst(ox + (px + 0.5) * cs, oy + (py + 0.5) * cs, 20); fin.set(0.6); } } else { ax += (tx - ax) / d * s; ay += (ty - ay) / d * s; } }
      fin.tick(dt);
    },
    draw(c) {
      snowBg(c, t, 100);
      txt(c, 'Züge: ' + moves + (L === 2 ? ' (gut: ' + best + ')' : ''), 200, 40, 18, BRAND.olive, 'center', '#fff');
      rrPath(c, ox - 8, oy - 8, N * cs + 16, N * cs + 16, 12); fs(c, '#a5d8ff', 3);
      for (let i = 0; i < N * N; i++) { const x = ox + (i % N) * cs, y = oy + Math.floor(i / N) * cs; c.fillStyle = (i + Math.floor(i / N)) % 2 ? 'rgba(255,255,255,.45)' : 'rgba(255,255,255,.25)'; c.fillRect(x, y, cs, cs); }
      for (let k = 0; k < 8; k++) line(c, ox + ((k * 47 + t * 10) % (N * cs)), oy + (k * 61) % (N * cs), ox + ((k * 47 + t * 10) % (N * cs)) + 18, oy + (k * 61) % (N * cs) - 6, 2, 'rgba(255,255,255,.7)', false);
      B.forEach((b, i) => { if (!b) return; const x = ox + (i % N + 0.5) * cs, y = oy + (Math.floor(i / N) + 0.5) * cs; ell(c, x, y + 4, cs * 0.42, cs * 0.34); fs(c, '#868e96', 3); ell(c, x - 4, y - 2, cs * 0.3, cs * 0.18); c.fillStyle = '#fff'; c.fill(); });
      const gx = ox + (G[0] + 0.5) * cs, gy = oy + (G[1] + 0.5) * cs; ell(c, gx, gy + cs * 0.2, cs * 0.3, cs * 0.1); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill(); rrPath(c, gx - cs * 0.22, gy - cs * 0.2, cs * 0.44, cs * 0.4, 6); fs(c, '#e63946', 2.5); ell(c, gx, gy - cs * 0.2, cs * 0.22, cs * 0.07); c.fillStyle = '#6f4e37'; c.fill();
      for (let k = 0; k < 2; k++) { ell(c, gx - 4 + k * 8, gy - cs * 0.4 - ((t * 20 + k * 8) % 14), 3, 4); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); }
      const kx = ox + (ax + 0.5) * cs + (bump ? Math.sin(t * 60) * 3 : 0), ky = oy + (ay + 0.5) * cs;
      c.save(); c.translate(kx, ky + cs * 0.2); c.rotate(moving ? Math.sin(t * 20) * 0.15 : 0); drawAnimal(c, env.kind || 'dog', 0, 0, cs / 62, { t, moving, dir: 1, cap: false }); c.restore();
    },
    down(x, y) { start = { x, y }; },
    up(x, y) {
      if (!start || moving || fin.on()) { start = null; return; } const dx = x - start.x, dy = y - start.y; start = null; if (Math.hypot(dx, dy) < 30) return;
      const d = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)], [nx, ny] = slide(B, px, py, d[0], d[1]);
      if (nx === px && ny === py) { bump = 1; Sfx.play('bad'); return; }
      px = nx; py = ny; moving = true; moves++; Sfx.note(300, 0.15, 'sine', 0.04, 1.6);
    },
  };
} };

// 6) Eisstockschießen: Stein mit Schwung nach oben schieben – er gleitet übers Eis. Bleib im Zielkreis liegen
GAMES.eisstock = { make(env) {
  const r = env.r, L = LVL(env), need = 3 + L, TY0 = 130;
  let st = null, got = 0, t = 0, start = null, tx = 200, fx = [], slope = L === 2 ? (r() - 0.5) * 60 : 0; const fin = finisher(env);
  const reset = () => { st = { x: 200, y: 470, vx: 0, vy: 0, go: false, a: 0 }; };
  reset();
  return {
    hint: { type: 'swipe', x: 200, y: 470 },
    update(dt) {
      t += dt; const TX = 200 + (L ? Math.sin(t * (0.6 + L * 0.3)) * (60 + L * 20) * GAME_MOTION : 0); tx = TX;
      if (st.go) {
        st.vx += slope * dt; st.x += st.vx * dt; st.y += st.vy * dt; st.a += st.vx * dt * 0.02;
        const v = Math.hypot(st.vx, st.vy), f = Math.max(0, v - 160 * dt); if (v > 0) { st.vx *= f / v; st.vy *= f / v; }
        if (st.x < 30 || st.x > 370) st.vx *= -0.6;
        if (v < 4 || st.y < -30) {
          const d = dist(st.x, st.y, tx, TY0);
          if (d < 28) { got++; Sfx.play('good'); env.burst(st.x, st.y, 16); fx.push({ t: 0, s: d < 12 ? 'Volltreffer!' : 'Im Ziel!', ok: true }); if (got >= need) fin.set(0.5); }
          else { Sfx.play('bad'); fx.push({ t: 0, s: st.y < TY0 ? 'Zu weit!' : 'Zu kurz!', ok: false }); }
          reset();
        }
      }
      fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.9);
      fin.tick(dt);
    },
    draw(c) {
      c.fillStyle = '#dbe4ee'; c.fillRect(0, 0, GAME_W, GAME_H); const g = c.createLinearGradient(0, 0, 0, GAME_H); g.addColorStop(0, '#d0ebff'); g.addColorStop(1, '#e7f5ff'); rrPath(c, 20, 0, 360, GAME_H, 0); c.fillStyle = g; c.fill();
      for (let k = 0; k < 10; k++) line(c, 30 + (k * 37) % 340, (k * 71) % 500, 60 + (k * 37) % 340, (k * 71) % 500 + 20, 1.5, 'rgba(255,255,255,.8)', false);
      txtGot(c, got, need);
      if (slope) txt(c, slope > 0 ? 'Eis fällt nach rechts →' : '← Eis fällt nach links', 200, 70, 14, '#118ab2', 'center', '#fff');
      for (const [rr, col] of [[44, '#4dabf7'], [30, '#fff'], [16, '#ef476f']]) { ell(c, tx, TY0, rr, rr * 0.55); fs(c, col, 2.5); }
      line(c, 40, 440, 360, 440, 3, 'rgba(239,71,111,.6)', false);
      if (st.y < 600) { c.save(); c.translate(st.x, st.y); ell(c, 0, 6, 24, 10); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill(); ell(c, 0, 0, 22, 14); fs(c, '#6c757d', 3); ell(c, 0, -4, 16, 8); fs(c, '#1c7ed6', 2); c.rotate(st.a); line(c, 0, -4, 0, -26, 6, '#8d5a3b'); c.restore(); }
      if (start && !st.go) { line(c, st.x, st.y, start.cx, start.cy, 3, 'rgba(255,255,255,.8)', false); }
      fx.forEach(f => { c.globalAlpha = 1 - f.t / 0.9; txt(c, f.s, 200, 280 - f.t * 30, 24, f.ok ? '#2b9348' : '#ef476f', 'center', '#fff'); c.globalAlpha = 1; });
      if (!st.go) txt(c, 'Mit Schwung nach oben wischen', 200, 506, 13, '#495057', 'center', '#fff');
    },
    down(x, y) { if (!st.go && y > 300) start = { x, y, t, cx: x, cy: y }; },
    move(x, y) { if (start) { start.cx = x; start.cy = y; } },
    up(x, y) {
      if (!start || st.go || fin.on()) { start = null; return; } const dx = x - start.x, dy = y - start.y, dt2 = Math.max(0.06, t - start.t); start = null; if (dy > -30) return;
      const vy = clamp(dy / dt2 * 0.55, -900, -150), vx = clamp(dx / dt2 * 0.35, -200, 200); st.vx = vx; st.vy = vy; st.go = true; Sfx.note(160, 0.4, 'sawtooth', 0.02, 0.6);
    },
  };
} };

// ===== Parkplatz =====
// 7) Einparken: Zieh das Auto mit dem Finger in die freie Lücke – ohne andere Autos zu berühren
GAMES.einparken = { make(env) {
  const r = env.r, L = LVL(env), need = 2 + L;
  const COLS = ['#e9ecef', '#adb5bd', '#e63946', '#343a40', '#4dabf7', '#ffd166', '#8d99ae'];
  let car, slots, gap, drag = null, got = 0, t = 0, hitT = 0, passer = null, pt = 2; const fin = finisher(env);
  const mk = () => { const n = 5, gi = ri(0, n - 1, r), sw = 300 / n * (1.0 - L * 0.05); slots = [...Array(n)].map((_, i) => ({ x: 50 + (i + 0.5) * (300 / n), col: pick(COLS, r), free: i === gi })); gap = slots[gi]; car = { x: 200, y: 460, a: 0, w: sw }; };
  mk();
  const corners = (x, y, a, w = 44, h = 86) => [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([px, py]) => [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)]);
  const blocked = (x, y, a) => { const C = corners(x, y, a, 46, 88); return slots.some(s => !s.free && C.some(([px, py]) => Math.abs(px - s.x) < 25 && py > 70 && py < 170)) || C.some(([px]) => px < 20 || px > 380) || (passer && C.some(([px, py]) => Math.abs(px - passer.x) < 50 && Math.abs(py - passer.y) < 30)); };
  return {
    hint: { type: 'drag', x: 200, y: 460, x2: gap.x, y2: 120 },
    update(dt) {
      t += dt; hitT = Math.max(0, hitT - dt);
      if (L) { pt -= dt; if (pt <= 0 && !passer) { passer = { x: -60, y: 280, v: 120 + L * 40 }; pt = 3 + r() * 3; } if (passer) { passer.x += passer.v * dt * GAME_MOTION; if (passer.x > 470) passer = null; } }
      if (!drag && !fin.on() && dist(car.x, car.y, gap.x, 120) < 16 && Math.abs(Math.sin(car.a)) < 0.2) { got++; Sfx.play('good'); env.burst(gap.x, 120, 16); if (got >= need) fin.set(0.6); else { const g2 = gap; g2.free = false; mk(); } }
      fin.tick(dt);
    },
    draw(c) {
      asphaltBg(c, t); txtGot(c, got, need, '#fff');
      line(c, 50, 70, 350, 70, 4, '#f8f9fa', false); for (let i = 0; i <= 5; i++) line(c, 50 + i * 60, 70, 50 + i * 60, 170, 4, '#f8f9fa', false);
      slots.forEach(s => { if (!s.free) drawCar(c, s.x, 120, 0, s.col); else { txt(c, 'P', s.x, 120, 30, 'rgba(255,255,255,.5)', 'center', null); } });
      line(c, 0, 230, 400, 230, 3, 'rgba(255,255,255,.4)', false); for (let x = 0; x < 400; x += 50) line(c, x, 300, x + 26, 300, 3, '#f8f9fa', false);
      if (passer) drawCar(c, passer.x, passer.y, Math.PI / 2, '#118ab2', 0.95, { lights: true });
      drawCar(c, car.x + (hitT ? Math.sin(t * 60) * 3 : 0), car.y, car.a, '#95C11F', 1, { mine: true, brake: hitT > 0 });
      if (hitT) txt(c, 'Rums! Vorsicht!', 200, 360, 22, '#ef476f', 'center', '#fff');
    },
    down(x, y) { if (fin.on()) return; if (dist(x, y, car.x, car.y) < 70) drag = { ox: car.x - x, oy: car.y - y }; },
    move(x, y) {
      if (!drag) return; const nx = x + drag.ox, ny = clamp(y + drag.oy, 110, 480), dx = nx - car.x, dy = ny - car.y, d = Math.hypot(dx, dy); if (d < 1) return;
      // das Auto dreht sich in Fahrtrichtung (vorwärts = nach oben), aber nur so weit wie ein Lenkrad erlaubt
      const want = Math.atan2(dx, -dy), na = lerp(car.a, Math.abs(want) < 1.4 ? want : car.a, Math.min(1, d * 0.03));
      const steps = Math.ceil(d / 6); for (let k = 1; k <= steps; k++) { const px = car.x + dx / steps, py = car.y + dy / steps; if (blocked(px, py, na)) { hitT = 0.6; Sfx.play('hit'); buzz(40); drag = null; car.x = 200; car.y = 460; car.a = 0; return; } car.x = px; car.y = py; }
      car.a = na; if (car.y < 160) car.a = lerp(car.a, 0, 0.3);
    },
    up() { drag = null; },
  };
} };

// 8) Fahrrad aufpumpen: Wisch im Takt nach unten, wenn der Kreis aufleuchtet – der Reifen wird prall
GAMES.pumpen = { make(env) {
  const r = env.r, L = LVL(env), need = 10 + L * 4, beat = 0.75 - L * 0.12;
  let ph = 0, got = 0, t = 0, handle = 0, start = null, fx = [], leak = 0; const fin = finisher(env);
  const onBeat = () => { const p = (ph % beat) / beat; return p < 0.22 || p > 0.86; };
  return {
    hint: { type: 'swipe', x: 300, y: 250 },
    update(dt) {
      t += dt; const before = ph % beat; ph += dt * GAME_MOTION; if (ph % beat < before) Sfx.note(880, 0.04, 'square', 0.03);
      handle = Math.max(0, handle - dt * 4); leak += dt; if (leak > 2.5 - L * 0.5 && got > 0 && !fin.on()) { leak = 0; got = Math.max(0, got - 1); }
      fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 0.6);
      fin.tick(dt);
    },
    draw(c) {
      asphaltBg(c, t); txtGot(c, got, need, '#fff');
      const tire = got / need, R = 70 + tire * 14;
      // Fahrrad
      ell(c, 110, 380, R, R); fs(c, '#212529', 6 + tire * 4); ell(c, 110, 380, R - 12, R - 12); fs(c, null, 2, '#adb5bd'); for (let k = 0; k < 8; k++) { const a = k * TAU / 8 + t * 0.2; line(c, 110, 380, 110 + Math.cos(a) * (R - 12), 380 + Math.sin(a) * (R - 12), 1.5, '#adb5bd', false); }
      line(c, 110, 380, 210, 300, 6, '#e63946'); line(c, 210, 300, 160, 250, 6, '#e63946'); rrPath(c, 140, 236, 40, 12, 6); fs(c, '#212529', 2);
      if (tire < 0.4) { ell(c, 110, 380 + R - 6, R * 0.9, 8); c.fillStyle = '#212529'; c.fill(); }
      // Pumpe + Schlauch
      c.beginPath(); c.moveTo(110, 380 - R + 4); c.quadraticCurveTo(200, 470, 300, 460); c.lineWidth = 5; c.strokeStyle = '#212529'; c.stroke();
      rrPath(c, 285, 300, 30, 170, 8); fs(c, '#1c7ed6', 3); const hy = 200 + handle * 90; line(c, 300, hy, 300, 300, 6, '#adb5bd'); rrPath(c, 250, hy - 12, 100, 20, 8); fs(c, '#212529', 2.5);
      // Takt-Kreis
      const p = (ph % beat) / beat, glow = onBeat();
      ell(c, 300, 120, 30 + (1 - p) * 20, 30 + (1 - p) * 20); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.6)'; c.stroke();
      ell(c, 300, 120, 28, 28); fs(c, glow ? '#ffd166' : '#495057', 3); polyPath(c, [[290, 108], [310, 108], [310, 120], [318, 120], [300, 136], [282, 120], [290, 120]]); fs(c, '#fff', 2);
      // Druck
      rrPath(c, 30, 120, 22, 180, 11); fs(c, 'rgba(0,0,0,.3)', 2); rrPath(c, 33, 123 + 174 * (1 - tire), 16, 174 * tire, 8); c.fillStyle = '#06d6a0'; c.fill();
      fx.forEach(f => { c.globalAlpha = 1 - f.t / 0.6; txt(c, f.s, 300, 180 - f.t * 30, 20, f.ok ? '#80ed99' : '#ef476f', 'center', OL); c.globalAlpha = 1; });
    },
    down(x, y) { start = { x, y }; },
    up(x, y) {
      if (!start || fin.on()) { start = null; return; } const dy = y - start.y; start = null; if (dy < 40) return;
      handle = 1;
      if (onBeat()) { got++; leak = 0; Sfx.note(300 + got * 20, 0.12, 'triangle', 0.06); env.burst(110, 300, 6); fx.push({ t: 0, s: 'Im Takt!', ok: true }); if (got >= need) fin.set(0.5); }
      else { Sfx.note(160, 0.12, 'square', 0.04); fx.push({ t: 0, s: 'Aus dem Takt', ok: false }); }
    },
  };
} };

// 9) Den Bus erwischen: Finger halten = laufen. Autos abwarten, die Bustür ist nur kurz offen
GAMES.bus = { make(env) {
  const r = env.r, L = LVL(env), need = 2 + L, lanes = 1 + Math.min(L + 1, 2);
  const LY = k => 300 - k * 70;
  let kid, cars, bus, hold = false, got = 0, t = 0, honk = 0, fx = []; const fin = finisher(env);
  const reset = () => { kid = { x: 200, y: 400 }; };
  const mkCars = () => { cars = []; for (let k = 0; k < lanes; k++) { const dir = k % 2 ? -1 : 1, v = (110 + L * 40 + r() * 40) * dir; for (let m = 0; m < 2; m++) cars.push({ k, x: dir > 0 ? -60 - m * (260 + r() * 120) : 460 + m * (260 + r() * 120), v, col: pick(['#e63946', '#4dabf7', '#ffd166', '#adb5bd', '#343a40'], r) }); } };
  reset(); mkCars(); bus = { x: 520, state: 'come', wait: 0 };
  return {
    hint: { type: 'tap', x: 200, y: 400 },
    update(dt) {
      t += dt; honk = Math.max(0, honk - dt);
      cars.forEach(c2 => { c2.x += c2.v * dt * GAME_MOTION; if (c2.v > 0 && c2.x > 480) c2.x = -80 - r() * 200; if (c2.v < 0 && c2.x < -80) c2.x = 480 + r() * 200; });
      if (bus.state === 'come') { bus.x = lerp(bus.x, 200, Math.min(1, dt * 1.5)); if (Math.abs(bus.x - 200) < 3) { bus.state = 'open'; bus.wait = 5.5 - L * 1.2; Sfx.play('open'); } }
      else if (bus.state === 'open') { bus.wait -= dt; if (bus.wait <= 0) { bus.state = 'go'; Sfx.note(120, 0.4, 'sawtooth', 0.04); } }
      else if (bus.state === 'go') { bus.x -= 260 * dt; if (bus.x < -200) { bus.x = 560; bus.state = 'come'; } }
      if (hold && !honk) { kid.y -= 90 * dt; }
      const lane = [...Array(lanes)].findIndex((_, k) => Math.abs(kid.y - LY(k)) < 26);
      if (lane >= 0 && cars.some(c2 => c2.k === lane && Math.abs(c2.x - kid.x) < 50)) { honk = 0.8; Sfx.note(400, 0.3, 'square', 0.05); reset(); fx.push({ t: 0, s: 'Huup! Warte auf eine Lücke', ok: false }); }
      if (kid.y < LY(lanes - 1) - 50) { if (bus.state === 'open') { got++; Sfx.play('good'); env.burst(200, 120, 16); fx.push({ t: 0, s: 'Eingestiegen!', ok: true }); reset(); mkCars(); bus.state = 'go'; if (got >= need) fin.set(0.6); } else { kid.y = LY(lanes - 1) - 50; } }
      fx.forEach(f => (f.t += dt)); fx = fx.filter(f => f.t < 1);
      fin.tick(dt);
    },
    draw(c) {
      asphaltBg(c, t);
      c.fillStyle = '#ced4da'; c.fillRect(0, 380, GAME_W, 140); c.fillRect(0, 0, GAME_W, LY(lanes - 1) - 40);
      for (let k = 0; k < lanes - 1; k++) for (let x = 0; x < 400; x += 50) line(c, x, LY(k) - 35, x + 26, LY(k) - 35, 3, '#f8f9fa', false);
      for (let k = 0; k < Math.max(1, lanes * 2); k++) rrPath(c, 176, LY(0) + 40 - k * 35, 48, 18, 2), c.fillStyle = 'rgba(255,255,255,.75)', c.fill();
      txtGot(c, got, need, '#fff');
      // Bus oben
      c.save(); c.translate(bus.x, LY(lanes - 1) - 96); rrPath(c, -140, -40, 280, 70, 14); fs(c, '#ffd166', 3); for (let k = 0; k < 5; k++) { rrPath(c, -126 + k * 50, -30, 40, 26, 5); fs(c, '#a5d8ff', 2); }
      const op = bus.state === 'open' ? 1 : 0; rrPath(c, -20 - op * 16, -6, 40 + op * 32, 36, 4); fs(c, op ? '#343a40' : '#fff3bf', 2.5); ell(c, -100, 30, 14, 14); fs(c, '#212529', 2.5); ell(c, 100, 30, 14, 14); fs(c, '#212529', 2.5); c.restore();
      if (bus.state === 'open') { rrPath(c, 150, 20, 100, 16, 8); fs(c, 'rgba(0,0,0,.3)', 2); rrPath(c, 152, 22, 96 * bus.wait / (5.5 - L * 1.2), 12, 6); c.fillStyle = '#ffd166'; c.fill(); }
      cars.forEach(c2 => drawCar(c, c2.x, LY(c2.k), c2.v > 0 ? Math.PI / 2 : -Math.PI / 2, c2.col, 0.75));
      c.save(); c.translate(kid.x, kid.y); drawAnimal(c, env.kind || 'dog', 0, 0, 0.8, { t, moving: hold, dir: 1, cap: false }); c.restore();
      if (honk) txt(c, 'HUUP!', 200, 230, 30, '#ef476f', 'center', '#fff');
      fx.forEach(f => { c.globalAlpha = 1 - f.t; txt(c, f.s, 200, 460 - f.t * 30, 18, f.ok ? '#80ed99' : '#ef476f', 'center', OL); c.globalAlpha = 1; });
      txt(c, 'Halten = laufen', 200, 506, 13, '#495057', 'center', '#fff');
    },
    down() { hold = true; }, up() { hold = false; },
  };
} };

// 10) Stau auflösen: Autos nur vor und zurück schieben – das grüne Auto muss rechts hinaus
GAMES.stau = { make(env) {
  const r = env.r, L = LVL(env), N = 6, cs = 50, ox = 50, oy = 130, EY = 2, minMoves = 3 + L * 3;
  const key = V => V.map(v => v.x + ',' + v.y).join('|');
  const occ = V => { const g = new Array(N * N).fill(-1); V.forEach((v, i) => { for (let k = 0; k < v.len; k++) g[(v.y + (v.h ? 0 : k)) * N + v.x + (v.h ? k : 0)] = i; }); return g; };
  const solve = V0 => { const Q = [[V0, 0]], seen = new Set([key(V0)]); let it = 0; while (Q.length && it++ < 4000) { const [V, d] = Q.shift(); if (V[0].x + V[0].len === N) return d; const g = occ(V); for (let i = 0; i < V.length; i++) { const v = V[i]; for (const s of [-1, 1]) { let st = 1; for (;;) { const nx = v.x + (v.h ? s * st : 0), ny = v.y + (v.h ? 0 : s * st); if (nx < 0 || ny < 0 || (v.h ? nx + v.len > N : ny + v.len > N)) break; let free = true; for (let k = 0; k < v.len; k++) { const cx = nx + (v.h ? k : 0), cy = ny + (v.h ? 0 : k), o = g[cy * N + cx]; if (o >= 0 && o !== i) { free = false; break; } } if (!free) break; const W = V.map(q => ({ ...q })); W[i].x = nx; W[i].y = ny; const kk = key(W); if (!seen.has(kk)) { seen.add(kk); Q.push([W, d + 1]); } st++; } } } } return -1; };
  let V, best = -1, keepV = null, keepB = -1;
  for (let g = 0; g < 36; g++) {
    V = [{ x: 0, y: EY, len: 2, h: true, col: '#95C11F' }]; const want = 7 + L * 2 + ri(0, 2, r);
    for (let tries = 0; tries < 80 && V.length < want; tries++) { const h = r() < 0.45, len = r() < 0.75 ? 2 : 3, x = ri(0, h ? N - len : N - 1, r), y = ri(0, h ? N - 1 : N - len, r); if (h && y === EY) continue; const nv = { x, y, len, h, col: pick(['#e63946', '#4dabf7', '#ffd166', '#adb5bd', '#f4a261', '#9b5de5', '#343a40'], r) }; const g2 = occ(V); let ok = true; for (let k = 0; k < len; k++) if (g2[(y + (h ? 0 : k)) * N + x + (h ? k : 0)] >= 0) ok = false; if (ok) V.push(nv); }
    best = solve(V); if (best > keepB) { keepB = best; keepV = V.map(q => ({ ...q })); } if (best >= minMoves) break;
  }
  if (best < minMoves && keepV) { V = keepV; best = keepB; }
  if (best < 0) { V = [{ x: 0, y: EY, len: 2, h: true, col: '#95C11F' }, { x: 3, y: 1, len: 3, h: false, col: '#e63946' }]; best = 1; }
  let drag = null, moves = 0, t = 0, out = 0; const fin = finisher(env);
  const canMove = (i, nx, ny) => { const v = V[i], g = occ(V); if (nx < 0 || ny < 0 || (v.h ? nx + v.len > N : ny + v.len > N)) return false; for (let k = 0; k < v.len; k++) { const o = g[(ny + (v.h ? 0 : k)) * N + nx + (v.h ? k : 0)]; if (o >= 0 && o !== i) return false; } return true; };
  return {
    hint: { type: 'drag', x: ox + cs, y: oy + EY * cs + cs / 2, x2: ox + 4 * cs, y2: oy + EY * cs + cs / 2 },
    update(dt) { t += dt; if (out) { out += dt; V[0].x += dt * 8; } fin.tick(dt); },
    draw(c) {
      asphaltBg(c, t);
      txt(c, 'Züge: ' + moves + (best > 0 ? '  (geht mit ' + best + ')' : ''), 200, 40, 18, '#fff', 'center', OL);
      rrPath(c, ox - 10, oy - 10, N * cs + 20, N * cs + 20, 12); fs(c, '#495057', 3);
      rrPath(c, ox + N * cs, oy + EY * cs + 4, 30, cs - 8, 4); c.fillStyle = '#06d6a0'; c.fill(); polyPath(c, [[ox + N * cs + 8, oy + EY * cs + 16], [ox + N * cs + 24, oy + EY * cs + cs / 2], [ox + N * cs + 8, oy + EY * cs + cs - 16]]); fs(c, '#fff', 2);
      for (let i = 0; i <= N; i++) { line(c, ox + i * cs, oy, ox + i * cs, oy + N * cs, 1, 'rgba(255,255,255,.15)', false); line(c, ox, oy + i * cs, ox + N * cs, oy + i * cs, 1, 'rgba(255,255,255,.15)', false); }
      V.forEach((v, i) => { const x = ox + v.x * cs, y = oy + v.y * cs, w = v.h ? v.len * cs : cs, h = v.h ? cs : v.len * cs; const lift = drag && drag.i === i ? 3 : 0;
        rrPath(c, x + 4, y + 4 - lift, w - 8, h - 8, 12); fs(c, v.col, 3); rrPath(c, x + (v.h ? w * 0.25 : 10), y + (v.h ? 10 : h * 0.25) - lift, v.h ? w * 0.3 : cs - 20, v.h ? cs - 20 : h * 0.3, 5); c.fillStyle = 'rgba(90,111,125,.85)'; c.fill(); if (i === 0) leaf(c, x + w * 0.7, y + h / 2 - lift, 0.6, '#fff'); });
    },
    down(x, y) { if (fin.on() || out) return; const gx = Math.floor((x - ox) / cs), gy = Math.floor((y - oy) / cs), g = occ(V), i = gx >= 0 && gy >= 0 && gx < N && gy < N ? g[gy * N + gx] : -1; if (i >= 0) { drag = { i, sx: x, sy: y, vx: V[i].x, vy: V[i].y }; Sfx.play('tap'); } },
    move(x, y) {
      if (!drag) return; const v = V[drag.i], d = Math.round(((v.h ? x - drag.sx : y - drag.sy)) / cs), tx = v.h ? drag.vx + d : drag.vx, ty = v.h ? drag.vy : drag.vy + d;
      // Schritt für Schritt schieben, bis es nicht weitergeht
      while (v.x !== tx || v.y !== ty) { const nx = v.x + Math.sign(tx - v.x), ny = v.y + Math.sign(ty - v.y); if (!canMove(drag.i, nx, ny)) break; v.x = nx; v.y = ny; Sfx.note(500, 0.03, 'sine', 0.03); }
    },
    up() { if (!drag) return; const v = V[drag.i]; if (v.x !== drag.vx || v.y !== drag.vy) moves++; drag = null; if (V[0].x + V[0].len === N && !out) { out = 0.01; Sfx.play('good'); env.burst(ox + N * cs, oy + EY * cs + cs / 2, 20); fin.set(0.8); } },
  };
} };

// 11) Ab nach Hause (Boss-Fahrt): Halten = Gas, loslassen = bremsen, Finger links/rechts = lenken. Bei Rot anhalten!
GAMES.heimfahrt = { challenge: true, make(env) {
  const r = env.r, L = LVL(env), len = 2200 + L * 600, LX = [120, 200, 280];
  let pos = 0, v = 0, gas = false, cx = 200, tx = 200, t = 0, crash = 0, fx = [];
  const obs = []; for (let y = 400; y < len - 200; y += 260 - L * 40 + r() * 80) obs.push({ y, lane: ri(0, 2, r), kind: r() < 0.6 ? 'car' : 'cone', col: pick(['#e63946', '#4dabf7', '#ffd166', '#adb5bd'], r) });
  const lights = []; for (let y = 700; y < len - 100; y += 700 + r() * 200) lights.push({ y, ph: r() * 6, passed: false });
  const fin = finisher(env);
  const red = l => ((t + l.ph) % 5) < 2;
  return {
    hint: { type: 'tap', x: 200, y: 420 },
    update(dt) {
      t += dt; crash = Math.max(0, crash - dt);
      v = crash ? 0 : gas ? Math.min(260 + L * 40, v + 300 * dt) : Math.max(0, v - 520 * dt);
      pos += v * dt * GAME_MOTION; cx = lerp(cx, tx, Math.min(1, dt * 6));
      obs.forEach(o => { const sy = 420 - (o.y - pos); if (!o.hit && Math.abs(sy - 420) < 40 && Math.abs(LX[o.lane] - cx) < 46) { o.hit = true; crash = 1; v = 0; pos = Math.max(0, pos - 160); Sfx.play('hit'); buzz(60); fx.push({ t: 0, s: 'Rums! Weiter vorsichtig!', ok: false }); setTimeout(() => (o.hit = false), 1500); } });
      lights.forEach(l => { if (!l.passed && pos + 20 > l.y) { l.passed = true; if (red(l)) { pos = l.y - 220; v = 0; crash = 0.8; Sfx.play('bad'); fx.push({ t: 0, s: 'Rot! Zurück und warten', ok: false }); l.passed = false; } else { Sfx.play('good'); fx.push({ t: 0, s: 'Grün – gut!', ok: true }); } } });
      fx.forEach(f => (f.t += dt)); for (let i = fx.length - 1; i >= 0; i--) if (fx[i].t > 1) fx.splice(i, 1);
      if (pos >= len) fin.set(0.3);
      fin.tick(dt);
    },
    draw(c) {
      c.fillStyle = '#74c69d'; c.fillRect(0, 0, GAME_W, GAME_H);
      for (let k = 0; k < 12; k++) { const y = ((k * 90 + pos) % 1080) - 60; ell(c, 30, y, 22, 22); fs(c, '#40916c', 2.5); ell(c, 370, (y + 45) % 1080 - 20, 22, 22); fs(c, '#40916c', 2.5); }
      rrPath(c, 70, -10, 260, GAME_H + 20, 0); c.fillStyle = '#6c757d'; c.fill(); line(c, 70, -10, 70, 540, 4, '#f8f9fa', false); line(c, 330, -10, 330, 540, 4, '#f8f9fa', false);
      for (let k = 0; k < 12; k++) { const y = ((k * 60 + pos) % 720) - 60; line(c, 160, y, 160, y + 30, 4, '#f8f9fa', false); line(c, 240, y, 240, y + 30, 4, '#f8f9fa', false); }
      lights.forEach(l => { const sy = 420 - (l.y - pos); if (sy < -80 || sy > 600) return; line(c, 70, sy, 330, sy, 6, 'rgba(255,255,255,.8)', false); rrPath(c, 336, sy - 70, 26, 64, 6); fs(c, '#212529', 2.5); ell(c, 349, sy - 54, 8, 8); c.fillStyle = red(l) ? '#ff4d4d' : '#4a1515'; c.fill(); ell(c, 349, sy - 26, 8, 8); c.fillStyle = red(l) ? '#14421f' : '#2bff6a'; c.fill(); });
      obs.forEach(o => { const sy = 420 - (o.y - pos); if (sy < -80 || sy > 600) return; if (o.kind === 'car') drawCar(c, LX[o.lane], sy, Math.PI, o.col, 0.8); else { polyPath(c, [[LX[o.lane] - 14, sy + 14], [LX[o.lane] + 14, sy + 14], [LX[o.lane], sy - 22]]); fs(c, '#f77f00', 3); line(c, LX[o.lane] - 8, sy, LX[o.lane] + 8, sy, 3, '#fff', false); } });
      drawCar(c, cx + (crash ? Math.sin(t * 50) * 3 : 0), 420, (tx - cx) * 0.004, '#95C11F', 0.85, { mine: true, brake: !gas });
      rrPath(c, 20, 20, 20, 300, 10); fs(c, 'rgba(0,0,0,.3)', 2); rrPath(c, 23, 23 + 294 * (1 - pos / len), 14, 294 * (pos / len), 7); c.fillStyle = '#ffd166'; c.fill(); icon(c, 'home', 30, 12, 20);
      fx.forEach(f => { c.globalAlpha = 1 - f.t; txt(c, f.s, 200, 200 - f.t * 30, 20, f.ok ? '#80ed99' : '#ef476f', 'center', OL); c.globalAlpha = 1; });
      txt(c, 'Halten = Gas · Loslassen = Bremse', 200, 506, 13, '#fff', 'center', OL);
    },
    down(x) { gas = true; tx = clamp(x, 110, 290); },
    move(x) { tx = clamp(x, 110, 290); },
    up() { gas = false; },
  };
} };

Object.assign(HELP_TEXT, {
  fondue: 'Die Gabel kreist um den Topf. Halte den Finger gedrückt, dann taucht das Brot ein – aber nur über dem Käse, nicht über dem Feuer! Lass los, wenn der Punkt im grünen Bereich ist.',
  holzhacken: 'Der Holzklotz wackelt hin und her. Wisch nach unten, wenn er gerade steht und der Kreis grün ist.',
  kaminfeuer: 'Wisch von unten nach oben über das Feuer, damit es groß bleibt. Tippe die Funken an, bevor sie auf den Teppich fallen.',
  schneeball: 'Schnipp den Schneeball nach oben. Schnell geschnippt fliegt er weiter nach hinten. Triff die Schneemänner!',
  eisrutsch: 'Wisch in eine Richtung, dann rutscht deine Figur übers Eis, bis sie an einen Stein stößt. Bring sie zur Tasse Kakao.',
  eisstock: 'Wisch den Eisstock mit Schwung nach oben. Er soll im Zielkreis liegen bleiben – nicht zu fest und nicht zu schwach.',
  einparken: 'Zieh das grüne Auto mit dem Finger in die freie Parklücke. Pass auf, dass du kein anderes Auto berührst.',
  pumpen: 'Wisch nach unten, wenn der Kreis gelb leuchtet – immer im Takt. So wird der Reifen prall.',
  bus: 'Halte den Finger gedrückt, dann läuft deine Figur los. Warte auf eine Lücke zwischen den Autos und steig in den Bus, solange die Tür offen ist.',
  stau: 'Schieb die Autos vor und zurück, bis das grüne Auto rechts hinausfahren kann.',
  heimfahrt: 'Halte den Finger gedrückt, dann fährt das Auto. Lass los zum Bremsen und zieh nach links oder rechts zum Lenken. Bei Rot musst du anhalten!',
});
