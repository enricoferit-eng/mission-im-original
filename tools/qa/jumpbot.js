// Sprung-Spiel mit einem "Kinder-Bot" testen: tippt mit zufälliger Ungenauigkeit vor Hindernissen – wie oft kommt man ohne/mit wenigen Fehlern durch?
const { open } = require('./common');
(async () => {
  const { b, p } = await open();
  const res = await p.evaluate(() => {
    const out = {};
    for (const diff of ['easy', 'medium', 'hard']) for (const skill of [0.15, 0.25, 0.35]) {
      let wins = 0, hitsT = 0; const N = 200;
      for (let s = 0; s < N; s++) {
        let hits = 0, won = false; const rr = mulberry32(s * 7 + 1);
        const env = { r: mulberry32(s + 11), diff, hard: diff === 'hard', slow: 1, kind: 'cat', hit() { hits++; }, win() { won = true; }, addTime() {}, burst() {}, conf() {} };
        const g = GAMES.jump.make(env); let tapped = null;
        for (let k = 0; k < 60 * 90 && !won; k++) {
          const d = g.dbg(), px = d.wx + d.PX;
          const next = d.obs.find(o => o.x + o.w > px);
          if (next && tapped !== next) { const ahead = next.x - px, want = d.v * (d.T || 0.775) / 2 - next.w / 2 + (rr() - 0.5) * 2 * skill * d.v;   /* ideal: Scheitel über der Mitte, dazu ± Sekunden daneben */ if (ahead < want) { g.down(); tapped = next; } }
          g.update(1 / 60);
        }
        if (won && hits <= 3) wins++; hitsT += hits;
      }
      out[diff + ' Zeitfehler ±' + skill] = Math.round(wins / N * 100) + '% geschafft, Fehler im Schnitt ' + (hitsT / N).toFixed(1);
    }
    return out;
  });
  console.log(res); await b.close();
})();
