// startet jede Aufgabe in jedem Bereich und jeder Stufe, lässt sie laufen, tippt herum, zeichnet – meldet Fehler
const { open } = require('./common');
(async () => {
  const { b, p, errs } = await open({ admin: true });
  const out = await p.evaluate(async () => {
    const bad = [], seen = new Set();
    for (const a of ['kueche', 'gastraum', 'aussen', 'spielplatz', 'parkplatz', 'chalet']) {
      setScene(new Play('medium', { stage: a }));
      const P = SG.pools || { easy: EASY_GAMES, puzzle: PUZZLES, std: CHALLENGES_STD, sp: CHALLENGES_SP, hard: CHALLENGES_HARD };
      const ids = [...new Set([].concat(P.easy, P.puzzle, P.std, P.sp, P.hard))].filter(Boolean);
      for (const id of ids) for (const d of ['easy', 'medium', 'hard']) {
        try {
          overlay = new GameOverlay(id, { diff: d, kind: 'puzzle', item: (SG.items || ITEM_IDS)[0], seed: 3 + d.length, onStop() {} }, () => {});
          overlay.ready = true; overlay.cd = 0; overlay.cdWait = 0;
          for (let k = 0; k < 30; k++) { overlay.update(0.05); if (k % 5 === 0) { const x = 100 + (k * 37) % 600, y = 80 + (k * 53) % 260; overlay.down(x, y, 1); overlay.move(x + 10, y + 5, 1); overlay.up(x + 10, y + 5, 1); } }
          overlay.draw(ctx);
        } catch (e) { const key = id + ':' + (e.message || e); if (!seen.has(key)) { seen.add(key); bad.push(a + '/' + id + '/' + d + ': ' + (e.stack || e).split('\n').slice(0, 2).join(' <- ')); } }
        overlay = null;
      }
    }
    return bad;
  });
  console.log(out.length ? out.join('\n') : 'alle Aufgaben ok'); console.log('ERR', [...new Set(errs)].slice(0, 10).join('\n') || 'none'); await b.close();
})();
