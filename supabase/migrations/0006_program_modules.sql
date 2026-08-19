-- ===========================================================================
-- Programme modules — real content for the student area at /my/[slug],
-- replacing the placeholder module list derived from `what_you_get`.
-- ===========================================================================

create table if not exists public.program_modules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  program_id uuid not null references public.programs(id) on delete cascade,
  title text not null,
  body text not null default '',
  video_url text,
  file_url text,
  sort_order int not null default 0
);

alter table public.program_modules enable row level security;

-- Admins manage everything. A signed-in student can read modules only for a
-- programme they have actually paid for (matched on email, same rule /my
-- already uses to grant access) — never all modules for every programme.
drop policy if exists program_modules_admin_write on public.program_modules;
create policy program_modules_admin_write on public.program_modules
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists program_modules_student_read on public.program_modules;
create policy program_modules_student_read on public.program_modules
  for select using (
    public.is_admin()
    or exists (
      select 1
      from public.orders o
      join public.users u on u.id = auth.uid()
      where o.item_id = program_modules.program_id
        and o.status = 'paid'
        and o.email = u.email
    )
  );

create index if not exists idx_program_modules_program on public.program_modules(program_id, sort_order);
