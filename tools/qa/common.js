// Gemeinsame Helfer für die QA-Tests (Chrome headless, Spiel per file://)
const puppeteer = require('puppeteer-core');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ROOT = require('path').resolve(__dirname, '../..');
async function open(opts = {}) {
  const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', async m => { if (m.type() !== 'error' || /ERR_FAILED|CORS|manifest|voice/.test(m.text())) return; const a = m.args()[0]; let t = m.text(); try { if (a) t = String(await a.evaluate(e => (e && e.stack) || e)); } catch (e) {} errs.push(t.split('\n').slice(0, 3).join(' <- ')); });
  await p.setViewport({ width: 844, height: 390, deviceScaleFactor: opts.dpr || 1 });
  await p.goto((process.env.QA_BASE || 'file://' + ROOT) + '/' + (opts.page || 'index.html'));   /* QA_BASE=http://… wenn Pixel ausgelesen werden (file:// sperrt getImageData) */
  if (!opts.page) await p.evaluate(admin => { localStorage.clear(); Save.load(); Save.data.seenTrailer = true; createAccount('QA', [0, 0, 0, 0]); ACC().char = 'cat'; ACC().tut.coach = true; ACC().tut.search = true; if (typeof STORY !== 'undefined') { for (const k of Object.keys(STORY)) { ACC().tut['st_in_' + k] = true; ACC().tut['st_out_' + k] = true; } ACC().tut.st_fest = true; }   /* Story-Szenen gelten als gesehen (eigener Test: story) */ if (admin) ACC().admin = true; for (const g of Object.keys(GAMES)) ACC().tut['h_' + g] = true; }, !!opts.admin);
  return { b, p, errs };
}
module.exports = { open, sleep, ROOT };
