import { execSync } from 'child_process';
import { resolve } from 'path';

const PROJECT_DIR = resolve(__dirname, '..');
const DATA_FILE = resolve(PROJECT_DIR, 'data/wars.json');
const CWL_DATA_FILE = resolve(PROJECT_DIR, 'data/leaguewars.json');

function run(cmd: string): string {
  return execSync(cmd, { cwd: PROJECT_DIR, encoding: 'utf-8' }).trim();
}

function hasChanges(filePath: string): boolean {
  try {
    execSync(`git diff --quiet "${filePath}"`, { cwd: PROJECT_DIR });
    return false;
  } catch {
    return true;
  }
}

/**
 * Check for data file changes, commit, and push to origin/main.
 * Returns true if a push was made.
 */
export async function gitSync(): Promise<boolean> {
  console.log('[git-sync] Checking for data changes...');

  // Pull latest first to avoid conflicts
  try {
    run('git pull origin main');
    console.log('[git-sync] Pulled latest changes');
  } catch (error) {
    console.warn('[git-sync] Pull failed (may be offline or no remote changes):', error);
  }

  const warsChanged = hasChanges(DATA_FILE);
  const cwlChanged = hasChanges(CWL_DATA_FILE);

  if (!warsChanged && !cwlChanged) {
    console.log('[git-sync] No data changes to commit');
    return false;
  }

  // Stage changed files
  if (warsChanged) {
    run(`git add "${DATA_FILE}"`);
    console.log('[git-sync] Staged wars.json');
  }
  if (cwlChanged) {
    run(`git add "${CWL_DATA_FILE}"`);
    console.log('[git-sync] Staged leaguewars.json');
  }

  // Build commit message
  const parts: string[] = [];
  if (warsChanged) {
    try {
      const count = run(`node -e "console.log(JSON.parse(require('fs').readFileSync('${DATA_FILE}','utf-8')).wars.length)"`);
      parts.push(`Regular wars: ${count} total`);
    } catch {
      parts.push('Regular wars: updated');
    }
  }
  if (cwlChanged) {
    try {
      const seasons = run(`node -e "const d=JSON.parse(require('fs').readFileSync('${CWL_DATA_FILE}','utf-8'));console.log(d.seasons.length+' seasons, '+(d.totalWars||0)+' wars')"`);
      parts.push(`CWL: ${seasons}`);
    } catch {
      parts.push('CWL: updated');
    }
  }

  const commitMsg = `Update war data\n\n${parts.join('\n')}\nData collected at: ${new Date().toISOString()}`;

  try {
    run(`git commit -m "${commitMsg}"`);
    console.log('[git-sync] Committed changes');
  } catch (error) {
    console.error('[git-sync] Commit failed:', error);
    return false;
  }

  try {
    run('git push origin main');
    console.log('[git-sync] Pushed to origin/main');
    return true;
  } catch (error) {
    console.error('[git-sync] Push failed:', error);
    return false;
  }
}
