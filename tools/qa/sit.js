// Hinsetzen: jeden Sitzplatz antippen (hinlaufen + setzen), Bild machen, dann wieder aufstehen
const { open, sleep } = require('./common');
const OUT = process.env.OUT || __dirname + '/shots/sit';
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const { b, p, errs } = await open({ dpr: 2 });
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await sleep(800);
  for (const a of ['spielplatz', 'gastraum', 'aussen', 'chalet']) {
    await p.evaluate(a => { overlay = null; setScene(new Play('medium', { stage: a })); }, a); await sleep(1500);
    const n = await p.evaluate(a => SEATS[a].length, a);
    for (let i = 0; i < n; i++) {
      const r = await p.evaluate(i => {
        overlay = null; if (scene.sitting) scene.standUp();
        const [x, y] = SEATS[SG.id][i]; const T = scene.interactables().find(t => t.k === 'seat' && t.x === x && t.y === y);
        const s = scene.w2s(T.sx, T.sy); scene.tap(s.x, s.y); return !!scene.p.path || !!scene.sitting;
      }, i);
      let ok = false; for (let k = 0; k < 40 && !ok; k++) { await sleep(250); ok = await p.evaluate(() => { overlay = null; return !!scene.sitting; }); }
      if (!ok || !r) errs.push(a + ' Platz ' + i + ' nicht erreicht');
      if (i % 3 === 0 || !ok) await p.screenshot({ path: OUT + '/' + a + '_' + i + '.png' });
    }
  }
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
