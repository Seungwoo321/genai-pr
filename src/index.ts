/**
 * genai-pr - AI-powered PR description generator
 *
 * Public API exports for programmatic usage
 */

// Types
export * from './types/index.js';
export * from './config/index.js';

// Providers
export {
  createProvider,
  isValidProviderType,
  ClaudeCodeProvider,
  CursorCLIProvider,
} from './providers/index.js';
export type {
  AIProvider,
  ProviderType,
  ProviderOptions,
  ProviderStatus,
  ProviderResponse,
} from './providers/types.js';

// Git utilities
export {
  isGitRepository,
  getCurrentBranch,
  getDefaultBaseBranch,
  branchExists,
  hasRemoteTracking,
  hasCommitsBetween,
} from './git/branch.js';
export {
  getBranchDiff,
  getDetailedDiff,
  getChangedFiles,
  getDiffStat,
} from './git/diff.js';
export {
  getCommitLog,
  getDetailedCommitLog,
  getCommitCount,
} from './git/log.js';

// Templates
export {
  loadTemplate,
  listTemplates,
} from './templates/loader.js';
export type { Template, TemplateSection } from './templates/types.js';
export { BUILTIN_TEMPLATES, BUILTIN_TEMPLATE_NAMES } from './templates/builtin.js';

// Parsers
export { parseJsonResponse } from './parser/json.js';
export { parseDelimiterResponse } from './parser/delimiter.js';

// GitHub
export {
  checkGhCli,
  createPR,
  editPR,
  existingPR,
  getPRInfo,
  getPRDiff,
  getPRCommits,
  getPRChangedFiles,
  getPRDiffStat,
} from './github/pr.js';
export type { CreatePROptions, PRInfo } from './github/pr.js';

// Prompts
export { getSystemPrompt, getJsonSchema, buildInputPrompt } from './prompts/templates.js';

// Utilities
export { logger, colors } from './utils/logger.js';
export { execCommand, execSimple } from './utils/exec.js';
export { openInEditor } from './utils/editor.js';
export { validateTitleLength, validatePRContent } from './utils/validation.js';
