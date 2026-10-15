-- Explicit member-published projects; public read, trusted linked writers.
create table coderdojo.member_showcase (
 id uuid primary key default gen_random_uuid(),
 member_id uuid not null references coderdojo.members(id) on delete cascade,
 title text not null check(length(btrim(title)) between 1 and 200),
 description text not null check(length(btrim(description)) between 1 and 10000),
 project_type text not null check(project_type in ('scratch','itch','website','github_profile')),
 url text, thumbnail_path text, thumbnail_version integer not null default 0 check(thumbnail_version>=0), source_project_id text,
 showcase_date date not null default ((now() at time zone 'Europe/Dublin')::date),
 is_visible boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint showcase_url_required check ((url is not null and length(url)<=2000 and url ~* '^https?://[^[:space:]]+$') or (project_type='github_profile' and not is_visible and url is null)),
 constraint showcase_thumbnail_path check(thumbnail_path is null or thumbnail_path=id::text||'-ver'||thumbnail_version::text||'.png' and thumbnail_version>0)
);
create index member_showcase_owner_idx on coderdojo.member_showcase(member_id);
create index member_showcase_public_order_idx on coderdojo.member_showcase(showcase_date desc,created_at desc,id desc) where is_visible;
create index member_showcase_project_type_idx on coderdojo.member_showcase(project_type);
create table coderdojo_private.showcase_github_validation (
 showcase_id uuid primary key references coderdojo.member_showcase(id) on delete cascade,
 github_username text not null, validated_url text not null, checked_at timestamptz not null,
 validation_status text not null check(validation_status in ('validated','not_published','unavailable','invalidated'))
);
alter table coderdojo.member_showcase enable row level security;
alter table coderdojo_private.showcase_github_validation enable row level security;
revoke all on coderdojo_private.showcase_github_validation from public,anon,authenticated;
grant all on coderdojo_private.showcase_github_validation to service_role;
grant select on coderdojo.member_showcase to anon,authenticated;
grant insert,update,delete on coderdojo.member_showcase to authenticated;
grant all on coderdojo.member_showcase to service_role;

