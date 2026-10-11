# Master migration checklist

## Foundation and completed mentor workflows
- [x] Infrastructure: Supabase schema, Cloudflare Pages, automatic develop preview deployment.
- [x] Authentication: login/logout, Supabase sessions and role navigation; develop preview login verified.
- [x] Mentor attendance: session selection, filtering, search, presence toggles, totals and random coder selection.
- [x] Mentor sign-in mode: password, QR/member GUID and NFC sign-in surfaces.
- [x] Mentor badge/belt reviews: pending applications, history, approve/reject and undo.
- [ ] Verify badge/belt decisions end to end using disposable applications.

## Mentor priority queue
Feature 12 reviewed; implement features 1–4 as one batch under the user's authorization, then pause for batch code review. All UI data access must go through TanStack Query stores, with realtime invalidation for other users.

- [ ] 1. Coder management: searchable list, signup, full details/editing, teams, registration, logins and fingerprint ID.
- [ ] 2. Coder progress: goals editing and individual attendance history (achievement history implemented).
- [ ] 3. Parent relationships: search, link/unlink children and relationship views.
- [ ] 4. Mentor/parent management: lists, signup, contact details, roles and mentor skills/categories.
- [ ] 5. Team management: list/create/edit/delete teams, goals, notes and colours.
- [ ] 6. Achievement definitions: belt/badge/category CRUD.
- [ ] 7. Session management: list/create/edit/delete, hosts, topic, URL and mentor-only flag.
- [ ] 8. Duplicate accounts: merge coders/adults, preserving relationships and history.
- [ ] 9. Reports: recent belts, belt CSV, parent emails and mentor emails.
- [ ] 10. Printing: coder/mentor passports, batch passports, certificates and team cards.
- [ ] 11. Data maintenance: inactive member/parent cleanup and registration purge.
- [x] 12. My Profile: role-neutral own-profile store and reusable UI, names/contact details, external handles, guarded save and password change; separate selected-user profile store and realtime refresh.
- [x] Review feature 12 code before starting feature 1.

## Other migration stories
- [ ] Public/upcoming sessions and session joining.
- [ ] Coder profile, goals, badge/belt viewing and applications, personal attendance.
- [ ] Parent dashboard, account editing and child management.
- [ ] Image upload/editing and remaining integrations (chatbot, etc.).
- [ ] Remaining tools/public pages.
- [ ] User-run test/format checks and feature-parity verification.
- [ ] Documentation and user guides.

Legacy sources remain reference-only. The 25 existing type diagnostics in legacy migration code are unchanged.
