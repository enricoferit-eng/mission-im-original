'use strict';
// ---------- Helfer-Schule: das Spiel spielend lernen (statt einer Anleitung zum Durchklicken) ----------
// Ein kleiner eigener Bereich mit echter Steuerung. Olli, das kleine Blatt aus dem Original-Logo, führt Schritt für Schritt durch alles Wichtige:
// laufen → ansprechen → suchen → Aufgabe lösen → zurückbringen → durchs Tor. Kein Überspringen: jeder lernt es einmal.
Object.assign(NPC_NAMES, { olli: 'Olli' });
Object.assign(NPC_SHORT, { olli: 'Olli' });
Object.assign(NPC_LINES, { olli: 'Hallo! Ich bin Olli. Der Sturm hat den Kochlöffel weggeweht. Hilfst du mir suchen?' });
Object.assign(VOICE_OF, { olli: { pitch: 1.35, rate: 1.05, pick: 1 } });

const UW = 1100, UH = 900;   // Start liegt weiter oben, damit die Figur nicht hinter Ollis Textkasten steht
const UDECOR = [
  { id: 'tafel', t: 'tafel', x: 210, y: 300, r: 14, bb: [130, 170, 160, 140] },
  { id: 'kisten', t: 'kisten', x: 820, y: 470, x0: 760, y0: 430, w: 120, h: 50, bb: [740, 330, 160, 150] },
  { id: 'fass', t: 'fass', x: 300, y: 640, r: 30, bb: [260, 560, 80, 90] },
  { id: 'wagen', t: 'wagen', x: 880, y: 720, x0: 820, y0: 690, w: 120, h: 40, bb: [800, 610, 170, 130] },
  { id: 'pflanze1', t: 'pflanze', x: 140, y: 820, r: 20, bb: [100, 720, 80, 110] },
  { id: 'pflanze2', t: 'pflanze', x: 980, y: 300, r: 20, bb: [940, 200, 80, 110] },
  { id: 'bank', t: 'bank', x: 560, y: 380, x0: 500, y0: 366, w: 120, h: 22, bb: [490, 330, 140, 64] },
];
const UDRAW = {
  tafel(c, d) {
    line(c, d.x - 50, d.y, d.x - 40, d.y - 120, 5, '#8d5a3b'); line(c, d.x + 50, d.y, d.x + 40, d.y - 120, 5, '#8d5a3b');
    rrPath(c, d.x - 70, d.y - 126, 140, 84, 8); fs(c, '#2f3e46', 4, '#8d5a3b');
    txt(c, 'Helfer-', d.x, d.y - 100, 18, '#fff', 'center', null); txt(c, 'Schule', d.x, d.y - 76, 18, '#fff', 'center', null);
    line(c, d.x - 40, d.y - 58, d.x + 40, d.y - 58, 2, 'rgba(255,255,255,.5)', false);
  },
  kisten(c, d) {
    for (const [dx, dy, s] of [[0, 0, 1], [62, 0, 1], [30, -52, 1]]) {
      const x = d.x0 + dx, y = d.y0 + dy - 40; rrPath(c, x, y, 58, 50, 4); fs(c, '#c08b55', 3);
      line(c, x + 4, y + 4, x + 54, y + 46, 3, '#8d5a3b', false); line(c, x + 54, y + 4, x + 4, y + 46, 3, '#8d5a3b', false);
    }
  },
  fass(c, d) { c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, d.x, d.y + 2, 32, 9); c.fill(); rrPath(c, d.x - 28, d.y - 74, 56, 76, 14); fs(c, '#9c6644', 3); for (const y of [-60, -14]) line(c, d.x - 28, d.y + y, d.x + 28, d.y + y, 4, '#495057', false); },
  wagen(c, d) {
    rrPath(c, d.x0, d.y0 - 60, d.w, 60, 6); fs(c, '#adb5bd', 3); rrPath(c, d.x0 - 6, d.y0 - 66, d.w + 12, 10, 4); fs(c, '#dee2e6', 3);
    for (const dx of [16, d.w - 16]) { ell(c, d.x0 + dx, d.y0 + 4, 9, 9); fs(c, '#343a40', 2); }
    drawItem(c, 'tomate', d.x0 + 30, d.y0 - 80, 28); drawItem(c, 'kaese', d.x0 + 80, d.y0 - 82, 28);
  },
  pflanze(c, d) { rrPath(c, d.x - 22, d.y - 36, 44, 36, 6); fs(c, '#bc6c25', 3); for (const [dx, dy, r] of [[-14, -54, 18], [14, -58, 18], [0, -76, 20]]) { ell(c, d.x + dx, d.y + dy, r, r * 0.9); fs(c, '#52b788', 2.5); } },
  bank(c, d) { rrPath(c, d.x0, d.y0 - 30, d.w, 14, 4); fs(c, '#a0673a', 2.5); rrPath(c, d.x0, d.y0 - 10, d.w, 12, 4); fs(c, '#a0673a', 2.5); for (const dx of [10, d.w - 16]) { rrPath(c, d.x0 + dx, d.y0, 6, 18, 2); fs(c, '#495057', 1.5); } },
};
function drawGroundUebung(g, R) {
  g.fillStyle = '#9ccc65'; g.fillRect(0, 0, WORLD_W, WORLD_H);
  for (let i = 0; i < 5000; i++) { g.fillStyle = ['#8bc34a', '#aed581', '#7cb342'][i % 3]; g.fillRect(R() * WORLD_W, R() * WORLD_H, 2, 3); }
  rrPath(g, 70, 200, UW - 140, UH - 260, 40); g.fillStyle = '#e9dfcc'; g.fill();   // heller Hof aus Platten
  g.strokeStyle = 'rgba(160,140,110,.35)'; g.lineWidth = 2;
  for (let x = 110; x < UW - 70; x += 60) { g.beginPath(); g.moveTo(x, 210); g.lineTo(x, UH - 70); g.stroke(); }
  for (let y = 240; y < UH - 60; y += 60) { g.beginPath(); g.moveTo(80, y); g.lineTo(UW - 80, y); g.stroke(); }
  rrPath(g, UW / 2 - 70, 60, 140, 160, 20); g.fillStyle = '#e9dfcc'; g.fill();   // Weg zum Tor
  for (let x = 0; x < UW; x += 34) { if (Math.abs(x - UW / 2) > 90) { ell(g, x, 40, 28, 24); fs(g, x % 68 ? '#52b788' : '#40916c', 2); } }   // Hecke oben (Lücke fürs Tor)
  for (let y = 60; y < UH; y += 34) { ell(g, 24, y, 26, 28); fs(g, y % 68 ? '#52b788' : '#40916c', 2); ell(g, UW - 24, y, 26, 28); fs(g, y % 68 ? '#52b788' : '#40916c', 2); }
  for (let x = 0; x < UW; x += 34) { ell(g, x, UH - 20, 28, 24); fs(g, x % 68 ? '#52b788' : '#40916c', 2); }
}
function buildGridUebung() {
  cellsIn(90, 220, UW - 90, UH - 80, i => (G0[i] = 1));
  cellsIn(UW / 2 - 60, 70, UW / 2 + 60, 230, i => (G0[i] = 1));   // Weg zum Tor
  for (const d of UDECOR) { if (d.w) cellsIn(d.x0 - 4, d.y0 - 4, d.x0 + d.w + 4, d.y0 + d.h + 6, i => (G0[i] = 0)); else if (d.r) cellsCircle(d.x, d.y - 6, Math.max(6, d.r - 6), i => (G0[i] = 0)); }
}
const USPOTS = [furnSpot(UDECOR, 'kisten', 'right'), furnSpot(UDECOR, 'fass', 'right'), furnSpot(UDECOR, 'wagen', 'right')];
STAGE_DEFS.uebung = {
  id: 'uebung', w: UW, h: UH, bg: '#9ccc65', solo: true, finalExit: true, leaves: 3, start: { x: 560, y: 640 }, gate: { x: UW / 2, y: 190, ix: UW / 2, iy: 250, side: 'top' },
  npcs: [{ id: 'olli', pos: [[420, 480]] }],
  decor: UDECOR, spots: USPOTS, grid: buildGridUebung, ground: drawGroundUebung, decorDraw: UDRAW,
  feat: { swing: false, slide: false, house: false, racer: false, pigeons: false, waiter: false, dig: false },
  junk: ['leaf', 'twig', 'pebble'], items: ['kochloeffel'],
  gateName: 'Das Tor zum Abenteuer',
  words: { one: 'Person', the: 'Olli', a: 'Olli', many: 'Leute', dat: 'Leuten', back: 'zu Olli', each: 'Jede Person',
    hide: 'bei den Kisten, am Fass und am Küchenwagen', junk: 'ein Blatt oder ein Stöckchen', gate: 'am Tor', gateTap: 'Lauf zum Tor und tippe es an!',
    opened: 'Das Tor ist offen!', lock: 'Hilf zuerst Olli!', progress: 'Schau bei den Kisten nach!', gateAsk: 'Hilf zuerst Olli!', search: 'Schau bei den Kisten nach – dann tippe auf die Lupe!' },
  pools: { easy: ['pop'], puzzle: ['oddone'], std: ['oddone'], sp: ['oddone'], hard: ['oddone'] },
  onExit(play) { uebungDone(play.diff); },
};
if (typeof STAGE_NAME !== 'undefined') STAGE_NAME.uebung = 'Helfer-Schule';
if (typeof STAGE_COL !== 'undefined') STAGE_COL.uebung = '#95C11F';

