/**
 * PR-related type definitions
 */

export interface PRContent {
  title: string;
  body: string;
}

export interface PRResult {
  content: PRContent;
}

export interface PRContext {
  baseBranch: string;
  headBranch: string;
  diff: string;
  commitLog: string;
  fileTree: string;
}

export type Language = 'en' | 'ko';
