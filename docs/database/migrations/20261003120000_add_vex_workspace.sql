-- ============================================================================
-- VEX team workspace
-- ----------------------------------------------------------------------------
-- Adds seasons, weekly sprints, team-created tasks (with many-to-many owners
-- linked to existing coderdojo.members), and a data-driven resources list.
--
-- Copy this file into the shared GeekyMonkeyData repo `migrations/` folder and
-- run `pnpm supabase:migrate`, then `pnpm supabase:types` to regenerate
-- src/types/supabase.ts (a hand-written equivalent is already in this PR).
--
-- All writes go through the Nuxt server API using the service-role client
-- (same as existing tables). RLS is enabled with read-only policies for
-- authenticated users so client-side Supabase Realtime events are delivered.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Seasons
-- ---------------------------------------------------------------------------
create table if not exists coderdojo.vex_seasons (
	id uuid primary key default gen_random_uuid(),
	slug text not null,
	season_label text not null,
	program_name text not null default 'VEX IQ Robotics Competition',
	competition_name text not null,
	description text null,
	is_current boolean not null default false,
	start_date date null,
	end_date date null,
	deleted boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create unique index if not exists vex_seasons_slug_key
	on coderdojo.vex_seasons (slug);

-- Only one current season at a time
create unique index if not exists vex_seasons_one_current
	on coderdojo.vex_seasons (is_current)
	where is_current and not deleted;

-- ---------------------------------------------------------------------------
-- Weekly sprints (mentor sets the macro objective)
-- ---------------------------------------------------------------------------
create table if not exists coderdojo.vex_sprints (
	id uuid primary key default gen_random_uuid(),
	season_id uuid not null references coderdojo.vex_seasons (id),
	sprint_number integer not null,
	title text null,
	objective text null,
	mentor_notes text null,
	start_date date null,
	review_date date null,
	status text not null default 'planned'
		check (status in ('planned', 'current', 'complete')),
	created_by_member_id uuid null references coderdojo.members (id),
	deleted boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create unique index if not exists vex_sprints_season_number_key
	on coderdojo.vex_sprints (season_id, sprint_number)
	where not deleted;

create index if not exists vex_sprints_season_id_idx
	on coderdojo.vex_sprints (season_id);

-- ---------------------------------------------------------------------------
-- Team-created tasks
-- ---------------------------------------------------------------------------
create table if not exists coderdojo.vex_tasks (
	id uuid primary key default gen_random_uuid(),
	sprint_id uuid not null references coderdojo.vex_sprints (id),
	title text not null,
	notes text null,
	link_url text null,
	status text not null default 'todo'
		check (status in ('todo', 'in_progress', 'done')),
	created_by_member_id uuid null references coderdojo.members (id),
	updated_by_member_id uuid null references coderdojo.members (id),
	deleted boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists vex_tasks_sprint_id_idx
	on coderdojo.vex_tasks (sprint_id);

-- ---------------------------------------------------------------------------
-- Task owners (many-to-many with existing members)
-- ---------------------------------------------------------------------------
create table if not exists coderdojo.vex_task_members (
	id uuid primary key default gen_random_uuid(),
	task_id uuid not null references coderdojo.vex_tasks (id) on delete cascade,
	member_id uuid not null references coderdojo.members (id),
	created_at timestamptz not null default now()
);

create unique index if not exists vex_task_members_task_member_key
	on coderdojo.vex_task_members (task_id, member_id);

create index if not exists vex_task_members_member_id_idx
	on coderdojo.vex_task_members (member_id);

-- ---------------------------------------------------------------------------
-- Resources (season-specific when season_id is set, otherwise general)
-- ---------------------------------------------------------------------------
create table if not exists coderdojo.vex_resources (
	id uuid primary key default gen_random_uuid(),
	season_id uuid null references coderdojo.vex_seasons (id),
	category text not null,
	title text not null,
	description text null,
	url text not null,
	resource_type text not null default 'website'
		check (resource_type in ('website', 'video', 'document', 'tool', 'forum')),
	sort_order integer not null default 0,
	is_active boolean not null default true,
	deleted boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists vex_resources_category_idx
	on coderdojo.vex_resources (category, sort_order);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function coderdojo.vex_set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists vex_seasons_updated_at on coderdojo.vex_seasons;
create trigger vex_seasons_updated_at before update on coderdojo.vex_seasons
	for each row execute function coderdojo.vex_set_updated_at();

drop trigger if exists vex_sprints_updated_at on coderdojo.vex_sprints;
create trigger vex_sprints_updated_at before update on coderdojo.vex_sprints
	for each row execute function coderdojo.vex_set_updated_at();

drop trigger if exists vex_tasks_updated_at on coderdojo.vex_tasks;
create trigger vex_tasks_updated_at before update on coderdojo.vex_tasks
	for each row execute function coderdojo.vex_set_updated_at();

drop trigger if exists vex_resources_updated_at on coderdojo.vex_resources;
create trigger vex_resources_updated_at before update on coderdojo.vex_resources
	for each row execute function coderdojo.vex_set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security: logged-in members may read; writes via server API only
-- ---------------------------------------------------------------------------
alter table coderdojo.vex_seasons enable row level security;
alter table coderdojo.vex_sprints enable row level security;
alter table coderdojo.vex_tasks enable row level security;
alter table coderdojo.vex_task_members enable row level security;
alter table coderdojo.vex_resources enable row level security;

create policy vex_seasons_read on coderdojo.vex_seasons
	for select to authenticated using (true);
create policy vex_sprints_read on coderdojo.vex_sprints
	for select to authenticated using (true);
create policy vex_tasks_read on coderdojo.vex_tasks
	for select to authenticated using (true);
create policy vex_task_members_read on coderdojo.vex_task_members
	for select to authenticated using (true);
create policy vex_resources_read on coderdojo.vex_resources
	for select to authenticated using (true);

grant select on
	coderdojo.vex_seasons,
	coderdojo.vex_sprints,
	coderdojo.vex_tasks,
	coderdojo.vex_task_members,
	coderdojo.vex_resources
	to authenticated;

grant all on
	coderdojo.vex_seasons,
	coderdojo.vex_sprints,
	coderdojo.vex_tasks,
	coderdojo.vex_task_members,
	coderdojo.vex_resources
	to service_role;

-- ---------------------------------------------------------------------------
-- Realtime (skip any table already in the publication)
-- ---------------------------------------------------------------------------
do $$
declare
	t text;
begin
	if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
		foreach t in array array[
			'vex_seasons', 'vex_sprints', 'vex_tasks', 'vex_task_members', 'vex_resources'
		] loop
			if not exists (
				select 1 from pg_publication_tables
				where pubname = 'supabase_realtime'
					and schemaname = 'coderdojo'
					and tablename = t
			) then
				execute format(
					'alter publication supabase_realtime add table coderdojo.%I', t
				);
			end if;
		end loop;
	end if;
end;
$$;

-- ============================================================================
-- Seed data
-- ----------------------------------------------------------------------------
-- The first season, an empty Week 1 (the mentor enters the real objective),
-- and links to official VEX material. No tasks or future weeks are seeded.
-- ============================================================================
insert into coderdojo.vex_seasons
	(slug, season_label, program_name, competition_name, description, is_current)
values (
	'2026-27-level-up',
	'2026–27',
	'VEX IQ Robotics Competition',
	'Level Up',
	'Our first VEX IQ season as an Ennis CoderDojo team.',
	true
)
on conflict (slug) do nothing;

insert into coderdojo.vex_sprints (season_id, sprint_number, status)
select s.id, 1, 'current'
from coderdojo.vex_seasons s
where s.slug = '2026-27-level-up'
	and not exists (
		select 1 from coderdojo.vex_sprints sp
		where sp.season_id = s.id and sp.sprint_number = 1
	);

insert into coderdojo.vex_resources
	(season_id, category, title, description, url, resource_type, sort_order)
select season_id, category, title, description, url, resource_type, sort_order
from (
	values
		-- The Competition
		((select id from coderdojo.vex_seasons where slug = '2026-27-level-up'),
			'competition', 'Level Up – current game',
			'The official page for this season''s VEX IQ game. Start here to see what the robots have to do.',
			'https://www.vexrobotics.com/iq/competition/viqc-current-game', 'website', 10),
		((select id from coderdojo.vex_seasons where slug = '2026-27-level-up'),
			'competition', 'Level Up game manual (updates)',
			'The rules. The manual is updated during the season, so check here for the latest version rather than relying on an old download.',
			'https://www.vexforum.com/t/viqrc-level-up-game-manual-updates/146820', 'document', 20),
		((select id from coderdojo.vex_seasons where slug = '2026-27-level-up'),
			'competition', 'Level Up forum',
			'Where teams around the world discuss the game, ask rules questions and share ideas.',
			'https://www.vexforum.com/c/vex-iq-competition-discussion/viqrc-level-up-26-27/107', 'forum', 30),
		(null, 'competition', 'Engineering notebook basics',
			'What judges look for in a team''s engineering notebook. Useful for deciding what to write down each week.',
			'https://viqrc-kb.recf.org/hc/en-us/articles/9760483909271-Engineering-Notebook-Basics', 'document', 40),
		-- VEX IQ
		(null, 'vex-iq', 'VEX Library – VEX IQ',
			'Official help articles for the VEX IQ kit: the Brain, motors, sensors, batteries and controller.',
			'https://kb.vex.com/hc/en-us/categories/360002324792-IQ', 'website', 10),
		(null, 'vex-iq', 'VEX IQ STEM Labs',
			'Short hands-on activities from VEX. Pick and choose bits that help with what the team is working on.',
			'https://education.vex.com/iq/index.php', 'website', 20),
		-- Programming
		(null, 'programming', 'VEXcode IQ',
			'The programming app for the real VEX IQ robot, using blocks or Python. Runs in the browser.',
			'https://codeiq.vex.com', 'tool', 10),
		-- VEXcode VR / Virtual Skills
		(null, 'vexcode-vr', 'VEXcode VR',
			'Program a virtual robot in your browser. No kit needed, so you can start straight away.',
			'https://vr.vex.com', 'tool', 10),
		((select id from coderdojo.vex_seasons where slug = '2026-27-level-up'),
			'vexcode-vr', 'Level Up Playground (Virtual Skills)',
			'How to open the virtual Level Up field and practise autonomous programming with the virtual competition robot.',
			'https://kb.vex.com/hc/en-us/articles/51470665788308-Get-Started-with-the-VEX-IQ-Level-Up-Playground-in-VEXcode-VR', 'document', 20),
		(null, 'vexcode-vr', 'Virtual Driving Skills controller setup',
			'Virtual Driving Skills needs a real VEX IQ (2nd gen) Controller plugged into the computer.',
			'https://kb.vex.com/hc/en-us/articles/32136521364244-Connecting-an-IQ-2nd-gen-Controller-to-Virtual-Driving-Skills', 'document', 30),
		-- Robot Design & Building
		(null, 'design-building', 'VEX IQ build instructions',
			'Official build instructions and robot models. Great for seeing how drivetrains and mechanisms go together.',
			'https://www.vexrobotics.com/iq/downloads/build-instructions', 'document', 10),
		-- Useful Videos / References
		((select id from coderdojo.vex_seasons where slug = '2026-27-level-up'),
			'videos-references', 'Level Up game reveal video',
			'A quick video showing how the Level Up game is played.',
			'https://www.youtube.com/watch?v=KP0FYPW604E', 'video', 10)
) as seed(season_id, category, title, description, url, resource_type, sort_order)
where not exists (select 1 from coderdojo.vex_resources);
