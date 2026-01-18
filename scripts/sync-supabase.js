#!/usr/bin/env node
/**
 * Syncs the Supabase folder from GeekyMonkeyData repository.
 * Clones if it doesn't exist, pulls if it does.
 */

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
