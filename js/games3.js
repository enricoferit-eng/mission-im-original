'use strict';
// ---------- Küchen-Aufgaben (neu, mit viel Bewegung) ----------
function kitchenBg(c, counter = 330) {
  c.fillStyle = '#f8f9fa'; c.fillRect(0, 0, GAME_W, counter);
  c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 1.5;
  for (let x = 0; x <= GAME_W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, counter); c.stroke(); }
  for (let y = 0; y <= counter; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(GAME_W, y); c.stroke(); }
  const g = c.createLinearGradient(0, counter, 0, GAME_H); g.addColorStop(0, '#dee2e6'); g.addColorStop(1, '#adb5bd');
  c.fillStyle = g; c.fillRect(0, counter, GAME_W, GAME_H - counter);
  c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, counter + 3); c.lineTo(GAME_W, counter + 3); c.stroke();
}
function pot(c, x, y, r, col = '#adb5bd') {
  ell(c, x, y + r * 0.55, r * 1.05, r * 0.35); c.fillStyle = 'rgba(0,0,0,.18)'; c.fill();
  rrPath(c, x - r, y - r * 0.2, r * 2, r * 0.95, r * 0.25); fs(c, col, 3);
  ell(c, x, y - r * 0.2, r, r * 0.38); fs(c, '#6c757d', 3);
  rrPath(c, x - r - 14, y - 2, 16, 8, 4); fs(c, '#495057', 2); rrPath(c, x + r - 2, y - 2, 16, 8, 4); fs(c, '#495057', 2);
}
const VEG = {
  karotte: (c, w) => { c.beginPath(); c.moveTo(-w / 2, -12); c.lineTo(w / 2, -3); c.lineTo(w / 2, 3); c.lineTo(-w / 2, 12); c.closePath(); fs(c, '#f77f00', 3); for (let k = 0; k < 3; k++) line(c, -w / 2 - 2, (k - 1) * 6, -w / 2 - 16, (k - 1) * 10, 4, '#52b788'); },
  gurke: (c, w) => { rrPath(c, -w / 2, -13, w, 26, 13); fs(c, '#2d6a4f', 3); for (let k = 0; k < 6; k++) { ell(c, -w / 2 + 10 + k * (w - 20) / 5, -4 + (k % 2) * 7, 2, 1.5); c.fillStyle = '#95d5b2'; c.fill(); } },
  zucchini: (c, w) => { rrPath(c, -w / 2, -12, w, 24, 12); fs(c, '#55a630', 3); line(c, -w / 2 + 8, -4, w / 2 - 8, -4, 2, 'rgba(255,255,255,.35)', false); rrPath(c, w / 2 - 2, -4, 10, 8, 3); fs(c, '#8d5a3b', 2); },
  lauch: (c, w) => { rrPath(c, -w / 2, -11, w * 0.55, 22, 10); fs(c, '#f1faee', 3); rrPath(c, -w / 2 + w * 0.5, -12, w * 0.5, 24, 8); fs(c, '#74c69d', 3); },
};

