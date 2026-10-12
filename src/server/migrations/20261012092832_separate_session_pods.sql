-- Online pods may share a calendar date; attendance sessions remain one row per date.
create table coderdojo.session_pods(
 id uuid primary key default gen_random_uuid(),
 session_date date not null,
 topic text,
 mentors_only boolean not null default false,
 ends_at timestamptz,
 url text,
 host_id uuid references coderdojo.members(id) on delete set null,
 host2_id uuid references coderdojo.members(id) on delete set null
);
create index session_pods_public_end_idx on coderdojo.session_pods(ends_at,session_date) where not mentors_only;
alter table coderdojo.session_pods enable row level security;
revoke all on coderdojo.session_pods from anon,authenticated;
grant select on coderdojo.session_pods to authenticated;
grant all on coderdojo.session_pods to service_role;
create policy session_pods_public_read on coderdojo.session_pods for select to authenticated using(not mentors_only);
alter publication supabase_realtime add table coderdojo.session_pods;

-- Remove only the unused metadata introduced by the preceding migration.
-- Refuse to discard any metadata if the migrations are applied separately in another environment.
do $$ begin
 if exists(select 1 from coderdojo.sessions where ends_at is not null or url is not null or host_id is not null or host2_id is not null) then
  raise exception 'Existing pod metadata requires migration before separating attendance sessions';
 end if;
end $$;
alter table coderdojo.sessions drop column ends_at,drop column url,drop column host_id,drop column host2_id;

-- Only the server may supply the authenticated actor and the already validated URL.
create or replace function coderdojo.join_coder_session(p_actor uuid,p_session uuid,p_expected_url text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 session_value coderdojo.session_pods%rowtype;
 today date := (now() at time zone 'Europe/Dublin')::date;
begin
 perform pg_advisory_xact_lock(731101);
 perform 1 from coderdojo.members where id=p_actor and not deleted and is_ninja for update;
 if not found then raise exception 'Coder access required' using errcode='42501'; end if;
 select * into session_value from coderdojo.session_pods where id=p_session for share;
 if not found or session_value.mentors_only then raise exception 'Session unavailable' using errcode='P0002'; end if;
 if (session_value.ends_at is not null and session_value.ends_at<=now()) or (session_value.ends_at is null and session_value.session_date<today) then raise exception 'Session has ended' using errcode='P0001'; end if;
 if session_value.url is null or session_value.url !~ '^https?://[^/?#[:space:]@]+' then raise exception 'Session has no valid joining URL' using errcode='22023'; end if;
 if session_value.url is distinct from p_expected_url then raise exception 'Session URL changed. Refresh before joining.' using errcode='P0001'; end if;
 insert into coderdojo.member_attendances(member_id,date)
 select p_actor,today where not exists(select 1 from coderdojo.member_attendances where member_id=p_actor and date=today);
 return jsonb_build_object('url',session_value.url,'attendanceDate',today::text);
end;
$$;
revoke all on function coderdojo.join_coder_session(uuid,uuid,text) from public,anon,authenticated;
grant execute on function coderdojo.join_coder_session(uuid,uuid,text) to service_role;
