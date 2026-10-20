'use strict';
// ---------- Die Geschichte: „Olli und der große Sturm“ ----------
// In der Nacht vor dem großen Original-Fest wirbelt ein Sturm alles durcheinander. Olli, das kleine Blatt aus dem Original-Logo,
// wird dabei weggeweht – und findet dich, den neuen Helfer. Zusammen bringt ihr Bereich für Bereich wieder in Ordnung.
// Jeder Bereich ist ein Kapitel: beim ersten Betreten eine kurze Bilder-Szene, nach dem Schaffen geht es weiter, am Ende wird gefeiert.
// Gesehene Szenen merkt sich das Konto (tut.st_…), auf der Bereichs-Karte kann man sie nochmal ansehen.
const STORY = {
  kueche: { title: 'Kapitel 1', name: 'Sturm in der Küche', cast: ['olli', 'k_marco'],
    intro: [['olli', 'Jetzt geht es richtig los! Das hier ist die Küche vom Original.'],
      ['k_marco', 'In der Küche liegt alles durcheinander. Ohne unsere Sachen gibt es kein Festessen!'],
      ['olli', 'Komm, wir helfen zusammen! Fang hier in der Küche an.']],
    outro: [['k_marco', 'Danke! Jetzt können wir das Festessen kochen.'],
      ['olli', 'Super! Weiter ins Glashaus – dort hat der Sturm die Tische durcheinandergebracht.']] },
  gastraum: { title: 'Kapitel 2', name: 'Durcheinander im Glashaus', cast: ['olli', 'g_rosi'],
    intro: [['g_rosi', 'Oh je, der Wind hat durchs offene Fenster geweht! Die Tische fürs Fest sind ganz durcheinander.'],
      ['olli', 'Keine Sorge, Oma Rosi – wir finden alles wieder!']],
    outro: [['g_rosi', 'Wie schön die Tische jetzt aussehen!'],
      ['olli', 'Prima! Draußen auf der Terrasse sieht es bestimmt auch wild aus.']] },
  aussen: { title: 'Kapitel 3', name: 'Lichter unter Palmen', cast: ['olli', 'a_weber'],
    intro: [['a_weber', 'Der Sturm hat die ganze Fest-Deko von der Terrasse geweht!'],
      ['olli', 'Wir helfen allen hier draußen – dann leuchtet die Terrasse heute Abend.']],
    outro: [['a_weber', 'Die Terrasse ist wieder wunderschön!'],
      ['olli', 'Jetzt der Spielplatz! Ich höre die Kinder schon rufen.']] },
  spielplatz: { title: 'Kapitel 4', name: 'Spielplatz-Alarm', cast: ['olli', 'hase'],
    intro: [['hase', 'Hallo! Der Wind hat unsere Spielsachen über den ganzen Spielplatz verteilt!'],
      ['olli', 'Ich sehe da schon was glitzern. Los, wir suchen!']],
    outro: [['hase', 'Juhu, alles wieder da! Danke!'],
      ['olli', 'Gleich kommen die Gäste fürs Fest – schnell zum Parkplatz!']] },
  parkplatz: { title: 'Kapitel 5', name: 'Die Gäste kommen', cast: ['olli', 'p_schmidt'],
    intro: [['p_schmidt', 'Die ersten Gäste sind da, aber der Sturm hat Schilder und Kegel umgeweht!'],
      ['olli', 'Wenn hier alles klappt, kann das Fest beginnen. Wir schaffen das!']],
    outro: [['p_schmidt', 'Alle Gäste sind gut angekommen.'],
      ['olli', 'Wir haben es geschafft! Das Fest kann beginnen!']] },
  chalet: { title: 'Bonus-Kapitel', name: 'Hüttenzauber im Chalet', cast: ['olli', 'c_gerda'],
    intro: [['c_gerda', 'Gut, dass ihr da seid! Der Sturm hat bei uns im Chalet Schnee in alle Ecken geweht.'],
      ['olli', 'Ein Abenteuer in den Bergen? Da sind wir dabei!']],
    outro: [['c_gerda', 'Danke, ihr zwei! Jetzt ist es überall gemütlich.'],
      ['olli', 'Du bist der beste Helfer, den das Original je hatte!']] },
  geisterwald: { title: 'Halloween', name: 'Die Nacht im Geisterwald', cast: ['olli', 'h_hexe'],
    intro: [['h_hexe', 'Hihihi! Willkommen im Geisterwald – in der Halloween-Nacht spukt es hier!'],
      ['olli', 'Huch, ist das gruselig! Sammeln wir Bonbons und Kürbismünzen und helfen allen im Wald.']],
    outro: [['h_hexe', 'Ihr habt den Geisterwald gerettet! Im Kürbis-Laden warten Kostüme auf euch.']] },
};
const STORY_FEST = { title: 'Finale', name: 'Das große Original-Fest', bg: 'gastraum', fest: true, cast: ['olli', 'k_marco', 'g_rosi', 'hase', 'p_schmidt'],
  lines: [['olli', 'Schau nur! Überall ist alles wieder in Ordnung – und das Fest beginnt!'],
    ['erzaehler', 'Alle feiern zusammen: mit Musik, Eis und einem großen Feuerwerk.'],
    ['olli', 'Danke, dass du mir geholfen hast! Ich fliege jetzt zurück aufs Schild – aber ich bin immer bei dir.'],
    ['olli', 'Ach ja: Aus dem Chalet in den Bergen kam ein Brief. Dort braucht man uns auch!']] };
