alter table coderdojo.session_pods add column deleted boolean not null default false;

-- Verify the immutable auth account and current database role for private realtime visibility.
create or replace function coderdojo.can_read_mentor_pods()
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users a join coderdojo.members m on a.email=m.id::text||'@coderdojoennis.com'
  where a.id=(select auth.uid()) and a.email_confirmed_at is not null and m.is_mentor and not m.deleted);
$$;
revoke all on function coderdojo.can_read_mentor_pods() from public,anon;
grant execute on function coderdojo.can_read_mentor_pods() to authenticated,service_role;
drop policy session_pods_public_read on coderdojo.session_pods;
create policy session_pods_visible_read on coderdojo.session_pods for select to authenticated
 using(not deleted and (not mentors_only or (select coderdojo.can_read_mentor_pods())));

create or replace function coderdojo.maintain_session_pod(p_actor uuid,p_action text,p_id uuid default null,p_fields jsonb default '{}'::jsonb,p_expected jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 current_value coderdojo.session_pods%rowtype;
 current_snapshot jsonb;
 result_id uuid;
 topic_value text;
 url_value text;
 host_value uuid;
 host2_value uuid;
 now_value timestamptz := date_trunc('milliseconds',now());
begin
 perform pg_advisory_xact_lock(731101);
 perform 1 from coderdojo.members where id=p_actor and is_mentor and not deleted for update;
 if not found then raise exception 'Mentor access required' using errcode='42501'; end if;
 if p_action not in ('create','update','delete') then raise exception 'Invalid pod action' using errcode='22023'; end if;
 if p_action<>'create' then
  select * into current_value from coderdojo.session_pods where id=p_id and not deleted for update;
  if not found then raise exception 'Session unavailable' using errcode='P0002'; end if;
  current_snapshot:=jsonb_build_object('topic',current_value.topic,'url',current_value.url,'hostId',current_value.host_id,'host2Id',current_value.host2_id,'mentorsOnly',current_value.mentors_only,'sessionDate',current_value.session_date::text,'endsAt',case when current_value.ends_at is null then null else floor(extract(epoch from current_value.ends_at)*1000)::bigint end);
  if current_snapshot is distinct from p_expected then raise exception 'Session changed. Reload before saving.' using errcode='P0001'; end if;
  if p_action='delete' then update coderdojo.session_pods set deleted=true where id=p_id; return jsonb_build_object('id',p_id); end if;
 end if;
 if p_fields is null or (p_fields-array['topic','url','hostId','host2Id','mentorsOnly'])<>'{}'::jsonb or not(p_fields?'topic' and p_fields?'url' and p_fields?'hostId' and p_fields?'host2Id' and p_fields?'mentorsOnly') or jsonb_typeof(p_fields->'mentorsOnly')<>'boolean' then raise exception 'Invalid pod fields' using errcode='22023'; end if;
 topic_value:=nullif(btrim(p_fields->>'topic'),'');url_value:=nullif(btrim(p_fields->>'url'),'');
 if topic_value is null or length(topic_value)>200 or length(coalesce(url_value,''))>2000 or (url_value is not null and url_value!~'^https?://[^/?#[:space:]@]+') then raise exception 'Invalid topic or URL' using errcode='22023'; end if;
 begin host_value:=(p_fields->>'hostId')::uuid;host2_value:=(p_fields->>'host2Id')::uuid;exception when invalid_text_representation then raise exception 'Invalid host' using errcode='22023';end;
 if host_value is null or host_value=host2_value then raise exception 'Choose distinct active mentor hosts' using errcode='22023'; end if;
 perform 1 from coderdojo.members where id=host_value and is_mentor and not deleted for share;
 if not found then raise exception 'Primary host is unavailable' using errcode='P0001'; end if;
 if host2_value is not null then
  perform 1 from coderdojo.members where id=host2_value and is_mentor and not deleted for share;
  if not found then raise exception 'Second host is unavailable' using errcode='P0001'; end if;
 end if;
 if p_action='create' then
  insert into coderdojo.session_pods(topic,url,host_id,host2_id,mentors_only,session_date,ends_at)
   values(topic_value,url_value,host_value,host2_value,(p_fields->>'mentorsOnly')::boolean,(now_value at time zone 'Europe/Dublin')::date,now_value+interval '150 minutes') returning id into result_id;
 else
  update coderdojo.session_pods set topic=topic_value,url=url_value,host_id=host_value,host2_id=host2_value,mentors_only=(p_fields->>'mentorsOnly')::boolean,session_date=(now_value at time zone 'Europe/Dublin')::date,ends_at=now_value+interval '150 minutes' where id=p_id returning id into result_id;
 end if;
 return jsonb_build_object('id',result_id);
end;
$$;
revoke all on function coderdojo.maintain_session_pod(uuid,text,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function coderdojo.maintain_session_pod(uuid,text,uuid,jsonb,jsonb) to service_role;

create or replace function coderdojo.join_member_session(p_actor uuid,p_session uuid,p_expected_url text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 member_value coderdojo.members%rowtype;
 session_value coderdojo.session_pods%rowtype;
 today date := (now() at time zone 'Europe/Dublin')::date;
begin
 perform pg_advisory_xact_lock(731101);
 select * into member_value from coderdojo.members where id=p_actor and not deleted and (is_ninja or is_mentor or is_parent) for update;
 if not found then raise exception 'Member access required' using errcode='42501'; end if;
 select * into session_value from coderdojo.session_pods where id=p_session and not deleted for share;
 if not found or (session_value.mentors_only and not member_value.is_mentor) then raise exception 'Session unavailable' using errcode='P0002'; end if;
 if (session_value.ends_at is not null and session_value.ends_at<=now()) or (session_value.ends_at is null and session_value.session_date<today) then raise exception 'Session has ended' using errcode='P0001'; end if;
 if session_value.url is null or session_value.url!~'^https?://[^/?#[:space:]@]+' then raise exception 'Session has no valid joining URL' using errcode='22023'; end if;
 if session_value.url is distinct from p_expected_url then raise exception 'Session URL changed. Refresh before joining.' using errcode='P0001'; end if;
 insert into coderdojo.member_attendances(member_id,date) values(p_actor,today) on conflict(member_id,date) do nothing;
 return jsonb_build_object('url',session_value.url,'attendanceDate',today::text);
end;
$$;
revoke all on function coderdojo.join_member_session(uuid,uuid,text) from public,anon,authenticated;
grant execute on function coderdojo.join_member_session(uuid,uuid,text) to service_role;

-- Keep the previous server deployment compatible while preserving its coder-only contract.
create or replace function coderdojo.join_coder_session(p_actor uuid,p_session uuid,p_expected_url text)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 perform 1 from coderdojo.members where id=p_actor and not deleted and is_ninja;
 if not found then raise exception 'Coder access required' using errcode='42501'; end if;
 return coderdojo.join_member_session(p_actor,p_session,p_expected_url);
end;
$$;
