-- Preserve idempotence when mentor attendance writes race with a coder join.
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
 select p_actor,today where not exists(select 1 from coderdojo.member_attendances where member_id=p_actor and date=today) on conflict(member_id,date) do nothing;
 return jsonb_build_object('url',session_value.url,'attendanceDate',today::text);
end;
$$;
revoke all on function coderdojo.join_coder_session(uuid,uuid,text) from public,anon,authenticated;
grant execute on function coderdojo.join_coder_session(uuid,uuid,text) to service_role;
