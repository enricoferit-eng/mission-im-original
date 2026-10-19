// Wirtschaft: was kostet alles, was bringt ein Durchlauf (alle 6 Bereiche) – wie viele Durchläufe bis alles gekauft ist
const { open } = require('./common');
(async () => {
  const { b, p } = await open();
  const r = await p.evaluate(() => {
    const skins = SHOP_SKINS.reduce((a, o) => a + o[3], 0), ups = UPGRADES.reduce((a, u) => a + u.price.reduce((x, y) => x + y, 0), 0);
    const side = SHOP_SKINS.reduce((a, o) => a + SIDE_PRICE[o[2]].reduce((x, y) => x + y, 0), 0), total = skins + ups + side;
    const achOnce = ACHIEVEMENTS.filter(A => !A.secret && !/duell|sieg|team|freund/.test(A.id)).reduce((a, A) => a + A.coins, 0);   // grob: alle Einzelspieler-Erfolge einmal
    const coinsPerArea = 6 * 0.4 * 0.45 * 2;   // ~6 Geschick-Aufgaben je Bereich, 40 % mit Münzen, ~2 eingesammelt (grob)
    const out = { skins, ups, side, total, achOnce, runs: {} };
    for (const d of ['easy', 'medium', 'hard']) {
      const area = again => STAGE_ORDER.reduce((a, st) => a + 6 * HELP_COINS[d] + clearBonus(d, st, again) + coinsPerArea, 0);
      const first = Math.round(area(false) + achOnce * 0.8), rep = Math.round(area(true));
      let have = 0, n = 0; while (have < total && n < 20) { have += n === 0 ? first : rep; n++; }
      const frac = n - 1 + (total - (have - (n === 1 ? first : rep))) / (n === 1 ? first : rep);
      out.runs[d] = { first, rep, runs: frac.toFixed(1) };
    }
    return out;
  });
  console.log('Kosten: Skins ' + r.skins + ' + Upgrades ' + r.ups + ' + Skin-Stufen ' + r.side + ' = ' + r.total + ' Taler (Erfolge einmalig ≈ ' + r.achOnce + ')');
  for (const d in r.runs) console.log(d.padEnd(7) + ' 1. Durchlauf ≈ ' + r.runs[d].first + ', jeder weitere ≈ ' + r.runs[d].rep + '  →  alles nach ≈ ' + r.runs[d].runs + ' Durchläufen');
  await b.close();
})();
