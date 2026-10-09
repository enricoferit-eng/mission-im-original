'use strict';
// ---------- Grundlagen: Mathe, Zufall, Speicher, Sound, Zeichen-Helfer, UI, Effekte ----------
const TAU = Math.PI * 2;
const FONT = "ui-rounded,'SF Pro Rounded','Arial Rounded MT Bold','Trebuchet MS',system-ui,sans-serif";
const OL_DEFAULT = '#2b1d14';
let OL = OL_DEFAULT;

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const ease = {
  out: t => 1 - (1 - t) * (1 - t),
  inout: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  back: t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = Math.random;
const ri = (a, b, r = rnd) => a + Math.floor(r() * (b - a + 1));
const pick = (arr, r = rnd) => arr[Math.floor(r() * arr.length)];
function shuffle(a, r = rnd) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---------- Speicherstand mit Konten (Autosave nach jedem Mini-Schritt) ----------
// Alles getrennt: pro Konto -> pro Schwierigkeitsstufe -> pro Stage eigene Münzen, Skins, Fortschritt.
const SAVE_KEY = 'mission_im_original_v3';   // v3: alle alten Konten auf den Geräten gelöscht (Neustart mit Server-Konten)
const OLD_KEYS = ['mission_im_original_v1', 'mission_im_original_v2'];
const Save = {
  data: null,
  defaults() { return { v: 2, seenTrailer: false, accounts: {}, current: null }; },
  load() {
    let d = null;
    try { const s = localStorage.getItem(SAVE_KEY); if (s) d = JSON.parse(s); } catch (e) { d = null; }
    this.data = d && d.v === 2 ? Object.assign(this.defaults(), d) : this.defaults();
    // alte Speicherstände entfernen, nur "Trailer gesehen" mitnehmen
    for (const k of OLD_KEYS) { try { const o = localStorage.getItem(k); if (o) { if (JSON.parse(o).seenTrailer) this.data.seenTrailer = true; localStorage.removeItem(k); } } catch (e) { /* egal */ } }
    if (this.data.current && !this.data.accounts[this.data.current]) this.data.current = null;
  },
  write(dirty = true) {
    const acc = ACC();
    if (dirty && acc && acc.token) { acc.changed = Date.now(); Net.soon(); }
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) { /* privater Modus */ }
  },
};
// ---------- Server-Anbindung: Konten zentral speichern, auf jedem Gerät anmelden ----------
const API_URL = 'https://mission-im-original.vercel.app/api/konto';
const Net = {
  st: 'idle', tm: null,
  async call(body, keep) {
    try {
      const r = await fetch(API_URL, { method: 'POST', keepalive: !!keep, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      let data = {}; try { data = await r.json(); } catch (e) { /* leer */ }
      return { status: r.status, data };
    } catch (e) { return null; }
  },
  dataOf(a) { return { tut: a.tut, recent: a.recent, recentEasy: a.recentEasy, diff: a.diff, sound: a.sound, soundV2: true, char: a.char || null, meta: a.meta || null, swingBest: a.swingBest || 0 }; },
  soon() { clearTimeout(this.tm); this.tm = setTimeout(() => this.syncNow(), 4000); },
  async syncNow(keep) {
    const a = ACC(); if (!a || !a.token) return;
    clearTimeout(this.tm); this.st = 'saving';
    const sent = Date.now();
    const r = await this.call({ action: 'save', login: a.login, token: a.token, avatar: a.avatar, data: this.dataOf(a) }, keep);
    if (r && r.status === 200) { a.synced = sent; this.st = 'ok'; Save.write(false); } else this.st = 'off';
  },
  // Beim Betreten eines Kontos: neuesten Stand vom Server holen (oder eigenen ungespeicherten Stand hochladen)
  async refresh() {
    const a = ACC(); if (!a || !a.token) return;
    if ((a.changed || 0) > (a.synced || 0)) { this.syncNow(); return; }
    const r = await this.call({ action: 'login', login: a.login });
    if (r && r.status === 200 && ACC() === a) { Object.assign(a, accFromServer(r.data), { synced: Date.now(), changed: 0 }); this.st = 'ok'; Save.write(false); }
    else if (!r) this.st = 'off';
  },
  status(a) {
    if (!a || !a.token) return { col: '#adb5bd', text: 'nur auf diesem Gerät' };
    if (this.st === 'off') return { col: '#ef476f', text: 'offline – wird später gespeichert' };
    if (this.st === 'saving' || (a.changed || 0) > (a.synced || 0)) return { col: '#ffd166', text: 'wird gespeichert …' };
    return { col: '#06d6a0', text: 'auf dem Server gespeichert' };
  },
};
setInterval(() => { const a = ACC(); if (a && a.token && (a.changed || 0) > (a.synced || 0)) Net.syncNow(); }, 30000);
function accFromServer(p) {
  const d = p.data || {}, diff = d.diff || {};
  ['easy', 'medium', 'hard'].forEach(k => { if (!diff[k]) diff[k] = {}; });
  return { name: p.name, code: p.code, login: p.login, token: p.token, avatar: p.avatar || 0, created: p.created || Date.now(), sound: d.soundV2 ? d.sound !== false : true, soundV2: true, char: d.char || null, tut: d.tut || {}, recent: d.recent || [], recentEasy: d.recentEasy || [], diff, meta: d.meta || undefined, swingBest: d.swingBest || 0 };
}
function adoptAccount(p) {
  Save.data.accounts[p.login] = Object.assign(accFromServer(p), { synced: Date.now(), changed: 0 });
  Save.data.current = p.login; Save.write(false); Net.st = 'ok';
}
function ACC() { return Save.data && Save.data.current ? Save.data.accounts[Save.data.current] : null; }
function loginCode() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 8; i++) s += A[Math.floor(rnd() * A.length)] + (i === 3 ? '-' : ''); return s; }
function createAccount(name, code) {
  const id = 'a' + Date.now().toString(36) + Math.floor(rnd() * 1e4).toString(36);
  Save.data.accounts[id] = { name, code, login: loginCode(), avatar: Math.floor(rnd() * 6), created: Date.now(), sound: true, soundV2: true, tut: {}, recent: [], recentEasy: [], diff: { easy: {}, medium: {}, hard: {} } };
  Save.data.current = id; Save.write(); return id;
}
function DP(diff) { const d = ACC().diff[diff]; if (!d.stages) d.stages = {}; if (d.equip === undefined) d.equip = null; return d; }
function SP(diff, stage = 'spielplatz') {
  const d = DP(diff);
  if (!d.stages[stage]) d.stages[stage] = { coins: 0, skins: [], speed: false, outfit: false, clears: 0, lastSkin: null, run: null };
  return d.stages[stage];
}

