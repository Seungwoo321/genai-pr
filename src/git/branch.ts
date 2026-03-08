/**
 * Git branch operations
 */

import simpleGit from 'simple-git';

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
