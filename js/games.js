'use strict';
// ---------- Minispiele: Leicht-Aufgaben, Rätsel (Typ 2), Challenges (Typ 1) ----------
// Alle Spiele zeichnen in einem festen Raster von 400 x 520 und werden auf den Bildschirm skaliert.
const GAME_W = 400, GAME_H = 520;

class GameOverlay {
  // opts: { diff, kind:'easy'|'puzzle'|'challenge', item, steps:{i,n}, slow, seed, onStop }
  constructor(id, opts, done) {
    this.id = id; this.opts = opts; this.done = done; this.retries = 0;
    this.start();
  }
  start() {
    const o = this.opts, self = this;
    this.state = 'play'; this.t = 0; this.endT = 0; this.touched = false; this.flash = 0;
    this.timed = o.diff === 'hard' && !!GAMES[this.id].challenge;   // nur Schwer-Challenges: Leben + Zeit
    this.lives = this.timed && typeof ability === 'function' && ability('extraherz') ? 4 : 3; this.maxLives = this.lives; this.lostAnim = []; this.lastTick = 99;
    this.env = {
      diff: o.diff, hard: o.diff === 'hard', kind: ANIMAL_OF[o.diff], slow: o.slow ? 0.6 : 1,
      r: mulberry32(((o.seed || 7) + this.retries * 977) >>> 0),
      win() {
        if (self.state !== 'play') return;
        self.state = 'won'; self.endT = 0; Sfx.play('win'); buzz([30, 40, 60]);
        const p = self.toScreen(200, 240); FX.confetti(p.x, p.y, 50);
      },
      hit() {
        Sfx.play('hit'); buzz(self.timed ? 160 : 70); self.flash = 0.4;
        if (self.timed) {
          self.lives--; self.lostAnim.push({ i: self.lives, t: 0 });
          if (self.lives <= 0) self.lose();
          return true;
        }
        return false;
      },
      addTime(s) { self.timeLeft = Math.min(self.timeMax, self.timeLeft + s); self.timeBonus = 0.8; Sfx.play('coin'); FX.sparkle(W - 80, 112, 14); },
      burst(x, y, n = 14) { const p = self.toScreen(x, y); FX.sparkle(p.x, p.y, n); },
      conf(x, y, n = 18) { const p = self.toScreen(x, y); FX.confetti(p.x, p.y, n, 0.6); },
    };
    this.g = GAMES[this.id].make(this.env, o);
    // Beim ersten Mal erklärt sich jede Aufgabe/Challenge automatisch mit Text (Spiel ist so lange pausiert)
    if (!this.retries && typeof ACC === 'function' && ACC() && !ACC().tut['h_' + this.id]) { this.help = true; ACC().tut['h_' + this.id] = true; Save.write(); }
    this.timeMax = this.timed ? (this.g.timeLimit || 30) + (ability('zeitplus') ? 6 : 0) : 0;
    this.timeLeft = this.timeMax; this.timeBonus = 0;
  }
  lose() { if (this.state === 'play') { this.state = 'lost'; this.endT = 0; Sfx.play('bad'); buzz(250); } }
  layout() {
    // Querformat: Knöpfe/Herzen/Zeit an die Seiten, Spielfeld bekommt die volle Höhe
    this.side = W > H * 1.1;
    if (this.side) {
      const left = 92, right = this.timed ? 154 : 92, aw = W - left - right - 16, ah = H - 16;
      this.s = Math.min(aw / GAME_W, ah / GAME_H);
      this.ox = left + 8 + (aw - GAME_W * this.s) / 2; this.oy = 8 + (ah - GAME_H * this.s) / 2;
      return;
    }
    const top = this.timed ? 156 : 84, pad = 10;
    const aw = W - pad * 2, ah = H - top - pad - 6;
    this.s = Math.min(aw / GAME_W, ah / GAME_H);
    this.ox = (W - GAME_W * this.s) / 2;
    this.oy = top + (ah - GAME_H * this.s) / 2;
  }
  toScreen(x, y) { return { x: this.ox + x * this.s, y: this.oy + y * this.s }; }
  toGame(x, y) { return { x: (x - this.ox) / this.s, y: (y - this.oy) / this.s }; }
  update(dt) {
    this.layout();
    this.t += dt; this.flash = Math.max(0, this.flash - dt); this.timeBonus = Math.max(0, this.timeBonus - dt);
    this.lostAnim.forEach(a => (a.t += dt)); this.lostAnim = this.lostAnim.filter(a => a.t < 1);
    if (this.state === 'play' && this.help) return;   // Spiel pausiert, solange die Erklärung offen ist
    if (this.state === 'play') {
      this.g.update(dt);
      if (this.timed && this.state === 'play') {
        this.timeLeft -= dt;
        const sec = Math.ceil(this.timeLeft);
        if (sec <= 5 && sec !== this.lastTick && sec > 0) { this.lastTick = sec; buzz(25); Sfx.play('tap'); }
        if (this.timeLeft <= 0) { this.timeLeft = 0; this.lose(); }
      }
    } else if (this.state === 'won') { this.endT += dt; if (this.endT > 1.25) this.finish(true); }
    else this.endT += dt;
  }
  finish(ok) { if (overlay === this) overlay = null; if (this.done) this.done(ok); }
  drawStatus(c) {
    // Große, eindeutige Leiste: Leben links, Zeit rechts
    const low = this.timeLeft / this.timeMax < 0.25, pulse = low ? 0.5 + 0.5 * Math.sin(this.t * 12) : 0;
    const side = this.side, x = side ? W - 148 : 10, y = side ? 84 : 80, w = side ? 140 : W - 20, h = side ? 168 : 68;
    panel(c, x, y, w, h, '#3d2c1f', 20);
    if (low) { rrPath(c, x, y, w, h, 20); c.lineWidth = 5; c.strokeStyle = `rgba(239,71,111,${0.4 + pulse * 0.6})`; c.stroke(); }
    for (let i = 0; i < this.maxLives; i++) {
      const hx = side ? x + 22 + i * (this.maxLives > 3 ? 32 : 42) : x + 34 + i * 46, hy = side ? y + 36 : y + h / 2;
      const alive = i < this.lives, beat = alive && this.lives === 1 ? 1 + Math.sin(this.t * 10) * 0.08 : 1;
      c.save(); c.translate(hx, hy); c.scale(beat, beat); icon(c, alive ? 'heart' : 'heartE', 0, 0, 40); c.restore();
    }
    for (const a of this.lostAnim) {
      const hx = side ? x + 28 + a.i * 42 : x + 34 + a.i * 46, hy = side ? y + 36 : y + h / 2, k = a.t;
      c.save(); c.globalAlpha = 1 - k;
      c.translate(hx - 10 - k * 20, hy - k * 30); c.rotate(-k * 1.2); c.beginPath(); c.rect(-30, -30, 30, 60); c.clip(); icon(c, 'heart', 10 + k * 20, k * 30, 40 + k * 20); c.restore();
      c.save(); c.globalAlpha = 1 - k;
      c.translate(hx + 10 + k * 20, hy - k * 30); c.rotate(k * 1.2); c.beginPath(); c.rect(0, -30, 30, 60); c.clip(); icon(c, 'heart', -10 - k * 20, k * 30, 40 + k * 20); c.restore();
    }
    const hw2 = 30 + this.maxLives * 46, bx = side ? x - 2 : x + hw2, bw = side ? w - 8 : w - hw2 - 62, by = side ? y + 122 : y + h / 2 - 14;
    icon(c, 'clock', side ? x + 26 : bx - 8, side ? y + 88 : y + h / 2, 34);
    rrPath(c, bx + 14, by, bw - 14, 28, 14); fs(c, '#1f150e', 3, '#000');
    const f = clamp(this.timeLeft / this.timeMax, 0, 1);
    if (f > 0) {
      rrPath(c, bx + 17, by + 3, (bw - 20) * f, 22, 11);
      c.fillStyle = low ? (pulse > 0.5 ? '#ff4d6d' : '#ef476f') : this.timeBonus > 0 ? '#80ed99' : f < 0.5 ? '#ffd166' : '#06d6a0'; c.fill();
      rrPath(c, bx + 21, by + 5, Math.max(0, (bw - 28) * f), 6, 3); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill();
    }
    const ss = low ? 1 + pulse * 0.15 : 1;
    c.save(); c.translate(side ? x + w - 40 : x + w - 32, side ? y + 89 : y + h / 2 + 1); c.scale(ss, ss);
    txt(c, String(Math.ceil(this.timeLeft)), 0, 0, 28, low ? '#ff4d6d' : '#fff'); c.restore();
  }
  draw(c) {
    this.layout();
    c.fillStyle = 'rgba(16,28,18,.78)'; c.fillRect(0, 0, W, H);
    roundBtn(c, 46, 44, 30, '#fff', 'stop', () => { if (overlay === this) overlay = null; if (this.opts.onStop) this.opts.onStop(); });
    const o = this.opts;
    if (o.kind === 'easy' && o.steps) {
      const n = o.steps.n, w = Math.min(28, this.side ? (H - 140) / n : (W - 200) / n);
      for (let i = 0; i < n; i++) {
        const x = this.side ? 46 : W / 2 + (i - (n - 1) / 2) * w, yy = this.side ? 110 + i * w : 44, done = i < o.steps.i || (i === o.steps.i && this.state === 'won');
        ell(c, x, yy, w * 0.32, w * 0.32); fs(c, done ? '#ffd23f' : i === o.steps.i ? '#fff' : 'rgba(255,255,255,.3)', 3);
        if (done) icon(c, 'star', x, yy, w * 0.5);
      }
    } else if (o.item) {
      const ix = this.side ? 46 : W / 2, iy = this.side ? 120 : 44;
      ell(c, ix, iy, 30, 30); fs(c, '#fff7e6', 4);
      drawItem(c, o.item, ix, iy, 42);
    }
    if (this.timed) this.drawStatus(c);
    c.save();
    c.translate(this.ox, this.oy); c.scale(this.s, this.s);
    rrPath(c, 0, 0, GAME_W, GAME_H, 26); c.save(); c.clip();
    this.g.draw(c);
    const av = c.createRadialGradient(200, 230, 150, 200, 260, 380); av.addColorStop(0, 'rgba(0,0,0,0)'); av.addColorStop(1, 'rgba(40,25,10,.18)');
    c.fillStyle = av; c.fillRect(0, 0, GAME_W, GAME_H);
    if (this.flash > 0) {
      c.fillStyle = `rgba(239,71,111,${this.flash * 0.8})`; c.fillRect(0, 0, GAME_W, GAME_H);
      if (this.timed) { const k = 1 - this.flash / 0.4; c.save(); c.globalAlpha = 1 - k; c.translate(200, 260); c.scale(1 + k, 1 + k); icon(c, 'heartE', 0, 0, 120); c.restore(); }
    }
    const h = this.g.hint;
    if (h && !this.touched && this.state === 'play' && this.t > 0.4) {
      const k = (this.t * 0.8) % 1;
      let hx = h.x, hy = h.y, press = 0;
      if (h.type === 'drag') { const e = ease.inout(clamp(k * 1.4, 0, 1)); hx = lerp(h.x, h.x2, e); hy = lerp(h.y, h.y2, e); }
      else if (h.type === 'swipe') { hx = h.x + Math.sin(this.t * 4) * 60; }
      else press = Math.abs(Math.sin(this.t * 6)) * 8;
      c.globalAlpha = 0.9; drawHand(c, hx + 6, hy + 4 + press, 1.6); c.globalAlpha = 1;
      if (h.type === 'tap' && press > 6) { ell(c, h.x, h.y, 22, 22); c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.8)'; c.stroke(); }
    }
    if (this.state === 'won') {
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(0, 0, GAME_W, GAME_H);
      const k = ease.back(clamp(this.endT * 3, 0, 1));
      c.save(); c.translate(200, 250); c.scale(k, k);
      ell(c, 0, 0, 80, 80); fs(c, '#06d6a0', 6);
      if (o.item && o.kind !== 'easy') drawItem(c, o.item, 0, -4, 96); else icon(c, 'check', 0, 0, 110);
      c.restore();
    }
    if (this.state === 'lost') {
      c.fillStyle = 'rgba(30,20,20,.6)'; c.fillRect(0, 0, GAME_W, GAME_H);
      icon(c, this.timeLeft <= 0 ? 'clock' : 'heartE', 200, 150, 90);
      txt(c, this.timeLeft <= 0 ? 'Die Zeit ist abgelaufen!' : 'Keine Herzen mehr!', 200, 215, 24, '#fff', 'center', BRAND.ink);
      Voice.once((this.timeLeft <= 0 ? 'Die Zeit ist abgelaufen!' : 'Keine Herzen mehr!') + ' Versuch es gleich nochmal.');
      txt(c, 'Versuch es gleich nochmal.', 200, 245, 17, '#fbf8f2', 'center', BRAND.ink);
    }
    c.restore();
    rrPath(c, 0, 0, GAME_W, GAME_H, 26); c.lineWidth = 5 / this.s; c.strokeStyle = OL; c.stroke();
    c.restore();
    if (this.state === 'lost') {
      const p = this.toScreen(200, 300), r = 44 * Math.min(1.3, this.s * 1.3);
      roundBtn(c, p.x - r * 1.3, p.y, r, '#06d6a0', 'retry', () => { this.retries++; this.start(); });
      roundBtn(c, p.x + r * 1.3, p.y, r * 0.8, '#adb5bd', 'cross', () => this.finish(false));
    }
    // Erklär-Knopf (?) + Erklärung mit Text
    if (this.state === 'play') roundBtn(c, W - 46, 44, 26, '#bde0fe', 'question', () => { this.help = !this.help; }, '#118ab2');
    if (this.help) {
      const lines = [HELP_TEXT[this.id] || 'Probier es einfach aus!'];
      if (this.timed) lines.push('Du hast 3 Herzen und eine Zeit-Leiste. Sammle Uhren für mehr Zeit.');
      helpPanel(c, lines, () => { this.help = false; this.touched = false; this.t = 0.4; Voice.stop(); });
    }
  }
  down(x, y, id) { if (this.state !== 'play' || this.help) return; this.touched = true; const p = this.toGame(x, y); if (this.g.down) this.g.down(p.x, p.y, id); }
  move(x, y, id) { if (this.state !== 'play' || this.help) return; const p = this.toGame(x, y); if (this.g.move) this.g.move(p.x, p.y, id); }
  up(x, y, id) { if (this.state !== 'play' || this.help) return; const p = this.toGame(x, y); if (this.g.up) this.g.up(p.x, p.y, id); }
}

// ---------- Erklärungen (Text erlaubt, für alle, die eine Aufgabe nicht verstehen) ----------
const HELP_TEXT = {
  memory: 'Dreh immer zwei Karten um. Finde alle Paare, die gleich aussehen.',
  pairs: 'Dreh immer zwei Karten um. Finde alle Paare, die gleich aussehen.',
  connect: 'Zieh mit dem Finger eine Linie von jedem Bild links zum gleichen Bild rechts.',
  pop: 'Tippe auf die Luftballons, damit sie platzen. Oben siehst du, wie viele es sein müssen.',
  puzzle: 'Zieh die Puzzleteile an die richtige Stelle im Rahmen.',
  stack: 'Bau eine Torte: Zieh zuerst das größte Stockwerk nach unten, dann immer das nächstkleinere.',
  shadow: 'Zieh jedes Bild auf seinen passenden Schatten.',
  sort: 'Zieh jeden Ball in den Korb mit der gleichen Farbe und dem gleichen Zeichen.',
  findall: 'Oben im Kasten siehst du ein Ding. Finde es überall im Bild und tippe es an.',
  trace: 'Leg den Finger auf das Tablett und bring den Eisclown auf dem Weg bis zum Tisch mit dem Sonnenschirm.',
  count_easy: 'Zähl die Dinge im Bild. Tippe dann auf den Würfel mit genauso vielen Punkten.',
  color: 'Wähle unten eine Farbe. Tippe dann auf die Felder mit dem gleichen Zeichen.',
  rope: 'Tippe, wenn das Seil unten bei deinen Füßen ist. Dann springst du drüber.',
  size_row: 'Leg die Dinge der Größe nach in die Reihe: links das kleinste, rechts das größte.',
  cups: 'Merk dir, unter welcher Servierglocke der Eisclown steht. Wenn die Glocken still stehen, tippe auf die richtige.',
  shell: 'Merk dir, unter welcher Servierglocke der Eisclown steht. Wenn die Glocken still stehen, tippe auf die richtige.',
  maze: 'Zieh dein Tier mit dem Finger durch das Labyrinth bis zur Leckerei.',
  maze_easy: 'Zieh dein Tier mit dem Finger durch das Labyrinth bis zur Leckerei.',
  dots: 'Tippe die Zahlen der Reihe nach an. Oben siehst du, wie gezählt wird (z. B. 2, 4, 6 ...).',
  dots_easy: 'Tippe die Zahlen der Reihe nach an: 1, 2, 3 ...',
  sequence: 'Schau genau hin, welche Felder nacheinander aufleuchten. Tippe sie danach in der gleichen Reihenfolge an.',
  dials: 'Tippe auf die Räder, um sie zu drehen. Oben am Rad (beim gelben Pfeil) muss das Zeichen aus der Kiste stehen.',
  pipes: 'Tippe auf die Rohrteile, um sie zu drehen. Leite die hausgemachte Limo von der Zitrone links bis ins Glas rechts.',
  pattern: 'Tippe auf die Felder, bis dein Muster genauso aussieht wie die kleine Vorlage oben.',
  balance: 'Zieh Klötze auf die Wippe, bis sie gerade ist. Je weiter außen ein Klotz liegt, desto schwerer drückt er.',
  lights: 'Mach alle Windlichter an. Ein Tipp schaltet das Licht und seine direkten Nachbarn um.',
  hanoi: 'Bring den ganzen Teller-Stapel auf das Tablett mit dem Stern. Tippe einen Stapel an, um den oberen Teller zu nehmen, und dann ein anderes Tablett zum Ablegen. Ein großer Teller darf nie auf einen kleineren.',
  diff: 'Oben und unten sind fast gleiche Bilder. Finde die Unterschiede und tippe sie an.',
  oddone: 'Ein Bild ist gespiegelt und schaut in die andere Richtung. Finde es und tippe es an.',
  nextrow: 'Wie geht die Reihe weiter? Schau dir das Muster an und tippe unten auf das passende Zeichen.',
  count: 'Zähl, wie oft das Ding aus dem Kasten im Bild vorkommt, und tippe auf die richtige Zahl.',
  mirror: 'Mal die rechte Seite so an, dass sie wie ein Spiegelbild der linken Seite aussieht.',
  rotimg: 'Tippe auf die Bildteile, um sie zu drehen, bis das Bild wieder aussieht wie oben rechts.',
  slider: 'Schieb die Teile in die leere Lücke, bis das Bild stimmt.',
  run: 'Dein Tier läuft von allein. Tippe links oder rechts, um die Spur zu wechseln und Hindernissen auszuweichen.',
  balance_walk: 'Tippe genau dann, wenn der Zeiger im grünen Bereich ist. So machst du einen sicheren Schritt über den Balken.',
  jump: 'Dein Tier läuft von allein. Tippe, um über Hindernisse und Löcher zu springen.',
  collect: 'Die Küche schickt Essen raus! Beweg dein Tier mit dem Finger nach links und rechts. Fang nur die Bestellung aus dem Kasten oben.',
  slide: 'Du rutschst nach unten. Beweg dich mit dem Finger nach links und rechts und weich allem auf der Rutsche aus.',
  swing: 'Tippe, um zum nächsten Platz zu laufen. Warte, bis die Schaukel weit weg ist, sonst wirst du getroffen.',
  platform: 'Lauf mit den Pfeil-Knöpfen, spring mit dem großen Knopf (lange drücken = hoch springen). Spring auf Bälle und Wespen, um sie zu besiegen. Erreiche die rote Fahne!',
};
function wrapLines(c, text, maxW, size) {
  c.font = `800 ${size}px ${FONT}`; const out = [];
  for (const para of text.split('\n')) { let cur = ''; for (const w of para.split(' ')) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; } out.push(cur); }
  return out;
}
function helpPanel(c, paras, onClose, speak = true) {
  if (speak) Voice.once(paras.join(' '));
  const w = Math.min(W - 30, W > H ? 600 : 420), size = 18, lh = 25;
  const lines = []; paras.forEach((p, i) => { if (i) lines.push(''); lines.push(...wrapLines(c, p, w - 48, size)); });
  const h = 100 + lines.length * lh, x = (W - w) / 2, y = (H - h) / 2;
  c.fillStyle = 'rgba(16,28,18,.55)'; c.fillRect(0, 0, W, H);
  fitBegin(c, w, h + 60);
  panel(c, x, y, w, h, '#fff7e6', 24);
  ell(c, x + 34, y + 34, 20, 20); fs(c, '#bde0fe', 3); icon(c, 'question', x + 34, y + 35, 26, '#118ab2');
  lines.forEach((l, i) => txt(c, l, x + 24, y + 74 + i * lh, size, '#3d2c1f', 'left', null));
  roundBtn(c, x + w / 2, y + h, 26, '#06d6a0', 'check', onClose);
  c.restore();
  UI.btn(0, 0, W, H, () => {}); UI.next.push(UI.next.splice(UI.next.length - 2, 1)[0]);
}

