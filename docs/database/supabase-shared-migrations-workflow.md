# Supabase Shared Migrations Workflow

This document explains how to work with the shared Supabase migrations in this project.

## Overview

The `supabase/` folder at the project root is **dynamically cloned** from the shared [GeekyMonkeyData](https://github.com/GeekyMonkey/GeekyMonkeyData) repository. This allows multiple projects to share the same database schema and migrations without git submodule complexity.

When you run Supabase-related npm scripts, the `supabase/` folder is automatically cloned (if it doesn't exist) or pulled (if it does). This approach:
- ✅ Works seamlessly with Cloudflare Pages and other CI/CD systems
- ✅ Doesn't require special git configuration
- ✅ Keeps the shared repo private and protected
- ✅ Allows optional access - only clone when needed

## Step 4: Configure Shared Migrations in Your Other Project

If you need to add this same shared Supabase repository to another project:

### Quick Setup

```powershell
# Navigate to your other project root
cd path/to/your/other/project

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Copy the sync and commit scripts from CoderDojoEnnisWebsite
# Option 1: Copy from CoderDojoEnnisWebsite
Copy-Item ../CoderDojoEnnisWebsite/scripts/sync-supabase.js scripts/
Copy-Item ../CoderDojoEnnisWebsite/scripts/commit-supabase.js scripts/

# Option 2: Or create them manually (see scripts section below)

# Update package.json with the scripts (see below)

# Add supabase to .gitignore
echo "supabase" >> .gitignore

# Test the sync
cd src  # Or root if your project structure is different
pnpm supabase:sync
```

### Required Node.js Scripts

Create `scripts/sync-supabase.js`:
```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SUPABASE_DIR = path.join(__dirname, '..', 'supabase');
const REPO_URL = 'https://github.com/GeekyMonkey/GeekyMonkeyData.git';

function log(message) {
  console.log(`[Supabase Sync] ${message}`);
}

function error(message) {
  console.error(`[Supabase Sync ERROR] ${message}`);
  process.exit(1);
}

try {
  if (fs.existsSync(SUPABASE_DIR)) {
    log('Supabase folder exists, pulling latest changes...');
    execSync('git pull origin master', {
      cwd: SUPABASE_DIR,
      stdio: 'inherit'
    });
    log('Supabase folder updated');
  } else {
    log('Cloning GeekyMonkeyData repository...');
    execSync(`git clone ${REPO_URL} "${SUPABASE_DIR}"`, {
      stdio: 'inherit'
    });
    log('Supabase folder cloned');
  }
} catch (err) {
  error(`Failed to sync supabase: ${err.message}`);
}
```

Create `scripts/commit-supabase.js`:
```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SUPABASE_DIR = path.join(__dirname, '..', 'supabase');

function log(message) {
  console.log(`[Supabase Commit] ${message}`);
}

function error(message) {
  console.error(`[Supabase Commit ERROR] ${message}`);
  process.exit(1);
}

try {
  if (!fs.existsSync(SUPABASE_DIR)) {
    error('Supabase folder does not exist. Run sync-supabase first.');
  }

  let status = '';
  try {
    status = execSync('git status --porcelain', {
      cwd: SUPABASE_DIR,
      encoding: 'utf8'
    }).trim();
  } catch (err) {
    error('Not a git repository. Supabase folder may be corrupted.');
  }

  if (!status) {
    log('No changes to commit');
    process.exit(0);
  }

  log('Changes detected in supabase folder:');
  console.log(status);

  log('Staging changes...');
  execSync('git add .', {
    cwd: SUPABASE_DIR,
    stdio: 'inherit'
  });

  const timestamp = new Date().toISOString();
  const commitMessage = `Database schema update - ${timestamp}`;

  log(`Committing with message: "${commitMessage}"...`);
  execSync(`git commit -m "${commitMessage}"`, {
    cwd: SUPABASE_DIR,
    stdio: 'inherit'
  });

  log('Pushing to remote repository...');
  execSync('git push origin master', {
    cwd: SUPABASE_DIR,
    stdio: 'inherit'
  });

  log('Successfully committed and pushed changes to GeekyMonkeyData');
} catch (err) {
  error(`Failed to commit supabase changes: ${err.message}`);
}
```

### Required package.json Scripts

Add these scripts to your project's `package.json`:

```json
"scripts": {
  "supabase:sync": "node ../scripts/sync-supabase.js",
  "supabase:commit": "node ../scripts/commit-supabase.js",
  "supabase-migrate": "pnpm supabase:sync && supabase db push --workdir ../supabase && pnpm supabase:commit",
  "supabase-migrate:force": "pnpm supabase:sync && supabase db push --workdir ../supabase --force-db-reset && pnpm supabase:commit",
  "supabase-types": "pnpm supabase:sync && supabase gen types typescript --workdir ../supabase --project-id YOUR_PROJECT_ID --schema YOUR_SCHEMA > types/supabase.ts",
  "supabase-reset": "pnpm supabase:sync && supabase db reset --workdir ../supabase"
}
```

**Note:** Update `YOUR_PROJECT_ID` and `YOUR_SCHEMA` with your actual Supabase project values.

### Adjusting Paths

If your other project has a different structure (e.g., no `src/` folder), you may need to adjust:
- The path in `supabase:sync` - check where you put the scripts
- The `--workdir` path in the scripts (currently `../supabase`)
- The output path for `supabase-types`

Example for a project where scripts run from root instead of src/:
```json
"supabase:sync": "node ./scripts/sync-supabase.js",
"supabase-migrate": "pnpm supabase:sync && supabase db push --workdir ./supabase && pnpm supabase:commit"
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

This will clone the GeekyMonkeyData repo if it doesn't exist, or pull the latest if it does.

#### Force Sync Before Migration

If you know there are updates and want to pull before migrating:

```powershell
cd src
pnpm supabase-migrate
```

This command automatically syncs before running migrations and commits changes afterward.

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
   git commit -m hared repo** in your project(s):
   The changes are automatically available in the GeekyMonkeyData repository. When you run `pnpm supabase:sync` next time, you'll get the latest changes.
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
``` without any issues:

```powershell
# Standard clone
git clone https://github.com/yourorg/CoderDojoEnnisWebsite.git

# Navigate and work on main project
cd CoderDojoEnnisWebsite
cd src
pnpm install
pnpm dev  # Works fine
```

Since the `supabase/` folder is only created dynamically when needed, developers without access won't be blocked. The main project works perfectly fine without running migration commands.

**What you CAN do:**
- ✅ Work on frontend/backend code
- ✅ Modify components, pages, services
- ✅ Build and deploy the application
- ✅ Work with API endpoints
- ✅ Run the entire project in development mode

**What you CANNOT do:**
- ❌ Run `pnpm supabase-migrate` (will fail at git clone if no access)
- ❌ Run `pnpm supabase-types` (will fail at git clone if no access)
- ❌ Modify database migrations
- ❌ Create or update the `supabase/` folder

### For Developers WITH Access to GeekyMonkeyData

You'll have full access to all features including migrations:

```powershell
# Standard clone (works for everyone)
git clone https://github.com/yourorg/CoderDojoEnnisWebsite.git

cd CoderDojoEnnisWebsite
cd src
pnpm install

# All features available
pnpm supabase-migrate
pnpm supabase-types
pnpm supabase:sync
```

### Setting Up Team Access

1. **Make GeekyMonkeyData repository PRIVATE** on GitHub
2. **Add team members** who need access via GitHub settings
3. **Share this workflow document** with your team
4. **Document which developers** need migration access

### Onboarding New Team Members

**Scenario 1: New Frontend Developer (no migration access needed)**

```powershell
# Send them this command (same as everyone):
git clone https://github.com/yourorg/CoderDojoEnnisWebsite.git
cd CoderDojoEnnisWebsite/src
pnpm install && pnpm dev

# They can work on everything except migration commands
```

**Scenario 2: New Database Developer (migration access needed)**

```powershell
# 1. Add them to GeekyMonkeyData repository access on GitHub
# 2. Send them standard clone (same as everyone):
git clone https://github.com/yourorg/CoderDojoEnnisWebsite.git
cd CoderDojoEnnisWebsite
cd src
pnpm install

# 3. They now have full access to migrations
pnpm supabase-migrate
pnpm supabase-types
```

### If Someone Tries to Use Migrations Without Access

They'll see an error like:
```
fatal: could not read Username for 'https://github.com/GeekyMonkey/GeekyMonkeyData.git': No such device or address
```

**Solution:**
Simply clone the main project:
```powershell
git clone <repo-url>
cd CoderDojoEnnisWebsite
cd src
pnpm install
```

The `supabase/` folder will be created automatically when needed (when you run migration commands).

### Pulling Latest Changes

```powershell
# In the main repository
git pull

# If you have migration access, sync the shared migrations
cd src
pnpm supabase:sync
```

### Getting Latest Migrations

If migrations have been updated in GeekyMonkeyData:

```powershell
cd src
pnpm supabase:sync
```

This pulls the latest migrations from the shared repository.

### Accidentally Modified Files in supabase/

The supabase folder should remain **read-only** in your workflow. If you accidentally modify files:

```powershell
cd ../supabase
git status  # See what changed
git restore .  # Discard all changes
```

To properly commit changes, use:
```powershell
cd src
pnpm supabase:commit  # Commits changes to GeekyMonkeyData
```
### "fatal: not a git repository" Error

The submodule wasn't initialized. Run:
```powershell
git submodule update --init --recursive
```

### Migrations Failing

1. Check you're on the latest version:
   ```powershell
   pnpm supacould not read Username" Error

You're trying to sync but don't have access to GeekyMonkeyData. 

**Solution:**
1. Request access from the repository owner
2. Or skip migration work if you don't need it
3. Once access is granted, retry:
   ```powershell
   pnpm supabase:sync
   ```

### Migrations Failing

1. Check you have the latest version:
   ```powershell
   pnpm supabase:sync
   ```

2. Check your local Supabase is running:
   ```powershell
   supabase status
   ```

3. Try resetting your local database:
   ```powershell
   pnpm supabase-reset
   ```

### supabase/ Folder Missing or Corrupted

The folder is dynamically created. To recreate it:

```powershell
# Remove the folder if it exists
Remove-Item ../supabase -Recurse -Force

# Recreate by syncing
pnpm supabase:sync
```

### Need to Work on Migrations Locally

If you need to test migration changes before pushing to the shared repo:

1. Make changes in the `supabase/` folder
2. Test them locally:
   ```powershell
   supabase db reset --workdir ../supabase
   ```

3. When satisfied, commit and push:
   ```powershell
   pnpm supabase:commit
   ```

## Safety Features

Our setup includes several safety mechanisms:

✅ **Automatic sync**: Migrations are synced before use  
✅ **Commit automation**: After migrations, changes are automatically committed back  
✅ **Private repository**: GeekyMonkeyData is private to protect sensitive data  
✅ **Access control**: Only authorized developers can sync and modify migrations  
✅ **Clean separation**: The `supabase/` folder is ignored by git (not in main repo)

## Additional Resources

- [Git Clone Documentation](https://git-scm.com/docs/git-clone)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)

## Quick Reference

| Command | Purpose |
|---------|---------|
| `pnpm supabase:sync` | Clone/pull latest from shared repo |
| `pnpm supabase:commit` | Commit and push changes to shared repo |
| `pnpm supabase-migrate` | Sync, run migrations, then commit |
| `pnpm supabase-migrate:force` | Force sync and migrate with reset |
| `pnpm supabase-types` | Sync then regenerate TypeScript types |
| `pnpm supabase-reset` | Sync then reset local database |
sync` | Clone/pull latest from shared repo |
| `pnpm supabase:commit` | Commit and push changes to shared repo |
| `pnpm supabase-migrate` | Sync, run migrations, then commit |
| `pnpm supabase-migrate:force` | Force sync and migrate with reset |
| `pnpm supabase-types` | Sync then regenerate TypeScript types |
| `pnpm supabase-reset` | Sync then reset local database