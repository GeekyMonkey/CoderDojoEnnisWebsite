-- Block the portal session that has been handed over to a shared kiosk.
create table coderdojo_private.kiosk_revoked_sessions (
 session_id uuid primary key,
 auth_user_id uuid not null,
 created_at timestamptz not null default now()
);
alter table coderdojo_private.kiosk_revoked_sessions enable row level security;
revoke all on coderdojo_private.kiosk_revoked_sessions from public,anon,authenticated;
grant select,insert on coderdojo_private.kiosk_revoked_sessions to service_role;

create function coderdojo.revoke_portal_for_kiosk(p_auth_user uuid,p_session uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from coderdojo.members m where m.id=coderdojo.resolve_member_identity(p_auth_user) and m.is_mentor and not m.deleted) then
  raise exception 'Mentor access required' using errcode='42501';
 end if;
 insert into coderdojo_private.kiosk_revoked_sessions(session_id,auth_user_id) values(p_session,p_auth_user) on conflict do nothing;
end $$;
create function coderdojo.is_kiosk_session_revoked(p_session uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from coderdojo_private.kiosk_revoked_sessions where session_id=p_session)
$$;
revoke all on function coderdojo.revoke_portal_for_kiosk(uuid,uuid),coderdojo.is_kiosk_session_revoked(uuid) from public,anon,authenticated;
grant execute on function coderdojo.revoke_portal_for_kiosk(uuid,uuid),coderdojo.is_kiosk_session_revoked(uuid) to service_role;

create or replace function coderdojo_private.current_member_id() returns uuid
language sql stable security definer set search_path='' as $$
 select m.id from coderdojo_private.member_auth_bindings b join coderdojo.members m on m.id=b.member_id
 join auth.users a on a.id=b.auth_user_id and not coalesce(a.is_anonymous,false)
 where b.auth_user_id=(select auth.uid()) and not m.deleted and (m.is_ninja or m.is_parent or m.is_mentor)
 and not exists(select 1 from coderdojo_private.kiosk_revoked_sessions r where r.session_id=nullif((select auth.jwt())->>'session_id','')::uuid)
$$;
