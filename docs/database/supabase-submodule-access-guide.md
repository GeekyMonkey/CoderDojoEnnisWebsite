# Supabase Submodule: Team Access & Collaboration Guide

This document explains how to manage team access to the shared Supabase repository and handle different collaboration scenarios.

## Overview

The **GeekyMonkeyData** repository is **PRIVATE** and contains sensitive database information. Not all team members need access to it.

## Access Levels

### 👤 Level 1: No Submodule Access Required

**Who**: Frontend developers, UI/UX designers, junior developers, contractors

**What they can do**:
- Clone and work on the main project
- Develop features, components, pages
- Build and test the application
- Work on API integrations (existing endpoints)
- Collaborate on the main codebase

**What they cannot do**:
- Modify database schema
- Run migration scripts
- Access the GeekyMonkeyData repository
- Regenerate TypeScript types from the database

**How they clone** (standard clone):
```powershell
git clone https://github.com/GeekyMonkey/CoderDojoEnnisWebsite.git
cd CoderDojoEnnisWebsite/src
pnpm install && pnpm dev
```

**Note:** The submodule is optional and won't initialize unless they explicitly request it.

### 👥 Level 2: Submodule Access Required

**Who**: Database administrators, backend developers, DevOps engineers, tech leads

**What they can do**:
- Everything in Level 1
- Create and run migrations
- Modify database schema
- Access the GeekyMonkeyData repository
- Regenerate TypeScript types
- Coordinate database changes across projects

**How they clone** (standard clone + one command):
```powershell
# Standard clone (same as everyone else)
git clone https://github.com/GeekyMonkey/CoderDojoEnnisWebsite.git
cd CoderDojoEnnisWebsite

# Initialize the submodule (requires access to GeekyMonkeyData)
git submodule update --init --recursive

# Setup and verify
cd src
pnpm install
pnpm supabase:check-sync
```

## Granting Access

### On GitHub

1. Go to **GeekyMonkeyData** repository settings
2. Click **Collaborators** (or **Manage Access** in newer UI)
3. Add team members with appropriate role:
   - **Read**: Can view and pull code only
   - **Triage**: Can manage issues and pull requests
   - **Write**: Can push commits (for database developers)
   - **Admin**: Can manage repository settings

### Recommended Settings

- **Database Developers**: Write access
- **DevOps/Backend**: Write access
- **QA/Testing**: Read access (if they need to view schema)
- **Managers/Tech Leads**: Admin access

### Via GitHub Teams

Better approach: Create a GitHub team

1. Go to GitHub **Teams**
2. Create team: `database-admins`
3. Add members who manage migrations
4. Grant the team **Write** access to GeekyMonkeyData
5. Use the team mention in documentation

```
@GeekyMonkey/database-admins - contact us for migration access
```

## Onboarding Checklist

### For New Frontend Developer (No Database Access)

- [ ] Provide standard clone command
- [ ] Share the workflow doc
- [ ] Clarify they don't need submodule access
- [ ] Add to the project GitHub team (main project only)
- [ ] Document in team wiki

**Send them:**
```powershell
# Clone the project (standard clone)
git clone https://github.com/GeekyMonkey/CoderDojoEnnisWebsite.git

# Setup
cd CoderDojoEnnisWebsite/src
pnpm install

# Run in development mode
pnpm dev

# For questions about database, contact @GeekyMonkey/database-admins
```

**Note:** The database migration files won't be available (submodule is optional), but this doesn't affect your work on the main project.

### For New Database Developer (With Submodule Access)

- [ ] Add to GeekyMonkeyData repository on GitHub
- [ ] Add to database-admins GitHub team
- [ ] Provide standard clone command
- [ ] Share full workflow documentation
- [ ] Walk through migration workflow once
- [ ] Set up SSH key for easier access (optional)
- [ ] Document in team wiki

**Send them:**
```powershell
# Clone the project (standard clone)
git clone https://github.com/GeekyMonkey/CoderDojoEnnisWebsite.git

# Setup
cd CoderDojoEnnisWebsite

# Initialize the submodule (requires GeekyMonkeyData access)
git submodule update --init --recursive

cd src
pnpm install

# Verify access to migrations
pnpm supabase:check-sync

# See full workflow: docs/database/supabase-submodule-workflow.md
```

## Handling Access Requests

### Developer Needs Migration Access

1. **Review the request**: Do they actually need it?
2. **Grant access**: Add to GeekyMonkeyData repository
3. **Verify access**: Have them run `pnpm supabase:check-sync`
4. **Document it**: Update your team access list

