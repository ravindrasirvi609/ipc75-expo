-- When the last send was attempted for an author (successful or not). The
-- bulk send runs in rounds; this guarantees each round moves on to authors
-- not yet tried in the current run, so a failing address is never retried in
-- a loop and nobody is emailed twice by one click.
alter table public.authors
  add column if not exists email_attempted_at timestamptz;
