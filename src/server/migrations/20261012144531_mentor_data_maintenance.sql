-- Preview and apply the legacy maintenance rules without deleting account history.
create or replace function coderdojo.maintain_data(p_actor uuid, p_action text, p_apply boolean default false, p_expected text default null)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 cutoff date := ((now() at time zone 'Europe/Dublin')::date - interval '1 year')::date;
 coder_ids uuid[] := '{}';
 parent_ids uuid[] := '{}';
 registration_ids uuid[] := '{}';
 candidates jsonb;
 revision text;
 result jsonb;
begin
 if p_action is null or p_action not in ('members', 'registrations') or p_apply is null
  or (p_apply and (p_expected is null or p_expected !~ '^[0-9a-f]{32}$'))
  or (not p_apply and p_expected is not null) then
  raise exception 'Invalid maintenance action' using errcode = '22023';
 end if;
 -- Match the shared mutation lock order; prevent attendance/link/role edits during apply.
 perform pg_advisory_xact_lock(731101);
 if p_apply then
  lock table coderdojo.members, coderdojo.member_attendances, coderdojo.member_parents in share row exclusive mode;
 end if;
 perform 1 from coderdojo.members where id = p_actor and is_mentor and not deleted for share;
 if not found then raise exception 'Mentor access required' using errcode = '42501'; end if;

 if p_action = 'members' then
  select coalesce(array_agg(m.id order by m.id), '{}') into coder_ids
  from coderdojo.members m
  where not m.deleted and m.is_ninja and not m.is_mentor
   and coalesce((select max(a.date) from coderdojo.member_attendances a where a.member_id = m.id), date '2000-01-01') < cutoff;
  -- In the unified table, never archive an active coder or mentor via their parent role.
  select coalesce(array_agg(p.id order by p.id), '{}') into parent_ids
  from coderdojo.members p
  where not p.deleted and p.is_parent and not p.is_mentor
   and (not p.is_ninja or p.id = any(coder_ids))
   and not exists(select 1 from coderdojo.member_parents r join coderdojo.members c on c.id = r.member_id
    where r.parent_id = p.id and not c.deleted and not(c.id = any(coder_ids)));
  -- A multi-role coder/parent is counted once, as a coder.
  parent_ids := array(select unnest(parent_ids) except select unnest(coder_ids));
 else
  -- Legacy purge includes archived coders, but excludes adult-only accounts.
  select coalesce(array_agg(m.id order by m.id), '{}') into registration_ids
  from coderdojo.members m where m.is_ninja and m.registered_current_term;
 end if;

 select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'name',concat_ws(' ',m.name_first,m.name_last),
  'kind',case when m.id = any(coder_ids) then 'coder' when m.id = any(parent_ids) then 'parent' else 'registration' end,
  'lastAttendance',(select max(a.date)::text from coderdojo.member_attendances a where a.member_id=m.id),
  'archived',m.deleted) order by m.name_first,m.name_last,m.id),'[]'::jsonb) into candidates
 from coderdojo.members m where m.id = any(coder_ids || parent_ids || registration_ids);
 revision := md5(jsonb_build_object('action',p_action,'cutoff',cutoff,'candidates',candidates)::text);
 if p_apply and revision is distinct from p_expected then
  raise exception 'Maintenance preview changed. Refresh and review again.' using errcode = 'P0001';
 end if;
 result := jsonb_build_object('action',p_action,'cutoff',cutoff::text,'revision',revision,'candidates',candidates,
  'coders',cardinality(coder_ids),'parents',cardinality(parent_ids),'registrations',cardinality(registration_ids),'applied',p_apply);
 if p_apply then
  if p_action = 'members' then
   update coderdojo.members set deleted = true where id = any(coder_ids || parent_ids);
  else
   update coderdojo.members set registered_current_term = false where id = any(registration_ids);
  end if;
 end if;
 return result;
end;
$$;
revoke all on function coderdojo.maintain_data(uuid,text,boolean,text) from public,anon,authenticated;
grant execute on function coderdojo.maintain_data(uuid,text,boolean,text) to service_role;