// ---------- Helfer ----------
function dragKit(objs, onDrop) {
  const k = {
    objs, drag: null, ox: 0, oy: 0,
    down(x, y) {
      for (let i = objs.length - 1; i >= 0; i--) {
        const o = objs[i];
        if (o.locked) continue;
        if (Math.abs(x - o.x) < o.hw && Math.abs(y - o.y) < o.hh) {
          k.drag = o; k.ox = o.x - x; k.oy = o.y - y; o.back = false;
          objs.splice(i, 1); objs.push(o); Sfx.play('tap'); return o;
        }
      }
      return null;
    },
    move(x, y) { if (k.drag) { k.drag.x = x + k.ox; k.drag.y = y + k.oy; } },
    up() { const o = k.drag; if (!o) return; k.drag = null; onDrop(o); o.back = true; },
    update(dt) {
      for (const o of objs) {
        if (o.back && k.drag !== o) {
          const a = Math.min(1, dt * 14);
          o.x = lerp(o.x, o.hx, a); o.y = lerp(o.y, o.hy, a);
          if (Math.abs(o.x - o.hx) < 0.5 && Math.abs(o.y - o.hy) < 0.5) { o.x = o.hx; o.y = o.hy; o.back = false; }
        }
      }
    },
    sorted() { return objs.filter(o => o.locked).concat(objs.filter(o => !o.locked)); },
  };
  return k;
}
function finisher(env) { let f = 0; return { set(t = 0.5) { if (!f) f = t; }, on() { return f > 0; }, tick(dt) { if (f > 0) { f -= dt; if (f <= 0) env.win(); } } }; }
function bgEasy(c, col = '#fff4d6') {
  c.fillStyle = col; c.fillRect(0, 0, GAME_W, GAME_H);
  c.fillStyle = 'rgba(255,200,120,.18)';
  for (let i = 0; i < 9; i++) { ell(c, (i * 97) % 400, (i * 151) % 520, 40 + (i % 3) * 20, 40 + (i % 3) * 20); c.fill(); }
}
function bgWood(c) {
  c.fillStyle = '#c99a63'; c.fillRect(0, 0, GAME_W, GAME_H);
  c.strokeStyle = 'rgba(90,55,25,.25)'; c.lineWidth = 2;
  for (let y = 0; y < GAME_H; y += 52) { c.beginPath(); c.moveTo(0, y); c.lineTo(GAME_W, y); c.stroke(); }
  for (let i = 0; i < 14; i++) { c.beginPath(); c.arc((i * 131) % 400, (i * 71) % 520 + 20, 10, 0, Math.PI); c.stroke(); }
}
function bgSky(c, ground = 400) {
  const g = c.createLinearGradient(0, 0, 0, ground); g.addColorStop(0, '#8ecae6'); g.addColorStop(1, '#d8f3ff');
  c.fillStyle = g; c.fillRect(0, 0, GAME_W, ground);
}
function chipsBand(c, y0, y1, off = 0) {
  c.fillStyle = CHIP_BASE; c.fillRect(0, y0, GAME_W, y1 - y0);
  const cols = CHIP_COLS, hgt = y1 - y0, n = Math.floor(hgt * 1.4);
  for (let i = 0; i < n; i++) {
    const x = ((i * 53.7 + (i % 7) * 31 + off) % 440 + 440) % 440 - 20, y = y0 + ((i * 37.3 + Math.floor(i / 11) * 13) % hgt);
    c.fillStyle = cols[i % 4]; ell(c, x, y, 4, 2, i); c.fill();
  }
}
function cypress(c, x, y, h) {
  c.beginPath(); c.moveTo(x, y - h); c.quadraticCurveTo(x + h * 0.16, y - h * 0.5, x + h * 0.1, y); c.lineTo(x - h * 0.1, y);
  c.quadraticCurveTo(x - h * 0.16, y - h * 0.5, x, y - h); fs(c, '#2d6a4f', 3);
}
function shakeX(t) { return t > 0 ? Math.sin(t * 60) * 8 : 0; }
function roundDots(c, n, done, y = 26) { for (let i = 0; i < n; i++) { ell(c, 200 + (i - (n - 1) / 2) * 30, y, 10, 10); fs(c, i < done ? '#06d6a0' : 'rgba(255,255,255,.7)', 3); } }
function makeImage(subj, size = 300) {
  const img = document.createElement('canvas'); img.width = img.height = size * 2;
  const ic = img.getContext('2d'); ic.scale(2 * size / 200, 2 * size / 200);
  ic.fillStyle = '#bde0fe'; ic.fillRect(0, 0, 200, 200); ic.fillStyle = '#95d5b2'; ic.fillRect(0, 140, 200, 60);
  ic.fillStyle = '#fff'; ell(ic, 40, 40, 22, 12); ic.fill(); ell(ic, 160, 30, 18, 10); ic.fill();
  ic.fillStyle = '#ffd166'; ell(ic, 175, 165, 10, 10); ic.fill();
  drawAny(ic, subj, 100, 100, 150);
  return img;
}
const ASYM = ['roller', 'wasserpistole', 'sandschaufel', 'seifenblasen', 'kreide', 'luftballon'];
const FILLS = ['#ef476f', '#118ab2', '#ffd166', '#06d6a0', '#9b5de5', '#f78c6b'];

// ---------- Spiele-Katalog ----------
const GAMES = {};

// ===== Memory (Leicht: Sandförmchen, Mittel/Schwer: Paare mit mehr Karten) =====
function memoryMake(env, easy) {
  const r = env.r, n = easy ? 6 : env.hard ? 8 : 6, cols = 4, rows = (2 * n) / cols;
  const faces = shuffle(FOOD_IDS, r).slice(0, n);
  const cw = 86, ch = Math.min(140, 470 / rows - 12);
  const deck = shuffle([...Array(n).keys(), ...Array(n).keys()], r).map((k, i) => ({ k, f: 0, open: false, done: false, x: ((i % cols) + 0.5) * 100, y: 40 + (Math.floor(i / cols) + 0.5) * (470 / rows) }));
  let sel = [], wait = 0, tries = 0; const fin = finisher(env);
  return {
    hint: { type: 'tap', x: deck[0].x, y: deck[0].y },
    update(dt) {
      deck.forEach(d => { d.f = lerp(d.f, d.open || d.done ? 1 : 0, Math.min(1, dt * 12)); });
      if (wait > 0) { wait -= dt; if (wait <= 0) { sel.forEach(d => (d.open = false)); sel = []; } }
      fin.tick(dt);
    },
    draw(c) {
      if (easy) bgEasy(c); else bgWood(c);
      deck.forEach(d => {
        const sx = Math.abs(Math.cos(d.f * Math.PI)), front = d.f > 0.5;
        c.save(); c.translate(d.x, d.y); c.scale(Math.max(0.04, sx), 1);
        rrPath(c, -cw / 2, -ch / 2, cw, ch, 14); fs(c, front ? '#fffdf7' : easy ? '#6bb544' : '#2d6a4f', 4);
        const s = Math.min(cw, ch) * 0.75;
        if (front) drawAny(c, faces[d.k], 0, 0, s * 1.05);
        else { rrPath(c, -cw / 2 + 8, -ch / 2 + 8, cw - 16, ch - 16, 8); fs(c, null, 3, 'rgba(255,255,255,.4)'); icon(c, 'question', 0, 2, s * 0.6); }
        c.restore();
      });
    },
    down(x, y) {
      if (wait > 0 || fin.on()) return;
      for (const d of deck) {
        if (!d.open && !d.done && Math.abs(x - d.x) < cw / 2 + 4 && Math.abs(y - d.y) < ch / 2 + 4) {
          d.open = true; sel.push(d); Sfx.play('tap');
          if (sel.length === 2) {
            tries++;
            if (sel[0].k === sel[1].k) { sel.forEach(s => { s.done = true; env.burst(s.x, s.y); }); Sfx.play('good'); buzz(30); sel = []; if (deck.every(q => q.done)) fin.set(); }
            else wait = easy ? 0.9 : 0.7;
          }
          return;
        }
      }
    },
  };
}
GAMES.memory = { make: env => memoryMake(env, true) };
GAMES.pairs = { make: env => memoryMake(env, false) };

// ===== LEICHT (Katze): bekannte Kinderspiel-Formate, kein Scheitern =====
GAMES.connect = { make(env) {
  const r = env.r, ids = shuffle(FOOD_IDS, r).slice(0, 5);
  const L = ids.map((id, i) => ({ id, x: 80, y: 60 + i * 100, con: false }));
  const R = shuffle(ids, r).map((id, i) => ({ id, x: 320, y: 60 + i * 100, con: false }));
  const links = []; let drag = null, px = 0, py = 0; const fin = finisher(env);
  const target = R.find(q => q.id === L[0].id);
  return {
    hint: { type: 'drag', x: L[0].x, y: L[0].y, x2: target.x, y2: target.y },
    update(dt) { fin.tick(dt); },
    draw(c) {
      bgEasy(c);
      links.forEach((l, i) => line(c, l[0].x, l[0].y, l[1].x, l[1].y, 9, FILLS[i]));
      if (drag) line(c, drag.x, drag.y, px, py, 9, '#ffd166');
      [...L, ...R].forEach(q => { ell(c, q.x, q.y, 40, 40); fs(c, q.con ? '#d8f5e3' : '#fff', 4, q.con ? '#2b9348' : OL); drawAny(c, q.id, q.x, q.y, 64); });
    },
    down(x, y) { for (const q of [...L, ...R]) if (!q.con && dist(x, y, q.x, q.y) < 54) { drag = q; px = x; py = y; Sfx.play('tap'); return; } },
    move(x, y) { px = x; py = y; },
    up(x, y) {
      if (!drag) return;
      const other = (L.includes(drag) ? R : L).find(q => !q.con && dist(x, y, q.x, q.y) < 60);
      if (other && other.id === drag.id) { drag.con = other.con = true; links.push([drag, other]); env.burst(other.x, other.y); Sfx.play('good'); buzz(25); if (links.length === 5) fin.set(); }
      drag = null;
    },
  };
} };

GAMES.pop = { make(env) {
  const r = env.r, need = 14; let got = 0, sp = 0.2; const bs = [], fin = finisher(env);
  return {
    hint: { type: 'tap', x: 200, y: 330 },
    update(dt) {
      sp -= dt;
      if (sp <= 0 && bs.length < 4 && got + bs.length < need + 3) { sp = 0.5; bs.push({ x: 70 + r() * 260, y: 590, v: 100 + r() * 50, col: pick(FILLS, r), ph: r() * 6, sw: 12 + r() * 18 }); }
      for (const b of bs) { b.y -= b.v * dt; b.ph += dt; }
      for (let i = bs.length - 1; i >= 0; i--) if (bs[i].y < -70) bs.splice(i, 1);
      fin.tick(dt);
    },
    draw(c) {
      bgSky(c, GAME_H);
      for (const b of bs) {
        const x = b.x + Math.sin(b.ph * 2) * b.sw;
        c.beginPath(); c.moveTo(x, b.y + 30); c.quadraticCurveTo(x + 8, b.y + 50, x, b.y + 70); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
        ell(c, x, b.y, 32, 38); fs(c, b.col, 4); ell(c, x - 11, b.y - 13, 7, 11, 0.3); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
      }
      for (let i = 0; i < need; i++) { const x = 200 + (i - (need - 1) / 2) * 26; ell(c, x, 30, 11, 14); fs(c, i < got ? FILLS[i % 6] : 'rgba(255,255,255,.6)', 3); }
    },
    down(x, y) {
      if (fin.on()) return;
      for (const b of bs) {
        if (dist(x, y, b.x + Math.sin(b.ph * 2) * b.sw, b.y) < 56) {
          bs.splice(bs.indexOf(b), 1); got++; env.burst(b.x, b.y, 18); Sfx.play('pop'); buzz(20);
          if (got >= need) fin.set(); return;
        }
      }
    },
  };
} };

GAMES.puzzle = { make(env) {
  const r = env.r, img = makeImage(pick(['eisclown', 'eisbecher', 'kuchen', 'glashaus', 'palme', 'flammkuchen'], r), 210);
  const bx = 95, by = 28, P = 70;
  const tray = shuffle([[50, 330], [125, 300], [200, 335], [275, 300], [350, 330], [85, 430], [165, 455], [245, 430], [325, 455]], r);
  const pcs = [...Array(9).keys()].map(k => {
    const col = k % 3, row = Math.floor(k / 3);
    return { col, row, sx: bx + P / 2 + col * P, sy: by + P / 2 + row * P, x: tray[k][0], y: tray[k][1], hx: tray[k][0], hy: tray[k][1], hw: P / 2, hh: P / 2, locked: false };
  });
  const fin = finisher(env);
  const kit = dragKit(pcs, o => { if (dist(o.x, o.y, o.sx, o.sy) < 42) { o.hx = o.sx; o.hy = o.sy; o.locked = true; Sfx.play('good'); env.burst(o.sx, o.sy); buzz(25); if (pcs.every(p => p.locked)) fin.set(0.6); } });
  return {
    hint: { type: 'drag', x: pcs[0].x, y: pcs[0].y, x2: pcs[0].sx, y2: pcs[0].sy },
    update(dt) { kit.update(dt); fin.tick(dt); },
    draw(c) {
      bgEasy(c);
      rrPath(c, bx - 8, by - 8, P * 3 + 16, P * 3 + 16, 14); fs(c, '#e9d8a6', 4);
      rrPath(c, 318, 22, 72, 72, 10); fs(c, '#fff', 3); c.drawImage(img, 322, 26, 64, 64);
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 2; c.setLineDash([5, 5]);
      for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(bx + i * P, by); c.lineTo(bx + i * P, by + 3 * P); c.moveTo(bx, by + i * P); c.lineTo(bx + 3 * P, by + i * P); c.stroke(); }
      c.setLineDash([]);
      const S = img.width / 3;
      for (const p of kit.sorted()) {
        c.save(); if (kit.drag === p) { c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 14; c.shadowOffsetY = 8; }
        c.drawImage(img, p.col * S, p.row * S, S, S, p.x - P / 2, p.y - P / 2, P, P); c.restore();
        c.lineWidth = p.locked ? 1.2 : 3; c.strokeStyle = OL; c.strokeRect(p.x - P / 2, p.y - P / 2, P, P);
      }
    },
    down: (x, y) => kit.down(x, y), move: (x, y) => kit.move(x, y), up: () => kit.up(),
  };
} };

GAMES.stack = { make(env) {
  const r = env.r, widths = [200, 172, 144, 116, 88, 60];
  const spots = shuffle([[105, 50], [295, 50], [105, 112], [295, 112], [105, 174], [295, 174]], r);
  const bl = widths.map((w, i) => ({ i, w, col: FILLS[i], x: spots[i][0], y: spots[i][1], hx: spots[i][0], hy: spots[i][1], hw: w / 2, hh: 24, locked: false }));
  let placed = 0; const fin = finisher(env);
  const slotY = i => 470 - 22 - i * 44;
  const kit = dragKit(bl, o => {
    if (o.i === placed && Math.abs(o.x - 200) < 90 && Math.abs(o.y - slotY(placed)) < 70) {
      o.hx = 200; o.hy = slotY(placed); o.locked = true; placed++; Sfx.play('good'); env.burst(200, o.hy); buzz(25);
      if (placed === widths.length) fin.set(0.6);
    }
  });
  return {
    hint: { type: 'drag', x: bl[0].x, y: bl[0].y, x2: 200, y2: slotY(0) },
    update(dt) { kit.update(dt); fin.tick(dt); },
    draw(c) {
      bgEasy(c);
      rrPath(c, 50, 470, 300, 20, 8); fs(c, '#8d5a3b', 4);
      if (placed < widths.length) { const w = widths[placed]; c.setLineDash([8, 7]); rrPath(c, 200 - w / 2, slotY(placed) - 22, w, 44, 8); fs(c, 'rgba(255,255,255,.5)', 3, 'rgba(0,0,0,.35)'); c.setLineDash([]); }
      for (const b of kit.sorted()) {
        const CAKE = ['#f6d7a7', '#ffc2d1', '#a0522d', '#fff1c1', '#bde0fe', '#cdb4db'][b.i];
        rrPath(c, b.x - b.w / 2, b.y - 22, b.w, 44, 8); fs(c, CAKE, 4);
        rrPath(c, b.x - b.w / 2 + 3, b.y + 4, b.w - 6, 6, 3); c.fillStyle = 'rgba(255,255,255,.65)'; c.fill();
        c.beginPath(); c.moveTo(b.x - b.w / 2 + 2, b.y - 20);
        for (let k = 0; k <= b.w - 4; k += 12) c.quadraticCurveTo(b.x - b.w / 2 + 2 + k + 6, b.y - 6, b.x - b.w / 2 + 2 + Math.min(k + 12, b.w - 4), b.y - 20);
        c.lineTo(b.x + b.w / 2 - 2, b.y - 22); c.lineTo(b.x - b.w / 2 + 2, b.y - 22); c.closePath(); fs(c, '#fffaf0', 2);
        if (b.i === 5) { ell(c, b.x, b.y - 32, 8, 8); fs(c, '#e63946', 2.5); line(c, b.x + 2, b.y - 39, b.x + 6, b.y - 46, 2, '#52b788', false); }
      }
    },
    down: (x, y) => kit.down(x, y), move: (x, y) => kit.move(x, y), up: () => kit.up(),
  };
} };

