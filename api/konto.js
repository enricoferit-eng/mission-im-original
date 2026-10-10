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
const fmtLogin = l => l.slice(0, 4) + '-' + l.slice(4, 8);
const validCode = c => Array.isArray(c) && c.length === 4 && c.every(v => Number.isInteger(v) && v >= 0 && v <= 5);

async function readJSON(path) {
  try {
    const r = await get(path, { ...PRIV, useCache: false });
    if (!r || r.statusCode !== 200) return null;
    return JSON.parse(await new Response(r.stream).text());
  } catch (e) { if (e && e.name === 'BlobNotFoundError') return null; throw e; }
}
async function writeJSON(path, obj) {
  await put(path, JSON.stringify(obj), { ...PRIV, allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60 });
}
function publicAcc(login, acc) {
  return { login: fmtLogin(login), token: tokenOf(login), name: acc.name, code: acc.code, avatar: acc.avatar, created: acc.created, data: acc.data || {}, admin: !!acc.admin };
}

async function register(b) {
  const name = String(b.name || '').trim().slice(0, 14), nk = nameKey(name);
  if (nk.length < 2) return [400, { error: 'name_short' }];
  if (!validCode(b.code)) return [400, { error: 'code' }];
  if (await readJSON(nameFile(nk))) return [409, { error: 'name_taken' }];
  let login = '';
  for (let i = 0; i < 10; i++) {
    login = Array.from(crypto.randomBytes(8), x => CODE_CHARS[x % CODE_CHARS.length]).join('');
    if (!(await readJSON(accFile(login)))) break;
  }
  const acc = { name, nk, code: b.code, avatar: Number(b.avatar) % 6 || 0, created: Date.now(), updated: Date.now(), data: {}, fails: 0, lockUntil: 0 };
  await writeJSON(accFile(login), acc);
  await writeJSON(nameFile(nk), { login });
  return [200, publicAcc(login, acc)];
}

