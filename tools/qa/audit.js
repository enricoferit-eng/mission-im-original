// Bilder-Runde für Anzeigefehler: jeder Bereich mit erledigten Leuten, laufendem Auftrag, Abgabe bereit; Kamera bei den Leuten
const { open, sleep } = require('./common');
const OUT = process.env.OUT || __dirname + '/shots';
(async () => {
  const { b, p, errs } = await open({ dpr: 1 });
  const areas = await p.evaluate(() => Object.keys(STAGE_DEFS));
  for (const a of areas) for (const d of (process.env.DIFFS || 'medium').split(',')) {
    await p.evaluate(([a, d]) => { overlay = null; setScene(new Play(d, { stage: a })); }, [a, d]); await sleep(900);
    // zwei erledigt, einer mit Auftrag (alles gefunden = Abgabe bereit)
    await p.evaluate(() => { const ids = scene.npcs.map(n => n.id); scene.st.done[ids[0]] = true; scene.st.done[ids[1]] = true; if (scene.diff !== 'easy') { const q = scene.genQuest(ids[2]); q.got = q.got.map((g, i) => i < q.got.length - 1); scene.st.active = q; } overlay = null; });
    for (let k = 0; k < 3; k++) {
      await p.evaluate(k => { const n = scene.npcs[k]; scene.p.x = n.x + 70; scene.p.y = n.y + 30; scene.p.level = n.l || 0; scene.p.path = null; overlay = null; }, k); await sleep(700);
      await p.screenshot({ path: OUT + '/' + a + '_' + d + '_' + k + '.png' });
    }
  }
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
