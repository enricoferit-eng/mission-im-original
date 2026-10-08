'use strict';
// ---------- Anleitung als Video + Mitmachen (getrennt von der Geschichte) ----------
// Jedes Kapitel: erst läuft eine kleine Animation (vorgelesen), dann probiert das Kind es selbst aus.
const TV = { w: 600, h: 360 };   // Größe der "Video"-Fläche (wird skaliert)

function tvGround(c) {
  c.fillStyle = CHIP_BASE; c.fillRect(0, 0, TV.w, TV.h);
  for (let i = 0; i < 260; i++) { c.fillStyle = CHIP_COLS[i % 6]; ell(c, (i * 97.3) % TV.w, (i * 61.7) % TV.h, 3, 1.4, i); c.fill(); }
}
function tvHand(c, x, y, press) { drawHand(c, x + 8, y + 6 + (press ? 6 : 0), 1.6); if (press) { ell(c, x, y, 20, 20); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.8)'; c.stroke(); } }
function tvBubble(c, x, y, kind) {
  const col = { neu: '#ffd23f', sucht: '#118ab2', fertig: '#06d6a0', erledigt: '#06d6a0' }[kind];
  polyPath(c, [[x - 6, y + 16], [x + 6, y + 16], [x, y + 26]]); fs(c, col, 2.5); ell(c, x, y, 19, 19); fs(c, col, 3);
  if (kind === 'neu') txt(c, '!', x, y + 1, 24, OL, 'center', null);
  else if (kind === 'sucht') icon(c, 'search', x, y, 24);
  else if (kind === 'fertig') icon(c, 'bag', x, y, 24);
  else icon(c, 'check', x, y, 22);
}

const TUT_CHAPTERS = [
  { title: 'Willkommen!', dur: 5,
    say: 'Hallo, neuer Helfer! In dieser Anleitung lernst du alles, was du zum Spielen brauchst. Schau zu, und dann probierst du es selbst aus.',
    draw(c, t, S) { tvGround(c); drawCritter(c, 'baer', 420, 280, 2.4, t, { chef: true, wave: true }); drawAnimal(c, S.kind, 200, 290, 2.6, { t, moving: false, cap: false }); drawLogo(c, 300, 70, 220, true); } },
  { title: 'Laufen: antippen', dur: 4.5,
    say: 'Tippe einfach auf eine Stelle auf dem Boden. Dein Tier läuft dann genau dorthin.',
    try: 'Jetzt du: Tippe auf den grünen Kreis!',
    draw(c, t, S) {
      tvGround(c);
      if (!S.trying) { const k = clamp((t - 1) / 2.5, 0, 1); S.cx = lerp(120, 380, ease.inout(k)); S.cy = lerp(280, 170, ease.inout(k)); if (t > 0.6 && t < 1.2) tvHand(c, 380, 170, true); ell(c, 380, 170, 22, 9); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke(); }
      else { const pu = 0.5 + 0.5 * Math.sin(t * 5); ell(c, 500, 290, 30 + pu * 6, 14 + pu * 3); c.lineWidth = 5; c.strokeStyle = BRAND.lime; c.stroke(); }
      if (S.trying) tvMove(S, 0.016); else { S.moving = t > 1 && t < 3.5; S.dir = 1; }
      drawAnimal(c, S.kind, S.cx, S.cy, 1.6, { t, moving: S.moving, dir: S.dir });
    },
    start(S) { S.cx = 380; S.cy = 170; S.tx = null; },
    tap(S, x, y) { S.tx = x; S.ty = y; },
    check(S) { return dist(S.cx, S.cy, 500, 290) < 40; } },
  { title: 'Laufen: Finger ziehen', dur: 4.5,
    say: 'Du kannst auch den Finger auf den Bildschirm legen und ihn in eine Richtung schieben – wie mit einem Joystick. Dein Tier läuft, solange du schiebst.',
    try: 'Jetzt du: Leg den Finger hin und schieb dein Tier zum grünen Kreis!',
    draw(c, t, S) {
      tvGround(c);
      if (!S.trying) {
        const k = clamp((t - 0.8) / 3, 0, 1); S.cx = lerp(450, 200, k); S.cy = 260;
        ell(c, 300, 300, 40, 40); c.fillStyle = 'rgba(255,255,255,.2)'; c.fill(); ell(c, 300 - k * 34, 300, 18, 18); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill(); tvHand(c, 300 - k * 34, 300, false);
      } else {
        const pu = 0.5 + 0.5 * Math.sin(t * 5); ell(c, 110, 120, 30 + pu * 6, 14 + pu * 3); c.lineWidth = 5; c.strokeStyle = BRAND.lime; c.stroke();
        if (S.joy) { ell(c, S.joy.x0, S.joy.y0, 40, 40); c.fillStyle = 'rgba(255,255,255,.2)'; c.fill(); }
        if (S.joy && S.joy.x !== undefined) { const dx = S.joy.x - S.joy.x0, dy = S.joy.y - S.joy.y0, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 40); S.cx = clamp(S.cx + (dx / d) * k * 3, 30, 570); S.cy = clamp(S.cy + (dy / d) * k * 3, 40, 340); S.dir = dx > 0 ? 1 : -1; }
      }
      drawAnimal(c, S.kind, S.cx, S.cy, 1.6, { t, moving: !!S.joy || !S.trying, dir: S.trying ? S.dir : -1 });
    },
    start(S) { S.cx = 450; S.cy = 280; S.dir = -1; },
    press(S, x, y) { S.joy = { x0: x, y0: y }; }, drag(S, x, y) { if (S.joy) { S.joy.x = x; S.joy.y = y; } }, release(S) { S.joy = null; },
    check(S) { return dist(S.cx, S.cy, 110, 120) < 45; } },
  { title: 'Treppe und Rutsche', dur: 6,
    say: 'Ins obere Stockwerk vom Spielhaus kommst du nur über die Treppe. Runter geht es über die Treppe oder ganz schnell über die Rutsche. Unter das Spielhaus kann man nicht gehen.',
    draw(c, t, S) {
      tvGround(c);
      rrPath(c, 220, 150, 140, 110, 6); fs(c, '#2e2117', 3); rrPath(c, 214, 100, 152, 60, 6); fs(c, '#a06a38', 3);
      polyPath(c, [[200, 102], [290, 30], [380, 102]]); fs(c, '#9e3b2f', 3);
      for (let k = 0; k < 6; k++) { rrPath(c, 270, 165 + k * 20, 40, 10, 4); fs(c, '#b07a45', 2); }
      polyPath(c, [[366, 120], [520, 240], [520, 258], [366, 140]]); fs(c, '#dee2e6', 3);
      icon(c, 'cross', 240, 215, 34, '#ef476f');
      const k = (t % 6) / 6; let x, y;
      if (k < 0.4) { x = 290; y = lerp(300, 130, k / 0.4); } else if (k < 0.55) { x = lerp(290, 360, (k - 0.4) / 0.15); y = 130; } else { x = lerp(370, 520, (k - 0.55) / 0.45); y = lerp(126, 250, (k - 0.55) / 0.45); }
      drawAnimal(c, S.kind, x, y, 1.3, { t, moving: k < 0.55, tilt: k > 0.55 ? -0.35 : 0 });
    } },
  { title: 'Die Mitarbeiter', dur: 9,
    say: 'Im Original arbeitet ein nettes Team. Wer ein gelbes Ausrufezeichen hat, hat einen Auftrag für dich. Eine blaue Lupe heißt: Du suchst gerade für ihn. Eine grüne Tasche heißt: Du hast alles gefunden, bring es zurück. Ein grüner Haken heißt: erledigt. Bei einem Stern musst du nichts suchen – da starten die Aufgaben sofort.',
    try: 'Jetzt du: Tippe den Mitarbeiter mit dem gelben Ausrufezeichen an!',
    draw(c, t, S) {
      tvGround(c);
      const staff = [['hase', 'neu'], ['fuchs', 'sucht'], ['igel', 'fertig'], ['waschbaer', 'erledigt']];
      staff.forEach(([id, b], i) => {
        const x = 90 + i * 140, show = S.trying ? i === 0 : t > 1 + i * 1.6;
        drawCritter(c, id, x, 250, 1.6, t + i, { staff: true });
        if (show) { tvBubble(c, x, 150 + Math.sin(t * 4 + i) * 4, b); if (!S.trying) txt(c, ['neuer Auftrag', 'du suchst', 'alles gefunden', 'erledigt'][i], x, 300, 15, '#fff', 'center', BRAND.olive); }
      });
      if (S.trying && S.ok) { rrPath(c, 150, 40, 300, 90, 16); fs(c, '#fff', 3); drawFood(c, 'eisclown', 230, 85, 44); drawItem(c, 'ball', 300, 85, 44); drawItem(c, 'frisbee', 370, 85, 44); }
    },
    tap(S, x, y) { if (dist(x, y, 90, 220) < 60) { S.ok = true; Sfx.play('good'); } },
    check(S) { return S.ok; } },
  { title: 'Suchen mit der Lupe', dur: 8,
    say: 'Die Sachen liegen hinter Steinen und Büschen oder gucken aus den Hackschnitzeln. Geh nah heran und tippe auf die Lupe. Aber Vorsicht: Manchmal ist es nur ein Stöckchen, ein Blatt oder ein Kronkorken!',
    try: 'Jetzt du: Dein Tier steht am Stein. Tippe auf die Lupe!',
    draw(c, t, S) {
      tvGround(c);
      drawItem(c, 'ball', 352, 200, 40); drawRock(c, 330, 222, 34, S.shake || 0);
      drawJunk(c, 160, 280, 'twig', 1.6);
      const found = S.trying ? S.ok : t > 4.5;
      const x = S.trying ? 270 : lerp(120, 270, clamp((t - 0.5) / 2, 0, 1));
      drawAnimal(c, S.kind, x, 240, 1.5, { t, moving: !S.trying && t < 2.5, tilt: !S.trying && t > 3 && t < 4.5 ? Math.abs(Math.sin(t * 18)) * 0.25 : 0 });
      const pu = S.trying && !S.ok ? 1 + Math.sin(t * 6) * 0.08 : 1;
      c.save(); c.translate(540, 300); c.scale(pu, pu); roundBtn(c, 0, 0, 34, !S.trying && t > 3 && t < 4.5 ? '#ffd166' : '#fff', 'search', null); c.restore();
      if (!S.trying && t > 2.6 && t < 3.4) tvHand(c, 540, 300, true);
      if (found) { const k = ease.back(clamp(((S.trying ? S.okT : t - 4.5)) * 3, 0, 1)); c.save(); c.translate(330, 130); c.scale(k, k); ell(c, 0, 0, 30, 30); fs(c, '#fff7e6', 3); drawItem(c, 'ball', 0, 0, 40); c.restore(); txt(c, 'Ball gefunden!', 330, 90, 18, '#fff', 'center', BRAND.olive); }
      if (!S.trying && t > 6) txt(c, 'Nur ein Stöckchen …', 160, 220, 16, '#fff', 'center', BRAND.olive);
    },
    tap(S, x, y) { if (dist(x, y, 540, 300) < 46 && !S.ok) { S.ok = true; S.okT = 0; Sfx.play('good'); } },
    tick(S, dt) { if (S.ok) S.okT = (S.okT || 0) + dt; },
    check(S) { return S.ok && S.okT > 1; } },
  { title: 'Hilfen beim Suchen', dur: 9,
    say: 'Bei zwei Sternen zeigt dir die Spürnase, wie nah du an einem Versteck bist: viele rote Striche heißt ganz nah. Bei drei Sternen glitzert es nur kurz. Und wenn du zweieinhalb Minuten nichts findest, füllt sich der Hilfe-Stern. Tippe ihn an, dann zeigt dir ein großer Pfeil ein Versteck.',
    draw(c, t, S) {
      tvGround(c); drawYucca(c, 470, 220, 1.4, t);
      const k = clamp(t / 4, 0, 1), heat = 1 + Math.floor(k * 4.9);
      drawAnimal(c, S.kind, lerp(100, 380, k), 250, 1.4, { t, moving: t < 4 });
      panel(c, 30, 30, 90, 80, '#3d2c1f', 16); ell(c, 75, 55, 14, 10); fs(c, '#2b1d14', 2.5, '#000');
      const cols = ['#4dabf7', '#74c0fc', '#ffd166', '#f78c6b', '#ef476f']; for (let i = 0; i < 5; i++) { rrPath(c, 42 + i * 14, 100 - (i + 1) * 6, 10, (i + 1) * 6, 2); c.fillStyle = i < heat ? cols[heat - 1] : 'rgba(255,255,255,.2)'; c.fill(); }
      const f = clamp((t - 4.5) / 2.5, 0, 1);
      ell(c, 540, 70, 32, 32); fs(c, f >= 1 ? '#ffd166' : '#e9ecef', 4); if (f < 1) { c.beginPath(); c.moveTo(540, 70); c.arc(540, 70, 26, -Math.PI / 2, -Math.PI / 2 + f * TAU); c.closePath(); c.fillStyle = 'rgba(255,209,102,.7)'; c.fill(); } icon(c, 'star', 540, 70, 32, f >= 1 ? '#fff' : '#adb5bd');
      if (t > 7.4) { const b = Math.abs(Math.sin(t * 4)) * 12; polyPath(c, [[460, 110 - b], [480, 110 - b], [480, 135 - b], [494, 135 - b], [470, 165 - b], [446, 135 - b], [460, 135 - b]]); fs(c, '#ffd23f', 3); }
    } },
  { title: 'Dinge verdienen', dur: 8,
    say: 'Hast du etwas gefunden, verdienst du es dir mit einem Rätsel oder einer Geschicklichkeits-Aufgabe. Beim ersten Mal wird jede Aufgabe erklärt, und das Fragezeichen erklärt sie jederzeit nochmal. Bei drei Sternen hast du in Geschicklichkeits-Aufgaben drei Herzen und eine Zeit-Leiste – sammle Uhren für mehr Zeit.',
    try: 'Jetzt du: Lass die 3 Luftballons platzen!',
    draw(c, t, S) {
      c.fillStyle = '#cfe8ef'; c.fillRect(0, 0, TV.w, TV.h);
      if (!S.trying) {
        for (let i = 0; i < 3; i++) icon(c, 'heart', 60 + i * 44, 40, 36);
        rrPath(c, 200, 26, 340, 28, 14); fs(c, '#1f150e', 3); rrPath(c, 203, 29, 334 * (1 - (t % 8) / 10), 22, 11); c.fillStyle = '#06d6a0'; c.fill(); icon(c, 'clock', 186, 40, 30);
        for (let k = 0; k < 9; k++) { const x = 220 + (k % 3) * 60, y = 120 + Math.floor(k / 3) * 60; c.save(); c.translate(x, y); c.rotate((Math.floor(t * 1.5 + k) % 4) * Math.PI / 2); rrPath(c, -26, -26, 52, 52, 8); fs(c, '#f8f9fa', 2.5); line(c, 0, 0, 26, 0, 10, k % 2 ? '#ffd43b' : '#ced4da'); line(c, 0, 0, 0, -26, 10, k % 2 ? '#ffd43b' : '#ced4da'); c.restore(); }
        roundBtn(c, 540, 300, 26, '#bde0fe', 'question', null, '#118ab2');
      } else {
        (S.balloons || []).forEach(b => { if (b.pop) return; ell(c, b.x, b.y, 28, 34); fs(c, b.col, 3); c.beginPath(); c.moveTo(b.x, b.y + 34); c.quadraticCurveTo(b.x + 8, b.y + 50, b.x, b.y + 66); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); });
      }
    },
    start(S) { S.balloons = [{ x: 150, y: 170, col: '#ef476f' }, { x: 300, y: 130, col: '#ffd166' }, { x: 450, y: 190, col: '#06d6a0' }]; },
    tap(S, x, y) { for (const b of S.balloons || []) if (!b.pop && dist(x, y, b.x, b.y) < 45) { b.pop = true; Sfx.play('pop'); FX.sparkle(TUT_REF.toS(b.x, b.y).x, TUT_REF.toS(b.x, b.y).y, 12); } },
    check(S) { return (S.balloons || []).every(b => b.pop); } },
  { title: 'Schnell sein!', dur: 10,
    say: 'Vor jeder Aufgabe zählt es: 3, 2, 1, los! Oben brennt eine Zündschnur. Erreicht die Flamme einen Stern, fällt er herunter. Wer schnell ist, behält alle drei Sterne. Schaffst du mehrere Treffer schnell hintereinander, gibt es eine Combo – dann wird die Zündschnur wieder länger.',
    try: 'Jetzt du: Tippe schnell die 5 Eisclowns an – mach eine Combo!',
    draw(c, t, S) {
      c.fillStyle = '#e9f5db'; c.fillRect(0, 0, TV.w, TV.h);
      // Sterne + Zündschnur
      const fuse = S.trying ? clamp(1 - (S.tt || 0) / 12 + (S.bonus || 0), 0, 1) : clamp(1 - (t - 3) / 6, 0, 1), lost = !S.trying && t > 8.4;
      for (let i = 0; i < 3; i++) { if (lost && i === 2) { c.save(); const k = t - 8.4; c.translate(150 + k * 40, 40 + 300 * k * k); c.rotate(k * 6); icon(c, 'star', 0, 0, 34); c.restore(); continue; } icon(c, 'star', 70 + i * 40, 40, 34); }
      line(c, 200, 40, 560, 40, 9, '#3d2c1f'); const ex = lerp(200, 560, fuse); line(c, 200, 40, ex, 40, 6, '#f4a261', false);
      for (let k = 0; k < 3; k++) { const a = t * 17 + k * 2.1; ell(c, ex + Math.cos(a) * 6, 40 + Math.sin(a) * 6, 4, 4); c.fillStyle = ['#fff3b0', '#ffd166', '#ef476f'][k]; c.fill(); }
      if (!S.trying && t < 3) { const n = 3 - Math.floor(t), fr = t % 1, k = ease.back(clamp(fr * 3, 0, 1)); c.save(); c.translate(300, 200); c.scale(k * 1.4, k * 1.4); ell(c, 0, 0, 50, 50); fs(c, ['#06d6a0', '#ffd166', '#ef476f'][n - 1], 5); txt(c, String(n), 0, 3, 60, '#fff', 'center', OL); c.restore(); }
      if (!S.trying && t >= 3 && t < 3.8) { const k = ease.back(clamp((t - 3) * 4, 0, 1)); c.save(); c.translate(300, 200); c.scale(k * 1.3, k * 1.3); rrPath(c, -90, -36, 180, 72, 36); fs(c, BRAND.lime, 5); txt(c, 'LOS!', 0, 3, 50, '#fff', 'center', OL); c.restore(); }
      if (!S.trying && t > 5 && t < 8) { const k = ease.back(clamp((t - 5) * 4, 0, 1)); c.save(); c.translate(300, 190 - (t - 5) * 15); c.scale(k, k); txt(c, 'Combo x3', 0, 0, 34, '#ffd23f', 'center', OL); txt(c, '+1.5 s', 0, 40, 24, '#80ed99', 'center', OL); c.restore(); }
      if (S.trying) {
        (S.tg || []).forEach(g => { if (g.hit) return; drawFood(c, 'eisclown', g.x, g.y, 54); });
        if (S.combo >= 2) txt(c, 'Combo x' + S.combo, 300, 330, 26, '#ffd23f', 'center', OL);
      }
    },
    start(S) { S.tt = 0; S.combo = 0; S.last = -9; S.bonus = 0; S.tg = [...Array(5)].map((_, i) => ({ x: 90 + i * 105, y: 150 + (i % 2) * 90, vx: (i % 2 ? 1 : -1) * (70 + i * 12), vy: (i % 3 - 1) * 50, hit: false })); },
    tick(S, dt) {
      if (!S.trying) return; S.tt += dt;
      (S.tg || []).forEach(g => { g.x += g.vx * dt; g.y += g.vy * dt; if (g.x < 40 || g.x > 560) g.vx *= -1; if (g.y < 90 || g.y > 320) g.vy *= -1; });
      if (S.done) return; if (S.tg.every(g => g.hit)) S.ok = true;
    },
    tap(S, x, y) {
      const g = (S.tg || []).find(q => !q.hit && dist(x, y, q.x, q.y) < 46); if (!g) return;
      g.hit = true; S.combo = S.tt - S.last < 2.6 ? S.combo + 1 : 1; S.last = S.tt; if (S.combo >= 2) S.bonus += 0.04;
      Sfx.note(523 * Math.pow(2, Math.min(S.combo - 1, 12) / 6), 0.14, 'triangle', 0.07, 1.5); const p = TUT_REF.toS(g.x, g.y); FX.sparkle(p.x, p.y, 12, '#ffd23f');
    },
    check(S) { return S.ok; } },
  { title: 'Der Joker', dur: 10,
    say: 'Kommst du bei einer Aufgabe gar nicht weiter? Dann hilft dir der Joker. Er erscheint unten links, wenn du lange brauchst oder verloren hast. Tippe ihn an, dann ist die Aufgabe sofort geschafft. Aber Achtung: Du hast nur 3 Joker pro Bereich. Die rote Zahl zeigt, wie viele du noch hast. Extra-Joker gibt es, wenn du einem Mitarbeiter hilfst, bevor die Bonus-Uhr abläuft – und wenn du alle 8 Original-Blätter findest.',
    try: 'Jetzt du: Tippe auf den Joker!',
    draw(c, t, S) {
      c.fillStyle = '#cfe8ef'; c.fillRect(0, 0, TV.w, TV.h);
      // Rätsel, bei dem man nicht weiterkommt
      for (let k = 0; k < 9; k++) { const x = 230 + (k % 3) * 60, y = 90 + Math.floor(k / 3) * 60; c.save(); c.translate(x, y); c.rotate(((k * 7) % 4) * Math.PI / 2); rrPath(c, -26, -26, 52, 52, 8); fs(c, '#f8f9fa', 2.5); line(c, 0, 0, 26, 0, 10, '#ced4da'); line(c, 0, 0, 0, -26, 10, '#ced4da'); c.restore(); }
      const done = S.trying ? S.ok : t > 7;
      const show = S.trying || t > 2.5, jx = 70, jy = 300;
      if (!S.trying && !done) { const sec = Math.floor(t * 9); txt(c, 'Zeit: ' + Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'), 520, 30, 18, '#3d2c1f', 'center', null); if (t < 2.5) txt(c, '?', 400 + Math.sin(t * 3) * 6, 70, 40, '#ef476f', 'center', OL); }
      if (show && !done) {
        const pop = ease.back(clamp((S.trying ? 1 : t - 2.5) * 3, 0, 1)), pu = 1 + Math.sin(t * 6) * 0.07;
        c.save(); c.translate(jx, jy); c.scale(pop * pu, pop * pu); ell(c, 0, 0, 42, 42); c.fillStyle = 'rgba(255,210,63,.4)'; c.fill(); roundBtn(c, 0, 0, 34, '#fff7e6', 'joker', null);
        ell(c, 26, -26, 13, 13); fs(c, '#ef476f', 2.5); txt(c, String(S.left || 3), 26, -25, 15, '#fff', 'center', null); c.restore();
        txt(c, 'Kommst du nicht weiter? Tippe auf den Joker!', jx + 50, jy, 15, '#3d2c1f', 'left', null);
        if (!S.trying && t > 5.6 && t < 7) tvHand(c, jx, jy, t > 6.2);
      }
      if (done) {
        c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(0, 0, TV.w, TV.h);
        const k = ease.back(clamp(((S.trying ? S.okT : t - 7)) * 3, 0, 1)); c.save(); c.translate(290, 150); c.scale(k, k); ell(c, 0, 0, 60, 60); fs(c, '#06d6a0', 5); icon(c, 'check', 0, 0, 80); c.restore();
        txt(c, 'Aufgabe geschafft – noch 2 Joker', 290, 250, 18, '#fff', 'center', BRAND.olive);
      }
    },
    start(S) { S.left = 3; S.ok = false; S.okT = 0; },
    tap(S, x, y) { if (!S.ok && dist(x, y, 70, 300) < 50) { S.ok = true; S.okT = 0; S.left = 2; Sfx.play('win'); } },
    tick(S, dt) { if (S.ok) S.okT += dt; },
    check(S) { return S.ok && S.okT > 1; } },
  { title: 'Zurückbringen und das Tor', dur: 9,
    say: 'Hast du alles gefunden, bring es zurück zum Mitarbeiter und tippe ihn an. Sind alle fünf Mitarbeiter zufrieden, wartet am Tor zum Parkplatz die letzte große Aufgabe. Danach geht das Tor auf – und du hast den Bereich geschafft!',
    draw(c, t, S) {
      tvGround(c);
      c.fillStyle = '#6c757d'; c.fillRect(0, 300, TV.w, 60);
      const open = clamp((t - 5.5) / 1, 0, 1);
      drawGate(c, 420, 300, 1, open, t < 5.5, t);
      drawCritter(c, 'fuchs', 140, 220, 1.6, t, { staff: true, wave: t > 1.5 && t < 4 });
      tvBubble(c, 140, 120 + Math.sin(t * 4) * 4, t < 2.5 ? 'fertig' : 'erledigt');
      const x = t < 2 ? lerp(320, 190, t / 2) : t < 6 ? 190 + (t - 2) * 0 : lerp(190, 420, clamp((t - 6) / 1.5, 0, 1)), y = t < 6.5 ? 230 : lerp(230, 330, clamp((t - 7.5) / 1, 0, 1));
      drawAnimal(c, S.kind, x, y, 1.5, { t, moving: t < 2 || t > 6 });
      if (t > 2.2 && t < 5) { const k = ease.back(clamp((t - 2.2) * 3, 0, 1)); c.save(); c.translate(300, 70); c.scale(k, k); claimBand(c, 'Danke für deine Hilfe!', 0, 0, 18); c.restore(); }
    } },
  { title: 'Deine Belohnung', dur: 8,
    say: 'Für jeden geschafften Bereich bekommst du ein neues Teil für deine Uniform. Und das Glücksrad dreht sich: Du gewinnst einen Skin – manche sind selten, manche sogar legendär mit einer besonderen Fähigkeit. Alle Skins findest du im Kleiderschrank.',
    draw(c, t, S) {
      c.fillStyle = BRAND.olive; c.fillRect(0, 0, TV.w, TV.h);
      const ang = t < 4 ? (1 - Math.pow(1 - t / 4, 3)) * TAU * 4 : TAU * 4;
      c.save(); c.translate(180, 190); c.rotate(ang);
      for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 120, (i / 6) * TAU, ((i + 1) / 6) * TAU); c.closePath(); fs(c, i === 5 ? '#ffc300' : i === 4 ? '#74c0fc' : i % 2 ? '#fbf8f2' : BRAND.apricot, 3); }
      c.restore(); polyPath(c, [[166, 52], [194, 52], [180, 80]]); fs(c, '#ef476f', 3);
      if (t > 4.2) { drawAnimal(c, S.kind, 430, 250, 2.3, { t, cap: true, look: SKINS[stageSkins('spielplatz', 'hard')[5]] }); rrPath(c, 360, 40, 140, 32, 16); fs(c, '#ffc300', 3); txt(c, 'Legendär!', 430, 56, 18, '#fff', 'center', BRAND.ink); }
      if (t > 6) roundBtn(c, 540, 310, 30, '#ffd166', 'hanger', null);
    } },
  { title: 'Die Knöpfe', dur: 8,
    say: 'Der rote Stopp-Knopf beendet das Spiel sofort – alles ist gespeichert. Das Fragezeichen erklärt dir alles. Mit dem Lautsprecher schaltest du Ton und Vorlesen an oder aus. Das Buch im Menü öffnet diese Anleitung, und der Bügel ist dein Kleiderschrank.',
    try: 'Jetzt du: Tippe auf den Lautsprecher!',
    draw(c, t, S) {
      c.fillStyle = '#9fd3e6'; c.fillRect(0, 0, TV.w, TV.h);
      const B = [['stop', '#fff', 'Stopp'], ['question', '#bde0fe', 'Erklärung'], ['sound', '#d0ebff', 'Ton & Vorlesen'], ['book', '#ffd166', 'Anleitung'], ['hanger', '#ffd166', 'Kleiderschrank']];
      B.forEach(([ic, bg, label], i) => {
        const show = S.trying || t > 0.6 + i * 1.3; if (!show) return;
        const x = 70 + i * 115, y = 170, hl = S.trying && i === 2 && !S.ok, pu = hl ? 1 + Math.sin(t * 6) * 0.1 : 1;
        c.save(); c.translate(x, y); c.scale(pu, pu); roundBtn(c, 0, 0, 34, bg, ic, null, ic === 'question' ? '#118ab2' : undefined); c.restore();
        txt(c, label, x, y + 60, 15, '#fff', 'center', BRAND.olive);
      });
      if (S.ok) txt(c, 'Super!', 300, 70, 30, '#fff', 'center', BRAND.olive);
    },
    tap(S, x, y) { if (dist(x, y, 300, 170) < 44) { S.ok = true; Sfx.play('good'); } },
    check(S) { return S.ok; } },
  { title: 'Los geht’s!', dur: 4,
    say: 'Super! Jetzt weißt du alles. Viel Spaß im Original!',
    draw(c, t, S) { tvGround(c); drawLogo(c, 300, 80, 240, true); drawAnimal(c, S.kind, 300, 300 - Math.abs(Math.sin(t * 5)) * 30, 2.4, { t, cap: true }); if (Math.floor(t * 3) !== Math.floor((t - 0.016) * 3)) FX.confetti(TUT_REF.toS(300, 100).x, TUT_REF.toS(300, 100).y, 10); } },
];
let TUT_REF = null;
function tvMove(S, dt) {
  if (S.tx === null || S.tx === undefined) { S.moving = false; return; }
  const dx = S.tx - S.cx, dy = S.ty - S.cy, d = Math.hypot(dx, dy);
  if (d < 4) { S.tx = null; S.moving = false; return; }
  S.cx += (dx / d) * Math.min(d, 220 * dt); S.cy += (dy / d) * Math.min(d, 220 * dt); S.moving = true; S.dir = dx > 0 ? 1 : -1;
}