// 1) Gemüse schnippeln: Gemüse rollt am Messer vorbei – tippen, wenn eine Schnittlinie unter dem Messer ist
GAMES.schnippeln = { make(env) {
  const r = env.r, L = LVL(env), need = 8 + L * 4, sp = 70 + L * 28;
  let veg = null, got = 0, chop = 0, shake = 0, t = 0; const fin = finisher(env), pieces = [];
  const spawn = () => { const kinds = Object.keys(VEG), w = 150 + r() * 60, n = 3 + L; veg = { k: pick(kinds, r), x: 470 + w / 2, w, cuts: [...Array(n)].map((_, i) => ({ dx: -w / 2 + (i + 1) * (w / (n + 1)), done: false })) }; };
  spawn();
  return {
    hint: { type: 'tap', x: 200, y: 300 },
    update(dt) {
      t += dt; chop = Math.max(0, chop - dt * 5); shake = Math.max(0, shake - dt);
      veg.x -= sp * dt * (1 + got / need * 0.6) * GAME_MOTION;
      if (veg.x + veg.w / 2 < -20) spawn();
      pieces.forEach(p => { p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; }); for (let i = pieces.length - 1; i >= 0; i--) if (pieces[i].y > 560) pieces.splice(i, 1);
      fin.tick(dt);
    },
    draw(c) {
      kitchenBg(c, 200);
      txt(c, got + ' / ' + need, 200, 40, 22, BRAND.olive, 'center', '#fff');
      rrPath(c, 20, 240, 360, 130, 18); fs(c, '#e9c46a', 3); for (let k = 0; k < 6; k++) line(c, 30, 260 + k * 18, 370, 260 + k * 18, 1.5, 'rgba(140,90,40,.18)', false);
      c.save(); c.translate(veg.x + (shake ? Math.sin(t * 60) * 3 : 0), 305); VEG[veg.k](c, veg.w); veg.cuts.forEach(q => { if (!q.done) { c.setLineDash([4, 4]); line(c, q.dx, -18, q.dx, 18, 2, '#fff', false); c.setLineDash([]); } }); c.restore();
      pieces.forEach(p => { c.save(); c.translate(p.x, p.y); c.rotate(p.a); ell(c, 0, 0, 10, 10); fs(c, p.col, 2); c.restore(); });
      // Messer
      const ky = 200 + chop * 90;
      c.save(); c.translate(200, ky); polyPath(c, [[-6, 0], [6, 0], [14, 90], [-14, 90]]); fs(c, '#dee2e6', 3); rrPath(c, -8, -50, 16, 52, 6); fs(c, '#212529', 2.5); c.restore();
      ell(c, 200, 308, 16, 22); c.lineWidth = 3; c.strokeStyle = 'rgba(239,71,111,.5)'; c.stroke();
    },
    down() {
      if (fin.on()) return; chop = 1; Sfx.play('tap');
      const hit = veg.cuts.find(q => !q.done && Math.abs(veg.x + q.dx - 200) < 16 - L * 2);
      if (hit) { hit.done = true; got++; env.burst(200, 300, 10); pieces.push({ x: 200, y: 300, vx: (r() - 0.5) * 200, vy: -250, a: 0, va: 8, col: veg.k === 'karotte' ? '#f77f00' : veg.k === 'lauch' ? '#f1faee' : '#95d5b2' }); Sfx.play('good'); if (got >= need) fin.set(0.5); }
      else { shake = 0.3; Sfx.play('bad'); }
    },
  };
} };

// 2) Töpfe umrühren: Töpfe werden heiß – mit dem Finger im Topf kreisen, damit nichts anbrennt
GAMES.ruehren = { make(env) {
  const r = env.r, L = LVL(env), n = 2 + Math.min(L, 1) + (L === 2 ? 1 : 0), goal = 14 + L * 6;
  const P = [...Array(n)].map((_, i) => ({ x: n === 2 ? 110 + i * 180 : n === 3 ? 80 + i * 120 : 100 + (i % 2) * 200, y: n === 4 ? 230 + Math.floor(i / 2) * 160 : 300, heat: 0.2 + r() * 0.2, sp: 0.06 + r() * 0.05 + L * 0.03, burn: 0, bub: [] }));
  let el = 0, drag = null, last = null, saved = 0; const fin = finisher(env);
  return {
    hint: { type: 'swipe', x: P[0].x, y: P[0].y },
    update(dt) {
      if (fin.on()) { fin.tick(dt); return; }
      el += dt;
      P.forEach(p => {
        p.heat = Math.min(1, p.heat + p.sp * dt * (0.8 + Math.sin(el * 0.7 + p.x) * 0.4));
        if (Math.random() < p.heat * 0.4) p.bub.push({ x: (Math.random() - 0.5) * 50, y: 0, t: 0 });
        p.bub.forEach(b => (b.t += dt)); p.bub = p.bub.filter(b => b.t < 0.6);
        if (p.heat >= 1) { p.heat = 0.55; p.burn = 0.6; Sfx.play('bad'); el = Math.max(0, el - 3); }
        p.burn = Math.max(0, p.burn - dt);
      });
      if (el >= goal) fin.set(0.4);
      fin.tick(dt);
    },
    draw(c) {
      kitchenBg(c, 140);
      rrPath(c, 40, 30, 320, 24, 12); fs(c, '#1f150e', 3); rrPath(c, 43, 33, 314 * clamp(el / goal, 0, 1), 18, 9); c.fillStyle = '#06d6a0'; c.fill(); icon(c, 'clock', 26, 42, 26);
      P.forEach(p => {
        c.save(); if (p.burn) c.translate(Math.sin(el * 60) * 4, 0);
        ell(c, p.x, p.y + 30, 62, 22); c.fillStyle = `rgba(239,71,111,${0.2 + p.heat * 0.5})`; c.fill();
        pot(c, p.x, p.y, 52, '#ced4da');
        ell(c, p.x, p.y - 10, 46, 17); c.fillStyle = p.heat > 0.8 ? '#9c3d10' : p.heat > 0.55 ? '#e76f51' : '#f4a261'; c.fill();
        p.bub.forEach(b => { ell(c, p.x + b.x, p.y - 10 - b.t * 20, 4, 3); c.fillStyle = `rgba(255,255,255,${0.7 - b.t})`; c.fill(); });
        if (p.burn) for (let k = 0; k < 3; k++) { ell(c, p.x - 20 + k * 20, p.y - 50 - k * 6, 12, 9); c.fillStyle = 'rgba(60,60,60,.6)'; c.fill(); }
        rrPath(c, p.x - 40, p.y + 52, 80, 10, 5); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); rrPath(c, p.x - 40, p.y + 52, 80 * p.heat, 10, 5); c.fillStyle = p.heat > 0.75 ? '#ef476f' : p.heat > 0.5 ? '#ffd166' : '#06d6a0'; c.fill();
        c.restore();
      });
      if (drag) { const p = P[drag.i]; c.save(); c.translate(drag.x, drag.y); c.rotate(-0.6); rrPath(c, -5, -70, 10, 80, 5); fs(c, '#c08b55', 2.5); ell(c, 0, 12, 10, 14); fs(c, '#c08b55', 2.5); c.restore(); }
    },
    down(x, y) { const i = P.findIndex(p => dist(x, y, p.x, p.y) < 60); if (i >= 0) { drag = { i, x, y }; last = { x, y }; } },
    move(x, y) {
      if (!drag) return; const p = P[drag.i], d = dist(x, y, last.x, last.y); drag.x = x; drag.y = y; last = { x, y };
      if (dist(x, y, p.x, p.y) < 70) { const before = p.heat; p.heat = Math.max(0, p.heat - d * 0.0016); if (before > 0.7 && p.heat <= 0.4) { saved++; env.burst(p.x, p.y - 20, 10); } if (Math.random() < d / 80) Sfx.note(300 + Math.random() * 120, 0.05, 'sine', 0.03); }
    },
    up() { drag = null; },
  };
} };