GAMES.shadow = { make(env) {
  const r = env.r, ids = shuffle(FOOD_IDS, r).slice(0, 5), xs = [44, 122, 200, 278, 356];
  const sh = ids.map((id, i) => ({ id, x: xs[i], y: 150 }));
  const pos = shuffle(xs, r);
  const its = ids.map((id, i) => ({ id, x: pos[i], y: 400, hx: pos[i], hy: 400, hw: 36, hh: 36, locked: false, tx: sh[i].x, ty: sh[i].y }));
  const fin = finisher(env);
  const kit = dragKit(its, o => { if (dist(o.x, o.y, o.tx, o.ty) < 50) { o.hx = o.tx; o.hy = o.ty; o.locked = true; Sfx.play('good'); env.burst(o.tx, o.ty); buzz(25); if (its.every(q => q.locked)) fin.set(0.6); } });
  return {
    hint: { type: 'drag', x: its[0].x, y: its[0].y, x2: its[0].tx, y2: its[0].ty },
    update(dt) { kit.update(dt); fin.tick(dt); },
    draw(c) {
      bgEasy(c, '#fdf0d5');
      rrPath(c, 12, 80, 376, 140, 24); fs(c, '#e9d8a6', 3);
      for (const s of sh) { c.globalAlpha = 0.75; drawAny(c, s.id, s.x, s.y, 66, true); c.globalAlpha = 1; }
      for (const q of kit.sorted()) { if (!q.locked) { ell(c, q.x, q.y + 40, 30, 8); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill(); } drawAny(c, q.id, q.x, q.y, 66); }
    },
    down: (x, y) => kit.down(x, y), move: (x, y) => kit.move(x, y), up: () => kit.up(),
  };
} };

GAMES.sort = { make(env) {
  const r = env.r, bx = [52, 150, 250, 348];
  const spots = shuffle([[50, 70], [150, 80], [250, 65], [350, 85], [60, 165], [160, 180], [255, 160], [345, 175], [70, 265], [170, 280], [260, 260], [340, 275]], r);
  const balls = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3].map((s, i) => ({ s, x: spots[i][0], y: spots[i][1], hx: spots[i][0], hy: spots[i][1], hw: 36, hh: 36, locked: false }));
  const fill = [0, 0, 0, 0]; const fin = finisher(env);
  const kit = dragKit(balls, o => {
    if (Math.abs(o.x - bx[o.s]) < 48 && o.y > 350) {
      o.hx = bx[o.s] + (fill[o.s] - 1) * 22; o.hy = 418 - (fill[o.s] === 1 ? 10 : 0); fill[o.s]++; o.locked = true; Sfx.play('good'); env.burst(o.hx, 420); buzz(25);
      if (balls.every(b => b.locked)) fin.set(0.6);
    }
  });
  const basket = (c, i, front) => {
    const x = bx[i];
    if (!front) { polyPath(c, [[x - 46, 400], [x + 46, 400], [x + 36, 492], [x - 36, 492]]); fs(c, '#d4a373', 4); }
    else { rrPath(c, x - 48, 432, 96, 30, 10); fs(c, '#bc8a5f', 4); drawSym(c, i, x, 447, 12, 2.5); }
  };
  return {
    hint: { type: 'drag', x: balls[0].x, y: balls[0].y, x2: bx[balls[0].s], y2: 430 },
    update(dt) { kit.update(dt); fin.tick(dt); },
    draw(c) {
      bgEasy(c);
      [0, 1, 2, 3].forEach(i => basket(c, i, false));
      for (const b of kit.sorted()) { ell(c, b.x, b.y, 30, 30); fs(c, SYMS[b.s].col, 4); ell(c, b.x, b.y, 22, 22); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); drawSym(c, b.s, b.x, b.y, 13); }
      [0, 1, 2, 3].forEach(i => basket(c, i, true));
    },
    down: (x, y) => kit.down(x, y), move: (x, y) => kit.move(x, y), up: () => kit.up(),
  };
} };

// ===== RÄTSEL (Typ 2): Mittel + Schwer =====
GAMES.sequence = { make(env) {
  const r = env.r, P = env.hard ? 6 : 4, L = env.hard ? 7 : 5, seq = []; for (let i = 0; i < L; i++) seq.push(ri(0, P - 1, r));
  const pads = P === 4 ? [[110, 210], [290, 210], [110, 395], [290, 395]] : [[75, 200], [200, 200], [325, 200], [75, 380], [200, 380], [325, 380]];
  const ps = P === 4 ? 78 : 56, on = env.hard ? 0.36 : 0.5, gap = 0.16;
  let state = 'wait', tm = 0.9, si = 0, idx = 0, lit = -1, litT = 0, shake = 0; const fin = finisher(env);
  return {
    hint: null,
    update(dt) {
      litT -= dt; if (litT <= 0) lit = -1; shake = Math.max(0, shake - dt);
      if (state === 'wait') { tm -= dt; if (tm <= 0) { state = 'show'; si = 0; tm = 0; } }
      else if (state === 'show') {
        tm -= dt;
        if (tm <= 0) { if (si < L) { lit = seq[si]; litT = on; tm = on + gap; si++; Sfx.play('tap'); } else { state = 'input'; idx = 0; } }
      }
      fin.tick(dt);
    },
    draw(c) {
      bgWood(c);
      for (let i = 0; i < L; i++) { ell(c, 200 + (i - (L - 1) / 2) * 30, 70, 10, 10); fs(c, state === 'input' && i < idx ? '#06d6a0' : 'rgba(255,255,255,.55)', 3); }
      if (state !== 'input') icon(c, 'search', 200, 116, 34); else drawHand(c, 196, 104, 0.8);
      const sx = shakeX(shake);
      pads.forEach(([x, y], i) => {
        const L1 = lit === i;
        rrPath(c, x - ps + sx, y - ps, ps * 2, ps * 2, ps * 0.38); fs(c, L1 ? '#fff' : SYMS[i].col, 5);
        ell(c, x + sx, y, ps * 0.66, ps * 0.66); c.fillStyle = L1 ? SYMS[i].col : 'rgba(255,255,255,.88)'; c.fill(); drawSym(c, i, x + sx, y, ps * 0.42);
        if (L1) { rrPath(c, x - ps - 8, y - ps - 8, ps * 2 + 16, ps * 2 + 16, ps * 0.42); c.lineWidth = 6; c.strokeStyle = '#fff7ae'; c.stroke(); }
      });
    },
    down(x, y) {
      if (state !== 'input' || fin.on()) return;
      const k = pads.findIndex(([px, py]) => Math.abs(x - px) < ps + 4 && Math.abs(y - py) < ps + 4);
      if (k < 0) return;
      lit = k; litT = 0.22;
      if (k === seq[idx]) { idx++; Sfx.play('tap'); if (idx === L) { fin.set(); env.burst(200, 300, 24); } }
      else { shake = 0.4; Sfx.play('bad'); buzz(80); state = 'wait'; tm = 1.0; }
    },
  };
} };

GAMES.dials = { make(env) {
  // Schwer: jedes Rad dreht das rechte Nachbar-Rad mit
  const r = env.r, n = env.hard ? 5 : 4, k = env.hard ? 6 : 5, linked = env.hard;
  const sp = 400 / n, rad = Math.min(56, sp / 2 - 6);
  const ds = []; for (let i = 0; i < n; i++) ds.push({ x: sp * (i + 0.5), t: ri(0, k - 1, r), v: 0, a: 0 });
  const taps = ds.map(() => ri(0, k - 1, r)); if (taps.every(v => v === 0)) taps[0] = 1;
  ds.forEach((d, i) => { const sub = taps[i] + (linked && i > 0 ? taps[i - 1] : 0); d.v = ((d.t - sub) % k + k) % k + k * 4; d.a = d.v; });
  const fin = finisher(env);
  return {
    hint: { type: 'tap', x: ds[0].x, y: 340 },
    update(dt) { ds.forEach(d => { d.a = lerp(d.a, d.v, Math.min(1, dt * 10)); }); fin.tick(dt); },
    draw(c) {
      bgWood(c);
      rrPath(c, 20, 60, 360, 130, 18); fs(c, '#8d5a3b', 4); rrPath(c, 20, 60, 360, 40, 18); fs(c, '#a0673a', 4);
      rrPath(c, 34, 110, 332, 64, 12); fs(c, '#3d2c1f', 3);
      ds.forEach(d => { const ok = d.v % k === d.t; rrPath(c, d.x - 24, 118, 48, 48, 10); fs(c, ok ? '#d8f5e3' : '#fff7e6', 3); drawSym(c, d.t, d.x, 142, 13, 2.5); });
      if (linked) for (let i = 0; i < n - 1; i++) line(c, ds[i].x + rad * 0.6, 340, ds[i + 1].x - rad * 0.6, 340, 6, '#6f4518');
      ds.forEach(d => {
        const ok = d.v % k === d.t;
        polyPath(c, [[d.x - 9, 340 - rad - 15], [d.x + 9, 340 - rad - 15], [d.x, 340 - rad - 2]]); fs(c, '#ffd166', 3);
        ell(c, d.x, 340, rad, rad); fs(c, ok ? '#b7e4c7' : '#e9d8a6', 5);
        ell(c, d.x, 340, rad * 0.24, rad * 0.24); fs(c, '#8d5a3b', 3);
        for (let j = 0; j < k; j++) { const a = -Math.PI / 2 + (j - d.a) * TAU / k; drawSym(c, j, d.x + Math.cos(a) * rad * 0.64, 340 + Math.sin(a) * rad * 0.64, rad * 0.19, 2); }
      });
    },
    down(x, y) {
      if (fin.on()) return;
      for (let i = 0; i < n; i++) if (dist(x, y, ds[i].x, 340) < rad + 10) {
        ds[i].v++; if (linked && i < n - 1) ds[i + 1].v++; Sfx.play('tap');
        if (ds.every(q => q.v % k === q.t)) { fin.set(0.6); env.burst(200, 140, 24); Sfx.play('good'); }
        return;
      }
    },
  };
} };

GAMES.pipes = { make(env) {
  const r = env.r, N = env.hard ? 5 : 4, ts = 300 / N, gx = 50, gy = 150;
  const rot1 = m => ((m << 1) | (m >> 3)) & 15;
  const rotN = (m, n) => { for (let i = 0; i < n % 4; i++) m = rot1(m); return m; };
  const BIT = (dx, dy) => (dx === 1 ? 2 : dx === -1 ? 8 : dy === 1 ? 4 : 1);
  const sr = ri(0, N - 1, r), path = [[0, sr]], seen = new Set(['0,' + sr]);
  const minLen = N + (env.hard ? 6 : 3);
  let guard = 0;
  const dfs = (x, y) => {
    if (++guard > 40000) return false;
    if (x === N - 1 && path.length >= minLen) return true;
    for (const [dx, dy] of shuffle([[1, 0], [0, 1], [0, -1], [-1, 0]], r)) {
      const nx = x + dx, ny = y + dy, key = nx + ',' + ny;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N || seen.has(key)) continue;
      seen.add(key); path.push([nx, ny]);
      if (dfs(nx, ny)) return true;
      path.pop(); seen.delete(key);
    }
    return false;
  };
  if (!dfs(0, sr)) { path.length = 0; for (let x = 0; x < N; x++) path.push([x, sr]); }
  const er = path[path.length - 1][1];
  const T = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) T.push({ x, y, base: pick([5, 10, 3, 6, 12, 9, 7, 14], r), rot: env.hard ? ri(0, 3, r) * Math.PI / 2 : 0, a: 0, wet: false });
  path.forEach(([x, y], i) => {
    let m = 0;
    if (i === 0) m |= 8; else { const [px, py] = path[i - 1]; m |= BIT(px - x, py - y); }
    if (i === path.length - 1) m |= 2; else { const [nx, ny] = path[i + 1]; m |= BIT(nx - x, ny - y); }
    T[y * N + x].base = m;
  });
  T.forEach(t => { t.rot = ri(0, 3, r); t.a = t.rot; });
  const eff = t => rotN(t.base, t.rot);
  const flow = () => {
    T.forEach(t => (t.wet = false));
    const s = T[sr * N]; if (!(eff(s) & 8)) return false;
    const st = [s]; s.wet = true;
    while (st.length) {
      const t = st.pop(), m = eff(t);
      for (const [b, dx, dy, ob] of [[1, 0, -1, 4], [2, 1, 0, 8], [4, 0, 1, 1], [8, -1, 0, 2]]) {
        if (!(m & b)) continue;
        const nx = t.x + dx, ny = t.y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        const q = T[ny * N + nx]; if (!q.wet && eff(q) & ob) { q.wet = true; st.push(q); }
      }
    }
    const e = T[er * N + N - 1]; return e.wet && !!(eff(e) & 2);
  };
  let g2 = 0; while (flow() && g2++ < 10) { const [x, y] = path[ri(0, path.length - 1, r)]; T[y * N + x].rot++; }
  flow();
  const fin = finisher(env);
  return {
    hint: { type: 'tap', x: gx + ts / 2, y: gy + sr * ts + ts / 2 },
    update(dt) { T.forEach(t => { t.a = lerp(t.a, t.rot, Math.min(1, dt * 14)); }); fin.tick(dt); },
    draw(c) {
      bgEasy(c, '#e7ecef');
      rrPath(c, gx - 10, gy - 10, 320, 320, 18); fs(c, '#adb5bd', 4);
      const sy = gy + sr * ts + ts / 2, ey = gy + er * ts + ts / 2;
      line(c, 6, sy, gx, sy, ts * 0.26, '#4dabf7'); ell(c, 18, sy, 18, 22); fs(c, '#ffd60a', 4);
      line(c, gx + 300, ey, 394, ey, ts * 0.26, T[er * N + N - 1].wet && eff(T[er * N + N - 1]) & 2 ? '#4dabf7' : '#ced4da');
      drawFood(c, 'limo', 372, ey + 34, 54);
      T.forEach(t => {
        const cx = gx + t.x * ts + ts / 2, cy = gy + t.y * ts + ts / 2;
        rrPath(c, cx - ts / 2 + 3, cy - ts / 2 + 3, ts - 6, ts - 6, 10); fs(c, '#f8f9fa', 3);
        c.save(); c.translate(cx, cy); c.rotate((t.a * Math.PI) / 2);
        const col = t.wet ? '#ffd43b' : '#ced4da', w = ts * 0.26;
        for (const [b, dx, dy] of [[1, 0, -1], [2, 1, 0], [4, 0, 1], [8, -1, 0]]) if (t.base & b) line(c, 0, 0, dx * ts / 2, dy * ts / 2, w, col);
        ell(c, 0, 0, w * 0.62, w * 0.62); fs(c, col, 3);
        c.restore();
      });
    },
    down(x, y) {
      if (fin.on()) return;
      const tx = Math.floor((x - gx) / ts), ty = Math.floor((y - gy) / ts);
      if (tx < 0 || ty < 0 || tx >= N || ty >= N) return;
      T[ty * N + tx].rot++; Sfx.play('tap');
      if (flow()) { fin.set(0.7); env.burst(372, gy + er * ts + ts / 2, 24); Sfx.play('good'); }
    },
  };
} };

GAMES.pattern = { make(env) {
  // Schwer: Vorlage verschwindet nach ein paar Sekunden (Auge antippen = kurz nochmal schauen)
  const r = env.r, N = 4, C = env.hard ? 2 : 1;
  const tgt = new Array(N * N).fill(0), cnt = env.hard ? 8 : 6;
  shuffle([...Array(N * N).keys()], r).slice(0, cnt).forEach(i => (tgt[i] = ri(1, C, r)));
  const pl = new Array(N * N).fill(0);
  const cs = 76, ox = 200 - (cs * N) / 2, oy = 196, ts = 24, tox = 200 - (ts * N) / 2, toy = 42;
  let show = env.hard ? 4 : 1e9, cool = 0; const fin = finisher(env);
  const cell = (c, x, y, s, v) => {
    if (v) symTile(c, v - 1, x + s / 2, y + s / 2, s - 4); else { rrPath(c, x + 2, y + 2, s - 4, s - 4, s * 0.18); fs(c, '#fffdf7', s > 40 ? 3.5 : 2); }
  };
  return {
    hint: { type: 'tap', x: ox + cs / 2, y: oy + cs / 2 },
    update(dt) { show -= dt; cool -= dt; fin.tick(dt); },
    draw(c) {
      bgEasy(c, '#edf6f9');
      rrPath(c, tox - 14, toy - 14, ts * N + 28, ts * N + 28, 14); fs(c, '#ffd166', 4);
      if (show > 0) for (let i = 0; i < N * N; i++) cell(c, tox + (i % N) * ts, toy + Math.floor(i / N) * ts, ts, tgt[i]);
      else { rrPath(c, tox, toy, ts * N, ts * N, 8); fs(c, '#3d2c1f', 2); ell(c, 200, toy + ts * 2, 22, 13); fs(c, '#fff', 3); ell(c, 200, toy + ts * 2, 7, 7); c.fillStyle = cool > 0 ? '#adb5bd' : '#118ab2'; c.fill(); }
      polyPath(c, [[190, 172], [210, 172], [200, 186]]); fs(c, '#adb5bd', 2);
      rrPath(c, ox - 10, oy - 10, cs * N + 20, cs * N + 20, 18); fs(c, '#adb5bd', 4);
      for (let i = 0; i < N * N; i++) cell(c, ox + (i % N) * cs, oy + Math.floor(i / N) * cs, cs, pl[i]);
    },
    down(x, y) {
      if (fin.on()) return;
      if (env.hard && show <= 0 && cool <= 0 && Math.abs(x - 200) < 70 && y < 170) { show = 1.2; cool = 5; Sfx.play('tap'); return; }
      const cx = Math.floor((x - ox) / cs), cy = Math.floor((y - oy) / cs);
      if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      const i = cy * N + cx; pl[i] = (pl[i] + 1) % (C + 1); Sfx.play('tap');
      if (pl.every((v, j) => v === tgt[j])) { fin.set(0.6); env.burst(200, 300, 24); Sfx.play('good'); show = 9; }
    },
  };
} };

