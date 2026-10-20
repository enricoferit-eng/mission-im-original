// Übersicht aller Aufgaben so groß, wie sie auf dem iPhone quer erscheinen (Spielfeld ausgeschnitten, 8 pro Zeile)
const { open, sleep } = require('./common'); const fs = require('fs');
const OUT = process.env.OUT || __dirname + '/shots', DIFF = process.env.DIFF || 'medium';
(async () => {
  const { b, p, errs } = await open({ dpr: 1 });
  let ids = await p.evaluate(() => { const s = new Set(); for (const k in STAGE_DEFS) { const P = STAGE_DEFS[k].pools || { easy: EASY_GAMES, puzzle: PUZZLES, std: CHALLENGES_STD, sp: CHALLENGES_SP, hard: CHALLENGES_HARD }; for (const q in P) P[q].forEach(g => s.add(g)); } return [...s]; });
  if (process.env.IDS) ids = process.env.IDS.split(',');
  const shots = []; await p.evaluate(() => { setScene(new Play('medium', { stage: 'kueche' })); });
  for (const id of ids) {
    await p.evaluate(([id, d]) => { const g = new GameOverlay(id, { diff: d, kind: GAMES[id].challenge ? 'challenge' : 'puzzle', item: 'tomate', seed: 11, onStop() {} }, () => {}); overlay = g; g.ready = true; g.cd = 0; g.cdWait = 0; g.help = null; g.tip = null; }, [id, DIFF]);
    await sleep(900);
    const r = await p.evaluate(() => { const g = overlay; return { x: g.ox, y: g.oy, width: GAME_W * g.s, height: GAME_H * g.s }; });
    shots.push({ id, data: 'data:image/png;base64,' + (await p.screenshot({ clip: r, encoding: 'base64' })) });
  }
  const q = await b.newPage();   // Bögen in einer leeren Seite zusammensetzen (Bilder als data:-URL, kein Datei-Zugriff)
  const files = await q.evaluate(async shots => { const imgs = await Promise.all(shots.map(s => new Promise(res => { const im = new Image(); im.onload = () => res({ id: s.id, im }); im.src = s.data; }))); const out = [], per = 16, cols = 8;
    for (let k = 0; k < imgs.length; k += per) { const part = imgs.slice(k, k + per), w0 = part[0].im.width, h0 = part[0].im.height, cv = document.createElement('canvas'); cv.width = cols * (w0 + 6); cv.height = Math.ceil(part.length / cols) * (h0 + 22); const g = cv.getContext('2d'); g.fillStyle = '#222'; g.fillRect(0, 0, cv.width, cv.height);
      part.forEach((e, i) => { const x = (i % cols) * (w0 + 6), y = Math.floor(i / cols) * (h0 + 22); g.drawImage(e.im, x, y + 20); g.fillStyle = '#fff'; g.font = 'bold 14px sans-serif'; g.fillText(e.id, x + 4, y + 15); }); out.push(cv.toDataURL('image/png')); } return out; }, shots);
  files.forEach((d, i) => fs.writeFileSync(OUT + '/sheet_' + DIFF + '_' + i + '.png', Buffer.from(d.split(',')[1], 'base64')));
  console.log(ids.length + ' Aufgaben, ' + files.length + ' Bögen'); console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
