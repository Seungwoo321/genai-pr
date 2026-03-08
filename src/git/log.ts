/**
 * Git log operations between branches
 */

import { execSimple } from '../utils/exec.js';

/**
 * Get commit log between base and head branches
 */
export async function getCommitLog(
  baseBranch: string,
  headBranch: string
): Promise<string> {
  try {
    return await execSimple('git', [
      'log',
      `${baseBranch}..${headBranch}`,
      '--oneline',
      '--no-decorate',
    ]);
  } catch {
    return '';
  }
}

/**
 * Get detailed commit log with messages
 */
export async function getDetailedCommitLog(
  baseBranch: string,
  headBranch: string
): Promise<string> {
  try {
    return await execSimple('git', [
      'log',
      `${baseBranch}..${headBranch}`,
      '--format=%h %s%n%b',
      '--no-decorate',
    ]);
  } catch {
    return '';
  }
}

/**
 * Get commit count between branches
 */
export async function getCommitCount(
  baseBranch: string,
  headBranch: string
): Promise<number> {
  try {
    const output = await execSimple('git', [
      'rev-list',
      '--count',
      `${baseBranch}..${headBranch}`,
    ]);
    return parseInt(output.trim(), 10) || 0;
  } catch {
    return 0;
  }
}
