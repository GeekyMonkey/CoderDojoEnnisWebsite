-- Serialize definition changes with member skill assignments and preserve historical rows.
create or replace function coderdojo.maintain_definition(p_actor uuid,p_kind text,p_action text,p_id uuid,p_fields jsonb default '{}'::jsonb,p_expected jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 current_value jsonb;
 name_value text;
 description_value text;
 hex_value text;
 sort_value integer;
 category_value uuid;
begin
 perform pg_advisory_xact_lock(731101);
 perform 1 from coderdojo.members where id=p_actor and not deleted and is_mentor for share;
 if not found then raise exception 'Mentor access required' using errcode='42501'; end if;
 if p_kind not in ('belt','badge','category') or p_action not in ('create','update','delete') then raise exception 'Invalid definition action' using errcode='22023'; end if;
 if p_action <> 'create' then
  if p_kind='belt' then
   select jsonb_build_object('name',coalesce(color,''),'description',description,'hexCode',hex_code,'sortOrder',sort_order,'categoryId',null) into current_value from coderdojo.belts where id=p_id and not deleted for update;
  elsif p_kind='badge' then
   select jsonb_build_object('name',coalesce(achievement,''),'description',description,'hexCode',null,'sortOrder',null,'categoryId',badge_category_id) into current_value from coderdojo.badges where id=p_id and not deleted for update;
  else
   select jsonb_build_object('name',coalesce(category_name,''),'description',category_description,'hexCode',null,'sortOrder',null,'categoryId',null) into current_value from coderdojo.badge_categories where id=p_id and not deleted for update;
  end if;
  if current_value is null then raise exception 'Definition not found' using errcode='P0002'; end if;
  if p_expected is distinct from current_value then raise exception 'Definition changed elsewhere. Reload before saving.' using errcode='P0001'; end if;
 end if;
 if p_action='delete' then
  if p_kind='category' and (exists(select 1 from coderdojo.badges where badge_category_id=p_id and not deleted) or exists(select 1 from coderdojo.member_badge_categories where badge_category_id=p_id)) then raise exception 'Reassign badges and remove mentor skills before deleting this category.' using errcode='P0001'; end if;
  if p_kind='belt' then update coderdojo.belts set deleted=true where id=p_id;
  elsif p_kind='badge' then update coderdojo.badges set deleted=true where id=p_id;
  else update coderdojo.badge_categories set deleted=true where id=p_id; end if;
  return current_value || jsonb_build_object('id',p_id,'kind',p_kind,'deleted',true);
 end if;
 if p_fields is null or (p_fields - array['name','description','hexCode','sortOrder','categoryId']) <> '{}'::jsonb then raise exception 'Invalid definition fields' using errcode='22023'; end if;
 name_value := btrim(p_fields->>'name'); description_value := p_fields->>'description'; hex_value := p_fields->>'hexCode'; sort_value := (p_fields->>'sortOrder')::integer; category_value := (p_fields->>'categoryId')::uuid;
 if name_value is null or length(name_value) not between 1 and 150 or length(coalesce(description_value,''))>4000 or (hex_value is not null and hex_value !~ '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$') or (p_kind='belt' and (sort_value is null or sort_value not between 0 and 10000)) or (p_kind<>'belt' and (sort_value is not null or hex_value is not null)) or (p_kind<>'badge' and category_value is not null) then raise exception 'Invalid definition fields' using errcode='22023'; end if;
 if p_kind='badge' and not exists(select 1 from coderdojo.badge_categories where id=category_value and not deleted) then raise exception 'Select an active category.' using errcode='22023'; end if;
 if (p_kind='belt' and exists(select 1 from coderdojo.belts where not deleted and id<>p_id and lower(btrim(color))=lower(name_value))) or (p_kind='category' and exists(select 1 from coderdojo.badge_categories where not deleted and id<>p_id and lower(btrim(category_name))=lower(name_value))) or (p_kind='badge' and exists(select 1 from coderdojo.badges where not deleted and id<>p_id and badge_category_id=category_value and lower(btrim(achievement))=lower(name_value))) then raise exception 'A definition with this name already exists.' using errcode='P0001'; end if;
 if p_kind='belt' then
  if p_action='create' then insert into coderdojo.belts(id,deleted,color,description,hex_code,sort_order) values(p_id,false,name_value,description_value,hex_value,sort_value);
  else update coderdojo.belts set color=name_value,description=description_value,hex_code=hex_value,sort_order=sort_value where id=p_id; end if;
 elsif p_kind='badge' then
  if p_action='create' then insert into coderdojo.badges(id,deleted,achievement,description,badge_category_id) values(p_id,false,name_value,description_value,category_value);
  else update coderdojo.badges set achievement=name_value,description=description_value,badge_category_id=category_value where id=p_id; end if;
 else
  if p_action='create' then insert into coderdojo.badge_categories(id,deleted,category_name,category_description) values(p_id,false,name_value,description_value);
  else update coderdojo.badge_categories set category_name=name_value,category_description=description_value where id=p_id; end if;
 end if;
 return jsonb_build_object('id',p_id,'kind',p_kind,'deleted',false,'name',name_value,'description',description_value,'hexCode',hex_value,'sortOrder',sort_value,'categoryId',category_value);
end; $$;
revoke all on function coderdojo.maintain_definition(uuid,text,text,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function coderdojo.maintain_definition(uuid,text,text,uuid,jsonb,jsonb) to service_role;
