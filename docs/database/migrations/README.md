# Pending migrations

Database migrations live in the private shared **GeekyMonkeyData** repository (see `../supabase-shared-migrations-workflow.md`). Migrations written by contributors without access to that repo are staged here. Someone with access should apply them:

```powershell
pnpm supabase:sync
Copy-Item docs/database/migrations/<file>.sql supabase/migrations/
pnpm supabase:migrate
pnpm supabase:types
```

After applying, delete the staged file from this folder in a follow-up PR.

| File | Purpose |
|------|---------|
| `20261003120000_add_vex_workspace.sql` | VEX team workspace: seasons, sprints, tasks, task owners, resources (+ seed data) |
