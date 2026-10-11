-- Use the same lock as member maintenance so assignment and deletion cannot race.
create or replace function coderdojo.maintain_team(p_actor uuid, p_action text, p_id uuid, p_fields jsonb default '{}'::jsonb, p_expected jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 current_team coderdojo.teams%rowtype;
 next_team coderdojo.teams%rowtype;
begin
 perform pg_advisory_xact_lock(731101);
 perform 1 from coderdojo.members where id=p_actor and not deleted and is_mentor for share;
 if not found then raise exception 'Mentor access required' using errcode='42501'; end if;
 if p_action not in ('create','update','delete') then raise exception 'Invalid team action' using errcode='22023'; end if;
 if p_action <> 'create' then
  select * into current_team from coderdojo.teams where id=p_id and not deleted for update;
  if not found then raise exception 'Team not found' using errcode='P0002'; end if;
  if p_expected is null or p_expected = '{}'::jsonb or not (to_jsonb(current_team) @> p_expected) then raise exception 'Team changed elsewhere. Reload before saving.' using errcode='P0001'; end if;
 end if;
 if p_action='delete' then
  if exists(select 1 from coderdojo.members where team_id=p_id and not deleted) then raise exception 'Reassign members before deleting this team.' using errcode='P0001'; end if;
  update coderdojo.teams set deleted=true where id=p_id returning * into next_team;
 else
  if p_fields is null or (p_fields - array['team_name','goal','notes','hexcode']) <> '{}'::jsonb then raise exception 'Invalid team fields' using errcode='22023'; end if;
  next_team := jsonb_populate_record(null::coderdojo.teams,p_fields);
  if next_team.team_name is null or length(btrim(next_team.team_name)) not between 1 and 100 or length(coalesce(next_team.goal,''))>2000 or length(coalesce(next_team.notes,''))>4000 or (next_team.hexcode is not null and next_team.hexcode !~ '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$') then raise exception 'Invalid team fields' using errcode='22023'; end if;
  if exists(select 1 from coderdojo.teams where not deleted and id<>p_id and lower(btrim(team_name))=lower(btrim(next_team.team_name))) then raise exception 'A team with this name already exists.' using errcode='P0001'; end if;
  if p_action='create' then
   insert into coderdojo.teams(id,deleted,team_name,goal,notes,hexcode) values(p_id,false,btrim(next_team.team_name),next_team.goal,next_team.notes,next_team.hexcode) returning * into next_team;
  else
   update coderdojo.teams set team_name=btrim(next_team.team_name),goal=next_team.goal,notes=next_team.notes,hexcode=next_team.hexcode where id=p_id returning * into next_team;
  end if;
 end if;
 return to_jsonb(next_team);
end; $$;
revoke all on function coderdojo.maintain_team(uuid,text,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function coderdojo.maintain_team(uuid,text,uuid,jsonb,jsonb) to service_role;
