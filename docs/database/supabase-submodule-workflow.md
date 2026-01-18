# Supabase Submodule Workflow

This document explains how to work with the shared Supabase migrations in this project.

## Overview

The `supabase/` folder at the project root is a **git submodule** that references a separate repository containing our database migrations. This allows multiple projects to share the same database schema and migrations.

## Step 4: Configure Submodule in Your Other Project

If you need to add this same shared Supabase repository to another project:

### Quick Setup

```powershell
# Navigate to your other project root
cd path/to/your/other/project

# Add the submodule
git submodule add https://github.com/yourorg/GeekyMonkeyData.git supabase
git submodule update --init --remote supabase

# Update package.json scripts (see below)

# Commit the submodule
git add .gitmodules supabase
git commit -m "Add supabase as submodule"
git push
```

### Required package.json Scripts

Add these scripts to your other project's `package.json`:

```json
"scripts": {
  "supabase:check-sync": "node -e \"const{execSync:e}=require('child_process');try{const s=e('git -C .. submodule status supabase',{encoding:'utf8'});if(s.startsWith('+')){console.error('[ERROR] Supabase submodule is out of sync.');console.error('Run: pnpm supabase:sync');process.exit(1)}console.log('[OK] Supabase submodule is in sync')}catch(err){console.error('[ERROR] Could not check submodule status:',err.message);process.exit(1)}\"",
  "supabase:sync": "node -e \"const{execSync:e}=require('child_process');try{e('git -C .. submodule update --init --remote supabase',{stdio:'inherit'});console.log('[OK] Supabase submodule synced')}catch(err){console.error('[ERROR] Failed to sync submodule:',err.message);process.exit(1)}\"",
  "supabase:protect": "node -e \"const{execSync:e}=require('child_process');try{const s=e('git -C ../supabase status --porcelain',{encoding:'utf8'});if(s.trim()){console.error('[ERROR] Uncommitted changes in supabase submodule detected!');console.error('The supabase folder should only be modified in its dedicated repository.');console.error('Changes:\\n'+s);process.exit(1)}console.log('[OK] No local changes in submodule')}catch(err){console.error('[WARN] Could not check submodule changes:',err.message)}\"",
  "supabase-migrate": "pnpm supabase:protect && pnpm supabase:check-sync && supabase db push --workdir ../supabase",
  "supabase-migrate:force": "pnpm supabase:sync && supabase db push --workdir ../supabase",
  "supabase-types": "pnpm supabase:check-sync && supabase gen types typescript --workdir ../supabase --project-id YOUR_PROJECT_ID --schema YOUR_SCHEMA > types/supabase.ts",
  "supabase-reset": "pnpm supabase:check-sync && supabase db reset --workdir ../supabase"
}
```

**Note:** Update `YOUR_PROJECT_ID` and `YOUR_SCHEMA` with your actual Supabase project values.

### Adjusting Paths

If your other project has a different structure (e.g., no `src/` folder), you may need to adjust:
- The `--workdir` path in the scripts
- The `-C ..` path if running from a different directory
- The output path for `supabase-types`

Example for a project where scripts run from root:
```json
"supabase:check-sync": "node -e \"const{execSync:e}=require('child_process');try{const s=e('git submodule status supabase',{encoding:'utf8'});if(s.startsWith('+')){console.error('[ERROR] Supabase submodule is out of sync.');process.exit(1)}console.log('[OK] Supabase submodule is in sync')}catch(err){process.exit(1)}\"",
"supabase-migrate": "pnpm supabase:protect && pnpm supabase:check-sync && supabase db push --workdir ./supabase"
```

---

## Daily Development Workflow

### Working with Migrations

#### Running Migrations

```powershell
cd src
pnpm supabase-migrate
```

This command:
1. ✅ Checks for uncommitted changes in submodule
2. ✅ Verifies your local submodule is in sync
3. 🚀 Pushes migrations to your local Supabase instance

