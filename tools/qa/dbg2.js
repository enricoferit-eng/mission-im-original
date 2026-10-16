const { open } = require('./common');
(async () => { const { b, p } = await open({ admin: true });
  console.log(await p.evaluate(() => { setScene(new Play('hard', { stage: 'aussen' })); const sc = scene, s = SPOTS.find(q => q.id === 's_kugel2_left');
    sc.st.active = { npc: 'a_klaus', items: [SG.items[0]], got: [false], hidden: [{ x: s.x, y: s.y, l: 0, reach: s.reach, spot: s.id, px: s.px, py: s.py, rot: s.rot, sz: s.sz, front: true, zy: 640 }], decoys: [], dug: [], games: ['memory'], seed: 1 };
    sc.p.x = 1316; sc.p.y = 660; const w = { x: s.px, y: s.py };
    sc.camX = s.px; sc.camY = s.py; const scr = sc.w2s(s.px, s.py), w2 = sc.s2w(scr.x, scr.y); let best = null, bd = 44; for (const T of sc.interactables()) { const d = dist(w2.x, w2.y, T.sx, T.sy) * (T.k === 'spot' ? 1.15 : 1); if (d < bd) { bd = d; best = T; } } return JSON.stringify({ best, bd, w2 });
    return JSON.stringify(L); })); await b.close(); })();
