/**
 * Git diff operations between branches
 */

import { execSimple } from '../utils/exec.js';

/**
 * Get diff between base and head branches
 */
export async function getBranchDiff(
  baseBranch: string,
  headBranch: string,
  maxSize: number
): Promise<string> {
  try {
    const diff = await execSimple('git', [
      'diff',
      `${baseBranch}...${headBranch}`,
      '--stat-count=100',
    ]);

    if (diff.length > maxSize) {
      return diff.substring(0, maxSize) + `\n\n[DIFF TRUNCATED - Original size: ${diff.length} bytes]`;
    }

    return diff;
  } catch {
    return '';
  }
}

/**
 * Get detailed diff content between branches
 */
export async function getDetailedDiff(
  baseBranch: string,
  headBranch: string,
  maxSize: number
): Promise<string> {
  try {
    const diff = await execSimple('git', [
      'diff',
      `${baseBranch}...${headBranch}`,
    ]);

    if (diff.length > maxSize) {
      return diff.substring(0, maxSize) + `\n\n[DIFF TRUNCATED - Original size: ${diff.length} bytes]`;
    }

    return diff;
  } catch {
    return '';
  }
}

/**
 * Get list of changed files between branches
 */
export async function getChangedFiles(
  baseBranch: string,
  headBranch: string
): Promise<string[]> {
  try {
    const output = await execSimple('git', [
      'diff',
      '--name-only',
      `${baseBranch}...${headBranch}`,
    ]);

    return output
      .trim()
      .split('\n')
      .filter((f) => f.length > 0);
  } catch {
    return [];
  }
}

/**
 * Get diff stat summary between branches
 */
export async function getDiffStat(
  baseBranch: string,
  headBranch: string
): Promise<string> {
  try {
    return await execSimple('git', [
      'diff',
      '--stat',
      `${baseBranch}...${headBranch}`,
    ]);
  } catch {
    return '';
  }
}