// 3) Überkochen verhindern: Schaum steigt – rechtzeitig auf den Topf tippen (Deckel hoch, Hitze runter)
GAMES.ueberkochen = { make(env) {
  const r = env.r, L = LVL(env), need = 9 + L * 4, cols = L ? 3 : 2, rows = 2;
  const P = []; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) P.push({ x: 200 + (i - (cols - 1) / 2) * 120, y: 230 + j * 170, foam: 0, on: false, sp: 0, lid: 0, spill: 0 });
  let got = 0, wait = 0.6, t = 0; const fin = finisher(env);
  return {
    hint: { type: 'tap', x: P[0].x, y: P[0].y },
    update(dt) {
      t += dt; wait -= dt;
      const active = P.filter(p => p.on).length;
      if (wait <= 0 && active < 1 + L) { const idle = P.filter(p => !p.on && !p.spill); if (idle.length) { const p = pick(idle, r); p.on = true; p.foam = 0; p.sp = (0.38 + r() * 0.2 + L * 0.12) * (1 + got / need * 0.5); } wait = 0.8 - L * 0.15 + r() * 0.6; }
      P.forEach(p => {
        p.lid = Math.max(0, p.lid - dt * 2); p.spill = Math.max(0, p.spill - dt);
        if (p.on) { p.foam += p.sp * dt; if (p.foam >= 1) { p.on = false; p.spill = 1.2; p.foam = 0; Sfx.play('bad'); got = Math.max(0, got - 1); } }
      });
      fin.tick(dt);
    },
    draw(c) {
      kitchenBg(c, 120);
      txt(c, got + ' / ' + need, 200, 40, 22, BRAND.olive, 'center', '#fff');
      P.forEach(p => {
        const jig = p.on ? Math.sin(t * 30) * p.foam * 3 : 0;
        ell(c, p.x, p.y + 40, 56, 14); c.fillStyle = p.on ? `rgba(239,71,111,${0.3 + p.foam * 0.5})` : 'rgba(0,0,0,.2)'; c.fill();
        pot(c, p.x + jig, p.y, 44, '#dee2e6');
        if (p.on || p.spill) { const f = p.spill ? 1 : p.foam; for (let k = 0; k < 7; k++) { ell(c, p.x - 36 + k * 12 + jig, p.y - 18 - f * 26 - (k % 2) * 4, 10 + f * 4, 8 + f * 4); c.fillStyle = '#fff'; c.fill(); } if (p.spill) for (let k = 0; k < 4; k++) { ell(c, p.x - 46 + k * 30, p.y + 30 + (k % 2) * 6, 14, 6); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); } }
        c.save(); c.translate(p.x + jig, p.y - 26 - (p.on ? p.foam * 30 + Math.abs(Math.sin(t * 25)) * p.foam * 10 : 0) - p.lid * 60); c.rotate(p.lid * 0.6); ell(c, 0, 0, 46, 12); fs(c, '#adb5bd', 3); rrPath(c, -8, -14, 16, 10, 4); fs(c, '#212529', 2); c.restore();
        if (p.on && p.foam > 0.6) txt(c, '!', p.x + 50, p.y - 50, 26, '#ef476f', 'center', '#fff');
      });
    },
    down(x, y) {
      if (fin.on()) return;
      const p = P.find(q => dist(x, y, q.x, q.y - 10) < 62); if (!p) return;
      if (p.on) { p.on = false; p.lid = 1; got++; Sfx.play('pop'); env.burst(p.x, p.y - 30, 10); if (got >= need) fin.set(0.5); }
      else Sfx.play('tap');
    },
  };
} };

