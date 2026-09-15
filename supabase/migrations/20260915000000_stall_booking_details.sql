alter table public.stall_bookings add column if not exists address text, add column if not exists city text, add column if not exists state text, add column if not exists gst_number text;
drop function if exists public.request_stall_hold(text[], text, text, text, text, text);
create or replace function public.request_stall_hold(p_stalls text[], p_company text, p_contact text, p_email text, p_phone text, p_address text, p_city text, p_state text, p_gst_number text, p_note text default '') returns jsonb language plpgsql security definer set search_path = public as $$
declare taken jsonb;
begin
 select coalesce(jsonb_agg(jsonb_build_object('id', stall_id, 'status', status, 'company', company)), '[]'::jsonb) into taken from stall_bookings where stall_id = any(p_stalls);
 if jsonb_array_length(taken) > 0 then return jsonb_build_object('ok', false, 'reason', 'conflict', 'taken', taken); end if;
 insert into stall_bookings(stall_id,status,company,contact,email,phone,address,city,state,gst_number,note,requested_at,updated_at) select id,'hold',p_company,p_contact,p_email,p_phone,p_address,p_city,p_state,p_gst_number,nullif(p_note,''),now(),now() from unnest(p_stalls) as id;
 return jsonb_build_object('ok', true, 'held', to_jsonb(p_stalls));
exception when unique_violation then return jsonb_build_object('ok', false, 'reason', 'conflict', 'taken', '[]'::jsonb);
end; $$;
revoke all on function public.request_stall_hold(text[],text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.request_stall_hold(text[],text,text,text,text,text,text,text,text,text) to service_role;