// ---------- Sound (standardmäßig stumm) ----------
// ---------- Vorlesen (für Kinder, die noch nicht lesen können) ----------
// Stimmen: jeder Text am Stück (flüssig), jede Figur mit eigener Stimme/Tonhöhe/Tempo
const VOICE_OF = {
  erzaehler: { pitch: 1.0, rate: 1.0, pick: 0 },
  hase: { pitch: 1.45, rate: 1.1, pick: 1 },      // Mia
  fuchs: { pitch: 1.15, rate: 1.05, pick: 2 },    // Paul
  igel: { pitch: 1.3, rate: 0.97, pick: 3 },      // Ida
  waschbaer: { pitch: 0.72, rate: 0.93, pick: 4 },// Willi
  eule: { pitch: 0.92, rate: 0.9, pick: 5 },      // Emma
  baer: { pitch: 0.6, rate: 0.92, pick: 6 },      // Chefkoch Bruno: ganz tief
  gate: { pitch: 0.85, rate: 0.95, pick: 0 },
  leo: { pitch: 1.3, rate: 1.1, pick: 2 },
};
// Vorlesen: zuerst echte Aufnahmen (assets/voice/<key>.mp3, siehe js/voiceclips.js) – lückenlos und mit eigener Stimme je Figur.
// Nur Texte ohne Aufnahme (z. B. mit Kontonamen) fallen auf die Browser-Stimme zurück.
const Voice = {
  last: '', list: null, gen: 0, onceKey: '', cancelT: 0, keep: null, src: null, loading: 0, bufs: new Map(),
  key(text, who = 'erzaehler') {   // FNV-1a über UTF-8 – gleiche Rechnung wie im Aufnahme-Werkzeug
    const b = new TextEncoder().encode(who + '|' + this.clean(text)); let h = 0x811c9dc5;
    for (const x of b) { h ^= x; h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  },
  async clip(k, gen) {
    try {
      const ctx = Sfx.ctx(); let buf = this.bufs.get(k);
      if (!buf) { this.loading++; const r = await fetch('assets/voice/' + k + '.mp3'); buf = await ctx.decodeAudioData(await r.arrayBuffer()); this.loading--; this.bufs.set(k, buf); if (this.bufs.size > 60) this.bufs.delete(this.bufs.keys().next().value); }
      if (gen !== this.gen) return;
      const s = ctx.createBufferSource(), g = ctx.createGain(); g.gain.value = 1; s.buffer = buf; s.connect(g).connect(ctx.destination);
      s.onended = () => { if (this.src === s) this.src = null; };
      this.src = s; s.start();
    } catch (e) { this.loading = Math.max(0, this.loading - 1); }
  },
  on() { const a = ACC(); return !a || a.sound !== false; },
  // deutsche Stimmen, die besten zuerst (Premium/Enhanced/Natural klingen viel flüssiger)
  voices() {
    if (this.list && this.list.length) return this.list;
    try {
      const vs = speechSynthesis.getVoices().filter(v => /^de/i.test(v.lang));
      const score = v => (/Premium|Enhanced|Natural|Neural|Online/i.test(v.name) ? 0 : /Google|Anna|Petra|Helena|Katja|Markus|Yannick|Viktor|Martin/i.test(v.name) ? 1 : 2) + (/^de(-|_)DE/i.test(v.lang) ? 0 : 0.5);
      this.list = vs.sort((a, b) => score(a) - score(b));
    } catch (e) { this.list = []; }
    return this.list;
  },
  clean(t) { return t.replace(/\s*[–—]\s*/g, ', ').replace(/→/g, ' ').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim(); },
  say(text, force, who = 'erzaehler') {
    if (!text || !this.on()) return;
    if (!force && text === this.last) return;
    this.last = text; const gen = ++this.gen;
    if (this.src) { try { this.src.stop(); } catch (e) { /* egal */ } this.src = null; }
    const k = this.key(text, who);
    if (typeof VOICE_CLIPS !== 'undefined' && VOICE_CLIPS.has(k)) { try { speechSynthesis.cancel(); } catch (e) { /* egal */ } this.clip(k, gen); return; }
    if (!('speechSynthesis' in window)) return;
    try {
      const busy = speechSynthesis.speaking || speechSynthesis.pending || performance.now() - this.cancelT < 200;
      if (busy) speechSynthesis.cancel();
      const go = () => {
        if (gen !== this.gen) return;
        const P = VOICE_OF[who] || VOICE_OF.erzaehler, L = this.voices();
        const u = new SpeechSynthesisUtterance(this.clean(text));
        u.lang = 'de-DE'; u.pitch = P.pitch; u.rate = P.rate;
        // gibt es mehrere gute deutsche Stimmen, bekommen die Figuren verschiedene
        if (L.length) try { const good = L.filter(v => !/^(Grandma|Grandpa|Eddy|Flo|Reed|Rocko|Sandy|Shelley)/i.test(v.name)); const pool = good.length ? good : L; u.voice = pool[P.pick % Math.min(pool.length, 3)] || pool[0]; } catch (e) { /* Standardstimme */ }
        speechSynthesis.speak(u);
        this.keepAlive();
      };
      busy ? setTimeout(go, 150) : go();   // direkt nach cancel() verschluckt Chrome sonst das neue Sprechen
    } catch (e) { /* kein Vorlesen möglich */ }
  },
  // Chrome (Computer) bricht lange Texte nach ~15 s ab – kurzes Pause/Weiter hält die Stimme wach, ohne hörbare Lücke
  keepAlive() {
    if (this.keep || !/Chrome/.test(navigator.userAgent) || /Android|Mobile/.test(navigator.userAgent)) return;
    this.keep = setInterval(() => { try { if (!speechSynthesis.speaking) { clearInterval(this.keep); this.keep = null; return; } speechSynthesis.pause(); speechSynthesis.resume(); } catch (e) { /* egal */ } }, 9000);
  },
  // für Texte, die in draw() stehen: nur einmal vorlesen, bis das Fenster zu ist (Voice.stop)
  once(text, who) { if (this.onceKey === text) return; this.onceKey = text; this.say(text, true, who); },
  busy() { if (!this.on()) return false; if (this.src || this.loading) return true; try { return 'speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending); } catch (e) { return false; } },
  stop() { this.last = ''; this.onceKey = ''; this.gen++; this.cancelT = performance.now(); if (this.src) { try { this.src.stop(); } catch (e) { /* egal */ } this.src = null; } try { speechSynthesis.cancel(); } catch (e) { /* egal */ } },
};
try { if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { Voice.list = null; }; } catch (e) { /* egal */ }

const Sfx = {
  ac: null,
  hook: null,
  on() { const acc = ACC(); return !(acc && acc.sound === false); },
  ctx() { if (!this.ac) this.ac = new (window.AudioContext || window.webkitAudioContext)(); if (this.ac.state === 'suspended') this.ac.resume(); return this.ac; },
  // einzelner Ton (für Combos, Countdown, Ticken)
  note(freq, dur = 0.12, type = 'triangle', vol = 0.08, slide = 1) {
    if (!this.on()) return;
    try {
      const c = this.ctx(), t = c.currentTime, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t); if (slide !== 1) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* kein Audio */ }
  },
  play(type) {
    if (this.hook) this.hook(type);
    const acc = ACC(); if (acc && acc.sound === false) return;
    try {
      if (!this.ac) this.ac = new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ac, t = c.currentTime;
      const P = {
        tap: [620, 0.06, 'sine', 1], good: [700, 0.18, 'triangle', 1.6], bad: [220, 0.22, 'square', 0.7],
        coin: [1250, 0.12, 'square', 1.3], win: [520, 0.5, 'triangle', 2], open: [380, 0.14, 'sine', 1.4],
        hit: [140, 0.25, 'sawtooth', 0.6], pop: [900, 0.08, 'sine', 0.5], jump: [400, 0.15, 'sine', 1.8],
      }[type] || [500, 0.1, 'sine', 1];
      const o = c.createOscillator(), g = c.createGain(), vary = type === 'win' ? 1 : 0.94 + Math.random() * 0.12;   // nie zweimal exakt gleich
      o.type = P[2];
      o.frequency.setValueAtTime(P[0] * vary, t);
      o.frequency.exponentialRampToValueAtTime(P[0] * P[3] * vary, t + P[1]);
      g.gain.setValueAtTime(0.09, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + P[1]);
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + P[1] + 0.02);
      if (type === 'win') setTimeout(() => this.play('good'), 180);
    } catch (e) { /* kein Audio */ }
  },
};
// Spannungs-Musik in den Aufgaben: Bass + Klick, das Tempo zieht an, wenn es eng wird
const Music = {
  on: false, bpm: 110, next: 0, step: 0, timer: null,
  start(bpm = 110) {
    this.bpm = bpm; if (this.on || !Sfx.on()) return;
    try { const c = Sfx.ctx(); this.on = true; this.next = c.currentTime + 0.05; this.step = 0; this.timer = setInterval(() => this.tick(), 50); } catch (e) { this.on = false; }
  },
  stop() { this.on = false; if (this.timer) clearInterval(this.timer); this.timer = null; },
  tempo(bpm) { this.bpm = clamp(bpm, 80, 190); },
  tick() {
    if (!this.on) return; if (!Sfx.on()) { this.stop(); return; }
    const c = Sfx.ac; if (!c) return;
    const PATS = [[110, 110, 131, 110, 98, 98, 147, 131], [131, 131, 165, 147, 110, 110, 98, 123], [98, 147, 131, 110, 123, 123, 165, 147]];
    const BASS = PATS[Math.floor(this.step / 64) % PATS.length];   // alle paar Takte eine neue Basslinie
    while (this.next < c.currentTime + 0.15) {
      const t = this.next, st = this.step % 16, beat = st % 2 === 0;
      const env = (o, g, vol, dur) => { g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02); };
      if (beat) { const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(BASS[(st / 2) | 0], t); env(o, g, 0.07, 0.16); }
      if (st % 4 === 0) { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); env(o, g, 0.12, 0.13); }
      { const o = c.createOscillator(), g = c.createGain(); o.type = 'square'; o.frequency.setValueAtTime(beat ? 5200 : 6400, t); env(o, g, beat ? 0.012 : 0.007, 0.03); }
      this.next += 60 / this.bpm / 2; this.step++;
    }
  },
};
function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* egal */ } }

