-- Share the maintenance lock so profile and mentor account edits cannot claim the same login.
create or replace function coderdojo.save_profile(p_actor uuid, p_id uuid, p_fields jsonb, p_expected jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 actor_member coderdojo.members%rowtype;
 current_member coderdojo.members%rowtype;
 updated_member coderdojo.members%rowtype;
 allowed_keys text[] := array['login','name_first','name_last','email','phone','github_login','scratch_name','xbox_gamertag'];
begin
 perform pg_advisory_xact_lock(731101);
 select * into actor_member from coderdojo.members where id=p_actor and not deleted for share;
 if not found or (p_actor <> p_id and not actor_member.is_mentor) then
  raise exception 'Profile access denied' using errcode='42501';
 end if;
 if jsonb_typeof(p_fields) <> 'object' or jsonb_typeof(p_expected) <> 'object' or
    not (p_fields ?& allowed_keys) or not (p_expected ?& allowed_keys) or
    (p_fields - allowed_keys) <> '{}'::jsonb or (p_expected - allowed_keys) <> '{}'::jsonb then
  raise exception 'Invalid profile fields' using errcode='22023';
 end if;
 select * into current_member from coderdojo.members where id=p_id and not deleted for update;
 if not found then raise exception 'Profile not found' using errcode='P0002'; end if;
 if not (to_jsonb(current_member) @> p_expected) then
  raise exception 'Profile changed; reload before saving' using errcode='P0001';
 end if;
 updated_member := jsonb_populate_record(current_member,p_fields);
 updated_member.login := trim(updated_member.login);
 if updated_member.login is null or length(updated_member.login) < 1 or length(updated_member.login) > 100 then
  raise exception 'Enter a login of at most 100 characters' using errcode='22023';
 end if;
 -- Existing duplicate identities remain untouched until their owners choose a new login.
 if updated_member.login is distinct from current_member.login and exists (
  select 1 from coderdojo.members where not deleted and id <> p_id and lower(trim(login))=lower(updated_member.login)
 ) then raise exception 'Login already used; choose another login' using errcode='23505'; end if;
 update coderdojo.members set login=updated_member.login,name_first=updated_member.name_first,name_last=updated_member.name_last,
  email=updated_member.email,phone=updated_member.phone,github_login=updated_member.github_login,
  scratch_name=updated_member.scratch_name,xbox_gamertag=updated_member.xbox_gamertag
 where id=p_id returning * into updated_member;
 return to_jsonb(updated_member) - 'password_hash';
end;
$$;
revoke all on function coderdojo.save_profile(uuid,uuid,jsonb,jsonb) from public, anon, authenticated;
grant execute on function coderdojo.save_profile(uuid,uuid,jsonb,jsonb) to service_role;
