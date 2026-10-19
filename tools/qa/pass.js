// Passwort-Konten: Anlegen, Anmelden, falsches Passwort, altes Bilder-Code-Konto umstellen, Löschen – gegen einen Test-Server im Arbeitsspeicher
const { open, sleep } = require('./common');
const Module = require('module'), store = {}, orig = Module._load;
Module._load = function (r, ...a) { if (r === '@vercel/blob') return { put: async (p, body) => { store[p] = body; }, get: async p => store[p] ? { statusCode: 200, stream: new Blob([store[p]]).stream() } : null, del: async ps => [].concat(ps).forEach(p => delete store[p]), list: async () => ({ blobs: [] }) }; return orig.call(this, r, ...a); };
process.env.TOKEN_SECRET = 'qa'; process.env.SUPABASE_URL = ''; const api = require('../../api/konto.js');
const call = b => new Promise(res => api({ method: 'POST', body: b, headers: {} }, { setHeader() {}, status(c) { this.c = c; return this; }, json(d) { res([this.c, d]); }, end() { res([this.c, {}]); } }));
(async () => {
  const { b, p, errs } = await open({ dpr: 1 }); p.on('console', () => {}); const bad = [], log = { push: s => console.log(s), join: () => "" };
  await p.setRequestInterception(true);
  p.on('request', async q => { if (!/api\/konto/.test(q.url())) return q.continue(); if (q.method() === 'OPTIONS') return q.respond({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' } }); const [c, d] = await call(JSON.parse(q.postData() || '{}')); q.respond({ status: c, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(d) }); });
  const ev = (f, a) => p.evaluate(f, a), sc = () => ev(() => scene.constructor.name + (overlay ? '/' + overlay.constructor.name : ''));
  const typeIn = async (sel, v) => { await ev(s => { const e = s === 'name' ? nameInput : passInput; e.value = ''; e.focus(); }, sel); await p.keyboard.type(v); };
  const clickCheck = async () => { const pt = await ev(() => { const B = UI.btns || UI.list || []; return null; }); };
  // 1) neues Konto
  await ev(() => { Save.data.accounts = {}; Save.data.current = null; setScene(new NewAccount()); }); await sleep(400);
  await typeIn('name', 'Pass Tester'); await ev(() => scene.draw && 0);
  await ev(() => { scene.name = nameInput.value.trim(); nameInput.style.display = 'none'; scene.step = 'pass'; }); await sleep(300);
  await typeIn('pass', 'abc'); await sleep(200); log.push('zu kurz: Knopf aus = ' + await ev(() => passInput.value.length < PASS_MIN));
  await typeIn('pass', 'sonne123'); await sleep(200); await ev(() => scene.register(passInput.value)); await sleep(800);
  const a1 = await ev(() => { const a = ACC(); return a && { name: a.name, hasPass: a.hasPass, token: !!a.token, code: a.code }; }); log.push('angelegt: ' + JSON.stringify(a1)); if (!a1 || !a1.hasPass || !a1.token) bad.push('Anlegen');
  await p.screenshot({ path: process.env.OUT + '/p_done.png' });
  // 2) abmelden, falsches + richtiges Passwort
  await ev(() => { Save.data.accounts = {}; Save.data.current = null; setScene(new LoginScene()); scene.setMode('name'); }); await sleep(400);
  await typeIn('name', 'pass tester'); await typeIn('pass', 'falsch99'); await sleep(200); await p.screenshot({ path: process.env.OUT + '/p_login.png' });
  await ev(() => { scene.busy = true; scene.loginName = nameInput.value.trim(); Net.call({ action: 'login', name: nameInput.value.trim(), pass: passInput.value }).then(r => scene.done(r)); }); await sleep(800);
  const e1 = await ev(() => scene.err); log.push('falsch: ' + e1); if (!/stimmt nicht/.test(e1)) bad.push('Falsches Passwort');
  await typeIn('name', 'Pass Tester'); await typeIn('pass', 'sonne123'); await sleep(400);
  // echter Klick auf den grünen Haken
  const yy = await ev(() => { const w = Math.min(W - 28, 420), y = H < 560 ? 12 : 110; return y + 266; }); await p.mouse.click(422, yy); await sleep(1200);
  log.push('richtig: ' + await sc()); if (!/Menu|CharSelect/.test(await sc())) bad.push('Anmelden mit Passwort');
  // 3) altes Konto mit Bilder-Code
  await call({ action: 'register', name: 'Oldie', code: [1, 2, 3, 4] });
  await ev(() => { Save.data.accounts = {}; Save.data.current = null; setScene(new LoginScene()); scene.setMode('name'); }); await sleep(400);
  await typeIn('name', 'Oldie'); await typeIn('pass', 'irgendwas'); await sleep(400); await p.mouse.click(422, yy); await sleep(900);
  log.push('altes Konto mit Passwort: ' + await sc() + ' err=' + await ev(() => scene.err + ' busy=' + scene.busy + ' name=' + nameInput.value + ' pl=' + passInput.value.length)); if (!/CodePad/.test(await sc())) bad.push('altes Konto fragt nicht nach Code');
  await ev(() => overlay.o.onDone([1, 2, 3, 4])); await sleep(1800);
  log.push('nach Code: ' + await sc()); await p.screenshot({ path: process.env.OUT + '/p_set.png' });
  if (!/PassDialog/.test(await sc())) bad.push('kein Passwort-Festlegen nach Code-Login');
  await typeIn('pass', 'neuespass'); await ev(() => overlay.submit()); await sleep(900);
  log.push('festgelegt: hasPass=' + await ev(() => ACC().hasPass));
  const [c3] = await call({ action: 'login', name: 'Oldie', pass: 'neuespass' }); log.push('Server Oldie mit Passwort: ' + c3); if (c3 !== 200) bad.push('neues Passwort geht nicht');
  // 4) löschen mit Passwort
  await ev(() => { overlay = null; askDelete(Save.data.current, ACC()); }); await sleep(300); log.push('löschen fragt: ' + await sc());
  await typeIn('pass', 'neuespass'); await ev(() => overlay.submit()); await sleep(900); log.push('dann: ' + await sc());
  await ev(() => overlay.o.onYes()); await sleep(900);
  const [c4] = await call({ action: 'login', name: 'Oldie', pass: 'neuespass' }); log.push('nach Löschen Server: ' + c4); if (c4 !== 404) bad.push('Löschen');
  log.push('Klartext im Speicher: ' + (Object.values(store).some(v => /sonne123|neuespass/.test(String(v))) ? 'JA!' : 'nein'));
  console.log(log.join('\n')); console.log(bad.length ? 'PROBLEME: ' + bad.join(', ') : 'ALLES OK'); console.log('ERR', [...new Set(errs)].join(' / ') || 'none'); await b.close();
})();
