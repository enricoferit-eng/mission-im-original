'use strict';
// ---------- Geheime Extra-Joker in den anderen Bereichen (werden nirgends erklärt – selbst entdecken!) ----------
// tap:   ein Ding n-mal schnell antippen (man muss in der Nähe stehen)
// seq:   mehrere Dinge nacheinander antippen
// visit: eine Runde laufen (alle Punkte der Reihe nach in der Zeit erreichen)
const AREA_SECRETS = {
  gastraum: [
    { key: 'glocke', kind: 'tap', x: 470, y: 205, r: 46, n: 5, time: 3, name: 'Fünfmal die Barglocke geläutet', ach: 'Barglocken-Profi', desc: 'Läute an der Bar fünfmal schnell hintereinander.' },
    { key: 'olive', kind: 'visit', pts: [[310, 690], [430, 790], [310, 900], [190, 790]], time: 7, name: 'Einmal um den Olivenbaum gerannt', ach: 'Olivenbaum-Runde', desc: 'Lauf einmal schnell um einen Olivenbaum herum.' },
  ],
  kueche: [
    { key: 'toepfe', kind: 'tap', x: 155, y: 480, r: 50, n: 4, time: 3, name: 'Auf dem Topf getrommelt', ach: 'Topf-Trommler', desc: 'Trommle viermal schnell auf dem großen Topf.' },
    { key: 'lager', kind: 'visit', pts: [[430, 900], [430, 1030], [805, 1030], [805, 900]], time: 8, name: 'Lager-Sprint geschafft', ach: 'Lager-Sprinter', desc: 'Renn durch beide Lager-Durchgänge in einer Runde.' },
  ],
  aussen: [
    { key: 'brunnen', kind: 'tap', x: 640, y: 660, r: 56, n: 3, time: 3, name: 'Drei Wünsche in den Brunnen geworfen', ach: 'Wunschbrunnen', desc: 'Wirf drei Wünsche schnell in den Brunnen.' },
    { key: 'kugeln', kind: 'seq', pts: [[520, 535], [880, 585], [520, 535]], r: 40, time: 9, name: 'Die Leuchtkugeln zum Leuchten gebracht', ach: 'Lichtzauber', desc: 'Tippe die Leuchtkugeln abwechselnd an.' },
  ],
  chalet: [
    { key: 'schneemann', kind: 'tap', x: 300, y: 830, r: 50, n: 5, time: 3, name: 'Dem Schneemann die Mütze gerichtet', ach: 'Schneemann-Freund', desc: 'Tippe den Schneemann fünfmal schnell an.' },
    { key: 'teich', kind: 'visit', pts: [[760, 1010], [940, 1120], [760, 1230], [585, 1120]], time: 11, name: 'Einmal um den Eisteich gelaufen', ach: 'Eisteich-Runde', desc: 'Lauf einmal um den zugefrorenen Teich.' },
  ],
  parkplatz: [
    { key: 'hupe', kind: 'tap', x: 440, y: 590, r: 50, n: 4, time: 3, name: 'Das rote Auto hat gehupt', ach: 'Hup-Hup', desc: 'Tippe das rote Auto viermal schnell an.' },
    { key: 'kreisel', kind: 'visit', pts: [[300, 174], [456, 330], [300, 486], [144, 330]], time: 10, name: 'Einmal um den Kreisverkehr', ach: 'Kreisel-Runde', desc: 'Lauf einmal um den ganzen Kreisverkehr.' },
  ],
};
// Erfolge: je Geheimnis, je Bereich "alle Geheimnisse", je Bereich geschafft, ganze Welt
{
  const NAMES = { gastraum: 'Gastraum', kueche: 'Küche', aussen: 'Außenbereich', chalet: 'Chalet', parkplatz: 'Parkplatz' };
  const HELD = { gastraum: 'Gastraum-Held', kueche: 'Küchen-Held', aussen: 'Terrassen-Held', chalet: 'Chalet-Held', parkplatz: 'Parkplatz-Held' };
  Object.entries(AREA_SECRETS).forEach(([st, list]) => {
    list.forEach(S => { SECRET_NAMES[S.key] = S.name; ACHIEVEMENTS.push({ id: 'g_' + S.key, name: S.ach, desc: 'Geheimnis: ' + S.desc, coins: 20, secret: true }); });
    ACHIEVEMENTS.push({ id: 'geheim_' + st, name: 'Geheimnisse: ' + NAMES[st], desc: 'Finde beide Geheimnisse im Bereich ' + NAMES[st] + '.', coins: 40 });
    ACHIEVEMENTS.push({ id: 'clear_' + st, name: HELD[st], desc: 'Schaffe den Bereich ' + NAMES[st] + '.', coins: 30 });
  });
  ACHIEVEMENTS.push({ id: 'welt', name: 'Im Original zuhause', desc: 'Schaffe alle sechs Bereiche.', coins: 100 });
  ACHIEVEMENTS.push({ id: 'entdecker', name: 'Entdecker', desc: 'Lauf durch alle sechs Bereiche.', coins: 25 });
}
function checkAreaAch(stage) {
  const m = META(); if (!m) return;
  const L = AREA_SECRETS[stage]; if (L && L.every(S => m.ach['g_' + S.key])) achieve('geheim_' + stage);
}
{
  const tap0 = Play.prototype.tap, upd0 = Play.prototype.update, clear0 = Play.prototype.stageClear;
  Play.prototype.tap = function (sx, sy) {
    const L = !this.mp && AREA_SECRETS[this.stage];
    if (L && !this.exiting && !this.swinging) {
      const w = this.s2w(sx, sy), p = this.p, sec = this.sec || (this.sec = {});
      for (const S of L) {
        if (this.st.secret[S.key]) continue;
        if (S.kind === 'tap' && dist(w.x, w.y, S.x, S.y) < S.r && dist(p.x, p.y, S.x, S.y) < 170) {
          const T = sec[S.key] = (sec[S.key] || []).filter(t => this.t - t < S.time).concat([this.t]);
          Sfx.note(520 + T.length * 90, 0.08, 'triangle', 0.05); const sc = this.w2s(S.x, S.y, 30); FX.sparkle(sc.x, sc.y, 4 + T.length * 2, '#ffd23f');
          if (T.length >= S.n) { this.secretJoker(S.key); checkAreaAch(this.stage); }
          return;
        }
        if (S.kind === 'seq') {
          const k = S.pts.findIndex(([x, y]) => dist(w.x, w.y, x, y) < S.r);
          if (k >= 0 && dist(p.x, p.y, S.pts[k][0], S.pts[k][1]) < 220) {
            let st = sec[S.key]; if (!st || this.t - st.t0 > S.time) st = sec[S.key] = { i: 0, t0: this.t };
            if (dist(S.pts[st.i][0], S.pts[st.i][1], S.pts[k][0], S.pts[k][1]) < 1) { st.i++; Sfx.note(600 + st.i * 120, 0.12, 'sine', 0.06); const sc = this.w2s(S.pts[k][0], S.pts[k][1], 20); FX.sparkle(sc.x, sc.y, 10, '#fff3bf'); if (st.i >= S.pts.length) { delete sec[S.key]; this.secretJoker(S.key); checkAreaAch(this.stage); } }
            else sec[S.key] = null;
            return;
          }
        }
      }
    }
    return tap0.call(this, sx, sy);
  };
  Play.prototype.update = function (dt) {
    upd0.call(this, dt);
    const L = !this.mp && scene === this && AREA_SECRETS[this.stage]; if (!L) return;
    const p = this.p, sec = this.sec || (this.sec = {});
    for (const S of L) {
      if (S.kind !== 'visit' || this.st.secret[S.key]) continue;
      let st = sec[S.key];
      if (st && this.t - st.t0 > S.time) st = sec[S.key] = null;
      const [x0, y0] = S.pts[0];
      if (!st) { if (dist(p.x, p.y, x0, y0) < 60) sec[S.key] = { i: 1, t0: this.t }; continue; }
      const [x, y] = S.pts[st.i % S.pts.length];
      if (dist(p.x, p.y, x, y) < 70) { st.i++; if (st.i > S.pts.length) { sec[S.key] = null; this.secretJoker(S.key); checkAreaAch(this.stage); } }
    }
  };
  Play.prototype.stageClear = function () {
    const r = clear0.call(this);
    if (!this.mp) {
      achieve(this.stage === 'spielplatz' ? 'spielplatz' : 'clear_' + this.stage);
      if (typeof STAGE_ORDER !== 'undefined' && ['easy', 'medium', 'hard'].some(d => STAGE_ORDER.every(id => SP(d, id).clears > 0))) achieve('welt');
    }
    return r;
  };
  // Entdecker: alle Bereiche betreten
  const ctor = Play;
  const seen = () => { const m = META(); if (!m) return null; return (m.seen = m.seen || {}); };
  const upd1 = Play.prototype.update;
  Play.prototype.update = function (dt) {
    upd1.call(this, dt);
    if (this.mp || this._seenMarked) return; this._seenMarked = true;
    const S = seen(); if (!S) return; if (!S[this.stage]) { S[this.stage] = 1; Save.write(); }
    if (STAGE_ORDER.every(id => S[id])) achieve('entdecker');
  };
}
