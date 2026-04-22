/**
 * GitHub PR creation via gh CLI
 */

import { execCommand, execSimple } from '../utils/exec.js';

/**
 * Check if gh CLI is available and authenticated
 */
export async function checkGhCli(): Promise<{ available: boolean; details: string }> {
  try {
    await execSimple('gh', ['auth', 'status'], { timeout: 10000 });
    return { available: true, details: 'gh CLI is authenticated' };
  } catch (error) {
    const message = String(error);
    if (message.includes('not found') || message.includes('ENOENT')) {
      return { available: false, details: 'gh CLI not found. Install it: https://cli.github.com/' };
    }
    return { available: false, details: 'gh CLI not authenticated. Run: gh auth login' };
  }
}

export interface CreatePROptions {
  title: string;
  body: string;
  baseBranch: string;
  headBranch: string;
  draft?: boolean;
}

/**
 * Create a GitHub PR using gh CLI
 */
export async function createPR(options: CreatePROptions): Promise<string> {
  const args = [
    'pr', 'create',
    '--title', options.title,
    '--body', options.body,
    '--base', options.baseBranch,
    '--head', options.headBranch,
  ];

  if (options.draft) {
    args.push('--draft');
  }

  const result = await execCommand('gh', args, { timeout: 30000 });

  if (result.exitCode !== 0) {
    throw new Error(`Failed to create PR: ${result.stderr}`);
  }

  // gh pr create outputs the PR URL
  return result.stdout.trim();
}

/**
 * Check if a PR already exists for the branch
 */
export async function existingPR(headBranch: string): Promise<string | null> {
  try {
    const result = await execCommand('gh', [
      'pr', 'list',
      '--head', headBranch,
      '--json', 'url',
      '--jq', '.[0].url',
    ], { timeout: 10000 });

    const url = result.stdout.trim();
    return url || null;
  } catch {
    return null;
  }
}

export interface PRInfo {
  title: string;
  body: string;
  baseBranch: string;
  headBranch: string;
  url: string;
}

/**
 * Get PR info from a PR URL or number
 */
export async function getPRInfo(prRef: string): Promise<PRInfo> {
  const result = await execCommand('gh', [
    'pr', 'view', prRef,
    '--json', 'title,body,baseRefName,headRefName,url',
  ], { timeout: 15000 });

  if (result.exitCode !== 0) {
    throw new Error(`Failed to get PR info: ${result.stderr}`);
  }

  const parsed = JSON.parse(result.stdout);
  return {
    title: parsed.title,
    body: parsed.body,
    baseBranch: parsed.baseRefName,
    headBranch: parsed.headRefName,
    url: parsed.url,
  };
}

/**
 * Get diff from a PR URL or number
 */
export async function getPRDiff(prRef: string, maxSize: number): Promise<string> {
  const result = await execCommand('gh', [
    'pr', 'diff', prRef,
  ], { timeout: 30000 });

  if (result.exitCode !== 0) {
    throw new Error(`Failed to get PR diff: ${result.stderr}`);
  }

  const diff = result.stdout;
  if (diff.length > maxSize) {
    return diff.substring(0, maxSize) + `\n\n[DIFF TRUNCATED - Original size: ${diff.length} bytes]`;
  }
  return diff;
}

/**
 * Get commit log from a PR
 */
export async function getPRCommits(prRef: string): Promise<string> {
  const result = await execCommand('gh', [
    'pr', 'view', prRef,
    '--json', 'commits',
    '--jq', '.commits[] | .oid[:7] + " " + .messageHeadline',
  ], { timeout: 15000 });

  if (result.exitCode !== 0) {
    throw new Error(`Failed to get PR commits: ${result.stderr}`);
  }

  return result.stdout.trim();
}

/**
 * Get changed files from a PR
 */
export async function getPRChangedFiles(prRef: string): Promise<string[]> {
  const result = await execCommand('gh', [
    'pr', 'view', prRef,
    '--json', 'files',
    '--jq', '.files[].path',
  ], { timeout: 15000 });

  if (result.exitCode !== 0) {
    return [];
  }

  return result.stdout.trim().split('\n').filter((f) => f.length > 0);
}

/**
 * Get diff stat from a PR
 */
export async function getPRDiffStat(prRef: string): Promise<string> {
  const result = await execCommand('gh', [
    'pr', 'diff', prRef, '--stat',
  ], { timeout: 15000 });

  if (result.exitCode !== 0) {
    return '';
  }

  return result.stdout.trim();
}

/**
 * Update an existing PR's title and body
 */
export async function editPR(prRef: string, title: string, body: string): Promise<string> {
  const result = await execCommand('gh', [
    'pr', 'edit', prRef,
    '--title', title,
    '--body', body,
  ], { timeout: 30000 });

  if (result.exitCode !== 0) {
    throw new Error(`Failed to edit PR: ${result.stderr}`);
  }

  return result.stdout.trim();
}

export type MergeMethod = 'rebase' | 'squash' | 'merge';

/**
 * Enable auto-merge on a PR via gh CLI.
 * The PR will be merged automatically once required checks pass.
 */
export async function enableAutoMerge(prRef: string, method: MergeMethod): Promise<void> {
  const methodFlag = `--${method}`;
  const result = await execCommand('gh', [
    'pr', 'merge', prRef,
    '--auto',
    methodFlag,
  ], { timeout: 30000 });

  if (result.exitCode !== 0) {
    throw new Error(`Failed to enable auto-merge: ${result.stderr}`);
  }
}