GAMES.balance = { make(env) {
  const r = env.r, PX = 200, PY = 330, U = env.hard ? 42 : 55, D = env.hard ? 4 : 3;
  const ws0 = env.hard ? [1, 2, 3, 4] : [1, 2, 3];
  const nl = env.hard ? 3 : 2, wsL = shuffle(ws0, r).slice(0, nl), dsL = shuffle([...Array(D).keys()].map(i => i + 1), r).slice(0, nl);
  const left = wsL.map((w, i) => ({ w, d: dsL[i] }));
  let LT = left.reduce((s, q) => s + q.w * q.d, 0);
  // Sicherstellen, dass rechts mit den Tablett-Gewichten lösbar ist
  const trayW = ws0.slice();
  const solvable = () => { const n = trayW.length; for (let m = 1; m < Math.pow(D + 1, n); m++) { let s = 0, used = new Set(), ok = true, mm = m; for (let i = 0; i < n; i++) { const d = mm % (D + 1); mm = Math.floor(mm / (D + 1)); if (d) { if (used.has(d)) { ok = false; break; } used.add(d); s += trayW[i] * d; } } if (ok && s === LT) return true; } return false; };
  while (!solvable()) { left.pop(); LT = left.reduce((s, q) => s + q.w * q.d, 0); }
  const trayX = trayW.map((_, i) => 200 + (i - (trayW.length - 1) / 2) * 86);
  const ws = trayW.map((w, i) => ({ w, sz: 22 + w * 7, x: trayX[i], y: 470, hx: trayX[i], hy: 470, hw: 38, hh: 38, slot: 0, locked: false }));
  const slots = new Array(D + 1).fill(0);
  let ang = 0, hold = 0; const fin = finisher(env);
  const beamPt = (d, h) => { const bx = PX + Math.cos(ang) * d * U, by = PY - 14 + Math.sin(ang) * d * U; return { x: bx + Math.sin(ang) * h, y: by - Math.cos(ang) * h }; };
  const RT = () => ws.reduce((s, q) => s + (q.slot ? q.w * q.slot : 0), 0);
  const kit = dragKit(ws, o => {
    if (o.slot) { slots[o.slot] = 0; o.slot = 0; }
    let best = 0, bd = 50;
    for (let d = 1; d <= D; d++) { if (slots[d]) continue; const p = beamPt(d, o.sz / 2 + 4); const dd = dist(o.x, o.y, p.x, p.y); if (dd < bd) { bd = dd; best = d; } }
    if (best) { o.slot = best; slots[best] = 1; Sfx.play('tap'); } else { o.hx = trayX[ws.indexOf(o)]; o.hy = 470; }
  });
  const cube = (c, x, y, w, sz, a) => {
    c.save(); c.translate(x, y); c.rotate(a);
    rrPath(c, -sz / 2, -sz / 2, sz, sz, 6); fs(c, ['#ffd166', '#f78c6b', '#ef476f', '#9b5de5'][w - 1], 4);
    const pip = [[[0, 0]], [[-0.22, -0.22], [0.22, 0.22]], [[-0.25, -0.25], [0, 0], [0.25, 0.25]], [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]][w - 1];
    pip.forEach(([px, py]) => { ell(c, px * sz, py * sz, sz * 0.09, sz * 0.09); c.fillStyle = OL; c.fill(); });
    c.restore();
  };
  return {
    hint: { type: 'drag', x: trayX[1], y: 470, x2: PX + 2 * U, y2: PY - 50 },
    update(dt) {
      const diff = RT() - LT;
      ang = lerp(ang, clamp(diff * 0.04, -0.3, 0.3), Math.min(1, dt * 5));
      ws.forEach(q => { if (q.slot && kit.drag !== q) { const p = beamPt(q.slot, q.sz / 2 + 4); q.hx = p.x; q.hy = p.y; q.x = p.x; q.y = p.y; q.back = false; } });
      kit.update(dt);
      if (!fin.on() && diff === 0 && ws.some(q => q.slot) && Math.abs(ang) < 0.02) { hold += dt; if (hold > 0.5) { fin.set(); env.burst(PX, PY - 60, 24); Sfx.play('good'); } } else hold = 0;
      fin.tick(dt);
    },
    draw(c) {
      bgSky(c, 400); chipsBand(c, 400, 520);
      rrPath(c, 20, 436, 360, 68, 14); fs(c, 'rgba(255,255,255,.35)', 3);
      polyPath(c, [[PX, PY - 10], [PX + 34, 400], [PX - 34, 400]]); fs(c, '#6c757d', 4);
      c.save(); c.translate(PX, PY - 14); c.rotate(ang);
      rrPath(c, -(D * U + 22), -9, (D * U + 22) * 2, 18, 9); fs(c, '#a0673a', 4);
      for (let d = 1; d <= D; d++) { ell(c, d * U, 0, 5, 5); fs(c, '#ffd166', 2); ell(c, -d * U, 0, 5, 5); fs(c, '#e9d8a6', 2); }
      c.restore();
      left.forEach(q => { const p = beamPt(-q.d, (22 + q.w * 7) / 2 + 4); cube(c, p.x, p.y, q.w, 22 + q.w * 7, ang); });
      for (const q of kit.sorted()) cube(c, q.x, q.y, q.w, q.sz, q.slot && kit.drag !== q ? ang : 0);
      ell(c, PX, PY - 14, 9, 9); fs(c, '#495057', 3);
    },
    down: (x, y) => kit.down(x, y), move: (x, y) => kit.move(x, y), up: () => kit.up(),
  };
} };

// Schiebepuzzle
GAMES.slider = { make(env) {
  const r = env.r, N = 3, P = 100, ox = 50, oy = 150, img = makeImage(pick(['ball', 'pluesch', 'drachen', 'roller', 'helm', 'kreisel', 'wasserpistole'], r), 300);
  const b = [...Array(N * N).keys()]; // b[pos] = Kachel, N*N-1 = leer
  let e = N * N - 1, prev = -1;
  const nb = p => [p - N, p + N, p % N ? p - 1 : -1, p % N < N - 1 ? p + 1 : -1].filter(q => q >= 0 && q < N * N);
  for (let i = 0; i < (env.hard ? 18 : 10); i++) { const opts = nb(e).filter(q => q !== prev); const q = pick(opts, r); prev = e; b[e] = b[q]; b[q] = N * N - 1; e = q; }
  if (b.every((v, i) => v === i)) { const q = nb(e)[0]; b[e] = b[q]; b[q] = N * N - 1; e = q; }
  const disp = {}; b.forEach((t, p) => (disp[t] = { x: p % N, y: Math.floor(p / N) }));
  let moves = 0; const fin = finisher(env), S = img.width / N;
  return {
    hint: { type: 'tap', x: ox + ((nb(e)[0]) % N) * P + P / 2, y: oy + Math.floor(nb(e)[0] / N) * P + P / 2 },
    update(dt) { b.forEach((t, p) => { const d = disp[t]; d.x = lerp(d.x, p % N, Math.min(1, dt * 16)); d.y = lerp(d.y, Math.floor(p / N), Math.min(1, dt * 16)); }); fin.tick(dt); },
    draw(c) {
      bgWood(c);
      rrPath(c, 290, 22, 96, 96, 12); fs(c, '#fff7e6', 3); c.drawImage(img, 298, 30, 80, 80);
      rrPath(c, ox - 10, oy - 10, N * P + 20, N * P + 20, 16); fs(c, '#3d2c1f', 4);
      for (let t = 0; t < N * N - 1; t++) {
        const d = disp[t], x = ox + d.x * P, y = oy + d.y * P;
        c.drawImage(img, (t % N) * S, Math.floor(t / N) * S, S, S, x + 2, y + 2, P - 4, P - 4);
        c.lineWidth = 2.5; c.strokeStyle = OL; c.strokeRect(x + 2, y + 2, P - 4, P - 4);
        ell(c, x + 18, y + 18, 13, 13); fs(c, 'rgba(255,255,255,.85)', 2); txt(c, String(t + 1), x + 18, y + 19, 15, '#3d2c1f', 'center', null);
      }
      txt(c, String(moves), 60, 70, 30, '#fff');
    },
    down(x, y) {
      if (fin.on()) return;
      const cx = Math.floor((x - ox) / P), cy = Math.floor((y - oy) / P); if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      const p = cy * N + cx;
      if (!nb(e).includes(p)) return;
      b[e] = b[p]; b[p] = N * N - 1; e = p; moves++; Sfx.play('tap');
      if (b.every((v, i) => v === i)) { fin.set(0.6); env.burst(200, 300, 24); Sfx.play('good'); }
    },
  };
} };

// Windlichter: Antippen schaltet das Licht und seine Nachbarn um – alle sollen leuchten
GAMES.lights = { make(env) {
  const r = env.r, N = env.hard ? 4 : 3, P = env.hard ? 80 : 100, ox = 200 - (N * P) / 2, oy = 150;
  const L = new Array(N * N).fill(1);
  const tog = p => { const x = p % N, y = Math.floor(p / N); [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < N && ny < N) L[ny * N + nx] ^= 1; }); };
  shuffle([...Array(N * N).keys()], r).slice(0, env.hard ? 6 : 3).forEach(tog);
  if (L.every(v => v)) tog(0);
  let t = 0; const fin = finisher(env);
  return {
    hint: { type: 'tap', x: ox + P / 2, y: oy + P / 2 },
    update(dt) { t += dt; fin.tick(dt); },
    draw(c) {
      c.fillStyle = '#1d2d44'; c.fillRect(0, 0, GAME_W, GAME_H);
      for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(255,255,255,.5)'; ell(c, (i * 89) % 400, (i * 47) % 120, 1.5, 1.5); c.fill(); }
      line(c, 0, 90, 400, 110, 3, '#495057', false);
      for (let p = 0; p < N * N; p++) {
        const x = ox + (p % N) * P + P / 2, y = oy + Math.floor(p / N) * P + P / 2, on = L[p], s = P / 100;
        if (on) { const g = c.createRadialGradient(x, y, 4, x, y, P * 0.6); g.addColorStop(0, 'rgba(255,214,10,.55)'); g.addColorStop(1, 'rgba(255,214,10,0)'); c.fillStyle = g; c.fillRect(x - P / 2, y - P / 2, P, P); }
        rrPath(c, x - 26 * s, y - 30 * s, 52 * s, 62 * s, 10 * s); fs(c, on ? 'rgba(255,240,180,.85)' : 'rgba(170,190,210,.35)', 3);
        rrPath(c, x - 30 * s, y - 38 * s, 60 * s, 12 * s, 5 * s); fs(c, '#6c757d', 3);
        rrPath(c, x - 9 * s, y + 4 * s, 18 * s, 22 * s, 4 * s); fs(c, '#fff', 2);
        if (on) { c.beginPath(); c.moveTo(x, y - 14 * s - Math.sin(t * 9 + p) * 2); c.quadraticCurveTo(x + 7 * s, y, x, y + 4 * s); c.quadraticCurveTo(x - 7 * s, y, x, y - 14 * s); fs(c, '#ff9f1c', 2); }
      }
      for (let i = 0; i < N * N; i++) { ell(c, 200 + (i - (N * N - 1) / 2) * 16, 50, 5, 5); fs(c, L[i] ? '#ffd60a' : '#495057', 1.5); }
    },
    down(x, y) {
      if (fin.on()) return;
      const cx = Math.floor((x - ox) / P), cy = Math.floor((y - oy) / P); if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      tog(cy * N + cx); Sfx.play('tap');
      if (L.every(v => v)) { fin.set(0.6); env.burst(200, 300, 30); Sfx.play('good'); }
    },
  };
} };

// Hula-Hoop-Turm (Türme von Hanoi)
GAMES.hanoi = { make(env) {
  const n = env.hard ? 4 : 3, px = [75, 200, 325], base = 430;
  const P = [[...Array(n).keys()].map(i => n - i), [], []];
  let sel = -1, shake = 0, moves = 0; const fin = finisher(env);
  const ring = (c, x, y, size, lift) => {
    const w = 24 + size * 11, yy = y - lift;
    ell(c, x, yy + 5, w * 0.7, 6); fs(c, '#e9ecef', 3);
    ell(c, x, yy, w, 11); fs(c, '#ffffff', 3.5);
    ell(c, x, yy, w - 7, 7); c.lineWidth = 3; c.strokeStyle = FILLS[size - 1]; c.stroke();
    ell(c, x, yy, w * 0.55, 5); c.fillStyle = 'rgba(0,0,0,.05)'; c.fill();
  };
  return {
    hint: { type: 'tap', x: px[0], y: 360 },
    update(dt) { shake = Math.max(0, shake - dt); fin.tick(dt); },
    draw(c) {
      bgSky(c, 440); chipsBand(c, 440, 520);
      txt(c, String(moves), 40, 40, 28, '#fff');
      px.forEach((x, i) => {
        rrPath(c, x - 58, base, 116, 14, 7); fs(c, i === 2 ? '#80ed99' : '#a0673a', 3); if (i === 2) icon(c, 'star', x, base + 40, 30);
        P[i].forEach((s, k) => { const isSel = sel === i && k === P[i].length - 1; ring(c, x + (isSel ? shakeX(shake) : 0), base - 10 - k * 15, s, isSel ? 190 - k * 15 : 0); });
      });
    },
    down(x) {
      if (fin.on()) return;
      const i = x < 137 ? 0 : x < 262 ? 1 : 2;
      if (sel < 0) { if (P[i].length) { sel = i; Sfx.play('tap'); } return; }
      if (i === sel) { sel = -1; return; }
      const top = P[sel][P[sel].length - 1], dst = P[i][P[i].length - 1];
      if (dst !== undefined && dst < top) { shake = 0.4; Sfx.play('bad'); buzz(60); return; }
      P[i].push(P[sel].pop()); sel = -1; moves++; Sfx.play('tap');
      if (P[2].length === n) { fin.set(0.6); env.burst(325, 300, 24); Sfx.play('good'); }
    },
  };
} };

// Hütchenspiel mit Eimerchen
function shellMake(env, P) {
  const r = env.r, n = P.n, rounds = P.rounds;
  const xs = [...Array(n).keys()].map(i => 200 + (i - (n - 1) / 2) * (n === 3 ? 120 : 92));
  let cups, ball, swaps, state, tm, cur, round = 0, lift = {}, shake = 0; const fin = finisher(env);
  const setup = () => {
    cups = [...Array(n).keys()].map(i => ({ slot: i, x: xs[i], y: 330 })); ball = ri(0, n - 1, r);
    const cnt = P.swaps + round * P.more; swaps = [];
    for (let i = 0; i < cnt; i++) { const a = ri(0, n - 1, r); let b2 = ri(0, n - 2, r); if (b2 >= a) b2++; swaps.push([a, b2]); }
    state = 'show'; tm = 1.2; cur = null; lift = { [ball]: 1 };
  };
  setup();
  const dur = () => P.dur - round * 0.04;
  return {
    hint: null,
    update(dt) {
      shake = Math.max(0, shake - dt);
      for (const k in lift) lift[k] = Math.max(0, lift[k] - (state === 'show' && tm > 0.4 ? 0 : dt * 3));
      if (state === 'show') { tm -= dt; if (tm <= 0) { state = 'swap'; tm = 0; } }
      else if (state === 'swap') {
        if (!cur) { if (!swaps.length) { state = 'pick'; this.hint = { type: 'tap', x: 200, y: 330 }; } else { const [a, b2] = swaps.shift(); cur = { a: cups.find(q => q.slot === a), b: cups.find(q => q.slot === b2), t: 0 }; } }
        if (cur) {
          cur.t += dt / dur(); const k = ease.inout(Math.min(1, cur.t));
          const xa = xs[cur.a.slot], xb = xs[cur.b.slot];
          cur.a.x = lerp(xa, xb, k); cur.a.y = 330 - Math.sin(k * Math.PI) * 40;
          cur.b.x = lerp(xb, xa, k); cur.b.y = 330 + Math.sin(k * Math.PI) * 30;
          if (cur.t >= 1) { const s = cur.a.slot; cur.a.slot = cur.b.slot; cur.b.slot = s; cur.a.x = xs[cur.a.slot]; cur.b.x = xs[cur.b.slot]; cur.a.y = cur.b.y = 330; cur = null; Sfx.play('tap'); }
        }
      } else if (state === 'reveal') { tm -= dt; if (tm <= 0) setup(); }
      fin.tick(dt);
    },
    draw(c) {
      bgSky(c, 380); chipsBand(c, 380, 520);
      rrPath(c, 30, 370, 340, 24, 10); fs(c, '#a0673a', 3);
      roundDots(c, rounds, round, 40);
      const bc = cups[ball];
      if ((lift[ball] || 0) > 0.02) drawFood(c, 'eisclown', bc.x, 344, 36);   // nur sichtbar, wenn die Glocke angehoben ist
      [...cups].sort((a, b) => a.y - b.y).forEach((cp, i) => {
        const ci = cups.indexOf(cp), up = (lift[ci] || 0) * 70, sx = state === 'pick' ? 0 : 0;
        c.save(); c.translate(cp.x + sx + (shake > 0 && state === 'reveal' ? shakeX(shake) : 0), cp.y - up);
        c.beginPath(); c.moveTo(-38, 36); c.quadraticCurveTo(-38, -30, 0, -30); c.quadraticCurveTo(38, -30, 38, 36); c.closePath(); fs(c, '#ced4da', 4);
        ell(c, -14, -6, 8, 16, -0.4); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); rrPath(c, -44, 32, 88, 8, 4); fs(c, '#adb5bd', 3); ell(c, 0, -32, 7, 6); fs(c, '#adb5bd', 3);
        c.restore();
      });
    },
    down(x) {
      if (state !== 'pick' || fin.on()) return;
      const cp = cups.reduce((b, q) => (Math.abs(q.x - x) < Math.abs(b.x - x) ? q : b));
      if (Math.abs(cp.x - x) > 60) return;
      const ci = cups.indexOf(cp); lift[ci] = 1;
      if (ci === ball) { round++; Sfx.play('good'); env.burst(cp.x, 300, 20); if (round >= rounds) fin.set(0.8); else { state = 'reveal'; tm = 1; } }
      else { lift[ball] = 1; shake = 0.5; Sfx.play('bad'); buzz(80); state = 'reveal'; tm = 1.4; }
    },
  };
}
GAMES.shell = { make: env => shellMake(env, { n: env.hard ? 4 : 3, swaps: env.hard ? 11 : 7, more: 2, dur: env.hard ? 0.3 : 0.42, rounds: 2 }) };