// ---------- Zeichen-Helfer ----------
function rrPath(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function ell(c, x, y, rx, ry, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); }
function fs(c, fill, lw = 3, stroke) {
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (lw) { c.lineWidth = lw; c.strokeStyle = stroke || OL; c.stroke(); }
}
function starPath(c, x, y, R, r, n = 5, rot = -Math.PI / 2) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n, rr = i % 2 ? r : R;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
}
function heartPath(c, x, y, s) {
  c.beginPath();
  c.moveTo(x, y + s * 0.9);
  c.bezierCurveTo(x - s * 1.3, y + s * 0.1, x - s * 0.9, y - s * 1.0, x, y - s * 0.4);
  c.bezierCurveTo(x + s * 0.9, y - s * 1.0, x + s * 1.3, y + s * 0.1, x, y + s * 0.9);
  c.closePath();
}
function polyPath(c, pts) { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); }
function line(c, x1, y1, x2, y2, w, col, outline = true) {
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
  c.lineCap = 'round';
  if (outline) { c.lineWidth = w + 5; c.strokeStyle = OL; c.stroke(); }
  c.lineWidth = w; c.strokeStyle = col; c.stroke();
}
function txt(c, s, x, y, size, col = '#fff', align = 'center', ol = OL) {
  c.font = `900 ${size}px ${FONT}`;
  c.textAlign = align; c.textBaseline = 'middle'; c.lineJoin = 'round';
  if (ol) { c.lineWidth = Math.max(3, size * 0.2); c.strokeStyle = ol; c.strokeText(s, x, y); }
  c.fillStyle = col; c.fillText(s, x, y);
}
function panel(c, x, y, w, h, col = '#fbf8f2', r = 22) {
  c.save();
  c.fillStyle = 'rgba(0,0,0,.28)'; rrPath(c, x, y + 6, w, h, r); c.fill();
  rrPath(c, x, y, w, h, r); c.fillStyle = col; c.fill();
  c.save(); c.clip();
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(255,255,255,.3)'); g.addColorStop(0.3, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.09)');
  c.fillStyle = g; c.fillRect(x, y, w, h); c.restore();
  rrPath(c, x + 3.5, y + 3.5, w - 7, h - 7, Math.max(0, r - 3.5)); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.45)'; c.stroke();
  rrPath(c, x, y, w, h, r); c.lineWidth = 4; c.strokeStyle = OL; c.stroke();
  c.restore();
}
// Weiche Licht/Schatten-Rundung für runde Formen (Licht kommt von oben links)
function shadeEll(c, x, y, rx, ry, lw = 3) {
  c.save(); ell(c, x, y, rx, ry); c.clip();
  const g = c.createRadialGradient(x - rx * 0.4, y - ry * 0.5, rx * 0.1, x, y, Math.max(rx, ry) * 1.25);
  g.addColorStop(0, 'rgba(255,255,255,.38)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(60,30,10,.22)');
  c.fillStyle = g; c.fillRect(x - rx, y - ry, rx * 2, ry * 2); c.restore();
  if (lw) { ell(c, x, y, rx, ry); c.lineWidth = lw; c.strokeStyle = OL; c.stroke(); }
}
// Symbole mit Form + Farbe (Barrierefreiheit: nie nur Farbe)
const SYMS = [
  { s: 'circle', col: '#ef476f' }, { s: 'tri', col: '#118ab2' },
  { s: 'square', col: '#ffd166' }, { s: 'star', col: '#06d6a0' },
  { s: 'heart', col: '#f78c6b' }, { s: 'diamond', col: '#9b5de5' },
];
function symPath(c, s, x, y, r) {
  if (s === 'circle') ell(c, x, y, r, r);
  else if (s === 'tri') polyPath(c, [[x, y - r], [x + r * 0.95, y + r * 0.75], [x - r * 0.95, y + r * 0.75]]);
  else if (s === 'square') rrPath(c, x - r * 0.82, y - r * 0.82, r * 1.64, r * 1.64, r * 0.25);
  else if (s === 'star') starPath(c, x, y + r * 0.08, r * 1.1, r * 0.5);
  else if (s === 'heart') heartPath(c, x, y + r * 0.05, r * 0.95);
  else if (s === 'diamond') polyPath(c, [[x, y - r * 1.05], [x + r * 0.8, y], [x, y + r * 1.05], [x - r * 0.8, y]]);
}
function drawSym(c, i, x, y, r, lw = 3) { symPath(c, SYMS[i].s, x, y, r); fs(c, SYMS[i].col, lw); }

