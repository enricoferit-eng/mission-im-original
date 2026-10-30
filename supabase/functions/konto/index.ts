// Supabase Edge Function "konto": nimmt die Anfragen des Spiels an (früher Vercel api/konto.js)
import { handle } from './core.mjs';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info', 'Cache-Control': 'no-store' };
const json = (status: number, out: unknown) => new Response(JSON.stringify(out), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'method' });
  let body = {}; try { body = await req.json(); } catch (_) { body = {}; }
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || '';
  const [status, out] = await handle(body, ip);
  return json(status, out);
});
