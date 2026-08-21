create table if not exists public.stall_bookings (
  stall_id text primary key,
  status text not null check (status in ('hold', 'booked')),
  company text,
  contact text,
  email text,
  phone text,
  note text,
  requested_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.stall_bookings enable row level security;

create or replace function public.request_stall_hold(
  p_stalls text[], p_company text, p_contact text, p_email text,
  p_phone text default '', p_note text default ''
) returns jsonb language plpgsql security definer set search_path = public as $$
declare taken jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object('id', stall_id, 'status', status, 'company', company)), '[]'::jsonb)
    into taken from stall_bookings where stall_id = any(p_stalls);
  if jsonb_array_length(taken) > 0 then
    return jsonb_build_object('ok', false, 'reason', 'conflict', 'taken', taken);
  end if;
  insert into stall_bookings(stall_id,status,company,contact,email,phone,note,requested_at,updated_at)
    select id, 'hold', p_company, p_contact, p_email, nullif(p_phone,''), nullif(p_note,''), now(), now()
    from unnest(p_stalls) as id;
  return jsonb_build_object('ok', true, 'held', to_jsonb(p_stalls));
exception when unique_violation then
  return jsonb_build_object('ok', false, 'reason', 'conflict', 'taken', '[]'::jsonb);
end;
$$;

revoke all on function public.request_stall_hold(text[],text,text,text,text,text) from public;
grant execute on function public.request_stall_hold(text[],text,text,text,text,text) to service_role;
