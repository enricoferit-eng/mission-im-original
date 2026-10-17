'use strict';
// Halloween-Special in der Welt: normale Bereiche nur leicht geschmückt (etwas Laub, ein paar Kürbis-Laternen,
// sanftes Abendlicht); der Geisterwald bekommt die volle Nacht mit Lichtschein um die Figur.
var hwWorldFx = null;   // eslint-disable-line no-var -- wird unten im Special gesetzt, stage.js fragt danach
const HW_INDOOR = { kueche: 1, gastraum: 1 };
const HW_PROPS = {};
function hwProp(g, p) {
  const { x, y, k } = p;
  if (k === 'jack') { g.fillStyle = 'rgba(0,0,0,.25)'; ell(g, x, y + 10, 18, 6); g.fill(); jackO(g, x, y, 1.25, 0); }
  else if (k === 'candle') { for (const [dx, h] of [[-8, 22], [6, 16], [0, 12]]) { rrPath(g, x + dx - 4, y - h, 8, h, 2); fs(g, '#fff3e0', 2); g.beginPath(); g.moveTo(x + dx, y - h - 10); g.quadraticCurveTo(x + dx + 4, y - h - 4, x + dx, y - h - 1); g.quadraticCurveTo(x + dx - 4, y - h - 4, x + dx, y - h - 10); fs(g, '#ffb703', 1.2); } }
  else if (k === 'web') { g.save(); g.translate(x, y); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.5; for (let a = 0; a <= 4; a++) { const an = a * Math.PI / 8 + p.rot; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an) * 60, Math.sin(an) * 60); g.stroke(); } for (let r = 16; r <= 56; r += 14) { g.beginPath(); for (let a = 0; a <= 4; a++) { const an = a * Math.PI / 8 + p.rot, px = Math.cos(an) * r, py = Math.sin(an) * r; if (!a) g.moveTo(px, py); else g.lineTo(px, py); } g.stroke(); } g.restore(); }
}
if (HALLOWEEN) {
  for (const D of Object.values(STAGE_DEFS)) {
    if (D.id === 'geisterwald') continue;   // der hat sein eigenes Aussehen
    const g0 = D.ground;
    D.ground = function (g, R) {
      g0(g, R);
      const id = SG.id, indoor = HW_INDOOR[id], r = mulberry32(777 + id.length * 31), WW = WORLD_W, WH = WORLD_H;
      if (!indoor) {   // ein bisschen Herbstlaub
        const cols = ['#e85d04', '#dc2f02', '#ffba08', '#9d0208', '#7f5539'], n = Math.round(WW * WH / 14000);
        for (let i = 0; i < n; i++) { const x = r() * WW, y = r() * WH; if (!canStand(0, x, y)) continue; g.save(); g.translate(x, y); g.rotate(r() * 6.3); g.globalAlpha = 0.7; ell(g, 0, 0, 7 + r() * 4, 3.5 + r() * 2); g.fillStyle = cols[i % cols.length]; g.fill(); g.restore(); }
      }
      // ein paar Kürbis-Laternen (drinnen Kerzen) an freien Stellen, nicht an Verstecken oder Personen
      const busy = (x, y) => SPOTS.some(s => dist(s.x, s.y, x, y) < 95 || dist(s.px, s.py, x, y) < 80) || NPC_DEFS.some(q => q.pos ? q.pos.some(([px, py]) => dist(px, py, x, y) < 90) : dist(q.x, q.y, x, y) < 90) || dist(START.x, START.y, x, y) < 110 || (GATE && dist(GATE.x, GATE.y, x, y) < 110);
      const props = []; let tries = 0; const want = Math.round(WW * WH / 260000) + 3;
      while (props.length < want && tries++ < 3000) { const x = 40 + r() * (WW - 80), y = 60 + r() * (WH - 100); if (!canStand(0, x, y) || busy(x, y) || props.some(p => dist(p.x, p.y, x, y) < 260)) continue; props.push({ x, y, k: indoor && props.length % 2 ? 'candle' : 'jack' }); }
      if (indoor) props.push({ x: 0, y: 0, k: 'web', rot: 0 }, { x: WW, y: 0, k: 'web', rot: Math.PI / 2 });
      props.sort((a, b) => a.y - b.y).forEach(p => hwProp(g, p));
      HW_PROPS[id] = props.filter(p => p.k !== 'web');
    };
  }
  // Licht und Stimmung über der Spielwelt (unter den Ausrufezeichen)
  hwWorldFx = function (play, c, t) {
    const z = play.zoom || 1, me = play.w2s(play.p.x, play.p.y, 20), wald = play.stage === 'geisterwald';
    if (wald) {   // volle Nacht, hell um die Figur
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#b3a3dc'; c.fillRect(0, 0, W, H); c.restore();
      const g = c.createRadialGradient(me.x, me.y, 150 * z, me.x, me.y, Math.max(W, H) * 0.75); g.addColorStop(0, 'rgba(25,10,50,0)'); g.addColorStop(1, 'rgba(25,10,50,0.5)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    } else {   // nur sanftes Abendlicht am Rand
      const g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.8); g.addColorStop(0, 'rgba(90,40,110,0)'); g.addColorStop(1, 'rgba(70,30,100,0.28)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    const lights = wald ? (STAGE_DEFS.geisterwald.decor.filter(d => d.t === 'laterne' || d.t === 'hexenhaus' || d.t === 'kessel' || d.t === 'karren').map(d => ({ x: d.t === 'laterne' ? d.x + 16 : d.x, y: d.t === 'laterne' ? d.y - 82 : d.y - 40 }))) : (HW_PROPS[play.stage] || []).map(p => ({ x: p.x, y: p.y - 6 }));
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const p of lights) { const s = play.w2s(p.x, p.y); if (s.x < -80 || s.x > W + 80 || s.y < -80 || s.y > H + 80) continue;
      const fl = 0.85 + 0.15 * Math.sin(t * 9 + p.x), rg = c.createRadialGradient(s.x, s.y, 2, s.x, s.y, 60 * z * fl); rg.addColorStop(0, `rgba(255,170,60,${wald ? 0.45 : 0.3})`); rg.addColorStop(1, 'rgba(255,120,20,0)'); c.fillStyle = rg; c.fillRect(s.x - 70 * z, s.y - 70 * z, 140 * z, 140 * z); }
    c.restore();
    if (wald) for (let i = 0; i < 3; i++) { const x = ((t * (14 + i * 5) + i * 330) % (W + 120)) - 60, y = 110 + i * (H - 200) / 3 + Math.sin(t * 1.4 + i * 2) * 14; c.save(); c.globalAlpha = 0.5; drawItem(c, 'hw_gespenst', x, y, 40); c.restore(); }
    hwBats(c, t, wald ? 4 : 2);
  };
}
