// Bilder an bestimmten Stellen: LOOK="bereich:x:y:name,…" – Spielfigur dort hinstellen, Bild machen
const { open, sleep } = require('./common');
const OUT = process.env.OUT || __dirname + '/shots/look';
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const { b, p, errs } = await open({ dpr: 2 });
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await sleep(1200);
  let cur = '';
  for (const spec of process.env.LOOK.split(',')) {
    const [a, x, y, n, q] = spec.split(':');
    if (a !== cur || q) { await p.evaluate(([a, q]) => { overlay = null; setScene(new Play('medium', { stage: a })); if (q) setTimeout(() => { const ids = scene.npcs.map(n => n.id); scene.st.active = scene.genQuest(ids[1]); }, 300); }, [a, q]); await sleep(1800); cur = a; }
    await p.evaluate(([x, y]) => { overlay = null; scene.p.x = +x; scene.p.y = +y; scene.p.path = null; scene.p.level = 0; }, [x, y]); await sleep(900);
    await p.evaluate(() => { overlay = null; }); await sleep(150);
    await p.screenshot({ path: OUT + '/' + n + '.png' });
  }
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
