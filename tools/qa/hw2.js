// Screenshots Halloween-Special: alle Bereiche + alle neuen Aufgaben
const { open, sleep } = require('./common');
(async () => {
  const { b, p, errs } = await open({ dpr: 1 }); const out = process.argv[2];
  const S = async (n, f, ms = 900, arg) => { await p.evaluate(f, arg); await sleep(ms); await p.screenshot({ path: out + '/' + n + '.png' }); };
  for (const st of ['kueche', 'gastraum', 'aussen', 'spielplatz', 'parkplatz', 'chalet']) await S('area_' + st, st => { overlay = null; setScene(new Play('medium', { stage: st })); }, 1500, st);
  await S('quest', () => scene.talk(NPC_DEFS[0].id));
  for (const g of ['hw_schnitzen', 'hw_trank', 'hw_geister', 'hw_suesses', 'hw_flug', 'hw_netz', 'hw_besen', 'hw_klingeln', 'hw_zaehlen', 'memory', 'shadow', 'pairs'])
    await S('g_' + g, g => { overlay = new GameOverlay(g, { diff: 'medium', kind: GAMES[g].challenge ? 'challenge' : 'puzzle', item: 'hw_kuerbis', seed: 5, onStop() {} }, () => {}); overlay.ready = true; overlay.cd = 0; if (g === 'hw_flug') setTimeout(() => overlay.down(422, 200), 300); if (g === 'hw_klingeln') setTimeout(() => { overlay.down(330, 170); }, 400); }, 1600, g);
  await S('map', () => { overlay = null; setScene(new StageMap('medium')); });
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
