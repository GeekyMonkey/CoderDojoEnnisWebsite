# Implementation Tasks

## 1. Data
- [x] 1.1 Migration SQL for `vex_seasons`, `vex_sprints`, `vex_tasks`, `vex_task_members` and `vex_resources`, with RLS read policies, realtime publication and seed data (season, empty Week 1, official links)
- [x] 1.2 Hand-update `src/types/supabase.ts`
- [ ] 1.3 Apply the migration through the GeekyMonkeyData repo and regenerate types (needs migrations repo access)

## 2. Server
- [x] 2.1 `GetRequestMember` / `GetRequestMentor` helpers
- [x] 2.2 `Vex*Data` data modules
- [x] 2.3 `/api/Vex/*` GET and POST endpoints
- [x] 2.4 Bruno requests under `bruno/CoderDojoEnnisApis/Vex`

## 3. Client
- [x] 3.1 Shared models and `VexHelpers` (with unit tests)
- [x] 3.2 `useVexStore` with realtime invalidation
- [x] 3.3 Components: objective, task card and dialog, workspace, history, resources, season and sprint dialogs
- [x] 3.4 Pages: home, this week, sprint, season and resources
- [x] 3.5 Navigation, middleware, route rules and layout profile link
- [x] 3.6 i18n (en, fr, ga, uk)

## 4. Validation
- [x] 4.1 Type check (no errors in new or changed files)
- [x] 4.2 Targeted unit tests (`VexHelpers`, `memberNavigation`)
- [x] 4.3 Production build
- [ ] 4.4 Manual test against a database with the migration applied
- [ ] 4.5 Native-speaker review of the Irish strings
