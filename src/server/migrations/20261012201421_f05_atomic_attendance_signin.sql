-- F05: preserve F03 kiosk contracts while committing attendance and login dates together.
begin;
create function coderdojo.sign_in_attendance(p_member uuid, p_date date, p_testing boolean default false)
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
 select count(*) into session_count from coderdojo.member_attendances where member_id=p_member;
 -- Preserve fingerprint testing behavior: simulate attendance but still rotate login dates.
 if p_testing then session_count:=session_count+1; end if;
 return jsonb_build_object('member',(to_jsonb(current_member)-'password_hash') || jsonb_build_object(
  'login_date',to_char(current_member.login_date,'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  'login_date_previous',to_char(current_member.login_date_previous,'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  'sessionCount',session_count);
end $$;
revoke all on function coderdojo.sign_in_attendance(uuid,date,boolean) from public,anon,authenticated;
grant execute on function coderdojo.sign_in_attendance(uuid,date,boolean) to service_role;
commit;
