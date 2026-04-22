/**
 * Git branch operations
 */

import simpleGit from 'simple-git';
import { execSimple } from '../utils/exec.js';

const git = simpleGit();

/**
 * Check if current directory is a git repository
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    await git.revparse(['--is-inside-work-tree']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current branch name
 */
export async function getCurrentBranch(): Promise<string> {
  const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
  return branch.trim();
}

/**
 * Get the default base branch (main or master)
 */
export async function getDefaultBaseBranch(): Promise<string> {
  try {
    await git.revparse(['--verify', 'main']);
    return 'main';
  } catch {
    try {
      await git.revparse(['--verify', 'master']);
      return 'master';
    } catch {
      return 'main';
    }
  }
}

/**
 * Check if a branch exists
 */
export async function branchExists(branch: string): Promise<boolean> {
  try {
    await git.revparse(['--verify', branch]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the current branch has a remote tracking branch
 */
export async function hasRemoteTracking(): Promise<boolean> {
  try {
    await git.revparse(['--abbrev-ref', '@{upstream}']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of local branches (excluding current)
 */
export async function getLocalBranches(currentBranch: string): Promise<string[]> {
  const summary = await git.branchLocal();
  return summary.all.filter((b) => b !== currentBranch);
}

/**
 * Fetch remote and resolve branch to remote ref for accurate comparison.
 * Returns "origin/main" style ref if available, otherwise local branch name.
 * Skips fetch if the remote ref already exists locally.
 */
export async function resolveRemoteRef(
  branch: string,
  remote: string = 'origin'
): Promise<string> {
  const remoteRef = `${remote}/${branch}`;
  try {
    // Check if remote ref already exists locally (skip fetch for speed)
    await git.revparse(['--verify', remoteRef]);
    return remoteRef;
  } catch {
    // Remote ref not found locally, try fetching
    try {
      await execSimple('git', ['fetch', remote, branch], { timeout: 15000 });
      await git.revparse(['--verify', remoteRef]);
      return remoteRef;
    } catch {
      return branch;
    }
  }
}

/**
 * Check if there are commits between base and head
 */
export async function hasCommitsBetween(baseBranch: string, headBranch: string): Promise<boolean> {
  try {
    const log = await git.log({ from: baseBranch, to: headBranch });
    return log.total > 0;
  } catch {
    return false;
  }
}

/**
 * Resolve a ref to its SHA. Returns null if the ref doesn't exist.
 */
export async function getSha(ref: string): Promise<string | null> {
  try {
    const sha = await git.revparse(['--verify', ref]);
    return sha.trim();
  } catch {
    return null;
  }
}

/**
 * Count commits in `from..to`. Returns 0 on any failure.
 */
export async function countCommits(from: string, to: string): Promise<number> {
  try {
    const log = await git.log({ from, to });
    return log.total;
  } catch {
    return 0;
  }
}
