// Screenshots aller Bereiche an mehreren Stellen nach tools/qa/shots/area_*.png (+ Menü, Laden usw.)
const { open, sleep } = require('./common'); const fs = require('fs');
(async () => {
  fs.mkdirSync(__dirname + '/shots', { recursive: true });
  const only = process.argv[2];
  const { b, p, errs } = await open({ dpr: 1 });
  for (const id of ['kueche', 'gastraum', 'aussen', 'spielplatz', 'parkplatz', 'chalet']) {
    if (only && only !== id) continue;
    await p.evaluate(id => setScene(new Play('medium', { stage: id })), id); await sleep(900);
    const pts = await p.evaluate(() => { const o = []; for (const fy of [0.25, 0.7]) for (const fx of [0.2, 0.5, 0.8]) o.push([Math.round(WORLD_W * fx), Math.round(WORLD_H * fy)]); return o; });
    for (let k = 0; k < pts.length; k++) {
      await p.evaluate(([x, y]) => { const s = scene; const i = nearestFree(0, x, y); s.p.x = i >= 0 ? (i % GW) * CELL + 12.5 : x; s.p.y = i >= 0 ? Math.floor(i / GW) * CELL + 12.5 : y; s.p.path = null; s.camX = s.p.x; s.camY = s.p.y; }, pts[k]);
      await sleep(350); await p.screenshot({ path: __dirname + '/shots/area_' + id + '_' + k + '.png' });
    }
  }
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
