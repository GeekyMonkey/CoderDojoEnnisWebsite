-- F01: direct data access and safe invalidation transport. Deploy with the matching app.
-- F02 legacy import is deliberately unchanged until production cutover.
begin;
create schema if not exists coderdojo_private;
revoke all on schema coderdojo_private from public,anon,authenticated;
grant usage on schema coderdojo_private to authenticated,service_role;
create table coderdojo_private.member_auth_bindings (
 auth_user_id uuid primary key references auth.users(id) on delete cascade,
 member_id uuid not null unique references coderdojo.members(id) on delete cascade
);
alter table coderdojo_private.member_auth_bindings enable row level security;
revoke all on coderdojo_private.member_auth_bindings from public,anon,authenticated;
grant select,insert on coderdojo_private.member_auth_bindings to service_role;

-- Only confirmed server-generated identities are reconciled; fail closed on ambiguity.
do $$ begin
 if exists(select 1 from auth.users where email_confirmed_at is not null
  and email ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@coderdojoennis[.]com$'
  group by lower(email) having count(*)>1) then
  raise exception 'Ambiguous CoderDojo auth identities; reconcile before RLS cutover';
 end if;
 if exists(select 1 from auth.users a where a.email_confirmed_at is not null
  and a.email ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@coderdojoennis[.]com$'
  and not exists(select 1 from coderdojo.members m where a.email=m.id::text||'@coderdojoennis.com')) then
  raise exception 'Orphaned CoderDojo auth identities; reconcile before RLS cutover';
 end if;
end $$;
insert into coderdojo_private.member_auth_bindings(auth_user_id,member_id)
 select a.id,m.id from auth.users a join coderdojo.members m on a.email=m.id::text||'@coderdojoennis.com'
 where a.email_confirmed_at is not null and not coalesce(a.is_anonymous,false);

-- Helpers expose a current identity/boolean only; fixed qualification prevents injection.
-- postgres owns these finite read helpers so table RLS cannot recurse into itself.
create function coderdojo_private.current_member_id() returns uuid
 language sql stable security definer set search_path='' as $$
 select m.id from coderdojo_private.member_auth_bindings b join coderdojo.members m on m.id=b.member_id
 join auth.users a on a.id=b.auth_user_id and not coalesce(a.is_anonymous,false)
 where b.auth_user_id=(select auth.uid()) and not m.deleted and (m.is_ninja or m.is_parent or m.is_mentor)
$$;
create function coderdojo_private.is_mentor() returns boolean
 language sql stable security definer set search_path='' as $$
 select exists(select 1 from coderdojo.members where id=(select coderdojo_private.current_member_id()) and is_mentor)
$$;
create function coderdojo_private.linked_child(p_member uuid) returns boolean
 language sql stable security definer set search_path='' as $$
 select exists(select 1 from coderdojo.member_parents l join coderdojo.members child on child.id=l.member_id
  join coderdojo.members parent on parent.id=l.parent_id
  where l.member_id=p_member and l.parent_id=(select coderdojo_private.current_member_id())
  and parent.is_parent and not parent.deleted and child.is_ninja and not child.deleted)
$$;
create function coderdojo_private.can_read_member(p_member uuid) returns boolean
 language sql stable security definer set search_path='' as $$
 select (select coderdojo_private.current_member_id()) is not null and
 ((select coderdojo_private.is_mentor()) or p_member=(select coderdojo_private.current_member_id()) or coderdojo_private.linked_child(p_member))
$$;
create function coderdojo_private.can_read_team(p_team uuid) returns boolean
 language sql stable security definer set search_path='' as $$
 select exists(select 1 from coderdojo.members m where not m.deleted and m.team_id=p_team
  and (m.id=(select coderdojo_private.current_member_id()) or coderdojo_private.linked_child(m.id)))
$$;
create function coderdojo_private.can_read_date(p_date date) returns boolean
 language sql stable security definer set search_path='' as $$
 select exists(select 1 from coderdojo.member_attendances a where a.date=p_date and coderdojo_private.can_read_member(a.member_id))
