// Screenshots der wichtigsten Ansichten nach tools/qa/shots
const { open, sleep } = require('./common'); const fs = require('fs');
(async () => {
  fs.mkdirSync(__dirname + '/shots', { recursive: true });
  const { b, p, errs } = await open({ dpr: 2 });
  const S = async (n, f, ms = 600) => { await p.evaluate(f); await sleep(ms); await p.screenshot({ path: __dirname + '/shots/' + n + '.png' }); };
  await S('menu', () => setScene(new Menu()));
  await S('map', () => setScene(new StageMap('medium')));
  await S('play', () => setScene(new Play('medium', { stage: 'kueche' })), 1200);
  await S('quest', () => scene.talk(STAGE_DEFS.kueche.npcs[0].id));
  await S('game_ready', () => { overlay = new GameOverlay('pizzaofen', { diff: 'medium', kind: 'puzzle', item: 'tomate', seed: 3, steps: { i: 0, n: 3 }, onStop() {} }, () => {}); });
  await S('game', () => overlay.down(422, 200), 2500);
  await S('shop', () => { overlay = null; setScene(new Shop()); scene.tab = 'skins'; });
  await S('wardrobe', () => { setScene(new Menu()); overlay = new Wardrobe('medium'); });
  await S('multi', () => { overlay = null; setScene(new MultiScene()); });
  await S('achievements', () => setScene(new Achievements()));
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
