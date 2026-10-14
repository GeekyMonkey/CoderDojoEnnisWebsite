-- Dated entries support multiple types per day; public reads contain coding and notes only.
begin;
alter table coderdojo.sessions add column session_type text not null default 'CODING'
 check(session_type in ('CODING','MENTOR_PLANNING','NOTE'));
update coderdojo.sessions set session_type=case when mentors_only then 'MENTOR_PLANNING' else 'CODING' end,revision=gen_random_uuid();
alter table coderdojo.sessions drop constraint sessions_session_date_key;
create index sessions_date_id_idx on coderdojo.sessions(session_date,id) where not deleted;
drop policy sessions_authorized_read on coderdojo.sessions;
create policy sessions_authorized_read on coderdojo.sessions for select to authenticated
 using(not deleted and (select coderdojo_private.current_member_id()) is not null and (session_type<>'MENTOR_PLANNING' or (select coderdojo_private.is_mentor())));
-- Anonymous users may read only presentation columns on non-private, non-deleted entries.
grant select(id,session_date,topic,description,session_type) on coderdojo.sessions to anon;
grant select(session_type) on coderdojo.sessions to authenticated;
create policy sessions_public_read on coderdojo.sessions for select to anon
 using(not deleted and session_type<>'MENTOR_PLANNING' and session_date >= (((now() at time zone 'Europe/Dublin')::date)-interval '1 year')::date);
create or replace function coderdojo.maintain_calendar_session(p_actor uuid,p_action text,p_id uuid default null,p_fields jsonb default '{}',p_expected uuid default null)
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
  or jsonb_typeof(p_fields->'description') is distinct from 'string' or jsonb_typeof(p_fields->'sessionType') is distinct from 'string'
  or (p_fields - array['sessionDate','topic','description','sessionType']) <> '{}'::jsonb then
  raise exception 'Invalid session fields' using errcode='22023';
 end if;
 target_date:=(p_fields->>'sessionDate')::date;
 if (p_fields->>'sessionType') not in ('CODING','MENTOR_PLANNING','NOTE') then raise exception 'Invalid session type' using errcode='22023'; end if;
 topic_value:=coalesce(nullif(btrim(p_fields->>'topic'),''),case p_fields->>'sessionType' when 'MENTOR_PLANNING' then 'Mentor planning' when 'NOTE' then 'Note' else 'Coding Session' end);
 if target_date is null or length(topic_value)>200 or length(p_fields->>'description')>4000 then raise exception 'Invalid session fields' using errcode='22023'; end if;
 if p_action='create' then
  insert into coderdojo.sessions(session_date,topic,description,session_type)
  values(target_date,topic_value,btrim(p_fields->>'description'),p_fields->>'sessionType') returning id into result_id;
 else
  update coderdojo.sessions set session_date=target_date,topic=topic_value,description=btrim(p_fields->>'description'),
   session_type=p_fields->>'sessionType',revision=gen_random_uuid() where id=p_id returning id into result_id;
 end if;
 return jsonb_build_object('id',result_id);
end $$;
revoke all on function coderdojo.maintain_calendar_session(uuid,text,uuid,jsonb,uuid) from public,anon,authenticated;
grant execute on function coderdojo.maintain_calendar_session(uuid,text,uuid,jsonb,uuid) to service_role;


create or replace function coderdojo.import_calendar_sessions(p_sessions jsonb) returns void
 language plpgsql security invoker set search_path='' as $$
begin
 perform pg_advisory_xact_lock(731101);
 -- Replace historical coding data for imported dates only, preserving all other entries.
 update coderdojo.sessions set deleted=true,revision=gen_random_uuid()
 where session_type='CODING' and not deleted and session_date in (select (item->>'session_date')::date from jsonb_array_elements(p_sessions) item);
 insert into coderdojo.sessions(session_date,topic,description,session_type)
 select (item->>'session_date')::date,coalesce(nullif(btrim(item->>'topic'),''),'Coding Session'),'','CODING'
 from jsonb_array_elements(p_sessions) item;
end $$;
revoke all on function coderdojo.import_calendar_sessions(jsonb) from public,anon,authenticated;
grant execute on function coderdojo.import_calendar_sessions(jsonb) to service_role;
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
 elsif tg_table_name='sessions' then
  public_change:=coalesce(before_row->>'session_type','MENTOR_PLANNING')<>'MENTOR_PLANNING' or coalesce(after_row->>'session_type','MENTOR_PLANNING')<>'MENTOR_PLANNING';
 elsif tg_table_name='session_pods' then
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

alter table coderdojo.sessions drop column mentors_only;
commit;