// Unterschiede finden
GAMES.diff = { make(env) {
  const r = env.r, k = env.hard ? 5 : 3, H2 = 225, Y1 = 34, Y2 = 280;
  const items = []; let guard = 0;
  while (items.length < (env.hard ? 12 : 9) && guard++ < 500) {
    const it = { id: pick(FOOD_IDS, r), x: 34 + r() * 332, y: 30 + r() * 165, s: 36 + r() * 16, flip: 1 };
    if (items.every(o => dist(o.x, o.y, it.x, it.y) > 52)) items.push(it);
  }
  const bottom = items.map(o => Object.assign({}, o));
  const diffs = shuffle([...items.keys()], r).slice(0, k).map(i => {
    const types = ['gone', 'swap', 'big'].concat(env.hard && ASYM.includes(items[i].id) ? ['flip', 'flip'] : []).concat(env.hard ? ['move'] : []);
    const ty = pick(types, r), b = bottom[i];
    if (ty === 'gone') b.gone = true;
    else if (ty === 'swap') b.id = pick(FOOD_IDS.filter(q => q !== b.id), r);
    else if (ty === 'big') b.s *= env.hard ? 1.3 : 1.45;
    else if (ty === 'flip') b.flip = -1;
    else if (ty === 'move') b.y = clamp(b.y + (b.y > 110 ? -28 : 28), 25, 200);
    return { x: items[i].x, y: (items[i].y + b.y) / 2, found: false };
  });
  let miss = null; const fin = finisher(env);
  const scene = (c, y0, list, marks) => {
    c.save(); c.translate(10, y0); rrPath(c, 0, 0, 380, H2, 16); c.save(); c.clip();
    c.fillStyle = BRAND.cream; c.fillRect(0, 0, 380, H2);
    c.fillStyle = 'rgba(53,69,47,.12)'; for (let i = 0; i < 380; i += 30) c.fillRect(i, 0, 15, H2); for (let j = 0; j < H2; j += 30) c.fillRect(0, j, 380, 15);
    list.forEach(o => { if (o.gone) return; c.save(); c.translate(o.x - 10, o.y); c.scale(o.flip, 1); drawAny(c, o.id, 0, 0, o.s); c.restore(); });
    if (marks) diffs.forEach(d => { if (d.found) { ell(c, d.x - 10, d.y, 30, 30); c.lineWidth = 5; c.strokeStyle = '#06d6a0'; c.stroke(); } });
    c.restore(); rrPath(c, 0, 0, 380, H2, 16); fs(c, null, 4); c.restore();
  };
  return {
    hint: null,
    update(dt) { if (miss) { miss.t -= dt; if (miss.t <= 0) miss = null; } fin.tick(dt); },
    draw(c) {
      c.fillStyle = '#fff4d6'; c.fillRect(0, 0, GAME_W, GAME_H);
      for (let i = 0; i < k; i++) { ell(c, 200 + (i - (k - 1) / 2) * 26, 18, 8, 8); fs(c, diffs[i].found ? '#06d6a0' : '#dee2e6', 2.5); }
      scene(c, Y1, items, true); scene(c, Y2 - 10, bottom, true);
      if (miss) icon(c, 'cross', miss.x, miss.y, 30, '#ef476f');
    },
    down(x, y) {
      if (fin.on()) return;
      const ly = y > Y2 - 10 ? y - (Y2 - 10) : y - Y1, lx = x;
      const d = diffs.find(q => !q.found && dist(lx, ly, q.x, q.y) < 34);
      if (d) { d.found = true; Sfx.play('good'); env.burst(x, y, 12); if (diffs.every(q => q.found)) fin.set(0.6); }
      else { miss = { x, y, t: 0.5 }; Sfx.play('bad'); }
    },
  };
} };

// Labyrinth (Schwer: nur Umgebung sichtbar)
function mazeMake(env, N, fog) {
  const r = env.r, S = 360 / N, ox = 20, oy = 130;
  const W4 = new Array(N * N).fill(15), seen = new Uint8Array(N * N);
  const st = [0]; seen[0] = 1;
  while (st.length) {
    const c0 = st[st.length - 1], x = c0 % N, y = Math.floor(c0 / N);
    const opts = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]].filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < N && ny < N && !seen[ny * N + nx]; });
    if (!opts.length) { st.pop(); continue; }
    const [dx, dy, b, ob] = pick(opts, r), n = (y + dy) * N + x + dx;
    W4[c0] &= ~b; W4[n] &= ~ob; seen[n] = 1; st.push(n);
  }
  let pos = 0, ax = 0, ay = 0, t = 0; const goal = N * N - 1, fin = finisher(env), goalId = pick(FOOD_IDS, r);
  const tryTo = cx => {
    const x = pos % N, y = Math.floor(pos / N), tx = cx % N, ty = Math.floor(cx / N);
    const dx = tx - x, dy = ty - y; if (Math.abs(dx) + Math.abs(dy) !== 1) return;
    const b = dx === 1 ? 2 : dx === -1 ? 8 : dy === 1 ? 4 : 1;
    if (W4[pos] & b) return;
    pos = cx; if (pos === goal) { fin.set(0.5); env.burst(ox + (N - 0.5) * S, oy + (N - 0.5) * S, 20); Sfx.play('good'); }
  };
  const cellAt = (x, y) => { const cx = Math.floor((x - ox) / S), cy = Math.floor((y - oy) / S); return cx < 0 || cy < 0 || cx >= N || cy >= N ? -1 : cy * N + cx; };
  return {
    hint: { type: 'drag', x: ox + S / 2, y: oy + S / 2, x2: ox + S * 2.5, y2: oy + S / 2 },
    update(dt) { t += dt; ax = lerp(ax, pos % N, Math.min(1, dt * 14)); ay = lerp(ay, Math.floor(pos / N), Math.min(1, dt * 14)); fin.tick(dt); },
    draw(c) {
      c.fillStyle = '#74c69d'; c.fillRect(0, 0, GAME_W, GAME_H);
      rrPath(c, ox - 6, oy - 6, 372, 372, 12); fs(c, '#946d47', 4);
      c.lineCap = 'round';
      for (let i = 0; i < N * N; i++) {
        const x = ox + (i % N) * S, y = oy + Math.floor(i / N) * S;
        const segs = []; if (W4[i] & 1) segs.push([x, y, x + S, y]); if (W4[i] & 2) segs.push([x + S, y, x + S, y + S]); if (W4[i] & 4) segs.push([x, y + S, x + S, y + S]); if (W4[i] & 8) segs.push([x, y, x, y + S]);
        segs.forEach(sg => line(c, sg[0], sg[1], sg[2], sg[3], 5, '#2d6a4f', false));
      }
      drawAny(c, goalId, ox + (N - 0.5) * S, oy + (N - 0.5) * S, S * 0.85);
      drawAnimal(c, env.kind, ox + (ax + 0.5) * S, oy + (ay + 0.5) * S + S * 0.38, S / 60, { t, noShadow: true });
      if (fog) {
        const cx = ox + (ax + 0.5) * S, cy = oy + (ay + 0.5) * S;
        c.save(); c.beginPath(); c.rect(0, 0, GAME_W, GAME_H); c.arc(cx, cy, S * 2.6, 0, TAU, true); c.fillStyle = 'rgba(20,30,25,.93)'; c.fill('evenodd'); c.restore();
        const g = c.createRadialGradient(cx, cy, S * 1.6, cx, cy, S * 2.6); g.addColorStop(0, 'rgba(20,30,25,0)'); g.addColorStop(1, 'rgba(20,30,25,.93)');
        c.fillStyle = g; ell(c, cx, cy, S * 2.6, S * 2.6); c.fill();
        drawAny(c, goalId, ox + (N - 0.5) * S, oy + (N - 0.5) * S, S * 0.85);
      }
    },
    down(x, y) { const ci = cellAt(x, y); if (ci >= 0) tryTo(ci); },
    move(x, y) { const ci = cellAt(x, y); if (ci >= 0 && ci !== pos) tryTo(ci); },
  };
}
GAMES.maze = { make: env => mazeMake(env, env.hard ? 10 : 7, env.hard) };

// Was passt nicht? (ein Bild ist gespiegelt)
GAMES.oddone = { make(env) {
  const r = env.r, N = env.hard ? 4 : 3, rounds = env.hard ? 4 : 3, P = 330 / N, ox = 35, oy = 130;
  let round = 0, cells, odd, shake = 0; const fin = finisher(env);
  const setup = () => {
    const id = pick(['kuchen', 'eisclown', 'limo', 'flammkuchen', 'roller', 'wasserpistole'], r); odd = ri(0, N * N - 1, r);
    cells = [...Array(N * N).keys()].map(i => ({ id, rot: 0, flip: i === odd ? -1 : 1 }));
  };
  setup();
  return {
    hint: null,
    update(dt) { shake = Math.max(0, shake - dt); fin.tick(dt); },
    draw(c) {
      bgEasy(c, '#edf6f9');
      roundDots(c, rounds, round, 60);
      cells.forEach((q, i) => {
        const x = ox + (i % N) * P + P / 2 + (shake > 0 ? shakeX(shake) * 0.5 : 0), y = oy + Math.floor(i / N) * P + P / 2;
        rrPath(c, x - P / 2 + 4, y - P / 2 + 4, P - 8, P - 8, 14); fs(c, '#fff', 3);
        c.save(); c.translate(x, y); c.rotate(q.rot); c.scale(q.flip, 1); drawAny(c, q.id, 0, 0, P * 0.7); c.restore();
      });
    },
    down(x, y) {
      if (fin.on()) return;
      const cx = Math.floor((x - ox) / P), cy = Math.floor((y - oy) / P); if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      if (cy * N + cx === odd) { round++; Sfx.play('good'); env.burst(x, y, 14); if (round >= rounds) fin.set(0.5); else setup(); }
      else { shake = 0.4; Sfx.play('bad'); buzz(60); }
    },
  };
} };

// Reihe fortsetzen
GAMES.nextrow = { make(env) {
  const r = env.r, rounds = env.hard ? 4 : 3, len = env.hard ? 7 : 6;
  let round = 0, seq, opts, shake = 0; const fin = finisher(env);
  const setup = () => {
    const shapes = shuffle([0, 1, 2, 3, 4, 5], r), cols = shuffle(FILLS, r);
    let f;
    if (!env.hard) { const p = ri(2, 3, r), pat = [...Array(p)].map((_, i) => i); if (p === 2 && r() < 0.5) pat.push(1); f = i => ({ s: shapes[pat[i % pat.length]], c: cols[pat[i % pat.length]] }); }
    else { const p1 = ri(2, 3, r), p2 = p1 === 2 ? ri(3, 4, r) : 4; f = i => ({ s: shapes[i % p1], c: cols[(i + 1) % p2] }); }
    seq = [...Array(len)].map((_, i) => f(i));
    const ans = f(len);
    const pool = [ans];
    const used = { s: [...new Set(seq.map(q => q.s))], c: [...new Set(seq.map(q => q.c))] };
    let g = 0;
    while (pool.length < 4 && g++ < 200) {
      const cand = { s: r() < 0.5 ? ans.s : pick(used.s.concat([shapes[5]]), r), c: r() < 0.5 ? ans.c : pick(used.c, r) };
      if (!pool.some(q => q.s === cand.s && q.c === cand.c)) pool.push(cand);
    }
    opts = shuffle(pool, r); opts.forEach(o => (o.ok = o === ans));
  };
  setup();
  const sw = 380 / (len + 1);
  return {
    hint: null,
    update(dt) { shake = Math.max(0, shake - dt); fin.tick(dt); },
    draw(c) {
      bgWood(c);
      roundDots(c, rounds, round, 50);
      rrPath(c, 8, 110, 384, 110, 18); fs(c, '#fff7e6', 4);
      seq.forEach((q, i) => symTile(c, q.s, 10 + sw * (i + 0.5), 165, sw * 0.86, q.c));
      const qx = 10 + sw * (len + 0.5);
      rrPath(c, qx - sw * 0.42, 130, sw * 0.84, 70, 10); fs(c, '#ffd166', 3); txt(c, '?', qx, 166, 30, '#fff');
      opts.forEach((o, i) => {
        const x = 55 + i * 97 + (shake > 0 ? shakeX(shake) * 0.5 : 0), y = 380;
        rrPath(c, x - 40, y - 46, 80, 92, 16); fs(c, '#fff', 4);
        symTile(c, o.s, x, y, 64, o.c);
      });
    },
    down(x, y) {
      if (fin.on() || y < 320 || y > 440) return;
      const i = Math.floor((x - 7) / 97); if (i < 0 || i > 3) return;
      if (opts[i].ok) { round++; Sfx.play('good'); env.burst(55 + i * 97, 380, 14); if (round >= rounds) fin.set(0.5); else setup(); }
      else { shake = 0.4; Sfx.play('bad'); buzz(60); }
    },
  };
} };

// Zähl-Wimmelbild (Schwer: alles bewegt sich)
GAMES.count = { make(env) {
  const r = env.r, rounds = 2;
  let round = 0, target, its, opts, shake = 0, t = 0; const fin = finisher(env);
  const setup = () => {
    target = pick(FOOD_IDS, r);
    const n = env.hard ? ri(7, 11, r) : ri(4, 8, r), m = env.hard ? 16 : 9;
    const others = shuffle(FOOD_IDS.filter(q => q !== target), r).slice(0, 5);
    its = [];
    for (let i = 0; i < n + m; i++) its.push({ id: i < n ? target : pick(others, r), x: 30 + r() * 340, y: 110 + r() * 230, vx: env.hard ? (r() - 0.5) * 70 : 0, vy: env.hard ? (r() - 0.5) * 50 : 0, s: 34 + r() * 10 });
    const vals = shuffle([n - 2, n - 1, n, n + 1, n + 2].filter(v => v > 0), r).slice(0, 3);
    if (!vals.includes(n)) vals[0] = n;
    opts = shuffle([...new Set(vals.concat([n + (r() < 0.5 ? 3 : -3)]))].filter(v => v > 0), r).slice(0, 4).map(v => ({ v, ok: v === n }));
    if (!opts.some(o => o.ok)) opts[0] = { v: n, ok: true };
    opts = shuffle(opts, r);
  };
  setup();
  return {
    hint: null,
    update(dt) {
      t += dt; shake = Math.max(0, shake - dt);
      for (const o of its) { o.x += o.vx * dt; o.y += o.vy * dt; if (o.x < 25 || o.x > 375) o.vx *= -1; if (o.y < 110 || o.y > 340) o.vy *= -1; }
      fin.tick(dt);
    },
    draw(c) {
      c.fillStyle = CHIP_BASE; c.fillRect(0, 0, GAME_W, GAME_H); chipsBand(c, 86, 366);
      rrPath(c, 120, 12, 160, 62, 18); fs(c, '#fff7e6', 4); drawAny(c, target, 165, 43, 44); txt(c, '?', 235, 44, 32, '#118ab2', 'center', null);
      roundDots(c, rounds, round, 82);
      its.forEach(o => drawAny(c, o.id, o.x, o.y, o.s));
      opts.forEach((o, i) => {
        const x = 55 + i * 97 + (shake > 0 ? shakeX(shake) * 0.5 : 0);
        rrPath(c, x - 40, 395, 80, 80, 18); fs(c, '#fff7e6', 4); txt(c, String(o.v), x, 436, 38, '#3d2c1f', 'center', null);
      });
    },
    down(x, y) {
      if (fin.on() || y < 390) return;
      const i = Math.floor((x - 7) / 97); if (i < 0 || i >= opts.length) return;
      if (opts[i].ok) { round++; Sfx.play('good'); env.burst(55 + i * 97, 430, 14); if (round >= rounds) fin.set(0.5); else setup(); }
      else { shake = 0.4; Sfx.play('bad'); buzz(60); setup(); }
    },
  };
} };

// ===== CHALLENGES (Typ 1): Geschicklichkeit; bei Schwer mit 3 Leben + Zeit-Balken + Bonus-Uhren =====
GAMES.run = { challenge: true, make(env) {
  const r = env.r, sp = (env.hard ? 315 : 250) * env.slow, rows = env.hard ? 22 : 16, gap = env.hard ? 160 : 190;
  const obs = [];
  for (let i = 0; i < rows; i++) {
    const D = 420 + i * gap, lanes = shuffle([0, 1, 2], r), nb = r() < (env.hard ? 0.7 : 0.35) ? 2 : 1;
    for (let k = 0; k < nb; k++) obs.push({ D, lane: lanes[k], id: pick(['ball', 'eimerchen', 'bauklotz', 'roller', 'pluesch'], r) });
    if (env.hard && r() < 0.3) obs.push({ D, lane: lanes[2], clock: true });
  }
  const end = 420 + rows * gap + 120;
  let d = 0, lane = 1, px = 200, stun = 0, inv = 0, t = 0;
  return {
    timeLimit: end / sp + 3,
    hint: { type: 'tap', x: 300, y: 430 },
    update(dt) {
      t += dt; stun -= dt; inv -= dt;
      d += sp * (stun > 0 ? 0.35 : 1) * dt;
      px = lerp(px, 100 + lane * 100, Math.min(1, dt * 16));
      for (const o of obs) {
        if (o.done) continue;
        const y = 440 - (o.D - d);
        if (Math.abs(y - 440) < 30 && Math.abs(px - (100 + o.lane * 100)) < 48) {
          if (o.clock) { o.done = true; env.addTime(3); }
          else if (inv <= 0) { o.done = true; env.hit(); stun = env.hard ? 0.3 : 0.8; inv = 1; }
        }
      }
      if (d >= end) env.win();
    },
    draw(c) {
      chipsBand(c, 0, GAME_H, 0);
      c.fillStyle = '#74c69d'; c.fillRect(0, 0, 40, GAME_H); c.fillRect(360, 0, 40, GAME_H);
      const off = d % 80;
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 4; c.setLineDash([30, 50]);
      [150, 250].forEach(x => { c.beginPath(); c.moveTo(x, -80 + off); c.lineTo(x, GAME_H + 80); c.stroke(); }); c.setLineDash([]);
      for (let i = 0; i < 6; i++) { cypress(c, 20, ((i * 110 + d) % 660) - 10, 70); cypress(c, 380, ((i * 110 + 55 + d) % 660) - 10, 70); }
      const fy = 440 - (end - 60 - d);
      if (fy > -40) for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#fff' : '#222'; c.fillRect(40 + i * 20, fy + j * 14, 20, 14); }
      for (const o of obs) {
        if (o.done) continue; const y = 440 - (o.D - d); if (y < -60 || y > 580) continue;
        const x = 100 + o.lane * 100;
        if (o.clock) { icon(c, 'clock', x, y - 10, 46); continue; }
        ell(c, x, y + 22, 30, 8); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); drawItem(c, o.id, x, y, 66);
      }
      if (!(inv > 0 && Math.floor(t * 12) % 2)) drawAnimal(c, env.kind, px, 470, 1.7, { t, moving: true, cap: hasCap(env.kind) });
    },
    down(x) { lane = x < 200 ? Math.max(0, lane - 1) : Math.min(2, lane + 1); Sfx.play('tap'); },
  };
} };