// Olli: ein grünes Blatt aus dem Logo mit Gesicht, Ärmchen und kleinen Füßen; schwebt leicht
function drawOlli(c, x, y, s, t = 0, wave = false) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round';
  c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, 0, 0, 12, 4.5); c.fill();
  const fl = Math.sin(t * 2.4) * 2.5; c.translate(0, -6 + fl);
  for (const s2 of [-1, 1]) line(c, s2 * 4, -6, s2 * 5, 0, 2.5, '#2d6a4f');   // Füßchen
  c.save(); c.translate(0, -26); c.rotate(Math.sin(t * 1.6) * 0.08);
  c.beginPath(); c.moveTo(0, 22); c.bezierCurveTo(-22, 10, -20, -18, 2, -26); c.bezierCurveTo(22, -16, 20, 12, 0, 22); c.closePath();
  const g = c.createLinearGradient(-18, -20, 18, 20); g.addColorStop(0, '#b5e48c'); g.addColorStop(1, BRAND.lime); c.fillStyle = g; c.fill(); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.moveTo(0, 20); c.quadraticCurveTo(-2, 0, 2, -22); c.lineWidth = 1.6; c.strokeStyle = '#6a994e'; c.stroke();   // Blattader
  ell(c, -5, -4, 2.4, 3.2); c.fillStyle = OL; c.fill(); ell(c, 6, -4, 2.4, 3.2); c.fill(); c.fillStyle = '#fff'; ell(c, -4.4, -5.2, 0.9, 0.9); c.fill(); ell(c, 6.6, -5.2, 0.9, 0.9); c.fill();
  c.beginPath(); c.arc(0.5, 2, 4, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke();
  c.fillStyle = 'rgba(255,120,120,.4)'; ell(c, -10, 2, 2.6, 1.6); c.fill(); ell(c, 11, 2, 2.6, 1.6); c.fill();
  const wv = wave ? Math.sin(t * 10) * 0.6 : 0.2; line(c, -15, 4, -21, -2 - wv * 6, 2.5, '#2d6a4f'); line(c, 15, 4, 21, -2 + (wave ? 0 : 0), 2.5, '#2d6a4f');   // Ärmchen
  line(c, 1, -25, 4, -32, 2.5, '#6a994e');   // Stiel
  c.restore(); c.restore();
}
const STORY_MAIN = ['kueche', 'gastraum', 'aussen', 'spielplatz', 'parkplatz'];
const storySeen = k => { const a = ACC(); return !!(a && a.tut && a.tut['st_' + k]); };
const storyMark = k => { const a = ACC(); if (a) { a.tut['st_' + k] = true; Save.write(); } };
function speakerName(id) { return id === 'erzaehler' ? '' : NPC_NAMES[id] || ''; }

