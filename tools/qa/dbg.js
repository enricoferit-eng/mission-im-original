const { open } = require('./common');
(async () => { const { b, p } = await open({ admin: true });
  console.log(await p.evaluate(() => { setScene(new Play('hard', { stage: 'aussen' })); const s = SPOTS.find(q => q.id === 's_kugel2_left');
    const rows = []; for (let y = 560; y <= 760; y += 25) { let r = ''; for (let x = 1000; x <= 1400; x += 25) r += (Math.abs(x - s.x) < 13 && Math.abs(y - s.y) < 13) ? 'S' : canStand(0, x, y) ? '.' : '#'; rows.push(y + ' ' + r); }
    return JSON.stringify(s) + '\n' + rows.join('\n') + '\n' + DECOR.filter(d => Math.abs(d.x - 1150) < 300 && Math.abs(d.y - 640) < 250).map(d => d.id + ' ' + d.t + ' ' + d.x + ',' + d.y + ' bb ' + d.bb).join('\n'); }));
  await b.close(); })();