#### Generating TypeScript Types

```powershell
cd src
pnpm supabase-types
```

This regenerates TypeScript types from your database schema.

#### Manual Sync

If you just want to pull the latest migrations without running them:

```powershell
cd src
pnpm supabase:sync
```

#### Force Sync Before Migration

If you know there are updates and want to force sync before migrating:

```powershell
cd src
pnpm supabase-migrate:force
```

### Checking Submodule Status

```powershell
cd src
pnpm supabase:check-sync
```

This verifies your submodule is synchronized with the latest version.

## Creating New Migrations

**IMPORTANT**: New migrations should be created in the **shared repository**, not directly in this project.

### Process for Adding Migrations

1. **Navigate to the shared repository**:
   ```powershell
   cd ../supabase  # From src/ directory
   # Or: cd E:\SourceCode\GeekyMonkey\GeekyMonkeyData
   ```

2. **Create the migration**:
   ```powershell
   supabase migration new your_migration_name
   ```

3. **Edit the migration file** in `migrations/`

4. **Test locally** (from the shared repo):
   ```powershell
   supabase db reset
   ```

5. **Commit and push** in the shared repository:
   ```powershell
   git add migrations/
   git commit -m "Add migration: your_migration_name"
   git push
   ```

6. **Update the submodule** in your project(s):
   ```powershell
   cd path/to/CoderDojoEnnisWebsite
   git submodule update --remote supabase
   git add supabase
   git commit -m "Update supabase migrations"
   git push
   ```

## Team Collaboration

### Repository Access Model

The **GeekyMonkeyData** repository contains sensitive information about unrelated projects and should be **PRIVATE** on GitHub.

- **With Access**: Developers who work on migrations and database schema
- **Without Access**: Frontend, backend, UI developers who don't modify the database

### For Developers WITHOUT Access to GeekyMonkeyData

You can still clone and work on the main project:

```powershell
# Clone without initializing the submodule
git clone --no-recurse-submodules https://github.com/yourorg/CoderDojoEnnisWebsite.git

# Navigate and work on main project
cd CoderDojoEnnisWebsite
cd src
pnpm install
pnpm dev  # Works fine
```

**What you CAN do:**
- ✅ Work on frontend/backend code
- ✅ Modify components, pages, services
- ✅ Build and deploy the application
- ✅ Work with API endpoints

**What you CANNOT do:**
- ❌ Run `pnpm supabase-migrate` (will fail)
- ❌ Run `pnpm supabase-types` (will fail)
- ❌ Modify database migrations
- ❌ Update the `supabase/` folder

### For Developers WITH Access to GeekyMonkeyData

You'll have full access to all features including migrations:

```powershell
# Standard clone (submodule is initialized automatically)
git clone https://github.com/yourorg/CoderDojoEnnisWebsite.git

# Or if already cloned without submodule:
git submodule update --init --recursive

# All features available
cd src
pnpm supabase-migrate
pnpm supabase-types
```

### Setting Up Team Access

1. **Make GeekyMonkeyData repository PRIVATE** on GitHub
2. **Add team members** who need access via GitHub settings
3. **Share this workflow document** with your team
4. **Document which developers** need submodule access

### Onboarding New Team Members

**Scenario 1: New Frontend Developer (no migration access needed)**

```powershell
# Send them this command:
git clone --no-recurse-submodules https://github.com/yourorg/CoderDojoEnnisWebsite.git
cd CoderDojoEnnisWebsite/src
pnpm install && pnpm dev
```

**Scenario 2: New Database Developer (migration access needed)**

```powershell
# 1. Add them to GeekyMonkeyData repository access on GitHub
# 2. Send them standard clone:
git clone https://github.com/yourorg/CoderDojoEnnisWebsite.git
cd CoderDojoEnnisWebsite
git submodule update --init --recursive
cd src
pnpm install
pnpm supabase:check-sync
```

