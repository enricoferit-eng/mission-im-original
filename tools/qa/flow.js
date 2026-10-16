// Spielt jeden Bereich in allen Stufen komplett durch (Aufgaben werden per win() gelöst)
const { open, sleep } = require('./common');
(async () => {
  const areas = (process.env.AREAS || 'kueche,gastraum,aussen,spielplatz,parkplatz,chalet').split(',');
  for (const a of areas) for (const d of ['easy', 'medium', 'hard']) {
    const { b, p, errs } = await open({ admin: true });
    const res = await p.evaluate(async (a, d) => {
      const w = ms => new Promise(r => setTimeout(r, ms));
      setScene(new Play(d, { stage: a })); const sc = scene, log = [];
      const solveOverlay = async () => { for (let k = 0; k < 40 && overlay; k++) { if (overlay.env && overlay.state === 'play') overlay.env.win(); if (overlay.o && overlay.o.onYes && overlay.o.mode === 'offer') { const o = overlay.o; overlay = null; o.onYes(); } else if (overlay instanceof GameOverlay && overlay.state === 'won') { overlay.endT = 9; overlay.finish(true); } else if (!(overlay instanceof GameOverlay)) { if (overlay.close) overlay.close(); else overlay = null; } await w(120); } };
      for (const id of ALL_IDS) {
        sc.talk(id); await w(150);
        if (overlay && overlay.o && overlay.o.mode === 'offer') { const o = overlay.o; overlay = null; o.onYes(); } else { await solveOverlay(); }
        await w(150);
        if (d === 'easy') { for (let k = 0; k < 14; k++) { await solveOverlay(); await w(300); if (sc.st.done[id]) break; if (!overlay) { sc.talk(id); await w(200); } } continue; }
        const q = sc.st.active;
        if (q && q.hidden) for (let i = 0; i < q.hidden.length; i++) {
          if (q.got[i]) continue; const h = q.hidden[i], pt = nearestFree(h.l, h.x, h.y);
          sc.p.x = (pt % GW) * CELL + 12.5; sc.p.y = Math.floor(pt / GW) * CELL + 12.5; sc.p.level = h.l; sc.p.path = null; sc.toast = null; sc.pending = null;
          sc.startSearch(); for (let k = 0; k < 30 && !overlay; k++) await w(60);
          if (!overlay) { log.push('NOTFOUND ' + id + ' ' + (h.spot || 'boden')); continue; }
          await solveOverlay();
        }
        if (sc.st.active) { sc.talk(id); await w(250); await solveOverlay(); }
      }
      for (let k = 0; k < 60; k++) { if (overlay && overlay.constructor.name === 'ClearOverlay') break; await w(200); if (overlay && !(overlay instanceof ClearOverlay)) await solveOverlay(); }
      return (overlay && overlay.constructor.name) + ' ' + log.join(' | ');
    }, a, d);
    console.log(a, d, res, errs.length ? 'ERR ' + [...new Set(errs)].slice(0, 3).join(' / ') : '');
    await b.close();
  }
})();
