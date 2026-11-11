-- Payment tracking for the organiser desk. Set per stall row; the admin desk
-- writes the same value to every stall an organisation holds.
alter table public.stall_bookings
  add column if not exists payment_status text not null default 'pending',
  add column if not exists payment_reference text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'stall_bookings_payment_status_check'
  ) then
    alter table public.stall_bookings
      add constraint stall_bookings_payment_status_check
      check (payment_status in ('pending', 'partial', 'paid', 'refunded'));
  end if;
end $$;
