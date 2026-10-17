-- Preserve every role when merging coder, parent and mentor accounts.
-- Service-only operations: callers are verified mentors, active member locks serialize maintenance.
create or replace function coderdojo.merge_members(p_actor uuid, p_keep uuid, p_duplicate uuid, p_fields jsonb, p_expected_keep jsonb, p_expected_duplicate jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 keep_member coderdojo.members%rowtype;
 duplicate_member coderdojo.members%rowtype;
 selected coderdojo.members%rowtype;
begin
 if p_keep = p_duplicate or p_actor in (p_keep, p_duplicate) then raise exception 'Cannot merge this account' using errcode='22023'; end if;
 perform 1 from coderdojo.members where id in (p_actor,p_keep,p_duplicate) order by id for update;
 if not exists(select 1 from coderdojo.members where id=p_actor and is_mentor and not deleted) then raise exception 'Mentor access required' using errcode='42501'; end if;
 select * into keep_member from coderdojo.members where id=p_keep and not deleted;
 if not found then raise exception 'Survivor unavailable' using errcode='P0002'; end if;
 select * into duplicate_member from coderdojo.members where id=p_duplicate and not deleted;
 if not found then raise exception 'Duplicate unavailable' using errcode='P0001'; end if;
 if exists(select 1 from coderdojo.member_parents where (member_id=p_keep and parent_id=p_duplicate) or (member_id=p_duplicate and parent_id=p_keep)) then raise exception 'Linked accounts cannot be merged' using errcode='22023'; end if;
 if (to_jsonb(keep_member)-array['password_hash','login_date','login_date_previous']) is distinct from p_expected_keep or (to_jsonb(duplicate_member)-array['password_hash','login_date','login_date_previous']) is distinct from p_expected_duplicate then raise exception 'Accounts changed; review again' using errcode='P0001'; end if;
 if p_fields is null or exists(select 1 from jsonb_object_keys(p_fields) k where k not in ('birth_year','email','phone','github_login','scratch_name','xbox_gamertag','team_id','goal_short_term','goal_long_term')) then raise exception 'Invalid merge fields' using errcode='22023'; end if;
 selected := jsonb_populate_record(keep_member,p_fields);
 if selected.team_id is not null and not exists(select 1 from coderdojo.teams where id=selected.team_id and not deleted) then raise exception 'Team unavailable' using errcode='P0001'; end if;
 update coderdojo.members set birth_year=selected.birth_year,email=selected.email,phone=selected.phone,github_login=selected.github_login,scratch_name=selected.scratch_name,xbox_gamertag=selected.xbox_gamertag,team_id=selected.team_id,goal_short_term=selected.goal_short_term,goal_long_term=selected.goal_long_term,
 is_ninja=keep_member.is_ninja or duplicate_member.is_ninja,is_parent=keep_member.is_parent or duplicate_member.is_parent,is_mentor=keep_member.is_mentor or duplicate_member.is_mentor,garda_vetted=keep_member.garda_vetted or duplicate_member.garda_vetted,registered_current_term=keep_member.registered_current_term or duplicate_member.registered_current_term
 where id=p_keep;
 -- Redundant source rows remain on the archived account; no history is permanently discarded.
 update coderdojo.member_attendances s set member_id=p_keep where s.member_id=p_duplicate and not exists(select 1 from coderdojo.member_attendances k where k.member_id=p_keep and k.date=s.date);
 update coderdojo.member_parents s set member_id=p_keep where s.member_id=p_duplicate and not exists(select 1 from coderdojo.member_parents k where k.member_id=p_keep and k.parent_id=s.parent_id);
 update coderdojo.member_parents s set parent_id=p_keep where s.parent_id=p_duplicate and not exists(select 1 from coderdojo.member_parents k where k.parent_id=p_keep and k.member_id=s.member_id);
 update coderdojo.member_badge_categories s set member_id=p_keep where s.member_id=p_duplicate and not exists(select 1 from coderdojo.member_badge_categories k where k.member_id=p_keep and k.badge_category_id=s.badge_category_id);
 update coderdojo.member_badges s set member_id=p_keep where s.member_id=p_duplicate and (s.awarded is null or not exists(select 1 from coderdojo.member_badges k where k.member_id=p_keep and k.badge_id=s.badge_id and k.awarded is not null));
 update coderdojo.member_belts s set member_id=p_keep where s.member_id=p_duplicate and (s.awarded is null or not exists(select 1 from coderdojo.member_belts k where k.member_id=p_keep and k.belt_id=s.belt_id and k.awarded is not null));
 update coderdojo.member_badges set awarded_by_adult_id=p_keep where awarded_by_adult_id=p_duplicate;
 update coderdojo.member_badges set rejected_by_adult_id=p_keep where rejected_by_adult_id=p_duplicate;
 update coderdojo.member_belts set awarded_by_adult_id=p_keep where awarded_by_adult_id=p_duplicate;
 update coderdojo.member_belts set rejected_by_adult_id=p_keep where rejected_by_adult_id=p_duplicate;
 update coderdojo.members set deleted=true where id=p_duplicate;
 select * into keep_member from coderdojo.members where id=p_keep;
 return to_jsonb(keep_member)-'password_hash';
end;
$$;
revoke all on function coderdojo.merge_members(uuid,uuid,uuid,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function coderdojo.merge_members(uuid,uuid,uuid,jsonb,jsonb,jsonb) to service_role;

