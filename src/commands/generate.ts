/**
 * Main PR generation command
 */

import ora from 'ora';
import type { ProviderType } from '../providers/types.js';
import type { GenprConfig } from '../config/types.js';
import type { Language } from '../types/pr.js';
import { createProvider, isValidProviderType } from '../providers/index.js';
import {
  isGitRepository,
  getCurrentBranch,
  getDefaultBaseBranch,
  getLocalBranches,
  branchExists,
  hasCommitsBetween,
} from '../git/branch.js';
import { getDetailedDiff, getChangedFiles, getDiffStat } from '../git/diff.js';
import { getCommitLog, getCommitCount } from '../git/log.js';
import { loadTemplate, listTemplates } from '../templates/loader.js';
import { buildInputPrompt } from '../prompts/templates.js';
import { parseJsonResponse } from '../parser/json.js';
import { parseDelimiterResponse } from '../parser/delimiter.js';
import {
  checkGhCli,
  existingPR,
  getPRInfo,
  getPRDiff,
  getPRCommits,
  getPRChangedFiles,
  getPRDiffStat,
} from '../github/pr.js';
import { runInteractiveLoop, promptTemplateSelection, promptBaseBranch } from '../ui/interactive.js';
import { displayAnalysisStart, displayProgress, displayTemplateInfo } from '../ui/display.js';
import { validateTitleLength } from '../utils/validation.js';
import { logger } from '../utils/logger.js';
import { DEFAULT_CONFIG } from '../config/defaults.js';

export interface GenerateOptions {
  template?: string;
  auto?: boolean;
  base?: string;
  branch?: string;
  model?: string;
  lang?: Language;
  titleLang?: Language;
  bodyLang?: Language;
  templateDir?: string;
  draft?: boolean;
  dryRun?: boolean;
  url?: string;
}

/**
 * Main generate command handler
 */
export async function generateCommand(
  provider: string,
  options: GenerateOptions
): Promise<void> {
  // Validate provider
  if (!isValidProviderType(provider)) {
    logger.error(`Unknown provider: ${provider}`);
    console.log('Available providers: claude-code, cursor-cli');
    process.exit(1);
  }

  const providerType = provider as ProviderType;

  // --auto flag sets template to 'auto'
  if (options.auto && !options.template) {
    options.template = 'auto';
  }

  // Check gh CLI
  const ghStatus = await checkGhCli();
  if (!ghStatus.available) {
    logger.error(ghStatus.details);
    process.exit(1);
  }

  // Route: PR URL mode vs local branch mode
  if (options.url) {
    await generateFromPRUrl(providerType, options);
  } else {
    await generateFromLocalBranch(providerType, options);
  }
}

/**
 * Generate PR content from an existing PR URL
 */
async function generateFromPRUrl(
  providerType: ProviderType,
  options: GenerateOptions
): Promise<void> {
  const prRef = options.url!;

  // Get PR info
  displayProgress(1, 4, 'Fetching PR info...');
  const prInfo = await getPRInfo(prRef);
  const { baseBranch, headBranch } = prInfo;
  console.log(`  ${headBranch} -> ${baseBranch}`);

  // Get commit log early (needed for auto-detection)
  displayProgress(2, 4, 'Getting commit log...');
  const commitLog = await getPRCommits(prRef);
  const commitLines = commitLog.split('\n').filter((l) => l.trim()).length;
  console.log(`  ${commitLines} commit(s)`);

  // Select template
  const template = await resolveTemplate(options, headBranch, commitLog);

  // Build config
  const config = buildConfig(options);
  const aiProvider = createProvider(providerType, {
    model: options.model,
    timeout: config.timeout,
  });

  displayAnalysisStart(baseBranch, headBranch, options.model);
  displayTemplateInfo(template.name, template.source);

  displayProgress(3, 4, 'Getting diff stat...');
  const changedFiles = await getPRChangedFiles(prRef);
  const diffStat = await getPRDiffStat(prRef);
  console.log(`  ${changedFiles.length} file(s) changed`);

  displayProgress(4, 4, 'Getting detailed diff...');
  const diff = await getPRDiff(prRef, config.maxDiffSize);
  console.log(`  Diff size: ${diff.length} bytes`);

  // Generate and interact
  await generateAndInteract(
    providerType, aiProvider, template, config, options,
    { baseBranch, headBranch, commitLog, diffStat, diff, changedFiles },
    prInfo.url,
  );
}