// 4) Pfannkuchen wenden: Pfanne mit dem Finger bewegen, tippen = hochwerfen, wieder auffangen
GAMES.pfannkuchen = { make(env) {
  const r = env.r, L = LVL(env), need = 4 + L * 2;
  let panX = 200, pk = { x: 200, y: 420, vx: 0, vy: 0, a: 0, va: 0, air: false, side: 0 }, got = 0, miss = 0; const fin = finisher(env);
  const reset = () => { pk = { x: panX, y: 420, vx: 0, vy: 0, a: 0, va: 0, air: false, side: pk.side }; };
  return {
    hint: { type: 'tap', x: 200, y: 420 },
    update(dt) {
      miss = Math.max(0, miss - dt);
      if (pk.air) {
        pk.vy += 900 * dt; pk.x += pk.vx * dt; pk.y += pk.vy * dt; pk.a += pk.va * dt;
        if (pk.x < 30 || pk.x > 370) pk.vx *= -1;
        if (pk.vy > 0 && pk.y >= 420) {
          if (Math.abs(pk.x - panX) < 58 - L * 6) { pk.air = false; pk.y = 420; pk.side ^= 1; got++; Sfx.play('good'); env.burst(panX, 410, 12); if (got >= need) fin.set(0.5); pk.a = 0; }
          else if (pk.y > 560) { miss = 0.8; Sfx.play('bad'); reset(); }
        }
      } else pk.x = panX;
      fin.tick(dt);
    },
    draw(c) {
      kitchenBg(c, 470);
      txt(c, got + ' / ' + need, 200, 40, 22, BRAND.olive, 'center', '#fff');
      ell(c, panX, 490, 70, 14); c.fillStyle = 'rgba(255,90,40,.35)'; c.fill();
      ell(c, panX, 432, 66, 22); fs(c, '#343a40', 3); rrPath(c, panX + 60, 424, 90, 14, 7); fs(c, '#212529', 2.5);
      c.save(); c.translate(pk.x, pk.y); c.rotate(pk.a); c.scale(1, pk.air ? Math.max(0.15, Math.abs(Math.cos(pk.a * 2))) : 1); ell(c, 0, 0, 46, 16); fs(c, pk.side ? '#e9a03b' : '#f6d38d', 3); for (let k = 0; k < 5; k++) { ell(c, -26 + k * 13, -2 + (k % 2) * 5, 4, 2); c.fillStyle = pk.side ? '#b5651d' : '#e9c46a'; c.fill(); } c.restore();
      if (miss) txt(c, 'Daneben!', 200, 250, 26, '#ef476f', 'center', '#fff');
    },
    down(x) { panX = clamp(x, 70, 330); if (fin.on() || pk.air) return; pk.air = true; pk.vy = -620 - L * 60; pk.vx = (r() - 0.5) * (120 + L * 110); pk.va = 9 + r() * 4; Sfx.play('jump'); },
    move(x) { panX = clamp(x, 70, 330); },
  };
} };

