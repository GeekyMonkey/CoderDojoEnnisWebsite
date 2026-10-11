-- Serialize maintenance writes and guard snapshots without exposing privileged RPCs to browsers.
create or replace function coderdojo.maintain_member(
  p_actor uuid, p_action text, p_id uuid, p_fields jsonb default '{}'::jsonb, p_expected jsonb default '{}'::jsonb
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  current_member coderdojo.members%rowtype;
  actor_member coderdojo.members%rowtype;
  result_id uuid;
  target_parent_id uuid;
  target_category_id uuid;
  account_value coderdojo.members%rowtype;
begin
  -- A single lock gives deterministic duplicate checks across simultaneous maintenance requests.
  perform pg_advisory_xact_lock(731101);
  select * into actor_member from coderdojo.members where id = p_actor and not deleted and is_mentor for share;
  if not found then raise exception 'Mentor access required' using errcode = '42501'; end if;
  if p_action = 'create' then
    account_value := jsonb_populate_record(null::coderdojo.members, p_fields);
  else
    select * into current_member from coderdojo.members where id = p_id and not deleted for update;
    if not found then raise exception 'Member not found' using errcode = 'P0002'; end if;
    account_value := jsonb_populate_record(current_member, p_fields);
  end if;

  if p_action in ('create', 'account', 'goals', 'profile') then
    if p_action <> 'create' and not (to_jsonb(current_member) @> p_expected) then
      raise exception 'Member changed; reload before saving' using errcode = 'P0001';
    end if;
    if p_action in ('create', 'account') then
      if not (account_value.is_ninja or account_value.is_parent or account_value.is_mentor) then
        raise exception 'Select at least one role' using errcode = '22023';
      end if;
      if p_actor = p_id and not account_value.is_mentor then
        raise exception 'Cannot remove your own mentor role' using errcode = '22023';
      end if;
      if account_value.team_id is not null and not exists (select 1 from coderdojo.teams where id = account_value.team_id and not deleted) then
        raise exception 'Team not found' using errcode = '22023';
      end if;
      if exists (select 1 from coderdojo.members where not deleted and id <> p_id and
        ((account_value.login is not null and lower(trim(login)) = lower(trim(account_value.login))) or
         (account_value.fingerprint_id is not null and fingerprint_id = account_value.fingerprint_id) or
         (account_value.nfc_tag is not null and nfc_tag = account_value.nfc_tag))) then
        raise exception 'Login, fingerprint or NFC identifier already used' using errcode = '23505';
      end if;
      if p_action = 'account' and
         ((not account_value.is_parent and exists (select 1 from coderdojo.member_parents where parent_id = p_id)) or
          (not account_value.is_ninja and exists (select 1 from coderdojo.member_parents where member_id = p_id)) or
          (not account_value.is_mentor and exists (select 1 from coderdojo.member_badge_categories where member_id = p_id))) then
        raise exception 'Remove related children, parents or skills before removing their role' using errcode = '22023';
      end if;
    end if;
    if p_action = 'create' then
      insert into coderdojo.members (id,name_first,name_last,email,phone,github_login,scratch_name,xbox_gamertag,
        birth_year,fingerprint_id,nfc_tag,login,team_id,registered_current_term,is_ninja,is_parent,is_mentor,garda_vetted,password_hash)
      values (p_id,account_value.name_first,account_value.name_last,account_value.email,account_value.phone,
        account_value.github_login,account_value.scratch_name,account_value.xbox_gamertag,account_value.birth_year,
        account_value.fingerprint_id,account_value.nfc_tag,account_value.login,account_value.team_id,
        account_value.registered_current_term,account_value.is_ninja,account_value.is_parent,account_value.is_mentor,
        account_value.garda_vetted,account_value.password_hash) returning * into current_member;
    elsif p_action = 'account' then
      update coderdojo.members set birth_year=account_value.birth_year,fingerprint_id=account_value.fingerprint_id,
        nfc_tag=account_value.nfc_tag,login=account_value.login,team_id=account_value.team_id,
        registered_current_term=account_value.registered_current_term,is_ninja=account_value.is_ninja,
        is_parent=account_value.is_parent,is_mentor=account_value.is_mentor,garda_vetted=account_value.garda_vetted
      where id=p_id returning * into current_member;
    elsif p_action = 'goals' then
      if not current_member.is_ninja then raise exception 'Coder required' using errcode='22023'; end if;
      update coderdojo.members set goal_short_term=account_value.goal_short_term,goal_long_term=account_value.goal_long_term
      where id=p_id returning * into current_member;
    else
      update coderdojo.members set name_first=account_value.name_first,name_last=account_value.name_last,
        email=account_value.email,phone=account_value.phone,github_login=account_value.github_login,
        scratch_name=account_value.scratch_name,xbox_gamertag=account_value.xbox_gamertag
      where id=p_id returning * into current_member;
    end if;
    return to_jsonb(current_member) - 'password_hash';
  elsif p_action = 'password' then
    update coderdojo.members set password_hash=p_fields->>'password_hash' where id=p_id;
    return null;
  elsif p_action in ('link', 'unlink') then
    target_parent_id := (p_fields->>'parent_id')::uuid;
    perform 1 from coderdojo.members where id=target_parent_id and not deleted and is_parent for share;
    if not found or not current_member.is_ninja or p_id=target_parent_id then
      raise exception 'Active coder and parent required' using errcode='22023';
    end if;
    if p_action='unlink' then
      delete from coderdojo.member_parents where member_id=p_id and member_parents.parent_id=target_parent_id;
      return null;
    end if;
    select id into result_id from coderdojo.member_parents where member_id=p_id and member_parents.parent_id=target_parent_id limit 1;
    if result_id is null then
      insert into coderdojo.member_parents(member_id,parent_id) values(p_id,target_parent_id) returning id into result_id;
    end if;
    return jsonb_build_object('id',result_id,'memberId',p_id,'parentId',target_parent_id);
  elsif p_action in ('skill', 'unskill') then
    target_category_id := (p_fields->>'badge_category_id')::uuid;
    if not current_member.is_mentor then raise exception 'Mentor required' using errcode='22023'; end if;
    if p_action='unskill' then
      delete from coderdojo.member_badge_categories where member_id=p_id and badge_category_id=target_category_id;
      return null;
    end if;
    if not exists(select 1 from coderdojo.badge_categories where id=target_category_id and not deleted) then
      raise exception 'Category not found' using errcode='22023';
    end if;
    select id into result_id from coderdojo.member_badge_categories where member_id=p_id and badge_category_id=target_category_id limit 1;
    if result_id is null then
      insert into coderdojo.member_badge_categories(member_id,badge_category_id) values(p_id,target_category_id) returning id into result_id;
    end if;
    return jsonb_build_object('id',result_id,'memberId',p_id,'badgeCategoryId',target_category_id);
  end if;
  raise exception 'Unsupported maintenance action' using errcode='22023';
end;
$$;
revoke all on function coderdojo.maintain_member(uuid,text,uuid,jsonb,jsonb) from public, anon, authenticated;
grant execute on function coderdojo.maintain_member(uuid,text,uuid,jsonb,jsonb) to service_role;
