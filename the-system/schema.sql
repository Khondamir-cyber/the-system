-- Run once in Supabase: SQL Editor, New query, paste, Run.
create table if not exists public.system_docs (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  path text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, path)
);
alter table public.system_docs enable row level security;
create policy "Owner reads own rows" on public.system_docs for select using (auth.uid() = user_id);
create policy "Owner inserts own rows" on public.system_docs for insert with check (auth.uid() = user_id);
create policy "Owner updates own rows" on public.system_docs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner deletes own rows" on public.system_docs for delete using (auth.uid() = user_id);
create index if not exists system_docs_updated on public.system_docs (user_id, updated_at);