$$;
create function coderdojo_private.historical_badge(p_id uuid) returns boolean
 language sql stable security definer set search_path='' as $$
 select exists(select 1 from coderdojo.member_badges a where a.badge_id=p_id and coderdojo_private.can_read_member(a.member_id))
$$;
create function coderdojo_private.historical_belt(p_id uuid) returns boolean
 language sql stable security definer set search_path='' as $$
 select exists(select 1 from coderdojo.member_belts a where a.belt_id=p_id and coderdojo_private.can_read_member(a.member_id))
$$;
create function coderdojo_private.historical_category(p_id uuid) returns boolean
 language sql stable security definer set search_path='' as $$
 select exists(select 1 from coderdojo.badges b where b.badge_category_id=p_id and coderdojo_private.historical_badge(b.id))
 or exists(select 1 from coderdojo.member_badge_categories s where s.badge_category_id=p_id and coderdojo_private.can_read_member(s.member_id))
$$;
revoke all on all functions in schema coderdojo_private from public,anon,authenticated;
grant execute on all functions in schema coderdojo_private to authenticated,service_role;

-- Trusted login provisioning cannot move an existing auth identity to another member.
create function coderdojo.ensure_member_auth_binding(p_auth_user uuid,p_member uuid) returns void
 language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from auth.users a join coderdojo.members m on a.email=m.id::text||'@coderdojoennis.com'
  where a.id=p_auth_user and m.id=p_member and a.email_confirmed_at is not null and not coalesce(a.is_anonymous,false) and not m.deleted) then
  raise exception 'Invalid member identity binding' using errcode='42501';
 end if;
 insert into coderdojo_private.member_auth_bindings(auth_user_id,member_id) values(p_auth_user,p_member)
 on conflict(auth_user_id) do nothing;
 if not exists(select 1 from coderdojo_private.member_auth_bindings where auth_user_id=p_auth_user and member_id=p_member) then
  raise exception 'Member identity cannot be rebound' using errcode='42501';
 end if;
end $$;
create function coderdojo.resolve_member_identity(p_auth_user uuid) returns uuid
 language sql stable security definer set search_path='' as $$
 select b.member_id from coderdojo_private.member_auth_bindings b join coderdojo.members m on m.id=b.member_id
 join auth.users a on a.id=b.auth_user_id and not coalesce(a.is_anonymous,false)
 where b.auth_user_id=p_auth_user and not m.deleted and (m.is_ninja or m.is_parent or m.is_mentor)
$$;

-- Replace all existing application policies and privileges, including column grants.
do $$ declare r record; c record; begin
 for r in select tablename from pg_tables where schemaname='coderdojo' loop
  execute format('alter table coderdojo.%I enable row level security',r.tablename);
  for c in select policyname from pg_policies where schemaname='coderdojo' and tablename=r.tablename loop
   execute format('drop policy %I on coderdojo.%I',c.policyname,r.tablename);
  end loop;
  execute format('revoke all on coderdojo.%I from public,anon,authenticated',r.tablename);
  for c in select attname from pg_attribute where attrelid=format('coderdojo.%I',r.tablename)::regclass and attnum>0 and not attisdropped loop
   execute format('revoke all (%I) on coderdojo.%I from public,anon,authenticated',c.attname,r.tablename);
  end loop;
  execute format('grant all on coderdojo.%I to service_role',r.tablename);
 end loop;
end $$;
grant usage on schema coderdojo to anon,authenticated,service_role;
revoke create on schema coderdojo from public,anon,authenticated;
-- Enumerating columns is intentional: future credential/internal columns stay closed.
grant select(id,birth_year,deleted,email,garda_vetted,github_login,goal_long_term,goal_short_term,
 is_mentor,is_ninja,is_parent,login,login_date,login_date_previous,name_first,name_last,phone,
 registered_current_term,scratch_name,team_id,xbox_gamertag,has_photo,has_avatar) on coderdojo.members to authenticated;
