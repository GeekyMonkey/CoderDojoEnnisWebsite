# Change: Implement parent use cases

## Why
The parent portal has placeholder home and child routes despite the legacy portal supporting linked-child management and progress views.

## What Changes
- Implement P01–P13 from the master checklist using the fully reviewed legacy Parent controller and views.
- Reuse profile, photo/avatar, achievement, attendance, team, passport and session components with store-owned API access and realtime refresh.
- Enforce current parent role and active child relationship for every child read and write; restrict edits to birth year, login, external handles, images and password.

## Impact
- Affected specs: parent-use-cases
- Affected code: parent pages/stores/APIs, shared presentation components and a guarded service-only child mutation RPC.
- User explicitly authorized implementation and automatic verified publication; no approval pause is required.
