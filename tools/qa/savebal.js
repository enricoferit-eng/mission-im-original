// Prüft, ob Bildschirme ctx.save() ohne restore() hinterlassen (häuft sich pro Bild an → Ruckeln/Hänger)
const { open, sleep } = require('./common');
(async () => {
  const { b, p, errs } = await open({ dpr: 1 });
  for (const [w, h] of [[390, 844], [844, 390]]) {
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 }); await sleep(200);
    const r = await p.evaluate(async () => {
      let depth = 0; const s0 = ctx.save.bind(ctx), r0 = ctx.restore.bind(ctx); ctx.save = () => { depth++; s0(); }; ctx.restore = () => { depth--; r0(); };
      const T = { menu0: () => setScene(new Menu(0)), menu1: () => setScene(new Menu(1)), menu2: () => setScene(new Menu(2)), menu3: () => setScene(new Menu(3)),
        shopSkins: () => { setScene(new Menu(0)); scene.pageObj(0).tab = 'skins'; }, shopTiere: () => { setScene(new Menu(0)); scene.pageObj(0).tab = 'tiere'; },
        map: () => setScene(new StageMap('medium')), play: () => setScene(new Play('medium', { stage: 'kueche' })),
        pause: () => { setScene(new Play('medium', { stage: 'kueche' })); overlay = new PauseDialog({ onQuit() {}, onHelp() {} }); },
        vol: () => { setScene(new Menu()); overlay = new VolumePanel(); }, gift: () => { setScene(new Menu()); overlay = new DailyGift(); },
        acc: () => { setScene(new Menu()); overlay = new AccountPanel(); }, parent: () => { setScene(new Menu()); overlay = new ParentPanel(); },
        diffpick: () => { setScene(new Menu()); overlay = new DiffPick(() => {}); }, multi: () => setScene(new MultiScene()),
        game: () => { setScene(new Play('medium', { stage: 'kueche' })); overlay = new GameOverlay('pizzaofen', { diff: 'medium', kind: 'puzzle', item: 'tomate', seed: 3, steps: { i: 0, n: 3 }, joker: { left: () => 0, use() {} }, onStop() {} }, () => {}); },
        uebung: () => setScene(new Play('easy', { stage: 'uebung' })) };
      const out = {};
      for (const k in T) { overlay = null; try { T[k](); } catch (e) { out[k] = 'ERR ' + e.message; continue; } await new Promise(r => setTimeout(r, 400)); depth = 0; await new Promise(r => setTimeout(r, 500)); if (depth !== 0) out[k] = depth; }
      ctx.save = s0; ctx.restore = r0; return out;
    });
    console.log(w + 'x' + h, JSON.stringify(r));
  }
  console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