/**
 * Generate PR content from local branches
 */
async function generateFromLocalBranch(
  providerType: ProviderType,
  options: GenerateOptions
): Promise<void> {
  // Check git repository
  if (!(await isGitRepository())) {
    logger.error('Error: Not a git repository');
    process.exit(1);
  }

  // Determine branches
  const headBranch = options.branch ?? await getCurrentBranch();
  console.log(`  Current branch: ${headBranch}`);

  let baseBranch: string;
  if (options.base) {
    baseBranch = options.base;
  } else {
    const defaultBase = await getDefaultBaseBranch();
    const branches = await getLocalBranches(headBranch);
    if (branches.length === 1) {
      baseBranch = branches[0];
      logger.success(`Auto-selected base branch: ${baseBranch}`);
    } else if (branches.length > 1) {
      baseBranch = await promptBaseBranch(branches, defaultBase);
    } else {
      baseBranch = defaultBase;
    }
  }

  // Validate base branch exists
  if (!(await branchExists(baseBranch))) {
    logger.error(`Base branch '${baseBranch}' does not exist`);
    process.exit(1);
  }

  // Check for commits between branches
  if (!(await hasCommitsBetween(baseBranch, headBranch))) {
    logger.warning(`No commits between ${baseBranch} and ${headBranch}`);
    process.exit(0);
  }

  // Check for existing PR
  if (!options.dryRun) {
    const existing = await existingPR(headBranch);
    if (existing) {
      logger.warning(`A PR already exists for branch '${headBranch}':`);
      console.log(`  ${existing}`);
      process.exit(0);
    }
  }

  // Get commit log early (needed for auto-detection)
  displayProgress(1, 3, 'Getting commit log...');
  const commitLog = await getCommitLog(baseBranch, headBranch);
  const commitCount = await getCommitCount(baseBranch, headBranch);
  console.log(`  ${commitCount} commit(s)`);

  // Select template
  const template = await resolveTemplate(options, headBranch, commitLog);

  // Build config
  const config = buildConfig(options);
  const aiProvider = createProvider(providerType, {
    model: options.model,
    timeout: config.timeout,
  });

  displayAnalysisStart(baseBranch, headBranch, options.model);
  displayTemplateInfo(template.name, template.source);

  displayProgress(2, 3, 'Getting diff stat...');
  const changedFiles = await getChangedFiles(baseBranch, headBranch);
  const diffStat = await getDiffStat(baseBranch, headBranch);
  console.log(`  ${changedFiles.length} file(s) changed`);

  displayProgress(3, 3, 'Getting detailed diff...');
  const diff = await getDetailedDiff(baseBranch, headBranch, config.maxDiffSize);
  console.log(`  Diff size: ${diff.length} bytes`);

  // Generate and interact
  await generateAndInteract(
    providerType, aiProvider, template, config, options,
    { baseBranch, headBranch, commitLog, diffStat, diff, changedFiles },
    null,
  );
}

/**
 * Infer template name from branch name and commit messages
 */
