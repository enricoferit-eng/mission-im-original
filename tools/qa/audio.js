// Ton-Test: läuft alles über die Kanäle (Gesamt, Musik, Stimmen, Geräusche) und wirken die Regler?
const { open, sleep } = require('./common');
(async () => {
  const { b, p, errs } = await open();
  const r = await p.evaluate(async () => {
    const out = [];
    Sfx.ac = null; Sfx.master = null; Sfx.play('tap');   // erstes Geräusch muss den Kanal-Aufbau anstoßen
    out.push('Kanäle nach erstem Geräusch: ' + (!!Sfx.master && !!Sfx.musicBus && !!Sfx.voiceBus && !!Sfx.sfxBus ? 'ok' : 'FEHLT'));
    const a = ACC(); delete a.vol; a.volAll = 0.5; a.music = false; const V = VOL();
    out.push('Alte Einstellung übernommen: ' + (V.all === 0.5 && V.music === 0 ? 'ok' : 'FEHLER ' + JSON.stringify(V)));
    a.vol = { all: 1, music: 0.5, voice: 0, sfx: 0.25 }; applyVolume(true);
    out.push('Pegel: ' + [Sfx.master, Sfx.musicBus, Sfx.voiceBus, Sfx.sfxBus].map(g => g.gain.value.toFixed(3)).join(' / '));
    out.push('Stimmen aus → Voice.on(): ' + Voice.on() + ', Musik aus: ' + musicOff());
    a.vol.music = 0; out.push('Musik 0 → musicOff(): ' + musicOff());
    const d = Net.dataOf ? Net.dataOf(a) : (typeof Sync !== 'undefined' ? Sync.dataOf(a) : null);
    out.push('wird gespeichert: ' + (d && d.vol ? 'ok' : 'unklar'));
    overlay = new VolumePanel(); overlay.draw(ctx); const R = overlay.rows.find(q => q.key === 'sfx'); overlay.down(R.sx0 + R.sw * 0.6, (R.y0 + R.y1) / 2); overlay.up();
    out.push('Ziehen Geräusche auf 60 %: ' + a.vol.sfx);
    return out;
  });
  console.log(r.join('\n')); console.log('ERR', [...new Set(errs)].join(' / ') || 'none');
  await p.evaluate(() => { overlay = new VolumePanel(); }); await sleep(500); await p.screenshot({ path: process.argv[2] || '/tmp/vol.png' });
  await b.close();
})();