### If Someone Tries to Use Migrations Without Access

They'll see:
```
fatal: could not read Username for 'https://github.com/...': No such device or address
```

**Solution:**
1. Request access to GeekyMonkeyData repository
2. Or use `--no-recurse-submodules` if they don't need it
3. Contact repository owner to grant access

## Common Scenarios

### Cloning the Repository (New Team Member)

**With access to migrations:**
```powershell
git clone <repo-url>
cd CoderDojoEnnisWebsite
git submodule update --init --recursive
cd src
pnpm install
```

**Without access to migrations:**
```powershell
git clone --no-recurse-submodules <repo-url>
cd CoderDojoEnnisWebsite/src
pnpm install
```

### Pulling Latest Changes

```powershell
# In the main repository
git pull

# Update the submodule to the committed version
git submodule update --init --recursive

# Or use our helper script
cd src
pnpm supabase:sync
```

### Your Submodule is Out of Sync

If you see:
```
[ERROR] Supabase submodule is out of sync
```

**Solution 1**: Pull the latest committed version:
```powershell
cd ../supabase
git pull origin main  # or master
cd ../src
```

**Solution 2**: Use the force sync script:
```powershell
pnpm supabase-migrate:force
```

### Accidentally Modified Files in supabase/

The submodule should remain **read-only** in this project. If you accidentally modify files:

```powershell
cd ../supabase
git status  # See what changed
git restore .  # Discard all changes
```

**Note**: A pre-commit hook will prevent you from committing changes to the submodule directory directly.

## Troubleshooting

### "fatal: not a git repository" Error

The submodule wasn't initialized. Run:
```powershell
git submodule update --init --recursive
```

### Migrations Failing

1. Check you're on the latest version:
   ```powershell
   pnpm supabase:sync
   ```

2. Check your local Supabase is running:
   ```powershell
   supabase status
   ```

3. Try resetting your local database:
   ```powershell
   supabase db reset --workdir ../supabase
   ```

### Submodule Shows Changes in `git status`

This is normal after pulling updates. The submodule pointer has changed:

```powershell
# Commit the submodule update
git add supabase
git commit -m "Update supabase to latest migrations"
```

### Need to Work on Migrations Locally

If you need to test migration changes before pushing to the shared repo:

1. Create a branch in the submodule:
   ```powershell
   cd supabase
   git checkout -b feature/my-test-migration
   ```

2. Make your changes and test

3. When satisfied, commit and push to the shared repo

4. Update the main project to use your branch (temporarily):
   ```powershell
   cd supabase
   git checkout main
   git pull
   cd ..
   git add supabase
   git commit -m "Update to latest migrations"
   ```

## Safety Features

Our setup includes several safety mechanisms:

✅ **Protection check**: Prevents running migrations with uncommitted submodule changes  
✅ **Auto-sync checks**: Migration scripts verify submodule is in sync  
✅ **Pre-commit hook**: Prevents committing local changes to submodule  
✅ **Explicit sync commands**: Clear commands for updating the submodule  
✅ **Force options**: Override checks when needed for special cases  
✅ **Access control**: Private submodule repository protects sensitive data

## Additional Resources

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)

## Quick Reference

| Command | Purpose |
|---------|---------|
| `pnpm supabase:check-sync` | Verify submodule is in sync |
| `pnpm supabase:sync` | Pull latest from shared repo |
| `pnpm supabase:protect` | Check for uncommitted changes |
| `pnpm supabase-migrate` | Protected migration with checks |
| `pnpm supabase-migrate:force` | Force sync before migrating |
| `pnpm supabase-types` | Regenerate TypeScript types |
| `pnpm supabase-reset` | Reset local database |
| `git submodule update --init --recursive` | Initialize/update all submodules |
| `git submodule update --remote supabase` | Pull latest for supabase submodule |
| `git clone --no-recurse-submodules <url>` | Clone without submodule (no access needed) |
