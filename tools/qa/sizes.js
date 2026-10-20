// Menü, Pause, Laden, Install-Hinweis auf verschiedenen Geräten (Bilder zum Prüfen auf Überlappungen)
const { open, sleep } = require('./common');
const OUT = process.env.OUT || __dirname + '/shots';
const DEV = [['iphone', 844, 390], ['se', 667, 375], ['ipad', 1180, 820], ['hoch', 390, 844]];
(async () => {
  const { b, p, errs } = await open({ dpr: 1 });
  for (const [n, w, h] of DEV) {
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 }); await sleep(400);
    await p.evaluate(() => { window.HW_POPPED = true; overlay = null; META().coins = 1234; setScene(new Menu()); }); await sleep(700); await p.screenshot({ path: OUT + '/sz_' + n + '_menu.png' });
    await p.evaluate(() => { setScene(new Play('medium', { stage: 'kueche' })); overlay = new PauseDialog({ onQuit() {} }); }); await sleep(600); await p.screenshot({ path: OUT + '/sz_' + n + '_pause.png' });
    await p.evaluate(() => { overlay = null; setScene(new InstallGuide(() => {})); }); await sleep(500); await p.screenshot({ path: OUT + '/sz_' + n + '_install.png' });
    await p.evaluate(() => { setScene(new Trailer()); }); await sleep(500); await p.screenshot({ path: OUT + '/sz_' + n + '_trailer.png' });
  }
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
