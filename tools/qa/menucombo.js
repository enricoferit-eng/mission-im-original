// Menü-Kombinationen durchklicken (echte Finger-Ereignisse): Seiten wischen, Reiter, Fenster, Stufen – sammelt Fehler und Hänger
const { open, sleep } = require('./common');
(async () => {
  const { b, p, errs } = await open({ dpr: 2 });
  const out = [];
  for (const [w, h] of [[390, 844], [844, 390]]) {
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); await sleep(300);
    await p.evaluate(() => { overlay = null; setScene(new Menu()); }); await sleep(500);
    const tap = async (x, y) => { await p.mouse.move(x, y); await p.mouse.down(); await sleep(40); await p.mouse.up(); await sleep(350); };
    const swipe = async (dx) => { const y = h * 0.45; await p.mouse.move(w / 2, y); await p.mouse.down(); for (let k = 1; k <= 8; k++) { await p.mouse.move(w / 2 + dx * k / 8, y); await sleep(16); } await p.mouse.up(); await sleep(500); };
    const state = () => p.evaluate(() => ({ scene: scene && scene.constructor.name, page: scene && scene.page, ov: overlay && overlay.constructor.name, frameAge: performance.now() - (window.__lastFrame || 0) }));
    await p.evaluate(() => { const f0 = frame; window.__lastFrame = performance.now(); const orig = window.requestAnimationFrame; window.requestAnimationFrame = cb => orig(t => { window.__lastFrame = performance.now(); cb(t); }); });
    // alle Knöpfe einer Seite antippen, danach Fenster schließen
    for (let round = 0; round < 3; round++) {
      for (let pg = 0; pg < 4; pg++) {
        await p.evaluate(pg => { overlay = null; if (!(scene instanceof Menu)) setScene(new Menu()); scene.goPage(pg); }, pg); await sleep(500);
        const btns = await p.evaluate(() => UI.btns.map(q => [q.x + q.w / 2, q.y + q.h / 2]));
        for (const [x, y] of btns.slice(0, 14)) {
          await tap(x, y);
          const st = await state(); if (st.frameAge > 1000) out.push('HÄNGT nach Tipp ' + [w, h, pg, Math.round(x), Math.round(y)].join(',') + ' ' + JSON.stringify(st));
          await p.evaluate(() => { if (overlay && !(overlay instanceof GameOverlay)) overlay = null; if (!(scene instanceof Menu)) { if (scene && scene.leave) try { scene.leave(new Menu()); } catch (e) {} setScene(new Menu()); } });
          await sleep(120);
        }
        await swipe(-w * 0.6); await swipe(w * 0.6);
      }
    }
  }
  console.log(out.join('\n') || 'keine Hänger'); console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
