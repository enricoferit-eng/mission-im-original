'use strict';
// Halloween-Special: alles umgestellt – Fundsachen, Namen, Texte, Hintergründe der Aufgaben, Kostüme der Leute
if (HALLOWEEN) {
  // ---- Fundsachen: in jedem Bereich nur noch Halloween-Sachen ----
  for (const a of Object.keys(HW_AREA_ITEMS)) if (STAGE_DEFS[a]) STAGE_DEFS[a].items = HW_AREA_ITEMS[a];
  ITEM_IDS.splice(0, ITEM_IDS.length, ...HW_ITEM_IDS);
  MOT = function () { return (HW_AREA_ITEMS[AREA()] || HW_ITEM_IDS).slice(); };   // eslint-disable-line no-func-assign
  areaPick = function () { return MOT(); };   // eslint-disable-line no-func-assign
  heroId = function () { return HW_HERO[AREA()] || 'hw_kuerbis'; };   // eslint-disable-line no-func-assign

  // ---- Namen der Bereiche ----
  Object.assign(STAGE_NAME, HW_NAME);
  const SUB = { gastraum: 'Kerzen, Geister & Gruselbuffet', kueche: 'Hier brodelt der Zaubertrank', aussen: 'Kürbisse unter Palmen', chalet: 'Bonus-Level: die Spukhütte', spielplatz: 'Gespenster auf der Rutsche', parkplatz: 'Laternen im Nebel' };
  for (const k of Object.keys(STAGE_INFO)) STAGE_INFO[k] = { name: HW_NAME[k], sub: SUB[k] };

  // ---- Texte: Auftraggeber, Tore, Hinweise ----
  QUEST_ASK.splice(0, QUEST_ASK.length, 'Kannst du diese Sachen für mich finden? Sonst gibt es nachher keine Süßigkeiten!', 'Hilfst du mir, diese Sachen zu suchen? Ein Gespenst hat sie versteckt!', 'Findest du diese Sachen für mich? Das wäre schaurig-schön!');
  const LINES = ['Mein Halloween-Kostüm ist noch nicht fertig!', 'Gleich geht es los mit Süßes oder Saures, aber mir fehlt noch was!', 'Ein freches Gespenst hat meine Sachen versteckt!', 'Für die Gruselparty fehlen mir noch ein paar Sachen!', 'Die Hexe hat alles durcheinandergezaubert!', 'Huch! Eine Fledermaus hat meine Sachen weggetragen!'];
  let li = 0; for (const D of Object.values(STAGE_DEFS)) for (const n of D.npcs) NPC_LINES[n.id] = LINES[li++ % LINES.length];
  const GATE = {
    kueche: 'Die Tür zum Geistersaal ist verhext! Bring mir diese Sachen, dann löse ich den Zauber.',
    gastraum: 'Die Tür zum Kürbisgarten ist verhext! Bring mir diese Sachen, dann löse ich den Zauber.',
    aussen: 'Das Gartentor ist verhext! Bring mir diese Sachen, dann kommst du zum Gruselspielplatz.',
    spielplatz: 'Das Tor ist verhext! Bring mir diese Sachen, dann geht es zum Nebelparkplatz.',
    parkplatz: 'Die Schranke ist verhext! Bring mir diese Sachen, dann geht es zur Spukhütte.',
    chalet: 'Die Hüttentür ist verhext! Bring mir diese Sachen, dann ist die Halloween-Nacht gerettet.',
  };
  for (const [a, t] of Object.entries(GATE)) if (STAGE_DEFS[a]) {
    const w = STAGE_DEFS[a].words = Object.assign({}, STAGE_DEFS[a].words);
    w.gateAsk = t; w.lock = 'Dieser Durchgang ist verhext. Er geht erst auf, wenn du allen fünf geholfen hast.';
    w.progress = 'Dir fehlen noch ein paar Sachen, oben siehst du welche. Schau in alle Ecken – Gespenster verstecken gern Sachen!';
  }

  // ---- Hintergründe der Aufgaben: Nacht, Kürbisse, Spinnweben ----
  const NIGHT = { kueche: ['#2a1f3d', '#4b2e5c'], gastraum: ['#2b1a2f', '#5b2f4f'], aussen: ['#1f2a44', '#4a3b6b'], spielplatz: ['#1d2b3a', '#3d5a5b'], parkplatz: ['#1b1f2e', '#3a3f58'], chalet: ['#1d2340', '#3c4a78'] };
  const night = () => NIGHT[AREA()] || NIGHT.spielplatz;
  const web = (c, x, y, s, flip) => { c.save(); c.translate(x, y); c.scale(flip ? -s : s, s); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.2;
    for (let k = 0; k <= 4; k++) { const a = k * Math.PI / 8; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 70, Math.sin(a) * 70); c.stroke(); }
    for (let r = 18; r <= 66; r += 16) { c.beginPath(); for (let k = 0; k <= 4; k++) { const a = k * Math.PI / 8; const px = Math.cos(a) * r, py = Math.sin(a) * r; if (!k) c.moveTo(px, py); else c.quadraticCurveTo(Math.cos(a - Math.PI / 16) * r * 0.85, Math.sin(a - Math.PI / 16) * r * 0.85, px, py); } c.stroke(); }
    c.restore(); };
  const stars = (c, w, h, n = 22) => { c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < n; i++) c.fillRect((i * 97) % w, (i * 59) % h, 2, 2); };
  bgEasy = function (c, col) {   // eslint-disable-line no-func-assign
    const [a, b] = night(), g = c.createLinearGradient(0, 0, 0, GAME_H); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, GAME_W, GAME_H);
    stars(c, GAME_W, GAME_H); web(c, 0, 0, 1); web(c, GAME_W, 0, 1, true);
    c.fillStyle = 'rgba(247,127,0,.12)'; for (let i = 0; i < 7; i++) { ell(c, (i * 131) % 400, 120 + (i * 173) % 400, 30 + (i % 3) * 14, 30 + (i % 3) * 14); c.fill(); }
  };
  bgWood = function (c) {   // eslint-disable-line no-func-assign
    c.fillStyle = '#3b2a3f'; c.fillRect(0, 0, GAME_W, GAME_H); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3;
    for (let y = 0; y < GAME_H; y += 44) { c.beginPath(); c.moveTo(0, y); c.lineTo(GAME_W, y); c.stroke(); }
    web(c, 0, 0, 0.9); web(c, GAME_W, 0, 0.9, true); c.fillStyle = 'rgba(247,127,0,.1)'; for (let i = 0; i < 6; i++) { ell(c, (i * 151) % 400, (i * 97) % 520, 40, 40); c.fill(); }
  };
  bgSky = function (c, ground = 400) {   // eslint-disable-line no-func-assign
    const [a, b] = night(), g = c.createLinearGradient(0, 0, 0, ground); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, GAME_W, ground);
    stars(c, GAME_W, ground * 0.7); ell(c, 330, 70, 28, 28); c.fillStyle = '#fff3bf'; c.fill(); ell(c, 342, 62, 24, 24); c.fillStyle = a; c.fill();
    c.fillStyle = '#1a1225'; for (let x = 10; x < GAME_W; x += 90) { rrPath(c, x, ground - 34, 26, 36, 12); c.fill(); }
    for (let i = 0; i < 3; i++) hwBats(c, 3 + i * 7, 1);
  };
  chipsBand = function (c, y0, y1, off = 0) {   // eslint-disable-line no-func-assign
    const hgt = y1 - y0; c.fillStyle = '#3d3424'; c.fillRect(0, y0, GAME_W, hgt);
    const cols = ['#e85d04', '#9d0208', '#ffb703', '#6a4c93'];
    for (let i = 0; i < hgt * 0.35; i++) { const x = ((i * 53.7 + off) % 440 + 440) % 440 - 20, y = y0 + ((i * 37.3) % hgt); ell(c, x, y, 6, 3, i); c.fillStyle = cols[i % 4]; c.globalAlpha = 0.55; c.fill(); }
    c.globalAlpha = 1;
  };
  cypress = function (c, x, y, h) {   // eslint-disable-line no-func-assign
    // kahler Gruselbaum statt Zypresse
    c.strokeStyle = '#2b1d14'; c.lineCap = 'round'; c.lineWidth = 10; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 6, y - h * 0.5, x + 4, y - h * 0.9); c.stroke();
    c.lineWidth = 5; for (let k = 0; k < 4; k++) { const by = y - h * (0.4 + k * 0.14), s = k % 2 ? 1 : -1; c.beginPath(); c.moveTo(x, by); c.quadraticCurveTo(x + s * 22, by - 18, x + s * 34, by - 34); c.stroke(); }
    jackO(c, x + 14, y - 6, 0.9, 0.7);
  };
  makeImage = function (subj, size = 300) {   // eslint-disable-line no-func-assign
    const img = document.createElement('canvas'); img.width = img.height = size * 2;
    const ic = img.getContext('2d'); ic.scale(2 * size / 200, 2 * size / 200);
    const [a, b] = night(); ic.fillStyle = a; ic.fillRect(0, 0, 200, 200); ic.fillStyle = b; ic.fillRect(0, 140, 200, 60);
    ic.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 14; i++) ic.fillRect((i * 37) % 200, (i * 23) % 130, 2, 2);
    ell(ic, 170, 32, 14, 14); ic.fillStyle = '#fff3bf'; ic.fill(); jackO(ic, 30, 160, 0.9, 0.6); jackO(ic, 172, 166, 0.7, 0.6);
    drawAny(ic, subj, 100, 100, 150);
    return img;
  };

  // ---- Kostüme für alle Leute: Hexenhut, Katzenohren, Teufelshörner oder Kürbis-Eimer ----
  var hwCostume = function (c, id, x, y, s = 1) {
    let h = 0; for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const k = h % 4;
    c.save(); c.translate(x, y); c.scale(s, s);
    if (k === 0) { ell(c, 0, 0, 20, 5); fs(c, '#3c096c', 2); polyPath(c, [[-11, -1], [11, -1], [4, -20], [10, -28], [0, -21]]); fs(c, '#5a189a', 2); rrPath(c, -11, -5, 22, 4, 1); c.fillStyle = '#ff9f1c'; c.fill(); }
    else if (k === 1) { for (const sx of [-1, 1]) { polyPath(c, [[sx * 4, 0], [sx * 14, -14], [sx * 15, 2]]); fs(c, '#212529', 2); } }
    else if (k === 2) { for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 5, 0); c.quadraticCurveTo(sx * 14, -6, sx * 12, -16); c.quadraticCurveTo(sx * 8, -6, sx * 2, -1); c.closePath(); fs(c, '#d00000', 2); } }
    else { rrPath(c, -12, -4, 24, 6, 3); fs(c, '#212529', 2); polyPath(c, [[-6, -3], [0, -12], [6, -3]]); fs(c, '#212529', 2); }   // Vampir-Haartolle
    c.restore();
  };
  const dc0 = drawCritter;
  drawCritter = function (c, id, x, y, s, t, o = {}) {   // eslint-disable-line no-func-assign
    dc0(c, id, x, y, s, t, o);
    if (id === 'gate' || o.noCostume) return;
    const top = STAFF_PEOPLE[id] ? (STAFF_PEOPLE[id].kid ? 0.82 : 1) * 70 : KIDS[id] ? 54 : 50;   // Kopf oben
    hwCostume(c, id, x, y - (top - Math.sin((t || 0) * 2.5 + (o.ph || 0)) * 1.2) * s, s);
  };
}