GAMES.balance_walk = { challenge: true, make(env) {
  const r = env.r, N = env.hard ? 11 : 8, zone = ((env.hard ? 9 : 14) * Math.PI) / 180;
  let step = 0, ph = r() * 6, needle = 0, wob = 0, ax = 40, clock = null, clockT = 2.5, t = 0; const fin = finisher(env);
  return {
    timeLimit: N * 1.6 + 4,
    hint: { type: 'tap', x: 200, y: 300 },
    update(dt) {
      t += dt;
      const w = (env.hard ? 3.1 : 2.5) + step * (env.hard ? 0.22 : 0.15);
      ph += dt * w * env.slow;
      needle = env.hard ? Math.sin(ph) * 0.8 + Math.sin(ph * 1.73 + 1) * 0.3 : Math.sin(ph) * 1.05;
      wob = Math.max(0, wob - dt); ax = lerp(ax, 40 + step * (320 / N), Math.min(1, dt * 6));
      if (env.hard) {
        clockT -= dt;
        if (clockT <= 0 && !clock) { clock = { x: 60 + r() * 280, y: 440 + r() * 40, t: 2 }; clockT = 3 + r() * 2; }
        if (clock) { clock.t -= dt; if (clock.t <= 0) clock = null; }
      }
      fin.tick(dt);
    },
    draw(c) {
      bgSky(c, 380); chipsBand(c, 380, 520);
      cypress(c, 60, 380, 160); cypress(c, 345, 380, 140);
      const cx = 200, cy = 200, R = 120;
      c.lineCap = 'butt';
      c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2 - 1.15, -Math.PI / 2 + 1.15); c.lineWidth = 30; c.strokeStyle = OL; c.stroke();
      c.lineWidth = 22; c.strokeStyle = '#ef476f'; c.stroke();
      c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2 - zone, -Math.PI / 2 + zone); c.strokeStyle = '#06d6a0'; c.stroke();
      c.lineCap = 'round';
      const na = -Math.PI / 2 + needle;
      line(c, cx, cy, cx + Math.cos(na) * (R + 8), cy + Math.sin(na) * (R + 8), 6, '#fff');
      ell(c, cx, cy, 12, 12); fs(c, '#495057', 3);
      for (let i = 0; i < N; i++) { ell(c, 200 + (i - (N - 1) / 2) * 24, 240, 7, 7); fs(c, i < step ? '#ffd23f' : 'rgba(255,255,255,.6)', 2.5); }
      rrPath(c, 14, 330, 372, 18, 9); fs(c, '#a0673a', 4);
      rrPath(c, 30, 348, 16, 40, 4); fs(c, '#8d5a3b', 3); rrPath(c, 354, 348, 16, 40, 4); fs(c, '#8d5a3b', 3);
      const tilt = wob > 0 ? Math.sin(t * 40) * 0.35 * wob * 2 : needle * 0.22;
      drawAnimal(c, env.kind, ax, 330, 1.25, { t, moving: false, tilt, noShadow: true, cap: hasCap(env.kind) });
      if (clock) icon(c, 'clock', clock.x, clock.y, 44 + Math.sin(t * 10) * 3);
    },
    down(x, y) {
      if (fin.on()) return;
      if (clock && dist(x, y, clock.x, clock.y) < 44) { env.addTime(3); clock = null; return; }
      if (Math.abs(needle) < zone) { step++; Sfx.play('good'); env.burst(ax + 320 / N, 310, 8); buzz(15); if (step >= N) fin.set(); }
      else { wob = 0.5; env.hit(); if (!env.hard && step > 0) step--; }
    },
  };
} };

GAMES.jump = { challenge: true, make(env) {
  const r = env.r, v = (env.hard ? 310 : 255) * env.slow, G = 1600, JV = 620, n = env.hard ? 16 : 12;
  const obs = [], clocks = []; let x = 520;
  for (let i = 0; i < n; i++) {
    const kind = r();
    if (kind < 0.38) { const w = env.hard ? 88 + r() * 32 : 72 + r() * 26; obs.push({ t: 'gap', x, w }); x += w; }
    else {
      const h = 40 + r() * 16; obs.push({ t: 'hurdle', x, w: 44, h, id: pick(['bauklotz', 'ball', 'eimerchen'], r) });
      if (env.hard && r() < 0.35) clocks.push({ x: x + 22, y: 315 });
      if (kind > 0.8) { x += 44 + (env.hard ? 150 : 175); obs.push({ t: 'hurdle', x, w: 44, h: 40, id: 'bauklotz' }); }
      x += 44;
    }
    x += env.hard ? 220 + r() * 90 : 260 + r() * 100;
  }
  const end = x + 100, PX = 110;
  let wx = 0, py = 0, vy = 0, falling = false, inv = 0, stun = 0, t = 0;
  const overGap = () => obs.some(o => o.t === 'gap' && wx + PX > o.x + 10 && wx + PX < o.x + o.w - 10);
  return {
    timeLimit: end / v + 4,
    hint: { type: 'tap', x: 200, y: 300 },
    update(dt) {
      t += dt; inv -= dt; stun -= dt;
      wx += v * (stun > 0 ? 0.5 : 1) * dt;
      vy -= G * dt; py += vy * dt;
      if (!falling && py <= 0) { if (overGap()) falling = true; else { py = 0; vy = 0; } }
      if (falling && py < -110) {
        const g = obs.filter(o => o.t === 'gap' && o.x < wx + PX + 20).pop();
        wx = (g ? g.x : wx) - 170; py = 0; vy = 0; falling = false; env.hit(); inv = 1;
      }
      if (inv <= 0) for (const o of obs) if (o.t === 'hurdle' && wx + PX > o.x - 14 && wx + PX < o.x + o.w + 14 && py < o.h - 6) { env.hit(); inv = 1; stun = 0.5; break; }
      for (const k of clocks) if (!k.done && Math.abs(wx + PX - k.x) < 36 && Math.abs(400 - py - 30 - k.y) < 55) { k.done = true; env.addTime(3); }
      if (wx + PX >= end) env.win();
    },
    draw(c) {
      bgSky(c, 400);
      for (let i = 0; i < 8; i++) { const cx = ((i * 140 - wx * 0.3) % 1120 + 1120) % 1120 - 60; cypress(c, cx, 400, 120 + (i % 3) * 30); }
      chipsBand(c, 400, 520, -wx);
      for (const o of obs) {
        const sx = o.x - wx; if (sx > 460 || sx + o.w < -60) continue;
        if (o.t === 'gap') { c.fillStyle = '#2b1d14'; c.fillRect(sx, 398, o.w, 130); c.fillStyle = '#4a3324'; c.fillRect(sx + 6, 404, o.w - 12, 120); }
        else drawItem(c, o.id, sx + 22, 400 - o.h / 2 + (o.id === 'bauklotz' ? 4 : 0), o.h + 12);
      }
      for (const k of clocks) if (!k.done) { const sx = k.x - wx; if (sx > -40 && sx < 440) icon(c, 'clock', sx, k.y, 40); }
      const fx = end - wx; if (fx < 440) { line(c, fx, 400, fx, 300, 5, '#495057'); polyPath(c, [[fx, 300], [fx + 46, 315], [fx, 330]]); fs(c, '#ef476f', 3); }
      if (!(inv > 0 && Math.floor(t * 12) % 2)) drawAnimal(c, env.kind, PX, 400 - py, 1.5, { t, moving: py === 0, cap: hasCap(env.kind), noShadow: py !== 0 || falling });
    },
    down() { if (!falling && py === 0) { vy = JV; Sfx.play('jump'); } },
  };
} };

GAMES.collect = { challenge: true, make(env) {
  const r = env.r, target = pick(FOOD_IDS, r), others = shuffle(FOOD_IDS.filter(i => i !== target), r).slice(0, 6);
  const need = env.hard ? 12 : 8, v = (env.hard ? 300 : 230) * env.slow;
  let got = 0, px = 200, tx = 200, spT = 0.4, inv = 0, t = 0; const its = [], fin = finisher(env);
  return {
    timeLimit: need * 2.1 + 4,
    hint: { type: 'swipe', x: 200, y: 450 },
    update(dt) {
      t += dt; inv -= dt; spT -= dt;
      if (spT <= 0) {
        spT = (env.hard ? 0.42 : 0.58) / env.slow;
        const good = r() < (env.hard ? 0.45 : 0.5); its.push({ x: 50 + r() * 300, y: -40, id: good ? target : pick(others, r), good, ph: r() * 6, sw: env.hard ? 40 : 0 });
        if (env.hard && r() < 0.12) its.push({ x: 50 + r() * 300, y: -130, clock: true, ph: 0, sw: 0 });
      }
      px = lerp(px, tx, Math.min(1, dt * 16));
      for (const o of its) {
        o.y += v * dt; o.ph += dt * 3; const ox = o.x + Math.sin(o.ph) * o.sw;
        if (!o.done && dist(ox, o.y, px, 430) < 44) {
          o.done = true;
          if (o.clock) env.addTime(3);
          else if (o.good) { got++; Sfx.play('good'); env.burst(px, 420, 10); if (got >= need) fin.set(0.4); }
          else if (inv <= 0) { env.hit(); inv = 0.8; if (!env.hard) got = Math.max(0, got - 1); }
        }
      }
      for (let i = its.length - 1; i >= 0; i--) if (its[i].done || its[i].y > 580) its.splice(i, 1);
      fin.tick(dt);
    },
    draw(c) {
      chipsBand(c, 0, GAME_H, Math.floor(t * 20));
      rrPath(c, 100, 12, 200, 70, 20); fs(c, '#fff7e6', 4);
      drawAny(c, target, 140, 47, 52);
      for (let i = 0; i < need; i++) { ell(c, 186 + (i % 6) * 18, 34 + Math.floor(i / 6) * 24, 7, 7); fs(c, i < got ? '#06d6a0' : '#dee2e6', 2); }
      for (const o of its) { const ox = o.x + Math.sin(o.ph) * o.sw; if (o.clock) icon(c, 'clock', ox, o.y, 44); else drawAny(c, o.id, ox, o.y, 58); }
      if (!(inv > 0 && Math.floor(t * 12) % 2)) drawAnimal(c, env.kind, px, 470, 1.6, { t, moving: Math.abs(px - tx) > 4, dir: tx < px ? -1 : 1, cap: hasCap(env.kind) });
    },
    down(x) { tx = clamp(x, 40, 360); }, move(x) { tx = clamp(x, 40, 360); },
  };
} };

// Spielplatz-Highlight 1: Rutschen-Ausweich-Lauf
GAMES.slide = { challenge: true, make(env) {
  const r = env.r, v = (env.hard ? 330 : 265) * env.slow, dur = env.hard ? 23 : 18, wave = (env.hard ? 0.6 : 0.8) / env.slow;
  const lanes = [118, 200, 282]; const obs = [];
  let t = 0, wT = 0.6, px = 200, tx = 200, inv = 0, off = 0;
  return {
    timeLimit: dur / env.slow + 5,
    hint: { type: 'swipe', x: 200, y: 160 },
    update(dt) {
      t += dt; inv -= dt; off += v * dt; wT -= dt;
      if (wT <= 0 && t < dur / env.slow) {
        wT = wave;
        const ls = shuffle([0, 1, 2], r), nb = r() < (env.hard ? 0.75 : 0.35) ? 2 : 1;
        for (let k = 0; k < nb; k++) {
          const kid = r() < 0.3, roll = env.hard && !kid && r() < 0.3;
          obs.push({ x: lanes[ls[k]] + (r() - 0.5) * 20, y: 580, kid, vx: roll ? (r() < 0.5 ? -60 : 60) : 0, id: kid ? pick(['hase', 'igel'], r) : pick(['ball', 'pluesch', 'eimerchen', 'frisbee', 'bauklotz'], r) });
        }
        if (env.hard && r() < 0.25) obs.push({ x: lanes[ls[2]], y: 580, clock: true, vx: 0 });
      }
      px = lerp(px, tx, Math.min(1, dt * 14));
      for (const o of obs) {
        o.y -= v * dt; o.x += o.vx * dt; if (o.x < 100 || o.x > 300) o.vx *= -1;
        if (!o.done && dist(o.x, o.y, px, 130) < 44) {
          if (o.clock) { o.done = true; env.addTime(3); }
          else if (inv <= 0) { o.done = true; env.hit(); inv = 1; }
        }
      }
      for (let i = obs.length - 1; i >= 0; i--) if (obs[i].y < -60 || (obs[i].done && obs[i].clock)) obs.splice(i, 1);
      if (t > dur / env.slow + 1.6) env.win();
    },
    draw(c) {
      chipsBand(c, 0, GAME_H, Math.floor(off));
      const endY = 640 - (t - dur / env.slow) * v;
      const g = c.createLinearGradient(70, 0, 330, 0); g.addColorStop(0, '#adb5bd'); g.addColorStop(0.5, '#f1f3f5'); g.addColorStop(1, '#adb5bd');
      c.fillStyle = g; c.fillRect(70, -10, 260, Math.min(GAME_H + 20, endY + 10));
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3;
      for (let y = -(off % 70); y < Math.min(GAME_H, endY); y += 70) { c.beginPath(); c.moveTo(110, y); c.lineTo(110, y + 30); c.moveTo(290, y + 30); c.lineTo(290, y + 60); c.stroke(); }
      rrPath(c, 56, -20, 18, Math.min(GAME_H + 40, endY + 20), 9); fs(c, '#ced4da', 4);
      rrPath(c, 326, -20, 18, Math.min(GAME_H + 40, endY + 20), 9); fs(c, '#ced4da', 4);
      for (const o of obs) {
        if (o.done) continue;
        if (o.clock) icon(c, 'clock', o.x, o.y, 44);
        else if (o.kid) drawCritter(c, o.id, o.x, o.y + 20, 1.1, t);
        else { c.save(); c.translate(o.x, o.y); if (o.vx) c.rotate(o.y * 0.03); drawItem(c, o.id, 0, 0, 60); c.restore(); }
      }
      if (!(inv > 0 && Math.floor(t * 12) % 2)) drawAnimal(c, env.kind, px, 150, 1.5, { t, moving: false, tilt: (tx - px) * 0.01, cap: hasCap(env.kind) });
      for (let i = 0; i < 4; i++) line(c, px - 30 + i * 20, 70 - ((t * 300 + i * 40) % 60), px - 30 + i * 20, 90 - ((t * 300 + i * 40) % 60), 3, 'rgba(255,255,255,.8)', false);
    },
    down(x) { tx = clamp(x, 100, 300); }, move(x) { tx = clamp(x, 100, 300); },
  };
} };

// Spielplatz-Highlight 2: Schaukel-Timing
GAMES.swing = { challenge: true, make(env) {
  const r = env.r, n = env.hard ? 6 : 4, PY = 110, L = 250, GY = 430, A = 0.95;
  const st = []; for (let k = 0; k < n; k++) st.push({ x: 300 + k * 280, w: (env.hard ? 2.5 : 2.0) * (0.85 + r() * 0.3) * env.slow, ph: r() * 6 });
  const spot = i => 160 + i * 280;
  const clocks = {}; if (env.hard) for (let i = 1; i < n; i++) if (r() < 0.5) clocks[i] = true;
  let si = 0, px = spot(0), mode = 'idle', mt = 0, from = 0, to = 0, inv = 0, t = 0, cam = 0; const fin = finisher(env);
  const dashT = env.hard ? 0.42 : 0.55;
  const seat = s => { const th = A * Math.sin(s.w * t + s.ph); return { x: s.x + L * Math.sin(th), y: PY + L * Math.cos(th), th }; };
  return {
    timeLimit: n * 2.8 + 4,
    hint: { type: 'tap', x: 200, y: 300 },
    update(dt) {
      t += dt; inv -= dt;
      if (mode === 'dash' || mode === 'back') {
        mt += dt; const k = clamp(mt / (mode === 'dash' ? dashT : 0.35), 0, 1);
        px = lerp(from, to, mode === 'dash' ? k : ease.out(k));
        if (mode === 'dash' && inv <= 0) {
          const s = seat(st[si]);
          if (s.y > 338 && Math.abs(s.x - px) < 36) { env.hit(); inv = 0.9; mode = 'back'; mt = 0; from = px; to = spot(si); }
        }
        if (k >= 1) {
          if (mode === 'dash') { si++; Sfx.play('good'); if (clocks[si]) { clocks[si] = false; env.addTime(3); } if (si >= n) fin.set(0.4); }
          mode = 'idle';
        }
      }
      cam = lerp(cam, px - 130, Math.min(1, dt * 6));
      fin.tick(dt);
    },
    draw(c) {
      bgSky(c, GY);
      c.save(); c.translate(-cam * 0.3, 0);
      rrPath(c, 40, 250, 1400, 180, 10); fs(c, 'rgba(190,225,240,.8)', 3, 'rgba(60,90,110,.6)');
      for (let x = 40; x < 1440; x += 60) { c.beginPath(); c.moveTo(x, 250); c.lineTo(x, GY); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.stroke(); }
      c.restore();
      c.save(); c.translate(-cam, 0);
      c.fillStyle = CHIP_BASE; c.fillRect(cam - 10, GY, 420, 100);
      c.save(); c.translate(cam, 0); chipsBand(c, GY, 520, -cam); c.restore();
      for (let i = 0; i <= n; i++) { const x = spot(i); ell(c, x, GY + 12, 34, 9); c.fillStyle = 'rgba(255,255,255,.3)'; c.fill(); if (clocks[i]) icon(c, 'clock', x, GY - 120, 40); }
      const fx = spot(n); line(c, fx + 40, GY, fx + 40, GY - 110, 5, '#495057'); polyPath(c, [[fx + 40, GY - 110], [fx + 86, GY - 95], [fx + 40, GY - 80]]); fs(c, '#ef476f', 3);
      for (const s of st) {
        line(c, s.x - 70, GY, s.x - 8, PY - 6, 12, '#8d5a3b'); line(c, s.x + 70, GY, s.x + 8, PY - 6, 12, '#8d5a3b');
        rrPath(c, s.x - 24, PY - 16, 48, 18, 8); fs(c, '#6f4518', 4);
        const p = seat(s);
        line(c, s.x - 4, PY, p.x - 18 * Math.cos(p.th), p.y + 18 * Math.sin(p.th), 2.5, '#adb5bd');
        line(c, s.x + 4, PY, p.x + 18 * Math.cos(p.th), p.y - 18 * Math.sin(p.th), 2.5, '#adb5bd');
        c.save(); c.translate(p.x, p.y); c.rotate(-p.th); rrPath(c, -26, -4, 52, 12, 4); fs(c, '#343a40', 3.5); c.restore();
      }
      if (!(inv > 0 && Math.floor(t * 12) % 2)) drawAnimal(c, env.kind, px, GY, 1.4, { t, moving: mode !== 'idle', cap: hasCap(env.kind) });
      c.restore();
    },
    down() { if (mode === 'idle' && si < n && !fin.on()) { mode = 'dash'; mt = 0; from = px; to = spot(si + 1); Sfx.play('jump'); } },
  };
} };

