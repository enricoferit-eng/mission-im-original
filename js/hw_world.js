'use strict';
// Halloween-Special: die Bereiche selbst – Laub, Kürbis-Laternen, Grabsteine, Kerzen, Spinnweben auf dem Boden,
// darüber Nachtstimmung mit Lichtschein um die Figur und leuchtenden Laternen
const HW_INDOOR = { kueche: 1, gastraum: 1 };
const HW_PROPS = {};
function hwProp(g, p) {
  const { x, y, k } = p;
  if (k === 'jack') { g.fillStyle = 'rgba(0,0,0,.25)'; ell(g, x, y + 10, 18, 6); g.fill(); jackO(g, x, y, 1.25, 0); }
  else if (k === 'grave') { g.save(); g.translate(x, y); g.scale(0.55, 0.55); g.fillStyle = 'rgba(0,0,0,.25)'; ell(g, 0, 4, 34, 8); g.fill(); g.beginPath(); g.moveTo(-24, 2); g.lineTo(-24, -32); g.quadraticCurveTo(-24, -56, 0, -56); g.quadraticCurveTo(24, -56, 24, -32); g.lineTo(24, 2); g.closePath(); fs(g, '#9a96a8', 3.5); g.font = `bold 20px ${FONT}`; g.textAlign = 'center'; g.fillStyle = '#5c586b'; g.fillText('BUH', 0, -22); g.restore(); }
  else if (k === 'candle') { for (const [dx, h] of [[-8, 22], [6, 16], [0, 12]]) { rrPath(g, x + dx - 4, y - h, 8, h, 2); fs(g, '#fff3e0', 2); g.beginPath(); g.moveTo(x + dx, y - h - 10); g.quadraticCurveTo(x + dx + 4, y - h - 4, x + dx, y - h - 1); g.quadraticCurveTo(x + dx - 4, y - h - 4, x + dx, y - h - 10); fs(g, '#ffb703', 1.2); } }
  else if (k === 'candy') { drawItem(g, p.it, x, y, 26); }
  else if (k === 'hay') { rrPath(g, x - 26, y - 22, 52, 26, 6); fs(g, '#e9c46a', 2.5); for (let i = -18; i <= 18; i += 9) line(g, x + i, y - 20, x + i + 3, y + 2, 1.2, '#b08d3a', false); jackO(g, x + 4, y - 32, 1.1, 0); }
  else if (k === 'web') { g.save(); g.translate(x, y); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.5; for (let a = 0; a <= 4; a++) { const an = a * Math.PI / 8 + p.rot; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an) * 60, Math.sin(an) * 60); g.stroke(); } for (let r = 16; r <= 56; r += 14) { g.beginPath(); for (let a = 0; a <= 4; a++) { const an = a * Math.PI / 8 + p.rot; const px = Math.cos(an) * r, py = Math.sin(an) * r; if (!a) g.moveTo(px, py); else g.lineTo(px, py); } g.stroke(); } g.restore(); }
}
if (HALLOWEEN) {
  for (const D of Object.values(STAGE_DEFS)) {
    const g0 = D.ground;
    D.ground = function (g, R) {
      g0(g, R);
      const id = SG.id, indoor = HW_INDOOR[id], r = mulberry32(777 + id.length * 31), WW = WORLD_W, WH = WORLD_H;
      // Laub (draußen) bzw. Bonbonpapier (drinnen) über den ganzen Boden
      const cols = ['#e85d04', '#dc2f02', '#ffba08', '#9d0208', '#7f5539'];
      const n = Math.round(WW * WH / (indoor ? 26000 : 6000));
      for (let i = 0; i < n; i++) { const x = r() * WW, y = r() * WH; if (!canStand(0, x, y)) continue; g.save(); g.translate(x, y); g.rotate(r() * 6.3); g.globalAlpha = 0.75;
        if (indoor) { rrPath(g, -5, -3, 10, 6, 2); g.fillStyle = ['#ff8fab', '#7b2cbf', '#ffd60a', '#70e000'][i % 4]; g.fill(); }
        else { ell(g, 0, 0, 7 + r() * 4, 3.5 + r() * 2); g.fillStyle = cols[i % cols.length]; g.fill(); }
        g.restore(); }
      // Deko an freien Stellen: nicht auf Verstecken, Personen, Start, Tor
      const busy = (x, y) => SPOTS.some(s => dist(s.x, s.y, x, y) < 95 || dist(s.px, s.py, x, y) < 80) || NPC_DEFS.some(q => dist(q.x, q.y, x, y) < 90) || dist(START.x, START.y, x, y) < 110 || (GATE && dist(GATE.x, GATE.y, x, y) < 110);
      const kinds = indoor ? ['candle', 'jack', 'candle', 'jack'] : ['jack', 'grave', 'jack', 'hay', 'grave'];
      const props = []; let tries = 0, want = Math.round(WW * WH / 90000) + 6;
      while (props.length < want && tries++ < 3000) { const x = 40 + r() * (WW - 80), y = 60 + r() * (WH - 100); if (!canStand(0, x, y) || busy(x, y) || props.some(p => dist(p.x, p.y, x, y) < 160)) continue;
        props.push({ x, y, k: kinds[props.length % kinds.length], it: pick(HW_AREA_ITEMS[id] || HW_ITEM_IDS, r) }); }
      for (const [x, y, rot] of [[0, 0, 0], [WW, 0, Math.PI / 2], [0, WH, -Math.PI / 2], [WW, WH, Math.PI]]) props.push({ x, y, k: 'web', rot });   // Spinnweben in den Ecken
      props.sort((a, b) => a.y - b.y).forEach(p => hwProp(g, p));
      HW_PROPS[id] = props.filter(p => p.k === 'jack' || p.k === 'candle' || p.k === 'hay');
    };
  }
  // Nachtstimmung: Rand dunkel und lila, um die Figur hell; Laternen leuchten; Gespenster und Fledermäuse ziehen vorbei
  hwWorldFx = function (play, c, t) {
    const z = play.zoom || 1, me = play.w2s(play.p.x, play.p.y, 20);
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#c4b5e6'; c.fillRect(0, 0, W, H); c.restore();
    const g = c.createRadialGradient(me.x, me.y, 140 * z, me.x, me.y, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(25,10,50,0)'); g.addColorStop(1, 'rgba(25,10,50,0.5)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const p of HW_PROPS[play.stage] || []) { const s = play.w2s(p.x, p.y, p.k === 'hay' ? 30 : 6); if (s.x < -80 || s.x > W + 80 || s.y < -80 || s.y > H + 80) continue;
      const fl = 0.85 + 0.15 * Math.sin(t * 9 + p.x), rg = c.createRadialGradient(s.x, s.y, 2, s.x, s.y, 60 * z * fl); rg.addColorStop(0, 'rgba(255,170,60,.45)'); rg.addColorStop(1, 'rgba(255,120,20,0)'); c.fillStyle = rg; c.fillRect(s.x - 70 * z, s.y - 70 * z, 140 * z, 140 * z); }
    c.restore();
    for (let i = 0; i < 3; i++) {   // Gespenster am Rand
      const x = ((t * (14 + i * 5) + i * 330) % (W + 120)) - 60, y = 110 + i * (H - 200) / 3 + Math.sin(t * 1.4 + i * 2) * 14;
      c.save(); c.globalAlpha = 0.5; drawItem(c, 'hw_gespenst', x, y, 40); c.restore();
    }
    hwBats(c, t, 4);
  };
}
