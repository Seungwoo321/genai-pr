/**
 * PR display utilities
 */

import chalk from 'chalk';
import type { PRContent } from '../types/pr.js';

/**
 * Display PR content preview
 */
export function displayPRPreview(content: PRContent, baseBranch: string, headBranch: string): void {
  console.log('');
  console.log(chalk.green('=== PR Preview ==='));
  console.log('');
  console.log(chalk.cyan(`  ${baseBranch} <- ${headBranch}`));
  console.log('');
  console.log(chalk.bold(`  Title: ${content.title}`));
  console.log('');
  console.log(chalk.dim('  --- Body ---'));

  const bodyLines = content.body.split('\n');
  for (const line of bodyLines) {
    console.log(`  ${line}`);
  }

  console.log(chalk.dim('  --- End ---'));
  console.log('');
}

/**
 * Display analysis start message
 */
export function displayAnalysisStart(
  baseBranch: string,
  headBranch: string,
  model?: string
): void {
  console.log(
    chalk.green(`Analyzing changes: ${chalk.cyan(headBranch)} -> ${chalk.cyan(baseBranch)}`)
  );
  if (model) {
    console.log(chalk.cyan(`Using model: ${model}`));
  }
}

/**
 * Display progress step
 */
export function displayProgress(step: number, total: number, message: string): void {
  console.log(chalk.cyan(`[${step}/${total}] ${message}`));
}

/**
 * Display template info
 */
export function displayTemplateInfo(name: string, source: string): void {
  console.log(chalk.dim(`Template: ${name} (${source})`));
}
