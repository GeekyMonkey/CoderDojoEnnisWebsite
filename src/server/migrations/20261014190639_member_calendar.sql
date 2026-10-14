-- Shared dated Calendar; attendance continues to be derived only from attendance rows.
begin;
alter table coderdojo.sessions add column description text not null default '',
 add column deleted boolean not null default false,
 add column revision uuid not null default gen_random_uuid();
alter table coderdojo.sessions alter column topic set default 'Coding Session';
alter table coderdojo.sessions add constraint session_description_length check(length(description)<=4000);
grant select(description,deleted,revision) on coderdojo.sessions to authenticated;
drop policy sessions_authorized_read on coderdojo.sessions;
create policy sessions_authorized_read on coderdojo.sessions for select to authenticated
 using(not deleted and (select coderdojo_private.current_member_id()) is not null
 and ((select coderdojo_private.is_mentor()) or not mentors_only));

-- Service-only RPC: fresh mentor status, shared lock ordering, optimistic revision checks.
create function coderdojo.maintain_calendar_session(p_actor uuid,p_action text,p_id uuid default null,p_fields jsonb default '{}',p_expected uuid default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 current_row coderdojo.sessions%rowtype;
 target_date date;
 result_id uuid;
 topic_value text;
begin
 perform pg_advisory_xact_lock(731101);
 if not exists(select 1 from coderdojo.members where id=p_actor and is_mentor and not deleted) then
  raise exception 'Mentor access required' using errcode='42501';
 end if;
 if p_action not in ('create','update','delete') or p_action is null then raise exception 'Invalid action' using errcode='22023'; end if;
 if p_action<>'create' then
  select * into current_row from coderdojo.sessions where id=p_id and not deleted for update;
  if not found then raise exception 'Session unavailable' using errcode='P0002'; end if;
  if current_row.revision is distinct from p_expected then raise exception 'Session changed; reload before saving' using errcode='P0001'; end if;
 end if;
 if p_action='delete' then
  update coderdojo.sessions set deleted=true,revision=gen_random_uuid() where id=p_id;
  return jsonb_build_object('id',p_id);
 end if;
 if jsonb_typeof(p_fields->'sessionDate') is distinct from 'string' or jsonb_typeof(p_fields->'topic') is distinct from 'string'
  or jsonb_typeof(p_fields->'description') is distinct from 'string' or jsonb_typeof(p_fields->'mentorsOnly') is distinct from 'boolean'
  or (p_fields - array['sessionDate','topic','description','mentorsOnly']) <> '{}'::jsonb then
  raise exception 'Invalid session fields' using errcode='22023';
 end if;
 target_date:=(p_fields->>'sessionDate')::date;
 topic_value:=coalesce(nullif(btrim(p_fields->>'topic'),''),'Coding Session');
 if target_date is null or length(topic_value)>200 or length(p_fields->>'description')>4000 then raise exception 'Invalid session fields' using errcode='22023'; end if;
 if exists(select 1 from coderdojo.sessions where session_date=target_date and not deleted and id is distinct from p_id) then
  raise exception 'A session already exists on this date' using errcode='P0001';
 end if;
 -- A deleted date can be reused without violating the existing one-row-per-date constraint.
 if p_action='create' then
  insert into coderdojo.sessions(session_date,topic,description,mentors_only)
  values(target_date,topic_value,btrim(p_fields->>'description'),(p_fields->>'mentorsOnly')::boolean)
  on conflict(session_date) do update set topic=excluded.topic,description=excluded.description,mentors_only=excluded.mentors_only,deleted=false,revision=gen_random_uuid()
  returning id into result_id;
 else
  -- Only an archived calendar row is removed; no attendance has a session FK.
  delete from coderdojo.sessions where session_date=target_date and deleted and id<>p_id;
  update coderdojo.sessions set session_date=target_date,topic=topic_value,description=btrim(p_fields->>'description'),
   mentors_only=(p_fields->>'mentorsOnly')::boolean,revision=gen_random_uuid() where id=p_id returning id into result_id;
 end if;
 return jsonb_build_object('id',result_id);
end $$;
revoke all on function coderdojo.maintain_calendar_session(uuid,text,uuid,jsonb,uuid) from public,anon,authenticated;
grant execute on function coderdojo.maintain_calendar_session(uuid,text,uuid,jsonb,uuid) to service_role;

-- The cutover import replaces matching dates and leaves all unmatched preloaded entries intact.
-- Generate IDs for new dates instead of copying legacy IDs that could collide with preserved rows.
create function coderdojo.import_calendar_sessions(p_sessions jsonb) returns void
 language plpgsql security invoker set search_path='' as $$
begin
 perform pg_advisory_xact_lock(731101);
 insert into coderdojo.sessions(session_date,topic,mentors_only,description,deleted)
 select (item->>'session_date')::date,coalesce(nullif(btrim(item->>'topic'),''),'Coding Session'),coalesce((item->>'mentors_only')::boolean,false),'',false
 from jsonb_array_elements(p_sessions) item
 on conflict(session_date) do update set topic=excluded.topic,mentors_only=excluded.mentors_only,description='',deleted=false,revision=gen_random_uuid();
end $$;
revoke all on function coderdojo.import_calendar_sessions(jsonb) from public,anon,authenticated;
grant execute on function coderdojo.import_calendar_sessions(jsonb) to service_role;

create or replace function coderdojo.get_attendance_dates() returns table(date text)
 language sql stable security invoker set search_path='' as $$
 select distinct a.date::text from coderdojo.member_attendances a
 where a.date::text <= ((now() at time zone 'Europe/Dublin')::date)::text order by 1 desc
$$;
create or replace function coderdojo.get_attendance_stats_split() returns table(date text,mentor_count bigint,ninja_count bigint,total_count bigint)
 language sql stable security invoker set search_path='' as $$
 select a.date::text,sum(case when m.is_mentor then 1 else 0 end)::bigint,
 sum(case when m.is_mentor then 0 else 1 end)::bigint,count(*)::bigint
 from coderdojo.member_attendances a left join coderdojo.members m on m.id=a.member_id
 where a.date::text <= ((now() at time zone 'Europe/Dublin')::date)::text group by a.date order by a.date desc
$$;

-- Defend all attendance writers, including direct service-client writes; deletion stays possible.
create function coderdojo_private.reject_future_attendance() returns trigger
 language plpgsql security invoker set search_path='' as $$
begin
 if new.date::text > ((now() at time zone 'Europe/Dublin')::date)::text then
  raise exception 'Attendance cannot be recorded for a future date' using errcode='22023';
 end if;
 return new;
end $$;
revoke all on function coderdojo_private.reject_future_attendance() from public,anon,authenticated;
create trigger reject_future_attendance before insert or update on coderdojo.member_attendances
 for each row execute function coderdojo_private.reject_future_attendance();

create or replace function coderdojo.sign_in_attendance(p_member uuid, p_date date, p_testing boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 current_member coderdojo.members%rowtype;
 session_count bigint;
begin
 if p_member is null or p_date is null or p_testing is null then
  raise exception 'Invalid attendance sign-in request' using errcode='22023';
 end if;
 -- Follow the same lock order as profile/maintenance operations; never save caller snapshots.
 perform pg_advisory_xact_lock(731101);
 select * into current_member from coderdojo.members where id=p_member for update;
 if not found then raise exception 'Member unavailable' using errcode='P0002'; end if;
 -- F03 accepted compatibility includes existing archived/roleless target behavior.
 if not p_testing then
  insert into coderdojo.member_attendances(member_id,date) values(p_member,p_date)
  on conflict(member_id,date) do nothing;
 end if;
 update coderdojo.members set login_date_previous=login_date,
  login_date=date_trunc('milliseconds',clock_timestamp() at time zone 'UTC')
 where id=p_member returning * into current_member;
 select count(*) into session_count from coderdojo.member_attendances where member_id=p_member and date::text <= ((now() at time zone 'Europe/Dublin')::date)::text;
 -- Preserve fingerprint testing behavior: simulate attendance but still rotate login dates.
 if p_testing then session_count:=session_count+1; end if;
 return jsonb_build_object('member',(to_jsonb(current_member)-'password_hash') || jsonb_build_object(
  'login_date',to_char(current_member.login_date,'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  'login_date_previous',to_char(current_member.login_date_previous,'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  'sessionCount',session_count);
end $$;

create or replace function coderdojo_private.broadcast_invalidation() returns trigger
 language plpgsql security definer set search_path='' as $$
declare
 before_row jsonb := case when tg_op='INSERT' then '{}'::jsonb else to_jsonb(old) end;
 after_row jsonb := case when tg_op='DELETE' then '{}'::jsonb else to_jsonb(new) end;
 subject_ids uuid[] := '{}';
 team_ids uuid[] := '{}';
 recipient uuid;
 public_change boolean := false;
begin
 if tg_table_name='members' then
  subject_ids:=array[(before_row->>'id')::uuid,(after_row->>'id')::uuid];
  team_ids:=array[(before_row->>'team_id')::uuid,(after_row->>'team_id')::uuid];
 elsif tg_table_name in ('member_attendances','member_badges','member_belts','member_badge_categories','member_parents') then
  subject_ids:=array[(before_row->>'member_id')::uuid,(after_row->>'member_id')::uuid,(before_row->>'parent_id')::uuid,(after_row->>'parent_id')::uuid];
 elsif tg_table_name='teams' then
  team_ids:=array[(before_row->>'id')::uuid,(after_row->>'id')::uuid];
 elsif tg_table_name in ('badge_categories','badges','belts') then
  public_change:=true;
 elsif tg_table_name in ('session_pods','sessions') then
  public_change:=coalesce((before_row->>'mentors_only')::boolean,true)=false or coalesce((after_row->>'mentors_only')::boolean,true)=false;
 end if;
 -- Team peers need member/account/earned-award invalidation, without evidence or IDs.
 if tg_table_name in ('member_badges','member_belts') and (before_row->>'awarded' is not null or after_row->>'awarded' is not null) then
  team_ids:=array(select distinct team_id from coderdojo.members where id=any(subject_ids) and not deleted and team_id is not null);
 end if;
 for recipient in
  select distinct m.id from coderdojo.members m
  join coderdojo_private.member_auth_bindings binding on binding.member_id=m.id
  where not m.deleted and (m.is_ninja or m.is_parent or m.is_mentor) and
   (m.is_mentor or public_change or m.id=any(subject_ids) or m.team_id=any(team_ids)
    or (m.is_parent and exists(select 1 from coderdojo.member_parents l join coderdojo.members child on child.id=l.member_id
      where l.parent_id=m.id and child.is_ninja and not child.deleted and (child.id=any(subject_ids) or child.team_id=any(team_ids)))))
 loop
  perform realtime.send(jsonb_build_object('table',tg_table_name,'operation',tg_op),'invalidate','coderdojo:member:'||recipient::text,true);
 end loop;
 return null;
end $$;
create or replace function coderdojo.get_attendance_stats() returns table(date text,attendance_count bigint)
 language sql stable security invoker set search_path='' as $$
 select a.date::text,count(*)::bigint from coderdojo.member_attendances a
 where a.date::text <= ((now() at time zone 'Europe/Dublin')::date)::text group by a.date order by a.date desc
$$;
commit;
