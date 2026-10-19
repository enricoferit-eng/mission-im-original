// Freunde per Freundes-Code + Anfrage (gegen einen Test-Server im Arbeitsspeicher)
const { open, sleep } = require('./common');
const Module = require('module'), store = {}, orig = Module._load;
Module._load = function (r, ...a) { if (r === '@vercel/blob') return { put: async (p, body) => { store[p] = body; }, get: async p => store[p] ? { statusCode: 200, stream: new Blob([store[p]]).stream() } : null, del: async ps => [].concat(ps).forEach(p => delete store[p]), list: async () => ({ blobs: [] }) }; return orig.call(this, r, ...a); };
process.env.TOKEN_SECRET = 'qa'; const api = require('../../api/konto.js');
const call = b => new Promise(res => api({ method: 'POST', body: b, headers: {} }, { setHeader() {}, status(c) { this.c = c; return this; }, json(d) { res([this.c, d]); }, end() { res([this.c, {}]); } }));
(async () => {
  const bad = [], log = s => console.log(s);
  const [, A] = await call({ action: 'register', name: 'Anna', pass: 'anna123' }), [, B] = await call({ action: 'register', name: 'Ben', pass: 'ben1234' });
  const au = { login: A.login, token: A.token }, bu = { login: B.login, token: B.token };
  log('alter Weg über Namen: ' + (await call({ action: 'friend_add', ...bu, name: 'Anna' }))[0]);
  const [, fa] = await call({ action: 'friends', ...au }); log('Annas Code: ' + fa.myCode); if (!/^[A-Z0-9]{6}$/.test(fa.myCode)) bad.push('kein Code');
  if (fa.myCode === A.login.replace('-', '').slice(0, 6)) bad.push('Code = Login');
  const [c1, r1] = await call({ action: 'friend_request', ...bu, fcode: fa.myCode.toLowerCase() }); log('Ben fragt an: ' + c1 + ' ' + r1.result);
  const [, fb1] = await call({ action: 'friends', ...bu }); if (fb1.friends.length) bad.push('schon befreundet vor Annahme');
  // Anna im Spiel: Anfrage sehen und annehmen
  const { b, p, errs } = await open({ dpr: 1 });
  await p.setRequestInterception(true);
  p.on('request', async q => { if (!/api\/konto/.test(q.url())) return q.continue(); if (q.method() === 'OPTIONS') return q.respond({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' } }); const [c, d] = await call(JSON.parse(q.postData() || '{}')); q.respond({ status: c, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(d) }); });
  await p.evaluate(A => { adoptAccount(A); ACC().char = 'cat'; setScene(new MultiScene()); }, A); await sleep(1500);
  await p.screenshot({ path: process.env.OUT + '/f_req.png' });
  const seen = await p.evaluate(() => scene.data && scene.data.requests.map(r => r.name).join(',')); log('Anna sieht Anfrage von: ' + seen); if (seen !== 'Ben') bad.push('Anfrage nicht sichtbar');
  await p.evaluate(() => scene.answer(scene.data.requests[0], true)); await sleep(800);
  const [, fb2] = await call({ action: 'friends', ...bu }); log('Ben hat Freunde: ' + fb2.friends.map(f => f.name)); if (fb2.friends.length !== 1) bad.push('nach Annahme nicht befreundet');
  await p.evaluate(() => { scene.mode = 'add'; }); await sleep(500); await p.screenshot({ path: process.env.OUT + '/f_add.png' });
  // Ablehnen
  const [, C] = await call({ action: 'register', name: 'Cara', pass: 'cara123' }); await call({ action: 'friend_request', login: C.login, token: C.token, fcode: fa.myCode });
  await p.evaluate(() => { scene.mode = 'menu'; scene.refresh(); }); await sleep(800); await p.evaluate(() => scene.answer(scene.data.requests[0], false)); await sleep(600);
  const [, fc] = await call({ action: 'friends', login: C.login, token: C.token }); log('Cara nach Nein: ' + fc.friends.length + ' Freunde'); if (fc.friends.length) bad.push('Ablehnen');
  console.log(bad.length ? 'PROBLEME: ' + bad.join(', ') : 'ALLES OK'); console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