// Schritte: was gerade zu tun ist (Text wird vorgelesen), woran man erkennt, dass es geschafft ist, und wohin der Pfeil zeigt
const UEB_RING = { x: 760, y: 560 };
const UEBUNG_SAY = {
  walk: 'Willkommen in der Helfer-Schule! Tippe auf den leuchtenden Kreis, dann läufst du dorthin.',
  talk: 'Super! Über Olli ist ein Ausrufezeichen. Tippe Olli an!',
  taskEasy: 'Olli gibt dir eine Aufgabe. Löse sie – dann hast du ihm geholfen!',
  search: 'Der Sturm hat den Kochlöffel weggeweht. Lauf zum gelben Pfeil und bleib kurz stehen – dann suchst du von selbst.',
  searchHard: 'Der Sturm hat den Kochlöffel weggeweht. Lauf zum gelben Pfeil und tippe dann unten rechts auf die Lupe.',
  clock: 'Siehst du die Uhr oben? Bist du schnell genug, bekommst du einen Extra-Joker.',
  back: 'Gefunden! Bring den Kochlöffel zurück zu Olli – tippe ihn an.',
  gate: 'Toll gemacht! Das Tor ist offen. Lauf hin und tippe es an – dann geht dein echtes Abenteuer los!',
  locked: 'Hilf zuerst Olli!',
};
function uebungStep(p) {
  const st = p.st, q = st.active, easy = p.diff === 'easy';
  if (st.done.olli) return 'gate';
  if (!p.ueb.walked) return 'walk';
  if (easy) return st.easy && st.easy.olli ? 'taskEasy' : 'talk';
  if (!q) return 'talk';
  return q.got.every(Boolean) ? 'back' : p.diff === 'hard' ? 'searchHard' : 'search';
}
function uebungDone(diff) {   // geschafft: weiter ins echte Abenteuer (bzw. zurück ins Menü, wenn man nur üben wollte)
  const a = ACC(); if (a) { a.tut.uebung = true; a.tut.coach = true; a.tut.symbol = true; }
  SP(diff, 'uebung').run = null; Save.write();
  const back = window.UEBUNG_BACK; window.UEBUNG_BACK = null;
  if (back === 'menu') setScene(new Menu()); else setScene(new Play(diff, { stage: startArea(diff) }));
}
function startUebung(diff, back) { const a = ACC(); if (a) a.tut.symbol = true;   /* die normalen Erst-Hinweise würden sich mit Ollis Schritten überlagern */
  window.UEBUNG_BACK = back || null; SP(diff, 'uebung').run = null; Save.write(); Sfx.play('win'); setScene(new Play(diff, { stage: 'uebung' })); }
{
  const P = Play.prototype;
  const gen0 = P.genQuest;
  P.genQuest = function (id, cnt) { return this.stage === 'uebung' && id !== 'gate' ? gen0.call(this, id, 1) : gen0.call(this, id, cnt); };   // ein einziger Kochlöffel
  const easy0 = P.startEasy;
  P.startEasy = function (id) {
    if (this.stage === 'uebung' && !this.st.easy[id]) { this.st.easy[id] = { steps: ['pop'], idx: 0, seed: this.seedFor('e_' + id), lim: this.questTime(id, [], ['pop'], 'easy') }; Save.write(); this.bonusStart(id); }
    return easy0.call(this, id);
  };
  const talk0 = P.talk;
  P.talk = function (id) {
    if (this.stage === 'uebung' && id === 'gate' && !this.st.done.olli) { this.banner = { text: UEBUNG_SAY.locked, t: 0 }; Voice.say(UEBUNG_SAY.locked, true, 'olli'); Sfx.play('bad'); return; }
    return talk0.call(this, id);
  };
  const bonusStart0 = P.bonusStart;
  P.bonusStart = function (npc) { if (this.stage === 'uebung') { if (this.diff === 'easy') return; (this.ueb || (this.ueb = { said: null, t: 0, walked: false, clockSaid: false })).clock = true; return; } return bonusStart0.call(this, npc); };   // keine laute Bonus-Ansage – die Uhr erklärt Olli selbst
  const coach0 = P.drawCoach;
  P.drawCoach = function (c) { if (this.stage !== 'uebung') return coach0.call(this, c); };   // in der Schule erklärt Olli – keine zweite Hand
  const upd0 = P.update;
  P.update = function (dt) {
    upd0.call(this, dt);
    if (this.stage !== 'uebung' || scene !== this) return;
    const U = this.ueb || (this.ueb = { said: null, t: 0, walked: false, clockSaid: false });
    U.t += dt;
    if (!U.walked && dist(this.p.x, this.p.y, UEB_RING.x, UEB_RING.y) < 60) { U.walked = true; Sfx.play('good'); const s = this.w2s(UEB_RING.x, UEB_RING.y); FX.sparkle(s.x, s.y, 20, '#c7f464'); }
    if (this.st.done.olli && !this.st.done.gate) { this.st.done.gate = true; Save.write(); }   // Tor geht auf, sobald Olli geholfen ist
    const step = uebungStep(this);
    if (step !== U.said && !overlay) { U.said = step; U.stepT = 0; Voice.say(UEBUNG_SAY[step], true, 'olli'); }
    U.stepT = (U.stepT || 0) + dt;
    if (U.clock && !U.clockSaid && ['search', 'searchHard'].includes(step) && !overlay && U.stepT > 6 && !Voice.busy()) { U.clockSaid = true; this.ueb.clockT = 0; Voice.say(UEBUNG_SAY.clock, true, 'olli'); }
    if (this.ueb.clockT !== undefined) this.ueb.clockT += dt;
  };
  // Hinweis-Karte oben, Ring zum Hinlaufen, Pfeil zum Versteck, Knopf zum Überspringen
  const hud0 = P.drawHud;
  P.drawHud = function (c) {
    hud0.call(this, c);
    if (this.stage !== 'uebung' || !this.ueb || this.exiting) return;
    const step = uebungStep(this), t = this.t;
    if (step === 'walk') { const s = this.w2s(UEB_RING.x, UEB_RING.y), pu = 1 + Math.sin(t * 5) * 0.12; ell(c, s.x, s.y, 46 * pu, 22 * pu); c.lineWidth = 6; c.strokeStyle = 'rgba(149,193,31,.9)'; c.stroke(); ell(c, s.x, s.y, 30 * pu, 14 * pu); c.fillStyle = 'rgba(199,244,100,.35)'; c.fill(); drawHand(c, s.x + 8, s.y + 8 + Math.abs(Math.sin(t * 4)) * 10, 1.4); }
    if ((step === 'search' || step === 'searchHard') && this.st.active) {   // Pfeil über dem Versteck
      const h = this.st.active.hidden[0], pk = peekOf(h), s = this.w2s(pk.x, pk.y - 70), b = Math.abs(Math.sin(t * 4)) * 10;
      polyPath(c, [[s.x - 16, s.y - 30 + b], [s.x + 16, s.y - 30 + b], [s.x, s.y - 6 + b]]); fs(c, '#ffd23f', 3, '#3d2c1f');
    }
    if (step === 'gate') {   // Pfeil zum Tor – liegt es außerhalb des Bildes, zeigt er vom Rand dorthin
      const s = this.w2s(GATE.x, GATE.y - 40), b = Math.abs(Math.sin(t * 4)) * 10;
      if (s.y > 70 && s.y < H - 60 && s.x > 30 && s.x < W - 30) { polyPath(c, [[s.x - 18, s.y - 60 + b], [s.x + 18, s.y - 60 + b], [s.x, s.y - 32 + b]]); fs(c, '#ffd23f', 3, '#3d2c1f'); }
      else { const ax = clamp(s.x, 60, W - 60), ay = clamp(s.y, 90, H - 120), ang = Math.atan2(s.y - ay, s.x - ax), pu = 1 + Math.sin(t * 6) * 0.12; c.save(); c.translate(ax, ay); c.rotate(ang); c.scale(pu, pu); polyPath(c, [[30, 0], [-14, -24], [-4, 0], [-14, 24]]); fs(c, '#ffd23f', 4, '#3d2c1f'); c.restore(); }
    }
    if (overlay) return;
    // Karte mit dem aktuellen Schritt
    const msg = UEBUNG_SAY[this.ueb.clockT !== undefined && this.ueb.clockT < 6 && step !== 'gate' && step !== 'back' ? 'clock' : step], w = Math.min(W - 250, 520);
    c.font = `900 14px ${FONT}`; const L = wrapLines(c, msg, w - 60, 14), h = 22 + L.length * 18, x = (W - w) / 2, y = H - h - 58;
    rrPath(c, x, y, w, h, 16); fs(c, 'rgba(255,247,230,.96)', 3, '#95C11F');
    drawCritter(c, 'olli', x + 26, y + h - 4, 0.42, t, { staff: true, noShadow: true });
    L.forEach((l, i) => txt(c, l, x + 52, y + 20 + i * 18, 14, '#3d2c1f', 'left', null));
    const order = this.diff === 'easy' ? ['walk', 'talk', 'taskEasy', 'gate'] : ['walk', 'talk', this.diff === 'hard' ? 'searchHard' : 'search', 'back', 'gate'], k = order.indexOf(step);
    order.forEach((_, i) => { ell(c, W / 2 + (i - (order.length - 1) / 2) * 16, y - 10, 5, 5); fs(c, i < k ? '#06d6a0' : i === k ? '#ffd166' : '#e9ecef', 1.5); });
  };
  P.drawHud._src = hud0._src || hud0;   // andere Werkzeuge lesen den Original-Code der Anzeige
}