-- Private helper reads existing trusted identities and relationship predicates.
create function coderdojo_private.can_write_showcase(p_member uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select (select coderdojo_private.current_member_id()) is not null and
 exists(select 1 from coderdojo.members m where m.id=p_member and not m.deleted) and
 (p_member=(select coderdojo_private.current_member_id()) or (select coderdojo_private.is_mentor()) or coderdojo_private.linked_child(p_member))
$$;
revoke all on function coderdojo_private.can_write_showcase(uuid) from public,anon;
grant execute on function coderdojo_private.can_write_showcase(uuid) to authenticated,service_role;
create policy showcase_public_read on coderdojo.member_showcase for select to anon,authenticated using(true);
create policy showcase_insert on coderdojo.member_showcase for insert to authenticated with check(coderdojo_private.can_write_showcase(member_id));
create policy showcase_update on coderdojo.member_showcase for update to authenticated using(coderdojo_private.can_write_showcase(member_id)) with check(coderdojo_private.can_write_showcase(member_id));
create policy showcase_delete on coderdojo.member_showcase for delete to authenticated using(coderdojo_private.can_write_showcase(member_id));

-- Reserve per-item versions independently of saves so concurrent or failed uploads
-- never reuse an object name. Counters contain no images or public member data.
create table coderdojo_private.showcase_thumbnail_versions (
 showcase_id uuid primary key,
 member_id uuid not null references coderdojo.members(id) on delete cascade,
 version integer not null check(version>0)
);
alter table coderdojo_private.showcase_thumbnail_versions enable row level security;
revoke all on coderdojo_private.showcase_thumbnail_versions from public,anon,authenticated;
grant all on coderdojo_private.showcase_thumbnail_versions to service_role;
create function coderdojo.reserve_showcase_thumbnail_version(p_id uuid,p_member uuid) returns integer
language plpgsql security definer set search_path='' as $$
declare result integer;
begin
 if not coderdojo_private.can_write_showcase(p_member) then raise exception 'Showcase access denied' using errcode='42501'; end if;
 if exists(select 1 from coderdojo.member_showcase where id=p_id and member_id<>p_member) then raise exception 'Showcase access denied' using errcode='42501'; end if;
 insert into coderdojo_private.showcase_thumbnail_versions(showcase_id,member_id,version) values(p_id,p_member,1)
 on conflict(showcase_id) do update set version=coderdojo_private.showcase_thumbnail_versions.version+1
 where coderdojo_private.showcase_thumbnail_versions.member_id=p_member
 returning version into result;
 if result is null then raise exception 'Showcase access denied' using errcode='42501'; end if;
 return result;
end $$;
revoke all on function coderdojo.reserve_showcase_thumbnail_version(uuid,uuid) from public,anon;
grant execute on function coderdojo.reserve_showcase_thumbnail_version(uuid,uuid) to authenticated,service_role;

-- Durable storage cleanup survives failed requests, direct deletes and member cascades.
create table coderdojo_private.showcase_image_cleanup (
 path text primary key, queued_at timestamptz not null default now()
);
alter table coderdojo_private.showcase_image_cleanup enable row level security;
revoke all on coderdojo_private.showcase_image_cleanup from public,anon,authenticated;
grant all on coderdojo_private.showcase_image_cleanup to service_role;
create function coderdojo_private.queue_showcase_image_cleanup() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_op='DELETE' then
  if old.thumbnail_path is not null then insert into coderdojo_private.showcase_image_cleanup(path) values(old.thumbnail_path) on conflict do nothing; end if;
 elsif old.thumbnail_path is distinct from new.thumbnail_path and old.thumbnail_path is not null then
  insert into coderdojo_private.showcase_image_cleanup(path) values(old.thumbnail_path) on conflict do nothing;
 end if;
 return null;
end $$;
revoke all on function coderdojo_private.queue_showcase_image_cleanup() from public,anon,authenticated;
create trigger queue_showcase_image_cleanup after update or delete on coderdojo.member_showcase for each row execute function coderdojo_private.queue_showcase_image_cleanup();
create function coderdojo.showcase_cleanup_paths() returns table(path text)
language sql security definer set search_path='' as $$
 select q.path from coderdojo_private.showcase_image_cleanup q
 where not exists(select 1 from coderdojo.member_showcase s where s.thumbnail_path=q.path)
 order by q.queued_at limit 100
$$;
create function coderdojo.ack_showcase_cleanup(p_paths text[]) returns void
language sql security definer set search_path='' as $$
 delete from coderdojo_private.showcase_image_cleanup q where q.path=any(p_paths)
 and not exists(select 1 from coderdojo.member_showcase s where s.thumbnail_path=q.path)
$$;
revoke all on function coderdojo.showcase_cleanup_paths() from public,anon,authenticated;
revoke all on function coderdojo.ack_showcase_cleanup(text[]) from public,anon,authenticated;
grant execute on function coderdojo.showcase_cleanup_paths() to service_role;
grant execute on function coderdojo.ack_showcase_cleanup(text[]) to service_role;

-- Direct writes cannot transfer ownership or bypass the server's publication evidence.
create function coderdojo_private.guard_showcase() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' then
  if new.thumbnail_version<old.thumbnail_version or (new.thumbnail_path is not distinct from old.thumbnail_path and new.thumbnail_version<>old.thumbnail_version) then raise exception 'Invalid thumbnail version' using errcode='42501'; end if;
  if new.member_id<>old.member_id or new.id<>old.id or new.created_at<>old.created_at then raise exception 'Showcase identity is immutable' using errcode='42501'; end if;
 else new.created_at=now(); end if;
 new.updated_at=clock_timestamp();
 if new.thumbnail_path is not null and exists(select 1 from coderdojo_private.showcase_image_cleanup q where q.path=new.thumbnail_path) then
  raise exception 'Thumbnail has been retired; upload a new image' using errcode='42501';
 end if;
 if tg_op='UPDATE' then
  -- Presentation refreshes do not republish or change the project's content.
  if (to_jsonb(new)-'updated_at')=(to_jsonb(old)-'updated_at') then return new; end if;
 end if;
 if new.project_type='github_profile' and new.is_visible and not exists(
  select 1 from coderdojo_private.showcase_github_validation v join coderdojo.members m on m.id=new.member_id
  where v.showcase_id=new.id and v.validation_status='validated' and lower(v.github_username)=lower(m.github_login)
  and v.validated_url=new.url and v.checked_at>now()-interval '2 minutes'
  and (tg_op<>'UPDATE' or v.checked_at>old.updated_at)
 ) then raise exception 'Validate GitHub Pages before publishing' using errcode='42501'; end if;
 return new;
end $$;
revoke all on function coderdojo_private.guard_showcase() from public,anon,authenticated;
create trigger guard_showcase before insert or update on coderdojo.member_showcase for each row execute function coderdojo_private.guard_showcase();

-- Only service credentials can record checked evidence, never anonymous table readers.
create function coderdojo.record_showcase_validation(p_id uuid,p_username text,p_url text) returns void
language sql security definer set search_path='' as $$
 insert into coderdojo_private.showcase_github_validation(showcase_id,github_username,validated_url,checked_at,validation_status)
 values(p_id,p_username,p_url,clock_timestamp(),'validated')
 on conflict(showcase_id) do update set github_username=excluded.github_username,validated_url=excluded.validated_url,checked_at=excluded.checked_at,validation_status='validated'
$$;
revoke all on function coderdojo.record_showcase_validation(uuid,text,text) from public,anon,authenticated;
grant execute on function coderdojo.record_showcase_validation(uuid,text,text) to service_role;

-- Row-free public signals also cover hidden/deleted entries and member presentation changes.
create function coderdojo_private.broadcast_showcase() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_table_name='members' then
 if new.github_login is distinct from old.github_login then
  update coderdojo_private.showcase_github_validation v set validation_status='invalidated'
   from coderdojo.member_showcase s where s.id=v.showcase_id and s.member_id=new.id;
  update coderdojo.member_showcase set is_visible=false where member_id=new.id and project_type='github_profile' and is_visible;
 end if;
 end if;
 if tg_table_name='members' then
  update coderdojo.member_showcase set updated_at=clock_timestamp() where member_id=new.id;
 end if;
 perform realtime.send('{}'::jsonb,'invalidate','coderdojo:showcase',false);
 return null;
end $$;
revoke all on function coderdojo_private.broadcast_showcase() from public,anon,authenticated;
create trigger broadcast_showcase after insert or update or delete on coderdojo.member_showcase for each row execute function coderdojo_private.broadcast_showcase();
create trigger broadcast_showcase_member after update of github_login,scratch_name,login,name_first,name_last,has_avatar,has_photo,is_ninja,is_parent,is_mentor,deleted on coderdojo.members for each row execute function coderdojo_private.broadcast_showcase();

insert into storage.buckets(id,name,public) values('showcase','showcase',true) on conflict(id) do update set public=true;
-- Storage is accessed through authorized server endpoints. No direct client object writes.
