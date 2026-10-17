// Echtes Spielen per Klick: vom Start aus zu jeder Person tippen (erst Richtung, dann auf die Person) – wie ein Kind
const { open, sleep } = require('./common');
(async () => {
  const { b, p, errs } = await open({ dpr: 1 }); const areas = (process.env.AREAS || 'geisterwald').split(','), res = [];
  for (const a of areas) {
    await p.evaluate(a => { overlay = null; setScene(new Play('medium', { stage: a })); }, a); await sleep(800);
    const ids = await p.evaluate(() => scene.npcs.map(n => n.id).concat(['gate']));
    for (const id of ids) {
      await p.evaluate(() => { overlay = null; }); let ok = false, last = '';
      for (let k = 0; k < 45 && !ok; k++) {
        const s = await p.evaluate(id => { const T = scene.interactables().find(q => q.id === id); const P = scene.w2s(T.sx, T.sy);   /* dort, wo die Figur zu sehen ist */ return { x: P.x, y: P.y, ov: overlay && overlay.constructor.name, me: [Math.round(scene.p.x), Math.round(scene.p.y)] }; }, id);
        if (s.ov && s.ov !== 'null') { ok = true; last = s.ov; break; }
        const on = s.x > 60 && s.x < W0 - 60 && s.y > 90 && s.y < H0 - 50;
        if (on) await p.mouse.click(s.x, s.y); else { const cx = W0 / 2, cy = H0 / 2, dx = s.x - cx, dy = s.y - cy, f = Math.min((W0 / 2 - 80) / Math.abs(dx || 1), (H0 / 2 - 70) / Math.abs(dy || 1)); await p.mouse.click(cx + dx * f, cy + dy * f); }
        await sleep(on ? 900 : 1200); last = JSON.stringify(s);
      }
      const jy = await p.evaluate(() => JSON.stringify(scene.joy)); res.push(a + ' ' + id + ': ' + (ok ? 'ok (' + last + ')' : 'NICHT erreicht ' + last + ' joy=' + jy));
    }
  }
  console.log(res.join('\n')); console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
const W0 = 844, H0 = 390;
