// Screenshots der neuen UI-Teile (Angebote, Erfolge, Garderobe, Mehrspieler, Eltern, Regler, Anleitung, Hochformat)
const { open, sleep } = require('./common'); const fs = require('fs');
(async () => {
  const { b, p, errs } = await open({ dpr: 1 });
  const S = async (n, f, ms = 500) => { await p.evaluate(f); await sleep(ms); await p.screenshot({ path: __dirname + '/shots/ui_' + n + '.png' }); };
  await S('angebote', () => { META().coins = 500; setScene(new Shop()); scene.tab = 'joker'; });
  await S('rad', () => { scene.tab = 'rad'; });
  await S('figur', () => { scene.tab = 'tiere'; });
  await S('erfolge', () => setScene(new Achievements()));
  await S('garderobe', () => { META().skins = SHOP_SKINS.slice(0, 20).map(x => x[0]); setScene(new Menu()); overlay = new Wardrobe('medium'); });
  await S('multi', () => { overlay = null; ACC().token = 'x'; setScene(new MultiScene()); scene.data = { friends: [{ name: 'Lina', avatar: 1, online: true, score: 40 }, { name: 'Ben', avatar: 2, score: 12 }], invites: [] }; });
  await S('multi_more', () => { scene.more = true; });
  await S('lobby', () => { setScene(new LobbyScene({ code: 'KLMP', opts: { mode: '2v2', size: 4, diff: 'medium', kids: 3 }, players: [{ name: 'QA', avatar: 0 }, { name: 'Lina', avatar: 1 }], host: { name: 'QA' } }, '2v2')); scene.me = 'host'; scene.poll = () => {}; }, 2500);
  await S('eltern', () => { setScene(new Menu()); overlay = new ParentPanel(); overlay.open = true; });
  await S('regler', () => { overlay = new VolumePanel(); });
  await S('konto', () => { overlay = new AccountPanel(); });
  await S('tutorial', () => { overlay = null; setScene(new Tutorial()); scene.list = true; });
  await S('weltkarte', () => { setScene(new Play('medium', { stage: 'aussen' })); overlay = new WorldMap(scene); }, 1200);
  await S('verloren', () => { overlay = new GameOverlay('jump', { diff: 'medium', kind: 'challenge', item: 'tomate', seed: 3, onStop() {} }, () => {}); overlay.ready = true; overlay.cd = 0; overlay.state = 'lost'; overlay.timeLeft = 5; }, 800);
  await S('geschenke', () => { overlay = new GameOverlay('geschenke', { diff: 'hard', kind: 'challenge', item: 'tomate', seed: 3, onStop() {} }, () => {}); overlay.ready = true; overlay.cd = 0; }, 1500);
  await S('hilfe', () => { overlay = null; scene.helpOpen = true; });
  await S('editor', () => { overlay = null; setScene(new CharEditor(() => setScene(new Menu()))); });
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await S('hoch_menu', () => { overlay = null; setScene(new Menu()); });
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
