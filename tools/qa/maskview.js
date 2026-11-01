// Laufraster über die gemalte Karte legen (rot = gesperrt), mit Welt-Koordinaten-Gitter – zum Prüfen der Hitboxen
const { open, sleep } = require('./common');
const OUT = process.env.OUT || __dirname + '/shots/mask';
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const { b, p, errs } = await open({ dpr: 1 });
  await sleep(1500);
  for (const a of (process.env.AREAS || 'kueche,gastraum,aussen,spielplatz,chalet,parkplatz').split(',')) {
    await p.evaluate(a => { overlay = null; setScene(new Play('medium', { stage: a })); }, a); await sleep(1800);
    const m = await p.evaluate(() => { let r = ''; for (let y = 0; y < GH; y++) { for (let x = 0; x < GW; x++) r += walk(0, y * GW + x) ? '1' : '0'; r += '|'; } return { w: WORLD_W, h: WORLD_H, cell: CELL, rows: r, img: LP.stages[SG.id].map.split('?')[0] }; });
    require('fs').writeFileSync(OUT + '/' + a + '.json', JSON.stringify(m));
  }
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
