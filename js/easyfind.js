'use strict';
// ---------- Leicht: erst etwas suchen, dann die Aufgaben ----------
// Bei „Leicht“ gab jede Person nur Minispiele hintereinander – die Welt war dabei egal. Jetzt bittet sie zuerst um eine Sache,
// die ganz in der Nähe liegt, groß leuchtet und mit einem Pfeil gezeigt wird. Hinlaufen = einsammeln, danach starten sofort
// 3 statt 4 Minispiele (kein Rückweg zur Person). (Nicht im Mehrspieler, nicht in der Helfer-Schule, nicht beim Tor.)
const EASY_SAY = {
  ask: 'Schau, da leuchtet etwas! Lauf hin und hol es.',
  remind: 'Hol zuerst das leuchtende Ding!',
  got: 'Gefunden! Jetzt kommen die Aufgaben.',
};
const EASY_STEPS = 3;
{
  const P = Play.prototype;
  const findOk = (pl, id) => !pl.mp && pl.stage !== 'uebung' && id !== 'gate';
  // Ein freier Platz in der Nähe der Person (erreichbar, nicht auf anderen Leuten)
  P.easyFindSpot = function (id, r) {
    const n = this.npcs.find(q => q.id === id); if (!n) return null; const A = this.npcPos(n);
    for (let k = 0; k < 80; k++) {
      const a = r() * TAU, d = 170 + r() * 150, x = Math.round(A.x + Math.cos(a) * d), y = Math.round(A.y + Math.sin(a) * d * 0.8);
      if (x < 60 || y < 120 || x > WORLD_W - 60 || y > WORLD_H - 60 || !canStand(0, x, y)) continue;
      if (this.npcs.some(q => dist(q.x, q.y, x, y) < 80) || dist(x, y, GATE.ix, GATE.iy) < 90) continue;
      if (!findPath(A.x, A.y, A.l || 0, x, y, 0, true)) continue;
      return { x, y };
    }
    return null;
  };
  const start0 = P.startEasy;
  P.startEasy = function (id) { if (!this.st.easy[id] && findOk(this, id)) this.easyNew = id; return start0.call(this, id); };
  const run0 = P.runEasyStep;
  P.runEasyStep = function (id) {
    const e = this.st.easy[id];
    if (e && this.easyNew === id) {   // gerade neu: Such-Sache festlegen statt sofort zu spielen
      this.easyNew = null; const r = mulberry32((e.seed || 1) * 7 + 3), spot = this.easyFindSpot(id, r);
      if (spot) {
        const pool = SG.items || ITEM_IDS; e.find = { item: pick(pool, r), x: spot.x, y: spot.y, got: false };
        e.steps = e.steps.slice(0, EASY_STEPS); e.lim = this.questTime(id, [], e.steps, 'easy'); Save.write();
        this.banner = { text: 'Hol ' + ((ITEMS[e.find.item] || {}).n || 'das leuchtende Ding') + ' – es leuchtet!', t: 0 }; Voice.say(EASY_SAY.ask, true);
        if (this.npcAnim[id]) this.npcAnim[id].wave = 1.5;
        return;
      }
    }
    if (e && e.find && !e.find.got) { this.banner = { text: EASY_SAY.remind, t: 0 }; Voice.say(EASY_SAY.remind, true); return; }
    if (e && e.find && e.find.got && !e.find.given) { e.find.given = true; Save.write(); Sfx.play('good'); const A = this.anchor(id), s = this.w2s(A.x, A.y, A.z + 40); FX.sparkle(s.x, s.y, 20); }
    return run0.call(this, id);
  };
  // Einsammeln: einfach hinlaufen
  const upd0 = P.update;
  P.update = function (dt) {
    upd0.call(this, dt);
    if (this.diff !== 'easy' || this.mp || !this.st || !this.st.easy || overlay) return;
    for (const id in this.st.easy) {
      const f = this.st.easy[id].find; if (!f || f.got) continue;
      if (this.p.level === 0 && dist(this.p.x, this.p.y, f.x, f.y) < 58) {
        f.got = true; Save.write(); Sfx.play('coin'); buzz([20, 30, 20]);
        const s = this.w2s(f.x, f.y, 20); FX.sparkle(s.x, s.y, 24, '#ffd23f');
        FX.flyTo && FX.flyTo(s.x, s.y, W / 2, 104, (c, x, y, sc) => drawItem(c, f.item, x, y, 44 * sc));
        this.banner = { text: EASY_SAY.got, t: 0 }; Voice.say(EASY_SAY.got, true);
        this.pending = { t: 1.2, fn: () => { if (!overlay && this.st.easy[id]) this.runEasyStep(id); } };   // Aufgaben gleich hier starten
      }
    }
  };
  // Zeichnen: die Sache leuchtet groß, ein Pfeil hüpft darüber; außerhalb des Bildes zeigt ein Pfeil am Rand hin
  const mark0 = P.drawMarkers;
  P.drawMarkers = function (c) {
    const r = mark0.call(this, c);
    if (this.diff === 'easy' && this.st && this.st.easy) for (const id in this.st.easy) {
      const f = this.st.easy[id].find; if (!f || f.got) continue;
      const t = this.t, gl = 0.5 + 0.5 * Math.sin(t * 4), bob = Math.sin(t * 3) * 4;
      ell(c, f.x, f.y, 44 + gl * 8, 20 + gl * 4); c.fillStyle = `rgba(255,214,10,${0.25 + gl * 0.25})`; c.fill();
      ell(c, f.x, f.y - 30 + bob, 34, 34); c.fillStyle = `rgba(255,255,255,${0.5 + gl * 0.3})`; c.fill();
      drawItem(c, f.item, f.x, f.y - 30 + bob, 54);
      const ay = f.y - 92 + Math.abs(Math.sin(t * 4)) * -10; polyPath(c, [[f.x - 14, ay - 18], [f.x + 14, ay - 18], [f.x, ay]]); fs(c, '#ffd23f', 3, '#3d2c1f');
    }
    return r;
  };
  const hud0 = P.drawHud;
  P.drawHud = function (c) {
    hud0.call(this, c);
    if (this.diff !== 'easy' || !this.st || !this.st.easy || overlay) return;
    for (const id in this.st.easy) {
      const f = this.st.easy[id].find; if (!f || f.got) continue;
      const s = this.w2s(f.x, f.y - 30); if (s.x > 40 && s.x < W - 40 && s.y > 90 && s.y < H - 60) continue;
      const ax = clamp(s.x, 60, W - 60), ay = clamp(s.y, 120, H - 90), ang = Math.atan2(s.y - ay, s.x - ax), pu = 1 + Math.sin(this.t * 6) * 0.12;
      c.save(); c.translate(ax, ay); c.rotate(ang); c.scale(pu, pu); polyPath(c, [[30, 0], [-14, -24], [-4, 0], [-14, 24]]); fs(c, '#ffd23f', 4, '#3d2c1f'); c.restore();
    }
  };
  P.drawHud._src = hud0._src || hud0;
}
