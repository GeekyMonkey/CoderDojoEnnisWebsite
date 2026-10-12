-- Run with the migration function copied to pg_temp against these temporary tables.
-- All fixtures and function changes must be rolled back by the verification runner.
insert into pg_temp.members(id,name_first,name_last,deleted,is_ninja,is_parent,is_mentor,registered_current_term)
select ('00000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid, 'Fixture', n::text,
 n in (12,14,17), n in (2,3,4,5,6,11,12,13,14), n in (7,8,9,10,11,13,15), n in (1,6,10,17), n in (2,6,7,12)
from generate_series(1,17) n;
insert into pg_temp.member_attendances(id,member_id,date)
select gen_random_uuid(),('00000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,
 case when n in (2,6,13) then ((now() at time zone 'Europe/Dublin')::date - interval '1 year' - interval '1 day')::date
 when n=4 then ((now() at time zone 'Europe/Dublin')::date - interval '1 year')::date
 else (now() at time zone 'Europe/Dublin')::date end
from unnest(array[2,4,5,6,11,13]) n;
insert into pg_temp.member_parents(id,parent_id,member_id)
select gen_random_uuid(),('00000000-0000-4000-8000-' || lpad(p::text,12,'0'))::uuid,
 ('00000000-0000-4000-8000-' || lpad(c::text,12,'0'))::uuid
from (values (8,2),(9,5),(10,2),(13,5),(15,14)) links(p,c);

do $$
declare
 actor uuid := '00000000-0000-4000-8000-000000000001';
 report jsonb;
 applied jsonb;
 attendance_count integer;
 relationship_count integer;
begin
 report := pg_temp.maintain_data(actor,'members');
 if (report->>'coders')::int <> 3 or (report->>'parents')::int <> 3 or jsonb_array_length(report->'candidates') <> 6 then
  raise exception 'Incorrect cleanup preview: %', report;
 end if;
 if exists(select 1 from pg_temp.members where id in ('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000007') and deleted) then raise exception 'Preview mutated accounts'; end if;
 begin
  perform pg_temp.maintain_data('00000000-0000-4000-8000-000000000004','members');
  raise exception 'Non-mentor was accepted';
 exception when insufficient_privilege then null; end;
 begin
  perform pg_temp.maintain_data('00000000-0000-4000-8000-000000000017','members');
  raise exception 'Archived mentor was accepted';
 exception when insufficient_privilege then null; end;
 begin
  perform pg_temp.maintain_data(actor,'unknown');
  raise exception 'Unknown action was accepted';
 exception when invalid_parameter_value then null; end;
 begin
  perform pg_temp.maintain_data(actor,'members',true,null);
  raise exception 'Missing confirmation revision was accepted';
 exception when invalid_parameter_value then null; end;

 insert into pg_temp.member_attendances values(gen_random_uuid(),'00000000-0000-4000-8000-000000000002',(now() at time zone 'Europe/Dublin')::date);
 begin
  perform pg_temp.maintain_data(actor,'members',true,report->>'revision');
  raise exception 'Stale attendance preview was accepted' using errcode='XX000';
 exception when raise_exception then null; end;
 if exists(select 1 from pg_temp.members where id='00000000-0000-4000-8000-000000000007' and deleted) then raise exception 'Stale apply partially mutated accounts'; end if;
 delete from pg_temp.member_attendances where member_id='00000000-0000-4000-8000-000000000002' and date=(now() at time zone 'Europe/Dublin')::date;
 -- A new active child link must invalidate the parent-cleanup confirmation.
 insert into pg_temp.member_parents(id,parent_id,member_id) values(gen_random_uuid(),'00000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000005');
 begin
  perform pg_temp.maintain_data(actor,'members',true,report->>'revision');
  raise exception 'Stale relationship preview was accepted' using errcode='XX000';
 exception when raise_exception then null; end;
 delete from pg_temp.member_parents where parent_id='00000000-0000-4000-8000-000000000007';
 select count(*) into attendance_count from pg_temp.member_attendances;
 select count(*) into relationship_count from pg_temp.member_parents;
 applied := pg_temp.maintain_data(actor,'members',true,report->>'revision');
 if not(applied->>'applied')::boolean or (applied->>'coders')::int<>3 or (applied->>'parents')::int<>3 then raise exception 'Incorrect cleanup result'; end if;
 if exists(select 1 from pg_temp.members where id in ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000011') and deleted) then raise exception 'Protected account archived'; end if;
 if (select count(*) from pg_temp.member_attendances) <> attendance_count or (select count(*) from pg_temp.member_parents) <> relationship_count then raise exception 'History deleted'; end if;
 report := pg_temp.maintain_data(actor,'members');
 if jsonb_array_length(report->'candidates')<>0 then raise exception 'Cleanup was not idempotent'; end if;
 applied := pg_temp.maintain_data(actor,'members',true,report->>'revision');
 if (applied->>'coders')::int<>0 or (applied->>'parents')::int<>0 then raise exception 'Empty apply incorrect'; end if;

 report := pg_temp.maintain_data(actor,'registrations');
 if (report->>'registrations')::int<>3 then raise exception 'Registration preview excluded archived or multi-role coder'; end if;
 update pg_temp.members set registered_current_term=true where id='00000000-0000-4000-8000-000000000005';
 begin
  perform pg_temp.maintain_data(actor,'registrations',true,report->>'revision');
  raise exception 'Stale registration preview was accepted' using errcode='XX000';
 exception when raise_exception then null; end;
 update pg_temp.members set registered_current_term=false where id='00000000-0000-4000-8000-000000000005';
 applied := pg_temp.maintain_data(actor,'registrations',true,report->>'revision');
 if (applied->>'registrations')::int<>3 or exists(select 1 from pg_temp.members where is_ninja and registered_current_term) then raise exception 'Registration reset incorrect'; end if;
 if not exists(select 1 from pg_temp.members where id='00000000-0000-4000-8000-000000000007' and registered_current_term) then raise exception 'Adult registration changed'; end if;
 if (pg_temp.maintain_data(actor,'registrations')->>'registrations')::int<>0 then raise exception 'Reset not idempotent'; end if;
end;
$$;
select 'All maintenance fixture assertions passed' as verification;
