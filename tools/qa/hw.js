// Screenshots vom Halloween-Special
const { open, sleep } = require('./common');
(async () => {
  const { b, p, errs } = await open({ dpr: 1 }); const out = process.argv[2];
  const S = async (n, f, ms = 900, arg) => { await p.evaluate(f, arg); await sleep(ms); await p.screenshot({ path: out + '/' + n + '.png' }); };
  await S('menu', () => setScene(new Menu()));
  await S('info', () => { UI.next.length; overlay = new MsgDialog({ text: 'Halloween-Special! In jedem Bereich sind 8 Kürbisse versteckt. Sammle alle Kürbisse in allen 6 Bereichen, dann bekommst du das Gespenst-Kostüm. Im Laden gibt es außerdem Halloween-Kostüme.' }); });
  await S('shop', () => { overlay = null; META().coins = 300; setScene(new Shop()); scene.tab = 'joker'; });
  for (const st of ['aussen', 'kueche', 'spielplatz', 'chalet']) await S('play_' + st, (st) => { setScene(new Play('medium', { stage: st })); }, 1500, st).catch(() => {});
  await S('done', () => { const pl = scene; pl.st.leaves.forEach((l, i) => l.got = i > 0); const l = pl.st.leaves[0]; pl.p.x = l.x; pl.p.y = l.y; }, 3500);
  await S('wardrobe', () => { META().skins.push('hw_gespenst', 'hw_vampir', 'hw_hexe', 'hw_kuerbis'); setScene(new Menu()); overlay = new Wardrobe('medium'); });
  console.log('HW', await p.evaluate(() => JSON.stringify(hwMeta())), 'ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
