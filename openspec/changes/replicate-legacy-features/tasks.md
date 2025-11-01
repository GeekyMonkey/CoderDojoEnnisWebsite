# Tasks: replicate-legacy-features

1. ~~**Setup Infrastructure**: Configure Supabase project, migrate database schema from SQL Server to Postgres, set up Cloudflare Workers environment.~~ [DONE]
2. ~~**Authentication System**: Implement login/logout pages, role-based middleware, integrate Supabase Auth.~~ [DONE]
3. **Public Features**: Implement upcoming sessions, sign-in functionality.
4. **Member Profile Management**: Create profile view/edit pages, handle external links (Github, Xbox, Scratch).
5. **Goals Management**: Implement short-term/long-term goals, badge goal applications.
6. **Badges System**: Build badge viewing, application, approval/rejection for mentors.
7. **Belts System**: Implement belt viewing, application, approval/rejection.
8. **Attendance Tracking**: Develop personal attendance history view, mentor attendance management.
9. **Session Management**: Create session listing, joining, mentor session CRUD.
10. **Team Management**: Build team viewing, CRUD for mentors.
11. **Parent Portal**: Implement parent dashboard, my kids view, account editing, child management.
12. **Mentor Portal**: Develop mentor dashboard, member/adult management, belt/badge approvals.
13. **Admin Tools**: Add data maintenance, sign-in mode, passports printing.
14. **Integrations**: Add Github API, Chatbot API, image upload, SignalR equivalent with Supabase realtime.
15. **Testing**: Write unit/integration tests for all components and APIs.
16. **Validation**: Test feature parity against PreviousFeatures.md, ensure all scenarios work.
17. **Documentation**: Update README, add user guides.

Dependencies: 1 before all others. 2 before user-specific features. Parallelizable: 3-14 can be done in parallel after 1-2.