// 5) Teig kneten: schnell hin und her wischen – der Teig wird größer; hört man auf, fällt er wieder zusammen
GAMES.kneten = { make(env) {
  const r = env.r, L = LVL(env), need = 2 + L;
  let f = 0, got = 0, last = null, dx = 0, t = 0, squish = 0, wob = 0; const fin = finisher(env);
  return {
    hint: { type: 'swipe', x: 200, y: 330 },
    update(dt) { t += dt; f = Math.max(0, f - dt * (0.08 + L * 0.05)); squish = lerp(squish, 0, dt * 6); wob += dt * (1 + L) * GAME_MOTION; fin.tick(dt); },
    draw(c) {
      kitchenBg(c, 180);
      txt(c, got + ' / ' + need, 200, 40, 22, BRAND.olive, 'center', '#fff');
      rrPath(c, 30, 210, 340, 250, 20); fs(c, '#e9c46a', 3);
      for (let k = 0; k < 18; k++) { ell(c, 60 + (k * 53) % 300, 230 + (k * 37) % 210, 3, 2); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); }
      const cx = 200 + Math.sin(wob) * 40, R = 40 + f * 50;
      c.save(); c.translate(cx, 335); c.scale(1 + squish * 0.25, 1 - squish * 0.2); ell(c, 0, 0, R * 1.2, R); fs(c, '#fcefd4', 3); ell(c, -R * 0.3, -R * 0.35, R * 0.35, R * 0.2); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); c.restore();
      rrPath(c, 60, 490, 280, 16, 8); c.fillStyle = 'rgba(0,0,0,.2)'; c.fill(); rrPath(c, 60, 490, 280 * f, 16, 8); c.fillStyle = f > 0.8 ? '#06d6a0' : '#ffd166'; c.fill();
    },
    down(x, y) { last = { x, y }; },
    move(x, y) {
      if (!last || fin.on()) return; const cx = 200 + Math.sin(wob) * 40;
      if (dist(x, y, cx, 335) < 140) { const d = x - last.x; if (Math.sign(d) !== Math.sign(dx) && Math.abs(d) > 3) { squish = 1; Sfx.note(200 + f * 300, 0.06, 'sine', 0.04); } dx = d; f = Math.min(1, f + Math.abs(d) * (0.0022 - L * 0.0004)); if (f >= 1) { got++; f = 0; env.burst(cx, 335, 14); Sfx.play('good'); if (got >= need) fin.set(0.5); } }
      last = { x, y };
    },
    up() { last = null; },
  };
} };

// 6) Eier aufschlagen: Das Ei schwingt über der Schüssel – genau in der Mitte tippen
GAMES.eier = { make(env) {
  const r = env.r, L = LVL(env), need = 5 + L * 2;
  let ph = 0, sp = 2.2 + L * 0.8, got = 0, crack = 0, mess = 0, yolks = []; const fin = finisher(env);
  return {
    hint: { type: 'tap', x: 200, y: 200 },
    update(dt) { ph += dt * sp * (1 + got / need * 0.6) * GAME_MOTION; crack = Math.max(0, crack - dt * 2); mess = Math.max(0, mess - dt); fin.tick(dt); },
    draw(c) {
      kitchenBg(c, 360);
      txt(c, got + ' / ' + need, 200, 40, 22, BRAND.olive, 'center', '#fff');
      ell(c, 200, 420, 110, 30); c.fillStyle = 'rgba(0,0,0,.18)'; c.fill();
      c.beginPath(); c.moveTo(90, 360); c.quadraticCurveTo(200, 500, 310, 360); c.closePath(); fs(c, '#74c0fc', 3); ell(c, 200, 360, 110, 26); fs(c, '#e7f5ff', 3);
      yolks.forEach((y, i) => { ell(c, 200 + y, 362, 12, 7); c.fillStyle = '#ffd166'; c.fill(); });
      const W2 = 18 - L * 4; rrPath(c, 200 - W2, 330, W2 * 2, 8, 4); c.fillStyle = 'rgba(6,214,160,.6)'; c.fill();
      const ex = 200 + Math.sin(ph) * 150, ey = 200;
      line(c, 200, 70, ex, ey - 30, 2, '#adb5bd', false);
      c.save(); c.translate(ex, ey); c.rotate(Math.cos(ph) * 0.3); ell(c, 0, 0, 22, 28); fs(c, crack ? '#f8f9fa' : '#fdf0d5', 3); if (crack) { polyPath(c, [[-20, 0], [-8, -6], [0, 4], [8, -6], [20, 0]]); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); } c.restore();
      if (mess) { ell(c, 60 + mess * 10, 330, 26, 10); c.fillStyle = '#ffd166'; c.fill(); txt(c, 'Daneben!', 200, 270, 24, '#ef476f', 'center', '#fff'); }
    },
    down() {
      if (fin.on()) return; const ex = 200 + Math.sin(ph) * 150;
      if (Math.abs(ex - 200) < 22 - L * 4) { got++; crack = 1; yolks.push((r() - 0.5) * 60); if (yolks.length > 6) yolks.shift(); Sfx.play('pop'); env.burst(200, 340, 10); if (got >= need) fin.set(0.5); }
      else { mess = 0.8; Sfx.play('bad'); }
    },
  };
} };

