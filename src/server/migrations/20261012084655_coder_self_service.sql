-- Serialize own-coder writes and preserve mentor decisions and historical applications.
create or replace function coderdojo.coder_action(p_actor uuid,p_action text,p_kind text default null,p_definition uuid default null,p_fields jsonb default '{}'::jsonb,p_expected jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 member_value coderdojo.members%rowtype;
 current_goal timestamp without time zone;
 expected_goal timestamp without time zone;
 record_id uuid;
 next_belt uuid;
 selected boolean;
 notes text;
begin
 -- Definition/merge maintenance uses this same lock before member row locks.
 perform pg_advisory_xact_lock(731101);
 select * into member_value from coderdojo.members where id=p_actor and not deleted and is_ninja for update;
 if not found then raise exception 'Coder access required' using errcode='42501'; end if;
 if p_action='goals' then
  if p_fields is null or p_expected is null or (p_fields-array['goalShortTerm','goalLongTerm'])<>'{}'::jsonb or (p_expected-array['goalShortTerm','goalLongTerm'])<>'{}'::jsonb or not(p_fields?'goalShortTerm' and p_fields?'goalLongTerm' and p_expected?'goalShortTerm' and p_expected?'goalLongTerm') then raise exception 'Invalid goals' using errcode='22023'; end if;
  if length(coalesce(p_fields->>'goalShortTerm',''))>4000 or length(coalesce(p_fields->>'goalLongTerm',''))>4000 then raise exception 'Goals too long' using errcode='22023'; end if;
  if jsonb_build_object('goalShortTerm',member_value.goal_short_term,'goalLongTerm',member_value.goal_long_term) is distinct from p_expected then raise exception 'Goals changed. Reload before saving.' using errcode='P0001'; end if;
  update coderdojo.members set goal_short_term=nullif(btrim(p_fields->>'goalShortTerm'),''),goal_long_term=nullif(btrim(p_fields->>'goalLongTerm'),'') where id=p_actor;
  return null;
 end if;
 if p_action not in ('goal','apply') or p_kind not in ('badge','belt') or p_definition is null then raise exception 'Invalid coder action' using errcode='22023'; end if;
 if p_kind='badge' then
  perform 1 from coderdojo.badges b join coderdojo.badge_categories c on c.id=b.badge_category_id where b.id=p_definition and not b.deleted and not c.deleted for share of b,c;
 else
  perform 1 from coderdojo.belts where id=p_definition and not deleted for share;
 end if;
 if not found then raise exception 'Active achievement required' using errcode='P0002'; end if;
 if (p_kind='badge' and exists(select 1 from coderdojo.member_badges where member_id=p_actor and badge_id=p_definition and awarded is not null)) or (p_kind='belt' and exists(select 1 from coderdojo.member_belts where member_id=p_actor and belt_id=p_definition and awarded is not null)) then raise exception 'Achievement already earned' using errcode='P0001'; end if;
 if p_action='goal' then
  if p_kind<>'badge' or p_fields is null or p_expected is null or (p_fields-array['selected'])<>'{}'::jsonb or (p_expected-array['goalDate'])<>'{}'::jsonb or jsonb_typeof(p_fields->'selected') is distinct from 'boolean' or not(p_expected?'goalDate') then raise exception 'Invalid badge goal' using errcode='22023'; end if;
  selected:=(p_fields->>'selected')::boolean;
  select max(goal_date) into current_goal from coderdojo.member_badges where member_id=p_actor and badge_id=p_definition and awarded is null;
  expected_goal:=(p_expected->>'goalDate')::timestamp;
  if date_trunc('milliseconds',current_goal) is distinct from expected_goal then raise exception 'Goal changed. Reload before saving.' using errcode='P0001'; end if;
  if not selected then
   update coderdojo.member_badges set goal_date=null where member_id=p_actor and badge_id=p_definition and awarded is null;
  elsif current_goal is null then
   select id into record_id from coderdojo.member_badges where member_id=p_actor and badge_id=p_definition and awarded is null and rejected_date is null order by application_date desc nulls last,id limit 1 for update;
   if record_id is null then insert into coderdojo.member_badges(member_id,badge_id,goal_date) values(p_actor,p_definition,date_trunc('milliseconds',timezone('UTC',now())));
   else update coderdojo.member_badges set goal_date=date_trunc('milliseconds',timezone('UTC',now())) where id=record_id; end if;
  end if;
  return null;
 end if;
 if p_fields is null or (p_fields-array['notes'])<>'{}'::jsonb then raise exception 'Invalid application fields' using errcode='22023'; end if;
 notes:=btrim(p_fields->>'notes');
 if notes is null or length(notes) not between 5 and 4000 then raise exception 'Application evidence requires 5 to 4000 characters' using errcode='22023'; end if;
 if p_kind='belt' then
  select id into next_belt from coderdojo.belts b where not b.deleted and not exists(select 1 from coderdojo.member_belts mb where mb.member_id=p_actor and mb.belt_id=b.id and mb.awarded is not null) order by b.sort_order,b.color,b.id limit 1;
  if next_belt is distinct from p_definition then raise exception 'Apply only for your next belt' using errcode='P0001'; end if;
  select id into record_id from coderdojo.member_belts where member_id=p_actor and belt_id=p_definition and application_date is not null and awarded is null and rejected_date is null order by id limit 1 for update;
  if record_id is null then insert into coderdojo.member_belts(member_id,belt_id,application_date,application_notes) values(p_actor,p_definition,date_trunc('milliseconds',timezone('UTC',now())),notes) returning id into record_id; end if;
 else
  select id into record_id from coderdojo.member_badges where member_id=p_actor and badge_id=p_definition and application_date is not null and awarded is null and rejected_date is null order by id limit 1 for update;
  if record_id is null then
   select id into record_id from coderdojo.member_badges where member_id=p_actor and badge_id=p_definition and application_date is null and awarded is null and rejected_date is null order by goal_date desc nulls last,id limit 1 for update;
   if record_id is null then
    select max(goal_date) into current_goal from coderdojo.member_badges where member_id=p_actor and badge_id=p_definition and awarded is null;
    insert into coderdojo.member_badges(member_id,badge_id,goal_date,application_date,application_notes) values(p_actor,p_definition,current_goal,date_trunc('milliseconds',timezone('UTC',now())),notes) returning id into record_id;
   else update coderdojo.member_badges set application_date=date_trunc('milliseconds',timezone('UTC',now())),application_notes=notes where id=record_id; end if;
  end if;
 end if;
 return jsonb_build_object('id',record_id);
end; $$;
revoke all on function coderdojo.coder_action(uuid,text,text,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function coderdojo.coder_action(uuid,text,text,uuid,jsonb,jsonb) to service_role;
