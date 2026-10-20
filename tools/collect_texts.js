// Sammelt alle Sätze, die das Spiel vorliest (mit Sprecher), als JSON für make_voices.py
// Aufruf: node tools/collect_texts.js > tools/texts.json   (braucht puppeteer-core + Chrome)
const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage();
  const all = [];
  for (const q of ['?halloween=0', '?halloween=1']) {   // normale Fassung und Halloween-Special
  await p.goto('file://' + __dirname + '/../index.html' + q);
  const out = await p.evaluate(() => {
    const L = [], add = (text, who = 'erzaehler') => { if (text) L.push({ who, text, key: Voice.key(text, who), clean: Voice.clean(text) }); };
    STORY_SAY.forEach(t => add(t));
    TUT_CHAPTERS.forEach(ch => { add(ch.say); add(ch.try); });
    Object.values(HELP_TEXT).forEach(t => add(t)); Object.keys(HELP_TEXT).forEach(id => ['easy', 'medium', 'hard'].forEach(d => add(helpFor(id, d)))); Object.keys(HELP_TEXT).forEach(id => add(helpShort(id))); add('Probier es einfach aus!');
    ['Die Zeit ist abgelaufen!', 'Keine Herzen mehr!'].forEach(t => add(t + ' Versuch es gleich nochmal.'));
    add('Kommst du nicht weiter? Tippe auf den Joker. Dann ist die Aufgabe geschafft.');
    add('Bitte füge das Spiel zuerst zum Home-Bildschirm hinzu. Sonst stören die Leisten vom Browser, und das Spielerlebnis ist eingeschränkt.');
    add('Wähle deine Figur.');
    add('So laut sind die Stimmen.');   // Hörprobe im Ton-Regler
    add('Pause. Die Bonus-Uhr steht still.'); add('Das Geschenk für heute hast du schon. Morgen gibt es das nächste!'); add('Dein Geschenk für heute! Tippe drauf und pack es aus.'); DAILY.forEach(g => add('Du bekommst: ' + giftText(g) + '!')); Object.keys(SKIN_SIDE).forEach(id => { const sd = SKIN_SIDE[id]; add(SIDE[sd].name + '. ' + SIDE[sd].f(1)); }); add('Dieser Skin hat keine eigene Fähigkeit.');   // Pause-Fenster im Spiel
    Object.values(UEBUNG_SAY).forEach(t => add(t, 'olli')); Object.values(STORY).forEach(sc => ['intro', 'outro'].forEach(k => (sc[k] || []).forEach(([w, t]) => add(t, w)))); STORY_FEST.lines.forEach(([w, t]) => add(t, w));   // Helfer-Schule
    STAGE_ORDER.forEach(id => add('Zum Bereich ' + STAGE_NAME[id] + ' reisen?'));
    add('So bekommst du Taler: Hilf den Leuten in den Bereichen, schaffe Aufgaben mit vielen Sternen, hol dir Erfolge, spiele mit anderen zusammen – und jeden Tag gibt es ein Tagesgeschenk.');
    add('Schau hinter Steine und Büsche – dann tippe auf die Lupe!');
    add('Tippe, wenn die Schaukel ganz außen ist – so holst du Schwung!');
    ['Lauf zum Tor und tippe es an!', 'Bring die Sachen zurück – tippe den Mitarbeiter an!', 'Tippe einen Mitarbeiter mit ! an.'].forEach(t => add(t));
    // Bonus-Jagd-Ansagen: gleiche Rechnung wie Play.bonusStart
    const lims = new Set(); Object.values(BONUS_TIME).forEach(v => { lims.add(v); lims.add(v + 30); }); for (let v = 30; v <= 480; v += 5) lims.add(v);   // Auftrags-Zeiten sind immer 5-er Schritte (questTime) + Bonus-Uhr
    lims.forEach(lim => add(bonusSay(lim)));
    // Einführungstexte im Spielplatz (Hilfe-Fenster), je Stufe
    ['easy', 'medium', 'hard'].forEach(d => { const P = Object.create(Play.prototype); P.diff = d; P.helpOpen = true; P.helpRead = false; const said = []; const keep = Voice.say; Voice.say = t => said.push(t); const keepO = overlay; overlay = null; try { const fake = { save() {}, restore() {}, translate() {}, scale() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arcTo() {}, closePath() {}, fill() {}, stroke() {}, ellipse() {}, measureText: () => ({ width: 10 }), fillText() {}, strokeText() {}, setLineDash() {}, rotate() {}, clip() {}, rect() {}, arc() {}, quadraticCurveTo() {}, bezierCurveTo() {}, createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }), drawImage() {}, getTransform: () => new DOMMatrix() }; const src = (Play.prototype.drawHud._src || Play.prototype.drawHud).toString(); const m = src.match(/const T = this\.diff === 'easy' \? \[([\s\S]*?)\] : \[([\s\S]*?)\];/); const easy = eval('[' + m[1] + ']'); const T = d === 'easy' ? easy : eval('(function(){ return [' + m[2] + ']; })').call({ diff: d }); said.push(T.join(' ')); } finally { Voice.say = keep; overlay = keepO; } said.forEach(t => add(t)); });
    // Mitarbeiter: Aufträge in ihrer eigenen Stimme
    // Texte jedes Bereichs (Hinweise, Tor, Auftraggeber)
    Object.keys(STAGE_DEFS).forEach(sid => { useStage(sid); ['gateTap', 'lock', 'progress', 'gateAsk', 'search'].forEach(k => add(W_(k), k === 'lock' || k === 'gateAsk' ? 'gate' : 'erzaehler')); add('Bring die Sachen zurück – tippe ' + W_('the') + ' an!'); add('Tippe ' + W_('a') + ' mit ! an.');
      const ids = STAGE_DEFS[sid].npcs.map(n => n.id); ids.concat(['gate']).forEach(n => { QUEST_ASK.forEach((_, v) => add(questText({ mode: 'offer', npc: n, v }), n)); add(questText({ mode: 'progress', npc: n }), n); ids.filter(o => o !== n).forEach(o => n !== 'gate' && add(questText({ mode: 'busy', npc: n, other: o }), n)); });
      ['easy', 'medium', 'hard'].forEach(d => { const src = (Play.prototype.drawHud._src || Play.prototype.drawHud).toString(); const m = src.match(/const T = this\.diff === 'easy' \? \[([\s\S]*?)\] : \[([\s\S]*?)\];/); const T = (function () { return eval('[' + m[d === 'easy' ? 1 : 2] + ']'); }).call({ diff: d, stage: sid }); add(T.join(' ')); }); });
    useStage('spielplatz');
    const npcs = ['hase', 'fuchs', 'igel', 'waschbaer', 'eule', 'gate'];
    npcs.forEach(n => {
      QUEST_ASK.forEach((_, v) => add(questText({ mode: 'offer', npc: n, v }), n));
      add(questText({ mode: 'progress', npc: n }), n);
      npcs.filter(o => o !== n && o !== 'gate').forEach(o => add(questText({ mode: 'busy', npc: n, other: o }), n));
    });
    add(questText({ mode: 'lock', npc: 'gate' }), 'gate');
    Object.values(LEO_SAY).forEach(t => add(t, 'leo'));
    Object.values(SKINS).filter(sk => sk.ability).forEach(sk => add(ABILITIES[sk.ability].name + '. ' + abilityText(sk))); add('Dieser Skin hat keine besondere Fähigkeit.');
    if (typeof HW_SAY !== 'undefined' && HALLOWEEN) Object.values(HW_SAY).forEach(t => add(t));   // Halloween: Geisterwald-Fenster, Kürbis-Laden
    const seen = new Set(); return L.filter(x => !seen.has(x.key) && seen.add(x.key));
  });
  all.push(...out); }
  const seen = new Set(); process.stdout.write(JSON.stringify(all.filter(x => !seen.has(x.key) && seen.add(x.key)), null, 1));
  await b.close();
})();
