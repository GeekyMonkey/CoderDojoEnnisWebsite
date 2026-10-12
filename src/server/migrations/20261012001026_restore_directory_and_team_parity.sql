-- Legacy images retain their JPG paths; new uploads use immutable revision-specific objects.
alter table coderdojo.teams add column if not exists has_image boolean not null default true;
alter table coderdojo.teams alter column has_image set default false;
alter table coderdojo.teams add column if not exists image_revision uuid;

-- Signup and optional selected-session attendance are one transaction using existing duplicate checks.
create or replace function coderdojo.signup_member(p_actor uuid, p_id uuid, p_fields jsonb, p_attendance_date date default null)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare created_member jsonb;
begin
  created_member := coderdojo.maintain_member(p_actor, 'create', p_id, p_fields - 'attendance_date', '{}'::jsonb);
  if p_attendance_date is not null then
    if p_attendance_date < date '1900-01-01' or p_attendance_date > current_date then
      raise exception 'Invalid signup attendance date' using errcode = '22023';
    end if;
    insert into coderdojo.member_attendances(member_id, date) values (p_id, p_attendance_date);
  end if;
  return created_member;
end;
$$;
revoke all on function coderdojo.signup_member(uuid,uuid,jsonb,date) from public, anon, authenticated;
grant execute on function coderdojo.signup_member(uuid,uuid,jsonb,date) to service_role;