grant select(id,deleted,goal,hexcode,team_name,has_image,image_revision) on coderdojo.teams to authenticated;
grant select(id,member_id,parent_id) on coderdojo.member_parents to authenticated;
grant select(id,member_id,date) on coderdojo.member_attendances to authenticated;
grant select(id,member_id,badge_category_id) on coderdojo.member_badge_categories to authenticated;
grant select(id,member_id,badge_id,awarded_by_adult_id,application_notes,awarded_notes,rejected_by_adult_id,rejected_notes,application_date,awarded,rejected_date,goal_date) on coderdojo.member_badges to authenticated;
grant select(id,member_id,belt_id,awarded_by_adult_id,application_notes,awarded_notes,rejected_by_adult_id,rejected_notes,application_date,awarded,rejected_date) on coderdojo.member_belts to authenticated;
grant select(id,deleted,category_name,category_description,has_image,image_revision) on coderdojo.badge_categories to authenticated;
grant select(id,deleted,achievement,badge_category_id,description) on coderdojo.badges to authenticated;
grant select(id,deleted,color,hex_code,description,sort_order) on coderdojo.belts to authenticated;
grant select(id,topic,mentors_only,session_date) on coderdojo.sessions to authenticated;
grant select(id,session_date,topic,mentors_only,ends_at,url,host_id,host2_id,deleted) on coderdojo.session_pods to authenticated;
grant select(id,deleted,category_name,category_description,has_image,image_revision) on coderdojo.badge_categories to anon;
grant select(id,deleted,achievement,badge_category_id,description) on coderdojo.badges to anon;
grant select(id,deleted,color,hex_code,description,sort_order) on coderdojo.belts to anon;
create policy members_authorized_read on coderdojo.members for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and ((select coderdojo_private.is_mentor()) or id=(select coderdojo_private.current_member_id())));
create policy member_parents_authorized_read on coderdojo.member_parents for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and ((select coderdojo_private.is_mentor()) or (parent_id=(select coderdojo_private.current_member_id()) and coderdojo_private.linked_child(member_id))));
create policy member_attendances_authorized_read on coderdojo.member_attendances for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and (coderdojo_private.can_read_member(member_id)));
create policy member_badge_categories_authorized_read on coderdojo.member_badge_categories for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and ((select coderdojo_private.is_mentor()) or member_id=(select coderdojo_private.current_member_id())));
create policy member_badges_authorized_read on coderdojo.member_badges for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and (coderdojo_private.can_read_member(member_id)));
create policy member_belts_authorized_read on coderdojo.member_belts for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and (coderdojo_private.can_read_member(member_id)));
create policy badge_categories_authorized_read on coderdojo.badge_categories for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and ((select coderdojo_private.is_mentor()) or not deleted or coderdojo_private.historical_category(id)));
create policy badges_authorized_read on coderdojo.badges for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and ((select coderdojo_private.is_mentor()) or not deleted or coderdojo_private.historical_badge(id)));
create policy belts_authorized_read on coderdojo.belts for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and ((select coderdojo_private.is_mentor()) or not deleted or coderdojo_private.historical_belt(id)));
create policy teams_authorized_read on coderdojo.teams for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and ((select coderdojo_private.is_mentor()) or (not deleted and coderdojo_private.can_read_team(id))));
create policy sessions_authorized_read on coderdojo.sessions for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and ((select coderdojo_private.is_mentor()) or coderdojo_private.can_read_date(session_date)));
create policy session_pods_authorized_read on coderdojo.session_pods for select to authenticated
 using((select coderdojo_private.current_member_id()) is not null and ((select coderdojo_private.is_mentor()) or (not deleted and not mentors_only and ((ends_at is not null and ends_at>now()) or (ends_at is null and session_date >= (now() at time zone 'Europe/Dublin')::date)))));
create policy badge_categories_public_read on coderdojo.badge_categories for select to anon using(not deleted);
create policy badges_public_read on coderdojo.badges for select to anon using(not deleted);
create policy belts_public_read on coderdojo.belts for select to anon using(not deleted);

