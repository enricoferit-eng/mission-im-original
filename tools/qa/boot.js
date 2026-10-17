// Start-Test: Seite mit gespeichertem Konto neu laden (fängt Fehler beim Start ab, z. B. Ladereihenfolge der Skripte)
const { open, sleep } = require('./common');
(async () => {
  const { b, p, errs } = await open();
  const cases = [['ohne Konto', () => localStorage.clear()], ['Konto ohne Figur', () => { ACC().char = null; Save.write(); }], ['Konto mit Figur', () => { ACC().char = 'cat'; Save.write(); }], ['Elternlimit', () => { const a = ACC(); a.char = 'cat'; a.limitMin = 20; a.playDay = new Date().toISOString().slice(0, 10); a.playSec = 9999; Save.write(); }]];
  let bad = 0;
  for (const [n, f] of cases) {
    if (n !== 'ohne Konto') await p.evaluate(() => { Save.load(); Save.data.seenTrailer = true; if (!ACC()) createAccount('QA', [0, 0, 0, 0]); Save.write(); });
    await p.evaluate(f); errs.length = 0; await p.reload(); await sleep(1500);
    const sc = await p.evaluate(() => scene && scene.constructor.name);
    const ok = sc && sc !== 'BootError' && !errs.some(e => /PAGEERROR/.test(e));
    if (!ok) bad++; console.log(n.padEnd(18), sc, ok ? 'ok' : 'FEHLER ' + errs.join(' / '));
  }
  console.log(bad ? bad + ' Fehler' : 'Start ok'); await b.close();
})();
