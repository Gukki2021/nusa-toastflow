create table if not exists public.meeting_programmes (
 meeting_date date primary key,
 programme jsonb not null check (jsonb_typeof(programme)='object'),
 updated_at timestamptz not null default now()
);
alter table public.meeting_programmes enable row level security;
create policy "Published programme read" on public.meeting_programmes for select to anon, authenticated using (true);
grant select on public.meeting_programmes to anon, authenticated;
revoke insert,update,delete on public.meeting_programmes from anon,authenticated;
create or replace function public.admin_set_programme(p_passcode text,p_meeting_date date,p_programme jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
 perform public._check_passcode(p_passcode);
 if p_meeting_date is null or jsonb_typeof(p_programme) is distinct from 'object' or jsonb_typeof(p_programme->'schedule') is distinct from 'object' or jsonb_typeof(p_programme->'guests') is distinct from 'array' or octet_length(p_programme::text)>50000 then
  raise exception 'Invalid meeting programme';
 end if;
 insert into public.meeting_programmes(meeting_date,programme) values(p_meeting_date,p_programme)
 on conflict(meeting_date) do update set programme=excluded.programme,updated_at=now();
 return jsonb_build_object('ok',true);
end;$$;
revoke all on function public.admin_set_programme(text,date,jsonb) from public;
grant execute on function public.admin_set_programme(text,date,jsonb) to anon,authenticated;
