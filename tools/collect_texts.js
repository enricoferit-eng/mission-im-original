// Sammelt alle Sätze, die das Spiel vorliest (mit Sprecher), als JSON für make_voices.py
// Aufruf: node tools/collect_texts.js > tools/texts.json   (braucht puppeteer-core + Chrome)
const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage();
  await p.goto('file://' + __dirname + '/../index.html');
  const out = await p.evaluate(() => {
    const L = [], add = (text, who = 'erzaehler') => { if (text) L.push({ who, text, key: Voice.key(text, who), clean: Voice.clean(text) }); };
    STORY_SAY.forEach(t => add(t));
    TUT_CHAPTERS.forEach(ch => { add(ch.say); add(ch.try); });
    Object.values(HELP_TEXT).forEach(t => add(t)); add('Probier es einfach aus!');
    ['Die Zeit ist abgelaufen!', 'Keine Herzen mehr!'].forEach(t => add(t + ' Versuch es gleich nochmal.'));
    add('Kommst du nicht weiter? Tippe auf den Joker. Dann ist die Aufgabe geschafft.');
    add('Bitte füge das Spiel zuerst zum Home-Bildschirm hinzu. Sonst stören die Leisten vom Browser, und das Spielerlebnis ist eingeschränkt.');
    add('Wähle deine Figur.');
    add('Schau hinter Steine und Büsche – dann tippe auf die Lupe!');
    add('Tippe, wenn die Schaukel ganz außen ist – so holst du Schwung!');
    ['Lauf zum Tor und tippe es an!', 'Bring die Sachen zurück – tippe den Mitarbeiter an!', 'Tippe einen Mitarbeiter mit ! an.'].forEach(t => add(t));
    // Bonus-Jagd-Ansagen: gleiche Rechnung wie Play.bonusStart
    const lims = new Set(); Object.values(BONUS_TIME).forEach(v => { lims.add(v); lims.add(v + 30); });
    lims.forEach(lim => add(bonusSay(lim)));
    // Einführungstexte im Spielplatz (Hilfe-Fenster), je Stufe
    ['easy', 'medium', 'hard'].forEach(d => { const P = Object.create(Play.prototype); P.diff = d; P.helpOpen = true; P.helpRead = false; const said = []; const keep = Voice.say; Voice.say = t => said.push(t); const keepO = overlay; overlay = null; try { const fake = { save() {}, restore() {}, translate() {}, scale() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arcTo() {}, closePath() {}, fill() {}, stroke() {}, ellipse() {}, measureText: () => ({ width: 10 }), fillText() {}, strokeText() {}, setLineDash() {}, rotate() {}, clip() {}, rect() {}, arc() {}, quadraticCurveTo() {}, bezierCurveTo() {}, createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }), drawImage() {}, getTransform: () => new DOMMatrix() }; const src = Play.prototype.drawHud.toString(); const m = src.match(/const T = this\.diff === 'easy' \? \[([\s\S]*?)\] : \[([\s\S]*?)\];/); const easy = eval('[' + m[1] + ']'); const T = d === 'easy' ? easy : eval('(function(){ return [' + m[2] + ']; })').call({ diff: d }); said.push(T.join(' ')); } finally { Voice.say = keep; overlay = keepO; } said.forEach(t => add(t)); });
    // Mitarbeiter: Aufträge in ihrer eigenen Stimme
    // Texte jedes Bereichs (Hinweise, Tor, Auftraggeber)
    Object.keys(STAGE_DEFS).forEach(sid => { useStage(sid); ['gateTap', 'lock', 'progress', 'gateAsk', 'search'].forEach(k => add(W_(k), k === 'lock' || k === 'gateAsk' ? 'gate' : 'erzaehler')); add('Bring die Sachen zurück – tippe ' + W_('the') + ' an!'); add('Tippe ' + W_('a') + ' mit ! an.');
      const ids = STAGE_DEFS[sid].npcs.map(n => n.id); ids.concat(['gate']).forEach(n => { add(questText({ mode: 'offer', npc: n }), n); add(questText({ mode: 'progress', npc: n }), n); ids.filter(o => o !== n).forEach(o => n !== 'gate' && add(questText({ mode: 'busy', npc: n, other: o }), n)); });
      ['easy', 'medium', 'hard'].forEach(d => { const src = Play.prototype.drawHud.toString(); const m = src.match(/const T = this\.diff === 'easy' \? \[([\s\S]*?)\] : \[([\s\S]*?)\];/); const T = d === 'easy' ? eval('[' + m[1] + ']') : (function () { return eval('[' + m[2] + ']'); }).call({ diff: d }); add(T.join(' ')); }); });
    useStage('spielplatz');
    const npcs = ['hase', 'fuchs', 'igel', 'waschbaer', 'eule', 'gate'];
    npcs.forEach(n => {
      add(questText({ mode: 'offer', npc: n }), n);
      add(questText({ mode: 'progress', npc: n }), n);
      npcs.filter(o => o !== n && o !== 'gate').forEach(o => add(questText({ mode: 'busy', npc: n, other: o }), n));
    });
    add(questText({ mode: 'lock', npc: 'gate' }), 'gate');
    Object.values(LEO_SAY).forEach(t => add(t, 'leo'));
    Object.values(ABILITIES).forEach(A => add(A.name + '. ' + A.text)); add('Dieser Skin hat keine besondere Fähigkeit.');
    const seen = new Set(); return L.filter(x => !seen.has(x.key) && seen.add(x.key));
  });
  process.stdout.write(JSON.stringify(out, null, 1));
  await b.close();
})();
