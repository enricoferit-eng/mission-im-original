// Screenshots Halloween-Special: Menü, Start-Fenster, Geisterwald (mehrere Stellen), Kürbis-Laden, normale Bereiche
const { open, sleep } = require('./common');
(async () => {
  const { b, p, errs } = await open({ dpr: 1 }); const out = process.argv[2];
  const S = async (n, f, ms = 900, arg) => { await p.evaluate(f, arg); await sleep(ms); await p.screenshot({ path: out + '/' + n + '.png' }); };
  await S('menu', () => setScene(new Menu()));
  await S('launcher', () => { META().km = 37; overlay = new HwLauncher(); });
  await S('wald_start', () => { overlay = null; setScene(new Play('medium', { stage: 'geisterwald' })); }, 1500);
  for (const [n, x, y] of [['hexe', 520, 520], ['friedhof', 1600, 1000], ['kuerbisfeld', 380, 1150], ['teich', 1300, 420], ['tor', 1000, 200]]) await S('wald_' + n, ([x, y]) => { scene.p.x = x; scene.p.y = y; scene.camX = x; scene.camY = y; }, 700, [x, y]);
  await S('quest', () => { scene.talk(NPC_DEFS[0].id); });
  await S('shop', () => { overlay = null; META().km = 30; setScene(new Shop()); scene.tab = 'hw'; });
  for (const st of ['aussen', 'kueche']) await S('normal_' + st, st => { overlay = null; setScene(new Play('medium', { stage: st })); }, 1500, st);
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
