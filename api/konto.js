// Konten-Server für "Mission: Im Original"
// Speichert Konten privat in Vercel Blob (Region Frankfurt). Keine E-Mail, keine echten Personendaten.
const { put, get, del, list } = require('@vercel/blob');
const crypto = require('crypto');

const SECRET = process.env.TOKEN_SECRET || '';
const PRIV = { access: 'private' };
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_FAILS = 5, LOCK_MS = 10 * 60 * 1000;

const nameKey = n => String(n || '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
const nameFile = nk => 'names/' + crypto.createHash('sha256').update(nk).digest('hex').slice(0, 40) + '.json';
const accFile = login => 'accounts/' + login + '.json';
const tokenOf = login => crypto.createHmac('sha256', SECRET).update('konto:' + login).digest('hex');
const sameStr = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const cleanLogin = l => String(l || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const fmtLogin = l => (/^\d{6}$/.test(l) ? l : l.slice(0, 4) + '-' + l.slice(4, 8));   // neu: 6 Ziffern; alte Konten: 8 Zeichen mit Strich
// Fehlversuche beim Anmelden per Login-Code: je Gerät/IP gezählt – zu viele = 30 Minuten Pause (6 Ziffern sind sonst zu leicht durchzuprobieren)
const CODE_FAILS = 15, CODE_LOCK_MS = 30 * 60 * 1000;
const ipFile = ip => 'ipfail/' + crypto.createHash('sha256').update(SECRET + ':' + ip).digest('hex').slice(0, 32) + '.json';
// Namen-Filter: keine Schimpfwörter (auch mit Ziffern statt Buchstaben oder Leerzeichen dazwischen)
const BAD = ['arsch', 'fick', 'fuck', 'scheiss', 'scheiß', 'shit', 'hure', 'nutte', 'wichs', 'fotze', 'schlampe', 'bitch', 'hurensohn', 'penis', 'vagina', 'nazi', 'hitler', 'idiot', 'spast', 'behindert', 'schwuchtel', 'kacke', 'pisse', 'titten', 'sex', 'porno', 'dick', 'cock', 'pussy', 'kanake', 'neger', 'nigga', 'nigger', 'missgeburt', 'opfer', 'depp', 'trottel', 'blöd'];
const nameBad = n => { const t = String(n).toLowerCase().replace(/0/g, 'o').replace(/1|!/g, 'i').replace(/3/g, 'e').replace(/4|@/g, 'a').replace(/5|\$/g, 's').replace(/7/g, 't').replace(/[^a-zäöüß]/g, ''); return BAD.some(w => t.includes(w)); };
const validCode = c => Array.isArray(c) && c.length === 4 && c.every(v => Number.isInteger(v) && v >= 0 && v <= 5);
// Passwörter: nur als scrypt-Hash mit eigenem Salz gespeichert, nie im Klartext und nie zurückgegeben
const PASS_MIN = 6;
const validPass = p => typeof p === 'string' && p.length >= PASS_MIN && p.length <= 64;
const hashPass = p => { const s = crypto.randomBytes(16).toString('hex'); return { s, h: crypto.scryptSync(p, s, 32).toString('hex') }; };
const passOk = (acc, p) => !!(acc.pw && typeof p === 'string' && p.length <= 64 && sameStr(crypto.scryptSync(p, acc.pw.s, 32).toString('hex'), acc.pw.h));

// Speicher: Supabase (Tabelle "kv"), wenn eingerichtet – sonst Vercel Blob
const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, ''), SB_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SB = !!(SB_URL && SB_KEY);
const sbH = extra => ({ apikey: SB_KEY, ...(SB_KEY.startsWith('sb_') ? {} : { Authorization: 'Bearer ' + SB_KEY }), 'Content-Type': 'application/json', ...extra });   // neue Schlüssel (sb_secret_…) nur im apikey-Kopf
async function sb(method, q, body, extra) {
  const r = await fetch(SB_URL + '/rest/v1/kv' + q, { method, headers: sbH(extra), body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error('supabase ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const txt = await r.text(); return txt ? JSON.parse(txt) : null;
}
async function readJSON(path) {
  if (SB) { const rows = await sb('GET', '?select=val&path=eq.' + encodeURIComponent(path)); return rows && rows[0] ? rows[0].val : null; }
  try {
    const r = await get(path, { ...PRIV, useCache: false });
    if (!r || r.statusCode !== 200) return null;
    return JSON.parse(await new Response(r.stream).text());
  } catch (e) { if (e && e.name === 'BlobNotFoundError') return null; throw e; }
}
async function writeJSON(path, obj) {
  if (SB) { await sb('POST', '', { path, val: obj, updated: new Date().toISOString() }, { Prefer: 'resolution=merge-duplicates,return=minimal' }); return; }
  await put(path, JSON.stringify(obj), { ...PRIV, allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60 });
}
async function delJSON(paths) {
  if (SB) { await sb('DELETE', '?path=in.(' + paths.map(p => '"' + p + '"').join(',') + ')', null, { Prefer: 'return=minimal' }); return; }
  await del(paths);
}
async function listJSON(prefix) {   // alle Pfade mit diesem Anfang
  if (SB) { const rows = await sb('GET', '?select=path&path=like.' + encodeURIComponent(prefix + '*')); return rows.map(r => r.path); }
  const files = []; let cursor;
  do { const r = await list({ prefix, cursor, limit: 1000 }); files.push(...r.blobs); cursor = r.hasMore ? r.cursor : undefined; } while (cursor);
  return files.map(f => f.pathname);
}
function publicAcc(login, acc) {
  return { login: fmtLogin(login), token: tokenOf(login), name: acc.name, hasPass: !!acc.pw, avatar: acc.avatar, created: acc.created, data: acc.data || {}, admin: !!acc.admin };   // Bilder-Code/Passwort gehen nie zurück
}

async function register(b) {
  const name = String(b.name || '').trim().slice(0, 14), nk = nameKey(name);
  if (nk.length < 2) return [400, { error: 'name_short' }];
  if (nameBad(name)) return [400, { error: 'name_bad' }];
  const codeOnly = !!b.codeOnly;   // neu: Konto nur mit 6-stelligem Login-Code (kein Passwort, Name muss nicht einmalig sein)
  if (!codeOnly && (b.pass !== undefined ? !validPass(b.pass) : !validCode(b.code))) return [400, { error: b.pass !== undefined ? 'pass' : 'code' }];   // Passwort/Bilder-Code nur noch für alte Spiel-Versionen
  if (!codeOnly && (await readJSON(nameFile(nk)))) return [409, { error: 'name_taken' }];
  let login = '';
  for (let i = 0; i < 20; i++) {
    login = codeOnly ? String(crypto.randomInt(100000, 1000000)) : Array.from(crypto.randomBytes(8), x => CODE_CHARS[x % CODE_CHARS.length]).join('');
    if (!(await readJSON(accFile(login)))) break;
    if (i === 19) return [503, { error: 'busy' }];
  }
  const acc = { name, nk, ...(codeOnly ? { codeOnly: true } : b.pass !== undefined ? { pw: hashPass(b.pass) } : { code: b.code }), avatar: Number(b.avatar) % 6 || 0, created: Date.now(), updated: Date.now(), data: {}, fails: 0, lockUntil: 0 };
  await writeJSON(accFile(login), acc);
  if (!codeOnly) await writeJSON(nameFile(nk), { login });
  return [200, publicAcc(login, acc)];
}

async function login(b) {
  if (b.login) {
    const now = Date.now(), f = ipFile(b._ip || '-'), st = (await readJSON(f)) || { n: 0, until: 0, at: now };
    if (st.until > now) return [429, { error: 'locked', wait: Math.ceil((st.until - now) / 60000) }];
    const l = cleanLogin(b.login), acc = (l.length === 8 || /^\d{6}$/.test(l)) && (await readJSON(accFile(l)));
    if (!acc) {
      if (now - st.at > 3600000) { st.n = 0; st.at = now; }   // Zähler gilt eine Stunde
      st.n++; if (st.n >= CODE_FAILS) { st.n = 0; st.until = now + CODE_LOCK_MS; } await writeJSON(f, st);
      return [404, { error: 'not_found' }];
    }
    return [200, publicAcc(l, acc)];
  }
  const nk = nameKey(b.name), idx = nk && (await readJSON(nameFile(nk)));
  if (!idx) return [404, { error: 'not_found' }];
  const acc = await readJSON(accFile(idx.login));
  if (!acc) return [404, { error: 'not_found' }];
  const now = Date.now(), ip = b._ip || '-', F = acc.failIp = Object.fromEntries(Object.entries(acc.failIp || {}).filter(([, v]) => v.until > now || now - v.at < 3600000)), mine = F[ip] || (F[ip] = { n: 0, until: 0, at: now });
  if (mine.until > now) return [429, { error: 'locked', wait: Math.ceil((mine.until - now) / 60000) }];   // gesperrt wird nur, wer falsch geraten hat
  if (!acc.pw && b.pass !== undefined && b.code === undefined) return [401, { error: 'need_code' }];   // altes Konto: einmal noch mit dem Bilder-Code, dann Passwort festlegen
  const ok = acc.pw ? passOk(acc, b.pass) : validCode(b.code) && Array.isArray(acc.code) && b.code.join() === acc.code.join();
  if (!ok) {
    mine.n++; mine.at = now; if (mine.n >= MAX_FAILS) { mine.n = 0; mine.until = now + LOCK_MS; }
    await writeJSON(accFile(idx.login), acc);
    return [401, { error: acc.pw ? 'wrong_pass' : 'wrong_code' }];
  }
  if (F[ip] && F[ip].n) { delete F[ip]; await writeJSON(accFile(idx.login), acc); }
  return [200, publicAcc(idx.login, acc)];
}

async function authed(b) {
  const l = cleanLogin(b.login);
  if (l.length !== 8 || !b.token || !sameStr(b.token, tokenOf(l))) return null;
  const acc = await readJSON(accFile(l));
  return acc ? { l, acc } : null;
}

async function save(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  const data = b.data && typeof b.data === 'object' ? b.data : {};
  if (JSON.stringify(data).length > 200000) return [413, { error: 'too_big' }];
  a.acc.data = data; a.acc.updated = Date.now();
  if (Number.isInteger(b.avatar)) a.acc.avatar = b.avatar % 6;
  await writeJSON(accFile(a.l), a.acc);
  return [200, { ok: true, updated: a.acc.updated }];
}

async function set_pass(b) {   // Passwort festlegen oder ändern (angemeldet); ersetzt den Bilder-Code
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  if (!validPass(b.pass)) return [400, { error: 'pass' }];
  if (a.acc.pw && !passOk(a.acc, b.old)) return [401, { error: 'wrong_pass' }];   // wer schon ein Passwort hat, muss das alte kennen
  a.acc.pw = hashPass(b.pass); delete a.acc.code; a.acc.fails = 0; a.acc.lockUntil = 0;
  await writeJSON(accFile(a.l), a.acc);
  return [200, { ok: true }];
}

async function remove(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  if (a.acc.pw && !passOk(a.acc, b.pass)) return [403, { error: 'wrong_pass' }];   // Löschen nur mit Passwort
  await delJSON([accFile(a.l), nameFile(a.acc.nk), fcodeFile(fcodeOf(a.l)), reqFile(a.l)]);
  return [200, { ok: true }];
}

// Besitzer-Statistik: nur zusammengefasste, anonyme Zahlen – keine einzelnen Konten
// ---------- Freunde + Mehrspieler (Duell über Lobby-Code, "Fortschritt vergleichen") ----------
// Eigene Dateien (nicht im Konto), damit das normale Speichern nichts überschreibt
const friendsFile = l => 'friends/' + l + '.json', invFile = l => 'invites/' + l + '.json', seenFile = l => 'seen/' + l + '.json';
const lobbyFile = c => 'lobbies/' + c + '.json', progFile = (c, l) => 'lobbies/' + c + '/' + l + '.json';
const LOBBY_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
// Freundes-Code: 6 Zeichen, nur zum Finden (gibt keinen Zugang zum Konto – anders als der Login-Code); Freundschaft erst, wenn der andere die Anfrage annimmt
const fcodeFile = c => 'fcodes/' + c + '.json', reqFile = l => 'freq/' + l + '.json';
const fcodeOf = l => Array.from(crypto.createHmac('sha256', SECRET).update('freund:' + l).digest().subarray(0, 6), x => CODE_CHARS[x % CODE_CHARS.length]).join('');
async function myFcode(l) { const c = fcodeOf(l), idx = await readJSON(fcodeFile(c)); if (!idx || idx.login !== l) await writeJSON(fcodeFile(c), { login: l }); return c; }
async function addFriendPair(l1, acc1, l2, acc2) {
  const add = async (l, who) => { const f = (await readJSON(friendsFile(l))) || { list: [] }; if (!f.list.some(x => cleanLogin(x.login) === cleanLogin(who.login)) && f.list.length < 50) f.list.push(who); await writeJSON(friendsFile(l), f); };
  await add(l1, pub(l2, acc2)); await add(l2, pub(l1, acc1));
}
async function dropRequest(l, from) { const R = await readJSON(reqFile(l)); if (R && R.list.some(x => cleanLogin(x.login) === from)) { R.list = R.list.filter(x => cleanLogin(x.login) !== from); await writeJSON(reqFile(l), R); } }
const pub = (l, acc) => ({ login: fmtLogin(l), name: acc.name, avatar: acc.avatar || 0 });   // nur intern gespeichert – nie so an andere schicken
// Was andere Spieler über ein Konto sehen: Name, Tierbild und eine Kennung, mit der man sich NICHT anmelden kann (der Login-Code bleibt geheim)
const pidOf = l => crypto.createHmac('sha256', SECRET).update('pub:' + cleanLogin(l)).digest('hex').slice(0, 16);
const pubOut = x => (x ? { id: pidOf(x.login), name: x.name, avatar: x.avatar || 0 } : null);
function lobbyOut(lob) {   // Lobby ohne Login-Codes
  const o = Object.assign({}, lob); o.players = (lob.players || []).map(pubOut); o.host = pubOut(lob.host); o.guest = pubOut(lob.guest);
  o.gone = (lob.gone || []).map(pidOf); if (lob.left) o.left = pidOf(lob.left); return o;
}
async function touch(l, score) { const o = { t: Date.now() }; if (Number.isInteger(score) && score >= 0 && score < 10000) o.score = score; else { const old = await readJSON(seenFile(l)).catch(() => null); if (old && old.score != null) o.score = old.score; } await writeJSON(seenFile(l), o); }
async function friendList(l) {
  const f = (await readJSON(friendsFile(l))) || { list: [] };
  const out = await Promise.all(f.list.map(async x => { const s = await readJSON(seenFile(cleanLogin(x.login))).catch(() => null); return { ...pubOut(x), online: !!(s && Date.now() - s.t < 90000), score: (s && s.score) || 0 }; }));   // score: für die Freundes-Bestenliste
  const inv = ((await readJSON(invFile(l))) || { list: [] }).list.filter(i => Date.now() - i.at < 15 * 60000);
  const requests = ((await readJSON(reqFile(l))) || { list: [] }).list.map(x => ({ ...pubOut(x), at: x.at }));
  return { friends: out, invites: inv.map(i => ({ code: i.code, at: i.at, from: pubOut(i.from) })), requests, myCode: await myFcode(l) };
}
async function friend_add() { return [410, { error: 'gone' }]; }   // früher: sofort befreundet über den Namen – jetzt nur noch Anfragen per Freundes-Code
async function friend_request(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  const code = String(b.fcode || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (code.length !== 6) return [400, { error: 'code' }];
  const idx = await readJSON(fcodeFile(code)); if (!idx) return [404, { error: 'not_found' }];
  if (idx.login === a.l) return [400, { error: 'self' }];
  const other = await readJSON(accFile(idx.login)); if (!other) return [404, { error: 'not_found' }];
  const mine = (await readJSON(friendsFile(a.l))) || { list: [] };
  if (mine.list.some(x => cleanLogin(x.login) === idx.login)) return [200, { ...(await friendList(a.l)), result: 'already' }];
  const myReq = (await readJSON(reqFile(a.l))) || { list: [] };
  if (myReq.list.some(x => cleanLogin(x.login) === idx.login)) {   // der andere hat mich schon angefragt: dann sind wir jetzt Freunde
    await dropRequest(a.l, idx.login); await addFriendPair(a.l, a.acc, idx.login, other);
    return [200, { ...(await friendList(a.l)), result: 'friends', name: other.name }];
  }
  const R = (await readJSON(reqFile(idx.login))) || { list: [] };
  if (!R.list.some(x => cleanLogin(x.login) === a.l)) { R.list.push({ ...pub(a.l, a.acc), at: Date.now() }); R.list = R.list.slice(-30); await writeJSON(reqFile(idx.login), R); }
  await touch(a.l);
  return [200, { ...(await friendList(a.l)), result: 'sent', name: other.name }];
}
async function friend_answer(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  const R = (await readJSON(reqFile(a.l))) || { list: [] }, hit = R.list.find(x => pidOf(x.login) === String(b.from || '')); if (!hit) return [200, await friendList(a.l)];
  const from = cleanLogin(hit.login); await dropRequest(a.l, from);
  if (b.yes) { const other = await readJSON(accFile(from)); if (other) await addFriendPair(a.l, a.acc, from, other); }
  return [200, await friendList(a.l)];
}
async function friends(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  await touch(a.l, b.score);
  return [200, await friendList(a.l)];
}
async function friend_remove(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  const F = (await readJSON(friendsFile(a.l))) || { list: [] }, hit = F.list.find(x => pidOf(x.login) === String(b.friend || '')); if (!hit) return [200, await friendList(a.l)];
  const other = cleanLogin(hit.login);
  for (const [l, x] of [[a.l, other], [other, a.l]]) { const f = await readJSON(friendsFile(l)); if (f) { f.list = f.list.filter(y => cleanLogin(y.login) !== x); await writeJSON(friendsFile(l), f); } }
  return [200, await friendList(a.l)];
}
async function lobby_new(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  let code = '';
  for (let i = 0; i < 10; i++) { code = Array.from(crypto.randomBytes(4), x => LOBBY_CHARS[x % LOBBY_CHARS.length]).join(''); if (!(await readJSON(lobbyFile(code)))) break; }
  const o = b.opts || {}, opts = { mode: ['team', '2v2'].includes(o.mode) ? o.mode : 'duell', size: o.mode === '2v2' ? 4 : [2, 3, 4].includes(o.size) ? o.size : 2, diff: ['easy', 'medium', 'hard'].includes(o.diff) ? o.diff : 'medium', kids: [1, 2, 3, 4, 5].includes(o.kids) ? o.kids : 3, boss: !!o.boss, live: o.live !== false, stage: ['kueche', 'gastraum', 'aussen', 'spielplatz', 'parkplatz', 'chalet'].includes(o.stage) ? o.stage : 'spielplatz', stages: Array.isArray(o.stages) ? ['kueche', 'gastraum', 'aussen', 'spielplatz', 'parkplatz', 'chalet'].filter(s => o.stages.includes(s)) : [] };
  if (!opts.stages.length) opts.stages = [opts.stage]; opts.stage = opts.stages[0];
  const lob = { code, host: pub(a.l, a.acc), guest: null, players: [pub(a.l, a.acc)], gone: [], opts, seed: crypto.randomBytes(4).readUInt32BE(0), status: 'wait', created: Date.now(), started: 0 };
  await writeJSON(lobbyFile(code), lob);
  const F = b.invite ? (await readJSON(friendsFile(a.l))) || { list: [] } : null, fr = F && F.list.find(x => pidOf(x.login) === String(b.invite));   // nur eigene Freunde einladen
  if (fr) { const t = cleanLogin(fr.login), inv = (await readJSON(invFile(t))) || { list: [] }; inv.list = inv.list.filter(i => Date.now() - i.at < 15 * 60000).concat([{ code, from: lob.host, at: Date.now() }]).slice(-5); await writeJSON(invFile(t), inv); }
  const st = (await readJSON('stats/mp.json')) || { lobbies: 0, matches: 0 }; st.lobbies++; await writeJSON('stats/mp.json', st);
  return [200, lobbyOut(lob)];
}
async function lobby_join(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  const code = String(b.code || '').toUpperCase().replace(/[^A-Z]/g, ''), lob = code.length === 4 && (await readJSON(lobbyFile(code)));
  if (!lob || Date.now() - lob.created > 60 * 60000) return [404, { error: 'not_found' }];
  lob.players = lob.players || [lob.host].concat(lob.guest ? [lob.guest] : []);
  if (lob.players.some(p => cleanLogin(p.login) === a.l)) { if ((lob.gone || []).includes(a.l) && lob.status !== 'closed') { lob.gone = lob.gone.filter(x => x !== a.l); await writeJSON(lobbyFile(code), lob); } return [200, lobbyOut(lob)]; }   // wieder beitreten (z. B. nach Verbindungsabbruch)
  if (lob.status === 'run' || lob.players.length >= ((lob.opts && lob.opts.size) || 2)) return [409, { error: 'full' }];
  lob.players.push(pub(a.l, a.acc)); lob.guest = lob.players[1]; lob.status = 'ready'; await writeJSON(lobbyFile(code), lob);
  const inv = await readJSON(invFile(a.l)); if (inv) { inv.list = inv.list.filter(i => i.code !== code); await writeJSON(invFile(a.l), inv); }
  return [200, lobbyOut(lob)];
}
async function lobby_poll(b) {
  // schnell: nur Schlüssel prüfen (kein Konto lesen), Schreiben + Lesen gleichzeitig
  const l = cleanLogin(b.login); if (l.length !== 8 || !b.token || !sameStr(b.token, tokenOf(l))) return [401, { error: 'auth' }];
  const code = String(b.code || '').toUpperCase().replace(/[^A-Z]/g, ''); if (code.length !== 4) return [404, { error: 'not_found' }];
  const writeP = b.progress && typeof b.progress === 'object' ? writeJSON(progFile(code, l), { ...b.progress, at: Date.now() }) : null;
  let lob = await readJSON(lobbyFile(code));
  if (!lob) return [404, { error: 'not_found' }];
  lob.players = lob.players || [lob.host].concat(lob.guest ? [lob.guest] : []); lob.gone = lob.gone || [];
  const idx = lob.players.findIndex(p => cleanLogin(p.login) === l), isHost = idx === 0;
  if (idx < 0) return [403, { error: 'not_member' }];
  const oth = lob.players.map((p, i) => ({ p, i })).filter(x => x.i !== idx);
  const tasks = [Promise.all(oth.map(x => readJSON(progFile(code, cleanLogin(x.p.login))).catch(() => null)))];
  if (b.start && b.asDuel && isHost && lob.status === 'ready' && lob.opts && lob.opts.mode === '2v2' && lob.players.length >= 2) { lob.opts.mode = 'duell'; lob.opts.size = lob.players.length; }   // 2 gegen 2, aber zu wenige da: als Duell starten
  const need = lob.opts && lob.opts.mode === '2v2' ? 4 : 2;
  if (b.start && isHost && lob.players.length >= need && lob.status === 'ready') { lob.status = 'run'; lob.started = Date.now(); tasks.push(writeJSON(lobbyFile(code), lob), (async () => { const st = (await readJSON('stats/mp.json')) || { lobbies: 0, matches: 0 }; st.matches++; await writeJSON('stats/mp.json', st); })()); }
  if (b.leave) { if (!lob.gone.includes(l)) lob.gone.push(l); if (isHost && lob.status !== 'run') lob.status = 'closed'; if (lob.players.length - lob.gone.length < 2) lob.status = 'closed'; lob.left = l; tasks.push(writeJSON(lobbyFile(code), lob)); }
  if (writeP) tasks.push(writeP);
  const [progs] = await Promise.all(tasks);
  const others = oth.map((x, k) => ({ idx: x.i, name: x.p.name, id: pidOf(x.p.login), gone: lob.gone.includes(cleanLogin(x.p.login)), prog: progs[k] }));
  return [200, { lobby: lobbyOut(lob), me: isHost ? 'host' : 'guest', idx, others, other: others[0] ? others[0].prog : null, now: Date.now() }];

}
// Geräte-Schlüssel für den Admin: hängt am Passwort – wird das Passwort in Vercel geändert, sind alle gemerkten Geräte ungültig
const adminDeviceToken = (U, P) => crypto.createHmac('sha256', SECRET).update('admin-geraet:' + U + ':' + crypto.createHash('sha256').update(P).digest('hex')).digest('hex');
// ---------- Statistik: anonyme Geräte-Meldungen (keine Namen, keine persönlichen Daten) ----------
// Jedes Gerät hat eine zufällige Kennung (16 Hex-Zeichen). Das Spiel meldet ca. jede Minute aktiver Spielzeit: Sekunden, Stufe, Konto ja/nein, Fortschritt.
const STATS_KEY_HASH = '16c5fcf23b3489ccebf9a1a050f771ad10788eb2a2f2b19a64f97ae376fe0ba0';   // SHA-256 des Statistik-Schlüssels (der Schlüssel selbst steht nirgends im Code)
const berlinDay = (t = Date.now()) => new Date(t).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });   // JJJJ-MM-TT
const teleFile = dev => 'tele/' + dev + '.json';
async function ping(b) {
  const dev = String(b.dev || ''); if (!/^[a-f0-9]{16}$/.test(dev)) return [400, { error: 'dev' }];
  const now = Date.now(), day = berlinDay(now), sec = clamp0(Math.round(Number(b.sec) || 0), 0, 150);
  const T = (await readJSON(teleFile(dev))) || { first: now, last: 0, days: {}, sessions: 0 };
  if (now - (T.last || 0) > 30 * 60 * 1000) T.sessions = (T.sessions || 0) + 1;   // neue Sitzung nach 30 Min Pause
  T.days[day] = (T.days[day] || 0) + sec; T.last = now;
  const keys = Object.keys(T.days); if (keys.length > 400) keys.sort().slice(0, keys.length - 400).forEach(k => delete T.days[k]);
  T.diff = ['easy', 'medium', 'hard'].includes(b.diff) ? b.diff : T.diff; T.acc = !!b.acc; T.cleared = clamp0(Number(b.cleared) || 0, 0, 18); T.maxArea = clamp0(Number(b.maxArea) || 0, 0, 6);
  T.ueb = !!b.ueb || !!T.ueb; T.ver = String(b.ver || '').slice(0, 20); T.portrait = !!b.portrait;
  await writeJSON(teleFile(dev), T);
  return [200, { ok: true }];
}
function clamp0(v, a, z) { return Math.max(a, Math.min(z, v)); }
async function readAll(prefix) {   // alle Einträge unter einem Pfad (Supabase: seitenweise in einem Rutsch)
  if (SB) { const out = []; for (let off = 0; ; off += 1000) { const rows = await sb('GET', '?select=path,val&path=like.' + encodeURIComponent(prefix + '*') + '&order=path&limit=1000&offset=' + off); out.push(...rows.map(r => r.val)); if (rows.length < 1000) break; } return out; }
  const paths = await listJSON(prefix); return (await Promise.all(paths.map(p => readJSON(p).catch(() => null)))).filter(Boolean);
}
async function stats(b) {
  if (!b.key || !sameStr(crypto.createHash('sha256').update(String(b.key)).digest('hex'), STATS_KEY_HASH)) return [401, { error: 'auth' }];
  const all = await readAll('tele/'), now = Date.now(), DAY = 86400000, today = berlinDay(now);
  const dayList = n => Array.from({ length: n }, (_, i) => berlinDay(now - (n - 1 - i) * DAY));
  const last30 = dayList(30), dayIdx = d => Math.round((Date.parse(d) - Date.parse(today)) / DAY);
  const S = { generated: now, devices: all.length, accountsServer: (await listJSON('accounts/')).length, withAccount: 0, guests: 0,
    active: { d1: 0, d7: 0, d30: 0 }, perDay: last30.map(d => ({ day: d, active: 0, neu: 0, minutes: 0 })),
    totalHours: 0, sessions: 0, returning: 0, ret: { d1: [0, 0], d7: [0, 0], d30: [0, 0] }, diff: { easy: 0, medium: 0, hard: 0 }, ueb: 0, areas: [0, 0, 0, 0, 0, 0, 0], portrait: 0, ver: {}, daysPlayed: [0, 0, 0, 0, 0, 0] };
  for (const T of all) {
    const days = Object.keys(T.days || {}).sort(), secs = days.reduce((a, d) => a + (T.days[d] || 0), 0), first = berlinDay(T.first || now);
    S.totalHours += secs / 3600; S.sessions += T.sessions || 0;
    if (T.acc) S.withAccount++; else S.guests++;
    if (T.diff) S.diff[T.diff]++; if (T.ueb) S.ueb++; if (T.portrait) S.portrait++; S.areas[clamp0(T.maxArea || 0, 0, 6)]++;
    if (T.ver) S.ver[T.ver] = (S.ver[T.ver] || 0) + 1;
    const lastAgo = now - (T.last || 0); if (lastAgo < DAY) S.active.d1++; if (lastAgo < 7 * DAY) S.active.d7++; if (lastAgo < 30 * DAY) S.active.d30++;
    if (days.length >= 2) S.returning++;
    S.daysPlayed[Math.min(5, days.length)]++;
    for (const d of days) { const i = last30.indexOf(d); if (i >= 0) { S.perDay[i].active++; S.perDay[i].minutes += (T.days[d] || 0) / 60; } }
    { const i = last30.indexOf(first); if (i >= 0) S.perDay[i].neu++; }
    // Rückkehr: wer vor mind. N Tagen angefangen hat – hat am Tag N (D1) bzw. irgendwann ab Tag N (D7, D30) wieder gespielt?
    const age = -dayIdx(first);
    const off = d => Math.round((Date.parse(d) - Date.parse(first)) / DAY);
    if (age >= 1) { S.ret.d1[1]++; if (days.some(d => off(d) === 1)) S.ret.d1[0]++; }
    if (age >= 7) { S.ret.d7[1]++; if (days.some(d => off(d) >= 7)) S.ret.d7[0]++; }
    if (age >= 30) { S.ret.d30[1]++; if (days.some(d => off(d) >= 30)) S.ret.d30[0]++; }
  }
  S.perDay.forEach(p => (p.minutes = Math.round(p.minutes)));
  S.totalHours = Math.round(S.totalHours * 10) / 10;
  return [200, S];
}
async function admin(b) {
  const U = process.env.ADMIN_USER || '', P = process.env.ADMIN_PASS || '';
  if (!U || !P) return [401, { error: 'auth' }];
  const byPass = sameStr(String(b.user || ''), U) && sameStr(String(b.pass || ''), P);
  const byDevice = !!b.device && sameStr(String(b.device), adminDeviceToken(U, P));
  if (!byPass && !byDevice) return [401, { error: 'auth' }];
  if (b.promote) {   // Konto zum Admin machen (wird angelegt, falls es den Namen noch nicht gibt)
    const name = String(b.promote).trim().slice(0, 14), nk = nameKey(name); if (nk.length < 2) return [400, { error: 'name_short' }];
    let idx = await readJSON(nameFile(nk)), login, acc;
    if (idx) { login = idx.login; acc = await readJSON(accFile(login)); }
    if (!acc) { login = Array.from(crypto.randomBytes(8), x => CODE_CHARS[x % CODE_CHARS.length]).join(''); acc = { name, nk, code: [0, 1, 2, 3], avatar: 5, created: Date.now(), updated: Date.now(), data: {}, fails: 0, lockUntil: 0 }; await writeJSON(nameFile(nk), { login }); }
    acc.admin = true; await writeJSON(accFile(login), acc);
    return [200, { login: fmtLogin(login), name: acc.name, code: acc.code }];
  }
  const files = (await listJSON('accounts/')).map(pathname => ({ pathname }));
  const now = Date.now(), DAY = 86400000;
  const st = { accounts: 0, new7: 0, active7: 0, active30: 0, skins: 0, perDiff: {}, gameTimes: {}, bonus: { easy: [0, 0, 0], medium: [0, 0, 0], hard: [0, 0, 0] }, generated: now };
  for (const d of ['easy', 'medium', 'hard']) st.perDiff[d] = { players: 0, stageClears: 0, playersCleared: 0, questsDone: 0, skins: 0 };
  const accs = await Promise.all(files.map(f => readJSON(f.pathname).catch(() => null)));
  for (const acc of accs) {
    if (!acc) continue;
    st.accounts++;
    if (now - acc.created < 7 * DAY) st.new7++;
    if (now - (acc.updated || acc.created) < 7 * DAY) st.active7++;
    if (now - (acc.updated || acc.created) < 30 * DAY) st.active30++;
    const diff = (acc.data && acc.data.diff) || {};
    if (acc.data && acc.data.gt && typeof acc.data.gt === 'object') for (const k in acc.data.gt) { const e = acc.data.gt[k]; if (!Array.isArray(e) || !(e[0] > 0)) continue; const T = st.gameTimes[k] || (st.gameTimes[k] = [0, 0, 0]); T[0] += e[0]; T[1] += Number(e[1]) || 0; T[2]++; }   // Anzahl, Sekunden, Kinder
    if (acc.data && acc.data.bt && typeof acc.data.bt === 'object') for (const d in acc.data.bt) { const e = acc.data.bt[d], B = st.bonus[d]; if (!B || !Array.isArray(e)) continue; B[0] += Number(e[0]) || 0; B[1] += Number(e[1]) || 0; B[2] += Number(e[2]) || 0; }   // Aufträge, Summe Zeitanteil, mit Joker
    for (const d of ['easy', 'medium', 'hard']) {
      const stages = (diff[d] && diff[d].stages) || {}, P2 = st.perDiff[d];
      let played = false, cleared = false;
      for (const k in stages) {
        const s = stages[k] || {};
        const clears = s.clears || 0, done = s.run && s.run.done ? Object.keys(s.run.done).length : 0, sk = (s.skins || []).length;
        if (clears || done || sk) played = true;
        if (clears) cleared = true;
        P2.stageClears += clears; P2.questsDone += done + clears * 6; P2.skins += sk; st.skins += sk;
      }
      if (played) P2.players++;
      if (cleared) P2.playersCleared++;
    }
  }
  st.mp = (await readJSON('stats/mp.json')) || { lobbies: 0, matches: 0 };
  st.device = adminDeviceToken(U, P);
  return [200, st];
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!SECRET) return res.status(500).json({ error: 'config' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  b._ip = crypto.createHash('sha256').update(SECRET + String(req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip']) || '').split(',')[0].trim()).digest('hex').slice(0, 16);   // nur als Hash, für die Fehlversuch-Sperre
  const fn = { ping, stats, register, login, save, set_pass, delete: remove, admin, friend_add, friend_request, friend_answer, friends, friend_remove, lobby_new, lobby_join, lobby_poll }[b.action];
  if (!fn) return res.status(400).json({ error: 'action' });
  try { const [status, out] = await fn(b); res.status(status).json(out); }
  catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
};
