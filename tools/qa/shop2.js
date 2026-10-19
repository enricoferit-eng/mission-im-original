// Laden: Upgrades kaufen, Tages-Upgrade, Glücksrad, neue Skins; Übertragung alter Skin-Fähigkeiten
const { open, sleep } = require('./common');
const OUT = process.env.OUT || __dirname + '/shots';
(async () => {
  const { b, p, errs } = await open({ dpr: 1 }); const bad = [], ev = (f, a) => p.evaluate(f, a);
  // Übertragung: Konto mit altem Rennfahrer-Skin (bonuszeit) und Zauberer (jokerplus → Taler)
  const mig = await ev(() => { const a = ACC(); a.meta = { coins: 0, skins: ['shop_rennfahrer', 'shop_zauberer'] }; const m = META(); return { up: m.up, coins: m.coins, ab: ability('bonuszeit') }; });
  console.log('Übertragung:', JSON.stringify(mig)); if (mig.up.bonuszeit !== 1 || !(mig.coins > 0)) bad.push('Übertragung');
  await ev(() => { META().coins = 2000; META().up = {}; setScene(new Shop()); }); await sleep(600); await p.screenshot({ path: OUT + '/s_up.png' });
  const n = await ev(() => scene.tab); console.log('Start-Reiter:', n); if (n !== 'up') bad.push('Upgrades nicht zuerst');
  // ersten Upgrade-Kasten anklicken (Turbo ist Nr. 2)
  for (let k = 0; k < 2; k++) { await p.mouse.click(260, 250); await sleep(400); if (await ev(() => !!overlay)) await ev(() => { overlay.o.onYes(); overlay = null; }); }
  const st = await ev(() => [JSON.stringify(META().up), META().coins, ability('turbo'), ABIL_VAL.turbo[ability('turbo')]]); console.log('nach 2× Kauf:', st.join(' | '));
  await ev(() => { scene.tab = 'joker'; }); await sleep(500); await p.screenshot({ path: OUT + '/s_joker.png' });
  await ev(() => { scene.tab = 'rad'; }); await sleep(500); await p.screenshot({ path: OUT + '/s_rad.png' });
  const res = await ev(async () => { const out = {}; for (let i = 0; i < 60; i++) { scene.radPool = null; scene.draw(ctx); const pool = scene.radPool, ws = pool.map(o => o.w), tot = ws.reduce((x, y) => x + y, 0); let r = Math.random() * tot, k = 0; while (r > ws[k]) { r -= ws[k]; k++; } const o = pool[k]; out[o.kind] = (out[o.kind] || 0) + 1; } return out; });
  console.log('Rad (60 Würfe):', JSON.stringify(res));
  await ev(() => { scene.tab = 'skins'; }); await sleep(500); await p.screenshot({ path: OUT + '/s_skins.png' });
  console.log('Skins im Laden:', await ev(() => SHOP_SKINS.length + ' (' + ['common', 'rare', 'legend'].map(r => SHOP_SKINS.filter(o => o[2] === r).length).join('/') + ')'));
  console.log(bad.length ? 'PROBLEME: ' + bad.join(', ') : 'ALLES OK'); console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
