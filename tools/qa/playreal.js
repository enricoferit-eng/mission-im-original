// Spielt einen Bereich (Standard: Geisterwald) wie ein Kind: nur echte Klicks zum Laufen und Ansprechen,
// Suchen durch Stehenbleiben (Mittel), Bonbons einsammeln, Kürbistor; Minispiele werden per win() gelöst.
// Prüft: Leute ansprechbar, Sachen auffindbar, Münzen kommen an, Ziel erreichbar, Kürbis-Laden kauft.
const { open, sleep } = require('./common');
const W0 = 844, H0 = 390, AREA = process.env.AREA || 'geisterwald', DIFF = process.env.DIFF || 'medium';
(async () => {
  const { b, p, errs } = await open({ dpr: 1 }); const log = [], bad = [];
  const ev = (f, a) => p.evaluate(f, a);
  await ev(([a, d]) => { META().km = 0; overlay = null; setScene(new Play(d, { stage: a })); }, [AREA, DIFF]); await sleep(900);
  await ev(() => { const o = scene.checkBonus.bind(scene); window.BT = []; scene.checkBonus = (q, npc) => { if (q) BT.push({ npc, tt: Math.round(q.tt || 0), lim: scene.bonusLimit(npc, q), g: Math.round((q.games || q.steps).reduce((a, g) => a + gameSec(g, scene.diff), 0)) }); return o(q, npc); }; });
  // Hilfen
  const solve = async () => {   // offene Fenster abarbeiten wie ein Kind (Ja, Los, Spiel gewinnen, Weiter)
    for (let k = 0; k < 60; k++) {
      const s = await ev(() => { if (!overlay) return 'none'; const n = overlay.constructor.name;
        if (n === 'QuestDialog' && overlay.o.mode === 'offer') { const o = overlay.o; overlay = null; o.onYes(); return 'yes'; }
        if (n === 'GameOverlay') { if (!overlay.ready) { overlay.ready = true; overlay.cd = 0; } if (overlay.state === 'play' && overlay.env) overlay.env.win(); if (overlay.state === 'won') { overlay.endT = 9; overlay.finish(true); } return 'game'; }
        if (n === 'ClearOverlay') return 'clear';
        if (overlay.close) { overlay.close(); return 'close'; } overlay = null; return 'drop'; });
      if (s === 'none' || s === 'clear') return s; await sleep(200);
    }
    return 'stuck';
  };
  const walkTo = async (getT, done, max = 60, arg) => {   // getT() → Bildschirmziel {x,y}; klickt drauf oder Richtung
    for (let k = 0; k < max; k++) {
      if (await ev(done, arg)) return true;
      const s = await ev(getT, arg); if (!s) return false;
      const hud = (s.x < 260 && s.y < 70) || (s.x > W0 - 110 && s.y < 200) || (Math.abs(s.x - W0 / 2) < 90 && s.y > H0 - 50) || (s.x > W0 - 200 && s.y > H0 - 160);   // nur echte Anzeigen/Knöpfe meiden
      const on = s.x > 14 && s.x < W0 - 14 && s.y > 40 && s.y < H0 - 10 && !hud;
      if (on) await p.mouse.click(s.x, s.y); else await ev(s => { if (scene.tap && !overlay) scene.tap(s.x, s.y); }, s);   /* außerhalb des Bildes: gleiche Tipp-Logik des Spiels, nur mit der Zielposition */
      await sleep(on ? 1300 : 1100);
    }
    return ev(done, arg);
  };
  const ids = await ev(() => scene.npcs.map(n => n.id).concat(['gate']));
  for (const id of ids) {
    // 1) hinlaufen + antippen
    const talked = await walkTo(id => { const T = scene.interactables().find(q => q.id === id); return T && scene.w2s(T.sx, T.sy); }, () => !!overlay, 60, id);
    const ov = await ev(() => overlay && overlay.constructor.name + ':' + (overlay.o && overlay.o.mode));
    if (!talked) { bad.push(id + ': nicht ansprechbar'); continue; }
    log.push(id + ' angesprochen (' + ov + ')');
    if (/lock/.test(ov)) { await ev(() => { overlay = null; }); bad.push(id + ': noch gesperrt'); continue; }
    await solve();
    if (await ev(() => scene.diff === 'easy')) {   // Leicht: Aufgaben direkt bei der Person
      for (let k = 0; k < 16 && !(await ev(id => !!scene.st.done[id], id)); k++) { await solve(); await sleep(300);
        if (await ev(id => { const e = scene.st.easy[id]; return !!(e && e.find && !e.find.got); }, id)) await walkTo(id => { const f = scene.st.easy[id].find; return scene.w2s(f.x, f.y); }, id => { const e = scene.st.easy[id]; return !e || !e.find || e.find.got; }, 30, id);   /* Leicht: erst die leuchtende Sache holen */
        if (await ev(() => !overlay)) await walkTo(id => { const T = scene.interactables().find(q => q.id === id); return T && scene.w2s(T.sx, T.sy); }, () => !!overlay, 20, id); }
      const st = await ev(id => !!scene.st.done[id], id); log.push(id + (st ? ' erledigt' : ' NICHT erledigt')); if (!st) bad.push(id + ': nicht erledigt');
      if (id === 'gate') for (let k = 0; k < 25; k++) { const r = await solve(); if (r === 'clear') { log.push('Ziel erreicht'); break; } await sleep(300); }
      continue;
    }
    // 2) alle versteckten Sachen suchen: hinlaufen, stehen bleiben (Mittel sucht dann von selbst)
    const n = await ev(() => scene.st.active ? scene.st.active.hidden.length : 0);
    for (let i = 0; i < n; i++) {
      const got = await walkTo(i => { const q = scene.st.active; if (!q) return null; const h = q.hidden[i], pk = peekOf(h); return scene.w2s(pk.x, pk.y - 8); }, i => { const q = scene.st.active; return !q || q.got[i] || !!overlay; }, 40, i);
      for (let w = 0; w < 10; w++) { await sleep(400); if (await ev(() => !!overlay)) break; if (await ev(i => !scene.st.active || scene.st.active.got[i], i)) break; if (w === 2) await p.mouse.click(W0 - 58, H0 - 112); }   // Lupe drücken (Schwer sucht nicht von selbst)
      const r = await solve();
      const ok = await ev(i => !scene.st.active || scene.st.active.got[i], i);
      if (!ok) bad.push(id + ': Sache ' + (i + 1) + ' nicht gefunden (' + r + ') ' + await ev(i => { const q = scene.st.active, h = q.hidden[i], P = scene.p; return 'Versteck ' + (h.spot || 'Boden') + ' bei ' + Math.round(h.x) + ',' + Math.round(h.y) + ' Figur ' + Math.round(P.x) + ',' + Math.round(P.y) + ' Abstand ' + Math.round(dist(P.x, P.y, h.x, h.y)) + ' Reichweite ' + h.reach + ' still ' + (scene.stillT || 0).toFixed(1) + ' auto ' + scene.autoSearched; }, i));
    }
    // 3) zurück zur Person
    if (await ev(() => !!scene.st.active)) {
      await walkTo(id => { const T = scene.interactables().find(q => q.id === id); return T && scene.w2s(T.sx, T.sy); }, () => !!overlay || !scene.st.active, 60, id);
      log.push('  beim Zurückbringen: ' + await ev(() => overlay ? overlay.constructor.name + ':' + (overlay.o && overlay.o.mode) + ':' + (overlay.o && overlay.o.text || '').slice(0, 60) : 'kein Fenster; aktiv=' + !!scene.st.active + ' got=' + (scene.st.active ? scene.st.active.got.join(',') : '')));
      const r = await solve(); if (r === 'clear') { log.push('Ziel erreicht'); break; }
    }
    const st = await ev(id => !!scene.st.done[id], id); log.push(id + (st ? ' erledigt' : ' NICHT erledigt')); if (!st) bad.push(id + ': nicht erledigt – ' + await ev(id => { const q = scene.st.active, T = scene.interactables().find(x => x.id === id); return 'Szene ' + scene.constructor.name + ', Fenster ' + (overlay && overlay.constructor.name) + ', aktiv ' + (q && q.npc) + ' got ' + (q && q.got.join(',')) + ', Figur ' + Math.round(scene.p.x) + ',' + Math.round(scene.p.y) + ' Ziel ' + (T && Math.round(T.x) + ',' + Math.round(T.y)) + ' inRange ' + (T && scene.inRange(T)) + ' Weg ' + (scene.p.path ? scene.p.path.length : 0); }, id));
    if (id === 'gate') { for (let k = 0; k < 25; k++) { const r = await solve(); if (r === 'clear') { log.push('Ziel erreicht'); break; } await sleep(300); } }
  }
  // 4) Bonbons (Sammel-Sachen) einsammeln
  const nl = await ev(() => (scene instanceof Play && scene.st.leaves || []).length);
  if (!(await ev(() => overlay && overlay.constructor.name === 'ClearOverlay'))) for (let i = 0; i < nl; i++) {
    const ok = await walkTo(i => { const l = scene.st && scene.st.leaves && scene.st.leaves[i]; return l && scene.w2s(l.x, l.y); }, i => !(scene instanceof Play) || scene.st.leaves[i].got, 40, i);
    if (!ok) bad.push('Bonbon ' + (i + 1) + ' nicht erreichbar');
  }
  const km = await ev(() => META().km || 0); log.push('Kürbismünzen: ' + km);
  if (AREA === 'geisterwald' && km < 30) bad.push('zu wenig Münzen: ' + km);
  // 5) Kürbis-Laden: Kostüm kaufen per Klick
  if (AREA === 'geisterwald') {
    await ev(() => { overlay = null; META().km = Math.max(META().km || 0, 25); setScene(new Shop()); scene.tab = 'hw'; }); await sleep(500);
    const before = await ev(() => META().km); await p.mouse.click(110, 230); await sleep(500);
    const after = await ev(() => [META().km, META().skins.filter(s => /^hwskin/.test(s)).join(',')]);
    log.push('Laden: ' + before + ' → ' + after[0] + ' Münzen, Kostüme: ' + after[1]); if (after[0] >= before) bad.push('Kauf im Kürbis-Laden ging nicht');
  }
  log.push('Bonus-Zeit (gebraucht ohne Spiele | geschätzt Wege+Suchen | Auftrag-Zeit): ' + (await ev(() => BT.map(x => x.npc + ' ' + x.tt + 's | ' + Math.round(x.lim / BONUS_PUFFER - x.g) + 's | ' + x.lim + 's').join(', '))));
  console.log(log.join('\n')); console.log(bad.length ? 'PROBLEME:\n' + bad.join('\n') : 'ALLES OK'); console.log('ERR', [...new Set(errs)].join(' / ') || 'none');
  await b.close();
})();
