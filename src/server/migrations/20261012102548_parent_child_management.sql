-- Parent edits share the existing profile/maintenance lock and never widen save_profile permissions.
create or replace function coderdojo.maintain_parent_child(p_actor uuid,p_id uuid,p_action text,p_fields jsonb,p_expected jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 actor_member coderdojo.members%rowtype;
 current_member coderdojo.members%rowtype;
 updated_member coderdojo.members%rowtype;
 allowed_keys text[];
begin
 perform pg_advisory_xact_lock(731101);
 select * into actor_member from coderdojo.members where id=p_actor and not deleted for share;
 if not found or not actor_member.is_parent then raise exception 'Parent access required' using errcode='42501'; end if;
 perform 1 from coderdojo.member_parents where parent_id=p_actor and member_id=p_id for share;
 if not found then raise exception 'Child unavailable' using errcode='42501'; end if;
 select * into current_member from coderdojo.members where id=p_id and not deleted and is_ninja for update;
 if not found then raise exception 'Child unavailable' using errcode='P0002'; end if;
 if p_action='save' then allowed_keys:=array['birth_year','login','github_login','scratch_name','xbox_gamertag'];
 elsif p_action='password' then allowed_keys:=array['password_hash'];
 elsif p_action='images' then allowed_keys:=array['has_photo','has_avatar'];
 else raise exception 'Invalid child action' using errcode='22023'; end if;
 if jsonb_typeof(p_fields) is distinct from 'object' or not(p_fields ?& allowed_keys) or (p_fields-allowed_keys)<>'{}'::jsonb then raise exception 'Invalid child fields' using errcode='22023'; end if;
 if p_action<>'password' then
  if jsonb_typeof(p_expected) is distinct from 'object' or not(p_expected ?& allowed_keys) or (p_expected-allowed_keys)<>'{}'::jsonb then raise exception 'Invalid child snapshot' using errcode='22023'; end if;
  if not(to_jsonb(current_member) @> p_expected) then raise exception 'Child changed; reload before saving' using errcode='P0001'; end if;
 elsif p_expected<>'{}'::jsonb then raise exception 'Invalid password snapshot' using errcode='22023'; end if;
 updated_member:=jsonb_populate_record(current_member,p_fields);
 if p_action='save' then
  updated_member.login:=trim(updated_member.login);
  if updated_member.login is null or length(updated_member.login)<1 or length(updated_member.login)>100 or
   (updated_member.birth_year is not null and (updated_member.birth_year<1900 or updated_member.birth_year>extract(year from current_date))) or
   length(coalesce(updated_member.github_login,''))>100 or length(coalesce(updated_member.scratch_name,''))>100 or length(coalesce(updated_member.xbox_gamertag,''))>100 then raise exception 'Invalid child account fields' using errcode='22023'; end if;
  if updated_member.login is distinct from current_member.login and exists(select 1 from coderdojo.members where not deleted and id<>p_id and lower(trim(login))=lower(updated_member.login)) then raise exception 'Login already used; choose another login' using errcode='23505'; end if;
  update coderdojo.members set birth_year=updated_member.birth_year,login=updated_member.login,github_login=updated_member.github_login,scratch_name=updated_member.scratch_name,xbox_gamertag=updated_member.xbox_gamertag where id=p_id returning * into updated_member;
 elsif p_action='password' then
  if updated_member.password_hash is null or updated_member.password_hash!~'^[0-9a-f]{64}$' then raise exception 'Invalid password hash' using errcode='22023'; end if;
  update coderdojo.members set password_hash=updated_member.password_hash where id=p_id returning * into updated_member;
 else
  if jsonb_typeof(p_fields->'has_photo')<>'boolean' or jsonb_typeof(p_fields->'has_avatar')<>'boolean' then raise exception 'Invalid image flags' using errcode='22023'; end if;
  update coderdojo.members set has_photo=updated_member.has_photo,has_avatar=updated_member.has_avatar where id=p_id returning * into updated_member;
 end if;
 return to_jsonb(updated_member)-'password_hash';
end;
$$;
revoke all on function coderdojo.maintain_parent_child(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function coderdojo.maintain_parent_child(uuid,uuid,text,jsonb,jsonb) to service_role;
