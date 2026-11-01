// Jedes Versteck und jede Figur muss vom Start aus erreichbar sein (Laufraster der gemalten Karten)
const { open, sleep } = require('./common');
(async () => {
  const { b, p, errs } = await open({ dpr: 1 }); await sleep(1500);
  for (const a of ['kueche', 'gastraum', 'aussen', 'spielplatz', 'parkplatz', 'chalet']) {
    const bad = await p.evaluate(a => {
      overlay = null; STAGE_ORDER.forEach(k => SP('medium', k).clears = 1); setScene(new Play('medium', { stage: a }));
      const S = SG.start, out = [];
      for (const h of SG.spots) { const P = findPath(S.x, S.y, 0, h.x, h.y, h.l || 0, false); const end = P && P[P.length - 1];
        if (!P || dist(end.x, end.y, h.x, h.y) > Math.min(60, (h.reach || 96) - 20)) out.push(h.id); }   // wie inRange() im Spiel
      for (const n of scene.npcs) { const P0 = scene.npcPos ? scene.npcPos(n) : n; const P = findPath(S.x, S.y, 0, n.x, n.y, n.l || 0, true); if (!P) out.push('npc:' + n.id); }
      return out;
    }, a);
    console.log(a, bad.length ? 'NICHT ERREICHBAR: ' + bad.join(', ') : 'ok');
  }
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