function inferTemplateName(headBranch: string, commitLog?: string): string {
  const branch = headBranch.toLowerCase();

  // Branch name patterns
  const bugfixPatterns = /^(fix|bugfix|hotfix|patch)\//;
  const featurePatterns = /^(feature|feat)\//;

  if (bugfixPatterns.test(branch)) {
    return 'bugfix';
  }
  if (featurePatterns.test(branch)) {
    return 'feature';
  }

  // Fallback: check commit messages
  if (commitLog) {
    const lines = commitLog.toLowerCase();
    const fixCount = (lines.match(/\bfix\b/g) || []).length;
    const featCount = (lines.match(/\bfeat\b/g) || []).length;
    if (fixCount > featCount) {
      return 'bugfix';
    }
  }

  return 'feature';
}

/**
 * Resolve template from options, auto-detection, or interactive prompt
 */
async function resolveTemplate(options: GenerateOptions, headBranch?: string, commitLog?: string) {
  let templateName = options.template;

  if (!templateName) {
    const templates = listTemplates({ templateDir: options.templateDir });
    if (templates.length === 0) {
      logger.error('No templates found');
      process.exit(1);
    }
    templateName = await promptTemplateSelection(templates.map((t) => t.name));
  }

  // auto selected from CLI --auto or interactive prompt
  if (templateName === 'auto' && headBranch) {
    templateName = inferTemplateName(headBranch, commitLog);
    logger.success(`Auto-detected template: ${templateName}`);
  }

  const template = loadTemplate(templateName, { templateDir: options.templateDir });
  if (!template) {
    logger.error(`Template '${templateName}' not found`);
    process.exit(1);
  }
  return template;
}

/**
 * Build config from options
 */
function buildConfig(options: GenerateOptions): GenprConfig {
  return {
    ...DEFAULT_CONFIG,
    titleLang: options.lang ?? options.titleLang ?? DEFAULT_CONFIG.titleLang,
    bodyLang: options.lang ?? options.bodyLang ?? DEFAULT_CONFIG.bodyLang,
  };
}

/**
 * Common flow: build prompt, call AI, run interactive loop
 */
async function generateAndInteract(
  providerType: ProviderType,
  aiProvider: ReturnType<typeof createProvider>,
  template: NonNullable<ReturnType<typeof loadTemplate>>,
  config: GenprConfig,
  options: GenerateOptions,
  gitData: {
    baseBranch: string;
    headBranch: string;
    commitLog: string;
    diffStat: string;
    diff: string;
    changedFiles: string[];
  },
  existingPrUrl: string | null,
): Promise<void> {
  const { baseBranch, headBranch } = gitData;

  // Build AI input
  const input = buildInputPrompt({
    titleLang: config.titleLang,
    bodyLang: config.bodyLang,
    templateContent: template.content,
    commitLog: gitData.commitLog,
    diffStat: gitData.diffStat,
    diff: gitData.diff,
    baseBranch,
    headBranch,
    changedFiles: gitData.changedFiles,
  });

  const inputSize = input.length;
  logger.success(`Total input size: ${inputSize} bytes`);

  let finalInput = input;
  if (inputSize > config.maxInputSize) {
    logger.warning('Warning: Input size exceeds limit. Truncating...');
    finalInput = input.substring(0, config.maxInputSize) +
      `\n\n[INPUT TRUNCATED - Original size: ${inputSize} bytes]`;
  }

  const spinner = ora('Calling AI agent...').start();

  try {
    const response = await aiProvider.generate(finalInput);
    spinner.succeed('AI response received');

    const result = providerType === 'claude-code'
      ? parseJsonResponse(response.raw)
      : parseDelimiterResponse(response.raw);

    validateTitleLength(result.content.title);

    await runInteractiveLoop(
      aiProvider,
      result.content,
      response.raw,
      {
        baseBranch,
        headBranch,
        draft: options.draft ?? false,
        dryRun: options.dryRun ?? false,
        existingPrUrl,
      },
      config
    );
  } catch (error) {
    spinner.fail('Failed to generate PR content');
    logger.error(String(error));
    console.log('');
    console.log('If this issue persists, please report it at:');
    console.log('  https://github.com/Seungwoo321/genai-pr/issues');
    console.log('');
    process.exit(1);
  }
}
