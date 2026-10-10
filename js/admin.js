'use strict';
// ---------- Admin-Konto (Enrico): alle Bereiche, alle Kinder, alle Skins, unendlich Taler + Joker, Versteck-Anzeige ----------
function adminBoost() {
  const a = ACC(); if (!isGameAdmin(a)) return;
  const m = META(a); m.coins = 999999; m.bank = 999;
  if (typeof SHOP_SKINS !== 'undefined') m.skins = SHOP_SKINS.map(x => x[0]).concat(EXCLUSIVE_SKINS.map(x => x[0]));
  if (typeof ANIMALS !== 'undefined') m.animals = Object.keys(ANIMALS);
  ['easy', 'medium', 'hard'].forEach(d => STAGE_ORDER.forEach(id => { const sp = SP(d, id); stageSkins(id, d).forEach(s => { if (!sp.skins.includes(s)) sp.skins.push(s); }); }));
}
{
  const ctor0 = Play.prototype.bossOpen;
  Play.prototype.bossOpen = function () { return isGameAdmin() && !this.mp ? true : ctor0.call(this); };
  // Admin darf jede Person jederzeit ansprechen: fertige nochmal, und ein laufender Auftrag wird dafür beendet
  const talk0 = Play.prototype.talk;
  Play.prototype.talk = function (id) {
    if (isGameAdmin() && !this.mp) {
      const st = this.st;
      if (st.done[id]) { delete st.done[id]; if (st.easy) delete st.easy[id]; if (id === 'gate') this.gateA = 0; }
      if (st.active && st.active.npc !== id && this.diff !== 'easy') { st.active = null; this.toast = null; }
      Save.write();
    }
    return talk0.call(this, id);
  };
  const hud0 = Play.prototype.drawHud;
  Play.prototype.drawHud = function (c) {
    hud0.call(this, c);
    if (!isGameAdmin() || this.mp) return;
    const on = !!this.showSpots, x = W - 46, y = H - 150;
    roundBtn(c, x, y, 24, on ? '#ffd166' : '#e9ecef', 'search', () => { this.showSpots = !this.showSpots; Sfx.play('tap'); }, '#3d2c1f');
    txt(c, 'Verstecke', x, y + 34, 11, '#fff', 'center', BRAND.olive);
    // Auftrag sofort erledigen: alle Sachen des laufenden Auftrags bekommen
    const q = this.st.active;
    if (q && q.got.some(g => !g)) { const y2 = y - 66; roundBtn(c, x, y2, 24, '#06d6a0', 'check', () => { q.got = q.got.map(() => true); if (q.coop) { q.coop.chestOpen = q.coop.chest = q.coop.roof = true; } Save.write(); Sfx.play('win'); this.banner = { text: 'Admin: alles gefunden – bring es zurück!', t: 0 }; }, '#fff'); txt(c, 'Auftrag fertig', x, y2 + 34, 11, '#fff', 'center', BRAND.olive); }
  };
  Play.prototype.drawHud._src = hud0._src || hud0;
  const mark0 = Play.prototype.drawMarkers;
  Play.prototype.drawMarkers = function (c) {
    if (this.showSpots) {
      const q = this.st.active, t = this.t;
      SPOTS.forEach(s => {
        const px = s.px != null ? s.px : s.x, py = s.py != null ? s.py : s.y, used = q && q.hidden.some((h, i) => h.spot === s.id && !q.got[i]);
        line(c, s.x, s.y, px, py, 2, 'rgba(255,255,255,.7)', false);
        ell(c, s.x, s.y, s.reach * 0.4, s.reach * 0.18); c.lineWidth = 2; c.strokeStyle = 'rgba(17,138,178,.9)'; c.stroke();
        ell(c, px, py, used ? 16 + Math.sin(t * 6) * 3 : 11, used ? 16 + Math.sin(t * 6) * 3 : 11); fs(c, used ? '#ef476f' : 'rgba(255,214,10,.9)', 2.5);
        txt(c, s.id.replace(/^s_/, ''), px, py - 22, 10, '#fff', 'center', OL);
      });
      if (q) q.hidden.forEach((h, i) => { if (h.px == null && !q.got[i]) { ell(c, h.x, h.y, 18, 18); fs(c, '#ef476f', 3); } });
    }
    return mark0.call(this, c);
  };
  const setS0 = setScene;
  setScene = function (s) { adminBoost(); return setS0(s); };
}