// 7) Kühlschrank packen: Sachen ziehen (antippen = drehen), bis alles genau hineinpasst
GAMES.kuehlpacken = { make(env) {
  const r = env.r, L = LVL(env), C = 3 + Math.min(L, 1), R = 3 + (L === 2 ? 1 : 0), cs = Math.min(70, 300 / C), ox = 200 - (C * cs) / 2, oy = 80;
  // Raster zufällig in Stücke (1x1, 2x1, 1x2, bei Schwer auch L-Formen) zerlegen -> immer lösbar
  const owner = new Array(C * R).fill(-1), pieces = [];
  const cols = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#f78c6b', '#9b5de5', '#e9c46a', '#74c0fc'];
  for (let i = 0; i < C * R; i++) {
    if (owner[i] >= 0) continue; const x = i % C, y = Math.floor(i / C), opts = [[[0, 0]]];
    if (x + 1 < C && owner[i + 1] < 0) opts.push([[0, 0], [1, 0]]);
    if (y + 1 < R && owner[i + C] < 0) opts.push([[0, 0], [0, 1]]);
    if (L === 2 && x + 1 < C && y + 1 < R && owner[i + 1] < 0 && owner[i + C] < 0) opts.push([[0, 0], [1, 0], [0, 1]]);
    const sh = opts.length > 1 && r() < 0.8 ? pick(opts.slice(1), r) : opts[0];
    sh.forEach(([a, b]) => (owner[(y + b) * C + x + a] = pieces.length));
    pieces.push({ cells: sh, col: cols[pieces.length % cols.length], placed: null });
  }
  const s2 = Math.min(cs * 0.55, 40); let cx = 24, cy = 372;
  shuffle(pieces.slice(), r).forEach(p => {
    p.cells = norm(p.cells.map(([a, b]) => (r() < 0.5 ? [b, a] : [a, b])));
    const w = (Math.max(...p.cells.map(c => c[0])) + 1) * s2, h = (Math.max(...p.cells.map(c => c[1])) + 1) * s2;
    if (cx + w > 386) { cx = 24; cy += 2 * s2 + 14; }
    p.hx = cx + s2 / 2; p.hy = cy + s2 / 2; p.x = p.hx; p.y = p.hy; p.ph = r() * 6; cx += w + 14;
  });
  function norm(cells) { const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1])); return cells.map(([a, b]) => [a - mx, b - my]); }
  const grid = new Array(C * R).fill(-1); let drag = null, t = 0, moved = false; const fin = finisher(env);
  const fits = (p, gx, gy) => p.cells.every(([a, b]) => { const x = gx + a, y = gy + b; return x >= 0 && y >= 0 && x < C && y < R && grid[y * C + x] < 0; });
  const drawPiece = (c, p, x, y, s) => p.cells.forEach(([a, b]) => { rrPath(c, x + a * s + 3, y + b * s + 3, s - 6, s - 6, 8); fs(c, p.col, 3); ell(c, x + a * s + s * 0.35, y + b * s + s * 0.35, s * 0.12, s * 0.08); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill(); });
  return {
    hint: { type: 'drag', x: pieces[0].hx, y: pieces[0].hy, x2: ox + cs / 2, y2: oy + cs / 2 },
    update(dt) { t += dt; pieces.forEach(p => { if (!p.placed && p !== (drag && drag.p)) { p.x = p.hx + Math.sin(t * 1.4 + p.ph) * 6 * GAME_MOTION; p.y = p.hy + Math.cos(t * 1.1 + p.ph) * 4 * GAME_MOTION; } }); fin.tick(dt); },
    draw(c) {
      kitchenBg(c, 340);
      rrPath(c, ox - 18, oy - 18, C * cs + 36, R * cs + 36, 16); fs(c, '#dee2e6', 4); rrPath(c, ox - 6, oy - 6, C * cs + 12, R * cs + 12, 10); fs(c, '#e7f5ff', 2.5);
      for (let i = 0; i < C * R; i++) { const x = ox + (i % C) * cs, y = oy + Math.floor(i / C) * cs; rrPath(c, x + 4, y + 4, cs - 8, cs - 8, 6); c.fillStyle = 'rgba(116,192,252,.25)'; c.fill(); }
      pieces.forEach(p => { if (p.placed) drawPiece(c, p, ox + p.placed[0] * cs, oy + p.placed[1] * cs, cs); });
      pieces.forEach(p => { if (!p.placed) { const big = drag && drag.p === p, s = big ? cs : s2; drawPiece(c, p, p.x - s / 2, p.y - s / 2, s); } });
      txt(c, 'Antippen = drehen', 200, 505, 13, '#495057', 'center', null);
    },
    down(x, y) {
      if (fin.on()) return;
      for (let i = pieces.length - 1; i >= 0; i--) { const p = pieces[i]; if (p.placed) continue; if (p.cells.some(([a, b]) => dist(x, y, p.x + a * s2, p.y + b * s2) < s2 * 0.75)) { drag = { p, ox: p.x - x, oy: p.y - y }; moved = false; Sfx.play('tap'); return; } }
      // eingeräumte Teile wieder herausnehmen
      const gx = Math.floor((x - ox) / cs), gy = Math.floor((y - oy) / cs); if (gx < 0 || gy < 0 || gx >= C || gy >= R) return;
      const k = grid[gy * C + gx]; if (k < 0) return; const p = pieces[k]; p.cells.forEach(([a, b]) => (grid[(p.placed[1] + b) * C + p.placed[0] + a] = -1)); p.placed = null; p.x = x; p.y = y; drag = { p, ox: 0, oy: 0 }; moved = true;
    },
    move(x, y) { if (drag) { if (dist(x + drag.ox, y + drag.oy, drag.p.x, drag.p.y) > 4) moved = true; drag.p.x = x + drag.ox; drag.p.y = y + drag.oy; } },
    up() {
      if (!drag) return; const p = drag.p; drag = null;
      if (!moved) { p.cells = norm(p.cells.map(([a, b]) => [b, -a])); Sfx.note(600, 0.06, 'sine', 0.04); return; }   // drehen
      const gx = Math.round((p.x - cs / 2 - ox) / cs), gy = Math.round((p.y - cs / 2 - oy) / cs);
      if (fits(p, gx, gy)) { p.placed = [gx, gy]; p.cells.forEach(([a, b]) => (grid[(gy + b) * C + gx + a] = pieces.indexOf(p))); Sfx.play('good'); env.burst(ox + gx * cs + cs / 2, oy + gy * cs + cs / 2, 8); if (grid.every(v => v >= 0)) fin.set(0.6); }
      else { p.x = p.hx; p.y = p.hy; }
    },
  };
} };

