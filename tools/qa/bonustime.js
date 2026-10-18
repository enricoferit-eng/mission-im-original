// Zeigt, welche Bonus-Joker-Zeiten die Aufträge bekommen (je Bereich und Stufe): kleinste / mittlere / größte, alt zum Vergleich
const { open, sleep } = require('./common');
(async () => {
  const { b, p, errs } = await open();
  const areas = await p.evaluate(() => Object.keys(STAGE_DEFS));
  for (const a of areas) for (const d of ['easy', 'medium', 'hard']) {
    await p.evaluate(([a, d]) => { overlay = null; setScene(new Play(d, { stage: a })); }, [a, d]); await sleep(300);
    const r = await p.evaluate(() => {
      const L = [], G = [], t0 = performance.now(); let n = 0;
      for (let c = 0; c < 12; c++) { scene.st.clears = c; scene.st.usedGames = [];
        if (scene.diff === 'easy') { scene.st.easyPlan = null; for (const n2 of scene.npcs) { scene.st.easy = {}; scene.startEasy(n2.id); overlay = null; L.push(scene.st.easy[n2.id].lim); } scene.st.easy = {}; }
        else for (const id of scene.npcs.map(x => x.id).concat(['gate'])) { const q = scene.genQuest(id); n++; (id === 'gate' ? G : L).push(q.lim); } }
      const ms = (performance.now() - t0) / Math.max(1, n);
      const st = A => { if (!A.length) return '-'; A.sort((x, y) => x - y); return A[0] + ' / ' + A[A.length >> 1] + ' / ' + A[A.length - 1]; };
      return { k: st(L), g: st(G), old: BONUS_TIME[scene.diff], ms: ms.toFixed(1) };
    });
    console.log(a.padEnd(12), d.padEnd(7), 'Kinder', r.k.padEnd(16), 'Tor', r.g.padEnd(16), 'alt', r.old + '/' + (r.old + 30), ' ' + r.ms + ' ms je Auftrag');
  }
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
