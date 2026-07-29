-- ToastFlow — Exco/Admin functions (run once in Supabase SQL Editor).
-- Adds lightweight, passcode-gated write powers for the exco:
--   • block a slot for an external evaluator/guest (placeholder, name added later)
--   • set / change the holder of any slot (fill in the external name, fix a typo)
--   • release a slot (undo a block, remove a wrong or test reservation)
-- The passcode is a shared exco secret checked server-side, so the public anon
-- key alone cannot edit — only someone who knows the exco passcode can.

-- 1) Store the exco passcode. CHANGE THIS VALUE, then keep it private.
create table if not exists public.app_config (
  key text primary key,
  value text not null
);
insert into public.app_config(key, value)
values ('exco_passcode', 'CHANGE-ME-exco-2026')
on conflict (key) do nothing;

revoke all on table public.app_config from anon, authenticated;  -- never readable from the browser

create or replace function public._check_passcode(p_passcode text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_passcode is distinct from (select value from public.app_config where key = 'exco_passcode') then
    raise exception 'Invalid exco passcode' using errcode = '28000';
  end if;
end;
$$;

-- Reuse the meeting-date / role guards already used by reserve_slot.
create or replace function public._valid_slot(p_meeting_date date, p_reservation_type text)
returns void language plpgsql as $$
begin
  if p_meeting_date not in (date '2026-08-14',date '2026-09-11',date '2026-10-09',date '2026-11-13',date '2026-12-11') then
    raise exception 'Invalid meeting date' using errcode='22023';
  end if;
  if p_reservation_type not in (
    'Prepared Speech 1','Prepared Speech 2','Prepared Speech 3','Prepared Speech 4',
    'Toastmaster of the Evening','Table Topics Master','General Evaluator',
    'Speech Evaluator 1','Speech Evaluator 2','Speech Evaluator 3','Speech Evaluator 4',
    'Timer','Ah-Counter','Language Evaluator'
  ) then
    raise exception 'Invalid reservation type' using errcode='22023';
  end if;
end;
$$;

-- 2) Block a slot for an external evaluator/guest (name filled in later).
create or replace function public.admin_block_slot(
  p_passcode text, p_meeting_date date, p_reservation_type text, p_label text default 'External — admin to add'
) returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public._check_passcode(p_passcode);
  perform public._valid_slot(p_meeting_date, p_reservation_type);
  insert into public.reservations(meeting_date, reservation_type, member_name, contact, note)
  values (p_meeting_date, p_reservation_type, coalesce(nullif(trim(p_label),''),'External — admin to add'), 'exco', '[EXTERNAL]')
  on conflict (meeting_date, reservation_type)
  do update set member_name = excluded.member_name, note = excluded.note, status = 'confirmed';
  return jsonb_build_object('ok', true);
end;
$$;

-- 3) Set / change the holder of a slot (fill in the external name, fix a name).
create or replace function public.admin_set_holder(
  p_passcode text, p_meeting_date date, p_reservation_type text, p_member_name text, p_note text default ''
) returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public._check_passcode(p_passcode);
  perform public._valid_slot(p_meeting_date, p_reservation_type);
  insert into public.reservations(meeting_date, reservation_type, member_name, contact, note)
  values (p_meeting_date, p_reservation_type, trim(p_member_name), 'exco', coalesce(trim(p_note),''))
  on conflict (meeting_date, reservation_type)
  do update set member_name = excluded.member_name, note = excluded.note, status = 'confirmed';
  return jsonb_build_object('ok', true);
end;
$$;

-- 4) Release a slot (undo a block, remove a wrong/test reservation).
create or replace function public.admin_release_slot(
  p_passcode text, p_meeting_date date, p_reservation_type text
) returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public._check_passcode(p_passcode);
  delete from public.reservations
  where meeting_date = p_meeting_date and reservation_type = p_reservation_type;
  return jsonb_build_object('ok', true);
end;
$$;

-- Expose only the passcode-gated functions to the browser.
revoke all on function public.admin_block_slot(text,date,text,text) from public;
revoke all on function public.admin_set_holder(text,date,text,text,text) from public;
revoke all on function public.admin_release_slot(text,date,text) from public;
grant execute on function public.admin_block_slot(text,date,text,text) to anon, authenticated;
grant execute on function public.admin_set_holder(text,date,text,text,text) to anon, authenticated;
grant execute on function public.admin_release_slot(text,date,text) to anon, authenticated;