// 8) Flammkuchen backen: im Ofen beobachten und genau dann herausholen, wenn er goldbraun ist
GAMES.pizzaofen = { make(env) {
  const r = env.r, L = LVL(env), need = 5 + L * 2, n = 2 + (L ? 1 : 0);
  const S = [...Array(n)].map((_, i) => ({ y: 120 + i * 120, b: 0, sp: 0, on: false, out: 0, wait: 0.5 + i * 0.9 }));
  let got = 0, t = 0, fly = []; const fin = finisher(env);
  const W1 = 0.62, W2 = 0.82 - L * 0.04;   // goldbraun-Bereich
  return {
    hint: { type: 'tap', x: 200, y: S[0].y + 40 },
    update(dt) {
      t += dt;
      S.forEach(s => {
        if (!s.on) { s.wait -= dt; if (s.wait <= 0) { s.on = true; s.b = 0; s.sp = (0.16 + r() * 0.08 + L * 0.06) * (1 + got / need * 0.4); } return; }
        s.b += s.sp * dt; if (s.b >= 1.15) { s.on = false; s.wait = 0.8; Sfx.play('bad'); got = Math.max(0, got - 1); fly.push({ y: s.y, t: 0, burnt: true }); }
      });
      fly.forEach(f => (f.t += dt)); fly = fly.filter(f => f.t < 0.8);
      fin.tick(dt);
    },
    draw(c) {
      c.fillStyle = '#212529'; c.fillRect(0, 0, GAME_W, GAME_H);
      txt(c, got + ' / ' + need, 200, 40, 22, '#fff', 'center', BRAND.olive);
      S.forEach(s => {
        rrPath(c, 40, s.y, 320, 96, 14); fs(c, '#343a40', 3); rrPath(c, 56, s.y + 14, 288, 68, 10); c.fillStyle = `rgba(255,${120 + Math.sin(t * 6 + s.y) * 20},40,.35)`; c.fill();
        for (let k = 0; k < 4; k++) { ell(c, 80 + k * 80, s.y + 80, 22, 6); c.fillStyle = `rgba(255,${150 + Math.sin(t * 10 + k) * 40},50,.5)`; c.fill(); }
        if (s.on) { const b = clamp(s.b, 0, 1.15), col = b < 0.35 ? '#fdf0d5' : b < W1 ? '#f6d38d' : b < W2 ? '#e09f3e' : b < 1 ? '#9c6644' : '#3d2c1f';
          c.save(); c.translate(200 + Math.sin(t * 2 + s.y) * 4, s.y + 48); rrPath(c, -100, -26, 200, 52, 14); fs(c, col, 3); for (let k = 0; k < 8; k++) { ell(c, -80 + k * 23, -6 + (k % 3) * 8, 6, 4); c.fillStyle = k % 2 ? '#c1121f' : '#fff3b0'; c.fill(); } if (b > 1) for (let k = 0; k < 3; k++) { ell(c, -40 + k * 40, -40 - ((t * 30 + k * 10) % 30), 12, 9); c.fillStyle = 'rgba(120,120,120,.5)'; c.fill(); } c.restore();
          rrPath(c, 300, s.y + 10, 16, 76, 8); c.fillStyle = 'rgba(255,255,255,.15)'; c.fill(); rrPath(c, 300, s.y + 10 + 76 * (1 - W2), 16, 76 * (W2 - W1), 6); c.fillStyle = 'rgba(6,214,160,.6)'; c.fill(); ell(c, 308, s.y + 10 + 76 * (1 - clamp(b, 0, 1)), 9, 5); fs(c, '#fff', 2); }
      });
      fly.forEach(f => { c.globalAlpha = 1 - f.t / 0.8; txt(c, f.burnt ? 'Verbrannt!' : 'Perfekt!', 200, f.y + 40 - f.t * 40, 24, f.burnt ? '#ef476f' : '#80ed99', 'center', '#fff'); c.globalAlpha = 1; });
      // Flammkuchen-Schieber
      rrPath(c, 150, 470, 100, 20, 6); fs(c, '#c08b55', 2.5); rrPath(c, 192, 488, 16, 40, 4); fs(c, '#8d5a3b', 2);
    },
    down(x, y) {
      if (fin.on()) return; const s = S.find(q => y > q.y && y < q.y + 96); if (!s || !s.on) return;
      s.on = false; s.wait = 0.6 + r() * 0.6;
      if (s.b >= W1 && s.b <= W2) { got++; Sfx.play('good'); env.burst(200, s.y + 48, 14); fly.push({ y: s.y, t: 0 }); if (got >= need) fin.set(0.5); }
      else { Sfx.play('bad'); fly.push({ y: s.y, t: 0, burnt: s.b > W2 }); if (s.b < W1) fly[fly.length - 1].raw = true; }
    },
  };
} };

