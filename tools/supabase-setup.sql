-- Speicher für "Mission: Im Original" (Konten, Freunde, Mehrspieler-Räume)
-- In Supabase: SQL Editor -> New query -> einfügen -> Run
create table if not exists kv (
  path text primary key,
  val jsonb not null,
  updated timestamptz not null default now()
);
-- Nur der Server (Service-Key) darf lesen/schreiben – keine öffentlichen Zugriffe
alter table kv enable row level security;