class Tutorial {
  constructor(next) { this.next = next || (() => setScene(new Menu())); this.i = 0; this.t = 0; this.S = {}; this.paused = false; TUT_REF = this; }
  enter() { FX.clear(); this.begin(0); }
  begin(i) {
    this.i = i; this.t = 0; this.S = { kind: ANIMAL_OF.medium, trying: false, ok: false, cx: 0, cy: 0 };
    const ch = TUT_CHAPTERS[i]; if (ch.start) ch.start(this.S); Voice.say(ch.say, true);
  }
  ch() { return TUT_CHAPTERS[this.i]; }
  finish() { const a = ACC(); if (a) { a.tut.guide = true; Save.write(); } Voice.stop(); this.next(); }
  layout() {
    const land = W > H; let vx, vy, vw, vh;
    if (land) { vw = Math.min(W * 0.62, (H - 90) * TV.w / TV.h); vh = vw * TV.h / TV.w; vx = 16; vy = 64; }
    else { vw = W - 24; vh = vw * TV.h / TV.w; vx = 12; vy = 70; }
    this.v = { x: vx, y: vy, w: vw, h: vh, s: vw / TV.w, land };
  }
  toV(x, y) { this.layout(); return { x: (x - this.v.x) / this.v.s, y: (y - this.v.y) / this.v.s }; }
  toS(x, y) { if (!this.v) this.layout(); return { x: this.v.x + x * this.v.s, y: this.v.y + y * this.v.s }; }
  update(dt) {
    if (this.paused) return;
    this.t += dt; const ch = this.ch(), S = this.S;
    if (ch.tick) ch.tick(S, dt);
    // weiter erst, wenn die Animation durch ist UND der Erzähler fertig gesprochen hat
    const est = ch.say.split(' ').length / 2.1 + 1;   // geschätzte Vorlesezeit, falls das Handy nie "fertig" meldet
    if (!S.trying && this.t >= ch.dur && (!Voice.busy() || this.t > Math.max(ch.dur, est) + 2)) { if (ch.try) { S.trying = true; S.tt = 0; if (ch.start) ch.start(S); S.trying = true; Voice.say(ch.try, true); } else S.done = true; }
    if (S.done) { S.doneT = (S.doneT || 0) + dt; if (S.doneT > (ch.try ? 2 : 1.2)) { if (this.i < TUT_CHAPTERS.length - 1) this.begin(this.i + 1); else this.finish(); } }
    if (S.trying && !S.done && ch.check && ch.check(S)) { S.done = true; Sfx.play('win'); const p = this.toS(300, 160); FX.confetti(p.x, p.y, 40); }
  }
  draw(c) {
    this.layout();
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BRAND.olive); g.addColorStop(1, '#5a7a4a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const v = this.v, ch = this.ch(), S = this.S;
    // Kopfzeile: Titel + Kapitel-Leiste wie bei einem Video
    roundBtn(c, 40, 34, 22, '#fff', 'cross', () => this.finish());
    txt(c, 'Anleitung · ' + ch.title, 76, 34, 18, '#fff', 'left', BRAND.ink);
    const n = TUT_CHAPTERS.length, bx = v.land ? W * 0.45 : 16, bw = W - bx - 70;
    for (let i = 0; i < n; i++) { const x = bx + (i / n) * bw, w = bw / n - 4; rrPath(c, x, 50, w, 7, 3.5); c.fillStyle = i < this.i ? BRAND.lime : 'rgba(255,255,255,.3)'; c.fill(); if (i === this.i) { rrPath(c, x, 50, w * clamp(S.trying ? 1 : this.t / ch.dur, 0, 1), 7, 3.5); c.fillStyle = '#fff'; c.fill(); } }
    soundBtn(c, W - 34, 34);
    // "Video"
    c.save(); rrPath(c, v.x, v.y, v.w, v.h, 18); c.clip();
    c.translate(v.x, v.y); c.scale(v.s, v.s);
    ch.draw(c, this.t, S);
    if (S.trying && !S.done) { c.fillStyle = 'rgba(0,0,0,.0)'; }
    c.restore();
    rrPath(c, v.x, v.y, v.w, v.h, 18); c.lineWidth = 5; c.strokeStyle = BRAND.ink; c.stroke();
    if (S.trying && !S.done) { rrPath(c, v.x + 10, v.y + v.h - 46, v.w - 20, 36, 18); c.fillStyle = 'rgba(149,193,31,.95)'; c.fill(); let fz = 17; c.font = `900 ${fz}px ${FONT}`; const mw = c.measureText(ch.try).width; if (mw > v.w - 50) fz *= (v.w - 50) / mw; txt(c, ch.try, v.x + v.w / 2, v.y + v.h - 28, fz, '#fff', 'center', BRAND.ink); }
    if (this.paused) { c.fillStyle = 'rgba(0,0,0,.35)'; rrPath(c, v.x, v.y, v.w, v.h, 18); c.fill(); icon(c, 'play', v.x + v.w / 2, v.y + v.h / 2, 70, '#fff'); }
    // Text + Knöpfe
    const tx = v.land ? v.x + v.w + 18 : 16, ty = v.land ? v.y + 6 : v.y + v.h + 16, tw = v.land ? W - tx - 16 : W - 32;
    const avail = H - ty - 96; let fz = 17, lines;
    do { lines = wrapLines(c, ch.say, tw - 24, fz); if (lines.length * fz * 1.3 + 24 <= avail || fz <= 11) break; fz -= 0.5; } while (true);
    const lh = fz * 1.3;
    panel(c, tx, ty, tw, lines.length * lh + 24, '#fbf8f2', 16);
    lines.forEach((l, i) => txt(c, l, tx + 12, ty + 12 + lh / 2 + i * lh, fz, '#3d2c1f', 'left', null));
    const by = H - 46;
    roundBtn(c, tx + 34, by, 26, '#fff', 'retry', () => this.begin(this.i), BRAND.olive);
    roundBtn(c, tx + 98, by, 26, '#fff', this.paused ? 'play' : 'pause', () => { this.paused = !this.paused; if (this.paused) Voice.stop(); else Voice.say(ch.say, true); }, BRAND.olive);
    roundBtn(c, tx + 162, by, 22, '#d0ebff', 'sound', () => Voice.say(S.trying ? ch.try : ch.say, true));
    const canNext = S.done;
    const nx = tx + tw - 40, pu = canNext ? 1 + Math.sin(this.t * 6) * 0.08 : 1;
    c.save(); c.translate(nx, by); c.scale(pu, pu); roundBtn(c, 0, 0, 32, canNext ? '#06d6a0' : '#adb5bd', 'play', null); c.restore();
    UI.btn(nx - 38, by - 38, 76, 76, () => { if (this.i < n - 1) this.begin(this.i + 1); else this.finish(); });
    if (!canNext) txt(c, 'überspringen', nx, by + 44, 11, '#fff', 'center', null);
  }
  down(x, y) { const ch = this.ch(), S = this.S; if (!S.trying || S.done) return; const p = this.toV(x, y); if (p.x < 0 || p.y < 0 || p.x > TV.w || p.y > TV.h) return; if (ch.tap) ch.tap(S, p.x, p.y); if (ch.press) ch.press(S, p.x, p.y); }
  move(x, y) { const ch = this.ch(), S = this.S; if (!S.trying || !ch.drag) return; const p = this.toV(x, y); ch.drag(S, p.x, p.y); }
  up() { const ch = this.ch(), S = this.S; if (ch.release) ch.release(S); }
}