async function login(b) {
  if (b.login) {
    const l = cleanLogin(b.login), acc = l.length === 8 && (await readJSON(accFile(l)));
    if (!acc) return [404, { error: 'not_found' }];
    return [200, publicAcc(l, acc)];
  }
  const nk = nameKey(b.name), idx = nk && (await readJSON(nameFile(nk)));
  if (!idx) return [404, { error: 'not_found' }];
  const acc = await readJSON(accFile(idx.login));
  if (!acc) return [404, { error: 'not_found' }];
  const now = Date.now();
  if (acc.lockUntil > now) return [429, { error: 'locked', wait: Math.ceil((acc.lockUntil - now) / 60000) }];
  if (!validCode(b.code) || b.code.join() !== acc.code.join()) {
    acc.fails = (acc.fails || 0) + 1;
    if (acc.fails >= MAX_FAILS) { acc.fails = 0; acc.lockUntil = now + LOCK_MS; }
    await writeJSON(accFile(idx.login), acc);
    return [401, { error: 'wrong_code' }];
  }
  if (acc.fails) { acc.fails = 0; await writeJSON(accFile(idx.login), acc); }
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

async function remove(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  await del([accFile(a.l), nameFile(a.acc.nk)]);
  return [200, { ok: true }];
}

// Besitzer-Statistik: nur zusammengefasste, anonyme Zahlen – keine einzelnen Konten
// ---------- Freunde + Mehrspieler (Duell über Lobby-Code, "Fortschritt vergleichen") ----------
// Eigene Dateien (nicht im Konto), damit das normale Speichern nichts überschreibt
const friendsFile = l => 'friends/' + l + '.json', invFile = l => 'invites/' + l + '.json', seenFile = l => 'seen/' + l + '.json';
const lobbyFile = c => 'lobbies/' + c + '.json', progFile = (c, l) => 'lobbies/' + c + '/' + l + '.json';
const LOBBY_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const pub = (l, acc) => ({ login: fmtLogin(l), name: acc.name, avatar: acc.avatar || 0 });
async function touch(l) { await writeJSON(seenFile(l), { t: Date.now() }); }
async function friendList(l) {
  const f = (await readJSON(friendsFile(l))) || { list: [] };
  const out = await Promise.all(f.list.map(async x => { const s = await readJSON(seenFile(cleanLogin(x.login))).catch(() => null); return { ...x, online: !!(s && Date.now() - s.t < 90000) }; }));
  const inv = ((await readJSON(invFile(l))) || { list: [] }).list.filter(i => Date.now() - i.at < 15 * 60000);
  return { friends: out, invites: inv };
}
async function friend_add(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  const nk = nameKey(b.name), idx = nk && (await readJSON(nameFile(nk)));
  if (!idx) return [404, { error: 'not_found' }];
  if (idx.login === a.l) return [400, { error: 'self' }];
  const other = await readJSON(accFile(idx.login)); if (!other) return [404, { error: 'not_found' }];
  const add = async (l, who) => { const f = (await readJSON(friendsFile(l))) || { list: [] }; if (!f.list.some(x => cleanLogin(x.login) === cleanLogin(who.login)) && f.list.length < 50) f.list.push(who); await writeJSON(friendsFile(l), f); };
  await add(a.l, pub(idx.login, other)); await add(idx.login, pub(a.l, a.acc));   // Freundschaft gilt für beide
  await touch(a.l);
  return [200, await friendList(a.l)];
}
async function friends(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  await touch(a.l);
  return [200, await friendList(a.l)];
}
async function friend_remove(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  const other = cleanLogin(b.friend);
  for (const [l, x] of [[a.l, other], [other, a.l]]) { const f = await readJSON(friendsFile(l)); if (f) { f.list = f.list.filter(y => cleanLogin(y.login) !== x); await writeJSON(friendsFile(l), f); } }
  return [200, await friendList(a.l)];
}
async function lobby_new(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  let code = '';
  for (let i = 0; i < 10; i++) { code = Array.from(crypto.randomBytes(4), x => LOBBY_CHARS[x % LOBBY_CHARS.length]).join(''); if (!(await readJSON(lobbyFile(code)))) break; }
  const o = b.opts || {}, opts = { mode: o.mode === 'team' ? 'team' : 'duell', diff: ['easy', 'medium', 'hard'].includes(o.diff) ? o.diff : 'medium', kids: [1, 2, 3, 4, 5].includes(o.kids) ? o.kids : 3, boss: !!o.boss, live: o.live !== false, stage: ['kueche', 'gastraum', 'aussen', 'spielplatz', 'parkplatz', 'chalet'].includes(o.stage) ? o.stage : 'spielplatz', stages: Array.isArray(o.stages) ? ['kueche', 'gastraum', 'aussen', 'spielplatz', 'parkplatz', 'chalet'].filter(s => o.stages.includes(s)) : [] };
  if (!opts.stages.length) opts.stages = [opts.stage]; opts.stage = opts.stages[0];
  const lob = { code, host: pub(a.l, a.acc), guest: null, opts, seed: crypto.randomBytes(4).readUInt32BE(0), status: 'wait', created: Date.now(), started: 0 };
  await writeJSON(lobbyFile(code), lob);
  if (b.invite) { const t = cleanLogin(b.invite), inv = (await readJSON(invFile(t))) || { list: [] }; inv.list = inv.list.filter(i => Date.now() - i.at < 15 * 60000).concat([{ code, from: lob.host, at: Date.now() }]).slice(-5); await writeJSON(invFile(t), inv); }
  const st = (await readJSON('stats/mp.json')) || { lobbies: 0, matches: 0 }; st.lobbies++; await writeJSON('stats/mp.json', st);
  return [200, lob];
}
async function lobby_join(b) {
  const a = await authed(b); if (!a) return [401, { error: 'auth' }];
  const code = String(b.code || '').toUpperCase().replace(/[^A-Z]/g, ''), lob = code.length === 4 && (await readJSON(lobbyFile(code)));
  if (!lob || Date.now() - lob.created > 60 * 60000) return [404, { error: 'not_found' }];
  if (cleanLogin(lob.host.login) === a.l) return [200, lob];
  if (lob.guest && cleanLogin(lob.guest.login) !== a.l) return [409, { error: 'full' }];
  lob.guest = pub(a.l, a.acc); lob.status = 'ready'; await writeJSON(lobbyFile(code), lob);
  const inv = await readJSON(invFile(a.l)); if (inv) { inv.list = inv.list.filter(i => i.code !== code); await writeJSON(invFile(a.l), inv); }
  return [200, lob];
}
async function lobby_poll(b) {
  // schnell: nur Schlüssel prüfen (kein Konto lesen), Schreiben + Lesen gleichzeitig
  const l = cleanLogin(b.login); if (l.length !== 8 || !b.token || !sameStr(b.token, tokenOf(l))) return [401, { error: 'auth' }];
  const code = String(b.code || '').toUpperCase().replace(/[^A-Z]/g, ''); if (code.length !== 4) return [404, { error: 'not_found' }];
  const writeP = b.progress && typeof b.progress === 'object' ? writeJSON(progFile(code, l), { ...b.progress, at: Date.now() }) : null;
  let lob = await readJSON(lobbyFile(code));
  if (!lob) return [404, { error: 'not_found' }];
  const isHost = cleanLogin(lob.host.login) === l, isGuest = lob.guest && cleanLogin(lob.guest.login) === l;
  if (!isHost && !isGuest) return [403, { error: 'not_member' }];
  const other = isHost ? lob.guest : lob.host;
  const tasks = [other ? readJSON(progFile(code, cleanLogin(other.login))).catch(() => null) : null];
  if (b.start && isHost && lob.guest && lob.status === 'ready') { lob.status = 'run'; lob.started = Date.now(); tasks.push(writeJSON(lobbyFile(code), lob), (async () => { const st = (await readJSON('stats/mp.json')) || { lobbies: 0, matches: 0 }; st.matches++; await writeJSON('stats/mp.json', st); })()); }
  if (b.leave) { lob.status = 'closed'; lob.left = l; tasks.push(writeJSON(lobbyFile(code), lob)); }
  if (writeP) tasks.push(writeP);
  const [op] = await Promise.all(tasks);
  return [200, { lobby: lob, me: isHost ? 'host' : 'guest', other: op, now: Date.now() }];
}
// Geräte-Schlüssel für den Admin: hängt am Passwort – wird das Passwort in Vercel geändert, sind alle gemerkten Geräte ungültig
const adminDeviceToken = (U, P) => crypto.createHmac('sha256', SECRET).update('admin-geraet:' + U + ':' + crypto.createHash('sha256').update(P).digest('hex')).digest('hex');
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
  const files = []; let cursor;
  do { const r = await list({ prefix: 'accounts/', cursor, limit: 1000 }); files.push(...r.blobs); cursor = r.hasMore ? r.cursor : undefined; } while (cursor);
  const now = Date.now(), DAY = 86400000;
  const st = { accounts: 0, new7: 0, active7: 0, active30: 0, skins: 0, perDiff: {}, generated: now };
  for (const d of ['easy', 'medium', 'hard']) st.perDiff[d] = { players: 0, stageClears: 0, playersCleared: 0, questsDone: 0, skins: 0 };
  const accs = await Promise.all(files.map(f => readJSON(f.pathname).catch(() => null)));
  for (const acc of accs) {
    if (!acc) continue;
    st.accounts++;
    if (now - acc.created < 7 * DAY) st.new7++;
    if (now - (acc.updated || acc.created) < 7 * DAY) st.active7++;
    if (now - (acc.updated || acc.created) < 30 * DAY) st.active30++;
    const diff = (acc.data && acc.data.diff) || {};
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
  const fn = { register, login, save, delete: remove, admin, friend_add, friends, friend_remove, lobby_new, lobby_join, lobby_poll }[b.action];
  if (!fn) return res.status(400).json({ error: 'action' });
  try { const [status, out] = await fn(b); res.status(status).json(out); }
  catch (e) { console.error(e); res.status(500).json({ error: 'server' }); }
};
