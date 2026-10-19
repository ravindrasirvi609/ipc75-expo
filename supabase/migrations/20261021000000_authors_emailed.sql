-- Tracks the bulk "email all authors" send so a second click only reaches
-- authors who have not received it yet (unless the organiser asks to resend).
alter table public.authors
  add column if not exists emailed_at timestamptz,
  add column if not exists email_error text;