// ---------- Icons (alles ohne Text) ----------
function icon(c, name, x, y, s, col) {
  c.save(); c.translate(x, y); const k = s / 40; c.scale(k, k);
  c.lineJoin = 'round'; c.lineCap = 'round';
  switch (name) {
    case 'stop': ell(c, 0, 0, 19, 19); fs(c, '#e5383b', 3); rrPath(c, -7.5, -7.5, 15, 15, 3); fs(c, '#fff', 0); break;
    case 'coin':
      ell(c, 0, 0, 17, 17); fs(c, '#ffc300', 3); ell(c, 0, 0, 11.5, 11.5); fs(c, '#ffd60a', 2, '#d69e00');
      starPath(c, 0, 0.5, 6.5, 2.8); fs(c, '#e09f00', 0); break;
    case 'star': starPath(c, 0, 1, 19, 8.5); fs(c, col || '#ffd23f', 3); break;
    case 'starE': starPath(c, 0, 1, 19, 8.5); fs(c, 'rgba(255,255,255,.35)', 3); break;
    case 'lock':
      c.beginPath(); c.arc(0, -5, 9, Math.PI, 0); c.lineWidth = 9; c.strokeStyle = OL; c.stroke();
      c.lineWidth = 4.5; c.strokeStyle = '#ced4da'; c.stroke();
      rrPath(c, -14, -6, 28, 22, 5); fs(c, '#ffc300', 3); ell(c, 0, 3, 3, 4); fs(c, OL, 0); break;
    case 'check': c.beginPath(); c.moveTo(-14, 0); c.lineTo(-4, 10); c.lineTo(15, -11);
      c.lineWidth = 12; c.strokeStyle = OL; c.stroke(); c.lineWidth = 6; c.strokeStyle = col || '#fff'; c.stroke(); break;
    case 'cross':
      c.beginPath(); c.moveTo(-11, -11); c.lineTo(11, 11); c.moveTo(11, -11); c.lineTo(-11, 11);
      c.lineWidth = 12; c.strokeStyle = OL; c.stroke(); c.lineWidth = 6; c.strokeStyle = col || '#fff'; c.stroke(); break;
    case 'heart': heartPath(c, 0, 2, 17); fs(c, col || '#ff4d6d', 3); break;
    case 'heartE': heartPath(c, 0, 2, 17); fs(c, 'rgba(0,0,0,.25)', 3); break;
    case 'clock':
      ell(c, -10, -15, 5, 5); fs(c, '#ffd166', 2.5); ell(c, 10, -15, 5, 5); fs(c, '#ffd166', 2.5);
      ell(c, 0, 1, 17, 17); fs(c, '#fff', 3); line(c, 0, 1, 0, -9, 3, OL, false); line(c, 0, 1, 7, 4, 3, OL, false); break;
    case 'sound': case 'mute':
      c.beginPath(); c.arc(0, 2, 14, Math.PI, 0); c.lineWidth = 8; c.strokeStyle = OL; c.stroke(); c.lineWidth = 4; c.strokeStyle = '#e9ecef'; c.stroke();
      rrPath(c, -18, 0, 9, 16, 4); fs(c, '#4dabf7', 3); rrPath(c, 9, 0, 9, 16, 4); fs(c, '#4dabf7', 3);
      if (name === 'mute') { line(c, -16, -14, 16, 18, 4, '#e5383b'); } break;
    case 'cart':
      polyPath(c, [[-16, -10], [16, -10], [12, 6], [-11, 6]]); fs(c, '#ffd166', 3);
      line(c, -16, -10, -20, -17, 3, OL, false); ell(c, -8, 13, 4, 4); fs(c, '#495057', 2.5); ell(c, 8, 13, 4, 4); fs(c, '#495057', 2.5); break;
    case 'back': polyPath(c, [[-15, 0], [2, -15], [2, -6], [15, -6], [15, 6], [2, 6], [2, 15]]); fs(c, col || '#fff', 3); break;
    case 'home': polyPath(c, [[0, -16], [17, 0], [12, 0], [12, 15], [-12, 15], [-12, 0], [-17, 0]]); fs(c, col || '#fff', 3);
      rrPath(c, -4, 4, 8, 11, 2); fs(c, '#8d5a3b', 2); break;
    case 'retry':
      c.beginPath(); c.arc(0, 0, 12, -0.3, Math.PI * 1.55); c.lineWidth = 11; c.strokeStyle = OL; c.stroke();
      c.lineWidth = 5.5; c.strokeStyle = col || '#fff'; c.stroke();
      polyPath(c, [[9, -16], [17, -2], [3, -3]]); fs(c, col || '#fff', 2.5); break;
    case 'play': polyPath(c, [[-10, -15], [16, 0], [-10, 15]]); fs(c, col || '#fff', 3); break;
    case 'joker': // Joker-Karte mit Narrenkappe
      c.save(); c.rotate(-0.12); rrPath(c, -15, -20, 30, 40, 6); fs(c, '#ffd23f', 3); rrPath(c, -11, -16, 22, 32, 4); c.lineWidth = 1.5; c.strokeStyle = '#e09f00'; c.stroke();
      polyPath(c, [[-10, 6], [-12, -10], [-3, -2], [0, -14], [3, -2], [12, -10], [10, 6]]); fs(c, '#ef476f', 2.5);
      [[-12, -10, '#118ab2'], [0, -14, '#06d6a0'], [12, -10, '#118ab2']].forEach(([bx, by, bc]) => { ell(c, bx, by, 3, 3); fs(c, bc, 1.5); });
      rrPath(c, -10, 5, 20, 5, 2); fs(c, '#fff', 1.5); c.restore(); break;
    case 'jump': // Bogen-Pfeil nach oben
      c.beginPath(); c.moveTo(-14, 14); c.quadraticCurveTo(-12, -10, 8, -10); c.lineWidth = 7; c.strokeStyle = OL; c.stroke(); c.lineWidth = 4; c.strokeStyle = col || '#118ab2'; c.stroke();
      polyPath(c, [[4, -20], [18, -10], [4, 0]]); fs(c, col || '#118ab2', 2.5); break;
    case 'trophy':
      c.beginPath(); c.moveTo(-12, -14); c.lineTo(12, -14); c.quadraticCurveTo(12, 6, 0, 8); c.quadraticCurveTo(-12, 6, -12, -14); c.closePath(); fs(c, col || '#ffc300', 2.5);
      c.beginPath(); c.arc(-13, -6, 6, Math.PI * 0.5, Math.PI * 1.5); c.lineWidth = 3; c.strokeStyle = OL; c.stroke(); c.beginPath(); c.arc(13, -6, 6, -Math.PI * 0.5, Math.PI * 0.5); c.stroke();
      rrPath(c, -3, 7, 6, 7, 1); fs(c, col || '#ffc300', 2); rrPath(c, -9, 13, 18, 5, 2); fs(c, '#8d5a3b', 2); starPath(c, 0, -5, 5, 2.2); c.fillStyle = '#fff7ae'; c.fill(); break;
    case 'friends':
      ell(c, 8, -6, 7, 7); fs(c, '#74c0fc', 2.5); c.beginPath(); c.arc(8, 14, 11, Math.PI, 0); c.closePath(); fs(c, '#74c0fc', 2.5);
      ell(c, -7, -4, 8, 8); fs(c, '#ffd166', 2.5); c.beginPath(); c.arc(-7, 17, 12, Math.PI, 0); c.closePath(); fs(c, '#ffd166', 2.5); break;
    case 'shop':
      rrPath(c, -15, -4, 30, 20, 3); fs(c, '#fff', 2.5); polyPath(c, [[-18, -4], [-13, -16], [13, -16], [18, -4]]); fs(c, '#ef476f', 2.5);
      for (let i = 0; i < 3; i++) { line(c, -10 + i * 10, -15, -12 + i * 10, -5, 2, '#fff', false); } rrPath(c, -5, 4, 10, 12, 2); fs(c, '#8d5a3b', 2); break;
    case 'pause': rrPath(c, -12, -15, 9, 30, 3); fs(c, col || '#fff', 3); rrPath(c, 3, -15, 9, 30, 3); fs(c, col || '#fff', 3); break;
    case 'book':
      polyPath(c, [[0, -10], [-18, -15], [-18, 13], [0, 17]]); fs(c, '#fff', 3); polyPath(c, [[0, -10], [18, -15], [18, 13], [0, 17]]); fs(c, '#f1e3c8', 3);
      line(c, -13, -6, -4, -4, 2, '#adb5bd', false); line(c, -13, 0, -4, 2, 2, '#adb5bd', false); line(c, 4, -4, 13, -6, 2, '#adb5bd', false); line(c, 4, 2, 13, 0, 2, '#adb5bd', false); break;
    case 'shoe':
      polyPath(c, [[-16, -6], [-6, -6], [-2, 2], [14, 4], [16, 12], [-16, 12]]); fs(c, '#4dabf7', 3);
      polyPath(c, [[4, -18], [-4, -4], [3, -4], [-1, 6], [11, -9], [4, -9], [9, -18]]); fs(c, '#ffd60a', 2.5); break;
    case 'hourglass':
      polyPath(c, [[-11, -16], [11, -16], [2, 0], [11, 16], [-11, 16], [-2, 0]]); fs(c, '#e9ecef', 3);
      polyPath(c, [[-6, 12], [6, 12], [0, 4]]); fs(c, '#ffd166', 0); break;
    case 'question': txt(c, '?', 0, 2, 34, col || '#fff'); break;
    case 'search': ell(c, -4, -4, 11, 11); fs(c, '#bde0fe', 4); line(c, 4, 4, 15, 15, 5, '#8d5a3b'); break;
    case 'crown': polyPath(c, [[-16, 10], [-17, -10], [-8, -1], [0, -15], [8, -1], [17, -10], [16, 10]]); fs(c, '#ffd23f', 3);
      ell(c, 0, 3, 3, 3); fs(c, '#ef476f', 0); break;
    case 'bag': rrPath(c, -14, -8, 28, 24, 6); fs(c, '#f4a261', 3); c.beginPath(); c.arc(0, -8, 7, Math.PI, 0); c.lineWidth = 3; c.strokeStyle = OL; c.stroke(); break;
    case 'hanger': c.beginPath(); c.moveTo(0, -6); c.lineTo(-17, 8); c.lineTo(17, 8); c.closePath(); c.lineWidth = 8; c.strokeStyle = OL; c.stroke(); c.lineWidth = 4; c.strokeStyle = '#e9ecef'; c.stroke();
      c.beginPath(); c.arc(0, -11, 5, Math.PI, Math.PI * 2.4); c.lineWidth = 3; c.strokeStyle = OL; c.stroke(); break;
    case 'hand': drawHand(c, 0, 0, 1); break;
    case 'trash':
      rrPath(c, -12, -10, 24, 26, 4); fs(c, col || '#ef476f', 3); rrPath(c, -16, -16, 32, 7, 3); fs(c, col || '#ef476f', 3); rrPath(c, -5, -20, 10, 5, 2); fs(c, col || '#ef476f', 2.5);
      line(c, -5, -4, -5, 10, 2.5, '#fff', false); line(c, 5, -4, 5, 10, 2.5, '#fff', false); break;
    case 'puff': for (let i = 0; i < 5; i++) { ell(c, Math.cos(i * 1.3) * 10, Math.sin(i * 1.3) * 7, 8, 8); fs(c, '#dee2e6', 2.5); } break;
  }
  c.restore();
}
// Zeigehand für die wortlosen "Schau-her"-Hinweise
function drawHand(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.35);
  rrPath(c, -5, -2, 10, 26, 5); fs(c, '#ffe0c2', 3);
  rrPath(c, -12, 14, 26, 22, 9); fs(c, '#ffe0c2', 3);
  c.restore();
}

