// läuft durch jeden Durchgang (beide Richtungen) und prüft, ob man richtig im Nachbarbereich ankommt
const { open } = require('./common');
(async () => {
  const { b, p, errs } = await open({ admin: true });
  const links = await p.evaluate(() => LINKS.map(L => [L.a, L.b]));
  for (const [a, bb] of links) for (const [from, to] of [[a, bb], [bb, a]]) {
    const r = await p.evaluate(async (from, to) => {
      setScene(new Play('medium', { stage: from })); overlay = null;
      const E = exitsOf(from).find(e => e.to === to), [r0, r1] = E.r, m = (r0 + r1) / 2, horiz = E.side === 'top' || E.side === 'bottom';
      const path = findPath(scene.p.x, scene.p.y, 0, horiz ? m : (E.side === 'left' ? 14 : WORLD_W - 14), horiz ? (E.side === 'top' ? 14 : WORLD_H - 14) : m, 0, true);
      if (!path) return 'NO PATH';
      scene.p.path = path;
      for (let k = 0; k < 600; k++) { await new Promise(r => setTimeout(r, 30)); if (scene.stage === to) return 'ok'; if (!scene.p.path || !scene.p.path.length) { scene.p.x += E.side === 'right' ? 6 : E.side === 'left' ? -6 : 0; scene.p.y += E.side === 'bottom' ? 6 : E.side === 'top' ? -6 : 0; } }
      return 'NOT CROSSED';
    }, from, to);
    console.log(from, '→', to, r);
  }
  console.log('ERR', errs.join(' / ') || 'none'); await b.close();
})();