// Spiegelbild: rechte Hälfte spiegelverkehrt ergänzen
GAMES.mirror = { make(env) {
  const r = env.r, C = env.hard ? 8 : 6, R = env.hard ? 6 : 5, K = env.hard ? 2 : 1, cs = 360 / C, ox = 20, oy = 140, half = C / 2;
  const g = new Array(C * R).fill(0);
  for (let y = 0; y < R; y++) for (let x = 0; x < half; x++) if (r() < 0.45) g[y * C + x] = ri(1, K, r);
  if (g.every(v => !v)) g[0] = 1;
  const want = i => { const x = i % C, y = Math.floor(i / C); return g[y * C + (C - 1 - x)]; };
  const fin = finisher(env);
  return {
    hint: { type: 'tap', x: ox + (half + 0.5) * cs, y: oy + cs / 2 },
    update(dt) { fin.tick(dt); },
    draw(c) {
      bgEasy(c, '#edf6f9');
      rrPath(c, ox - 8, oy - 8, 376, R * cs + 16, 14); fs(c, '#adb5bd', 4);
      for (let i = 0; i < C * R; i++) {
        const x = ox + (i % C) * cs, y = oy + Math.floor(i / C) * cs, v = g[i], left = i % C < half;
        if (v) symTile(c, v - 1, x + cs / 2, y + cs / 2, cs - 4); else { rrPath(c, x + 2, y + 2, cs - 4, cs - 4, 7); fs(c, left ? '#dee2e6' : '#fffdf7', 2.5); }
      }
      line(c, 200, oy - 20, 200, oy + R * cs + 20, 5, '#ffd166');
      icon(c, 'back', 150, 90, 34, '#ffd166'); c.save(); c.translate(250, 90); c.scale(-1, 1); icon(c, 'back', 0, 0, 34, '#ffd166'); c.restore();
    },
    down(x, y) {
      if (fin.on()) return;
      const cx = Math.floor((x - ox) / cs), cy = Math.floor((y - oy) / cs);
      if (cx < half || cy < 0 || cx >= C || cy >= R) return;
      const i = cy * C + cx; g[i] = (g[i] + 1) % (K + 1); Sfx.play('tap');
      let ok = true; for (let j = 0; j < C * R; j++) if (j % C >= half && g[j] !== want(j)) { ok = false; break; }
      if (ok) { fin.set(0.6); env.burst(300, 300, 24); Sfx.play('good'); }
    },
  };
} };

// Bild drehen: jede Kachel ist verdreht
GAMES.rotimg = { make(env) {
  const r = env.r, N = env.hard ? 4 : 3, P = 300 / N, ox = 50, oy = 150, img = makeImage(pick(['roller', 'drachen', 'wasserpistole', 'seifenblasen', 'helm', 'kreisel'], r), 300);
  const S = img.width / N, fin = finisher(env), ictx = img.getContext('2d');
  // Für jedes Teil prüfen, in welchen Drehungen es gleich aussieht (z. B. nur Wiese oder Himmel)
  const sameRots = i => {
    const sx = (i % N) * S, sy = Math.floor(i / N) * S, d = ictx.getImageData(sx, sy, S, S).data, m = 16;
    const px = (x, y) => { const X = Math.floor((x + 0.5) * S / m), Y = Math.floor((y + 0.5) * S / m), o = (Y * S + X) * 4; return [d[o], d[o + 1], d[o + 2]]; };
    const out = [0];
    for (let k = 1; k < 4; k++) {
      let diff = 0;
      for (let y = 0; y < m; y++) for (let x = 0; x < m; x++) {
        let X = x, Y = y; for (let q = 0; q < k; q++) { const nx = m - 1 - Y; Y = X; X = nx; }
        const p1 = px(x, y), p2 = px(X, Y); diff += Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]) + Math.abs(p1[2] - p2[2]);
      }
      if (diff / (m * m) < 12) out.push(k);
    }
    return out;
  };
  const T = [...Array(N * N).keys()].map(i => { const eq = sameRots(i); const fixed = eq.length === 4; const wrong = [0, 1, 2, 3].filter(k => !eq.includes(k)); return { eq, fixed, rot: fixed ? 0 : pick(wrong, r), a: 0, wob: 0 }; });
  T.forEach(t => (t.a = t.rot));
  const solved = () => T.every(t => t.fixed || t.eq.includes(((t.rot % 4) + 4) % 4));
  return {
    tiles: T,
    hint: { type: 'tap', x: ox + P / 2, y: oy + P / 2 },
    update(dt) { T.forEach(t => { t.a = lerp(t.a, t.rot, Math.min(1, dt * 14)); t.wob = Math.max(0, t.wob - dt); }); fin.tick(dt); },
    draw(c) {
      bgWood(c);
      rrPath(c, 290, 22, 96, 96, 12); fs(c, '#fff7e6', 3); c.drawImage(img, 298, 30, 80, 80);
      rrPath(c, ox - 10, oy - 10, 320, 320, 16); fs(c, '#3d2c1f', 4);
      T.forEach((t, i) => {
        const x = ox + (i % N) * P + P / 2, y = oy + Math.floor(i / N) * P + P / 2;
        c.save(); c.translate(x + shakeX(t.wob) * 0.4, y); c.rotate(t.a * Math.PI / 2);
        c.drawImage(img, (i % N) * S, Math.floor(i / N) * S, S, S, -P / 2 + 2, -P / 2 + 2, P - 4, P - 4);
        c.lineWidth = 2; c.strokeStyle = OL; c.strokeRect(-P / 2 + 2, -P / 2 + 2, P - 4, P - 4); c.restore();
      });
    },
    down(x, y) {
      if (fin.on()) return;
      const cx = Math.floor((x - ox) / P), cy = Math.floor((y - oy) / P); if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      const tt = T[cy * N + cx]; if (tt.fixed) { tt.wob = 0.3; return; }
      tt.rot++; Sfx.play('tap');
      if (solved()) { fin.set(0.6); env.burst(200, 300, 24); Sfx.play('good'); }
    },
  };
} };

// Punkte der Reihe nach verbinden (Schwer: in Zweierschritten)
function dotsMake(env, n, step) {
  const r = env.r, shapeName = pick(Object.keys(DOT_SHAPES), r), pts = shapeDots(shapeName, n); let g = 9999;
  while (pts.length < n && g++ < 2000) { const p = { x: 40 + r() * 320, y: 110 + r() * 370 }; if (pts.every(q => dist(q.x, q.y, p.x, p.y) > 62)) pts.push(p); }
  const order = pts.map((p, i) => ({ ...p, v: (i + 1) * step }));
  const shown = shuffle(order, r);
  let idx = 0, shake = 0, miss = null; const fin = finisher(env);
  return {
    hint: { type: 'tap', x: order[0].x, y: order[0].y },
    update(dt) { shake = Math.max(0, shake - dt); if (miss) { miss.t -= dt; if (miss.t <= 0) miss = null; } fin.tick(dt); },
    draw(c) {
      bgEasy(c, '#fdf0d5');
      rrPath(c, 110, 18, 180, 60, 18); fs(c, '#fff', 4);
      txt(c, String(step), 150, 48, 30, '#118ab2', 'center', null); icon(c, 'play', 200, 48, 24, '#ffd166'); txt(c, String(2 * step), 250, 48, 30, '#118ab2', 'center', null);
      if (idx === n) { polyPath(c, order.map(q => [q.x, q.y])); c.fillStyle = 'rgba(149,193,31,.35)'; c.fill(); drawFood(c, shapeName === 'flammkuchen' ? 'flammkuchen' : shapeName === 'palme' ? 'palme' : shapeName === 'eisbecher' ? 'eisbecher' : 'glashaus', 200, 320, 110); }
      for (let i = 1; i < idx; i++) line(c, order[i - 1].x, order[i - 1].y, order[i].x, order[i].y, 6, '#ef476f');
      if (idx === n) line(c, order[n - 1].x, order[n - 1].y, order[0].x, order[0].y, 6, '#ef476f');
      shown.forEach(p => {
        const done = p.v <= idx * step, sx = shakeX(shake) * 0.4;
        ell(c, p.x + sx, p.y, 24, 24); fs(c, done ? '#06d6a0' : '#fff', 3.5);
        txt(c, String(p.v), p.x + sx, p.y + 1, 20, done ? '#fff' : '#3d2c1f', 'center', null);
      });
      if (miss) icon(c, 'cross', miss.x, miss.y, 26, '#ef476f');
    },
    down(x, y) {
      if (fin.on()) return;
      const p = order.find(q => dist(x, y, q.x, q.y) < 30); if (!p) return;
      if (p === order[idx]) { idx++; Sfx.play('tap'); if (idx === n) { fin.set(0.6); env.burst(200, 300, 24); Sfx.play('good'); } }
      else if (p.v > idx * step) { shake = 0.3; miss = { x, y, t: 0.4 }; Sfx.play('bad'); }
    },
  };
}
GAMES.dots = { make: env => dotsMake(env, env.hard ? 14 : 10, env.hard ? 2 : 1) };


// ===== Weitere Leicht-Aufgaben (Katze): viel Abwechslung, nie Scheitern =====
GAMES.cups = { make: env => shellMake(env, { n: 3, swaps: 4, more: 1, dur: 0.62, rounds: 3 }) };
GAMES.maze_easy = { make: env => mazeMake(env, 5, false) };
GAMES.dots_easy = { make: env => dotsMake(env, 10, 1) };

// Wimmelbild: alle gleichen Dinge finden
GAMES.findall = { make(env) {
  const r = env.r, target = pick(FOOD_IDS, r), n = ri(4, 5, r);
  const LOOKALIKE = [['ball', 'springball', 'murmeln'], ['eimerchen', 'sandfoermchen'], ['frisbee', 'hulahoop']];
  const like = (LOOKALIKE.find(g2 => g2.includes(target)) || [target]);
  const list = shuffle([...Array(n).fill(target), ...shuffle(FOOD_IDS.concat(ITEM_IDS).filter(i => !like.includes(i) && i !== target), r).slice(0, 11)], r);
  const its = []; let g = 0;
  for (const id of list) { let p; do { p = { x: 50 + r() * 300, y: 130 + r() * 350 }; g++; } while (g < 3000 && its.some(o => dist(o.x, o.y, p.x, p.y) < 64)); its.push({ id, x: p.x, y: p.y, found: false, wob: 0 }); }
  let got = 0; const fin = finisher(env);
  const first = its.find(o => o.id === target);
  return {
    hint: { type: 'tap', x: first.x, y: first.y },
    update(dt) { its.forEach(o => (o.wob = Math.max(0, o.wob - dt))); fin.tick(dt); },
    draw(c) {
      bgEasy(c, '#e9f5db');
      rrPath(c, 100, 16, 200, 80, 22); fs(c, '#fff', 4); drawAny(c, target, 150, 56, 56);
      for (let i = 0; i < n; i++) { ell(c, 210 + i * 24, 56, 9, 9); fs(c, i < got ? '#06d6a0' : '#dee2e6', 2.5); }
      its.forEach(o => {
        if (o.found) { ell(c, o.x, o.y, 38, 38); fs(c, 'rgba(6,214,160,.25)', 4, '#06d6a0'); }
        c.save(); c.translate(o.x, o.y); c.rotate(Math.sin(o.wob * 30) * 0.2); drawAny(c, o.id, 0, 0, 54); c.restore();
      });
    },
    down(x, y) {
      if (fin.on()) return;
      const o = its.find(q => dist(x, y, q.x, q.y) < 42); if (!o) return;
      if (o.id === target && !o.found) { o.found = true; got++; Sfx.play('good'); env.burst(o.x, o.y); buzz(25); if (got === n) fin.set(0.6); }
      else if (!o.found) { o.wob = 0.4; Sfx.play('tap'); }
    },
  };
} };

// Weg nachfahren: den Drachen fliegen lassen
GAMES.trace = { make(env) {
  const r = env.r, ctrl = [[60, 470], [60 + r() * 280, 400], [60 + r() * 280, 330], [60 + r() * 280, 260], [60 + r() * 280, 190], [60 + r() * 280, 130], [330, 70]];
  const pts = [];
  for (let s = 0; s < ctrl.length - 1; s++) for (let i = 0; i < 20; i++) { const k = i / 20, a = ctrl[s], b = ctrl[s + 1]; const e = ease.inout(k); pts.push([lerp(a[0], b[0], k), lerp(a[1], b[1], e)]); }
  pts.push(ctrl[ctrl.length - 1]);
  let idx = 0, drag = false; const fin = finisher(env);
  return {
    hint: { type: 'drag', x: pts[0][0], y: pts[0][1], x2: pts[20][0], y2: pts[20][1] },
    update(dt) { fin.tick(dt); },
    draw(c) {
      bgSky(c, GAME_H);
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.lineWidth = 34; c.strokeStyle = 'rgba(255,255,255,.75)'; c.stroke();
      c.setLineDash([4, 14]); c.lineWidth = 6; c.strokeStyle = '#118ab2'; c.stroke(); c.setLineDash([]);
      if (idx > 0) { c.beginPath(); for (let i = 0; i <= idx; i++) i ? c.lineTo(pts[i][0], pts[i][1]) : c.moveTo(pts[i][0], pts[i][1]); c.lineWidth = 10; c.strokeStyle = '#ffd166'; c.stroke(); }
      const e = pts[pts.length - 1]; drawUmbrella(c, e[0], e[1], 34);
      const p = pts[idx]; ell(c, p[0], p[1], 26, 8); fs(c, '#adb5bd', 3); drawFood(c, 'eisclown', p[0], p[1] - 20, 50);
    },
    down(x, y) { const p = pts[idx]; if (dist(x, y, p[0], p[1]) < 60) drag = true; },
    move(x, y) {
      if (!drag || fin.on()) return;
      for (let k = Math.min(pts.length - 1, idx + 8); k > idx; k--) if (dist(x, y, pts[k][0], pts[k][1]) < 34) { idx = k; break; }
      if (idx >= pts.length - 1) { fin.set(0.5); env.burst(pts[idx][0], pts[idx][1], 20); Sfx.play('good'); }
    },
    up() { drag = false; },
  };
} };

// Zählen mit Würfel-Augen
GAMES.count_easy = { make(env) {
  const r = env.r, rounds = 3; let round = 0, n, id, its, opts, shake = 0; const fin = finisher(env);
  const setup = () => {
    n = ri(3, 6, r); id = pick(['eisclown', 'croissant', 'limo', 'kuchen', 'eisbecher'], r); its = []; let g = 0; const oth = shuffle(FOOD_IDS.filter(q => q !== id), r).slice(0, 2);
    for (let i = 0; i < n; i++) { let p; do { p = { x: 70 + r() * 260, y: 110 + r() * 200 }; g++; } while (g < 2000 && its.some(o => dist(o.x, o.y, p.x, p.y) < 62)); its.push(p); }
    for (let i = 0; i < ri(2, 4, r); i++) { let p; do { p = { x: 70 + r() * 260, y: 110 + r() * 200 }; g++; } while (g < 4000 && its.some(o => dist(o.x, o.y, p.x, p.y) < 62)); p.id = pick(oth, r); its.push(p); }
    const pool = shuffle([1, 2, 3, 4, 5, 6].filter(v => v !== n), r).slice(0, 2).concat([n]);
    opts = shuffle(pool, r).map(v => ({ v, ok: v === n }));
  };
  setup();
  const die = (c, x, y, v) => {
    rrPath(c, x - 44, y - 44, 88, 88, 18); fs(c, '#fff', 4);
    const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[v];
    P.forEach(([a, b]) => { ell(c, x + a * 20, y + b * 20, 8, 8); c.fillStyle = OL; c.fill(); });
  };
  return {
    hint: null,
    update(dt) { shake = Math.max(0, shake - dt); fin.tick(dt); },
    draw(c) {
      bgEasy(c);
      roundDots(c, rounds, round, 40);
      rrPath(c, 30, 70, 340, 280, 24); fs(c, '#e9f5db', 3);
      its.forEach(p => drawAny(c, p.id || id, p.x, p.y, 58));
      rrPath(c, 8, 8, 62, 62, 14); fs(c, '#fff', 3); drawAny(c, id, 39, 39, 46); txt(c, '?', 62, 60, 18, '#118ab2', 'center', '#fff');
      opts.forEach((o, i) => die(c, 80 + i * 120 + (shake > 0 ? shakeX(shake) * 0.4 : 0), 435, o.v));
    },
    down(x, y) {
      if (fin.on() || y < 380) return;
      const i = Math.round((x - 80) / 120); if (i < 0 || i > 2) return;
      if (opts[i].ok) { round++; Sfx.play('good'); env.burst(80 + i * 120, 435, 14); if (round >= rounds) fin.set(0.5); else setup(); }
      else { shake = 0.4; Sfx.play('tap'); }
    },
  };
} };

// Ausmalen: Farbe (mit Form) wählen, dann das passende Feld antippen
const HITC = document.createElement('canvas').getContext('2d');
GAMES.color = { make(env) {
  const r = env.r, P = (fn) => { const p = new Path2D(); fn(p); return p; };
  const regions = pick([
    [ // Spielhaus
      { p: P(p => p.rect(40, 360, 320, 100)), s: 3 },
      { p: P(p => p.rect(110, 210, 160, 150)), s: 2 },
      { p: P(p => { p.moveTo(90, 215); p.lineTo(190, 110); p.lineTo(290, 215); p.closePath(); }), s: 0 },
      { p: P(p => p.rect(165, 290, 50, 70)), s: 1 },
      { p: P(p => { p.moveTo(270, 260); p.lineTo(360, 360); p.lineTo(330, 360); p.lineTo(270, 300); p.closePath(); }), s: 1 },
      { p: P(p => p.arc(345, 70, 34, 0, TAU)), s: 2 },
    ],
    [ // Drachen
      { p: P(p => { p.moveTo(200, 70); p.lineTo(300, 200); p.lineTo(200, 200); p.closePath(); }), s: 0 },
      { p: P(p => { p.moveTo(200, 70); p.lineTo(100, 200); p.lineTo(200, 200); p.closePath(); }), s: 1 },
      { p: P(p => { p.moveTo(100, 200); p.lineTo(200, 340); p.lineTo(200, 200); p.closePath(); }), s: 2 },
      { p: P(p => { p.moveTo(300, 200); p.lineTo(200, 340); p.lineTo(200, 200); p.closePath(); }), s: 3 },
      { p: P(p => p.arc(230, 400, 22, 0, TAU)), s: 0 },
      { p: P(p => p.arc(180, 455, 22, 0, TAU)), s: 2 },
    ],
  ], r).map(q => ({ ...q, done: false }));
  const centers = regions.map(q => { let sx = 0, sy = 0, n = 0; for (let x = 0; x < 400; x += 8) for (let y = 0; y < 520; y += 8) if (HITC.isPointInPath(q.p, x, y)) { sx += x; sy += y; n++; } return [sx / n, sy / n]; });
  let sel = -1, shake = 0, shakeI = -1; const fin = finisher(env);
  return {
    hint: { type: 'tap', x: 80, y: 490 },
    update(dt) { shake = Math.max(0, shake - dt); fin.tick(dt); },
    draw(c) {
      c.fillStyle = '#fffdf7'; c.fillRect(0, 0, GAME_W, GAME_H);
      regions.forEach((q, i) => {
        c.save(); if (i === shakeI && shake > 0) c.translate(shakeX(shake) * 0.5, 0);
        c.fillStyle = q.done ? SYMS[q.s].col : '#fff'; c.fill(q.p); c.lineWidth = 4; c.strokeStyle = OL; c.stroke(q.p);
        if (!q.done) { c.globalAlpha = 0.55; drawSym(c, q.s, centers[i][0], centers[i][1], 13, 2); c.globalAlpha = 1; }
        c.restore();
      });
      [0, 1, 2, 3].forEach(s => { const x = 80 + s * 80, y = 490; if (sel === s) { ell(c, x, y, 34, 34); fs(c, '#fff7ae', 0); } ell(c, x, y, 26, 26); fs(c, SYMS[s].col, 4); ell(c, x, y, 19, 19); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); drawSym(c, s, x, y, 11); });
    },
    down(x, y) {
      if (fin.on()) return;
      if (y > 455) { const s = Math.round((x - 80) / 80); if (s >= 0 && s <= 3) { sel = s; Sfx.play('tap'); } return; }
      const i = regions.findIndex(q => !q.done && HITC.isPointInPath(q.p, x, y)); if (i < 0) return;
      if (regions[i].s === sel) { regions[i].done = true; Sfx.play('good'); env.burst(x, y, 10); if (regions.every(q => q.done)) fin.set(0.6); }
      else { shake = 0.3; shakeI = i; Sfx.play('tap'); }
    },
  };
} };