// ---------- Sofort-UI: Knöpfe werden jedes Bild neu registriert ----------
const UI = {
  btns: [], next: [],
  // Knopf-Fläche: berücksichtigt die aktuelle Skalierung (z. B. verkleinerte Dialoge im Querformat)
  btn(x, y, w, h, fn) {
    const m = ctx.getTransform(), d = DPR || 1;
    this.next.push({ x: (m.a * x + m.e) / d, y: (m.d * y + m.f) / d, w: (w * m.a) / d, h: (h * m.d) / d, fn });
  },
  flip() { this.btns = this.next; this.next = []; },
  hit(px, py) {
    for (let i = this.btns.length - 1; i >= 0; i--) {
      const b = this.btns[i];
      if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return b;
    }
    return null;
  },
};
function roundBtn(c, x, y, r, bg, ic, fn, icCol) {
  c.save();
  c.fillStyle = 'rgba(0,0,0,.3)'; ell(c, x, y + 4, r, r); c.fill();
  ell(c, x, y, r, r); c.fillStyle = bg; c.fill();
  const g = c.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.12)');
  c.fillStyle = g; ell(c, x, y, r, r); c.fill();
  ell(c, x - r * 0.3, y - r * 0.5, r * 0.42, r * 0.2, -0.3); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
  ell(c, x, y, r, r); c.lineWidth = 4; c.strokeStyle = OL; c.stroke();
  c.restore();
  icon(c, ic, x, y, r * 1.15, icCol);
  if (fn) UI.btn(x - r - 6, y - r - 6, r * 2 + 12, r * 2 + 12, fn);
}
function coinPill(c, x, y, n, h = 44) {
  const s = String(n);
  c.font = `900 ${h * 0.5}px ${FONT}`;
  const w = c.measureText(s).width + h * 1.35;
  panel(c, x - w, y, w, h, '#3d2c1f', h / 2);
  icon(c, 'coin', x - w + h * 0.5, y + h / 2, h * 0.75);
  txt(c, s, x - h * 0.35, y + h / 2 + 1, h * 0.5, '#ffd60a', 'right');
  return w;
}

