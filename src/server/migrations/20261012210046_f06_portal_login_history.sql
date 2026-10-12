-- F06: rotate successful portal login history without creating attendance.
begin;
create function coderdojo.record_portal_login(p_member uuid,p_auth_user uuid,p_kind text,p_credential text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare current_member coderdojo.members%rowtype;
begin
 if p_kind is null or p_kind not in ('password','nfc') or p_credential is null then
  raise exception 'Invalid login completion' using errcode='22023';
 end if;
 perform pg_advisory_xact_lock(731101);
 select * into current_member from coderdojo.members where id=p_member and not deleted for update;
 if not found or coderdojo.resolve_member_identity(p_auth_user) is distinct from p_member then
  raise exception 'Member unavailable' using errcode='42501';
 end if;
 if (p_kind='password' and current_member.password_hash is distinct from p_credential)
  or (p_kind='nfc' and current_member.nfc_tag is distinct from p_credential) then
  raise exception 'Credentials changed' using errcode='42501';
 end if;
 update coderdojo.members set login_date_previous=login_date,
  login_date=date_trunc('milliseconds',clock_timestamp() at time zone 'UTC')
 where id=p_member returning * into current_member;
 return (to_jsonb(current_member)-'password_hash') || jsonb_build_object(
  'login_date',to_char(current_member.login_date,'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  'login_date_previous',to_char(current_member.login_date_previous,'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
end $$;
revoke all on function coderdojo.record_portal_login(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function coderdojo.record_portal_login(uuid,uuid,text,text) to service_role;
commit;
