'use strict';
// ---------- Ton: iPhone-Freischaltung, Hintergrundmelodie je Bereich, Geräusche ----------
// iPhone: Web-Audio ist im Lautlos-Modus stumm und startet erst nach einer Berührung. Deshalb beim ersten Tippen:
// Audio-Session auf "playback" stellen, Kontext fortsetzen und einen stillen Ton abspielen.
(function unlockAudio() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* egal */ }
  const go = () => {
    try {
      const c = Sfx.ctx(); if (c.state !== 'running') c.resume();
      const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0);
      const a = document.createElement('audio'); a.setAttribute('playsinline', ''); a.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbg8isVNoMPMjAAAA0gAAABEVFGmgqK////9bP/6XCykxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
      a.play().catch(() => {});
    } catch (e) { /* egal */ }
    window.removeEventListener('pointerdown', go, true); window.removeEventListener('touchend', go, true);
  };
  window.addEventListener('pointerdown', go, true); window.addEventListener('touchend', go, true);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { try { if (Sfx.ac && Sfx.ac.state !== 'running') Sfx.ac.resume(); } catch (e) { /* egal */ } } });
})();

// Melodien je Bereich (Tonleiter-Schritte, Tempo, Klangfarbe) – ruhig im Hintergrund, Spannungsmusik bleibt in den Aufgaben
const N = f => 261.63 * Math.pow(2, f / 12);   // Halbtöne über C4
const TUNES = {
  kueche: { bpm: 128, wave: 'square', vol: 0.018, bass: [0, 0, 5, 7], mel: [12, 14, 16, 19, 16, 14, 12, null, 16, 19, 21, 19, 16, 14, 12, null] },
  gastraum: { bpm: 96, wave: 'triangle', vol: 0.03, bass: [0, 9, 5, 7], mel: [16, null, 19, 21, 19, null, 16, 14, 12, null, 14, 16, 14, null, 12, null] },
  aussen: { bpm: 112, wave: 'triangle', vol: 0.03, bass: [0, 7, 5, 7], mel: [19, 21, 23, 24, null, 23, 21, 19, 16, null, 19, null, 21, 19, 16, null] },
  spielplatz: { bpm: 124, wave: 'square', vol: 0.016, bass: [0, 5, 7, 5], mel: [12, 16, 19, 16, 21, 19, 16, null, 24, 21, 19, 16, 19, null, 12, null] },
  parkplatz: { bpm: 100, wave: 'sine', vol: 0.04, bass: [0, 5, 9, 7], mel: [19, null, 16, null, 21, 19, null, 16, 14, null, 16, 19, null, 16, 12, null] },
  chalet: { bpm: 104, wave: 'sine', vol: 0.04, bass: [0, 5, 7, 0], mel: [16, 16, 16, null, 16, 16, 16, null, 16, 19, 12, 14, 16, null, null, null], bells: true },
};
const Tune = {
  on: false, id: null, step: 0, next: 0, timer: null,
  start(id) {
    if (this.on && this.id === id) return; this.stop();
    if (!Sfx.on() || !TUNES[id]) return;
    try { const c = Sfx.ctx(); this.on = true; this.id = id; this.step = 0; this.next = c.currentTime + 0.1; this.timer = setInterval(() => this.tick(), 60); } catch (e) { /* kein Audio */ }
  },
  stop() { this.on = false; this.id = null; if (this.timer) clearInterval(this.timer); this.timer = null; },
  tone(f, t, dur, wave, vol) { const c = Sfx.ac, o = c.createOscillator(), g = c.createGain(); o.type = wave; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05); },
  tick() {
    if (!this.on) return; if (!Sfx.on()) { this.stop(); return; }
    const c = Sfx.ac; if (!c || c.state !== 'running') return;
    const T = TUNES[this.id], st = 60 / T.bpm / 2;
    while (this.next < c.currentTime + 0.25) {
      const t = this.next, k = this.step % 16, bar = Math.floor(this.step / 16) % T.bass.length;
      const m = T.mel[k]; if (m !== null) this.tone(N(m + (Math.floor(this.step / 64) % 2 ? 2 : 0)), t, st * 1.6, T.wave, T.vol);
      if (k % 4 === 0) this.tone(N(T.bass[bar] - 12), t, st * 3.5, 'triangle', T.vol * 1.4);
      if (T.bells && k % 2 === 0) { const b = c.createBufferSource(); b.buffer = noiseBuf(0.05); const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000; const g = c.createGain(); g.gain.setValueAtTime(0.03, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); b.connect(hp).connect(g).connect(c.destination); b.start(t); }
      this.next += st; this.step++;
    }
  },
};
let NOISE = {};
function noiseBuf(dur) { const c = Sfx.ac, k = dur.toFixed(2); if (NOISE[k]) return NOISE[k]; const b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (NOISE[k] = b); }
// kurzes Rauschen (Schritte, Rascheln, Brutzeln, Wind, Auto)
function noise(dur, freq, vol, type = 'bandpass', q = 1) {
  if (!Sfx.on()) return;
  try { const c = Sfx.ctx(), t = c.currentTime, s = c.createBufferSource(); s.buffer = noiseBuf(dur); const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(c.destination); s.start(t); } catch (e) { /* egal */ }
}
const AMBIENT = {
  kueche: () => { if (Math.random() < 0.5) noise(0.35, 3000, 0.012, 'highpass'); else Sfx.note(1800 + Math.random() * 600, 0.05, 'sine', 0.012); },          // Brutzeln, Teller klirren
  gastraum: () => { Sfx.note(2200 + Math.random() * 800, 0.06, 'sine', 0.01); setTimeout(() => Sfx.note(2600 + Math.random() * 600, 0.05, 'sine', 0.008), 90); },   // Gläser
  aussen: () => { const f = 2600 + Math.random() * 900; Sfx.note(f, 0.08, 'sine', 0.014, 1.3); setTimeout(() => Sfx.note(f * 1.1, 0.07, 'sine', 0.012, 1.25), 120); },   // Vögel
  spielplatz: () => { const f = 2400 + Math.random() * 900; Sfx.note(f, 0.08, 'sine', 0.012, 1.3); },
  parkplatz: () => noise(1.4, 400, 0.02, 'lowpass'),                                                                                                      // Auto fährt vorbei
  chalet: () => { for (let k = 0; k < 3; k++) setTimeout(() => noise(0.04, 1500 + Math.random() * 2000, 0.02), k * 70 + Math.random() * 60); },           // Kaminfeuer knistert
};
const FLOOR_STEP = { kueche: 2400, gastraum: 1700, aussen: 900, spielplatz: 700, parkplatz: 1200, chalet: 500 };
{
  const upd0 = Play.prototype.update;
  Play.prototype.update = function (dt) {
    upd0.call(this, dt);
    if (scene !== this) return;
    const inGame = overlay && overlay instanceof GameOverlay;
    if (!inGame && !this.exiting) Tune.start(this.stage); else Tune.stop();
    if (inGame || !Sfx.on()) return;
    this.ambT = (this.ambT || 2) - dt; if (this.ambT <= 0) { this.ambT = 2.5 + Math.random() * 4; try { AMBIENT[this.stage] && AMBIENT[this.stage](); } catch (e) { /* egal */ } }
    if (this.p.moving && !this.p.slide) { this.stepT = (this.stepT || 0) - dt; if (this.stepT <= 0) { this.stepT = 0.28; noise(0.06, FLOOR_STEP[this.stage] || 1000, 0.025); } }
  };
  const cross0 = Play.prototype.crossTo;
  if (cross0) Play.prototype.crossTo = function (E) { noise(0.5, 900, 0.03, 'bandpass', 0.6); Sfx.note(520, 0.2, 'sine', 0.04, 1.5); return cross0.call(this, E); };
  const search0 = Play.prototype.startSearch;
  Play.prototype.startSearch = function () { noise(0.4, 2200, 0.035, 'bandpass', 0.8); return search0.call(this); };
  const leaves0 = Play.prototype.updateLeaves;
  Play.prototype.updateLeaves = function () { const before = (this.st.leaves || []).filter(l => l.got).length; const r = leaves0.call(this); if ((this.st.leaves || []).filter(l => l.got).length > before) { [880, 1175, 1480].forEach((f, i) => setTimeout(() => Sfx.note(f, 0.12, 'triangle', 0.05), i * 70)); } return r; };
  const set0 = setScene;
  setScene = function (s) { if (!(s instanceof Play)) Tune.stop(); return set0(s); };
}