// ---------- Bilder-Szene: Hintergrund des Bereichs, Figuren unten, Sprechblase oben – antippen = weiter ----------
class Cutscene {
  constructor(sc, kind, done) {   // kind: 'intro' | 'outro' | 'fest'
    this.sc = sc; this.lines = kind === 'fest' ? sc.lines : sc[kind]; this.kind = kind; this.done = done; this.i = -1; this.t = 0; this.lt = 0; this.title = kind !== 'outro' ? 2.0 : 0;
    this.bg = sc.bg || sc.stage; this.rockets = [];
    if (!this.title) this.next();
  }
  next() {
    this.i++; this.lt = 0;
    if (this.i >= this.lines.length) { this.finish(); return; }
    const [who, text] = this.lines[this.i]; Voice.say(text, true, who); Sfx.play('pop');
  }
  finish() { if (this.ended) return; this.ended = true; Voice.stop(); if (overlay === this) overlay = null; if (this.done) this.done(); }
  update(dt) {
    this.t += dt; this.lt += dt;
    if (this.title > 0) { this.title -= dt; if (this.title <= 0) this.next(); }
    if (this.sc.fest) { if (Math.random() < dt * 2.5) this.rockets.push({ x: 0.15 + Math.random() * 0.7, t: 0, col: pick(['#ffd166', '#ef476f', '#06d6a0', '#4dabf7', '#ff70a6']) }); this.rockets.forEach(r => (r.t += dt)); this.rockets = this.rockets.filter(r => r.t < 2); }
  }
  draw(c) {
    const t = this.t;
    // Hintergrund: großes Bild des Bereichs, unten etwas dunkler für die Figuren
    if (this.bg && typeof stageArt === 'function') stageArt(c, this.bg, 0, 0, W, H, t); else { c.fillStyle = '#86a866'; c.fillRect(0, 0, W, H); }
    if (this.sc.fest) { c.fillStyle = 'rgba(20,10,40,.45)'; c.fillRect(0, 0, W, H); this.rockets.forEach(r => { const x = r.x * W, y = H * 0.55 - Math.min(1, r.t * 1.6) * H * 0.4; if (r.t < 0.6) { ell(c, x, y, 3, 3); c.fillStyle = '#fff'; c.fill(); } else { const k = (r.t - 0.6) / 1.4; c.globalAlpha = 1 - k; for (let a = 0; a < 12; a++) { const an = a * TAU / 12; ell(c, x + Math.cos(an) * k * 60, y + Math.sin(an) * k * 60, 3.5, 3.5); c.fillStyle = r.col; c.fill(); } c.globalAlpha = 1; } }); }
    const g = c.createLinearGradient(0, H * 0.5, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = g; c.fillRect(0, H * 0.5, W, H * 0.5);
    // Kapitel-Titel
    if (this.title > 0 || this.i < 0) { const k = clamp(Math.min(this.title, 2 - this.title) * 2.5, 0, 1); c.globalAlpha = k; c.fillStyle = 'rgba(16,28,18,.7)'; c.fillRect(0, 0, W, H); txt(c, this.sc.title, W / 2, H / 2 - 26, 20, '#ffd166', 'center', BRAND.ink); txt(c, this.sc.name, W / 2, H / 2 + 12, Math.min(38, W / 14), '#fff', 'center', BRAND.ink, W - 40); c.globalAlpha = 1; UI.btn(0, 0, W, H, () => { this.title = 0; this.next(); }); return; }
    const line = this.lines[Math.min(this.i, this.lines.length - 1)], who = line[0], text = line[1];
    // Figuren: der Held (eigenes Tier) + die Besetzung; wer spricht, hüpft und ist vorne
    const cast = this.sc.cast, n = cast.length + 1, base = H - 14, gap0 = W / (n + 0.6), s = clamp(Math.min(H / 300, gap0 / 40), 1.3, 2.8), gap = Math.min(gap0, 170 * s / 2.2);   // schmal (Hochformat): Figuren kleiner statt übereinander
    const kindA = (ACC() && ACC().char) || 'cat', all = [['hero']].concat(cast.map(id => [id]));
    all.forEach(([id], k) => {
      const x = W / 2 + (k - (n - 1) / 2) * gap, talk = id === who, hop = talk ? Math.abs(Math.sin(this.lt * 7)) * 8 : 0, fs2 = talk ? s * 1.08 : s;
      c.save(); if (!talk && who !== 'erzaehler') c.globalAlpha = 0.85;
      if (id === 'hero') drawAnimal(c, kindA, x, base - hop, fs2, { t, cap: true, wave: false }); else drawCritter(c, id, x, base - hop, fs2 * 0.95, t, { staff: true, wave: talk });
      c.restore();
    });
    // Sprechblase oben
    const bw = Math.min(W - 40, 640), bx = (W - bw) / 2, by = 14, nm = speakerName(who);
    c.font = `900 17px ${FONT}`; const shown = text.slice(0, Math.floor(this.lt * 45)), L = wrapLines(c, text, bw - 40, 17), bh = 44 + L.length * 24;
    rrPath(c, bx, by, bw, bh, 20); fs(c, '#fffdf5', 3);
    if (nm) { c.font = `900 13px ${FONT}`; const nw = c.measureText(nm).width + 24; rrPath(c, bx + 18, by - 10, nw, 22, 11); fs(c, BRAND.lime, 2); txt(c, nm, bx + 18 + nw / 2, by + 1, 13, '#fff', 'center', BRAND.ink); }
    let left = shown.length; L.forEach((l, k) => { const part = l.slice(0, Math.max(0, left)); left -= l.length + 1; txt(c, part, bx + 22, by + 32 + k * 24, 17, '#3d2c1f', 'left', null); });
    const full = shown.length >= text.length;
    if (full) { const b = Math.abs(Math.sin(t * 4)) * 4; polyPath(c, [[bx + bw - 34, by + bh - 20 + b], [bx + bw - 22, by + bh - 20 + b], [bx + bw - 28, by + bh - 12 + b]]); fs(c, BRAND.olive, 0); }
    // Fortschritt + Überspringen
    for (let k = 0; k < this.lines.length; k++) { ell(c, W / 2 + (k - (this.lines.length - 1) / 2) * 16, by + bh + 14, 4.5, 4.5); fs(c, k <= this.i ? '#fff' : 'rgba(255,255,255,.4)', 1.5); }
    UI.btn(0, 0, W, H, () => { if (!full) this.lt = 99; else this.next(); });   // zuerst: sonst würde sie „Überspringen“ verdecken
    const sy = by + bh + 28; rrPath(c, W - 128, sy - 17, 116, 34, 17); fs(c, 'rgba(255,255,255,.85)', 2); txt(c, 'Überspringen', W - 70, sy + 1, 13, '#3d2c1f', 'center', null, 100);   // unter der Sprechblase: verdeckt keine Figur
    UI.btn(W - 132, sy - 21, 124, 42, () => this.finish());
  }
}

// ---------- Einbau ins Spiel ----------
{
  // Olli (das Blatt) ist keine Person – eigene Zeichnung, überall wo Figuren gezeichnet werden
  const dc0 = drawCritter;
  drawCritter = function (c, id, x, y, s, t, o = {}) { if (id === 'olli') return drawOlli(c, x, y, s, t, !!o.wave); return dc0(c, id, x, y, s, t, o); };   // eslint-disable-line no-func-assign
  const P = Play.prototype;
  // Kapitel-Anfang: beim ersten Betreten des Bereichs
  const upd0 = P.update;
  P.update = function (dt) {
    upd0.call(this, dt);
    if (this.mp || scene !== this || overlay || this.storyChecked || this.t < 0.4) return;
    this.storyChecked = true;
    const sc = STORY[this.stage]; if (!sc || storySeen('in_' + this.stage)) return;
    if (this.stage === 'geisterwald' && !(typeof HALLOWEEN !== 'undefined' && HALLOWEEN)) return;
    overlay = new Cutscene(Object.assign({ stage: this.stage }, sc), 'intro', () => storyMark('in_' + this.stage));
  };
  // Kapitel-Ende: nach dem Schaffen erst die Geschichte, dann die Belohnung; nach dem 5. Kapitel das große Fest
  const clear0 = P.stageClear;
  P.stageClear = function () {
    const r = clear0.call(this); if (this.mp) return r;
    const sc = STORY[this.stage], reward = overlay, st = this.stage, queue = [];
    if (sc && sc.outro && !storySeen('out_' + st)) queue.push(() => new Cutscene(Object.assign({ stage: st }, sc), 'outro', () => { storyMark('out_' + st); step(); }));
    if (STORY_MAIN.includes(st) && !storySeen('fest') && STORY_MAIN.every(id => ['easy', 'medium', 'hard'].some(d => SP(d, id).clears > 0))) queue.push(() => new Cutscene(STORY_FEST, 'fest', () => { storyMark('fest'); achieve('welt'); step(); }));
    const step = () => { const f = queue.shift(); overlay = f ? f() : reward; };
    if (queue.length) step();
    return r;
  };
}
// Szene nochmal ansehen (Bereichs-Karte)
function storyReplay(id) {
  const sc = STORY[id]; if (!sc) return;
  const steps = []; steps.push(() => new Cutscene(Object.assign({ stage: id }, sc), 'intro', go));
  if (storySeen('out_' + id) && sc.outro) steps.push(() => new Cutscene(Object.assign({ stage: id }, sc), 'outro', go));
  if (id === 'parkplatz' && storySeen('fest')) steps.push(() => new Cutscene(STORY_FEST, 'fest', go));
  function go() { const f = steps.shift(); overlay = f ? f() : null; }
  go();
}