-- All exposed mutation/stat RPCs are service-only; finite policy helpers are private.
revoke execute on all functions in schema coderdojo from public,anon,authenticated;
grant execute on all functions in schema coderdojo to service_role;
alter function coderdojo.get_attendance_dates() set search_path='';
alter function coderdojo.get_attendance_stats() set search_path='';
alter function coderdojo.get_attendance_stats_split() set search_path='';
-- Replace old email-based helper for any compatible server-only caller.
create or replace function coderdojo.can_read_mentor_pods() returns boolean
 language sql stable security definer set search_path='' as $$ select coderdojo_private.is_mentor() $$;
revoke all on function coderdojo.can_read_mentor_pods() from public,anon,authenticated;
grant execute on function coderdojo.can_read_mentor_pods() to service_role;
alter default privileges in schema coderdojo revoke all on tables from public,anon,authenticated;
alter default privileges in schema coderdojo revoke execute on functions from public,anon,authenticated;
alter default privileges in schema coderdojo_private revoke all on tables from public,anon,authenticated;
alter default privileges in schema coderdojo_private revoke execute on functions from public,anon,authenticated;
-- Existing ordinary views must not bypass underlying row/column checks.
do $$ declare r record; begin
 for r in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='coderdojo' and c.relkind='v' loop
  execute format('alter view coderdojo.%I set (security_invoker=true)',r.relname);
  execute format('revoke all on coderdojo.%I from public,anon,authenticated',r.relname);
 end loop;
end $$;
create index if not exists member_parents_parent_member_rls_idx on coderdojo.member_parents(parent_id,member_id);
create index if not exists members_team_active_rls_idx on coderdojo.members(team_id,id) where not deleted;

-- No raw rows or DELETE old-record leaks. Preserve unrelated applications/publications.
do $$ declare r record; begin
 if exists(select 1 from pg_publication where puballtables) then
  raise exception 'All-table publication must be narrowed before CoderDojo RLS cutover';
 end if;
 for r in select pubname,tablename from pg_publication_tables where schemaname='coderdojo' loop
  execute format('alter publication %I drop table coderdojo.%I',r.pubname,r.tablename);
 end loop;
end $$;

-- Scope-safe receive and deny-send guards also constrain any future permissive policy.
create policy coderdojo_receive on realtime.messages for select to authenticated
 using(extension='broadcast' and topic='coderdojo:member:'||(select coderdojo_private.current_member_id())::text);
create policy coderdojo_receive_boundary on realtime.messages as restrictive for select to authenticated
 using(topic not like 'coderdojo:%' or (extension='broadcast' and topic='coderdojo:member:'||(select coderdojo_private.current_member_id())::text));
create policy coderdojo_no_client_send on realtime.messages as restrictive for insert to anon,authenticated
 with check(topic not like 'coderdojo:%');
-- Storage bytes remain public; scoped restrictive policies prevent direct object mutation/listing.
create policy coderdojo_no_client_objects_read on storage.objects as restrictive for select to anon,authenticated using(bucket_id<>'coderdojo');
create policy coderdojo_no_client_objects_insert on storage.objects as restrictive for insert to anon,authenticated with check(bucket_id<>'coderdojo');
create policy coderdojo_no_client_objects_update on storage.objects as restrictive for update to anon,authenticated using(bucket_id<>'coderdojo') with check(bucket_id<>'coderdojo');
create policy coderdojo_no_client_objects_delete on storage.objects as restrictive for delete to anon,authenticated using(bucket_id<>'coderdojo');

-- Per-member topics: payloads contain only table/operation, never IDs or row contents.
create function coderdojo_private.broadcast_invalidation() returns trigger
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
revoke all on function coderdojo_private.broadcast_invalidation() from public,anon,authenticated,service_role;
do $$ declare r record; begin
 for r in select tablename from pg_tables where schemaname='coderdojo' loop
  execute format('create trigger coderdojo_invalidation after insert or update or delete on coderdojo.%I for each row execute function coderdojo_private.broadcast_invalidation()',r.tablename);
 end loop;
end $$;
commit;