const KITCHEN_GAMES = ['schnippeln', 'ruehren', 'ueberkochen', 'pfannkuchen', 'kneten', 'eier', 'kuehlpacken', 'pizzaofen'];
Object.assign(HELP_TEXT, {
  schnippeln: 'Das Gemüse rollt am Messer vorbei. Tippe genau dann, wenn eine gestrichelte Schnittlinie unter dem Messer ist.',
  ruehren: 'Die Töpfe werden immer heißer. Leg den Finger in einen Topf und rühr im Kreis, damit nichts anbrennt – bis die Zeit-Leiste voll ist.',
  ueberkochen: 'Bei einem Topf steigt der Schaum! Tippe ihn schnell an, bevor er überkocht.',
  pfannkuchen: 'Beweg die Pfanne mit dem Finger. Tippe, dann fliegt der Pfannkuchen hoch – fang ihn mit der Pfanne wieder auf.',
  kneten: 'Wisch schnell hin und her über den Teig, bis die Leiste voll ist. Hörst du auf, fällt der Teig wieder zusammen.',
  eier: 'Das Ei schwingt hin und her. Tippe genau dann, wenn es über der Mitte der Schüssel ist.',
  kuehlpacken: 'Räum alles in den Kühlschrank, sodass kein Fach frei bleibt. Zieh die Sachen hinein – kurz antippen dreht sie.',
  pizzaofen: 'Die Flammkuchen backen im Ofen. Tippe auf einen Flammkuchen, wenn er goldbraun ist – der Zeiger steht dann im grünen Bereich.',
});