// Seilspringen: tippen, wenn das Seil unten ankommt
GAMES.rope = { make(env) {
  const need = 9; let ph = 0, jumpT = 0, got = 0, stop = 0, t = 0, prev = 0; const fin = finisher(env);
  return {
    hint: { type: 'tap', x: 200, y: 300 },
    update(dt) {
      t += dt; jumpT = Math.max(0, jumpT - dt);
      if (stop > 0) stop -= dt; else ph += dt * 2.9;
      const cyc = Math.floor(ph / TAU);
      if (cyc !== prev) { prev = cyc; if (jumpT > 0.1) { got++; Sfx.play('good'); env.burst(200, 380, 10); if (got >= need) fin.set(0.5); } else if (cyc > 0) { stop = 0.6; Sfx.play('tap'); } }
      fin.tick(dt);
    },
    draw(c) {
      bgSky(c, 400); chipsBand(c, 400, 520);
      const jh = jumpT > 0 ? Math.sin((1 - jumpT / 0.55) * Math.PI) * 70 : 0;
      const ry = 290 + Math.cos(ph) * 120, behind = Math.sin(ph) < 0;
      const rope = () => { c.beginPath(); c.moveTo(80, 300); c.quadraticCurveTo(200, ry * 2 - 300, 320, 300); c.lineWidth = 7; c.strokeStyle = OL; c.stroke(); c.lineWidth = 4; c.strokeStyle = '#f4a261'; c.stroke(); };
      if (behind) rope();
      drawCritter(c, 'hase', 60, 400, 1.6, t); drawCritter(c, 'igel', 340, 400, 1.6, t + 1);
      drawAnimal(c, env.kind, 200, 405 - jh, 1.7, { t, noShadow: jh > 0, cap: hasCap(env.kind) });
      if (!behind) rope();
      for (let i = 0; i < need; i++) { ell(c, 200 + (i - 2.5) * 30, 40, 10, 10); fs(c, i < got ? '#ffd23f' : 'rgba(255,255,255,.7)', 3); }
    },
    down() { if (jumpT <= 0 && !fin.on()) { jumpT = 0.55; Sfx.play('jump'); } },
  };
} };

// Der Größe nach in eine Reihe legen
GAMES.size_row = { make(env) {
  const r = env.r, id = pick(['eisbecher', 'limo', 'kuchen', 'croissant', 'eisclown'], r), sizes = [36, 50, 64, 78, 92], sx = [45, 120, 200, 283, 358];
  const spots = shuffle([[80, 140], [200, 120], [320, 150], [150, 250], [270, 255]], r);
  const its = sizes.map((s, i) => ({ s, i, x: spots[i][0], y: spots[i][1], hx: spots[i][0], hy: spots[i][1], hw: s / 2 + 6, hh: s / 2 + 6, locked: false }));
  const fin = finisher(env);
  const kit = dragKit(its, o => { if (dist(o.x, o.y, sx[o.i], 430) < 55) { o.hx = sx[o.i]; o.hy = 430; o.locked = true; Sfx.play('good'); env.burst(o.hx, 430); buzz(25); if (its.every(q => q.locked)) fin.set(0.6); } });
  return {
    hint: { type: 'drag', x: its[0].x, y: its[0].y, x2: sx[0], y2: 430 },
    update(dt) { kit.update(dt); fin.tick(dt); },
    draw(c) {
      bgEasy(c);
      rrPath(c, 14, 360, 372, 140, 22); fs(c, '#e9d8a6', 3);
      sizes.forEach((s, i) => { c.globalAlpha = 0.35; drawAny(c, id, sx[i], 430, s, true); c.globalAlpha = 1; });
      icon(c, 'play', 200, 380, 22, '#ffd166');
      for (const q of kit.sorted()) drawAny(c, id, q.x, q.y, q.s);
    },
    down: (x, y) => kit.down(x, y), move: (x, y) => kit.move(x, y), up: () => kit.up(),
  };
} };

// ===== 2D-Jump'n'Run (nur Schwer / Löwe): jedes Mal ein neu zusammengebauter Spielplatz-Parcours =====
const KEYS = {};
window.addEventListener('keydown', e => { if (e.target && e.target.tagName === 'INPUT') return; KEYS[e.key] = true; if ([' ', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); });
window.addEventListener('keyup', e => { KEYS[e.key] = false; });
GAMES.platform = { challenge: true, make(env) {
  const r = env.r, T = 40, GY = 360;               // Kachelgröße, Boden-Grundlinie (über den Knöpfen)
  const plats = [], movers = [], hazards = [], enemies = [], clocks = [], checks = [];
  let x = 0, gh = 0;                                // gh = Bodenhöhe in Kacheln über GY
  const ground = (w) => { plats.push({ x, y: GY - gh * T, w: w * T, h: 400, k: 'g' }); x += w * T; };
  ground(6);
  const SEG = ['flat', 'gap', 'step', 'planks', 'mover', 'spikes', 'bees', 'ballrun', 'gap', 'step', 'planks', 'mover', 'spikes', 'ballrun', 'bees', 'tower'];
  const segs = shuffle(SEG, r).slice(0, 13);
  segs.forEach((sg, i) => {
    if (sg === 'flat') { ground(4 + ri(0, 2, r)); }
    else if (sg === 'gap') { x += (2 + ri(0, 1, r)) * T; ground(3); }
    else if (sg === 'step') { const d = ri(0, 1, r) ? 1 : -1; gh = clamp(gh + d * ri(1, 2, r), 0, 3); ground(3); gh = clamp(gh + (r() < 0.5 ? 1 : -1), 0, 3); ground(3); }
    else if (sg === 'planks') { const base = GY - gh * T; for (let k = 0; k < 3; k++) { plats.push({ x: x + 30 + k * 120, y: base - 50 - (k % 2) * 60, w: 80, h: 16, k: 'p' }); } x += 380; ground(3); }
    else if (sg === 'mover') { const base = GY - gh * T; movers.push({ x0: x + 20, x1: x + 220, y: base - 20, w: 90, h: 16, k: 'm', ph: r() * 6 }); x += 330; ground(3); }
    else if (sg === 'spikes') { ground(2); hazards.push({ x: x + 5, y: GY - gh * T, w: 30 }); ground(3); }
    else if (sg === 'bees') { const bx = x; ground(6); enemies.push({ t: 'bee', x: bx + 3 * T, y0: GY - gh * T - 90, y: 0, ph: r() * 6, alive: true }); }
    else if (sg === 'ballrun') { const bx = x; ground(7); enemies.push({ t: 'ball', x: bx + 5 * T, xmin: bx + 20, xmax: bx + 7 * T - 20, v: -70 - r() * 30, y: GY - gh * T, alive: true }); }
    else if (sg === 'tower') { const g0 = gh; for (let k = 1; k <= 3; k++) { gh = Math.min(g0 + k, 4); ground(1); } x += 2 * T; gh = Math.max(0, g0 - 1); ground(3); }
    if (env.hard && r() < 0.35) clocks.push({ x: x - T * 1.5, y: GY - gh * T - 75 });
    if (i % 4 === 3) checks.push({ x: x - T * 1.5, y: GY - gh * T, on: false });
  });
  ground(5); const goalX = x - 3 * T, goalY = GY - gh * T;
  const P = { x: 60, y: GY - 1, vx: 0, vy: 0, w: 26, h: 40, on: false, coyote: 0, buf: 0, dir: 1 };
  let spawn = { x: 60, y: GY - 1 }, cam = 0, inv = 0, t = 0, won = false;
  const held = new Map(); // pointerId -> 'L'|'R'|'J'
  const btn = { L: { x: 58, y: 470 }, R: { x: 150, y: 470 }, J: { x: 335, y: 462 } };
  const solids = () => plats.concat(movers);
  const hurt = () => { if (inv > 0) return; env.hit(); inv = 1.2; P.vy = -380; P.vx = -P.dir * 160; };
  const respawn = () => { env.hit(); inv = 1.2; P.x = spawn.x; P.y = spawn.y; P.vx = P.vy = 0; };
  return {
    timeLimit: x / 150 + 12,
    dbg: { P, clocks },
    hint: { type: 'tap', x: btn.J.x, y: btn.J.y },
    update(dt) {
      t += dt; inv -= dt; dt = Math.min(dt, 1 / 30);
      const L = [...held.values()].includes('L') || KEYS.ArrowLeft, R = [...held.values()].includes('R') || KEYS.ArrowRight;
      const J = [...held.values()].includes('J') || KEYS[' '] || KEYS.ArrowUp;
      movers.forEach(m => { const nx = lerp(m.x0, m.x1, 0.5 + 0.5 * Math.sin(t * 1.1 + m.ph)); m.dx = nx - (m.x || nx); m.x = nx; });
      const acc = P.on ? 1800 : 1100, max = 230 * env.slow;
      if (L && !R) { P.vx = Math.max(-max, P.vx - acc * dt); P.dir = -1; } else if (R && !L) { P.vx = Math.min(max, P.vx + acc * dt); P.dir = 1; } else P.vx *= P.on ? Math.pow(0.0005, dt) : Math.pow(0.3, dt);
      P.coyote -= dt; P.buf -= dt;
      if (J && !this.jHeld) P.buf = 0.12; this.jHeld = J;
      if (P.buf > 0 && (P.on || P.coyote > 0)) { P.vy = -640; P.on = false; P.coyote = 0; P.buf = 0; Sfx.play('jump'); }
      if (!J && P.vy < -260) P.vy = -260;               // kurzer Druck = kleiner Sprung
      P.vy = Math.min(900, P.vy + 1700 * dt);
      // horizontal
      P.x += P.vx * dt;
      for (const s of solids()) if (P.x + P.w / 2 > s.x && P.x - P.w / 2 < s.x + s.w && P.y > s.y + 2 && P.y - P.h < s.y + s.h && s.k === 'g') { P.x = P.vx > 0 ? s.x - P.w / 2 : s.x + s.w + P.w / 2; P.vx = 0; }
      // vertikal
      const wasOn = P.on; P.on = false; const py0 = P.y; P.y += P.vy * dt;
      for (const s of solids()) {
        if (P.x + P.w / 2 <= s.x || P.x - P.w / 2 >= s.x + s.w) continue;
        if (P.vy >= 0 && py0 <= s.y + 1 && P.y >= s.y) { P.y = s.y; P.vy = 0; P.on = true; if (s.k === 'm') P.x += s.dx; }
        else if (s.k === 'g' && P.vy < 0 && P.y - P.h < s.y + s.h && py0 - P.h >= s.y + s.h - 1) { P.y = s.y + s.h + P.h; P.vy = 0; }
      }
      if (wasOn && !P.on) P.coyote = 0.1;
      P.x = Math.max(20, P.x);
      if (P.y > GY + 160) respawn();
      for (const h of hazards) if (P.x + 6 > h.x && P.x - 6 < h.x + h.w && P.y > h.y - 14 && P.y - P.h < h.y) hurt();
      for (const e of enemies) {
        if (!e.alive) continue;
        if (e.t === 'bee') { e.y = e.y0 + Math.sin(t * 2.2 + e.ph) * 55; e.cx = e.x + Math.sin(t * 1.3 + e.ph) * 60; }
        else { e.x += e.v * dt; if (e.x < e.xmin || e.x > e.xmax) e.v *= -1; e.cx = e.x; e.y = e.y; }
        const ey = e.t === 'bee' ? e.y : e.y - 18;
        if (Math.abs(P.x - e.cx) < 26 && Math.abs(P.y - P.h / 2 - ey) < 34) {
          if (P.vy > 120 && P.y - 10 < ey) { e.alive = false; P.vy = -480; Sfx.play('pop'); env.burst(e.cx, ey, 12); }
          else hurt();
        }
      }
      for (const k of clocks) if (!k.done && Math.abs(P.x - k.x) < 36 && Math.abs(P.y - P.h / 2 - k.y) < 48) { k.done = true; env.addTime(4); }
      for (const ck of checks) if (!ck.on && P.x > ck.x) { ck.on = true; spawn = { x: ck.x, y: ck.y - 1 }; Sfx.play('good'); env.burst(ck.x, ck.y - 60, 10); }
      if (!won && P.x > goalX) { won = true; env.win(); }
      cam = lerp(cam, clamp(P.x - 150, 0, x - 400), Math.min(1, dt * 8));
    },
    draw(c) {
      bgSky(c, GAME_H);
      c.save(); c.translate(-cam * 0.25, 0);
      rrPath(c, -20, 250, x * 0.3 + 800, 200, 10); fs(c, 'rgba(190,225,240,.7)', 2, 'rgba(60,90,110,.4)');
      for (let i = 0; i * 140 < x * 0.3 + 800; i++) cypress(c, 40 + i * 140, 450, 130 + (i % 3) * 25);
      c.restore();
      c.save(); c.translate(-cam, 0);
      for (const s of plats) {
        if (s.x > cam + 440 || s.x + s.w < cam - 40) continue;
        if (s.k === 'g') { c.fillStyle = '#8a6a48'; c.fillRect(s.x, s.y, s.w, 420); c.fillStyle = CHIP_BASE; c.fillRect(s.x, s.y, s.w, 14); for (let i = 0; i < s.w / 9; i++) { c.fillStyle = CHIP_COLS[i % 6]; ell(c, s.x + i * 9 + 4, s.y + 6 + (i % 3) * 2, 3, 1.4, i); c.fill(); } rrPath(c, s.x, s.y, s.w, 420, 4); fs(c, null, 3); }
        else { rrPath(c, s.x, s.y, s.w, s.h, 5); fs(c, '#c08b55', 3); line(c, s.x + 10, s.y + 16, s.x + 10, s.y + 34, 4, '#8d5a3b'); line(c, s.x + s.w - 10, s.y + 16, s.x + s.w - 10, s.y + 34, 4, '#8d5a3b'); }
      }
      for (const m of movers) { rrPath(c, m.x, m.y, m.w, m.h, 6); fs(c, '#adb5bd', 3); line(c, m.x + 8, m.y + 8, m.x + m.w - 8, m.y + 8, 2, '#fff', false); }
      for (const h of hazards) drawYucca(c, h.x + h.w / 2, h.y + 2, 0.5, t);
      for (const ck of checks) { line(c, ck.x, ck.y, ck.x, ck.y - 70, 4, '#495057'); polyPath(c, [[ck.x, ck.y - 70], [ck.x + 34, ck.y - 60], [ck.x, ck.y - 50]]); fs(c, ck.on ? '#06d6a0' : '#ced4da', 2.5); }
      for (const k of clocks) if (!k.done) icon(c, 'clock', k.x, k.y + Math.sin(t * 4) * 4, 36);
      for (const e of enemies) {
        if (!e.alive) continue;
        if (e.t === 'bee') { c.save(); c.translate(e.cx, e.y); ell(c, 0, 0, 14, 10); fs(c, '#ffd60a', 2.5); line(c, -3, -9, -3, 9, 3, OL, false); line(c, 4, -8, 4, 8, 3, OL, false); ell(c, -4, -12, 7, 5 + Math.sin(t * 40) * 2); fs(c, 'rgba(255,255,255,.8)', 1.5); c.restore(); }
        else { c.save(); c.translate(e.cx, e.y - 18); c.rotate(e.x * 0.05); drawItem(c, 'ball', 0, 0, 42); c.restore(); }
      }
      line(c, goalX, goalY, goalX, goalY - 110, 5, '#495057'); polyPath(c, [[goalX, goalY - 110], [goalX + 50, goalY - 95], [goalX, goalY - 80]]); fs(c, '#ef476f', 3);
      if (!(inv > 0 && Math.floor(t * 12) % 2)) drawAnimal(c, env.kind, P.x, P.y, 1.15, { t, moving: P.on && Math.abs(P.vx) > 20, dir: P.dir, cap: hasCap(env.kind), noShadow: !P.on });
      c.restore();
      // Steuerung
      const on = k => [...held.values()].includes(k);
      [['L', 'back'], ['R', 'back'], ['J', 'play']].forEach(([k, ic]) => {
        const b = btn[k], rr = k === 'J' ? 44 : 36;
        ell(c, b.x, b.y, rr, rr); c.fillStyle = on(k) ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.4)'; c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(43,29,20,.6)'; c.stroke();
        c.save(); c.translate(b.x, b.y); if (k === 'R') c.scale(-1, 1); if (k === 'J') c.rotate(-Math.PI / 2); icon(c, ic, 0, 0, rr * 0.9, '#3d2c1f'); c.restore();
      });
    },
    down(px, py, id) {
      let k = null;
      if (dist(px, py, btn.J.x, btn.J.y) < 70 || px > 260) k = 'J';
      else if (px < 104) k = 'L'; else if (px < 230) k = 'R';
      if (k) held.set(id, k);
    },
    move(px, py, id) { if (!held.has(id) || held.get(id) === 'J') return; held.set(id, px < 104 ? 'L' : 'R'); },
    up(px, py, id) { held.delete(id); },
  };
} };
const CHALLENGES_HARD = ['platform'];

const EASY_GAMES = ['memory', 'connect', 'pop', 'puzzle', 'stack', 'shadow', 'sort', 'findall', 'trace', 'count_easy', 'color', 'rope', 'size_row', 'cups', 'maze_easy', 'dots_easy'];
const PUZZLES = ['sequence', 'dials', 'pipes', 'pattern', 'balance', 'lights', 'hanoi', 'shell', 'diff', 'maze', 'oddone', 'nextrow', 'count', 'pairs', 'mirror', 'rotimg', 'dots'];
const CHALLENGES_STD = ['run', 'balance_walk', 'jump', 'collect'];
const CHALLENGES_SP = ['slide', 'swing'];
