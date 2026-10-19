-- Authors of accepted papers and posters, entered one by one or bulk-uploaded
-- from the organiser desk. Readable and writable only through the service role
-- (the /api/admin/authors route), same as stall_bookings.
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  serial_no integer,
  author_name text not null,
  paper_code text,
  poster_code text,
  email text not null,
  title text not null,
  created_at timestamptz not null default now(),
  constraint authors_has_code check (paper_code is not null or poster_code is not null)
);

-- Codes are stored upper-case, so a plain unique index is case-insensitive in
-- practice. NULLs never collide, so an author with only a poster is fine.
create unique index if not exists authors_paper_code_key on public.authors (paper_code);
create unique index if not exists authors_poster_code_key on public.authors (poster_code);
create index if not exists authors_serial_no_idx on public.authors (serial_no);

alter table public.authors enable row level security;
