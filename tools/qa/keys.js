const { open, sleep } = require('./common');
(async () => { const { b, p, errs } = await open({ admin: true });
  await p.evaluate(() => setScene(new Play('medium', { stage: 'aussen' }))); await sleep(500);
  const x0 = await p.evaluate(() => scene.p.x); await p.keyboard.down('ArrowRight'); await sleep(800); await p.keyboard.up('ArrowRight');
  const x1 = await p.evaluate(() => scene.p.x); await p.keyboard.press(' '); await sleep(200);
  console.log('moved', Math.round(x1 - x0), 'searching', await p.evaluate(() => !!scene.searching || scene.toast && scene.toast.kind));
  console.log('ERR', errs.join(' / ') || 'none'); await b.close(); })();
