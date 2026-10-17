// Halloween-Geschicklichkeitsspiele mit einem "Kinder-Bot" testen (Reaktionszeit + Ungenauigkeit): schafft man es in der Zeit mit wenigen Fehlern?
const { open } = require('./common');
(async () => {
  const { b, p } = await open();
  const res = await p.evaluate(() => {
    const out = {};
    for (const g of ['hw_flug', 'hw_geister', 'hw_besen']) for (const diff of ['easy', 'medium', 'hard']) for (const react of [0.3, 0.5]) {
      let wins = 0, hitsT = 0, timeT = 0; const N = 120;
      for (let s = 0; s < N; s++) {
        let hits = 0, won = false; const rr = mulberry32(s * 13 + 7);
        const env = { r: mulberry32(s + 5), diff, hard: diff === 'hard', slow: 1, kind: 'cat', hit() { hits++; }, win() { won = true; }, addTime() {}, burst() {}, conf() {} };
        const G = GAMES[g].make(env), lim = G.timeLimit; let t = 0, plan = [];
        while (t < lim && !won) {
          const d = G.dbg();
          // Bot-Entscheidungen werden mit Verzögerung ausgeführt
          if (g === 'hw_flug') { const tr = d.trees.find(q => q.x > 90) || d.trees[0]; const aim = tr ? tr.gy + (rr() - 0.5) * 20 : 260, want = !d.started || d.by > aim; if (want !== d.hold && !plan.length) plan.push({ at: t + react * (0.6 + rr() * 0.8), f: () => (want ? G.down(120, 300) : G.up()) }); }   /* halten/loslassen mit Verzögerung */
          if (g === 'hw_geister') for (const h of d.holes) if (!h.kind) h.seen = false; else if (h.kind === 'ghost' && !h.seen) { h.seen = true; plan.push({ at: t + react * (0.7 + rr() * 0.8), f: () => G.down(h.x + (rr() - 0.5) * 30, h.y - 80) }); } else if (h.kind === 'bat' && !h.seen) { h.seen = true; if (rr() < 0.15) plan.push({ at: t + react, f: () => G.down(h.x, h.y - 80) }); }   /* ab und zu versehentlich */
          if (g === 'hw_besen' && (!plan.length)) { const star = d.its.filter(o => o.good && o.y < 430 && o.y > 150).sort((a, b) => b.y - a.y)[0], cloud = d.its.find(o => !o.good && o.y > 300 && o.y < 440 && Math.abs(o.x - d.px) < 50); const tx = cloud ? (cloud.x > 200 ? cloud.x - 120 : cloud.x + 120) : star ? star.x + (rr() - 0.5) * 30 : d.px; plan.push({ at: t + react * (0.5 + rr() * 0.6), f: () => G.move(tx) }); }
          plan = plan.filter(q => { if (q.at <= t) { q.f(); return false; } return true; });
          G.update(1 / 60); t += 1 / 60;
        }
        if (won && (diff !== 'hard' || hits < 4)) wins++; hitsT += hits; timeT += t;
      }
      out[g + ' ' + diff + ' Reaktion ' + react + 's'] = Math.round(wins / N * 100) + '% geschafft, Fehler ' + (hitsT / N).toFixed(1) + ', Zeit ' + (timeT / N).toFixed(0) + 's';
    }
    return out;
  });
  for (const [k, v] of Object.entries(res)) console.log(k.padEnd(34), v); await b.close();
})();
