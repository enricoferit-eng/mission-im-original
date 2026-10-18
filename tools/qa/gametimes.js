// Liest für jede Aufgabe die eingebaute Zeit (timeLimit) je Stufe aus – Grundlage für die Bonus-Joker-Zeit
const { open } = require('./common');
(async () => {
  const { b, p, errs } = await open();
  const out = await p.evaluate(() => {
    const ids = new Set(); const pools = {};
    for (const s of Object.keys(STAGE_DEFS)) { const P = STAGE_DEFS[s].pools || { easy: EASY_GAMES, puzzle: PUZZLES, std: CHALLENGES_STD, sp: CHALLENGES_SP, hard: CHALLENGES_HARD }; for (const k in P) for (const g of P[k]) { ids.add(g); (pools[g] = pools[g] || new Set()).add(k); } }
    const res = [];
    for (const id of ids) { const row = { id, kind: [...pools[id]].join('/'), ch: !!GAMES[id].challenge };
      for (const d of ['easy', 'medium', 'hard']) { try { const o = new GameOverlay(id, { diff: d, kind: row.ch ? 'challenge' : 'puzzle', seed: 7, onStop() {} }, () => {}); row[d] = o.g && o.g.timeLimit ? Math.round(o.g.timeLimit) : '-'; } catch (e) { row[d] = 'ERR'; } }
      res.push(row); }
    overlay = null; return res;
  });
  for (const r of out) console.log([r.id.padEnd(16), r.kind.padEnd(14), r.easy, r.medium, r.hard].join('\t'));
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
