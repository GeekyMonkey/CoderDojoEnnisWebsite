# Change: Add VEX team workspace

## Why
Ennis CoderDojo is starting a VEX IQ robotics team (first season: VEX IQ Robotics Competition 2026–27, *Level Up*). The team works in weekly sprints: a mentor sets a macro objective, members decide and own the tasks, and the following Saturday the team reviews what it found out. The member site has no place for this. The team needs a lightweight shared workspace, not a curriculum, LMS or project-management tool.

## What Changes
- **NEW** top-level `/vex` section in the member site, available to every logged-in member (mentor, coder, parent), using the existing `member-layout`, auth middleware and navigation.
- **NEW** data model in the `coderdojo` schema: `vex_seasons`, `vex_sprints`, `vex_tasks`, `vex_task_members` (many-to-many with `members`) and `vex_resources`. A season is an entity, so future seasons can be added without code changes.
- **NEW** mentor editing (season, weekly sprint and objective, resources). Mentor status is checked server-side against `members.is_mentor`.
- **NEW** member participation: create and edit tasks, take or leave ownership (multiple owners allowed), change status (To do / In progress / Done), and add notes and links.
- **NEW** server helper `GetRequestMember` / `GetRequestMentor`. It resolves the caller from the Supabase Bearer access token and the `<memberId>@coderdojoennis.com` auth email, and does not use editable `user_metadata`.
- **NEW** client store `useVexStore` that owns fetching, mutations and realtime invalidation.
- **NEW** resources page, data-driven and grouped by category, with seeded links to official VEX material and a clear explanation of VEXcode VR / Virtual Skills, including the requirement for a real controller for Virtual Driving Skills.
- **UPDATE** member-layout profile link, so shared sections like `/vex` go to the member's role profile.
- **ADD** i18n strings (en, fr, ga, uk) and Bruno requests.

Out of scope: lesson plans, badges or progression, assessment, competition results, photos and documents. The schema leaves room for these to be added later.

## Impact
- Affected specs: **NEW** `vex-workspace`
- Database: migration `docs/database/migrations/20261003120000_add_vex_workspace.sql`. It must be copied into the shared GeekyMonkeyData repo and applied, after which `src/types/supabase.ts` should be regenerated. A hand-written equivalent is included.
- Affected code: `src/app/pages/(member)/vex/**`, `src/app/components/Vex/**`, `src/app/stores/useVexStore.ts`, `src/server/api/Vex/**`, `src/server/db/Vex*Data.ts`, `src/server/utils/requestMember.ts`, `src/shared/types/models/Vex*Model.ts`, `src/shared/utils/VexHelpers.ts`, navigation, middleware, nuxt route rules, locales.