### Developer No Longer Needs Access

1. **Remove from GeekyMonkeyData** on GitHub
2. **Optional**: Have them switch to no-recurse-submodules clone
3. **Update records**: Keep access list current

## Troubleshooting Access Issues

### "fatal: could not read Username" Error

**Cause**: Trying to initialize submodule without access to GeekyMonkeyData

**Solution:**
```powershell
# 1. If you don't need migrations, you can ignore this error
#    and continue working on the main project:
cd src
pnpm install && pnpm dev

# 2. If you NEED migrations:
#    - Request access to GeekyMonkeyData repository
#    - Once granted, run:
#      git submodule update --init --recursive
#    - Verify:
#      pnpm supabase:check-sync
```

### User Needs to Disable Submodule Locally

If they want to remove the submodule from their local clone:

```powershell
git submodule deinit --force supabase
rm -r supabase

# They can now work on main project without any warnings
cd src
pnpm install && pnpm dev
```

## Documentation to Share

### For Level 1 Developers (No Submodule Access)

**Minimal onboarding:**
```markdown
# Setup Instr

1. Clone the project:
   git clone --no-recurse-submodules https://github.com/GeekyMonkey/CoderDojoEnnisWebsite.git

2. Install and run:
   cd CoderDojoEnnisWebsite/src
   pnpm install && pnpm dev

3. You're all set! You can work on all features.

4. Database questions? Contact @GeekyMonkey/database-admins
```

### For Level 2 Developers (With Submodule Access)

**Full onboarding:**
Share these documents:
- [docs/database/supabase-submodule-workflow.md](supabase-submodule-workflow.md) - Complete workflow guide
- This file - Access and team structure

### For Managers

**Quick reference:**
```markdown
# Database Access Model

- **GeekyMonkeyData**: Private repo with sensitive unrelated project info
- **Frontend developers**: Don't have/need access
- **Database developers**: Full access via private repository
- **Shared submodule**: Safely references shared migrations

**Access Requests**: Contact tech lead to add developers to GeekyMonkeyData
```

## Security Considerations

### Private Repository Benefits

✅ Protects unrelated project information  
✅ Prevents accidental exposure of sensitive schema  
✅ Allows fine-grained access control  
✅ Audit trail of who accessed what  
✅ Can revoke access without affecting main project  

### Best Practices

1. **Principle of Least Privilege**: Only give access to those who need it
2. **Regular Audits**: Review who has access monthly
3. **Team-based Access**: Use GitHub teams for easier management
4. **Documentation**: Keep records of who needs access and why
5. **Offboarding**: Remove access when developers leave
6. **SSH Keys**: Encourage SSH for easier authentication

### Protecting Sensitive Data

- Never commit secrets to either repository
- Use environment variables for configuration
- Use GitHub Secrets for CI/CD
- Rotate credentials if a developer with access leaves
- Consider branch protection rules

## Multi-Project Setup

If using the same GeekyMonkeyData repository in multiple projects:

```
CoderDojoEnnisWebsite/
  └─ supabase/ (submodule pointing to GeekyMonkeyData)

OtherProject/
  └─ supabase/ (submodule pointing to GeekyMonkeyData)
```

**Keep these in sync:**
- When migrations are added in GeekyMonkeyData
- Update both projects' submodules
- Notify all teams of schema changes
- Coordinate deployment schedules

## FAQ

**Q: Can someone clone without the submodule and add it later?**  
A: Yes! Use `git clone --no-recurse-submodules` initially, then add it later if access is granted.

**Q: What if someone tries to initialize the submodule but doesn't have access?**  
A: They'll see an error message like "fatal: could not read Username". They can either request access or skip this step—the main project works fine without it.

**Q: Can we use SSH instead of HTTPS for submodule?**  
A: Yes, update `.gitmodules` to use SSH URL instead. This can work better for some teams.

**Q: How do we handle merge conflicts in migrations?**  
A: Coordinate with the database team. Have a process for reviewing migration conflicts.

**Q: What happens when we remove someone's access?**  
A: They can still work on the main project normally. If they try to reinitialize the submodule, they'll see an access error, but they can ignore it.

## Contacts & Escalation

Create a team contact list:

```
Database Team: @GeekyMonkey/database-admins
- Lead: [Name] ([email])
- Members: [List team members]

For migration questions: Slack #database-team
For access requests: Contact [Tech Lead Name]
For security issues: Contact [Ops/Security Lead]
```

## Additional Resources

- [Git Submodules - What They Are & How to Use Them](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [GitHub - Managing Team Access](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
