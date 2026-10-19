// Helfer-Schule mit echten Klicks durchspielen (je Stufe) + Überspringen
const { open, sleep } = require('./common');
const OUT = process.env.OUT || __dirname + '/shots';
(async () => {
  const { b, p, errs } = await open({ dpr: 1 }); const bad = [];
  const ev = (f, a) => p.evaluate(f, a);
  for (const diff of ['easy', 'medium', 'hard']) {
    await ev(d => { localStorage.clear(); Save.load(); Save.data.seenTrailer = true; createAccount('QA', [0, 0, 0, 0]); ACC().char = 'cat'; for (const g of Object.keys(GAMES)) ACC().tut['h_' + g] = true; setScene(new Menu()); }, diff); await sleep(700);
    const cx = { easy: 180, medium: 422, hard: 665 }[diff]; await p.mouse.click(cx, 225); await sleep(1200);
    const sc = await ev(() => scene.constructor.name + ':' + scene.stage); if (sc !== 'Play:uebung') { bad.push(diff + ': startet nicht in der Helfer-Schule (' + sc + ')'); continue; }
    const step = () => ev(() => uebungStep(scene)), clickW = async (x, y) => { const s = await ev(([x, y]) => scene.w2s(x, y), [x, y]); await p.mouse.click(s.x, s.y); };
    const log = [await step()];
    await p.screenshot({ path: OUT + '/ueb_' + diff + '_1.png' });
    for (let k = 0; k < 8 && await step() === 'walk'; k++) { await clickW(700, 640); await sleep(1500); }
    log.push(await step());
    const talkBruno = async () => { for (let k = 0; k < 8 && !(await ev(() => !!overlay)); k++) { const s = await ev(() => { const n = scene.npcs[0]; return scene.w2s(n.x, n.y - 50); }); await p.mouse.click(s.x, s.y); await sleep(1500); } };
    await talkBruno();
    const solve = async () => { for (let k = 0; k < 40; k++) { const s = await ev(() => { if (!overlay) return 'none'; const n = overlay.constructor.name; if (n === 'QuestDialog' && overlay.o.mode === 'offer') { const o = overlay.o; overlay = null; o.onYes(); return 'yes'; } if (n === 'GameOverlay') { if (!overlay.ready) { overlay.ready = true; overlay.cd = 0; } if (overlay.state === 'play' && overlay.env) overlay.env.win(); if (overlay.state === 'won') { overlay.endT = 9; overlay.finish(true); } return 'game'; } if (overlay.close) { overlay.close(); return 'close'; } overlay = null; return 'drop'; }); if (s === 'none') return; await sleep(250); } };
    await solve(); log.push(await step());
    if (diff !== 'easy') {
      await p.screenshot({ path: OUT + '/ueb_' + diff + '_2.png' });
      const h = await ev(() => { const h = scene.st.active.hidden[0]; return { x: h.x, y: h.y }; });
      for (let k = 0; k < 8 && !(await ev(() => !!overlay || scene.st.active.got[0])); k++) { await clickW(h.x, h.y); await sleep(1700); if (diff === 'hard') { await p.mouse.click(844 - 58, 390 - 112); await sleep(1300); } }
      await solve(); log.push(await step());
      await talkBruno(); await solve();
    } else { await sleep(500); }
    log.push(await step());
    await p.screenshot({ path: OUT + '/ueb_' + diff + '_3.png' });
    for (let k = 0; k < 10 && (await ev(() => scene.stage)) === 'uebung'; k++) { if (await ev(() => !!scene.exiting)) { await sleep(1500); continue; } const s = await ev(() => { const g = scene.w2s(GATE.x, GATE.y - 50); return g.y > 60 ? g : scene.w2s(GATE.ix, Math.min(scene.p.y - 140, GATE.iy + 200)); }); await p.mouse.click(s.x, s.y);   /* Tor außerhalb des Bildes: erst hinlaufen */ await sleep(1800); await solve(); }
    const end = await ev(() => scene.constructor.name + ':' + scene.stage + ' tut=' + ACC().tut.uebung);
    console.log(diff + ': ' + log.join(' → ') + ' → ' + end); if (!/Play:kueche tut=true/.test(end)) bad.push(diff + ': nicht ins Abenteuer');
  }
  // kein Überspringen-Knopf mehr; Anleitung-Knopf öffnet die Schule
  await ev(() => { localStorage.clear(); Save.load(); Save.data.seenTrailer = true; createAccount('QA', [0, 0, 0, 0]); ACC().char = 'cat'; setScene(new Play('medium', { stage: 'uebung' })); }); await sleep(1000);
  const hasSkip = await ev(() => UI.next && UI.next.length !== undefined ? false : false); 
  await ev(() => setScene(new Menu())); await sleep(600); await p.mouse.click(844 - 152, 40); await sleep(900);
  const an = await ev(() => scene.constructor.name + ':' + scene.stage + ':' + scene.diff); console.log('Anleitung-Knopf: ' + an); if (!/uebung:medium/.test(an)) bad.push('Anleitung-Knopf');
  console.log(bad.length ? 'PROBLEME: ' + bad.join(' / ') : 'ALLES OK'); console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
