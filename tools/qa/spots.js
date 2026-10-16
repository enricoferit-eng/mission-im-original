// jedes Versteck: hinlaufen (wie ein Spieler, per Antippen des Dings) und suchen
const { open } = require('./common');
(async () => {
  const { b, p, errs } = await open({ admin: true });
  for (const st of (process.env.AREAS || 'kueche,gastraum,aussen,parkplatz,chalet').split(',')) {
    const bad = await p.evaluate(async st => {
      setScene(new Play('hard', { stage: st })); const out = [];
      for (const s of SPOTS) {
        overlay = null; const sc = scene, d = DECOR_BY[s.decor];
        sc.st.active = { npc: STAGE_DEFS[st].npcs[0].id, items: [SG.items[0]], got: [false], hidden: [{ x: s.x, y: s.y, l: 0, reach: s.reach, spot: s.id, behind: true, px: s.px, py: s.py, rot: s.rot, sz: s.sz, front: s.front, zy: d ? d.y : s.py }], decoys: [], dug: [], games: ['memory'], seed: 1 };
        const i0 = nearestFree(0, clamp(s.x + 200, 30, WORLD_W - 30), s.y) >= 0 ? nearestFree(0, clamp(s.x + 200, 30, WORLD_W - 30), s.y) : nearestFree(0, s.x - 200, s.y); sc.p.x = (i0 % GW) * CELL + 12.5; sc.p.y = Math.floor(i0 / GW) * CELL + 12.5; sc.p.path = null; sc.toast = null; sc.pending = null; sc.searching = null;
        sc.camX = s.px; sc.camY = s.py; const scr = sc.w2s(s.px, s.py); sc.tap(scr.x, scr.y);
        for (let k = 0; k < 400 && (sc.p.path && sc.p.path.length || sc.p.target); k++) await new Promise(r => setTimeout(r, 20));
        if (!overlay && !sc.searching) sc.startSearch();
        for (let k = 0; k < 40 && !overlay; k++) await new Promise(r => setTimeout(r, 30));
        if (!overlay) out.push(s.id + '@' + Math.round(sc.p.x) + ',' + Math.round(sc.p.y));
      }
      return out;
    }, st);
    console.log(st, bad.length ? 'NICHT ERREICHT: ' + bad.join(' ') : 'alle erreichbar');
  }
  console.log('ERR', errs.join(' / ') || 'none'); await b.close();
})();
