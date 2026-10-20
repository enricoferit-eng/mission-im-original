// Sicherheit: kein fremder Login-Code in Antworten, Passwort ändern/löschen nur mit Passwort, Sperre nur fürs ratende Netz, Namen-Filter
const Module = require('module'), store = {}, orig = Module._load;
Module._load = function (r, ...a) { if (r === '@vercel/blob') return { put: async (p, body) => { store[p] = body; }, get: async p => store[p] ? { statusCode: 200, stream: new Blob([store[p]]).stream() } : null, del: async ps => [].concat(ps).forEach(p => delete store[p]), list: async () => ({ blobs: [] }) }; return orig.call(this, r, ...a); };
process.env.TOKEN_SECRET = 'qa'; const api = require('../../api/konto.js');
const call = (b, ip = '1.1.1.1') => new Promise(res => api({ method: 'POST', body: b, headers: { 'x-forwarded-for': ip } }, { setHeader() {}, status(c) { this.c = c; return this; }, json(d) { res([this.c, d]); }, end() { res([this.c, {}]); } }));
(async () => {
  const bad = [], log = s => console.log(s);
  const [, K] = await call({ action: 'register', name: 'Kind', pass: 'kind123' }), [, A] = await call({ action: 'register', name: 'Angreifer', pass: 'boese12' });
  const kid = K.login.replace('-', ''), ka = { login: K.login, token: K.token }, aa = { login: A.login, token: A.token };
  const seen = [];   // alles, was der Angreifer zu sehen bekommt
  const watch = r => { seen.push(JSON.stringify(r[1])); return r; };
  const [, fk] = await call({ action: 'friends', ...ka });
  watch(await call({ action: 'friend_request', ...ka, fcode: (await call({ action: 'friends', ...aa }))[1].myCode }));   // Kind fragt Angreifer an
  const fa = watch(await call({ action: 'friends', ...aa }))[1]; log('Anfrage beim Angreifer: ' + JSON.stringify(fa.requests));
  watch(await call({ action: 'friend_answer', ...aa, from: fa.requests[0].id, yes: true }));
  watch(await call({ action: 'friends', ...aa }));
  const [, lob] = await call({ action: 'lobby_new', ...ka, opts: { mode: 'duell', size: 2 } }); watch(await call({ action: 'lobby_join', ...aa, code: lob.code }));
  watch(await call({ action: 'lobby_poll', ...aa, code: lob.code }));
  const leak = seen.some(t => t.toUpperCase().replace(/-/g, '').includes(kid)); log('Login-Code des Kindes beim Angreifer gesehen: ' + (leak ? 'JA' : 'nein')); if (leak) bad.push('Login-Code sichtbar');
  // Passwort ändern / löschen ohne Passwort
  const [c1] = await call({ action: 'set_pass', ...ka, pass: 'neues12' }); log('Passwort ändern ohne altes: ' + c1); if (c1 === 200) bad.push('set_pass ohne altes');
  const [c2] = await call({ action: 'set_pass', ...ka, pass: 'neues12', old: 'kind123' }); log('mit altem: ' + c2); if (c2 !== 200) bad.push('set_pass mit altem');
  const [c3] = await call({ action: 'delete', ...ka }); log('Löschen ohne Passwort: ' + c3); if (c3 === 200) bad.push('delete ohne Passwort');
  // Sperre: Angreifer rät 6× falsch – das Kind kommt von seinem Netz trotzdem rein
  for (let i = 0; i < 6; i++) await call({ action: 'login', name: 'Kind', pass: 'falsch' + i }, '6.6.6.6');
  const [c4] = await call({ action: 'login', name: 'Kind', pass: 'falsch9' }, '6.6.6.6'), [c5] = await call({ action: 'login', name: 'Kind', pass: 'neues12' }, '1.1.1.1');
  log('Angreifer-Netz gesperrt: ' + c4 + ', Kind kommt rein: ' + c5); if (c4 !== 429 || c5 !== 200) bad.push('Sperre');
  for (const n of ['Arsch Kopf', 'F1ck Dich', 'Lustige Socke']) { const [c] = await call({ action: 'register', name: n, pass: 'abc123' }); log('Name „' + n + '“: ' + c); if ((c === 200) === /Arsch|F1ck/.test(n)) bad.push('Namen-Filter ' + n); }
  const [c6] = await call({ action: 'delete', ...ka, pass: 'neues12' }); log('Löschen mit Passwort: ' + c6); if (c6 !== 200) bad.push('delete mit Passwort');
  console.log(bad.length ? 'PROBLEME: ' + bad.join(', ') : 'ALLES OK');
})();