// ---------- Vorgezeichnete Bilder (Sprites) für alles, was sich nicht bewegt ----------
const SPR = {};
function sprite(key, x0, y0, w, h, draw, q = 2) {
  let s = SPR[key];
  if (!s) {
    const cv = document.createElement('canvas'); cv.width = Math.ceil(w * q); cv.height = Math.ceil(h * q);
    const g = cv.getContext('2d'); g.scale(q, q); g.translate(-x0, -y0); g.lineJoin = 'round'; g.lineCap = 'round';
    draw(g); s = SPR[key] = { cv, x0, y0, w, h };
  }
  return s;
}
function drawSprite(c, s, alpha = 1) {
  if (alpha < 1) { const a = c.globalAlpha; c.globalAlpha = a * alpha; c.drawImage(s.cv, s.x0, s.y0, s.w, s.h); c.globalAlpha = a; }
  else c.drawImage(s.cv, s.x0, s.y0, s.w, s.h);
}
function clearSprites(prefix = '') { for (const k in SPR) if (k.startsWith(prefix)) delete SPR[k]; }
// Dialoge im Querformat passend verkleinern
function fitBegin(c, w, h) {
  const k = Math.min(1, (H - 12) / h, (W - 12) / w);
  c.save(); c.translate(W / 2, H / 2); c.scale(k, k); c.translate(-W / 2, -H / 2);
  return k;
}

