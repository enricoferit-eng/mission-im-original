// Schaukel: antippen, Schwung holen, abspringen – ohne Fehler, ohne Weitenanzeige
const { open, sleep } = require('./common');
(async () => {
  const { b, p, errs } = await open({ dpr: 1 });
  await sleep(800);
  await p.evaluate(() => { overlay = null; setScene(new Play('medium', { stage: 'spielplatz' })); }); await sleep(1500);
  const has = await p.evaluate(() => { overlay = null; const T = scene.interactables().find(t => t.k === 'swing'); if (!T) return false; scene.p.x = T.x; scene.p.y = T.y; scene.interact(T); return !!scene.swinging; });
  if (!has) errs.push('Schaukel nicht antippbar');
  for (let i = 0; i < 12; i++) { await p.evaluate(() => { overlay = null; scene.pump(); }); await sleep(400); }
  await p.evaluate(() => scene.jumpOff()); await sleep(2000);
  if (await p.evaluate(() => !!scene.swinging)) errs.push('hängt auf der Schaukel');
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
