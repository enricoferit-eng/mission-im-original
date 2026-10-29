// Hochformat-Bilderrunde (iPhone 390×844): Menü-Seiten, Bereiche mit Auftrag, Minispiel, Pause, Helfer-Schule
const { open, sleep } = require('./common');
const OUT = process.env.OUT || __dirname + '/shots/hoch';
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const { b, p, errs } = await open({ dpr: 2 });
  await p.setViewport({ width: +(process.env.VW || 390), height: +(process.env.VH || 844), deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await sleep(500);
  const S = async (n, f, ms = 700, arg) => { try { await p.evaluate(f, arg); } catch (e) { errs.push(n + ': ' + e.message); } await sleep(ms); await p.screenshot({ path: OUT + '/' + n + '.png' }); };
  for (let i = 0; i < 5; i++) await S('menu' + i, i => { overlay = null; setScene(new Menu()); Menu.page = i; if (scene.page !== undefined) scene.page = i; }, 600, i);
  await S('map', () => { overlay = null; setScene(new StageMap('medium')); });
  for (const a of (process.env.AREAS || 'spielplatz,kueche,gastraum,aussen,chalet,parkplatz,geisterwald').split(',')) for (const d of ['easy', 'medium', 'hard']) {
    await S(a + '_' + d, ([a, d]) => { overlay = null; setScene(new Play(d, { stage: a })); }, 1400, [a, d]);
    await S(a + '_' + d + '_q', () => { overlay = null; const ids = scene.npcs.map(n => n.id); scene.st.done[ids[0]] = true; if (scene.diff !== 'easy') { const q = scene.genQuest(ids[1]); scene.st.active = q; } }, 800);
  }
  await S('pause', () => { setScene(new Play('medium', { stage: 'kueche' })); overlay = null; setTimeout(() => scene.pause(), 900); }, 1600);
  await S('game', () => { overlay = new GameOverlay('pizzaofen', { diff: 'medium', kind: 'puzzle', item: 'tomate', seed: 3, steps: { i: 0, n: 3 }, onStop() {} }, () => {}); }, 900);
  await S('uebung', () => { overlay = null; setScene(new Play('easy', { stage: 'uebung' })); }, 1500);
  await S('diffpick', () => { overlay = null; setScene(new Menu()); overlay = new DiffPick(() => {}); }, 1200);
  await S('volume_from_pause', () => { setScene(new Play('medium', { stage: 'spielplatz' })); overlay = null; setTimeout(() => { scene.pause(); overlay = new VolumePanel(overlay); }, 900); }, 1600);
  await S('toast', () => { overlay = null; toast('Spürnase', 'Rot = ganz nah, blau = weit weg', 'search'); }, 500);
  await S('uebung_skip', () => { overlay = null; setScene(new Play('easy', { stage: 'uebung' })); setTimeout(() => { scene.ueb && (scene.ueb.story = 99); }, 800); }, 1800);
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
