#!/usr/bin/env node
/**
 * Commits changes in the Supabase folder back to GeekyMonkeyData repository.
 * Call this after running migrations or making changes to the database schema.
 */

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

  // Check if there are any changes
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

  // Stage all changes
  log('Staging changes...');
  execSync('git add .', {
    cwd: SUPABASE_DIR,
    stdio: 'inherit'
  });

  // Create commit message with timestamp
  const timestamp = new Date().toISOString();
  const commitMessage = `Database schema update - ${timestamp}`;

  // Commit changes
  log(`Committing with message: "${commitMessage}"...`);
  execSync(`git commit -m "${commitMessage}"`, {
    cwd: SUPABASE_DIR,
    stdio: 'inherit'
  });

  // Push to remote
  log('Pushing to remote repository...');
  execSync('git push origin master', {
    cwd: SUPABASE_DIR,
    stdio: 'inherit'
  });

  log('Successfully committed and pushed changes to GeekyMonkeyData');
} catch (err) {
  error(`Failed to commit supabase changes: ${err.message}`);
}