// ---------- Partikel und Effekte (Bildschirmkoordinaten) ----------
const CONF = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#f78c6b', '#9b5de5', '#fff'];
const FX = {
  ps: [], fly: [],
  confetti(x, y, n = 40, power = 1) {
    for (let i = 0; i < n; i++) this.ps.push({
      x, y, vx: (rnd() - 0.5) * 520 * power, vy: (-rnd() * 480 - 120) * power, g: 900,
      life: 1.1 + rnd() * 0.7, t: 0, col: pick(CONF), s: 5 + rnd() * 5, rot: rnd() * 6, vr: (rnd() - 0.5) * 12, kind: 'c',
    });
  },
  sparkle(x, y, n = 10, col = '#fff7ae') {
    for (let i = 0; i < n; i++) {
      const a = rnd() * TAU, v = 60 + rnd() * 160;
      this.ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0, life: 0.5 + rnd() * 0.4, t: 0, col, s: 4 + rnd() * 5, rot: 0, vr: 0, kind: 's' });
    }
  },
  puff(x, y, n = 8) {
    for (let i = 0; i < n; i++) {
      const a = rnd() * TAU, v = 30 + rnd() * 70;
      this.ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, g: 0, life: 0.6 + rnd() * 0.3, t: 0, col: 'rgba(230,225,215,.9)', s: 10 + rnd() * 10, rot: 0, vr: 0, kind: 'p' });
    }
  },
  flyTo(x, y, tx, ty, draw, done, dur = 0.7) { this.fly.push({ x, y, tx, ty, draw, done, t: 0, dur }); },
  clear() { this.ps.length = 0; this.fly.length = 0; },
  update(dt) {
    for (const p of this.ps) { p.t += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; if (p.kind !== 'c') { p.vx *= 0.92; p.vy *= 0.92; } }
    this.ps = this.ps.filter(p => p.t < p.life);
    for (const f of this.fly) { f.t += dt; if (f.t >= f.dur && !f.fin) { f.fin = true; if (f.done) f.done(); } }
    this.fly = this.fly.filter(f => !f.fin);
  },
  draw(c) {
    for (const p of this.ps) {
      const a = 1 - p.t / p.life;
      c.save(); c.globalAlpha = clamp(a * 1.5, 0, 1); c.translate(p.x, p.y); c.rotate(p.rot);
      if (p.kind === 'c') { c.fillStyle = p.col; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
      else if (p.kind === 's') { starPath(c, 0, 0, p.s, p.s * 0.4, 4); c.fillStyle = p.col; c.fill(); }
      else { ell(c, 0, 0, p.s * (1.4 - a * 0.4), p.s * (1.4 - a * 0.4)); c.fillStyle = p.col; c.fill(); }
      c.restore();
    }
    for (const f of this.fly) {
      const t = ease.inout(clamp(f.t / f.dur, 0, 1));
      const x = lerp(f.x, f.tx, t), y = lerp(f.y, f.ty, t) - Math.sin(t * Math.PI) * 80;
      f.draw(c, x, y, 1 - t * 0.3);
    }
  },
};
